import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { GIFT_CATEGORIES, publishedGifts } from "../src/giftProducts.js";

const PAGES = ["/gifts/", ...GIFT_CATEGORIES.map((c) => `/gifts/${c.id}/`)];

const ldOf = async (page) => (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t));

test("every gift page has its own title and description, and the disclosure comes before any product link", async ({ page }) => {
  const titles = new Set();
  const descriptions = new Set();
  for (const path of PAGES) {
    await page.goto(path);
    titles.add(await page.title());
    descriptions.add(await page.locator('meta[name="description"]').getAttribute("content"));
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://cheapwatts.co.uk${path}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
    const disclosure = page.locator(".disclosure");
    await expect(disclosure).toContainText("Affiliate links");
    // The disclosure sits above the first link that goes to a shop.
    const order = await page.evaluate(() => {
      const d = document.querySelector(".disclosure");
      const first = document.querySelector('a[rel~="sponsored"]');
      // The hub links to the category pages, not to shops.
      return !first || !!(d.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order, path).toBe(true);
  }
  expect(titles.size).toBe(PAGES.length);
  expect(descriptions.size).toBe(PAGES.length);
});

test("every shop link is sponsored, nofollow and opens in a new tab", async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const links = page.locator(".gift a, .worth a");
    if (path !== "/gifts/") expect(await links.count()).toBeGreaterThan(0);
    for (const a of await links.all()) {
      const rel = (await a.getAttribute("rel")).split(" ");
      expect(rel).toEqual(expect.arrayContaining(["sponsored", "nofollow", "noopener"]));
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toContainText("opens in a new tab");
      // While no programme has approved us, links are placeholders: the
      // retailer's own page or Amazon, never a half-built Awin link.
      const href = await a.getAttribute("href");
      if (href.includes("awin1.com")) expect(href).toMatch(/clickref=gifts-[a-z0-9-]+&ued=/);
    }
  }
});

test("category pages list their products with running costs and ItemList markup", async ({ page }) => {
  for (const c of GIFT_CATEGORIES) {
    await page.goto(`/gifts/${c.id}/`);
    const products = publishedGifts(c.id);
    await expect(page.locator(".gift")).toHaveCount(products.length);
    for (const p of products.filter((x) => x.watts > 0)) {
      const card = page.locator(`#${p.id}`);
      await expect(card).toContainText("Per hour");
      await expect(card).toContainText("Per winter");
    }
    await expect(page.locator(".cap-note")).toContainText("26.32p per kWh");
    await expect(page.locator(".cap-note a")).toHaveAttribute("href", /ofgem\.gov\.uk/);
    await expect(page.locator(".compare h3", { hasText: "Assumptions" })).toBeVisible();
    const ld = await ldOf(page);
    const list = ld.find((x) => x["@type"] === "ItemList");
    expect(list.itemListElement).toHaveLength(products.length);
    for (const item of list.itemListElement.filter((i) => i.item)) {
      expect(item.item["@type"]).toBe("Product");
      expect(item.item.offers.priceCurrency).toBe("GBP");
      expect(item.item.offers.price).toMatch(/^\d+\.\d{2}$/);
    }
    expect(ld.find((x) => x["@type"] === "BreadcrumbList").itemListElement).toHaveLength(3);
  }
});

test("the heated throw page shows the worked figures", async ({ page }) => {
  await page.goto("/gifts/heated-throws-electric-blankets/");
  const card = page.locator("#dimplex-cosy-heated-throw-grey");
  await expect(card).toContainText("£49.99 at Dimplex, checked 3 November 2026");
  await expect(card.locator("dd").nth(2)).toHaveText("4p");
  await expect(card).toContainText("59p for 2 hours an evening");
  await expect(card).toContainText("£15.33 over 26 weeks");
  const throwRow = page.locator(".compare tbody tr").first();
  await expect(throwRow).toContainText("8p");
  await expect(throwRow).toContainText("£15.33");
});

test("the calculator works out per hour, week and winter as you type", async ({ page }) => {
  await page.goto("/gifts/");
  const out = page.locator("[data-out]");
  await expect(out).toContainText("4p"); // the 160W throw, before any typing
  await page.getByLabel("Watts").fill("2000");
  await page.getByLabel("Hours a day").fill("1");
  await expect(out.locator(".live-row").nth(0)).toContainText("53p");
  await expect(out.locator(".live-row").nth(1)).toContainText("£3.68");
  await expect(out.locator(".live-row").nth(2)).toContainText("£95.80");
  await expect(page.getByLabel("Start from")).toHaveValue("");
  await page.getByLabel("Watts").fill("");
  await expect(out).toContainText("Enter a power");
  await page.getByLabel("Start from").selectOption({ label: "Dimplex Heated Electric Under Blanket, King (95W)" });
  await expect(page.getByLabel("Watts")).toHaveValue("95");
  await expect(out.locator(".live-row").nth(2)).toContainText("£2.28");
});

test("the hub lists every published gift and links to each category", async ({ page }) => {
  await page.goto("/gifts/");
  await expect(page.locator(".table-scroll tbody tr")).toHaveCount(publishedGifts().length);
  for (const c of GIFT_CATEGORIES) await expect(page.locator(`.gift-cats a[href="/gifts/${c.id}/"]`)).toBeVisible();
  const ld = await ldOf(page);
  expect(ld.find((x) => x["@type"] === "CollectionPage").mainEntity.itemListElement).toHaveLength(GIFT_CATEGORIES.length);
});

test("the gift pages are in the sitemap and linked from busy pages", async ({ page, request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of PAGES) expect(sitemap).toContain(`<loc>https://cheapwatts.co.uk${path}</loc>`);
  await page.goto("/cost-to-run/heater/");
  await expect(page.locator(".gift-nudge a")).toHaveAttribute("href", "/gifts/heated-throws-electric-blankets/");
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gifts" })).toHaveAttribute("href", "/gifts/");
  await page.goto("/blog/draught-proofing-on-a-budget-uk/");
  await expect(page.locator(".gift-nudge a")).toHaveAttribute("href", "/gifts/draught-proofing/");
  await page.goto("/cost-to-run/washer/");
  await expect(page.locator(".gift-nudge")).toHaveCount(0);
});

for (const scheme of ["light", "dark"]) {
  for (const path of PAGES) {
    test(`${path} has no WCAG 2.2 AA violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
}
