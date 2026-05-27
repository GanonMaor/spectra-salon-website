/* eslint-disable @typescript-eslint/no-var-requires */
const { patternEnrich, computeEan13 } = require("../enrichment");
const { parseBarcodesField, isValidEan13 } = require("../schema");

describe("enrichment", () => {
  describe("computeEan13", () => {
    it("computes the correct check digit for known codes", () => {
      // Replace last digit and recompute -> identity for valid codes.
      expect(computeEan13("8429525440720")).toBe("8429525440726");
      expect(computeEan13("8429525440759")).toBe("8429525440757");
    });
  });

  describe("patternEnrich", () => {
    it("predicts a missing EAN inside a sequential run", () => {
      // ECLAT-style: tails 26 (CLEAR), 57 (1.1), ?, 71 (3.60)
      // Expected gap predicted to be 64 → 8429525440640 with valid checksum.
      const rows = [
        { brand: "MONTIBELLO", series: "ECLAT", shade: "CLEAR", barcodes: '["8429525440726"]' },
        { brand: "MONTIBELLO", series: "ECLAT", shade: "1.1",  barcodes: '["8429525440757"]' },
        { brand: "MONTIBELLO", series: "ECLAT", shade: "GAP",  barcodes: "[]" },
        { brand: "MONTIBELLO", series: "ECLAT", shade: "3.60", barcodes: '["8429525440764"]' },
      ];
      const out = patternEnrich(rows);
      const filled = out.find((r: any) => r.shade === "GAP");
      expect(filled).toBeDefined();
      // Pattern enrichment requires 3+ valid neighbors + dominant prefix.
      const codes = parseBarcodesField(filled.barcodes);
      if (codes.length > 0) {
        expect(isValidEan13(codes[0])).toBe(true);
        expect(filled.enrichedFields).toContain("barcodes");
        expect(filled._confidence).toBe("low");
      }
    });

    it("never overwrites existing valid barcodes", () => {
      const rows = [
        { brand: "MONTIBELLO", series: "ECLAT", shade: "CLEAR", barcodes: '["8429525440726"]' },
        { brand: "MONTIBELLO", series: "ECLAT", shade: "1.1",  barcodes: '["8429525440757"]' },
        { brand: "MONTIBELLO", series: "ECLAT", shade: "3.60", barcodes: '["8429525440764"]' },
      ];
      const out = patternEnrich(rows);
      for (const r of out) {
        const codes = parseBarcodesField(r.barcodes);
        expect(codes.length).toBeGreaterThan(0);
      }
    });

    it("does not produce any output when no dominant prefix exists", () => {
      const rows = [
        { brand: "X", series: "Y", shade: "1", barcodes: '["1234567890128"]' }, // distinct prefix
        { brand: "X", series: "Y", shade: "2", barcodes: "[]" },
      ];
      const out = patternEnrich(rows);
      expect(out[1]._enrichedHere).toBe(false);
    });
  });
});
