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
  await expect(result).toContainText(/Cost then\s*9\.6p/);
  await expect(result).toContainText(/If you start it now\s*16p/);
  await expect(result).toContainText("Greenest time: 2am tomorrow");
  await expect(result).toContainText("start in 4h 50m");
});

test("finish-by deadline moves the start earlier", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Dishwasher/ }).check();
  await expect(page.getByRole("heading", { name: "Start at midnight tonight" })).toBeVisible();
  await page.getByLabel("Needs to be finished by").selectOption({ label: "11pm tonight" });
  await expect(page.getByRole("heading", { name: "Start it now" })).toBeVisible();
});

test("car charging goes into the cheapest half hours", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Electric car/ }).check();
  const result = page.getByRole("region", { name: /result/i });
  await expect(result.getByRole("heading", { name: "Start charging at midnight tonight" })).toBeVisible();
  // 30kWh at 12p overnight, against starting at 7:10pm on 20p.
  await expect(result).toContainText(/Cost then\s*£3\.60/);
  await expect(result).toContainText(/If you charge straight away\s*£6\.00/);
  await expect(result.getByRole("listitem").filter({ hasText: "midnight tonight to 4:30am" })).toContainText("30kWh, £3.60");
  await expect(result).not.toContainText("Tomorrow's prices aren't out yet");
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
  const result = page.getByRole("region", { name: "Result" });
  await expect(result).toContainText("Each run costs about 26p");
  await expect(result).toContainText("Greenest time: 2am tomorrow");
});

test("EDF and E.ON Next tariffs use the newest product version", async ({ page }) => {
  await setUp(page, { supplier: "edf", tariff: /^GoElectric/ });
  await page.getByRole("radio", { name: /Dishwasher/ }).check();
  await expect(page.getByRole("heading", { name: "Start at 11pm tonight" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Result" })).toContainText(/Cost then\s*6\.7p/);
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
  expect(href).toMatch(/^webcal:\/\/.*\/calendar\.ics\?t=agile&k=0\.8&m=120&n=Washing\+machine&r=M&a=washer$/);
});

test("smart home link and guide", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  await page.getByRole("button", { name: "Smart home link" }).click();
  await expect(page.getByLabel("Smart home link")).toHaveValue(/^https?:\/\/[^/]+\/api\/best-time\?t=agile&k=0\.8&m=120&r=M&a=washer$/);
  await page.getByRole("link", { name: "See how to set it up" }).click();
  await expect(page).toHaveURL(/\/smart-home\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Home Assistant/);
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

test("new appliances: heated airer, electric blanket and electric shower", async ({ page }) => {
  await setUp(page);
  const result = page.getByRole("region", { name: "Result" });
  await page.getByRole("radio", { name: /Heated airer/ }).check();
  await expect(result.getByRole("heading", { name: "Start at midnight tonight" })).toBeVisible();
  await expect(result).toContainText(/Cost then\s*14p/); // 1.2kWh at 12p
  await page.getByRole("radio", { name: /Electric blanket/ }).check();
  await expect(result).toContainText(/Cost then\s*1\.2p/); // 0.1kWh at 12p
  await page.getByRole("radio", { name: /Electric shower/ }).check();
  await expect(result).toContainText(/Cost then\s*15p/); // 1.27kWh at 12p
  await expect(result).not.toContainText("Using a delay timer?");
  const [download] = await Promise.all([page.waitForEvent("download"), page.getByRole("button", { name: "Add to calendar" }).click()]);
  const ics = (await (await download.createReadStream()).toArray()).join("");
  expect(ics).toContain("SUMMARY:Time for your shower");
});

test("appliances are grouped under headings", async ({ page }) => {
  for (const group of ["Laundry", "Kitchen", "Heating and hot water", "Charging"]) {
    await expect(page.getByRole("group", { name: group })).toBeVisible();
  }
  await expect(page.getByRole("group", { name: "Charging" }).getByRole("radio")).toHaveCount(4);
});

test("share button copies a tagged link with the result", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.addInitScript(() => { delete Navigator.prototype.share; }); // use the copy fallback
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  const result = page.getByRole("region", { name: "Result" });
  await result.getByRole("button", { name: "Share this" }).click();
  await expect(result.getByRole("status")).toContainText("Copied");
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain("Running my washing machine at midnight tonight instead of now saves 6.4p, about £13.31 a year.");
  expect(copied).toContain("https://cheapwatts.co.uk/?utm_source=share&utm_medium=result&utm_campaign=when");
  await expect(result.getByRole("button", { name: "Share this" })).toHaveAttribute("data-umami-event", "share-result");
});

test.describe("before tomorrow's Agile prices are out", () => {
  // 1pm, so prices only run to 11pm tonight.
  const morning = new Date("2026-10-23T12:00:00Z");

  test("says so up front, and doesn't pass off a time next to the peak as the best", async ({ page }) => {
    await mockApis(page, { now: morning });
    await page.goto("/");
    await setUp(page);
    await page.getByRole("radio", { name: /Washing machine/ }).check();
    const result = page.getByRole("region", { name: /result/i });
    await expect(result).toContainText("Tomorrow's prices aren't out yet");
    await expect(result).toContainText("prices up to 11pm tonight. Octopus publishes the next day's prices around 4pm");
    await expect(result.getByRole("heading", { name: "Cheapest so far: 7pm tonight" })).toBeVisible();
    await expect(result).toContainText("just after the 4pm to 7pm peak");
    await expect(result).not.toContainText("Using a delay timer?");
  });

  test("a time clear of the peak is still shown as the cheapest", async ({ page }) => {
    await mockApis(page, { now: morning, patterns: { agile: (h) => (h < 5 ? 12 : h < 16 ? 25 : h < 19 ? 40 : h < 20 ? 30 : 15) } });
    await page.goto("/");
    await setUp(page);
    await page.getByRole("radio", { name: /Washing machine/ }).check();
    const result = page.getByRole("region", { name: /result/i });
    await expect(result).toContainText("Tomorrow's prices aren't out yet");
    await expect(result.getByRole("heading", { name: "Start at 8pm tonight" })).toBeVisible();
  });

  test("car charging uses the cheap slots it can see and leaves the rest", async ({ page }) => {
    // Cheap from 10:30pm, the last half hour with a price.
    await mockApis(page, { now: morning, patterns: { agile: (h) => (h < 5 ? 12 : h < 16 ? 25 : h < 19 ? 40 : h < 22.5 ? 20 : 10) } });
    await page.goto("/");
    await setUp(page);
    await page.getByRole("radio", { name: /Electric car/ }).check();
    const result = page.getByRole("region", { name: /result/i });
    await expect(result).toContainText("Tomorrow's prices aren't out yet");
    await expect(result.getByRole("heading", { name: "Start charging at 10:30pm tonight" })).toBeVisible();
    await expect(result).toContainText("That covers 3.3kWh of the 30kWh. Leave the other 26.7kWh until tomorrow's prices are out");
  });
});

test("ready when I'm up: the heating stays in the cheap hours and it finishes near wake-up", async ({ page }) => {
  // Cheap rate 2am to 5am only, as in the feedback that prompted this.
  await page.getByLabel("Who supplies your electricity?").selectOption("britishgas");
  await page.getByLabel("Cheap rate starts").fill("02:00");
  await page.getByLabel("Cheap rate ends").fill("05:00");
  await page.getByRole("spinbutton", { name: /^Normal rate/ }).fill("28");
  await page.getByRole("spinbutton", { name: /^Cheap rate/ }).fill("7");
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  await expect(page.getByText("Most of the electricity goes on heating the water at the start")).toBeVisible();
  const result = page.getByRole("region", { name: /result/i });
  await expect(result.getByRole("heading", { name: "Start at 2am tomorrow" })).toBeVisible();
  await expect(result).toContainText(/Cost then\s*5\.6p/);

  await page.getByLabel("I'll be up at").selectOption({ label: "7am tomorrow" });
  await expect(page.getByLabel("It can wait up to")).toHaveValue("60");
  // Starting at 4am heats the water before 5am and finishes at 6am.
  await expect(result.getByRole("heading", { name: "Start at 4am tomorrow" })).toBeVisible();
  await expect(result).toContainText("Ready around 6am tomorrow");
  await expect(result).toContainText(/Cost then\s*7\.7p/);
  await expect(result).toContainText("That's 2.1p more than the cheapest time, which finishes at 4am tomorrow");

  await page.getByLabel("It can wait up to").selectOption({ label: "3 hours" });
  await expect(result.getByRole("heading", { name: "Start at 2am tomorrow" })).toBeVisible();
  await expect(result).not.toContainText("more than the cheapest time");
});

test("worth a look: affiliate picks match the appliance and are labelled", async ({ page }) => {
  await setUp(page);
  await page.getByRole("radio", { name: /Tumble dryer/ }).check();
  const box = page.getByRole("region", { name: "Worth a look" });
  await expect(box).toBeVisible();
  const links = box.getByRole("link");
  await expect(links).toHaveCount(3);
  await expect(links.nth(0)).toHaveText(/Heat pump tumble dryer/);
  await expect(links.nth(1)).toHaveText(/Smart plug with a timer/); // Agile has cheap hours
  for (const link of await links.all()) {
    expect(await link.getAttribute("href")).toMatch(/^https:\/\/www\.amazon\.co\.uk\/s\?k=.*&tag=cheapwatts-21$/);
    expect(await link.getAttribute("rel")).toContain("sponsored");
  }
  await expect(box).toContainText("Affiliate links");
  await expect(page.getByRole("contentinfo")).toContainText("Amazon Associate");
  // The electric car gets no picks.
  await page.getByRole("radio", { name: /Electric car/ }).check();
  await expect(page.getByRole("region", { name: "Worth a look" })).toHaveCount(0);
});
