import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {nodeDispatchReceiptPure} from '../src/runtime-core.mjs';
import {deriveActivationServiceTier,validateActivationServiceTier,assessLimitedTurnClosure,validateLimitedTurnClosure} from '../src/runtime-availability.mjs';
import {processLimitedRuntimeTurn} from '../src/runtime-limited-turn.mjs';

const prefix={accepted:true,source_snapshot:true,local_ingress:true,materialized_reopened:true,executed_provenance:true,runtime_bound:true,writer:true,active_readback:false};

test('C30 service tiers are monotonic projections and ACTIVE stays on the existing readback gate',()=>{
 const rows=[
  [{accepted:true,source_snapshot:true},'REPO_STUDY_ONLY','LOCAL_INGRESS'],
  [{accepted:true,source_snapshot:true,local_ingress:true},'ACTIVATION_LIMITED_1','LOCAL_MATERIALIZATION'],
  [{accepted:true,source_snapshot:true,local_ingress:true,materialized_reopened:true},'ACTIVATION_LIMITED_2','EXECUTED_RUNTIME_PROOF'],
  [prefix,'RUNTIME_BOUND_LIMITED','ACTIVE_READBACK'],
  [{...prefix,active_readback:true},'ACTIVE',null]
 ];
 for(const [e,tier,edge] of rows){const d=deriveActivationServiceTier(e);assert.equal(d.tier,tier);assert.equal(d.first_unclosed_edge,edge);assert.deepEqual(validateActivationServiceTier(d),{ok:true,errors:[]});}
 assert.equal(deriveActivationServiceTier(prefix).active,false);
 assert.equal(deriveActivationServiceTier({...prefix,active_readback:true}).active,true);
});

test('C30 integrity overlay blocks the service projection instead of laundering into a limited tier',()=>{
 const d=deriveActivationServiceTier({...prefix,blocked_integrity:true});
 assert.equal(d.tier,null);assert.equal(d.active,false);assert.equal(d.limited_turn_eligible,false);assert.equal(d.fault_overlay,'BLOCKED_INTEGRITY');
});

test('C30 limited closure requires dispatch, seal, DOCX readback and telemetry without platform ACK',()=>{
 const c=assessLimitedTurnClosure({activation_tier:'RUNTIME_BOUND_LIMITED',writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:true,telemetry_complete:true,structured_handoff:true,exact_delivery_ack_claimed:false,canonical_state_mutation:false});
 assert.equal(c.closed,true);assert.equal(c.active,false);assert.equal(c.host_delivery_proven,false);assert.equal(c.platform_ack_required,false);assert.equal(c.canonical_state_mutated,false);assert.deepEqual(validateLimitedTurnClosure(c),{ok:true,errors:[]});
 const bad=assessLimitedTurnClosure({activation_tier:'RUNTIME_BOUND_LIMITED',writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:false,telemetry_complete:true,structured_handoff:true});
 assert.equal(bad.closed,false);assert.equal(bad.first_failed_requirement,'DOCX_READBACK');
});

test('C30 runtime-limited turn mechanically closes input-output plus downloadable DOCX without canonical state mutation',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c30-'));
 try{
  const input='Spiega in modo sintetico come questo stato limitato conserva il confine tra prova runtime e stato ACTIVE.';
  const dispatch=nodeDispatchReceiptPure(input,{epoch:'limited-test',status:'DEGRADED'},{hostSurface:'TEST'});
  const candidate=('Questa risposta appartiene a un envelope runtime limitato e verificabile. '+
   'Il sistema ha gia chiuso materializzazione, provenienza eseguita e binding del runtime, ma non dichiara lo stato ACTIVE. '+
   'L input e legato alla ricevuta Node corrente, l output viene sigillato dal runtime e il backlog DOCX viene scritto e riletto. '+
   'La telemetria resta authority zero, non modifica il ledger canonico e non pretende alcuna conferma di consegna della piattaforma. '+
   'La promozione ad ACTIVE resta quindi riservata al normale commit persistito e al relativo readback.');
  const out=processLimitedRuntimeTurn({input,candidate,activationEvidence:{...prefix,external_gaps:[{id:'PLATFORM_ACK',open:true}]},nodeDispatch:dispatch,artifactDir:dir});
  assert.equal(out.mode,'IKANT_RUNTIME_LIMITED');assert.equal(out.active,false);assert.equal(out.closure.closed,true);assert.equal(out.receipt.active,false);assert.equal(out.receipt.canonical_state_mutation,false);assert.equal(out.receipt.platform_ack_required,false);assert.equal(out.receipt.host_delivery_proven,false);
  assert.equal(out.artifacts.length,1);assert.equal(out.artifacts[0].readback_verified,true);assert.equal(out.artifacts[0].required_presentation,false);assert.equal(out.artifacts[0].download_handoff,true);
  assert.ok(fs.existsSync(out.artifacts[0].path));assert.ok(fs.statSync(out.artifacts[0].path).size>1000);assert.equal(out.telemetry.completeness.ratio,1);assert.deepEqual(out.activation.external_gaps_open,['PLATFORM_ACK']);
 } finally {fs.rmSync(dir,{recursive:true,force:true});}
});

test('C30 limited-turn module has no canonical writer dependency and refuses ACTIVE as limited',()=>{
 const src=fs.readFileSync(new URL('../src/runtime-limited-turn.mjs',import.meta.url),'utf8');
 assert.equal(src.includes("from './state.mjs'"),false);assert.equal(src.includes('appendEvent('),false);assert.equal(src.includes('withWriterLock('),false);
 const input='Questo input verifica che ACTIVE non venga reinterpretato come stato runtime limitato.';
 const dispatch=nodeDispatchReceiptPure(input,{epoch:'x',status:'ACTIVE'},{hostSurface:'TEST'});
 const candidate=Array(60).fill('parola').join(' ');
 assert.throws(()=>processLimitedRuntimeTurn({input,candidate,activationEvidence:{...prefix,active_readback:true},nodeDispatch:dispatch,artifactDir:os.tmpdir()}),/RUNTIME_BOUND_LIMITED/);
});

test('C30 checked-in selection and falsification receipts encode the unique contract and fail-closed qualification',()=>{
 const select=JSON.parse(fs.readFileSync(new URL('../artifacts/qualification/c30-activation-service-selection-10k.json',import.meta.url),'utf8'));
 const fals=JSON.parse(fs.readFileSync(new URL('../artifacts/qualification/c30-activation-service-10m.json',import.meta.url),'utf8'));
 assert.equal(select.candidates,10000);assert.equal(select.unique_candidates,10000);assert.equal(select.valid_candidates,1);assert.equal(select.winner_cost,0);assert.equal(select.winner_cost_ties,1);assert.equal(select.receipt_sha256,'3c69f04574f051c958d6b195f6415eba75ec11fb4241644724374801f9262309');
 assert.equal(fals.cases,10000000);assert.equal(fals.candidate_oracle_mismatches,0);assert.equal(fals.unsafe_active,0);assert.equal(fals.unsafe_limited_closure,0);assert.equal(fals.all_mutants_killed,true);assert.equal(fals.status,'PASS');
});
