import { useState, useEffect, useMemo } from "react";
import { Sun, BatteryCharging } from "lucide-react";
import { EXPORT_TARIFFS, loadSlots } from "../prices";
import { windowCosts } from "../optimise";
import { whenLabel, timeLabel, money, pounds } from "../lib/format";
import { useSaved } from "../lib/storage";
import { Card, StepTitle, NumberField, Note, Warning, Choice, LiveSummary } from "../components/ui";
import SlotChart from "../components/SlotChart";
import PricesStatus from "../components/PricesStatus";

// Battery plan: the charge window and later discharge window (selling at the
// export price, or running the home instead of buying) that leave you most
// ahead. If nothing is profitable, still show the cheapest time to charge.
function planBattery(importSlots, exportSlots, { capacity, power, efficiency }) {
  const mins = Math.max(30, Math.round((capacity / power) * 60));
  const delivered = capacity * efficiency;
  const charges = windowCosts(importSlots, capacity, mins);
  if (!charges.length) return null;
  const outlets = [
    ...windowCosts(exportSlots, delivered, mins).map((w) => ({ kind: "sell", window: w })),
    ...windowCosts(importSlots, delivered, mins).map((w) => ({ kind: "use", window: w })),
  ];
  let plan = null;
  for (const charge of charges) {
    for (const out of outlets) {
      if (out.window.start < charge.end) continue;
      const profit = out.window.cost - charge.cost;
      if (!plan || profit > plan.profit + 0.5) plan = { charge, best: out, profit };
    }
  }
  if (!plan) {
    const cheapest = charges.reduce((m, w) => (w.cost < m.cost ? w : m));
    return { charge: cheapest, best: null, profit: null, delivered };
  }
  return { ...plan, delivered };
}

export default function Solar({ elec }) {
  const { slots: importSlots, ready, region } = elec;
  const [exportId, setExportId] = useSaved("exportTariff", "agile-outgoing");
  const [ownRate, setOwnRate] = useSaved("exportRate", "");
  const [battery, setBattery] = useSaved("battery", { capacity: 5, power: 3, efficiency: 90 });
  const [exp, setExp] = useState({ key: null, state: "idle", data: [] });

  const live = exportId !== "own";
  const expKey = live && region ? `${exportId}|${region}` : null;
  useEffect(() => {
    if (!expKey) return;
    const ctrl = new AbortController();
    loadSlots(exportId, region, ctrl.signal)
      .then((data) => setExp({ key: expKey, state: "ready", data }))
      .catch((e) => { if (e.name !== "AbortError") setExp({ key: expKey, state: "error", data: [] }); });
    return () => ctrl.abort();
  }, [expKey, exportId, region]);

  // Export prices lined up with the import slots.
  const exportSlots = useMemo(() => {
    if (!live) return typeof ownRate === "number" ? importSlots.map((s) => ({ start: s.start, price: ownRate })) : [];
    if (exp.key !== expKey || exp.state !== "ready") return [];
    const byStart = new Map(exp.data.map((s) => [s.start, s.price]));
    return importSlots.filter((s) => byStart.has(s.start)).map((s) => ({ start: s.start, price: byStart.get(s.start) }));
  }, [live, ownRate, importSlots, exp, expKey]);

  const importNow = importSlots[0]?.price;
  const exportNow = exportSlots[0]?.price;
  const valid = battery.capacity > 0 && battery.power > 0 && battery.efficiency > 0 && battery.efficiency <= 100;
  const plan = useMemo(
    () => (ready && valid && importSlots.length ? planBattery(importSlots, exportSlots, { ...battery, efficiency: battery.efficiency / 100 }) : null),
    [ready, valid, importSlots, exportSlots, battery],
  );
  const exportLoading = live && expKey && exp.key !== expKey;
  let summary = "";
  if (ready && importNow != null && exportNow != null) summary = importNow >= exportNow ? "Solar right now: use it yourself." : "Solar right now: sell it.";
  if (plan?.best) summary += ` Battery: charge at ${whenLabel(plan.charge.start)}, then ${plan.best.kind === "sell" ? "sell" : "use it"} at ${whenLabel(plan.best.window.start)}.`;

  return (
    <>
      <LiveSummary text={summary} />
      <Card labelledBy="export-title">
        <StepTitle n={2} id="export-title">Your export tariff</StepTitle>
        <fieldset>
          <legend className="text-sm text-gray-600 mb-3">What are you paid for electricity you send to the grid?</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {EXPORT_TARIFFS.map((t) => (
              <Choice key={t.id} name="export" on={exportId === t.id} onChange={() => setExportId(t.id)} title={t.label} subtitle={t.blurb} />
            ))}
          </div>
        </fieldset>
        {!live && (
          <div className="mt-4 max-w-xs">
            <NumberField label="Your export rate" value={ownRate} onChange={setOwnRate} suffix="p/kWh" />
          </div>
        )}
        <div role="status">
          {live && !region && <p className="text-sm text-warning mt-3">Choose your region in step 1 to get live export prices.</p>}
          {exp.state === "error" && exp.key === expKey && <p className="text-sm text-warning mt-3">We couldn't get export prices just now. Try again in a minute.</p>}
        </div>
      </Card>

      <PricesStatus elec={elec} waiting />
      {exportLoading && <Card><p className="text-gray-600" role="status">Getting export prices…</p></Card>}

      {ready && importNow != null && exportNow != null && (
        <Card className="border-2" label="Solar power right now">
          <p className="text-sm uppercase tracking-wide text-relief font-semibold flex items-center gap-1"><Sun size={16} aria-hidden="true" /> Solar power right now</p>
          {importNow >= exportNow ? (
            <>
              <h2 className="text-3xl font-semibold mt-1">Use it yourself</h2>
              <p className="mt-2 text-gray-700">
                Every unit of solar you use saves buying one at <strong className="tabular-nums">{importNow.toFixed(1)}p</strong>. Selling it would only earn <strong className="tabular-nums">{exportNow.toFixed(1)}p</strong>. If the sun's out, now's a good time for the washing machine or dishwasher.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-3xl font-semibold mt-1">Sell it</h2>
              <p className="mt-2 text-gray-700">
                Exporting earns <strong className="tabular-nums">{exportNow.toFixed(1)}p</strong> a unit right now, more than the <strong className="tabular-nums">{importNow.toFixed(1)}p</strong> you'd pay to buy one. Hold off on big appliances for now if you can.
              </p>
            </>
          )}
        </Card>
      )}

      {ready && (
        <Card labelledBy="battery-title">
          <StepTitle id="battery-title"><BatteryCharging size={22} className="text-navy" aria-hidden="true" /> Home battery</StepTitle>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Size" value={battery.capacity} onChange={(v) => setBattery({ ...battery, capacity: v })} suffix="kWh" />
            <NumberField label="Charge speed" value={battery.power} onChange={(v) => setBattery({ ...battery, power: v })} suffix="kW" />
            <NumberField label="Round trip" value={battery.efficiency} step="1" onChange={(v) => setBattery({ ...battery, efficiency: v })} suffix="%" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Round trip is how much of what goes in you get back out. Around 90% is typical.</p>

          {plan && plan.best && (
            <div className="mt-5 animate-fade-in-up">
              <ol className="space-y-3">
                <li className="rounded-xl bg-relief/10 p-4">
                  <div className="font-semibold text-relief">1. Charge from the grid at {whenLabel(plan.charge.start)}</div>
                  <p className="text-gray-700 text-sm mt-0.5">Until about {timeLabel(plan.charge.end)}. Filling it costs about <strong className="tabular-nums">{money(plan.charge.cost)}</strong>.</p>
                </li>
                <li className="rounded-xl bg-navy/10 p-4">
                  <div className="font-semibold text-navy">
                    2. {plan.best.kind === "sell" ? "Sell it back" : "Run your home from it"} at {whenLabel(plan.best.window.start)}
                  </div>
                  <p className="text-gray-700 text-sm mt-0.5">
                    {plan.best.kind === "sell"
                      ? <>Exporting the {plan.delivered.toFixed(1)}kWh you get back earns about <strong className="tabular-nums">{money(plan.best.window.cost)}</strong>.</>
                      : <>Using the {plan.delivered.toFixed(1)}kWh you get back, instead of buying it then, saves about <strong className="tabular-nums">{money(plan.best.window.cost)}</strong>. That assumes your home uses that much over those hours.</>}
                  </p>
                </li>
              </ol>
              {plan.profit > 0.5 ? (
                <p className="mt-4 text-lg">
                  That's about <strong className="tabular-nums text-relief">{money(plan.profit)}</strong> ahead for one charge, or roughly <strong className="tabular-nums">{pounds(plan.profit * 365)} a year</strong> if every day were like today.
                </p>
              ) : (
                <div className="mt-4"><Warning><p>Charging from the grid isn't worth it today: the gap between cheap and dear prices is too small once you allow for losses. Keep the battery for your solar.</p></Warning></div>
              )}
              <SlotChart
                slots={importSlots} title="What you pay for electricity"
                highlights={[
                  { from: plan.charge.index, count: plan.charge.slotCount, color: "relief", label: "Charge" },
                  ...(plan.best.kind === "use" ? [{ from: plan.best.window.index, count: plan.best.window.slotCount, color: "ink", label: "Use at home" }] : []),
                ]}
                ariaLabel="Bar chart of import prices with the charging window highlighted"
              />
              {live && exportSlots.length > 0 && (
                <SlotChart
                  slots={exportSlots} title="What you're paid for exporting"
                  highlights={plan.best.kind === "sell" ? [{ from: plan.best.window.index, count: plan.best.window.slotCount, color: "ink", label: "Sell" }] : []}
                  ariaLabel="Bar chart of export prices"
                />
              )}
            </div>
          )}
          {plan && !plan.best && (
            <p className="mt-4 text-gray-700">
              The cheapest time to charge is {whenLabel(plan.charge.start)} (about {money(plan.charge.cost)} to fill it), but we don't have prices far enough ahead to plan when to use it. Check back in the afternoon, when tomorrow's prices come out.
            </p>
          )}
          <Note className="mt-4">Many batteries can be scheduled from their app. Some suppliers also have their own battery tariffs that do this automatically.</Note>
        </Card>
      )}
    </>
  );
}
