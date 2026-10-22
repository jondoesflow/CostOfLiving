// National Grid ESO's regional carbon intensity forecast (free, no key, CORS open).
import { currentSlotStart } from "./prices.js";

// Carbon API region ids for each electricity region letter.
const CARBON_REGION = { A: 10, B: 9, C: 13, D: 6, E: 8, F: 4, G: 3, H: 12, J: 14, K: 7, L: 11, M: 5, N: 2, P: 1 };

// Half-hourly slots ({ start, price }) where `price` is grams of CO2 per kWh,
// so they work with the same window-finding code as prices.
export async function loadCarbon(region, signal) {
  const id = CARBON_REGION[region];
  if (!id) return [];
  const from = new Date(currentSlotStart()).toISOString().slice(0, 16) + "Z";
  const res = await fetch(`https://api.carbonintensity.org.uk/regional/intensity/${from}/fw48h/regionid/${id}`, { signal });
  if (!res.ok) throw new Error(`Carbon API returned ${res.status}`);
  const body = await res.json();
  return body.data.data
    .map((d) => ({ start: Date.parse(d.from), price: d.intensity.forecast }))
    .filter((d) => d.start >= currentSlotStart());
}
