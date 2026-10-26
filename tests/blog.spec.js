import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApis, setUp } from "./mocks";

// The test server builds with BLOG_DRAFTS=1, so draft posts are included here.
const POST = "/blog/cheapest-time-to-use-electricity-uk/";

test("blog index lists posts and links to them", async ({ page }) => {
  await page.goto("/blog/");
  await expect(page).toHaveTitle(/Cheap Watts blog/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Cheap Watts blog");
  await page.getByRole("link", { name: "What's the cheapest time to use electricity in the UK?" }).click();
  await expect(page).toHaveURL(new RegExp(`${POST}$`));
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("What's the cheapest time to use electricity in the UK?");
});

test("blog post has search metadata and structured data", async ({ page }) => {
  await page.goto(POST);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `https://cheapwatts.co.uk${POST}`);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /depends|tariff/i);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const types = ld.flatMap((t) => [].concat(JSON.parse(t)).map((d) => d["@type"]));
  expect(types).toEqual(expect.arrayContaining(["BlogPosting", "BreadcrumbList"]));
  // Internal links to the tools, for readers and for search engines.
  await expect(page.getByRole("link", { name: "Open Cheap Watts" })).toHaveAttribute("href", "/");
  await expect(page.getByRole("region", { name: "More from the blog" }).getByRole("listitem").first()).toBeVisible();
});

test("each tool has its own address, title and description", async ({ page }) => {
  await mockApis(page);
  await page.goto("/gas-or-electric/");
  await expect(page).toHaveTitle(/^Gas or electric\?/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gas or electric?");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://cheapwatts.co.uk/gas-or-electric/");
  // Switching tools changes the address without a reload, and Back works.
  await page.getByRole("navigation", { name: "Tools" }).getByRole("link", { name: "Plan my evening" }).click();
  await expect(page).toHaveURL(/\/plan-my-evening\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Plan my evening");
  await page.goBack();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gas or electric?");
  // Old #/ links still open the right tool.
  await page.goto("/#/solar");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Solar panels and batteries");
});

test("sitemap and robots point search engines at every page", async ({ request }) => {
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const path of ["/", "/plan-my-evening/", "/gas-or-electric/", "/solar-and-batteries/", "/should-i-switch/", "/blog/", POST]) {
    expect(sitemap).toContain(`<loc>https://cheapwatts.co.uk${path}</loc>`);
  }
  expect(await (await request.get("/robots.txt")).text()).toContain("Sitemap: https://cheapwatts.co.uk/sitemap.xml");
  expect(await (await request.get("/blog/feed.xml")).text()).toContain("<rss");
});

for (const scheme of ["light", "dark"]) {
  for (const path of ["/blog/", POST, "/smart-home/", "/cost-to-run/", "/cost-to-run/dryer/"]) {
    test(`${path} has no WCAG 2.2 AA violations (${scheme})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      const summary = results.violations.map((v) => `${v.id}: ${v.help} — ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
      expect(summary, summary.join("\n")).toEqual([]);
    });
  }
}

test("Blog link sits in the header, to the left of the theme selector", async ({ page }) => {
  await mockApis(page);
  await page.goto("/");
  const blog = page.getByRole("banner").getByRole("link", { name: "Blog" });
  const theme = page.getByLabel("Theme");
  await expect(blog).toHaveAttribute("href", "/blog/");
  await expect(page.getByRole("navigation", { name: "Tools" }).getByRole("link", { name: "Blog" })).toHaveCount(0);
  const [b, t] = [await blog.boundingBox(), await theme.boundingBox()];
  expect(b.x + b.width).toBeLessThanOrEqual(t.x);
  expect(Math.abs(b.y + b.height / 2 - (t.y + t.height / 2))).toBeLessThan(12); // same row
  await blog.click();
  await expect(page).toHaveURL(/\/blog\/$/);
});

test("running cost pages: static figures, live cost for the region, and a link into the tool", async ({ page }) => {
  await mockApis(page);
  await page.goto("/cost-to-run/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("How much does it cost to run?");
  await page.getByRole("link", { name: "How much does a tumble dryer cost to run?" }).click();
  await expect(page).toHaveURL(/\/cost-to-run\/dryer\/$/);
  await expect(page.getByText(/a run on a standard tariff/)).toBeVisible();
  // Live figures for the region: 4kWh at the mocked 25.6p standard rate, and Agile's 12p overnight.
  await page.getByLabel("Your region").selectOption("M");
  const live = page.getByRole("region", { name: "Today's cost where you live" });
  await expect(live).toContainText("On a standard tariff in Yorkshire today (25.6p per kWh)");
  await expect(live).toContainText("£1.02 a run");
  await expect(live).toContainText(/cheapest time today: midnight tonight\s*48p/);
  await page.getByRole("link", { name: /Find the cheapest time to run your tumble dryer/ }).click();
  await expect(page).toHaveURL(/\/\?appliance=dryer$/);
  await expect(page.getByRole("radio", { name: /Tumble dryer/ })).toBeChecked();
  await setUp(page);
  await expect(page.getByRole("heading", { name: "Start at midnight tonight" })).toBeVisible();
});
