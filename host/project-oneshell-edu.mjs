/** OneShell Project EDU transport/control projection; authority 0, no lifecycle/writer. */
import {createHash} from 'node:crypto';
import {validateC72V2ModeSelection} from './c72-public-mode-admission.mjs';
import {planP1PostModeSourceHandoff} from './p1-postmode-source-handoff.mjs';
import {createC135EduV2Session} from './c135-edu-v2-owner.mjs';

const digest=s=>createHash('sha256').update(Buffer.from(s,'utf8')).digest('hex');
const KEYS=Object.freeze(['ESITO','A','B','PROVA','EDGE','NEXT']);
const genuineOwnerFrames=new WeakSet();
const SOURCE_STATES=new Set(['FULL_SOURCE_VERIFIED','PARTIAL_SOURCE_ONLY','SOURCE_ABSENT','SOURCE_UNKNOWN']);
const BRIDGES=new Set(['AVAILABLE','DEFINITIVELY_UNAVAILABLE','UNKNOWN']);
const plain=s=>typeof s==='string'&&s.length<=4096&&!/[\x00-\x08\x0b-\x1f]/u.test(s);
const failure=edge=>oneShellFrame({esito:'BLOCCATO',b:'Nessuna esecuzione originale attestata.',edge,next:'STOP'});
/** Frames are HOST views. The only permitted non-NO_VOICE A is genuine same-turn S03 evidence. */
export function oneShellFrame({esito,b,prova='NON_ATTESTATA',edge='UNKNOWN',next='STOP'}={}){
 if(![esito,b,prova,edge,next].every(plain))throw Error('ONESHELL_FIELD_INVALID');
 const a='NO_VOICE',origin='NO_VOICE',voiceSha=null;
 const slots=Object.freeze({ESITO:esito,A:a,B:b,PROVA:prova,EDGE:edge,NEXT:next});
 return Object.freeze({schema:'ikant-le-project-oneshell/v1',authority:0,active:false,
  native_ui_attested:false,provider_delivery_attested:false,slot_order:KEYS,
  slots,voice_origin:origin,original_voice_sha256:voiceSha});
}
/** Private S03 projection path: only the original C135 invocation reaches this code. */
function originalOwnerFrame({esito,b,prova,edge,next,s03}){
 if(s03?.ok!==true||s03.same_turn_local_owner_evidence_checked!==true||
   s03.slots?.A!=='HOST_BOUND'||typeof s03.original_voice_utf8!=='string'||
   s03.original_voice_sha256!==digest(s03.original_voice_utf8)||
   typeof s03.c125_original_bytes!=='string'||
   s03.c125_original_sha256!==digest(s03.c125_original_bytes))
  throw Error('ONESHELL_OWNER_VOICE_NOT_VERIFIED');
 const f=oneShellFrame({esito,b,prova,edge,next});
 const approved=Object.freeze({...f,slots:Object.freeze({...f.slots,A:s03.original_voice_utf8}),
  voice_origin:'HOST_BOUND_LOCAL',original_voice_sha256:s03.original_voice_sha256});
 genuineOwnerFrames.add(approved);
 return approved;
}
/** Layout does not edit or truncate A; Markdown-only view never implies native UI. */
export function renderOneShell(frame){
 if(frame?.schema!=='ikant-le-project-oneshell/v1'||frame.authority!==0||
    JSON.stringify(frame.slot_order)!==JSON.stringify(KEYS))throw Error('ONESHELL_FRAME_INVALID');
 const s=frame.slots;
 if(!['ESITO','B','PROVA','EDGE','NEXT'].every(k=>plain(s?.[k])))throw Error('ONESHELL_FRAME_INVALID');
 if(frame.voice_origin==='NO_VOICE'&&s.A!=='NO_VOICE')throw Error('ONESHELL_VOICE_UNVERIFIED');
 if(frame.voice_origin==='HOST_BOUND_LOCAL'&&
    (!genuineOwnerFrames.has(frame)||typeof s.A!=='string'||digest(s.A)!==frame.original_voice_sha256))throw Error('ONESHELL_VOICE_UNVERIFIED');
 return KEYS.map(k=>k+' · '+s[k]).join('\n\n');
}
/** Source routing consumes observed HOST capabilities, not guesses from a prompt.
 * The existing P1 helper is deliberately invoked only for public EDU/v2. */
export function planOneShellEduSource({selection,sourceState='SOURCE_UNKNOWN',
 bridgeState='UNKNOWN',nodeReady=false,manualExtractorReady=false}={}){
 if(!validateC72V2ModeSelection(selection,{mode:'EDU'}))return failure('C72_EDU_SELECTION_REQUIRED');
 if(!SOURCE_STATES.has(sourceState)||!BRIDGES.has(bridgeState))return failure('SOURCE_OR_BRIDGE_EVIDENCE_INVALID');
 if(nodeReady!==true)return failure('NODE_20_NOT_ATTESTED');
 if(sourceState==='FULL_SOURCE_VERIFIED')
  return oneShellFrame({esito:'SORGENTE VERIFICATA',b:'Uso il codice originale già disponibile.',edge:'EDU_RUNTIME_NOT_STARTED',next:'START_C135_EDU'});
 if(sourceState==='SOURCE_UNKNOWN')
  return oneShellFrame({esito:'VERIFICA SORGENTE',b:'Controllo i file già disponibili prima di richiederne altri.',edge:'SOURCE_AVAILABILITY_NOT_CHECKED',next:'VERIFY_SOURCE'});
 if(bridgeState==='UNKNOWN')
  return oneShellFrame({esito:'VERIFICA COLLEGAMENTO',b:'Accerto se i byte originali possono raggiungere Node.',edge:'API_TO_NODE_BRIDGE_UNKNOWN',next:'VERIFY_MACHINE_BRIDGE'});
 if(bridgeState==='AVAILABLE')
  return oneShellFrame({esito:'ACQUISIZIONE AUTOMATICA',b:'Trasferisco e verifico i blob Git originali.',edge:'SOURCE_NOT_MATERIALIZED',next:'API_TREE_SOURCE_MATERIALIZATION'});
 if(manualExtractorReady!==true)return failure('MANUAL_SOURCE_EXTRACTOR_UNAVAILABLE');
 const p=planP1PostModeSourceHandoff({selection,sourceState});
 if(p.ok!==true||p.action!=='REQUEST_SOURCE_ZIP'||p.after_mode_only!==true)
  return failure(p.first_edge||'MANUAL_HANDOFF_NOT_QUALIFIED');
 return oneShellFrame({esito:'SERVONO I SORGENTI',b:'Il ponte automatico non è disponibile. Allegare solo lo ZIP del commit pinnato, dopo EDU.',
  prova:p.source_zip_url,edge:'EDU_MANUAL_SOURCE_REQUIRED',next:'UPLOAD_PINNED_SOURCE_ZIP'});
}
/** The original C125 callback is captured once as opaque evidence, not presented
 * as an additional host message. OneShell is released only AFTER original S03.
 * No native platform-delivery receipt is asserted by this capture. */
export async function startOneShellEdu({selection,sourceRoot,sourceBinding=null,privateParent,
 languagePort,afterAcceptWitness}={}){
 if(!validateC72V2ModeSelection(selection,{mode:'EDU'}))
  return Object.freeze({ok:false,frame:failure('C72_EDU_SELECTION_REQUIRED')});
 if(typeof languagePort!=='function')
  return Object.freeze({ok:false,frame:failure('EDU_LANGUAGE_PORT_NOT_CALLABLE')});
 let c125=null,blocked=false,publishing=false,lastEvidence=null;
 const original=await createC135EduV2Session({selection,sourceRoot,sourceBinding,privateParent,
  languagePort,afterAcceptWitness,send:async bytes=>{
   if(blocked||c125!==null||typeof bytes!=='string'){blocked=true;throw Error('C125_CAPTURE_AMBIGUOUS');}
   c125=bytes;
  }});
 if(original.ok!==true||original.runtime_ready!==true)
  return Object.freeze({ok:false,frame:failure(original.first_edge||'C135_EDU_RUNTIME_NOT_READY')});
 let closed=false;
 async function publishTurn(frame){
  if(closed||blocked||publishing)return failure('EDU_SESSION_CLOSED_BUSY_OR_UNCERTAIN');
  publishing=true;
  try{
  c125=null;lastEvidence=null;
  const turn=await original.publishTurn(frame);
  if(turn.ok!==true||turn.s03_host_projection?.ok!==true||
     c125===null||turn.s03_host_projection.c125_original_bytes!==c125){
   if(turn.c125?.send_attempted===true||turn.c87_after>turn.c87_before)blocked=true;
   return failure(turn.first_edge||turn.s03_host_projection?.first_edge||'C125_EVIDENCE_MISSING');
  }
  const s=turn.s03_host_projection;
  const readback=original.readSessionState();
  if(readback?.original_c87_readback?.count!==turn.c87_after){blocked=true;return failure('EDU_INDEPENDENT_LEDGER_REOPEN_REQUIRED');}
  lastEvidence=Object.freeze({source_head:turn.source_head,source_tree:turn.source_tree,
    original_c125_utf8:s.c125_original_bytes,original_c125_sha256:s.c125_original_sha256,
    original_c87_readback:readback.original_c87_readback,authority:0,native_delivery_attested:false});
  return originalOwnerFrame({esito:'RISPOSTA EDU VERIFICATA',b:'Voce HOST_BOUND verificata localmente; consegna nativa non attestata.',
   prova:'sha256:'+s.c125_original_sha256,edge:'NATIVE_CHATGPT_DELIVERY_NOT_ATTESTED',
   next:'WAIT_NEXT_HUMAN_INPUT',s03:s});
  }catch{blocked=true;lastEvidence=null;return failure('EDU_TURN_OUTCOME_UNKNOWN_RECONCILE_READ_ONLY');}
  finally{publishing=false;}
 }
 return Object.freeze({ok:true,mode:'EDU',runtime_ready:true,active:false,provider_delivery_attested:false,
  frame:oneShellFrame({esito:'iKant EDU PRONTO',b:'Owner originale C135 avviato; nessuna voce emessa.',
   edge:'FIRST_EDU_TURN_PENDING',next:'AWAIT_HUMAN_INPUT'}),
  publishTurn,readSessionState:()=>original.readSessionState(),
  getLastEvidence:()=>lastEvidence,status:()=>original.status(),
  close:()=>{if(!closed){closed=true;original.close();}},owner:'C135_EDU_V2'});
}
