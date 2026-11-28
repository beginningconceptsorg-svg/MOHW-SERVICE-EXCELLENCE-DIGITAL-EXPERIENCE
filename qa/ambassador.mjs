import fs from "node:fs";
import vm from "node:vm";
import assert from "node:assert/strict";
async function run(w,assert){
 const engine=w.ServiceGuide,base={respond:async(q,p)=>engine.answer(q,p)||{text:"No verified answer",kind:"Clarification",pages:[]},prepare(){},status(){return{}},stop(){}},E=w.BCAmbassador,config=w.AmbassadorConfig;let calls=0;
 const cloud=E.makeCloud({config,fetcher:async()=>{calls++;throw Error("Must not call");},hasConsent:()=>true});assert(!cloud.active,"cloud disabled");assert(await cloud.interpret("What is the Ministry?")===null&&calls===0,"no remote traffic");
 const a=E.create({engine,base,catalogue:w.GuideCatalogue,config,cloud});let p=null,count=2;
 async function ask(q,term,required){let r=await a.respond(q,p);assert(r.text.toLowerCase().includes(term.toLowerCase()),q+" → "+r.text.slice(0,150));if(required)assert(required(r),q+" missing evidence/action");p=r.context;count++;return r;}
 await ask("Hi","Ella");await ask("What is this about?","54%",r=>r.pages.length>0);await ask("Who did it?","Customer Service Branch",r=>r.pages.includes(7));await ask("Why?","internal services",r=>r.pages.length>0);await ask("When?","20 January",r=>r.pages.includes(20));await ask("How do you know?","report pages",r=>r.pages.includes(20));await ask("What does that mean for me?","staff");
 await ask("What is EEHCSD?","fairer",r=>r.links.length>0);await ask("Why?","Cabinet",r=>r.links.length>0);await ask("When?","7 May 2024");await ask("Where?","Sylvan Avenue");await ask("Back to the study","54%");await ask("How?","structured survey");await ask("Who did it?","Customer Service Branch");
 p=null;await ask("What's your name?","Ella");await ask("What can I do on this website?","compare divisions",r=>r.actions.length===8);
 for(let [q,route] of [["Take me to the results","results"],["Open the original PDF","library"],["Take me to the recommendations","action"],["Open division comparisons","divisions"],["Go to the homepage","home"],["Show me the page for research methods","study"],["Open the staff experiences","voices"],["Open the practice quiz","learn"]])await ask(q,"open",r=>r.actions?.[0].route===route);
 p=null;await ask("What was the overall score?","54%");
 const approved={...config,cloud:{enabled:true,approved:true,classification:"public-approved",mode:"interpret-only",consentRequired:true,endpoint:"https://ai.beginningconcepts.org/v1/chat"}};
 let payload=null;const mockAbort=()=>({abort(){},signal:{}});const fake=E.makeCloud({config:approved,hasConsent:()=>true,abortFactory:mockAbort,fetcher:async(u,o)=>{calls++;payload=JSON.parse(o.body);return {ok:true,json:async()=>({tenant_id:config.tenant,mode:"interpret-only",rewritten_question:"What is EEHCSD?"})};}});
 assert(await fake.interpret("What does the EEHCSD actually handle?")==="What is EEHCSD?","approved mock interpretation");count++;
 assert(payload&&Object.keys(payload).sort().join(",")==="knowledge_version,mode,question,tenant_id","minimal payload");count++;
 let previous=calls;assert(await fake.interpret("Who complained in the Ministry?")===null&&calls===previous,"sensitive blocked");count++;
 assert(await fake.interpret("What is the current Ministry score?")===null&&calls===previous,"current blocked");count++;
 const noConsent=E.makeCloud({config:approved,hasConsent:()=>false,fetcher:async()=>{throw Error("not allowed");}});assert(await noConsent.interpret("What does the Ministry do?")===null,"no consent");count++;
 const bad=E.makeCloud({config:approved,hasConsent:()=>true,abortFactory:mockAbort,fetcher:async()=>({ok:true,json:async()=>({tenant_id:"other",mode:"interpret-only",rewritten_question:"What is EEHCSD?"})})});assert(await bad.interpret("What does the Ministry do?")===null,"wrong tenant rejected");count++;return count;
}
const s={window:{},setTimeout,clearTimeout,AbortController};for(const p of ["src/data.js","src/guide.js","src/ambassador-config.js","src/bc-ambassador.js"])vm.runInNewContext(fs.readFileSync(p,"utf8"),s,{filename:p});console.log("Ambassador scenarios passed:",await run(s.window,assert));
