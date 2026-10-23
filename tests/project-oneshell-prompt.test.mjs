import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync,execFileSync} from 'node:child_process';
const git=(...a)=>execFileSync('git',a,{encoding:'utf8'}).trim();
const run=(mode,head,tree,out,env={})=>spawnSync(process.execPath,['scripts/build-project-oneshell-prompt.mjs',
 '--mode',mode,'--head',head,'--tree',tree,'--out',out],{encoding:'utf8',env:{...process.env,...env}});
test('one HEAD gives byte identical generated prompt and receipts; no stale or mutable output',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-head-prompt-'));
 try{
  const head=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');
  const a=path.join(dir,'a'),b=path.join(dir,'b');
  const r=run('candidate',head,tree,a),s=run('candidate',head,tree,b);
  assert.equal(r.status,0,r.stderr);assert.equal(s.status,0,s.stderr);
  for(const p of ['PROMPT_INNESCO.txt','SOURCE_LOCK.json','RECEIPT.json'])
   assert.deepEqual(fs.readFileSync(path.join(a,p)),fs.readFileSync(path.join(b,p)));
  const p=fs.readFileSync(path.join(a,'PROMPT_INNESCO.txt'),'utf8');
  const receipt=JSON.parse(fs.readFileSync(path.join(a,'RECEIPT.json')));
  assert(p.includes(head)&&p.includes(tree)&&p.includes('OneShell'));
  assert.equal(receipt.product_release,'PRODUCT_NO_GO');assert.equal(receipt.live_main_verified,false);
  assert.notEqual(run('candidate','f'.repeat(40),tree,path.join(dir,'wrong-head')).status,0);
  assert.notEqual(run('candidate',head,'f'.repeat(40),path.join(dir,'wrong-tree')).status,0);
  assert.notEqual(run('candidate',head,tree,a).status,0);
  assert.notEqual(run('canonical',head,tree,path.join(dir,'not-main')).status,0);
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
});
