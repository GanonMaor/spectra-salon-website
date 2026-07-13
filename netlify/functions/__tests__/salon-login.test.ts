/**
 * Unit tests for the pure helpers behind salon-login.
 *
 * These run without a database or network (default `npm test`). They lock the
 * auth-recovery contract: deterministic phone normalization, allowlist gating,
 * and non-silent membership resolution (single default among multiple is OK;
 * zero/ambiguous memberships are rejected).
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {
  normalizePhone,
  pickActiveMembership,
  isIdentifierAllowed,
  AuthResolutionError,
} = require("../lib/salon-login-helpers");

describe("normalizePhone (Israeli formats collapse to national significant digits)", () => {
  it("normalizes all supported Maor phone formats to the same value", () => {
    expect(normalizePhone("0504322680")).toBe("504322680");
    expect(normalizePhone("+972504322680")).toBe("504322680");
    expect(normalizePhone("972504322680")).toBe("504322680");
    expect(normalizePhone("504322680")).toBe("504322680");
    expect(normalizePhone("00972504322680")).toBe("504322680");
    expect(normalizePhone("050-432-2680")).toBe("504322680");
  });

  it("returns empty string for emails and blanks", () => {
    expect(normalizePhone("maor@salonos.ai")).toBe("");
    expect(normalizePhone("")).toBe("");
    expect(normalizePhone(null)).toBe("");
    expect(normalizePhone(undefined)).toBe("");
  });
});

describe("isIdentifierAllowed", () => {
  const allowed = ["0504322680", "504322680"]; // as produced by allowedLoginIdentifiers

  it("permits the allowlisted phone in any normalized form", () => {
    expect(isIdentifierAllowed("0504322680", "504322680", allowed)).toBe(true);
    expect(isIdentifierAllowed("+972504322680", "504322680", allowed)).toBe(true);
  });

  it("rejects identifiers outside the allowlist", () => {
    expect(isIdentifierAllowed("0500000000", "500000000", allowed)).toBe(false);
    expect(isIdentifierAllowed("someone@else.com", "", allowed)).toBe(false);
  });

  it("permits anything when the allowlist is empty (legacy behavior)", () => {
    expect(isIdentifierAllowed("0500000000", "500000000", [])).toBe(true);
  });
});

describe("pickActiveMembership (no silent salon selection)", () => {
  const mk = (salon_id: string, is_default: boolean, role = "owner") => ({
    salon_id,
    user_id: "maor-ganon-owner",
    role,
    is_default,
    salon_name: "Maor Ganon",
  });

  it("rejects when there is no active membership", () => {
    const { membership, error } = pickActiveMembership([]);
    expect(membership).toBeNull();
    expect(error).toBeInstanceOf(AuthResolutionError);
    expect(error.code).toBe("NO_ACTIVE_MEMBERSHIP");
    expect(error.statusCode).toBe(403);
  });

  it("resolves a single membership", () => {
    const { membership, error } = pickActiveMembership([mk("clean-salon-504322680", true)]);
    expect(error).toBeNull();
    expect(membership.salon_id).toBe("clean-salon-504322680");
  });

  it("uses the single default when a user has multiple active memberships (Maor's real case)", () => {
    const rows = [
      mk("clean-salon-504322680", true),
      mk("6d53805f-91e9-4ad3-98e7-b01714d06380", false),
    ];
    const { membership, error } = pickActiveMembership(rows);
    expect(error).toBeNull();
    expect(membership.salon_id).toBe("clean-salon-504322680");
  });

  it("rejects as ambiguous when multiple memberships have no single default", () => {
    const rows = [mk("salon-a", false), mk("salon-b", false)];
    const { membership, error } = pickActiveMembership(rows);
    expect(membership).toBeNull();
    expect(error).toBeInstanceOf(AuthResolutionError);
    expect(error.code).toBe("AMBIGUOUS_MEMBERSHIP");
    expect(error.statusCode).toBe(409);
  });

  it("rejects as ambiguous when multiple memberships are all default", () => {
    const rows = [mk("salon-a", true), mk("salon-b", true)];
    const { error } = pickActiveMembership(rows);
    expect(error).toBeInstanceOf(AuthResolutionError);
    expect(error.code).toBe("AMBIGUOUS_MEMBERSHIP");
  });
});
