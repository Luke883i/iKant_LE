/**
 * C98.12 CHATGPT_SESSION_NODE: NEGATIVE HOST CAPABILITY CONTRACT.
 * The ChatGPT session Node/container has no attested GitHub DNS/HTTPS route.
 * NEVER attempt `https://api.github.com`, raw.githubusercontent.com, git
 * clone/fetch, curl, wget, direct ZIP, or an implicit C94 HTTPS fallback from
 * this process. Repeating a DNS failure is not discovery or convergence.
 * Only an actually installed host connector/host-file callback may supply bytes.
 * A callback's JavaScript type is NOT evidence of connector authorization.
 * This module never calls DNS, HTTPS, a shell, provider or native renderer.
 * Different application hosts can implement independent, separately attested
 * transports: this project-local policy MUST NOT silently authorize them.
 */
export const C98_CHATGPT_NODE_NETWORK_DENIAL=Object.freeze({
 environment:'CHATGPT_SESSION_NODE',
 github_dns_attested:false,
 node_github_https_allowed:false,
 node_git_clone_allowed:false,
 node_direct_zip_allowed:false,
 node_curl_wget_allowed:false,
 raw_github_download_in_node_allowed:false,
 host_connector_byte_callback_required:true,
 host_download_attempts_authorized_by_this_module:0,
 manual_handoff_automatic:false,
});
const H40=/^[0-9a-f]{40}$/;
const diagnostic=(edge)=>Object.freeze({schema:'ikant-le-c98-chatgpt-offline-boundary/v1',
 status:'C98_CHATGPT_OFFLINE_STOP',first_unclosed_edge:edge,
 environment:'CHATGPT_SESSION_NODE',
 node_github_network_permitted:false,host_connector_origin_attested:false,
 host_byte_transfer_attested:false,active:false,authority:0});
/** A negative capability check, not a host attestation. */
export function preflightC98ChatGPTOffline({sourceHead,selection,humanInput,
 readC77Member,readC77Archive,nodeGithubNetworkRequested=false}={}){
 if(nodeGithubNetworkRequested!==false)return diagnostic('CHATGPT_NODE_GITHUB_NETWORK_FORBIDDEN');
 if(!H40.test(sourceHead||'')||selection?.selected_mode!=='EXPERIMENTAL'||
  selection.status!=='EXPERIMENTAL_SELECTED_NOT_RUNNING'||
  typeof humanInput!=='string'||!humanInput.trim()||
  Buffer.byteLength(humanInput,'utf8')>600)
  return diagnostic('C72_OR_SOURCE_CURRENT_INPUT_REQUIRED');
 const n=Number(typeof readC77Member==='function')+Number(typeof readC77Archive==='function');
 if(n===0)return diagnostic('HOST_CONNECTOR_TO_NODE_BYTE_CALLBACK_UNAVAILABLE_NO_NODE_DNS_RETRY');
 if(n!==1)return diagnostic('AMBIGUOUS_HOST_CARRIER_SELECT_ONE');
 return Object.freeze({schema:'ikant-le-c98-chatgpt-offline-boundary/v1',
  status:'C98_CALLBACK_SHAPE_READY_NOT_HOST_AUTHENTICATED',
  node_github_network_permitted:false,host_connector_origin_attested:false,
  host_byte_transfer_attested:false,active:false,authority:0});
}
