import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer, Cell, CartesianGrid,
} from "recharts";
import {
  WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car,
  SlidersHorizontal, Clock, Timer, PiggyBank, MapPin, AlertCircle, Info, ExternalLink, Zap,
} from "lucide-react";
import { APPLIANCES, REGIONS } from "./appliances";
import { TARIFFS, loadSlots, standardRate, regionFromPostcode, economy7Slots, currentSlotStart, ukMinutes, SLOT_MS } from "./octopus";
import { bestWindows } from "./optimise";

const ICONS = { WashingMachine, Wind, Fan, Utensils, Flame, Soup, CookingPot, Droplets, Heater, AirVent, Bike, Car, SlidersHorizontal };

const NAVY = "#1d3461";
const RELIEF = "#2d6a4f";
const MUTED_BAR = "#c9d1dc";

const DEFAULT_E7 = { nightStart: "00:30", nightEnd: "07:30", dayRate: 30, nightRate: 15 };

// ---------- storage (per-viewer convenience only) ----------
function loadSaved(key, fallback) {
  try {
    const v = localStorage.getItem(`whenToRun.${key}`);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(`whenToRun.${key}`, JSON.stringify(value)); } catch { /* ignore */ }
}
function useSaved(key, fallback) {
  const [value, setValue] = useState(() => loadSaved(key, fallback));
  useEffect(() => save(key, value), [key, value]);
  return [value, setValue];
}

// ---------- formatting ----------
const ukDate = (t) => new Date(t).toLocaleDateString("en-GB", { timeZone: "Europe/London" });

function timeLabel(t) {
  const m = ukMinutes(t);
  if (m === 0) return "midnight";
  if (m === 720) return "midday";
  return new Date(t)
    .toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "numeric", minute: "2-digit", hour12: true })
    .replace(":00", "")
    .replace(" ", "");
}

function dayWord(t) {
  const now = Date.now();
  if (ukDate(t) === ukDate(now)) return "today";
  if (ukDate(t) === ukDate(now + 24 * 3600 * 1000)) return "tomorrow";
  return new Date(t).toLocaleDateString("en-GB", { timeZone: "Europe/London", weekday: "long" });
}

function whenLabel(t) {
  const day = dayWord(t);
  const time = timeLabel(t);
  const hour = Number(new Date(t).toLocaleTimeString("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }));
  if (day === "today" && hour >= 18) return `${time} tonight`;
  return `${time} ${day}`;
}

function money(pence) {
  const abs = Math.abs(pence);
  const s = abs >= 100 ? `£${(abs / 100).toFixed(2)}` : abs < 10 ? `${abs.toFixed(1)}p` : `${Math.round(abs)}p`;
  return pence < 0 ? `-${s}` : s;
}

function duration(ms) {
  const mins = Math.max(0, Math.round(ms / 60000 / 5) * 5);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  return m ? `${h}h ${m}m` : `${h} hour${h > 1 ? "s" : ""}`;
}

// ---------- small UI pieces ----------
function Card({ children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl p-5 sm:p-6 ${className}`} style={{ boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
      {children}
    </section>
  );
}

function StepTitle({ n, children }) {
  return (
    <h2 className="text-xl font-semibold mb-4 flex items-center gap-3">
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-navy text-white text-sm font-body">{n}</span>
      {children}
    </h2>
  );
}

function NumberField({ label, value, onChange, step = "0.1", min = "0", suffix }) {
  return (
    <label className="block">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="mt-1 flex items-center border border-gray-300 rounded-lg focus-within:border-navy bg-white">
        <input
          type="number" inputMode="decimal" step={step} min={min} value={value}
          onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
          className="w-full px-3 py-2 rounded-lg outline-none tabular-nums bg-transparent"
        />
        {suffix && <span className="pr-3 text-gray-500 text-sm whitespace-nowrap">{suffix}</span>}
      </div>
    </label>
  );
}

// ---------- step 1: tariff and region ----------
function TariffStep({ tariff, setTariff, region, setRegion, e7, setE7, flatOverride, setFlatOverride, apiFlatRate }) {
  const [postcode, setPostcode] = useState("");
  const [lookup, setLookup] = useState({ state: "idle" });

  async function findRegion(e) {
    e.preventDefault();
    if (!postcode.trim()) return;
    setLookup({ state: "loading" });
    try {
      const code = await regionFromPostcode(postcode);
      if (!code) throw new Error();
      setRegion(code);
      setLookup({ state: "done", name: REGIONS.find((r) => r.code === code)?.name });
    } catch {
      setLookup({ state: "error" });
    }
  }

  const needsRegion = tariff !== "e7";

  return (
    <Card>
      <StepTitle n={1}>Your electricity</StepTitle>
      <p className="text-sm text-gray-600 mb-3">Which tariff are you on? It's on your bill or in your supplier's app.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2" role="radiogroup" aria-label="Tariff">
        {TARIFFS.map((t) => {
          const on = t.id === tariff;
          return (
            <button
              key={t.id} type="button" role="radio" aria-checked={on} onClick={() => setTariff(t.id)}
              className={`text-left rounded-xl border-2 px-4 py-3 transition-colors ${on ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}
            >
              <div className="font-semibold text-navy">{t.label}</div>
              <div className="text-sm text-gray-600">{t.blurb}</div>
            </button>
          );
        })}
      </div>

      {needsRegion && (
        <div className="mt-5">
          <p className="text-sm text-gray-600 mb-2">Prices depend on where you live.</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={region || ""} onChange={(e) => { setRegion(e.target.value); setLookup({ state: "idle" }); }}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white" aria-label="Region"
            >
              <option value="" disabled>Choose your region…</option>
              {REGIONS.map((r) => <option key={r.code} value={r.code}>{r.name}</option>)}
            </select>
            <form onSubmit={findRegion} className="flex gap-2 flex-1">
              <input
                value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="or enter postcode"
                aria-label="Postcode" autoComplete="postal-code"
                className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 uppercase placeholder:normal-case"
              />
              <button type="submit" className="px-3 py-2 rounded-lg bg-navy text-white text-sm font-semibold flex items-center gap-1 whitespace-nowrap">
                <MapPin size={16} /> Find
              </button>
            </form>
          </div>
          {lookup.state === "loading" && <p className="text-sm text-gray-500 mt-2">Looking up your region…</p>}
          {lookup.state === "done" && <p className="text-sm text-relief mt-2">Found it: {lookup.name}.</p>}
          {lookup.state === "error" && <p className="text-sm text-warning mt-2">We couldn't find that postcode. Pick your region from the list instead.</p>}
          <p className="text-xs text-gray-500 mt-2">Your postcode is only used to find your region. It isn't stored.</p>
        </div>
      )}

      {tariff === "e7" && (
        <div className="mt-5">
          <p className="text-sm text-gray-600 mb-3">Economy 7 night hours vary by meter. Check your bill and adjust these if yours are different.</p>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-gray-600">Night rate starts</span>
              <input type="time" value={e7.nightStart} onChange={(e) => setE7({ ...e7, nightStart: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Night rate ends</span>
              <input type="time" value={e7.nightEnd} onChange={(e) => setE7({ ...e7, nightEnd: e.target.value })}
                className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2" />
            </label>
            <NumberField label="Day rate" value={e7.dayRate} onChange={(v) => setE7({ ...e7, dayRate: v })} suffix="p/kWh" />
            <NumberField label="Night rate" value={e7.nightRate} onChange={(v) => setE7({ ...e7, nightRate: v })} suffix="p/kWh" />
          </div>
        </div>
      )}

      {tariff === "flat" && region && (
        <div className="mt-5 max-w-xs">
          <NumberField
            label="Your unit rate (from your bill)" value={flatOverride ?? (apiFlatRate ? Number(apiFlatRate.toFixed(2)) : "")}
            onChange={setFlatOverride} suffix="p/kWh"
          />
          {apiFlatRate && (
            <p className="text-xs text-gray-500 mt-1">
              We've filled in the typical standard rate for your region ({apiFlatRate.toFixed(1)}p).
              {flatOverride != null && <> <button type="button" className="underline" onClick={() => setFlatOverride(null)}>Reset</button></>}
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------- step 2: appliance ----------
function ApplianceStep({ applianceId, pick, kWh, setKWh, mins, setMins, finishBy, setFinishBy, finishOptions }) {
  const appliance = APPLIANCES.find((a) => a.id === applianceId);
  return (
    <Card>
      <StepTitle n={2}>What do you want to run?</StepTitle>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2" role="radiogroup" aria-label="Appliance">
        {[...APPLIANCES, { id: "custom", name: "Something else", icon: "SlidersHorizontal" }].map((a) => {
          const Icon = ICONS[a.icon];
          const on = a.id === applianceId;
          return (
            <button
              key={a.id} type="button" role="radio" aria-checked={on} onClick={() => pick(a.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 min-h-[88px] text-center transition-colors ${on ? "border-navy bg-navy/5" : "border-gray-200 hover:border-gray-300"}`}
            >
              <Icon size={26} color={on ? NAVY : "#4b5563"} aria-hidden="true" />
              <span className={`text-sm leading-tight ${on ? "font-semibold text-navy" : "text-gray-700"}`}>{a.name}</span>
            </button>
          );
        })}
      </div>

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

// ---------- result ----------
function Result({ result, slots, kWh, perWeek, tariff, refRate, finishBy, now: nowMs }) {
  if (!result) {
    return (
      <Card>
        <div className="flex gap-3 text-warning">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p>{finishBy ? "There isn't enough time to finish by then. Choose a later time." : "We don't have prices far enough ahead for a run this long yet. Try again after 4pm, when tomorrow's prices come out."}</p>
        </div>
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

  return (
    <Card className="border-2" >
      <div className="animate-fade-in-up">
        {allSame ? (
          <>
            <p className="text-sm uppercase tracking-wide text-gray-500 font-semibold">On your tariff</p>
            <h2 className="text-3xl font-semibold mt-1">Any time costs the same</h2>
            <p className="mt-3 text-lg">Each run costs about <strong className="tabular-nums">{money(best.cost)}</strong>.</p>
            {perWeek > 0 && <p className="text-gray-600 mt-1">That's about {money(best.cost * perWeek * 52)} a year at {perWeek} times a week.</p>}
            {tariff === "flat" && (
              <p className="text-sm text-gray-600 mt-4 flex gap-2">
                <Info size={16} className="shrink-0 mt-0.5" />
                On a time-of-use tariff such as Economy 7, Octopus Go or Agile, running this overnight could cost less. Those tariffs need a smart meter, and your daytime rate is usually higher, so they suit households that can move a lot of their use to the cheap hours.
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-wide text-relief font-semibold flex items-center gap-1"><Clock size={16} /> Cheapest time</p>
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
                <PiggyBank size={20} className="shrink-0 text-relief mt-0.5" />
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
                <Timer size={22} className="shrink-0 text-navy mt-0.5" />
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
      </div>

      {!allSame && <PriceChart slots={slots} best={best} refRate={tariff === "flat" ? null : refRate} />}
      {tariff === "agile" && slots.length > 0 && ukDate(slots[slots.length - 1].start) === ukDate(nowMs) && (
        <p className="text-sm text-gray-600 mt-3 flex gap-2">
          <Info size={16} className="shrink-0 mt-0.5" />
          Tomorrow's Agile prices come out at about 4pm. Check back then — overnight is often cheaper.
        </p>
      )}
    </Card>
  );
}

function PriceChart({ slots, best, refRate }) {
  const data = slots.map((s, i) => ({
    i,
    start: s.start,
    price: Number(s.price.toFixed(2)),
    inWindow: i >= best.index && i < best.index + best.slotCount,
  }));
  // Label every 6 hours on the clock, kept short so they fit on a phone.
  const ticks = data.filter((d) => ukMinutes(d.start) % 360 === 0).map((d) => d.i);
  const tickLabel = (i) => {
    const m = ukMinutes(data[i].start);
    return m === 0 ? "12am" : m === 720 ? "12pm" : timeLabel(data[i].start);
  };

  return (
    <figure className="mt-6">
      <figcaption className="text-base font-semibold text-navy mb-1">Price per unit, every half hour</figcaption>
      <p className="text-sm text-gray-600 mb-3 flex flex-wrap gap-x-4 gap-y-1">
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: RELIEF }} /> Your cheapest window</span>
        <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded-sm" style={{ background: MUTED_BAR }} /> Other times</span>
        {refRate != null && <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-gray-500" /> Standard rate</span>}
      </p>
      <div className="h-56 -ml-3" role="img" aria-label="Bar chart of electricity price for each half hour, with the cheapest window highlighted">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap={1} margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
            <CartesianGrid vertical={false} stroke="#eceae4" />
            <XAxis dataKey="i" ticks={ticks} tickFormatter={tickLabel} tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#d1d5db" }} tickLine={false} interval={0} />
            <YAxis width={40} tick={{ fontSize: 12, fill: "#6b7280" }} tickFormatter={(v) => `${v}p`} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(29,52,97,0.06)" }}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm shadow-sm">
                    <div className="text-gray-600">{whenLabel(d.start)} – {timeLabel(d.start + SLOT_MS)}</div>
                    <div className="font-semibold text-gray-800 tabular-nums">{d.price.toFixed(1)}p per kWh</div>
                  </div>
                );
              }}
            />
            {refRate != null && <ReferenceLine y={Number(refRate.toFixed(2))} stroke="#6b7280" strokeDasharray="4 3" />}
            <ReferenceLine y={0} stroke="#9ca3af" />
            <Bar dataKey="price" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {data.map((d) => <Cell key={d.i} fill={d.inWindow ? RELIEF : MUTED_BAR} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-gray-600">Show prices as a table</summary>
        <table className="mt-2 w-full tabular-nums">
          <thead><tr className="text-left text-gray-500"><th className="font-normal py-1">From</th><th className="font-normal py-1 text-right">p/kWh</th></tr></thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.i} className={d.inWindow ? "text-relief font-semibold" : ""}>
                <td className="py-0.5">{whenLabel(d.start)}</td>
                <td className="py-0.5 text-right">{d.price.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

// ---------- app ----------
export default function App() {
  const [tariff, setTariff] = useSaved("tariff", "agile");
  const [region, setRegion] = useSaved("region", "");
  const [e7, setE7] = useSaved("e7", DEFAULT_E7);
  const [flatOverride, setFlatOverride] = useSaved("flatRate", null);

  const [applianceId, setApplianceId] = useState(null);
  const [kWh, setKWh] = useState("");
  const [mins, setMins] = useState("");
  const [finishBy, setFinishBy] = useState(null);

  const [slots, setSlots] = useState({ key: null, state: "idle", data: [] });
  const [refRate, setRefRate] = useState(null);

  // Tick once a minute so timers stay right, and refetch each new half hour.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);
  const slotKey = currentSlotStart(now);

  // Load prices whenever the tariff or region changes.
  const fetchKey = tariff !== "e7" && region ? `${tariff}|${region}` : null;
  useEffect(() => {
    if (!fetchKey) return;
    const ctrl = new AbortController();
    Promise.all([loadSlots(tariff, region, ctrl.signal), standardRate(region, ctrl.signal)])
      .then(([data, ref]) => {
        setSlots({ key: fetchKey, state: "ready", data });
        setRefRate(ref);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setSlots({ key: fetchKey, state: "error", data: [] });
      });
    return () => ctrl.abort();
  }, [fetchKey, tariff, region, slotKey]);
  // Half-hourly refreshes keep showing the old prices until the new ones land.
  const loading = fetchKey && slots.key !== fetchKey;

  // Economy 7 and user-entered flat rates are worked out locally.
  const effectiveSlots = useMemo(() => {
    if (tariff === "e7") {
      const ok = [e7.dayRate, e7.nightRate].every((v) => typeof v === "number") && e7.nightStart && e7.nightEnd;
      return ok ? economy7Slots(e7, slotKey) : [];
    }
    if (tariff === "flat" && typeof flatOverride === "number") {
      return slots.data.map((s) => ({ ...s, price: flatOverride }));
    }
    return slots.data;
  }, [tariff, e7, flatOverride, slots.data, slotKey]);

  const ready = tariff === "e7" ? effectiveSlots.length > 0 : !loading && slots.state === "ready";

  const finishOptions = useMemo(() => {
    if (!effectiveSlots.length || !mins) return [];
    const earliest = now + mins * 60000;
    const last = effectiveSlots[effectiveSlots.length - 1].start + SLOT_MS;
    const out = [];
    for (const s of effectiveSlots) {
      const t = s.start + SLOT_MS;
      if (t >= earliest && t <= last && t % 3600000 === 0) out.push(t);
    }
    return out;
  }, [effectiveSlots, mins, now]);

  // Drop a deadline that is no longer on offer (e.g. after changing tariff).
  const activeFinishBy = finishBy && finishOptions.includes(finishBy) ? finishBy : null;

  const result = useMemo(() => {
    if (!ready || !applianceId || !(kWh > 0) || !(mins > 0)) return undefined;
    return bestWindows(effectiveSlots, kWh, mins, activeFinishBy);
  }, [ready, applianceId, effectiveSlots, kWh, mins, activeFinishBy]);

  function pick(id) {
    setApplianceId(id);
    const a = APPLIANCES.find((x) => x.id === id);
    if (a) { setKWh(a.kWh); setMins(a.mins); } else { setKWh(1); setMins(60); }
  }

  const appliance = APPLIANCES.find((a) => a.id === applianceId);
  const refForResult = tariff === "e7" ? null : refRate;

  return (
    <div className="min-h-screen">
      <header className="bg-navy text-white">
        <div className="max-w-[680px] mx-auto px-4 py-8">
          <p className="text-sm uppercase tracking-wider text-white/70 font-semibold flex items-center gap-1.5"><Zap size={16} /> Cost of living tools</p>
          <h1 className="text-3xl sm:text-4xl font-semibold mt-2" style={{ color: "white" }}>When's cheapest to run it?</h1>
          <p className="mt-3 text-white/85 text-lg">Pick an appliance and we'll find the cheapest time to switch it on today or tonight, and tell you what it'll cost.</p>
        </div>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-6 space-y-4">
        <TariffStep
          tariff={tariff} setTariff={setTariff} region={region} setRegion={setRegion}
          e7={e7} setE7={setE7} flatOverride={flatOverride} setFlatOverride={setFlatOverride}
          apiFlatRate={tariff === "flat" && !loading ? slots.data[0]?.price : null}
        />

        <ApplianceStep
          applianceId={applianceId} pick={pick} kWh={kWh} setKWh={setKWh} mins={mins} setMins={setMins}
          finishBy={activeFinishBy} setFinishBy={setFinishBy} finishOptions={finishOptions}
        />

        {tariff !== "e7" && !region && applianceId && (
          <Card><p className="text-gray-700">Choose your region in step 1 to see prices.</p></Card>
        )}
        {loading && (
          <Card><p className="text-gray-600">Getting today's prices…</p></Card>
        )}
        {fetchKey && !loading && slots.state === "error" && (
          <Card>
            <div className="flex gap-3 text-warning">
              <AlertCircle className="shrink-0 mt-0.5" size={20} />
              <p>We couldn't get prices from Octopus Energy just now. Check your connection and try again in a minute.</p>
            </div>
          </Card>
        )}
        {result !== undefined && (
          <Result
            result={result} slots={effectiveSlots} kWh={kWh} perWeek={appliance?.perWeek ?? 0}
            tariff={tariff} refRate={refForResult} finishBy={activeFinishBy} now={now}
          />
        )}

        <footer className="text-sm text-gray-500 pt-4 pb-10 space-y-2">
          <p>
            Prices come from Octopus Energy's public data and include VAT. Costs are estimates: real appliances use power unevenly, and your own model may use more or less. Standing charges are the same whenever you run things, so they're left out.
          </p>
          <p>
            <a href="https://developer.octopus.energy/rest/" className="underline inline-flex items-center gap-1" target="_blank" rel="noopener noreferrer">About the Octopus Energy price data <ExternalLink size={13} /></a>
          </p>
        </footer>
      </main>
    </div>
  );
}
