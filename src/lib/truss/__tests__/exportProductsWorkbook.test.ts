import {
  PRODUCTS_XLSX_COLUMNS,
  existingRowToXlsx,
  fillMissingFields,
  mergeExistingWithPdfCatalog,
  pdfToXlsxRow,
  resolveExportProductId,
} from "../exportProductsWorkbook";

describe("TRUSS products.xlsx export", () => {
  it("uses the canonical products_*.xlsx column order", () => {
    expect([...PRODUCTS_XLSX_COLUMNS]).toEqual([
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
  });

  it("leaves productId blank for synthetic cprod ids", () => {
    expect(resolveExportProductId({ id: "cprod-truss-trs-8557" })).toBe("");
  });

  it("keeps existing productId and fills empty catalogNo from PDF TRS", () => {
    const existing = [
      {
        productId: "5c2b8bff-f689-11ee-bea2-6045bd925463",
        brand: "TRUSS PROFESSIONAL",
        series: "BLEACH POWDER",
        familyShade: "BLEACH POWDER",
        shade: "8X Powder",
        image: "7898625790382.png",
        catalogNo: "",
        hairColor: "",
        type: "bleach",
        packingWeight: null,
        materialWeight: 200,
        barcodes: '["7898625790382"]',
        ILS: 327,
      },
    ];

    const { rows, stats } = mergeExistingWithPdfCatalog(existing, [
      {
        id: "cprod-truss-trs-7695",
        product_line: "LIGHTENING",
        category: "BLEACH",
        display_name: "LIGHTENING - 8X BLEACH POWDER 200G",
        product_type: "bleach",
        size_value: 200,
        trs_code: "TRS-7695",
        ean_barcode: "7898625790382",
      },
    ]);

    expect(stats.existing).toBe(1);
    expect(stats.completed).toBe(1);
    expect(stats.addedNew).toBe(0);
    expect(rows[0].productId).toBe("5c2b8bff-f689-11ee-bea2-6045bd925463");
    expect(rows[0].catalogNo).toBe("TRS-7695");
    expect(rows[0].image).toBe("7898625790382.png"); // not overwritten
    expect(rows[0].series).toBe("BLEACH POWDER"); // existing kept
  });

  it("appends PDF-only products with blank productId", () => {
    const { rows, stats } = mergeExistingWithPdfCatalog([], [
      {
        id: "cprod-truss-trs-8557",
        product_line: "BASIC",
        category: "CONDITIONER",
        display_name: "BASIC CONDITIONER 2400ML",
        product_type: "conditioner",
        size_value: 2400,
        trs_code: "TRS-8557",
        ean_barcode: "7898625796056",
      },
    ]);
    expect(stats.addedNew).toBe(1);
    expect(rows[0].productId).toBe("");
    expect(rows[0].catalogNo).toBe("TRS-8557");
    expect(rows[0].barcodes).toBe('["7898625796056"]');
  });

  it("does not overwrite non-empty catalogNo", () => {
    const base = existingRowToXlsx({
      productId: "fcee3fbf-74cb-11ee-8c6a-6045bd925463",
      catalogNo: "tpalb00",
      barcodes: '["7898625790399"]',
      series: "AIR.LIBRE",
      shade: "FREE HAND TECHNIQUE",
      type: "bleach",
    });
    const donor = pdfToXlsxRow({
      trs_code: "TRS-7505",
      ean_barcode: "7898625790399",
      product_line: "LIGHTENING",
      display_name: "OTHER NAME",
    });
    const filled = fillMissingFields(base, donor);
    expect(filled.catalogNo).toBe("tpalb00");
    expect(filled.productId).toBe("fcee3fbf-74cb-11ee-8c6a-6045bd925463");
  });
});
