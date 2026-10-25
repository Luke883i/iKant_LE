import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync,execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {selectC72V2Mode,validateC72V2Accepted,
 validateC72V2Orientation,validateC72V2ModeSelection}
 from '../host/c72-public-mode-admission.mjs';
import {runC72SelectedHostIngress} from '../host/project-c72-physical-ingress.mjs';
import {startOneShellEdu,renderOneShell} from '../host/project-oneshell-edu.mjs';
import {oneShellMaterialized} from '../host/project-oneshell-phases.mjs';
import {emitVerifiedHostOneShell} from '../host/project-oneshell-emission.mjs';
import {makeC135AcknowledgedDraft} from '../host/project-oneshell-language-ack.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const git=(...args)=>execFileSync('git',args,{cwd:root,encoding:'utf8'}).trim();
const SHA=b=>createHash('sha256').update(b).digest('hex');
const required=['README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md'];

test('PR HEAD original owner chain: linked C72 -> later EDU -> full manual ZIP -> Node loader -> C135/C87/C125/S03 -> canonical verified logo',async()=>{
 const head=git('rev-parse','HEAD'),tree=git('rev-parse','HEAD^{tree}');
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ikant-171-complete-'));
 const zip=path.join(tmp,'repo.zip'),api=path.join(tmp,'api-tree.json'),
  plan=path.join(tmp,'plan.json'),source=path.join(tmp,'source');
 let session=null;
 const run=(cmd,args)=>spawnSync(cmd,args,{cwd:root,encoding:'utf8',timeout:90000,maxBuffer:3_000_000});
 try{
  // The first-turn witness is a CHECKOUT FIXTURE, not native GitHub ingress.
  // The Host packet is physically assembled from five actual PR-head Git blobs,
  // then passed through the existing Host adapter to the original C72 owner.
  const originalDocs=required.map(p=>({path:p,source_head:head,
    blob_sha1:git('rev-parse','HEAD:'+p),
    content:execFileSync('git',['show','HEAD:'+p],{cwd:root,encoding:'utf8'})}));
  const witness={source_head:head,host_link_displayed:true,
    distinct_human_message_observed:true,
    terms_link:'https://github.com/Luke883i/iKant_LE/blob/'+head+'/TERMS.md',
    pinned_blob_shas:Object.fromEntries(originalDocs.map(d=>[d.path,d.blob_sha1]))};
  const packet={schema:'ikant-host-c72-source-packet/v1',source_head:head,live_head:head,
    carrier_kind:'HOST_OPAQUE_TRANSFER',source_origin_attested:false,
    native_event_attested:false,documents:originalDocs};
  const admission=await runC72SelectedHostIngress({
    humanMessage:'I ACCEPT',freshHumanTurn:true,priorTurnEvidence:witness,
    carrier:'AUTO',sourcePacket:packet,ownerOutcome:'NOT_INVOKED'});
  assert.equal(admission.ok,true,JSON.stringify(admission));
  assert.equal(admission.host_carrier_selected,'HOST_SOURCE_PACKET');
  assert.equal(admission.original_owner_invoked,true);
  assert.equal(admission.provider_source_event_attested,false);
  const accepted=admission.accepted,introduction=admission.introduction;
  assert(validateC72V2Accepted(accepted));
  assert(validateC72V2Orientation(introduction,accepted));
  assert.equal(accepted.terms_digest,SHA(fs.readFileSync(path.join(root,'TERMS.md'))));
  const selection=selectC72V2Mode({accepted,orientation:introduction,humanMessage:'EDU'});
  assert(validateC72V2ModeSelection(selection,{mode:'EDU',sourceHead:head}));
  assert.equal(selection.selected_mode,'EDU');
  const artifact=run('git',['archive','--format=zip','--prefix=iKant_LE-'+head+'/','-o',zip,'HEAD']);
  assert.equal(artifact.status,0,artifact.stderr);
  const rows=execFileSync('git',['ls-tree','-r','-t','-z','HEAD'],{cwd:root})
   .toString('utf8').split('\\0').filter(Boolean).map(x=>{
    const t=x.indexOf('\\t'),[mode,type,sha]=x.slice(0,t).split(' ');
    assert(t>0);return {path:x.slice(t+1),mode,type,sha};
   });
  fs.writeFileSync(api,JSON.stringify({source_head:head,source_tree:tree,
   live_head:head,truncated:false,tree:rows}));
  const extraction=run('python3',['scripts/project-manual-source.py',
   '--source-zip',zip,'--api-tree',api,'--head',head,'--tree',tree,'--output-plan',plan]);
  assert.equal(extraction.status,0,extraction.stderr+extraction.stdout);
  const extracted=JSON.parse(fs.readFileSync(plan,'utf8'));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'contracts/project-session-source.json'),'utf8'));
  assert.deepEqual(new Set(extracted.files.map(x=>x.path)),
   new Set([...manifest.paths,'contracts/project-session-source.json']));
  const loader=run(process.execPath,['scripts/project-repo-loader.mjs',plan,source,head,tree]);
  assert.equal(loader.status,0,loader.stderr+loader.stdout);
  const readback=JSON.parse(fs.readFileSync(path.join(source,'.project-source-readback.json'),'utf8'));
  assert.equal(readback.source_head,head);assert.equal(readback.source_tree,tree);
  for(const p of [...required,'assets/brand/ikant-light.svg',
    'plugins/ikant-le-session-chat/assets/ikant-light.svg','host/c135-edu-v2-owner.mjs']){
   assert(fs.readFileSync(path.join(source,p)).equals(fs.readFileSync(path.join(root,p))));
  }
  const materialized=oneShellMaterialized({selection,sourceRoot:source,head,tree});
  assert.equal(materialized.slots.NEXT,'START_C135_EDU');
  const sent=[];
  session=await startOneShellEdu({selection,sourceRoot:source,
   sourceBinding:{head,tree},privateParent:tmp,
   afterAcceptWitness:{accepted:true,scope:'HOST_WITNESSED_ONLY'},
   languagePort:async task=>makeC135AcknowledgedDraft(task,
    'Risposta EDU locale verificata: prove separate dalle ipotesi.')});
  assert.equal(session.ok,true,JSON.stringify(session));
  assert.equal(session.frame.slots.NEXT,'AWAIT_HUMAN_INPUT');
  const current=await session.publishTurn({
   humanInput:'Spiega come verificare una fonte.',
   nonce:'complete-chain-171-nonce-0001',
   priorMessages:[],resetContext:true
  });
  assert.equal(current.voice_origin,'HOST_BOUND_LOCAL',JSON.stringify(current));
  assert.match(current.slots.A,/Risposta EDU locale verificata/);
  assert.deepEqual(current.slot_order,['ESITO','A','B','PROVA','EDGE','NEXT']);
  assert(renderOneShell(current).includes(current.slots.A));
  const evidence=session.getLastEvidence();
  assert.equal(evidence.original_c87_readback.count,1);
  assert.equal(evidence.native_delivery_attested,false);
  assert.equal(SHA(evidence.original_c125_utf8),evidence.original_c125_sha256);
  const visual=emitVerifiedHostOneShell(current,{format:'HTML'});
  assert.equal(visual.ok,true,JSON.stringify(visual));
  const logo=fs.readFileSync(path.join(source,'assets/brand/ikant-light.svg'),'utf8');
  assert.equal(visual.brand_sha256,SHA(Buffer.from(logo)));
  assert(visual.html.indexOf('class="ikant-brand-mark"')>=0);
  assert(visual.html.indexOf('class="ikant-brand-mark"')<visual.html.indexOf('<strong>iKant · OneShell</strong>'));
  assert.equal((visual.html.match(/data-slot=/g)||[]).length,6);
  assert.equal(visual.native_delivery_attested,false);
  const replay=await session.publishTurn({humanInput:'ripeti',nonce:'complete-chain-171-nonce-0001',
   priorMessages:[],resetContext:true});
  assert.equal(replay.slots.A,'NO_VOICE');
  assert.equal(session.readSessionState().original_c87_readback.count,1);
  console.log('PR171_ORIGINAL_EDU_CHAIN_LOCAL_PASS',JSON.stringify({
   source_head:head,source_tree:tree,manifest_members:extracted.files.length,
   c72_original_receipts_verified:true,host_adapter_auto_packet_executed:true,edu_original_selection_verified:true,
   manual_full_repo_archive_node_materialized:true,c135_original_owner_started:true,
   original_c87_readback_count:1,c125_sha256:evidence.original_c125_sha256,
   logo_sha256:visual.brand_sha256,logo_rendered_before_title:true,
   native_provider_ingress_attested:false,native_delivery_attested:false,product_go:false
  }));
 }finally{session?.close();fs.rmSync(tmp,{recursive:true,force:true})}
});
