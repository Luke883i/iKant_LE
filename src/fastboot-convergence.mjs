import crypto from 'node:crypto';

export const FASTBOOT_CONVERGENCE_SCHEMA='ikant-le-fastboot-convergence/v1';
export const FASTBOOT_ATTEMPT_SCHEMA='ikant-le-fastboot-carrier-attempt/v1';
export const FASTBOOT_CARRIERS=Object.freeze([
  'WARM_CACHE_EXACT','HOST_FILE_BRIDGE','GITHUB_API_BASE64','GITHUB_GIT_BLOB_API','PINNED_GITHUB_ZIP','PINNED_PERMALINK'
]);
export const FASTBOOT_CAPABILITY_FIELDS=Object.freeze([
  'surface_supported','authenticated_source_fetch','byte_preserving_runtime_sink','runtime_materializer_bound','runtime_executor_bound'
]);
const HEX40=/^[a-f0-9]{40}$/;
const HEX64=/^[a-f0-9]{64}$/;
const sha256=x=>crypto.createHash('sha256').update(Buffer.from(typeof x==='string'?x:JSON.stringify(x))).digest('hex');
function withoutDigest(value){const x=structuredClone(value||{});delete x.receipt_sha256;return x;}
export function fastbootReceiptDigest(value){return sha256(withoutDigest(value));}
function uniq(a){return [...new Set(a)];}
function expectedObjects(d){return [{path:d?.loader?.path,blob_sha1:d?.loader?.blob_sha1},...(d?.shards||[]).map(s=>({path:s.path,blob_sha1:s.blob_sha1}))];}
function capState(value){
 if(value===true)return 'PROVEN';
 if(value===false)return 'UNAVAILABLE';
 if(!value||typeof value!=='object')return 'UNKNOWN';
 let unknown=false;
 for(const k of FASTBOOT_CAPABILITY_FIELDS){if(value[k]===false)return 'UNAVAILABLE';if(value[k]!==true)unknown=true;}
 return unknown?'UNKNOWN':'PROVEN';
}
export function selectFastbootCarrier({capabilities={},attemptedClasses=[]}={}){
 const attempted=new Set((attemptedClasses||[]).map(String));
 for(const carrier of FASTBOOT_CARRIERS){
   if(attempted.has(carrier))continue;
   if(capState(capabilities?.[carrier])==='PROVEN')return{schema:'ikant-le-fastboot-plan/v1',state:'EXECUTABLE',carrier,action:'EXECUTE_CARRIER_IN_RUNTIME_EXECUTION_PLANE',authority:0};
 }
 for(const carrier of FASTBOOT_CARRIERS){
   if(attempted.has(carrier)||attempted.has('PROBE:'+carrier))continue;
   if(capState(capabilities?.[carrier])==='UNKNOWN')return{schema:'ikant-le-fastboot-plan/v1',state:'PROBE_REQUIRED',carrier,action:'PROBE_RUNTIME_EXECUTION_PLANE_EDGE',next_attempt_class:'PROBE:'+carrier,authority:0};
 }
 return{schema:'ikant-le-fastboot-plan/v1',state:'EXHAUSTED',carrier:null,action:'HOST_UNAVAILABLE',authority:0};
}
export function validateFastbootAttempt(attempt,{sourceHead,runtimeRootSha256,runtimeRootDescriptor,acceptanceEventId,maxObjects=8}={}){
 const e=[];
 if(!attempt||attempt.schema!==FASTBOOT_ATTEMPT_SCHEMA)e.push('schema');
 if(attempt?.authority!==0)e.push('authority');
 if(!FASTBOOT_CARRIERS.includes(attempt?.carrier))e.push('carrier');
 if(attempt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('source_head');
 if(attempt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('runtime_root');
 if(attempt?.acceptance_event_id!==acceptanceEventId||!String(acceptanceEventId||''))e.push('acceptance_event');
 if(!['FAILED','PARTIAL','COMPLETE'].includes(attempt?.result))e.push('result');
 if(attempt?.model_mediated_bytes!==false)e.push('model_mediated_bytes');
 if(attempt?.authoritative_remote_history!==false)e.push('authoritative_history');
 if(attempt?.committed_remote_rounds!==0)e.push('committed_remote_rounds');
 if(!Number.isInteger(attempt?.remote_reads)||attempt.remote_reads<0)e.push('remote_reads');
 if(!Number.isInteger(attempt?.bytes_observed)||attempt.bytes_observed<0)e.push('bytes_observed');
 const exp=new Map(expectedObjects(runtimeRootDescriptor).map(x=>[x.path,x]));
 const rows=Array.isArray(attempt?.remote_objects)?attempt.remote_objects:[];
 if(exp.size<2||exp.size>maxObjects)e.push('descriptor');
 if(rows.length>exp.size)e.push('object_count');
 const seen=new Set();
 for(const r of rows){const x=exp.get(r?.path);if(!x||seen.has(r.path)){e.push('object_set');continue;}seen.add(r.path);if(r.blob_sha1!==x.blob_sha1||!HEX64.test(String(r.sha256||''))||!Number.isInteger(r.bytes)||r.bytes<1)e.push('object_identity');}
 if(attempt?.result==='PARTIAL'&&(rows.length<1||rows.length>=exp.size))e.push('partial_cardinality');
 if(attempt?.result==='FAILED'&&rows.length>=exp.size)e.push('failed_cardinality');
 if(attempt?.result==='COMPLETE'){
   if(rows.length!==exp.size)e.push('complete_cardinality');
   if(attempt?.source_fetch_observed!==true)e.push('source_fetch_observed');
   if(attempt?.byte_preserving_runtime_sink_observed!==true)e.push('runtime_sink_observed');
   if(attempt?.runtime_materializer_bound!==true)e.push('materializer_bound');
   if(attempt?.runtime_executor_bound!==true)e.push('executor_bound');
   if(!String(attempt?.source_object_identity||''))e.push('source_object_identity');
   if(!String(attempt?.runtime_sink_object_id||''))e.push('runtime_sink_object_id');
   if(!HEX64.test(String(attempt?.transfer_receipt_sha256||'')))e.push('transfer_receipt');
 }else{
   if(attempt?.transfer_receipt_sha256!=null)e.push('premature_transfer_receipt');
 }
 if(!HEX64.test(String(attempt?.receipt_sha256||''))||fastbootReceiptDigest(attempt)!==attempt.receipt_sha256)e.push('receipt_digest');
 return{ok:e.length===0,errors:uniq(e),complete:e.length===0&&attempt?.result==='COMPLETE',carrier:attempt?.carrier||null,receipt_sha256:attempt?.receipt_sha256||null};
}
export function validateFastbootConvergence(receipt,{sourceHead,runtimeRootSha256,runtimeRootDescriptor,acceptanceEventId,transferReceiptSha256,maxAttempts=FASTBOOT_CARRIERS.length}={}){
 const e=[];
 if(!receipt||receipt.schema!==FASTBOOT_CONVERGENCE_SCHEMA)e.push('schema');
 if(receipt?.authority!==0)e.push('authority');
 if(receipt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('source_head');
 if(receipt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('runtime_root');
 if(receipt?.acceptance_event_id!==acceptanceEventId||!String(acceptanceEventId||''))e.push('acceptance_event');
 if(receipt?.acceptance_preserved!==true)e.push('acceptance_preserved');
 if(receipt?.source_preserved!==true)e.push('source_preserved');
 if(receipt?.deadline_origin_preserved!==true)e.push('deadline_origin_preserved');
 if(receipt?.model_mediated_bytes!==false)e.push('model_mediated_bytes');
 if(receipt?.remote_history_commits!==1)e.push('remote_history_commits');
 const attempts=Array.isArray(receipt?.attempts)?receipt.attempts:[];
 if(attempts.length<1||attempts.length>maxAttempts)e.push('attempt_count');
 const carriers=new Set();let completeIndex=-1,completeCount=0,complete=null;
 for(let i=0;i<attempts.length;i++){
   const a=attempts[i],v=validateFastbootAttempt(a,{sourceHead,runtimeRootSha256,runtimeRootDescriptor,acceptanceEventId});
   if(!v.ok)e.push(...v.errors.map(x=>'attempt:'+i+':'+x));
   if(carriers.has(a?.carrier))e.push('materially_distinct_retry');else carriers.add(a?.carrier);
   if(a?.result==='COMPLETE'){completeIndex=i;completeCount++;complete=a;}
 }
 if(completeCount!==1)e.push('complete_attempt_count');
 if(completeIndex!==attempts.length-1)e.push('complete_attempt_must_be_last');
 if(attempts.length>1&&receipt?.materially_distinct_retry!==true)e.push('retry_binding');
 if(attempts.length===1&&receipt?.materially_distinct_retry!==false)e.push('retry_binding');
 if(complete?.carrier!==receipt?.selected_carrier)e.push('selected_carrier');
 if(complete?.transfer_receipt_sha256!==transferReceiptSha256||receipt?.committed_transfer_receipt_sha256!==transferReceiptSha256||!HEX64.test(String(transferReceiptSha256||'')))e.push('transfer_commit_binding');
 if(!HEX64.test(String(receipt?.receipt_sha256||''))||fastbootReceiptDigest(receipt)!==receipt.receipt_sha256)e.push('receipt_digest');
 return{ok:e.length===0,errors:uniq(e),attempt_count:attempts.length,selected_carrier:receipt?.selected_carrier||null,committed_transfer_receipt_sha256:receipt?.committed_transfer_receipt_sha256||null};
}

// C22.LOCAL_SESSION_FASTBOOT_CAUSAL_HARDENING
export const FASTBOOT_CAPABILITY_RECEIPT_SCHEMA='ikant-le-fastboot-capability-receipt/v2';
export const FASTBOOT_CHANNEL_LEDGER_SCHEMA='ikant-le-fastboot-channel-ledger/v2';
export const FASTBOOT_STEP_SCHEMA='ikant-le-fastboot-step/v2';
export const LOCAL_SESSION_ACTIVATION_MODALITY='SESSION_CHAT_LOCAL';
export const FASTBOOT_CHANNEL_STATES=Object.freeze(['UNKNOWN','AVAILABLE','UNAVAILABLE']);
function capabilityVector(value){const out={};for(const k of FASTBOOT_CAPABILITY_FIELDS)out[k]=value?.[k]===true;return out;}
function channelEvidenceDigest(sourceHead,channels){return sha256({activation_modality:LOCAL_SESSION_ACTIVATION_MODALITY,source_head:sourceHead,channels});}
export function issueFastbootCapabilityReceipt({carrier,status,capabilities={},evidence,probeOwner,operationId,sourceHead}={}){
 const c=String(carrier||''),s=String(status||'').toUpperCase(),owner=String(probeOwner||'').trim(),op=String(operationId||'').trim(),head=String(sourceHead||'').toLowerCase();
 if(!FASTBOOT_CARRIERS.includes(c))throw new Error('fastboot carrier invalid');
 if(!['AVAILABLE','UNAVAILABLE'].includes(s))throw new Error('fastboot capability status invalid');
 if(!owner||!op)throw new Error('host-observed probe owner/operation required');
 if(!HEX40.test(head))throw new Error('source head invalid');
 const raw=Buffer.isBuffer(evidence)?evidence:Buffer.from(String(evidence??''));if(!raw.length)throw new Error('host-observed evidence required');
 const vector=capabilityVector(capabilities),derived=capState(vector);
 if(s==='AVAILABLE'&&derived!=='PROVEN')throw new Error('AVAILABLE requires complete proven capability vector');
 if(s==='UNAVAILABLE'&&derived!=='UNAVAILABLE')throw new Error('UNAVAILABLE requires at least one false capability');
 const material={schema:FASTBOOT_CAPABILITY_RECEIPT_SCHEMA,activation_modality:LOCAL_SESSION_ACTIVATION_MODALITY,carrier:c,status:s,capabilities:vector,source_head:head,probe_owner:owner,operation_id:op,evidence_sha256:crypto.createHash('sha256').update(raw).digest('hex'),evidence_bytes:raw.length,host_observed:true,runtime_observed:false,model_generated_capability_forbidden:true,authority:0};
 return{...material,receipt_sha256:sha256(material)};
}
export function validateFastbootCapabilityReceipt(receipt,{sourceHead=null}={}){
 const e=[],r=receipt||{};
 if(r.schema!==FASTBOOT_CAPABILITY_RECEIPT_SCHEMA)e.push('schema');
 if(r.activation_modality!==LOCAL_SESSION_ACTIVATION_MODALITY)e.push('activation_modality');
 if(!FASTBOOT_CARRIERS.includes(r.carrier))e.push('carrier');
 if(!['AVAILABLE','UNAVAILABLE'].includes(r.status))e.push('status');
 if(!HEX40.test(String(r.source_head||'')))e.push('source_head');
 if(sourceHead&&r.source_head!==String(sourceHead).toLowerCase())e.push('source_head_binding');
 if(!String(r.probe_owner||'')||!String(r.operation_id||''))e.push('origin');
 if(!HEX64.test(String(r.evidence_sha256||''))||!Number.isInteger(r.evidence_bytes)||r.evidence_bytes<1)e.push('evidence');
 if(r.host_observed!==true||r.runtime_observed!==false||r.model_generated_capability_forbidden!==true||r.authority!==0)e.push('claim_boundary');
 const vector=capabilityVector(r.capabilities),derived=capState(vector);
 if(r.status==='AVAILABLE'&&derived!=='PROVEN')e.push('availability_vector');
 if(r.status==='UNAVAILABLE'&&derived!=='UNAVAILABLE')e.push('unavailability_vector');
 if(!HEX64.test(String(r.receipt_sha256||''))||sha256(withoutDigest(r))!==r.receipt_sha256)e.push('receipt_digest');
 return{ok:e.length===0,errors:uniq(e)};
}
export function buildFastbootChannelLedger({receipts=[],previous=null,sourceHead}={}){
 const head=String(sourceHead||'').toLowerCase();if(!HEX40.test(head))throw new Error('source head invalid');
 const channels=Object.fromEntries(FASTBOOT_CARRIERS.map(c=>[c,{status:'UNKNOWN',capabilities:{},evidence_receipt_sha256:null,evidence_sha256:null}]));
 let failures=[],accepted=[];
 if(previous){const pv=validateFastbootChannelLedger(previous,{sourceHead:head});if(!pv.ok)throw new Error('previous channel ledger invalid:'+pv.errors.join(','));for(const c of FASTBOOT_CARRIERS)channels[c]=structuredClone(previous.channels[c]);failures=structuredClone(previous.failed_decisions||[]);accepted=[...(previous.accepted_receipts||[])];}
 const batch=new Set();
 for(const r of receipts||[]){const v=validateFastbootCapabilityReceipt(r,{sourceHead:head});if(!v.ok)throw new Error('invalid capability receipt:'+v.errors.join(','));if(batch.has(r.carrier))throw new Error('duplicate carrier evidence in one ledger batch');batch.add(r.carrier);const prev=channels[r.carrier],nextVector=capabilityVector(r.capabilities);if(prev.status!=='UNKNOWN'&&prev.evidence_sha256===r.evidence_sha256&&(prev.status!==r.status||JSON.stringify(prev.capabilities)!==JSON.stringify(nextVector)))throw new Error('unchanged mechanical evidence cannot change channel state');channels[r.carrier]={status:r.status,capabilities:nextVector,evidence_receipt_sha256:r.receipt_sha256,evidence_sha256:r.evidence_sha256};accepted.push(r.receipt_sha256);}
 accepted=[...new Set(accepted)];const evidence=channelEvidenceDigest(head,channels);
 const material={schema:FASTBOOT_CHANNEL_LEDGER_SCHEMA,activation_modality:LOCAL_SESSION_ACTIVATION_MODALITY,source_head:head,channels,channel_evidence_sha256:evidence,failed_decisions:failures,accepted_receipts:accepted,raw_host_booleans_authoritative:false,registry_absence_implies_unavailable:false,unavailable_persists_until_changed_mechanical_evidence:true,model_selects_carrier:false,authority:0};
 return{...material,receipt_sha256:sha256(material)};
}
export function validateFastbootChannelLedger(ledger,{sourceHead=null}={}){
 const e=[],r=ledger||{};
 if(r.schema!==FASTBOOT_CHANNEL_LEDGER_SCHEMA)e.push('schema');if(r.activation_modality!==LOCAL_SESSION_ACTIVATION_MODALITY)e.push('activation_modality');if(!HEX40.test(String(r.source_head||'')))e.push('source_head');if(sourceHead&&r.source_head!==String(sourceHead).toLowerCase())e.push('source_head_binding');if(!r.channels||Object.keys(r.channels).length!==FASTBOOT_CARRIERS.length)e.push('channels');
 for(const c of FASTBOOT_CARRIERS){const row=r.channels?.[c];if(!row||!FASTBOOT_CHANNEL_STATES.includes(row.status))e.push('channel:'+c);if(row?.status==='AVAILABLE'&&capState(row.capabilities)!=='PROVEN')e.push('channel_available:'+c);if(row?.status==='UNAVAILABLE'&&capState(row.capabilities)!=='UNAVAILABLE')e.push('channel_unavailable:'+c);if(row?.status==='UNKNOWN'&&(row?.evidence_receipt_sha256!=null||row?.evidence_sha256!=null))e.push('channel_unknown_evidence:'+c);if(row?.status!=='UNKNOWN'&&(!HEX64.test(String(row?.evidence_receipt_sha256||''))||!HEX64.test(String(row?.evidence_sha256||''))))e.push('channel_evidence:'+c);}
 if(r.channel_evidence_sha256!==channelEvidenceDigest(r.source_head,r.channels))e.push('channel_evidence_digest');const failures=Array.isArray(r.failed_decisions)?r.failed_decisions:[];const seen=new Set();for(const f of failures){const key=String(f?.decision_key||'')+'|'+String(f?.evidence_sha256||'');if(!HEX64.test(String(f?.decision_key||''))||!HEX64.test(String(f?.evidence_sha256||''))||!FASTBOOT_CARRIERS.includes(f?.carrier)||seen.has(key))e.push('failure_memory');seen.add(key);}
 if(r.raw_host_booleans_authoritative!==false||r.registry_absence_implies_unavailable!==false||r.unavailable_persists_until_changed_mechanical_evidence!==true||r.model_selects_carrier!==false||r.authority!==0)e.push('authority');if(!HEX64.test(String(r.receipt_sha256||''))||sha256(withoutDigest(r))!==r.receipt_sha256)e.push('receipt_digest');return{ok:e.length===0,errors:uniq(e)};
}
function ledgerCapabilities(ledger){const out={};for(const c of FASTBOOT_CARRIERS){const row=ledger.channels[c];out[c]=row.status==='AVAILABLE'?structuredClone(row.capabilities):row.status==='UNAVAILABLE'?false:{};}return out;}
export function deriveFastbootStep({ledger,attemptedClasses=[],runtimeRootSha256}={}){
 const v=validateFastbootChannelLedger(ledger,{sourceHead:ledger?.source_head});if(!v.ok)return{schema:FASTBOOT_STEP_SCHEMA,state:'BLOCKED',action:'BLOCK',blocker:'CHANNEL_LEDGER_INVALID',errors:v.errors,one_next:true,one_executor:true,retry_allowed:false,authority:0};if(!HEX64.test(String(runtimeRootSha256||'')))return{schema:FASTBOOT_STEP_SCHEMA,state:'BLOCKED',action:'BLOCK',blocker:'RUNTIME_ROOT_INVALID',one_next:true,one_executor:true,retry_allowed:false,authority:0};
 const plan=selectFastbootCarrier({capabilities:ledgerCapabilities(ledger),attemptedClasses});const decisionMaterial={activation_modality:LOCAL_SESSION_ACTIVATION_MODALITY,source_head:ledger.source_head,runtime_root_sha256:runtimeRootSha256,plan_state:plan.state,carrier:plan.carrier,plan_action:plan.action};const decisionKey=sha256(decisionMaterial),evidenceSha=ledger.channel_evidence_sha256;const repeated=(ledger.failed_decisions||[]).some(x=>x?.decision_key===decisionKey&&x?.evidence_sha256===evidenceSha);
 let action,next,blocker=null,retry=true;if(repeated){action='WAIT_CHANGED_EVIDENCE';next='WAIT_CHANGED_EVIDENCE';blocker='UNCHANGED_DECISION_EVIDENCE_DO_NOT_RETRY';retry=false;}else if(plan.state==='EXECUTABLE'){action='EXECUTE_CANONICAL_CARRIER';next='EXECUTE:'+plan.carrier;}else if(plan.state==='PROBE_REQUIRED'){action='PROBE_CANONICAL_CARRIER';next='PROBE:'+plan.carrier;}else{action='HOST_UNAVAILABLE';next='HOST_UNAVAILABLE';blocker='ALL_CANONICAL_CARRIERS_EXHAUSTED';retry=false;}
 const material={schema:FASTBOOT_STEP_SCHEMA,activation_modality:LOCAL_SESSION_ACTIVATION_MODALITY,source_head:ledger.source_head,runtime_root_sha256:runtimeRootSha256,state:plan.state,action,canonical_next:next,canonical_carrier:plan.carrier,decision_key:decisionKey,evidence_sha256:evidenceSha,retry_allowed:retry,blocker,one_next:true,one_executor:true,model_selects_carrier:false,model_selects_fallback:false,side_infrastructure_forbidden:true,authority:0};return{...material,receipt_sha256:sha256(material)};
}
export function recordFastbootFailure(ledger,step){const lv=validateFastbootChannelLedger(ledger,{sourceHead:ledger?.source_head}),sv=validateFastbootStep(step,{sourceHead:ledger?.source_head,runtimeRootSha256:step?.runtime_root_sha256,ledger});if(!lv.ok||!sv.ok)throw new Error('cannot record invalid fastboot failure');if(step.action!=='EXECUTE_CANONICAL_CARRIER'&&step.action!=='PROBE_CANONICAL_CARRIER')throw new Error('only executable/probe steps can fail');const next=structuredClone(ledger),row={decision_key:step.decision_key,evidence_sha256:step.evidence_sha256,carrier:step.canonical_carrier};if(!(next.failed_decisions||[]).some(x=>x.decision_key===row.decision_key&&x.evidence_sha256===row.evidence_sha256))next.failed_decisions=[...(next.failed_decisions||[]),row];delete next.receipt_sha256;return{...next,receipt_sha256:sha256(next)};}
export function validateFastbootStep(step,{sourceHead=null,runtimeRootSha256=null,ledger=null,attemptedClasses=[]}={}){const e=[],r=step||{};if(r.schema!==FASTBOOT_STEP_SCHEMA)e.push('schema');if(r.activation_modality!==LOCAL_SESSION_ACTIVATION_MODALITY)e.push('activation_modality');if(!HEX40.test(String(r.source_head||'')))e.push('source_head');if(sourceHead&&r.source_head!==String(sourceHead).toLowerCase())e.push('source_head_binding');if(!HEX64.test(String(r.runtime_root_sha256||'')))e.push('runtime_root');if(runtimeRootSha256&&r.runtime_root_sha256!==runtimeRootSha256)e.push('runtime_root_binding');if(r.one_next!==true||r.one_executor!==true)e.push('one_next');if(r.model_selects_carrier!==false||r.model_selects_fallback!==false||r.side_infrastructure_forbidden!==true||r.authority!==0)e.push('authority');if(!HEX64.test(String(r.decision_key||''))||!HEX64.test(String(r.evidence_sha256||'')))e.push('binding');if(!HEX64.test(String(r.receipt_sha256||''))||sha256(withoutDigest(r))!==r.receipt_sha256)e.push('receipt_digest');if(ledger){const d=deriveFastbootStep({ledger,attemptedClasses,runtimeRootSha256:r.runtime_root_sha256});for(const k of ['state','action','canonical_next','canonical_carrier','decision_key','evidence_sha256','retry_allowed','blocker'])if(r[k]!==d[k])e.push('recomputed_'+k);}return{ok:e.length===0,errors:uniq(e)};}

