import { REGIONS, tariffsFor } from '../shared';

// Pure checks for the My tariff screen. Messages are shown under the field they belong to.

/** Highest unit rate we accept, in p/kWh. Anything above is almost certainly pounds, not pence. */
export const MAX_RATE = 200;

/**
 * Turns what the user typed into "HH:MM", or null if it isn't a time of day.
 * Accepts "7:30", "07:30", "0730" and "7.30"; rejects "24:00" and "7:60".
 */
export function normaliseTime(input: string): string | null {
  const s = input.trim().replace(/[.\s]/g, ':');
  const m = /^(\d{1,2}):?(\d{2})$/.exec(s);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** The error for a cheap-hours time, or null when it's fine. */
export function timeError(input: string): string | null {
  if (input.trim() === '') return 'Enter a time, for example 00:30';
  return normaliseTime(input) ? null : 'Use the 24-hour clock, for example 00:30 or 07:30';
}

/** The error for a unit rate in p/kWh, or null when it's fine. */
export function rateError(value: number | null): string | null {
  if (value == null) return 'Enter the rate in pence per kWh';
  if (!Number.isFinite(value) || value <= 0) return 'The rate must be more than 0p';
  if (value > MAX_RATE) return `That looks too high. Rates are in pence per kWh, usually under ${MAX_RATE}p`;
  return null;
}

/** The error for the whole Economy 7 block, or null when every field is fine. */
export function e7Error(e7: { nightStart: string; nightEnd: string; dayRate: number | null; nightRate: number | null }): string | null {
  return (
    timeError(e7.nightStart) ??
    timeError(e7.nightEnd) ??
    rateError(e7.dayRate) ??
    rateError(e7.nightRate) ??
    (normaliseTime(e7.nightStart) === normaliseTime(e7.nightEnd) ? 'The cheap rate must start and end at different times' : null)
  );
}

/**
 * The tariff to use after switching supplier: the current one if the new supplier offers it,
 * otherwise the first on offer. Same rule as the website's TariffStep.
 */
export function tariffAfterSupplierChange(currentTariff: string, supplierId: string): string {
  const options = tariffsFor(supplierId);
  return options.some((t) => t.id === currentTariff) ? currentTariff : options[0].id;
}

/** Postcode as typed, tidied for the lookup; empty when there's nothing to look up. */
export function cleanPostcode(input: string): string {
  return input.replace(/\s+/g, ' ').trim().toUpperCase();
}

/** The region's name for a code, or null for an unknown or empty code. */
export function regionName(code: string): string | null {
  return REGIONS.find((r) => r.code === code)?.name ?? null;
}

/** The standard rate rounded the way the website pre-fills it (two decimals), or null. */
export function prefilledFlatRate(apiFlatRate: number | null): number | null {
  return apiFlatRate ? Number(apiFlatRate.toFixed(2)) : null;
}
