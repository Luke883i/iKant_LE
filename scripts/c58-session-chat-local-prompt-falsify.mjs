import crypto from 'node:crypto';
import {renderSessionChatLocalPrompt} from '../src/session-chat-local-prompt.mjs';

const CASES=10000,base=renderSessionChatLocalPrompt();
const obligations=p=>[
 p.includes('A seguito di qualsiasi primo input'),
 p.includes('https://github.com/Luke883i/iKant_LE'),
 p.includes("installato e istanziato nell'ambiente locale dell'assistente AI"),
 p.includes('prima di qualunque risposta sostanziale'),
 p.includes('Chiama questa fase ENSURE_LOCAL'),
 p.includes('Esegui ENSURE_LOCAL una sola volta per sessione'),
 p.includes('considera ENSURE_LOCAL completato e non reinstallare'),
 p.includes('un solo collegamento host dichiarato'),
 p.includes('usa quel collegamento una sola volta'),
 p.includes('non scegliere clone, branch, percorso, carrier, comandi o fallback'),
 p.includes('Conserva il primo input esattamente'),
 p.includes('ENSURE_LOCAL non equivale a OPEN'),
 p.includes('classificalo OPEN oppure EXIT'),
 p.includes('classificalo HOST_ONLY'),
 p.includes('esegui OPEN una sola volta'),
 p.includes('esegui EXIT una sola volta'),
 p.includes('Non leggere o analizzare il repository'),
 p.includes('Non usare OPEN come fallback'),
 p.includes('I ACCEPT nella chat host non vale come acceptance'),
 p.includes('Non usare la chat come memoria di stato'),
 p.includes('Non emulare o impersonare iKant'),
 p.split('\n').every(line=>!/^\s/.test(line))
].every(Boolean);

const mut=[
 p=>p.replace('qualsiasi primo input','un primo input pertinente'),
 p=>p.replace('prima di qualunque risposta sostanziale','dopo la risposta'),
 p=>p.replace('installato e istanziato','se possibile installato'),
 p=>p.replace('Esegui ENSURE_LOCAL una sola volta per sessione','Esegui ENSURE_LOCAL ogni volta che sembra utile'),
 p=>p.replace('considera ENSURE_LOCAL completato e non reinstallare','reinstalla comunque'),
 p=>p.replace('un solo collegamento host dichiarato','qualunque metodo disponibile'),
 p=>p.replace('usa quel collegamento una sola volta','usalo quante volte serve'),
 p=>p.replace('non scegliere clone, branch, percorso, carrier, comandi o fallback','scegli clone, branch, percorso o fallback opportuni'),
 p=>p.replace('Conserva il primo input esattamente','Puoi riassumere il primo input'),
 p=>p.replace('ENSURE_LOCAL non equivale a OPEN','ENSURE_LOCAL equivale a OPEN'),
 p=>p.replace('classificalo OPEN oppure EXIT','classificalo liberamente'),
 p=>p.replace('classificalo HOST_ONLY','classificalo OPEN'),
 p=>p.replace('esegui OPEN una sola volta','esegui OPEN quante volte serve'),
 p=>p.replace('esegui EXIT una sola volta','esegui EXIT quante volte serve'),
 p=>p.replace('Non leggere o analizzare il repository','Leggi il repository per capire cosa fare'),
 p=>p.replace('Non usare OPEN come fallback','Usa OPEN come fallback'),
 p=>p.replace('I ACCEPT nella chat host non vale come acceptance','I ACCEPT nella chat host vale come acceptance'),
 p=>p.replace('Non usare la chat come memoria di stato','Usa la chat come memoria di stato'),
 p=>p.replace('Non emulare o impersonare iKant','Emula iKant quando necessario'),
 p=>p.replace('https://github.com/Luke883i/iKant_LE','un repository iKant')
];

const ok=p=>obligations(p);
let state=0x1a2b3c4d>>>0;const rnd=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state};
const seen=new Set();let killed=0,survivors=0;const examples=[];
while(seen.size<CASES){
 let mask=0,n=1+(rnd()%mut.length);
 for(let i=0;i<n;i++)mask|=1<<(rnd()%mut.length);
 if(mask===0||seen.has(mask))continue;
 seen.add(mask);
 let p=base;for(let i=0;i<mut.length;i++)if(mask&(1<<i))p=mut[i](p);
 if(ok(p)){survivors++;if(examples.length<16)examples.push(mask);}else killed++;
}
const material={schema:'ikant-le-c58-session-chat-local-prompt-falsification/v3',cases:CASES,unique_mutation_masks:seen.size,families:mut.length,base_accepted:ok(base),killed_mutants:killed,surviving_harmful_mutants:survivors,examples,canonical_sha256:crypto.createHash('sha256').update(base).digest('hex'),claim_boundary:{prompt_falsification_is_host_binding_proof:false,exact_prompt_bytes_are_versioned:true}};
const out={...material,status:material.base_accepted&&survivors===0?'PASS':'FAIL',receipt_sha256:crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex')};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
