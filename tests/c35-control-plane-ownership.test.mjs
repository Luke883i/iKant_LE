import test from 'node:test';
import assert from 'node:assert/strict';
import {
  deriveControlPlane,
  repoSelfAntiRiskRecheck,
  WARM_ACTIVATION_BUDGET_MS
} from '../src/control-plane.mjs';

function hostEvidence(){
  return {
    owner_vector:{control:'HOST',model_invocation:'HOST',egress_gate:'HOST'},
    source_identity_ok:true,
    runtime_materialized:true,
    runtime_bound:true,
    durable_session:true,
    cohost_service:true,
    warm_start:true,
    startup_ms:100,
    no_parallel_owner_evidence:true
  };
}
function sovereignEvidence(){
  return {
    ...hostEvidence(),
    owner_vector:{control:'IKANT',model_invocation:'IKANT',egress_gate:'IKANT'}
  };
}

test('C35 repo-self anti-risk reopens current contract',()=>{
  const r=repoSelfAntiRiskRecheck();
  assert.equal(r.status,'PASS',JSON.stringify(r));
});

test('C35 cohosted runtime is useful terminal but not sovereign',()=>{
  const r=deriveControlPlane(hostEvidence());
  assert.equal(r.state,'COHOSTED_BOUND');
  assert.equal(r.sovereign_claim_allowed,false);
  assert.equal(r.cohosted_is_valid_terminal,true);
});

test('C35 owner triad still requires explicit activation',()=>{
  const pre=deriveControlPlane(sovereignEvidence());
  assert.equal(pre.state,'UNBOUND');
  assert.equal(pre.transition,'EXPLICIT_ACTIVATION_REQUIRED');
  const active=deriveControlPlane(sovereignEvidence(),{command:'ACTIVATE_IKANT'});
  assert.equal(active.state,'IKANT_OWNED');
  assert.equal(active.sovereign_claim_allowed,true);
});

test('C35 release is explicit and sticky',()=>{
  const active=deriveControlPlane(sovereignEvidence(),{command:'ACTIVATE_IKANT'});
  const released=deriveControlPlane(sovereignEvidence(),{command:'RELEASE_TO_HOST',previous:active});
  assert.equal(released.state,'RELEASED_TO_HOST');
  const again=deriveControlPlane(sovereignEvidence(),{previous:released});
  assert.equal(again.state,'RELEASED_TO_HOST');
});

test('C35 hot path timeout is non-semantic and unchanged failure cannot repeat',()=>{
  const r=deriveControlPlane({
    ...hostEvidence(),
    startup_ms:WARM_ACTIVATION_BUDGET_MS+1,
    previous_action_failed:true,
    evidence_changed:false
  });
  assert.equal(r.time_budget_exhausted,true);
  assert.equal(r.time_budget_exhaustion_is_semantic_failure,false);
  assert.equal(r.retry_same_action_allowed,false);
  assert.equal(r.normal_turn_remote_fetch_allowed,false);
  assert.equal(r.normal_turn_mass_qualification_allowed,false);
});
