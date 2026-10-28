import test from 'node:test';import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
import {materializeRepositoryPlan} from '../scripts/project-repo-loader.mjs';
import {createC135EduV2Session} from '../host/c135-edu-v2-owner.mjs';
import {reopenProjectSession} from '../host/project-session-capsule.mjs';
import {issueC72V2LinkedTermsOffer,acceptC72V2LinkedTerms,presentC72V2Introduction,selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const git=(type,b)=>createHash('sha1').update(Buffer.from(`${type} ${b.length}\0`)).update(b).digest('hex');
function sourceFixture(){
 const paths=[...JSON.parse(fs.readFileSync(path.join(root,'contracts/project-session-source.json'))).paths,'contracts/project-session-source.json'];
 const entries=new Map(paths.map(p=>{const b=fs.readFileSync(path.join(root,p));return[p,{path:p,type:'blob',mode:'100644',sha:git('blob',b)}]})),dirs=new Set();
 for(const p of paths){let d=path.posix.dirname(p);while(d!=='.'){dirs.add(d);d=path.posix.dirname(d)}}
 function tree(dir){const rows=[...entries.values()].filter(e=>path.posix.dirname(e.path)===(dir||'.')).sort((a,b)=>Buffer.compare(Buffer.from(path.posix.basename(a.path)+(a.type==='tree'?'/':'')),Buffer.from(path.posix.basename(b.path)+(b.type==='tree'?'/':''))));return git('tree',Buffer.concat(rows.flatMap(e=>[Buffer.from((e.type==='tree'?'40000':e.mode)+' '+path.posix.basename(e.path)+'\0'),Buffer.from(e.sha,'hex')])))}
 for(const d of [...dirs].sort((a,b)=>b.split('/').length-a.split('/').length))entries.set(d,{path:d,type:'tree',mode:'040000',sha:tree(d)});
 const head='a'.repeat(40),t=tree('');return{expected:{head,tree:t},plan:{source_head:head,live_head:head,source_tree:t,truncated:false,tree:[...entries.values()],files:paths.map(p=>({path:p,encoding:'base64',content:fs.readFileSync(path.join(root,p)).toString('base64')}))}};
}
test('fresh API-byte execution closure → original C72 → real source check → original ledger/shell → evidence',()=>{
 const {plan,expected}=sourceFixture(),parent=fs.mkdtempSync(path.join(os.tmpdir(),'project-e2e-')),destination=path.join(parent,'source');
 try{materializeRepositoryPlan(plan,{...expected,destination});
 const offer=issueC72V2LinkedTermsOffer({sourceHead:expected.head,termsDigest:'b'.repeat(64)}),accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true}),orientation=presentC72V2Introduction(accepted),selection=selectC72V2Mode({accepted,orientation,humanMessage:'EDU'}),sp=path.join(parent,'selection.json');fs.writeFileSync(sp,JSON.stringify(selection));
 const command=path.join(destination,'scripts/project-session.mjs');const run=()=>spawnSync(process.execPath,[command,expected.head,expected.tree,sp],{encoding:'utf8'});
 const first=run();assert.equal(first.status,0,first.stderr+first.stdout);const r=JSON.parse(first.stdout);assert.equal(r.capsule.voice,'NO_VOICE');assert.equal(r.ledger_unchanged,true);assert.equal(r.evidence.readback_verified,true);assert.equal(r.capsule.axes.host.native_ui.status,'UNKNOWN');
 // Verify before importing a tampered module: its side effect must never execute.
 const marker=path.join(parent,'must-not-exist');fs.appendFileSync(path.join(destination,'host/project-session-capsule.mjs'),`\nfs.writeFileSync(${JSON.stringify(marker)},'unsafe');\n`);
 const bad=run();assert.equal(bad.status,1);assert.match(bad.stdout,/LOCAL_SOURCE_CHANGED/);assert.equal(fs.existsSync(marker),false);
 }finally{fs.rmSync(parent,{recursive:true,force:true});}
});
test('original C135 accepts API-tree source without Git and its actual C87 reopens in the capsule',async()=>{
 const {plan,expected}=sourceFixture(),parent=fs.mkdtempSync(path.join(os.tmpdir(),'project-edu-e2e-')),destination=path.join(parent,'source');let session;
 try{materializeRepositoryPlan(plan,{...expected,destination});
 const digest=createHash('sha256').update(fs.readFileSync(path.join(destination,'TERMS.md'))).digest('hex');
 const offer=issueC72V2LinkedTermsOffer({sourceHead:expected.head,termsDigest:digest}),accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true}),orientation=presentC72V2Introduction(accepted),selection=selectC72V2Mode({accepted,orientation,humanMessage:'EDU'}),sent=[];
 session=await createC135EduV2Session({selection,sourceRoot:destination,sourceBinding:expected,privateParent:parent,
  afterAcceptWitness:{accepted:true,scope:'HOST_WITNESSED_ONLY'},send:async s=>sent.push(s),
  languagePort:async task=>({text:'La risposta EDU e una bozza HOST verificata sul piano C70, senza ACTIVE.',input_sha256:task.plan.input_sha256,ack_plan_sha256:task.guidance.plan_sha256,ack_c124_channel_sha256:task.channels.channel_sha256})});
 assert.equal(session.ok,true,JSON.stringify(session));
 const turn=await session.publishTurn({humanInput:'Spiega il metodo di verifica per il caso locale.',nonce:'project-api-owner-nonce-0001',priorMessages:[],resetContext:true});
 assert.equal(turn.ok,true,JSON.stringify(turn));assert.equal(turn.c87_after,turn.c87_before+1);assert.equal(sent.length,1);
 const readback=session.readSessionState();assert.equal(readback.original_c87_readback.count,1);
 const dashboard=reopenProjectSession({source:expected,admission:selection,eduLedgerFile:readback.ledger_file,outputRoot:path.join(parent,'dashboard')});
 assert.equal(dashboard.capsule.axes.edu.original_c87_readback.count,1);assert.equal(dashboard.capsule.axes.admission.mode,'EDU');assert.equal(dashboard.capsule.voice,'NO_VOICE');assert.equal(session.readSessionState().original_c87_readback.count,1);
 }finally{session?.close();fs.rmSync(parent,{recursive:true,force:true});}
});

test('OneShell EDU owner starts and publishes one genuine C87/C125/S03 turn after API source verification',async()=>{
 const {plan,expected}=sourceFixture(),parent=fs.mkdtempSync(path.join(os.tmpdir(),'oneshell-edu-start-')),destination=path.join(parent,'source');
 let session;
 try{
  materializeRepositoryPlan(plan,{...expected,destination});
  const digest=createHash('sha256').update(fs.readFileSync(path.join(destination,'TERMS.md'))).digest('hex');
  const o=issueC72V2LinkedTermsOffer({sourceHead:expected.head,termsDigest:digest});
  const a=acceptC72V2LinkedTerms({offer:o,humanMessage:'I ACCEPT',termsLinkPresented:true});
  const selection=selectC72V2Mode({accepted:a,orientation:presentC72V2Introduction(a),humanMessage:'EDU'});
  const {startOneShellEdu,renderOneShell}=await import('../host/project-oneshell-edu.mjs');
  const {oneShellMaterialized}=await import('../host/project-oneshell-phases.mjs');
  const sourceFrame=oneShellMaterialized({selection,sourceRoot:destination,head:expected.head,tree:expected.tree});
  assert.equal(sourceFrame.slots.NEXT,'START_C135_EDU');assert.equal(sourceFrame.slots.A,'NO_VOICE');
  session=await startOneShellEdu({selection,sourceRoot:destination,sourceBinding:expected,privateParent:parent,
   afterAcceptWitness:{accepted:true,scope:'HOST_WITNESSED_ONLY'},
   languagePort:async task=>({text:'Risposta originale EDU verificata con un readback locale.',
     input_sha256:task.plan.input_sha256,ack_plan_sha256:task.guidance.plan_sha256,
     ack_c124_channel_sha256:task.channels.channel_sha256})});
  assert.equal(session.ok,true,JSON.stringify(session));
  assert.equal(session.frame.slots.A,'NO_VOICE');
  assert.equal(session.frame.slots.NEXT,'AWAIT_HUMAN_INPUT');
  const s=await session.publishTurn({humanInput:'Spiega come verificare una fonte.',nonce:'oneshell-original-test-nonce-0001',
     priorMessages:[],resetContext:true});
  assert.equal(s.voice_origin,'HOST_BOUND_LOCAL');
  assert.equal(s.slots.A,'Risposta originale EDU verificata con un readback locale.');
  assert.equal(s.slot_order.length,6);
  assert(renderOneShell(s).includes(s.slots.A));
  assert.equal(session.readSessionState().original_c87_readback.count,1);
  const ev=session.getLastEvidence();
  assert.equal(ev.original_c87_readback.count,1);assert.equal(ev.native_delivery_attested,false);
  assert.equal(ev.original_c125_sha256,createHash('sha256').update(ev.original_c125_utf8).digest('hex'));
  const {bindManagedOneShellEdu}=await import('../host/project-oneshell-continuity.mjs');
  let workerStopped=false; // Fixture only, not native worker proof
  const managed=bindManagedOneShellEdu({selection,sourceHead:expected.head,
   originalSession:session,readMain:async()=>expected.head,
   workerSupervisor:{dedicated:true,terminate:async()=>{workerStopped=true;},
    readback:async()=>({dedicated:true,verified:true,terminated:workerStopped})}});
  const exitFile=path.join(parent,'human-exit.json');
  const warning=await managed.routeHumanTurn({frame:{humanInput:'EXIT IKANT'},
   humanMessageObserved:true});
  assert.equal(warning.kind,'REQUEST_EXIT_CONFIRMATION');
  assert.equal(session.status().closed,false);
  const exit=await managed.routeHumanTurn({frame:{humanInput:'CONFERMO EXIT IKANT'},
   humanMessageObserved:true,evidenceFile:exitFile});
  assert.equal(exit.ok,true,JSON.stringify(exit));
  assert.equal(exit.shell,'HOST_CHATGPT');
  assert.equal(session.status().closed,true);
  assert.equal(JSON.parse(fs.readFileSync(exitFile,'utf8')).human_input,'EXIT IKANT');
  assert.equal((await managed.routeHumanTurn({frame:{humanInput:'Ancora'},humanMessageObserved:true})).edge,'IKANT_ALREADY_EXITED');
  session.close();
  assert.equal((await session.publishTurn({humanInput:'Ancora',nonce:'oneshell-original-test-nonce-0002',
    priorMessages:[],resetContext:true})).slots.A,'NO_VOICE');
 }finally{session?.close();fs.rmSync(parent,{recursive:true,force:true});}
});


test('cold rebind reuses original C87 across two Node processes and rejects replay before model callback',async()=>{
 const {plan,expected}=sourceFixture();
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'c135-cold-rebind-e2e-'));
 const sourceRoot=path.join(parent,'source');let session;
 try{
  materializeRepositoryPlan(plan,{...expected,destination:sourceRoot});
  const terms=createHash('sha256').update(fs.readFileSync(path.join(sourceRoot,'TERMS.md'))).digest('hex');
  const offer=issueC72V2LinkedTermsOffer({sourceHead:expected.head,termsDigest:terms});
  const accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true});
  const selection=selectC72V2Mode({accepted,orientation:presentC72V2Introduction(accepted),humanMessage:'EDU'});
  const firstInput='Descrivi un esperimento ripetibile.';
  let modelCalls=0;
  session=await createC135EduV2Session({
   selection,sourceRoot,sourceBinding:expected,privateParent:parent,
   afterAcceptWitness:{accepted:true,scope:'HOST_WITNESSED_ONLY'},
   send:async()=>{},languagePort:async task=>{
    modelCalls++;
    return {text:'Prova sperimentale verificata solo localmente.',
     input_sha256:task.plan.input_sha256,ack_plan_sha256:task.guidance.plan_sha256,
     ack_c124_channel_sha256:task.channels.channel_sha256};
   }
  });
  assert.equal(session.ok,true,JSON.stringify(session));
  const first=await session.publishTurn({humanInput:firstInput,nonce:'edu-cold-original-nonce-0001',
    priorMessages:[],resetContext:true});
  assert.equal(first.ok,true,JSON.stringify(first));
  assert.equal(modelCalls,1);
  const before=session.readSessionState().original_c87_readback;
  assert.equal(before.count,1);
  const saved=path.join(parent,'saved','.ikant-host','c107-observations.jsonl');
  fs.mkdirSync(path.dirname(saved),{recursive:true,mode:0o700});
  fs.copyFileSync(session.readSessionState().ledger_file,saved);
  const original=fs.readFileSync(saved);
  session.close();session=null;
  const resume={ledgerFile:saved,expectedCount:before.count,expectedLastHash:before.last_hash,
    previousWorkerGone:true};
  const config={selection,sourceRoot,sourceBinding:expected,privateParent:parent,
    resume,firstInput};
  const ownerURL=new URL('../host/c135-edu-v2-owner.mjs',import.meta.url).href;
  const childCode=[
    'const {createC135EduV2Session}=await import('+JSON.stringify(ownerURL)+');',
    'const cfg=JSON.parse(process.env.C135_E2E_RECOVERY);',
    'let modelCalls=0,sends=0;',
    'const open=async resumeFrom=>createC135EduV2Session({selection:cfg.selection,sourceRoot:cfg.sourceRoot,sourceBinding:cfg.sourceBinding,privateParent:cfg.privateParent,resumeFrom,afterAcceptWitness:{accepted:true,scope:"HOST_WITNESSED_ONLY"},send:async()=>{sends++;},languagePort:async task=>{modelCalls++;return {text:"Risposta EDU successiva all’avvio del nuovo processo.",input_sha256:task.plan.input_sha256,ack_plan_sha256:task.guidance.plan_sha256,ack_c124_channel_sha256:task.channels.channel_sha256};}});',
    'const denied=await open({...cfg.resume,expectedLastHash:"0".repeat(64)});',
    'const noWitness=await open({...cfg.resume,previousWorkerGone:false});',
    'const s=await open(cfg.resume);if(s.ok!==true)throw Error(JSON.stringify(s));',
    'const replay=await s.publishTurn({humanInput:"Non ripetere",nonce:"edu-cold-original-nonce-0001",priorMessages:[cfg.firstInput],resetContext:false});',
    'const forged=await s.publishTurn({humanInput:"Nuova verifica",nonce:"edu-cold-original-nonce-0002",priorMessages:["storia inventata"],resetContext:false});',
    'const reset=await s.publishTurn({humanInput:"Nuova verifica",nonce:"edu-cold-original-nonce-0002",priorMessages:[],resetContext:true});',
    'const prior=s.readSessionState().original_c87_readback;',
    'const good=await s.publishTurn({humanInput:"Descrivi un secondo controllo.",nonce:"edu-cold-original-nonce-0002",priorMessages:[cfg.firstInput],resetContext:false});',
    'const after=s.readSessionState().original_c87_readback;',
    'console.log(JSON.stringify({denied:denied.first_edge,noWitness:noWitness.first_edge,replay:replay.first_edge,forged:forged.first_edge,reset:reset.first_edge,prior:prior.count,after:after.count,modelCalls,sends,ok:good.ok,receipt:s.recovered_original_ledger,active:s.active,native:s.native_event_attested}));',
    's.close();'
  ].join('\n');
  const child=spawnSync(process.execPath,['--input-type=module','-e',childCode],{
    encoding:'utf8',maxBuffer:200000,timeout:120000,
    env:{...process.env,C135_E2E_RECOVERY:JSON.stringify(config)}
  });
  assert.equal(child.status,0,child.stderr+child.stdout);
  const r=JSON.parse(child.stdout.trim());
  assert.equal(r.denied,'S02_RECOVERY_C87_READBACK_MISMATCH');
  assert.equal(r.noWitness,'S02_RECOVERY_WITNESS_INVALID');
  assert.equal(r.replay,'S02_FRAME_OR_NONCE_DENIED');
  assert.equal(r.forged,'S02_RECOVERY_CONTEXT_NOT_BOUND');
  assert.equal(r.reset,'S02_RECOVERY_CONTEXT_NOT_BOUND');
  assert.equal(r.prior,1);assert.equal(r.after,2);
  assert.equal(r.ok,true);assert.equal(r.modelCalls,1);assert.equal(r.sends,1);
  assert.equal(r.native,false);assert.equal(r.receipt.last_hash,before.last_hash);
  const now=fs.readFileSync(saved);
  assert(now.length>original.length);
  const events=now.toString('utf8').trimEnd().split('\n').map(JSON.parse);
  assert.equal(events.length,2);
  assert.equal(events[0].record_sha256,before.last_hash);
  assert.equal(events[1].prev_hash,before.last_hash);
 }finally{session?.close();fs.rmSync(parent,{recursive:true,force:true});}
});
