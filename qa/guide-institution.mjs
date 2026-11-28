import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const s={window:{}};for(const path of ["src/data.js","src/guide.js"])vm.runInNewContext(fs.readFileSync(path,"utf8"),s);const g=s.window.ServiceGuide;
const {tests,chains}=JSON.parse(fs.readFileSync("qa/guide-institution-fixtures.json","utf8"));let count=0;
function verify(q,e,p){const a=g.answer(q,p);assert(a?.text.toLowerCase().includes(e.toLowerCase())&&(a.links?.length||a.pages?.length),q);count++;return a.context;}
for(const [q,e] of tests)verify(q,e,null);for(const [qs,es] of chains){let p=null;for(let i=0;i<qs.length;i++)p=verify(qs[i],es[i],p);}console.log("Institutional knowledge turns passed:",count);
