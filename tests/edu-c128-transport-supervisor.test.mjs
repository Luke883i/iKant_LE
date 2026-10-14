import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';import os from 'node:os';import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {PIN} from '../host/c107-carrier-consumer.mjs';
import {C124_OVERLAY_GIT_BLOBS} from '../host/c124-source-overlay.mjs';
import {buildC127SourceCache,inspectC127SourceCache,loadC127SourceCache,resolveC127Transport} from '../host/edu-c127-source-transport.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const produce=()=>buildC127SourceCache({carrierBytes:fs.readFileSync(path.join(root,PIN.name)),
 c124OverlayBytes:Object.fromEntries(Object.keys(C124_OVERLAY_GIT_BLOBS).map(p=>[p,fs.readFileSync(path.join(root,p))]))});
test('canonical cache is byte-reproducible; no hidden duplicate JSON field is accepted',()=>{
 const r=produce();assert.equal(r.ok,true,r.first_edge);assert.equal(inspectC127SourceCache(r.bytes).ok,true);
 const s=r.bytes.toString('utf8');
 for(const v of [s+' ',s.replace('"schema":','"duplicate":7,"schema":'),s.replace('"schema":','"schema":"fake","schema":'),s.replace(',"source_epoch"',', "source_epoch"')]){
  const x=inspectC127SourceCache(Buffer.from(v,'utf8'));
  assert.equal(x.ok,false,v.slice(0,36));assert.equal(x.first_edge,'C128_NONCANONICAL_CACHE_ENVELOPE');
 }
});
test('independent NOFOLLOW inode-bound physical readback and symlink exclusion',()=>{
 const c=produce(),dir=fs.mkdtempSync(path.join(os.tmpdir(),'c128-cache-'));
 try{
  const exact=path.join(dir,'cache.json'),alias=path.join(dir,'alias.json');
  fs.writeFileSync(exact,c.bytes);fs.symlinkSync(exact,alias);
  assert.equal(loadC127SourceCache(exact).ok,true);
  assert.equal(loadC127SourceCache(exact).readback_inode_bound,true);
  assert.equal(loadC127SourceCache(alias).ok,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
test('bridge getters and extra hidden properties cannot execute before validation',async()=>{
 let touched=0;
 const obj={id:'bridge1'};
 Object.defineProperty(obj,'fetch',{enumerable:true,get(){touched++;return()=>Buffer.from('bad')}});
 const r=await resolveC127Transport({admitted:true,bridges:[obj]});
 assert.equal(r.ok,false);assert.equal(r.first_edge,'C127_UNTRUSTED_BRIDGE');assert.equal(touched,0);
});
test('duplicate callback with different ID is not evidence of transport independence',async()=>{
 let calls=0;const same=()=>{calls++;return Buffer.from('invalid')};
 const x=await resolveC127Transport({admitted:true,bridges:[{id:'bridge1',fetch:same},{id:'bridge2',fetch:same}]});
 assert.equal(x.ok,false);assert.equal(x.first_edge,'C128_SAME_CALLBACK_NOT_INDEPENDENT');
 assert.equal(calls,1);assert.equal(x.attempts,1);assert.equal(x.next,'STOP');
});
test('uncooperative never-ending bridge expires; no parallel retry and NO automatic manual handoff',async()=>{
 let calls=0,signal=null;
 const r=await resolveC127Transport({admitted:true,timeoutMs:100,bridges:[
  {id:'slow',fetch:({signal:s})=>{signal=s;calls++;return new Promise(()=>{})}},
  {id:'alternative',fetch:()=>{calls++;return produce().bytes}}
 ]});
 assert.equal(r.ok,false);assert.equal(r.first_edge,'C128_TRANSPORT_CALLBACK_UNSETTLED');
 assert.equal(r.next,'STOP');assert.equal(r.attempts,1);assert.equal(calls,1);assert.equal(signal.aborted,true);
 assert.equal(r.events[0].result,'ABORT_REQUESTED_OUTCOME_UNKNOWN');
});
test('actually rejected callback permits a distinct, successful next transport',async()=>{
 let calls=0;
 const a=await resolveC127Transport({admitted:true,timeoutMs:1000,bridges:[
  {id:'notavailable',fetch:async()=>{calls++;throw Error('unavailable')}},
  {id:'available',fetch:async()=>{calls++;return produce().bytes}}
 ]});
 assert.equal(a.ok,true);assert.equal(calls,2);assert.equal(a.attempts,2);
 assert.equal(a.next,'RUN_EXISTING_PR119');assert.equal(a.independent_bridge_provider_attested,false);
});
test('three completed failed methods lead to manual exact source handoff as last resort',async()=>{
 let calls=0;const x=await resolveC127Transport({admitted:true,timeoutMs:1000,
  bridges:[1,2,3,4].map(i=>({id:'bridge'+i,fetch:()=>{calls++;return Buffer.from('invalid')}}))});
 assert.equal(x.ok,false);assert.equal(calls,3);assert.equal(x.attempts,3);
 assert.equal(x.next,'MANUAL_EXACT_SOURCE_AND_OVERLAY_HANDOFF');
 assert.equal(x.first_edge,'C127_MAXIMUM_REAL_MACHINE_ATTEMPTS_EXHAUSTED');
});
test('time bounds fail closed; preadmission makes no host callback',async()=>{
 let calls=0;const b=[{id:'only',fetch:()=>{calls++;return Buffer.from('bad')}}];
 assert.equal((await resolveC127Transport({admitted:false,bridges:b})).ok,false);
 assert.equal((await resolveC127Transport({admitted:true,bridges:b,timeoutMs:Infinity})).ok,false);
 assert.equal(calls,0);
});
