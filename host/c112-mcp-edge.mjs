import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

// Transport-independent adapter. A trusted host provides the original C111 factory.
// JSON-RPC callers can never supply code, a source ref, credentials or an owner receipt.
export const C112_VERSION='2025-11-25';
const H40=/^[a-f0-9]{40}$/;
const ascii=x=>typeof x==='string'&&x.length>0&&Buffer.byteLength(x,'utf8')<=600&&Buffer.from(x,'utf8').toString('utf8')===x;
const isPlain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const keys=(x,allow)=>isPlain(x)&&Object.keys(x).every(k=>allow.includes(k));
const deny=(edge)=>({schema:'ikant-le-c112-result/v1',status:'C112_STOP',surface_a:null,
 surface_b:{first_unclosed_edge:edge},active:false,native_chat_delivery_attested:false,
 model_provider_attested:false,source_origin_attested:false});
export const C112_TOOLS=Object.freeze([
 {name:'ikant_start',description:'Create isolated experimental iKant shell and show original Terms. Does not grant consent.',inputSchema:{type:'object',additionalProperties:false,properties:{}}},
 {name:'ikant_turn',description:'Deliver one bound human message; optional synthetic draft is visibly labeled.',
  inputSchema:{type:'object',additionalProperties:false,required:['session','text'],
   properties:{session:{type:'string'},text:{type:'string',maxLength:600},
    draft:{type:'string',maxLength:15000},
    candidate:{type:'object',additionalProperties:false,required:['input_sha256','text'],
     properties:{input_sha256:{type:'string'},text:{type:'string',maxLength:16000}}}}}},
 {name:'ikant_status',description:'Read current session capability/phase without computing a turn.',inputSchema:{type:'object',additionalProperties:false,required:['session'],properties:{session:{type:'string'}}}},
 {name:'ikant_revoke',description:'Revoke separately opted-in cohost consent.',inputSchema:{type:'object',additionalProperties:false,required:['session'],properties:{session:{type:'string'}}}},
 {name:'ikant_exit',description:'Close session and release host resources.',inputSchema:{type:'object',additionalProperties:false,required:['session'],properties:{session:{type:'string'}}}}
]);
export function checkC112Frame(frame){
 if(!isPlain(frame)||frame.jsonrpc!=='2.0'||typeof frame.method!=='string'||
  Buffer.byteLength(JSON.stringify(frame),'utf8')>32000||
  !(typeof frame.id==='string'||Number.isSafeInteger(frame.id)||frame.id===undefined))return 'JSONRPC_FRAME';
 if(frame.method==='initialize')return keys(frame,['jsonrpc','id','method','params'])&&isPlain(frame.params)&&frame.params.protocolVersion===C112_VERSION?'':'UNSUPPORTED_INITIALIZATION';
 if(frame.method==='notifications/initialized')return keys(frame,['jsonrpc','method','params'])?'':'NOTIFICATION_KEYS';
 if(frame.method==='ping'||frame.method==='tools/list')return keys(frame,['jsonrpc','id','method','params'])?'':'CONTROL_KEYS';
 if(frame.method!=='tools/call'||!keys(frame,['jsonrpc','id','method','params'])||
  !keys(frame.params,['name','arguments'])||typeof frame.params.name!=='string'||
  !C112_TOOLS.some(t=>t.name===frame.params.name)||!isPlain(frame.params.arguments))return 'UNKNOWN_METHOD_OR_TOOL';
 const {name,arguments:a}=frame.params;
 if(name==='ikant_start')return keys(a,[])?'':'START_ARGUMENTS';
 if(!keys(a,name==='ikant_turn'?['session','text','draft','candidate']:['session'])||
   typeof a.session!=='string'||!/^[a-f0-9]{32}$/.test(a.session))return 'SESSION_HANDLE';
 if(name==='ikant_turn') {
  if(!ascii(a.text))return 'CURRENT_INPUT';
  if(a.draft!==undefined&&(typeof a.draft!=='string'||!a.draft.trim()||Buffer.byteLength(a.draft,'utf8')>15000))return 'DRAFT_BOUNDS';
  if(a.candidate!==undefined&&(!keys(a.candidate,['input_sha256','text'])||
    Object.keys(a.candidate).length!==2||
    a.candidate.input_sha256!==crypto.createHash('sha256').update(a.text).digest('hex')||
    typeof a.candidate.text!=='string'||!a.candidate.text.trim()||
    Buffer.byteLength(a.candidate.text,'utf8')>16000))return 'CANDIDATE_BOUNDS';
 } 
 return '';
}
function toolPayload(receipt,session=null){
 const out={schema:'ikant-le-c112-tool-result/v1',session,receipt};
 return {content:[{type:'text',text:JSON.stringify(out)}],structuredContent:out,isError:receipt.status==='C112_STOP'||String(receipt.status).endsWith('_STOP')};
}
export function createC112McpEdge({sourceHead,privateRoot,makeEdge,maxSessions=12,
 languagePort,allowSynthetic=false}={}){
 if(!H40.test(sourceHead||'')||typeof privateRoot!=='string'||!path.isAbsolute(privateRoot)||
  typeof makeEdge!=='function'||!Number.isInteger(maxSessions)||maxSessions<1||maxSessions>100)
  throw Error('C112_HOST_INSTALLATION_INCOMPLETE');
 const sessions=new Map();let peak=0;
 const transport={machine:'SAME_C111_ORIGINAL_FACTORY',head:sourceHead,
  native_delivery_attested:false,model_provider_origin_attested:false};
 const rpc=(id,result)=>({jsonrpc:'2.0',id,result});
 const error=(id,code,message)=>({jsonrpc:'2.0',id,error:{code,message}});
 const start=async()=>{
  if(sessions.size>=maxSessions)return toolPayload(deny('SESSION_CAPACITY'),null);
  const session=crypto.randomBytes(16).toString('hex');
  const dir=path.join(privateRoot,session,'.ikant-host');
  try{
   fs.mkdirSync(dir,{recursive:true,mode:0o700});fs.chmodSync(dir,0o700);
   const file=path.join(dir,'c107-observations.jsonl');
   const edge=makeEdge({sourceHead,ledgerFile:file,languagePort,allowSynthetic});
   if(typeof edge?.dispatch!=='function')throw Error('INVALID_C111_FACTORY');
   const slot={edge,pending:Promise.resolve(),closed:false};sessions.set(session,slot);
   peak=Math.max(peak,sessions.size);
   const receipt=await edge.dispatch({op:'ACTIVATE'});
   if(receipt.status!=='C109_TERMS_PRESENTED'){
    sessions.delete(session);fs.rmSync(path.join(privateRoot,session),{recursive:true,force:true});
    return toolPayload(deny('C111_ACTIVATION_DID_NOT_PRESENT_TERMS'));
   }
   return toolPayload({...receipt,transport_bound_by_host:false},session);
  }catch{sessions.delete(session);try{fs.rmSync(path.join(privateRoot,session),{recursive:true,force:true});}catch{}
   return toolPayload(deny('C111_PHYSICAL_NODE_FACTORY_UNAVAILABLE'),null);}
 };
 const run=async(tool,a)=>{
  if(tool==='ikant_start')return start();
  const slot=sessions.get(a.session);
  if(!slot||slot.closed)return toolPayload(deny('SESSION_NOT_AVAILABLE'),a.session);
  const op=tool==='ikant_turn'?'MESSAGE':tool==='ikant_status'?'STATUS':
   tool==='ikant_revoke'?'REVOKE':'EXIT';
  // Only same-session turns serialized. Independent sessions execute concurrently.
  const task=slot.pending.then(async()=>{
   if(slot.closed)return toolPayload(deny('SESSION_ALREADY_CLOSED'),a.session);
   const receipt=await slot.edge.dispatch(op==='MESSAGE'?{op,text:a.text,hostDraft:a.draft,candidate:a.candidate}:{op});
   if(op==='EXIT'){slot.closed=true;sessions.delete(a.session);}
   return toolPayload(receipt,a.session);
  });
  slot.pending=task.then(()=>{},()=>{});
  try{return await task;}catch{return toolPayload(deny('C111_DISPATCH_FAILED'),a.session);}
 };
 return Object.freeze({
  async handle(frame){
   const fault=checkC112Frame(frame);
   if(fault)return error(frame?.id??null,-32600,fault);
   const {id,method}=frame;
   if(method==='notifications/initialized')return null;
   if(method==='initialize')return rpc(id,{protocolVersion:C112_VERSION,
    capabilities:{tools:{listChanged:false}},serverInfo:{name:'ikant-c112-edge',version:'0.1.0'},
    instructions:'Original C111/C70/C100/C87 only after exact later consent and real Node readback. ChatGPT native delivery is not attested.'});
   if(method==='ping')return rpc(id,{});
   if(method==='tools/list')return rpc(id,{tools:C112_TOOLS});
   return rpc(id,await run(frame.params.name,frame.params.arguments));
  },
  metrics(){return {schema:'ikant-le-c112-metrics/v1',sessions:sessions.size,peak,
   transport,model_port_supplied:typeof languagePort?.generate==='function',
   original_turns_attested_by_this_module:0,chatgpt_native_hook_attested:false};},
  async closeAll(){for(const [k,slot] of sessions){try{await slot.pending;await slot.edge.dispatch({op:'EXIT'});}catch{}sessions.delete(k);}}
 });
}
