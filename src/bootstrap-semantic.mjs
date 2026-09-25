import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const WORKSPACE=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HEX40=/^[a-f0-9]{40}$/;
const HEX64=/^[a-f0-9]{64}$/;
export const CHAT_BOOTSTRAP_DEADLINE_MS=120000;
const sha256=b=>crypto.createHash('sha256').update(b).digest('hex');
const FLEX_TRANSFER_SCHEMA='ikant-le-source-bound-transfer/v2';
const FLEX_TRANSPORTS=new Set(['GITHUB_API_BASE64','GITHUB_GIT_BLOB_API','PINNED_PERMALINK','PINNED_GITHUB_ZIP','HOST_FILE_BRIDGE','WARM_CACHE_EXACT']);
function expectedFlexObjects(d){const rows=[];if(d?.loader)rows.push({path:d.loader.path,blob_sha1:d.loader.blob_sha1});for(const s of d?.shards||[])rows.push({path:s.path,blob_sha1:s.blob_sha1});return rows;}
function validateFlexibleTransfer(receipt,{sourceHead,runtimeRootSha256,descriptor,maxReads=40,maxRounds=1,deadlineMs=CHAT_BOOTSTRAP_DEADLINE_MS}={}){const e=[];if(!receipt||receipt.schema!==FLEX_TRANSFER_SCHEMA)e.push('schema');if(receipt?.authority!==0||receipt?.transport_authority!==0)e.push('authority');if(receipt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('source_head');if(receipt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('runtime_root');if(!FLEX_TRANSPORTS.has(receipt?.mode))e.push('mode');if(receipt?.identity_authority!=='CONTENT_ADDRESSING'||receipt?.exact_ref!==true||receipt?.bridge_observed!==true||receipt?.model_mediated_bytes!==false||receipt?.complete!==true||receipt?.bytes_exact!==true)e.push('identity_chain');if(!Number.isInteger(receipt?.remote_reads)||receipt.remote_reads<0||receipt.remote_reads>maxReads)e.push('remote_reads');if(!Number.isInteger(receipt?.remote_rounds)||receipt.remote_rounds<0||receipt.remote_rounds>maxRounds)e.push('remote_rounds');const elapsed=receipt?.elapsed_ms;if(!Number.isFinite(elapsed)||elapsed<0||elapsed>deadlineMs)e.push('elapsed');const expected=expectedFlexObjects(descriptor),exp=new Map(expected.map(x=>[x.path,x]));if(!descriptor||descriptor.schema!=='ikant-le-runtime-root/v1'||!descriptor.loader||!Array.isArray(descriptor.shards)||expected.length<2)e.push('descriptor');const rows=receipt?.remote_objects;if(!Array.isArray(rows)||rows.length!==exp.size)e.push('remote_objects');else{const seen=new Set();for(const r of rows){const x=exp.get(r?.path);if(!x||seen.has(r.path)){e.push('object_set');continue;}seen.add(r.path);if(r.blob_sha1!==x.blob_sha1||!HEX64.test(String(r.sha256||''))||!Number.isInteger(r.bytes)||r.bytes<1)e.push('object_identity');}}if(['PINNED_PERMALINK','PINNED_GITHUB_ZIP'].includes(receipt?.mode)&&receipt?.locator_pinned!==true)e.push('locator_pin');if(receipt?.mode==='PINNED_GITHUB_ZIP'){const a=receipt?.archive_policy;if(!a||a.selective_extract!==true||a.path_safe!==true||a.special_entries_rejected!==true||a.duplicates_rejected!==true||a.encrypted_entries_rejected!==true)e.push('archive_policy');}if(receipt?.mode==='HOST_FILE_BRIDGE'&&receipt?.host_readback_verified!==true)e.push('host_readback');if(receipt?.mode==='WARM_CACHE_EXACT'&&receipt?.cache_reopen_verified!==true)e.push('cache_reopen');if(!HEX64.test(String(receipt?.receipt_sha256||''))||digestWithout(receipt)!==receipt.receipt_sha256)e.push('receipt_digest');return e.length?bad(e,e.includes('elapsed')?'BOOTSTRAP_DEADLINE_EXCEEDED':'HOST_INCOMPATIBLE'):{ok:true,receipt_sha256:receipt.receipt_sha256,elapsed_ms:elapsed,mode:receipt.mode};}

function digestWithout(value,field='receipt_sha256'){const copy=structuredClone(value||{});delete copy[field];return sha256(Buffer.from(JSON.stringify(copy)));}
function bad(errors,code='HOST_INCOMPATIBLE'){return{ok:false,errors:[...new Set(errors)],terminal:code};}

export function validateSourceBoundTransfer(receipt,{sourceHead,runtimeRootSha256,runtimeRootDescriptor=null,maxReads=8,maxRounds=1,flexMaxReads=40,flexMaxRounds=1,deadlineMs=CHAT_BOOTSTRAP_DEADLINE_MS}={}){\n if(receipt?.schema===FLEX_TRANSFER_SCHEMA)return validateFlexibleTransfer(receipt,{sourceHead,runtimeRootSha256,descriptor:runtimeRootDescriptor,maxReads:flexMaxReads,maxRounds:flexMaxRounds,deadlineMs});
 const e=[];if(!receipt||receipt.schema!=='ikant-le-source-bound-transfer/v1')e.push('schema');
 if(receipt?.authority!==0)e.push('authority');if(receipt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('source_head');
 if(receipt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('runtime_root');
 if(!['COLD_API','WARM_CACHE_EXACT'].includes(receipt?.mode))e.push('mode');if(receipt?.transport!=='GITHUB_API')e.push('transport');
 if(receipt?.exact_ref!==true)e.push('exact_ref');if(receipt?.bridge_observed!==true)e.push('bridge_observed');if(receipt?.model_mediated_bytes!==false)e.push('model_mediated_bytes');if(receipt?.fallback_used!==false)e.push('fallback_used');
 if(receipt?.complete!==true||receipt?.bytes_exact!==true)e.push('content');
 const rounds=receipt?.remote_rounds,reads=receipt?.remote_reads;if(!Number.isInteger(rounds)||rounds<0||rounds>maxRounds)e.push('remote_rounds');if(!Number.isInteger(reads)||reads<0||reads>maxReads)e.push('remote_reads');
 if(receipt?.mode==='COLD_API'&&(rounds!==1||reads<1))e.push('cold_transfer');if(receipt?.mode==='WARM_CACHE_EXACT'&&(rounds!==0||reads!==0||receipt?.cache_reopen_verified!==true))e.push('warm_transfer');
 const elapsed=receipt?.elapsed_ms;if(!Number.isFinite(elapsed)||elapsed<0)e.push('elapsed');if(Number.isFinite(elapsed)&&elapsed>deadlineMs)e.push('deadline');
 if(!HEX64.test(String(receipt?.receipt_sha256||''))||digestWithout(receipt)!==receipt?.receipt_sha256)e.push('receipt_digest');
 return e.length?bad(e,e.includes('deadline')?'BOOTSTRAP_DEADLINE_EXCEEDED':'HOST_INCOMPATIBLE'):{ok:true,receipt_sha256:receipt.receipt_sha256,elapsed_ms:elapsed,mode:receipt.mode};
}

export function validateLocalMaterializationReceipt(receipt,{sourceHead,runtimeRootSha256,loaderBlobSha1,transferReceiptSha256}={}){
 const e=[];if(!receipt||receipt.schema!=='ikant-le-runtime-root-materialization/v1')e.push('schema');if(receipt?.authority!==0)e.push('authority');
 if(receipt?.source_head!==sourceHead||!HEX40.test(String(sourceHead||'')))e.push('source_head');if(receipt?.runtime_root_sha256!==runtimeRootSha256||!HEX64.test(String(runtimeRootSha256||'')))e.push('runtime_root');
 if(receipt?.loader_blob_sha1!==loaderBlobSha1||!HEX40.test(String(loaderBlobSha1||'')))e.push('loader');if(receipt?.transfer_receipt_sha256!==transferReceiptSha256||!HEX64.test(String(transferReceiptSha256||'')))e.push('transfer_binding');
 if(receipt?.atomic_publish!==true)e.push('atomic_publish');if(receipt?.reopen_verified!==true)e.push('reopen');if(!Number.isInteger(receipt?.member_count)||receipt.member_count<1)e.push('member_count');if(!Number.isInteger(receipt?.source_bytes)||receipt.source_bytes<1)e.push('source_bytes');
 if(!HEX64.test(String(receipt?.receipt_sha256||''))||digestWithout(receipt)!==receipt?.receipt_sha256)e.push('receipt_digest');
 return e.length?bad(e):{ok:true,receipt_sha256:receipt.receipt_sha256};
}

export function readLocalMaterializationReceipt(workspace=WORKSPACE){try{return JSON.parse(fs.readFileSync(path.join(workspace,'.ikant','materialization.json'),'utf8'));}catch{return null;}}

export function validateChatBootstrapEvidence(evidence,{sourceHead,runtimeRootSha256,loaderBlobSha1,localMaterializationReceipt,runtimeRootDescriptor=null,maxReads=8,maxRounds=1,flexMaxReads=40,flexMaxRounds=1,deadlineMs=CHAT_BOOTSTRAP_DEADLINE_MS}={}){
 const e=[];if(!evidence||evidence.schema!=='ikant-le-chat-bootstrap-evidence/v1')e.push('schema');if(evidence?.authority!==0)e.push('authority');
 if(evidence?.source_head!==sourceHead)e.push('source_head');if(evidence?.runtime_root_sha256!==runtimeRootSha256)e.push('runtime_root');if(evidence?.deadline_origin!=='I_ACCEPT')e.push('deadline_origin');if(evidence?.clock!=='MONOTONIC')e.push('clock');
 const before=evidence?.elapsed_before_runtime_ms;if(!Number.isFinite(before)||before<0)e.push('elapsed_before_runtime');if(Number.isFinite(before)&&before>deadlineMs)e.push('deadline');
 const t=validateSourceBoundTransfer(evidence?.transfer,{sourceHead,runtimeRootSha256,runtimeRootDescriptor,maxReads,maxRounds,flexMaxReads,flexMaxRounds,deadlineMs});if(!t.ok)e.push(...t.errors.map(x=>'transfer:'+x));
 const m=validateLocalMaterializationReceipt(localMaterializationReceipt,{sourceHead,runtimeRootSha256,loaderBlobSha1,transferReceiptSha256:evidence?.transfer?.receipt_sha256});if(!m.ok)e.push(...m.errors.map(x=>'materialization:'+x));
 if(t.ok&&Number.isFinite(before)&&t.elapsed_ms>before)e.push('transfer_elapsed_order');if(evidence?.transfer_receipt_sha256!==evidence?.transfer?.receipt_sha256)e.push('transfer_receipt_binding');if(evidence?.materialization_receipt_sha256!==localMaterializationReceipt?.receipt_sha256)e.push('materialization_receipt_binding');
 if(!HEX64.test(String(evidence?.receipt_sha256||''))||digestWithout(evidence)!==evidence?.receipt_sha256)e.push('receipt_digest');
 const terminal=e.some(x=>x==='deadline'||x==='transfer:deadline')?'BOOTSTRAP_DEADLINE_EXCEEDED':'HOST_INCOMPATIBLE';
 return e.length?bad(e,terminal):{ok:true,terminal:'EVIDENCE_VERIFIED',source_head:sourceHead,runtime_root_sha256:runtimeRootSha256,transfer_receipt_sha256:evidence.transfer.receipt_sha256,materialization_receipt_sha256:localMaterializationReceipt.receipt_sha256,evidence_receipt_sha256:evidence.receipt_sha256,elapsed_before_runtime_ms:before,mode:evidence.transfer.mode};
}

export function totalDeadlineOk(elapsedBeforeRuntimeMs,localElapsedMs,deadlineMs=CHAT_BOOTSTRAP_DEADLINE_MS){return Number.isFinite(elapsedBeforeRuntimeMs)&&elapsedBeforeRuntimeMs>=0&&Number.isFinite(localElapsedMs)&&localElapsedMs>=0&&elapsedBeforeRuntimeMs+localElapsedMs<=deadlineMs;}
