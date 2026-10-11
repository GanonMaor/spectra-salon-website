/**
 * Smoke tests for the /investors/2026-external unified header.
 *
 * Assertions
 *   1. Exactly ONE <header> element in the DOM at all times.
 *   2. Exactly ONE [data-testid="salon-ai-lockup"] in the DOM at all times.
 *   3. No horizontal overflow (scrollWidth > clientWidth) at 390 and 1440.
 *
 * Tested in two scroll states:
 *   • Expanded  – page freshly loaded, scrollY ≈ 0
 *   • Compact   – scrolled 600 px past cover so pastCover → true
 */

import { test, expect } from "@playwright/test";

const ROUTE = "/investors/2026-external";

for (const width of [390, 1440]) {
  const vp = { width, height: 800 };

  test.describe(`investor header – ${width}px viewport`, () => {
    // ── expanded state (top of page) ────────────────────────────────────────
    test(`expanded: exactly 1 header + 1 lockup, no overflow`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
      // Wait for React to hydrate before querying
      await page.waitForSelector('[data-testid="salon-ai-lockup"]', { timeout: 15000 });

      // Single <header>
      await expect(page.locator("header")).toHaveCount(1);

      // Single canonical lockup
      await expect(
        page.locator('[data-testid="salon-ai-lockup"]')
      ).toHaveCount(1);

      // SALON AI text present in header (exact lockup text)
      await expect(
        page.locator('header [data-testid="salon-ai-lockup"]')
      ).toContainText("SALON AI");

      // No horizontal overflow
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(overflows, `horizontal overflow at ${width}px (expanded)`).toBe(
        false
      );
    });

    // ── compact state (scrolled past cover) ─────────────────────────────────
    test(`compact: exactly 1 header + 1 lockup, no overflow after scroll`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
      // Wait for React to hydrate before querying
      await page.waitForSelector('[data-testid="salon-ai-lockup"]', { timeout: 15000 });

      // Scroll past the 420 px pastCover threshold
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));

      // Wait for the CSS transition to settle (300 ms + buffer)
      await page.waitForTimeout(450);

      // Still exactly one <header>
      await expect(page.locator("header")).toHaveCount(1);

      // Still exactly one lockup – no duplicate rendered on scroll
      await expect(
        page.locator('[data-testid="salon-ai-lockup"]')
      ).toHaveCount(1);

      // Lockup text still visible inside header
      await expect(
        page.locator('header [data-testid="salon-ai-lockup"]')
      ).toContainText("SALON AI");

      // Progress bar is rendered (compact state)
      const progressBarVisible = await page.evaluate(() => {
        const header = document.querySelector("header");
        if (!header) return false;
        const bar = header.lastElementChild as HTMLElement | null;
        // The progress-bar wrapper is the last child of <header>; opacity > 0
        return bar ? parseFloat(getComputedStyle(bar).opacity) > 0.5 : false;
      });
      expect(
        progressBarVisible,
        "progress bar should be visible in compact state"
      ).toBe(true);

      // No horizontal overflow after scroll
      const overflows = await page.evaluate(
        () =>
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth
      );
      expect(overflows, `horizontal overflow at ${width}px (compact)`).toBe(
        false
      );
    });
  });
}
