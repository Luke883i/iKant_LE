import fs from 'node:fs';
import {executeC84ExperimentalTurn} from '../host/c84-experimental-transport.mjs';

const MAX_STDIN=8_000_000,MAX_FILES_PER_PROVIDER=50;
const stop=edge=>({schema:'ikant-le-c84-experimental-turn/v1',status:'C84_STOP',
 first_unclosed_edge:edge,authority:0,active:false,canonical_runtime:false,
 persistent:false,source_origin_attested:false,native_event_attested:false,
 native_chat_delivery_attested:false,owner_receipt_issued:false});
const exact=(x,keys)=>x&&typeof x==='object'&&!Array.isArray(x)&&
 Object.keys(x).sort().join(',')===keys.slice().sort().join(',');
function decodeEnvelope(raw){
 if(raw.length>MAX_STDIN)throw Error('C84_CLI_STDIN_LIMIT');
 const q=JSON.parse(raw.toString('utf8'));
 const required=['schema','selection','sourceHead','expectedManifestSha256',
  'manifestBase64','sourceProof','carriers','humanInput'];
 const optional=['parallelism','carrierTimeoutMs'];
 if(!q||typeof q!=='object'||Array.isArray(q)||
  required.some(k=>!Object.hasOwn(q,k))||
  Object.keys(q).some(k=>![...required,...optional].includes(k))||
  q.schema!=='ikant-le-c84-host-transferred-turn/v1'||
  !Array.isArray(q.carriers)||!q.carriers.length||q.carriers.length>6)
  throw Error('C84_CLI_ENVELOPE');
 const names=new Set();
 const carriers=q.carriers.map(item=>{
  if(!exact(item,['name','files'])||typeof item.name!=='string'||
   !/^[A-Z0-9_]{2,48}$/.test(item.name)||names.has(item.name)||
   !Array.isArray(item.files)||item.files.length>MAX_FILES_PER_PROVIDER)
   throw Error('C84_CLI_CARRIER_ENVELOPE');
  names.add(item.name);
  const files=new Map();
  for(const entry of item.files){
   if(!exact(entry,['path','contentBase64'])||
    typeof entry.path!=='string'||entry.path.length>180||
    typeof entry.contentBase64!=='string'||entry.contentBase64.length>1_400_000||
    files.has(entry.path))throw Error('C84_CLI_FILE_ENVELOPE');
   files.set(entry.path,entry.contentBase64);
  }
  return {name:item.name,getFile:async path=>{
   if(!files.has(path))throw Error('C84_CARRIER_FILE_MISSING');
   return {contentBase64:files.get(path)};
  }};
 });
 return {selection:q.selection,sourceHead:q.sourceHead,
  expectedManifestSha256:q.expectedManifestSha256,
  manifestBase64:q.manifestBase64,sourceProof:q.sourceProof,
  humanInput:q.humanInput,carriers,
  parallelism:q.parallelism??4,carrierTimeoutMs:q.carrierTimeoutMs??5000};
}
let result;
try{
 const request=decodeEnvelope(fs.readFileSync(0));
 result=await executeC84ExperimentalTurn(request);
}catch{result=stop('C84_CLI_INPUT_OR_EXECUTION');}
process.stdout.write(JSON.stringify(result)+'\n');
if(result.status!=='C84_RUNTIME_VOICE_READY_NOT_NATIVE_DELIVERED')
 process.exitCode=2;
