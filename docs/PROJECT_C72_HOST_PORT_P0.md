# P0 — Host plug-and-play port: original C72, technology-independent ingress

Scope: Host engineering only. This patch does not issue C72 consent, install ChatGPT tools,
authenticate provider events, alter C135/C87/C125, activate CANONICAL or repin a live iKant session.

## For humans

The repository describes **what must be proved**; ChatGPT Host picks **how to physically move
the five original files** using a capability that actually exists in this chat.
Two equivalent legal choices now feed the same C72 original owner:

* `HOST_CALLBACKS`: the Host already has real callable functions that read the pinned GitHub HEAD
  and five files. The original recovery executor still consumes them unchanged.
* `HOST_SOURCE_PACKET`: the Host itself fetches the original bytes from its authorized GitHub
  connector and physically transports one bounded JSON packet into a real Node process.
  This is useful when tools cannot pass callback objects across environments.
  `scripts/project-c72-portable-cli.mjs` is one concrete stdin carrier; the Host may instead
  call the exported function with a packet in an installed Node process.

No callback, no physical byte transfer or no actual Node means a typed STOP, **not**
a claim that GitHub, Node or C72 is universally absent. One cannot install provider hooks
merely by modifying a Project prompt. The Host's choice is implementation latitude,
not permission to bypass an original owner.

## Source contract and exact packet

Single owner of *transport effects*: `contracts/project-host-capability-port.json`.
The original owner remains `host/c72-public-mode-admission.mjs`; the new port has authority=0.
The existing `host/project-c72-host-recovery.mjs` delegates only the transport selection to
`host/project-c72-capability-port.mjs#bindC72Transport`.

An opaque packet has schema `ikant-host-c72-source-packet/v1`, exact `source_head`,
observed `live_head`, `carrier_kind=HOST_OPAQUE_TRANSFER`, exactly five ordered records
`{path,source_head,blob_sha1,content}`, and false `source_origin_attested`/
`native_event_attested`. The Host must have independently read these documents through its
authorized GitHub connector. Node validates size, path, shape, HEAD agreement, and the original
reentry recomputes all Git blob identities. A digest alone does not authenticate the network
event. The already persisted first-turn witness is never retroactively constructed.

The optional physical CLI accepts:
```json
{"schema":"ikant-host-c72-port-request/v1","humanMessage":"I ACCEPT",
 "freshHumanTurn":true,"priorTurnEvidence":{"...":"real first-turn witness"},
 "sourcePacket":{"...":"actual five pinned bytes"}}
```
This is only an illustrative shape, not a valid example of evidence. The actual Node request
requires original first-turn data and currently checked live HEAD. The CLI preserves and prints
the **complete original accepted and introduction objects** on success and a typed result on
failure. Do not rerun on a previously unknown owner outcome.

## Exhaustive cross-PR census: 165–169

The source-level DoD register in `docs/PROJECT_C72_BOOTSTRAP_WITNESS_AND_BRIDGE_P0.md`
distinguishes implementation from native delivery. The following are **non-guaranteed outcomes**
remaining after their merges, not accusations that each source-level feature is missing:

| PR | Implemented source intent | What was NOT guaranteed by merge |
|---|---|---|
| #165 | Five-only preaccept reads, Terms freeze, original C72, prompt size, no false HARD | Actual global Host tool exclusivity, original event authentication, preinstalled gateway |
| #166 | Canonical SHA-verified SVG, escaped six-slot renderer and text fallback | Native ChatGPT render hook, universal visual identity/actual display |
| #167 | Original-owner C72 postaccept reentry, first-turn witness comparison, stop-on-unknown | Actual GitHub connector→Node byte ingress and verified native distinct-turn provenance |
| #168 | AUTO planner, typed Node/bridge diagnostics, final HTML emitter | Actual Host dispatch of AUTO and final repository emitter on every ChatGPT message |
| #169 | First-turn SHA retention rule, Node executor, matrix/10k regression, postmerge prompt chain | Source callback implementation by Host; physical transfer; end-to-end original C72, EDU, C135/C87, native delivery/persistence; Project instruction installation readback |

#169 is now merged at `15aa360606d9d5abf522cddc02da9eef7a4ef1d2`. Published main check runs
include successful postmerge Node checks. CI success proves checkout-based source qualification,
not an installed Host adapter or a working provider integration.

Additional temporal/race and adversarial categories for this patch:
- Contract↔prompt drift: generator/BOOTSTRAP/source/matrix/test anchors must match.
- Cross-epoch drift: live HEAD must equal original first-turn SHA, never auto-repin.
- Overread before consent: no new preaccept calls, modules or source packet allowed.
- Callback/packet ambiguity: fail closed before invoking owner.
- Partial, reordered, duplicated, forged, oversized or mutated packet: typed STOP.
- Race/unknown during owner invocation: never replay the original owner.
- False source origin, fake provider event or fabricated native delivery: disallowed.
- Source on GitHub not in Node: CLI packet is only possible after physical transfer.
- CI artifacts misrepresented as field evidence: reject PRODUCT_GO.
- EXPLICIT HOST_ENGINEERING remains independent of runtime C72.
- Mode selection must still be another distinct human message.
- OneShell glyph/voice/ledger cannot be promoted on C72 admission alone.

## Minimal acceptance contract at three scales

**GLOBAL DoD (product/release):** The first-contact flow is unmodified. Fresh exact later
`I ACCEPT` causes real C72/v2 accepted and full introduction, then a further exact
`EDU`/ `CANONICAL` owner selection. New and old Host transports produce the same original
receipt semantics and no duplicate writer or owner. Every subsequent C135/C87/visual claim
retains independent runtime and provider readback requirements. A source CI green is
`SOFTWARE_PASS`, never automatic `PRODUCT_GO`.

**INTERMEDIATE DoD (host integration):** The Host chooses exactly one *actually callable*
carrier, freezes source HEAD, keeps the first-turn witness, observes physical Node ingress,
validates five Git blobs and original C72 output, discloses native-event/source-provenance
limits, and emits a typed first-edge STOP when capability is missing. The Host does not ask
a layperson to debug gateway internals or install arbitrary source before consent.

**LOCAL DoD (patch/regression):** Node20+Node22 actual owner success by callbacks and packet,
real separate process stdin success, corruption/duplicate/drift/dual-carrier negatives,
100,000 synthetic 5-axis port cases (NOT 100,000 native sessions), stable legacy tests,
generation source/route/size bounds, source-closure manifest match, CI on PR HEAD and
postmerge main. A separate field E2E must witness fresh native chat source ingress,
original C72 and mode, actual EDU loader/C135 and persistent delivery; pending field
evidence cannot be replaced with GitHub Actions labels.

## Anti-regression ownership

* Source: `contracts/project-host-capability-port.json` defines admissible effects;
  the existing C72 original validators remain untouched.
* Executable: `host/project-c72-capability-port.mjs` is the only new selectable port;
  `host/project-c72-host-recovery.mjs` still performs HEAD/blob/owner checks.
* Physical proof: one-shot `scripts/project-c72-portable-cli.mjs` with exit status and JSON.
* Propagation: `BOOTSTRAP.project_session`, `contracts/project-prompt-generation.json`,
  `project/session-chat/PROMPT.txt`, canonical generator, source manifest and CI all
  declare the same route; installed Project equality remains UNKNOWN until actually checked.
* Negative: dual carriers, no bridge, malformed bytes, owner failures, source drift and
  forbidden positive claims are asserted in `tests/project-c72-portable-bridge.test.mjs`.
* Governance: human reviews PR and merges manually only after CI. Branch protection/ruleset
  enforcement and native Host callback installation must be separately observed; GitHub
  workflow YAML cannot guarantee that a human cannot merge a failed check.

Do not regenerate or install a new prompt before **human merge** and a later explicit
Host engineering request. Prompt generation then uses exact verified main HEAD and immutable blobs.

---

## PR #171 – minimal critical path with mandatory reuse (25 October 2026)

The Host guarantees an *observable effect contract*, not the availability of any specific tool. Only after a real distinct exact `I ACCEPT` may it select and physically invoke ONE of three transports, then call the **unchanged** `executeC72PostAcceptRecovery` / original `reenterC72V2PostAccept`. No new C72 issuer, mode owner, C87 writer or model is created.

**Recycled primitives rather than cloned engines:**
- **C65 / PR #74:** pin main and each contents request to a single SHA; check the original Git blob identities independently.
- **C78 / PR #87:** retain the existing Node stdin JSON envelope and single-process physical result readback. The legacy packet ABI and CLI remain supported.
- **C98:** import its strict `isC98JSONDataTree` to reject executable descriptors and forged object shapes before consuming Node-local GitHub responses.
- **C103:** reuse the separation between an *effect/receipt test* and a native provider-event claim; success is not provider registration.
- **C104:** reuse its resumable materialization principle **only after EDU**. It is deliberately **not** imported into the atomic five-document C72 admission gate; C104's mode and cache owner would be wrong at this stage.
- **C95/C98 host file-bridge:** these prove only real host-supplied capabilities; mere callback names, registered-looking schemas and local fixtures do not install network routing.

**The new, smallest missing executable primitive** is `host/project-c72-physical-ingress.mjs`:
- `chooseC72HostCarrier`: pure, deterministic capability selection, with no network calls or consent issuance; picks `HOST_CALLBACKS`, `HOST_SOURCE_PACKET`, or `NODE_GITHUB_API` ONLY when there is an actual function/packet or an explicit Node HTTPS allowance. Multiple incompatible carriers are rejected, not arbitrarily combined. No carrier = typed `C72_SOURCE_BRIDGE_UNBOUND`.
- `createC72NodeGithubCallbacks`: allows the same original executor to run entirely in Node. Node's `https` library fetches precisely one public GitHub main ref and the five `contents/*?ref=<frozen SHA>` APIs. Requests are path-allowlisted, timeout/byte bounded, refuse redirects/non-200 responses, and validate source metadata, size, strict UTF-8, canonical Base64 and each Git SHA-1.
- `runC72SelectedHostIngress`: exact fresh-consent and owner-outcome gates come BEFORE any carrier I/O. Calls the existing `executeC72PostAcceptRecovery` **once**, which compares live HEAD against the original first-turn SHA witness and recomputes/validates original owner receipts. The selection labels remain Host observations, not native messages.
- `scripts/project-c72-portable-cli.mjs`: reused physical Node stdin gateway. Old source-packet JSON remains valid; an explicit `transport: "NODE_GITHUB_API"` without a packet invokes Node HTTPS instead. No implicit auto-retry or token/URL injection.

### Decision table (Host capability, not a platform guarantee)

| Actually observed capability | Machine choice | What the Host must prove |
|---|---|---|
| GitHub callback FUNCTIONS callable within the same Node process | `HOST_CALLBACKS` | 1 pinned live HEAD, 5 pinned byte bodies, 5 Git SHA-1 matches, original C72 accepted+intro |
| Exact five-source packet physically received by the Node process | `HOST_SOURCE_PACKET` | full packet validation, same five hashes and original C72 output; no invented API origin |
| Node code installed and outbound GitHub HTTPS explicitly permitted | `NODE_GITHUB_API` | Node performs the six REAL GitHub API calls itself, as above; DNS/network failure is a typed STOP |
| Connector and Node separately available but no callable cross-tool carrier and no permitted Node HTTPS | none | `C72_SOURCE_BRIDGE_UNBOUND`, not “transfer failed” or “C72 absent” |

A host may select the route manually or call `chooseC72HostCarrier` (`carrier:'AUTO'`). The selector is not a new runtime installer: it cannot make GitHub reachable from an isolated Node container. Host decides **how** to provision an authorized carrier; contract decides **what physical evidence** is required. The software is portable because all paths converge on one original owner, not because the Project prompt can provision platform tools.

### Counterexample tests / non-regression

Tests cover the three carrier positives, the legacy packet CLI, an invalid/duplicate carrier, network failure, stale main, wrong Git SHA-1, corrupt Base64, wrong file metadata, missing prior witness, non-exact consent, ambiguous Host IO and unknown owner outcomes. The 10k and 20k Cartesian negative suites are synthetic software states, *not* real ChatGPT sessions. The Node20/22 workflows qualify source + CI only. Run an **actual native Host field test** separately to show connector ingress -> Node file/HTTPS read -> original C72 receipt -> complete original introduction -> native transcript delivery. If that native field test is unavailable, `PRODUCT_NO_GO` and `NO_VOICE` remain mandatory.

**Anti-regression:**
1. A new mode, writer or C72 implementation is forbidden. Do not alter original C72 accepted/intro validators.
2. Any missing/unknown node, callback, source, origin, or owner result is a fail-closed typed edge. A read failure is NOT a successful retry authorization.
3. Preconsent remains exactly one main HEAD + five direct original documents; this Node module must not run until the separate `I ACCEPT` has actually been observed.
4. Current GitHub Project prompt text must stay within 8000 bytes/chars, including its 210-byte pinned prefix.
5. The current chat SOURCE_LOCK never repins because engineering commits changed the PR branch. Only a later human merge + separate release step can generate a new installed prompt candidate.
6. Repo CI success cannot attest native ChatGPT tool registration, human event authentication, UI rendering, worker persistence or transport permission.
