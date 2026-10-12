#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {createC112McpEdge} from '../host/c112-mcp-edge.mjs';
import {createC113DualEra} from '../host/c113-dual-era.mjs';
import {createC113HttpServer} from '../host/c113-http.mjs';
import {createC111HostEdge} from '../host/c111-host-edge.mjs';
import {inspectC92C107LanguageConfig,makeC92C107LanguagePort} from '../host/c92-live-provider.mjs';
const args=process.argv.slice(2),options={};
for(let i=0;i<args.length;i++){
 const k=args[i];if(!['--head','--data','--transport','--port','--allow-synthetic'].includes(k)||Object.hasOwn(options,k))throw Error('C113_UNSAFE_ARG');
 options[k]=k==='--allow-synthetic'?true:args[++i];
}
if(!/^[a-f0-9]{40}$/.test(options['--head']||'')||!path.isAbsolute(options['--data']||'')||
 !['stdio','http'].includes(options['--transport'])||
 (options['--transport']==='http'&&(!/^[0-9]{1,5}$/.test(options['--port']||'')||Number(options['--port'])<1||Number(options['--port'])>65535)))
 throw Error('C113_EXACT_SOURCE_STORAGE_TRANSPORT_REQUIRED');
fs.mkdirSync(options['--data'],{recursive:true,mode:0o700});
const config=inspectC92C107LanguageConfig(process.env);
const edge=createC112McpEdge({sourceHead:options['--head'],privateRoot:options['--data'],makeEdge:createC111HostEdge,
 languagePort:config.configured?makeC92C107LanguagePort(process.env):undefined,
 allowSynthetic:options['--allow-synthetic']===true});
if(options['--transport']==='stdio'){
 const dual=createC113DualEra(edge);
 for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity,terminal:false})){
  try{
   if(Buffer.byteLength(line)>32000)throw Error('OVERSIZE');
   const result=await dual.handle(JSON.parse(line),{transport:'stdio'});
   if(result!==null)process.stdout.write(JSON.stringify(result)+'\n');
  }catch{process.stdout.write(JSON.stringify({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Invalid JSON'}})+'\n');}
 }
 await edge.closeAll();
}else{
 const server=createC113HttpServer(edge,{token:process.env.IKANT_C113_HTTP_TOKEN});
 server.listen(Number(options['--port']),'127.0.0.1',()=>process.stderr.write('C113_LOOPBACK_READY\n'));
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>server.close(async()=>{await edge.closeAll();process.exit(0);}));
}
