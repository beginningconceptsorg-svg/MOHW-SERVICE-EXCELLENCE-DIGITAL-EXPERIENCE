/* Service Excellence in Action — interactive, aggregate-only prototype.
   No original PDF or focus-group transcripts are uploaded or transmitted by this application.
   Browser-based narration is a provisional technology demo, NOT approved voice/video production. */
(function () {
"use strict";
var S=window.STUDY, main=document.getElementById("main"), modalRoot=document.getElementById("modalRoot");
if (!S || !main) return;
var names={home:"Welcome",study:"The Study",results:"The Results",divisions:"By Division",voices:"What Staff Shared",action:"From Findings to Action",learn:"Learn & Improve",library:"Digital Report Library"};
var state={route:"home",dimension:0,division:0,openedAction:1,actionFilter:"all",scene:0,answer:-1,pdfURL:null,coverURL:null,pdfName:"",pdfPage:1,installEvent:null,lastFocus:null,reading:false,voiceText:"",volume:1,muted:false,settings:{large:false,contrast:false,motion:false}};
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
function animateGuide(){return state.coverURL?
 "<img class='guide-image authentic' src='"+esc(state.coverURL)+"' alt='Cover artwork extracted locally from the selected research PDF, showing the headset-wearing service representative' loading='eager'/>":
 "<img class='guide-image' src='./assets/guide.svg' alt='Provisional illustration of the report cover guide: a smiling Black woman with braids, headset, light blazer and welcoming arms' loading='eager'/>";}
function reportYear(){return "Results reflect experiences studied in 2025; they are not current operational ratings.";}
function renderHome(){
 return "<div class='page home-page'>"+
  "<section class='hero' aria-label='Welcome to Service Excellence in Action'>"+
  "<div class='hero-copy'><div class='eyebrow light'>MOHW · INTERACTIVE PUBLICATION · 2026</div>"+
  "<h1>Better service <em>begins within.</em></h1>"+
  "<p>A new way to explore the Ministry's Internal Customer Satisfaction Study — turning the voices of staff and the evidence of 2025 into a clearer path for service improvement.</p>"+
  "<div class='hero-actions'><a class='btn btn-primary' href='#/results'>Explore the Findings <span aria-hidden='true'>↗</span></a>"+
  "<button class='btn btn-outline' type='button' data-narrate='welcome'>▷ Hear the introduction</button></div>"+
  "<div class='hero-fact'><strong>54%</strong><span>Overall internal CSAT<br/>reported in the 2025 study</span></div></div>"+
  "<div class='hero-art'><div class='decor-orbit'></div><div class='chat-glow'></div><div class='hero-skyline'></div>"+animateGuide()+
  "<div class='guide-caption'><img src='./assets/guide-portrait.svg' alt='' width='44' height='44'/><span><strong>Service Excellence Guide</strong><small>From the study cover</small></span></div></div></section>"+
  "<div class='overview-strip'>"+
  "<div class='overview-stat'><strong>229</strong><span>Survey respondents</span><small>Of 332 staff selected</small></div>"+
  "<div class='overview-stat'><strong>05</strong><span>Service dimensions</span><small>GOJ minimum standards</small></div>"+
  "<div class='overview-stat'><strong>10</strong><span>Focus groups</span><small>63 staff members</small></div>"+
  "<div class='overview-stat'><strong>10</strong><span>Proposed workstreams</span><small>Appendix No. 5</small></div></div>"+
  "<section class='guide-studio' aria-labelledby='guideStudioTitle'><div class='studio-portrait'><img src='./assets/guide-portrait.svg' alt='Service Excellence Guide, headset-wearing presenter from the study cover' loading='lazy'/><span class='studio-signal' aria-hidden='true'></span></div><div class='studio-copy'><div class='eyebrow'>MEET YOUR DIGITAL GUIDE</div><h2 id='guideStudioTitle'>A familiar face. A clearer conversation.</h2><p>Meet the character from the study cover, now the face of our interactive guide. Hear her introduction or find verified answers in the 2025 study.</p><div class='studio-actions'><button type='button' class='btn btn-accent' data-narrate='welcome'>▷ Hear her introduction</button><button type='button' class='btn btn-white' data-guide-open>Ask about the findings →</button></div><small>Future animated explainers will feature the same character following voice and media approvals. This introduction is a narrated prototype, not a lip-synchronised video.</small></div></section>"+
  "<div class='section-head'><div><div class='eyebrow'>THREE WAYS TO EXPLORE</div><h2>From insight to impact.</h2></div><p>Go beyond a static report: explore the findings, hear the context, and examine proposals for improving internal service.</p></div>"+
  "<div class='discovery-grid'>"+
  "<a class='discovery-card one' href='#/results'><span class='eyebrow'>01 / EVIDENCE</span><h3>Discover what the data reveals.</h3><p>Interactive scores across five service dimensions, with original source references.</p><span class='arrow-go' aria-hidden='true'>↗</span></a>"+
  "<a class='discovery-card two' href='#/voices'><span class='eyebrow'>02 / PEOPLE</span><h3>Understand what staff shared.</h3><p>Four research themes, contextualised without exposing confidential participant accounts.</p><span class='arrow-go' aria-hidden='true'>↗</span></a>"+
  "<a class='discovery-card three' href='#/action'><span class='eyebrow'>03 / ACTION</span><h3>Explore the proposed way forward.</h3><p>Ten workstreams, accountable offices, intended periods and outcome indicators.</p><span class='arrow-go' aria-hidden='true'>↗</span></a></div>"+
  "<div class='source-box'><strong>About this preview:</strong> The 2025 findings are historical. The original 74-page PDF is not publicly hosted here; authorised reviewers can load their own copy privately in the <a href='#/library'>Digital Report Library</a>. "+source(26,"View source page")+"</div>"+
  "</div>";
}
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
 var pdf=!!state.pdfURL;
 return "<div class='page'>"+header("07 / ORIGINAL SOURCE","The digital report library","Keep the complete 74-page research publication close at hand. In this public code preview, the internal PDF is loaded from your own device — never uploaded to a server.")+
 "<div class='reader-layout'><aside class='reader-toc'><h3>Report contents</h3><div class='mini-label' style='padding:0 12px 11px'>PDF PAGE / PRINTED PAGE</div>"+S.chapters.map(function(c){return "<button type='button' class='toc-button"+(pdf && state.pdfPage===c.page?" selected":"")+"' data-page='"+c.page+"'><span>"+esc(c.name)+"</span><small>"+c.page+" / "+esc(c.printed)+"</small></button>";}).join("")+"</aside>"+
 "<section class='reader-viewer' aria-label='Original research publication reader'><div class='reader-toolbar'><strong>"+(pdf?esc(state.pdfName):"74-page source · not hosted publicly")+"</strong><button type='button' id='choosePDF'>"+(pdf?"Replace PDF":"Load your PDF")+"</button>"+
 "<button type='button' id='readerPrev' "+(!pdf || state.pdfPage<=1?"disabled":"")+">←</button><span style='font-size:.8rem'>"+(pdf?"Page "+state.pdfPage+" / 74":"No file loaded")+"</span><button type='button' id='readerNext' "+(!pdf || state.pdfPage>=74?"disabled":"")+">→</button>"+
 "<button type='button' id='readerFull' "+(!pdf?"disabled":"")+">Full screen ↗</button><button type='button' id='readerDownload' "+(!pdf?"disabled":"")+">Download</button></div>"+
 (pdf?"<iframe class='reader-iframe' id='readerFrame' title='Original 74-page customer satisfaction study PDF' src='"+esc(state.pdfURL)+"#page="+state.pdfPage+"&toolbar=1'></iframe>":
 "<div class='reader-empty'><div class='doc-icon' aria-hidden='true'>▤</div><h3>Open the original publication</h3><p>Select the Internal Customer Satisfaction Study Report PDF from your device to view it privately, navigate by chapter and use your browser's built-in reader controls.</p><button class='btn btn-primary' id='choosePDFEmpty' type='button'>↑ Select original PDF</button><small>The file stays on your device and in this browser session. This project does not host or distribute it.</small></div>")+
 "</section></div>"+
 "<div class='source-box'><strong>Reading guidance:</strong> The original report includes numbered preliminary pages. PDF page 26 is printed report page 13; Appendix No. 5 begins at PDF page 70 / printed page 57. After loading a PDF, use the browser viewer's search and zoom controls where supported. Accessibility varies across built-in viewers; the HTML study sections provide additional structured reading.</div>"+
 "<div class='section-head'><div><div class='eyebrow'>ACKNOWLEDGEMENTS</div><h2>Preserving research authorship.</h2></div></div>"+
 "<div class='attribution'><div><h4>Institutional publisher</h4><p class='small'>Ministry of Health and Wellness, Jamaica · Enabling Environment in Health and Client Services Division.</p><p class='small'>Principal Director's message: Dr. Kimorley Humphrey, JP.</p></div><div><h4>Research contributions</h4><p class='small'>Customer Service Branch; Research, Monitoring and Evaluation Branch; independent facilitation support. The original research team is fully acknowledged in the PDF on preliminary page vi (PDF page 7).</p></div></div>"+
 "<div class='credit-block'>Development preview built by <a href='https://beginningconcepts.org/' rel='noopener noreferrer' target='_blank'>Beginning Concepts</a>. Digital product concept subject to Ministry approval. The original report remains the authoritative research publication.</div></div>";
}
function render(){
 var route=(location.hash.match(/^#\/(home|study|results|divisions|voices|action|learn|library)/)||[])[1]||"home";
 var changed=route!==state.route; state.route=route;
 var views={home:renderHome,study:renderStudy,results:renderResults,divisions:renderDivisions,voices:renderVoices,action:renderActions,learn:renderLearn,library:renderLibrary};
 main.innerHTML=views[route]();
 document.title=names[route]+" | Service Excellence in Action";
 Array.prototype.forEach.call(document.querySelectorAll("[data-route]"),function(a){var on=a.getAttribute("data-route")===route;a.classList.toggle("active",on);if(on){a.setAttribute("aria-current","page");}else{a.removeAttribute("aria-current");}});
 if(changed){window.scrollTo({top:0,behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});closeNav();}
}
function toast(text){var e=document.getElementById("toast");e.textContent=text;clearTimeout(toast.timer);toast.timer=setTimeout(function(){e.textContent="";},4500);}
function closeNav(){document.getElementById("sideRail").classList.remove("open");document.getElementById("menuToggle").setAttribute("aria-expanded","false");}
function modal(markup){state.lastFocus=document.activeElement;modalRoot.innerHTML="<div class='modal-backdrop' id='modalBackdrop'><div class='modal' role='dialog' aria-modal='true' aria-labelledby='dialogTitle'><button type='button' class='modal-close' id='closeDialog' aria-label='Close dialog'>×</button>"+markup+"</div></div>";document.getElementById("closeDialog").focus();}
function closeModal(){modalRoot.innerHTML="";if(state.lastFocus && state.lastFocus.focus)state.lastFocus.focus();}
function sourceOpen(page){state.pdfPage=Math.min(74,Math.max(1,page||1));location.hash="#/library";render();if(!state.pdfURL)toast("To view the cited page, load your authorised copy of the report in the reader.");}
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
async function loadPDF(file){
 if(!file)return;
 if(file.type!=="application/pdf" && !/\.pdf$/i.test(file.name)){toast("Please choose a PDF file.");return;}
 if(file.size>30*1024*1024){toast("This reader supports PDF files up to 30 MB.");return;}
 if(state.pdfURL)URL.revokeObjectURL(state.pdfURL);
 state.pdfURL=URL.createObjectURL(file);state.pdfName=file.name;state.pdfPage=1;
 location.hash="#/library";render();
 var found=await extractEmbeddedCover(file);
 toast(found?"PDF loaded privately. Original embedded cover artwork also available in the welcome screen.":"PDF loaded in this browser session only. Nothing was uploaded.");
}
function applyPage(page){if(!state.pdfURL){sourceOpen(page);return;}state.pdfPage=Math.max(1,Math.min(74,page));render();}
function choosePDF(){document.getElementById("pdfFileInput").click();}
function downloadPDF(){if(!state.pdfURL)return;var a=document.createElement("a");a.href=state.pdfURL;a.download=state.pdfName||"Internal-CSAT-Report.pdf";document.body.appendChild(a);a.click();a.remove();}
function downloadAppQR(){/* QR download intentionally not offered until a local QR generator is included and approved. */}
function onMainClick(e){var b=e.target.closest("button");if(!b)return;
 if(b.hasAttribute("data-page")){sourceOpen(Number(b.getAttribute("data-page")));return;}
 if(b.hasAttribute("data-dim")){state.dimension=Number(b.getAttribute("data-dim"));render();return;}
 if(b.hasAttribute("data-division")){state.division=Number(b.getAttribute("data-division"));render();return;}
 if(b.hasAttribute("data-action")){var n=Number(b.getAttribute("data-action"));state.openedAction=state.openedAction===n?0:n;render();return;}
 if(b.hasAttribute("data-choice")){state.answer=Number(b.getAttribute("data-choice"));render();return;}
 if(b.id==="prevScene"){state.scene=Math.max(0,state.scene-1);state.answer=-1;render();return;}
 if(b.id==="nextScene"){state.scene=state.scene===scenarios.length-1?0:state.scene+1;state.answer=-1;render();return;}
 if(b.hasAttribute("data-narrate")){narrate();return;}
 if(b.hasAttribute("data-guide-open")){openAsk();return;}
 if(b.id==="choosePDF"||b.id==="choosePDFEmpty"){choosePDF();return;}
 if(b.id==="readerPrev"){applyPage(state.pdfPage-1);return;}
 if(b.id==="readerNext"){applyPage(state.pdfPage+1);return;}
 if(b.id==="readerFull" && state.pdfURL){window.open(state.pdfURL+"#page="+state.pdfPage,"_blank","noopener");return;}
 if(b.id==="readerDownload"){downloadPDF();return;}
}
main.addEventListener("click",onMainClick);
main.addEventListener("change",function(e){if(e.target.id==="filterAction"){state.actionFilter=e.target.value;state.openedAction=0;render();}});
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
document.getElementById("pdfFileInput").addEventListener("change",function(){loadPDF(this.files[0]);this.value="";});
window.addEventListener("beforeinstallprompt",function(e){e.preventDefault();state.installEvent=e;});
window.addEventListener("appinstalled",function(){state.installEvent=null;toast("The web application has been installed.");});
window.addEventListener("hashchange",render);
try{var pref=JSON.parse(localStorage.getItem("service-excellence-display")||"{}");["large","contrast","motion"].forEach(function(k){state.settings[k]=pref[k]===true;});}catch(_e){}
applyPrefs();render();
if("serviceWorker" in navigator && location.protocol==="https:")window.addEventListener("load",function(){navigator.serviceWorker.register("./sw.js").catch(function(){/* service worker optional in development */});});
})();