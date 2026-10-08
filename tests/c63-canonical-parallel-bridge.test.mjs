import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {performance} from 'node:perf_hooks';
import {executeC63HostBridge,executeC63AtAcceptance,executeC66QualifiedAtAcceptance,createC65PinnedGitHubSource,validateC65SourceSinkProjection,validateC63Input} from '../host/c63-canonical-parallel-bridge.mjs';

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
    assert.equal(result.source_sink_projection.object_count,8);
    assert.equal(result.source_sink_projection.github_host_fetch_proven,false);
    assert.equal(result.source_sink_projection.host_native_delivery_proven,false);
    assert.deepEqual(validateC65SourceSinkProjection(result.source_sink_projection,{sourceHead:HEAD,preacceptHandoff:fixture().preacceptHandoff}),{ok:true,errors:[]});
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

test('C65 pinned GitHub response adapter => 8/8 actual C61 local reopen projection => C59 readback',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c65-source-sink-'));
  try{
    const f=fixture(),byPath=new Map(f.sourceObjects.map(x=>[x.path,x])),reads=[];
    const read=async args=>{
      reads.push(args);
      assert.deepEqual(Object.keys(args).sort(),['encoding','path','ref','repository_full_name']);
      assert.equal(args.ref,HEAD);
      assert.equal(args.encoding,'base64');
      assert.equal(args.repository_full_name,'Luke883i/iKant_LE');
      const obj=byPath.get(args.path);
      const content=obj.content_base64.match(/.{1,61}/g).join('\n');
      return {result:{sha:obj.blob_sha1,encoding:'base64',content,
        display_url:'https://github.com/Luke883i/iKant_LE/blob/'+HEAD+'/'+args.path}};
    };
    const result=await executeC63AtAcceptance({
      humanInput:'I ACCEPT',sourceHead:HEAD,preacceptHandoff:f.preacceptHandoff,
      sessionRoot:root,fetchPinnedObject:createC65PinnedGitHubSource(read),runnerCount:4
    });
    assert.equal(reads.length,8);
    const p=result.source_sink_projection;
    assert.equal(p.owner_result_receipt_sha256,result.owner_result_receipt_sha256);
    assert.equal(p.runtime_root_sha256,result.runtime_root_sha256);
    assert.equal(p.local_reopen_verified,true);
    assert.equal(p.github_host_fetch_proven,false);
    assert.equal(p.host_native_delivery_proven,false);
    assert.equal(p.object_count,8);
    assert.equal(new Set(p.objects.map(x=>x.path)).size,8);
    assert.ok(p.objects.every(x=>x.source_sha256===x.local_readback_sha256));
    assert.ok(p.objects.every(x=>x.source_object_identity_claim.includes('/blob/'+HEAD+'/')));
    assert.deepEqual(validateC65SourceSinkProjection(p,{sourceHead:HEAD,preacceptHandoff:f.preacceptHandoff}),{ok:true,errors:[]});
    assert.equal(result.owner_active_readback.ok,true);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C65 rejects GitHub API response tamper and ambiguous encoding before any owner invocation',async()=>{
  const f=fixture(),original=f.sourceObjects[0],request={sourceHead:HEAD,path:original.path,blob_sha1:original.blob_sha1};
  const good={sha:original.blob_sha1,encoding:'base64',content:original.content_base64,
    display_url:'https://github.com/Luke883i/iKant_LE/blob/'+HEAD+'/'+original.path};
  assert.throws(()=>createC65PinnedGitHubSource(null),/callable/);
  for(const mutation of [
    x=>{x.sha='b'.repeat(40);},
    x=>{x.encoding='utf-8';},
    x=>{x.display_url='https://github.com/Luke883i/iKant_LE/blob/main/'+original.path;},
    x=>{x.content='eA==';},
    x=>{x.content=undefined;},
    x=>{x.content+='A';}
  ]){
    const row={...good};mutation(row);
    await assert.rejects(()=>createC65PinnedGitHubSource(async()=>({result:row}))(request));
  }
  const read=createC65PinnedGitHubSource(async()=>({result:good}));
  await assert.rejects(()=>read({...request,path:'../escape'}),/pinned source request/);
  await assert.rejects(()=>read({...request,sourceHead:'main'}),/pinned source request/);
});

test('C65 projection never manufactures native-origin or ACTIVE proof; adversarial tampering rejected',async()=>{
  const f=fixture(),root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c65-negative-'));
  try{
    const out=await executeC63HostBridge({...f,sessionRoot:root});
    const p=out.source_sink_projection,validate=x=>validateC65SourceSinkProjection(x,{sourceHead:HEAD,preacceptHandoff:f.preacceptHandoff}).ok;
    assert.equal(validate(p),true);
    for(const m of [
      x=>{x.objects[3].source_sha256='0'.repeat(64);},
      x=>{x.objects[0].source_blob_sha1='0'.repeat(40);},
      x=>{x.objects.pop();},
      x=>{x.objects[1].path=x.objects[0].path;},
      x=>{x.github_host_fetch_proven=true;},
      x=>{x.host_native_delivery_proven=true;},
      x=>{x.active_authority_claim=true;},
      x=>{x.owner_manifest_receipt_sha256='bad';},
      x=>{x.projection_sha256='0'.repeat(64);}
    ]){const copy=structuredClone(p);m(copy);assert.equal(validate(copy),false);}
    const fake=structuredClone(p);
    fake.github_host_fetch_proven=true;
    delete fake.projection_sha256;
    fake.projection_sha256=crypto.createHash('sha256').update(JSON.stringify(fake)).digest('hex');
    assert.equal(validate(fake),false,'rehashed host claim must remain forbidden');
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C66 owner-qualified ACTIVE delegates to the original canonical C63/C61/C59 path',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c66-active-'));
  try{
    const f=fixture(),byPath=new Map(f.sourceObjects.map(o=>[o.path,o])),observed=[];
    const response=await executeC66QualifiedAtAcceptance({
      sourceHead:HEAD,humanInput:'I ACCEPT',preacceptHandoff:f.preacceptHandoff,
      sessionRoot:root,runnerCount:3,
      fetchPinnedObject:async ({path})=>({...byPath.get(path)}),
      onOwnerMilestone:m=>observed.push(m.edge)
    });
    assert.equal(response.outcome,'ACTIVE');
    assert.equal(response.active,true);
    assert.equal(response.active_readback_verified,true);
    assert.equal(response.strongest_valid_prefix,'ACTIVE');
    assert.equal(response.first_unclosed_edge,null);
    assert.deepEqual(observed,['SOURCE_SNAPSHOT','LOCAL_INGRESS']);
    assert.equal(response.owner_evidence.length,2);
    assert.equal(response.owner_evidence[1].observation_receipts_sha256.length,8);
    assert.equal(response.canonical_result.owner_active_readback.composition_authority,'C59_CANONICAL');
    assert.equal(response.canonical_result.runner_kind,'NODE_WORKER_THREADS');
    assert.equal(response.canonical_result.runner_count,3);
    assert.equal(response.retry_gate.automatic_attempts,0);
    assert.equal(response.authority,0);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C66 missing GitHub source yields no fabricated certified tier and no retries',async()=>{
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c66-no-source-'));
  let requests=0;
  try{
    const f=fixture(),out=await executeC66QualifiedAtAcceptance({
      sourceHead:HEAD,humanInput:'I ACCEPT',preacceptHandoff:f.preacceptHandoff,
      sessionRoot:root,fetchPinnedObject:async()=>{requests++;throw Error('GitHub API unavailable');}
    });
    assert.equal(requests,8,'one concurrent fetch per frozen object; no hidden retries');
    assert.equal(out.outcome,'NON_ACTIVE');
    assert.equal(out.active,false);
    assert.equal(out.active_readback_verified,false);
    assert.equal(out.strongest_valid_prefix,null);
    assert.equal(out.first_unclosed_edge,'SOURCE_SNAPSHOT');
    assert.deepEqual(out.available_capabilities,[]);
    assert.deepEqual(out.owner_evidence,[]);
    assert.equal(out.retry_gate.owner_authorized_retry_observed,false);
    assert.equal(out.retry_gate.automatic_attempts,0);
    assert.equal(fs.existsSync(path.join(root,'runtime')),false);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C66 owner milestone boundaries certify only the strongest physically reached prefix',async()=>{
  const f=fixture(),byPath=new Map(f.sourceObjects.map(o=>[o.path,o]));
  for(const [edge,tier,first,count] of [
    ['SOURCE_SNAPSHOT','REPO_STUDY_ONLY','LOCAL_INGRESS',1],
    ['LOCAL_INGRESS','ACTIVATION_LIMITED_1','LOCAL_MATERIALIZATION',2]
  ]){
    const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c66-prefix-'));
    try{
      const result=await executeC66QualifiedAtAcceptance({
        sourceHead:HEAD,humanInput:'I ACCEPT',preacceptHandoff:f.preacceptHandoff,
        sessionRoot:root,fetchPinnedObject:async ({path})=>({...byPath.get(path)}),
        onOwnerMilestone:observed=>{if(observed.edge===edge)throw Error('test controlled interruption');}
      });
      assert.equal(result.outcome,'NON_ACTIVE');
      assert.equal(result.active,false);
      assert.equal(result.active_readback_verified,false);
      assert.equal(result.strongest_valid_prefix,tier);
      assert.equal(result.first_unclosed_edge,first);
      assert.equal(result.owner_evidence.length,count);
      assert.equal(result.canonical_result,null);
      assert.equal(result.retry_gate.automatic_attempts,0);
      assert.equal(fs.existsSync(path.join(root,'runtime')),false);
    }finally{fs.rmSync(root,{recursive:true,force:true});}
  }
});

test('C66 integrity contradiction revokes a previously reached prefix',async()=>{
  const f=fixture(),byPath=new Map(f.sourceObjects.map(o=>[o.path,o]));
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c66-integrity-'));
  try{
    const out=await executeC66QualifiedAtAcceptance({
      sourceHead:HEAD,humanInput:'I ACCEPT',preacceptHandoff:f.preacceptHandoff,
      sessionRoot:root,fetchPinnedObject:async ({path})=>({...byPath.get(path)}),
      onOwnerMilestone:m=>{if(m.edge==='SOURCE_SNAPSHOT')throw Error('identity mismatch deliberately injected');}
    });
    assert.equal(out.outcome,'BLOCKED_INTEGRITY');
    assert.equal(out.strongest_valid_prefix,null);
    assert.equal(out.fault_overlay,'BLOCKED_INTEGRITY');
    assert.equal(out.owner_evidence.length,1);
    assert.equal(out.active,false);
    assert.deepEqual(out.available_capabilities,[]);
    assert.equal(fs.existsSync(path.join(root,'runtime')),false);
  }finally{fs.rmSync(root,{recursive:true,force:true});}
});

test('C66 cannot inject owner milestones and never substitutes retry or legacy ACTIVE',async()=>{
  const f=fixture();
  const result=await executeC66QualifiedAtAcceptance({
    sourceHead:HEAD,humanInput:'I ACCEPT',preacceptHandoff:f.preacceptHandoff,
    _ownerEvidenceSink:()=>{throw Error('should not be called');},
    fetchPinnedObject:async()=>{throw Error('should not be fetched');}
  });
  assert.equal(result.active,false);
  assert.equal(result.outcome,'NON_ACTIVE');
  assert.equal(result.strongest_valid_prefix,null);
  assert.equal(result.owner_evidence.length,0);
  assert.equal(result.retry_gate.disposition,'STOP_AWAIT_OWNER_AUTHORIZED_CHANGED_EVIDENCE');
});
