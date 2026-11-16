import { test } from 'node:test';
import assert from 'node:assert/strict';
import { exchanges, simulateOrder, validateConnection } from './model.js';
test('all eight exchanges and passphrase variations are present', () => {
 assert.equal(exchanges.length, 8); assert.equal(new Set(exchanges.map(e=>e.id)).size,8);
 assert.deepEqual(exchanges.filter(e=>e.passphrase).map(e=>e.id),['okx','bitget','kucoin']);
});
test('connection requires every acknowledged permission', () => {
 const all={read:true,trade:true,withdrawalOff:true,ip:true};assert.equal(validateConnection('binance',all),'');
 for(const field of Object.keys(all))assert.notEqual(validateConnection('binance',{...all,[field]:false}),'');
 assert.notEqual(validateConnection('unknown',all),'');
});
test('paper orders conserve funds and holdings; invalid or unfunded orders fail', () => {
 const initial={balance:10000,holdings:{}};
 const bought=simulateOrder(initial,'BTC/USDT','buy',.1);assert.equal(bought.balance,3500);assert.equal(bought.holdings['BTC/USDT'],.1);
 const sold=simulateOrder(bought,'BTC/USDT','sell',.1);assert.equal(sold.balance,10000);assert.equal(sold.holdings['BTC/USDT'],0);
 assert.deepEqual(initial,{balance:10000,holdings:{}});
 for(const q of [0,-1,NaN,Infinity,'invalid',1e-15])assert.throws(()=>simulateOrder(initial,'BTC/USDT','buy',q));
 assert.throws(()=>simulateOrder(initial,'BTC/USDT','buy',1));assert.throws(()=>simulateOrder(initial,'BTC/USDT','sell',.1));
 assert.throws(()=>simulateOrder(initial,'FAKE','buy',1));assert.throws(()=>simulateOrder(initial,'BTC/USDT','withdraw',1));
});
