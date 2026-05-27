/* eslint-disable @typescript-eslint/no-var-requires */
const { matchRows, buildDbIndex, mergeBarcodes } = require("../matcher");
const { parseBarcodesField } = require("../schema");

const DB_ROWS = [
  {
    productId: "cc556aef-9b91",
    brand: "MONTIBELLO",
    series: "CROMATONE",
    familyShade: "LEVEL 9",
    shade: "9.30",
    type: "color",
    packingWeight: 77,
    materialWeight: 60,
    barcodes: '["8429525112349"]',
    ILS: 28,
  },
  {
    productId: "cc556b43-9b91",
    brand: "MONTIBELLO",
    series: "CROMATONE",
    familyShade: "PLATINIUM NACRE",
    shade: "PLATINIUM NACRE",
    type: "color",
    packingWeight: 77,
    materialWeight: 60,
    barcodes: '["8429525200015"]',
    ILS: 28,
  },
];

describe("matcher", () => {
  it("recognises an existing product by brand+series+shade", () => {
    const decided = matchRows(
      [
        {
          brand: "MONTIBELLO",
          series: "CROMATONE",
          shade: "9.30",
          type: "color",
          barcodes: "[]",
          _sourceFile: "x.pdf",
        },
      ],
      DB_ROWS,
    );
    expect(decided[0]._status).toBe("update");
    expect(decided[0]._matchType).toBe("brand-series-shade");
    expect(decided[0].productId).toBe("cc556aef-9b91");
  });

  it("recognises an existing product through DB alias", () => {
    const decided = matchRows(
      [
        {
          brand: "MONTIBELLO",
          series: "CROMATONE",
          shade: "PLATINUM NACRE", // PDF spelling
          type: "color",
          barcodes: "[]",
          _sourceFile: "x.pdf",
        },
      ],
      DB_ROWS,
    );
    expect(decided[0]._matchType).toBe("alias");
    expect(decided[0].productId).toBe("cc556b43-9b91");
  });

  it("flags barcode collisions with another product", () => {
    const decided = matchRows(
      [
        {
          brand: "MONTIBELLO",
          series: "CROMATONE",
          shade: "9.99", // not in DB
          type: "color",
          barcodes: '["8429525112349"]', // already on 9.30
        },
      ],
      DB_ROWS,
    );
    expect(decided[0]._status).toBe("duplicate-risk");
  });

  it("flags duplicate barcode within batch", () => {
    const decided = matchRows(
      [
        {
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          barcodes: '["8429525440757"]',
        },
        {
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.2",
          type: "color",
          barcodes: '["8429525440757"]',
        },
      ],
      [],
    );
    expect(decided[1]._status).toBe("duplicate-risk");
  });

  it("flags new rows missing critical fields as missing-critical-data", () => {
    const decided = matchRows(
      [
        {
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          barcodes: "[]",
        },
      ],
      [],
    );
    expect(decided[0]._status).toBe("missing-critical-data");
  });

  it("treats fully populated new rows as new", () => {
    const decided = matchRows(
      [
        {
          brand: "MONTIBELLO",
          series: "ECLAT",
          shade: "1.1",
          type: "color",
          barcodes: '["8429525440757"]',
          materialWeight: 60,
          packingWeight: 77,
          ILS: 28,
        },
      ],
      [],
    );
    expect(decided[0]._status).toBe("new");
  });

  it("merges barcodes from existing DB into the candidate", () => {
    const merged = mergeBarcodes('["111","222"]', '["222","333"]');
    expect(parseBarcodesField(merged)).toEqual(["111", "222", "333"]);
  });

  it("buildDbIndex produces O(1) lookups", () => {
    const idx = buildDbIndex(DB_ROWS);
    expect(idx.byProductId.has("cc556aef-9b91")).toBe(true);
    expect(idx.byBarcode.has("8429525112349")).toBe(true);
    expect(idx.byKey.has("MONTIBELLO::CROMATONE::9-30")).toBe(true);
  });
});
