import { useState, useMemo } from "react";
import { Clock, Timer, PiggyBank, Leaf, CalendarPlus, BellRing } from "lucide-react";
import { APPLIANCES } from "../appliances";
import { SLOT_MS } from "../prices";
import { bestWindows, windowCosts } from "../optimise";
import { whenLabel, money, duration, ukDate } from "../lib/format";
import { downloadIcs, googleCalendarUrl, feedUrl, reminderTitle } from "../lib/calendar";
import { Card, StepTitle, NumberField, Warning, Note, LiveSummary } from "../components/ui";
import ApplianceGrid from "../components/ApplianceGrid";
import SlotChart from "../components/SlotChart";
import PricesStatus from "../components/PricesStatus";

function grams(g) {
  return g >= 1000 ? `${(g / 1000).toFixed(1)}kg` : `${Math.round(g)}g`;
}

function ApplianceStep({ applianceId, pick, kWh, setKWh, mins, setMins, finishBy, setFinishBy, finishOptions }) {
  const appliance = APPLIANCES.find((a) => a.id === applianceId);
  return (
    <Card labelledBy="appliance-title">
      <StepTitle n={2} id="appliance-title">What do you want to run?</StepTitle>
      <ApplianceGrid selected={applianceId} onPick={pick} legend="What do you want to run?" />

      {applianceId && (
        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="text-sm text-gray-600 mb-3">
            {appliance
              ? <>Typical figures for a {appliance.name.toLowerCase()} ({appliance.note}). Change them if you know yours.</>
              : <>Enter how much electricity it uses and how long it runs. The power rating (in kW) multiplied by the hours gives you the kWh.</>}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Electricity used" value={kWh} onChange={setKWh} suffix="kWh" />
            <NumberField label="Run time" value={mins === "" ? "" : Number((mins / 60).toFixed(2))} step="0.25"
              onChange={(v) => setMins(v === "" ? "" : Math.round(v * 60))} suffix="hours" />
          </div>
          <label className="block mt-3">
            <span className="text-sm text-gray-600">Needs to be finished by</span>
            <select value={finishBy ?? ""} onChange={(e) => setFinishBy(e.target.value ? Number(e.target.value) : null)}
              className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option value="">Any time</option>
              {finishOptions.map((t) => <option key={t} value={t}>{whenLabel(t)}</option>)}
            </select>
          </label>
        </div>
      )}
    </Card>
  );
}

// Greenest time to run, from the regional carbon forecast.
function Greenest({ green, cheapest, allSame }) {
  if (!green) return null;
  const { best, now } = green.result;
  const atCheapest = cheapest && !allSame ? green.costAt(cheapest.start) : null;
  const sameTime = atCheapest != null && atCheapest - best.cost <= Math.max(20, best.cost * 0.15);
  return (
    <div className="mt-5 rounded-xl border border-gray-200 p-4 flex gap-3">
      <Leaf size={22} className="shrink-0 text-relief mt-0.5" aria-hidden="true" />
      <div>
        <div className="font-semibold text-navy">Greenest time: {best.index === 0 ? "now" : whenLabel(best.start)}</div>
        <p className="text-gray-700">
          About <strong className="tabular-nums">{grams(best.cost)}</strong> of CO₂, against {grams(now.cost)} if you start it now.
          {sameTime && " Good news: your cheapest time is about as green."}
          {atCheapest != null && !sameTime && ` Your cheapest time would be about ${grams(atCheapest)}.`}
        </p>
        <p className="text-xs text-gray-500 mt-1">From National Grid's carbon forecast for your region. When more wind and solar are on the grid, each unit is cleaner.</p>
      </div>
    </div>
  );
}

function Reminders({ elec, best, applianceName, kWh, mins }) {
  const [showFeed, setShowFeed] = useState(false);
  const title = reminderTitle(applianceName);
  const description = `Cheapest time to run it on your tariff, found by Cheap Watts (cheapwatts.co.uk)`;
  const event = { uid: `${best.start}-${applianceName}@cheapwatts`, start: best.start, end: best.end, title, description };
  const feed = feedUrl({ tariff: elec.tariff, region: elec.region, kWh, mins, name: applianceName, e7: elec.e7 });
  const webcal = feed.replace(/^https?:/, "webcal:");
  return (
    <div className="mt-5 rounded-xl border border-gray-200 p-4">
      <div className="flex gap-3">
        <CalendarPlus size={22} className="shrink-0 text-navy mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <div className="font-semibold text-navy">Remind me</div>
          <p className="text-gray-700">Put it in your calendar with an alert at the start time.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <button type="button" onClick={() => downloadIcs(event, "start-it.ics")}
              className="px-3 py-2 rounded-lg bg-brand text-onbrand text-sm font-semibold">Add to calendar</button>
            <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-navy">Google Calendar<span className="sr-only"> (opens in a new tab)</span></a>
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-4 pt-4 border-t border-gray-100">
        <BellRing size={22} className="shrink-0 text-navy mt-0.5" aria-hidden="true" />
        <div className="min-w-0">
          <div className="font-semibold text-navy">Do this every day?</div>
          <p className="text-gray-700">Subscribe to a calendar that keeps moving the reminder to the cheapest time as prices change.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <a href={webcal} className="px-3 py-2 rounded-lg bg-brand text-onbrand text-sm font-semibold">Subscribe<span className="sr-only"> to a daily reminder calendar</span></a>
            <button type="button" onClick={() => setShowFeed((v) => !v)} aria-expanded={showFeed}
              className="px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold text-navy">{showFeed ? "Hide link" : "Copy link instead"}</button>
          </div>
          {showFeed && (
            <input readOnly value={feed} onFocus={(e) => e.target.select()} aria-label="Calendar feed link"
              className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700" />
          )}
          <p className="text-xs text-gray-500 mt-2">
            Calendar apps check for changes every few hours (Google Calendar can take longer), so treat the reminder as a guide. The link holds your tariff, region and appliance figures, and nothing else.
          </p>
        </div>
      </div>
    </div>
  );
}

function Result({ elec, result, green, kWh, mins, perWeek, applianceName, finishBy }) {
  const { slots, tariff, refRate, now: nowMs, tariffInfo } = elec;
  if (!result) {
    return (
      <Card label="Result">
        <Warning>
          <p>{finishBy ? "There isn't enough time to finish by then. Choose a later time." : "We don't have prices far enough ahead for a run this long yet. Try again in the afternoon, when tomorrow's prices come out."}</p>
        </Warning>
      </Card>
    );
  }

  const { best, now, sooner, alternatives, allSame } = result;
  const saveNow = now.cost - best.cost;
  const refCost = refRate != null ? kWh * refRate : null;
  const saveVsRef = refCost != null ? refCost - best.cost : null;
  const startIn = best.start - nowMs;
  const finishIn = best.end - nowMs;
  const startNow = best.index === 0;
  // On a flat tariff the greenest time is the useful one to remind about.
  const reminderWindow = allSame && green ? green.result.best : best;

  return (
    <Card className="border-2" label="Result">
      <div className="animate-fade-in-up">
        {allSame ? (
          <>
            <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">On your tariff</p>
            <h2 className="text-3xl font-semibold mt-1">Any time costs the same</h2>
            <p className="mt-3 text-lg">Each run costs about <strong className="tabular-nums">{money(best.cost)}</strong>.</p>
            {perWeek > 0 && <p className="text-gray-600 mt-1">That's about {money(best.cost * perWeek * 52)} a year at {perWeek} times a week.</p>}
            {tariff === "flat" && (
              <Note className="mt-4">
                On a time-of-use tariff, such as Economy 7 or an EV tariff, running this overnight could cost less. Those tariffs need a smart meter, and your daytime rate is usually higher, so they suit households that can move a lot of their use to the cheap hours. The "Should I switch?" tab can check this against your own usage.
              </Note>
            )}
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-wide text-relief font-semibold flex items-center gap-1"><Clock size={16} aria-hidden="true" /> Cheapest time</p>
            <h2 className="text-3xl sm:text-4xl font-semibold mt-1">
              {startNow ? "Start it now" : <>Start at {whenLabel(best.start)}</>}
            </h2>
            <p className="text-gray-600 mt-1">Finishes around {whenLabel(best.end)}.</p>

            <div className="grid grid-cols-2 gap-3 mt-5">
              <div className="rounded-xl bg-relief/10 p-4">
                <div className="text-sm text-gray-600">Cost then</div>
                <div className="text-3xl font-heading font-semibold text-relief tabular-nums">{money(best.cost)}</div>
                {best.cost < 0 && <div className="text-sm text-relief">Prices are below zero, so you'd be paid to use it.</div>}
              </div>
              <div className="rounded-xl bg-gray-50 p-4">
                <div className="text-sm text-gray-600">If you start it now</div>
                <div className="text-3xl font-heading font-semibold text-gray-700 tabular-nums">{money(now.cost)}</div>
              </div>
            </div>

            {saveNow > 0.05 && (
              <p className="mt-4 flex gap-2 items-start">
                <PiggyBank size={20} className="shrink-0 text-relief mt-0.5" aria-hidden="true" />
                <span>
                  Waiting saves <strong className="tabular-nums">{money(saveNow)}</strong>
                  {perWeek > 0 && <> — about <strong className="tabular-nums">{money(saveNow * perWeek * 52)} a year</strong> if you run it {perWeek} times a week and prices stay like today</>}.
                </span>
              </p>
            )}
            {saveVsRef != null && tariff !== "flat" && Math.abs(saveVsRef) > 0.05 && (
              <p className="mt-2 text-sm text-gray-600">
                On a standard tariff in your region it would cost {money(refCost)} at any time of day.
              </p>
            )}

            {!startNow && (
              <div className="mt-5 rounded-xl border border-gray-200 p-4 flex gap-3">
                <Timer size={22} className="shrink-0 text-navy mt-0.5" aria-hidden="true" />
                <div>
                  <div className="font-semibold text-navy">Using a delay timer?</div>
                  <p className="text-gray-700">
                    Set it to <strong>start in {duration(startIn)}</strong>, or if your machine counts down to the end, <strong>finish in {duration(finishIn)}</strong>.
                  </p>
                  {finishIn > 24 * 3600 * 1000 && (
                    <p className="text-sm text-gray-600 mt-1">Most delay timers only go up to 24 hours, so you may need to set it later on.</p>
                  )}
                </div>
              </div>
            )}

            {sooner && (
              <div className="mt-5 rounded-xl bg-gray-50 p-4">
                <div className="font-semibold text-navy">Can't wait that long?</div>
                <p className="text-gray-700">
                  The cheapest earlier time is {sooner.index === 0 ? "now" : <>{whenLabel(sooner.start)}</>}, for about <strong className="tabular-nums">{money(sooner.cost)}</strong>.
                </p>
              </div>
            )}

            {alternatives.length > 0 && (
              <div className="mt-5">
                <h3 className="text-base font-semibold mb-2">Other good times</h3>
                <ul className="divide-y divide-gray-100">
                  {alternatives.map((a) => (
                    <li key={a.start} className="flex justify-between py-2">
                      <span>{whenLabel(a.start)}</span>
                      <span className="tabular-nums text-gray-700">{money(a.cost)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}

        <Greenest green={green} cheapest={best} allSame={allSame} />
        {(!allSame || green) && reminderWindow.index !== 0 && (
          <Reminders elec={elec} best={reminderWindow} applianceName={applianceName} kWh={kWh} mins={mins} />
        )}
      </div>

      {!allSame && (
        <SlotChart
          slots={slots} title="Price per unit, every half hour"
          highlights={[{ from: best.index, count: best.slotCount, color: "relief", label: "Your cheapest window" }]}
          refValue={tariff === "flat" ? null : refRate} refLabel="Standard rate"
          ariaLabel="Bar chart of electricity price for each half hour, with the cheapest window highlighted"
        />
      )}
      {tariffInfo?.dynamic && slots.length > 0 && ukDate(slots[slots.length - 1].start) === ukDate(nowMs) && (
        <Note className="mt-3">Tomorrow's prices come out in the afternoon. Check back then — overnight is often cheaper.</Note>
      )}
    </Card>
  );
}

export default function WhenToRun({ elec }) {
  const [applianceId, setApplianceId] = useState(null);
  const [kWh, setKWh] = useState("");
  const [mins, setMins] = useState("");
  const [finishBy, setFinishBy] = useState(null);
  const { slots, ready, now, carbon } = elec;

  const finishOptions = useMemo(() => {
    if (!slots.length || !mins) return [];
    const earliest = now + mins * 60000;
    const last = slots[slots.length - 1].start + SLOT_MS;
    const out = [];
    for (const s of slots) {
      const t = s.start + SLOT_MS;
      if (t >= earliest && t <= last && t % 3600000 === 0) out.push(t);
    }
    return out;
  }, [slots, mins, now]);

  // Drop a deadline that is no longer on offer (e.g. after changing tariff).
  const activeFinishBy = finishBy && finishOptions.includes(finishBy) ? finishBy : null;
  const valid = applianceId && kWh > 0 && mins > 0;

  const result = useMemo(() => {
    if (!ready || !valid) return undefined;
    return bestWindows(slots, kWh, mins, activeFinishBy);
  }, [ready, valid, slots, kWh, mins, activeFinishBy]);

  // Same search over the carbon forecast, with grams of CO2 in place of pence.
  const green = useMemo(() => {
    if (!valid || !carbon.length) return null;
    const greenResult = bestWindows(carbon, kWh, mins, activeFinishBy);
    if (!greenResult) return null;
    const all = windowCosts(carbon, kWh, mins);
    return { result: greenResult, costAt: (start) => all.find((w) => w.start === start)?.cost ?? null };
  }, [valid, carbon, kWh, mins, activeFinishBy]);

  function pick(id) {
    setApplianceId(id);
    const a = APPLIANCES.find((x) => x.id === id);
    if (a) { setKWh(a.kWh); setMins(a.mins); } else { setKWh(1); setMins(60); }
  }

  const appliance = APPLIANCES.find((a) => a.id === applianceId);
  let summary = "";
  if (result === null) summary = activeFinishBy ? "There isn't enough time to finish by then." : "Not enough prices ahead for a run this long yet.";
  else if (result?.allSame) summary = `Any time costs the same. Each run costs about ${money(result.best.cost)}.`;
  else if (result) {
    summary = `${result.best.index === 0 ? "Start it now" : `Start at ${whenLabel(result.best.start)}`}. Cost then ${money(result.best.cost)}, or ${money(result.now.cost)} if you start it now.`;
  }

  return (
    <>
      <LiveSummary text={summary} />
      <ApplianceStep
        applianceId={applianceId} pick={pick} kWh={kWh} setKWh={setKWh} mins={mins} setMins={setMins}
        finishBy={activeFinishBy} setFinishBy={setFinishBy} finishOptions={finishOptions}
      />
      <PricesStatus elec={elec} waiting={Boolean(applianceId)} />
      {result !== undefined && (
        <Result
          elec={elec} result={result} green={green} kWh={kWh} mins={mins}
          perWeek={appliance?.perWeek ?? 0} applianceName={appliance?.name ?? "Appliance"} finishBy={activeFinishBy}
        />
      )}
    </>
  );
}
