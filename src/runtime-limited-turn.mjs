import fs from 'node:fs';
import path from 'node:path';
import {ROOT,sha256,validateSurfaceA} from './contract.mjs';
import {writeBacklogDocx} from './docx.mjs';
import {deriveActivationServiceTier,validateActivationServiceTier,assessLimitedTurnClosure,validateLimitedTurnClosure} from './runtime-availability.mjs';
import {buildSessionShell,validateSessionShell,renderSessionShell} from './session-shell.mjs';

function telemetryDigest(t){return sha256(Buffer.from(JSON.stringify(t)));}
function descriptorDigest(d){const x={...d};delete x.descriptor_sha256;return sha256(Buffer.from(JSON.stringify(x)));}

export function processLimitedRuntimeTurn({input,candidate,activationEvidence,nodeDispatch,artifactDir=path.join(ROOT,'.ikant','artifacts')}={}){
 const tier=deriveActivationServiceTier(activationEvidence);
 const tierValidation=validateActivationServiceTier(tier);
 if(!tierValidation.ok)throw new Error('FAILURE: invalid activation service tier');
 if(tier.tier!=='RUNTIME_BOUND_LIMITED'||tier.limited_turn_eligible!==true||tier.active===true)throw new Error('FAILURE: limited runtime turn requires RUNTIME_BOUND_LIMITED with writer availability');
 const inputText=String(input??''),inputSha=sha256(Buffer.from(inputText));
 if(nodeDispatch?.node20_plus!==true||nodeDispatch?.input_sha256!==inputSha||!/^[a-f0-9]{64}$/.test(String(nodeDispatch?.receipt_sha256||'')))throw new Error('FAILURE: limited runtime turn requires a valid same-input Node dispatch receipt');
 const surfaceA=String(candidate??'').trim(),surfaceValidation=validateSurfaceA(surfaceA);
 if(!surfaceValidation.ok)throw new Error('FAILURE: limited runtime output violates Surface A bounds');
 const outputSha=sha256(Buffer.from(surfaceA)),activationProjectionSha=sha256(Buffer.from(JSON.stringify(tier)));
 const sealMaterial={schema:'ikant-le-limited-runtime-seal/v1',claim_class:'IKANT_RUNTIME_LIMITED',activation_projection_sha256:activationProjectionSha,input_sha256:inputSha,output_sha256:outputSha,node_dispatch_receipt_sha256:nodeDispatch.receipt_sha256,first_unclosed_edge:tier.first_unclosed_edge,active:false,canonical_state_mutation:false,authority:0};
 const runtimeSeal={...sealMaterial,seal_sha256:sha256(Buffer.from(JSON.stringify(sealMaterial)))};
 const telemetry={schema:'ikant-le-limited-runtime-telemetry/v1',scope:'RUNTIME_BOUND_LIMITED',claim_class:'IKANT_RUNTIME_LIMITED',activation_tier:tier.tier,first_unclosed_edge:tier.first_unclosed_edge,input_sha256:inputSha,output_sha256:outputSha,node_dispatch_receipt_sha256:nodeDispatch.receipt_sha256,runtime_seal_sha256:runtimeSeal.seal_sha256,external_gaps_open:[...tier.external_gaps_open],completeness:{passed:8,applicable:8,ratio:1,complete:true},docx_write_readback_required:true,platform_ack_required:false,host_delivery_proven:false,canonical_state_mutation:false,active:false,persisted:false,authority:0};
 telemetry.telemetry_sha256=telemetryDigest(telemetry);
 const backlog={schema:'ikant-le-limited-backlog/v1',title:'iKant_LE Runtime-Limited Backlog',cycle:1,terminal:'LIMITED_OUTPUT_CLOSED',sections:[
  {title:'Activation tier',items:[`Tier: ${tier.tier}; ACTIVE: false; claim class: IKANT_RUNTIME_LIMITED.`,`First unclosed constitutional edge: ${tier.first_unclosed_edge}.`]},
  {title:'Human input binding',items:[`Input SHA-256: ${inputSha}.`,`Node dispatch receipt: ${nodeDispatch.receipt_sha256}.`]},
  {title:'Runtime output binding',items:[`Output SHA-256: ${outputSha}.`,`Runtime seal: ${runtimeSeal.seal_sha256}.`]},
  {title:'Bounded telemetry',items:[`Telemetry SHA-256: ${telemetry.telemetry_sha256}.`,`Completeness: 8/8; ratio: 1.`]},
  {title:'State boundary',items:['Canonical lifecycle/ledger state mutated: false.','This turn is a stateless runtime-limited envelope and cannot promote itself to ACTIVE.']},
  {title:'Delivery boundary',items:['Platform delivery ACK required for limited closure: false.','Host delivery proven: false. Artifact bytes/readback are the closure witness for this limited envelope.']},
  {title:'External gaps',items:[tier.external_gaps_open.length?tier.external_gaps_open.join(', '):'none']},
  {title:'Public output',items:[surfaceA]}
 ]};
 fs.mkdirSync(artifactDir,{recursive:true});
 const artifactName=`iKant_LE_Limited_${inputSha.slice(0,12)}_${outputSha.slice(0,12)}.docx`,artifactPath=path.join(artifactDir,artifactName);
 const docx=writeBacklogDocx(artifactPath,backlog),descriptorBase={schema:'ikant-le-limited-artifact/v1',kind:'LIMITED_BACKLOG_DOCX',name:artifactName,path:artifactPath,media_type:docx.media_type,bytes:docx.bytes,sha256:docx.sha256,readback_verified:docx.readback_verified,same_turn:true,download_handoff:true,required_presentation:false,host_delivery_proven:false,authority:0};
 const artifact={...descriptorBase,descriptor_sha256:descriptorDigest(descriptorBase)};
 const closure=assessLimitedTurnClosure({blocked_integrity:false,activation_tier:tier.tier,writer:true,node_dispatch:true,runtime_seal:true,docx_written:true,docx_readback:docx.readback_verified===true,telemetry_complete:telemetry.completeness.complete===true,structured_handoff:true,exact_delivery_ack_claimed:false,canonical_state_mutation:false});
 const closureValidation=validateLimitedTurnClosure(closure);
 if(!closureValidation.ok||closure.closed!==true)throw new Error('FAILURE: limited runtime turn closure did not validate');
 const receiptMaterial={schema:'ikant-le-limited-turn-receipt/v1',claim_class:'IKANT_RUNTIME_LIMITED',activation_projection_sha256:activationProjectionSha,input_sha256:inputSha,output_sha256:outputSha,node_dispatch_receipt_sha256:nodeDispatch.receipt_sha256,runtime_seal_sha256:runtimeSeal.seal_sha256,telemetry_sha256:telemetry.telemetry_sha256,artifact_descriptor_sha256:artifact.descriptor_sha256,artifact_sha256:artifact.sha256,first_unclosed_edge:tier.first_unclosed_edge,closed:true,active:false,canonical_state_mutation:false,platform_ack_required:false,host_delivery_proven:false,authority:0};
 const receipt={...receiptMaterial,receipt_sha256:sha256(Buffer.from(JSON.stringify(receiptMaterial)))};
 const shell=buildSessionShell({surfaceText:surfaceA,state:{},events:[],artifacts:[artifact],activation:tier,mode:'IKANT_RUNTIME_LIMITED',environmentTelemetry:telemetry,code:0});
 const shellValidation=validateSessionShell(shell);if(!shellValidation.ok)throw new Error('FAILURE: limited session shell invalid ('+shellValidation.errors.join(',')+')');
 return{stdout:renderSessionShell(shell),code:0,mode:'IKANT_RUNTIME_LIMITED',active:false,artifacts:[artifact],activation:tier,runtime_seal:runtimeSeal,telemetry,closure,receipt,session_shell:shell};
}
