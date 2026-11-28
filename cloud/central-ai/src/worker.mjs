import { DurableObject } from "cloudflare:workers";
import { registry } from "./registry.mjs";
import { MODEL,LIMITS,reserve,runChat } from "./logic.mjs";
import { pilotPage } from "./pilot.mjs";

const json=(value,status=200,origin)=>new Response(JSON.stringify(value),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff",...(origin?{"Access-Control-Allow-Origin":origin,"Vary":"Origin"}:{})}});
export class DailyBudget extends DurableObject {
 constructor(ctx,env){super(ctx,env);this.ctx=ctx;ctx.storage.sql.exec("CREATE TABLE IF NOT EXISTS usage (id INTEGER PRIMARY KEY, value TEXT NOT NULL)");}
 reserve(tenant){if(!Object.hasOwn(registry,tenant))return false;return this.ctx.storage.transactionSync(()=>{const row=this.ctx.storage.sql.exec("SELECT value FROM usage WHERE id=1").toArray()[0];const result=reserve(row?JSON.parse(row.value):null,tenant,Date.now());if(result.ok)this.ctx.storage.sql.exec("INSERT INTO usage(id,value) VALUES(1,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value",JSON.stringify(result.state));return result.ok;});}
}
function sameKey(a,b){if(typeof a!=="string"||typeof b!=="string"||b.length<32||a.length!==b.length)return false;let d=0;for(let i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
async function readLimited(req){if(!req.body)return null;const r=req.body.getReader();let size=0,parts=[];try{while(true){const {done,value}=await r.read();if(done)break;size+=value.byteLength;if(size>LIMITS.maxBytes){await r.cancel();return null;}parts.push(value);}let buf=new Uint8Array(size),off=0;for(let p of parts){buf.set(p,off);off+=p.length;}return JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(buf));}catch{return null;}}
function publicOrigins(env){return Object.values(registry).filter(t=>env[t.publicFlag]==="true"&&env.TURNSTILE_SECRET).map(t=>t.origin);}
async function turnstile(token,tenant,env){if(typeof token!=="string"||!token||token.length>2048||!env.TURNSTILE_SECRET)return false;try{let r=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({secret:env.TURNSTILE_SECRET,response:token}),signal:AbortSignal.timeout(4000)});let x=await r.json();return r.ok&&x.success===true&&x.hostname===new URL(tenant.origin).hostname&&x.action=== "bc-ai";}catch{return false;}}
export default {async fetch(req,env){
 const path=new URL(req.url).pathname,origin=req.headers.get("Origin"),allowed=publicOrigins(env).includes(origin)?origin:null;
 if(req.method==="GET"&&path==="/")return new Response(pilotPage,{headers:{"Content-Type":"text/html; charset=utf-8","Cache-Control":"no-store","X-Content-Type-Options":"nosniff","Referrer-Policy":"no-referrer","Content-Security-Policy":"default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; connect-src 'self'; form-action 'none'; frame-ancestors 'none'; base-uri 'none'"}});
 if(req.method==="GET"&&path==="/health")return json({service:"BC Central AI",version:"0.1.0",pilot_enabled:env.AI_ENABLED==="true"&&env.FREE_PLAN_CONFIRMED==="true"&&typeof env.PILOT_KEY==="string"&&env.PILOT_KEY.length>=32,model:MODEL});
 if(path!=="/v1/chat")return json({fallback:true,reason:"not_found"},404);
 if(req.method==="OPTIONS"){if(!allowed)return json({fallback:true},403);return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":allowed,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Access-Control-Max-Age":"300","Vary":"Origin"}});}
 if(req.method!=="POST"||!/^application\/json(?:;|$)/i.test(req.headers.get("Content-Type")||""))return json({fallback:true},405,allowed);
 const body=await readLimited(req);
 const authorize=async(b,t)=>{
  const auth=req.headers.get("Authorization")||"";
  if(sameKey(auth.startsWith("Bearer ")?auth.slice(7):"",env.PILOT_KEY)&&(!origin||origin===new URL(req.url).origin))return true;
  return env[t.publicFlag]==="true"&&origin===t.origin&&await turnstile(b.turnstile_token,t,env);
 };
 const reserveSlot=async tenant=>{try{return await env.BUDGET.get(env.BUDGET.idFromName("global-v1")).reserve(tenant);}catch{return false;}};
 const result=await runChat({body,registry,env,authorize,reserveSlot});return json(result.data,result.status,allowed);
}};
