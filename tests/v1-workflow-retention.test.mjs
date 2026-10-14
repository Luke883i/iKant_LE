import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const contract=JSON.parse(fs.readFileSync(path.join(root,'contracts/v1-workflow-retention.json'),'utf8'));
test('retain every baseline workflow unless a new reviewed migration contract supersedes it',()=>{
 assert.equal(contract.schema,'ikant-le-v1-workflow-retention/v1');
 assert.equal(contract.authority,0);
 assert.equal(contract.policy,'NO_SILENT_WORKFLOW_DELETION');
 assert.equal(contract.require_explicit_review_before_removal,true);
 assert.equal(contract.paths.length,contract.baseline_count);
 assert.equal(new Set(contract.paths).size,contract.paths.length);
 assert.ok(contract.baseline_count>=80);
 for(const p of contract.paths){
  assert.match(p,/^\.github\/workflows\/[A-Za-z0-9_.-]+\.ya?ml$/);
  const st=fs.lstatSync(path.join(root,p));
  assert.equal(st.isFile()&&!st.isSymbolicLink(),true,'missing baseline workflow: '+p);
 }
});
