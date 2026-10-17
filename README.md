[![ROA Research Programme](https://img.shields.io/badge/ROA-Research_Programme-1f6feb)](https://github.com/Luke883i/academics)
[![Programme Role](https://img.shields.io/badge/role-COMPRESSED_RUNTIME_KERNEL-6f42c1)](https://github.com/Luke883i/academics#repository-map)

<!-- roa-programme-header:v1 hub=Luke883i/academics framework=Luke883i/ROA role=COMPRESSED_RUNTIME_KERNEL -->

> **ROA Research Programme.** Parte di `Luke883i/academics` e `Luke883i/ROA`; nessuna conformità o efficacia è implicita.

# iKant — risposte guidate e verificabili, non una mente digitale

iKant è un’infrastruttura cognitiva verificabile: affianca un LLM sostituibile per controllare il percorso domanda-risposta. Non è una persona, un secondo LLM o coscienza dimostrata. La traccia prova operazioni, **non** verità.

## Cosa ottieni oggi

Guida sperimentale, non servizio nativo già installato.

## Cosa non e (ovvero: cosa non è)

Coscienza, rilascio e verità non sono attestati.

### Tre modi per capire iKant

| Per chi | Da leggere | Domanda |
|---|---|---|
| Persona curiosa | [Guida in parole semplici](docs/START_HERE.md) | A che cosa serve? |
| Ricercatore | [Tre domande confutabili](docs/IKANT_RESEARCH_QUESTIONS.md) | Come provarlo e smentirlo? |
| Tecnico/auditor | [Mappa E2E ed evidenze](docs/IKANT_RUNTIME_AND_EVIDENCE.md) | Che cosa è realmente eseguito? |

## Dall'umano alla prova

- **Umano:** formula la domanda, presta consenso e valuta il risultato; ha corpo, storia, relazioni.
- **LLM:** genera il testo; iKant non aggiunge nuovi pesi o una soggettività provata.
- **iKant:** applica percorsi, verifiche, un writer originale e rilettura quando realmente eseguiti.
- **HOST:** fornisce strumenti e interfaccia; non può inventare identità nativa o ricevute.
- **Verificatore:** distingue ciò che il software ha fatto da ciò che una risposta sostiene.

[Architettura](docs/ARCHITECTURE.md) · [Limiti](docs/PRODUCT_POSITIONING.md).

## Modalità e bootstrap

**EDU** — laboratorio consigliato: scegliere non attiva `ACTIVE` né memoria tra chat. **CANONICAL** — identità MCP e un solo canale che può attestare l’attivazione: one canonical `SESSION_CHAT_LOCAL` composition (C59); MCP connesso non significa `ACTIVE`. `EXPERIMENTAL` è storico C72/v1, non terza modalità pubblica C72/v2 (ingresso e consenso).

C59 censisce i percorsi in [`session-chat-composition-census.json`](contracts/session-chat-composition-census.json). GitHub DNS/egress from the container is not a dependency: i byte arrivano dal piano HOST con verifica.

Tre messaggi nuovi: `avvia iKant` (leggi i cinque originali e i Termini) → `I ACCEPT` (solo dopo) → `EDU` o `CANONICAL` (dopo introduzione). Ordine: `README.md -> BOOTSTRAP.json` → `ADMISSION.json` → `AGENTS.md` → `TERMS.md`. Primo ingresso: **GitHub API only**; mai consenso storico.

[Prompt di innesco, bundle ZIP, sorgenti e installazione](docs/IKANT_LOCAL_SETUP.md): file Project e prompt **non installano Node**, plugin o UI persistenti. Audit del codice: Node.js **20+**, Python 3; `npm test`, `npm run check`, `npm run runtime-root:verify`.

## Tre domande di ricerca

**RQ1:** i controlli migliorano la verificabilità rispetto allo stesso LLM da solo? **RQ2:** migliorano l'utilità per esseri umani senza costi eccessivi? **RQ3:** bloccano pretese indebite di identità, coscienza e attivazione, senza bloccare risposte lecite? [Ipotesi, benchmark e confutazioni](docs/IKANT_RESEARCH_QUESTIONS.md). Nessun beneficio generale o status ontologico è già dimostrato.

## Stato e autorità

**DOCUMENTATO / OSSERVATO / INFERITO / NON ATTESTATO**: distinguere fonti e prove. `main` è fonte; una PR non è release. [Dashboard](docs/PRODUCT_DASHBOARD.md) · [Decisioni V1](docs/V1_PRODUCT_DECISIONS.md) · [Tracciabilità V1](docs/V1_E2E_TRACEABILITY.md) · [Catalogo](release/catalog.json) · [Contratti](contracts/) · [Test](tests/) · [Audit dei 100 contratti editoriali](docs/IKANT_EDITORIAL_CONTRACT_AUDIT.md).

**Progressione:** problema → persone → runtime → prove → ricerca → rilascio. [Sigle Cx spiegate](docs/IKANT_CX_LEXICON.md).
