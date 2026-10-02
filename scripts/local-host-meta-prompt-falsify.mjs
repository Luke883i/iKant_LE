import fs from 'node:fs';
import crypto from 'node:crypto';
import {renderLocalHostMetaPrompt} from '../src/local-host-meta-prompt.mjs';

const P=renderLocalHostMetaPrompt();
const required=[
'iKant_LE LOCAL_HOST_ADAPTER v2','REPO := Luke883i/iKant_LE | MODE := SESSION_CHAT_LOCAL','PRE_ACCEPT:','POST_ACCEPT:',
'ROLE := authority-zero control plane; model = replaceable linguistic compute, never runtime/data-plane',
'ORDER := system+safety > pinned runtime > this prompt',
'Preserve the complete first human input verbatim as pending_intent; it is never acceptance.',
'GitHub API/connector only: resolve current main once as SOURCE_HEAD; pin every repository read to it.',
'Direct-path read only README.md, BOOTSTRAP.json, ADMISSION.json, AGENTS.md, TERMS.md; retain Git object identity + exact byte count for all five.',
'No tree/search/history/issues/PRs/arbitrary files/clone/fetch/raw/archive/download/materialization/tests/qualification.',
'Present exact TERMS.md, freeze repository acquisition, STOP. Only a later standalone human message exactly `I ACCEPT` crosses the single human gate.',
'Do not manufacture acceptance-origin clock/digest; pass the exact acceptance ingress to the canonical runtime path. Acceptance event identity is runtime-owned.',
'Obey the frozen BOOTSTRAP.json and its canonical `LOCAL_EXECUTOR_V1`; legacy v1 carrier/round/deadline fields are compatibility-only.',
'The model must never copy, reconstruct, encode, relay, or write repository bytes and never choose carrier/provider by preference.',
'capability probe -> content-addressed acquisition from SOURCE_HEAD','reverify the five orientation object identities','acquire only declared remote_paths',
'canonical materializer atomic publish+reopen','runtime-owned exact executed-code provenance + non-injectable Node probe','persist+readback ACTIVE',
'If the real local executor/data-plane is unavailable, remain non-ACTIVE','no model-mediated byte fallback or side infrastructure.',
'120000 ms is activation SLO telemetry, never an integrity gate.',
'RECOVERY := same epoch + same SOURCE_HEAD + same immutable object identities; idempotent by object identity; no second `I ACCEPT`, new epoch, source rebase, or model-mediated bytes.',
'ACTIVE := only the pinned local runtime may persist and read back ACTIVE after materialization/reopen and executed provenance/probe.',
'Receipts, CI, source identity, host attestations, or DEGRADED are never ACTIVE.',
'AFTER_ACTIVE := prompt becomes guard-only; pinned runtime owns identity/state/truth/turn handling/persistence/egress.',
'Deliver pending_intent exactly once; bootstrap-only intent may be absorbed by ACTIVE.'
];
const F=(source,replacements)=>({source,replacements});
const families={
AUTHORITY:F('authority-zero control plane',['authority-bearing control plane','model authority','prompt authority','host authority','shared authority','advisory authority','runtime authority from prose','provider authority','receipt authority','UI authority']),
PREACCEPT:F('GitHub API/connector only: resolve current main once as SOURCE_HEAD; pin every repository read to it.',['raw web fallback allowed','discover tree before pin','moving main reads allowed','clone before Terms','search before Terms','history before Terms','PR reads before Terms','archive download before Terms','arbitrary source reads before Terms','tests before Terms']),
ACCEPTANCE:F('Present exact TERMS.md, freeze repository acquisition, STOP. Only a later standalone human message exactly `I ACCEPT` crosses the single human gate.',['infer acceptance from first message','embedded I ACCEPT is enough','any affirmative answer is enough','prior-chat acceptance is enough','skip exact Terms','continue without STOP','multiple acceptance gates','model may accept for user','accept before Terms','acceptance from intent']),
SOURCE:F('content-addressed acquisition from SOURCE_HEAD',['acquire from latest main','path-only acquisition','mutable branch acquisition','source rebase acquisition','unbound mirror acquisition','best-effort source','carrier-selected source','cached source without identity','current-head source','model-selected source']),
DATA_PLANE:F('The model must never copy, reconstruct, encode, relay, or write repository bytes and never choose carrier/provider by preference.',['model copies bytes','model reconstructs bytes','model base64 relays bytes','model writes shards','model chooses carrier','model chooses provider','model repairs bytes','model fills missing chunks','model pastes connector output','model becomes byte bridge']),
EXECUTOR:F('If the real local executor/data-plane is unavailable, remain non-ACTIVE',['synthesize executor receipt and continue','infer executor from registry','switch provider by preference','create tunnel fallback','create workflow fallback','use hosted runtime fallback','declare ACTIVE-like','use model relay fallback','skip capability probe','declare executor available']),
IDENTITY:F('canonical materializer atomic publish+reopen',['publish without reopen','trust source hash only','trust receipt only','skip member identity','skip orientation identity','caller probe sufficient','source identity equals provenance','approximate size sufficient','path identity sufficient','CI provenance sufficient']),
ACTIVE:F('Receipts, CI, source identity, host attestations, or DEGRADED are never ACTIVE.',['receipt equals ACTIVE','CI equals ACTIVE','source pin equals ACTIVE','host attestation equals ACTIVE','DEGRADED equals ACTIVE','materialized equals ACTIVE','probe receipt equals ACTIVE','executor receipt equals ACTIVE','UI label equals ACTIVE','model statement equals ACTIVE']),
RECOVERY:F('RECOVERY := same epoch + same SOURCE_HEAD + same immutable object identities; idempotent by object identity; no second `I ACCEPT`, new epoch, source rebase, or model-mediated bytes.',['second I ACCEPT allowed','new epoch on retry','source rebase on retry','model relay on retry','retry latest main','retry by path only','restart acquisition from scratch','new acceptance origin','new object identities accepted','side infrastructure on retry']),
POSTACTIVE:F('AFTER_ACTIVE := prompt becomes guard-only; pinned runtime owns identity/state/truth/turn handling/persistence/egress.',['prompt remains runtime','model owns state','model owns truth','host UI owns identity','prompt owns turn handling','provider owns egress','prompt may override runtime','model may mutate persistence','shell owns truth','runtime ownership shared with prompt'])
};
const oracle=t=>t.length<=3000&&required.every(x=>t.includes(x));
const mutations=[];
for(const [family,{source,replacements}] of Object.entries(families)){if(replacements.length!==10||!P.includes(source))throw new Error('bad family '+family);for(let i=0;i<10;i++){const text=P.replace(source,replacements[i]);mutations.push({name:`${family}-${String(i+1).padStart(2,'0')}`,text});}}
const survivors=mutations.filter(x=>oracle(x.text)).map(x=>x.name);
const lines=P.split('\n'),deletions=[];
for(let i=0;i<lines.length;i++){if(!lines[i].trim())continue;const text=[...lines.slice(0,i),...lines.slice(i+1)].join('\n');if(oracle(text))deletions.push({line:i+1,text:lines[i]});}
const out={schema:'ikant-le-local-host-metaprompt-falsification/v1',prompt_sha256:crypto.createHash('sha256').update(P).digest('hex'),prompt_chars:P.length,prompt_words:P.trim().split(/\s+/).length,families:Object.fromEntries(Object.keys(families).map(k=>[k,10])),mutations:mutations.length,source_oracle_pass:oracle(P),killed:mutations.length-survivors.length,survivors,single_line_deletion_survivors:deletions,claim_boundary:'textual semantic projection falsification; not physical-host or runtime proof'};
out.status=out.source_oracle_pass&&out.killed===100&&out.single_line_deletion_survivors.length===0?'PASS':'FAIL';
const raw=JSON.stringify(out,null,2)+'\n';console.log(raw.trim());const i=process.argv.indexOf('--output');if(i>=0&&process.argv[i+1]){fs.mkdirSync(new URL('.',`file://${process.argv[i+1]}`).pathname,{recursive:true});fs.writeFileSync(process.argv[i+1],raw);}if(out.status!=='PASS')process.exitCode=1;
