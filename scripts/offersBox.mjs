// Current offers from our Awin partners (src/offers.js), as a box for a page
// and as the /offers/ page. Each offer carries its start and end time; the
// inline script hides any that have ended or not yet started, so a page built
// days ago never shows an expired offer.
import { join } from "node:path";
import { offersFor, offerActive, offerLink } from "../src/offers.js";

const endText = (iso) => new Date(iso).toLocaleString("en-GB", {
  timeZone: "Europe/London", day: "numeric", month: "long", year: "numeric", hour: "numeric", minute: "2-digit",
});

// Runs once per page: shows offers inside their window, hides the rest, and
// hides a box when none of its offers are showing.
const SCRIPT = `<script>
      (function () {
        var now = Date.now();
        document.querySelectorAll("[data-offer-ends]").forEach(function (li) {
          var on = Date.parse(li.getAttribute("data-offer-starts")) <= now && now < Date.parse(li.getAttribute("data-offer-ends"));
          li.hidden = !on;
        });
        document.querySelectorAll("[data-offers]").forEach(function (box) {
          box.hidden = !box.querySelector("[data-offer-ends]:not([hidden])");
        });
      })();
    </script>`;

function offerItem(o, place, esc, now) {
  const clickref = place.replace(/[^a-z0-9]+/gi, "-").toLowerCase();
  return `<li data-offer-starts="${o.starts}" data-offer-ends="${o.ends}"${offerActive(o, now) ? "" : " hidden"}>
            <p class="offer-title"><a href="${esc(offerLink(o, `offer-${clickref}`))}" target="_blank" rel="sponsored nofollow noopener noreferrer" data-umami-event="offer-click" data-umami-event-offer="${o.id}" data-umami-event-place="${esc(place)}" data-umami-event-retailer="${esc(o.retailer)}">${esc(o.title)}<span class="sr-only"> (${esc(o.retailer)}, opens in a new tab)</span></a></p>
            <p>${esc(o.detail)}${o.code ? ` Code: <code class="offer-code">${esc(o.code)}</code>.` : ""} Ends ${endText(o.ends)}.</p>
          </li>`;
}

export function offersBox(place, esc, { now = new Date(), heading = "Current offers" } = {}) {
  const offers = offersFor(place, now);
  if (!offers.length) return "";
  const anyLive = offers.some((o) => offerActive(o, now));
  return `<section class="offers" data-offers aria-labelledby="offers-${place.replace(/[^a-z0-9]+/gi, "-")}"${anyLive ? "" : " hidden"}>
          <h2 id="offers-${place.replace(/[^a-z0-9]+/gi, "-")}">${esc(heading)}</h2>
          <ul>
          ${offers.map((o) => offerItem(o, place, esc, now)).join("\n          ")}
          </ul>
          <p class="muted">Offers come from the retailers through our affiliate partner Awin. The links are affiliate links, so Cheap Watts may earn a commission at no extra cost to you. Retailers can end an offer early, so check it on their site before you buy.</p>
        </section>
        ${SCRIPT}`;
}

export function buildOffersPage({ layout, write, esc, dist, SITE_URL, today }) {
  const url = `${SITE_URL}/offers/`;
  const offers = offersFor("offers");
  const main = `      <nav aria-label="Breadcrumb" class="crumbs"><ol><li><a href="/">Cheap Watts</a></li><li aria-current="page">Offers</li></ol></nav>
      <article>
        <header>
          <h1>Current offers on energy-saving kit</h1>
        </header>
        <aside class="disclosure" aria-label="About the links on this page">
          <p><strong>Affiliate links.</strong> The offers on this page come from retailers we work with through Awin. If you buy through one of these links, Cheap Watts may earn a commission, at no extra cost to you. It never changes the running costs we show. See our <a href="/affiliate-disclosure/">affiliate disclosure</a>.</p>
        </aside>
        <p class="lede">Offers from our partner retailers on things that can cut your energy bills, picked because they match what the site covers. Each one disappears from this page when it ends.</p>
        ${offers.length ? offersBox("offers", esc, { heading: "Running now" }) : ""}
        <p class="offers-none" data-offers-none hidden>There are no offers running at the moment. Check back soon.</p>
        <script>
          (function () {
            var box = document.querySelector("[data-offers]");
            document.querySelector("[data-offers-none]").hidden = !!(box && !box.hidden);
          })();
        </script>
        <div class="prose">
          <h2>Before you buy</h2>
          <ul>
            <li>A discount only saves money if you'd have bought the thing anyway. The cheapest kit is the kit you don't need.</li>
            <li>Check what it costs to run as well as what it costs to buy: our <a href="/cost-to-run/">running cost pages</a> show both.</li>
            <li>Codes and sale prices are set by the retailer and can end early or exclude some products. Their website has the final say.</li>
          </ul>
        </div>
      </article>`;
  write(join(dist, "offers", "index.html"), layout({
    title: "Current offers on energy-saving kit · Cheap Watts",
    description: "Current offers and discount codes from Cheap Watts' partner retailers on air fryers, LED bulbs and other kit that can cut your energy bills. Each one is removed when it ends.",
    canonical: url, main,
    ld: [{ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Cheap Watts", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Offers", item: url } ] }],
  }));
  return { loc: url, lastmod: today, priority: "0.5" };
}
