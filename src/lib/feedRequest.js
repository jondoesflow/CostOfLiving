// Shared by the calendar feed and the best-time link: reads the tariff,
// region and appliance figures from a query string and loads the prices.
//   t   tariff id (agile, go, cosy, ...) or "e7" for your own off-peak times
//   r   region letter, A to P (not needed for e7)
//   k   kWh per run, m minutes per run, n appliance name (optional)
//   a   appliance id (optional), for when in the run it uses its power
//   ns, ne, dr, nr   e7 only: night start and end (HH:MM), day and night rates
import { TARIFFS, loadSlots, economy7Slots } from "../prices.js";
import { profileOf } from "../appliances.js";

const REGION = /^[A-HJ-NP]$/;
const TIME = /^\d{2}:\d{2}$/;

export function textResponse(message, status) {
  return new Response(message, { status, headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" } });
}

// Returns { error: Response } or the settings with `slots` loaded.
export async function readFeedRequest(q) {
  const tariff = q.get("t");
  const region = q.get("r") ?? "";
  const kWh = Number(q.get("k"));
  const mins = Number(q.get("m"));
  const name = (q.get("n") ?? "appliance").slice(0, 60);

  const live = TARIFFS.find((t) => t.id === tariff && t.supplier);
  if (!live && tariff !== "e7") return { error: textResponse("Unsupported tariff", 400) };
  if (live && !REGION.test(region)) return { error: textResponse("Missing or invalid region", 400) };
  if (!(kWh > 0 && kWh < 200) || !(mins >= 1 && mins <= 24 * 60)) return { error: textResponse("Invalid appliance figures", 400) };

  let slots;
  if (live) {
    try {
      slots = await loadSlots(tariff, region);
    } catch {
      return { error: textResponse("Prices unavailable, try again later", 503) };
    }
  } else {
    const e7 = { nightStart: q.get("ns"), nightEnd: q.get("ne"), dayRate: Number(q.get("dr")), nightRate: Number(q.get("nr")) };
    if (!TIME.test(e7.nightStart ?? "") || !TIME.test(e7.nightEnd ?? "") || !Number.isFinite(e7.dayRate) || !Number.isFinite(e7.nightRate)) {
      return { error: textResponse("Invalid off-peak settings", 400) };
    }
    slots = economy7Slots(e7);
  }
  return { tariff, region, kWh, mins, name, live, slots, profile: profileOf(q.get("a")) };
}
