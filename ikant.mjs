#!/usr/bin/env node
import fs from 'node:fs';
import { runCommand } from './src/runtime.mjs';

const args = process.argv.slice(2);
let candidate = null;
let idx = args.indexOf('--candidate-file');
if (idx >= 0) {
  const file = args[idx + 1];
  if (!file) { console.error('Missing --candidate-file value'); process.exit(2); }
  candidate = fs.readFileSync(file, 'utf8');
  args.splice(idx, 2);
}
const input = args.join(' ');
try {
  const result = runCommand(input, { candidate });
  process.stdout.write(`${result.stdout}\n`);
  process.exitCode = result.code;
} catch (err) {
  process.stdout.write(`iKant_LE non può completare questo passaggio in modo affidabile: ${String(err?.message || err)}\n`);
  process.exitCode = 1;
}
