import crypto from 'node:crypto';
import {validateDirectExecutorHandoff} from './bootstrap-intent-adapter.mjs';

export const CANONICAL_COMPOSITION_HANDOFF_SCHEMA='ikant-le-c59-canonical-composition-handoff/v1';
const sha256=x=>crypto.createHash('sha256').update(Buffer.from(JSON.stringify(x))).digest('hex');
const HEX40=/^[a-f0-9]{40}$/;
const HEX64=/^[a-f0-9]{64}$/;

function withoutReceipt(x){const y=structuredClone(x||{});delete y.receipt_sha256;return y;}

export function validateCanonicalCompositionHandoff(value){
 const h=value||{},e=[];
 if(h.schema!==CANONICAL_COMPOSITION_HANDOFF_SCHEMA)e.push('schema');
 if(h.owner!=='SESSION_CHAT_COMPOSITION_CHANNEL'||h.action!=='EXECUTE_PRE_RUNTIME_BOOTSTRAP')e.push('owner_action');
 if(h.source_plane!=='GITHUB_API'||h.transport!=='GITHUB_API_BASE64'||h.byte_path!=='VERIFIED_OPAQUE_RELAY')e.push('canonical_path');
 if(h.sink_plane!=='SESSION_LOCAL_FILESYSTEM'||h.execution_plane!=='SESSION_LOCAL_NODE')e.push('local_plane');
 if(h.container_github_network_required!==false||h.model_selects_carrier!==false||h.model_selects_fallback!==false||h.chat_is_retry_memory!==false)e.push('negative_controls');
 if(h.canonical_activation_authority!==true||h.legacy_compatibility_authority!==false||h.authority!==0)e.push('authority');
 if(!HEX40.test(String(h.source_head||''))||!HEX64.test(String(h.runtime_root_sha256||''))||!HEX64.test(String(h.direct_handoff_receipt_sha256||'')))e.push('binding');
 const d=h.direct_handoff, dv=validateDirectExecutorHandoff(d);
 if(!dv.ok)e.push(...dv.errors.map(x=>'direct:'+x));
 if(d?.receipt_sha256!==h.direct_handoff_receipt_sha256)e.push('direct_receipt_binding');
 if(d?.source_head!==h.source_head||d?.runtime_root_sha256!==h.runtime_root_sha256)e.push('direct_identity_binding');
 const x=d?.execution_input?.activation_executor;
 if(x?.byte_path!=='VERIFIED_OPAQUE_RELAY')e.push('relay_required');
 if(x?.model_mediated_bytes!==true||x?.model_role!=='OPAQUE_TRANSPORT_ONLY')e.push('opaque_transport');
 if(x?.model_rewrite_allowed!==false||x?.semantic_equivalence_allowed!==false)e.push('rewrite');
 if(x?.source_arrival_samehash_required!==true||x?.source_arrival_samehash_verified!==true||x?.opaque_relay_roundtrip_verified!==true)e.push('samehash_roundtrip');
 if(x?.retry_count!==0||x?.retry_semantics!=='IDEMPOTENT_BY_OBJECT_IDENTITY')e.push('retry');
 if(x?.execution_plane!=='SESSION_LOCAL_NODE'||x?.content_addressed!==true||x?.acquisition_complete!==true)e.push('executor');
 for(const forbidden of ['channel_ledger','fastboot_step','fastboot_convergence','attempt_receipt_sha256','selected_carrier','transfer_mode'])if(forbidden in h||forbidden in(d||{}))e.push('legacy_field:'+forbidden);
 if(!HEX64.test(String(h.receipt_sha256||''))||sha256(withoutReceipt(h))!==h.receipt_sha256)e.push('receipt_digest');
 return{ok:e.length===0,errors:[...new Set(e)]};
}

export function issueCanonicalCompositionHandoff(directHandoff){
 const dv=validateDirectExecutorHandoff(directHandoff);
 if(!dv.ok)throw new Error('direct executor handoff invalid: '+dv.errors.join(','));
 const x=directHandoff.execution_input?.activation_executor;
 const material={
  schema:CANONICAL_COMPOSITION_HANDOFF_SCHEMA,
  owner:'SESSION_CHAT_COMPOSITION_CHANNEL',
  action:'EXECUTE_PRE_RUNTIME_BOOTSTRAP',
  source_plane:'GITHUB_API',
  transport:'GITHUB_API_BASE64',
  byte_path:'VERIFIED_OPAQUE_RELAY',
  sink_plane:'SESSION_LOCAL_FILESYSTEM',
  execution_plane:'SESSION_LOCAL_NODE',
  source_head:directHandoff.source_head,
  runtime_root_sha256:directHandoff.runtime_root_sha256,
  direct_handoff_receipt_sha256:directHandoff.receipt_sha256,
  direct_handoff:structuredClone(directHandoff),
  container_github_network_required:false,
  model_selects_carrier:false,
  model_selects_fallback:false,
  chat_is_retry_memory:false,
  canonical_activation_authority:true,
  legacy_compatibility_authority:false,
  active_claim:false,
  authority:0
 };
 const out={...material,receipt_sha256:sha256(material)},v=validateCanonicalCompositionHandoff({...material,receipt_sha256:sha256(material)});
 if(!v.ok)throw new Error('canonical composition handoff invalid: '+v.errors.join(','));
 return out;
}

export function canonicalCompositionExecutionInput(handoff){
 const v=validateCanonicalCompositionHandoff(handoff);
 if(!v.ok)throw new Error('canonical composition handoff invalid: '+v.errors.join(','));
 return structuredClone(handoff.direct_handoff.execution_input);
}
