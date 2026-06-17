/**
 * netlify/functions/canonical-product-import.js
 * ─────────────────────────────────────────────────────────────────────────
 * Controlled legacy-product-export import API.
 *
 * Milestone 1 Step 6: Legacy-Import Skeleton
 *
 * Supported actions (POST, JSON body):
 *   profile   — Inspect source file structure without importing
 *   preview   — Dry-run: validate rows, show what would be inserted
 *   import    — Execute approved import with idempotent source insertion
 *   status    — Get status of an import batch
 *   rollback  — Mark a batch as rolled_back (does not delete source rows)
 *
 * Safety rules:
 *   - Source records are NEVER deleted
 *   - Raw field values are NEVER replaced with normalized values
 *   - Manual mappings are NEVER overwritten by automated matches
 *   - Different package sizes remain SEPARATE source records
 *   - Import is idempotent (re-running same file produces no duplicates)
 *   - Only safe conservative matching in this milestone:
 *       exact legacy source ID / trusted barcode / catalog number (scoped to mfr)
 *   - Everything else → review queue
 *
 * Auth: X-Access-Code header
 */
"use strict";

const { neon }  = require("@neondatabase/serverless");
const crypto    = require("crypto");

const ACCESS_CODE       = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";
const PROCESSOR_VERSION = "1.0.0";
const RULES_VERSION     = "1.0.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};

// ── Normalization helpers ──────────────────────────────────────────────────

function normalizeName(raw) {
  if (!raw) return "";
  return String(raw)
    .toLowerCase()
    .trim()
    .replace(/[™®©]/g, "")
    .replace(/\s+/g, " ")
    .replace(/[,;\/\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSize(raw) {
  if (!raw && raw !== 0) return null;
  const s = String(raw).trim().toLowerCase();
  const match = s.match(/^(\d+(?:\.\d+)?)\s*(g|gr|gram|grams|ml|l|oz|kg)?/);
  if (!match) return { value: null, unit: null, originalText: String(raw) };
  return {
    value: parseFloat(match[1]),
    unit: match[2] || null,
    originalText: String(raw),
  };
}

function computeFileHash(rows) {
  const content = JSON.stringify(rows);
  return crypto.createHash("sha256").update(content).digest("hex").slice(0, 16);
}

// ── Source profile reporter ────────────────────────────────────────────────

function profileSourceRows(rows, sourceFile) {
  const uniqueRawNames = new Set();
  const uniqueBrands   = new Set();
  const barcodes       = new Set();
  const catalogNos     = new Set();
  const sourceIds      = new Set();
  const warnings       = [];

  const columnSet = new Set();
  rows.forEach((row) => Object.keys(row).forEach((k) => columnSet.add(k)));
  const columns = [...columnSet];

  rows.forEach((row, idx) => {
    // Detect source product ID
    const sid = row.id || row.product_id || row.productId || row.sku;
    if (sid) sourceIds.add(String(sid));

    // Raw name
    const name = row.name || row.product_name || row.productName || row.shade || "";
    if (name) uniqueRawNames.add(String(name).trim());

    // Brand
    const brand = row.brand || row.manufacturer || row.Brand || "";
    if (brand) uniqueBrands.add(String(brand).trim());

    // Barcodes
    const barcode = row.barcode || row.Barcode || row.ean || row.upc || "";
    if (barcode) {
      String(barcode)
        .split(/[,;|]/)
        .map((b) => b.trim())
        .filter(Boolean)
        .forEach((b) => barcodes.add(b));
    }

    // Catalog numbers
    const cat = row.catalog_no || row.catalogNo || row.catalog_number || row.sku || "";
    if (cat) catalogNos.add(String(cat).trim());

    // Size detection
    const size = row.material_weight || row.materialWeight || row.size || row.weight || null;
    if (size) {
      const parsed = normalizeSize(size);
      if (!parsed || parsed.value === null) {
        if (idx < 5) warnings.push(`Row ${idx}: unparseable size "${size}"`);
      }
    }
  });

  return {
    sourceFile,
    detectedColumns: columns,
    totalRows: rows.length,
    uniqueRawNames: uniqueRawNames.size,
    uniqueBrands: uniqueBrands.size,
    sourceIdsDetected: sourceIds.size,
    barcodesDetected: barcodes.size,
    catalogNosDetected: catalogNos.size,
    warnings,
    sampleRows: rows.slice(0, 3).map((r) => {
      const clone = { ...r };
      Object.keys(clone).forEach((k) => {
        if (typeof clone[k] === "string" && clone[k].length > 100)
          clone[k] = clone[k].slice(0, 100) + "…";
      });
      return clone;
    }),
  };
}

// ── Row → Source record mapping ───────────────────────────────────────────

function rowToSourceRecord(row, idx, sourceFile, batchId) {
  const sourceProductId = row.id || row.product_id || row.productId || null;
  const rawName         = row.name || row.product_name || row.productName || row.shade || "";
  const rawBrand        = row.brand || row.manufacturer || row.Brand || null;
  const rawLine         = row.series || row.product_line || row.line || null;
  const rawShadeCode    = row.shade_code || row.shadeCode || row.code || null;
  const rawShadeName    = row.shade_name || row.shadeName || row.shade || null;
  const rawSize         = row.material_weight !== undefined ? String(row.material_weight) : (row.size || null);
  const rawUnit         = row.unit || null;
  const rawBarcode      = row.barcode || row.Barcode || row.ean || null;
  const rawCatalog      = row.catalog_no || row.catalogNo || row.catalog_number || null;
  const rawType         = row.type || row.product_type || row.kind || null;
  const rawActiveStatus = row.flag !== undefined ? String(row.flag) : (row.active !== undefined ? String(row.active) : null);

  return {
    sourceSystem:       "spectra_catalog_export",
    sourceProductId:    sourceProductId ? String(sourceProductId) : null,
    sourceFile,
    sourceSheet:        row._sheet || null,
    sourceRowId:        String(idx),
    importBatchId:      batchId,
    rawProductName:     String(rawName || ""),
    normalizedRawName:  normalizeName(rawName),
    rawBrand:           rawBrand ? String(rawBrand) : null,
    rawProductLine:     rawLine  ? String(rawLine)  : null,
    rawShadeCode:       rawShadeCode ? String(rawShadeCode) : null,
    rawShadeName:       rawShadeName ? String(rawShadeName) : null,
    rawSize:            rawSize,
    rawUnit:            rawUnit,
    rawBarcode:         rawBarcode ? String(rawBarcode).trim() : null,
    rawCatalogNumber:   rawCatalog ? String(rawCatalog).trim() : null,
    rawProductType:     rawType ? String(rawType) : null,
    rawActiveStatus:    rawActiveStatus,
    rawPayload:         row,
  };
}

// ── Handler ───────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS, body: "" };
  }

  const accessCode = event.headers?.["x-access-code"];
  if (accessCode !== ACCESS_CODE) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "NEON_DATABASE_URL not configured" }) };
  }

  if (event.httpMethod === "GET") {
    // GET ?action=status&batchId=<id>
    const params = event.queryStringParameters || {};
    if (params.action === "status" && params.batchId) {
      const sql = neon(databaseUrl);
      try {
        const rows = await sql`
          SELECT * FROM product_import_batches WHERE id = ${params.batchId}
        `;
        if (!rows.length) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Batch not found" }) };
        return {
          statusCode: 200,
          headers: { ...CORS, "Content-Type": "application/json" },
          body: JSON.stringify(rows[0]),
        };
      } catch (err) {
        return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
      }
    }
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unknown GET action" }) };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const { action, rows, sourceFile, batchId } = body;
  const ALLOWED_ACTIONS = new Set(["profile", "preview", "import", "status", "rollback"]);
  if (!ALLOWED_ACTIONS.has(action)) {
    return {
      statusCode: 400,
      headers: CORS,
      body: JSON.stringify({ error: "Unknown action", allowed: [...ALLOWED_ACTIONS] }),
    };
  }

  // ── action: profile ───────────────────────────────────────────────────
  if (action === "profile") {
    if (!Array.isArray(rows) || !rows.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "rows array required" }) };
    }
    const profile = profileSourceRows(rows, sourceFile || "unknown");
    const hash = computeFileHash(rows);
    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ action: "profile", hash, profile }),
    };
  }

  // ── action: preview ───────────────────────────────────────────────────
  if (action === "preview") {
    if (!Array.isArray(rows) || !rows.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "rows array required" }) };
    }
    const sql = neon(databaseUrl);
    const hash = computeFileHash(rows);

    // Check if this file has already been imported
    const existingBatch = await sql`
      SELECT id, status FROM product_import_batches
      WHERE source_hash = ${hash}
        AND status NOT IN ('rolled_back','failed')
      LIMIT 1
    `;
    if (existingBatch.length > 0) {
      return {
        statusCode: 409,
        headers: CORS,
        body: JSON.stringify({
          error: "duplicate_import",
          message: "A batch with this source hash already exists",
          existingBatchId: existingBatch[0].id,
          existingStatus: existingBatch[0].status,
        }),
      };
    }

    const sourceRecords = rows.map((row, idx) =>
      rowToSourceRecord(row, idx, sourceFile || "unknown", "PREVIEW_BATCH")
    );
    const profile = profileSourceRows(rows, sourceFile || "unknown");

    // Count potential uniqueness conflicts on source product ID
    const sourceProductIds = sourceRecords
      .map((r) => r.sourceProductId)
      .filter(Boolean);
    const existingIds = sourceProductIds.length > 0
      ? await sql`
          SELECT source_product_id FROM catalog_product_sources
          WHERE source_system = 'spectra_catalog_export'
            AND source_product_id = ANY(${sourceProductIds}::text[])
        `
      : [];

    const warnings = [...profile.warnings];
    const invalidRows = sourceRecords.filter((r) => !r.rawProductName || !r.normalizedRawName).length;

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "preview",
        hash,
        sourceFile: sourceFile || "unknown",
        totalRows: rows.length,
        validRows: rows.length - invalidRows,
        invalidRows,
        alreadyExistingSourceIds: existingIds.length,
        wouldInsert: rows.length - existingIds.length,
        profile,
        warnings,
        sampleSourceRecords: sourceRecords.slice(0, 3).map((r) => ({
          ...r,
          rawPayload: "[omitted in preview]",
        })),
        approvalRequired: true,
        instruction: "Set action='import' with this same rows array to proceed. The import will skip already-existing source IDs.",
      }),
    };
  }

  // ── action: import ────────────────────────────────────────────────────
  if (action === "import") {
    if (!Array.isArray(rows) || !rows.length) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "rows array required" }) };
    }
    const sql = neon(databaseUrl);
    const hash = computeFileHash(rows);

    // Idempotency: reject if already completed
    const existingBatch = await sql`
      SELECT id, status FROM product_import_batches
      WHERE source_hash = ${hash}
        AND status NOT IN ('rolled_back','failed')
      LIMIT 1
    `;
    if (existingBatch.length > 0) {
      return {
        statusCode: 409,
        headers: CORS,
        body: JSON.stringify({
          error: "duplicate_import",
          existingBatchId: existingBatch[0].id,
          message: "Use rollback action to reset, or use a different source file.",
        }),
      };
    }

    // Create import batch
    const [batch] = await sql`
      INSERT INTO product_import_batches (
        source_type, source_file, source_hash,
        processor_version, rules_version, status,
        started_at, total_rows
      ) VALUES (
        'spectra_catalog_export',
        ${sourceFile || "unknown"},
        ${hash},
        ${PROCESSOR_VERSION}, ${RULES_VERSION},
        'importing',
        now(),
        ${rows.length}
      )
      RETURNING id
    `;
    const newBatchId = batch.id;

    let inserted = 0;
    let skipped  = 0;
    let invalid  = 0;
    let reviewItems = 0;
    const warnings = [];

    for (let idx = 0; idx < rows.length; idx++) {
      const row = rows[idx];
      const sr  = rowToSourceRecord(row, idx, sourceFile || "unknown", newBatchId);

      if (!sr.rawProductName) {
        invalid++;
        continue;
      }

      try {
        await sql`
          INSERT INTO catalog_product_sources (
            source_system, source_product_id, source_file, source_sheet,
            source_row_id, import_batch_id,
            raw_product_name, normalized_raw_name,
            raw_brand, raw_product_line, raw_shade_code, raw_shade_name,
            raw_size, raw_unit, raw_barcode, raw_catalog_number,
            raw_product_type, raw_active_status, raw_payload
          ) VALUES (
            ${sr.sourceSystem}, ${sr.sourceProductId}, ${sr.sourceFile},
            ${sr.sourceSheet}, ${sr.sourceRowId}, ${sr.importBatchId},
            ${sr.rawProductName}, ${sr.normalizedRawName},
            ${sr.rawBrand}, ${sr.rawProductLine}, ${sr.rawShadeCode}, ${sr.rawShadeName},
            ${sr.rawSize}, ${sr.rawUnit}, ${sr.rawBarcode}, ${sr.rawCatalogNumber},
            ${sr.rawProductType}, ${sr.rawActiveStatus}, ${JSON.stringify(sr.rawPayload)}
          )
          ON CONFLICT (source_system, source_product_id)
            WHERE source_product_id IS NOT NULL
          DO NOTHING
        `;
        inserted++;
      } catch (insertErr) {
        // Duplicate on batch+row constraint — skip
        if (insertErr.code === "23505") {
          skipped++;
        } else {
          warnings.push(`Row ${idx}: ${insertErr.message}`);
          invalid++;
        }
      }

      // For every unresolved source (no barcode, no stable ID) → review queue
      if (!sr.rawBarcode && !sr.sourceProductId) {
        try {
          await sql`
            INSERT INTO product_review_items (
              review_type, reason_code, priority, confidence, evidence
            ) VALUES (
              'unresolved_source',
              'no_barcode_or_id',
              4,
              'low',
              ${JSON.stringify({
                rawProductName: sr.rawProductName,
                rawBrand: sr.rawBrand,
                sourceRowId: sr.sourceRowId,
                batchId: newBatchId,
              })}
            )
          `;
          reviewItems++;
        } catch { /* not critical */ }
      }
    }

    const summary = {
      sourceFile: sourceFile || "unknown",
      sourceHash: hash,
      totalRows: rows.length,
      validRows: rows.length - invalid,
      invalidRows: invalid,
      insertedRows: inserted,
      skippedRows: skipped,
      reviewItemsCreated: reviewItems,
      warnings: warnings.slice(0, 20),
    };

    // Update batch to completed
    await sql`
      UPDATE product_import_batches
      SET status        = ${warnings.length > 0 ? 'completed_with_warnings' : 'completed'},
          completed_at  = now(),
          total_rows    = ${rows.length},
          valid_rows    = ${rows.length - invalid},
          invalid_rows  = ${invalid},
          inserted_rows = ${inserted},
          updated_rows  = 0,
          unchanged_rows = ${skipped},
          review_rows   = ${reviewItems},
          summary       = ${JSON.stringify(summary)}
      WHERE id = ${newBatchId}
    `;

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        batchId: newBatchId,
        summary,
      }),
    };
  }

  // ── action: rollback ──────────────────────────────────────────────────
  if (action === "rollback") {
    if (!batchId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "batchId required" }) };
    }
    const sql = neon(databaseUrl);

    const [batch] = await sql`
      SELECT id, status FROM product_import_batches WHERE id = ${batchId}
    `;
    if (!batch) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Batch not found" }) };
    }
    if (batch.status === "rolled_back") {
      return { statusCode: 409, headers: CORS, body: JSON.stringify({ error: "Already rolled back" }) };
    }

    // Rollback = mark status only. Source records are NOT deleted (by design).
    await sql`
      UPDATE product_import_batches SET status = 'rolled_back', updated_at = now()
      WHERE id = ${batchId}
    `;

    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({
        success: true,
        batchId,
        note: "Batch marked as rolled_back. Source records are preserved and not deleted. Re-import by sending new rows.",
      }),
    };
  }

  // ── action: status ────────────────────────────────────────────────────
  if (action === "status") {
    if (!batchId) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "batchId required" }) };
    }
    const sql = neon(databaseUrl);
    const rows2 = await sql`SELECT * FROM product_import_batches WHERE id = ${batchId}`;
    if (!rows2.length) {
      return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Batch not found" }) };
    }
    return {
      statusCode: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify(rows2[0]),
    };
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unhandled action" }) };
};
