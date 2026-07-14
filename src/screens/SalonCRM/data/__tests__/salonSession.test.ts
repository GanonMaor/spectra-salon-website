/**
 * Focused tests for the salon-session identity contract used by the CRM
 * bootstrap state machine:
 *   - scope key + fingerprint change when the salon/user/token changes;
 *   - subscribers are notified on login/logout/token replacement;
 *   - scoped-cache cleaners run on logout WHILE the outgoing scope is still
 *     resolvable, so a cleaner can drop the correct tenant's cache.
 */

import {
  clearSalonSession,
  getSalonScopeKey,
  getSalonSessionFingerprint,
  registerSalonCacheCleaner,
  setSalonLoginState,
  setSalonSessionToken,
  subscribeSalonSession,
} from "../salonSession";

describe("salonSession identity + scope", () => {
  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("scopes by salon + user and defaults to anonymous", () => {
    expect(getSalonScopeKey()).toBe("anonymous");
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    expect(getSalonScopeKey()).toBe("salon-1:user-1");
    setSalonLoginState({ salonId: "salon-2", userId: "user-9" });
    expect(getSalonScopeKey()).toBe("salon-2:user-9");
  });

  it("fingerprint encodes salon + user + token and changes on each transition", () => {
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    const noToken = getSalonSessionFingerprint();
    expect(noToken).toContain("salon-1");
    expect(noToken).toContain("user-1");

    setSalonSessionToken("token-a");
    const withA = getSalonSessionFingerprint();
    expect(withA).not.toBe(noToken);
    expect(withA).toContain("token-a");

    // Same identity, different token (session replacement) → new fingerprint.
    setSalonSessionToken("token-b");
    expect(getSalonSessionFingerprint()).not.toBe(withA);

    // Tenant switch → new fingerprint.
    const beforeSwitch = getSalonSessionFingerprint();
    setSalonLoginState({ salonId: "salon-2", userId: "user-1" });
    expect(getSalonSessionFingerprint()).not.toBe(beforeSwitch);
  });

  it("logout resets fingerprint to the anonymous scope", () => {
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("token-a");
    expect(getSalonSessionFingerprint()).not.toContain("anonymous");
    clearSalonSession();
    expect(getSalonScopeKey()).toBe("anonymous");
    expect(getSalonSessionFingerprint()).toContain("anonymous");
  });

  it("notifies subscribers on token + login-state changes and stops after unsubscribe", () => {
    const listener = jest.fn();
    const unsubscribe = subscribeSalonSession(listener);

    setSalonSessionToken("token-a");
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    expect(listener).toHaveBeenCalledTimes(2);

    unsubscribe();
    setSalonSessionToken("token-c");
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it("runs cache cleaners on logout while the outgoing scope is still resolvable", () => {
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("token-a");

    const scopeSeenByCleaner: string[] = [];
    const unregister = registerSalonCacheCleaner(() => {
      scopeSeenByCleaner.push(getSalonScopeKey());
    });

    clearSalonSession();

    // The cleaner observed the salon scope (ran before storage was cleared),
    // and after logout the scope is anonymous.
    expect(scopeSeenByCleaner).toEqual(["salon-1:user-1"]);
    expect(getSalonScopeKey()).toBe("anonymous");

    unregister();
    clearSalonSession();
    expect(scopeSeenByCleaner).toEqual(["salon-1:user-1"]);
  });
});
