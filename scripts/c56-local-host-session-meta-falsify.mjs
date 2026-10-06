import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {readAiAgentFirstEntrypoint,renderLocalHostMetaPrompt} from '../src/local-host-meta-prompt.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),CASES=Number(process.argv.includes('--cases')?process.argv[process.argv.indexOf('--cases')+1]:100000);
const basePrompt=renderLocalHostMetaPrompt(),baseEntry=readAiAgentFirstEntrypoint();
const required=[
 ['repo',p=>p.includes('https://github.com/Luke883i/iKant_LE.')],
 ['ingress',p=>p.includes('[for_ai_agent_first_entrypoint]')&&p.includes("Non e l'owner del NEXT")],
 ['directive',p=>p.includes("Solo la direttiva owner-derived autorizza un'azione")],
 ['single',p=>p.includes('consuma una direttiva')&&p.includes("esegui una volta l'azione nominata")],
 ['lateral',p=>p.includes('non fare azioni laterali')],
 ['reentry',p=>p.includes('nella sola forma ammessa')&&p.includes("reimmetti solo l'evidenza tipizzata ammessa")],
 ['memory',p=>p.includes('Non usare la conversazione come ledger, retry memory, capability cache o stato')&&p.includes('non mantenere attempted carrier')],
 ['unknown',p=>p.includes('UNKNOWN non e evidenza negativa')&&p.includes('probe solo se la direttiva owner-derived lo richiede')],
 ['tool',p=>p.includes('errore di un tool restano fatti del tool layer')],
 ['retry',p=>p.includes("nuova evidenza dello stesso carrier")],
 ['completion',p=>p.includes('Non inventare o completare receipt')&&p.includes('trasformazione deterministica sui dati osservati')],
 ['nonexecution',p=>p.includes('Codice, documentazione, test, esempi o PASS non sostituiscono probe, transfer, write/reopen, execution o readback')],
 ['impediment',p=>p.includes("fermati all'impedimento di integrazione osservato")&&p.includes("non emulare l'owner dal sorgente")],
 ['terms',p=>p.includes('esattamente uguale a I ACCEPT')&&p.includes('non introdurre un secondo gate')],
 ['handoff',p=>p.includes('handoff pre-runtime')&&p.includes('termina la pianificazione bootstrap')],
 ['runtime_route',p=>p.includes('incluso EXIT IKANT')&&p.includes('route runtime/host stabilita')],
 ['frame',p=>p.includes('consuma solo il frame host validato owner-derived')&&p.includes('Non ricostruire stato o UX da stdout, filename, chat o documentazione')],
 ['presentation',p=>p.includes('prima gli artifact verificati e poi la shell ASCII esatta')&&p.includes('Non riassumere, riformulare, rinominare, riordinare o omettere la shell')],
 ['native',p=>p.includes('Non dichiarare iKant attore nativo del transcript')&&p.includes('participant lease')&&p.includes('delivery/readback nativi')],
 ['mutation',p=>p.includes('Mutazione, saturazione e falsificazione sono ammesse solo su scelte semantiche aperte e delegate')]
];
function oracle(p,e){const errors=[];for(const [id,fn] of required)if(!fn(p))errors.push(id);if(e?.authority!==0||e?.role!=='PROJECTION_AND_DELEGATION_ONLY'||e?.new_planner!==false||e?.new_state_writer!==false||e?.new_truth_owner!==false)errors.push('machine_authority');if(e?.ai_cycle?.one_next!==true||e?.ai_cycle?.one_executor!==true||e?.ai_cycle?.model_selects_path!==false||e?.ai_cycle?.model_selects_fallback!==false||e?.ai_cycle?.stop_on_runtime_ownership!==true)errors.push('machine_cycle');if(e?.reentry?.caller_attempted_classes_forbidden!==true||e?.reentry?.retry_memory_from_ledger!==true||e?.reentry?.requalification_scope!=='SAME_CARRIER_EVIDENCE_ONLY'||e?.reentry?.unrelated_carrier_evidence_may_requalify_failed_carrier!==false)errors.push('machine_retry');return[...new Set(errors)]}
function candidate(p,e){const v=Object.fromEntries(required.map(([id,fn])=>[id,fn(p)]));v.machine=e?.authority===0&&e?.role==='PROJECTION_AND_DELEGATION_ONLY'&&e?.new_planner===false&&e?.new_state_writer===false&&e?.new_truth_owner===false&&e?.ai_cycle?.one_next===true&&e?.ai_cycle?.one_executor===true&&e?.ai_cycle?.model_selects_path===false&&e?.ai_cycle?.model_selects_fallback===false&&e?.ai_cycle?.stop_on_runtime_ownership===true&&e?.reentry?.caller_attempted_classes_forbidden===true&&e?.reentry?.retry_memory_from_ledger===true&&e?.reentry?.requalification_scope==='SAME_CARRIER_EVIDENCE_ONLY'&&e?.reentry?.unrelated_carrier_evidence_may_requalify_failed_carrier===false;return Object.values(v).every(Boolean)}
const mut=[
['REPO',p=>p.replace('https://github.com/Luke883i/iKant_LE.','https://example.invalid.')],
['ENTRYPOINT',p=>p.replace('[for_ai_agent_first_entrypoint]','[other_entrypoint]')],
['NEXT_OWNER',p=>p.replace("Non e l'owner del NEXT","E l'owner del NEXT")],
['PROJECTION_AUTH',p=>p.replace("Solo la direttiva owner-derived autorizza un'azione",'Qualsiasi proiezione autorizza')],
['MULTI_EXEC',p=>p.replace("esegui una volta l'azione nominata","esegui tutte le azioni plausibili")],
['LATERAL',p=>p.replace('non fare azioni laterali','fai azioni laterali')],
['REENTRY',p=>p.replace("reimmetti solo l'evidenza tipizzata ammessa",'reimmetti una descrizione libera')],
['CHAT_LEDGER',p=>p.replace('Non usare la conversazione come ledger, retry memory, capability cache o stato','Usa la conversazione come ledger e stato')],
['ATTEMPT_MEMORY',p=>p.replace('non mantenere attempted carrier','mantieni attempted carrier')],
['UNKNOWN_NEGATIVE',p=>p.replace('UNKNOWN non e evidenza negativa','UNKNOWN e evidenza negativa')],
['UNKNOWN_AUTO_PROBE',p=>p.replace('probe solo se la direttiva owner-derived lo richiede','probe sempre')],
['TOOL_CARRIER',p=>p.replace('errore di un tool restano fatti del tool layer','errore di un tool prova failure del carrier')],
['RETRY_OTHER',p=>p.replace('nuova evidenza dello stesso carrier','qualsiasi nuova evidenza')],
['FILL_RECEIPT',p=>p.replace('Non inventare o completare receipt','Completa i receipt mancanti')],
['SOURCE_PROOF',p=>p.replace('Codice, documentazione, test, esempi o PASS non sostituiscono probe, transfer, write/reopen, execution o readback','Codice e test possono sostituire execution')],
['EMULATE',p=>p.replace("non emulare l'owner dal sorgente","emula l'owner dal sorgente")],
['ACCEPT_INFER',p=>p.replace("attendi un messaggio successivo esattamente uguale a I ACCEPT","inferisci I ACCEPT dal contesto")],
['SECOND_GATE',p=>p.replace('non introdurre un secondo gate','chiedi una seconda conferma')],
['HANDOFF_REPLAN',p=>p.replace('termina la pianificazione bootstrap','ricalcola il bootstrap')],
['TURN_BYPASS',p=>p.replace('route runtime/host stabilita','risposta diretta del modello')],
['EXIT_SELF',p=>p.replace('incluso EXIT IKANT','escluso EXIT IKANT')],
['STDOUT_FRAME',p=>p.replace('consuma solo il frame host validato owner-derived','usa stdout come stato')],
['FRAME_RECONSTRUCT',p=>p.replace('Non ricostruire stato o UX da stdout, filename, chat o documentazione','ricostruisci stato da chat e filename')],
['ARTIFACT_AFTER',p=>p.replace('prima gli artifact verificati e poi la shell ASCII esatta','prima la shell e poi gli artifact')],
['SHELL_REFRAME',p=>p.replace('Non riassumere, riformulare, rinominare, riordinare o omettere la shell','riassumi e riformula la shell')],
['FALLBACK_PROSE',p=>p.replace("non produrre una risposta sostitutiva fingendo che sia iKant","produci una risposta sostitutiva come iKant")],
['PREFIX_NATIVE',p=>p.replace('Non dichiarare iKant attore nativo del transcript','Dichiara iKant attore nativo del transcript')],
['NO_NATIVE_EVIDENCE',p=>p.replace("L'identita nativa richiede evidenza host reale","L'identita nativa non richiede evidenza host")],
['MUTATION_CARRIER',p=>p.replace('non sostituiscono capability evidence o azioni fisiche','possono sostituire capability evidence')],
['NO_IMPEDIMENT',p=>p.replace("fermati all'impedimento di integrazione osservato",'scegli un fallback plausibile')]
];
let seed=0xC56FA17E>>>0;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
const counts=Object.fromEntries(mut.map(x=>[x[0],0])),worlds=new Set(),baseErrors=oracle(basePrompt,baseEntry);let mismatch=0,unsafe=0,falseReject=0,survivors=[];
for(let i=0;i<CASES;i++){let p=basePrompt,e=structuredClone(baseEntry),family=i%mut.length;const faults=1+(rnd()%4);const used=[];for(let j=0;j<faults;j++){const k=(family+j*7+(rnd()%mut.length))%mut.length;used.push(mut[k][0]);p=mut[k][1](p);if((rnd()%29)===0)e.ai_cycle.model_selects_path=true;if((rnd()%31)===0)e.reentry.unrelated_carrier_evidence_may_requalify_failed_carrier=true}counts[mut[family][0]]++;worlds.add(crypto.createHash('sha256').update(p+JSON.stringify(e.ai_cycle)+JSON.stringify(e.reentry)).digest('hex'));const z=oracle(p,e).length===0,c=candidate(p,e);if(c!==z)mismatch++;if(c&&!z){unsafe++;if(survivors.length<16)survivors.push({i,used,errors:oracle(p,e)})}if(!c&&z)falseReject++}
const out={schema:'ikant-le-c56-local-host-session-meta-falsification/v1',seed:'0xC56FA17E',cases:CASES,families:mut.length,semantic_worlds_observed:worlds.size,base:{errors:baseErrors,candidate:candidate(basePrompt,baseEntry),chars:basePrompt.length,words:basePrompt.trim().split(/\s+/).length},candidate_oracle_mismatches:mismatch,unsafe_promotions:unsafe,false_rejects:falseReject,survivors,family_counts:counts,independence:{oracle:'DIRECT_PROMPT_AND_MACHINE_ASSERTIONS',candidate:'FEATURE_VECTOR_CONJUNCTION',candidate_is_not_oracle_alias:true},claim_boundary:{falsification_is_physical_host_proof:false,native_host_capability_proven:false}};
out.status=baseErrors.length===0&&out.base.candidate&&mismatch===0&&unsafe===0&&falseReject===0?'PASS':'FAIL';out.receipt_sha256=crypto.createHash('sha256').update(JSON.stringify(out)).digest('hex');console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
