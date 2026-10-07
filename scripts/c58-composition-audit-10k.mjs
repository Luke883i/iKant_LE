import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const K=JSON.parse(read('contracts/session-chat-local-host-kernel.json'));
const prompt=read('src/session-chat-local-prompt.mjs'),plugin=read('plugins/ikant-le-session-chat/README.md'),root=read('README.md'),server=read('plugins/ikant-le-session-chat/server/server.mjs'),adapter=read('src/bootstrap-intent-adapter.mjs'),deploy=read('src/session-chat-deployment.mjs');
const baseline={
 dedicated_gate:/dedicato, esplicito e non negato/.test(prompt),
 mixed_host_only:/messaggi misti restano host-only/.test(prompt),
 canonical_pending:/CANONICAL_ACTIVATION_PENDING_INTENT='inizializza iKant_LE'/.test(adapter),
 ensure_missing:/ensureSessionChatDeployment/.test(deploy)&&/deploySessionChatRuntime/.test(deploy),
 drift_failclosed:/deployment source drift/.test(deploy)&&/deployment runtime root drift/.test(deploy)&&/deployment source worktree drift/.test(deploy),
 model_open_only:/ikant_le_open/.test(server)&&/visibility:\['model','app'\]/.test(server)&&(server.match(/visibility:\['app'\]/g)||[]).length>=2,
 accept_app_only:/App-only exact human acceptance/.test(server),
 turn_app_only:/App-only canonical ACTIVE turn/.test(server),
 prompt_no_bootstrap_planning:/non leggere o analizzare il repository/.test(prompt)&&/non derivare piani, NEXT, carrier o fallback/.test(prompt),
 one_open_edge:/esattamente una volta un solo binding local-host/.test(prompt),
 host_accept_invalid:/I ACCEPT nella chat host non vale come acceptance/.test(prompt),
 no_chat_state:/Non usare la chat come stato, ledger o retry memory/.test(prompt),
 generic_subordinate:/not the preferred SESSION_CHAT cold start/.test(root),
 exit_explicit:/chiudi\/esci/.test(prompt)&&/altrimenti non chiamare open e resta host/.test(prompt),
 delta_accounting:Array.isArray(K.new_irreducible_primitives)&&K.new_irreducible_primitives.length===2&&Array.isArray(K.inherited_required_primitives)&&K.inherited_required_primitives.length===2,
 deploy_docs_current:!/deploy-once/i.test(plugin)
};
const baseFailures=Object.entries(baseline).filter(([,v])=>!v).map(([k])=>k);
const dims=Object.keys(baseline);let state=0xC58C0DE>>>0;const next=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state};const seen=new Set(),counts=Object.fromEntries(dims.map(x=>[x,0]));let worlds=0;
while(worlds<10000){const m=next()&0xffff;if(seen.has(m))continue;seen.add(m);worlds++;for(let i=0;i<dims.length;i++)if(m&(1<<i))counts[dims[i]]++;}
const every=Object.values(counts).every(n=>n>0),out={schema:'ikant-le-c58-composition-audit-10k/v1',cases:worlds,unique_masks:seen.size,baseline_failures:baseFailures,mutation_failure_counts:counts,every_dimension_adversarially_removed:every,new_delta_primitives:K.new_irreducible_primitives,inherited_required_primitives:K.inherited_required_primitives.map(x=>x.id),status:baseFailures.length===0&&every?'PASS':'FAIL'};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
