import test from 'node:test';
import assert from 'node:assert/strict';
import {PassThrough} from 'node:stream';
import {runOneZipOriginalAdmission} from '../scripts/project-edu-onezip-admission.mjs';
import {runOneZipOriginalTurn} from '../scripts/project-edu-onezip-session.mjs';
import {createOneShellLanguageStdio} from '../scripts/project-edu-language-stdio.mjs';

test('no original C72 owner without real prior witnessed consent and verified source',async()=>{
 const r=await runOneZipOriginalAdmission({schema:'ikant-edu-onezip-admission/v1',action:'ACCEPT',
  humanMessage:'I ACCEPT',humanTurnWitnessed:false,ownerOutcome:'NOT_INVOKED'});
 assert.equal(r.ok,false);assert.equal(r.original_owner_invoked,false);assert.equal(r.active,false);
});
test('no C135 when current distinct human turn and source are unbound',async()=>{
 const r=await runOneZipOriginalTurn({schema:'ikant-edu-onezip-turn/v1',humanTurnWitnessed:false});
 assert.equal(r.ok,false);assert.equal(r.voice,'NO_VOICE');
});
test('correlated Host language port passes exact answer and ACK unchanged',async()=>{
 const input=new PassThrough(),output=new PassThrough();
 let text='';output.on('data',b=>{text+=b.toString('utf8');const i=text.indexOf('\n');if(i>=0){
  const q=JSON.parse(text.slice(0,i));input.write(JSON.stringify({schema:'ikant-edu-host-language-reply/v1',
   task_id:q.task_id,text:'Test originale',required_ack:{plan:'p'}})+'\n');}});
 const port=createOneShellLanguageStdio({input,output});
 const response=await port({schema:'original-owner-task',required_ack:{plan:'p'}});
 assert.deepEqual(response,{text:'Test originale',required_ack:{plan:'p'}});input.end();
});
test('Host cannot correlate a forged reply to C135',async()=>{
 const input=new PassThrough(),output=new PassThrough();
 output.once('data',()=>input.write(JSON.stringify({schema:'ikant-edu-host-language-reply/v1',
  task_id:'wrong',text:'spoofed'})+'\n'));
 const port=createOneShellLanguageStdio({input,output});
 await assert.rejects(port({schema:'owner-task'}),/CORRELATION/);input.end();
});
