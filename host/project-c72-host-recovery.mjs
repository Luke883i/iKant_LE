/** HOST-only orchestration decision, no original C72 receipt or native identity.
 * Missing catalog entries never prove unavailable runtime: prefer post-accept
 * original-owner reentry over asking the human to diagnose a gateway. */
const deny=(edge,message)=>Object.freeze({kind:'STOP',action:'STOP',edge,
 human_next:'Nessuna azione tecnica richiesta a te. '+message,
 native_event_attested:false,original_receipt_issued:false,authority:0});
const auto=(action,edge,explanation)=>Object.freeze({kind:'AUTO',action,edge,
 human_next:explanation,native_event_attested:false,
 original_receipt_issued:false,authority:0});
const gate=(action,edge,humanNext)=>Object.freeze({kind:'HUMAN_GATE',action,edge,
 human_next:humanNext,native_event_attested:false,
 original_receipt_issued:false,authority:0});
/** 
 * Accepts observed state, not inferred capability. `acceptedOriginal` means a
 * separately reopened original C72/v2 receipt, not the text `I ACCEPT`.
 * Does not call owner or confer a mode, nor retry an UNKNOWN outcome.
 */
export function planC72HostRecovery({phase='AWAIT_ACCEPTANCE',humanMessage='',
  freshHumanTurn=false,termsLinkShown=false,priorSourceWitness=false,
  ownerAcceptanceVerified=false,ownerOutcome='NOT_INVOKED',
  node='UNKNOWN',apiTransport='UNKNOWN',catalog='UNKNOWN'}={}){
 if(!['AWAIT_ACCEPTANCE','ACCEPTANCE_PENDING','AWAIT_MODE'].includes(phase)||
  !['NOT_INVOKED','UNKNOWN','FAILED','SUCCEEDED'].includes(ownerOutcome)||
  !['UNKNOWN','AVAILABLE','UNAVAILABLE_VERIFIED'].includes(node)||
  !['UNKNOWN','AVAILABLE','UNAVAILABLE_VERIFIED'].includes(apiTransport)||
  !['UNKNOWN','EMPTY','FOUND'].includes(catalog))
  return deny('C72_HOST_EVIDENCE_INVALID','Il sistema non può convalidare gli indicatori tecnici.');
 if(phase==='AWAIT_MODE'){
  if(ownerAcceptanceVerified!==true)return deny('C72_ORIGINAL_RECEIPT_NOT_ATTESTED','Il consenso non è ancora stato validato dal componente originale.');
  if(!freshHumanTurn)return gate('AWAIT_EDU_OR_CANONICAL','C72_MODE_SELECTION_PENDING','Scrivi EDU oppure CANONICAL in un nuovo messaggio.');
  if(humanMessage!=='EDU'&&humanMessage!=='CANONICAL')return gate('AWAIT_EDU_OR_CANONICAL','C72_EXACT_MODE_REQUIRED','Invia soltanto EDU oppure CANONICAL, senza altre parole.');
  return auto('INVOKE_ORIGINAL_C72_MODE_OWNER','C72_MODE_ORIGINAL_SELECTION_REQUIRED','Il sistema verifica la selezione con il componente originale.');
 }
 if(phase==='AWAIT_ACCEPTANCE'){
  if(!termsLinkShown)return deny('C72_TERMS_NOT_DISPLAYED','Prima va mostrato il collegamento ai Terms.');
  if(!freshHumanTurn||humanMessage!=='I ACCEPT')return gate('AWAIT_I_ACCEPT','C72_EXACT_NEW_CONSENT_REQUIRED','Dopo aver esaminato i Terms, invia un nuovo messaggio contenente esattamente I ACCEPT.');
 }
 if(phase==='ACCEPTANCE_PENDING'&&ownerAcceptanceVerified!==true&&humanMessage==='EDU')
  return deny('C72_ACCEPTANCE_PENDING_NOT_MODE','EDU non sostituisce la ricevuta di consenso.');
 if(ownerAcceptanceVerified===true)
  return gate('AWAIT_EDU_OR_CANONICAL','C72_MODE_SELECTION_PENDING','In un nuovo messaggio, scrivi EDU oppure CANONICAL.');
 if(ownerOutcome==='UNKNOWN')return deny('C72_OWNER_OUTCOME_UNKNOWN','L’esito della chiamata è incerto: controllo solo le prove esistenti, senza ripetere la scrittura.');
 if(ownerOutcome==='FAILED')return deny('C72_OWNER_EXECUTION_FAILED','Il componente ha restituito un errore verificato.');
 if(ownerOutcome==='SUCCEEDED')return deny('C72_ORIGINAL_RECEIPT_NOT_ATTESTED','Manca la verifica della ricevuta originale.');
 if(!priorSourceWitness)return deny('C72_ORIENTATION_WITNESS_MISSING','La chat non conserva una prova sufficiente delle cinque letture e dei Terms.');
 // An empty connector catalog does not change the flow: an installed Node host
 // can still materialize and invoke the pinned original C72 after consent.
 if(node==='UNKNOWN')return auto('VERIFY_NODE_20','C72_NODE_CAPABILITY_UNKNOWN','Controllo automaticamente le capacità disponibili; non devi verificare alcun gateway.');
 if(node==='UNAVAILABLE_VERIFIED')return deny('C72_NODE_UNAVAILABLE_VERIFIED','Questa chat non dispone di esecuzione Node compatibile.');
 if(apiTransport==='UNKNOWN')return auto('VERIFY_PINNED_API_TRANSPORT','C72_SOURCE_BRIDGE_UNKNOWN','Controllo automaticamente l’accesso ai file originali.');
 if(apiTransport==='UNAVAILABLE_VERIFIED')return deny('C72_POSTACCEPT_TRANSPORT_UNAVAILABLE_VERIFIED','Questa chat non dispone di un collegamento verificabile ai file originali.');
 return auto('INVOKE_PINNED_C72_POSTACCEPT_REENTRY','C72_ORIGINAL_REENTRY_REQUIRED','Verifico i blob originali e completo l’ammissione; non devi intervenire.');
}
