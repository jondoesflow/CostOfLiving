import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell
} from "recharts";
import {
  ShoppingCart, Zap, Home, Phone, Baby, CreditCard,
  ChevronDown, ChevronRight, ExternalLink, CheckCircle,
  AlertCircle, Info, ArrowRight, Users, Bus
} from "lucide-react";
import {
  AVG_WEEKLY_SPEND, AVG_WEEKLY_HOUSING, ENERGY_BILLS_ANNUAL,
  BOE_BASE_RATE, INCOME_PRESSURE_PERCENTILE,
  FALLBACK_FOOD_INFLATION, FALLBACK_RENTAL,
  getRelevantSupport, getRelevantActions
} from "./data/staticData";
import {
  fetchFoodInflation, fetchRentalIndex, fetchEarningsGrowth, lookupPostcode
} from "./api/fetchLiveData";

const ICON_MAP = { ShoppingCart, Zap, Home, Phone, Baby, CreditCard, Bus };

function calculatePressureScore(profile) {
  let score = 30;
  const ip = { "Under £1,000":40,"£1,000–£1,750":28,"£1,750–£2,500":16,"£2,500–£3,500":8,"Over £3,500":0,"Prefer not to say":15 };
  score += ip[profile.incomeBand] ?? 15;
  if (profile.tenure === "Renting privately") score += 15;
  if (profile.tenure === "Own with a mortgage") score += 10;
  score += profile.children * 5;
  return Math.min(score, 95);
}

function getPressureLabel(s) {
  if (s <= 30) return "Lower pressure";
  if (s <= 50) return "Moderate pressure";
  if (s <= 70) return "Significant pressure";
  return "High pressure";
}

function getPressureColor(s) {
  if (s <= 30) return "#2d6a4f";
  if (s <= 50) return "#e8703a";
  return "#c8500a";
}

function buildHouseholdLabel(p) {
  const a = p.adults === 1 ? "a single adult" : `${p.adults} adults`;
  const k = p.children === 0 ? "" : p.children === 1 ? " with 1 child" : ` with ${p.children} children`;
  const l = p.region ? ` in ${p.region}` : "";
  return `${a}${k}${l}`;
}

function getSpendKey(p) { return `${Math.min(p.adults,3)}_${Math.min(p.children,3)}`; }

function getComparisonPct(p) {
  let pct = INCOME_PRESSURE_PERCENTILE[p.incomeBand] ?? 50;
  if (p.children > 0) pct = Math.min(pct + 8, 95);
  if (p.tenure === "Renting privately") pct = Math.min(pct + 5, 95);
  return pct;
}

function getPressureBullets(p) {
  const b = [];
  if (["Under £1,000","£1,000–£1,750","£1,750–£2,500"].includes(p.incomeBand))
    b.push("Your household is in the income band most affected by food and energy price rises.");
  if (p.tenure === "Renting privately")
    b.push("Private renters have seen average rents rise 9.2% in the past year — the fastest increase since records began.");
  if (p.tenure === "Own with a mortgage")
    b.push("Mortgage holders refinancing today face rates around 4.5% — up from under 2% in 2021.");
  if (p.children > 0)
    b.push(`Households with children spend an estimated £${(p.children*47)} more per week on food than those without.`);
  if (p.worries.includes("Energy bills (gas/electric)"))
    b.push("Average household energy bills are still 54% higher than they were in 2019, even after falling from the 2022 peak.");
  if (b.length === 0)
    b.push("Cost of living pressures affect households differently depending on income, housing, and family size.");
  return b.slice(0, 3);
}

const fmt = (v) => `£${Number(v).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtPct = (v) => `${Number(v).toFixed(1)}%`;

// ============================================================
// SETUP PHASE COMPONENTS
// ============================================================

function ProgressDots({ step }) {
  return (
    <div className="flex justify-center gap-3 mb-8">
      {[1, 2, 3].map((s) => (
        <div key={s} className={`w-3 h-3 rounded-full transition-all ${s === step ? "bg-navy scale-110" : s < step ? "bg-relief" : "bg-gray-300"}`} />
      ))}
    </div>
  );
}

function SetupStep1({ profile, onChange }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      <p className="text-gray-600 text-lg">Tell us a bit about your household so we can personalise the numbers.</p>

      <div>
        <label className="block font-semibold text-gray-700 mb-1">Postcode <span className="text-gray-400 font-normal text-sm">(optional — used for regional context only)</span></label>
        <input type="text" placeholder="e.g. SW1A 1AA" value={profile.postcode}
          onChange={(e) => onChange({ postcode: e.target.value.toUpperCase() })}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-base focus:border-navy focus:ring-1 focus:ring-navy" />
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">Number of adults in your household</label>
        <div className="flex gap-3">
          {[1, 2, 3].map((n) => (
            <button key={n} onClick={() => onChange({ adults: n })}
              className={`flex-1 py-3 rounded-lg font-semibold text-base transition-all ${profile.adults === n ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
              {n === 3 ? "3+" : n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">Do you have children living at home?</label>
        <div className="grid grid-cols-2 gap-3">
          {[{ label: "No", val: 0 }, { label: "Yes — 1 child", val: 1 }, { label: "Yes — 2 children", val: 2 }, { label: "Yes — 3 or more", val: 3 }].map((o) => (
            <button key={o.val} onClick={() => onChange({ children: o.val })}
              className={`py-3 px-4 rounded-lg text-sm font-medium transition-all ${profile.children === o.val ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">What best describes your housing situation?</label>
        <div className="grid grid-cols-1 gap-2">
          {["Renting privately","Renting from council or housing association","Own with a mortgage","Own outright","Living with family","Other"].map((t) => (
            <button key={t} onClick={() => onChange({ tenure: t })}
              className={`py-3 px-4 rounded-lg text-sm font-medium text-left transition-all ${profile.tenure === t ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupStep2({ profile, onChange }) {
  const benefits = ["Universal Credit","Child Benefit","Housing Benefit","Pension Credit","Other benefits","No, I don't receive benefits"];
  return (
    <div className="space-y-6 animate-fade-in-up">
      <p className="text-gray-600 text-lg">We don't need exact figures. Rough ranges help us show you the most relevant information and support.</p>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">Approximate combined household income (after tax, per month)</label>
        <div className="grid grid-cols-1 gap-2">
          {["Under £1,000","£1,000–£1,750","£1,750–£2,500","£2,500–£3,500","Over £3,500","Prefer not to say"].map((b) => (
            <button key={b} onClick={() => onChange({ incomeBand: b })}
              className={`py-3 px-4 rounded-lg text-sm font-medium text-left transition-all ${profile.incomeBand === b ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">Are you currently receiving any benefits?</label>
        <div className="grid grid-cols-1 gap-2">
          {benefits.map((b) => {
            const checked = profile.benefits.includes(b);
            return (
              <button key={b} onClick={() => {
                if (b === "No, I don't receive benefits") { onChange({ benefits: [b] }); return; }
                const next = checked ? profile.benefits.filter((x) => x !== b) : [...profile.benefits.filter((x) => x !== "No, I don't receive benefits"), b];
                onChange({ benefits: next });
              }}
                className={`py-3 px-4 rounded-lg text-sm font-medium text-left transition-all flex items-center gap-2 ${checked ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-white bg-white" : "border-gray-400"}`}>
                  {checked && <CheckCircle size={14} className="text-navy" />}
                </span>
                {b}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block font-semibold text-gray-700 mb-2">Employment status</label>
        <div className="grid grid-cols-2 gap-2">
          {["Employed full-time","Employed part-time","Self-employed","Unemployed","Retired","Full-time carer","Student"].map((s) => (
            <button key={s} onClick={() => onChange({ employmentStatus: s })}
              className={`py-3 px-4 rounded-lg text-sm font-medium text-left transition-all ${profile.employmentStatus === s ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SetupStep3({ profile, onChange }) {
  const worries = ["Food and grocery costs","Energy bills (gas/electric)","Rent or mortgage payments","Childcare costs","Transport / getting to work","Debt and credit repayments","I'm managing fine, just curious"];
  return (
    <div className="space-y-6 animate-fade-in-up">
      <p className="text-gray-600 text-lg">What's feeling most squeezed right now? Select all that apply.</p>
      <div className="grid grid-cols-1 gap-2">
        {worries.map((w) => {
          const checked = profile.worries.includes(w);
          return (
            <button key={w} onClick={() => {
              if (w === "I'm managing fine, just curious") { onChange({ worries: [w] }); return; }
              const next = checked ? profile.worries.filter((x) => x !== w) : [...profile.worries.filter((x) => x !== "I'm managing fine, just curious"), w];
              onChange({ worries: next });
            }}
              className={`py-3 px-4 rounded-lg text-sm font-medium text-left transition-all flex items-center gap-2 ${checked ? "bg-navy text-white" : "bg-white border border-gray-300 text-gray-700 hover:border-navy"}`}>
              <span className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-white bg-white" : "border-gray-400"}`}>
                {checked && <CheckCircle size={14} className="text-navy" />}
              </span>
              {w}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// RESULTS PHASE COMPONENTS
// ============================================================

function PressureGauge({ score }) {
  const color = getPressureColor(score);
  const label = getPressureLabel(score);
  return (
    <div className="mb-6">
      <div className="flex justify-between text-sm text-gray-500 mb-1">
        <span>Lower pressure</span><span>Higher pressure</span>
      </div>
      <div className="w-full h-5 bg-gray-200 rounded-full overflow-hidden" role="progressbar" aria-label={`Pressure score: ${score} out of 100`} aria-valuenow={score} aria-valuemin={0} aria-valuemax={100}>
        <div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${score}%`, background: `linear-gradient(90deg, #2d6a4f, ${color})` }} />
      </div>
      <div className="mt-2 text-center">
        <span className="font-heading text-2xl font-bold" style={{ color }}>{score}</span>
        <span className="text-gray-500 text-sm ml-2">/ 100 — {label}</span>
      </div>
    </div>
  );
}

function BillCompareRow({ icon: IconName, label, avgAmount, comparison, onCompare }) {
  const Icon = typeof IconName === "string" ? ICON_MAP[IconName] || Info : IconName;
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center"><Icon size={20} className="text-navy" /></div>
        <div className="flex-1"><span className="font-semibold text-gray-800">{label}</span></div>
        <span className="font-heading text-lg font-bold text-navy tabular-nums">{fmt(avgAmount)}<span className="text-xs text-gray-500 font-body">/wk</span></span>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-2">How does your spending compare to the UK average for households like yours?</p>
        <div className="flex gap-2">
          {["Less", "About the same", "More"].map((opt) => (
            <button key={opt} onClick={() => onCompare(opt)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${comparison === opt ? (opt === "More" ? "bg-warning text-white" : opt === "Less" ? "bg-relief text-white" : "bg-navy text-white") : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {opt}
            </button>
          ))}
        </div>
        {comparison === "More" && (
          <div className="mt-3 bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 flex gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>You might be spending more than typical. Scroll down for tips that could help reduce this cost.</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DotGrid({ highlightPct }) {
  const total = 100;
  const highlighted = Math.round(highlightPct);
  return (
    <div className="flex flex-wrap gap-1.5 justify-center max-w-xs mx-auto" role="img" aria-label={`${highlighted} out of 100 households under greater pressure`}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-sm transition-all ${i < highlighted ? "bg-accent" : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

function SupportCard({ item }) {
  return (
    <div className={`bg-white rounded-xl p-5 shadow-sm border-l-4 ${item.highlight ? "border-relief bg-green-50" : "border-relief"}`}>
      <h4 className="font-heading text-lg font-bold text-navy mb-1">{item.title}</h4>
      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
      <p className="text-sm text-gray-700 mb-3"><strong>You may be eligible if:</strong> {item.eligibility}</p>
      <div className="flex items-center justify-between">
        <a href={item.url} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-navy text-white text-sm font-semibold px-4 py-2.5 rounded-lg hover:bg-opacity-90 transition-all min-h-[44px]">
          Check if you qualify <ExternalLink size={14} />
        </a>
        <span className="text-xs text-gray-400">Shown because: {item.reason}</span>
      </div>
    </div>
  );
}

function ActionAccordion({ action, expanded, onToggle }) {
  const Icon = ICON_MAP[action.icon] || Info;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left min-h-[44px]" aria-expanded={expanded}>
        <div className="w-10 h-10 rounded-lg bg-cream flex items-center justify-center flex-shrink-0"><Icon size={20} className="text-navy" /></div>
        <span className="flex-1 font-semibold text-gray-800 text-sm">{action.title}</span>
        {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 animate-fade-in-up">
          <p className="text-sm text-gray-600 mb-3 ml-13">{action.detail}</p>
          {action.link && (
            <a href={action.link} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-navy font-semibold hover:underline ml-13">
              Learn more <ExternalLink size={12} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return <div className="w-full h-64 loading-shimmer rounded-xl" />;
}

function DataNote({ live, source }) {
  return (
    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
      <Info size={10} />
      {live ? `Source: ${source}` : `Using published figures (live data unavailable). Source: ${source}`}
    </p>
  );
}

// ============================================================
// CHART TOOLTIP
// ============================================================

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-800 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="tabular-nums">{p.name}: {typeof p.value === "number" ? (p.dataKey === "bill" ? fmt(p.value) : fmtPct(p.value)) : p.value}</p>
      ))}
    </div>
  );
}

// ============================================================
// MAIN APP COMPONENT
// ============================================================

export default function App() {
  const [phase, setPhase] = useState("setup");
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    postcode: "", region: "", adults: 1, children: 0,
    tenure: "", incomeBand: "", benefits: [],
    employmentStatus: "", worries: [],
  });

  // Live data state
  const [foodInflation, setFoodInflation] = useState(null);
  const [rentalData, setRentalData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [apiStatus, setApiStatus] = useState({ food: "idle", rental: "idle", earnings: "idle" });
  const [billComparisons, setBillComparisons] = useState({});
  const [expandedAction, setExpandedAction] = useState(null);
  const [postcodeLoading, setPostcodeLoading] = useState(false);
  const [postcodeError, setPostcodeError] = useState("");

  const updateProfile = useCallback((partial) => {
    setProfile((prev) => ({ ...prev, ...partial }));
  }, []);

  // Postcode lookup on blur
  const handlePostcodeLookup = useCallback(async () => {
    if (!profile.postcode || profile.postcode.length < 5) return;
    setPostcodeLoading(true);
    setPostcodeError("");
    try {
      const result = await lookupPostcode(profile.postcode);
      if (result) {
        setProfile((prev) => ({ ...prev, region: result.region }));
      } else {
        setPostcodeError("We couldn't find that postcode. You can skip this — it's optional.");
      }
    } catch {
      setPostcodeError("Couldn't look up postcode right now. You can skip this.");
    }
    setPostcodeLoading(false);
  }, [profile.postcode]);

  // Fetch live data when entering results
  useEffect(() => {
    if (phase !== "results") return;

    const loadFood = async () => {
      setApiStatus((s) => ({ ...s, food: "loading" }));
      try {
        const data = await fetchFoodInflation();
        if (data.length > 0) { setFoodInflation(data); setApiStatus((s) => ({ ...s, food: "ok" })); }
        else { setFoodInflation(FALLBACK_FOOD_INFLATION); setApiStatus((s) => ({ ...s, food: "fallback" })); }
      } catch { setFoodInflation(FALLBACK_FOOD_INFLATION); setApiStatus((s) => ({ ...s, food: "fallback" })); }
    };

    const loadRental = async () => {
      if (!["Renting privately"].includes(profile.tenure)) return;
      setApiStatus((s) => ({ ...s, rental: "loading" }));
      try {
        const data = await fetchRentalIndex();
        if (data.length > 0) { setRentalData(data); setApiStatus((s) => ({ ...s, rental: "ok" })); }
        else { setRentalData(FALLBACK_RENTAL); setApiStatus((s) => ({ ...s, rental: "fallback" })); }
      } catch { setRentalData(FALLBACK_RENTAL); setApiStatus((s) => ({ ...s, rental: "fallback" })); }
    };

    const loadEarnings = async () => {
      setApiStatus((s) => ({ ...s, earnings: "loading" }));
      try {
        const data = await fetchEarningsGrowth();
        if (data.length > 0) { setEarningsData(data); setApiStatus((s) => ({ ...s, earnings: "ok" })); }
        else { setApiStatus((s) => ({ ...s, earnings: "fallback" })); }
      } catch { setApiStatus((s) => ({ ...s, earnings: "fallback" })); }
    };

    loadFood();
    loadRental();
    loadEarnings();
  }, [phase, profile.tenure]);

  const pressureScore = calculatePressureScore(profile);
  const bullets = getPressureBullets(profile);
  const support = getRelevantSupport(profile);
  const actions = getRelevantActions(profile);
  const spendKey = getSpendKey(profile);
  const spendData = AVG_WEEKLY_SPEND[spendKey] || AVG_WEEKLY_SPEND["2_0"];
  const housingCost = AVG_WEEKLY_HOUSING[profile.tenure] || 0;
  const totalWeekly = spendData.food + spendData.energy + spendData.transport + spendData.comms + housingCost;
  const compPct = getComparisonPct(profile);
  const showFood = profile.worries.includes("Food and grocery costs") || profile.worries.length === 0 || profile.worries.includes("I'm managing fine, just curious");
  const showEnergy = profile.worries.includes("Energy bills (gas/electric)") || profile.worries.length === 0 || profile.worries.includes("I'm managing fine, just curious");
  const showHousing = ["Renting privately", "Own with a mortgage"].includes(profile.tenure);

  const goToResults = () => {
    if (profile.postcode && !profile.region) handlePostcodeLookup();
    setPhase("results");
    window.scrollTo(0, 0);
  };

  // ============================================================
  // RENDER — SETUP PHASE
  // ============================================================
  if (phase === "setup") {
    return (
      <div className="min-h-screen bg-cream">
        <div className="max-w-[680px] mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl md:text-4xl font-bold text-navy mb-2">What's the Squeeze?</h1>
            <p className="text-gray-500 text-lg">A personal cost of living tool for UK households</p>
          </div>

          <ProgressDots step={step} />

          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-100">
            {step === 1 && <SetupStep1 profile={profile} onChange={updateProfile} />}
            {step === 2 && <SetupStep2 profile={profile} onChange={updateProfile} />}
            {step === 3 && <SetupStep3 profile={profile} onChange={updateProfile} />}

            {profile.region && step === 1 && (
              <div className="mt-3 flex items-center gap-2 text-sm text-relief">
                <CheckCircle size={14} /> Region detected: {profile.region}
              </div>
            )}
            {postcodeError && step === 1 && (
              <div className="mt-3 text-sm text-warning">{postcodeError}</div>
            )}
            {postcodeLoading && step === 1 && (
              <div className="mt-3 text-sm text-gray-400">Looking up postcode...</div>
            )}

            <div className="flex gap-3 mt-8">
              {step > 1 && (
                <button onClick={() => setStep((s) => s - 1)}
                  className="px-6 py-3 rounded-lg border border-gray-300 text-gray-600 font-semibold text-base hover:bg-gray-50 transition-all min-h-[48px]">
                  Back
                </button>
              )}
              {step < 3 ? (
                <button onClick={() => { if (step === 1 && profile.postcode) handlePostcodeLookup(); setStep((s) => s + 1); }}
                  className="flex-1 py-3 rounded-lg bg-navy text-white font-semibold text-base hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 min-h-[48px]">
                  Continue <ArrowRight size={18} />
                </button>
              ) : (
                <button onClick={goToResults}
                  className="flex-1 py-3 rounded-lg bg-navy text-white font-semibold text-base hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 min-h-[48px]">
                  See my results <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">Your answers are not stored or sent anywhere. This is a local calculation only.</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER — RESULTS PHASE
  // ============================================================
  return (
    <div className="min-h-screen bg-cream">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[680px] mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <span className="text-sm text-gray-500">Results for </span>
            <span className="text-sm font-semibold text-navy">{buildHouseholdLabel(profile)}</span>
          </div>
          <button onClick={() => { setPhase("setup"); setStep(1); }}
            className="text-sm text-navy font-semibold hover:underline min-h-[44px] min-w-[44px] flex items-center">
            Edit
          </button>
        </div>
      </div>

      <div className="max-w-[680px] mx-auto px-4 py-8 space-y-10">

        {/* Section 1: Pressure Score */}
        <section className="animate-fade-in-up">
          <h2 className="font-heading text-2xl font-bold text-navy mb-1">Your Pressure Score</h2>
          <p className="text-gray-500 text-sm mb-6">An at-a-glance estimate based on what you've told us</p>
          <PressureGauge score={pressureScore} />
          <div className="space-y-3 mt-6">
            {bullets.map((b, i) => (
              <div key={i} className="flex gap-3 items-start bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <AlertCircle size={16} className="text-accent mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{b}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: How Your Bills Compare */}
        <section className="animate-fade-in-up delay-100">
          <h2 className="font-heading text-2xl font-bold text-navy mb-1">How Your Bills Compare</h2>
          <p className="text-gray-500 text-sm mb-6">UK averages for households similar to yours</p>
          <div className="space-y-4">
            <BillCompareRow icon={ShoppingCart} label="Food & groceries" avgAmount={spendData.food}
              comparison={billComparisons.food} onCompare={(v) => setBillComparisons((p) => ({ ...p, food: v }))} />
            <BillCompareRow icon={Zap} label="Gas & electricity" avgAmount={spendData.energy}
              comparison={billComparisons.energy} onCompare={(v) => setBillComparisons((p) => ({ ...p, energy: v }))} />
            {housingCost > 0 && (
              <BillCompareRow icon={Home} label="Rent or mortgage" avgAmount={housingCost}
                comparison={billComparisons.housing} onCompare={(v) => setBillComparisons((p) => ({ ...p, housing: v }))} />
            )}
            <BillCompareRow icon={Bus} label="Transport" avgAmount={spendData.transport}
              comparison={billComparisons.transport} onCompare={(v) => setBillComparisons((p) => ({ ...p, transport: v }))} />
            <BillCompareRow icon={Phone} label="Phone & broadband" avgAmount={spendData.comms}
              comparison={billComparisons.comms} onCompare={(v) => setBillComparisons((p) => ({ ...p, comms: v }))} />
          </div>
          <div className="bg-navy rounded-xl p-4 mt-4 text-center">
            <p className="text-cream text-sm">Estimated total weekly household spend</p>
            <p className="font-heading text-3xl font-bold text-white tabular-nums mt-1">{fmt(totalWeekly)}</p>
            <p className="text-cream text-xs mt-1 opacity-70">Based on UK averages for your household type</p>
          </div>
          <DataNote live={false} source="ONS Family Spending in the UK, FYE 2024" />
        </section>

        {/* Section 3: What's Driven Your Bills Up */}
        <section className="animate-fade-in-up delay-200">
          <h2 className="font-heading text-2xl font-bold text-navy mb-1">What's Driven Your Bills Up</h2>
          <p className="text-gray-500 text-sm mb-6">The story behind the numbers, based on what concerns you most</p>

          {showFood && (
            <div className="mb-8">
              <h3 className="font-heading text-lg font-bold text-navy mb-3">Food prices</h3>
              {apiStatus.food === "loading" ? <LoadingSkeleton /> : foodInflation ? (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={foodInflation} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                      <Tooltip content={<CustomTooltip />} />
                      <ReferenceLine x="Mar 23" stroke="#c8500a" strokeDasharray="5 5" label={{ value: "Peak: 19.2%", fill: "#c8500a", fontSize: 11 }} />
                      <Line type="monotone" dataKey="value" name="Food inflation" stroke="#e8703a" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <DataNote live={apiStatus.food === "ok"} source="ONS CPIH Food & Non-Alcoholic Beverages" />
                </div>
              ) : null}
              <div className="bg-cream border border-gray-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-gray-700">In plain terms: a weekly food shop that cost £80 in January 2021 would have cost around £99 by early 2023 — a rise of nearly £20 for the same basket of goods. Prices have eased since then, but haven't fallen back.</p>
              </div>
            </div>
          )}

          {showEnergy && (
            <div className="mb-8">
              <h3 className="font-heading text-lg font-bold text-navy mb-3">Energy bills</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={ENERGY_BILLS_ANNUAL} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="year" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `£${v}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="bill" name="Annual energy bill" radius={[4, 4, 0, 0]}>
                      {ENERGY_BILLS_ANNUAL.map((entry) => (
                        <Cell key={entry.year} fill={entry.year === "2022" || entry.year === "2023" ? "#c8500a" : "#1d3461"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <DataNote live={false} source="Ofgem, DESNZ annual fuel poverty statistics" />
              </div>
              <div className="bg-cream border border-gray-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-gray-700">The energy price cap protects you from the very highest bills, but the 'cap' is still nearly twice what households paid in 2019. A typical household now spends around £161 a month on gas and electricity.</p>
              </div>
            </div>
          )}

          {showHousing && profile.tenure === "Renting privately" && (
            <div className="mb-8">
              <h3 className="font-heading text-lg font-bold text-navy mb-3">Rent costs</h3>
              {apiStatus.rental === "loading" ? <LoadingSkeleton /> : rentalData ? (
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={rentalData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} label={{ value: "Annual % increase", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="value" name="Rent increase" stroke="#1d3461" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  <DataNote live={apiStatus.rental === "ok"} source="ONS Index of Private Housing Rental Prices" />
                </div>
              ) : null}
              <div className="bg-cream border border-gray-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-gray-700">Private rents have risen faster than wages for most of the past two years. If you're renegotiating a tenancy, check Shelter's advice on your rights before agreeing to an increase.</p>
              </div>
            </div>
          )}

          {showHousing && profile.tenure === "Own with a mortgage" && (
            <div className="mb-8">
              <h3 className="font-heading text-lg font-bold text-navy mb-3">Mortgage rates</h3>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 overflow-x-auto">
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={BOE_BASE_RATE} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="stepAfter" dataKey="rate" name="Bank rate" stroke="#c8500a" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
                <DataNote live={false} source="Bank of England official bank rate" />
              </div>
              <div className="bg-cream border border-gray-200 rounded-xl p-4 mt-3">
                <p className="text-sm text-gray-700">If you remortgaged at today's rates, a £200,000 mortgage over 25 years would cost roughly £400 more per month than it did in 2021.</p>
              </div>
            </div>
          )}
        </section>

        {/* Section 4: Support You Might Be Missing */}
        <section className="animate-fade-in-up delay-300">
          <h2 className="font-heading text-2xl font-bold text-navy mb-1">Support You Might Be Missing</h2>
          <p className="text-gray-500 text-sm mb-6">Schemes and help you may be entitled to, based on what you've told us</p>
          <div className="space-y-4">
            {support.map((item, i) => <SupportCard key={i} item={item} />)}
          </div>
        </section>

        {/* Section 5: How You Compare */}
        <section className="animate-fade-in-up delay-400">
          <h2 className="font-heading text-2xl font-bold text-navy mb-1">How You Compare</h2>
          <p className="text-gray-500 text-sm mb-6">Where your household sits nationally</p>
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
            <DotGrid highlightPct={compPct} />
            <p className="text-sm text-gray-700 mt-4">
              Based on your household type and income band, roughly <strong className="text-navy">{Math.round(compPct / 10)} in 10</strong> UK households are likely under greater financial pressure than yours right now.
            </p>
            <p className="text-xs text-gray-400 mt-3">This is based on ONS income distribution data (FY2024) and does not account for individual circumstances like debt, health costs, or recent job changes.</p>
          </div>
        </section>

        {/* Section 6: Small Steps That Add Up */}
        <section className="animate-fade-in-up delay-500">
          <h2 className="font-heading text-2xl font-bold text-navy mb-1">Small Steps That Add Up</h2>
          <p className="text-gray-500 text-sm mb-6">Practical actions you can take this week</p>
          <div className="space-y-3">
            {actions.map((action, i) => (
              <ActionAccordion key={i} action={action} expanded={expandedAction === i}
                onToggle={() => setExpandedAction(expandedAction === i ? null : i)} />
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
          <h3 className="font-heading text-lg font-bold text-navy">Need to talk to someone?</h3>
          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold">Citizens Advice</p>
              <p>Free, impartial advice on benefits, debt, housing and employment.</p>
              <p>Call 0800 144 8848 (free) or <a href="https://www.citizensadvice.org.uk" target="_blank" rel="noopener noreferrer" className="text-navy font-semibold hover:underline">citizensadvice.org.uk</a></p>
            </div>
            <div>
              <p className="font-semibold">StepChange</p>
              <p>Free debt advice and a personal action plan.</p>
              <p>Call 0800 138 1111 or <a href="https://www.stepchange.org" target="_blank" rel="noopener noreferrer" className="text-navy font-semibold hover:underline">stepchange.org</a></p>
            </div>
            <div>
              <p className="font-semibold">Turn2Us</p>
              <p>Benefits calculator and grants search.</p>
              <p><a href="https://www.turn2us.org.uk" target="_blank" rel="noopener noreferrer" className="text-navy font-semibold hover:underline">turn2us.org.uk</a></p>
            </div>
          </div>
          <hr className="border-gray-200" />
          <p className="text-xs text-gray-400">
            This tool uses data from the Office for National Statistics, DESNZ, DWP, and Postcodes.io, all published under the Open Government Licence v3.0.
            Your answers are not stored or sent anywhere. This is a local calculation only.
          </p>
        </footer>

      </div>
    </div>
  );
}
