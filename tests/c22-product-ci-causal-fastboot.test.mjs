import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import * as fastboot from '../src/fastboot-convergence.mjs';
import {readTerms} from '../src/contract.mjs';
import {runtimePaths,readLedger} from '../src/state.mjs';
import {runCommand,validateChatBootstrapEvidence} from '../src/runtime.mjs';
import {runtimeRootDescriptor} from '../src/runtime-root-verified.mjs';
import {readLocalMaterializationReceipt} from '../src/bootstrap-semantic.mjs';
import {bootstrapEvidence,bootstrapHandoff} from './bootstrap-fixture.mjs';

const HEAD='a'.repeat(40);
const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
function resign(x){const y=structuredClone(x);delete y.receipt_sha256;return{...y,receipt_sha256:digest(y)};}
function reset(){fs.rmSync(runtimePaths().dir,{recursive:true,force:true});}
function validation(e){const root=runtimeRootDescriptor();return validateChatBootstrapEvidence(e,{sourceHead:HEAD,runtimeRootSha256:root.runtime_root_sha256,loaderBlobSha1:root.loader.blob_sha1,localMaterializationReceipt:readLocalMaterializationReceipt(),runtimeRootDescriptor:root,termsDigest:readTerms().digest});}

test('C22 ACTIVE evidence requires channel ledger and recomputed one-NEXT step',()=>{
 reset();let e=bootstrapEvidence({sourceHead:HEAD,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});delete e.fastboot_channel_ledger;delete e.fastboot_step;e=resign(e);const v=validation(e);assert.equal(v.ok,false);assert.ok(v.errors.some(x=>x.startsWith('channel_ledger:')));assert.ok(v.errors.some(x=>x.startsWith('fastboot_step:')));reset();
});

test('C22 tampered but re-signed fastboot step cannot bypass recomputation',()=>{
 reset();let e=bootstrapEvidence({sourceHead:HEAD,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});e.fastboot_step={...e.fastboot_step,action:'WAIT_CHANGED_EVIDENCE',canonical_next:'WAIT_CHANGED_EVIDENCE',retry_allowed:false};e.fastboot_step=resign(e.fastboot_step);e=resign(e);const v=validation(e);assert.equal(v.ok,false);assert.ok(v.errors.some(x=>x.includes('recomputed_action')||x.includes('transfer_carrier_binding')));reset();
});

test('C22 runCommand cannot accept an injected probe implementation',{concurrency:false},()=>{
 reset();const e=bootstrapEvidence({sourceHead:HEAD,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});const out=runCommand('I ACCEPT',{preacceptHandoff:bootstrapHandoff('inizializza',HEAD),postAcceptBootstrapEvidence:e,hostEngine:'GPT-TEST',hostSurface:'SESSION_LOCAL_NODE',probeRunner:()=>{throw new Error('INJECTED_PROBE_MUST_NOT_RUN');}});
 assert.equal(out.code,0);const s=readLedger().at(-1).state_after;assert.equal(s.status,'ACTIVE');assert.equal(s.bootstrap.probe.executed_provenance.readback_verified,true);assert.equal(s.bootstrap.fastboot_channel_ledger_receipt_sha256,e.fastboot_channel_ledger.receipt_sha256);assert.equal(s.bootstrap.fastboot_step_receipt_sha256,e.fastboot_step.receipt_sha256);reset();
});

test('C22 removes the attestative byte-bridge receipt API; materializer readback remains the physical owner',()=>{
 assert.equal('issueFastbootByteBridgeReceipt' in fastboot,false);assert.equal('validateFastbootByteBridgeReceipt' in fastboot,false);
 reset();let e=bootstrapEvidence({sourceHead:HEAD,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});const f=path.join(runtimePaths().dir,'materialization.json'),m=JSON.parse(fs.readFileSync(f,'utf8'));m.reopen_verified=false;fs.writeFileSync(f,JSON.stringify(resign(m),null,2)+'\n');const v=validation(e);assert.equal(v.ok,false);assert.ok(v.errors.includes('materialization:reopen'));reset();
});

test('C22 transfer carrier must equal the recomputed canonical carrier',()=>{
 reset();let e=bootstrapEvidence({sourceHead:HEAD,transferSchema:'v2',flexMode:'GITHUB_API_BASE64'});e.fastboot_step={...e.fastboot_step,canonical_carrier:'PINNED_PERMALINK'};e.fastboot_step=resign(e.fastboot_step);e=resign(e);const v=validation(e);assert.equal(v.ok,false);assert.ok(v.errors.some(x=>x.includes('recomputed_canonical_carrier')||x.includes('transfer_carrier_binding')));reset();
});
