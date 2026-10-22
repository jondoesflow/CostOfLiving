import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApis, setUp } from "./mocks";

const TABS = {
  when: async (page) => page.getByRole("radio", { name: /Washing machine/ }).check(),
  plan: async (page) => {
    await page.getByRole("checkbox", { name: /Washing machine/ }).check();
    await page.getByRole("checkbox", { name: /Dishwasher/ }).check();
  },
  gas: async () => {},
  solar: async () => {},
  switch: async (page) => page.getByRole("button", { name: /Try an example household/ }).click(),
};

for (const scheme of ["light", "dark"]) {
  for (const [tab, fill] of Object.entries(TABS)) {
    test(`${tab} has no WCAG 2.2 AA violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await mockApis(page);
      await page.goto(`/#/${tab}`);
      await setUp(page);
      await fill(page);
      await page.waitForTimeout(500);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.help} — ${v.nodes.length} node(s): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
}

test("dark mode follows the system and can be switched by hand", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await mockApis(page);
  await page.goto("/");
  const bg = () => page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  const darkBg = await bg();
  expect(darkBg).not.toBe("rgb(248, 247, 244)");
  await page.getByLabel("Theme").selectOption("light");
  expect(await bg()).toBe("rgb(248, 247, 244)");
  await page.reload();
  expect(await bg()).toBe("rgb(248, 247, 244)");
  await page.getByLabel("Theme").selectOption("dark");
  expect(await bg()).toBe("rgb(15, 20, 28)");
});

test("keyboard users can skip to content and reach everything", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: /Skip to/ });
  await expect(skip).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
  // Appliance choices work with the keyboard alone.
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).focus();
  await page.keyboard.press("Space");
  await expect(page.getByRole("radio", { name: /Washing machine/ })).toBeChecked();
});

test("results are announced to screen readers", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await setUp(page);
  await page.getByRole("radio", { name: /Washing machine/ }).check();
  const live = page.locator('[aria-live="polite"]');
  await expect(live.first()).toContainText(/Start at midnight tonight/);
});

test("page language and landmarks are set", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
  await expect(page.getByRole("banner")).toHaveCount(1);
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("navigation", { name: "Tools" })).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toHaveCount(1);
});
