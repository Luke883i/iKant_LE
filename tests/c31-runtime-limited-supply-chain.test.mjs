import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {deploySessionChatRuntime,openDeployedSession,acceptDeployedLimitedSession,runDeployedLimitedSessionTurn} from '../src/session-chat-deployment.mjs';
import {nodeDispatchReceiptPure,validateNodeDispatchReceipt} from '../src/runtime-dispatch.mjs';

const temp=()=>fs.mkdtempSync(path.join(os.tmpdir(),'ikant-le-c31-'));
const candidate=('Questa risposta appartiene al servizio runtime limitato e rimane esplicitamente non ACTIVE. '+
 'La capability e legata alla stessa sorgente, al runtime root materializzato, alla provenienza del codice eseguito e alla acceptance origin osservata. '+
 'Il dispatch Node viene generato dal runtime sul medesimo input, l output viene sigillato e il backlog DOCX viene pubblicato atomicamente e riletto. '+
 'La telemetria e calcolata da check effettivi, non modifica il ledger canonico e non dichiara alcun acknowledgement della piattaforma. '+
 'La sola promozione possibile resta il normale ACTIVE_READBACK del lifecycle canonico.');

test('C31 runtime-limited supply chain closes end to end and fails closed on tamper',{concurrency:false},async()=>{
 const input0='input limitato',dispatch=nodeDispatchReceiptPure(input0,{epoch:'acceptance-event-x',status:'RUNTIME_BOUND_LIMITED'},{nodeVersion:'20.11.1',hostSurface:'TEST'});
 assert.deepEqual(validateNodeDispatchReceipt(dispatch,{input:input0,epoch:'acceptance-event-x',statusBefore:'RUNTIME_BOUND_LIMITED',hostSurface:'TEST'}),{ok:true,errors:[]});
 assert.equal(validateNodeDispatchReceipt({...dispatch,epoch:'acceptance-event-y'},{input:input0,epoch:'acceptance-event-x',statusBefore:'RUNTIME_BOUND_LIMITED',hostSurface:'TEST'}).ok,false);
 assert.equal(validateNodeDispatchReceipt({...dispatch,receipt_sha256:'f'.repeat(64)},{input:input0,epoch:'acceptance-event-x',statusBefore:'RUNTIME_BOUND_LIMITED',hostSurface:'TEST'}).ok,false);

 const d=temp(),deployment=path.join(d,'deploy');
 try{
  deploySessionChatRuntime({deploymentRoot:deployment,deploymentId:'D-C31'});const before=openDeployedSession({deploymentRoot:deployment,sessionId:'CHAT-L'});assert.equal(before.acceptance_required,true);assert.equal(before.limited,false);
  const limited=await acceptDeployedLimitedSession({deploymentRoot:deployment,sessionId:'CHAT-L',humanInput:'I ACCEPT'});assert.equal(limited.state,'RUNTIME_BOUND_LIMITED');assert.equal(limited.active,false);assert.equal(limited.first_unclosed_edge,'ACTIVE_READBACK');assert.match(limited.capability_receipt_sha256,/^[a-f0-9]{64}$/);
  const sessionDir=path.join(deployment,'sessions',fs.readdirSync(path.join(deployment,'sessions'))[0]),runtimeDir=path.join(sessionDir,'runtime');assert.equal(fs.existsSync(path.join(runtimeDir,'.ikant','ledger.jsonl')),false);assert.equal(fs.existsSync(path.join(sessionDir,'limited-capability.json')),true);
  const after=openDeployedSession({deploymentRoot:deployment,sessionId:'CHAT-L'});assert.equal(after.limited,true);assert.equal(after.active,false);assert.equal(after.acceptance_required,false);assert.equal(after.service_state,'RUNTIME_BOUND_LIMITED');
  const input='Produci una risposta runtime limitata con backlog e telemetria verificabili.',turn=await runDeployedLimitedSessionTurn({deploymentRoot:deployment,sessionId:'CHAT-L',input,candidate});
  assert.equal(turn.state,'RUNTIME_BOUND_LIMITED');assert.equal(turn.mode,'IKANT_RUNTIME_LIMITED');assert.equal(turn.active,false);assert.equal(turn.canonical_state_mutation,false);assert.equal(turn.platform_ack_required,false);assert.equal(turn.host_delivery_proven,false);assert.equal(turn.artifacts.length,1);
  const a=turn.artifacts[0];assert.equal(a.atomic_publish,true);assert.equal(a.readback_verified,true);assert.equal(a.download_handoff,true);assert.match(a.name,/^iKant_LE_Limited_[a-f0-9]{64}\.docx$/);assert.ok(fs.existsSync(a.local_path));assert.ok(fs.statSync(a.local_path).size>1000);assert.equal(fs.existsSync(path.join(runtimeDir,'.ikant','ledger.jsonl')),false);
  assert.match(turn.node_dispatch_receipt_sha256,/^[a-f0-9]{64}$/);assert.match(turn.runtime_seal_sha256,/^[a-f0-9]{64}$/);assert.match(turn.telemetry_sha256,/^[a-f0-9]{64}$/);assert.match(turn.limited_turn_receipt_sha256,/^[a-f0-9]{64}$/);
  const replay=await runDeployedLimitedSessionTurn({deploymentRoot:deployment,sessionId:'CHAT-L',input,candidate});assert.equal(a.name,replay.artifacts[0].name);assert.equal(a.sha256,replay.artifacts[0].sha256);assert.equal(a.descriptor_sha256,replay.artifacts[0].descriptor_sha256);assert.equal(turn.limited_turn_receipt_sha256,replay.limited_turn_receipt_sha256);
 }finally{fs.rmSync(d,{recursive:true,force:true});}

 const t=temp(),tamperedDeployment=path.join(t,'deploy');
 try{
  deploySessionChatRuntime({deploymentRoot:tamperedDeployment});await acceptDeployedLimitedSession({deploymentRoot:tamperedDeployment,sessionId:'CHAT-X',humanInput:'I ACCEPT'});
  const sessionDir=path.join(tamperedDeployment,'sessions',fs.readdirSync(path.join(tamperedDeployment,'sessions'))[0]),capFile=path.join(sessionDir,'limited-capability.json'),cap=JSON.parse(fs.readFileSync(capFile,'utf8'));cap.source_head='e'.repeat(40);fs.writeFileSync(capFile,JSON.stringify(cap));
  await assert.rejects(()=>runDeployedLimitedSessionTurn({deploymentRoot:tamperedDeployment,sessionId:'CHAT-X',input:'input tamper',candidate}),/capability invalid|source_head|receipt_digest/);assert.equal(fs.existsSync(path.join(sessionDir,'artifacts')),false);
 }finally{fs.rmSync(t,{recursive:true,force:true});}

 const server=fs.readFileSync(new URL('../plugins/ikant-le-session-chat/server/server.mjs',import.meta.url),'utf8'),cli=fs.readFileSync(new URL('../scripts/session-chat-runtime-cli.mjs',import.meta.url),'utf8');
 assert.match(server,/ikant_le_accept_limited/);assert.match(server,/ikant_le_limited_turn/);assert.match(server,/canonical ACTIVE turn/);assert.match(server,/RUNTIME_BOUND_LIMITED turn/);assert.match(cli,/accept-limited/);assert.match(cli,/limited-turn/);assert.match(cli,/acceptDeployedSession/);assert.match(cli,/runDeployedSessionTurn/);
});
