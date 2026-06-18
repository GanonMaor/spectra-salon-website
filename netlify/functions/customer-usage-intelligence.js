"use strict";

const { Client } = require("pg");
const crypto = require("crypto");
const { parseWithRegistry } = require("../../scripts/lib/customer-usage-intelligence/parser-profiles");
const { buildInsightPacket } = require("../../scripts/lib/customer-usage-intelligence/engine");
const { makeId, stableLabel } = require("../../scripts/lib/customer-usage-intelligence/contracts");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Access-Code",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

const INIT_SQL = `
CREATE TABLE IF NOT EXISTS salon_accounts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  display_label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_uploads (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  parser_profile_id TEXT NOT NULL,
  original_filename TEXT NOT NULL,
  file_checksum TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL DEFAULT 0,
  uploaded_at TIMESTAMPTZ DEFAULT now(),
  date_range_start DATE,
  date_range_end DATE,
  row_count INTEGER NOT NULL DEFAULT 0,
  accepted_row_count INTEGER NOT NULL DEFAULT 0,
  rejected_row_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'committed',
  data_quality JSONB NOT NULL DEFAULT '{}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_analysis_runs (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  upload_ids TEXT[] NOT NULL DEFAULT '{}',
  product_truth_version TEXT NOT NULL DEFAULT 'unknown',
  service_classifier_version TEXT NOT NULL DEFAULT '1.0.0',
  insight_engine_version TEXT NOT NULL DEFAULT '1.0.0',
  generated_at TIMESTAMPTZ DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'completed',
  report_status TEXT NOT NULL DEFAULT 'draft',
  supersedes_analysis_run_id TEXT,
  created_by TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_analysis_facts (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL,
  fact_level TEXT NOT NULL,
  source_row_index INTEGER,
  service_event_id TEXT,
  formula_id TEXT,
  service_stage_id TEXT,
  client_visit_id TEXT,
  pseudonymous_client_id TEXT,
  event_date DATE,
  event_time TIME,
  service_type TEXT,
  raw_brand TEXT,
  raw_product_line TEXT,
  raw_product_value TEXT,
  normalized_product_key TEXT,
  quantity_grams NUMERIC(12,3),
  cost_value NUMERIC(12,3),
  canonical_product_id TEXT,
  resolution_status TEXT NOT NULL DEFAULT 'unresolved',
  confidence TEXT NOT NULL DEFAULT 'none',
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_insight_packets (
  analysis_run_id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  source_row_count INTEGER NOT NULL DEFAULT 0,
  accepted_row_count INTEGER NOT NULL DEFAULT 0,
  rejected_row_count INTEGER NOT NULL DEFAULT 0,
  resolved_product_count INTEGER NOT NULL DEFAULT 0,
  unresolved_product_count INTEGER NOT NULL DEFAULT 0,
  service_count INTEGER NOT NULL DEFAULT 0,
  formula_count INTEGER NOT NULL DEFAULT 0,
  visit_count INTEGER NOT NULL DEFAULT 0,
  client_count INTEGER NOT NULL DEFAULT 0,
  date_range JSONB NOT NULL DEFAULT '{}',
  data_quality JSONB NOT NULL DEFAULT '{}',
  support_statuses JSONB NOT NULL DEFAULT '{}',
  packet_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_insight_items (
  id TEXT PRIMARY KEY,
  analysis_run_id TEXT NOT NULL,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  insight_type TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  metric_value NUMERIC(14,4),
  metric_unit TEXT,
  calculation_definition TEXT NOT NULL,
  numerator NUMERIC(14,4),
  denominator NUMERIC(14,4),
  confidence TEXT NOT NULL DEFAULT 'medium',
  support_status TEXT NOT NULL,
  unresolved_data_effect TEXT,
  evidence_references JSONB NOT NULL DEFAULT '[]',
  drill_down_references JSONB NOT NULL DEFAULT '[]',
  payload JSONB NOT NULL DEFAULT '{}',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_unresolved_records (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  upload_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL,
  source_row_index INTEGER,
  raw_product_name TEXT,
  normalized_raw_name TEXT,
  reason TEXT NOT NULL,
  effect TEXT NOT NULL,
  candidate_count INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS usage_report_snapshots (
  id TEXT PRIMARY KEY,
  organization_id TEXT NOT NULL,
  customer_account_id TEXT NOT NULL,
  salon_id TEXT NOT NULL,
  analysis_run_id TEXT NOT NULL,
  report_title TEXT NOT NULL,
  snapshot_json JSONB NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT now(),
  immutable BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_usage_report_snapshots_salon
  ON usage_report_snapshots (organization_id, customer_account_id, salon_id, generated_at DESC);
`;

function cors(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}

function getHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const key of Object.keys(headers || {})) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return "";
}

function decodeBase64File(file) {
  if (!file || typeof file !== "string") throw new Error("Missing file payload");
  return Buffer.from(file.replace(/^data:[^;]+;base64,/i, ""), "base64");
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

async function getClient() {
  if (!DATABASE_URL) throw new Error("Database not configured");
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("neon") ? { rejectUnauthorized: false } : undefined,
  });
  await client.connect();
  await client.query(INIT_SQL);
  return client;
}

async function resolveFactsWithPg(client, facts) {
  const components = facts.filter((f) => f.factLevel === "formula_component");
  const keys = [...new Set(components.map((f) => f.normalizedProductKey).filter(Boolean))];
  if (keys.length === 0) return facts;
  const res = await client.query(
    `SELECT DISTINCT ON (pim.normalized_raw_name)
        pim.normalized_raw_name,
        pim.id AS mapping_id,
        pim.canonical_product_id,
        pim.match_method,
        pim.confidence,
        cp.canonical_name,
        cp.primary_product_type,
        cp.color_tone_family,
        cp.color_tone_code,
        cp.color_depth_level,
        cm.display_name AS manufacturer_name,
        cm.canonical_name AS manufacturer_canonical_name,
        pl.canonical_name AS product_line_name,
        pf.canonical_name AS product_family_name
       FROM product_identity_mappings pim
       LEFT JOIN canonical_products cp ON cp.id = pim.canonical_product_id
       LEFT JOIN canonical_manufacturers cm ON cm.id = cp.manufacturer_id
       LEFT JOIN product_lines pl ON pl.id = cp.product_line_id
       LEFT JOIN product_families pf ON pf.id = cp.product_family_id
      WHERE pim.normalized_raw_name = ANY($1)
        AND pim.active = true
        AND pim.mapping_type NOT IN ('rejected_match', 'keep_separate')
      ORDER BY pim.normalized_raw_name,
        CASE pim.confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
        pim.assigned_at DESC NULLS LAST`,
    [keys],
  ).catch(() => ({ rows: [] }));
  const byKey = new Map(res.rows.map((row) => [row.normalized_raw_name, row]));
  return facts.map((fact) => {
    if (fact.factLevel !== "formula_component") return fact;
    const row = byKey.get(fact.normalizedProductKey);
    if (!row) return { ...fact, resolutionStatus: "unresolved", confidence: "none" };
    return {
      ...fact,
      canonicalProductId: row.canonical_product_id,
      resolutionStatus: "resolved",
      confidence: row.confidence || "medium",
      resolvedProduct: {
        mappingId: row.mapping_id,
        canonicalProductId: row.canonical_product_id,
        canonicalName: row.canonical_name,
        primaryProductType: row.primary_product_type,
        colorToneFamily: row.color_tone_family,
        colorToneCode: row.color_tone_code,
        colorDepthLevel: row.color_depth_level,
        manufacturerName: row.manufacturer_name || row.manufacturer_canonical_name,
        productLineName: row.product_line_name,
        productFamilyName: row.product_family_name,
        matchMethod: row.match_method,
      },
    };
  });
}

function tenant(body = {}) {
  return {
    organizationId: body.organizationId || "org-default",
    customerAccountId: body.customerAccountId || "customer-default",
    salonId: body.salonId || "salon-default",
    createdBy: body.createdBy || body.created_by || "admin",
  };
}

function reportTitle(packet) {
  const start = packet.dateRange?.start || "unknown start";
  const end = packet.dateRange?.end || "unknown end";
  return `${packet.pseudonymousSalonLabel} Usage Intelligence · ${start} to ${end}`;
}

async function bulkInsert(client, table, columns, rows, chunkSize = 250, conflict = "") {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const slice = rows.slice(i, i + chunkSize);
    const params = [];
    const values = slice.map((row, rowIndex) => {
      const base = rowIndex * columns.length;
      params.push(...row);
      return `(${columns.map((_, colIndex) => `$${base + colIndex + 1}`).join(",")})`;
    });
    await client.query(
      `INSERT INTO ${table} (${columns.join(",")}) VALUES ${values.join(",")} ${conflict}`,
      params,
    );
  }
}

async function handlePreview(body) {
  const buffer = decodeBase64File(body.file);
  const fileChecksum = hashBuffer(buffer);
  const t = tenant(body);
  const uploadId = makeId("upload", `${t.organizationId}|${t.customerAccountId}|${t.salonId}|${fileChecksum}`);
  const parsed = parseWithRegistry(buffer, { ...t, uploadId });
  return cors(200, {
    parserProfileId: parsed.parserProfileId,
    parserProfileName: parsed.parserProfileName,
    detectionScore: parsed.detectionScore,
    sourceRowCount: parsed.summary.sourceRowCount,
    acceptedRowCount: parsed.summary.acceptedRowCount,
    rejectedRowCount: parsed.summary.rejectedRowCount,
    dateRange: parsed.summary.dateRange,
    serviceCount: parsed.summary.serviceCount,
    formulaCount: parsed.summary.formulaCount,
    visitCount: parsed.summary.visitCount,
    clientCount: parsed.summary.clientCount,
    dataQuality: parsed.dataQuality,
    supportStatuses: {
      brand_share_of_bowl: parsed.summary.acceptedRowCount > 0 ? "supported" : "not_supported",
      inventory_and_purchasing: "not_supported",
    },
    fileChecksum,
  });
}

async function persistReport(client, body) {
  const buffer = decodeBase64File(body.file);
  const fileChecksum = hashBuffer(buffer);
  const t = tenant(body);
  const uploadId = makeId("upload", `${t.organizationId}|${t.customerAccountId}|${t.salonId}|${fileChecksum}`);
  const analysisRunId = makeId("run", `${uploadId}|${Date.now()}|${body.supersedesAnalysisRunId || ""}`);
  const parsed = parseWithRegistry(buffer, { ...t, uploadId });
  const resolvedFacts = await resolveFactsWithPg(client, parsed.facts);
  const packet = buildInsightPacket({
    analysisRunId,
    uploadIds: [uploadId],
    organizationId: t.organizationId,
    customerAccountId: t.customerAccountId,
    salonId: t.salonId,
    parserProfileId: parsed.parserProfileId,
    parsed,
    resolvedFacts,
    productTruthVersion: body.productTruthVersion || "live",
    reportStatus: body.reportStatus || "draft",
  });
  const reportId = makeId("report", `${analysisRunId}|snapshot`);
  const snapshot = {
    reportId,
    analysisRunId,
    reportTitle: body.reportTitle || reportTitle(packet),
    generatedAt: packet.generatedAt,
    immutable: true,
    packet,
  };

  await client.query("BEGIN");
  try {
    await client.query(
      `INSERT INTO salon_accounts (id, organization_id, customer_account_id, display_label, metadata)
       VALUES ($1,$2,$3,$4,$5)
       ON CONFLICT (id) DO UPDATE SET updated_at = now()`,
      [t.salonId, t.organizationId, t.customerAccountId, stableLabel("Salon", t.salonId), JSON.stringify({ pseudonymousOnly: true })],
    );
    await client.query(
      `INSERT INTO usage_uploads (
        id, organization_id, customer_account_id, salon_id, parser_profile_id,
        original_filename, file_checksum, file_size_bytes, date_range_start, date_range_end,
        row_count, accepted_row_count, rejected_row_count, status, data_quality, metadata, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,'analyzed',$14,$15,$16)
      ON CONFLICT (id) DO UPDATE SET status = 'analyzed', updated_at = now()`,
      [
        uploadId, t.organizationId, t.customerAccountId, t.salonId, parsed.parserProfileId,
        body.filename || "usage-report.xlsx", fileChecksum, buffer.length, packet.dateRange.start, packet.dateRange.end,
        packet.sourceRowCount, packet.acceptedRowCount, packet.rejectedRowCount,
        JSON.stringify(packet.dataQuality), JSON.stringify({ parserProfileName: parsed.parserProfileName, detectionScore: parsed.detectionScore }), t.createdBy,
      ],
    );
    await client.query(
      `INSERT INTO usage_analysis_runs (
        id, organization_id, customer_account_id, salon_id, upload_ids,
        product_truth_version, service_classifier_version, insight_engine_version,
        status, report_status, supersedes_analysis_run_id, created_by, metadata
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'completed',$9,$10,$11,$12)`,
      [
        analysisRunId, t.organizationId, t.customerAccountId, t.salonId, [uploadId],
        packet.productTruthVersion, packet.serviceClassifierVersion, packet.insightEngineVersion,
        packet.reportStatus, body.supersedesAnalysisRunId || null, t.createdBy,
        JSON.stringify({ parserProfileId: parsed.parserProfileId }),
      ],
    );

    await bulkInsert(
      client,
      "usage_analysis_facts",
      [
        "id", "organization_id", "customer_account_id", "salon_id", "upload_id", "analysis_run_id",
        "fact_level", "source_row_index", "service_event_id", "formula_id", "service_stage_id", "client_visit_id",
        "pseudonymous_client_id", "event_date", "event_time", "service_type", "raw_brand", "raw_product_line",
        "raw_product_value", "normalized_product_key", "quantity_grams", "cost_value", "canonical_product_id",
        "resolution_status", "confidence", "payload",
      ],
      resolvedFacts.map((fact) => [
        fact.id, t.organizationId, t.customerAccountId, t.salonId, uploadId, analysisRunId,
        fact.factLevel, fact.sourceRowIndex || null, fact.serviceEventId || null, fact.formulaId || null,
        fact.serviceStageId || null, fact.clientVisitId || null, fact.pseudonymousClientId || null,
        fact.eventDate || null, fact.eventTime || null, fact.serviceType || null, fact.rawBrand || null,
        fact.rawProductLine || null, fact.rawProductValue || null, fact.normalizedProductKey || null,
        fact.quantityGrams || null, fact.costValue || null, fact.canonicalProductId || null,
        fact.resolutionStatus || "not_applicable", fact.confidence || "none", JSON.stringify({ ...fact.payload, resolvedProduct: fact.resolvedProduct || null }),
      ]),
      200,
      "ON CONFLICT (id) DO NOTHING",
    );

    await client.query(
      `INSERT INTO usage_insight_packets (
        analysis_run_id, organization_id, customer_account_id, salon_id,
        source_row_count, accepted_row_count, rejected_row_count,
        resolved_product_count, unresolved_product_count, service_count, formula_count,
        visit_count, client_count, date_range, data_quality, support_statuses, packet_json
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        analysisRunId, t.organizationId, t.customerAccountId, t.salonId,
        packet.sourceRowCount, packet.acceptedRowCount, packet.rejectedRowCount,
        packet.resolvedProductCount, packet.unresolvedProductCount, packet.serviceCount, packet.formulaCount,
        packet.visitCount, packet.clientCount, JSON.stringify(packet.dateRange), JSON.stringify(packet.dataQuality),
        JSON.stringify(packet.supportStatuses), JSON.stringify(packet),
      ],
    );
    await bulkInsert(
      client,
      "usage_insight_items",
      [
        "id", "analysis_run_id", "organization_id", "customer_account_id", "salon_id",
        "insight_type", "title", "summary", "metric_value", "metric_unit", "calculation_definition",
        "numerator", "denominator", "confidence", "support_status", "unresolved_data_effect",
        "evidence_references", "drill_down_references", "payload", "display_order",
      ],
      packet.insightItems.map((insight) => [
        insight.id, analysisRunId, t.organizationId, t.customerAccountId, t.salonId,
        insight.insightType, insight.title, insight.summary, insight.metricValue, insight.metricUnit,
        insight.calculationDefinition, insight.numerator, insight.denominator, insight.confidence,
        insight.supportStatus, insight.unresolvedDataEffect, JSON.stringify(insight.evidenceReferences),
        JSON.stringify(insight.drillDownReferences), JSON.stringify(insight.payload), insight.displayOrder,
      ]),
      300,
    );
    await bulkInsert(
      client,
      "usage_unresolved_records",
      [
        "id", "organization_id", "customer_account_id", "salon_id", "upload_id", "analysis_run_id",
        "source_row_index", "raw_product_name", "normalized_raw_name", "reason", "effect", "candidate_count", "payload",
      ],
      packet.unresolvedRecords.map((unresolved) => [
        unresolved.id, t.organizationId, t.customerAccountId, t.salonId, uploadId, analysisRunId,
        unresolved.sourceRowIndex || null, unresolved.rawProductName, unresolved.normalizedRawName,
        unresolved.reason, unresolved.effect, unresolved.candidateCount, JSON.stringify(unresolved.payload),
      ]),
      500,
    );
    await client.query(
      `INSERT INTO usage_report_snapshots (
        id, organization_id, customer_account_id, salon_id, analysis_run_id,
        report_title, snapshot_json, immutable
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,true)`,
      [reportId, t.organizationId, t.customerAccountId, t.salonId, analysisRunId, snapshot.reportTitle, JSON.stringify(snapshot)],
    );
    await client.query("COMMIT");
    return { uploadId, analysisRunId, reportId, report: snapshot };
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

async function handleListReports(client) {
  const res = await client.query(
    `SELECT rs.id, rs.analysis_run_id, rs.salon_id, rs.report_title, rs.generated_at,
            ar.report_status, ip.date_range, ip.service_count, ip.formula_count,
            ip.client_count, ip.unresolved_product_count
       FROM usage_report_snapshots rs
       JOIN usage_analysis_runs ar ON ar.id = rs.analysis_run_id
       JOIN usage_insight_packets ip ON ip.analysis_run_id = rs.analysis_run_id
      ORDER BY rs.generated_at DESC
      LIMIT 100`,
  );
  return cors(200, {
    reports: res.rows.map((row) => ({
      reportId: row.id,
      analysisRunId: row.analysis_run_id,
      salonId: row.salon_id,
      pseudonymousSalonLabel: stableLabel("Salon", row.salon_id),
      reportTitle: row.report_title,
      generatedAt: row.generated_at,
      reportStatus: row.report_status,
      dateRange: row.date_range,
      serviceCount: row.service_count,
      formulaCount: row.formula_count,
      clientCount: row.client_count,
      unresolvedProductCount: row.unresolved_product_count,
    })),
  });
}

async function handleGetReport(client, reportId) {
  const res = await client.query(
    `SELECT snapshot_json FROM usage_report_snapshots WHERE id = $1 LIMIT 1`,
    [reportId],
  );
  if (res.rows.length === 0) return cors(404, { error: "Report not found" });
  return cors(200, { report: res.rows[0].snapshot_json });
}

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") return cors(200, "");
  if (getHeader(event.headers, "X-Access-Code") !== ACCESS_CODE) {
    return cors(401, { error: "Unauthorized" });
  }

  const path = event.path.replace(/^.*\/customer-usage-intelligence\/?/, "");
  let body = {};
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch {
      return cors(400, { error: "Invalid JSON body" });
    }
  }

  if (event.httpMethod === "POST" && path === "preview") {
    try {
      return await handlePreview(body);
    } catch (err) {
      return cors(500, { error: "Preview failed", details: err.message });
    }
  }

  let client;
  try {
    client = await getClient();
    if (event.httpMethod === "POST" && path === "reports") {
      const result = await persistReport(client, body);
      return cors(201, result);
    }
    if (event.httpMethod === "GET" && path === "reports") {
      return await handleListReports(client);
    }
    if (event.httpMethod === "GET" && path.startsWith("reports/")) {
      return await handleGetReport(client, decodeURIComponent(path.slice("reports/".length)));
    }
    return cors(404, { error: "Not found" });
  } catch (err) {
    console.error("Customer Usage Intelligence error:", err);
    return cors(500, { error: "Customer Usage Intelligence failed", details: err.message });
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
