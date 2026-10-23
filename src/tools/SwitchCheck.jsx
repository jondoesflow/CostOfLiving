import { useState, useEffect, useMemo } from "react";
import { Upload, FileText, Car } from "lucide-react";
import { TARIFFS, SUPPLIERS, REFERENCE, pricingFor, economy7Slots, ukMinutes, currentSlotStart } from "../prices";
import { parseUsage, exampleUsage } from "../lib/usage";
import { findFlexibleLoad, energyCost } from "../lib/flexible";
import { pounds } from "../lib/format";
import { Card, StepTitle, Warning, Note, LiveSummary } from "../components/ui";
import ShareButton from "../components/ShareButton";

// Who each tariff is for, so a cheap result isn't misleading.
const ELIGIBILITY = {
  agile: "Needs a smart meter. Prices follow the wholesale market, so bills can jump during cold, still spells.",
  go: "For electric car owners, with a smart meter.",
  cosy: "For homes heated by a heat pump.",
  "edf-dynamic": "Needs a smart meter. Prices change daily with the wholesale market.",
  "edf-goelectric": "For electric car owners.",
  "eon-drive": "For electric car owners.",
  "eon-drive-smart": "For electric car owners with a compatible smart charger.",
  standard: "The price-capped standard tariff most people are on.",
};

const CANDIDATES = [...TARIFFS.filter((t) => t.supplier), REFERENCE];

function costOn(usage, priceAt, standingCharge, flexible) {
  const total = energyCost(usage, priceAt, flexible) + standingCharge * usage.days;
  return { total, yearly: (total / usage.days) * 365 };
}

export default function SwitchCheck({ elec }) {
  const { region, tariff, e7, flatOverride, apiFlatRate } = elec;
  const [usage, setUsage] = useState(null);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [results, setResults] = useState({ key: null, rows: [], state: "idle" });
  const [shift, setShift] = useState(true);

  function load(text, name) {
    try {
      setUsage(parseUsage(text));
      setFileName(name);
      setParseError("");
    } catch (e) {
      setUsage(null);
      setParseError(e.message);
    }
  }

  function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    file.text().then((text) => load(text, file.name));
  }

  const key = usage && region ? `${region}|${usage.from}|${usage.to}|${usage.total}` : null;
  useEffect(() => {
    if (!key) return;
    const ctrl = new AbortController();
    Promise.all(CANDIDATES.map((t) =>
      pricingFor(t.id, region, usage.from, usage.to, ctrl.signal)
        .then((p) => ({ tariff: t, priceAt: p.priceAt, standingCharge: p.standingCharge }))
        .catch((e) => (e.name === "AbortError" ? Promise.reject(e) : { tariff: t, error: true })),
    ))
      .then((rows) => setResults({ key, rows, state: "ready" }))
      .catch((e) => { if (e.name !== "AbortError") setResults({ key, rows: [], state: "error" }); });
    return () => ctrl.abort();
  }, [key, region, usage]);

  // Car charging (or similar) found in the file; when it's significant and the
  // option is on, each tariff gets it re-timed into its own cheapest hours.
  const flexibleLoad = useMemo(() => (usage ? findFlexibleLoad(usage) : null), [usage]);
  const moveCharging = Boolean(flexibleLoad?.significant && shift);
  const priced = useMemo(
    () => results.rows.map((r) => (r.error ? r : { ...r, ...costOn(usage, r.priceAt, r.standingCharge, moveCharging ? flexibleLoad : null) })),
    [results.rows, usage, moveCharging, flexibleLoad],
  );

  // The user's own tariff when it isn't one we can look up: priced from what
  // they entered, with the standard tariff's standing charge.
  const standardRow = priced.find((r) => r.tariff.id === "standard" && !r.error);
  let ownRow = null;
  if (usage && standardRow && (tariff === "e7" || tariff === "flat")) {
    let priceAt;
    if (tariff === "e7") {
      const day = economy7Slots(e7, currentSlotStart());
      const byTime = new Map(day.map((s) => [ukMinutes(s.start), s.price]));
      priceAt = (t) => byTime.get(ukMinutes(currentSlotStart(t))) ?? e7.dayRate;
    } else {
      const rate = typeof flatOverride === "number" ? flatOverride : apiFlatRate;
      priceAt = rate != null ? () => rate : null;
    }
    if (priceAt) ownRow = { tariff: { id: "own", label: tariff === "e7" ? "Your off-peak tariff" : "Your current rate" }, ...costOn(usage, priceAt, standardRow.standingCharge, moveCharging ? flexibleLoad : null), own: true };
  }

  const ready = results.key === key && results.state === "ready";
  const rows = ready
    ? [...priced.filter((r) => !r.error), ...(ownRow ? [ownRow] : [])].sort((a, b) => a.yearly - b.yearly)
    : [];
  const failed = ready ? priced.filter((r) => r.error) : [];
  const baseline = rows.find((r) => r.own) ?? rows.find((r) => r.tariff.id === tariff) ?? rows.find((r) => r.tariff.id === "standard");

  const summary = ready && rows.length
    ? (rows[0] === baseline ? "Results ready: you're already on the cheapest option for your usage." : `Results ready: ${rows[0].tariff.label} could save about ${pounds(baseline.yearly - rows[0].yearly)} a year.`)
    : "";

  return (
    <>
      <LiveSummary text={summary} />
      <Card labelledBy="usage-title">
        <StepTitle n={2} id="usage-title">Your usage</StepTitle>
        <p className="text-gray-700">
          Upload a file of your half-hourly electricity use. Many suppliers let you download one from their website or app: look for "download usage" or "export data". Smart meter apps often can too.
        </p>
        <div className="flex flex-wrap gap-2 mt-4">
          <label className="choice px-3 py-2 rounded-lg bg-brand text-onbrand text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer">
            <Upload size={16} aria-hidden="true" /> Choose a CSV file
            <input type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="sr-only" data-umami-event="switch-upload" />
          </label>
          <button type="button" onClick={() => load(exampleUsage(), "Example household")} data-umami-event="switch-example"
            className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-navy inline-flex items-center gap-1.5">
            <FileText size={16} aria-hidden="true" /> Try an example household
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Your file is read in your browser and never uploaded anywhere.</p>
        {parseError && <div className="mt-3"><Warning><p>{parseError}</p></Warning></div>}
        <div role="status">{usage && (
          <p className="mt-3 text-sm text-gray-700">
            <strong>{fileName}</strong>: {Math.round(usage.days)} days, {usage.total.toFixed(0)}kWh, which is about {Math.round((usage.total / usage.days) * 365).toLocaleString("en-GB")}kWh a year.
            {fileName === "Example household" && " This is made-up data for a typical home."}
          </p>
        )}</div>
      </Card>

      {flexibleLoad?.significant && (
        <Card labelledBy="charging-title">
          <h2 id="charging-title" className="text-xl font-semibold mb-2 flex items-center gap-2"><Car size={22} className="text-navy" aria-hidden="true" /> Car charging found</h2>
          <p className="text-gray-700">
            Your usage includes about <strong>{Math.round(flexibleLoad.perWeek)}kWh a week</strong> of big, steady loads. That's usually an electric car charging (or storage heaters).
          </p>
          <p className="text-gray-700 mt-2">
            When you charged was chosen to suit your current tariff, so pricing those same times on another tariff isn't fair: its cheap hours are different. Instead, we can move that charging into each tariff's own cheapest hours, overnight where possible, as you would if you switched.
          </p>
          <label className="mt-3 flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={shift} onChange={(e) => setShift(e.target.checked)} className="mt-1 w-5 h-5 accent-[rgb(var(--ink))]" />
            <span className="font-semibold text-navy">Move car charging to each tariff's cheapest hours</span>
          </label>
          <Note className="mt-3">
            Intelligent Octopus Go isn't in this comparison: Octopus chooses its cheap charging times each night, so it can't be priced from past usage. If you're on it now, the daytime charging it scheduled for you is treated like any other charging and moved.
          </Note>
        </Card>
      )}

      {usage && !region && <Card><p className="text-gray-700">Choose your supplier and region in step 1 so we can look up prices for your area.</p></Card>}
      {key && !ready && results.state !== "error" && <Card><p className="text-gray-600" role="status">Working out what you'd have paid on each tariff…</p></Card>}
      {results.key === key && results.state === "error" && (
        <Card><Warning><p>We couldn't get tariff prices just now. Try again in a minute.</p></Warning></Card>
      )}

      {ready && rows.length > 0 && (
        <Card className="border-2" label="Estimated yearly cost">
          <p className="text-sm uppercase tracking-wide text-relief font-semibold">Estimated yearly cost</p>
          <h2 className="text-2xl font-semibold mt-1">
            {rows[0] === baseline
              ? "You're already on the cheapest option for your usage"
              : <>{rows[0].tariff.label} could save about {pounds(baseline.yearly - rows[0].yearly)} a year</>}
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Compared with {baseline.own ? baseline.tariff.label.toLowerCase() : baseline.tariff.label}. Includes standing charges and VAT, scaled up from your {Math.round(usage.days)} days.
          </p>
          <ShareButton
            tool="switch" path="/should-i-switch/"
            text={rows[0] !== baseline && fileName !== "Example household"
              ? `${rows[0].tariff.label} could save me about ${pounds(baseline.yearly - rows[0].yearly)} a year on electricity. Check yours with your own smart meter data, free:`
              : "See what you'd pay on each electricity tariff, using your own smart meter data, free:"}
          />
          <ul className="mt-4 divide-y divide-gray-100">
            {rows.map((r) => {
              const diff = r.yearly - baseline.yearly;
              const supplier = SUPPLIERS.find((s) => s.id === r.tariff.supplier);
              return (
                <li key={r.tariff.id} className={`py-3 ${r === baseline ? "bg-navy/10 -mx-2 px-2 rounded-lg" : ""}`}>
                  <div className="flex justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-navy">
                        {r.tariff.label}
                        {supplier && r.tariff.id !== "standard" && <span className="font-normal text-gray-600"> · {supplier.name}</span>}
                        {r === baseline && <span className="ml-2 text-xs font-semibold text-gray-700 uppercase tracking-wide">Yours<span className="sr-only"> (your current tariff)</span></span>}
                      </div>
                      {ELIGIBILITY[r.tariff.id] && <div className="text-sm text-gray-600">{ELIGIBILITY[r.tariff.id]}</div>}
                    </div>
                    <div className="text-right tabular-nums shrink-0">
                      <div className="font-semibold">{pounds(r.yearly)}</div>
                      {r !== baseline && Math.abs(diff) >= 100 && (
                        <div className={`text-sm ${diff < 0 ? "text-relief" : "text-warning"}`}>{diff < 0 ? `${pounds(-diff)} less` : `${pounds(diff)} more`}</div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {failed.length > 0 && <p className="text-sm text-gray-500 mt-2">We couldn't get prices for {failed.map((f) => f.tariff.label).join(", ")}.</p>}
          <Note className="mt-4">
            This uses today's prices for fixed-time tariffs and real past prices for Agile and FreePhase Dynamic. {moveCharging
              ? "Car charging is moved into each tariff's cheapest hours; everything else is priced at the times you actually used it."
              : "It assumes you'd use electricity at the same times as before; on a time-of-use tariff most people shift some use to cheap hours and save more."} Check the supplier's terms, any exit fees on your current deal, and whether the tariff suits your home before switching.
          </Note>
        </Card>
      )}
    </>
  );
}
