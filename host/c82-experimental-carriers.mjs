import crypto from 'node:crypto';

// A host-supplied byte-carrier adapter. It never discovers host capabilities,
// performs network IO or attests the external origin of a GitHub ref.
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from(`blob ${b.length}\0`),b])).digest('hex');
const stop=(edge,details=[])=>({schema:'ikant-le-c82-carrier-result/v1',
 status:'C82_CARRIER_STOP',first_unclosed_edge:edge,failures:details.slice(0,12),
 active:false,source_origin_attested:false,authority:0});
function decode(s){
 if(typeof s!=='string'||s.length>1400000||s.length%4!==0||
 !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(s))throw Error('NONCANONICAL_BASE64');
 const b=Buffer.from(s,'base64');
 if(b.toString('base64')!==s)throw Error('NONCANONICAL_BASE64');
 return b;
}
function bounded(p,ms){let timer;const expire=new Promise((_,reject)=>{
 timer=setTimeout(()=>reject(Error('CARRIER_TIMEOUT')),ms);});
 return Promise.race([Promise.resolve().then(p),expire]).finally(()=>clearTimeout(timer));}
/** Parallel IO qualification, single C78 staging writer.
 * The host supplies callable getFile adapters AFTER the C72 gate and after
 * acquiring an independently frozen source SHA. A mock adapter in tests is
 * not evidence that a ChatGPT host exposes that carrier in production. */
export async function materializeC82ParallelCarriers({relay,manifest,carriers,
 parallelism=4,carrierTimeoutMs=5000}={}){
 if(!relay||!Array.isArray(relay.expectedPaths)||!manifest||
  !Array.isArray(manifest.files)||manifest.files.length<20||manifest.files.length>50||
  manifest.source_head!==relay._sourceHead||
  !Array.isArray(carriers)||carriers.length<1||carriers.length>6||
  !carriers.every(c=>c&&/^[A-Z0-9_]{2,48}$/.test(c.name)&&typeof c.getFile==='function')||
  new Set(carriers.map(c=>c.name)).size!==carriers.length||
  !Number.isInteger(parallelism)||parallelism<1||parallelism>8||
  !Number.isInteger(carrierTimeoutMs)||carrierTimeoutMs<50||carrierTimeoutMs>30000)
  return stop('C82_CARRIER_ENVELOPE');
 const allowed=new Map(manifest.files.map(f=>[f.path,f]));
 const paths=relay.expectedPaths;
 if(allowed.size!==paths.length||paths.some(p=>!allowed.has(p)))
  return stop('C82_MANIFEST_C78_PATH_SET');
 const found=new Map(),failures=[];
 let cursor=0;
 async function worker(){
  while(cursor<paths.length){
   const p=paths[cursor++],f=allowed.get(p);
   const probes=carriers.map(c=>bounded(async()=>{
    const packet=await c.getFile(p);
    const b=decode(packet?.contentBase64);
    if(b.length!==f.bytes||digest(b)!==f.sha256)
      throw Error('SHA256_OR_LENGTH_MISMATCH');
    if(!f.generated_derivative&&f.original_source_blob_sha1!==null&&gitBlob(b)!==f.original_source_blob_sha1)
      throw Error('GIT_BLOB_MISMATCH');
    return {path:p,carrier:c.name,contentBase64:packet.contentBase64,
      sourceBlobSha1:f.original_source_blob_sha1};
   },carrierTimeoutMs));
   try{found.set(p,await Promise.any(probes));}
   catch{failures.push({path:p,edge:'NO_SAMEHASH_CARRIER'});}
  }
 }
 await Promise.all(Array.from({length:Math.min(parallelism,paths.length)},()=>worker()));
 if(found.size!==paths.length)return stop('C82_INCOMPLETE_CARRIER_COVERAGE',failures);
 // Deliberate serialization: no parallel state writer; an invalid write fails closed.
 try{
  for(const p of paths)relay.stageFile({filePath:p,
   contentBase64:found.get(p).contentBase64,
   sourceBlobSha1:found.get(p).sourceBlobSha1});
  const readback=relay.finalize();
  return {schema:'ikant-le-c82-carrier-result/v1',
   status:'C82_C77_BYTES_MATERIALIZED_IN_NODE',
   source_head:manifest.source_head,files:paths.length,
   selected_carriers:paths.map(p=>({path:p,carrier:found.get(p).carrier})),
   all_bytes_reopened:readback.all_bytes_reopened===true,
   first_unclosed_edge:'HOST_GITHUB_ORIGIN_AUTHENTICATION',
   no_native_delivery_claim:true,source_origin_attested:false,
   active:false,persistent:false,canonical_runtime:false,authority:0};
 }catch(e){return stop('C82_C78_STAGING_READBACK',
  [{detail:String(e?.message||e).slice(0,100)}]);}
}
