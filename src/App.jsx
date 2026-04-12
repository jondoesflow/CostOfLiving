import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Cell
} from "recharts";
import {
  ShoppingCart, Zap, Home, Phone, Baby, CreditCard,
  ChevronDown, ChevronRight, ExternalLink, CheckCircle,
  AlertCircle, Info, ArrowRight, Users, Bus
} from "lucide-react";

// ============================================================
// HARDCODED REFERENCE DATA
// ============================================================

// Source: ONS Family Spending UK FYE 2024
// https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure
const AVG_WEEKLY_SPEND = {
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

const AVG_WEEKLY_HOUSING = {
  "Renting privately": 182.40,
  "Renting from council or housing association": 97.30,
  "Own with a mortgage": 163.20,
  "Own outright": 38.10,
  "Living with family": 0,
  "Other": 80.00,
};

// Source: Ofgem, DESNZ — annual average dual fuel bill
const ENERGY_BILLS_ANNUAL = [
  { year: "2019", bill: 1254 },
  { year: "2020", bill: 1200 },
  { year: "2021", bill: 1277 },
  { year: "2022", bill: 2500 },
  { year: "2023", bill: 2500 },
  { year: "2024", bill: 1928 },
];

// Source: Bank of England
const BOE_BASE_RATE = [
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
];

// Fallback food inflation data if API fails
// Source: ONS CPIH Food & Non-Alcoholic Beverages
const FALLBACK_FOOD_INFLATION = [
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

// Fallback rental index data
const FALLBACK_RENTAL = [
  { date: "Jan 21", value: 1.3 }, { date: "Jul 21", value: 1.6 },
  { date: "Jan 22", value: 2.9 }, { date: "Jul 22", value: 3.8 },
  { date: "Jan 23", value: 5.0 }, { date: "Jul 23", value: 5.5 },
  { date: "Jan 24", value: 6.5 }, { date: "Jul 24", value: 8.6 },
  { date: "Jan 25", value: 9.0 },
];


// ============================================================
// ACTIONS DATA
// ============================================================
const ACTIONS = [
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

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function calculatePressureScore(profile) {
  let score = 30;
  const incomePressure = {
    "Under £1,000": 40,
    "£1,000–£1,750": 28,
    "£1,750–£2,500": 16,
    "£2,500–£3,500": 8,
    "Over £3,500": 0,
    "Prefer not to say": 15,
  };
  score += incomePressure[profile.incomeBand] ?? 15;
  if (profile.tenure === "Renting privately") score += 15;
  if (profile.tenure === "Own with a mortgage") score += 10;
  score += profile.children * 5;
  return Math.min(score, 95);
}

function getPressureLabel(score) {
  if (score <= 30) return "Lower pressure";
  if (score <= 50) return "Moderate pressure";
  if (score <= 70) return "Significant pressure";
  return "High pressure";
}

function getPressureColor(score) {
  if (score <= 30) return "#2d6a4f";
  if (score <= 50) return "#e8703a";
  if (score <= 70) return "#c8500a";
  return "#c8500a";
}

function buildHouseholdLabel(profile) {
  const adultLabel = profile.adults === 1 ? "a single adult" : `${profile.adults} adults`;
  const kidsLabel = profile.children === 0 ? "" :
    profile.children === 1 ? " with 1 child" : ` with ${profile.children} children`;
  const location = profile.region ? ` in ${profile.region}` : "";
  return `${adultLabel}${kidsLabel}${location}`;
}

function getSpendKey(profile) {
  const adults = Math.min(profile.adults, 3);
  const children = Math.min(profile.children, 3);
  return `${adults}_${children}`;
}

function getComparisonPercentile(profile) {
  const map = {
    "Under £1,000": 88,
    "£1,000–£1,750": 72,
    "£1,750–£2,500": 50,
    "£2,500–£3,500": 30,
    "Over £3,500": 12,
    "Prefer not to say": 50,
  };
  let pct = map[profile.incomeBand] ?? 50;
  if (profile.children > 0) pct = Math.min(pct + 8, 95);
  if (profile.tenure === "Renting privately") pct = Math.min(pct + 5, 95);
  return pct;
}

function getPressureBullets(profile) {
  const bullets = [];
  if (["Under £1,000", "£1,000–£1,750", "£1,750–£2,500"].includes(profile.incomeBand)) {
    bullets.push("Your household is in the income band most affected by food and energy price rises.");
  }
  if (profile.tenure === "Renting privately") {
    bullets.push("Private renters have seen average rents rise 9.2% in the past year — the fastest increase since records began.");
  }
  if (profile.tenure === "Own with a mortgage") {
    bullets.push("Mortgage holders refinancing today face rates around 4.5% — up from under 2% in 2021.");
  }
  if (profile.children > 0) {
    bullets.push(`Households with children spend an estimated £${(profile.children * 47).toFixed(0)} more per week on food than those without.`);
  }
  if (profile.worries.includes("Energy bills (gas/electric)")) {
    bullets.push("Average household energy bills are still 54% higher than they were in 2019, even after falling from the 2022 peak.");
  }
  if (bullets.length === 0) {
    bullets.push("Cost of living pressures affect households differently depending on income, housing, and family size.");
  }
  return bullets.slice(0, 3);
}

