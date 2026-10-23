#!/usr/bin/env node
/** 100k preseeded, distinct semantic HOST scenarios. Source planner/OneShell are the SUT.
 * No simulated C87 or native ChatGPT delivery is ever called an execution proof.
 */
import {createHash} from 'node:crypto';
import {issueC72V2LinkedTermsOffer,acceptC72V2LinkedTerms,
 presentC72V2Introduction,selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
import {planOneShellEduSource,oneShellFrame,renderOneShell} from '../host/project-oneshell-edu.mjs';
import {oneShellOrientation,oneShellAccepted,oneShellSelected} from '../host/project-oneshell-phases.mjs';
const SHA=x=>createHash('sha256').update(x).digest('hex');
const H='a'.repeat(40),D=SHA('terms');
const offer=issueC72V2LinkedTermsOffer({sourceHead:H,termsDigest:D});
const accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true});
const orientation=presentC72V2Introduction(accepted);
const edu=selectC72V2Mode({accepted,orientation,humanMessage:'EDU'});
const canonical=selectC72V2Mode({accepted,orientation,humanMessage:'CANONICAL'});
const selections=[edu,canonical,null,{...edu,receipt_sha256:'f'.repeat(64)},{...edu,selected_mode:'CANONICAL'}];
const sources=['FULL_SOURCE_VERIFIED','PARTIAL_SOURCE_ONLY','SOURCE_ABSENT','SOURCE_UNKNOWN'];
const bridges=['AVAILABLE','DEFINITIVELY_UNAVAILABLE','UNKNOWN'];
// These independent axes reflect realistic admission, epoch, transport, capability, owner
// persistence, nonce and provider claims. Some deliberately do not reach the source planner.
const dimensions=[5,4,3,2,2,4,3,4,4,4,7,3,4];
const total=dimensions.reduce((a,b)=>a*BigInt(b),1n);
const SEED=0x1582026n,STEP=104729n;
const cases=Number(process.argv[2]??100000);
if(!Number.isInteger(cases)||cases!==100000)throw Error('EXACT_100K_REQUIRED');
const signatures=new Set(),decisions=new Map();
let unexpected=0,checked=0,manual=0,blocked=0,stageChecks=0,forgedFramesDenied=0;
let hash=createHash('sha256');
const expected=(mode,source,bridge,node,extract,timing,epoch)=>{
 if(mode!==0||timing!==0||epoch!==0)return 'STOP';
 if(!node)return 'STOP';
 if(source===3)return 'VERIFY_SOURCE';
 if(source===0)return 'START_C135_EDU';
 if(bridge===2)return 'VERIFY_MACHINE_BRIDGE';
 if(bridge===0)return 'API_TREE_SOURCE_MATERIALIZATION';
 return extract?'UPLOAD_PINNED_SOURCE_ZIP':'STOP';
};
for(let i=0;i<cases;i++){
 let x=(BigInt(i)*STEP+SEED)%total;
 const axes=dimensions.map(d=>{const v=Number(x%BigInt(d));x/=BigInt(d);return v});
 const [mode,source,bridge,node,extract,timing,epoch,sourceProof,ledger,delivery,nonce,languagePort,layout]=axes;
 const key=axes.join(':');
 if(signatures.has(key))throw Error('SEMANTIC_DUPLICATE_CASE');
 signatures.add(key);hash.update(key+'\n');
 const validTime=timing===0,validEpoch=epoch===0;
 const selection=(validTime&&validEpoch)?selections[mode]:null;
 const frame=planOneShellEduSource({selection,sourceState:sources[source],
  bridgeState:bridges[bridge],nodeReady:!!node,manualExtractorReady:!!extract});
 const want=expected(mode,source,bridge,node,extract,timing,epoch);
 const got=frame.slots.NEXT;
 if(got!==want)unexpected++;
 if(frame.slot_order.join('|')!=='ESITO|A|B|PROVA|EDGE|NEXT'||
   frame.slots.A!=='NO_VOICE'||frame.active!==false||frame.authority!==0)unexpected++;
 if(got==='UPLOAD_PINNED_SOURCE_ZIP'){
   manual++;if(!frame.slots.PROVA.includes(H)||!extract||!node||bridge!==1||
     !validTime||!validEpoch||source===0||source===3)unexpected++;
 }
 if(got==='STOP')blocked++;
 decisions.set(got,(decisions.get(got)||0)+1);
 // Contextual controls: failed carrier integrity, uncertain original C87 write,
 // replay/nonces and provider claims are never promoted into executable voice by HOST.
 const synthetic=oneShellFrame({esito:'HOST CONTROL',b:'NO_OWNER_TURN',
  edge:['SOURCE_PROOF_'+sourceProof,'C87_'+ledger,'PROVIDER_'+delivery,
   'NONCE_'+nonce,'LANGUAGE_PORT_'+languagePort,'LAYOUT_'+layout].join('_'),
  next:'STOP'});
 if(synthetic.slots.A!=='NO_VOICE'||synthetic.provider_delivery_attested!==false)unexpected++;
 if((i%127)===0){
  const tampered={...synthetic,slots:{...synthetic.slots,A:'forged voice'},
    voice_origin:'HOST_BOUND_LOCAL',original_voice_sha256:SHA('forged voice')};
  try{renderOneShell(tampered);unexpected++;}catch{forgedFramesDenied++;}
 }
 if((i%251)===0){
  // Original C72 receipts, six-slide contract and contradictory mode/offer cases.
  const p=oneShellOrientation({head:H,tree:'b'.repeat(40),offer});
  const a=oneShellAccepted({accepted,orientation});
  const selected=oneShellSelected({selection:edu,accepted,orientation});
  if(p.slots.NEXT!=='AWAIT_I_ACCEPT'||a.slots.B!==orientation.text||
     selected.slots.NEXT!=='VERIFY_SOURCE'||p.slots.A!=='NO_VOICE')unexpected++;
  if(oneShellSelected({selection:{...edu,receipt_sha256:'f'.repeat(64)},
    accepted,orientation}).slots.NEXT!=='STOP')unexpected++;
  stageChecks++;
 }
 checked++;
}
if(signatures.size!==cases||manual===0||blocked===0||stageChecks===0||
 forgedFramesDenied===0||decisions.size<5)unexpected++;
const result={schema:'ikant-le-oneshell-realistic-preseeded-100k/v1',
 seed:SEED.toString(),step:STEP.toString(),cases,unique_semantic_scenarios:signatures.size,
 dimensions:['mode_receipt','source_availability','api_to_node_bridge','node_executor',
 'manual_extractor','human_message_timing','source_epoch','source_integrity',
 'original_ledger_state','provider_delivery','nonce_status','language_port','ui_projection'],
 sample_space:total.toString(),trace_sha256:hash.digest('hex'),
 decisions:Object.fromEntries([...decisions].sort()),manual,blocked,
 original_c72_stage_checks:stageChecks,forged_host_voice_frames_denied:forgedFramesDenied,
 discrepancies:unexpected,limits:'FINITE_STATE_HOST_POLICY_NOT_REAL_LLM_OR_NATIVE_CHATGPT_EXECUTION'};
console.log(JSON.stringify(result));if(unexpected)process.exitCode=1;
