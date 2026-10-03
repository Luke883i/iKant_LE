import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {ROOT,readTerms,sha256} from './contract.mjs';
import {runtimeRootDescriptor,validateRuntimeRootDescriptor,preRuntimeSelfCheck,validatePreacceptKernelInput,validateActivationExecutorReceipt} from './runtime-root-verified.mjs';
import {issueLimitedRuntimeCapability,validateLimitedRuntimeCapability} from './runtime-limited-capability.mjs';
import {processLimitedRuntimeTurn} from './runtime-limited-turn.mjs';

const HEX40=/^[a-f0-9]{40}$/,HEX64=/^[a-f0-9]{64}$/;
const LEDGER=path.join(ROOT,'.ikant','ledger.jsonl'),CAP=path.join(ROOT,'.ikant','limited-capability.json'),ORIGIN=path.join(ROOT,'.ikant','acceptance-origin.json');
function gitBlobSha1(bytes){const b=Buffer.isBuffer(bytes)?bytes:Buffer.from(bytes);return crypto.createHash('sha1').update(Buffer.from(`blob ${b.length}\0`)).update(b).digest('hex');}
function digestWithout(x,key='receipt_sha256'){const y=structuredClone(x||{});delete y[key];return sha256(Buffer.from(JSON.stringify(y)));}
function atomicJson(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});const tmp=file+'.tmp-'+crypto.randomUUID();let fd=null;try{fd=fs.openSync(tmp,'wx',0o600);fs.writeFileSync(fd,JSON.stringify(value,null,2)+'\n');fs.fsyncSync(fd);}finally{if(fd!==null)fs.closeSync(fd);}fs.renameSync(tmp,file);const reread=JSON.parse(fs.readFileSync(file,'utf8'));if(JSON.stringify(reread)!==JSON.stringify(value))throw new Error('runtime local ingress readback mismatch:'+path.basename(file));}
function signTicket(material){return{...material,ticket_sha256:sha256(Buffer.from(JSON.stringify(material)))};}
function signReceipt(material){return{...material,receipt_sha256:sha256(Buffer.from(JSON.stringify(material)))};}
function readMaterialization(){return JSON.parse(fs.readFileSync(path.join(ROOT,'.ikant','materialization.json'),'utf8'));}

export function validatePreRuntimeHandoff(h){
 const e=[],d=runtimeRootDescriptor(ROOT),dv=validateRuntimeRootDescriptor(d);if(!dv.ok)e.push(...dv.errors.map(x=>'descriptor:'+x));
 if(!h||h.schema!=='ikant-le-pre-runtime-handoff/v2')e.push('schema');if(h?.authority!==0)e.push('authority');if(!HEX40.test(String(h?.source_head||'')))e.push('source_head');if(h?.runtime_root_sha256!==d?.runtime_root_sha256)e.push('runtime_root_digest');if(h?.runtime_owner!=='src/session-local-service.mjs')e.push('runtime_owner');if(h?.first_unclosed_edge!=='ACTIVE_READBACK'||h?.active!==false)e.push('active_boundary');
 const ingress=h?.acceptance_ingress;if(!ingress||ingress.human_input!=='I ACCEPT'||ingress.authority!==0||!Number.isFinite(ingress.observed_monotonic_ms))e.push('acceptance_ingress');
 const boot=JSON.parse(fs.readFileSync(path.join(ROOT,'BOOTSTRAP.json'),'utf8')),ph=h?.preaccept_handoff,pv=validatePreacceptKernelInput(ph,{workspace:ROOT,sourceHead:h?.source_head,boot});
 if(!pv.ok)e.push(...pv.errors.map(x=>'preaccept:'+x));if(sha256(Buffer.from(JSON.stringify(ph||{})))!==h?.preaccept_handoff_sha256)e.push('preaccept_digest');
 const ax=h?.activation_executor,av=validateActivationExecutorReceipt(ax,{workspace:ROOT,sourceHead:h?.source_head,descriptor:d,orientation:pv.orientation||[],requireSourceObjectReadback:false});
 if(!av.ok)e.push(...av.errors.map(x=>'executor:'+x));if(ax?.receipt_sha256!==h?.activation_executor_receipt_sha256)e.push('executor_receipt_binding');
 const self=preRuntimeSelfCheck({workspace:ROOT});if(!self.ok)e.push('kernel_self_check');if(h?.kernel_self_check?.receipt_sha256!==h?.kernel_self_check_receipt_sha256||self.receipt.receipt_sha256!==h?.kernel_self_check_receipt_sha256)e.push('kernel_self_binding');
 if(JSON.stringify(h?.kernel_self_check)!==JSON.stringify(self.receipt))e.push('kernel_self_object');
 const termsObject=h?.terms_object,termsBytes=fs.readFileSync(path.join(ROOT,'TERMS.md'));if(termsObject?.path!=='TERMS.md'||!HEX40.test(String(termsObject?.blob_sha1||''))||termsObject?.bytes!==termsBytes.length||termsObject?.blob_sha1!==gitBlobSha1(termsBytes)||JSON.stringify(termsObject)!==JSON.stringify(ph?.terms_object))e.push('terms_object');
 let m=null;try{m=readMaterialization();}catch{e.push('materialization_missing');}
 if(m&&(m.schema!=='ikant-le-runtime-root-materialization/v2'||m.source_head!==h?.source_head||m.runtime_root_sha256!==d?.runtime_root_sha256||m.receipt_sha256!==h?.materialization_receipt_sha256||m.reopen_verified!==true||m.atomic_publish!==true))e.push('materialization_binding');
 if(m&&m.activation_executor_receipt_sha256!==h?.activation_executor_receipt_sha256)e.push('materialization_executor_binding');
 if(m&&JSON.stringify(m.reverified_orientation_objects||[])!==JSON.stringify(pv.orientation||[]))e.push('materialization_orientation_binding');
 if(!HEX64.test(String(h?.activation_executor_receipt_sha256||''))||!HEX64.test(String(h?.kernel_self_check_receipt_sha256||''))||!HEX64.test(String(h?.preaccept_handoff_sha256||'')))e.push('evidence_digest');
 if(!HEX64.test(String(h?.receipt_sha256||''))||digestWithout(h)!==h.receipt_sha256)e.push('receipt_digest');
 return{ok:e.length===0,errors:[...new Set(e)],descriptor:d};
}
export async function acceptLocalLimitedSession({handoff,hostSurface='SESSION_CHAT_LOCAL_RUNTIME'}={}){
 if(fs.existsSync(LEDGER))throw new Error('canonical ledger already exists');if(fs.existsSync(CAP))throw new Error('limited acceptance already consumed');
 const v=validatePreRuntimeHandoff(handoff);if(!v.ok)throw new Error('pre-runtime handoff invalid: '+v.errors.join(','));
 const terms=readTerms(),origin=Number(handoff.acceptance_ingress.observed_monotonic_ms),entry=Number(performance.now()),eventId='acceptance-event-'+crypto.randomUUID();
 const ticket=signTicket({schema:'ikant-le-acceptance-origin-ticket/v1',event_id:eventId,source_head:handoff.source_head,terms_digest:terms.digest,deadline_origin:'I_ACCEPT',clock:'MONOTONIC',observed_at_accept:true,origin_monotonic_ms:origin,authority:0});
 const originReceipt=signReceipt({schema:'ikant-le-acceptance-origin/v2',event_id:eventId,source_head:handoff.source_head,terms_digest:terms.digest,deadline_origin:'I_ACCEPT',clock:'MONOTONIC',observed_at_accept:true,origin_ticket:ticket,origin_monotonic_ms:origin,runtime_entry_monotonic_ms:entry,elapsed_to_runtime_entry_ms:Math.max(0,entry-origin),authority:0});
 atomicJson(ORIGIN,originReceipt);
 const capability=await issueLimitedRuntimeCapability({sourceHead:handoff.source_head,acceptanceOrigin:originReceipt,termsDigest:terms.digest,hostSurface,workspace:ROOT});
 const cv=validateLimitedRuntimeCapability(capability,{workspace:ROOT,sourceHead:handoff.source_head,acceptanceEventId:eventId,termsDigest:terms.digest});if(!cv.ok)throw new Error('issued limited capability invalid: '+cv.errors.join(','));
 atomicJson(CAP,capability);if(fs.existsSync(LEDGER))throw new Error('limited acceptance mutated canonical ledger');
 const material={schema:'ikant-le-session-local-limited-accept/v1',state:'RUNTIME_BOUND_LIMITED',claim_class:'IKANT_RUNTIME_LIMITED',source_head:handoff.source_head,runtime_root_sha256:v.descriptor.runtime_root_sha256,acceptance_event_id:eventId,pre_runtime_handoff_receipt_sha256:handoff.receipt_sha256,acceptance_origin_receipt_sha256:originReceipt.receipt_sha256,capability_receipt_sha256:capability.receipt_sha256,first_unclosed_edge:'ACTIVE_READBACK',canonical_state_mutation:false,active:false,authority:0};
 return{...material,receipt_sha256:sha256(Buffer.from(JSON.stringify(material)))};
}

export async function runLocalLimitedTurn({input,candidate,hostSurface='SESSION_CHAT_LOCAL_RUNTIME'}={}){
 if(fs.existsSync(LEDGER))throw new Error('limited turn canonical ledger mutation detected');if(!fs.existsSync(CAP))throw new Error('limited capability unavailable');
 const capability=JSON.parse(fs.readFileSync(CAP,'utf8')),out=processLimitedRuntimeTurn({input:String(input??''),candidate:String(candidate??''),capability,hostSurface,artifactDir:path.join(ROOT,'.ikant','artifacts')});
 if(fs.existsSync(LEDGER))throw new Error('limited turn mutated canonical ledger');
 return{schema:'ikant-le-session-local-limited-turn/v1',state:'RUNTIME_BOUND_LIMITED',mode:out.mode,active:false,stdout:out.stdout,code:out.code,artifacts:out.artifacts,session_shell:out.session_shell,capability_receipt_sha256:capability.receipt_sha256,node_dispatch_receipt_sha256:out.node_dispatch.receipt_sha256,runtime_seal_sha256:out.runtime_seal.seal_sha256,telemetry_sha256:out.telemetry.telemetry_sha256,limited_turn_receipt_sha256:out.receipt.receipt_sha256,first_unclosed_edge:'ACTIVE_READBACK',canonical_state_mutation:false,platform_ack_required:false,host_delivery_proven:false,authority:0};
}

function arg(name){const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:null;}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const op=process.argv[2];
 try{
  if(op==='accept'){const f=arg('--handoff');if(!f)throw new Error('handoff path required');const out=await acceptLocalLimitedSession({handoff:JSON.parse(fs.readFileSync(f,'utf8'))});process.stdout.write(JSON.stringify(out)+'\n');}
  else if(op==='turn'){const i=arg('--input-file'),c=arg('--candidate-file');if(!i||!c)throw new Error('input and candidate files required');const out=await runLocalLimitedTurn({input:fs.readFileSync(i,'utf8'),candidate:fs.readFileSync(c,'utf8')});process.stdout.write(JSON.stringify(out)+'\n');}
  else throw new Error('usage: node src/session-local-service.mjs <accept|turn> ...');
 }catch(e){process.stderr.write(String(e?.message||e)+'\n');process.exitCode=1;}
}
