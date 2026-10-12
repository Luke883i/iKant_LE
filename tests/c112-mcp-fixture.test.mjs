import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {createC112McpEdge,C112_TOOLS} from '../host/c112-mcp-edge.mjs';
import {dispatchC112Line,createC112HttpServer} from '../host/c112-transports.mjs';
const HEAD='a'.repeat(40);
const req=(id,method,params={})=>({jsonrpc:'2.0',id,method,params});
const call=(id,name,args)=>req(id,'tools/call',{name,arguments:args});
const payload=r=>JSON.parse(r.result.content[0].text);
const pause=ms=>new Promise(r=>setTimeout(r,ms));
function fixture(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c112-fixture-'));
 const seen=[],edges=[];
 const makeEdge=({sourceHead,ledgerFile})=>{
  let phase='COLD',counter=0;
  const edge={async dispatch(f){
   seen.push({phase,op:f.op,text:f.text,ledgerFile});
   if(f.op==='ACTIVATE'){phase='TERMS';return {status:'C109_TERMS_PRESENTED',surface_a:'Original Terms Fixture',surface_b:{evidence:{}}};}
   if(f.op==='STATUS')return {status:'C111_LOCAL_PHASE_ONLY',phase};
   if(f.op==='EXIT'){phase='CLOSED';return {status:'C109_LOCAL_SESSION_CLOSED',surface_a:null,surface_b:{}};}
   if(f.op==='REVOKE'){phase='OPTIN';return {status:'C109_OPTIN_REVOKED',surface_a:null,surface_b:{}};}
   if(f.op==='MESSAGE'){
    if(phase==='TERMS'&&f.text==='I ACCEPT'){phase='MODE';return {status:'C109_C72_INTRO',surface_a:'fixture intro',surface_b:{}};}
    if(phase==='MODE'&&f.text==='EXPERIMENTAL'){phase='OPTIN';return {status:'C109_EXPERIMENTAL_SELECTED',surface_a:null,surface_b:{}};}
    if(phase==='OPTIN'&&f.text==='AUTORIZZO BOZZE COHOST SPERIMENTALI NON VERIFICATE'){
     phase='READY';return {status:'C109_LOCAL_SHELL_READY',surface_a:null,surface_b:{}};}
    if(phase!=='READY')return {status:'C109_STOP',surface_a:null,surface_b:{first_unclosed_edge:'LATER_CONSENT_REQUIRED'}};
    await pause(1);counter++;
    return {status:'C109_VERIFIED_LOCAL_VOICE_NOT_NATIVE',surface_a:'mock-'+counter+'-'+f.text,
     surface_b:{evidence:{sequence:counter}},active:false};
   }
   return {status:'C109_STOP',surface_b:{}};
  }};edges.push(edge);return edge;
 };
 const edge=createC112McpEdge({sourceHead:HEAD,privateRoot:dir,makeEdge,maxSessions:2});
 return {dir,edge,seen,edges};
}
test('MCP initializes and tool list deterministic',async()=>{
 const x=fixture();try{
  const init=await x.edge.handle(req(1,'initialize',{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'test',version:'1'}}));
  assert.equal(init.result.protocolVersion,'2025-11-25');
  assert.equal((await x.edge.handle(req(2,'tools/list'))).result.tools.length,5);
  assert.deepEqual((await x.edge.handle(req(3,'tools/list'))).result.tools,C112_TOOLS);
  assert.equal(await x.edge.handle({jsonrpc:'2.0',method:'notifications/initialized'}),null);
  assert.equal((await x.edge.handle(req(4,'ping'))).result.constructor,Object);
 }finally{await x.edge.closeAll();fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('session isolation, literal later gates, concurrent independent starts and serial same-session turns',async()=>{
 const x=fixture();try{
  const a=payload(await x.edge.handle(call(1,'ikant_start',{})));
  const b=payload(await x.edge.handle(call(2,'ikant_start',{})));
  assert.match(a.session,/^[a-f0-9]{32}$/);assert.notEqual(a.session,b.session);
  const exhausted=payload(await x.edge.handle(call(3,'ikant_start',{})));
  assert.equal(exhausted.receipt.status,'C112_STOP');
  let denied=payload(await x.edge.handle(call(4,'ikant_turn',{session:a.session,text:'ciao'})));
  assert.equal(denied.receipt.status,'C109_STOP');
  const steps=['I ACCEPT','EXPERIMENTAL','AUTORIZZO BOZZE COHOST SPERIMENTALI NON VERIFICATE'];
  for(let i=0;i<steps.length;i++){
   const r=payload(await x.edge.handle(call(i+5,'ikant_turn',{session:a.session,text:steps[i]})));
   assert.ok(r.receipt.status.startsWith('C109_'));
  }
  const out=await Promise.all(Array.from({length:8},(_,i)=>x.edge.handle(call(10+i,'ikant_turn',
   {session:a.session,text:'turno-'+i}))));
  assert.deepEqual(out.map(o=>payload(o).receipt.surface_b.evidence.sequence),Array.from({length:8},(_,i)=>i+1));
  assert.equal(x.edge.metrics().peak,2);
  const still=payload(await x.edge.handle(call(20,'ikant_status',{session:b.session})));
  assert.equal(still.receipt.phase,'TERMS');
  assert.equal(payload(await x.edge.handle(call(21,'ikant_revoke',{session:a.session}))).receipt.status,'C109_OPTIN_REVOKED');
  await x.edge.handle(call(22,'ikant_exit',{session:a.session}));
  assert.equal(x.edge.metrics().sessions,1);
  assert.equal(payload(await x.edge.handle(call(23,'ikant_turn',{session:a.session,text:'x'}))).receipt.status,'C112_STOP');
 }finally{await x.edge.closeAll();fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('frame policy rejects extra authority, invalid handle and unknown transport operation',async()=>{
 const x=fixture();try{
  for(const f of [call(1,'ikant_start',{active:true}),call(2,'ikant_turn',{session:'f'.repeat(32),text:''}),
   req(3,'custom/exec',{shell:'rm -rf /'}),{jsonrpc:'2.0',id:4,method:'tools/call',params:{name:'ikant_start',arguments:{},ownerReceipt:'forged'}}]){
    const r=await x.edge.handle(f);assert.ok(r.error,JSON.stringify(r));
  }
  assert.equal(x.edge.metrics().sessions,0);
 }finally{await x.edge.closeAll();fs.rmSync(x.dir,{recursive:true,force:true});}
});
test('physical STDIO line envelope and loopback HTTP authenticate and reject malicious Origin',async()=>{
 const x=fixture();const token=crypto.randomBytes(32).toString('hex');
 const server=createC112HttpServer(x.edge,{token,port:0});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const port=server.address().port, url=`http://127.0.0.1:${port}/mcp`;
 const send=(frame,headers={})=>fetch(url,{method:'POST',headers:{'Authorization':'Bearer '+token,
  'Accept':'application/json, text/event-stream','Content-Type':'application/json',...headers},
  body:JSON.stringify(frame)});
 try{
  const s=await dispatchC112Line(x.edge,JSON.stringify(req(1,'tools/list')));
  assert.equal(s.result.tools.length,5);
  const http=await send(req(2,'tools/list'));
  assert.equal(http.status,200);assert.equal((await http.json()).result.tools.length,5);
  assert.equal((await send(req(3,'tools/list'),{Origin:'https://evil.test'})).status,403);
  assert.equal((await send(req(3,'tools/list'),{Authorization:'Bearer wrong'})).status,401);
  const start=await send(call(4,'ikant_start',{}));assert.equal(start.status,200);
  const handle=payload(await start.json()).session;
  assert.match(handle,/^[a-f0-9]{32}$/);
  assert.equal((await send({jsonrpc:'2.0',method:'notifications/initialized'})).status,202);
  const wrongMethod=await fetch(url,{method:'GET',headers:{Authorization:'Bearer '+token}});
  assert.equal(wrongMethod.status,405);
 }finally{await x.edge.closeAll();await new Promise(resolve=>server.close(resolve));fs.rmSync(x.dir,{recursive:true,force:true});}
});
