// ============================================================
// LIVE API CALLS
// All live data fetching is centralised here. Each function
// returns transformed, chart-ready data or throws on failure.
// ============================================================

/**
 * Fetch CPIH Food & Non-Alcoholic Beverages inflation from ONS Beta API
 * Returns: [{ date: "Jan 21", value: 0.6 }, ...]
 */
export async function fetchFoodInflation() {
  const url =
    "https://api.beta.ons.gov.uk/v1/datasets/cpih01/editions/time-series/versions/latest/observations?time=*&geography=K02000001&aggregate=cpih1dim1T60000";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ONS CPIH Food API returned ${res.status}`);
  const data = await res.json();

  const observations = data.observations || [];
  return observations
    .map((obs) => {
      const time = obs.dimensions?.Time?.id || obs.dimensions?.time?.id || "";
      const value = parseFloat(obs.observation);
      if (!time || isNaN(value)) return null;
      return { time, value };
    })
    .filter(Boolean)
    .filter((d) => {
      // Filter to Jan 2021 onwards
      const year = parseInt(d.time.slice(0, 4));
      const month = parseInt(d.time.slice(5, 7));
      return year > 2020 || (year === 2020 && month >= 12);
    })
    .sort((a, b) => a.time.localeCompare(b.time))
    .map((d) => {
      const year = d.time.slice(2, 4);
      const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      const monthIdx = parseInt(d.time.slice(5, 7)) - 1;
      return { date: `${monthNames[monthIdx]} ${year}`, value: d.value };
    });
}

/**
 * Fetch Private Rental Price Index from ONS Time Series API
 * CDID: DRPI — annual % change in private rental prices
 * Returns: [{ date: "Jan 21", value: 1.3 }, ...]
 */
export async function fetchRentalIndex() {
  const url = "https://api.ons.gov.uk/v1/timeseries/DRPI/dataset/pri/data";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ONS Rental API returned ${res.status}`);
  const data = await res.json();

  const months = data.months || [];
  return months
    .filter((m) => {
      const year = parseInt(m.year);
      return year >= 2021;
    })
    .map((m) => {
      const year = m.year.slice(2, 4);
      const date = `${m.month.slice(0, 3)} ${year}`;
      const value = parseFloat(m.value);
      return { date, value };
    })
    .filter((d) => !isNaN(d.value));
}

/**
 * Fetch Average Weekly Earnings from ONS Time Series API
 * CDID: KAB9 — total pay, all employees (% growth)
 * Returns: [{ date: "Jan 21", value: 4.5 }, ...]
 */
export async function fetchEarningsGrowth() {
  const url = "https://api.ons.gov.uk/v1/timeseries/KAB9/dataset/lms/data";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`ONS Earnings API returned ${res.status}`);
  const data = await res.json();

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
 * Returns: { region: "Yorkshire and The Humber", ... } or null
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
