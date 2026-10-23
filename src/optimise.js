import { SLOT_MS, ukMinutes } from "./prices.js";

const ukDay = (t) => new Date(t).toLocaleDateString("en-GB", { timeZone: "Europe/London" });

// Dynamic tariffs publish the next day's prices in the afternoon, so before
// then the last price we have is for tonight.
export const pricesPending = (tariff, slots, now = Date.now()) =>
  Boolean(tariff?.dynamic && slots.length && ukDay(slots[slots.length - 1].start) === ukDay(now));

// Whether a run touches the 4pm to 7pm peak, or the half hour after it.
const PEAK_FROM = 16 * 60;
const PEAK_TO = 19 * 60 + 30;
export function nearPeak(slots, w) {
  for (let i = w.index; i < w.index + w.slotCount; i++) {
    const m = ukMinutes(slots[i].start);
    if (m >= PEAK_FROM && m < PEAK_TO) return true;
  }
  return false;
}

// Share of the run's energy used in each half-hour slot. `profile` is a list
// of [share of the run time, share of the energy] in order, e.g. a washing
// machine heating its water at the start is [[0.2, 0.8], [0.8, 0.2]]. With no
// profile it draws evenly: a 45-minute run is [2/3, 1/3].
function slotWeights(mins, profile) {
  let t = 0;
  const parts = (profile ?? [[1, 1]]).map(([time, energy]) => {
    const from = t;
    t += time * mins;
    return { from, to: t, rate: energy / (time * mins) };
  });
  const weights = [];
  for (let from = 0; from < mins; from += 30) {
    const to = Math.min(from + 30, mins);
    let w = 0;
    for (const p of parts) {
      const overlap = Math.min(to, p.to) - Math.max(from, p.from);
      if (overlap > 0) w += overlap * p.rate;
    }
    weights.push(w);
  }
  return weights;
}

// Cost in pence for every possible start slot. `finishBy` (a timestamp)
// rules out starts that would end after it. The first slot is treated as
// "now" even though part of it has passed.
export function windowCosts(slots, kWh, mins, finishBy = null, profile = null) {
  const weights = slotWeights(Math.max(1, mins), profile);
  const out = [];
  for (let i = 0; i + weights.length <= slots.length; i++) {
    const end = slots[i].start + mins * 60 * 1000;
    if (finishBy && end > finishBy) break;
    let avgPrice = 0;
    weights.forEach((w, j) => { avgPrice += w * slots[i + j].price; });
    out.push({ index: i, start: slots[i].start, end, slotCount: weights.length, cost: kWh * avgPrice });
  }
  return out;
}

// How much dearer than the cheapest a sooner start can be and still win.
// Relative, so small loads like an electric blanket aren't moved to a time
// that costs a quarter more.
const nearlyCheapest = (cheapest) => Math.max(0.1, Math.abs(cheapest) * 0.03);

// `notBefore` (a timestamp) rules out runs that would finish before it, so
// washing isn't left sitting in the machine for hours.
export function bestWindows(slots, kWh, mins, finishBy = null, { notBefore = null, profile = null } = {}) {
  const every = windowCosts(slots, kWh, mins, null, profile);
  const all = every.filter((w) => (!finishBy || w.end <= finishBy) && (!notBefore || w.end >= notBefore));
  if (all.length === 0) return null;
  const sorted = [...all].sort((a, b) => a.cost - b.cost || a.start - b.start);
  // Nobody wants to wait a day to save a fraction of a penny, so take the
  // soonest start that's within 3% (or a tenth of a penny) of the cheapest.
  const cheapest = sorted[0].cost;
  const best = all.find((w) => w.cost <= cheapest + nearlyCheapest(cheapest));

  // Up to two other good times that don't overlap the best one or each other.
  const alternatives = [];
  for (const w of sorted) {
    if (w === best) continue;
    if (alternatives.length === 2) break;
    const clashes = [best, ...alternatives].some((o) => w.start < o.end && o.start < w.end);
    // Only worth showing if it's within a few pence of the best.
    if (!clashes && w.cost - best.cost <= Math.max(2, best.cost * 0.25)) alternatives.push(w);
  }

  // If the best time is a long wait, the cheapest run that's over before it.
  let sooner = null;
  for (const w of all) {
    if (w.end > best.start) break;
    if (!sooner || w.cost < sooner.cost) sooner = w;
  }
  if (sooner && (sooner === all[0] || all[0].cost - sooner.cost < nearlyCheapest(sooner.cost))) sooner = null;

  return {
    best,
    sooner,
    now: every[0],
    worst: sorted[sorted.length - 1],
    alternatives,
    // Whether the tariff itself is flat: judged on every start time, not just
    // the ones a deadline leaves, which can happen to cost the same.
    allSame: (() => {
      const costs = every.map((w) => w.cost);
      return Math.max(...costs) - Math.min(...costs) < 0.05;
    })(),
  };
}

export function lastPossibleFinish(slots) {
  return slots.length ? slots[slots.length - 1].start + SLOT_MS : null;
}

// Fit several jobs ({ id, kWh, mins }) into the cheapest times, never running
// more than `maxAtOnce` together. Biggest users of electricity go first, since
// they gain most from the cheapest slots.
export function scheduleJobs(slots, jobs, { maxAtOnce = Infinity, finishBy = null } = {}) {
  const busy = new Array(slots.length).fill(0);
  const placed = [];
  for (const job of [...jobs].sort((a, b) => b.kWh - a.kWh)) {
    const fits = (w) => {
      for (let i = w.index; i < w.index + w.slotCount; i++) if (busy[i] >= maxAtOnce) return false;
      return true;
    };
    const options = windowCosts(slots, job.kWh, job.mins, finishBy, job.profile).filter(fits);
    const nowCost = windowCosts(slots, job.kWh, job.mins, null, job.profile)[0]?.cost ?? null;
    if (!options.length) {
      placed.push({ job, window: null, nowCost });
      continue;
    }
    // As with single runs, take the soonest start that's practically as cheap.
    const cheapest = Math.min(...options.map((w) => w.cost));
    const window = options.find((w) => w.cost <= cheapest + nearlyCheapest(cheapest));
    for (let i = window.index; i < window.index + window.slotCount; i++) busy[i]++;
    placed.push({ job, window, nowCost });
  }
  return placed.sort((a, b) => (a.window?.start ?? Infinity) - (b.window?.start ?? Infinity));
}

// Charging that can stop and start, like an electric car: the energy goes into
// the cheapest half hours rather than one unbroken block, the way a smart
// charger does it. Looks `within` ms ahead. With `cheapOnly`, only half hours
// close to the cheapest price are used, and whatever doesn't fit is left as
// `remaining` (for when tomorrow's prices aren't out yet).
export function cheapestSlots(slots, kWh, mins, { finishBy = null, within = 24 * 3600 * 1000, cheapOnly = false } = {}) {
  const perSlot = (kWh * 30) / Math.max(1, mins);
  let candidates = slots
    .map((s, index) => ({ ...s, index }))
    .filter((s) => s.start < slots[0].start + within && (!finishBy || s.start + SLOT_MS <= finishBy));
  if (!candidates.length) return null;
  if (cheapOnly) {
    const floor = Math.min(...candidates.map((s) => s.price));
    candidates = candidates.filter((s) => s.price <= floor + Math.max(2, Math.abs(floor) * 0.15));
  }

  let left = kWh;
  const chosen = [];
  for (const s of [...candidates].sort((a, b) => a.price - b.price || a.start - b.start)) {
    if (left <= 1e-9) break;
    const e = Math.min(perSlot, left);
    chosen.push({ ...s, kWh: e });
    left -= e;
  }
  chosen.sort((a, b) => a.index - b.index);

  // Back-to-back half hours become one charging session.
  const sessions = [];
  for (const s of chosen) {
    const end = s.start + (s.kWh / perSlot) * SLOT_MS;
    const last = sessions[sessions.length - 1];
    if (last && last.lastIndex === s.index - 1) {
      Object.assign(last, { end, lastIndex: s.index, kWh: last.kWh + s.kWh, cost: last.cost + s.kWh * s.price, count: last.count + 1 });
    } else {
      sessions.push({ start: s.start, end, index: s.index, lastIndex: s.index, count: 1, kWh: s.kWh, cost: s.kWh * s.price });
    }
  }

  // The same energy charged straight away, for comparison.
  const placed = kWh - Math.max(0, left);
  let nowLeft = placed;
  let nowCost = 0;
  for (const s of slots) {
    if (nowLeft <= 1e-9) break;
    const e = Math.min(perSlot, nowLeft);
    nowCost += e * s.price;
    nowLeft -= e;
  }

  return {
    sessions,
    cost: sessions.reduce((sum, s) => sum + s.cost, 0),
    placed,
    remaining: Math.max(0, left),
    nowCost,
    startsNow: sessions[0].index === 0,
  };
}
