// "Worth a look": products that genuinely help with the thing someone just
// looked up, linked to Amazon.co.uk searches with the Cheap Watts affiliate
// tag, or to a retailer through Awin where we're approved (see productLink). Searches rather than specific products, so links don't go stale and
// nothing needs Amazon's product API. Each has an icon tile, since Amazon
// only lets a site use its product photos once it has made some sales. The result itself never depends on any
// of this; the box sits below it and is labelled as affiliate links.
import { AWIN_JOINED } from "./awinJoined.js";

export const AMAZON_TAG = "cheapwatts-21";

export const amazonUrl = (query) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(query)}&tag=${AMAZON_TAG}`;

// Some picks can also go straight to a retailer through Awin. `awin` names the
// advertiser id and the page to land on; the link only switches over once that
// programme has approved us (see src/awinJoined.js), so nothing breaks while an
// application is pending.
export const AWIN_PUBLISHER_ID = 3143222;

// `clickref` tags the click with the page it came from, so Awin's reports show
// which pages earn. Awin wants `ued` (the landing page) last.
export const awinUrl = (mid, url, clickref) =>
  `https://www.awin1.com/cread.php?awinmid=${mid}&awinaffid=${AWIN_PUBLISHER_ID}${clickref ? `&clickref=${encodeURIComponent(clickref)}` : ""}&ued=${encodeURIComponent(url)}`;

export function productLink(p, joined = AWIN_JOINED) {
  if (p.awin && joined.includes(p.awin.mid)) return { href: awinUrl(p.awin.mid, p.awin.url), retailer: p.awin.retailer };
  return { href: amazonUrl(p.query), retailer: "Amazon" };
}

const PRODUCTS = {
  monitorPlug: {
    icon: "Gauge", id: "monitor-plug", name: "Smart plug with energy monitoring", query: "smart plug energy monitor uk",
    why: "Measure what your own appliance really uses per run, instead of the typical figure.",
    awin: { mid: 107077, retailer: "Meross", url: "https://shop.meross.com/collections/smart-plug-and-switch" },
  },
  schedulePlug: {
    icon: "PlugZap", id: "schedule-plug", name: "Smart plug with a timer", query: "smart plug timer schedule uk",
    why: "Switch it on in your cheap hours without getting up.",
  },
  airer: {
    icon: "Rows3", id: "airer", name: "Heated airer with a cover", query: "heated clothes airer with cover",
    awin: { mid: 1751, retailer: "Lakeland", url: "https://www.lakeland.co.uk/search?q=heated+airer" },
    why: "Dries a load for a fraction of what a tumble dryer costs. The cover halves the drying time.",
  },
  hpdryer: {
    icon: "Fan", id: "hpdryer", name: "Heat pump tumble dryer", query: "heat pump tumble dryer",
    why: "About a third of the electricity of a condenser or vented dryer for the same load.",
  },
  dehumidifier: {
    icon: "AirVent", id: "dehumidifier", name: "Dehumidifier with a laundry mode", query: "dehumidifier laundry mode",
    awin: { mid: 31711, retailer: "Meaco", url: "https://www.meaco.com/collections/dehumidifiers" },
    why: "Dries washing indoors cheaply and stops the damp that comes with it.",
  },
  blanket: {
    icon: "BedDouble", id: "blanket", name: "Electric blanket or heated throw", query: "electric heated throw",
    awin: { mid: 130445, retailer: "Dimplex", url: "https://www.shopdimplex.com/collections/heated-blankets" },
    why: "Warms you for about a penny an hour, against a pound or more for a room heater.",
  },
  airfryer: {
    icon: "Soup", id: "airfryer", name: "Air fryer", query: "air fryer",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/air-fryers" },
    why: "Cooks one or two portions for a fraction of the oven's cost.",
  },
  slowcooker: {
    icon: "CookingPot", id: "slowcooker", name: "Slow cooker", query: "slow cooker",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/slow-cookers" },
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
  ecoflow: {
    icon: "BatteryCharging", id: "ecoflow", name: "EcoFlow portable power station", query: "EcoFlow portable power station",
    awin: { mid: 51797, retailer: "EcoFlow", url: "https://uk.ecoflow.com/pages/portable-power-stations" },
    why: "Charge it in your cheap hours or from solar, then run small appliances from it later. Put its size into the battery calculator above first: on bill savings alone, small units rarely pay for themselves.",
  },
  ankerSolix: {
    icon: "BatteryFull", id: "anker-solix", name: "Anker SOLIX portable power station", query: "Anker SOLIX portable power station",
    awin: { mid: 36326, retailer: "Anker", url: "https://www.anker.com/uk/collections/power-stations" },
    why: "The same idea from Anker. Check how many kWh it holds against what the calculator says one charge is worth.",
  },
  kettle: {
    icon: "Coffee", id: "kettle", name: "Kettle with a one-cup setting", query: "one cup kettle energy saving",
    why: "Boils only what you need. Overfilling is where most kettle energy goes.",
  },
  // Picks used by blog posts (see "products:" in a post's front matter).
  ledBulbs: {
    icon: "Lightbulb", id: "led-bulbs", name: "LED light bulbs", query: "LED light bulbs",
    awin: { mid: 5190, retailer: "Simply LED", url: "https://www.simplyled.co.uk/lightbulbs/" },
    why: "An LED gives the same light as an old 60W bulb for about a tenth of the electricity. Match the fitting and the lumens.",
  },
  draughtStrip: {
    icon: "Wind", id: "draught-strip", name: "Self-adhesive draught strip", query: "self adhesive draught excluder strip doors windows",
    why: "Foam or rubber strip for the frames of doors and windows that open. Measure first and clean the frame so it sticks.",
  },
  doorBrush: {
    icon: "DoorClosed", id: "door-brush", name: "Door bottom brush strip", query: "door bottom brush draught excluder",
    why: "Fixes to the bottom of an external door to block the gap underneath.",
  },
  letterboxBrush: {
    icon: "Mail", id: "letterbox-brush", name: "Letterbox brush draught excluder", query: "letterbox draught excluder brush",
    why: "Stops the draught through the letterbox without stopping the post.",
  },
  roomThermometer: {
    icon: "Thermometer", id: "room-thermometer", name: "Room thermometer", query: "digital room thermometer",
    why: "Shows what a room is actually doing, so you can check your thermostat before turning it down.",
  },
  bleedKey: {
    icon: "KeyRound", id: "bleed-key", name: "Radiator bleed key", query: "radiator bleed key",
    why: "For radiators that are cold at the top. Turn the heating off and let them cool before you bleed them.",
  },
  trv: {
    icon: "Thermometer", id: "trv", name: "Thermostatic radiator valves (TRVs)", query: "thermostatic radiator valve",
    why: "Let each room stop heating once it's warm enough. Check the fitting matches your radiator valves first, or ask a plumber.",
  },
  reflector: {
    icon: "Layers", id: "radiator-reflector", name: "Radiator reflector panels", query: "radiator reflector panels",
    why: "Only worth it behind radiators on outside walls, as the post explains.",
  },
  thermalCurtains: {
    icon: "Blinds", id: "thermal-curtains", name: "Thermal lined curtains", query: "thermal lined curtains",
    why: "Close them at dusk to keep the heat in, and take them with you when you move.",
  },
  windowFilm: {
    icon: "AppWindow", id: "window-film", name: "Window insulation film kit", query: "window insulation film kit",
    why: "For windows you won't open over winter. If you rent, check with your landlord first, as the tape can lift paint.",
  },
  loftRoll: {
    icon: "Layers", id: "loft-roll", name: "Mineral wool loft insulation roll", query: "mineral wool loft insulation roll",
    why: "For topping up to the recommended 270mm. Wear gloves, goggles and a dust mask, and keep the eaves and downlights clear.",
  },
  pipeLagging: {
    icon: "Shield", id: "pipe-lagging", name: "Foam pipe lagging", query: "foam pipe lagging",
    why: "Slips over hot water pipes where they run through cold spaces. Turn the hot water off and let the pipes cool before fitting.",
  },
  switchedExtension: {
    icon: "Power", id: "switched-extension", name: "Extension lead with individual switches", query: "extension lead individually switched",
    why: "Switch a whole cluster of gadgets off at once, such as the TV corner or the desk.",
  },
};

export const ALL_PRODUCTS = Object.values(PRODUCTS);
export const productById = (id) => ALL_PRODUCTS.find((p) => p.id === id);

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
  dehumidifier: [PRODUCTS.dehumidifier, PRODUCTS.monitorPlug],
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
// Shown with the home battery plan on the solar and batteries tool.
export const SOLAR_PICKS = [PRODUCTS.ecoflow, PRODUCTS.ankerSolix];

export const DISCLOSURE = "Affiliate links: if you buy through them, Cheap Watts earns a small commission at no extra cost to you. They don't change the results above.";
export const AMAZON_NOTICE = "As an Amazon Associate, Cheap Watts earns from qualifying purchases.";
