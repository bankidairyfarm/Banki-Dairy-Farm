import { useState, useEffect } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
// Replace this with your Google Apps Script Web App URL after deployment
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0Y0qDrOhIVALmFtnAp-pgRSnM47A5Fk5GsZlj708_hzh9NCi6VFGlx-PCXmYCgITH/exec";

const ROLES = {
  supervisor: { label: "Supervisor", emoji: "🧑‍🌾", color: "#2d6a4f" },
  delivery:   { label: "Delivery",   emoji: "🚚", color: "#1d3557" },
  owner:      { label: "Owner",      emoji: "👑", color: "#7b2d00" },
};

const CATTLE = ["B1","B2","B3","B4","B5","B6","B7","B8","B9","C1","C2","C3"];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function today() {
  return new Date().toISOString().split("T")[0];
}
function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" });
}
function fmtN(n, dec = 2) {
  if (n == null || isNaN(n)) return "—";
  return Number(n).toFixed(dec);
}
function fmtRs(n) {
  if (n == null || isNaN(n)) return "—";
  return "₹" + Number(n).toLocaleString("en-IN", { maximumFractionDigits: 0 });
}

// ─── API HELPERS ───────────────────────────────────────────────────────────
async function apiCall(action, payload = {}) {
  const params = new URLSearchParams({ action, ...payload });
  const url = `${SCRIPT_URL}?${params}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json;
}

async function submitForm(action, data) {
  const res = await fetch(SCRIPT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...data }),
    mode: "no-cors",
  });
  // no-cors means we can't read the response — assume success
  return true;
}

// ─── COMPONENTS ────────────────────────────────────────────────────────────

function Logo() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10 }}>
      <div style={{
        width:40, height:40, borderRadius:"50%",
        background:"linear-gradient(135deg,#2d6a4f,#52b788)",
        display:"flex", alignItems:"center", justifyContent:"center",
        fontSize:20
      }}>🐄</div>
      <div>
        <div style={{ fontFamily:"'Georgia', serif", fontWeight:700, fontSize:18, color:"#1a1a1a", letterSpacing:"-0.3px" }}>
          Banki Dairy
        </div>
        <div style={{ fontSize:10, color:"#888", letterSpacing:"1.5px", textTransform:"uppercase" }}>
          Farm Operations
        </div>
      </div>
    </div>
  );
}

function Card({ children, style = {} }) {
  return (
    <div style={{
      background:"#fff",
      borderRadius:14,
      boxShadow:"0 1px 4px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
      padding:"20px 22px",
      ...style
    }}>
      {children}
    </div>
  );
}

function Tag({ color, children }) {
  return (
    <span style={{
      background: color + "18",
      color,
      border: `1px solid ${color}33`,
      borderRadius:20,
      padding:"2px 10px",
      fontSize:12,
      fontWeight:600
    }}>{children}</span>
  );
}

function StatBox({ label, value, sub, color="#2d6a4f" }) {
  return (
    <div style={{
      background: color + "0a",
      border: `1px solid ${color}22`,
      borderRadius:12,
      padding:"14px 16px",
      flex:1
    }}>
      <div style={{ fontSize:11, color:"#777", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:4 }}>{label}</div>
      <div style={{ fontSize:24, fontWeight:700, color, lineHeight:1 }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:"#999", marginTop:4 }}>{sub}</div>}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:12, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.6px" }}>{label}</div>}
      <input
        style={{
          width:"100%", padding:"10px 13px", border:"1.5px solid #e2e8f0",
          borderRadius:8, fontSize:14, background:"#fafafa",
          outline:"none", boxSizing:"border-box",
          fontFamily:"inherit", color:"#1a1a1a"
        }}
        {...props}
      />
    </div>
  );
}

function Select({ label, children, ...props }) {
  return (
    <div style={{ marginBottom:14 }}>
      {label && <div style={{ fontSize:12, fontWeight:600, color:"#555", marginBottom:5, textTransform:"uppercase", letterSpacing:"0.6px" }}>{label}</div>}
      <select
        style={{
          width:"100%", padding:"10px 13px", border:"1.5px solid #e2e8f0",
          borderRadius:8, fontSize:14, background:"#fafafa",
          outline:"none", boxSizing:"border-box", fontFamily:"inherit", color:"#1a1a1a"
        }}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

function Btn({ children, variant="primary", style={}, ...props }) {
  const base = {
    padding:"11px 22px", borderRadius:9, fontSize:14, fontWeight:600,
    border:"none", cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit"
  };
  const variants = {
    primary: { background:"#2d6a4f", color:"#fff" },
    danger:  { background:"#dc2626", color:"#fff" },
    ghost:   { background:"transparent", color:"#2d6a4f", border:"1.5px solid #2d6a4f" },
    gray:    { background:"#f1f5f9", color:"#475569" },
  };
  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...props}>
      {children}
    </button>
  );
}

function Alert({ type="info", children }) {
  const colors = {
    info:    { bg:"#eff6ff", border:"#bfdbfe", text:"#1e40af" },
    success: { bg:"#f0fdf4", border:"#bbf7d0", text:"#15803d" },
    warn:    { bg:"#fffbeb", border:"#fde68a", text:"#92400e" },
    error:   { bg:"#fef2f2", border:"#fecaca", text:"#991b1b" },
  };
  const c = colors[type];
  return (
    <div style={{
      background:c.bg, border:`1px solid ${c.border}`, color:c.text,
      borderRadius:9, padding:"11px 15px", fontSize:13, marginBottom:14
    }}>
      {children}
    </div>
  );
}

// ─── LOGIN SCREEN ──────────────────────────────────────────────────────────
function LoginScreen({ onLogin }) {
  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(160deg, #e9f5ee 0%, #f8fafc 60%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20
    }}>
      <div style={{ width:"100%", maxWidth:380 }}>
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontSize:52, marginBottom:10 }}>🐄</div>
          <div style={{ fontFamily:"Georgia,serif", fontSize:26, fontWeight:700, color:"#1a1a1a" }}>
            Banki Dairy Farm
          </div>
          <div style={{ color:"#666", marginTop:6, fontSize:14 }}>
            Select your role to continue
          </div>
        </div>

        <Card>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {Object.entries(ROLES).map(([key, role]) => (
              <button
                key={key}
                onClick={() => onLogin(key)}
                style={{
                  display:"flex", alignItems:"center", gap:14,
                  padding:"15px 18px", borderRadius:11,
                  border:"1.5px solid #e2e8f0", background:"#fafafa",
                  cursor:"pointer", textAlign:"left", width:"100%",
                  transition:"all 0.15s", fontFamily:"inherit"
                }}
                onMouseEnter={e => { e.currentTarget.style.background="#f0fdf4"; e.currentTarget.style.borderColor=role.color; }}
                onMouseLeave={e => { e.currentTarget.style.background="#fafafa"; e.currentTarget.style.borderColor="#e2e8f0"; }}
              >
                <span style={{ fontSize:28 }}>{role.emoji}</span>
                <div>
                  <div style={{ fontWeight:700, fontSize:15, color:"#1a1a1a" }}>{role.label}</div>
                  <div style={{ fontSize:12, color:"#888", marginTop:1 }}>
                    {key === "supervisor" && "Log daily milk production"}
                    {key === "delivery" && "Record milk dispatched to customers"}
                    {key === "owner" && "View full dashboard & analytics"}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        <div style={{ textAlign:"center", marginTop:20, fontSize:11, color:"#aaa" }}>
          Banki Dairy Farm · Operations Tracker
        </div>
      </div>
    </div>
  );
}

// ─── SUPERVISOR VIEW ───────────────────────────────────────────────────────
function SupervisorView() {
  const [date, setDate] = useState(today());
  const [morningQty, setMorningQty] = useState({});
  const [eveningQty, setEveningQty] = useState({});
  const [status, setStatus] = useState(null); // null | "loading" | "success" | "error"
  const [errMsg, setErrMsg] = useState("");

  const totalMorning = Object.values(morningQty).reduce((s,v) => s + (parseFloat(v)||0), 0);
  const totalEvening = Object.values(eveningQty).reduce((s,v) => s + (parseFloat(v)||0), 0);
  const grandTotal = totalMorning + totalEvening;

  async function handleSubmit() {
    if (!date) { setErrMsg("Please select a date."); setStatus("error"); return; }
    if (grandTotal === 0) { setErrMsg("Total production is 0 — please enter at least one quantity."); setStatus("error"); return; }
    setStatus("loading");
    try {
      const rows = CATTLE.map(c => ({
        cattle: c,
        morning: parseFloat(morningQty[c]) || 0,
        evening: parseFloat(eveningQty[c]) || 0,
      })).filter(r => r.morning > 0 || r.evening > 0);

      await submitForm("logProduction", { date, rows: JSON.stringify(rows), totalMorning, totalEvening, grandTotal });
      setStatus("success");
      setMorningQty({}); setEveningQty({});
    } catch (e) {
      setErrMsg(e.message); setStatus("error");
    }
  }

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a" }}>Log Today's Production</div>
        <div style={{ color:"#888", fontSize:13, marginTop:3 }}>Enter milk collected per cattle per slot</div>
      </div>

      {status === "success" && (
        <Alert type="success">✅ Production logged successfully for {fmtDate(date)}! Total: {fmtN(grandTotal)} L</Alert>
      )}
      {status === "error" && <Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{ marginBottom:16 }}>
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} max={today()} />

        <div style={{ display:"flex", gap:10, marginBottom:20 }}>
          <StatBox label="Morning Total" value={`${fmtN(totalMorning)} L`} color="#f59e0b" />
          <StatBox label="Evening Total" value={`${fmtN(totalEvening)} L`} color="#6366f1" />
          <StatBox label="Grand Total"   value={`${fmtN(grandTotal)} L`}   color="#2d6a4f" />
        </div>

        <div style={{ fontSize:12, fontWeight:700, color:"#555", textTransform:"uppercase", letterSpacing:"0.8px", marginBottom:10 }}>
          Per-Cattle Entry (Litres)
        </div>

        <div style={{
          display:"grid", gridTemplateColumns:"1fr 1fr 1fr",
          gap:"2px 8px",
          background:"#f8fafc", borderRadius:10, padding:12
        }}>
          <div style={{ fontSize:11, fontWeight:700, color:"#888", padding:"4px 0" }}>Cattle</div>
          <div style={{ fontSize:11, fontWeight:700, color:"#f59e0b", padding:"4px 0", textAlign:"center" }}>☀️ Morning</div>
          <div style={{ fontSize:11, fontWeight:700, color:"#6366f1", padding:"4px 0", textAlign:"center" }}>🌙 Evening</div>

          {CATTLE.map(c => (
            <>
              <div key={c+"l"} style={{ padding:"6px 0", fontSize:13, fontWeight:600, color:"#374151", display:"flex", alignItems:"center" }}>{c}</div>
              <input
                key={c+"m"}
                type="number" min="0" step="0.1" placeholder="0"
                value={morningQty[c] ?? ""}
                onChange={e => setMorningQty(p => ({ ...p, [c]: e.target.value }))}
                style={{ padding:"6px 8px", border:"1.5px solid #e2e8f0", borderRadius:7, fontSize:13, textAlign:"center", width:"100%", boxSizing:"border-box", background:"#fff" }}
              />
              <input
                key={c+"e"}
                type="number" min="0" step="0.1" placeholder="0"
                value={eveningQty[c] ?? ""}
                onChange={e => setEveningQty(p => ({ ...p, [c]: e.target.value }))}
                style={{ padding:"6px 8px", border:"1.5px solid #e2e8f0", borderRadius:7, fontSize:13, textAlign:"center", width:"100%", boxSizing:"border-box", background:"#fff" }}
              />
            </>
          ))}
        </div>
      </Card>

      <Btn
        onClick={handleSubmit}
        style={{ width:"100%" }}
        disabled={status === "loading"}
      >
        {status === "loading" ? "Saving…" : "Submit Production Log"}
      </Btn>
    </div>
  );
}

// ─── DELIVERY VIEW ─────────────────────────────────────────────────────────
function DeliveryView() {
  const [date, setDate] = useState(today());
  const [retail_b, setRetailB] = useState("");
  const [retail_c, setRetailC] = useState("");
  const [wholesale, setWholesale] = useState("");
  const [other, setOther] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState(null);
  const [errMsg, setErrMsg] = useState("");

  const totalDispatched = (parseFloat(retail_b)||0) + (parseFloat(retail_c)||0) + (parseFloat(wholesale)||0) + (parseFloat(other)||0);

  async function handleSubmit() {
    if (!date) { setErrMsg("Please select a date."); setStatus("error"); return; }
    if (totalDispatched === 0) { setErrMsg("Total dispatched is 0 — please enter at least one quantity."); setStatus("error"); return; }
    setStatus("loading");
    try {
      await submitForm("logDispatch", {
        date, retail_b: parseFloat(retail_b)||0, retail_c: parseFloat(retail_c)||0,
        wholesale: parseFloat(wholesale)||0, other: parseFloat(other)||0,
        total: totalDispatched, note
      });
      setStatus("success");
      setRetailB(""); setRetailC(""); setWholesale(""); setOther(""); setNote("");
    } catch (e) {
      setErrMsg(e.message); setStatus("error");
    }
  }

  return (
    <div>
      <div style={{ marginBottom:20 }}>
        <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a" }}>Log Milk Dispatched</div>
        <div style={{ color:"#888", fontSize:13, marginTop:3 }}>Record milk sent to customers today</div>
      </div>

      {status === "success" && (
        <Alert type="success">✅ Dispatch logged for {fmtDate(date)}! Total: {fmtN(totalDispatched)} L</Alert>
      )}
      {status === "error" && <Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{ marginBottom:16 }}>
        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} max={today()} />

        <div style={{ display:"flex", gap:10, marginBottom:16 }}>
          <StatBox label="Total Dispatched" value={`${fmtN(totalDispatched)} L`} color="#1d3557" />
        </div>

        <Input label="Retail — B Customers (L)" type="number" min="0" step="0.25" placeholder="0" value={retail_b} onChange={e => setRetailB(e.target.value)} />
        <Input label="Retail — C Customers (L)" type="number" min="0" step="0.25" placeholder="0" value={retail_c} onChange={e => setRetailC(e.target.value)} />
        <Input label="Wholesale / Others (L)"    type="number" min="0" step="0.25" placeholder="0" value={wholesale} onChange={e => setWholesale(e.target.value)} />
        <Input label="Other (Samples etc.) (L)"  type="number" min="0" step="0.25" placeholder="0" value={other} onChange={e => setOther(e.target.value)} />
        <Input label="Notes (optional)" placeholder="Any remarks…" value={note} onChange={e => setNote(e.target.value)} />
      </Card>

      <Btn onClick={handleSubmit} style={{ width:"100%" }} disabled={status === "loading"}>
        {status === "loading" ? "Saving…" : "Submit Dispatch Log"}
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
    try {
      const res = await apiCall("getDashboard");
      setData(res);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) return (
    <div style={{ textAlign:"center", padding:"60px 20px", color:"#888" }}>
      <div style={{ fontSize:36, marginBottom:12 }}>🔄</div>
      <div style={{ fontSize:15 }}>Loading dashboard…</div>
      <div style={{ fontSize:12, marginTop:6, color:"#aaa" }}>Fetching data from Google Sheets</div>
    </div>
  );

  if (error) return (
    <div>
      <Alert type="error">
        ❌ Could not load data: {error}<br />
        <span style={{ fontSize:11 }}>Make sure your Google Apps Script URL is set correctly in the app config.</span>
      </Alert>
      <Btn onClick={load} variant="ghost" style={{ width:"100%" }}>Retry</Btn>
    </div>
  );

  const { summary, recentDays, monthlyTrend } = data || {};
  const today30 = summary?.last30DaysProduce ?? 0;
  const today30d = summary?.last30DaysDispatched ?? 0;
  const gap30 = today30 - today30d;

  const tabs = [
    { key:"overview", label:"Overview" },
    { key:"daily",    label:"Daily Log" },
    { key:"monthly",  label:"Monthly" },
  ];

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a" }}>Owner Dashboard</div>
          <div style={{ color:"#888", fontSize:12, marginTop:2 }}>Live farm operations view</div>
        </div>
        <Btn variant="ghost" onClick={load} style={{ padding:"7px 14px", fontSize:12 }}>↻ Refresh</Btn>
      </div>

      {/* tab bar */}
      <div style={{ display:"flex", gap:6, marginBottom:20, background:"#f1f5f9", borderRadius:10, padding:4 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            flex:1, padding:"8px 0", borderRadius:8, border:"none", cursor:"pointer",
            background: tab===t.key ? "#fff" : "transparent",
            color: tab===t.key ? "#1a1a1a" : "#888",
            fontWeight: tab===t.key ? 700 : 500,
            fontSize:13, boxShadow: tab===t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            fontFamily:"inherit"
          }}>{t.label}</button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === "overview" && (
        <div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:16 }}>
            <StatBox label="Produced (30d)" value={`${fmtN(today30, 0)} L`} color="#2d6a4f" />
            <StatBox label="Dispatched (30d)" value={`${fmtN(today30d, 0)} L`} color="#1d3557" />
            <StatBox label="Gap (30d)" value={`${fmtN(Math.abs(gap30), 0)} L`}
              sub={gap30 > 0 ? "Surplus" : gap30 < 0 ? "Deficit" : "Balanced"}
              color={gap30 >= 0 ? "#2d6a4f" : "#dc2626"} />
            <StatBox label="Revenue (30d)" value={fmtRs((summary?.last30DaysRevenue ?? 0))} color="#7b2d00" />
          </div>

          {/* Today snapshot */}
          {summary?.todayProduce != null && (
            <Card style={{ marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:14, marginBottom:12, color:"#374151" }}>📅 Today's Snapshot</div>
              <div style={{ display:"flex", gap:10 }}>
                <StatBox label="Produced" value={`${fmtN(summary.todayProduce, 1)} L`} color="#2d6a4f" />
                <StatBox label="Dispatched" value={`${fmtN(summary.todayDispatched, 1)} L`} color="#1d3557" />
              </div>
              {summary.todayProduce > 0 && (
                <div style={{
                  marginTop:10, padding:"10px 14px", borderRadius:9,
                  background: summary.todayProduce >= summary.todayDispatched ? "#f0fdf4" : "#fef2f2",
                  color: summary.todayProduce >= summary.todayDispatched ? "#15803d" : "#dc2626",
                  fontSize:13, fontWeight:600
                }}>
                  {summary.todayProduce >= summary.todayDispatched
                    ? `✅ Surplus of ${fmtN(summary.todayProduce - summary.todayDispatched, 1)} L today`
                    : `⚠️ Deficit of ${fmtN(summary.todayDispatched - summary.todayProduce, 1)} L today`}
                </div>
              )}
            </Card>
          )}

          {/* Rate info */}
          <Card>
            <div style={{ fontWeight:700, fontSize:14, marginBottom:10, color:"#374151" }}>⚙️ Current Settings</div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555", borderBottom:"1px solid #f1f5f9", paddingBottom:8, marginBottom:8 }}>
              <span>Milk selling rate</span><span style={{ fontWeight:600 }}>{fmtRs(summary?.milkRate ?? 70)}/L</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#555" }}>
              <span>Active cattle</span><span style={{ fontWeight:600 }}>{summary?.activeCattle ?? 10}</span>
            </div>
          </Card>
        </div>
      )}

      {/* DAILY LOG TAB */}
      {tab === "daily" && (
        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#374151" }}>Recent Daily Records</div>
          {(!recentDays || recentDays.length === 0) ? (
            <div style={{ color:"#aaa", fontSize:13, textAlign:"center", padding:"20px 0" }}>No data yet.</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                    {["Date","Produced (L)","Dispatched (L)","Gap (L)","Revenue (₹)","Status"].map(h => (
                      <th key={h} style={{ textAlign:"left", padding:"6px 8px", color:"#888", fontWeight:600, fontSize:11, textTransform:"uppercase", letterSpacing:"0.6px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentDays.map((row, i) => {
                    const gap = (row.produced||0) - (row.dispatched||0);
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid #f8fafc" }}>
                        <td style={{ padding:"8px 8px", fontWeight:600, color:"#374151" }}>{fmtDate(row.date)}</td>
                        <td style={{ padding:"8px 8px" }}>{fmtN(row.produced, 1)}</td>
                        <td style={{ padding:"8px 8px" }}>{fmtN(row.dispatched, 1)}</td>
                        <td style={{ padding:"8px 8px", fontWeight:600, color: gap >= 0 ? "#15803d" : "#dc2626" }}>
                          {gap >= 0 ? "+" : ""}{fmtN(gap, 1)}
                        </td>
                        <td style={{ padding:"8px 8px" }}>{fmtRs((row.dispatched||0) * (summary?.milkRate||70))}</td>
                        <td style={{ padding:"8px 8px" }}>
                          <Tag color={gap >= 0 ? "#15803d" : "#dc2626"}>{gap >= 0 ? "✓ OK" : "⚠ Gap"}</Tag>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* MONTHLY TAB */}
      {tab === "monthly" && (
        <Card>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:14, color:"#374151" }}>Monthly Summary</div>
          {(!monthlyTrend || monthlyTrend.length === 0) ? (
            <div style={{ color:"#aaa", fontSize:13, textAlign:"center", padding:"20px 0" }}>No monthly data yet.</div>
          ) : (
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
                <thead>
                  <tr style={{ borderBottom:"2px solid #f1f5f9" }}>
                    {["Month","Produced (L)","Dispatched (L)","Revenue (₹)","Gap (L)"].map(h => (
                      <th key={h} style={{ textAlign:"left", padding:"6px 8px", color:"#888", fontWeight:600, fontSize:11, textTransform:"uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrend.map((row, i) => {
                    const gap = (row.produced||0) - (row.dispatched||0);
                    return (
                      <tr key={i} style={{ borderBottom:"1px solid #f8fafc" }}>
                        <td style={{ padding:"8px 8px", fontWeight:600 }}>{row.month}</td>
                        <td style={{ padding:"8px 8px" }}>{fmtN(row.produced, 1)}</td>
                        <td style={{ padding:"8px 8px" }}>{fmtN(row.dispatched, 1)}</td>
                        <td style={{ padding:"8px 8px" }}>{fmtRs((row.dispatched||0)*(summary?.milkRate||70))}</td>
                        <td style={{ padding:"8px 8px", fontWeight:600, color: gap >= 0 ? "#15803d" : "#dc2626" }}>
                          {gap >= 0 ? "+" : ""}{fmtN(gap, 1)}
                        </td>
                      </tr>
                    );
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

// ─── MAIN APP ──────────────────────────────────────────────────────────────
export default function App() {
  const [role, setRole] = useState(null);
  const roleInfo = role ? ROLES[role] : null;

  if (!role) return <LoginScreen onLogin={setRole} />;

  return (
    <div style={{ minHeight:"100vh", background:"#f8fafc", fontFamily:"'Inter','Segoe UI',Arial,sans-serif" }}>
      {/* Header */}
      <div style={{
        background:"#fff",
        borderBottom:"1px solid #e8ecf0",
        padding:"12px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        position:"sticky", top:0, zIndex:100
      }}>
        <Logo />
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <Tag color={roleInfo.color}>{roleInfo.emoji} {roleInfo.label}</Tag>
          <button
            onClick={() => setRole(null)}
            style={{ background:"none", border:"none", color:"#aaa", cursor:"pointer", fontSize:13 }}
          >
            Switch ↩
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:520, margin:"0 auto", padding:"20px 16px 40px" }}>
        {role === "supervisor" && <SupervisorView />}
        {role === "delivery"   && <DeliveryView />}
        {role === "owner"      && <OwnerDashboard />}
      </div>
    </div>
  );
}
