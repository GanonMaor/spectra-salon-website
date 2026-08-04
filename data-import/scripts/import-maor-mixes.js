#!/usr/bin/env node
"use strict";

/**
 * Import Maor Ganon's real Spectra mix export into the tenant-scoped CRM.
 *
 * Default mode is dry-run. Pass --write to perform DB writes.
 * The import is idempotent: all generated IDs are stable from the workbook row
 * content and the source import id.
 */

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");
const { Client } = require("pg");
const {
  SERVICE_LIST_PRICE_ILS,
  ilsToCents,
  applyEstimatedPricing,
} = require("../lib/maor-service-pricing");

require("dotenv").config({ path: path.join(__dirname, "../../.env.local") });
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

const ROOT = path.resolve(__dirname, "../..");
const REPORT_DIR = path.join(ROOT, "data-import/reports");
const MIGRATION_PATH = path.join(ROOT, "migrations/036_salon_product_usage_import_metadata.sql");

const DEFAULT_WORKBOOK = "/Users/maorganon/Downloads/Mixes_04-08-26 05_28.xlsx";
const IMPORT_ID = "maor-ganon-mixes-20260804";
const TARGET_SALON_ID = "clean-salon-504322680";
const OWNER_USER_ID = "maor-ganon-owner";
const STAFF_ID = "maor-ganon-import-stylist";
const DEPARTMENT_ID = "maor-ganon-hair";

const args = new Set(process.argv.slice(2));
const WRITE = args.has("--write");
/** Deletes prior maor-* appointments/usage for this salon before write (prevents overlap duplicates). */
const REPLACE = args.has("--replace");
const workbookPath = process.argv.includes("--file")
  ? process.argv[process.argv.indexOf("--file") + 1]
  : DEFAULT_WORKBOOK;

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

  // New Maor export is DD.MM.YY (IL). Older US-style MM.DD.YY still works when day > 12.
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

  // Store as an absolute timestamp. The source is local salon time in Israel (UTC+2 approx).
  const utc = Date.UTC(year, (month || 1) - 1, day || 1, hour - 2, minute, 0, 0);
  return new Date(utc);
}

function categoryForService(name) {
  const n = norm(name);
  if (n.includes("TONER") || n.includes("GLOSS")) return "toner";
  if (
    n.includes("HIGHLIGHT") ||
    n.includes("BALAYAGE") ||
    n.includes("BALYAGE") ||
    n.includes("OMBRE") ||
    n.includes("T SECTION")
  ) {
    return "highlights";
  }
  if (n.includes("KERATIN") || n.includes("TREATMENT") || n.includes("TIPUL")) return "treatment";
  if (
    n.includes("STRAIGHT") ||
    n.includes("SMOOTH") ||
    n.includes("BRAZILIAN") ||
    n.includes("JAPANESE") ||
    n.includes("RUSSIAN")
  ) {
    return "straightening";
  }
  if (n.includes("COLOR") || n.includes("ROOT") || n.includes("DYE") || n.includes("TINT")) return "color";
  return "color";
}

function categoryName(id) {
  return ({
    color: "Color",
    highlights: "Highlights",
    toner: "Toner",
    treatment: "Treatment",
    straightening: "Straightening",
    other: "Other",
  })[id] || "Color";
}

function loadWorkbook() {
  const workbook = XLSX.readFile(workbookPath, { cellDates: true });
  const sheetName = workbook.SheetNames.includes("Maor Ganon") ? "Maor Ganon" : workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false, defval: "" });
  return rows
    .map((row, index) => ({ ...row, __rowNumber: index + 2 }))
    .filter((row) => row.Date && row.Time);
}

async function loadCatalog(client) {
  const { rows } = await client.query(`
    SELECT p.id, p.product_line_id, p.manufacturer_id,
           p.shade_code_raw, p.shade_code_normalized,
           b.canonical_name AS brand, b.display_name AS brand_display, b.normalized_name AS brand_norm,
           l.canonical_name AS line, l.name AS line_name, l.normalized_name AS line_norm
    FROM catalog_runtime_products p
    LEFT JOIN catalog_brands b ON b.id = p.manufacturer_id
    LEFT JOIN catalog_product_lines l ON l.id = p.product_line_id
  `);

  const byKey = new Map();
  for (const product of rows) {
    const brands = [product.brand, product.brand_display, product.brand_norm].filter(Boolean).map(norm);
    const lines = [product.line, product.line_name, product.line_norm].filter(Boolean).map(norm);
    const shades = [product.shade_code_raw, product.shade_code_normalized].filter(Boolean).map(shadeNorm);
    for (const brand of brands) {
      for (const line of lines) {
        for (const shade of shades) byKey.set(`${brand}|${line}|${shade}`, product);
      }
    }
  }
  return byKey;
}

function buildImportModel(rows, catalogByKey) {
  const groups = new Map();
  for (const row of rows) {
    const key = [row.Date, row.Time, row.Client, row.Service].map((v) => String(v || "").trim()).join("|");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(row);
  }

  const customers = new Map();
  const services = new Map();
  const appointments = [];
  const segments = [];
  const usage = [];
  const inventoryProducts = new Map();
  const enabledBrands = new Map();
  const enabledLines = new Map();
  const unmatched = [];

  for (const [, visitRows] of groups) {
    const first = visitRows[0];
    const clientName = String(first.Client || "").trim();
    const serviceName = String(first.Service || "Imported service").trim();
    const serviceCategory = categoryForService(serviceName);
    const serviceId = `maor-svc-${hash(serviceName)}`;
    const startedAt = parseDateTime(first.Date, first.Time);
    const endedAt = new Date(startedAt.getTime() + 60 * 60 * 1000);
    // Canonical key (ISO day/time) so DD.MM vs MM.DD string forms cannot fork IDs.
    const visitKey = [
      startedAt.toISOString(),
      clientName.toLowerCase(),
      serviceName.toLowerCase(),
    ].join("|");
    const apptId = `maor-appt-${hash(`v2|${visitKey}`)}`;

    services.set(serviceName, {
      id: serviceId,
      name: serviceName,
      categoryId: `maor-cat-${serviceCategory}`,
      crmCategoryId: serviceCategory,
    });

    let customerId = null;
    if (clientName) {
      customerId = `maor-cust-${hash(clientName)}`;
      if (!customers.has(customerId)) {
        customers.set(customerId, {
          id: customerId,
          name: clientName,
          firstSeen: startedAt,
          lastSeen: startedAt,
          visits: 0,
        });
      }
      const customer = customers.get(customerId);
      customer.visits += 1;
      if (startedAt < customer.firstSeen) customer.firstSeen = startedAt;
      if (startedAt > customer.lastSeen) customer.lastSeen = startedAt;
    }

    const grams = visitRows.reduce((sum, row) => sum + num(row.Grams), 0);
    const productRows = visitRows.filter((row) => String(row.Brand || "").trim());
    const materialCost = productRows.reduce((sum, row) => sum + num(row.Cost), 0);

    appointments.push({
      id: apptId,
      customerId,
      customerName: clientName || "Unknown client",
      serviceId,
      serviceName,
      serviceCategoryId: serviceCategory,
      startTime: startedAt.toISOString(),
      endTime: endedAt.toISOString(),
      notes: `Imported from ${path.basename(workbookPath)} row ${first.__rowNumber}. Material cost ${materialCost.toFixed(2)} ILS.`,
    });

    segments.push({
      id: `maor-seg-${hash(apptId)}`,
      appointmentId: apptId,
      serviceId,
      serviceName,
      serviceCategoryId: serviceCategory,
      label: serviceName,
      startTime: startedAt.toISOString(),
      endTime: endedAt.toISOString(),
      productGrams: grams,
      notes: `Imported Spectra mix rows: ${visitRows.map((row) => row.__rowNumber).join(", ")}`,
    });

    for (const row of productRows) {
      const matchKey = `${norm(row.Brand)}|${norm(row.Series)}|${shadeNorm(row.Shade)}`;
      const product = catalogByKey.get(matchKey);
      if (!product) {
        unmatched.push({
          rowNumber: row.__rowNumber,
          date: row.Date,
          time: row.Time,
          client: clientName,
          service: serviceName,
          brand: row.Brand,
          series: row.Series,
          shade: row.Shade,
          grams: num(row.Grams),
          cost: num(row.Cost),
          matchKey,
        });
        continue;
      }

      const inventoryId = `maor-inv-${hash(product.id)}`;
      inventoryProducts.set(product.id, {
        id: inventoryId,
        productId: product.id,
        brandId: product.manufacturer_id,
        productLineId: product.product_line_id,
      });
      if (product.manufacturer_id) enabledBrands.set(product.manufacturer_id, product.manufacturer_id);
      if (product.product_line_id) {
        enabledLines.set(product.product_line_id, {
          productLineId: product.product_line_id,
          brandId: product.manufacturer_id,
        });
      }

      usage.push({
        id: `maor-usage-${hash(`${IMPORT_ID}|${row.__rowNumber}|${apptId}|${product.id}`)}`,
        productId: product.id,
        inventoryProductId: inventoryId,
        visitId: apptId,
        customerId,
        staffMemberId: STAFF_ID,
        quantity: num(row.Grams),
        cost: num(row.Cost),
        recordedAt: startedAt.toISOString(),
        sourceBrand: row.Brand,
        sourceSeries: row.Series,
        sourceShade: row.Shade,
        sourceServiceName: serviceName,
        sourceProfile: row.Profile,
        sourceRowNumber: row.__rowNumber,
      });
    }
  }

  return {
    customers: Array.from(customers.values()),
    services: Array.from(services.values()),
    appointments,
    segments,
    usage,
    inventoryProducts: Array.from(inventoryProducts.values()),
    enabledBrands: Array.from(enabledBrands.values()),
    enabledLines: Array.from(enabledLines.values()),
    unmatched,
  };
}

async function applyMigration(client) {
  const sql = fs.readFileSync(MIGRATION_PATH, "utf8");
  await client.query(sql);
}

async function bulkInsert(client, columns, rows, conflictClause, chunkSize = 400) {
  if (!rows.length) return;
  for (let offset = 0; offset < rows.length; offset += chunkSize) {
    const chunk = rows.slice(offset, offset + chunkSize);
    const params = [];
    const values = chunk.map((row, rowIndex) => {
      const placeholders = row.map((value, colIndex) => {
        params.push(value);
        return `$${rowIndex * columns.names.length + colIndex + 1}`;
      });
      return `(${placeholders.join(",")})`;
    });
    try {
      await client.query(
        `INSERT INTO ${columns.table} (${columns.names.join(",")})
         VALUES ${values.join(",")}
         ${conflictClause}`,
        params,
      );
    } catch (err) {
      err.message = `${columns.table}: ${err.message}`;
      throw err;
    }
  }
}

/**
 * Remove prior Maor migration appointments/usage so a full re-import cannot
 * leave overlapping duplicates from an older workbook / import id.
 */
async function purgePreviousMaorImport(client) {
  const deleted = {};
  deleted.usage = (await client.query(
    `DELETE FROM salon_product_usage
     WHERE salon_id = $1 AND id LIKE 'maor-usage-%'`,
    [TARGET_SALON_ID],
  )).rowCount;
  deleted.segments = (await client.query(
    `DELETE FROM salon_appointment_segments
     WHERE salon_id = $1 AND id LIKE 'maor-seg-%'`,
    [TARGET_SALON_ID],
  )).rowCount;
  deleted.appointments = (await client.query(
    `DELETE FROM salon_appointments
     WHERE salon_id = $1 AND id LIKE 'maor-appt-%'`,
    [TARGET_SALON_ID],
  )).rowCount;
  // Inventory must go after usage (FK). Clear maor inventory rows so a re-import
  // can recreate stable maor-inv-* ids without hitting (salon_id, product_id).
  deleted.inventory = (await client.query(
    `DELETE FROM salon_inventory_products
     WHERE salon_id = $1 AND id LIKE 'maor-inv-%'`,
    [TARGET_SALON_ID],
  )).rowCount;
  return deleted;
}

async function writeModel(client, model) {
  await applyMigration(client);
  await client.query("BEGIN");
  try {
    if (REPLACE) {
      model.purged = await purgePreviousMaorImport(client);
    }

    await client.query(
      `INSERT INTO salons (id, name, slug, phone, city, timezone, currency, status, onboarding_status, onboarding_completed_at, created_at, updated_at)
       VALUES ($1, 'Maor Ganon', 'maor-ganon-0504322680', '0504322680', 'Rannana', 'Asia/Jerusalem', 'ILS', 'active', 'completed', now(), now(), now())
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         phone = EXCLUDED.phone,
         city = EXCLUDED.city,
         timezone = EXCLUDED.timezone,
         currency = EXCLUDED.currency,
         status = 'active',
         updated_at = now()`,
      [TARGET_SALON_ID],
    );

    await client.query(
      `INSERT INTO crm_users (id, display_name, phone, status, created_at, updated_at)
       VALUES ($1, 'Maor Ganon', '0504322680', 'active', now(), now())
       ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name, phone = EXCLUDED.phone, status = 'active', updated_at = now()`,
      [OWNER_USER_ID],
    );
    await client.query(
      `INSERT INTO salon_memberships (id, salon_id, user_id, role, is_default, created_at)
       VALUES ($1, $2, $3, 'owner', true, now())
       ON CONFLICT (salon_id, user_id) DO UPDATE SET role = 'owner', is_default = true`,
      [`membership-${TARGET_SALON_ID}`, TARGET_SALON_ID, OWNER_USER_ID],
    );

    await client.query(
      `INSERT INTO salon_departments (id, salon_id, name, calendar_label, calendar_color, booking_mode, is_calendar_enabled, sort_order, status)
       VALUES ($1, $2, 'Hair', 'Hair', '#D7897F', 'staff', true, 1, 'active')
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, status = 'active', updated_at = now()`,
      [DEPARTMENT_ID, TARGET_SALON_ID],
    );

    const categories = new Map(model.services.map((svc) => [svc.crmCategoryId, svc]));
    for (const crmCategoryId of categories.keys()) {
      await client.query(
        `INSERT INTO salon_service_categories
           (id, salon_id, department_id, crm_category_id, name, accent_color, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, '#D7897F', 1, 'active')
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           department_id = EXCLUDED.department_id,
           crm_category_id = EXCLUDED.crm_category_id,
           status = 'active',
           updated_at = now()`,
        [`maor-cat-${crmCategoryId}`, TARGET_SALON_ID, DEPARTMENT_ID, crmCategoryId, categoryName(crmCategoryId)],
      );
    }

    await client.query(
      `INSERT INTO salon_staff (id, salon_id, name, role, color, department_ids, status)
       VALUES ($1, $2, 'Maor Ganon', 'Owner / Stylist', '#D7897F', $3::jsonb, 'active')
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, role = EXCLUDED.role, department_ids = EXCLUDED.department_ids, status = 'active', updated_at = now()`,
      [STAFF_ID, TARGET_SALON_ID, JSON.stringify([DEPARTMENT_ID])],
    );

    for (const service of model.services) {
      const usageForService = model.usage.filter((row) => row.sourceServiceName === service.name);
      const avgMaterial = usageForService.length
        ? Math.round((usageForService.reduce((sum, row) => sum + row.cost, 0) / usageForService.length) * 100)
        : 0;
      const listPriceCents = ilsToCents(SERVICE_LIST_PRICE_ILS[service.name] ?? 0);
      await client.query(
        `INSERT INTO salon_services
           (id, salon_id, department_id, category_id, name, default_duration_minutes, default_price_cents,
            default_material_cost_cents, status, sort_order, default_stages)
         VALUES ($1, $2, $3, $4, $5, 60, $6, $7, 'active', 1, '[]'::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           department_id = EXCLUDED.department_id,
           category_id = EXCLUDED.category_id,
           name = EXCLUDED.name,
           default_price_cents = EXCLUDED.default_price_cents,
           default_material_cost_cents = EXCLUDED.default_material_cost_cents,
           status = 'active',
           updated_at = now()`,
        [service.id, TARGET_SALON_ID, DEPARTMENT_ID, service.categoryId, service.name, listPriceCents, avgMaterial],
      );
    }

    await bulkInsert(
      client,
      { table: "salon_customers", names: ["id", "salon_id", "first_name", "last_name", "notes", "tags", "status", "created_at", "updated_at"] },
      model.customers.map((customer) => [
        customer.id,
        TARGET_SALON_ID,
        customer.name,
        null,
        `Imported real Spectra history. Visits: ${customer.visits}. First: ${customer.firstSeen.toISOString().slice(0, 10)}. Last: ${customer.lastSeen.toISOString().slice(0, 10)}.`,
        JSON.stringify(["imported-spectra", "maor-ganon"]),
        "active",
        customer.firstSeen.toISOString(),
        new Date().toISOString(),
      ]),
      `ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         notes = EXCLUDED.notes,
         tags = EXCLUDED.tags,
         status = 'active',
         updated_at = now()`,
    );

    for (const brandId of model.enabledBrands) {
      const brandRowId = `maor-brand-${hash(brandId)}`;
      const alreadyEnabled = await client.query(
        `SELECT 1 FROM salon_enabled_brands
         WHERE salon_id = $1 AND brand_id = $2 AND status = 'enabled' LIMIT 1`,
        [TARGET_SALON_ID, brandId],
      );
      if (alreadyEnabled.rowCount) continue;
      await client.query(
        `INSERT INTO salon_enabled_brands (id, salon_id, brand_id, status, enabled_by_user_id, disabled_at, updated_at)
         VALUES ($1, $2, $3, 'enabled', $4, NULL, now())
         ON CONFLICT (id) DO UPDATE SET
           status = 'enabled',
           disabled_at = NULL,
           enabled_by_user_id = EXCLUDED.enabled_by_user_id,
           updated_at = now()`,
        [brandRowId, TARGET_SALON_ID, brandId, OWNER_USER_ID],
      );
    }

    for (const line of model.enabledLines) {
      const lineRowId = `maor-line-${hash(line.productLineId)}`;
      const alreadyEnabled = await client.query(
        `SELECT 1 FROM salon_enabled_product_lines
         WHERE salon_id = $1 AND product_line_id = $2 AND status = 'enabled' LIMIT 1`,
        [TARGET_SALON_ID, line.productLineId],
      );
      if (alreadyEnabled.rowCount) continue;
      await client.query(
        `INSERT INTO salon_enabled_product_lines (id, salon_id, brand_id, product_line_id, status, enabled_by_user_id, disabled_at, updated_at)
         VALUES ($1, $2, $3, $4, 'enabled', $5, NULL, now())
         ON CONFLICT (id) DO UPDATE SET
           status = 'enabled',
           disabled_at = NULL,
           enabled_by_user_id = EXCLUDED.enabled_by_user_id,
           updated_at = now()`,
        [lineRowId, TARGET_SALON_ID, line.brandId, line.productLineId, OWNER_USER_ID],
      );
    }

    // If a non-maor inventory row already owns (salon_id, product_id), reuse it and
    // remap usage FKs — otherwise insert/reactivate the stable maor-inv-* row.
    const productIds = model.inventoryProducts.map((item) => item.productId);
    const existingInv = productIds.length
      ? await client.query(
          `SELECT id, product_id FROM salon_inventory_products
           WHERE salon_id = $1 AND product_id = ANY($2::text[])`,
          [TARGET_SALON_ID, productIds],
        )
      : { rows: [] };
    const inventoryIdByProduct = new Map(
      model.inventoryProducts.map((item) => [item.productId, item.id]),
    );
    for (const row of existingInv.rows) {
      inventoryIdByProduct.set(row.product_id, row.id);
    }
    if (existingInv.rows.length) {
      await client.query(
        `UPDATE salon_inventory_products
         SET status = 'active', is_visible = true, updated_at = now()
         WHERE salon_id = $1 AND product_id = ANY($2::text[])`,
        [TARGET_SALON_ID, existingInv.rows.map((r) => r.product_id)],
      );
    }
    const toInsert = model.inventoryProducts.filter(
      (item) => inventoryIdByProduct.get(item.productId) === item.id,
    );
    await bulkInsert(
      client,
      { table: "salon_inventory_products", names: ["id", "salon_id", "product_id", "units_in_stock", "min_stock", "is_visible", "is_favorite", "status"] },
      toInsert.map((item) => [item.id, TARGET_SALON_ID, item.productId, 0, 0, true, false, "active"]),
      `ON CONFLICT (id) DO UPDATE SET product_id = EXCLUDED.product_id, status = 'active', is_visible = true, updated_at = now()`,
    );
    for (const row of model.usage) {
      const mapped = inventoryIdByProduct.get(row.productId);
      if (mapped) row.inventoryProductId = mapped;
    }

    await bulkInsert(
      client,
      {
        table: "salon_appointments",
        names: ["id", "salon_id", "staff_member_id", "customer_id", "customer_name", "service_id", "service_name", "service_category_id", "start_time", "end_time", "status", "notes"],
      },
      model.appointments.map((appt) => [
        appt.id,
        TARGET_SALON_ID,
        STAFF_ID,
        appt.customerId,
        appt.customerName,
        appt.serviceId,
        appt.serviceName,
        appt.serviceCategoryId,
        appt.startTime,
        appt.endTime,
        "completed",
        appt.notes,
      ]),
      `ON CONFLICT (id) DO UPDATE SET
         customer_id = EXCLUDED.customer_id,
         customer_name = EXCLUDED.customer_name,
         service_id = EXCLUDED.service_id,
         service_name = EXCLUDED.service_name,
         service_category_id = EXCLUDED.service_category_id,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time,
         status = 'completed',
         notes = EXCLUDED.notes,
         updated_at = now()`,
    );

    await bulkInsert(
      client,
      {
        table: "salon_appointment_segments",
        names: ["id", "salon_id", "appointment_id", "staff_member_id", "service_id", "service_name", "service_category_id", "segment_type", "label", "start_time", "end_time", "sort_order", "product_grams", "notes"],
      },
      model.segments.map((segment) => [
        segment.id,
        TARGET_SALON_ID,
        segment.appointmentId,
        STAFF_ID,
        segment.serviceId,
        segment.serviceName,
        segment.serviceCategoryId,
        "service",
        segment.label,
        segment.startTime,
        segment.endTime,
        0,
        segment.productGrams,
        segment.notes,
      ]),
      `ON CONFLICT (id) DO UPDATE SET
         service_id = EXCLUDED.service_id,
         service_name = EXCLUDED.service_name,
         service_category_id = EXCLUDED.service_category_id,
         label = EXCLUDED.label,
         start_time = EXCLUDED.start_time,
         end_time = EXCLUDED.end_time,
         product_grams = EXCLUDED.product_grams,
         notes = EXCLUDED.notes,
         updated_at = now()`,
    );

    await bulkInsert(
      client,
      {
        table: "salon_product_usage",
        names: [
          "id", "salon_id", "product_id", "inventory_product_id", "visit_id", "customer_id", "staff_member_id",
          "quantity", "unit", "recorded_at", "cost_at_use_amount", "cost_currency",
          "source_brand", "source_series", "source_shade", "source_service_name", "source_profile",
          "source_import_id", "source_row_number", "source_workbook_name",
        ],
      },
      model.usage.map((row) => [
        row.id,
        TARGET_SALON_ID,
        row.productId,
        row.inventoryProductId,
        row.visitId,
        row.customerId,
        row.staffMemberId,
        row.quantity,
        "g",
        row.recordedAt,
        row.cost,
        "ILS",
        row.sourceBrand,
        row.sourceSeries,
        row.sourceShade,
        row.sourceServiceName,
        row.sourceProfile,
        IMPORT_ID,
        row.sourceRowNumber,
        path.basename(workbookPath),
      ]),
      `ON CONFLICT (id) DO UPDATE SET
         product_id = EXCLUDED.product_id,
         inventory_product_id = EXCLUDED.inventory_product_id,
         visit_id = EXCLUDED.visit_id,
         customer_id = EXCLUDED.customer_id,
         staff_member_id = EXCLUDED.staff_member_id,
         quantity = EXCLUDED.quantity,
         recorded_at = EXCLUDED.recorded_at,
         cost_at_use_amount = EXCLUDED.cost_at_use_amount,
         source_brand = EXCLUDED.source_brand,
         source_series = EXCLUDED.source_series,
         source_shade = EXCLUDED.source_shade,
         source_service_name = EXCLUDED.source_service_name,
         source_profile = EXCLUDED.source_profile,
         source_import_id = EXCLUDED.source_import_id,
         source_row_number = EXCLUDED.source_row_number,
         source_workbook_name = EXCLUDED.source_workbook_name`,
      300,
    );

    // Ensure pricing snapshot columns exist, then stamp estimated revenue once (bulk).
    await client.query(fs.readFileSync(path.join(ROOT, "migrations/046_appointment_estimated_revenue.sql"), "utf8"));
    const priced = applyEstimatedPricing(
      model.appointments.map((appt) => ({
        id: appt.id,
        serviceName: appt.serviceName,
        customerId: appt.customerId,
        customerName: appt.customerName,
        startTime: appt.startTime,
      })),
    );
    const PRICE_BATCH = 500;
    for (let i = 0; i < priced.length; i += PRICE_BATCH) {
      const chunk = priced.slice(i, i + PRICE_BATCH);
      await client.query(
        `UPDATE salon_appointments AS a
         SET list_price_cents = v.list_price_cents,
             estimated_revenue_cents = v.estimated_revenue_cents,
             revenue_source = v.revenue_source,
             pricing_source = v.pricing_source,
             pricing_confidence = v.pricing_confidence,
             pricing_snapshot = v.pricing_snapshot::jsonb,
             pricing_computed_at = now(),
             updated_at = now()
         FROM (
           SELECT *
           FROM unnest(
             $1::text[],
             $2::int[],
             $3::int[],
             $4::text[],
             $5::text[],
             $6::text[],
             $7::text[]
           ) AS t(id, list_price_cents, estimated_revenue_cents, revenue_source, pricing_source, pricing_confidence, pricing_snapshot)
         ) AS v
         WHERE a.id = v.id AND a.salon_id = $8`,
        [
          chunk.map((r) => r.id),
          chunk.map((r) => r.listPriceCents),
          chunk.map((r) => r.estimatedRevenueCents),
          chunk.map((r) => r.revenueSource),
          chunk.map((r) => r.pricingSource),
          chunk.map((r) => r.pricingConfidence),
          chunk.map((r) => JSON.stringify(r.pricingSnapshot)),
          TARGET_SALON_ID,
        ],
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }
}

function writeReports(summary, unmatched) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(REPORT_DIR, "maor-ganon-import-summary.json"),
    JSON.stringify(summary, null, 2),
  );
  const header = "rowNumber,date,time,client,service,brand,series,shade,grams,cost,matchKey\n";
  const lines = unmatched.map((row) => [
    row.rowNumber,
    row.date,
    row.time,
    row.client,
    row.service,
    row.brand,
    row.series,
    row.shade,
    row.grams,
    row.cost,
    row.matchKey,
  ].map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","));
  fs.writeFileSync(path.join(REPORT_DIR, "maor-ganon-unmatched-products.csv"), header + lines.join("\n") + "\n");
}

async function main() {
  if (!fs.existsSync(workbookPath)) throw new Error(`Workbook not found: ${workbookPath}`);
  const dbUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("NEON_DATABASE_URL is required");
  if (WRITE && !REPLACE) {
    throw new Error(
      "Refusing to write without --replace (avoids duplicate Maor history from older imports). Use: --write --replace",
    );
  }

  const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const rows = loadWorkbook();
    const catalog = await loadCatalog(client);
    const model = buildImportModel(rows, catalog);
    const priced = applyEstimatedPricing(model.appointments);
    const estRevenueIls = priced.reduce((s, row) => s + row.estimatedRevenueCents, 0) / 100;
    const listRevenueIls = priced.reduce((s, row) => s + row.listPriceCents, 0) / 100;
    const summary = {
      mode: WRITE ? "write" : "dry-run",
      importId: IMPORT_ID,
      targetSalonId: TARGET_SALON_ID,
      workbook: workbookPath,
      sourceRows: rows.length,
      customers: model.customers.length,
      services: model.services.length,
      appointments: model.appointments.length,
      appointmentSegments: model.segments.length,
      productUsageRowsMatched: model.usage.length,
      productUsageRowsUnmatched: model.unmatched.length,
      productUsageMatchPct: Math.round((model.usage.length / (model.usage.length + model.unmatched.length)) * 1000) / 10,
      inventoryOverlays: model.inventoryProducts.length,
      enabledBrands: model.enabledBrands.length,
      enabledProductLines: model.enabledLines.length,
      estimatedRevenueIls: Math.round(estRevenueIls),
      listRevenueIls: Math.round(listRevenueIls),
      colorWaivedCount: priced.filter((p) => p.pricingSnapshot.colorWaivedWithHighlights).length,
      categoryCappedCount: priced.filter((p) => p.pricingSnapshot.sameDayCategoryMaxOnly).length,
      replace: REPLACE,
      writesPerformed: WRITE,
    };

    if (WRITE) {
      await writeModel(client, model);
      summary.purged = model.purged || null;
    }
    writeReports(summary, model.unmatched);
    console.log(JSON.stringify(summary, null, 2));
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(`FAIL: ${err.message}`);
  process.exit(1);
});
