import crypto from 'node:crypto';
import {classifyLifecycleIntent,classifyPreactiveRoute} from '../src/contract.mjs';
import {compileIntentAwareFirstContact} from '../src/bootstrap-intent-adapter.mjs';
const arg=n=>{const i=process.argv.indexOf(n);return i>=0?process.argv[i+1]:null},CASES=Number(arg('--cases')||1000000);
let seed=0xC58A11CE>>>0;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
const starts=['avvia','attiva','inizializza','start','activate','initialize'],exits=['chiudi','disattiva','exit','stop'],noise=['audit','repo','bundle','artifact','chat','test','forensic','host','documento','analisi'];
const families=['ACTIVATE','ACTIVATE_LOCAL','ACTIVATE_POLITE','EXIT','NEG_ACTIVATE','NEG_EXIT','QUOTED_ACTIVATE','CODE_ACTIVATE','REPO_ONLY','MIXED_AFTER','MIXED_BEFORE','CONFLICT','ZERO_WIDTH','URL_ONLY','HOMOGLYPH','REPEATED_ACTIVATE','EXAMPLE_QUOTED','ACTIVATE_SESSION','QUESTION','BARE_NAME'];
const counts=Object.fromEntries(families.map(x=>[x,0]));let mismatch=0,routeMismatch=0,nextMismatch=0;const samples=[];
function word(){return noise[rnd()%noise.length]+String(rnd()%1000000)}
function mk(i){const f=families[i%families.length],s=starts[rnd()%starts.length],e=exits[rnd()%exits.length],n=word();switch(f){
case'ACTIVATE':return{f,input:s+' iKant',kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
case'ACTIVATE_LOCAL':return{f,input:s+' localmente iKant',kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
case'ACTIVATE_POLITE':return{f,input:'per favore '+s+' iKant in questa sessione',kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
case'EXIT':return{f,input:e+' iKant',kind:'EXIT_IKANT',route:'HOST',next:'OWNER_DELEGATION_REQUIRED'};
case'NEG_ACTIVATE':return{f,input:'non '+s+' iKant',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'NEG_EXIT':return{f,input:'do not '+e+' ikant',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'QUOTED_ACTIVATE':return{f,input:'"'+s+' iKant" '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'CODE_ACTIVATE':return{f,input:'\`'+s+' ikant\` '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'REPO_ONLY':return{f,input:'audit Luke883i/iKant_LE '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'MIXED_AFTER':return{f,input:s+' iKant e fai audit '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'MIXED_BEFORE':return{f,input:'non fare audit '+n+', '+s+' iKant',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'CONFLICT':return{f,input:s+' iKant e poi '+e+' iKant',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'ZERO_WIDTH':return{f,input:s+' i\u200bKant',kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
case'URL_ONLY':return{f,input:'studia https://github.com/Luke883i/iKant_LE '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'HOMOGLYPH':return{f,input:s+' іKant',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'REPEATED_ACTIVATE':return{f,input:s+' iKant '+s+' iKant',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'EXAMPLE_QUOTED':return{f,input:'scrivi "'+s+' iKant" come esempio',kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
case'ACTIVATE_SESSION':return{f,input:s+' iKant localmente in questa sessione',kind:'ACTIVATE_IKANT',route:'IKANT_ADMISSION',next:'CANONICAL_PREACCEPT'};
case'QUESTION':return{f,input:'come posso '+s+' iKant '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};
default:return{f,input:'iKant_LE '+n,kind:'OTHER',route:'HOST',next:'HOST_ONLY'};}}
for(let i=0;i<CASES;i++){const w=mk(i);counts[w.f]++;const k=classifyLifecycleIntent(w.input).kind,route=classifyPreactiveRoute(w.input).route,next=compileIntentAwareFirstContact(w.input).next.terminal;if(k!==w.kind||route!==w.route||next!==w.next){mismatch+=k!==w.kind;routeMismatch+=route!==w.route;nextMismatch+=next!==w.next;if(samples.length<20)samples.push({i,family:w.f,input:w.input,expected:[w.kind,w.route,w.next],actual:[k,route,next]});}}
const material={schema:'ikant-le-c58-runtime-lifecycle-gate-falsification/v2',seed:'0xC58A11CE',cases:CASES,families:families.length,family_counts:counts,intent_mismatches:mismatch,route_mismatches:routeMismatch,next_mismatches:nextMismatch,samples,claim_boundary:{string_cases_are_not_physical_host_proof:true,general_nlu_claimed:false,dedicated_lifecycle_grammar_only:true}};
const out={...material,status:mismatch===0&&routeMismatch===0&&nextMismatch===0?'PASS':'FAIL',receipt_sha256:crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex')};console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
