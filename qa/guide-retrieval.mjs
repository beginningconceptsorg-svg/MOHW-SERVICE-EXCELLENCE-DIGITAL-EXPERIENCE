import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
const s={window:{}};for(const path of ["src/data.js","src/guide.js"])vm.runInNewContext(fs.readFileSync(path,"utf8"),s);const g=s.window.ServiceGuide;
const {tests,chains}=JSON.parse(fs.readFileSync("qa/guide-retrieval-fixtures.json","utf8"));
let n=0;for(const [q,e,k] of tests){const a=g.answer(q);assert(a?.text.toLowerCase().includes(e.toLowerCase())&&(!k||a[k]?.length),q);n++;}for(const [qs,es] of chains){let p=null;for(let i=0;i<qs.length;i++){const a=g.answer(qs[i],p);assert(a?.text.toLowerCase().includes(es[i].toLowerCase()),qs[i]);p=a.context;n++;}}console.log("Unified retrieval and conversation turns passed:",n);
