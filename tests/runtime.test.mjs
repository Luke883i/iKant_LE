import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readTerms,readOrientationCapsule,readHostShell,validateSurfaceA,constitutionalFingerprint,sha256 } from '../src/contract.mjs';
import { initialState,runtimePaths,readLedger,emptyExperience } from '../src/state.mjs';
import { authorizePreaccept,recordCompletedPreacceptAccess,preservePendingIntent,presentTermsState,canAccept } from '../src/admission.mjs';
import { transitionPure,runCommand,bootstrapDecisionPure,nodeDispatchReceiptPure } from '../src/runtime.mjs';
import { compileCognitiveTurn,identitySurface } from '../src/cognition.mjs';
const terms=readTerms();
function reset(){fs.rmSync(runtimePaths().dir,{recursive:true,force:true});}

test('capsule is bounded and network profile is explicit',()=>{const c=readOrientationCapsule();assert.equal(c.paths.length,5);assert.equal(c.max_file_reads,5);assert.equal(c.max_total_bytes,262144);assert.equal(c.freeze_after_terms_presentation,true);assert.equal(c.network_profile.git_clone_available,false);assert.equal(c.network_profile.gh_available,false);assert.equal(c.network_profile.direct_github_dns_available,false);});

test('preaccept orientation permits only declared capsule',()=>{let s=initialState();let d=authorizePreaccept(s,'READ_ORIENTATION_METADATA',{metadataFields:['repository_full_name']});assert.equal(d.allowed,true);s=d.state;d=authorizePreaccept(s,'READ_ORIENTATION_FILE',{target:'README.md',byteCount:100});assert.equal(d.allowed,true);s=d.state;d=authorizePreaccept(s,'READ_ORIENTATION_FILE',{target:'src/runtime.mjs',byteCount:100});assert.equal(d.allowed,false);assert.equal(d.code,'DENY_OUTSIDE_CAPSULE');});

test('terms presentation freezes orientation',()=>{let s=presentTermsState(initialState(),terms.digest);const d=authorizePreaccept(s,'READ_ORIENTATION_FILE',{target:'README.md',byteCount:10});assert.equal(d.allowed,false);assert.equal(d.code,'DENY_ORIENTATION_FROZEN');});

test('completed forbidden preaccept access is nonretroactive breach',()=>{const d=recordCompletedPreacceptAccess(initialState(),'LIST_TREE');assert.equal(d.breached,true);assert.equal(d.terminal,'NEW_CHAT_REQUIRED');assert.equal(d.state.status,'SESSION_NONCONFORMING');assert.equal(d.state.admission.new_chat_required,true);assert.equal(canAccept(d.state,terms.digest),false);});

test('exact accept requires prior current terms presentation',()=>{reset();const out=runCommand('I ACCEPT');assert.equal(out.code,1);assert.match(out.stdout,/Terms correnti/);const s=readLedger().at(-1).state_after;assert.equal(s.accepted,false);reset();});

test('one-paste boot preserves intent and shows terms',()=>{reset();const q='analizza il repository e trova il prossimo collo di bottiglia';const out=runCommand(q);assert.equal(out.code,0);assert.match(out.stdout,/I ACCEPT/);const s=readLedger().at(-1).state_after;assert.equal(s.admission.pending_intent,q);assert.equal(s.admission.pending_intent_sha256,sha256(Buffer.from(q)));assert.equal(s.admission.terms_presented,true);reset();});

test('I ACCEPT auto boots and resumes pending intent without restatement',{concurrency:false},()=>{reset();const q='spiegami il prossimo passo in modo semplice';runCommand(q,{hostEngine:'GPT-TEST'});const out=runCommand('I ACCEPT',{hostEngine:'GPT-TEST'});assert.equal(out.code,0);assert.match(out.stdout,/Backlog & telemetrie:/);const events=readLedger();assert.ok(events.some(e=>e.kind==='PENDING_INTENT_RESUME'));const turn=events.findLast(e=>e.kind==='TURN');assert.equal(turn.detail.resumed_pending_intent,true);assert.ok(turn.detail.node_dispatch_receipt);const artifact=out.stdout.trim().split('\n').at(-1);assert.ok(fs.existsSync(path.join(runtimePaths().artifacts,artifact)));reset();});

test('breach self-destructs conformance and later accept cannot repair',{concurrency:false},()=>{reset();const b=runCommand('studia il repo',{hostAcquisition:[{completed:true,action:'LIST_TREE'}]});assert.equal(b.code,1);assert.match(b.stdout,/nuova chat/i);const a=runCommand('I ACCEPT');assert.equal(a.code,1);assert.match(a.stdout,/non conforme/i);const s=readLedger().at(-1).state_after;assert.equal(s.status,'SESSION_NONCONFORMING');reset();});

test('node receipt is actual same-input binding and authority zero',()=>{const s=initialState();const r=nodeDispatchReceiptPure('abc',s,{nodeVersion:'22.16.0'});assert.equal(r.node20_plus,true);assert.equal(r.input_sha256,sha256(Buffer.from('abc')));assert.equal(r.authority,0);assert.notEqual(r.input_sha256,nodeDispatchReceiptPure('abcd',s,{nodeVersion:'22.16.0'}).input_sha256);});

test('old node cannot satisfy universal gate',()=>{const r=nodeDispatchReceiptPure('abc',initialState(),{nodeVersion:'18.20.0'});assert.equal(r.node20_plus,false);});

test('every active substantive turn has NODE_DISPATCH before TURN',{concurrency:false},()=>{reset();runCommand('TERMS');runCommand('I ACCEPT');runCommand('chi sei?');const ev=readLedger();const ti=ev.findIndex(e=>e.kind==='TURN');assert.ok(ti>0);const prev=ev.slice(0,ti).findLast(e=>e.kind==='NODE_DISPATCH');assert.ok(prev);assert.equal(ev[ti].detail.node_dispatch_receipt,prev.detail.receipt.receipt_sha256);reset();});

test('ordinary identity remains iKant and hides engine plumbing',()=>{const s={...initialState(),status:'ACTIVE',experience:emptyExperience()};const a=identitySurface(compileCognitiveTurn('chi sei?',s,{hostEngine:'GPT-X'}));assert.match(a,/Sono iKant/);assert.doesNotMatch(a,/GPT-X|provider|runtime locale/i);assert.equal(validateSurfaceA(a).ok,true);});

test('host shell forbids direct model fast path',()=>{const h=readHostShell();assert.equal(h.universal_node_gate.all_user_inputs_enter_node_runtime,true);assert.equal(h.universal_node_gate.surface_a_requires_current_dispatch_receipt,true);assert.equal(h.universal_node_gate.direct_model_fast_path,false);});

test('probe failure cannot false-green ACTIVE',()=>{let s=presentTermsState(initialState(),terms.digest);s=transitionPure(s,'ACCEPT',terms.digest).state;const d=bootstrapDecisionPure(s,terms.digest,'fp',{ok:false,reason:'no fs'});assert.equal(d.terminal,'HOST_INCOMPATIBLE');assert.notEqual(d.state.status,'ACTIVE');});

test('constitutional fingerprint binds orientation capsule',()=>{const fp=constitutionalFingerprint();assert.match(fp,/^[a-f0-9]{64}$/);});
