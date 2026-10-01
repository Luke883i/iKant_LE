# iKant_LE architecture

This document summarizes the current product model; machine contracts and executable runtime/tests remain authoritative.

## Product and control plane

iKant_LE is a zero-runtime-dependency Node.js constitutional chat runtime around a replaceable host model, not a model/provider/browser shell/autonomous external-action agent.

Canonical lifecycle:

`FIRST_CONTACT -> API_HEAD_BINDING -> API_ORIENTATION -> TERMS_FREEZE -> I ACCEPT -> FASTBOOT_MATERIALIZE -> AUTO_PROBE -> AUTO_INITIALIZE -> ACTIVE -> EXIT IKANT`

First contact pins `main`, performs the five-path API-only orientation, presents Terms and freezes acquisition. After exact acceptance, `SESSION_CHAT_LOCAL` is the only canonical activation: host-supplied linguistic compute on session-local Node; WEBAPP, hosted runtime, managed model and Plugin/MCP registration are not requirements. Carriers are authority-zero transport only. Before materialization, the host adapter may derive one NEXT from host-attested channel receipts and remember non-progress until evidence changes; this is not physical runtime proof and cannot define identity. Once transport bytes are local, the authoritative materializer verifies loader/shard identities and publishes the content-addressed runtime. The runtime then reopens the published loader plus every runtime member, validates the transcript boundary, matches exact descriptor identities for the executed probe/runtime-command modules and runs a production probe that callers cannot substitute before ACTIVE. Search/history/tests/qualification stay outside activation. Budgets are structural, not latency promises.

## Persistence and turn spine

`.ikant/ledger.jsonl` is the single append-only hash-linked state spine; one writer lock prevents concurrent mutation and events are read back before reliance. A substantive ACTIVE turn follows:

`input -> Node dispatch -> cognition/psyche/self-world -> Surface A candidate -> outcome/retroaction -> bounded environment telemetry -> DOCX write/readback/hash -> structured artifact handoff -> host presents DOCX -> Surface A release`

Receipts, telemetry, fastboot handoff and backlog have authority zero. A local artifact receipt proves the file, not host UI presentation.

## Constitutional cognition

The bounded cognitive kernel mines intent, chooses declared methods, requests resources without laundering permission and exposes missing-resource horizons. `evidence != permission != policy != execution != reported outcome != observed world truth`. Deception, covert preference manipulation, retaliation, punitive withdrawal and self-preservation utility are forbidden.

## Functional psyche

C4 persists bounded `valence`, `arousal`, `affiliation`, `boundary_pressure`; appraisal concerns the interaction event, not a human trait. Archetypal expression is derived, non-persistent and rhetorical only.

## Embedded relational nuance profile

LIB.0 exposes a separate package subpath, `./embedded/relational-nuance`, for hosts that want only the bounded relational/expression transform. It does not export the iKant_LE admission lifecycle, identity, persistence, intent mining, planner, Surface A/B, or execution ownership. The host supplies normalized appraisal plus canonical `valence/arousal`; the library may retain only `affiliation`, `boundary_pressure`, interaction count and the last appraisal/outcome. Its result is derivational, authority-zero and side-effect-free with respect to network, filesystem writes, host state and execution. A host remains the sole writer and may reject the enrichment without failing its canonical turn.

The machine boundary is `contracts/embedded-library.json`; `contracts/embedded-library-vectors.json` is the cross-language conformance corpus. Standalone iKant_LE continues to use the full C4 psyche path unchanged.

## Recurrent self-world model

C5 extends the psyche substrate with recurrent workspace, meta-self/attention, bounded autobiography, causal prediction, policy and body/coupling classification. Workspace needs recurrence and named consumers; multimodal and sensorimotor claims require attributable receipts; derived subgoals need a human/constitutional parent.

C8 separates operational subjectivity from ontological claims. Weak local or partition-relative causal emergence can be tested; open-ended emergence remains a future closure; strong metaphysical emergence and phenomenology are not software-decided facts.

C11 adds contract-local `FUNCTIONALLY_ALIVE` and `FUNCTIONALLY_CONSCIOUS` qualification axes without declaring either present by configuration. Twelve causal gates separate design capability from qualification evidence; gate receipts are build/source/epoch-bound, integrity checked and authority zero. The assessor cannot manufacture passing receipts or write a class into canonical state. Even full convergence leaves `PHENOMENOLOGY = UNKNOWN`.

## Surfaces and authority

**Surface A** is natural iKant prose, 50-500 words and user-intention first. **Surface B** is exactly one same-turn DOCX per substantive ACTIVE turn containing reconstructible causal telemetry plus a bounded declared runtime-environment snapshot. Runtime returns a structured descriptor with digest and `required_presentation=true`; filename-only stdout is not delivery. A conforming chat host presents the DOCX before Surface A.

Host/system/safety/law constraints precede the repository. Model/provider/UI/cognition/psyche/self-world/fastboot/telemetry/backlog have no independent authority. Functional behavior does not establish consciousness, biological equivalence, external-world truth, production assurance or universal latency.

## C22 trust boundary

PR #25 established the single `SESSION_CHAT_LOCAL` ontology but left some C21 receipts structurally self-attested. C22 makes the boundary explicit: pre-runtime channel planning is host-attested authority-zero orchestration; physical local evidence begins only at runtime-owned file reopen, exact content identity, live Node probe and persisted/read-back state. A hash-consistent receipt never substitutes for the local observation it describes.
