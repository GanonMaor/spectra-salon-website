/**
 * Phase 4 verification — cold-boot lifecycle & scope hardening for the live
 * repository (`ApiCRMRepository`). Complements `crmRepositoryBootstrap` (catalog
 * mapping + aborted/stale/tenant-mismatch) with the remaining loading-lifecycle
 * guarantees from the CRM loading-stability plan:
 *
 *   - a 401 bootstrap surfaces as an auth error (→ shell `unauthorized`);
 *   - when a CORE domain (customers/staff/appointments/inventory/services)
 *     cannot load because setup/DB/schema is unavailable (404/503), the whole
 *     bootstrap REJECTS with a typed `CRMBootstrapDataError` (→ shell `error` +
 *     retry) instead of masking an outage as a false-empty "0 everything" salon;
 *   - a genuine 200-OK EMPTY bootstrap still loads as legitimate empty data
 *     (a freshly-provisioned salon), never seed defaults;
 *   - a session change that lands during the secondary fetches is rejected;
 *   - writes and auth headers are tenant-scoped: the client never sends a salon
 *     id in a request body or header (the server is the sole scoping authority).
 */

import {
  createApiCRMRepository,
  CRMBootstrapDataError,
  CRMBootstrapScopeError,
  CRMBootstrapUnavailableError,
  isSalonAuthError,
} from "../crmRepository";
import { setSalonLoginState, setSalonSessionToken } from "../salonSession";

type FetchArgs = { url: string; init?: RequestInit };

function jsonResponse(data: unknown, status = 200): Response {
  const body = status >= 400 ? { ok: false, error: { code: "ERR", message: "boom" } } : { ok: true, data };
  return {
    ok: status < 400,
    status,
    statusText: status < 400 ? "OK" : "ERR",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

/** A crm-bootstrap payload with every business collection present (empty), so
 * ONLY crm-bootstrap is fetched — no secondary Phase-4 requests. */
function fullBootstrap(overrides: Record<string, unknown> = {}) {
  return {
    salon: { id: "salon-1", name: "Studio B", onboarding_status: "completed" },
    salonId: "salon-1",
    currentUser: { id: "user-1", role: "owner" },
    role: "owner",
    departments: [],
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
  };
}

/** A crm-bootstrap payload carrying NO business collections, forcing the
 * repository down the secondary Phase-4 endpoint path. */
function minimalBootstrap(overrides: Record<string, unknown> = {}) {
  return {
    salon: { id: "salon-1", name: "Studio B", onboarding_status: "completed" },
    salonId: "salon-1",
    currentUser: { id: "user-1", role: "owner" },
    role: "owner",
    needsMigration: false,
    ...overrides,
  };
}

describe("ApiCRMRepository cold-boot lifecycle", () => {
  beforeEach(() => {
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("test-token");
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("surfaces a 401 bootstrap as an auth error (never applies content)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(null, 401);
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(isSalonAuthError(error)).toBe(true);
  });

  it("REJECTS (never false-empties) when a core domain is setup-unavailable (404)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(minimalBootstrap());
      return jsonResponse(null, 404);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapDataError);
    expect((error as CRMBootstrapDataError).reason).toBe("setup-unavailable");
  });

  it("REJECTS with a typed data error when a core domain is schema-unavailable (503)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(minimalBootstrap());
      return jsonResponse(null, 503);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapDataError);
  });

  it("REJECTS (typed) a needsMigration bootstrap from the mock / no-DB fast path", async () => {
    // The no-DB fast path returns 200 with salon:null, empty core collections
    // and needsMigration:true. That is NOT a real, provisioned salon — it must
    // reject with a typed CRMBootstrapUnavailableError, never a success.
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) {
        return jsonResponse(
          fullBootstrap({ salon: null, salonId: "salon-1", needsMigration: true }),
        );
      }
      throw new Error(`unexpected secondary fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapUnavailableError);
    expect((error as CRMBootstrapUnavailableError).reason).toBe("needs-migration");
  });

  it("REJECTS (typed) a needsMigration bootstrap when core runtime tables are missing", async () => {
    // A DB is configured but a required core table is physically absent: the
    // server returns 200 with empty core collections and needsMigration:true.
    // The empty collections must not be surfaced as a legitimate empty salon.
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(fullBootstrap({ needsMigration: true }));
      throw new Error(`unexpected secondary fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapUnavailableError);
    // A non-setup data error is a different failure mode; assert it is NOT that.
    expect(error).not.toBeInstanceOf(CRMBootstrapDataError);
  });

  it("loads a genuine 200-OK EMPTY bootstrap as legitimate empty data (no seed)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(fullBootstrap());
      throw new Error(`unexpected secondary fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const result = await repo.loadBootstrap!();

    // A freshly-provisioned salon: real (empty) collections, never seed rows.
    expect(result.snapshot.salonId).toBe("salon-1");
    expect(result.snapshot.salons[0].name).toBe("Studio B");
    expect(result.snapshot.customers).toEqual([]);
    expect(result.snapshot.staff).toEqual([]);
    expect(result.snapshot.appointments).toEqual([]);
    expect(result.snapshot.services).toEqual([]);
    expect(result.snapshot.brands).toEqual([]);
    expect(result.snapshot.inventoryItems).toEqual([]);
    expect(result.snapshot.visits).toEqual([]);
    expect(result.snapshot.mixSessions).toEqual([]);
    expect(result.onboarding.status).toBe("completed");
  });

  it("propagates a NON-setup secondary failure (500) without masking it as empty", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(minimalBootstrap());
      return jsonResponse(null, 500);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    // A 500 is not a "setup unavailable" state — it must not be coerced to a
    // CRMBootstrapDataError-swallowed empty, and must still reject the boot.
    expect(error).toBeTruthy();
    expect(error).not.toBeInstanceOf(CRMBootstrapDataError);
  });

  it("rejects a session change that lands DURING the secondary fetches", async () => {
    let bootstrapResolved = false;
    let switched = false;
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) {
        bootstrapResolved = true;
        return jsonResponse(minimalBootstrap());
      }
      // First secondary fetch: simulate the tenant switching mid-flight, then
      // let every secondary succeed so the POST-Promise.all scope check is the
      // thing that rejects (stale-session), not a data error.
      if (bootstrapResolved && !switched) {
        switched = true;
        setSalonSessionToken("a-different-token");
      }
      return jsonResponse({});
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapScopeError);
    expect((error as CRMBootstrapScopeError).reason).toBe("stale-session");
  });

  it("never sends a salon id in a write request body", async () => {
    const calls: FetchArgs[] = [];
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      return jsonResponse({ customer: { id: "c1", firstName: "Dana", salonId: "salon-1" } });
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    await repo.createCustomer({ firstName: "Dana", salonId: "salon-1" } as never);

    const call = calls.find((c) => c.url.includes("salon-customers"));
    expect(call).toBeTruthy();
    const body = JSON.parse(String(call!.init!.body));
    expect(body.firstName).toBe("Dana");
    expect("salonId" in body).toBe(false);
    expect("salon_id" in body).toBe(false);
  });

  it("never sends a salon id in request headers (bearer only)", async () => {
    const calls: FetchArgs[] = [];
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("crm-bootstrap")) return jsonResponse(fullBootstrap());
      throw new Error(`unexpected secondary fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({
      authHeaders: () => ({
        Accept: "application/json",
        Authorization: "Bearer test-token",
        "X-Salon-Id": "salon-1",
        salon_id: "salon-1",
      }),
      fetchImpl,
    });
    await repo.loadBootstrap!();

    const call = calls.find((c) => c.url.includes("crm-bootstrap"));
    const headers = (call!.init!.headers ?? {}) as Record<string, string>;
    const lowerKeys = Object.keys(headers).map((k) => k.toLowerCase());
    expect(lowerKeys).not.toContain("x-salon-id");
    expect(lowerKeys).not.toContain("salon_id");
    expect(headers.Authorization).toBe("Bearer test-token");
  });
});
