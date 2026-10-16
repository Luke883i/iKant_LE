# Sei diapositive di OneShell — V7

L'output ordinario **dopo i gate** contiene esattamente sei slot in ordine stabile. Il contenuto della slide è breve tranne il testo originale A, che può essere arbitrariamente lungo e NON può essere compresso senza perdere i byte originali.

```text
┌ iKant · OneShell / session-chat (HOST presentation) ┐
│ ESITO | <fatto verificato · modo e stato>              │
│ A     | NO_VOICE / <byte UTF-8 originali C87>           │
│ B     | HOST · <una frase utile, claim etichettato>     │
│ PROVA | <riferimento originale verificato o NON ATTESTATO> │
│ EDGE  | <primo requisito ancora aperto>                │
│ NEXT  | <una sola transizione autorizzata / STOP>       │
└───────────────────────────────────────────────────────┘
```

**Human-first rule:** A (if original same-turn verified C87 voice) is the only conversational answer. HOST B observes technical session state only; no second opinion, philosophical interpretation, dialogue suggestion or substitute A. If A=NO_VOICE state the first blocker and next permitted action. Never call this Markdown a persistent UI.

**Language:** public sentences must be short and ordinary. The HOST may not edit original voice after C87; check generated language upstream and retain technical codes in a separate verified HOST annex.

**Sei slide equivalgono a sei canali informativi, non a sei messaggi nuovi.** ESITO identifica quale problema umano è stato affrontato. A non è redatto dall'HOST. B può riportare sintesi HOST con limiti di verità. PROVA è un link effettivamente esistente oppure un digest con riferimento riapribile, non un semplice `sha256` orfano. EDGE e NEXT sono uno ciascuno.

**Eccezioni prevalenti:** TERMS integra verbatim con STOP; introduzione C72 originale con STOP; emergenze e richieste particolari dove regole superiori impongano una risposta differente. Una shell apparentemente completa senza ricevute non attesta l'attivazione.

**Persistenza:** per turno = richiesta di layout, non garanzia provider. Ledger fisico = solo l'owner realmente eseguito; UI persistente trans-turno = funzionalità da qualificare tramite app MCP registrata e non simulabile dal prompt.

**Etichette visibili consentite per A:** `NO_VOICE`, `HOST_BOUND` solo con C87 originale e readback, `PROVIDER_VERIFIED` solo con owner provider autentico. Mai riutilizzare il campo A del turno precedente.
