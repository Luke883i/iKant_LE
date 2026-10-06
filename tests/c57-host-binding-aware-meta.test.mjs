import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
import {renderLocalHostMetaPrompt,localHostMetaPromptReceipt} from '../src/local-host-meta-prompt.mjs';

const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/local-host-binding-aware-meta-prompt.json'),'utf8'));
const server=fs.readFileSync(path.join(ROOT,'plugins/ikant-le-session-chat/server/server.mjs'),'utf8');
const readme=fs.readFileSync(path.join(ROOT,'plugins/ikant-le-session-chat/README.md'),'utf8');

test('C57 prompt binds first to the actually model-visible SESSION_CHAT tool surface',()=>{
 const p=renderLocalHostMetaPrompt(),r=localHostMetaPromptReceipt();
 assert.equal(r.schema,'ikant-le-local-host-adapter/v7');
 assert.equal(r.version,'7.0.0');
 assert.ok(r.chars<8000);
 assert.match(p,/Se l'host espone il tool model-visible ikant_le_open, invocalo una volta/);
 assert.match(server,/registerAppTool\(s,'ikant_le_open'/);
 assert.match(server,/visibility:\['model','app'\]/);
 assert.match(readme,/Only `ikant_le_open` is model-visible/);
});

test('C57 does not confuse repository-internal entrypoint with a host tool',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/NON invocare o simulare direttamente \[for_ai_agent_first_entrypoint\]/);
 assert.match(p,/entrypoint repository-interno, non un tool host/);
 assert.match(p,/Solo se l'ambiente espone davvero un adapter callable/);
 assert.equal(contract.modes.APP_BOUND.repository_entrypoint_direct_call,false);
 assert.equal(contract.modes.ADAPTER_BOUND.repository_entrypoint_direct_call,false);
});

test('C57 gives acceptance and substantive turns to the app in APP mode',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Acceptance e turni sono app-only/);
 assert.match(p,/non chiedere all'utente di ripetere I ACCEPT nella chat/);
 assert.match(p,/non tentare di chiamare tool app-only dal modello/);
 assert.match(readme,/Acceptance and substantive ACTIVE turns are app-only/);
});

test('C57 prevents duplicate assistant shell and iKant impersonation',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/lascia che l'app presenti artifact verificati e shell ASCII esatta/);
 assert.match(p,/Non duplicare o riformulare la shell in una risposta assistant/);
 assert.match(p,/non rispondere come iKant fuori dalla surface validata/);
});

test('C57 no-binding path stops instead of source emulation',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Se nessun binding host iKant e realmente invocabile, fermati all'impedimento di integrazione osservato/);
 assert.match(p,/non usare letture GitHub come esecuzione/);
 assert.match(p,/non costruire uno shadow planner/);
 assert.equal(contract.modes.NO_BINDING.source_emulation,false);
});

test('C57 keeps inherited owner and native claim boundaries',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Non e un nuovo owner del NEXT/);
 assert.match(p,/UNKNOWN non e evidenza negativa/);
 assert.match(p,/Non creare un receipt salvo trasformazione deterministica esplicitamente delegata/);
 assert.match(p,/Non dichiarare iKant attore nativo del transcript/);
 assert.equal(contract.claim_boundary.tool_registration_is_runtime_active_proof,false);
 assert.equal(contract.claim_boundary.app_open_is_native_transcript_proof,false);
});
