/** Read-only lexical call-site census. Not a runtime reachability proof. */
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const rx=/\b(import\s*\(|require\s*\(|import\.meta\.resolve\s*\(|execFile(?:Sync)?\s*\(|spawn(?:Sync)?\s*\(|fork\s*\(|new\s+Worker\s*\(|eval\s*\(|Function\s*\()/gu;
const digest=x=>createHash('sha256').update(x).digest('hex');
function expressionAt(src,pos){let i=pos,depth=1,quote='',escaped=false;for(;i<src.length&&i<pos+800;i++){let c=src[i];if(quote){if(escaped)escaped=false;else if(c==='\\')escaped=true;else if(c===quote)quote='';continue;}if(c==='"'||c===String.fromCharCode(39)||c===String.fromCharCode(96)){quote=c;continue;}if(c==='(')depth++;else if(c===')'&&--depth===0)break;}return src.slice(pos,i).trim();}
export function scanCallsites(source,file){const out=[];rx.lastIndex=0;for(const m of source.matchAll(rx)){const start=m.index+m[0].length,expr=expressionAt(source,start),literal=/^(['"])([^'"\r\n]+)\1$/u.exec(expr);const line=source.slice(0,m.index).split('\n').length;out.push({path:file,line,kind:m[0].trim().replace(/\s+/gu,' '),expression:expr.slice(0,180),target:literal?.[2]||null,qualification:literal?'LITERAL':'DYNAMIC_TARGET_UNKNOWN'});}return out;}
export function censusRepo(repo){const paths=execFileSync('git',['ls-files','-z'],{cwd:repo}).toString('utf8').split('\0').filter(Boolean).sort();const result=[];let parsed=0;for(const p of paths){if(!/\.(?:mjs|js|cjs|ts|mts)$/u.test(p))continue;const f=path.join(repo,p);const st=fs.lstatSync(f);if(!st.isFile()||st.isSymbolicLink())throw Error('SOURCE_FILE_UNSAFE:'+p);const src=fs.readFileSync(f,'utf8');parsed++;result.push(...scanCallsites(src,p));}const unknown=result.filter(x=>x.qualification==='DYNAMIC_TARGET_UNKNOWN');return {schema:'ikant-host-callsite-census/v1',authority:0,epistemic_status:'SOURCE_LEXICAL_CENSUS_NOT_RUNTIME_REACHABILITY',tracked_file_count:paths.length,js_files_parsed:parsed,callsite_count:result.length,unknown_target_count:unknown.length,source_sha256:digest(paths.join('\n')),callsites:result};}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){try{process.stdout.write(JSON.stringify(censusRepo(process.argv[2]?path.resolve(process.argv[2]):root),null,2)+'\n');}catch(e){console.error(String(e?.message||e));process.exitCode=1;}}
