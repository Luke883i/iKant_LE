import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT,classifyLifecycleIntent,classifyPreactiveRoute} from '../src/contract.mjs';
import {compileIntentAwareFirstContact,CANONICAL_ACTIVATION_PENDING_INTENT} from '../src/bootstrap-intent-adapter.mjs';
import {renderSessionChatLocalPrompt,renderSessionChatLocalPromptDocument,sessionChatLocalPromptReceipt} from '../src/session-chat-local-prompt.mjs';

test('C58 dedicated lifecycle gate accepts only a dedicated lifecycle turn',()=>{
 for(const x of ['avvia iKant','apri iKant','open iKant_LE','inizializza localmente iKant','per favore attiva iKant in questa sessione','initialize iKant_LE']){const k=classifyLifecycleIntent(x);assert.equal(k.kind,'ACTIVATE_IKANT',x);assert.equal(k.dedicated,true,x);assert.equal(classifyPreactiveRoute(x).route,'IKANT_ADMISSION',x);}
 for(const x of ['studia iKant_LE','audit di Luke883i/iKant_LE','non avviare iKant','"avvia iKant" e un esempio',"'avvia iKant'",'`start ikant`','(avvia iKant)','avvia iKant e fai audit','non fare audit, avvia iKant','avvia iKant e poi chiudi iKant']){assert.equal(classifyLifecycleIntent(x).kind,'OTHER',x);assert.equal(classifyPreactiveRoute(x).route,'HOST',x);}
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

test('C58 reference app exposes lifecycle binding only after deployment ensure/preflight',()=>{
 const server=fs.readFileSync(path.join(ROOT,'plugins/ikant-le-session-chat/server/server.mjs'),'utf8');
 const preflight=server.indexOf('ensureSessionChatDeployment({workspace:repoRoot,deploymentRoot})'),register=server.indexOf("registerAppTool(s,'ikant_le_open'");
 assert.ok(preflight>=0&&register>preflight);assert.match(server,/dedicated explicit user request/);assert.match(server,/never for audits, questions, repository analysis/);
 assert.equal((server.match(/visibility:\['model','app'\]/g)||[]).length,2);assert.match(server,/ikant_le_exit/);assert.match(server,/input:'EXIT IKANT'/);assert.ok((server.match(/visibility:\['app'\]/g)||[]).length>=2);
 const kernel=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/session-chat-local-host-kernel.json'),'utf8'));
 assert.deepEqual(kernel.new_irreducible_primitives,['FIRST_INPUT_LOCAL_ENSURE','DEDICATED_LIFECYCLE_GATE','READY_BOUND_OPEN']);
 assert.equal(kernel.first_input_installation.repository,'https://github.com/Luke883i/iKant_LE');
 assert.equal(kernel.first_input_installation.mandatory_before_substantive_response,true);
});

test('C58 SESSION_CHAT_LOCAL prompt is flat, explicit and first-input deterministic',()=>{
 const p=renderSessionChatLocalPrompt(),r=sessionChatLocalPromptReceipt();
 assert.equal(r.schema,'ikant-le-session-chat-local-prompt/v1');assert.equal(r.version,'1.3.0');assert.equal(r.authority,0);assert.ok(r.chars<3200);
 assert.match(p,/IDENTITÀ\./);assert.match(p,/PRIMO INPUT\./);assert.match(p,/PERIMETRO\./);assert.match(p,/OPEN\./);assert.match(p,/EXIT\./);assert.match(p,/HANDOFF\./);assert.match(p,/TERMS\./);assert.match(p,/RUNTIME\./);assert.match(p,/CONTROLLI NEGATIVI\./);assert.match(p,/STOP\./);
 assert.match(p,/A seguito di qualsiasi primo input/);assert.match(p,/https:\/\/github\.com\/Luke883i\/iKant_LE/);assert.match(p,/Esegui ENSURE_LOCAL una sola volta per sessione/);assert.match(p,/Conserva il primo input esattamente/);assert.match(p,/ENSURE_LOCAL non equivale a OPEN/);
 assert.match(p,/classificalo HOST_ONLY/);assert.match(p,/esegui OPEN una sola volta/);assert.match(p,/esegui EXIT una sola volta/);assert.match(p,/ALTRIMENTI resta host/);
 assert.match(p,/usa soltanto il frame validato restituito/);assert.match(p,/esattamente I ACCEPT/);assert.match(p,/Non usare OPEN come fallback/);
 for(const line of p.split('\n'))assert.equal(/^\s/.test(line),false,'prompt indentation forbidden: '+JSON.stringify(line));
 assert.doesNotMatch(p,/for_ai_agent_first_entrypoint/);assert.doesNotMatch(p,/src\//);assert.doesNotMatch(p,/contracts\//);
 assert.equal(fs.readFileSync(path.join(ROOT,'docs/SESSION_CHAT_LOCAL_PROMPT.md'),'utf8'),renderSessionChatLocalPromptDocument());
});
