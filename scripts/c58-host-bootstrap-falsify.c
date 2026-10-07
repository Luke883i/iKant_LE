#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#define M0 1u
#define M1 2u
#define M2 4u
#define M3 8u
static uint32_t perm30(uint32_t x){return (uint32_t)(((uint64_t)x*2654435761u)&0x3fffffffu);}
int main(int argc,char**argv){
 uint64_t cases=1000000000ULL;const char*mode="full";
 for(int i=1;i<argc;i++){if(!strcmp(argv[i],"--cases")&&i+1<argc)cases=strtoull(argv[++i],0,10);else if(!strcmp(argv[i],"--mode")&&i+1<argc)mode=argv[++i];}
 if(cases>1073741824ULL){fprintf(stderr,"cases exceed 2^30 decision space\n");return 2;}
 uint64_t current_mismatch=0,final_mismatch=0,unsafe_current=0,del[4]={0,0,0,0},required_worlds=0;
 uint32_t required_union=0;
 for(uint64_t i=0;i<cases;i++){
  uint32_t w=perm30((uint32_t)i);
  if(!strcmp(mode,"global"))w=(w&0x3ffffc00u)|1u;
  const int start=(w>>0)&1,exit=(w>>1)&1,neg=(w>>2)&1,quoted=(w>>3)&1,code=(w>>4)&1,mixed=(w>>5)&1,repo=(w>>6)&1,host_clause=(w>>7)&1;
  const int visible=(w>>10)&1,callable=(w>>11)&1,deploy_valid=(w>>12)&1,preflight=(w>>13)&1,open_only=(w>>14)&1,tool_error=(w>>15)&1,frame_valid=(w>>16)&1;
  const int artifact_required=(w>>22)&1,artifact_present=(w>>23)&1,fallback=(w>>24)&1,multistep=(w>>25)&1,rewrite=(w>>26)&1,stale=(w>>27)&1,new_task=(w>>28)&1,native_claim=(w>>29)&1;
  const int accept_app_only=(w>>19)&1;
  const int positive_start=start&&!neg&&!quoted&&!code&&!exit;
  const int pure=positive_start&&!mixed&&!repo&&!host_clause;
  const int ready=visible&&callable&&deploy_valid&&preflight;
  const int oracle_open=pure&&ready&&!tool_error;
  uint32_t req=0;
  if(positive_start&&!pure)req|=M0;
  if(pure&&visible&&callable&&(!deploy_valid||!preflight))req|=M1;
  if((!open_only)||(!accept_app_only)||multistep)req|=M2;
  if(fallback||rewrite||native_claim||(!frame_valid&&oracle_open)||(artifact_required&&!artifact_present&&oracle_open)||stale||new_task)req|=M3;
  if(req){required_worlds++;required_union|=req;for(int b=0;b<4;b++)if(req&(1u<<b))del[b]++;}
  const int cur_open=positive_start&&visible&&callable&&!tool_error;
  int cur_bad=(cur_open!=oracle_open);
  if((!open_only)||(!accept_app_only)||multistep)cur_bad=1;
  if((fallback||rewrite||native_claim)&&cur_open)cur_bad=1;
  if(cur_bad){current_mismatch++;if(cur_open&&!oracle_open)unsafe_current++;}
  const int final_open=oracle_open;
  int final_bad=(final_open!=oracle_open);
  if(!open_only||!accept_app_only)final_bad=1;
  if(final_bad)final_mismatch++;
 }
 const int unique_minimum=(required_union==(M0|M1|M2|M3))&&del[0]&&del[1]&&del[2]&&del[3]&&final_mismatch==0;
 printf("{\n");
 printf("  \"schema\": \"ikant-le-c58-host-bootstrap-falsification/v1\",\n");
 printf("  \"mode\": \"%s\",\n",mode);
 printf("  \"cases\": %llu,\n",(unsigned long long)cases);
 printf("  \"decision_bits\": 30,\n  \"decision_space\": 1073741824,\n");
 printf("  \"sample_without_replacement\": %s,\n",strcmp(mode,"global")?"true":"false");
 printf("  \"current_pr67_mismatches\": %llu,\n",(unsigned long long)current_mismatch);
 printf("  \"current_pr67_unsafe_open_promotions\": %llu,\n",(unsigned long long)unsafe_current);
 printf("  \"final_candidate_mismatches\": %llu,\n",(unsigned long long)final_mismatch);
 printf("  \"worlds_requiring_at_least_one_mechanism\": %llu,\n",(unsigned long long)required_worlds);
 printf("  \"deletion_witnesses\": {\"DEDICATED_LIFECYCLE_GATE\": %llu, \"READY_VISIBLE_OPEN_BINDING\": %llu, \"ONE_MODEL_OPEN_EDGE\": %llu, \"OWNER_HANDOFF_NO_SUBSTITUTE\": %llu},\n",(unsigned long long)del[0],(unsigned long long)del[1],(unsigned long long)del[2],(unsigned long long)del[3]);
 printf("  \"architecture_lattice\": 16,\n  \"required_union_mask\": %u,\n  \"unique_minimum_all_four\": %s,\n",(unsigned)required_union,unique_minimum?"true":"false");
 printf("  \"status\": \"%s\"\n}\n",unique_minimum?"PASS":"FAIL");
 return unique_minimum?0:1;
}
