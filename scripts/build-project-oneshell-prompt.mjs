#!/usr/bin/env node
/** One exact Git HEAD -> immutable Project prompt artifacts; not an installer. */
import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const H40=/^[a-f0-9]{40}$/,sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...a)=>execFileSync('git',a,{encoding:'utf8',timeout:15000}).trim();
const original=p=>execFileSync('git',['show','HEAD:'+p],{timeout:15000,maxBuffer:5_000_000});
const blob=b=>createHash('sha1').update(Buffer.from('blob '+b.length+'\0')).update(b).digest('hex');
const arg=f=>{const n=process.argv.indexOf(f);return n<0?null:process.argv[n+1]};
const mode=arg('--mode'),head=arg('--head'),tree=arg('--tree'),out=arg('--out');
if(process.argv.length!==10||!['candidate','canonical','portable'].includes(mode)||!H40.test(head||'')||
 !H40.test(tree||'')||typeof out!=='string')throw Error('PROMPT_ARGUMENTS_INVALID');
if(git('rev-parse','HEAD')!==head||git('rev-parse','HEAD^{tree}')!==tree)throw Error('STOP_SOURCE_LOCK_STALE');
// Only immutable Git HEAD blobs are read below; qualification outputs or dirty worktree\n// cannot change the generator input. Blob/readback locks are enforced per original.
const matrix=JSON.parse(original('contracts/project-prompt-generation.json'));
const route=JSON.parse(original('BOOTSTRAP.json')).project_session;
if(matrix.schema!=='ikant-le-project-prompt-generation/v1'||
 matrix.source_prompt!==route.prompt||matrix.runtime_owner!==route.runtime_entry||
 matrix.oneshell_contract!==route.oneshell_contract||
 route.local_bundle_required!==false||route.manual_edu_handoff?.post_mode_only!==true||
 route.manual_edu_handoff?.canonical_active_authority!==false)throw Error('PROMPT_ROUTE_DRIFT');
const CRITICAL=['contracts/project-oneshell-compact-continuity.json',
 'contracts/project-oneshell-visual-v2.json'];
if(JSON.stringify(matrix.head_critical_contracts)!==JSON.stringify(CRITICAL)||
 matrix.runtime_head_preflight!=='AFTER_ORIGINAL_C72_MODE_GATE_BEFORE_EDU_MATERIALIZATION'||
 matrix.orientation_read_scope!=='ONLY_HEAD_AND_FIVE_PINNED_DOCUMENTS_PREACCEPT_NO_TREE_OR_BLOBS'||
 matrix.installed_prompt_equality!=='ONLY_IF_ACTUAL_PROJECT_PROMPT_BYTES_ACCESSIBLE_ELSE_UNKNOWN'||
 matrix.explicit_repin!=='FRESH_C72_REQUIRED_NO_RECEIPT_OR_C135_TRANSFER'||
 matrix.host_engineering_route!=='EXPLICIT_HUMAN_REQUEST_INDEPENDENT_NO_C72_NO_IKANT_STATE_TRANSFER'||
 matrix.orientation_witness!=='FIVE_BLOB_SHA1_CAPTURED_IN_FIRST_TURN_BEFORE_TERMS_FREEZE'||
 matrix.postaccept_auto_execution!=='AUTO_MUST_BE_EXECUTED_AND_OBSERVED_NOT_TERMINAL_STOP'||
 matrix.postaccept_executor!=='host/project-c72-host-recovery.mjs#executeC72PostAcceptRecovery'||
 matrix.bridge_unbound!=='C72_SOURCE_BRIDGE_UNBOUND_NOT_PROVEN_UNAVAILABLE')
 throw Error('PROMPT_HEAD_GUARD_MATRIX_INVALID');
const members=[...new Set([...matrix.required_orientation,matrix.source_prompt,
 matrix.oneshell_contract,...CRITICAL,'contracts/project-prompt-generation.json'])];
if(members.length!==10)throw Error('PROMPT_ANCHOR_MATRIX_INVALID');
const refs={};
for(const p of members){
 if(!/^[A-Za-z0-9._/-]+$/.test(p)||p.split('/').some(s=>s===''||s==='..'))
  throw Error('PROMPT_MEMBER_PATH_INVALID');
 const b=original(p),id=git('rev-parse','HEAD:'+p);
 if(blob(b)!==id)throw Error('PROMPT_SOURCE_BLOB_DRIFT:'+p);
 refs[p]={git_blob_sha1:id,sha256:sha(b),bytes:b.length};
}
const source=original(matrix.source_prompt).toString('utf8');
if(matrix.project_instruction_limit_chars!==8000||
 matrix.project_instruction_limit_utf8_bytes!==8000||
 [...source].length>matrix.project_instruction_limit_chars||
 Buffer.byteLength(source,'utf8')>matrix.project_instruction_limit_utf8_bytes)
 throw Error('PROJECT_INSTRUCTIONS_EXCEED_8000');
for(const word of ['OneShell','NO_VOICE','I ACCEPT','CANONICAL','EDU','P1','project-repo-loader',
 'STOP_PROMPT_HEAD_PREFLIGHT','STOP_PROJECT_PROMPT_STALE_INSTALLATION',
 'INSTALLED_PROMPT_EQUIVALENCE_UNKNOWN','EXPLICIT_REPIN_REQUIRES_FRESH_C72',
 'project/session-chat/PROMPT.txt',
 'RIENTRO POST-ACCEPT P0','host/project-c72-host-recovery.mjs',
 'host/project-c72-postaccept-reentry.mjs','host/project-oneshell-emission.mjs','HOST_ENGINEERING.','mostra i cinque SHA in PROVA',
 'executeC72PostAcceptRecovery','AUTO significa eseguire e osservare',
 'C72_SOURCE_BRIDGE_UNBOUND'])
 if(!source.includes(word))throw Error('PROMPT_REQUIRED_SEMANTIC_ANCHOR_MISSING:'+word);
async function liveHead(){
 return new Promise((resolve,reject)=>{
  const req=https.get('https://api.github.com/repos/Luke883i/iKant_LE/git/ref/heads/main',
   {headers:{'User-Agent':'ikant-head-prompt-build','Accept':'application/vnd.github+json'},timeout:12000},res=>{
    if(res.statusCode!==200){res.resume();reject(Error('LIVE_MAIN_UNAVAILABLE'));return}
    let b='';res.setEncoding('utf8');res.on('data',s=>{b+=s;if(b.length>64000)req.destroy(Error('MAIN_RESPONSE_TOO_LARGE'))});
    res.on('end',()=>{try{resolve(JSON.parse(b).object.sha)}catch{reject(Error('LIVE_MAIN_INVALID'))}});
   });req.on('timeout',()=>req.destroy(Error('LIVE_MAIN_TIMEOUT')));req.on('error',reject);
 });
}
let liveMainVerified=false;
if(mode==='canonical'){
 if(process.env.GITHUB_REF!=='refs/heads/main'||process.env.GITHUB_EVENT_NAME!=='push')
  throw Error('CANONICAL_MAIN_PUSH_REQUIRED');
 if((await liveHead())!==head)throw Error('STOP_SOURCE_LOCK_STALE');
 liveMainVerified=true;
}
const prompt=mode==='portable'?Buffer.from(source,'utf8'):Buffer.from('iKant · OneShell | HEAD='+head+' | TREE='+tree+'\n'+
 'Before operations compare live main to HEAD. Drift => STOP_SOURCE_LOCK_STALE; never auto-repin.\n'+source);
const lock={schema:'ikant-le-project-prompt-source-lock/v1',source_head:mode==='portable'?null:head,source_tree:mode==='portable'?null:tree,
 generated_from_head:head,generated_from_tree:tree,session_source_lock:'RESOLVE_LIVE_MAIN_ON_FIRST_PROJECT_CHAT_MESSAGE',
 mode,live_main_verified:liveMainVerified,portable_head_agnostic:mode==='portable',source_prompt:matrix.source_prompt,
 prompt_source_blob:refs[matrix.source_prompt].git_blob_sha1,
 critical_contract_blobs:Object.fromEntries(CRITICAL.map(p=>[p,refs[p].git_blob_sha1])),
 runtime_preflight_required:true,installed_prompt_equivalence_attested:false,
 versioned_c72_receipt_transfer_allowed:false,bundle_required:false,
 native_ui_attested:false,installed:false,active:false};
const receipt={schema:'ikant-le-project-prompt-generation-receipt/v1',head,tree,mode,
 live_main_verified:liveMainVerified,source_blobs:refs,prompt_sha256:sha(prompt),
 prompt_bytes:prompt.length,authority:0,active:false,product_release:'PRODUCT_NO_GO'};
const artifacts={'PROMPT_INNESCO.txt':prompt,
 'SOURCE_LOCK.json':Buffer.from(JSON.stringify(lock,null,2)+'\n'),
 'RECEIPT.json':Buffer.from(JSON.stringify(receipt,null,2)+'\n')};
const dest=path.resolve(out);
if(fs.existsSync(dest)||!fs.existsSync(path.dirname(dest)))throw Error('FRESH_OUTPUT_REQUIRED');
fs.mkdirSync(dest,{mode:0o700});
for(const [name,b] of Object.entries(artifacts)){
 const p=path.join(dest,name);fs.writeFileSync(p,b,{flag:'wx',mode:0o600});
 if(!fs.readFileSync(p).equals(b))throw Error('PROMPT_READBACK_FAILED');
}
console.log(JSON.stringify({status:'PROMPT_MATERIALIZED',mode,head,tree,sha256:receipt.prompt_sha256,
 live_main_verified:liveMainVerified,files:Object.keys(artifacts),product_release:'PRODUCT_NO_GO'}));
