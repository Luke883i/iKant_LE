#!/usr/bin/env python3
"""Exact Git commit -> reproducible Project prompt + ZIP, not a plugin installer.
Uses only Python stdlib and a clean Git checkout. Caller independently confirms LIVE main SHA.
"""
import argparse,hashlib,json,subprocess,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
DOCS=tuple(f'{i:02d}_{n}.md' for i,n in enumerate(('README','PHASES','PROOFS','SLIDES','FILLER','ANNEX','PLUGIN','ROADMAP','RELEASE_BOUNDARY','ADAPTER_RECIPES')))
ORIENT=('README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md')
PLUGIN=('README.md','plugin.json','mcp.template.json','server/package.json','server/public/ikant-le-app.html','server/server.mjs','server/transport-security.mjs','server/gateway-identity.mjs')
sha256=lambda b:hashlib.sha256(b).hexdigest()
def gitblob(b):return hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()
def git(*args):return subprocess.check_output(['git','-c',f'safe.directory={ROOT}','-C',str(ROOT),*args],text=True).strip()
def meta(raw):return {'bytes':len(raw),'sha256':sha256(raw),'git_blob_sha1':gitblob(raw)}
def zipwrite(z,k,raw):
 info=zipfile.ZipInfo(k,(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16;z.writestr(info,raw)
def build(out,expected_commit,expected_tree):
 head=git('rev-parse','HEAD');tree=git('rev-parse','HEAD^{tree}')
 if head!=expected_commit or tree!=expected_tree:raise ValueError('SOURCE_LOCK_STALE')
 if git('status','--porcelain'):raise ValueError('DIRTY_SOURCE_NOT_RELEASEABLE')
 members={}
 def add(name,source):
  b=(ROOT/source).read_bytes()
  if gitblob(b)!=git('rev-parse','HEAD:'+source):raise ValueError('SOURCE_BLOB_DRIFT:'+source)
  members[name]=b
 for d in DOCS:add('slides/'+d,'project/oneshell-v7/'+d)
 for name in ORIENT:add('orientation/'+name,name)
 for name in PLUGIN:add('plugin_source/plugins/ikant-le-session-chat/'+name,'plugins/ikant-le-session-chat/'+name)
 add('adapter_source/host/p1-semantic-annex.mjs','host/p1-semantic-annex.mjs')
 add('contracts/p1-p7-product-closure.json','contracts/p1-p7-product-closure.json')
 template=(ROOT/'project/oneshell-v7/PROMPT_TEMPLATE.txt').read_bytes()
 if gitblob(template)!=git('rev-parse','HEAD:project/oneshell-v7/PROMPT_TEMPLATE.txt'):raise ValueError('PROMPT_TEMPLATE_DRIFT')
 prompt=template.replace(b'@GIT_HEAD@',head.encode()).replace(b'@GIT_TREE@',tree.encode())
 if b'@GIT_' in prompt:raise ValueError('UNBOUND_PROMPT_MARKER')
 members['PROMPT_INNESCO.txt']=prompt
 lock={'schema':'ikant-le-project-source-lock/v7','source_commit':head,'source_tree':tree,
       'orientation_blobs':{p:meta(members['orientation/'+p])['git_blob_sha1'] for p in ORIENT},
       'plugin_source_blobs':{p:meta(members['plugin_source/plugins/ikant-le-session-chat/'+p])['git_blob_sha1'] for p in PLUGIN},
       'source_is_live_main_attested':False,'plugin_connected':False,'owner_voice_executed':False,
       'stale_head_action':'STOP_SOURCE_LOCK_STALE_NO_AUTO_REPIN'}
 members['SOURCE_LOCK.json']=(json.dumps(lock,indent=2,sort_keys=True)+'\n').encode()
 manifest={'schema':'ikant-le-oneshell-project-release/v7','source_commit':head,'source_tree':tree,
 'source_live_main_verified':False,'native_plugin_installed':False,'project_applied':False,
 'files':{p:meta(b) for p,b in sorted(members.items())}}
 out.mkdir(parents=True,exist_ok=True)
 (out/'PROMPT_INNESCO.txt').write_bytes(prompt)
 with zipfile.ZipFile(out/'ONESHELL_PROJECT_V7.zip','w') as z:
  for p,b in sorted(members.items()):zipwrite(z,p,b)
  zipwrite(z,'MANIFEST.json',(json.dumps(manifest,indent=2,sort_keys=True)+'\n').encode())
 return verify(out/'ONESHELL_PROJECT_V7.zip',head,tree)
def verify(zip_path,expected_commit,expected_tree):
 with zipfile.ZipFile(zip_path) as z:
  names=z.namelist()
  if len(names)!=len(set(names)) or any(p.startswith('/') or '..' in Path(p).parts for p in names):raise ValueError('UNSAFE_MEMBERS')
  manifest=json.loads(z.read('MANIFEST.json'));lock=json.loads(z.read('SOURCE_LOCK.json'))
  if manifest['source_commit']!=expected_commit or manifest['source_tree']!=expected_tree or lock['source_commit']!=expected_commit or lock['source_tree']!=expected_tree:raise ValueError('SOURCE_LOCK_STALE')
  if manifest['source_live_main_verified'] or manifest['native_plugin_installed'] or manifest['project_applied'] or lock['source_is_live_main_attested'] or lock['plugin_connected'] or lock['owner_voice_executed']:raise ValueError('UNATTESTED_PROMOTION')
  if set(names)!=set(manifest['files'])|{'MANIFEST.json'}:raise ValueError('MEMBER_SET_DRIFT')
  for p,v in manifest['files'].items():
   b=z.read(p)
   if meta(b)!=v:raise ValueError('TAMPERED_MEMBER:'+p)
  for p in ORIENT:
   k='orientation/'+p
   if meta(z.read(k))['git_blob_sha1']!=lock['orientation_blobs'][p]:raise ValueError('ORIENTATION_DRIFT')
  for p in PLUGIN:
   k='plugin_source/plugins/ikant-le-session-chat/'+p
   if meta(z.read(k))['git_blob_sha1']!=lock['plugin_source_blobs'][p]:raise ValueError('PLUGIN_DRIFT')
  if expected_commit.encode() not in z.read('PROMPT_INNESCO.txt') or expected_tree.encode() not in z.read('PROMPT_INNESCO.txt'):raise ValueError('PROMPT_SOURCE_BINDING')
 return {'ok':True,'source_commit':expected_commit,'source_tree':expected_tree,'file_count':len(manifest['files']),
         'zip_sha256':sha256(zip_path.read_bytes()),'plugin_installed':False,'project_applied':False}
if __name__=='__main__':
 p=argparse.ArgumentParser();p.add_argument('operation',choices=['build','verify']);p.add_argument('--out',required=True);p.add_argument('--expected-commit',required=True);p.add_argument('--expected-tree',required=True);a=p.parse_args()
 dest=Path(a.out);result=build(dest,a.expected_commit,a.expected_tree) if a.operation=='build' else verify(dest/'ONESHELL_PROJECT_V7.zip',a.expected_commit,a.expected_tree)
 print(json.dumps(result,sort_keys=True))
