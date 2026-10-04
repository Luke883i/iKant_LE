import crypto from 'node:crypto';
import {compileFirstContactPlan} from './first-contact.mjs';
import {validateActivationExecutorReceipt} from './bootstrap-semantic.mjs';

export const HUMAN_INTENT_SCHEMA='ikant-le-human-intent/v1';
export const ACCEPTANCE_OBSERVATION_SCHEMA='ikant-le-acceptance-observation/v1';
export const DIRECT_EXECUTOR_HANDOFF_SCHEMA='ikant-le-direct-executor-handoff/v1';
export const BOOTSTRAP_READINESS_SCHEMA='ikant-le-bootstrap-readiness/v1';

const digest=x=>crypto.createHash('sha256').update(Buffer.from(JSON.stringify(x))).digest('hex');
const normalize=value=>String(value??'').normalize('NFKC').replace(/[\u200B-\u200D\u2060\uFEFF]/g,'').toLowerCase().replace(/[_.,;:!?()[\]{}'"]+/g,' ').replace(/\s+/g,' ').trim();
const NEGATION=/(^|\s)(non|no|not|don t|dont|do not)(\s|$)/;

export function classifyHumanIntent(input){
 const raw=String(input??''),n=normalize(raw);let kind='OTHER';
 const start=/(^|\s)(inizializza|inizializzare|avvia|avviare|attiva|attivare|start|initialize|activate)\s+(?:i\s*kant|ikant)(\s|$)/.test(n);
 const exit=/(^|\s)(chiudi|disattiva|stop|exit|release)\s+(?:i\s*kant|ikant)(\s|$)/.test(n)||/(^|\s)esci\s+da\s+(?:i\s*kant|ikant)(\s|$)/.test(n);
 if(!NEGATION.test(n)){if(start)kind='ACTIVATE_IKANT';else if(exit)kind='EXIT_IKANT';}
 return{schema:HUMAN_INTENT_SCHEMA,kind,raw_sha256:crypto.createHash('sha256').update(raw).digest('hex'),authority:0};
}

export function compileIntentAwareFirstContact(input){
 const intent=classifyHumanIntent(input);
 if(intent.kind==='ACTIVATE_IKANT'){
  const plan=compileFirstContactPlan('iKant_LE');
  return{next:{...plan,pending_intent:String(input??''),preserve_pending_intent:true},intent};
 }
 if(intent.kind==='EXIT_IKANT')return{next:{schema:'ikant-le-human-intent-next/v1',recognized:true,terminal:'OWNER_DELEGATION_REQUIRED',action:'DELEGATE_EXIT_TO_CURRENT_OWNER',authority:0},intent};
 return{next:compileFirstContactPlan(input),intent};
}

export function issueAcceptanceObservation({humanInput,sourceHead,termsObject,observedMonotonicMs}={}){
 const material={schema:ACCEPTANCE_OBSERVATION_SCHEMA,human_input:String(humanInput??''),source_head:sourceHead,terms_blob_sha1:termsObject?.blob_sha1??null,observed_monotonic_ms:Number(observedMonotonicMs),authority:0};
 if(material.human_input!=='I ACCEPT')throw new Error('exact I ACCEPT required');
 if(!/^[a-f0-9]{40}$/.test(String(sourceHead||'')))throw new Error('source head invalid');
 if(!/^[a-f0-9]{40}$/.test(String(material.terms_blob_sha1||'')))throw new Error('terms object invalid');
 if(!Number.isFinite(material.observed_monotonic_ms)||material.observed_monotonic_ms<0)throw new Error('acceptance monotonic observation required');
 return{...material,receipt_sha256:digest(material)};
}

export function directActivationExecutorHandoff({preacceptHandoff,activationExecutor,humanInput,acceptanceObservedMonotonicMs,runtimeRootDescriptor}={}){
 const sourceHead=activationExecutor?.source_head,runtimeRootSha256=activationExecutor?.runtime_root_sha256;
 if(!preacceptHandoff||preacceptHandoff.schema!=='ikant-le-preaccept-handoff/v2'||preacceptHandoff.repository!=='Luke883i/iKant_LE'||preacceptHandoff.source_head!==sourceHead||preacceptHandoff.terms_presented!==true||preacceptHandoff.frozen!==true||preacceptHandoff.breached!==false||preacceptHandoff.authority!==0)throw new Error('preaccept handoff invalid');
 const termsRow=(preacceptHandoff.orientation_objects||[]).find(x=>x?.path==='TERMS.md'),termsObject=preacceptHandoff.terms_object;
 if(!termsRow||!termsObject||termsObject.path!=='TERMS.md'||termsObject.blob_sha1!==termsRow.blob_sha1||termsObject.bytes!==termsRow.bytes)throw new Error('preaccept terms binding invalid');
 const acceptanceObservation=issueAcceptanceObservation({humanInput,sourceHead,termsObject,observedMonotonicMs:acceptanceObservedMonotonicMs});
 const ev=validateActivationExecutorReceipt(activationExecutor,{sourceHead,runtimeRootSha256,runtimeRootDescriptor,orientationObjects:preacceptHandoff.orientation_objects||[]});
 if(!ev.ok)throw new Error('activation executor receipt invalid: '+ev.errors.join(','));
 const material={schema:DIRECT_EXECUTOR_HANDOFF_SCHEMA,owner:'PRE_RUNTIME_HOST_ADAPTER',action:'EXECUTE_PRE_RUNTIME_BOOTSTRAP',source_head:sourceHead,runtime_root_sha256:runtimeRootSha256,activation_executor_receipt_sha256:activationExecutor.receipt_sha256,acceptance_observation_receipt_sha256:acceptanceObservation.receipt_sha256,first_unclosed_edge:'LOCAL_MATERIALIZATION',active_claim:false,authority:0};
 return{handoff:{...material,receipt_sha256:digest(material),execution_input:{preaccept_handoff:preacceptHandoff,activation_executor:activationExecutor,human_input:'I ACCEPT',acceptance_observed_monotonic_ms:acceptanceObservation.observed_monotonic_ms}},acceptance_observation:acceptanceObservation};
}

export function projectBootstrapReadiness({next=null,handoff=null,intent=null}={}){
 let state='WAITING_OWNER',publicLine='iKant · VERIFICA';
 if(intent?.kind==='EXIT_IKANT'){state='EXIT_REQUESTED';publicLine='iKant · CHIUDI';}
 else if(handoff?.action==='EXECUTE_PRE_RUNTIME_BOOTSTRAP'){state='MATERIALIZATION_READY';publicLine='iKant · MATERIALIZZA';}
 else if(next?.canonical_carrier==='HOST_FILE_BRIDGE'){state='FILE_REQUIRED';publicLine='iKant · CARICA FILE';}
 else if(next?.canonical_carrier==='WARM_CACHE_EXACT'){state='WARM_READY';publicLine='iKant · AVVIA';}
 else if(next?.terminal==='CANONICAL_PREACCEPT'){state='ORIENTATION_REQUIRED';publicLine='iKant · PREPARA';}
 else if(next?.action==='EXECUTE_CARRIER_IN_RUNTIME_EXECUTION_PLANE'){state='INGRESS_EXECUTABLE';publicLine='iKant · ACQUISISCI';}
 else if(next?.action==='PROBE_RUNTIME_EXECUTION_PLANE_EDGE'){state='PROBE_REQUIRED';publicLine='iKant · VERIFICA';}
 if(publicLine.length>32)throw new Error('compressed bootstrap line too long');
 return{schema:BOOTSTRAP_READINESS_SCHEMA,state,public_line:publicLine,persisted:false,authority:0};
}
