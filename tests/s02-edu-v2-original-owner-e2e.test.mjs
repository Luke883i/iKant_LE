import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {createC129PublicEduV2Session} from '../host/edu-c129-manual-entry.mjs';
import {issueC72V2TermsOffer,acceptC72V2Terms,presentC72V2Introduction,selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
import {emitC125Shell} from '../host/c125-exclusive-shell.mjs';
const root=path.resolve(new URL('../',import.meta.url).pathname);
const SHA=x=>crypto.createHash('sha256').update(x).digest('hex');
const git=()=>execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
function select(mode='EDU'){
 const offer=issueC72V2TermsOffer({sourceHead:git(),termsDigest:SHA(fs.readFileSync(path.join(root,'TERMS.md')))});
 const accepted=acceptC72V2Terms({offer,humanMessage:'I ACCEPT',termsPresented:true});
 return selectC72V2Mode({accepted,orientation:presentC72V2Introduction(accepted),humanMessage:mode});
}
const language=async task=>({text:'La risposta EDU e una bozza HOST verificata sul piano C70, senza ACTIVE.',
 input_sha256:task.plan.input_sha256,ack_plan_sha256:task.guidance.plan_sha256,
 ack_c124_channel_sha256:task.channels.channel_sha256});
const witness={accepted:true,scope:'HOST_WITNESSED_ONLY'};
test('S02 EDU/v2: original C107 C70 C100 C87 and independent C125, 30 successes distinct nonces',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'s02-edu-v2-'));
 const sent=[];let session;
 try{
  session=await createC129PublicEduV2Session({selection:select(),sourceRoot:root,privateParent:temp,
   languagePort:language,send:async s=>sent.push(s),afterAcceptWitness:witness});
  assert.equal(session.ok,true,JSON.stringify(session));
  for(let i=0;i<30;i++){
   const r=await session.publishTurn({humanInput:`Spiega il metodo di verifica per il caso ${i}.`,
    nonce:`edu-v2-nonce-${String(i).padStart(4,'0')}`,priorMessages:[],resetContext:true});
   assert.equal(r.ok,true,JSON.stringify(r));
   assert.equal(r.status,'S02_EDU_V2_HOST_BOUND_LOCAL_READBACK');
   assert.equal(r.c87_after,i+1);
   assert.equal(r.c87_after,r.c87_before+1);
   assert.equal(r.original_turn.public_mode,'EDU');
   assert.equal(r.original_turn.original_c87_writer_executed,true);
   assert.equal(r.c125.send_callback_resolved,true);
   assert.equal(r.active,false);
  }
  assert.equal(sent.length,30);
  for(const s of sent){assert.ok(s.includes('MODE  | EDU')||s.includes('MODE  | EDU'.replace('  ', ' ')),s);assert.ok(s.includes('<<<VOICE_UTF8_START>>>'));}
  const replay=await session.publishTurn({humanInput:'Spiega il metodo di verifica per il caso 0.',
   nonce:'edu-v2-nonce-0000',priorMessages:[],resetContext:true});
  assert.equal(replay.ok,false);assert.equal(session.status().port.resolved,30);
  const hostile=new Proxy({}, {get(){throw Error('PROXY_EXECUTED')}});
  const r=await session.publishTurn(hostile);assert.equal(r.ok,false);
  assert.equal(sent.length,30);
 }finally{session?.close();fs.rmSync(temp,{recursive:true,force:true})}
});
test('S02 rejects CANONICAL selection, stale/forged v2 and C125 spoof',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'s02-edu-v2-deny-'));
 try{
  for(const selection of [select('CANONICAL'),{...select(),selected_mode:'EXPERIMENTAL'},
    {...select(),source_head:'a'.repeat(40)}]){
   const v=await createC129PublicEduV2Session({selection,sourceRoot:root,privateParent:temp,
    languagePort:language,send:async()=>{throw Error('SEND_SHOULD_NOT_FIRE')},afterAcceptWitness:witness});
   assert.equal(v.ok,false,JSON.stringify(v));
  }
  const spoof=emitC125Shell({afterAccept:true,kind:'OWNER_VOICE',mode:'EDU',
   trace:'a'.repeat(64),continuity:'C87_INDEPENDENT_REOPEN',edge:'NATIVE_CHATGPT_PER_TURN_DISPATCH',
   next:'QUALIFY_NATIVE_HOOK',nonce:'edu-v2-nonce-0001',input_sha256:'b'.repeat(64),
   ownerReceipt:{schema:'ikant-c135-edu-v2-owner-evidence/v1'},
   independentReadback:{status:'C107_LEDGER_REOPENED'}});
  assert.equal(spoof.status,'REJECTED');
 }finally{fs.rmSync(temp,{recursive:true,force:true})}
});
test('S02 refuses properly formed but wrong TERMS digest, and nested hostile proxy before callback',async()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'s02-edu-v2-attack-'));
 let calls=0,sends=0;let session;
 try{
  const offer=issueC72V2TermsOffer({sourceHead:git(),termsDigest:'f'.repeat(64)});
  const accept=acceptC72V2Terms({offer,humanMessage:'I ACCEPT',termsPresented:true});
  const wrong=selectC72V2Mode({accepted:accept,orientation:presentC72V2Introduction(accept),humanMessage:'EDU'});
  const blocked=await createC129PublicEduV2Session({selection:wrong,sourceRoot:root,privateParent:temp,
   languagePort:async t=>{calls++;return language(t)},send:async()=>{sends++},afterAcceptWitness:witness});
  assert.equal(blocked.ok,false);assert.equal(calls,0);
  session=await createC129PublicEduV2Session({selection:select(),sourceRoot:root,privateParent:temp,
   languagePort:async t=>{calls++;return language(t)},send:async()=>{sends++},afterAcceptWitness:witness});
  assert.equal(session.ok,true);
  let traps=0;
  const nested=new Proxy([], {get(){traps++;throw Error('NESTED_PROXY_EXECUTED')}});
  const result=await session.publishTurn({humanInput:'Descrivi un metodo locale.',nonce:'edu-v2-malicious-0001',priorMessages:nested,resetContext:false});
  assert.equal(result.ok,false);assert.equal(traps,0);assert.equal(calls,0);assert.equal(sends,0);
 }finally{session?.close();fs.rmSync(temp,{recursive:true,force:true})}
});
