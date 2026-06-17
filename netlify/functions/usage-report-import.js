/**
 * netlify/functions/usage-report-import.js
 * ─────────────────────────────────────────────────────────────────────────
 * Canonical Product Database — Usage Report Importer
 *
 * Handles Hebrew/English salon usage reports (Excel XLSX / CSV).
 *
 * Spec: canonical_database_eb7beee5.plan.md — "Usage Report Input Files"
 *
 * Typical Hebrew report columns:
 *   תאריך | זמן | לקוח | שירות | מותג | סדרה | גוון | גרם | עלות | מעגל | שקילה חוזרת | פרופיל
 *
 * Actions (POST body: { action, ... }):
 *   profile    — detect sheet, headers, column map, date/time formats, preview
 *   preview    — import dry-run: group service events, classify rows, resolve products
 *   import     — commit rows after explicit approval
 *   status     — check import batch status
 *   rollback   — mark a completed batch as rolled_back (does not delete rows)
 *
 * Auth: X-Access-Code header (same as canonical-product-import.js)
 *
 * Dependencies: xlsx (already in package.json for canonical-product-import)
 *
 * Milestone: Usage Report Importer (usage-report-importer todo)
 */
"use strict";

const { neon } = require("@neondatabase/serverless");

const ACCESS_CODE = process.env.USAGE_IMPORT_ACCESS_CODE || "070315";
const PROCESSOR_VERSION = "1.0.0";
const RULES_VERSION = "1.0.0";

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "Content-Type, X-Access-Code",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Hebrew / multi-language column header aliases ─────────────────────────

const COLUMN_ALIASES = {
  serviceDate:       ["תאריך", "date", "service date", "service_date", "תאריך שירות"],
  serviceTime:       ["זמן", "time", "service time", "service_time", "שעה"],
  customerName:      ["לקוח", "customer", "client", "שם לקוח", "client name"],
  serviceName:       ["שירות", "service", "treatment", "סוג שירות", "service type"],
  rawBrand:          ["מותג", "brand", "יצרן", "manufacturer", "brand name"],
  rawProductLine:    ["סדרה", "line", "series", "product line", "product_line", "קו מוצרים"],
  rawProductValue:   ["גוון", "shade", "product", "material", "צבע", "גוון/מוצר", "material/shade"],
  quantityGrams:     ["גרם", "grams", "weight", "quantity", "כמות", "gram", "g", "משקל"],
  cost:              ["עלות", "cost", "price", "מחיר", "עלות מוצר"],
  cycle:             ["מעגל", "cycle", "מחזור"],
  reweighValue:      ["שקילה חוזרת", "reweigh", "second weighing", "reweigh value"],
  staffOrProfile:    ["פרופיל", "profile", "staff", "employee", "stylist", "מעצב", "מעצבת"],
};

// ── Row classification regexes ────────────────────────────────────────────

const SERVICE_SUMMARY_PATTERNS = [
  /^סה"כ/i, /^total/i, /^סיכום/i, /^summary/i,
  /^\s*service\s+total/i, /^עמלה/i, /^commission/i,
];

const REPORT_SUMMARY_PATTERNS = [
  /^סה"כ כולל/i, /^grand total/i, /^overall total/i, /^דוח סיכום/i,
];

const PRODUCT_TYPE_GUARDRAILS = {
  developer:  [/\b(developer|oxidant|activator|oxydant|activateur)\b/i, /\b\d+\s*%/i, /\b\d+\s*vol/i],
  lightener:  [/\b(bleach|lightener|blondor|decolorant|lightener|haaraufheller|plex\s+bleach)\b/i],
  treatment:  [/\b(botox|keratin|treatment|mask|conditioner|serum|gloss)\b/i],
  toner:      [/\b(toner|glaze|crystal|pearl)\b/i],
  neutralizer:[/\b(neutralizer|yellow\s+killer|silver|purple|violet)\b/i],
};

// ── Normalizers ───────────────────────────────────────────────────────────

function normalizeName(str) {
  if (!str) return "";
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF]/g, " ")  // keep Hebrew unicode + alphanumeric
    .replace(/\s+/g, " ")
    .trim();
}

/** Parse an Excel serial date OR display date strings like "06.16.26" "06/16/26" "2026-06-16" */
function normalizeDate(raw) {
  if (raw == null || raw === "") return { sourceValue: "", normalizedDate: null, parseMethod: "empty" };
  const s = String(raw).trim();

  // Excel serial (number)
  const serial = parseFloat(s);
  if (!isNaN(serial) && serial > 40000 && serial < 60000) {
    // Excel epoch: 1900-01-01 = 1
    const msFromEpoch = (serial - 25569) * 86400 * 1000;
    const d = new Date(msFromEpoch);
    return {
      sourceValue: s,
      normalizedDate: d.toISOString().split("T")[0],
      parseMethod: "excel_serial",
    };
  }

  // dd.mm.yy or mm.dd.yy or mm/dd/yy variants
  const dotMatch = s.match(/^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/);
  if (dotMatch) {
    const [, a, b, y] = dotMatch;
    const year = y.length === 2 ? (parseInt(y, 10) > 50 ? "19" + y : "20" + y) : y;
    // Assume MM.DD.YY (US format common in Israeli export tools)
    const candidate = new Date(`${year}-${a.padStart(2,"0")}-${b.padStart(2,"0")}`);
    if (!isNaN(candidate.getTime())) {
      return {
        sourceValue: s,
        normalizedDate: candidate.toISOString().split("T")[0],
        parseMethod: "dot_mmddyy",
      };
    }
  }

  // ISO-like
  const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return { sourceValue: s, normalizedDate: s.slice(0, 10), parseMethod: "iso" };
  }

  return { sourceValue: s, normalizedDate: null, parseMethod: "unknown" };
}

/** Parse time strings like "5:08 PM" "17:08" */
function normalizeTime(raw) {
  if (!raw) return { sourceValue: "", normalizedTime: null };
  const s = String(raw).trim();
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return { sourceValue: s, normalizedTime: null };
  let [, h, m, sec, ampm] = match;
  let hours = parseInt(h, 10);
  if (ampm) {
    if (ampm.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (ampm.toUpperCase() === "AM" && hours === 12) hours = 0;
  }
  return {
    sourceValue: s,
    normalizedTime: `${String(hours).padStart(2,"0")}:${m}:${sec ?? "00"}`,
  };
}

/** Parse grams/quantity — returns { value, unit } */
function normalizeQuantity(raw) {
  if (raw == null || raw === "") return { value: null, unit: "g" };
  const n = parseFloat(String(raw).replace(/,/g, "."));
  return { value: isNaN(n) ? null : n, unit: "g" };
}

/** Parse cost — returns { value, currency } */
function normalizeCost(raw, defaultCurrency = "ILS") {
  if (raw == null || raw === "") return { value: null, currency: defaultCurrency };
  const n = parseFloat(String(raw).replace(/,/g, ".").replace(/[^\d.-]/g, ""));
  return { value: isNaN(n) ? null : n, currency: defaultCurrency };
}

// ── Column mapping ────────────────────────────────────────────────────────

function detectColumnMap(headerRow) {
  const map = {};
  const unresolved = [];

  headerRow.forEach((cell, idx) => {
    if (cell == null || cell === "") return;
    const cellStr = String(cell).trim().toLowerCase();
    let matched = false;

    for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
      if (aliases.some((a) => cellStr === a.toLowerCase() || cellStr.includes(a.toLowerCase()))) {
        if (!map[field]) map[field] = idx;
        matched = true;
        break;
      }
    }

    if (!matched) {
      unresolved.push({ colIndex: idx, rawHeader: String(cell) });
    }
  });

  return { map, unresolved };
}

// ── Row classification ────────────────────────────────────────────────────

function classifyRow(row, colMap) {
  // Empty row
  if (!row || row.every((c) => c == null || c === "")) return "empty_row";

  const productVal = colMap.rawProductValue != null ? row[colMap.rawProductValue] : null;
  const brand      = colMap.rawBrand        != null ? row[colMap.rawBrand]        : null;
  const date       = colMap.serviceDate     != null ? row[colMap.serviceDate]      : null;
  const service    = colMap.serviceName     != null ? row[colMap.serviceName]      : null;

  const rawName = String(productVal ?? "").trim();

  // Header row (repeated headers)
  if (rawName && Object.values(COLUMN_ALIASES.rawProductValue).some((a) =>
    rawName.toLowerCase() === a.toLowerCase()
  )) return "header_row";

  // Service/report summary
  if (REPORT_SUMMARY_PATTERNS.some((p) => p.test(rawName) || p.test(String(service ?? "")))) return "report_summary";
  if (SERVICE_SUMMARY_PATTERNS.some((p) => p.test(rawName) || p.test(String(service ?? "")))) return "service_summary";

  // Row has neither product nor date → unknown
  if (!rawName && !date) return "unknown_row";

  // Row has product value → product_usage candidate
  if (rawName) return "product_usage";

  return "unknown_row";
}

// ── Product type inference (soft — stored only as a hint, not canonical truth) ──

function inferProductType(rawProductValue, rawProductLine, rawBrand) {
  const combined = [rawProductValue, rawProductLine, rawBrand]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  for (const [type, patterns] of Object.entries(PRODUCT_TYPE_GUARDRAILS)) {
    if (patterns.some((p) => p.test(combined))) return type;
  }

  // Numeric shade codes are likely color (soft inference only)
  if (/^\d+[./,]\d+$/.test(rawProductValue?.trim() ?? "")) return "color_shade_inferred";

  return "unknown";
}

// ── Service event grouping ────────────────────────────────────────────────

function groupServiceEvents(rows, colMap) {
  const events = [];
  let currentKey = null;
  let currentEvent = null;
  let rowStart = 0;

  rows.forEach((row, idx) => {
    const rowClass = classifyRow(row, colMap);
    if (rowClass !== "product_usage") return;

    const date    = colMap.serviceDate   != null ? row[colMap.serviceDate]    : null;
    const time    = colMap.serviceTime   != null ? row[colMap.serviceTime]    : null;
    const customer= colMap.customerName  != null ? row[colMap.customerName]   : null;
    const service = colMap.serviceName   != null ? row[colMap.serviceName]    : null;
    const profile = colMap.staffOrProfile!= null ? row[colMap.staffOrProfile] : null;

    const dateNorm = normalizeDate(date).normalizedDate ?? "";
    const timeNorm = normalizeTime(time).normalizedTime ?? "";
    const custNorm = normalizeName(String(customer ?? ""));
    const svcNorm  = normalizeName(String(service ?? ""));
    const profNorm = normalizeName(String(profile ?? ""));

    const key = [dateNorm, timeNorm, custNorm, svcNorm, profNorm].join("|");

    if (key !== currentKey) {
      if (currentEvent) {
        currentEvent.sourceRowEnd = idx - 1;
        events.push(currentEvent);
      }
      currentKey = key;
      rowStart = idx;
      currentEvent = {
        serviceEventId: "se-" + crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
        groupingKey: key,
        groupingMethod: "date_time_customer_service_profile",
        serviceDate: date,
        serviceTime: time,
        customerName: customer,
        serviceName: service,
        staffOrProfileName: profile,
        normalizedDate: dateNorm,
        normalizedTime: timeNorm,
        normalizedCustomer: custNorm,
        normalizedService: svcNorm,
        normalizedProfile: profNorm,
        sourceRowStart: idx,
        sourceRowEnd: idx,
        usageRows: [],
      };
    }

    if (currentEvent) {
      const brand   = colMap.rawBrand        != null ? row[colMap.rawBrand]        : null;
      const line    = colMap.rawProductLine  != null ? row[colMap.rawProductLine]  : null;
      const product = colMap.rawProductValue != null ? row[colMap.rawProductValue] : null;
      const qty     = colMap.quantityGrams   != null ? row[colMap.quantityGrams]   : null;
      const cost    = colMap.cost            != null ? row[colMap.cost]            : null;
      const cycle   = colMap.cycle           != null ? row[colMap.cycle]           : null;
      const reweigh = colMap.reweighValue    != null ? row[colMap.reweighValue]    : null;

      const qtyNorm  = normalizeQuantity(qty);
      const costNorm = normalizeCost(cost);
      const rawName  = String(product ?? "").trim();
      const inferred = inferProductType(rawName, String(line ?? ""), String(brand ?? ""));

      currentEvent.usageRows.push({
        usageRowId: "ur-" + (Math.random().toString(36).slice(2)),
        rawBrand: brand,
        rawProductLine: line,
        rawProductValue: product,
        rawProductName: rawName,
        normalizedRawName: normalizeName(rawName),
        quantityGrams: qtyNorm.value,
        quantityUnit: qtyNorm.unit,
        cost: costNorm.value,
        costCurrency: costNorm.currency,
        cycle,
        reweighValue: reweigh,
        inferredProductType: inferred,
        rowClass: "product_usage",
        sourceRowIndex: idx,
        rawRowPayload: Object.fromEntries(row.map((v, i) => [i, v])),
      });

      currentEvent.sourceRowEnd = idx;
    }
  });

  if (currentEvent) events.push(currentEvent);
  return events;
}

// ── Profile workbook ─────────────────────────────────────────────────────
// NOTE: xlsx is loaded lazily so it doesn't crash if not installed

function parseRows(base64Content, filename) {
  let XLSX;
  try {
    XLSX = require("xlsx");
  } catch {
    throw new Error("xlsx package not available in this environment");
  }

  const buf = Buffer.from(base64Content, "base64");
  const workbook = XLSX.read(buf, { type: "buffer", cellDates: false, raw: true });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: true });

  return { workbook, sheetName, rawRows };
}

function detectHeaderRow(rawRows) {
  // Scan first 10 rows for the one with the most filled cells that looks like a header
  let best = { idx: 0, score: 0 };
  for (let i = 0; i < Math.min(10, rawRows.length); i++) {
    const row = rawRows[i];
    if (!row) continue;
    const filled = row.filter((c) => c != null && c !== "").length;
    const hasHebrew = row.some((c) => /[\u0590-\u05FF]/.test(String(c ?? "")));
    const hasKnownAlias = row.some((c) => {
      const s = String(c ?? "").trim().toLowerCase();
      return Object.values(COLUMN_ALIASES).flat().some((a) => a.toLowerCase() === s || s.includes(a.toLowerCase()));
    });
    const score = filled + (hasHebrew ? 5 : 0) + (hasKnownAlias ? 10 : 0);
    if (score > best.score) best = { idx: i, score };
  }
  return best.idx;
}

// ── Main handler ──────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return { statusCode: 200, headers: CORS, body: "" };
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: CORS, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  const accessCode = event.headers?.["x-access-code"];
  if (accessCode !== ACCESS_CODE) {
    return { statusCode: 401, headers: CORS, body: JSON.stringify({ error: "Unauthorized" }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Invalid JSON body" }) };
  }

  const ALLOWED_ACTIONS = ["profile", "preview", "import", "status", "rollback"];
  const action = body.action;
  if (!ALLOWED_ACTIONS.includes(action)) {
    return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unknown action", allowed: ALLOWED_ACTIONS }) };
  }

  // ── profile ──────────────────────────────────────────────────────────────
  if (action === "profile") {
    const { fileContent, filename, currency = "ILS" } = body;
    if (!fileContent) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "fileContent (base64) required" }) };
    }

    try {
      const { sheetName, rawRows } = parseRows(fileContent, filename ?? "report.xlsx");
      const headerRowIdx = detectHeaderRow(rawRows);
      const headerRow    = rawRows[headerRowIdx] ?? [];
      const dataRows     = rawRows.slice(headerRowIdx + 1);

      const { map: colMap, unresolved } = detectColumnMap(headerRow);

      // Classify all rows
      const classified = dataRows.map((row, idx) => ({
        rowIndex: idx + headerRowIdx + 1,
        classification: classifyRow(row, colMap),
      }));

      const classCounts = {};
      classified.forEach(({ classification }) => {
        classCounts[classification] = (classCounts[classification] ?? 0) + 1;
      });

      const productRows = dataRows.filter((row) => classifyRow(row, colMap) === "product_usage");
      const uniqueRawNames = new Set();
      const uniqueBrands   = new Set();
      productRows.forEach((row) => {
        const pv  = colMap.rawProductValue != null ? row[colMap.rawProductValue] : null;
        const brd = colMap.rawBrand != null ? row[colMap.rawBrand] : null;
        if (pv)  uniqueRawNames.add(String(pv).trim());
        if (brd) uniqueBrands.add(String(brd).trim());
      });

      // Sample date/time parsing
      const sampleDate = dataRows.slice(0, 3).map((row) =>
        colMap.serviceDate != null ? normalizeDate(row[colMap.serviceDate]) : null
      ).filter(Boolean);
      const sampleTime = dataRows.slice(0, 3).map((row) =>
        colMap.serviceTime != null ? normalizeTime(row[colMap.serviceTime]) : null
      ).filter(Boolean);

      // Detect currency from cost column sample (heuristic)
      const costSamples = dataRows.slice(0, 5).map((row) =>
        colMap.cost != null ? String(row[colMap.cost] ?? "") : ""
      );
      const detectedCurrency = costSamples.some((v) => /[₪]/.test(v)) ? "ILS"
        : costSamples.some((v) => /[$]/.test(v)) ? "USD"
        : costSamples.some((v) => /[€]/.test(v)) ? "EUR"
        : currency;

      // Language detection
      const sampleCells = dataRows.slice(0, 5).flatMap((r) => r.map((c) => String(c ?? "")));
      const hasHebrew = sampleCells.some((c) => /[\u0590-\u05FF]/.test(c));
      const detectedLanguage = hasHebrew ? "he" : "en";

      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "profile",
          filename,
          sheetName,
          headerRowIndex: headerRowIdx,
          headerRow,
          detectedColumnMap: colMap,
          unresolvedColumns: unresolved,
          totalRawRows: dataRows.length,
          rowClassifications: classCounts,
          productUsageRows: classCounts.product_usage ?? 0,
          uniqueRawProductValues: uniqueRawNames.size,
          uniqueBrands: uniqueBrands.size,
          detectedLanguage,
          detectedCurrency,
          sampleDateParsing: sampleDate,
          sampleTimeParsing: sampleTime,
          processorVersion: PROCESSOR_VERSION,
          rulesVersion: RULES_VERSION,
        }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Profile failed", details: err.message }),
      };
    }
  }

  // ── preview ───────────────────────────────────────────────────────────────
  if (action === "preview") {
    const { fileContent, filename, colMapOverride, currency = "ILS" } = body;
    if (!fileContent) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "fileContent required" }) };
    }

    try {
      const { sheetName, rawRows } = parseRows(fileContent, filename);
      const headerRowIdx = detectHeaderRow(rawRows);
      const headerRow    = rawRows[headerRowIdx] ?? [];
      const dataRows     = rawRows.slice(headerRowIdx + 1);

      const { map: colMapAuto } = detectColumnMap(headerRow);
      const colMap = colMapOverride ?? colMapAuto;

      // Group service events
      const events = groupServiceEvents(dataRows, colMap);

      const allUsageRows = events.flatMap((e) => e.usageRows);
      const uniqueNames  = new Set(allUsageRows.map((r) => r.normalizedRawName).filter(Boolean));

      // Try to match against stored mappings (if DB is available)
      let storedMappingHits = 0;
      let suggestedMatches  = 0;
      let unresolved        = 0;

      const databaseUrl = process.env.NEON_DATABASE_URL;
      if (databaseUrl) {
        try {
          const sql = neon(databaseUrl);
          for (const name of uniqueNames) {
            const rows = await sql`
              SELECT id, mapping_type, confidence
              FROM product_identity_mappings
              WHERE normalized_raw_name = ${name} AND active = true
              LIMIT 1
            `;
            if (rows.length > 0) {
              storedMappingHits++;
            } else {
              unresolved++;
            }
          }
        } catch {
          // DB not available — skip resolution step in preview
        }
      } else {
        unresolved = uniqueNames.size;
      }

      const rowCounts = {};
      dataRows.forEach((row) => {
        const cls = classifyRow(row, colMap);
        rowCounts[cls] = (rowCounts[cls] ?? 0) + 1;
      });

      // Build a sample of first 5 service events
      const sampleEvents = events.slice(0, 5).map((e) => ({
        ...e,
        usageRows: e.usageRows.slice(0, 3),
      }));

      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "preview",
          filename,
          sheetName,
          headerRowIndex: headerRowIdx,
          detectedColumnMap: colMap,
          totalRawRows: dataRows.length,
          rowClassifications: rowCounts,
          serviceEventsDetected: events.length,
          productUsageRows: allUsageRows.length,
          uniqueRawProductValues: uniqueNames.size,
          storedMappingMatches: storedMappingHits,
          suggestedMatches,
          unresolvedProducts: unresolved,
          rowsExcluded: (rowCounts.service_summary ?? 0) + (rowCounts.report_summary ?? 0) + (rowCounts.empty_row ?? 0),
          sampleEvents,
          processorVersion: PROCESSOR_VERSION,
          rulesVersion: RULES_VERSION,
        }),
      };
    } catch (err) {
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Preview failed", details: err.message }),
      };
    }
  }

  // ── import ────────────────────────────────────────────────────────────────
  if (action === "import") {
    const {
      fileContent, filename, fileHash,
      colMapOverride, currency = "ILS",
      approvedBy = "admin",
    } = body;

    if (!fileContent) {
      return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "fileContent required" }) };
    }

    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "NEON_DATABASE_URL not configured" }) };
    }

    try {
      const sql = neon(databaseUrl);

      // Idempotency check by file hash
      if (fileHash) {
        const existing = await sql`
          SELECT id, status FROM product_import_batches
          WHERE source_hash = ${fileHash}
            AND status NOT IN ('rolled_back', 'failed')
          LIMIT 1
        `;
        if (existing.length > 0) {
          return {
            statusCode: 409,
            headers: CORS,
            body: JSON.stringify({
              error: "Already imported",
              batchId: existing[0].id,
              status: existing[0].status,
              hint: "Same file hash already successfully imported. Use rollback first if re-import is intended.",
            }),
          };
        }
      }

      // Create import batch
      const [batch] = await sql`
        INSERT INTO product_import_batches (
          source_type, source_file, source_hash,
          processor_version, rules_version, status,
          created_by, started_at
        ) VALUES (
          'usage_report', ${filename ?? "unknown"}, ${fileHash ?? null},
          ${PROCESSOR_VERSION}, ${RULES_VERSION}, 'importing',
          ${approvedBy}, now()
        )
        RETURNING id
      `;
      const batchId = batch.id;

      // Parse and group
      const { sheetName, rawRows } = parseRows(fileContent, filename);
      const headerRowIdx = detectHeaderRow(rawRows);
      const dataRows     = rawRows.slice(headerRowIdx + 1);
      const { map: colMapAuto } = detectColumnMap(rawRows[headerRowIdx] ?? []);
      const colMap = colMapOverride ?? colMapAuto;

      const events = groupServiceEvents(dataRows, colMap);
      let insertedRows = 0;
      let reviewRows   = 0;

      // Insert usage product resolutions for every product_usage row
      // (These persist the raw values; canonical resolution happens separately)
      for (const evt of events) {
        for (const ur of evt.usageRows) {
          // Try to find a stored mapping
          let canonicalProductId = null;
          let mappingId          = null;
          let matchMethod        = "unresolved";
          let confidence         = "none";
          let resolutionStatus   = "unresolved";

          const storedMappings = await sql`
            SELECT id, canonical_product_id, match_method, confidence, mapping_type
            FROM product_identity_mappings
            WHERE normalized_raw_name = ${ur.normalizedRawName}
              AND active = true
              AND mapping_type NOT IN ('rejected_match', 'keep_separate')
            ORDER BY
              CASE confidence WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
              assigned_at DESC NULLS LAST
            LIMIT 1
          `;

          if (storedMappings.length > 0) {
            const m = storedMappings[0];
            canonicalProductId = m.canonical_product_id;
            mappingId          = m.id;
            matchMethod        = m.match_method;
            confidence         = m.confidence;
            resolutionStatus   = "resolved";
          } else {
            reviewRows++;
          }

          await sql`
            INSERT INTO usage_product_resolutions (
              usage_report_id, usage_row_id,
              raw_product_name, normalized_raw_name,
              canonical_product_id, mapping_id,
              match_method, confidence, resolution_status,
              product_truth_revision
            ) VALUES (
              ${batchId}, ${ur.usageRowId},
              ${ur.rawProductName}, ${ur.normalizedRawName},
              ${canonicalProductId}, ${mappingId},
              ${matchMethod}, ${confidence}, ${resolutionStatus},
              ${RULES_VERSION}
            )
            ON CONFLICT (usage_report_id, usage_row_id) DO UPDATE
              SET canonical_product_id = EXCLUDED.canonical_product_id,
                  mapping_id           = EXCLUDED.mapping_id,
                  match_method         = EXCLUDED.match_method,
                  confidence           = EXCLUDED.confidence,
                  resolution_status    = EXCLUDED.resolution_status,
                  updated_at           = now()
          `;
          insertedRows++;
        }
      }

      // Finalize batch
      await sql`
        UPDATE product_import_batches
        SET
          status        = 'completed',
          completed_at  = now(),
          total_rows    = ${dataRows.length},
          inserted_rows = ${insertedRows},
          review_rows   = ${reviewRows},
          summary       = ${JSON.stringify({
            sheetName,
            serviceEvents: events.length,
            productUsageRows: insertedRows,
            unresolvedRows: reviewRows,
          })}
        WHERE id = ${batchId}
      `;

      // Audit log
      await sql`
        INSERT INTO product_audit_logs (entity_type, entity_id, action, new_value, performed_by)
        VALUES (
          'usage_report_batch', ${batchId}, 'import_completed',
          ${JSON.stringify({ filename, insertedRows, reviewRows })}::jsonb,
          ${approvedBy}
        )
      `;

      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "import",
          batchId,
          status: "completed",
          serviceEvents: events.length,
          insertedRows,
          reviewRows,
          filename,
          processorVersion: PROCESSOR_VERSION,
        }),
      };
    } catch (err) {
      console.error("Usage import failed:", err);
      return {
        statusCode: 500,
        headers: CORS,
        body: JSON.stringify({ error: "Import failed", details: err.message }),
      };
    }
  }

  // ── status ────────────────────────────────────────────────────────────────
  if (action === "status") {
    const { batchId } = body;
    if (!batchId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "batchId required" }) };

    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "DB not configured" }) };

    try {
      const sql = neon(databaseUrl);
      const [batch] = await sql`SELECT * FROM product_import_batches WHERE id = ${batchId}`;
      if (!batch) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Batch not found" }) };

      const [resCount] = await sql`
        SELECT
          COUNT(*)::int                                                  AS total,
          SUM(CASE WHEN resolution_status = 'resolved' THEN 1 ELSE 0 END)::int AS resolved,
          SUM(CASE WHEN resolution_status = 'unresolved' THEN 1 ELSE 0 END)::int AS unresolved
        FROM usage_product_resolutions
        WHERE usage_report_id = ${batchId}
      `;

      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({ batch, resolutionCounts: resCount }),
      };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ── rollback ──────────────────────────────────────────────────────────────
  if (action === "rollback") {
    const { batchId, reason = "manual rollback" } = body;
    if (!batchId) return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "batchId required" }) };

    const databaseUrl = process.env.NEON_DATABASE_URL;
    if (!databaseUrl) return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: "DB not configured" }) };

    try {
      const sql = neon(databaseUrl);
      const [batch] = await sql`SELECT status FROM product_import_batches WHERE id = ${batchId}`;
      if (!batch) return { statusCode: 404, headers: CORS, body: JSON.stringify({ error: "Batch not found" }) };
      if (batch.status === "rolled_back") {
        return { statusCode: 409, headers: CORS, body: JSON.stringify({ error: "Already rolled back" }) };
      }

      // Non-destructive: mark rolled_back but preserve all usage_product_resolutions rows
      await sql`
        UPDATE product_import_batches
        SET status = 'rolled_back', updated_at = now()
        WHERE id = ${batchId}
      `;

      await sql`
        INSERT INTO product_audit_logs (entity_type, entity_id, action, reason, performed_by)
        VALUES ('usage_report_batch', ${batchId}, 'rollback', ${reason}, 'admin')
      `;

      return {
        statusCode: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rollback",
          batchId,
          status: "rolled_back",
          note: "Raw source rows are preserved. Usage resolution rows are preserved but the batch is marked rolled_back.",
        }),
      };
    } catch (err) {
      return { statusCode: 500, headers: CORS, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 400, headers: CORS, body: JSON.stringify({ error: "Unhandled action" }) };
};
