import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
export const README_PATH=path.join(ROOT,'README.md');
export const AGENTS_PATH=path.join(ROOT,'AGENTS.md');
export const TERMS_PATH=path.join(ROOT,'TERMS.md');
export const CONTRACT_PATH=path.join(ROOT,'contracts','ikant-le.json');
export const KERNEL_PATH=path.join(ROOT,'contracts','cognitive-kernel.json');
export const PSYCHE_PATH=path.join(ROOT,'contracts','psyche-kernel.json');
export const SELF_WORLD_PATH=path.join(ROOT,'contracts','self-world-kernel.json');
export const EMERGENCE_PATH=path.join(ROOT,'contracts','emergence-kernel.json');
export const HOST_SHELL_PATH=path.join(ROOT,'contracts','host-shell.json');
export const ORIENTATION_PATH=path.join(ROOT,'contracts','orientation-capsule.json');
export const BOOTSTRAP_PATH=path.join(ROOT,'BOOTSTRAP.json');
export const ADMISSION_PATH=path.join(ROOT,'ADMISSION.json');
export const EXACT=Object.freeze({ACCEPT:'I ACCEPT',PROBE:'PROBE IKANT',INITIALIZE:'INITIALIZE IKANT',EXIT:'EXIT IKANT',TERMS:'TERMS'});
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function readTerms(){const bytes=fs.readFileSync(TERMS_PATH);return{text:bytes.toString('utf8'),digest:sha256(bytes)};}
export function readContract(){return JSON.parse(fs.readFileSync(CONTRACT_PATH,'utf8'));}
export function readKernel(){return JSON.parse(fs.readFileSync(KERNEL_PATH,'utf8'));}
export function readPsycheKernel(){return JSON.parse(fs.readFileSync(PSYCHE_PATH,'utf8'));}
export function readSelfWorldKernel(){return JSON.parse(fs.readFileSync(SELF_WORLD_PATH,'utf8'));}
export function readEmergenceKernel(){return JSON.parse(fs.readFileSync(EMERGENCE_PATH,'utf8'));}
export function readHostShell(){return JSON.parse(fs.readFileSync(HOST_SHELL_PATH,'utf8'));}
export function readOrientationCapsule(){return JSON.parse(fs.readFileSync(ORIENTATION_PATH,'utf8'));}
export function constitutionalFingerprint(){const files=[README_PATH,AGENTS_PATH,TERMS_PATH,CONTRACT_PATH,KERNEL_PATH,PSYCHE_PATH,SELF_WORLD_PATH,EMERGENCE_PATH,HOST_SHELL_PATH,ORIENTATION_PATH,BOOTSTRAP_PATH,ADMISSION_PATH];const material=files.map(p=>`${path.basename(p)}:${sha256(fs.readFileSync(p))}`).join('|');return sha256(Buffer.from(material));}
export function classifyInput(input){if(input===EXACT.TERMS||input==='')return'TERMS';if(input===EXACT.ACCEPT)return'ACCEPT';if(input===EXACT.PROBE)return'PROBE';if(input===EXACT.INITIALIZE)return'INITIALIZE';if(input===EXACT.EXIT)return'EXIT';if(/^PREFER (BRIEF|STANDARD|DETAILED)$/.test(input))return'PREFERENCE';return'TURN';}
export function wordCount(text){const m=String(text).trim().match(/\S+/g);return m?m.length:0;}
export function validateSurfaceA(text,{min=50,max=500}={}){const value=String(text??'').trim();const words=wordCount(value);const machineLeak=/(^|\n)\s*[\[{]|receipt_sha256|node_dispatch|mutation[_ -]?cases|seed\s*[=:]|prev_hash|terms_digest|bootstrap_fingerprint|psyche_(before|after)|archetypal_mix|workspace_frame_id|prediction_id|episode_id|causal_trace|stack trace|BEGIN PRIVATE|chain[- ]of[- ]thought/i.test(value);const controlLeak=/Backlog & telemetrie:|-------------------/.test(value);return{ok:words>=min&&words<=max&&!machineLeak&&!controlLeak,words,machineLeak,controlLeak};}
export function renderHumanOutput(surfaceA,artifactName){return`${surfaceA.trim()}\n\n\n-------------------\nBacklog & telemetrie:\n${artifactName}`;}
