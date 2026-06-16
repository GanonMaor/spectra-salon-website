#!/usr/bin/env node
/**
 * scripts/build-canonical-product-truth.js
 * ---------------------------------------------------------------
 * Catalog-first canonical Product Truth builder.
 *
 * Reads:
 *   - public/catalog-brands/*.json  (all brand catalog files)
 *   - src/data/product-truth-pending-changes.json  (admin-approved overrides)
 *
 * Writes:
 *   - src/data/product-truth-canonical.json    (canonical product identities)
 *   - src/data/product-truth-aliases.json      (all aliases)
 *   - src/data/product-truth-sources.json      (source catalog records mapping)
 *   - src/data/product-truth-funnel.json       (funnel statistics)
 *   - src/data/product-truth-review-items.json (items requiring admin review)
 *   - src/data/product-truth-search-index.json (local search index)
 *
 * Run:
 *   node scripts/build-canonical-product-truth.js
 *   node scripts/build-canonical-product-truth.js --dry-run
 */

"use strict";

const fs   = require("fs");
const path = require("path");
const glob = require("glob").sync || require("glob").globSync || null;

// ── Paths ──────────────────────────────────────────────────────────────────

const ROOT         = path.resolve(__dirname, "..");
const CATALOG_DIR  = path.join(ROOT, "public", "catalog-brands");
const DATA_DIR     = path.join(ROOT, "src", "data");
const CHANGES_PATH = path.join(DATA_DIR, "product-truth-pending-changes.json");

const OUT_CANONICAL    = path.join(DATA_DIR, "product-truth-canonical.json");
const OUT_ALIASES      = path.join(DATA_DIR, "product-truth-aliases.json");
const OUT_SOURCES      = path.join(DATA_DIR, "product-truth-sources.json");
const OUT_FUNNEL       = path.join(DATA_DIR, "product-truth-funnel.json");
const OUT_REVIEW       = path.join(DATA_DIR, "product-truth-review-items.json");
const OUT_SEARCH_INDEX = path.join(DATA_DIR, "product-truth-search-index.json");

const DRY_RUN = process.argv.includes("--dry-run");

// ── Lib imports ────────────────────────────────────────────────────────────

const {
  buildCanonicalProductTruth,
  buildSearchIndex,
} = require("./lib/product-truth/canonical-builder");

// ── Helpers ────────────────────────────────────────────────────────────────

function log(msg)  { process.stdout.write(`  ${msg}\n`); }
function ok(msg)   { process.stdout.write(`  ✓ ${msg}\n`); }
function warn(msg) { process.stdout.write(`  ⚠ ${msg}\n`); }
function header(msg) { process.stdout.write(`\n${msg}\n${"─".repeat(msg.length)}\n`); }

function readJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch (err) {
    if (err.code === "ENOENT") return null;
    throw err;
  }
}

function writeJsonFile(filePath, data, label) {
  if (DRY_RUN) {
    const size = JSON.stringify(data).length;
    log(`[DRY RUN] Would write ${label} (${size.toLocaleString()} chars) → ${path.relative(ROOT, filePath)}`);
    return;
  }
  const json = JSON.stringify(data, null, 2);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, json, "utf8");
  ok(`Wrote ${label} (${json.length.toLocaleString()} chars) → ${path.relative(ROOT, filePath)}`);
}

// ── Load all brand catalog files ───────────────────────────────────────────

function loadAllCatalogRecords() {
  const brandFiles = fs
    .readdirSync(CATALOG_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => path.join(CATALOG_DIR, f));

  if (brandFiles.length === 0) {
    throw new Error(`No catalog brand files found in ${CATALOG_DIR}`);
  }

  log(`Loading ${brandFiles.length} brand catalog files...`);

  const allRecords = [];
  let fileErrors = 0;

  for (const filePath of brandFiles) {
    try {
      const data = fs.readFileSync(filePath, "utf8");
      const records = JSON.parse(data);
      if (!Array.isArray(records)) {
        warn(`Skipped non-array file: ${path.basename(filePath)}`);
        continue;
      }
      // Tag each record with its source brand file
      const brandSlug = path.basename(filePath, ".json");
      const tagged = records.map((r) => ({ ...r, _sourceBrandFile: brandSlug }));
      allRecords.push(...tagged);
    } catch (err) {
      warn(`Parse error in ${path.basename(filePath)}: ${err.message}`);
      fileErrors++;
    }
  }

  ok(`Loaded ${allRecords.length.toLocaleString()} catalog records from ${brandFiles.length} brand files (${fileErrors} errors)`);
  return allRecords;
}

// ── Apply pending admin changes ────────────────────────────────────────────

/**
 * Apply any admin-approved override changes from product-truth-pending-changes.json.
 * Changes include: manual aliases, merge decisions, classification overrides, splits.
 */
function applyPendingChanges(canonicalProducts, allAliases, pendingChanges) {
  if (!pendingChanges || !pendingChanges.changes || pendingChanges.changes.length === 0) {
    return { canonicalProducts, allAliases, appliedCount: 0 };
  }

  const changes = pendingChanges.changes;
  let appliedCount = 0;
  const productMap = new Map(canonicalProducts.map((p) => [p.canonicalId, p]));

  for (const change of changes) {
    if (!change.approved) continue;

    switch (change.type) {
      case "add_alias": {
        const product = productMap.get(change.canonicalProductId);
        if (product) {
          allAliases.push({
            canonicalProductId: change.canonicalProductId,
            alias: change.alias,
            normalizedAlias: (change.alias || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            aliasType: "manual_alias",
            source: "admin_override",
            confidence: "high",
            approvedBy: change.approvedBy || "admin",
            approvedAt: change.approvedAt,
          });
          if (product.aliasCount !== undefined) product.aliasCount++;
          appliedCount++;
        }
        break;
      }

      case "override_validation_status": {
        const product = productMap.get(change.canonicalProductId);
        if (product) {
          product.validationStatus = change.validationStatus;
          product._adminOverride = true;
          appliedCount++;
        }
        break;
      }

      case "override_product_type": {
        const product = productMap.get(change.canonicalProductId);
        if (product) {
          product.productType = change.productType;
          product._adminOverride = true;
          appliedCount++;
        }
        break;
      }

      case "override_confidence": {
        const product = productMap.get(change.canonicalProductId);
        if (product) {
          product.confidence = change.confidence;
          product._adminOverride = true;
          appliedCount++;
        }
        break;
      }
    }
  }

  return { canonicalProducts: [...productMap.values()], allAliases, appliedCount };
}

// ── Main ───────────────────────────────────────────────────────────────────

async function main() {
  header("Building Canonical Product Truth");
  if (DRY_RUN) log("Running in DRY RUN mode — no files will be written.\n");

  // 1. Load catalog records
  const rawCatalogRecords = loadAllCatalogRecords();

  // 2. Run canonical builder
  header("Running Canonical Builder");
  log(`Processing ${rawCatalogRecords.length.toLocaleString()} records...`);

  const { canonicalProducts, aliases, sources, reviewItems, funnel } =
    buildCanonicalProductTruth(rawCatalogRecords);

  ok(`Created ${canonicalProducts.length.toLocaleString()} canonical identities`);
  ok(`Detected ${funnel.exactDuplicatesMerged.toLocaleString()} duplicate records merged`);
  ok(`Generated ${aliases.length.toLocaleString()} aliases`);
  ok(`Found ${reviewItems.length.toLocaleString()} items requiring review`);

  // 3. Apply pending admin changes
  header("Applying Admin Overrides");
  const pendingChanges = readJsonFile(CHANGES_PATH);
  const {
    canonicalProducts: finalProducts,
    allAliases: finalAliases,
    appliedCount,
  } = applyPendingChanges(canonicalProducts, aliases, pendingChanges);

  if (appliedCount > 0) {
    ok(`Applied ${appliedCount} pending admin changes`);
  } else {
    log("No pending admin changes to apply.");
  }

  // 4. Build search index
  header("Building Search Index");
  const searchIndex = buildSearchIndex(finalProducts, finalAliases);
  ok(`Built search index with ${searchIndex.length.toLocaleString()} entries`);

  // 5. Print funnel summary
  header("Product Truth Funnel");
  const funnelData = {
    ...funnel,
    appliedAdminChanges: appliedCount,
  };

  log(`Total catalog rows:       ${funnelData.totalCatalogRows.toLocaleString()}`);
  log(`Normalized rows:          ${funnelData.normalizedCatalogRows.toLocaleString()}`);
  log(`Duplicates merged:        ${funnelData.exactDuplicatesMerged.toLocaleString()}`);
  log(`Aliases merged:           ${funnelData.aliasesMerged.toLocaleString()}`);
  log(`Canonical identities:     ${funnelData.canonicalProductsCreated.toLocaleString()}`);
  log(`  → Approved:             ${funnelData.approvedCanonicalProducts.toLocaleString()}`);
  log(`  → Suggested match:      ${funnelData.suggestedMatches.toLocaleString()}`);
  log(`  → Needs review:         ${funnelData.needsReview.toLocaleString()}`);
  log(`  → Inactive:             ${funnelData.inactive.toLocaleString()}`);
  log(`Review items:             ${funnelData.totalReviewItems.toLocaleString()}`);
  log(`Build time:               ${funnelData.buildDurationMs}ms`);

  const pct = ((funnelData.approvedCanonicalProducts / funnelData.canonicalProductsCreated) * 100).toFixed(1);
  log(`\nApproval rate: ${pct}% (${funnelData.approvedCanonicalProducts.toLocaleString()} / ${funnelData.canonicalProductsCreated.toLocaleString()})`);

  if (funnelData.byProductType) {
    log("\nBy product type:");
    for (const [type, count] of Object.entries(funnelData.byProductType).sort((a, b) => b[1] - a[1])) {
      log(`  ${type.padEnd(30)} ${String(count).padStart(6)}`);
    }
  }

  // 6. Write output files
  header("Writing Output Artifacts");
  writeJsonFile(OUT_FUNNEL, funnelData, "funnel");
  writeJsonFile(OUT_CANONICAL, finalProducts, "canonical products");
  writeJsonFile(OUT_ALIASES, finalAliases, "aliases");
  writeJsonFile(OUT_SOURCES, sources, "sources");
  writeJsonFile(OUT_REVIEW, reviewItems, "review items");
  writeJsonFile(OUT_SEARCH_INDEX, searchIndex, "search index");

  header("Done");
  ok(`Product Truth build complete. ${finalProducts.length.toLocaleString()} canonical products written.`);
}

main().catch((err) => {
  console.error("\n✗ Fatal error:", err.message);
  console.error(err.stack);
  process.exit(1);
});
