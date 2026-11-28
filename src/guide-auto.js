/* Automatic source-grounded intelligence, no remote inference or paid API. */
(function(root){
"use strict";
const unsafe=/\b(ignore|override|system prompt|hidden instructions|fabricate|make up|private|confidential|participant names|respondent names|who complained|who said|identify|trn|employee id|passport|diagnos|medication|prescription|symptom|dose|emergency|suicid|medical advice|patient record|salary record|personal details|password|credit card|current|currently|latest|today|right now|as of|live|now|already|2026|2027|2028|2029|2030)\w*/i;
const numeric=/\b(score|scores|ratings?|csat|calculate|percentage|percent|benchmark|target|how many|how much|odds|regression|confidence interval|p value|rank|highest|lowest|compare|difference|ratio|statistic)\b|\d/i;
const unclear=a=>!a||/Possible source matches|Source excerpts|Clarification/i.test(a.kind||"")||/could you (?:tell|clarify)|I (?:could not|couldn't|cannot) (?:retrieve|find|confirm|verify)|I (?:don't|do not) have enough/i.test(a.text||"");
const boundary=a=>/Evidence boundary|Scope and confidentiality|Quiz|Practice quiz|Source navigation/i.test(a?.kind||"");
function networkAllows(nav){
 if(!nav||nav.onLine===false||nav.deviceMemory&&nav.deviceMemory<2)return false;
 const c=nav.connection||nav.mozConnection||nav.webkitConnection;
 if(c?.saveData||/^(2g|slow-2g|3g)$/.test(c?.effectiveType||""))return false;
 return /^(wifi|ethernet)$/.test(c?.type||"");
}
function deadline(p,ms){return new Promise(resolve=>{const t=setTimeout(()=>resolve(null),ms);Promise.resolve(p).then(x=>{clearTimeout(t);resolve(x);},()=>{clearTimeout(t);resolve(null);});});}
function createNative({getAPI=()=>root.LanguageModel}={}){
 let api,enabled=false,probe;
 function prepare(){return probe||(probe=(async()=>{try{api=getAPI();enabled=!!api&&(await api.availability())==="available";return enabled;}catch(e){return false;}})());}
 async function generate(messages){if(!enabled)throw Error("Unavailable");let session,controller=new AbortController(),timer=setTimeout(()=>controller.abort(),4500);try{session=await api.create({signal:controller.signal,initialPrompts:messages.filter(x=>x.role==="system")});return String(await session.prompt(messages.filter(x=>x.role!=="system").map(x=>x.content).join("\n"),{signal:controller.signal}));}finally{clearTimeout(timer);session?.destroy?.();}}
 return {prepare,status:()=>({state:enabled?"ready":"off"}),generate};
}
function createSemantic({spawn=()=>new Worker("./src/guide-semantic-worker.js?v=30",{type:"module"}),nav=root.navigator,catalogue=[],onStatus=()=>{}}={}){
 let worker,state="off",failed=false,request,serial=0,timer;
 const entries=catalogue.filter(n=>n.text&&(n.pages?.length||n.links?.length));
 function emit(s){state=s;onStatus(s);}
 function stop(){clearTimeout(timer);if(worker){worker.terminate();worker=null;}if(request){clearTimeout(request.timer);request.resolve(null);request=null;}emit("off");}
 function prepare(force=false){if(state!=="off"||failed&&!force||!force&&!networkAllows(nav)||!entries.length)return false;
 try{worker=spawn();emit("loading");worker.onmessage=({data:m})=>{if(!worker)return;if(m.type==="ready"){clearTimeout(timer);emit("ready");}else if(m.type==="error"){failed=true;stop();}else if(m.type==="result"&&request?.id===m.id){clearTimeout(request.timer);let p=request;request=null;p.resolve(m.rows);}};worker.onerror=()=>{failed=true;stop();};timer=setTimeout(()=>{failed=true;stop();},120000);worker.postMessage({type:"init",items:entries.map(n=>({id:n.id,text:(n.topic+" "+n.keys+" "+n.text).slice(0,1100)}))});return true;}catch(e){failed=true;stop();return false;}}
 function search(q){if(state!=="ready"||request||!worker)return Promise.resolve(null);return new Promise(resolve=>{let id=++serial,t=setTimeout(()=>{if(request?.id===id){request=null;resolve(null);}},3500);request={id,resolve,timer:t};try{worker.postMessage({type:"search",id,q});}catch(e){clearTimeout(t);request=null;resolve(null);}});}
 return {prepare,search,stop,status:()=>state,entries};
}
function semanticReply(rows,entries,p){
 if(!Array.isArray(rows))return null;let r=rows.filter(x=>Number.isFinite(x.score)&&entries.some(n=>n.id===x.id)).sort((a,b)=>b.score-a.score),a=r[0],b=r[1];if(!a||a.score<.58)return null;
 let n=entries.find(x=>x.id===a.id);if(b&&a.score-b.score<.07){let k=entries.find(x=>x.id===b.id);return {text:"I found two related topics. Did you mean "+n.topic.replace(/_/g," ")+" or "+k.topic.replace(/_/g," ")+"?",pages:[],kind:"Clarification",context:p,next:[...(n.next||[]),...(k.next||[])].slice(0,3)};}
 return {text:"This may help with your question:\n\n"+n.text+"\n\nIf you meant something more specific, tell me a little more.",pages:n.pages||[],links:n.links||[],kind:"Related source",next:n.next||[],context:{kind:n.kind||"overall",focus:n.topic,institution:n.domain==="report"?undefined:n.domain,role:p?.role,archive:p?.archive||[],last:{text:n.text,pages:n.pages||[],links:n.links||[],next:n.next||[]}}};
}
function create({engine,catalogue=[],native=createNative(),semantic=createSemantic({catalogue}),hybridFactory=root.GuideHybrid.createHybrid}={}){
 const hybrid=hybridFactory({engine,catalogue,client:native});
 function prepare(){native.prepare().catch(()=>{});semantic.prepare();}
 async function respond(q,p){
 const direct=engine.answer(q,p),fallback=()=>direct||engine.search(q,p);
 if(direct&&(!unclear(direct)||boundary(direct)))return direct;
 if(!q||unsafe.test(q)||numeric.test(q))return fallback();
 if(native.status().state==="ready"){let a=await deadline(hybrid.respond(q,p),6500);if(a&&!unclear(a)&&!boundary(a))return a;}
 if(semantic.status()==="off")semantic.prepare();
 if(semantic.status()==="ready"){let a=semanticReply(await semantic.search(q),semantic.entries,p);if(a)return a;}
 return fallback();
 }
 return {prepare,respond,enableSmallModel:()=>semantic.prepare(true),status:()=>({native:native.status().state,semantic:semantic.status()}),stop:()=>semantic.stop()};
}
root.GuideAuto={create,createNative,createSemantic,networkAllows,semanticReply};
})(window);
