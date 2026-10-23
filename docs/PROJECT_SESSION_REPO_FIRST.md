# Project session: one prompt, repository-owned execution

The Project artifact is `project/session-chat/PROMPT.txt`. No local bundle is required. A callable GitHub API adapter, Node 20+ and a writable session filesystem are prerequisites; a prompt cannot create them. Missing capability yields a typed STOP, never an upload request or a fake ACTIVE state. No external service or plugin installation is added by this route.

## Acquisition and admission

On fresh `avvia iKant`, resolve main once, freeze HEAD and TREE, and read the five orientation files by exact path. Display their five immutable links and one next action. Do not dump README or machine JSON into the dialogue. Terms v1.2 explicitly supports linked presentation. Original C72 issues the linked offer and acceptance, preserving `terms_presented_host_claim=false`, `terms_body_presented=false`, `terms_read_attested=false`. The HOST claims link presentation only. The two later human messages remain exact `I ACCEPT` then `EDU` or `CANONICAL`; selection is not activation. Legacy verbatim offers remain supported. No old acceptance transfers to a new source epoch.

After acceptance, retrieve and verify original `host/c72-public-mode-admission.mjs` and its contract before invoking it. After mode selection retrieve `contracts/project-session-source.json`, `scripts/project-repo-loader.mjs`, the immutable API recursive tree and the source files named by the manifest. Use API base64 contents, not model reconstruction. The HOST must compare the loader itself against its exact tree blob before executing it. Source symbols do not establish actual callability.

Assemble `{source_head, source_tree, live_head, truncated:false, tree, files:[{path,encoding:"base64",content}]}` from actual API results. Pass the independently frozen head/tree to:

```sh
node scripts/project-repo-loader.mjs API_PLAN.json FRESH_SOURCE_DIRECTORY HEAD TREE
node FRESH_SOURCE_DIRECTORY/scripts/project-session.mjs HEAD TREE CURRENT_C72_SELECTION.json
```

The loader reconstructs the Git tree identity and verifies every named blob, complete object set, safe paths and physical readback. It is stdlib-only and performs no download, archive extraction or npm installation. The plan is an internal HOST transport value, not a user-provided package. A partial or uncertain write stops; the HOST reconciles without blindly retrying into an existing directory.

## Runtime projection and evidence

The runtime command verifies the local source against the frozen Git tree before dynamically importing the original state and session-shell owners. Under the original writer lock it reopens the existing hash-linked ledger, builds and validates the public session shell, and emits a derived capsule plus physically reopened content-addressed evidence. It never appends a lifecycle, turn, consent or backlog event.

The capsule exposes separate iKant state, observed Node execution facts, provider-unknown fields, complete original shell output, backlog artifact history, first open edge and original owner guidance. The first open edge and next action are not invented from a model summary. When no owner guidance exists, NEXT is STOP. A backlog artifact list is not an attested project task queue; that remains explicitly UNKNOWN without an original queue receipt. Provider session identity, context usage, native UI and cross-session durability remain UNKNOWN.

Publish the returned required evidence through an actually supported file handoff and use its real link in `renderSessionCapsule`. If delivery cannot be proved, STOP that edge. No fabricated sandbox links. The full public shell is retained in JSON; the compact view does not replace it. This dashboard always has NO_VOICE and cannot activate iKant. Existing C87/C125 human-turn routes and C59 CANONICAL eligibility remain separate and unchanged.

Derived evidence is a projection cache, not a second ledger. A new turn reopens the source owners, not the prose summary. Reuse across sessions is not promised when the host filesystem disappears. Admission and source changes are still separately gated. The Markdown output is a recurring convention, not a native persistent panel.

## Selection and limits

`node scripts/project-session-select.mjs` executes 10,000 distinct combinations of lifecycle, observed host version, epoch/ledger binding and backlog cardinality, plus payload corruption checks. JSONL preserves all cases and digests. The explicit decision matrix compares five architectures. Repository-owner projection minimizes added deployment among eligible candidates under available GitHub API and Node; this is conditional engineering selection, not universal optimality or measured human preference.

The result attests exact recovery of all fields of the original public owner output in the evidence payload. It does not attest global semantic equivalence, actual ChatGPT widget rendering, real-model efficacy, native persistence or a human pilot. PRODUCT_NO_GO remains in force. A missing source/tool/delivery edge remains visible rather than being laundered into success.

## Original EDU owner and separate ledger scopes

C135 and the C107 packer accept the verified API-tree source binding as an explicit alternative to a Git checkout. Neither path fabricates a Git commit or changes the original C87 writer. C125 recognizes the distinct API-tree source kind with its source-bound readback reference, while native origin remains false. A HOST adapter can call the existing C135 session with `sourceBinding:{head,tree}` and use its `readSessionState()` method to obtain the actual original C87 ledger binding. `project-session.mjs HEAD TREE CURRENT_C72_SELECTION.json [ORIGINAL_EDU_LEDGER]` reopens that ledger through original C87. Missing EDU binding stays UNKNOWN; canonical core status never substitutes for EDU session status. The capsule does not keep a second session registry or task queue. C135 close/busy/uncertain conditions remain original blockers.

## Validation status for this change

The source closure is generated and verified, and runtime-root remains unchanged. Focused tests exercise linked admission, tampering, exact evidence recovery, API ingress and original C135/C87/C125 execution with a fixture language callback. This is a synthetic software test, not a real model efficacy result or native ChatGPT pilot. The qualification command runs the finite 10k experiment and emits a replayable JSONL trace (plus compressed copy); the repository summary binds its digest. Full-repository test execution is left to CI; only scoped dependencies were materialized locally from exact API blobs.
