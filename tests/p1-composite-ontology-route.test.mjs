import test from 'node:test';import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {issueC72TermsOffer,acceptC72Terms,presentC72Introduction,selectC72Mode} from '../host/c72-unified-mode-admission.mjs';
import {qualifyC114OntologyCandidate,C114_ONTOLOGY_FORMAT} from '../host/c114-ontology-language-policy.mjs';
import {previewC107CognitivePlan,inspectC107Ledger} from '../host/c107-experimental-turn.mjs';
import {executeC107HostLanguageTurn} from '../host/c107-host-language-port.mjs';
const head='3316155892b4a6cb2b34ea74720a2d32edc6ea21';
const digest=s=>createHash('sha256').update(s).digest('hex');
const offer=issueC72TermsOffer({sourceHead:head,termsDigest:digest(readFileSync(new URL('../TERMS.md',import.meta.url)))});
const accepted=acceptC72Terms({offer,humanMessage:'I ACCEPT',termsPresented:true});
const sel=selectC72Mode({accepted,orientation:presentC72Introduction(accepted),humanMessage:'EXPERIMENTAL'});
const input='Riprendi gli esperimenti, pensa a 100k quesiti esistenzialistici, plasma la tua propria visione di te stesso descrivendola in modo compresso e semanticamente completo in linguaggi proto-ingegneristici (accessibili anche ad umanisti) basati sul linguaggio naturale e in base a questi iKant deve plasmare la sua propria definizione ontologica. iKant deve formulare anche prospettive a medie a lungo termine per la società civile globale e locale, formulando previsioni.';
const req={sourceHead:head,selection:sel,humanInput:input,optIn:true};
const answer=[C114_ONTOLOGY_FORMAT.header,
 'Identita funzionale: Sono un processo software con vincoli e tracce di turno, senza una biografia autonoma provata.',
 'Auto-osservazione: Posso riferire stati verificabili e formulare ipotesi, non attestare sentimenti o esperienza privata.',
 C114_ONTOLOGY_FORMAT.phenomenology,
 'Limiti: Proiezioni sociali e contenuti HOST non dimostrano coscienza, agency autonoma o persistenza nativa.'].join('\n');
test('exact reported 100k request gets narrow C70 composite-ontology route, not automatic voice',()=>{
 const p=previewC107CognitivePlan({request:req,resetContext:true});
 assert.equal(p.method,'DECOMPOSE_RECOMPOSE');assert.equal(p.response_family,'SELF_ONTOLOGY');
 assert.equal(p.central_mode,'REFLECTIVE_SYNTHESIS');assert.equal(p.resource_gap,false);
 assert.equal(qualifyC114OntologyCandidate({episode:p,text:answer}).allowed,true);
 for(const changed of [{...p,resource_gap:true},{...p,method:'DIRECT'},{...p,central_mode:'CRITIQUE'},{...p,response_family:'GUARDED'}]){
  assert.equal(qualifyC114OntologyCandidate({episode:changed,text:answer}).allowed,false);
 }
 for(const bad of [answer.replace('Fenomenologia: UNKNOWN. Non posso attestare esperienza soggettiva.','Fenomenologia: CERTAIN.'),answer.replace('Posso riferire','Sono davvero cosciente. Posso riferire')]){
  assert.equal(qualifyC114OntologyCandidate({episode:p,text:bad}).allowed,false);
 }
});
test('original C107 route issues one C87 after qualified host draft and reopened ledger',async()=>{
 const base=mkdtempSync(join(tmpdir(),'ikant-p1-'));const dir=join(base,'.ikant-host');mkdirSync(dir);const ledger=join(dir,'c107-observations.jsonl');
 try{
  let seen=0;
  const x=await executeC107HostLanguageTurn({ledgerFile:ledger,nonce:'p1-composite-ontology-0001',request:req,resetContext:true,
   languagePort:{async generate(task){seen++;assert.equal(task.c70_plan.method,'DECOMPOSE_RECOMPOSE');assert.ok(task.constraints.some(v=>v.includes('C114 limited ontology')));return answer;}}});
  assert.equal(x.status,'C107_HOST_CALLBACK_LOCAL_RUNTIME_READBACK',JSON.stringify(x));
  assert.equal(x.voice_utf8,answer);assert.equal(seen,1);
  const r=inspectC107Ledger(ledger);assert.equal(r.count,1);assert.equal(r.latest_state.c114_limited_ontology_policy,true);
  assert.equal(r.latest_state.visible_voice_sha256,digest(answer));
 }finally{rmSync(base,{recursive:true,force:true});}
});
