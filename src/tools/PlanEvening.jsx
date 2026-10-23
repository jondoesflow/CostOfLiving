import { useState, useMemo } from "react";
import { PiggyBank, CalendarPlus } from "lucide-react";
import { APPLIANCES } from "../appliances";
import { SLOT_MS, ukMinutes } from "../prices";
import { scheduleJobs } from "../optimise";
import { whenLabel, timeLabel, money } from "../lib/format";
import { downloadIcs, reminderTitle } from "../lib/calendar";
import { Card, StepTitle, NumberField, Warning, Note, LiveSummary } from "../components/ui";
import ApplianceGrid from "../components/ApplianceGrid";
import PricesStatus from "../components/PricesStatus";
import ShareButton from "../components/ShareButton";

const LIMITS = [
  { value: 1, label: "One at a time" },
  { value: 2, label: "Up to 2 at once" },
  { value: 3, label: "Up to 3 at once" },
  { value: Infinity, label: "No limit" },
];

// A simple Gantt-style view of when each appliance runs.
function Timeline({ placed, from, to }) {
  const span = to - from;
  const pct = (t) => `${((t - from) / span) * 100}%`;
  const ticks = [];
  for (let t = Math.ceil(from / SLOT_MS) * SLOT_MS; t <= to; t += SLOT_MS) {
    if (ukMinutes(t) % 360 === 0) ticks.push(t);
  }
  return (
    <div className="mt-5" aria-hidden="true">
      <div className="space-y-2">
        {placed.filter((p) => p.window).map((p) => (
          <div key={p.job.id} className="relative h-7 rounded bg-gray-50">
            <div className="absolute top-0 bottom-0 rounded bg-relief" style={{ left: pct(p.window.start), width: pct(from + (p.window.end - p.window.start)) }} />
            <span className="absolute inset-y-0 left-2 flex items-center text-xs font-semibold text-gray-800">
              <span className="bg-white rounded px-1">{p.job.name}</span>
            </span>
          </div>
        ))}
      </div>
      <div className="relative h-5 mt-1 text-xs text-gray-500">
        {ticks.map((t) => (
          <span key={t} className="absolute -translate-x-1/2" style={{ left: pct(t) }}>
            {ukMinutes(t) === 0 ? "12am" : ukMinutes(t) === 720 ? "12pm" : timeLabel(t)}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function PlanEvening({ elec }) {
  const [chosen, setChosen] = useState([]);
  const [figures, setFigures] = useState({});
  const [maxAtOnce, setMaxAtOnce] = useState(2);
  const [finishBy, setFinishBy] = useState(null);
  const { slots, ready, now } = elec;

  function toggle(id) {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    if (!figures[id]) {
      const a = APPLIANCES.find((x) => x.id === id);
      setFigures((f) => ({ ...f, [id]: { kWh: a.kWh, mins: a.mins } }));
    }
  }
  const setFigure = (id, key, value) => setFigures((f) => ({ ...f, [id]: { ...f[id], [key]: value } }));

  const jobs = chosen
    .map((id) => ({ id, name: APPLIANCES.find((a) => a.id === id).name, ...figures[id] }))
    .filter((j) => j.kWh > 0 && j.mins > 0);
  const longest = Math.max(0, ...jobs.map((j) => j.mins));

  const finishOptions = useMemo(() => {
    if (!slots.length || !longest) return [];
    const earliest = now + longest * 60000;
    const last = slots[slots.length - 1].start + SLOT_MS;
    return slots.map((s) => s.start + SLOT_MS).filter((t) => t >= earliest && t <= last && t % 3600000 === 0);
  }, [slots, longest, now]);
  const activeFinishBy = finishBy && finishOptions.includes(finishBy) ? finishBy : null;

  const placed = useMemo(() => {
    if (!ready || !jobs.length) return null;
    return scheduleJobs(slots, jobs, { maxAtOnce, finishBy: activeFinishBy });
    // jobs is rebuilt each render; its contents are what matter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, slots, JSON.stringify(jobs), maxAtOnce, activeFinishBy]);

  const scheduled = placed?.filter((p) => p.window) ?? [];
  const missing = placed?.filter((p) => !p.window) ?? [];
  const total = scheduled.reduce((sum, p) => sum + p.window.cost, 0);
  const totalNow = scheduled.reduce((sum, p) => sum + (p.nowCost ?? 0), 0);
  const allSame = scheduled.length > 0 && scheduled.every((p) => Math.abs(p.window.cost - p.nowCost) < 0.05);
  const lastEnd = Math.max(0, ...scheduled.map((p) => p.window.end));

  const events = scheduled.map((p) => ({
    uid: `${p.window.start}-${p.job.id}@cheapwatts`, start: p.window.start, end: p.window.end,
    title: reminderTitle(p.job.name), description: "Planned with Cheap Watts (cheapwatts.co.uk)",
  }));

  const summary = !placed ? "" : allSame
    ? `Your tariff costs the same at any time. Everything together costs about ${money(total)}.`
    : `Plan ready: ${money(total)} for everything. ${scheduled.map((p) => `${p.job.name} at ${whenLabel(p.window.start)}`).join(", ")}.`;

  return (
    <>
      <LiveSummary text={summary} />
      <Card labelledBy="plan-title">
        <StepTitle n={2} id="plan-title">What needs doing?</StepTitle>
        <p className="text-sm text-gray-600 mb-3" id="plan-help">Pick everything you want to run. You can change the figures for each one.</p>
        <ApplianceGrid selected={chosen} onPick={toggle} multi includeCustom={false} legend="What needs doing? Pick everything you want to run." />

        {chosen.length > 0 && (
          <div className="mt-5 border-t border-gray-100 pt-4 space-y-3">
            {chosen.map((id) => (
              <fieldset key={id}>
                <legend className="font-semibold text-navy text-sm mb-1">{APPLIANCES.find((a) => a.id === id).name}</legend>
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Electricity used" value={figures[id]?.kWh ?? ""} onChange={(v) => setFigure(id, "kWh", v)} suffix="kWh" />
                  <NumberField label="Run time" value={figures[id]?.mins === "" ? "" : Number(((figures[id]?.mins ?? 0) / 60).toFixed(2))} step="0.25"
                    onChange={(v) => setFigure(id, "mins", v === "" ? "" : Math.round(v * 60))} suffix="hours" />
                </div>
              </fieldset>
            ))}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <label className="block">
                <span className="text-sm text-gray-600">How many can run at once?</span>
                <select value={String(maxAtOnce)} onChange={(e) => setMaxAtOnce(Number(e.target.value))}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  {LIMITS.map((l) => <option key={l.label} value={String(l.value)}>{l.label}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Everything finished by</span>
                <select value={activeFinishBy ?? ""} onChange={(e) => setFinishBy(e.target.value ? Number(e.target.value) : null)}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 bg-white">
                  <option value="">Any time</option>
                  {finishOptions.map((t) => <option key={t} value={t}>{whenLabel(t)}</option>)}
                </select>
              </label>
            </div>
            <Note>Running several big appliances together can trip a fuse or overload a socket, and some boilers and showers don't like it either. "One at a time" or "Up to 2" is the safe choice.</Note>
          </div>
        )}
      </Card>

      <PricesStatus elec={elec} waiting={chosen.length > 0} />

      {placed && (
        <Card className="border-2" label="Your plan">
          <div className="animate-fade-in-up">
            <p className="text-sm uppercase tracking-wide text-relief font-semibold">Your plan</p>
            <h2 className="text-3xl font-semibold mt-1">{money(total)} for everything</h2>
            {allSame ? (
              <p className="text-gray-600 mt-1">Your tariff costs the same at any time, so run things whenever suits you.</p>
            ) : totalNow - total > 0.05 && (
              <p className="mt-3 flex gap-2 items-start">
                <PiggyBank size={20} className="shrink-0 text-relief mt-0.5" aria-hidden="true" />
                <span>Starting everything now would cost about <strong className="tabular-nums">{money(totalNow)}</strong>, so this plan saves <strong className="tabular-nums">{money(totalNow - total)}</strong>.</span>
              </p>
            )}

            {!allSame && (
              <>
                <ul className="mt-5 divide-y divide-gray-100">
                  {scheduled.map((p) => (
                    <li key={p.job.id} className="py-3 flex justify-between gap-3">
                      <div>
                        <div className="font-semibold text-navy">{p.job.name}</div>
                        <div className="text-sm text-gray-600">
                          {p.window.index === 0 ? "Start now" : `Start ${whenLabel(p.window.start)}`}, done by {timeLabel(p.window.end)}
                        </div>
                      </div>
                      <div className="tabular-nums text-right">
                        <div className="font-semibold">{money(p.window.cost)}</div>
                        {p.nowCost - p.window.cost > 0.05 && <div className="text-xs text-gray-500">now: {money(p.nowCost)}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
                <Timeline placed={scheduled} from={slots[0].start} to={Math.max(lastEnd, slots[0].start + 6 * 3600 * 1000)} />
                <button type="button" onClick={() => downloadIcs(events, "my-plan.ics")} data-umami-event="add-plan-to-calendar"
                  className="mt-4 px-3 py-2 rounded-lg bg-brand text-onbrand text-sm font-semibold inline-flex items-center gap-1.5">
                  <CalendarPlus size={16} aria-hidden="true" /> Add the plan to my calendar
                </button>
                <ShareButton
                  tool="plan" path="/plan-my-evening/"
                  text={totalNow - total > 0.05
                    ? `I fitted ${scheduled.length} jobs into the cheap hours and saved ${money(totalNow - total)} on running them all now. Plan yours, free:`
                    : "Fit your washing, dishwasher and car charging into the cheapest hours, free:"}
                />
              </>
            )}

            {missing.length > 0 && (
              <div className="mt-4">
                <Warning>
                  <p>Couldn't fit {missing.map((m) => m.job.name.toLowerCase()).join(", ")} in {activeFinishBy ? "before your finish time" : "the hours we have prices for"}. Try a later finish time or allow more at once.</p>
                </Warning>
              </div>
            )}
          </div>
        </Card>
      )}
    </>
  );
}
