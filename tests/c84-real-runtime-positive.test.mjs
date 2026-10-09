import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {buildC77Capsule} from '../scripts/c77-build-capsule.mjs';
import {createC81LocalGitProof} from '../scripts/c81-create-git-proof.mjs';
import {issueC72TermsOffer,acceptC72Terms,presentC72Introduction,selectC72Mode}
 from '../host/c72-unified-mode-admission.mjs';
import {executeC84ExperimentalTurn} from '../host/c84-experimental-transport.mjs';
import {C78HostRelay} from '../host/c78-host-relay.mjs';
import {materializeC82ParallelCarriers} from '../host/c82-experimental-carriers.mjs';

const SHA=b=>crypto.createHash('sha256').update(b).digest('hex');
const ROOT=new URL('../',import.meta.url);
function prepare(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-c84-positive-'));
 const capsulePath=path.join(dir,'capsule');
 const build=buildC77Capsule({outDir:capsulePath});
 const proof=createC81LocalGitProof({manifestPath:path.join(capsulePath,'c77-manifest.json')});
 const manifestBytes=fs.readFileSync(path.join(capsulePath,'c77-manifest.json'));
 const manifest=JSON.parse(manifestBytes);
 const offer=issueC72TermsOffer({sourceHead:build.head,termsDigest:SHA(fs.readFileSync(new URL('../TERMS.md',import.meta.url)))});
 const accepted=acceptC72Terms({offer,humanMessage:'I ACCEPT',termsPresented:true});
 const selection=selectC72Mode({accepted,orientation:presentC72Introduction(accepted),humanMessage:'EXPERIMENTAL'});
 assert.equal(selection.status,'EXPERIMENTAL_SELECTED_NOT_RUNNING');
 const verified={name:'LEGACY_SAMEHASH',getFile:async file=>({
  contentBase64:fs.readFileSync(path.join(capsulePath,file)).toString('base64')})};
 return {dir,capsulePath,manifest,manifestBytes,build,proof,selection,verified};
}
function args(f,humanInput){
 return {selection:f.selection,sourceHead:f.build.head,
  expectedManifestSha256:f.build.bundle_manifest_sha256,
  manifestBase64:f.manifestBytes.toString('base64'),
  sourceProof:f.proof.proof,carriers:[f.verified],humanInput,
  parallelism:4,carrierTimeoutMs:1500};
}
test('C84.1 two truly executed C77/C82/C78/C79/C81 positive runtime turns, no native status',async()=>{
 const f=prepare();
 try{
  assert.equal(f.manifest.files.length,34);
  const derivative=f.manifest.files.find(x=>x.path==='src/c71-experimental-host-draft.mjs');
  assert.equal(derivative.generated_derivative,true);
  assert.match(derivative.original_source_blob_sha1,/^[a-f0-9]{40}$/);
  const texts=['Confronta due alternative e indica una prova osservabile.',
   'Spiega due alternative verificabili.'];
  const outputs=[];
  for(const input of texts){
   const result=await executeC84ExperimentalTurn(args(f,input));
   assert.equal(result.status,'C84_RUNTIME_VOICE_READY_NOT_NATIVE_DELIVERED',JSON.stringify(result));
   assert.equal(result.input_sha256,SHA(Buffer.from(input,'utf8')));
   assert.equal(result.output_sha256,SHA(Buffer.from(result.runtime_computed_answer,'utf8')));
   assert.equal(result.staged_files,34);
   assert.equal(result.source_reachability,'C81_GIT_REACHABILITY_VERIFIED');
   assert.equal(result.runtime_projection,'C81_RUNTIME_SURFACE_A_READY_NOT_NATIVE_DELIVERED');
   assert.equal(result.active,false);
   assert.equal(result.persistent,false);
   assert.equal(result.source_origin_attested,false);
   assert.equal(result.native_chat_delivery_attested,false);
   outputs.push(result);
  }
  assert.notEqual(outputs[0].input_sha256,outputs[1].input_sha256);
 }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('C84.1 real derivative with SHA-valid payload is accepted; forged derivative flag is denied before staging',async()=>{
 const f=prepare();let relay;
 try{
  relay=new C78HostRelay({selection:f.selection,sourceHead:f.build.head,
   expectedManifestSha256:f.build.bundle_manifest_sha256,
   manifestBase64:f.manifestBytes.toString('base64')});
  const r=await materializeC82ParallelCarriers({relay,manifest:f.manifest,
   carriers:[f.verified],parallelism:3,carrierTimeoutMs:1500});
  assert.equal(r.status,'C82_C77_BYTES_MATERIALIZED_IN_NODE',JSON.stringify(r));
  assert.equal(r.all_bytes_reopened,true);
  relay.close();relay=null;
  relay=new C78HostRelay({selection:f.selection,sourceHead:f.build.head,
   expectedManifestSha256:f.build.bundle_manifest_sha256,
   manifestBase64:f.manifestBytes.toString('base64')});
  const mutated=structuredClone(f.manifest);
  mutated.files.find(x=>x.path==='src/state.mjs').generated_derivative=true;
  const bad=await materializeC82ParallelCarriers({relay,manifest:mutated,
   carriers:[f.verified],parallelism:3,carrierTimeoutMs:1500});
  assert.equal(bad.status,'C82_CARRIER_STOP');
  assert.equal(relay.receivedCount,0);
 }finally{relay?.close();fs.rmSync(f.dir,{recursive:true,force:true});}
});
test('C84.1 invalid Git tree proof and wrong current input stop rather than fabricate voice',async()=>{
 const f=prepare();
 try{
  const invalid=structuredClone(args(f,'Confronta due alternative e indica una prova osservabile.'));
  invalid.sourceProof.treeObjects[0].sha1='0'.repeat(40);
  const a=await executeC84ExperimentalTurn(invalid);
  assert.equal(a.status,'C84_STOP');
  assert.equal(a.active,false);
  const b=await executeC84ExperimentalTurn(args(f,'x'.repeat(601)));
  assert.equal(b.status,'C84_STOP');
  assert.equal(b.first_unclosed_edge,'BOUNDED_NONSENSITIVE_CURRENT_HUMAN_INPUT');
 }finally{fs.rmSync(f.dir,{recursive:true,force:true});}
});
