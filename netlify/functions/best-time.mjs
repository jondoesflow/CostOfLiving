// Best-time link for smart home systems:
//   /api/best-time?t=agile&r=M&k=0.8&m=120[&by=07:00]
// Takes the same settings as the calendar feed (see src/lib/feedRequest.js)
// and returns the cheapest start time as JSON, for Home Assistant and the like.
// `by` (HH:MM, UK time) means it must be finished by then.
import { SLOT_MS, ukMinutes } from "../../src/prices.js";
import { bestWindows, pricesPending, nearPeak } from "../../src/optimise.js";
import { readFeedRequest, textResponse } from "../../src/lib/feedRequest.js";

const BY = /^([01]\d|2[0-3]):([0-5]\d)$/;
const iso = (t) => new Date(t).toISOString();
const pence = (p) => Math.round(p * 100) / 100;

// The next time the UK clock reads `by` that leaves room for the run.
function finishByTime(slots, by, mins, now) {
  const [, h, m] = by.match(BY);
  const target = Number(h) * 60 + Number(m);
  for (const s of slots) {
    for (let t = s.start; t < s.start + SLOT_MS; t += 60000) {
      if (t >= now + mins * 60000 && ukMinutes(t) === target) return t;
    }
  }
  return null;
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const by = q.get("by");
  if (by && !BY.test(by)) return textResponse("Invalid finish time: use HH:MM", 400);
  const request = await readFeedRequest(q);
  if (request.error) return request.error;
  const { tariff, region, kWh, mins, live, slots } = request;

  const now = Date.now();
  const finishBy = by ? finishByTime(slots, by, mins, now) : null;
  const result = by && !finishBy ? null : bestWindows(slots, kWh, mins, finishBy);
  const pending = pricesPending(live, slots, now);
  const best = result?.best;

  const body = {
    tariff, region: region || null, kwh: kWh, minutes: mins, finish_by: finishBy ? iso(finishBy) : null,
    start: best ? iso(Math.max(best.start, now)) : null,
    end: best ? iso(best.end) : null,
    starts_now: best ? best.index === 0 : null,
    start_in_minutes: best ? Math.max(0, Math.round((best.start - now) / 60000)) : null,
    finish_in_minutes: best ? Math.max(0, Math.round((best.end - now) / 60000)) : null,
    cost_pence: best ? pence(best.cost) : null,
    cost_now_pence: result ? pence(result.now.cost) : null,
    saving_pence: result ? pence(result.now.cost - best.cost) : null,
    any_time_same: result ? result.allSame : null,
    prices_until: slots.length ? iso(slots[slots.length - 1].start + SLOT_MS) : null,
    tomorrow_prices_published: !pending,
    cheapest_so_far: Boolean(best && pending && !result.allSame && nearPeak(slots, best)),
    message: best ? null : by ? "It can't finish by then with the prices published so far." : "Not enough prices published ahead for a run this long yet.",
    updated: iso(now),
  };

  return new Response(JSON.stringify(body, null, 2), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
      "cache-control": "public, max-age=300",
    },
  });
};

export const config = { path: "/api/best-time" };
