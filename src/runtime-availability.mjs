import {DEADLINE_RESULT,isDeadlineTerminal} from './deadline-integrity.mjs';
const SESSION_STATES=new Set(['DISCOVERED','ORIENTING','AWAITING_ACCEPTANCE','ACTIVATING','DEGRADED','ADMISSION_EPOCH_UNRECOVERABLE','BLOCKED_INTEGRITY','ACTIVE','SESSION_NONCONFORMING','EXITED']);
const INTEGRITY_CODES=new Set(['SOURCE_MISMATCH','CONSENT_INVALID','TRANSFER_IDENTITY_MISMATCH','MATERIALIZATION_MISMATCH','RECEIPT_TAMPER','MODEL_MEDIATED_BYTES','UNSAFE_ARCHIVE','TRANSFER_BINDING_MISMATCH','ACCEPTANCE_BINDING_MISMATCH']);
const DEGRADED_ORDER=['EVIDENCE_UNAVAILABLE','BYTE_BRIDGE_UNAVAILABLE','LOCAL_ROOT_UNAVAILABLE','HOST_CAPABILITY_UNAVAILABLE','WRITER_UNAVAILABLE','ACTIVE_COMMIT_UNAVAILABLE'];
const CAUSE={
 EVIDENCE_UNAVAILABLE:{what:'manca evidenza non temporale sufficiente per completare il bootstrap',lost:['attivazione iKant','garanzie runtime'],next:'fornire evidenza source-bound completa'},
 BYTE_BRIDGE_UNAVAILABLE:{what:'manca un percorso byte-esatto tra il carrier verificato e il filesystem locale',lost:['materializzazione runtime','attivazione iKant'],next:'esporre un bridge con readback locale o una warm cache esatta'},
 LOCAL_ROOT_UNAVAILABLE:{what:'i byte sono identificati ma il runtime locale non e materializzato e riaperto',lost:['esecuzione runtime','persistenza garantita'],next:'completare materializzazione atomica e reopen'},
 HOST_CAPABILITY_UNAVAILABLE:{what:'l host non dimostra una capacita runtime obbligatoria',lost:['esecuzione conforme','garanzie operative'],next:'ripristinare Node/FS/SHA-256/clock/artifact sink richiesti'},
 WRITER_UNAVAILABLE:{what:'il writer persistente non e disponibile o non supera il readback',lost:['continuita di stato','commit affidabile'],next:'ripristinare single-writer e readback'},
 ACTIVE_COMMIT_UNAVAILABLE:{what:'le verifiche precedenti sono passate ma il commit ACTIVE non e stato persistito e riletto',lost:['stato ACTIVE'],next:'completare il commit single-writer con readback'}
};
const DEADLINE_TEXT={
 [DEADLINE_RESULT.ORIGIN_UNAVAILABLE]:'manca la prova originaria monotona del primo I ACCEPT',
 [DEADLINE_RESULT.ORIGIN_INVALID]:'la prova di origine temporale esiste ma non supera i binding richiesti',
 [DEADLINE_RESULT.ELAPSED_UNAVAILABLE]:'l origine e presente ma manca un elapsed end-to-end valido',
 [DEADLINE_RESULT.EXCEEDED]:'la finestra end-to-end di attivazione e stata validamente osservata oltre 120000 ms'
};
function uniq(xs){return[...new Set(xs)];}
function firstCause(codes){for(const c of DEGRADED_ORDER)if(codes.includes(c))return c;return codes[0]||'EVIDENCE_UNAVAILABLE';}
function summaryFor(state,codes,preserved=[],deadlineResult=null){
 if(state==='ACTIVE')return'ACTIVE — runtime verificato, persistito e pronto al rilascio conforme.';
 if(state==='BLOCKED_INTEGRITY')return'BLOCKED_INTEGRITY — una prova contraddice fonte, consenso o identita dei byte; nessuna attivazione o fallback e consentito.';
 if(state==='SESSION_NONCONFORMING')return'SESSION_NONCONFORMING — la sessione ha violato un vincolo non sanabile retroattivamente; serve una nuova sessione conforme.';
 if(state==='ADMISSION_EPOCH_UNRECOVERABLE')return`ADMISSION_EPOCH_UNRECOVERABLE — ${DEADLINE_TEXT[deadlineResult]||'il gate temporale dell admission non e recuperabile in-place'}. Non garantito: ACTIVE conforme in questa admission. Recupero: nuova chat con nuova admission; non riusare il primo acceptance.`;
 if(state!=='DEGRADED')return`${state} — bootstrap non ancora concluso.`;
 const code=firstCause(codes),d=CAUSE[code]||CAUSE.EVIDENCE_UNAVAILABLE;const kept=preserved.length?` Verificato: ${preserved.join(', ')}.`:'';return`DEGRADED — ${d.what}.${kept} Non garantito: ${d.lost.join(', ')}. Recupero: ${d.next}.`;
}
export function classifyRuntimeAvailability(o={}){
 const integrity=uniq([...(o.integrity_codes||[])]).filter(x=>INTEGRITY_CODES.has(x));
 if(o.exited===true)return{schema:'ikant-le-runtime-availability/v1',state:'EXITED',active:false,runtime_like:false,degraded_codes:[],integrity_codes:[],deadline_result:null,fresh_chat_required:false,business_summary:summaryFor('EXITED',[]),authority:0};
 if(o.preaccept_breach===true)return{schema:'ikant-le-runtime-availability/v1',state:'SESSION_NONCONFORMING',active:false,runtime_like:false,degraded_codes:[],integrity_codes:['PREACCEPT_BREACH'],deadline_result:null,fresh_chat_required:true,business_summary:summaryFor('SESSION_NONCONFORMING',[]),authority:0};
 if(integrity.length)return{schema:'ikant-le-runtime-availability/v1',state:'BLOCKED_INTEGRITY',active:false,runtime_like:false,degraded_codes:[],integrity_codes:integrity,deadline_result:o.deadline_result||null,fresh_chat_required:true,business_summary:summaryFor('BLOCKED_INTEGRITY',integrity),authority:0};
 if(o.accepted!==true)return{schema:'ikant-le-runtime-availability/v1',state:o.terms_presented===true?'AWAITING_ACCEPTANCE':'ORIENTING',active:false,runtime_like:false,degraded_codes:[],integrity_codes:[],deadline_result:null,fresh_chat_required:false,business_summary:summaryFor(o.terms_presented===true?'AWAITING_ACCEPTANCE':'ORIENTING',[]),authority:0};
 if(isDeadlineTerminal(o.deadline_result))return{schema:'ikant-le-runtime-availability/v1',state:'ADMISSION_EPOCH_UNRECOVERABLE',active:false,runtime_like:false,degraded_codes:[],integrity_codes:[],deadline_result:o.deadline_result,fresh_chat_required:true,business_summary:summaryFor('ADMISSION_EPOCH_UNRECOVERABLE',[],[],o.deadline_result),authority:0};
 const missing=[];if(o.evidence_available===false)missing.push('EVIDENCE_UNAVAILABLE');if(o.byte_bridge===false)missing.push('BYTE_BRIDGE_UNAVAILABLE');if(o.local_root===false)missing.push('LOCAL_ROOT_UNAVAILABLE');if(o.host_probe===false)missing.push('HOST_CAPABILITY_UNAVAILABLE');if(o.writer===false)missing.push('WRITER_UNAVAILABLE');if(o.active_commit===false)missing.push('ACTIVE_COMMIT_UNAVAILABLE');
 const gates=['evidence_available','byte_bridge','local_root','host_probe','writer','active_commit'];
 if(missing.length){const preserved=[];if(o.source_bound===true)preserved.push('fonte');if(o.consent_valid===true)preserved.push('consenso');if(o.transfer_identity===true)preserved.push('identita byte');if(o.host_probe===true)preserved.push('capacita host');return{schema:'ikant-le-runtime-availability/v1',state:'DEGRADED',active:false,runtime_like:true,degraded_codes:uniq(missing),integrity_codes:[],deadline_result:o.deadline_result||null,fresh_chat_required:false,business_summary:summaryFor('DEGRADED',missing,preserved),authority:0};}
 const unknown=gates.some(k=>o[k]!==true)||o.deadline_result!==DEADLINE_RESULT.PASS;if(unknown||o.source_bound!==true||o.consent_valid!==true||o.transfer_identity!==true)return{schema:'ikant-le-runtime-availability/v1',state:'ACTIVATING',active:false,runtime_like:false,degraded_codes:[],integrity_codes:[],deadline_result:o.deadline_result||null,fresh_chat_required:false,business_summary:summaryFor('ACTIVATING',[]),authority:0};
 return{schema:'ikant-le-runtime-availability/v1',state:'ACTIVE',active:true,runtime_like:true,degraded_codes:[],integrity_codes:[],deadline_result:DEADLINE_RESULT.PASS,fresh_chat_required:false,business_summary:summaryFor('ACTIVE',[]),authority:0};
}
export function validateRuntimeAvailabilityDecision(d){const e=[];if(!d||d.schema!=='ikant-le-runtime-availability/v1')e.push('schema');if(!SESSION_STATES.has(d?.state))e.push('state');if(d?.authority!==0)e.push('authority');if(d?.active!==(d?.state==='ACTIVE'))e.push('active_truth');if(d?.state==='DEGRADED'&&(!d.runtime_like||!Array.isArray(d.degraded_codes)||d.degraded_codes.length<1))e.push('degraded_semantics');if(d?.state==='ADMISSION_EPOCH_UNRECOVERABLE'&&(!isDeadlineTerminal(d.deadline_result)||d.fresh_chat_required!==true))e.push('deadline_terminal_semantics');if(d?.state==='BLOCKED_INTEGRITY'&&(!Array.isArray(d.integrity_codes)||d.integrity_codes.length<1))e.push('integrity_semantics');if(typeof d?.business_summary!=='string'||d.business_summary.length<20||d.business_summary.length>700)e.push('business_summary');return{ok:e.length===0,errors:uniq(e)};}
export function availabilityFromBootstrapFailure({accepted=true,sourceBound=true,consentValid=true,evidenceValidation=null,probe=null,writer=true}={}){
 const errors=evidenceValidation?.errors||[],integrity=[];for(const x of errors){if(/acceptance_event_binding|acceptance_origin_receipt_binding/.test(x))integrity.push('ACCEPTANCE_BINDING_MISMATCH');else if(/source_head|runtime_root|receipt_digest|object_identity|object_set|model_mediated|archive_policy|transfer_binding|materialization:.*(?:source_head|runtime_root|loader|transfer_binding|receipt_digest)/.test(x))integrity.push(x.includes('model_mediated')?'MODEL_MEDIATED_BYTES':'TRANSFER_IDENTITY_MISMATCH');}
 const evidenceAbsent=!evidenceValidation||errors.includes('schema')||errors.includes('transfer:schema');const bridgeMissing=errors.some(x=>/bridge_observed|host_readback/.test(x));const localMissing=errors.some(x=>/^materialization:(schema|reopen|atomic_publish|member_count|source_bytes)$/.test(x));
 return classifyRuntimeAvailability({accepted,terms_presented:true,source_bound:sourceBound,consent_valid:consentValid,transfer_identity:integrity.length?false:true,evidence_available:evidenceAbsent?false:evidenceValidation?.ok===true,byte_bridge:bridgeMissing?false:evidenceValidation?.ok===true,local_root:localMissing?false:evidenceValidation?.ok===true,host_probe:probe?Boolean(probe.ok):evidenceValidation?.ok===true?null:null,writer,active_commit:null,deadline_result:evidenceValidation?.deadline_result||null,integrity_codes:integrity});
}
export function classifyTurnRelease(o={}){
 if(o.session_state!=='ACTIVE')return{schema:'ikant-le-turn-availability/v1',state:'IDLE',conforming_release:false,blocked_codes:[],authority:0};
 if(o.processing!==true)return{schema:'ikant-le-turn-availability/v1',state:'IDLE',conforming_release:false,blocked_codes:[],authority:0};
 const missing=[];if(o.artifact_written===false)missing.push('ARTIFACT_WRITE_UNAVAILABLE');if(o.artifact_readback===false)missing.push('ARTIFACT_READBACK_UNAVAILABLE');if(o.presented===false)missing.push('ARTIFACT_PRESENTATION_UNAVAILABLE');if(o.surface_a_released===true&&o.presented!==true)missing.push('SURFACE_A_RELEASE_ORDER_VIOLATION');
 if(missing.length||o.attempt_complete===true&&[o.artifact_written,o.artifact_readback,o.presented].some(x=>x!==true))return{schema:'ikant-le-turn-availability/v1',state:'RELEASE_BLOCKED',conforming_release:false,blocked_codes:uniq(missing.length?missing:['ARTIFACT_DELIVERY_INCOMPLETE']),authority:0};
 if(o.artifact_written===true&&o.artifact_readback===true&&o.presented===true&&o.surface_a_released===true)return{schema:'ikant-le-turn-availability/v1',state:'RELEASED',conforming_release:true,blocked_codes:[],authority:0};
 return{schema:'ikant-le-turn-availability/v1',state:'PROCESSING',conforming_release:false,blocked_codes:[],authority:0};
}
