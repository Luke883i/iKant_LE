# Genesis qualification receipt

The current seed was qualified locally on 2026-09-15 against the source binding recorded in `artifacts/qualification/seed-v1.json`.

- Deterministic tests: 6/6 PASS.
- Exact small lifecycle enumeration: 25 state/input pairs; 0 forbidden edges.
- Main semantic mutation campaign: 10,000,000 cases; 0 survivors.
- Main strata: 5,000,000 ordinary; 3,000,000 edge; 2,000,000 stress.
- Abstractions: wording, state-machine, authority, Surface A, artifact model, governance.
- Independent no-novelty tail: 1,000,000 cases; 0 survivors.
- Total modeled cases: 11,000,000.
- 95% Wilson upper bound for the modeled main-campaign survivor probability after zero observed survivors: approximately `3.84146e-7`.
- Source-bound files: 12.
- Source binding SHA-256: `efb1f9be1eb26ce4dbe2c2f70fe48c1f9ff70f300a006c3e3bae079d367967d4`.
- Main receipt SHA-256: `c3dae5c4449530ddc120c444f6d4fc2e0aa74791192f829e5d02113c21b4fa6f`.
- Tail receipt SHA-256: `53979cf4825fa3354337cfe44a03056f1edced38f117fcd93b6d918373df9d2c`.
- Combined receipt SHA-256: `7939aeca8b644c25f29e9ca18b75166bf02ac6c622668855ae3fea5801050987`.

A real same-turn backlog DOCX was also generated, persisted, read back, rendered through LibreOffice and visually inspected as a clean one-page OOXML document.

## Claim boundary

These results demonstrate that the declared deterministic and mutation oracles found no survivor in the modeled space. They do not prove LLM semantic quality, production reliability, universal prompt-injection resistance, browser/OS safety, external-world truth, enterprise readiness or independent security assurance.
