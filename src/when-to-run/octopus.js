// Octopus Energy's public API — no key needed, CORS open.
const API = "https://api.octopus.energy/v1";
const SLOT_MS = 30 * 60 * 1000;

// Product codes change when Octopus relaunches a tariff, so we look them up by
// name and only fall back to these known codes if that lookup fails.
export const TARIFFS = [
  { id: "agile", label: "Agile Octopus", match: /^Agile Octopus$/, fallback: "AGILE-24-10-01", blurb: "Price changes every half hour" },
  { id: "go", label: "Octopus Go", match: /^Octopus Go$/, fallback: "GO-VAR-22-10-14", blurb: "Cheap rate overnight" },
  { id: "cosy", label: "Cosy Octopus", match: /^Cosy Octopus$/, fallback: "COSY-22-12-08", blurb: "Three cheap windows a day" },
  { id: "e7", label: "Economy 7", blurb: "Cheaper at night, any supplier" },
  { id: "flat", label: "Standard or fixed", match: /^Flexible Octopus$/, fallback: "VAR-22-11-01", blurb: "Same price all day, any supplier" },
];

async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Octopus API returned ${res.status}`);
  return res.json();
}

// Shared across calls so the product list is only downloaded once. It isn't
// tied to any one request's abort signal, and a failed lookup isn't cached.
let productsPromise = null;
async function productCode(tariff) {
  try {
    productsPromise ??= getJSON(`${API}/products/?brand=OCTOPUS_ENERGY&is_variable=true&page_size=100`)
      .then((data) => data.results)
      .catch((e) => { productsPromise = null; throw e; });
    const products = await productsPromise;
    const found = products.find((p) => tariff.match.test(p.display_name) && !p.available_to);
    return found ? found.code : tariff.fallback;
  } catch {
    return tariff.fallback;
  }
}

export async function regionFromPostcode(postcode, signal) {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  const data = await getJSON(`${API}/industry/grid-supply-points/?postcode=${encodeURIComponent(clean)}`, signal);
  const group = data.results?.[0]?.group_id;
  return group ? group.replace("_", "") : null;
}

async function unitRates(product, region, from, to, signal) {
  const tariffCode = `E-1R-${product}-${region}`;
  const url = `${API}/products/${product}/electricity-tariffs/${tariffCode}/standard-unit-rates/` +
    `?period_from=${new Date(from).toISOString()}&period_to=${new Date(to).toISOString()}&page_size=1500`;
  const data = await getJSON(url, signal);
  // Flat tariffs list a direct debit and a non-direct debit price; use direct debit.
  return data.results
    .filter((r) => r.payment_method !== "NON_DIRECT_DEBIT")
    .map((r) => ({
      from: Date.parse(r.valid_from),
      to: r.valid_to ? Date.parse(r.valid_to) : Infinity,
      price: r.value_inc_vat,
    }));
}

export function currentSlotStart(now = Date.now()) {
  return Math.floor(now / SLOT_MS) * SLOT_MS;
}

// Expand rate periods into half-hour slots from `start` until rates run out
// or `end` is reached.
function toSlots(rates, start, end) {
  const slots = [];
  for (let t = start; t < end; t += SLOT_MS) {
    const rate = rates.find((r) => r.from <= t && t < r.to);
    if (!rate) break;
    slots.push({ start: t, price: rate.price });
  }
  return slots;
}

// Returns half-hour slots ({ start, price } in p/kWh) for the next day or so.
export async function loadSlots(tariffId, region, signal) {
  const tariff = TARIFFS.find((t) => t.id === tariffId);
  const start = currentSlotStart();
  // Agile publishes tomorrow's prices around 4pm, so it can reach ~35 hours ahead.
  const end = start + (tariffId === "agile" ? 48 : 24) * 60 * 60 * 1000;
  const product = await productCode(tariff);
  const rates = await unitRates(product, region, start, end, signal);
  return toSlots(rates, start, end);
}

// The typical standard rate in this region, used to show what a run would
// cost on an ordinary tariff.
export async function standardRate(region, signal) {
  const slots = await loadSlots("flat", region, signal);
  return slots[0]?.price ?? null;
}

// Hour and minute of a timestamp in UK time, as minutes past midnight.
export function ukMinutes(t) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(new Date(t));
  const get = (type) => Number(parts.find((p) => p.type === type).value);
  return get("hour") * 60 + get("minute");
}

// Economy 7 has no API: build slots from the user's night window and rates.
export function economy7Slots({ nightStart, nightEnd, dayRate, nightRate }, start = currentSlotStart()) {
  const toMins = (hhmm) => {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  };
  const ns = toMins(nightStart);
  const ne = toMins(nightEnd);
  const slots = [];
  for (let i = 0; i < 48; i++) {
    const t = start + i * SLOT_MS;
    const m = ukMinutes(t);
    const night = ns <= ne ? m >= ns && m < ne : m >= ns || m < ne;
    slots.push({ start: t, price: night ? nightRate : dayRate });
  }
  return slots;
}

export { SLOT_MS };
