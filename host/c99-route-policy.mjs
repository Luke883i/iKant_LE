/** C99 pure runtime path policy: source structure is NOT native/host proof.
 * This module has no IO, provider calls, writer, owner identity or status promotion.
 */
const HEAD=/^[0-9a-f]{40}$/;
const SHA=/^[0-9a-f]{64}$/;
const stop=(edge)=>Object.freeze({
 schema:'ikant-le-c99-route-gate/v1',status:'C99_STOP',
 first_unclosed_edge:edge,callback_shape_only:false,
 source_origin_attested:false,native_event_attested:false,
 owner_executed:false,active:false,authority:0
});
const prop=(o,k)=>{
 try {
  if(!o||typeof o!=='object')return undefined;
  const d=Object.getOwnPropertyDescriptor(o,k);
  return d&&Object.hasOwn(d,'value')?d.value:undefined;
 }catch{return undefined;}
};
export function readC99SelectionFields(selection){
 const selected_mode=prop(selection,'selected_mode');
 const status=prop(selection,'status');
 return Object.freeze({selected_mode,status});
}
/** Source-bound host entry preflight, before filesystem or C84 side effects. */
export function gateC99ExperimentalEntry({sourceHead,selection,humanInput,
 readC77Member,readC77Archive,nodeGithubNetworkRequested=false}={}){
 if(nodeGithubNetworkRequested!==false)return stop('CHATGPT_NODE_GITHUB_NETWORK_FORBIDDEN');
 if(!HEAD.test(sourceHead||''))return stop('C72_OR_SOURCE_CURRENT_INPUT_REQUIRED');
 const s=readC99SelectionFields(selection);
 if(s.selected_mode!=='EXPERIMENTAL'||s.status!=='EXPERIMENTAL_SELECTED_NOT_RUNNING')
  return stop('C72_OR_SOURCE_CURRENT_INPUT_REQUIRED');
 if(typeof humanInput!=='string'||!humanInput.trim()||
    Buffer.byteLength(humanInput,'utf8')>600||
    Buffer.from(humanInput,'utf8').toString('utf8')!==humanInput)
  return stop('C72_OR_SOURCE_CURRENT_INPUT_REQUIRED');
 const n=Number(typeof readC77Member==='function')+Number(typeof readC77Archive==='function');
 if(n===0)return stop('HOST_CONNECTOR_TO_NODE_BYTE_CALLBACK_UNAVAILABLE_NO_NODE_DNS_RETRY');
 if(n!==1)return stop('AMBIGUOUS_HOST_CARRIER_SELECT_ONE');
 return Object.freeze({schema:'ikant-le-c99-route-gate/v1',
  status:'C99_CALLBACK_SHAPE_ONLY_NOT_AUTHENTICATED',
  first_unclosed_edge:'C81_SOURCE_GIT_OBJECT_BYTES_REQUIRED',
  callback_shape_only:true,source_origin_attested:false,
  native_event_attested:false,owner_executed:false,active:false,authority:0});
}
export function gateC99SourceHandoff({sourceHead,manifestSha256,sourceProof}={}){
 if(!HEAD.test(sourceHead||'')||!SHA.test(manifestSha256||''))
  return stop('FROZEN_HEAD_AND_MANIFEST_REQUIRED');
 const commit=prop(sourceProof,'commitBase64');
 const trees=prop(sourceProof,'treeObjects');
 if(typeof commit!=='string'||!commit.length||commit.length>2_000_000||
  !Array.isArray(trees)||trees.length<1||trees.length>256)
  return stop('C81_VERIFIED_SOURCE_PROOF_REQUIRED');
 // Shape-only: actual proof verification remains solely with C81.
 return Object.freeze({schema:'ikant-le-c99-route-gate/v1',
  status:'C99_C81_PROOF_SHAPE_ONLY_NOT_VERIFIED',
  first_unclosed_edge:'C81_ACTUAL_GIT_REACHABILITY_VERIFICATION',
  callback_shape_only:false,source_origin_attested:false,native_event_attested:false,
  owner_executed:false,active:false,authority:0});
}
