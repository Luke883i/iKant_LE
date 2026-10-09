### C84 controlled failure witness
npm test exit: 1; C59 audit exit: 0; C59 artifact diff exit: 1.

#### npm test failed-case excerpts
~~~
2201:not ok 386 - C84 historical census, overlapping tags, transport-only canonicalization
2202-  ---
2203-  duration_ms: 28.531966
2204-  location: '/home/runner/work/iKant_LE/iKant_LE/tests/c84-host-composition-qualify.test.mjs:10:1'
2205-  failureType: 'testCodeFailure'
2206-  error: |-
2207-    Command failed: /opt/hostedtoolcache/node/20.20.2/x64/bin/node /home/runner/work/iKant_LE/iKant_LE/scripts/c84-host-composition-qualify.mjs
2208-    node:internal/modules/run_main:123
2209-        triggerUncaughtException(
2210-        ^
2211-    
2212-    AssertionError [ERR_ASSERTION]: The input did not match the regular expression /EXPERIMENTAL: solo C72/. Input:
2213-    
2214-    '# iKant_LE SESSION_CHAT_LOCAL prompt\n' +
2215-      '\n' +
2216-      'C59 describes the CANONICAL-only continuation after C72 mode selection. It does not govern C72 EXPERIMENTAL transfer, where samehash legacy carriers are eligible under C84 but cannot confer ACTIVE.\n' +
2217-      '\n' +
2218-      '```text\n' +
2219-      'IDENTITÀ.\n' +
~~~
#### npm test tail
~~~
  ...
# Subtest: C13 pure initialization pending intent folds into ACTIVE without a synthetic turn
ok 487 - C13 pure initialization pending intent folds into ACTIVE without a synthetic turn
  ---
  duration_ms: 24.59364
  ...
# Subtest: C13 mixed initialization plus substantive intent still resumes exactly once
ok 488 - C13 mixed initialization plus substantive intent still resumes exactly once
  ---
  duration_ms: 29.414087
  ...
# Subtest: C9 contract rejects filename-only delivery and bounds environment scope
ok 489 - C9 contract rejects filename-only delivery and bounds environment scope
  ---
  duration_ms: 0.709353
  ...
# Subtest: substantive ACTIVE turn emits one verified DOCX handoff and exact bounded environment telemetry
ok 490 - substantive ACTIVE turn emits one verified DOCX handoff and exact bounded environment telemetry
  ---
  duration_ms: 42.40693
  ...
# Subtest: descriptor release and environment validators reject forged or widened handoff state
ok 491 - descriptor release and environment validators reject forged or widened handoff state
  ---
  duration_ms: 23.396931
  ...
# Subtest: host-json CLI exposes the artifact path instead of requiring filename scraping
ok 492 - host-json CLI exposes the artifact path instead of requiring filename scraping
  ---
  duration_ms: 124.811827
  ...
1..492
# tests 492
# suites 0
# pass 491
# fail 1
# cancelled 0
# skipped 0
# todo 0
# duration_ms 39718.394107
~~~
#### C59 audit errors
~~~
{
  "schema": "ikant-le-c59-executable-surface-audit/v1",
  "production_files": 54,
  "activation_related_files": 24,
  "activation_related_file_set": [
    "ikant.mjs",
    "plugins/ikant-le-session-chat/server/server.mjs",
    "scripts/session-chat-runtime-cli.mjs",
    "src/bootstrap-intent-adapter.mjs",
    "src/bootstrap-semantic.mjs",
    "src/cohost-context-root.mjs",
    "src/contract.mjs",
    "src/control-plane-ownership.mjs",
    "src/fastboot-convergence.mjs",
    "src/first-contact.mjs",
    "src/host-consumption-frame.mjs",
    "src/local-host-meta-prompt.mjs",
    "src/runtime-availability.mjs",
    "src/runtime-command.mjs",
    "src/runtime-core.mjs",
    "src/runtime-limited-capability.mjs",
    "src/runtime-limited-turn.mjs",
    "src/runtime-root-verified.mjs",
    "src/semantic-morphogenesis.mjs",
    "src/session-chat-composition.mjs",
    "src/session-chat-deployment.mjs",
    "src/session-chat-local-prompt.mjs",
    "src/session-local-service.mjs",
    "src/session-shell.mjs"
  ],
  "canonical_active_issuer_count": 1,
  "canonical_active_issuer": "src/runtime-command.mjs#runCanonicalSessionChat",
  "runtime_root_enforcement_members": [
    "src/bootstrap-semantic.mjs",
    "src/runtime-command.mjs",
    "src/runtime.mjs",
    "src/state.mjs"
  ],
  "errors": [],
  "status": "PASS",
  "receipt_sha256": "8a8607421a4451e75047a1da06afdadfdef35108395d1cbbbcd84d4dda5732f2"
}
~~~
#### C59 expected artifact diff
~~~
--- artifacts/qualification/c59-executable-surface-audit.json	2026-10-09 13:31:48.080477718 +0000
+++ /tmp/c84-c59-actual.json	2026-10-09 13:32:35.275560952 +0000
@@ -1,6 +1,6 @@
 {
   "schema": "ikant-le-c59-executable-surface-audit/v1",
-  "production_files": 52,
+  "production_files": 54,
   "activation_related_files": 24,
   "activation_related_file_set": [
     "ikant.mjs",
@@ -38,5 +38,5 @@
   ],
   "errors": [],
   "status": "PASS",
-  "receipt_sha256": "7530517a402ff17a25181976c18027e07f20be3f788b228ea69699cdacdbdacf"
+  "receipt_sha256": "8a8607421a4451e75047a1da06afdadfdef35108395d1cbbbcd84d4dda5732f2"
 }
~~~

Diagnostic only; does not waive any existing qualification.
