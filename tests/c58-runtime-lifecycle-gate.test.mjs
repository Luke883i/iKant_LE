import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT,classifyLifecycleIntent,classifyPreactiveRoute} from '../src/contract.mjs';
import {compileIntentAwareFirstContact} from '../src/bootstrap-intent-adapter.mjs';

test('C58 explicit lifecycle gate does not treat repository mention as activation',()=>{
 for(const x of ['studia iKant_LE','audit di Luke883i/iKant_LE','analizza https://github.com/Luke883i/iKant_LE','applica metodo a questa sessione']) {
  assert.equal(classifyLifecycleIntent(x).kind,'OTHER');
  assert.equal(classifyPreactiveRoute(x).route,'HOST');
  assert.equal(compileIntentAwareFirstContact(x).next.terminal,'HOST_ONLY');
 }
});

test('C58 activation and exit are explicit, clause-local and quote-safe',()=>{
 for(const x of ['avvia iKant','non fare audit, avvia iKant','please start ikant','non fare altro e attiva iKant'])assert.equal(classifyLifecycleIntent(x).kind,'ACTIVATE_IKANT');
 for(const x of ['non avviare iKant','do not start ikant','"avvia iKant" è un esempio','\`start ikant\`'])assert.equal(classifyLifecycleIntent(x).kind,'OTHER');
 for(const x of ['chiudi iKant','exit ikant','esci da iKant'])assert.equal(classifyLifecycleIntent(x).kind,'EXIT_IKANT');
 assert.equal(classifyLifecycleIntent('avvia iKant e poi chiudi iKant').kind,'OTHER');
});

test('C58 intent-aware first contact only opens admission on explicit activation',()=>{
 const a=compileIntentAwareFirstContact('avvia iKant e poi riassumi il documento');
 assert.equal(a.intent.kind,'ACTIVATE_IKANT');
 assert.equal(a.next.terminal,'CANONICAL_PREACCEPT');
 assert.equal(a.next.pending_intent,'avvia iKant e poi riassumi il documento');
 const h=compileIntentAwareFirstContact('studia iKant_LE senza avviarlo');
 assert.equal(h.intent.kind,'OTHER');assert.equal(h.next.terminal,'HOST_ONLY');assert.equal(h.next.action,'NO_IKANT_ACTION');
});

test('C58 runtime-command consumes the same preactive gate before dispatch mutation',()=>{
 const src=fs.readFileSync(path.join(ROOT,'src/runtime-command.mjs'),'utf8');
 const gate=src.indexOf("preactiveRoute=state.status==='ACTIVE'?null:classifyPreactiveRoute(input)");
 const dispatch=src.indexOf('recordNodeDispatch(state,input,hostSurface)');
 assert.ok(gate>=0&&dispatch>gate);
 assert.match(src,/return declineToHost\(input,preactiveRoute\)/);
 assert.match(src,/ikant_output:false/);
});
