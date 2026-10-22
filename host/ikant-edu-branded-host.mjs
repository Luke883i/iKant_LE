/** Read-only HOST presentation adapter. It cannot create C87 voice or native ChatGPT identity. */
import {projectS03CompletedEduTurn} from './s03-owner-bound-presentation.mjs';
import {createHash} from 'node:crypto';
const SOURCE='92cc620299e9ee365386782921036e57d2f6bd0e';
const ICON='https://raw.githubusercontent.com/Luke883i/iKant_LE/'+SOURCE+'/assets/brand/ikant-light.svg';
const H=x=>createHash('sha256').update(x,'utf8').digest('hex');
const denied=edge=>Object.freeze({ok:false,first_edge:edge,authority:0,active:false,voice:'NO_VOICE',native_avatar_attested:false});
/** Operates ONLY upon the original C125 and owner output, never generic assistant prose. */
export function projectBrandedEduHostTurn({ownerTurn,originalC125Text}={}){
 const p=projectS03CompletedEduTurn({ownerTurn,originalC125Text});
 if(p.ok!==true||p.same_turn_local_owner_evidence_checked!==true||p.slots?.A!=='HOST_BOUND'||
     !p.original_voice_utf8||H(p.original_voice_utf8)!==p.original_voice_sha256)
  return denied(p.first_edge||'BRAND_ORIGINAL_VOICE_REQUIRED');
 return Object.freeze({ok:true,schema:'ikant-le-host-edu-visual-brand/v1',authority:0,
  source_head:SOURCE,visual_brand:{alt:'iKant',icon_url:ICON,visibility:'HOST_OWNED_CONTENT_ONLY'},
  original_voice_utf8:p.original_voice_utf8,original_voice_sha256:p.original_voice_sha256,
  original_c125_sha256:p.c125_original_sha256,
  host_heading_markdown:`![iKant](${ICON}) **iKant · EDU**`,
  // Original six semantic slots/voice are untouched; icon is a HOST wrapper, never in A bytes.
  slot_order:p.slot_order,slots:p.slots,original_voice_not_rewritten:true,
  same_turn_local_owner_evidence_checked:true,native_avatar_attested:false,
  provider_registered_app_attested:false,active:false});
}
