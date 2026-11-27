/* Local report companion: structured evidence, conversational context, and PDF page search.
   No external chat API; no transmission or persistence of questions. */
(function(root){
"use strict";
const S=root.STUDY;
const clean=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9%]+/g," ").trim();
const has=(s,r)=>r.test(s);
const res=(text,pages=[],context=null,next=[])=>({text,pages:[...new Set(pages)],context,next});
const dimAliases=[/\b(communication|communicate|information sharing)\b/,/\b(access|facilities|parking|premises|air quality)\b/,/\b(quality|reliability|reliable)\b/,/\b(timeliness|responsiveness|turnaround|delay|delays|waiting|slow|promptness)\b/,/\b(cost|payment|payments|payroll|salary|salaries|reimbursement)\b/];
const divAliases=[/\b(executive management|executive)\b/,/\b(eehcsd|enabling environment)\b/,/\b(nphl|national public health lab|laboratory)\b/,/\b(standards and regulation|regulatory)\b/,/\b(technical services|technical division|technical)\b/,/\b(policy planning|policy|planning and development)\b/,/\b(corporate services|corporate)\b/,/\b(finance and accounts|finance|accounts)\b/];
const actionAliases=[/\b(service standards|sla|slas|service level|kpi|kpis)\b/,/\b(training|competencies|lms|customer service skills)\b/,/\b(feedback|complaints|continuous quality improvement|cqi)\b/,/\b(document control|records|lost documents|repository)\b/,/\b(cross divisional|cross division|standardise|standardize|workflow|workflows|sop|sops|procedures)\b/,/\b(timeliness|turnaround|payroll|delays|approvals|administrative)\b/,/\b(leadership|supervisor|supervisors|accountability|360 degree)\b/,/\b(welfare|recognition|morale|wellness|reward)\b/,/\b(communication|staff directory|information sharing)\b/,/\b(facilities|parking|air quality|physical access|maintenance)\b/];
const names=(arr)=>arr.map(d=>d.name+" — "+d.score+"%").join("; ");
const listActions=arr=>arr.map(a=>a.id+". "+a.title).join("\n");
const isAction=q=>has(q,/\b(recommend|recommendations|recommended|improve|improvement|actions?|workstreams?|roadmap|implement|implementation|target|targets|responsible|owner|timeline|deadline|indicators?|measure|fix|address|do about|solution|next steps)\b/);
function actionAnswer(a,q,ctx){
 let t="The report proposes "+a.title.toLowerCase()+". "+a.official;
 if(has(q,/\b(who|owner|responsible|lead)\b/))t="The proposed lead for "+a.title.toLowerCase()+" is "+a.owner+".";
 else if(has(q,/\b(when|timeline|deadline|period|date)\b/))t="The proposed timeframe for "+a.title.toLowerCase()+" is "+a.period+".";
 else if(has(q,/\b(targets?|kpis?|indicators?|measure|success)\b/))t="Here is how the report proposes measuring "+a.title.toLowerCase()+":\n• "+a.indicators.join("\n• ");
 else t+="\nThe issue: "+a.gap+"\nSuggested steps:\n• "+a.steps.join("\n• ")+"\nProposed lead: "+a.owner+". Timeframe: "+a.period+".";
 return res(t+"\nThese are proposed actions, not verified achievements.",[a.page],{kind:"action",id:a.id},["Who is responsible?","What are the targets?","When is it due?"]);
}
function answer(input,previous=null){
 const q=clean(input), ctx=previous||null;
 if(!q)return res("What would you like to explore?");
 if(has(q,/\b(my trn|my salary|my employee id|my medical|individual employee|personal grievance|who complained|identify participants|names of respondents)\b/))return res("I can help with the report's aggregate findings, but I can't handle individual cases or identify participants. Please use an authorised confidential Ministry channel for personal matters.");
 if(has(q,/^(hi|hey|hello|good morning|good afternoon|good evening|how are you|wah gwaan)( there)?$/))return res("Hello! I'm here to help you make sense of the 2025 study. We can explore what staff reported, compare divisions or look at what the Ministry proposes doing next.",[],ctx,["Give me the big picture","Compare divisions","What should improve?"]);
 if(has(q,/^(thanks|thank you|thank u|great|okay|ok|nice|cool|cheers)( so much| very much)?$/))return res("You're welcome! We can keep exploring whenever you're ready.",[],ctx);
 if(has(q,/\b(who are you|what can you do|your name|are you ai|are you real)\b/))return res("I'm the Service Excellence Guide, a digital companion to the Ministry's 2025 Internal Customer Satisfaction Study. I can explain verified results, compare scores, unpack recommendations and locate relevant pages. I use report data and local document search, not a live generative AI service.",[],ctx,["Summarise the study","Show the recommendations"]);
 const page=q.match(/\b(?:pdf )?page (\d{1,2})\b/);
 if(page){let n=+page[1];return n>=1&&n<=74?res("Here you go — open PDF page "+n+" in the original report. The printed page number may differ.",[n],ctx):res("The PDF has 74 pages. Which page would you like to open?");}
 if(has(q,/\b(download|original report|open report|read report|library|full report|source document|where is the pdf)\b/))return res("You can read the original 74-page publication in the Digital Report Library, with navigation, search and download controls.",[1],ctx);
 if(has(q,/\b(verification|inconsisten|discrepanc|data quality|errors|68 vs|68 or 69)\w*/))return res("A few source figures need author confirmation. For example, the report states a 68% response rate, but 229 divided by 332 is about 69%; and the payment score is 44% in Figure 8 but 35% in the discussion. I use the figures identified in the verified dashboard and flag discrepancies rather than silently resolving them.",[19,26,54],ctx,["How many staff responded?","What was the payment score?"]);
 const dims=dimAliases.map((r,i)=>r.test(q)?i:-1).filter(i=>i>=0);
 const divs=divAliases.map((r,i)=>r.test(q)?i:-1).filter(i=>i>=0);
 const acts=actionAliases.map((r,i)=>r.test(q)?i:-1).filter(i=>i>=0);
 const actionNum=q.match(/\b(?:action|workstream|recommendation)\s*(?:number\s*)?(\d{1,2})\b/);
 const compare=has(q,/\b(compare|versus|vs|difference|gap|higher|lower|better than|worse than)\b/);
 const low=has(q,/\b(lowest|worst|weakest|least|bottom)\b/), high=has(q,/\b(highest|best|strongest|top)\b/);
 const follow=has(q,/^(and |what about |how about |why |how |who |when |what does |what are |what is |tell me more|explain|can you elaborate|show me|give me more|what can we do)/);
 if(actionNum){const a=S.actions.find(a=>a.id===+actionNum[1]);return a?actionAnswer(a,q,ctx):res("Appendix 5 has ten workstreams, numbered 1–10.",[70]);}
 if(ctx&&ctx.kind==="action"&&follow&&!dims.length&&!divs.length&&!acts.length&&!has(q,/\b(overall|survey|methodology|study|division|dimensions|all|recommendations)\b/)){return actionAnswer(S.actions.find(a=>a.id===ctx.id),q,ctx);}
 if(divs.length>=2){const ds=divs.map(i=>S.divisions[i]);const delta=Math.abs(ds[0].score-ds[1].score);return res("In the 2025 study: "+names(ds)+". "+(ds.length===2?(delta? "That's a difference of "+delta+" percentage points.":"They received the same overall score."):"These are historical ratings.")+" The figures describe internal service experience, not individual staff performance.",[27,28],{kind:"division",id:divs[0]},["Which dimension scored lowest?","What are the recommendations?"]);}
 if(divs.length===1){
 const i=divs[0],d=S.divisions[i];
 if(dims.length){return res("For "+d.name+", "+dims.map(j=>S.dimensions[j].name+" was "+d.dimensions[j]+"%").join("; ")+". Its overall score was "+d.score+"%. These are 2025 ratings.",[27,28],{kind:"division",id:i},["Which dimension was lowest?"]);}
 if(isAction(q)){const relevant=d.dimensions.map((v,j)=>({v,j})).sort((a,b)=>a.v-b.v)[0];const a=S.actions[[8,9,4,5,5][relevant.j]];return res("For "+d.name+", the lowest-rated dimension was "+S.dimensions[relevant.j].name+" ("+relevant.v+"%). A relevant report proposal is "+a.title.toLowerCase()+". "+a.steps.join("; ")+". This is a suggested connection, not a division-specific assignment.",[28,a.page],{kind:"action",id:a.id},["Who is responsible?","What are the targets?"]);}
 return res(d.name+" received "+d.score+"% overall, based on "+d.agree+" favourable ratings out of "+d.ratings+" ratings.\n"+S.dimensions.map((x,j)=>x.name+": "+d.dimensions[j]+"%").join("\n")+"\nThese are ratings of interactions, not unique employees.",[27,28],{kind:"division",id:i},["Which dimension was lowest?","What can we do to improve?"]);
 }
 if(ctx&&ctx.kind==="division"&&follow&&!has(q,/\b(all|overall study|national|compare divisions|survey|methodology|recommendations)\b/)){
 const d=S.divisions[ctx.id];if(low||high||dims.length||isAction(q)){return answer(d.name+" "+q,null);}
 }
 if(has(q,/\b(division|divisions|department|departments|branch|branches)\b/) && !isAction(q)){
 const ds=[...S.divisions].sort((a,b)=>b.score-a.score);
 if(low||high){const d=low?ds[ds.length-1]:ds[0];return res(d.name+" had the "+(low?"lowest":"highest")+" overall divisional score, at "+d.score+"%. "+(low?"Executive Management was highest at 71%.":"Finance and Accounts was lowest at 28%.")+" These are historical results.",[27],{kind:"division",id:S.divisions.indexOf(d)},["Break that down by dimension","What can we do to improve?"]);}
 return res("Here's how the eight divisions scored in 2025:\n"+ds.map(d=>d.name+" — "+d.score+"%").join("\n")+"\nThese scores are based on rated service interactions.",[27],{kind:"divisions"},["Compare Finance and Corporate Services","Which division scored lowest?"]);
 }
 if(isAction(q)&&(acts.length||dims.length)){
 let ids=acts.length?acts:dims.map(i=>[8,9,4,5,5][i]);ids=[...new Set(ids)];
 if(ids.length===1)return actionAnswer(S.actions[ids[0]],q,ctx);
 const aa=ids.map(i=>S.actions[i]);return res("These proposals are most relevant:\n"+aa.map(a=>a.title+" — "+a.official+" Proposed lead: "+a.owner+".").join("\n\n")+"\nThese are proposals, not completed work.",aa.map(a=>a.page),{kind:"actions"},aa.slice(0,3).map(a=>"Explain action "+a.id));
 }
 if(has(q,/\b(benchmark|85|65|percentage points|gap to target)\b/)||isAction(q)&&has(q,/\b(overall|satisfaction|score)\b/))return res("The overall baseline was 54%. The report cites an 85% Government of Jamaica service-excellence benchmark — a 31 percentage-point gap. Appendix 5 proposes increasing internal CSAT to at least 65% within two survey cycles, an 11 percentage-point increase. These are targets, not achieved results.",[26,70],{kind:"overall"},["What should improve?","How was the study conducted?"]);
 if(isAction(q)&&!has(q,/\b(research methods|survey response)\b/))return res("Appendix 5 sets out ten proposed workstreams:\n"+listActions(S.actions)+"\nPick any one and I can explain the steps, responsible leads, timelines and indicators.",[70,71,72,73,74],{kind:"actions"},["Explain action 1","Explain action 6","Explain action 10"]);
 if(has(q,/\b(focus group|focus groups|fgd|qualitative|themes|staff experiences|staff shared|staff said|staff feel|staff concerns|voices)\b/))return res("The qualitative part involved 63 staff across ten focus groups. Four themes emerged:\n"+S.themes.map(t=>t.title+": "+t.summary).join("\n\n")+"\nThese are aggregate themes, not individual cases.",[33,35,43,49,51],{kind:"themes"},["What should improve?","How was the study conducted?"]);
 if(has(q,/\b(survey|sample|sampling|methodology|methods|response rate|respondents|participants|how many staff|how many people|how was.*conducted|research design|interactions|ratings)\b/)){
 const m=S.methodology;return res("The study used a cross-sectional mixed-methods design: a stratified random survey and purposively selected focus groups.\n• Sampling frame: "+m.frame+" staff\n• Selected: "+m.selected+"\n• Survey respondents: "+m.responded+"\n• Reported response rate: "+m.reportedResponseRate+"% (229 ÷ 332 is approximately 69%; flagged for confirmation)\n• Focus groups: "+m.fgdGroups+", with "+m.fgdParticipants+" participants\n• "+m.interactionsRespondents+" respondents reported "+m.interactions.toLocaleString("en-JM")+" interactions.\nThe survey ran "+m.surveyPeriod+".",[19,20,21,24],{kind:"method"},["What were the main findings?","What did staff share?"]);
 }
 if(dims.length>1){const ds=dims.map(i=>S.dimensions[i]);return res(names(ds)+". "+(ds.length===2?"The difference is "+Math.abs(ds[0].score-ds[1].score)+" percentage points.":"These are the 2025 service-dimension results."),[26],{kind:"dimension",id:dims[0]},["What should improve?"]);}
 if(dims.length===1||ctx&&ctx.kind==="dimension"&&follow&&!has(q,/\b(all|five|overall|study|divisions)\b/)){
 let i=dims.length?dims[0]:ctx.id,d=S.dimensions[i];return res(d.name+" scored "+d.score+"% in 2025. "+d.detail+" "+d.insight+(i===4?" Figure 8 and Table 3 show 44%; the discussion contains a conflicting 35% figure.":""),i===4?[26,28,54]:[26],{kind:"dimension",id:i},["What can we do about "+d.name.toLowerCase()+"?","Compare all five dimensions"]);
 }
 if(low||high||has(q,/\b(dimensions|five areas|five dimensions|all scores)\b/)){
 const ds=[...S.dimensions].sort((a,b)=>b.score-a.score);
 if(low||high){let d=low?ds[ds.length-1]:ds[0];return res(low?"Cost and Payment Processes was the lowest-rated service dimension at 44%, followed by Timeliness/Responsiveness at 48%.":"Communication and Quality and Reliability tied for the highest dimension score at 59%.",[26],{kind:"dimension",id:S.dimensions.indexOf(d)},["What can we do about "+d.name.toLowerCase()+"?","Compare divisions"]);}
 return res("The five dimensions were:\n"+S.dimensions.map(d=>d.name+" — "+d.score+"%").join("\n")+"\nOverall internal CSAT was 54%.",[26],{kind:"dimensions"},["Which area scored lowest?","What are the recommendations?"]);
 }
 if(has(q,/\b(overall|summary|summarise|summarize|big picture|main findings|key findings|what is.*study|what.*report about|why.*study|purpose|csat|satisfaction score|54)\b/)){
 return res("The 2025 Internal Customer Satisfaction Study examined how Ministry staff experienced internal services. Overall satisfaction was 54%. Communication and Quality and Reliability tied at 59%; Cost and Payment Processes was lowest at 44%, followed by Timeliness/Responsiveness at 48%. The report proposes ten workstreams to improve service, including clearer standards, quicker processes and stronger feedback systems.\nThese are historical findings, not live performance.",[14,26,70],{kind:"overall"},["Compare divisions","How was the study conducted?","What are the recommendations?"]);
 }
 if(has(q,/\b(director|humphrey|principal director)\b/))return res("The report contains a message from Dr. Kimorley Humphrey, JP, Principal Director of the Enabling Environment in Health and Client Services Division, framing the study as a call to action.",[5],ctx);
 return null;
}
// Local text search of aggregate study sections. Return source locations rather than private verbatim comments.
let indexPromise=null;
const stop=new Set("a an the is are was were be been to of in for on at by from and or with about what which when where who how why can could would should does do did you me i my it its this that tell please report study pdf explain find say says".split(" "));
const terms=q=>clean(q).split(" ").filter(w=>w.length>2&&!stop.has(w));
async function index(){
 if(!indexPromise)indexPromise=(async()=>{
 const lib=await import("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs");
 lib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
 const pdf=await lib.getDocument("./docs/Internal_CSAT_Report_2025_Final.pdf").promise;
 const rows=[];try{for(let p=1;p<=pdf.numPages;p+=6){
 const batch=await Promise.all(Array.from({length:Math.min(6,pdf.numPages-p+1)},(_,i)=>p+i).map(async n=>{
 const page=await pdf.getPage(n),content=await page.getTextContent();return {n,text:clean(content.items.map(v=>v.str||"").join(" "))};
 }));rows.push(...batch);
 }}finally{await pdf.destroy();}return rows;
 })().catch(e=>{indexPromise=null;throw e;});
 return indexPromise;
}
async function search(q,ctx){
 const words=[...new Set(terms(q))];if(!words.length)return res("Could you tell me which finding, division or recommendation you're interested in?",[],ctx);
 try{
 const rows=await index(), ranked=rows.map(r=>{const ts=new Set(r.text.split(" "));return {n:r.n,score:words.reduce((v,w)=>v+(ts.has(w)?1:0),0),phrase:r.text.includes(words.join(" "))};}).filter(r=>r.score>=Math.min(2,words.length)).sort((a,b)=>Number(b.phrase)-Number(a.phrase)||b.score-a.score||a.n-b.n).slice(0,3);
 if(ranked.length)return res("I found possible matches in the original report on PDF "+(ranked.length===1?"page ":"pages ")+ranked.map(r=>r.n).join(", ")+". I don't have a verified summary that answers this specific question, so I won't guess. Open the source pages to check the context.",ranked.map(r=>r.n),ctx,["Summarise the study","What are the recommendations?"]);
 }catch(e){return res("I couldn't search the original PDF right now. You can still open the library or ask me about the verified findings.",[1],ctx);}
 return res("I couldn't confirm that from the study. Could you phrase it another way, perhaps using a division name, a service issue or a recommendation?",[],ctx,["Show all dimensions","Show all divisions","What are the recommendations?"]);
}
root.ServiceGuide={answer,search};
})(typeof window!=="undefined"?window:globalThis);
