# C57 — Host-binding-aware local meta-prompt

C57 corrects a host-integration mismatch left by C56.

The reference SESSION_CHAT MCP surface does **not** expose `for_ai_agent_first_entrypoint` as a model-visible tool. The model-visible binding is `ikant_le_open`; exact acceptance and substantive turns are app-only. Therefore a prompt that tells the model to invoke the repository symbol directly can correctly stop at integration impediment even while the reference app is connected.

C57 makes binding selection explicit and fail-closed:

`real host binding -> APP_BOUND if ikant_le_open exists -> otherwise ADAPTER_BOUND only if a real callable adapter exposes the repository entrypoint -> otherwise INTEGRATION_IMPEDIMENT`

In APP_BOUND mode the model opens the app once and then stops trying to own admission or turns. The app consumes the validated host frame, exact artifact bytes and ASCII shell. The assistant does not duplicate the shell or impersonate iKant outside that validated surface.

In ADAPTER_BOUND mode all C55/C56 owner-derived NEXT, typed evidence, retry locality and anti-shadow laws remain in force.

Tool registration alone is not ACTIVE or native-transcript proof. Native identity still requires the external same-session participant/scheduler/delivery evidence defined by C50-C53.
