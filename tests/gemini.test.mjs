import test from 'node:test';
import assert from 'node:assert/strict';
import { createGeminiGenerator, DEFAULT_MODEL } from '../server/gemini.mjs';
test('Gemini sends server-side header auth, grounding and conversation, and ignores thought parts', async () => {
 const signal = new AbortController().signal;
 const generate = createGeminiGenerator({apiKey:'test-secret',knowledge:[],fetchImpl:async(url, init)=>{
 assert.ok(url.includes(DEFAULT_MODEL)); assert.ok(!url.includes('test-secret'));
 assert.equal(init.headers['x-goog-api-key'],'test-secret'); assert.equal(init.signal,signal);
 const body=JSON.parse(init.body); assert.equal(body.contents[1].role,'model'); assert.ok(body.systemInstruction.parts[0].text.includes('Shivam'));
 return {ok:true,json:async()=>({candidates:[{finishReason:'STOP',content:{parts:[{thought:true,text:'private'},{text:'{"answer":"Hello","sourceIds":[]}'}]}}]})};
 }});
 assert.deepEqual(await generate({messages:[{role:'user',content:'Hi'},{role:'assistant',content:'Hello'}],signal}),{answer:'Hello',sourceIds:[]});
});
test('Gemini fails closed on missing credentials, blocked/truncated outputs and provider errors',async()=>{
 await assert.rejects(createGeminiGenerator({knowledge:[]})({messages:[]}),/not configured/);
 for(const finishReason of ['SAFETY','MAX_TOKENS']) await assert.rejects(createGeminiGenerator({knowledge:[],apiKey:'test',fetchImpl:async()=>({ok:true,json:async()=>({candidates:[{finishReason}]})})})({messages:[]}),/incomplete/);
 await assert.rejects(createGeminiGenerator({knowledge:[],apiKey:'test',fetchImpl:async()=>({ok:false,status:429})})({messages:[]}),e=>e.code===429);
});
