import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApis } from "./mocks";

const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test("widget shows the running cost for the preselected region and appliance", async ({ page }) => {
  await mockApis(page);
  await page.goto("/widget/?r=M&a=dryer");
  await expect(page.getByLabel("Appliance")).toHaveValue("dryer");
  await expect(page.getByLabel("Your region")).toHaveValue("M");
  // 4kWh at the mocked 25.6p standard rate.
  const out = page.getByRole("status");
  await expect(out).toContainText("£1.02");
  await expect(out).toContainText("25.6p per kWh");
  await expect(page.getByRole("link", { name: /Find the cheapest time on your tariff/ }))
    .toHaveAttribute("href", "https://cheapwatts.co.uk/?appliance=dryer&utm_source=widget&utm_medium=embed&utm_campaign=partner");
  await page.getByLabel("Appliance").selectOption("washer");
  await expect(page.getByRole("link", { name: /Find the cheapest time/ })).toHaveAttribute("href", /appliance=washer&/);
  await expect(page.locator("a[href*='amazon']")).toHaveCount(0);
});

test("widget asks for a region when none is given, and ignores a bad one", async ({ page }) => {
  await mockApis(page);
  await page.goto("/widget/?r=Z&a=nope");
  await expect(page.getByLabel("Your region")).toHaveValue("");
  await expect(page.getByLabel("Appliance")).toHaveValue("washer");
  await expect(page.getByRole("status")).toContainText("Choose your region");
});

test("widget fits narrow and wide boxes without scrolling sideways", async ({ page }) => {
  await mockApis(page);
  for (const width of [280, 320, 480, 800]) {
    await page.setViewportSize({ width, height: 460 });
    for (const a of ["washerdryer", "ev"]) {
      await page.goto(`/widget/?r=C&a=${a}`);
      await expect(page.getByRole("status")).toContainText("a run");
      const sideways = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(sideways, `sideways scroll at ${width}px`).toBe(false);
      const fits = await page.evaluate(() => document.querySelector("main").getBoundingClientRect().bottom <= 460);
      expect(fits, `${a} taller than the 460px embed at ${width}px`).toBe(true);
    }
  }
});

test("embed page shows the code, a working preview and the download", async ({ page }) => {
  await mockApis(page);
  await page.goto("/widget-for-your-website/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Add Cheap Watts to your website");
  await expect(page.locator("pre code").first()).toContainText('<iframe src="https://cheapwatts.co.uk/widget/"');
  const preview = page.frameLocator('iframe[title="Cheap Watts: what does it cost to run?"]');
  await expect(preview.getByRole("status")).toContainText("a run");
  const file = await page.request.get("/cheap-watts-widget.html");
  expect(await file.text()).toContain('<iframe src="https://cheapwatts.co.uk/widget/"');
});

for (const path of ["/widget/?r=M", "/widget-for-your-website/"]) {
  test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await mockApis(page);
    await page.goto(path);
    await page.waitForTimeout(500);
    const results = await new AxeBuilder({ page }).withTags(WCAG).analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
    expect(summary, summary.join("\n")).toEqual([]);
  });
}
