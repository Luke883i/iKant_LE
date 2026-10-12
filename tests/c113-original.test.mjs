import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import {buildC107Package,stageC107Package,C107_FILES} from '../scripts/c107-pack.mjs';
const root=path.resolve(new URL('../',import.meta.url).pathname);
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const meta={'io.modelcontextprotocol/protocolVersion':'2026-07-28',
 'io.modelcontextprotocol/clientCapabilities':{},'io.modelcontextprotocol/clientInfo':{name:'test',version:'1'}};
const request=(id,method,params={})=>({jsonrpc:'2.0',id,method,params:{...params,_meta:meta}});
const call=(id,name,args)=>request(id,'tools/call',{name,arguments:args});
const unpack=r=>r.result.structuredContent;
const HEADERS=f=>({'MCP-Protocol-Version':'2026-07-28','Mcp-Method':f.method,
 ...(f.method==='tools/call'?{'Mcp-Name':f.params.name}:{})});
test('source exact C113 modern tool protocol runs C72 C70 C100 C87 and distinguishes synthetic',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c113-original-'));
 try{
  const pkg=buildC107Package({root,expectedHead:head});
  assert.equal(pkg.status,'C107_PACKAGE_BUILT_NOT_TRANSPORTED',JSON.stringify(pkg));
  for(const p of ['host/c113-dual-era.mjs','host/c113-http.mjs','scripts/c113-mcp-server.mjs'])assert.ok(C107_FILES.includes(p));
  const stage=stageC107Package({payload:pkg.payload,expectedSha256:pkg.sha256,expectedHead:head,privateParent:dir});
  assert.equal(stage.status,'C107_PACKAGE_REOPENED_NOT_EXECUTED',JSON.stringify(stage));
  const imp=async p=>import(pathToFileURL(path.join(stage.install_root,p)).href);
  const {createC113DualEra}=await imp('host/c113-dual-era.mjs');
  const {createC113HttpServer}=await imp('host/c113-http.mjs');
  const {createC112McpEdge}=await imp('host/c112-mcp-edge.mjs');
  const {createC111HostEdge}=await imp('host/c111-host-edge.mjs');
  const {inspectC107Ledger}=await imp('host/c107-experimental-turn.mjs');
  const edge=createC112McpEdge({sourceHead:head,privateRoot:path.join(stage.install_root,'private'),
   makeEdge:createC111HostEdge,allowSynthetic:true});
  try{
   const dual=createC113DualEra(edge);
   const discover=await dual.handle(request(1,'server/discover'));
   assert.equal(discover.result.resultType,'complete');
   assert.equal(discover.result.supportedVersions[0],'2026-07-28');
   const listing=await dual.handle(request(2,'tools/list'));
   assert.equal(listing.result.tools.length,5);
   const s=unpack(await dual.handle(call(3,'ikant_start',{})));
   assert.equal(s.receipt.status,'C109_TERMS_PRESENTED');
   const session=s.session;
   const gates=['I ACCEPT','EXPERIMENTAL','AUTORIZZO BOZZE COHOST SPERIMENTALI NON VERIFICATE'];
   for(const [i,g] of gates.entries())assert.ok((await dual.handle(call(4+i,'ikant_turn',{session,text:g}))).result);
   const q='Descrivi il funzionamento di un oggetto quotidiano.';
   const voice='Il primo oggetto viene descritto con un testo linguistico specifico per questa domanda.';
   const original=unpack(await dual.handle(call(7,'ikant_turn',{session,text:q,
    candidate:{input_sha256:sha(q),text:voice}})));
   assert.equal(original.receipt.status,'C109_VERIFIED_LOCAL_VOICE_NOT_NATIVE',JSON.stringify(original.receipt));
   assert.equal(original.receipt.surface_a,voice);
   assert.equal(original.receipt.surface_b.evidence.original_c70_executed,true);
   assert.equal(original.receipt.surface_b.evidence.original_c87_reopened,true);
   const synthetic=unpack(await dual.handle(call(8,'ikant_turn',{session,text:'Una seconda domanda',
    draft:'Questa risposta e dichiaratamente un esempio sintetico.'})));
   assert.equal(synthetic.receipt.status,'C109_SYNTHETIC_HOST_DRAFT_NOT_IKANT_RUNTIME');
   const ledger=path.join(stage.install_root,'private',session,'.ikant-host','c107-observations.jsonl');
   assert.equal(inspectC107Ledger(ledger).count,1);
   const server=createC113HttpServer(edge,{token:crypto.randomBytes(32).toString('hex')});
   await new Promise(r=>server.listen(0,'127.0.0.1',r));
   try{
    const token='Bearer '+crypto.randomBytes(32).toString('hex');
    // A wrong bearer never reaches the owner or writes the ledger.
    const url='http://127.0.0.1:'+server.address().port+'/mcp';
    const resp=await fetch(url,{method:'POST',headers:{Authorization:token,Accept:'application/json, text/event-stream',
     'Content-Type':'application/json',...HEADERS(request(9,'tools/list'))},body:JSON.stringify(request(9,'tools/list'))});
    assert.equal(resp.status,401);
   }finally{await new Promise(r=>server.close(r));}
   assert.equal(inspectC107Ledger(ledger).count,1);
   console.log('C113_EXACT_SOURCE_PROOF '+JSON.stringify({head,files:pkg.file_count,original_turns:1,
    synthetic_turns:1,model_provider_provenance:false,edu_native_delivery:false}));
  }finally{await edge.closeAll();}
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
