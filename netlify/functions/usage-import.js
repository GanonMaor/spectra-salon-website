/**
 * usage-import.js
 * ---------------------------------------------------------------
 * Admin endpoint that drives the monthly usage-report ingestion
 * flow used by the Spectra admin UI.
 *
 *   POST /usage-import/preview   - parse + validate (no persist)
 *   POST /usage-import/imports   - persist + rebuild snapshot
 *   GET  /usage-import/imports   - list import history
 *   GET  /usage-import/imports/:id - import detail
 *   DELETE /usage-import/imports/:id - remove import (rebuild snapshot)
 *   GET  /usage-import/snapshot  - latest derived market dataset
 *   GET  /usage-import/phone-mix - phone -> mix-index for admin
 *
 * Auth: X-Access-Code header (matches the admin access code used by
 * market-insights / loreal-analytics).
 */

const { Client } = require("pg");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const zlib = require("zlib");

const {
  parseWorkbookBuffer,
  deduplicateRows,
} = require("../../scripts/lib/usage-row-parser");
const { loadUsageReportRows } = require("../../scripts/lib/usage-report-loader");
const {
  buildDataset,
  buildPhoneMixIndex,
  expandRawRow,
} = require("../../scripts/lib/usage-aggregator");
const { getBundledDataset } = require("./_lib/load-market-dataset");
const {
  buildPreview,
  hasBlockingWarnings,
} = require("../../scripts/lib/usage-quality");
const {
  canonicalMonthName,
  monthLabel,
  sortableIndex,
  monthNumber,
} = require("../../scripts/lib/usage-keys");

const DATABASE_URL =
  process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || "";

// Access code shared with the rest of the admin analytics surfaces.
const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";

const REPORTS_DIR = path.resolve(
  __dirname,
  "..",
  "..",
  "reports",
  "users_susege_reports",
);

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Access-Code",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Content-Type": "application/json",
};

const INIT_SQL = `
  CREATE TABLE IF NOT EXISTS usage_imports (
    id SERIAL PRIMARY KEY,
    month_label TEXT NOT NULL,
    year INTEGER NOT NULL,
    month_number INTEGER NOT NULL,
    sort_idx INTEGER NOT NULL,
    filename TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    file_size_bytes INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'committed',
    row_count INTEGER NOT NULL DEFAULT 0,
    user_count INTEGER NOT NULL DEFAULT 0,
    brand_count INTEGER NOT NULL DEFAULT 0,
    warnings JSONB NOT NULL DEFAULT '[]',
    summary JSONB NOT NULL DEFAULT '{}',
    notes TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    superseded_at TIMESTAMPTZ
  );

  CREATE INDEX IF NOT EXISTS idx_usage_imports_month
    ON usage_imports(month_label);
  CREATE INDEX IF NOT EXISTS idx_usage_imports_status
    ON usage_imports(status);
  CREATE INDEX IF NOT EXISTS idx_usage_imports_sort
    ON usage_imports(sort_idx);

  CREATE TABLE IF NOT EXISTS usage_report_rows (
    id BIGSERIAL PRIMARY KEY,
    import_id INTEGER NOT NULL REFERENCES usage_imports(id) ON DELETE CASCADE,
    month_label TEXT NOT NULL,
    sort_idx INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    brand TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
  );

  CREATE INDEX IF NOT EXISTS idx_usage_rows_import
    ON usage_report_rows(import_id);
  CREATE INDEX IF NOT EXISTS idx_usage_rows_month
    ON usage_report_rows(month_label);
  CREATE INDEX IF NOT EXISTS idx_usage_rows_user
    ON usage_report_rows(user_id);

  CREATE TABLE IF NOT EXISTS usage_snapshots (
    id SERIAL PRIMARY KEY,
    dataset_key TEXT NOT NULL DEFAULT 'market-intelligence',
    generated_at TIMESTAMPTZ DEFAULT now(),
    source_import_ids INTEGER[] NOT NULL DEFAULT '{}',
    summary JSONB NOT NULL DEFAULT '{}',
    payload JSONB NOT NULL,
    phone_index JSONB,
    is_current BOOLEAN NOT NULL DEFAULT true
  );

  CREATE INDEX IF NOT EXISTS idx_usage_snapshots_dataset_current
    ON usage_snapshots(dataset_key, is_current);
`;

// ── Helpers ─────────────────────────────────────────────────────────

function cors(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: typeof body === "string" ? body : JSON.stringify(body),
  };
}
function err(code, msg, extra) {
  return cors(code, { error: msg, ...(extra || {}) });
}

// Netlify Functions cap synchronous responses at ~6 MB. Some endpoints
// (snapshot, phone-mix) return the full market-intelligence dataset
// which can easily exceed that uncompressed. When the client advertises
// gzip support, return a base64-encoded gzipped body so we stay under
// the limit (5 MB JSON → ~0.7 MB gzipped).
const GZIP_THRESHOLD_BYTES = 256 * 1024;

function maybeGzip(event, statusCode, payload) {
  const body =
    typeof payload === "string" ? payload : JSON.stringify(payload);
  const accept =
    (getHeader(event.headers, "Accept-Encoding") || "").toLowerCase();
  if (!accept.includes("gzip") || body.length < GZIP_THRESHOLD_BYTES) {
    return cors(statusCode, body);
  }
  const compressed = zlib.gzipSync(body);
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      "Content-Encoding": "gzip",
      "Vary": "Accept-Encoding",
    },
    body: compressed.toString("base64"),
    isBase64Encoded: true,
  };
}

function getHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const k of Object.keys(headers || {})) {
    if (k.toLowerCase() === lower) return headers[k];
  }
  return "";
}

async function getClient() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes("neon")
      ? { rejectUnauthorized: false }
      : undefined,
  });
  await client.connect();
  return client;
}

function parseHints(body = {}) {
  const multiMonth =
    body.multiMonth === true ||
    body.annual === true ||
    body.mode === "multi-month" ||
    body.mode === "annual";
  if (multiMonth) {
    const sourceFolderYear = body.year ? Number(body.year) : null;
    if (sourceFolderYear && (sourceFolderYear < 2000 || sourceFolderYear > 2100)) {
      return { error: `Invalid year "${body.year}"` };
    }
    return {
      hintMonth: null,
      hintYear: null,
      sourceFolderYear,
      multiMonth: true,
    };
  }

  const hintMonth = body.month
    ? canonicalMonthName(body.month)
    : null;
  const hintYear = body.year ? Number(body.year) : null;
  if (hintMonth && !canonicalMonthName(hintMonth)) {
    return { error: `Invalid month "${body.month}"` };
  }
  if (hintYear && (hintYear < 2000 || hintYear > 2100)) {
    return { error: `Invalid year "${body.year}"` };
  }
  return { hintMonth, hintYear, sourceFolderYear: null, multiMonth: false };
}

function decodeBase64File(b64) {
  if (!b64 || typeof b64 !== "string") {
    throw new Error("Missing file payload");
  }
  const cleaned = b64.replace(/^data:[^;]+;base64,/i, "");
  return Buffer.from(cleaned, "base64");
}

function hashBuffer(buffer) {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function buildImportPayload({ parsed, dedupRemoved, hint }) {
  const preview = buildPreview({ parsed, hint, dedupRemoved });
  return {
    summary: preview.summary,
    warnings: preview.warnings,
    sheets: preview.sheets,
    duplicatesRemoved: preview.duplicatesRemoved,
    primaryMonth: preview.primaryMonth,
  };
}

// ── Read all historical rows from the bundled dataset ───────────────
// In Netlify Functions the `reports/` folder is NOT shipped, so we
// must rebuild history from `src/data/market-intelligence.json#rawRows`
// (which IS bundled via esbuild). We still keep an on-disk fallback
// for local `netlify dev` where the source repo is mounted.

let cachedBundledRows = null;
function readBundledRows() {
  if (cachedBundledRows) return cachedBundledRows;
  try {
    const bundled = getBundledDataset();
    const compact = (bundled && bundled.rawRows) || [];
    const expanded = [];
    for (const c of compact) {
      const row = expandRawRow(c);
      if (row && row.monthKey) expanded.push(row);
    }
    cachedBundledRows = expanded;
    return expanded;
  } catch (e) {
    console.warn("readBundledRows: bundled dataset unavailable:", e.message);
    cachedBundledRows = [];
    return [];
  }
}

function readDiskRows() {
  if (!fs.existsSync(REPORTS_DIR)) return [];
  return loadUsageReportRows(REPORTS_DIR, { dedupe: false }).rows;
}

/**
 * Historical rows used as the baseline for snapshot rebuilds.
 * Prefers freshly parsed disk files (only available in local dev),
 * falls back to the bundled JSON history that ships with the build.
 */
function readBaselineRows() {
  const disk = readDiskRows();
  if (disk.length > 0) return disk;
  return readBundledRows();
}

// ── Read DB-backed rows (only latest active import per month) ───────

async function readDbRowsLatest(client) {
  const res = await client.query(`
    WITH latest AS (
      SELECT DISTINCT ON (r.month_label) r.id
      FROM usage_report_rows r
      INNER JOIN usage_imports i ON i.id = r.import_id
      WHERE i.status = 'committed'
      ORDER BY r.month_label, i.created_at DESC, i.id DESC, r.id DESC
    )
    SELECT r.payload, r.month_label, r.import_id
    FROM usage_report_rows r
    INNER JOIN latest l ON l.id = r.id
  `);
  return res.rows.map((row) => row.payload);
}

async function readActiveImportIds(client) {
  const res = await client.query(`
    SELECT DISTINCT ON (month_label) id, month_label
    FROM (
      SELECT r.month_label, i.id, i.created_at
      FROM usage_report_rows r
      INNER JOIN usage_imports i ON i.id = r.import_id
      WHERE i.status = 'committed'
      ORDER BY r.month_label, i.created_at DESC, i.id DESC, r.id DESC
    ) latest
    ORDER BY month_label, created_at DESC, id DESC
  `);
  return [...new Set(res.rows.map((r) => r.id))];
}

// ── Combine disk + DB rows. DB wins per month_label. ────────────────

function combineRows(diskRows, dbRows) {
  const dbMonths = new Set(dbRows.map((r) => r.monthKey || ""));
  const combined = [];
  for (const r of diskRows) {
    const mk = r.monthKey || "";
    if (mk && dbMonths.has(mk)) continue; // DB wins
    combined.push(r);
  }
  for (const r of dbRows) combined.push(r);
  return combined;
}

async function rebuildSnapshot(client) {
  const baselineRows = readBaselineRows();
  const dbRows = await readDbRowsLatest(client);
  const merged = combineRows(baselineRows, dbRows);
  const { rows: deduped } = deduplicateRows(merged);
  const dataset = buildDataset(deduped, { fileCount: 0 });
  const phoneIndex = buildPhoneMixIndex(deduped, dataset.customerOverview);
  const activeIds = await readActiveImportIds(client);

  await client.query(`UPDATE usage_snapshots SET is_current = false WHERE dataset_key = 'market-intelligence' AND is_current = true`);
  const inserted = await client.query(
    `INSERT INTO usage_snapshots (dataset_key, source_import_ids, summary, payload, phone_index, is_current)
     VALUES ('market-intelligence', $1, $2, $3, $4, true) RETURNING id, generated_at`,
    [
      activeIds,
      JSON.stringify(dataset.summary),
      JSON.stringify(dataset),
      JSON.stringify(phoneIndex),
    ],
  );

  return {
    id: inserted.rows[0].id,
    generatedAt: inserted.rows[0].generated_at,
    summary: dataset.summary,
    sourceImportIds: activeIds,
    rowCount: deduped.length,
  };
}

// ── Endpoint handlers ───────────────────────────────────────────────

async function handlePreview(body) {
  const hintRes = parseHints(body);
  if (hintRes.error) return err(400, hintRes.error);

  let buffer;
  try {
    buffer = decodeBase64File(body.file);
  } catch (e) {
    return err(400, e.message);
  }

  const parsed = parseWorkbookBuffer(buffer, {
    hintMonth: hintRes.hintMonth,
    hintYear: hintRes.hintYear,
    forceMultiSheet: false,
    sourceFolderYear: hintRes.sourceFolderYear || null,
  });
  const { rows: deduped, removed } = deduplicateRows(parsed.rows);
  const payload = buildImportPayload({
    parsed,
    dedupRemoved: removed,
    hint: hintRes,
  });

  return cors(200, {
    canCommit: !hasBlockingWarnings(payload.warnings),
    fileHash: hashBuffer(buffer),
    fileSizeBytes: buffer.length,
    parsedRowCount: parsed.rows.length,
    dedupedRowCount: deduped.length,
    hint: {
      month: hintRes.hintMonth || null,
      year: hintRes.hintYear || null,
      monthLabel:
        hintRes.hintMonth && hintRes.hintYear
          ? monthLabel(hintRes.hintMonth, hintRes.hintYear)
          : null,
    },
    ...payload,
  });
}

async function handleCommit(client, body) {
  const hintRes = parseHints(body);
  if (hintRes.error) return err(400, hintRes.error);

  let buffer;
  try {
    buffer = decodeBase64File(body.file);
  } catch (e) {
    return err(400, e.message);
  }

  if (!body.filename) {
    return err(400, "filename is required");
  }

  const parsed = parseWorkbookBuffer(buffer, {
    hintMonth: hintRes.hintMonth,
    hintYear: hintRes.hintYear,
    forceMultiSheet: false,
    sourceFolderYear: hintRes.sourceFolderYear || null,
  });
  const { rows: deduped, removed } = deduplicateRows(parsed.rows);
  const payload = buildImportPayload({
    parsed,
    dedupRemoved: removed,
    hint: hintRes,
  });

  if (hasBlockingWarnings(payload.warnings) && !body.force) {
    return err(422, "Cannot commit due to blocking warnings", {
      warnings: payload.warnings,
    });
  }

  if (deduped.length === 0) {
    return err(422, "No rows would be persisted", {
      warnings: payload.warnings,
    });
  }

  // Determine import label. Monthly uploads use a single label; annual /
  // consolidated uploads keep row-level month labels and use a range label.
  const monthLabels = payload.summary.monthLabels || [];
  let primaryMonthLabel =
    hintRes.hintMonth && hintRes.hintYear
      ? monthLabel(hintRes.hintMonth, hintRes.hintYear)
      : payload.primaryMonth;
  if (!primaryMonthLabel && hintRes.multiMonth && monthLabels.length > 1) {
    primaryMonthLabel = `${monthLabels[0]}-${monthLabels[monthLabels.length - 1]}`;
  }
  if (!primaryMonthLabel) {
    return err(
      422,
      "Could not determine import month. Provide explicit month/year or use multi-month mode.",
      { foundMonths: payload.summary.monthLabels },
    );
  }
  const firstMonthLabel = monthLabels[0] || primaryMonthLabel;
  const [primaryMonthShort, primaryYearStr] = firstMonthLabel.split(" ");
  const primaryYear = parseInt(primaryYearStr, 10);
  const primaryMonthCanonical = canonicalMonthName(primaryMonthShort) ||
    canonicalMonthName(primaryMonthShort.toLowerCase()) ||
    primaryMonthShort.toLowerCase();
  const primarySortIdx = sortableIndex(primaryMonthCanonical, primaryYear);
  const primaryMonthNumber = monthNumber(primaryMonthCanonical);

  const fileHash = hashBuffer(buffer);
  const createdBy =
    body.created_by ||
    body.createdBy ||
    body.author ||
    "admin";

  try {
    await client.query("BEGIN");

    // Keep historical imports committed. Snapshot reads the newest row import
    // per row-level month_label, so DB still wins month-by-month without
    // invalidating untouched months from older consolidated imports.

    const imp = await client.query(
      `INSERT INTO usage_imports (
        month_label, year, month_number, sort_idx,
        filename, file_hash, file_size_bytes,
        status, row_count, user_count, brand_count,
        warnings, summary, notes, created_by
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,'committed',$8,$9,$10,$11,$12,$13,$14)
      RETURNING id, created_at`,
      [
        primaryMonthLabel,
        primaryYear,
        primaryMonthNumber,
        primarySortIdx,
        body.filename,
        fileHash,
        buffer.length,
        deduped.length,
        payload.summary.uniqueUsers,
        payload.summary.uniqueBrands,
        JSON.stringify(payload.warnings),
        JSON.stringify(payload.summary),
        body.notes || null,
        createdBy,
      ],
    );
    const importId = imp.rows[0].id;

    // Bulk insert rows. We chunk to avoid hitting parameter limits.
    const CHUNK = 200;
    for (let i = 0; i < deduped.length; i += CHUNK) {
      const slice = deduped.slice(i, i + CHUNK);
      const values = [];
      const params = [];
      slice.forEach((r, idx) => {
        const base = idx * 6;
        values.push(
          `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6})`,
        );
        params.push(
          importId,
          r.monthKey || primaryMonthLabel,
          r.sortIdx || primarySortIdx,
          r.userId,
          r.brand,
          JSON.stringify(r),
        );
      });
      await client.query(
        `INSERT INTO usage_report_rows
         (import_id, month_label, sort_idx, user_id, brand, payload)
         VALUES ${values.join(",")}`,
        params,
      );
    }

    await client.query("COMMIT");

    let snapshotInfo = null;
    try {
      snapshotInfo = await rebuildSnapshot(client);
    } catch (snapErr) {
      console.error("Snapshot rebuild failed:", snapErr);
    }

    return cors(201, {
      importId,
      monthLabel: primaryMonthLabel,
      year: primaryYear,
      monthNumber: primaryMonthNumber,
      filename: body.filename,
      fileHash,
      rowCount: deduped.length,
      warnings: payload.warnings,
      summary: payload.summary,
      snapshot: snapshotInfo,
    });
  } catch (e) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("Commit error:", e);
    return err(500, e.message || "Commit failed");
  }
}

async function handleListImports(client) {
  const res = await client.query(
    `SELECT id, month_label, year, month_number, sort_idx,
            filename, file_hash, file_size_bytes,
            status, row_count, user_count, brand_count,
            warnings, summary, notes, created_by, created_at, superseded_at
       FROM usage_imports
      ORDER BY sort_idx DESC, created_at DESC`,
  );
  return cors(200, { imports: res.rows });
}

async function handleImportDetail(client, idStr) {
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) return err(400, "Invalid id");
  const res = await client.query(
    `SELECT id, month_label, year, month_number, sort_idx,
            filename, file_hash, file_size_bytes,
            status, row_count, user_count, brand_count,
            warnings, summary, notes, created_by, created_at, superseded_at
       FROM usage_imports WHERE id = $1`,
    [id],
  );
  if (res.rows.length === 0) return err(404, "Import not found");
  return cors(200, { import: res.rows[0] });
}

async function handleDeleteImport(client, idStr) {
  const id = parseInt(idStr, 10);
  if (!Number.isFinite(id)) return err(400, "Invalid id");
  const res = await client.query(
    `DELETE FROM usage_imports WHERE id = $1 RETURNING month_label`,
    [id],
  );
  if (res.rowCount === 0) return err(404, "Import not found");
  let snapshotInfo = null;
  try {
    snapshotInfo = await rebuildSnapshot(client);
  } catch (e) {
    console.error("Snapshot rebuild failed:", e);
  }
  return cors(200, {
    deleted: id,
    monthLabel: res.rows[0].month_label,
    snapshot: snapshotInfo,
  });
}

async function handleSnapshot(client, queryParams, event) {
  const wantsPhone = queryParams.include === "phone";
  const res = await client.query(
    `SELECT id, generated_at, source_import_ids, summary, payload, phone_index
       FROM usage_snapshots
      WHERE dataset_key = 'market-intelligence' AND is_current = true
      ORDER BY id DESC LIMIT 1`,
  );
  if (res.rows.length === 0) {
    await rebuildSnapshot(client);
    return handleSnapshot(client, queryParams, event);
  }
  const row = res.rows[0];
  return maybeGzip(event, 200, {
    id: row.id,
    generatedAt: row.generated_at,
    sourceImportIds: row.source_import_ids,
    summary: row.summary,
    dataset: row.payload,
    phoneIndex: wantsPhone ? row.phone_index : undefined,
  });
}

async function handlePhoneMix(client, event) {
  const res = await client.query(
    `SELECT phone_index FROM usage_snapshots
      WHERE dataset_key = 'market-intelligence' AND is_current = true
      ORDER BY id DESC LIMIT 1`,
  );
  if (res.rows.length === 0 || !res.rows[0].phone_index) {
    await rebuildSnapshot(client);
    return handlePhoneMix(client, event);
  }
  return maybeGzip(event, 200, res.rows[0].phone_index);
}

async function handleRebuild(client) {
  const info = await rebuildSnapshot(client);
  return cors(200, { snapshot: info });
}

// ── Main router ─────────────────────────────────────────────────────

exports.handler = async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers: CORS_HEADERS, body: "" };
  }

  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== ACCESS_CODE) {
    return err(401, "Unauthorized");
  }

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    return err(503, "Database not configured");
  }

  const rawPath = event.path || event.rawUrl || "";
  const cleanPath =
    rawPath.replace(/.*\/\.netlify\/functions\/usage-import/, "") || "/";
  const seg = cleanPath.split("/").filter(Boolean);
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};

  let body = {};
  if (event.body) {
    try {
      const raw = event.isBase64Encoded
        ? Buffer.from(event.body, "base64").toString("utf8")
        : event.body;
      body = JSON.parse(raw);
    } catch (e) {
      return err(400, "Invalid JSON body");
    }
  }

  let client;
  try {
    client = await getClient();
    await client.query(INIT_SQL);

    // POST /preview
    if (method === "POST" && seg[0] === "preview" && seg.length === 1) {
      return await handlePreview(body);
    }

    // POST /imports
    if (method === "POST" && seg[0] === "imports" && seg.length === 1) {
      return await handleCommit(client, body);
    }

    // GET /imports
    if (method === "GET" && seg[0] === "imports" && seg.length === 1) {
      return await handleListImports(client);
    }

    // GET /imports/:id
    if (method === "GET" && seg[0] === "imports" && seg.length === 2) {
      return await handleImportDetail(client, seg[1]);
    }

    // DELETE /imports/:id
    if (method === "DELETE" && seg[0] === "imports" && seg.length === 2) {
      return await handleDeleteImport(client, seg[1]);
    }

    // GET /snapshot
    if (method === "GET" && seg[0] === "snapshot" && seg.length === 1) {
      return await handleSnapshot(client, queryParams, event);
    }

    // GET /phone-mix
    if (method === "GET" && seg[0] === "phone-mix" && seg.length === 1) {
      return await handlePhoneMix(client, event);
    }

    // POST /rebuild — force snapshot regeneration
    if (method === "POST" && seg[0] === "rebuild" && seg.length === 1) {
      return await handleRebuild(client);
    }

    return err(404, "Endpoint not found", { path: cleanPath, method });
  } catch (e) {
    console.error("usage-import error:", e);
    return err(500, e.message || "Internal error");
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (_) {}
    }
  }
};
