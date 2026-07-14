/**
 * Phase 4 verification — salon-session auth surface used by the CRM loading
 * lifecycle. `salonSession.test.ts` already covers scope/fingerprint/subscriber
 * mechanics; this file focuses on the session gates and the "server is the sole
 * tenant authority" contract that keep hard-refresh boots correct:
 *
 *   - a signed bearer token (or a local-dev session) unlocks /crm/*, while a
 *     stale production loginState WITHOUT a token does not;
 *   - request headers only ever carry the bearer token, never a salon id;
 *   - a 401 on a /crm route clears the session and redirects to login exactly
 *     once, and a non-401 (or non-/crm route) is left alone.
 */

import {
  canCallSalonRuntimeApi,
  clearSalonSession,
  getSalonSessionToken,
  handleSalonAuthFailure,
  hasActiveSalonSession,
  salonAuthHeaders,
  setSalonLoginState,
  setSalonSessionToken,
  subscribeSalonSession,
} from "../salonSession";

/**
 * Point jsdom at a real URL via history.pushState (updates window.location
 * pathname/search). jsdom's `location` is a non-configurable accessor whose
 * `replace` is read-only, so we assert on the observable session side effects
 * (token cleared + listeners notified) rather than the navigation call itself.
 * `location.replace` triggers a jsdom "navigation not implemented" console
 * error that is harmless here — silence it to keep test output clean.
 */
function stubLocation(pathname: string, search: string): void {
  window.history.pushState({}, "", `${pathname}${search}`);
  jest.spyOn(console, "error").mockImplementation(() => {});
}

describe("salonSession auth gates + tenant-safe headers", () => {
  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("unlocks /crm only for a bearer token (not a token-less prod loginState)", () => {
    expect(hasActiveSalonSession()).toBe(false);

    // A stale production login state without a bearer token must NOT unlock CRM.
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    expect(hasActiveSalonSession()).toBe(false);

    setSalonSessionToken("token-a");
    expect(hasActiveSalonSession()).toBe(true);
    expect(getSalonSessionToken()).toBe("token-a");
  });

  it("builds headers with the bearer token and never a salon id", () => {
    setSalonLoginState({ salonId: "salon-77", userId: "user-1" });
    setSalonSessionToken("token-a");

    const headers = salonAuthHeaders({ "X-Extra": "1" });
    expect(headers.Authorization).toBe("Bearer token-a");
    expect(headers.Accept).toBe("application/json");
    expect(headers["X-Extra"]).toBe("1");

    const serialized = JSON.stringify(headers).toLowerCase();
    expect(serialized).not.toContain("salon-77");
    expect(Object.keys(headers).map((k) => k.toLowerCase())).not.toContain("x-salon-id");
  });

  it("omits Authorization entirely when there is no token", () => {
    const headers = salonAuthHeaders();
    expect("Authorization" in headers).toBe(false);
    expect(headers.Accept).toBe("application/json");
  });

  it("canCallSalonRuntimeApi requires an authenticated (token) session", () => {
    expect(canCallSalonRuntimeApi()).toBe(false);
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("token-a");
    expect(canCallSalonRuntimeApi()).toBe(true);
  });

  // NOTE ON ORDERING: `handleSalonAuthFailure` uses a module-level, one-shot
  // redirect guard that latches `true` after the first successful /crm 401. The
  // negative cases (non-401, non-/crm) must therefore run BEFORE the positive
  // case, so their early-return is exercised for the right reason.

  it("ignores non-401 statuses (session untouched)", () => {
    stubLocation("/crm/home", "");
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("token-a");

    handleSalonAuthFailure(500);
    handleSalonAuthFailure(404);
    handleSalonAuthFailure(undefined);
    expect(getSalonSessionToken()).toBe("token-a");
  });

  it("does not touch a session on a 401 outside /crm", () => {
    stubLocation("/dashboard", "");
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("token-a");

    handleSalonAuthFailure(401);
    expect(getSalonSessionToken()).toBe("token-a");
    clearSalonSession();
  });

  it("clears the session once on a 401 for a /crm route", () => {
    stubLocation("/crm/home", "?tab=settings");
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("token-a");

    const listener = jest.fn();
    const unsubscribe = subscribeSalonSession(listener);

    handleSalonAuthFailure(401);
    // The outgoing session was cleared (token dropped) and subscribers notified.
    expect(getSalonSessionToken()).toBeNull();
    expect(listener).toHaveBeenCalled();

    // A second 401 must be a no-op (idempotent guard) — no further clears.
    listener.mockClear();
    handleSalonAuthFailure(401);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });
});
