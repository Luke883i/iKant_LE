import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {ROOT} from './contract.mjs';
import {runtimeRootDescriptor} from './runtime-root-verified.mjs';
import {classifyDeadlineEvidence,DEADLINE_RESULT} from './deadline-integrity.mjs';

export const SESSION_CHAT_PROFILE=Object.freeze({DEPLOYED:'SESSION_CHAT_DEPLOYED',ONESHOT:'SESSION_CHAT_ONESHOT'});
export const DEPLOYMENT_ATTESTATION_SCHEMA='ikant-le-deployment-attestation/v1';
export const DEPLOYED_SESSION_BINDING_SCHEMA='ikant-le-deployed-session-binding/v1';
const HEX40=/^[a-f0-9]{40}$/;
const HEX64=/^[a-f0-9]{64}$/;
const DEPLOYMENT=path.join(ROOT,'.ikant','deployment.json');
const MATERIALIZATION=path.join(ROOT,'.ikant','materialization.json');
const sha256=x=>crypto.createHash('sha256').update(Buffer.from(typeof x==='string'?x:JSON.stringify(x))).digest('hex');
function digestWithout(value){const x=structuredClone(value||{});delete x.receipt_sha256;return sha256(JSON.stringify(x));}
function uniq(xs){return[...new Set(xs)];}
function readJson(p){return fs.existsSync(p)?JSON.parse(fs.readFileSync(p,'utf8')):null;}
function validReceipt(x){return HEX64.test(String(x?.receipt_sha256||''))&&digestWithout(x)===x.receipt_sha256;}
export function sessionChatReceiptDigest(value){return digestWithout(value);}
export function buildAcceptanceOriginReceipt({eventId,sourceHead,termsDigest,originMonotonicMs}={}){
 const material={schema:'ikant-le-acceptance-origin/v1',event_id:String(eventId||''),source_head:String(sourceHead||''),terms_digest:String(termsDigest||''),deadline_origin:'I_ACCEPT',clock:'MONOTONIC',observed_at_accept:true,origin_monotonic_ms:Number(originMonotonicMs),elapsed_to_runtime_entry_ms:0,authority:0};
 return{...material,receipt_sha256:sha256(JSON.stringify(material))};
}
export function validateAcceptanceOriginAtIngress(receipt,{sourceHead,termsDigest,deadlineMs=120000,eventId=null}={}){
 const c=classifyDeadlineEvidence(receipt,{sourceHead,termsDigest,deadlineMs}),e=[];
 if(c.result!==DEADLINE_RESULT.PASS)e.push('deadline:'+c.result);
 if(!validReceipt(receipt))e.push('acceptance_origin_receipt_binding');
 if(eventId!==null&&receipt?.event_id!==eventId)e.push('acceptance_event_binding');
 if(!Number.isFinite(receipt?.origin_monotonic_ms)||receipt.origin_monotonic_ms<0)e.push('origin_monotonic');
 if(receipt?.elapsed_to_runtime_entry_ms!==0)e.push('origin_not_at_runtime_ingress');
 return e.length?{ok:false,errors:uniq(e),deadline_result:c.result,elapsed_before_runtime_ms:c.elapsed_ms??null,deadline_origin_receipt_sha256:receipt?.receipt_sha256||null}:{ok:true,errors:[],deadline_result:DEADLINE_RESULT.PASS,elapsed_before_runtime_ms:0,deadline_origin_receipt_sha256:receipt.receipt_sha256,acceptance_event_id:receipt.event_id};
}
function validateLocalMaterialization(receipt,{sourceHead,runtimeRootSha256}={}){
 const e=[];
 if(!receipt||receipt.schema!=='ikant-le-runtime-root-materialization/v1')e.push('materialization:schema');
 if(receipt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('materialization:source_head');
 if(receipt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('materialization:runtime_root');
 if(receipt?.atomic_publish!==true)e.push('materialization:atomic_publish');
 if(receipt?.reopen_verified!==true)e.push('materialization:reopen');
 if(!validReceipt(receipt))e.push('materialization:receipt_digest');
 return{ok:e.length===0,errors:uniq(e),receipt_sha256:receipt?.receipt_sha256||null};
}
export function attestDeployedRuntime({deploymentId,runtimeExecutionPlaneId,sourceHead=null}={}){
 const d=runtimeRootDescriptor(),m=readJson(MATERIALIZATION),head=sourceHead||m?.source_head,v=validateLocalMaterialization(m,{sourceHead:head,runtimeRootSha256:d?.runtime_root_sha256});
 if(!v.ok)throw new Error('deployment attestation requires verified local materialization: '+v.errors.join(','));
 if(!String(deploymentId||''))throw new Error('deployment_id required');
 if(!String(runtimeExecutionPlaneId||''))throw new Error('runtime_execution_plane_id required');
 const material={schema:DEPLOYMENT_ATTESTATION_SCHEMA,deployment_id:String(deploymentId),runtime_execution_plane_id:String(runtimeExecutionPlaneId),deployment_model:'DEPLOY_ONCE_BIND_PER_SESSION',source_head:head,runtime_root_sha256:d.runtime_root_sha256,local_materialization_receipt_sha256:m.receipt_sha256,local_root_reopen_verified:true,runtime_ready:true,repository_transfer_per_chat:false,authority:0};
 const receipt={...material,receipt_sha256:sha256(JSON.stringify(material))};
 fs.mkdirSync(path.dirname(DEPLOYMENT),{recursive:true});const tmp=DEPLOYMENT+'.tmp-'+process.pid;fs.writeFileSync(tmp,JSON.stringify(receipt,null,2)+'\n',{mode:0o600});fs.renameSync(tmp,DEPLOYMENT);
 const reread=readJson(DEPLOYMENT);if(reread?.receipt_sha256!==receipt.receipt_sha256||!validReceipt(reread))throw new Error('deployment attestation readback mismatch');
 return receipt;
}
export function readDeploymentAttestation(){return readJson(DEPLOYMENT);}
export function validateDeploymentAttestation(receipt,{sourceHead,runtimeRootSha256,localMaterializationReceipt=null}={}){
 const e=[],m=localMaterializationReceipt||readJson(MATERIALIZATION);
 if(!receipt||receipt.schema!==DEPLOYMENT_ATTESTATION_SCHEMA)e.push('schema');
 if(receipt?.authority!==0)e.push('authority');
 if(receipt?.deployment_model!=='DEPLOY_ONCE_BIND_PER_SESSION')e.push('deployment_model');
 if(!String(receipt?.deployment_id||''))e.push('deployment_id');
 if(!String(receipt?.runtime_execution_plane_id||''))e.push('runtime_execution_plane');
 if(receipt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('source_head');
 if(receipt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('runtime_root');
 if(receipt?.local_root_reopen_verified!==true)e.push('materialization:reopen');
 if(receipt?.runtime_ready!==true)e.push('host_readback');
 if(receipt?.repository_transfer_per_chat!==false)e.push('repository_transfer_per_chat');
 const mv=validateLocalMaterialization(m,{sourceHead,runtimeRootSha256});if(!mv.ok)e.push(...mv.errors);
 if(receipt?.local_materialization_receipt_sha256!==m?.receipt_sha256)e.push('materialization:transfer_binding');
 if(!validReceipt(receipt))e.push('receipt_digest');
 return{ok:e.length===0,errors:uniq(e),receipt_sha256:receipt?.receipt_sha256||null,materialization_receipt_sha256:m?.receipt_sha256||null};
}
export function buildDeployedSessionBinding({deploymentAttestation,sessionId}={}){
 if(!deploymentAttestation||!String(sessionId||''))throw new Error('deployment attestation and session_id required');
 const material={schema:DEPLOYED_SESSION_BINDING_SCHEMA,profile:SESSION_CHAT_PROFILE.DEPLOYED,session_id:String(sessionId),deployment_id:String(deploymentAttestation.deployment_id||''),deployment_receipt_sha256:String(deploymentAttestation.receipt_sha256||''),runtime_execution_plane_id:String(deploymentAttestation.runtime_execution_plane_id||''),session_bound:true,repository_transfer_per_chat:false,authority:0};
 return{...material,receipt_sha256:sha256(JSON.stringify(material))};
}
export function validateDeployedSessionBinding(receipt,{deploymentAttestation}={}){
 const e=[];
 if(!receipt||receipt.schema!==DEPLOYED_SESSION_BINDING_SCHEMA)e.push('schema');
 if(receipt?.profile!==SESSION_CHAT_PROFILE.DEPLOYED)e.push('profile');
 if(receipt?.authority!==0)e.push('authority');
 if(!String(receipt?.session_id||''))e.push('deployed_session_binding');
 if(receipt?.session_bound!==true)e.push('deployed_session_binding');
 if(receipt?.repository_transfer_per_chat!==false)e.push('repository_transfer_per_chat');
 if(receipt?.deployment_id!==deploymentAttestation?.deployment_id)e.push('deployed_session_binding');
 if(receipt?.deployment_receipt_sha256!==deploymentAttestation?.receipt_sha256||!HEX64.test(String(receipt?.deployment_receipt_sha256||'')))e.push('deployed_session_binding');
 if(receipt?.runtime_execution_plane_id!==deploymentAttestation?.runtime_execution_plane_id)e.push('host_readback');
 if(!validReceipt(receipt))e.push('receipt_digest');
 return{ok:e.length===0,errors:uniq(e),receipt_sha256:receipt?.receipt_sha256||null,session_id:receipt?.session_id||null};
}
export function validateDeployedActivationEvidence({sessionBinding,sourceHead,termsDigest,acceptanceEventId,acceptanceOrigin,deadlineMs=120000}={}){
 const d=runtimeRootDescriptor(),m=readJson(MATERIALIZATION),deployment=readDeploymentAttestation(),e=[];
 const dv=validateDeploymentAttestation(deployment,{sourceHead,runtimeRootSha256:d?.runtime_root_sha256,localMaterializationReceipt:m});if(!dv.ok)e.push(...dv.errors);
 const sv=validateDeployedSessionBinding(sessionBinding,{deploymentAttestation:deployment});if(!sv.ok)e.push(...sv.errors);
 const ov=validateAcceptanceOriginAtIngress(acceptanceOrigin,{sourceHead,termsDigest,deadlineMs,eventId:acceptanceEventId});if(!ov.ok)e.push(...ov.errors);
 if(e.length)return{ok:false,errors:uniq(e),mode:'DEPLOYED',activation_profile:SESSION_CHAT_PROFILE.DEPLOYED,source_head:sourceHead,runtime_root_sha256:d?.runtime_root_sha256||null,materialization_receipt_sha256:m?.receipt_sha256||null,evidence_receipt_sha256:sessionBinding?.receipt_sha256||null,deadline_result:ov.deadline_result||null,deadline_origin_receipt_sha256:acceptanceOrigin?.receipt_sha256||null,elapsed_before_runtime_ms:ov.elapsed_before_runtime_ms??null,acceptance_event_id:acceptanceEventId,deployment_session_receipt_sha256:sessionBinding?.receipt_sha256||null};
 return{ok:true,errors:[],mode:'DEPLOYED',activation_profile:SESSION_CHAT_PROFILE.DEPLOYED,source_head:sourceHead,runtime_root_sha256:d.runtime_root_sha256,transfer_receipt_sha256:null,materialization_receipt_sha256:m.receipt_sha256,evidence_receipt_sha256:sessionBinding.receipt_sha256,elapsed_before_runtime_ms:0,deadline_result:DEADLINE_RESULT.PASS,deadline_origin_receipt_sha256:acceptanceOrigin.receipt_sha256,acceptance_event_id:acceptanceEventId,deployment_session_receipt_sha256:sessionBinding.receipt_sha256,deployment_attestation_receipt_sha256:deployment.receipt_sha256};
}
export function classifySessionChatActivation(o={}){
 const profile=o.profile;
 const integrity=profile!==SESSION_CHAT_PROFILE.DEPLOYED&&profile!==SESSION_CHAT_PROFILE.ONESHOT||o.source_match===false||o.terms_match===false||o.receipt_integrity===false||o.model_mediated_bytes===true||o.history_double_commit===true||o.epoch_binding===false||o.active_readback_contradiction===true||profile===SESSION_CHAT_PROFILE.DEPLOYED&&o.repository_transfer_per_chat===true;
 if(integrity)return'BLOCKED_INTEGRITY';
 if(o.accepted!==true)return'AWAITING_ACCEPTANCE';
 if(o.origin_valid!==true)return'ADMISSION_EPOCH_UNRECOVERABLE';
 if(o.deadline_valid!==true)return'ADMISSION_EPOCH_UNRECOVERABLE';
 if(profile===SESSION_CHAT_PROFILE.DEPLOYED){
  if(o.deployment_attested!==true||o.session_bound!==true||o.execution_plane_bound!==true)return'HOST_UNAVAILABLE';
 }else{
  if(o.carrier_observed!==true||o.byte_ingress!==true)return'HOST_UNAVAILABLE';
  if(o.remote_history_committed!==true)return'BLOCKED';
 }
 if(o.local_root_readback!==true||o.live_probe!==true||o.writer_readback!==true)return'HOST_UNAVAILABLE';
 if(o.active_commit!==true||o.active_readback!==true)return'BLOCKED';
 return'ACTIVE';
}
