import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {Worker} from 'node:worker_threads';
import {pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';

const HEX40=/^[a-f0-9]{40}$/;
const SAFE=/^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[A-Za-z0-9._/-]+$/;
const blob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
function decode(b64){
  if(typeof b64!=='string')throw Error('base64 required');
  const s=b64.replace(/[\r\n]/g,'');
  if(!s||s.length%4||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('invalid base64');
  const b=Buffer.from(s,'base64');
  if(b.toString('base64')!==s)throw Error('noncanonical base64');
  return b;
}
function inspectFrozen(x){
  if(x?.humanInput!=='I ACCEPT'||!HEX40.test(String(x.sourceHead))||x.preacceptHandoff?.source_head!==x.sourceHead)throw Error('acceptance/source binding');
  const h=x.preacceptHandoff;
  if(h?.schema!=='ikant-le-preaccept-handoff/v2'||h.terms_presented!==true||h.frozen!==true||h.breached!==false)throw Error('frozen admission');
  if(!Number.isFinite(x.acceptanceObservedMonotonicMs)||x.acceptanceObservedMonotonicMs<0||x.acceptanceObservedMonotonicMs>performance.now())throw Error('monotonic acceptance');
  if(!Number.isInteger(x.runnerCount??4)||(x.runnerCount??4)<1||(x.runnerCount??4)>7)throw Error('runner count');
  const frozen=h.orientation_payloads?.find(y=>y.path==='BOOTSTRAP.json');
  const id=h.orientation_objects?.find(y=>y.path==='BOOTSTRAP.json');
  if(typeof frozen?.content_utf8!=='string'||!id)throw Error('missing frozen bootstrap');
  const bootBytes=Buffer.from(frozen.content_utf8,'utf8');
  if(id.bytes!==bootBytes.length||blob(bootBytes)!==id.blob_sha1)throw Error('bootstrap samehash');
  const boot=JSON.parse(frozen.content_utf8);
  const descriptor=boot.post_accept_fastboot?.runtime_root;
  const rows=[descriptor?.loader,...(descriptor?.shards||[])];
  if(rows.length!==8||rows.some(y=>!SAFE.test(String(y?.path))||!HEX40.test(String(y?.blob_sha1)))||new Set(rows.map(y=>y.path)).size!==8)throw Error('bad runtime8 descriptor');
  if(JSON.stringify(boot.post_accept_fastboot?.remote_paths)!==JSON.stringify(rows.map(y=>y.path)))throw Error('runtime8 frozen set mismatch');
  return{bootBytes,rows};
}
function inspect(x){
  const {bootBytes,rows}=inspectFrozen(x);
  if(!Array.isArray(x.sourceObjects)||x.sourceObjects.length!==8)throw Error('runtime8 incomplete');
  const bytes=new Map();
  for(const y of x.sourceObjects){
    if(!y||bytes.has(y.path)||!rows.some(z=>z.path===y.path)||!String(y.source_object_identity||'').trim())throw Error('invalid path/identity/duplicate');
    const b=decode(y.content_base64),expected=rows.find(z=>z.path===y.path);
    if(blob(b)!==expected.blob_sha1||y.blob_sha1!==expected.blob_sha1)throw Error('source blob mismatch: '+y.path);
    bytes.set(y.path,{data:b,identity:y.source_object_identity});
  }
  return{bootBytes,rows,bytes};
}
function write(root,rel,bytes,sha){
  if(!SAFE.test(rel)||blob(bytes)!==sha)throw Error('write source identity');
  const file=path.join(root,rel);
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,bytes,{flag:'wx',mode:0o600});
  const reopened=fs.readFileSync(file);
  if(!reopened.equals(bytes)||blob(reopened)!==sha)throw Error('local samehash: '+rel);
}
function writeWorker(){
  const {parentPort,workerData:w}=require('node:worker_threads');
  const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
  const sha=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
  try{
    const b=Buffer.from(w.base64,'base64');
    if(sha(b)!==w.sha)throw Error('worker input mismatch');
    const target=path.join(w.root,w.path);
    fs.mkdirSync(path.dirname(target),{recursive:true});
    fs.writeFileSync(target,b,{flag:'wx',mode:0o600});
    const reopen=fs.readFileSync(target);
    if(!reopen.equals(b)||sha(reopen)!==w.sha)throw Error('worker reopen mismatch');
    parentPort.postMessage({ok:true,path:w.path});
  }catch(e){parentPort.postMessage({error:String(e.message||e)});}
}
const WORKER='('+writeWorker.toString()+')()';
function oneWorker(root,row,source){
  return new Promise((resolve,reject)=>{
    const w=new Worker(WORKER,{eval:true,workerData:{root,path:row.path,sha:row.blob_sha1,base64:source.data.toString('base64')}});
    let received=false;
    w.once('message',m=>{received=true;m.ok?resolve(m):reject(Error(m.error));});
    w.once('error',reject);
    w.once('exit',code=>{if(!received)reject(Error('worker missing receipt: '+code));});
  });
}
async function fanout(root,rows,bytes,limit){
  let cursor=0,halt=false;
  const results=[];
  const pump=async()=>{while(!halt&&cursor<rows.length){
    const row=rows[cursor++];
    try{results.push(await oneWorker(root,row,bytes.get(row.path)));}
    catch(e){halt=true;throw e;}
  }};
  const done=await Promise.allSettled(Array.from({length:Math.min(limit,rows.length)},pump));
  const error=done.find(y=>y.status==='rejected');
  if(error)throw error.reason;
  if(results.length!==rows.length)throw Error('worker barrier incomplete');
  return results;
}

/**
 * C65: Normalize only the existing pinned GitHub API file-read response.
 * readPinnedFile is a callable HOST edge, not a Node network fallback.
 * This closure cannot attest that the host supplied a genuine connector.
 */
export function createC65PinnedGitHubSource(readPinnedFile){
  if(typeof readPinnedFile!=='function')throw Error('callable GitHub API host read required');
  return async function fetchPinnedObject(request){
    const {sourceHead,path:rel,blob_sha1:expected}=request||{};
    if(!HEX40.test(String(sourceHead||''))||!SAFE.test(String(rel||''))||!HEX40.test(String(expected||'')))throw Error('pinned source request invalid');
    const args=Object.freeze({repository_full_name:'Luke883i/iKant_LE',path:rel,ref:sourceHead,encoding:'base64'});
    const got=await readPinnedFile(args);
    const value=got?.result??got;
    const pinnedUrl='https://github.com/Luke883i/iKant_LE/blob/'+sourceHead+'/'+rel;
    if(value?.sha!==expected||value?.encoding!=='base64'||value?.display_url!==pinnedUrl)throw Error('GitHub API identity/ref mismatch: '+rel);
    const bytes=decode(value?.content);
    if(blob(bytes)!==expected)throw Error('GitHub API decoded blob mismatch: '+rel);
    return {path:rel,blob_sha1:expected,content_base64:bytes.toString('base64'),
      source_object_identity:pinnedUrl+'#'+expected};
  };
}

/**
 * A projection of actual C61 relay observations and local readbacks.
 * The digest is a change detector, NOT an owner seal or native-host proof.
 */
function projectC65SourceSink({owner,workspace,sourceHead,preacceptHandoff,manifest,observations,ownerResult}){
  if(manifest?.object_count!==8||observations?.length!==8)throw Error('C65 expected 8 owner observations');
  const objects=manifest.objects.map(m=>{
    const o=observations.find(x=>x.object_path===m.path);
    const v=owner.validateCanonicalRelayObservation(o,{workspace,sourceHead,preacceptHandoff,relayManifest:manifest});
    if(!o||!v.ok||o.source_sha256!==o.local_readback_sha256||o.source_blob_sha1!==m.blob_sha1||o.local_blob_sha1!==m.blob_sha1)throw Error('C65 owner relay observation invalid: '+m.path);
    return {path:m.path,source_blob_sha1:m.blob_sha1,source_sha256:o.source_sha256,
      local_readback_sha256:o.local_readback_sha256,
      owner_observation_receipt_sha256:o.receipt_sha256,
      source_object_identity_claim:o.source_object_identity,
      local_object_id:o.local_object_id};
  });
  const body={schema:'ikant-le-c65-source-sink-projection/v1',source_head:sourceHead,
    runtime_root_sha256:manifest.runtime_root_sha256,
    owner_manifest_receipt_sha256:manifest.receipt_sha256,
    owner_result_receipt_sha256:ownerResult.receipt_sha256,
    object_count:objects.length,objects,
    local_reopen_verified:true,github_host_fetch_proven:false,
    host_native_delivery_proven:false,active_authority_claim:false,authority:0};
  return {...body,projection_sha256:sha256(Buffer.from(JSON.stringify(body)))};
}

export function validateC65SourceSinkProjection(value,{sourceHead,preacceptHandoff}={}){
  const errors=[];
  let expected=null;
  try{
    const x={sourceHead,humanInput:'I ACCEPT',preacceptHandoff,
      acceptanceObservedMonotonicMs:performance.now()};
    expected=inspectFrozen(x).rows;
  }catch{errors.push('frozen_source');}
  if(value?.schema!=='ikant-le-c65-source-sink-projection/v1'||value?.source_head!==sourceHead||
    value?.object_count!==8||!Array.isArray(value?.objects)||value.objects.length!==8||
    value?.authority!==0||value?.active_authority_claim!==false||
    value?.github_host_fetch_proven!==false||value?.host_native_delivery_proven!==false||
    value?.local_reopen_verified!==true)errors.push('projection_scope');
  const hex64=x=>/^[0-9a-f]{64}$/.test(String(x||''));
  if(!hex64(value?.owner_manifest_receipt_sha256)||!hex64(value?.owner_result_receipt_sha256)||
    !hex64(value?.runtime_root_sha256))errors.push('owner_binding');
  const rows=Array.isArray(value?.objects)?value.objects:[],seen=new Set();
  for(let i=0;i<rows.length;i++){
    const o=rows[i],ref=expected?.[i];
    if(!o||!ref||seen.has(o.path)||o.path!==ref.path||o.source_blob_sha1!==ref.blob_sha1||
       !hex64(o.source_sha256)||o.source_sha256!==o.local_readback_sha256||
       !hex64(o.owner_observation_receipt_sha256)||
       !String(o.source_object_identity_claim||'').trim()||
       !String(o.local_object_id||'').trim())errors.push('object:'+i);
    seen.add(o?.path);
  }
  if(!hex64(value?.projection_sha256))errors.push('digest_format');
  else {
    const {projection_sha256,...body}=value;
    if(sha256(Buffer.from(JSON.stringify(body)))!==projection_sha256)errors.push('projection_digest');
  }
  return {ok:errors.length===0,errors:[...new Set(errors)]};
}

/**
 * Host transports *pinned GitHub API* source bytes to this zero-authority sink adapter.
 * The existing C61/C59 owner alone derives receipts, materializes and claims ACTIVE.
 * No host-native routing, persistence, UI or delivery claim is implied.
 */
export async function executeC63HostBridge(x){
  const v=inspect(x);
  if(typeof x.sessionRoot!=='string'||!path.isAbsolute(x.sessionRoot))throw Error('absolute session root required');
  const root=path.resolve(x.sessionRoot);
  if(!fs.existsSync(root)||!fs.statSync(root).isDirectory())throw Error('existing session root required');
  for(let d=root;;d=path.dirname(d)){
    if(fs.lstatSync(d).isSymbolicLink())throw Error('symlink root forbidden');
    if(d===path.dirname(d))break;
  }
  if(fs.existsSync(path.join(root,'runtime')))throw Error('runtime sink exists');
  const stage=fs.mkdtempSync(path.join(root,'.c63-stage-')),cold=path.join(stage,'cold');
  fs.mkdirSync(cold);
  try{
    write(cold,'BOOTSTRAP.json',v.bootBytes,blob(v.bootBytes));
    const loader=v.rows[0];
    write(cold,loader.path,v.bytes.get(loader.path).data,loader.blob_sha1);
    const owner=await import(pathToFileURL(path.join(cold,loader.path)).href);
    const manifest=owner.issueCanonicalRelayManifest({
      workspace:cold,sourceHead:x.sourceHead,preacceptHandoff:x.preacceptHandoff,
      humanInput:x.humanInput,acceptanceObservedMonotonicMs:x.acceptanceObservedMonotonicMs,
      observedMonotonicMs:performance.now()
    });
    if(manifest.object_count!==8||JSON.stringify(manifest.objects.map(z=>z.path))!==JSON.stringify(v.rows.map(z=>z.path)))throw Error('owner manifest divergence');
    await fanout(cold,v.rows.slice(1),v.bytes,x.runnerCount??4);
    const observations=manifest.objects.map(row=>owner.issueCanonicalRelayObservation({
      workspace:cold,sourceHead:x.sourceHead,preacceptHandoff:x.preacceptHandoff,relayManifest:manifest,
      objectPath:row.path,sourceBytes:v.bytes.get(row.path).data,
      sourceObjectIdentity:v.bytes.get(row.path).identity,localObjectId:'c63-stage:'+row.path,
      observedMonotonicMs:performance.now()
    }));
    const result=await owner.executeCanonicalColdBootstrap({
      workspace:cold,sink:path.join(root,'runtime'),sourceHead:x.sourceHead,preacceptHandoff:x.preacceptHandoff,
      relayManifest:manifest,relayObservations:observations,humanInput:x.humanInput,
      acceptanceObservedMonotonicMs:x.acceptanceObservedMonotonicMs
    });
    if(result.active!==true||result.canonical_active_readback?.ok!==true)throw Error('canonical ACTIVE readback missing');
    const sourceSinkProjection=projectC65SourceSink({owner,workspace:cold,sourceHead:x.sourceHead,
      preacceptHandoff:x.preacceptHandoff,manifest,observations,ownerResult:result});
    const checked=validateC65SourceSinkProjection(sourceSinkProjection,{sourceHead:x.sourceHead,preacceptHandoff:x.preacceptHandoff});
    if(!checked.ok)throw Error('C65 source-sink projection invalid: '+checked.errors.join(','));
    return{schema:'ikant-le-c63-host-byte-bridge/v1',source_head:x.sourceHead,
      runtime_root_sha256:result.runtime_root_sha256,source_plane:'GITHUB_API',byte_path:'VERIFIED_OPAQUE_RELAY',
      runner_kind:'NODE_WORKER_THREADS',runner_count:Math.min(x.runnerCount??4,7),verified_object_count:8,
      owner_active_readback:result.canonical_active_readback,owner_result_receipt_sha256:result.receipt_sha256,
      source_sink_projection:sourceSinkProjection,authority:0};
  }finally{fs.rmSync(stage,{recursive:true,force:true});}
}

/**
 * C64 host ingress: call at the *observed* I ACCEPT event, before source fetch.
 * A callback transports the existing pinned GitHub API base64 source objects;
 * this adapter does not implement a second carrier, clock or runtime owner.
 * The host must separately attest that humanInput is a real ingress event.
 */
export async function executeC63AtAcceptance(x={}){
  if(!x||typeof x!=='object'||Object.hasOwn(x,'sourceObjects')||Object.hasOwn(x,'acceptanceObservedMonotonicMs'))throw Error('retrospective acceptance/source injection forbidden');
  if(x.humanInput!=='I ACCEPT')throw Error('exact I ACCEPT required');
  if(typeof x.fetchPinnedObject!=='function')throw Error('pinned GitHub API callback required');
  const acceptanceObservedMonotonicMs=performance.now();
  const base={sourceHead:x.sourceHead,humanInput:x.humanInput,
    preacceptHandoff:x.preacceptHandoff,runnerCount:x.runnerCount,
    acceptanceObservedMonotonicMs};
  const {rows}=inspectFrozen(base);
  const settled=await Promise.allSettled(rows.map(async row=>{
    const response=await x.fetchPinnedObject(Object.freeze({
      sourceHead:x.sourceHead,path:row.path,blob_sha1:row.blob_sha1
    }));
    if(!response||response.path!==row.path||response.blob_sha1!==row.blob_sha1)throw Error('pinned source response mismatch: '+row.path);
    if(typeof response.content_base64!=='string'||!String(response.source_object_identity||'').trim())throw Error('source bytes/identity absent: '+row.path);
    return {path:row.path,blob_sha1:row.blob_sha1,
      content_base64:response.content_base64,source_object_identity:response.source_object_identity};
  }));
  const failure=settled.find(r=>r.status==='rejected');
  if(failure)throw failure.reason;
  return executeC63HostBridge({
    sourceHead:x.sourceHead,humanInput:x.humanInput,
    preacceptHandoff:x.preacceptHandoff,sessionRoot:x.sessionRoot,
    runnerCount:x.runnerCount,acceptanceObservedMonotonicMs,
    sourceObjects:settled.map(r=>r.value)
  });
}

export function validateC63Input(x){
  try{return{ok:true,objects:inspect(x).bytes.size};}
  catch(e){return{ok:false,error:String(e.message||e)};}
}
