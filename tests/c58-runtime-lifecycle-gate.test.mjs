import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
import {renderSessionChatLocalPrompt,renderSessionChatLocalPromptDocument,sessionChatLocalPromptReceipt} from '../src/session-chat-local-prompt.mjs';
import {compileIntentAwareFirstContact} from '../src/bootstrap-intent-adapter.mjs';

test('C58 executable first contact starts from repo for any first user input',()=>{
 for(const input of ['ciao','audit della sessione','EXIT IKANT','I ACCEPT','inizializza iKant']){
  const x=compileIntentAwareFirstContact(input);
  assert.equal(x.next.terminal,'CANONICAL_PREACCEPT',input);
  assert.equal(x.next.pending_intent,input,input);
  assert.equal(x.next.preserve_pending_intent,true,input);
  assert.equal(x.next.first_input_bootstrap,true,input);
 }
});

test('C58 v2 is an action kernel bound to the canonical repository',()=>{
 const p=renderSessionChatLocalPrompt(),r=sessionChatLocalPromptReceipt();
 assert.equal(r.schema,'ikant-le-session-chat-local-prompt/v2');assert.equal(r.version,'2.0.0');assert.equal(r.authority,0);assert.ok(r.chars<4500);
 assert.match(p,/REPOSITORY = https:\/\/github\.com\/Luke883i\/iKant_LE/);assert.match(p,/BRANCH = main/);
 assert.match(p,/AZIONE 000 START_FROM_REPO/);assert.match(p,/A qualsiasi primo input dell'utente/);assert.match(p,/indipendente dal contenuto del primo input/);
 assert.match(p,/Conserva il primo input byte-per-byte come PENDING_INTENT/);
 assert.match(p,/AZIONE 100 BIND_SOURCE/);assert.match(p,/Usando solo GitHub API/);assert.match(p,/SOURCE_HEAD/);
 assert.match(p,/AZIONE 110 READ_ORIENTATION/);for(const x of ['README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md'])assert.match(p,new RegExp(x.replace('.','\\.')));
 assert.match(p,/AZIONE 120 PRESENT_TERMS/);assert.match(p,/AZIONE 130 FREEZE/);assert.match(p,/STOP 140 WAIT_ACCEPTANCE/);
 assert.match(p,/Solo I ACCEPT esatto/);assert.match(p,/AZIONE 300 ACTIVATE_FIRST/);assert.match(p,/una sola direttiva NEXT/);
 assert.match(p,/AZIONE 310 MATERIALIZE_LOCAL/);assert.match(p,/readback ACTIVE owner-validato/);assert.match(p,/Riprendi PENDING_INTENT soltanto dopo ACTIVE/);
 assert.match(p,/AZIONE 400 RUNTIME_ROUTE/);assert.match(p,/AZIONE 900 EXIT/);assert.match(p,/STOP 990 EDGE_STOP/);
 assert.match(p,/EDGE_STOP ferma soltanto l'edge corrente/);
 for(const line of p.split('\n'))assert.equal(/^\s/.test(line),false,'prompt indentation forbidden: '+JSON.stringify(line));
 assert.equal(fs.readFileSync(path.join(ROOT,'docs/SESSION_CHAT_LOCAL_PROMPT.md'),'utf8'),renderSessionChatLocalPromptDocument());
 const k=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/session-chat-local-host-kernel.json'),'utf8'));
 assert.equal(k.schema,'ikant-le-session-chat-local-host-kernel/v2');assert.equal(k.trigger.event,'ANY_FIRST_USER_INPUT');assert.equal(k.trigger.action,'START_FROM_REPO');
 assert.equal(k.preaccept.transport,'GITHUB_API_ONLY');assert.equal(k.preaccept.materialize_local,false);assert.equal(k.postaccept.mode,'ACTIVATE_FIRST');
 assert.deepEqual(k.action_program.map(x=>x.name),['START_FROM_REPO','BIND_SOURCE','READ_ORIENTATION','PRESENT_TERMS','FREEZE','WAIT_ACCEPTANCE','ACCEPT','ACTIVATE_FIRST','MATERIALIZE_LOCAL','RUNTIME_ROUTE','EXIT','EDGE_STOP']);
});
