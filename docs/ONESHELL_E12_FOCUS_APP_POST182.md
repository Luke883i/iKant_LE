# OneShell E12 — runtime focus app dopo PR 182

Engineering baseline: `main@1d82e74dee2092c017dfc6330414b866d5661365`. Questo documento censisce l'evoluzione del prodotto e le value proposition; non certifica un'app installata nel client ChatGPT.

## Derivazione retrograda: aspettativa → invarianti runtime

**Esperienza attesa.** Dopo un `I ACCEPT` valido, una OneShell riconoscibile presenta il consenso originale senza inventare la voce. Dopo EDU/sorgente verificata, lo spazio principale appartiene alla voce iKant originale: lettura ampia, inalterata, sempre distinguibile dall'Host. Stato, osservazioni Host, PROVA, EDGE e NEXT sono sezioni standard compresse visivamente; il rapporto originale può essere aperto e scaricato dopo write/readback. La stessa esperienza viene proiettata dopo ogni turno, recuperando C87 esclusivamente quando le prove consentono il rebind.

**AS-IS dopo #182.** E9 è un rail read-only; E10 fornisce un processo Node multi-turno con writer C87 originale e recupero SIGKILL, ma non monta un'app o widget nativo persistente. Il renderer SVG dà HTML Host-only; il prompt da solo non esegue il renderer.

**Reticolo minimo E12:** owner C72/v2 → `projectPostAcceptOneShell` originale → `projectPostAcceptFocusApp` → `emitVerifiedHostOneShell` → report UTF-8 fisico (write-once, SHA-256, readback). Dopo EDU: closure HEAD/TREE → E10 `openContinuousOneShell` → owner C135/C87/C125/S03 → E9 same-turn → `openFocusOneShellSession` → stessa vista focus e report per ogni turno, senza duplicare cognizione e ledger.

## Mining storico: valore umano salvato e requisito consolidato

| PR / famiglia | Proposta di valore e riuso |
|---|---|
| #3, #10 | Avvio più umano, artefatti reali; un link nasce da byte fisicamente prodotti e riletti. |
| #39, #53, #54, #59, #68 | Voce centrale, stato e contesto co-host, separazione fra esperienza visiva e attestazione nativa. |
| #83, #84, #114 | Identità verificabile e shell tipizzata A/B; SVG soltanto dall'owner visual originale. |
| #101 e C97 | UI/UX riproducibile lato codice, non garanzia di mounting nativo. |
| #123, #124, #129, #133 | C125/S03, esclusività della voce, trasporto verificabile; nessun writer UI parallelo. |
| #135–#140 | Originali EDU e sei slot: frame proprietario, `NO_VOICE` quando non qualificato. |
| #144 | Human-first: valore, agency, rischio e prossimo passo leggibili nell'Host. |
| #145/#146 | Candidato thread-bound: area voce dominante e pannelli secondari apribili. |
| #152, #155, #157–#160 | Source closure e brand SVG controllati; prompt ≠ installazione/app. |
| #161–#164, #166–#168 | Compressione lossless, due separatori, badge non interattivo, EXIT solo testuale, glyph proveniente da byte verificati. |
| #169–#174 | Auto/WHAT-HOW e trasporto sorgente; niente bridge presumibile dalla sola disponibilità di tool. |
| #178–#180 | Cold rebind C87, one-ZIP, Host stdio: mantengono una relazione verificabile, non memoria cross-chat. |
| #181/E9 | Rail post-accept e prova owner same-turn, sei slot non riscritti. |
| #182/E10 | Driver multi-turno, lease originale, journal, recupero C87 dopo SIGKILL. |

Questo è un *censimento ragionato delle PR sperimentali pertinenti*, non una dichiarazione di lettura integrale di ogni diff della storia.

## Standard di presentazione e responsabilità

**A · iKant — Focus.** Solo UTF-8 owner-bound oppure `NO_VOICE`. Nessuna compressione, parafrasi o sostituzione da parte dell'Host.

**ESITO · Dove siamo.** Stato originale, badge non interattivo. **B · Host — Perché conta.** Sintesi limitata della sezione Host già valida, disponibile integralmente nel rapporto. **PROVA · Perché il percorso è credibile.** Evidence originale in dettaglio e rapporto bytewise scaricabile; link ad altri riscontri soltanto se file regolari 0600 nella stessa directory, SHA corrispondente, senza symlink. **EDGE · Primo vincolo aperto.** Testo integrale nel rapporto; **NEXT · Azione umana.** Testo originale, non pulsante automatico.

**Privacy e sicurezza:** niente network/script nel report HTML locale; escape di A e tutti gli altri slot, nessuna URL esterna, un solo SVG originale, due divisori, sei slot esatti, hash del rapporto, destinazione fresca `wx`, file 0600 e nessun retry dopo dubbio. Il rapporto contiene testi potenzialmente sensibili dell'utente: deve rimanere in directory Host privata e non essere esposto pubblicamente.

## Verifiche e limiti

I test Node 20/22 devono esercitare E12 insieme a E9/E10 su `main` esatto, coprendo post-C72 con `NO_VOICE`, due turni reali E10 con readback C87, XSS, voice spoofing, path traversal, symlink, tampering, artifact overwrite e 2.048 maschere strutturali. Verificare manifest/closure con il generatore originale. Solo dopo CI si può dire SOFTWARE_PASS.

**NO-GO esterni invariati:** nulla in E12 autentica input/utente nativo ChatGPT, installa/monta un widget permanente in chat, certifica persistenza cross-chat, garantisce accessibilità nel provider o produce un modello cosciente. Un HTML locale self-contained è un'app Host *renderizzabile*, non un'app ChatGPT registrata o continuamente montata. FIELD_TEST in Project dopo merge e generazione prompt solo su esplicita richiesta Host.
