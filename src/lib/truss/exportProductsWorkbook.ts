/**
 * Export TRUSS catalog rows in the canonical Spectra products_*.xlsx format.
 *
 * Column order matches:
 *   - scripts/lib/product-catalog/schema.js → IMPORT_COLUMNS
 *   - products_*.xlsx DB export (e.g. products_1781528628322.xlsx)
 *
 * Merge rules (existing file + PDF catalog):
 * 1. Keep every existing TRUSS row and its productId UUID when present.
 * 2. Fill ONLY empty fields from a PDF match (EAN first, then TRS/catalogNo).
 * 3. Never overwrite an existing non-empty productId / catalogNo / image / barcodes.
 * 4. PDF-only products are appended with blank productId (new rows).
 */

import ExcelJS from "exceljs";

export const PRODUCTS_XLSX_COLUMNS = [
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
] as const;

export type ProductsXlsxColumn = (typeof PRODUCTS_XLSX_COLUMNS)[number];

export type ProductsXlsxRow = Record<ProductsXlsxColumn, string | number | null>;

export type ExistingProductsRow = Partial<Record<ProductsXlsxColumn, string | number | null>> & {
  productId?: string | null;
  brand?: string | null;
  barcodes?: string | null;
  catalogNo?: string | null;
};

export type TrussExportSource = {
  id?: string | null;
  brand?: string | null;
  product_line?: string | null;
  category?: string | null;
  display_name?: string | null;
  supplier_name?: string | null;
  official_name?: string | null;
  product_type?: string | null;
  shade_code?: string | null;
  shade_name?: string | null;
  size_value?: number | null;
  size_unit?: string | null;
  trs_code?: string | null;
  ean_barcode?: string | null;
  primary_image_path?: string | null;
  seed_matches?: Array<{ seed_id?: string | null; method?: string | null }> | null;
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_TYPES = new Set([
  "color",
  "developer",
  "bleach",
  "toner",
  "treatment",
  "shampoo",
  "conditioner",
  "mask",
  "other",
]);

function isBlank(value: unknown): boolean {
  return value == null || String(value).trim() === "";
}

function asText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function parseBarcodes(value: unknown): string[] {
  if (value == null || value === "") return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  const raw = String(value).trim();
  if (!raw || raw === "[]") return [];
  if (raw.startsWith("[")) {
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr.map((v) => String(v).trim()).filter(Boolean);
    } catch {
      /* fall through */
    }
  }
  return raw.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
}

function stringifyBarcodes(codes: string[]): string {
  return JSON.stringify([...new Set(codes.map((c) => String(c).trim()).filter(Boolean))]);
}

function imageFilename(path: string | null | undefined): string {
  if (!path) return "";
  return path.split("/").pop() || "";
}

function mapType(type: string | null | undefined): string {
  const t = String(type || "other").toLowerCase();
  return ALLOWED_TYPES.has(t) ? t : "other";
}

/** Only real catalog UUIDs count as productId — never synthetic cprod-* ids. */
export function resolveExportProductId(product: TrussExportSource): string {
  const fromSeed = product.seed_matches?.find((m) => m?.seed_id && UUID_RE.test(String(m.seed_id)))
    ?.seed_id;
  if (fromSeed && UUID_RE.test(String(fromSeed))) return String(fromSeed);
  if (product.id && UUID_RE.test(String(product.id))) return String(product.id);
  return "";
}

export function existingRowToXlsx(row: ExistingProductsRow): ProductsXlsxRow {
  const barcodes = parseBarcodes(row.barcodes);
  return {
    productId: UUID_RE.test(asText(row.productId)) ? asText(row.productId) : "",
    brand: asText(row.brand) || "TRUSS PROFESSIONAL",
    series: asText(row.series),
    familyShade: asText(row.familyShade),
    shade: asText(row.shade),
    image: asText(row.image),
    catalogNo: asText(row.catalogNo),
    hairColor: asText(row.hairColor),
    type: mapType(asText(row.type) || "other"),
    packingWeight:
      row.packingWeight == null || row.packingWeight === ""
        ? null
        : Number(row.packingWeight),
    materialWeight:
      row.materialWeight == null || row.materialWeight === ""
        ? null
        : Number(row.materialWeight),
    barcodes: stringifyBarcodes(barcodes),
    ILS: row.ILS == null || row.ILS === "" ? null : Number(row.ILS),
  };
}

export function pdfToXlsxRow(product: TrussExportSource): ProductsXlsxRow {
  const barcodes = product.ean_barcode ? [String(product.ean_barcode)] : [];
  const shade =
    product.display_name ||
    product.official_name ||
    product.supplier_name ||
    product.shade_name ||
    product.shade_code ||
    "";

  return {
    productId: resolveExportProductId(product),
    brand: "TRUSS PROFESSIONAL",
    series: product.product_line || "",
    familyShade: product.category || product.product_line || "",
    shade,
    image: imageFilename(product.primary_image_path),
    catalogNo: product.trs_code || "",
    hairColor: product.shade_code || "",
    type: mapType(product.product_type),
    packingWeight: null,
    materialWeight:
      product.size_value == null || !Number.isFinite(Number(product.size_value))
        ? null
        : Number(product.size_value),
    barcodes: stringifyBarcodes(barcodes),
    ILS: null,
  };
}

/** Fill empty fields on `base` from `donor` without overwriting existing values. */
export function fillMissingFields(base: ProductsXlsxRow, donor: ProductsXlsxRow): ProductsXlsxRow {
  const out: ProductsXlsxRow = { ...base };
  for (const col of PRODUCTS_XLSX_COLUMNS) {
    if (isBlank(out[col]) && !isBlank(donor[col])) {
      out[col] = donor[col];
    }
  }
  // Merge barcodes if base empty or donor has codes base lacks
  const baseCodes = parseBarcodes(out.barcodes);
  const donorCodes = parseBarcodes(donor.barcodes);
  if (donorCodes.length) {
    out.barcodes = stringifyBarcodes([...baseCodes, ...donorCodes]);
  }
  return out;
}

/**
 * Merge existing TRUSS products.xlsx rows with PDF-extracted catalog.
 * Existing productIds are preserved. Missing catalogNo/type/size/etc. filled from PDF.
 */
export function mergeExistingWithPdfCatalog(
  existingRows: ExistingProductsRow[],
  pdfProducts: TrussExportSource[],
): { rows: ProductsXlsxRow[]; stats: { existing: number; completed: number; addedNew: number; unmatchedExisting: number } } {
  const existing = existingRows.map(existingRowToXlsx);
  const byEan = new Map<string, number>();
  const byCatalog = new Map<string, number>();
  const byProductId = new Map<string, number>();

  existing.forEach((row, idx) => {
    for (const code of parseBarcodes(row.barcodes)) byEan.set(code, idx);
    if (row.catalogNo) byCatalog.set(String(row.catalogNo).toUpperCase(), idx);
    if (row.productId) byProductId.set(row.productId, idx);
  });

  const consumedExisting = new Set<number>();
  const pdfOnly: ProductsXlsxRow[] = [];
  let completed = 0;

  for (const pdf of pdfProducts) {
    const pdfRow = pdfToXlsxRow(pdf);
    let idx: number | undefined;

    if (pdf.ean_barcode && byEan.has(pdf.ean_barcode)) idx = byEan.get(pdf.ean_barcode);
    if (idx == null && pdf.trs_code && byCatalog.has(pdf.trs_code.toUpperCase())) {
      idx = byCatalog.get(pdf.trs_code.toUpperCase());
    }
    // seed UUID match
    const seedId = resolveExportProductId(pdf);
    if (idx == null && seedId && byProductId.has(seedId)) idx = byProductId.get(seedId);

    if (idx != null) {
      const before = JSON.stringify(existing[idx]);
      // Prefer keeping existing productId; fill blanks from PDF (TRS into empty catalogNo)
      existing[idx] = fillMissingFields(existing[idx], pdfRow);
      // Explicit: if catalogNo empty, use TRS
      if (isBlank(existing[idx].catalogNo) && pdf.trs_code) {
        existing[idx].catalogNo = pdf.trs_code;
      }
      if (JSON.stringify(existing[idx]) !== before) completed += 1;
      consumedExisting.add(idx);
    } else {
      // New product from PDF — productId blank unless seed UUID known
      pdfOnly.push(pdfRow);
    }
  }

  const rows = [...existing, ...pdfOnly];
  return {
    rows,
    stats: {
      existing: existing.length,
      completed,
      addedNew: pdfOnly.length,
      unmatchedExisting: existing.length - consumedExisting.size,
    },
  };
}

export async function buildTrussProductsWorkbookBuffer(rows: ProductsXlsxRow[]): Promise<ArrayBuffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Spectra TRUSS Catalog";
  wb.created = new Date();

  const sheet = wb.addWorksheet("Sheet1", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  sheet.columns = PRODUCTS_XLSX_COLUMNS.map((col) => ({
    header: col,
    key: col,
    width: col === "barcodes" || col === "shade" ? 36 : 16,
  }));

  for (const col of PRODUCTS_XLSX_COLUMNS) {
    const wsCol = sheet.getColumn(col);
    if (col === "packingWeight" || col === "materialWeight" || col === "ILS") {
      wsCol.numFmt = "General";
    } else {
      wsCol.numFmt = "@";
    }
  }

  for (const row of rows) {
    const added = sheet.addRow(PRODUCTS_XLSX_COLUMNS.map((col) => row[col] ?? ""));
    PRODUCTS_XLSX_COLUMNS.forEach((col, i) => {
      const cell = added.getCell(i + 1);
      const value = row[col];
      if (col === "packingWeight" || col === "materialWeight" || col === "ILS") {
        cell.numFmt = "General";
        cell.value = value == null || value === "" ? null : Number(value);
      } else {
        cell.numFmt = "@";
        cell.value = value == null ? "" : String(value);
      }
    });
  }

  sheet.getRow(1).font = { bold: true };
  const buffer = await wb.xlsx.writeBuffer();
  return buffer as ArrayBuffer;
}

export async function downloadMergedTrussProductsXlsx(
  existingRows: ExistingProductsRow[],
  pdfProducts: TrussExportSource[],
  filename?: string,
) {
  const { rows, stats } = mergeExistingWithPdfCatalog(existingRows, pdfProducts);
  const buffer = await buildTrussProductsWorkbookBuffer(rows);
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename || `products_truss_${Date.now()}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
  return stats;
}

/** @deprecated use downloadMergedTrussProductsXlsx */
export function downloadTrussProductsXlsx(products: TrussExportSource[], filename?: string) {
  return downloadMergedTrussProductsXlsx([], products, filename);
}

/** @deprecated use pdfToXlsxRow */
export function toProductsXlsxRow(product: TrussExportSource): ProductsXlsxRow {
  return pdfToXlsxRow(product);
}
