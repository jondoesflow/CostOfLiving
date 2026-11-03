// The one place gift guide links are built, so every product link on those
// pages gets the same attributes: rel="sponsored nofollow" (Google's rules for
// paid links), a new tab, and an Awin clickref naming the page.
//
// The flag is src/awinJoined.js. Until a product's Awin programme has approved
// Cheap Watts, its link is a placeholder: the retailer's own page with no
// tracking, so the price shown matches what the reader sees. A product with no
// retailer page of its own (only an Amazon search) uses Amazon with our tag.
import { AWIN_JOINED } from "./awinJoined.js";
import { awinUrl, amazonUrl } from "./products.js";

export const REL = "sponsored nofollow noopener noreferrer";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Awin clickrefs: letters, numbers and hyphens, up to 50 characters.
export const clickref = (page) => {
  const ref = String(page).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 50);
  if (!ref) throw new Error(`No clickref can be made from "${page}"`);
  return ref;
};

// { href, retailer, earns }: `earns` is false for a placeholder link that
// carries no tracking, so the page can say which links are affiliate links.
export function giftLink(p, page, joined = AWIN_JOINED) {
  if (p.awin && joined.includes(p.awin.mid)) return { href: awinUrl(p.awin.mid, p.awin.url, clickref(page)), retailer: p.awin.retailer, earns: true };
  if (p.awin) return { href: p.awin.url, retailer: p.awin.retailer, earns: false };
  if (p.query) return { href: amazonUrl(p.query), retailer: "Amazon", earns: true };
  throw new Error(`${p.id} has no link: give it an awin entry or an Amazon query`);
}

// The link itself, as HTML. `text` is plain text and is escaped here.
export function affiliateAnchor(p, { page, place, text, joined = AWIN_JOINED }) {
  const link = giftLink(p, page, joined);
  return `<a href="${esc(link.href)}" target="_blank" rel="${REL}" data-umami-event="affiliate-click" data-umami-event-product="${esc(p.id)}" data-umami-event-place="${esc(place)}" data-umami-event-retailer="${esc(link.retailer)}">${esc(text)}<span class="sr-only"> (${esc(link.retailer)}, opens in a new tab)</span></a>`;
}
