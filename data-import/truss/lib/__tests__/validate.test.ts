/* eslint-disable @typescript-eslint/no-var-requires */
const { validateRecords } = require("../validate");

describe("TRUSS validateRecords", () => {
  it("flags duplicate EAN and invalid check digits", () => {
    const records = [
      {
        source_pdf_page: 1,
        trs_code: "TRS-1",
        ean_barcode: "7898625796056",
        qr_decoded: true,
        source_status: "extracted",
        normalized_product_name: "BASIC CONDITIONER",
        size_display: "2400ML",
        product_line: "BASIC",
        category: "CONDITIONER",
      },
      {
        source_pdf_page: 2,
        trs_code: "TRS-2",
        ean_barcode: "7898625796056",
        qr_decoded: true,
        source_status: "extracted",
        normalized_product_name: "BASIC CONDITIONER",
        size_display: "300ML",
        product_line: "BASIC",
        category: "CONDITIONER",
      },
      {
        source_pdf_page: 3,
        trs_code: "TRS-3",
        ean_barcode: "7898625796050",
        qr_decoded: true,
        source_status: "extracted",
        normalized_product_name: "BASIC SHAMPOO",
        size_display: "300ML",
        product_line: "BASIC",
        category: "SHAMPOO",
      },
    ];
    const report = validateRecords(records);
    expect(report.issues.duplicate_ean).toHaveLength(1);
    expect(report.issues.invalid_ean).toHaveLength(1);
    expect(report.issues.same_name_different_size.length).toBeGreaterThanOrEqual(1);
  });
});
