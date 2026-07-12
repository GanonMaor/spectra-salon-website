#!/usr/bin/env node
/**
 * Create a clean first-customer pilot salon.
 *
 * This is an internal Phase 8.5 setup tool, not a product onboarding UI.
 * It creates only the minimum live records needed for a real salon to start
 * cleanly. It never copies Pilot Salon A/B data and never inserts fake
 * customers, appointments, reports, history, or inventory stock.
 *
 * Safety:
 *   - dry-run by default
 *   - writes require `--yes`
 *   - writes also require CONFIRM_CREATE_CLEAN_SALON=<salon-id>
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const ROOT = path.join(__dirname, "..");

loadLocalEnv();
const DATABASE_URL = normalizeDatabaseUrl(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL);

const args = parseArgs(process.argv.slice(2));
const dryRun = args["dry-run"] !== false && !args.yes;

const DEFAULT_CATEGORIES = [
  { id: "color", name: "Color", accentColor: "#D7897F", sortOrder: 0 },
  { id: "highlights", name: "Highlights", accentColor: "#F9B95C", sortOrder: 1 },
  { id: "toner", name: "Toner", accentColor: "#B8C6D9", sortOrder: 2 },
  { id: "cut", name: "Haircut / Styling", accentColor: "#A9C8BE", sortOrder: 3 },
];

const DEFAULT_SERVICES = [
  { key: "root-color", category: "color", name: "Root color", duration: 90, priceCents: 0, sortOrder: 0 },
  { key: "full-color", category: "color", name: "Full color", duration: 120, priceCents: 0, sortOrder: 1 },
  { key: "highlights", category: "highlights", name: "Highlights", duration: 150, priceCents: 0, sortOrder: 2 },
  { key: "toner", category: "toner", name: "Toner", duration: 45, priceCents: 0, sortOrder: 3 },
  { key: "haircut", category: "cut", name: "Haircut", duration: 45, priceCents: 0, sortOrder: 4 },
  { key: "blow-dry", category: "cut", name: "Blow dry", duration: 45, priceCents: 0, sortOrder: 5 },
];

function loadLocalEnv() {
  const dotenvPath = path.join(ROOT, ".env.local");
  if (fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath, quiet: true });
  }
}

function normalizeDatabaseUrl(value) {
  let trimmed = String(value || "").trim();
  const psqlMatch = /^psql'(.+)'$/.exec(trimmed);
  if (psqlMatch) trimmed = psqlMatch[1];
  if (/^postgres(?:ql)?:\/\//.test(trimmed) && trimmed.endsWith("'")) trimmed = trimmed.slice(0, -1);
  return trimmed;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith("--")) continue;
    const [rawKey, rawValue] = arg.slice(2).split("=", 2);
    const key = rawKey.trim();
    if (!key) continue;
    if (rawValue != null) {
      out[key] = rawValue;
      continue;
    }
    const next = argv[i + 1];
    if (next && !next.startsWith("--")) {
      out[key] = next;
      i += 1;
    } else {
      out[key] = true;
    }
  }
  return out;
}

function csv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requireString(name) {
  const value = String(args[name] || "").trim();
  if (!value) throw new Error(`Missing required --${name}`);
  return value;
}

function buildConfig() {
  const salonId = requireString("salon-id");
  const salonName = requireString("salon-name");
  const ownerEmail = requireString("owner-email").toLowerCase();
  const ownerName = requireString("owner-name");
  const slug = String(args.slug || slugify(salonName) || salonId).trim();
  const ownerId = String(args["owner-id"] || `user-${salonId}-owner`).trim();
  const staffName = String(args["staff-name"] || ownerName).trim();
  const staffEmail = String(args["staff-email"] || ownerEmail).trim().toLowerCase();
  return {
    salonId,
    salonName,
    slug,
    timezone: String(args.timezone || "Asia/Jerusalem"),
    ownerId,
    ownerEmail,
    ownerName,
    ownerPhone: String(args["owner-phone"] || "").trim() || null,
    staffId: String(args["staff-id"] || `staff-${salonId}-owner`).trim(),
    staffName,
    staffEmail,
    enabledBrandIds: csv(args["enabled-brand-ids"]),
    enabledProductLineIds: csv(args["enabled-product-line-ids"]),
  };
}

function assertSafeConfig(config) {
  const blockedIds = new Set(["salon-look", "pilot-core-salon-a", "pilot-core-salon-b", "demo", "demo-salon"]);
  if (blockedIds.has(config.salonId) || config.salonId.startsWith("smoke_") || config.salonId.includes("demo")) {
    throw new Error(`Refusing to create or modify unsafe salon id: ${config.salonId}`);
  }
  if (!/^[a-z0-9][a-z0-9-]{2,80}$/.test(config.salonId)) {
    throw new Error("--salon-id must be lowercase kebab-case, 3-81 chars");
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(config.ownerEmail)) {
    throw new Error("--owner-email must be a valid email");
  }
  if (!dryRun) {
    if (!args.yes) throw new Error("Writes require --yes");
    if (process.env.CONFIRM_CREATE_CLEAN_SALON !== config.salonId) {
      throw new Error(`Writes require CONFIRM_CREATE_CLEAN_SALON=${config.salonId}`);
    }
  }
}

function serviceStage(serviceId, serviceName, durationMinutes) {
  return [{
    id: `${serviceId}-stage`,
    label: serviceName,
    segmentType: "service",
    durationMinutes,
    isActiveStaffTime: true,
    sortOrder: 0,
  }];
}

function workingHours() {
  return [
    { dayOfWeek: 0, startHour: 9, endHour: 18 },
    { dayOfWeek: 1, startHour: 9, endHour: 18 },
    { dayOfWeek: 2, startHour: 9, endHour: 18 },
    { dayOfWeek: 3, startHour: 9, endHour: 18 },
    { dayOfWeek: 4, startHour: 9, endHour: 18 },
  ];
}

async function enableBrand(client, config, brandId) {
  const existing = await client.query("SELECT id FROM catalog_brands WHERE id = $1 LIMIT 1", [brandId]);
  if (existing.rows.length === 0) throw new Error(`Unknown catalog brand id: ${brandId}`);
  const update = await client.query(
    `UPDATE salon_enabled_brands
     SET status = 'enabled', enabled_by_user_id = $3, enabled_at = now(), disabled_at = null, updated_at = now()
     WHERE salon_id = $1 AND brand_id = $2`,
    [config.salonId, brandId, config.ownerId],
  );
  if (update.rowCount === 0) {
    await client.query(
      `INSERT INTO salon_enabled_brands (id, salon_id, brand_id, status, enabled_by_user_id)
       VALUES ($1, $2, $3, 'enabled', $4)`,
      [`seb-${config.salonId}-${brandId}`, config.salonId, brandId, config.ownerId],
    );
  }
}

async function enableProductLine(client, config, productLineId) {
  const line = await client.query("SELECT manufacturer_id AS brand_id FROM catalog_product_lines WHERE id = $1 LIMIT 1", [productLineId]);
  if (line.rows.length === 0) throw new Error(`Unknown catalog product line id: ${productLineId}`);
  const brandId = line.rows[0].brand_id;
  await enableBrand(client, config, brandId);
  const update = await client.query(
    `UPDATE salon_enabled_product_lines
     SET status = 'enabled', enabled_by_user_id = $3, enabled_at = now(), disabled_at = null, updated_at = now()
     WHERE salon_id = $1 AND product_line_id = $2`,
    [config.salonId, productLineId, config.ownerId],
  );
  if (update.rowCount === 0) {
    await client.query(
      `INSERT INTO salon_enabled_product_lines (id, salon_id, brand_id, product_line_id, status, enabled_by_user_id)
       VALUES ($1, $2, $3, $4, 'enabled', $5)`,
      [`sepl-${config.salonId}-${productLineId}`, config.salonId, brandId, productLineId, config.ownerId],
    );
  }
}

async function createCleanSalon(client, config) {
  const departmentId = `dept-${config.salonId}-hair`;
  const categoryIds = Object.fromEntries(DEFAULT_CATEGORIES.map((category) => [
    category.id,
    `cat-${config.salonId}-${category.id}`,
  ]));
  const serviceIds = DEFAULT_SERVICES.map((service) => `svc-${config.salonId}-${service.key}`);

  await client.query("BEGIN");
  try {
    await client.query(
      `INSERT INTO salons (id, name, slug, email, timezone, status)
       VALUES ($1, $2, $3, $4, $5, 'active')
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         slug = EXCLUDED.slug,
         email = EXCLUDED.email,
         timezone = EXCLUDED.timezone,
         status = 'active',
         updated_at = now()`,
      [config.salonId, config.salonName, config.slug, config.ownerEmail, config.timezone],
    );
    await client.query(
      `INSERT INTO crm_users (id, email, display_name, phone, status)
       VALUES ($1, $2, $3, $4, 'active')
       ON CONFLICT (id) DO UPDATE SET
         email = EXCLUDED.email,
         display_name = EXCLUDED.display_name,
         phone = EXCLUDED.phone,
         status = 'active',
         updated_at = now()`,
      [config.ownerId, config.ownerEmail, config.ownerName, config.ownerPhone],
    );
    await client.query(
      `INSERT INTO salon_memberships (id, salon_id, user_id, role, is_default)
       VALUES ($1, $2, $3, 'owner', true)
       ON CONFLICT (salon_id, user_id) DO UPDATE SET
         role = 'owner',
         is_default = true`,
      [`mem-${config.salonId}-${config.ownerId}`, config.salonId, config.ownerId],
    );
    await client.query(
      `INSERT INTO salon_departments
         (id, salon_id, name, calendar_label, calendar_color, booking_mode, is_calendar_enabled, sort_order, status)
       VALUES ($1, $2, 'Hair', 'Hair', '#D7897F', 'process', true, 0, 'active')
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         calendar_label = EXCLUDED.calendar_label,
         calendar_color = EXCLUDED.calendar_color,
         booking_mode = EXCLUDED.booking_mode,
         is_calendar_enabled = true,
         status = 'active',
         updated_at = now()`,
      [departmentId, config.salonId],
    );

    for (const category of DEFAULT_CATEGORIES) {
      await client.query(
        `INSERT INTO salon_service_categories
           (id, salon_id, department_id, crm_category_id, name, accent_color, sort_order, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'active')
         ON CONFLICT (id) DO UPDATE SET
           department_id = EXCLUDED.department_id,
           crm_category_id = EXCLUDED.crm_category_id,
           name = EXCLUDED.name,
           accent_color = EXCLUDED.accent_color,
           sort_order = EXCLUDED.sort_order,
           status = 'active',
           updated_at = now()`,
        [categoryIds[category.id], config.salonId, departmentId, category.id, category.name, category.accentColor, category.sortOrder],
      );
    }

    for (const service of DEFAULT_SERVICES) {
      const serviceId = `svc-${config.salonId}-${service.key}`;
      await client.query(
        `INSERT INTO salon_services
           (id, salon_id, category_id, department_id, name, default_duration_minutes,
            default_price_cents, default_material_cost_cents, accent_color, sort_order,
            allow_client_timing_overrides, can_overlap_during_processing, default_stages,
            linked_service_ids, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, $9, true, true, $10::jsonb, '[]'::jsonb, 'active')
         ON CONFLICT (id) DO UPDATE SET
           category_id = EXCLUDED.category_id,
           department_id = EXCLUDED.department_id,
           name = EXCLUDED.name,
           default_duration_minutes = EXCLUDED.default_duration_minutes,
           default_price_cents = EXCLUDED.default_price_cents,
           default_material_cost_cents = EXCLUDED.default_material_cost_cents,
           accent_color = EXCLUDED.accent_color,
           sort_order = EXCLUDED.sort_order,
           allow_client_timing_overrides = EXCLUDED.allow_client_timing_overrides,
           can_overlap_during_processing = EXCLUDED.can_overlap_during_processing,
           default_stages = EXCLUDED.default_stages,
           linked_service_ids = EXCLUDED.linked_service_ids,
           status = 'active',
           updated_at = now()`,
        [
          serviceId,
          config.salonId,
          categoryIds[service.category],
          departmentId,
          service.name,
          service.duration,
          service.priceCents,
          DEFAULT_CATEGORIES.find((category) => category.id === service.category)?.accentColor || "#D7897F",
          service.sortOrder,
          JSON.stringify(serviceStage(serviceId, service.name, service.duration)),
        ],
      );
    }

    await client.query(
      `INSERT INTO salon_staff
         (id, salon_id, name, role, color, email, phone, department_ids, service_ids,
          service_price_overrides, working_hours, rating, status)
       VALUES ($1, $2, $3, 'Owner / main stylist', '#D7897F', $4, $5, $6::jsonb, $7::jsonb, '{}'::jsonb, $8::jsonb, 0, 'active')
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         role = EXCLUDED.role,
         color = EXCLUDED.color,
         email = EXCLUDED.email,
         phone = EXCLUDED.phone,
         department_ids = EXCLUDED.department_ids,
         service_ids = EXCLUDED.service_ids,
         working_hours = EXCLUDED.working_hours,
         status = 'active',
         updated_at = now()`,
      [
        config.staffId,
        config.salonId,
        config.staffName,
        config.staffEmail,
        config.ownerPhone,
        JSON.stringify([departmentId]),
        JSON.stringify(serviceIds),
        JSON.stringify(workingHours()),
      ],
    );

    for (const brandId of config.enabledBrandIds) {
      await enableBrand(client, config, brandId);
    }
    for (const productLineId of config.enabledProductLineIds) {
      await enableProductLine(client, config, productLineId);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    throw err;
  }

  return {
    salonId: config.salonId,
    ownerId: config.ownerId,
    membership: `mem-${config.salonId}-${config.ownerId}`,
    department: departmentId,
    categories: Object.values(categoryIds),
    services: serviceIds,
    staff: config.staffId,
    enabledBrands: config.enabledBrandIds,
    enabledProductLines: config.enabledProductLineIds,
    intentionallyEmpty: ["customers", "appointments", "inventory stock", "reports", "demo history"],
  };
}

async function main() {
  if (args.help || args.h) {
    printUsage();
    return;
  }

  const config = buildConfig();
  assertSafeConfig(config);

  const plan = {
    mode: dryRun ? "dry-run" : "write",
    salon: { id: config.salonId, name: config.salonName, slug: config.slug, timezone: config.timezone },
    ownerUser: { id: config.ownerId, email: config.ownerEmail, displayName: config.ownerName },
    membership: { role: "owner", isDefault: true },
    defaultDepartment: "Hair",
    serviceCategories: DEFAULT_CATEGORIES.map((category) => category.name),
    initialServices: DEFAULT_SERVICES.map((service) => service.name),
    initialStaff: config.staffName,
    enabledBrands: config.enabledBrandIds,
    enabledProductLines: config.enabledProductLineIds,
    intentionallyEmpty: ["customers", "appointments", "inventory stock", "reports", "demo history"],
  };

  if (dryRun) {
    console.log(JSON.stringify(plan, null, 2));
    console.log("DRY RUN: no database writes performed. Add --yes and CONFIRM_CREATE_CLEAN_SALON=<salon-id> to write.");
    return;
  }

  if (!DATABASE_URL || DATABASE_URL.length < 10) {
    throw new Error("DATABASE_URL or NEON_DATABASE_URL is not configured");
  }

  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    const result = await createCleanSalon(client, config);
    console.log("PASS: clean pilot salon setup complete");
    console.log(JSON.stringify(result, null, 2));
  } finally {
    await client.end().catch(() => {});
  }
}

function printUsage() {
  console.log(`Usage:
  node scripts/create-clean-pilot-salon.js \\
    --salon-id nectarine-tel-aviv \\
    --salon-name "Nectarine Tel Aviv" \\
    --owner-email owner@example.com \\
    --owner-name "Owner Name" \\
    [--owner-phone +972501234567] \\
    [--enabled-brand-ids brand-a,brand-b] \\
    [--enabled-product-line-ids line-a,line-b] \\
    [--yes]

Writes require:
  CONFIRM_CREATE_CLEAN_SALON=<salon-id>

Default mode is dry-run.`);
}

main().catch((err) => {
  console.error(`FAIL: ${err?.message || err}`);
  process.exit(1);
});
