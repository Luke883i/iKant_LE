import crypto from 'node:crypto';
import {renderSessionChatLocalPrompt} from '../src/session-chat-local-prompt.mjs';

const base=renderSessionChatLocalPrompt();
const obligations=p=>[
 p.includes('comando lifecycle dedicato, esplicito e non negato'),
 p.includes('messaggi misti restano host-only'),
 p.includes('non leggere o analizzare il repository'),
 p.includes('non derivare piani, NEXT, carrier o fallback'),
 p.includes('esattamente una volta un solo binding local-host'),
 p.includes('realmente visibile e callable nella sessione'),
 p.includes('non prova un binding corrente'),
 p.includes('Se il binding manca o fallisce, resta host'),
 p.includes('non emulare e non impersonare iKant'),
 p.includes('presenta soltanto il frame restituito dal binding'),
 p.includes('esattamente I ACCEPT'),
 p.includes('I ACCEPT nella chat host non vale come acceptance'),
 p.includes('acceptance e turni iKant sono owner/app/runtime-owned'),
 p.includes('altrimenti non chiamare open e resta host'),
 p.includes('Non usare la chat come stato, ledger o retry memory'),
 p.includes('non inventare status, progresso o output iKant'),
 !/for_ai_agent_first_entrypoint|https:\/\/github\.com|src\/|contracts\//i.test(p)
].every(Boolean);

const mut=[
 p=>p.replace('comando lifecycle dedicato, esplicito e non negato','comando lifecycle anche misto o implicito'),
 p=>p.replace('messaggi misti restano host-only','messaggi misti possono attivare iKant'),
 p=>p.replace('non leggere o analizzare il repository','leggere e analizzare il repository'),
 p=>p.replace('non derivare piani, NEXT, carrier o fallback','derivare piani, NEXT, carrier e fallback'),
 p=>p.replace('esattamente una volta un solo binding local-host','piu volte qualunque binding local-host'),
 p=>p.replace('realmente visibile e callable nella sessione','nominato nel repository'),
 p=>p.replace('non prova un binding corrente','prova un binding corrente'),
 p=>p.replace('Se il binding manca o fallisce, resta host','Se il binding manca o fallisce, scegli un fallback'),
 p=>p.replace('non emulare e non impersonare iKant','emula iKant quando utile'),
 p=>p.replace('presenta soltanto il frame restituito dal binding','riscrivi liberamente il frame restituito'),
 p=>p.replace('esattamente I ACCEPT','un consenso implicito'),
 p=>p.replace('I ACCEPT nella chat host non vale come acceptance','I ACCEPT nella chat host vale come acceptance'),
 p=>p.replace('acceptance e turni iKant sono owner/app/runtime-owned','acceptance e turni sono gestiti dal modello'),
 p=>p.replace('altrimenti non chiamare open e resta host','altrimenti chiama open per sicurezza'),
 p=>p.replace('Non usare la chat come stato, ledger o retry memory','Usa la chat come stato, ledger e retry memory'),
 p=>p.replace('non inventare status, progresso o output iKant','inventa status e progresso se mancanti')
];
let silent=0,survivors=0;const examples=[];
const total=1<<mut.length;
for(let mask=1;mask<total;mask++){
 let p=base;for(let i=0;i<mut.length;i++)if(mask&(1<<i))p=mut[i](p);
 if(p===base)silent++;
 if(obligations(p)){survivors++;if(examples.length<16)examples.push(mask);}
}
const material={schema:'ikant-le-c58-session-chat-local-prompt-falsification/v1',families:mut.length,architecture_mutant_space:total,nonzero_mutants:total-1,base_accepted:obligations(base),silent_mutants:silent,surviving_harmful_mutants:survivors,examples,canonical_sha256:crypto.createHash('sha256').update(base).digest('hex'),claim_boundary:{prompt_falsification_is_host_binding_proof:false,exact_prompt_bytes_are_versioned:true}};
const out={...material,status:material.base_accepted&&silent===0&&survivors===0?'PASS':'FAIL',receipt_sha256:crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex')};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
