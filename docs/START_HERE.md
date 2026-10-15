# iKant — inizia qui

**Che cos'e'?** iKant e' un metodo sperimentale che prova ad aiutare un modello linguistico a ragionare con tracce verificabili. Non e' una persona, ne' un secondo modello di intelligenza artificiale.

**Qual e' la versione ufficiale?** La fonte integrata e' il branch `main` di questo repository, identificato ogni volta dal commit esatto. Le PR mostrano come e perche' il prodotto e' cambiato, ma non costituiscono altre versioni ufficiali.

**Cosa posso usare?** Una modalita' sperimentale che verifica file e registra localmente le risposte quando il programma viene realmente eseguito. Il percorso canonico richiede ulteriori prove native che non possono essere garantite da un prompt o da uno ZIP.

**Come si inizia?** Alla versione esatta di main si leggono i Termini originali, si risponde in un nuovo turno esattamente `I ACCEPT`, quindi si seleziona in un altro turno `EDU` (consigliata) oppure `CANONICAL` (via MCP). Per l'esperimento EDU si fornisce un solo pacchetto esatto e verificabile. Un file allegato, da solo, non installa il runtime.

**Come controllo il progetto?** Consulta la [dashboard](PRODUCT_DASHBOARD.md) per distinguere integrato, proposto, verificato e ancora da provare. I riferimenti tecnici sono opzionali e devono essere accompagnati dal loro significato in linguaggio comune.

**[Come presentarlo sul mercato](PRODUCT_POSITIONING.md)**: promesse controllabili e limiti verificabili.

**Se sono un ingegnere**: [architettura](ARCHITECTURE.md), [contratti](../contracts/), [verifiche](../tests/), [governo release](../release/catalog.json).

**Limite**: il controllo degli hash prova l'identita' dei file; non prova che una risposta del modello sia corretta o che il sistema possieda esperienza soggettiva.

**Questa versione:** `1.0.0-edu.1` indica la prima linea sperimentale verificabile; non significa che iKant sia pubblicato o nativamente collegato alla chat. [Decisioni](V1_PRODUCT_DECISIONS.md) e [prove](V1_E2E_TRACEABILITY.md) distinguono le funzioni disponibili dai lavori ancora aperti.
