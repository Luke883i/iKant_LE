import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
import {
 SESSION_ACTIVATION_EXPERIENCE_TIERS,
 classifySessionActivationExperience,
 validateSessionActivationExperience,
 classifyLimitedInteractionClosure,
 validateLimitedInteractionClosure
} from '../src/runtime-availability.mjs';

test('C30 selected spectrum has exactly five non-persisted experience tiers',()=>{
 assert.deepEqual(SESSION_ACTIVATION_EXPERIENCE_TIERS,['REPO_STUDY_ONLY','ACTIVATION_LIMITED_1','ACTIVATION_LIMITED_2','RUNTIME_BOUND_LIMITED','ACTIVE']);
 const c=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/runtime-availability-dod.json'),'utf8'));
 assert.equal(c.activation_experience_spectrum.projection_only,true);
 assert.equal(c.activation_experience_spectrum.persisted,false);
 assert.equal(c.activation_experience_spectrum.replaces_lifecycle,false);
 assert.equal(c.activation_experience_spectrum.active_semantics_unchanged,true);
 assert.equal(c.activation_experience_spectrum.tiers.length,5);
});

test('C30 experience projection follows the existing six-edge prefix',()=>{
 const base={accepted:true,source_snapshot:true,local_ingress:false,materialized_reopened:false,executed_provenance:false,runtime_bound:false,writer:false,active_readback:false};
 const study=classifySessionActivationExperience(base);assert.equal(study.tier,'REPO_STUDY_ONLY');assert.equal(study.first_unclosed_edge,'LOCAL_INGRESS');assert.equal(study.active,false);
 const l1=classifySessionActivationExperience({...base,local_ingress:true});assert.equal(l1.tier,'ACTIVATION_LIMITED_1');assert.equal(l1.first_unclosed_edge,'LOCAL_MATERIALIZATION');
 const l2=classifySessionActivationExperience({...base,local_ingress:true,materialized_reopened:true});assert.equal(l2.tier,'ACTIVATION_LIMITED_2');assert.equal(l2.first_unclosed_edge,'EXECUTED_RUNTIME_PROOF');
 const rb=classifySessionActivationExperience({...base,local_ingress:true,materialized_reopened:true,executed_provenance:true,runtime_bound:true});assert.equal(rb.tier,'RUNTIME_BOUND_LIMITED');assert.equal(rb.claim_class,'IKANT_RUNTIME_LIMITED');assert.equal(rb.active,false);assert.equal(rb.first_unclosed_edge,'ACTIVE_READBACK');
 const active=classifySessionActivationExperience({...base,local_ingress:true,materialized_reopened:true,executed_provenance:true,runtime_bound:true,writer:true,active_readback:true});assert.equal(active.tier,'ACTIVE');assert.equal(active.active,true);assert.equal(active.first_unclosed_edge,null);
 for(const x of [study,l1,l2,rb,active])assert.deepEqual(validateSessionActivationExperience(x),{ok:true,errors:[]});
});

test('C30 integrity dominates every study/limited/ACTIVE projection',()=>{
 const d=classifySessionActivationExperience({accepted:true,source_snapshot:true,local_ingress:true,materialized_reopened:true,executed_provenance:true,runtime_bound:true,writer:true,active_readback:true,blocked_integrity:true});
 assert.equal(d.tier,'BLOCKED_INTEGRITY');assert.equal(d.active,false);assert.equal(d.limited_interaction_eligible,false);
 assert.deepEqual(validateSessionActivationExperience(d),{ok:true,errors:[]});
});

test('C30 limited interaction closes only from RUNTIME_BOUND_LIMITED with backlog DOCX plus telemetry',()=>{
 const good=classifyLimitedInteractionClosure({tier:'RUNTIME_BOUND_LIMITED',writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:true,telemetry_complete:true,structured_handoff:true,exact_delivery_ack_claimed:false,canonical_state_mutation:false});
 assert.equal(good.state,'LIMITED_OUTPUT_CLOSED');assert.equal(good.closed,true);assert.equal(good.active,false);assert.equal(good.claim_class,'IKANT_RUNTIME_LIMITED');assert.equal(good.host_delivery_proven,false);assert.equal(good.required_banner,'iKant runtime limitato — non ACTIVE');assert.deepEqual(validateLimitedInteractionClosure(good),{ok:true,errors:[]});
 const noDocx=classifyLimitedInteractionClosure({tier:'RUNTIME_BOUND_LIMITED',writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:false,telemetry_complete:true,structured_handoff:true,exact_delivery_ack_claimed:false,canonical_state_mutation:false});
 assert.equal(noDocx.state,'LIMITED_BLOCKED');assert.equal(noDocx.first_missing,'DOCX_READBACK');
});

test('C30 limited closure never consumes platform ACK or mutates canonical pre-ACTIVE state',()=>{
 const falseAck=classifyLimitedInteractionClosure({tier:'RUNTIME_BOUND_LIMITED',writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:true,telemetry_complete:true,structured_handoff:true,exact_delivery_ack_claimed:true,canonical_state_mutation:false});
 assert.equal(falseAck.closed,false);assert.equal(falseAck.first_missing,'FALSE_ACK');
 const mutation=classifyLimitedInteractionClosure({tier:'RUNTIME_BOUND_LIMITED',writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:true,telemetry_complete:true,structured_handoff:true,exact_delivery_ack_claimed:false,canonical_state_mutation:true});
 assert.equal(mutation.closed,false);assert.equal(mutation.first_missing,'PREACTIVE_STATE_MUTATION');
});

test('C30 mutation receipts encode unique 10k minimum and 1m fail-closed qualification',()=>{
 const s=JSON.parse(fs.readFileSync(path.join(ROOT,'artifacts/qualification/c30-activation-spectrum-selection-10k.json'),'utf8'));
 const f=JSON.parse(fs.readFileSync(path.join(ROOT,'artifacts/qualification/c30-activation-spectrum-1m.json'),'utf8'));
 assert.equal(s.candidates,10000);assert.equal(s.unique_candidates,10000);assert.equal(s.valid_candidates,1);assert.equal(s.winner_cost,0);assert.equal(s.winner_cost_ties,1);
 assert.equal(f.cases,1000000);assert.equal(f.status,'PASS');assert.equal(f.candidate_oracle_mismatches,0);assert.equal(f.unsafe_active,0);assert.equal(f.unsafe_limited_closure,0);assert.equal(f.all_mutants_killed,true);assert.equal(f.mutants,18);assert.ok(f.limited_output_closed_witnesses>0);
});
