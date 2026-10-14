# C128 — Whole-repository PR commit genealogy and physical-transport hardening

Audit baseline: merged PR #127 at Git main \`5675ff958160b0ba6dd16a3fc4856075e4be8d69\`; the merged PR timeline records **127 PRs, 119 merged and eight unmerged** (24, 27, 34, 36, 42, 43, 79, 102). Only merged PR commit ranges qualify as effective product history. A merged PR is NOT interchangeable with a single Cx capability, and a commit title is not evidence that its runtime executes.

## Full history evidence, not an LLM-generated synopsis

\`contracts/c128-pr-census.json\` preserves the GitHub API's 127-PR inventory and specific merge commit SHA for each merged PR, scoped to the above main. \`scripts/c128-pr-history-audit.mjs\`, run in GitHub CI with a **full** checkout (\`fetch-depth:0\`), follows every actual two-parent merge. For each merged PR it resolves the branch-unique commits by the exact git DAG \`merge^1..merge^2\` and records each commit SHA, subject, precise changed file paths, categories and risk flags. For unmerged PRs it records \`UNMERGED_NOT_MAIN\` and does not attribute their changes to the product. Missing history is **OPEN**, never reconstructed by guessing. The full artifact is uploaded as \`c128-pr1-127-commit-forensic-census\` for independent inspection.

The classification is mechanical by file path and commit title; it is a provenance census, not independent certification of philosophical intent. It supports owner-based sampling: source computation C70/C4/C5/C82; host orchestration C107/C117/PR119; C87 writer; C125 output; C126 capsule schema; C127 physical packaging. Whenever a historical PR modified original Terms/AGENTS, treat it as a distinct consent/governance change, not a post-127 inherited gate.

## 1,024 candidate contracts and elected minimal slice

\`scripts/c128-contract-lattice.mjs\` exhaustively evaluates **4^5 = 1,024** architectures: source provenance, timeout/retry choice, bridge identity, physical cache representation and writer/renderer topology. Hard constraints forbid non-source-exact code, blind retry, unbounded waits, guessed independent transports, path-only cache trust, a second C87 writer, and native ChatGPT authority inferred from local proofs. The selected scope is the unique safe candidate under these stated five hard constraints: immutable verified four-member cache, bounded wall-clock with STOP on unacknowledged abort, descriptor-only+unique callable, canonical JSON+two NOFOLLOW inode-bound reopenings, and unchanged PR119/C125 owner route. This is a **finite engineering design search**, not 1,024 LLM experiments or proof of every conceivable architecture.

## Concrete falsification findings and repair

- **C127 timeout gap**: awaiting an uncooperative \`fetch\` promise formerly could prevent any transition to manual handoff. C128 bounds a machine attempt; on expiration it requests AbortSignal and returns \`C128_TRANSPORT_CALLBACK_UNSETTLED\` with \`NEXT=STOP\`. No next bridge is invoked, because an arbitrary caller's still-running callback cannot be force-killed or assumed canceled. Only *completed* failures allow subsequent distinct attempts and eventual manual fallback, up to 1+2.
- **Bridge alias/getter gap**: C127 relied on a caller-provided ID alone, and read \`fetch\` properties directly. C128 requires own data descriptors without accessors or proxies and rejects the same callback function presented under two IDs. This is still **not** authentication of physical provider independence: separate wrappers may call the same underlying provider; provenance cannot be conjured by a JavaScript identity test.
- **Cache representation gap**: a valid four-content cache was previously accepted under noncanonical JSON representations. C128 requires exact serializer bytes and two independent \`O_NOFOLLOW\` file descriptors bound to the same device+inode, with final lstat identity and content equality. It improves local byte-reproducibility; it does not establish remote-provider authenticity.
- **Regression rule**: C107 original 62,448-byte carrier and original C70, C114, C87 and human Terms/AGENTS are unchanged. The historical C127 transport error for repeated method ID stays compatible. The native ChatGPT UI and independent model linguistic efficacy remain open.

## DoD lattice

| Tier | Proof obligation | Witness | Status |
| --- | --- | --- | --- |
| L0 all PR history | 127 enumerated, 119 merged, 8 excluded, complete source-graph per-PR commit trace | full GitHub CI checkout + downloadable JSON with all SHAs | Requires CI |
| L1 design | 1024/1024 finite contracts classified, unique safe optimum under declared constraints | deterministic standalone lattice and oracle | Requires CI |
| L2 physical source | original C107 PIN and 3 C124 overlay Git IDs, exact JSON, two inode-bound physical opens | real Node byte-flips, symlink and canonical mutation tests | Requires CI |
| L3 transport | max 1+2 completed methods; unique no-getter callbacks; no automatic retry after unknown abort; manual only after settled exhausted | 8 direct Node test categories + existing C127 negatives | Requires CI |
| L4 runtime | existing PR119→C114/C87→readback→C125; no second owner | original integration regressions, unchanged original source | Requires CI |
| L5 platform/effectiveness | native ChatGPT ingress/dispatch, inter-chat continuity, genuine real-LLM paired ablations | host-provider authenticated receipts | **OPEN EXTERNAL** |
| L6 release | GitHub check matrix on exact final PR head, human review and separate merge | GitHub green receipt | **OPEN until observed** |

## Readability and product closure boundary

The product receives finite, recoverable HOST transport that refuses unverified/uncertain events, not a new sentient mind. A callback can ignore AbortSignal; C128 can STOP safely but **cannot forcibly terminate arbitrary remote effects**. A timeout is not evidence of safe completion or an instruction to manually restart a potentially active bridge. \`HOST_BOUND\` remains HOST speech qualified by the original owner, not an autonomous voice. A model/provider's independent semantics are not proven by hash, ANN/LLM-like anthropomorphic metaphors, simulated mutations or this PR's CI.
