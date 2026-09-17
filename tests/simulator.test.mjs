import test from 'node:test';import assert from 'node:assert/strict';import {spawnSync} from 'node:child_process';
import {runExperiment,exportPython} from '../shared/simulator.mjs';
for(const fault of ['lost_ack','unavailable','invalid_output'])for(const policy of ['stop','retry','verified'])test(`${fault}/${policy}: real tool effects and Python parity`,()=>{
 const config={fault,policy},result=runExperiment(config);const py=spawnSync('python3',['-c',exportPython(config)],{encoding:'utf8'});assert.equal(py.status,0,py.stderr);
 const out=py.stdout.split('\n')[0].replaceAll("'",'"').replaceAll('True','true').replaceAll('False','false');assert.deepEqual(JSON.parse(out),{calls:result.calls,shipments:result.shipments,verified:result.verified});
 if(policy==='verified'){assert.equal(result.shipments,1);assert.equal(result.verified,true);assert.equal(result.success,true);}
 if(fault==='lost_ack'&&policy==='retry'){assert.equal(result.shipments,2);assert.equal(result.success,false);}
 if(fault==='unavailable'&&policy==='stop'){assert.equal(result.shipments,0);assert.equal(result.success,false);}
});
test('rejects unknown config before generating runnable code',()=>{assert.throws(()=>runExperiment({policy:'bad'}));assert.throws(()=>exportPython({fault:'unknown'}));});
