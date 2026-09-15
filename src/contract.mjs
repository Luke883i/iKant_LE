import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT=path.resolve(path.dirname(new URL(import.meta.url).pathname),'..');
export const TERMS_PATH=path.join(ROOT,'TERMS.md');
export const CONTRACT_PATH=path.join(ROOT,'contracts','ikant-le.json');
export const KERNEL_PATH=path.join(ROOT,'contracts','cognitive-kernel.json');
export const HOST_SHELL_PATH=path.join(ROOT,'contracts','host-shell.json');
export const EXACT=Object.freeze({ACCEPT:'I ACCEPT',PROBE:'PROBE IKANT',INITIALIZE:'INITIALIZE IKANT',EXIT:'EXIT IKANT',TERMS:'TERMS'});
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function readTerms(){const bytes=fs.readFileSync(TERMS_PATH);return{text:bytes.toString('utf8'),digest:sha256(bytes)};}
export function readContract(){return JSON.parse(fs.readFileSync(CONTRACT_PATH,'utf8'));}
export function readKernel(){return JSON.parse(fs.readFileSync(KERNEL_PATH,'utf8'));}
export function readHostShell(){return JSON.parse(fs.readFileSync(HOST_SHELL_PATH,'utf8'));}
export function constitutionalFingerprint(){const files=[TERMS_PATH,CONTRACT_PATH,KERNEL_PATH,HOST_SHELL_PATH];const material=files.map(p=>`${path.basename(p)}:${sha256(fs.readFileSync(p))}`).join('|');return sha256(Buffer.from(material));}
export function classifyInput(input){if(input===EXACT.TERMS||input==='')return'TERMS';if(input===EXACT.ACCEPT)return'ACCEPT';if(input===EXACT.PROBE)return'PROBE';if(input===EXACT.INITIALIZE)return'INITIALIZE';if(input===EXACT.EXIT)return'EXIT';if(/^PREFER (BRIEF|STANDARD|DETAILED)$/.test(input))return'PREFERENCE';return'TURN';}
export function wordCount(text){const m=String(text).trim().match(/\S+/g);return m?m.length:0;}
export function validateSurfaceA(text,{min=50,max=500}={}){const value=String(text??'').trim();const words=wordCount(value);const machineLeak=/(^|\n)\s*[\[{]|receipt_sha256|mutation[_ -]?cases|seed\s*[=:]|prev_hash|terms_digest|bootstrap_fingerprint|stack trace|BEGIN PRIVATE|chain[- ]of[- ]thought/i.test(value);const controlLeak=/Backlog & telemetrie:|-------------------/.test(value);return{ok:words>=min&&words<=max&&!machineLeak&&!controlLeak,words,machineLeak,controlLeak};}
export function fallbackSurfaceA(userInput,preference='STANDARD'){const topic=String(userInput||'la richiesta corrente').trim().replace(/\s+/g,' ').slice(0,180);let text=`Ho preso la tua richiesta nel suo nucleo: ${topic}. Cerco prima ciò che può cambiare davvero la risposta, tengo separate le ipotesi dai fatti e non copro con sicurezza apparente ciò che richiederebbe una verifica che non possiedo. Se emergono contraddizioni, le conservo invece di smussarle; se manca una condizione decisiva, la rendo visibile. Preferisco una mossa piccola ma reversibile a una conclusione più brillante e meno controllabile. Il mio compito qui è aiutarti a vedere meglio il problema e la decisione, non occupare la scena con il funzionamento che mi rende possibile.`;if(preference==='DETAILED')text+=` Quando l'incertezza cresce, divento più prudente e riflessivo; quando il quadro è stabile, posso essere più netto. Questa variazione riguarda il modo di accompagnare il ragionamento, non il peso delle prove.`;return text;}
export function renderHumanOutput(surfaceA,artifactName){return`${surfaceA.trim()}\n\n\n-------------------\nBacklog & telemetrie:\n${artifactName}`;}
