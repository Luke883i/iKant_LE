import crypto from 'node:crypto';
import {readFileSync} from 'node:fs';

const CONTRACT=JSON.parse(readFileSync(new URL('../contracts/c72-unified-mode-admission.json',import.meta.url),'utf8'));
const H40=/^[a-f0-9]{40}$/,H64=/^[a-f0-9]{64}$/;
const sha=v=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const seal=x=>Object.freeze({...x,receipt_sha256:sha(x)});
const reasons=Object.freeze({
 INVALID_OFFER:'SOURCE_OR_TERMS_UNVERIFIED',
 INVALID_PRESENTATION:'TERMS_PRESENTATION',
 INVALID_ACCEPTANCE:'EXACT_I_ACCEPT',
 INVALID_SELECTION:'MODE_CHOICE',
 INVALID_BOUNDARY:'COMMON_GATE_BINDING'
});
const denied=(reason)=>Object.freeze({schema:'ikant-le-c72-denial/v1',
 status:reason,first_unclosed_edge:reasons[reason]||'UNIFIED_ADMISSION',
 active:false,canonical_runtime:false,persistent:false,
 native_event_attested:false,owner_receipt_issued:false,authority:0});
function readSeal(x,schema){
 if(!x||x.schema!==schema||x.authority!==0||!H64.test(String(x.receipt_sha256||'')))return false;
 const {receipt_sha256,...body}=x;
 return sha(body)===receipt_sha256;
}
export function c72AdmissionContract(){return structuredClone(CONTRACT);}
export function issueC72TermsOffer({sourceHead,termsDigest}={}){
 if(!H40.test(String(sourceHead||''))||!H64.test(String(termsDigest||'')))throw Error('frozen source head and Terms digest required');
 return seal({schema:'ikant-le-c72-terms-offer/v1',source_head:sourceHead,terms_digest:termsDigest,
  terms_gate:'I ACCEPT',presentation_required:true,
  selection_after_acceptance:true,allowed_modes:['CANONICAL','EXPERIMENTAL'],
  active:false,native_event_attested:false,origin_authentication:'UNVERIFIED',authority:0});
}
export function validateC72Offer(o){
 return readSeal(o,'ikant-le-c72-terms-offer/v1')&&H40.test(String(o.source_head||''))&&
 H64.test(String(o.terms_digest||''))&&o.terms_gate==='I ACCEPT'&&
 o.presentation_required===true&&o.selection_after_acceptance===true&&
 JSON.stringify(o.allowed_modes)===JSON.stringify(['CANONICAL','EXPERIMENTAL'])&&
 o.active===false&&o.native_event_attested===false&&o.origin_authentication==='UNVERIFIED';
}
export function acceptC72Terms({offer,humanMessage,termsPresented}={}){
 if(!validateC72Offer(offer))return denied('INVALID_OFFER');
 if(termsPresented!==true)return denied('INVALID_PRESENTATION');
 if(humanMessage!=='I ACCEPT')return denied('INVALID_ACCEPTANCE');
 return seal({schema:'ikant-le-c72-accepted/v1',
  source_head:offer.source_head,terms_digest:offer.terms_digest,
  terms_offer_sha256:offer.receipt_sha256,
  human_text_sha256:sha('I ACCEPT'),text_consent_observed:true,
  terms_presentation_host_claim:true,
  selection_pending:true,selected_mode:null,
  active:false,canonical_runtime:false,persistent:false,
  native_event_attested:false,host_event_identity:null,origin_authentication:'UNVERIFIED',
  owner_receipt_issued:false,authority:0});
}
export function validateC72Accepted(a){
 return readSeal(a,'ikant-le-c72-accepted/v1')&&
 H40.test(String(a.source_head||''))&&H64.test(String(a.terms_digest||''))&&
 H64.test(String(a.terms_offer_sha256||''))&&a.human_text_sha256===sha('I ACCEPT')&&
 a.text_consent_observed===true&&a.terms_presentation_host_claim===true&&
 a.selection_pending===true&&a.selected_mode===null&&a.active===false&&
 a.canonical_runtime===false&&a.persistent===false&&
 a.native_event_attested===false&&a.host_event_identity===null&&
 a.origin_authentication==='UNVERIFIED'&&a.owner_receipt_issued===false;
}
const sentences=[
  "iKant helps people turn difficult questions into accountable, evidence-linked decisions and useful work products. It is a repository-governed conversational runtime, not a fictional persona or evidence of consciousness.",
  "A replaceable language model supplies expression; bounded cognitive rules, functional appraisal, recurrent self-world modeling and explicit runtime ownership govern what it can do.",
  "The intended end-to-end path takes human intent through pinned source and consent, explicit mode, verified Node execution and owner-reviewed language to an exact chat answer, with evidence, artifacts and durable readback only when independently witnessed.",
  "It makes observed facts, uncertainty, permissions, execution and outcomes distinct and stops at missing proof instead of simulating progress.",
  "CANONICAL requires authenticated native message ingress, an owner-verified ACTIVE state, a durable single writer and same-turn DOCX presentation; mode choice and green CI provide neither.",
  "EXPERIMENTAL is recommended for study and bounded drafts; native delivery and continuity can be unavailable, and tests do not establish consciousness or independent H95 user-value attainment.",
  "Your earlier I ACCEPT accepted the Terms, not a runtime mode. In a later message choose exactly CANONICAL or EXPERIMENTAL."
];
const predicates=[
 t=>t.includes('iKant')&&t.includes('repository-governed'),
 t=>t.includes('replaceable language model')&&t.includes('runtime ownership'),
 t=>t.includes('human intent')&&t.includes('verified Node'),
 t=>t.includes('observed facts')&&t.includes('outcomes distinct'),
 t=>t.includes('CANONICAL')&&t.includes('ACTIVE')&&t.includes('DOCX'),
 t=>t.includes('EXPERIMENTAL')&&t.includes('native delivery'),
 t=>t.includes('I ACCEPT')&&t.includes('choose exactly')
];
const clausesA=[
  "Claims are limited to independently observed capabilities.",
  "It stops rather than inventing missing execution receipts.",
  "Human judgment remains responsible for consequential choices.",
  "Source integrity is not the same as native host origin.",
  "An exact runtime voice is never rewritten by its display layer.",
  "Operational memory requires a verified writer and later readback.",
  "Local tests are not measurements of real user value.",
  "Runtime progress must not be inferred from project instructions.",
  "Functional self-modeling is not evidence of phenomenal experience.",
  "Unverified components remain explicitly unavailable."
];
const clausesB=[
  "A clear typed blocker identifies the first missing proof.",
  "Presentation is separate from execution and authorization.",
  "Any available files require actual creation and host delivery.",
  "A human may verify evidence before relying on an answer.",
  "The host may not provide every promised capability.",
  "Consent cannot be reconstructed from a model-generated message.",
  "Status is never upgraded by an attractive interface.",
  "An independent evaluation must test practical usefulness.",
  "Unsupported requests are acknowledged rather than simulated.",
  "Choose based on which operating guarantees you can verify."
];
export function evaluateC72Introductions(){
 const all=[];
 for(let a=0;a<10;a++)for(let b=0;b<10;b++){
  const text=sentences.join(' ')+' '+clausesA[a]+' '+clausesB[b];
  const words=text.trim().split(/\s+/u).length;
  const mandatory=predicates.every(p=>p(text));
  const duplicate=clausesA[a].toLowerCase().split(' ').filter(w=>clausesB[b].toLowerCase().includes(w)&&w.length>=9).length;
  const score=(mandatory?10000:0)-(words>200?1000:0)-(words<90?1000:0)-
    Math.abs(words-150)*3-duplicate*2;
  all.push({index:a*10+b,text,words,mandatory,score});
 }
 all.sort((a,b)=>b.score-a.score||a.index-b.index);
 return {evaluated:all.length,unique:new Set(all.map(x=>x.text)).size,
  selected:all[0],scores_are_empirical:false};
}
export function presentC72Introduction(accepted){
 if(!validateC72Accepted(accepted))return denied('INVALID_BOUNDARY');
 const best=evaluateC72Introductions();
 return seal({schema:'ikant-le-c72-orientation/v1',source_head:accepted.source_head,
  terms_digest:accepted.terms_digest,acceptance_receipt_sha256:accepted.receipt_sha256,
  text:best.selected.text,selected_candidate_index:best.selected.index,
  candidates_evaluated:best.evaluated,unique_candidates:best.unique,
  mode_options:['CANONICAL','EXPERIMENTAL'],
  default_recommendation:'EXPERIMENTAL',active:false,
  evidence_is_user_study:false,authority:0});
}
export function validateC72Orientation(o,accepted){
 if(!validateC72Accepted(accepted)||!readSeal(o,'ikant-le-c72-orientation/v1'))return false;
 const best=evaluateC72Introductions();
 return o.source_head===accepted.source_head&&o.terms_digest===accepted.terms_digest&&
 o.acceptance_receipt_sha256===accepted.receipt_sha256&&o.text===best.selected.text&&
 o.selected_candidate_index===best.selected.index&&o.candidates_evaluated===100&&
 o.unique_candidates===100&&
 JSON.stringify(o.mode_options)===JSON.stringify(['CANONICAL','EXPERIMENTAL'])&&
 o.default_recommendation==='EXPERIMENTAL'&&o.active===false&&
 o.evidence_is_user_study===false;
}
export function selectC72Mode({accepted,orientation,humanMessage}={}){
 if(!validateC72Orientation(orientation,accepted))return denied('INVALID_BOUNDARY');
 if(humanMessage!=='CANONICAL'&&humanMessage!=='EXPERIMENTAL')return denied('INVALID_SELECTION');
 return seal({schema:'ikant-le-c72-mode-selection/v1',
  source_head:accepted.source_head,terms_digest:accepted.terms_digest,
  acceptance_receipt_sha256:accepted.receipt_sha256,
  orientation_receipt_sha256:orientation.receipt_sha256,
  selected_mode:humanMessage,
  status:humanMessage==='CANONICAL'?'CANONICAL_REQUESTED_NOT_ACTIVE':'EXPERIMENTAL_SELECTED_NOT_RUNNING',
  common_human_gate:'I ACCEPT',additional_consent_required:false,
  first_unclosed_edge:humanMessage==='CANONICAL'?'HOST_MESSAGE_INGRESS':'EXECUTED_SOURCE_PROVENANCE',
  active:false,canonical_runtime:false,persistent:false,native_event_attested:false,
  owner_receipt_issued:false,authority:0});
}
export function validateC72ModeSelection(s,{mode=null,sourceHead=null}={}){
 if(!readSeal(s,'ikant-le-c72-mode-selection/v1'))return false;
 if(!H40.test(String(s.source_head||''))||!H64.test(String(s.terms_digest||''))||
 !H64.test(String(s.acceptance_receipt_sha256||''))||
 !H64.test(String(s.orientation_receipt_sha256||'')))return false;
 if(s.selected_mode!=='CANONICAL'&&s.selected_mode!=='EXPERIMENTAL')return false;
 if(mode!==null&&s.selected_mode!==mode)return false;
 if(sourceHead!==null&&s.source_head!==sourceHead)return false;
 return s.status===(s.selected_mode==='CANONICAL'?'CANONICAL_REQUESTED_NOT_ACTIVE':'EXPERIMENTAL_SELECTED_NOT_RUNNING')&&
 s.common_human_gate==='I ACCEPT'&&s.additional_consent_required===false&&
 s.first_unclosed_edge===(s.selected_mode==='CANONICAL'?'HOST_MESSAGE_INGRESS':'EXECUTED_SOURCE_PROVENANCE')&&
 s.active===false&&s.canonical_runtime===false&&s.persistent===false&&
 s.native_event_attested===false&&s.owner_receipt_issued===false;
}
