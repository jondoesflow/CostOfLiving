// Checks on the gift data itself: nothing reaches the site without a checked
// figure and a source, and money is whole pence.
import { test } from "node:test";
import assert from "node:assert/strict";
import { GIFT_CATEGORIES, GIFT_PRODUCTS, publishedGifts } from "../../src/giftProducts.js";

const isWhole = (n) => Number.isInteger(n) && n >= 0;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

test("ids are unique and every product is in a known category", () => {
  const ids = GIFT_PRODUCTS.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
  const cats = new Set(GIFT_CATEGORIES.map((c) => c.id));
  for (const p of GIFT_PRODUCTS) assert.ok(cats.has(p.category), `${p.id}: unknown category ${p.category}`);
});

test("every published product has a checked wattage, a source and a date", () => {
  for (const p of publishedGifts()) {
    assert.ok(isWhole(p.watts), `${p.id}: watts must be a whole number, got ${p.watts}`);
    assert.match(p.source ?? "", /^https:\/\//, `${p.id}: needs a source page`);
    assert.match(p.lastChecked, dateRe, `${p.id}: needs a lastChecked date`);
    assert.ok(p.name && p.brand && p.features, `${p.id}: needs a name, brand and features`);
    if (p.watts > 0) {
      assert.ok(p.use && isWhole(p.use.minutesPerWeek) && p.use.label, `${p.id}: needs a use assumption`);
      assert.ok(p.wattsNote, `${p.id}: needs the wattage as the retailer states it`);
    }
  }
});

test("prices are whole pence or null, and a null price is listed as a TODO", () => {
  for (const p of GIFT_PRODUCTS) {
    assert.ok(p.pricePence === null || isWhole(p.pricePence), `${p.id}: pricePence must be whole pence or null`);
    if (p.pricePence === null) assert.ok(p.todo.some((t) => /price/.test(t)), `${p.id}: missing price must be a TODO`);
    if (p.watts === null) assert.ok(p.todo.some((t) => /watt/.test(t)), `${p.id}: missing wattage must be a TODO`);
  }
});

test("unpublished products are the ones with something left to check", () => {
  for (const p of GIFT_PRODUCTS.filter((x) => !x.published)) assert.ok(p.todo.length > 0, `${p.id}: unpublished with nothing to do`);
});

test("every product has somewhere to link to", () => {
  for (const p of GIFT_PRODUCTS) {
    if (p.awin) {
      assert.ok(Number.isInteger(p.awin.mid) && p.awin.retailer, `${p.id}: awin needs a mid and retailer`);
      assert.match(p.awin.url, /^https:\/\//);
    } else assert.ok(p.query, `${p.id}: needs an awin entry or an Amazon query`);
  }
});

test("every category has something to show", () => {
  for (const c of GIFT_CATEGORIES) assert.ok(publishedGifts(c.id).length > 0, `${c.id} is empty`);
});
