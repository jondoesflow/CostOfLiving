import { test } from "node:test";
import assert from "node:assert/strict";
import { giftLink, affiliateAnchor, clickref, REL } from "../../src/affiliateLink.js";
import { awinUrl } from "../../src/products.js";

const throw_ = { id: "throw", awin: { mid: 130445, retailer: "Dimplex", url: "https://www.shopdimplex.com/products/cosy-heated-throw-grey" } };
const plug = { id: "plug", query: "TP-Link Tapo P110" };

test("an unapproved programme links straight to the retailer with no tracking", () => {
  assert.deepEqual(giftLink(throw_, "gifts-hub", []), { href: throw_.awin.url, retailer: "Dimplex", earns: false });
});

test("an approved programme links through Awin with the page's clickref", () => {
  const link = giftLink(throw_, "gifts-heated-throws-electric-blankets", [130445]);
  assert.equal(link.earns, true);
  assert.equal(link.href, `https://www.awin1.com/cread.php?awinmid=130445&awinaffid=3143222&clickref=gifts-heated-throws-electric-blankets&ued=${encodeURIComponent(throw_.awin.url)}`);
});

test("no clickref leaves the Awin link as it was", () => {
  assert.equal(awinUrl(1, "https://x.test/"), "https://www.awin1.com/cread.php?awinmid=1&awinaffid=3143222&ued=https%3A%2F%2Fx.test%2F");
});

test("a product with only a search uses Amazon with our tag", () => {
  const link = giftLink(plug, "gifts-hub", []);
  assert.match(link.href, /^https:\/\/www\.amazon\.co\.uk\/s\?k=.*&tag=cheapwatts-21$/);
  assert.equal(link.retailer, "Amazon");
});

test("a product with no link at all is an error, not a broken link", () => {
  assert.throws(() => giftLink({ id: "x" }, "gifts-hub", []));
});

test("clickrefs are short, lower case and safe", () => {
  assert.equal(clickref("Gifts / Heated throws!"), "gifts-heated-throws");
  assert.equal(clickref("x".repeat(80)).length, 50);
  assert.throws(() => clickref("!!!"));
});

test("the anchor is sponsored, nofollow, opens a new tab and escapes its text", () => {
  const html = affiliateAnchor(throw_, { page: "gifts-hub", place: "gifts", text: "Throw <grey> & \"cosy\"", joined: [130445] });
  assert.equal(REL, "sponsored nofollow noopener noreferrer");
  assert.match(html, /rel="sponsored nofollow noopener noreferrer"/);
  assert.match(html, /target="_blank"/);
  assert.match(html, /clickref=gifts-hub&amp;ued=/);
  assert.match(html, /Throw &lt;grey&gt; &amp; &quot;cosy&quot;/);
  assert.match(html, /opens in a new tab/);
});
