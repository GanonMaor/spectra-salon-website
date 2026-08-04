#!/usr/bin/env node
"use strict";

/**
 * Insert Maor mix rows that were skipped because catalog matching failed.
 * Creates lightweight catalog stub products, then writes usage with the salon
 * material price list (developer / bleach / color / treatment).
 *
 *   node data-import/scripts/backfill-maor-unmatched-usage.js
 *   node data-import/scripts/backfill-maor-unmatched-usage.js --write
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");
const {
  classifyMaterialKind,
  estimateMaterialCostIls,
} = require("../lib/maor-material-pricing");

require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const SALON_ID = "clean-salon-504322680";
const IMPORT_ID = "maor-ganon-mixes-20260804";
const STAFF_ID = "maor-ganon-import-stylist";
const STUB_BRAND_ID = "mfr-maor-import-stub";
const WRITE = process.argv.includes("--write");
const UNMATCHED_CSV = path.join(__dirname, "../reports/maor-ganon-unmatched-products.csv");
const BATCH = 200;

function hash(input, len = 18) {
  return crypto.createHash("sha1").update(String(input)).digest("hex").slice(0, len);
}

function norm(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[’`]/g, "'")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shadeNorm(value) {
  return norm(value)
    .replace(/\b(\d+)\s+(\d+)\b/g, "$1.$2")
    .replace(/\bPCT\b/g, "%")
    .replace(/\bVOL\b/g, "VOL");
}

function num(value) {
  const n = Number(String(value || "0").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function parseDateTime(dateValue, timeValue) {
  const parts = String(dateValue || "").split(/[./-]/).map(Number);
  const a = parts[0];
  const b = parts[1];
  let year = parts[2];
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(year)) {
    throw new Error(`Invalid date value: ${dateValue}`);
  }
  if (year < 100) year += year >= 70 ? 1900 : 2000;

  let day;
  let month;
  if (a > 12 && b <= 12) {
    day = a;
    month = b;
  } else if (b > 12 && a <= 12) {
    month = a;
    day = b;
  } else {
    day = a;
    month = b;
  }

  const match = String(timeValue || "09:00 AM").trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  let hour = match ? Number(match[1]) : 9;
  const minute = match ? Number(match[2]) : 0;
  const meridiem = match?.[3]?.toUpperCase();
  if (meridiem === "PM" && hour !== 12) hour += 12;
  if (meridiem === "AM" && hour === 12) hour = 0;

  const utc = Date.UTC(year, (month || 1) - 1, day || 1, hour - 2, minute, 0, 0);
  return new Date(utc);
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = [];
  let i = 0;
  const headerLine = lines[0];
  while (i < headerLine.length) {
    if (headerLine[i] === '"') {
      let j = i + 1;
      let cell = "";
      while (j < headerLine.length) {
        if (headerLine[j] === '"' && headerLine[j + 1] === '"') {
          cell += '"';
          j += 2;
          continue;
        }
        if (headerLine[j] === '"') {
          j += 1;
          break;
        }
        cell += headerLine[j];
        j += 1;
      }
      headers.push(cell);
      if (headerLine[j] === ",") j += 1;
      i = j;
    } else {
      let j = i;
      while (j < headerLine.length && headerLine[j] !== ",") j += 1;
      headers.push(headerLine.slice(i, j));
      i = j + 1;
    }
  }

  // Prefer Node/csv-simple via regex for quoted rows
  const rows = [];
  for (const line of lines.slice(1)) {
    const values = [];
    let pos = 0;
    while (pos <= line.length) {
      if (line[pos] === '"') {
        let j = pos + 1;
        let cell = "";
        while (j < line.length) {
          if (line[j] === '"' && line[j + 1] === '"') {
            cell += '"';
            j += 2;
            continue;
          }
          if (line[j] === '"') {
            j += 1;
            break;
          }
          cell += line[j];
          j += 1;
        }
        values.push(cell);
        pos = line[j] === "," ? j + 1 : j + 1;
      } else {
        let j = pos;
        while (j < line.length && line[j] !== ",") j += 1;
        values.push(line.slice(pos, j));
        pos = j + 1;
      }
      if (pos === line.length + 1) break;
    }
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = values[idx] ?? "";
    });
    rows.push(obj);
  }
  return rows;
}

function productTypeForKind(kind) {
  if (kind === "developer") return "developer_oxidant";
  if (kind === "bleach") return "bleach_lightener";
  if (kind === "treatment") return "treatment";
  return "hair_color_shade";
}

async function ensureStubBrand(client) {
  await client.query(
    `INSERT INTO catalog_brands (
       id, canonical_name, normalized_name, display_name,
       evidence_status, status, revision
     ) VALUES ($1, 'Maor Import Stub', 'maor import stub', 'Maor Import Stub',
               'inferred', 'active', 1)
     ON CONFLICT (id) DO NOTHING`,
    [STUB_BRAND_ID],
  );
}

async function main() {
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("NEON_DATABASE_URL is required");
  if (!fs.existsSync(UNMATCHED_CSV)) {
    throw new Error(`Missing unmatched CSV: ${UNMATCHED_CSV}`);
  }

  const unmatched = parseCsv(fs.readFileSync(UNMATCHED_CSV, "utf8"));
  const host = (dbUrl.match(/@([^/]+)/) || [])[1];
  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const stubs = new Map();
    const usageRows = [];
    const byKind = { developer: 0, bleach: 0, color: 0, treatment: 0 };
    let skippedNoVisit = 0;
    let skippedZeroGrams = 0;
    let newCostSum = 0;

    for (const row of unmatched) {
      const brand = row.brand || "";
      const series = row.series || "";
      const shade = row.shade || "";
      const serviceName = row.service || "";
      const clientName = String(row.client || "").trim();
      const qty = num(row.grams);
      if (!(qty > 0)) {
        skippedZeroGrams += 1;
        continue;
      }

      const startedAt = parseDateTime(row.date, row.time);
      const visitKey = [
        startedAt.toISOString(),
        clientName.toLowerCase(),
        serviceName.toLowerCase(),
      ].join("|");
      const apptId = `maor-appt-${hash(`v2|${visitKey}`)}`;
      const customerId = clientName ? `maor-cust-${hash(clientName)}` : null;

      const kind = classifyMaterialKind({ brand, series, shade, serviceName });
      byKind[kind] = (byKind[kind] || 0) + 1;
      const cost = estimateMaterialCostIls(qty, { brand, series, shade, serviceName });
      newCostSum += cost;

      const matchKey = row.matchKey || `${norm(brand)}|${norm(series)}|${shadeNorm(shade)}`;
      const productId = `maor-stub-${hash(matchKey)}`;
      if (!stubs.has(productId)) {
        const label = [brand, series, shade].filter(Boolean).join(" ").trim() || matchKey;
        stubs.set(productId, {
          id: productId,
          canonical_name: label,
          normalized_name: norm(label).toLowerCase(),
          primary_product_type: productTypeForKind(kind),
          product_category: kind === "bleach" ? "bleach" : kind,
          shade_code_raw: shade || null,
          shade_code_normalized: shade ? shadeNorm(shade) : null,
        });
      }

      usageRows.push({
        id: `maor-usage-${hash(`${IMPORT_ID}|${row.rowNumber}|${apptId}|${productId}`)}`,
        productId,
        visitId: apptId,
        customerId,
        quantity: qty,
        cost,
        recordedAt: startedAt.toISOString(),
        sourceBrand: brand,
        sourceSeries: series,
        sourceShade: shade,
        sourceServiceName: serviceName,
        sourceRowNumber: Number(row.rowNumber) || null,
      });
    }

    // Keep only rows whose appointment already exists.
    const visitIds = [...new Set(usageRows.map((r) => r.visitId))];
    const existingVisits = new Set();
    for (let i = 0; i < visitIds.length; i += 500) {
      const chunk = visitIds.slice(i, i + 500);
      const r = await client.query(
        `SELECT id FROM salon_appointments WHERE salon_id = $1 AND id = ANY($2::text[])`,
        [SALON_ID, chunk],
      );
      for (const row of r.rows) existingVisits.add(row.id);
    }

    const usable = usageRows.filter((r) => {
      if (!existingVisits.has(r.visitId)) {
        skippedNoVisit += 1;
        return false;
      }
      return true;
    });

    const existingUsage = new Set();
    for (let i = 0; i < usable.length; i += 500) {
      const chunk = usable.slice(i, i + 500).map((r) => r.id);
      const r = await client.query(
        `SELECT id FROM salon_product_usage WHERE salon_id = $1 AND id = ANY($2::text[])`,
        [SALON_ID, chunk],
      );
      for (const row of r.rows) existingUsage.add(row.id);
    }
    const toInsert = usable.filter((r) => !existingUsage.has(r.id));
    const stubIdsNeeded = [...new Set(toInsert.map((r) => r.productId))];
    const stubsToCreate = stubIdsNeeded.map((id) => stubs.get(id)).filter(Boolean);

    const summary = {
      host,
      mode: WRITE ? "write" : "dry-run",
      unmatchedCsvRows: unmatched.length,
      byKind,
      plannedUsage: usageRows.length,
      withExistingVisit: usable.length,
      alreadyPresent: usable.length - toInsert.length,
      toInsert: toInsert.length,
      stubsToCreate: stubsToCreate.length,
      skippedNoVisit,
      skippedZeroGrams,
      newCostSumIls: Math.round(newCostSum),
      insertCostIls: Math.round(toInsert.reduce((s, r) => s + r.cost, 0)),
      samples: toInsert.slice(0, 5).map((r) => ({
        id: r.id,
        visitId: r.visitId,
        series: r.sourceSeries,
        qty: r.quantity,
        cost: r.cost,
        kind: classifyMaterialKind({
          brand: r.sourceBrand,
          series: r.sourceSeries,
          shade: r.sourceShade,
          serviceName: r.sourceServiceName,
        }),
      })),
    };

    if (WRITE && toInsert.length) {
      await client.query("BEGIN");
      try {
        await ensureStubBrand(client);

        for (let i = 0; i < stubsToCreate.length; i += BATCH) {
          const chunk = stubsToCreate.slice(i, i + BATCH);
          await client.query(
            `INSERT INTO catalog_products (
               id, manufacturer_id, canonical_name, normalized_name,
               primary_product_type, product_category, professional_use, retail_use, technical_use,
               active, evidence_status, validation_status, source_count, alias_count, review_item_count,
               revision, classification_evidence, metadata, shade_code_raw, shade_code_normalized
             )
             SELECT * FROM unnest(
               $1::text[], $2::text[], $3::text[], $4::text[],
               $5::text[], $6::text[], $7::boolean[], $8::boolean[], $9::boolean[],
               $10::boolean[], $11::text[], $12::text[], $13::int[], $14::int[], $15::int[],
               $16::int[], $17::jsonb[], $18::jsonb[], $19::text[], $20::text[]
             )
             ON CONFLICT (id) DO NOTHING`,
            [
              chunk.map((s) => s.id),
              chunk.map(() => STUB_BRAND_ID),
              chunk.map((s) => s.canonical_name),
              chunk.map((s) => s.normalized_name),
              chunk.map((s) => s.primary_product_type),
              chunk.map((s) => s.product_category),
              chunk.map(() => true),
              chunk.map(() => false),
              chunk.map(() => false),
              chunk.map(() => true),
              chunk.map(() => "inferred"),
              chunk.map(() => "candidate"),
              chunk.map(() => 0),
              chunk.map(() => 0),
              chunk.map(() => 0),
              chunk.map(() => 1),
              chunk.map(() => JSON.stringify([])),
              chunk.map((s) => JSON.stringify({ maorImportStub: true, source: IMPORT_ID, label: s.canonical_name })),
              chunk.map((s) => s.shade_code_raw),
              chunk.map((s) => s.shade_code_normalized),
            ],
          );
        }

        for (let i = 0; i < toInsert.length; i += BATCH) {
          const chunk = toInsert.slice(i, i + BATCH);
          await client.query(
            `INSERT INTO salon_product_usage (
               id, salon_id, product_id, inventory_product_id, visit_id, customer_id, staff_member_id,
               quantity, unit, recorded_at, cost_at_use_amount, cost_currency,
               source_brand, source_series, source_shade, source_service_name,
               source_import_id, source_row_number, source_workbook_name
             )
             SELECT * FROM unnest(
               $1::text[], $2::text[], $3::text[], $4::text[], $5::text[], $6::text[], $7::text[],
               $8::numeric[], $9::text[], $10::timestamptz[], $11::numeric[], $12::text[],
               $13::text[], $14::text[], $15::text[], $16::text[],
               $17::text[], $18::int[], $19::text[]
             )
             ON CONFLICT (id) DO UPDATE SET
               quantity = EXCLUDED.quantity,
               cost_at_use_amount = EXCLUDED.cost_at_use_amount,
               cost_currency = EXCLUDED.cost_currency,
               source_brand = EXCLUDED.source_brand,
               source_series = EXCLUDED.source_series,
               source_shade = EXCLUDED.source_shade,
               source_service_name = EXCLUDED.source_service_name`,
            [
              chunk.map((r) => r.id),
              chunk.map(() => SALON_ID),
              chunk.map((r) => r.productId),
              chunk.map(() => null),
              chunk.map((r) => r.visitId),
              chunk.map((r) => r.customerId),
              chunk.map(() => STAFF_ID),
              chunk.map((r) => r.quantity),
              chunk.map(() => "g"),
              chunk.map((r) => r.recordedAt),
              chunk.map((r) => r.cost),
              chunk.map(() => "ILS"),
              chunk.map((r) => r.sourceBrand || null),
              chunk.map((r) => r.sourceSeries || null),
              chunk.map((r) => r.sourceShade || null),
              chunk.map((r) => r.sourceServiceName || null),
              chunk.map(() => IMPORT_ID),
              chunk.map((r) => r.sourceRowNumber),
              chunk.map(() => "Mixes_04-08-26 05_28.xlsx"),
            ],
          );
        }

        await client.query("COMMIT");
        summary.writesPerformed = true;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("FAIL:", err.message);
  process.exit(1);
});
