import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {executeC63HostBridge,executeC63AtAcceptance,validateC63Input} from '../host/c63-canonical-parallel-bridge.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HEAD='a'.repeat(40);
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
function fixture(){
  const b=JSON.parse(fs.readFileSync(path.join(ROOT,'BOOTSTRAP.json'),'utf8'));
  const paths=b.post_accept_fastboot.reuse_preaccept_paths;
  const identities=paths.map(p=>{const bytes=fs.readFileSync(path.join(ROOT,p));return{path:p,blob_sha1:gitBlob(bytes),bytes:bytes.length};});
  const terms=identities.find(x=>x.path==='TERMS.md');
  return{
    sourceHead:HEAD,humanInput:'I ACCEPT',runnerCount:4,
    acceptanceObservedMonotonicMs:performance.now(),
    preacceptHandoff:{
      schema:'ikant-le-preaccept-handoff/v2',repository:'Luke883i/iKant_LE',
      source_head:HEAD,terms_presented:true,terms_object:{...terms},frozen:true,breached:false,
      pending_intent:'inizializza',orientation_objects:identities,
      orientation_payloads:paths.map(p=>({path:p,content_utf8:fs.readFileSync(path.join(ROOT,p),'utf8')})),
      runtime_observed_terms_presentation:false,host_attested_terms_presentation:true,authority:0
    },
    sourceObjects:b.post_accept_fastboot.remote_paths.map(p=>{
      const bytes=fs.readFileSync(path.join(ROOT,p));
      return{path:p,blob_sha1:gitBlob(bytes),content_base64:bytes.toString('base64'),source_object_identity:'fixture:'+HEAD+':'+p};
    })
  };
}
test('C63 closed-world source rejects tamper, stale head, duplicate, partial, incorrect consent',()=>{
  const ok=fixture();assert.deepEqual(validateC63Input(ok),{ok:true,objects:8});
  for(const mutation of [
    x=>x.sourceObjects.pop(),
    x=>x.sourceObjects[7]=x.sourceObjects[0],
    x=>x.sourceObjects[2].content_base64='eA==',
    x=>x.sourceObjects[1].source_object_identity='',
    x=>x.sourceObjects[3].content_base64+='A',
    x=>x.sourceHead='b'.repeat(40),
    x=>x.humanInput='I ACCEPT ',
    x=>x.preacceptHandoff.orientation_payloads.find(y=>y.path==='BOOTSTRAP.json').content_utf8+=' ',
    x=>x.acceptanceObservedMonotonicMs=performance.now()+10000,
    x=>x.runnerCount=8
  ]){const x=structuredClone(ok);mutation(x);assert.equal(validateC63Input(x).ok,false);}
});
test('C63 parallel Node worker samehash -> owner C61/C59 canonical ACTIVE, runtime output, DOCX and EXIT',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c63-'));
  try{
    const result=await executeC63HostBridge({...fixture(),sessionRoot:root});
    assert.equal(result.runner_kind,'NODE_WORKER_THREADS');
    assert.equal(result.runner_count,4);
    assert.equal(result.verified_object_count,8);
    assert.equal(result.owner_active_readback.ok,true);
    assert.equal(result.owner_active_readback.state,'ACTIVE');
    assert.equal(result.owner_active_readback.composition_authority,'C59_CANONICAL');
    const runtime=path.join(root,'runtime');
    const materialization=JSON.parse(fs.readFileSync(path.join(runtime,'.ikant/materialization.json'),'utf8'));
    assert.equal(materialization.reopen_verified,true);
    assert.equal(materialization.orientation_source_files_materialized,false);
    assert.equal(fs.existsSync(path.join(runtime,'TERMS.md')),false);
    const {runCommand,canonicalActiveReadback}=await import(pathToFileURL(path.join(runtime,'src/runtime.mjs')).href);
    assert.equal(canonicalActiveReadback().ok,true);
    const turn=runCommand('continuiamo',{hostSurface:'SESSION_CHAT_LOCAL_RUNTIME'});
    assert.equal(turn.code,0);
    assert.equal(turn.artifacts?.length,1);
    assert.equal(turn.artifacts[0].required_presentation,true);
    assert.equal(fs.existsSync(turn.artifacts[0].path),true);
    const exit=runCommand('EXIT IKANT',{hostSurface:'SESSION_CHAT_LOCAL_RUNTIME'});
    assert.equal(exit.code,0);
    const ledger=fs.readFileSync(path.join(runtime,'.ikant/ledger.jsonl'),'utf8');
    assert.match(ledger,/EXITED/);
    await assert.rejects(()=>executeC63HostBridge({...fixture(),sessionRoot:root}),/runtime sink exists/);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});
test('C63 source failure cannot write a runtime and workers cannot exceed bound',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c63-fail-'));
  try{
    const x=fixture();x.sourceObjects[1].content_base64='eA==';
    await assert.rejects(()=>executeC63HostBridge({...x,sessionRoot:root}),/source blob mismatch/);
    assert.equal(fs.existsSync(path.join(root,'runtime')),false);
    const y=fixture();y.runnerCount=0;
    await assert.rejects(()=>executeC63HostBridge({...y,sessionRoot:root}),/runner count/);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C64 ingress binds acceptance before parallel pinned GitHub source acquisition and calls existing C61/C59',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c64-ingress-'));
  try{
    const f=fixture(),source=new Map(f.sourceObjects.map(o=>[o.path,o])),requests=[];
    const r=await executeC63AtAcceptance({
      humanInput:'I ACCEPT',sourceHead:f.sourceHead,preacceptHandoff:f.preacceptHandoff,
      sessionRoot:root,runnerCount:3,
      fetchPinnedObject:async req=>{
        requests.push(req);
        assert.equal(req.sourceHead,f.sourceHead);
        assert.equal(req.blob_sha1,source.get(req.path)?.blob_sha1);
        assert.equal(fs.existsSync(path.join(root,'runtime')),false);
        return {...source.get(req.path)};
      }
    });
    assert.equal(requests.length,8);
    assert.deepEqual(requests.map(x=>x.path),f.sourceObjects.map(x=>x.path));
    assert.equal(r.verified_object_count,8);
    assert.equal(r.owner_active_readback.ok,true);
    assert.equal(r.owner_active_readback.composition_authority,'C59_CANONICAL');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C64 rejects retroactive acceptance origin, caller-selected runtime objects and invalid gate',async()=>{
  const f=fixture();let calls=0;
  const src=async()=>{calls++;return f.sourceObjects[0];};
  const base={humanInput:'I ACCEPT',sourceHead:f.sourceHead,preacceptHandoff:f.preacceptHandoff,fetchPinnedObject:src};
  for(const change of [
    {acceptanceObservedMonotonicMs:performance.now()},
    {sourceObjects:f.sourceObjects},
    {humanInput:'I ACCEPT '},
    {fetchPinnedObject:null},
    {sourceHead:'b'.repeat(40)}
  ])await assert.rejects(()=>executeC63AtAcceptance({...base,...change}));
  assert.equal(calls,0);
});

test('C64 bad or missing pinned provider object never materializes runtime; all fetches settle',async()=>{
  const f=fixture(),byPath=new Map(f.sourceObjects.map(o=>[o.path,o]));
  for(const bad of ['path','bytes','missing']){
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c64-invalid-'));
    let count=0;
    try{
      await assert.rejects(()=>executeC63AtAcceptance({
        humanInput:'I ACCEPT',sourceHead:f.sourceHead,preacceptHandoff:f.preacceptHandoff,
        sessionRoot:root,
        fetchPinnedObject:async req=>{
          count++;
          if(req.path===f.sourceObjects[3].path&&bad==='missing')throw Error('source unavailable');
          const obj={...byPath.get(req.path)};
          if(req.path===f.sourceObjects[3].path&&bad==='path')obj.path='other/shard.json';
          if(req.path===f.sourceObjects[3].path&&bad==='bytes')obj.content_base64='eA==';
          return obj;
        }
      }));
      assert.equal(count,8);
      assert.equal(fs.existsSync(path.join(root,'runtime')),false);
    }finally{fs.rmSync(root,{recursive:true,force:true});}
  }
});
