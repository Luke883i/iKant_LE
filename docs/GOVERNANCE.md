# Governance, trajectory and qualification

This is the canonical engineering document for iKant_LE. It owns development intake, documentation roles, historical trajectory and qualification policy. Exact runtime truth remains in machine contracts, code, tests and current qualification artifacts.

## Source and document precedence

Use this order when claims conflict:

1. mandatory host/system/safety/law constraints;
2. current executable runtime and tests on the bound commit;
3. current machine contracts (`contracts/*.json`, `BOOTSTRAP.json`, `ADMISSION.json`);
4. current qualification artifacts generated from that source binding;
5. `TERMS.md` and `AGENTS.md` for human/agent-readable contract surfaces;
6. `README.md`, this document and `docs/ARCHITECTURE.md` for orientation/explanation;
7. historical DoD files, PR descriptions, research notes and old receipts.

Historical artifacts never self-promote into current runtime truth.

## Documentation topology

Maintained narrative surface: `README.md` entrypoint/product map; `AGENTS.md` host contract; `TERMS.md` admission; `docs/ARCHITECTURE.md` product model; this file engineering/trajectory/evidence. `BOOTSTRAP.md`, C1-C6 DoD, genesis/qualification/research notes are compatibility/history pointers. New slices update current surfaces instead of adding parallel long-form SOTs.

## Engineering intake

For each change derive the smallest impacted neighborhood among admission/transport, state, cognition, surface, artifact, authority, host adapter, documentation and qualification. A second writer/SOT or unclear ownership is `BLOCKED`; duplicated cross-cutting semantics is `CONSOLIDATE_REQUIRED`; an invariant change is `REFACTOR_REQUIRED`; otherwise continue locally.

Prefer delete/merge/reuse over new framework, database, broker, daemon, provider SDK or ontology. Repository writes use exact-head GitHub API operations `blob -> tree -> commit -> ref-last`; direct mutation of `main`, merge, release or settings requires separate authorization.

Bootstrap performance is governed structurally, not by invented wall-clock promises. Pre-accept reads bind one source head; post-accept activation may acquire only the declared runtime capsule in one parallel API round before probe/init. Search, history, documentation study, tests and qualification belong after ACTIVE or to development workflows. A pre-accept handoff is authority-zero evidence transport, not a consent substitute.

## Development trajectory

| Slice | Semantic closure |
|---|---|
| GENESIS.0 | exact admission/exit, real probe/init, one writer/readback, Surface A/B, DOCX, authority-zero host model |
| C1 | bounded intent/method/resource/central/strategy runtime and typed experience |
| C2 | one-human-gate auto probe/init, fingerprint-bound bootstrap, narrative iKant shell |
| C3 | bounded pre-accept orientation, non-retroactive breach, pending-intent resume, universal Node dispatch |
| C4 | causal functional psyche action/retroaction, homeostasis, derived archetypal expression |
| C5 | recurrent self-world model: workspace, meta-self, autobiography, causal model, bounded agency/body levels |
| C6 | arbitrary end-user first-contact wording converges before generic repository discovery |
| C7 | documentation consolidation plus GitHub-API-only repository transport, no unavailable-tool/fallback attempts |
| C8 | emergence/subjectivity axes: weak/causal qualifiable; open unimplemented; strong/phenomenal runtime-undecidable |
| C10 | head-bound activate-first bootstrap, strict pre-accept handoff and one parallel runtime acquisition round |

Detailed slice evidence remains in merged PR/commit history; the table is the maintained semantic index. C9 is not listed as merged product truth until its runtime slice is actually merged.

## Qualification policy

Qualification is adaptive to semantic risk and source-bound to exact candidate bytes. Deterministic tests and contract checks precede mutation campaigns. Generated corpora distinguish ordinary/typical, edge and stress/adversarial strata; all declared families must be exercised and blocking survivors must be zero. No-novelty/compression rails are used when convergence/minimality is claimed.

Retained major evidence includes C4 10M runtime + 1M session mutations, C5 1M recurrent self-world, C6 1M first-contact, C7 1M documentation/transport, C8 100 engineering + 1,000 ontological claim-boundary mutations, and C10 1M fastboot/admission mutations. Exact receipts belong in `artifacts/qualification/` and CI regenerates current qualification where configured.

A PASS is bounded engineering evidence. It is not proof of arbitrary-host compliance, semantic correctness, consciousness, biological equivalence, browser/OS security, physical-world truth, enterprise readiness, global minimality or a universal wall-clock bootstrap duration.

## Research/source policy

External documentation and related repositories are design inputs only. iKant contributed admission/control-plane discipline; A-OSP persistence/lineage and provider replaceability; ICTC evidence stratification and mutation discipline. External security/HITL/tooling literature informs threat classes but grants no runtime authority. Current implementation evidence outranks dated research notes.
