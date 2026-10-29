// The embeddable "what does it cost to run?" box at /widget/, for councils and
// charities to put on their own pages in an iframe. It uses the standard
// price-capped rate for the region, which is right for most households, and
// sends people to the full tool for their own tariff. No affiliate links.
//   ?r=M          preselect a region (A to P), e.g. the council's own
//   ?a=washer     preselect an appliance
import { REGIONS, APPLIANCES } from "./appliances.js";
import { standardRate } from "./prices.js";
import { money } from "./lib/format.js";

const params = new URLSearchParams(location.search);
const pick = (list, value, fallback) => (list.some((x) => x.code === value || x.id === value) ? value : fallback);

const applianceSelect = document.getElementById("appliance");
const regionSelect = document.getElementById("region");
const out = document.getElementById("out");
const cta = document.getElementById("cta");

for (const a of APPLIANCES) applianceSelect.add(new Option(a.name, a.id));
regionSelect.add(new Option("Choose your region…", ""));
for (const r of REGIONS) regionSelect.add(new Option(r.name, r.code));
applianceSelect.value = pick(APPLIANCES, params.get("a"), "washer");
regionSelect.value = pick(REGIONS, params.get("r"), "");

const tagged = (path) => `https://cheapwatts.co.uk${path}${path.includes("?") ? "&" : "?"}utm_source=widget&utm_medium=embed&utm_campaign=partner`;

let ctrl = null;
async function show() {
  const a = APPLIANCES.find((x) => x.id === applianceSelect.value);
  const region = regionSelect.value;
  cta.href = tagged(`/?appliance=${encodeURIComponent(a.id)}`);
  if (!region) {
    out.innerHTML = `<p class="small">Choose your region to see what a ${a.name.toLowerCase()} costs to run at today's standard rate.</p>`;
    return;
  }
  ctrl?.abort();
  ctrl = new AbortController();
  out.innerHTML = `<p class="small">Getting today's prices…</p>`;
  try {
    const rate = await standardRate(region, ctrl.signal);
    if (rate == null) throw new Error("No rate");
    const run = a.kWh * rate;
    out.innerHTML = `
      <p><span class="cost">${money(run)}</span> a run</p>
      <p class="small">${a.note}. About ${money(run * a.perWeek * 52)} a year at ${a.perWeek} a week, on today's standard rate (${rate.toFixed(1)}p per kWh).</p>`;
  } catch (e) {
    if (e.name === "AbortError") return;
    out.innerHTML = `<p class="small">We couldn't get today's prices just now. The button below opens the full tool.</p>`;
  }
}

applianceSelect.addEventListener("change", show);
regionSelect.addEventListener("change", show);
show();
