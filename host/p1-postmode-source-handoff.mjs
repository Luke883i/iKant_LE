/** HOST-only post-mode UX. Admission/C72 and runtime dispatch remain exclusively original. */
import {validateC72V2ModeSelection} from './c72-public-mode-admission.mjs';
const deny=edge=>Object.freeze({ok:false,first_edge:edge,action:'STOP',source_zip_url:null,authority:0});
export function planP1PostModeSourceHandoff({selection,sourceAvailable}={}){
 if(!validateC72V2ModeSelection(selection))return deny('HUMAN_MODE_GATE_UNVERIFIED');
 if(sourceAvailable===true)return Object.freeze({ok:true,action:'USE_VERIFIED_SOURCE',source_zip_url:null,
  message:'Il codice originale è già disponibile: proseguo con la verifica del runtime.',authority:0});
 if(sourceAvailable!==false)return Object.freeze({ok:false,first_edge:'SOURCE_AVAILABILITY_NOT_CHECKED',
  action:'VERIFY_SOURCE',source_zip_url:null,authority:0});
 const source_zip_url=`https://github.com/Luke883i/iKant_LE/archive/${selection.source_head}.zip`;
 return Object.freeze({ok:true,action:'REQUEST_SOURCE_ZIP',source_zip_url,
  message:'Per proseguire manca il codice originale. Scarica lo ZIP dal link e allegalo qui. Non serve usare il terminale.',
  after_mode_only:true,authority:0});
}
