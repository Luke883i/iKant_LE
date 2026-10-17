# Avviare iKant: Project, sorgenti, runtime locale e CANONICAL

Questa guida distingue **la preparazione dei file** dall'**esecuzione del codice** e dall'**integrazione nativa**. Non chiedere segreti in chat. Prima di usare un pacchetto registrare il commit di `main` da cui proviene; la sua identità non può essere dedotta dal titolo dello ZIP.

## Percorso A — Capire e sperimentare in un ChatGPT Project (EDU consigliata)

1. Procurati il **prompt di innesco** e il **bundle ZIP OneShell per Project** forniti per lo stesso commit. Sono artefatti HOST generati, non contratti runtime e non garantiscono da soli che un adapter sia installato. Controlla manifest, digest, fonte e contenuti autorizzati.
2. Inserisci il testo del prompt nelle **istruzioni del Project** e carica il bundle ZIP nei **file del Project**. I documenti `00_ROUTE.md`–`07_RELEASE.md` stabiliscono le regole HOST; i file originali di orientamento restano quelli del repository. I file possono essere soltanto disponibili alla conversazione, non eseguiti automaticamente.
3. Apri una **nuova chat** nel Project e scrivi esattamente `avvia iKant`. Leggi integralmente i cinque originali e i Termini. Solo in un messaggio successivo scrivi `I ACCEPT`; dopo l'introduzione originale, in un terzo messaggio distinto scrivi `EDU`.
4. Se il sistema dispone già dei sorgenti originali verificati, non occorre un secondo allegato. In assenza di sorgenti, dopo l'ammissione è possibile scaricare lo [ZIP sorgente esatto del commit di esempio](https://github.com/Luke883i/iKant_LE/archive/642ed98baea2c4de40046bd96bf366cc494890ae.zip) e allegarlo direttamente. **Il link è legato al commit indicato, non va promosso tacitamente a `main` futuro.** Non serve un terminale per questo passaggio di consegna.
5. L'HOST verifica l'originale, individua l'owner EDU realmente disponibile, esegue il percorso autorizzato e dichiara `NO_VOICE` se mancano writer, rilettura o output. Il formato a sei aree può essere una convenzione per turno: **non** promette una UI o una memoria permanente.

**Nota:** `PROMPT_INNESCO.md`, `INSTALLAZIONE.md` e `MANIFEST.json` del bundle OneShell allegato sono *proiezioni HOST*. Non sono automaticamente file presenti nella radice del repository e non sostituiscono `TERMS.md`, C72/v2 o gli owner originali. Non usare una vecchia selezione come nuovo consenso.

Per chi non conosce le sigle: `C72/v2` è il controllo di consenso, non l’installazione; [glossario tecnico illustrato](IKANT_CX_LEXICON.md).

## Percorso B — Audit ed esecuzione da checkout Git verificato

Prerequisiti: Git, **Node.js 20+**, Python 3, permessi locali appropriati. Un esempio riproducibile di audit è:

```bash
git clone https://github.com/Luke883i/iKant_LE.git
cd iKant_LE
git rev-parse HEAD
git rev-parse HEAD^{tree}
git status --porcelain
node --version
npm test
npm run check
npm run runtime-root:verify
```

**Prima di eseguire** verifica che HEAD coincida con il commit intenzionalmente scelto e che non vi siano modifiche locali inattese; confronta eventuali manifest e blob Git. Se stai lavorando su un commit preciso, esegui un `git checkout` di quel commit prima dei test e riconosci che non sarà necessariamente il `main` attuale. Gli esiti riportano sempre il commit effettivamente eseguito.

I test controllano il *repository*, non provano un LLM online, i benefici su utenti o una chiamata nativa ChatGPT. Per il collegamento EDU documentato: [`host/c135-edu-v2-owner.mjs`](../host/c135-edu-v2-owner.mjs), [`host/s02-edu-versioned-consumer.mjs`](../host/s02-edu-versioned-consumer.mjs), [specifica C135](C135_EDU_COGNITIVE_OWNER.md).

## Percorso C — CANONICAL con integrazione MCP reale

CANONICAL richiede connessione MCP **autenticata e consentita**, identità dell'evento fornita dal provider, composizione C59 originale `SESSION_CHAT_LOCAL`, runtime originale verificato, writer durevole, readback e consegna attestata. Il [codice sorgente del plugin](../plugins/ikant-le-session-chat/) e un eventuale file `mcp.template.json` **non** sono prova che il plugin sia registrato o che l'interfaccia sia attiva. L'ammissione CANONICAL non crea credenziali, servizi o stato `ACTIVE`.

Se non è possibile attestare ciascun confine: **fermati al primo requisito mancante**, non creare fallback non autorizzati e non dichiarare `ACTIVE`.

## Come orientarsi in caso di dubbi

[Inizio accessibile](START_HERE.md) → [mappa delle prove](IKANT_RUNTIME_AND_EVIDENCE.md) → [ricerca confutabile](IKANT_RESEARCH_QUESTIONS.md) → [contratti macchina](../contracts/) → [catalogo release](../release/catalog.json). Una PR proposta e un archivio scaricato non costituiscono una nuova versione rilasciata.
