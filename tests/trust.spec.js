// What affiliate networks' site checkers and crawlers see: real content on
// every tool page without JavaScript, and the pages reviewers look for.
import { test, expect } from "@playwright/test";
import { mockApis, setUp } from "./mocks";

const TOOL_PATHS = ["/", "/plan-my-evening/", "/gas-or-electric/", "/solar-and-batteries/", "/should-i-switch/"];

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("every tool page has real content and links to the trust pages", async ({ page }) => {
    for (const path of TOOL_PATHS) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.locator("[data-static-fallback]")).toContainText("Jon Russell");
      for (const href of ["/about/", "/contact/", "/privacy/", "/affiliate-disclosure/", "/gifts/", "/blog/", "/cost-to-run/"]) {
        await expect(page.locator(`[data-static-fallback] a[href="${href}"]`).first()).toBeVisible();
      }
    }
  });
});

test("the app replaces the static content when it starts", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  await setUp(page);
  await expect(page.locator("[data-static-fallback]")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Affiliate disclosure" })).toBeVisible();
});

test("about, contact, privacy and affiliate disclosure pages exist and are linked from every static page", async ({ page, request }) => {
  for (const path of ["/about/", "/contact/", "/privacy/", "/affiliate-disclosure/"]) {
    const res = await request.get(path);
    expect(res.status(), path).toBe(200);
  }
  await page.goto("/affiliate-disclosure/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Affiliate disclosure");
  await expect(page.locator("main")).toContainText("Awin");
  await expect(page.locator("main")).toContainText("As an Amazon Associate");
  await page.goto("/gifts/");
  const footer = page.getByRole("navigation", { name: "About this site" });
  for (const name of ["About", "Contact", "Privacy", "Affiliate disclosure"]) await expect(footer.getByRole("link", { name })).toBeVisible();
});
