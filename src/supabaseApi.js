// ============================================================================
// Banki Dairy Farm — Supabase data adapter
// Drop-in replacement for the Apps Script apiGet/apiPost. Returns the SAME JSON
// shapes Code.gs returned, so App.jsx screens are unchanged. Calculation-heavy
// reads reuse the logic validated in calc_logic.js (inlined here).
//
// Wiring (Phase 4): in App.jsx, replace the SCRIPT_URL + apiGet/apiPost block
// with:  import { apiGet, apiPost } from "./supabaseApi";
// and set the two constants below.
// ============================================================================
// No external dependency: a tiny PostgREST client over the browser's fetch, with
// the same chainable shape the rest of this file uses (from().select().eq()… ,
// insert/upsert/update/delete). Nothing to npm-install.
const SUPABASE_URL = "https://upfirefzywvjqitnkwnb.supabase.co";      // base URL (no /rest/v1)
const SUPABASE_KEY = "sb_publishable_tqPRM5fUI9SgGcFDvmsyMw_Pvgo_z0u";
const _REST = SUPABASE_URL.replace(/\/+$/,"") + "/rest/v1";
const _AUTH = { apikey: SUPABASE_KEY, Authorization: "Bearer " + SUPABASE_KEY };

async function _exec(s){
  const params = [];
  if (s.method === "GET") params.push("select=" + (s.select || "*"));
  s.filters.forEach(f => params.push(f));
  if (s.order) params.push("order=" + s.order);
  if (s.limit != null) params.push("limit=" + s.limit);
  if (s.onConflict) params.push("on_conflict=" + s.onConflict);
  const url = _REST + "/" + s.table + (params.length ? "?" + params.join("&") : "");
  const headers = { ..._AUTH };
  if (s.body != null) headers["Content-Type"] = "application/json";
  if (s.prefer.length) headers["Prefer"] = s.prefer.join(",");
  if (s.range) headers["Range"] = s.range[0] + "-" + s.range[1];
  const opt = { method: s.method, headers };
  if (s.body != null) opt.body = JSON.stringify(s.body);
  let r;
  try { r = await fetch(url, opt); }
  catch (e) { return { data: null, error: { message: e.message } }; }
  if (!r.ok) { let t = ""; try { t = await r.text(); } catch (_) {} return { data: null, error: { message: r.status + " " + t } }; }
  let data = null;
  if (s.method === "GET") { try { data = await r.json(); } catch (_) { data = []; } }
  return { data, error: null };
}
function _from(table){
  const s = { table, method:"GET", select:"*", filters:[], order:null, range:null, limit:null, body:null, onConflict:null, prefer:[] };
  const b = {
    select(cols="*"){ s.select=cols; return b; },
    insert(rows){ s.method="POST"; s.body=Array.isArray(rows)?rows:[rows]; s.prefer.push("return=minimal"); return b; },
    upsert(rows,opts){ s.method="POST"; s.body=Array.isArray(rows)?rows:[rows]; if(opts&&opts.onConflict)s.onConflict=opts.onConflict; s.prefer.push("resolution=merge-duplicates","return=minimal"); return b; },
    update(patch){ s.method="PATCH"; s.body=patch; s.prefer.push("return=minimal"); return b; },
    delete(){ s.method="DELETE"; s.prefer.push("return=minimal"); return b; },
    eq(col,val){ s.filters.push(col+"=eq."+encodeURIComponent(val)); return b; },
    order(col,opts){ s.order=col+"."+((opts&&opts.ascending===false)?"desc":"asc"); return b; },
    limit(n){ s.limit=n; return b; },
    range(a,c){ s.range=[a,c]; return b; },
    then(resolve,reject){ _exec(s).then(resolve,reject); },
  };
  return b;
}
const supabase = { from: _from };

// Farm logo for printed bills (from the original Code.gs).
const BILL_LOGO = "data:image/jpeg;base64,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";

const FEED_BUILTIN_KEYS = ["chokar","arhar","bhoosa","barseem","jaggery","mineral"];
const CONV = 0.97, BUCKET = 1.18;
const num = v => { if (v==null||v==="") return 0; const n=parseFloat(v); return isNaN(n)?0:n; };
const r2  = x => Math.round(x*100)/100;
const measToLtrs = kg => Math.max(0,(parseFloat(kg)||0)*CONV);
const isoOf = d => { const t=new Date(d); return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0"); };
const prevIso = iso => { const m=iso.match(/^(\d{4})-(\d{2})-(\d{2})$/); if(!m) return ""; const dt=new Date(+m[1],+m[2]-1,+m[3]); dt.setDate(dt.getDate()-1); return isoOf(dt); };

// ── paginated full-table fetch (PostgREST caps a page at 1000 rows) ──
async function fetchAll(table, cols="*") {
  const out=[]; let from=0; const PAGE=1000;
  for(;;){ const {data,error}=await supabase.from(table).select(cols).range(from,from+PAGE-1);
    if(error) throw new Error(table+": "+error.message);
    out.push(...data); if(data.length<PAGE) break; from+=PAGE; }
  return out;
}

// ── load everything the calc/read functions need, shaped like the old loaders ──
let _cache=null, _cacheAt=0;
async function loadDb(force){
  if(!force && _cache && Date.now()-_cacheAt<4000) return _cache;
  const [customers,cattle,cattleFeed,feedCats,production,productionDay,dispatch,settingsRows,history,transactions,other] =
    await Promise.all([
      fetchAll("customers"),fetchAll("cattle"),fetchAll("cattle_feed"),fetchAll("feed_categories"),
      fetchAll("production"),fetchAll("production_day"),fetchAll("dispatch"),fetchAll("settings"),
      fetchAll("revenue_history"),fetchAll("transactions"),fetchAll("other_proceeds")]);
  const settings={}; settingsRows.forEach(r=>settings[r.key]=r.value);
  const catById={}; cattle.forEach(c=>catById[c.id]=c);
  const custById={}; customers.forEach(c=>custById[c.id]=c);
  const feedByCattle={}; cattleFeed.forEach(f=>{ (feedByCattle[f.cattle_id]||(feedByCattle[f.cattle_id]=[])).push(f); });
  const db={
    _raw:{customers,cattle,cattleFeed,feedCats,productionDay,history,other,catById,custById,feedByCattle},
    customers: customers.map(c=>({rowIndex:c.id,name_en:c.name_en,name_hi:c.name_hi||"",name_ur:c.name_ur||"",
      slot:c.slot,type:c.type,phone:c.phone||"",selfCollect:!!c.self_collect,active:c.active!==false,
      rate:(c.rate==null?null:num(c.rate)),sort_order:num(c.sort_order)})),
    cattle: cattle.map(c=>({id:c.id,code:c.code,type:c.type,sold:!!c.sold,sold_date:c.sold_date,
      sold_price:c.sold_price,date_in:c.date_in,lastCalving:c.last_calving})),
    production: production.map(p=>({date:p.date,slot:p.slot,litres:num(p.litres),
      type:catById[p.cattle_id]?catById[p.cattle_id].type:"B",code:catById[p.cattle_id]?catById[p.cattle_id].code:null})),
    production_day: productionDay.map(r=>({date:r.date,slot:r.slot,measured_b:r.measured_b,measured_c:r.measured_c,
      purchased:r.purchased,purchase_rate:r.purchase_rate,extra:r.extra,extra_rate:r.extra_rate,extra_sold:!!r.extra_sold})),
    dispatch: dispatch.map(d=>({date:d.date,litres:num(d.litres),nil:!!d.nil,
      name_en:custById[d.customer_id]?custById[d.customer_id].name_en:null,
      type:custById[d.customer_id]?custById[d.customer_id].type:"B",
      rate:custById[d.customer_id]&&custById[d.customer_id].rate!=null?num(custById[d.customer_id].rate):null,
      slot:custById[d.customer_id]?custById[d.customer_id].slot:"morning"})),
    settings, history: history.map(h=>({month:h.month,revenue:num(h.revenue),produced:num(h.produced),sourced:num(h.sourced),sold:num(h.sold)})),
    transactions: transactions.map(t=>({rowIndex:t.id,date:t.date||"",name:t.name||"",category:t.category||"",
      subCategory:t.subcategory||"",payer:t.payer||"",amount:num(t.amount),loggedAt:t.logged_at||""})),
    other_proceeds: other.map(o=>({rowIndex:o.id,date:o.date||"",name:o.name||"",amount:num(o.amount),person:o.person||""})),
  };
  _cache=db; _cacheAt=Date.now(); return db;
}
function invalidate(){ _cache=null; }

// ── settings-derived config ──
function rates(db){ const s=db.settings;
  let rateB=70,rateC=60,activeCattle=10;
  if(s.rate_buffalo!=null&&!isNaN(parseFloat(s.rate_buffalo)))rateB=parseFloat(s.rate_buffalo);
  if(s.rate_cow!=null&&!isNaN(parseFloat(s.rate_cow)))rateC=parseFloat(s.rate_cow);
  if(s.active_cattle!=null&&!isNaN(parseInt(s.active_cattle)))activeCattle=parseInt(s.active_cattle);
  return {rateB,rateC,activeCattle}; }
function qtyOptions(db){ const raw=(db.settings.qty_options||"").trim();
  if(!raw) return ["0.5","1","1.5","2","3","10"];
  const a=raw.split(",").map(x=>x.trim()).filter(Boolean); return a.length?a:["0.5","1","1.5","2","3","10"]; }
function custMaps(db){ const TYPE={},RATE={},SLOT={};
  db.customers.forEach(c=>{TYPE[c.name_en]=c.type; if(c.rate!=null)RATE[c.name_en]=c.rate; SLOT[c.name_en]=c.slot;}); return {TYPE,RATE,SLOT}; }
function loadFeedRates(db){ const current={chokar:28,arhar:28,bhoosa:12,barseem:1,jaggery:50,mineral:80};
  const ideal={chokar:22,arhar:22,bhoosa:7,barseem:0.5,jaggery:40,mineral:80};
  Object.keys(db.settings).forEach(k=>{ const v=parseFloat(db.settings[k]); if(isNaN(v))return;
    const m=k.match(/^feed_(rate|ideal)_([a-z0-9_]+)$/); if(m)(m[1]==="rate"?current:ideal)[m[2]]=v; });
  return {current,ideal}; }
function loadHistory(db){ const o={}; db.history.forEach(h=>{ if(/^\d{4}-\d{2}$/.test(h.month))o[h.month]={revenue:h.revenue,produced:h.produced,sourced:h.sourced,sold:h.sold}; }); return o; }

// ── shared maps (mirror Code.gs) ──
function buildProd(db){ const P={};
  const E=d=>{ if(!P[d])P[d]={morning:0,evening:0,B:0,C:0,mB:0,eB:0,mC:0,eC:0,sourced:0,mSrc:0,eSrc:0,extraSold:0,extraRev:0,mExtraSold:0,eExtraSold:0,mExtraRev:0,eExtraRev:0}; return P[d]; };
  db.production.forEach(r=>{ const o=E(r.date),v=r.litres;
    if(r.slot==="morning"){ if(r.type==="B"){o.mB+=v;o.B+=v;}else{o.mC+=v;o.C+=v;} o.morning+=v; }
    else { if(r.type==="B"){o.eB+=v;o.B+=v;}else{o.eC+=v;o.C+=v;} o.evening+=v; } });
  db.production_day.forEach(r=>{ const o=E(r.date),pu=num(r.purchased);
    o.sourced+=pu; if(r.slot==="morning")o.mSrc+=pu; else o.eSrc+=pu;
    if(r.extra_sold){ const l=num(r.extra),rv=l*num(r.extra_rate); o.extraSold+=l;o.extraRev+=rv;
      if(r.slot==="morning"){o.mExtraSold+=l;o.mExtraRev+=rv;}else{o.eExtraSold+=l;o.eExtraRev+=rv;} } });
  return P; }
function buildDisp(db){ const {rateB,rateC}=rates(db),{TYPE,RATE,SLOT}=custMaps(db),D={},REV={};
  db.dispatch.forEach(row=>{ const q=row.litres; if(!(q>0))return; const d=row.date;
    if(!D[d])D[d]={B:0,C:0,mL:0,eL:0,mRev:0,eRev:0}; if(REV[d]==null)REV[d]=0;
    const nm=row.name_en,t=TYPE[nm]||"B",rate=(RATE[nm]!=null?RATE[nm]:(t==="B"?rateB:rateC)),rev=q*rate;
    D[d][t]+=q; REV[d]+=rev; const sl=(SLOT[nm]==="evening")?"e":"m"; D[d][sl+"L"]+=q; D[d][sl+"Rev"]+=rev; });
  return {D,REV}; }

// ── calculations (validated in calc_logic.js) ──
function calcPnL(db){ const {rateB,rateC}=rates(db); const overheads={};
  Object.keys(db.settings).forEach(k=>{ const m=k.match(/^cost_(\w+)_monthly$/); const v=parseFloat(db.settings[k]); if(m&&!isNaN(v))overheads[m[1]]=v; });
  const {D:dispByDate,REV:dispRev}=buildDisp(db); const purch={},extra={},prodTot={};
  const bd={}; db.production.forEach(r=>bd[r.date]=(bd[r.date]||0)+r.litres); Object.assign(prodTot,bd);
  db.production_day.forEach(r=>{ purch[r.date]=(purch[r.date]||0)+num(r.purchased)*num(r.purchase_rate); if(r.extra_sold)extra[r.date]=(extra[r.date]||0)+num(r.extra)*num(r.extra_rate); });
  const seen={},dates=[]; Object.keys(dispByDate).concat(Object.keys(extra)).concat(Object.keys(purch)).forEach(d=>{ if(!seen[d]&&/^\d{4}-\d{2}-\d{2}$/.test(d)){seen[d]=1;dates.push(d);} });
  dates.sort((a,b)=>b.localeCompare(a)); const liveRev=d=>(dispRev[d]||0)+(extra[d]||0);
  const days=dates.map(d=>{const disp=dispRev[d]||0,ex=extra[d]||0;return {date:d,dispatchRev:disp,extraRev:ex,revenue:disp+ex,purchased:purch[d]||0};});
  const liveMonth={},lm=m=>{if(!liveMonth[m])liveMonth[m]={revenue:0,produced:0,sold:0};return liveMonth[m];};
  dates.forEach(d=>{const o=lm(d.substring(0,7));o.revenue+=liveRev(d);const x=dispByDate[d]||{B:0,C:0};o.sold+=x.B+x.C;});
  Object.keys(prodTot).forEach(d=>{if(/^\d{4}-\d{2}-\d{2}$/.test(d))lm(d.substring(0,7)).produced+=prodTot[d];});
  const hist=loadHistory(db); const txn={byMonth:{}}; db.transactions.forEach(t=>{const d=t.date;if(!d)return;const mo=d.substring(0,7);const cat=(t.category||"").trim();const sub=(t.subCategory||"").trim()||"Other";const a=t.amount;if(!txn.byMonth[mo])txn.byMonth[mo]={opexTotal:0,opexBySub:{},capexTotal:0};if(cat.toLowerCase()==="capex")txn.byMonth[mo].capexTotal+=a;else{txn.byMonth[mo].opexTotal+=a;txn.byMonth[mo].opexBySub[sub]=(txn.byMonth[mo].opexBySub[sub]||0)+a;}});
  const iv=db.cattle.map(c=>({start:c.date_in||"",end:c.sold_date||""}));
  const avg=(m)=>{const [y,mo]=m.split("-").map(Number);const ms=Date.UTC(y,mo-1,1),me=Date.UTC(y,mo,1),dim=(me-ms)/864e5;let s=0;iv.forEach(x=>{const a=x.start?Date.parse(x.start+"T00:00:00Z"):-8.64e15;const e=x.end?Date.parse(x.end+"T00:00:00Z")+864e5:8.64e15;const lo=Math.max(a,ms),hi=Math.min(e,me);if(hi>lo)s+=(hi-lo)/864e5;});return Math.round(s/dim*100)/100;};
  const ms={},ml=[]; Object.keys(hist).concat(Object.keys(liveMonth)).concat(Object.keys(txn.byMonth)).forEach(m=>{if(!ms[m]&&/^\d{4}-\d{2}$/.test(m)){ms[m]=1;ml.push(m);}}); ml.sort((a,b)=>b.localeCompare(a));
  const months=ml.map(m=>{const h=hist[m],live=liveMonth[m]||{revenue:0,produced:0};const revenue=h?h.revenue:live.revenue;const produced=(h&&h.produced)?h.produced:live.produced;const sourced=(h&&h.sourced)?h.sourced:0;const soldLitres=(h&&h.sold)?h.sold:(live.sold||0);const tx=txn.byMonth[m]||{opexTotal:0,opexBySub:{},capexTotal:0};return {month:m,revenue,produced,sourced,soldLitres,opexTotal:tx.opexTotal,opex:tx.opexBySub,capexTotal:tx.capexTotal,cattleCount:avg(m),net:revenue-tx.opexTotal};});
  // per-cattle daily feed cost (by-cattle view)
  const fr=loadFeedRates(db).current; let feedDaily=0;
  db.cattle.filter(c=>!c.sold).forEach(c=>{ (db._raw.feedByCattle[c.id]||[]).forEach(f=>{ feedDaily+=num(f.qty)*(fr[f.feed_key]||0); }); });
  return {rateB,rateC,feedDaily,overheads,days,months}; }

function calcDashboard(db,todayStr){ const {rateB,rateC,activeCattle}=rates(db);
  const P=buildProd(db),{D:disp,REV:dispRev}=buildDisp(db);
  const dProd=d=>P[d]?P[d].morning+P[d].evening:0,dSrc=d=>P[d]?P[d].sourced:0,dTot=d=>dProd(d)+dSrc(d);
  const dB=d=>P[d]?P[d].B:0,dC=d=>P[d]?P[d].C:0,dDisp=d=>disp[d]?disp[d].B+disp[d].C:0,dEx=d=>P[d]?P[d].extraSold:0;
  const dSold=d=>dDisp(d)+dEx(d),dRev=d=>(dispRev[d]||0)+(P[d]?P[d].extraRev:0);
  const cutoff=new Date(Date.parse(todayStr+"T00:00:00Z")-30*864e5);
  let p30=0,s30=0,d30=0,r30=0,pB=0,pC=0;
  const all=[...new Set([...Object.keys(P),...Object.keys(disp)])].filter(k=>/^\d{4}-\d{2}-\d{2}$/.test(k)).sort((a,b)=>new Date(b)-new Date(a));
  all.forEach(d=>{if(new Date(d)>=cutoff){p30+=dProd(d);s30+=dSrc(d);d30+=dSold(d);r30+=dRev(d);pB+=dB(d);pC+=dC(d);}});
  const recentDays=all.slice(0,30).map(d=>{const p=P[d]||{},x=disp[d]||{};return {date:d,produced:dProd(d),total:dTot(d),dispatched:dSold(d),buffalo:dB(d),cow:dC(d),revenue:dRev(d),mProd:p.morning||0,eProd:p.evening||0,mBuf:p.mB||0,eBuf:p.eB||0,mCow:p.mC||0,eCow:p.eC||0,mDisp:(x.mL||0)+(p.mExtraSold||0),eDisp:(x.eL||0)+(p.eExtraSold||0),mSrc:p.mSrc||0,eSrc:p.eSrc||0,mRev:(x.mRev||0)+(p.mExtraRev||0),eRev:(x.eRev||0)+(p.eExtraRev||0)};});
  const mo={}; all.forEach(d=>{const k=d.substring(0,7);if(!mo[k])mo[k]={produced:0,total:0,dispatched:0,revenue:0};mo[k].produced+=dProd(d);mo[k].total+=dTot(d);mo[k].dispatched+=dSold(d);mo[k].revenue+=dRev(d);});
  const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const monthlyTrend=Object.keys(mo).sort((a,b)=>b.localeCompare(a)).slice(0,6).map(k=>{const [y,m]=k.split("-");return {month:MO[+m-1]+" "+y.substring(2),...mo[k]};});
  return {summary:{rateB,rateC,activeCattle,last30DaysProduce:p30,last30DaysSourced:s30,last30DaysTotal:p30+s30,last30DaysDispatched:d30,last30DaysRevenue:r30,last30DaysProduceB:pB,last30DaysProduceC:pC,todayProduce:dProd(todayStr),todaySourced:dSrc(todayStr),todayTotal:dTot(todayStr),todayDispatched:dSold(todayStr),todayRevenue:dRev(todayStr),todayProduceB:dB(todayStr),todayProduceC:dC(todayStr)},recentDays,monthlyTrend}; }

function monthlyRevenue(db){ const {rateB,rateC}=rates(db),{TYPE,RATE}=custMaps(db),dispRev={};
  db.dispatch.forEach(row=>{const q=row.litres;if(!(q>0))return;const d=row.date;if(dispRev[d]==null)dispRev[d]=0;const t=TYPE[row.name_en]||"B";dispRev[d]+=q*(RATE[row.name_en]!=null?RATE[row.name_en]:(t==="B"?rateB:rateC));});
  const extra={}; db.production_day.forEach(r=>{if(r.extra_sold)extra[r.date]=(extra[r.date]||0)+num(r.extra)*num(r.extra_rate);});
  const lm={}; Object.keys(dispRev).forEach(d=>{if(/^\d{4}-\d{2}-\d{2}$/.test(d)){const m=d.substring(0,7);lm[m]=(lm[m]||0)+dispRev[d];}});
  Object.keys(extra).forEach(d=>{if(/^\d{4}-\d{2}-\d{2}$/.test(d)){const m=d.substring(0,7);lm[m]=(lm[m]||0)+extra[d];}});
  const hist=loadHistory(db),out={},seen={};
  Object.keys(hist).concat(Object.keys(lm)).forEach(m=>{if(seen[m]||!/^\d{4}-\d{2}$/.test(m))return;seen[m]=1;out[m]=hist[m]?hist[m].revenue:(lm[m]||0);});
  return out; }

function calcNet(db){ const revMap=monthlyRevenue(db),monthAssign={},cattleAssign={};
  Object.keys(db.settings).forEach(k=>{let m=k.match(/^proceeds_(\d{4}-\d{2})$/);if(m){monthAssign[m[1]]=(db.settings[k]||"").trim();return;}m=k.match(/^proceeds_cattle_(.+)$/);if(m)cattleAssign[m[1]]=(db.settings[k]||"").trim();});
  const spent={}; db.transactions.forEach(t=>{const p=(t.payer||"").trim();if(!p)return;spent[p]=(spent[p]||0)+t.amount;});
  const km={},kc={},ko={};
  const months=Object.keys(revMap).sort((a,b)=>b.localeCompare(a)).map(m=>{const person=monthAssign[m]||"";if(person)km[person]=(km[person]||0)+(revMap[m]||0);return {month:m,revenue:revMap[m]||0,person};});
  const sold=db.cattle.filter(c=>c.sold&&num(c.sold_price)>0).map(c=>({code:c.code,soldDate:c.sold_date||"",price:num(c.sold_price)}));
  const cattleSales=sold.map(sc=>{const person=cattleAssign[sc.code]||"";if(person)kc[person]=(kc[person]||0)+sc.price;return {...sc,person};});
  const otherProceeds=db.other_proceeds.map(o=>{if(o.person)ko[o.person]=(ko[o.person]||0)+o.amount;return o;});
  const names={};[spent,km,kc,ko].forEach(o=>Object.keys(o).forEach(n=>names[n]=1));
  const people=Object.keys(names).map(n=>{const sp=spent[n]||0,a=km[n]||0,b=kc[n]||0,c=ko[n]||0;return {name:n,spent:sp,proceedsMilk:a,proceedsCattle:b,proceedsOther:c,proceeds:a+b+c,net:sp-(a+b+c)};}).sort((a,b)=>b.net-a.net);
  return {people,months,cattleSales,otherProceeds}; }

function calcBills(db,month){ const [year,mon]=String(month||"").split("-").map(Number);
  if(!year||!mon||mon<1||mon>12) throw new Error("Pick a valid month (YYYY-MM).");
  const {rateB,rateC}=rates(db); const MS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const MF=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const WD=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; const ym=year+"-"+String(mon).padStart(2,"0");
  const dim=new Date(year,mon,0).getDate(),days=[];
  for(let d=1;d<=dim;d++){const dt=new Date(year,mon-1,d);days.push({date:String(d).padStart(2,"0")+" "+MS[mon-1],day:WD[dt.getDay()],iso:ym+"-"+String(d).padStart(2,"0")});}
  const nm=mon===12?1:mon+1,ny=mon===12?year+1:year,dueLabel="5 "+MS[nm-1]+" "+ny;
  const perCust={}; db.dispatch.forEach(row=>{const iso=row.date;if(iso.substring(0,7)!==ym)return;const q=row.litres;if(q){if(!perCust[row.name_en])perCust[row.name_en]={};perCust[row.name_en][iso]=(perCust[row.name_en][iso]||0)+q;}});
  const bills=[]; db.customers.forEach(c=>{if(c.active===false)return;const map=perCust[c.name_en]||{};let total=0;const entries=[];
    days.forEach(dd=>{const q=map[dd.iso]||0;total+=q;if(q>0)entries.push({date:dd.date,day:dd.day,qty:q,paid:false});});
    if(total<=0)return;const rate=(c.rate!=null?c.rate:(c.type==="B"?rateB:rateC));
    bills.push({id:bills.length,raw_name:c.name_en,display_name:c.name_en,display_name_ur:c.name_ur||"",milk_type:(c.type==="B"?"Buffalo":"Cow"),rate,total_qty:r2(total),paid_qty:0,amount:r2(total*rate),entries});});
  return {monthLabel:MF[mon-1]+" "+year,monthShort:MS[mon-1],dueLabel,days:days.map(d=>({date:d.date,day:d.day})),bills}; }

// ── read shapers (non-calc) ──
function shapeDispatchByDate(db,date){ const res={morning:{},evening:{}};
  db.dispatch.forEach(row=>{ if(row.date!==date)return; const nm=row.name_en; if(nm==null)return;
    const slot=row.slot==="evening"?"evening":"morning";
    if(row.nil) res[slot][nm]="Nil"; else if(row.litres>0) res[slot][nm]=String(row.litres); });
  return res; }
function shapeProductionByDate(db,date){ const blank=()=>({cattle:{},measuredB:"",measuredC:"",purchased:"",purchaseRate:"",extraQty:"",extraSold:false,extraRate:""});
  const out={morning:blank(),evening:blank()};
  db.production.forEach(p=>{ if(p.date!==date)return; const s=p.slot; if(p.litres>0&&p.code)out[s].cattle[p.code]=p.litres; });
  db.production_day.forEach(r=>{ if(r.date!==date)return; const s=r.slot; const g=out[s];
    const n=v=>(v==null||v==="")?"":(isNaN(Number(v))?"":Number(v));
    g.measuredB=n(r.measured_b);g.measuredC=n(r.measured_c);g.purchased=n(r.purchased);g.purchaseRate=n(r.purchase_rate);
    g.extraQty=n(r.extra);g.extraRate=n(r.extra_rate);g.extraSold=!!r.extra_sold; });
  return out; }
function shapePayments(db,month){ // needs its own fetch (id->name via customer)
  return null; }

// ── id lookups for writes ──
async function custIdByName(name){ const {data}=await supabase.from("customers").select("id").eq("name_en",name).limit(1); return data&&data[0]?data[0].id:null; }
async function cattleIdByCode(code){ const {data}=await supabase.from("cattle").select("id").eq("code",code).limit(1); return data&&data[0]?data[0].id:null; }
async function setSetting(key,value){ const {error}=await supabase.from("settings").upsert({key,value:String(value)},{onConflict:"key"}); if(error)throw new Error(error.message); }

// ============================ apiGet ============================
export async function apiGet(action, params={}) {
  const db = await loadDb();
  switch(action){
    case "getDashboard":       return calcDashboard(db, isoOf(new Date()));
    case "getPnL":             return calcPnL(db);
    case "getNetContributions":return calcNet(db);
    case "getTransactions":    return {transactions: db.transactions};
    case "getHistory":         return {history: (()=>{const o={};db.history.forEach(h=>o[h.month]={revenue:h.revenue,produced:h.produced,sourced:h.sourced,sold:h.sold});return o;})()};
    case "getCustomers":       return {customers: db.customers, qtyOptions: qtyOptions(db)};
    case "getDispatchByDate":  return shapeDispatchByDate(db, params.date);
    case "getProductionByDate":return shapeProductionByDate(db, params.date);
    case "getDeliveryData":    return {customers:db.customers, qtyOptions:qtyOptions(db), today:shapeDispatchByDate(db,params.date), prev:params.date?shapeDispatchByDate(db,prevIso(params.date)):{morning:{},evening:{}}};
    case "getCattle":          return getCattle(db);
    case "getPayments":        return getPayments(db, params.month);
    case "getBillsDoc":        return await getBillsDoc(db, params.month);
    default: throw new Error("Unknown action: "+action);
  }
}
function getCattle(db){ const fr=loadFeedRates(db);
  const cats=db._raw.feedCats.filter(c=>FEED_BUILTIN_KEYS.indexOf(c.key)===-1).map(c=>({key:c.key,en:c.name_en||c.key,hi:c.name_hi||"",ur:c.name_ur||""}));
  const herd=db.cattle.filter(c=>!c.sold);
  // milk stats from production (per code)
  const byCode={}; db.production.forEach(p=>{ if(!p.code)return; (byCode[p.code]||(byCode[p.code]={}));
    byCode[p.code][p.date]=(byCode[p.code][p.date]||0)+p.litres; });
  const full=db._raw.cattle.reduce((m,c)=>{m[c.code]=c;return m;},{});
  const cattle=herd.map(c=>{ const raw=full[c.code]||{}; const feedRows=db._raw.feedByCattle[c.id]||[];
    const feed={}; FEED_BUILTIN_KEYS.forEach(k=>feed[k]=0); feedRows.forEach(f=>feed[f.feed_key]=num(f.qty));
    const dm=byCode[c.code]||{}; const dates=Object.keys(dm).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)).sort((a,b)=>b.localeCompare(a));
    const last7=dates.slice(0,7); let sum=0; const daily=last7.map((d,i)=>({date:d,litres:dm[d]})); last7.forEach(d=>sum+=dm[d]);
    const avg7=last7.length?sum/last7.length:0, milkLast=last7.length?dm[last7[0]]:0;
    let lactSum=0,peak=0; if(c.lastCalving){ Object.keys(dm).forEach(d=>{ if(d>=c.lastCalving){lactSum+=dm[d]; if(dm[d]>peak)peak=dm[d];} }); }
    return { rowIndex:c.id, code:c.code, type:c.type,
      status:raw.status||"Lactating", pregnant:!!raw.pregnant, dateIn:raw.date_in||"",
      dateAI:(raw.ai_log&&String(raw.ai_log).trim())?String(raw.ai_log).split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean).sort().slice(-1)[0]:(raw.date_ai||""),
      aiLog:(raw.ai_log?String(raw.ai_log).split(/[;,\n]+/).map(s=>s.trim()).filter(Boolean).sort():[]),
      lastCalving:raw.last_calving||"", lactationNo:raw.lactation_no??"", purchasePrice:raw.purchase_price??"",
      location:raw.location||"", breed:raw.breed||"", boughtFrom:raw.bought_from||"", calfGender:raw.calf_gender||"",
      prevCalving:raw.prev_calving||"", aiServiceCount:raw.ai_service_count??"", pregCheckDate:raw.preg_check_date||"",
      pregCheckResult:raw.preg_check_result||"", bcs:raw.bcs??"", lastVaccination:raw.last_vaccination||"",
      lastDeworming:raw.last_deworming||"", healthNotes:raw.health_notes||"", notes:raw.notes||"",
      sold:false, soldDate:raw.sold_date||"", soldPrice:raw.sold_price??"", active:true, feed,
      milkAvg7:avg7, milkLast, milkDaily7:daily.reverse(), lactToDate:lactSum, peakYield:peak };
  });
  return {cattle, feedRates:fr, feedCategories:cats}; }
function getPayments(db, month){ // fetch from raw via a targeted load is cheap; reuse cache miss otherwise
  return _getPayments(month); }
async function _getPayments(month){ const {data,error}=await supabase.from("payments").select("month,customer_name,delivery_status,owner_status");
  if(error) throw new Error(error.message); const payments={};
  (data||[]).forEach(r=>{ const cust=(r.customer_name||"").trim(); if(!cust)return; if(month&&r.month!==month)return;
    payments[cust]={delivery:(r.delivery_status||"").toLowerCase().trim(),owner:(r.owner_status||"").toLowerCase().trim()}; });
  return {month:month||"", payments}; }
async function getBillsDoc(db, month){ const ctx=calcBills(db,month); ctx.logo=BILL_LOGO_OR_EMPTY();
  let tpl; try{ tpl=await (await fetch(BILL_TEMPLATE_URL)).text(); }catch(e){ throw new Error("Could not load BillTemplate.html"); }
  const marker=tpl.indexOf("ZZ_BILLCTX_ZZ")>=0?"ZZ_BILLCTX_ZZ":null;
  const html=marker?tpl.replace("ZZ_BILLCTX_ZZ",()=>JSON.stringify(ctx)):tpl;
  return {html, filename:"Banki_Dairy_"+ctx.monthLabel.replace(/ /g,"_")+"_Bills.html", count:ctx.bills.length, monthLabel:ctx.monthLabel}; }
// served alongside the app; base-aware so it works under a GitHub Pages subpath
const BILL_TEMPLATE_URL = ((typeof import.meta !== "undefined" && import.meta.env && import.meta.env.BASE_URL) || "/") + "BillTemplate.html";
function BILL_LOGO_OR_EMPTY(){ return (typeof BILL_LOGO!=="undefined"&&BILL_LOGO)?BILL_LOGO:""; }

// ============================ apiPost ============================
export async function apiPost(action, data={}) {
  const r = await handleWrite(action, data);
  invalidate();
  return r;
}
async function handleWrite(action, b){
  const S = supabase;
  switch(action){
    case "logProduction": return await logProduction(b);
    case "logDispatch":   return await logDispatch(b);
    case "saveCustomer":  return await saveCustomer(b);
    case "toggleCustomer":{ await S.from("customers").update({active:!!b.active}).eq("id",b.rowIndex); return {success:true}; }
    case "deleteCustomer":{ await S.from("customers").delete().eq("id",b.rowIndex); return {success:true}; }
    case "saveCattle":    return await saveCattle(b);
    case "toggleCattle":  { await S.from("cattle").update({active:!!b.active}).eq("id",b.rowIndex); return {success:true}; }
    case "sellCattle":    { await S.from("cattle").update({sold:true,sold_date:b.soldDate||isoOf(new Date()),sold_price:(b.soldPrice===""||b.soldPrice==null)?null:num(b.soldPrice),active:false}).eq("id",b.rowIndex); return {success:true}; }
    case "deleteCattle":  { await S.from("cattle").delete().eq("id",b.rowIndex); return {success:true}; }
    case "saveFeed":      return await saveFeed(b);
    case "saveFeedRates": return await saveFeedRates(b);
    case "addFeedCategory":return await addFeedCategory(b);
    case "saveQtyOptions":return await saveQtyOptions(b);
    case "addTransaction":{ await S.from("transactions").insert({date:b.date||null,name:b.name||"",category:b.category||"",subcategory:b.subCategory||"",payer:b.payer||"",amount:(b.amount===""||b.amount==null)?null:num(b.amount),logged_at:new Date().toISOString()}); return {success:true}; }
    case "updateTransaction":{ if(!b.rowIndex)throw new Error("Missing rowIndex"); await S.from("transactions").update({date:b.date||null,name:b.name||"",category:b.category||"",subcategory:b.subCategory||"",payer:b.payer||"",amount:(b.amount===""||b.amount==null)?null:num(b.amount)}).eq("id",b.rowIndex); return {success:true}; }
    case "deleteTransaction":{ if(!b.rowIndex)throw new Error("Missing rowIndex"); await S.from("transactions").delete().eq("id",b.rowIndex); return {success:true}; }
    case "saveOverheads": { const o=b.overheads||{}; for(const k of Object.keys(o)){ if(o[k]===""||o[k]==null)continue; const v=parseFloat(o[k]); if(isNaN(v))continue; await setSetting("cost_"+k+"_monthly",v);} return {success:true}; }
    case "setPayment":    return await setPayment(b);
    case "setProceedsAssignment":{ if(!/^\d{4}-\d{2}$/.test(String(b.month||"")))throw new Error("Pick a valid month (YYYY-MM)."); await setSetting("proceeds_"+b.month,(b.person||"").trim()); return {success:true}; }
    case "setCattleProceeds":{ if(!b.code)throw new Error("Cattle code required."); await setSetting("proceeds_cattle_"+String(b.code).trim(),(b.person||"").trim()); return {success:true}; }
    case "addOtherProceeds":{ const name=(b.name||"").trim(); const amt=parseFloat(String(b.amount).replace(/[^0-9.\-]/g,""))||0; if(!name)throw new Error("Enter a name for the proceeds."); if(!amt)throw new Error("Enter an amount."); await S.from("other_proceeds").insert({date:(b.date||"").trim()||null,name,amount:amt,person:(b.person||"").trim(),logged_at:new Date().toISOString()}); return {success:true}; }
    case "updateOtherProceeds":{ if(!b.rowIndex)throw new Error("Bad row."); await S.from("other_proceeds").update({person:(b.person||"").trim()}).eq("id",b.rowIndex); return {success:true}; }
    case "deleteOtherProceeds":{ if(!b.rowIndex)throw new Error("Bad row."); await S.from("other_proceeds").delete().eq("id",b.rowIndex); return {success:true}; }
    default: throw new Error("Unknown action: "+action);
  }
}

async function logProduction(b){ const rows=[]; const dayRows=[];
  for(const slot of ["morning","evening"]){ const s=b[slot]||{}; const list=JSON.parse(s.rows||"[]"); if(list.length===0)continue;
    for(const r of list){ const cid=await cattleIdByCode(r.cattle); if(cid) rows.push({date:b.date,cattle_id:cid,slot,litres:num(r.netLtrs)}); }
    const dr={date:b.date,slot}; let touched=false;
    if(s.measuredB!=null&&s.measuredB!=="") {dr.measured_b=measToLtrs(s.measuredB);touched=true;}
    if(s.measuredC!=null&&s.measuredC!=="") {dr.measured_c=measToLtrs(s.measuredC);touched=true;}
    if(s.purchased!=null&&s.purchased!=="") {dr.purchased=num(s.purchased);touched=true;}
    if(s.purchaseRate!=null&&s.purchaseRate!=="") {dr.purchase_rate=num(s.purchaseRate);touched=true;}
    if(s.extraQty!=null&&s.extraQty!=="") {dr.extra=num(s.extraQty);touched=true;}
    dr.extra_sold=!!s.extraSold; if(s.extraSold&&s.extraRate) dr.extra_rate=num(s.extraRate);
    dayRows.push(dr); }
  if(rows.length) { const {error}=await supabase.from("production").upsert(rows,{onConflict:"date,cattle_id,slot"}); if(error)throw new Error(error.message); }
  if(dayRows.length){ const {error}=await supabase.from("production_day").upsert(dayRows,{onConflict:"date,slot"}); if(error)throw new Error(error.message); }
  return {success:true}; }

async function logDispatch(b){ const up=[], del=[];
  for(const slot of ["morning","evening"]){ const s=b[slot]||{}; const entries=JSON.parse(s.entries||"[]"); if(entries.length===0)continue;
    for(const e of entries){ const cid=await custIdByName(e.name); if(!cid)continue;
      if(e.qty&&e.qty!=="Nil"){ up.push({date:b.date,customer_id:cid,litres:num(e.qty),nil:false}); }
      else { up.push({date:b.date,customer_id:cid,litres:0,nil:true}); } } }
  if(up.length){ const {error}=await supabase.from("dispatch").upsert(up,{onConflict:"date,customer_id"}); if(error)throw new Error(error.message); }
  return {success:true}; }

async function saveCustomer(b){ const rate=(b.rate===""||b.rate==null||isNaN(parseFloat(b.rate)))?null:parseFloat(b.rate);
  const fields={name_en:b.name_en,name_hi:b.name_hi||"",name_ur:b.name_ur||"",slot:b.slot,type:b.type,phone:b.phone||"",self_collect:!!b.selfCollect,rate};
  // delivery-order position
  const {data:all}=await supabase.from("customers").select("id,sort_order").order("sort_order",{ascending:true});
  let sort_order=null;
  if(b.atTop){ sort_order=(all&&all.length?num(all[0].sort_order):1)-1; }
  else if(b.afterRowIndex){ const idx=all.findIndex(x=>x.id===Number(b.afterRowIndex));
    if(idx>=0){ const cur=num(all[idx].sort_order); const nxt=idx+1<all.length?num(all[idx+1].sort_order):cur+1; sort_order=(cur+nxt)/2; } }
  if(b.rowIndex){ const patch={...fields}; if(sort_order!=null)patch.sort_order=sort_order;
    const {error}=await supabase.from("customers").update(patch).eq("id",b.rowIndex); if(error)throw new Error(error.message); return {success:true}; }
  if(sort_order==null) sort_order=(all&&all.length?Math.max(...all.map(x=>num(x.sort_order))):0)+1;
  const {error}=await supabase.from("customers").insert({...fields,active:true,sort_order}); if(error)throw new Error(error.message); return {success:true}; }

async function saveCattle(b){ const st=String(b.status||"").toLowerCase();
  const status=st==="dry"?"Dry":st==="colostral"?"Colostral":st==="transition"?"Transition":"Lactating";
  const ail=Array.isArray(b.aiLog)?b.aiLog.filter(Boolean).sort():[];
  const fields={code:b.code,type:b.type||"B",status,pregnant:!!b.pregnant,date_in:b.dateIn||null,
    ai_log:ail.join("; "),date_ai:ail.length?ail[ail.length-1]:(b.dateAI||null),last_calving:b.lastCalving||null,
    lactation_no:(b.lactationNo===""||b.lactationNo==null)?null:num(b.lactationNo),
    purchase_price:(b.purchasePrice===""||b.purchasePrice==null)?null:num(b.purchasePrice),
    location:b.location||"",breed:b.breed||"",bought_from:b.boughtFrom||"",calf_gender:b.calfGender||"",
    prev_calving:b.prevCalving||null,ai_service_count:ail.length||((b.aiServiceCount===""||b.aiServiceCount==null)?null:num(b.aiServiceCount)),
    preg_check_date:b.pregCheckDate||null,preg_check_result:b.pregCheckResult||"",
    bcs:(b.bcs===""||b.bcs==null)?null:num(b.bcs),last_vaccination:b.lastVaccination||null,
    last_deworming:b.lastDeworming||null,health_notes:b.healthNotes||"",notes:b.notes||""};
  if(b.rowIndex){ const {error}=await supabase.from("cattle").update(fields).eq("id",b.rowIndex); if(error)throw new Error(error.message); return {success:true}; }
  const {error}=await supabase.from("cattle").insert({...fields,sold:false,active:true}); if(error)throw new Error(error.message); return {success:true}; }

async function saveFeed(b){ const cid=b.rowIndex; const f=b.feed||{}; const rows=[];
  for(const key of Object.keys(f)){ const v=parseFloat(f[key]); rows.push({cattle_id:cid,feed_key:key.toLowerCase(),qty:isNaN(v)?0:v}); }
  if(rows.length){ const {error}=await supabase.from("cattle_feed").upsert(rows,{onConflict:"cattle_id,feed_key"}); if(error)throw new Error(error.message); }
  return {success:true}; }

async function saveFeedRates(b){ const cur=b.current||{},idl=b.ideal||{}; const keys=new Set([...Object.keys(cur),...Object.keys(idl)]);
  for(const k of keys){ if(cur[k]!=null&&cur[k]!==""&&!isNaN(parseFloat(cur[k]))) await setSetting("feed_rate_"+k,parseFloat(cur[k]));
    if(idl[k]!=null&&idl[k]!==""&&!isNaN(parseFloat(idl[k]))) await setSetting("feed_ideal_"+k,parseFloat(idl[k])); }
  return {success:true}; }

async function addFeedCategory(b){ const en=(b.en||"").trim(); if(!en)throw new Error("Enter a name for the feed category.");
  let key=en.toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,""); if(!key)throw new Error("Name must contain letters or numbers.");
  const {data:existing}=await supabase.from("feed_categories").select("key"); const taken=new Set(FEED_BUILTIN_KEYS.concat((existing||[]).map(x=>x.key)));
  if(taken.has(key)){ let n=2; while(taken.has(key+"_"+n))n++; key=key+"_"+n; }
  await supabase.from("feed_categories").insert({key,name_en:en,name_hi:(b.hi||"").trim(),name_ur:(b.ur||"").trim()});
  const rate=parseFloat(b.rate),ideal=parseFloat(b.ideal);
  await setSetting("feed_rate_"+key, isNaN(rate)?0:rate);
  await setSetting("feed_ideal_"+key, isNaN(ideal)?(isNaN(rate)?0:rate):ideal);
  return {success:true,key}; }

async function saveQtyOptions(b){ const arr=Array.isArray(b.options)?b.options:String(b.options||"").split(",");
  const seen={},clean=[]; arr.map(x=>parseFloat(String(x).trim())).filter(v=>!isNaN(v)&&v>0).sort((a,b)=>a-b).forEach(v=>{const sv=String(v);if(!seen[sv]){seen[sv]=1;clean.push(sv);}});
  if(!clean.length)throw new Error("Add at least one quantity."); await setSetting("qty_options",clean.join(",")); return {success:true,options:clean}; }

async function setPayment(b){ const month=(b.month||"").trim(),cust=(b.customer||"").trim(),field=(b.field||"").toLowerCase().trim(),status=(b.status||"").toLowerCase().trim();
  if(!month||!cust)throw new Error("Month and customer are required.");
  if(field!=="delivery"&&field!=="owner")throw new Error("Invalid payment field.");
  if(status!=="paid"&&status!=="due"&&status!=="")throw new Error("Invalid payment status.");
  const cid=await custIdByName(cust);
  const {data:ex}=await supabase.from("payments").select("id").eq("month",month).eq("customer_name",cust).limit(1);
  const stamp=new Date().toISOString();
  const patch=field==="delivery"?{delivery_status:status,delivery_updated_at:stamp}:{owner_status:status,owner_updated_at:stamp};
  if(ex&&ex[0]){ await supabase.from("payments").update(patch).eq("id",ex[0].id); }
  else { await supabase.from("payments").insert({month,customer_id:cid,customer_name:cust,...patch}); }
  return {success:true}; }

export default { apiGet, apiPost };
