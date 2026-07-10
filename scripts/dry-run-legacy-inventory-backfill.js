#!/usr/bin/env node
/**
 * scripts/dry-run-legacy-inventory-backfill.js
 * ─────────────────────────────────────────────────────────────────────────
 * DRY-RUN ONLY backfill validator for legacy inventory.
 *
 * Reads legacy `inventory_products` (migration 15) and attempts, per row, to
 * map it to a global `catalog_products` row using a confidence-based approach.
 * It NEVER inserts/updates `salon_inventory_products`.
 *
 * Modes:
 *   (default)         read-only. Produces a JSON + markdown report only.
 *   --write-review    additionally UPSERTs into legacy_inventory_migration_review
 *                     (staging/review table ONLY — never final inventory).
 *
 * Usage:
 *   node scripts/dry-run-legacy-inventory-backfill.js
 *   node scripts/dry-run-legacy-inventory-backfill.js --write-review
 *   node scripts/dry-run-legacy-inventory-backfill.js --limit 500
 *
 * Matching tiers (strongest first):
 *   high / barcode_exact          legacy.barcode -> catalog_product_barcodes (unique)
 *   high / source_barcode_exact   legacy.barcode -> catalog_product_sources.raw_barcode (unique)
 *   high / brand_line_shade_exact brand+line+shade -> single active catalog product
 *   medium / strong_name_match    brand matched + strong normalized-name / alias match (single)
 *   low / weak_fuzzy_match        fuzzy similarity candidates, not confident
 *   ambiguous                     multiple candidates tie at the strongest tier
 *   unmatched                     no credible candidate
 *   skipped                       missing/invalid salon_id or product identity, inactive row
 *
 * Only `high` with a single candidate is eligible for later auto-migration
 * (would_migrate = true). Everything else goes to review.
 *
 * The goal is not to migrate as much as possible. The goal is to migrate only
 * what we can trust, and send the rest to review.
 */
"use strict";

try { require("dotenv").config(); } catch (_) {}
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const DATABASE_URL = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

// ── CLI args ────────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const WRITE_REVIEW = argv.includes("--write-review");
const LIMIT = (() => {
  const i = argv.indexOf("--limit");
  return i >= 0 ? Math.max(1, parseInt(argv[i + 1], 10) || 0) : null;
})();

// Confidence thresholds (trigram similarity, 0..1)
const STRONG_NAME_SIM = 0.6;
const WEAK_NAME_SIM = 0.3;
const BRAND_SIM = 0.45;

// ── helpers ───────────────────────────────────────────────────────────────
function norm(s) {
  return (s || "")
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\u0590-\u05ff]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

// Generic brand words + region markers that add noise to trigram brand
// matching (e.g. "L'Oréal Professionnel" vs "LONDA PROFESSIONAL"). Stripping
// them isolates the distinctive brand core ("l oreal" vs "londa").
const BRAND_STOPWORDS = new Set([
  "professional", "professionnel", "profesional", "professionel", "prof", "pro",
  "paris", "cosmetics", "cosmetic", "hair", "haircare", "color", "colour", "usa",
]);
const REGION_MARKERS = ["jp", "us", "eu", "uk", "kr", "cn", "intl", "international"];

function brandCore(normalized) {
  const core = (normalized || "")
    .split(" ")
    .filter((tok) => tok && !BRAND_STOPWORDS.has(tok))
    .join(" ")
    .trim();
  return core || normalized || "";
}

function hasRegionMarker(normalized) {
  const toks = (normalized || "").split(" ");
  return REGION_MARKERS.some((m) => toks.includes(m));
}

// Dice coefficient over character trigrams — mirrors pg_trgm similarity closely
// enough for comparing short brand cores in JS without another DB round-trip.
function trigrams(s) {
  const padded = `  ${s} `;
  const set = new Set();
  for (let i = 0; i < padded.length - 2; i += 1) set.add(padded.slice(i, i + 3));
  return set;
}
function jsTrigramSim(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const ta = trigrams(a);
  const tb = trigrams(b);
  let inter = 0;
  for (const g of ta) if (tb.has(g)) inter += 1;
  return (2 * inter) / (ta.size + tb.size);
}

function runId() {
  return "backfill-" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function pushExample(bucketExamples, bucket, example) {
  bucketExamples[bucket] = bucketExamples[bucket] || [];
  if (bucketExamples[bucket].length < 5) bucketExamples[bucket].push(example);
}

// ── matching core ───────────────────────────────────────────────────────────
async function matchLegacyRow(client, legacy, brandCache) {
  const salonId = legacy.salon_id;
  const legacyBarcode = (legacy.barcode || "").trim();
  const legacyBrandName = legacy.brand_name || "";
  const legacyLineName = legacy.line_name || "";
  const legacyShade = (legacy.shade_code || "").trim();
  const legacyDisplay = legacy.display_name || "";

  const result = {
    salon_id: salonId,
    legacy_inventory_id: legacy.id,
    match_status: "unmatched",
    match_confidence: "none",
    match_method: null,
    match_score: null,
    matched_product_id: null,
    candidate_product_ids: [],
    review_bucket: "unmatched",
    would_migrate: false,
    reason: null,
    reason_details: {},
    legacy_snapshot: {
      salon_id: salonId,
      brand_name: legacyBrandName,
      line_name: legacyLineName,
      shade_code: legacyShade,
      display_name: legacyDisplay,
      barcode: legacyBarcode || null,
      units_in_stock: legacy.units_in_stock,
      cost_usd: legacy.cost_usd,
      selling_price_usd: legacy.selling_price_usd,
    },
    candidate_snapshot: {},
  };

  // ── skip guards ──
  if (!salonId || !legacy.salon_exists) {
    result.match_status = "skipped";
    result.review_bucket = "skipped";
    result.reason = "missing_or_invalid_salon_id";
    result.reason_details = { salonId, salonExists: !!legacy.salon_exists };
    return result;
  }
  if (legacy.status && legacy.status !== "active") {
    result.match_status = "skipped";
    result.review_bucket = "skipped";
    result.reason = "inactive_legacy_row";
    result.reason_details = { status: legacy.status };
    return result;
  }
  if (!legacyBrandName && !legacyDisplay && !legacyShade) {
    result.match_status = "skipped";
    result.review_bucket = "skipped";
    result.reason = "missing_product_identity";
    return result;
  }

  // ── Tier 1: barcode via catalog_product_barcodes ──
  if (legacyBarcode) {
    const r = await client.query(
      `SELECT DISTINCT product_id FROM catalog_product_barcodes
       WHERE barcode = $1 AND status = 'active'`,
      [legacyBarcode],
    );
    if (r.rows.length === 1) {
      return finalizeHigh(result, "barcode_exact", r.rows[0].product_id, 1.0, { barcode: legacyBarcode });
    }
    if (r.rows.length > 1) {
      return finalizeAmbiguous(result, "barcode_exact", r.rows.map((x) => x.product_id), { barcode: legacyBarcode });
    }

    // ── Tier 2: barcode via catalog_product_sources.raw_barcode ──
    const s = await client.query(
      `SELECT DISTINCT canonical_product_id FROM catalog_product_sources
       WHERE raw_barcode = $1 AND canonical_product_id IS NOT NULL
         AND COALESCE(assignment_active, true) = true`,
      [legacyBarcode],
    );
    if (s.rows.length === 1) {
      return finalizeHigh(result, "source_barcode_exact", s.rows[0].canonical_product_id, 0.98, { barcode: legacyBarcode });
    }
    if (s.rows.length > 1) {
      return finalizeAmbiguous(result, "source_barcode_exact", s.rows.map((x) => x.canonical_product_id), { barcode: legacyBarcode });
    }
    result.reason_details.barcode_no_match = legacyBarcode;
  }

  // ── Map legacy brand -> catalog brand ──
  // Trigram alone is unreliable for brand names because generic words like
  // "professional" dominate. We isolate the brand core, score with a JS
  // trigram, deterministically avoid regional-duplicate brands, and require a
  // dominance margin before trusting the mapping. Ties become brand_ambiguous.
  const normBrand = norm(legacyBrandName);
  const coreBrand = brandCore(normBrand);
  let brandPick = brandCache.get(normBrand);
  if (brandPick === undefined) {
    const b = await client.query(
      `SELECT id, canonical_name, normalized_name,
              similarity(normalized_name, $1) AS sim
       FROM catalog_brands
       WHERE normalized_name = $1
          OR similarity(normalized_name, $1) > 0.2
          OR normalized_name ILIKE '%' || $2 || '%'
       ORDER BY sim DESC
       LIMIT 15`,
      [normBrand, coreBrand],
    );
    const scored = b.rows.map((row) => {
      const nn = row.normalized_name || "";
      const core = brandCore(nn);
      let score;
      if (nn === normBrand) score = 1.0;
      else if (core === coreBrand) score = 0.97;
      else if (core && coreBrand && (core.includes(coreBrand) || coreBrand.includes(core))) score = 0.9;
      else score = Math.max(Number(row.sim) || 0, jsTrigramSim(coreBrand, core));
      // Penalize regional-duplicate brand records so the canonical wins ties.
      if (hasRegionMarker(nn)) score -= 0.05;
      return { id: row.id, canonical_name: row.canonical_name, normalized_name: nn, score };
    });
    scored.sort((x, y) => y.score - x.score || x.normalized_name.length - y.normalized_name.length);
    const best = scored[0] || null;
    const second = scored[1] || null;
    brandPick = { best, second, scored: scored.slice(0, 5) };
    brandCache.set(normBrand, brandPick);
  }

  const best = brandPick.best;
  const second = brandPick.second;
  if (!best || best.score < BRAND_SIM) {
    result.match_status = "unmatched";
    result.review_bucket = "unmatched";
    result.reason = "brand_not_mapped";
    result.reason_details.legacy_brand = legacyBrandName;
    result.reason_details.best_brand_score = best ? best.score : null;
    return result;
  }
  // Confident brand mapping requires the top candidate to clearly dominate.
  if (second && best.score - second.score < 0.08 && best.score < 0.97) {
    result.match_status = "ambiguous";
    result.review_bucket = "ambiguous";
    result.match_confidence = "low";
    result.reason = "brand_ambiguous";
    result.reason_details.brand_candidates = brandPick.scored;
    return result;
  }
  const brand = best;
  result.reason_details.mapped_brand = { id: brand.id, name: brand.canonical_name, score: brand.score };

  // ── Candidate products within the mapped brand, by name similarity ──
  const normLine = norm(legacyLineName);
  const normShade = norm(legacyShade);
  const candidateText = norm(`${legacyDisplay} ${legacyLineName} ${legacyShade}`) || norm(legacyDisplay);

  const cand = await client.query(
    `SELECT cp.id, cp.canonical_name, cp.normalized_name,
            cp.shade_code_raw, cp.shade_code_normalized,
            cpl.canonical_name AS line_name, cpl.normalized_name AS line_norm,
            similarity(cp.normalized_name, $2) AS name_sim
     FROM catalog_products cp
     LEFT JOIN catalog_product_lines cpl ON cpl.id = cp.product_line_id
     WHERE cp.active = true AND cp.manufacturer_id = $1
     ORDER BY similarity(cp.normalized_name, $2) DESC
     LIMIT 25`,
    [brand.id, candidateText],
  );
  const rows = cand.rows.map((r) => ({ ...r, name_sim: Number(r.name_sim) }));

  // ── Tier 3: brand + line + shade exact ──
  const lineMatches = (r) => !normLine || norm(r.line_norm || r.line_name || "") === normLine;
  const shadeMatches = (r) =>
    normShade &&
    (norm(r.shade_code_normalized || "") === normShade ||
      norm(r.shade_code_raw || "") === normShade ||
      norm(r.normalized_name || "").split(" ").includes(normShade));

  const exactLineShade = rows.filter((r) => lineMatches(r) && shadeMatches(r));
  if (exactLineShade.length === 1) {
    return finalizeHigh(result, "brand_line_shade_exact", exactLineShade[0].id, 0.95, {
      brand: brand.canonical_name,
      line: exactLineShade[0].line_name,
      shade: legacyShade,
      candidate_name: exactLineShade[0].canonical_name,
    }, exactLineShade.map((r) => r.id));
  }
  if (exactLineShade.length > 1) {
    return finalizeAmbiguous(result, "brand_line_shade_exact", exactLineShade.map((r) => r.id), {
      brand: brand.canonical_name,
      line: legacyLineName,
      shade: legacyShade,
    });
  }

  // ── Alias exact match (strong) ──
  if (candidateText) {
    const alias = await client.query(
      `SELECT DISTINCT canonical_product_id FROM product_aliases
       WHERE normalized_alias = $1 AND COALESCE(active, true) = true
         AND (manufacturer_id IS NULL OR manufacturer_id = $2)`,
      [candidateText, brand.id],
    );
    if (alias.rows.length === 1) {
      return finalizeMedium(result, "alias_exact", alias.rows[0].canonical_product_id, 0.9, {
        alias: candidateText,
      });
    }
    if (alias.rows.length > 1) {
      return finalizeAmbiguous(result, "alias_exact", alias.rows.map((r) => r.canonical_product_id), {
        alias: candidateText,
      });
    }
  }

  // ── Tier 4: strong normalized name match (medium) ──
  const strong = rows.filter((r) => r.name_sim >= STRONG_NAME_SIM && lineMatches(r));
  if (strong.length === 1) {
    return finalizeMedium(result, "strong_name_match", strong[0].id, strong[0].name_sim, {
      candidate_name: strong[0].canonical_name,
      name_sim: strong[0].name_sim,
    });
  }
  if (strong.length > 1) {
    // If the top score clearly dominates, still send to review as medium-ambiguous.
    return finalizeAmbiguous(result, "strong_name_match", strong.slice(0, 5).map((r) => r.id), {
      top_candidates: strong.slice(0, 5).map((r) => ({ id: r.id, name: r.canonical_name, sim: r.name_sim })),
    }, "medium");
  }

  // ── Tier 5: weak fuzzy (low) ──
  const weak = rows.filter((r) => r.name_sim >= WEAK_NAME_SIM);
  if (weak.length >= 1) {
    result.match_status = "matched";
    result.match_confidence = "low";
    result.match_method = "weak_fuzzy_match";
    result.matched_product_id = weak[0].id;
    result.match_score = weak[0].name_sim;
    result.candidate_product_ids = weak.slice(0, 5).map((r) => r.id);
    result.review_bucket = "review_low";
    result.would_migrate = false;
    result.reason = "weak_fuzzy_only";
    result.candidate_snapshot = {
      top_candidates: weak.slice(0, 5).map((r) => ({ id: r.id, name: r.canonical_name, sim: r.name_sim })),
    };
    return result;
  }

  // ── unmatched ──
  result.match_status = "unmatched";
  result.review_bucket = "unmatched";
  result.reason = "no_candidate_in_brand";
  result.reason_details.best_sim = rows[0] ? rows[0].name_sim : null;
  return result;
}

function finalizeHigh(result, method, productId, score, snapshot, candidateIds) {
  result.match_status = "matched";
  result.match_confidence = "high";
  result.match_method = method;
  result.matched_product_id = productId;
  result.match_score = score;
  result.candidate_product_ids = candidateIds || [productId];
  result.review_bucket = "auto_migrate";
  result.would_migrate = true;
  result.reason = method;
  result.candidate_snapshot = snapshot;
  return result;
}

function finalizeMedium(result, method, productId, score, snapshot) {
  result.match_status = "matched";
  result.match_confidence = "medium";
  result.match_method = method;
  result.matched_product_id = productId;
  result.match_score = score;
  result.candidate_product_ids = [productId];
  result.review_bucket = "review_medium";
  result.would_migrate = false;
  result.reason = method;
  result.candidate_snapshot = snapshot;
  return result;
}

function finalizeAmbiguous(result, method, productIds, snapshot, confidence) {
  result.match_status = "ambiguous";
  result.match_confidence = confidence || "high";
  result.match_method = method;
  result.candidate_product_ids = productIds;
  result.review_bucket = "ambiguous";
  result.would_migrate = false;
  result.reason = `ambiguous_${method}`;
  result.candidate_snapshot = snapshot;
  return result;
}

// ── main ────────────────────────────────────────────────────────────────────
(async () => {
  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    console.error("NEON_DATABASE_URL / DATABASE_URL is not configured.");
    process.exit(1);
  }

  const RUN_ID = runId();
  const outDir = path.join(process.cwd(), "reports", "inventory-backfill-dry-runs", RUN_ID);
  fs.mkdirSync(outDir, { recursive: true });

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();

  const report = {
    runId: RUN_ID,
    generatedAt: new Date().toISOString(),
    mode: WRITE_REVIEW ? "write-review" : "read-only",
    thresholds: { STRONG_NAME_SIM, WEAK_NAME_SIM, BRAND_SIM },
  };

  try {
    await client.query("SELECT set_config('statement_timeout','60000', false)");

    // Guard: prove salon_inventory_products is untouched.
    const invBefore = await client.query(`SELECT COUNT(*)::int AS c FROM salon_inventory_products`);
    report.salonInventoryCountBefore = invBefore.rows[0].c;

    // ── Source summary ──
    const srcSummary = await client.query(`
      SELECT
        COUNT(*)::int AS total_rows,
        COUNT(*) FILTER (WHERE salon_id IS NOT NULL AND salon_id <> '')::int AS with_salon,
        COUNT(*) FILTER (WHERE brand_id IS NOT NULL)::int AS with_brand,
        COUNT(*) FILTER (WHERE product_line_id IS NOT NULL)::int AS with_line,
        COUNT(*) FILTER (WHERE barcode IS NOT NULL AND barcode <> '')::int AS with_barcode,
        COUNT(*) FILTER (WHERE (shade_code IS NOT NULL AND shade_code <> '') OR (display_name IS NOT NULL AND display_name <> ''))::int AS with_shade_or_name,
        COUNT(*) FILTER (WHERE status IS NOT NULL AND status <> 'active')::int AS non_active
      FROM inventory_products`);
    report.sourceSummary = srcSummary.rows[0];

    const bySalon = await client.query(`
      SELECT salon_id, COUNT(*)::int AS rows,
             COUNT(*) FILTER (WHERE barcode IS NOT NULL AND barcode <> '')::int AS with_barcode
      FROM inventory_products GROUP BY salon_id ORDER BY rows DESC`);
    report.rowsBySalon = bySalon.rows;

    // ── Fetch legacy rows (joined to legacy brands/lines + salon existence) ──
    const legacyRows = await client.query(
      `SELECT ip.id, ip.salon_id, ip.brand_id, ip.product_line_id, ip.shade_code,
              ip.display_name, ip.barcode, ip.units_in_stock, ip.cost_usd,
              ip.selling_price_usd, ip.status,
              b.name AS brand_name, pl.name AS line_name,
              (s.id IS NOT NULL) AS salon_exists
       FROM inventory_products ip
       LEFT JOIN brands b ON b.id = ip.brand_id
       LEFT JOIN product_lines pl ON pl.id = ip.product_line_id
       LEFT JOIN salons s ON s.id = ip.salon_id
       ORDER BY ip.salon_id, ip.id
       ${LIMIT ? `LIMIT ${LIMIT}` : ""}`,
    );

    const brandCache = new Map();
    const outcomes = [];
    for (const legacy of legacyRows.rows) {
      // eslint-disable-next-line no-await-in-loop
      const outcome = await matchLegacyRow(client, legacy, brandCache);
      outcomes.push(outcome);
    }

    // ── Duplicate safety: (salon_id, product_id) already in salon_inventory_products ──
    for (const o of outcomes) {
      if (o.matched_product_id) {
        // eslint-disable-next-line no-await-in-loop
        const dup = await client.query(
          `SELECT 1 FROM salon_inventory_products WHERE salon_id = $1 AND product_id = $2 LIMIT 1`,
          [o.salon_id, o.matched_product_id],
        );
        if (dup.rows.length > 0) {
          o.reason_details = { ...o.reason_details, duplicate_existing: true };
          if (o.review_bucket === "auto_migrate") {
            o.would_migrate = false;
            o.review_bucket = "review_medium";
            o.reason = "duplicate_existing_inventory";
          }
        }
      }
    }

    // ── Aggregate ──
    const byBucket = {};
    const byMethod = {};
    const byConfidence = {};
    const byReason = {};
    const bucketExamples = {};
    for (const o of outcomes) {
      byBucket[o.review_bucket] = (byBucket[o.review_bucket] || 0) + 1;
      byMethod[o.match_method || "none"] = (byMethod[o.match_method || "none"] || 0) + 1;
      byConfidence[o.match_confidence] = (byConfidence[o.match_confidence] || 0) + 1;
      byReason[o.reason || "none"] = (byReason[o.reason || "none"] || 0) + 1;
      pushExample(bucketExamples, o.review_bucket, {
        legacy_id: o.legacy_inventory_id,
        salon_id: o.salon_id,
        legacy: `${o.legacy_snapshot.brand_name} / ${o.legacy_snapshot.line_name} / ${o.legacy_snapshot.shade_code} (${o.legacy_snapshot.display_name})`,
        method: o.match_method,
        confidence: o.match_confidence,
        score: o.match_score,
        matched_product_id: o.matched_product_id,
        reason: o.reason,
      });
    }

    const wouldMigrate = outcomes.filter((o) => o.would_migrate).length;
    const needReview = outcomes.filter((o) => ["review_medium", "review_low"].includes(o.review_bucket)).length;
    const ambiguous = outcomes.filter((o) => o.review_bucket === "ambiguous").length;
    const unmatched = outcomes.filter((o) => o.review_bucket === "unmatched").length;
    const skipped = outcomes.filter((o) => o.review_bucket === "skipped").length;
    const barcodeDependent = outcomes.filter((o) => o.legacy_snapshot.barcode).length;

    report.matching = {
      totalAnalyzed: outcomes.length,
      wouldAutoMigrate: wouldMigrate,
      needReview,
      ambiguous,
      unmatched,
      skipped,
      byBucket,
      byMethod,
      byConfidence,
      topReasons: Object.entries(byReason).sort((a, b) => b[1] - a[1]).slice(0, 10),
    };
    report.barcodeGap = {
      catalogProductBarcodesEmpty: true,
      legacyRowsWithBarcode: barcodeDependent,
      note:
        "catalog_product_barcodes is empty, so Tier 1 barcode matching cannot fire. Tier 2 falls back to catalog_product_sources.raw_barcode. Legacy rows without a barcode rely entirely on brand+line+shade / name matching.",
    };
    report.examples = bucketExamples;
    report.safety = {
      writeReview: WRITE_REVIEW,
      neverWritesSalonInventory: true,
    };

    // ── Optionally upsert review rows (staging only) ──
    if (WRITE_REVIEW) {
      let upserts = 0;
      for (const o of outcomes) {
        // eslint-disable-next-line no-await-in-loop
        await client.query(
          `INSERT INTO legacy_inventory_migration_review
             (salon_id, legacy_inventory_id, legacy_snapshot, match_status, matched_product_id,
              match_confidence, reason, run_id, match_method, match_score,
              candidate_product_ids, candidate_snapshot, reason_details, would_migrate, review_bucket)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
           ON CONFLICT (salon_id, legacy_inventory_id) DO UPDATE SET
             legacy_snapshot = EXCLUDED.legacy_snapshot,
             match_status = EXCLUDED.match_status,
             matched_product_id = EXCLUDED.matched_product_id,
             match_confidence = EXCLUDED.match_confidence,
             reason = EXCLUDED.reason,
             run_id = EXCLUDED.run_id,
             match_method = EXCLUDED.match_method,
             match_score = EXCLUDED.match_score,
             candidate_product_ids = EXCLUDED.candidate_product_ids,
             candidate_snapshot = EXCLUDED.candidate_snapshot,
             reason_details = EXCLUDED.reason_details,
             would_migrate = EXCLUDED.would_migrate,
             review_bucket = EXCLUDED.review_bucket,
             updated_at = now()`,
          [
            o.salon_id, o.legacy_inventory_id, JSON.stringify(o.legacy_snapshot), o.match_status,
            o.matched_product_id, o.match_confidence, o.reason, RUN_ID, o.match_method, o.match_score,
            JSON.stringify(o.candidate_product_ids), JSON.stringify(o.candidate_snapshot),
            JSON.stringify(o.reason_details), o.would_migrate, o.review_bucket,
          ],
        );
        upserts += 1;
      }
      report.reviewUpserts = upserts;
    }

    // ── Prove salon_inventory_products unchanged ──
    const invAfter = await client.query(`SELECT COUNT(*)::int AS c FROM salon_inventory_products`);
    report.salonInventoryCountAfter = invAfter.rows[0].c;
    report.salonInventoryUnchanged = report.salonInventoryCountBefore === report.salonInventoryCountAfter;

    // ── Write reports ──
    const jsonPath = path.join(outDir, "dry-run-report.json");
    fs.writeFileSync(jsonPath, JSON.stringify({ ...report, outcomes }, null, 2) + "\n");
    const mdPath = path.join(outDir, "dry-run-report.md");
    fs.writeFileSync(mdPath, renderMarkdown(report));

    console.log(JSON.stringify({
      runId: RUN_ID,
      mode: report.mode,
      source: report.sourceSummary,
      matching: report.matching,
      salonInventoryUnchanged: report.salonInventoryUnchanged,
      reportJson: jsonPath,
      reportMd: mdPath,
      reviewUpserts: report.reviewUpserts || 0,
    }, null, 2));
  } finally {
    await client.end().catch(() => {});
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

// ── markdown renderer ─────────────────────────────────────────────────────
function renderMarkdown(report) {
  const m = report.matching;
  const s = report.sourceSummary;
  const lines = [];
  lines.push(`# Legacy Inventory Backfill — Dry-Run Report`);
  lines.push("");
  lines.push(`Run ID: \`${report.runId}\``);
  lines.push(`Generated: ${report.generatedAt}`);
  lines.push(`Mode: **${report.mode}** (never writes salon_inventory_products)`);
  lines.push("");
  lines.push(`## Safety`);
  lines.push(`- salon_inventory_products before: ${report.salonInventoryCountBefore}`);
  lines.push(`- salon_inventory_products after: ${report.salonInventoryCountAfter}`);
  lines.push(`- unchanged: **${report.salonInventoryUnchanged ? "YES" : "NO"}**`);
  if (report.reviewUpserts != null) lines.push(`- review rows upserted (staging only): ${report.reviewUpserts}`);
  lines.push("");
  lines.push(`## Source Inventory Summary`);
  lines.push(`| Metric | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Total legacy rows | ${s.total_rows} |`);
  lines.push(`| With salon_id | ${s.with_salon} |`);
  lines.push(`| With brand | ${s.with_brand} |`);
  lines.push(`| With product line | ${s.with_line} |`);
  lines.push(`| With barcode | ${s.with_barcode} |`);
  lines.push(`| With shade/name | ${s.with_shade_or_name} |`);
  lines.push(`| Non-active | ${s.non_active} |`);
  lines.push("");
  lines.push(`### Rows by salon`);
  lines.push(`| salon_id | rows | with barcode |`);
  lines.push(`| --- | --- | --- |`);
  for (const r of report.rowsBySalon) lines.push(`| ${r.salon_id} | ${r.rows} | ${r.with_barcode} |`);
  lines.push("");
  lines.push(`## Matching Results`);
  lines.push(`| Outcome | Count |`);
  lines.push(`| --- | --- |`);
  lines.push(`| Total analyzed | ${m.totalAnalyzed} |`);
  lines.push(`| Would auto-migrate (high, single) | ${m.wouldAutoMigrate} |`);
  lines.push(`| Need review (medium+low) | ${m.needReview} |`);
  lines.push(`| Ambiguous | ${m.ambiguous} |`);
  lines.push(`| Unmatched | ${m.unmatched} |`);
  lines.push(`| Skipped | ${m.skipped} |`);
  lines.push("");
  lines.push(`### By review bucket`);
  lines.push("```json");
  lines.push(JSON.stringify(m.byBucket, null, 2));
  lines.push("```");
  lines.push(`### By match method`);
  lines.push("```json");
  lines.push(JSON.stringify(m.byMethod, null, 2));
  lines.push("```");
  lines.push(`### Top reasons`);
  lines.push("```json");
  lines.push(JSON.stringify(m.topReasons, null, 2));
  lines.push("```");
  lines.push("");
  lines.push(`## Barcode Gap`);
  lines.push(`- Legacy rows carrying a barcode: ${report.barcodeGap.legacyRowsWithBarcode}`);
  lines.push(`- ${report.barcodeGap.note}`);
  lines.push("");
  lines.push(`## Examples per bucket`);
  for (const [bucket, examples] of Object.entries(report.examples)) {
    lines.push(`### ${bucket}`);
    lines.push("```json");
    lines.push(JSON.stringify(examples, null, 2));
    lines.push("```");
  }
  lines.push("");
  return lines.join("\n") + "\n";
}
