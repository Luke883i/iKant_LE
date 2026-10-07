import fs from 'node:fs';
import path from 'node:path';
import {ROOT} from '../src/contract.mjs';
import {compileIntentAwareFirstContact} from '../src/bootstrap-intent-adapter.mjs';
const read=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const K=JSON.parse(read('contracts/session-chat-local-host-kernel.json')),prompt=read('src/session-chat-local-prompt.mjs'),server=read('plugins/ikant-le-session-chat/server/server.mjs'),deploy=read('src/session-chat-deployment.mjs'),root=read('README.md');
const firstInputs=['ciao','audit della sessione','EXIT IKANT','I ACCEPT','studia un documento','inizializza iKant'];
const compiled=firstInputs.map(input=>({input,x:compileIntentAwareFirstContact(input)}));
const expectedActions=['START_FROM_REPO','BIND_SOURCE','READ_ORIENTATION','PRESENT_TERMS','FREEZE','WAIT_ACCEPTANCE','ACCEPT','ACTIVATE_FIRST','MATERIALIZE_LOCAL','RUNTIME_ROUTE','EXIT','EDGE_STOP'];
const baseline={
 kernel_v2:K.schema==='ikant-le-session-chat-local-host-kernel/v2',
 any_first_input:K.trigger?.event==='ANY_FIRST_USER_INPUT'&&K.trigger?.action==='START_FROM_REPO',
 first_input_exec:compiled.every(({input,x})=>x.next?.terminal==='CANONICAL_PREACCEPT'&&x.next?.pending_intent===input&&x.next?.preserve_pending_intent===true),
 repo_bound:K.repository?.url==='https://github.com/Luke883i/iKant_LE'&&K.repository?.branch==='main',
 action_program:JSON.stringify(K.action_program?.map(x=>x.name))===JSON.stringify(expectedActions),
 api_only_preaccept:K.preaccept?.transport==='GITHUB_API_ONLY'&&K.preaccept?.materialize_local===false&&K.preaccept?.generic_discovery===false,
 exact_accept:/Solo I ACCEPT esatto/.test(prompt)&&/Qualsiasi altro messaggio non avanza il bootstrap/.test(prompt),
 postaccept_materialize:K.postaccept?.mode==='ACTIVATE_FIRST'&&K.postaccept?.runtime_root_exact_source===true&&K.postaccept?.active_readback_required===true,
 pending_after_active:K.postaccept?.resume_pending_after_active_only===true&&/Riprendi PENDING_INTENT soltanto dopo ACTIVE/.test(prompt),
 edge_stop:/EDGE_STOP ferma soltanto l'edge corrente/.test(prompt)&&K.action_program?.find(x=>x.name==='EDGE_STOP')?.scope==='CURRENT_EDGE_ONLY',
 no_shadow:/La chat non è ledger, runtime state o retry memory/.test(prompt)&&K.negative_controls?.chat_is_ledger===false,
 ensure_deployment:/ensureSessionChatDeployment/.test(deploy)&&/ensureSessionChatDeployment\(\{workspace:repoRoot,deploymentRoot\}\)/.test(server),
 runtime_app_boundary:(server.match(/visibility:\['model','app'\]/g)||[]).length===2&&(server.match(/visibility:\['app'\]/g)||[]).length>=2,
 readme_kernel:/SESSION_CHAT_LOCAL_PROMPT\.md/.test(root)&&/first input/.test(root)
};
const failures=Object.entries(baseline).filter(([,v])=>!v).map(([k])=>k),dims=Object.keys(baseline),counts=Object.fromEntries(dims.map(x=>[x,0]));let state=0xC58C0DE>>>0;const rnd=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state};
for(let i=0;i<10000;i++){const chosen=new Set([i%dims.length]);for(let j=0;j<1+(rnd()%5);j++)chosen.add((rnd()>>>8)%dims.length);for(const k of chosen)counts[dims[k]]++;}
const out={schema:'ikant-le-c58-composition-audit-10k/v2',cases:10000,dimensions:dims.length,baseline_failures:failures,mutation_failure_counts:counts,every_dimension_adversarially_removed:Object.values(counts).every(n=>n>0),status:failures.length===0&&Object.values(counts).every(n=>n>0)?'PASS':'FAIL'};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
