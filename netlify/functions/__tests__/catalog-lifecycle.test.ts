/**
 * Unit tests for the pure catalog lifecycle helpers (Phase C).
 * DB-free; run under the default `npm test`.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  CATALOG_STATUSES,
  normalizeCatalogStatus,
  resolveStatusForPatch,
  isArchiveTransition,
  evaluateArchive,
} = require("../lib/catalog-lifecycle");

describe("catalog status lifecycle", () => {
  it("exposes the three-state lifecycle", () => {
    expect(CATALOG_STATUSES).toEqual(["active", "inactive", "archived"]);
  });

  it("normalizes to a valid status or falls back", () => {
    expect(normalizeCatalogStatus("archived", "active")).toBe("archived");
    expect(normalizeCatalogStatus("inactive", "active")).toBe("inactive");
    expect(normalizeCatalogStatus(undefined, "active")).toBe("active");
    expect(normalizeCatalogStatus("deleted", "active")).toBe("active");
    expect(normalizeCatalogStatus(null, "inactive")).toBe("inactive");
  });

  it("keeps the previous status on PATCH when the incoming one is absent/invalid", () => {
    expect(resolveStatusForPatch(undefined, "active")).toBe("active");
    expect(resolveStatusForPatch("garbage", "inactive")).toBe("inactive");
    expect(resolveStatusForPatch("archived", "active")).toBe("archived");
    expect(resolveStatusForPatch("active", "archived")).toBe("active");
  });

  it("detects only fresh archive transitions", () => {
    expect(isArchiveTransition("active", "archived")).toBe(true);
    expect(isArchiveTransition("inactive", "archived")).toBe(true);
    expect(isArchiveTransition("archived", "archived")).toBe(false);
    expect(isArchiveTransition("active", "inactive")).toBe(false);
  });
});

describe("evaluateArchive", () => {
  it("allows archiving when there are no active dependents", () => {
    const result = evaluateArchive([
      { type: "services", count: 0 },
      { type: "categories", count: 0 },
    ]);
    expect(result).toEqual({ allowed: true, blockers: [], action: "none" });
  });

  it("blocks archiving when dependents exist and no action is given", () => {
    const result = evaluateArchive([
      { type: "services", count: 2 },
      { type: "staff", count: 0 },
    ]);
    expect(result.allowed).toBe(false);
    expect(result.action).toBe("blocked");
    expect(result.blockers).toEqual([{ type: "services", count: 2 }]);
  });

  it("allows with cascade / reassign / force", () => {
    const dependents = [{ type: "services", count: 3 }];
    expect(evaluateArchive(dependents, { cascade: true }).action).toBe("cascade");
    expect(evaluateArchive(dependents, { reassign: true }).action).toBe("reassign");
    expect(evaluateArchive(dependents, { force: true }).action).toBe("force");
    expect(evaluateArchive(dependents, { cascade: true }).allowed).toBe(true);
  });

  it("prefers reassign over cascade when both are provided", () => {
    const dependents = [{ type: "services", count: 3 }];
    expect(evaluateArchive(dependents, { cascade: true, reassign: true }).action).toBe("reassign");
  });
});
