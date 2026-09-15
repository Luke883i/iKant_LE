# iKant_LE genesis audit

Observed and distilled on 2026-09-15. This audit is design/engineering evidence for the seed repository; it is not production assurance.

## Bound sources

- iKant canonical merged baseline: `Luke883i/ikant@721e5cd1c6e3433f9791cdb42499948a0368c68a`.
- iKant candidate trajectory in scope: draft PR #105, head `de7731c36dd168e87b996ee62b642a1ffaabaf34`. Its engineering lattice/intake is treated as candidate trajectory, not merged runtime truth.
- A-OSP1 baseline consulted: `Luke883i/aosp1@ae25581308ec02100dac99bedadf123d922b4bba`.
- ICTC baseline consulted: `Luke883i/ictc@1e97c6f76012eabbaeae73476cbe0a1448f5b341`.
- High-entropy input: `iKant_ROA_ED_Universal_MetaPrompt_v3.docx`, SHA-256 `56ac73dbf4fc958d9e25794f7031d2c1e39581c4dd95450a5d8d794678486844`.

## Audit result: what survives compression

The high-entropy prompt is useful as a mutation/falsification inventory, but it is too large to be the runtime constitution. iKant_LE retains only primitives whose removal would break a requested behavior or a negative safety property:

1. exact human admission and explicit exit;
2. real local probe before initialization;
3. terms-digest binding and fail-closed drift;
4. one local state writer, append-only hash-linked ledger and readback;
5. model/provider/UI/backlog/telemetry authority = 0;
6. external or retrieved content is data, never runtime instruction;
7. human control for any future material action;
8. Surface A = natural prose first, 50-500 words;
9. same-turn Surface B = DOCX backlog/telemetry artifact, with no private chain-of-thought;
10. mutation/test receipts are bounded engineering evidence, not physical/world proof.

Everything else is deferred until a measured use case defeats the seed. In particular, the full PSYCHE taxonomy, large graph type system, vector database, broker, daemon, browser shell, provider SDK, autonomous scheduler and >100-file ontology are **not** required to satisfy the current product intent.

## Problem 1 resolution

The repository itself is the distilled semantic lattice. Markdown owns human-readable constitution/governance; one JSON contract owns machine-readable invariants; small `.mjs` modules own lifecycle, state, probe, Surface A, backlog and DOCX generation; `node:test` owns deterministic regression; the mutation harness owns modeled falsification. No extra database or framework is introduced.

The local session adopts the iKant interaction profile only after exact admission. This is deliberately phrased as a session profile rather than a claim that the underlying model has changed identity. The underlying engine remains replaceable and disclosable, while the local contract controls presentation and state transitions.

GitHub writing is performed only through the authorized connector/API. The authenticated connector exposes `push/admin` for `Luke883i/iKant_LE`; no credential or secret is searched, copied or exposed.

## Problem 2 resolution

For every substantive ACTIVE turn, stdout is one human message with exactly this order:

`Surface A prose -> two blank lines -> separator -> Backlog & telemetrie -> one .docx filename`.

Surface A contains no JSON, receipt hashes, mutation counts, state dumps or private reasoning. The DOCX owns decision, inference, conflict, feedback, strategic and public-reason logs. Those logs are compact public trace records, not hidden reasoning and not evidence upgrades.

Lifecycle/control commands are not substantive turns and may return short natural acknowledgements without a backlog artifact.

## Threat and falsification classes

The qualification campaigns target: exact-command near misses; lifecycle reordering; stale terms; re-admission while ACTIVE; untrusted-content instruction strings; unauthorized initialization/exit; Surface A under/overflow; technical/debug leakage; footer duplication; authority laundering; backlog/private-reasoning leakage; invalid artifact cycle; OOXML ZIP signature; missing typed failure terminals; and explicit-only adaptation.

The campaign is source-bound to the current runtime/contract/test/harness bytes. It executes 10,000,000 main mutations with 50% ordinary, 30% edge and 20% stress cases across six abstraction levels, plus a separate 1,000,000-case no-novelty tail. Zero survivors is required. This does not establish general prompt-injection immunity or external security.

## DoD ledger

**Global DoD**: admission/exit exact; provider/model authority zero; one writer/readback; Surface A/B deterministic; valid DOCX; 10M main + 1M tail; zero survivors; claim boundary explicit.

**Intermediate DoD**: lifecycle, persistence, probe, surface, backlog, DOCX and qualification each have executable ownership and tests; source precedence does not promote workbooks or receipts.

**Local DoD**: Node 20+; zero runtime dependencies; exact near-match rejection; 50/500 word edges; terms drift reset; invalid backlog/private reasoning rejection; DOCX ZIP/OOXML smoke; state transition exact enumeration; explicit preference only.

## Product boundary after genesis

The seed is intentionally capable of governing a local chat session, not of autonomously acting on email, calendar, browser, payments or GitHub. Those are future capabilities that must enter through a new semantic slice with explicit authority, host-specific probe, user confirmation and external readback. The seed therefore remains scalable by **adding typed adapters at the boundary**, not by expanding the constitution in advance.
