import type { Slot } from '../shared';
import type { Comparison, Fuel } from './comparisons';

// The screen's derived values, kept pure so they can be tested. A port of the sums in the
// website's GasOrElectric.jsx.

export type ElectricChoice = 'now' | 'cheapest' | 'standard';

export interface ElectricOption {
  id: ElectricChoice;
  label: string;
  /** p/kWh */
  rate: number;
}

/** The electricity prices on offer: right now, the cheapest half hour today, and the standard tariff. */
export function electricOptions(slots: Slot[], refRate: number | null, ready: boolean): ElectricOption[] {
  const day = slots.slice(0, 48);
  const options: ElectricOption[] = [];
  if (ready && day.length) {
    options.push({ id: 'now', label: 'Right now', rate: day[0].price });
    options.push({ id: 'cheapest', label: 'Your cheapest half hour today', rate: Math.min(...day.map((s) => s.price)) });
  }
  if (refRate != null) options.push({ id: 'standard', label: 'Standard tariff', rate: refRate });
  return options;
}

/** The option matching the choice, or the first on offer (like the website). */
export function pickElectricOption(options: ElectricOption[], choice: ElectricChoice): ElectricOption | undefined {
  return options.find((o) => o.id === choice) ?? options[0];
}

/** The price to use: a typed override wins over the picked option. */
export function resolveRate(override: number | null, fallback: number | null | undefined): number | null {
  return typeof override === 'number' ? override : fallback ?? null;
}

/** How the website labels each fuel next to the option's name. */
export function fuelLabel(fuel: Fuel): string {
  return fuel === 'gas' ? 'gas' : fuel === 'none' ? 'free' : 'electric';
}

export interface ComparisonRow {
  name: string;
  fuel: Fuel;
  fuelLabel: string;
  kWh: number;
  /** Pence. */
  cost: number;
  /** Bar width as a fraction of the dearest option, never below 0.01 so a free row still shows a sliver. */
  fraction: number;
  cheapest: boolean;
}

/**
 * The rows for one comparison at the given prices (p/kWh), cheapest first. Gas options are priced
 * at the gas rate, electric ones at the electricity rate, and "free" options cost nothing.
 */
export function comparisonRows(c: Comparison, elecRate: number, gasPrice: number): ComparisonRow[] {
  const priced = c.options
    .map((o) => ({ ...o, cost: o.kWh * (o.fuel === 'gas' ? gasPrice : elecRate) }))
    .sort((a, b) => a.cost - b.cost);
  const max = Math.max(...priced.map((r) => r.cost), 0.01);
  return priced.map((r, i) => ({
    name: r.name,
    fuel: r.fuel,
    fuelLabel: fuelLabel(r.fuel),
    kWh: r.kWh,
    cost: r.cost,
    fraction: Math.max(0.01, r.cost / max),
    cheapest: i === 0,
  }));
}
