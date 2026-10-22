import { test, expect } from "@playwright/test";

// Optional smoke test against the real APIs: LIVE=1 npx playwright test live
test.skip(!process.env.LIVE, "set LIVE=1 to run against real price data");

test("real prices load for every live tariff", async ({ page }) => {
  test.setTimeout(180000);
  await page.goto("/");
  for (const [supplier, tariffs] of [["octopus", [/^Agile Octopus/, /^Octopus Go/, /^Cosy Octopus/]], ["edf", [/^FreePhase Dynamic/, /^GoElectric/]], ["eon", [/^Next Drive Cheap/, /^Next Drive Smart/]]]) {
    await page.getByLabel("Who supplies your electricity?").selectOption(supplier);
    await page.getByLabel("Region").selectOption("M");
    for (const t of tariffs) {
      await page.getByRole("radio", { name: t }).check();
      await page.getByRole("radio", { name: /Washing machine/ }).check();
      await expect(page.getByRole("region", { name: "Result" })).toContainText(/Cost then|Any time costs the same/, { timeout: 20000 });
    }
  }
});
