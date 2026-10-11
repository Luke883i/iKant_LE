import fs from 'node:fs';
import {executeC101LocalCohostMachine,verifyC101Readback} from '../host/c101-local-cohost-machine.mjs';
// Host must supply genuine C72 selection and actual current user input by
// stdin. This CLI is not a ChatGPT host hook or acceptance origin witness.
try{
 const source=fs.readFileSync(0);
 if(source.length>90000)throw Error('C101_CLI_ENVELOPE_TOO_LARGE');
 const input=JSON.parse(source.toString('utf8'));
 const r=executeC101LocalCohostMachine(input);
 const check=r.status==='C101_LOCAL_MACHINE_VOICE_READY_NOT_NATIVE_DELIVERED'?
   verifyC101Readback(r,input):{ok:false,first_unclosed_edge:r.first_unclosed_edge};
 process.stdout.write(JSON.stringify({receipt:r,readback:check})+'\n');
 if(!check.ok)process.exitCode=2;
}catch(e){
 process.stdout.write(JSON.stringify({schema:'ikant-le-c101-cli/v1',
  status:'C101_STOP',first_unclosed_edge:'C101_CLI_INPUT_OR_EXECUTION',
  active:false,authority:0})+'\n');process.exitCode=2;
}
