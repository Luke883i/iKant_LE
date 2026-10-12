// C113: bounded dual-era codec; C112 remains sole host dispatcher.
// Modern MCP has stateless wire semantics, not a stateless iKant conversation.
export const MODERN='2026-07-28';
export const LEGACY='2025-11-25';
export const SUPPORTED=Object.freeze([MODERN,LEGACY]);
const plain=x=>x!==null&&typeof x==='object'&&!Array.isArray(x)&&Object.getPrototypeOf(x)===Object.prototype;
const rpcErr=(id,code,message,data)=>({jsonrpc:'2.0',id:id??null,error:{code,message,...(data?{data}:{})}});
const versionError=(f,requested)=>rpcErr(f?.id,-32022,'Unsupported protocol version',{supported:SUPPORTED,requested});
const headerErr=f=>rpcErr(f?.id,-32020,'HeaderMismatch');
const server={name:'ikant-c113-dual-era',version:'0.1.0'};
const outMeta={'io.modelcontextprotocol/serverInfo':server};
const validMeta=m=>plain(m)&&m['io.modelcontextprotocol/protocolVersion']===MODERN&&
 plain(m['io.modelcontextprotocol/clientCapabilities'])&&
 (m['io.modelcontextprotocol/clientInfo']===undefined||plain(m['io.modelcontextprotocol/clientInfo']));
const metaOf=f=>f?.params?._meta;
const encodeName=x=>typeof x==='string'&&x.startsWith('=?base64?')&&x.endsWith('?=')?
 (()=>{const b=x.slice(9,-2);return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(b)&&Buffer.from(b,'base64').toString('base64')===b?Buffer.from(b,'base64').toString('utf8'):null;})():x;
function headersFault(f,h){
 const get=k=>h?.[k]??h?.[k.toLowerCase()]??h?.[k.toUpperCase()];
 if(get('mcp-protocol-version')!==MODERN||get('mcp-method')!==f.method)return true;
 if(f.method==='tools/call')return encodeName(get('mcp-name'))!==f.params?.name;
 return get('mcp-name')!==undefined;
}
/** Modern client calls directly; never treats a legacy initialization as modern. */
export function createC113DualEra(edge){
 if(typeof edge?.handle!=='function')throw Error('C113_C112_EDGE_REQUIRED');
 return Object.freeze({
  async handle(f,{headers=null,transport='stdio'}={}){
   if(!plain(f)||f.jsonrpc!=='2.0'||typeof f.method!=='string'||
    !Object.keys(f).every(k=>['jsonrpc','id','method','params'].includes(k))||
    Buffer.byteLength(JSON.stringify(f),'utf8')>32000||!['stdio','http'].includes(transport))return rpcErr(f?.id,-32600,'Invalid request');
   const modern=metaOf(f)?.['io.modelcontextprotocol/protocolVersion'];
   if(modern===undefined){
    if(transport==='http'&&headers?.['mcp-protocol-version']===MODERN)return headerErr(f);
    if(transport==='http'&&headers?.['mcp-protocol-version']!==undefined&&headers['mcp-protocol-version']!==LEGACY)
     return versionError(f,headers['mcp-protocol-version']);
    return edge.handle(f);
   }
   if(modern!==MODERN)return versionError(f,modern);
   if(!validMeta(metaOf(f))||!plain(f.params)||
    !(Number.isSafeInteger(f.id)||typeof f.id==='string'))return rpcErr(f.id,-32600,'Per-request MCP metadata and id required');
   if(transport==='http'&&headersFault(f,headers))return headerErr(f);
   if(f.method==='initialize'||f.method==='notifications/initialized')return rpcErr(f.id,-32601,'Legacy handshake not available on modern request');
   if(f.method==='server/discover'&&Object.keys(f.params).some(k=>k!=='_meta'))
    return rpcErr(f.id,-32602,'Unexpected discover parameters');
   if(f.method==='server/discover')return {jsonrpc:'2.0',id:f.id,result:{resultType:'complete',supportedVersions:SUPPORTED,ttlMs:0,cacheScope:'private',
    capabilities:{tools:{listChanged:false}},serverInfo:server,_meta:outMeta}};
   if(!['tools/list','tools/call'].includes(f.method))return rpcErr(f.id,-32601,'Method not found');
   if(!Number.isSafeInteger(f.id)&&typeof f.id!=='string')return rpcErr(null,-32600,'Request id required');
   if(f.method==='tools/list'&&Object.keys(f.params||{}).some(k=>k!=='_meta'))
    return rpcErr(f.id,-32602,'Unexpected list parameters');
   if(f.method==='tools/call'&&Object.keys(f.params||{}).some(k=>!['name','arguments','_meta'].includes(k)))
    return rpcErr(f.id,-32602,'Unexpected tool parameters');
   // Preserve the exact legacy C112 frame predicate, merely removing modern wire metadata.
   const params={...f.params};delete params._meta;
   const r=await edge.handle({...f,params});
   if(r===null)return rpcErr(f.id,-32600,'Unexpected notification');
   if(r.error)return r;
   return {...r,result:{...r.result,resultType:'complete',
    ...(f.method==='tools/list'?{ttlMs:0,cacheScope:'private'}:{}),_meta:outMeta}};
  }
 });
}
