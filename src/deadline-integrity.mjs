export const DEADLINE_RESULT=Object.freeze({
  PASS:'DEADLINE_PASS',
  ORIGIN_UNAVAILABLE:'DEADLINE_ORIGIN_UNAVAILABLE',
  ORIGIN_INVALID:'DEADLINE_ORIGIN_INVALID',
  ELAPSED_UNAVAILABLE:'DEADLINE_ELAPSED_UNAVAILABLE',
  EXCEEDED:'DEADLINE_EXCEEDED'
});
const TERMINAL=new Set([DEADLINE_RESULT.ORIGIN_UNAVAILABLE,DEADLINE_RESULT.ORIGIN_INVALID,DEADLINE_RESULT.ELAPSED_UNAVAILABLE,DEADLINE_RESULT.EXCEEDED]);
const HEX40=/^[a-f0-9]{40}$/;
const HEX64=/^[a-f0-9]{64}$/;
export function isDeadlineTerminal(result){return TERMINAL.has(result);}
export function classifyDeadlineEvidence(origin,{sourceHead=null,termsDigest=null,deadlineMs=120000}={}){
  if(origin==null)return{result:DEADLINE_RESULT.ORIGIN_UNAVAILABLE,terminal:true,reason:'origin_absent'};
  if(origin.schema!=='ikant-le-acceptance-origin/v1'||origin.authority!==0||origin.deadline_origin!=='I_ACCEPT'||origin.clock!=='MONOTONIC'||origin.observed_at_accept!==true)return{result:DEADLINE_RESULT.ORIGIN_INVALID,terminal:true,reason:'origin_shape'};
  if(typeof origin.event_id!=='string'||origin.event_id.length<16||origin.event_id.length>128)return{result:DEADLINE_RESULT.ORIGIN_INVALID,terminal:true,reason:'event_id'};
  if(sourceHead!==null&&(origin.source_head!==sourceHead||!HEX40.test(String(sourceHead))))return{result:DEADLINE_RESULT.ORIGIN_INVALID,terminal:true,reason:'source_binding'};
  if(termsDigest!==null&&(origin.terms_digest!==termsDigest||!HEX64.test(String(termsDigest))))return{result:DEADLINE_RESULT.ORIGIN_INVALID,terminal:true,reason:'terms_binding'};
  const elapsed=origin.elapsed_to_runtime_entry_ms;
  if(!Number.isFinite(elapsed)||elapsed<0)return{result:DEADLINE_RESULT.ELAPSED_UNAVAILABLE,terminal:true,reason:'elapsed_unavailable'};
  if(elapsed>deadlineMs)return{result:DEADLINE_RESULT.EXCEEDED,terminal:true,reason:'elapsed_exceeded',elapsed_ms:elapsed};
  return{result:DEADLINE_RESULT.PASS,terminal:false,reason:'pass',elapsed_ms:elapsed};
}
export function admissionEpochRecoverable(state){
  if(!state)return false;
  if(state.admission?.new_chat_required===true)return false;
  if(isDeadlineTerminal(state.bootstrap?.deadline_terminal))return false;
  return true;
}
export function canUseManualRecovery(state){
  return Boolean(state?.accepted)&&state?.bootstrap?.evidence_verified===true&&state?.bootstrap?.deadline_result===DEADLINE_RESULT.PASS&&!isDeadlineTerminal(state?.bootstrap?.deadline_terminal)&&state?.admission?.new_chat_required!==true&&typeof state?.admission?.acceptance_event_id==='string'&&state?.bootstrap?.acceptance_event_id===state?.admission?.acceptance_event_id;
}
