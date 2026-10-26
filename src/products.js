// "Worth a look": products that genuinely help with the thing someone just
// looked up, linked to Amazon.co.uk searches with the Cheap Watts affiliate
// tag. Searches rather than specific products, so links don't go stale and
// nothing needs Amazon's product API. Each has an icon tile, since Amazon
// only lets a site use its product photos once it has made some sales. The result itself never depends on any
// of this; the box sits below it and is labelled as affiliate links.
export const AMAZON_TAG = "cheapwatts-21";

export const amazonUrl = (query) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;

const PRODUCTS = {
  monitorPlug: {
    icon: "Gauge", id: "monitor-plug", name: "Smart plug with energy monitoring", query: "smart plug energy monitor uk",
    why: "Measure what your own appliance really uses per run, instead of the typical figure.",
  },
  schedulePlug: {
    icon: "PlugZap", id: "schedule-plug", name: "Smart plug with a timer", query: "smart plug timer schedule uk",
    why: "Switch it on in your cheap hours without getting up.",
  },
  airer: {
    icon: "Rows3", id: "airer", name: "Heated airer with a cover", query: "heated clothes airer with cover",
    why: "Dries a load for a fraction of what a tumble dryer costs. The cover halves the drying time.",
  },
  hpdryer: {
    icon: "Fan", id: "hpdryer", name: "Heat pump tumble dryer", query: "heat pump tumble dryer",
    why: "About a third of the electricity of a condenser or vented dryer for the same load.",
  },
  dehumidifier: {
    icon: "AirVent", id: "dehumidifier", name: "Dehumidifier with a laundry mode", query: "dehumidifier laundry mode",
    why: "Dries washing indoors cheaply and stops the damp that comes with it.",
  },
  blanket: {
    icon: "BedDouble", id: "blanket", name: "Electric blanket or heated throw", query: "electric heated throw",
    why: "Warms you for about a penny an hour, against a pound or more for a room heater.",
  },
  airfryer: {
    icon: "Soup", id: "airfryer", name: "Air fryer", query: "air fryer",
    why: "Cooks one or two portions for a fraction of the oven's cost.",
  },
  slowcooker: {
    icon: "CookingPot", id: "slowcooker", name: "Slow cooker", query: "slow cooker",
    why: "A whole meal for about a unit of electricity.",
  },
  immersionTimer: {
    icon: "Timer", id: "immersion-timer", name: "Immersion heater timer", query: "immersion heater timer switch",
    why: "Heat the tank in your cheap hours only, rather than keeping it hot all day.",
  },
  showerTimer: {
    icon: "ShowerHead", id: "shower-timer", name: "Shower timer", query: "shower timer 4 minute",
    why: "A four-minute shower costs half an eight-minute one.",
  },
  tankJacket: {
    icon: "Cylinder", id: "tank-jacket", name: "Hot water cylinder jacket", query: "hot water cylinder jacket 80mm",
    why: "A badly insulated tank loses heat all day.",
  },
  kettle: {
    icon: "Coffee", id: "kettle", name: "Kettle with a one-cup setting", query: "one cup kettle energy saving",
    why: "Boils only what you need. Overfilling is where most kettle energy goes.",
  },
};

// Picks per appliance, most useful first. Every list ends with the monitoring
// plug, because the typical figures are only a starting point.
const BY_APPLIANCE = {
  washer: [PRODUCTS.monitorPlug],
  washerdryer: [PRODUCTS.airer, PRODUCTS.monitorPlug],
  dryer: [PRODUCTS.hpdryer, PRODUCTS.airer, PRODUCTS.monitorPlug],
  hpdryer: [PRODUCTS.monitorPlug],
  airer: [PRODUCTS.dehumidifier, PRODUCTS.monitorPlug],
  iron: [PRODUCTS.monitorPlug],
  dishwasher: [PRODUCTS.monitorPlug],
  oven: [PRODUCTS.airfryer, PRODUCTS.slowcooker, PRODUCTS.monitorPlug],
  airfryer: [PRODUCTS.monitorPlug],
  slowcooker: [PRODUCTS.monitorPlug],
  breadmaker: [PRODUCTS.monitorPlug],
  immersion: [PRODUCTS.immersionTimer, PRODUCTS.tankJacket],
  shower: [PRODUCTS.showerTimer],
  heater: [PRODUCTS.blanket, PRODUCTS.monitorPlug],
  blanket: [PRODUCTS.monitorPlug],
  dehumidifier: [PRODUCTS.monitorPlug],
  ebike: [PRODUCTS.monitorPlug],
  mobility: [PRODUCTS.monitorPlug],
  ev: [],
  custom: [PRODUCTS.monitorPlug],
};

// Picks for a result. `timed` is true on a tariff with cheap hours, where a
// scheduling plug does the waiting for you.
export function picksFor(applianceId, { timed = false } = {}) {
  const picks = [...(BY_APPLIANCE[applianceId] ?? [PRODUCTS.monitorPlug])];
  const canSchedule = !["shower", "iron", "immersion", "ev"].includes(applianceId);
  if (timed && canSchedule) picks.splice(Math.min(1, picks.length), 0, PRODUCTS.schedulePlug);
  return picks.slice(0, 3);
}

// Picks for the other tools and pages.
export const PLAN_PICKS = [PRODUCTS.schedulePlug, PRODUCTS.monitorPlug];
export const GAS_PICKS = [PRODUCTS.airfryer, PRODUCTS.airer, PRODUCTS.blanket];

export const DISCLOSURE = "Affiliate links: if you buy through them, Cheap Watts earns a small commission at no extra cost to you. They don't change the results above.";
export const AMAZON_NOTICE = "As an Amazon Associate, Cheap Watts earns from qualifying purchases.";
