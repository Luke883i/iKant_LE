export function buildBacklogModel({ cycle, input, surfaceA, state, source = 'host-candidate-or-fallback' }) {
  return {
    schema: 'ikant-le-backlog/v1',
    title: `iKant_LE Backlog ${cycle}`,
    cycle,
    terminal: 'ANSWER',
    sections: [
      { title: 'Decision log', items: [
        `Surface A accepted under the local 50-500 word contract.`,
        `Lifecycle state remained ${state.status}; no external action authority was created.`
      ]},
      { title: 'Inference log', items: [
        `Human input was routed as one substantive local turn.`,
        `Response source: ${source}. This source has zero independent epistemic authority.`
      ]},
      { title: 'Conflict log', items: [
        'No unresolved lifecycle contradiction was required to produce this turn.'
      ]},
      { title: 'Feedback log', items: [
        `Explicit verbosity preference: ${state.preference}. No inferred personality profile is stored.`
      ]},
      { title: 'Strategic log', items: [
        'Keep Surface A compressed; move technical detail and traceability to this same-turn artifact.',
        'Escalate rather than infer permission if future work becomes consequential.'
      ]},
      { title: 'Public reasons and evidence boundary', items: [
        `Input summary: ${String(input).replace(/\s+/g, ' ').slice(0, 400)}`,
        `Surface A excerpt: ${String(surfaceA).replace(/\s+/g, ' ').slice(0, 500)}`,
        'This backlog, its hashes and its telemetry are runtime records, not independent evidence or world truth.'
      ]}
    ]
  };
}

export function validateBacklogModel(model) {
  if (model?.schema !== 'ikant-le-backlog/v1') return false;
  if (!Number.isInteger(model.cycle) || model.cycle < 1) return false;
  if (!Array.isArray(model.sections) || model.sections.length < 5) return false;
  const text = JSON.stringify(model);
  if (/private chain[- ]of[- ]thought|hidden reasoning/i.test(text)) return false;
  return true;
}
