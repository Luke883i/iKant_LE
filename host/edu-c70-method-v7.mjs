/** C119/PR119 adapter extension: C70 compute-first before HOST_BOUND language.
 * Host-owned orchestration, not a new original source, carrier, runtime owner or C87 writer.
 * No native ChatGPT hook, provider origin, cognitive causality or ACTIVE is attested.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {isProxy} from 'node:util/types';
import {createLocalCohostAdapter,denyHostTurn} from './edu-cohost-outcome.mjs';
import {compileC117SemanticGuide} from './c117-semantic-guidance.mjs';
import {PIN} from './c107-carrier-consumer.mjs';
const H=v=>crypto.createHash('sha256').update(Buffer.from(v,'utf8')).digest('hex');
const SHA64=/^[0-9a-f]{64}$/;
const no=edge=>({schema:'ikant-edu-c70-guided/v7',surface_a:{origin:'NO_VOICE',voice_utf8:null},surface_a_label:'iKant | NO_VOICE',surface_b:{
 origin:'CHATGPT_HOST',MODE:'EXPERIMENTAL',STATUS:'NO_VOICE',TRACE_REF:'NOT_SAVED',
 CONTINUITY:'CONTINUITY_UNVERIFIED',FIRST_EDGE:edge,NEXT:'OWNER_NEXT',ACTIVE:false,
 NATIVE_HOOK_ATTESTED:false,PROVIDER_ORIGIN_ATTESTED:false,
 SEMANTIC_CAUSALITY_ATTESTED:false},active:false});
// Descriptor-only ingress validation: reads no hostile getters and rejects Proxy.
function safe(v,depth=0){
 if(depth>9)return false;
 if(v===null||typeof v==='string'||typeof v==='boolean')return true;
 if(typeof v==='number')return Number.isFinite(v);
 if(typeof v!=='object'||isProxy(v))return false;
 try{
  if(Array.isArray(v)){
   const ds=Object.getOwnPropertyDescriptors(v);
   if(v.length>16||Reflect.ownKeys(ds).length!==v.length+1)return false;
   for(let i=0;i<v.length;i++)if(!ds[i]||!Object.hasOwn(ds[i],'value')||!safe(ds[i].value,depth+1))return false;
   return true;
  }
  if(Object.getPrototypeOf(v)!==Object.prototype&&Object.getPrototypeOf(v)!==null)return false;
  const ds=Object.getOwnPropertyDescriptors(v),ks=Reflect.ownKeys(ds);
  return ks.length<=36&&ks.every(k=>typeof k==='string'&&k!=='__proto__'&&k!=='constructor'&&k!=='prototype'&&
   Object.hasOwn(ds[k],'value')&&safe(ds[k].value,depth+1));
 }catch{return false;}
}
const exactFields=(o,allowed)=>Object.keys(o).every(k=>allowed.includes(k));
const getInspector=(dir,ledger)=>{
 const p=spawnSync(process.execPath,['scripts/c107-turn-cli.mjs',ledger],{
  cwd:dir,encoding:'utf8',input:JSON.stringify({action:'INSPECT'}),timeout:15000,maxBuffer:1000000});
 if(p.status!==0)return null;
 try{return JSON.parse(p.stdout);}catch{return null;}
};
export async function createGuidedCohostV7({carrierBytes,privateParent,languagePort}={}){
 if(typeof languagePort!=='function')return {ok:false,first_edge:'HOST_LANGUAGE_PORT_NOT_CALLABLE',blocked:no('HOST_LANGUAGE_PORT_NOT_CALLABLE')};
 let base;
 try{base=await createLocalCohostAdapter({carrierBytes,privateParent});}
 catch{return {ok:false,first_edge:'PR119_ADAPTER_EXCEPTION',blocked:no('PR119_ADAPTER_EXCEPTION')};}
 if(!base.ok)return {...base,blocked:no(base.first_edge||'P01_PR119_SOURCE_UNAVAILABLE')};
 const root=base.install_root;
 const c107=await import(pathToFileURL(path.join(root,'host/c107-experimental-turn.mjs')).href);
 const c72=await import(pathToFileURL(path.join(root,'host/c72-unified-mode-admission.mjs')).href);
 let closed=false;
 async function runGuidedTurn(frame){
  if(closed)return no('ADAPTER_CLOSED');
  if(!safe(frame)||!exactFields(frame,['humanInput','nonce','selection','priorMessages','resetContext','authorization']))
   return no('V7_UNSAFE_FRAME');
  const {humanInput,nonce,selection,priorMessages=[],resetContext=false,authorization}=frame;
  if(!authorization||authorization.human_mode_selected!==true||authorization.opt_in_confirmed!==true||
   authorization.separate_cohost_draft_authorized!==true||
   !['LOCAL_TEST_FIXTURE','HOST_TEXT_WITNESSED'].includes(authorization.provenance))return no('V7_SEPARATE_DRAFT_AUTHORIZATION');
  if(typeof humanInput!=='string'||!humanInput.trim()||Buffer.byteLength(humanInput,'utf8')>600||
   typeof nonce!=='string'||!/^[A-Za-z0-9_-]{12,96}$/.test(nonce)||
   !Array.isArray(priorMessages)||priorMessages.length>4||priorMessages.some(s=>typeof s!=='string'||!s.trim()||Buffer.byteLength(s,'utf8')>600)||
   typeof resetContext!=='boolean'||(resetContext&&priorMessages.length!==0))return no('V7_INPUT_NONCE_OR_WINDOW');
  if(!c72.validateC72ModeSelection(selection,{mode:'EXPERIMENTAL',sourceHead:PIN.head}))return no('V7_ORIGINAL_C72_SELECTION_INVALID');
  const request={sourceHead:PIN.head,selection,humanInput,optIn:true};
  const preview=c107.previewC107CognitivePlan({request,priorMessages,resetContext});
  if(preview.status!=='C107_C70_PLAN_COMPUTED_NOT_LEDGERED'||preview.c70_original_executed!==true||
   preview.input_sha256!==H(humanInput)||!SHA64.test(preview.c70_output_sha256))return no(preview.first_unclosed_edge||'V7_ORIGINAL_C70_PREVIEW');
  const plan=Object.freeze({schema:'ikant-le-c107-c70-before-language/v1',
   input_sha256:preview.input_sha256,c70_output_sha256:preview.c70_output_sha256,
   central_mode:preview.central_mode,method:preview.method,
   response_family:preview.response_family,resource_gap:preview.resource_gap,
   cognitive_window_length:preview.cognitive_window_length});
  let guidance;
  try{guidance=compileC117SemanticGuide(plan);}catch{return no('V7_C70_SEMANTIC_GUIDE_INVALID');}
  const task=Object.freeze({schema:'ikant-edu-c70-language-task/v7',
   source_head:PIN.head,current_input_utf8:humanInput,prior_messages_utf8:Object.freeze([...priorMessages]),
   plan,guidance,statement:'Guidance received is not evidence of model comprehension or independent semantic causality.'});
  let draft;
  try{draft=await languagePort(task);}catch{return no('V7_HOST_LANGUAGE_ERROR');}
  if(!safe(draft)||!exactFields(draft,['text','ack_plan_sha256','input_sha256'])||
   typeof draft.text!=='string'||!draft.text.trim()||Buffer.byteLength(draft.text,'utf8')>16000||
   draft.ack_plan_sha256!==guidance.plan_sha256||draft.input_sha256!==preview.input_sha256)
   return no('V7_PLAN_ACK_OR_HOST_TEXT_INVALID');
  // PR119 calls C107 without requireHostLanguage. In guarded routes C107 would
  // otherwise append an ORIGINAL_DEMO fallback even when the host draft is denied.
  // Pre-check the ORIGINAL C114 policy before any C87 write; do not create a
  // second guard owner or replace original C107's own later guard decision.
  const guarded=['CRITIQUE','HORIZON_BLOCK','PRACTICAL_REVIEW','SYNTHESIS_REPAIR'].includes(plan.central_mode)||
   plan.method==='DIRECT_IDENTITY'||plan.response_family==='SELF_ONTOLOGY'||plan.resource_gap===true;
  if(guarded){
   const c114=await import(pathToFileURL(path.join(root,'host/c114-ontology-language-policy.mjs')).href);
   const review=c114.qualifyC114OntologyCandidate({episode:plan,text:draft.text});
   if(review.allowed!==true)return no(review.reason||'V7_ORIGINAL_C114_HOST_TEXT_REJECTED_PREWRITE');
  }
  const before=getInspector(root,base.ledger_file);
  if(before?.status!=='C107_LEDGER_REOPENED')return no('V7_C87_PREFLIGHT_READBACK');
  const result=base.runTurn({humanInput,nonce,selection,priorMessages,resetContext,authorization,
   modelCandidate:{input_sha256:preview.input_sha256,text:draft.text}});
  if(result.surface_a?.origin!=='HOST_BOUND'||result.surface_a.voice_utf8!==draft.text||
   result.surface_b?.visible_voice_sha256!==H(draft.text)||result.surface_b?.INPUT_REF!==preview.input_sha256)
   return no(result.surface_b?.FIRST_EDGE||'V7_PR119_ORIGINAL_GUARD_DENIED');
  const after=getInspector(root,base.ledger_file);
  if(after?.status!=='C107_LEDGER_REOPENED'||after.count!==before.count+1||
   after.last_hash!==result.surface_b.TRACE_REF||after.latest_state?.nonce!==nonce||
   after.latest_state?.source_c70_sha256!==preview.c70_output_sha256||
   after.latest_state?.visible_voice_sha256!==H(draft.text)||after.latest_state?.host_language_used!==true)
   return no('V7_INDEPENDENT_C87_READBACK_MISMATCH');
  const B=result.surface_b;
  // Publish the original PR119 result unmodified, then read-only projection with no new writer.
  const brief=Object.freeze({MODE:'EXPERIMENTAL',STATUS:'HOST_BOUND_LOCAL_NOT_ACTIVE',
   ORIGIN:'HOST_AUTHORED_ORIGINAL_C100_C87',TRACE_REF:B.TRACE_REF,
   CONTINUITY:'C87_INDEPENDENT_PROCESS_REOPEN',C70_PLAN_SHA256:guidance.plan_sha256,
   C70_ROUTE:guidance.route_id,
   ACK_SCOPE:'PROTOCOL_ONLY_NOT_SEMANTIC_PROOF',SOURCE_REF:PIN.head,
   FIRST_EDGE:'NATIVE_CHATGPT_PER_TURN_DISPATCH',NEXT:'INDEPENDENT_HOST_FIELD_WITNESS',
   ACTIVE:false,PROVIDER_ATTESTED:false,SEMANTIC_CAUSALITY_ATTESTED:false});
  return Object.freeze({schema:'ikant-edu-c70-guided/v7',surface_a:Object.freeze({...result.surface_a}),
   surface_a_label:'iKant EXPERIMENTAL | voce testuale host guidata da C70, validata e riaperta',
   surface_b:brief,pr119_surface_b:B,source_receipt_sha256:result.surface_b.source_package_sha256,
   status:'PR119_OWNER_C70_GUIDED_LOCAL_READBACK',active:false});
 }
 function checkpoint(){
  if(closed)return Object.freeze({status:'CLOSED',continuity:'UNVERIFIED'});
  const r=getInspector(root,base.ledger_file);
  if(r?.status!=='C107_LEDGER_REOPENED')return Object.freeze({status:'UNVERIFIED',continuity:'CONTINUITY_UNVERIFIED'});
  return Object.freeze({status:'LOCAL_C87_REOPENED',count:r.count,last_hash:r.last_hash,
   source_head:PIN.head,continuity:'LOCAL_ONLY_NOT_NATIVE',persistent_across_chats_attested:false});
 }
 return Object.freeze({ok:true,runGuidedTurn,checkpoint,recovery:base.recovery,
  dispose:()=>{if(!closed){closed=true;base.dispose();}},
  get install_root(){return root;},get ledger_file(){return base.ledger_file;}});
}
