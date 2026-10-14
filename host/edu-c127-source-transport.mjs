/** C127: content-addressed Project cache + honest bounded host transfer.
 * Distribution aid ONLY, not an iKant source owner, admission gate or retry owner.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import {isProxy} from 'node:util/types';
import {PIN,inspectC107Carrier} from './c107-carrier-consumer.mjs';
import {C124_SOURCE_EPOCH,C124_OVERLAY_GIT_BLOBS,verifyC124OverlayBytes} from './c124-source-overlay.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const paths=Object.keys(C124_OVERLAY_GIT_BLOBS).sort();
const canonical=s=>typeof s==='string'&&s.length%4===0&&/^[A-Za-z0-9+/]*={0,2}$/.test(s)&&Buffer.from(s,'base64').toString('base64')===s;
const safe=o=>o&&typeof o==='object'&&!isProxy(o)&&!Array.isArray(o)&&
 (Object.getPrototypeOf(o)===Object.prototype||Object.getPrototypeOf(o)===null)&&
 Reflect.ownKeys(o).every(k=>typeof k==='string'&&Object.hasOwn(Object.getOwnPropertyDescriptors(o)[k],'value'));
const bad=edge=>Object.freeze({ok:false,first_edge:edge,active:false,provider_origin_attested:false});
function normalized(carrier,overlays){
 if(!Buffer.isBuffer(carrier)||carrier.length!==PIN.carrier_bytes||hash(carrier)!==PIN.carrier_sha256)return bad('C127_C107_CARRIER_DIGEST');
 if(inspectC107Carrier(carrier)?.status!=='C107_SOURCE_EXACT_VERIFIED_NOT_EXECUTED')return bad('C127_C107_ORIGINAL_INSPECT');
 const verified=verifyC124OverlayBytes(overlays);
 if(!verified.ok)return bad(verified.first_edge||'C127_C124_SOURCE_GIT_BLOB');
 return {ok:true,carrierBytes:carrier,c124OverlayBytes:overlays,source_head:C124_SOURCE_EPOCH,
  original_source_head:PIN.head,carrier_sha256:PIN.carrier_sha256,
  overlay_sha256:verified.overlay_sha256,active:false,provider_origin_attested:false};
}
export function buildC127SourceCache({carrierBytes,c124OverlayBytes}={}){
 const r=normalized(carrierBytes,c124OverlayBytes);if(!r.ok)return r;
 const obj={schema:'ikant-c127-project-source-cache/v1',source_epoch:C124_SOURCE_EPOCH,
  original_head:PIN.head,carrier_sha256:PIN.carrier_sha256,
  carrier_base64:carrierBytes.toString('base64'),
  overlays:paths.map(p=>({path:p,git_blob_sha1:C124_OVERLAY_GIT_BLOBS[p],
   bytes:c124OverlayBytes[p].length,base64:c124OverlayBytes[p].toString('base64')}))};
 const bytes=Buffer.from(JSON.stringify(obj)+'\n','utf8');
 return {ok:true,bytes,sha256:hash(bytes),members:4,active:false};
}
export function inspectC127SourceCache(raw){
 try{
  if(!Buffer.isBuffer(raw)||raw.length<62000||raw.length>250000)return bad('C127_CACHE_LENGTH');
  const o=JSON.parse(raw.toString('utf8'));
  // Reject duplicate JSON keys, alternate whitespace, reorderings and malformed UTF-8:
  // a source cache has one byte-reproducible representation.
  if(!raw.equals(Buffer.from(JSON.stringify(o)+'\n','utf8')))return bad('C128_NONCANONICAL_CACHE_ENVELOPE');
  if(!safe(o)||Reflect.ownKeys(o).length!==6||
    o.schema!=='ikant-c127-project-source-cache/v1'||o.source_epoch!==C124_SOURCE_EPOCH||
    o.original_head!==PIN.head||o.carrier_sha256!==PIN.carrier_sha256||
    !canonical(o.carrier_base64)||!Array.isArray(o.overlays)||isProxy(o.overlays)||
    o.overlays.length!==3)return bad('C127_CACHE_SCHEMA');
  const seen=new Set(),overlay=Object.create(null);
  for(const item of o.overlays){
   if(!safe(item)||Reflect.ownKeys(item).length!==4||
      !paths.includes(item.path)||seen.has(item.path)||
      item.git_blob_sha1!==C124_OVERLAY_GIT_BLOBS[item.path]||
      !canonical(item.base64))return bad('C127_CACHE_OVERLAY_ENTRY');
   const bytes=Buffer.from(item.base64,'base64');
   if(item.bytes!==bytes.length)return bad('C127_CACHE_OVERLAY_LENGTH');
   overlay[item.path]=bytes;seen.add(item.path);
  }
  const r=normalized(Buffer.from(o.carrier_base64,'base64'),overlay);
  if(!r.ok)return r;
  return {...r,cache_sha256:hash(raw),member_count:4,source_transport:'C127_LOCAL_CACHE_BYTES_VERIFIED'};
 }catch{return bad('C127_CACHE_PARSE_OR_BYTES')}
}
export function loadC127SourceCache(cachePath){
 let aFd=null,bFd=null;
 try{
  if(typeof cachePath!=='string'||!cachePath.startsWith('/')||cachePath.length>4096)
   return bad('C127_ABSOLUTE_PATH_REQUIRED');
  // O_NOFOLLOW + inode equality bind both readbacks to the same actual file.
  if(!Number.isInteger(fs.constants.O_NOFOLLOW))return bad('C128_HOST_NO_NOFOLLOW');
  const flags=fs.constants.O_RDONLY|fs.constants.O_NOFOLLOW;
  aFd=fs.openSync(cachePath,flags);const aStat=fs.fstatSync(aFd);
  if(!aStat.isFile()||aStat.size<62000||aStat.size>250000)return bad('C127_LOCAL_FILE_UNSAFE');
  const a=fs.readFileSync(aFd);
  bFd=fs.openSync(cachePath,flags);const bStat=fs.fstatSync(bFd);
  if(!bStat.isFile()||bStat.dev!==aStat.dev||bStat.ino!==aStat.ino||
    bStat.size!==aStat.size)return bad('C128_CACHE_IDENTITY_DRIFT');
  const b=fs.readFileSync(bFd);
  const finalStat=fs.lstatSync(cachePath);
  if(!finalStat.isFile()||finalStat.isSymbolicLink()||
    finalStat.ino!==aStat.ino||finalStat.dev!==aStat.dev||
    !a.equals(b))return bad('C127_CACHE_READBACK_DRIFT');
  const r=inspectC127SourceCache(a);
  return r.ok?{...r,file_readback_verified:true,readback_inode_bound:true}:r;
 }catch{return bad('C127_LOCAL_CACHE_UNAVAILABLE')}
 finally{if(bFd!==null)try{fs.closeSync(bFd)}catch{};if(aFd!==null)try{fs.closeSync(aFd)}catch{}}
}
/** Only genuinely callable, *distinct* host transports are attempted; no invented retries.
 * callbacks return physical cache bytes. Max 1 initial + 2 evidence-distinct methods.
 * The fallback is a recommendation to the HUMAN, never an automatic download.
 */
/** Bridge expiry cannot force arbitrary caller code to stop.
 * After an unacknowledged abort do not invoke ANY other bridge and do not
 * claim manual handoff is safe: the previous callback may still be running.
 */
const bridgeDescriptor=entry=>{
 if(!entry||typeof entry!=='object'||isProxy(entry))return null;
 const d=Object.getOwnPropertyDescriptors(entry);
 if(Reflect.ownKeys(d).length!==2||!Object.hasOwn(d,'id')||
   !Object.hasOwn(d,'fetch')||!Object.hasOwn(d.id,'value')||
   !Object.hasOwn(d.fetch,'value'))return null;
 const id=d.id.value,fetch=d.fetch.value;
 if(typeof id!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(id)||
   typeof fetch!=='function')return null;
 return {id,fetch};
};
const unsafe=(edge,events)=>Object.freeze({ok:false,first_edge:edge,next:'STOP',
 attempts:events.length,events:Object.freeze([...events]),active:false,
 provider_origin_attested:false,native_chatgpt_hook_attested:false});
export async function resolveC127Transport({admitted=false,cachePath=null,bridges=[],timeoutMs=10000}={}){
 if(admitted!==true)return bad('C127_ORIGINAL_C72_ADMISSION_REQUIRED');
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<100||timeoutMs>60000)
  return bad('C128_TIMEOUT_CONTRACT_INVALID');
 if(cachePath!==null){
  const local=loadC127SourceCache(cachePath);
  if(local.ok)return {...local,attempts:0,next:'RUN_EXISTING_PR119',first_edge:null};
 }
 if(!Array.isArray(bridges)||isProxy(bridges)||bridges.length>12||
    Reflect.ownKeys(bridges).length!==bridges.length+1)
  return bad('C127_BRIDGES_INVALID');
 const seen=new Set(),seenCallbacks=new Set(),events=[];
 for(const entry of bridges){
  if(events.length>=3)break;
  const d=bridgeDescriptor(entry);
  if(!d||seen.has(d.id))return unsafe('C127_UNTRUSTED_BRIDGE',events);
  if(seenCallbacks.has(d.fetch))return unsafe('C128_SAME_CALLBACK_NOT_INDEPENDENT',events);
  seen.add(d.id);seenCallbacks.add(d.fetch);
  const controller=new AbortController();
  let timer=null;
  // Promise.race observes a *caller* async operation without installing a
  // second runtime or assuming the host can kill uncooperative providers.
  const work=Promise.resolve().then(()=>d.fetch({signal:controller.signal})).then(
   value=>({kind:'RESULT',value}),
   ()=>({kind:'FETCH_FAILED'}));
  const expiry=new Promise(resolve=>{
   timer=setTimeout(()=>{controller.abort();resolve({kind:'TIMEOUT'})},timeoutMs);
  });
  const result=await Promise.race([work,expiry]);
  clearTimeout(timer);
  if(result.kind==='TIMEOUT'){
   // This event does not count as a completed failed transport method.
   // No automatic retry and no manual-handoff authorization while unsettled.
   return unsafe('C128_TRANSPORT_CALLBACK_UNSETTLED',[
    ...events,{id:d.id,result:'ABORT_REQUESTED_OUTCOME_UNKNOWN'}]);
  }
  if(result.kind==='FETCH_FAILED'){
   events.push({id:d.id,result:'FETCH_FAILED'});continue;
  }
  const checked=inspectC127SourceCache(result.value);
  events.push({id:d.id,result:checked.ok?'BYTES_VERIFIED':checked.first_edge});
  if(checked.ok)return {...checked,attempts:events.length,events,
   next:'RUN_EXISTING_PR119',first_edge:null,
   independent_bridge_provider_attested:false};
 }
 return Object.freeze({ok:false,status:'C127_TRANSPORT_EXHAUSTED_HOST_ONLY',
  attempts:events.length,retries:Math.max(0,events.length-1),attempt_limit:3,
  events,first_edge:events.length===3?'C127_MAXIMUM_REAL_MACHINE_ATTEMPTS_EXHAUSTED':'C127_NO_MORE_PROVEN_MACHINE_BRIDGES',
  next:'MANUAL_EXACT_SOURCE_AND_OVERLAY_HANDOFF',manual_c107_url:PIN.manual_url,
  overlay_paths:paths,active:false,provider_origin_attested:false,
  independent_bridge_provider_attested:false,native_chatgpt_hook_attested:false});
}
