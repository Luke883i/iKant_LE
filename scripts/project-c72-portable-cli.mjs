#!/usr/bin/env node
/** One-shot physical stdin bridge for a Host that can move GitHub bytes to Node.
 * This is NOT a native ChatGPT provider hook. Never auto-retry UNKNOWN.
 */
import {executeC72PostAcceptRecovery} from '../host/project-c72-host-recovery.mjs';
let raw='';
try{
 for await(const chunk of process.stdin){
  raw+=chunk.toString('utf8');
  if(Buffer.byteLength(raw,'utf8')>750000)throw Error('C72_PORT_STDIN_BOUNDS');
 }
 const p=JSON.parse(raw);
 if(p?.schema!=='ikant-host-c72-port-request/v1'||p?.humanMessage!=='I ACCEPT'||
  p?.freshHumanTurn!==true||!p?.priorTurnEvidence||
  !p?.sourcePacket||p?.ownerOutcome&&p.ownerOutcome!=='NOT_INVOKED')
  throw Error('C72_PORT_REQUEST_INVALID');
 const r=await executeC72PostAcceptRecovery({
  humanMessage:p.humanMessage,freshHumanTurn:p.freshHumanTurn,
  priorTurnEvidence:p.priorTurnEvidence,sourcePacket:p.sourcePacket,
  ownerOutcome:'NOT_INVOKED'});
 process.stdout.write(JSON.stringify(r)+'\n');
 if(r.ok!==true)process.exitCode=2;
}catch(e){
 process.stdout.write(JSON.stringify({ok:false,kind:'STOP',
  edge:String(e.message||'C72_PORT_UNKNOWN').replace(/[^A-Z0-9_]/g,'').slice(0,90),
  original_owner_invoked:false,authority:0,native_event_attested:false})+'\n');
 process.exitCode=2;
}
