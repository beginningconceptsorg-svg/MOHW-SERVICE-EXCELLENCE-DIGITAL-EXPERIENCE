/* Browser speech recognition adapter: explicit user gesture, transcript review,
   cancellation, capability/error handling. Speech may be processed by browser provider. */
(function(root){
"use strict";
function createVoice({getRecognition,onState,onTranscript,onSubmit,onError}){
 let current=null,seq=0;
 const cancel=()=>{seq++;let old=current;current=null;if(old)try{old.abort();}catch(e){}onState("idle");};
 function start({language="en-GB",autoSend=false}={}){
  if(current){cancel();return false;}
  let Constructor=getRecognition();if(!Constructor){onError("Voice input is not supported by this browser. You can type or use your keyboard's dictation button.");return false;}
  let rec,epoch=++seq,final="",failed=false;
  try{rec=new Constructor();current=rec;rec.lang=language;rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;
   rec.onstart=()=>{if(epoch===seq)onState("listening");};
   rec.onresult=e=>{if(epoch!==seq)return;let confirmed="",interim="";for(let i=0;i<e.results.length;i++){let v=e.results[i],t=v[0]?.transcript||"";if(v.isFinal)confirmed+=t+" ";else interim+=t+" ";}final=confirmed.trim();onTranscript((confirmed+interim).trim());};
   rec.onerror=e=>{if(epoch!==seq)return;failed=true;let messages={"not-allowed":"Microphone access was denied. Allow it in browser settings or type your question.","service-not-allowed":"Speech recognition is blocked by this browser. Try keyboard dictation.","no-speech":"I didn't hear a question. Tap the microphone and try again.","audio-capture":"No working microphone was detected.","network":"Speech recognition could not connect. Try again or type your question.","language-not-supported":"This language isn't supported on your device. Try another voice language."};onError(messages[e.error]||"Voice input stopped. You can retry or type your question.");};
   rec.onend=()=>{if(epoch!==seq)return;current=null;onState("idle");if(!failed&&final){onTranscript(final);if(autoSend)onSubmit(final);else onState("review");}else if(!failed)onError("No speech was recognised. Please try again.");};
   onState("starting");rec.start();return true;
  }catch(e){current=null;onState("idle");onError("The microphone could not start. Check your browser permissions or type your question.");return false;}
 }
 function stop(){if(current){try{current.stop();}catch(e){cancel();}}}
 return {start,stop,cancel,active:()=>!!current};
}
root.ServiceGuideVoice={createVoice};
})(window);
