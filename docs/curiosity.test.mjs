import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createCuriosity, evaluateActivity } from './curiosity.mjs';
test('69 distinct figures notice, approach and discover without mutating inputs',()=>{
  const ids=Array.from({length:69},(_,i)=>`figure-${i}`);
  const positions=new Map(ids.map((id,i)=>[id,[12+i%8,0,5]]));
  const before=JSON.stringify([...positions]);const c=createCuriosity(ids);
  let poses;for(let t=0;t<=30;t+=.25)poses=c.step(t,positions);
  assert.equal([...poses.values()].filter(v=>v.discovered).length,69);
  c.step(100,positions);assert.equal(c.events.length,345);c.step(101,positions);assert.equal(c.events.length,345);
  assert.equal(JSON.stringify([...positions]),before);
  const leaked=c.events;leaked[0].kind='BAD';assert.equal(c.events[0].kind,'NOTICED');
});
test('out-of-range figure keeps its location',()=>{
  const c=createCuriosity(['scarlet']);const p=[100,0,0];
  assert.deepEqual(c.step(0,new Map([['scarlet',p]])).get('scarlet'),{position:p,phase:'ROAMING',discovered:false,walking:false});
  assert.equal(c.events.length,0);
});
test('invalid and reversed clocks rejected before a state update',()=>{
  const c=createCuriosity(['scarlet']);const p=new Map([['scarlet',[10,0,0]]]);
  c.step(1,p);assert.throws(()=>c.step(0,p));assert.throws(()=>c.step(NaN,p));
  assert.throws(()=>c.step(2,new Map()));assert.throws(()=>c.step(2,p,[NaN,0,0]));
  assert.throws(()=>createCuriosity(['a','a']));assert.throws(()=>createCuriosity(['a'],{speed:0}));
});
test('all figures leave and keep exploring',()=>{
  const ids=Array.from({length:69},(_,i)=>`figure-${i}`), c=createCuriosity(ids);
  const p=new Map(ids.map((id,i)=>[id,[12+i%8,0,5]]));
  for(let t=0;t<=90;t+=.25)c.step(t,p);const a=c.step(100,p), b=c.step(105,p);
  for(const id of ids){assert.equal(a.get(id).phase,'EXPLORING');assert.equal(a.get(id).discovered,true);assert.notDeepEqual(a.get(id).position,b.get(id).position);}
});
test('a room question is input, not a forced action',()=>{
  const p=new Map([['scarlet',[12,0,0]]]), a=createCuriosity(['scarlet']), b=createCuriosity(['scarlet']);
  a.step(0,p);b.step(0,p);a.impulse(0);
  for(let t=0;t<100;t+=.25){assert.deepEqual(a.step(t,p),b.step(t,p));}
  assert.equal(a.decisions[0].trigger,'ROOM_QUESTION');
  assert.equal(a.decisions[0].action,'EXPLORE');
  assert.throws(()=>a.impulse(-1));
});
test('same time while paused preserves positions',()=>{
  const p=new Map([['scarlet',[12,0,0]]]), a=createCuriosity(['scarlet']);
  for(let t=0;t<=80;t++)a.step(t,p);
  assert.deepEqual(a.step(80,p),a.step(80,p));
});
test('individual observations produce different activity choices',()=>{
  assert.equal(evaluateActivity({discovered:false,waitingSeconds:20,nearbyCount:6}).action,'CONTINUE');
  assert.equal(evaluateActivity({discovered:true,waitingSeconds:1,nearbyCount:0}).action,'CONTINUE');
  assert.equal(evaluateActivity({discovered:true,waitingSeconds:1,nearbyCount:6}).action,'EXPLORE');
  assert.equal(evaluateActivity({discovered:true,waitingSeconds:8,nearbyCount:0}).action,'EXPLORE');
  assert.throws(()=>evaluateActivity({discovered:true,waitingSeconds:NaN,nearbyCount:0}));
});
