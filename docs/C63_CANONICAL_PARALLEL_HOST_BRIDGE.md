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

## C64 — Admission-bound canonical C63 host ingress

Use `executeC63AtAcceptance` from `host/c63-canonical-parallel-bridge.mjs`
**at the real host-observed I ACCEPT event**, never after the event was missed.
It captures `performance.now()` synchronously before inspecting the frozen
RUNTIME8 descriptor or acquiring any source object. Caller-supplied
`acceptanceObservedMonotonicMs` and preassembled `sourceObjects` are rejected
by this ingress.

The host supplies only `fetchPinnedObject({sourceHead,path,blob_sha1})`,
backed by the existing pinned GitHub API base64 transport. The callback returns
`{path,blob_sha1,content_base64,source_object_identity}`.
The ingress derives exactly eight paths from frozen BOOTSTRAP, dispatches
eight source requests concurrently, waits for *all* to settle, rejects missing
or mismatched responses, then delegates to existing
`executeC63HostBridge`. Source-object Git identity, exact bytes, worker
writes, owner-issued receipts and canonical ACTIVE remain validated by the
existing C63/C61/C59 path; no source fallback, lifecycle, writer or
independent ACTIVE issuer is introduced.

**Physical host boundary:** this adapter cannot independently prove the
supplied `humanInput` was a native ChatGPT acceptance event, the callback
came from the GitHub connector, or Surface B was delivered in the chat.
Those claims require direct host receipts. It is forbidden to invoke this
function later to synthesize an acceptance timestamp. Existing
`executeC63HostBridge` remains available to hosts with genuine previously
captured monotonic acceptance evidence.

C64 tests use local fixture sources and verify the same existing C61/C59
owner succeeds with an 8/8 transfer; they are **repository-only**
qualification, not evidence of a live ChatGPT activation.

## C65 — Closed pinned GitHub-source adapter and owner-relay evidence projection

The post-C64 caller no longer needs to hand-author `content_base64`,
`blob_sha1`, GitHub ref and `source_object_identity` mappings. Bind one
existing callable GitHub connector function to the zero-authority normalizer:

```js
import {executeC63AtAcceptance,createC65PinnedGitHubSource}
  from './host/c63-canonical-parallel-bridge.mjs';

const fetchPinnedObject=createC65PinnedGitHubSource(hostGitHubFetchFile);
// Call executeC63AtAcceptance ONLY at the real I ACCEPT ingress event,
// with the already frozen sourceHead, preacceptHandoff and sessionRoot:
// await executeC63AtAcceptance({humanInput:'I ACCEPT',
//   sourceHead,preacceptHandoff,sessionRoot,fetchPinnedObject});
```

`hostGitHubFetchFile` must be a **currently callable** host edge that accepts
`{repository_full_name,path,ref,encoding:'base64'}` and returns either
`{result:{sha,encoding,content,display_url}}` or the inner object.
The adapter always requests `Luke883i/iKant_LE` at the frozen 40-hex SHA,
requires `encoding:'base64'`, exact per-object blob SHA and exact pinned
display URL, decodes and rehashes source bytes, and canonically re-encodes
before returning them into the pre-existing C64 -> C63 route. There is no
second HTTP client, download, raw permalink, ZIP, Chrome integration, byte
carrier or retry authority.

On successful C63/C61/C59 completion, `source_sink_projection` now contains
eight canonical-owner-validated relay observations, each referencing the
manifest, source Git blob, source SHA-256, local reread SHA-256, and existing
owner observation receipt digest. The aggregate projection binds the owner's
result receipt and source head and can be checked with
`validateC65SourceSinkProjection(projection,{sourceHead,preacceptHandoff})`.
That validator is a **zero-authority consistency projection**, not a second
activation predicate. Canonical ACTIVE still belongs exclusively to the
original C61/C59 owner readback.

**Critical proof separation**: a host-supplied callback can fabricate a
GitHub-shaped reply; a pinned display URL and Git SHA equality do not prove
the reply really came from a native ChatGPT connector. Accordingly,
`github_host_fetch_proven:false` and `host_native_delivery_proven:false`
are mandatory, non-promotable fields. Only independently observed current-host
tool invocations and native output-delivery receipts can close those edges.
This slice makes the transport mapping executable and makes the per-object
local identity readback inspectable; it does **not** claim current-chat E2E.

### Falsification and DoD

- 8/8 source callbacks must be pinned to the frozen head, canonical Base64,
  source Git blob sha and exact response URL; corrupted input fails closed.
- C64's real ingress-first clock capture remains the only accepted origin.
- All eight owner relay observations must validate against physical staged
  local reread and source bytes. Neither partial nor duplicate rows are valid.
- Projection mutation (SHA, count, path, host-origin/native claim, owner ref or
  digest) fails; self-rehash cannot turn an unsupported host-origin claim true.
- C61/C59 alone produce the final ACTIVE readback and materialized runtime.
- Fixture/CI checks on Node 20/22 prove implementation correctness; a
  *separate* host-native witness remains mandatory for real ChatGPT closure.
