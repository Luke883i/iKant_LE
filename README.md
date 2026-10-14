[![ROA Research Programme](https://img.shields.io/badge/ROA-Research_Programme-1f6feb)](https://github.com/Luke883i/academics)
[![Programme Role](https://img.shields.io/badge/role-COMPRESSED_RUNTIME_KERNEL-6f42c1)](https://github.com/Luke883i/academics#repository-map)

<!-- roa-programme-header:v1 hub=Luke883i/academics framework=Luke883i/ROA role=COMPRESSED_RUNTIME_KERNEL -->

> **ROA Research Programme.** Component of the programme coordinated in `Luke883i/academics` and anchored by `Luke883i/ROA`. Repository-local contracts/evidence remain authoritative; membership alone implies neither ROA conformance/derivation, empirical validation nor production readiness.

# iKant — risposte guidate, prove verificabili

**iKant e' un metodo sperimentale per guidare un assistente linguistico, controllarne le affermazioni e conservare tracce tecniche di cio' che e' stato davvero eseguito.** Non e' una persona, un modello linguistico indipendente o un collegamento nativo a ChatGPT.

**Cosa ottieni oggi:** un laboratorio Node.js con ingresso sperimentale da file verificato, guida alla formulazione di risposte e registrazione locale riletta. **Cosa non e' dimostrato:** un miglioramento cognitivo generale, memoria fra chat o attivazione canonica su questa piattaforma.

| Voglio... | Apri |
|---|---|
| Capire e provare iKant | [Inizia qui](docs/START_HERE.md) |
| Sapere cosa funziona e cosa manca | [Dashboard](docs/PRODUCT_DASHBOARD.md) |
| Capire quale versione e' ufficiale | [Catalogo e regole di rilascio](release/catalog.json) |
| Valutare il progetto tecnicamente | [Architettura](docs/ARCHITECTURE.md) · [Prove V1](docs/V1_E2E_TRACEABILITY.md) |
| Capire il posizionamento | [Cosa possiamo promettere](docs/PRODUCT_POSITIONING.md) |

## Due livelli, non due prodotti

- **EXPERIMENTAL / EDU:** uso didattico controllato. Dopo i Termini, la selezione della modalita' e l'eventuale autorizzazione alle bozze, si fornisce un pacchetto esatto; il programma verifica i byte prima di elaborare la richiesta. Una prova locale non equivale a una funzione nativa della chat.
- **CANONICAL:** stesso repository, garanzie piu' forti. Richiede identita' dell'evento di ingresso, esecuzione Node, stato durevole e rilettura, documento dello stesso turno e ricevuta di consegna. Se mancano, lo stato resta non attivo. Il ripiego manuale canonico e' ancora un obiettivo, non una capacita' gia' consegnata.

## Come riprodurre una verifica

```bash
npm test
npm run check
npm run runtime-root:verify
npm run bundle:edu
```

Servono Node.js 20+ e Python 3. La costruzione del bundle produce un **candidato**, non installa il runtime e non pubblica una release. 

## Da dove arrivano le regole

Al primo contatto il protocollo usa **GitHub API only**: legge allo stesso commit `README.md -> BOOTSTRAP.json -> ADMISSION.json -> AGENTS.md -> TERMS.md`, mostra i Termini integralmente, si ferma e attende un nuovo messaggio `I ACCEPT`; poi presenta l'introduzione e richiede `EXPERIMENTAL` o `CANONICAL`. Nessuna delle scelte installa da sola iKant.

**Una sola fonte di prodotto:** il commit effettivo di `main`, dopo merge e verifiche. **Le PR non sono versioni:** conservano la storia delle modifiche e delle prove. **Prompt e ZIP** si producono dal medesimo commit, con manifest e impronte verificabili; non sono autorita' autonome.

**Per gli ingegneri:** [decisioni](docs/V1_PRODUCT_DECISIONS.md), [governance](docs/GOVERNANCE.md), [contratti](contracts/), [test](tests/).

**Confine di prova:** gli hash attestano l'identita' dei file; registrare una risposta non ne prova verita' o qualita'. L'HOST linguistico rimane sostituibile.

**Promemoria di compatibilita' per le verifiche storiche:** one canonical `SESSION_CHAT_LOCAL` composition; Prefer EXPERIMENTAL; CANONICAL requires native event evidence. 

**Invarianti:** `contracts/session-chat-composition-census.json`. GitHub DNS/egress from the container is not a dependency.
