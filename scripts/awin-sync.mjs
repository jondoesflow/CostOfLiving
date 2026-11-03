// Updates src/awinJoined.js from the Awin API: which of the programmes our
// "Worth a look" picks use have approved Cheap Watts, and whether Awin accepts
// each pick's landing page. Run it after an approval email arrives:
//
//   AWIN_TOKEN=... node scripts/awin-sync.mjs
//
// The token is an Awin account password in all but name, so it only ever comes
// from the environment. Never commit it or put it in the site's code.
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { AWIN_PUBLISHER_ID, ALL_PRODUCTS } from "../src/products.js";
import { GIFT_PRODUCTS } from "../src/giftProducts.js";
import { LED_BULBS } from "../src/lightingProducts.js";

const token = process.env.AWIN_TOKEN;
if (!token) {
  console.error("Set AWIN_TOKEN to your Awin API token (Awin: Account > API Credentials).");
  process.exit(1);
}

const api = async (path, init = {}) => {
  const res = await fetch(`https://api.awin.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...init.headers },
  });
  const body = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, body };
};

const wanted = new Map();
// "Worth a look" picks and the gift guide's products (src/giftProducts.js).
for (const p of [...ALL_PRODUCTS, ...GIFT_PRODUCTS, ...LED_BULBS]) if (p.awin) wanted.set(p.awin.mid, [...(wanted.get(p.awin.mid) ?? []), p]);

const relationship = async (rel) => {
  const { ok, status, body } = await api(`/publishers/${AWIN_PUBLISHER_ID}/programmes?relationship=${rel}`);
  if (!ok) throw new Error(`Awin API returned ${status} for ${rel} programmes: ${JSON.stringify(body)}`);
  return new Set(body.map((p) => p.id));
};
const [joined, pending] = await Promise.all([relationship("joined"), relationship("pending")]);

const usable = [];
for (const [mid, picks] of wanted) {
  const name = picks[0].awin.retailer;
  if (!joined.has(mid)) {
    console.log(`${name} (${mid}): ${pending.has(mid) ? "application pending" : "not joined"}; staying on the fallback link`);
    continue;
  }
  // Ask Awin to build each landing page's link: it refuses pages outside the
  // advertiser's tracked domains, which would otherwise lose the commission.
  let allOk = true;
  for (const p of picks) {
    const { ok, status, body } = await api(`/publishers/${AWIN_PUBLISHER_ID}/linkbuilder/generate`, {
      method: "POST",
      body: JSON.stringify({ advertiserId: mid, destinationUrl: p.awin.url, shorten: false }),
    });
    if (!ok) {
      allOk = false;
      console.log(`${name} (${mid}): Awin rejected ${p.awin.url} for "${p.name}" (${status} ${JSON.stringify(body)})`);
    }
  }
  if (allOk) {
    usable.push(mid);
    console.log(`${name} (${mid}): joined; ${picks.map((p) => p.name).join(", ")} now link through Awin`);
  }
}

usable.sort((a, b) => a - b);
const file = fileURLToPath(new URL("../src/awinJoined.js", import.meta.url));
writeFileSync(file, `// Awin programmes Cheap Watts has been approved for, by advertiser id. Written
// by scripts/awin-sync.mjs from the Awin API; a pick only uses its Awin link
// once its programme is in this list, and falls back to Amazon (or, in the gift
// guide, the retailer's page with no tracking) until then.
export const AWIN_JOINED = [${usable.join(", ")}];
`);
console.log(`Wrote src/awinJoined.js: [${usable.join(", ")}]`);
