#!/usr/bin/env python3
"""Deterministic HOST candidate: one exact local Git tree -> prompt + ZIP. Not an installer."""
import argparse,hashlib,json,subprocess,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
SHA=lambda b:hashlib.sha256(b).hexdigest()
GIT=lambda *args:subprocess.check_output(['git',*args],cwd=ROOT).decode().strip()
FIVE=('README.md','BOOTSTRAP.json','ADMISSION.json','AGENTS.md','TERMS.md')
def zipwrite(z,name,content):
 info=zipfile.ZipInfo(name,(1980,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED;info.external_attr=0o100644<<16
 z.writestr(info,content)
def build(out,expected_tree):
 tree=GIT('rev-parse','HEAD^{tree}')
 if expected_tree!=tree:raise ValueError('SOURCE_LOCK_STALE')
 if GIT('status','--porcelain'):raise ValueError('SOURCE_DIRTY_NOT_FROZEN')
 files=GIT('ls-files').splitlines();records={}
 for name in files:
  raw=(ROOT/name).read_bytes();blob=hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()
  if GIT('rev-parse',f'HEAD:{name}')!=blob:raise ValueError('SOURCE_BYTES_MISMATCH:'+name)
  records[name]={'git_blob_sha1':blob,'sha256':SHA(raw),'bytes':len(raw)}
 prompt=("iKant HOST: no authority. This artifact is CANDIDATE only.\n"
  f"PINNED_GIT_TREE={tree}\n"
  "Verify LIVE main tree and five pinned blobs against project source.\n"
  "On stale lock: STOP. Do not install a plugin from a ZIP or claim native hooks.\n"
  "Public modes EDU and CANONICAL/MCP only after original TERMS and separate acceptance.\n"
  "EDU/v2 must not become historical C72/v1 EXPERIMENTAL receipt.\n"
  "OneShell: six evidence-bound HOST slides; A only original readback C87 via C125.\n"
  "No result without original owner proof; NEXT one step, else STOP.\n").encode()
 manifest={'schema':'ikant-le-s04-project-bundle/v1','git_tree_sha1':tree,
  'source_ref_kind':'LOCAL_PREPR_NOT_LIVE_MAIN','live_main_verified':False,
  'native_plugin_installed':False,'five_blob_lock':{p:records[p]['git_blob_sha1'] for p in FIVE},
  'members':records,'prompt_sha256':SHA(prompt)}
 out.mkdir(parents=True,exist_ok=True);(out/'PROMPT_INNESCO_PREPR.txt').write_bytes(prompt)
 with zipfile.ZipFile(out/'PROJECT_PREPR.zip','w') as z:
  zipwrite(z,'PROMPT_INNESCO_PREPR.txt',prompt)
  zipwrite(z,'MANIFEST.json',(json.dumps(manifest,ensure_ascii=False,sort_keys=True,separators=(',',':'))+'\n').encode())
  for p in files:zipwrite(z,'repo/'+p,(ROOT/p).read_bytes())
 return manifest

def verify(path,expected_tree):
 with zipfile.ZipFile(path) as z:
  m=json.loads(z.read('MANIFEST.json'))
  if m['git_tree_sha1']!=expected_tree:raise ValueError('SOURCE_LOCK_STALE')
  if SHA(z.read('PROMPT_INNESCO_PREPR.txt'))!=m['prompt_sha256']:raise ValueError('PROMPT_INTEGRITY')
  if set(z.namelist())!={'MANIFEST.json','PROMPT_INNESCO_PREPR.txt',*(('repo/'+p) for p in m['members'])}:
   raise ValueError('EXTRA_OR_MISSING_BUNDLE_MEMBER')
  for p,v in m['members'].items():
   raw=z.read('repo/'+p)
   if SHA(raw)!=v['sha256'] or hashlib.sha1(b'blob '+str(len(raw)).encode()+b'\0'+raw).hexdigest()!=v['git_blob_sha1']:
    raise ValueError('BUNDLE_SOURCE_MISMATCH:'+p)
  for p in FIVE:
   if m['five_blob_lock'][p]!=m['members'][p]['git_blob_sha1']:raise ValueError('ORIENTATION_BLOB_DRIFT')
 return {'ok':True,'tree':expected_tree,'members':len(m['members']),'live_main_verified':False,'native_plugin_installed':False}
if __name__=='__main__':
 a=argparse.ArgumentParser();a.add_argument('operation',choices=['build','verify']);a.add_argument('--out',required=True);a.add_argument('--expected-tree',required=True);o=a.parse_args();p=Path(o.out)
 if o.operation=='build':build(p,o.expected_tree)
 print(json.dumps(verify(p/'PROJECT_PREPR.zip',o.expected_tree)))
