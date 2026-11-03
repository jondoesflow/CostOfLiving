// Running costs for the gift guide, in whole pence. Everything stays an integer
// until one rounding step at the end (half a penny rounds up), so a weekly or
// winter figure is never built from already-rounded hourly costs.
import { PRICE_CAP } from "./priceCap.js";

// Weeks in "a winter": October to March.
export const WINTER_WEEKS = 26;

// watts × minutes × rate (hundredths of a penny per kWh) gives a cost in units
// of 1 / (1000 W per kW × 60 min per hour × 100 hundredths per penny).
const UNIT = 1000 * 60 * 100;

const check = (name, value) => {
  if (!Number.isInteger(value) || value < 0) throw new RangeError(`${name} must be a whole number of zero or more, got ${value}`);
};

// Divide and round half up, for non-negative integers only.
export const roundDiv = (num, den) => Math.floor((2 * num + den) / (2 * den));

// Pence to run something drawing `watts` for `minutes`.
export function costPence(watts, minutes, rate = PRICE_CAP.electricityHundredthsPerKwh) {
  check("watts", watts);
  check("minutes", minutes);
  check("rate", rate);
  return roundDiv(watts * minutes * rate, UNIT);
}

// Per hour, per week and per winter, for `minutesPerWeek` of use.
export function runningCost({ watts, minutesPerWeek, rate = PRICE_CAP.electricityHundredthsPerKwh }) {
  check("minutesPerWeek", minutesPerWeek);
  return {
    perHour: costPence(watts, 60, rate),
    perWeek: costPence(watts, minutesPerWeek, rate),
    perWinter: costPence(watts, minutesPerWeek * WINTER_WEEKS, rate),
  };
}

// Pence for a number of whole kWh, for gas or electricity.
export function costPenceForKwh(kWh, rate) {
  check("kWh", kWh);
  check("rate", rate);
  return roundDiv(kWh * rate, 100);
}

// "£1,234.56", "23p", or "under 1p" for anything that rounds to nothing.
export function formatPence(p) {
  check("pence", p);
  if (p === 0) return "under 1p";
  if (p < 100) return `${p}p`;
  const pounds = String(Math.floor(p / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `£${pounds}.${String(p % 100).padStart(2, "0")}`;
}

