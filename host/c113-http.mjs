import http from 'node:http';
import crypto from 'node:crypto';
import {createC113DualEra,MODERN,LEGACY} from './c113-dual-era.mjs';
/** Small loopback-only HTTP adapter. No public ingress or OAuth attestation. */
export function createC113HttpServer(original,{token,host='127.0.0.1'}={}){
 if(typeof token!=='string'||token.length<32||!/^[!-~]+$/.test(token)||host!=='127.0.0.1')
  throw Error('C113_LOOPBACK_AUTH_CONFIG');
 const dual=createC113DualEra(original);
 return http.createServer(async(req,res)=>{
  const reject=(status,body=null)=>{res.writeHead(status,{'Cache-Control':'no-store',...(body?{'Content-Type':'application/json'}:{})});res.end(body?JSON.stringify(body):undefined);};
  if(req.url!=='/mcp')return reject(404);
  const localPort=req.socket.localPort,origin=req.headers.origin;
  if(origin&&!['http://127.0.0.1:'+localPort,'http://localhost:'+localPort].includes(origin))return reject(403);
  const a=String(req.headers.authorization||''),expected='Bearer '+token;
  if(a.length!==expected.length||!crypto.timingSafeEqual(Buffer.from(a),Buffer.from(expected)))return reject(401);
  if(req.method!=='POST')return reject(405);
  if(!String(req.headers.accept||'').includes('application/json')||
   !String(req.headers.accept||'').includes('text/event-stream'))return reject(406);
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return reject(415);
  let total=0,buf=[];try{for await(const c of req){total+=c.length;if(total>32000)return reject(413);buf.push(c);}}catch{return reject(400);}
  let f;try{f=JSON.parse(Buffer.concat(buf).toString('utf8'));}catch{return reject(400);}
  const requested=String(req.headers['mcp-protocol-version']||'');
  if(requested!==MODERN&&requested!==LEGACY)return reject(400,{jsonrpc:'2.0',id:f?.id??null,
   error:{code:-32022,message:'Unsupported protocol version',data:{supported:[MODERN,LEGACY],requested}}});
  let response;try{response=await dual.handle(f,{transport:'http',headers:req.headers});}
  catch{return reject(500);}
  if(response===null)return reject(202);
  const code=response?.error?.code===-32020||response?.error?.code===-32022?400:
   response?.error?.code===-32601?404:200;
  return reject(code,response);
 });
}
