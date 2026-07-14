/**
 * Focused tests for the scope-safe crm-bootstrap read model
 * (`ApiCRMRepository.loadBootstrap`):
 *   - the schedule-shaped navigation catalog (departments / categories /
 *     services / resources) is mapped out of the single bootstrap payload;
 *   - live mode never fabricates resources/department defaults;
 *   - a caller that aborts, a session that changes mid-flight, and a tenant
 *     mismatch are all rejected with a `CRMBootstrapScopeError` so a stale or
 *     wrong-tenant response can never be applied.
 */

import {
  createApiCRMRepository,
  CRMBootstrapDataError,
  CRMBootstrapScopeError,
} from "../crmRepository";
import { setSalonLoginState, setSalonSessionToken } from "../salonSession";

type FetchArgs = { url: string; init?: RequestInit };

function jsonResponse(data: unknown): Response {
  const body = { ok: true, data };
  return {
    ok: true,
    status: 200,
    statusText: "OK",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

/** A salon-scoped endpoint that is unavailable (setup/schema not ready). */
function errorResponse(status: number, code?: string): Response {
  const body = { ok: false, error: { code, message: "unavailable" } };
  return {
    ok: false,
    status,
    statusText: "Service Unavailable",
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response;
}

function bootstrapData(overrides: Record<string, unknown> = {}) {
  return {
    salon: { id: "salon-1", name: "Studio B", onboarding_status: "completed" },
    salonId: "salon-1",
    currentUser: { id: "user-1", role: "owner" },
    role: "owner",
    departments: [
      {
        id: "dept-hair",
        name: "Hair",
        calendarLabel: "Hair",
        calendarColor: "#D7897F",
        bookingMode: "process",
        isCalendarEnabled: true,
        sortOrder: 1,
        status: "active",
      },
    ],
    serviceCategories: [
      {
        id: "cat-color",
        departmentId: "dept-hair",
        crmCategoryId: "color",
        name: "Color",
        accentColor: "#123456",
        sortOrder: 1,
        status: "active",
      },
    ],
    services: [
      {
        id: "sv-color",
        categoryId: "cat-color",
        crmCategoryId: "color",
        name: "Full Color",
        defaultDurationMinutes: 90,
        defaultPriceCents: 18000,
        defaultMaterialCostCents: 3000,
        sortOrder: 1,
        status: "active",
        defaultStages: [],
        linkedServiceIds: [],
      },
    ],
    resources: [
      {
        id: "res-chair-1",
        type: "chair",
        name: "Chair 1",
        departmentId: "dept-hair",
        capacity: 1,
        isExclusive: true,
        sortOrder: 1,
        status: "active",
      },
    ],
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

describe("ApiCRMRepository.loadBootstrap — scope-safe read model", () => {
  beforeEach(() => {
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("test-token");
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  it("maps the navigation catalog from a single crm-bootstrap payload", async () => {
    const calls: FetchArgs[] = [];
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("crm-bootstrap")) return jsonResponse(bootstrapData());
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const result = await repo.loadBootstrap!();

    // Only the bootstrap endpoint is hit — no separate sidebar/catalog fetch.
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("crm-bootstrap");

    expect(result.catalog.departments.map((d) => d.id)).toEqual(["dept-hair"]);
    expect(result.catalog.departments[0].bookingMode).toBe("process");
    expect(result.catalog.categories.map((c) => c.id)).toEqual(["cat-color"]);
    expect(result.catalog.services.map((s) => s.id)).toEqual(["sv-color"]);
    expect(result.catalog.services[0].defaultDurationMinutes).toBe(90);
    expect(result.catalog.resources.map((r) => r.id)).toEqual(["res-chair-1"]);
    expect(result.catalog.resources[0].type).toBe("chair");

    expect(result.identity.salonId).toBe("salon-1");
    expect(result.identity.userId).toBe("user-1");
    expect(result.identity.role).toBe("owner");
    expect(result.identity.fingerprint).toContain("salon-1");
    expect(result.onboarding.status).toBe("completed");
    expect(result.onboarding.needsMigration).toBe(false);
  });

  it("never fabricates resources/department defaults when the payload is empty", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) {
        return jsonResponse(
          bootstrapData({ departments: [], serviceCategories: [], services: [], resources: [] }),
        );
      }
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const result = await repo.loadBootstrap!();

    expect(result.catalog.departments).toEqual([]);
    expect(result.catalog.categories).toEqual([]);
    expect(result.catalog.services).toEqual([]);
    expect(result.catalog.resources).toEqual([]);
  });

  it("rejects an already-aborted request without applying data", async () => {
    const fetchImpl = jest.fn(async () => jsonResponse(bootstrapData())) as unknown as typeof fetch;
    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });

    const controller = new AbortController();
    controller.abort();

    await expect(repo.loadBootstrap!({ signal: controller.signal })).rejects.toMatchObject({
      name: "CRMBootstrapScopeError",
      reason: "aborted",
    });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects a response whose session changed mid-flight (stale-session)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) {
        // Simulate the token being replaced (re-login) while the request is in
        // flight; the fingerprint captured before the fetch no longer matches.
        setSalonSessionToken("a-different-token");
        return jsonResponse(bootstrapData());
      }
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });

    await expect(repo.loadBootstrap!()).rejects.toMatchObject({
      name: "CRMBootstrapScopeError",
      reason: "stale-session",
    });
  });

  it("rejects a payload for a different tenant than the session (tenant-mismatch)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) {
        return jsonResponse(
          bootstrapData({ salonId: "salon-999", salon: { id: "salon-999", name: "Wrong" } }),
        );
      }
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });

    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapScopeError);
    expect((error as CRMBootstrapScopeError).reason).toBe("tenant-mismatch");
  });
});

describe("ApiCRMRepository.loadBootstrap — core-domain setup failures", () => {
  beforeEach(() => {
    setSalonLoginState({ salonId: "salon-1", userId: "user-1" });
    setSalonSessionToken("test-token");
  });

  afterEach(() => {
    window.localStorage.clear();
    jest.restoreAllMocks();
  });

  // A bootstrap payload without nested inventory arrays forces the repository
  // to fall back to the salon-products endpoints for the inventory domain.
  function bootstrapWithoutInventory() {
    return bootstrapData({
      brands: undefined,
      productLines: undefined,
      products: undefined,
      inventoryItems: undefined,
    });
  }

  it("surfaces a typed bootstrap error when a core domain's setup is unavailable", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(bootstrapWithoutInventory());
      // The salon-products (inventory) endpoint is down / schema not ready.
      if (url.includes("salon-products")) return errorResponse(503, "SCHEMA_NOT_READY");
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });

    const error = await repo.loadBootstrap!().catch((err: unknown) => err);
    expect(error).toBeInstanceOf(CRMBootstrapDataError);
    expect((error as CRMBootstrapDataError).domain).toBe("inventory");
    expect((error as CRMBootstrapDataError).reason).toBe("setup-unavailable");
  });

  it("keeps a genuinely empty core domain as successful empty data (200 OK)", async () => {
    const fetchImpl = (async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("crm-bootstrap")) return jsonResponse(bootstrapWithoutInventory());
      // salon-products responds 200 with no rows: a real, empty inventory.
      if (url.includes("salon-products")) {
        return jsonResponse({ brands: [], items: [], productLines: [] });
      }
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const result = await repo.loadBootstrap!();

    expect(result.snapshot.brands).toEqual([]);
    expect(result.snapshot.inventoryItems).toEqual([]);
    expect(result.snapshot.products).toEqual([]);
  });
});
