import assert from "node:assert/strict";
import {registry} from "./src/registry.mjs";
import {MODEL,LIMITS,reserve,readBody,selectRecords,decode,runChat} from "./src/logic.mjs";

async function test(registry,assert){
 let count=0,check=(x,m)=>{assert(x,m);count++;};
 const tenant="mohw-service-excellence",t=registry[tenant],other="beginning-concepts-pilot";
 const b={tenant_id:tenant,mode:"chat",question:"Why was EEHCSD created?",knowledge_version:t.version,consent:true,context_ids:[]};
 check(!!readBody(b,registry),"valid request");
 for(let x of [{...b,tenant_id:"constructor"},{...b,knowledge_version:"bad"},{...b,consent:false},{...b,question:"My password is abc"},{...b,question:"a".repeat(501)},{...b,history:"private"},{...b,context_ids:["home"]}])check(!readBody(x,registry),"reject invalid, private or cross-tenant input");
 let now=Date.UTC(2026,10,27),s=null;
 for(let i=0;i<4;i++){let r=reserve(s,tenant,now);check(r.ok,"minute allowed");s=r.state;}
 check(!reserve(s,other,now).ok,"global minute cap");
 for(let i=4;i<20;i++){let r=reserve(s,tenant,now+60000*Math.floor(i/4));check(r.ok,"tenant cap not yet reached");s=r.state;}
 check(!reserve(s,tenant,now+60000*5).ok,"tenant daily cap");
 for(let i=0;i<10;i++){let r=reserve(s,other,now+60000*(5+Math.floor(i/4)));check(r.ok,"other tenant");s=r.state;}
 check(!reserve(s,other,now+60000*9).ok,"global daily cap");
 check(reserve(s,tenant,now+86400000).ok,"UTC reset");
 let records=selectRecords(t,b.question,[]);check(records.some(r=>r.id==="history"),"history retrieval");check(records.every(r=>t.records.includes(r)),"tenant isolation");
 check(!decode('{"answer":"bad","source_ids":["home"]}',b,records),"reject foreign citation");check(!decode('{"answer":"visit https://bad.invalid","source_ids":["history"]}',b,records),"reject generated link");
 check(!!decode('{"answer":"The division was announced after a Cabinet decision.","source_ids":["history"]}',b,records),"source-bound output");
 let calls=0,slots=0,auth=0;let env={AI_ENABLED:"true",FREE_PLAN_CONFIRMED:"true",AI:{run:async(model,options)=>{calls++;check(model===MODEL&&options.max_tokens===LIMITS.maxTokens,"fixed model and output limit");check(!JSON.stringify(options).includes("Internal_CSAT_Report"),"no report passed");return {response:'{"answer":"The division was announced after a Cabinet decision.","source_ids":["history"]}'};}}};
 let opts={body:b,registry,env,authorize:async()=>{auth++;return true;},reserveSlot:async()=>{slots++;return true;}};
 check((await runChat({...opts,env:{...env,FREE_PLAN_CONFIRMED:"false"}})).status===503&&calls===0,"free plan gate");
 check((await runChat({...opts,authorize:async()=>false})).status===403&&slots===0&&calls===0,"auth gate");
 check((await runChat({...opts,reserveSlot:async()=>false})).status===429&&calls===0,"quota gate");
 let r=await runChat(opts);check(r.status===200&&calls===1&&r.data.sources[0].url===t.records.find(x=>x.id==="history").url,"model with trusted URL");
 check((await runChat({...opts,env:{...env,AI:{run:async()=>{throw Error("outage")}}}})).status===503,"outage fallback");
 check((await runChat({...opts,env:{...env,AI:{run:async()=>({response:"not JSON"})}}})).status===422,"malformed model fallback");
 return count;
}

console.log("Central AI logic checks passed:",await test(registry,assert));
