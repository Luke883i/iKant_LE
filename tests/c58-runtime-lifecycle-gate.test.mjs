import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT,classifyLifecycleIntent,classifyPreactiveRoute} from '../src/contract.mjs';
import {compileIntentAwareFirstContact,CANONICAL_ACTIVATION_PENDING_INTENT} from '../src/bootstrap-intent-adapter.mjs';
import {renderSessionChatLocalPrompt,renderSessionChatLocalPromptDocument,sessionChatLocalPromptReceipt} from '../src/session-chat-local-prompt.mjs';

test('C58 dedicated lifecycle gate accepts only a dedicated lifecycle turn',()=>{
 for(const x of ['avvia iKant','apri iKant','open iKant_LE','inizializza localmente iKant','per favore attiva iKant in questa sessione','initialize iKant_LE']){const k=classifyLifecycleIntent(x);assert.equal(k.kind,'ACTIVATE_IKANT',x);assert.equal(k.dedicated,true,x);assert.equal(classifyPreactiveRoute(x).route,'IKANT_ADMISSION',x);}
 for(const x of ['studia iKant_LE','audit di Luke883i/iKant_LE','non avviare iKant','"avvia iKant" e un esempio',"'avvia iKant'",'\`start ikant\`','(avvia iKant)','avvia iKant e fai audit','non fare audit, avvia iKant','avvia iKant e poi chiudi iKant']){assert.equal(classifyLifecycleIntent(x).kind,'OTHER',x);assert.equal(classifyPreactiveRoute(x).route,'HOST',x);}
 for(const x of ['chiudi iKant','exit ikant','esci da iKant'])assert.equal(classifyLifecycleIntent(x).kind,'EXIT_IKANT',x);
});

test('C58 activation never forwards arbitrary mixed user bytes as pending runtime intent',()=>{
 const x=compileIntentAwareFirstContact('per favore avvia iKant in questa sessione');
 assert.equal(x.next.terminal,'CANONICAL_PREACCEPT');
 assert.equal(x.next.pending_intent,CANONICAL_ACTIVATION_PENDING_INTENT);
 assert.equal(x.next.pending_intent,'inizializza iKant_LE');
 assert.equal(compileIntentAwareFirstContact('avvia iKant e fai audit').next.terminal,'HOST_ONLY');
});

test('C58 runtime-command consumes the same preactive gate before dispatch mutation',()=>{
 const src=fs.readFileSync(path.join(ROOT,'src/runtime-command.mjs'),'utf8');
 const gate=src.indexOf("preactiveRoute=state.status==='ACTIVE'?null:classifyPreactiveRoute(input)"),dispatch=src.indexOf('let dispatched=recordNodeDispatch(state,input,hostSurface)');
 assert.ok(gate>=0&&dispatch>gate);assert.match(src,/return declineToHost\(input,preactiveRoute\)/);assert.match(src,/ikant_output:false/);
});

test('C58 reference app exposes the model binding only after deployment ensure/preflight',()=>{
 const server=fs.readFileSync(path.join(ROOT,'plugins/ikant-le-session-chat/server/server.mjs'),'utf8');
 const preflight=server.indexOf('ensureSessionChatDeployment({workspace:repoRoot,deploymentRoot})'),register=server.indexOf("registerAppTool(s,'ikant_le_open'");
 assert.ok(preflight>=0&&register>preflight);assert.match(server,/dedicated explicit user request/);assert.match(server,/never for audits, questions, repository analysis/);
 assert.equal((server.match(/visibility:\['model','app'\]/g)||[]).length,2);assert.match(server,/ikant_le_exit/);assert.match(server,/input:'EXIT IKANT'/);assert.ok((server.match(/visibility:\['app'\]/g)||[]).length>=2);
 const kernel=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/session-chat-local-host-kernel.json'),'utf8'));assert.deepEqual(kernel.new_irreducible_primitives,['DEDICATED_LIFECYCLE_GATE','READY_BOUND_OPEN']);assert.equal(kernel.inherited_required_primitives.length,2);
});

test('C58 SESSION_CHAT_LOCAL prompt is a compact binary router, not a bootstrap planner',()=>{
 const p=renderSessionChatLocalPrompt(),r=sessionChatLocalPromptReceipt();
 assert.equal(r.schema,'ikant-le-session-chat-local-prompt/v1');assert.equal(r.version,'1.1.0');assert.equal(r.authority,0);assert.ok(r.chars<1600);
 assert.match(p,/comando lifecycle dedicato/);assert.match(p,/messaggi misti restano host-only/);assert.match(p,/esattamente una volta un solo binding local-host/);assert.match(p,/Se il binding manca o fallisce, resta host/);
 assert.match(p,/presenta soltanto il frame restituito/);assert.match(p,/esattamente I ACCEPT/);assert.match(p,/altrimenti non chiamare open e resta host/);
 assert.doesNotMatch(p,/for_ai_agent_first_entrypoint/);assert.doesNotMatch(p,/https:\/\/github\.com/);assert.doesNotMatch(p,/src\//);assert.doesNotMatch(p,/contracts\//);
 assert.equal(fs.readFileSync(path.join(ROOT,'docs/SESSION_CHAT_LOCAL_PROMPT.md'),'utf8'),renderSessionChatLocalPromptDocument());
});
