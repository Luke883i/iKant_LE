# iKant_LE

**iKant Light Edition** is a deliberately small, local governance wrapper for a chat assistant. It does not replace the underlying model; while ACTIVE, it makes the session follow a stable iKant interaction profile whose authority lives in local contracts and read-back state rather than in model prose.

## Why this repository is small

The full iKant repository carries a long product trajectory. iKant_LE extracts only the invariants needed for a portable seed: exact admission, real local probe, deterministic initialization, one local writer, append/readback state, zero-authority model output, bounded public prose, out-of-band DOCX backlog, explicit exit, typed failure and mutation qualification. It intentionally does **not** import the full cognitive/product lattice.

## Local lifecycle

Requires Node.js 20+ and no runtime dependency.

```bash
node ikant.mjs TERMS
node ikant.mjs "I ACCEPT"
node ikant.mjs "PROBE IKANT"
node ikant.mjs "INITIALIZE IKANT"
node ikant.mjs "spiegami in modo semplice cosa stiamo facendo"
node ikant.mjs "EXIT IKANT"
```

For a host-generated candidate response:

```bash
node ikant.mjs --candidate-file candidate.txt "domanda dell'utente"
```

The runtime validates the candidate as Surface A; invalid or technical/debug-heavy candidates are replaced by a bounded natural fallback. A substantive ACTIVE turn writes a `.docx` under `.ikant/artifacts/` and prints only:

```text
<Surface A prose>


-------------------
Backlog & telemetrie:
<artifact-name>.docx
```

## Truth boundary

`model output != evidence != permission != approval != execution != world truth`

Mutation campaigns, tests, receipts and DOCX artifacts are engineering evidence about this repository's contracts. They are not proof of model quality, production reliability, security in every host, or correctness in the external world.

## Development

```bash
npm test
npm run check
npm run falsify
```

See `AGENTS.md`, `contracts/ikant-le.json`, `docs/GOVERNANCE.md`, and `docs/RESEARCH_LEDGER.md`.
