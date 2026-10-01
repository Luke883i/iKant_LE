import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT,readTerms,readOrientationCapsule,sha256} from '../src/contract.mjs';
import {runtimePaths} from '../src/state.mjs';
import {FASTBOOT_CAPABILITY_FIELDS,issueFastbootCapabilityReceipt,buildFastbootChannelLedger,deriveFastbootStep} from '../src/fastboot-convergence.mjs';

const digest=x=>crypto.createHash('sha256').update(JSON.stringify(x)).digest('hex');
const withReceipt=x=>({...x,receipt_sha256:digest(x)});
const rootObjects=d=>[{path:d.loader.path,blob_sha1:d.loader.blob_sha1},...d.shards.map(s=>({path:s.path,blob_sha1:s.blob_sha1}))];

export function bootstrapHandoff(pending='inizializza',sourceHead='a'.repeat(40)){
 const terms=readTerms(),c=readOrientationCapsule();
 return{schema:'ikant-le-preaccept-handoff/v1',repository:'Luke883i/iKant_LE',source_head:sourceHead,terms_presented:true,terms_digest:terms.digest,frozen:true,breached:false,pending_intent:pending,pending_intent_sha256:sha256(Buffer.from(pending)),orientation_digests:Object.fromEntries(c.paths.map(rel=>[rel,sha256(fs.readFileSync(path.join(ROOT,rel)))])),runtime_observed_terms_presentation:false,host_attested_terms_presentation:true,authority:0};
}
export function bindConvergenceToTransfer(e,{failedAttempts=[]}={}){
 const d=JSON.parse(fs.readFileSync(path.join(ROOT,'BOOTSTRAP.json'),'utf8')).post_accept_fastboot.runtime_root;
 const objects=rootObjects(d).map((x,i)=>({...x,sha256:(i%2?'d':'e').repeat(64),bytes:100+i}));
 const carrier=e.transfer.mode==='COLD_API'?'GITHUB_API_BASE64':e.transfer.mode;
 const complete=withReceipt({schema:'ikant-le-fastboot-carrier-attempt/v1',attempt_id:'attempt-complete-'+carrier,carrier,acceptance_event_id:e.acceptance_event_id,source_head:e.source_head,runtime_root_sha256:e.runtime_root_sha256,result:'COMPLETE',source_object_identity:'fixture-source:'+carrier,runtime_sink_object_id:'fixture-sink:'+carrier,remote_objects:objects,remote_reads:e.transfer.remote_reads??objects.length,bytes_observed:objects.reduce((n,x)=>n+x.bytes,0),source_fetch_observed:true,byte_preserving_runtime_sink_observed:true,runtime_materializer_bound:true,runtime_executor_bound:true,model_mediated_bytes:false,authoritative_remote_history:false,committed_remote_rounds:0,transfer_receipt_sha256:e.transfer.receipt_sha256,authority:0});
 const attempts=[...failedAttempts,complete];
 e.fastboot_convergence=withReceipt({schema:'ikant-le-fastboot-convergence/v1',acceptance_event_id:e.acceptance_event_id,source_head:e.source_head,runtime_root_sha256:e.runtime_root_sha256,attempts,selected_carrier:carrier,committed_transfer_receipt_sha256:e.transfer.receipt_sha256,remote_history_commits:1,materially_distinct_retry:attempts.length>1,acceptance_preserved:true,source_preserved:true,deadline_origin_preserved:true,model_mediated_bytes:false,authority:0});
 const capabilities=Object.fromEntries(FASTBOOT_CAPABILITY_FIELDS.map(k=>[k,true]));const cap=issueFastbootCapabilityReceipt({carrier,status:'AVAILABLE',capabilities,evidence:JSON.stringify({transfer_receipt_sha256:e.transfer.receipt_sha256,carrier}),probeOwner:'bootstrap-fixture',operationId:'fixture-'+carrier,sourceHead:e.source_head});const ledger=buildFastbootChannelLedger({receipts:[cap],sourceHead:e.source_head});e.fastboot_channel_ledger=ledger;e.fastboot_step=deriveFastbootStep({ledger,runtimeRootSha256:e.runtime_root_sha256});
 return e;
}
export function failedFastbootAttempt({sourceHead='a'.repeat(40),acceptanceEventId,carrier='PINNED_PERMALINK',partial=0}={}){
 const d=JSON.parse(fs.readFileSync(path.join(ROOT,'BOOTSTRAP.json'),'utf8')).post_accept_fastboot.runtime_root;
 const objects=rootObjects(d).slice(0,partial).map((x,i)=>({...x,sha256:(i%2?'8':'9').repeat(64),bytes:70+i}));
 return withReceipt({schema:'ikant-le-fastboot-carrier-attempt/v1',attempt_id:'failed-'+carrier+'-'+partial,carrier,acceptance_event_id:acceptanceEventId,source_head:sourceHead,runtime_root_sha256:d.runtime_root_sha256,result:partial?'PARTIAL':'FAILED',source_object_identity:partial?'fixture-partial:'+carrier:null,runtime_sink_object_id:partial?'fixture-quarantine:'+carrier:null,remote_objects:objects,remote_reads:partial,bytes_observed:objects.reduce((n,x)=>n+x.bytes,0),source_fetch_observed:partial>0,byte_preserving_runtime_sink_observed:partial>0,runtime_materializer_bound:true,runtime_executor_bound:true,model_mediated_bytes:false,authoritative_remote_history:false,committed_remote_rounds:0,transfer_receipt_sha256:null,authority:0});
}
export function bootstrapEvidence({sourceHead='a'.repeat(40),elapsedBeforeRuntimeMs=10,mode='COLD_API',transferSchema='v1',flexMode='PINNED_GITHUB_ZIP',failedAttempts=[]}={}){
 const b=JSON.parse(fs.readFileSync(path.join(ROOT,'BOOTSTRAP.json'),'utf8')),d=b.post_accept_fastboot.runtime_root;
 const acceptanceOrigin=withReceipt({schema:'ikant-le-acceptance-origin/v1',event_id:`accept-${sourceHead.slice(0,12)}-${elapsedBeforeRuntimeMs}`,source_head:sourceHead,terms_digest:readTerms().digest,deadline_origin:'I_ACCEPT',clock:'MONOTONIC',observed_at_accept:true,elapsed_to_runtime_entry_ms:elapsedBeforeRuntimeMs,authority:0});
 let transfer;
 if(transferSchema==='v2'){
  const objects=rootObjects(d),warm=flexMode==='WARM_CACHE_EXACT',host=flexMode==='HOST_FILE_BRIDGE',zip=flexMode==='PINNED_GITHUB_ZIP';
  transfer=withReceipt({schema:'ikant-le-source-bound-transfer/v2',source_head:sourceHead,runtime_root_sha256:d.runtime_root_sha256,mode:flexMode,transport_authority:0,identity_authority:'CONTENT_ADDRESSING',exact_ref:true,bridge_observed:true,model_mediated_bytes:false,complete:true,bytes_exact:true,remote_objects:objects.map((x,i)=>({...x,sha256:(i%2?'b':'c').repeat(64),bytes:100+i})),remote_rounds:warm||host?0:1,remote_reads:warm||host?0:zip?1:objects.length,locator_pinned:['PINNED_PERMALINK','PINNED_GITHUB_ZIP'].includes(flexMode),archive_policy:zip?{selective_extract:true,path_safe:true,special_entries_rejected:true,duplicates_rejected:true,encrypted_entries_rejected:true}:null,host_readback_verified:host,cache_reopen_verified:warm,elapsed_ms:Math.max(0,elapsedBeforeRuntimeMs-1),authority:0});
 }else transfer=withReceipt({schema:'ikant-le-source-bound-transfer/v1',source_head:sourceHead,runtime_root_sha256:d.runtime_root_sha256,mode,transport:'GITHUB_API',exact_ref:true,bridge_observed:true,model_mediated_bytes:false,fallback_used:false,complete:true,bytes_exact:true,remote_rounds:mode==='WARM_CACHE_EXACT'?0:1,remote_reads:mode==='WARM_CACHE_EXACT'?0:b.post_accept_fastboot.remote_paths.length,cache_reopen_verified:mode==='WARM_CACHE_EXACT',elapsed_ms:Math.max(0,elapsedBeforeRuntimeMs-1),authority:0});
 const materialization=withReceipt({schema:'ikant-le-runtime-root-materialization/v1',source_head:sourceHead,runtime_root_sha256:d.runtime_root_sha256,loader_blob_sha1:d.loader.blob_sha1,transfer_receipt_sha256:transfer.receipt_sha256,member_count:d.member_count,source_bytes:d.source_bytes,shard_count:d.shards.length,reused_orientation_paths:[...b.post_accept_fastboot.reuse_preaccept_paths],atomic_publish:true,reopen_verified:true,authority:0});
 fs.mkdirSync(runtimePaths().dir,{recursive:true});fs.writeFileSync(path.join(runtimePaths().dir,'materialization.json'),JSON.stringify(materialization,null,2)+'\n',{mode:0o600});
 let e={schema:'ikant-le-chat-bootstrap-evidence/v1',source_head:sourceHead,runtime_root_sha256:d.runtime_root_sha256,acceptance_event_id:acceptanceOrigin.event_id,acceptance_origin_receipt_sha256:acceptanceOrigin.receipt_sha256,acceptance_origin:acceptanceOrigin,transfer_receipt_sha256:transfer.receipt_sha256,materialization_receipt_sha256:materialization.receipt_sha256,transfer,authority:0};
 e=bindConvergenceToTransfer(e,{failedAttempts});
 return withReceipt(e);
}
export function bootstrapArgs(pending='inizializza',opts={}){const sourceHead=opts.sourceHead||'a'.repeat(40);return{preacceptHandoff:bootstrapHandoff(pending,sourceHead),postAcceptBootstrapEvidence:bootstrapEvidence({...opts,sourceHead})};}
