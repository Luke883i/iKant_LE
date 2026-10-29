/** E15: pure, authority-zero evidence cut-set. No source, consent, C87 or voice minted here. */
const H40=/^[0-9a-f]{40}$/u;
export const E15_PROFILE='PROJECT_EDU_E15';
export const E15_ORDER=Object.freeze(['SOURCE_LOCK','ORIENTATION','C72_TRANSIT','C72_ACCEPTED',
 'C72_EDU','SOURCE_READBACK','C135_OWNER','C87_READBACK','C125_S03','ONE_SHELL',
 'RECOVERY_FENCE','LOGO_SOURCE','HOST_DELIVERY']);
export const E15_STAGES=Object.freeze(['ACCEPT','EDU','MATERIALIZED','READY','TURN','RECOVERED','DELIVERED']);
const required=Object.freeze({
 ACCEPT:4,EDU:5,MATERIALIZED:6,READY:7,TURN:10,RECOVERED:11,DELIVERED:13
});
const edge=Object.freeze({SOURCE_LOCK:'STOP_SOURCE_LOCK_STALE',ORIENTATION:'E15_ORIENTATION_WITNESS_REQUIRED',
 C72_TRANSIT:'E15_ORIGINAL_C72_TRANSIT_REQUIRED',C72_ACCEPTED:'E15_ORIGINAL_ACCEPTANCE_READBACK_REQUIRED',
 C72_EDU:'E15_ORIGINAL_MODE_READBACK_REQUIRED',SOURCE_READBACK:'E15_PINNED_TREE_BLOB_READBACK_REQUIRED',
 C135_OWNER:'E15_ORIGINAL_C135_REQUIRED',C87_READBACK:'E15_ORIGINAL_C87_READBACK_REQUIRED',
 C125_S03:'E15_ORIGINAL_S03_REQUIRED',ONE_SHELL:'E15_SIX_SLOTS_ORIGINAL_REQUIRED',
 RECOVERY_FENCE:'E15_RECOVERY_WORKER_FENCE_REQUIRED',LOGO_SOURCE:'E15_VERIFIED_LOGO_OR_TEXT_REQUIRED',
 HOST_DELIVERY:'E15_HOST_DELIVERY_UNKNOWN'});
const deny=(e)=>Object.freeze({ok:false,edge:e,voice:'NO_VOICE',authority:0,active:false,native_delivery_attested:false});
/** Evidence flags MUST originate from original owners/readbacks. A true flag is not itself a receipt. */
export function adjudicateE15(q={}){
 if(q.profile!==E15_PROFILE||!E15_STAGES.includes(q.stage))return deny('E15_PROFILE_OR_STAGE_INVALID');
 if(!H40.test(q.sourceHead||'')||q.sourceHead!==q.liveHead)return deny(edge.SOURCE_LOCK);
 const count=required[q.stage];
 const checks=[true,!!q.orientationWitness,!!q.transitReadback,!!q.originalAccepted,
  !!q.originalEduMode,!!q.sourceTreeBlobReadback,!!q.originalC135,
  !!q.originalC87Readback,!!q.originalC125S03,!!q.sixSlotsOriginal,
  !!q.workerLossFence,!!q.verifiedLogoOrTextFallback,!!q.hostDeliveryObserved];
 for(let i=1;i<count;i++){
  if(i===10&&q.stage!=='RECOVERED')continue;
  if(i===11&&q.stage==='RECOVERED')continue;
  if(!checks[i])return deny(edge[E15_ORDER[i]]);
 }
 if(q.stage==='RECOVERED'&&!q.workerLossFence)return deny(edge.RECOVERY_FENCE);
 return Object.freeze({ok:true,stage:q.stage,edge:null,voice:'OWNER_ONLY_IF_ORIGINALLY_ATTESTED',
  authority:0,active:false,native_delivery_attested:q.stage==='DELIVERED'&&q.hostDeliveryObserved===true});
}
export function admitE15TransportEnvelope(q={}){
 if(q.projectProfile!==E15_PROFILE)return deny('E15_EXPLICIT_PROJECT_PROFILE_REQUIRED');
 if(typeof q.transitDirectory!=='string'||q.transitDirectory.length<2)return deny(edge.C72_TRANSIT);
 const p=q.transitSourcePacket;
 if(!p||p.path!=='host/project-c72-receipt-transit.mjs'||
  typeof p.contentBase64!=='string'||p.contentBase64.length<4||
  !H40.test(q.transitBlobSha1||''))return deny('E15_PINNED_TRANSIT_BLOB_REQUIRED');
 return Object.freeze({ok:true,authority:0,active:false,original_owner_invoked:false});
}
