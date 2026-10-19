import {createServer} from 'node:http';
import {AsyncLocalStorage} from 'node:async_hooks';
import {spawn} from 'node:child_process';
import {dirname,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {registerAppResource,registerAppTool,RESOURCE_MIME_TYPE} from '@modelcontextprotocol/ext-apps/server';
import {McpServer} from '@modelcontextprotocol/sdk/server/mcp.js';
import {StreamableHTTPServerTransport} from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {z} from 'zod';
import {validateHostConsumptionFrame} from '../../../src/host-consumption-frame.mjs';
import {projectP1AppExclusiveShell} from '../../../host/p1-app-exclusive-shell.mjs';
import {projectOneShellThreadSnapshot} from '../../../host/oneshell-thread-session.mjs';
import {assessP0ThreadPanelReadiness} from '../../../host/p0-thread-panel-readiness.mjs';
import {verifyS06Transport} from './transport-security.mjs';
import {verifyS06GatewayProof} from './gateway-identity.mjs';
const gatewayContext=new AsyncLocalStorage();
import {ensureSessionChatDeployment} from '../../../src/session-chat-deployment.mjs';
const here=dirname(fileURLToPath(import.meta.url)),repoRoot=resolve(process.env.IKANT_LE_REPO_ROOT||resolve(here,'../../..')),deploymentRoot=resolve(process.env.IKANT_LE_DEPLOYMENT_ROOT||resolve(repoRoot,'.ikant-le-deployed')),cli=resolve(repoRoot,'scripts/session-chat-runtime-cli.mjs'),widget=readFileSync(resolve(here,'public/ikant-le-app.html'),'utf8'),URI='ui://ikant-le/session-chat/v1.html';
ensureSessionChatDeployment({workspace:repoRoot,deploymentRoot});
function session(ctx={}){const id=String(ctx?._meta?.['openai/session']||'');if(!id)throw new Error('ChatGPT session metadata unavailable');const signed=gatewayContext.getStore();if(!signed||signed.session!==id)throw new Error('S06_GATEWAY_SESSION_BINDING_DENIED');return id;}
function runtime(op,payload){return new Promise((ok,bad)=>{const child=spawn(process.execPath,[cli,op],{cwd:repoRoot,env:{...process.env,IKANT_LE_REPO_ROOT:repoRoot},stdio:['pipe','pipe','pipe']});let out='',err='';child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');child.stdout.on('data',x=>{out+=x;if(out.length>8*1024*1024)child.kill();});child.stderr.on('data',x=>err+=x);child.on('error',bad);child.on('close',code=>{if(code!==0)return bad(new Error(err.slice(-4000)||'runtime bridge failed'));try{ok(JSON.parse(out));}catch(e){bad(e);}});child.stdin.end(JSON.stringify(payload));});}
function digest(b){return createHash('sha256').update(b).digest('hex');}
function appPayload(x){
 const frame=x?.host_frame||null,rawByName=new Map((x?.artifacts||[]).map(a=>[a?.name||a?.filename,a])),artifacts=[];
 for(const fa of frame?.artifacts||[]){const a=rawByName.get(fa.name),p=resolve(String(a?.path||a?.local_path||''));let valid=false,b=null;if(p&&(p===deploymentRoot||p.startsWith(deploymentRoot+sep))&&existsSync(p)){b=readFileSync(p);valid=b.length<=4*1024*1024&&digest(b)===fa.sha256&&b.length===fa.bytes&&fa.readback_verified===true;}if(!valid){if(fa.required_presentation===true)throw new Error('required host artifact bytes unavailable:'+fa.name);continue;}artifacts.push({name:fa.name,media_type:fa.media_type,bytes:b.length,sha256:fa.sha256,required_presentation:fa.required_presentation===true,data_base64:b.toString('base64')});}
 const shell=frame?.shell||null;const material={schema:'ikant-le-host-app-payload/v1',frame_receipt_sha256:frame?.receipt_sha256||null,shell_sha256:shell?.sha256||null,artifacts:artifacts.map(a=>({name:a.name,bytes:a.bytes,sha256:a.sha256,required_presentation:a.required_presentation})),authority:0};return{...material,artifacts,transport_receipt_sha256:digest(Buffer.from(JSON.stringify(material)))};
}
const presentationFrames=new Map(); // session-local transport view only; never a ledger.
function presentationSequence(sessionId,receipt){
 if(presentationFrames.size>512)throw Error('THREAD_VIEW_HOST_CAPACITY_RECONCILE');
 const prev=presentationFrames.get(sessionId);
 if(prev?.receipt===receipt)return prev.sequence;
 const sequence=prev?prev.sequence+1:0;presentationFrames.set(sessionId,{receipt,sequence});return sequence;
}
function result(x,ctx){const boundSession=session(ctx);const fv=validateHostConsumptionFrame(x?.host_frame);if(!fv.ok)throw new Error('invalid host consumption frame:'+fv.errors.join(','));const thread=projectOneShellThreadSnapshot({result:x,frame:x.host_frame,sessionRef:boundSession,presentationSequence:presentationSequence(boundSession,x.host_frame.receipt_sha256)});const enriched={...x,host_app_payload:appPayload(x),one_shell:projectP1AppExclusiveShell({result:x,frame:x.host_frame}),one_shell_thread:thread,thread_panel_readiness:assessP0ThreadPanelReadiness({panelRequested:threadPanelRequested,sessionBound:true,snapshotOk:thread.ok===true})};return{content:[],structuredContent:{state:x.state||'READY'},_meta:{ikant_le:enriched}};}
// Opt-in thread panel requires a real installed plugin and native browser qualification.
const threadPanelRequested=process.env.IKANT_ONESHELL_THREAD_PANEL==='1';
function appMeta(resource=false){return resource?{ui:{resourceUri:URI,visibility:['app']},'openai/widgetAccessible':true}:{ui:{visibility:['app']},'openai/widgetAccessible':true};}
function createMcp(){const s=new McpServer({name:'ikant-le-session-chat',version:'0.1.0'});
 registerAppResource(s,'ikant-le',URI,{},async()=>({contents:[{uri:URI,mimeType:RESOURCE_MIME_TYPE,text:widget,_meta:{ui:{prefersBorder:true},'openai/widgetDescription':'Legacy deployed compatibility surface; not canonical SESSION_CHAT_LOCAL activation'}}]}));
 registerAppTool(s,'ikant_le_open',{title:'Open iKant_LE',description:'Legacy deployed compatibility open binding; not canonical SESSION_CHAT_LOCAL activation. Use only for a dedicated explicit user request to initialize, open, start, or activate iKant_LE; never for audits, questions, repository analysis, quoted or negated examples, or mixed tasks. Deployment is validated before this server is exposed; this call does not accept Terms.',inputSchema:{},outputSchema:{state:z.string()},annotations:{readOnlyHint:true,destructiveHint:false,openWorldHint:false},_meta:{ui:{resourceUri:URI,visibility:['model','app']},...(threadPanelRequested?{'openai/ui':{entrypoints:[{type:'thread'}]}}:{})}},async(_a,ctx)=>result(await runtime('open',{session_id:session(ctx)}),ctx));
 registerAppTool(s,'ikant_le_exit',{title:'Exit iKant_LE',description:'Legacy deployed compatibility exit binding. Use only for a dedicated explicit user request to close, exit, stop, release, or deactivate an ACTIVE iKant_LE session; never for audits, questions, examples, negated requests, mixed tasks, acceptance, or substantive turns.',inputSchema:{},outputSchema:{state:z.string()},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false},_meta:{ui:{resourceUri:URI,visibility:['model','app']}}},async(_a,ctx)=>result(await runtime('turn',{session_id:session(ctx),input:'EXIT IKANT'}),ctx));
 registerAppTool(s,'ikant_le_accept',{title:'Accept iKant_LE Terms',description:'App-only exact human acceptance.',inputSchema:{human_input:z.string()},outputSchema:{state:z.string()},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false},_meta:appMeta(true)},async(a,ctx)=>result(await runtime('accept',{session_id:session(ctx),human_input:a.human_input}),ctx));
 registerAppTool(s,'ikant_le_turn',{title:'Run iKant_LE turn',description:'App-only legacy deployed ACTIVE compatibility turn; never canonical SESSION_CHAT_LOCAL.',inputSchema:{input:z.string().min(1)},outputSchema:{state:z.string()},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false},_meta:appMeta(true)},async(a,ctx)=>result(await runtime('turn',{session_id:session(ctx),input:a.input}),ctx));
 registerAppTool(s,'ikant_le_accept_limited',{title:'Accept iKant_LE runtime-limited Terms',description:'App-only exact human acceptance for the non-ACTIVE runtime-bound service tier.',inputSchema:{human_input:z.string()},outputSchema:{state:z.string()},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:false},_meta:appMeta(true)},async(a,ctx)=>result(await runtime('accept-limited',{session_id:session(ctx),human_input:a.human_input}),ctx));
 registerAppTool(s,'ikant_le_limited_turn',{title:'Run iKant_LE runtime-limited turn',description:'App-only RUNTIME_BOUND_LIMITED turn. Non-ACTIVE. Produces runtime-sealed output plus atomic DOCX telemetry/backlog artifact.',inputSchema:{input:z.string().min(1),candidate:z.string().min(1)},outputSchema:{state:z.string()},annotations:{readOnlyHint:false,destructiveHint:false,openWorldHint:false,idempotentHint:true},_meta:appMeta(true)},async(a,ctx)=>result(await runtime('limited-turn',{session_id:session(ctx),input:a.input,candidate:a.candidate}),ctx));
 return s;
}
const port=Number(process.env.PORT||8788),MCP='/mcp';
const allowedOrigin=process.env.IKANT_MCP_ALLOWED_ORIGIN||null;
const authSecret=process.env.IKANT_MCP_AUTH_TOKEN||null;
const gatewaySecret=process.env.IKANT_MCP_GATEWAY_SECRET||null;
const gatewayNonceDirectory=process.env.IKANT_MCP_NONCE_DIRECTORY||null;
const http=createServer(async(req,res)=>{const u=new URL(req.url||'/','http://'+(req.headers.host||'localhost'));if(req.method==='OPTIONS'&&u.pathname===MCP){if(!allowedOrigin||req.headers.origin!==allowedOrigin){res.writeHead(403).end('Forbidden');return;}res.writeHead(204,{'Access-Control-Allow-Origin':allowedOrigin,'Vary':'Origin','Access-Control-Allow-Methods':'POST, GET, DELETE, OPTIONS','Access-Control-Allow-Headers':'content-type, mcp-session-id, authorization, x-ikant-gateway-proof','Access-Control-Expose-Headers':'Mcp-Session-Id'});res.end();return;}if(req.method==='GET'&&u.pathname==='/'){res.writeHead(200,{'content-type':'application/json'}).end(JSON.stringify({service:'ikant-le-session-chat',mcp:MCP}));return;}if(u.pathname===MCP&&['POST','GET','DELETE'].includes(req.method||'')){const auth=verifyS06Transport({authorization:req.headers.authorization||null,origin:req.headers.origin||null,secret:authSecret,allowedOrigin});if(!auth.ok){res.writeHead(403,{'Cache-Control':'no-store'}).end('Forbidden');return;}const gateway=verifyS06GatewayProof({proof:req.headers['x-ikant-gateway-proof']||null,secret:gatewaySecret,method:req.method,path:u.pathname,nonceDirectory:gatewayNonceDirectory});if(!gateway.ok){res.writeHead(403,{'Cache-Control':'no-store'}).end('Forbidden');return;}if(req.headers.origin)res.setHeader('Access-Control-Allow-Origin',allowedOrigin);res.setHeader('Vary','Origin');res.setHeader('Access-Control-Expose-Headers','Mcp-Session-Id');const s=createMcp(),t=new StreamableHTTPServerTransport({sessionIdGenerator:undefined,enableJsonResponse:true});res.on('close',()=>{t.close();s.close();});try{await gatewayContext.run(gateway,async()=>{await s.connect(t);await t.handleRequest(req,res);});}catch(e){if(!res.headersSent)res.writeHead(500).end(String(e));}return;}res.writeHead(404).end('Not Found');});
http.listen(port,()=>console.log('iKant_LE MCP server listening on http://localhost:'+port+MCP));
