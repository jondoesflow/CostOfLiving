// Calendar feed: /calendar.ics?t=agile&r=M&k=0.8&m=120&n=Washing%20machine
// Each time a calendar app refreshes it, this works out the cheapest time to
// run the appliance and returns it as an event with an alert at the start.
import { TARIFFS, loadSlots, economy7Slots, ukMinutes, SLOT_MS } from "../../src/prices.js";
import { bestWindows } from "../../src/optimise.js";
import { icsCalendar, reminderTitle } from "../../src/lib/calendar.js";

const DAY = 24 * 3600 * 1000;
const REGION = /^[A-HJ-NP]$/;
const TIME = /^\d{2}:\d{2}$/;

function bad(message) {
  return new Response(message, { status: 400, headers: { "content-type": "text/plain; charset=utf-8" } });
}

export default async (req) => {
  const q = new URL(req.url).searchParams;
  const tariff = q.get("t");
  const region = q.get("r") ?? "";
  const kWh = Number(q.get("k"));
  const mins = Number(q.get("m"));
  const name = (q.get("n") ?? "appliance").slice(0, 60);

  const live = TARIFFS.find((t) => t.id === tariff && t.supplier);
  if (!live && tariff !== "e7") return bad("Unsupported tariff");
  if (live && !REGION.test(region)) return bad("Missing or invalid region");
  if (!(kWh > 0 && kWh < 200) || !(mins >= 30 && mins <= 24 * 60)) return bad("Invalid appliance figures");

  let slots;
  if (live) {
    try {
      slots = await loadSlots(tariff, region);
    } catch {
      return new Response("Prices unavailable, try again later", { status: 503 });
    }
  } else {
    const e7 = { nightStart: q.get("ns"), nightEnd: q.get("ne"), dayRate: Number(q.get("dr")), nightRate: Number(q.get("nr")) };
    if (!TIME.test(e7.nightStart ?? "") || !TIME.test(e7.nightEnd ?? "") || !Number.isFinite(e7.dayRate) || !Number.isFinite(e7.nightRate)) {
      return bad("Invalid off-peak settings");
    }
    slots = economy7Slots(e7);
  }

  // Dynamic tariffs only publish about a day ahead, so offer the best time we
  // can see. Fixed-pattern tariffs repeat daily, so show the next three days.
  const found = bestWindows(slots, kWh, mins)?.best;
  const windows = found ? [found] : [];
  if (found && !live?.dynamic) {
    for (let d = 1; d < 3; d++) {
      // Keep the same UK clock time when the clocks change in between.
      let shift = ukMinutes(found.start) - ukMinutes(found.start + d * DAY);
      if (shift > 720) shift -= 1440;
      if (shift < -720) shift += 1440;
      const offset = d * DAY + shift * 60000;
      windows.push({ start: found.start + offset, end: found.end + offset });
    }
  }

  const title = reminderTitle(name);
  const events = windows.map((w) => ({
    // One event per day, so a refresh moves the reminder instead of adding another.
    uid: `${tariff}-${region}-${name.replace(/\W+/g, "-")}-${new Date(w.start).toISOString().slice(0, 10)}@whentorunit`,
    start: w.start,
    end: Math.max(w.end, w.start + SLOT_MS),
    title,
    description: "Cheapest time to run it on your tariff, found by whentorunit.netlify.app. This updates as prices change.",
  }));

  return new Response(icsCalendar(events, { name: `When to run: ${name}`, refreshHours: 3 }), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "public, max-age=900",
    },
  });
};

export const config = { path: "/calendar.ics" };
