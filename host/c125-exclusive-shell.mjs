/** C125: host-controlled text shell only; no native UI, admission or original writer ownership. */
import {createHash} from 'node:crypto';
import {isProxy} from 'node:util/types';
const sha=b=>createHash('sha256').update(b).digest('hex');
const digest=s=>sha(Buffer.from(s,'utf8'));
const HEX64=/^[0-9a-f]{64}$/;
const ATOM=/^[A-Za-z0-9_:.\/-]{1,120}$/;
const STATES=new Set(['ADMISSION','MODE','OPTIN','TRANSPORT','PLANNING','GUARD','READBACK','OWNER_VOICE','BLOCKED','AUDIT','ERROR','PROGRESS','DOCUMENT']);
export const C125_FIXED_HEADERS=Object.freeze(['VOCE','MODE','STATO','TRACE','CONT','EDGE','NEXT','DOCX','HOST','FATTO','LETTURA','LIMITE']);
const text=s=>typeof s==='string'&&Buffer.from(s,'utf8').toString('utf8')===s;
const note=s=>text(s)&&s.length>0&&s.length<=176&&!/[\r\n\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(s)&&!s.includes('<<<')&&!s.includes('>>>');
function safeData(v,depth=0){
 if(depth>12)return false;
 if(v===null||typeof v==='string'||typeof v==='boolean')return true;
 if(typeof v==='number')return Number.isFinite(v);
 if(typeof v!=='object'||isProxy(v))return false;
 try{
  if(Array.isArray(v)){
   if(v.length>120)return false;
   const d=Object.getOwnPropertyDescriptors(v),keys=Reflect.ownKeys(d);
   if(keys.length!==v.length+1)return false;
   return keys.every(k=>k==='length'||(typeof k==='string'&&/^(?:0|[1-9][0-9]*)$/.test(k)&&Number(k)<v.length&&'value' in d[k]&&safeData(d[k].value,depth+1)));
  }
  const proto=Object.getPrototypeOf(v);if(proto!==Object.prototype&&proto!==null)return false;
  const d=Object.getOwnPropertyDescriptors(v),keys=Reflect.ownKeys(d);
  return keys.length<=180&&keys.every(k=>typeof k==='string'&&k!=='__proto__'&&k!=='constructor'&&k!=='prototype'&&'value' in d[k]&&safeData(d[k].value,depth+1));
 }catch{return false}
}
const blocked=reason=>Object.freeze({schema:'ikant-le-c125-exclusive-shell/v2',status:'REJECTED',reason,emit:null,origin:'NO_VOICE',native_ui_exclusive:false,active:false});
/** Verified only against caller-supplied exact C87 receipts; original owner provides provenance. */
export function emitC125Shell(frame){
 if(!safeData(frame)||!frame||Array.isArray(frame))return blocked('UNSAFE_FRAME');
 const {afterAccept=false,kind='BLOCKED',mode='EXPERIMENTAL',trace='NOT_SAVED',continuity='UNVERIFIED',edge='UNKNOWN',next='STOP',ownerReceipt=null,independentReadback=null,hostNotes=null,docxWitness=null,nonce=null,input_sha256=null}=frame;
 if(afterAccept!==true||!STATES.has(kind)||!['EXPERIMENTAL','CANONICAL'].includes(mode)||
   ![trace,continuity,edge,next].every(s=>typeof s==='string'&&ATOM.test(s))||docxWitness!==null)return blocked('GATE_OR_META_OR_DOCX');
 let voice='NO_VOICE',origin='NO_VOICE';
 if(kind==='OWNER_VOICE'){
  const r=ownerReceipt,w=independentReadback;
  if(mode!=='EXPERIMENTAL'||!safeData(r)||!safeData(w)||!r||!w||
    r.schema!=='ikant-edu-c70-guided/v7'||r.status!=='PR119_OWNER_C70_GUIDED_LOCAL_READBACK'||r.active!==false||
    r.surface_a?.origin!=='HOST_BOUND'||!text(r.surface_a?.voice_utf8)||!r.surface_a.voice_utf8.trim()||
    Buffer.byteLength(r.surface_a.voice_utf8,'utf8')>16000||
    /[\x00-\x1f\x7f\u202a-\u202e\u2066-\u2069]/u.test(r.surface_a.voice_utf8.replace(/\n/g,''))||
    r.surface_a.voice_utf8.includes('<<<VOICE_UTF8_')||
    !HEX64.test(trace)||r.surface_b?.TRACE_REF!==trace||r.pr119_surface_b?.TRACE_REF!==trace||
    r.surface_b?.ACTIVE!==false||r.pr119_surface_b?.C87_PROOF!=='ORIGINAL_APPEND_REOPEN'||
    r.pr119_surface_b?.C100_PROOF!=='ORIGINAL_INPUT_OUTPUT_BOUND'||
    r.pr119_surface_b?.canonical_active!==false||r.pr119_surface_b?.native_chatgpt_origin_attested!==false||
    r.pr119_surface_b?.provider_origin_attested!==false||
    r.pr119_surface_b?.original_c70_executed!==true||r.pr119_surface_b?.original_c87_writer_executed!==true||
    w.status!=='C107_LEDGER_REOPENED'||w.last_hash!==trace||w.latest_state?.host_language_used!==true||
    !HEX64.test(input_sha256||'')||!ATOM.test(nonce||'')||
    w.latest_state?.nonce!==nonce||r.pr119_surface_b?.INPUT_REF!==input_sha256||
    w.latest_state?.visible_voice_sha256!==digest(r.surface_a.voice_utf8)||
    r.pr119_surface_b?.visible_voice_sha256!==digest(r.surface_a.voice_utf8))return blocked('ORIGINAL_READBACK_NOT_QUALIFIED');
  voice=r.surface_a.voice_utf8;origin='HOST_BOUND';
 }else if(ownerReceipt!==null||independentReadback!==null)return blocked('RECEIPT_ON_NONVOICE_STATUS');
 let notes={FATTO:'—',LETTURA:'—',LIMITE:'—'};
 if(hostNotes!==null){
  if(!safeData(hostNotes)||!hostNotes||Object.keys(hostNotes).sort().join(',')!=='fact,interpretation,limit'||
     ![hostNotes.fact,hostNotes.interpretation,hostNotes.limit].every(note))return blocked('HOST_NOTES_NOT_LOSSLESS');
  notes={FATTO:hostNotes.fact,LETTURA:hostNotes.interpretation,LIMITE:hostNotes.limit};
 }
 const pre=['+------ iKant / ONE SHELL 90 ------+','VOCE | '+origin,'<<<VOICE_UTF8_START>>>',''].join('\n');
 const post=['','<<<VOICE_UTF8_END>>>',...[
  ['MODE',mode],['STATO',kind],['TRACE',trace],['CONT',continuity],['EDGE',edge],['NEXT',next],['DOCX','—']
 ].map(([k,v])=>k.padEnd(6)+'| '+v), 'HOST | NOTE (HOST, NON iKant)',
 ...['FATTO','LETTURA','LIMITE'].map(k=>k.padEnd(7)+'| '+notes[k]),'+------ END ONE SHELL ------+'].join('\n');
 const emit=pre+voice+post,full=Buffer.from(emit,'utf8'),v=Buffer.from(voice,'utf8'),at=Buffer.byteLength(pre,'utf8');
 if(!full.subarray(at,at+v.length).equals(v)||digest(full.subarray(at,at+v.length).toString('utf8'))!==digest(voice))return blocked('VOICE_BYTES_CHANGED');
 return Object.freeze({schema:'ikant-le-c125-exclusive-shell/v2',status:'ASSISTANT_TEXT_ONLY',emit,
   origin,voice_sha256:origin==='HOST_BOUND'?digest(voice):null,voice_byte_offset:at,voice_byte_length:v.length,
   headers:C125_FIXED_HEADERS,host_origin:'HOST_NOT_IKANT',docx_links:Object.freeze([]),outside_shell_characters:0,
   native_ui_exclusive:false,delivery_attested:false,original_owner_execution_attested_by_projector:false,active:false});
}
