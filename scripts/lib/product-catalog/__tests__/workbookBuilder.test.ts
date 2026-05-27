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
    catalogNo: "MONT-CR-9.30",
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
  {
    productId: null,
    brand: "WELLA",
    series: "COLOR TOUCH",
    familyShade: null,
    shade: "8/0",
    image: null,
    catalogNo: null,
    hairColor: null,
    type: "color",
    packingWeight: null,
    materialWeight: null,
    barcodes: '["050000000019"]',
    ILS: null,
    _status: "duplicate-risk",
    _issues: [],
    sources: ["request_text"],
    enrichedFields: [],
    enrichmentSources: [],
  },
];

describe("workbook builder", () => {
  it("emits one mixed import sheet matching the DB layout", async () => {
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
      dbContext: {
        fileName: "products_1779818155619.xlsx",
        rowCount: 32828,
        brands: ["MONTIBELLO", "WELLA"],
        seriesByBrand: {},
        sheetName: "Sheet1",
        originalHeaders: [
          "productId",
          "brand",
          "series",
          "familyShade",
          "shade",
          "image",
          "catalogNo",
          "hairColor",
          "type",
          "packingWeight",
          "materialWeight",
          "barcodes",
          "ILS",
        ],
      },
    });
    expect(Buffer.isBuffer(buf)).toBe(true);
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);

    // Sheet 1 must be the import-ready sheet, named exactly like DB.
    const importSheet = wb.worksheets[0];
    expect(importSheet).toBeDefined();
    expect(importSheet.name).toBe("Sheet1");

    const headerRow = importSheet.getRow(1).values as any[];
    expect(headerRow.slice(1, 14)).toEqual([
      "productId",
      "brand",
      "series",
      "familyShade",
      "shade",
      "image",
      "catalogNo",
      "hairColor",
      "type",
      "packingWeight",
      "materialWeight",
      "barcodes",
      "ILS",
    ]);

    // duplicate-risk rows are held back.
    expect(importSheet.rowCount).toBe(3); // header + new + update
    const newRow = importSheet.getRow(2).values as any[];
    const updateRow = importSheet.getRow(3).values as any[];

    // new row: productId blank, shade text-formatted
    expect(newRow[1]).toBe("");
    expect(newRow[2]).toBe("MONTIBELLO");
    expect(newRow[5]).toBe("1.1");
    expect(newRow[12]).toBe('["8429525440757"]');

    // shade cell must be text format so excel doesn't coerce 1.1 -> 1.1 number
    expect(importSheet.getCell("E2").numFmt).toBe("@");
    // packingWeight column should be numeric
    expect(importSheet.getCell("J2").value).toBe(77);
    expect(importSheet.getCell("J2").numFmt === "@" ? "text" : "ok").toBe("ok");

    // update row: productId populated, catalogNo populated
    expect(updateRow[1]).toBe("cc556aef-9b91");
    expect(updateRow[7]).toBe("MONT-CR-9.30");
    // barcodes blank but stored as []
    expect(updateRow[12]).toBe("[]");
    // productId cell is text-safe so UUIDs survive
    expect(importSheet.getCell("A3").numFmt).toBe("@");

    // No legacy split sheets.
    expect(wb.getWorksheet("new_products_to_import")).toBeUndefined();
    expect(wb.getWorksheet("existing_products_to_update")).toBeUndefined();

    // Audit + supplementary sheets still exist.
    for (const name of [
      "audit_summary",
      "barcode_gaps",
      "ai_sources",
      "needs_review",
      "format_reference",
    ]) {
      expect(wb.getWorksheet(name)).toBeDefined();
    }

    const review = wb.getWorksheet("needs_review");
    expect(review).toBeDefined();
    if (!review) return;
    expect(review.rowCount).toBeGreaterThanOrEqual(2); // duplicate-risk row recorded
  });

  it("preserves leading zeros in barcodes", async () => {
    const buf = await buildWorkbookBuffer({
      rows: [
        {
          productId: "abc-123",
          brand: "JOICO",
          series: "LUMISHINE",
          shade: "1.5% 5 Vol.",
          type: "developer",
          materialWeight: 946,
          ILS: 73.5,
          barcodes: '["074469495462"]',
          _status: "update",
        },
      ],
      dbContext: {
        sheetName: "Sheet1",
        originalHeaders: [
          "productId",
          "brand",
          "series",
          "familyShade",
          "shade",
          "image",
          "catalogNo",
          "hairColor",
          "type",
          "packingWeight",
          "materialWeight",
          "barcodes",
          "ILS",
        ],
      },
    });
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buf);
    const sheet = wb.getWorksheet("Sheet1");
    expect(sheet).toBeDefined();
    if (!sheet) return;
    const cell = sheet.getCell("L2");
    expect(cell.numFmt).toBe("@");
    expect(cell.value).toBe('["074469495462"]');
    // shade like "1.5% 5 Vol." stays a string, not a date or float.
    const shadeCell = sheet.getCell("E2");
    expect(shadeCell.numFmt).toBe("@");
    expect(shadeCell.value).toBe("1.5% 5 Vol.");
  });
});
