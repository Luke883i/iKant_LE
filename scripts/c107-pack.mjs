import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const gitBlob=b=>crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+b.length+'\0'),b])).digest('hex');
const S='ikant-le-c107-minimal-package/v1';
export const C107_FILES=Object.freeze([
 'README.md','TERMS.md','contracts/c72-unified-mode-admission.json',
 'contracts/cognitive-kernel.json','contracts/host-shell.json','contracts/psyche-kernel.json',
 'contracts/self-world-kernel.json','host/c69-capability-first-preview.mjs',
 'host/c72-unified-mode-admission.mjs','host/c100-cohost-experimental.mjs',
 'host/c87-durable-ledger.mjs','host/c107-experimental-turn.mjs',
 'src/c70-experimental-compute-preview.mjs','src/cognition-core.mjs',
 'src/c82-experimental-answer.mjs','src/psyche.mjs','src/state.mjs',
 'src/self-world-state.mjs','src/runtime-dispatch.mjs','src/contract.mjs',
 'src/cognition-surface.mjs','src/c83-semantic-router.mjs',
 'src/self-world-core.mjs','src/semantic-morphogenesis.mjs','src/self-world.mjs',
 'scripts/c107-turn-cli.mjs','scripts/c107-console.mjs'
]);
const stop=e=>({schema:S,status:'C107_PACKAGE_STOP',first_unclosed_edge:e,active:false,native_delivery_attested:false});
const safe=p=>typeof p==='string'&&/^(?:README\.md|TERMS\.md|(?:host|src|scripts|contracts)\/[a-zA-Z0-9_.\/-]+)$/.test(p)&&p.split('/').every(v=>v&&v!=='.'&&v!=='..');
export function buildC107Package({root,expectedHead}={}){
 try{
  if(!path.isAbsolute(root)||!/^[a-f0-9]{40}$/.test(expectedHead||''))return stop('ABSOLUTE_ROOT_AND_PINNED_HEAD');
  const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
  if(head!==expectedHead)return stop('SOURCE_EPOCH_DRIFT');
  const files=[];
  for(const p of C107_FILES){
   if(!safe(p))return stop('INVALID_PATH');
   const b=fs.readFileSync(path.join(root,p));
   const git=execFileSync('git',['rev-parse','HEAD:'+p],{cwd:root,encoding:'utf8'}).trim();
   if(gitBlob(b)!==git)return stop('WORKTREE_VERSUS_GIT_BLOB_DRIFT');
   files.push({path:p,bytes:b.length,sha256:sha(b),git_blob_sha1:git,content_base64:b.toString('base64')});
  }
  const payload=Buffer.from(JSON.stringify({schema:S,source_head:head,files,active:false,authority:0})+'\n');
  return {schema:S,status:'C107_PACKAGE_BUILT_NOT_TRANSPORTED',payload,
   sha256:sha(payload),file_count:files.length,source_bytes:files.reduce((n,x)=>n+x.bytes,0),
   transport_bytes:payload.length,source_origin_attested:false,active:false};
 }catch{return stop('ORIGINAL_GIT_SOURCE_GRAPH_MISSING');}
}
export function stageC107Package({payload,expectedSha256,expectedHead,privateParent}={}){
 let out=null;
 try{
  if(!Buffer.isBuffer(payload)||sha(payload)!==expectedSha256||!path.isAbsolute(privateParent))
   return stop('PACKAGE_BYTE_DIGEST_OR_PARENT');
  const m=JSON.parse(payload.toString('utf8'));
  if(m.schema!==S||m.source_head!==expectedHead||m.active!==false||m.authority!==0||
   m.files.length!==C107_FILES.length||new Set(m.files.map(x=>x.path)).size!==C107_FILES.length||
   C107_FILES.some(x=>!m.files.some(y=>y.path===x)))return stop('PACKAGE_MANIFEST_DRIFT');
  out=fs.mkdtempSync(path.join(privateParent,'ikant-c107-'));fs.chmodSync(out,0o700);
  for(const entry of m.files){
   if(!safe(entry.path)||typeof entry.content_base64!=='string')throw Error('PATH');
   const data=Buffer.from(entry.content_base64,'base64');
   if(data.toString('base64')!==entry.content_base64||data.length!==entry.bytes||
    sha(data)!==entry.sha256||gitBlob(data)!==entry.git_blob_sha1)throw Error('INTEGRITY');
   const target=path.resolve(out,entry.path);if(!target.startsWith(out+path.sep))throw Error('ESCAPE');
   fs.mkdirSync(path.dirname(target),{recursive:true,mode:0o700});
   const fd=fs.openSync(target,'wx',0o600);
   try{fs.writeSync(fd,data);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
   if(!fs.readFileSync(target).equals(data))throw Error('REOPEN');
  }
  return {schema:S,status:'C107_PACKAGE_REOPENED_NOT_EXECUTED',install_root:out,
   source_head:expectedHead,source_files:m.files.length,
   source_bytes:m.files.reduce((n,x)=>n+x.bytes,0),
   source_origin_attested:false,native_delivery_attested:false,active:false};
 }catch{if(out)fs.rmSync(out,{recursive:true,force:true});return stop('REOPEN_OR_MANIFEST_INTEGRITY');}
}
