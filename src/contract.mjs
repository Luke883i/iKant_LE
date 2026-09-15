import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
export const TERMS_PATH = path.join(ROOT, 'TERMS.md');
export const CONTRACT_PATH = path.join(ROOT, 'contracts', 'ikant-le.json');

export const EXACT = Object.freeze({
  ACCEPT: 'I ACCEPT',
  PROBE: 'PROBE IKANT',
  INITIALIZE: 'INITIALIZE IKANT',
  EXIT: 'EXIT IKANT',
  TERMS: 'TERMS'
});

export function sha256(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

export function readTerms() {
  const bytes = fs.readFileSync(TERMS_PATH);
  return { text: bytes.toString('utf8'), digest: sha256(bytes) };
}

export function readContract() {
  return JSON.parse(fs.readFileSync(CONTRACT_PATH, 'utf8'));
}

export function classifyInput(input) {
  if (input === EXACT.TERMS || input === '') return 'TERMS';
  if (input === EXACT.ACCEPT) return 'ACCEPT';
  if (input === EXACT.PROBE) return 'PROBE';
  if (input === EXACT.INITIALIZE) return 'INITIALIZE';
  if (input === EXACT.EXIT) return 'EXIT';
  if (/^PREFER (BRIEF|STANDARD|DETAILED)$/.test(input)) return 'PREFERENCE';
  return 'TURN';
}

export function wordCount(text) {
  const m = String(text).trim().match(/\S+/g);
  return m ? m.length : 0;
}

export function validateSurfaceA(text, { min = 50, max = 500 } = {}) {
  const value = String(text ?? '').trim();
  const words = wordCount(value);
  const machineLeak = /(^|\n)\s*[\[{]|receipt_sha256|mutation[_ -]?cases|seed\s*[=:]|prev_hash|terms_digest|stack trace|BEGIN PRIVATE|chain[- ]of[- ]thought/i.test(value);
  const controlLeak = /Backlog & telemetrie:|-------------------/.test(value);
  return {
    ok: words >= min && words <= max && !machineLeak && !controlLeak,
    words,
    machineLeak,
    controlLeak
  };
}

export function fallbackSurfaceA(userInput, preference = 'STANDARD') {
  const topic = String(userInput || 'la richiesta corrente').trim().replace(/\s+/g, ' ').slice(0, 180);
  const base = `Sono in modalità iKant_LE per questa sessione locale. Ho trattato la tua richiesta come intenzione da rendere più semplice e verificabile, senza attribuire al modello autorità che non possiede. Il punto operativo corrente è: ${topic}. Procedo mantenendo separate proposta, evidenza, permesso ed eventuale azione esterna. Le informazioni tecniche, i controlli e i limiti restano nel backlog della stessa iterazione, mentre qui espongo soltanto l'esito utile in linguaggio naturale. Se emergono contraddizioni, termini cambiati o un passaggio che richiede una decisione materiale, il runtime si ferma invece di colmare il vuoto per intuizione.`;
  if (preference === 'BRIEF') return base;
  if (preference === 'DETAILED') return `${base} Questa edizione leggera conserva intenzionalmente pochi invarianti: ammissione esplicita, stato locale verificato in readback, singolo writer, output umano compresso e separazione tra ciò che il sistema registra e ciò che è vero nel mondo. L'adattamento alla persona resta esplicito e reversibile: non inferisce identità, personalità o preferenze sensibili.`;
  return `${base} L'obiettivo è mantenere il comportamento comprensibile e ricostruibile anche quando il motore linguistico sottostante viene sostituito.`;
}

export function renderHumanOutput(surfaceA, artifactName) {
  return `${surfaceA.trim()}\n\n\n-------------------\nBacklog & telemetrie:\n${artifactName}`;
}
