// Deterministic stand-ins for every external API the site calls, so tests
// know exactly what the right answer is. Prices follow a simple daily shape
// by UK clock time (see `PATTERNS`), and the page clock is fixed at NOW.

export const NOW = new Date("2026-10-22T18:10:00Z"); // 7:10pm BST, Thursday
const SLOT = 30 * 60 * 1000;
const REGIONS = "ABCDEFGHJKLMNP".split("");

const ukHour = (t) => Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", hour: "2-digit", hourCycle: "h23" }).format(new Date(t)))
  + Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", minute: "2-digit" }).format(new Date(t))) / 60;

// p/kWh by UK hour of day. Tests can override one via mockApis(page, { patterns }).
const PATTERNS = {
  agile: (h) => (h < 5 ? 12 : h < 16 ? 25 : h < 19 ? 40 : 20),
  "agile-outgoing": (h) => (h < 5 ? 8 : h < 16 ? 15 : h < 19 ? 30 : 12),
  go: (h) => (h >= 0.5 && h < 5.5 ? 9 : 30),
  cosy: (h) => ((h >= 4 && h < 7) || (h >= 13 && h < 16) || h >= 22 ? 14 : h >= 16 && h < 19 ? 42 : 28),
  "edf-dynamic": (h) => (h < 5 ? 15 : h < 16 ? 28 : h < 19 ? 38 : 26),
  "edf-goelectric": (h) => (h >= 23 || h < 6 ? 6.7 : 31),
  "eon-drive": (h) => (h < 6 ? 8.5 : 34),
  "eon-drive-smart": (h) => (h < 6 ? 6.5 : 33),
};

const ACTIVE = { ...PATTERNS };

const PRODUCTS = {
  "api.octopus.energy": [
    { code: "AGILE-24-10-01", display_name: "Agile Octopus", kind: "agile", dynamic: true, description: "Half-hourly prices." },
    { code: "AGILE-OUTGOING-19-05-13", display_name: "Agile Outgoing Octopus", kind: "agile-outgoing", dynamic: true, description: "Export." },
    { code: "GO-VAR-22-10-14", display_name: "Octopus Go", kind: "go", description: "The smart EV tariff." },
    { code: "COSY-22-12-08", display_name: "Cosy Octopus", kind: "cosy", description: "Heat pump tariff." },
    { code: "VAR-22-11-01", display_name: "Flexible Octopus", flat: 25.6, gas: 7.9, description: "Standard variable." },
    { code: "OUTGOING-VAR-24-10-26", display_name: "Outgoing Octopus", flat: 12, description: "Fixed export." },
  ],
  "api.edfgb-kraken.energy": [
    { code: "EDF_FREEPHASE_DYNAMIC_12M_V2_HH", display_name: "FreePhase Dynamic 12m v2", kind: "edf-dynamic", dynamic: true, description: "Dynamic." },
    { code: "EDF_EV_FIX_GOELEC_12M_V3_HH", display_name: "Go Electric 12m v3", kind: "edf-goelectric", description: "Older version." },
    { code: "EDF_EV_FIX_GOELEC_18M_V4_HH", display_name: "Go Electric 18m v4", kind: "edf-goelectric", description: "EV." },
    { code: "EDF_FPD_12M_TEST_DO_NOT_USE_HH", display_name: "FreePhase Dynamic Test Do Not Use", kind: "edf-dynamic", description: "Test." },
  ],
  "api.eonnext-kraken.energy": [
    { code: "NEXT_DRIVE_FIXED_V36", display_name: "Next Drive Fixed V36", kind: "eon-drive", prefix: "E-TOU", description: "EV." },
    { code: "NEXT_DRIVE_SMART_V7_8", display_name: "Next Drive Smart V7.8", kind: "eon-drive-smart", prefix: "E-TOU", description: "EV smart." },
  ],
};

function json(route, body, status = 200) {
  return route.fulfill({ status, contentType: "application/json", headers: { "access-control-allow-origin": "*" }, body: JSON.stringify(body) });
}

function krakenRates(product, from, to) {
  if (product.flat != null) {
    return [
      { value_inc_vat: product.flat, valid_from: "2026-09-30T23:00:00Z", valid_to: null, payment_method: "DIRECT_DEBIT" },
      { value_inc_vat: product.flat + 1.5, valid_from: "2026-09-30T23:00:00Z", valid_to: null, payment_method: "NON_DIRECT_DEBIT" },
    ];
  }
  // Dynamic tariffs are published up to 11pm UK time tomorrow.
  const limit = product.dynamic ? Date.parse("2026-10-23T22:00:00Z") : to;
  const out = [];
  for (let t = Math.floor(from / SLOT) * SLOT; t < Math.min(to, limit); t += SLOT) {
    out.push({ value_inc_vat: ACTIVE[product.kind](ukHour(t)), valid_from: new Date(t).toISOString(), valid_to: new Date(t + SLOT).toISOString(), payment_method: null });
  }
  return out.reverse(); // the real API returns newest first
}

export async function mockApis(page, { failKraken = false, patterns = {} } = {}) {
  Object.assign(ACTIVE, PATTERNS, patterns);
  await page.clock.setFixedTime(NOW);

  await page.route(/https:\/\/(api\.octopus\.energy|api\.edfgb-kraken\.energy|api\.eonnext-kraken\.energy)\/v1\/.*/, (route) => {
    const url = new URL(route.request().url());
    if (failKraken) return json(route, { detail: "boom" }, 500);
    const products = PRODUCTS[url.host];
    const path = url.pathname;

    if (path === "/v1/industry/grid-supply-points/") {
      const pc = url.searchParams.get("postcode");
      return json(route, { count: pc === "LS14AP" ? 1 : 0, results: pc === "LS14AP" ? [{ group_id: "_M" }] : [] });
    }
    if (path === "/v1/products/") {
      return json(route, { count: products.length, next: null, results: products.map((p) => ({ code: p.code, display_name: p.display_name, available_to: null })) });
    }
    let m = path.match(/^\/v1\/products\/([^/]+)\/$/);
    if (m) {
      const p = products.find((x) => x.code === m[1]);
      if (!p) return json(route, { detail: "Not found." }, 404);
      const tariffs = Object.fromEntries(REGIONS.map((r) => [`_${r}`, { direct_debit_monthly: { code: `${p.prefix ?? "E-1R"}-${p.code}-${r}`, standing_charge_inc_vat: 60 } }]));
      const gas = p.gas != null ? Object.fromEntries(REGIONS.map((r) => [`_${r}`, { varying: { code: `G-1R-${p.code}-${r}`, standard_unit_rate_inc_vat: p.gas, standing_charge_inc_vat: 30 } }])) : {};
      return json(route, { code: p.code, description: p.description, single_register_electricity_tariffs: tariffs, single_register_gas_tariffs: gas });
    }
    m = path.match(/^\/v1\/products\/([^/]+)\/electricity-tariffs\/([^/]+)\/standard-unit-rates\/$/);
    if (m) {
      const p = products.find((x) => x.code === m[1]);
      const from = Date.parse(url.searchParams.get("period_from"));
      const to = Date.parse(url.searchParams.get("period_to"));
      const results = krakenRates(p, from, to);
      return json(route, { count: results.length, next: null, results });
    }
    return json(route, { detail: "Not found." }, 404);
  });

  await page.route(/https:\/\/api\.carbonintensity\.org\.uk\/.*/, (route) => {
    const from = Date.parse(route.request().url().match(/intensity\/([^/]+)\/fw48h/)[1]);
    const data = [];
    for (let t = from; t < from + 48 * 3600 * 1000; t += SLOT) {
      const h = ukHour(t);
      data.push({ from: new Date(t).toISOString().slice(0, 16) + "Z", to: new Date(t + SLOT).toISOString().slice(0, 16) + "Z", intensity: { forecast: h >= 2 && h < 5 ? 50 : 200, index: "moderate" } });
    }
    return json(route, { data: { regionid: 5, shortname: "Yorkshire", data } });
  });
}

// Pick supplier, tariff and region the way a person would.
export async function setUp(page, { supplier = "octopus", tariff = /^Agile Octopus/, region = "M" } = {}) {
  await page.getByLabel("Who supplies your electricity?").selectOption(supplier);
  if (tariff) await page.getByRole("radio", { name: tariff }).check();
  if (region) await page.getByLabel("Region").selectOption(region);
}
