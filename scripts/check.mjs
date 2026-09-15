import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { ROOT, readContract, readTerms, validateSurfaceA, fallbackSurfaceA } from '../src/contract.mjs';
import { initialState } from '../src/state.mjs';
import { transitionPure } from '../src/runtime.mjs';
import { buildBacklogModel, validateBacklogModel } from '../src/backlog.mjs';
import { buildBacklogDocx } from '../src/docx.mjs';

const contract=readContract(); const terms=readTerms();
assert.equal(Number(process.versions.node.split('.')[0])>=20,true);
assert.equal(contract.runtime.dependencies,0);
assert.equal(contract.runtime.single_writer,true);
assert.equal(contract.authority.model,0);
assert.equal(contract.authority.external_action_implemented,false);
assert.deepEqual(contract.surface_a,{min_words:50,max_words:500,natural_language_only:true,first:true});
assert.equal(contract.surface_b.format,'docx');
assert.equal(contract.surface_b.public_chain_of_thought,false);
assert.equal(validateSurfaceA(fallbackSurfaceA('check')).ok,true);

const statuses=['DISCOVERED','ACCEPTED','PROBED','ACTIVE','EXITED'];
const kinds=['ACCEPT','PROBE','INITIALIZE','EXIT','TURN'];
let forbidden=0, enumerated=0;
for (const status of statuses) for (const kind of kinds) {
  enumerated++;
  const s={...initialState(),status,accepted:['ACCEPTED','PROBED','ACTIVE'].includes(status),probed:['PROBED','ACTIVE'].includes(status),initialized:status==='ACTIVE',terms_digest:['ACCEPTED','PROBED','ACTIVE'].includes(status)?terms.digest:null};
  const r=transitionPure(s,kind,terms.digest,true);
  if (kind==='TURN' && status!=='ACTIVE' && r.terminal==='TURN') forbidden++;
  if (kind==='EXIT' && status!=='ACTIVE' && r.terminal==='EXITED') forbidden++;
  if (kind==='INITIALIZE' && !s.probed && r.terminal==='ACTIVE') forbidden++;
}
assert.equal(forbidden,0);

const model=buildBacklogModel({cycle:1,input:'check',surfaceA:fallbackSurfaceA('check'),state:{...initialState(),status:'ACTIVE'}});
assert.equal(validateBacklogModel(model),true);
const docx=buildBacklogDocx(model); assert.equal(docx.readUInt32LE(0),0x04034b50);

for (const rel of ['README.md','AGENTS.md','TERMS.md','contracts/ikant-le.json','docs/GOVERNANCE.md','docs/RESEARCH_LEDGER.md']) assert.ok(fs.existsSync(path.join(ROOT,rel)),rel);
console.log(JSON.stringify({status:'PASS',node:process.versions.node,exact_state_pairs:enumerated,forbidden_edges:forbidden,docx_bytes:docx.length,terms_digest:terms.digest}));
