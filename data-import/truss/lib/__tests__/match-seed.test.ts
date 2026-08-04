/* eslint-disable @typescript-eslint/no-var-requires */
const { matchSeedToPdf } = require("../match-seed");

describe("TRUSS seed matching", () => {
  it("matches by exact EAN and never by name alone", () => {
    const pdf = [
      {
        ean_barcode: "7898625795745",
        trs_code: "TRS-8402",
        product_line: "BLOND REVOLUTION",
        normalized_product_name: "BLOND REVOLUTION IMPASSABLE BLOND FINISHER",
        size_value: 100,
        size_unit: "ML",
        shade_code: null,
      },
    ];
    const seed = [
      {
        id: "seed-ean",
        barcode: "7898625795745",
        barcodes: ["7898625795745"],
        catalogNo: "tpxxx",
        series: "OTHER",
        shade: "REV IMPASSABLE BLOND",
        type: "treatment",
        materialWeight: 100,
      },
      {
        id: "seed-name-only",
        barcode: "",
        barcodes: [],
        catalogNo: "tpzzz",
        series: "BLOND REVOLUTION",
        shade: "IMPASSABLE",
        type: "treatment",
        materialWeight: 100,
      },
    ];
    const report = matchSeedToPdf(pdf, seed);
    expect(report.matched).toBe(1);
    expect(report.results.find((r) => r.seed_id === "seed-ean").match_method).toBe("exact_ean");
    expect(report.results.find((r) => r.seed_id === "seed-name-only").match_status).toBe("needs_review");
  });
});
