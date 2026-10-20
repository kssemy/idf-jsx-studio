import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const html=readFileSync(new URL('./dist/index.html',import.meta.url),'utf8');
const scripts=[...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)].map(m=>m[1]);
scripts.forEach(script=>new vm.Script(script));

const context={};
vm.runInNewContext(scripts.find(script=>script.includes('function makeData(')),context);
const rows=['A','B','C'].map((code,i)=>({week:'10월 3주차',code,brand:'LIST',tag:10000,
  sale:8000-i*1000,percent:20+i*10,excelRow:i+2,error:''}));
const result=context.IDF.makeData(rows,'10월 3주차',[['A'],['B'],['C']]);
assert.equal(result.general.length,3);
assert.equal(result.special[2].sale,6000);
assert.equal(context.IDF.weekDate('10월 4주차 (10/21)',new Date(2026,9,19)),'26.10.21');
assert.equal(context.IDF.weekDate('1월 1주차 (1/6)',new Date(2026,11,30)),'27.01.06');
assert.throws(()=>context.IDF.weekDate('10월 4주차',new Date(2026,9,19)),/날짜/);

const literal=html.match(/const JSX_LOGIC\s*=\s*("(?:\\.|[^"\\])*")\s*;/)?.[1];
assert.ok(literal);
const jsx=JSON.parse(literal);
new vm.Script(jsx);
assert.doesNotMatch(jsx,/pop_A5|popOperations|popSummary/);
assert.match(jsx,/function dateText\(/);
assert.match(jsx,/kind:'date'/);
console.log('JSX generator smoke checks passed');
