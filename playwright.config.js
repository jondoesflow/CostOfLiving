import { defineConfig, devices } from "@playwright/test";

// Fonts and the Tailwind CDN load through the session proxy when one is set;
// every API call is mocked in tests/mocks.js.
const proxy = process.env.HTTPS_PROXY ? ["--proxy-server=https=" + process.env.HTTPS_PROXY.replace(/^https?:\/\//, ""), "--proxy-bypass-list=<-loopback>"] : [];

export default defineConfig({
  testDir: "tests",
  timeout: 45000,
  expect: { timeout: 10000 },
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    locale: "en-GB",
    timezoneId: "Europe/London",
    launchOptions: { args: proxy },
    acceptDownloads: true,
  },
  projects: [
    { name: "phone", use: { ...devices["Pixel 7"], browserName: "chromium" } },
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "BLOG_DRAFTS=1 npm run build && npx vite preview --port 4173 --strictPort",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120000,
  },
});
