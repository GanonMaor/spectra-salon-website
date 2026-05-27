/* eslint-disable @typescript-eslint/no-var-requires */
const {
  saveSnapshot,
  loadSnapshot,
  clearSnapshot,
  toPublicMeta,
} = require("../db-snapshot");

describe("db-snapshot in-memory fallback", () => {
  beforeEach(async () => {
    await clearSnapshot();
  });

  it("round-trips snapshot meta in the in-memory fallback", async () => {
    const meta = await saveSnapshot({
      fileName: "products_test.xlsx",
      sheetName: "Sheet1",
      uploadedAt: "2026-05-27T01:00:00Z",
      rowCount: 2,
      originalHeaders: ["productId", "brand", "series"],
      rows: [
        { productId: "u1", brand: "JOICO", series: "LUMISHINE" },
        { productId: "u2", brand: "MONTIBELLO", series: "ECLAT" },
      ],
      brands: ["JOICO", "MONTIBELLO"],
      seriesByBrand: { JOICO: ["LUMISHINE"], MONTIBELLO: ["ECLAT"] },
    });
    expect(meta.fileName).toBe("products_test.xlsx");
    expect(meta.savedAt).toBeDefined();

    const loaded = await loadSnapshot();
    expect(loaded.meta).not.toBeNull();
    expect(loaded.meta.rows).toHaveLength(2);
    expect(loaded.meta.originalHeaders).toEqual([
      "productId",
      "brand",
      "series",
    ]);

    const pub = toPublicMeta(loaded.meta);
    expect(pub).toMatchObject({
      fileName: "products_test.xlsx",
      sheetName: "Sheet1",
      rowCount: 2,
      brands: ["JOICO", "MONTIBELLO"],
    });
    expect((pub as any).rows).toBeUndefined();
  });

  it("clearSnapshot wipes the in-memory copy", async () => {
    await saveSnapshot({
      fileName: "x.xlsx",
      sheetName: "Sheet1",
      uploadedAt: new Date().toISOString(),
      rowCount: 1,
      originalHeaders: ["productId"],
      rows: [{ productId: "u1" }],
    });
    await clearSnapshot();
    const loaded = await loadSnapshot();
    expect(loaded.meta).toBeNull();
  });

  it("toPublicMeta is null-safe", () => {
    expect(toPublicMeta(null)).toBeNull();
    expect(toPublicMeta(undefined)).toBeNull();
  });
});
