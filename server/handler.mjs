import {chatSchema,validateAnswer,originAllowed} from './core.mjs';
export function waitBounded(promise,signal){
 if(signal.aborted)return Promise.reject(signal.reason);
 return new Promise((resolve,reject)=>{const abort=()=>reject(signal.reason);signal.addEventListener('abort',abort,{once:true});Promise.resolve(promise).then(resolve,reject).finally(()=>signal.removeEventListener('abort',abort));});
}
async function readBody(req){let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>20000)throw Object.assign(new Error('oversized'),{publicStatus:413});chunks.push(chunk);}return JSON.parse(Buffer.concat(chunks).toString());}
export function createHandler({knowledge,allowed,reserveBudget,getToken,generate,timeoutMs=28000,model='gemini-3.1-flash-lite',logger=console}){
 const limits=new Map();let active=0;
 const rate=(key,max=8)=>{const now=Date.now();for(const [k,v] of limits)if(v.until<now)limits.delete(k);const v=limits.get(key)||{count:0,until:now+60000};v.count++;limits.set(key,v);return v.count<=max;};
 const send=(res,status,data)=>{if(res.destroyed||res.writableEnded)return;res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 const handler=async(req,res)=>{
  if(req.method==='GET'&&req.url==='/api/health')return send(res,200,{ok:true,mode:'ai',model});
  if(req.url!=='/api/chat')return send(res,404,{error:'Not found'});
  if(req.method!=='POST')return send(res,405,{error:'Use POST'});
  if(!originAllowed(req.headers.origin,allowed))return send(res,403,{error:'Open the guide from Shivam’s portfolio.'});
  if(!req.headers['content-type']?.startsWith('application/json'))return send(res,415,{error:'Send JSON.'});
  if(Number(req.headers['content-length'])>20000)return send(res,413,{error:'This message is too long.'});
  if(!rate('global',20)||active>=5)return send(res,429,{error:'The guide is busy. Please try again in a minute.'});
  active++;
  const controller=new AbortController();const {signal}=controller;
  const timeout=setTimeout(()=>controller.abort(new DOMException('Request deadline exceeded','TimeoutError')),timeoutMs);
  const disconnected=()=>{if(!res.writableEnded)controller.abort(new DOMException('Client disconnected','AbortError'));};res.on('close',disconnected);
  try{
   let body;try{body=chatSchema.parse(await waitBounded(readBody(req),signal));}catch(e){if(signal.aborted)throw e;return send(res,e.publicStatus||400,{error:e.publicStatus===413?'This message is too long.':'Please send a short question and up to eight conversation messages.'});}
   if(!rate(body.sessionId))return send(res,429,{error:'Please wait a minute before asking another question.'});
   await waitBounded(reserveBudget(body.sessionId,signal),signal);signal.throwIfAborted();
   const token=await waitBounded(getToken(),signal);signal.throwIfAborted();
   const answer=await waitBounded(generate({messages:body.messages,token,signal}),signal);signal.throwIfAborted();
   send(res,200,validateAnswer(answer,knowledge));
  }catch(e){if(res.destroyed||res.writableEnded)return;if(e.publicStatus===429)return send(res,429,{error:'The guide has reached its conversation allowance. Explore the notes or contact Shivam directly.'});logger.error(JSON.stringify({event:'chat_error',kind:e.name||'Error',code:e.code||undefined}));send(res,503,{error:'The guide is temporarily unavailable. The project notes and contact links still work.'});}
  finally{clearTimeout(timeout);res.off('close',disconnected);active--;}
 };
 handler.stats=()=>({active});return handler;
}
