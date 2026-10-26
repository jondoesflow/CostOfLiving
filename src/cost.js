// Live running cost on the "how much does it cost to run" pages. Each page
// holds the appliance's figures in data attributes; this fetches today's
// standard rate for the chosen region, and what the same run costs at the
// cheapest and dearest times on Agile Octopus.
import { REGIONS, APPLIANCES, profileOf } from "./appliances.js";
import { loadSlots, standardRate } from "./prices.js";
import { windowCosts } from "./optimise.js";
import { money, whenLabel } from "./lib/format.js";

const KEY = "whenToRun.region";
const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || ""; } catch { return ""; } };
const save = (r) => { try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* ignore */ } };

const root = document.getElementById("live-cost");
if (root) {
  const id = root.dataset.appliance;
  const appliance = APPLIANCES.find((a) => a.id === id);
  const kWh = Number(root.dataset.kwh);
  const mins = Number(root.dataset.mins);
  const perWeek = Number(root.dataset.perweek);
  const profile = profileOf(id);
  const select = root.querySelector("select");
  const out = root.querySelector("[data-out]");
  for (const r of REGIONS) select.add(new Option(r.name, r.code));
  select.value = load() || "C";

  let ctrl = null;
  async function show() {
    const region = select.value;
    save(region);
    ctrl?.abort();
    ctrl = new AbortController();
    out.innerHTML = `<p class="muted" role="status">Getting today's prices…</p>`;
    try {
      const [rate, agile] = await Promise.all([standardRate(region, ctrl.signal), loadSlots("agile", region, ctrl.signal)]);
      const std = kWh * rate;
      const runs = windowCosts(agile, kWh, mins, null, profile);
      const sorted = [...runs].sort((a, b) => a.cost - b.cost);
      const cheapest = sorted[0];
      const dearest = sorted[sorted.length - 1];
      const name = REGIONS.find((r) => r.code === region).name;
      out.innerHTML = `
        <div class="live-row"><span>On a standard tariff in ${name} today (${rate.toFixed(1)}p per kWh)</span><strong>${money(std)} a run</strong></div>
        ${perWeek ? `<p class="muted">About ${money(std * perWeek * 52)} a year at ${perWeek} times a week.</p>` : ""}
        ${cheapest ? `
        <div class="live-row"><span>On Agile Octopus, cheapest time today: ${whenLabel(cheapest.start)}</span><strong>${money(cheapest.cost)}</strong></div>
        <div class="live-row"><span>On Agile Octopus, dearest time today: ${whenLabel(dearest.start)}</span><strong>${money(dearest.cost)}</strong></div>` : ""}
        <p class="muted">Standard rate from Octopus's price-capped variable tariff for the region, including VAT. Agile prices change every half hour.</p>
        <p><a class="button" href="/?appliance=${encodeURIComponent(id)}">Find the cheapest time to run ${appliance ? "your " + appliance.name.toLowerCase() : "it"} on your tariff</a></p>`;
    } catch (e) {
      if (e.name === "AbortError") return;
      out.innerHTML = `<p class="muted">We couldn't get today's prices just now. Try again in a minute, or <a href="/?appliance=${encodeURIComponent(id)}">open the tool</a>.</p>`;
    }
  }
  select.addEventListener("change", show);
  show();
}
