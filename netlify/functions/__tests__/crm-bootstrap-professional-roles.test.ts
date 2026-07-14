/**
 * DB-free unit tests for the Phase B professional-role derivation in
 * crm-bootstrap. They lock the row → payload mapping and the staff↔role
 * `professionalRoleIds` derivation (primary-first ordering, de-duplication,
 * and the no-assignment case) without needing a database connection.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  attachProfessionalRoleIds,
  rowToProfessionalRole,
  rowToStaffProfessionalRole,
} = require("../lib/crm-bootstrap-helpers");

describe("rowToProfessionalRole", () => {
  it("maps snake_case columns and defaults", () => {
    const role = rowToProfessionalRole({
      id: "sprole-1",
      salon_id: "salon-1",
      name: "Colorist",
      department_ids: ["dept-hair"],
      allowed_service_ids: ["sv-color"],
      stage_capabilities: ["service", "apply"],
      default_price_cents: 18000,
      default_duration_minutes: null,
      color: "#D7897F",
      icon: null,
      sort_order: 2,
      status: "active",
    });
    expect(role).toMatchObject({
      id: "sprole-1",
      salonId: "salon-1",
      name: "Colorist",
      departmentIds: ["dept-hair"],
      allowedServiceIds: ["sv-color"],
      stageCapabilities: ["service", "apply"],
      defaultPriceCents: 18000,
      defaultDurationMinutes: null,
      color: "#D7897F",
      icon: null,
      sortOrder: 2,
      status: "active",
    });
  });

  it("defaults absent jsonb columns to empty arrays", () => {
    const role = rowToProfessionalRole({ id: "r", salon_id: "s", name: "R", status: "active" });
    expect(role.departmentIds).toEqual([]);
    expect(role.allowedServiceIds).toEqual([]);
    expect(role.stageCapabilities).toEqual([]);
    expect(role.sortOrder).toBe(0);
  });
});

describe("rowToStaffProfessionalRole", () => {
  it("maps the assignment primacy signals", () => {
    const assignment = rowToStaffProfessionalRole({
      id: "ssprole-1",
      salon_id: "salon-1",
      staff_member_id: "staff-1",
      professional_role_id: "sprole-1",
      is_primary: true,
      primary_service_ids: ["sv-color"],
      service_price_overrides: { "sv-color": 20000 },
    });
    expect(assignment).toMatchObject({
      id: "ssprole-1",
      salonId: "salon-1",
      staffMemberId: "staff-1",
      professionalRoleId: "sprole-1",
      isPrimary: true,
      primaryServiceIds: ["sv-color"],
      servicePriceOverrides: { "sv-color": 20000 },
    });
  });
});

describe("attachProfessionalRoleIds", () => {
  it("derives professionalRoleIds, primary role first and de-duplicated", () => {
    const staff = [
      { id: "staff-1", professionalRoleIds: [] },
      { id: "staff-2", professionalRoleIds: [] },
    ];
    const assignments = [
      { staffMemberId: "staff-1", professionalRoleId: "sprole-color", isPrimary: false },
      { staffMemberId: "staff-1", professionalRoleId: "sprole-keratin", isPrimary: true },
      // duplicate role id for the same staff member is collapsed
      { staffMemberId: "staff-1", professionalRoleId: "sprole-color", isPrimary: false },
    ];

    attachProfessionalRoleIds(staff, assignments);

    // Primary ("sprole-keratin") sorts ahead of the non-primary color role.
    expect(staff[0].professionalRoleIds).toEqual(["sprole-keratin", "sprole-color"]);
    // Staff with no assignment gets an empty list.
    expect(staff[1].professionalRoleIds).toEqual([]);
  });

  it("is a no-op for empty staff and ignores malformed assignments", () => {
    expect(attachProfessionalRoleIds([], [])).toEqual([]);
    const staff = [{ id: "staff-1", professionalRoleIds: [] }];
    attachProfessionalRoleIds(staff, [
      { staffMemberId: null, professionalRoleId: "x" },
      { staffMemberId: "staff-1", professionalRoleId: null },
    ]);
    expect(staff[0].professionalRoleIds).toEqual([]);
  });
});
