// The Ofgem price cap figures the gift guide uses for its running costs. One
// place to change them when the cap changes (every three months).
//
// Rates are stored in hundredths of a penny per kWh, so they stay whole numbers:
// 2632 means 26.32p per kWh. Great Britain average, paying by Direct Debit.
// Ofgem: electricity has no VAT from 1 October 2026 to 30 June 2027; gas
// includes 5% VAT.
//
// Each cap is kept as a dated entry, oldest first, and PRICE_CAP is the one in
// effect on today's date in the UK. This module runs in the build and in the
// browser (it's copied to dist/gifts/), so a cap announced in advance can be
// added straight away: pages keep showing the current cap until its end date.
// Add the next cap to the end of the list when Ofgem announces it.
export const PRICE_CAPS = [
  {
    from: "2026-10-01",
    to: "2026-12-31",
    label: "1 October to 31 December 2026",
    electricityHundredthsPerKwh: 2632,
    gasHundredthsPerKwh: 797,
    source: "https://www.ofgem.gov.uk/news/changes-energy-price-cap-between-1-october-and-31-december-2026",
  },
  {
    from: "2027-01-01",
    to: "2027-03-31",
    label: "1 January to 31 March 2027",
    electricityHundredthsPerKwh: 3269,
    gasHundredthsPerKwh: 1096,
    // Announced 25 November 2026.
    source: "https://www.ofgem.gov.uk/your-energy-supply/your-energy-bill/energy-price-cap-unit-rates-and-standing-charges",
  },
];

// Today's date in the UK as YYYY-MM-DD, whatever the machine's own time zone.
export function ukToday(now = new Date()) {
  return now.toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

// The cap in effect on a date (YYYY-MM-DD): the latest one that has started.
// Before the first cap it gives the first; after the last one ends it keeps
// the last, whose label still says which period it is for.
export function priceCapOn(date = ukToday()) {
  let cap = PRICE_CAPS[0];
  for (const c of PRICE_CAPS) if (c.from <= date) cap = c;
  return cap;
}

export const PRICE_CAP = priceCapOn();
