/* Service Excellence built-in report reader.
   Adapted from the WRHA Manual Resource Hub reading experience.
   Same-origin, permission-controlled report delivery only. Never uses file uploads. */
(function(){
"use strict";
const REPORT="./docs/Internal_CSAT_Report_2025_Final.pdf";
const LIB="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";
const WORKER="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";
const PREF_KEY="service-excellence-reader-v1";
let libPromise=null,active=null;
const clamp=(x,a,b)=>Math.min(b,Math.max(a,Number(x)||a));
const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function getLib(){
 if(!libPromise)libPromise=import(LIB).then(m=>{m.GlobalWorkerOptions.workerSrc=WORKER;return m;}).catch(e=>{libPromise=null;throw e;});
 return libPromise;
}
function paperSound(reader,dir){
 if(!reader.sound||reader.reading)return;
 try{
  const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
  const ctx=reader.audio||(reader.audio=new Audio());
  if(ctx.state==="suspended"){ctx.resume().catch(()=>{});return;}
  const seconds=.53,buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*seconds),ctx.sampleRate),data=buffer.getChannelData(0);
  let low=0,slow=0;
  for(let i=0;i<data.length;i++){
   const t=i/ctx.sampleRate,n=Math.random()*2-1;
   low=low*.88+n*.12;slow=slow*.72+n*.28;
   const env=Math.pow(Math.sin(Math.PI*t/seconds),1.4);
   data[i]=(n-slow)*.23*env+low*.15*env;
  }
  const src=ctx.createBufferSource(),hi=ctx.createBiquadFilter(),lp=ctx.createBiquadFilter(),gain=ctx.createGain();
  src.buffer=buffer;hi.type="highpass";hi.frequency.value=360;
  lp.type="lowpass";lp.frequency.setValueAtTime(1400,ctx.currentTime);
  lp.frequency.linearRampToValueAtTime(3400,ctx.currentTime+.23);
  lp.frequency.linearRampToValueAtTime(1300,ctx.currentTime+.5);
  gain.gain.setValueAtTime(.001,ctx.currentTime);
  gain.gain.linearRampToValueAtTime(.6,ctx.currentTime+.08);
  gain.gain.linearRampToValueAtTime(.001,ctx.currentTime+.52);
  src.connect(hi);hi.connect(lp);lp.connect(gain);
  if(ctx.createStereoPanner){const pan=ctx.createStereoPanner();pan.pan.value=dir>0?-.35:.35;gain.connect(pan);pan.connect(ctx.destination);}else gain.connect(ctx.destination);
  src.start();
 }catch(_){}
}
class Reader {
 constructor(root,start){
  this.root=root;this.page=Math.max(1,Math.trunc(start)||1);this.count=0;this.pdf=null;this.task=null;this.raw=null;
  this.epoch=0;this.searchEpoch=0;this.speechEpoch=0;this.renderJobs=[];this.destroyed=false;this.reading=false;this.audio=null;
  let saved={};try{saved=JSON.parse(localStorage.getItem(PREF_KEY)||"{}");}catch(_){}
  this.sound=saved.sound!==false;this.spread=saved.spread!==false;this.zoom=saved.zoom||"fit";
  this.mount();
 }
 mount(){
  this.root.innerHTML=[
   '<section class="sr" aria-label="Interactive publication reader">',
   '<div class="sr-head"><div class="sr-book-mark" aria-hidden="true">▤</div><div class="sr-heading"><strong>Internal Customer Satisfaction Study</strong><span>Original research publication · 2025 study / 2026 report</span></div><span class="sr-pill" id="srStatus">Opening publication…</span></div>',
   '<div class="sr-toolbar" role="toolbar" aria-label="Report page and reading controls">',
   '<button type="button" id="srPrev" title="Previous page" aria-label="Previous page">‹</button>',
   '<label class="sr-page-jump" for="srPage">Page <input type="number" id="srPage" min="1" value="1" inputmode="numeric" aria-label="PDF page number"> <span id="srTotal">/ 74</span></label>',
   '<button type="button" id="srNext" title="Next page" aria-label="Next page">›</button>',
   '<button type="button" id="srListen" class="sr-tool-primary">▶ Listen</button>',
   '<button type="button" id="srFullscreen">⛶ Full screen</button>',
   '<details class="sr-options" id="srOptions"><summary>Reader tools <span aria-hidden="true">⌄</span></summary>',
   '<div class="sr-panel">',
   '<div class="sr-toolgroup"><label for="srZoom">Page size</label><select id="srZoom"><option value="fit">Fit page</option><option value="width">Page width</option><option value="75">75% of fit</option><option value="100">100% of fit</option><option value="125">125% of fit</option><option value="150">150% of fit</option><option value="200">200% of fit</option></select>',
   '<button type="button" id="srSpread">Two-page book</button><button type="button" id="srSound">Sound on</button></div>',
   '<div class="sr-toolgroup"><label for="srSearch">Find text in report</label><input id="srSearch" type="search" placeholder="Search all pages" aria-label="Find text in report"><button type="button" id="srFind">Find next</button></div>',
   '<div class="sr-toolgroup"><button type="button" id="srReadAll">Read from this page</button><button type="button" id="srPause">Pause</button><button type="button" id="srStop">Stop audio</button><button type="button" id="srText">Show page text</button></div>',
   '<div class="sr-toolgroup"><button type="button" id="srPrint">Print report</button><a id="srOriginal" aria-disabled="true" tabindex="-1" target="_blank" rel="noopener noreferrer">View original PDF</a><button type="button" id="srDownload">↓ Download PDF</button></div>',
   '</div></details></div>',
   '<div class="sr-stage" id="srStage" tabindex="0" aria-label="Report page canvas; use left and right arrow keys to turn pages">',
   '<div class="sr-loading" id="srLoading" role="status"><div class="sr-loader" aria-hidden="true"></div><strong>Preparing the original report</strong><span>Preserving each page, chart, photograph and illustration.</span></div>',
   '<div class="sr-book" id="srBook" aria-live="off" hidden></div>',
   '<div class="sr-error" id="srError" hidden><span aria-hidden="true">▤</span><h3>Publication access is not yet enabled</h3><p id="srErrorCopy">The original report must be delivered from a Ministry-authorised location before it can be read or downloaded here.</p><p class="sr-subtle">The interactive study sections remain available. No upload is required or offered.</p></div>',
   '</div>',
   '<div class="sr-bottom"><span id="srAnnounce" role="status" aria-live="polite">The page reader will open the report automatically when access is available.</span><span>← → Turn pages · Swipe on mobile</span></div>',
   '<pre class="sr-transcript" id="srTranscript" tabindex="0" hidden></pre></section>'
  ].join("");
  this.el=id=>this.root.querySelector("#"+id);
  this.stage=this.el("srStage");this.book=this.el("srBook");
  for(const name of ["srPrev","srNext","srPage","srZoom","srSpread","srSound","srListen","srReadAll","srPause","srStop","srText","srFind","srSearch","srPrint","srOriginal","srDownload"]){
   if(name!=="srZoom"&&name!=="srSound"&&name!=="srSpread")this.el(name).disabled=true;
  }
  this.el("srZoom").value=this.zoom;this.updatePrefs();
  this.root.addEventListener("click",this.clickBound=e=>this.onClick(e));
  this.root.addEventListener("change",this.changeBound=e=>this.onChange(e));
  this.stage.addEventListener("keydown",this.keyBound=e=>{if(e.key==="ArrowRight"){e.preventDefault();this.step(1);}if(e.key==="ArrowLeft"){e.preventDefault();this.step(-1);}});
  this.stage.addEventListener("touchstart",this.startBound=e=>{const t=e.touches[0];if(t)this.touch={x:t.clientX,y:t.clientY};},{passive:true});
  this.stage.addEventListener("touchend",this.endBound=e=>{if(!this.touch)return;const t=e.changedTouches[0];if(t){const dx=t.clientX-this.touch.x,dy=t.clientY-this.touch.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.8)this.step(dx<0?1:-1);}this.touch=null;},{passive:true});
  window.addEventListener("resize",this.resizeBound=()=>{clearTimeout(this.resizeTimer);this.resizeTimer=setTimeout(()=>{if(this.pdf)this.render(this.page,0);},180);});
  document.addEventListener("fullscreenchange",this.fullBound=()=>this.syncFull());
  this.load();
 }
 status(s){if(!this.destroyed)this.el("srAnnounce").textContent=s;}
 updatePrefs(){
  this.el("srSound").textContent=this.sound?"♪ Sound on":"♪ Sound off";
  this.el("srSound").setAttribute("aria-pressed",String(this.sound));
  const spreadOkay=this.stage.clientWidth>=735;
  this.el("srSpread").textContent=this.spread?"▣ Two pages on":"▣ Two pages off";
  this.el("srSpread").setAttribute("aria-pressed",String(this.spread));
  this.el("srSpread").disabled=!spreadOkay;
 }
 savePrefs(){try{localStorage.setItem(PREF_KEY,JSON.stringify({sound:this.sound,spread:this.spread,zoom:this.zoom}));}catch(_){}}
 syncFull(){this.el("srFullscreen").textContent=document.fullscreenElement===this.root||this.root.classList.contains("sr-fallback-full")?"Exit full screen":"⛶ Full screen";}
 async load(){
  try{
   const res=await fetch(REPORT,{credentials:"same-origin",cache:"no-store",redirect:"follow"});
   if(!res.ok)throw Error("Report not available (HTTP "+res.status+").");
   if(new URL(res.url,location.href).origin!==location.origin)throw Error("Report delivery must stay on this approved site.");
   const buffer=await res.arrayBuffer();if(this.destroyed)return;
   const bytes=new Uint8Array(buffer);
   if(bytes.length<8||String.fromCharCode(...bytes.slice(0,5))!=="%PDF-")throw Error("The configured report response is not a PDF.");
   this.raw=URL.createObjectURL(new Blob([bytes],{type:"application/pdf"}));
   this.el("srOriginal").href=this.raw;this.el("srOriginal").setAttribute("aria-disabled","false");this.el("srOriginal").tabIndex=0;
   window.dispatchEvent(new CustomEvent("service-report-opened",{detail:{file:new Blob([bytes],{type:"application/pdf"})}}));
   this.lib=await getLib();if(this.destroyed)return;
   this.task=this.lib.getDocument({data:new Uint8Array(bytes)});
   this.pdf=await this.task.promise;if(this.destroyed)return;
   this.count=this.pdf.numPages;this.page=clamp(this.page,1,this.count);
   this.el("srTotal").textContent="/ "+this.count;
   this.el("srPage").max=String(this.count);
   this.el("srLoading").hidden=true;this.book.hidden=false;
   this.el("srStatus").textContent=this.count+" pages ready";
   for(const name of ["srPrev","srNext","srPage","srListen","srReadAll","srPause","srStop","srText","srFind","srSearch","srPrint","srOriginal","srDownload"]){this.el(name).disabled=false;}
   this.updatePrefs();await this.render(this.page,0);
   this.status("Original report ready. Page "+this.page+" of "+this.count+".");
  }catch(e){
   if(this.destroyed)return;this.el("srLoading").hidden=true;this.book.hidden=true;this.el("srError").hidden=false;
   this.el("srStatus").textContent="Access required";
   this.el("srErrorCopy").textContent="This deployment does not have the authorised original PDF. The viewer is installed but publication and download require approved staff-only delivery or permission to publish the report.";
   this.status("Report not available from this deployment.");
  }
 }
 two(){return this.spread&&this.stage.clientWidth>=735&&this.count>1;}
 align(p){p=clamp(p,1,this.count||1);return this.two()&&p>1?p-p%2:p;}
 pages(){return this.two()&&this.page>1&&this.page<this.count?[this.page,this.page+1]:[this.page];}
 cancelJobs(){this.renderJobs.forEach(j=>{try{j.cancel();}catch(_){}});this.renderJobs=[];}
 async render(p,direction){
  if(!this.pdf||this.destroyed)return;
  const ticket=++this.epoch,reference=this.pdf;this.cancelJobs();this.page=this.align(p);
  const prev=this.book.querySelector(".sr-page-surface"+(direction<0?":first-child":":last-child"));
  let overlay=null;
  if(prev&&direction&&!reduced()){
   const old=prev.querySelector("canvas");if(old){
    overlay=document.createElement("canvas");overlay.width=old.width;overlay.height=old.height;
    overlay.getContext("2d").drawImage(old,0,0);overlay.style.width=prev.offsetWidth+"px";overlay.style.height=prev.offsetHeight+"px";
    overlay.style.left=prev.offsetLeft+"px";overlay.className="sr-turn"+(direction<0?" sr-back":"");
    overlay.style.transformOrigin=direction>0?"left center":"right center";
   }
  }
  const still=()=>!this.destroyed&&ticket===this.epoch&&reference===this.pdf;
  try{
   const nums=this.pages(),pages=await Promise.all(nums.map(n=>this.pdf.getPage(n)));if(!still())return;
   const rect=this.stage.getBoundingClientRect(),w=Math.max(200,rect.width-35),h=Math.max(220,rect.height-24);
   const base=pages.map(x=>x.getViewport({scale:1})),totalW=base.reduce((s,v)=>s+v.width,0),maxH=Math.max(...base.map(v=>v.height));
   const widthFit=(w-(nums.length-1)*7)/totalW,fit=Math.min(widthFit,h/maxH);
   const scale=this.zoom==="width"?widthFit:this.zoom==="fit"?fit:fit*(Number(this.zoom)||100)/100;
   const surfaces=[];
   for(let i=0;i<pages.length;i++){
    if(!still())return;
    const page=pages[i],view=page.getViewport({scale}),box=document.createElement("div"),canvas=document.createElement("canvas"),layer=document.createElement("div");
    const pixelRatio=Math.min(window.devicePixelRatio||1,2.3,Math.sqrt(12500000/Math.max(1,view.width*view.height)));
    box.className="sr-page-surface";box.style.width=view.width+"px";box.style.height=view.height+"px";
    box.setAttribute("aria-label","Original PDF page "+nums[i]);box.setAttribute("role","group");
    canvas.width=Math.ceil(view.width*pixelRatio);canvas.height=Math.ceil(view.height*pixelRatio);
    canvas.style.width="100%";canvas.style.height="100%";canvas.setAttribute("role","img");canvas.setAttribute("aria-label","Rendered page "+nums[i]);
    layer.className="textLayer";layer.style.setProperty("--scale-factor",String(scale));
    box.append(canvas,layer);
    const job=page.render({canvasContext:canvas.getContext("2d",{alpha:false}),viewport:view,transform:[pixelRatio,0,0,pixelRatio,0,0]});this.renderJobs.push(job);await job.promise;if(!still())return;
    try{if(this.lib.TextLayer){const tl=new this.lib.TextLayer({textContentSource:await page.getTextContent(),container:layer,viewport:view});await tl.render();}}catch(_){layer.replaceChildren();}
    surfaces.push(box);
   }
   if(!still())return;
   this.book.replaceChildren(...surfaces);
   if(overlay){this.book.appendChild(overlay);overlay.addEventListener("animationend",()=>overlay.remove(),{once:true});setTimeout(()=>overlay.remove(),780);}
   this.stage.scrollTop=0;this.stage.scrollLeft=0;
   this.el("srPage").value=String(this.page);
   this.el("srPrev").disabled=this.page<=1;
   this.el("srNext").disabled=this.pages().at(-1)>=this.count;
   if(direction)paperSound(this,direction);
   window.dispatchEvent(new CustomEvent("service-reader-page",{detail:{page:this.page}}));
   this.status("Page "+this.page+(this.pages().length>1?"–"+this.pages()[1]:"")+" of "+this.count+".");
   if(!this.el("srTranscript").hidden)this.showText();
  }catch(e){if(still()&&e.name!=="RenderingCancelledException")this.status("This page could not be drawn. Try changing the page size.");}
  finally{if(still())this.renderJobs=[];}
 }
 goTo(n){if(!this.pdf){this.page=Math.max(1,Math.trunc(n)||1);return;}const target=this.align(n),dir=Math.sign(target-this.page);this.stopSpeech(false);this.render(target,dir);}
 step(dir){if(!this.pdf)return;const nums=this.pages(),next=dir>0?nums[nums.length-1]+1:this.page-1;if(next<1||next>this.count)return;this.goTo(next);}
 async pageText(n){const p=await this.pdf.getPage(n),items=(await p.getTextContent()).items;return items.map(x=>(x.str||"")+(x.hasEOL?"\n":" ")).join("").trim();}
 async showText(){
  if(!this.pdf)return;const transcript=this.el("srTranscript");
  if(transcript.hidden)return;
  const at=this.page;
  try{const text=await Promise.all(this.pages().map(async n=>"Page "+n+"\n"+(await this.pageText(n)||"No extractable text on this page.")));
   if(!this.destroyed&&at===this.page)transcript.textContent=text.join("\n\n");
  }catch(_){transcript.textContent="Page text could not be extracted.";}
 }
 stopSpeech(update=true){this.speechEpoch++;this.reading=false;if("speechSynthesis" in window)window.speechSynthesis.cancel();if(update)this.status("Reading stopped.");this.el("srListen").textContent="▶ Listen";}
 speakPart(text,token){
  return new Promise(resolve=>{
   if(!("speechSynthesis" in window)||token!==this.speechEpoch)return resolve(false);
   const synth=window.speechSynthesis,u=new SpeechSynthesisUtterance(text),voices=synth.getVoices();
   const voice=voices.find(v=>/^en-JM/i.test(v.lang))||voices.find(v=>/^en/i.test(v.lang));
   if(voice){u.voice=voice;u.lang=voice.lang;}else u.lang="en";
   u.rate=.98;
   u.onend=()=>resolve(token===this.speechEpoch);u.onerror=()=>resolve(false);
   synth.speak(u);
  });
 }
 async read(all){
  if(!this.pdf||!("speechSynthesis" in window))return this.status("Voice reading is not supported by this browser.");
  this.stopSpeech(false);this.reading=true;const token=this.speechEpoch,end=all?this.count:this.pages().at(-1);
  this.el("srListen").textContent="■ Stop";
  try{
   for(let n=this.page;n<=end;n++){
    if(token!==this.speechEpoch)return;
    if(n!==this.page)await this.render(n,0);
    const content=await this.pageText(n);if(token!==this.speechEpoch)return;
    if(!content){this.status("Page "+n+" contains no extractable text.");continue;}
    this.status("Reading aloud: page "+n+" of "+this.count+".");
    const segments=content.match(/[\s\S]{1,600}/g)||[];
    for(const part of segments){if(token!==this.speechEpoch||!await this.speakPart(part,token))return;}
   }
   if(token===this.speechEpoch)this.status("Reading finished.");
  }catch(_){this.status("Voice reading could not finish.");}
  finally{if(token===this.speechEpoch){this.reading=false;this.el("srListen").textContent="▶ Listen";}}
 }
 async find(){
  if(!this.pdf)return;const q=this.el("srSearch").value.trim().toLowerCase();if(q.length<2)return this.status("Enter at least two characters to search.");
  const ticket=++this.searchEpoch;this.el("srFind").disabled=true;this.status("Searching the report…");
  try{
   for(let i=1;i<=this.count;i++){
    const n=(this.page+i-1)%this.count+1;
    const t=(await this.pageText(n)).toLowerCase();
    if(ticket!==this.searchEpoch||this.destroyed)return;
    if(t.includes(q)){this.goTo(n);this.status("Found “"+q+"” on PDF page "+n+".");return;}
   }
   this.status("No match found for “"+q+"”.");
  }catch(_){this.status("The text search could not be completed.");}
  finally{this.el("srFind").disabled=false;}
 }
 download(){
  if(!this.raw)return;const a=document.createElement("a");a.href=this.raw;a.download="Internal_CSAT_Report_2025_Final.pdf";
  document.body.appendChild(a);a.click();a.remove();this.status("Download requested: original PDF.");
 }
 print(){if(!this.raw)return;const tab=window.open(this.raw,"_blank","noopener");if(!tab)this.status("Allow pop-ups to open the report for printing.");}
 async fullscreen(){
  if(document.fullscreenElement===this.root){await document.exitFullscreen();return;}
  if(this.root.classList.contains("sr-fallback-full")){this.root.classList.remove("sr-fallback-full");this.syncFull();return;}
  try{await this.root.requestFullscreen();}catch(_){this.root.classList.add("sr-fallback-full");}
  this.syncFull();setTimeout(()=>{if(this.pdf)this.render(this.page,0);},180);
 }
 onClick(e){
  const b=e.target.closest("button");if(!b||!this.root.contains(b))return;
  const id=b.id;
  if(id==="srPrev")this.step(-1);
  if(id==="srNext")this.step(1);
  if(id==="srListen")this.reading?this.stopSpeech():this.read(false);
  if(id==="srReadAll")this.read(true);
  if(id==="srPause"&&"speechSynthesis" in window){const x=window.speechSynthesis;x.paused?x.resume():x.pause();b.textContent=x.paused?"Resume":"Pause";}
  if(id==="srStop")this.stopSpeech();
  if(id==="srSound"){this.sound=!this.sound;this.savePrefs();this.updatePrefs();}
  if(id==="srSpread"){this.spread=!this.spread;this.savePrefs();this.updatePrefs();this.render(this.page,0);}
  if(id==="srFullscreen")this.fullscreen();
  if(id==="srDownload")this.download();
  if(id==="srPrint")this.print();
  if(id==="srFind")this.find();
  if(id==="srText"){const el=this.el("srTranscript");el.hidden=!el.hidden;b.textContent=el.hidden?"Show page text":"Hide page text";if(!el.hidden)this.showText();}
 }
 onChange(e){
  if(e.target.id==="srPage")this.goTo(Number(e.target.value));
  if(e.target.id==="srZoom"){this.zoom=e.target.value;this.savePrefs();this.render(this.page,0);}
  if(e.target.id==="srSearch")this.find();
 }
 destroy(){
  this.destroyed=true;this.epoch++;this.searchEpoch++;this.stopSpeech(false);this.cancelJobs();clearTimeout(this.resizeTimer);
  if(this.task){try{this.task.destroy();}catch(_){}}
  if(this.raw)URL.revokeObjectURL(this.raw);
  this.root.removeEventListener("click",this.clickBound);this.root.removeEventListener("change",this.changeBound);
  window.removeEventListener("resize",this.resizeBound);document.removeEventListener("fullscreenchange",this.fullBound);
  if(document.fullscreenElement===this.root)document.exitFullscreen().catch(()=>{});
  if(this.audio)this.audio.close().catch(()=>{});
 }
}
window.ServiceReader={
 mount(root,start){if(active){active.destroy();active=null;}if(root)active=new Reader(root,start||1);},
 goTo(n){if(active)active.goTo(n);},
 unmount(){if(active){active.destroy();active=null;}},
 hasReport(){return !!(active&&active.pdf);}
};
})();