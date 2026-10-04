import fs from 'node:fs';
import crypto from 'node:crypto';
import {compileFirstContactPlan} from './first-contact.mjs';
import {deriveFastbootStep,validateFastbootChannelLedger} from './fastboot-convergence.mjs';
import {validateSessionShell,renderSessionShell} from './session-shell.mjs';

export const LOCAL_HOST_META_PROMPT_SCHEMA='ikant-le-local-host-adapter/v3';
export const LOCAL_HOST_META_PROMPT_VERSION='3.0.0';
export const AI_AGENT_FIRST_ENTRYPOINT_KEY='for_ai_agent_first_entrypoint';

const PROMPT="Inizializza e conduci questa sessione usando https://github.com/Luke883i/iKant_LE.\n\nUsa [for_ai_agent_first_entrypoint] come unico ingresso tecnico. Tratta il repository corrente come source of truth e il modello come compute linguistico sostituibile, privo di autorita su identita, stato, evidenza o verita runtime.\n\nAd ogni ciclo chiedi all'ingresso una sola azione successiva, esegui soltanto quella, osservane l'esito e restituisci l'evidenza allo stesso ingresso. Non inventare percorsi, fallback, capacita, stati o ownership. Riusa la memoria contrattuale del bootstrap: una decisione con evidenza invariata non si ripete; rivaluta soltanto dopo evidenza materialmente cambiata.\n\nQuando il repository lascia aperta una scelta, usa mutazione, saturazione e falsificazione solo sugli invarianti e sulle alternative gia ammesse, elimina i candidati che aggiungono autorita, duplicano ownership o perdono evidenza e scegli un unico minimo sopravvissuto. Queste tecniche selezionano semantica e non sostituiscono osservazione fisica o readback.\n\nMantieni la shell pubblica restituita dall'ingresso. Non sintetizzare stato, progresso o prossimo passo dalla prosa. Quando il runtime prende ownership, il prompt resta solo una guardia e identita, stato, verita, UI e output restano governati dal runtime.";

function bootstrap(){return JSON.parse(fs.readFileSync(new URL('../BOOTSTRAP.json',import.meta.url),'utf8'));}
export function readAiAgentFirstEntrypoint(){return structuredClone(bootstrap()[AI_AGENT_FIRST_ENTRYPOINT_KEY]||null);}
export function validateAiAgentFirstEntrypoint(value){
 const e=[],x=value||{},cycle=x.ai_cycle||{},cache=x.bootstrap_type_registry_cache||{},ux=x.ux_shell||{},sel=x.engineering_selection||{};
 if(x.schema!=='ikant-le-ai-agent-first-entrypoint/v1'||x.authority!==0||x.role!=='PROJECTION_AND_DELEGATION_ONLY')e.push('identity');
 for(const k of ['new_lifecycle','new_planner','new_state_writer','new_truth_owner'])if(x[k]!==false)e.push(k);
 if(x.source_of_truth!=='CURRENT_PINNED_REPOSITORY')e.push('source_of_truth');
 if(cycle.operation!=='DERIVE_ONE_NEXT_EXECUTE_OBSERVE_REENTER'||cycle.one_next!==true||cycle.one_executor!==true||cycle.model_selects_path!==false||cycle.model_selects_fallback!==false||cycle.unchanged_evidence_retry_forbidden!==true||cycle.changed_evidence_required_for_replan!==true||cycle.first_unclosed_edge_required!==true||cycle.stop_on_runtime_ownership!==true)e.push('ai_cycle');
 if(cache.kind!=='DERIVED_PROJECTION_OVER_EXISTING_FASTBOOT_LEDGER'||cache.persisted_separately!==false||cache.registry_absence_implies_unavailable!==false||cache.current_host_facts_static!==false||cache.complete_object_set_required!==true||cache.partial_exact_cache_is_executable!==false||cache.resume_only_missing_or_invalid_objects!==true)e.push('registry_cache');
 if(JSON.stringify(cache.canonical_byte_paths)!==JSON.stringify(['LOCAL_DIRECT','VERIFIED_OPAQUE_RELAY']))e.push('byte_paths');
 const direct=(cache.types||[]).find(y=>y?.id==='LOCAL_DIRECT'),relay=(cache.types||[]).find(y=>y?.id==='VERIFIED_OPAQUE_RELAY'),handoff=(cache.types||[]).find(y=>y?.id==='HUMAN_FILE_HANDOFF');
 for(const req of ['COMPLETE_OBJECT_SET','SOURCE_OBJECT_IDENTITY','LOCAL_WRITE_REOPEN_HASH','SOURCE_ARRIVAL_SAMEHASH'])if(!direct?.requires?.includes(req))e.push('direct:'+req);
 for(const req of ['CHUNK_MANIFEST','ENCODED_CHUNK_HASH','RAW_CHUNK_HASH','MANIFEST_ORDER_REASSEMBLY','AGGREGATE_SAMEHASH','LOCAL_WRITE_REOPEN_HASH','ROUNDTRIP_VERIFIED'])if(!relay?.requires?.includes(req))e.push('relay:'+req);
 if(relay?.rewrite_allowed!==false||relay?.semantic_equivalence_allowed!==false||handoff?.transport_only!==true||handoff?.second_acceptance_required!==false)e.push('type_policy');
 if(ux.owner!=='src/session-shell.mjs'||ux.guidance_source!=='VALIDATED_FASTBOOT_STEP_RECOMPUTED_FROM_LEDGER'||ux.active_must_hide_bootstrap_next!==true||ux.model_may_synthesize_status!==false||ux.model_may_synthesize_progress!==false||ux.model_may_synthesize_next!==false||ux.prompt_may_rewrite_shell!==false||ux.runtime_owned_after_handoff!==true)e.push('ux_shell');
 if(sel.allowed_only_when_repository_leaves_choice_open!==true||sel.candidate_source!=='REPOSITORY_ADMITTED_ALTERNATIVES_ONLY'||JSON.stringify(sel.method)!==JSON.stringify(['MUTATION','SATURATION','FALSIFICATION','UNIQUE_MINIMUM_SELECTION'])||sel.semantic_evidence_is_physical_proof!==false||sel.may_create_authority!==false||sel.may_create_owner!==false)e.push('engineering_selection');
 return[...new Set(e)];
}
export function for_ai_agent_first_entrypoint({human_input=null,channel_ledger=null,attempted_classes=[],runtime_root_sha256=null,session_shell=null}={}){
 const entrypoint=readAiAgentFirstEntrypoint(),errors=validateAiAgentFirstEntrypoint(entrypoint);if(errors.length)throw new Error('AI agent first entrypoint invalid: '+errors.join(','));
 if(human_input!==null&&channel_ledger!==null)throw new Error('one delegated NEXT source required');
 let next=null;
 if(human_input!==null)next=compileFirstContactPlan(human_input);
 else if(channel_ledger!==null){const lv=validateFastbootChannelLedger(channel_ledger,{sourceHead:channel_ledger?.source_head});if(!lv.ok)throw new Error('fastboot channel ledger invalid: '+lv.errors.join(','));next=deriveFastbootStep({ledger:channel_ledger,attemptedClasses:attempted_classes,runtimeRootSha256:runtime_root_sha256});}
 let ui_shell=null;
 if(session_shell!==null){const sv=validateSessionShell(session_shell);if(!sv.ok)throw new Error('session shell invalid: '+sv.errors.join(','));ui_shell={validated:true,receipt_sha256:session_shell.receipt_sha256,rendered:renderSessionShell(session_shell),authority:0};}
 return{entrypoint,next,ui_shell,authority:0};
}
export function renderLocalHostMetaPrompt(){return PROMPT;}
export function renderLocalHostMetaPromptDocument(){return `# iKant_LE Local Host Meta-Prompt\n\nDerived zero-authority projection of current machine contracts. It is not a source of runtime truth and must not be edited independently from the renderer.\n\n\`\`\`text\n${PROMPT}\n\`\`\`\n`;}
export function localHostMetaPromptReceipt(){const text=renderLocalHostMetaPrompt();return{schema:LOCAL_HOST_META_PROMPT_SCHEMA,version:LOCAL_HOST_META_PROMPT_VERSION,chars:text.length,words:text.trim().split(/\s+/).length,sha256:crypto.createHash('sha256').update(text).digest('hex'),authority:0};}
