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
