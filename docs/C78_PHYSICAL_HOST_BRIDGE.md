# C78 — physical opaque host relay for the C77 experimental cognitive capsule

## Product-level outcome
After the real C72 sequence (full pinned Terms → a later exact I ACCEPT → introduction → later exact EXPERIMENTAL), an authorized host can pass C77 capsule bytes through its own *actually callable* GitHub→Node carrier, write/reopen those bytes in a private directory and run the **same** human input through C70 cognition, C71 bounded draft and C73 presentation plan.

This is a real executable bridge and a protocol for host-native delivery. It is NOT a newly installed ChatGPT native hook. No Project prompt can guarantee that a GitHub connector return value becomes a filesystem byte without an actual host transport tool.

## Primitives and immutable boundaries
- `host/c78-host-relay.mjs`: validates C72 EXPERIMENTAL selection before filesystem writes, receives canonical base64 packets, compares every original Git blob SHA-1 and every C77 manifest SHA-256/size, reopens and checks bytes, executes a separate Node child process, validates input/output digests, never claims native origin/delivery.
- `scripts/c78-node-relay-cli.mjs`: one-shot JSON-over-stdin interface for a host to pass an entire C77 package with its previously qualified SHA-256; 2.5 MB request bound, private staging and cleanup; prints a typed host-owned response and exits nonzero on failure.
- `contracts/c78-host-bridge.json`: causal order and proof requirements for any native ChatGPT host.
- `tests/c78-host-relay.test.mjs`: local physical byte relay and separate Node process, 160 malformed transport mutations, anti-replay/status denials, two distinct local inputs explicitly NOT native two-turn persistence.
- `.github/workflows/c78-physical-bridge.yml`: Node 20/22 qualification plus previous C77/C74 and repo regressions.

### Host JSON envelope
Send to `node scripts/c78-node-relay-cli.mjs` on stdin after EXPERIMENTAL mode:

```json
{
  "schema":"ikant-le-c78-opaque-host-transfer/v1",
  "authority":0,
  "source_head":"<40-hex frozen GitHub SHA>",
  "selection":{"schema":"ikant-le-c72-mode-selection/v1","...":"valid C72 receipt"},
  "expected_manifest_sha256":"<64-hex digest derived from a trusted source>",
  "manifest_base64":"<exact base64 of c77-manifest.json>",
  "files":[{"filePath":"host/c77-first-turn.mjs","contentBase64":"<exact base64 bytes>","sourceBlobSha1":"<optional SHA-1>"}],
  "human_input":"<current user input>"
}
```

The files array must contain **all** manifest-listed files; the example is intentionally incomplete. `sourceBlobSha1` does not substitute for a trusted GitHub origin. The CLI computes its own byte digests; files absent, changed, duplicated or traversing out of the sandbox are rejected before execution.

### Strongly typed success and the exact unresolved boundary
`C78_NODE_RESPONSE_READY_HOST_DELIVERY_PENDING` means local byte writes/readbacks and a real Node C70/C71/C73 computation succeeded. It contains `surface_a_chat.text` for the ordinary ChatGPT message and `first_unclosed_edge=HOST_NATIVE_CHAT_SURFACE_A_DELIVERY`. It **does not** mean the reply appeared in a native ChatGPT client; only the actual host may present it.

`C78_NODE_BYTES_MATERIALIZED` is a real file readback receipt, **not** a GitHub connector event-origin claim. The caller-supplied source head, file hashes and manifest are self-consistent, but their source is not independently authenticated by Node. A host must compare these bytes with a source it actually obtained through the approved GitHub API on the frozen ref. A GitHub Actions fixture reads from its checkout; it cannot attest the connector/Node carrier inside a separate ChatGPT session.

### Normative host workflow (no invented primitives)
1. In a NEW actual iKant session, perform ONLY the five pinned orientation reads and show full TERMS.md, then STOP.
2. Accept only later exact I ACCEPT; present standard C72 explanation; STOP for later exact EXPERIMENTAL selection.
3. Inspect callable GitHub connector API and local Node/file tools; if any edge is not physically callable, STOP with `HOST_CONNECTOR_TO_NODE_TRANSFER`. No fallback via forbidden pre-consent commands.
4. Obtain C77 derived package via an actually accessible carrier and independently compare it with the GitHub source/builder witness at frozen SHA. The C77 package is a build artifact, **not** simply a repository tree; use its manifest and original blob provenance. Never use a caller-supplied SHA as sole origin authentication.
5. Pass exact package bytes to the stdin protocol and execute; require valid typed readback with actual same-input digest. If failure, report the first observed edge; never fabricate ACTIVE.
6. Post the verified `surface_a_chat.text` as a visibly marked **HOST-OWNED UNSEALED EXPERIMENTAL DRAFT** in the ordinary assistant chat message. Do not assert a native display receipt from Node. If the UI interaction is not witnessed, record UNKNOWN.
7. DOCX Surface B is optional in EXPERIMENTAL and may be linked only after host-side creation, reopen, hash verification and a real downloadable artifact. C78 never invents a sandbox URL.
8. A second real native user turn must repeat the actual carrier/Node dispatch; local calls do not establish persistent runtime state.

## Falsification matrix / strict DoD
- Full C77 package via in-memory opaque chunks and physically separate Node child, Node20+Node22, actual bytes written/read back to a temporary private directory.
- 160 reproducible packet adversaries, including corrupt hash/base64, path traversal, duplicate, missing file, fake mode/consent, unsafe sensitive input.
- 0 false canonical ACTIVE, 0 native source-origin receipts invented, 0 unbacked DOCX links.
- GitHub CI can prove locally staged bytes and Node execution only. The **real ChatGPT host ingress, GitHub connector to Node transfer and actual normal-chat Surface A witness remain separately unverified** until an eligible ChatGPT runtime supplies them.
- User-value H95 cannot be inferred from CI. Require independent native Project sessions and a lower confidence bound >=0.95 under a prespecified cohort.
