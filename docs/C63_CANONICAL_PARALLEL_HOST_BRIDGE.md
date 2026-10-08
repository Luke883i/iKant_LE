# C63 — Canonical host byte bridge with parallel local workers

## Motivation

The observed C59 connector-to-container witness demonstrates a primitive byte relay for
one historical source object. C61/C62 prove the cold owner on **local fixtures**.
Neither is a current-host witness for a complete RUNTIME8 transfer.

C63 adds a **host-side zero-authority adapter** connecting the two existing, distinct
planes, without inventing a second lifecycle, carrier, runtime owner or state writer.

## Exact path

1. Current host captures the human `I ACCEPT` event with a monotonic timestamp.
2. A pinned GitHub API source-plane adapter supplies eight opaque base64 objects,
   their Git blob identities and provenance strings. No container GitHub networking.
3. `executeC63HostBridge` verifies the frozen `BOOTSTRAP.json` bytes against the
   preaccept handoff, derives the closed RUNTIME8 set, and rejects incomplete,
   duplicate, corrupted or mismatched source evidence **before** invoking any owner.
4. The loader is written, reopened and checked before import.
5. The *existing* C61 cold owner issues the canonical relay manifest.
6. Seven shard writes execute concurrently in bounded **Node worker threads**.
   Each verifies source blob identity and local readback. All outstanding workers
   settle before a failing staging directory is cleaned up.
7. The existing owner reopens all eight objects, issues eight canonical relay
   observations, produces the executor/handoff and executes C59 materialization.
8. The adapter returns **the owner's** canonical ACTIVE readback, without minting
   its own activation authority or native-delivery receipt.

## Entry-point contract

`import {executeC63HostBridge} from './host/c63-canonical-parallel-bridge.mjs'`

Input:
- `sourceHead`: pinned 40-hex Git commit.
- `humanInput`: exactly `I ACCEPT`.
- `preacceptHandoff`: immutable `ikant-le-preaccept-handoff/v2` with RAW5 bytes.
- `sourceObjects`: exactly eight objects, each containing `path`, `blob_sha1`,
  `content_base64`, `source_object_identity`.
- `acceptanceObservedMonotonicMs`: physically observed timestamp in the same
  local Node monotonic clock domain, captured at admission.
- `sessionRoot`: preexisting private *absolute* directory; its `runtime` child
  must not exist and no ancestor may be a symlink.
- `runnerCount`: 1–7, default 4; **worker threads**, not independent cloud runners.

Output: `ikant-le-c63-host-byte-bridge/v1` is a zero-authority host observation that
references the existing C61/C59 result and readback. The materializer alone can
publish `runtime`; C63 never writes the canonical ledger directly.

### Threat and epistemic model

The blob hashes are checked against the **frozen** repository descriptor, not
against a model-authored alternative. `source_object_identity` is **host-attested**
metadata: it is *not* cryptographic proof of a GitHub API call. A fully conforming
host must separately attest the exact GitHub API source fetch, user acceptance,
byte transfer into this function and same-session location. The contract cannot
manufacture this host capability from a source file or CI fixture.

The adapter intentionally has no network access, separate file carrier, warm
cache, model-selected retry, fallback planner, independent state or native UI.

## DoD ledger

| Property | Current implementation | Proof required |
|---|---|---|
| Runtime-root source integrity | Encoded bytes checked against frozen RUNTIME8 | Tamper/duplicate/missing/frozen-head test |
| Parallel local sink | Node worker_threads, disjoint staging writes | Real worker execution and 8/8 reopen |
| Canonical activation owner | C61 manifest/observations/executor; C59 gate | ACTIVE readback bound to same source/root |
| Persistence inside Node runtime | Canonical ledger writer only | Local subsequent turn/EXIT test |
| Surface A and B | Existing runtime turn emits DOCX | Same-turn local DOCX readback test |
| GitHub-to-ChatGPT transfer | External, not proved by fixture | Current-host source→sink receipt |
| Multi-runner **host** scheduling | Not introduced | Host scheduler and runner-identity receipts |
| Durable ChatGPT session | Not introduced | Same-session durable root reopen across turns |
| Native transcript and downloadable DOCX | Not introduced | Host-native output/artifact delivery readback |
| Permanent opt-out banner | Not introduced | Native UI control and EXIT no-route proof |

The presence of a green C63 workflow is **repository-side executable qualification**,
not evidence that a ChatGPT conversation received the bytes, delivered the DOCX,
registered an iKant participant, or presented a persistent native EXIT control.

## Relationship to existing owners

- C59 single canonical composition: **unchanged**.
- C61 cold owner: **reused**.
- C62 RAW5 evidence / RUNTIME8 byte cut: **unchanged**.
- C45 durable context root and C54 host-consumption-frame: **future host integration**,
  not replaced by this adapter.
- C57 task-scope fence: repository engineering remains independently allowed even
  if a live iKant bootstrap is blocked.

## Regression

`node --test --test-concurrency=1 tests/c63-canonical-parallel-bridge.test.mjs`

`.github/workflows/c63-canonical-parallel-host-bridge.yml` runs Node 20 and 22
with C61/C62 tests, root integrity verification and repository checks.

No universal latency or native delivery SLO is claimed from CI.
