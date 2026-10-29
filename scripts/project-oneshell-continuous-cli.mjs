#!/usr/bin/env node
/** Host transport: one live process, many human turns, original C135 per turn.
 * Framed stdin multiplexes human input and Host model responses; no native hook.
 * Prior original C72 receipts and verified source must exist before invocation.
 */
import fs from 'node:fs';
import path from 'node:path';
import {createInterface} from 'node:readline';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {openContinuousOneShell} from '../host/project-oneshell-continuous.mjs';
import {materializeOneShellFocusApp} from '../host/project-oneshell-focus-app.mjs';
import {makeOneShellChatPresentation} from '../host/project-oneshell-chat-presentation.mjs';
const sha=x=>createHash('sha256').update(Buffer.from(x,'utf8')).digest('hex');
const fail=edge=>({schema:'ikant-host-oneshell-result/v1',ok:false,voice:'NO_VOICE',edge,authority:0,active:false,native_ui_attested:false});
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const emit=x=>process.stdout.write(JSON.stringify(x)+'\n');
export async function serveContinuousOneShell({configuration,input=process.stdin,output=process.stdout}={}){
 if(!plain(configuration)||configuration.schema!=='ikant-host-oneshell-start/v1'||
    !path.isAbsolute(configuration.privateRoot||'')||typeof configuration.sourceHead!=='string')
  return fail('ONESHELL_HOST_CONFIG_INVALID');
 const bootStart=process.hrtime.bigint(); // Physical local monotonic interval; NOT provider latency.
 const elapsedMs=()=>Number((process.hrtime.bigint()-bootStart)/1000000n);
 const rx=createInterface({input,crlfDelay:Infinity});
 let pending=null,closed=false,owner=null,processing=false,head=configuration.liveHead;
 const send=x=>output.write(JSON.stringify(x)+'\n');
 const queued=[];let resolveLine=null;
 rx.on('line',line=>{
  if(Buffer.byteLength(line,'utf8')>160000){closed=true;rx.close();return;}
  let obj;try{obj=JSON.parse(line);}catch{obj=null;}
  if(pending){
   if(obj?.schema==='ikant-edu-host-language-reply/v1'&&obj.task_id===pending.id){
    const p=pending;pending=null;p.resolve(obj);return;
   }
   if(obj?.schema==='ikant-host-oneshell-human-turn/v1'){
    send(fail('ONESHELL_LANGUAGE_REPLY_PENDING'));return;
   }
   const p=pending;pending=null;p.reject(Error('ONESHELL_HOST_LANGUAGE_CORRELATION_INVALID'));return;
  }
  if(resolveLine){const r=resolveLine;resolveLine=null;r(obj);}else queued.push(obj);
 });
 rx.on('close',()=>{closed=true;if(pending){pending.reject(Error('ONESHELL_HOST_LANGUAGE_CONNECTION_LOST'));pending=null;}
  if(resolveLine){resolveLine(null);resolveLine=null;}});
 const receive=()=>queued.length?Promise.resolve(queued.shift()):closed?Promise.resolve(null):new Promise(r=>resolveLine=r);
 const languagePort=async(task,context)=>{
  if(pending||closed)throw Error('ONESHELL_HOST_LANGUAGE_BUSY_OR_CLOSED');
  const id=sha(JSON.stringify(task)+'\0'+String(cryptoSequence++));
  send({schema:'ikant-edu-host-language-task/v1',task_id:id,task,
    humanist_context:context,model_binding:'HOST_WITNESSED_ONLY',original_owner_receipt:false});
  const reply=await new Promise((resolve,reject)=>pending={id,resolve,reject});
  if(!plain(reply)||typeof reply.text!=='string'||!reply.text.trim()||
      Buffer.byteLength(reply.text,'utf8')>12000)throw Error('ONESHELL_HOST_LANGUAGE_REPLY_INVALID');
  const {schema,task_id,...originalResponse}=reply;
  return originalResponse;
 };
 let cryptoSequence=0;
 try{
  owner=await openContinuousOneShell({...configuration,readMain:async()=>head,
   languagePort,recoveryWitness:configuration.recoveryWitness??null});
  if(owner.ok!==true){send(fail(owner.edge));return owner;}
  // Host presentation files are not user-visible attachments until handed off.
  const presentations=path.join(configuration.privateRoot,'.oneshell-chat-presentations');
  if(!fs.existsSync(presentations))fs.mkdirSync(presentations,{mode:0o700});
  const readyName=(configuration.recoveryWitness?.previousWorkerGone===true?'recovered-ready-':'ready-')+
    String(owner.count()).padStart(6,'0');
  const readyApp=materializeOneShellFocusApp({frame:owner.frame,outputDirectory:presentations,reportName:readyName});
  if(readyApp.ok!==true){send(fail(readyApp.edge));return fail(readyApp.edge);}
  const readyChat=makeOneShellChatPresentation({frame:owner.frame,focusApp:readyApp});
  if(readyChat.ok!==true){send(fail(readyChat.edge));return fail(readyChat.edge);}
  send({schema:'ikant-host-oneshell-result/v1',ok:true,phase:'EDU_READY',
   frame:owner.frame,content:owner.content,focus_app:readyApp,chat_presentation:readyChat,
   host_boot_elapsed_ms:elapsedMs(),host_boot_clock:'NODE_MONOTONIC_ONLY',
   authority:0,active:false,native_ui_attested:false});
  while(!closed){
   const req=await receive();if(req===null)break;
   if(!plain(req)||req.schema!=='ikant-host-oneshell-human-turn/v1'||
      typeof req.liveHead!=='string'||typeof req.humanInput!=='string'){
    send(fail('ONESHELL_CURRENT_HOST_EVENT_REQUIRED'));continue;
   }
   if(processing){send(fail('ONESHELL_CONCURRENT_HUMAN_TURN'));continue;}
   processing=true;
   try{
    head=req.liveHead; // Host-supplied GitHub observation, NOT provider-authenticated.
    const result=await owner.publishHumanTurn({humanInput:req.humanInput,
      nonce:req.nonce,humanMessageObserved:req.humanMessageObserved===true});
    if(result.ok===true){
      const app=materializeOneShellFocusApp({frame:result.frame,outputDirectory:presentations,
       reportName:'turn-'+String(result.original_c87_count).padStart(6,'0')});
      if(app.ok!==true){send(fail('ONESHELL_CHAT_PROJECTION_UNKNOWN_NO_RETRY'));return fail('ONESHELL_CHAT_PROJECTION_UNKNOWN_NO_RETRY');}
      const chat=makeOneShellChatPresentation({frame:result.frame,humanInput:req.humanInput,focusApp:app});
      if(chat.ok!==true){send(fail('ONESHELL_CHAT_PROJECTION_UNKNOWN_NO_RETRY'));return fail('ONESHELL_CHAT_PROJECTION_UNKNOWN_NO_RETRY');}
      send({schema:'ikant-host-oneshell-result/v1',...result,focus_app:app,chat_presentation:chat,
       host_head_origin_attested:false,native_delivery_attested:false});
    }else{
      send({schema:'ikant-host-oneshell-result/v1',...result,
       host_head_origin_attested:false,native_delivery_attested:false});
    }
   }catch{send(fail('ONESHELL_TURN_OUTCOME_UNKNOWN_NO_RETRY'));}
   finally{processing=false;}
  }
  return {ok:true,closed_by_input:true,authority:0,native_delivery_attested:false};
 }catch{send(fail('ONESHELL_HOST_TRANSPORT_UNKNOWN'));return fail('ONESHELL_HOST_TRANSPORT_UNKNOWN');}
 finally{try{owner?.close();}catch{}rx.close();}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  const p=process.argv[2];if(!p||!path.isAbsolute(p))throw Error('ABSOLUTE_HOST_CONFIG_REQUIRED');
  const q=JSON.parse(fs.readFileSync(p,'utf8'));
  const r=await serveContinuousOneShell({configuration:q});if(r.ok!==true)process.exitCode=2;
 }catch(e){emit(fail(String(e.message||'ONESHELL_START_INVALID')));process.exitCode=2;}
}
