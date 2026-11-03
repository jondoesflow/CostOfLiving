import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { LED_BULBS } from "../src/lightingProducts.js";

test("the lights page answers the question with worked figures and labelled links", async ({ page }) => {
  await page.goto("/cost-to-run/lights/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How much does it cost to leave a light on?");
  await expect(page.locator(".lede")).toContainText("£28.82 a year");
  await expect(page.locator(".lede")).toContainText("£3.36 a year");
  await expect(page.locator(".cap-note")).toContainText("26.32p per kWh");
  await expect(page.locator(".gift")).toHaveCount(LED_BULBS.length);
  const disclosure = await page.evaluate(() => {
    const d = document.querySelector(".disclosure");
    const first = document.querySelector('a[rel~="sponsored"]');
    return !!(d.compareDocumentPosition(first) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(disclosure).toBe(true);
  for (const a of await page.locator(".gift a").all()) {
    await expect(a).toHaveAttribute("rel", "sponsored nofollow noopener noreferrer");
    await expect(a).toHaveAttribute("href", /^https:\/\/www\.awin1\.com\/cread\.php\?awinmid=5190&awinaffid=3143222&clickref=cost-to-run-lights&ued=https%3A%2F%2Fwww\.simplyled\.co\.uk%2F/);
  }
  const types = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)["@type"]);
  expect(types).toEqual(expect.arrayContaining(["FAQPage", "ItemList", "BreadcrumbList"]));
});

test("the lights page is linked from the running costs index and in the sitemap", async ({ page, request }) => {
  await page.goto("/cost-to-run/");
  await expect(page.locator('a[href="/cost-to-run/lights/"]')).toBeVisible();
  expect(await (await request.get("/sitemap.xml")).text()).toContain("<loc>https://cheapwatts.co.uk/cost-to-run/lights/</loc>");
});

for (const scheme of ["light", "dark"]) {
  test(`the lights page has no WCAG 2.2 AA violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/cost-to-run/lights/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
