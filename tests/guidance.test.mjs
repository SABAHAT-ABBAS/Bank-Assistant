import test from 'node:test';import assert from 'node:assert/strict';import {menu,transition} from '../engine.js';
for(const [intent,scenarios] of Object.entries({refund:['failed','merchant','duplicate','wrong'],transaction:['failed','pending','wrong','unknown'],human:['fraud','complaint','general']})){
test(intent+' guided conversations',()=>{
for(const scenario of scenarios){
let r=transition(menu().state,intent);
assert.equal(r.state.mode,intent);assert.ok(r.choices.length>=3);
r=transition(r.state,scenario);assert.equal(r.state.step,'follow-up');assert.ok(r.messages[0].length>60);
const follow=transition(r.state,'another');assert.equal(follow.state.mode,intent);assert.notEqual(follow.state.step,'follow-up');
const invalid=transition(follow.state,'nonsense');assert.equal(invalid.state.mode,intent);assert.ok(invalid.choices.length>=3);
const back=transition(r.state,'back');assert.equal(back.state.mode,intent);assert.notEqual(back.state.step,'follow-up');
const switchIntent=transition(r.state,'report');assert.equal(switchIntent.state.mode,'report');
}})}
