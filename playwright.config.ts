import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for Milestone 4 Hardening browser smoke tests.
 * Targets the locally running Netlify dev server at http://localhost:8888.
 */
export default defineConfig({
  testDir: "./tests/smoke",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ["list"],
    ["json", { outputFile: "reports/canonical-product-database/milestones/playwright-smoke-results.json" }],
  ],
  use: {
    baseURL: process.env.BASE_URL || "http://localhost:8888",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // Dev access code header injected for all requests to admin pages
    extraHTTPHeaders: {
      "X-Access-Code": process.env.DEV_ACCESS_CODE || "070315",
    },
  },
  timeout: 30000,
  expect: { timeout: 8000 },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Do NOT start a webServer — assumes `npm run dev` is already running
});
