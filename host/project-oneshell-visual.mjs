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

/** Self-contained rich HOST markup. No script/action dispatch or native UI claim. */
export function renderOneShellVisualHtml(frame,{exitPhase='AVAILABLE'}={}){
 const m=createOneShellVisualModel(frame,{exitPhase});
 const esc=x=>x.replaceAll('&','&amp;').replaceAll('<','&lt;')
  .replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');
 const css='.ikant-oneshell{box-sizing:border-box;border:1px solid #d7d7dc;border-radius:16px;padding:12px;font-family:system-ui,sans-serif;color:inherit;max-width:100%}'
  +'.ikant-oneshell *{box-sizing:border-box}.ikant-head{display:flex;align-items:center;justify-content:space-between;gap:12px}'
  +'.ikant-head strong{font-size:16px}.ikant-exit{border:1px solid rgba(194,37,46,.24);border-radius:8px;background:rgba(194,37,46,.10);color:#a0232b;font-size:12px;padding:7px 10px;font-weight:600}'
  +'.ikant-row{display:grid;grid-template-columns:112px minmax(0,1fr);gap:12px;padding:7px 0;align-items:start}'
  +'.ikant-name{font-size:12px;color:#686975}.ikant-name strong{font-size:16px;display:block;font-weight:700}'
  +'.ikant-name small{display:block;font-size:11px}.ikant-value{min-width:0;white-space:pre-wrap;overflow-wrap:anywhere;font-size:14px}'
  +'.ikant-divider{border:0;border-top:1px solid #e6e6eb;margin:9px 0}'
  +'@media(max-width:480px){.ikant-row{grid-template-columns:minmax(0,1fr);gap:3px}.ikant-head{flex-wrap:wrap}}';
 const rows=m.slots.map(s=>'<div class="ikant-row" data-slot="'+esc(s.key)+'"><div class="ikant-name">'
  +(s.strong?'<strong>'+esc(s.primary)+'</strong>':esc(s.primary))
  +(s.secondary?'<small>'+esc(s.secondary)+'</small>':'')
  +'</div><div class="ikant-value">'+esc(s.value)+'</div></div>');
 return '<style>'+css+'</style><section class="ikant-oneshell" aria-label="iKant OneShell" data-authority="0">'
  +'<header class="ikant-head"><strong>iKant · OneShell</strong>'
  +'<span class="ikant-exit" aria-label="EXIT IKANT, comando non collegato">EXIT IKANT</span></header>'
  +'<hr class="ikant-divider">'+rows.slice(0,3).join('')
  +'<hr class="ikant-divider">'+rows.slice(3).join('')+'</section>';
}
