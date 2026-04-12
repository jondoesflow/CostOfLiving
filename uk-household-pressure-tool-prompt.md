# "What's the Squeeze?" — UK Household Cost of Living Tool
## Build Prompt for Claude

---

## What This Is

A **personal, interactive cost of living tool** for UK households. Not a dashboard for researchers — a tool a family in Rotherham or a single parent in Bristol opens on their phone to understand *their* situation, compare it to households like theirs, and find out what help is available to them right now.

The user is **not** a data analyst. They're a 34-year-old renter with two kids who's noticed their food shop has gone up and wants to know if they're missing out on any support. Build for them.

---

## Design Direction

**Aesthetic**: Warm, civic, accessible. Think GOV.UK clarity crossed with a well-designed NHS information page — trustworthy, plain-spoken, never patronising. 

**NOT**: dark data dashboards, stock market aesthetics, academic charts, anything that feels like it requires expertise to read.

**Palette**:
- Background: `#f8f7f4` (warm off-white, like paper)
- Primary: `#1d3461` (deep navy — trustworthy, civic)
- Accent: `#e8703a` (warm orange — action, urgency without alarm)
- Positive/help: `#2d6a4f` (forest green — relief, support available)
- Surface cards: `#ffffff` with `box-shadow: 0 2px 8px rgba(0,0,0,0.06)`
- Warning: `#c8500a` (amber-red — for genuine stress signals)

**Typography** (Google Fonts):
- Headings: `'Fraunces'` — warm, slightly literary serif. Feels human, not corporate.
- Body: `'Source Sans 3'` — highly legible, designed for reading-heavy UIs. Accessible at small sizes.
- Numbers/data: `'Tabular Numbers'` feature enabled via `font-variant-numeric: tabular-nums`

**Layout**: Single column, mobile-first. Max width 680px, centred. This is read on phones in the kitchen, not on a 27" monitor. Cards stack vertically. No sidebars.

**Tone of all copy**: Plain English. Short sentences. No jargon. If a term must be used (e.g. "CPIH"), explain it immediately in brackets. Write like a knowledgeable friend, not a government statistician.

---

## Application Flow

The app has **two phases**: Setup and Results. No page reloads — everything is state-driven.

---

### Phase 1: Household Setup (Onboarding)

A simple step-by-step form. **3 steps maximum**. Progress shown as dots at the top. No more than 4 questions per step. All fields optional with sensible defaults — never block the user.

**Step 1 — Your Household**

```
"Tell us a bit about your household so we can personalise the numbers."

- Postcode (optional — used to show regional context only, never stored)
  Input: text field, validated via Postcodes.io on blur
  
- Number of adults in your household
  Options: 1 / 2 / 3+
  
- Do you have children living at home?
  Options: No / Yes — 1 child / Yes — 2 children / Yes — 3 or more

- What best describes your housing situation?
  Options: Renting privately / Renting from council or housing association / 
           Own with a mortgage / Own outright / Living with family / Other
```

**Step 2 — Your Finances (approximate)**

```
"We don't need exact figures. Rough ranges help us show you the most relevant information and support."

- Approximate combined household income (after tax, per month)
  Options: Under £1,000 / £1,000–£1,750 / £1,750–£2,500 / 
           £2,500–£3,500 / Over £3,500 / Prefer not to say

- Are you currently receiving any benefits?
  Options (multi-select checkboxes):
    □ Universal Credit
    □ Child Benefit  
    □ Housing Benefit
    □ Pension Credit
    □ Other benefits
    □ No, I don't receive benefits

- Employment status
  Options: Employed full-time / Employed part-time / Self-employed / 
           Unemployed / Retired / Full-time carer / Student
```

**Step 3 — Your Biggest Worries (optional)**

```
"What's feeling most squeezed right now? Select all that apply."

□ Food and grocery costs
□ Energy bills (gas/electric)
□ Rent or mortgage payments
□ Childcare costs
□ Transport / getting to work
□ Debt and credit repayments
□ I'm managing fine, just curious

[See my results →]  ← Primary CTA button, navy background, full width
```

Store all answers in a `householdProfile` state object. This object drives all personalisation throughout the Results phase.

```js
const [householdProfile, setHouseholdProfile] = useState({
  postcode: '',
  region: '',
  adults: 1,
  children: 0,
  tenure: '',
  incomeband: '',
  benefits: [],
  employmentStatus: '',
  worries: [],
  setupComplete: false,
});
```

---

### Phase 2: Results — "Your Picture"

Once setup is complete, show the results view. All sections are visible at once (scrollable), not tabbed — this is important for mobile usability.

A sticky header shows: **"Results for a [household description] in [region]"** — e.g. "Results for a family of 4 renting in Yorkshire". Update this based on the profile. Add a small "Edit" button to return to setup.

---

## Results Sections

---

### Section 1: Your Pressure Score

**The first thing they see after setup.** An at-a-glance summary of their financial pressure, personalised.

**Visual**: A horizontal gauge/meter component (build with CSS, not a chart library — simpler, faster, more impactful). Scale from 0–100 labelled "Lower pressure" to "Higher pressure". The needle/fill position is calculated from the profile inputs.

**Pressure Score Calculation** (client-side, hardcoded logic):

```js
function calculatePressureScore(profile) {
  let score = 30; // baseline
  
  // Income band pressure
  const incomePressure = {
    'Under £1,000': 40,
    '£1,000–£1,750': 28,
    '£1,750–£2,500': 16,
    '£2,500–£3,500': 8,
    'Over £3,500': 0,
    'Prefer not to say': 15,
  };
  score += incomePressure[profile.incomeBand] ?? 15;
  
  // Tenure pressure
  if (profile.tenure === 'Renting privately') score += 15;
  if (profile.tenure === 'Own with a mortgage') score += 10;
  
  // Children
  score += profile.children * 5;
  
  // Cap at 95 — never tell someone they're at maximum
  return Math.min(score, 95);
}
```

Below the gauge: **3 plain-English summary bullets** generated from the profile. Examples:
- "Your household is in the income band most affected by food and energy price rises."
- "Private renters have seen average rents rise 9.2% in the past year."
- "Households with children spend an estimated £47 more per week on food than those without."

These bullets should be conditionally rendered based on profile — not shown if not relevant.

---

### Section 2: How Your Bills Compare

**The most practically useful section.** Show the user how their household's likely spending compares to the national average for a *similar* household.

**Visual**: Side-by-side comparison bars for each category. Left bar = "UK average for households like yours", right bar = a simple self-assessment slider the user can set.

Add a row for each of these categories:
- 🛒 Food & groceries
- ⚡ Gas & electricity
- 🏠 Rent or mortgage
- 🚌 Transport
- 📱 Phone & broadband

For each row:
- Show the UK average weekly spend for their household type (use hardcoded reference data below)
- Show a simple slider: "How does your spending compare?" with options: "Less than this / About the same / More than this"
- If they select "More than this", surface a small amber callout: "You might be spending more than typical — here's why this might be, and what can help."

**Reference Data — Average Weekly Spend by Household Type**
Source: ONS Family Spending in the UK, FYE 2024

```js
// Source: ONS Family Spending UK FYE 2024
// https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/expenditure
const AVG_WEEKLY_SPEND = {
  // [adults][children] -> category spends in £/week
  "1_0": { food: 38.20, energy: 22.10, transport: 45.30, comms: 14.20 },
  "1_1": { food: 52.40, energy: 24.80, transport: 38.90, comms: 15.10 },
  "1_2": { food: 61.30, energy: 26.40, transport: 35.20, comms: 15.80 },
  "2_0": { food: 62.10, energy: 28.30, transport: 89.40, comms: 16.90 },
  "2_1": { food: 74.50, energy: 31.20, transport: 92.10, comms: 18.40 },
  "2_2": { food: 85.30, energy: 33.80, transport: 94.30, comms: 19.20 },
  "2_3": { food: 96.20, energy: 36.10, transport: 91.80, comms: 20.10 },
};
// For tenure-based housing costs
const AVG_WEEKLY_HOUSING = {
  "Renting privately": 182.40,
  "Renting from council or housing association": 97.30,
  "Own with a mortgage": 163.20,
  "Own outright": 38.10,
};
```

**Show total estimated weekly household spend** at the bottom of this section as a running total.

---

### Section 3: What's Driven Your Bills Up

**Contextual explanation, not raw data.** 2–3 focused charts that explain *why* costs have risen, personalised to their stated worries from setup.

Only show charts for the categories they flagged as worrying. If they flagged food AND energy, show both. If they flagged nothing (just curious), show the top 2 by default.

#### Food Prices Chart

A **simple line chart** (recharts) showing CPIH food inflation monthly from Jan 2021 to present. Fetched live from the ONS Beta API.

```
GET https://api.beta.ons.gov.uk/v1/datasets/cpih01/editions/time-series/versions/latest/observations?time=*&geography=K02000001&aggregate=cpih1dim1T60000
```

Filter to Jan 2021 onwards. X-axis: month labels, simplified (e.g. "Jan 21", "Jul 21"). Y-axis: annual % change. 

Add a single reference line: "Food inflation peaked at 19.2% — March 2023"

Below the chart, a **plain-English callout box** (NOT a data box — conversational):
> "In plain terms: a weekly food shop that cost £80 in January 2021 would have cost around £99 by early 2023 — a rise of nearly £20 for the same basket of goods. Prices have eased since then, but haven't fallen back."

#### Energy Bills Chart

A **bar chart** showing average annual household energy bill by year (2019–2024), hardcoded.

```js
// Source: Ofgem, DESNZ — annual average dual fuel bill
const ENERGY_BILLS_ANNUAL = [
  { year: "2019", bill: 1254 },
  { year: "2020", bill: 1200 },
  { year: "2021", bill: 1277 },
  { year: "2022", bill: 2500 }, // Price cap surge
  { year: "2023", bill: 2500 },
  { year: "2024", bill: 1928 },
];
```

Colour the 2022 and 2023 bars in `#c8500a` (warning). Others in `#1d3461` (navy).

Below the chart:
> "The energy price cap protects you from the very highest bills, but the 'cap' is still nearly twice what households paid in 2019. A typical household now spends around £161 a month on gas and electricity."

#### Rent / Mortgage Pressure Chart

Only show if tenure is renting or mortgaged.

For **renters**: A simple line chart showing ONS Private Rental Price Index — fetch live:
```
GET https://api.ons.gov.uk/v1/timeseries/DRPI/dataset/pri/data
```
Show Jan 2021 to latest. Label the Y-axis "Annual % increase in rents". Below: "Private rents have risen faster than wages for [X] months in a row."

For **mortgage holders**: A line chart showing the Bank of England base rate from 2019 to present (hardcoded):
```js
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
```
Below: "If you remortgaged at today's rates, a £200,000 mortgage over 25 years would cost roughly £400 more per month than it did in 2021."

---

### Section 4: Support You Might Be Missing

**This is the most important section for many users.** Show them concrete help they may be entitled to. Every item must have a link.

Conditionally render items based on the household profile. Prioritise ruthlessly — only show what's plausibly relevant. Don't show everything to everyone.

**Layout**: Cards in a vertical stack. Each card has:
- A green left border accent
- Title of the support scheme
- 1-sentence plain description of what it is
- Eligibility summary: "You may be eligible if..." (1–2 conditions, not legalese)
- A clear CTA button: "Check if you qualify →" linking to the official source
- A "Why we're showing this" micro-note in small grey text, e.g. "Shown because: you selected private renter + under £1,750/month income"

**Conditional Logic:**

```js
function getRelevantSupport(profile) {
  const support = [];

  // Universal Credit — show if low income and not already claiming
  if (!profile.benefits.includes('Universal Credit') && 
      ['Under £1,000','£1,000–£1,750','£1,750–£2,500'].includes(profile.incomeBand)) {
    support.push({
      title: "Universal Credit",
      description: "A monthly payment to help with living costs if you're on a low income or out of work.",
      eligibility: "You may be eligible if your household income is below ~£35,000 and you have under £16,000 in savings.",
      url: "https://www.gov.uk/universal-credit/eligibility",
      reason: "your income band",
    });
  }

  // Child Benefit — show if has children and not claiming
  if (profile.children > 0 && !profile.benefits.includes('Child Benefit')) {
    support.push({
      title: "Child Benefit",
      description: "Up to £25.60 per week for your first child, £16.95 for each additional child.",
      eligibility: "Available to most families with children under 16 (or under 20 in approved education). If you earn over £60,000, you'll repay some or all via tax.",
      url: "https://www.gov.uk/child-benefit",
      reason: "you have children",
    });
  }

  // Warm Home Discount — show if low income, Oct–March relevant
  if (['Under £1,000','£1,000–£1,750'].includes(profile.incomeBand)) {
    support.push({
      title: "Warm Home Discount",
      description: "A £150 one-off discount on your electricity bill, applied automatically for eligible households.",
      eligibility: "If you receive Pension Credit (Guarantee Credit) or are on a low income and high energy costs, your supplier may apply this automatically.",
      url: "https://www.gov.uk/the-warm-home-discount-scheme",
      reason: "your income band and energy costs",
    });
  }

  // Council Tax Reduction — show if renting or low income
  if (['Renting privately','Renting from council or housing association'].includes(profile.tenure) ||
      ['Under £1,000','£1,000–£1,750'].includes(profile.incomeBand)) {
    support.push({
      title: "Council Tax Reduction",
      description: "Your council may reduce your Council Tax bill by up to 100% depending on your income and circumstances.",
      eligibility: "Low income households, single occupancy discounts (25% off), and people on certain benefits may qualify.",
      url: "https://www.gov.uk/council-tax-reduction",
      reason: "your income and tenure",
    });
  }

  // Free School Meals — show if has children and low income
  if (profile.children > 0 && 
      ['Under £1,000','£1,000–£1,750'].includes(profile.incomeBand)) {
    support.push({
      title: "Free School Meals",
      description: "Free lunches at school for children in eligible households — worth around £550 per child per year.",
      eligibility: "Your child qualifies if your household receives Universal Credit with net earnings under £7,400, or certain other benefits.",
      url: "https://www.gov.uk/apply-free-school-meals",
      reason: "you have children and your income band",
    });
  }

  // Food banks / Trussell Trust — show if very low income
  if (profile.incomeBand === 'Under £1,000' || profile.worries.includes('Food and grocery costs')) {
    support.push({
      title: "Find Your Nearest Food Bank",
      description: "The Trussell Trust operates over 1,300 food bank locations across the UK. You need a referral, which a GP, school, or council can provide.",
      eligibility: "Anyone in crisis can be referred — there is no income threshold.",
      url: "https://www.trusselltrust.org/get-help/find-a-foodbank/",
      reason: "food costs flagged as a concern",
    });
  }

  // Household Support Fund — show for low income
  if (['Under £1,000','£1,000–£1,750'].includes(profile.incomeBand)) {
    support.push({
      title: "Household Support Fund",
      description: "One-off grants from your local council for essential costs like food, utilities and clothing. Varies by council.",
      eligibility: "Each local council sets its own criteria. Typically for households in financial crisis.",
      url: "https://www.gov.uk/guidance/household-support-fund-guidance-for-local-councils",
      reason: "your income band",
    });
  }

  // Benefits calculator — always show
  support.push({
    title: "Check What Benefits You're Entitled To",
    description: "Turn2Us is a free, independent benefits calculator — it takes 10 minutes and tells you everything you may be missing.",
    eligibility: "Available to anyone. It's anonymous and doesn't affect your current benefits.",
    url: "https://benefits-calculator.turn2us.org.uk/",
    reason: "recommended for everyone",
    highlight: true, // render this one with a stronger visual treatment
  });

  return support;
}
```

If the profile suggests the user is managing well (high income band, no worries selected), still show the Turn2Us calculator and perhaps Childcare entitlements if relevant. Never show an empty section — always have at least 2 items.

---

### Section 5: How You Compare

A **single, simple visual** showing where this household sits nationally. Not a complex chart — one empathetic framing.

Show a stylised population diagram (dot matrix, 10x10 = 100 dots). Highlight dots based on the proportion of UK households under more financial pressure than this user's estimate.

```
e.g. "Based on your household type and income band, roughly 3 in 10 UK 
      households are likely under greater financial pressure than yours right now."
```

Render the highlighted proportion in amber, unhighlighted in `#e2e8f0` (light grey). Label clearly. Below the diagram:

> "This is based on ONS income distribution data (FY2024) and does not account for individual circumstances like debt, health costs, or recent job changes."

Source: ONS Effects of Taxes and Benefits on UK Household Income, FYE 2024.

This section should feel **normalising and compassionate** — not competitive. The goal is to help people understand their situation in context, not rank themselves.

---

### Section 6: Small Steps That Add Up

A **practical actions list**, not another data chart. Contextualised to their worries.

Each action is a simple expandable row (accordion) with:
- An icon (lucide-react)
- Short title
- Expanded: 2–3 sentences of practical guidance
- Optional link

Show 6–8 actions maximum. Prioritise based on their stated worries.

Example actions:
```js
const ACTIONS = [
  {
    icon: "ShoppingCart",
    title: "Switch to a cheaper supermarket",
    worry: "Food and grocery costs",
    detail: "Research consistently shows switching from Sainsbury's or Tesco to Aldi or Lidl saves the average household £30–£50 per month on identical baskets. The Which? Cheapest Supermarket tracker is updated monthly.",
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
    detail: "Many energy suppliers are required to offer free insulation, boiler upgrades or draught-proofing to eligible households under the Energy Company Obligation (ECO4) scheme. A cold home uses more energy.",
    link: "https://www.gov.uk/energy-company-obligation",
  },
  {
    icon: "CreditCard",
    title: "Check if you're eligible for a Budgeting Loan",
    worry: "Debt and credit repayments",
    detail: "If you've been on certain benefits for 6+ months, you can apply for an interest-free Budgeting Loan from the government for essential items like furniture, clothing, or rent in advance.",
    link: "https://www.gov.uk/budgeting-loan",
  },
  {
    icon: "Baby",
    title: "Check your childcare entitlements",
    worry: null, // show if profile.children > 0
    detail: "Working parents of 2-year-olds can now access 15 hours free childcare per week. For 3 and 4-year-olds, this rises to 30 hours. Many families miss out simply by not knowing.",
    link: "https://www.gov.uk/free-childcare-2-year-olds",
  },
  {
    icon: "Phone",
    title: "Ask about a social broadband tariff",
    worry: null,
    detail: "If you receive Universal Credit, PIP, or other qualifying benefits, you're likely eligible for broadband at £10–£15/month instead of £30–£50/month. BT, Sky, Virgin Media and others all offer these.",
    link: "https://www.ofcom.org.uk/phones-and-broadband/saving-money/social-tariffs",
  },
];
```

Filter `ACTIONS` to show only those matching the user's stated `worries`, plus any that are triggered by profile attributes (e.g. children). Always include the broadband tariff if they receive benefits.

---

## Footer

Below all sections, a consistent footer card:

```
📞 Need to talk to someone?

Citizens Advice: Free, impartial advice on benefits, debt, housing and employment.
Call 0800 144 8848 (free) or find your local bureau at citizensadvice.org.uk

StepChange: Free debt advice and a personal action plan.
Call 0800 138 1111 or visit stepchange.org

Turn2Us: Benefits calculator and grants search.
turn2us.org.uk

---

This tool uses data from the Office for National Statistics, DESNZ, DWP, and 
Postcodes.io, all published under the Open Government Licence v3.0.
Your answers are not stored or sent anywhere. This is a local calculation only.
```

The privacy note is important — include it prominently. Households are often anxious about entering income information online.

---

## Technical Specification

### Framework & Libraries

```js
import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer
} from "recharts";
import {
  ShoppingCart, Zap, Home, Phone, Baby, CreditCard,
  ChevronDown, ChevronRight, ExternalLink, CheckCircle,
  AlertCircle, Info, ArrowRight
} from "lucide-react";
```

Tailwind CSS via CDN. No other dependencies.

### State Structure

```js
const [phase, setPhase] = useState('setup'); // 'setup' | 'results'
const [step, setStep] = useState(1); // 1 | 2 | 3
const [profile, setProfile] = useState({ /* as defined above */ });
const [cpihFoodData, setCpihFoodData] = useState(null);
const [rentalData, setRentalData] = useState(null);
const [postcodeRegion, setPostcodeRegion] = useState('');
const [expandedAction, setExpandedAction] = useState(null);
const [billComparisons, setBillComparisons] = useState({});
const [apiErrors, setApiErrors] = useState({});
```

### API Calls

Only two live API calls needed (everything else is hardcoded or calculated):

**1. ONS CPIH Food Inflation** (fetched on entering results phase):
```
GET https://api.beta.ons.gov.uk/v1/datasets/cpih01/editions/time-series/versions/latest/observations?time=*&geography=K02000001&aggregate=cpih1dim1T60000
```
Filter response to months from Jan-21 onwards. Transform to `{date, value}` array.

**2. Postcodes.io** (fetched when postcode entered in setup):
```
GET https://api.postcodes.io/postcodes/{postcode}
```
Extract `result.region` or `result.nuts.name` for the regional label. On failure, gracefully skip — region is a nice-to-have, not required.

**3. ONS Private Rental Index** (only fetched if tenure is renting):
```
GET https://api.ons.gov.uk/v1/timeseries/DRPI/dataset/pri/data
```

All fetches wrapped in try/catch. On failure: show hardcoded fallback data with a tiny grey note "Using published figures (live data unavailable)". Never show an error page.

### Personalisation Engine

```js
// Call this whenever profile changes — drives all conditional rendering
function personaliseResults(profile) {
  return {
    pressureScore: calculatePressureScore(profile),
    pressureLabel: getPressureLabel(score),
    relevantSupport: getRelevantSupport(profile),
    relevantActions: getRelevantActions(profile),
    spendBenchmarks: getSpendBenchmarks(profile),
    showCharts: {
      food: profile.worries.includes('Food and grocery costs') || profile.worries.length === 0,
      energy: profile.worries.includes('Energy bills (gas/electric)') || profile.worries.length === 0,
      housing: ['Renting privately','Own with a mortgage'].includes(profile.tenure),
    },
    comparisonDotPct: getComparisonPercentile(profile),
    householdLabel: buildHouseholdLabel(profile),
  };
}

function buildHouseholdLabel(profile) {
  const adults = profile.adults === 1 ? 'single adult' : `${profile.adults} adults`;
  const kids = profile.children === 0 ? '' : 
               profile.children === 1 ? ' with 1 child' : ` with ${profile.children} children`;
  const location = profile.postcodeRegion ? ` in ${profile.postcodeRegion}` : '';
  return `${adults}${kids}${location}`;
}
```

### Accessibility

- All form inputs have associated `<label>` elements
- All icon-only buttons have `aria-label`
- Colour is never the only differentiator (pair with icons or text)
- The pressure gauge must have an accessible text alternative: `aria-label="Pressure score: 67 out of 100"` 
- Focus ring preserved on all interactive elements (do not remove with `outline: none`)
- Minimum tap target size 44x44px on all interactive elements

### Mobile-First Rules

- Maximum content width: 680px, centred
- All charts: minimum height 240px, `overflow-x: auto` wrapper
- Form controls: minimum height 48px
- Font sizes: body minimum 16px (prevents iOS zoom-on-focus)
- Padding: minimum 16px horizontal on all cards
- The setup steps: full-screen feel, one clear action per screen

---

## Copy & Tone Reference

The voice throughout should be a knowledgeable, caring friend — not a government form.

| Avoid | Use instead |
|---|---|
| "Your CPIH basket aggregate..." | "What everyday items actually cost you" |
| "Disposable equivalised income" | "What you have left after essentials" |
| "Fuel poor households" | "Households struggling to afford heating" |
| "Income quintile" | "Households with similar earnings to yours" |
| "Submit your query" | "See your results" |
| "Error: API call failed" | "We couldn't load the latest figures — showing recent published data instead" |

Write every label, every heading, every button as if you're talking to someone who's a little stressed about money. They're not stupid. They just don't want jargon.

---

## Deliverable

A single working `App.jsx` that:
- Renders the full two-phase flow (setup → results)
- Personalises every section based on the household profile
- Handles API failures gracefully with fallback data
- Is fully mobile-responsive (680px max-width, single column)
- Has the warm, civic aesthetic described above
- Is accessible (keyboard navigable, screen reader labels)
- Has clear code comments for every data source and personalisation decision
- Feels like a tool built *for* people, not *about* them
