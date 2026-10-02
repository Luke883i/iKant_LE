import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
import {renderLocalHostMetaPrompt,renderLocalHostMetaPromptDocument,localHostMetaPromptReceipt} from '../src/local-host-meta-prompt.mjs';

const json=rel=>JSON.parse(fs.readFileSync(path.join(ROOT,rel),'utf8'));

test('local-host meta-prompt is a derived byte-exact document',()=>{
 const doc=fs.readFileSync(path.join(ROOT,'docs/LOCAL_HOST_META_PROMPT.md'),'utf8');
 assert.equal(doc,renderLocalHostMetaPromptDocument());
 const r=localHostMetaPromptReceipt();
 assert.equal(r.schema,'ikant-le-local-host-adapter/v2');
 assert.equal(r.authority,0);
 assert.ok(r.chars<3000);
 assert.match(r.sha256,/^[a-f0-9]{64}$/);
});

test('local-host meta-prompt projects C25 canonical owners without becoming runtime truth',()=>{
 const p=renderLocalHostMetaPrompt(),boot=json('BOOTSTRAP.json'),admission=json('ADMISSION.json'),activation=json('contracts/session-chat-activation.json');
 assert.equal(boot.post_accept_fastboot.canonical_activation_model,'LOCAL_EXECUTOR_V1');
 assert.equal(admission.preaccept_handoff.canonical_schema,'ikant-le-preaccept-handoff/v2');
 assert.equal(activation.canonical_activation_model,'LOCAL_EXECUTOR_V1');
 assert.equal(activation.claim_boundary.pre_runtime_host_adapter_is_iKant_runtime,false);
 assert.ok(p.includes('LOCAL_EXECUTOR_V1'));
 assert.ok(p.includes('model must never copy, reconstruct, encode, relay, or write repository bytes'));
 assert.ok(p.includes('120000 ms is activation SLO telemetry, never an integrity gate'));
 assert.equal(boot.post_accept_fastboot.runtime_root.members.some(x=>x.path==='src/local-host-meta-prompt.mjs'),false);
 assert.equal(boot.post_accept_fastboot.remote_paths.includes('src/local-host-meta-prompt.mjs'),false);
});

test('local-host meta-prompt contains no superseded host-adapter algorithm',()=>{
 const p=renderLocalHostMetaPrompt();
 for(const stale of ['decision_key','channel ledger','UNKNOWN -> PROBE','reuse orientation bytes','byte bridge','second remote round','capture acceptance-origin'])assert.equal(p.toLowerCase().includes(stale.toLowerCase()),false,stale);
});

