import { test } from "node:test";
import assert from "node:assert/strict";
import { LED_BULBS } from "../../src/lightingProducts.js";

const whole = (n) => Number.isInteger(n) && n > 0;

test("every LED bulb has checked, whole-number figures and a source", () => {
  const ids = LED_BULBS.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of LED_BULBS) {
    assert.ok(whole(b.deciwatts), `${b.id}: deciwatts`);
    assert.ok(whole(b.replaces.watts) && b.replaces.name, `${b.id}: replaces`);
    assert.ok(b.replaces.watts * 10 > b.deciwatts, `${b.id}: should use less than the bulb it replaces`);
    assert.ok(whole(b.lumens) && whole(b.pricePence) && whole(b.pack), `${b.id}: lumens, price and pack`);
    assert.match(b.lastChecked, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(b.source, /^https:\/\/www\.simplyled\.co\.uk\//);
    assert.equal(b.awin.mid, 5190);
  }
});
