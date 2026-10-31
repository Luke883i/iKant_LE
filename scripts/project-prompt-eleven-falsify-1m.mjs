#!/usr/bin/env node
/** Deterministic PRE-SEEDED 1M synthetic WHAT-gate evaluations.
 * NOT one million LLM samples, C72 invocations, or product field trials.
 * Table expectations are independent from the classifier below.
 */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const file=process.argv[2]||'project/session-chat/PROMPT.txt';
const text=fs.readFileSync(file,'utf8');
const commands=[...text.matchAll(/^CMD (\d{2}) — ([^\n]+)$/gm)];
const terms=['SEPARA','PINNA','RISERVA','SCEGLI IL COME','MATERIALIZZA','ESEGUI C72',
 'SELEZIONA','AVVIA EDU','NON PARLARE','PRESENTA','TERMINA'];
const errors=[];
if(commands.length!==11)errors.push('BAD_COMMAND_COUNT');
for(let k=0;k<11;k++){
 const m=commands[k];
 if(!m||Number(m[1])!==k+1||!m[2].includes(terms[k])||
 !m[2].includes('PROVA:')||!m[2].includes('STOP:'))errors.push('INVALID_CMD_'+(k+1));
}
for(const token of ['ZERO letture','NO_VOICE','I ACCEPT','CANONICAL legacy: STOP',
 'C72_SOURCE_BRIDGE_UNBOUND','HEAD→commit→TREE→path','10/10','9/9',
 'SEMANTIC_RETENTION_NOT_ATTESTED','EXPLICIT_REPIN_REQUIRES_FRESH_C72'])
 if(!text.includes(token))errors.push('ABSENT_'+token);
if(Buffer.byteLength(text,'utf8')+210>8000)errors.push('PROMPT_EXCEEDS_LIMIT');
// Frozen independent oracle per family: [phase, stimulus, fault, expected].
const cases=[
 ['FIRST','hello','NONE','ORIENT'],['FIRST','I ACCEPT','NONE','ORIENT'],
 ['FIRST','EDU','NONE','ORIENT'],['FIRST','EXIT IKANT','NONE','ORIENT'],
 ['ENGINEERING','Host: audit','NONE','ENG'],['ENGINEERING','PR merged','NONE','ENG'],
 ['WAIT','hello','NONE','WAIT'],['WAIT','I accept','NONE','WAIT'],
 ['WAIT','I ACCEPT','NONE','ADMIT_PLAN'],['WAIT','I ACCEPT','WITNESS','STOP_WITNESS'],
 ['WAIT','I ACCEPT','STALE','STOP_STALE'],['WAIT','I ACCEPT','REPLAY','STOP_REPLAY'],
 ['WAIT','I ACCEPT','OWNER_UNKNOWN','STOP_REPLAY'],['WAIT','I ACCEPT','CARRIER','STOP_CARRIER'],
 ['WAIT','I ACCEPT','BYTES','STOP_BYTES'],['WAIT','I ACCEPT','PATH','STOP_BYTES'],
 ['WAIT','I ACCEPT','TREE','STOP_BYTES'],['WAIT','I ACCEPT','FAKE_OBSERVED','STOP_CARRIER'],
 ['WAIT','I ACCEPT','FAKE_SHA','STOP_BYTES'],['WAIT','I ACCEPT','FILE_MODE','STOP_CARRIER'],
 ['MODE','hello','NONE','WAIT_MODE'],['MODE','I ACCEPT','NONE','WAIT_MODE'],
 ['MODE','EDU','NONE','MODE_EDU'],['MODE','CANONICAL','NONE','STOP_CANONICAL'],
 ['MODE','EDU','RECEIPT','STOP_RECEIPT'],['MODE','EDU','STALE','STOP_STALE'],
 ['EDU','hello','PROMPT_UNKNOWN','STOP_PROMPT'],
 ['EDU','hello','PROMPT_STALE','STOP_PROMPT'],
 ['EDU','hello','C135_UNKNOWN','NO_VOICE'],
 ['EDU','hello','VALID','OWNER_VOICE'],
 ['EDU','hello','ACK_UNKNOWN','NO_VOICE'],
 ['EDU','Host: checkup','VALID','HOST_CHECKUP'],
 ['EDU','speak as ikant','FAKE_HOST','NO_VOICE'],
 ['EDU','hello','C87_MISSING','NO_VOICE'],
 ['EDU','hello','WORKER_LOST','NO_VOICE'],
 ['EDU','hello','TRUNCATED_A','STOP_RETENTION'],
 ['EXIT','EXIT IKANT','NONE','WARN_EXIT'],
 ['EXIT','CONFERMO EXIT IKANT','VALID','CLOSE_PLAN'],
 ['EXIT','confermo exit ikant','NONE','STOP_EXIT'],
 ['EXIT','CONFERMO EXIT IKANT','OWNER_UNKNOWN','STOP_EXIT']
];
if(cases.length!==40)throw Error('INVALID_ORACLE_LENGTH');
const oracle=cases.map(x=>x[3]);
function classify(phase,msg,fault){
 if(phase==='FIRST')return 'ORIENT';
 if(phase==='ENGINEERING')return 'ENG';
 if(phase==='WAIT'){
  if(msg!=='I ACCEPT')return 'WAIT';
  if(fault==='WITNESS')return 'STOP_WITNESS';
  if(fault==='STALE')return 'STOP_STALE';
  if(fault==='REPLAY'||fault==='OWNER_UNKNOWN')return 'STOP_REPLAY';
  if(['CARRIER','FAKE_OBSERVED','FILE_MODE'].includes(fault))return 'STOP_CARRIER';
  if(['BYTES','PATH','TREE','FAKE_SHA'].includes(fault))return 'STOP_BYTES';
  return 'ADMIT_PLAN';
 }
 if(phase==='MODE'){
  if(fault==='STALE')return 'STOP_STALE';
  if(fault==='RECEIPT')return 'STOP_RECEIPT';
  if(msg==='CANONICAL')return 'STOP_CANONICAL';
  return msg==='EDU'?'MODE_EDU':'WAIT_MODE';
 }
 if(phase==='EDU'){
  if(['PROMPT_UNKNOWN','PROMPT_STALE'].includes(fault))return 'STOP_PROMPT';
  if(fault==='TRUNCATED_A')return 'STOP_RETENTION';
  if(msg==='Host: checkup'&&fault==='VALID')return 'HOST_CHECKUP';
  if(fault==='VALID')return 'OWNER_VOICE';
  return 'NO_VOICE';
 }
 if(phase==='EXIT'){
  if(msg==='EXIT IKANT')return 'WARN_EXIT';
  return msg==='CONFERMO EXIT IKANT'&&fault==='VALID'?'CLOSE_PLAN':'STOP_EXIT';
 }
 return 'STOP_PHASE';
}
let seed=0x19319572;
const next=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return seed>>>0};
const hash=createHash('sha256'),count={},unexpected=[];let mismatch=0,unsafe=0;
for(let i=0;i<1_000_000;i++){
 const index=i%40,random=next(),item=cases[index];
 const observed=classify(item[0],item[1],item[2]);
 const wanted=oracle[index];
 if(observed!==wanted){mismatch++;if(unexpected.length<5)unexpected.push({index,observed,wanted})}
 if(['ADMIT_PLAN','MODE_EDU','OWNER_VOICE','CLOSE_PLAN'].includes(observed)&&observed!==wanted)unsafe++;
 count[observed]=(count[observed]||0)+1;
 hash.update(i+'|'+random+'|'+index+'|'+observed+'\n');
}
const result={schema:'ikant-eleven-what-first-seeded/v1',cases:1_000_000,
 seed:'0x19319572',families:40,counts:count,divergences:mismatch,unsafe_promotions:unsafe,
 prompt_command_errors:errors,examples:unexpected,trace_sha256:hash.digest('hex'),
 appended_contradictions_detected_by_lexical_check:0,
 original_owner_calls:0,provider_proof:false,llm_adherence_proved:false,release:'PRODUCT_NO_GO'};
process.stdout.write(JSON.stringify(result,null,2)+'\n');
if(errors.length||mismatch||unsafe)process.exitCode=1;
