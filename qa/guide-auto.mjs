import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
async function run(w,assert){
const A=w.GuideAuto;let n=0;const check=(v,m)=>{assert(v,m);n++;};
check(A.networkAllows({onLine:true,deviceMemory:4,connection:{type:"wifi"}}),"Wi-Fi");
check(!A.networkAllows({onLine:true,connection:{type:"cellular",effectiveType:"4g"}}),"cellular");
check(!A.networkAllows({onLine:true,connection:{effectiveType:"4g"}}),"unknown metering");
check(!A.networkAllows({onLine:true,connection:{type:"wifi",saveData:true}}),"data saver");
check(!A.networkAllows({onLine:false,connection:{type:"wifi"}}),"offline");
check(!A.networkAllows({deviceMemory:1,connection:{type:"wifi"}}),"low memory");
let calls=0,native=A.createNative({getAPI:()=>({availability:async()=>"downloadable",create:async()=>{calls++;}})});check(!await native.prepare()&&calls===0,"no native download");
native=A.createNative({getAPI:()=>({availability:async()=>"available"})});check(await native.prepare()&&native.status().state==="ready","native installed");
let known={text:"54% was the overall score",pages:[26],kind:"Report evidence"},fallback={text:"No verified answer",kind:"Clarification"};
let semanticCalls=0,engine={answer:q=>q==="score"?known:null,search:async()=>fallback};
let catalogue=[{id:"a",topic:"complaints",domain:"ee",keys:"feedback",text:"Official feedback information.",links:[{url:"https://www.moh.gov.jm/",label:"Ministry"}],kind:"institution",next:["What is Client Care Connect?"]},{id:"b",topic:"research",domain:"report",keys:"study",text:"Research methods.",pages:[19],kind:"method"}];
let semantic={entries:catalogue,status:()=>"ready",prepare:()=>{},search:async()=>{semanticCalls++;return [{id:"a",score:.81},{id:"b",score:.55}];},stop:()=>{}};
let fakeNative={status:()=>({state:"off"}),prepare:async()=>false};let ai=A.create({engine,catalogue,native:fakeNative,semantic,hybridFactory:()=>({respond:async()=>fallback})});
check((await ai.respond("score")).text===known.text&&semanticCalls===0,"known immediate");
check((await ai.respond("What is the latest score?")).text===fallback.text&&semanticCalls===0,"current facts");
check((await ai.respond("Who complained?")).text===fallback.text&&semanticCalls===0,"privacy");
let a=await ai.respond("Where can I give praise?");check(a.kind==="Related source"&&a.links[0].url==="https://www.moh.gov.jm/"&&semanticCalls===1,"exact source");
check(!A.semanticReply([{id:"a",score:.3}],catalogue,null),"low confidence");
check(A.semanticReply([{id:"a",score:.7},{id:"b",score:.68}],catalogue,null).kind==="Clarification","ambiguity");
check(!A.semanticReply([{id:"invented",score:1}],catalogue,null),"unknown source");
let worker;const sem=A.createSemantic({catalogue,nav:{connection:{type:"wifi"}},spawn:()=>worker={postMessage(m){this.last=m;},terminate(){this.closed=true;}}});
check(sem.prepare()&&sem.status()==="loading"&&worker.last.type==="init","auto init");
worker.onmessage({data:{type:"ready"}});check(sem.status()==="ready","ready");let pending=sem.search("feedback");worker.onmessage({data:{type:"result",id:worker.last.id,rows:[{id:"a",score:.8}]}});check((await pending)[0].id==="a","worker answer");sem.stop();check(worker.closed&&sem.status()==="off","cleanup");
return n;}

const s={window:{},setTimeout,clearTimeout,AbortController};for(const p of ["src/data.js","src/guide.js","src/guide-hybrid.js","src/guide-auto.js"])vm.runInNewContext(fs.readFileSync(p,"utf8"),s);const n=await run(s.window,assert);const app=fs.readFileSync("src/app.js","utf8");assert(!app.includes("guideAIModel"));assert(app.includes("guide-bottom-bar"));assert(app.includes("autoSend:true"));console.log("Automatic intelligence checks:",n+3);
