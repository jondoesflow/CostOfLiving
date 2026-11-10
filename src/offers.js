// Offers from Awin programmes Cheap Watts has joined, copied from Awin's offers
// API (POST /publisher/{id}/promotions) and picked for fit: only offers on
// things the site already talks about. Each runs from `starts` to `ends`
// (Awin's own times, UTC). Pages leave out offers that have ended when they're
// built, and a small script hides any that end (or haven't started) between
// builds, so an expired offer never shows.
//
// `places` says where each offer appears: "offers" is the /offers/ page,
// "gifts:<category>" a gift guide page, "cost:<appliance>" a running-cost page,
// "lights" the lighting page and "blog:<slug>" a blog post.
import { AWIN_JOINED } from "./awinJoined.js";
import { awinUrl } from "./products.js";

export const OFFERS = [
  {
    id: 4158927, mid: 20823, retailer: "Tower",
    title: "Extra 20% off all Tower air fryers",
    detail: "Tower's Air Fryer Week: 20% off all air fryers with the code, excluding clearance.",
    code: "AIRFRYER",
    url: "https://www.towerhousewares.co.uk/products/black-friday-air-fryer-week",
    starts: "2026-11-09T00:01:00Z", ends: "2026-11-15T23:59:00Z",
    places: ["offers", "gifts:air-fryers-slow-cookers", "cost:airfryer"],
    checked: "2026-11-09",
  },
  {
    id: 4162961, mid: 16860, retailer: "Swan",
    title: "£50 off the Swan Nordic Duo dual basket air fryer",
    detail: "Sale price on Swan's website, no code needed.",
    code: null,
    url: "https://shop.swan-brand.co.uk/air-fryers/swan-nordic-duo-13-in-1-air-fryer",
    starts: "2026-11-05T11:04:00Z", ends: "2026-11-30T23:59:00Z",
    places: ["offers", "gifts:air-fryers-slow-cookers", "cost:airfryer"],
    checked: "2026-11-09",
  },
  {
    id: 2563170, mid: 16860, retailer: "Swan",
    title: "12% off full-price Swan orders over £39.99",
    detail: "Applies to full-price orders over £39.99 on Swan's website.",
    code: "SWAN12",
    url: "https://shop.swan-brand.co.uk/",
    starts: "2024-01-29T14:40:00Z", ends: "2026-12-31T14:31:00Z",
    places: ["offers", "gifts:air-fryers-slow-cookers"],
    checked: "2026-11-09",
  },
  {
    id: 919337, mid: 5190, retailer: "Simply LED",
    title: "10% off your next order at Simply LED",
    detail: "UK only. Simply LED's standard terms apply.",
    code: "BULBS10",
    url: "https://www.simplyled.co.uk/",
    starts: "2020-05-19T12:35:00Z", ends: "2030-05-30T22:59:00Z",
    places: ["offers", "lights", "blog:is-it-worth-switching-to-led-bulbs"],
    checked: "2026-11-09",
  },
];

// Offers for a place that haven't ended by `now`, from programmes we've joined.
// Ones that haven't started yet are included so the page script can reveal
// them on the day; offerActive says whether one is running now.
export const offersFor = (place, now = new Date(), joined = AWIN_JOINED) =>
  OFFERS.filter((o) => o.places.includes(place) && joined.includes(o.mid) && new Date(o.ends) > now)
    .sort((a, b) => new Date(a.ends) - new Date(b.ends));

export const offerActive = (o, now = new Date()) => new Date(o.starts) <= now && now < new Date(o.ends);

export const offerLink = (o, clickref) => awinUrl(o.mid, o.url, clickref);
