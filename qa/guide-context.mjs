import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const s={window:{}};for(const path of ["src/data.js","src/guide.js"])vm.runInNewContext(fs.readFileSync(path,"utf8"),s);const g=s.window.ServiceGuide;
const {testCases,chains}=JSON.parse(fs.readFileSync("qa/guide-context-fixtures.json","utf8"));let count=0;
function verify(q,expected,context){const a=g.answer(q,context);assert(a?.text.toLowerCase().includes(expected.toLowerCase())&&a.pages?.length,q);count++;return a.context;}
for(const [q,e] of testCases)verify(q,e,null);for(const [qs,es] of chains){let c=null;for(let i=0;i<qs.length;i++)c=verify(qs[i],es[i],c);}
console.log("Report provenance and contextual turns passed:",count);
