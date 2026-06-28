import { useState, useEffect } from "react";

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0Y0qDrOhIVALmFtnAp-pgRSnM47A5Fk5GsZlj708_hzh9NCi6VFGlx-PCXmYCgITH/exec";

const BUFFALO_CATTLE = ["B1","B4","B5","B6","B7","B8","B9"];
const COW_CATTLE     = ["C1","C2","C3"];
const BUCKET_WEIGHT  = 1.18;
const CONVERSION     = 0.97;
const QTY_OPTIONS    = ["0.5","0.75","1","1.25","1.5","2","2.5","3","Nil"];

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
    buffalo: "🐃 Buffalo", cow: "🐄 Cow",
    measuredTotals: "📏 Measured Totals (net kg, bucket removed)",
    bTotal: "B Total (kg)", cTotal: "C Total (kg)",
    matches: "✓ Matches", mismatch: "⚠️ Mismatch",
    outsideMilk: "🔄 Outside Milk",
    purchased: "Purchased", extraMilk: "Extra Milk",
    qty: "Qty (L)", rate: "Rate (₹/L)", sold: "Sold", sellingRate: "Selling rate (₹/L)",
    calcTotals: "Calculated Totals",
    total: "Total", submitProd: "Submit Production Log", saving: "Saving…",
    savedProd: "✅ Production logged for", loggedTotal: "Grand Total",
    // Delivery
    delTitle: "Log Milk Dispatched", delSub: "Record delivery for each customer",
    morningCustomers: "Morning Customers", eveningCustomers: "Evening Customers",
    yesterday: "Yesterday", absent: "absent", self: "Self",
    bottlesToFill: "🍶 Bottles to Fill",
    bufMilk: "Buffalo Milk", cowMilk: "Cow Milk", bottle: "bottle",
    submitDel: "Submit Dispatch Log",
    savedDel: "✅ Dispatch logged for",
    noDeliveries: "No deliveries entered.",
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
  },
  hi: {
    appName: "बांकी डेयरी फार्म", appSub: "संचालन ट्रैकर",
    selectRole: "जारी रखने के लिए अपनी भूमिका चुनें",
    roleSupervisor: "सुपरवाइज़र", roleDelivery: "डिलीवरी", roleOwner: "मालिक",
    roleSupDesc: "दैनिक दूध उत्पादन दर्ज करें",
    roleDelDesc: "ग्राहकों को भेजा गया दूध दर्ज करें",
    roleOwnDesc: "पूरा डैशबोर्ड देखें",
    switchBtn: "बदलें ↩",
    supTitle: "आज का उत्पादन दर्ज करें", supSub: "बाल्टी सहित वजन डालें (किलो)",
    date: "तारीख", morning: "सुबह", evening: "शाम", grandTotal: "कुल जोड़",
    buffalo: "🐃 भैंस", cow: "🐄 गाय",
    measuredTotals: "📏 नापा गया कुल (नेट किलो, बाल्टी निकालकर)",
    bTotal: "भैंस कुल (किलो)", cTotal: "गाय कुल (किलो)",
    matches: "✓ सही", mismatch: "⚠️ अंतर है",
    outsideMilk: "🔄 बाहरी दूध",
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
    noDeliveries: "कोई डिलीवरी दर्ज नहीं।",
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
    buffalo: "🐃 بھینس", cow: "🐄 گائے",
    measuredTotals: "📏 ناپا گیا کل (نیٹ کلو، بالٹی نکال کر)",
    bTotal: "بھینس کل (کلو)", cTotal: "گائے کل (کلو)",
    matches: "✓ درست", mismatch: "⚠️ فرق ہے",
    outsideMilk: "🔄 باہری دودھ",
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
    noDeliveries: "کوئی ڈیلیوری درج نہیں۔",
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
  },
};

// Customer names in all three languages
const CUSTOMER_NAMES = {
  // Morning
  "Mr. Saurav Gupta":       { hi: "श्री सौरव गुप्ता",        ur: "مسٹر سوراو گپتا" },
  "Mr. Zaid Javed":         { hi: "श्री ज़ैद जावेद",          ur: "مسٹر زید جاوید" },
  "Haaji Shamshaad":        { hi: "हाजी शम्शाद",              ur: "حاجی شمشاد" },
  "Mr. Urooj (Asma Baaji)": { hi: "श्री उरूज (असमा बाजी)",   ur: "مسٹر عروج (آسمہ باجی)" },
  "Mr. Urooj Banki":        { hi: "श्री उरूज बांकी",          ur: "مسٹر عروج بانکی" },
  "Mr. Aziz-ur-Rehman":     { hi: "श्री अज़ीज़ुर्रहमान",     ur: "مسٹر عزیزالرحمان" },
  "Mr. Moni":               { hi: "श्री मोनी",                ur: "مسٹر مونی" },
  "Mrs. Farzana":           { hi: "श्रीमती फ़र्ज़ाना",        ur: "محترمہ فرزانہ" },
  "Mr. Achhe Khan":         { hi: "श्री अच्छे खान",           ur: "مسٹر اچھے خان" },
  "Mr. Guddu (Station)":    { hi: "श्री गुड्डू (स्टेशन)",    ur: "مسٹر گڈو (اسٹیشن)" },
  "Mr. Umair Kidwai":       { hi: "श्री उमैर किदवई",          ur: "مسٹر عمیر کدوائی" },
  "Mr. Umar Faiz Kidwai":   { hi: "श्री उमर फ़ैज़ किदवई",    ur: "مسٹر عمر فیض کدوائی" },
  "Mr. Rizwan":             { hi: "श्री रिज़वान",              ur: "مسٹر رضوان" },
  "Mr. Faisal":             { hi: "श्री फ़ैसल",               ur: "مسٹر فیصل" },
  "Mr. Danish":             { hi: "श्री डेनिश",               ur: "مسٹر دانش" },
  "Mr. Chanda":             { hi: "श्री चंदा",                ur: "مسٹر چندا" },
  "Mr. Syed Athar":         { hi: "श्री सैयद अतहर",           ur: "مسٹر سید اطہر" },
  "Mr. Adnan Abbasi":       { hi: "श्री अदनान अब्बासी",       ur: "مسٹر عدنان عباسی" },
  "Mr. Haneef":             { hi: "श्री हनीफ़",               ur: "مسٹر حنیف" },
  "Mr. Aleem Kidwai":       { hi: "श्री अलीम किदवई",          ur: "مسٹر علیم کدوائی" },
  "Mr. Shaad Kidwai":       { hi: "श्री शाद किदवई",           ur: "مسٹر شاد کدوائی" },
  "Mr. Razzaki":            { hi: "श्री रज़्ज़ाकी",           ur: "مسٹر رزاقی" },
  "Mr. Abrar":              { hi: "श्री अबरार",               ur: "مسٹر ابرار" },
  "Mr. Shivam Gupta":       { hi: "श्री शिवम गुप्ता",         ur: "مسٹر شیوم گپتا" },
  "Mr. Santosh":            { hi: "श्री संतोष",               ur: "مسٹر سنتوش" },
  "Mr. Satish Kumar":       { hi: "श्री सतीश कुमार",          ur: "مسٹر ستیش کمار" },
  "Mr. Salauddin":          { hi: "श्री सलाउद्दीन",           ur: "مسٹر صلاح الدین" },
  "Mr. Soni (Adv.)":        { hi: "श्री सोनी (वकील)",         ur: "مسٹر سونی (ایڈو.)" },
  "Mr. Santosh (C)":        { hi: "श्री संतोष (गाय)",         ur: "مسٹر سنتوش (گائے)" },
  // Evening
  "Mr. Imran Sheikh":          { hi: "श्री इमरान शेख",           ur: "مسٹر عمران شیخ" },
  "Mr. Amar Jaiswal":          { hi: "श्री अमर जायसवाल",         ur: "مسٹر امر جیسوال" },
  "Mr. Aftab":                 { hi: "श्री अफ़ताब",              ur: "مسٹر آفتاب" },
  "Mr. Abdul Waheed":          { hi: "श्री अब्दुल वहीद",         ur: "مسٹر عبدالوحید" },
  "Mr. Aziz":                  { hi: "श्री अज़ीज़",              ur: "مسٹر عزیز" },
  "Mr. Abdul Hai":             { hi: "श्री अब्दुल हई",           ur: "مسٹر عبدالحئی" },
  "Mrs. Shabnam":              { hi: "श्रीमती शबनम",             ur: "محترمہ شبنم" },
  "Mr. Abdul Shehzaade":       { hi: "श्री अब्दुल शहज़ादे",     ur: "مسٹر عبدالشہزادے" },
  "Mr. Amir":                  { hi: "श्री आमिर",               ur: "مسٹر عامر" },
  "Mr. Salauddin (Doc)":       { hi: "श्री सलाउद्दीन (डॉक्टर)", ur: "مسٹر صلاح الدین (ڈاکٹر)" },
  "Mr. Muin":                  { hi: "श्री मुईन",               ur: "مسٹر معین" },
  "Mr. Ittiba Hussein":        { hi: "श्री इत्तेबा हुसैन",      ur: "مسٹر اتباع حسین" },
  "Mr. Rayyan Ashraf":         { hi: "श्री रैयान अशरफ़",        ur: "مسٹر ریان اشرف" },
  "Mr. Fareed":                { hi: "श्री फ़रीद",              ur: "مسٹر فرید" },
  "Mr. Faisal Mukhtaar":       { hi: "श्री फ़ैसल मुख्तार",      ur: "مسٹر فیصل مختار" },
  "Mr. Akhtar Alam":           { hi: "श्री अख़्तर आलम",         ur: "مسٹر اختر عالم" },
  "Mr. Faizan":                { hi: "श्री फ़ैज़ान",            ur: "مسٹر فیضان" },
  "Mr. Farhan":                { hi: "श्री फ़रहान",             ur: "مسٹر فرحان" },
  "Mrs. Jabi":                 { hi: "श्रीमती जाबी",            ur: "محترمہ جابی" },
  "Mr. Naved":                 { hi: "श्री नावेद",              ur: "مسٹر نوید" },
  "Mr. Ram Pratap Mishra":     { hi: "श्री राम प्रताप मिश्रा",  ur: "مسٹر رام پرتاپ مشرا" },
  "Mr. Adil Waris":            { hi: "श्री आदिल वारिस",         ur: "مسٹر عادل وارث" },
  "Mr. Mushtaq":               { hi: "श्री मुश्ताक़",           ur: "مسٹر مشتاق" },
  "Mr. Talha Mehmood":         { hi: "श्री तलहा महमूद",         ur: "مسٹر طلحہ محمود" },
  "Mr. Ram Pratap Mishra (C)": { hi: "श्री राम प्रताप मिश्रा (गाय)", ur: "مسٹر رام پرتاپ مشرا (گائے)" },
  "Mr. Suyagya Sharma":        { hi: "श्री सुयग्य शर्मा",       ur: "مسٹر سویگیہ شرما" },
  "Banki Neighbour 3":         { hi: "बांकी पड़ोसी 3",          ur: "بانکی پڑوسی 3" },
  "Mr. Sanjay":                { hi: "श्री संजय",               ur: "مسٹر سنجے" },
};

function customerName(name, lang) {
  if (lang === "en") return name;
  return (CUSTOMER_NAMES[name] && CUSTOMER_NAMES[name][lang]) || name;
}

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
  { name: "Mr. Guddu (Station)",    phone: "",           type: "B" },
  { name: "Mr. Umair Kidwai",       phone: "",           type: "B" },
  { name: "Mr. Umar Faiz Kidwai",   phone: "9389874362", type: "B" },
  { name: "Mr. Rizwan",             phone: "",           type: "B" },
  { name: "Mr. Faisal",             phone: "",           type: "B" },
  { name: "Mr. Danish",             phone: "",           type: "B" },
  { name: "Mr. Chanda",             phone: "",           type: "B" },
  { name: "Mr. Syed Athar",         phone: "",           type: "B" },
  { name: "Mr. Adnan Abbasi",       phone: "7897692769", type: "B" },
  { name: "Mr. Haneef",             phone: "",           type: "B" },
  { name: "Mr. Aleem Kidwai",       phone: "",           type: "B" },
  { name: "Mr. Shaad Kidwai",       phone: "",           type: "B" },
  { name: "Mr. Razzaki",            phone: "",           type: "B" },
  { name: "Mr. Abrar",              phone: "",           type: "B" },
  { name: "Mr. Shivam Gupta",       phone: "",           type: "B" },
  { name: "Mr. Santosh",            phone: "",           type: "B" },
  { name: "Mr. Satish Kumar",       phone: "",           type: "B", selfCollect: true },
  { name: "Mr. Salauddin",          phone: "",           type: "C" },
  { name: "Mr. Soni (Adv.)",        phone: "",           type: "C" },
  { name: "Mr. Santosh (C)",        phone: "",           type: "C" },
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
  { name: "Banki Neighbour 3",         phone: "", type: "C", selfCollect: true },
  { name: "Mr. Sanjay",                phone: "", type: "C", selfCollect: true },
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────
function today() { return new Date().toISOString().split("T")[0]; }
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
async function apiPost(action,data={}) {
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

// ─── LANGUAGE TOGGLE ───────────────────────────────────────────────────────
function LangToggle({lang,setLang}) {
  return (
    <div style={{display:"flex",gap:4,background:"#f1f5f9",borderRadius:20,padding:3}}>
      {Object.entries(LANGS).map(([key,label])=>(
        <button key={key} onClick={()=>setLang(key)} style={{
          padding:"4px 10px",borderRadius:16,border:"none",cursor:"pointer",
          background:lang===key?"#2d6a4f":"transparent",
          color:lang===key?"#fff":"#666",
          fontSize:12,fontWeight:700,fontFamily:"inherit",
          transition:"all 0.15s"
        }}>{label}</button>
      ))}
    </div>
  );
}

// ─── LOGIN ─────────────────────────────────────────────────────────────────
function LoginScreen({onLogin,lang,setLang}) {
  const t=TR[lang];
  const ROLES_DATA = [
    {key:"supervisor",emoji:"🧑‍🌾",color:"#2d6a4f",label:t.roleSupervisor,desc:t.roleSupDesc},
    {key:"delivery",  emoji:"🚚",  color:"#1d3557",label:t.roleDelivery,  desc:t.roleDelDesc},
    {key:"owner",     emoji:"👑",  color:"#7b2d00",label:t.roleOwner,     desc:t.roleOwnDesc},
  ];
  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(160deg,#e9f5ee 0%,#f8fafc 60%)",display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{width:"100%",maxWidth:380}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:20}}>
          <LangToggle lang={lang} setLang={setLang}/>
        </div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:52,marginBottom:8}}>🐄</div>
          <div style={{fontFamily:"Georgia,serif",fontSize:26,fontWeight:700,color:"#1a1a1a"}}>{t.appName}</div>
          <div style={{color:"#666",marginTop:5,fontSize:13}}>{t.selectRole}</div>
        </div>
        <Card>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {ROLES_DATA.map(r=>(
              <button key={r.key} onClick={()=>onLogin(r.key)} style={{display:"flex",alignItems:"center",gap:13,padding:"14px 16px",borderRadius:11,border:"1.5px solid #e2e8f0",background:"#fafafa",cursor:"pointer",textAlign:"left",width:"100%",fontFamily:"inherit"}}
                onMouseEnter={e=>{e.currentTarget.style.background="#f0fdf4";e.currentTarget.style.borderColor=r.color;}}
                onMouseLeave={e=>{e.currentTarget.style.background="#fafafa";e.currentTarget.style.borderColor="#e2e8f0";}}>
                <span style={{fontSize:26}}>{r.emoji}</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#1a1a1a"}}>{r.label}</div>
                  <div style={{fontSize:12,color:"#888",marginTop:1}}>{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </Card>
        <div style={{textAlign:"center",marginTop:18,fontSize:11,color:"#aaa"}}>{t.appName} · {t.appSub}</div>
      </div>
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
        <SectionLabel color="#92400e">{t.buffalo}</SectionLabel>
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

      <div style={{background:"#eff6ff",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#1d4ed8">{t.cow}</SectionLabel>
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

      <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#555">{t.measuredTotals}</SectionLabel>
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
            <div style={{fontSize:11,color:"#1d4ed8",fontWeight:600,marginBottom:4}}>{t.cTotal}</div>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={measuredC||""} onChange={e=>setMeasuredC(e.target.value)}
              style={{width:"100%",padding:"8px 10px",border:"1.5px solid #bfdbfe",borderRadius:8,fontSize:14,textAlign:"center",background:"#fff",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}}/>
            {measCNet!==null&&<div style={{fontSize:11,marginTop:3,textAlign:"center",fontWeight:600,color:Math.abs(measCNet-cLtrs)>0.2?"#dc2626":"#15803d"}}>
              {fmtN(measCNet,2)} L {Math.abs(measCNet-cLtrs)>0.2?t.mismatch:t.matches}
            </div>}
          </div>
        </div>
      </div>

      <div style={{background:"#f8fafc",borderRadius:10,padding:"12px 14px",marginBottom:12}}>
        <SectionLabel color="#555">{t.outsideMilk}</SectionLabel>
        <div style={{marginBottom:10}}>
          <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>{t.purchased}</div>
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
          <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:6}}>{t.extraMilk}</div>
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
                  style={{width:14,height:14,cursor:"pointer",accentColor:"#2d6a4f"}}/>
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

      <div style={{display:"flex",gap:8}}>
        <div style={{flex:1,background:"#fffbeb",border:"1px solid #fde68a",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#92400e",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>{t.buffalo}</div>
          <div style={{fontSize:20,fontWeight:700,color:"#92400e",marginTop:2}}>{fmtN(bLtrs,2)} L</div>
        </div>
        <div style={{flex:1,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#1d4ed8",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>{t.cow}</div>
          <div style={{fontSize:20,fontWeight:700,color:"#1d4ed8",marginTop:2}}>{fmtN(cLtrs,2)} L</div>
        </div>
        <div style={{flex:1,background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"10px 12px",textAlign:"center"}}>
          <div style={{fontSize:10,color:"#15803d",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.6px"}}>{t.total}</div>
          <div style={{fontSize:20,fontWeight:700,color:"#15803d",marginTop:2}}>{fmtN(slotTotal,2)} L</div>
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

  async function handleSubmit() {
    if(!date){setErrMsg(t.date);setStatus("error");return;}
    if(grandTotal===0){setErrMsg("0");setStatus("error");return;}
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
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{t.supTitle}</div>
        <div style={{color:"#888",fontSize:13,marginTop:2}}>{t.supSub}</div>
      </div>
      {status==="success"&&<Alert type="success">{t.savedProd} {fmtDate(date)} — {t.grandTotal}: {fmtN(grandTotal,2)} L</Alert>}
      {status==="error"&&<Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{marginBottom:14}}>
        <Input label={t.date} type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()}/>
        <div style={{display:"flex",gap:8}}>
          <StatBox label={t.morning} value={`${fmtN(mTotal,2)} L`} color="#f59e0b"/>
          <StatBox label={t.evening} value={`${fmtN(eTotal,2)} L`} color="#6366f1"/>
          <StatBox label={t.grandTotal} value={`${fmtN(grandTotal,2)} L`} color="#2d6a4f"/>
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
    const filtered=customers.filter(c=>c.type===type&&!c.selfCollect);
    let b075=0,b05=0,b1=0;
    filtered.forEach(c=>{
      const q=vals[c.name]; if(!q||q==="Nil") return;
      const qty=parseFloat(q);
      if(qty===0.75)                     { b075++; }
      else if(qty===0.5)                 { b05++; }
      else if(qty===1.5||qty===2.5)      { b05++; b1+=Math.floor(qty); }
      else if(qty===1||qty===2||qty===3) { b1+=qty; }
    });
    return {b075,b05,b1};
  }
  const b=calcBottles("B"); const c=calcBottles("C");
  const hasAny=customers.some(c=>vals[c.name]&&vals[c.name]!=="Nil");
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
    <div style={{marginTop:16,borderTop:"2px dashed #e2e8f0",paddingTop:14}}>
      <SectionLabel color="#374151">{t.bottlesToFill}</SectionLabel>
      <div style={{display:"flex",gap:10}}>
        <Col label={t.bufMilk} counts={b} color="#92400e" bg="#fffbeb" border="#fde68a"/>
        <Col label={t.cowMilk} counts={c} color="#1d4ed8" bg="#eff6ff" border="#bfdbfe"/>
      </div>
    </div>
  );
}

function CustomerRow({customer,value,onChange,prevValue,lang,t}) {
  const isB=customer.type==="B";
  const color=isB?"#92400e":"#1d4ed8";
  const bg=isB?"#fffbeb":"#eff6ff";
  const tagBg=isB?"#fde68a":"#bfdbfe";
  const displayName=customerName(customer.name,lang);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8,padding:"9px 0",borderBottom:"1px solid #f8fafc"}}>
      <div style={{flex:1,minWidth:0}}>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{fontSize:13,fontWeight:600,color:"#1a1a1a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{displayName}</div>
          {customer.selfCollect&&<span style={{fontSize:9,fontWeight:700,color:"#6b7280",background:"#f3f4f6",border:"1px solid #e5e7eb",borderRadius:4,padding:"1px 5px",flexShrink:0,textTransform:"uppercase",letterSpacing:"0.5px"}}>{t.self}</span>}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center",marginTop:1}}>
          {customer.phone&&<span style={{fontSize:11,color:"#aaa"}}>{customer.phone}</span>}
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

function DeliveryView({lang}) {
  const t=TR[lang];
  const [date,setDate]=useState(today());
  const [slot,setSlot]=useState("morning");
  const [mVals,setMVals]=useState({});
  const [eVals,setEVals]=useState({});
  const [prevData,setPrevData]=useState(null);
  const [status,setStatus]=useState(null);
  const [errMsg,setErrMsg]=useState("");

  useEffect(()=>{
    if(!date) return;
    const prev=new Date(date+"T00:00:00"); prev.setDate(prev.getDate()-1);
    const prevDateStr=prev.toISOString().split("T")[0];
    apiGet("getDispatchByDate",{date:prevDateStr}).then(d=>setPrevData(d)).catch(()=>setPrevData(null));
  },[date]);

  const customers=slot==="morning"?MORNING_CUSTOMERS:EVENING_CUSTOMERS;
  const vals=slot==="morning"?mVals:eVals;
  const setVals=slot==="morning"?setMVals:setEVals;
  const prevVals=prevData?(slot==="morning"?prevData.morning:prevData.evening):null;

  function totalLtrs(vs){return Object.values(vs).reduce((s,v)=>s+(v&&v!=="Nil"?parseFloat(v)||0:0),0);}
  const mTotal=totalLtrs(mVals); const eTotal=totalLtrs(eVals);

  async function handleSubmit() {
    if(!date){setErrMsg(t.date);setStatus("error");return;}
    if(mTotal+eTotal===0){setErrMsg(t.noDeliveries);setStatus("error");return;}
    setStatus("loading");
    try {
      const buildEntries=(custs,vs)=>custs.map(c=>({name:c.name,type:c.type,qty:vs[c.name]||"Nil"}));
      await apiPost("logDispatch",{date,
        morning:{entries:JSON.stringify(buildEntries(MORNING_CUSTOMERS,mVals)),total:mTotal},
        evening:{entries:JSON.stringify(buildEntries(EVENING_CUSTOMERS,eVals)),total:eTotal},
        grandTotal:mTotal+eTotal});
      setStatus("success"); setMVals({}); setEVals({});
    } catch(e){setErrMsg(e.message);setStatus("error");}
  }

  return (
    <div>
      <div style={{marginBottom:18}}>
        <div style={{fontSize:20,fontWeight:700,color:"#1a1a1a"}}>{t.delTitle}</div>
        <div style={{color:"#888",fontSize:13,marginTop:2}}>{t.delSub}</div>
      </div>
      {status==="success"&&<Alert type="success">{t.savedDel} {fmtDate(date)}!</Alert>}
      {status==="error"&&<Alert type="error">⚠️ {errMsg}</Alert>}

      <Card style={{marginBottom:14}}>
        <Input label={t.date} type="date" value={date} onChange={e=>setDate(e.target.value)} max={today()}/>
        <div style={{display:"flex",gap:8}}>
          <StatBox label={t.morning} value={`${fmtN(mTotal,2)} L`} color="#f59e0b"/>
          <StatBox label={t.evening} value={`${fmtN(eTotal,2)} L`} color="#6366f1"/>
        </div>
      </Card>

      <TabBar tabs={[{key:"morning",label:`☀️ ${t.morning}`},{key:"evening",label:`🌙 ${t.evening}`}]} active={slot} onChange={setSlot}/>

      <Card>
        <div style={{fontWeight:700,fontSize:13,color:"#555",marginBottom:12}}>
          {slot==="morning"?`☀️ ${t.morningCustomers}`:`🌙 ${t.eveningCustomers}`} ({customers.length})
        </div>
        {customers.map(c=>(
          <CustomerRow key={c.name} customer={c} value={vals[c.name]||""} onChange={v=>setVals(p=>({...p,[c.name]:v}))} prevValue={prevVals?prevVals[c.name]:null} lang={lang} t={t}/>
        ))}
        <BottleSummary customers={customers} vals={vals} t={t}/>
      </Card>

      <div style={{height:16}}/>
      <Btn onClick={handleSubmit} style={{width:"100%"}} disabled={status==="loading"}>
        {status==="loading"?t.saving:t.submitDel}
      </Btn>
    </div>
  );
}

// ─── OWNER DASHBOARD ───────────────────────────────────────────────────────
function OwnerDashboard({lang}) {
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

      <TabBar tabs={[{key:"overview",label:t.overview},{key:"daily",label:t.dailyLog},{key:"monthly",label:t.monthly}]} active={tab} onChange={setTab}/>

      {tab==="overview"&&(
        <div>
          <Card style={{marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,color:"#374151",marginBottom:12}}>{t.todaySnap}</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <StatBox label={t.produced} value={`${fmtN(summary.todayProduce||0,1)} L`} color="#2d6a4f"/>
              <StatBox label={t.dispatched} value={`${fmtN(summary.todayDispatched||0,1)} L`} color="#1d3557"/>
              <StatBox label={t.gap} value={`${fmtN(Math.abs(todayGap),1)} L`}
                sub={todayGap>0?t.surplus:todayGap<0?t.deficit:t.balanced}
                color={todayGap>=0?"#2d6a4f":"#dc2626"}/>
              <StatBox label={t.revToday} value={fmtRs(summary.todayRevenue||0)} color="#7b2d00"/>
            </div>
            {(summary.todayProduce||0)>0&&(
              <div style={{padding:"9px 13px",borderRadius:9,background:todayGap>=0?"#f0fdf4":"#fef2f2",color:todayGap>=0?"#15803d":"#dc2626",fontSize:13,fontWeight:600}}>
                {todayGap>=0?`${t.surplusMsg} ${fmtN(todayGap,1)} L`:`${t.deficitMsg} ${fmtN(Math.abs(todayGap),1)} L`}
              </div>
            )}
            {(summary.todayProduce||0)===0&&<div style={{color:"#aaa",fontSize:12}}>{t.noDataToday}</div>}
          </Card>

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            <StatBox label={t.produced30}   value={`${fmtN(summary.last30DaysProduce||0,0)} L`}   color="#2d6a4f"/>
            <StatBox label={t.dispatched30} value={`${fmtN(summary.last30DaysDispatched||0,0)} L`} color="#1d3557"/>
            <StatBox label={t.gap30} value={`${fmtN(Math.abs(gap30),0)} L`}
              sub={gap30>0?t.surplus:gap30<0?t.deficit:t.balanced} color={gap30>=0?"#2d6a4f":"#dc2626"}/>
            <StatBox label={t.rev30} value={fmtRs(summary.last30DaysRevenue||0)} color="#7b2d00"/>
          </div>

          <Card>
            <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:"#374151"}}>{t.settings}</div>
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
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:14}}>{t.recentRecords}</div>
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
                      <td style={{padding:"7px",fontWeight:600,color:"#374151"}}>{fmtDate(row.date)}</td>
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
          <div style={{fontWeight:700,fontSize:13,color:"#374151",marginBottom:14}}>{t.monthlySummary}</div>
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
    </div>
  );
}

// ─── APP SHELL ─────────────────────────────────────────────────────────────
export default function App() {
  const [role,setRole]=useState(null);
  const [lang,setLang]=useState(()=>{
    try { return localStorage.getItem("dairyLang")||"en"; } catch(e){ return "en"; }
  });

  function changeLang(l) {
    setLang(l);
    try { localStorage.setItem("dairyLang",l); } catch(e){}
  }

  const t=TR[lang];
  const ROLES_META = {
    supervisor:{label:t.roleSupervisor,emoji:"🧑‍🌾",color:"#2d6a4f"},
    delivery:  {label:t.roleDelivery,  emoji:"🚚",  color:"#1d3557"},
    owner:     {label:t.roleOwner,     emoji:"👑",  color:"#7b2d00"},
  };

  if(!role) return <LoginScreen onLogin={setRole} lang={lang} setLang={changeLang}/>;

  const r=ROLES_META[role];
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
          <LangToggle lang={lang} setLang={changeLang}/>
          <span style={{background:r.color+"18",color:r.color,border:`1px solid ${r.color}33`,borderRadius:20,padding:"3px 10px",fontSize:12,fontWeight:600}}>{r.emoji} {r.label}</span>
          <button onClick={()=>setRole(null)} style={{background:"none",border:"none",color:"#aaa",cursor:"pointer",fontSize:12}}>{t.switchBtn}</button>
        </div>
      </div>
      <div style={{maxWidth:520,margin:"0 auto",padding:"18px 15px 48px"}}>
        {role==="supervisor"&&<SupervisorView lang={lang}/>}
        {role==="delivery"&&<DeliveryView lang={lang}/>}
        {role==="owner"&&<OwnerDashboard lang={lang}/>}
      </div>
    </div>
  );
}
