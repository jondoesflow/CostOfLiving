import { test, expect } from "@playwright/test";
import { mockApis, setUp } from "./mocks";

test.beforeEach(async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
});

test("finds the cheapest and greenest time on Agile", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  const result = page.getByRole("region", { name: /result/i });
  await expect(result.getByRole("heading", { name: "Start at midnight tonight" })).toBeVisible();
  await expect(result).toContainText("Cost then 9.6p");
  await expect(result).toContainText("If you start it now 16p");
  await expect(result).toContainText("Greenest time: 2am tomorrow");
  await expect(result).toContainText("start in 4h 50m");
});

test("finish-by deadline moves the start earlier or reports no time", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Electric car/ }).check();
  await page.getByLabel("Needs to be finished by").selectOption({ label: "midnight tonight" });
  await expect(page.getByText("There isn't enough time to finish by then")).toBeVisible();
});

test("postcode lookup finds the region, and a bad postcode explains itself", async ({ page }) => {
  await page.getByLabel("Who supplies your electricity?").selectOption("octopus");
  await page.getByLabel("Or find it by postcode").fill("LS1 4AP");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.getByText("Found it: Yorkshire.")).toBeVisible();
  await expect(page.getByLabel("Region")).toHaveValue("M");
  await page.getByLabel("Or find it by postcode").fill("XX1 1XX");
  await page.getByRole("button", { name: "Find" }).click();
  await expect(page.getByText("We couldn't find that postcode")).toBeVisible();
});

test("standard tariff says any time costs the same and offers the greenest time", async ({ page }) => {
  await setUp(page, { tariff: /^Standard or fixed/ });
  await page.getByRole("radio", { name: /Dishwasher/ }).check();
  await expect(page.getByRole("heading", { name: "Any time costs the same" })).toBeVisible();
  await expect(page.getByText(/Each run costs about 26p/)).toBeVisible();
  await expect(page.getByText(/Greenest time: 2am tomorrow/)).toBeVisible();
});

test("EDF and E.ON Next tariffs use the newest product version", async ({ page }) => {
  await setUp(page, { supplier: "edf", tariff: /^GoElectric/ });
  await page.getByRole("radio", { name: /Dishwasher/ }).check();
  await expect(page.getByRole("heading", { name: "Start at 11pm tonight" })).toBeVisible();
  await expect(page.getByText("Cost then 6.7p")).toBeVisible();
  await page.getByLabel("Who supplies your electricity?").selectOption("eon");
  await page.getByRole("radio", { name: /^Next Drive Smart/ }).check();
  await expect(page.getByRole("heading", { name: "Start at midnight tonight" })).toBeVisible();
});

test("suppliers without live prices get the off-peak option", async ({ page }) => {
  await page.getByLabel("Who supplies your electricity?").selectOption("britishgas");
  await expect(page.getByText("We can't get live prices from British Gas yet")).toBeVisible();
  await expect(page.getByRole("radio", { name: /Economy 7/ })).toBeChecked();
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  await expect(page.getByRole("heading", { name: "Start at 12:30am tomorrow" })).toBeVisible();
});

test("calendar file and feed link carry the right details", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Add to calendar" }).click()]);
  const ics = (await (await download.createReadStream()).toArray()).join("");
  expect(ics).toContain("DTSTART:20261022T230000Z");
  expect(ics).toContain("SUMMARY:Start the washing machine");
  expect(ics).toContain("BEGIN:VALARM");
  const href = await page.getByRole("link", { name: /Subscribe/ }).getAttribute("href");
  expect(href).toMatch(/^webcal:\/\/.*\/calendar\.ics\?t=agile&k=0\.8&m=120&n=Washing\+machine&r=M$/);
});

test("price failures show a helpful message", async ({ page }) => {
  await page.unrouteAll();
  await mockApis(page, { failKraken: true });
  await page.reload();
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  await expect(page.getByText("We couldn't get your supplier's prices just now")).toBeVisible();
});

test("settings are remembered after a reload", async ({ page }) => {
  await setUp(page, { supplier: "edf", tariff: /^GoElectric/ });
  await page.reload();
  await expect(page.getByLabel("Who supplies your electricity?")).toHaveValue("edf");
  await expect(page.getByRole("radio", { name: /^GoElectric/ })).toBeChecked();
  await expect(page.getByLabel("Region")).toHaveValue("M");
});
