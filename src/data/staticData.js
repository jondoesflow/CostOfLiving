// ============================================================
// STATIC REFERENCE DATA
// All data here comes from published government sources where
// no public JSON API exists. Each constant is annotated with
// its source URL, data vintage, and next expected update.
//
// LAST REVIEWED: April 2026
//
// UPDATE SCHEDULE:
// ┌─────────────────────────┬────────────┬─────────────────────┐
// │ Dataset                 │ Frequency  │ Next expected update │
// ├─────────────────────────┼────────────┼─────────────────────┤
// │ ONS Family Spending     │ Annual     │ Sep 2026 (FYE 2025) │
// │ Ofgem Energy Price Cap  │ Quarterly  │ May 2026 (Q3 2026)  │
// │ Bank of England Rate    │ ~8x/year   │ Apr 30, 2026 (MPC)  │
// │ DESNZ Fuel Poverty      │ Annual     │ Mar 2027 (2025 data)│
// │ DWP UC Caseload         │ Quarterly  │ Aug 2026             │
// └─────────────────────────┴────────────┴─────────────────────┘
// ============================================================

// Source: ONS Family Spending UK FYE 2024
// https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure
// Average weekly spend by household composition [adults_children]
export const AVG_WEEKLY_SPEND = {
  "1_0": { food: 38.20, energy: 22.10, transport: 45.30, comms: 14.20 },
  "1_1": { food: 52.40, energy: 24.80, transport: 38.90, comms: 15.10 },
  "1_2": { food: 61.30, energy: 26.40, transport: 35.20, comms: 15.80 },
  "1_3": { food: 61.30, energy: 26.40, transport: 35.20, comms: 15.80 },
  "2_0": { food: 62.10, energy: 28.30, transport: 89.40, comms: 16.90 },
  "2_1": { food: 74.50, energy: 31.20, transport: 92.10, comms: 18.40 },
  "2_2": { food: 85.30, energy: 33.80, transport: 94.30, comms: 19.20 },
  "2_3": { food: 96.20, energy: 36.10, transport: 91.80, comms: 20.10 },
  "3_0": { food: 62.10, energy: 28.30, transport: 89.40, comms: 16.90 },
  "3_1": { food: 74.50, energy: 31.20, transport: 92.10, comms: 18.40 },
  "3_2": { food: 85.30, energy: 33.80, transport: 94.30, comms: 19.20 },
  "3_3": { food: 96.20, energy: 36.10, transport: 91.80, comms: 20.10 },
};

// Source: ONS Family Spending UK FYE 2024
// Average weekly housing costs by tenure type
export const AVG_WEEKLY_HOUSING = {
  "Renting privately": 182.40,
  "Renting from council or housing association": 97.30,
  "Own with a mortgage": 163.20,
  "Own outright": 38.10,
  "Living with family": 0,
  "Other": 80.00,
};

// Source: Ofgem price cap announcements (quarterly, annualised typical bill)
// https://www.ofgem.gov.uk/energy-regulation/domestic-and-non-domestic/energy-pricing-rules/energy-price-cap
// Data vintage: Q2 2026 cap (announced Feb 2026)
// Next update: May 2026 (Q3 2026 cap announcement)
export const ENERGY_BILLS_ANNUAL = [
  { year: "2019", bill: 1254 },
  { year: "2020", bill: 1200 },
  { year: "2021", bill: 1277 },
  { year: "2022", bill: 2500 },
  { year: "2023", bill: 2500 },
  { year: "2024", bill: 1928 },
  { year: "2025", bill: 1738 },
  { year: "2026", bill: 1641 },
];

// Source: Bank of England official bank rate history
// https://www.bankofengland.co.uk/boeapps/database/Bank-Rate.asp
// Data vintage: MPC decision 19 Mar 2026 (held at 3.75%)
// Next update: 30 Apr 2026 (next MPC decision)
export const BOE_BASE_RATE = [
  { date: "Jan 2019", rate: 0.75 },
  { date: "Mar 2020", rate: 0.10 },
  { date: "Dec 2021", rate: 0.25 },
  { date: "Feb 2022", rate: 0.50 },
  { date: "Jun 2022", rate: 1.25 },
  { date: "Dec 2022", rate: 3.50 },
  { date: "Jun 2023", rate: 5.00 },
  { date: "Aug 2023", rate: 5.25 },
  { date: "Feb 2024", rate: 5.25 },
  { date: "Aug 2024", rate: 5.00 },
  { date: "Nov 2024", rate: 4.75 },
  { date: "Feb 2025", rate: 4.50 },
  { date: "May 2025", rate: 4.25 },
  { date: "Aug 2025", rate: 4.00 },
  { date: "Nov 2025", rate: 3.75 },
  { date: "Mar 2026", rate: 3.75 },
];

// Source: ONS Effects of Taxes and Benefits on UK Household Income, FYE 2024
// Mapping income bands to approximate national percentile of financial pressure
export const INCOME_PRESSURE_PERCENTILE = {
  "Under £1,000": 88,
  "£1,000–£1,750": 72,
  "£1,750–£2,500": 50,
  "£2,500–£3,500": 30,
  "Over £3,500": 12,
  "Prefer not to say": 50,
};

// ============================================================
// FALLBACK DATA — shown when live API calls fail
// ============================================================

// Source: ONS CPIH Food & Non-Alcoholic Beverages (annual % change)
export const FALLBACK_FOOD_INFLATION = [
  { date: "Jan 21", value: 0.6 }, { date: "Apr 21", value: 0.9 },
  { date: "Jul 21", value: 1.1 }, { date: "Oct 21", value: 2.5 },
  { date: "Jan 22", value: 4.3 }, { date: "Apr 22", value: 6.7 },
  { date: "Jul 22", value: 10.1 }, { date: "Oct 22", value: 14.6 },
  { date: "Jan 23", value: 17.1 }, { date: "Mar 23", value: 19.2 },
  { date: "Jul 23", value: 14.8 }, { date: "Oct 23", value: 10.1 },
  { date: "Jan 24", value: 7.0 }, { date: "Apr 24", value: 4.2 },
  { date: "Jul 24", value: 2.3 }, { date: "Oct 24", value: 2.0 },
  { date: "Jan 25", value: 3.0 },
];

// Source: ONS Index of Private Housing Rental Prices (annual % change)
export const FALLBACK_RENTAL = [
  { date: "Jan 21", value: 1.3 }, { date: "Jul 21", value: 1.6 },
  { date: "Jan 22", value: 2.9 }, { date: "Jul 22", value: 3.8 },
  { date: "Jan 23", value: 5.0 }, { date: "Jul 23", value: 5.5 },
  { date: "Jan 24", value: 6.5 }, { date: "Jul 24", value: 8.6 },
  { date: "Jan 25", value: 9.0 },
];

// ============================================================
// SUPPORT SCHEMES
// ============================================================

export function getRelevantSupport(profile) {
  const support = [];

  if (!profile.benefits.includes("Universal Credit") &&
      ["Under £1,000", "£1,000–£1,750", "£1,750–£2,500"].includes(profile.incomeBand)) {
    support.push({
      title: "Universal Credit",
      description: "A monthly payment to help with living costs if you're on a low income or out of work.",
      eligibility: "You may be eligible if your household income is below ~£35,000 and you have under £16,000 in savings.",
      url: "https://www.gov.uk/universal-credit/eligibility",
      reason: "your income band",
    });
  }

  if (profile.children > 0 && !profile.benefits.includes("Child Benefit")) {
    support.push({
      title: "Child Benefit",
      description: "Up to £25.60 per week for your first child, £16.95 for each additional child.",
      eligibility: "Available to most families with children under 16 (or under 20 in approved education). If you earn over £60,000, you'll repay some or all via tax.",
      url: "https://www.gov.uk/child-benefit",
      reason: "you have children",
    });
  }

  if (["Under £1,000", "£1,000–£1,750"].includes(profile.incomeBand)) {
    support.push({
      title: "Warm Home Discount",
      description: "A £150 one-off discount on your electricity bill, applied automatically for eligible households.",
      eligibility: "If you receive Pension Credit (Guarantee Credit) or are on a low income and high energy costs, your supplier may apply this automatically.",
      url: "https://www.gov.uk/the-warm-home-discount-scheme",
      reason: "your income band and energy costs",
    });
  }

  if (["Renting privately", "Renting from council or housing association"].includes(profile.tenure) ||
      ["Under £1,000", "£1,000–£1,750"].includes(profile.incomeBand)) {
    support.push({
      title: "Council Tax Reduction",
      description: "Your council may reduce your Council Tax bill by up to 100% depending on your income and circumstances.",
      eligibility: "Low income households, single occupancy discounts (25% off), and people on certain benefits may qualify.",
      url: "https://www.gov.uk/council-tax-reduction",
      reason: "your income and tenure",
    });
  }

  if (profile.children > 0 &&
      ["Under £1,000", "£1,000–£1,750"].includes(profile.incomeBand)) {
    support.push({
      title: "Free School Meals",
      description: "Free lunches at school for children in eligible households — worth around £550 per child per year.",
      eligibility: "Your child qualifies if your household receives Universal Credit with net earnings under £7,400, or certain other benefits.",
      url: "https://www.gov.uk/apply-free-school-meals",
      reason: "you have children and your income band",
    });
  }

  if (profile.incomeBand === "Under £1,000" || profile.worries.includes("Food and grocery costs")) {
    support.push({
      title: "Find Your Nearest Food Bank",
      description: "The Trussell Trust operates over 1,300 food bank locations across the UK. You need a referral, which a GP, school, or council can provide.",
      eligibility: "Anyone in crisis can be referred — there is no income threshold.",
      url: "https://www.trusselltrust.org/get-help/find-a-foodbank/",
      reason: "food costs flagged as a concern",
    });
  }

  if (["Under £1,000", "£1,000–£1,750"].includes(profile.incomeBand)) {
    support.push({
      title: "Household Support Fund",
      description: "One-off grants from your local council for essential costs like food, utilities and clothing. Varies by council.",
      eligibility: "Each local council sets its own criteria. Typically for households in financial crisis.",
      url: "https://www.gov.uk/guidance/household-support-fund-guidance-for-local-councils",
      reason: "your income band",
    });
  }

  support.push({
    title: "Check What Benefits You're Entitled To",
    description: "Turn2Us is a free, independent benefits calculator — it takes 10 minutes and tells you everything you may be missing.",
    eligibility: "Available to anyone. It's anonymous and doesn't affect your current benefits.",
    url: "https://benefits-calculator.turn2us.org.uk/",
    reason: "recommended for everyone",
    highlight: true,
  });

  return support;
}

// ============================================================
// PRACTICAL ACTIONS
// ============================================================

export const ACTIONS = [
  {
    icon: "ShoppingCart",
    title: "Switch to a cheaper supermarket",
    worry: "Food and grocery costs",
    detail: "Research consistently shows switching from Sainsbury's or Tesco to Aldi or Lidl saves the average household £30-£50 per month on identical baskets. The Which? Cheapest Supermarket tracker is updated monthly.",
    link: "https://www.which.co.uk/news/article/cheapest-supermarkets-compared-aViAn5T0N5DE",
  },
  {
    icon: "Zap",
    title: "Check if you're on the cheapest energy tariff",
    worry: "Energy bills (gas/electric)",
    detail: "Ofgem's price cap changes quarterly. Some households on prepayment meters or older standard tariffs are paying more than necessary. Use Uswitch or the Citizens Advice energy comparison tool.",
    link: "https://www.citizensadvice.org.uk/consumer/energy/energy-supply/get-a-better-energy-deal/",
  },
  {
    icon: "Home",
    title: "Apply for a free home energy check",
    worry: "Energy bills (gas/electric)",
    detail: "Many energy suppliers offer free insulation, boiler upgrades or draught-proofing to eligible households under the Energy Company Obligation (ECO4) scheme.",
    link: "https://www.gov.uk/energy-company-obligation",
  },
  {
    icon: "CreditCard",
    title: "Check if you're eligible for a Budgeting Loan",
    worry: "Debt and credit repayments",
    detail: "If you've been on certain benefits for 6+ months, you can apply for an interest-free Budgeting Loan from the government for essential items.",
    link: "https://www.gov.uk/budgeting-loan",
  },
  {
    icon: "Baby",
    title: "Check your childcare entitlements",
    worry: null,
    detail: "Working parents of 2-year-olds can access 15 hours free childcare per week. For 3 and 4-year-olds, this rises to 30 hours. Many families miss out simply by not knowing.",
    link: "https://www.gov.uk/free-childcare-2-year-olds",
    requiresChildren: true,
  },
  {
    icon: "Phone",
    title: "Ask about a social broadband tariff",
    worry: null,
    detail: "If you receive Universal Credit, PIP, or other qualifying benefits, you're likely eligible for broadband at £10-£15/month instead of £30-£50. BT, Sky, Virgin Media and others all offer these.",
    link: "https://www.ofcom.org.uk/phones-and-broadband/saving-money/social-tariffs",
    requiresBenefits: true,
  },
  {
    icon: "Home",
    title: "Negotiate your rent or know your rights",
    worry: "Rent or mortgage payments",
    detail: "If your landlord proposes a rent increase, you can challenge it via a tribunal. Shelter's website has template letters and guidance on your rights as a tenant.",
    link: "https://www.shelter.org.uk/housing_advice/private_renting/rent_increases",
  },
  {
    icon: "Bus",
    title: "Check for cheaper travel options",
    worry: "Transport / getting to work",
    detail: "Railcards save 1/3 on most fares (£30/year). Many areas have discounted bus passes. Cycle-to-work schemes can save 25-39% on a new bike through salary sacrifice.",
    link: "https://www.nationalrail.co.uk/railcards/",
  },
];

export function getRelevantActions(profile) {
  return ACTIONS.filter((action) => {
    if (action.requiresChildren && profile.children === 0) return false;
    if (action.requiresBenefits && profile.benefits.length === 0) return false;
    if (action.worry && profile.worries.length > 0 && !profile.worries.includes(action.worry)) {
      // If user specified worries, only show matching ones (plus non-worry ones)
      return false;
    }
    return true;
  }).slice(0, 8);
}
