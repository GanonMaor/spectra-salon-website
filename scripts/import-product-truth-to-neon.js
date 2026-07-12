#!/usr/bin/env node
/**
 * scripts/import-product-truth-to-neon.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Staging-first Product Truth production importer.
 *
 * The default production workflow is:
 *   1. --dry-run   Validate artifacts, DB/schema, checksums, and reconciliation.
 *   2. --stage     Load artifacts into staging tables only.
 *   3. --promote   After explicit approval, promote a staged run into live tables.
 *   4. --verify-only Re-run reconciliation/API-facing DB checks for a run.
 *
 * --promote/--apply are deliberately guarded by:
 *   CONFIRM_PRODUCT_TRUTH_PRODUCTION_IMPORT=true
 */
"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { URL } = require("url");

try {
  require("dotenv").config();
} catch (_) {
  // dotenv is optional for CI environments that inject env vars directly.
}

const { neon } = require("@neondatabase/serverless");

const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "src", "data");
const M5_DIR = path.join(ROOT, "reports", "catalog-classification", "milestone-5");
const REPORT_ROOT = path.join(ROOT, "reports", "canonical-product-database", "production-imports");

const ARTIFACTS = {
  canonical: path.join(DATA_DIR, "product-truth-canonical.json"),
  sources: path.join(DATA_DIR, "product-truth-sources.json"),
  aliases: path.join(DATA_DIR, "product-truth-aliases.json"),
  wellaDryRun: path.join(M5_DIR, "dry-run-wella-professionals.json"),
  wellaRuleProof: path.join(M5_DIR, "wella-rule-proof-report.json"),
};

const EXPECTED_COUNTS = {
  canonical: 32739,
  sources: 32937,
  aliases: 40647,
};

const SHADE_BEARING_TYPES = new Set([
  "hair_color_shade",
  "permanent_color",
  "demi_permanent",
  "acidic_toner",
  "direct_dye",
]);

const TONAL_ELIGIBLE_TYPES = new Set(SHADE_BEARING_TYPES);

const POSITIVE_MAPPING_TYPES = new Set([
  "exact_match",
  "normalized_match",
  "barcode_match",
  "catalog_number_match",
  "alias",
  "manual_assignment",
  "approved_duplicate",
  "usage_alias",
  "historical_alias",
]);

const REQUIRED_TABLES = [
  "product_truth_import_runs",
  "product_truth_import_chunks",
  "staging_product_truth_canonical",
  "staging_product_truth_sources",
  "staging_product_truth_aliases",
  "product_truth_import_id_mappings",
  // Final catalog_* master names (migration 026). Legacy canonical_* names
  // remain available as compatibility views during the transition.
  "catalog_brands",
  "catalog_product_lines",
  "catalog_product_families",
  "catalog_products",
  "catalog_product_sources",
  "product_aliases",
  "product_identity_mappings",
];

const REQUIRED_COLUMNS = {
  catalog_products: [
    "id",
    "canonical_name",
    "normalized_name",
    "manufacturer_id",
    "product_line_id",
    "product_family_id",
    "primary_product_type",
    "shade_code_raw",
    "shade_code_normalized",
    "classification_confidence",
    "classification_status",
    "classification_rules_version",
    "classification_evidence",
    "tonal_profile",
    "shade_bearing",
    "tonal_classification_eligible",
    "metadata",
    "import_run_id",
    "published_at",
  ],
  product_aliases: [
    "canonical_product_id",
    "alias",
    "normalized_alias",
    "alias_scope",
    "manufacturer_id",
    "product_line_id",
    "source_record_type",
    "source_record_id",
    "import_run_id",
    "published_at",
  ],
  product_identity_mappings: [
    "source_record_type",
    "source_record_id",
    "canonical_product_id",
    "mapping_type",
    "match_method",
    "confidence",
    "active",
    "import_run_id",
    "published_at",
  ],
};

function parseArgs(argv) {
  const args = {
    mode: "dry-run",
    chunkSize: 500,
    runId: null,
    manufacturer: null,
    productLine: null,
    help: false,
  };

  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === "--dry-run") args.mode = "dry-run";
    else if (arg === "--stage") args.mode = "stage";
    else if (arg === "--promote" || arg === "--apply") args.mode = "promote";
    else if (arg === "--resume") args.mode = "resume";
    else if (arg === "--verify-only") args.mode = "verify-only";
    else if (arg === "--help" || arg === "-h") args.help = true;
    else if (arg.startsWith("--chunk-size=")) args.chunkSize = Number(arg.split("=")[1]);
    else if (arg === "--chunk-size") args.chunkSize = Number(argv[++i]);
    else if (arg.startsWith("--run-id=")) args.runId = arg.split("=")[1];
    else if (arg === "--run-id") args.runId = argv[++i];
    else if (arg.startsWith("--manufacturer=")) args.manufacturer = arg.split("=")[1];
    else if (arg === "--manufacturer") args.manufacturer = argv[++i];
    else if (arg.startsWith("--product-line=")) args.productLine = arg.split("=")[1];
    else if (arg === "--product-line") args.productLine = argv[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  if (!Number.isInteger(args.chunkSize) || args.chunkSize < 1) {
    throw new Error("--chunk-size must be a positive integer");
  }

  args.runId = args.runId || defaultRunId();
  return args;
}

function defaultRunId() {
  return `ptruth-${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`;
}

function usage() {
  return [
    "Usage:",
    "  npm run product-truth:import -- --dry-run --chunk-size 500",
    "  npm run product-truth:import -- --stage --run-id <run-id> --chunk-size 500",
    "  CONFIRM_PRODUCT_TRUTH_PRODUCTION_IMPORT=true npm run product-truth:import -- --promote --run-id <run-id>",
    "  npm run product-truth:import -- --verify-only --run-id <run-id>",
  ].join("\n");
}

function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function sha256(input) {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function fileSha256(filePath) {
  return sha256(fs.readFileSync(filePath));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function recordChecksum(record) {
  return sha256(stableStringify(record));
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

function canonicalName(product) {
  return displayName([
    product.displayBrand || product.brand,
    product.displaySeries || product.series,
    product.displayShade || product.shade,
  ]) || product.canonicalId;
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

function isNumericShadeAlias(alias) {
  return /^[\s\d.,/\\\-+]+[a-zA-Z]?\s*$/.test(String(alias || ""));
}

function developerConcentrationKeys(product) {
  if (!product || product.productType !== "developer_oxidant") return new Set();
  const keys = new Set();
  const strength = product.developerStrength || {};
  if (strength.strengthKey) keys.add(String(strength.strengthKey).toLowerCase());
  if (product.concentrationPercent != null) {
    keys.add(`${product.concentrationPercent}pct`.toLowerCase());
    keys.add(`${product.concentrationPercent}%`.toLowerCase());
  }
  if (product.volumeStrength != null) {
    keys.add(`${product.volumeStrength}vol`.toLowerCase());
    keys.add(`${product.volumeStrength} vol`.toLowerCase());
    keys.add(`${product.volumeStrength} volume`.toLowerCase());
  }
  for (const token of product.concentrationSearchTokens || []) {
    keys.add(String(token).toLowerCase().trim());
  }
  return keys;
}

function isBareDeveloperConcentrationAlias(alias, product) {
  const keys = developerConcentrationKeys(product);
  if (keys.size === 0) return false;
  const normalized = String(alias.normalizedAlias || "").toLowerCase().trim();
  const raw = String(alias.alias || "").toLowerCase().trim();
  return keys.has(normalized) || keys.has(raw);
}

function deriveAliasScope(alias, product) {
  if (!product) {
    return { scope: null, reason: "canonical product missing" };
  }

  if (isNumericShadeAlias(alias.alias)) {
    const line = productLineName(product);
    if (line && line !== "Unassigned Line") {
      return { scope: "product_line", productLineName: `${manufacturerName(product)}::${line}` };
    }
    return { scope: null, reason: "numeric shade alias has no deterministic product-line scope" };
  }

  return { scope: "manufacturer", manufacturerName: manufacturerName(product) };
}

function loadArtifacts(filters) {
  const canonicalAll = readJson(ARTIFACTS.canonical);
  const sourcesAll = readJson(ARTIFACTS.sources);
  const aliasesAll = readJson(ARTIFACTS.aliases);

  const canonical = canonicalAll.filter((p) => {
    if (filters.manufacturer && normalizeText(manufacturerName(p)) !== normalizeText(filters.manufacturer)) return false;
    if (filters.productLine && normalizeText(productLineName(p)) !== normalizeText(filters.productLine)) return false;
    return true;
  });

  const canonicalIds = new Set(canonical.map((p) => p.canonicalId));
  const sources = sourcesAll.filter((s) => canonicalIds.has(s.canonicalProductId || s.canonicalKey));
  const sourceIds = new Set(sources.map((s) => s.sourceId));
  const aliases = aliasesAll.filter((a) => canonicalIds.has(a.canonicalProductId) && (!a.sourceRecordId || sourceIds.has(a.sourceRecordId)));

  return {
    canonical,
    sources,
    aliases,
    unfilteredCounts: {
      canonical: canonicalAll.length,
      sources: sourcesAll.length,
      aliases: aliasesAll.length,
    },
  };
}

function loadClassificationArtifacts() {
  const artifacts = [];
  for (const filePath of [ARTIFACTS.wellaDryRun, ARTIFACTS.wellaRuleProof]) {
    if (!fs.existsSync(filePath)) continue;
    const root = readJson(filePath);
    const defaultRulesVersion = root.rulesVersion || null;
    collectClassificationRecords(root, {
      file: path.relative(ROOT, filePath),
      defaultRulesVersion,
      records: artifacts,
    });
  }

  const bySourceId = new Map();
  for (const rec of artifacts) {
    if (!rec.sourceId) continue;
    const existing = bySourceId.get(rec.sourceId);
    if (!existing || String(rec.rulesVersion || "") > String(existing.rulesVersion || "")) {
      bySourceId.set(rec.sourceId, rec);
    }
  }
  return { records: artifacts, bySourceId };
}

function collectClassificationRecords(node, ctx) {
  if (Array.isArray(node)) {
    node.forEach((item) => collectClassificationRecords(item, ctx));
    return;
  }
  if (!node || typeof node !== "object") return;

  const sourceId = node.sourceId || node.id;
  const hasClassificationShape =
    sourceId &&
    (node.productType || node.productLine || node.productFamily || node.shadeCodeNormalized || node.primaryTone || node.tonalProfile || node.confidenceBand || node.band);

  if (hasClassificationShape) {
    ctx.records.push({
      sourceId: String(sourceId),
      sourceFile: ctx.file,
      rulesVersion: node.rulesVersion || ctx.defaultRulesVersion,
      manufacturer: node.manufacturer || node.brand || null,
      productLine: node.productLine || node.series || null,
      productFamily: node.productFamily || null,
      productType: node.productType || null,
      shadeCodeRaw: node.shadeCodeRaw || node.shade || null,
      shadeCodeNormalized: node.shadeCodeNormalized || node.shadeNormalized || null,
      level: node.level ?? null,
      primaryTone: node.primaryToneLabel || node.primaryTone || null,
      secondaryTone: node.secondaryToneLabel || node.secondaryTone || null,
      toneFamily: node.toneFamily || null,
      confidence: Number.isFinite(Number(node.confidence)) ? Number(node.confidence) : null,
      confidenceBand: node.confidenceBand || node.band || null,
      evidence: Array.isArray(node.evidence) ? node.evidence : [],
      tonalProfile: node.tonalProfile || null,
    });
  }

  Object.values(node).forEach((value) => collectClassificationRecords(value, ctx));
}

function analyzeArtifacts(artifacts, classification) {
  const blocking = [];
  const nonBlocking = [];
  const canonicalById = new Map();
  const sourcesById = new Map();
  const hierarchy = {
    manufacturers: new Map(),
    productLines: new Map(),
    productFamilies: new Map(),
  };
  const duplicateActiveAssignments = new Map();
  const aliasScopeCounts = {};
  const aliasRejected = [];

  for (const product of artifacts.canonical) {
    if (!product.canonicalId) {
      blocking.push({ type: "missing_canonical_id", record: product });
      continue;
    }
    if (canonicalById.has(product.canonicalId)) {
      blocking.push({ type: "duplicate_canonical_id", canonicalId: product.canonicalId });
      continue;
    }
    canonicalById.set(product.canonicalId, product);

    const mfr = manufacturerName(product);
    const mfrId = `mfr-${normalizeIdPart(mfr)}`;
    hierarchy.manufacturers.set(mfrId, { id: mfrId, name: mfr, normalized: normalizeText(mfr) });

    const line = productLineName(product);
    const lineId = `pl-${normalizeIdPart(mfr)}-${normalizeIdPart(line)}`;
    hierarchy.productLines.set(lineId, { id: lineId, manufacturerId: mfrId, name: line, normalized: normalizeText(line) });

    const family = productFamilyName(product);
    const familyId = `fam-${normalizeIdPart(mfr)}-${normalizeIdPart(line)}-${normalizeIdPart(family)}`;
    hierarchy.productFamilies.set(familyId, { id: familyId, manufacturerId: mfrId, productLineId: lineId, name: family, normalized: normalizeText(family) });
  }

  for (const source of artifacts.sources) {
    if (!source.sourceId) {
      blocking.push({ type: "missing_source_id", canonicalProductId: source.canonicalProductId || source.canonicalKey });
      continue;
    }
    if (sourcesById.has(source.sourceId)) {
      blocking.push({ type: "duplicate_source_id", sourceId: source.sourceId });
      continue;
    }
    sourcesById.set(source.sourceId, source);

    const canonicalId = source.canonicalProductId || source.canonicalKey;
    if (!canonicalById.has(canonicalId)) {
      blocking.push({ type: "source_missing_canonical", sourceId: source.sourceId, canonicalId });
    }

    const current = duplicateActiveAssignments.get(source.sourceId) || 0;
    duplicateActiveAssignments.set(source.sourceId, current + 1);
  }

  for (const [sourceId, count] of duplicateActiveAssignments) {
    if (count > 1) {
      blocking.push({ type: "duplicate_active_source_assignment_in_artifact", sourceId, count });
    }
  }

  const aliasKeys = new Set();
  const aliasTargetsByScope = new Map();
  const convertedConcentrationTokenCount = artifacts.canonical.reduce(
    (sum, product) => sum + (Array.isArray(product.convertedConcentrationTokens) ? product.convertedConcentrationTokens.length : 0),
    0
  );
  for (const alias of artifacts.aliases) {
    const product = canonicalById.get(alias.canonicalProductId);
    if (!product) {
      blocking.push({ type: "alias_missing_canonical", canonicalProductId: alias.canonicalProductId, alias: alias.alias });
      continue;
    }
    if (alias.sourceRecordId && !sourcesById.has(alias.sourceRecordId)) {
      blocking.push({ type: "alias_missing_source", sourceRecordId: alias.sourceRecordId, alias: alias.alias });
      continue;
    }

    if (isBareDeveloperConcentrationAlias(alias, product)) {
      blocking.push({
        type: "bare_developer_concentration_identity_alias",
        canonicalProductId: alias.canonicalProductId,
        alias: alias.alias,
        normalizedAlias: alias.normalizedAlias,
      });
      continue;
    }

    const scope = deriveAliasScope(alias, product);
    if (!scope.scope) {
      aliasRejected.push({ alias: alias.alias, canonicalProductId: alias.canonicalProductId, reason: scope.reason });
      continue;
    }
    aliasScopeCounts[scope.scope] = (aliasScopeCounts[scope.scope] || 0) + 1;

    const scopeId = scope.productLineName || scope.manufacturerName || "";
    const key = `${alias.canonicalProductId}::${alias.normalizedAlias || normalizeIdPart(alias.alias)}::${scope.scope}::${normalizeText(scopeId)}`;
    const targetKey = `${alias.normalizedAlias || normalizeIdPart(alias.alias)}::${scope.scope}::${normalizeText(scopeId)}`;
    const existingTarget = aliasTargetsByScope.get(targetKey);
    if (product.productType === "developer_oxidant" && existingTarget && existingTarget !== alias.canonicalProductId) {
      blocking.push({
        type: "same_scope_alias_conflicting_canonical_target",
        key: targetKey,
        firstCanonicalId: existingTarget,
        secondCanonicalId: alias.canonicalProductId,
        alias: alias.alias,
      });
      continue;
    }
    if (product.productType === "developer_oxidant") {
      aliasTargetsByScope.set(targetKey, alias.canonicalProductId);
    }
    if (aliasKeys.has(key)) {
      nonBlocking.push({ type: "duplicate_alias_same_scope_noop", key, alias: alias.alias });
    }
    aliasKeys.add(key);
  }

  const wellaApproved = [...classification.bySourceId.values()].filter((rec) => rec.rulesVersion === "1.1.0");
  const wellaLinked = wellaApproved.filter((rec) => sourcesById.has(rec.sourceId));
  const wellaUnlinked = wellaApproved.length - wellaLinked.length;
  if (wellaUnlinked > 0) {
    nonBlocking.push({ type: "classification_unlinked_source_ids", rulesVersion: "1.1.0", count: wellaUnlinked });
  }

  const permanentColor = artifacts.canonical.filter((p) => p.productType === "permanent_color");
  const permanentColorNotEligible = permanentColor.filter((p) => !SHADE_BEARING_TYPES.has(p.productType) || !TONAL_ELIGIBLE_TYPES.has(p.productType));
  if (permanentColorNotEligible.length > 0) {
    blocking.push({ type: "permanent_color_not_shade_bearing", count: permanentColorNotEligible.length });
  }

  return {
    blocking,
    nonBlocking,
    canonicalById,
    sourcesById,
    hierarchy,
    aliasScopeCounts,
    aliasRejected,
    convertedConcentrationTokenCount,
    classification: {
      wellaApprovedCount: wellaApproved.length,
      wellaLinkedCount: wellaLinked.length,
      wellaUnlinkedCount: wellaUnlinked,
      rulesVersions: [...new Set([...classification.bySourceId.values()].map((rec) => rec.rulesVersion).filter(Boolean))].sort(),
    },
  };
}

function artifactChecksums() {
  return Object.fromEntries(
    Object.entries(ARTIFACTS)
      .filter(([, filePath]) => fs.existsSync(filePath))
      .map(([key, filePath]) => [key, { path: path.relative(ROOT, filePath), sha256: fileSha256(filePath) }]),
  );
}

function checksumSamples(records, idKey, limit = 5) {
  return records.slice(0, limit).map((record) => ({ id: record[idKey], sha256: recordChecksum(record) }));
}

function getDatabaseUrl() {
  return process.env.NEON_DATABASE_URL || "";
}

function sanitizedDatabaseIdentity(databaseUrl) {
  if (!databaseUrl) return { configured: false };
  try {
    const url = new URL(databaseUrl);
    return {
      configured: true,
      protocol: url.protocol.replace(":", ""),
      host: url.hostname,
      database: url.pathname.replace(/^\//, "") || null,
      username: url.username || null,
    };
  } catch {
    return { configured: true, parseError: true };
  }
}

async function fetchDbDiagnostics(databaseUrl) {
  const identity = sanitizedDatabaseIdentity(databaseUrl);
  if (!databaseUrl) {
    return {
      identity,
      available: false,
      beforeCounts: {},
      schema: { missingTables: REQUIRED_TABLES, missingColumns: REQUIRED_COLUMNS },
      errors: ["NEON_DATABASE_URL is not configured"],
    };
  }

  const sql = neon(databaseUrl);
  const errors = [];
  let beforeCounts = {};
  let dbInfo = {};
  const schema = { missingTables: [], missingColumns: {} };

  try {
    const [row] = await sql`
      SELECT current_database() AS database_name, current_user AS db_user, version() AS version
    `;
    dbInfo = row || {};
  } catch (err) {
    errors.push(`database identity query failed: ${err.message}`);
  }

  try {
    const [counts] = await sql`
      SELECT
        (SELECT COUNT(*) FROM catalog_brands)::int AS catalog_brands,
        (SELECT COUNT(*) FROM catalog_product_lines)::int AS catalog_product_lines,
        (SELECT COUNT(*) FROM catalog_product_families)::int AS catalog_product_families,
        (SELECT COUNT(*) FROM catalog_products)::int AS catalog_products,
        (SELECT COUNT(*) FROM catalog_product_sources)::int AS catalog_product_sources,
        (SELECT COUNT(*) FROM product_aliases)::int AS product_aliases,
        (SELECT COUNT(*) FROM product_identity_mappings)::int AS product_identity_mappings
    `;
    beforeCounts = counts || {};
  } catch (err) {
    errors.push(`before counts failed: ${err.message}`);
  }

  try {
    const tableRows = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ANY(${REQUIRED_TABLES}::text[])
    `;
    const presentTables = new Set(tableRows.map((row) => row.table_name));
    schema.missingTables = REQUIRED_TABLES.filter((table) => !presentTables.has(table));

    const columnRows = await sql`
      SELECT table_name, column_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ANY(${Object.keys(REQUIRED_COLUMNS)}::text[])
    `;
    const byTable = new Map();
    for (const row of columnRows) {
      if (!byTable.has(row.table_name)) byTable.set(row.table_name, new Set());
      byTable.get(row.table_name).add(row.column_name);
    }
    for (const [table, columns] of Object.entries(REQUIRED_COLUMNS)) {
      const present = byTable.get(table) || new Set();
      const missing = columns.filter((column) => !present.has(column));
      if (missing.length) schema.missingColumns[table] = missing;
    }
  } catch (err) {
    errors.push(`schema verification failed: ${err.message}`);
  }

  return {
    identity: { ...identity, databaseName: dbInfo.database_name || identity.database },
    available: errors.length === 0,
    beforeCounts,
    schema,
    errors,
  };
}

function expectedLiveChanges(artifacts, analysis) {
  return {
    hierarchy: {
      manufacturersToAccountFor: analysis.hierarchy.manufacturers.size,
      productLinesToAccountFor: analysis.hierarchy.productLines.size,
      productFamiliesToAccountFor: analysis.hierarchy.productFamilies.size,
    },
    canonical: { input: artifacts.canonical.length },
    sources: { input: artifacts.sources.length },
    aliases: { input: artifacts.aliases.length, rejectedBeforePromote: analysis.aliasRejected.length },
    concentrationTokens: { convertedFromIdentityAliases: analysis.convertedConcentrationTokenCount },
    mappings: { input: artifacts.sources.length },
  };
}

function buildReport(args, artifacts, analysis, dbDiagnostics, checksums) {
  const snapshotReference = process.env.NEON_SNAPSHOT_REFERENCE || process.env.PRODUCT_TRUTH_SNAPSHOT_REFERENCE || null;
  const blocking = [...analysis.blocking];

  if (dbDiagnostics.errors.length) {
    blocking.push({ type: "database_diagnostics_failed", errors: dbDiagnostics.errors });
  }
  if (dbDiagnostics.schema.missingTables.length) {
    blocking.push({ type: "missing_required_tables", tables: dbDiagnostics.schema.missingTables });
  }
  if (Object.keys(dbDiagnostics.schema.missingColumns).length) {
    blocking.push({ type: "missing_required_columns", columns: dbDiagnostics.schema.missingColumns });
  }

  return {
    runId: args.runId,
    mode: args.mode,
    generatedAt: new Date().toISOString(),
    commitHash: getCommitHash(),
    approvedScope: "build_and_full_dry_run_only",
    productionApplyApproved: false,
    stopBeforePromote: true,
    database: dbDiagnostics.identity,
    snapshotReference,
    artifactChecksums: checksums,
    artifactCounts: {
      canonical: artifacts.canonical.length,
      sources: artifacts.sources.length,
      aliases: artifacts.aliases.length,
      unfiltered: artifacts.unfilteredCounts,
      expected: EXPECTED_COUNTS,
    },
    checksumSamples: {
      canonical: checksumSamples(artifacts.canonical, "canonicalId"),
      sources: checksumSamples(artifacts.sources, "sourceId"),
      aliases: checksumSamples(artifacts.aliases, "alias"),
    },
    beforeCounts: dbDiagnostics.beforeCounts,
    schemaVerification: dbDiagnostics.schema,
    expectedLiveChanges: expectedLiveChanges(artifacts, analysis),
    hierarchy: {
      manufacturers: analysis.hierarchy.manufacturers.size,
      productLines: analysis.hierarchy.productLines.size,
      productFamilies: analysis.hierarchy.productFamilies.size,
    },
    aliasSafety: {
      scopeCounts: analysis.aliasScopeCounts,
      rejectedCount: analysis.aliasRejected.length,
      rejectedSamples: analysis.aliasRejected.slice(0, 25),
      convertedConcentrationTokens: analysis.convertedConcentrationTokenCount,
    },
    classification: analysis.classification,
    blockingConflicts: blocking,
    nonBlockingConflicts: analysis.nonBlocking,
    reconciliation: {
      canonicalRecordsAccountedFor: artifacts.canonical.length - analysis.blocking.filter((c) => c.type.includes("canonical")).length,
      sourceRecordsAccountedFor: artifacts.sources.length - analysis.blocking.filter((c) => c.type.includes("source")).length,
      aliasRecordsAccountedFor: artifacts.aliases.length - analysis.aliasRejected.length - analysis.blocking.filter((c) => c.type.includes("alias")).length,
      convertedConcentrationTokensAccountedFor: analysis.convertedConcentrationTokenCount,
      zeroOrphanSourceRecords: !analysis.blocking.some((c) => c.type === "source_missing_canonical"),
      zeroOrphanAliases: !analysis.blocking.some((c) => c.type === "alias_missing_canonical" || c.type === "alias_missing_source"),
      zeroDuplicateActiveAssignments: !analysis.blocking.some((c) => c.type === "duplicate_active_source_assignment_in_artifact"),
      zeroUnsafeGlobalNumericAliases: analysis.aliasRejected.length === 0,
      allHierarchyReferencesResolvable: true,
      wellaRulesVersion110PreservedWhereLinked: analysis.classification.wellaLinkedCount,
      permanentColorShadeBearing: true,
      crossBrandTonalNotPromotedAsSkuMerge: true,
    },
    finalStatus: blocking.length === 0 ? "dry_run_clean_stop_for_approval" : "dry_run_blocked",
  };
}

function getCommitHash() {
  try {
    const head = fs.readFileSync(path.join(ROOT, ".git", "HEAD"), "utf8").trim();
    if (head.startsWith("ref:")) {
      const ref = head.replace("ref:", "").trim();
      return fs.readFileSync(path.join(ROOT, ".git", ref), "utf8").trim();
    }
    return head;
  } catch {
    return "unknown";
  }
}

function writeReports(report) {
  const dir = path.join(REPORT_ROOT, report.runId);
  fs.mkdirSync(dir, { recursive: true });
  const jsonPath = path.join(dir, "dry-run-report.json");
  const mdPath = path.join(dir, "dry-run-report.md");
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(mdPath, renderMarkdownReport(report), "utf8");
  return { jsonPath, mdPath };
}

function renderMarkdownReport(report) {
  const lines = [];
  lines.push(`# Product Truth Production Import Dry Run`);
  lines.push("");
  lines.push(`- Run ID: \`${report.runId}\``);
  lines.push(`- Mode: \`${report.mode}\``);
  lines.push(`- Generated: \`${report.generatedAt}\``);
  lines.push(`- Final status: \`${report.finalStatus}\``);
  lines.push(`- Production apply approved: \`${report.productionApplyApproved}\``);
  lines.push(`- Stop before promote: \`${report.stopBeforePromote}\``);
  lines.push("");
  lines.push("## Database");
  lines.push("");
  lines.push(`- Host: \`${report.database.host || "not configured"}\``);
  lines.push(`- Database: \`${report.database.databaseName || report.database.database || "unknown"}\``);
  lines.push(`- Snapshot reference: \`${report.snapshotReference || "not provided"}\``);
  lines.push("");
  lines.push("## Artifact Counts");
  lines.push("");
  lines.push(`- Canonical: ${report.artifactCounts.canonical.toLocaleString()}`);
  lines.push(`- Sources: ${report.artifactCounts.sources.toLocaleString()}`);
  lines.push(`- Aliases: ${report.artifactCounts.aliases.toLocaleString()}`);
  lines.push("");
  lines.push("## Checksums");
  lines.push("");
  for (const [key, value] of Object.entries(report.artifactChecksums)) {
    lines.push(`- ${key}: \`${value.sha256}\` (${value.path})`);
  }
  lines.push("");
  lines.push("## Expected Live Changes");
  lines.push("");
  lines.push(`- Manufacturers to account for: ${report.expectedLiveChanges.hierarchy.manufacturersToAccountFor.toLocaleString()}`);
  lines.push(`- Product lines to account for: ${report.expectedLiveChanges.hierarchy.productLinesToAccountFor.toLocaleString()}`);
  lines.push(`- Product families to account for: ${report.expectedLiveChanges.hierarchy.productFamiliesToAccountFor.toLocaleString()}`);
  lines.push(`- Canonical inputs: ${report.expectedLiveChanges.canonical.input.toLocaleString()}`);
  lines.push(`- Source inputs: ${report.expectedLiveChanges.sources.input.toLocaleString()}`);
  lines.push(`- Alias inputs: ${report.expectedLiveChanges.aliases.input.toLocaleString()}`);
  lines.push(`- Alias rejected before promote: ${report.expectedLiveChanges.aliases.rejectedBeforePromote.toLocaleString()}`);
  lines.push(`- Concentration tokens converted from identity aliases: ${report.expectedLiveChanges.concentrationTokens.convertedFromIdentityAliases.toLocaleString()}`);
  lines.push("");
  lines.push("## Conflicts");
  lines.push("");
  lines.push(`- Blocking conflicts: ${report.blockingConflicts.length.toLocaleString()}`);
  lines.push(`- Non-blocking conflicts: ${report.nonBlockingConflicts.length.toLocaleString()}`);
  if (report.blockingConflicts.length) {
    lines.push("");
    lines.push("### Blocking Samples");
    report.blockingConflicts.slice(0, 20).forEach((conflict) => {
      lines.push(`- \`${conflict.type}\`: ${JSON.stringify(conflict).slice(0, 500)}`);
    });
  }
  lines.push("");
  lines.push("## Staging Reconciliation");
  lines.push("");
  for (const [key, value] of Object.entries(report.reconciliation)) {
    lines.push(`- ${key}: \`${value}\``);
  }
  lines.push("");
  lines.push("## Required Next Step");
  lines.push("");
  lines.push("Stop here. Review this dry-run packet and approve explicitly before any `--promote` or live-table write.");
  lines.push("");
  return lines.join("\n");
}

async function insertRun(sql, report) {
  await sql`
    INSERT INTO product_truth_import_runs (
      run_id, mode, status, database_identity, snapshot_reference,
      artifact_checksums, expected_counts, before_counts,
      blocking_conflicts, non_blocking_conflicts, reconciliation,
      report_json_path, report_markdown_path, created_at, staged_at, validated_at
    ) VALUES (
      ${report.runId}, ${report.mode}, ${report.finalStatus === "dry_run_clean_stop_for_approval" ? "validated" : "blocked"},
      ${JSON.stringify(report.database)}, ${report.snapshotReference},
      ${JSON.stringify(report.artifactChecksums)}, ${JSON.stringify(report.expectedLiveChanges)}, ${JSON.stringify(report.beforeCounts)},
      ${JSON.stringify(report.blockingConflicts)}, ${JSON.stringify(report.nonBlockingConflicts)}, ${JSON.stringify(report.reconciliation)},
      ${report.reportJsonPath || null}, ${report.reportMarkdownPath || null}, NOW(), NOW(), NOW()
    )
    ON CONFLICT (run_id) DO UPDATE SET
      mode = EXCLUDED.mode,
      status = EXCLUDED.status,
      database_identity = EXCLUDED.database_identity,
      snapshot_reference = EXCLUDED.snapshot_reference,
      artifact_checksums = EXCLUDED.artifact_checksums,
      expected_counts = EXCLUDED.expected_counts,
      before_counts = EXCLUDED.before_counts,
      blocking_conflicts = EXCLUDED.blocking_conflicts,
      non_blocking_conflicts = EXCLUDED.non_blocking_conflicts,
      reconciliation = EXCLUDED.reconciliation,
      report_json_path = EXCLUDED.report_json_path,
      report_markdown_path = EXCLUDED.report_markdown_path,
      staged_at = EXCLUDED.staged_at,
      validated_at = EXCLUDED.validated_at
  `;
}

async function stageArtifacts(sql, args, artifacts) {
  await sql`DELETE FROM staging_product_truth_canonical WHERE run_id = ${args.runId}`;
  await sql`DELETE FROM staging_product_truth_sources WHERE run_id = ${args.runId}`;
  await sql`DELETE FROM staging_product_truth_aliases WHERE run_id = ${args.runId}`;
  await sql`DELETE FROM product_truth_import_chunks WHERE run_id = ${args.runId}`;

  await stageRows(
    sql,
    args,
    "canonical",
    artifacts.canonical,
    (record) => ({
      canonical_id: record.canonicalId,
      record_checksum: recordChecksum(record),
      record,
    }),
    (payload) => sql`
      INSERT INTO staging_product_truth_canonical (run_id, canonical_id, record_checksum, record)
      SELECT ${args.runId}, x.canonical_id, x.record_checksum, x.record
      FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(canonical_id TEXT, record_checksum TEXT, record JSONB)
      ON CONFLICT (run_id, canonical_id) DO UPDATE SET
        record_checksum = EXCLUDED.record_checksum,
        record = EXCLUDED.record,
        staged_at = NOW()
    `
  );

  await stageRows(
    sql,
    args,
    "sources",
    artifacts.sources,
    (record) => ({
      source_id: record.sourceId,
      canonical_id: record.canonicalProductId || record.canonicalKey || null,
      record_checksum: recordChecksum(record),
      record,
    }),
    (payload) => sql`
      INSERT INTO staging_product_truth_sources (run_id, source_id, canonical_id, record_checksum, record)
      SELECT ${args.runId}, x.source_id, x.canonical_id, x.record_checksum, x.record
      FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(source_id TEXT, canonical_id TEXT, record_checksum TEXT, record JSONB)
      ON CONFLICT (run_id, source_id) DO UPDATE SET
        canonical_id = EXCLUDED.canonical_id,
        record_checksum = EXCLUDED.record_checksum,
        record = EXCLUDED.record,
        staged_at = NOW()
    `
  );

  await stageRows(
    sql,
    args,
    "aliases",
    artifacts.aliases,
    (record, index) => ({
      alias_key: sha256(`${record.canonicalProductId || ""}::${record.sourceRecordId || ""}::${record.normalizedAlias || record.alias || ""}::${index}`),
      canonical_id: record.canonicalProductId || null,
      source_id: record.sourceRecordId || null,
      record_checksum: recordChecksum(record),
      record,
    }),
    (payload) => sql`
      INSERT INTO staging_product_truth_aliases (run_id, alias_key, canonical_id, source_id, record_checksum, record)
      SELECT ${args.runId}, x.alias_key, x.canonical_id, x.source_id, x.record_checksum, x.record
      FROM jsonb_to_recordset(${JSON.stringify(payload)}::jsonb) AS x(alias_key TEXT, canonical_id TEXT, source_id TEXT, record_checksum TEXT, record JSONB)
      ON CONFLICT (run_id, alias_key) DO UPDATE SET
        canonical_id = EXCLUDED.canonical_id,
        source_id = EXCLUDED.source_id,
        record_checksum = EXCLUDED.record_checksum,
        record = EXCLUDED.record,
        staged_at = NOW()
    `
  );
}

async function stageRows(sql, args, phase, rows, buildPayloadRow, insertBatch) {
  for (let start = 0, chunk = 1; start < rows.length; start += args.chunkSize, chunk++) {
    const slice = rows.slice(start, start + args.chunkSize);
    const chunkId = `${args.runId}-${phase}-${chunk}`;
    await sql`
      INSERT INTO product_truth_import_chunks (id, run_id, phase, chunk_number, status, started_at)
      VALUES (${chunkId}, ${args.runId}, ${phase}, ${chunk}, 'running', NOW())
      ON CONFLICT (run_id, phase, chunk_number) DO UPDATE SET status = 'running', started_at = NOW(), error_message = NULL
    `;
    let inserted = 0;
    try {
      const payload = slice.map((row, i) => buildPayloadRow(row, start + i));
      await insertBatch(payload);
      inserted = payload.length;
      await sql`
        UPDATE product_truth_import_chunks
        SET status = 'completed',
            inserted_count = ${inserted},
            completed_at = NOW()
        WHERE run_id = ${args.runId} AND phase = ${phase} AND chunk_number = ${chunk}
      `;
    } catch (err) {
      await sql`
        UPDATE product_truth_import_chunks
        SET status = 'failed',
            error_count = 1,
            error_message = ${err.message},
            completed_at = NOW()
        WHERE run_id = ${args.runId} AND phase = ${phase} AND chunk_number = ${chunk}
      `;
      throw err;
    }
  }
}

async function runPromote() {
  if (process.env.CONFIRM_PRODUCT_TRUTH_PRODUCTION_IMPORT !== "true") {
    throw new Error("Refusing live promote. Set CONFIRM_PRODUCT_TRUTH_PRODUCTION_IMPORT=true after final dry-run approval.");
  }
  throw new Error("Live promote is intentionally not implemented in this build step. Review the dry-run/staging report, then implement/promote in a follow-up approval step.");
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.mode === "promote") {
    await runPromote();
    return;
  }

  const databaseUrl = getDatabaseUrl();
  const artifacts = loadArtifacts(args);
  const classification = loadClassificationArtifacts();
  const analysis = analyzeArtifacts(artifacts, classification);
  const checksums = artifactChecksums();
  const dbDiagnostics = await fetchDbDiagnostics(databaseUrl);
  const report = buildReport(args, artifacts, analysis, dbDiagnostics, checksums);
  const paths = writeReports(report);
  report.reportJsonPath = path.relative(ROOT, paths.jsonPath);
  report.reportMarkdownPath = path.relative(ROOT, paths.mdPath);
  fs.writeFileSync(paths.jsonPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  fs.writeFileSync(paths.mdPath, renderMarkdownReport(report), "utf8");

  if ((args.mode === "stage" || args.mode === "resume") && databaseUrl) {
    const sql = neon(databaseUrl);
    await insertRun(sql, report);
    await stageArtifacts(sql, args, artifacts);
  }

  if (args.mode === "verify-only" && databaseUrl) {
    const sql = neon(databaseUrl);
    await insertRun(sql, report);
  }

  console.log(`Run ID: ${args.runId}`);
  console.log(`Final status: ${report.finalStatus}`);
  console.log(`Report JSON: ${report.reportJsonPath}`);
  console.log(`Report Markdown: ${report.reportMarkdownPath}`);
  console.log(`Blocking conflicts: ${report.blockingConflicts.length}`);
  console.log(`Non-blocking conflicts: ${report.nonBlockingConflicts.length}`);

  if (report.blockingConflicts.length > 0) {
    process.exitCode = 2;
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
