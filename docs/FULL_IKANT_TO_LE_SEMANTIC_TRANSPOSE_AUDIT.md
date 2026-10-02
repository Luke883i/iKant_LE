# Full iKant -> iKant_LE semantic transposition audit

**Materialized analysis only — no runtime change and no PR opened by this branch.**

- iKant source head audited: `c300bf237aa9e317f71038ecf0d83e095dec2a99` (main after merged PR #183)
- iKant_LE source head audited: `3913990c99849889a9df2ee61454e347e8306f5f` (merged PR #32)
- Active frontier inspected: iKant PR #184, open/non-draft, head `34007ce4fc9756e954abd5ad9239e7446347ca6c`
- Repository census: 1019 blobs; 53 root contract/control documents; 198 top-level Python semantic/runtime modules; 206 tests; 255 scripts; 32 workflows.

## Executive conclusion

PR #32 solved the immediate LE materialization deadlock by admitting a verified opaque relay, but it solved it with more ontology than is necessary. Full iKant's latest trajectory shows a tighter normal form: keep product/lifecycle owners stable, represent host facts as typed evidence, make retry memory durable, expose exactly one NEXT, close the first physical edge mechanically, and compress the prompt only after runtime semantics are already owned.

For LE I would therefore **retain the verified opaque relay capability but refactor C27 from a parallel activation ontology into a subgraph of the existing canonical bootstrap boundary**. In other words: keep the mechanism, delete or demote redundant state vocabulary.

The target LE normal form should be:

```text
HUMAN_GATE
-> SOURCE_SNAPSHOT
-> H0 HOST EVIDENCE
-> ONE CANONICAL INGRESS DECISION
-> DURABLE BYTE-PATH RECEIPT
-> MATERIALIZE + REOPEN
-> EXECUTED PROVENANCE
-> RUNTIME BIND
-> WRITER / ACTIVE READBACK
```

with `LOCAL_DIRECT` and `VERIFIED_OPAQUE_RELAY` as carrier classes **under the ingress owner**, not as new product/runtime identities.

## 1. Audit of iKant_LE PR #32

### Final state

PR #32 was merged. Its final head was `b58bc376dda94ac7742f8edca14ce5979866f56d`; merge commit `3913990c99849889a9df2ee61454e347e8306f5f`. Final exact-head CI reported 16/16 check runs successful.

### What #32 got right

1. It identified the real topology: source visible through connector, local processor/FS available, local HTTPS/file export absent.
2. It correctly distinguished model **transport** from model **authority**.
3. It made opaque relay valid only with `OPAQUE_TRANSPORT_ONLY`, authority zero, no rewrite, no semantic equivalence, roundtrip verification and source/arrival samehash.
4. It kept materialization/reopen, executed provenance, live probe and ACTIVE readback downstream.
5. It corrected the specific false classification `N3_BRIDGE_PROBE_REQUIRED != HOST_UNAVAILABLE`.
6. It regenerated the content-addressed runtime-root and eventually closed the full repository CI matrix.

### What went wrong during the PR

The first candidate broke three existing invariants:
- C24's canonical boundary was expanded from six nodes to seven instead of adding C27 below an existing owner.
- missing relay samehash initially surfaced as `DEGRADED`, not `BLOCKED_INTEGRITY`.
- fixture/meta-prompt integration drift caused test/parser failures.

The later commits repaired those failures, including introducing `BYTE_PATH_POLICY_VIOLATION` as an integrity class and reconciling C24 tests.

### Residual anti-entropy debt still visible after merge

1. **Dual state vocabularies.** LE now has canonical runtime availability states and a second N0-N8 projection. The contract calls N0-N8 projection-only, but this still creates cognitive and implementation surface.
2. **Host-instance facts in canonical contract.** `current_host_reference`, `unique_machine_path=VERIFIED_OPAQUE_RELAY`, and a specific N3 current-host projection are evidence-instance facts better stored as receipts/fixtures, not durable semantic contract.
3. **Stale prose survived C25.** `LOCAL_EXECUTOR_UNAVAILABLE` still says objects must be obtained “without making bytes pass through the model”, which contradicts C27's verified relay. Some older activation claims still broadly forbid “model-mediated bytes” while later clauses allow the verified relay.
4. **Legacy transport readers keep the old binary rule.** This is acceptable only if they remain compatibility-only and cannot leak back into canonical v2 classification.
5. **Stage N8 + integrity overlay is awkward.** A projection can compute N8 while `active=false` because a blocker overlays it. That is mathematically possible but semantically noisy; full iKant prefers lifecycle truth and blocker/evidence truth to remain separately owned.
6. **Mutation evidence is strong but not physical evidence.** #32 states this correctly; that boundary must remain.

## 2. Latest six merged PRs in full iKant

| PR | Purpose | Mechanism | Reusable invariant for LE |
|---|---|---|---|

| #178 | close V3 physical remediation + transfer | separate remediable read-only preaccept incident from hard breach; physical runtime gate; human fallback transport never changes machine NEXT | incident class is evidence, not retroactive authority; bridge != materialization != runtime; CI != current host |
| #179 | converge local-host fastboot envelope | HostChannelReceipt + exactly one FastbootStep + generated deterministic shell | capability ledger is evidence; UNAVAILABLE persists until changed evidence; model never selects carrier/fallback; no side infrastructure |
| #180 | close durable physical bootstrap to BIND | H0 barrier; durable Fastboot ledger; idempotent broker; resumable/parallel relay; per-chunk and aggregate samehash; bind real L3 runtime | same decision + same evidence never re-executes; partial success is durable; scheduler has zero authority; first unclosed edge governs progress |
| #181 | harden host authority + deterministic identity | retry history ledger-only; HOST_ATTESTED explicit; deterministic slice ZIP identity | caller/chat memory cannot create retry state; host attestation != local physical proof; content identity ignores incidental checkout metadata |
| #182 | harden generated metaprompt | projection-only correction after runtime was already closed | prompt follows runtime; no new runtime behavior/owner/schema; generated document + falsifier move together |
| #183 | unify private bootstrap transport envelope | single transport contract with priority ordering and private raw/attachment handoffs | carrier plurality lives under one envelope; preserve acceptance/PIN; URLs are JIT/ephemeral; human gesture is transport only; samehash remains mandatory |

### Trajectory across #178 -> #183

The sequence is not six independent features. It is a single convergence loop:

1. **Classify the real physical gap** instead of redesigning around it (#178).
2. **Represent host observations as zero-authority typed evidence and choose one NEXT** (#179).
3. **Persist failure/progress so the system cannot narratively retry the same edge** (#180).
4. **Separate attestation from physical proof and make artifact identity deterministic** (#181).
5. **Regenerate/compress the prompt from runtime-owned semantics** (#182).
6. **Unify carrier plurality beneath a single transport envelope** (#183).

This is the pattern LE should copy.

## 3. Current full-iKant frontier: PR #184

There is **no open draft PR** at audit time. PR #184 is open and non-draft; it is the current frontier.

Its proposed closure is:

```text
SEALED_FRAME
-> APP_RENDER
-> POST_RENDER_VISIBLE_READBACK
-> APP_ONLY_TOOL_CALLBACK
-> HOST_PLATFORM_DELIVERY_ACK
-> EGRESS_ACK_COMMIT
-> CAUSAL_EXACT_ACK
-> SURFACE_B_READBACK
-> SESSION_PROTOCOL_HONORED
-> NERVOUS_SYSTEM_CLOSURE_RECEIPT
```

Key idea: once the repository already has a real platform callback, one durable receipt must bind that callback to every downstream runtime consequence. Model prose, user echo, PRE_DISPLAY_SEAL, source receipts, host attestation and BIND are explicitly insufficient substitutes.

**Transfer to LE:** copy this only if LE's product promise includes exact post-render platform closure. Do not make bootstrap/ACTIVE depend on a hosted plugin unless that platform callback is part of LE's chosen activation modality.

A second important observation: #184 was branched from pre-#183 main (`9c6897...`) while current main includes merged #183. Before merge, #184 should therefore be semantically reconciled against the new transport envelope rather than mechanically accepted as if #183 did not exist.

## 4. Full semantic census of top-level iKant modules

The census below assigns every one of the 198 top-level `ikant/*.py` modules exactly once. The grouping is architectural, not a claim that a module has only one responsibility.


### A — Admission, consent, constitutional authority

**LE disposition:** ADAPT: preserve Terms-first gate, exact acceptance, zero-authority pre-runtime; do not copy full rights/approval breadth unless LE needs it.

`ikant/admission.py`, `ikant/approvals.py`, `ikant/authority.py`, `ikant/chat_admission.py`, `ikant/commitments.py`, `ikant/native_authorization.py`, `ikant/pre_admission.py`, `ikant/rights_policy.py`, `ikant/web_authorization.py`

### B — Bootstrap, transport, materialization

**LE disposition:** DIRECTLY TRANSPOSE: this is the highest-value family for LE. Keep existing LE materializer, add durable H0/ledger/first-unclosed-edge semantics below it.

`ikant/bootstrap_http.py`, `ikant/bootstrap_observability.py`, `ikant/bootstrap_runtime.py`, `ikant/download_manager.py`, `ikant/github_connectivity_closure.py`, `ikant/materialization.py`, `ikant/materialization_bridge.py`, `ikant/session_artifact_ingress.py`, `ikant/session_bootstrap_surface.py`, `ikant/session_physical_bridge.py`, `ikant/session_verified_root_process.py`, `ikant/transport.py`

### C — Host negotiation, runtime binding, lifecycle

**LE disposition:** ADAPT MINIMALLY: import capability/evidence separation and runtime binding rules; avoid full hosted/web lifecycle machinery.

`ikant/abstraction_runtime.py`, `ikant/agency_host.py`, `ikant/cognitive_runtime.py`, `ikant/demo_runtime.py`, `ikant/deployment_reality.py`, `ikant/engine_exit_diagnostics.py`, `ikant/engine_supervisor.py`, `ikant/enterprise_runtime.py`, `ikant/governance_runtime.py`, `ikant/host.py`, `ikant/host_adapter.py`, `ikant/host_capabilities.py`, `ikant/host_capability.py`, `ikant/host_cli.py`, `ikant/host_conformance.py`, `ikant/host_negotiation.py`, `ikant/host_sdk.py`, `ikant/host_v05.py`, `ikant/hosted_app_surface.py`, `ikant/hosted_mcp_service.py`, `ikant/invariants_runtime_v030.py`, `ikant/local_host_adapter.py`, `ikant/local_host_fastboot.py`, `ikant/local_http.py`, `ikant/local_service.py`, `ikant/local_web_host.py`, `ikant/managed_runtime.py`, `ikant/native_host.py`, `ikant/native_runtime.py`, `ikant/runtime.py`, `ikant/runtime_epoch.py`, `ikant/runtime_epoch_base.py`, `ikant/runtime_host.py`, `ikant/runtime_recovery.py`, `ikant/session_host.py`, `ikant/session_runtime_envelope.py`, `ikant/web_host.py`, `ikant/web_runtime.py`

### D — SESSION_CHAT surfaces, egress, hosted return path

**LE disposition:** PARTIAL: retain LE artifact-first release; add post-render callback closure only if exact platform ACK is an LE product requirement.

`ikant/chat_session.py`, `ikant/chatgpt_app_bridge.py`, `ikant/human_frame.py`, `ikant/human_surface_protocol.py`, `ikant/session_activation_instruction.py`, `ikant/session_chat_message.py`, `ikant/session_chat_self.py`, `ikant/session_egress.py`, `ikant/session_image_epoch.py`, `ikant/session_multisurface.py`, `ikant/surface_contract.py`, `ikant/surfaces.py`, `ikant/voice_input.py`

### E — Execution, agency, action governance

**LE disposition:** MOSTLY KEEP LE: full action/agency stack is out of scope for bootstrap repair.

`ikant/action_governance.py`, `ikant/agency_kernel.py`, `ikant/execution_handoff.py`, `ikant/execution_protocol.py`, `ikant/execution_receipts.py`, `ikant/incarnate.py`, `ikant/native_actions.py`

### F — Durable state, persistence, provenance

**LE disposition:** DIRECTLY TRANSPOSE selected invariants: durable retry ledger, exact provenance, writer/readback ownership.

`ikant/causal_crc.py`, `ikant/causal_ledger.py`, `ikant/component_manifest.py`, `ikant/component_store.py`, `ikant/crc.py`, `ikant/graph_persistence.py`, `ikant/native_snapshot.py`, `ikant/provenance.py`, `ikant/store.py`, `ikant/web_snapshot.py`

### G — Cognition, intent, planning, practical reason

**LE disposition:** DO NOT COPY for bootstrap; LE already has its lighter cognitive plane.

`ikant/central.py`, `ikant/cognitive.py`, `ikant/cognitive_controls.py`, `ikant/cognitive_v05.py`, `ikant/decision_lattice.py`, `ikant/dynamics.py`, `ikant/intent_horizon.py`, `ikant/intent_horizon_context.py`, `ikant/intent_reconciliation.py`, `ikant/interaction.py`, `ikant/outcome_reconciliation.py`, `ikant/plan_graph.py`, `ikant/planning.py`, `ikant/practical_reason.py`, `ikant/reactive_hybrid.py`, `ikant/self_regulation.py`

### H — Epistemics, calibration, oracle, world model

**LE disposition:** ADAPT claim-boundary patterns only: evidence != permission, attestation != physical proof, semantic mutation != host proof.

`ikant/calibration.py`, `ikant/capability_truth.py`, `ikant/epistemic_core.py`, `ikant/epistemic_http.py`, `ikant/epistemic_projection.py`, `ikant/epistemic_revision.py`, `ikant/epistemic_revision_base.py`, `ikant/epistemic_revision_reduce.py`, `ikant/epistemic_workspace.py`, `ikant/experience_projection.py`, `ikant/foundation.py`, `ikant/neurofunctional.py`, `ikant/oracle.py`, `ikant/physical_oracle.py`, `ikant/world_model.py`

### I — Memory, temporal autonomy, background continuity

**LE disposition:** DO NOT COPY for the activation fix; preserve LE memory/runtime boundaries independently.

`ikant/background_cognition.py`, `ikant/dependency_invalidation.py`, `ikant/dialogic_continuity.py`, `ikant/memory_governance.py`, `ikant/read_index.py`, `ikant/temporal_autonomy.py`, `ikant/temporal_core.py`, `ikant/temporal_memory.py`, `ikant/temporal_replay.py`

### J — Identity, self, ontology, psyche, relational layer

**LE disposition:** KEEP LE-native; borrow only provider-is-not-primary-identity and self-report provenance if needed.

`ikant/enduser_identity.py`, `ikant/ontology.py`, `ikant/proto_self.py`, `ikant/psyche.py`, `ikant/relational_nuance.py`, `ikant/self_manifest.py`

### K — Model/provider/compute/connector routing

**LE disposition:** ADAPT connector/compute capability truth; do not import full model broker topology.

`ikant/commercial_assist.py`, `ikant/compute_routing.py`, `ikant/connector_capability.py`, `ikant/connector_connection.py`, `ikant/egress_compute_eligibility.py`, `ikant/future_supply.py`, `ikant/model.py`, `ikant/model_broker.py`, `ikant/model_manager.py`, `ikant/model_router.py`, `ikant/provider_assist.py`, `ikant/provider_connection.py`, `ikant/reticular_model_broker.py`

### L — Web/native managed agency and embodiment

**LE disposition:** DO NOT COPY into SESSION_CHAT_LOCAL bootstrap.

`ikant/advanced_web_shell.py`, `ikant/advanced_web_shell_base.py`, `ikant/local_app.py`, `ikant/native_agency.py`, `ikant/native_driver.py`, `ikant/web_actions.py`, `ikant/web_agency.py`, `ikant/web_driver.py`, `ikant/web_entry_security.py`, `ikant/web_frame.py`

### M — Product/UI/public/enterprise projections

**LE disposition:** DO NOT COPY except generated prompt/surface anti-entropy discipline.

`ikant/app_cli.py`, `ikant/cli.py`, `ikant/dashboard.py`, `ikant/dashboard_v05.py`, `ikant/demo_conformance.py`, `ikant/demo_experience.py`, `ikant/enterprise_context.py`, `ikant/human_dashboard.py`, `ikant/product_experience.py`, `ikant/public_v1.py`, `ikant/v05_cli.py`

### N — Governance, repository truth, invariants, trust

**LE disposition:** DIRECTLY TRANSPOSE compressed governance: owner map, debt catalog, claim-specific receipt, negative test, changed-file ratchet.

`ikant/_invariants_base.py`, `ikant/invariants.py`, `ikant/invariants_legacy_s15.py`, `ikant/invariants_s21.py`, `ikant/network_destination.py`, `ikant/repository_context.py`, `ikant/repository_genesis.py`, `ikant/repository_meta_controller.py`, `ikant/secret_custody.py`, `ikant/task_governance.py`, `ikant/trust_connections.py`, `ikant/trust_surface.py`, `ikant/validation.py`

### O — Reticular / abstraction / RCR architecture

**LE disposition:** DO NOT COPY into LE bootstrap; orthogonal research/product capability.

`ikant/abstraction_scaffold.py`, `ikant/hybrid_retrieval.py`, `ikant/rcr_e2e.py`, `ikant/rcr_hybrid.py`, `ikant/rcr_synaptic.py`, `ikant/reticular_cognition.py`, `ikant/reticular_qualification.py`

### P — Core utilities and residual cross-cutting owners

**LE disposition:** CASE-BY-CASE; no new owner unless a concrete LE gap survives owner-collision scan.

`ikant/__init__.py`, `ikant/__main__.py`, `ikant/external_ingress.py`, `ikant/information_classification.py`, `ikant/local_security.py`, `ikant/reactive_http.py`, `ikant/remote_session.py`, `ikant/t0_closure.py`, `ikant/t0_physical_convergence.py`


## 5. Root semantic contracts/control documents

The current main exposes 53 root-level JSON/Markdown contract/control documents:

- `ADMISSION.json`
- `AGENTS.md`
- `AS_IS_CLOSURE_CONTRACT.json`
- `BOOTSTRAP.json`
- `C2_PRODUCT_CONVERGENCE_CONTRACT.json`
- `C3_VERTICAL_CONVERGENCE_CONTRACT.json`
- `C4_CONVERGENCE_CONTROL_CONTRACT.json`
- `D0_DIALOGIC_BACKGROUND_CONTRACT.json`
- `DEPLOYMENT_REALITY_CONTRACT.json`
- `ENGINEERING_GOVERNANCE_CONTRACT.json`
- `ENGINEERING_LATTICE.json`
- `ENTERPRISE_CANDIDATE_PROFILE.json`
- `EPX0_ENDUSER_COMPRESSION_CONTRACT.json`
- `FRC_FEDERATED_REPOSITORY_META_CONTROLLER_CONTRACT.json`
- `FRC_GENESIS_AUTONOMY_CONTRACT.json`
- `G1_INTENT_HORIZON_COMPILER_CONTRACT.json`
- `HARDEN_NETWORK_DESTINATION_CONTRACT.json`
- `ID0_1_UI_SEMANTIC_GEOMETRY_HARDENING_CONTRACT.json`
- `ID0_VISUAL_IDENTITY_CONTRACT.json`
- `IKANT_ACCESS_CONTRACT.md`
- `IKANT_DEVELOPMENT_BUNDLE.json`
- `IKANT_SELF_MANIFEST.json`
- `IRX0_CONVERSATIONAL_PRESENCE_HANDOFF_CONTRACT.json`
- `IS0_INFORMATION_SOVEREIGNTY_CONTRACT.json`
- `LRS_Q0_RETICULAR_CAPABILITY_QUALIFICATION_CONTRACT.json`
- `MODEL_RUNTIME.json`
- `P0_ORACLE_CONTRACT.json`
- `PC0_2_LE_RELATIONAL_NUANCE_CONTRACT.json`
- `PC0_PRODUCT_COHERENCE_CONTRACT.json`
- `PRODUCT_CONTRACT.json`
- `PRODUCT_CONVERGENCE.json`
- `PRODUCT_MATURITY.json`
- `PRODUCT_TRAJECTORY.json`
- `R0_COMPUTE_TRUTH_CONTRACT.json`
- `RCR_E2E_CONTRACT.json`
- `RCR_RUNTIME_CONTRACT.json`
- `RCR_SYNAPTIC_FRONTIER_CONTRACT.json`
- `README.md`
- `REPOSITORY_GOVERNANCE.json`
- `RIGHTS.json`
- `RIGHTS.md`
- `SESSION_CHAT_PHYSICAL_RUNTIME_V3_CONTRACT.json`
- `T0_1_IDENTITY_STATE_CONTRACT.json`
- `T0_2_SECRET_CUSTODY_CONTRACT.json`
- `T0_3_MODEL_PROVIDER_CONNECTION_CONTRACT.json`
- `T0_4_CONNECTOR_CONNECTION_CONTRACT.json`
- `T0_5_CANONICAL_TRUST_SURFACE_CONTRACT.json`
- `T0_6_CLOSURE_CONTRACT.json`
- `T0_6_PHYSICAL_EXTERNAL_CONVERGENCE_CONTRACT.json`
- `T0_TRUST_CONNECTIONS_DESIGN.json`
- `U0_WEB_SETUP_CONTRACT.json`
- `U1_COGNITIVE_CONTROLS_CONTRACT.json`
- `V11_DOD.json`

For LE, the most important concepts to transpose are not the full files but these owner patterns:

- `IKANT_ACCESS_CONTRACT.md` / `ADMISSION.json`: single human gate, Terms-first, source-bound admission.
- `BOOTSTRAP.json`: source/materialization contract, but carrier plurality must stay below content identity.
- `DEPLOYMENT_REALITY_CONTRACT.json`: product mode, activation modality, runtime ladder and host evidence are orthogonal.
- `AS_IS_CLOSURE_CONTRACT.json`: debt catalog with explicit owner, exit condition and claim boundary.
- `ENGINEERING_LATTICE.json`: owner collision scan and hard dependency closure before adding a semantic node.
- `ENGINEERING_GOVERNANCE_CONTRACT.json`: changed-file ratchet, falsification and claim-specific evidence.
- `PRODUCT_CONTRACT.json` / `PRODUCT_TRAJECTORY.json`: product truth is not the same thing as bootstrap implementation detail.

## 6. What should be transposed into LE

### Tier 1 — transpose directly

1. **H0 physical barrier.** Resolve local processor/FS/exec and source visibility before traversal.
2. **Typed host evidence.** Pre-runtime observations are `HOST_ATTESTED`/authority-zero until local write/reopen/hash/probe proves physical truth.
3. **Durable Fastboot ledger.** The ledger, not chat/model memory, owns attempted decisions and retry state.
4. **decision_key + evidence digest.** Same decision + unchanged evidence + prior non-progress => stop/wait; never retry narratively.
5. **FIRST_UNCLOSED_EDGE.** The earliest missing physical receipt is the only frontier that matters.
6. **Verified opaque relay.** Preserve the C27 relay law exactly, but make it one transport implementation under a single ingress owner.
7. **Per-object + aggregate identity.** Source identity, arrival identity, local reopen and aggregate root must all close.
8. **Deterministic artifact identity.** Retry/cache identity comes from semantic content/source PIN, never incidental filesystem metadata.
9. **Materialization -> executed provenance -> BIND -> ACTIVE readback.** Never collapse these into one receipt.
10. **Generated host prompt.** Prompt is a bounded projection of machine-owned semantics and becomes guard-only after BIND.

### Tier 2 — adapt, do not copy wholesale

- Full runtime ladder: LE can keep a much smaller ladder but should preserve the distinction between real bound degraded runtime and ACTIVE.
- Transport envelope from #183: keep the single-envelope design; omit private-repository handoff classes if LE's public repository and current host do not need them.
- AS-IS/AIC debt catalog: implement a compressed LE variant mapping `gap -> owner -> required receipt -> negative test -> exit condition`.
- Claim-specific physical witness validator: useful for relay/materialization/provenance/current-host claims.
- Post-render nervous-system receipt from #184: only if exact UI callback/readback becomes an LE product obligation.

### Tier 3 — deliberately do not transpose

Do not import full iKant's web/native agency stacks, enterprise runtime, reticular cognition, large model broker, advanced shell, product UI matrix, temporal/autonomy stack, or hosted deployment machinery merely to solve local SESSION_CHAT activation. Those would increase LE's semantic attack surface without closing an earlier physical edge.

## 7. Irreducible LE target lattice

I would collapse C27 and the older C24/C25 vocabulary to six semantic owners, while preserving detailed evidence underneath:

```text
1 HUMAN_GATE
2 SOURCE_SNAPSHOT
3 LOCAL_INGRESS
  - H0 capability evidence
  - canonical decision
  - LOCAL_DIRECT | VERIFIED_OPAQUE_RELAY
  - durable retry ledger
  - first-unclosed-edge
4 LOCAL_MATERIALIZATION
  - exact object identity
  - atomic publish
  - reopen
5 EXECUTED_RUNTIME_PROOF
  - executed-code provenance
  - live non-injectable probe
  - runtime bind
6 ACTIVE_READBACK
  - single writer
  - persisted ACTIVE
  - reopen/readback
```

The current N0-N8 vocabulary can remain a **diagnostic renderer**, computed from these receipts, but should not be persisted as a second state machine and should not appear in the constitutional boundary.

## 8. Concrete migration plan from current LE main

### M0 — freeze semantics and audit current C27
- Keep PR #32 merged state as baseline.
- Add an owner-collision audit proving which C27 concepts are new mechanisms versus duplicate semantic nodes.
- Move `current_host_reference` out of contract and into a reality-seeded fixture/receipt.

### M1 — durable H0 / Fastboot evidence
- Reuse `fastboot-convergence.mjs`; do not create another planner.
- Extend its ledger so it owns channel evidence and retry history.
- Encode `HOST_ATTESTED` vs `LOCAL_PHYSICAL` explicitly.
- Make unchanged failed `decision_key` non-retryable until evidence changes.

### M2 — collapse byte path into the existing ingress owner
- Keep `LOCAL_DIRECT` and `VERIFIED_OPAQUE_RELAY`.
- Delete/demote any contract node whose only purpose is to restate those as product/runtime ontology.
- Preserve relay roundtrip, exact object identity, no rewrite/equivalence, local write/reopen and samehash.

### M3 — receipt-chain closure
- Source object receipt.
- Byte ingress receipt.
- Materialization receipt.
- Executed provenance receipt.
- Runtime bind receipt.
- ACTIVE commit/readback receipt.
- Project `first_unclosed_edge` from those receipts.

### M4 — anti-entropy projection
- Generate `LOCAL_HOST_META_PROMPT.md` only from the canonical machine contracts.
- Delete stale statements such as “model bytes never cross the model” where the verified opaque relay is canonical.
- Add contradiction tests so old binary data-plane language cannot coexist with verified relay law.

### M5 — qualification
- Reality-seeded unit tests for the exact host topology that caused the original failure.
- 1M semantic campaign is sufficient if the state space is saturated and mutant deletion oracle is strong; increase count only if novelty remains.
- Exact-head runtime-root regeneration.
- Full CI.
- Physical session witness remains separate and is never replaced by CI.

### M6 — optional post-render closure
Only after activation is stable: if LE promises exact UI delivery, adapt #184 as a small egress receipt. Keep external platform deployment/registration as an explicit external gap.

## 9. DoD I would require

### Global

LE has one SESSION_CHAT_LOCAL activation modality, one lifecycle truth owner, one durable retry-memory owner, one materializer, one executed-provenance owner and one ACTIVE writer. No semantic state may be promoted by model prose, CI, source identity, host attestation or semantic mutation alone.

### Intermediate

- Admission: exact human gate + frozen source.
- Ingress: H0 + one NEXT + durable ledger + verified carrier.
- Materialization: atomic publish + reopen + source/arrival identity.
- Execution: exact executed provenance + runtime bind.
- Activation: writer + ACTIVE readback.
- Projection: prompt/document generated from machine truth.
- Qualification: contradiction tests + mutation + exact-head CI + separate physical witness.

### Local

Every retained semantic node must have:
`owner -> invariant -> receipt/observable -> negative test -> recovery rule -> claim boundary`.

If a proposed node cannot provide that chain, it should be folded into an existing owner or rejected.

## 10. Why this is the scalable path

The full repo's latest six merges converge on the same engineering law: **physical gaps are closed by durable, claim-matched receipts and monotonic owner transitions, not by adding descriptive states**.

Applied to LE, that means the verified opaque relay remains, but C27 becomes smaller:
- fewer parallel taxonomies;
- less stale prompt prose;
- no host-instance facts in constitutional contracts;
- no repeated materialization crash loop;
- deterministic retries;
- a single first-unclosed edge;
- ACTIVE remains runtime-owned and mechanically read back.

That is the transferable essence of full iKant without turning LE back into full iKant.
