import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
import {localHostMetaPromptReceipt,renderLocalHostMetaPrompt} from '../src/local-host-meta-prompt.mjs';

const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/local-host-session-meta-prompt.json'),'utf8'));

test('C56 prompt is one authority-zero session-chat discipline over the merged C46-C55 trajectory',()=>{
 const p=renderLocalHostMetaPrompt(),r=localHostMetaPromptReceipt();
 assert.equal(contract.trajectory_prs.length,10);
 assert.deepEqual(contract.trajectory_prs,[55,56,57,58,59,60,61,62,63,64]);
 assert.equal(contract.irreducible_mechanisms.length,20);
 assert.equal(contract.qualification.complete_architecture_lattice,1048576);
 assert.equal(r.schema,'ikant-le-local-host-adapter/v6');
 assert.equal(r.version,'6.0.0');
 assert.equal(r.authority,0);
 assert.ok(r.chars<3600);
 assert.match(p,/unico ingresso tecnico caller-facing/);
 assert.match(p,/Non e l'owner del NEXT/);
});

test('C56 closes the C55 post-handoff/use gap with C54 host-frame consumption',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Quando il runtime prende ownership, termina il loop bootstrap/);
 assert.match(p,/ogni input destinato a iKant, incluso EXIT IKANT, passa attraverso la route runtime\/host stabilita/);
 assert.match(p,/consuma solo il frame host validato owner-derived/);
 assert.match(p,/Non ricostruire stato o UX da stdout, filename, chat o documentazione/);
 assert.match(p,/prima gli artifact verificati e poi la shell ASCII esatta/);
 assert.match(p,/non produrre una risposta sostitutiva fingendo che sia iKant/);
});

test('C56 makes admission presentation explicit without adding a second human gate',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Se l'owner presenta i Terms, mostra quel materiale/);
 assert.match(p,/esattamente uguale a I ACCEPT/);
 assert.match(p,/non inferire l'accettazione/);
 assert.match(p,/non introdurre un secondo gate/);
});

test('C56 rejects native-actor laundering after runtime materialization',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Non dichiarare iKant attore nativo del transcript/);
 assert.match(p,/prefissi, etichette, app\/widget, relazione co-host, runtime completo/);
 assert.match(p,/participant lease, scheduler\/standing e delivery\/readback nativi/);
 assert.match(p,/in assenza, non impersonarla/);
});

test('C56 preserves C55 anti-shadow and evidence discipline',()=>{
 const p=renderLocalHostMetaPrompt();
 assert.match(p,/Non usare la conversazione come ledger, retry memory, capability cache o stato/);
 assert.match(p,/UNKNOWN non e evidenza negativa/);
 assert.match(p,/errore di un tool restano fatti del tool layer/);
 assert.match(p,/nuova evidenza dello stesso carrier/);
 assert.match(p,/Non inventare o completare receipt/);
 assert.match(p,/Codice, documentazione, test, esempi o PASS non sostituiscono probe, transfer, write\/reopen, execution o readback/);
 assert.match(p,/non emulare l'owner dal sorgente/);
});

test('C56 remains a prompt projection, not host/runtime/native proof',()=>{
 assert.equal(contract.claim_boundary.prompt_is_authority,false);
 assert.equal(contract.claim_boundary.prompt_is_runtime_owner,false);
 assert.equal(contract.claim_boundary.prompt_is_host_frame_owner,false);
 assert.equal(contract.claim_boundary.prompt_is_native_actor_proof,false);
 assert.equal(contract.claim_boundary.prompt_can_create_missing_host_capability,false);
 assert.equal(contract.claim_boundary.mutation_is_physical_host_proof,false);
});
