import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {runtimeRootDescriptor,materializeRuntimeRoot} from '../src/runtime-root-verified.mjs';
import {runtimePaths,readLedger} from '../src/state.mjs';
import {runCommand} from '../src/runtime.mjs';
import {bootstrapHandoff,bootstrapEvidence} from './bootstrap-fixture.mjs';
import {SESSION_CHAT_PROFILE,sessionChatReceiptDigest,validateDeploymentAttestation,validateDeployedSessionBinding,classifySessionChatActivation} from '../src/session-chat-activation.mjs';

const HEAD='a'.repeat(40);
const ROOT=runtimeRootDescriptor();
const sign=x=>({...x,receipt_sha256:sessionChatReceiptDigest(x)});
const reset=()=>fs.rmSync(runtimePaths().dir,{recursive:true,force:true});

function materialization(){
 return sign({schema:'ikant-le-runtime-root-materialization/v1',source_head:HEAD,runtime_root_sha256:ROOT.runtime_root_sha256,loader_blob_sha1:ROOT.loader.blob_sha1,transfer_receipt_sha256:'f'.repeat(64),member_count:ROOT.member_count,source_bytes:ROOT.source_bytes,shard_count:ROOT.shards.length,reused_orientation_paths:[],atomic_publish:true,reopen_verified:true,authority:0});
}
function deployment(mat=materialization()){
 return sign({schema:'ikant-le-deployment-attestation/v1',deployment_id:'dep-c20-1',runtime_execution_plane_id:'node-plane-1',deployment_model:'DEPLOY_ONCE_BIND_PER_SESSION',source_head:HEAD,runtime_root_sha256:ROOT.runtime_root_sha256,local_materialization_receipt_sha256:mat.receipt_sha256,local_root_reopen_verified:true,runtime_ready:true,repository_transfer_per_chat:false,authority:0});
}

test('C20 deployment attestation is exact-source/root/materialization bound',()=>{
 const m=materialization(),d=deployment(m);
 assert.equal(validateDeploymentAttestation(d,{sourceHead:HEAD,runtimeRootSha256:ROOT.runtime_root_sha256,localMaterializationReceipt:m}).ok,true);
 assert.equal(validateDeploymentAttestation(d,{sourceHead:'b'.repeat(40),runtimeRootSha256:ROOT.runtime_root_sha256,localMaterializationReceipt:m}).ok,false);
 const bad=sign({...d,repository_transfer_per_chat:true});assert.equal(validateDeploymentAttestation(bad,{sourceHead:HEAD,runtimeRootSha256:ROOT.runtime_root_sha256,localMaterializationReceipt:m}).ok,false);
});

test('C20 deployed session binding cannot cross deployment or execution plane',()=>{
 const d=deployment();
 const b=sign({schema:'ikant-le-deployed-session-binding/v1',profile:SESSION_CHAT_PROFILE.DEPLOYED,session_id:'session-1',deployment_id:d.deployment_id,deployment_receipt_sha256:d.receipt_sha256,runtime_execution_plane_id:d.runtime_execution_plane_id,session_bound:true,repository_transfer_per_chat:false,authority:0});
 assert.equal(validateDeployedSessionBinding(b,{deploymentAttestation:d}).ok,true);
 const other=sign({...b,runtime_execution_plane_id:'other-plane'});assert.equal(validateDeployedSessionBinding(other,{deploymentAttestation:d}).ok,false);
});

test('C20 diagnostic precedence keeps integrity above availability',()=>{
 const base={profile:SESSION_CHAT_PROFILE.DEPLOYED,accepted:true,origin_valid:true,deadline_valid:true,deployment_attested:true,session_bound:true,execution_plane_bound:true,repository_transfer_per_chat:false,local_root_readback:true,live_probe:true,writer_readback:true,active_commit:true,active_readback:true,source_match:true,terms_match:true,receipt_integrity:true,model_mediated_bytes:false,history_double_commit:false,epoch_binding:true,active_readback_contradiction:false};
 assert.equal(classifySessionChatActivation(base),'ACTIVE');
 assert.equal(classifySessionChatActivation({...base,source_match:false,deployment_attested:false}),'BLOCKED_INTEGRITY');
 assert.equal(classifySessionChatActivation({...base,deployment_attested:false}),'HOST_UNAVAILABLE');
 assert.equal(classifySessionChatActivation({...base,active_readback:false}),'BLOCKED');
});

test('C20 one-shot missing origin fails before REMOTE_HISTORY commit',{concurrency:false},()=>{
 reset();const e=bootstrapEvidence({sourceHead:HEAD,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});delete e.acceptance_origin;e.acceptance_origin_receipt_sha256=null;
 const out=runCommand('I ACCEPT',{preacceptHandoff:bootstrapHandoff('inizializza',HEAD),postAcceptBootstrapEvidence:e,hostEngine:'GPT-TEST'});
 assert.equal(out.code,1);const s=readLedger().at(-1).state_after;
 assert.equal(s.bootstrap.remote_history_sha256??null,null);assert.equal(s.bootstrap.deadline_result,'DEADLINE_ORIGIN_UNAVAILABLE');assert.equal(s.admission.new_chat_required,true);reset();
});

test('C20 real deployed runtime materialize -> attest -> bind -> one I ACCEPT -> persisted/read-back ACTIVE',{concurrency:false},async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c20-')),sink=path.join(tmp,'runtime');
 try{
  const mat=materializeRuntimeRoot({sink,sourceHead:HEAD,transferReceiptSha256:'f'.repeat(64)});
  assert.equal(mat.reopen_verified,true);
  const activation=await import(pathToFileURL(path.join(sink,'src/session-chat-activation.mjs')).href+'?c20='+Date.now());
  const deployed=activation.attestDeployedRuntime({deploymentId:'deployment-real-c20',runtimeExecutionPlaneId:'ci-local-node',sourceHead:HEAD});
  const binding=activation.buildDeployedSessionBinding({deploymentAttestation:deployed,sessionId:'session-chat-c20'});
  const runtime=await import(pathToFileURL(path.join(sink,'src/runtime.mjs')).href+'?c20='+Date.now());
  const out=runtime.runCommand('I ACCEPT',{preacceptHandoff:bootstrapHandoff('inizializza',HEAD),deployedSessionBinding:binding,hostEngine:'GPT-TEST',hostSurface:'SESSION_CHAT_DEPLOYED'});
  assert.equal(out.code,0);assert.match(out.stdout,/iKant è attivo/);
  const stateMod=await import(pathToFileURL(path.join(sink,'src/state.mjs')).href+'?c20='+Date.now());
  const events=stateMod.readLedger(),final=events.at(-1).state_after,accept=events.find(x=>x.kind==='ACCEPT');
  assert.equal(final.status,'ACTIVE');assert.equal(final.bootstrap.activation_profile,'SESSION_CHAT_DEPLOYED');assert.equal(final.bootstrap.transfer_receipt_sha256??null,null);
  assert.match(final.bootstrap.deadline_origin_receipt_sha256,/^[a-f0-9]{64}$/);assert.equal(typeof final.bootstrap.acceptance_origin_monotonic_ms,'number');
  assert.equal(events.filter(x=>x.kind==='ACCEPT').length,1);assert.equal(accept.detail.acceptance_origin_receipt.clock,'MONOTONIC');assert.equal(accept.detail.acceptance_origin_receipt.elapsed_to_runtime_entry_ms,0);
  assert.ok(events.some(x=>x.kind==='DEPLOYED_SESSION_BIND'));assert.ok(events.some(x=>x.kind==='INITIALIZE'));
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
