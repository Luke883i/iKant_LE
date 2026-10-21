import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {search,brokenLinks,safe} from '../scripts/readme-1000-variants.mjs';
import {verifyReadme,falsifyReadme} from '../scripts/readme-contract-select.mjs';
import {validateStandalone} from '../scripts/ikant-semantic-reticulum.mjs';
import {verify as verifyAtlas,audit} from '../scripts/ikant-document-atlas.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const home=fs.readFileSync(path.join(root,'README.md'),'utf8');
test('SOURCE: all legacy editorial, neuro and standalone constraints retained',()=>{
 assert.deepEqual(verifyReadme(home,root),{ok:true,errors:[]});
 assert.equal(validateStandalone(home).ok,true);
 assert.equal(falsifyReadme(home,root).rejected,100);
 assert.equal(verifyAtlas().atlas_exact,true);
});
test('PRODUCT: real cognitive/fullstack/evidence narrative and boundary',()=>{
 for(const k of ['Osservazione e provenienza','Valutazione contestuale',
  'Attenzione e spazio di lavoro ricorrente','Pianificazione e costituzione',
  'Full stack reale','MCP_EXTERNAL','**EDU**','**CANONICAL**',
  'Fenomenologia: UNKNOWN','PRODUCT_NO_GO','RQ1','RQ2','RQ3',
  'un solo C87 originale','C125','C59'])assert.ok(home.includes(k),'missing '+k);
 assert.ok(home.indexOf('## Natura')<home.indexOf('## Full stack reale'));
 assert.ok(home.indexOf('## Full stack reale')<home.indexOf('## MCP esterno'));
 assert.ok(home.indexOf('## MCP esterno')<home.indexOf('## Garanzie'));
 assert.doesNotMatch(home,/CANONICAL \(via MCP\)/);
 assert.doesNotMatch(home,/MCP connesso implica ACTIVE|è una coscienza dimostrata/i);
});
test('MCP: complete but qualified Render/ChatGPT checklist',()=>{
 for(const k of ['render.mcp-standalone.candidate.yaml','docs/MCP_STANDALONE_RENDER_RUNBOOK.txt',
  'plugins/ikant-le-session-chat/mcp.standalone.template.json','IKANT_MCP_DEPLOYMENT_PROFILE',
  'IKANT_MCP_AUTH_MODE','IKANT_MCP_OAUTH_RESOURCE','IKANT_MCP_OAUTH_ISSUER',
  'IKANT_MCP_OAUTH_JWKS_URL','IKANT_LE_DEPLOYMENT_ROOT','PKCE S256',
  'JWKS','ikant:connect','ikant:write','/.well-known/oauth-protected-resource/mcp',
  'Plugins → Add custom MCP server','disco persistente','401',
  'STOP, riconciliazione read-only'])assert.ok(home.includes(k),'missing '+k);
});
test('LINKS: curated taxonomy covers genuine files/directories; no broken local link',()=>{
 assert.deepEqual(brokenLinks(home),[]);
 const paths=[...home.matchAll(/\]\((docs\/[^)#]+)\)/g)].map(m=>m[1]);
 assert.ok(new Set(paths).size>=22,'at least 22 distinct technical routes');
 const atlas=audit();assert.ok(atlas.total>=169);
 assert.ok(home.includes('docs/IKANT_DOCUMENT_ATLAS.md'));
});
test('MUTATIONS: actual 1000 unique full-text drafts + 1000 independent omitted-atom counterexamples',()=>{
 const r=search(home);
 assert.equal(r.generated,1000);assert.equal(r.distinct_texts,1000);
 assert.equal(r.eligible,1000);assert.equal(r.negative_mutants,1000);
 assert.equal(r.negative_survivors,0);assert.equal(r.winner.id,'RD0001');
 assert.equal(r.atlas.exact,true);assert.ok(r.atlas.markdown_count>=169);
 assert.ok(r.candidates.every(x=>x.valid && x.sha256.length===64));
});
test('FALSIFICATION: fake activation or missing crucial owner fails editorial qualification',()=>{
 assert.equal(safe(home.replaceAll('MCP_EXTERNAL','[OMITTED]')),false);
 assert.equal(safe(home.replaceAll('C87','[OMITTED]')),false);
 assert.equal(safe(home.replaceAll('Fenomenologia: UNKNOWN','[OMITTED]')),false);
 assert.equal(safe(home+'MCP connesso implica ACTIVE'),false);
 assert.equal(safe(home+'è una coscienza dimostrata'),false);
});
