import test from 'node:test';
import assert from 'node:assert/strict';
import {oneShellFrame} from '../host/project-oneshell-edu.mjs';
import {createOneShellVisualModel,renderOneShellVisualText,verifyOneShellVisualEquivalence} from '../host/project-oneshell-visual.mjs';
test('approved one-border visual hierarchy and soft red EXIT',()=>{
 const f=oneShellFrame({esito:'READY',b:'Host\nUnicode Ω 🔒',prova:'verified',edge:'NONE',next:'STOP'});
 const m=createOneShellVisualModel(f);
 assert.equal(m.layout.container,'SINGLE_UNBROKEN_BORDER_ALL_SIX_SLOTS');
 assert.equal(m.exit.background_css,'rgba(194, 37, 46, 0.10)');
 assert.deepEqual(m.slots.slice(1,3).map(x=>[x.primary,x.secondary,x.strong]),[['iKant','Superficie A',true],['Host','Superficie B',true]]);
 assert.equal(m.slots[2].value,f.slots.B);
 assert(verifyOneShellVisualEquivalence(m,f).ok);
 const txt=renderOneShellVisualText(f);
 assert(txt.startsWith('╭')&&txt.endsWith('╯'));
 assert(txt.includes('iKant (Superficie A)')&&txt.includes('Host (Superficie B)'));
 assert.equal(txt.match(/╭/g).length,1);
});
test('100 distinct input candidates retain all original slot bytes',()=>{
 for(let i=0;i<100;i++){const value='Ω '.repeat(i%7)+'\n'+i+'✓';
  const f=oneShellFrame({esito:'T',b:value,prova:'p',edge:'e',next:'n'});
  const m=createOneShellVisualModel(f,{exitPhase:i%2?'CONFIRMATION_PENDING':'AVAILABLE'});
  assert.equal(m.slots[2].value,value);assert(verifyOneShellVisualEquivalence(m,f).ok);
 }
});
test('forged visual slot or fake voice cannot pass',()=>{
 const f=oneShellFrame({esito:'T',b:'ok'}),m=createOneShellVisualModel(f);
 assert.throws(()=>verifyOneShellVisualEquivalence({...m,slots:m.slots.map(x=>x.key==='B'?{...x,value:'spoof'}:x)},f),/BYTE_EXACT/);
 assert.throws(()=>createOneShellVisualModel({...f,slots:{...f.slots,A:'fake'}}),/UNVERIFIED/);
});

test('safe HTML rich fallback is single-framed and not a fake EXIT control',async()=>{
 const {renderOneShellVisualHtml}=await import('../host/project-oneshell-visual.mjs');
 const f=oneShellFrame({esito:'T',b:'<script>alert("x")</script>',prova:'original',edge:'NONE',next:'STOP'});
 const html=renderOneShellVisualHtml(f);
 assert.equal(html.match(/<section\b/g).length,1);
 assert.equal(html.match(/data-slot=/g).length,6);
 assert(html.includes('rgba(194,37,46,.10)'));
 assert(html.includes('<strong>iKant</strong><small>Superficie A</small>'));
 assert(html.includes('<strong>Host</strong><small>Superficie B</small>'));
 assert(!html.includes('<script>'));assert(html.includes('&lt;script&gt;'));
 assert(!html.includes('<button')); // HOST must bind gesture to human event
});
