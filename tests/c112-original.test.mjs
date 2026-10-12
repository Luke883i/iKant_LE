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
const H=s=>crypto.createHash('sha256').update(s).digest('hex');
const gate='AUTORIZZO BOZZE COHOST SPERIMENTALI NON VERIFICATE';
const frame=(id,name,args)=>({jsonrpc:'2.0',id,method:'tools/call',params:{name,arguments:args}});
const result=x=>JSON.parse(x.result.content[0].text);
const questions=['Descrivi il funzionamento di un oggetto quotidiano.',
 'Spiega un secondo esempio collegato al primo.'];
const voices=['Il primo oggetto viene descritto con un testo linguistico specifico per questa domanda.',
 'Il secondo esempio considera il contesto della domanda precedente in modo pertinente.'];

test('Original source-exact C112 MCP adapter: C72 consent, 2 original C70/C100/C87 turns, synthetic, no false ledger',async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c112-original-'));
 try{
  const pkg=buildC107Package({root,expectedHead:head});
  assert.equal(pkg.status,'C107_PACKAGE_BUILT_NOT_TRANSPORTED',JSON.stringify(pkg));
  for(const file of ['host/c112-mcp-edge.mjs','host/c112-transports.mjs','scripts/c112-mcp-server.mjs'])
   assert.ok(C107_FILES.includes(file),file);
  const stage=stageC107Package({payload:pkg.payload,expectedSha256:pkg.sha256,
   expectedHead:head,privateParent:tmp});
  assert.equal(stage.status,'C107_PACKAGE_REOPENED_NOT_EXECUTED',JSON.stringify(stage));
  const {createC112McpEdge}=await import(pathToFileURL(path.join(stage.install_root,'host/c112-mcp-edge.mjs')).href);
  const {createC111HostEdge}=await import(pathToFileURL(path.join(stage.install_root,'host/c111-host-edge.mjs')).href);
  const {inspectC107Ledger}=await import(pathToFileURL(path.join(stage.install_root,'host/c107-experimental-turn.mjs')).href);
  const edge=createC112McpEdge({sourceHead:head,privateRoot:path.join(stage.install_root,'private'),
   makeEdge:createC111HostEdge,allowSynthetic:true});
  try{
   const a=result(await edge.handle(frame(1,'ikant_start',{})));
   assert.equal(a.receipt.status,'C109_TERMS_PRESENTED');
   assert.ok(a.receipt.surface_a.length>1500);
   const session=a.session;
   for(const [i,t] of ['I ACCEPT','EXPERIMENTAL',gate].entries()){
    const r=result(await edge.handle(frame(i+2,'ikant_turn',{session,text:t})));
    assert.ok(['C109_C72_INTRO','C109_EXPERIMENTAL_SELECTED','C109_LOCAL_SHELL_READY'].includes(r.receipt.status));
   }
   for(let i=0;i<2;i++){
    const q=questions[i],v=voices[i];
    const r=result(await edge.handle(frame(i+5,'ikant_turn',
     {session,text:q,candidate:{input_sha256:H(q),text:v}})));
    assert.equal(r.receipt.status,'C109_VERIFIED_LOCAL_VOICE_NOT_NATIVE',JSON.stringify(r.receipt));
    assert.equal(r.receipt.surface_a,v);
    assert.equal(r.receipt.surface_b.evidence.original_c70_executed,true);
    assert.equal(r.receipt.surface_b.evidence.original_c87_reopened,true);
    assert.equal(r.receipt.surface_b.evidence.ledger_entries,i+1);
   }
   const synthetic=result(await edge.handle(frame(7,'ikant_turn',
    {session,text:'Terza domanda',draft:'Bozza esplicitamente non originale.'})));
   assert.equal(synthetic.receipt.status,'C109_SYNTHETIC_HOST_DRAFT_NOT_IKANT_RUNTIME');
   assert.match(synthetic.receipt.surface_a,/^\[BOZZA HOST SPERIMENTALE/);
   const file=path.join(stage.install_root,'private',session,'.ikant-host','c107-observations.jsonl');
   assert.equal(inspectC107Ledger(file).count,2);
   assert.equal(result(await edge.handle(frame(8,'ikant_revoke',{session}))).receipt.status,'C109_OPTIN_REVOKED');
   await edge.handle(frame(9,'ikant_exit',{session}));
   assert.equal(edge.metrics().sessions,0);
   console.log('C112_ORIGINAL_MCP_EVIDENCE '+JSON.stringify({head,files:pkg.file_count,
    source_bytes:pkg.source_bytes,original_turns:2,synthetic_turns:1,
    original_ledger_events:2,native_edu_delivery:false,authenticated_model_provider:false}));
  }finally{await edge.closeAll();}
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});

test('C112 physically supplied callable language port receives current original C70 plan',async()=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c112-plan-'));
 try{
  const {createC112McpEdge}=await import('../host/c112-mcp-edge.mjs');
  const {createC111HostEdge}=await import('../host/c111-host-edge.mjs');
  let calls=0;
  const port={async generate(task){
   assert.equal(task.c70_plan.schema,'ikant-le-c107-c70-before-language/v1');
   assert.equal(task.c70_plan.input_sha256,H(task.current_input_utf8));calls++;
   return 'Una risposta linguistica di esempio, creata da una porta host di prova.';
  }};
  const edge=createC112McpEdge({sourceHead:head,privateRoot:tmp,makeEdge:createC111HostEdge,languagePort:port});
  try{
   const s=result(await edge.handle(frame(1,'ikant_start',{}))).session;
   for(const t of ['I ACCEPT','EXPERIMENTAL',gate])await edge.handle(frame(2,'ikant_turn',{session:s,text:t}));
   const r=result(await edge.handle(frame(3,'ikant_turn',{session:s,text:questions[0]})));
   assert.equal(r.receipt.status,'C109_VERIFIED_LOCAL_VOICE_NOT_NATIVE',JSON.stringify(r));
   assert.equal(calls,1);assert.equal(r.receipt.surface_b.evidence.original_c70_executed,true);
  }finally{await edge.closeAll();}
 }finally{fs.rmSync(tmp,{recursive:true,force:true});}
});
