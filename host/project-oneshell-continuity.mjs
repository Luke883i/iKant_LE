/** HOST-only OneShell presentation continuity, authority 0.
 * No native message authentication, provider persistence, or new iKant state owner.
 * An exit ticket is valid only while its issuing process and original owner remain
 * available. A serialized HOST ticket cannot resurrect or authenticate an exit.
 */
import {validateC72V2ModeSelection} from './c72-public-mode-admission.mjs';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const H40=/^[a-f0-9]{40}$/u;
const exits=new WeakMap();
const stopped=edge=>Object.freeze({kind:'STOP',shell:'ONESHELL',edge,next:'STOP'});
const goodOwnerReadback=(x,selection,head)=>x?.owner==='C135_EDU_V2'&&
 x.source_head===head&&x.selection_receipt_sha256===selection.receipt_sha256&&
 x.original_c87_readback?.status==='C107_LEDGER_REOPENED';
export function projectOneShellContinuation({selection,sourceHead,liveHead,ownerStatus,
 originalSession=null,humanInput,humanMessageObserved=false,exitReadback=null}={}){
 if(!H40.test(sourceHead||'')||!H40.test(liveHead||''))return stopped('SOURCE_LOCK_NOT_ATTESTED');
 if(sourceHead!==liveHead)return stopped('STOP_SOURCE_LOCK_STALE');
 if(!validateC72V2ModeSelection(selection,{mode:'EDU',sourceHead}))
  return stopped('C72_EDU_SELECTION_REQUIRED');
 if(!ownerStatus||typeof ownerStatus!=='object'||ownerStatus.uncertain===true)
  return stopped('EDU_OWNER_STATUS_UNCERTAIN');
 if(ownerStatus.closed===true){
  // Caller-written JSON, status flags and cached receipt hashes are not enough.
  const witnessed=exitReadback&&exits.get(exitReadback);
  if(witnessed?.originalSession===originalSession&&originalSession!==null&&
    witnessed.sourceHead===sourceHead&&witnessed.selectionSha===selection.receipt_sha256&&
    exitReadback?.human_input==='EXIT IKANT'&&exitReadback?.host_observed_human_message===true&&
    exitReadback?.source_head===sourceHead&&exitReadback?.closed===true&&
    exitReadback?.original_owner==='C135_EDU_V2'&&
    originalSession.status().closed===true)
   return Object.freeze({kind:'EXIT_CONFIRMED',shell:'HOST_CHATGPT',edge:'NONE',
     next:'HOST_CHATGPT_NEXT_TURN'});
  return stopped('EDU_OWNER_CLOSED_WITHOUT_VERIFIED_HUMAN_EXIT');
 }
 if(ownerStatus.closed!==false||ownerStatus.busy===true)return stopped('EDU_OWNER_NOT_STABLE');
 if(humanInput==='EXIT IKANT'){
  if(humanMessageObserved!==true)return stopped('HUMAN_EXIT_EVENT_NOT_OBSERVED');
  return Object.freeze({kind:'DELEGATE_EXIT',shell:'ONESHELL',
    edge:'ORIGINAL_C135_CLOSE_PENDING',next:'CALL_ORIGINAL_C135_CLOSE_ONCE'});
 }
 return Object.freeze({kind:'CONTINUE',shell:'ONESHELL',edge:'NONE',
   next:'ROUTE_USING_LIVE_ORIGINAL_OWNER'});
}
export async function closeOneShellOnHumanExit({selection,sourceHead,liveHead,
 humanInput,humanMessageObserved=false,originalSession,evidenceFile=null}={}){
 let status, ownerReadback;
 try{status=originalSession?.status?.()}catch{return Object.freeze({ok:false,shell:'ONESHELL',edge:'ORIGINAL_OWNER_STATUS_READ_UNKNOWN'});}
 const before=projectOneShellContinuation({selection,sourceHead,liveHead,humanInput,
  humanMessageObserved,ownerStatus:status});
 if(before.kind!=='DELEGATE_EXIT')return Object.freeze({ok:false,shell:'ONESHELL',edge:before.edge});
 if(originalSession?.owner!=='C135_EDU_V2'||typeof originalSession.close!=='function'||
    typeof originalSession.readSessionState!=='function')
  return Object.freeze({ok:false,shell:'ONESHELL',edge:'ORIGINAL_EDU_OWNER_REQUIRED'});
 if(evidenceFile!==null&&(typeof evidenceFile!=='string'||evidenceFile.length===0||
    fs.existsSync(evidenceFile)))
  return Object.freeze({ok:false,shell:'ONESHELL',edge:'FRESH_EXIT_EVIDENCE_DESTINATION_REQUIRED'});
 try{ownerReadback=originalSession.readSessionState()}catch{}
 if(!goodOwnerReadback(ownerReadback,selection,sourceHead))
  return Object.freeze({ok:false,shell:'ONESHELL',edge:'ORIGINAL_C87_READBACK_BEFORE_EXIT_REQUIRED'});
 try{
  // One shot. On any ambiguous result STOP, never invoke close again.
  await originalSession.close();
  const after=originalSession.status();
  if(after?.closed!==true||after.uncertain===true||after.busy===true)
   return Object.freeze({ok:false,shell:'ONESHELL',edge:'ORIGINAL_C135_EXIT_READBACK_NOT_CONFIRMED'});
  const ticket=Object.freeze({schema:'ikant-le-host-exit-projection/v2',
   human_input:'EXIT IKANT',host_observed_human_message:true,source_head:sourceHead,
   selection_receipt_sha256:selection.receipt_sha256,closed:true,
   original_owner:'C135_EDU_V2',same_local_owner_reference:true,
   native_event_attested:false,provider_persistence_attested:false,authority:0});
  const bytes=JSON.stringify(ticket);
  if(evidenceFile!==null){
   fs.writeFileSync(evidenceFile,bytes,{flag:'wx',mode:0o600});
   if(fs.readFileSync(evidenceFile,'utf8')!==bytes)
    return Object.freeze({ok:false,shell:'ONESHELL',edge:'EXIT_EVIDENCE_READBACK_FAILED'});
  }
  exits.set(ticket,{originalSession,sourceHead,selectionSha:selection.receipt_sha256});
  const next=projectOneShellContinuation({selection,sourceHead,liveHead,
   ownerStatus:after,originalSession,exitReadback:ticket});
  if(next.kind!=='EXIT_CONFIRMED')
   return Object.freeze({ok:false,shell:'ONESHELL',edge:'ORIGINAL_C135_EXIT_RECONCILIATION_FAILED'});
  return Object.freeze({ok:true,shell:'HOST_CHATGPT',exit:'ORIGINAL_C135_CLOSED_LOCAL',
   origin:'HOST_OBSERVED_HUMAN_MESSAGE_NOT_NATIVE',native_event_attested:false,
   persistent_ui_attested:false,exitReadback:ticket,
   evidence_sha256:createHash('sha256').update(bytes).digest('hex'),
   evidence_file:evidenceFile,next:'HOST_CHATGPT_NEXT_TURN'});
 }catch{return Object.freeze({ok:false,shell:'ONESHELL',
   edge:'ORIGINAL_C135_EXIT_OUTCOME_UNKNOWN_RECONCILE_READ_ONLY'});}
}
