import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ROOT, sha256 } from './contract.mjs';

const DIR = path.join(ROOT, '.ikant');
const LEDGER = path.join(DIR, 'ledger.jsonl');
const LOCK = path.join(DIR, 'writer.lock');

export function ensureRuntimeDirs() {
  fs.mkdirSync(path.join(DIR, 'artifacts'), { recursive: true });
}

export function withWriterLock(fn) {
  ensureRuntimeDirs();
  let fd;
  try {
    fd = fs.openSync(LOCK, 'wx', 0o600);
  } catch (err) {
    const e = new Error('REVIEW: another iKant_LE writer is active');
    e.code = 'IKANT_LOCKED';
    throw e;
  }
  try { return fn(); }
  finally {
    try { if (fd !== undefined) fs.closeSync(fd); } catch {}
    try { fs.unlinkSync(LOCK); } catch {}
  }
}

export function initialState() {
  return {
    schema: 'ikant-le-state/v1',
    epoch: null,
    status: 'DISCOVERED',
    terms_digest: null,
    accepted: false,
    probed: false,
    initialized: false,
    preference: 'STANDARD',
    cycle: 0
  };
}

function canonical(obj) {
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export function readLedger() {
  ensureRuntimeDirs();
  if (!fs.existsSync(LEDGER)) return [];
  const lines = fs.readFileSync(LEDGER, 'utf8').split('\n').filter(Boolean);
  const events = lines.map((line, i) => {
    try { return JSON.parse(line); }
    catch { throw new Error(`FAILURE: invalid ledger JSON at line ${i + 1}`); }
  });
  let prev = 'GENESIS';
  for (const [i, event] of events.entries()) {
    if (event.prev_hash !== prev) throw new Error(`FAILURE: ledger chain mismatch at line ${i + 1}`);
    const { event_hash, ...material } = event;
    const expected = sha256(Buffer.from(JSON.stringify(material)));
    if (event_hash !== expected) throw new Error(`FAILURE: ledger hash mismatch at line ${i + 1}`);
    prev = event_hash;
  }
  return events;
}

export function loadState() {
  const events = readLedger();
  if (!events.length) return initialState();
  return structuredClone(events.at(-1).state_after);
}

export function appendEvent(kind, stateAfter, publicReason, detail = {}) {
  ensureRuntimeDirs();
  const events = readLedger();
  const prevHash = events.length ? events.at(-1).event_hash : 'GENESIS';
  const material = {
    schema: 'ikant-le-ledger-event/v1',
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    kind,
    public_reason: publicReason,
    detail,
    state_after: stateAfter,
    prev_hash: prevHash
  };
  const event = { ...material, event_hash: sha256(Buffer.from(JSON.stringify(material))) };
  const line = `${JSON.stringify(event)}\n`;
  const fd = fs.openSync(LEDGER, 'a', 0o600);
  try { fs.writeSync(fd, line); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  const reread = readLedger().at(-1);
  if (reread.event_hash !== event.event_hash) throw new Error('FAILURE: ledger readback mismatch');
  return event;
}

export function newEpoch() {
  return crypto.randomUUID();
}

export function runtimePaths() {
  return { dir: DIR, ledger: LEDGER, lock: LOCK, artifacts: path.join(DIR, 'artifacts') };
}
