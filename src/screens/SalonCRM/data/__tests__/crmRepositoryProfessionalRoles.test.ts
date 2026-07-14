/**
 * Focused tests for the Phase B professional-roles live-read integration.
 *
 * They lock the client-side contract that the future settings UI depends on:
 *   1. `ApiCRMRepository.loadSnapshot()` maps professional roles + staff↔role
 *      assignments out of the crm-bootstrap payload, and hydrates the Phase B
 *      staff fields (professionalRoleIds / blockedServiceIds / stageCapabilities).
 *   2. `getProfessionalRoles()` reads the dedicated authenticated
 *      salon-professional-roles endpoint.
 */

import { createApiCRMRepository } from "../crmRepository";

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

function bootstrapData() {
  return {
    salon: { id: "salon-1", name: "Studio B" },
    salonId: "salon-1",
    currentUser: { id: "user-1", role: "owner" },
    role: "owner",
    departments: [],
    serviceCategories: [],
    services: [],
    resources: [],
    staff: [
      {
        id: "staff-1",
        salon_id: "salon-1",
        name: "Dana Colorist",
        role: "Colorist",
        professional_role_ids: ["sprole-color", "sprole-keratin"],
        stage_capabilities: ["service", "apply", "bogus"],
        blocked_service_ids: ["sv-buzzcut"],
        service_ids: ["sv-color"],
        working_hours: [],
      },
      {
        id: "staff-2",
        salon_id: "salon-1",
        name: "Romi Wash",
        role: "Shampoo Assistant",
        // no professional roles assigned: derived list stays empty
        stage_capabilities: ["wash"],
        working_hours: [],
      },
    ],
    professionalRoles: [
      {
        id: "sprole-color",
        salon_id: "salon-1",
        name: "Colorist",
        department_ids: ["dept-hair"],
        allowed_service_ids: ["sv-color"],
        stage_capabilities: ["service", "apply"],
        default_price_cents: 18000,
        default_duration_minutes: 90,
        color: "#D7897F",
        icon: null,
        sort_order: 1,
        status: "active",
      },
      {
        id: "sprole-archived",
        salon_id: "salon-1",
        name: "Retired",
        department_ids: [],
        allowed_service_ids: [],
        stage_capabilities: [],
        default_price_cents: null,
        default_duration_minutes: null,
        status: "archived",
      },
    ],
    staffProfessionalRoles: [
      {
        id: "ssprole-1",
        salon_id: "salon-1",
        staff_member_id: "staff-1",
        professional_role_id: "sprole-color",
        is_primary: true,
        primary_service_ids: ["sv-color"],
        service_price_overrides: { "sv-color": 20000 },
      },
    ],
    customers: [],
    appointments: [],
    productUsage: [],
    brands: [],
    productLines: [],
    products: [],
    inventoryItems: [],
    needsMigration: false,
  };
}

describe("ApiCRMRepository — Phase B professional-roles live read", () => {
  beforeEach(() => {
    window.localStorage.setItem("spectra.salonSessionToken", "test-token");
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("maps professional roles, assignments and Phase B staff fields from crm-bootstrap", async () => {
    const calls: FetchArgs[] = [];
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("crm-bootstrap")) return jsonResponse(bootstrapData());
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const snapshot = await repo.loadSnapshot();

    // Only the bootstrap endpoint should be hit; everything is already inline.
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain("crm-bootstrap");

    // Roles: both active and archived are preserved (settings UI reactivates).
    expect(snapshot.professionalRoles.map((r) => r.id)).toEqual(["sprole-color", "sprole-archived"]);
    const colorist = snapshot.professionalRoles.find((r) => r.id === "sprole-color")!;
    expect(colorist.allowedServiceIds).toEqual(["sv-color"]);
    expect(colorist.stageCapabilities).toEqual(["service", "apply"]);
    expect(colorist.defaultPriceCents).toBe(18000);
    expect(colorist.status).toBe("active");
    expect(snapshot.professionalRoles.find((r) => r.id === "sprole-archived")!.status).toBe("archived");

    // Assignments carry the per-staff primacy signals.
    expect(snapshot.staffProfessionalRoles).toHaveLength(1);
    const assignment = snapshot.staffProfessionalRoles[0];
    expect(assignment.staffMemberId).toBe("staff-1");
    expect(assignment.professionalRoleId).toBe("sprole-color");
    expect(assignment.isPrimary).toBe(true);
    expect(assignment.primaryServiceIds).toEqual(["sv-color"]);
    expect(assignment.servicePriceOverrides).toEqual({ "sv-color": 20000 });

    // Staff Phase B fields.
    const staff1 = snapshot.staff.find((s) => s.id === "staff-1")!;
    expect(staff1.professionalRoleIds).toEqual(["sprole-color", "sprole-keratin"]);
    expect(staff1.blockedServiceIds).toEqual(["sv-buzzcut"]);
    // Unknown stage capability ("bogus") is dropped, not coerced.
    expect(staff1.stageCapabilities).toEqual(["service", "apply"]);

    const staff2 = snapshot.staff.find((s) => s.id === "staff-2")!;
    expect(staff2.professionalRoleIds).toEqual([]);
    expect(staff2.stageCapabilities).toEqual(["wash"]);
    expect(staff2.blockedServiceIds).toEqual([]);
  });

  it("getProfessionalRoles reads the dedicated authenticated endpoint", async () => {
    const calls: FetchArgs[] = [];
    const fetchImpl = (async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      calls.push({ url, init });
      if (url.includes("salon-professional-roles")) {
        return jsonResponse({
          salonId: "salon-1",
          roles: [
            {
              id: "sprole-color",
              salon_id: "salon-1",
              name: "Colorist",
              allowed_service_ids: ["sv-color"],
              stage_capabilities: ["service"],
              status: "active",
            },
          ],
          assignments: [
            {
              id: "ssprole-1",
              salon_id: "salon-1",
              staff_member_id: "staff-1",
              professional_role_id: "sprole-color",
              is_primary: false,
            },
          ],
        });
      }
      throw new Error(`unexpected fetch to ${url}`);
    }) as typeof fetch;

    const repo = createApiCRMRepository({ token: "test-token", fetchImpl });
    const payload = await repo.getProfessionalRoles();

    expect(calls[0].url).toContain("salon-professional-roles");
    expect(calls[0].url).toContain("status=all");
    expect(payload.roles.map((r) => r.id)).toEqual(["sprole-color"]);
    expect(payload.assignments).toHaveLength(1);
    expect(payload.assignments[0].isPrimary).toBe(false);
  });
});
