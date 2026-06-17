#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Client } = require("pg");
require("dotenv").config({ path: ".env" });

const ROOT = path.resolve(__dirname, "..");
const RUN_ID = process.argv.includes("--run-id")
  ? process.argv[process.argv.indexOf("--run-id") + 1]
  : "ptruth-20260617T221227Z";
const PUBLISH_AT = new Date().toISOString();
const CHUNK_SIZE = 500;

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), "utf8"));
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[™®©]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeIdPart(value) {
  return normalizeText(value).replace(/\s+/g, "-") || "unknown";
}

function displayName(parts) {
  return parts.filter(Boolean).map((part) => String(part).trim()).filter(Boolean).join(" ");
}

function manufacturerName(product) {
  return String(product.displayBrand || product.brand || "Unknown Manufacturer").trim();
}

function productLineName(product) {
  return String(product.displaySeries || product.series || "Unassigned Line").trim();
}

function productFamilyName(product) {
  return String(product.familyShade || product.displaySeries || product.series || "Unassigned Family").trim();
}

function brandId(product) {
  return `brand-${normalizeIdPart(manufacturerName(product))}`;
}

function manufacturerId(product) {
  return `mfr-${normalizeIdPart(manufacturerName(product))}`;
}

function productLineId(product) {
  return `pl-${normalizeIdPart(manufacturerName(product))}-${normalizeIdPart(productLineName(product))}`;
}

function productFamilyId(product) {
  return `fam-${normalizeIdPart(manufacturerName(product))}-${normalizeIdPart(productLineName(product))}-${normalizeIdPart(productFamilyName(product))}`;
}

function canonicalName(product) {
  return displayName([
    product.displayBrand || product.brand,
    product.displaySeries || product.series,
    product.displayShade || product.shade,
  ]) || product.canonicalId;
}

function sourceRawName(source) {
  const raw = source.originalPayload || {};
  return displayName([raw.brand, raw.series, raw.shade]) || source.sourceId;
}

function liveValidationStatus(status) {
  if (status === "suggested_match") return "candidate";
  return ["approved", "candidate", "needs_review", "rejected", "inactive"].includes(status) ? status : "candidate";
}

function confidence(value) {
  return ["high", "medium", "low"].includes(value) ? value : "medium";
}

function isNumericAlias(alias) {
  return /^[\s\d.,/\\\-+]+[a-zA-Z]?\s*$/.test(String(alias || ""));
}

function hash(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function chunks(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i += CHUNK_SIZE) out.push(rows.slice(i, i + CHUNK_SIZE));
  return out;
}

function collectClassificationRecords(node, ctx) {
  if (!node || typeof node !== "object") return;
  if (Array.isArray(node)) {
    node.forEach((item) => collectClassificationRecords(item, ctx));
    return;
  }
  const sourceId = node.sourceId || node.source_id || node.id;
  const hasClassificationShape = sourceId && (
    node.productType || node.productLine || node.productFamily ||
    node.shadeCodeNormalized || node.primaryTone || node.tonalProfile ||
    node.confidenceBand || node.band
  );
  if (hasClassificationShape) {
    ctx.records.push({
      sourceId: String(sourceId),
      rulesVersion: node.rulesVersion || ctx.defaultRulesVersion,
      productType: node.productType || null,
      shadeCodeRaw: node.shadeCodeRaw || node.shade || null,
      shadeCodeNormalized: node.shadeCodeNormalized || node.shadeNormalized || null,
      confidence: Number.isFinite(Number(node.confidence)) ? Number(node.confidence) : null,
      evidence: Array.isArray(node.evidence) ? node.evidence : [],
      tonalProfile: node.tonalProfile || null,
    });
  }
  Object.values(node).forEach((value) => collectClassificationRecords(value, ctx));
}

function loadClassificationByCanonical(sources) {
  const records = [];
  for (const relPath of [
    "reports/catalog-classification/milestone-5/dry-run-wella-professionals.json",
    "reports/catalog-classification/milestone-5/wella-rule-proof-report.json",
  ]) {
    const ctx = { records: [], defaultRulesVersion: null };
    collectClassificationRecords(readJson(relPath), ctx);
    records.push(...ctx.records);
  }
  const sourceToCanonical = new Map(sources.map((source) => [source.sourceId, source.canonicalProductId || source.canonicalKey]));
  const byCanonical = new Map();
  for (const record of records) {
    const canonicalId = sourceToCanonical.get(record.sourceId);
    if (!canonicalId) continue;
    const current = byCanonical.get(canonicalId);
    if (!current || record.rulesVersion === "1.1.0") byCanonical.set(canonicalId, record);
  }
  return byCanonical;
}

async function bulk(client, rows, sql) {
  let affected = 0;
  for (const batch of chunks(rows)) {
    const result = await client.query(sql, [JSON.stringify(batch)]);
    affected += result.rowCount || 0;
  }
  return affected;
}

async function main() {
  if (process.env.CONFIRM_PRODUCT_TRUTH_PRODUCTION_IMPORT !== "true") {
    throw new Error("Refusing promote without CONFIRM_PRODUCT_TRUTH_PRODUCTION_IMPORT=true");
  }
  const client = new Client({ connectionString: process.env.NEON_DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const canonical = (await client.query(
      "SELECT record FROM staging_product_truth_canonical WHERE run_id=$1 ORDER BY canonical_id",
      [RUN_ID]
    )).rows.map((row) => row.record);
    const sources = (await client.query(
      "SELECT record FROM staging_product_truth_sources WHERE run_id=$1 ORDER BY source_id",
      [RUN_ID]
    )).rows.map((row) => row.record);
    const stagedAliases = (await client.query(
      "SELECT alias_key, record FROM staging_product_truth_aliases WHERE run_id=$1 ORDER BY alias_key",
      [RUN_ID]
    )).rows;

    if (canonical.length !== 32739 || sources.length !== 32937 || stagedAliases.length !== 40601) {
      throw new Error(`Unexpected staging counts: ${canonical.length}/${sources.length}/${stagedAliases.length}`);
    }

    const canonicalById = new Map(canonical.map((product) => [product.canonicalId, product]));
    const classificationByCanonical = loadClassificationByCanonical(sources);
    const brands = new Map();
    const manufacturers = new Map();
    const lines = new Map();
    const families = new Map();

    for (const product of canonical) {
      brands.set(brandId(product), { id: brandId(product), name: manufacturerName(product), slug: normalizeIdPart(manufacturerName(product)) });
      manufacturers.set(manufacturerId(product), {
        id: manufacturerId(product),
        canonical_name: manufacturerName(product),
        normalized_name: normalizeText(manufacturerName(product)),
        display_name: manufacturerName(product),
      });
      lines.set(productLineId(product), {
        id: productLineId(product),
        brand_id: brandId(product),
        name: productLineName(product),
        slug: normalizeIdPart(productLineName(product)),
        manufacturer_id: manufacturerId(product),
        canonical_name: productLineName(product),
        normalized_name: normalizeText(productLineName(product)),
      });
      families.set(productFamilyId(product), {
        id: productFamilyId(product),
        manufacturer_id: manufacturerId(product),
        product_line_id: productLineId(product),
        canonical_name: productFamilyName(product),
        normalized_name: normalizeText(productFamilyName(product)),
        primary_product_type: product.productType || "other",
      });
    }

    const aliases = stagedAliases.map(({ alias_key, record }) => {
      const product = canonicalById.get(record.canonicalProductId);
      const aliasScope = isNumericAlias(record.alias) ? "product_line" : "manufacturer";
      return {
        id: alias_key,
        canonical_product_id: record.canonicalProductId,
        alias: record.alias,
        normalized_alias: record.normalizedAlias || normalizeIdPart(record.alias),
        alias_type: record.aliasType || "alias",
        source_record_id: record.sourceRecordId || null,
        confidence: confidence(record.confidence),
        alias_scope: aliasScope,
        manufacturer_id: product ? manufacturerId(product) : null,
        product_line_id: aliasScope === "product_line" && product ? productLineId(product) : null,
        source_system: record.source || "product_truth",
      };
    });

    await client.query("BEGIN");
    await client.query("SET LOCAL statement_timeout = '10min'");
    await client.query("UPDATE product_truth_import_runs SET status='promoting' WHERE run_id=$1", [RUN_ID]);

    const counts = {};
    counts.brands = await bulk(client, [...brands.values()], `
      INSERT INTO brands (id, name, slug, sort_order, created_at, updated_at)
      SELECT x.id, x.name, x.slug, 1000, NOW(), NOW()
      FROM jsonb_to_recordset($1::jsonb) AS x(id TEXT, name TEXT, slug TEXT)
      ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, slug=EXCLUDED.slug, updated_at=NOW()
    `);
    counts.manufacturers = await bulk(client, [...manufacturers.values()], `
      INSERT INTO canonical_manufacturers (id, canonical_name, normalized_name, display_name, evidence_status, status, revision, created_at, updated_at)
      SELECT x.id, x.canonical_name, x.normalized_name, x.display_name, 'inferred', 'active', 1, NOW(), NOW()
      FROM jsonb_to_recordset($1::jsonb) AS x(id TEXT, canonical_name TEXT, normalized_name TEXT, display_name TEXT)
      ON CONFLICT (id) DO UPDATE SET canonical_name=EXCLUDED.canonical_name, normalized_name=EXCLUDED.normalized_name, display_name=EXCLUDED.display_name, updated_at=NOW()
    `);
    counts.lines = await bulk(client, [...lines.values()], `
      INSERT INTO product_lines (id, brand_id, name, slug, sort_order, created_at, updated_at, evidence_status, status, revision, manufacturer_id, canonical_name, normalized_name)
      SELECT x.id, x.brand_id, x.name, x.slug, 0, NOW(), NOW(), 'inferred', 'active', 1, x.manufacturer_id, x.canonical_name, x.normalized_name
      FROM jsonb_to_recordset($1::jsonb) AS x(id TEXT, brand_id TEXT, name TEXT, slug TEXT, manufacturer_id TEXT, canonical_name TEXT, normalized_name TEXT)
      ON CONFLICT (id) DO UPDATE SET manufacturer_id=EXCLUDED.manufacturer_id, canonical_name=EXCLUDED.canonical_name, normalized_name=EXCLUDED.normalized_name, updated_at=NOW()
    `);
    counts.families = await bulk(client, [...families.values()], `
      INSERT INTO product_families (id, manufacturer_id, product_line_id, canonical_name, normalized_name, primary_product_type, evidence_status, status, revision, created_at, updated_at)
      SELECT x.id, x.manufacturer_id, x.product_line_id, x.canonical_name, x.normalized_name, x.primary_product_type, 'inferred', 'active', 1, NOW(), NOW()
      FROM jsonb_to_recordset($1::jsonb) AS x(id TEXT, manufacturer_id TEXT, product_line_id TEXT, canonical_name TEXT, normalized_name TEXT, primary_product_type TEXT)
      ON CONFLICT (id) DO UPDATE SET canonical_name=EXCLUDED.canonical_name, normalized_name=EXCLUDED.normalized_name, updated_at=NOW()
    `);

    const products = canonical.map((product) => {
      const classification = classificationByCanonical.get(product.canonicalId);
      return {
        id: product.canonicalId,
        product_family_id: productFamilyId(product),
        manufacturer_id: manufacturerId(product),
        product_line_id: productLineId(product),
        canonical_name: canonicalName(product),
        normalized_name: normalizeText(canonicalName(product)),
        primary_product_type: product.productType || "other",
        product_category: product.catalogType || null,
        product_subcategory: product.productKind || null,
        package_size_value: product.primarySizeGrams || null,
        package_size_unit: product.primarySizeGrams ? "g" : null,
        professional_use: true,
        retail_use: false,
        technical_use: ["developer_oxidant", "lightener_bleach", "bond_builder"].includes(product.productType),
        active: product.active !== false,
        evidence_status: product.hasBarcodes ? "partially_verified" : "inferred",
        validation_status: liveValidationStatus(product.validationStatus),
        source_count: Number(product.sourceCount || 0),
        alias_count: Number(product.aliasCount || 0),
        review_item_count: Number(product.reviewItemCount || 0),
        shade_code_raw: classification?.shadeCodeRaw || product.displayShade || product.shade || null,
        shade_code_normalized: classification?.shadeCodeNormalized || product.shade || null,
        classification_confidence: classification?.confidence || null,
        classification_status: classification ? "approved" : null,
        classification_rules_version: classification?.rulesVersion || null,
        classification_evidence: classification?.evidence || [],
        tonal_profile: classification?.tonalProfile || null,
        shade_bearing: !!product.shadeBearing,
        tonal_classification_eligible: !!product.tonalClassificationEligible,
        metadata: { productTruth: product, importRunId: RUN_ID, classification: classification || null },
        import_run_id: RUN_ID,
        published_at: PUBLISH_AT,
      };
    });
    counts.products = await bulk(client, products, `
      INSERT INTO canonical_products (
        id, product_family_id, manufacturer_id, product_line_id, canonical_name, normalized_name, primary_product_type,
        product_category, product_subcategory, package_size_value, package_size_unit, professional_use, retail_use, technical_use,
        active, evidence_status, validation_status, source_count, alias_count, review_item_count, revision, created_at, updated_at,
        shade_code_raw, shade_code_normalized, classification_confidence, classification_status, classification_rules_version,
        classification_evidence, tonal_profile, shade_bearing, tonal_classification_eligible, metadata, import_run_id, published_at
      )
      SELECT x.id, x.product_family_id, x.manufacturer_id, x.product_line_id, x.canonical_name, x.normalized_name, x.primary_product_type,
        x.product_category, x.product_subcategory, x.package_size_value, x.package_size_unit, x.professional_use, x.retail_use, x.technical_use,
        x.active, x.evidence_status, x.validation_status, x.source_count, x.alias_count, x.review_item_count, 1, NOW(), NOW(),
        x.shade_code_raw, x.shade_code_normalized, x.classification_confidence, x.classification_status, x.classification_rules_version,
        x.classification_evidence, x.tonal_profile, x.shade_bearing, x.tonal_classification_eligible, x.metadata, x.import_run_id, x.published_at::timestamptz
      FROM jsonb_to_recordset($1::jsonb) AS x(
        id TEXT, product_family_id TEXT, manufacturer_id TEXT, product_line_id TEXT, canonical_name TEXT, normalized_name TEXT, primary_product_type TEXT,
        product_category TEXT, product_subcategory TEXT, package_size_value NUMERIC, package_size_unit TEXT, professional_use BOOLEAN, retail_use BOOLEAN, technical_use BOOLEAN,
        active BOOLEAN, evidence_status TEXT, validation_status TEXT, source_count INT, alias_count INT, review_item_count INT,
        shade_code_raw TEXT, shade_code_normalized TEXT, classification_confidence NUMERIC, classification_status TEXT, classification_rules_version TEXT,
        classification_evidence JSONB, tonal_profile JSONB, shade_bearing BOOLEAN, tonal_classification_eligible BOOLEAN, metadata JSONB, import_run_id TEXT, published_at TEXT)
      ON CONFLICT (id) DO UPDATE SET published_at=EXCLUDED.published_at, import_run_id=EXCLUDED.import_run_id, metadata=EXCLUDED.metadata, updated_at=NOW()
    `);

    const sourceRows = sources.map((source) => {
      const raw = source.originalPayload || {};
      return {
        id: source.sourceId,
        source_system: "product_truth_catalog",
        source_product_id: source.sourceId,
        source_file: source.sourceBrandFile || null,
        source_row_id: raw.id || source.sourceId,
        raw_product_name: sourceRawName(source),
        normalized_raw_name: normalizeText(sourceRawName(source)),
        raw_brand: raw.brand || null,
        raw_product_line: raw.series || null,
        raw_shade_code: raw.shade || null,
        raw_shade_name: raw.shadeDesc || null,
        raw_size: raw.materialWeight != null ? String(raw.materialWeight) : null,
        raw_unit: raw.materialWeight != null ? "g" : null,
        raw_barcode: raw.barcode || (Array.isArray(raw.barcodes) ? raw.barcodes[0] : null) || null,
        raw_catalog_number: raw.catalogNo || null,
        raw_product_type: raw.type || raw.rawType || null,
        raw_active_status: String(raw.flag ?? ""),
        raw_payload: raw,
        canonical_product_id: source.canonicalProductId || source.canonicalKey,
        import_run_id: RUN_ID,
        published_at: PUBLISH_AT,
      };
    });
    counts.sources = await bulk(client, sourceRows, `
      INSERT INTO catalog_product_sources (
        id, source_system, source_product_id, source_file, source_row_id, raw_product_name, normalized_raw_name, raw_brand, raw_product_line,
        raw_shade_code, raw_shade_name, raw_size, raw_unit, raw_barcode, raw_catalog_number, raw_product_type, raw_active_status,
        raw_payload, canonical_product_id, created_at, updated_at, assignment_active, import_run_id, published_at
      )
      SELECT x.id, x.source_system, x.source_product_id, x.source_file, x.source_row_id, x.raw_product_name, x.normalized_raw_name, x.raw_brand, x.raw_product_line,
        x.raw_shade_code, x.raw_shade_name, x.raw_size, x.raw_unit, x.raw_barcode, x.raw_catalog_number, x.raw_product_type, x.raw_active_status,
        x.raw_payload, x.canonical_product_id, NOW(), NOW(), TRUE, x.import_run_id, x.published_at::timestamptz
      FROM jsonb_to_recordset($1::jsonb) AS x(
        id TEXT, source_system TEXT, source_product_id TEXT, source_file TEXT, source_row_id TEXT, raw_product_name TEXT, normalized_raw_name TEXT, raw_brand TEXT, raw_product_line TEXT,
        raw_shade_code TEXT, raw_shade_name TEXT, raw_size TEXT, raw_unit TEXT, raw_barcode TEXT, raw_catalog_number TEXT, raw_product_type TEXT, raw_active_status TEXT,
        raw_payload JSONB, canonical_product_id TEXT, import_run_id TEXT, published_at TEXT)
      ON CONFLICT (id) DO UPDATE SET canonical_product_id=EXCLUDED.canonical_product_id, raw_payload=EXCLUDED.raw_payload, import_run_id=EXCLUDED.import_run_id, published_at=EXCLUDED.published_at, updated_at=NOW()
    `);

    const mappings = sources.map((source) => ({
      id: `map-${source.sourceId}`,
      source_type: "catalog_product_source",
      source_record_id: source.sourceId,
      raw_product_name: sourceRawName(source),
      normalized_raw_name: normalizeText(sourceRawName(source)),
      canonical_product_id: source.canonicalProductId || source.canonicalKey,
      mapping_type: "exact_match",
      match_method: source.matchMethod || "staged_product_truth",
      confidence: confidence(source.matchConfidence),
      validation_status: source.matchConfidence === "low" ? "candidate" : "approved",
      assigned_by: "product_truth_import",
      source_record_type: "catalog_product_source",
      import_run_id: RUN_ID,
      published_at: PUBLISH_AT,
    }));
    counts.mappings = await bulk(client, mappings, `
      INSERT INTO product_identity_mappings (
        id, source_type, source_record_id, raw_product_name, normalized_raw_name, canonical_product_id, mapping_type, match_method, confidence,
        validation_status, assigned_by, assigned_at, rules_version, notes, active, created_at, updated_at, source_record_type, import_run_id, published_at
      )
      SELECT x.id, x.source_type, x.source_record_id, x.raw_product_name, x.normalized_raw_name, x.canonical_product_id, x.mapping_type, x.match_method, x.confidence,
        x.validation_status, x.assigned_by, NOW(), 'product-truth-import-v1', 'Promoted from verified staged Product Truth run', TRUE, NOW(), NOW(), x.source_record_type, x.import_run_id, x.published_at::timestamptz
      FROM jsonb_to_recordset($1::jsonb) AS x(
        id TEXT, source_type TEXT, source_record_id TEXT, raw_product_name TEXT, normalized_raw_name TEXT, canonical_product_id TEXT, mapping_type TEXT, match_method TEXT, confidence TEXT,
        validation_status TEXT, assigned_by TEXT, source_record_type TEXT, import_run_id TEXT, published_at TEXT)
      ON CONFLICT (id) DO UPDATE SET canonical_product_id=EXCLUDED.canonical_product_id, import_run_id=EXCLUDED.import_run_id, published_at=EXCLUDED.published_at, updated_at=NOW()
    `);

    counts.aliases = await bulk(client, aliases, `
      INSERT INTO product_aliases (
        id, canonical_product_id, alias, normalized_alias, alias_type, source_record_id, confidence, active, created_at, updated_at,
        alias_scope, manufacturer_id, product_line_id, source_system, source_record_type, import_run_id, published_at
      )
      SELECT x.id, x.canonical_product_id, x.alias, x.normalized_alias, x.alias_type, x.source_record_id, x.confidence, TRUE, NOW(), NOW(),
        x.alias_scope, x.manufacturer_id, x.product_line_id, x.source_system, 'catalog_product_source', '${RUN_ID}', '${PUBLISH_AT}'::timestamptz
      FROM jsonb_to_recordset($1::jsonb) AS x(
        id TEXT, canonical_product_id TEXT, alias TEXT, normalized_alias TEXT, alias_type TEXT, source_record_id TEXT, confidence TEXT,
        alias_scope TEXT, manufacturer_id TEXT, product_line_id TEXT, source_system TEXT)
      ON CONFLICT DO NOTHING
    `);

    const reviewItems = readJson("src/data/product-truth-review-items.json")
      .filter((item) => item.reason === "developer_system_identity_uncertain")
      .map((item) => ({
        id: `review-${hash(`${RUN_ID}:${item.canonicalProductId}:${item.reason}`).slice(0, 24)}`,
        review_type: "manual_review_requested",
        canonical_product_id: item.canonicalProductId,
        status: "open",
        priority: 3,
        confidence: "medium",
        reason_code: item.reason,
        evidence: item,
        rules_version: "developer-oxidant-identity-policy-v1",
      }));
    counts.reviews = await bulk(client, reviewItems, `
      INSERT INTO product_review_items (id, review_type, canonical_product_id, status, priority, confidence, reason_code, evidence, created_at, updated_at, rules_version)
      SELECT x.id, x.review_type, x.canonical_product_id, x.status, x.priority, x.confidence, x.reason_code, x.evidence, NOW(), NOW(), x.rules_version
      FROM jsonb_to_recordset($1::jsonb) AS x(id TEXT, review_type TEXT, canonical_product_id TEXT, status TEXT, priority INT, confidence TEXT, reason_code TEXT, evidence JSONB, rules_version TEXT)
      ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, evidence=EXCLUDED.evidence, updated_at=NOW()
    `);

    await client.query(
      "UPDATE product_truth_import_runs SET status='published', promoted_at=NOW(), published_at=NOW(), completed_at=NOW(), after_counts=$2::jsonb WHERE run_id=$1",
      [RUN_ID, JSON.stringify(counts)]
    );
    await client.query("COMMIT");
    console.log(JSON.stringify({ status: "promote_committed", runId: RUN_ID, publishAt: PUBLISH_AT, counts, classificationLinkedCanonicals: classificationByCanonical.size }, null, 2));
  } catch (err) {
    try { await client.query("ROLLBACK"); } catch {}
    console.error(JSON.stringify({ status: "promote_failed_rolled_back", error: err.message }, null, 2));
    process.exit(1);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
