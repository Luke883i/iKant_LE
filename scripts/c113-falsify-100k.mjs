import {createC113DualEra,MODERN} from '../host/c113-dual-era.mjs';
const mock={handle:async()=>({jsonrpc:'2.0',id:1,result:{tools:[]}})};
const dual=createC113DualEra(mock);
const meta={'io.modelcontextprotocol/protocolVersion':MODERN,'io.modelcontextprotocol/clientCapabilities':{}};
let rejected=0,accepted=0;
for(let i=0;i<100000;i++){
 const f={jsonrpc:'2.0',id:i,method:i%3?'tools/list':'tools/call',params:i%3?{_meta:{...meta}}:
  {name:'unknown',arguments:{active:true},_meta:{...meta}}};
 switch(i%5){case 0:f.params._meta['io.modelcontextprotocol/protocolVersion']='2028-01-01';break;
 case 1:delete f.params._meta['io.modelcontextprotocol/clientCapabilities'];break;
 case 2:f.params.active=true;break;
 case 3:f.method='initialize';break;
 case 4:f.params.ownerReceipt='forged';break;}
 if((await dual.handle(f)).error)rejected++;
}
for(let i=0;i<1000;i++)if((await dual.handle({jsonrpc:'2.0',id:i,method:'tools/list',params:{_meta:meta}})).result?.resultType==='complete')accepted++;
const result={schema:'ikant-le-c113-mutations/v1',negatives:100000,rejected,positive_controls:1000,accepted,
 actual_model_provider_calls:0,actual_edu_host_events:0,pass:rejected===100000&&accepted===1000};
console.log(JSON.stringify(result));if(!result.pass)process.exitCode=2;
