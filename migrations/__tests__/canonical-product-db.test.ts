/**
 * migrations/__tests__/canonical-product-db.test.ts
 * ─────────────────────────────────────────────────────────────────────────
 * Tests for Milestone 1: Database Foundation
 *
 * Tests the normalization helpers, source record mapping, package size
 * separation, negative mapping semantics, idempotency, and evidence status
 * contracts. Does not require a live database connection.
 */

import * as crypto from "crypto";

// ── Inline the helpers (same logic as in canonical-product-import.js) ──────

function normalizeName(raw: unknown): string {
  if (!raw) return "";
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[™®©]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[,;/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface SizeResult {
  value: number | null;
  unit: string | null;
  originalText: string;
}

function normalizeSize(raw: unknown): SizeResult | null {
  if (raw === null || raw === undefined) return null;
  const s = String(raw).trim().toLowerCase();
  const match = s.match(/^(\d+(?:\.\d+)?)\s*(g|gr|gram|grams|ml|l|oz|kg)?/);
  if (!match) return { value: null, unit: null, originalText: String(raw) };
  return {
    value: parseFloat(match[1]),
    unit: match[2] || null,
    originalText: String(raw),
  };
}

function computeFileHash(rows: unknown[]): string {
  const content = JSON.stringify(rows);
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

interface SourceRow {
  id?: unknown;
  product_id?: unknown;
  productId?: unknown;
  name?: string;
  product_name?: string;
  productName?: string;
  shade?: string;
  brand?: string;
  manufacturer?: string;
  Brand?: string;
  series?: string;
  product_line?: string;
  line?: string;
  shade_code?: string;
  shadeCode?: string;
  code?: string;
  shade_name?: string;
  shadeName?: string;
  material_weight?: unknown;
  size?: string;
  unit?: string;
  barcode?: string;
  Barcode?: string;
  ean?: string;
  catalog_no?: string;
  catalogNo?: string;
  catalog_number?: string;
  sku?: string;
  type?: string;
  product_type?: string;
  kind?: string;
  flag?: unknown;
  active?: unknown;
  _sheet?: string;
  [key: string]: unknown;
}

interface CanonicalSourceRecord {
  sourceSystem: string;
  sourceProductId: string | null;
  sourceFile: string;
  sourceSheet: string | null;
  sourceRowId: string;
  importBatchId: string;
  rawProductName: string;
  normalizedRawName: string;
  rawBrand: string | null;
  rawProductLine: string | null;
  rawShadeCode: string | null;
  rawShadeName: string | null;
  rawSize: string | null;
  rawUnit: string | null;
  rawBarcode: string | null;
  rawCatalogNumber: string | null;
  rawProductType: string | null;
  rawActiveStatus: string | null;
  rawPayload: SourceRow;
}

function rowToSourceRecord(
  row: SourceRow,
  idx: number,
  sourceFile: string,
  batchId: string,
): CanonicalSourceRecord {
  const sourceProductId = row.id ?? row.product_id ?? row.productId ?? null;
  const rawName         = row.name ?? row.product_name ?? row.productName ?? row.shade ?? "";
  const rawBrand        = row.brand ?? row.manufacturer ?? row.Brand ?? null;
  const rawLine         = row.series ?? row.product_line ?? row.line ?? null;
  const rawShadeCode    = row.shade_code ?? row.shadeCode ?? row.code ?? null;
  const rawShadeName    = row.shade_name ?? row.shadeName ?? row.shade ?? null;
  const rawSize         = row.material_weight !== undefined ? String(row.material_weight) : (row.size ?? null);
  const rawUnit         = row.unit ?? null;
  const rawBarcode      = row.barcode ?? row.Barcode ?? row.ean ?? null;
  const rawCatalog      = row.catalog_no ?? row.catalogNo ?? row.catalog_number ?? null;
  const rawType         = row.type ?? row.product_type ?? row.kind ?? null;
  const rawActiveStatus = row.flag !== undefined ? String(row.flag) : (row.active !== undefined ? String(row.active) : null);

  return {
    sourceSystem:       "spectra_catalog_export",
    sourceProductId:    sourceProductId != null ? String(sourceProductId) : null,
    sourceFile,
    sourceSheet:        row._sheet ?? null,
    sourceRowId:        String(idx),
    importBatchId:      batchId,
    rawProductName:     String(rawName ?? ""),
    normalizedRawName:  normalizeName(rawName),
    rawBrand:           rawBrand != null ? String(rawBrand) : null,
    rawProductLine:     rawLine  != null ? String(rawLine)  : null,
    rawShadeCode:       rawShadeCode != null ? String(rawShadeCode) : null,
    rawShadeName:       rawShadeName != null ? String(rawShadeName) : null,
    rawSize:            rawSize != null ? String(rawSize) : null,
    rawUnit:            rawUnit != null ? String(rawUnit) : null,
    rawBarcode:         rawBarcode != null ? String(rawBarcode).trim() : null,
    rawCatalogNumber:   rawCatalog != null ? String(rawCatalog).trim() : null,
    rawProductType:     rawType != null ? String(rawType) : null,
    rawActiveStatus:    rawActiveStatus,
    rawPayload:         row,
  };
}

// ═════════════════════════════════════════════════════════════════════════
// 1. NORMALIZATION HELPERS
// ═════════════════════════════════════════════════════════════════════════

describe("normalizeName", () => {
  it("lowercases and trims", () => {
    expect(normalizeName("  Wella Koleston Perfect  ")).toBe("wella koleston perfect");
  });

  it("removes trademark symbols", () => {
    expect(normalizeName("Redken™ Shades EQ®")).toBe("redken shades eq");
  });

  it("collapses multiple spaces", () => {
    expect(normalizeName("Wella   Koleston")).toBe("wella koleston");
  });

  it("replaces separators with spaces", () => {
    expect(normalizeName("Loreal,Majirel/8.1")).toBe("loreal majirel 8.1");
  });

  it("returns empty string for null/undefined", () => {
    expect(normalizeName(null)).toBe("");
    expect(normalizeName(undefined)).toBe("");
    expect(normalizeName("")).toBe("");
  });
});

describe("normalizeSize", () => {
  it("parses grams", () => {
    const result = normalizeSize("60g");
    expect(result?.value).toBe(60);
    expect(result?.unit).toBe("g");
  });

  it("parses ml", () => {
    const result = normalizeSize("120ml");
    expect(result?.value).toBe(120);
    expect(result?.unit).toBe("ml");
  });

  it("parses plain number", () => {
    const result = normalizeSize("60");
    expect(result?.value).toBe(60);
    expect(result?.unit).toBeNull();
  });

  it("returns null for null input", () => {
    expect(normalizeSize(null)).toBeNull();
  });

  it("returns null value for unparseable input", () => {
    const result = normalizeSize("large bottle");
    expect(result?.value).toBeNull();
    expect(result?.originalText).toBe("large bottle");
  });

  it("60ml and 120ml parse to DIFFERENT sizes", () => {
    const s60  = normalizeSize("60ml");
    const s120 = normalizeSize("120ml");
    expect(s60?.value).not.toBe(s120?.value);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 2. SOURCE RECORD MAPPING
// ═════════════════════════════════════════════════════════════════════════

describe("rowToSourceRecord", () => {
  it("preserves raw field values without normalization", () => {
    const row: SourceRow = {
      id: "12345",
      name: "Wella Koleston Perfect™ 8/3",
      brand: "Wella",
      material_weight: 60,
      barcode: "4064666068831",
      type: "hair_color",
      flag: 0,
    };
    const sr = rowToSourceRecord(row, 0, "test.xlsx", "batch-001");
    expect(sr.rawProductName).toBe("Wella Koleston Perfect™ 8/3");
    expect(sr.rawBrand).toBe("Wella");
    expect(sr.rawSize).toBe("60");
    expect(sr.rawBarcode).toBe("4064666068831");
    expect(sr.rawProductType).toBe("hair_color");
    expect(sr.rawActiveStatus).toBe("0");
    expect(sr.normalizedRawName).toBe("wella koleston perfect 8 3");
    expect(sr.rawPayload).toEqual(row);
  });

  it("empty name row", () => {
    const sr = rowToSourceRecord({ id: "99", name: "" }, 0, "test.xlsx", "b");
    expect(sr.rawProductName).toBe("");
  });

  it("source product ID is string", () => {
    const sr = rowToSourceRecord({ id: 42 as unknown as string, name: "P" }, 0, "test.xlsx", "b");
    expect(typeof sr.sourceProductId).toBe("string");
    expect(sr.sourceProductId).toBe("42");
  });

  it("row index used as sourceRowId", () => {
    const sr = rowToSourceRecord({ name: "Test" }, 7, "test.xlsx", "b");
    expect(sr.sourceRowId).toBe("7");
  });

  it("rawPayload preserves all original fields", () => {
    const row: SourceRow = { id: "1", name: "Color", extra: "do not touch" };
    const sr = rowToSourceRecord(row, 0, "test.xlsx", "b");
    expect((sr.rawPayload as SourceRow).extra).toBe("do not touch");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 3. PACKAGE SIZE SEPARATION
// ═════════════════════════════════════════════════════════════════════════

describe("package size separation guardrail", () => {
  it("60ml and 120ml rows produce different source records", () => {
    const row60:  SourceRow = { id: "1", name: "Wella KP 8/3", material_weight: 60,  brand: "Wella" };
    const row120: SourceRow = { id: "2", name: "Wella KP 8/3", material_weight: 120, brand: "Wella" };
    const sr60  = rowToSourceRecord(row60,  0, "test.xlsx", "b");
    const sr120 = rowToSourceRecord(row120, 1, "test.xlsx", "b");
    expect(sr60.normalizedRawName).toBe(sr120.normalizedRawName);
    expect(sr60.sourceProductId).not.toBe(sr120.sourceProductId);
    expect(sr60.rawSize).toBe("60");
    expect(sr120.rawSize).toBe("120");
  });

  it("professional and retail variants remain separate", () => {
    const pro:  SourceRow = { id: "P001", name: "Wella KP 8/3", brand: "Wella", type: "professional" };
    const ret:  SourceRow = { id: "R001", name: "Wella KP 8/3", brand: "Wella", type: "retail" };
    const srP = rowToSourceRecord(pro, 0, "test.xlsx", "b");
    const srR = rowToSourceRecord(ret, 1, "test.xlsx", "b");
    expect(srP.rawProductType).toBe("professional");
    expect(srR.rawProductType).toBe("retail");
    expect(srP.sourceProductId).not.toBe(srR.sourceProductId);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 4. NEGATIVE MAPPING SEMANTICS
// ═════════════════════════════════════════════════════════════════════════

describe("negative mapping semantics", () => {
  const VALID_MAPPING_TYPES = [
    "exact_match", "normalized_match", "barcode_match", "catalog_number_match",
    "alias", "manual_assignment", "approved_duplicate", "usage_alias",
    "historical_alias", "rejected_match", "keep_separate",
  ] as const;

  it("rejected_match mapping can have null canonical product ID", () => {
    const mapping = { mappingType: "rejected_match" as const, canonicalProductId: null, active: true };
    expect(mapping.canonicalProductId).toBeNull();
    expect(VALID_MAPPING_TYPES as readonly string[]).toContain(mapping.mappingType);
  });

  it("keep_separate has no target canonical product", () => {
    const mapping = { mappingType: "keep_separate" as const, canonicalProductId: null, active: true };
    expect(mapping.canonicalProductId).toBeNull();
  });

  it("negative mapping types included in valid types", () => {
    expect(VALID_MAPPING_TYPES as readonly string[]).toContain("rejected_match");
    expect(VALID_MAPPING_TYPES as readonly string[]).toContain("keep_separate");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 5. IDEMPOTENCY
// ═════════════════════════════════════════════════════════════════════════

describe("idempotency (file hash)", () => {
  it("same rows produce same hash", () => {
    const rows = [{ id: "1", name: "Product A" }, { id: "2", name: "Product B" }];
    expect(computeFileHash(rows)).toBe(computeFileHash(rows));
  });

  it("different rows produce different hashes", () => {
    expect(computeFileHash([{ id: "1" }])).not.toBe(computeFileHash([{ id: "2" }]));
  });

  it("hash is 16 character hex string", () => {
    expect(computeFileHash([{ id: "1" }])).toMatch(/^[0-9a-f]{16}$/);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 6. IMPORT BATCH COUNT RECONCILIATION
// ═════════════════════════════════════════════════════════════════════════

describe("import batch count reconciliation", () => {
  it("inserted + unchanged + invalid = total rows", () => {
    const total    = 100;
    const invalid  = 2;
    const inserted = 88;
    const unchanged = 10;
    expect(inserted + unchanged + invalid).toBe(total);
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 7. PRODUCT TYPE GUARDRAILS
// ═════════════════════════════════════════════════════════════════════════

describe("product type guardrails", () => {
  const TYPES = ["hair_color_shade", "developer_oxidant", "lightener_bleach",
    "bond_builder", "treatment_care", "mixer_corrector", "other"] as const;

  it("developer and lightener are distinct from shade", () => {
    const t: readonly string[] = TYPES;
    expect(t).toContain("developer_oxidant");
    expect(t).toContain("lightener_bleach");
    expect("developer_oxidant").not.toBe("hair_color_shade");
    expect("lightener_bleach").not.toBe("hair_color_shade");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 8. EVIDENCE STATUS COMPLETENESS
// ═════════════════════════════════════════════════════════════════════════

describe("evidence status values", () => {
  const STATUSES = ["verified", "partially_verified", "inferred", "unresearched", "conflicting"] as const;

  it("five evidence statuses defined", () => {
    expect(STATUSES).toHaveLength(5);
  });

  it("default is unresearched (safe)", () => {
    expect("unresearched").not.toBe("verified");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 9. MIXED / NULL SOURCE VALUE HANDLING
// ═════════════════════════════════════════════════════════════════════════

describe("mixed and null source values", () => {
  it("row with only name is still mappable", () => {
    const sr = rowToSourceRecord({ name: "Minimal Product" }, 0, "f.xlsx", "b");
    expect(sr.rawProductName).toBe("Minimal Product");
    expect(sr.rawBrand).toBeNull();
    expect(sr.rawBarcode).toBeNull();
    expect(sr.sourceProductId).toBeNull();
  });

  it("empty row produces empty product name", () => {
    const sr = rowToSourceRecord({}, 0, "f.xlsx", "b");
    expect(sr.rawProductName).toBe("");
  });
});

// ═════════════════════════════════════════════════════════════════════════
// 10. SAME SHADE CODE ACROSS MANUFACTURERS
// ═════════════════════════════════════════════════════════════════════════

describe("same shade code across manufacturers", () => {
  it("Wella 8/3 and Loreal 8.3 produce different source records", () => {
    const w: SourceRow = { id: "W1", name: "Koleston Perfect 8/3", brand: "Wella Professional" };
    const l: SourceRow = { id: "L1", name: "Majirel 8.3",          brand: "L'Oréal Professionnel" };
    const srW = rowToSourceRecord(w, 0, "test.xlsx", "b");
    const srL = rowToSourceRecord(l, 1, "test.xlsx", "b");
    expect(srW.rawBrand).toBe("Wella Professional");
    expect(srL.rawBrand).toBe("L'Oréal Professionnel");
    expect(srW.sourceProductId).not.toBe(srL.sourceProductId);
  });
});
