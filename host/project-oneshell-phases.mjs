/** Admission and materialization semantic slides: original C72 and source owners only. */
import {createHash} from 'node:crypto';
import {
 validateC72V2Offer,validateC72V2Accepted,validateC72V2Orientation,
 validateC72V2ModeSelection
} from './c72-public-mode-admission.mjs';
import {verifyLocalProjectSource} from '../scripts/project-repo-loader.mjs';
import {oneShellFrame} from './project-oneshell-edu.mjs';
const H40=/^[a-f0-9]{40}$/;
const paths=Object.freeze(['README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md']);
const denied=e=>oneShellFrame({esito:'BLOCCATO',b:'La fase richiesta non ha una ricevuta originale valida.',
 edge:e,next:'STOP'});
const sha=x=>createHash('sha256').update(Buffer.from(x,'utf8')).digest('hex');
const href=(h,p)=>'https://github.com/Luke883i/iKant_LE/blob/'+h+'/'+p;
/** Only HOST presentation. Caller must independently verify main, tree and original documents;
 * this function cannot certify a GitHub API call from a plain JS object. */
export function oneShellOrientation({head,tree,offer}={}){
 if(!H40.test(head||'')||!H40.test(tree||'')||
    !validateC72V2Offer(offer)||offer.source_head!==head||
    offer.presentation!=='PINNED_DOCUMENT_LINK'||offer.terms_link!==href(head,'TERMS.md')||
    offer.terms_read_attested!==false||offer.terms_body_presented!==false)
  return denied('C72_LINKED_OFFER_AND_SOURCE_LOCK_REQUIRED');
 return oneShellFrame({esito:'ORIENTAMENTO · HOST',b:'Cinque documenti originali da verificare al commit congelato. Il link ai Termini non attesta la lettura.',
  prova:paths.map(p=>href(head,p)).join('\n'),edge:'C72_HUMAN_ACCEPTANCE_PENDING',next:'AWAIT_I_ACCEPT'});
}
/** The full original C72 introduction is preserved in B without paraphrase. */
export function oneShellAccepted({accepted,orientation}={}){
 if(!validateC72V2Accepted(accepted)||!validateC72V2Orientation(orientation,accepted))
  return denied('C72_ORIGINAL_ACCEPTANCE_AND_INTRODUCTION_REQUIRED');
 return oneShellFrame({esito:'TERMINI ACCETTATI · HOST',b:orientation.text,
  prova:'C72_ORIENTATION_SHA256:'+sha(JSON.stringify(orientation)),
  edge:'HUMAN_MODE_SELECTION_PENDING',next:'AWAIT_EDU_OR_CANONICAL'});
}
export function oneShellSelected({selection,accepted,orientation}={}){
 if(!validateC72V2Accepted(accepted)||!validateC72V2Orientation(orientation,accepted)||
    !validateC72V2ModeSelection(selection,{sourceHead:accepted?.source_head})||
    selection.acceptance_receipt_sha256!==accepted.receipt_sha256||
    selection.orientation_receipt_sha256!==orientation.receipt_sha256)
  return denied('C72_ORIGINAL_MODE_RECEIPT_REQUIRED');
 const edu=selection.selected_mode==='EDU';
 return oneShellFrame({esito:edu?'EDU SELEZIONATA':'CANONICAL RICHIESTA',
  b:edu?'La selezione autorizza soltanto i controlli della sorgente e del runtime EDU.':
    'La selezione non attiva C59 né prova un ingresso MCP autenticato.',
  prova:'C72_SELECTION_SHA256:'+selection.receipt_sha256,
  edge:selection.first_unclosed_edge,
  next:edu?'VERIFY_SOURCE':'C59_ORIGINAL_CANONICAL_GATE'});
}
/** Closed source verification over materialized bytes, never the caller's assertion. */
export function oneShellMaterialized({selection,sourceRoot,head,tree}={}){
 if(!validateC72V2ModeSelection(selection,{mode:'EDU',sourceHead:head})||!H40.test(tree||''))
  return denied('EDU_SOURCE_AND_SELECTION_REQUIRED');
 try{
  const original=verifyLocalProjectSource(sourceRoot,{head,tree});
  if(original.source_head!==head||original.source_tree!==tree)
   return denied('SOURCE_READBACK_BINDING_MISMATCH');
  return oneShellFrame({esito:'CODICE EDU VERIFICATO',
   b:'Tutti i sorgenti della closure sono stati riletti e confrontati con il tree Git.',
   prova:'TREE:'+tree,edge:'EDU_RUNTIME_NOT_STARTED',next:'START_C135_EDU'});
 }catch{return denied('EDU_SOURCE_REOPEN_FAILED')}
}
export const ONE_SHELL_PHASES=Object.freeze(['ORIENTATION','ACCEPTED','MODE_SELECTED',
 'SOURCE_CHECK','SOURCE_HANDOFF','MATERIALIZED','EDU_READY','FIRST_TURN_VERIFIED']);
export const ONE_SHELL_SLOTS=Object.freeze(['ESITO','A','B','PROVA','EDGE','NEXT']);
