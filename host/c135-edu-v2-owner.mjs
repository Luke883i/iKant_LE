/** S02 genuine local EDU/v2 owner. Never casts C72/v2 to C72/v1.
 * Uses original C107->C70/C100/C87 and independent C126/C125.
 * Source HEAD is a locally VERIFIED Git commit; NOT native/provider provenance.
 */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync,spawnSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {isProxy} from 'node:util/types';
import {validateC72V2ModeSelection} from './c72-public-mode-admission.mjs';
import {buildC107Package,stageC107Package} from '../scripts/c107-pack.mjs';
import {qualifyC126Channels} from './edu-c126-channel-qualifier.mjs';
import {compileC117SemanticGuide} from './c117-semantic-guidance.mjs';
import {createC125HostOutputPort} from './c125-output-port.mjs';
const sha=x=>crypto.createHash('sha256').update(Buffer.from(x,'utf8')).digest('hex');
const HEX=/^[a-f0-9]{40}$/;
const NONCE=/^[a-zA-Z0-9_-]{12,96}$/;
const no=first_edge=>Object.freeze({ok:false,first_edge,mode:'EDU',active:false,authority:0,native_event_attested:false});
const clean=x=>x&&typeof x==='object'&&!Array.isArray(x)&&!isProxy(x)&&
  Object.getPrototypeOf(x)===Object.prototype&&Reflect.ownKeys(x).every(k=>
  typeof k==='string'&&Object.hasOwn(Object.getOwnPropertyDescriptor(x,k),'value'));
function safeDeep(v,depth=0){
 if(depth>10)return false;
 if(v===null||typeof v==='string'||typeof v==='boolean')return true;
 if(typeof v==='number')return Number.isFinite(v);
 if(typeof v!=='object'||isProxy(v))return false;
 try{
  if(Array.isArray(v)){
   const d=Object.getOwnPropertyDescriptors(v);
   if(v.length>16||Reflect.ownKeys(d).length!==v.length+1)return false;
   for(let i=0;i<v.length;i++)if(!d[i]||!Object.hasOwn(d[i],'value')||!safeDeep(d[i].value,depth+1))return false;
   return true;
  }
  if(!clean(v))return false;
  const d=Object.getOwnPropertyDescriptors(v);
  return Reflect.ownKeys(d).length<=36&&Reflect.ownKeys(d).every(k=>safeDeep(d[k].value,depth+1));
 }catch{return false}
}

function sourceVerified(sourceRoot,selection){
 try{
  if(typeof sourceRoot!=='string'||!path.isAbsolute(sourceRoot)||
     path.resolve(sourceRoot)!==fs.realpathSync(sourceRoot))return null;
  const g=args=>execFileSync('git',args,{cwd:sourceRoot,encoding:'utf8',timeout:4000}).trim();
  const head=g(['rev-parse','HEAD']),tree=g(['rev-parse','HEAD^{tree}']);
  if(!HEX.test(head)||!HEX.test(tree)||!safeDeep(selection)||
     !validateC72V2ModeSelection(selection,{mode:'EDU',sourceHead:head})||
     selection.terms_digest!==sha(fs.readFileSync(path.join(sourceRoot,'TERMS.md'),'utf8')))return null;
  // The  C107 packer validates every executable member against Git HEAD blobs.
  // Workspace-wide modifications are rejected, but untracked local test logs are allowed.
  if(g(['status','--porcelain','--untracked-files=no']))return null;
  return {head,tree};
 }catch{return null}
}
const inspect=(dir,ledger)=>{
 const p=spawnSync(process.execPath,['scripts/c107-turn-cli.mjs',ledger],{cwd:dir,
  input:JSON.stringify({action:'INSPECT'}),encoding:'utf8',timeout:15000,maxBuffer:1000000});
 if(p.status!==0||p.signal||p.error)return null;
 try{return JSON.parse(p.stdout)}catch{return null}
};
export async function createC135EduV2Session({selection,sourceRoot,privateParent,languagePort,send,afterAcceptWitness}={}){
 if(!clean(afterAcceptWitness)||afterAcceptWitness.accepted!==true||
   afterAcceptWitness.scope!=='HOST_WITNESSED_ONLY'||typeof languagePort!=='function'||
   typeof send!=='function'||typeof privateParent!=='string'||!path.isAbsolute(privateParent)||
   !fs.existsSync(privateParent)||fs.realpathSync(privateParent)!==privateParent||
   !fs.statSync(privateParent).isDirectory())
   return no('S02_WITNESS_OR_CALLBACK_MISSING');
 const src=sourceVerified(sourceRoot,selection);
 if(!src)return no('S02_GIT_SOURCE_OR_V2_SELECTION_UNVERIFIED');
 const out=createC125HostOutputPort({send,afterAcceptWitness});
 if(!out.ok)return no('S02_ORIGINAL_C125_UNAVAILABLE');
 let stage=null;
 try{
  const pkg=buildC107Package({root:sourceRoot,expectedHead:src.head});
  if(pkg.status!=='C107_PACKAGE_BUILT_NOT_TRANSPORTED')throw Error(pkg.first_unclosed_edge||'S02_PACKAGE_STOP');
  const staged=stageC107Package({payload:pkg.payload,expectedSha256:pkg.sha256,
   expectedHead:src.head,privateParent});
  if(staged.status!=='C107_PACKAGE_REOPENED_NOT_EXECUTED')throw Error('S02_PACKAGE_NOT_REOPENED');
  stage=staged.install_root;
  const original=await import(pathToFileURL(path.join(stage,'host/c107-edu-v2-turn.mjs')).href);
  const d=path.join(stage,'.ikant-host');fs.mkdirSync(d,{mode:0o700});
  const ledger=path.join(d,'c107-observations.jsonl');
  let busy=false,closed=false,uncertain=false;const seen=new Set();
  async function publishTurn(frame){
   if(uncertain)return no('S02_UNCERTAIN_WRITE_OR_DELIVERY_RECONCILE');
   if(closed||busy)return no('S02_CLOSED_OR_BUSY');
   if(!safeDeep(frame)||!clean(frame)||Object.keys(frame).some(k=>!['humanInput','nonce','priorMessages','resetContext'].includes(k))||
      typeof frame.humanInput!=='string'||!frame.humanInput.trim()||
      Buffer.byteLength(frame.humanInput,'utf8')>600||!NONCE.test(frame.nonce)||seen.has(frame.nonce)||
      !Array.isArray(frame.priorMessages)||frame.priorMessages.length>4||
      frame.priorMessages.some(x=>typeof x!=='string'||!x.trim()||Buffer.byteLength(x,'utf8')>600)||
      typeof frame.resetContext!=='boolean'||(frame.resetContext&&frame.priorMessages.length))
    return no('S02_FRAME_OR_NONCE_DENIED');
   // Consume event ID before all side effects, including the model callback.
   seen.add(frame.nonce);busy=true;
   try{
    const req={sourceHead:src.head,selection,humanInput:frame.humanInput,optIn:true};
    const plan=original.previewC107CognitivePlan({request:req,priorMessages:frame.priorMessages,
      resetContext:frame.resetContext});
    if(plan.status!=='C107_C70_PLAN_COMPUTED_NOT_LEDGERED'||plan.c70_original_executed!==true||
       plan.input_sha256!==sha(frame.humanInput))return no('S02_C70_PREVIEW_DENIED');
    const channels=qualifyC126Channels(plan.c124_language_channels,{inputSha256:plan.input_sha256,
     channelSha256:plan.c124_language_channel_sha256});
    if(!channels.ok||channels.channels!==12)return no('S02_C126_CHANNELS_DENIED');
    const scope={schema:'ikant-le-c107-c70-before-language/v1',input_sha256:plan.input_sha256,
     c70_output_sha256:plan.c70_output_sha256,central_mode:plan.central_mode,method:plan.method,
     response_family:plan.response_family,resource_gap:plan.resource_gap,
     cognitive_window_length:plan.cognitive_window_length};
    const guidance=compileC117SemanticGuide(scope);
    let draft;try{draft=await languagePort(Object.freeze({schema:'ikant-edu-v2-language-task/v1',
      source_head:src.head,current_input_utf8:frame.humanInput,plan:scope,guidance,
      channels:plan.c124_language_channels}));}catch{return no('S02_HOST_LANGUAGE_FAILED')}
    if(closed)return no('S02_CLOSED_AFTER_LANGUAGE');
    if(!clean(draft)||Object.keys(draft).sort().join(',')!==
      'ack_c124_channel_sha256,ack_plan_sha256,input_sha256,text'||
      typeof draft.text!=='string'||!draft.text.trim()||Buffer.byteLength(draft.text,'utf8')>16000||
      draft.input_sha256!==plan.input_sha256||draft.ack_plan_sha256!==guidance.plan_sha256||
      draft.ack_c124_channel_sha256!==plan.c124_language_channel_sha256)
      return no('S02_MODEL_ACK_INVALID');
    const before=inspect(stage,ledger);if(before?.status!=='C107_LEDGER_REOPENED')return no('S02_PREWRITE_READBACK_DENIED');
    const turn=original.executeC107Turn({ledgerFile:ledger,nonce:frame.nonce,
      request:{...req,modelCandidate:{text:draft.text,input_sha256:plan.input_sha256}},
      priorMessages:frame.priorMessages,resetContext:frame.resetContext,requireHostLanguage:true,
      expectedC70OutputSha256:plan.c70_output_sha256,
      expectedC124ChannelSha256:plan.c124_language_channel_sha256});
    if(turn.status!=='C107_ORIGINAL_C70_C100_C87_LOCAL_READBACK'||turn.voice_utf8!==draft.text||
       !turn.original_c87_writer_executed||!turn.original_c70_executed||turn.public_mode!=='EDU'||
       turn.public_selection_receipt_sha256!==selection.receipt_sha256){
      uncertain=true;return no(turn.first_unclosed_edge||'S02_ORIGINAL_C107_STOP');}
    const after=inspect(stage,ledger);
    if(after?.status!=='C107_LEDGER_REOPENED'||after.count!==before.count+1||
       after.last_hash!==turn.ledger_event_sha256||after.latest_state?.nonce!==frame.nonce||
       after.latest_state?.source_head!==src.head||
       after.latest_state?.admission_schema!=='ikant-le-c72-public-selection/v2'||
       after.latest_state?.public_selection_receipt_sha256!==selection.receipt_sha256||
       after.latest_state?.visible_voice_sha256!==turn.output_sha256||
       after.latest_state?.c124_language_channel_sha256!==plan.c124_language_channel_sha256||
       after.latest_state?.host_language_used!==true){
      uncertain=true;return no('S02_INDEPENDENT_C87_REOPEN_MISMATCH');}
    const evidence={schema:'ikant-c135-edu-v2-owner-evidence/v1',
      status:'C135_EDU_V2_ORIGINAL_C107_C87_READBACK',public_mode:'EDU',
      source_kind:'LOCAL_GIT_COMMIT_SOURCE_NOT_PROVIDER_ORIGIN',source_head:src.head,
      source_tree:src.tree,public_selection_receipt_sha256:selection.receipt_sha256,
      input_sha256:plan.input_sha256,original_turn:turn,
      surface_a:{origin:'HOST_BOUND',voice_utf8:turn.voice_utf8},
      original_c70_executed:true,original_c87_writer_executed:true,single_c87_writer:true,
      c126_status:channels.status,c126_channels:12,native_chatgpt_origin_attested:false,active:false};
    const result=await out.publish({eventId:frame.nonce,frame:{kind:'OWNER_VOICE',mode:'EDU',
      trace:after.last_hash,continuity:'C87_INDEPENDENT_REOPEN',edge:'NATIVE_CHATGPT_PER_TURN_DISPATCH',
      next:'QUALIFY_NATIVE_HOOK',nonce:frame.nonce,input_sha256:plan.input_sha256,
      ownerReceipt:evidence,independentReadback:after}});
    if(result.ok!==true)uncertain=true; // Unknown delivery after a C87 write: no new turns or blind retries.
    return Object.freeze({ok:result.ok===true,source_head:src.head,source_tree:src.tree,
     status:result.ok?'S02_EDU_V2_HOST_BOUND_LOCAL_READBACK':'S02_C125_OUTPUT_BLOCKED',
     first_edge:result.ok?'NATIVE_CHATGPT_PER_TURN_DISPATCH':result.reason,
     original_turn:turn,c87_before:before.count,c87_after:after.count,
     c125:result,active:false,native_event_attested:false});
   }finally{busy=false}
  }
  function close(){if(!closed){closed=true;out.close();fs.rmSync(stage,{recursive:true,force:true})}}
  return Object.freeze({ok:true,mode:'EDU',source_head:src.head,source_tree:src.tree,
    runtime_ready:true,active:false,native_event_attested:false,owner:'C135_EDU_V2',
    publishTurn,close,status:()=>Object.freeze({closed,busy,uncertain,attempted:seen.size,port:out.status()})});
 }catch(e){if(stage)fs.rmSync(stage,{recursive:true,force:true});out.close();return no(e?.message||'S02_STAGE_DENIED')}
}
