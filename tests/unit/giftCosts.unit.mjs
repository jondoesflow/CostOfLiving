// Unit tests for the gift guide's running-cost maths. Run with npm run test:unit.
import { test } from "node:test";
import assert from "node:assert/strict";
import { costPence, costPenceForKwh, runningCost, formatPence, roundDiv, WINTER_WEEKS } from "../../src/giftCosts.js";
import { PRICE_CAP } from "../../src/priceCap.js";

test("the cap rate is stored as whole hundredths of a penny", () => {
  assert.ok(Number.isInteger(PRICE_CAP.electricityHundredthsPerKwh));
  assert.ok(Number.isInteger(PRICE_CAP.gasHundredthsPerKwh));
  assert.equal(PRICE_CAP.electricityHundredthsPerKwh, 2632);
});

test("1kW for an hour costs one unit", () => {
  assert.equal(costPence(1000, 60, 2632), 26); // 26.32p
  assert.equal(costPence(2000, 60, 2632), 53); // 52.64p rounds up
});

test("pence round half up, once, at the end", () => {
  assert.equal(roundDiv(5, 10), 1); // 0.5 rounds up
  assert.equal(roundDiv(4, 10), 0); // 0.4 rounds down
  assert.equal(roundDiv(15, 10), 2); // 1.5 rounds up
  // 1kW for an hour at exactly 26.50p is 26.5p: rounds to 27p.
  assert.equal(costPence(1000, 60, 2650), 27);
  // 26.49p rounds to 26p.
  assert.equal(costPence(1000, 60, 2649), 26);
});

test("weekly and winter figures are not built from rounded hourly costs", () => {
  // 160W heated throw, 2 hours a day: 0.32kWh a day at 26.32p.
  const c = runningCost({ watts: 160, minutesPerWeek: 120 * 7, rate: 2632 });
  assert.equal(c.perHour, 4); // 4.2112p
  assert.equal(c.perWeek, 59); // 58.9568p, not 7 × 8p
  assert.equal(c.perWinter, 1533); // 1532.88p over 26 weeks
  assert.equal(WINTER_WEEKS, 26);
});

test("whole kWh at a rate", () => {
  assert.equal(costPenceForKwh(10000, 797), 79700); // 10,000kWh of gas at 7.97p is £797
  assert.equal(costPenceForKwh(1, 2632), 26);
  assert.equal(costPenceForKwh(1, 2650), 27);
});

test("tiny loads round to nothing and say so", () => {
  // A smart plug's own 0.64W standby can't be expressed in whole watts, so
  // the guide rounds it up to 1W: still well under a penny an hour.
  assert.equal(costPence(1, 60), 0);
  assert.equal(formatPence(costPence(1, 60)), "under 1p");
  assert.equal(costPence(0, 600), 0);
});

test("large figures stay exact", () => {
  // 3kW for every minute of a winter: 3 × 24 × 7 × 26 kWh = 13,104kWh.
  assert.equal(costPence(3000, 24 * 60 * 7 * 26, 2632), 344897); // £3,448.97
});

test("bad inputs are refused rather than guessed", () => {
  assert.throws(() => costPence(-1, 60), RangeError);
  assert.throws(() => costPence(1.5, 60), RangeError);
  assert.throws(() => costPence(100, 30.5), RangeError);
  assert.throws(() => costPence(100, 60, 26.32), RangeError);
  assert.throws(() => formatPence(1.2), RangeError);
});

test("pence are shown the way the site shows money", () => {
  assert.equal(formatPence(4), "4p");
  assert.equal(formatPence(99), "99p");
  assert.equal(formatPence(100), "£1.00");
  assert.equal(formatPence(1533), "£15.33");
  assert.equal(formatPence(344897), "£3,448.97");
  assert.equal(formatPence(111580), "£1,115.80");
  assert.equal(formatPence(123456789), "£1,234,567.89");
});
