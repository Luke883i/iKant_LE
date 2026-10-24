#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {C107_FILES} from './c107-pack.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const boot=JSON.parse(fs.readFileSync(path.join(root,'BOOTSTRAP.json'),'utf8'));
const roots=['README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md','stile_comunicativo.md',
 'host/c72-public-mode-admission.mjs','contracts/c72-public-mode-admission-v2.json',
 'host/s02-edu-versioned-consumer.mjs','host/c135-edu-v2-owner.mjs','host/c125-exclusive-shell.mjs',
 'host/project-session-capsule.mjs','host/project-oneshell-edu.mjs','host/project-oneshell-phases.mjs',
 'host/p1-postmode-source-handoff.mjs','scripts/project-manual-source.py',
 'scripts/project-session.mjs','scripts/project-repo-loader.mjs',
 'contracts/project-session-capsule.json','contracts/project-oneshell-do-d.json','contracts/project-oneshell-semantic-slides.json',
 'docs/PROJECT_SESSION_REPO_FIRST.md',
 boot.post_accept_fastboot.runtime_root.loader.path,...boot.post_accept_fastboot.remote_paths,
 ...boot.post_accept_fastboot.runtime_root.members.map(x=>x.path),...C107_FILES];
const seen=new Set(),missing=new Set();
function visit(p){
 if(seen.has(p))return;seen.add(p);const f=path.join(root,p);
 if(!fs.existsSync(f)){missing.add(p);return;}
 if(!fs.statSync(f).isFile()){seen.delete(p);return;}
 if(!p.endsWith('.mjs'))return;
 const text=fs.readFileSync(f,'utf8');
 for(const m of text.matchAll(/(?:from\s*|import\s*\(|new URL\s*\()\s*['"]([^'"]+)['"]/g))if(m[1].startsWith('.'))visit(path.posix.normalize(path.posix.join(path.posix.dirname(p),m[1])));
 for(const m of text.matchAll(/['"]((?:contracts|host|src)\/[^'"]+\.(?:json|mjs))['"]/g))if(fs.existsSync(path.join(root,m[1])))visit(m[1]);
 for(const m of text.matchAll(/path\.join\(ROOT,\s*['"]contracts['"],\s*['"]([^'"]+)['"]/g))visit('contracts/'+m[1]);
}
roots.forEach(visit);
if(missing.size){console.error(JSON.stringify({missing:[...missing].sort()}));process.exit(1);}
const result={schema:'ikant-le-project-session-source/v1',authority:0,scope:'REPOSITORY_NAMED_EXECUTION_CLOSURE_NOT_FULL_CHECKOUT',paths:[...seen].filter(x=>x!=='contracts/project-session-source.json').sort(),bundle_required:false};
const target=path.join(root,'contracts/project-session-source.json'),bytes=JSON.stringify(result,null,2)+'\n';
if(process.argv[2]==='verify'){if(fs.readFileSync(target,'utf8')!==bytes)throw Error('PROJECT_SOURCE_MANIFEST_STALE');}
else fs.writeFileSync(target,bytes);
console.log(JSON.stringify({status:'PASS',paths:result.paths.length}));
