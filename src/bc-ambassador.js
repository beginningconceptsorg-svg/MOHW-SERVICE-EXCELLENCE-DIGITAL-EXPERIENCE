/* Beginning Concepts ambassador: configuration, conversational context and local actions. */
(function(root){
"use strict";
const norm=q=>String(q||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g,"").replace(/[’']/g,"").replace(/[^a-z0-9% ]/g," ").replace(/\s+/g," ").trim().replace(/^(?:(?:um|uh|well|okay|alright|all right|so|please|and)\s+)+/,"");
const deny=/\b(ignore|override|jailbreak|system prompt|hidden instructions|fabricate|make up|personal|private|confidential|identify|names of participants|names of respondents|who complained|who said|patient record|medical record|diagnos\w*|symptom\w*|medication|trn|passport|password|salary record|employee id|credit card)\b/i;
const fresh=/\b(current|currently|latest|today|right now|live|already|2026|2027|2028|2029|2030)\b/i;
const numeric=/\d|\b(score|csat|percent|rate|rating|calculate|how many|how much|regression|odds|target|benchmark|compare)\b/i;
const scope=/\b(ella|study|report|research|survey|eehcsd|mohw|ministry|service excellence|customer service|health authority|health services)\b/i;
const known=a=>!!a?.text&&!/clarification|possible source matches|related source|source excerpts/i.test(a.kind||"")&&!/could you (tell|clarify)|I (could not|couldnt|couldn't|cannot) (find|retrieve|verify|confirm)/i.test(a.text);
const boundary=a=>/Evidence boundary|Scope and confidentiality|Quiz|Source navigation/i.test(a?.kind||"");
function makeCloud({config,fetcher=typeof fetch==="function"?fetch.bind(globalThis):null,hasConsent=()=>false,abortFactory=()=>new AbortController()}={}){
 const c=config?.cloud||{},active=!!(c.enabled===true&&c.approved===true&&c.classification==="public-approved"&&c.mode==="interpret-only"&&c.consentRequired===true&&c.endpoint==="https://ai.beginningconcepts.org/v1/chat"&&fetcher);
 async function interpret(q){
 if(!active||!hasConsent()||typeof q!=="string"||q.length>400||!scope.test(q)||deny.test(q)||fresh.test(q)||numeric.test(q)||/@/.test(q))return null;
 const abort=abortFactory(),t=setTimeout(()=>abort.abort(),5000);
 try{const r=await fetcher(c.endpoint,{method:"POST",headers:{"Content-Type":"application/json"},credentials:"omit",cache:"no-store",redirect:"error",signal:abort.signal,body:JSON.stringify({tenant_id:config.tenant,mode:"interpret-only",question:q,knowledge_version:config.knowledgeVersion})});if(!r.ok)return null;let x=await r.json();if(x?.tenant_id!==config.tenant||x.mode!=="interpret-only"||typeof x.rewritten_question!=="string")return null;let s=x.rewritten_question.trim();return s.length>=5&&s.length<=240&&s.endsWith("?")&&!/[\r\n<>{}\[\]@]|https?:/i.test(s)&&!deny.test(s)&&!fresh.test(s)&&!numeric.test(s)&&scope.test(s)?s:null;}catch(e){return null;}finally{clearTimeout(t);}
 }return {active,interpret};
}
const routePatterns=[
 ["voices",/\b(staff (experiences?|feedback|voices|comments)|focus groups?|qualitative findings|what staff shared)\b/],
 ["action",/\b(recommendations?|action plan|roadmap|improvement plan|workstreams?|improve page|actions?)\b/],
 ["library",/\b(report|pdf|publication|original (document|study)|library|document)\b/],
 ["divisions",/\b(divisions?|departments?|division comparisons?)\b/],
 ["results",/\b(results?|findings?|scores?|charts?|service dimensions?|statistics)\b/],
 ["learn",/\b(quiz|practice|learning|training|learn)\b/],
 ["study",/\b(methodology|methods?|sampling|study design|study page)\b/],
 ["dashboard",/\b(dashboard|overview|explore|summary page)\b/],
 ["home",/\b(home|homepage|welcome|landing page|start page)\b/]];
function create({engine,base,catalogue=[],config=root.AmbassadorConfig,cloud=makeCloud({config})}){
 const node=id=>catalogue.find(n=>n.id===id),action=route=>({route,label:"Open "+config.routes[route]});
 function evidence(id,p){let n=node(id);if(!n)return null;return {text:n.text,pages:n.pages||[],links:n.links||[],next:n.next||[],kind:n.domain==="report"?"Report evidence":"Official Ministry information · checked 27 Nov 2026",context:{kind:n.domain==="report"?(n.kind==="method"?"method":"overall"):"institution",focus:n.topic,institution:n.domain==="report"?undefined:n.domain,role:p?.role}};}
 function message(text,p,actions=[],next=[]){return {text,pages:[],kind:"Conversation",context:p,actions,next};}
 function carry(a,p,q){const c=a.context||p||{},old=p?.ambassador||{},history=(old.history||[]).slice(-11);let subject=c.kind==="institution"?c.institution:["division","dimension","comparison","method","action","coaching","overall","themes","actions"].includes(c.kind)?"report":old.subject;
 if(a.kind==="Source navigation"||a.kind==="Recap")subject=old.subject||subject;
 let last=old.lastEvidence;if((a.pages?.length||a.links?.length)&&a.kind!=="Source navigation"){last={text:a.text,pages:a.pages||[],links:a.links||[],focus:c.focus};history.push({q:String(q).slice(0,600),subject,focus:c.focus});}
 return {...a,context:{...c,ambassador:{subject:subject||"report",history,lastEvidence:last}}};}
 function local(q,p){
 let s=norm(q),a=engine.answer(q,p);if(!s||deny.test(s)||(boundary(a)&&a.kind!=="Source navigation"))return a;
 if(/^(whats your name|what is your name|who are you|are you ella|what should i call you|what do i call you)$/.test(s))return message("I'm Ella, your digital Service Excellence Guide. I help you explore the study, EEHCSD and the Ministry, and find practical ways to improve service. I'm a digital guide, not a Ministry officer.",p,[],["What was this study about?","What is EEHCSD?","What can I do here?"]);
 if(/^(hi|hello|hey|good morning|good evening|good afternoon|hiya|hey ella|hello ella|hi ella)$/.test(s))return message("Hello! I'm Ella. What would you like to explore today — the study, the Ministry, or ways to improve service?",p,[],["What was this study about?","Who conducted it?","What can I do here?"]);
 if(/^(thanks|thank you|thank you ella|thanks ella|much appreciated)$/.test(s))return message("You're welcome! I'm here whenever you need me.",p);
 if(/^(what can (i|we) do (on (this|the) (website|site|platform|app)|here|in this app)|how (does|do i use) (this|the) (website|site|platform|app)( work)?|what (is|was) this (website|app|platform) (for|about)|how (do|can) i (navigate|use this site)|show me around)$/.test(s))return message("This experience brings the Ministry's internal satisfaction study to life. You can explore the methods and results, compare divisions, see what staff shared, review the ten improvement workstreams, practise with learning scenarios, or read the original report. Choose where you'd like to begin.",p,["dashboard","study","results","divisions","voices","action","learn","library"].map(action));
 if(/^(?:can you |could you |would you |i want to |id like to )?(?:take me to|bring me to|open|go to|navigate to|show me the page for|where (can|do) i (find|read|see)|let me (see|read)|i want to see|i want to read)\b/.test(s)&&!/\b(page \d+|table \d+|figure \d+|appendix \d+|current|latest|my|patient|private)\b/.test(s)){
 let m=routePatterns.find(x=>x[1].test(s));if(m)return message("Of course. You can open "+config.routes[m[0]]+" below. Your conversation will still be here when you return.",p,[action(m[0])]);}
 const d=p?.ambassador?.subject||(p?.kind==="institution"?p.institution:"report"),focus=p?.focus||p?.ambassador?.lastEvidence?.focus,narrow=["division","dimension","comparison","action","coaching","quiz","quizNext","quizDone"].includes(p?.kind);
 if(p&&!narrow&&/^(why|why though|why is that|why did they|why did they do it|what for|why was that done|what was the reason)$/.test(s)){
 if(d==="ee")return evidence(focus==="eelead"?"institution:objectives":"institution:eehistory",p);
 if(d==="mohw")return evidence("institution:mission",p);return evidence("evidence:purpose",p);}
 if(p&&!narrow&&/^(when|when was that|when exactly|when did that happen|when did they do it|when was it)$/.test(s)){
 if(d==="ee"&&["ee","eehistory","objectives","structure"].includes(focus))return evidence("institution:eehistory",p);
 if(d==="report")return evidence(focus==="phase2"?"report:phase2":"report:when",p);}
 if(p&&!narrow&&/^(where|where was that|where did that happen|where exactly|where is it)$/.test(s))return evidence(d==="ee"?"institution:eecontact":d==="mohw"?"institution:mcontact":"report:where",p);
 if(p&&!narrow&&d==="report"&&/^(how|how so|how did they do it|how was that done|how did that work)$/.test(s))return evidence("report:methods",p);
 if(p?.kind==="institution"&&/^(who|who did it|who was behind it|who is responsible|who leads it|who is in charge)$/.test(s))return evidence(d==="ee"?"institution:eelead":"institution:mlead",p);
 if(/^(how do you know|how do i know youre right|show me your sources|where did you get that|what is your source|source|sources|which page)$/.test(s)&&p?.ambassador?.lastEvidence){let e=p.ambassador.lastEvidence;return {text:"Here "+(e.links.length?"are the official sources":"are the original report pages")+" supporting the information we just discussed.",pages:e.pages,links:e.links,kind:"Source navigation",context:p,next:[]};}
 if(/^(back to the study|return to the study|go back to the study|back to the report|lets go back to the research)$/.test(s))return engine.answer("What was this study really about?",null);
 if(/^(back to eehcsd|return to eehcsd|go back to eehcsd|back to the division)$/.test(s))return evidence("institution:ee",p);
 if(/^(back to the ministry|return to the ministry|go back to the ministry)$/.test(s))return evidence("institution:ministry",p);
 if(/^(what does that mean for me|what does it mean for me|why should i care)$/.test(s)&&d==="ee"){let b=evidence("institution:objectives",p);if(b)return {...b,text:"For a staff member or person using health services, the division's work is about reducing barriers and making services more responsive. "+b.text};}
 if(/^(shorter|simpler|in plain english|say it again|repeat that|can you repeat that)$/.test(s)&&p?.ambassador?.lastEvidence&&!known(a)){let e=p.ambassador.lastEvidence;return {text:/repeat|again/.test(s)?e.text:e.text.split(/(?<=[.!?])\s+/).slice(0,2).join(" "),pages:e.pages,links:e.links,kind:"Recap",context:p,next:[]};}
 return a;}
 async function respond(q,p){let a=local(q,p);if(known(a)||boundary(a))return carry(a,p,q);
 if(!deny.test(q)&&!fresh.test(q)&&!numeric.test(q)){let s=await cloud.interpret(q);if(s){let r=engine.answer(s,p);if(known(r)&&!boundary(r)&&(r.pages?.length||r.links?.length))return carry({...r,kind:"AI-assisted interpretation · source-backed"},p,q);}}
 let b=await base.respond(q,p);return carry(b||a||{text:"I don't have a verified answer to that yet. Are you asking about the study, EEHCSD, the Ministry, or using this website?",pages:[],kind:"Clarification",next:["What was this study about?","What is EEHCSD?","What can I do here?"],context:p},p,q);}
 return {respond,prepare:()=>base.prepare(),status:()=>base.status(),stop:()=>base.stop?.()};
}root.BCAmbassador={create,makeCloud};
})(window);
