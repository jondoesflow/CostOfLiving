// The energy-saving gift guide: /gifts/ and one page per category. Called from
// build-site.mjs with its page helpers. Every running cost comes from
// src/giftCosts.js at the price cap in src/priceCap.js, so the figures on the
// page, the calculator and the unit tests all agree.
import { copyFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { PRICE_CAP } from "../src/priceCap.js";
import { costPence, costPenceForKwh, runningCost, formatPence, WINTER_WEEKS } from "../src/giftCosts.js";
import { GIFT_CATEGORIES, publishedGifts } from "../src/giftProducts.js";
import { giftLink, affiliateAnchor, clickref } from "../src/affiliateLink.js";

const ELEC = PRICE_CAP.electricityHundredthsPerKwh;
const GAS = PRICE_CAP.gasHundredthsPerKwh;
const rateText = (h) => `${Math.floor(h / 100)}.${String(h % 100).padStart(2, "0")}p`;
const kwhText = (watts, minutes) => `${+(watts * minutes / 60000).toFixed(2)}kWh`;
const MINUTES_A_YEAR = 365 * 24 * 60;

const ICONS = {
  "heated-throws-electric-blankets": "BedDouble",
  "air-fryers-slow-cookers": "Soup",
  "smart-plugs-thermostats": "PlugZap",
  "draught-proofing": "Wind",
};

// Pages elsewhere on the site that point readers here, and where each
// category points back to. Blog links only appear once the post is live.
export const GIFTS_FOR_COST_PAGE = {
  heater: "heated-throws-electric-blankets", blanket: "heated-throws-electric-blankets",
  oven: "air-fryers-slow-cookers", airfryer: "air-fryers-slow-cookers", slowcooker: "air-fryers-slow-cookers",
};
export const GIFTS_FOR_POST = {
  "electric-blanket-running-cost-uk": "heated-throws-electric-blankets",
  "air-fryer-vs-oven-vs-microwave-cheapest-per-meal": "air-fryers-slow-cookers",
  "standby-power-cost-uk-switch-off-at-the-wall": "smart-plugs-thermostats",
  "draught-proofing-on-a-budget-uk": "draught-proofing",
};
const READ_MORE = {
  "heated-throws-electric-blankets": [
    { cost: "blanket", text: "What an electric blanket costs to run" },
    { cost: "heater", text: "What an electric heater costs to run" },
    { post: "electric-blanket-running-cost-uk", text: "Electric blanket running costs, worked out" },
    { tool: "/gas-or-electric/", text: "Compare gas and electric heating at today's prices" },
  ],
  "air-fryers-slow-cookers": [
    { cost: "airfryer", text: "What an air fryer costs to run" },
    { cost: "slowcooker", text: "What a slow cooker costs to run" },
    { cost: "oven", text: "What an electric oven costs to run" },
    { post: "air-fryer-vs-oven-vs-microwave-cheapest-per-meal", text: "Air fryer, oven or microwave: the cheapest per meal" },
  ],
  "smart-plugs-thermostats": [
    { post: "standby-power-cost-uk-switch-off-at-the-wall", text: "What standby really costs, and when to switch off at the wall" },
    { post: "read-smart-meter-download-half-hourly-usage", text: "How to read your smart meter and download your usage" },
    { tool: "/plan-my-evening/", text: "Plan your evening around the cheap hours" },
  ],
  "draught-proofing": [
    { post: "draught-proofing-on-a-budget-uk", text: "Draught-proofing on a budget: where to start" },
    { post: "turn-thermostat-down-1-degree-save-money", text: "Does turning the thermostat down 1°C save money?" },
    { tool: "/gas-or-electric/", text: "Compare gas and electric heating at today's prices" },
  ],
};

// Side-by-side running costs, with every assumption written out. Each row is
// an average power over a time (gas counted the same way, in kWh of gas), so
// one calculator works them all out. Figures marked "site" are the typical
// figures the rest of Cheap Watts uses (src/appliances.js, Gas or electric).
const COMPARISONS = {
  "heated-throws-electric-blankets": {
    title: "Heated throw or heating the room?",
    intro: "Keeping one person warm for a two-hour evening, three ways.",
    columns: ["One 2-hour evening", `Every evening for a winter (${WINTER_WEEKS} weeks)`],
    rows: [
      { name: "Dimplex Cosy Heated Throw at full power", energy: "160W", watts: 160, fuel: "electricity", minutes: [120, 120 * 7 * WINTER_WEEKS] },
      { name: "Electric heater warming one room", energy: "1.5kW", watts: 1500, fuel: "electricity", minutes: [120, 120 * 7 * WINTER_WEEKS] },
      { name: "Gas central heating, one room's worth", energy: "1.76kWh of gas an hour", watts: 1760, fuel: "gas", minutes: [120, 120 * 7 * WINTER_WEEKS] },
    ],
    assumptions: [
      "One room needs about 1.5kW of heat. That's the figure our Gas or electric tool uses.",
      "A gas boiler is about 85% efficient, so 1.5kW of heat takes about 1.76kWh of gas an hour.",
      "Central heating usually heats more than one room, so its real cost is often higher than this.",
      "The throw is at its top setting the whole time. On a lower setting, or once its thermostat cuts in, it uses less.",
      "A throw warms you, not the room. It won't stop damp or keep pipes from freezing, so it works alongside some heating, not instead of all of it.",
    ],
  },
  "air-fryers-slow-cookers": {
    title: "Air fryer, slow cooker or the oven?",
    intro: "One meal cooked different ways.",
    columns: ["One meal", "Twice a week for a winter (52 meals)"],
    rows: [
      { name: "Electric oven, an hour at 200°C", energy: "1.5kWh", watts: 1500, fuel: "electricity", minutes: [60, 60 * 52] },
      { name: "Gas oven, an hour", energy: "2kWh of gas", watts: 2000, fuel: "gas", minutes: [60, 60 * 52] },
      { name: "Air fryer, 30 minutes (typical)", energy: "0.5kWh", watts: 1000, fuel: "electricity", minutes: [30, 30 * 52] },
      { name: "Tower Vizion 4 Litre at full power for 30 minutes", energy: kwhText(1350, 30), watts: 1350, fuel: "electricity", minutes: [30, 30 * 52] },
      // 1.3kWh over the 8 hours, entered as 1300W for an hour: same energy.
      { name: "Slow cooker, 8 hours on low (typical)", energy: "1.3kWh", watts: 1300, fuel: "electricity", minutes: [60, 60 * 52] },
      { name: "Tower Infinity 1.5 Litre at full power for 8 hours", energy: kwhText(120, 480), watts: 120, fuel: "electricity", minutes: [480, 480 * 52] },
    ],
    assumptions: [
      "The oven, typical air fryer and typical slow cooker figures are the ones the rest of Cheap Watts uses: 1.5kWh for an electric oven for an hour, 2kWh of gas for a gas oven, 0.5kWh for 30 minutes in an air fryer and 1.3kWh for 8 hours in a slow cooker.",
      "The Tower rows are the most each one could use, running at its rated power the whole time. Both switch their heating on and off once hot, so the real figure is lower.",
      "Gas costs much less per unit than electricity, which is why a gas oven comes out close to an air fryer. Against an electric oven, the air fryer and slow cooker win clearly.",
      "Not every meal suits every method, and a slow cooker meal often feeds more people.",
    ],
  },
  "smart-plugs-thermostats": {
    title: "Does a smart plug pay for its own electricity?",
    intro: "A smart plug uses a little power itself, so it only saves money when it switches off something that uses more.",
    columns: ["Per week", "Per year"],
    rows: [
      { name: "Anything drawing 1W, all the time", energy: "1W", watts: 1, fuel: "electricity", minutes: [7 * 24 * 60, MINUTES_A_YEAR] },
      { name: "A device drawing 10W on standby, all the time (an example: measure yours)", energy: "10W", watts: 10, fuel: "electricity", minutes: [7 * 24 * 60, MINUTES_A_YEAR] },
      { name: "TP-Link Tapo P110 itself, counted at 2W", energy: "2W", watts: 2, fuel: "electricity", minutes: [7 * 24 * 60, MINUTES_A_YEAR] },
    ],
    assumptions: [
      "A year is 365 days of 24 hours.",
      "TP-Link lists the P110 at 0.64W with the socket off and 1.64W with it on. We round that up to 2W, so its real cost is lower.",
      "10W is an example, not a measured figure for any device. Plug yours in and read what it really draws: that's what an energy-monitoring plug is for.",
      "If the thing you switch off draws less than the plug, the plug costs more than it saves. Its value then is in showing you what things use.",
    ],
  },
};

// Draught-proofing saves gas, not electricity, so its worked example is a
// different shape: the same one as the draught-proofing post, at the cap.
const DRAUGHT_HOMES = [
  { name: "6,000kWh (small flat)", kWh: 6000 },
  { name: "10,000kWh (typical house)", kWh: 10000 },
  { name: "14,000kWh (larger or leakier home)", kWh: 14000 },
];

export function buildGiftPages({ layout, write, esc, jsonLd, iconSvg, ukDate, dist, root, SITE_URL, today, IMAGE, postSlugs }) {
  const hubUrl = `${SITE_URL}/gifts/`;
  const catUrl = (c) => `${SITE_URL}/gifts/${c.id}/`;
  const capNote = (gas = false) => `<p class="cap-note">Running costs use the Ofgem price cap rate for electricity: <strong>${rateText(ELEC)} per kWh</strong>${gas ? `, and <strong>${rateText(GAS)} per kWh</strong> for gas` : ""}. That's the Great Britain average for Direct Debit from ${PRICE_CAP.label} (<a href="${PRICE_CAP.source}">Ofgem's announcement</a>). Your own rate may differ: it's on your bill.</p>`;

  // ASA/CAP: make it obvious, before any link, that links can earn us money.
  // The note says what's true today: placeholder links earn nothing.
  // The hub links to the category pages rather than to shops, so it describes
  // the links on those pages instead.
  const disclosure = (products, page, { hub = false } = {}) => {
    const earning = products.filter((p) => giftLink(p, page).earns).length;
    const where = hub ? "on the gift pages below" : "on this page";
    return `<aside class="disclosure" aria-label="About the links on ${hub ? "the gift pages" : "this page"}">
        <p><strong>Affiliate links.</strong> ${earning
          ? `Some shop links ${where} are affiliate links, marked “affiliate link”. If you buy through one, Cheap Watts may earn a commission, at no extra cost to you.`
          : `None of the shop links ${where} earn Cheap Watts anything at the moment. If that changes, the ones that do will be marked “affiliate link”.`} No brand pays to be listed, and commission never changes the running costs we show.</p>
      </aside>`;
  };

  const productCard = (p, page) => {
    const link = giftLink(p, page);
    const cost = p.watts > 0 ? runningCost({ watts: p.watts, minutesPerWeek: p.use.minutesPerWeek }) : null;
    const rows = [
      ["Power", p.watts > 0 ? esc(p.wattsNote) : "Uses no electricity"],
      ["Price", p.pricePence != null ? `${formatPence(p.pricePence)} at ${esc(p.awin?.retailer ?? p.brand)}, checked ${ukDate(p.lastChecked)}` : "Check the price at the retailer"],
      ...(cost ? [
        ["Per hour", formatPence(cost.perHour)],
        ["Per week", `${formatPence(cost.perWeek)} for ${esc(p.use.label)}`],
        ["Per winter", `${formatPence(cost.perWinter)} over ${WINTER_WEEKS} weeks`],
      ] : []),
    ];
    return `<li class="gift" id="${p.id}">
          <div class="gift-head"><span class="tile">${iconSvg(ICONS[p.category])}</span><div><h3>${esc(p.name)}</h3><p class="muted">${esc(p.brand)}</p></div></div>
          <p>${esc(p.features)}</p>
          <dl>${rows.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("")}</dl>
          ${cost ? `<p class="muted">Running costs are the most it could cost: full power, at ${rateText(ELEC)} per kWh. Lower settings use less.</p>` : ""}
          <p class="buy">${affiliateAnchor(p, { page, place: "gifts", text: `See it at ${link.retailer}`, className: "button" })}${link.earns ? ' <span class="tag">Affiliate link</span>' : ""}</p>
        </li>`;
  };

  const compareBlock = (id) => {
    const c = COMPARISONS[id];
    if (!c) return "";
    const rate = (fuel) => (fuel === "gas" ? GAS : ELEC);
    return `<section class="compare" aria-labelledby="compare-title">
        <h2 id="compare-title">${esc(c.title)}</h2>
        <p>${esc(c.intro)}</p>
        <div class="table-scroll stack" tabindex="0" role="region" aria-label="${esc(c.title)}">
          <table>
            <thead><tr><th scope="col">Option</th><th scope="col">Uses</th>${c.columns.map((h) => `<th scope="col">${esc(h)}</th>`).join("")}</tr></thead>
            <tbody>${c.rows.map((r) => `<tr><th scope="row">${esc(r.name)}</th><td data-label="Uses">${esc(r.energy)}</td>${r.minutes.map((m, i) => `<td data-label="${esc(c.columns[i])}">${formatPence(costPence(r.watts, m, rate(r.fuel)))}</td>`).join("")}</tr>`).join("")}</tbody>
          </table>
        </div>
        <h3>Assumptions</h3>
        <ul>${c.assumptions.map((a) => `<li>${esc(a)}</li>`).join("")}<li>Electricity at ${rateText(ELEC)} and gas at ${rateText(GAS)} per kWh, the Ofgem price cap from ${PRICE_CAP.label}. Each figure is rounded to the nearest penny once, at the end.</li></ul>
      </section>`;
  };

  const draughtBlock = () => `<section class="compare" aria-labelledby="compare-title">
        <h2 id="compare-title">What could stopping draughts save?</h2>
        <p>A worked example, not a promise. Draught-proofing saves gas for heating, so it depends on how much you use and how draughty your home is.</p>
        <div class="table-scroll stack" tabindex="0" role="region" aria-label="What draught-proofing could save">
          <table>
            <thead><tr><th scope="col">Gas for heating in a year</th><th scope="col">Cost at ${rateText(GAS)}</th><th scope="col">Saving at 5%</th><th scope="col">Saving at 10%</th></tr></thead>
            <tbody>${DRAUGHT_HOMES.map((h) => `<tr><th scope="row">${h.name}</th><td data-label="Cost at ${rateText(GAS)}">${formatPence(costPenceForKwh(h.kWh, GAS))}</td><td data-label="Saving at 5%">${formatPence(costPenceForKwh(h.kWh / 20, GAS))}</td><td data-label="Saving at 10%">${formatPence(costPenceForKwh(h.kWh / 10, GAS))}</td></tr>`).join("")}</tbody>
          </table>
        </div>
        <h3>Assumptions</h3>
        <ul>
          <li>Draught-proofing cuts heating use by 5% to 10%. That's our assumption for a draughty home, not a measured figure, and the same one our <a href="/blog/draught-proofing-on-a-budget-uk/">draught-proofing post</a> uses.</li>
          <li>The yearly gas figures are examples. Your annual statement shows your own.</li>
          <li>Gas at ${rateText(GAS)} per kWh, the Ofgem price cap from ${PRICE_CAP.label}, ignoring the daily standing charge, which you pay whatever you use.</li>
          <li>A home with big gaps could save more, and one that's already snug will save less. Never block air bricks, trickle vents or the vents a gas fire or boiler needs.</li>
        </ul>
      </section>`;

  // The calculator works in the browser with the same module the build uses
  // (copied to /gifts/), and shows a worked answer without JavaScript.
  const calcBlock = (products, start) => {
    const sample = start ?? products[0];
    const mins = sample.use.minutesPerWeek;
    const hoursADay = +(mins / 7 / 60).toFixed(2);
    const cost = runningCost({ watts: sample.watts, minutesPerWeek: mins });
    return `<section class="calc" aria-labelledby="calc-title" data-gift-calc>
        <h2 id="calc-title">Work out the running cost of any gift</h2>
        <p>Pick one of these, or type in the wattage from the box or the retailer's page.</p>
        <form>
          <label>Start from <select name="pick"><option value="">Your own figures</option>${products.map((p) => `<option value="${p.watts}" data-hours="${+(p.use.minutesPerWeek / 7 / 60).toFixed(2)}"${p === sample ? " selected" : ""}>${esc(p.name)} (${p.watts}W)</option>`).join("")}</select></label>
          <div class="calc-row">
            <label>Watts <input name="watts" type="number" inputmode="numeric" min="0" max="10000" step="1" value="${sample.watts}" required /></label>
            <label>Hours a day <input name="hours" type="number" inputmode="decimal" min="0" max="24" step="0.25" value="${hoursADay}" required /></label>
          </div>
        </form>
        <div class="calc-out" aria-live="polite" data-out>
          <div class="live-row"><span>Per hour</span><strong>${formatPence(cost.perHour)}</strong></div>
          <div class="live-row"><span>Per week</span><strong>${formatPence(cost.perWeek)}</strong></div>
          <div class="live-row"><span>Per winter (${WINTER_WEEKS} weeks)</span><strong>${formatPence(cost.perWinter)}</strong></div>
        </div>
        <p class="muted">At ${rateText(ELEC)} per kWh, the Ofgem price cap from ${PRICE_CAP.label}, with the product at full power.</p>
      </section>`;
  };
  const calcScript = `<script type="module">
      import { runningCost, formatPence } from "/gifts/giftCosts.js";
      const box = document.querySelector("[data-gift-calc]");
      if (box) {
        const form = box.querySelector("form"), out = box.querySelector("[data-out]");
        const row = (label, p) => '<div class="live-row"><span>' + label + "</span><strong>" + formatPence(p) + "</strong></div>";
        const update = () => {
          const watts = Math.round(Number(form.watts.value)), hours = Number(form.hours.value);
          if (!form.watts.value || !form.hours.value || !(watts >= 0 && watts <= 10000) || !(hours >= 0 && hours <= 24)) {
            out.innerHTML = '<p class="muted">Enter a power from 0 to 10,000 watts and up to 24 hours a day.</p>';
            return;
          }
          const c = runningCost({ watts, minutesPerWeek: Math.round(hours * 60) * 7 });
          out.innerHTML = row("Per hour", c.perHour) + row("Per week", c.perWeek) + row("Per winter (${WINTER_WEEKS} weeks)", c.perWinter);
        };
        form.pick.addEventListener("change", () => {
          const o = form.pick.selectedOptions[0];
          if (o.value) { form.watts.value = o.value; form.hours.value = o.dataset.hours; }
          update();
        });
        form.addEventListener("input", (e) => { if (e.target !== form.pick) form.pick.value = ""; update(); });
        form.addEventListener("submit", (e) => { e.preventDefault(); update(); });
      }
    </script>`;

  const readMore = (id) => {
    const links = READ_MORE[id].filter((l) => !l.post || postSlugs.has(l.post)).map((l) =>
      `<li><a href="${l.cost ? `/cost-to-run/${l.cost}/` : l.post ? `/blog/${l.post}/` : l.tool}">${esc(l.text)}</a></li>`);
    return links.length ? `<section class="related-links" aria-labelledby="read-more"><h2 id="read-more">Read more</h2><ul>${links.join("")}</ul></section>` : "";
  };

  const crumbsLd = (items) => ({ "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: items.map(([name, item], i) => ({ "@type": "ListItem", position: i + 1, name, item })) });

  // Product markup only where the price was checked; otherwise a plain entry.
  const itemListLd = (c, products) => ({
    "@context": "https://schema.org", "@type": "ItemList", name: c.name, url: catUrl(c), numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({ "@type": "ListItem", position: i + 1, ...(p.pricePence != null
      ? { item: { "@type": "Product", name: p.name, url: `${catUrl(c)}#${p.id}`, brand: { "@type": "Brand", name: p.brand }, description: p.features,
          offers: { "@type": "Offer", price: (p.pricePence / 100).toFixed(2), priceCurrency: "GBP", url: p.source } } }
      : { name: p.name, url: `${catUrl(c)}#${p.id}` }) })),
  });

  // Copy the calculator's modules next to the pages for the browser to load.
  mkdirSync(join(dist, "gifts"), { recursive: true });
  for (const f of ["giftCosts.js", "priceCap.js"]) copyFileSync(join(root, "src", f), join(dist, "gifts", f));

  for (const c of GIFT_CATEGORIES) {
    const products = publishedGifts(c.id);
    const page = clickref(`gifts-${c.id}`);
    const electric = products.filter((p) => p.watts > 0);
    const others = GIFT_CATEGORIES.filter((o) => o !== c);
    const thermostatNote = c.id === "smart-plugs-thermostats"
      ? `<p class="muted">We'll add smart thermostats once we've checked a model's price and power use on the maker's own site.</p>` : "";
    const main = `      <nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Cheap Watts</a></li><li><a href="/gifts/">Gifts</a></li><li aria-current="page">${esc(c.name)}</li></ol></nav>
      <article>
        <header>
          <h1>${esc(c.title)}</h1>
        </header>
        ${disclosure(products, page)}
        <p class="lede">${esc(c.intro)}</p>
        ${electric.length ? capNote() : capNote(true)}
        <h2>${products.length === 1 ? "Our pick" : "Our picks"}</h2>
        <ul class="gifts">
        ${products.map((p) => productCard(p, page)).join("\n        ")}
        </ul>
        ${thermostatNote}
        ${c.id === "draught-proofing" ? draughtBlock() : compareBlock(c.id)}
        ${electric.length ? calcBlock(electric) : ""}
        ${readMore(c.id)}
      </article>
      <section aria-labelledby="more" class="related">
        <h2 id="more">More gifts that cut energy bills</h2>
        <ul class="cards">
        ${others.map((o) => `<li class="card"><h2><a href="/gifts/${o.id}/">${esc(o.name)}</a></h2><p>${esc(o.description)}</p></li>`).join("\n        ")}
        </ul>
      </section>`;
    write(join(dist, "gifts", c.id, "index.html"), layout({
      title: `${c.title} · Cheap Watts`, description: c.description, canonical: catUrl(c), ld: [
        itemListLd(c, products),
        crumbsLd([["Cheap Watts", `${SITE_URL}/`], ["Gifts", hubUrl], [c.name, catUrl(c)]]),
      ], main,
    }).replace("  </head>", electric.length ? `    ${calcScript}\n  </head>` : "  </head>"));
  }

  // The hub: every gift in one table, then the calculator.
  const all = publishedGifts();
  const hubPage = clickref("gifts-hub");
  const electricAll = all.filter((p) => p.watts > 0);
  const hubMain = `      <nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Cheap Watts</a></li><li aria-current="page">Gifts</li></ol></nav>
      <article>
        <header>
          <h1>Gifts that cut energy bills (2026)</h1>
        </header>
        ${disclosure(all, hubPage, { hub: true })}
        <p class="lede">Presents that are useful all winter, shown with what each one actually costs to run. Every running cost is worked out from the product's own power rating and the current price cap, not copied from a box.</p>
        ${capNote(true)}
        <ul class="cards gift-cats">
        ${GIFT_CATEGORIES.map((c) => `<li class="card"><span class="tile">${iconSvg(ICONS[c.id])}</span><div><h2><a href="/gifts/${c.id}/">${esc(c.name)}</a></h2><p>${esc(c.intro)}</p></div></li>`).join("\n        ")}
        </ul>
        <section class="compare" aria-labelledby="all-title">
          <h2 id="all-title">Every gift and what it costs to run</h2>
          <p>The most each could cost, at full power, for the use shown. Prices were checked on the date given on each product's page.</p>
          <div class="table-scroll stack" tabindex="0" role="region" aria-label="Every gift and what it costs to run">
            <table>
              <thead><tr><th scope="col">Gift</th><th scope="col">Power</th><th scope="col">Per hour</th><th scope="col">Per winter</th><th scope="col">Price</th></tr></thead>
              <tbody>${all.map((p) => {
                const cost = p.watts > 0 ? runningCost({ watts: p.watts, minutesPerWeek: p.use.minutesPerWeek }) : null;
                return `<tr><th scope="row"><a href="/gifts/${p.category}/#${p.id}">${esc(p.name)}</a></th><td data-label="Power">${p.watts > 0 ? `${p.watts}W` : "None"}</td><td data-label="Per hour">${cost ? formatPence(cost.perHour) : "Nothing"}</td><td data-label="Per winter">${cost ? `<span>${formatPence(cost.perWinter)}<span class="muted"> (${esc(p.use.label)})</span></span>` : "Nothing"}</td><td data-label="Price">${p.pricePence != null ? formatPence(p.pricePence) : "Check at retailer"}</td></tr>`;
              }).join("")}</tbody>
            </table>
          </div>
        </section>
        ${calcBlock(electricAll, electricAll[0])}
        <section class="prose" aria-labelledby="how-title">
          <h2 id="how-title">How we work it out</h2>
          <p>Running cost is power × time × unit rate. A 160W heated throw on for an hour uses 0.16kWh, and at ${rateText(ELEC)} per kWh that's 4p. We use the highest power the maker lists, so the real cost is usually lower: most of these have lower settings or a thermostat that switches the heating off and on.</p>
          <p>A winter here means ${WINTER_WEEKS} weeks, October to March. Each figure is worked out in whole numbers and rounded to the nearest penny once, at the end, so a weekly figure is never built from rounded hourly ones.</p>
          <p>The price cap changes every three months. The rate above is for ${PRICE_CAP.label}, and we'll update these pages when Ofgem announces the next one.</p>
          <p>Want to know what something you already own costs? <a href="/cost-to-run/">See running costs for everyday appliances</a>, or <a href="/">find the cheapest time to run them</a> on your tariff.</p>
        </section>
      </article>`;
  write(join(dist, "gifts", "index.html"), layout({
    title: "Gifts that cut energy bills (2026): with real running costs · Cheap Watts",
    description: "Energy-saving gift ideas for Christmas 2026, each with what it costs to run per hour, per week and per winter at the Ofgem price cap: heated throws, electric blankets, air fryers, slow cookers, smart plugs and draught-proofing.",
    canonical: hubUrl,
    ld: [
      { "@context": "https://schema.org", "@type": "CollectionPage", name: "Gifts that cut energy bills (2026)", url: hubUrl, inLanguage: "en-GB", image: IMAGE, dateModified: today,
        mainEntity: { "@type": "ItemList", itemListElement: GIFT_CATEGORIES.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, url: catUrl(c) })) } },
      crumbsLd([["Cheap Watts", `${SITE_URL}/`], ["Gifts", hubUrl]]),
    ],
    main: hubMain,
  }).replace("  </head>", `    ${calcScript}\n  </head>`));

  return [
    { loc: hubUrl, lastmod: today, priority: "0.8" },
    ...GIFT_CATEGORIES.map((c) => ({ loc: catUrl(c), lastmod: today, priority: "0.7" })),
  ];
}

// A one-line pointer to a gift page, for the running-cost pages and blog posts.
export function giftNudge(categoryId, esc) {
  const c = GIFT_CATEGORIES.find((x) => x.id === categoryId);
  if (!c) return "";
  return `<aside class="gift-nudge" aria-label="Gift ideas"><p>Buying for someone this Christmas? <a href="/gifts/${c.id}/">${esc(c.name)} as gifts, with what each costs to run</a>.</p></aside>`;
}
