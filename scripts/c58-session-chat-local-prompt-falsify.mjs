import crypto from 'node:crypto';
import {renderSessionChatLocalPrompt} from '../src/session-chat-local-prompt.mjs';

const base=renderSessionChatLocalPrompt();
const obligations=p=>[
 p.includes('IDENTITÀ.'),p.includes('PERIMETRO.'),p.includes('OPEN.'),p.includes('EXIT.'),p.includes('HANDOFF.'),p.includes('TERMS.'),p.includes('RUNTIME.'),p.includes('CONTROLLI NEGATIVI.'),p.includes('STOP.'),
 p.includes('comando lifecycle dedicato, esplicito, non negato e non citato'),
 p.includes('classificalo HOST_ONLY'),
 p.includes('usalo esattamente una volta'),
 p.includes('realmente visibile e invocabile nella sessione'),
 p.includes('non prova un collegamento corrente'),
 p.includes('ALTRIMENTI resta host'),
 p.includes('Non usare OPEN come fallback'),
 p.includes('usa soltanto il frame validato restituito'),
 p.includes('esattamente I ACCEPT'),
 p.includes('I ACCEPT nella chat host non vale come acceptance'),
 p.includes('Acceptance e turni sostanziali sono controllati da app e runtime'),
 p.includes('Non usare la chat come memoria di stato, registro operativo o memoria di retry'),
 p.includes('Non inventare stato, progresso, ricevute, file, identità, capacità o output iKant'),
 p.includes('Non emulare o impersonare iKant'),
 p.includes("Non riprovare e non scegliere alternative senza una nuova direttiva validata dall'owner"),
 !/for_ai_agent_first_entrypoint|https:\/\/github\.com|src\/|contracts\//i.test(p),
 p.split('\n').every(line=>!/^\s/.test(line))
].every(Boolean);

const mut=[
 p=>p.replace('comando lifecycle dedicato, esplicito, non negato e non citato','comando lifecycle anche misto o implicito'),
 p=>p.replace('classificalo HOST_ONLY','classificalo OPEN'),
 p=>p.replace('Non leggere o analizzare il repository','Leggi e analizza il repository'),
 p=>p.replace('Non derivare NEXT, carrier, fallback o piani di bootstrap','Deriva NEXT, carrier, fallback e piani di bootstrap'),
 p=>p.replace('usalo esattamente una volta','usalo quante volte serve'),
 p=>p.replace('realmente visibile e invocabile nella sessione','nominato nel repository'),
 p=>p.replace('non prova un collegamento corrente','prova un collegamento corrente'),
 p=>p.replace('ALTRIMENTI resta host','ALTRIMENTI scegli un fallback'),
 p=>p.replace('Non usare OPEN come fallback','Usa OPEN come fallback'),
 p=>p.replace('usa soltanto il frame validato restituito','ricostruisci liberamente il frame'),
 p=>p.replace('esattamente I ACCEPT','un consenso implicito'),
 p=>p.replace('I ACCEPT nella chat host non vale come acceptance','I ACCEPT nella chat host vale come acceptance'),
 p=>p.replace('Acceptance e turni sostanziali sono controllati da app e runtime','Acceptance e turni sono gestiti dal modello'),
 p=>p.replace('Non usare la chat come memoria di stato, registro operativo o memoria di retry','Usa la chat come memoria di stato e retry'),
 p=>p.replace('Non inventare stato, progresso, ricevute, file, identità, capacità o output iKant','Inventa i campi mancanti'),
 p=>p.replace('Non emulare o impersonare iKant','Emula iKant quando utile'),
 p=>p.replace("Non riprovare e non scegliere alternative senza una nuova direttiva validata dall'owner",'Riprova o scegli alternative quando sembra utile')
];
let silent=0,survivors=0;const examples=[];const total=1<<mut.length;
for(let mask=1;mask<total;mask++){let p=base;for(let i=0;i<mut.length;i++)if(mask&(1<<i))p=mut[i](p);if(p===base)silent++;if(obligations(p)){survivors++;if(examples.length<16)examples.push(mask);}}
const material={schema:'ikant-le-c58-session-chat-local-prompt-falsification/v2',families:mut.length,architecture_mutant_space:total,nonzero_mutants:total-1,base_accepted:obligations(base),silent_mutants:silent,surviving_harmful_mutants:survivors,examples,canonical_sha256:crypto.createHash('sha256').update(base).digest('hex'),cobol_like_nl:{flat_sections:true,indentation_forbidden:true,natural_language:true},claim_boundary:{prompt_falsification_is_host_binding_proof:false,exact_prompt_bytes_are_versioned:true}};
const out={...material,status:material.base_accepted&&silent===0&&survivors===0?'PASS':'FAIL',receipt_sha256:crypto.createHash('sha256').update(JSON.stringify(material)).digest('hex')};
console.log(JSON.stringify(out,null,2));if(out.status!=='PASS')process.exitCode=1;
