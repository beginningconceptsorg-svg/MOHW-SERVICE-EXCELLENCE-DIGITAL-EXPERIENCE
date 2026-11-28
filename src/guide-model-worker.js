/* Optional local inference. No chat requests are sent to an inference provider.
   Only the pinned runtime and model assets are downloaded. */
let generator=null,busy=false;
const models={
 compact:{id:"onnx-community/Qwen2.5-0.5B-Instruct",device:"wasm",dtype:"q8"},
 advanced:{id:"onnx-community/Qwen2.5-1.5B-Instruct",device:"webgpu",dtype:"q4f16"}
};
self.onmessage=async({data:m})=>{
 if(busy)return;busy=true;
 try{
  if(m.type==="load"){
   const spec=models[m.mode];if(!spec)throw Error("Unknown model");
   if(spec.device==="webgpu"){const adapter=await self.navigator.gpu?.requestAdapter();if(!adapter||!adapter.features.has("shader-f16"))throw Error("This device does not support the required WebGPU features. Try Compact.");}
   const {pipeline,env}=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2");
   env.allowLocalModels=false;env.useBrowserCache=true;
   if(env.backends?.onnx?.wasm)env.backends.onnx.wasm.numThreads=1;
   const progress_callback=p=>{if(p.status==="progress")self.postMessage({id:m.id,type:"progress",file:String(p.file||"").split("/").pop(),percent:Math.max(0,Math.min(100,Number(p.progress)||0))});};
   generator=await pipeline("text-generation",spec.id,{device:spec.device,dtype:spec.dtype,progress_callback});
   // Verify the model actually produces tokens before advertising readiness.
   await generator([{role:"user",content:"Reply OK."}],{max_new_tokens:4,do_sample:false});
   self.postMessage({id:m.id,type:"ready"});
  }else if(m.type==="generate"){
   if(!generator)throw Error("Model not ready");
   const result=await generator(m.messages,{max_new_tokens:Math.min(180,Math.max(8,m.maxTokens||80)),do_sample:false});
   const out=result?.[0]?.generated_text;const text=Array.isArray(out)?out.at(-1)?.content:out;
   if(typeof text!=="string"||!text.trim())throw Error("No model output");
   self.postMessage({id:m.id,type:"result",text:text.trim().slice(0,2500)});
  }
 }catch(e){self.postMessage({id:m.id,type:"error",message:String(e?.message||e).slice(0,300)});}
 finally{busy=false;}
};
