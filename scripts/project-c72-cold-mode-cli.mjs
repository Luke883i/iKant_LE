#!/usr/bin/env node
/** Host-only C72/v2 EDU later-message reentry, no checkout or new owner.
 * This command needs two ORIGINAL pinned Git blobs transported into this Node
 * process. A Host assertion of a new message is not provider authentication. */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';

const FILES=Object.freeze([
 'contracts/c72-public-mode-admission-v2.json',
 'host/c72-public-mode-admission.mjs'
]);
const H40=/^[a-f0-9]{40}$/u;
const B64=/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u;
const isObj=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const fail=first_edge=>({ok:false,first_edge,original_owner_invoked:false,
  native_event_attested:false,active:false,authority:0});
function validate(q){
 if(!isObj(q)||q.schema!=='ikant-host-c72-later-mode/v1'||q.humanMessage!=='EDU'||
    q.freshHumanTurn!==true||q.priorAcceptanceObserved!==true||
    q.ownerOutcome!=='NOT_INVOKED')throw Error('C72_LATER_EXACT_EDU_REQUIRED');
 if(!H40.test(q.sourceHead||'')||q.liveHead!==q.sourceHead||
    q.accepted?.source_head!==q.sourceHead||q.introduction?.source_head!==q.sourceHead)
   throw Error('C72_LATER_SOURCE_LOCK_STALE');
 if(!isObj(q.expectedBlobShas)||!Array.isArray(q.sourcePacket)||
    q.sourcePacket.length!==FILES.length)throw Error('C72_LATER_TWO_ORIGINAL_FILES_REQUIRED');
 const originals=new Map();
 for(let i=0;i<FILES.length;i++){
  const p=FILES[i],f=q.sourcePacket[i];
  if(!isObj(f)||f.path!==p||!H40.test(q.expectedBlobShas[p]||'')||
     typeof f.contentBase64!=='string'||f.contentBase64.length>350000||
     f.contentBase64.length%4!==0||!B64.test(f.contentBase64))throw Error('C72_LATER_PACKET_INVALID');
  const b=Buffer.from(f.contentBase64,'base64');
  if(b.length<1||b.length>256000||b.toString('base64')!==f.contentBase64||
     blob(b)!==q.expectedBlobShas[p])throw Error('C72_LATER_GIT_BLOB_MISMATCH');
  const s=new TextDecoder('utf-8',{fatal:true}).decode(b);
  if(!Buffer.from(s,'utf8').equals(b))throw Error('C72_LATER_UTF8_LOSS');
  originals.set(p,b);
 }
 return originals;
}
export async function selectOriginalC72LaterEDU(q){
 let originals;
 try{originals=validate(q);}catch(e){return fail(String(e.message||'C72_LATER_INPUT_INVALID'));}
 let temp=null,attempted=false;
 try{
  temp=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c72-mode-'));fs.chmodSync(temp,0o700);
  for(const [p,b] of originals){
   const target=path.join(temp,p);fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});
   fs.writeFileSync(target,b,{flag:'wx',mode:0o600});
   const again=fs.readFileSync(target);
   if(!again.equals(b)||blob(again)!==q.expectedBlobShas[p])throw Error('C72_LATER_READBACK_DRIFT');
  }
  const owner=await import(pathToFileURL(path.join(temp,FILES[1])).href);
  if(!owner.validateC72V2Accepted(q.accepted)||!owner.validateC72V2Orientation(q.introduction,q.accepted))
   return fail('C72_LATER_ORIGINAL_ACCEPTANCE_INVALID');
  attempted=true;
  const selection=owner.selectC72V2Mode({accepted:q.accepted,
    orientation:q.introduction,humanMessage:q.humanMessage});
  if(!owner.validateC72V2ModeSelection(selection,{mode:'EDU',sourceHead:q.sourceHead})||
     selection.acceptance_receipt_sha256!==q.accepted.receipt_sha256||
     selection.orientation_receipt_sha256!==q.introduction.receipt_sha256)
   return {...fail('C72_LATER_ORIGINAL_SELECTION_INVALID'),original_owner_invoked:true};
  return {ok:true,status:'C72_ORIGINAL_EDU_MODE_VERIFIED',
   original_owner_invoked:true,verified_file_count:FILES.length,
   source_head:q.sourceHead,selection,original_accepted_sha256:q.accepted.receipt_sha256,
   original_introduction_sha256:q.introduction.receipt_sha256,
   native_event_attested:false,source_origin_attested:false,active:false,authority:0};
 }catch{return {...fail(attempted?'C72_LATER_OWNER_OUTCOME_UNKNOWN':'C72_LATER_EXECUTION_UNKNOWN'),
             original_owner_invoked:attempted};}
 finally{if(temp)fs.rmSync(temp,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  let raw='';for await(const chunk of process.stdin){
   raw+=chunk.toString('utf8');
   if(Buffer.byteLength(raw,'utf8')>1200000)throw Error('C72_LATER_REQUEST_TOO_LARGE');
  }
  const result=await selectOriginalC72LaterEDU(JSON.parse(raw));
  process.stdout.write(JSON.stringify(result)+'\n');
  if(!result.ok)process.exitCode=2;
 }catch(e){process.stdout.write(JSON.stringify(fail(String(e.message||'C72_LATER_BAD_REQUEST')))+'\n');
   process.exitCode=2;}
}
