/**
 * Unit tests for the pure professional-role helpers (Phase B).
 *
 * DB-free; run under the default `npm test`. They lock the server-side rules
 * that keep professional roles well-formed and archivable only under an
 * explicit replacement/force when they are still assigned to staff.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  ProfessionalRoleError,
  STAGE_CAPABILITIES,
  normalizeStageCapabilities,
  normalizeIdList,
  normalizeOptionalInt,
  buildRolePayload,
  buildAssignmentPayload,
  evaluateRoleArchive,
} = require("../lib/professional-roles");

describe("normalizeStageCapabilities", () => {
  it("keeps only known stage keys, de-duplicated", () => {
    expect(normalizeStageCapabilities(["wash", "apply", "wash", "nonsense"])).toEqual(["wash", "apply"]);
  });

  it("collapses non-arrays to an empty list", () => {
    expect(normalizeStageCapabilities(undefined)).toEqual([]);
    expect(normalizeStageCapabilities("wash")).toEqual([]);
    expect(normalizeStageCapabilities(null)).toEqual([]);
  });

  it("exposes the split-stage vocabulary", () => {
    expect(STAGE_CAPABILITIES).toContain("wash");
    expect(STAGE_CAPABILITIES).toContain("apply");
    expect(STAGE_CAPABILITIES).toContain("wait");
  });
});

describe("normalizeIdList", () => {
  it("trims, drops blanks and de-duplicates", () => {
    expect(normalizeIdList([" sv1 ", "sv1", "", "  ", "sv2"])).toEqual(["sv1", "sv2"]);
  });
  it("returns [] for non-arrays", () => {
    expect(normalizeIdList("sv1")).toEqual([]);
    expect(normalizeIdList(undefined)).toEqual([]);
  });
});

describe("normalizeOptionalInt", () => {
  it("distinguishes omitted, cleared, valid and invalid", () => {
    expect(normalizeOptionalInt(undefined)).toBeUndefined();
    expect(normalizeOptionalInt(null)).toBeNull();
    expect(normalizeOptionalInt("")).toBeNull();
    expect(normalizeOptionalInt(1200)).toBe(1200);
    expect(normalizeOptionalInt("1200")).toBe(1200);
    expect(normalizeOptionalInt(12.5)).toBe("invalid");
    expect(normalizeOptionalInt("abc")).toBe("invalid");
  });
});

describe("buildRolePayload", () => {
  it("requires a name on create and normalizes fields", () => {
    expect(buildRolePayload({}, { partial: false }).validationError).toMatch(/name is required/);
    const { fields } = buildRolePayload(
      {
        name: "  Colorist ",
        departmentIds: ["dept-hair", "dept-hair"],
        allowedServiceIds: ["sv1"],
        stageCapabilities: ["apply", "bogus"],
        defaultPriceCents: 15000,
        defaultDurationMinutes: 90,
        color: "#fff",
      },
      { partial: false },
    );
    expect(fields.name).toBe("Colorist");
    expect(fields.departmentIds).toEqual(["dept-hair"]);
    expect(fields.stageCapabilities).toEqual(["apply"]);
    expect(fields.defaultPriceCents).toBe(15000);
    expect(fields.status).toBe("active");
  });

  it("rejects negative or non-integer defaults", () => {
    expect(buildRolePayload({ name: "R", defaultPriceCents: -5 }, { partial: false }).validationError).toMatch(/>= 0/);
    expect(buildRolePayload({ name: "R", defaultDurationMinutes: 1.5 }, { partial: false }).validationError).toMatch(/integer/);
  });

  it("only touches provided fields in partial (PATCH) mode", () => {
    const { fields, validationError } = buildRolePayload({ stageCapabilities: ["wash"] }, { partial: true });
    expect(validationError).toBeUndefined();
    expect(fields).toEqual({ stageCapabilities: ["wash"] });
  });
});

describe("buildAssignmentPayload", () => {
  it("requires both staff and role ids", () => {
    expect(buildAssignmentPayload({ professionalRoleId: "r1" }).validationError).toMatch(/staffMemberId/);
    expect(buildAssignmentPayload({ staffMemberId: "s1" }).validationError).toMatch(/professionalRoleId/);
  });

  it("normalizes primacy signals", () => {
    const { fields } = buildAssignmentPayload({
      staffMemberId: "s1",
      professionalRoleId: "r1",
      isPrimary: "true",
      primaryServiceIds: ["sv1", "sv1"],
      servicePriceOverrides: { sv1: 12000 },
    });
    expect(fields.isPrimary).toBe(true);
    expect(fields.primaryServiceIds).toEqual(["sv1"]);
    expect(fields.servicePriceOverrides).toEqual({ sv1: 12000 });
  });
});

describe("evaluateRoleArchive", () => {
  it("allows archiving an unassigned role", () => {
    expect(evaluateRoleArchive(0).allowed).toBe(true);
  });

  it("blocks archiving an assigned role without an action", () => {
    const decision = evaluateRoleArchive(3);
    expect(decision.allowed).toBe(false);
    expect(decision.blockers).toEqual([{ type: "assignedStaff", count: 3 }]);
  });

  it("allows archiving with reassign (replacement) or force", () => {
    expect(evaluateRoleArchive(3, { reassign: true }).action).toBe("reassign");
    expect(evaluateRoleArchive(3, { force: true }).action).toBe("force");
  });
});

describe("ProfessionalRoleError", () => {
  it("carries a stable code and status", () => {
    const err = new ProfessionalRoleError("BAD", "bad", 400);
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("BAD");
    expect(err.statusCode).toBe(400);
  });
});
