// /cost-to-run/lights/: what a light costs to leave on, old bulbs against LED,
// at the Ofgem price cap. Bulb figures come from src/lightingProducts.js (each
// checked on Simply LED's product page); costs from src/giftCosts.js, so they
// agree with the gift guide and its unit tests.
import { join } from "node:path";
import { PRICE_CAP } from "../src/priceCap.js";
import { costPenceDeciwatts, formatPence } from "../src/giftCosts.js";
import { LED_BULBS } from "../src/lightingProducts.js";
import { giftLink, affiliateAnchor, clickref } from "../src/affiliateLink.js";

const ELEC = PRICE_CAP.electricityHundredthsPerKwh;
const rateText = (h) => `${Math.floor(h / 100)}.${String(h % 100).padStart(2, "0")}p`;
const wattsText = (dw) => `${dw / 10}W`;
const HOURS_A_DAY = 5;
const YEAR = HOURS_A_DAY * 60 * 365; // minutes a year at 5 hours a day
const EVENING = HOURS_A_DAY * 60;
const NIGHT = 8 * 60;

const perYear = (dw) => costPenceDeciwatts(dw, YEAR);

// Months for a pack to pay for itself from the saving on every bulb in it,
// rounded up so it never sounds quicker than it is.
const paybackMonths = (b) => {
  const savingPerYear = (perYear(b.replaces.watts * 10) - perYear(b.deciwatts)) * b.pack;
  if (savingPerYear <= 0) return null;
  return Math.max(1, Math.ceil((b.pricePence * 12) / savingPerYear));
};

export const LIGHTS_URL_PATH = "/cost-to-run/lights/";

export function buildLightingPage({ layout, write, esc, ukDate, dist, SITE_URL, today, IMAGE, AUTHOR, postSlugs }) {
  const url = `${SITE_URL}${LIGHTS_URL_PATH}`;
  const page = clickref("cost-to-run-lights");
  const bulbs = LED_BULBS;
  const earning = bulbs.some((b) => giftLink(b, page).earns);

  // The headline figures, from the commonest swap: a 60W bulb for an LED.
  const old60 = perYear(600);
  const led7 = perYear(70);
  const old60Hour = costPenceDeciwatts(600, 60);
  const old60Night = costPenceDeciwatts(600, NIGHT);
  const led7Night = costPenceDeciwatts(70, NIGHT);

  // A worked example: a kitchen with ten 50W halogen spotlights.
  const kitchenOld = perYear(500) * 10;
  const kitchenLed = perYear(40) * 10;

  const typical = [
    { name: "100W traditional bulb", dw: 1000 },
    { name: "60W traditional bulb", dw: 600 },
    { name: "50W halogen spotlight (GU10)", dw: 500 },
    { name: "40W traditional candle bulb", dw: 400 },
    { name: "7.2W LED (100W equivalent)", dw: 72 },
    { name: "7W LED (60W equivalent)", dw: 70 },
    { name: "4W LED spotlight (50W equivalent)", dw: 40 },
    { name: "3.8W LED (60W equivalent)", dw: 38 },
    { name: "1.9W LED spotlight (50W equivalent)", dw: 19 },
  ];

  const description = `A 60W bulb costs about ${formatPence(old60Hour)} an hour and ${formatPence(old60)} a year at 5 hours a day; a 7W LED that gives the same light costs ${formatPence(led7)}. Every common bulb compared at the Ofgem price cap.`;
  const question = "How much does it cost to leave a light on?";

  const bulbCard = (b) => {
    const link = giftLink(b, page);
    const months = paybackMonths(b);
    const saving = perYear(b.replaces.watts * 10) - perYear(b.deciwatts);
    return `<li class="gift" id="${b.id}">
          <div class="gift-head"><div><h3>${esc(b.name)}</h3><p class="muted">${esc(b.fitting)} · replaces a ${esc(b.replaces.name)}</p></div></div>
          <dl>
            <div><dt>Power</dt><dd>${wattsText(b.deciwatts)}, ${b.lumens} lumens</dd></div>
            <div><dt>Price</dt><dd>${formatPence(b.pricePence)}${b.pack > 1 ? ` for ${b.pack}` : ""} at Simply LED, checked ${ukDate(b.lastChecked)}</dd></div>
            <div><dt>A year at 5 hours a day</dt><dd>${formatPence(perYear(b.deciwatts))} a bulb, against ${formatPence(perYear(b.replaces.watts * 10))}</dd></div>
            <div><dt>Saving</dt><dd>${formatPence(saving)} a bulb a year${months ? `; pays for itself in about ${months} month${months === 1 ? "" : "s"}` : ""}</dd></div>
          </dl>
          <p class="buy">${affiliateAnchor(b, { page, place: "cost-to-run-lights", text: `See it at ${link.retailer}`, className: "button" })}${link.earns ? ' <span class="tag">Affiliate link</span>' : ""}</p>
        </li>`;
  };

  const ld = [
    { "@context": "https://schema.org", "@type": "Article", headline: question, description, inLanguage: "en-GB", image: IMAGE,
      author: { "@type": "Person", ...AUTHOR }, mainEntityOfPage: url, dateModified: today },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [
      { "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer",
        text: `At the Ofgem price cap of ${rateText(ELEC)} per kWh (${PRICE_CAP.label}), a 60W traditional bulb costs about ${formatPence(old60Hour)} an hour, or ${formatPence(old60)} a year at 5 hours a day. A 7W LED giving the same light costs ${formatPence(led7)} a year.` } },
      { "@type": "Question", name: "How much does it cost to leave a light on all night?", acceptedAnswer: { "@type": "Answer",
        text: `For 8 hours, a 60W traditional bulb costs about ${formatPence(old60Night)} and a 7W LED about ${formatPence(led7Night)}, at ${rateText(ELEC)} per kWh.` } },
    ] },
    { "@context": "https://schema.org", "@type": "ItemList", name: "LED bulbs and what they save", url, numberOfItems: bulbs.length,
      itemListElement: bulbs.map((b, i) => ({ "@type": "ListItem", position: i + 1, item: {
        "@type": "Product", name: b.name, url: `${url}#${b.id}`, brand: { "@type": "Brand", name: b.brand },
        description: `${wattsText(b.deciwatts)} LED, ${b.lumens} lumens, replaces a ${b.replaces.name}.`,
        offers: { "@type": "Offer", price: (b.pricePence / 100).toFixed(2), priceCurrency: "GBP", url: b.source } } })) },
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Cheap Watts", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Running costs", item: `${SITE_URL}/cost-to-run/` },
      { "@type": "ListItem", position: 3, name: "Lights", item: url } ] },
  ];

  const ledPost = "is-it-worth-switching-to-led-bulbs";
  const main = `      <nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Cheap Watts</a></li><li><a href="/cost-to-run/">Running costs</a></li><li aria-current="page">Lights</li></ol></nav>
      <article>
        <header>
          <h1>${question}</h1>
        </header>
        <aside class="disclosure" aria-label="About the links on this page">
          <p><strong>Affiliate links.</strong> ${earning
            ? "The shop links on this page are affiliate links, marked “affiliate link”. If you buy through one, Cheap Watts may earn a commission, at no extra cost to you."
            : "None of the shop links on this page earn Cheap Watts anything at the moment."} They never change the running costs we show. See our <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>
        </aside>
        <p class="lede">A 60W traditional bulb costs about <strong>${formatPence(old60Hour)} an hour</strong>, or <strong>${formatPence(old60)} a year</strong> left on for 5 hours a day. A 7W LED that gives the same light costs <strong>${formatPence(led7)} a year</strong>.</p>
        <p class="cap-note">Worked out at the Ofgem price cap rate for electricity: <strong>${rateText(ELEC)} per kWh</strong>, the Great Britain average for Direct Debit from ${PRICE_CAP.label} (<a href="${PRICE_CAP.source}">Ofgem's announcement</a>). Your own rate is on your bill.</p>
        <section class="compare" aria-labelledby="typical-title">
          <h2 id="typical-title">What each bulb costs to run</h2>
          <div class="table-scroll stack" tabindex="0" role="region" aria-label="What each bulb costs to run">
            <table>
              <thead><tr><th scope="col">Bulb</th><th scope="col">Per hour</th><th scope="col">All night (8 hours)</th><th scope="col">A year at 5 hours a day</th></tr></thead>
              <tbody>${typical.map((t) => `<tr><th scope="row">${esc(t.name)}</th><td data-label="Per hour">${formatPence(costPenceDeciwatts(t.dw, 60))}</td><td data-label="All night (8 hours)">${formatPence(costPenceDeciwatts(t.dw, NIGHT))}</td><td data-label="A year at 5 hours a day">${formatPence(perYear(t.dw))}</td></tr>`).join("")}</tbody>
            </table>
          </div>
          <h3>Assumptions</h3>
          <ul>
            <li>Electricity at ${rateText(ELEC)} per kWh, the Ofgem price cap from ${PRICE_CAP.label}. Each figure is rounded to the nearest penny once, at the end.</li>
            <li>A bulb uses its rated power the whole time it's on. The LED wattages and the old bulbs they match are as Simply LED lists them for each product below.</li>
            <li>A year is 365 days at ${HOURS_A_DAY} hours a day. Lights you use less often save less from a swap.</li>
          </ul>
        </section>
        <section class="compare" aria-labelledby="kitchen-title">
          <h2 id="kitchen-title">A worked example: ten kitchen spotlights</h2>
          <p>Ten 50W halogen GU10 spotlights on for 5 hours a day cost about <strong>${formatPence(kitchenOld)} a year</strong>. Ten 4W LED spotlights cost about <strong>${formatPence(kitchenLed)}</strong>, a saving of ${formatPence(kitchenOld - kitchenLed)} a year. Spotlights are where the biggest savings usually hide, because there are so many of them on one switch.</p>
        </section>
        <h2>LED bulbs and what each one saves</h2>
        <p>Each one below shows the old bulb it replaces, as the retailer states it, and what the swap saves a year at 5 hours a day. Check the fitting (B22 bayonet, E27 screw, GU10 and so on) against the bulb you're replacing, and whether you need a dimmable bulb.</p>
        <ul class="gifts">
        ${bulbs.map(bulbCard).join("\n        ")}
        </ul>
        <div class="prose">
          <h2>How to spend less on lighting</h2>
          <ul>
            <li>Swap the bulbs you use most first: the kitchen, the living room and the hall. A bulb that's on for an hour a week will take years to pay back.</li>
            <li>Count the spotlights. A ceiling of halogen spotlights can use more than the rest of the house's lights put together.</li>
            <li>Turning a light off when you leave a room always saves something, LED or not. There's no big surge when you switch an LED back on.</li>
            <li>Match the brightness by lumens, not watts. An old 60W bulb gives about 800 lumens, so look for an LED of around that.</li>
          </ul>
          ${postSlugs.has(ledPost) ? `<p>More in <a href="/blog/${ledPost}/">is it worth switching to LED bulbs?</a></p>` : ""}
        </div>
        <aside class="cta" aria-label="Try the tool">
          <p class="cta-title">What do your other appliances cost?</p>
          <p>Free, no sign-up, with live prices for your tariff.</p>
          <a class="button" href="/cost-to-run/">See running costs</a>
        </aside>
      </article>`;

  write(join(dist, "cost-to-run", "lights", "index.html"), layout({
    title: `${question} LED vs old bulbs (2026) · Cheap Watts`, description, canonical: url, type: "article", ld, main,
  }));
  return { loc: url, lastmod: today, priority: "0.7", question, oneLine: `About ${formatPence(led7)} a year for an LED, against ${formatPence(old60)} for a 60W bulb, at 5 hours a day.` };
}
