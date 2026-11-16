import { test } from "node:test";
import assert from "node:assert/strict";
import { OFFERS, offersFor, offerActive, offerLink } from "../../src/offers.js";

const duo = OFFERS.find((o) => o.id === 4162961); // Swan Nordic Duo, 5 to 30 Nov 2026

test("an offer is only active between its start and end", () => {
  assert.equal(offerActive(duo, new Date("2026-11-04T12:00:00Z")), false);
  assert.equal(offerActive(duo, new Date("2026-11-10T12:00:00Z")), true);
  assert.equal(offerActive(duo, new Date("2026-12-01T00:00:00Z")), false);
});

test("ended offers are left out, offers still to start are kept for the page script", () => {
  const all = OFFERS.map((o) => o.mid);
  assert.ok(offersFor("gifts:air-fryers-slow-cookers", new Date("2026-11-04T12:00:00Z"), all).includes(duo));
  assert.ok(!offersFor("gifts:air-fryers-slow-cookers", new Date("2026-12-01T00:00:00Z"), all).includes(duo));
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
  const href = offerLink(duo, "offer-test");
  assert.match(href, /awinmid=16860&awinaffid=3143222&clickref=offer-test&ued=/);
});

test("Black Friday codes are hidden before 23 November and gone after they end", () => {
  const all = OFFERS.map((o) => o.mid);
  const tower = OFFERS.find((o) => o.id === 4162879);
  const swan = OFFERS.find((o) => o.id === 4162940);
  assert.equal(offerActive(tower, new Date("2026-11-22T23:59:00Z")), false);
  assert.equal(offerActive(tower, new Date("2026-11-23T12:00:00Z")), true);
  assert.ok(offersFor("cost:airfryer", new Date("2026-11-16T12:00:00Z"), all).includes(tower));
  assert.ok(!offersFor("cost:airfryer", new Date("2026-11-30T00:00:00Z"), all).includes(tower));
  assert.equal(offerActive(swan, new Date("2026-11-30T23:00:00Z")), true);
  assert.equal(offerActive(swan, new Date("2026-12-01T00:00:00Z")), false);
});
