/** C128 retrospective audit: ALL PRs / every graph-addressable semantic commit.
 * Run with git checkout --fetch-depth=0, no API token, no claims about unmerged code.
 * Output is an evidence inventory, not a normative or current runtime owner.
 */
import fs from 'node:fs';
import cp from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rows=JSON.parse(fs.readFileSync(path.join(ROOT,'contracts/c128-pr-census.json'),'utf8')).records;
const git=(...args)=>cp.execFileSync('git',args,{cwd:ROOT,encoding:'utf8',maxBuffer:32_000_000}).trim();
const cat=(p)=>p.startsWith('src/')?'COGNITIVE_ORIGINAL':
 p.startsWith('host/')?'HOST_RUNTIME':p.startsWith('tests/')?'TEST':
 p.startsWith('scripts/')?'BUILD_OR_ORACLE':p.startsWith('.github/')?'CI':
 p.startsWith('contracts/')?'CONTRACT':p.startsWith('docs/')||p==='README.md'||p==='TERMS.md'||p==='AGENTS.md'?'DOCUMENT_OR_ADMISSION':
 p.startsWith('project/')?'PROJECT_ADAPTER':'OTHER';
const FLAG=/\b(fix|hardening|falsif|attest|guard|closure|consent|retry|postwrite|receipt|drift|timeout|provenance)\b/i;
const audit=[];
let mergeCount=0,withParents=0,totalCommits=0,unresolved=[],fileTouch={};
for(const p of rows){
 const rec={pr:p.pr,title:p.title,merged_at:p.merged_at,merge_sha:p.merge_commit_sha,
  state:p.merged_at?'MERGED':'UNMERGED_NOT_MAIN',commit_count:0,commits:[],risk_labels:[],categories:{}};
 if(!p.merged_at){audit.push(rec);continue;}
 mergeCount++;
 try{
  const parents=git('rev-list','--parents','-n','1',p.merge_commit_sha).split(/\s+/);
  if(parents.length<3){rec.state='MERGED_NO_TWO_PARENT_COMMIT';unresolved.push(p.pr);audit.push(rec);continue;}
  withParents++;
  const list=git('rev-list','--reverse',parents[1]+'..'+parents[2]).split(/\n/).filter(Boolean);
  for(const sha of list){
   const subject=git('show','-s','--format=%s',sha);
   const files=git('diff-tree','--no-commit-id','--name-only','-r',sha).split(/\n/).filter(Boolean);
   const classes=[...new Set(files.map(cat))].sort();
   const labels=FLAG.test(subject)?['GUARD_OR_FIX']:['UNSCOPED_HISTORY'];
   if(files.some(f=>f==='TERMS.md'||f==='AGENTS.md'))labels.push('NORMATIVE_SOURCE_TOUCH');
   if(files.some(f=>/^(src|host)\//.test(f)))labels.push('EXECUTABLE_TOUCH');
   rec.commits.push({sha,subject,files,classes,labels});
   for(const x of classes){rec.categories[x]=(rec.categories[x]||0)+1;fileTouch[x]=(fileTouch[x]||0)+1}
   for(const x of labels)if(!rec.risk_labels.includes(x))rec.risk_labels.push(x);
  }
  rec.commit_count=list.length;totalCommits+=list.length;
  if(!list.length)rec.state='MERGED_NO_UNIQUE_BRANCH_COMMITS';
 }catch(e){rec.state='HISTORY_NOT_MATERIALIZED';unresolved.push(p.pr)}
 audit.push(rec);
}
const final={schema:'ikant-c128-pr-commit-graph-audit/v1',
 snapshot_main:'5675ff958160b0ba6dd16a3fc4856075e4be8d69',
 source:'GIT_TWO_PARENT_COMMIT_GRAPH_VERIFIED_IN_CI',prs:audit.length,merged:mergeCount,
 unmerged:audit.length-mergeCount,two_parent_merges:withParents,
 unique_pr_commit_occurrences:totalCommits,unresolved,semantic_commit_category_counts:fileTouch,
 records:audit,policy_only:false,real_llm_trials:0,certifies_native_chatgpt_hook:false};
const dest=process.argv[2]||'/tmp/ikant-c128-complete-pr-commit-audit.json';
fs.writeFileSync(dest,JSON.stringify(final,null,2)+'\n');
console.log(JSON.stringify({schema:final.schema,prs:final.prs,merged:final.merged,
 unmerged:final.unmerged,two_parent_merges:withParents,commit_occurrences:totalCommits,
 unresolved,category_counts:fileTouch,out:dest}));
if(final.prs!==127||final.merged!==119||unresolved.length)process.exitCode=1;
