// Octopus, EDF and E.ON Next all run on the Kraken platform, which has a
// public price API (no key needed, CORS open). Other suppliers don't publish
// prices this way, so their customers use the off-peak or standard options.
const OCTOPUS_API = "https://api.octopus.energy/v1";
const SLOT_MS = 30 * 60 * 1000;

export const SUPPLIERS = [
  { id: "octopus", name: "Octopus Energy", api: OCTOPUS_API, list: "?brand=OCTOPUS_ENERGY&is_variable=true" },
  { id: "edf", name: "EDF", api: "https://api.edfgb-kraken.energy/v1", list: "" },
  { id: "eon", name: "E.ON Next", api: "https://api.eonnext-kraken.energy/v1", list: "" },
  { id: "britishgas", name: "British Gas" },
  { id: "ovo", name: "OVO" },
  { id: "scottishpower", name: "ScottishPower" },
  { id: "other", name: "Someone else" },
];

// Product codes change whenever a supplier relaunches a tariff, so live
// tariffs are found by name and the newest version is used. `dynamic` tariffs
// publish tomorrow's prices in the afternoon, so we look further ahead.
export const TARIFFS = [
  { id: "agile", supplier: "octopus", label: "Agile Octopus", match: /^Agile Octopus$/, dynamic: true, blurb: "Price changes every half hour" },
  { id: "go", supplier: "octopus", label: "Octopus Go", match: /^Octopus Go$/, blurb: "Cheap rate overnight" },
  { id: "cosy", supplier: "octopus", label: "Cosy Octopus", match: /^Cosy Octopus$/, blurb: "Three cheap windows a day" },
  { id: "edf-dynamic", supplier: "edf", label: "FreePhase Dynamic", match: /^FreePhase Dynamic/i, dynamic: true, blurb: "Price changes through the day" },
  { id: "edf-goelectric", supplier: "edf", label: "GoElectric", match: /^Go Electric/i, blurb: "Cheap rate overnight, for EV drivers" },
  { id: "eon-drive", supplier: "eon", label: "Next Drive", match: /^Next Drive Fixed/i, blurb: "Cheap rate overnight, for EV drivers" },
  { id: "eon-drive-smart", supplier: "eon", label: "Next Drive Smart", match: /^Next Drive Smart/i, blurb: "Next Drive with a smart charger" },
  { id: "e7", label: "Economy 7 or another off-peak tariff", blurb: "Enter your cheap hours and rates from your bill" },
  { id: "flat", label: "Standard or fixed", blurb: "Same price all day" },
];

// What you're paid for electricity you send back to the grid.
export const EXPORT_TARIFFS = [
  { id: "agile-outgoing", supplier: "octopus", label: "Agile Outgoing", match: /^Agile Outgoing Octopus$/, dynamic: true, blurb: "Octopus, price changes every half hour" },
  { id: "outgoing", supplier: "octopus", label: "Outgoing Octopus", match: /^Outgoing Octopus$/, blurb: "Octopus, fixed rate" },
  { id: "own", label: "My own export rate", blurb: "Any supplier: enter the rate from your export agreement" },
];

// Used as the "standard tariff" comparison and to pre-fill the flat rate.
export const REFERENCE = { id: "standard", supplier: "octopus", label: "Standard variable (price cap)", match: /^Flexible Octopus$/ };

const findTariff = (id) => (id === "flat" || id === "standard" ? REFERENCE : [...TARIFFS, ...EXPORT_TARIFFS].find((t) => t.id === id));

export function tariffsFor(supplierId) {
  return TARIFFS.filter((t) => !t.supplier || t.supplier === supplierId);
}

async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`Price API returned ${res.status}`);
  return res.json();
}

// Each supplier's product list is downloaded once and shared. It isn't tied to
// any one request's abort signal, and a failed download isn't cached.
const productLists = {};
function products(supplier) {
  productLists[supplier.id] ??= (async () => {
    const all = [];
    let url = `${supplier.api}/products/${supplier.list}`;
    while (url) {
      const page = await getJSON(url);
      all.push(...page.results);
      url = page.next;
    }
    return all;
  })().catch((e) => { delete productLists[supplier.id]; throw e; });
  return productLists[supplier.id];
}

// The newest on-sale product matching the tariff, then its code for the region.
async function tariffCode(tariff, region, signal) {
  const supplier = SUPPLIERS.find((s) => s.id === tariff.supplier);
  const now = Date.now();
  const matches = (await products(supplier))
    .filter((p) => tariff.match.test(p.display_name) && !/test/i.test(p.display_name))
    .filter((p) => !p.available_to || Date.parse(p.available_to) > now)
    .sort((a, b) => a.code.localeCompare(b.code, "en", { numeric: true }));
  const product = matches[matches.length - 1];
  if (!product) throw new Error(`No current ${tariff.label ?? "reference"} tariff found`);

  const detail = await getJSON(`${supplier.api}/products/${product.code}/`, signal);
  const byRegion = detail.single_register_electricity_tariffs?.[`_${region}`];
  const tariffForRegion = byRegion?.direct_debit_monthly ?? Object.values(byRegion ?? {})[0];
  if (!tariffForRegion) throw new Error(`${product.code} isn't available in region ${region}`);
  return {
    api: supplier.api,
    product: product.code,
    code: tariffForRegion.code,
    standingCharge: tariffForRegion.standing_charge_inc_vat ?? 0,
    description: detail.description ?? "",
  };
}

// Typical gas unit rate and standing charge for the region (standard variable).
export async function gasRate(region, signal) {
  const supplier = SUPPLIERS.find((s) => s.id === REFERENCE.supplier);
  const product = (await products(supplier)).find((p) => REFERENCE.match.test(p.display_name) && !p.available_to);
  if (!product) throw new Error("No standard gas tariff found");
  const detail = await getJSON(`${supplier.api}/products/${product.code}/`, signal);
  const byRegion = detail.single_register_gas_tariffs?.[`_${region}`];
  const t = byRegion?.direct_debit_monthly ?? Object.values(byRegion ?? {})[0];
  if (!t) throw new Error("No gas rate for region");
  return { unitRate: t.standard_unit_rate_inc_vat, standingCharge: t.standing_charge_inc_vat };
}

export async function regionFromPostcode(postcode, signal) {
  const clean = postcode.replace(/\s+/g, "").toUpperCase();
  const data = await getJSON(`${OCTOPUS_API}/industry/grid-supply-points/?postcode=${encodeURIComponent(clean)}`, signal);
  const group = data.results?.[0]?.group_id;
  return group ? group.replace("_", "") : null;
}

async function unitRates({ api, product, code }, from, to, signal) {
  const url = `${api}/products/${product}/electricity-tariffs/${code}/standard-unit-rates/` +
    `?period_from=${new Date(from).toISOString()}&period_to=${new Date(to).toISOString()}&page_size=1500`;
  const results = [];
  let next = url;
  while (next) {
    const page = await getJSON(next, signal);
    results.push(...page.results);
    next = page.next;
  }
  // Some tariffs list a direct debit and a non-direct debit price; use direct debit.
  return results
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
async function slotsFor(tariff, region, signal) {
  const start = currentSlotStart();
  // Dynamic tariffs publish tomorrow's prices around 4pm, so can reach ~35 hours ahead.
  const end = start + (tariff.dynamic ? 48 : 24) * 60 * 60 * 1000;
  const code = await tariffCode(tariff, region, signal);
  const rates = await unitRates(code, start, end, signal);
  return toSlots(rates, start, end);
}

export function loadSlots(tariffId, region, signal) {
  return slotsFor(findTariff(tariffId), region, signal);
}

// The typical standard rate in this region, used to show what a run would
// cost on an ordinary tariff.
export async function standardRate(region, signal) {
  const slots = await slotsFor(REFERENCE, region, signal);
  return slots[0]?.price ?? null;
}

// Everything needed to cost past usage on a tariff: a price for any moment
// in [from, to), plus the daily standing charge. Dynamic tariffs use their
// real historical prices; others repeat today's pattern by time of day.
export async function pricingFor(tariffId, region, from, to, signal) {
  const tariff = findTariff(tariffId);
  const code = await tariffCode(tariff, region, signal);
  const today = toSlots(await unitRates(code, currentSlotStart(), currentSlotStart() + 24 * 3600 * 1000, signal),
    currentSlotStart(), currentSlotStart() + 24 * 3600 * 1000);
  const byTimeOfDay = new Map(today.map((s) => [ukMinutes(s.start), s.price]));
  let history = null;
  if (tariff.dynamic) {
    history = new Map();
    for (const r of await unitRates(code, from, to, signal)) {
      for (let t = Math.max(r.from, from); t < Math.min(r.to, to); t += SLOT_MS) history.set(t, r.price);
    }
  }
  return {
    standingCharge: code.standingCharge,
    description: code.description,
    priceAt: (t) => history?.get(currentSlotStart(t)) ?? byTimeOfDay.get(ukMinutes(currentSlotStart(t))) ?? today[0]?.price ?? 0,
  };
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
