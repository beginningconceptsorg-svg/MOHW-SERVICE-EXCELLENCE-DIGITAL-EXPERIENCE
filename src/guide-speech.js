/* Speech presentation is separate from the written evidence. Browser voices vary by device. */
(function(root){
"use strict";
const female=/\b(female|woman|samantha|zira|aria|jenny|sonia|libby|serena|karen|moira|tessa|victoria|susan|emma|olivia|ava|allison|salli|joanna|amy|natasha|hazel|catherine|sara|sarah|stephanie|michelle|shelley|madison|matilda|jessica)\b/i;
const male=/\b(male|man|david|mark|george|daniel|alex|fred|james|guy|brian|ryan|arthur|thomas|gordon)\b/i;
function score(v){let n=(v.name||"")+" "+(v.voiceURI||""),lang=(v.lang||"").toLowerCase();if(!/^en(?:-|$)/.test(lang))return -1000;let a=0;if(/neural|natural|enhanced|premium|online|wavenet/i.test(n))a+=55;if(female.test(n))a+=45;if(male.test(n))a-=70;if(lang==="en-jm")a+=25;else if(lang==="en-gb")a+=15;else if(lang==="en-us")a+=12;if(/google|microsoft/i.test(n))a+=9;if(/compact|espeak|robot|festival/i.test(n))a-=45;return a;}
function ranked(voices){return Array.from(voices||[]).filter(v=>/^en(?:-|$)/i.test(v.lang||"")).sort((a,b)=>score(b)-score(a));}
function choose(voices,uri){let all=ranked(voices);return all.find(v=>uri&&v.voiceURI===uri)||all[0]||null;}
function verbalize(text){return String(text||"")
 .replace(/\bPDF p(?:age)?\.?\s*(\d+)/gi,"page $1").replace(/\bCSAT\b/g,"customer satisfaction").replace(/\bMOHW\b/g,"Ministry of Health and Wellness").replace(/\bEEHCSD\b/g,"Enabling Environment in Health and Client Services Division").replace(/\bNPHL\b/g,"National Public Health Laboratory").replace(/\bHRMD\b/g,"Human Resource Management and Development").replace(/\bSLA(s)?\b/g,"service level agreement$1").replace(/\bSOP(s)?\b/g,"standard operating procedure$1").replace(/\bKPI(s)?\b/g,"key performance indicator$1").replace(/\bFGD(s)?\b/g,"focus group discussion$1").replace(/\bPMAS\b/g,"P M A S").replace(/\bFY\b/g,"financial year").replace(/\bpp\b/g,"percentage points").replace(/(\d)\s*%/g,"$1 percent").replace(/(\d)\s*\/\s*(\d)/g,"$1 out of $2").replace(/([0-9])\s*[–—]\s*([0-9])/g,"$1 to $2").replace(/≥/g,"at least ").replace(/≤/g,"at most ").replace(/</g," less than ").replace(/>/g," greater than ").replace(/÷/g," divided by ").replace(/×/g," times ").replace(/≈/g," approximately ").replace(/−/g," minus ").replace(/\s*\|\s*/g,"; ").replace(/^[•*-]\s*/gm,"").replace(/\n{2,}/g,". ").replace(/\n/g,". ").replace(/([.!?])\s*\./g,"$1").replace(/\s+/g," ").trim();}
function sentences(text){return text.match(/[^.!?]+(?:[.!?](?!\d)|$)/g)||[text];}
function spoken(text,{brief=false,custom=""}={}){if(custom&&brief)return verbalize(custom);let t=String(text||"");if(brief&&t.length>360){let rows=t.split("\n").map(x=>x.trim()).filter(Boolean);let first=rows[0]||"",body=sentences(first).slice(0,2).join("").trim();if(body.length<90&&rows.length>1)body+=" "+rows[1].replace(/^[•*-]\s*/,"");if(body.length>410)body=body.slice(0,390).replace(/\s+\S*$/,"")+".";
 return verbalize(body)+" I've put the full details and any source links in our chat.";
 }return verbalize(t);}
function chunks(text){let out=[],buf="";for(let part of sentences(text)){part=part.trim();if(!part)continue;if(part.length>240){let words=part.split(/\s+/);for(let word of words){if((buf+" "+word).length>220){out.push(buf.trim());buf="";}buf+=(buf?" ":"")+word;}continue;}if(buf&&buf.length+part.length>240){out.push(buf);buf="";}buf+=(buf?" ":"")+part;}if(buf)out.push(buf.trim());return out.filter(Boolean);}
function makePlayer({synth,Utterance,onState=()=>{},onError=()=>{}}){
 let generation=0;let current=null;
 function stop(){generation++;current=null;try{synth.cancel();}catch(e){}onState("idle");}
 function play(text,{voiceURI="",rate=1.12,pitch=1.05,volume=1,brief=false,custom=""}={}){
 stop();let id=generation,selected=choose(synth.getVoices(),voiceURI),parts=chunks(spoken(text,{brief,custom}));if(!parts.length)return;
 let i=0;const step=()=>{if(generation!==id)return;if(i>=parts.length){current=null;onState("idle");return;}let u=new Utterance(parts[i++]);current=u;if(selected)u.voice=selected;u.lang=selected?.lang||"en-GB";u.rate=Math.max(.85,Math.min(1.4,Number(rate)||1.12));u.pitch=Math.max(.8,Math.min(1.25,Number(pitch)||1.05));u.volume=Math.max(0,Math.min(1,Number(volume)||0));u.onstart=()=>{if(id===generation)onState("speaking");};u.onend=step;u.onerror=e=>{if(id!==generation)return;current=null;onState("idle");if(!["interrupted","canceled"].includes(e.error))onError("This voice could not play. Try another available voice.");};try{synth.speak(u);}catch(e){current=null;onState("idle");onError("Speech playback could not start.");}};onState("speaking");step();
 }
 return {play,stop,active:()=>!!current};
}
root.GuideSpeech={ranked,choose,verbalize,spoken,chunks,makePlayer};
})(window);
