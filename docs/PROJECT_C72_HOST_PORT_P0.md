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
