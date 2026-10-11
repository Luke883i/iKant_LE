import fs from 'node:fs';
import crypto from 'node:crypto';
import {issueC72TermsOffer,acceptC72Terms,presentC72Introduction,selectC72Mode}
 from './c72-unified-mode-admission.mjs';
import {executeC108} from './c108-host-matrix.mjs';
import {inspectC107Ledger} from './c107-experimental-turn.mjs';
import {checkC109TurnFrame} from './c109-frame-policy.mjs';

// One host-scoped in-memory admission and routing shell. C108 is the only turn
// dispatcher; C87 is the only durable writer. Nothing here installs a ChatGPT hook.
const S='ikant-le-c109-chat-shell/v1';
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const OPTIN='AUTORIZZO BOZZE COHOST SPERIMENTALI NON VERIFICATE';
const start=new Set(['avvia ikant','attiva ikant']);
const pin=h=>typeof h==='string'&&/^[a-f0-9]{40}$/.test(h);
const docs=h=>[
 {title:'Sorgente congelato',url:`https://github.com/Luke883i/iKant_LE/tree/${h}`,kind:'NAVIGATION_NOT_EXECUTION'},
 {title:'Definizione C107 e DoD',url:`https://github.com/Luke883i/iKant_LE/blob/${h}/docs/C107_EXPERIMENTAL_RELEASE_DOD.md`,kind:'NAVIGATION_NOT_EVIDENCE'},
 {title:'Runtime C108',url:`https://github.com/Luke883i/iKant_LE/blob/${h}/host/c108-host-matrix.mjs`,kind:'NAVIGATION_NOT_EVIDENCE'}
];
export const C109_EXACT_OPTIN=OPTIN;
export function createC109ChatShell({sourceHead,ledgerFile,languagePort,relayPort}={}){
 if(!pin(sourceHead)||typeof ledgerFile!=='string')throw Error('C109_EXACT_HEAD_AND_LEDGER_REQUIRED');
 let phase='COLD',selection=null,accepted=null,orientation=null,prior=[],busy=false,terms=null;
 const limited={active:false,canonical_runtime:false,native_event_attested:false,
  native_delivery_attested:false,host_hook_attested:false,cognitive_memory_persistent:false};
 const response=(status,surface_a=null,edge=null,evidence={})=>Object.freeze({
  schema:S,status,phase,source_head:sourceHead,surface_a,
  surface_b:{schema:'ikant-le-c109-surface-b/v1',first_unclosed_edge:edge,
   evidence,documents:phase==='TERMS'?[]:docs(sourceHead),
   render_surface_b:phase!=='TERMS',...limited},...limited});
 const reject=e=>response('C109_STOP',null,e);
 async function send({text,nonce,candidate}={}){
  if(busy)return reject('C109_CONCURRENT_TURN');
  if(typeof text!=='string'||!text.trim()||Buffer.byteLength(text,'utf8')>16000)
   return reject('C109_BOUNDED_HUMAN_INPUT');
  busy=true;
  try{
   if(phase==='COLD'){
    if(!start.has(text.trim().toLowerCase()))return reject('C109_EXACT_START_REQUIRED');
    terms=fs.readFileSync(new URL('../TERMS.md',import.meta.url),'utf8');
    phase='TERMS';return response('C109_TERMS_PRESENTED',terms,'SEPARATE_LATER_EXACT_I_ACCEPT',
     {original_terms_bytes:Buffer.byteLength(terms,'utf8'),terms_sha256:sha(terms)});
   }
   if(phase==='TERMS'){
    if(text!=='I ACCEPT')return reject('C109_LATER_EXACT_ACCEPTANCE_REQUIRED');
    const offer=issueC72TermsOffer({sourceHead,termsDigest:sha(terms)});
    accepted=acceptC72Terms({offer,humanMessage:text,termsPresented:true});
    orientation=presentC72Introduction(accepted);
    if(accepted.schema!=='ikant-le-c72-accepted/v1'||
       orientation.schema!=='ikant-le-c72-orientation/v1')
     return reject('C109_ORIGINAL_C72_ACCEPTANCE_FAILED');
    phase='MODE';return response('C109_C72_INTRO',orientation.text,
     'SEPARATE_LATER_MODE_SELECTION',{terms_digest:sha(terms),c72_orientation_sha256:orientation.receipt_sha256});
   }
   if(phase==='MODE'){
    if(text!=='EXPERIMENTAL')return reject('C109_EXPERIMENTAL_SELECTION_REQUIRED_NO_FALLBACK');
    selection=selectC72Mode({accepted,orientation,humanMessage:text});
    if(selection.selected_mode!=='EXPERIMENTAL')return reject('C109_ORIGINAL_C72_SELECTION_FAILED');
    phase='OPTIN';return response('C109_EXPERIMENTAL_SELECTED',
     'Se desideri il laboratorio co-host, invia in un nuovo messaggio: '+OPTIN,
     'SEPARATE_EXACT_COHOST_OPTIN',{c72_selection_sha256:selection.receipt_sha256});
   }
   if(text==='STOP BOZZE COHOST'&&(phase==='OPTIN'||phase==='READY')){
    prior=[];phase='OPTIN';return response('C109_OPTIN_REVOKED',
     'Autorizzazione co-host revocata.','NEW_EXPLICIT_OPTIN_REQUIRED');
   }
   if(phase==='OPTIN'){
    if(text!==OPTIN)return reject('C109_SEPARATE_EXACT_OPTIN_REQUIRED');
    phase='READY';return response('C109_LOCAL_SHELL_READY',
     'iKant LAB: consenso sperimentale osservato. La voce richiede una porta host realmente chiamabile.',
     'NEXT_HUMAN_TURN_REQUIRES_PHYSICAL_C108_NODE_INVOCATION',
     {language_port_callable:typeof languagePort?.generate==='function',
      relay_port_callable:typeof relayPort?.turn==='function'});
   }
   if(phase==='CLOSED')return reject('C109_SESSION_CLOSED');
   if(phase!=='READY')return reject('C109_INVALID_PHASE');
   if(text==='ESCI LAB'){
    phase='CLOSED';prior=[];return response('C109_LOCAL_SESSION_CLOSED',null,'NATIVE_EXIT_NOT_ATTESTED');
   }
   if(text==='MOSTRA STATO'){
    const r=inspectC107Ledger(ledgerFile);
    return response(r.status==='C107_LEDGER_REOPENED'?'C109_OBSERVATION_ONLY':'C109_STOP',
     null,r.status==='C107_LEDGER_REOPENED'?'NO_CURRENT_INPUT_COGNITION':r.first_unclosed_edge,
     {ledger_entries:r.count||0,ledger_last_hash:r.last_hash||null});
   }
   const failure=checkC109TurnFrame({text,nonce,candidate});
   if(failure)return reject(failure);
   const request={sourceHead,selection,humanInput:text,optIn:true};
   const x=await executeC108({request,nonce,ledgerFile,priorMessages:prior,
    resetContext:prior.length===0,languagePort,relayPort,candidate});
   if(x.status!=='C108_LOCAL_RUNTIME_REOPENED_NOT_NATIVE')
    return reject(x.first_unclosed_edge||'C109_ORIGINAL_C108_EXECUTION_UNAVAILABLE');
   const reopened=inspectC107Ledger(ledgerFile);
   if(reopened.status!=='C107_LEDGER_REOPENED'||reopened.last_hash!==x.ledger_event_sha256||
      reopened.latest_state?.nonce!==nonce||reopened.latest_state?.visible_voice_sha256!==x.output_sha256)
    return reject('C109_INDEPENDENT_C87_FINAL_READBACK_FAILED');
   prior=[...prior,text].slice(-4);
   return response('C109_VERIFIED_LOCAL_VOICE_NOT_NATIVE',x.voice_utf8,
     'NATIVE_CHATGPT_DELIVERY_NOT_ATTESTED',
     {input_sha256:x.input_sha256,output_sha256:x.output_sha256,
      source_head:x.source_head,machine:x.machine,ledger_entries:reopened.count,
      ledger_event_sha256:x.ledger_event_sha256,original_c70_executed:x.original_c70_executed,
      original_c100_bound:x.original_c100_voice_bound,original_c87_reopened:x.original_c87_reopened,
      host_model_callback_invoked:x.model_callback_invoked,
      conversational_window_questions:prior.length});
  }catch(e){return reject('C109_ORIGINAL_EXECUTION_OR_IO_FAILURE');}
  finally{busy=false;}
 }
 return Object.freeze({send,get phase(){return phase;}});
}
