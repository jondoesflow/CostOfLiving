// Movable loads in half-hourly usage, mainly electric car charging.
//
// Past usage is shaped by the tariff someone was on: an Octopus Go customer
// charges between 12:30am and 5:30am, and Intelligent Octopus Go charges
// whenever Octopus schedules it, sometimes in the daytime. Pricing that
// history as-is on another tariff unfairly penalises it. So we find the big,
// steady draws, take them out, and for each tariff put the same energy back
// into that tariff's own cheapest hours, as the household would if they
// switched.
import { ukMinutes } from "../prices.js";

const DAY_MIN = 24 * 60;
const NOON = 12 * 60;
// Charging is assumed to happen while the car is home: 6pm to 8am, measured
// from the noon that starts each day's block. Anything that doesn't fit spills
// into the cheapest remaining slots.
const HOME_FROM = 6 * 60; // 6pm
const HOME_TO = 20 * 60; // 8am the next day

// Each day runs noon to noon, so a night's charging stays together.
export const blockStart = (t) => t - ((((ukMinutes(t) - NOON) % DAY_MIN) + DAY_MIN) % DAY_MIN) * 60000;

export function findFlexibleLoad(usage) {
  const values = usage.readings.map((r) => r.kWh).sort((a, b) => a - b);
  // The household's normal level: most half hours sit below this.
  const base = Math.min(1, values[Math.floor(values.length * 0.8)] ?? 0);
  // A half hour counts as charging when it's well above normal and at least
  // 1.2kWh (a steady 2.4kW), which most other appliances don't sustain.
  const threshold = Math.max(1.2, base * 2.5);

  const flex = new Map();
  const blocks = new Map();
  let total = 0;
  let peak = 0;
  for (const r of usage.readings) {
    if (r.kWh <= threshold) continue;
    const kWh = r.kWh - base;
    flex.set(r.t, kWh);
    const start = blockStart(r.t);
    blocks.set(start, (blocks.get(start) ?? 0) + kWh);
    total += kWh;
    peak = Math.max(peak, kWh);
  }
  return {
    flex,
    total,
    perWeek: (total / usage.days) * 7,
    // Charger speed in kWh per half hour, from the biggest draw seen
    // (a 7kW home charger is about 3.5).
    rate: Math.min(3.7, Math.max(1, peak)),
    blocks: [...blocks].map(([start, kWh]) => ({ start, kWh })),
    // Worth mentioning only when it's a meaningful share of the bill.
    significant: total >= usage.total * 0.05 && (total / usage.days) * 7 >= 10,
  };
}

// Cost of one day's movable energy, placed into a tariff's cheapest slots.
function shiftedCost(block, kWh, rate, priceAt) {
  const slots = [];
  for (let m = 0; m < DAY_MIN; m += 30) slots.push({ t: block + m * 60000, home: m >= HOME_FROM && m < HOME_TO });
  const byPrice = (a, b) => priceAt(a.t) - priceAt(b.t) || a.t - b.t;
  const order = [...slots.filter((s) => s.home).sort(byPrice), ...slots.filter((s) => !s.home).sort(byPrice)];
  let left = kWh;
  let cost = 0;
  for (const s of order) {
    if (left <= 0) break;
    const e = Math.min(rate, left);
    cost += e * priceAt(s.t);
    left -= e;
  }
  return cost;
}

// Energy cost in pence. With `flexible`, movable load is re-timed per tariff.
export function energyCost(usage, priceAt, flexible = null) {
  let cost = 0;
  for (const r of usage.readings) cost += (r.kWh - (flexible?.flex.get(r.t) ?? 0)) * priceAt(r.t);
  if (flexible) for (const b of flexible.blocks) cost += shiftedCost(b.start, b.kWh, flexible.rate, priceAt);
  return cost;
}
