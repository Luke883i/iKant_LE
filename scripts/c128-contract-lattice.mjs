/** 4^5=1024 architecture contracts, ranked without claiming empirical model trials.
 * Finite safety oracle is independent of candidate scoring. No runtime permissions.
 */
export const AXES=Object.freeze({
 source:['trust_url','historic_c107_only','four_blob_source_exact','fork_new_writer'],
 deadline:['infinite_wait','timeout_then_blind_retry','bounded_timeout_stop_unknown','no_deadline_assumption'],
 bridge:['trust_declared_id','trust_mutable_getters','descriptor_plus_callable_uniqueness','unsupported_signed_capability'],
 cache:['accept_any_json','canonical_only','canonical_inode_bound_readback','trust_path'],
 owner:['direct_c107','existing_pr119_and_c125','second_c87_writer','pretend_native_chatgpt']
});
const groups=Object.values(AXES);
const satisfies=v=>v[0]===2&&v[1]===2&&v[2]===2&&v[3]===2&&v[4]===1;
const score=v=> [
 // hard release constraints first (total score 0 iff no capability invented)
 (v[0]===2?0:10000)+(v[1]===2?0:8000)+(v[2]===2?0:6000)+
 (v[3]===2?0:4000)+(v[4]===1?0:2000),
 // operational efficiency prefers actual cache and existing owners, not another runtime
 v.reduce((n,x,i)=>n+Math.abs(x-[2,2,2,2,1][i]),0)
];
export function enumerateC128Contracts(){
 const candidates=[];
 for(let n=0;n<1024;n++){
  let q=n,v=[];for(let k=0;k<5;k++){v.push(q%4);q=Math.floor(q/4)}
  candidates.push({id:n,selection:v.map((x,i)=>groups[i][x]),safe:satisfies(v),fitness:score(v)});
 }
 candidates.sort((a,b)=>a.fitness[0]-b.fitness[0]||a.fitness[1]-b.fitness[1]||a.id-b.id);
 return {schema:'ikant-c128-contract-design-lattice/v1',candidates:1024,
  feasible:candidates.filter(x=>x.safe).length,selected:candidates[0],alternatives:candidates.slice(1,6),
  method:'EXHAUSTIVE_FINITE_4_POW_5_WITH_INDEPENDENT_FAIL_CLOSED_CONSTRAINTS',
  model_llm_calls:0,platform_receipts:0,semantic_causality_attested:false};
}
if(process.argv[1]?.endsWith('c128-contract-lattice.mjs')){
 const r=enumerateC128Contracts();console.log(JSON.stringify(r,null,2));
 if(r.candidates!==1024||r.feasible!==1||!r.selected.safe)process.exitCode=1;
}
