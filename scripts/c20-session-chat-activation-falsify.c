#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

enum { P_DEPLOYED=0, P_ONESHOT=1 };
enum { S_BLOCKED_INTEGRITY=0, S_AWAITING_ACCEPTANCE=1, S_DEADLINE_TERMINAL=2, S_HOST_UNAVAILABLE=3, S_BLOCKED=4, S_ACTIVE=5 };

typedef struct {
  int profile,accepted,origin_valid,deadline_valid,source_match,terms_match,receipt_integrity;
  int model_mediated_bytes,history_double_commit,epoch_binding,active_readback_contradiction;
  int deployment_attested,session_bound,execution_plane_bound,repository_transfer_per_chat;
  int carrier_observed,byte_ingress,remote_history_committed;
  int local_root_readback,live_probe,writer_readback,active_commit,active_readback;
} V;

static uint64_t rng_state=0x15620C20260928ULL;
static uint64_t xorshift64(void){uint64_t x=rng_state;x^=x<<13;x^=x>>7;x^=x<<17;return rng_state=x;}
static int rnd(int n){return (int)(xorshift64()%(uint64_t)n);}

static int oracle(const V *o){
  int integrity=(o->profile!=P_DEPLOYED&&o->profile!=P_ONESHOT)||!o->source_match||!o->terms_match||!o->receipt_integrity||o->model_mediated_bytes||o->history_double_commit||!o->epoch_binding||o->active_readback_contradiction||(o->profile==P_DEPLOYED&&o->repository_transfer_per_chat);
  if(integrity)return S_BLOCKED_INTEGRITY;
  if(!o->accepted)return S_AWAITING_ACCEPTANCE;
  if(!o->origin_valid||!o->deadline_valid)return S_DEADLINE_TERMINAL;
  if(o->profile==P_DEPLOYED){
    if(!o->deployment_attested||!o->session_bound||!o->execution_plane_bound)return S_HOST_UNAVAILABLE;
  }else{
    if(!o->carrier_observed||!o->byte_ingress)return S_HOST_UNAVAILABLE;
    if(!o->remote_history_committed)return S_BLOCKED;
  }
  if(!o->local_root_readback||!o->live_probe||!o->writer_readback)return S_HOST_UNAVAILABLE;
  if(!o->active_commit||!o->active_readback)return S_BLOCKED;
  return S_ACTIVE;
}
static int candidate(const V *o){
  uint32_t integrity=0;
  integrity|=(o->profile>1u);
  integrity|=((unsigned)!o->source_match)<<1;
  integrity|=((unsigned)!o->terms_match)<<2;
  integrity|=((unsigned)!o->receipt_integrity)<<3;
  integrity|=((unsigned)o->model_mediated_bytes)<<4;
  integrity|=((unsigned)o->history_double_commit)<<5;
  integrity|=((unsigned)!o->epoch_binding)<<6;
  integrity|=((unsigned)o->active_readback_contradiction)<<7;
  integrity|=((unsigned)(o->profile==P_DEPLOYED&&o->repository_transfer_per_chat))<<8;
  if(integrity)return S_BLOCKED_INTEGRITY;
  if(!o->accepted)return S_AWAITING_ACCEPTANCE;
  if(!(o->origin_valid&&o->deadline_valid))return S_DEADLINE_TERMINAL;
  if(o->profile==P_DEPLOYED){
    if(!(o->deployment_attested&&o->session_bound&&o->execution_plane_bound))return S_HOST_UNAVAILABLE;
  }else{
    if(!(o->carrier_observed&&o->byte_ingress))return S_HOST_UNAVAILABLE;
    if(!o->remote_history_committed)return S_BLOCKED;
  }
  if(!(o->local_root_readback&&o->live_probe&&o->writer_readback))return S_HOST_UNAVAILABLE;
  if(!(o->active_commit&&o->active_readback))return S_BLOCKED;
  return S_ACTIVE;
}
static V canonical(int profile){
  V v={0};v.profile=profile;v.accepted=1;v.origin_valid=1;v.deadline_valid=1;v.source_match=1;v.terms_match=1;v.receipt_integrity=1;v.model_mediated_bytes=0;v.history_double_commit=0;v.epoch_binding=1;v.active_readback_contradiction=0;
  v.deployment_attested=1;v.session_bound=1;v.execution_plane_bound=1;v.repository_transfer_per_chat=0;
  v.carrier_observed=1;v.byte_ingress=1;v.remote_history_committed=1;v.local_root_readback=1;v.live_probe=1;v.writer_readback=1;v.active_commit=1;v.active_readback=1;return v;
}
static void flip(V *v,int bit){
  switch(bit){
    case 0:v->profile^=1;break;case 1:v->accepted^=1;break;case 2:v->origin_valid^=1;break;case 3:v->deadline_valid^=1;break;
    case 4:v->source_match^=1;break;case 5:v->terms_match^=1;break;case 6:v->receipt_integrity^=1;break;case 7:v->model_mediated_bytes^=1;break;
    case 8:v->history_double_commit^=1;break;case 9:v->epoch_binding^=1;break;case 10:v->active_readback_contradiction^=1;break;
    case 11:v->deployment_attested^=1;break;case 12:v->session_bound^=1;break;case 13:v->execution_plane_bound^=1;break;case 14:v->repository_transfer_per_chat^=1;break;
    case 15:v->carrier_observed^=1;break;case 16:v->byte_ingress^=1;break;case 17:v->remote_history_committed^=1;break;
    case 18:v->local_root_readback^=1;break;case 19:v->live_probe^=1;break;case 20:v->writer_readback^=1;break;case 21:v->active_commit^=1;break;case 22:v->active_readback^=1;break;
  }
}
static void base_scenario(V *v,int s){
  *v=canonical(s&1);
  switch(s){
    case 2:v->deployment_attested=0;break;case 3:v->carrier_observed=0;break;case 4:v->byte_ingress=0;break;case 5:v->remote_history_committed=0;break;
    case 6:v->origin_valid=0;break;case 7:v->deadline_valid=0;break;case 8:v->source_match=0;break;case 9:v->receipt_integrity=0;break;
    case 10:v->local_root_readback=0;break;case 11:v->live_probe=0;break;case 12:v->writer_readback=0;break;case 13:v->active_commit=0;break;
    case 14:v->active_readback=0;break;case 15:v->history_double_commit=1;break;case 16:v->model_mediated_bytes=1;break;case 17:v->epoch_binding=0;break;
    case 18:v->repository_transfer_per_chat=1;v->profile=P_DEPLOYED;break;case 19:v->session_bound=0;v->profile=P_DEPLOYED;break;
    case 20:v->execution_plane_bound=0;v->profile=P_DEPLOYED;break;case 21:v->accepted=0;break;case 22:v->active_readback_contradiction=1;break;case 23:v->terms_match=0;break;
  }
}
static int active_ignoring(const V *x,int node){
  V v=*x;
  switch(node){
    case 0:v.accepted=1;v.origin_valid=1;break;
    case 1:v.source_match=1;v.terms_match=1;v.receipt_integrity=1;v.model_mediated_bytes=0;v.history_double_commit=0;v.epoch_binding=1;v.active_readback_contradiction=0;break;
    case 2:if(v.profile==P_DEPLOYED){v.deployment_attested=1;v.session_bound=1;v.execution_plane_bound=1;v.repository_transfer_per_chat=0;}else{v.carrier_observed=1;v.byte_ingress=1;v.remote_history_committed=1;}break;
    case 3:v.local_root_readback=1;break;
    case 4:v.deadline_valid=1;break;
    case 5:v.live_probe=1;v.writer_readback=1;break;
    case 6:v.active_commit=1;v.active_readback=1;break;
  }
  return candidate(&v)==S_ACTIVE;
}
int main(int argc,char **argv){
  uint64_t cases=100000000ULL;if(argc>1)cases=strtoull(argv[1],0,10);if(argc>2)rng_state=strtoull(argv[2],0,10);if(cases!=100000000ULL){fprintf(stderr,"C20 requires exactly 100000000 cases\n");return 2;}
  uint64_t mismatches=0,unsafe=0,profiles[2]={0},states[6]={0},flips[23]={0},witness[7]={0},active_expected=0,active_actual=0;unsigned min_flips=99,max_flips=0;
  for(uint64_t i=0;i<cases;i++){
    V v;base_scenario(&v,rnd(24));int n=1+rnd(6),used[23]={0};if((unsigned)n<min_flips)min_flips=n;if((unsigned)n>max_flips)max_flips=n;
    for(int j=0;j<n;j++){int b;do b=rnd(23);while(used[b]);used[b]=1;flip(&v,b);flips[b]++;}
    int a=oracle(&v),c=candidate(&v);profiles[v.profile&1]++;states[c]++;if(a==S_ACTIVE)active_expected++;if(c==S_ACTIVE)active_actual++;if(a!=c)mismatches++;if(c==S_ACTIVE&&a!=S_ACTIVE)unsafe++;
    if(a!=S_ACTIVE)for(int node=0;node<7;node++)if(active_ignoring(&v,node))witness[node]++;
  }
  int pass=mismatches==0&&unsafe==0&&active_actual==active_expected&&profiles[0]>0&&profiles[1]>0;for(int i=0;i<23;i++)if(flips[i]==0)pass=0;for(int i=0;i<7;i++)if(witness[i]==0)pass=0;
  double score=1.0-(double)mismatches/(double)cases;
  printf("{\"schema\":\"ikant-le-c20-session-chat-activation-qualification/v1\",\"cases\":%llu,\"seed\":%llu,\"status\":\"%s\",\"qualification_score\":%.12f,\"mismatches\":%llu,\"unsafe_active\":%llu,\"active_expected\":%llu,\"active_actual\":%llu,\"profiles\":{\"deployed\":%llu,\"oneshot\":%llu},\"mutation_depth\":{\"min\":%u,\"max\":%u},\"states\":[%llu,%llu,%llu,%llu,%llu,%llu],\"deletion_false_green\":[%llu,%llu,%llu,%llu,%llu,%llu,%llu],\"claim_boundary\":{\"semantic_not_physical_chatgpt_registration\":true,\"seeded_complete_multi_mutation\":true}}\n",
    (unsigned long long)cases,(unsigned long long)rng_state,pass?"PASS":"FAIL",score,(unsigned long long)mismatches,(unsigned long long)unsafe,(unsigned long long)active_expected,(unsigned long long)active_actual,(unsigned long long)profiles[0],(unsigned long long)profiles[1],min_flips,max_flips,
    (unsigned long long)states[0],(unsigned long long)states[1],(unsigned long long)states[2],(unsigned long long)states[3],(unsigned long long)states[4],(unsigned long long)states[5],
    (unsigned long long)witness[0],(unsigned long long)witness[1],(unsigned long long)witness[2],(unsigned long long)witness[3],(unsigned long long)witness[4],(unsigned long long)witness[5],(unsigned long long)witness[6]);
  return pass?0:1;
}
