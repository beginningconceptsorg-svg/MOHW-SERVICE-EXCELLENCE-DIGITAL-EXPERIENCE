/* Service Excellence in Action — interactive, aggregate-only prototype.
   Original PDF delivery is same-origin and permission-controlled; no device uploads are accepted.
   Browser-based narration is a provisional technology demo, NOT approved voice/video production. */
(function () {
"use strict";
var S=window.STUDY, main=document.getElementById("main"), modalRoot=document.getElementById("modalRoot");
if (!S || !main) return;
var names={dashboard:"Executive Dashboard",home:"Welcome",study:"The Study",results:"The Results",divisions:"By Division",voices:"What Staff Shared",action:"From Findings to Action",learn:"Learn & Improve",library:"Digital Report Library"};
var state={route:"home",dimension:0,division:0,openedAction:1,actionFilter:"all",scene:0,answer:-1,coverURL:null,pdfPage:1,installEvent:null,lastFocus:null,reading:false,voiceText:"",volume:1,muted:false,settings:{large:false,contrast:false,motion:false}};
var scenarios=[
 {title:"A request needs follow-up",question:"A colleague calls for an update on a pending internal request. You cannot provide an immediate decision. What is the best response?",
 options:["Avoid answering until the request is resolved.","Acknowledge the request, explain the next step and give a realistic update time.","Refer them elsewhere without explaining why."],correct:1,explanation:"Acknowledgment and realistic next steps improve communication and responsiveness. The scenario is an educational example, not an event quoted from the report."},
 {title:"Information is unclear",question:"Two colleagues receive different instructions for the same administrative process. What should happen next?",
 options:["Follow whichever instruction is faster.","Pause all work indefinitely.","Check the approved procedure, clarify the correct steps and help make them accessible to others."],correct:2,explanation:"Reliable, widely shared procedures help reduce inconsistent advice and rework."},
 {title:"A private staff matter",question:"A colleague shares sensitive payroll information while asking for help. What is the appropriate approach?",
 options:["Discuss it in a common staff area.","Use an approved confidential channel and share details only with authorised officers.","Forward the details to the entire unit for a quicker answer."],correct:1,explanation:"Treat employee information as confidential and use approved Ministry processes."},
 {title:"A recurring delay",question:"A service request is frequently delayed across several units. What is a constructive improvement?",
 options:["Document the hand-off steps and recommend clearer service timelines and escalation routes.","Assume the delays cannot change.","Publicly identify individual employees as responsible."],correct:0,explanation:"Process mapping, service-level standards and accountability mechanisms are among the report's proposed approaches."}
];
var questions=[
 {keys:["overall","54","satisfaction score"],answer:"The 2025 study reports an overall internal customer satisfaction score of 54%. This is a historical baseline, not current or live performance.",page:26},
 {keys:["lowest","weakest","payment","cost"],answer:"Cost and Payment Processes had the lowest service-dimension score at 44%, followed by Timeliness/Responsiveness at 48%.",page:26},
 {keys:["five","dimension","communication","access","quality"],answer:"The five dimensions and their 2025 CSAT scores were: Communication 59%; Access and Facilities 55%; Quality and Reliability 59%; Timeliness/Responsiveness 48%; and Cost and Payment Processes 44%.",page:26},
 {keys:["survey","sample","response","participant"],answer:"The survey sampling frame was 766 staff; 332 were selected, and 229 returned surveys. The report states a response rate of 68%, which is flagged for confirmation because 229 divided by 332 is approximately 69%.",page:19},
 {keys:["group","qualitative","staff","theme"],answer:"Ten focus groups involved 63 staff. Four overarching themes were service challenges; lack of standardised processes; inadequate communication; and supervisory or management challenges.",page:35},
 {keys:["division","executive","finance","rank"],answer:"The report's Table 2 gives Executive Management 71% and Finance and Accounts 28%. The eight divisional results reflect the 2025 study only, not current staff or departmental performance.",page:27},
 {keys:["recommend","improve","action","plan"],answer:"Appendix No. 5 outlines ten proposed workstreams, including internal service standards, training, feedback, document management, workflows, leadership, staff welfare, communication, and facilities. These are recommendations and future targets, not completed activities.",page:70},
 {keys:["director","humphrey","principal"],answer:"The report contains a message from Dr. Kimorley Humphrey, JP, Principal Director of the Enabling Environment in Health and Client Services Division, describing the research as a call to action.",page:5},
 {keys:["benchmark","85","target","65"],answer:"The report cites 85% as the Government of Jamaica's general service-excellence benchmark. Appendix No. 5 separately proposes improving internal CSAT from 54% to at least 65% within two survey cycles.",page:70}
];
function esc(x){return String(x==null?"":x).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function score(x){return "<strong>"+Number(x)+"%</strong>";}
function pct(x){return Math.max(0,Math.min(100,Number(x)||0))+"%";}
function source(page,text){return "<button type='button' class='source-link' data-page='"+page+"' aria-label='View original report, PDF page "+page+"'>"+esc(text||"Source: original report · PDF p. "+page)+" ↗</button>";}
function header(label,title,subtitle){return "<header class='page-header'><div><div class='eyebrow'>"+esc(label)+"</div><h1>"+esc(title)+"</h1><p>"+esc(subtitle)+"</p></div><span class='source-chip'>◉ &nbsp; 2025 historical study</span></header>";}
function progress(value,benchmark){return "<div class='progress-track' role='img' aria-label='"+value+" percent satisfaction"+(benchmark?", compared with an 85 percent benchmark":"")+"'><span style='width:"+pct(value)+"'></span>"+(benchmark?"<i class='benchmark' aria-hidden='true'></i>":"")+"</div>";}
function animateGuide(){return "<img class='guide-image authentic' src='"+esc(state.coverURL||"./assets/guide-portrait.svg")+"' alt='Original Internal Customer Satisfaction Study cover artwork' loading='eager'/>";}
function refreshWelcomeCover(){var im=document.querySelector(".hero-art .guide-image");if(im&&state.coverURL)im.src=state.coverURL;}
async function loadWelcomeCover(){if(state.coverURL)return;try{var response=await fetch("./docs/Internal_CSAT_Report_2025_Final.pdf");if(!response.ok)return;if(await extractEmbeddedCover(await response.blob()))refreshWelcomeCover();}catch(_e){}}

function reportYear(){return "Results reflect experiences studied in 2025; they are not current operational ratings.";}
function renderDashboard(){
 var d=S.dimensions[state.dimension], v=S.divisions[state.division], o=S.overall;
 var colors=["#087f78","#147e9c","#087f78","#b46b20","#b46b20"];
 return "<section class='intel' aria-label='Executive dashboard'><style>.intel{margin:24px 0;color:var(--ink,#12344a)}.intel *{box-sizing:border-box}.intel-head{background:linear-gradient(120deg,#092b4c,#126b70);color:white;padding:clamp(20px,4vw,38px);border-radius:22px;margin-bottom:16px}.intel-head h2{color:white;font-size:clamp(25px,4vw,40px);margin:8px 0}.intel-head p{color:#e0f1f2}.intel-kpis,.intel-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.intel-grid{grid-template-columns:1.2fr 1fr;margin-top:14px}.intel-card,.intel-kpi{background:#fff;color:#12344a;border:1px solid #dce7eb;border-radius:18px;padding:20px;box-shadow:0 5px 20px #12344a0b;min-width:0}.intel-kpi{display:block;text-decoration:none}.intel-kpi strong{display:block;font-size:clamp(28px,5vw,44px);line-height:1.2;color:#087f78}.intel-kpi small,.intel-card small{color:#526b79}.intel-card h3{margin:0 0 12px}.intel-bar{display:grid;grid-template-columns:minmax(0,1fr) 48px;gap:7px;width:100%;text-align:left;padding:10px;border:1px solid transparent;background:#f4f8fa;color:#12344a;border-radius:10px;margin:6px 0;cursor:pointer}.intel-bar[aria-pressed=true]{border-color:#087f78;background:#e3f3f1}.intel-track{grid-column:1/-1;height:8px;background:#dce7eb;border-radius:9px;overflow:hidden}.intel-track i{display:block;height:100%;border-radius:9px}.intel-detail{border-left:4px solid #087f78;padding:12px;background:#f2f8f8;border-radius:8px;margin-top:14px}.intel select{width:100%;padding:10px;border:1px solid #aabec8;border-radius:8px;background:white;color:#12344a}.intel-links{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}.intel a:focus-visible,.intel button:focus-visible,.intel select:focus-visible{outline:3px solid #bd831e;outline-offset:3px}.intel-gap{position:relative;height:18px;background:#e2e9ed;border-radius:12px;margin:16px 0}.intel-gap span{display:block;height:100%;background:#087f78;border-radius:12px}.intel-gap i{position:absolute;top:-4px;height:26px;width:3px;background:#b46b20}.intel-gap i:last-child{background:#092b4c}.intel .intel-kpi:hover{border-color:#087f78}.intel-card p{margin:8px 0}.intel-legend{display:flex;flex-wrap:wrap;gap:12px;font-size:13px}.intel-legend b{color:#087f78}@media(max-width:760px){.intel-grid{grid-template-columns:1fr}.intel-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.intel-card,.intel-kpi{padding:14px}}@media(max-width:340px){.intel-kpis{grid-template-columns:1fr}}</style>"+
 "<div class='intel-head'><div class='eyebrow light'>EXECUTIVE INTELLIGENCE / 2025 STUDY</div><h2>Evidence at a glance.</h2><p>Tap an indicator, select a service dimension or compare a division to reveal the evidence behind the numbers.</p></div>"+
 "<div class='intel-kpis'>"+[[o.score+'%','Overall satisfaction','results','2025 baseline'],[o.benchmark+'%','GOJ benchmark','results','General service standard'],[o.target+'%','Proposed target','action','Within two survey cycles'],[S.methodology.responded,'Survey respondents','study','332 selected'],[S.divisions.length,'Divisions assessed','divisions','Explore comparisons'],[S.actions.length,'Proposed workstreams','action','Explore recommendations']].map(function(k){return "<a class='intel-kpi' href='#/"+k[2]+"'><strong>"+k[0]+"</strong><b>"+k[1]+" ↗</b><br><small>"+k[3]+"</small></a>";}).join("")+"</div>"+
 "<div class='intel-grid'><article class='intel-card'><h3>Closing the satisfaction gap</h3><p><strong>"+(o.target-o.score)+" percentage points</strong> to the proposed target; "+(o.benchmark-o.score)+" to the general benchmark.</p><div class='intel-gap' role='img' aria-label='Baseline 54%, proposed target 65%, benchmark 85%'><span style='width:"+o.score+"%'></span><i style='left:"+o.target+"%'></i><i style='left:"+o.benchmark+"%'></i></div><div class='intel-legend'><b>● Baseline "+o.score+"%</b><span>│ Target "+o.target+"%</span><span>│ Benchmark "+o.benchmark+"%</span></div>"+source(26,"Original results")+" "+source(70,"Proposed target")+"</article>"+
 "<article class='intel-card'><h3>Where improvement is most needed</h3><strong style='font-size:2rem;color:#a65e18'>44%</strong><p>Cost and Payment Processes is the lowest-rated dimension, followed by Timeliness at 48%.</p><a href='#/action'>Explore proposed improvements ↗</a></article></div>"+
 "<div class='intel-grid'><article class='intel-card'><h3>Explore the five dimensions</h3><small>Tap a bar to reveal its interpretation.</small>"+S.dimensions.map(function(x,i){return "<button class='intel-bar' data-intel-dim='"+i+"' aria-pressed='"+(i===state.dimension)+"'><span>"+esc(x.name)+"</span><b>"+x.score+"%</b><span class='intel-track'><i style='width:"+x.score+"%;background:"+colors[i]+"'></i></span></button>";}).join("")+"<div class='intel-detail' aria-live='polite'><h3>"+esc(d.name)+" · "+d.score+"%</h3><p>"+esc(d.detail)+"</p><p>"+esc(d.insight)+"</p>"+source(26,"View original evidence")+"</div></article>"+
 "<article class='intel-card'><h3>Compare Ministry divisions</h3><label for='intelDivision'>Choose a division</label><select id='intelDivision'>"+S.divisions.map(function(x,i){return "<option value='"+i+"' "+(i===state.division?"selected":"")+">"+esc(x.name)+" · "+x.score+"%</option>";}).join("")+"</select><div class='intel-detail' aria-live='polite'><h3>"+esc(v.name)+" · "+v.score+"%</h3><small>"+v.agree+" satisfied ratings / "+v.ratings+" ratings</small>"+S.dimensions.map(function(x,i){return "<div style='margin:10px 0'><span>"+esc(x.short)+"</span> <b style='float:right'>"+v.dimensions[i]+"%</b><div class='intel-track'><i style='width:"+v.dimensions[i]+"%;background:"+colors[i]+"'></i></div></div>";}).join("")+source(28,"View original table")+"</div><a href='#/divisions'>Explore all divisions ↗</a></article></div>"+
 "<div class='intel-links'><a class='btn btn-accent' href='#/voices'>Staff experiences ↗</a><a class='btn btn-outline' href='#/action'>Improvement roadmap ↗</a><a class='btn btn-outline' href='#/library'>Read original report ↗</a></div><p class='small'>Historical research findings, not live operational performance. Report-defined targets are not achieved results. Data reconciliation notes remain in the detailed study views.</p></section>";
}
function renderCommand(){
return "<div class='page'><style>.command-hero{background:linear-gradient(125deg,#081e38,#126e75);color:white;padding:clamp(24px,5vw,60px);border-radius:24px}.command-hero h1{color:white;font-size:clamp(36px,6vw,70px);line-height:1.05}.command-hero strong{font-size:clamp(70px,12vw,130px);color:#b7f5df;line-height:1}.matrix-wrap{overflow:auto;background:white;padding:16px;border-radius:18px}.matrix{min-width:650px;width:100%;border-spacing:5px}.matrix th{text-align:left;font-size:12px;color:#17364a}.matrix button{width:100%;padding:14px 6px;border:0;border-radius:8px;color:#12344a;font-weight:800;cursor:pointer}.roadmap{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px}.roadmap details{background:white;color:#17364a;border:1px solid #dce5eb;padding:18px;border-radius:14px}.roadmap summary{cursor:pointer;font-weight:800}</style><section class='command-hero'><div class='eyebrow light'>SERVICE EXCELLENCE OBSERVATORY / 2025</div><h1>From evidence to better service.</h1><strong>"+S.overall.score+"%</strong><p>Overall internal satisfaction · historical study baseline</p><a class='btn btn-white' href='#/home'>Watch the welcome ↗</a></section>"+renderDashboard()+"<section class='chart-wrap'><h2>Service performance matrix</h2><p>Select any cell to explore the underlying evidence. Scroll sideways on smaller screens.</p><div class='matrix-wrap'><table class='matrix'><thead><tr><th>Division</th>"+S.dimensions.map(function(d){return "<th>"+esc(d.short)+"</th>";}).join("")+"</tr></thead><tbody>"+S.divisions.map(function(v,i){return "<tr><th>"+esc(v.name)+"</th>"+v.dimensions.map(function(n,j){return "<td><button data-matrix='"+i+","+j+"' style='background:"+(n<40?"#f6c8ba":n<50?"#f7dfb3":n<60?"#e9ebc4":n<70?"#bce4d8":"#80c9bc")+"'>"+n+"%</button></td>";}).join("")+"</tr>";}).join("")+"</tbody></table></div><p class='small'>Colour bands are editorial, not official performance categories. "+source(28,"Original Table 3")+"</p></section><div class='hero-actions'><a class='btn btn-primary' href='#/action'>Explore the improvement roadmap ↗</a></div></div>";
}
function renderHome(){
return "<div class='page home-page'><style>.welcome-stage{background:#092b4c;color:white;border-radius:24px;overflow:hidden;padding:clamp(20px,4vw,48px)}.welcome-stage h1{color:white;font-size:clamp(36px,6vw,72px);line-height:1.04;letter-spacing:-.045em;margin:12px 0}.welcome-stage p{color:#dcebed;max-width:680px}.welcome-stage .guide-film{margin:24px auto 12px;max-width:1050px;background:#071a2a;border-radius:16px;overflow:hidden}.welcome-stage video{display:block;width:100%;height:auto;max-height:70vh;object-fit:contain}.journey-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;margin:24px 0}.journey-grid a{display:block;background:white;color:#092b4c;border:1px solid #dce6eb;border-radius:18px;padding:24px;text-decoration:none}.journey-grid a:hover{border-color:#087f78;transform:translateY(-2px)}.journey-grid strong{font-size:24px;display:block;margin:12px 0}.journey-grid small{color:#087f78;font-weight:800}.section-switch{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 20px;padding:12px;background:#e9f1f4;border-radius:14px}.section-switch a{padding:10px 15px;border-radius:10px;color:#092b4c;text-decoration:none;font-weight:700}.section-switch a[aria-current]{background:#092b4c;color:white}</style><section class='welcome-stage'><div class='eyebrow light'>MINISTRY OF HEALTH & WELLNESS · 2025 STUDY</div><h1>Better service begins within.</h1><p>Meet your digital guide and discover how staff experiences can shape a better Ministry.</p><section class='guide-film' aria-label='Welcome video'><video id='studioWelcomeVideo' playsinline muted controls preload='metadata' poster='./assets/video/guide-welcome-poster.jpg'><source src='./assets/video/guide-welcome.mp4' type='video/mp4'/>Your browser cannot play this video.</video></section><div class='hero-actions'><button class='btn btn-white' data-video-play>▶ Play with sound</button><a class='btn btn-primary' href='#/dashboard'>Explore the study ↗</a></div></section><div class='section-head'><h2>Choose your journey.</h2></div><div class='journey-grid'><a href='#/dashboard'><small>01 / EXPLORE</small><strong>Understand the evidence.</strong><p>Interactive findings, division comparisons and staff experiences.</p>Explore findings ↗</a><a href='#/action'><small>02 / IMPROVE</small><strong>Turn insight into action.</strong><p>Proposed workstreams and practical learning activities.</p>Explore improvements ↗</a><a href='#/library'><small>03 / LIBRARY</small><strong>Read the original report.</strong><p>All 74 pages in the digital reader.</p>Open publication ↗</a></div><p class='lead-note'>Internal development preview · Historical 2025 study, not live performance.</p></div>";
}
function sectionSwitch(route){var explore=["dashboard","results","divisions","voices","study"],improve=["action","learn"],group=explore.indexOf(route)>=0?explore:improve.indexOf(route)>=0?improve:[];var labels={dashboard:"Overview",results:"Service dimensions",divisions:"Division comparison",voices:"Staff experiences",study:"Study methods",action:"Improvement roadmap",learn:"Practice & learn"};return group.length?"<nav aria-label='Explore this section' class='section-switch' style='display:flex;flex-wrap:wrap;gap:8px;padding:12px;margin:12px 0 20px;background:#e9f1f4;border-radius:14px'>"+group.map(function(k){return "<a href='#/"+k+"' "+(k===route?"aria-current='page'":"")+" style='padding:10px 14px;border-radius:9px;text-decoration:none;font-weight:700;background:"+(k===route?"#092b4c;color:white":"transparent;color:#092b4c")+"'>"+labels[k]+"</a>";}).join("")+"</nav>":"";}
function renderStudy(){
 var m=S.methodology;
 return "<div class='page'>"+header("01 / THE RESEARCH","Behind the study","An evidence-led view of how Ministry staff experienced internal services, using survey ratings and moderated focus groups.")+
 "<div class='methodology-band'><article class='method-card'><div class='eyebrow'>QUANTITATIVE / SURVEY</div><strong>"+m.responded+"</strong><h3>Completed surveys</h3><p>"+m.selected+" staff were selected from a sampling frame of "+m.frame+". Data were collected "+m.surveyPeriod+".</p>"+source(19,"Methods · printed p. 6")+"</article>"+
 "<article class='method-card alt'><div class='eyebrow'>QUALITATIVE / FOCUS GROUPS</div><strong>"+m.fgdParticipants+"</strong><h3>Staff in 10 discussions</h3><p>Purposefully recruited participants shared experiences across multiple divisions, job categories and lengths of service.</p>"+source(21,"Focus-group methods · printed p. 8")+"</article></div>"+
 "<div class='section-head'><div><div class='eyebrow'>THE STUDY JOURNEY</div><h2>How evidence was gathered</h2></div></div>"+
 "<div class='process-line'><span>766 staff in PMAS</span><b>→</b><span>332 selected</span><b>→</b><span>229 survey responses</span><b>+</b><span>10 focus groups / 63 staff</span></div>"+
 "<div class='mosaic'>"+
 "<div class='mosaic-cell'><div class='step-num'>METHOD 01</div><h3>Stratified sampling</h3><p>The survey included a selected sample of "+m.sampledSupervisors+" supervisors and "+m.sampledNonSupervisors+" non-supervisors.</p></div>"+
 "<div class='mosaic-cell'><div class='step-num'>METHOD 02</div><h3>Five dimensions</h3><p>Communication, access, quality, timeliness, and cost/payment were assessed using the Government of Jamaica's service standards.</p></div>"+
 "<div class='mosaic-cell'><div class='step-num'>METHOD 03</div><h3>Two perspectives</h3><p>Quantitative ratings were analysed alongside staff feedback to identify not only scores, but experiences behind them.</p></div></div>"+
 "<div class='section-head'><div><div class='eyebrow'>KEY DISTINCTIONS</div><h2>What the numbers mean</h2></div></div>"+
 "<div class='overview-strip'><div class='overview-stat'><strong>766</strong><span>Sampling frame</span><small>Staff on the PMAS list</small></div><div class='overview-stat'><strong>332</strong><span>Selected sample</span><small>Not all responded</small></div><div class='overview-stat'><strong>229</strong><span>Survey participants</span><small>Completed surveys</small></div><div class='overview-stat'><strong>1,133</strong><span>Service ratings</span><small>Across reported interactions</small></div></div>"+
 "<p class='lead-note'><strong>Data verification:</strong> The report states a 68% response rate. The calculation 229 ÷ 332 gives approximately 69.0%; both figures are shown for transparency pending research-team clarification. Counts of respondents and service ratings are not interchangeable.</p>"+
 "<div class='source-box'>The methods are described in the original report on printed pp. 6–8 (PDF pp. 19–21). Study limitations include potential response and recall bias. "+source(55,"See strengths and limitations")+"</div></div>";
}
function dimensionRows(){
 return S.dimensions.map(function(d,i){return "<button type='button' class='dimension-row"+(i===state.dimension?" selected":"")+"' data-dim='"+i+"' aria-pressed='"+(i===state.dimension)+"'><span class='dimension-name'>"+esc(d.short)+"</span>"+progress(d.score,false)+score(d.score)+"</button>";}).join("");
}
function renderResults(){
 var d=S.dimensions[state.dimension], all=S.dimensions;
 return "<div class='page'>"+header("02 / WHAT THE NUMBERS SAY","The findings, made visible","Interact with the 2025 customer satisfaction results and examine the areas where the study identified opportunities to improve.")+
 "<div class='two-col'><section class='big-score-panel'><div><div class='eyebrow'>OVERALL INTERNAL CSAT</div><strong>54%</strong><small>2025 survey baseline · 611 satisfied ratings out of 1,133 ratings</small></div><p>The Government of Jamaica's general service-excellence benchmark is 85%. The report proposes a separate staged target of at least 65% within two survey cycles.</p></section>"+
 "<section class='chart-wrap'><h3>Baseline versus benchmark</h3><p class='small'>A historical comparison — not a live progress tracker.</p><div class='ruler'><span>0%</span><span>85% GOJ benchmark</span><span>100%</span></div>"+progress(54,true)+
 "<div style='display:flex;justify-content:space-between;gap:10px;margin-top:19px'><div><div class='mini-label'>REPORTED BASELINE</div><strong style='font:800 2rem Manrope'>54%</strong></div><div><div class='mini-label'>APPENDIX TARGET</div><strong style='font:800 2rem Manrope'>≥65%</strong></div></div>"+
 "<p class='small' style='margin-top:20px'>The 65% value is a recommended future outcome, not an achievement. "+source(70,"Appendix No. 5")+"</p></section></div>"+
 "<div class='section-head'><div><div class='eyebrow'>THE FIVE SERVICE DIMENSIONS</div><h2>Select a dimension to explore.</h2></div><p>Every chart label is backed by the original Figure 8 and Table 3.</p></div>"+
 "<div class='two-col'><section class='chart-wrap' aria-label='Five service dimension satisfaction scores'><div class='mini-label'>CSAT BY DIMENSION / 2025</div>"+dimensionRows()+
 "<div class='mini-legend'><span><i></i> Reported satisfaction</span><span>All scores are percentages of rated service responses</span></div></section>"+
 "<aside class='detail-panel' aria-live='polite'><div class='eyebrow'>DIMENSION "+String(state.dimension+1).padStart(2,"0")+" / 05</div><div class='metric-disc'>"+d.score+"<small>%</small></div><h3>"+esc(d.name)+"</h3><p>"+esc(d.detail)+"</p><p><strong>What the study suggests:</strong> "+esc(d.insight)+"</p><div style='margin-top:auto'>"+source(26,"Figure 8 · printed p. 13")+"</div></aside></div>"+
 "<div class='lead-note'><strong>Read with context:</strong> Communication and Quality & Reliability have the highest reported scores at 59%, but the focus-group findings also raised serious communication concerns. A higher score here does not mean that communication problems were absent.</div>"+
 "<div class='source-box'>Published study: Ministry of Health and Wellness, Internal Customer Satisfaction Study Report (2025 study; 2026 cover). "+source(28,"Table 3 · printed p. 15")+"</div></div>";
}
function divisionButtons(){return S.divisions.map(function(d,i){return "<button type='button' class='division-button"+(i===state.division?" selected":"")+"' data-division='"+i+"' aria-pressed='"+(i===state.division)+"'><span>"+esc(d.name)+"</span><strong>"+d.score+"%</strong><span class='bar'><i style='width:"+pct(d.score)+"'></i></span></button>";}).join("");}
function renderDivisions(){
 var d=S.divisions[state.division];
 return "<div class='page'>"+header("03 / EIGHT DIVISIONS","Understanding the variation","The report assessed experiences with eight Ministry divisions. Compare historical scores to identify needs, not to judge current teams.")+
 "<div class='division-layout'><section class='division-list' aria-label='Select a division'>"+divisionButtons()+"</section>"+
 "<section class='division-detail' aria-live='polite'><div class='eyebrow'>SELECTED DIVISION / 2025 STUDY</div><h3>"+esc(d.name)+"</h3><div class='large-value'>"+d.score+"%</div><p>"+d.agree+" satisfied ratings across "+d.ratings+" service ratings in Table 2. Select another division to compare.</p>"+
 "<div class='detail-score-list'>"+S.dimensions.map(function(dim,i){return "<div><span>"+esc(dim.short)+"</span><b>"+d.dimensions[i]+"%</b><i style='--score:"+pct(d.dimensions[i])+"'></i></div>";}).join("")+"</div>"+
 "<p class='small'>Results are historic survey findings. All figures are reproduced from the published table.</p>"+source(28,"Table 3 · printed p. 15")+"</section></div>"+
 "<div class='section-head'><div><div class='eyebrow'>RESEARCH CONTEXT</div><h2>Use comparisons responsibly.</h2></div></div>"+
 "<div class='mosaic'><div class='mosaic-cell'><div class='step-num'>01 / TIME</div><h3>Historical baseline</h3><p>These are study-period results, not current divisional KPIs or updates on recommended actions.</p></div><div class='mosaic-cell'><div class='step-num'>02 / VOLUME</div><h3>Ratings differ</h3><p>Numbers of service ratings vary greatly across divisions; scores alone do not describe the full service experience.</p></div><div class='mosaic-cell'><div class='step-num'>03 / PRACTICE</div><h3>Improvement-oriented</h3><p>The findings can inform targeted service standards, training, process reviews and future assessment.</p></div></div>"+
 "<p class='lead-note'><strong>Research-team verification needed:</strong> Figure 5's interaction proportions do not reconcile with the totals in Table 2. This interface uses Table 2 and Table 3 for reported satisfaction; it does not display the disputed Figure 5 distribution.</p>"+
 "<div class='source-box'>Divisional scores and their five service dimensions: "+source(27,"Table 2 · printed p. 14")+" &nbsp; "+source(28,"Table 3 · printed p. 15")+"</div></div>";
}
function renderVoices(){
 return "<div class='page'>"+header("04 / THE HUMAN EXPERIENCE","What staff shared","The focus-group component helps explain the experiences behind the ratings — including examples of good service as well as reported barriers.")+
 "<div class='quote-policy'><div class='eyebrow light'>PRIVACY BY DESIGN</div><h3>Research voices, handled respectfully.</h3><p>Ten focus groups involved 63 staff members. This prototype uses thematic summaries only; it does not republish identifiable, sensitive or unapproved focus-group quotations from the internal report.</p></div>"+
 "<div class='section-head'><div><div class='eyebrow'>FOUR OVERARCHING THEMES</div><h2>Listen to what matters.</h2></div><p>Each theme leads to practical improvement opportunities considered in the study.</p></div>"+
 "<div class='theme-scroller'>"+S.themes.map(function(t){return "<article class='theme-card'><span class='n' aria-hidden='true'>"+t.n+"</span><span class='eyebrow'>KEY FINDING "+t.n+"</span><h3>"+esc(t.title)+"</h3><p>"+esc(t.summary)+"</p><div class='response'><strong>Improvement opportunity</strong><br>"+esc(t.response)+"<div style='margin-top:10px'>"+source(t.page,"Key finding · printed p. "+t.printed)+"</div></div></article>";}).join("")+"</div>"+
 "<div class='source-box'><strong>Important finding:</strong> The report notes that survey respondents rated Communication among the stronger dimensions, while focus-group participants described communication as a major source of service difficulty. The two types of evidence should be read together. "+source(54,"Discussion · printed p. 41")+"</div></div>";
}
function actionItems(){
 var filtered=S.actions.filter(function(a){if(state.actionFilter==="all")return true;if(state.actionFilter==="soon")return a.period.indexOf("2026")>-1;return a.period.indexOf("2027")>-1 || a.period.indexOf("2028")>-1 || a.period.indexOf("2029")>-1;});
 return filtered.map(function(a){
 var open=state.openedAction===a.id;
 return "<article class='action-item"+(open?" open":"")+"'><button type='button' class='action-trigger' data-action='"+a.id+"' aria-expanded='"+open+"'><span class='action-index'>"+String(a.id).padStart(2,"0")+"</span><span><h3>"+esc(a.title)+"</h3><span class='action-mini'>"+esc(a.owner)+"</span></span><span class='period-tag'>"+esc(a.period)+"</span><span class='action-chevron' aria-hidden='true'>+</span></button>"+
 (open?"<div class='action-body'><div class='action-topline'><p><strong>Original recommendation:</strong> "+esc(a.official)+"</p>"+source(a.page,"Table 8 · PDF p. "+a.page)+"</div>"+
 "<div class='action-columns'><div><h4>Service gap and impact</h4><p class='small'>"+esc(a.gap)+" "+esc(a.impact)+"</p><h4>Proposed implementation activities</h4><ul>"+a.steps.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div>"+
 "<div><div class='targets'><h4>Report-defined outcome indicators</h4><ul>"+a.indicators.map(function(x){return "<li>"+esc(x)+"</li>";}).join("")+"</ul></div><p class='small' style='margin-top:13px'><strong>Responsible office:</strong> "+esc(a.owner)+"<br><strong>Original period:</strong> "+esc(a.period)+"</p></div></div>"+
 "<div class='lead-note'>Proposed actions and targets from the original report. No implementation status or achievement is claimed.</div></div>":"")+"</article>";
 }).join("");
}
function renderActions(){
 return "<div class='page'>"+header("05 / FINDINGS TO ACTION","A roadmap for service excellence","Appendix No. 5 turns the evidence into ten proposed workstreams. Explore original responsibilities, timing and measurable outcomes.")+
 "<div class='two-col'><div class='big-score-panel'><div class='eyebrow'>A STAGED IMPROVEMENT TARGET</div><strong>≥65%</strong><small>Proposed internal CSAT within two survey cycles</small><p>The general GOJ service benchmark is 85%. The report's Appendix 5 sets a more modest staged target and additional operational indicators.</p></div>"+
 "<div class='chart-wrap'><div class='eyebrow'>THE ACTION FRAMEWORK</div><h3 style='margin:10px 0 15px'>10 original workstreams</h3><p>These priorities span service standards, staff development, feedback, document control, cross-divisional processes, leadership, wellbeing, communication and facilities.</p><p class='small'><strong>Status:</strong> Recommendations in the 2026 publication. This is not a live implementation-management system.</p>"+source(70,"Appendix 5 · printed pp. 57–61")+"</div></div>"+
 "<div class='action-toolbar'><label for='filterAction'>Explore by proposed period</label><select class='select-control' id='filterAction'><option value='all'"+(state.actionFilter==="all"?" selected":"")+">All ten workstreams</option><option value='soon'"+(state.actionFilter==="soon"?" selected":"")+">Includes FY 2026/2027</option><option value='later'"+(state.actionFilter==="later"?" selected":"")+">Includes FY 2027 onward</option></select><span class='action-count'>TAP A WORKSTREAM TO EXPAND</span></div>"+
 "<div class='action-list'>"+actionItems()+"</div>"+
 "<div class='source-box'><strong>Editorial note:</strong> The report's narrative summary groups recommendations into nine headings; expanded Table 8 uses ten numbered workstreams. This view follows Table 8's original numbering, without treating targets as completed outcomes.</div></div>";
}
function renderLearn(){
 var q=scenarios[state.scene],answered=state.answer>=0,correct=state.answer===q.correct;
 return "<div class='page'>"+header("06 / PRACTICAL LEARNING","Small moments. Better service.","Use short practice scenarios inspired by the research themes. These are new educational examples — not interviews or official Ministry training.")+
 "<div class='learning-stage'><section class='learning-main'><div class='progress-dots'>"+scenarios.map(function(_,i){return "<i class='"+(i<=state.scene?"filled":"")+"' aria-label='Step "+(i+1)+" of "+scenarios.length+"'></i>";}).join("")+"</div>"+
 "<div class='scenario-label'>PRACTICE SCENARIO "+(state.scene+1)+" OF "+scenarios.length+"</div><h2 style='font-size:2.1rem;margin:10px 0'>"+esc(q.title)+"</h2><p class='scenario-prompt'>"+esc(q.question)+"</p>"+
 "<div class='choice-list'>"+q.options.map(function(o,i){return "<button class='choice"+(answered && state.answer===i?" selected":"")+"' type='button' data-choice='"+i+"' aria-pressed='"+(state.answer===i)+"'><span class='letter'>"+String.fromCharCode(65+i)+"</span><span>"+esc(o)+"</span></button>";}).join("")+"</div>"+
 (answered?"<div class='feedback"+(correct?"":" caution")+"' role='status'><strong>"+(correct?"Good choice.":"Consider a stronger response.")+"</strong> "+esc(q.explanation)+"</div>":"")+
 "<div style='display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:25px'><button type='button' class='btn btn-outline btn-sm' id='prevScene'"+(state.scene===0?" disabled":"")+">← Previous</button><button type='button' class='btn btn-accent btn-sm' id='nextScene'>"+(state.scene===scenarios.length-1?"Restart practice":"Next scenario →")+"</button></div></section>"+
 "<aside class='learning-side'><span class='tip' aria-hidden='true'>✧</span><div class='eyebrow'>THE SERVICE MINDSET</div><h3>Good service is often a small, deliberate choice.</h3><p>Clear updates, respectful conversations, reliable procedures and confidential handling all help colleagues do their work well.</p>"+
 "<div style='margin-top:auto'>"+source(52,"Research discussion · printed p. 39")+"<p class='small' style='margin-top:14px'>This experience is for reflection only. No official certification is issued.</p></div></aside></div></div>";
}
function renderLibrary(){
 return "<div class='page'>"+header("07 / ORIGINAL SOURCE","The digital report library","The complete 74-page research publication belongs inside the experience. Read the original pages in a book-style viewer with swish sounds, zoom, search, narration and downloads where access is authorised.")+
 "<div class='reader-layout'><aside class='reader-toc'><h3>Report contents</h3><div class='mini-label' style='padding:0 12px 11px'>PDF PAGE / PRINTED PAGE</div>"+S.chapters.map(function(ch){return "<button type='button' class='toc-button"+(state.pdfPage===ch.page?" selected":"")+"' data-page='"+ch.page+"'><span>"+esc(ch.name)+"</span><small>"+ch.page+" / "+esc(ch.printed)+"</small></button>";}).join("")+"</aside>"+
 "<section class='reader-viewer' aria-label='Original research publication reader'><div id='readerMount'></div></section></div>"+
 "<div class='source-box'><strong>Reading guidance:</strong> There is no PDF upload option. The original publication is opened automatically from an authorised same-origin source. PDF page 26 corresponds to printed page 13 and Appendix No. 5 begins at PDF page 70 / printed page 57. Reader tools provide narration, text search, page sound, full screen, view original and download when enabled.</div>"+
 "<div class='section-head'><div><div class='eyebrow'>ACKNOWLEDGEMENTS</div><h2>Preserving research authorship.</h2></div></div>"+
 "<div class='attribution'><div><h4>Institutional publisher</h4><p class='small'>Ministry of Health and Wellness, Jamaica · Enabling Environment in Health and Client Services Division.</p><p class='small'>Principal Director's message: Dr. Kimorley Humphrey, JP.</p></div><div><h4>Research contributions</h4><p class='small'>Customer Service Branch; Research, Monitoring and Evaluation Branch; independent facilitation support. The original research team is fully acknowledged in the PDF on preliminary page vi (PDF page 7).</p></div></div>"+
 "<div class='credit-block'>Development preview built by <a href='https://beginningconcepts.org/' rel='noopener noreferrer' target='_blank'>Beginning Concepts</a>. Digital product concept subject to Ministry approval. The original report remains the authoritative research publication.</div></div>";
}
function initStudioVideo(){
 var video=document.getElementById("studioWelcomeVideo");
 if(!video)return;
 video.addEventListener("volumechange",function(){if(!video.muted)video.loop=false;});
 var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(!reduce&&!state.settings.motion){
  video.muted=true;
  video.loop=true;
  var playPromise=video.play();
  if(playPromise&&playPromise.catch)playPromise.catch(function(){});
 }
}
function render(){
 var route=(location.hash.match(/^#\/(dashboard|home|study|results|divisions|voices|action|learn|library)/)||[])[1]||"home";
 var changed=route!==state.route; state.route=route;
 var views={dashboard:renderCommand,home:renderHome,study:renderStudy,results:renderResults,divisions:renderDivisions,voices:renderVoices,action:renderActions,learn:renderLearn,library:renderLibrary};
 if(window.ServiceReader)window.ServiceReader.unmount();
 main.innerHTML=sectionSwitch(route)+views[route]();
 if(route==="home")initStudioVideo();
 if(route==="library"&&window.ServiceReader)window.ServiceReader.mount(document.getElementById("readerMount"),state.pdfPage);
 document.title=names[route]+" | Service Excellence in Action";
 Array.prototype.forEach.call(document.querySelectorAll("[data-route]"),function(a){var group=["dashboard","results","divisions","voices","study"].indexOf(route)>=0?"dashboard":route==="learn"?"action":route;var on=a.getAttribute("data-route")===group;a.classList.toggle("active",on);if(on){a.setAttribute("aria-current","page");}else{a.removeAttribute("aria-current");}});
 if(changed){window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});closeNav();}
}
function toast(text){var e=document.getElementById("toast");e.textContent=text;clearTimeout(toast.timer);toast.timer=setTimeout(function(){e.textContent="";},4500);}
function closeNav(){document.getElementById("sideRail").classList.remove("open");document.getElementById("menuToggle").setAttribute("aria-expanded","false");}
function modal(markup){state.lastFocus=document.activeElement;modalRoot.innerHTML="<div class='modal-backdrop' id='modalBackdrop'><div class='modal' role='dialog' aria-modal='true' aria-labelledby='dialogTitle'><button type='button' class='modal-close' id='closeDialog' aria-label='Close dialog'>×</button>"+markup+"</div></div>";document.getElementById("closeDialog").focus();}
function closeModal(){modalRoot.innerHTML="";if(state.lastFocus && state.lastFocus.focus)state.lastFocus.focus();}
function sourceOpen(page){state.pdfPage=Math.min(74,Math.max(1,page||1));if(state.route==="library"&&window.ServiceReader){window.ServiceReader.goTo(state.pdfPage);return;}location.hash="#/library";}
var guideMessages=[];
function guideLine(who,text,page){
 var guide=who==="guide";
 return "<div class='guide-line "+(guide?"from-guide":"from-visitor")+"'>"+
  (guide?"<img src='./assets/guide-portrait.svg' alt='' class='guide-line-avatar' loading='lazy'/>":"")+
  "<div class='guide-bubble'><p>"+esc(text)+"</p>"+(guide&&page?source(page,"Verify in report · PDF p. "+page):"")+"</div></div>";
}
function renderGuideConversation(){
 var root=document.getElementById("guideConversation");if(!root)return;
 var html=guideLine("guide","Hello! I'm your Service Excellence Guide. I can help you explore verified findings, proposed actions and source pages from the Ministry's 2025 Internal Customer Satisfaction Study.",null);
 guideMessages.forEach(function(m){html+=guideLine(m.who,m.text,m.page);});
 root.innerHTML=html;root.scrollTop=root.scrollHeight;
}
function openAsk(){
 modal("<div class='guide-dialog-head'><img src='./assets/guide-portrait.svg' alt='The Service Excellence Guide from the study cover'/><div><div class='eyebrow'>YOUR STUDY COMPANION</div><h2 id='dialogTitle'>Ask the Service Excellence Guide</h2><span class='guide-status'><i aria-hidden='true'></i> Report-grounded preview</span></div></div>"+
  "<div id='guideConversation' class='guide-conversation' role='log' aria-label='Guide conversation' aria-live='polite' aria-relevant='additions text'></div>"+
  "<div class='suggested-questions guide-suggestions' aria-label='Suggested questions'><button type='button' data-question='What was the overall score?'>2025 overall score</button><button type='button' data-question='Which area scored lowest?'>Lowest-rated area</button><button type='button' data-question='What are the recommendations?'>Recommended actions</button></div>"+
  "<form id='askForm' class='guide-compose'><label for='askInput' class='mini-label'>YOUR QUESTION</label><div class='guide-compose-row'><input id='askInput' type='text' required maxlength='300' autocomplete='off' placeholder='Ask about the 2025 report…' aria-label='Ask the study guide'/><button class='btn btn-accent' type='submit'>Send <span aria-hidden='true'>➤</span></button></div></form>"+
  "<p class='guide-privacy'>Answers come from pre-verified report summaries, not a live generative AI model. Do not enter names, private employment details or confidential information. Questions stay in this browser session.</p>");
 renderGuideConversation();
}
function answerQuestion(q){
 q=String(q||"").trim();if(!q)return;
 var x=q.toLowerCase(),best=null,bestN=0;
 questions.forEach(function(item){var n=item.keys.reduce(function(a,k){return a+(x.indexOf(k)>=0?1:0);},0);if(n>bestN){best=item;bestN=n;}});
 var response=best?best.answer:"I cannot confirm an answer to that from the verified information currently included in this preview. Please consult the original report or an authorised research-team member.";
 guideMessages.push({who:"visitor",text:q,page:null},{who:"guide",text:response,page:best?best.page:null});
 if(guideMessages.length>24)guideMessages.splice(0,2);
 renderGuideConversation();
 var input=document.getElementById("askInput");if(input){input.value="";input.focus();}
}
function openSettings(){
 modal("<div class='eyebrow'>DISPLAY PREFERENCES</div><h2 id='dialogTitle'>Make this experience yours</h2><p>These settings affect the prototype interface on this device. They are not a substitute for accessibility testing.</p>"+
 "<label class='check-row'>Larger text<input type='checkbox' id='largeToggle' "+(state.settings.large?"checked":"")+"></label>"+
 "<label class='check-row'>Higher contrast<input type='checkbox' id='contrastToggle' "+(state.settings.contrast?"checked":"")+"></label>"+
 "<label class='check-row'>Reduce animations<input type='checkbox' id='motionToggle' "+(state.settings.motion?"checked":"")+"></label>"+
 "<div class='form-actions'><button class='btn btn-accent' id='savePrefs' type='button'>Save preferences</button><button class='btn btn-outline' data-close type='button'>Close</button></div>");
}
function applyPrefs(){document.body.classList.toggle("large-text",state.settings.large);document.body.classList.toggle("contrast",state.settings.contrast);document.body.classList.toggle("no-motion",state.settings.motion);}
function openShare(){
 var url=location.href.split("#")[0]+"#/home";
 var src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data="+encodeURIComponent(url);
 modal("<div class='eyebrow'>SHARE THE EXPERIENCE</div><h2 id='dialogTitle'>Share the preview</h2><p>Share a link to this prototype when it is hosted at an authorised location. This does not mean the full internal report is publicly available.</p>"+
 "<input type='text' id='shareLink' readonly value='"+esc(url)+"' aria-label='Application link'><div class='form-actions'><button class='btn btn-accent' type='button' id='copyLink'>Copy link</button><button class='btn btn-outline' type='button' id='nativeShare'>Share on device</button></div>"+
 "<div style='text-align:center;margin:10px 0'><img src='"+esc(src)+"' alt='QR code pointing to the application link' width='210' height='210' loading='lazy' onerror='this.style.display=\"none\";this.nextElementSibling.textContent=\"QR preview requires an internet connection.\"'><p class='small'>QR generation uses an external service, sharing only this public link.</p><button class='btn btn-outline btn-sm' id='downloadQR' type='button'>Download QR image</button></div>");
}
function installInstructions(){
 var ios=/iphone|ipad|ipod/i.test(navigator.userAgent),isStandalone=window.matchMedia("(display-mode: standalone)").matches||navigator.standalone===true;
 modal("<div class='eyebrow'>INSTALLABLE WEB APPLICATION</div><h2 id='dialogTitle'>"+(isStandalone?"Already installed":"Add this experience to your device")+"</h2>"+
 "<p>"+(isStandalone?"You are already using the standalone app view.":ios?"On iPhone or iPad, open this page in Safari, tap the Share icon, then select <strong>Add to Home Screen</strong>. Follow the prompts.":"In Chrome or Edge, open the browser menu and select <strong>Install app</strong> or <strong>Add to Home screen</strong> where supported. Some browsers do not offer direct installation.")+"</p>"+
 "<div class='source-box'>This is a Progressive Web App, not a native App Store or Play Store app. Installation depends on your device and browser. The internal PDF is not cached for offline use.</div>"+
 "<button class='btn btn-accent' data-close type='button'>Understood</button>");
}
function welcomeSpeech(){
 return "Hello, and welcome to Service Excellence in Action. At the Ministry of Health and Wellness, good service begins with how we support one another. Our 2025 Internal Customer Satisfaction Study reports an overall satisfaction score of 54 percent. In this experience, you can explore the five service dimensions, understand the themes staff shared, and review proposals for service improvement. The recommendations are not yet verified achievements. Let us turn research into meaningful action.";
}
function stopSpeech(){if("speechSynthesis" in window)window.speechSynthesis.cancel();state.reading=false;var p=document.querySelector(".guide-narration-portrait");if(p)p.classList.remove("speaking");}
function narrate(){
 if(!("speechSynthesis" in window)){toast("Narration is not supported in this browser. The introduction remains available as text.");return;}
 stopSpeech();
 var msg=welcomeSpeech();
 modal("<div class='guide-narration-head'><img src='./assets/guide-portrait.svg' class='guide-narration-portrait' alt='Service Excellence Guide portrait from the study cover'/><div><div class='eyebrow'>WELCOME NARRATION / TRANSCRIPT</div><h2 id='dialogTitle'>Hear your guide</h2><p>Meet the study cover character in a voice-assisted introduction.</p></div></div>"+
 "<p>This uses your device's text-to-speech voice, not a client-approved Jamaican voice or a lip-synchronised character video.</p>"+
 "<div class='dialog-results'><p>"+esc(msg)+"</p></div>"+
 "<div class='form-actions'><button class='btn btn-accent' id='speechPlay' type='button'>▷ Play</button><button class='btn btn-outline' id='speechPause' type='button'>Ⅱ Pause</button><button class='btn btn-outline' id='speechRestart' type='button'>↻ Restart</button><button class='btn btn-outline' id='speechStop' type='button'>■ Stop</button></div><label class='check-row' for='speechVolume'>Narration volume (applies when started or restarted) <input type='range' id='speechVolume' min='0' max='1' step='0.1' value='"+state.volume+"' aria-label='Narration volume'></label><button class='btn btn-outline btn-sm' type='button' id='speechMute'>"+(state.muted?"Unmute narration":"Mute narration")+"</button>");
}
function speak(){if(!("speechSynthesis" in window))return;stopSpeech();var msg=new SpeechSynthesisUtterance(welcomeSpeech());msg.lang="en-JM";msg.rate=.95;msg.pitch=1;msg.volume=state.muted?0:state.volume;var portrait=document.querySelector(".guide-narration-portrait");if(portrait)portrait.classList.add("speaking");msg.onend=stopSpeech;msg.onerror=stopSpeech;state.reading=true;window.speechSynthesis.speak(msg);}
async function extractEmbeddedCover(file){
 try {
  var bytes=new Uint8Array(await file.arrayBuffer());
  for(var i=0;i<bytes.length-10;i++){
   if(bytes[i]!==255||bytes[i+1]!==216||bytes[i+2]!==255)continue;
   var p=i+2,w=0,h=0,limit=Math.min(bytes.length,i+5000);
   while(p+10<limit){
    if(bytes[p]!==255)break;
    while(bytes[p]===255)p++;
    var marker=bytes[p++];
    if(marker===0xD9||marker===0xDA)break;
    if(marker===0xD8||marker===1||marker>=0xD0&&marker<=0xD7)continue;
    var len=(bytes[p]<<8)|bytes[p+1];
    if(len<2||p+len>bytes.length)break;
    if([0xC0,0xC1,0xC2,0xC3].indexOf(marker)>=0){
     h=(bytes[p+3]<<8)|bytes[p+4];w=(bytes[p+5]<<8)|bytes[p+6];break;
    }
    p+=len;
   }
   if(w>=800&&h>=1000){
    for(var j=p+10;j<Math.min(bytes.length,i+2500000);j++){
     if(bytes[j]===255&&bytes[j+1]===217){
      if(state.coverURL)URL.revokeObjectURL(state.coverURL);
      state.coverURL=URL.createObjectURL(new Blob([bytes.subarray(i,j+2)],{type:"image/jpeg"}));
      return true;
     }
    }
   }
  }
 }catch(_e){return false;}
 return false;
}
function downloadAppQR(){/* QR download intentionally not offered until a local QR generator is included and approved. */}
function onMainClick(e){var b=e.target.closest("button");if(!b)return;
 if(b.hasAttribute("data-page")){sourceOpen(Number(b.getAttribute("data-page")));return;}
 if(b.hasAttribute("data-matrix")){var ij=b.dataset.matrix.split(",").map(Number),v=S.divisions[ij[0]],d=S.dimensions[ij[1]];modal("<h2 id='dialogTitle'>"+esc(v.name)+"</h2><h3>"+esc(d.name)+" · "+v.dimensions[ij[1]]+"%</h3><p>"+esc(d.detail)+"</p><p>Ministry-wide dimension score: "+d.score+"%. Division overall score: "+v.score+"%.</p>"+source(28,"Verify in original report"));return;}
 if(b.hasAttribute("data-intel-dim")){state.dimension=Number(b.dataset.intelDim);var old=main.querySelector(".intel");old.outerHTML=renderDashboard();main.querySelector("[data-intel-dim='"+state.dimension+"']").focus({preventScroll:true});return;}
 if(b.hasAttribute("data-dim")){state.dimension=Number(b.getAttribute("data-dim"));render();return;}
 if(b.hasAttribute("data-division")){state.division=Number(b.getAttribute("data-division"));render();return;}
 if(b.hasAttribute("data-action")){var n=Number(b.getAttribute("data-action"));state.openedAction=state.openedAction===n?0:n;render();return;}
 if(b.hasAttribute("data-choice")){state.answer=Number(b.getAttribute("data-choice"));render();return;}
 if(b.id==="prevScene"){state.scene=Math.max(0,state.scene-1);state.answer=-1;render();return;}
 if(b.id==="nextScene"){state.scene=state.scene===scenarios.length-1?0:state.scene+1;state.answer=-1;render();return;}
 if(b.hasAttribute("data-video-play")){
  var video=document.getElementById("studioWelcomeVideo");
  if(!video){toast("The introduction video is not available.");return;}
  video.loop=false;video.muted=false;video.controls=true;
  video.scrollIntoView({block:"center",behavior:"auto"});
  video.currentTime=0;
  var playback=video.play();
  if(playback&&playback.catch)playback.catch(function(){toast("Use the video controls to play the introduction.");});
  b.textContent="↻ Replay with sound";
  return;
 }
 if(b.hasAttribute("data-narrate")){narrate();return;}
 if(b.hasAttribute("data-guide-open")){openAsk();return;}
}
main.addEventListener("click",onMainClick);
main.addEventListener("change",function(e){if(e.target.id==="intelDivision"){state.division=Number(e.target.value);main.querySelector(".intel").outerHTML=renderDashboard();document.getElementById("intelDivision").focus({preventScroll:true});return;}if(e.target.id==="filterAction"){state.actionFilter=e.target.value;state.openedAction=0;render();}});
modalRoot.addEventListener("click",function(e){
 var b=e.target.closest("button");
 if(e.target.id==="modalBackdrop" || b && (b.id==="closeDialog"||b.hasAttribute("data-close"))){stopSpeech();closeModal();return;}
 if(!b)return;
 if(b.hasAttribute("data-page")){stopSpeech();closeModal();sourceOpen(Number(b.getAttribute("data-page")));return;}
 if(b.hasAttribute("data-question")){answerQuestion(b.getAttribute("data-question"));return;}
 if(b.id==="savePrefs"){state.settings.large=document.getElementById("largeToggle").checked;state.settings.contrast=document.getElementById("contrastToggle").checked;state.settings.motion=document.getElementById("motionToggle").checked;applyPrefs();try{localStorage.setItem("service-excellence-display",JSON.stringify(state.settings));}catch(_e){}closeModal();toast("Your display preferences were saved on this device.");return;}
 if(b.id==="copyLink"){var u=document.getElementById("shareLink").value;if(navigator.clipboard && navigator.clipboard.writeText){navigator.clipboard.writeText(u).then(function(){toast("Application link copied.");}).catch(function(){toast("Use the selected link to copy it.");});}else{document.getElementById("shareLink").select();toast("Select the link and copy it.");}return;}
 if(b.id==="nativeShare"){var link=document.getElementById("shareLink").value;if(navigator.share){navigator.share({title:"Service Excellence in Action",url:link}).catch(function(){});}else{toast("Your browser does not support device sharing; use Copy link.");}return;}
 if(b.id==="speechPlay"){if(window.speechSynthesis.paused)window.speechSynthesis.resume();else speak();return;}
 if(b.id==="speechPause"){if("speechSynthesis" in window)window.speechSynthesis.pause();return;}
 if(b.id==="speechRestart"){speak();return;}
 if(b.id==="speechStop"){stopSpeech();return;}
 if(b.id==="speechMute"){state.muted=!state.muted;stopSpeech();b.textContent=state.muted?"Unmute narration":"Mute narration";toast(state.muted?"Narration muted.":"Narration unmuted.");return;}
 if(b.id==="downloadQR"){var src="https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=12&data="+encodeURIComponent(document.getElementById("shareLink").value);fetch(src).then(function(res){if(!res.ok)throw Error("QR image unavailable");return res.blob();}).then(function(blob){var u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="service-excellence-qr.png";document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u);},1000);toast("QR image download requested.");}).catch(function(){toast("QR download requires an internet connection. Open or save the displayed image instead.");});return;}
});
modalRoot.addEventListener("input",function(e){if(e.target.id==="speechVolume")state.volume=Number(e.target.value);});
modalRoot.addEventListener("submit",function(e){if(e.target.id==="askForm"){e.preventDefault();answerQuestion(document.getElementById("askInput").value);}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){if(modalRoot.innerHTML){stopSpeech();closeModal();}else closeNav();}if(e.key==="Tab"&&modalRoot.innerHTML){var focusable=modalRoot.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled]),a[href]");if(focusable.length){var first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}});
document.getElementById("menuToggle").addEventListener("click",function(){var n=document.getElementById("sideRail");n.classList.toggle("open");this.setAttribute("aria-expanded",n.classList.contains("open")?"true":"false");});
document.getElementById("primaryNav").addEventListener("click",function(e){if(e.target.closest("a"))closeNav();});
document.getElementById("railHelp").addEventListener("click",openAsk);
document.getElementById("guideFab").addEventListener("click",openAsk);
document.getElementById("accessBtn").addEventListener("click",openSettings);
document.getElementById("shareBtn").addEventListener("click",openShare);
document.getElementById("installBtn").addEventListener("click",function(){if(state.installEvent){var e=state.installEvent;state.installEvent=null;e.prompt();if(e.userChoice)e.userChoice.then(function(c){if(c.outcome==="accepted")toast("Installation request accepted. Complete any browser prompts.");else installInstructions();});}else installInstructions();});
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();state.installEvent=e;});
window.addEventListener("appinstalled",function(){state.installEvent=null;toast("The web application has been installed.");});
window.addEventListener("hashchange",render);
try{var pref=JSON.parse(localStorage.getItem("service-excellence-display")||"{}");["large","contrast","motion"].forEach(function(k){state.settings[k]=pref[k]===true;});}catch(_e){}
window.addEventListener("service-reader-page",function(e){state.pdfPage=e.detail.page;document.querySelectorAll(".reader-toc .toc-button").forEach(function(b){b.classList.toggle("selected",Number(b.dataset.page)===state.pdfPage);});});
window.addEventListener("service-report-opened",function(e){if(e.detail&&e.detail.file)extractEmbeddedCover(e.detail.file).then(refreshWelcomeCover).catch(function(){});});
applyPrefs();render();
if("serviceWorker" in navigator && location.protocol==="https:")window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){/* service worker optional in development */});});
})();