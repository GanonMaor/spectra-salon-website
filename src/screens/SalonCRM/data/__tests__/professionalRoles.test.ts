/**
 * Unit tests for professional-role capability & precedence helpers (Phase B).
 * Pure functions; run under the default `npm test`.
 */
import type { ProfessionalRole, StaffProfessionalRole } from "../crmTypes";
import {
  LEGACY_WASH_ASSISTANT_ROLE_ID,
  deriveStageCapabilities,
  isPrimaryServiceProvider,
  isWashAssistant,
  resolveServicePlan,
  selectRoleForService,
  staffHasStageCapability,
  type StaffRoleBinding,
} from "../professionalRoles";

function role(overrides: Partial<ProfessionalRole> & { id: string }): ProfessionalRole {
  return {
    salonId: "salon-1",
    name: overrides.id,
    departmentIds: [],
    allowedServiceIds: [],
    stageCapabilities: [],
    status: "active",
    ...overrides,
  };
}

function assignment(overrides: Partial<StaffProfessionalRole> & { professionalRoleId: string }): StaffProfessionalRole {
  return {
    id: `a-${overrides.professionalRoleId}`,
    salonId: "salon-1",
    staffMemberId: "s1",
    isPrimary: false,
    ...overrides,
  };
}

const SERVICE = { id: "sv1", defaultPriceCents: 10000, defaultDurationMinutes: 60 };

describe("capability helpers", () => {
  it("treats explicit wash-only capabilities as a wash assistant", () => {
    expect(isWashAssistant({ stageCapabilities: ["wash"] })).toBe(true);
    expect(isPrimaryServiceProvider({ stageCapabilities: ["wash"] })).toBe(false);
  });

  it("does not treat a stylist who can also wash as a wash assistant", () => {
    expect(isWashAssistant({ stageCapabilities: ["wash", "service"] })).toBe(false);
    expect(isPrimaryServiceProvider({ stageCapabilities: ["service"] })).toBe(true);
  });

  it("falls back to the legacy role id when no capability data exists", () => {
    expect(isWashAssistant({ roleId: LEGACY_WASH_ASSISTANT_ROLE_ID })).toBe(true);
    expect(isWashAssistant({ roleId: "role-hair-stylist" })).toBe(false);
    expect(isWashAssistant({})).toBe(false);
  });

  it("derives capabilities from active professional roles via lookup", () => {
    const roles = new Map<string, ProfessionalRole>([
      ["r-wash", role({ id: "r-wash", stageCapabilities: ["wash"] })],
      ["r-archived", role({ id: "r-archived", stageCapabilities: ["apply"], status: "archived" })],
    ]);
    const lookup = (id: string) => roles.get(id);
    const staff = { professionalRoleIds: ["r-wash", "r-archived"] };
    expect([...deriveStageCapabilities(staff, lookup)]).toEqual(["wash"]);
    expect(staffHasStageCapability(staff, "wash", lookup)).toBe(true);
    expect(staffHasStageCapability(staff, "apply", lookup)).toBe(false);
  });
});

describe("selectRoleForService", () => {
  const colorist = { role: role({ id: "r-color", allowedServiceIds: ["sv1"] }) };
  const keratin = { role: role({ id: "r-keratin", allowedServiceIds: ["sv1"] }) };

  it("returns nothing when no role allows the service", () => {
    expect(selectRoleForService("sv1", [{ role: role({ id: "r-x", allowedServiceIds: ["sv9"] }) }])).toEqual({});
  });

  it("picks the single allowing role", () => {
    expect(selectRoleForService("sv1", [colorist]).binding?.role.id).toBe("r-color");
  });

  it("prefers the role marked primary for the service", () => {
    const bindings: StaffRoleBinding[] = [
      colorist,
      { role: keratin.role, assignment: assignment({ professionalRoleId: "r-keratin", primaryServiceIds: ["sv1"] }) },
    ];
    expect(selectRoleForService("sv1", bindings).binding?.role.id).toBe("r-keratin");
  });

  it("reports a conflict when several roles allow it and none is primary", () => {
    const { binding, conflict } = selectRoleForService("sv1", [colorist, keratin]);
    expect(binding).toBeUndefined();
    expect(conflict).toEqual({ reason: "ambiguous-role", roleIds: ["r-color", "r-keratin"] });
  });

  it("ignores archived roles as candidates", () => {
    const archived = { role: role({ id: "r-old", allowedServiceIds: ["sv1"], status: "archived" }) };
    expect(selectRoleForService("sv1", [colorist, archived]).binding?.role.id).toBe("r-color");
  });
});

describe("resolveServicePlan precedence", () => {
  it("uses the service default when nothing overrides it", () => {
    const plan = resolveServicePlan({ service: SERVICE, staff: {} });
    expect(plan).toMatchObject({ priceCents: 10000, priceSource: "service", durationMinutes: 60, durationSource: "service", allowed: true, blocked: false });
  });

  it("applies the professional-role default over the service default", () => {
    const bindings: StaffRoleBinding[] = [
      { role: role({ id: "r-color", allowedServiceIds: ["sv1"], defaultPriceCents: 12000, defaultDurationMinutes: 75 }) },
    ];
    const plan = resolveServicePlan({ service: SERVICE, staff: { professionalRoleIds: ["r-color"] }, bindings });
    expect(plan).toMatchObject({ priceCents: 12000, priceSource: "role", durationMinutes: 75, durationSource: "role", roleId: "r-color" });
  });

  it("applies a staff-specific override over the role default", () => {
    const bindings: StaffRoleBinding[] = [
      { role: role({ id: "r-color", allowedServiceIds: ["sv1"], defaultPriceCents: 12000 }) },
    ];
    const plan = resolveServicePlan({
      service: SERVICE,
      staff: { servicePriceOverrides: { sv1: 13500 } },
      bindings,
    });
    expect(plan).toMatchObject({ priceCents: 13500, priceSource: "staff" });
  });

  it("applies an appointment-specific override over everything", () => {
    const bindings: StaffRoleBinding[] = [
      { role: role({ id: "r-color", allowedServiceIds: ["sv1"], defaultPriceCents: 12000, defaultDurationMinutes: 75 }) },
    ];
    const plan = resolveServicePlan({
      service: SERVICE,
      staff: { servicePriceOverrides: { sv1: 13500 } },
      bindings,
      appointmentOverride: { priceCents: 20000, durationMinutes: 45 },
    });
    expect(plan).toMatchObject({ priceCents: 20000, priceSource: "appointment", durationMinutes: 45, durationSource: "appointment" });
  });

  it("lets a manual per-staff block win over any role permission", () => {
    const bindings: StaffRoleBinding[] = [
      { role: role({ id: "r-color", allowedServiceIds: ["sv1"], defaultPriceCents: 12000 }) },
    ];
    const plan = resolveServicePlan({
      service: SERVICE,
      staff: { blockedServiceIds: ["sv1"], professionalRoleIds: ["r-color"] },
      bindings,
    });
    expect(plan).toMatchObject({ allowed: false, blocked: true, priceCents: 10000, priceSource: "service" });
  });

  it("surfaces a conflict and falls back to the service default when roles are ambiguous", () => {
    const bindings: StaffRoleBinding[] = [
      { role: role({ id: "r-color", allowedServiceIds: ["sv1"], defaultPriceCents: 12000 }) },
      { role: role({ id: "r-keratin", allowedServiceIds: ["sv1"], defaultPriceCents: 14000 }) },
    ];
    const plan = resolveServicePlan({ service: SERVICE, staff: {}, bindings });
    expect(plan.conflict).toEqual({ reason: "ambiguous-role", roleIds: ["r-color", "r-keratin"] });
    expect(plan.roleId).toBeUndefined();
    expect(plan).toMatchObject({ priceCents: 10000, priceSource: "service", allowed: true });
  });

  it("respects staff serviceIds allowlist for permission", () => {
    const allowed = resolveServicePlan({ service: SERVICE, staff: { serviceIds: ["sv1"] } });
    expect(allowed.allowed).toBe(true);
    const denied = resolveServicePlan({ service: SERVICE, staff: { serviceIds: ["sv9"] } });
    expect(denied.allowed).toBe(false);
  });

  it("allows via a role even when the staff allowlist omits the service", () => {
    const bindings: StaffRoleBinding[] = [
      { role: role({ id: "r-color", allowedServiceIds: ["sv1"] }) },
    ];
    const plan = resolveServicePlan({ service: SERVICE, staff: { serviceIds: ["sv9"] }, bindings });
    expect(plan.allowed).toBe(true);
  });
});
