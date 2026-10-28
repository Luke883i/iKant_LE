import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {spawn} from 'node:child_process';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {materializeRepositoryPlan} from '../scripts/project-repo-loader.mjs';
import {issueC72V2LinkedTermsOffer,acceptC72V2LinkedTerms,presentC72V2Introduction,selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
import {openContinuousOneShell} from '../host/project-oneshell-continuous.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=s=>createHash('sha256').update(s).digest('hex');
const git=(type,b)=>createHash('sha1').update(Buffer.from(type+' '+b.length+'\0')).update(b).digest('hex');
function fixture(){
 const paths=[...JSON.parse(fs.readFileSync(path.join(root,'contracts/project-session-source.json'))).paths,'contracts/project-session-source.json'];
 const entries=new Map(paths.map(p=>{const b=fs.readFileSync(path.join(root,p));return[p,{path:p,type:'blob',mode:'100644',sha:git('blob',b)}]})),dirs=new Set();
 for(const p of paths){let d=path.posix.dirname(p);while(d!=='.'){dirs.add(d);d=path.posix.dirname(d)}}
 function tree(dir){const rows=[...entries.values()].filter(e=>path.posix.dirname(e.path)===(dir||'.')).sort((a,b)=>Buffer.compare(Buffer.from(path.posix.basename(a.path)+(a.type==='tree'?'/':'')),Buffer.from(path.posix.basename(b.path)+(b.type==='tree'?'/':''))));return git('tree',Buffer.concat(rows.map(e=>Buffer.concat([Buffer.from((e.type==='tree'?'40000':e.mode)+' '+path.posix.basename(e.path)+'\0'),Buffer.from(e.sha,'hex')]))));}
 for(const d of [...dirs].sort((a,b)=>b.split('/').length-a.split('/').length))entries.set(d,{path:d,type:'tree',mode:'040000',sha:tree(d)});
 const head='a'.repeat(40),t=tree('');return {head,tree:t,plan:{source_head:head,live_head:head,source_tree:t,truncated:false,tree:[...entries.values()],files:paths.map(p=>({path:p,encoding:'base64',content:fs.readFileSync(path.join(root,p)).toString('base64')}))}};
}
function setup(){
 const f=fixture(),parent=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-continuous-'));fs.chmodSync(parent,0o700);
 const sourceRoot=path.join(parent,'source');materializeRepositoryPlan(f.plan,{head:f.head,tree:f.tree,destination:sourceRoot});
 const terms=fs.readFileSync(path.join(sourceRoot,'TERMS.md'));
 const offer=issueC72V2LinkedTermsOffer({sourceHead:f.head,termsDigest:sha(terms)});
 const accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true});
 const introduction=presentC72V2Introduction(accepted);
 const selection=selectC72V2Mode({accepted,orientation:introduction,humanMessage:'EDU'});
 let tasks=0,guides=[];
 const languagePort=async(task,context)=>{tasks++;guides.push(context);
  if(task.schema==='ikant-edu-v2-open-language-task/v1')return {text:'Una decisione utile resta verificabile e contestabile.',input_sha256:task.plan.input_sha256,ack_plan_sha256:task.plan.plan_sha256};
  return {text:'Il valore della risposta dipende dalle prove osservate.',...task.required_ack};};
 const q={sourceHead:f.head,sourceTree:f.tree,sourceRoot,privateRoot:parent,
  accepted,introduction,selection,readMain:async()=>f.head,languagePort};
 return {q,parent,sourceRoot,tasks:()=>tasks,guides};
}
test('two distinct original C135/C87/C125 turns preserve one six-slot rail and human-value guidance',async()=>{
 const x=setup();let owner;
 try{
  owner=await openContinuousOneShell(x.q);
  assert.equal(owner.ok,true,JSON.stringify(owner));
  assert.equal(owner.frame.slots.A,'NO_VOICE');
  const first=await owner.publishHumanTurn({humanInput:'Descrivi una scelta tracciabile.',nonce:'continuous-nonce-00001',humanMessageObserved:true});
  assert.equal(first.ok,true,JSON.stringify(first));assert.equal(first.original_c87_count,1);
  const second=await owner.publishHumanTurn({humanInput:'Che valore umano aggiunge?',nonce:'continuous-nonce-00002',humanMessageObserved:true});
  assert.equal(second.ok,true,JSON.stringify(second));assert.equal(second.original_c87_count,2);
  assert.equal(first.anchor,second.anchor);assert.equal(owner.reopen().count,2);
  assert.equal(x.tasks(),2);assert.equal(x.guides.length,2);
  assert.equal(x.guides[0].schema,'ikant-host-humanist-guidance/v1');
  assert.equal(first.native_ui_attested,false);
  assert.equal(first.frame.slot_order.join('|'),'ESITO|A|B|PROVA|EDGE|NEXT');
  assert.equal(await owner.publishHumanTurn({humanInput:'ripeti',nonce:'continuous-nonce-00002',humanMessageObserved:true}).then(z=>z.ok),false);
  assert.equal(owner.reopen().count,2);
 }finally{owner?.close();fs.rmSync(x.parent,{recursive:true,force:true});}
});
test('cold C87 recovery needs explicit loss witness; replay and tamper are rejected',async()=>{
 const x=setup();let one,two;
 try{
  one=await openContinuousOneShell(x.q);assert.equal(one.ok,true);
  assert.equal((await one.publishHumanTurn({humanInput:'Prima domanda.',nonce:'continuous-cold-00001',humanMessageObserved:true})).ok,true);
  one.close();one=null;
  const without=await openContinuousOneShell(x.q);assert.equal(without.ok,false);assert.equal(without.voice,'NO_VOICE');
  two=await openContinuousOneShell({...x.q,recoveryWitness:{previousWorkerGone:true}});
  assert.equal(two.ok,true,JSON.stringify(two));
  const recovered=await two.publishHumanTurn({humanInput:'Seconda domanda.',nonce:'continuous-cold-00002',humanMessageObserved:true});
  assert.equal(recovered.ok,true,JSON.stringify(recovered));assert.equal(recovered.phase,'RECOVERED_TURN');
  assert.equal(two.reopen().count,2);
  two.close();two=null;
  const journal=path.join(x.parent,'.oneshell-continuity','turn-000002.json');
  const body=JSON.parse(fs.readFileSync(journal));body.original_voice_utf8+=' altered';fs.writeFileSync(journal,JSON.stringify(body)+'\n');
  const forged=await openContinuousOneShell({...x.q,recoveryWitness:{previousWorkerGone:true}});
  assert.equal(forged.ok,false);assert.equal(forged.voice,'NO_VOICE');
 }finally{one?.close();two?.close();fs.rmSync(x.parent,{recursive:true,force:true});}
});
test('HEAD drift before start fails without C135 execution',async()=>{
 const x=setup();try{
  const r=await openContinuousOneShell({...x.q,readMain:async()=> 'b'.repeat(40)});
  assert.equal(r.ok,false);assert.equal(r.voice,'NO_VOICE');assert.equal(x.tasks(),0);
 }finally{fs.rmSync(x.parent,{recursive:true,force:true});}
});

test('physical Node stdio cohost emits one OneShell for each of two real owner turns',async()=>{
 const x=setup();
 try{
  const cfg={schema:'ikant-host-oneshell-start/v1',...Object.fromEntries(Object.entries(x.q).filter(([k])=>!['readMain','languagePort'].includes(k))),liveHead:x.q.sourceHead};
  const configPath=path.join(x.parent,'host-config.json');fs.writeFileSync(configPath,JSON.stringify(cfg),{mode:0o600});
  const p=spawn(process.execPath,[path.join(root,'scripts/project-oneshell-continuous-cli.mjs'),configPath],{stdio:['pipe','pipe','pipe']});
  const events=[];let raw='',stderr='';p.stderr.on('data',b=>stderr+=b.toString());
  p.stdout.on('data',b=>{raw+=b.toString();let n;while((n=raw.indexOf('\n'))>=0){const line=raw.slice(0,n);raw=raw.slice(n+1);
   let e;try{e=JSON.parse(line);}catch{return;}events.push(e);
   if(e.phase==='EDU_READY'){p.stdin.write(JSON.stringify({schema:'ikant-host-oneshell-human-turn/v1',liveHead:x.q.sourceHead,humanInput:'Qual e il valore umano?',nonce:'physical-turn-00001',humanMessageObserved:true})+'\n');}
   else if(e.schema==='ikant-edu-host-language-task/v1'){const t=e.task;const a=t.schema==='ikant-edu-v2-open-language-task/v1'?
    {text:'Il valore e umano, la prova e contestabile.',input_sha256:t.plan.input_sha256,ack_plan_sha256:t.plan.plan_sha256}:
    {text:'Il valore dipende dall uso umano e dalle prove.',...t.required_ack};
    p.stdin.write(JSON.stringify({schema:'ikant-edu-host-language-reply/v1',task_id:e.task_id,...a})+'\n');}
   else if(e.schema==='ikant-host-oneshell-result/v1'&&e.phase==='OWNER_TURN') {
    if(e.original_c87_count===1)p.stdin.write(JSON.stringify({schema:'ikant-host-oneshell-human-turn/v1',liveHead:x.q.sourceHead,humanInput:'E la seconda domanda?',nonce:'physical-turn-00002',humanMessageObserved:true})+'\n');
    else if(e.original_c87_count===2)p.stdin.end();
   }
  }});
  const code=await new Promise((resolve,reject)=>{p.on('exit',resolve);p.on('error',reject);});
  assert.equal(code,0,stderr+'\n'+JSON.stringify(events.filter(x=>x.ok===false)));
  assert.equal(events.filter(x=>x.schema==='ikant-edu-host-language-task/v1').length,2);
  assert.equal(events.filter(x=>x.schema==='ikant-host-oneshell-result/v1'&&x.ok===true).length,3);
  assert.equal(events.at(-1).original_c87_count,2);
  assert.equal(events.filter(x=>x.humanist_context?.schema==='ikant-host-humanist-guidance/v1').length,2);
 }finally{fs.rmSync(x.parent,{recursive:true,force:true});}
});
