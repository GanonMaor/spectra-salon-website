/* eslint-disable @typescript-eslint/no-var-requires */
const XLSX = require("xlsx");
const { parseExcelBuffer, looksLikeImportSchema } = require("../excel-parser");

function makeWorkbook(rows: any[][]): Buffer {
  const ws = XLSX.utils.aoa_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

describe("excel parser", () => {
  it("recognises the canonical import schema", () => {
    expect(
      looksLikeImportSchema([
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
      ]),
    ).toBe(true);
    expect(looksLikeImportSchema(["foo", "bar"])).toBe(false);
  });

  it("parses canonical workbooks into normalized rows", () => {
    const buf = makeWorkbook([
      [
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
      [
        "abc-123",
        "MONTIBELLO",
        "ECLAT",
        "LEVEL 1",
        "1.1",
        null,
        null,
        null,
        "color",
        77,
        60,
        '["8429525440757"]',
        28,
      ],
    ]);
    const result = parseExcelBuffer(buf, { fileName: "products.xlsx" });
    expect(result.format).toBe("canonical");
    expect(result.rows).toHaveLength(1);
    const r = result.rows[0];
    expect(r.brand).toBe("MONTIBELLO");
    expect(r.series).toBe("ECLAT");
    expect(r.shade).toBe("1.1");
    expect(r.barcodes).toBe('["8429525440757"]');
    expect(r._rowKey).toBe("MONTIBELLO::ECLAT::1-1");
  });

  it("falls back to freeform parsing for unknown schemas", () => {
    const buf = makeWorkbook([
      ["Color", "EAN", "Price (ILS)"],
      ["1.1", "8429525440757", "28"],
      ["3.60", "8429525440764", "30"],
    ]);
    const result = parseExcelBuffer(buf, {
      fileName: "supplier.xlsx",
      defaultBrand: "MONTIBELLO",
      defaultSeries: "ECLAT",
      defaultType: "color",
    });
    expect(result.format).toBe("freeform");
    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].brand).toBe("MONTIBELLO");
    expect(result.rows[0].shade).toBe("1.1");
    expect(result.rows[0].ILS).toBe(28);
    expect(result.rows[0].barcodes).toBe('["8429525440757"]');
  });
});
