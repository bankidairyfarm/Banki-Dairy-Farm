import { useState, useEffect } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0Y0qDrOhIVALmFtnAp-pgRSnM47A5Fk5GsZlj708_hzh9NCi6VFGlx-PCXmYCgITH/exec";

const ROLES = {
  supervisor: { label: "Supervisor", emoji: "🧑‍🌾", color: "#2d6a4f" },
  delivery:   { label: "Delivery Man",   emoji: "🚚",   color: "#1d3557" },
  owner:      { label: "Owner",      emoji: "👑",   color: "#7b2d00" },
};

const BUFFALO_CATTLE = ["B1","B4","B5","B6","B7","B8","B9"];
const COW_CATTLE     = ["C1","C2","C3"];
const BUCKET_WEIGHT  = 1.18;
const CONVERSION     = 0.97;

// ─── CUSTOMER DATA ─────────────────────────────────────────────────────────
const MORNING_CUSTOMERS = [
  { name: "Mr. Saurav Gupta",       phone: "8090740907", type: "B" },
  { name: "Mr. Zaid Javed",         phone: "9819800350", type: "B" },
  { name: "Haaji Shamshaad",        phone: "8081093129", type: "B" },
  { name: "Mr. Urooj (Asma Baaji)", phone: "",           type: "B" },
  { name: "Mr. Urooj Banki",        phone: "",           type: "B" },
  { name: "Mr. Aziz-ur-Rehman",     phone: "",           type: "B" },
  { name: "Mr. Moni",               phone: "",           type: "B" },
  { name: "Mrs. Farzana",           phone: "",           type: "B" },
  { name: "Mr. Achhe Khan",         phone: "",           type: "B" },
  { name: "Mr. Guddu",              phone: "",           type: "B" },
  { name: "Mr. Umair Kidwai",       phone: "",           type: "B" },
  { name: "Mr. Umar Faiz Kidwai",   phone: "9389874362", type: "B" },
  { name: "Mr. Rizwan",             phone: "",           type: "B" },
  { name: "Mr. Faisal",             phone: "",           type: "B" },
  { name: "Mr. Danish",             phone: "",           type: "B" },
  { name: "Mr. Chanda",             phone: "",           type: "B" },
  { name: "Mr. Syed Athar",         phone: "",           type: "B" },
  { name: "Mr. Adnan Abbasi",       phone: "7897692769", type: "B" },
  { name: "Mr. Arif",               phone: "",           type: "B" },
  { name: "Mr. Aleem Kidwai",       phone: "",           type: "B" },
  { name: "Mr. Shaad Kidwai",       phone: "",           type: "B" },
  { name: "Mr. Razzaki",            phone: "",           type: "B" },
  { name: "Mr. Abrar",              phone: "",           type: "B" },
  { name: "Mr. Shivam Gupta",       phone: "",           type: "B" },
  { name: "Mr. Santosh",            phone: "",           type: "B" },
  { name: "Mr. Satish Kumar",       phone: "",           type: "B" },
  { name: "Mr. Salauddin",          phone: "",           type: "C" },
  { name: "Mr. Soni (Adv.)",        phone: "",           type: "C" },
  { name: "Mr. Santosh",            phone: "",           type: "C" },
];

const EVENING_CUSTOMERS = [
  { name: "Mr. Imran Sheikh",          phone: "", type: "B" },
  { name: "Mr. Amar Jaiswal",          phone: "", type: "B" },
  { name: "Mr. Aftab",                 phone: "", type: "B" },
  { name: "Mr. Abdul Waheed",          phone: "", type: "B" },
  { name: "Mr. Aziz",                  phone: "", type: "B" },
  { name: "Mr. Abdul Hai",             phone: "", type: "B" },
  { name: "Mrs. Shabnam",              phone: "", type: "B" },
  { name: "Mr. Abdul Shehzaade",       phone: "", type: "B" },
  { name: "Mr. Amir",                  phone: "", type: "B" },
  { name: "Mr. Salauddin",             phone: "", type: "B" },
  { name: "Mr. Salauddin (Doc)",       phone: "", type: "B" },
  { name: "Mr. Muin",                  phone: "", type: "B" },
  { name: "Mr. Ittiba Hussein",        phone: "", type: "B" },
  { name: "Mr. Rayyan Ashraf",         phone: "", type: "B" },
  { name: "Mr. Fareed",                phone: "", type: "B" },
  { name: "Mr. Faisal Mukhtaar",       phone: "", type: "B" },
  { name: "Mr. Akhtar Alam",           phone: "", type: "B" },
  { name: "Mr. Faizan",                phone: "", type: "B" },
  { name: "Mr. Farhan",                phone: "", type: "B" },
  { name: "Mrs. Jabi",                 phone: "", type: "B" },
  { name: "Mr. Naved",                 phone: "", type: "B" },
  { name: "Mr. Ram Pratap Mishra",     phone: "", type: "B" },
  { name: "Mr. Adil Waris",            phone: "", type: "B" },
  { name: "Mr. Chanda",                phone: "", type: "B" },
  { name: "Mr. Mushtaq",               phone: "", type: "B" },
  { name: "Mr. Talha Mehmood",         phone: "", type: "B" },
  { name: "Mr. Ram Pratap Mishra (C)", phone: "", type: "C" },
  { name: "Mr. Suyagya Sharma",        phone: "", type: "C" },
  { name: "Banki Neighbour 3",         phone: "", type: "C" },
  { name: "Mr. Sanjay",                phone: "", type: "C" },
];

const QTY_OPTIONS = ["0.5","0.75","1","1.5","2","3","Nil"];
const BOTTLE_SIZES = ["0.5","0.75","1"]; // sizes to count bottles for

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }
function yesterday() {
  const d = new Date(); d.setDate(d.getDate()-1);
  return d.toISOString().split("T")[0];
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function fmtN(n,dec=2) { if (n==null||isNaN(n)) return "—"; return Number(n).toFixed(dec); }
function fmtRs(n) { if (n==null||isNaN(n)) return "—"; return "₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:0}); }
function toNet(kgWithBucket) { return Math.max(0,((parseFloat(kgWithBucket)||0)-BUCKET_WEIGHT)*CONVERSION); }

// ─── API ───────────────────────────────────────────────────────────────────
async function apiGet(action, params={}) {
  const p = new URLSearchParams({action,...params});
  const res = await fetch(`${SCRIPT_URL}?${p}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error);
  return j;
}
async function apiPost(action, data={}) {
  await fetch(SCRIPT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify({action,...data})});
  return true;
}

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────
function Card({children,style={}}) {
  return <div style={{background:"#fff",borderRadius:14,boxShadow:"0 1px 4px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.04)",padding:"18px 20px",...style}}>{children}</div>;
}
function SectionLabel({children,color="#555"}) {
  return <div style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.7px",marginBottom:6}}>{children}</div>;
}
function Input({label,...props}) {
  return (
    <div style={{marginBottom:13}}>
      {label&&<SectionLabel>{label}</SectionLabel>}
      <input style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,background:"#fafafa",outline:"none",boxSizing:"border-box",fontFamily:"inherit",color:"#1a1a1a"}} {...props}/>
    </div>
  );
}
function Btn({children,variant="primary",style={},...props}) {
  const base={padding:"11px 20px",borderRadius:9,fontSize:14,fontWeight:600,border:"none",cursor:"pointer",fontFamily:"inherit"};
  const v={primary:{background:"#2d6a4f",color:"#fff"},ghost:{background:"transparent",color:"#2d6a4f",border:"1.5px solid #2d6a4f"},gray:{background:"#f1f5f9",color:"#475569"},danger:{background:"#dc2626",color:"#fff"}};
  return <button style={{...base,...v[variant],...style}} {...props}>{children}</button>;
}
function Alert({type="info",children}) {
  const c={info:{bg:"#eff6ff",border:"#bfdbfe",text:"#1e40af"},success:{bg:"#f0fdf4",border:"#bbf7d0",text:"#15803d"},warn:{bg:"#fffbeb",border:"#fde68a",text:"#92400e"},error:{bg:"#fef2f2",border:"#fecaca",text:"#991b1b"}}[type];
  return <div style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text,borderRadius:9,padding:"10px 14px",fontSize:13,marginBottom:14}}>{children}</div>;
}
function StatBox({label,value,sub,color="#2d6a4f"}) {
  return (
    <div style={{background:color+"0a",border:`1px solid ${color}22`,borderRadius:12,padding:"12px 14px",flex:1,minWidth:0}}>
      <div style={{fontSize:10,color:"#777",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.8px",marginBottom:3}}>{label}</div>
      <div style={{fontSize:20,fontWeight:700,color,lineHeight:1.1}}>{value}</div>
      {sub&&<div style={{fontSize:11,color:"#999",marginTop:3}}>{sub}</div>}
    </div>
  );
}
function TabBar({tabs,active,onChange}) {
  return (
    <div style={{display:"flex",gap:5,background:"#f1f5f9",borderRadius:10,padding:4,marginBottom:18}}>
      {tabs.map(t=>(
        <button key={t.key} onClick={()=>onChange(t.key)} style={{
          flex:1,padding:"8px 0",borderRadius:8,border:"none",cursor:"pointer",
          background:active===t.key?"#fff":"transparent",
          color:active===t.key?"#1a1a1a":"#888",
          fontWeight:active===t.key?700:500,
          fontSize:13,boxShadow:active===t.key?"0 1px 4px rgba(0,0,0,0.08)":"none",
          fontFamily:"inherit"
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({onLogin}) {
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#e9f5ee 0%,#f8fafc 60%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:52,marginBottom:8}}>🐄</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:"#1a1a1a"}}>Banki Dairy Farm</div>
          <div style={{color:"#666",marginTop:5,fontSize:13}}>Select your role to continue</div>
        </div>
        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {Object.entries(ROLES).map(([key,r])=>(
              <button key={key} onClick={()=>onLogin(key)} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",borderRadius:11,border:"1.5px solid #e2e8f0",background:"#fafafa",cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.borderColor=r.color;}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.borderColor="#e2e8f0";}}>
                <span style={{fontSize:26}}>{r.emoji}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#1a1a1a"}}>{r.label}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:1}}>
                    {key==="supervisor"&&"Log daily milk production"}
                    {key==="delivery"&&"Record milk dispatched to customers"}
                    {key==="owner"&&"View full dashboard & analytics"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        <div style={{textAlign:"center",marginTop:18,fontSize:11,color:"#aaa"}}>Banki Dairy Farm · Operations Tracker</div>
      </div>
    </div>
  );
}

// ─── SUPERVISOR — SLOT PANEL ────────────────────────────────────────────────
// Measured totals are already net weight (bucket removed manually) — only convert kg→L
function kgToLtrs(kg) { return Math.max(0,(parseFloat(kg)||0)*CONVERSION); }

function SlotPanel({rawKg,setRawKg,measuredB,setMeasuredB,measuredC,setMeasuredC,purchased,setPurchased,purchaseRate,setPurchaseRate,extraQty,setExtraQty,extraSold,setExtraSold,extraRate,setExtraRate}) {
  const bLtrs = BUFFALO_CATTLE.reduce((s,c)=>s+toNet(rawKg[c]||0),0);
  const cLtrs = COW_CATTLE.reduce((s,c)=>s+toNet(rawKg[c]||0),0);
  const slotTotal = bLtrs+cLtrs;

  // Measured: already net kg (bucket removed) — only convert
  const measBNet = measuredB ? kgToLtrs(measuredB) : null;
  const measCNet = measuredC ? kgToLtrs(measuredC) : null;

  return (
    <div>
      {/* Buffalo entries */}
      <div style={{background:"#fffbeb",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#92400e">🐃 Buffalo</SectionLabel>
        {BUFFALO_CATTLE.map(c=>(
          <div key={c} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <span style={{fontWeight:700,fontSize:14,color:"#92400e",width:28,flexShrink:0}}>{c}</span>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={rawKg[c]||""} onChange={e=>setRawKg(p=>({...p,[c]:e.target.value}))}
              style={{flex:1,padding:"8px 10px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",fontFamily:"inherit"}}/>
            <span style={{fontSize:12,color:"#92400e",width:44,textAlign:"right",flexShrink:0,fontWeight:600}}>
              {rawKg[c]?fmtN(toNet(rawKg[c]),2)+"L":""}
            </span>
          </div>
        ))}
      </div>

      {/* Cow entries */}
      <div style={{background:"#eff6ff",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#1d4ed8">🐄 Cow</SectionLabel>
        {COW_CATTLE.map(c=>(
          <div key={c} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <span style={{fontWeight:700,fontSize:14,color:"#1d4ed8",width:28,flexShrink:0}}>{c}</span>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={rawKg[c]||""} onChange={e=>setRawKg(p=>({...p,[c]:e.target.value}))}
              style={{flex:1,padding:"8px 10px",border:"1.5px solid #bfdbfe",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",fontFamily:"inherit"}}/>
            <span style={{fontSize:12,color:"#1d4ed8",width:44,textAlign:"right",flexShrink:0,fontWeight:600}}>
              {rawKg[c]?fmtN(toNet(rawKg[c]),2)+"L":""}
            </span>
          </div>
        ))}
      </div>

      {/* Physical totals — net kg (bucket already removed), just convert kg→L */}
      <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#555">📏 Measured Totals (net kg, bucket removed)</SectionLabel>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#92400e",fontWeight:600,marginBottom:4}}>B Total (kg)</div>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={measuredB||""} onChange={e=>setMeasuredB(e.target.value)}
              style={{width:"100%",padding:"8px 10px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            {measBNet!==null&&<div style={{fontSize:11,marginTop:3,textAlign:"center",fontWeight:600,color:Math.abs(measBNet-bLtrs)>0.2?"#dc2626":"#15803d"}}>
              {fmtN(measBNet,2)} L {Math.abs(measBNet-bLtrs)>0.2?"⚠️ Mismatch":"✓ Matches"}
            </div>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#1d4ed8",fontWeight:600,marginBottom:4}}>C Total (kg)</div>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={measuredC||""} onChange={e=>setMeasuredC(e.target.value)}
              style={{width:"100%",padding:"8px 10px",border:"1.5px solid #bfdbfe",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            {measCNet!==null&&<div style={{fontSize:11,marginTop:3,textAlign:"center",fontWeight:600,color:Math.abs(measCNet-cLtrs)>0.2?"#dc2626":"#15803d"}}>
              {fmtN(measCNet,2)} L {Math.abs(measCNet-cLtrs)>0.2?"⚠️ Mismatch":"✓ Matches"}
            </div>}
          </div>
        </div>
      </div>

      {/* Outside milk — Purchased + Extra */}
      <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#555">🔄 Outside Milk</SectionLabel>

        {/* Row 1: Milk Purchased */}
        <div style={{marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>Purchased</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#555",marginBottom:3}}>Qty (L)</div>
              <input type="number" min="0" step="0.1" placeholder="0"
                value={purchased||""} onChange={e=>setPurchased(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#555",marginBottom:3}}>Rate (₹/L)</div>
              <input type="number" min="0" step="1" placeholder="0"
                value={purchaseRate||""} onChange={e=>setPurchaseRate(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
          </div>
        </div>

        {/* Row 2: Extra Milk */}
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>Extra Milk</div>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#555",marginBottom:3}}>Qty (L)</div>
              <input type="number" min="0" step="0.1" placeholder="0"
                value={extraQty||""} onChange={e=>setExtraQty(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <input type="checkbox" id={`sold-${Math.random()}`} checked={extraSold||false} onChange={e=>setExtraSold(e.target.checked)}
                  style={{width:14,height:14,cursor:"pointer",accentColor:"#2d6a4f"}}/>
                <label style={{fontSize:11,color:"#555",cursor:"pointer"}}>Sold</label>
              </div>
              <input type="number" min="0" step="1" placeholder="Selling rate"
                value={extraRate||""} onChange={e=>setExtraRate(e.target.value)}
                disabled={!extraSold}
                style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${extraSold?"#e2e8f0":"#f1f5f9"}`,borderRadius:8,fontSize:14,textAlign:"center",background:extraSold?"#fff":"#f8fafc",color:extraSold?"#1a1a1a":"#ccc",outline:"none",boxSizing:"border-box",fontFamily:"inherit",cursor:extraSold?"text":"not-allowed"}}/>
            </div>
          </div>
        </div>
      </div>

      {/* Calculated totals */}
      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#92400e",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>Buffalo</div>
          <div style={{fontSize:20,fontWeight:700,color:"#92400e",marginTop:2}}>{fmtN(bLtrs,2)} L</div>
        </div>
        <div style={{flex:1,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#1d4ed8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>Cow</div>
          <div style={{fontSize:20,fontWeight:700,color:"#1d4ed8",marginTop:2}}>{fmtN(cLtrs,2)} L</div>
        </div>
        <div style={{flex:1,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#15803d",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>Total</div>
          <div style={{fontSize:20,fontWeight:700,color:"#15803d",marginTop:2}}>{fmtN(slotTotal,2)} L</div>
        </div>
      </div>
    </div>
  );
}

function SupervisorView() {
  const [date,setDate]=useState(today());
  const [activeSlot,setActiveSlot]=useState("morning");
  const [mRaw,setMRaw]=useState({}); const [eRaw,setERaw]=useState({});
  const [mMeasB,setMMeasB]=useState(""); const [mMeasC,setMMeasC]=useState("");
  const [eMeasB,setEMeasB]=useState(""); const [eMeasC,setEMeasC]=useState("");
  const [mPurchased,setMPurchased]=useState(""); const [mPurchaseRate,setMPurchaseRate]=useState("");
  const [mExtraQty,setMExtraQty]=useState(""); const [mExtraSold,setMExtraSold]=useState(false); const [mExtraRate,setMExtraRate]=useState("");
  const [ePurchased,setEPurchased]=useState(""); const [ePurchaseRate,setEPurchaseRate]=useState("");
  const [eExtraQty,setEExtraQty]=useState(""); const [eExtraSold,setEExtraSold]=useState(false); const [eExtraRate,setEExtraRate]=useState("");
  const [status,setStatus]=useState(null); const [errMsg,setErrMsg]=useState("");

  const allCattle=[...BUFFALO_CATTLE,...COW_CATTLE];
  const mTotal=allCattle.reduce((s,c)=>s+toNet(mRaw[c]||0),0);
  const eTotal=allCattle.reduce((s,c)=>s+toNet(eRaw[c]||0),0);
  const grandTotal=mTotal+eTotal;

  async function handleSubmit() {
    if(!date){setErrMsg("Please select a date.");setStatus("error");return;}
    if(grandTotal===0){setErrMsg("Total is 0 — enter at least one value.");setStatus("error");return;}
    setStatus("loading");
    try {
      const buildRows=(rawMap)=>allCattle.map(c=>({cattle:c,type:BUFFALO_CATTLE.includes(c)?"B":"C",rawKg:parseFloat(rawMap[c])||0,netLtrs:toNet(rawMap[c]||0)})).filter(r=>r.rawKg>0);
      await apiPost("logProduction",{date,
        morning:{rows:JSON.stringify(buildRows(mRaw)),total:mTotal,measuredB:mMeasB,measuredC:mMeasC,purchased:mPurchased,purchaseRate:mPurchaseRate,extraQty:mExtraQty,extraSold:mExtraSold,extraRate:mExtraRate},
        evening:{rows:JSON.stringify(buildRows(eRaw)),total:eTotal,measuredB:eMeasB,measuredC:eMeasC,purchased:ePurchased,purchaseRate:ePurchaseRate,extraQty:eExtraQty,extraSold:eExtraSold,extraRate:eExtraRate},
        grandTotal});
      setStatus("success");
      setMRaw({});setERaw({});setMMeasB("");setMMeasC("");setEMeasB("");setEMeasC("");
      setMPurchased("");setMPurchaseRate("");setMExtraQty("");setMExtraSold(false);setMExtraRate("");
      setEPurchased("");setEPurchaseRate("");setEExtraQty("");setEExtraSold(false);setEExtraRate("");
    } catch(e){setErrMsg(e.message);setStatus("error");}
  }

  return (
    <div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>Log Today's Production</div>
        <div style={{color:"#888",fontSize:13,marginTop:2}}>Enter weight including bucket (kg)</div>
      </div>
      {status==="success"&&<Alert type="success">✅ Logged for {fmtDate(date)} — Grand Total: {fmtN(grandTotal,2)} L</Alert>}
      {status==="error"&&<Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{marginBottom:14}}>
        <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()}/>
        <div style={{display:"flex",gap:8}}>
          <StatBox label="Morning" value={`${fmtN(mTotal,2)} L`} color="#f59e0b"/>
          <StatBox label="Evening" value={`${fmtN(eTotal,2)} L`} color="#6366f1"/>
          <StatBox label="Grand Total" value={`${fmtN(grandTotal,2)} L`} color="#2d6a4f"/>
        </div>
      </Card>

      <TabBar tabs={[{key:"morning",label:"☀️ Morning"},{key:"evening",label:"🌙 Evening"}]} active={activeSlot} onChange={setActiveSlot}/>

      <Card style={{marginBottom:14}}>
        {activeSlot==="morning"
          ? <SlotPanel rawKg={mRaw} setRawKg={setMRaw} measuredB={mMeasB} setMeasuredB={setMMeasB} measuredC={mMeasC} setMeasuredC={setMMeasC} purchased={mPurchased} setPurchased={setMPurchased} purchaseRate={mPurchaseRate} setPurchaseRate={setMPurchaseRate} extraQty={mExtraQty} setExtraQty={setMExtraQty} extraSold={mExtraSold} setExtraSold={setMExtraSold} extraRate={mExtraRate} setExtraRate={setMExtraRate}/>
          : <SlotPanel rawKg={eRaw} setRawKg={setERaw} measuredB={eMeasB} setMeasuredB={setEMeasB} measuredC={eMeasC} setMeasuredC={setEMeasC} purchased={ePurchased} setPurchased={setEPurchased} purchaseRate={ePurchaseRate} setPurchaseRate={setEPurchaseRate} extraQty={eExtraQty} setExtraQty={setEExtraQty} extraSold={eExtraSold} setExtraSold={setEExtraSold} extraRate={eExtraRate} setExtraRate={setEExtraRate}/>
        }
      </Card>

      <Btn onClick={handleSubmit} style={{width:"100%"}} disabled={status==="loading"}>
        {status==="loading"?"Saving…":"Submit Production Log"}
      </Btn>
    </div>
  );
}

// ─── DELIVERY — BOTTLE SUMMARY ──────────────────────────────────────────────
function BottleSummary({customers,vals}) {
  // Bottle calculation logic per type (B or C):
  // 0.75L bottles  = count of customers with exactly 0.75
  // 0.5L bottles   = count of 0.5 customers + count of customers with 1.5 or 2.5 (the 0.5 remainder)
  // 1L bottles     = sum of floor(qty) for all whole-number qty (1,2,3)
  //                + sum of floor(qty) for half-qty customers (1.5→1, 2.5→2)
  function calcBottles(type) {
    const filtered = customers.filter(c=>c.type===type);
    let bottles075=0, bottles05=0, bottles1=0;
    filtered.forEach(c=>{
      const q = vals[c.name];
      if(!q||q==="Nil") return;
      const qty = parseFloat(q);
      if(qty===0.75)                         { bottles075++; }
      else if(qty===0.5)                     { bottles05++; }
      else if(qty===1.5||qty===2.5)          { bottles05++; bottles1+=Math.floor(qty); }
      else if(qty===1||qty===2||qty===3)     { bottles1+=qty; }
    });
    return {bottles075,bottles05,bottles1};
  }

  const b=calcBottles("B"); const c=calcBottles("C");
  const hasAny = customers.some(c=>vals[c.name]&&vals[c.name]!=="Nil");
  if(!hasAny) return null;

  function BottleCol({label,counts,color,bg,border}) {
    return (
      <div style={{flex:1,background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"10px 12px"}}>
        <div style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>{label} Milk</div>
        {[["0.75 L",counts.bottles075],["0.5 L",counts.bottles05],["1 L",counts.bottles1]].map(([sz,n])=>(
          <div key={sz} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,color:"#555"}}>{sz} bottle</span>
            <span style={{fontSize:18,fontWeight:700,color,minWidth:28,textAlign:"right"}}>{n}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={{marginTop:16,borderTop:"2px dashed #e2e8f0",paddingTop:14}}>
      <SectionLabel color="#374151">🍶 Bottles to Fill</SectionLabel>
      <div style={{display:"flex",gap:10}}>
        <BottleCol label="Buffalo" counts={b} color="#92400e" bg="#fffbeb" border="#fde68a"/>
        <BottleCol label="Cow"     counts={c} color="#1d4ed8" bg="#eff6ff" border="#bfdbfe"/>
      </div>
    </div>
  );
}

function CustomerRow({customer,value,onChange,prevValue}) {
  const isB=customer.type==="B";
  const color=isB?"#92400e":"#1d4ed8";
  const bg=isB?"#fffbeb":"#eff6ff";
  const tagBg=isB?"#fde68a":"#bfdbfe";
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 0",borderBottom:"1px solid #f8fafc"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{customer.name}</div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:1}}>
          {customer.phone&&<span style={{fontSize:11,color:"#aaa"}}>{customer.phone}</span>}
          {prevValue&&prevValue!=="Nil"
            ? <span style={{fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>Yesterday: {prevValue} L</span>
            : prevValue==="Nil"
            ? <span style={{fontSize:11,color:"#cbd5e1",fontStyle:"italic"}}>Yesterday: absent</span>
            : null}
        </div>
      </div>
      <span style={{background:tagBg,color,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,flexShrink:0}}>{isB?"🐃 B":"🐄 C"}</span>
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{padding:"6px 8px",border:`1.5px solid ${value&&value!=="Nil"?color:"#e2e8f0"}`,borderRadius:8,fontSize:13,fontWeight:600,background:value&&value!=="Nil"?bg:"#fafafa",color:value&&value!=="Nil"?color:"#888",outline:"none",width:80,flexShrink:0,fontFamily:"inherit"}}>
        <option value="">—</option>
        {QTY_OPTIONS.map(q=><option key={q} value={q}>{q==="Nil"?"Nil":q+" L"}</option>)}
      </select>
    </div>
  );
}

function DeliveryView() {
  const [date,setDate]=useState(today());
  const [slot,setSlot]=useState("morning");
  const [mVals,setMVals]=useState({});
  const [eVals,setEVals]=useState({});
  const [prevData,setPrevData]=useState(null);
  const [status,setStatus]=useState(null);
  const [errMsg,setErrMsg]=useState("");

  // Load previous day's dispatch whenever the selected date changes
  useEffect(()=>{
    if(!date) return;
    const prev = new Date(date+"T00:00:00");
    prev.setDate(prev.getDate()-1);
    const prevDateStr = prev.toISOString().split("T")[0];
    apiGet("getDispatchByDate",{date:prevDateStr})
      .then(d=>setPrevData(d))
      .catch(()=>setPrevData(null));
  },[date]);

  const customers=slot==="morning"?MORNING_CUSTOMERS:EVENING_CUSTOMERS;
  const vals=slot==="morning"?mVals:eVals;
  const setVals=slot==="morning"?setMVals:setEVals;
  const prevVals=prevData?(slot==="morning"?prevData.morning:prevData.evening):null;

  function totalLtrs(vs) { return Object.values(vs).reduce((s,v)=>s+(v&&v!=="Nil"?parseFloat(v)||0:0),0); }
  const mTotal=totalLtrs(mVals); const eTotal=totalLtrs(eVals);

  async function handleSubmit() {
    if(!date){setErrMsg("Please select a date.");setStatus("error");return;}
    if(mTotal+eTotal===0){setErrMsg("No deliveries entered.");setStatus("error");return;}
    setStatus("loading");
    try {
      const buildEntries=(custs,vs)=>custs.map(c=>({name:c.name,type:c.type,qty:vs[c.name]||"Nil"}));
      await apiPost("logDispatch",{date,
        morning:{entries:JSON.stringify(buildEntries(MORNING_CUSTOMERS,mVals)),total:mTotal},
        evening:{entries:JSON.stringify(buildEntries(EVENING_CUSTOMERS,eVals)),total:eTotal},
        grandTotal:mTotal+eTotal});
      setStatus("success");
      setMVals({});setEVals({});
    } catch(e){setErrMsg(e.message);setStatus("error");}
  }

  return (
    <div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>Log Milk Dispatched</div>
        <div style={{color:"#888",fontSize:13,marginTop:2}}>Record delivery for each customer</div>
      </div>
      {status==="success"&&<Alert type="success">✅ Dispatch logged for {fmtDate(date)}!</Alert>}
      {status==="error"&&<Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{marginBottom:14}}>
        <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()}/>
        <div style={{display:"flex",gap:8}}>
          <StatBox label="Morning" value={`${fmtN(mTotal,2)} L`} color="#f59e0b"/>
          <StatBox label="Evening" value={`${fmtN(eTotal,2)} L`} color="#6366f1"/>
        </div>
      </Card>

      <TabBar tabs={[{key:"morning",label:"☀️ Morning"},{key:"evening",label:"🌙 Evening"}]} active={slot} onChange={setSlot}/>

      <Card>
        <div style={{fontWeight:700,fontSize:13,color:"#555",marginBottom:12}}>
          {slot==="morning"?"☀️ Morning":"🌙 Evening"} — {customers.length} customers
        </div>
        {customers.map(c=>(
          <CustomerRow key={c.name} customer={c} value={vals[c.name]||""} onChange={v=>setVals(p=>({...p,[c.name]:v}))} prevValue={prevVals?prevVals[c.name]:null}/>
        ))}
        <BottleSummary customers={customers} vals={vals}/>
      </Card>

      <div style={{height:16}}/>
      <Btn onClick={handleSubmit} style={{width:"100%"}} disabled={status==="loading"}>
        {status==="loading"?"Saving…":"Submit Dispatch Log"}
      </Btn>
    </div>
  );
}

// ─── OWNER DASHBOARD ───────────────────────────────────────────────────────
function OwnerDashboard() {
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [tab,setTab]=useState("overview");

  async function load() {
    setLoading(true);setError(null);
    try{setData(await apiGet("getDashboard"));}
    catch(e){setError(e.message);}
    finally{setLoading(false);}
  }
  useEffect(()=>{load();},[]);

  if(loading) return <div style={{textAlign:"center",padding:"60px 20px",color:"#888"}}><div style={{fontSize:36,marginBottom:12}}>🔄</div><div>Loading dashboard…</div></div>;
  if(error) return <div><Alert type="error">❌ Could not load data: {error}<br/><span style={{fontSize:11}}>Check your Google Apps Script URL in App.jsx line 4.</span></Alert><Btn onClick={load} variant="ghost" style={{width:"100%"}}>Retry</Btn></div>;

  const {summary={},recentDays=[],monthlyTrend=[]}=data||{};
  const gap30=(summary.last30DaysProduce||0)-(summary.last30DaysDispatched||0);
  const todayGap=(summary.todayProduce||0)-(summary.todayDispatched||0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><div style={{fontSize:20,fontWeight:700}}>Owner Dashboard</div><div style={{color:"#888",fontSize:12,marginTop:2}}>Live farm operations</div></div>
        <Btn variant="ghost" onClick={load} style={{padding:"7px 13px",fontSize:12}}>↻ Refresh</Btn>
      </div>

      <TabBar tabs={[{key:"overview",label:"Overview"},{key:"daily",label:"Daily Log"},{key:"monthly",label:"Monthly"}]} active={tab} onChange={setTab}/>

      {tab==="overview"&&(
        <div>
          {/* Today's snapshot */}
          <Card style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:"#374151",marginBottom:12}}>📅 Today's Snapshot</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <StatBox label="Produced" value={`${fmtN(summary.todayProduce||0,1)} L`} color="#2d6a4f"/>
              <StatBox label="Dispatched" value={`${fmtN(summary.todayDispatched||0,1)} L`} color="#1d3557"/>
              <StatBox label="Gap" value={`${fmtN(Math.abs(todayGap),1)} L`}
                sub={todayGap>0?"Surplus":todayGap<0?"Deficit":"Balanced"}
                color={todayGap>=0?"#2d6a4f":"#dc2626"}/>
              <StatBox label="Revenue Today" value={fmtRs(summary.todayRevenue||0)} color="#7b2d00"/>
            </div>
            {(summary.todayProduce||0)>0&&(
              <div style={{padding:"9px 13px",borderRadius:9,background:todayGap>=0?"#f0fdf4":"#fef2f2",color:todayGap>=0?"#15803d":"#dc2626",fontSize:13,fontWeight:600}}>
                {todayGap>=0?`✅ Surplus of ${fmtN(todayGap,1)} L`:`⚠️ Deficit of ${fmtN(Math.abs(todayGap),1)} L`}
              </div>
            )}
            {(summary.todayProduce||0)===0&&<div style={{color:"#aaa",fontSize:12}}>No production logged today yet.</div>}
          </Card>

          {/* 30-day metrics */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <StatBox label="Produced (30d)"   value={`${fmtN(summary.last30DaysProduce||0,0)} L`}   color="#2d6a4f"/>
            <StatBox label="Dispatched (30d)" value={`${fmtN(summary.last30DaysDispatched||0,0)} L`} color="#1d3557"/>
            <StatBox label="Gap (30d)" value={`${fmtN(Math.abs(gap30),0)} L`}
              sub={gap30>0?"Surplus":gap30<0?"Deficit":"Balanced"} color={gap30>=0?"#2d6a4f":"#dc2626"}/>
            <StatBox label="Revenue (30d)" value={fmtRs(summary.last30DaysRevenue||0)} color="#7b2d00"/>
          </div>

          {/* Settings */}
          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:"#374151"}}>⚙️ Settings</div>
            {[["Buffalo milk rate",`₹${summary.rateB||70}/L`],["Cow milk rate",`₹${summary.rateC||60}/L`],[`Active cattle`,`${summary.activeCattle||10} (${BUFFALO_CATTLE.length}B + ${COW_CATTLE.length}C)`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#555",paddingBottom:7,marginBottom:7,borderBottom:"1px solid #f8fafc"}}>
                <span>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="daily"&&(
        <Card>
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:14}}>Recent Daily Records</div>
          {recentDays.length===0?<div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"20px 0"}}>No data yet.</div>:(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
                  {["Date","Produced","Dispatched","Gap","Revenue","Status"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"5px 7px",color:"#888",fontWeight:600,fontSize:11,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {recentDays.map((row,i)=>{
                    const g=(row.produced||0)-(row.dispatched||0);
                    return <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"7px",fontWeight:600,color:"#374151"}}>{fmtDate(row.date)}</td>
                      <td style={{padding:"7px"}}>{fmtN(row.produced,1)}</td>
                      <td style={{padding:"7px"}}>{fmtN(row.dispatched,1)}</td>
                      <td style={{padding:"7px",fontWeight:600,color:g>=0?"#15803d":"#dc2626"}}>{g>=0?"+":""}{fmtN(g,1)}</td>
                      <td style={{padding:"7px"}}>{fmtRs(row.revenue||0)}</td>
                      <td style={{padding:"7px"}}>
                        <span style={{background:g>=0?"#f0fdf4":"#fef2f2",color:g>=0?"#15803d":"#dc2626",border:`1px solid ${g>=0?"#bbf7d0":"#fecaca"}`,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>
                          {g>=0?"✓ OK":"⚠ Gap"}
                        </span>
                      </td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {tab==="monthly"&&(
        <Card>
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:14}}>Monthly Summary</div>
          {monthlyTrend.length===0?<div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"20px 0"}}>No monthly data yet.</div>:(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
                  {["Month","Produced","Dispatched","Revenue","Gap"].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"5px 7px",color:"#888",fontWeight:600,fontSize:11,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {monthlyTrend.map((row,i)=>{
                    const g=(row.produced||0)-(row.dispatched||0);
                    return <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"7px",fontWeight:600}}>{row.month}</td>
                      <td style={{padding:"7px"}}>{fmtN(row.produced,1)}</td>
                      <td style={{padding:"7px"}}>{fmtN(row.dispatched,1)}</td>
                      <td style={{padding:"7px"}}>{fmtRs(row.revenue||0)}</td>
                      <td style={{padding:"7px",fontWeight:600,color:g>=0?"#15803d":"#dc2626"}}>{g>=0?"+":""}{fmtN(g,1)}</td>
                    </tr>;
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────
export default function App() {
  const [role,setRole]=useState(null);
  if(!role) return <LoginScreen onLogin={setRole}/>;
  const r=ROLES[role];
  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e8ecf0",padding:"11px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#2d6a4f,#52b788)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>🐄</div>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:16,color:"#1a1a1a"}}>Banki Dairy</div>
            <div style={{fontSize:9,color:"#aaa",letterSpacing:"1.2px",textTransform:"uppercase"}}>Farm Operations</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{background:r.color+"18",color:r.color,border:`1px solid ${r.color}33`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{r.emoji} {r.label}</span>
          <button onClick={()=>setRole(null)} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:12}}>Switch ↩</button>
        </div>
      </div>
      <div style={{maxWidth:520,margin:"0 auto",padding:"18px 15px 48px"}}>
        {role==="supervisor"&&<SupervisorView/>}
        {role==="delivery"&&<DeliveryView/>}
        {role==="owner"&&<OwnerDashboard/>}
      </div>
    </div>
  );
}
