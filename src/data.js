/* Source of truth: Internal Customer Satisfaction Study Report (study 2025, cover 2026).
   Aggregate-only development preview. Do not publish original report or participant quotes
   without MOHW written clearance. PDF page indices include 13 preliminary pages. */
window.STUDY = Object.freeze({
  publication: {
    id: "mohw-internal-csat-2025", title: "Internal Customer Satisfaction Study Report",
    shortTitle: "Internal Customer Satisfaction", studyYear: 2025, coverYear: 2026,
    division: "Enabling Environment in Health and Client Services Division",
    ministry: "Ministry of Health and Wellness, Jamaica", publicationStatus: "Internal development preview",
    pdfPages: 74, base: "2025 study; publication cover 2026"
  },
  methodology: {
    frame: 766, selected: 332, responded: 229, reportedResponseRate: 68,
    calculatedResponseRate: Number((229 / 332 * 100).toFixed(1)),
    fgdParticipants: 63, fgdGroups: 10, fgdPeriod: "27 January – 7 February 2025",
    surveyPeriod: "20 January – 1 March 2025",
    interactionsRespondents: 219, interactions: 1133,
    sampledSupervisors:119, sampledNonSupervisors:213,
    statement: "A cross-sectional mixed-methods study combined a stratified random survey with purposively selected focus group discussions.",
    source: "Methods, printed pp. 6–8; PDF pp. 19–21"
  },
  overall: { score: 54, benchmark: 85, target: 65, targetPeriod: "within two survey cycles", source: "Results, printed p. 13; PDF p. 26; Appendix 5, printed p. 57" },
  dimensions: [
    {id:"communication",name:"Communication",short:"Communication",score:59,detail:"How clearly information is shared, whether staff can obtain guidance, and the quality of service-related communication.",insight:"A joint highest-rated dimension, but focus-group accounts still described significant communication challenges.",source:"Figure 8, printed p. 13; PDF p. 26"},
    {id:"access",name:"Access and Facilities",short:"Access & facilities",score:55,detail:"The ability to reach services, navigate premises and access usable facilities.",insight:"The study describes practical difficulties with physical access, amenities and the work environment.",source:"Figure 8, printed p. 13; PDF p. 26"},
    {id:"quality",name:"Quality and Reliability",short:"Quality & reliability",score:59,detail:"The consistency and dependability of internal services and information.",insight:"Joint highest-rated dimension, with improvement needed in standardised procedures and document handling.",source:"Figure 8, printed p. 13; PDF p. 26"},
    {id:"timeliness",name:"Timeliness/Responsiveness",short:"Timeliness",score:48,detail:"How promptly staff receive replies, decisions, approvals and services.",insight:"One of the two lowest dimensions, consistent with reported delays and unanswered requests.",source:"Figure 8, printed p. 13; PDF p. 26"},
    {id:"cost",name:"Cost and Payment Processes",short:"Cost & payments",score:44,detail:"The fairness, clarity, reliability and efficiency of payment-related processes.",insight:"The lowest-rated service dimension in the 2025 survey.",source:"Figure 8, printed p. 13; PDF p. 26"}
  ],
  divisions: [
    {id:"executive",name:"Executive Management",score:71,agree:116,ratings:163,dimensions:[74,67,74,65,54]},
    {id:"eehcsd",name:"EEHCSD",score:60,agree:25,ratings:42,dimensions:[62,55,64,55,44]},
    {id:"nphl",name:"National Public Health Laboratory",score:60,agree:70,ratings:117,dimensions:[66,59,58,53,53]},
    {id:"standards",name:"Standards and Regulation",score:60,agree:21,ratings:35,dimensions:[63,49,71,54,60]},
    {id:"technical",name:"Technical Services",score:60,agree:142,ratings:237,dimensions:[67,62,71,49,53]},
    {id:"policy",name:"Policy, Planning and Development",score:59,agree:27,ratings:46,dimensions:[63,61,70,52,50]},
    {id:"corporate",name:"Corporate Services",score:46,agree:184,ratings:400,dimensions:[53,50,49,41,35]},
    {id:"finance",name:"Finance and Accounts",score:28,agree:26,ratings:93,dimensions:[33,39,35,28,25]}
  ],
  themes: [
    {id:"service",n:"01",title:"Service experience",original:"Widespread Customer Service Challenges",summary:"The accounts combined examples of helpful, responsive service with concerns about inconsistent courtesy, respect and support.",response:"Strengthen service standards and staff capabilities; recognise and replicate good practice.",page:35,printed:22},
    {id:"process",n:"02",title:"Processes and guidance",original:"Lack of Standardised Processes and Guidelines",summary:"Staff described inconsistent processes, uncertainty about steps, and delays in administrative workflows.",response:"Provide accessible procedures, clearer service-level agreements and reliable document handling.",page:43,printed:30},
    {id:"communication",n:"03",title:"Internal communication",original:"Inadequate Communication",summary:"Unanswered inquiries and inadequate updates made it difficult for employees to coordinate work.",response:"Define response expectations and improve information sharing across branches and divisions.",page:49,printed:36},
    {id:"leadership",n:"04",title:"Leadership and management",original:"Supervisory and Management Challenges",summary:"Participants described challenges with guidance, visibility, accountability and morale.",response:"Support supervisors, leadership development and fair recognition practices.",page:51,printed:38}
  ],
  actions: [
    {id:1,title:"Internal service standards",official:"Develop and operationalise internal service standards across MOHW.",gap:"Low overall customer satisfaction (54%).",impact:"Reduced confidence in internal services.",owner:"Heads of Division & Customer Service Branch",period:"FY 2027/2028",indicators:["CSAT rises from 54% to at least 65% within two survey cycles","At least 90% of divisions have documented internal SLAs and KPIs","Quarterly SLA compliance reports"],steps:["Adapt GOJ service standards for internal services","Develop internal SLAs and KPIs","Embed standards into IWPs/PMAS","Conduct division sensitisation","Monitor compliance quarterly"],page:70},
    {id:2,title:"Customer service competencies",official:"Strengthen customer service competencies across MOHW.",gap:"Limited staff capacity in customer service principles.",impact:"Inconsistent service quality and negative customer experiences.",owner:"HRMD & Customer Service Branches",period:"FY 2027/2028",indicators:["At least 85% of staff complete mandatory CS training","Post-training evaluation scores average at least 75%","Fewer complaints about staff attitude and service consistency"],steps:["Integrate advanced customer service modules into the LMS","Include modules in Training Needs Assessment","Use MyHR+ training module for planning","Monitor the training plan"],page:70},
    {id:3,title:"Confidential feedback and quality improvement",official:"Institutionalise internal feedback and continuous quality improvement.",gap:"Weak internal feedback mechanisms.",impact:"Issues can persist without structured resolution.",owner:"EEHCSD Customer Service Branch; Research, Monitoring & Evaluation Branch; Heads of Division",period:"FY 2027/2028",indicators:["Confidential internal feedback mechanism operational","At least 70% of logged issues receive responses within agreed timeframes","Quarterly executive reports and biennial CSAT survey"],steps:["Implement confidential feedback channels","Conduct biennial internal CSAT surveys","Integrate results into divisional planning"],page:71},
    {id:4,title:"Document control and records",official:"Strengthen document control and records management.",gap:"Improper document handling and unclear procedures.",impact:"Lost documents and inconsistent practices.",owner:"Documentation, Information & Access Services",period:"FY 2026/2027",indicators:["Document control standardised across MOHW","Central SOP repository established and used"],steps:["Establish document templates and naming conventions","Create an SOP repository","Set procedures for document circulation and storage","Sensitise staff"],page:71},
    {id:5,title:"Cross-divisional procedures",official:"Streamline workflows and standardise processes.",gap:"Moderate Quality and Reliability satisfaction (59%).",impact:"Inconsistency in service delivery.",owner:"Heads of Division/Branch/Unit",period:"FY 2027–2030",indicators:["At least 75% of priority cross-divisional processes documented","Reduced errors and rework","Quality and Reliability CSAT increases from 59% to at least 70%"],steps:["Create SOPs for cross-divisional processes"],page:72},
    {id:6,title:"Timeliness and administrative workflow",official:"Streamline workflows and standardise processes.",gap:"Low Timeliness/Responsiveness satisfaction (48%).",impact:"Delays in payroll, HR actions and approvals.",owner:"Heads of Division/Branch",period:"Q4 FY 2026/2027",indicators:["HR/payroll/administration turnaround times reduced by at least 20%","At least 80% compliance with documented timelines","Timeliness CSAT increases from 48% to at least 60%"],steps:["Document workflows for HR, payroll and administration","Develop step-by-step SOPs","Conduct workshops","Provide quick-reference guides"],page:72},
    {id:7,title:"Leadership visibility and accountability",official:"Improve leadership visibility and accountability.",gap:"Perceived senior management detachment.",impact:"Reduced staff morale and trust.",owner:"Heads of Branch/Unit",period:"Q4 FY 2026/2027",indicators:["360-degree feedback for at least 80% of supervisors","Leadership improvement plans developed and monitored"],steps:["Implement 360-degree feedback","Develop and monitor leadership improvement plans"],page:73},
    {id:8,title:"Staff welfare and recognition",official:"Strengthen staff welfare and recognition programmes.",gap:"Low morale and limited recognition.",impact:"Reduced motivation and productivity.",owner:"Employee Relations, Occupational Health & Safety; EEHCSD",period:"FY 2027/2028; reward programme FY 2028/2029",indicators:["Staff wellness participation increases year-on-year","Improved staff morale indicators"],steps:["Review welfare programmes","Implement wellness initiatives","Improve awareness of HR services","Implement a Service Excellence Reward & Recognition Programme"],page:73},
    {id:9,title:"Internal communication systems",official:"Enhance internal communication systems.",gap:"Moderate communication satisfaction (59%).",impact:"Information gaps and duplicated effort.",owner:"ICT Branch; Communications & Public Relations",period:"FY 2026/2027",indicators:["Staff directory updated and standardised","Communication CSAT increases from 59% to at least 70%","Internal communications SOP approved"],steps:["Standardise staff directory updates","Establish SOP for website and internal updates"],page:73},
    {id:10,title:"Physical access and facilities",official:"Improve physical access and facilities management.",gap:"Access and Facilities satisfaction (55%).",impact:"Reduced access and poor conditions for employees and visitors.",owner:"Corporate Services; Environmental Health Unit",period:"FY 2026/2027",indicators:["At least two customer parking spaces per corporate building","At least 90% of reported facility issues resolved within established timelines","Access and Facilities CSAT increases from 55% to at least 65% by 2028"],steps:["Designate customer parking areas","Implement facility-maintenance reporting SOP","Quarterly facility reviews","Test and address air quality"],page:74}
  ],
  chapters: [
    {name:"Cover and preliminaries",page:1,printed:"cover–xii"},
    {name:"Introduction",page:14,printed:"1"},
    {name:"Study methods",page:19,printed:"6"},
    {name:"Survey findings",page:22,printed:"9"},
    {name:"Five service dimensions",page:26,printed:"13"},
    {name:"Divisional comparison",page:27,printed:"14"},
    {name:"Focus-group findings",page:33,printed:"20"},
    {name:"The four themes",page:35,printed:"22"},
    {name:"Discussion",page:52,printed:"39"},
    {name:"Recommendations",page:56,printed:"43"},
    {name:"Expanded action plan",page:70,printed:"57"}
  ],
  verification: [
    {priority:"High",issue:"Response rate",detail:"Report states 68%; 229 ÷ 332 = 68.98% (approximately 69% when rounded to whole percentage). Display the report's 68% as reported pending author confirmation.",source:"Executive Summary p. x; Methods p. 6; Results p. 9"},
    {priority:"High",issue:"Focus-group sex counts",detail:"FGD narrative lists 38 women and 15 men, totalling 53, while Figure 10 shows 46 and 17, totalling 63. Do not display sex distribution until reconciled.",source:"Printed p. 20 / PDF p. 33"},
    {priority:"High",issue:"Interaction proportions",detail:"Figure 5 shows Corporate Services at 22% and Technical Services at 34%; Table 2 ratings indicate Corporate Services 400/1,133 (35%) and Technical Services 237/1,133 (21%). These should not be presented as matching metrics.",source:"Printed pp. 11,14 / PDF pp. 24,27"},
    {priority:"Medium",issue:"Unit of analysis",detail:"The report sometimes describes 1,133 ratings/interactions as 'respondents'; 229 employees responded, and 219 reported interactions. Dashboard explicitly distinguishes employees, ratings and encounters.",source:"Printed pp. 11–14 / PDF pp. 24–27"},
    {priority:"Medium",issue:"Narrative versus appendix",detail:"The summary lists nine recommendation groups; Appendix 5 lists ten workstreams, splitting workflow/standardisation across items 5 and 6.",source:"Printed pp. 43,57–61 / PDF pp. 56,70–74"},
    {priority:"Medium",issue:"Reported payment score",detail:"Discussion text says 35% for cost/payment, while Figure 8 and Table 3 give 44% overall. The visual uses 44% with a verification flag on this discrepancy.",source:"Printed pp. 13,15,41 / PDF pp. 26,28,54"}
  ]
});
