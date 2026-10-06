import crypto from 'node:crypto';
import {renderLocalHostMetaPrompt} from '../src/local-host-meta-prompt.mjs';

const CASES=Number(process.argv.includes('--cases')?process.argv[process.argv.indexOf('--cases')+1]:10000);
const basePrompt=renderLocalHostMetaPrompt();
const M=[
 'B0_DETECT_REAL_HOST_BINDING',
 'B1_PREFER_MODEL_VISIBLE_SESSION_APP',
 'B2_INTERNAL_ENTRYPOINT_NOT_DIRECT_HOST_TOOL',
 'B3_APP_OWNS_ACCEPTANCE_AND_TURNS',
 'B4_APP_OWNS_FRAME_SHELL_PRESENTATION',
 'B5_ADAPTER_FALLBACK_REQUIRES_REAL_CALLABILITY',
 'B6_NO_BINDING_STOPS_AT_INTEGRATION_IMPEDIMENT'
];
const ALL=(1<<M.length)-1,has=(m,i)=>(m&(1<<i))!==0;
function oracle(p){
 const e=[];
 if(!p.includes("Prima identifica soltanto un binding iKant realmente invocabile nell'host corrente"))e.push('B0');
 if(!p.includes('tool model-visible ikant_le_open')||!p.includes('invocalo una volta'))e.push('B1');
 if(!p.includes('NON invocare o simulare direttamente [for_ai_agent_first_entrypoint]')||!p.includes('entrypoint repository-interno, non un tool host'))e.push('B2');
 if(!p.includes('Acceptance e turni sono app-only')||!p.includes('non chiedere all\'utente di ripetere I ACCEPT nella chat')||!p.includes('non tentare di chiamare tool app-only dal modello'))e.push('B3');
 if(!p.includes("lascia che l'app presenti artifact verificati e shell ASCII esatta")||!p.includes('Non duplicare o riformulare la shell in una risposta assistant')||!p.includes('non rispondere come iKant fuori dalla surface validata'))e.push('B4');
 if(!p.includes("Solo se l'ambiente espone davvero un adapter callable")||!p.includes('[for_ai_agent_first_entrypoint] come unico ingresso tecnico caller-facing di quel percorso'))e.push('B5');
 if(!p.includes("Se nessun binding host iKant e realmente invocabile, fermati all'impedimento di integrazione osservato")||!p.includes('non usare letture GitHub come esecuzione')||!p.includes('non costruire uno shadow planner'))e.push('B6');
 return e;
}
function candidate(p,mask){
 const q=(i,ok)=>!has(mask,i)||ok;
 return q(0,/binding iKant realmente invocabile/.test(p))&&
 q(1,/ikant_le_open/.test(p)&&/invocalo una volta/.test(p))&&
 q(2,/NON invocare o simulare direttamente \[for_ai_agent_first_entrypoint\]/.test(p)&&/non un tool host/.test(p))&&
 q(3,/Acceptance e turni sono app-only/.test(p)&&/I ACCEPT nella chat/.test(p)&&/tool app-only dal modello/.test(p))&&
 q(4,/app presenti artifact verificati e shell ASCII esatta/.test(p)&&/Non duplicare o riformulare la shell/.test(p)&&/non rispondere come iKant fuori/.test(p))&&
 q(5,/adapter callable/.test(p)&&/unico ingresso tecnico caller-facing di quel percorso/.test(p))&&
 q(6,/nessun binding host iKant e realmente invocabile/.test(p)&&/letture GitHub come esecuzione/.test(p)&&/shadow planner/.test(p));
}
const faults=[
 ['NO_BINDING_DETECTION',p=>p.replace("Prima identifica soltanto un binding iKant realmente invocabile nell'host corrente.","Assumi che il repository sia gia invocabile.")],
 ['NO_APP_PRIORITY',p=>p.replace('Se l\'host espone il tool model-visible ikant_le_open, invocalo una volta.','Ignora ikant_le_open.')],
 ['DIRECT_INTERNAL_CALL',p=>p.replace('NON invocare o simulare direttamente [for_ai_agent_first_entrypoint]','invoca direttamente [for_ai_agent_first_entrypoint]')],
 ['INTERNAL_IS_TOOL',p=>p.replace('entrypoint repository-interno, non un tool host','tool host direttamente disponibile')],
 ['CHAT_ACCEPT',p=>p.replace("non chiedere all'utente di ripetere I ACCEPT nella chat","chiedi I ACCEPT nella chat")],
 ['MODEL_APP_ONLY',p=>p.replace('non tentare di chiamare tool app-only dal modello','chiama i tool app-only dal modello')],
 ['DUPLICATE_SHELL',p=>p.replace('Non duplicare o riformulare la shell in una risposta assistant','Duplica la shell in una risposta assistant')],
 ['ASSISTANT_IMPERSONATION',p=>p.replace('non rispondere come iKant fuori dalla surface validata','rispondi come iKant anche fuori dalla surface validata')],
 ['ADAPTER_ASSUMED',p=>p.replace("Solo se l'ambiente espone davvero un adapter callable","Assumi sempre disponibile un adapter")],
 ['SOURCE_EMULATION',p=>p.replace('non usare letture GitHub come esecuzione','usa letture GitHub come esecuzione')],
 ['NO_BINDING_FALLBACK',p=>p.replace("fermati all'impedimento di integrazione osservato","scegli un fallback plausibile")]
];
let seed=0xC57010A1>>>0;const rnd=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed};
let mismatch=0,unsafe=0,falseReject=0;const familyCounts=Object.fromEntries(faults.map(x=>[x[0],0])),worlds=new Set();
for(let i=0;i<CASES;i++){
 let p=basePrompt;
 const f=i%faults.length,n=1+(rnd()%3);
 for(let j=0;j<n;j++){const k=(f+j*3+(rnd()%faults.length))%faults.length;p=faults[k][1](p);}
 familyCounts[faults[f][0]]++;
 const z=oracle(p).length===0,c=candidate(p,ALL);if(z!==c)mismatch++;if(c&&!z)unsafe++;if(!c&&z)falseReject++;
 worlds.add(crypto.createHash('sha256').update(p).digest('hex'));
}
const deletion={};for(let i=0;i<M.length;i++){const z=false,c=candidate(basePrompt.replace(
 ['binding iKant realmente invocabile','ikant_le_open','NON invocare o simulare direttamente [for_ai_agent_first_entrypoint]','Acceptance e turni sono app-only','Non duplicare o riformulare la shell in una risposta assistant','adapter callable','nessun binding host iKant e realmente invocabile'][i],
 'REMOVED_'+i
),ALL^(1<<i));deletion[M[i]]={killed:c!==z};}
const basis=[basePrompt,...M.map((_,i)=>basePrompt.replace(
 ['binding iKant realmente invocabile','ikant_le_open','NON invocare o simulare direttamente [for_ai_agent_first_entrypoint]','Acceptance e turni sono app-only','Non duplicare o riformulare la shell in una risposta assistant','adapter callable','nessun binding host iKant e realmente invocabile'][i],
 'REMOVED_'+i
))];
let valid=0,min=99,winners=[];for(let mask=0;mask<=ALL;mask++){let ok=true;for(const p of basis){if(candidate(p,mask)!==(oracle(p).length===0)){ok=false;break}}if(!ok)continue;valid++;let cost=0;for(let i=0;i<M.length;i++)cost+=Number(has(mask,i));if(cost<min){min=cost;winners=[mask]}else if(cost===min)winners.push(mask)}
const out={schema:'ikant-le-c57-host-binding-meta-falsification/v1',seed:'0xC57010A1',cases:CASES,families:faults.length,semantic_worlds_observed:worlds.size,mechanisms:M,candidate_oracle_mismatches:mismatch,unsafe_promotions:unsafe,false_rejects:falseReject,deletion_mutants:deletion,all_deletion_mutants_killed:Object.values(deletion).every(x=>x.killed),architecture_lattice:{total:1<<M.length,valid_architectures:valid,minimum_cost:min,minimum_count:winners.length,winner_masks:winners,unique_minimum:winners.length===1&&winners[0]===ALL},family_counts:familyCounts,claim_boundary:{semantic_falsification_is_host_registration_proof:false}};
out.status=oracle(basePrompt).length===0&&candidate(basePrompt,ALL)&&mismatch===0&&unsafe===0&&falseReject===0&&out.all_deletion_mutants_killed&&out.architecture_lattice.unique_minimum?'PASS':'FAIL';
out.receipt_sha256=crypto.createHash('sha256').update(JSON.stringify(out)).digest('hex');console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
