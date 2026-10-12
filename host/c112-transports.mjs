import http from 'node:http';
import crypto from 'node:crypto';

// One dispatcher. Transports only frame and authenticate; they never reroute or compute cognition.
const parseError={jsonrpc:'2.0',id:null,error:{code:-32700,message:'INVALID_OR_OVERSIZE_JSON'}};
export async function dispatchC112Line(edge,line){
 try{
  if(typeof line!=='string'||Buffer.byteLength(line,'utf8')>32000)return parseError;
  return await edge.handle(JSON.parse(line));
 }catch{return parseError;}
}
export function createC112HttpServer(edge,{token,port,host='127.0.0.1'}={}){
 if(!edge||typeof edge.handle!=='function'||typeof token!=='string'||token.length<32||
  !/^[!-~]+$/.test(token)||!Number.isInteger(port)||port<0||port>65535||host!=='127.0.0.1')
  throw Error('C112_HTTP_SECURITY_CONFIGURATION');
 return http.createServer(async(req,res)=>{
  const reject=status=>{res.writeHead(status,{'Cache-Control':'no-store'});res.end();};
  if(req.url!=='/mcp')return reject(404);
  const origin=req.headers.origin;
  const localPort=req.socket.localPort;
  if(origin&&origin!==`http://127.0.0.1:${localPort}`&&origin!==`http://localhost:${localPort}`)return reject(403);
  const credentials=String(req.headers.authorization||'');
  const expected='Bearer '+token;
  if(Buffer.byteLength(credentials)!==Buffer.byteLength(expected)||
   !crypto.timingSafeEqual(Buffer.from(credentials),Buffer.from(expected)))return reject(401);
  if(req.method!=='POST')return reject(405);
  const accept=String(req.headers.accept||'');
  if(!accept.includes('application/json')||!accept.includes('text/event-stream'))return reject(406);
  const chunks=[];let total=0;
  try{
   for await(const chunk of req){total+=chunk.length;if(total>32000)return reject(413);chunks.push(chunk);}
  }catch{return reject(400);}
  const answer=await dispatchC112Line(edge,Buffer.concat(chunks).toString('utf8'));
  if(answer===null){res.writeHead(202,{'Cache-Control':'no-store'});res.end();return;}
  const body=JSON.stringify(answer);
  res.writeHead(200,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
   'Content-Length':Buffer.byteLength(body)});res.end(body);
 });
}
