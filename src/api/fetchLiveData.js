// ============================================================
// LIVE API CALLS
// All live data fetching is centralised here. Each function
// returns transformed, chart-ready data or throws on failure.
//
// All endpoints verified working April 2026:
// - ONS Beta API (api.beta.ons.gov.uk) — CPIH index data (v67)
// - ONS Website API (www.ons.gov.uk) — time series (KAC3 earnings %)
// - Postcodes.io — postcode lookups (no key required)
//
// Note: ONS Website API returns multiple concatenated JSON objects.
// We use a text-based parse to extract just the first object.
// ============================================================

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/**
 * Parse ONS Beta API time id (e.g. "Jan-24") to structured object
 */
function parseONSBetaTime(timeId) {
  const parts = timeId.split("-");
  if (parts.length !== 2) return null;
  const monthIdx = MONTH_NAMES.findIndex((m) => m === parts[0]);
  if (monthIdx === -1) return null;
  const yearShort = parseInt(parts[1]);
  const year = yearShort >= 90 ? 1900 + yearShort : 2000 + yearShort;
  return { month: monthIdx, year, sortKey: year * 100 + monthIdx, label: timeId };
}

/**
 * Safely parse ONS website JSON response.
 * The ONS website API concatenates multiple JSON objects in one response.
 * We extract just the first complete object.
 */
async function parseONSWebsiteResponse(res) {
  const text = await res.text();
  // Find the end of the first JSON object by counting braces
  let depth = 0;
  let endIdx = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "{") depth++;
    if (text[i] === "}") { depth--; if (depth === 0) { endIdx = i + 1; break; } }
  }
  return JSON.parse(text.slice(0, endIdx));
}

/**
 * Fetch CPIH index data from ONS Beta API and compute YoY % change.
 * @param {string} aggregate - ONS aggregate code (e.g. "CP01" for food)
 * @returns {Array<{date: string, value: number}>} YoY % change series from Jan 2021
 */
async function fetchCPIHSeries(aggregate) {
  const url =
    `https://api.beta.ons.gov.uk/v1/datasets/cpih01/editions/time-series/versions/67/observations?time=*&geography=K02000001&aggregate=${aggregate}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ONS CPIH API returned ${res.status} for ${aggregate}`);
  const data = await res.json();

  const observations = data.observations || [];
  const indexMap = {};
  const parsed = [];

  for (const obs of observations) {
    const timeId = obs.dimensions?.Time?.id || obs.dimensions?.time?.id || "";
    const indexValue = parseFloat(obs.observation);
    if (!timeId || isNaN(indexValue)) continue;
    const t = parseONSBetaTime(timeId);
    if (!t) continue;
    indexMap[t.sortKey] = indexValue;
    parsed.push(t);
  }

  // Compute YoY % change: (thisMonth / sameMonthLastYear - 1) * 100
  // Filter to 2021–2030 to exclude spurious 2080s data (ONS encodes "89" as 2089)
  return parsed
    .filter((t) => t.year >= 2021 && t.year <= 2030)
    .sort((a, b) => a.sortKey - b.sortKey)
    .map((t) => {
      const lastYearKey = (t.year - 1) * 100 + t.month;
      const current = indexMap[t.sortKey];
      const previous = indexMap[lastYearKey];
      if (!previous) return null;
      const yoyChange = ((current / previous) - 1) * 100;
      return {
        date: `${MONTH_NAMES[t.month]} ${String(t.year).slice(2)}`,
        value: Math.round(yoyChange * 10) / 10,
      };
    })
    .filter(Boolean);
}

/**
 * Fetch CPIH Food & Non-Alcoholic Beverages inflation
 * Aggregate: CP01
 * Returns: [{ date: "Jan 21", value: 0.6 }, ...]
 */
export async function fetchFoodInflation() {
  return fetchCPIHSeries("CP01");
}

/**
 * Fetch rental price inflation using CPIH actual rentals sub-index
 * Aggregate: CP041 (Actual rentals for housing)
 * Note: The standalone IPHRP series (D7O1) is not available via JSON API.
 * CP041 from CPIH is the closest live alternative.
 * Returns: [{ date: "Jan 21", value: 1.3 }, ...]
 */
export async function fetchRentalIndex() {
  return fetchCPIHSeries("CP041");
}

/**
 * Fetch Average Weekly Earnings growth (%) from ONS Website API
 * CDID: KAC3 — AWE whole economy, total pay YoY 3-month average growth (%)
 * Verified working April 2026.
 * Returns: [{ date: "Jan 21", value: 4.5 }, ...]
 */
export async function fetchEarningsGrowth() {
  const url =
    "https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours/timeseries/kac3/lms/data";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ONS Earnings API returned ${res.status}`);
  const data = await parseONSWebsiteResponse(res);

  const months = data.months || [];
  return months
    .filter((m) => parseInt(m.year) >= 2021)
    .map((m) => {
      const year = m.year.slice(2, 4);
      const date = `${m.month.slice(0, 3)} ${year}`;
      const value = parseFloat(m.value);
      return { date, value };
    })
    .filter((d) => !isNaN(d.value));
}

/**
 * Lookup postcode via Postcodes.io
 * Verified working April 2026. No API key required.
 * Returns: { region, county, district } or null
 */
export async function lookupPostcode(postcode) {
  const cleaned = postcode.replace(/\s+/g, "").toUpperCase();
  const url = `https://api.postcodes.io/postcodes/${encodeURIComponent(cleaned)}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 200 || !data.result) return null;
  return {
    region: data.result.region || data.result.european_electoral_region || "",
    county: data.result.admin_county || "",
    district: data.result.admin_district || "",
  };
}
