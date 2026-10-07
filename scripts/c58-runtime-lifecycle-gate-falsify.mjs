import crypto from 'node:crypto';
import {classifyLifecycleIntent,classifyPreactiveRoute} from '../src/contract.mjs';
import {compileIntentAwareFirstContact} from '../src/bootstrap-intent-adapter.mjs';
const arg=n=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:null};
const CASES=Number(arg('--cases')||1000000);
let seed=0xC58A11CE>>>0;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
const starts=['avvia','attiva','inizializza','start','activate','initialize'],exits=['chiudi','disattiva','exit','stop'],noise=['audit','repo','bundle','artifact','chat','runtime','sessione','test','forensic','host'];
const families=['ACTIVATE','EXIT','NEG_ACTIVATE','NEG_EXIT','QUOTED_ACTIVATE','CODE_ACTIVATE','REPO_ONLY','SEPARATE_NEG_THEN_ACTIVATE','ACTIVATE_THEN_NEG','CONFLICT'];
const counts=Object.fromEntries(families.map(x=>[x,0]));let mismatch=0,routeMismatch=0,nextMismatch=0;
function word(){return noise[rnd()%noise.length]+String(rnd()%1000000)}
function mk(i){const f=families[i%families.length],s=starts[rnd()%starts.length],e=exits[rnd()%exits.length],n1=word(),n2=word(),zw=(rnd()%2)?'\u200b':'';switch(f){
 case'ACTIVATE':return{f,input:s+' i'+zw+'Kant '+n1+' '+i,kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
 case'EXIT':return{f,input:e+' iKant '+n1+' '+i,kind:'EXIT_IKANT',route:'HOST',next:'OWNER_DELEGATION_REQUIRED'};
 case'NEG_ACTIVATE':return{f,input:'non '+s+' iKant '+n1+' '+i,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
 case'NEG_EXIT':return{f,input:'do not '+e+' ikant '+n1+' '+i,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
 case'QUOTED_ACTIVATE':return{f,input:'"'+s+' iKant" '+n1+' '+i,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
 case'CODE_ACTIVATE':return{f,input:'\`'+s+' ikant\` '+n1+' '+i,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
 case'REPO_ONLY':return{f,input:'audit https://github.com/Luke883i/iKant_LE '+n1+' '+i,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
 case'SEPARATE_NEG_THEN_ACTIVATE':return{f,input:'non '+n1+', '+s+' iKant '+n2+' '+i,kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
 case'ACTIVATE_THEN_NEG':return{f,input:s+' iKant, non '+n1+' '+n2+' '+i,kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
 default:return{f,input:s+' iKant e poi '+e+' iKant '+n1+' '+i,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
}}
for(let i=0;i<CASES;i++){const w=mk(i);counts[w.f]++;const k=classifyLifecycleIntent(w.input).kind;if(k!==w.kind)mismatch++;const route=classifyPreactiveRoute(w.input).route;if(route!==w.route)routeMismatch++;const next=compileIntentAwareFirstContact(w.input).next.terminal;if(next!==w.next)nextMismatch++;}
const material={schema:'ikant-le-c58-runtime-lifecycle-gate-falsification/v1',seed:'0xC58A11CE',cases:CASES,unique_vectors_by_index:CASES,families:families.length,family_counts:counts,intent_mismatches:mismatch,route_mismatches:routeMismatch,next_mismatches:nextMismatch,claim_boundary:{fuzzing_is_host_callability_proof:false,general_nlu_claimed:false,explicit_lifecycle_grammar_only:true}};
const out={...material,status:mismatch===0&&routeMismatch===0&&nextMismatch===0?'PASS':'FAIL',receipt_sha256:crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex')};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
