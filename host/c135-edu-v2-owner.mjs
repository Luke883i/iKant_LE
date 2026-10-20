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
import {projectS03CompletedEduTurn} from './s03-owner-bound-presentation.mjs';
import {qualifyHumanFacingIdentity} from './p1-public-language-guard.mjs';
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
  // The C107 packer independently verifies every transported runtime member
  // against its HEAD Git blob. Generated qualification receipts are not runtime
  // sources and may change in CI between select/falsify steps and npm test.
  // Other tracked modifications still fail closed before package materialization.
  const changed=g(['diff','--name-only','-z','HEAD']).split('\0').filter(Boolean);
  if(changed.some(p=>!/^artifacts\/qualification\/[A-Za-z0-9_.-]+\.json$/.test(p)))return null;
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
 let lastOriginalC125=null;
 const out=createC125HostOutputPort({send:async utf8=>{await send(utf8);lastOriginalC125=utf8},afterAcceptWitness});
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
  const epistemic=await import(pathToFileURL(path.join(stage,'host/c139-edu-v2-turn.mjs')).href);
  const c139=await import(pathToFileURL(path.join(stage,'host/c139-epistemic-policy.mjs')).href);
  const c140=await import(pathToFileURL(path.join(stage,'host/c140-open-edu-turn.mjs')).href);
  const d=path.join(stage,'.ikant-host');fs.mkdirSync(d,{mode:0o700});
  const ledger=path.join(d,'c107-observations.jsonl');
  let busy=false,closed=false,uncertain=false;const seen=new Set();
  async function publishTurn(frame){
   if(uncertain)return no('S02_UNCERTAIN_WRITE_OR_DELIVERY_RECONCILE');
   if(closed||busy)return no('S02_CLOSED_OR_BUSY');
   if(!safeDeep(frame)||!clean(frame)||Object.keys(frame).some(k=>!['humanInput','nonce','priorMessages','resetContext','openScope'].includes(k))||
      typeof frame.humanInput!=='string'||!frame.humanInput.trim()||
      Buffer.byteLength(frame.humanInput,'utf8')>12000||!NONCE.test(frame.nonce)||seen.has(frame.nonce)||
      !Array.isArray(frame.priorMessages)||frame.priorMessages.length>4||
      frame.priorMessages.some(x=>typeof x!=='string'||!x.trim()||Buffer.byteLength(x,'utf8')>12000)||
      typeof frame.resetContext!=='boolean'||(frame.resetContext&&frame.priorMessages.length)||
      (frame.openScope!==undefined&&typeof frame.openScope!=='boolean'))
    return no('S02_FRAME_OR_NONCE_DENIED');
   // Consume event ID before all side effects, including the model callback.
   seen.add(frame.nonce);busy=true;
   try{
    const req={sourceHead:src.head,selection,humanInput:frame.humanInput,optIn:true};
    // C140 is an isolated child route; C70's 600-byte input never receives a truncation.
    // No self-identity policy is bypassed: explicit self-descriptions stay with C114.
    const tooLong=Buffer.byteLength(frame.humanInput,'utf8')>600;
    const planShort=!tooLong?original.previewC107CognitivePlan({request:req,
      priorMessages:frame.priorMessages,resetContext:frame.resetContext}):null;
    const shadow=!tooLong?await import(pathToFileURL(path.join(stage,'host/c132-reasoning-candidate.mjs')).href):null;
    // Shadow C132 may call 'chi sei?' general: identity language wins over
    // generic GENERAL_ONTOLOGY so frozen C114 keeps its original jurisdiction.
    const explicitSelf=/(?:\bchi\s+sei\b|\bcosa\s+sei\b|\btua\s+identit[aà]\b|\btua\s+coscienza\b|\byour\s+(?:identity|consciousness)\b|\bwhat\s+are\s+you\b)/iu.test(frame.humanInput);
    const c139Eligible=!!planShort&&c139.qualifyC139EpistemicRoute({episode:planShort,humanInput:frame.humanInput}).allowed===true;
    const generalConflict=!!planShort&&planShort.response_family==='SELF_ONTOLOGY'&&
      shadow.classifyC132Candidate(frame.humanInput).route==='GENERAL_ONTOLOGY'&&!explicitSelf;
    if(tooLong&&explicitSelf)return no('C140_SELF_IDENTITY_OWNER_BOUNDED_STOP');
    const openScope=!explicitSelf&&!c139Eligible&&(tooLong||frame.openScope===true||generalConflict);
    if(openScope){
      const plan=c140.planC140OpenTurn({humanInput:frame.humanInput,sourceHead:src.head,
        selection,priorMessages:frame.priorMessages,resetContext:frame.resetContext});
      if(plan.status!=='C140_PLAN_UNLEDGERED')return no(plan.first_unclosed_edge||'C140_PREVIEW_DENIED');
      const guidance=Object.freeze({schema:'ikant-le-c140-open-guidance/v1',
        method:'Separate observed evidence from inference; expose uncertainty and possible falsifiers. Do not claim internal consciousness or native provider execution.',
        plan_sha256:plan.plan_sha256});
      let draft;
      try{draft=await languagePort(Object.freeze({schema:'ikant-edu-v2-open-language-task/v1',
        source_head:src.head,current_input_utf8:frame.humanInput,plan:Object.freeze({
          input_sha256:plan.input_sha256,plan_sha256:plan.plan_sha256,original_c70_executed:false}),
        guidance,channels:null,topic_whitelist:false}));}
      catch{return no('C140_HOST_LANGUAGE_FAILED')}
      if(closed)return no('S02_CLOSED_AFTER_LANGUAGE');
      if(!clean(draft)||Object.keys(draft).sort().join(',')!=='ack_plan_sha256,input_sha256,text'||
         draft.input_sha256!==plan.input_sha256||draft.ack_plan_sha256!==plan.plan_sha256||
         !c140.c140OpenPolicy({humanInput:frame.humanInput,text:draft.text}).allowed||
         !qualifyHumanFacingIdentity({method:'RETRIEVE',text:draft.text}).ok)
        return no('C140_MODEL_ACK_OR_EPISTEMIC_DENIED');
      const before=inspect(stage,ledger);
      if(before?.status!=='C107_LEDGER_REOPENED')return no('C140_PREWRITE_READBACK_DENIED');
      const turn=c140.executeC140OpenTurn({ledgerFile:ledger,nonce:frame.nonce,request:req,
        priorMessages:frame.priorMessages,resetContext:frame.resetContext,
        modelCandidate:{text:draft.text,input_sha256:draft.input_sha256,ack_plan_sha256:draft.ack_plan_sha256},
        expectedPlanSha256:plan.plan_sha256});
      if(turn.status!=='C140_ORIGINAL_C100_C87_LOCAL_READBACK'||turn.voice_utf8!==draft.text||
         turn.original_c70_executed!==false||turn.original_c87_writer_executed!==true){
        uncertain=true;return no(turn.first_unclosed_edge||'C140_ORIGINAL_WRITER_STOP');}
      const after=inspect(stage,ledger);
      if(after?.status!=='C107_LEDGER_REOPENED'||after.count!==before.count+1||
         after.last_hash!==turn.ledger_event_sha256||after.latest_state?.nonce!==frame.nonce||
         after.latest_state?.source_head!==src.head||after.latest_state?.c140_open_route!==true||
         after.latest_state?.c140_original_c70_executed!==false||
         after.latest_state?.public_selection_receipt_sha256!==selection.receipt_sha256||
         after.latest_state?.visible_voice_sha256!==turn.output_sha256){
        uncertain=true;return no('C140_INDEPENDENT_C87_REOPEN_MISMATCH');}
      const evidence={schema:'ikant-c140-edu-v2-owner-evidence/v1',
        status:'C140_EDU_V2_C100_C87_READBACK',public_mode:'EDU',
        source_kind:'LOCAL_GIT_COMMIT_SOURCE_NOT_PROVIDER_ORIGIN',source_head:src.head,
        source_tree:src.tree,public_selection_receipt_sha256:selection.receipt_sha256,
        input_sha256:plan.input_sha256,original_turn:turn,
        surface_a:{origin:'HOST_BOUND',voice_utf8:turn.voice_utf8},
        original_c70_executed:false,original_c87_writer_executed:true,single_c87_writer:true,
        native_chatgpt_origin_attested:false,active:false};
      lastOriginalC125=null;
      const result=await out.publish({eventId:frame.nonce,frame:{kind:'OWNER_VOICE',mode:'EDU',
        trace:after.last_hash,continuity:'C87_INDEPENDENT_REOPEN',edge:'NATIVE_CHATGPT_PER_TURN_DISPATCH',
        next:'QUALIFY_NATIVE_HOOK',nonce:frame.nonce,input_sha256:plan.input_sha256,
        ownerReceipt:evidence,independentReadback:after}});
      if(result.ok!==true)uncertain=true;
      const delivered=Object.freeze({ok:result.ok===true,source_head:src.head,source_tree:src.tree,
       status:result.ok?'S02_EDU_V2_HOST_BOUND_LOCAL_READBACK':'S02_C125_OUTPUT_BLOCKED',
       first_edge:result.ok?'NATIVE_CHATGPT_PER_TURN_DISPATCH':result.reason,
       original_turn:turn,c87_before:before.count,c87_after:after.count,c125:result,
       active:false,native_event_attested:false});
      const s03=delivered.ok&&lastOriginalC125!==null
       ?projectS03CompletedEduTurn({ownerTurn:delivered,originalC125Text:lastOriginalC125})
       :Object.freeze({ok:false,first_edge:'S03_C125_SEND_NOT_RESOLVED',active:false});
      lastOriginalC125=null;
      return Object.freeze({...delivered,s03_host_projection:s03});
    }

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
    const route=c139.qualifyC139EpistemicRoute({episode:{...scope,input_sha256:plan.input_sha256},humanInput:frame.humanInput});
    const useC139=route.allowed===true;
    let draft;try{draft=await languagePort(Object.freeze({schema:'ikant-edu-v2-language-task/v1',
      source_head:src.head,current_input_utf8:frame.humanInput,plan:scope,guidance,
      channels:plan.c124_language_channels,
      ...(useC139?{c139_epistemic_format:c139.C139_EPISTEMIC_FORMAT}:{} )}));}catch{return no('S02_HOST_LANGUAGE_FAILED')}
    if(closed)return no('S02_CLOSED_AFTER_LANGUAGE');
    if(!clean(draft)||Object.keys(draft).sort().join(',')!==
      'ack_c124_channel_sha256,ack_plan_sha256,input_sha256,text'||
      typeof draft.text!=='string'||!draft.text.trim()||Buffer.byteLength(draft.text,'utf8')>16000||
      draft.input_sha256!==plan.input_sha256||draft.ack_plan_sha256!==guidance.plan_sha256||
      draft.ack_c124_channel_sha256!==plan.c124_language_channel_sha256)
      return no('S02_MODEL_ACK_INVALID');
    // Lexical human-language veto before the sole original C87 writer; no rewriting.
    if(!qualifyHumanFacingIdentity({method:plan.method,text:draft.text}).ok)
      return no('S02_PUBLIC_IDENTITY_LANGUAGE_DENIED');
    // C139 is a bounded, versioned alternate route; never relax original C114.
    if(useC139&&!c139.qualifyC139EpistemicCandidate({
      episode:{...scope,input_sha256:plan.input_sha256},humanInput:frame.humanInput,text:draft.text}).allowed)
      return no('S02_C139_EPISTEMIC_LANGUAGE_DENIED');
    const before=inspect(stage,ledger);if(before?.status!=='C107_LEDGER_REOPENED')return no('S02_PREWRITE_READBACK_DENIED');
    const turn=(useC139?epistemic.executeC139EpistemicTurn:original.executeC107Turn)({ledgerFile:ledger,nonce:frame.nonce,
      request:{...req,modelCandidate:{text:draft.text,input_sha256:plan.input_sha256}},
      priorMessages:frame.priorMessages,resetContext:frame.resetContext,requireHostLanguage:true,
      expectedC70OutputSha256:plan.c70_output_sha256,
      expectedC124ChannelSha256:plan.c124_language_channel_sha256});
    if(turn.status!==(useC139?'C139_ORIGINAL_C70_C100_C87_LOCAL_READBACK':'C107_ORIGINAL_C70_C100_C87_LOCAL_READBACK')||
       (useC139&&turn.c139_epistemic_guard!==true)||turn.voice_utf8!==draft.text||
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
       after.latest_state?.host_language_used!==true||
       (useC139&&after.latest_state?.c139_epistemic_guard!==true)){
      uncertain=true;return no('S02_INDEPENDENT_C87_REOPEN_MISMATCH');}
    const evidence={schema:'ikant-c135-edu-v2-owner-evidence/v1',
      status:'C135_EDU_V2_ORIGINAL_C107_C87_READBACK',public_mode:'EDU',
      source_kind:'LOCAL_GIT_COMMIT_SOURCE_NOT_PROVIDER_ORIGIN',source_head:src.head,
      source_tree:src.tree,public_selection_receipt_sha256:selection.receipt_sha256,
      input_sha256:plan.input_sha256,original_turn:turn,
      surface_a:{origin:'HOST_BOUND',voice_utf8:turn.voice_utf8},
      original_c70_executed:true,original_c87_writer_executed:true,single_c87_writer:true,
      c126_status:channels.status,c126_channels:12,native_chatgpt_origin_attested:false,active:false};
    lastOriginalC125=null;
    const result=await out.publish({eventId:frame.nonce,frame:{kind:'OWNER_VOICE',mode:'EDU',
      trace:after.last_hash,continuity:'C87_INDEPENDENT_REOPEN',edge:'NATIVE_CHATGPT_PER_TURN_DISPATCH',
      next:'QUALIFY_NATIVE_HOOK',nonce:frame.nonce,input_sha256:plan.input_sha256,
      ownerReceipt:evidence,independentReadback:after}});
    if(result.ok!==true)uncertain=true; // Unknown delivery after a C87 write: no new turns or blind retries.
    const delivered=Object.freeze({ok:result.ok===true,source_head:src.head,source_tree:src.tree,
     status:result.ok?'S02_EDU_V2_HOST_BOUND_LOCAL_READBACK':'S02_C125_OUTPUT_BLOCKED',
     first_edge:result.ok?'NATIVE_CHATGPT_PER_TURN_DISPATCH':result.reason,
     original_turn:turn,c87_before:before.count,c87_after:after.count,
     c125:result,active:false,native_event_attested:false});
    const s03=delivered.ok&&lastOriginalC125!==null
      ?projectS03CompletedEduTurn({ownerTurn:delivered,originalC125Text:lastOriginalC125})
      :Object.freeze({ok:false,first_edge:'S03_C125_SEND_NOT_RESOLVED',active:false});
    lastOriginalC125=null;
    return Object.freeze({...delivered,s03_host_projection:s03});
   }finally{busy=false}
  }
  function close(){if(!closed){closed=true;out.close();fs.rmSync(stage,{recursive:true,force:true})}}
  return Object.freeze({ok:true,mode:'EDU',source_head:src.head,source_tree:src.tree,
    runtime_ready:true,active:false,native_event_attested:false,owner:'C135_EDU_V2',
    publishTurn,close,status:()=>Object.freeze({closed,busy,uncertain,attempted:seen.size,port:out.status()})});
 }catch(e){if(stage)fs.rmSync(stage,{recursive:true,force:true});out.close();return no(e?.message||'S02_STAGE_DENIED')}
}
