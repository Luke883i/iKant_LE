import crypto from 'node:crypto';
import {validateDirectExecutorHandoff,directActivationExecutorHandoff} from './bootstrap-intent-adapter.mjs';
import {CANONICAL_COMPOSITION_HANDOFF_SCHEMA,validateCanonicalCompositionHandoff as validateSharedCanonicalCompositionHandoff} from './bootstrap-semantic.mjs';
import {runtimeRootDescriptor} from './runtime-root-verified.mjs';

const sha256=x=>crypto.createHash('sha256').update(Buffer.from(JSON.stringify(x))).digest('hex');

export {CANONICAL_COMPOSITION_HANDOFF_SCHEMA};

export function validateCanonicalCompositionHandoff(value){
 const pre=value?.direct_handoff?.execution_input?.preaccept_handoff||null,descriptor=runtimeRootDescriptor();
 return validateSharedCanonicalCompositionHandoff(value,{sourceHead:value?.source_head??null,runtimeRootSha256:descriptor?.runtime_root_sha256??null,runtimeRootDescriptor:descriptor,orientationObjects:pre?.orientation_objects||[]});
}

export function issueCanonicalCompositionHandoff(directHandoff){
 const dv=validateDirectExecutorHandoff(directHandoff);
 if(!dv.ok)throw new Error('direct executor handoff invalid: '+dv.errors.join(','));
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

export function issueCanonicalSessionChatComposition({preacceptHandoff,activationExecutor,humanInput,acceptanceObservedMonotonicMs}={}){
 const direct=directActivationExecutorHandoff({preacceptHandoff,activationExecutor,humanInput,acceptanceObservedMonotonicMs});
 return issueCanonicalCompositionHandoff(direct.handoff);
}

export function canonicalCompositionExecutionInput(handoff){
 const v=validateCanonicalCompositionHandoff(handoff);
 if(!v.ok)throw new Error('canonical composition handoff invalid: '+v.errors.join(','));
 return structuredClone(handoff.direct_handoff.execution_input);
}
