import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdtempSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {issueC72V2LinkedTermsOffer,acceptC72V2LinkedTerms,presentC72V2Introduction,
 selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
import {oneShellFrame,renderOneShell,renderOneShellCompact} from '../host/project-oneshell-edu.mjs';
import {projectOneShellContinuation,closeOneShellOnHumanExit} from '../host/project-oneshell-continuity.mjs';
const head='a'.repeat(40);
const offer=issueC72V2LinkedTermsOffer({sourceHead:head,
 termsDigest:createHash('sha256').update('terms').digest('hex')});
const accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true});
const orientation=presentC72V2Introduction(accepted);
const selection=selectC72V2Mode({accepted,orientation,humanMessage:'EDU'});
const args={selection,sourceHead:head,liveHead:head,ownerStatus:{closed:false,busy:false,uncertain:false}};
test('compact renderer keeps six original fields and no user voice forgery',()=>{
 const f=oneShellFrame({esito:'PRONTO',b:'Breve descrizione HOST',prova:'sha256:123',edge:'UNKNOWN',next:'STOP'});
 const x=renderOneShellCompact(f);assert.equal(x.split('\n').length,6);
 assert(x.includes('Superficie A (iKant) | NO_VOICE'));
 assert(x.includes('Superficie B (HOST) | Breve descrizione HOST'));
 assert.equal(renderOneShell(f).replaceAll('\n\n','\n'),x);
 assert.deepEqual(f.slot_order,['ESITO','A','B','PROVA','EDGE','NEXT']);
 assert.throws(()=>renderOneShellCompact({...f,slots:{...f.slots,A:'I am iKant'}}));
});
test('exact human-only exit; all other input remains OneShell',()=>{
 for(const text of ['ciao','esci','EXIT IKANT!','please EXIT IKANT', ' EXIT IKANT', 'EXIT IKANT\n','"EXIT IKANT"',undefined]){
  assert.equal(projectOneShellContinuation({...args,humanInput:text,humanMessageObserved:true}).kind,'CONTINUE');
 }
 assert.equal(projectOneShellContinuation({...args,humanInput:'EXIT IKANT',humanMessageObserved:false}).kind,'STOP');
 assert.equal(projectOneShellContinuation({...args,humanInput:'EXIT IKANT',humanMessageObserved:true}).kind,'DELEGATE_EXIT');
 assert.equal(projectOneShellContinuation({...args,liveHead:'b'.repeat(40)}).edge,'STOP_SOURCE_LOCK_STALE');
 assert.equal(projectOneShellContinuation({...args,ownerStatus:null}).kind,'STOP');
 assert.equal(projectOneShellContinuation({...args,ownerStatus:{closed:true}}).kind,'STOP');
});
test('one owner close, local readback, next normal HOST turn only with exit evidence',async()=>{
 let closed=false,called=0;const owner={owner:'C135_EDU_V2',status:()=>({closed,busy:false,uncertain:false}),readSessionState:()=>({owner:'C135_EDU_V2',source_head:head,selection_receipt_sha256:selection.receipt_sha256,original_c87_readback:{status:'C107_LEDGER_REOPENED'}}),close:()=>{called++;closed=true;}};
 const file=join(mkdtempSync(join(tmpdir(),'oneshell-exit-')),'exit-projection.json');
 const r=await closeOneShellOnHumanExit({...args,humanInput:'EXIT IKANT',humanMessageObserved:true,
  originalSession:owner,evidenceFile:file});
 assert.equal(r.ok,true);assert.equal(called,1);assert.equal(r.shell,'HOST_CHATGPT');
 const raw=readFileSync(file,'utf8');assert.equal(JSON.parse(raw).human_input,'EXIT IKANT');
 assert.equal(r.evidence_sha256,createHash('sha256').update(raw).digest('hex'));
 const next=projectOneShellContinuation({...args,humanInput:'un nuovo argomento',
  ownerStatus:owner.status(),originalSession:owner,exitReadback:r.exitReadback});
 assert.equal(next.shell,'HOST_CHATGPT');assert.equal(next.kind,'EXIT_CONFIRMED');
 const reject=projectOneShellContinuation({...args,ownerStatus:owner.status(),originalSession:owner,
  exitReadback:{...r.exitReadback,host_observed_human_message:false}});
 assert.equal(reject.shell,'ONESHELL');
 const replay=await closeOneShellOnHumanExit({...args,humanInput:'EXIT IKANT',humanMessageObserved:true,originalSession:owner});
 assert.equal(replay.ok,false);assert.equal(called,1);
});
test('send/close UNKNOWN does not switch UI',async()=>{
 const stub={owner:'C135_EDU_V2',status:()=>({closed:false,busy:false,uncertain:false}),readSessionState:()=>({owner:'C135_EDU_V2',source_head:head,selection_receipt_sha256:selection.receipt_sha256,original_c87_readback:{status:'C107_LEDGER_REOPENED'}}),close:()=>{throw Error('UNKNOWN');}};
 const r=await closeOneShellOnHumanExit({...args,humanInput:'EXIT IKANT',humanMessageObserved:true,originalSession:stub});
 assert.equal(r.ok,false);assert.equal(r.shell,'ONESHELL');assert.match(r.edge,/UNKNOWN/);
});

test('forged source-locked exit ticket never changes shell without same-instance private issuance',()=>{
 const forged={schema:'ikant-le-host-exit-projection/v2',human_input:'EXIT IKANT',
 host_observed_human_message:true,source_head:head,closed:true,original_owner:'C135_EDU_V2',
 selection_receipt_sha256:selection.receipt_sha256};
 const owner={status:()=>({closed:true,busy:false,uncertain:false})};
 assert.equal(projectOneShellContinuation({...args,ownerStatus:owner.status(),originalSession:owner,exitReadback:forged}).kind,'STOP');
});
test('readback omitted or inconsistent must not call close',async()=>{
 let calls=0;const owner={owner:'C135_EDU_V2',status:()=>({closed:false,busy:false,uncertain:false}),
 readSessionState:()=>({owner:'C135_EDU_V2',source_head:'f'.repeat(40)}),close:()=>{calls++}};
 const r=await closeOneShellOnHumanExit({...args,humanInput:'EXIT IKANT',humanMessageObserved:true,originalSession:owner});
 assert.equal(r.ok,false);assert.equal(calls,0);assert.equal(r.edge,'ORIGINAL_C87_READBACK_BEFORE_EXIT_REQUIRED');
});
test('managed facade never exposes close, gates each turn on current main and exact exit',async()=>{
 const {bindManagedOneShellEdu}=await import('../host/project-oneshell-continuity.mjs');
 let closed=false,called=0,writes=0,live=head;
 const owner={owner:'C135_EDU_V2',status:()=>({closed,busy:false,uncertain:false}),
  readSessionState:()=>({owner:'C135_EDU_V2',source_head:head,
   selection_receipt_sha256:selection.receipt_sha256,original_c87_readback:{status:'C107_LEDGER_REOPENED'}}),
  publishTurn:async()=>{writes++;return oneShellFrame({esito:'EDU',b:'HOST'});},
  close:()=>{called++;closed=true;}};
 const managed=bindManagedOneShellEdu({selection,sourceHead:head,originalSession:owner,readMain:async()=>live});
 assert.equal(managed.close,undefined);
 assert.equal((await managed.routeHumanTurn({frame:{humanInput:'ciao'},humanMessageObserved:true})).ok,true);
 assert.equal(writes,1);assert.equal(called,0);
 live='f'.repeat(40);
 assert.equal((await managed.routeHumanTurn({frame:{humanInput:'EXIT IKANT'},humanMessageObserved:true})).edge,'STOP_SOURCE_LOCK_STALE');
 assert.equal(called,0);live=head;
 assert.equal((await managed.routeHumanTurn({frame:{humanInput:'EXIT IKANT'},humanMessageObserved:true})).edge,'EXIT_EVIDENCE_FILE_REQUIRED');
 assert.equal(called,0);
 const out=join(mkdtempSync(join(tmpdir(),'ikant-facade-')),'exit.json');
 const done=await managed.routeHumanTurn({frame:{humanInput:'EXIT IKANT'},humanMessageObserved:true,evidenceFile:out});
 assert.equal(done.ok,true);assert.equal(done.shell,'HOST_CHATGPT');assert.equal(called,1);
 assert.equal((await managed.routeHumanTurn({frame:{humanInput:'another'},humanMessageObserved:true})).edge,'IKANT_ALREADY_EXITED');
 assert.equal(called,1);assert.equal(writes,1);
});
