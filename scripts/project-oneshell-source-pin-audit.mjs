#!/usr/bin/env node
/** Scans executable source for PR-based runtime pins, NOT historical PR mentions. */
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dirs=['host','scripts','src','contracts','plugins'],files=[];
for(const name of dirs){const root=path.join(ROOT,name);if(!fs.existsSync(root))continue;
 function visit(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){
  if(e.isSymbolicLink())continue;const p=path.join(d,e.name);
  if(e.isDirectory())visit(p);else if(/\.(?:mjs|js|json|py|txt)$/i.test(e.name))files.push(p);
 }}visit(root);
}
const forbidden=/refs\/pull\/\d+|archive\/refs\/pull\/\d+|raw\.githubusercontent\.com\/Luke883i\/iKant_LE\/(?:pull|refs\/pull)\/\d+|github\.com\/Luke883i\/iKant_LE\/(?:tree|blob)\/refs\/pull\/\d+/giu;
const findings=[];let legacyMentions=0;
for(const p of files){const s=fs.readFileSync(p,'utf8'),relative=path.relative(ROOT,p).replaceAll(path.sep,'/');
 if(/\bPR\s?#?\d+|\/pull\/\d+/i.test(s))legacyMentions++;
 for(const m of s.matchAll(forbidden))findings.push({path:relative,match:m[0]});
}
const boot=JSON.parse(fs.readFileSync(path.join(ROOT,'BOOTSTRAP.json'),'utf8'));
const contract=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/project-oneshell-cx-humanist.json'),'utf8'));
const errors=[];
if(boot.canonical_branch!=='main'||boot.canonical_repository!=='Luke883i/iKant_LE')errors.push('CANONICAL_SOURCE_NOT_MAIN');
if(boot.project_session?.postaccept_onezip_fallback?.source_epoch!=='FROZEN_COMMIT_UNTIL_NEW_SESSION')errors.push('ONEZIP_SESSION_EPOCH_INVALID');
if(contract.source_policy!=='MAIN_COMMIT_FROZEN_FOR_SESSION_NOT_A_PR_REF')errors.push('HUMANIST_SOURCE_POLICY_INVALID');
if(findings.length)errors.push('EXECUTABLE_PR_PIN_OBSERVED');
const report={schema:'ikant-le-shell-main-pin-audit/v1',scope:dirs,files_checked:files.length,
 historical_pr_mentions_files:legacyMentions,pr_runtime_ref_findings:findings,errors,
 main_is_repository_of_record:true,session_is_immutable_main_commit:true,
 historical_PR_dependencies_are_not_proven_source_pins:true,
 all_external_apps_or_native_project_installation_scanned:false,
 status:errors.length?'STOP':'PASS',active:false};
console.log(JSON.stringify(report,null,2));if(errors.length)process.exitCode=1;
