[![ROA Research Programme](https://img.shields.io/badge/ROA-Research_Programme-1f6feb)](https://github.com/Luke883i/academics)
[![Programme Role](https://img.shields.io/badge/role-COMPRESSED_RUNTIME_KERNEL-6f42c1)](https://github.com/Luke883i/academics#repository-map)

<!-- roa-programme-header:v1 hub=Luke883i/academics framework=Luke883i/ROA role=COMPRESSED_RUNTIME_KERNEL -->

> **ROA Research Programme.** Component of the programme coordinated in `Luke883i/academics` and anchored by `Luke883i/ROA`. Repository-local contracts/evidence remain authoritative; membership alone implies neither ROA conformance/derivation, empirical validation nor production readiness.

# iKant — risposte guidate, prove verificabili

**iKant guida le risposte di un assistente linguistico e verifica le operazioni eseguite.** E' sperimentale, non una persona, un modello separato o un hook nativo ChatGPT.

**Cosa ottieni oggi:** laboratorio Node.js, ingresso da file verificato, bozze guidate e registrazione locale riletta. **Cosa non e' dimostrato:** miglioramento cognitivo generale, memoria fra chat, attivazione canonica.

| Voglio... | Apri |
|---|---|
| Capire e provare iKant | [Inizia qui](docs/START_HERE.md) |
| Sapere cosa funziona e cosa manca | [Dashboard](docs/PRODUCT_DASHBOARD.md) |
| Capire quale versione e' ufficiale | [Catalogo e regole di rilascio](release/catalog.json) |
| Valutare il progetto tecnicamente | [Architettura](docs/ARCHITECTURE.md) · [Prove V1](docs/V1_E2E_TRACEABILITY.md) |
| Capire il posizionamento | [Cosa possiamo promettere](docs/PRODUCT_POSITIONING.md) |

## Due livelli, non due prodotti

- **EXPERIMENTAL / EDU:** dopo Termini, selezione e autorizzazione specifica alle bozze, usa un file verificato. La prova locale non e' integrazione nativa della chat.
- **CANONICAL:** richiede identita' nativa dell'evento, Node, stato durevole e rilettura, documento del turno e ricevuta di consegna. Senza prove resta inattivo; il ripiego manuale non e' ancora disponibile.

## Come riprodurre una verifica

```bash
npm test
npm run check
npm run runtime-root:verify
npm run bundle:edu
```

Servono Node.js 20+ e Python 3. Il bundle e' un **candidato**, non una installazione o release.

## Da dove arrivano le regole

Al primo contatto il protocollo usa **GitHub API only**: legge allo stesso commit `README.md -> BOOTSTRAP.json -> ADMISSION.json -> AGENTS.md -> TERMS.md`, mostra i Termini integralmente, si ferma e attende un nuovo messaggio `I ACCEPT`; poi presenta l'introduzione e richiede `EXPERIMENTAL` o `CANONICAL`. Nessuna delle scelte installa da sola iKant.

**Fonte unica:** `main` dopo merge e verifiche. Le PR conservano la storia, non sono release. Prompt e ZIP sono ricostruiti dallo stesso commit con impronte verificabili.

**Per gli ingegneri:** [decisioni](docs/V1_PRODUCT_DECISIONS.md), [governance](docs/GOVERNANCE.md), [contratti](contracts/), [test](tests/).

**Prove:** gli hash identificano i file, non certificano la verita' delle risposte. Il modello HOST resta sostituibile.

**Promemoria di compatibilita' per le verifiche storiche:** one canonical `SESSION_CHAT_LOCAL` composition; Prefer EXPERIMENTAL; CANONICAL requires native event evidence. 

**Invarianti:** `contracts/session-chat-composition-census.json`. GitHub DNS/egress from the container is not a dependency.
