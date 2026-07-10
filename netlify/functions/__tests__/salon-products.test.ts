/**
 * Unit tests for the pure helpers behind the salon-scoped product API.
 * These run without a database (default `npm test`). Integration behaviors
 * (auth, tenant isolation, runtime-catalog filtering, overlay) are covered by
 * catalog-stock.integration.test.ts, which requires TEST_DATABASE_URL.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { normalizeSearchTerm, compactSearchTerm, clampLimit, computeStockStatus } = require("../lib/salon-catalog-helpers");

describe("salon-products search normalization", () => {
  it("lowercases, strips accents and punctuation, collapses whitespace", () => {
    expect(normalizeSearchTerm("  L'Oréal   Professionnel!! ")).toBe("l oreal professionnel");
    expect(normalizeSearchTerm("Wella  Koleston")).toBe("wella koleston");
  });

  it("keeps Hebrew characters", () => {
    expect(normalizeSearchTerm("לוריאל")).toBe("לוריאל");
  });

  it("compact form removes all separators for accent/space-insensitive match", () => {
    expect(compactSearchTerm("L'Oréal Professionnel")).toBe("lorealprofessionnel");
    expect(compactSearchTerm("Schwarz kopf")).toBe("schwarzkopf");
  });
});

describe("clampLimit", () => {
  it("uses the fallback for invalid input", () => {
    expect(clampLimit(undefined, 200, 500)).toBe(200);
    expect(clampLimit("abc", 200, 500)).toBe(200);
    expect(clampLimit("0", 200, 500)).toBe(200);
    expect(clampLimit("-5", 200, 500)).toBe(200);
  });

  it("respects a valid value and caps at max", () => {
    expect(clampLimit("50", 200, 500)).toBe(50);
    expect(clampLimit("999", 200, 500)).toBe(500);
  });
});

describe("computeStockStatus (mirrors catalog-stock SQL CASE)", () => {
  it("returns not_tracked when there is no inventory row", () => {
    expect(computeStockStatus({ inInventory: false, unitsInStock: 0, minStock: 0 })).toBe("not_tracked");
    // Even if a stray quantity is present, no row means not tracked.
    expect(computeStockStatus({ inInventory: false, unitsInStock: 10, minStock: 2 })).toBe("not_tracked");
  });

  it("returns out when tracked and at/below zero", () => {
    expect(computeStockStatus({ inInventory: true, unitsInStock: 0, minStock: 3 })).toBe("out");
  });

  it("returns low when tracked and at/below min", () => {
    expect(computeStockStatus({ inInventory: true, unitsInStock: 2, minStock: 3 })).toBe("low");
    expect(computeStockStatus({ inInventory: true, unitsInStock: 3, minStock: 3 })).toBe("low");
  });

  it("returns ok when tracked and above min", () => {
    expect(computeStockStatus({ inInventory: true, unitsInStock: 8, minStock: 3 })).toBe("ok");
  });
});
