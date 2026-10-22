import { SLOT_MS } from "./prices";

// Share of the run's energy used in each half-hour slot, assuming it draws
// evenly across the run. A 45-minute run is [2/3, 1/3].
function slotWeights(mins) {
  const weights = [];
  let left = mins;
  while (left > 0) {
    const used = Math.min(30, left);
    weights.push(used / mins);
    left -= used;
  }
  return weights;
}

// Cost in pence for every possible start slot. `finishBy` (a timestamp)
// rules out starts that would end after it. The first slot is treated as
// "now" even though part of it has passed.
export function windowCosts(slots, kWh, mins, finishBy = null) {
  const weights = slotWeights(Math.max(1, mins));
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

export function bestWindows(slots, kWh, mins, finishBy) {
  const all = windowCosts(slots, kWh, mins, finishBy);
  if (all.length === 0) return null;
  const sorted = [...all].sort((a, b) => a.cost - b.cost || a.start - b.start);
  // Nobody wants to wait a day to save a fraction of a penny, so take the
  // soonest start that's within half a penny (or 3%) of the cheapest.
  const cheapest = sorted[0].cost;
  const best = all.find((w) => w.cost <= cheapest + Math.max(0.5, Math.abs(cheapest) * 0.03));

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
  if (sooner && (sooner === all[0] || all[0].cost - sooner.cost < 0.5)) sooner = null;

  return {
    best,
    sooner,
    now: all[0],
    worst: sorted[sorted.length - 1],
    alternatives,
    allSame: sorted[sorted.length - 1].cost - best.cost < 0.05,
  };
}

export function lastPossibleFinish(slots) {
  return slots.length ? slots[slots.length - 1].start + SLOT_MS : null;
}
