import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { classifyInput, validateSurfaceA, fallbackSurfaceA, renderHumanOutput, readTerms, ROOT } from '../src/contract.mjs';
import { initialState, runtimePaths } from '../src/state.mjs';
import { transitionPure, runCommand } from '../src/runtime.mjs';
import { buildBacklogModel, validateBacklogModel } from '../src/backlog.mjs';
import { buildBacklogDocx } from '../src/docx.mjs';

function words(n) { return Array.from({length:n}, (_,i)=>`w${i}`).join(' '); }

const terms = readTerms();

test('exact lifecycle commands reject near matches', () => {
  assert.equal(classifyInput('I ACCEPT'), 'ACCEPT');
  assert.equal(classifyInput('I ACCEPT '), 'TURN');
  assert.equal(classifyInput('i accept'), 'TURN');
  assert.equal(classifyInput('PROBE IKANT'), 'PROBE');
  assert.equal(classifyInput('INITIALIZE IKANT'), 'INITIALIZE');
  assert.equal(classifyInput('EXIT IKANT'), 'EXIT');
});

test('state machine is fail closed and terms-bound', () => {
  let s = initialState();
  assert.equal(transitionPure(s,'INITIALIZE',terms.digest).terminal,'DENY');
  let a = transitionPure(s,'ACCEPT',terms.digest); s=a.state;
  assert.equal(a.terminal,'ACCEPTED');
  assert.equal(transitionPure(s,'INITIALIZE',terms.digest).terminal,'DENY');
  let p = transitionPure(s,'PROBE',terms.digest,true); s=p.state;
  let i = transitionPure(s,'INITIALIZE',terms.digest); s=i.state;
  assert.equal(s.status,'ACTIVE');
  assert.equal(transitionPure(s,'TURN','different-digest').terminal,'RESET_REQUIRED');
  assert.equal(transitionPure(s,'EXIT',terms.digest).terminal,'EXITED');
});

test('surface A boundaries are exact', () => {
  assert.equal(validateSurfaceA(words(49)).ok,false);
  assert.equal(validateSurfaceA(words(50)).ok,true);
  assert.equal(validateSurfaceA(words(500)).ok,true);
  assert.equal(validateSurfaceA(words(501)).ok,false);
  assert.equal(validateSurfaceA(`${words(50)}\n{"receipt_sha256":"x"}`).ok,false);
  assert.equal(validateSurfaceA(`${words(50)}\nBacklog & telemetrie:`).ok,false);
  assert.equal(validateSurfaceA(fallbackSurfaceA('una richiesta normale')).ok,true);
});

test('human output shape is Surface A first and one backlog reference', () => {
  const prose = words(50);
  const out = renderHumanOutput(prose,'x.docx');
  assert.ok(out.startsWith(prose));
  assert.equal((out.match(/Backlog & telemetrie:/g)||[]).length,1);
  assert.ok(out.includes('\n\n\n-------------------\nBacklog & telemetrie:\nx.docx'));
});

test('backlog model excludes private reasoning and docx is valid OOXML zip', () => {
  const state = {...initialState(), status:'ACTIVE', preference:'STANDARD'};
  const model = buildBacklogModel({cycle:1,input:'test',surfaceA:words(50),state});
  assert.equal(validateBacklogModel(model),true);
  const bad = structuredClone(model); bad.sections[0].items.push('private chain-of-thought');
  assert.equal(validateBacklogModel(bad),false);
  const buf = buildBacklogDocx(model);
  assert.equal(buf.readUInt32LE(0),0x04034b50);
  assert.ok(buf.includes(Buffer.from('[Content_Types].xml')));
  assert.ok(buf.includes(Buffer.from('word/document.xml')));
});

test('e2e local lifecycle persists readback and creates same-turn DOCX', { concurrency:false }, () => {
  const dir = runtimePaths().dir;
  fs.rmSync(dir,{recursive:true,force:true});
  assert.match(runCommand('I ACCEPT').stdout,/PROBE IKANT/);
  assert.match(runCommand('PROBE IKANT').stdout,/superato/);
  assert.match(runCommand('INITIALIZE IKANT').stdout,/attivo/);
  const out = runCommand('descrivi questo seed minimale').stdout;
  assert.match(out,/Backlog & telemetrie:/);
  const artifact = out.trim().split('\n').at(-1);
  const p = path.join(runtimePaths().artifacts,artifact);
  assert.ok(fs.existsSync(p));
  assert.equal(fs.readFileSync(p).readUInt32LE(0),0x04034b50);
  assert.match(runCommand('EXIT IKANT').stdout,/chiusa/);
  fs.rmSync(dir,{recursive:true,force:true});
});
