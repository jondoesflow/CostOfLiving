import { test } from "@playwright/test";
import { mockApis, setUp } from "./mocks";

// Screenshots for the promo video (cheapwatts-movie). Run with:
//   CAPTURE=1 npx playwright test capture-video --project=phone
// Prices are set so a washing machine costs 31p now and 13p overnight, the
// same gap seen on real Yorkshire Agile prices on 22 October 2026.
test.skip(!process.env.CAPTURE, "only when capturing video screenshots");
test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1080 / 390 });

const OUT = "cheapwatts-movie/public/shots";
const agile = (h) => (h < 5 ? 16.25 : h < 16 ? 28 : h < 21 ? 38.75 : 30);

test("capture", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
  await mockApis(page, { patterns: { agile } });
  const shot = async (name, locator) => { await page.waitForTimeout(400); await locator.screenshot({ path: `${OUT}/${name}.png`, animations: "disabled" }); };

  await page.goto("/");
  await page.screenshot({ path: `${OUT}/hero.png`, clip: { x: 0, y: 0, width: 390, height: 520 } });
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  await shot("grid", page.getByRole("region", { name: /What do you want to run/ }));
  await shot("result", page.getByRole("region", { name: "Result" }));

  await page.goto("/#/plan");
  for (const name of [/Washing machine/, /Dishwasher/, /Electric car/]) await page.getByRole("checkbox", { name }).check();
  await page.getByLabel("How many can run at once?").selectOption({ label: "One at a time" });
  await shot("plan", page.getByRole("region", { name: "Your plan" }));

  await page.goto("/#/gas");
  await shot("gas-water", page.getByRole("region", { name: "Boil a litre of water" }));
  await shot("gas-warm", page.getByRole("region", { name: "Keep warm for an hour" }));

  await page.goto("/#/solar");
  await shot("solar", page.getByRole("region", { name: "Solar power right now" }));

  await page.goto("/#/switch");
  await page.getByRole("button", { name: /Try an example household/ }).click();
  await shot("switch", page.getByRole("region", { name: "Estimated yearly cost" }));
});
