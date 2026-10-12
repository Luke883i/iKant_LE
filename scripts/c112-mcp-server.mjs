#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import {createC112McpEdge} from '../host/c112-mcp-edge.mjs';
import {dispatchC112Line,createC112HttpServer} from '../host/c112-transports.mjs';
import {createC111HostEdge} from '../host/c111-host-edge.mjs';
import {inspectC92C107LanguageConfig,makeC92C107LanguagePort} from '../host/c92-live-provider.mjs';
// This process is the physical trusted host adapter. The Project prompt cannot run it.
const argv=process.argv.slice(2),opts={};
for(let i=0;i<argv.length;i++){const x=argv[i];if(!['--head','--data','--transport','--port','--allow-synthetic'].includes(x))throw Error('UNKNOWN_ARG');if(x==='--allow-synthetic'){opts[x]=true;continue;}opts[x]=argv[++i];}
if(!/^[a-f0-9]{40}$/.test(opts['--head']||'')||!path.isAbsolute(opts['--data']||'')||
 !['stdio','http'].includes(opts['--transport'])||
 (opts['--transport']==='http'&&(!/^[0-9]{1,5}$/.test(opts['--port']||'')||Number(opts['--port'])<1||Number(opts['--port'])>65535)))
 throw Error('PINNED_HEAD_ABSOLUTE_STORAGE_AND_EXPLICIT_TRANSPORT_REQUIRED');
fs.mkdirSync(opts['--data'],{recursive:true,mode:0o700});
const config=inspectC92C107LanguageConfig(process.env);
const edge=createC112McpEdge({sourceHead:opts['--head'],privateRoot:opts['--data'],
 makeEdge:createC111HostEdge,allowSynthetic:!!opts['--allow-synthetic'],
 languagePort:config.configured?makeC92C107LanguagePort(process.env):undefined});
if(opts['--transport']==='stdio'){
 for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity,terminal:false})){
  const answer=await dispatchC112Line(edge,line);
  if(answer!==null)process.stdout.write(JSON.stringify(answer)+'\n');
 }
 await edge.closeAll();
}else{
 const server=createC112HttpServer(edge,{token:process.env.IKANT_C112_HTTP_TOKEN,
  port:Number(opts['--port'])});
 server.listen(Number(opts['--port']),'127.0.0.1',()=>{
  process.stderr.write('C112_HTTP_LOOPBACK_READY '+opts['--port']+'\n');
 });
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>{
  server.close(async()=>{await edge.closeAll();process.exit(0);});
 });
}
