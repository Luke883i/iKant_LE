# iKant_LE SESSION_CHAT reference app

This package is the **deploy-once** C20 profile. It does not weaken the one-shot C15/C17/C18/C19 path.

## Deploy once

```bash
export IKANT_LE_DEPLOYMENT_ROOT=/var/lib/ikant-le/session-chat
printf '{"deployment_id":"release-1"}' | node scripts/session-chat-runtime-cli.mjs deploy
cd plugins/ikant-le-session-chat/server
npm install --ignore-scripts --no-audit --no-fund
PORT=8788 IKANT_LE_DEPLOYMENT_ROOT=/var/lib/ikant-le/session-chat npm start
```

The deployment copies and verifies only the canonical orientation capsule plus the 8 runtime-root transport objects, materializes a reference root, reopens every member, and stores a source-bound deployment attestation.

## Connect ChatGPT

ChatGPT requires a reachable MCP server. Use a remote HTTPS deployment or a supported Secure MCP Tunnel for a private/local server, then register the `/mcp` endpoint as a custom app in Developer Mode.

Per chat the app performs **no repository transfer**. It binds the host session to the deployed store, shows the pinned Terms, and on exact `I ACCEPT`:

1. captures a MONOTONIC acceptance-origin ticket at app/runtime ingress;
2. materializes a session-local root from the deployed content-addressed store using `WARM_CACHE_EXACT`;
3. binds the origin ticket to acceptance-origin receipt v2;
4. invokes the canonical iKant_LE runtime;
5. requires live probe, writer/persistence, final deadline PASS, ACTIVE commit and ledger readback.

Only `ikant_le_open` is model-visible. Acceptance and substantive ACTIVE turns are app-only.

## Claim boundary

Repository tests can prove the reference deployment, real local materialization, real Node runtime activation, persistence/readback, MCP server startup and 100M semantic qualification. They **cannot** prove that a particular ChatGPT account has registered the app or that an external tunnel/HTTPS deployment is reachable. Physical session-chat ACTIVE requires that external roundtrip.
