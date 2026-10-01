import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  FASTBOOT_CAPABILITY_FIELDS,issueFastbootCapabilityReceipt,validateFastbootCapabilityReceipt,
  buildFastbootChannelLedger,validateFastbootChannelLedger,deriveFastbootStep,validateFastbootStep,recordFastbootFailure,
  LOCAL_SESSION_ACTIVATION_MODALITY
} from '../src/fastboot-convergence.mjs';
import {runtimeRootDescriptor} from '../src/runtime-root-verified.mjs';
import {runProbe} from '../src/probe.mjs';
import {initialState,runtimePaths,readLedger} from '../src/state.mjs';
import {runCommand} from '../src/runtime.mjs';
import {bootstrapEvidence,bootstrapHandoff} from './bootstrap-fixture.mjs';

const HEAD='a'.repeat(40),proven=()=>Object.fromEntries(FASTBOOT_CAPABILITY_FIELDS.map(k=>[k,true]));
const reset=()=>fs.rmSync(runtimePaths().dir,{recursive:true,force:true});

test('C21 state and contract expose one local activation modality',()=>{
 const c=JSON.parse(fs.readFileSync(new URL('../contracts/session-chat-activation.json',import.meta.url),'utf8'));
 assert.equal(c.activation_modality,'SESSION_CHAT_LOCAL');assert.equal(c.hosted_runtime_required,false);assert.equal(c.plugin_or_mcp_registration_required,false);
 assert.equal(initialState().bootstrap.activation_modality,LOCAL_SESSION_ACTIVATION_MODALITY);
});

test('C21 mechanical receipt owns AVAILABLE truth and raw absence stays UNKNOWN',()=>{
 const r=issueFastbootCapabilityReceipt({carrier:'GITHUB_API_BASE64',status:'AVAILABLE',capabilities:proven(),evidence:'api + local sink observed',probeOwner:'test',operationId:'op-a',sourceHead:HEAD});
 assert.equal(validateFastbootCapabilityReceipt(r,{sourceHead:HEAD}).ok,true);
 const l=buildFastbootChannelLedger({receipts:[r],sourceHead:HEAD});assert.equal(validateFastbootChannelLedger(l,{sourceHead:HEAD}).ok,true);assert.equal(l.channels.GITHUB_API_BASE64.status,'AVAILABLE');assert.equal(l.channels.HOST_FILE_BRIDGE.status,'UNKNOWN');
});

test('C21 one NEXT executes once; unchanged evidence cannot retry; changed evidence replans',()=>{
 const root=runtimeRootDescriptor(),a=issueFastbootCapabilityReceipt({carrier:'GITHUB_API_BASE64',status:'AVAILABLE',capabilities:proven(),evidence:'available',probeOwner:'test',operationId:'op-a',sourceHead:HEAD});
 let l=buildFastbootChannelLedger({receipts:[a],sourceHead:HEAD}),first=deriveFastbootStep({ledger:l,runtimeRootSha256:root.runtime_root_sha256});
 assert.equal(first.action,'EXECUTE_CANONICAL_CARRIER');assert.equal(first.one_next,true);assert.equal(first.one_executor,true);assert.equal(validateFastbootStep(first,{sourceHead:HEAD,runtimeRootSha256:root.runtime_root_sha256}).ok,true);
 const retry=deriveFastbootStep({ledger:l,runtimeRootSha256:root.runtime_root_sha256,previousSteps:[{decision_key:first.decision_key,evidence_sha256:first.evidence_sha256,progressed:false}]});assert.equal(retry.action,'WAIT_CHANGED_EVIDENCE');assert.equal(retry.retry_allowed,false);
 const u=issueFastbootCapabilityReceipt({carrier:'GITHUB_API_BASE64',status:'UNAVAILABLE',capabilities:{...proven(),byte_preserving_runtime_sink:false},evidence:'sink unavailable',probeOwner:'test',operationId:'op-b',sourceHead:HEAD});
 l=buildFastbootChannelLedger({previous:l,receipts:[u],sourceHead:HEAD});const changed=deriveFastbootStep({ledger:l,runtimeRootSha256:root.runtime_root_sha256,previousSteps:[first]});assert.notEqual(changed.action,'WAIT_CHANGED_EVIDENCE');
});

test('C22 failure memory is ledger-owned and unchanged evidence cannot replay',()=>{
 const root=runtimeRootDescriptor(),a=issueFastbootCapabilityReceipt({carrier:'GITHUB_API_BASE64',status:'AVAILABLE',capabilities:proven(),evidence:'available',probeOwner:'test',operationId:'op-fail',sourceHead:HEAD});
 const l=buildFastbootChannelLedger({receipts:[a],sourceHead:HEAD}),step=deriveFastbootStep({ledger:l,runtimeRootSha256:root.runtime_root_sha256}),failed=recordFastbootFailure(l,step),again=deriveFastbootStep({ledger:failed,runtimeRootSha256:root.runtime_root_sha256});
 assert.equal(again.action,'WAIT_CHANGED_EVIDENCE');assert.equal(again.retry_allowed,false);assert.equal(failed.failed_decisions.length,1);
});

test('C21 real local Node probe binds executed code to current verified runtime root',{concurrency:false},()=>{
 reset();const p=runProbe({hostSurface:'SESSION_LOCAL_NODE'}),d=runtimeRootDescriptor();assert.equal(p.ok,true);assert.equal(p.executed_provenance.runtime_root_sha256,d.runtime_root_sha256);assert.equal(p.executed_provenance.readback_verified,true);assert.ok(p.executed_provenance.modules.some(x=>x.path==='src/probe.mjs'));assert.ok(p.executed_provenance.modules.some(x=>x.path==='src/runtime-command.mjs'));reset();
});

test('C21 canonical local activation reaches persisted/read-back ACTIVE with executed provenance',{concurrency:false},()=>{
 reset();const source=HEAD,e=bootstrapEvidence({sourceHead:source,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});const out=runCommand('I ACCEPT',{preacceptHandoff:bootstrapHandoff('inizializza',source),postAcceptBootstrapEvidence:e,hostEngine:'GPT-TEST',hostSurface:'SESSION_LOCAL_NODE'});
 assert.equal(out.code,0);const s=readLedger().at(-1).state_after;assert.equal(s.status,'ACTIVE');assert.equal(s.bootstrap.activation_modality,'SESSION_CHAT_LOCAL');assert.equal(s.bootstrap.probe.executed_provenance.readback_verified,true);assert.equal(s.bootstrap.probe.executed_provenance.runtime_root_sha256,runtimeRootDescriptor().runtime_root_sha256);reset();
});
