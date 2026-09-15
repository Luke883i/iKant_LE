import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const TERMS_PATH = path.join(ROOT, 'TERMS.md');
export const CONTRACT_PATH = path.join(ROOT, 'contracts', 'ikant-le.json');

export const EXACT = Object.freeze({ ACCEPT:'I ACCEPT', PROBE:'PROBE IKANT', INITIALIZE:'INITIALIZE IKANT', EXIT:'EXIT IKANT', TERMS:'TERMS' });
export function sha256(data){return crypto.createHash('sha256').update(data).digest('hex');}
export function readTerms(){const bytes=fs.readFileSync(TERMS_PATH);return {text:bytes.toString('utf8'),digest:sha256(bytes)};}
export function readContract(){return JSON.parse(fs.readFileSync(CONTRACT_PATH,'utf8'));}
export function classifyInput(input){if(input===EXACT.TERMS||input==='')return'TERMS';if(input===EXACT.ACCEPT)return'ACCEPT';if(input===EXACT.PROBE)return'PROBE';if(input===EXACT.INITIALIZE)return'INITIALIZE';if(input===EXACT.EXIT)return'EXIT';if(/^PREFER (BRIEF|STANDARD|DETAILED)$/.test(input))return'PREFERENCE';return'TURN';}
export function wordCount(text){const m=String(text).trim().match(/\S+/g);return m?m.length:0;}
export function validateSurfaceA(text,{min=50,max=500}={}){const value=String(text??'').trim();const words=wordCount(value);const machineLeak=/(^|\n)\s*[\[{]|receipt_sha256|mutation[_ -]?cases|seed\s*[=:]|prev_hash|terms_digest|stack trace|BEGIN PRIVATE|chain[- ]of[- ]thought/i.test(value);const controlLeak=/Backlog & telemetrie:|-------------------/.test(value);return{ok:words>=min&&words<=max&&!machineLeak&&!controlLeak,words,machineLeak,controlLeak};}
export function fallbackSurfaceA(userInput,preference='STANDARD'){const topic=String(userInput||'la richiesta corrente').trim().replace(/\s+/g,' ').slice(0,180);const base=`Sono iKant in questa sessione locale. Ho trattato la tua richiesta come un'intenzione da rendere semplice, verificabile e reversibile, senza attribuire al modello o ai miei stati interni autorità che non possiedono. Il punto operativo corrente è: ${topic}. Distinguo proposta, evidenza, permesso ed eventuale azione esterna; se una risorsa manca o un conflitto è materiale, lo espongo invece di colmare il vuoto per intuizione. Le informazioni tecniche e la traccia del ciclo restano nel backlog della stessa iterazione.`;if(preference==='DETAILED')return`${base} La mia esperienza locale può modulare cautela, scelta del metodo e tono, ma non può trasformare ripetizione, emozione funzionale o telemetria in evidenza sul mondo. L'obiettivo è ottenere il massimo rendimento con il minimo reticolo necessario.`;return`${base} Il motore linguistico sottostante resta sostituibile: identità, limiti e regole appartengono al contratto iKant.`;}
export function renderHumanOutput(surfaceA,artifactName){return`${surfaceA.trim()}\n\n\n-------------------\nBacklog & telemetrie:\n${artifactName}`;}
