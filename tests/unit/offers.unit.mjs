import { test } from "node:test";
import assert from "node:assert/strict";
import { OFFERS, offersFor, offerActive, offerLink } from "../../src/offers.js";

const tower = OFFERS.find((o) => o.code === "AIRFRYER");

test("an offer is only active between its start and end", () => {
  assert.equal(offerActive(tower, new Date("2026-11-08T23:00:00Z")), false);
  assert.equal(offerActive(tower, new Date("2026-11-10T12:00:00Z")), true);
  assert.equal(offerActive(tower, new Date("2026-11-16T00:00:00Z")), false);
});

test("ended offers are left out, offers still to start are kept for the page script", () => {
  const all = OFFERS.map((o) => o.mid);
  assert.ok(offersFor("gifts:air-fryers-slow-cookers", new Date("2026-11-08T12:00:00Z"), all).includes(tower));
  assert.ok(!offersFor("gifts:air-fryers-slow-cookers", new Date("2026-11-16T00:00:00Z"), all).includes(tower));
});

test("offers only show for programmes we've joined", () => {
  assert.deepEqual(offersFor("offers", new Date("2026-11-10T12:00:00Z"), []), []);
});

test("every offer has a valid window, a place and an https retailer page", () => {
  for (const o of OFFERS) {
    assert.ok(new Date(o.starts) < new Date(o.ends), `${o.id} dates`);
    assert.ok(o.places.length && o.places.includes("offers"), `${o.id} places`);
    assert.match(o.url, /^https:\/\//);
    assert.match(o.checked, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("offer links go through Awin with the landing page last", () => {
  const href = offerLink(tower, "offer-test");
  assert.match(href, /awinmid=20823&awinaffid=3143222&clickref=offer-test&ued=/);
});
