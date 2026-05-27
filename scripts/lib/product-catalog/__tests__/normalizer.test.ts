/* eslint-disable @typescript-eslint/no-var-requires */
const norm = require("../normalizer");

describe("product-catalog normalizer", () => {
  describe("normalizeShade", () => {
    it("treats . - / as the same separator", () => {
      const a = norm.normalizeShade("10.13");
      const b = norm.normalizeShade("10-13");
      const c = norm.normalizeShade("10/13");
      expect(a.key).toBe(b.key);
      expect(b.key).toBe(c.key);
      expect(a.parts).toEqual([10, 13]);
    });
    it("handles three-digit codes", () => {
      const v = norm.normalizeShade("9.23");
      expect(v.canonical).toBe("9.23");
      expect(v.key).toBe("9-23");
    });
    it("preserves uppercased text shades", () => {
      const v = norm.normalizeShade("Booster Gold");
      expect(v.canonical).toBe("BOOSTER GOLD");
    });
    it("handles empty / null input", () => {
      expect(norm.normalizeShade(null).canonical).toBe("");
      expect(norm.normalizeShade("").canonical).toBe("");
    });
  });

  describe("normalizeBrand", () => {
    it("maps known aliases", () => {
      expect(norm.normalizeBrand("L'Oreal")).toBe("LOREAL");
      expect(norm.normalizeBrand("loreal")).toBe("LOREAL");
      expect(norm.normalizeBrand("Montibello")).toBe("MONTIBELLO");
    });
    it("uppercases unknown brands", () => {
      expect(norm.normalizeBrand("Some Brand")).toBe("SOME BRAND");
    });
  });

  describe("rowKey", () => {
    it("normalizes brand+series+shade into a stable key", () => {
      const a = norm.rowKey({ brand: "Montibello", series: "Cromatone", shade: "9.23" });
      const b = norm.rowKey({ brand: "MONTIBELLO", series: "CROMATONE", shade: "9-23" });
      expect(a).toBe(b);
      expect(a).toBe("MONTIBELLO::CROMATONE::9-23");
    });
  });

  describe("applyShadeAlias", () => {
    it("rewrites known DB typos", () => {
      const r = norm.applyShadeAlias("PLATINUM NACRE");
      expect(r.aliasApplied).toBe(true);
      expect(r.canonical).toBe("PLATINIUM NACRE");
    });
    it("passes unknown shades through", () => {
      const r = norm.applyShadeAlias("9.23");
      expect(r.aliasApplied).toBe(false);
      expect(r.canonical).toBe("9.23");
    });
  });

  describe("normalizeWeightToGrams", () => {
    it("converts kg, g, oz", () => {
      expect(norm.normalizeWeightToGrams("60g")).toBe(60);
      expect(norm.normalizeWeightToGrams("0.06kg")).toBeCloseTo(60, 2);
      expect(norm.normalizeWeightToGrams("2oz")).toBeCloseTo(56.6991, 2);
      expect(norm.normalizeWeightToGrams("60ml")).toBe(60);
      expect(norm.normalizeWeightToGrams(60)).toBe(60);
    });
    it("returns null for junk", () => {
      expect(norm.normalizeWeightToGrams("abc")).toBe(null);
      expect(norm.normalizeWeightToGrams(null)).toBe(null);
    });
  });

  describe("normalizePrice", () => {
    it("strips currency symbols", () => {
      expect(norm.normalizePrice("₪28")).toBe(28);
      expect(norm.normalizePrice("28 ILS")).toBe(28);
      expect(norm.normalizePrice("28,50")).toBe(28.5);
    });
  });
});
