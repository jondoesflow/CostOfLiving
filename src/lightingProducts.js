// LED bulbs for the lighting running-cost page (/cost-to-run/lights/) and the
// LED blog post. Every figure is from the product's page on simplyled.co.uk,
// checked on the date in `lastChecked`: power in tenths of a watt (38 is
// 3.8W), the old bulb it replaces as Simply LED states it, light output, and
// the listed price for the pack in whole pence. Links go through Awin
// (Simply LED, advertiser 5190) once it's in src/awinJoined.js.
const SIMPLY_LED = (path) => ({ mid: 5190, retailer: "Simply LED", url: `https://www.simplyled.co.uk/${path}/` });
const CHECKED = "2026-11-03";

export const LED_BULBS = [
  {
    id: "crompton-gls-b22-3-8w", name: "Crompton LED Ultra-Efficient GLS B22 3.8W, warm white", brand: "Crompton",
    deciwatts: 38, replaces: { watts: 60, name: "60W traditional bulb" }, lumens: 806, fitting: "B22 bayonet",
    pricePence: 907, pack: 1,
    awin: SIMPLY_LED("crompton-lamps-ultra-efficient-led-gls-3-8w-b22-a-class-warm-white-clear-60w-eqv"),
    lastChecked: CHECKED,
  },
  {
    id: "crompton-gls-b22-7w-3pk", name: "Crompton LED GLS B22 7W, warm white opal, pack of 3", brand: "Crompton",
    deciwatts: 70, replaces: { watts: 60, name: "60W traditional bulb" }, lumens: 806, fitting: "B22 bayonet",
    pricePence: 727, pack: 3,
    awin: SIMPLY_LED("3-pack-crompton-gls-led-light-bulbs-b22-7w-60w-eqv-warm-white-opal-bayonet-frosted-opal"),
    lastChecked: CHECKED,
  },
  {
    id: "crompton-gls-b22-7-2w-100w", name: "Crompton LED Ultra-Efficient GLS B22 7.2W, warm white", brand: "Crompton",
    deciwatts: 72, replaces: { watts: 100, name: "100W traditional bulb" }, lumens: 1521, fitting: "B22 bayonet",
    pricePence: 857, pack: 1,
    awin: SIMPLY_LED("crompton-gls-led-light-bulb-ultra-efficient-b22-7-2w-100w-eqv-warm-white-a-class-clear"),
    lastChecked: CHECKED,
  },
  {
    id: "gu10-4w-10pk", name: "LED GU10 Spotlight 4W, warm white, pack of 10", brand: "Simply LED",
    deciwatts: 40, replaces: { watts: 50, name: "50W halogen GU10 spotlight" }, lumens: 400, fitting: "GU10",
    pricePence: 694, pack: 10,
    awin: SIMPLY_LED("10-pack-gu10-led-bulbs-4w-50w-eqv-warm-white-clear-gu10-replacement-38"),
    lastChecked: CHECKED,
  },
  {
    id: "crompton-gu10-1-9w", name: "Crompton LED Ultra-Efficient GU10 Spotlight 1.9W, warm white", brand: "Crompton",
    deciwatts: 19, replaces: { watts: 50, name: "50W halogen GU10 spotlight" }, lumens: 370, fitting: "GU10",
    pricePence: 557, pack: 1,
    awin: SIMPLY_LED("crompton-gu10-spotlight-led-bulb-ultra-efficient-1-9w-50w-eqv-warm-white-a-class-36"),
    lastChecked: CHECKED,
  },
  {
    id: "candle-e14-5w-3pk", name: "LED Candle E14 5W, warm white opal, pack of 3", brand: "Simply LED",
    deciwatts: 50, replaces: { watts: 40, name: "40W traditional candle bulb" }, lumens: 470, fitting: "E14 small screw",
    pricePence: 199, pack: 3,
    awin: SIMPLY_LED("3-pack-candle-led-light-bulbs-e14-5w-40w-eqv-warm-white-opal-frosted"),
    lastChecked: CHECKED,
  },
].map((b) => ({ ...b, category: "lighting", source: b.awin.url }));
