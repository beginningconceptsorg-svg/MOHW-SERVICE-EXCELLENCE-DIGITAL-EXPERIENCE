/* Quantized MiniLM runs on CPU; no visitor text is sent to a model service. */
let extractor,vectors=[],busy=false;
self.onmessage=async({data:m})=>{if(busy)return;busy=true;try{
 if(m.type==="init"){
 const {pipeline,env}=await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.7.2");
 env.allowLocalModels=false;env.useBrowserCache=true;if(env.backends?.onnx?.wasm)env.backends.onnx.wasm.numThreads=1;
 extractor=await pipeline("feature-extraction","Xenova/all-MiniLM-L6-v2",{device:"wasm",dtype:"q8"});
 vectors=[];for(let i=0;i<m.items.length;i+=4){let batch=m.items.slice(i,i+4),t=await extractor(batch.map(x=>x.text),{pooling:"mean",normalize:true}),rows=t.tolist();for(let j=0;j<batch.length;j++)vectors.push({id:batch[j].id,v:rows[j]});t.dispose?.();}
 self.postMessage({type:"ready"});
 }else if(m.type==="search"&&extractor){let t=await extractor(String(m.q).slice(0,600),{pooling:"mean",normalize:true}),v=t.tolist()[0];t.dispose?.();self.postMessage({type:"result",id:m.id,rows:vectors.map(n=>({id:n.id,score:n.v.reduce((s,x,i)=>s+x*v[i],0)})).sort((a,b)=>b.score-a.score).slice(0,5)});}
 }catch(e){self.postMessage({type:"error"});}finally{busy=false;}};
