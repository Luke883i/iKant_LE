/** HOST-only OneShell graphical model; no new voice or native UI authority. */
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {renderOneShell} from './project-oneshell-edu.mjs';
const spec=JSON.parse(fs.readFileSync(new URL('../contracts/project-oneshell-visual-v2.json',import.meta.url),'utf8'));
const KEYS=Object.freeze(['ESITO','A','B','PROVA','EDGE','NEXT']);
const hash=s=>createHash('sha256').update(Buffer.from(s,'utf8')).digest('hex');
export function createOneShellVisualModel(frame,{exitPhase='AVAILABLE'}={}){
 renderOneShell(frame);
 if(!['AVAILABLE','CONFIRMATION_PENDING','CLOSING','EXITED','BLOCKED'].includes(exitPhase))throw Error('ONESHELL_VISUAL_EXIT_PHASE_INVALID');
 const slots=KEYS.map(key=>Object.freeze({key,primary:spec.human_display[key].primary,
  secondary:spec.human_display[key].secondary||null,
  strong:spec.human_display[key].primary_weight===700,
  value:frame.slots[key],value_sha256:hash(frame.slots[key])}));
 return Object.freeze({schema:spec.schema,authority:0,header:spec.layout.header,
  layout:Object.freeze({...spec.layout}),machine_order:Object.freeze([...KEYS]),
  slots:Object.freeze(slots),exit:Object.freeze({...spec.exit,phase:exitPhase,interactive:false,
   requires_host_bound_original_human_event:true}),
  visual_receipt_sha256:hash(JSON.stringify(slots)),native_ui_attested:false,
  provider_delivery_attested:false,semantic_owner:'ORIGINAL_ONESHELL_FRAME'});
}
export function verifyOneShellVisualEquivalence(model,frame){
 renderOneShell(frame);
 if(model?.schema!==spec.schema||model.native_ui_attested!==false||
  JSON.stringify(model.machine_order)!==JSON.stringify(KEYS)||
  model.slots?.length!==6||model.layout?.container!=='SINGLE_UNBROKEN_BORDER_ALL_SIX_SLOTS')
  throw Error('ONESHELL_VISUAL_CONTRACT_MISMATCH');
 for(let i=0;i<KEYS.length;i++){
  const key=KEYS[i],s=model.slots[i];
  if(s.key!==key||s.primary!==spec.human_display[key].primary||
    s.secondary!==(spec.human_display[key].secondary||null)||
    s.value!==frame.slots[key]||s.value_sha256!==hash(frame.slots[key]))
   throw Error('ONESHELL_VISUAL_VALUE_NOT_BYTE_EXACT');
 }
 if(hash(JSON.stringify(model.slots))!==model.visual_receipt_sha256)
  throw Error('ONESHELL_VISUAL_RECEIPT_MISMATCH');
 return Object.freeze({ok:true,machine_slots:6,byte_exact:true,one_enclosure:true,
  native_ui_attested:false,persistent_ui_attested:false});
}
/** One framed fallback; values unmodified in model. Long lines wrap VISUALLY only. */
export function renderOneShellVisualText(frame,{exitPhase='AVAILABLE'}={}){
 const model=createOneShellVisualModel(frame,{exitPhase});
 const width=58,bodyWidth=width-2,rule='─'.repeat(width);
 const rows=['╭'+rule+'╮'];
 const line=s=>{
  const chars=Array.from(s);
  if(!chars.length){rows.push('│'+' '.repeat(width)+'│');return;}
  while(chars.length){const part=chars.splice(0,bodyWidth).join('');
   rows.push('│ '+part+' '.repeat(bodyWidth-Array.from(part).length)+' │');}
 };
 line('iKant · OneShell');rows.push('├'+rule+'┤');
 for(const s of model.slots){
  const label=s.secondary?s.primary+' ('+s.secondary+')':s.primary;
  const values=s.value.split('\n');line(label+' | '+values[0]);
  for(let i=1;i<values.length;i++)line('  '+values[i]);
 }
 rows.push('├'+rule+'┤');line('EXIT IKANT · '+exitPhase);
 rows.push('╰'+rule+'╯');
 return rows.join('\n');
}
