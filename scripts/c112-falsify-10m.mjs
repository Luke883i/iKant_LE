import {checkC112Frame} from '../host/c112-mcp-edge.mjs';
// Ten million calls through the production frame predicate. NOT LLM calls or C70 executions.
const good=()=>({jsonrpc:'2.0',id:42,method:'tools/call',params:{name:'ikant_turn',arguments:{session:'a'.repeat(32),text:'Domanda ordinaria'}}});
const bads=[
  x=>{x.jsonrpc='1.0'},x=>{x.id={bad:true}},x=>{x.method='run/javascript'},
  x=>{x.params.name='exec'},x=>{x.params.arguments.session='SHORT'},
  x=>{x.params.arguments.session='g'.repeat(32)},x=>{x.params.arguments.text=''},
  x=>{x.params.arguments.text=' '.repeat(601)},x=>{x.params.arguments.elevated=true},
  x=>{x.params.arguments.candidate={text:'Hi',input_sha256:'f'.repeat(64)}},
  x=>{x.params.arguments.draft=''},x=>{x.params.arguments.candidate={text:'ok',input_sha256:'a'.repeat(64),active:true}},
  x=>{x.params.arguments.session=23},x=>{delete x.params},
  x=>{x.params.arguments.text='a'.repeat(1000)},x=>{x.params.name='ikant_start'},
  x=>{x.params.arguments.candidate={text:'ok'}},x=>{x.params.arguments.draft=23},
  x=>{x.params.arguments.candidate=[]},x=>{x.params.arguments.text=null},
  x=>{x.params.arguments.session=null},x=>{x.params.arguments.operator='owner'},
  x=>{x.params.arguments.candidate={input_sha256:null,text:'ok'}},
  x=>{x.params.arguments.sourceHead='a'.repeat(40)},x=>{x.method='tools/forged'}
];
const campaigns=[];let total=0,unexpected=0;
for(let c=0;c<10;c++){
 let rejected=0,accepted=0;
 for(let i=0;i<1_000_000;i++){
  const x=good(),m=(c*7+i*13)%bads.length;bads[m](x);
  if(checkC112Frame(x)!=='')rejected++;else accepted++;
 }
 campaigns.push({index:c+1,cases:1_000_000,rejected,unexpected_accepted:accepted});
 total+=rejected;unexpected+=accepted;
}
let goodAccepted=0;
for(let i=0;i<10000;i++)if(checkC112Frame(good())==='')goodAccepted++;
const report={schema:'ikant-le-c112-falsification/v1',campaigns,negative_cases:10_000_000,
 negative_rejected:total,unexpected_acceptance:unexpected,positive_controls:10000,
 positive_accepted:goodAccepted,mutation_families:bads.length,
 real_c70_executions_in_campaign:0,real_chatgpt_events:0,
 qualified:unexpected===0&&total===10_000_000&&goodAccepted===10000};
console.log(JSON.stringify(report));if(!report.qualified)process.exitCode=2;
