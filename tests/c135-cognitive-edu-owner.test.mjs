import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createC129ManualEduSession} from '../host/edu-c129-manual-entry.mjs';
import {buildC127SourceCache} from '../host/edu-c127-source-transport.mjs';
import {PIN} from '../host/c107-carrier-consumer.mjs';
import {C124_OVERLAY_GIT_BLOBS} from '../host/c124-source-overlay.mjs';
import {qualifyC134Source} from '../scripts/c134-source-epoch.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const H=x=>crypto.createHash('sha256').update(x).digest('hex');
const human='Descrivi la mia natura ontologica, sono un uomo.';
const answer='La natura umana comprende corpo e relazioni, diverse ipotesi filosofiche e prove discutibili.';
const afterAcceptWitness={accepted:true,scope:'HOST_WITNESSED_ONLY'};
function kit(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c135-'));
 const carrierBytes=fs.readFileSync(path.join(root,PIN.name));
 const c124OverlayBytes=Object.fromEntries(Object.keys(C124_OVERLAY_GIT_BLOBS).map(p=>[p,fs.readFileSync(path.join(root,p))]));
 const built=buildC127SourceCache({carrierBytes,c124OverlayBytes});assert.equal(built.ok,true);
 const file=path.join(dir,'cache.json');fs.writeFileSync(file,built.bytes,{flag:'wx',mode:0o600});
 return {dir,file,cleanup(){fs.rmSync(dir,{recursive:true,force:true})}};
}
async function selection(x,head){
 const name=fs.readdirSync(x.dir).find(n=>n.startsWith('ikant-c107-source-'));assert.ok(name);
 const install=path.join(x.dir,name);
 const c72=await import(pathToFileURL(path.join(install,'host/c72-unified-mode-admission.mjs')).href);
 const offer=c72.issueC72TermsOffer({sourceHead:head,termsDigest:H(fs.readFileSync(path.join(install,'TERMS.md')))});
 const accepted=c72.acceptC72Terms({offer,humanMessage:'I ACCEPT',termsPresented:true});
 return {install,selection:c72.selectC72Mode({accepted,orientation:c72.presentC72Introduction(accepted),humanMessage:'EXPERIMENTAL'})};
}
function frame(sel,nonce='c135-human-verified-001',input=human){
 return {humanInput:input,nonce,selection:sel,priorMessages:[],resetContext:true,
  authorization:{human_mode_selected:true,opt_in_confirmed:true,separate_cohost_draft_authorized:true,provenance:'LOCAL_TEST_FIXTURE'}};
}
const draft=text=>t=>({text,input_sha256:t.plan.input_sha256,
 ack_plan_sha256:t.guidance.plan_sha256,ack_c124_channel_sha256:t.c124_channel_sha256});
async function session(x,sent,languagePort=draft(answer),epoch='C134_COMPOSITE'){
 const s=await createC129ManualEduSession({manualCachePath:x.file,privateParent:x.dir,
  cognitiveEpoch:epoch,languagePort,send:m=>sent.push(m),afterAcceptWitness});
 assert.equal(s.ok,true,JSON.stringify(s));return s;
}
test('one C129 public manual entry stages C134; true C107/C87 + independent readback + one C125 send',async()=>{
 const x=kit(),sent=[];let sess,calls=0;
 try{
  const q=qualifyC134Source();assert.equal(q.ok,true);
  sess=await session(x,sent,t=>{
   calls++;assert.equal(t.c124_channels.channels.length,12);
   assert.equal(t.c133_shadow.scope,'HUMAN');assert.equal(t.c133_shadow.original_c114_bypassed,false);
   return draft(answer)(t);
  });
  assert.equal(sess.source_head,q.composite_epoch_id);
  assert.equal(sess.source_kind,'EXPERIMENTAL_COMPOSITE_NOT_GIT_COMMIT');
  assert.equal(sess.single_inode_readback_verified,true);
  assert.equal(sess.active,false);assert.equal(sess.machine_transport_attempts,0);
  const choice=await selection(x,sess.source_head),f=frame(choice.selection);
  const result=await sess.publishTurn({frame:f});
  assert.equal(result.ok,true,JSON.stringify(result));
  assert.equal(result.origin,'HOST_BOUND');assert.equal(result.voice_sha256,H(answer));
  assert.equal(calls,1);assert.equal(sent.length,1);
  assert.ok(sent[0].includes('<<<VOICE_UTF8_START>>>\n'+answer+'\n<<<VOICE_UTF8_END>>>'));
  const ledger=path.join(choice.install,'.ikant-host/c107-observations.jsonl');
  assert.equal(fs.readFileSync(ledger,'utf8').trim().split('\n').length,1);
  assert.equal((await sess.publishTurn({frame:f})).ok,false);assert.equal(sent.length,1);
  sess.close();assert.equal((await sess.publishTurn({frame:{...f,nonce:'c135-afterclose-001'}})).ok,false);
 }finally{sess?.close();x.cleanup()}
});
test('unsupported positive claims are denied BEFORE C87, but no fake voice is sent',async()=>{
 const x=kit(),sent=[];let sess;
 try{
  sess=await session(x,sent,draft('Io sono cosciente e ho accesso nativo.'));
  const choice=await selection(x,sess.source_head);
  const result=await sess.publishTurn({frame:frame(choice.selection,'c135-falseclaim-001')});
  assert.equal(result.ok,true);assert.equal(result.origin,'NO_VOICE');assert.equal(sent.length,1);
  assert.equal(fs.existsSync(path.join(choice.install,'.ikant-host/c107-observations.jsonl')),false);
 }finally{sess?.close();x.cleanup()}
});
test('ack tampering cannot produce C87 voice or invoke the same event twice',async()=>{
 const x=kit(),sent=[];let sess;
 try{
  sess=await session(x,sent,t=>({...draft(answer)(t),ack_plan_sha256:'f'.repeat(64)}));
  const choice=await selection(x,sess.source_head),f=frame(choice.selection,'c135-ack-tamper-001');
  const result=await sess.publishTurn({frame:f});
  assert.equal(result.ok,true);assert.equal(result.origin,'NO_VOICE');assert.equal(sent.length,1);
  assert.equal((await sess.publishTurn({frame:f})).ok,false);
  assert.equal(fs.existsSync(path.join(choice.install,'.ikant-host/c107-observations.jsonl')),false);
 }finally{sess?.close();x.cleanup()}
});
test('concurrent turn denied, dispose during language prevents C87 write and C125 send',async()=>{
 const x=kit(),sent=[];let sess,release;
 try{
  sess=await session(x,sent,async t=>{await new Promise(resolve=>{release=resolve});return draft(answer)(t)});
  const choice=await selection(x,sess.source_head);
  const first=sess.publishTurn({frame:frame(choice.selection,'c135-inflight-one-001')});
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal((await sess.publishTurn({frame:frame(choice.selection,'c135-inflight-two-001')})).ok,false);
  sess.close();release();assert.equal((await first).ok,false);assert.equal(sent.length,0);
 }finally{sess?.close();x.cleanup()}
});
test('invalid epoch, symlink cache and stale source never fall through to legacy carrier',async()=>{
 const x=kit(),sent=[];try{
  const args={manualCachePath:x.file,privateParent:x.dir,cognitiveEpoch:'NOT_VALID',
   languagePort:draft(answer),send:m=>sent.push(m),afterAcceptWitness};
  const invalid=await createC129ManualEduSession(args);
  assert.equal(invalid.ok,false);assert.equal(invalid.first_edge,'C135_EPOCH_SELECTION_INVALID');
  const symlink=path.join(x.dir,'sym');fs.symlinkSync(x.file,symlink);
  const linked=await createC129ManualEduSession({...args,cognitiveEpoch:'C134_COMPOSITE',manualCachePath:symlink});
  assert.equal(linked.ok,false);assert.equal(sent.length,0);
 }finally{x.cleanup()}
});
