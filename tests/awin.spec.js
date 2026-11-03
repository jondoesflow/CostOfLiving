import { test, expect } from "@playwright/test";
import { productLink, awinUrl, ALL_PRODUCTS, AWIN_PUBLISHER_ID } from "../src/products.js";
import { AWIN_JOINED } from "../src/awinJoined.js";

const byId = (id) => ALL_PRODUCTS.find((p) => p.id === id);

test("a pick stays on Amazon until its Awin programme has approved us", () => {
  const airer = byId("airer");
  expect(productLink(airer, []).href).toMatch(/^https:\/\/www\.amazon\.co\.uk\/s\?k=.*&tag=cheapwatts-21$/);
  expect(productLink(airer, []).retailer).toBe("Amazon");
  const joined = productLink(airer, [airer.awin.mid]);
  expect(joined.retailer).toBe("Lakeland");
  expect(joined.href).toBe(
    `https://www.awin1.com/cread.php?awinmid=1751&awinaffid=${AWIN_PUBLISHER_ID}&ued=${encodeURIComponent("https://www.lakeland.co.uk/search?q=heated+airer")}`,
  );
  // Picks without an Awin programme always use Amazon.
  expect(productLink(byId("monitor-plug"), [1751]).retailer).toBe("Amazon");
});

test("Awin landing pages are https retailer pages, and the joined list only names programmes we use", () => {
  const mids = new Set();
  for (const p of ALL_PRODUCTS.filter((x) => x.awin)) {
    expect(p.awin.url).toMatch(/^https:\/\//);
    expect(Number.isInteger(p.awin.mid)).toBe(true);
    expect(p.awin.retailer).toBeTruthy();
    mids.add(p.awin.mid);
  }
  for (const mid of AWIN_JOINED) expect(mids.has(mid)).toBe(true);
  expect(awinUrl(1, "https://x.test/?a=1&b=2")).toContain("ued=https%3A%2F%2Fx.test%2F%3Fa%3D1%26b%3D2");
});
