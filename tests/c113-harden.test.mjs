import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createC112McpEdge} from '../host/c112-mcp-edge.mjs';
import {createC113DualEra,MODERN} from '../host/c113-dual-era.mjs';
const start={jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'ikant_start',arguments:{}}};
const meta={'io.modelcontextprotocol/protocolVersion':MODERN,'io.modelcontextprotocol/clientCapabilities':{}};
test('failed C111 activation releases incomplete session and leaves no persistent private directory',async()=>{
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c113-fs-'));
 try{
  const edge=createC112McpEdge({sourceHead:'a'.repeat(40),privateRoot:parent,
   makeEdge:()=>({async dispatch(){throw Error('before-terms');}})});
  const x=await edge.handle(start);
  assert.equal(x.result.structuredContent.receipt.status,'C112_STOP');
  assert.equal(edge.metrics().sessions,0);
  assert.deepEqual(fs.readdirSync(parent),[]);
 }finally{fs.rmSync(parent,{recursive:true,force:true});}
});
test('modern method without id cannot mutate any C111 session',async()=>{
 const parent=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c113-id-'));
 try{
  const edge=createC112McpEdge({sourceHead:'a'.repeat(40),privateRoot:parent,
   makeEdge:()=>({async dispatch(){return {status:'C109_TERMS_PRESENTED',surface_a:'terms'};}})});
  const r=await createC113DualEra(edge).handle({jsonrpc:'2.0',method:'tools/call',
   params:{name:'ikant_start',arguments:{},_meta:meta}});
  assert.equal(r.error.code,-32600);
  assert.equal(edge.metrics().sessions,0);
 }finally{fs.rmSync(parent,{recursive:true,force:true});}
});
