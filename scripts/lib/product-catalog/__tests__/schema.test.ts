/* eslint-disable @typescript-eslint/no-var-requires */
const schema = require("../schema");

describe("product-catalog schema", () => {
  describe("isValidEan13", () => {
    it("accepts known-valid EAN-13s", () => {
      // ECLAT shades that we validated by hand earlier.
      const valid = [
        "8429525440726", // CLEAR
        "8429525440757", // 1-1
        "8429525446209", // 10-13
        "5000112637922", // randomly chosen valid Coca-Cola style code
      ];
      for (const code of valid) {
        expect(schema.isValidEan13(code)).toBe(true);
      }
    });
    it("rejects mistyped or wrong-length codes", () => {
      expect(schema.isValidEan13("0000000000000")).toBe(true); // edge: all zeros valid
      expect(schema.isValidEan13("8429525440727")).toBe(false); // wrong check digit
      expect(schema.isValidEan13("123")).toBe(false);
      expect(schema.isValidEan13("84295254407abc")).toBe(false);
      expect(schema.isValidEan13(null as any)).toBe(false);
    });
  });

  describe("isValidUpcA", () => {
    it("validates UPC-A check digits", () => {
      // 12-digit Coca-Cola US: 049000050103
      expect(schema.isValidUpcA("049000050103")).toBe(true);
      expect(schema.isValidUpcA("049000050100")).toBe(false);
    });
  });

  describe("parseBarcodesField", () => {
    it("parses JSON array strings", () => {
      expect(schema.parseBarcodesField('["8429525440726"]')).toEqual(["8429525440726"]);
    });
    it("parses comma-separated strings", () => {
      expect(schema.parseBarcodesField("8429525440726, 5000112637922")).toEqual([
        "8429525440726",
        "5000112637922",
      ]);
    });
    it("dedupes", () => {
      expect(schema.parseBarcodesField('["111", "111", "222"]')).toEqual(["111", "222"]);
    });
    it("returns [] for empty/null", () => {
      expect(schema.parseBarcodesField(null)).toEqual([]);
      expect(schema.parseBarcodesField("")).toEqual([]);
      expect(schema.parseBarcodesField("[]")).toEqual([]);
    });
  });

  describe("stringifyBarcodes", () => {
    it("produces canonical JSON", () => {
      expect(schema.stringifyBarcodes(["8429525440726"])).toBe('["8429525440726"]');
      expect(schema.stringifyBarcodes([])).toBe("[]");
    });
  });

  describe("validateRow", () => {
    it("flags new rows that have a productId", () => {
      const warnings = schema.validateRow(
        schema.emptyRow({
          productId: "abc",
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          barcodes: '["8429525440757"]',
        }),
        "new",
      );
      expect(warnings.some((w: any) => w.code === "PRODUCT_ID_ON_NEW_ROW")).toBe(true);
    });
    it("flags update rows missing productId", () => {
      const warnings = schema.validateRow(
        schema.emptyRow({
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          barcodes: "[]",
        }),
        "update",
      );
      expect(warnings.some((w: any) => w.code === "PRODUCT_ID_MISSING")).toBe(true);
    });
    it("flags missing brand/series/shade", () => {
      const warnings = schema.validateRow({}, "new");
      expect(warnings.some((w: any) => w.code === "MISSING_BRAND")).toBe(true);
      expect(warnings.some((w: any) => w.code === "MISSING_SERIES")).toBe(true);
      expect(warnings.some((w: any) => w.code === "MISSING_SHADE")).toBe(true);
    });
    it("flags invalid EAN check digits", () => {
      const warnings = schema.validateRow(
        schema.emptyRow({
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          barcodes: '["8429525440727"]', // bad check digit
        }),
        "new",
      );
      expect(warnings.some((w: any) => w.code === "BARCODE_CHECKDIGIT")).toBe(true);
    });
    it("flags non-positive numerics", () => {
      const warnings = schema.validateRow(
        schema.emptyRow({
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          ILS: -3,
          barcodes: '["8429525440757"]',
        }),
        "new",
      );
      expect(warnings.some((w: any) => w.code === "INVALID_NUMERIC_ILS")).toBe(true);
    });
  });
});
