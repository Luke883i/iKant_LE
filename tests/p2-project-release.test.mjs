import test from 'node:test';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';
import {mkdtempSync,readFileSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
const root=new URL('..',import.meta.url).pathname;
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const run=(args)=>execFileSync('python3',['scripts/p2-build-oneshell-release.py',...args],{cwd:root,encoding:'utf8'});
test('P2 exact source double-build and stale commit denied',()=>{
 const h=git('rev-parse','HEAD'),t=git('rev-parse','HEAD^{tree}'),dir=mkdtempSync(join(tmpdir(),'ikant-p2-'));
 try{const a=join(dir,'a'),b=join(dir,'b'),opts=['--expected-commit',h,'--expected-tree',t];
  const x=JSON.parse(run(['build','--out',a,...opts]));const y=JSON.parse(run(['build','--out',b,...opts]));
  assert.equal(x.ok,true);assert.equal(x.zip_sha256,y.zip_sha256);
  assert.equal(x.plugin_installed,false);assert.equal(x.project_applied,false);
  assert.throws(()=>run(['verify','--out',a,'--expected-commit','0'.repeat(40),'--expected-tree',t]));
  assert.throws(()=>run(['build','--out',a,'--expected-commit',h,'--expected-tree','1'.repeat(40)]));
 }finally{rmSync(dir,{recursive:true,force:true});}
});
