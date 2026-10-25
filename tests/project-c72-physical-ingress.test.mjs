import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateC72V2Accepted,validateC72V2Orientation} from '../host/c72-public-mode-admission.mjs';
import {createC72NodeGithubCallbacks,runC72SelectedHostIngress} from '../host/project-c72-physical-ingress.mjs';
const head=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const names=['README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md'];
const docs=names.map(path=>({path,source_head:head,
 blob_sha1:execFileSync('git',['rev-parse','HEAD:'+path],{encoding:'utf8'}).trim(),
 content:execFileSync('git',['show','HEAD:'+path],{encoding:'utf8'})}));
const witness=()=>({source_head:head,host_link_displayed:true,
 distinct_human_message_observed:true,
 terms_link:'https://github.com/Luke883i/iKant_LE/blob/'+head+'/TERMS.md',
 pinned_blob_shas:Object.fromEntries(docs.map(x=>[x.path,x.blob_sha1]))});
const packet=()=>({schema:'ikant-host-c72-source-packet/v1',source_head:head,
 live_head:head,carrier_kind:'HOST_OPAQUE_TRANSFER',
 source_origin_attested:false,native_event_attested:false,documents:structuredClone(docs)});
const getJSON=({tamper=null,calls=[]}={})=>async path=>{
 calls.push(path);
 if(path==='/repos/Luke883i/iKant_LE/git/ref/heads/main')
  return {ref:'refs/heads/main',object:{type:'commit',sha:head}};
 const m=path.match(/^\/repos\/Luke883i\/iKant_LE\/contents\/(README\.md|BOOTSTRAP\.json|ADMISSION\.json|AGENTS\.md|TERMS\.md)\?ref=([a-f0-9]{40})$/);
 if(!m||m[2]!==head)throw Error('C72_TEST_REQUEST_UNEXPECTED');
 const d=docs.find(x=>x.path===m[1]);
 const content=Buffer.from(d.content,'utf8');
 let response={type:'file',path:d.path,sha:d.blob_sha1,size:content.length,
  encoding:'base64',content:content.toString('base64').replace(/.{64}/g,'$&\n')};
 if(tamper&&d.path===tamper.path)response={...response,...tamper.set};
 return response;
};
const inp=()=>({humanMessage:'I ACCEPT',freshHumanTurn:true,priorTurnEvidence:witness()});
test('three carrier paths use one unchanged C72 original owner',async()=>{
 const calls=[];
 const r=await runC72SelectedHostIngress({...inp(),carrier:'NODE_GITHUB_API',getGithubJSON:getJSON({calls})});
 assert.equal(r.ok,true,JSON.stringify(r));
 assert.equal(r.host_carrier_selected,'NODE_GITHUB_API');
 assert.equal(calls.length,6);assert(calls[0].endsWith('/git/ref/heads/main'));
 assert(validateC72V2Accepted(r.accepted));
 assert(validateC72V2Orientation(r.introduction,r.accepted));
 assert.equal(r.original_owner_invoked,true);
 assert.equal(r.provider_source_event_attested,false);
 assert.equal(r.native_delivery_attested,false);
 const packetR=await runC72SelectedHostIngress({...inp(),carrier:'HOST_SOURCE_PACKET',sourcePacket:packet()});
 assert.equal(packetR.ok,true);assert(validateC72V2Accepted(packetR.accepted));
 const callbacks=await runC72SelectedHostIngress({...inp(),carrier:'HOST_CALLBACKS',
  readMain:async()=>head,readPinnedDocument:async p=>docs.find(d=>d.path===p)});
 assert.equal(callbacks.ok,true);assert(validateC72V2Orientation(callbacks.introduction,callbacks.accepted));
});
test('Host cannot infer network, trigger early reads, or retry an unknown owner',async()=>{
 const calls=[];
 const adapter=getJSON({calls});
 assert.equal((await runC72SelectedHostIngress({...inp(),carrier:'NODE_GITHUB_API',
  humanMessage:'EDU',getGithubJSON:adapter})).edge,'C72_EXACT_NEW_CONSENT_REQUIRED');
 assert.equal((await runC72SelectedHostIngress({...inp(),carrier:'NODE_GITHUB_API',
  ownerOutcome:'UNKNOWN',getGithubJSON:adapter})).edge,'C72_OWNER_OUTCOME_UNKNOWN');
 assert.equal((await runC72SelectedHostIngress({...inp(),carrier:'UNBOUND'})).edge,'C72_SOURCE_BRIDGE_UNBOUND');
 assert.equal((await runC72SelectedHostIngress({...inp(),carrier:'NODE_GITHUB_API',
  sourcePacket:packet(),getGithubJSON:adapter})).edge,'C72_HOST_PORT_AMBIGUOUS');
 assert.equal(calls.length,0);
});
test('REST response path, size, SHA, encoding and bytes are separately checked',async()=>{
 for(const set of [{sha:'0'.repeat(40)},{path:'AGENTS.md'},{encoding:'utf8'},
  {size:999},{content:'not_base64#'},{content:'YWJjZA=='}]){
  const r=await runC72SelectedHostIngress({...inp(),carrier:'NODE_GITHUB_API',
   getGithubJSON:getJSON({tamper:{path:'README.md',set}})});
  assert.equal(r.ok,false,JSON.stringify({set,r}));
  assert.equal(r.original_owner_invoked,false);
  assert.match(r.edge,/^C72_(PINNED_DOCUMENT_BLOB_INVALID|SOURCE_READ_OUTCOME_UNKNOWN):README\.md$/);
 }
});
test('Node request rejection and stale HEAD never reach original owner',async()=>{
 const a=createC72NodeGithubCallbacks({sourceHead:head,getJSON:getJSON()});
 await assert.rejects(()=>a.readPinnedDocument('../secret',head),/REQUEST_DENIED/);
 await assert.rejects(()=>a.readPinnedDocument('README.md','0'.repeat(40)),/REQUEST_DENIED/);
 const r=await runC72SelectedHostIngress({...inp(),carrier:'NODE_GITHUB_API',
  getGithubJSON:async path=>path.endsWith('/git/ref/heads/main')?
   {ref:'refs/heads/main',object:{sha:'f'.repeat(40),type:'commit'}}:null});
 assert.equal(r.edge,'STOP_SOURCE_LOCK_STALE');
 assert.equal(r.original_owner_invoked,false);
});
test('10k preaccept/no-capability adversaries cause zero I/O or original invocation',async()=>{
 let touched=0;
 const fetch=async()=>{touched++;throw Error('must never fetch');};
 for(let i=0;i<10000;i++){
  const message=['EDU','I ACCEPT ','CANONICAL','x','','exit','I accept','I ACCEPT\n','0','I ACCEPT'][i%10];
  const fresh=i%7===0?false:true;
  const outcome=i%13===0?'UNKNOWN':'NOT_INVOKED';
  const carrier=i%5===0?'UNBOUND':'NODE_GITHUB_API';
  if(message==='I ACCEPT'&&fresh&&outcome==='NOT_INVOKED'&&carrier==='NODE_GITHUB_API')continue;
  const r=await runC72SelectedHostIngress({...inp(),humanMessage:message,freshHumanTurn:fresh,
    carrier,ownerOutcome:outcome,getGithubJSON:fetch});
  assert.equal(r.ok,false);assert.equal(r.original_owner_invoked,false);
 }
 assert.equal(touched,0);
});
