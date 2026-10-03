import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {webcrypto} from 'node:crypto';
import {createMembers,decide} from './collective.mjs';
globalThis.crypto??=webcrypto;
const source=JSON.parse(await readFile(new URL('./collective-members.json',import.meta.url)));
const members=await createMembers(source);
const oracle=JSON.parse(await readFile(new URL('./collective-native-oracle.json',import.meta.url)));

test('browser votes, weights and stable identities agree with bound native arithmetic',()=>{
  for(const fixture of oracle.fixtures){
    const actual=decide(members,fixture.candidates,fixture.baseWeights,fixture.mode),expected=fixture.expected;
    assert.equal(actual.selected,expected.selected);assert.equal(actual.status,expected.status);
    assert.equal(actual.abstentions,expected.abstentions);assert.deepEqual(actual.votes,expected.votes);
    for(let i=0;i<70;i++){
      const a=actual.ballots[i],b=expected.ballots[i];
      assert.equal(a.entityId,b.entityId);assert.equal(a.identitySha256,b.identitySha256);assert.equal(a.candidateId,b.candidateId);
      for(const key of ['ev','joy','stability','risk'])assert.ok(Math.abs(a.preferences[key]-b.preferences[key])<1e-10);
      if(b.score!==null)assert.ok(Math.abs(a.score-b.score)<1e-8);
    }
  }
});
test('identity stays unchanged across a different decision; inputs remain intact',()=>{
  const before=JSON.stringify(members),a=decide(members,oracle.fixtures[0].candidates),b=decide(members,[]);
  assert.deepEqual(a.ballots.map(row=>row.identitySha256),b.ballots.map(row=>row.identitySha256));
  assert.equal(JSON.stringify(members),before);assert.equal(b.abstentions,70);assert.equal(b.selected,null);
});
test('missing data and forbidden candidates do not become eligible defaults',()=>{
  const candidate={...oracle.fixtures[0].candidates[0]};delete candidate.probability;
  assert.equal(decide(members,[candidate]).abstentions,70);
  assert.equal(decide(members,[{...oracle.fixtures[0].candidates[0],allowed:false}]).abstentions,70);
  assert.throws(()=>decide(members,[{...candidate,probability:'0.5'}]));
  assert.throws(()=>decide(members,oracle.fixtures[0].candidates,{ev:0,joy:0,stability:0,risk:0}));
});
test('equal collective votes remain open instead of an invented winner',()=>{
  const variants=members.map((member,i)=>({...member,preferences:i<35?{ev:1,joy:0,risk:0,stability:0}:{ev:0,joy:1,risk:0,stability:0}}));
  const result=decide(variants,oracle.fixtures[0].candidates);
  assert.equal(result.status,'OPEN_TIE');assert.equal(result.selected,null);assert.deepEqual(result.votes.map(row=>row.votes),[35,35]);
});
test('invalid membership and candidate sets are rejected before selection',async()=>{
  await assert.rejects(()=>createMembers({...source,members:source.members.slice(1)}));
  await assert.rejects(()=>createMembers({...source,members:source.members.map((row,i)=>i===1?source.members[0]:row)}));
  assert.throws(()=>decide(members,[oracle.fixtures[0].candidates[0],oracle.fixtures[0].candidates[0]]));
  assert.throws(()=>decide(members,[{...oracle.fixtures[0].candidates[0],probability:1.01}]));
  assert.throws(()=>decide(members,[{...oracle.fixtures[0].candidates[0],joy:NaN}]));
});
