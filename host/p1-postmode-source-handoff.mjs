/** Read-only HOST microcopy. C72 selection is the only admission owner.
 * Availability is observed by HOST; this module cannot prove source bytes.
 */
import {validateC72V2ModeSelection} from './c72-public-mode-admission.mjs';
const STATES=Object.freeze(['FULL_SOURCE_VERIFIED','PARTIAL_SOURCE_ONLY','SOURCE_ABSENT','SOURCE_UNKNOWN']);
export const P1_SOURCE_STATES=STATES;
const deny=edge=>Object.freeze({ok:false,first_edge:edge,action:'STOP',source_zip_url:null,authority:0});
export function planP1PostModeSourceHandoff({selection,sourceState,sourceAvailable}={}){
 if(!validateC72V2ModeSelection(selection))return deny('HUMAN_MODE_GATE_UNVERIFIED');
 // Legacy boolean callers keep their semantics. Contradictory evidence fails closed.
 if(sourceState!==undefined&&sourceAvailable!==undefined)return deny('SOURCE_EVIDENCE_CONFLICT');
 const state=sourceState===undefined?(sourceAvailable===true?'FULL_SOURCE_VERIFIED':
  sourceAvailable===false?'SOURCE_ABSENT':'SOURCE_UNKNOWN'):sourceState;
 if(!STATES.includes(state))return Object.freeze({ok:false,first_edge:'SOURCE_AVAILABILITY_NOT_CHECKED',
  action:'VERIFY_SOURCE',source_zip_url:null,authority:0});
 if(state==='FULL_SOURCE_VERIFIED')return Object.freeze({ok:true,action:'USE_VERIFIED_SOURCE',
  source_state:state,source_zip_url:null,
  message:'Il codice originale e gia disponibile e verificato. Proseguo con il controllo del runtime.',authority:0});
 if(state==='SOURCE_UNKNOWN')return Object.freeze({ok:false,first_edge:'SOURCE_AVAILABILITY_NOT_CHECKED',
  action:'VERIFY_SOURCE',source_state:state,source_zip_url:null,
  message:'Verifico prima i file gia disponibili; non occorre scaricare nulla ora.',authority:0});
 const source_zip_url=`https://github.com/Luke883i/iKant_LE/archive/${selection.source_head}.zip`;
 return Object.freeze({ok:true,action:'REQUEST_SOURCE_ZIP',source_state:state,source_zip_url,
  message:state==='PARTIAL_SOURCE_ONLY'?
   'Hai gia il pacchetto di orientamento, ma manca il codice completo. Apri il link, scarica lo ZIP e allegalo qui. Non servono terminale o nuovi consensi.':
   'Manca il codice completo. Apri il link, scarica lo ZIP e allegalo qui. Non servono terminale o nuovi consensi.',
  after_mode_only:true,authority:0});
}
