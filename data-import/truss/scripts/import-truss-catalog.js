#!/usr/bin/env node
/**
 * Idempotent TRUSS catalog import into Neon catalog_* tables.
 *
 *   node data-import/truss/scripts/import-truss-catalog.js --dry-run
 *   CONFIRM_TRUSS_CATALOG_IMPORT=true node ... --apply
 *
 * Identity: EAN → TRS/supplier_sku → stable product id.
 * Existing seed products: classify unmatched as needs_review; never delete.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env") });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env.local") });

const ROOT = path.resolve(__dirname, "../../..");
const TRUSS_ROOT = path.resolve(__dirname, "..");
const CATALOG_PATH = path.join(TRUSS_ROOT, "normalized/truss-catalog.json");
const SEED_MATCH_PATH = path.join(TRUSS_ROOT, "reports/seed-47-match-report.json");
const BRAND_NAME = "TRUSS PROFESSIONAL";
/** Legacy salon brands table id used by catalog_product_lines.brand_id FK. */
const LEGACY_BRAND_ID = "brand-truss-professional";
/** catalog_brands / manufacturer id used by catalog_products.manufacturer_id. */
const CATALOG_BRAND_ID = "mfr-truss-professional";

function normalizeName(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function lineId(lineName) {
  return `pl-truss-professional-${normalizeName(lineName).replace(/\s+/g, "-") || "unassigned"}`;
}

function familyId(lineName, category) {
  return `fam-truss-professional-${normalizeName(lineName).replace(/\s+/g, "-")}-${normalizeName(category || "general").replace(/\s+/g, "-")}`;
}

async function columnExists(client, table, column) {
  const res = await client.query(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema='public' AND table_name=$1 AND column_name=$2 LIMIT 1`,
    [table, column],
  );
  return res.rowCount > 0;
}

async function ensureBrand(client, dryRun, summary) {
  const existing = await client.query(
    `SELECT id FROM catalog_brands WHERE id=$1 OR id=$2 OR normalized_name=$3 LIMIT 1`,
    [CATALOG_BRAND_ID, LEGACY_BRAND_ID, normalizeName(BRAND_NAME)],
  );
  const catalogBrandId = existing.rowCount ? existing.rows[0].id : CATALOG_BRAND_ID;
  summary.brand = {
    action: existing.rowCount ? "unchanged" : "insert",
    id: catalogBrandId,
    legacy_brand_id: LEGACY_BRAND_ID,
  };

  // Ensure legacy brands row exists for catalog_product_lines.brand_id FK.
  const legacy = await client.query(`SELECT id FROM brands WHERE id=$1 LIMIT 1`, [LEGACY_BRAND_ID]);
  if (!legacy.rowCount) {
    summary.brand.legacy_action = "insert";
    if (!dryRun) {
      await client.query(
        `INSERT INTO brands (id, name, slug, sort_order)
         VALUES ($1,$2,$3,0)
         ON CONFLICT (id) DO NOTHING`,
        [LEGACY_BRAND_ID, BRAND_NAME, "truss-professional"],
      );
    }
  } else {
    summary.brand.legacy_action = "unchanged";
  }

  if (!existing.rowCount && !dryRun) {
    await client.query(
      `INSERT INTO catalog_brands (id, canonical_name, normalized_name, display_name, status, evidence_status)
       VALUES ($1,$2,$3,$4,'active','partially_verified')
       ON CONFLICT (id) DO UPDATE SET updated_at=now()`,
      [CATALOG_BRAND_ID, BRAND_NAME, normalizeName(BRAND_NAME), "TRUSS"],
    );
  }
  return catalogBrandId;
}

async function loadCaches(client, brandId) {
  const [lines, families, barcodes, bySku, byId] = await Promise.all([
    client.query(`SELECT id FROM catalog_product_lines WHERE manufacturer_id=$1`, [brandId]),
    client.query(`SELECT id FROM catalog_product_families WHERE manufacturer_id=$1`, [brandId]),
    client.query(
      `SELECT b.barcode, b.barcode_type, b.product_id
       FROM catalog_product_barcodes b
       JOIN catalog_products p ON p.id = b.product_id
       WHERE p.manufacturer_id=$1 AND b.status='active'`,
      [brandId],
    ),
    client.query(
      `SELECT id, supplier_sku FROM catalog_products
       WHERE manufacturer_id=$1 AND supplier_sku IS NOT NULL AND active=true`,
      [brandId],
    ),
    client.query(`SELECT id FROM catalog_products WHERE manufacturer_id=$1`, [brandId]),
  ]);

  const eanToProduct = new Map();
  const trsToProduct = new Map();
  for (const row of barcodes.rows) {
    if (row.barcode_type === "ean13" || row.barcode_type === "ean8") {
      eanToProduct.set(row.barcode, row.product_id);
    } else if (row.barcode_type === "internal") {
      trsToProduct.set(row.barcode, row.product_id);
    }
  }
  const skuToProduct = new Map(bySku.rows.map((r) => [r.supplier_sku, r.id]));
  return {
    lineIds: new Set(lines.rows.map((r) => r.id)),
    familyIds: new Set(families.rows.map((r) => r.id)),
    productIds: new Set(byId.rows.map((r) => r.id)),
    eanToProduct,
    trsToProduct,
    skuToProduct,
  };
}

function ensureLineCached(ctx, brandId, lineName, dryRun, summary) {
  const id = lineId(lineName);
  if (ctx.cache.lineIds.has(id)) {
    summary.lines.unchanged += 1;
    return { id, insertSql: null };
  }
  summary.lines.inserts += 1;
  ctx.cache.lineIds.add(id);
  if (dryRun) return { id, insertSql: null };
  const slug = normalizeName(lineName).replace(/\s+/g, "-") || "unassigned";
  return {
    id,
    insertSql: {
      text: `INSERT INTO catalog_product_lines
              (id, brand_id, name, slug, manufacturer_id, canonical_name, normalized_name, status, evidence_status)
             VALUES ($1,$2,$3,$4,$5,$3,$6,'active','partially_verified')
             ON CONFLICT (id) DO NOTHING`,
      values: [id, LEGACY_BRAND_ID, lineName, slug, brandId, normalizeName(lineName)],
    },
  };
}

function ensureFamilyCached(ctx, brandId, lineIdValue, lineName, category, dryRun, summary) {
  const id = familyId(lineName, category);
  if (ctx.cache.familyIds.has(id)) {
    summary.families.unchanged += 1;
    return { id, insertSql: null };
  }
  summary.families.inserts += 1;
  ctx.cache.familyIds.add(id);
  if (dryRun) return { id, insertSql: null };
  return {
    id,
    insertSql: {
      text: `INSERT INTO catalog_product_families
        (id, manufacturer_id, product_line_id, canonical_name, normalized_name, primary_product_type, status)
       VALUES ($1,$2,$3,$4,$5,'other','active') ON CONFLICT (id) DO NOTHING`,
      values: [id, brandId, lineIdValue, category || lineName, normalizeName(category || lineName)],
    },
  };
}

function resolveProductId(ctx, product) {
  if (product.ean_barcode && ctx.cache.eanToProduct.has(product.ean_barcode)) {
    return ctx.cache.eanToProduct.get(product.ean_barcode);
  }
  if (product.trs_code && ctx.cache.skuToProduct.has(product.trs_code)) {
    return ctx.cache.skuToProduct.get(product.trs_code);
  }
  if (product.trs_code && ctx.cache.trsToProduct.has(product.trs_code)) {
    return ctx.cache.trsToProduct.get(product.trs_code);
  }
  if (ctx.cache.productIds.has(product.id)) return product.id;
  return null;
}

async function upsertProduct(client, ctx, product, dryRun, summary) {
  const {
    brandId,
    hasSupplierSku,
    hasPrimaryImage,
    hasMetadata,
    hasPublishedAt,
    hasShadeRaw,
  } = ctx;

  let productId = resolveProductId(ctx, product);

  const line = ensureLineCached(ctx, brandId, product.product_line || "Unassigned", dryRun, summary);
  if (line.insertSql) await client.query(line.insertSql.text, line.insertSql.values);
  const lineIdValue = line.id;
  const family = ensureFamilyCached(
    ctx,
    brandId,
    lineIdValue,
    product.product_line || "Unassigned",
    product.category,
    dryRun,
    summary,
  );
  if (family.insertSql) await client.query(family.insertSql.text, family.insertSql.values);
  const familyIdValue = family.id;

  const canonicalName =
    product.official_name ||
    product.display_name ||
    [product.product_line, product.product_name].filter(Boolean).join(" ");
  const normalized = normalizeName(canonicalName);
  const professional = product.professional_or_retail === "professional";
  const retail = product.professional_or_retail === "retail";
  const validationStatus = product.validation_status === "approved" ? "approved" : "needs_review";
  const publishedAt = validationStatus === "approved" ? new Date().toISOString() : null;

  const metadata = {
    ...(product.metadata || {}),
    division: product.division,
    official_description: product.official_description,
    official_product_url: product.official_product_url,
    supplier_name: product.supplier_name,
    official_name: product.official_name,
    enrichment_status: product.enrichment_status,
    source_confidence: product.source_confidence,
    image_status: product.image_status,
    truss_import: true,
  };

  if (!productId) {
    summary.products.inserts += 1;
    productId = product.id;
    ctx.cache.productIds.add(productId);
    if (product.ean_barcode) ctx.cache.eanToProduct.set(product.ean_barcode, productId);
    if (product.trs_code) {
      ctx.cache.skuToProduct.set(product.trs_code, productId);
      ctx.cache.trsToProduct.set(product.trs_code, productId);
    }
    if (!dryRun) {
      const cols = [
        "id",
        "product_family_id",
        "manufacturer_id",
        "product_line_id",
        "canonical_name",
        "normalized_name",
        "primary_product_type",
        "product_category",
        "package_size_value",
        "package_size_unit",
        "original_package_text",
        "intended_use_type",
        "professional_use",
        "retail_use",
        "active",
        "evidence_status",
        "validation_status",
      ];
      const vals = [
        productId,
        familyIdValue,
        brandId,
        lineIdValue,
        canonicalName,
        normalized,
        product.product_type || "other",
        product.category,
        product.size_value,
        product.size_unit,
        product.size_display,
        product.professional_or_retail,
        professional,
        retail,
        true,
        product.official_description ? "partially_verified" : "unresearched",
        validationStatus,
      ];

      if (hasSupplierSku) {
        cols.push("supplier_sku");
        vals.push(product.trs_code);
      }
      if (hasPrimaryImage) {
        cols.push("primary_image_path", "image_source_url");
        vals.push(product.primary_image_path, product.image_source_url);
      }
      if (hasMetadata) {
        cols.push("metadata");
        vals.push(JSON.stringify(metadata));
      }
      if (hasPublishedAt && publishedAt) {
        cols.push("published_at");
        vals.push(publishedAt);
      }
      if (hasShadeRaw && product.shade_code) {
        cols.push("shade_code_raw", "shade_code_normalized", "color_tone_code", "color_depth_level");
        vals.push(
          product.shade_code,
          product.shade_code,
          product.primary_tone,
          product.color_level,
        );
      }

      const placeholders = vals.map((_, i) => `$${i + 1}`).join(",");
      await client.query(
        `INSERT INTO catalog_products (${cols.join(",")}) VALUES (${placeholders})`,
        vals,
      );
    }
  } else {
    summary.products.updates += 1;
    if (!dryRun) {
      const sets = [
        "canonical_name=$2",
        "normalized_name=$3",
        "primary_product_type=$4",
        "product_category=$5",
        "package_size_value=$6",
        "package_size_unit=$7",
        "original_package_text=$8",
        "professional_use=$9",
        "retail_use=$10",
        "validation_status=$11",
        "product_line_id=$12",
        "product_family_id=$13",
        "updated_at=now()",
      ];
      const vals = [
        productId,
        canonicalName,
        normalized,
        product.product_type || "other",
        product.category,
        product.size_value,
        product.size_unit,
        product.size_display,
        professional,
        retail,
        validationStatus,
        lineIdValue,
        familyIdValue,
      ];
      let i = vals.length;
      if (hasSupplierSku) {
        sets.push(`supplier_sku=$${++i}`);
        vals.push(product.trs_code);
      }
      if (hasPrimaryImage) {
        sets.push(`primary_image_path=$${++i}`);
        vals.push(product.primary_image_path);
        sets.push(`image_source_url=$${++i}`);
        vals.push(product.image_source_url);
      }
      if (hasMetadata) {
        sets.push(`metadata=COALESCE(metadata,'{}'::jsonb) || $${++i}::jsonb`);
        vals.push(JSON.stringify(metadata));
      }
      if (hasPublishedAt) {
        sets.push(`published_at=COALESCE(published_at, $${++i})`);
        vals.push(publishedAt);
      }
      await client.query(`UPDATE catalog_products SET ${sets.join(",")} WHERE id=$1`, vals);
    }
  }

  // Barcodes
  if (product.ean_barcode && product.ean_valid) {
    summary.barcodes.upserts += 1;
    if (!dryRun) {
      await client.query(
        `INSERT INTO catalog_product_barcodes (id, product_id, barcode, barcode_type, is_primary, status)
         VALUES ($1,$2,$3,'ean13',true,'active')
         ON CONFLICT DO NOTHING`,
        [`cbar-truss-ean-${product.ean_barcode}`, productId, product.ean_barcode],
      );
      // If unique conflict on barcode for another product, mark conflict instead of failing
      await client.query(
        `INSERT INTO catalog_product_barcodes (id, product_id, barcode, barcode_type, is_primary, status)
         SELECT $1,$2,$3,'ean13',true,'active'
         WHERE NOT EXISTS (
           SELECT 1 FROM catalog_product_barcodes WHERE barcode=$3 AND status='active'
         )
         ON CONFLICT DO NOTHING`,
        [`cbar-truss-ean-${product.ean_barcode}`, productId, product.ean_barcode],
      );
    }
  } else if (product.ean_barcode && !product.ean_valid) {
    summary.conflicts.push({ type: "invalid_ean", product_id: product.id, ean: product.ean_barcode });
  }

  if (product.trs_code) {
    summary.barcodes.upserts += 1;
    if (!dryRun) {
      await client.query(
        `INSERT INTO catalog_product_barcodes (id, product_id, barcode, barcode_type, is_primary, status)
         SELECT $1,$2,$3,'internal',false,'active'
         WHERE NOT EXISTS (
           SELECT 1 FROM catalog_product_barcodes WHERE barcode=$3 AND status='active'
         )
         ON CONFLICT DO NOTHING`,
        [`cbar-truss-trs-${product.trs_code.toLowerCase()}`, productId, product.trs_code],
      );
    }
  }

  // Provenance source row
  if (!dryRun) {
    const sourceId = `src-truss-pdf-${product.source_pdf_page}-${product.trs_code || product.id}`;
    await client.query(
      `INSERT INTO catalog_product_sources (
         id, source_system, source_product_id, source_file, source_row_id,
         raw_product_name, normalized_raw_name, raw_brand, raw_product_line,
         raw_barcode, raw_catalog_number, raw_shade_code, raw_payload, canonical_product_id
       ) VALUES (
         $1,'truss_israel_barcode_pdf',$2,$3,$4,
         $5,$6,$7,$8,
         $9,$10,$11,$12::jsonb,$13
       )
       ON CONFLICT (id) DO UPDATE SET
         raw_payload=EXCLUDED.raw_payload,
         canonical_product_id=EXCLUDED.canonical_product_id`,
      [
        sourceId,
        product.trs_code || product.id,
        "barcode-catalog-1.pdf",
        String(product.source_pdf_page),
        product.supplier_name || product.display_name || product.id,
        normalized,
        "TRUSS",
        product.product_line,
        product.ean_barcode,
        product.trs_code,
        product.shade_code,
        JSON.stringify(product),
        productId,
      ],
    );
  }

  return productId;
}

async function classifyLegacySeed(client, brandId, dryRun, summary, importedProducts) {
  const seedMatch = fs.existsSync(SEED_MATCH_PATH)
    ? JSON.parse(fs.readFileSync(SEED_MATCH_PATH, "utf8"))
    : { total_seed: 0, matched: 0, results: [] };

  const importedEans = new Set(importedProducts.map((p) => p.ean_barcode).filter(Boolean));
  const importedTrs = new Set(importedProducts.map((p) => p.trs_code).filter(Boolean));
  const importedIds = new Set(importedProducts.map((p) => p.id));

  // Any existing TRUSS catalog product not tied to an imported EAN/TRS/id → needs_review
  const existing = await client.query(
    `SELECT p.id, p.supplier_sku,
            (SELECT b.barcode FROM catalog_product_barcodes b
             WHERE b.product_id=p.id AND b.status='active' AND b.barcode_type IN ('ean13','ean8')
             ORDER BY b.is_primary DESC LIMIT 1) AS ean
     FROM catalog_products p
     WHERE p.manufacturer_id=$1 AND p.active=true`,
    [brandId],
  );

  const toClassify = [];
  for (const row of existing.rows) {
    if (importedIds.has(row.id)) continue;
    if (row.ean && importedEans.has(row.ean)) continue;
    if (row.supplier_sku && importedTrs.has(row.supplier_sku)) continue;
    toClassify.push(row.id);
  }

  summary.legacy_seed = {
    total: seedMatch.total_seed,
    matched: seedMatch.matched,
    unmatched: seedMatch.results.filter((r) => r.match_status === "needs_review").length,
    existing_truss_products: existing.rowCount,
    classified_needs_review: toClassify.length,
  };

  if (!toClassify.length || dryRun) return;

  const hasPublished = await columnExists(client, "catalog_products", "published_at");
  for (const id of toClassify) {
    if (hasPublished) {
      await client.query(
        `UPDATE catalog_products
         SET validation_status='needs_review', published_at=NULL, updated_at=now()
         WHERE id=$1`,
        [id],
      );
    } else {
      await client.query(
        `UPDATE catalog_products
         SET validation_status='needs_review', updated_at=now()
         WHERE id=$1`,
        [id],
      );
    }
  }
}

async function main() {
  const dryRun = !process.argv.includes("--apply");
  const apply = process.argv.includes("--apply");
  if (apply && process.env.CONFIRM_TRUSS_CATALOG_IMPORT !== "true") {
    console.error("Refusing --apply without CONFIRM_TRUSS_CATALOG_IMPORT=true");
    process.exit(1);
  }
  if (!fs.existsSync(CATALOG_PATH)) {
    console.error("Missing truss-catalog.json — run npm run truss:build first");
    process.exit(1);
  }

  const products = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
  const databaseUrl = process.env.DATABASE_URL || process.env.NETLIFY_DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL not set");
    process.exit(1);
  }

  const summary = {
    mode: dryRun ? "dry-run" : "apply",
    generated_at: new Date().toISOString(),
    brand: null,
    lines: { inserts: 0, unchanged: 0 },
    families: { inserts: 0, unchanged: 0 },
    products: { inserts: 0, updates: 0, unchanged: 0 },
    barcodes: { upserts: 0 },
    conflicts: [],
    invalid_records: products.filter((p) => !p.ean_valid || !p.trs_code).map((p) => p.id),
    missing_images: products.filter((p) => p.image_status === "missing_official_image").length,
    missing_descriptions: products.filter((p) => !p.official_description).length,
    duplicates: [],
    legacy_seed: null,
  };

  const client = new Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const ctx = {
      brandId: null,
      hasSupplierSku: await columnExists(client, "catalog_products", "supplier_sku"),
      hasPrimaryImage: await columnExists(client, "catalog_products", "primary_image_path"),
      hasMetadata: await columnExists(client, "catalog_products", "metadata"),
      hasPublishedAt: await columnExists(client, "catalog_products", "published_at"),
      hasShadeRaw: await columnExists(client, "catalog_products", "shade_code_raw"),
    };

    if (!dryRun) await client.query("BEGIN");
    ctx.brandId = await ensureBrand(client, dryRun, summary);
    ctx.cache = dryRun && !(await client.query(`SELECT 1 FROM catalog_brands WHERE id=$1`, [ctx.brandId])).rowCount
      ? {
          lineIds: new Set(),
          familyIds: new Set(),
          productIds: new Set(),
          eanToProduct: new Map(),
          trsToProduct: new Map(),
          skuToProduct: new Map(),
        }
      : await loadCaches(client, ctx.brandId);

    let i = 0;
    for (const product of products) {
      i += 1;
      if (i % 25 === 0) process.stdout.write(`\rImport progress ${i}/${products.length}`);
      if (!product.trs_code && !product.ean_barcode) {
        summary.conflicts.push({ type: "no_identity", product_id: product.id });
        continue;
      }
      await upsertProduct(client, ctx, product, dryRun, summary);
    }
    process.stdout.write("\n");

    await classifyLegacySeed(client, ctx.brandId, dryRun, summary, products);

    if (!dryRun) await client.query("COMMIT");
  } catch (err) {
    if (!dryRun) await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }

  const outPath = path.join(TRUSS_ROOT, "reports/import-dry-run-report.json");
  const applyPath = path.join(TRUSS_ROOT, "reports/import-apply-report.json");
  fs.writeFileSync(dryRun ? outPath : applyPath, JSON.stringify(summary, null, 2));
  fs.writeFileSync(
    path.join(ROOT, "reports/truss-catalog", dryRun ? "import-dry-run-report.json" : "import-apply-report.json"),
    JSON.stringify(summary, null, 2),
  );
  console.log(JSON.stringify(summary, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
