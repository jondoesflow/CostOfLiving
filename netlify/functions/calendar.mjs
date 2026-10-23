// Calendar feed: /calendar.ics?t=agile&r=M&k=0.8&m=120&n=Washing%20machine
// Each time a calendar app refreshes it, this works out the cheapest time to
// run the appliance and returns it as an event with an alert at the start.
import { ukMinutes, SLOT_MS } from "../../src/prices.js";
import { bestWindows } from "../../src/optimise.js";
import { icsCalendar, reminderTitle } from "../../src/lib/calendar.js";
import { readFeedRequest } from "../../src/lib/feedRequest.js";

const DAY = 24 * 3600 * 1000;

export default async (req) => {
  const request = await readFeedRequest(new URL(req.url).searchParams);
  if (request.error) return request.error;
  const { tariff, region, kWh, mins, name, live, slots, profile } = request;

  // Dynamic tariffs only publish about a day ahead, so offer the best time we
  // can see. Fixed-pattern tariffs repeat daily, so show the next three days.
  const found = bestWindows(slots, kWh, mins, null, { profile })?.best;
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
    uid: `${tariff}-${region}-${name.replace(/\W+/g, "-")}-${new Date(w.start).toISOString().slice(0, 10)}@cheapwatts`,
    start: w.start,
    end: Math.max(w.end, w.start + SLOT_MS),
    title,
    description: "Cheapest time to run it on your tariff, found by Cheap Watts (cheapwatts.co.uk). This updates as prices change.",
  }));

  return new Response(icsCalendar(events, { name: `Cheap Watts: ${name}`, refreshHours: 3 }), {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "cache-control": "public, max-age=900",
    },
  });
};

export const config = { path: "/calendar.ics" };
