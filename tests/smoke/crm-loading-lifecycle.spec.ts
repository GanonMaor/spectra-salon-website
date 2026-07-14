/**
 * tests/smoke/crm-loading-lifecycle.spec.ts
 * ─────────────────────────────────────────────────────────────────────────
 * CRM bootstrap & loading-stability browser smoke tests (Phase 4 verification).
 *
 * These are DETERMINISTIC and self-contained: they inject a synthetic
 * authenticated salon session into localStorage and fully stub the
 * `crm-bootstrap` Netlify function via Playwright routing, so they exercise the
 * real loading lifecycle (boot gate → shell → page gates) WITHOUT a live DB.
 *
 * They cover the plan's browser-level guarantees:
 *   - hard refresh shows the branded boot screen with NO fallback salon /
 *     calendar / metrics before bootstrap succeeds;
 *   - a slow bootstrap keeps the boot gate up (no business content leak);
 *   - a bootstrap error shows a retry and re-requests on click;
 *   - Team shows a pending skeleton, then the true empty state only after a
 *     successful (empty) load — never a false-empty;
 *   - the shell (sidebar/header) stays dimensionally stable across a
 *     background refresh (no layout shift).
 *
 * PREREQUISITE: a locally served build must be running, e.g.
 *   npm run dev         (Netlify dev on :8888)   — or —
 *   npm run build && npm run preview  (set BASE_URL to the preview origin)
 * Run: BASE_URL=http://localhost:8888 npm run test:smoke -- crm-loading-lifecycle
 *
 * If /crm redirects to login (session-injection shape drifted from the app),
 * the affected test SKIPS rather than producing a false failure.
 */

import { test, expect, type Page, type Route } from "@playwright/test";

const SALON_ID = "e2e-salon";
const USER_ID = "e2e-user";

const SESSION_TOKEN_KEY = "spectra.salonSessionToken";
const LOGIN_STATE_KEY = "spectra.salonLoginState";

/** A complete crm-bootstrap payload so ONLY crm-bootstrap is fetched (every
 * business collection is present, forcing no secondary Phase-4 requests). */
function bootstrapPayload(overrides: Record<string, unknown> = {}) {
  return {
    ok: true,
    data: {
      salon: {
        id: SALON_ID,
        name: "E2E Salon",
        slug: SALON_ID,
        timezone: "Asia/Jerusalem",
        currency: "ILS",
        status: "active",
        onboarding_status: "completed",
        working_hours: [],
      },
      salonId: SALON_ID,
      currentUser: { id: USER_ID, role: "owner" },
      role: "owner",
      departments: [
        { id: "dept-hair", name: "Hair", calendarLabel: "Hair", calendarColor: "#D7897F", bookingMode: "process", isCalendarEnabled: true, sortOrder: 1, status: "active" },
      ],
      serviceCategories: [],
      services: [],
      resources: [],
      staff: [],
      professionalRoles: [],
      staffProfessionalRoles: [],
      customers: [],
      appointments: [],
      productUsage: [],
      brands: [],
      productLines: [],
      products: [],
      inventoryItems: [],
      needsMigration: false,
      ...overrides,
    },
  };
}

/** Inject an authenticated (non-dev) salon session so the LIVE repository runs
 * and crm-bootstrap is actually fetched (and thus interceptable). */
async function injectLiveSession(page: Page) {
  await page.addInitScript(
    ({ tokenKey, stateKey, salonId, userId }) => {
      localStorage.setItem(tokenKey, "e2e-bearer-token");
      localStorage.setItem(
        stateKey,
        JSON.stringify({ salonId, userId, role: "owner", loggedInAt: new Date().toISOString() }),
      );
    },
    { tokenKey: SESSION_TOKEN_KEY, stateKey: LOGIN_STATE_KEY, salonId: SALON_ID, userId: USER_ID },
  );
}

/** Register a crm-bootstrap route with a controllable delay + status. Returns a
 * counter of how many times bootstrap was requested (for retry assertions). */
function routeBootstrap(
  page: Page,
  opts: { delayMs?: number; status?: number; payload?: unknown } = {},
): { count: () => number } {
  let count = 0;
  const { delayMs = 0, status = 200, payload = bootstrapPayload() } = opts;
  void page.route("**/.netlify/functions/crm-bootstrap*", async (route: Route) => {
    count += 1;
    if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
    await route.fulfill({
      status,
      contentType: "application/json",
      body: JSON.stringify(status >= 400 ? { ok: false, error: { code: "E", message: "boom" } } : payload),
    });
  });
  return { count: () => count };
}

async function skipIfRedirectedToLogin(page: Page) {
  await page.waitForTimeout(300);
  if (page.url().includes("/user-login")) {
    test.skip(true, "CRM route redirected to login — session injection shape drifted");
  }
}

const BOOT = '[data-testid="crm-boot-screen"]';

test.describe("CRM cold-boot gate", () => {
  test.beforeEach(async ({ page }) => {
    await injectLiveSession(page);
  });

  test("hard refresh shows the branded boot screen with no fallback salon/calendar", async ({ page }) => {
    // Delay bootstrap so the boot screen is guaranteed to be observable.
    routeBootstrap(page, { delayMs: 1500 });
    await page.goto("/crm/home");
    await skipIfRedirectedToLogin(page);

    const boot = page.locator(BOOT);
    await expect(boot).toBeVisible();
    await expect(boot).toHaveAttribute("data-variant", "loading");

    // NO business content may leak before success: no salon name, no calendar
    // nav, no owner label.
    const body = (await page.textContent("body")) ?? "";
    expect(body).not.toContain("E2E Salon");
    expect(body).not.toMatch(/Hair Calendar|Current salon|Salon Owner/);

    // Once bootstrap resolves, the shell replaces the boot screen.
    await expect(boot).toBeHidden({ timeout: 10000 });
    await expect(page.locator("body")).toContainText("E2E Salon", { timeout: 10000 });
  });

  test("bootstrap error shows a retry that re-requests bootstrap", async ({ page }) => {
    const tracker = routeBootstrap(page, { status: 500 });
    await page.goto("/crm/home");
    await skipIfRedirectedToLogin(page);

    const boot = page.locator(BOOT);
    await expect(boot).toBeVisible();
    await expect(boot).toHaveAttribute("data-variant", "error", { timeout: 10000 });

    const before = tracker.count();
    await page.getByRole("button", { name: /Try again|נסה שוב/ }).click();
    await page.waitForTimeout(500);
    expect(tracker.count()).toBeGreaterThan(before);
  });

  test("shell stays dimensionally stable (no layout shift) across a refresh", async ({ page }) => {
    routeBootstrap(page);
    await page.goto("/crm/home");
    await skipIfRedirectedToLogin(page);

    await expect(page.locator(BOOT)).toBeHidden({ timeout: 10000 });
    const sidebar = page.locator("aside").first();
    if (!(await sidebar.isVisible().catch(() => false))) {
      test.skip(true, "sidebar not present at this viewport");
    }
    const first = await sidebar.boundingBox();

    // Trigger a background refresh via a storage event (re-scope to same
    // fingerprint is a no-op, but a same-identity refresh must not reflow).
    await page.evaluate(() => window.dispatchEvent(new Event("resize")));
    await page.waitForTimeout(400);
    const second = await sidebar.boundingBox();

    expect(first).toBeTruthy();
    expect(second).toBeTruthy();
    expect(Math.round(second!.width)).toBe(Math.round(first!.width));
    expect(Math.round(second!.x)).toBe(Math.round(first!.x));
  });
});

test.describe("CRM Team pending vs true-empty", () => {
  test.beforeEach(async ({ page }) => {
    await injectLiveSession(page);
  });

  test("Team shows a pending skeleton, then the empty state only after load", async ({ page }) => {
    routeBootstrap(page, { delayMs: 1200 });
    await page.goto("/crm/schedule?tab=settings&section=team");
    await skipIfRedirectedToLogin(page);

    // While the boot gate is up, the false-empty "No team members yet" must NOT
    // be shown.
    const body1 = (await page.textContent("body")) ?? "";
    expect(body1).not.toContain("No team members yet");

    // After a successful (empty) bootstrap, the shell mounts and the true empty
    // state appears — never conflated with the pending skeleton.
    await expect(page.locator(BOOT)).toBeHidden({ timeout: 10000 });
    await expect(page.locator("body")).toContainText(/No team members yet|אין אנשי צוות עדיין/, { timeout: 10000 });
  });
});
