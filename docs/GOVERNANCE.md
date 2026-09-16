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

The maintained narrative surface is intentionally small:

- `README.md`: first entrypoint and product map;
- `AGENTS.md`: compact normative host/agent contract;
- `TERMS.md`: human admission envelope;
- `BOOTSTRAP.md`: compatibility pointer only; machine bootstrap is `BOOTSTRAP.json`;
- `docs/ARCHITECTURE.md`: current product architecture;
- `docs/GOVERNANCE.md`: engineering, trajectory and qualification.

`docs/C1_DOD.md` through `docs/C6_DOD.md`, `docs/GENESIS_AUDIT.md`, `docs/QUALIFICATION.md` and `docs/RESEARCH_LEDGER.md` are compatibility/history pointers. Detailed historical content remains in Git history, merged PRs and artifacts. New semantic slices update the current surfaces instead of adding another parallel long-form SOT.

## Engineering intake

For each change derive the smallest impacted neighborhood among admission/transport, state, cognition, surface, artifact, authority, host adapter, documentation and qualification. A second writer/SOT or unclear ownership is `BLOCKED`; duplicated cross-cutting semantics is `CONSOLIDATE_REQUIRED`; an invariant change is `REFACTOR_REQUIRED`; otherwise continue locally.

Prefer delete/merge/reuse over new framework, database, broker, daemon, provider SDK or ontology. Repository writes are GitHub API operations with exact-head binding and `blob -> tree -> commit -> ref-last`; direct mutation of `main`, merge, release or settings requires separate authorization.

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

Detailed slice-specific evidence is preserved by merged PR and commit history; the table is the maintained semantic index.

## Qualification policy

Qualification is adaptive to the semantic risk of the slice and source-bound to exact candidate bytes. Deterministic tests and contract checks run before mutation campaigns. Generated corpora distinguish typical/ordinary, edge and stress/adversarial strata; all declared mutation families must be exercised and blocking survivors must be zero. No-novelty/compression rails are used when the slice claims convergence or minimality.

Current retained major evidence includes C4 10M runtime + 1M session mutations, C5 1M recurrent self-world mutations, C6 1M first-contact mutations and C7 1M documentation/transport mutations. Exact receipts belong in `artifacts/qualification/` and CI regenerates current qualification where configured.

A PASS is bounded engineering evidence for declared invariants and generated corpora. It is not proof of arbitrary-host compliance, model semantic correctness, consciousness, biological equivalence, prompt-injection immunity, browser/OS security, physical-world truth, enterprise readiness or formal global minimality.

## Research/source policy

External documentation and related repositories are design inputs only. iKant contributed admission/control-plane discipline; A-OSP contributed persistence/lineage and provider replaceability; ICTC contributed evidence stratification and mutation discipline. External security/HITL/tooling literature informs threat classes but grants no runtime authority. Current implementation evidence outranks dated research notes.
