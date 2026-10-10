import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {executeC98FileBackedC84} from '../host/c98-file-backed-c84-entry.mjs';
import {validateC94C77Archive} from '../host/c94-zip-c77.mjs';
const HEAD='66f074b34f34455b3c4188703d83ad71316baa06';
const ZIP=fs.readFileSync(new URL('./fixtures/c77-historical-head-66f074b3.zip',import.meta.url));
const p=validateC94C77Archive(ZIP,{sourceHead:HEAD});
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const selection={selected_mode:'EXPERIMENTAL',status:'EXPERIMENTAL_SELECTED_NOT_RUNNING'};
test('host-file-backed C98 entry wired to C84, denies absent exact git proof before owner voice',async()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'c98-e2e-'));
 try{
  const file=path.join(dir,'c77.zip');fs.writeFileSync(file,ZIP);
  const r=await executeC98FileBackedC84({allowedRoot:dir,archivePath:file,
    archiveSha256:sha(ZIP),sourceHead:HEAD,manifestSha256:p.manifest_sha256,
    manifest:p.manifest,manifestBase64:p.content.get('c77-manifest.json').toString('base64'),
    selection,humanInput:'Prova host file in Node',sourceProof:null});
  assert.equal(r.status,'C98_HOST_FILE_STOP');
  assert.equal(r.first_unclosed_edge,'C81_VERIFIED_SOURCE_PROOF_REQUIRED');
  assert.equal(r.owner_executed,false);assert.equal(r.native_delivery_attested,false);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
