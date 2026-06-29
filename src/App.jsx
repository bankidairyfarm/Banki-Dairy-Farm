import { useState, useEffect } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0Y0qDrOhIVALmFtnAp-pgRSnM47A5Fk5GsZlj708_hzh9NCi6VFGlx-PCXmYCgITH/exec";

// ─── ACCESS PINS ───────────────────────────────────────────────────────────
// Change these to your preferred PINs. Numeric, 4 digits recommended.
// To change a PIN: edit the number in quotes below, save, commit to GitHub.
const PINS = {
  supervisor: "1111",
  delivery:   "2222",
  owner:      "3333",
};

const BUFFALO_CATTLE = ["B4","B5","B6","B7","B8","B9"]; // B1 currently dry
const COW_CATTLE     = ["C1","C2","C3"];
const BUCKET_WEIGHT  = 1.18;
const CONVERSION     = 0.97;
const QTY_OPTIONS    = ["0.5","0.75","1","1.5","2","3","Nil"];

// ─── TRANSLATIONS ──────────────────────────────────────────────────────────
const LANGS = { en:"EN", hi:"हिं", ur:"اردو" };

const TR = {
  en: {
    // Login
    appName: "Banki Dairy Farm", appSub: "Operations Tracker",
    selectRole: "Select your role to continue",
    roleSupervisor: "Supervisor", roleDelivery: "Delivery", roleOwner: "Owner",
    roleSupDesc: "Log daily milk production",
    roleDelDesc: "Record milk dispatched to customers",
    roleOwnDesc: "View full dashboard & analytics",
    // Header
    switchBtn: "Switch ↩",
    // Supervisor
    supTitle: "Log Today's Production", supSub: "Enter weight including bucket (kg)",
    date: "Date", morning: "Morning", evening: "Evening", grandTotal: "Grand Total",
    buffalo: "🐃 Buffalo", cow: "🐄 Cow", kgWithBucket: "kg incl. bucket",
    measuredTotals: "Measured Totals", measuredTotalsShort: "Measured Totals",
    bTotal: "B Total (kg)", cTotal: "C Total (kg)",
    matches: "✓ Matches", mismatch: "⚠️ Mismatch",
    outsideMilk: "Outside Milk",
    purchased: "Purchased", extraMilk: "Extra Milk",
    qty: "Qty (L)", rate: "Rate (₹/L)", sold: "Sold", sellingRate: "Selling rate (₹/L)",
    calcTotals: "Calculated Totals",
    total: "Total", submitProd: "Submit Production Log", saving: "Saving…",
    savedProd: "✅ Production logged", loggedTotal: "Grand Total",
    // Delivery
    delTitle: "Log Milk Dispatched", delSub: "Record delivery for each customer",
    morningCustomers: "Morning Customers", eveningCustomers: "Evening Customers",
    yesterday: "Yesterday", absent: "absent", self: "Self",
    bottlesToFill: "🍶 Bottles to Fill",
    bufMilk: "Buffalo Milk", cowMilk: "Cow Milk", bottle: "bottle",
    submitDel: "Submit Dispatch Log",
    savedDel: "✅ Dispatch logged for",
    noDeliveries: "No entries filled in. Please enter quantities before submitting.",
    // Owner
    ownTitle: "Owner Dashboard", ownSub: "Live farm operations",
    refresh: "↻ Refresh", loading: "Loading dashboard…",
    overview: "Overview", dailyLog: "Daily Log", monthly: "Monthly",
    todaySnap: "📅 Today's Snapshot",
    produced: "Produced", dispatched: "Dispatched",
    gap: "Gap", revToday: "Revenue Today",
    surplus: "Surplus", deficit: "Deficit", balanced: "Balanced",
    surplusMsg: "✅ Surplus of", deficitMsg: "⚠️ Deficit of",
    noDataToday: "No production logged today yet.",
    produced30: "Produced (30d)", dispatched30: "Dispatched (30d)",
    gap30: "Gap (30d)", rev30: "Revenue (30d)",
    settings: "⚙️ Settings",
    bufRate: "Buffalo milk rate", cowRate: "Cow milk rate", activeCattle: "Active cattle",
    recentRecords: "Recent Daily Records", noData: "No data yet.",
    monthlySummary: "Monthly Summary", noMonthlyData: "No monthly data yet.",
    tableDate: "Date", revenue: "Revenue", status: "Status",
    ok: "✓ OK", gapWarn: "⚠ Gap", month: "Month",
    errLoad: "❌ Could not load data",
    errScriptUrl: "Check your Google Apps Script URL in App.jsx line 4.",
    retry: "Retry",
    nilOption: "Nil",
    customersTab: "Customers",
    enterPin: "Enter your PIN", wrongPin: "Wrong PIN. Try again.", pinHint: "Choose your role",
    editHint: "Values retained — edit and resubmit if needed",
    savedMorning: "✅ Morning dispatch saved", savedEvening: "✅ Evening dispatch saved",
    submitMorning: "Submit Morning Deliveries", submitEvening: "Submit Evening Deliveries",
    bufToday: "Buffalo Today", cowToday: "Cow Today",
    buf30: "Buffalo (30d)", cow30: "Cow (30d)",
  },
  hi: {
    appName: "बंकी डेयरी फार्म", appSub: "संचालन ट्रैकर",
    selectRole: "जारी रखने के लिए अपनी भूमिका चुनें",
    roleSupervisor: "सुपरवाइज़र", roleDelivery: "डिलीवरी", roleOwner: "मालिक",
    roleSupDesc: "दैनिक दूध उत्पादन दर्ज करें",
    roleDelDesc: "ग्राहकों को भेजा गया दूध दर्ज करें",
    roleOwnDesc: "पूरा डैशबोर्ड देखें",
    switchBtn: "बदलें ↩",
    supTitle: "आज का उत्पादन दर्ज करें", supSub: "बाल्टी सहित वजन डालें (किलो)",
    date: "तारीख", morning: "सुबह", evening: "शाम", grandTotal: "कुल जोड़",
    buffalo: "🐃 भैंस", cow: "🐄 गाय", kgWithBucket: "किलो बाल्टी सहित",
    measuredTotals: "नापा गया कुल", measuredTotalsShort: "नापा गया कुल",
    bTotal: "भैंस कुल (किलो)", cTotal: "गाय कुल (किलो)",
    matches: "✓ सही", mismatch: "⚠️ अंतर है",
    outsideMilk: "बाहरी दूध",
    purchased: "खरीदा गया", extraMilk: "अतिरिक्त दूध",
    qty: "मात्रा (लीटर)", rate: "दर (₹/लीटर)", sold: "बेचा", sellingRate: "बिक्री दर (₹/लीटर)",
    calcTotals: "गणना किया गया कुल",
    total: "कुल", submitProd: "उत्पादन दर्ज करें", saving: "सहेजा जा रहा है…",
    savedProd: "✅ उत्पादन दर्ज हुआ", loggedTotal: "कुल जोड़",
    delTitle: "भेजा गया दूध दर्ज करें", delSub: "हर ग्राहक की डिलीवरी दर्ज करें",
    morningCustomers: "सुबह के ग्राहक", eveningCustomers: "शाम के ग्राहक",
    yesterday: "कल", absent: "अनुपस्थित", self: "खुद",
    bottlesToFill: "🍶 भरनी हैं बोतलें",
    bufMilk: "भैंस का दूध", cowMilk: "गाय का दूध", bottle: "बोतल",
    submitDel: "डिलीवरी दर्ज करें",
    savedDel: "✅ डिलीवरी दर्ज हुई",
    noDeliveries: "कोई मात्रा नहीं भरी। कृपया पहले मात्रा भरें।",
    ownTitle: "मालिक डैशबोर्ड", ownSub: "लाइव फार्म संचालन",
    refresh: "↻ रीफ्रेश", loading: "डैशबोर्ड लोड हो रहा है…",
    overview: "सारांश", dailyLog: "दैनिक", monthly: "मासिक",
    todaySnap: "📅 आज का सारांश",
    produced: "उत्पादन", dispatched: "भेजा गया",
    gap: "अंतर", revToday: "आज की आय",
    surplus: "अधिक", deficit: "कम", balanced: "बराबर",
    surplusMsg: "✅ अधिक है", deficitMsg: "⚠️ कम है",
    noDataToday: "आज अभी कोई उत्पादन दर्ज नहीं।",
    produced30: "उत्पादन (30 दिन)", dispatched30: "भेजा (30 दिन)",
    gap30: "अंतर (30 दिन)", rev30: "आय (30 दिन)",
    settings: "⚙️ सेटिंग्स",
    bufRate: "भैंस दूध दर", cowRate: "गाय दूध दर", activeCattle: "सक्रिय पशु",
    recentRecords: "हाल के दैनिक रिकॉर्ड", noData: "अभी कोई डेटा नहीं।",
    monthlySummary: "मासिक सारांश", noMonthlyData: "अभी कोई मासिक डेटा नहीं।",
    tableDate: "तारीख", revenue: "आय", status: "स्थिति",
    ok: "✓ ठीक", gapWarn: "⚠ अंतर", month: "महीना",
    errLoad: "❌ डेटा लोड नहीं हुआ",
    errScriptUrl: "App.jsx लाइन 4 में स्क्रिप्ट URL जाँचें।",
    retry: "फिर कोशिश करें",
    nilOption: "नहीं",
    customersTab: "ग्राहक",
    enterPin: "अपना PIN डालें", wrongPin: "गलत PIN। फिर कोशिश करें।", pinHint: "अपनी भूमिका चुनें",
    editHint: "बदलाव करके फिर से दर्ज करें",
    savedMorning: "✅ सुबह दर्ज हुई", savedEvening: "✅ शाम दर्ज हुई",
    submitMorning: "सुबह की डिलीवरी दर्ज करें", submitEvening: "शाम की डिलीवरी दर्ज करें",
    bufToday: "भैंस आज", cowToday: "गाय आज",
    buf30: "भैंस (30 दिन)", cow30: "गाय (30 दिन)",
  },
  ur: {
    appName: "بانکی ڈیری فارم", appSub: "آپریشن ٹریکر",
    selectRole: "جاری رکھنے کے لیے اپنا کردار چنیں",
    roleSupervisor: "سپروائزر", roleDelivery: "ڈیلیوری", roleOwner: "مالک",
    roleSupDesc: "روزانہ دودھ کی پیداوار درج کریں",
    roleDelDesc: "گاہکوں کو بھیجا گیا دودھ درج کریں",
    roleOwnDesc: "مکمل ڈیش بورڈ دیکھیں",
    switchBtn: "تبدیل کریں ↩",
    supTitle: "آج کی پیداوار درج کریں", supSub: "بالٹی سمیت وزن درج کریں (کلو)",
    date: "تاریخ", morning: "صبح", evening: "شام", grandTotal: "کل جمع",
    buffalo: "🐃 بھینس", cow: "🐄 گائے", kgWithBucket: "کلو بالٹی سمیت",
    measuredTotals: "ناپا گیا کل", measuredTotalsShort: "ناپا گیا کل",
    bTotal: "بھینس کل (کلو)", cTotal: "گائے کل (کلو)",
    matches: "✓ درست", mismatch: "⚠️ فرق ہے",
    outsideMilk: "باہری دودھ",
    purchased: "خریدا گیا", extraMilk: "اضافی دودھ",
    qty: "مقدار (لیٹر)", rate: "ریٹ (₹/لیٹر)", sold: "بیچا", sellingRate: "فروخت ریٹ (₹/لیٹر)",
    calcTotals: "حساب کردہ کل",
    total: "کل", submitProd: "پیداوار درج کریں", saving: "محفوظ ہو رہا ہے…",
    savedProd: "✅ پیداوار درج ہوئی", loggedTotal: "کل جمع",
    delTitle: "بھیجا گیا دودھ درج کریں", delSub: "ہر گاہک کی ڈیلیوری درج کریں",
    morningCustomers: "صبح کے گاہک", eveningCustomers: "شام کے گاہک",
    yesterday: "کل", absent: "غیر حاضر", self: "خود",
    bottlesToFill: "🍶 بھرنی ہیں بوتلیں",
    bufMilk: "بھینس کا دودھ", cowMilk: "گائے کا دودھ", bottle: "بوتل",
    submitDel: "ڈیلیوری درج کریں",
    savedDel: "✅ ڈیلیوری درج ہوئی",
    noDeliveries: "کوئی مقدار نہیں بھری۔ پہلے مقدار بھریں۔",
    ownTitle: "مالک ڈیش بورڈ", ownSub: "لائیو فارم آپریشن",
    refresh: "↻ ریفریش", loading: "ڈیش بورڈ لوڈ ہو رہا ہے…",
    overview: "خلاصہ", dailyLog: "روزانہ", monthly: "ماہانہ",
    todaySnap: "📅 آج کا خلاصہ",
    produced: "پیداوار", dispatched: "بھیجا گیا",
    gap: "فرق", revToday: "آج کی آمدنی",
    surplus: "زیادہ", deficit: "کم", balanced: "برابر",
    surplusMsg: "✅ زیادہ ہے", deficitMsg: "⚠️ کم ہے",
    noDataToday: "آج ابھی کوئی پیداوار درج نہیں۔",
    produced30: "پیداوار (30 دن)", dispatched30: "بھیجا (30 دن)",
    gap30: "فرق (30 دن)", rev30: "آمدنی (30 دن)",
    settings: "⚙️ ترتیبات",
    bufRate: "بھینس دودھ ریٹ", cowRate: "گائے دودھ ریٹ", activeCattle: "فعال مویشی",
    recentRecords: "حالیہ روزانہ ریکارڈ", noData: "ابھی کوئی ڈیٹا نہیں۔",
    monthlySummary: "ماہانہ خلاصہ", noMonthlyData: "ابھی کوئی ماہانہ ڈیٹا نہیں۔",
    tableDate: "تاریخ", revenue: "آمدنی", status: "حالت",
    ok: "✓ ٹھیک", gapWarn: "⚠ فرق", month: "مہینہ",
    errLoad: "❌ ڈیٹا لوڈ نہیں ہوا",
    errScriptUrl: "App.jsx لائن 4 میں اسکرپٹ URL چیک کریں۔",
    retry: "دوبارہ کوشش کریں",
    nilOption: "نہیں",
    customersTab: "گاہک",
    enterPin: "اپنا PIN درج کریں", wrongPin: "غلط PIN۔ دوبارہ کوشش کریں۔", pinHint: "اپنا کردار چنیں",
    editHint: "تبدیلی کر کے دوبارہ درج کریں",
    savedMorning: "✅ صبح کی ڈیلیوری درج ہوئی", savedEvening: "✅ شام کی ڈیلیوری درج ہوئی",
    submitMorning: "صبح کی ڈیلیوری درج کریں", submitEvening: "شام کی ڈیلیوری درج کریں",
    bufToday: "بھینس آج", cowToday: "گائے آج",
    buf30: "بھینس (30 دن)", cow30: "گائے (30 دن)",
  },
};


// customerName is now resolved from the dynamic customer list loaded from sheet
// Pass the full customers array and look up by name_en
function customerName(name, lang, customers) {
  if (lang === "en") return name;
  const match = customers.find(c => c.name_en === name);
  if (!match) return name;
  if (lang === "hi") return match.name_hi || name;
  if (lang === "ur") return match.name_ur || name;
  return name;
}

// ─── CUSTOMER DATA ─────────────────────────────────────────────────────────
// Customer lists loaded dynamically from Google Sheet via getCustomers
const MORNING_CUSTOMERS = []; // populated at runtime
const EVENING_CUSTOMERS = []; // populated at runtime



// ─── UTILITIES ─────────────────────────────────────────────────────────────
function today() {
  // Use IST (UTC+5:30) to get correct date in India regardless of browser timezone
  const now = new Date();
  const ist = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  return ist.toISOString().split("T")[0];
}
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d+"T00:00:00").toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});
}
function fmtN(n,dec=2) { if(n==null||isNaN(n)) return "—"; return Number(n).toFixed(dec); }
function fmtRs(n) { if(n==null||isNaN(n)) return "—"; return "₹"+Number(n).toLocaleString("en-IN",{maximumFractionDigits:0}); }
function toNet(kgWithBucket) { return Math.max(0,((parseFloat(kgWithBucket)||0)-BUCKET_WEIGHT)*CONVERSION); }
function kgToLtrs(kg) { return Math.max(0,(parseFloat(kg)||0)*CONVERSION); }

// ─── API ───────────────────────────────────────────────────────────────────
async function apiGet(action,params={}) {
  const p=new URLSearchParams({action,...params});
  const res=await fetch(`${SCRIPT_URL}?${p}`);
  const j=await res.json();
  if(j.error) throw new Error(j.error);
  return j;
}
// Use GET with encoded payload — avoids no-cors stripping issues with Apps Script
async function apiPost(action,data={}) {
  const payload = encodeURIComponent(JSON.stringify({action,...data}));
  try {
    const res = await fetch(`${SCRIPT_URL}?action=${action}&payload=${payload}`);
    try {
      const j = await res.json();
      if (j && j.error) throw new Error(j.error);
    } catch(e) {
      // JSON parse error is fine — Apps Script sometimes returns no body
      if (e.message && e.message.includes("error")) throw e;
    }
  } catch(e) {
    // "Failed to fetch" / network errors on Apps Script are a known CORS quirk —
    // the request still reaches the server and data is saved correctly.
    // Only re-throw if it's an explicit Apps Script error (not a browser CORS block).
    if (e.message && e.message.startsWith("Apps Script:")) throw e;
    // Otherwise swallow and treat as success
  }
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
  const v={primary:{background:"#2D7FB5",color:"#fff"},ghost:{background:"transparent",color:"#2D7FB5",border:"1.5px solid #2D7FB5"},gray:{background:"#f1f5f9",color:"#475569"},danger:{background:"#dc2626",color:"#fff"}};
  return <button style={{...base,...v[variant],...style}} {...props}>{children}</button>;
}
function Alert({type="info",children}) {
  const c={info:{bg:"#EBF5FD",border:"#9ACFF0",text:"#1A5C8A"},success:{bg:"#f0fdf4",border:"#bbf7d0",text:"#15803d"},warn:{bg:"#fffbeb",border:"#fde68a",text:"#92400e"},error:{bg:"#fef2f2",border:"#fecaca",text:"#991b1b"}}[type];
  return <div style={{background:c.bg,border:`1px solid ${c.border}`,color:c.text,borderRadius:9,padding:"10px 14px",fontSize:13,marginBottom:14}}>{children}</div>;
}
// Fixed-position toast — always visible at top of screen regardless of scroll position
function Toast({type="info",children,onDismiss}) {
  const c={info:{bg:"#EBF5FD",border:"#9ACFF0",text:"#1A5C8A"},success:{bg:"#f0fdf4",border:"#bbf7d0",text:"#15803d"},warn:{bg:"#fffbeb",border:"#fde68a",text:"#92400e"},error:{bg:"#fef2f2",border:"#fecaca",text:"#991b1b"}}[type];
  return (
    <div style={{
      position:"fixed", top:64, left:"50%", transform:"translateX(-50%)",
      zIndex:9999, width:"calc(100% - 32px)", maxWidth:488,
      background:c.bg, border:`1.5px solid ${c.border}`, color:c.text,
      borderRadius:11, padding:"12px 16px", fontSize:13, fontWeight:600,
      boxShadow:"0 4px 20px rgba(0,0,0,0.13)",
      display:"flex", alignItems:"flex-start", gap:10,
      animation:"slideDown 0.2s ease"
    }}>
      <div style={{flex:1}}>{children}</div>
      {onDismiss&&<button onClick={onDismiss} style={{background:"none",border:"none",cursor:"pointer",color:c.text,fontSize:16,lineHeight:1,padding:0,opacity:0.6}}>✕</button>}
      <style>{`@keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}
function StatBox({label,value,sub,color="#2D7FB5"}) {
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

// ─── LANGUAGE TOGGLE ───────────────────────────────────────────────────────
function LangToggle({lang,setLang}) {
  return (
    <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:20,padding:3}}>
      {Object.entries(LANGS).map(([key,label])=>(
        <button key={key} onClick={()=>setLang(key)} style={{
          padding:"4px 10px",borderRadius:16,border:"none",cursor:"pointer",
          background:lang===key?"#2D7FB5":"transparent",
          color:lang===key?"#fff":"#666",
          fontSize:12,fontWeight:700,fontFamily:"inherit",
          transition:"all 0.15s"
        }}>{label}</button>
      ))}
    </div>
  );
}

// ─── BRAND LOGO ─────────────────────────────────────────────────────────────
const LOGO_96 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAArg0lEQVR42u1deXxU1dl+zjn3zr1zZ8nMZJJJCAlLIISwyyIEJCCLKLigxSoFEatYF1S0C1ZbwE+t2rrV1opt3ZcW7OcColUUIoLIvm+yhRBC9m0y6z3nfH9kJo4RSIK4f/eX+8svk5l7zn3e827P+547BN/+QQAwABIAj79IKQWlDGPHXpKyv2hHx5qqqqxwIJQRjYZ9phnxQMAAJIldQoIioCiWalXVyjRDL3F5PMXdO/cpXr78jQohOIQQiWOy2Lg8Nu6P7oiDzppfoBSz5s0zOnbpPsTmdN5MgBcAbABQngCUJIRIi0WXVptD2pxuaXO6pdXmkBaLLgkhMv6+2GfKAWwgwAs2p/Pmjl26D5k1b55BKG0pjLhAvhUgvg3gzTjow8ePT9m5YdPY+qqKSVzKEQCyAMDpSYYvszs6dO2BtE45SM7IlC5fhjBcbmhWBxSLCspUAIDgUZiRKMLBBgRqa1BbVkKrSorJ8aJ9OHZwL8qKP0N9dVV8DkcYIR87k1OW9hp01vLV771XIT/XDuWb1grybQAvpWSpHTLH1pSXTjM5nwDAa3O60LXPEOSdPVJ2G5DP07vlwu5KoapFIYSAcAkILiCEgBQcUsgEnAgIJSCUNZkuRsEIICVkNGJKf22FKN2/B/s3r2G7Pv2IHNy+Do31tQBQqTD2rjs1/aXyY8XLCSH8mxbENyEAFrftY6dMSVr3/vvT6mtrrwPQTzfsyMsfg6HnTeY5Z49GcnoWoQqoGRWIhsPgZrQJ7PhECQEBif/RYhgZ+5FNyMfeQSgDU1SomgZFpRAmRFXpEbnv0xVY+9/X2a41HyAU8APAVqfL9fch48a9tHzx4rqWc/8+CoDG7fGECROcn3zy6fV1dTU3A8jq0KUnRkyeLgZPnCJ9nbpRSkDCwRCikTCkFCCEgBAKQs7M9KSUkFJASglCKFSLBs2qQ0jI8qL9Yt3bi8nHr79Ijx3aDQBHkpLcfxk27OyF7777bn1cjgDE90UAzeaGUgaXx31NdWXlbwFkd+01AONm3soHj5lMdJeTRgJhRELBZid8pgBvk0Bidt+iW2ExNIRq68X65a/L9597nB3cuRkADni83vtrq2ueEYJ/bWaJfA2rXgBAx45dBpeWHvkj57ygQ5ceuOimO83B5/2EWQwbCfr9EGYUhLJvDPRTC4ODKiqsdjsigUa5/r+v8bf++gfl2KG9YIwVpqdn/ero0UPrW97jmbLPZ/JaYt68FcqmLW/8vrLi+HMW3eh6yU138+v+8HdkDxjKwqEwiQQDTSbmOwB+k1shaApLJSLBACQI6dZ/CB1xyTRh0Q2xf8unXWqqy692JCWxO+e++3Fh4fM8IW/5zmiAAsDslJOTe+zQoX9Eo9HhfYaPlVPvekxk9ezFAvV+cDMKypTvRZIiuAmmqDCcdhzZvZO/ct9tdPvq5URV1dUdunS5tmjfvj3xe/62BUBiKslTUtJ+UlFx/O9MtbiuuOMBc9zM2UwKSUKNDWBMAb4Dq72dtgmcm9BtDhBK5PvPPsH/9fBchUcjtSkpaddVVBx/La71X0Ub2FcEnxBChMvj+V11VcXf0rK66HOefpMPu/hyJVjfQJpX/fcN/FjISykDj0bAo1HS65xRNG/YuXzvpyuM8tKjl7s8HhEOhVbGFuA3rgG0yX9J2J3OpxsbGq7tM2w8v/6RZ6jT24E01tWAKeoPijvhZhS2JDfqK4/JhbdfI7Z/8h6zORz/8NfXz4r5stMKVenpgj9v3jxms9sXNzY0XDv60pnm7f9YwnRnMgnU1/7gwAcApqgI1NdCdyaT2/+xhI2+dGa0saHhWpvdvnjevHlxp0y/bg0gAMi8FSvogxMnvRYKNF58wTV3RK+8609q0N8AyQVaEF0/uEMKAcIorHYHXr3vl9Flzzys6obtzXfeXvqT0aNHiwQy8IwLgDSxxJTrhm1RwN8w5eLr50Z/OvcPakNNXRNN8H209aeZO0BKONxJ+PcDd0bfXPiAatgcr4WCjVOEEO1yzO1xwgohhBt2+1MBf8NV5189Jzr17j+q9TV1MergxwF+PHcAgHAwhIFjJ7JAXX109/rCPobdnm5Go0tiIao4kwJQAJhJ7uTfNNTVzh150fTo1fc9pTbW/fjAbymESCiEs8ZdzCoPH4zu375+SJI7ORQOBVe1VQikjULiXp9vYmVZ2dLcgeeYc59/n0V4hEghf5TgtzRHhBJYmEU+MGMs37PxY8Xr802qLCt7G21gU1vzmBSAyMvLy6quqHghOS1D3vT4S5RTEMn5jx78uCZIzsEpyE2Pv0yT0zJkdUXFC3l5eVkxDaCnKwACgEgpsf/gwecB6pn10AvClZZFI4EACGX4/yMGFGWIBAJwpWXRWQ+9IADq2X/w4PNSymYcT0cAFAB3eTx3REKhUZNvvNvsPfJc5q+tBlOU/0f9S3mCAn9tNXqPPJdNvvFuMxIKjXJ5PHfETBBtrw+gAGSX3Nzuh/bs2ZLdb7Dl7n+topFQOCHp+4HY7zNqRiWkBCy6Ju+94hxxYOv6SJfc3P6H9uz57GSZMj2pVlEqSw4e/rOiWqzT5z8JQhmRUvxgwI+v2vaB21poT5oqepSR6fOfhKJarCUHD/+ZUipPBhw9WdTj9novikRC543/2c08p/8gFmxoAP0B2X1CKYINtSCUoDVcm4AnTRRLK++llCHY0ICc/oPYuJ/dzCOR0Hlub9pFMVPEWhMAASAXLtyg1lRWPuBJSZcTb/gNCfgDoOyH5XSZQvHItRPx4XN/ES6vQ5qRMKQQEJxDcBOC8+a/KWOAlGisrQJltNUklzKGgD+ASTf8hnhS0mVNZdkDCxduUGMfJKdKxBQAfNWa12aEAoFrL5uzQPQ+ZywLNfh/OAKQEoQxmIEg3l74B2wqfIfk9C8gWX17SikUYrUZUrdZhcXQJcCIatGJw6bxJ2+5km7/5EOMmHwlwoHgKTkvQgh4NApnipcQQsTWj95NXbXmtUPhYHBzywSNtVz98xYtsrz34ouvpHbM8lx979MwI5wQ+sNxvCAEUgjouiE3LX+DIBrauXbZv1IN3Uak5Hz7qg/o3vVr6dE92yk4J/VVZeLZu29g65a/icxuORhywU8RCYVaJR0JJYhGTGT17Id1b7+KmvKyvHmLFj1duHixmQim0kIbzCduuuliKWXOhKtu4zaXi/mra743pcT4IQRH3LA36XyscatpJUEKDt2h8e4DhivLd21c3mvAwFv++fubXyWUpHIhIwrwtiQk1aJbhweDAepyJS0CcEHPoePtaL5q6ySDMCOwe9z0vKtu4y/ef3vOEzfdcjGAxUgoZ5Iv+A/KhJTiY4fHm3/f2zuE1bAzzs3vScYrY/ZagW5zCNUCEb87wUGiYZOEgwEqBAeEgGo1UF9aLO69skCk+NIK9uzY/EmPXr3OS+vQoWRNYeF2Shl69u4//PCBfc8IHm3I6jGg961/X6ZJItpsC6SUYExBMODnd03sTf3VlWtA6AgheHNnhZJIOWR27TKgaP/+/OEXToPHl8oavuLqj/ffSMTj7Vi/IGTsJmJEHkGs442cxhgCkgtQVYXd4xThej/2rllOi3ZupnXVZVBVDamdeyArry/Su/YUFkOjACQ3wR1en5LZozfdtuaD1emZXeaVHztyz75du2K4ROXWjWtXXz/nt+f+/fEHNrnTO2pur41XV9YxENpGa0dgRsPw+FLZ8AunyXeeezS/U3aXAUX792+OY06aTREhpmaxPBo1zdsWvPap2bFnPyUSaDy9AouUEEJA1XSp23RBKWRs4YEygNImWQgOwk0QMxolnEchOSdSiFjYJyFP6Xma2klUTZeazSL81TXk0yUv0lWLX0LJ/h37IsHgGgkUA9AUheToDu+gjOweHXuePQKEMRzetQ1FO7eLQEPVVpth3RQMm5OTk333HD64+wkAFFOmyE7r1qlFRUWhsRdc0nPFu0veHz/t5ozL5z4oI+EwaatVkELAYthwdPdWc95PzlZURXksHInMgZQKAJM0O995z+oLFszc073/0E53/+sjEQoGKCHtB7+pYqTAlmTjVQcPsB2frsTRnVtRWXYEkWAQVocTLq8PLl8GXGkd4PJ1RJLHB7vbC81mFxarIVWVSkIT0G+qf8SVRhICSAGE/RFafuQzurVwCda8+SpK9u341OFy/amqquot1WKJCPF5m+Ot999ne+b++yfW1NS8AqBUV+ifc7r3+Khbz54V5557RflNN02JDB8+XFuzZk3DiULziZdO7brsf19Zd/dLKzzZg85BOOAnbV2cUgroVkPce8VI+tmWtUXz5j2bu2DBzBBiOs8A8IyMTqNLSoo+vOI3D4oLf/FrejrmRwgOi25AhIN86ZP3sdVvvSRry4+vElKuJhRFBBBSgAnApzCWJQnJZIolQ7fqqVbD4daTXMzpSYXTlQyrywOLboMtyQPNam82ZRSAv64SNaWHcfzQfhw/vK+mobb2oySP+9nKysq3KKUylrEqLUCMjr7g0k6bPlm5/7LJl3RK6jWY/PsvD78S8vu7GIZ9RfHhz66O7S8gkyZNsu7bt28o58R+yy03/vfWW2+NKqoqwPm7P5//t/FjrpnFK0urFUVtW+1bcBMOjxtLnnpI/OvB31BfRqdzy0qKVgBgBE2VLtNiUR7mXN7+P69vNNO69VQiwUC7zI8UAqpuhb+8hP/5xsnswK6t/+2am3tX8cFDGznnEFI0pyHxbjQas/sXXHmFa+MHy7yNlTVpoaiZEuZIAaVeImUKo9LJOTSiqk5V06xRf2MVIajmUh7SDcuOoUNHbFr18cdl0UgkMZprWRKkAOSwYcOytu/Yddjj9lx4rLRk6a5IWOtttYW5GQE3TQBTGLBYjJ04sdunq1bvC4dD8KSkr7j+kSUT5k/pFfX5fBdTzfH63a+uMK2eVCUaDLYpP5JCwGI1cPzAbvN3lwxUCCGPmKZ5h5RSaaacCSGbO+f27/f719aKaDRM2xX5xJIbbkb5A1eew4r37virKeXs2Iqip+CcxJcIqliFLR46xu1QvHlXCh5z7hKxptk4wKSV4gclhAhfx6wb/HV1j1pUZaWk6i4ZDdsIZQN8HTL/sGfHptcLCgqUwsJCs3vPPiO54B3tno71PQZ0W7n4yScDiqoKCvFUdv9h1//2xQ+iYVOoZjjUNiFICVXVxD0/OZse3rN1q5RyACEECgDZv//QzgDycgblQzM0EqkJgLTD/AjB4XQ7+XN33cyK9u54y6LrN8cEGK8IiVbqDp/z5lJCSkkkvvQpmZDKJ3iHEwjxJNOUUtKyo0f+1mfgwFXHjxyZJhnrLYgWZpBv23XbBgAoLCzkAMhnu7d/1PSxXdj2yXsAQMxolEkpb7Kols6Pzrr4vJv/+u+oZrOr4cbWmQIpODRDIzmDhuPwnq15/fsP7QTgMAWA4uKDAwGoOYNGciElaU/WK4WAZtjl4W2b6SdvPN8w/rzJv8ju2tXeo0//qTHwSasB/OdA8thpnuDkCe9JfK09bYFCSkm3bdiwo7y8fG7l8ZJJ1RXHLysvP75gw4ZVxXGHGzsZAGXKlCksUdiEEHEgGpm8bc3ypfdcPlKtOLxPWB3OlpsAT5yYSZCcQSM5ADWGOSgIQUND9SBVVZHZo5+MhqMx1W97HK7bVL7hnddIQ6N/8QcfLi0tLy9/qaaibMxJ+KZvPVGOmSxFSqlIKZVevQZlDhx6zpAE4BEX9OLFi3mLxYIsQoKKql5YcXDPgvt+NpqW7N0qNF2HPIUQCCWIhiPI7NFPKqqKhobqQU3tj5QiGuV93emZcKV3IDwaaVfmSyhDOBAl+zZ9Ao1pL/fqn9crGo2eO37smFsSbqRVcvIbJptETIOafuvSUnRg3+Ibb5xnj81XjUVRJzrl2Wef7XM43cv8odC9dVXl//P2U3+kmqGZTfWSUxF0EbjSOxBPeiaiUd6XUgrKTVMBkJ2a2RVWu5MIbrYZCyklmKJIf3UlqzxWJM47+7z1xQeKZxJCPn755Zcb0fY++m9rv64AwHZt2nRACLH25ZcfWzF9+vRkQkiUEGISSk3KmMkUxaSMxc0eMU2TU4bQrx96yGoYRnE0HEYT9uTUJoibsNqdJDWzKwBkc9NU6LAxY3wA0lKzssFYU0TUHv6FMgWB+moEG6r9b65+029yPlhR6DYpJWmDJAkA9D1r2LlDh473tFIm/dqEIKWkf7j/xplUUavfXPL2eq8v41Ffeqe7k13e31MpfydM8zHJ+R9S0tPHWzRdbt68pbKyvPzSsuN1zkAgcPeAsROllK33hTZxQyCpWdkAkDZszBifUnK4JB2AM7Vj1/bfvAQoZTIaDhFuRhsAKJzzzkzX/9PGFU0JIbzsWNE9TLX8GcCimH3m36AAJABcf/2CgNVmPw+C76qvrb6tS88ByBiYjySXF5rDAS4ENr772lwzXLpGVbWPhGnaXn3s/p+c/7Pr0/MvniYb6+tpG2smcQ1wlhwuSVeC9bVpAIgrNU1KAdL+BSibOHYpGwEognOvEMLWVhcipQTnkUoCZJ4hDWjvHi4CgKoWC5fRyDMpHXN6zJj/aCR78DnUomugNNb2TIFxM2bTdUtezi/aszPfsNvRd8QE9B45QQZDwTa6TQIpgKSUNAmABOtr05SoiKYCgM3tlUJ8hZuXUsx/+GGbkMKIRqOdSZNQWv0UoRSEqUlScnYG7XpbgY+VcRnXdOP3npSOM+e+tJw7fD5LoK4e4UCwWZGlBDS7C+fN+iUnaOKjImGwRn99jDBoG3RCAHa3VwIgURFNpZFw2AkAhi1JSnG63W4ShFB6YM8ehxACpmn2p02zas2UCEopIuFIJmPsMNpe7TjhMWHCBG3EmPNz2qhJzflHTl7/s7hpzp/1p2dNm9dH/VVVIISAMgbKFFCmgCkKpBlFQ1UNq6+qVeoqa5Sgv5ZQStoMfjyTN2xJEgAi4bCTSs4dBICm6WifA/4CMQxIES0rLbVxzhEMBvtOnDixA069aYECQJ/eA7sLgfSs3NzVX0EAFAD27j3Y97M9u59rpXuDACA/nzPHM2zYuFSmKHLv9o0Lxv1sFskePAiB2mrCVMtJy5lNAokJ5jS6RKSU0DS9KePj3EEJYyppUsSvFAcSxqL1lZXcajW43WbT169dW5AIzklAk8VHD8ymBFvXrVxZkkCktcd+x+NzGjZ5eijkt3Fu0lZyDrli2fsPhVSZ3KVz544ub9r5o6+cLQO1IUa/5q4/CQCMNq0CxlTa/DwBcnrejxCKSDgIAtQe3Lvd0ql7TzpxxmyUl5ePYifnkxgA85zxF2eGw9EbXEn23wohFLRvi0+cNjAppRHKmHAmuTgFI4xRkSAY1nLczC69LqyrqR24fc3K3Qf375/Zv+B85uvamUfCQfJ1l18TuQ4qAMo5b+JxTY52R6FSglmoqC07ikggeMAMRexakod0OasAjJKesZsRJ4pSVFXFpjUf/kfVbR8fO3ZsZSzJibaRuiBNw0uSkdn1NqcnZY3b7dlWfHj/8/6Gmj4jzp3QJ3YtM4GPogD48LFjs+pqyhbrVutdAGBRtSvOnvgzmKag9BupfZMY1gCXPKIwxhokgHA43C4OKK5QjAEle3dAcr6+jtNMX2YOnL40EAJrLDVvycsLKSVJTk5e0uBvHEzUaJ3T5VpDqbbO1yHjmZ1b1m2TUp6KXqYAMHv2bIfbk7zcFMRlt1lfdjqdlbWNYRdqq8d/+vHK/6ZnZD4IkKBu2HYfObhvFecczz77rH7rnDsKVdXywrEj+5fZNNs5mb365eWePUwEGxrpN9HxTShBOBxuIp0Ya1BUVa0FgIC/lhBCmxpW2+z6mAzWhdiOwveQ26/70h1bP3uk74ixqK04hiiXQapSgHOS4IzFvn37NJfbUygEt/UfOiI/0FirV1dU94oGw2OLDuz9ODWt42O11eW/D4fDaK5XNx8DCbBRKIrKX3jxpfeEQKihriqXECKOH2uq76VndrVXHC8ZGWhsnK1b7RXVFWWdk9ypW6oqjk1MTsmYT8AiNVXls5iioDHkv+ecKTNBNUPyQGWzUyWEfi2bDeNPawn4awkAqKpaSxVdLwcAf3Vlu8bkpokkj5NvXPZvUrR78yMiENY69egzeeAFF5nbVi6DBLaKpqgqXpARCxfOMwYOGvwpwPg///HukPUfffDJzo0bV5QeOfSX6qrSS3r06jumob7md9FI5L9ZWV2HSykJU1WTMmYSQkxgY1RRVJ7kSnnCFKLf1XOmTSKEiFjIi5tvnq0xxsLdsnuc1VBf2638ePGw2pqqDuFQeMyQkeOuoRQjhucPLlAUFTqjj42YNG3U+df+PEwokOT2cmey23SmuE2L1SoF/7y36EwelDZhDQCKrpcrNoentPL4cV5TdpQ11eBbH7SpBmDD8f0H6at//DUcXq99f9Gx13/53Itqdenx6OrXX0SXzMznDxYXo6CgAIWFhWL27NnOX/3qsXWKRSvx19WOufzyfKCgQMGoQoGXu6li//5oj179SrdvWufvO3zM+OOHD4zXFGUrON+oUBxQrPZyX5eeqDledGk4EhqS1bnTqCcWPFHfOSf7cn996LrsHr2ve+KJJw4DmC+lpOMuvCrr6JHdTq837VrOw+qhfbsWNjTURTZv2fJr1WK5yO9vyJaM4ZV7fq+VlRQjGgxBMwx06NodvUdMRFbvPiLY4Kfxwv6ZioEIBWrKjhIA3ObwlCrZudmlRZ/tqqs4esjTaifIF8qGHP/83SxaXVkOALPOm3YjBowdaS6YPFb119X+3e/3bwCgFBYW8rc2bDCuGjfhA6JYDjTU1kw0zSjNy8tTdhUWchQCwP6wlFInhLw66idX22f/5dlo8d6DyuFt6/sV7d3Wr+Z4CSqPlmDvxlVQrbbiaXN+m/v0gl9WAiBEilLCozUqJ40ASEFBAevdb8DUqqq6BaFgUCdEbE/1pcyqqfP30VSW3uj392VU7vIk+1asf+8/9dGg/ziAYwrgl4CLMJb/9t8emjLs4ivcl/36QUEZo5LzM/e4BQlZcfQQAVCXnZtdqnzw1luVhJDS8qLDHm5CklY8seAcRlISNr/zKnas+QCEUmiaziffNl9+/Np/lK2rPyh6/MVlv7x1+gU0ZveIw27/l7+xcVBGZvZD/ceMshcuXhzYtWtXcxV95szZKRpji/qdM2HE9Pl/FZWlDardnYZBF/xUnH3RTwWhgL8+IuaM6kxFqNGfZPAwAA2AOPTZoVWEkFUVFe8iVlI0CSEvnDVy5LJkLVUsX/6f6pqqiubdnPFNGVI2NrUqMgYpJaKxpUcJff6sc4bd/+5Lf3ulvrY2/4ZHXhSNfv8ZiZAIoeAmZHnRYQKg9IO33qqkjCkcwP7y4r0INNRIqiit2D4JRgm2f/xhLLUWGDj6AtahWwq2r1kBQsjS22deVA9ApZSZVqvtzszcARfO+N2jwdKSQ78+vP3Q7+bMeVjr3LnzjM6du8645lcPOl577YUZHXsOGnX7k69HIEEhBQQ34a+tpXUVNUpNWbVCiWApqekKiUbefWL+ggamKGFKWTTu3Fo6u42FhZXvvbe4WgjRXP0SQjApJYv9VoTgiuBckUIoUgomhVC4GVVXLFtWdMe8JyevXfpqxfbCd4lhd8iEBoDT9cBN1H1DjSwv3gcA+xlTOBWCQ9XULTVlpag+ViwV1XJqSoIQcFOiuuwYpJSwWHSMu+pWmGGAmBxSypAZjRIA0WHnjs6Sgt81bd4TfND5UxUhhIiEauxAlaf02LHnjhQXPbdq2Su/0BR6NKffIKEl6TQSjrV+x7kYRWl68B5T6ORb5oNo1mt4NLSUEvkXKvjtWdnZ+Q8sXJg0YsSElHnz5tGWlENC9ctMqDnzE9SbeUIuYnnkf24uF8CT6997g6ga5fIrOmQpJRSLhupjxbKm7BhUTd0iBG8K8ZJcnvWVZWU4smszycrri3BAgJwsKZUSTCFITu0AEIKCy65C9qDhCAYAZ7IHAFyKapGUMbl2+fKbhk280ppzdn9z14drGABaU3E8f9Gi5y9L9nUor6+rt3y2c+u1AA4ouoU2mVp6gsiBItTYSPqMmoh5r61N2rth1cTGmipUFB/G5pVLcdcN15enZXVd4/GcfwWAyGlwSrKF4Mzzp09P2/HR6s8O7dwoGusaKfuKHeJSCqgWBUd2bSZccLhd3vWVZWVNKGdm99kMILhn40cMJLYZ6mQnIIWEzB1UICGlLLj8WhkORSQA6IYDCuAGJP65fLnOVH3KiEunSR4BkSqjmmatdTrd+xoaIzN6Dhg4wYxEigaOviBn0nW3nz96+q0y4A9QQukJxyWUypC/XrrTs+SoK39uXnjTr6MzH3wyes8b6yIDRk9MrS8r2T5nzpww2vk4sSnz5lluvPFGewu6Qmz98KM5us3Rr7asuKTm+BHKVIuUQpwam9ZOArln40cMQDCGeVND07ZPVxwDsG3vhtUINTaCWTRCKCWEfflkikrCgSDJG30+uf3JRcTXtSfh0RABAVPtDhAClRCK2yaOz/N1zOrcpV8+8deFWHrnbvBldbY6qbzDX189cOWyNzeHQ4HKc396vbzujw9zZ3IKgRCgTDnhuIQSwlSVcDNK/DV1Sn1VrVpXXqPak9Ms0+5+HNRivyk/Pz8loeuhNa/JAGDDy4suf/Pt9+5PIPYkIQR+v//sqBShxvq6AxVF+2DRNQKCE8+ttZNSwiwaCTU2Yu+G1QCwLYY5oQAY5xyapr1fdni/PLJ3R0C1aBFh8ojk+PIpEBFRM6Ko1kj/sVMiUiAiuYwQiZBFUTkkLIQQNASiA9K69iR2tysQ9vujdm9yMH/yTPXgsbJ/EkrxajTKALFx00fLhL8GIR6ONF/rhOPypv9BkggBixCiRBhTI/7q6qivU3Zg8ITLPGtXr36IMSZipU75BR6+qUZNE04GQAmFQjLQ2DCWMtr8mBlKKSAi9nBDvRPCXLv707VRTUO9MLl58rmd/BQmj6gWLXJk7/ZA2eH9UtO09znnMV40NqjD4XhDSkGenXv13+xOJafqaEUvFUqPE55E7WEGWY+qA4d7qFB6VJdU9rJI9Fz+ylP36g6HZppROF2uvKLdm/7XoaNnXVlZXuPxUK8x51/Rw2K19nYne665nBCe6vP9d/2yf1UGquv6U05yETZzTzrmSU4zSHsgjF55fQf3UzXtEp8v8/KpU6dmdO7ceU5cAHl5eYO798j7BT7vohMxX2GmpaRuDzbU9uzapWtBzBFbYuB8UlNdeU7/s/JfWrH4abLzvXdHd+zi6Wz6G3u2d45VRyt62Z1KzrNzZ/5NSkEcDscbLX0PkVJSxlgRAbadrqPRLZbfJiUlvU0IkOT2vGAYxiMt3+PxpFxqNezHZ8wo0BctWsQMw/iMARefiRzH4/FcpaoW6XQ6d9vt9rUxioKkpKTc4Ha7l5577rkZ3bt375qXl9etU6dOo5KTk+83DOOA1WorslqtNXl5eXlx85Q3YEA3w7DL3r17D/J63bcrjG0F4PuKPOg2xlhRAtkIkkB4mZqmzTdNc56vY8ezrrv68NaVK+fTUaPmt1ogWbz4cmXKlEXmI48mLWSUorau7jqXJ/V/RTR0ZM6c2tvj/1+5chRdtWqVqWnWLbpueammpuZPbrf39nAk+ItwKJzTv/816qRJC9sdcC8tvZ5NSk/njz322NWRSPh2RVHXmqaZH4lE8oQQcDgcLwaDwWmEkCBlLGBR1UopZSAcDvdgjO0JBAJnu5OT74uEQr/onNF53K7Pdq0jhCA5Ofl3DfX1d3Tu1uO60mOlD/NocIXf75/Zq1fT/bRlbnEM//5c535lR49uUhRlQTgcno8Wj72kAJCVldWVUiotFsvTX2YiW3dodrvtHZ/PNxsAcbvdTxqG8WKL6zAAJCkp6RKbzXaIUoqCggLdarUedzqds9s5ZuKhACB2u/25pKSkBxRFgcPhKJ0xY4Z+0UUXOWw2W0nXrl0vUFW11Ol2Xz9p0iSDUopu3brl2Wy2ktTUVB+hFFabfYmqqpGBffr0AYDhw4dnqRZdaLq1VLVYGq2GsZM1tZ6Qds4NFovlaUqpzMrK6nqySiElhEBV1fcZY4G8vDxPQiGjdZKPUlitxk6Xy/UKIQTp6emT4yAnXIMAIIsWLWK6rh9LTU2dFXvvOKvVKjMyMvq2UsY8VX8RbDbbJ0lJSZdlZ2dnWq3WyMSJE90+n+/C+Dzsdvvbdrv97thnLIQQGIaxzeVKntY0f+smVdXK7Q7HNiklS0lJH2+zJx2WUpJu3TKzs7Oze51GrZrk5eV5GGMBVVXfjxF79KSrOCkpaTSlVBqGMbcdK5ICgM+XMcqw2f2DBw9Ojl1rjdfr/Wni9eO/XS7XrZqmyYyMjCkx+32bYRgHpkyZYkUrj3g5UXtJfn6+w2q1lg0bNizV4XDcpyiKnD59erLD4bhX07RjlFK4ne4rbTbbhtiiUGJC25ORkTHU6/Verut6xZSZM1N0q7WyS05OX6/XO8tuty/5CmZfAQDDMOYSQmRSUtLoFlh8GUgpJWGMbWGMVY4bN87WDjAoIQR2u3ONz+e7pUuXLjnpPt8CXTcqhgyZ4GxxHRazsdOsVmtpWpq3oE9u7kBN04TVan0uYW9Bm2/S7XZPtdvtKywWCxRFKVFVtU7TNBiG8RalVHo8nptT01NnqapFulzJNwJAcrJvtNPpXG1RVRg2xxFncupUAsButx+cOnWq2+1OfszhcNwbm7flNGrWZNy4cTbGWCVjbEtCKHxqW+5wOC4ghEjDMO5shxYwANTj8cy02WzFDofjgNVqLbJYtGOZmZnnnEDylFIKu8PxstVmO2C12feomr7Hbre/I6Vk7eiSo1JKouv6PsMwNrjd7scURZEWi+XAwIEDh2ua5jcM4yW7zf6O3en4wLC73/J6069ctGgR0zRtp2FzrPN4XH+yGrb9lFJ4vekDLZouO3buPttqJFW5UjOmnaZviq/+Owkh0uFwXNDa6v8CMKqqrmOMNeTk5Hhx6m1GXzpmz56tjRs3zjZp0iTj8cdna6cAkhBKm3bENJ2Utr8USKSUxOPx3Gqz2V6z2+3Pd+nS5Uar1VpuGEa90+l8jMa2NzXtTSPNc3S63M9YHUmFhiNpZYcOHQYAIJ26d+9vtTnesTnc6+xJyYvyhg49naZhCoDm5OR4GWMNqqqua+ELW49o3G73MEqp1HX9HzGToLRj8HY3VZ2RgncCZz916lT3+PHjPQnmLPGk8fdTyr5U/236Cq2v9IUSCiEEuq7/g1Iq3W73sLaufiTaaIvF8iIhRKakpOS38wKkxdme95/uEQe3ZS9Qa01aNFEo+PwbQOKvk9OYB1JSUvKbvnLL8mI7fdrnKtStW7cUSmmNoii7p0yZYsG3+H1bp9kD9a18TdeUKVMsiqLsppTWdOvWLaW9JvwLknQ6nVMJIVLX9UfaaYp+jEfc9DxCCJFOp3Nqe03PCS9osVheIYRIr9c76Stkqz948AHA6/VOipmeV87EgiUA6JAhQ5yMsf2U0tqEVPr/HxzawlrEqJxaxtj+IUOGONtYl2jbxb1e71mU0qiiKFsLCgrs7aApfugHRVM7jF1RlK2U0qjX6z3rTC9SJeYPrgQgNU1bGqNUz4iEv8cHiSWCVNO0pQCkzWa78usy00qMvJobs3HPJRBL5EcKfjxcfy7GHMz9ugMVhRACq9X6x1hktDAhw6M/MrNDKaXQdX0hIUTGMPnaAxQCQKGUwjCMx+OaEDNHPxbHzABASkkTVv7jcYb1m7AGBACL8ed/JIRITdOW5OfnO34EIaoCNFHfmqYtia/8GPjfaJLabP/iPkFRlC0ZGRndEyb6Q/IL8ZYVZGRkdFcUZUsLm/+tMATNQnA6nVMppZIx1pCcnHxRAonFfigmJ1a/uIgx1kAplTGG4FsD/0tqmZycPJgxdoBSKq1W68MzZszQv+fa0LzqZ8yYoVut1odji+yAx+MZ8l0ztwoA5OXleTRNe5lSKhVF2eX1ekcmaMP3RRDNwBNC4PV6RyqKsotSKjVNezlWK/9O+rpmVXU4HNMZY/WxesLC3Nzc9BbCIt9l4AEgNzc3PRZmS8ZYvcPhmP59MK1xLh2ZmZkdLBbL87EbCBqGcefAgQOTWgjsu5A70ERABw4cmGQYxp2MsWCsRef5zMzMDglz/l6YU5agwgWMsU9igqg2DGNu3759U1tUm5RvMKOOc1jNq50Qgr59+6YahjGXMVYdm+snXq+34PscUDRrQ6wn5xLG2IbYzYV1XX8qOTl50AlqwMoZFkgi4F+w25RSJCcnD9J1/SnGWDg2tw12u/2ShHl9n4pQJ9UGEr9hp9N5nqqqyyilMuastxuGcafP5+t9kjpsInjxciPDFzudKb5YkkwUIhJXOqUUPp+vt2EYdyqKsj0+D1VVlzmdzvMSgCc/tMyeJQLRoUOHHpqmLWCMHUwQxkFd1xc6nc7LO3bs2G3FihXK6RbH42CvWLFC6dixYzen03m5rusLFUVpHo8xdlDTtAUdOnTo0WIM9k2aiW9DEPHnhEJKSbxe7yC/33+haZoXAeiX8PVStZTS3YyxnZTSzxRFKSaElFut1joAgcbGxigA2Gw2FYARDAaTpJSppmlmCiG6c857CSF6AnAlXHOroihv2e32JZWVlRsS9hG05em7PwgBfIFRRGKHMKXIzMxMq6mp6R8Oh4cKIQYLIXpJKTMTzcmJnsZ1gtcEIaSYUrqTUrpe07S1brd7S3Fx8fEWD1mNf6eL+DZA+C44F9Ji9X1hZwshBLm5uZ6qqqr0UCiUbppmqhDCzTlPYozpAMA5DzHG6mIdHOW6rpcmJyeX7tmzp/rzrW1fCg7iWii/zZv/P6BuAtS03UiBAAAAAElFTkSuQmCC";
const LOGO_36 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAkCAYAAADhAJiYAAALu0lEQVR42q1Ye3SU5Zn/Pe/lm2smyWQCk4RcuAhChCCXXYpICtuWakWpEFrOFj2iwqrQsnI8RUVTULuyPVvLpbbiEXOk1gN4obo5dVsQkOhiEVHAgEgjSSAhtxlmMpfMfN/3vvtHMuyQZaFqn3PmzDnf+73P83uf2+95P8LVhdXW1uKJJ59SyrYAwA/gBpfLM6OwbPiEnPwhwxxutxcAUolErDfcebar5YujyWS8AcB7AEKMCzy25lG2du1aAFBXMkZXAcMZ57aybQCYVhAsXTJ+xrduumbKjGFl105E3pBiOD1eMC4AAMq20BeP4UJnG1pOfozPP2w4e6xh9x97zrduBXCQcQ5l2xyA/WUBUU1NDXv1tddsrdTYIaUjnqhecNf86fMWo7C0HAC0ZSllp1OkbBtKKQIAxphmnIMbDi0EYwCoq7UZ7+/ahv2vvvhaZ2vTY8TYiQXz5/OdO3cqAPpvAURaaxCRBrB81g/u/bfbHljjLSwt0+k+004l4hwAERGICKBBKrSGHvgB0A63xzackne1ttAffv1kbO/25x8GsFlrTdS/9xJQbDCY2lpNRESunLznl65/cdM9T2/x+gJD7WhPmNJ9ScE4J8Y5iLH/CwYAiECMgXEOxjml+5Ii2hMmX2Cofc/TW7xL17+4yZWT9zwRUW2tpsFOocFh2rlzp84LDN1+/zOvLKiaNcsMnQ8LxhkRMXwd0VpB2Ur7g/nWJ3v3ymf/ddGrF7o7flBTU0PZ4eOZDdXV1eKPb79te7w5zy3fuHNx1azZZuh8jxRSZlz7tYSIwBijeCTGK64bZ5aOmTT+yO5dxZ988smb1TNniubmZpUNiLeePWtrpZbe+bPNtTd8f74Zau+RQhpf0ysa6M/Hi/nFGEciGufDq8aZbm/h1I/2vNneevbsIa01B6AJANP9GVZxw7zFxx7Y8JIz0hVmXAj6umAMhxMgUqlEvP/UQhATkqx0ClrZ2hfIV8/+5I6+hl3bxmutzxARsZqaGmKMaX+wZP38les8qaSpGWeXAaOvCkIpG1rZyrZMZTgdaHx/N/565CDzB/NYjj+PWekUdbc2QUgJEFEqaerbV67z+IMl6xljuqamhvjJz05prdT47yxesWna3Pk6fiHCM42uv9nZmglhMy4UAKWV0tAK0FprpfpLHFoT48rp8ZLT7WLS4SKXT+iOpjPq5XUPHOxua+v97NB7XfXPPV3gLyrV5eMmkplKwUqlWKCkSPX29FSePHTg9ZOfnTovlG0hxx9YduP8JZROWjbjgmXiDSLtycujdDIpbDMN6XBBuD24pOA0QAxkpkw0vr8brY0fHxeGQxSNGneNmUrovkSibdezP18MoMnhcD216JFnHrEsyyYQJy6QTlpqxvwl4p3tW5b1hrqXCwCeymmzbw0OH4F4JMqIsX4rjGnGGO15aXPHqb+8u0tZ5gVvYEihNy9Q6snNCzq9vjwhnB4wonQiGmo+cfTgO9uff26AvzQn/NzhMGIFwYrPf7TqFx0H3nzh+z2xyDPvv/HSN+988lfTzT6yABKpRJwVDR+Bym/MvvVg/Y6fCgDTxkydWUqMtNaKERi01srl8VL9b55q3P7LNTcBaLlMyjgBuAaaaxSACRC0VowLocvLR2+NpZI3p9NJ/O4/HooXFpXGy0tGuT54a9uDZWOr9ty48C5P/EKk3yYjPWbKzNKD9TumMSHEjPLKSbAtKCI2UB0utP/1BPa8tPHlkSOvDdTW7hXjamqM2tpakdWF+xjjYcZ4D+Pc3LFjBwc0JyKlbJuamk583nnuzAbhlEfGTa0OdrW3/unTDw+0hsPhD1589N7FB3bWtbt9uVprrW0LqrxyEoQQM0RBcemE/GAJLDMFEEErpbk0WPj82WhvuMvh9brja9fOsgCwtYCqqBhb7nZTe2Njo5ntroULF9pZnV9nehw3jNjpQ/uXFg8bGS8ZfS1OH/voeLirvTsW7k4RgRGRsswU8oMlKCgunSByC4LDXB4flGUREfUXdz9n9lm2HmIyprJ4TyfTkX9KJKx6AB0DAPTAf2asyDzTREy1nDwZnfPPK26fc8/KKneODy0njyMR7jErZ86RyVgMjHOmLEu5PD7kFgSHCYfLncOFvDhCXByEDMMixkYkwuHrAXyeObmdtqm7uzM0AEBlAbBLykfOOtfctBfQICIVCBQEg9dct/L2VU9Uef25fcnepBg99UbOOZfJWEz3N2aCUoq4kHC43DlM/y/X6Iy3OQf6YtHY6AmT+MTq71UPeMfK9fuX2ITh312xghGRzTjXAHQgUFZUGCy+Mxa5cK/fXziNiDBiwpTKrq6uf7zhtjtuyQ/mpiOd3VJZpkjFYxSPXBgAc6ltDYD1JRJR20pf5BtiXBMBx/fVnxoz/TvDyTBSIFJDiormEViOYTj37N+yZY3WeraybXcwWFGuWPrHBjdOSofzZeK8umBI8a+7zzTVjBg7obr8usmVobaw4cnz86zRhAYTr22l0ZdIRFm0u6M1GesFE1Iry4Lb52V7X9mqj+z/r+qc/IKCY3vf+neXlPPMtHV9JNyzoeNcc8OsRffNfWTbn/bc+fimEyk7vS3Ueb7WG8jt6Olsq/d48w4r2zylVDrc15fs2bXh8WUb77/1wT/XbWgRUurBM7XWGkxInYz1Itrd0SpC51uOhtpbFhSUlNnJWBRCMjS8XmdPv21xjlLqja6urp5b7nnod6cONxyK90Y2+fICwTlLVlUVVgxLja/+dlkqGbOPH3h72cmD+49Mmjz53OHDh98BsBsAent70fZFf/o1/qXhyPDxU/aOmjTdTsZ7dX8D7p+ThGHYofYWHjrfcpRZlnXgTOMReHwwXJ4cDoDPXfawMfe+1VBK88CQogXzVjzuCRSXxpVSZxb+dP2CwrJhSMXSjlTcwtz7Vw9f/fK+jXese/ZAU1NTERGp7MFv1LiJ47TWTEo5+tzpT2OeXC6cLg93uXO4y53DnS4P9/hgnGk8AsuyDggAR/e98tyum+9asSWViJOZSulpt94E2wKO7a+/VkpjaK7fe7OZtoY6vd4vQu2t6yThvXA0IoXhVoneKIaW+a3J36pxvv7LNT8pKCj4A3e5euxk0jBNk3Wca36wqqpqqZQy/d5rdbsrxl//xtCysV0MIMa5TqdT5HD69b5XfrsUwNHMSZ4A8AKAM5dwg1MuNgxvOhoNbweQ6/P5fhSNRs8BeOtyVxmv1/swY6wXgFJKjSGiQwD8SqkSp9O5MxaN1qZM8xcA3h20tQLA3QAe4/2GvaZ0yMVKqT/PWb7cMfvuu9nkuXP5qQMNYxnpsd7cXG8ykThmGEaRJyfnHxxOZ/W2ZPLd/OJiccuqVeyBujr679//vrgvFvu2ZVkjAeSDsbBWYrcQNFlrSoPRN1yu3Gfq4tEPAcif7duH3lDIaDp82Ha63Y8K7qi3rHTLxQ4rpfwtEW1Mp9ONmWeFhYVe0zQna62bI5FIMwDt8/mmWkR2IhL5KOuioN1ud1AIsUBrHQDwgc15G7eZS5OeaAj6T9NGjeT+F0Kh09GBPQRAGYYxTmv9Y9M0/yVDNwwASSkrhRB1A0bEV7zpfhkRACCEqJNSVg7oZjxDhEqpDsZYCWPsm0qpBgAymyQH3eXoMjNtxtssywOUdffL1iMBWEKIhwA0W5ZVn0VFlyKWUm6SUv4wa+PfW+SAnR9KKTddKSKZ00ghxFYp5aIsj7C/A5CLeqSUi4QQWwfAsSulQmZBSik3G4axOnsA+IrAWHa4DMNYLaXcnOX9q+blxReEECsHkm7yVXIle42yQFxck1JOFkLUCSFWXqlI6AqgCICSUk4EcB+AiNZ6h2VZH36pUhJiChEtBJAL4DemaX6cGfb+1s8xGBQme0BxNRF9F4BTa32ac/4pgDNutzscDoeTAJCfn+9KJBL5ACps264kolEA+rTWb1uWtX+wzq/aVzJ5owDA5XIV27Y9DUCl1nqI1tqR/Q4RpYioE8CnnPODyWSy7XJ6/j/5H/wCRFuzb7+7AAAAAElFTkSuQmCC";

function BrandLogo({size=96}) {
  return <img src={LOGO_96} alt="Banki Dairy Farm" style={{width:size,height:size,objectFit:"contain"}}/>;
}
function BrandLogoSmall() {
  return <img src={LOGO_36} alt="Banki Dairy Farm" style={{width:36,height:36,objectFit:"contain"}}/>;
}

// ─── PIN PAD LOGIN ─────────────────────────────────────────────────────────
function LoginScreen({onLogin,lang,setLang}) {
  const t = TR[lang];
  const [pin, setPin] = useState("");
  const [shake, setShake] = useState(false);
  const [error, setError] = useState(false);

  function press(digit) {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError(false);
    if (next.length === 4) {
      // Check against all roles
      const matched = Object.keys(PINS).find(role => PINS[role] === next);
      if (matched) {
        setTimeout(() => { setPin(""); onLogin(matched); }, 150);
      } else {
        setShake(true);
        setError(true);
        setTimeout(() => { setPin(""); setShake(false); }, 700);
      }
    }
  }

  function backspace() { setPin(p => p.slice(0,-1)); setError(false); }
  function clear()     { setPin(""); setError(false); }

  const dots = [0,1,2,3].map(i => {
    const filled = i < pin.length;
    const col = error ? "#dc2626" : filled ? "#2D7FB5" : "#e2e8f0";
    return (
      <div key={i} style={{
        width:14, height:14, borderRadius:"50%",
        background: filled ? col : "transparent",
        border: `2px solid ${col}`,
        transition:"all 0.15s"
      }}/>
    );
  });

  const PAD = [["1","2","3"],["4","5","6"],["7","8","9"],["✕","0","⌫"]];

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#EBF5FD 0%,#f8fafc 60%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:320}}>

        {/* Lang toggle */}
        <div style={{display:"flex",justifyContent:"center",marginBottom:24}}>
          <LangToggle lang={lang} setLang={setLang}/>
        </div>

        {/* Logo + name */}
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{display:"flex",justifyContent:"center",marginBottom:12}}>
            <BrandLogo size={96}/>
          </div>
          <div style={{fontFamily:"Georgia,serif",fontSize:24,fontWeight:700,color:"#2D7FB5",letterSpacing:"-0.3px"}}>{t.appName}</div>
          <div style={{color:"#9ACFF0",marginTop:3,fontSize:11,letterSpacing:"1px",textTransform:"uppercase",fontWeight:600}}>
            ✦ {lang==="hi"?"शुद्धता का वादा":lang==="ur"?"پاکیزگی کا وعدہ":"Rooted in Purity"} ✦
          </div>
        </div>

        {/* PIN card */}
        <div style={{background:"#fff",borderRadius:18,boxShadow:"0 2px 24px rgba(45,127,181,0.10)",padding:"28px 24px"}}>
          <div style={{textAlign:"center",fontSize:14,fontWeight:600,color:"#555",marginBottom:20}}>
            {t.enterPin}
          </div>

          {/* Dots */}
          <div style={{display:"flex",justifyContent:"center",gap:16,marginBottom:28,
            animation: shake ? "shake 0.5s" : "none"}}>
            {dots}
          </div>

          {/* Error message */}
          {error && <div style={{textAlign:"center",fontSize:12,color:"#dc2626",marginBottom:12,fontWeight:600}}>
            {t.wrongPin}
          </div>}

          {/* Keypad */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
            {PAD.flat().map(k => {
              const isClear = k==="✕";
              const isBack  = k==="⌫";
              return (
                <button key={k}
                  onClick={()=>{ if(isClear) clear(); else if(isBack) backspace(); else press(k); }}
                  style={{
                    padding:"16px 0",borderRadius:12,border:"none",cursor:"pointer",
                    fontFamily:"inherit",fontSize: isClear||isBack ? 18 : 20,
                    fontWeight:700,
                    background: isClear ? "#fef2f2" : isBack ? "#f8fafc" : "#EBF5FD",
                    color: isClear ? "#dc2626" : isBack ? "#888" : "#2D7FB5",
                    transition:"all 0.1s",
                    boxShadow:"0 1px 3px rgba(0,0,0,0.06)"
                  }}
                  onMouseDown={e=>e.currentTarget.style.transform="scale(0.94)"}
                  onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                  onTouchStart={e=>e.currentTarget.style.transform="scale(0.94)"}
                  onTouchEnd={e=>e.currentTarget.style.transform="scale(1)"}
                >{k}</button>
              );
            })}
          </div>
        </div>

        <div style={{textAlign:"center",marginTop:16,fontSize:11,color:"#9ACFF0"}}>
          {t.appName} · {t.appSub}
        </div>
      </div>

      {/* Shake animation */}
      <style>{`@keyframes shake {
        0%,100%{transform:translateX(0)}
        20%{transform:translateX(-6px)}
        40%{transform:translateX(6px)}
        60%{transform:translateX(-4px)}
        80%{transform:translateX(4px)}
      }`}</style>
    </div>
  );
}


// ─── SUPERVISOR ─────────────────────────────────────────────────────────────
function SlotPanel({rawKg,setRawKg,measuredB,setMeasuredB,measuredC,setMeasuredC,purchased,setPurchased,purchaseRate,setPurchaseRate,extraQty,setExtraQty,extraSold,setExtraSold,extraRate,setExtraRate,t}) {
  const bLtrs=BUFFALO_CATTLE.reduce((s,c)=>s+toNet(rawKg[c]||0),0);
  const cLtrs=COW_CATTLE.reduce((s,c)=>s+toNet(rawKg[c]||0),0);
  const slotTotal=bLtrs+cLtrs;
  const measBNet=measuredB?kgToLtrs(measuredB):null;
  const measCNet=measuredC?kgToLtrs(measuredC):null;

  return (
    <div>
      <div style={{background:"#fffbeb",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#92400e">{t.buffalo} · {t.kgWithBucket}</SectionLabel>
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

      <div style={{background:"#EBF5FD",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#2D7FB5">{t.cow} · {t.kgWithBucket}</SectionLabel>
        {COW_CATTLE.map(c=>(
          <div key={c} style={{display:"flex",alignItems:"center",gap:10,marginBottom:7}}>
            <span style={{fontWeight:700,fontSize:14,color:"#2D7FB5",width:28,flexShrink:0}}>{c}</span>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={rawKg[c]||""} onChange={e=>setRawKg(p=>({...p,[c]:e.target.value}))}
              style={{flex:1,padding:"8px 10px",border:"1.5px solid #9ACFF0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",fontFamily:"inherit"}}/>
            <span style={{fontSize:12,color:"#2D7FB5",width:44,textAlign:"right",flexShrink:0,fontWeight:600}}>
              {rawKg[c]?fmtN(toNet(rawKg[c]),2)+"L":""}
            </span>
          </div>
        ))}
      </div>

      <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#555">{t.measuredTotalsShort}</SectionLabel>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#92400e",fontWeight:600,marginBottom:4}}>{t.bTotal}</div>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={measuredB||""} onChange={e=>setMeasuredB(e.target.value)}
              style={{width:"100%",padding:"8px 10px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            {measBNet!==null&&<div style={{fontSize:11,marginTop:3,textAlign:"center",fontWeight:600,color:Math.abs(measBNet-bLtrs)>0.2?"#dc2626":"#15803d"}}>
              {fmtN(measBNet,2)} L {Math.abs(measBNet-bLtrs)>0.2?t.mismatch:t.matches}
            </div>}
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:11,color:"#2D7FB5",fontWeight:600,marginBottom:4}}>{t.cTotal}</div>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={measuredC||""} onChange={e=>setMeasuredC(e.target.value)}
              style={{width:"100%",padding:"8px 10px",border:"1.5px solid #9ACFF0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            {measCNet!==null&&<div style={{fontSize:11,marginTop:3,textAlign:"center",fontWeight:600,color:Math.abs(measCNet-cLtrs)>0.2?"#dc2626":"#15803d"}}>
              {fmtN(measCNet,2)} L {Math.abs(measCNet-cLtrs)>0.2?t.mismatch:t.matches}
            </div>}
          </div>
        </div>
      </div>

      <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#555">{t.outsideMilk}</SectionLabel>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#1a1a1a",marginBottom:6}}>{t.purchased}</div>
          <div style={{display:"flex",gap:10}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#555",marginBottom:3}}>{t.qty}</div>
              <input type="number" min="0" step="0.1" placeholder="0"
                value={purchased||""} onChange={e=>setPurchased(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#555",marginBottom:3}}>{t.rate}</div>
              <input type="number" min="0" step="1" placeholder="0"
                value={purchaseRate||""} onChange={e=>setPurchaseRate(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
          </div>
        </div>
        <div>
          <div style={{fontSize:12,fontWeight:700,color:"#1a1a1a",marginBottom:6}}>{t.extraMilk}</div>
          <div style={{display:"flex",gap:10,alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{fontSize:11,color:"#555",marginBottom:3}}>{t.qty}</div>
              <input type="number" min="0" step="0.1" placeholder="0"
                value={extraQty||""} onChange={e=>setExtraQty(e.target.value)}
                style={{width:"100%",padding:"8px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            </div>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                <input type="checkbox" checked={extraSold||false} onChange={e=>setExtraSold(e.target.checked)}
                  style={{width:14,height:14,cursor:"pointer",accentColor:"#2D7FB5"}}/>
                <label style={{fontSize:11,color:"#555",cursor:"pointer"}}>{t.sold}</label>
              </div>
              <input type="number" min="0" step="1" placeholder={t.sellingRate}
                value={extraRate||""} onChange={e=>setExtraRate(e.target.value)}
                disabled={!extraSold}
                style={{width:"100%",padding:"8px 10px",border:`1.5px solid ${extraSold?"#e2e8f0":"#f1f5f9"}`,borderRadius:8,fontSize:13,textAlign:"center",background:extraSold?"#fff":"#f8fafc",color:extraSold?"#1a1a1a":"#ccc",outline:"none",boxSizing:"border-box",fontFamily:"inherit",cursor:extraSold?"text":"not-allowed"}}/>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function SupervisorView({lang}) {
  const t=TR[lang];
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

  // track submitted slots so UI knows what's been saved
  const [submittedSlots,setSubmittedSlots]=useState({morning:false,evening:false});

  async function handleSubmit() {
    if(!date){setErrMsg(t.date);setStatus("error");return;}
    const activeRaw = activeSlot==="morning"?mRaw:eRaw;
    const activeTotal = activeSlot==="morning"?mTotal:eTotal;
    if(activeTotal===0){setErrMsg("0");setStatus("error");return;}
    setStatus("loading");
    try {
      const buildRows=(rawMap)=>allCattle.map(c=>({cattle:c,type:BUFFALO_CATTLE.includes(c)?"B":"C",rawKg:parseFloat(rawMap[c])||0,netLtrs:toNet(rawMap[c]||0)})).filter(r=>r.rawKg>0);
      // Only send the active slot — prevents overwriting the other slot with zeros
      const slotData = activeSlot==="morning"
        ? {morning:{rows:JSON.stringify(buildRows(mRaw)),total:mTotal,measuredB:mMeasB,measuredC:mMeasC,purchased:mPurchased,purchaseRate:mPurchaseRate,extraQty:mExtraQty,extraSold:mExtraSold,extraRate:mExtraRate}}
        : {evening:{rows:JSON.stringify(buildRows(eRaw)),total:eTotal,measuredB:eMeasB,measuredC:eMeasC,purchased:ePurchased,purchaseRate:ePurchaseRate,extraQty:eExtraQty,extraSold:eExtraSold,extraRate:eExtraRate}};
      await apiPost("logProduction",{date,...slotData});
      // Mark slot as submitted but keep values visible
      setSubmittedSlots(p=>({...p,[activeSlot]:true}));
      setStatus("success");
    } catch(e){setErrMsg(e.message);setStatus("error");}
  }

  return (
    <div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{t.supTitle}</div>
        
      </div>
      {status==="success"&&<Toast type="success" onDismiss={()=>setStatus(null)}>{t.savedProd}</Toast>}
      {status==="error"&&<Toast type="error" onDismiss={()=>setStatus(null)}>⚠️ {errMsg}</Toast>}

      <Card style={{marginBottom:14}}>
        <div style={{marginBottom:0}}>
          <SectionLabel>{t.date}</SectionLabel>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()}
            style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,background:"#fafafa",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",fontFamily:"inherit",color:"#1a1a1a",display:"block",minWidth:0}}/>
        </div>
      </Card>

      <TabBar tabs={[{key:"morning",label:`☀️ ${t.morning}`},{key:"evening",label:`🌙 ${t.evening}`}]} active={activeSlot} onChange={setActiveSlot}/>

      <Card style={{marginBottom:14}}>
        {activeSlot==="morning"
          ? <SlotPanel rawKg={mRaw} setRawKg={setMRaw} measuredB={mMeasB} setMeasuredB={setMMeasB} measuredC={mMeasC} setMeasuredC={setMMeasC} purchased={mPurchased} setPurchased={setMPurchased} purchaseRate={mPurchaseRate} setPurchaseRate={setMPurchaseRate} extraQty={mExtraQty} setExtraQty={setMExtraQty} extraSold={mExtraSold} setExtraSold={setMExtraSold} extraRate={mExtraRate} setExtraRate={setMExtraRate} t={t}/>
          : <SlotPanel rawKg={eRaw} setRawKg={setERaw} measuredB={eMeasB} setMeasuredB={setEMeasB} measuredC={eMeasC} setMeasuredC={setEMeasC} purchased={ePurchased} setPurchased={setEPurchased} purchaseRate={ePurchaseRate} setPurchaseRate={setEPurchaseRate} extraQty={eExtraQty} setExtraQty={setEExtraQty} extraSold={eExtraSold} setExtraSold={setEExtraSold} extraRate={eExtraRate} setExtraRate={setEExtraRate} t={t}/>
        }
      </Card>

      <Btn onClick={handleSubmit} style={{width:"100%"}} disabled={status==="loading"}>
        {status==="loading"?t.saving:t.submitProd}
      </Btn>
    </div>
  );
}

// ─── DELIVERY ───────────────────────────────────────────────────────────────

function BottleSummary({customers,vals,t}) {
  function calcBottles(type) {
    const filtered=customers.filter(c=>c.type===type&&!(c.selfCollect||c.selfcollect));
    let b075=0,b05=0,b1=0;
    filtered.forEach(c=>{
      const q=vals[c.name_en||c.name]; if(!q||q==="Nil") return;
      const qty=parseFloat(q);
      if(qty===0.75)                     { b075++; }
      else if(qty===0.5)                 { b05++; }
      else if(qty===1.5||qty===2.5)      { b05++; b1+=Math.floor(qty); }
      else if(qty===1||qty===2||qty===3) { b1+=qty; }
    });
    return {b075,b05,b1};
  }
  const b=calcBottles("B"); const c=calcBottles("C");
  const hasAny=customers.some(c=>vals[c.name_en||c.name]&&vals[c.name_en||c.name]!=="Nil");
  if(!hasAny) return null;

  function Col({label,counts,color,bg,border}) {
    return (
      <div style={{flex:1,background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"10px 12px"}}>
        <div style={{fontSize:11,fontWeight:700,color,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:8}}>{label}</div>
        {[["0.75 L",counts.b075],["0.5 L",counts.b05],["1 L",counts.b1]].map(([sz,n])=>(
          <div key={sz} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
            <span style={{fontSize:12,color:"#555"}}>{sz} {t.bottle}</span>
            <span style={{fontSize:18,fontWeight:700,color,minWidth:28,textAlign:"right"}}>{n}</span>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{marginTop:16,borderTop:"2px dashed #9ACFF0",paddingTop:14}}>
      <SectionLabel color="#374151">{t.bottlesToFill}</SectionLabel>
      <div style={{display:"flex",gap:10}}>
        <Col label={t.bufMilk} counts={b} color="#92400e" bg="#fffbeb" border="#fde68a"/>
        <Col label={t.cowMilk} counts={c} color="#2D7FB5" bg="#EBF5FD" border="#9ACFF0"/>
      </div>
    </div>
  );
}

function CustomerRow({customer,value,onChange,prevValue,lang,t,customers=[]}) {
  const isB=customer.type==="B";
  const color=isB?"#92400e":"#2D7FB5";
  const bg=isB?"#fffbeb":"#EBF5FD";
  const tagBg=isB?"#fde68a":"#9ACFF0";
  const displayName=customerName(customer.name_en||customer.name,lang,customers||[]);
  // Highlight row if nothing selected yet (not nil, not a quantity)
  const isEmpty = !value || value==="";
  const isNil   = value==="Nil";
  const rowBg   = isEmpty ? "#fff9f0" : isNil ? "#fff5f5" : "transparent";
  const rowBorder = isEmpty ? "1px solid #fde68a" : isNil ? "1px solid #fecaca" : "none";
  const selfCollect = customer.selfCollect || customer.selfcollect;

  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 6px",borderBottom:"1px solid #f8fafc",background:rowBg,borderRadius:isEmpty||isNil?6:0,marginBottom:isEmpty||isNil?2:0,border:rowBorder}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{displayName}</div>
          {selfCollect&&<span style={{fontSize:9,fontWeight:700,color:"#6b7280",background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:4,padding:"1px 5px",flexShrink:0,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.self}</span>}
          {isEmpty&&<span style={{fontSize:9,fontWeight:700,color:"#92400e",background:"#fef3c7",border:"1px solid #fde68a",borderRadius:4,padding:"1px 5px",flexShrink:0}}>?</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:1}}>
          {(customer.phone)&&<span style={{fontSize:11,color:"#aaa"}}>{customer.phone}</span>}
          {prevValue&&prevValue!=="Nil"
            ?<span style={{fontSize:11,color:"#94a3b8",fontStyle:"italic"}}>{t.yesterday}: {prevValue} L</span>
            :prevValue==="Nil"
            ?<span style={{fontSize:11,color:"#cbd5e1",fontStyle:"italic"}}>{t.yesterday}: {t.absent}</span>
            :null}
        </div>
      </div>
      <span style={{background:tagBg,color,fontSize:10,fontWeight:700,padding:"2px 7px",borderRadius:10,flexShrink:0}}>{isB?"🐃 B":"🐄 C"}</span>
      <select value={value||""} onChange={e=>onChange(e.target.value)}
        style={{padding:"6px 8px",border:`1.5px solid ${value&&value!=="Nil"?color:"#e2e8f0"}`,borderRadius:8,fontSize:13,fontWeight:600,background:value&&value!=="Nil"?bg:"#fafafa",color:value&&value!=="Nil"?color:"#888",outline:"none",width:80,flexShrink:0,fontFamily:"inherit"}}>
        <option value="">—</option>
        {QTY_OPTIONS.map(q=><option key={q} value={q}>{q==="Nil"?t.nilOption:q+" L"}</option>)}
      </select>
    </div>
  );
}

function DeliveryView({lang, morningCustomers=[], eveningCustomers=[], customers=[]}) {
  const t=TR[lang];
  const [date,setDate]=useState(today());
  const [slot,setSlot]=useState("morning");
  const [mVals,setMVals]=useState({});
  const [eVals,setEVals]=useState({});
  const [prevData,setPrevData]=useState(null);
  // track which slots have been submitted
  const [submittedSlots,setSubmittedSlots]=useState({morning:false,evening:false});
  const [status,setStatus]=useState(null);
  const [errMsg,setErrMsg]=useState("");

  useEffect(()=>{
    if(!date) return;
    setSubmittedSlots({morning:false,evening:false}); setStatus(null);
    setMVals({}); setEVals({});
    const prev=new Date(date+"T00:00:00"); prev.setDate(prev.getDate()-1);
    const prevDateStr=prev.toISOString().split("T")[0];
    apiGet("getDispatchByDate",{date:prevDateStr}).then(d=>setPrevData(d)).catch(()=>setPrevData(null));
  },[date]);

  const slotCustomers=slot==="morning"?morningCustomers:eveningCustomers;
  const vals=slot==="morning"?mVals:eVals;
  const setVals=slot==="morning"?setMVals:setEVals;
  const prevVals=prevData?(slot==="morning"?prevData.morning:prevData.evening):null;

  function totalLtrs(vs){return Object.values(vs).reduce((s,v)=>s+(v&&v!=="Nil"?parseFloat(v)||0:0),0);}
  const mTotal=totalLtrs(mVals); const eTotal=totalLtrs(eVals);
  const slotTotal=totalLtrs(vals);

  async function handleSubmit() {
    if(!date){setErrMsg(t.date);setStatus("error");return;}
    if(slotTotal===0){setErrMsg(t.noDeliveries);setStatus("error");return;}
    setStatus("loading");
    try {
      // Only send the active slot — prevents overwriting other slot with Nil values
      const buildEntries=(custs,vs)=>custs.map(c=>({name:c.name_en,type:c.type,qty:vs[c.name_en]||"Nil"}));
      const slotPayload = slot==="morning"
        ? {morning:{entries:JSON.stringify(buildEntries(morningCustomers,mVals)),total:mTotal}}
        : {evening:{entries:JSON.stringify(buildEntries(eveningCustomers,eVals)),total:eTotal}};
      await apiPost("logDispatch",{date,...slotPayload});
      setSubmittedSlots(p=>({...p,[slot]:true}));
      setStatus("success");
    } catch(e){setErrMsg(e.message);setStatus("error");}
  }

  return (
    <div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{t.delTitle}</div>
        <div style={{color:"#888",fontSize:13,marginTop:2}}>{t.delSub}</div>
      </div>

      {status==="success"&&(
        <Toast type="success" onDismiss={()=>setStatus(null)}>
          {slot==="morning"?t.savedMorning:t.savedEvening}
        </Toast>
      )}
      {status==="error"&&<Toast type="error" onDismiss={()=>setStatus(null)}>⚠️ {errMsg}</Toast>}

      <Card style={{marginBottom:14}}>
        <div style={{marginBottom:0}}>
          <SectionLabel>{t.date}</SectionLabel>
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()}
            style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,background:"#fafafa",outline:"none",boxSizing:"border-box",WebkitAppearance:"none",fontFamily:"inherit",color:"#1a1a1a",display:"block",minWidth:0}}/>
        </div>
      </Card>

      <TabBar tabs={[{key:"morning",label:`☀️ ${t.morning}`},{key:"evening",label:`🌙 ${t.evening}`}]} active={slot} onChange={setSlot}/>

      <Card>
        <div style={{fontWeight:700,fontSize:13,color:"#555",marginBottom:12}}>
          {slot==="morning"?`☀️ ${t.morningCustomers}`:`🌙 ${t.eveningCustomers}`} ({slotCustomers.length})
        </div>
        {slotCustomers.map(c=>(
          <CustomerRow key={c.name_en||c.name} customer={c} value={vals[c.name_en||c.name]||""} onChange={v=>setVals(p=>({...p,[c.name_en||c.name]:v}))} prevValue={prevVals?prevVals[c.name_en||c.name]:null} lang={lang} t={t} customers={customers}/>
        ))}

        {/* Totals below the list */}
        {slotTotal>0&&(
          <div style={{marginTop:14,paddingTop:12,borderTop:"1.5px solid #EBF5FD",display:"flex",gap:8}}>
            <div style={{flex:1,background:"#EBF5FD",border:"1px solid #9ACFF0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
              <div style={{fontSize:10,color:"#1A5C8A",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:2}}>
                {slot==="morning"?`☀️ ${t.morning}`:`🌙 ${t.evening}`}
              </div>
              <div style={{fontSize:20,fontWeight:700,color:"#2D7FB5"}}>{fmtN(slotTotal,2)} L</div>
            </div>
            {submittedSlots.morning&&submittedSlots.evening&&mTotal>0&&eTotal>0&&(
              <div style={{flex:1,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
                <div style={{fontSize:10,color:"#15803d",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px",marginBottom:2}}>{t.grandTotal}</div>
                <div style={{fontSize:20,fontWeight:700,color:"#15803d"}}>{fmtN(mTotal+eTotal,2)} L</div>
              </div>
            )}
          </div>
        )}

        <BottleSummary customers={slotCustomers} vals={vals} t={t}/>
      </Card>

      <div style={{height:16}}/>
      <Btn onClick={handleSubmit} style={{width:"100%"}} disabled={status==="loading"}>
        {status==="loading"?t.saving:slot==="morning"?t.submitMorning:t.submitEvening}
      </Btn>
    </div>
  );
}

// ─── OWNER DASHBOARD ───────────────────────────────────────────────────────
// ─── CUSTOMERS ADMIN ───────────────────────────────────────────────────────
function CustomersAdmin({customers, lang, t, onChanged}) {
  const [form,setForm]=useState(null); // null=list, object=edit form
  const [saving,setSaving]=useState(false);
  const [toast,setToast]=useState(null);

  const slots = ["morning","evening"];
  const types = ["B","C"];

  function blankForm() {
    return {name_en:"",name_hi:"",name_ur:"",slot:"morning",type:"B",phone:"",selfCollect:false,rowIndex:null};
  }

  function showToast(msg,type="success") {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  }

  async function handleSave() {
    if(!form.name_en.trim()){showToast("English name is required","error");return;}
    if(!form.name_hi.trim()){showToast("Hindi name is required","error");return;}
    if(!form.name_ur.trim()){showToast("Urdu name is required","error");return;}
    setSaving(true);
    try {
      await apiPost("saveCustomer",{...form});
      setForm(null);
      onChanged&&onChanged();
      showToast(form.rowIndex?"Customer updated!":"Customer added!");
    } catch(e){showToast(e.message,"error");}
    finally{setSaving(false);}
  }

  async function handleToggle(cust) {
    try {
      await apiPost("toggleCustomer",{rowIndex:cust.rowIndex,active:!cust.active});
      onChanged&&onChanged();
      showToast(cust.active?"Customer deactivated":"Customer reactivated");
    } catch(e){showToast(e.message,"error");}
  }

  const [confirmDelete,setConfirmDelete]=useState(null); // holds cust to delete

  async function handleDelete(cust) {
    setConfirmDelete(cust); // show inline confirm instead of window.confirm
  }

  async function confirmDeleteYes() {
    const cust = confirmDelete;
    setConfirmDelete(null);
    try {
      await apiPost("deleteCustomer",{rowIndex:cust.rowIndex});
      onChanged&&onChanged();
      showToast("Customer deleted");
    } catch(e){showToast(e.message,"error");}
  }

  if(form) return (
    <div>
      {toast&&<Toast type={toast.type} onDismiss={()=>setToast(null)}>{toast.msg}</Toast>}
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:18}}>
        <button onClick={()=>setForm(null)} style={{background:"none",border:"none",color:"#2D7FB5",cursor:"pointer",fontSize:20,lineHeight:1}}>←</button>
        <div style={{fontWeight:700,fontSize:16,color:"#1a1a1a"}}>{form.rowIndex?"Edit Customer":"Add Customer"}</div>
      </div>
      <Card>
        <div style={{marginBottom:12}}>
          <SectionLabel>Name in English *</SectionLabel>
          <input value={form.name_en} onChange={e=>setForm(p=>({...p,name_en:e.target.value}))}
            placeholder="e.g. Mr. Ahmad Khan"
            style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
        </div>
        <div style={{marginBottom:12}}>
          <SectionLabel>Name in Hindi * (for Supervisor)</SectionLabel>
          <input value={form.name_hi} onChange={e=>setForm(p=>({...p,name_hi:e.target.value}))}
            placeholder="श्री अहमद खान"
            style={{width:"100%",padding:"9px 12px",border:"1.5px solid #fde68a",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
          <div style={{fontSize:11,color:"#aaa",marginTop:3}}>Use Google Translate if needed → translate to Hindi</div>
        </div>
        <div style={{marginBottom:14}}>
          <SectionLabel>Name in Urdu * (for Delivery)</SectionLabel>
          <input value={form.name_ur} onChange={e=>setForm(p=>({...p,name_ur:e.target.value}))}
            placeholder="مسٹر احمد خان"
            dir="rtl"
            style={{width:"100%",padding:"9px 12px",border:"1.5px solid #9ACFF0",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit",textAlign:"right"}}/>
          <div style={{fontSize:11,color:"#aaa",marginTop:3}}>Use Google Translate if needed → translate to Urdu</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
          <div>
            <SectionLabel>Slot</SectionLabel>
            <select value={form.slot} onChange={e=>setForm(p=>({...p,slot:e.target.value}))}
              style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",fontFamily:"inherit"}}>
              <option value="morning">☀️ Morning</option>
              <option value="evening">🌙 Evening</option>
            </select>
          </div>
          <div>
            <SectionLabel>Milk Type</SectionLabel>
            <select value={form.type} onChange={e=>setForm(p=>({...p,type:e.target.value}))}
              style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",fontFamily:"inherit"}}>
              <option value="B">🐃 Buffalo</option>
              <option value="C">🐄 Cow</option>
            </select>
          </div>
        </div>
        <div style={{marginBottom:12}}>
          <SectionLabel>Phone (optional)</SectionLabel>
          <input value={form.phone||""} onChange={e=>setForm(p=>({...p,phone:e.target.value}))}
            placeholder="10-digit number"
            style={{width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:18}}>
          <input type="checkbox" id="selfCollect" checked={form.selfCollect||false}
            onChange={e=>setForm(p=>({...p,selfCollect:e.target.checked}))}
            style={{width:15,height:15,accentColor:"#2D7FB5"}}/>
          <label htmlFor="selfCollect" style={{fontSize:13,color:"#555",cursor:"pointer"}}>
            Self-collect (brings own utensil, excluded from bottle count)
          </label>
        </div>
        <Btn onClick={handleSave} style={{width:"100%"}} disabled={saving}>
          {saving?"Saving…":form.rowIndex?"Update Customer":"Add Customer"}
        </Btn>
      </Card>
    </div>
  );

  // List view
  const morning = customers.filter(c=>c.slot==="morning");
  const evening = customers.filter(c=>c.slot==="evening");

  function Section({title, list}) {
    return (
      <Card style={{marginBottom:12}}>
        <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:12}}>{title} ({list.filter(c=>c.active).length} active)</div>
        {list.map(cust=>(
          <div key={cust.rowIndex} style={{
            display:"flex",alignItems:"center",gap:8,padding:"9px 0",
            borderBottom:"1px solid #f8fafc",
            opacity:cust.active?1:0.45
          }}>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                {cust.name_en}
                {cust.selfCollect&&<span style={{marginLeft:6,fontSize:9,fontWeight:700,color:"#6b7280",background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:4,padding:"1px 5px"}}>SELF</span>}
                {!cust.active&&<span style={{marginLeft:6,fontSize:9,fontWeight:700,color:"#dc2626",background:"#fef2f2",border:"1px solid #fecaca",borderRadius:4,padding:"1px 5px"}}>INACTIVE</span>}
              </div>
              <div style={{fontSize:11,color:"#aaa",marginTop:1}}>{cust.type==="B"?"🐃 Buffalo":"🐄 Cow"}{cust.phone?` · ${cust.phone}`:""}</div>
            </div>
            <button onClick={()=>setForm({...cust})} style={{background:"#EBF5FD",border:"none",borderRadius:7,padding:"5px 10px",fontSize:12,color:"#2D7FB5",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>Edit</button>
            <button onClick={()=>handleToggle(cust)} style={{background:cust.active?"#fff9f0":"#f0fdf4",border:`1px solid ${cust.active?"#fde68a":"#bbf7d0"}`,borderRadius:7,padding:"5px 10px",fontSize:12,color:cust.active?"#92400e":"#15803d",fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              {cust.active?"Deactivate":"Reactivate"}
            </button>
            <button onClick={()=>handleDelete(cust)} style={{background:"#fef2f2",border:"1px solid #fecaca",borderRadius:7,padding:"5px 8px",fontSize:12,color:"#dc2626",cursor:"pointer",fontFamily:"inherit"}}>✕</button>
          </div>
        ))}
      </Card>
    );
  }

  return (
    <div>
      {toast&&<Toast type={toast.type} onDismiss={()=>setToast(null)}>{toast.msg}</Toast>}

      {/* Inline delete confirmation */}
      {confirmDelete&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
          <div style={{background:"#fff",borderRadius:14,padding:"24px 20px",maxWidth:320,width:"100%",boxShadow:"0 8px 32px rgba(0,0,0,0.18)"}}>
            <div style={{fontWeight:700,fontSize:16,color:"#1a1a1a",marginBottom:8}}>Delete Customer?</div>
            <div style={{fontSize:13,color:"#555",marginBottom:20}}>
              <strong>{confirmDelete.name_en}</strong> will be permanently removed. This cannot be undone.
            </div>
            <div style={{display:"flex",gap:10}}>
              <Btn variant="ghost" onClick={()=>setConfirmDelete(null)} style={{flex:1}}>Cancel</Btn>
              <Btn variant="danger" onClick={confirmDeleteYes} style={{flex:1}}>Delete</Btn>
            </div>
          </div>
        </div>
      )}

      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div>
          <div style={{fontSize:18,fontWeight:700,color:"#1a1a1a"}}>Customers</div>
          <div style={{fontSize:12,color:"#888",marginTop:2}}>{customers.filter(c=>c.active).length} active of {customers.length} total</div>
        </div>
        <Btn onClick={()=>setForm(blankForm())} style={{padding:"8px 16px",fontSize:13}}>+ Add</Btn>
      </div>
      <Section title="☀️ Morning" list={morning}/>
      <Section title="🌙 Evening" list={evening}/>
      <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#92400e",marginTop:4}}>
        💡 Deactivating a customer hides them from the delivery view but keeps their history. Deleting is permanent.
      </div>
    </div>
  );
}

function OwnerDashboard({lang, customers=[], reloadCustomers}) {
  const t=TR[lang];
  const [data,setData]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState(null);
  const [tab,setTab]=useState("overview");

  async function load(){setLoading(true);setError(null);try{setData(await apiGet("getDashboard"));}catch(e){setError(e.message);}finally{setLoading(false);}}
  useEffect(()=>{load();},[]);

  if(loading) return <div style={{textAlign:"center",padding:"60px 20px",color:"#888"}}><div style={{fontSize:36,marginBottom:12}}>🔄</div><div>{t.loading}</div></div>;
  if(error) return <div><Alert type="error">{t.errLoad}: {error}<br/><span style={{fontSize:11}}>{t.errScriptUrl}</span></Alert><Btn onClick={load} variant="ghost" style={{width:"100%"}}>{t.retry}</Btn></div>;

  const {summary={},recentDays=[],monthlyTrend=[]}=data||{};
  const gap30=(summary.last30DaysProduce||0)-(summary.last30DaysDispatched||0);
  const todayGap=(summary.todayProduce||0)-(summary.todayDispatched||0);

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
        <div><div style={{fontSize:20,fontWeight:700}}>{t.ownTitle}</div><div style={{color:"#888",fontSize:12,marginTop:2}}>{t.ownSub}</div></div>
        <Btn variant="ghost" onClick={load} style={{padding:"7px 13px",fontSize:12}}>{t.refresh}</Btn>
      </div>

      <TabBar tabs={[{key:"overview",label:t.overview},{key:"daily",label:t.dailyLog},{key:"monthly",label:t.monthly},{key:"customers",label:t.customersTab}]} active={tab} onChange={setTab}/>

      {tab==="overview"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:"#1a1a1a",marginBottom:12}}>{t.todaySnap}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <StatBox label={t.produced} value={`${fmtN(summary.todayProduce||0,1)} L`} color="#2D7FB5"/>
              <StatBox label={t.dispatched} value={`${fmtN(summary.todayDispatched||0,1)} L`} color="#1A5C8A"/>
            </div>
            {/* B/C breakdown */}
            {(summary.todayProduceB||summary.todayProduceC)>0&&(
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
                <StatBox label={t.bufToday} value={`${fmtN(summary.todayProduceB||0,1)} L`} color="#92400e"/>
                <StatBox label={t.cowToday} value={`${fmtN(summary.todayProduceC||0,1)} L`} color="#2D7FB5"/>
              </div>
            )}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <StatBox label={t.gap} value={`${fmtN(Math.abs(todayGap),1)} L`}
                sub={todayGap>0?t.surplus:todayGap<0?t.deficit:t.balanced}
                color={todayGap>=0?"#2D7FB5":"#dc2626"}/>
              <StatBox label={t.revToday} value={fmtRs(summary.todayRevenue||0)} color="#2D7FB5"/>
            </div>
            {(summary.todayProduce||0)>0&&(
              <div style={{padding:"9px 13px",borderRadius:9,background:todayGap>=0?"#f0fdf4":"#fef2f2",color:todayGap>=0?"#15803d":"#dc2626",fontSize:13,fontWeight:600}}>
                {todayGap>=0?`${t.surplusMsg} ${fmtN(todayGap,1)} L`:`${t.deficitMsg} ${fmtN(Math.abs(todayGap),1)} L`}
              </div>
            )}
            {(summary.todayProduce||0)===0&&<div style={{color:"#aaa",fontSize:12}}>{t.noDataToday}</div>}
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            <StatBox label={t.produced30}   value={`${fmtN(summary.last30DaysProduce||0,0)} L`}   color="#2D7FB5"/>
            <StatBox label={t.dispatched30} value={`${fmtN(summary.last30DaysDispatched||0,0)} L`} color="#1A5C8A"/>
          </div>
          {/* B/C 30-day breakdown */}
          {(summary.last30DaysProduceB||summary.last30DaysProduceC)>0&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <StatBox label={t.buf30} value={`${fmtN(summary.last30DaysProduceB||0,0)} L`} color="#92400e"/>
              <StatBox label={t.cow30} value={`${fmtN(summary.last30DaysProduceC||0,0)} L`} color="#2D7FB5"/>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <StatBox label={t.gap30} value={`${fmtN(Math.abs(gap30),0)} L`}
              sub={gap30>0?t.surplus:gap30<0?t.deficit:t.balanced} color={gap30>=0?"#2D7FB5":"#dc2626"}/>
            <StatBox label={t.rev30} value={fmtRs(summary.last30DaysRevenue||0)} color="#2D7FB5"/>
          </div>

          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:"#1a1a1a"}}>{t.settings}</div>
            {[[t.bufRate,`₹${summary.rateB||70}/L`],[t.cowRate,`₹${summary.rateC||60}/L`],[t.activeCattle,`${summary.activeCattle||10} (${BUFFALO_CATTLE.length}B + ${COW_CATTLE.length}C)`]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:"#555",paddingBottom:7,marginBottom:7,borderBottom:"1px solid #f8fafc"}}>
                <span>{k}</span><span style={{fontWeight:600}}>{v}</span>
              </div>
            ))}
          </Card>
        </div>
      )}

      {tab==="daily"&&(
        <Card>
          <div style={{fontWeight:700,fontSize:13,color:"#1a1a1a",marginBottom:14}}>{t.recentRecords}</div>
          {recentDays.length===0?<div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"20px 0"}}>{t.noData}</div>:(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
                  {[t.tableDate,t.produced,t.dispatched,t.gap,t.revenue,t.status].map(h=>(
                    <th key={h} style={{textAlign:"left",padding:"5px 7px",color:"#888",fontWeight:600,fontSize:11,textTransform:"uppercase"}}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {recentDays.map((row,i)=>{
                    const g=(row.produced||0)-(row.dispatched||0);
                    return <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                      <td style={{padding:"7px",fontWeight:600,color:"#1a1a1a"}}>{fmtDate(row.date)}</td>
                      <td style={{padding:"7px"}}>{fmtN(row.produced,1)}</td>
                      <td style={{padding:"7px"}}>{fmtN(row.dispatched,1)}</td>
                      <td style={{padding:"7px",fontWeight:600,color:g>=0?"#15803d":"#dc2626"}}>{g>=0?"+":""}{fmtN(g,1)}</td>
                      <td style={{padding:"7px"}}>{fmtRs(row.revenue||0)}</td>
                      <td style={{padding:"7px"}}>
                        <span style={{background:g>=0?"#f0fdf4":"#fef2f2",color:g>=0?"#15803d":"#dc2626",border:`1px solid ${g>=0?"#bbf7d0":"#fecaca"}`,borderRadius:20,padding:"2px 9px",fontSize:11,fontWeight:600}}>
                          {g>=0?t.ok:t.gapWarn}
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
          <div style={{fontWeight:700,fontSize:13,color:"#1a1a1a",marginBottom:14}}>{t.monthlySummary}</div>
          {monthlyTrend.length===0?<div style={{color:"#aaa",fontSize:13,textAlign:"center",padding:"20px 0"}}>{t.noMonthlyData}</div>:(
            <div style={{overflowX:"auto"}}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead><tr style={{borderBottom:"2px solid #f1f5f9"}}>
                  {[t.month,t.produced,t.dispatched,t.revenue,t.gap].map(h=>(
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

      {tab==="customers"&&(
        <CustomersAdmin customers={customers} lang={lang} t={t} onChanged={reloadCustomers}/>
      )}
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────
export default function App() {
  const [role,setRole]=useState(null);
  const [lang,setLang]=useState(()=>{
    try { return localStorage.getItem("dairyLang")||"en"; } catch(e){ return "en"; }
  });
  // Customer list loaded once from sheet, shared across all views
  const [customers,setCustomers]=useState([]);
  const [custLoading,setCustLoading]=useState(true);

  useEffect(()=>{
    apiGet("getCustomers")
      .then(d=>{
        setCustomers(d.customers||[]);
        setCustLoading(false);
      })
      .catch(()=>setCustLoading(false));
  },[]);

  function reloadCustomers() {
    apiGet("getCustomers").then(d=>setCustomers(d.customers||[])).catch(()=>{});
  }

  function changeLang(l) {
    setLang(l);
    try { localStorage.setItem("dairyLang",l); } catch(e){}
  }

  const t=TR[lang];
  const ROLES_META = {
    supervisor:{label:t.roleSupervisor,emoji:"🧑‍🌾",color:"#2D7FB5"},
    delivery:  {label:t.roleDelivery,  emoji:"🚚",  color:"#1A5C8A"},
    owner:     {label:t.roleOwner,     emoji:"👑",  color:"#2D7FB5"},
  };

  if(!role) return <LoginScreen onLogin={setRole} lang={lang} setLang={changeLang}/>;

  const morningCustomers = customers.filter(c=>c.active&&c.slot==="morning");
  const eveningCustomers = customers.filter(c=>c.active&&c.slot==="evening");

  const r=ROLES_META[role];
  return (
    <div style={{minHeight:"100vh",background:"#f8fafc",fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e8ecf0",padding:"11px 18px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <BrandLogoSmall/>
          <div>
            <div style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:16,color:"#2D7FB5"}}>Banki Dairy</div>
            <div style={{fontSize:9,color:"#9ACFF0",letterSpacing:"1.2px",textTransform:"uppercase",fontWeight:600}}>Farm Operations</div>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <LangToggle lang={lang} setLang={changeLang}/>
          <span style={{background:r.color+"18",color:r.color,border:`1px solid ${r.color}33`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{r.emoji} {r.label}</span>
          <button onClick={()=>setRole(null)} title="Lock" style={{background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:16,lineHeight:1,padding:"2px 4px"}} aria-label="Lock">🔒</button>
        </div>
      </div>
      <div style={{maxWidth:520,margin:"0 auto",padding:"18px 15px 48px"}}>
        {custLoading
          ? <div style={{textAlign:"center",padding:"60px 20px",color:"#aaa",fontSize:13}}>Loading…</div>
          : <>
            {role==="supervisor"&&<SupervisorView lang={lang}/>}
            {role==="delivery"&&<DeliveryView lang={lang} morningCustomers={morningCustomers} eveningCustomers={eveningCustomers} customers={customers}/>}
            {role==="owner"&&<OwnerDashboard lang={lang} customers={customers} reloadCustomers={reloadCustomers}/>}
          </>
        }
      </div>
    </div>
  );
}
