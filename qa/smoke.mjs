import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

for(const name of ["src/app.js","src/guide.js","src/guide-voice.js","src/guide-speech.js","src/guide-hybrid.js","src/guide-auto.js","src/ambassador-config.js","src/bc-ambassador.js","src/guide-semantic-worker.js","src/guide-model-worker.js","src/data.js","src/reader.js","sw.js"]){
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
for(const route of ["home","dashboard","action","library"]){
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
assert(reader.includes('ServiceReader.mount'),"Built-in publication reader not mounted");
assert(!html.includes('id="pdfFileInput"'),"PDF upload field must be removed");
const embedded=fs.readFileSync("src/reader.js","utf8");
assert(embedded.includes("getDocument("),"Missing PDF.js document rendering");
assert(embedded.includes("speechSynthesis"),"Missing read-aloud feature");
assert(embedded.includes("srDownload"),"Missing download control");
assert(embedded.includes("paperSound"),"Missing page-turn sound");
assert(fs.existsSync("src/reader.css"),"Missing reader style sheet");
assert(html.includes("reader.css")&&html.includes("reader.js"),"Reader assets not loaded");
const report=fs.readFileSync("docs/Internal_CSAT_Report_2025_Final.pdf");
assert.equal(report.length,1975577,"Original report byte length mismatch");
assert.equal(report.subarray(0,5).toString(),"%PDF-","Invalid original PDF");
console.log("PASS: data, source references, reader, no-upload workflow, PWA and privacy checks");

vm.runInNewContext(fs.readFileSync("src/guide.js","utf8"),sandbox);
const g=sandbox.window.ServiceGuide;
assert(g.answer("What was the overall score?").text.includes("54%"));
assert(g.answer("Compare finance and corporate services").text.includes("18 percentage points"));
assert(g.answer("Which dimension was lowest?").text.includes("44%"));
assert(g.answer("How many staff responded?").text.includes("229"));
const action=g.answer("Explain action 6");
assert(action.pages.includes(72));
assert(g.answer("Who is responsible?",action.context).text.includes("Heads of Division/Branch"));
assert(g.answer("What are the targets?",action.context).text.includes("20%"));
assert(g.answer("What is the score for finance communication?").text.includes("33%"));
assert(g.answer("Open PDF page 70").pages.includes(70));
assert.equal(g.answer("unrelated obscure question"),null);
assert(html.includes("guide-welcome-poster.jpg")&&html.includes("guide.js?v=31"));
console.log("PASS: guide grounding, comparisons, follow-ups, source links and portrait launcher");

const finance=g.answer("Tell me about Finance and Accounts");
assert(g.answer("Which dimension was lowest?",finance.context).text.includes("25%"));
const payment=g.answer("What was the payment score?");
assert(g.answer("What can we do about it?",payment.context).pages.includes(72));
const summary=g.answer("Give me the big picture");
assert(g.answer("Why was it so low?",summary.context).text.includes("does not establish a causal effect"));

// Analyst regression suite: direct questions and contextual follow-ups.
for(const [q,expected] of [["What was the overall score?","54%"],["Compare finance and corporate services","18 percentage points"],["Which dimension was lowest?","44%"],["How many staff responded?","229"],["What is the score for finance communication?","33%"],["What is the response rate?","69"],["What are the study limitations?","recall bias"],["What was the regression model?","−0.75"],["How many comments were positive?","15"],["Why was Health Infrastructure Planning excluded?","newly established"],["What does PMAS stand for?","Performance Management"],["What was the median?","3.5"],["Compare male and female satisfaction","65.5%"],["What is the gap between 54 and 65?","11 percentage"],["How many more favourable ratings to reach 65%?","126"],["What is the communication score across divisions?","74%"],["Compare finance and corporate communication","33%"],["Which divisions scored below 50%?","2 of eight"],["Give me an executive briefing","54%"],["What is the current score today?","does not establish"],["What should we monitor?","90%"],["What was the sample size?","332"],["What does the report say about procurement?","procurement"],["What was the average of divisions?","55.5%"],["Who complained?","cannot identify"],["What is the weather?","outside this report"]]) assert(g.answer(q)?.text.includes(expected),q);
for(const [first,q,expected] of [["Tell me about Finance and Accounts","Which dimension was lowest?","25%"],["What was the payment score?","What can we do about it?","Timeliness"],["Give me the big picture","Why was it so low?","does not establish a causal effect"],["Explain action 6","Who is responsible?","Heads of Division/Branch"],["Explain action 6","What are the targets?","20%"],["Compare finance and corporate services","Compare their communication scores","33%"],["What was the overall score?","Where did you get that?","report pages"]]) assert(g.answer(q,g.answer(first)?.context)?.text.includes(expected),first+" -> "+q);

for(const [q,expected] of [["How is CSAT calculated?","611"],["What does internal customer mean?","colleague"],["Open printed page 13","PDF page 26"],["What is ordinal logistic regression?","ordered outcomes"],["How many branches were rated?","25"],["Which dimensions were below 50%?","2 of five"],["Show Table 5","PDF page 30"],["How far is Finance from the 85% benchmark?","57 points"],["What was the median?","3.5"],["What is the average of divisions?","55.5%"]]) assert(g.answer(q)?.text.includes(expected),q);
for(const [first,q,expected] of [["What is the regression model?","What does this mean in practice?","does not prove"],["Tell me about Finance and Accounts","Which dimension was lowest?","25%"],["What was the payment score?","What can we do about it?","Timeliness"]]) assert(g.answer(q,g.answer(first)?.context)?.text.includes(expected),first+" -> "+q);

for(const [q,e] of [["Um, so, how much staff responded?","229"],["What was the see sat score?","54%"],["What was the sample size by division?","Corporate Services: 84"],["What was the sample size for NPHL?","89"],["When was the survey conducted?","20 January"],["How did Public Relations perform?","83%"],["What was the satisfaction by age group?","63.2%"],["Compare satisfaction by employment status","20/51"],["What was the regression coefficient for NPHL?","0.38"],["How many favourable ratings to reach 70%?","183"],["What if we had 100 more favourable ratings?","62.8%"],["How many ratings came from Corporate Services?","400"],["What is the communication gap for Finance compared to the Ministry average?","26 percentage points"],["Compare Finance and Corporate Services across all five dimensions","25%"],["Draft a response to a delayed request","Thank you for bringing"],["Create an SLA template","Illustrative internal service-level agreement"],["How can I handle a rude colleague?","acknowledge"],["What was the overall score and what were the study limitations?","recall bias"],["What are the data quality issues?","Focus-group sex counts"],["What is the difference between percentage points and relative increase?","20.4%"],["I am a manager","measurable improvements"],["Hi there","Glad you're here"],["What is the communciation score?","59%"]]) assert(g.answer(q)?.text.includes(e),q);
for(const [first,q,e] of [["Compare Finance and Corporate Services","Compare all five dimensions","25%"],["Compare Finance and Corporate Services","Where is the largest gap?","Communication"],["What was the satisfaction by age group?","What does that mean?","statistically significant"],["Start a practice quiz","B","That's right"],["What was the overall score?","repeat","54%"],["I am a manager","Give me a 90-day improvement plan","30 days"]]) assert(g.answer(q,g.answer(first)?.context)?.text.includes(e),first+" -> "+q);

vm.runInNewContext(fs.readFileSync("src/guide-voice.js","utf8"),sandbox);
const v=sandbox.window.ServiceGuideVoice;
let fake,events=[],transcript=[],sent=[],errors=[];
class FakeRecognition{constructor(){fake=this;}start(){this.onstart();}stop(){this.onend();}abort(){this.onend();}}
const ctl=v.createVoice({getRecognition:()=>FakeRecognition,onState:x=>events.push(x),onTranscript:x=>transcript.push(x),onSubmit:x=>sent.push(x),onError:x=>errors.push(x)});
assert(ctl.start({language:"en-JM",autoSend:true}));assert.equal(fake.lang,"en-JM");
fake.onresult({results:[{0:{transcript:"What was the score"},isFinal:true}]});fake.onend();
assert.equal(sent[0],"What was the score");assert(!ctl.active());
assert(ctl.start({autoSend:false}));fake.onresult({results:[{0:{transcript:"Hello"},isFinal:true}]});fake.onend();assert.equal(events.at(-1),"review");assert.equal(sent.length,1);
assert(ctl.start());ctl.cancel();assert(!ctl.active());assert.equal(sent.length,1);
assert(ctl.start());fake.onerror({error:"not-allowed"});fake.onend();assert(errors.at(-1).includes("denied"));
assert(reader.includes("guideMic")&&reader.includes("guideVoiceMode")&&html.includes("guide-voice.js?v=31"));
console.log("PASS: speech adapter, cancellation, transcript review and voice mode");

for(const [q,e] of [["What were the study objectives?","three objectives"],["What was HRMD's CSAT score?","36%"],["What was the sample size for NPHL?","89"],["What is the communciation score?","59%"],["What were the positive findings?","71%"],["What were the comments by division?","Corporate Services: 49 / 5 / 44"],["What is the difference between survey and focus groups?","complement"]]) assert(g.answer(q)?.text.includes(e),q);
for(const [first,q,e] of [["Tell me about Finance and Accounts","What does that mean?","25%"],["Give me the big picture","So what?","just over half"],["I am a manager","What is my role?","manager"],["Tell me about Finance and Accounts","What did we discuss?","Finance and Accounts"]]) assert(g.answer(q,g.answer(first)?.context)?.text.includes(e),first+" -> "+q);

let c1=g.answer("Tell me about Finance and Accounts").context;
let c2=g.answer("Tell me about Corporate Services",c1).context;
assert(g.answer("Return to the previous division",c2).text.includes("28%"));
const quiz=g.answer("Start a practice quiz");const right=g.answer("B",quiz.context);assert(g.answer("Next question",right.context).text.includes("Question 2"));
assert(errors.at(-1).includes("denied"));

for(const [q,e] of [["Rank the service dimensions","59%"],["Top 3 divisions","ties included"],["Which division had the highest communication score?","74%"],["What are the targets for each dimension?","12 points"],["Show the recommendations by year","FY 2026/2027"],["What would you prioritise?","44%"],["What is service excellence?","respectful support"],["We keep losing files. How can we prevent this?","approved records system"],["What can we do when salary payments are delayed?","Payment and administrative turnaround"],["What is the combined score for Corporate Services and Finance?","42.6%"],["How many ratings were not favourable?","522"],["How many divisions scored between 45% and 60%?","6 of 8"],["Compare Finance and Corporate Services on quality","14 percentage points"]]) assert(g.answer(q)?.text.toLowerCase().includes(e.toLowerCase()),q);
for(const [first,q,e] of [["What is the communication score for Finance?","What about Corporate Services?","53%"],["We keep losing files. How can we prevent this?","How should we measure improvement?","missing records"],["How do we deal with staff who never respond to emails?","What should I say?","Thank you for raising"],["What can we do when salary payments are delayed?","Who should lead this?","Heads of Division/Branch"]]) assert(g.answer(q,g.answer(first)?.context)?.text.toLowerCase().includes(e.toLowerCase()),first+" -> "+q);

vm.runInNewContext(fs.readFileSync("src/guide-speech.js","utf8"),sandbox);
const speech=sandbox.window.GuideSpeech;
const voices=[{name:"David",lang:"en-GB",voiceURI:"d"},{name:"Sonia Natural",lang:"en-GB",voiceURI:"s"},{name:"Generic",lang:"en-JM",voiceURI:"j"}];
assert.equal(speech.choose(voices).voiceURI,"s");assert.equal(speech.choose(voices,"j").voiceURI,"j");
assert(speech.verbalize("CSAT was 54%; 611/1133 ratings.").includes("54 percent"));
assert(speech.verbalize("611/1133").includes("611 out of 1133"));
assert(speech.spoken("A long answer. "+("Detailed explanation. ".repeat(35)),{brief:true}).includes("full details"));
let spoken=[],status=[];class U{constructor(text){this.text=text;}}
const player=speech.makePlayer({synth:{getVoices:()=>voices,cancel:()=>{},speak:u=>spoken.push(u)},Utterance:U,onState:s=>status.push(s)});
player.play("Hello. This is a voice test.",{rate:1.2});assert.equal(spoken[0].voice.voiceURI,"s");assert.equal(spoken[0].rate,1.2);player.stop();assert(!player.active());
assert(reader.includes("guideOutputVoice")&&reader.includes("guideVoicePreview")&&html.includes("guide-speech.js?v=31"));

for(const [q,e] of [["How do we deal with staff who never respond to emails?","realistic update date"],["Which divisions tied?","60%"],["Which dimensions tied?","59%"],["What share of ratings came from each division?","400 (35.3%)"],["Show the benchmark gap for all divisions","57 percentage points"],["Show the gap to 85% for all dimensions","41 percentage points"],["Why was communication rated high when focus groups reported problems?","Both findings can be true"],["What can we do about neutral ratings?","35%"],["How can we improve service with limited resources?","low-resource"],["What if 25% of non favourable ratings became favourable?","65.5%"],["What is the Government of Jamaica service excellence policy?","2022"],["What was the overall score and which divisions tied?","60%"]]) assert(g.answer(q)?.text.toLowerCase().includes(e.toLowerCase()),q);

assert(speech.chunks(speech.verbalize("The value was 3.5. The score was 54%." )).join(" ").includes("3.5"));
assert(speech.chunks("The value was 3.5. The score was 54 percent.").join(" ").includes("3.5"));
