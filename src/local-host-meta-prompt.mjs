import fs from 'node:fs';
import crypto from 'node:crypto';
import {validateSessionShell,renderSessionShell} from './session-shell.mjs';
import {compileFirstContactPlan} from './first-contact.mjs';
import {deriveFastbootStep,validateFastbootChannelLedger} from './fastboot-convergence.mjs';

export const LOCAL_HOST_META_PROMPT_SCHEMA='ikant-le-local-host-adapter/v3';
export const LOCAL_HOST_META_PROMPT_VERSION='3.0.0';
export const AI_AGENT_FIRST_ENTRYPOINT_KEY='for_ai_agent_first_entrypoint';

const PROMPT=`Inizializza e conduci questa sessione usando https://github.com/Luke883i/iKant_LE.

Usa [for_ai_agent_first_entrypoint] come unico ingresso tecnico. Tratta il repository corrente come source of truth e te stesso come compute linguistico sostituibile, senza autorita su identita, stato, evidenza o verita runtime.

Ad ogni ciclo, chiedi all'ingresso una sola azione successiva, esegui soltanto quella, osservane l'esito e restituisci l'evidenza allo stesso ingresso. Non inventare percorsi, fallback, capacita, stati o ownership. Riusa la memoria contrattuale del bootstrap: non ripetere una decisione con evidenza invariata; rivaluta soltanto quando l'evidenza cambia materialmente.

Quando esistono alternative gia ammesse dal repository ma non ancora determinate, applica mutazione, saturazione e falsificazione in modo deterministico sugli invarianti gia posseduti dal repository; scarta ogni candidato che aggiunga autorita, duplichi ownership o perda evidenza e usa solo un minimo unico sopravvissuto. Queste tecniche selezionano semantica: non sostituiscono osservazione fisica o readback.

Mantieni la shell pubblica restituita dall'ingresso e non sintetizzare stato o progresso dalla prosa. Quando il runtime prende ownership, questo prompt diventa soltanto un vincolo di guardia: identita, stato, verita, UI e output restano governati dal runtime.`;

function bootstrap(){return JSON.parse(fs.readFileSync(new URL('../BOOTSTRAP.json',import.meta.url),'utf8'));}
export function readAiAgentFirstEntrypoint(){return structuredClone(bootstrap()[AI_AGENT_FIRST_ENTRYPOINT_KEY]||null);}
export function validateAiAgentFirstEntrypoint(value){
 const e=[],x=value||{},cycle=x.ai_cycle||{},cache=x.bootstrap_type_registry_cache||{},shell=x.ui_shell||{},sel=x.engineering_selection||{};
 if(x.schema!=='ikant-le-ai-agent-first-entrypoint/v1'||x.authority!==0)e.push('identity');
 if(x.role!=='PROJECTION_AND_DELEGATION_ONLY')e.push('role');
 for(const k of ['new_lifecycle','new_planner','new_state_writer','new_truth_owner'])if(x[k]!==false)e.push(k);
 if(x.source_of_truth!=='CURRENT_PINNED_REPOSITORY')e.push('source_of_truth');
 if(cycle.operation!=='DERIVE_ONE_NEXT_EXECUTE_OBSERVE_REENTER'||cycle.one_next!==true||cycle.one_executor!==true||cycle.model_selects_path!==false||cycle.model_selects_fallback!==false||cycle.unchanged_evidence_retry_forbidden!==true||cycle.changed_evidence_required_for_replan!==true||cycle.first_unclosed_edge_required!==true||cycle.stop_on_runtime_ownership!==true)e.push('ai_cycle');
 if(cache.kind!=='DERIVED_PROJECTION_OVER_EXISTING_FASTBOOT_LEDGER'||cache.persisted_separately!==false||cache.registry_absence_implies_unavailable!==false||cache.current_host_facts_static!==false||cache.complete_object_set_required!==true||cache.partial_exact_cache_is_executable!==false||cache.resume_only_missing_or_invalid_objects!==true)e.push('registry_cache');const shape=cache.record_shape||{},adapt=cache.progressive_adaptation||{};if(JSON.stringify(shape.required_fields)!==JSON.stringify(['bootstrap_type_id','source_head','decision_key','evidence_sha256','availability','verified_object_ids','missing_object_ids','failure_class','disposition'])||JSON.stringify(shape.availability_values)!==JSON.stringify(['UNKNOWN','AVAILABLE','UNAVAILABLE'])||shape.current_fact_source!=='VALIDATED_HOST_OR_RUNTIME_EVIDENCE_ONLY'||shape.separate_persistence!==false)e.push('registry_record_shape');if(adapt.UNKNOWN!=='PROBE_ONLY_OWNER_NAMED_CAPABILITY'||adapt.AVAILABLE!=='EXECUTE_OWNER_NAMED_PATH'||adapt.PARTIAL!=='RESUME_MISSING_OR_INVALID_OBJECTS_ONLY'||adapt.STABLE_FAILURE!=='DO_NOT_RETRY_REQUEST_NEXT_FROM_OWNER'||adapt.CHANGED_EVIDENCE!=='REENTER_ENTRYPOINT'||adapt.HUMAN_GESTURE!=='PRESENT_ONE_OWNER_NAMED_ACTION_AND_WAIT'||adapt.RUNTIME_OWNED!=='STOP_BOOTSTRAP_PLANNING_PRESENT_RUNTIME_SHELL')e.push('progressive_adaptation');
 if(JSON.stringify(cache.canonical_byte_paths)!==JSON.stringify(['LOCAL_DIRECT','VERIFIED_OPAQUE_RELAY']))e.push('byte_paths');
 const exact=(cache.types||[]).find(y=>y?.id==='EXACT_LOCAL'),relay=(cache.types||[]).find(y=>y?.id==='OPAQUE_TEXT_RELAY'),handoff=(cache.types||[]).find(y=>y?.id==='HUMAN_FILE_HANDOFF');
 if(exact?.canonical_byte_path!=='LOCAL_DIRECT'||relay?.canonical_byte_path!=='VERIFIED_OPAQUE_RELAY'||handoff?.canonical_byte_path!=='LOCAL_DIRECT'||handoff?.transport_only!==true||handoff?.second_acceptance_required!==false)e.push('bootstrap_types');
 for(const req of ['CHUNK_MANIFEST','ENCODED_CHUNK_HASH','RAW_CHUNK_HASH','MANIFEST_ORDER_REASSEMBLY','AGGREGATE_SAMEHASH','LOCAL_WRITE_REOPEN_HASH','ROUNDTRIP_VERIFIED'])if(!relay?.requires?.includes(req))e.push('relay:'+req);
 for(const req of ['COMPLETE_OBJECT_SET','SOURCE_OBJECT_IDENTITY','LOCAL_WRITE_REOPEN_HASH','SOURCE_ARRIVAL_SAMEHASH'])if(!exact?.requires?.includes(req))e.push('exact:'+req);
 if(!Array.isArray(cache.failure_taxonomy)||!cache.failure_taxonomy.includes('PARTIAL_EXACT_CACHE')||!cache.failure_taxonomy.includes('RELAY_AGGREGATE_SAMEHASH_MISMATCH')||!cache.failure_taxonomy.includes('UNCHANGED_EVIDENCE_RETRY_FORBIDDEN'))e.push('failure_taxonomy');
 if(shell.owner!=='src/session-shell.mjs'||shell.status_owner!=='src/runtime-availability.mjs#deriveActivationServiceTier'||shell.mode!=='VALIDATE_AND_PRESENT_OWNER_OUTPUT_ONLY'||shell.model_may_synthesize_status!==false||shell.model_may_synthesize_progress!==false||shell.prompt_may_rewrite_shell!==false||shell.runtime_owned_after_handoff!==true)e.push('ui_shell');
 if(sel.allowed_only_when_repository_leaves_choice_open!==true||sel.candidate_source!=='REPOSITORY_ADMITTED_ALTERNATIVES_ONLY'||JSON.stringify(sel.method)!==JSON.stringify(['MUTATION','SATURATION','FALSIFICATION','UNIQUE_MINIMUM_SELECTION'])||sel.semantic_evidence_is_physical_proof!==false||sel.may_create_authority!==false||sel.may_create_owner!==false)e.push('engineering_selection');
 return[...new Set(e)];
}
export function for_ai_agent_first_entrypoint({human_input=null,channel_ledger=null,attempted_classes=[],runtime_root_sha256=null,session_shell=null}={}){
 const entrypoint=readAiAgentFirstEntrypoint(),errors=validateAiAgentFirstEntrypoint(entrypoint);if(errors.length)throw new Error('AI agent first entrypoint invalid: '+errors.join(','));
 if(human_input!==null&&channel_ledger!==null)throw new Error('one delegated NEXT source required');
 let next=null;if(channel_ledger!==null){const lv=validateFastbootChannelLedger(channel_ledger,{sourceHead:channel_ledger?.source_head});if(!lv.ok)throw new Error('fastboot channel ledger invalid: '+lv.errors.join(','));next=deriveFastbootStep({ledger:channel_ledger,attemptedClasses:attempted_classes,runtimeRootSha256:runtime_root_sha256});}else if(human_input!==null)next=compileFirstContactPlan(human_input);
 let ui_shell=null;if(session_shell!==null){const shell=validateSessionShell(session_shell);if(!shell.ok)throw new Error('session shell invalid: '+shell.errors.join(','));ui_shell={validated:true,receipt_sha256:session_shell.receipt_sha256,rendered:renderSessionShell(session_shell),authority:0};}
 return{entrypoint,next,ui_shell};
}
export function renderLocalHostMetaPrompt(){return PROMPT;}
export function renderLocalHostMetaPromptDocument(){return `# iKant_LE Local Host Meta-Prompt\n\nDerived zero-authority projection of current machine contracts. It is not a source of runtime truth and must not be edited independently from the renderer.\n\n\`\`\`text\n${PROMPT}\n\`\`\`\n`;}
export function localHostMetaPromptReceipt(){const text=renderLocalHostMetaPrompt();return{schema:LOCAL_HOST_META_PROMPT_SCHEMA,version:LOCAL_HOST_META_PROMPT_VERSION,chars:text.length,words:text.trim().split(/\s+/).length,sha256:crypto.createHash('sha256').update(text).digest('hex'),authority:0};}
