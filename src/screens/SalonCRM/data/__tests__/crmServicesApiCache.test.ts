/**
 * Focused tests for the scoped crm-services catalog cache:
 *   - the cache is isolated per salon/user scope (one tenant never reads
 *     another's cached catalog);
 *   - a response fetched under one scope is NOT written to the cache after the
 *     session switched to another scope mid-flight;
 *   - a logout / auth failure clears every scoped catalog entry.
 */

import { listCrmServicesCatalog } from "../crmServicesApi";
import { clearSalonSession, setSalonLoginState, setSalonSessionToken } from "../salonSession";

function catalogResponse(body: unknown): Response {
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    headers: { get: (key: string) => (key.toLowerCase() === "content-type" ? "application/json" : null) },
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

const CATALOG = { departments: [], categories: [], services: [], resources: [] };

describe("crmServicesApi scoped catalog cache", () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    // Clear any module-level catalog cache left by a previous test (logout runs
    // the registered cleaner → serviceCatalogCache.clear()).
    clearSalonSession();
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("test-token");
    fetchMock = jest.fn(async () => catalogResponse(CATALOG));
    (global as unknown as { fetch: typeof fetch }).fetch = fetchMock as unknown as typeof fetch;
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("serves a cached catalog within scope and refetches after a tenant switch", async () => {
    await listCrmServicesCatalog();
    await listCrmServicesCatalog();
    // Second call within the same scope is served from cache.
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Switching tenant changes the scope key → cache miss → refetch.
    setSalonLoginState({ salonId: "salon-2", userId: "user-1" });
    await listCrmServicesCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("does not cache a response fetched under a scope that changed mid-flight", async () => {
    let resolveFetch: ((res: Response) => void) | undefined;
    fetchMock.mockImplementationOnce(
      () => new Promise<Response>((resolve) => {
        resolveFetch = resolve;
      }),
    );

    // Start the request under salon-1, then switch scope before it resolves.
    const pending = listCrmServicesCatalog();
    setSalonLoginState({ salonId: "salon-2", userId: "user-1" });
    resolveFetch!(catalogResponse(CATALOG));
    await pending;

    // Back on salon-1: the earlier response must NOT have been cached under it.
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    await listCrmServicesCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("clears every scoped catalog entry on logout", async () => {
    await listCrmServicesCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Logout runs the registered cache cleaner (serviceCatalogCache.clear()).
    clearSalonSession();

    // Re-establish the same salon session: the catalog cache was cleared, so a
    // fresh fetch is required rather than serving the previous session's value.
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("test-token");
    await listCrmServicesCatalog();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
