/* eslint-disable @typescript-eslint/no-var-requires */
const ExcelJS = require("exceljs");
const { buildWorkbookBuffer } = require("../workbook-builder");

const SAMPLE_ROWS = [
  {
    productId: null,
    brand: "MONTIBELLO",
    series: "ECLAT",
    familyShade: "LEVEL 1",
    shade: "1.1",
    image: null,
    catalogNo: null,
    hairColor: null,
    type: "color",
    packingWeight: 77,
    materialWeight: 60,
    barcodes: '["8429525440757"]',
    ILS: 28,
    _status: "new",
    _issues: [],
    sources: ["ECLAT.pdf"],
    enrichedFields: [],
    enrichmentSources: [],
  },
  {
    productId: "cc556aef-9b91",
    brand: "MONTIBELLO",
    series: "CROMATONE",
    familyShade: "LEVEL 9",
    shade: "9.30",
    image: "montibello_cromatone.png",
    catalogNo: null,
    hairColor: null,
    type: "color",
    packingWeight: 77,
    materialWeight: 60,
    barcodes: "[]",
    ILS: 28,
    _status: "update",
    _issues: [],
    sources: ["CROMATONE.pdf"],
    enrichedFields: [],
    enrichmentSources: [],
  },
];

describe("workbook builder", () => {
  it("produces a workbook with the expected sheets and rows", async () => {
    const buf = await buildWorkbookBuffer({
      rows: SAMPLE_ROWS,
      options: { mode: "audit" },
      jobId: "test-job-id",
      enrichmentSources: [
        {
          rowKey: "MONTIBELLO::ECLAT::1-1",
          field: "barcodes",
          value: "8429525440757",
          confidence: "high",
          domain: "lokikoki.pl",
          url: "https://lokikoki.pl/eclat-1-1",
          reason: "2 sources",
        },
      ],
      dbContext: { fileName: "products.xlsx", rowCount: 2, brands: ["MONTIBELLO"], seriesByBrand: {} },
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
    expect(buf.length).toBeGreaterThan(2000);

    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);

    const expected = [
      "audit_summary",
      "new_products_to_import",
      "existing_products_to_update",
      "barcode_gaps",
      "ai_sources",
      "format_reference",
    ];
    for (const name of expected) {
      expect(wb.getWorksheet(name)).toBeDefined();
    }

    const newSheet = wb.getWorksheet("new_products_to_import");
    expect(newSheet).toBeDefined();
    if (!newSheet) return;
    // header row + 1 new row
    expect(newSheet.rowCount).toBe(2);
    const newRowValues = newSheet.getRow(2).values as any[];
    // exceljs values is 1-indexed
    expect(newRowValues[2]).toBe("MONTIBELLO"); // brand col (index 2 because productId is col 1)

    const updateSheet = wb.getWorksheet("existing_products_to_update");
    expect(updateSheet).toBeDefined();
    if (!updateSheet) return;
    expect(updateSheet.rowCount).toBe(2);
    const upRow = updateSheet.getRow(2).values as any[];
    expect(upRow[1]).toBe("cc556aef-9b91");

    const gaps = wb.getWorksheet("barcode_gaps");
    expect(gaps).toBeDefined();
    if (!gaps) return;
    expect(gaps.rowCount).toBe(2); // header + 1 gap row

    const sources = wb.getWorksheet("ai_sources");
    expect(sources).toBeDefined();
    if (!sources) return;
    expect(sources.rowCount).toBe(2);

    const fmt = wb.getWorksheet("format_reference");
    expect(fmt).toBeDefined();
    if (!fmt) return;
    expect(fmt.rowCount).toBeGreaterThanOrEqual(13); // header + 13 columns
  });
});
