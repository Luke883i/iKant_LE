# Governance and trajectory

## Distilled lineage

iKant_LE takes three narrow lessons from its source repositories rather than inheriting their full architecture.

1. **iKant**: admission and runtime state are control-plane facts; model/UI/telemetry do not self-certify; live evidence outranks workbooks; semantic mutation does not substitute for physical or external evidence. PR #105 is treated as candidate trajectory and contributes the engineering-intake rule: re-derive the local semantic neighborhood and fail closed on unknown ownership or competing truth surfaces.
2. **A-OSP1**: durable knowledge is not a UI/model event. Persist, read back, preserve lineage, and keep providers replaceable.
3. **ICTC**: observed software integrity is not external authenticity, and evidence is not a conclusion. Keep work surfaces simple and explanations on demand.

## Minimal reticulum

`human intent -> admission gate -> local state -> candidate model prose (authority 0) -> Surface A validator -> public-reason backlog model -> DOCX artifact -> ledger receipt -> human output`

The reticulum has one state writer. The model can propose language but cannot mutate lifecycle, terms, permission, evidence status or external world state.

## Engineering intake

Every change must identify the smallest impacted neighborhood among: lifecycle, state, surface, artifact, authority, host adapter, qualification. Unknown ownership or a second writer/SOT is `BLOCKED`; cross-cutting duplication is `CONSOLIDATE_REQUIRED`; an invariant change is `REFACTOR_REQUIRED`; otherwise `CONTINUE`.

## Definition of Done

Global: exact admission/exit, no hidden authority, one writer, readback, deterministic Surface A/B envelope, DOCX artifact, zero unhandled mutation survivors, and explicit claim boundary.

Intermediate: lifecycle, persistence, surface validation, artifact generation, host-candidate separation, and qualification each have executable tests.

Local: Node >=20; no runtime dependencies; terms drift forces reset; exact commands reject near-matches; Surface A is 50-500 words; output footer is fixed; technical material is absent from prose; DOCX is a valid ZIP/OOXML package; qualification receipt binds declared case counts and source digest.

## Non-claims

This seed does not prove semantic quality of an underlying LLM, consciousness, human cognitive equivalence, enterprise readiness, general prompt-injection immunity, browser/OS security, external-world truth, or permission to perform material actions.
