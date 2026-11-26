import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

for(const name of ["src/app.js","src/data.js","sw.js"]){
 new vm.Script(fs.readFileSync(name,"utf8"),{filename:name});
 console.log("Syntax passed:",name);
}
const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync("src/data.js","utf8"),sandbox);
const s=sandbox.window.STUDY;
assert(s);
assert.equal(s.publication.pdfPages,74);
assert.equal(s.methodology.responded,229);
assert.equal(s.methodology.selected,332);
assert.equal(s.methodology.interactions,1133);
assert.equal(s.overall.score,54);
assert.equal(s.dimensions.length,5);
assert.equal(s.divisions.length,8);
assert.equal(s.actions.length,10);
assert.equal(s.themes.length,4);
assert.equal(s.divisions.reduce((a,d)=>a+d.agree,0),611);
assert.equal(s.divisions.reduce((a,d)=>a+d.ratings,0),1133);
assert.deepEqual(Array.from(s.dimensions,d=>d.score),[59,55,59,48,44]);
assert.deepEqual(Array.from(s.divisions,d=>d.score),[71,60,60,60,60,59,46,28]);
assert(s.verification.length>=5);
assert(s.actions.every(a=>a.page>=70&&a.page<=74));
const html=fs.readFileSync("index.html","utf8");
for(const route of ["home","study","results","divisions","voices","action","learn","library"]){
 assert(html.includes('data-route="'+route+'"'),"Missing navigation: "+route);
}
for(const path of ["manifest.webmanifest","assets/icon.svg","assets/icon-192.png","assets/icon-512.png","assets/guide.svg"]){
 assert(fs.existsSync(path),"Missing asset: "+path);
}
const m=JSON.parse(fs.readFileSync("manifest.webmanifest","utf8"));
assert.equal(m.display,"standalone");
assert(m.icons.some(i=>i.sizes==="192x192"));
assert(m.icons.some(i=>i.sizes==="512x512"));
const reader=fs.readFileSync("src/app.js","utf8");
assert(reader.includes("URL.createObjectURL(file)"),"Missing private in-browser PDF loading");
assert(!fs.readdirSync(".").some(x=>x.toLowerCase().endsWith(".pdf")),"Sensitive PDF must not be committed");
console.log("PASS: data, references, PWA assets, navigation and privacy controls");
