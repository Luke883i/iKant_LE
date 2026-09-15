import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { runtimePaths } from './state.mjs';

export function runProbe() {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isInteger(major) || major < 20) return { ok: false, reason: 'Node.js 20+ required' };
  const { dir } = runtimePaths();
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, `probe-${crypto.randomUUID()}.tmp`);
  const a = 'ikant-le-probe';
  const b = '\nappend-readback';
  try {
    fs.writeFileSync(p, a, { mode: 0o600 });
    if (fs.readFileSync(p, 'utf8') !== a) return { ok: false, reason: 'FS readback failed' };
    fs.appendFileSync(p, b);
    if (fs.readFileSync(p, 'utf8') !== a + b) return { ok: false, reason: 'FS append/readback failed' };
    const h = crypto.createHash('sha256').update(a + b).digest('hex');
    if (h.length !== 64) return { ok: false, reason: 'crypto unavailable' };
    if (!Number.isFinite(Date.now())) return { ok: false, reason: 'clock unavailable' };
    fs.unlinkSync(p);
    if (fs.existsSync(p)) return { ok: false, reason: 'FS delete failed' };
    return { ok: true, node: process.versions.node, fs: 'crud+append+readback+delete', crypto: 'sha256', clock: 'Date.now', artifact_sink: true };
  } catch (err) {
    try { fs.unlinkSync(p); } catch {}
    return { ok: false, reason: String(err?.message || err) };
  }
}
