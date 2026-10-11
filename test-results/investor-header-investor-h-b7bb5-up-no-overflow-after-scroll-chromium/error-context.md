# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: investor-header.spec.ts >> investor header – 1440px viewport >> compact: exactly 1 header + 1 lockup, no overflow after scroll
- Location: tests/smoke/investor-header.spec.ts:56:9

# Error details

```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8888/investors/2026-external
Call log:
  - navigating to "http://localhost:8888/investors/2026-external", waiting until "domcontentloaded"

```

# Test source

```ts
  1   | /**
  2   |  * Smoke tests for the /investors/2026-external unified header.
  3   |  *
  4   |  * Assertions
  5   |  *   1. Exactly ONE <header> element in the DOM at all times.
  6   |  *   2. Exactly ONE [data-testid="salon-ai-lockup"] in the DOM at all times.
  7   |  *   3. No horizontal overflow (scrollWidth > clientWidth) at 390 and 1440.
  8   |  *
  9   |  * Tested in two scroll states:
  10  |  *   • Expanded  – page freshly loaded, scrollY ≈ 0
  11  |  *   • Compact   – scrolled 600 px past cover so pastCover → true
  12  |  */
  13  | 
  14  | import { test, expect } from "@playwright/test";
  15  | 
  16  | const ROUTE = "/investors/2026-external";
  17  | 
  18  | for (const width of [390, 1440]) {
  19  |   const vp = { width, height: 800 };
  20  | 
  21  |   test.describe(`investor header – ${width}px viewport`, () => {
  22  |     // ── expanded state (top of page) ────────────────────────────────────────
  23  |     test(`expanded: exactly 1 header + 1 lockup, no overflow`, async ({
  24  |       page,
  25  |     }) => {
  26  |       await page.setViewportSize(vp);
  27  |       await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
  28  |       // Wait for React to hydrate before querying
  29  |       await page.waitForSelector('[data-testid="salon-ai-lockup"]', { timeout: 15000 });
  30  | 
  31  |       // Single <header>
  32  |       await expect(page.locator("header")).toHaveCount(1);
  33  | 
  34  |       // Single canonical lockup
  35  |       await expect(
  36  |         page.locator('[data-testid="salon-ai-lockup"]')
  37  |       ).toHaveCount(1);
  38  | 
  39  |       // SALON AI text present in header (exact lockup text)
  40  |       await expect(
  41  |         page.locator('header [data-testid="salon-ai-lockup"]')
  42  |       ).toContainText("SALON AI");
  43  | 
  44  |       // No horizontal overflow
  45  |       const overflows = await page.evaluate(
  46  |         () =>
  47  |           document.documentElement.scrollWidth >
  48  |           document.documentElement.clientWidth
  49  |       );
  50  |       expect(overflows, `horizontal overflow at ${width}px (expanded)`).toBe(
  51  |         false
  52  |       );
  53  |     });
  54  | 
  55  |     // ── compact state (scrolled past cover) ─────────────────────────────────
  56  |     test(`compact: exactly 1 header + 1 lockup, no overflow after scroll`, async ({
  57  |       page,
  58  |     }) => {
  59  |       await page.setViewportSize(vp);
> 60  |       await page.goto(ROUTE, { waitUntil: "domcontentloaded" });
      |                  ^ Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:8888/investors/2026-external
  61  |       // Wait for React to hydrate before querying
  62  |       await page.waitForSelector('[data-testid="salon-ai-lockup"]', { timeout: 15000 });
  63  | 
  64  |       // Scroll past the 420 px pastCover threshold
  65  |       await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
  66  | 
  67  |       // Wait for the CSS transition to settle (300 ms + buffer)
  68  |       await page.waitForTimeout(450);
  69  | 
  70  |       // Still exactly one <header>
  71  |       await expect(page.locator("header")).toHaveCount(1);
  72  | 
  73  |       // Still exactly one lockup – no duplicate rendered on scroll
  74  |       await expect(
  75  |         page.locator('[data-testid="salon-ai-lockup"]')
  76  |       ).toHaveCount(1);
  77  | 
  78  |       // Lockup text still visible inside header
  79  |       await expect(
  80  |         page.locator('header [data-testid="salon-ai-lockup"]')
  81  |       ).toContainText("SALON AI");
  82  | 
  83  |       // Progress bar is rendered (compact state)
  84  |       const progressBarVisible = await page.evaluate(() => {
  85  |         const header = document.querySelector("header");
  86  |         if (!header) return false;
  87  |         const bar = header.lastElementChild as HTMLElement | null;
  88  |         // The progress-bar wrapper is the last child of <header>; opacity > 0
  89  |         return bar ? parseFloat(getComputedStyle(bar).opacity) > 0.5 : false;
  90  |       });
  91  |       expect(
  92  |         progressBarVisible,
  93  |         "progress bar should be visible in compact state"
  94  |       ).toBe(true);
  95  | 
  96  |       // No horizontal overflow after scroll
  97  |       const overflows = await page.evaluate(
  98  |         () =>
  99  |           document.documentElement.scrollWidth >
  100 |           document.documentElement.clientWidth
  101 |       );
  102 |       expect(overflows, `horizontal overflow at ${width}px (compact)`).toBe(
  103 |         false
  104 |       );
  105 |     });
  106 |   });
  107 | }
  108 | 
```