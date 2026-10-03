import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export const CONTROL_STATES=Object.freeze(['UNBOUND','HOST_OWNED','COHOSTED_BOUND','IKANT_OWNED','RELEASED_TO_HOST','BLOCKED_INTEGRITY']);
export const COMMON_PRIMITIVES=Object.freeze(['TYPED_OWNER_VECTOR','SOVEREIGN_CLAIM_FLOOR','EXECUTION_PLANE_SEPARATION','MATERIALIZED_RUNTIME_REUSE','DURABLE_SESSION_OWNERSHIP','BOUNDED_WARM_ACTIVATION','ONE_NEXT_NO_REPEAT','EXPLICIT_CONTROL_TRANSITION','REPO_SELF_ANTI_RISK_RECHECK','COHOSTED_IS_VALID_TERMINAL']);
export const COMMON_PRIMITIVES_SHA256='134f6a818e2e78a2abfec3c1b7298f171d2d54b3fb5a13292322116500a2999d';
export const WARM_ACTIVATION_BUDGET_MS=10000;
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OWNERS=new Set(['HOST','IKANT','UNKNOWN']);

export function repoSelfAntiRiskRecheck(workspace=ROOT,{noParallelOwnerEvidence=true}={}){
 const root=path.resolve(workspace),errors=[],p=path.join(root,'contracts/control-plane-ownership.json');let c={};
 try{c=JSON.parse(fs.readFileSync(p,'utf8'));}catch{errors.push('contract_read');}
 const ids=(c.common_primitives||[]).map(x=>x?.id||'');
 if(c.schema!=='ikant-control-plane-ownership-contract/v1'||c.repository!=='IKANT_LE')errors.push('contract_identity');
 if(JSON.stringify(ids)!==JSON.stringify(COMMON_PRIMITIVES)||c.common_primitives_sha256!==COMMON_PRIMITIVES_SHA256)errors.push('primitive_drift');
 if(new Set(c.runtime_lattice?.states||[]).size!==CONTROL_STATES.length||CONTROL_STATES.some(x=>!(c.runtime_lattice?.states||[]).includes(x))||c.runtime_lattice?.control_lattice_owner!=='src/control-plane.mjs')errors.push('lattice_drift');
 const a=c.anti_entropy||{};for(const k of ['prompt_or_shell_can_create_ownership','service_tier_can_imply_control_ownership','runtime_bind_can_imply_model_ownership','same_evidence_can_repeat_failed_next','cohosted_state_may_be_laundered_to_sovereign','new_parallel_control_state_owner_allowed','limited_path_may_mutate_canonical_ledger'])if(a[k]!==false)errors.push('anti_entropy:'+k);
 const h=c.hot_path||{};if(h.normal_turn_remote_fetch_allowed!==false||h.normal_turn_mass_qualification_allowed!==false||h.warm_activation_budget_ms!==10000||h.time_budget_exhaustion_is_semantic_failure!==false)errors.push('hot_path');
 for(const rel of c.repo_self_anti_risk?.required_paths||[])if(!fs.existsSync(path.join(root,rel)))errors.push('missing:'+rel);
 if(noParallelOwnerEvidence!==true)errors.push('parallel_owner_evidence');
 return {schema:'ikant-repo-self-anti-risk/v1',repository:'IKANT_LE',status:errors.length?'FAIL':'PASS',errors:[...new Set(errors)].sort(),common_primitives_sha256:COMMON_PRIMITIVES_SHA256,scope:'SESSION_ACTIVATION_BOUNDARY_NOT_TURN_HOT_PATH'};
}

export function deriveControlPlane(evidence={},opts={}){
 const command=opts.command??null,previous=opts.previous??null,owners={...(evidence.owner_vector||{})};for(const k of ['control','model_invocation','egress_gate'])if(!OWNERS.has(owners[k]))owners[k]='UNKNOWN';
 const check=evidence.repo_self_recheck||repoSelfAntiRiskRecheck(opts.workspace||ROOT,{noParallelOwnerEvidence:evidence.no_parallel_owner_evidence!==false}),integrity=[];
 if(check.status!=='PASS')integrity.push('repo_self_recheck');if(evidence.source_identity_ok!==true)integrity.push('source_identity');
 const physical=owners.control==='IKANT'&&owners.model_invocation==='IKANT'&&owners.egress_gate==='IKANT'&&evidence.runtime_materialized===true&&evidence.runtime_bound===true&&evidence.durable_session===true;let state='UNBOUND',transition='NONE';
 if(integrity.length){state='BLOCKED_INTEGRITY';transition='BLOCKED';}
 else if(previous?.state==='IKANT_OWNED'&&command==='RELEASE_TO_HOST'){state='RELEASED_TO_HOST';transition='RELEASED';}
 else if(previous?.state==='IKANT_OWNED'){if(physical)state='IKANT_OWNED';else{state='BLOCKED_INTEGRITY';transition='OWNERSHIP_DRIFT_BLOCKED';integrity.push('ownership_drift');}}
 else if(previous?.state==='RELEASED_TO_HOST'&&command!=='ACTIVATE_IKANT')state='RELEASED_TO_HOST';
 else if(command==='ACTIVATE_IKANT'&&physical){state='IKANT_OWNED';transition='ACTIVATED';}
 else if(owners.control==='HOST'&&evidence.runtime_materialized===true&&evidence.runtime_bound===true&&evidence.cohost_service===true)state='COHOSTED_BOUND';
 else if(owners.control==='HOST')state='HOST_OWNED';
 if(physical&&command===null&&!['IKANT_OWNED','RELEASED_TO_HOST'].includes(previous?.state)){state='UNBOUND';transition='EXPLICIT_ACTIVATION_REQUIRED';}
 const repeated=evidence.previous_action_failed===true&&evidence.evidence_changed!==true;
 return {schema:'ikant-control-plane-receipt/v1',repository:'IKANT_LE',state,owner_vector:owners,command,transition,sovereign_claim_allowed:state==='IKANT_OWNED',cohosted_is_valid_terminal:['HOST_OWNED','COHOSTED_BOUND','RELEASED_TO_HOST'].includes(state),time_budget_exhausted:evidence.warm_start===true&&Number(evidence.startup_ms||0)>10000,time_budget_exhaustion_is_semantic_failure:false,normal_turn_remote_fetch_allowed:false,normal_turn_mass_qualification_allowed:false,retry_same_action_allowed:!repeated,repo_self_recheck_status:check.status,integrity_errors:integrity};
}
