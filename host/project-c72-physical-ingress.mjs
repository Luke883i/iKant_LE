/** C72 postaccept HOST effects adapter. Reuse original C72 owner/executor.
 * Three physical carrier choices; none is installed or inferred by a prompt.
 * A real Node HTTPS path avoids connector->Node split when outbound HTTPS works.
 * This file creates no consent, mode, writer, provider hook, or native receipt.
 */
import https from 'node:https';
import {createHash} from 'node:crypto';
import {isC98JSONDataTree} from './c98-c82-connector-port.mjs';
import {executeC72PostAcceptRecovery} from './project-c72-host-recovery.mjs';

const SOURCE='Luke883i/iKant_LE';
const PREFIX='/repos/'+SOURCE;
const NAMES=Object.freeze(['README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md']);
const H40=/^[a-f0-9]{40}$/u;
const B64=/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u;
const stop=edge=>Object.freeze({ok:false,kind:'STOP',edge,authority:0,active:false,
 original_owner_invoked:false,native_event_attested:false,source_origin_attested:false});
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');

/** HTTPS is an actual Node-local carrier ONLY if network execution succeeds.
 * Caller cannot substitute URLs/hostnames; no redirects/tokens/secrets used. */
export async function readC72GithubJSON(path){
 if(path!==PREFIX+'/git/ref/heads/main'&&
    !NAMES.some(p=>path.startsWith(PREFIX+'/contents/'+p+'?ref=')&&
      H40.test(path.slice((PREFIX+'/contents/'+p+'?ref=').length))))throw Error('C72_NODE_GITHUB_PATH_DENIED');
 return await new Promise((resolve,reject)=>{
  const req=https.get({hostname:'api.github.com',port:443,path,method:'GET',
   headers:{'User-Agent':'ikant-c72-host-physical-ingress','Accept':'application/vnd.github+json',
    'X-GitHub-Api-Version':'2022-11-28'},timeout:10000},res=>{
    if(res.statusCode!==200){res.resume();reject(Error('C72_NODE_GITHUB_HTTP_'+res.statusCode));return}
    const chunks=[];let size=0;
    res.on('data',chunk=>{size+=chunk.length;if(size>650000){req.destroy(Error('C72_NODE_GITHUB_RESPONSE_BOUNDS'));return}chunks.push(chunk)});
    res.on('end',()=>{try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch{reject(Error('C72_NODE_GITHUB_JSON_INVALID'))}});
    res.on('error',reject);
  });
  req.on('timeout',()=>req.destroy(Error('C72_NODE_GITHUB_TIMEOUT')));
  req.on('error',reject);
 });
}
/** The authorized HOST may bind a real GitHub request callback inside Node,
 * or omit it for the actual public GitHub HTTPS client. Nothing is probed
 * before the higher-level exact new-I-ACCEPT gate.
 */
export function createC72NodeGithubCallbacks({sourceHead,getJSON=readC72GithubJSON}={}){
 if(!H40.test(sourceHead||'')||typeof getJSON!=='function')
  throw Error('C72_NODE_GITHUB_ADAPTER_CONFIG');
 const request=async path=>{
  const x=await getJSON(path);
  if(!isC98JSONDataTree(x))throw Error('C72_NODE_GITHUB_RESPONSE_SHAPE');
  return x;
 };
 return Object.freeze({
  async readMain(){
   const x=await request(PREFIX+'/git/ref/heads/main');
   if(x?.ref!=='refs/heads/main'||x?.object?.type!=='commit'||
      !H40.test(x?.object?.sha||''))throw Error('C72_NODE_GITHUB_HEAD_INVALID');
   return x.object.sha;
  },
  async readPinnedDocument(path,head){
   if(head!==sourceHead||!NAMES.includes(path))throw Error('C72_NODE_GITHUB_REQUEST_DENIED');
   const x=await request(PREFIX+'/contents/'+path+'?ref='+sourceHead);
   if(x?.type!=='file'||x?.path!==path||x?.encoding!=='base64'||
      !H40.test(x?.sha||'')||typeof x?.content!=='string'||
      !Number.isInteger(x?.size)||x.size<1||x.size>256000)
    throw Error('C72_NODE_GITHUB_FILE_SHAPE');
   const clean=x.content.replace(/\n/g,'');
   if(!clean||clean.length%4!==0||!B64.test(clean))throw Error('C72_NODE_GITHUB_BASE64');
   const bytes=Buffer.from(clean,'base64');
   if(bytes.length!==x.size||bytes.toString('base64')!==clean||blob(bytes)!==x.sha)
    throw Error('C72_NODE_GITHUB_BLOB_DRIFT');
   const content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
   if(!Buffer.from(content,'utf8').equals(bytes))throw Error('C72_NODE_GITHUB_UTF8_LOSS');
   return Object.freeze({path,source_head:sourceHead,blob_sha1:x.sha,content});
  }
 });
}
/** Choose ONE actually callable effect. Selection is deterministic but does
 * not claim a missing provider capability exists. No fallback after an owner
 * outcome that could be UNKNOWN; never call original twice.
 */
export async function runC72SelectedHostIngress({humanMessage,freshHumanTurn,
 priorTurnEvidence,carrier='UNBOUND',getGithubJSON,readMain,readPinnedDocument,
 sourcePacket,ownerOutcome='NOT_INVOKED'}={}){
 if(humanMessage!=='I ACCEPT'||freshHumanTurn!==true)
  return stop('C72_EXACT_NEW_CONSENT_REQUIRED');
 if(ownerOutcome!=='NOT_INVOKED')
  return stop(ownerOutcome==='UNKNOWN'?'C72_OWNER_OUTCOME_UNKNOWN':'C72_OWNER_ALREADY_ATTEMPTED');
 if(!H40.test(priorTurnEvidence?.source_head||''))
  return stop('C72_ORIENTATION_WITNESS_MISSING');
 let options;
 if(carrier==='NODE_GITHUB_API'){
  if(sourcePacket!=null||readMain!==undefined||readPinnedDocument!==undefined)
   return stop('C72_HOST_PORT_AMBIGUOUS');
  let adapter;
  try{adapter=createC72NodeGithubCallbacks({sourceHead:priorTurnEvidence.source_head,
   ...(getGithubJSON!==undefined?{getJSON:getGithubJSON}:{})});}
  catch{return stop('C72_NODE_GITHUB_ADAPTER_CONFIG');}
  options={readMain:adapter.readMain,readPinnedDocument:adapter.readPinnedDocument};
 }else if(carrier==='HOST_CALLBACKS'){
  if(typeof readMain!=='function'||typeof readPinnedDocument!=='function'||
      sourcePacket!=null||getGithubJSON!==undefined)return stop('C72_HOST_PORT_AMBIGUOUS');
  options={readMain,readPinnedDocument};
 }else if(carrier==='HOST_SOURCE_PACKET'){
  if(sourcePacket==null||readMain!==undefined||readPinnedDocument!==undefined||
     getGithubJSON!==undefined)return stop('C72_HOST_PORT_AMBIGUOUS');
  options={sourcePacket};
 }else{
  return stop(carrier==='UNBOUND'?'C72_SOURCE_BRIDGE_UNBOUND':'C72_HOST_CARRIER_INVALID');
 }
 const r=await executeC72PostAcceptRecovery({humanMessage,freshHumanTurn,
   priorTurnEvidence,ownerOutcome,...options});
 // A verified owner response is not a provider-origin or native UI receipt.
 return Object.freeze({...r,host_carrier_selected:carrier,
  provider_source_event_attested:false,native_delivery_attested:false});
}
