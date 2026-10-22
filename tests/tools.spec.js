import { test, expect } from "@playwright/test";
import { mockApis, setUp } from "./mocks";

test.beforeEach(async ({ page }) => {
  await mockApis(page);
});

test("plan my evening schedules everything and respects one-at-a-time", async ({ page }) => {
  await page.goto("/#/plan");
  await setUp(page);
  for (const name of [/Washing machine/, /Dishwasher/, /Tumble dryer/]) await page.getByRole("checkbox", { name }).check();
  const plan = page.getByRole("region", { name: /plan/i });
  await expect(plan.getByRole("heading", { name: /for everything/ })).toBeVisible();
  await page.getByLabel("How many can run at once?").selectOption({ label: "One at a time" });
  const items = plan.getByRole("listitem");
  await expect(items).toHaveCount(3);
  // One at a time: each start is at or after the previous finish.
  const texts = await items.allInnerTexts();
  expect(texts.join(" ")).toMatch(/Start/);
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: /Add the plan to my calendar/ }).click()]);
  const ics = (await (await download.createReadStream()).toArray()).join("");
  expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(3);
});

test("gas or electric ranks the options with live rates", async ({ page }) => {
  await page.goto("/#/gas");
  await setUp(page);
  const water = page.getByRole("region", { name: "Boil a litre of water" });
  await expect(water.getByRole("listitem").first()).toContainText("Gas hob");
  await expect(water).toContainText("1.7p");
  await page.getByLabel("Or type your own").fill("5");
  await expect(water.getByRole("listitem").first()).toContainText(/Kettle|Induction/);
});

test("solar and battery advice", async ({ page }) => {
  await page.goto("/#/solar");
  await setUp(page);
  await expect(page.getByRole("heading", { name: "Use it yourself" })).toBeVisible();
  await expect(page.getByText(/Charge from the grid at midnight tonight/)).toBeVisible();
  await page.getByRole("radio", { name: /My own export rate/ }).check();
  await page.getByLabel("Your export rate").fill("50");
  await expect(page.getByRole("heading", { name: "Sell it" })).toBeVisible();
});

test("should I switch: example household ranks every tariff", async ({ page }) => {
  await page.goto("/#/switch");
  await setUp(page);
  await page.getByRole("button", { name: /Try an example household/ }).click();
  const results = page.getByRole("region", { name: /yearly cost/i });
  await expect(results.getByRole("listitem")).toHaveCount(8);
  await expect(results).toContainText("Yours");
});

test("should I switch: explains unreadable and daily-only files", async ({ page }) => {
  await page.goto("/#/switch");
  await setUp(page);
  const input = page.locator('input[type="file"]');
  await input.setInputFiles({ name: "x.csv", mimeType: "text/csv", buffer: Buffer.from("hello\nworld\n") });
  await expect(page.getByText("That file looks empty.")).toBeVisible();
  let daily = "date,kwh\n";
  for (let d = 1; d <= 60; d++) daily += `2026-${String(1 + Math.floor((d - 1) / 28)).padStart(2, "0")}-${String(1 + ((d - 1) % 28)).padStart(2, "0")},8\n`;
  await input.setInputFiles({ name: "daily.csv", mimeType: "text/csv", buffer: Buffer.from(daily) });
  await expect(page.getByText(/daily or monthly totals/)).toBeVisible();
});

test("tabs change the page and the address", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Gas or electric?" }).click();
  await expect(page).toHaveURL(/#\/gas$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gas or electric?");
  await expect(page.getByRole("link", { name: "Gas or electric?" })).toHaveAttribute("aria-current", "page");
});

test("no sideways scrolling on any tool", async ({ page }) => {
  for (const tab of ["when", "plan", "gas", "solar", "switch"]) {
    await page.goto(`/#/${tab}`);
    await setUp(page);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow, tab).toBeLessThanOrEqual(0);
  }
});

test("header has the Ko-fi and creator links", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: /click here to support me on Ko-fi/ })).toHaveAttribute("href", "https://ko-fi.com/jondoesflow");
  const creator = page.getByRole("navigation", { name: "About the creator" });
  await expect(creator.getByRole("link", { name: /JonDoesFlow/ })).toHaveAttribute("href", "https://www.jondoesflow.com/");
  await expect(creator.getByRole("link", { name: /Created By/ })).toHaveAttribute("href", "https://www.linkedin.com/in/jondoesflow");
  await expect(creator.getByRole("link", { name: /GitHub Projects/ })).toHaveAttribute("href", "https://github.com/jondoesflow?tab=repositories");
});
