#!/usr/bin/env node
/** 100k repeatable finite-state policy checks; not 100k live model turns. */
import {createHash} from 'node:crypto';
import {issueC72V2LinkedTermsOffer,acceptC72V2LinkedTerms,presentC72V2Introduction,selectC72V2Mode} from '../host/c72-public-mode-admission.mjs';
import {planOneShellEduSource} from '../host/project-oneshell-edu.mjs';
const H='a'.repeat(40),D=createHash('sha256').update('terms').digest('hex');
const offer=issueC72V2LinkedTermsOffer({sourceHead:H,termsDigest:D});
const accepted=acceptC72V2LinkedTerms({offer,humanMessage:'I ACCEPT',termsLinkPresented:true});
const orientation=presentC72V2Introduction(accepted);
const selections=[selectC72V2Mode({accepted,orientation,humanMessage:'EDU'}),
 selectC72V2Mode({accepted,orientation,humanMessage:'CANONICAL'}),null];
const states=['FULL_SOURCE_VERIFIED','PARTIAL_SOURCE_ONLY','SOURCE_ABSENT','SOURCE_UNKNOWN'];
const bridges=['AVAILABLE','DEFINITIVELY_UNAVAILABLE','UNKNOWN'];
let seed=0x1572026,checked=0,unexpected=0,manual=0;
const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0;};
const cases=Number(process.argv[2]??100000);
if(!Number.isInteger(cases)||cases<1||cases>1000000)throw Error('BOUNDED_CASES_REQUIRED');
const oracle=(mode,source,bridge,node,extract)=>{
 if(mode!==0)return 'STOP';
 if(!node)return 'STOP';
 if(source===3)return 'VERIFY_SOURCE';
 if(source===0)return 'START_C135_EDU';
 if(bridge===2)return 'VERIFY_MACHINE_BRIDGE';
 if(bridge===0)return 'API_TREE_SOURCE_MATERIALIZATION';
 if(!extract)return 'STOP';
 return 'UPLOAD_PINNED_SOURCE_ZIP';
};
for(let i=0;i<cases;i++){
 const n=next(),mode=n%3,source=(n>>>3)%4,bridge=(n>>>6)%3,node=!!((n>>>9)&1),extract=!!((n>>>10)&1);
 const frame=planOneShellEduSource({selection:selections[mode],sourceState:states[source],
  bridgeState:bridges[bridge],nodeReady:node,manualExtractorReady:extract});
 const expect=oracle(mode,source,bridge,node,extract);
 if(frame.slots.NEXT!==expect)unexpected++;
 if(frame.slots.NEXT==='UPLOAD_PINNED_SOURCE_ZIP'){manual++;
  if(mode!==0||source===0||source===3||bridge!==1||!node||!extract||
     !frame.slots.PROVA.includes(H))unexpected++;
 }
 if(frame.slots.A!=='NO_VOICE'||frame.slot_order.length!==6||frame.active!==false)unexpected++;
 checked++;
}
const result={schema:'ikant-le-project-oneshell-falsification/v1',seed:0x1572026,checked,
 semantic_classes_at_most:3*4*3*2*2,unexpected,manual,kind:'FINITE_STATE_POLICY_NOT_NATIVE_RUNTIME'};
console.log(JSON.stringify(result));if(unexpected)process.exitCode=1;
