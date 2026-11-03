// The Ofgem price cap figures the gift guide uses for its running costs. One
// place to change them when the cap changes (every three months; the next
// announcement is due 25 November 2026, for 1 January to 31 March 2027).
//
// Rates are stored in hundredths of a penny per kWh, so they stay whole numbers:
// 2632 means 26.32p per kWh. Great Britain average, paying by Direct Debit.
// Electricity has no VAT from 1 October 2026 to 31 March 2027 (the Budget
// extended that to July 2027); gas includes 5% VAT.
export const PRICE_CAP = {
  from: "2026-10-01",
  to: "2026-12-31",
  label: "1 October to 31 December 2026",
  electricityHundredthsPerKwh: 2632,
  gasHundredthsPerKwh: 797,
  source: "https://www.ofgem.gov.uk/news/changes-energy-price-cap-between-1-october-and-31-december-2026",
};
