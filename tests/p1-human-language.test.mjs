import test from 'node:test';import assert from 'node:assert/strict';
import {qualifyHumanFacingIdentity} from '../host/p1-public-language-guard.mjs';
test('identity jargon denied before C87, with no text rewriting',()=>{
 assert.equal(qualifyHumanFacingIdentity({method:'DIRECT_IDENTITY',text:'Sono software, non posso dimostrare esperienza soggettiva.'}).ok,true);
 for(const text of ['Sono C70.','Il mio readback funziona.','Uso un kernel.','Sono HOST_BOUND.'])
  assert.equal(qualifyHumanFacingIdentity({method:'DIRECT_IDENTITY',text}).ok,false,text);
 assert.equal(qualifyHumanFacingIdentity({method:'PRACTICAL_REVIEW',text:'C70'}).ok,true);
});
