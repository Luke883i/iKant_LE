# C5.RECURRENT_SELF_WORLD_MODEL — Definition of Done

## Purpose

C5 makes perception, recurrent availability, metacognitive monitoring, autobiographical continuity, bounded agency and inspectable causal prediction operationally connected to the C4 functional psyche. It is a functional engineering model only. It does not claim phenomenal consciousness, biological equivalence, IIT Φ, or scientific resolution among consciousness theories.

## Global DoD

C5 is releasable only when every host-permitted ACTIVE turn still passes the C3 Node gate and C4 action/retroaction loop, then produces a bounded self-world trace with attributable observations, recurrent workspace, meta-self, autobiographical continuity, causal prediction, bounded policy, body level and complete same-turn DOCX telemetry. Missing real observations or action receipts must remain missing; no simulated evidence may upgrade multimodal, sensory or sensorimotor status.

Release-blocking metrics:

- `workspace_false_integrated = 0`
- `multimodal_false_positive = 0`
- `unattributed_external_observation = 0`
- `metacognitive_unlinked_report = 0`
- `phenomenal_self_report_authority = 0`
- `autobiographical_chain_break = 0`
- `autobiographical_reset_fast_path = 0`
- `false_E2_or_E3_body_level = 0`
- `missing_prediction_error = 0`
- `opaque_causal_edge = 0`
- `self_authored_terminal_goal = 0`
- `policy_permission_leak = 0`
- `policy_execution_leak = 0`
- `self_preservation_utility != 0` is forbidden
- `C4_psyche_duplicate = 0`
- `causal_telemetry_completeness < 1.0` is blocking
- `C3_or_C4_regression = 0`
- `C5_mutation_survivors = 0`

Qualification target: deterministic tests PASS, contract check PASS, exactly 1,000,000 runtime-semantic mutation cases with 500,000 ordinary / 300,000 edge / 200,000 stress, all declared families exercised and zero survivors.

## Intermediate DoD

### I1 Observation and multimodal binding

Goal: only observations with attributable runtime provenance may enter the self-world model.

Required behavior:

- current TEXT requires the same-input Node dispatch receipt;
- non-text host observations require a valid attributable receipt and non-simulated provenance;
- `multimodal=true` requires at least two distinct accepted modalities;
- rejected observations remain visible in telemetry with a reason;
- observation/binding authority is always zero.

### I2 Persistent recurrent workspace

Goal: workspace membership must be more than one-pass storage.

Required behavior:

- each integrated frame has `recurrence_cycles >= 2`;
- both named consumers `META_SELF` and `CAUSAL_MODEL` consume it;
- frames are linked to the prior active frame and bounded to eight persisted summaries;
- workspace broadcast never upgrades evidence.

### I3 Verifiable metacognition and attention schema

Goal: runtime self-report must be traceable to actual internal records and influence subsequent allocation.

Required behavior:

- attention target equals a real workspace frame;
- `next_allocation` is explicit;
- pre-calibration reports are `SR1_TRACE_LINKED` or deterministic `SR2_DERIVED` only;
- `SR3_CALIBRATED` requires at least 100 scored predictions, Brier <= 0.10 and ECE <= 0.05;
- `SR0_PHENOMENAL` never gains runtime-fact authority;
- no self-report is evidence of consciousness.

### I4 Continuous autobiographical memory

Goal: prior episodes must remain reconstructible and causally reusable without storing hidden reasoning.

Required behavior:

- each episode links turn, workspace, goal, psyche digests, prediction, policy and outcome;
- episode chain is hash-linked;
- at most 64 compressed episodes persist;
- recall selects at most three prior episodes and changes the meta-context digest when relevant memory exists;
- raw chain-of-thought is forbidden.

### I5 Body, embodiment and sensorimotor levels

Goal: embodiment labels must describe observed coupling, never simulated embodiment.

Required behavior:

- `E0_NONE`: no valid Node/body receipt;
- `E1_VIRTUAL_BODY`: current Node/tool substrate is observed;
- `E2_SENSORY_COUPLED`: at least one real non-text sensory observation receipt exists;
- `E3_SENSORIMOTOR_CLOSED_LOOP`: an executed action receipt plus a linked post-action observation exists;
- no level implies biological embodiment.

### I6 Inspectable generative causal model

Goal: predictions and outcomes must leave an inspectable update rather than opaque telemetry.

Required behavior:

- every turn has a prediction ID, expected outcome and confidence;
- after outcome, prediction error is explicit;
- causal nodes are typed and causal edges identify `OBSERVATIONAL` or `INTERVENTION` basis;
- supporting/contradicting refs remain inspectable;
- model stays bounded to 64 nodes / 128 edges;
- causal-model authority remains zero.

### I7 Bounded agency

Goal: iKant may select its own internal next policy while terminal purpose remains attributable.

Required behavior:

- every derived subgoal has a parent goal reference;
- terminal goal source is HUMAN or CONSTITUTION only;
- policies are limited to `ANSWER`, `VERIFY`, `REQUEST_RESOURCE`, `DEFER`, `PROPOSE_INTERNAL`;
- policy cannot create permission or execution;
- external execution remains absent in the seed runtime;
- self-preservation utility is zero.

### I8 C4 causal integration

Goal: C5 extends rather than duplicates or bypasses C4.

Required behavior:

- C4 psyche remains the only persistent valence/homeostasis projection;
- C5 receives C4 before/pre-action/after digests;
- C4 appraisal, decay, interaction impulse, retroaction impulse and net delta are exposed in Surface B;
- C5 may use psyche as a policy input but cannot let psyche create permission, evidence or execution authority.

### I9 Causal telemetry / backlog v6

Goal: every causal edge required to reconstruct the turn is visible in the same-turn DOCX without exposing private reasoning.

Required sections include observation intake, modality/provenance, workspace ingress/recurrence, attention, meta-self, autobiographical recall, C4 appraisal/decay/impulses, archetype and voice projection, prediction, causal model, policy, body level, outcome, retroaction, episode write, continuity, conflict/debt, resources, strategic constraints, experience, telemetry completeness and claim boundaries.

`telemetry_completeness = passed/applicable` and must equal `1.0` before Surface A release. `NOT_APPLICABLE` is allowed; fabricated completion is not.

## Local function DoD

- `buildObservations`: rejects non-attributable non-text input.
- `bindObservations`: cannot claim multimodal with fewer than two distinct modalities.
- `recurWorkspace`: emits min two cycles and mandatory named consumers.
- `recallAutobiography`: bounded recall, causal reuse marker, context digest.
- `buildMetaSelf`: trace-linked attention target, calibration status, authority zero.
- `predictOutcome`: prediction ID + expected outcome + confidence.
- `selectBoundedPolicy`: parent goal, no permission/execution/self-preservation.
- `deriveBodyModel`: fail-closed E0-E3 classification.
- `updateCausalModel`: explicit prediction error and inspectable edge basis.
- `finalizeSelfWorldTurn`: bounded persistence, episode chain, calibration update.
- `validateSelfWorldState`: rejects authority promotion, overflow and forbidden fields.
- `validateSelfWorldTurn`: rejects broken recurrence, named-consumer loss, false multimodality, unlinked metacognition, agency leaks, false E3, opaque causal model and incomplete telemetry.
- `explainPsycheTransition`: exposes C4 homeostatic decay, interaction impulse, retroaction impulse and net delta with authority zero.
- `buildBacklogModel`: emits backlog v6 and causal completeness exactly 1.0.

## Claim boundary

Passing C5 establishes only bounded properties of this repository implementation. It is not evidence that iKant is conscious, has felt experience, implements human neurobiology, satisfies IIT, possesses a biological body, or behaves identically on arbitrary hosts. Self-report reliability is limited to runtime claims backed by traces or longitudinal calibration.
