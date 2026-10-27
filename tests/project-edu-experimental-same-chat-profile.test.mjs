import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const load=p=>JSON.parse(readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const profile=load('contracts/project-edu-experimental-same-chat-profile.json');
const source=load('contracts/project-session-source.json');
const what=load('contracts/project-edu-host-what-how-v2.json');
test('experimental same-chat guarantees never impersonate canonical or field activation',()=>{
 assert.equal(profile.authority,0);
 assert.equal(profile.no_new_owners,true);assert.equal(profile.no_new_writer,true);
 assert.equal(profile.no_new_carrier,true);
 assert.match(profile.decision,/EXPERIMENTAL/);
 assert(profile.claims_not_required_for_experimental_local.includes('CANONICAL_ACTIVE'));
 assert.equal(profile.product_status_without_field_proof,'PRODUCT_NO_GO');
 assert.equal(profile.cognition.unbounded_psyche_persistence_attested,false);
 assert.equal(profile.cognition.c140_alternate_may_not_execute_original_c70,true);
 assert.equal(profile.cognition.c107_prior_messages_max,4);
});
test('original owner chain and existing WHAT/HOW remain the sole source of authority',()=>{
 assert.equal(what.authority,0);
 assert.equal(source.schema,'ikant-le-project-session-source/v1');
 for(const file of ['host/c135-edu-v2-owner.mjs','host/project-oneshell-edu.mjs',
 'host/project-oneshell-continuity.mjs','host/c87-durable-ledger.mjs',
 'src/c70-edu-v2-compute-preview.mjs','scripts/project-repo-loader.mjs'])
  assert(source.paths.includes(file),file);
 assert.equal(profile.source.manifest_owner,'contracts/project-session-source.json');
 assert.equal(profile.source.no_hardcoded_future_epoch_source_count,true);
});
test('six experimental evidence tiers remain distinct from user gates and transport',()=>{
 assert.deepEqual(profile.gates.map(x=>x.id),['E0','E1','E2','E3','E4','E5']);
 assert.match(profile.gates[1].requires,/C72_ACCEPTED_INTRO/);
 assert.match(profile.gates[2].requires,/TREE_BLOB_LOCAL_READBACK/);
 assert.match(profile.gates[3].requires,/LIVE_ORIGINAL_C135/);
 assert.match(profile.gates[4].requires,/REAL_HUMAN_TURNS/);
 assert.equal(profile.phase_before_admission,'HOST_ENGINEERING_NEVER_SIMULATES_I_ACCEPT_OR_EDU');
});
