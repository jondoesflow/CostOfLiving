import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("the offers page lists live offers with codes, end dates and affiliate links", async ({ page }) => {
  await page.goto("/offers/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Current offers on energy-saving kit");
  await expect(page.locator(".disclosure")).toContainText("Affiliate links");
  const live = page.locator("[data-offer-ends]:not([hidden])");
  expect(await live.count()).toBeGreaterThan(0);
  for (const a of await live.locator("a").all()) {
    expect((await a.getAttribute("rel")).split(" ")).toEqual(expect.arrayContaining(["sponsored", "nofollow", "noopener"]));
    await expect(a).toHaveAttribute("href", /^https:\/\/www\.awin1\.com\/cread\.php\?awinmid=\d+&awinaffid=3143222&clickref=offer-offers&ued=/);
  }
  await expect(live.first()).toContainText("Ends ");
});

test("an offer past its end date is hidden, and the empty message shows when none are left", async ({ page }) => {
  await page.clock.install({ time: new Date("2031-01-01T00:00:00Z") });
  await page.goto("/offers/");
  await expect(page.locator("[data-offer-ends]:not([hidden])")).toHaveCount(0);
  await expect(page.locator("[data-offers]")).toBeHidden();
  await expect(page.getByText("There are no offers running at the moment.")).toBeVisible();
});

test("an offer that hasn't started yet stays hidden until its start", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-08T12:00:00Z") });
  await page.goto("/offers/");
  await expect(page.locator('[data-offer-ends="2026-11-15T23:59:00Z"]')).toBeHidden();
});

test("offers appear on the pages they're for", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-11-10T12:00:00Z") });
  await page.goto("/cost-to-run/lights/");
  await expect(page.locator(".offers")).toContainText("BULBS10");
  await page.goto("/gifts/air-fryers-slow-cookers/");
  await expect(page.locator(".offers")).toContainText("AIRFRYER");
  await page.goto("/cost-to-run/washer/");
  await expect(page.locator(".offers")).toHaveCount(0);
  await expect(page.locator('footer a[href="/offers/"]')).toHaveCount(1);
});

for (const scheme of ["light", "dark"]) {
  test(`/offers/ has no WCAG 2.2 AA violations (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto("/offers/");
    const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
}
