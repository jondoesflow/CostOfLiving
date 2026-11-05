// Products for the energy-saving gift guide (/gifts/). Every figure here comes
// from the retailer's or maker's own page, recorded in `source` with the date
// in `lastChecked`; anything that couldn't be checked is null and listed in
// `todo`. Money is whole pence. Watts is the most the product can draw (the top
// of a range, or rounded up to a whole watt), so running costs are a ceiling.
//
// A product only appears on the site when `published` is true, which needs a
// checked wattage (or watts: 0 for things that use no electricity).
//
// Links: `awin` names the Awin advertiser and landing page. Until that
// programme has approved Cheap Watts (src/awinJoined.js), the link goes
// straight to the retailer's page with no affiliate tracking, or to an Amazon
// search with our tag where there's no retailer page to sell from.

export const GIFT_CATEGORIES = [
  {
    id: "heated-throws-electric-blankets",
    name: "Heated throws and electric blankets",
    short: "Heated throws",
    title: "Heated throws and electric blankets that cut heating bills (2026)",
    description: "Heated throws and electric blankets as gifts, with what each costs to run per hour, per week and per winter at the Ofgem price cap, compared with heating a room.",
    intro: "A heated throw warms the person, not the room, which is why it costs pennies an hour where a heater costs pounds. These are good gifts for anyone who feels the cold, works from home or is trying to keep the heating off a little longer.",
  },
  {
    id: "air-fryers-slow-cookers",
    name: "Air fryers and slow cookers",
    short: "Air fryers and slow cookers",
    title: "Air fryers and slow cookers: running costs compared with the oven (2026)",
    description: "Air fryers and slow cookers as gifts, with their running cost per hour, per week and per winter at the Ofgem price cap, and how they compare with an electric oven.",
    intro: "An air fryer heats a small space quickly and a slow cooker sips power for hours, so both cook a meal for less than heating a full-size oven. Good gifts for a first home, a student or anyone cooking for one or two.",
  },
  {
    id: "smart-plugs-thermostats",
    name: "Smart plugs and thermostats",
    short: "Smart plugs and thermostats",
    title: "Smart plugs and thermostats that help cut energy bills (2026)",
    description: "Smart plugs and thermostats as gifts, with what they cost to run themselves and what a gadget left on standby costs a year at the Ofgem price cap.",
    intro: "A smart plug with energy monitoring shows what an appliance really uses, and can switch it off completely or on a schedule. A good gift for anyone curious about where their electricity goes.",
  },
  {
    id: "draught-proofing",
    name: "Draught-proofing gifts",
    short: "Draught-proofing",
    title: "Draught-proofing gifts: cheap fixes that keep the heat in (2026)",
    description: "Draught-proofing strips and door excluders as practical gifts, with prices and a worked example of what stopping draughts could save on a gas bill at the price cap.",
    intro: "Not the most glamorous present, but a few pounds of draught strip can keep a home warmer all winter. Good for a new homeowner, a renter (most strips peel off cleanly) or anyone who complains about the cold.",
  },
];

export const GIFT_PRODUCTS = [
  // ---- Heated throws and electric blankets (Dimplex, Awin 130445) ----
  {
    id: "dimplex-cosy-heated-throw-grey", category: "heated-throws-electric-blankets",
    name: "Dimplex Cosy Heated Throw, Grey", brand: "Dimplex",
    watts: 160, wattsNote: "160W", pricePence: 4999,
    use: { minutesPerWeek: 120 * 7, label: "2 hours an evening" },
    features: "9 heat settings, a 1 to 9 hour timer and overheat protection.",
    awin: { mid: 130445, retailer: "Dimplex", url: "https://www.shopdimplex.com/products/cosy-heated-throw-grey" },
    image: null, lastChecked: "2026-11-03", source: "https://www.shopdimplex.com/products/cosy-heated-throw-grey",
    published: true, todo: [],
  },
  {
    id: "dimplex-underblanket-double", category: "heated-throws-electric-blankets",
    name: "Dimplex Washable Heated Underblanket, Double", brand: "Dimplex",
    watts: 74, wattsNote: "62 to 74W", pricePence: 3499,
    use: { minutesPerWeek: 30 * 7, label: "30 minutes to warm the bed each night" },
    features: "4 heat settings and overheat protection. No timer, so switch it off when you get in.",
    awin: { mid: 130445, retailer: "Dimplex", url: "https://www.shopdimplex.com/products/heated-electric-under-blanket-double" },
    image: null, lastChecked: "2026-11-03", source: "https://www.shopdimplex.com/products/heated-electric-under-blanket-double",
    published: true, todo: [],
  },
  {
    id: "dimplex-underblanket-king", category: "heated-throws-electric-blankets",
    name: "Dimplex Heated Electric Under Blanket, King", brand: "Dimplex",
    watts: 95, wattsNote: "80 to 95W", pricePence: 4499,
    use: { minutesPerWeek: 30 * 7, label: "30 minutes to warm the bed each night" },
    features: "4 heat settings and overheat protection. No timer, so switch it off when you get in.",
    awin: { mid: 130445, retailer: "Dimplex", url: "https://www.shopdimplex.com/products/heated-electric-under-blanket-king" },
    image: null, lastChecked: "2026-11-03", source: "https://www.shopdimplex.com/products/heated-electric-under-blanket-king",
    published: true, todo: [],
  },

  // ---- Air fryers and slow cookers (Tower, Awin 20823) ----
  {
    id: "tower-vortx-compact-2l", category: "air-fryers-slow-cookers",
    name: "Tower Vortx Compact 2 Litre Manual Air Fryer", brand: "Tower",
    watts: 1000, wattsNote: "1000W", pricePence: 1999,
    use: { minutesPerWeek: 30 * 4, label: "four 30-minute sessions a week" },
    features: "A small, manual air fryer: enough for one or two.",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/air-fryers/vortx-compact-2-litre-manual-air-fryer" },
    image: null, lastChecked: "2026-11-05", source: "https://www.towerhousewares.co.uk/air-fryers/vortx-compact-2-litre-manual-air-fryer",
    published: true, todo: [],
  },
  {
    id: "tower-vizion-4l-eco-saver", category: "air-fryers-slow-cookers",
    name: "Tower Vizion 4 Litre Eco Saver Air Fryer", brand: "Tower",
    watts: 1350, wattsNote: "1350W", pricePence: 4999,
    use: { minutesPerWeek: 30 * 4, label: "four 30-minute sessions a week" },
    features: "A 4 litre basket with a viewing window.",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/air-fryers/vizion-4-litre-eco-saver-air-fryer" },
    image: null, lastChecked: "2026-11-05", source: "https://www.towerhousewares.co.uk/air-fryers/vizion-4-litre-eco-saver-air-fryer",
    published: true, todo: [],
  },
  {
    id: "tower-vortx-4-2l-digital", category: "air-fryers-slow-cookers",
    name: "Tower 4.2 Litre Vortx Digital Air Fryer", brand: "Tower",
    watts: 1400, wattsNote: "1400W", pricePence: 4999,
    use: { minutesPerWeek: 30 * 4, label: "four 30-minute sessions a week" },
    features: "A 4.2 litre basket with digital controls.",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/air-fryers/4-2-litre-vortx-digital-air-fryer" },
    image: null, lastChecked: "2026-11-05", source: "https://www.towerhousewares.co.uk/air-fryers/4-2-litre-vortx-digital-air-fryer",
    published: true, todo: [],
  },
  {
    id: "tower-infinity-1-5l-slow-cooker", category: "air-fryers-slow-cookers",
    name: "Tower Infinity 1.5 Litre Stainless Steel Slow Cooker", brand: "Tower",
    watts: 120, wattsNote: "120W", pricePence: 1699,
    use: { minutesPerWeek: 8 * 60 * 2, label: "two 8-hour cooks a week" },
    features: "A small slow cooker with a keep-warm setting: right for one or two.",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/slow-cookers/infinity-15-litre-stainless-steel-slow-cooker" },
    image: null, lastChecked: "2026-11-05", source: "https://www.towerhousewares.co.uk/slow-cookers/infinity-15-litre-stainless-steel-slow-cooker",
    published: true, todo: [],
  },
  {
    id: "tower-6-5l-slow-cooker", category: "air-fryers-slow-cookers",
    name: "Tower 6.5 Litre Stainless Steel Slow Cooker", brand: "Tower",
    watts: 300, wattsNote: "300W", pricePence: 3499,
    use: { minutesPerWeek: 8 * 60 * 2, label: "two 8-hour cooks a week" },
    features: "A family-size slow cooker for batch cooking.",
    awin: { mid: 20823, retailer: "Tower", url: "https://www.towerhousewares.co.uk/slow-cookers/65-litre-stainless-steel-slow-cooker" },
    image: null, lastChecked: "2026-11-05", source: "https://www.towerhousewares.co.uk/slow-cookers/65-litre-stainless-steel-slow-cooker",
    published: true, todo: [],
  },

  // ---- Smart plugs and thermostats ----
  {
    id: "tp-link-tapo-p110", category: "smart-plugs-thermostats",
    name: "TP-Link Tapo P110 Smart Plug with Energy Monitoring", brand: "TP-Link",
    // TP-Link lists 0.64W with the socket off and 1.64W with it on; the
    // calculator works in whole watts, so its own use is counted as 2W.
    watts: 2, wattsNote: "0.64W off, 1.64W on (counted as 2W)", pricePence: null,
    use: { minutesPerWeek: 24 * 60 * 7, label: "plugged in all the time" },
    features: "Measures what the appliance plugged into it uses, and can switch it on a schedule.",
    query: "TP-Link Tapo P110 smart plug energy monitoring",
    image: null, lastChecked: "2026-11-03", source: "https://www.tp-link.com/uk/home-networking/smart-plug/tapo-p110/",
    published: true, todo: ["price: TP-Link's page shows no price, and retailers that sell it block our checks"],
  },
  {
    id: "tado-smart-thermostat", category: "smart-plugs-thermostats",
    name: "tado Smart Thermostat starter kit", brand: "tado",
    watts: null, wattsNote: null, pricePence: null,
    use: null,
    features: null,
    awin: { mid: 24881, retailer: "tado", url: "https://www.tado.com/gb-en" },
    image: null, lastChecked: "2026-11-03", source: null,
    published: false, todo: ["product page (tado's product URL returned not found)", "wattage", "price", "apply to tado on Awin (24881)"],
  },

  // ---- Draught-proofing (Wickes, Awin 1563) ----
  {
    id: "wickes-e-profile-seal-10m-white", category: "draught-proofing",
    name: "Wickes 10m E Profile Rubber Draught Seal, White", brand: "Wickes",
    watts: 0, wattsNote: null, pricePence: 850,
    use: null,
    features: "Self-adhesive rubber seal for the frames of doors and windows that open.",
    awin: { mid: 1563, retailer: "Wickes", url: "https://www.wickes.co.uk/Wickes-10m-E-Profile-Rubber-Draught-Seal---White/p/210804" },
    image: null, lastChecked: "2026-11-03", source: "https://www.wickes.co.uk/Wickes-10m-E-Profile-Rubber-Draught-Seal---White/p/210804",
    published: true, todo: [],
  },
  {
    id: "stormguard-internal-door-excluder-914", category: "draught-proofing",
    name: "Stormguard 914mm Internal Door Draught Excluder, White", brand: "Stormguard",
    watts: 0, wattsNote: null, pricePence: 1350,
    use: null,
    features: "Fits to the bottom of an internal door to stop the draught underneath.",
    awin: { mid: 1563, retailer: "Wickes", url: "https://www.wickes.co.uk/Stormguard-914mm-Internal-Door-Draught-Excluder---White/p/170426" },
    image: null, lastChecked: "2026-11-03", source: "https://www.wickes.co.uk/Stormguard-914mm-Internal-Door-Draught-Excluder---White/p/170426",
    published: true, todo: [],
  },
];

export const publishedGifts = (category) => GIFT_PRODUCTS.filter((p) => p.published && (!category || p.category === category));
