import base64
import hashlib
import importlib.util
import io
import json
import pathlib
import stat
import unittest
import zipfile

ROOT=pathlib.Path(__file__).resolve().parents[1]
S=importlib.util.spec_from_file_location("manual",ROOT/"scripts/project-manual-source.py")
M=importlib.util.module_from_spec(S);S.loader.exec_module(M)

def gid(t,b):
    return hashlib.sha1(t.encode()+b" "+str(len(b)).encode()+b"\0"+b).hexdigest()

class ManualSource(unittest.TestCase):
    def setUp(self):
        self.head="a"*40
        self.raw={"a.mjs":b"export const test=1;\n"}
        self.raw["contracts/project-session-source.json"]=json.dumps(
            {"schema":"ikant-le-project-session-source/v1","paths":["a.mjs"]}).encode()
        self.blobs={p:gid("blob",b) for p,b in self.raw.items()}
        c=gid("tree",b"100644 project-session-source.json\0"+bytes.fromhex(self.blobs["contracts/project-session-source.json"]))
        t=gid("tree",b"100644 a.mjs\0"+bytes.fromhex(self.blobs["a.mjs"])+b"40000 contracts\0"+bytes.fromhex(c))
        self.tree=t
        self.api={"source_head":self.head,"source_tree":t,"live_head":self.head,"truncated":False,"tree":[
            {"path":"a.mjs","sha":self.blobs["a.mjs"],"mode":"100644","type":"blob"},
            {"path":"contracts","sha":c,"mode":"040000","type":"tree"},
            {"path":"contracts/project-session-source.json","sha":self.blobs["contracts/project-session-source.json"],"mode":"100644","type":"blob"}
        ]}
    def archive(self,change=None):
        b=io.BytesIO()
        with zipfile.ZipFile(b,"w") as z:
            for p,raw in self.raw.items():
                name="iKant_LE-"+self.head+"/"+p
                value=change(p,raw) if change else raw
                z.writestr(name,value)
        b.seek(0)
        return b
    def test_positive_exact_zip_transport_plan(self):
        plan=M.convert(self.archive(),self.api,self.head,self.tree)
        self.assertEqual(plan["source_tree"],self.tree)
        self.assertEqual({x["path"]:base64.b64decode(x["content"]) for x in plan["files"]},self.raw)
        self.assertEqual(plan["truncated"],False)
    def test_negative_source_and_archive_mutations(self):
        for name,modify in [
          ("wrong_head",lambda z,a,h,t:(z,a,"b"*40,t)),
          ("wrong_tree",lambda z,a,h,t:(z,a,h,"b"*40)),
          ("api_drift",lambda z,a,h,t:(z,{**a,"live_head":"b"*40},h,t)),
          ("truncated",lambda z,a,h,t:(z,{**a,"truncated":True},h,t)),
          ("missing",lambda z,a,h,t:(self.archive(lambda p,b:b if p!="a.mjs" else b""),a,h,t)),
          ("mutated",lambda z,a,h,t:(self.archive(lambda p,b:b+b"tamper" if p=="a.mjs" else b),a,h,t)),
          ("wrong_manifest",lambda z,a,h,t:(self.archive(lambda p,b:b+b"!" if p.endswith(".json") else b),a,h,t)),
        ]:
            with self.subTest(name=name):
                z,a,h,t=modify(self.archive(),self.api,self.head,self.tree)
                with self.assertRaises((ValueError,KeyError,json.JSONDecodeError)):
                    M.convert(z,a,h,t)
    def test_zip_symlink_rejected(self):
        b=io.BytesIO()
        with zipfile.ZipFile(b,"w") as z:
            for p,raw in self.raw.items():z.writestr("iKant_LE-"+self.head+"/"+p,raw)
            symlink=zipfile.ZipInfo("iKant_LE-"+self.head+"/link")
            symlink.create_system=3
            symlink.external_attr=(stat.S_IFLNK|0o777)<<16
            z.writestr(symlink,"target")
        b.seek(0)
        with self.assertRaisesRegex(ValueError,"ARCHIVE_SPECIAL_MEMBER"):
            M.convert(b,self.api,self.head,self.tree)

if __name__=="__main__":unittest.main()
