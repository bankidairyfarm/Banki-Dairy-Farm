import { useState, useEffect } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0Y0qDrOhIVALmFtnAp-pgRSnM47A5Fk5GsZlj708_hzh9NCi6VFGlx-PCXmYCgITH/exec";

const ROLES = {
  supervisor: { label: "Supervisor", emoji: "🧑‍🌾", color: "#2d6a4f" },
  delivery:   { label: "Delivery",   emoji: "🚚",   color: "#1d3557" },
  owner:      { label: "Owner",      emoji: "👑",   color: "#7b2d00" },
};

// Active cattle only (B2 and B3 removed as sold)
const BUFFALO_CATTLE = ["B1","B4","B5","B6","B7","B8","B9"];
const COW_CATTLE     = ["C1","C2","C3"];
const BUCKET_WEIGHT  = 1.18;  // kg
const CONVERSION     = 0.97;  // 1 kg milk = 0.97 litres

// ─── CUSTOMER DATA ─────────────────────────────────────────────────────────
const MORNING_CUSTOMERS = [
  // Buffalo
  { name: "Mr. Saurav Gupta",      phone: "8090740907", type: "B" },
  { name: "Mr. Zaid Javed",        phone: "9819800350", type: "B" },
  { name: "Haaji Shamshaad",       phone: "8081093129", type: "B" },
  { name: "Mr. Urooj (Asma Baaji)",phone: "",           type: "B" },
  { name: "Mr. Urooj Banki",       phone: "",           type: "B" },
  { name: "Mr. Aziz-ur-Rehman",    phone: "",           type: "B" },
  { name: "Mr. Moni",              phone: "",           type: "B" },
  { name: "Mrs. Farzana",          phone: "",           type: "B" },
  { name: "Mr. Achhe Khan",        phone: "",           type: "B" },
  { name: "Mr. Guddu (Station)",   phone: "",           type: "B" },
  { name: "Mr. Umair Kidwai",      phone: "",           type: "B" },
  { name: "Mr. Umar Faiz Kidwai",  phone: "9389874362", type: "B" },
  { name: "Mr. Rizwan",            phone: "",           type: "B" },
  { name: "Mr. Faisal",            phone: "",           type: "B" },
  { name: "Mr. Danish",            phone: "",           type: "B" },
  { name: "Mr. Chanda",            phone: "",           type: "B" },
  { name: "Mr. Syed Athar",        phone: "",           type: "B" },
  { name: "Mr. Adnan Abbasi",      phone: "7897692769", type: "B" },
  { name: "Mr. Haneef",            phone: "",           type: "B" },
  { name: "Mr. Aleem Kidwai",      phone: "",           type: "B" },
  { name: "Mr. Shaad Kidwai",      phone: "",           type: "B" },
  { name: "Mr. Razzaki",           phone: "",           type: "B" },
  { name: "Mr. Abrar",             phone: "",           type: "B" },
  { name: "Mr. Shivam Gupta",      phone: "",           type: "B" },
  { name: "Mr. Santosh",           phone: "",           type: "B" },
  { name: "Mr. Satish Kumar",      phone: "",           type: "B" },
  // Cow
  { name: "Mr. Salauddin",         phone: "",           type: "C" },
  { name: "Mr. Soni (Adv.)",       phone: "",           type: "C" },
  { name: "Mr. Santosh (C)",       phone: "",           type: "C" },
  { name: "Mr. Farhan",            phone: "",           type: "C" },
  { name: "Mr. Soni (Tenant)",     phone: "",           type: "C" },
  { name: "Unani Hospital",        phone: "",           type: "C" },
];

const EVENING_CUSTOMERS = [
  // Buffalo
  { name: "Mr. Imran Sheikh",       phone: "", type: "B" },
  { name: "Mr. Amar Jaiswal",       phone: "", type: "B" },
  { name: "Mr. Aftab",              phone: "", type: "B" },
  { name: "Mr. Abdul Waheed",       phone: "", type: "B" },
  { name: "Mr. Aziz",               phone: "", type: "B" },
  { name: "Mr. Abdul Hai",          phone: "", type: "B" },
  { name: "Mrs. Shabnam",           phone: "", type: "B" },
  { name: "Mr. Abdul Shehzaade",    phone: "", type: "B" },
  { name: "Mr. Amir",               phone: "", type: "B" },
  { name: "Mr. Salauddin",          phone: "", type: "B" },
  { name: "Mr. Salauddin (Doc)",    phone: "", type: "B" },
  { name: "Mr. Muin",               phone: "", type: "B" },
  { name: "Mr. Ittiba Hussein",     phone: "", type: "B" },
  { name: "Mr. Rayyan Ashraf",      phone: "", type: "B" },
  { name: "Mr. Fareed",             phone: "", type: "B" },
  { name: "Mr. Faisal Mukhtaar",    phone: "", type: "B" },
  { name: "Mr. Akhtar Alam",        phone: "", type: "B" },
  { name: "Mr. Faizan",             phone: "", type: "B" },
  { name: "Mr. Farhan",             phone: "", type: "B" },
  { name: "Mrs. Jabi",              phone: "", type: "B" },
  { name: "Mr. Naved",              phone: "", type: "B" },
  { name: "Mr. Ram Pratap Mishra",  phone: "", type: "B" },
  { name: "Mr. Adil Waris",         phone: "", type: "B" },
  { name: "Mr. Chanda",             phone: "", type: "B" },
  { name: "Mr. Mushtaq",            phone: "", type: "B" },
  { name: "Mr. Talha Mehmood",      phone: "", type: "B" },
  // Cow
  { name: "Mr. Ram Pratap Mishra (C)", phone: "", type: "C" },
  { name: "Mr. Farhan Waris",          phone: "", type: "C" },
  { name: "Mr. Suyagya Sharma",        phone: "", type: "C" },
  { name: "Banki Neighbour 3",         phone: "", type: "C" },
  { name: "Mr. Sanjay",                phone: "", type: "C" },
];

const QTY_OPTIONS = ["0.5","0.75","1","1.25","1.5","2","2.5","3","Nil"];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function fmtN(n, dec=2) { if (n==null||isNaN(n)) return "—"; return Number(n).toFixed(dec); }
function fmtRs(n) { if (n==null||isNaN(n)) return "—"; return "₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:0}); }
function toNet(kgWithBucket) {
  const kg = (parseFloat(kgWithBucket)||0) - BUCKET_WEIGHT;
  return Math.max(0, kg * CONVERSION);
}

// ─── API ───────────────────────────────────────────────────────────────────
async function apiGet(action, params={}) {
  const p = new URLSearchParams({ action, ...params });
  const res = await fetch(`${SCRIPT_URL}?${p}`);
  const j = await res.json();
  if (j.error) throw new Error(j.error);
  return j;
}
async function apiPost(action, data={}) {
  await fetch(SCRIPT_URL, {
    method:"POST", mode:"no-cors",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ action, ...data }),
  });
  return true;
}

// ─── UI PRIMITIVES ─────────────────────────────────────────────────────────
function Card({ children, style={} }) {
  return <div style={{ background:"#fff", borderRadius:14, boxShadow:"0 1px 4px rgba(0,0,0,0.07),0 4px 16px rgba(0,0,0,0.04)", padding:"18px 20px", ...style }}>{children}</div>;
}
function Label({ children }) {
  return <div style={{ fontSize:11, fontWeight:700, color:"#666", textTransform:"uppercase", letterSpacing:"0.7px", marginBottom:5 }}>{children}</div>;
}
function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:13 }}>
      {label && <Label>{label}</Label>}
      <input style={{ width:"100%", padding:"9px 12px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:14, background:"#fafafa", outline:"none", boxSizing:"border-box", fontFamily:"inherit", color:"#1a1a1a" }} {...props} />
    </div>
  );
}
function Btn({ children, variant="primary", style={}, ...props }) {
  const base = { padding:"11px 20px", borderRadius:9, fontSize:14, fontWeight:600, border:"none", cursor:"pointer", fontFamily:"inherit", transition:"opacity 0.15s" };
  const v = { primary:{background:"#2d6a4f",color:"#fff"}, ghost:{background:"transparent",color:"#2d6a4f",border:"1.5px solid #2d6a4f"}, gray:{background:"#f1f5f9",color:"#475569"}, danger:{background:"#dc2626",color:"#fff"} };
  return <button style={{...base,...v[variant],...style}} {...props}>{children}</button>;
}
function Alert({ type="info", children }) {
  const c = { info:{bg:"#eff6ff",border:"#bfdbfe",text:"#1e40af"}, success:{bg:"#f0fdf4",border:"#bbf7d0",text:"#15803d"}, warn:{bg:"#fffbeb",border:"#fde68a",text:"#92400e"}, error:{bg:"#fef2f2",border:"#fecaca",text:"#991b1b"} }[type];
  return <div style={{ background:c.bg, border:`1px solid ${c.border}`, color:c.text, borderRadius:9, padding:"10px 14px", fontSize:13, marginBottom:14 }}>{children}</div>;
}
function StatBox({ label, value, sub, color="#2d6a4f" }) {
  return (
    <div style={{ background:color+"0a", border:`1px solid ${color}22`, borderRadius:12, padding:"12px 14px", flex:1, minWidth:0 }}>
      <div style={{ fontSize:10, color:"#777", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:3 }}>{label}</div>
      <div style={{ fontSize:20, fontWeight:700, color, lineHeight:1.1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#999", marginTop:3 }}>{sub}</div>}
    </div>
  );
}
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{ display:"flex", gap:5, background:"#f1f5f9", borderRadius:10, padding:4, marginBottom:18 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer",
          background: active===t.key ? "#fff" : "transparent",
          color: active===t.key ? "#1a1a1a" : "#888",
          fontWeight: active===t.key ? 700 : 500,
          fontSize:13, boxShadow: active===t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
          fontFamily:"inherit"
        }}>{t.label}</button>
      ))}
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#e9f5ee 0%,#f8fafc 60%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontSize:52, marginBottom:8 }}>🐄</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#1a1a1a" }}>Banki Dairy Farm</div>
          <div style={{ color:"#666", marginTop:5, fontSize:13 }}>Select your role to continue</div>
        </div>
        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {Object.entries(ROLES).map(([key, r]) => (
              <button key={key} onClick={() => onLogin(key)} style={{
                display:"flex", alignItems:"center", gap:13, padding:"14px 16px",
                borderRadius:11, border:"1.5px solid #e2e8f0", background:"#fafafa",
                cursor:"pointer", textAlign:"left", width:"100%", fontFamily:"inherit"
              }}
              onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.borderColor=r.color;}}
              onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.borderColor="#e2e8f0";}}>
                <span style={{ fontSize:26 }}>{r.emoji}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:"#1a1a1a" }}>{r.label}</div>
                  <div style={{ fontSize:12, color:"#888", marginTop:1 }}>
                    {key==="supervisor"&&"Log daily milk production"}
                    {key==="delivery"&&"Record milk dispatched to customers"}
                    {key==="owner"&&"View full dashboard & analytics"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        <div style={{ textAlign:"center", marginTop:18, fontSize:11, color:"#aaa" }}>Banki Dairy Farm · Operations Tracker</div>
      </div>
    </div>
  );
}

// ─── SUPERVISOR VIEW ───────────────────────────────────────────────────────
function SlotEntry({ slot, rawKg, setRawKg, measuredB, setMeasuredB, measuredC, setMeasuredC, outsideB, setOutsideB, outsideC, setOutsideC }) {
  const emoji = slot === "Morning" ? "☀️" : "🌙";
  const color = slot === "Morning" ? "#f59e0b" : "#6366f1";

  function netLtrs(cattle, kgMap) {
    return (cattle || []).reduce((s,c) => s + toNet(kgMap[c]||0), 0);
  }

  const bLtrs = netLtrs(BUFFALO_CATTLE, rawKg);
  const cLtrs = netLtrs(COW_CATTLE, rawKg);
  const slotTotal = bLtrs + cLtrs;

  return (
    <Card style={{ marginBottom:14 }}>
      <div style={{ fontWeight:700, fontSize:15, color, marginBottom:14 }}>{emoji} {slot} Slot</div>

      {/* Buffalo */}
      <div style={{ fontSize:11, fontWeight:700, color:"#92400e", background:"#fffbeb", borderRadius:7, padding:"5px 10px", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>
        🐃 Buffalo Cattle
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 10px", marginBottom:12 }}>
        {BUFFALO_CATTLE.map(c => (
          <div key={c} style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontWeight:700, fontSize:13, color:"#374151", width:24 }}>{c}</span>
            <input type="number" min="0" step="0.01" placeholder="kg+bucket"
              value={rawKg[c]||""} onChange={e => setRawKg(p=>({...p,[c]:e.target.value}))}
              style={{ flex:1, padding:"7px 8px", border:"1.5px solid #e2e8f0", borderRadius:7, fontSize:13, textAlign:"center", background:"#fafafa", outline:"none" }} />
            <span style={{ fontSize:11, color:"#999", width:36, textAlign:"right" }}>
              {rawKg[c] ? fmtN(toNet(rawKg[c]),1)+"L" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Cow */}
      <div style={{ fontSize:11, fontWeight:700, color:"#1d4ed8", background:"#eff6ff", borderRadius:7, padding:"5px 10px", marginBottom:8, textTransform:"uppercase", letterSpacing:"0.6px" }}>
        🐄 Cow Cattle
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 10px", marginBottom:14 }}>
        {COW_CATTLE.map(c => (
          <div key={c} style={{ display:"flex", alignItems:"center", gap:7 }}>
            <span style={{ fontWeight:700, fontSize:13, color:"#374151", width:24 }}>{c}</span>
            <input type="number" min="0" step="0.01" placeholder="kg+bucket"
              value={rawKg[c]||""} onChange={e => setRawKg(p=>({...p,[c]:e.target.value}))}
              style={{ flex:1, padding:"7px 8px", border:"1.5px solid #e2e8f0", borderRadius:7, fontSize:13, textAlign:"center", background:"#fafafa", outline:"none" }} />
            <span style={{ fontSize:11, color:"#999", width:36, textAlign:"right" }}>
              {rawKg[c] ? fmtN(toNet(rawKg[c]),1)+"L" : ""}
            </span>
          </div>
        ))}
      </div>

      {/* Calculated totals */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        <div style={{ flex:1, background:"#fffbeb", border:"1px solid #fde68a", borderRadius:9, padding:"10px 12px", textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#92400e", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px" }}>Buffalo Total</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#92400e", marginTop:2 }}>{fmtN(bLtrs,2)} L</div>
        </div>
        <div style={{ flex:1, background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:9, padding:"10px 12px", textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#1d4ed8", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px" }}>Cow Total</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#1d4ed8", marginTop:2 }}>{fmtN(cLtrs,2)} L</div>
        </div>
        <div style={{ flex:1, background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"10px 12px", textAlign:"center" }}>
          <div style={{ fontSize:10, color:"#15803d", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.6px" }}>Slot Total</div>
          <div style={{ fontSize:18, fontWeight:700, color:"#15803d", marginTop:2 }}>{fmtN(slotTotal,2)} L</div>
        </div>
      </div>

      {/* Measured totals for verification */}
      <div style={{ fontSize:11, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>
        📏 Physical Measurement (for verification)
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 10px", marginBottom:14 }}>
        <div>
          <Label>B Total Measured (kg+bucket)</Label>
          <input type="number" min="0" step="0.01" placeholder="0"
            value={measuredB||""} onChange={e=>setMeasuredB(e.target.value)}
            style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #fde68a", borderRadius:8, fontSize:13, textAlign:"center", background:"#fffbeb", outline:"none", boxSizing:"border-box" }} />
          {measuredB && <div style={{ fontSize:11, color:"#92400e", marginTop:3, textAlign:"center" }}>
            Net: {fmtN(toNet(measuredB),2)} L
            {Math.abs(toNet(measuredB)-bLtrs)>0.2 ? " ⚠️ Mismatch" : " ✓"}
          </div>}
        </div>
        <div>
          <Label>C Total Measured (kg+bucket)</Label>
          <input type="number" min="0" step="0.01" placeholder="0"
            value={measuredC||""} onChange={e=>setMeasuredC(e.target.value)}
            style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #bfdbfe", borderRadius:8, fontSize:13, textAlign:"center", background:"#eff6ff", outline:"none", boxSizing:"border-box" }} />
          {measuredC && <div style={{ fontSize:11, color:"#1d4ed8", marginTop:3, textAlign:"center" }}>
            Net: {fmtN(toNet(measuredC),2)} L
            {Math.abs(toNet(measuredC)-cLtrs)>0.2 ? " ⚠️ Mismatch" : " ✓"}
          </div>}
        </div>
      </div>

      {/* Outside milk */}
      <div style={{ fontSize:11, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.6px", marginBottom:8 }}>
        🔄 Outside Milk (Purchased / Sold Extra)
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 10px" }}>
        <div>
          <Label>Outside Buffalo (L) +/-</Label>
          <input type="number" step="0.1" placeholder="0 (+ bought, - sold)"
            value={outsideB||""} onChange={e=>setOutsideB(e.target.value)}
            style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, textAlign:"center", background:"#fafafa", outline:"none", boxSizing:"border-box" }} />
        </div>
        <div>
          <Label>Outside Cow (L) +/-</Label>
          <input type="number" step="0.1" placeholder="0 (+ bought, - sold)"
            value={outsideC||""} onChange={e=>setOutsideC(e.target.value)}
            style={{ width:"100%", padding:"8px 10px", border:"1.5px solid #e2e8f0", borderRadius:8, fontSize:13, textAlign:"center", background:"#fafafa", outline:"none", boxSizing:"border-box" }} />
        </div>
      </div>
    </Card>
  );
}

function SupervisorView() {
  const [date, setDate] = useState(today());
  const [mRaw, setMRaw] = useState({});
  const [eRaw, setERaw] = useState({});
  const [mMeasB, setMMeasB] = useState(""); const [mMeasC, setMMeasC] = useState("");
  const [eMeasB, setEMeasB] = useState(""); const [eMeasC, setEMeasC] = useState("");
  const [mOutB, setMOutB] = useState(""); const [mOutC, setMOutC] = useState("");
  const [eOutB, setEOutB] = useState(""); const [eOutC, setEOutC] = useState("");
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  function netForSlot(rawMap) {
    const allCattle = [...BUFFALO_CATTLE, ...COW_CATTLE];
    return allCattle.reduce((s,c) => s + toNet(rawMap[c]||0), 0);
  }
  const mTotal = netForSlot(mRaw);
  const eTotal = netForSlot(eRaw);
  const grandTotal = mTotal + eTotal;

  async function handleSubmit() {
    if (!date) { setErrMsg("Please select a date."); setStatus("error"); return; }
    if (grandTotal === 0) { setErrMsg("Total is 0 — please enter at least one value."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const buildRows = (rawMap) => [...BUFFALO_CATTLE, ...COW_CATTLE].map(c => ({
        cattle: c, type: BUFFALO_CATTLE.includes(c) ? "B" : "C",
        rawKg: parseFloat(rawMap[c])||0,
        netLtrs: toNet(rawMap[c]||0),
      })).filter(r => r.rawKg > 0);

      await apiPost("logProduction", {
        date,
        morning: { rows: JSON.stringify(buildRows(mRaw)), total: mTotal, measuredB: mMeasB, measuredC: mMeasC, outsideB: mOutB, outsideC: mOutC },
        evening: { rows: JSON.stringify(buildRows(eRaw)), total: eTotal, measuredB: eMeasB, measuredC: eMeasC, outsideB: eOutB, outsideC: eOutC },
        grandTotal,
      });
      setStatus("success");
      setMRaw({}); setERaw({});
      setMMeasB(""); setMMeasC(""); setEMeasB(""); setEMeasC("");
      setMOutB(""); setMOutC(""); setEOutB(""); setEOutC("");
    } catch(e) { setErrMsg(e.message); setStatus("error"); }
  }

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a" }}>Log Today's Production</div>
        <div style={{ color:"#888", fontSize:13, marginTop:2 }}>Enter weight including bucket (kg)</div>
      </div>
      {status==="success" && <Alert type="success">✅ Production logged for {fmtDate(date)}! Grand Total: {fmtN(grandTotal,2)} L</Alert>}
      {status==="error" && <Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{ marginBottom:14 }}>
        <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()} />
        <div style={{ display:"flex", gap:8 }}>
          <StatBox label="Morning Total" value={`${fmtN(mTotal,2)} L`} color="#f59e0b" />
          <StatBox label="Evening Total" value={`${fmtN(eTotal,2)} L`} color="#6366f1" />
          <StatBox label="Grand Total"   value={`${fmtN(grandTotal,2)} L`} color="#2d6a4f" />
        </div>
      </Card>

      <SlotEntry slot="Morning" rawKg={mRaw} setRawKg={setMRaw}
        measuredB={mMeasB} setMeasuredB={setMMeasB} measuredC={mMeasC} setMeasuredC={setMMeasC}
        outsideB={mOutB} setOutsideB={setMOutB} outsideC={mOutC} setOutsideC={setMOutC} />
      <SlotEntry slot="Evening" rawKg={eRaw} setRawKg={setERaw}
        measuredB={eMeasB} setMeasuredB={setEMeasB} measuredC={eMeasC} setMeasuredC={setEMeasC}
        outsideB={eOutB} setOutsideB={setEOutB} outsideC={eOutC} setOutsideC={setEOutC} />

      <Btn onClick={handleSubmit} style={{ width:"100%" }} disabled={status==="loading"}>
        {status==="loading" ? "Saving…" : "Submit Production Log"}
      </Btn>
    </div>
  );
}

// ─── DELIVERY VIEW ─────────────────────────────────────────────────────────
function CustomerRow({ customer, value, onChange }) {
  const isB = customer.type === "B";
  const bColor = "#92400e"; const cColor = "#1d4ed8";
  const color = isB ? bColor : cColor;
  const bg    = isB ? "#fffbeb" : "#eff6ff";
  const tagBg = isB ? "#fde68a" : "#bfdbfe";

  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 0", borderBottom:"1px solid #f8fafc" }}>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, fontWeight:600, color:"#1a1a1a", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{customer.name}</div>
        {customer.phone && <div style={{ fontSize:11, color:"#aaa", marginTop:1 }}>{customer.phone}</div>}
      </div>
      <span style={{ background:tagBg, color, fontSize:10, fontWeight:700, padding:"2px 7px", borderRadius:10, flexShrink:0 }}>
        {isB ? "🐃 B" : "🐄 C"}
      </span>
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{ padding:"6px 8px", border:`1.5px solid ${value&&value!=="Nil"?color:"#e2e8f0"}`, borderRadius:8, fontSize:13, fontWeight:600, background: value&&value!=="Nil"?bg:"#fafafa", color: value&&value!=="Nil"?color:"#888", outline:"none", width:72, flexShrink:0, fontFamily:"inherit" }}>
        <option value="">—</option>
        {QTY_OPTIONS.map(q => <option key={q} value={q}>{q==="Nil"?"Nil (Absent)":q+" L"}</option>)}
      </select>
    </div>
  );
}

function DeliveryView() {
  const [date, setDate] = useState(today());
  const [slot, setSlot] = useState("morning");
  const [mVals, setMVals] = useState({});
  const [eVals, setEVals] = useState({});
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const customers = slot === "morning" ? MORNING_CUSTOMERS : EVENING_CUSTOMERS;
  const vals = slot === "morning" ? mVals : eVals;
  const setVals = slot === "morning" ? setMVals : setEVals;

  function totalLtrs(vals) {
    return Object.values(vals).reduce((s,v) => s + (v && v!=="Nil" ? parseFloat(v)||0 : 0), 0);
  }
  const mTotal = totalLtrs(mVals);
  const eTotal = totalLtrs(eVals);

  async function handleSubmit() {
    if (!date) { setErrMsg("Please select a date."); setStatus("error"); return; }
    if (mTotal+eTotal === 0) { setErrMsg("No deliveries entered."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const buildEntries = (customers, vals) => customers.map(c => ({
        name: c.name, type: c.type, qty: vals[c.name] || "Nil"
      }));
      await apiPost("logDispatch", {
        date,
        morning: { entries: JSON.stringify(buildEntries(MORNING_CUSTOMERS, mVals)), total: mTotal },
        evening: { entries: JSON.stringify(buildEntries(EVENING_CUSTOMERS, eVals)), total: eTotal },
        grandTotal: mTotal + eTotal,
      });
      setStatus("success");
      setMVals({}); setEVals({});
    } catch(e) { setErrMsg(e.message); setStatus("error"); }
  }

  return (
    <div>
      <div style={{ marginBottom:18 }}>
        <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a" }}>Log Milk Dispatched</div>
        <div style={{ color:"#888", fontSize:13, marginTop:2 }}>Record delivery for each customer</div>
      </div>
      {status==="success" && <Alert type="success">✅ Dispatch logged for {fmtDate(date)}!</Alert>}
      {status==="error" && <Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{ marginBottom:14 }}>
        <Input label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()} />
        <div style={{ display:"flex", gap:8 }}>
          <StatBox label="Morning Dispatched" value={`${fmtN(mTotal,2)} L`} color="#f59e0b" />
          <StatBox label="Evening Dispatched" value={`${fmtN(eTotal,2)} L`} color="#6366f1" />
        </div>
      </Card>

      <TabBar tabs={[{key:"morning",label:"☀️ Morning"},{key:"evening",label:"🌙 Evening"}]} active={slot} onChange={setSlot} />

      <Card>
        <div style={{ fontWeight:700, fontSize:13, color:"#555", marginBottom:12 }}>
          {slot==="morning" ? "☀️ Morning Customers" : "🌙 Evening Customers"} ({customers.length})
        </div>
        {customers.map(c => (
          <CustomerRow key={c.name} customer={c} value={vals[c.name]||""} onChange={v => setVals(p=>({...p,[c.name]:v}))} />
        ))}
      </Card>

      <div style={{ height:16 }} />
      <Btn onClick={handleSubmit} style={{ width:"100%" }} disabled={status==="loading"}>
        {status==="loading" ? "Saving…" : "Submit Dispatch Log"}
      </Btn>
    </div>
  );
}

// ─── OWNER DASHBOARD ───────────────────────────────────────────────────────
function OwnerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("overview");

  async function load() {
    setLoading(true); setError(null);
    try { setData(await apiGet("getDashboard")); }
    catch(e) { setError(e.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  if (loading) return <div style={{ textAlign:"center", padding:"60px 20px", color:"#888" }}><div style={{ fontSize:36, marginBottom:12 }}>🔄</div><div>Loading dashboard…</div></div>;
  if (error) return <div><Alert type="error">❌ Could not load data: {error}<br/><span style={{ fontSize:11 }}>Check your Google Apps Script URL in App.jsx line 7.</span></Alert><Btn onClick={load} variant="ghost" style={{ width:"100%" }}>Retry</Btn></div>;

  const { summary={}, recentDays=[], monthlyTrend=[] } = data || {};
  const gap30 = (summary.last30DaysProduce||0) - (summary.last30DaysDispatched||0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <div><div style={{ fontSize:20, fontWeight:700 }}>Owner Dashboard</div><div style={{ color:"#888", fontSize:12, marginTop:2 }}>Live farm operations</div></div>
        <Btn variant="ghost" onClick={load} style={{ padding:"7px 13px", fontSize:12 }}>↻ Refresh</Btn>
      </div>

      <TabBar tabs={[{key:"overview",label:"Overview"},{key:"daily",label:"Daily Log"},{key:"monthly",label:"Monthly"}]} active={tab} onChange={setTab} />

      {tab==="overview" && (
        <div>
          {/* Today's snapshot — at top */}
          <Card style={{ marginBottom:14 }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#374151", marginBottom:12 }}>📅 Today's Snapshot</div>
            <div style={{ display:"flex", gap:8, marginBottom:10 }}>
              <StatBox label="Produced" value={`${fmtN(summary.todayProduce||0,1)} L`} color="#2d6a4f" />
              <StatBox label="Dispatched" value={`${fmtN(summary.todayDispatched||0,1)} L`} color="#1d3557" />
            </div>
            {(summary.todayProduce||0) > 0 && (() => {
              const g = (summary.todayProduce||0)-(summary.todayDispatched||0);
              return <div style={{ padding:"9px 13px", borderRadius:9, background:g>=0?"#f0fdf4":"#fef2f2", color:g>=0?"#15803d":"#dc2626", fontSize:13, fontWeight:600 }}>
                {g>=0 ? `✅ Surplus of ${fmtN(g,1)} L` : `⚠️ Deficit of ${fmtN(Math.abs(g),1)} L`}
              </div>;
            })()}
            {(summary.todayProduce||0) === 0 && <div style={{ color:"#aaa", fontSize:12 }}>No production logged today yet.</div>}
          </Card>

          {/* 30-day metrics */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:14 }}>
            <StatBox label="Produced (30d)"   value={`${fmtN(summary.last30DaysProduce||0,0)} L`}   color="#2d6a4f" />
            <StatBox label="Dispatched (30d)" value={`${fmtN(summary.last30DaysDispatched||0,0)} L`} color="#1d3557" />
            <StatBox label="Gap (30d)" value={`${fmtN(Math.abs(gap30),0)} L`}
              sub={gap30>0?"Surplus":gap30<0?"Deficit":"Balanced"} color={gap30>=0?"#2d6a4f":"#dc2626"} />
            <StatBox label="Revenue (30d)" value={fmtRs(summary.last30DaysRevenue||0)} color="#7b2d00" />
          </div>

          {/* Settings */}
          <Card>
            <div style={{ fontWeight:700, fontSize:13, marginBottom:10, color:"#374151" }}>⚙️ Current Settings</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555", paddingBottom:7, marginBottom:7, borderBottom:"1px solid #f1f5f9" }}>
              <span>Buffalo milk rate</span><span style={{ fontWeight:600 }}>₹{summary.rateB||70}/L</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555", paddingBottom:7, marginBottom:7, borderBottom:"1px solid #f1f5f9" }}>
              <span>Cow milk rate</span><span style={{ fontWeight:600 }}>₹{summary.rateC||60}/L</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555" }}>
              <span>Active cattle</span><span style={{ fontWeight:600 }}>{summary.activeCattle||10} ({BUFFALO_CATTLE.length}B + {COW_CATTLE.length}C)</span>
            </div>
          </Card>
        </div>
      )}

      {tab==="daily" && (
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:"#374151", marginBottom:14 }}>Recent Daily Records</div>
          {recentDays.length===0 ? <div style={{ color:"#aaa", fontSize:13, textAlign:"center", padding:"20px 0" }}>No data yet.</div> : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                    {["Date","Produced (L)","Dispatched (L)","Gap (L)","Revenue","Status"].map(h=>(
                      <th key={h} style={{ textAlign:"left", padding:"5px 7px", color:"#888", fontWeight:600, fontSize:11, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentDays.map((row,i)=>{
                    const g=(row.produced||0)-(row.dispatched||0);
                    return <tr key={i} style={{ borderBottom:"1px solid #f8fafc" }}>
                      <td style={{ padding:"7px", fontWeight:600, color:"#374151" }}>{fmtDate(row.date)}</td>
                      <td style={{ padding:"7px" }}>{fmtN(row.produced,1)}</td>
                      <td style={{ padding:"7px" }}>{fmtN(row.dispatched,1)}</td>
                      <td style={{ padding:"7px", fontWeight:600, color:g>=0?"#15803d":"#dc2626" }}>{g>=0?"+":""}{fmtN(g,1)}</td>
                      <td style={{ padding:"7px" }}>{fmtRs((row.dispatched||0)*(summary.rateB||70))}</td>
                      <td style={{ padding:"7px" }}>
                        <span style={{ background:g>=0?"#f0fdf4":"#fef2f2", color:g>=0?"#15803d":"#dc2626", border:`1px solid ${g>=0?"#bbf7d0":"#fecaca"}`, borderRadius:20, padding:"2px 9px", fontSize:11, fontWeight:600 }}>
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

      {tab==="monthly" && (
        <Card>
          <div style={{ fontWeight:700, fontSize:13, color:"#374151", marginBottom:14 }}>Monthly Summary</div>
          {monthlyTrend.length===0 ? <div style={{ color:"#aaa", fontSize:13, textAlign:"center", padding:"20px 0" }}>No monthly data yet.</div> : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                    {["Month","Produced (L)","Dispatched (L)","Revenue","Gap (L)"].map(h=>(
                      <th key={h} style={{ textAlign:"left", padding:"5px 7px", color:"#888", fontWeight:600, fontSize:11, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrend.map((row,i)=>{
                    const g=(row.produced||0)-(row.dispatched||0);
                    return <tr key={i} style={{ borderBottom:"1px solid #f8fafc" }}>
                      <td style={{ padding:"7px", fontWeight:600 }}>{row.month}</td>
                      <td style={{ padding:"7px" }}>{fmtN(row.produced,1)}</td>
                      <td style={{ padding:"7px" }}>{fmtN(row.dispatched,1)}</td>
                      <td style={{ padding:"7px" }}>{fmtRs((row.dispatched||0)*(summary.rateB||70))}</td>
                      <td style={{ padding:"7px", fontWeight:600, color:g>=0?"#15803d":"#dc2626" }}>{g>=0?"+":""}{fmtN(g,1)}</td>
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
  const [role, setRole] = useState(null);
  if (!role) return <LoginScreen onLogin={setRole} />;
  const r = ROLES[role];
  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter','Segoe UI',Arial,sans-serif" }}>
      <div style={{ background:"#fff", borderBottom:"1px solid #e8ecf0", padding:"11px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#2d6a4f,#52b788)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🐄</div>
          <div>
            <div style={{ fontFamily:"Georgia,serif", fontWeight:700, fontSize:16, color:"#1a1a1a" }}>Banki Dairy</div>
            <div style={{ fontSize:9, color:"#aaa", letterSpacing:"1.2px", textTransform:"uppercase" }}>Farm Operations</div>
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ background:r.color+"18", color:r.color, border:`1px solid ${r.color}33`, borderRadius:20, padding:"3px 10px", fontSize:12, fontWeight:600 }}>{r.emoji} {r.label}</span>
          <button onClick={()=>setRole(null)} style={{ background:"none", border:"none", color:"#aaa", cursor:"pointer", fontSize:12 }}>Switch ↩</button>
        </div>
      </div>
      <div style={{ maxWidth:520, margin:"0 auto", padding:"18px 15px 48px" }}>
        {role==="supervisor" && <SupervisorView />}
        {role==="delivery"   && <DeliveryView />}
        {role==="owner"      && <OwnerDashboard />}
      </div>
    </div>
  );
}
