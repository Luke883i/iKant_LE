import fs from 'node:fs';
import path from 'node:path';
import { EXACT, readTerms, classifyInput, validateSurfaceA, fallbackSurfaceA, renderHumanOutput } from './contract.mjs';
import { withWriterLock, loadState, appendEvent, newEpoch, runtimePaths } from './state.mjs';
import { runProbe } from './probe.mjs';
import { buildBacklogModel, validateBacklogModel } from './backlog.mjs';
import { writeBacklogDocx } from './docx.mjs';

export function transitionPure(state, inputKind, termsDigest, probeOk = true) {
  const s = { ...state };
  if (inputKind === 'TERMS') return { state: s, terminal: 'TERMS' };
  if (inputKind === 'ACCEPT') {
    if (s.status === 'ACTIVE') return { state: s, terminal: 'DENY' };
    s.epoch = s.epoch || 'EPOCH'; s.status = 'ACCEPTED'; s.terms_digest = termsDigest; s.accepted = true; s.probed = false; s.initialized = false;
    return { state: s, terminal: 'ACCEPTED' };
  }
  if (inputKind === 'PROBE') {
    if (!s.accepted || s.terms_digest !== termsDigest) return { state: s, terminal: 'DENY' };
    if (!probeOk) return { state: s, terminal: 'FAILURE' };
    s.probed = true; s.status = 'PROBED'; return { state: s, terminal: 'PROBED' };
  }
  if (inputKind === 'INITIALIZE') {
    if (!s.accepted || !s.probed || s.terms_digest !== termsDigest) return { state: s, terminal: 'DENY' };
    s.initialized = true; s.status = 'ACTIVE'; return { state: s, terminal: 'ACTIVE' };
  }
  if (inputKind === 'EXIT') {
    if (s.status !== 'ACTIVE') return { state: s, terminal: 'DENY' };
    s.status = 'EXITED'; s.initialized = false; return { state: s, terminal: 'EXITED' };
  }
  if (inputKind === 'PREFERENCE') {
    if (s.status !== 'ACTIVE') return { state: s, terminal: 'DENY' };
    return { state: s, terminal: 'PREFERENCE' };
  }
  if (inputKind === 'TURN') {
    if (s.terms_digest !== termsDigest && s.accepted) return { state: s, terminal: 'RESET_REQUIRED' };
    if (s.status !== 'ACTIVE') return { state: s, terminal: 'DENY' };
    s.cycle += 1; return { state: s, terminal: 'TURN' };
  }
  return { state: s, terminal: 'FAILURE' };
}

function human(text) { return { stdout: text, code: 0 }; }

export function runCommand(input, { candidate = null } = {}) {
  return withWriterLock(() => {
    const terms = readTerms();
    let state = loadState();
    const kind = classifyInput(input);

    if (kind === 'TERMS') return human(`${terms.text.trim()}\n\nTerms digest: ${terms.digest}`);

    if (kind === 'ACCEPT') {
      const next = transitionPure(state, kind, terms.digest);
      if (next.terminal === 'DENY') return human('iKant_LE è già attivo: l’ammissione non viene riaperta dentro la stessa modalità.');
      next.state.epoch = newEpoch();
      appendEvent('ACCEPT', next.state, 'Exact current terms accepted.');
      return human('Accettazione registrata per i termini correnti. Il passo successivo è l’esatto comando PROBE IKANT.');
    }

    if (kind === 'PROBE') {
      const probe = runProbe();
      const next = transitionPure(state, kind, terms.digest, probe.ok);
      if (next.terminal === 'DENY') return human('Probe negato: serve prima I ACCEPT sui termini correnti.');
      if (next.terminal === 'FAILURE') return human(`Probe non superato: ${probe.reason}. iKant_LE resta inattivo.`);
      appendEvent('PROBE', next.state, 'Local Node/FS/crypto/clock/artifact probe passed.', { node: probe.node });
      return human('Probe locale superato con readback reale. Il passo successivo è l’esatto comando INITIALIZE IKANT.');
    }

    if (kind === 'INITIALIZE') {
      const next = transitionPure(state, kind, terms.digest);
      if (next.terminal === 'DENY') return human('Inizializzazione negata: accettazione e probe correnti devono risultare entrambi validi.');
      appendEvent('INITIALIZE', next.state, 'Local iKant_LE epoch initialized.');
      return human('iKant_LE è attivo per questa sessione locale. Da ora le risposte sostanziali seguono il contratto Surface A + backlog DOCX; EXIT IKANT chiude esplicitamente la modalità.');
    }

    if (kind === 'EXIT') {
      const next = transitionPure(state, kind, terms.digest);
      if (next.terminal === 'DENY') return human('EXIT IKANT non ha effetto perché iKant_LE non risulta ACTIVE.');
      appendEvent('EXIT', next.state, 'Human requested exact iKant_LE exit.');
      return human('Modalità iKant_LE chiusa. Il profilo di sessione locale è stato rilasciato; per rientrare serve un nuovo ciclo di ammissione.');
    }

    if (kind === 'PREFERENCE') {
      const next = transitionPure(state, kind, terms.digest);
      if (next.terminal === 'DENY') return human('Preferenza non registrata: iKant_LE non è ACTIVE.');
      next.state.preference = input.slice('PREFER '.length);
      appendEvent('PREFERENCE', next.state, 'Explicit reversible verbosity preference updated.');
      return human(`Preferenza esplicita impostata su ${next.state.preference}. Non viene inferito alcun profilo personale aggiuntivo.`);
    }

    const next = transitionPure(state, kind, terms.digest);
    if (next.terminal === 'RESET_REQUIRED') return human('I termini locali sono cambiati dopo l’accettazione. iKant_LE richiede un nuovo ciclo di ammissione e non produce una risposta ACTIVE con stato misto.');
    if (next.terminal === 'DENY') return human('iKant_LE non è ACTIVE. Segui TERMS -> I ACCEPT -> PROBE IKANT -> INITIALIZE IKANT.');

    state = next.state;
    let surfaceA = candidate;
    const valid = validateSurfaceA(surfaceA);
    const source = valid.ok ? 'host-candidate' : 'deterministic-fallback';
    if (!valid.ok) surfaceA = fallbackSurfaceA(input, state.preference);
    const fallbackValid = validateSurfaceA(surfaceA);
    if (!fallbackValid.ok) throw new Error(`FAILURE: internal Surface A fallback violates contract (${fallbackValid.words} words)`);

    const backlog = buildBacklogModel({ cycle: state.cycle, input, surfaceA, state, source });
    if (!validateBacklogModel(backlog)) throw new Error('FAILURE: backlog model invalid');
    const artifactName = `iKant_LE_Backlog_${String(state.cycle).padStart(4, '0')}.docx`;
    const artifactPath = path.join(runtimePaths().artifacts, artifactName);
    const docx = writeBacklogDocx(artifactPath, backlog);
    appendEvent('TURN', state, 'Surface A validated and same-turn DOCX backlog persisted/read back.', { artifact: artifactName, bytes: docx.bytes, response_source: source });
    return human(renderHumanOutput(surfaceA, artifactName));
  });
}
