/**
 * netlify/functions/crm-bootstrap.js
 * ─────────────────────────────────────────────────────────────────────────
 * Phase 5: Full CRM live-data bootstrap.
 *
 * Returns the complete tenant-scoped runtime snapshot consumed by
 * CRMDataProvider / ApiCRMRepository on cold-boot:
 *   salon, currentUser, role, departments, serviceCategories, services,
 *   staff, customers, appointments (with nested segments), inventory summary.
 *
 * Security contract (unchanged from Phase A):
 *   salon_id ALWAYS comes from the verified session via resolveSalonContext().
 *   It is never read from client headers, query-strings, or request bodies.
 *
 * Migration tolerance:
 *   If an optional table is absent the corresponding field returns [] / null
 *   and needsMigration is set to true. Required Phase 5 tables that are
 *   present but empty return empty arrays; they do NOT crash the bootstrap.
 *
 * GET /.netlify/functions/crm-bootstrap
 */
"use strict";

const { resolveSalonContext, SalonAuthError } = require("./_salon-context");
const { createClient, hasDatabaseUrl } = require("./_db");

// Appointment window loaded on bootstrap: past N days + future N days.
// Historical analytics needs imported visit history, not only recent calendar
// rows. Keep this configurable, with a four-year default for pilot salons.
const APPT_PAST_DAYS = Number(process.env.CRM_BOOTSTRAP_APPT_PAST_DAYS || 1825);
const APPT_FUTURE_DAYS = 90;

// ── CORS / response helpers ───────────────────────────────────────────────────

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

function optionsResponse() {
  return { statusCode: 200, headers: CORS, body: "" };
}

function success(data, meta = {}) {
  return {
    statusCode: 200,
    headers: CORS,
    body: JSON.stringify({ ok: true, data, meta }),
  };
}

function failure(statusCode, code, message, details = {}) {
  return {
    statusCode,
    headers: CORS,
    body: JSON.stringify({ ok: false, error: { code, message, details } }),
  };
}

// ── Table existence (single round-trip for all tables) ────────────────────────

const ALL_TABLES = [
  "salons",
  "salon_departments",
  "salon_service_categories",
  "salon_services",
  "salon_staff",
  "salon_customers",
  "salon_appointments",
  "salon_appointment_segments",
  "salon_inventory_products",
  "salon_enabled_brands",
  "salon_enabled_product_lines",
  "salon_product_usage",
];

async function checkTables(client) {
  // Single query: one to_regclass() per column — avoids N round trips.
  const cols = ALL_TABLES.map((t) => `to_regclass('public.${t}') IS NOT NULL AS "${t}"`).join(", ");
  const r = await client.query(`SELECT ${cols}`);
  return r.rows[0] || {};
}

// ── Mappers ───────────────────────────────────────────────────────────────────

function rowToSalon(row) {
  // Older databases may not yet have every optional salon profile/onboarding
  // column. Default gracefully so existing salons never get blocked by a
  // missing first-run field during rollout.
  let workingHours = [];
  if (Array.isArray(row.working_hours)) {
    workingHours = row.working_hours;
  } else if (row.working_hours && typeof row.working_hours === "string") {
    try { workingHours = JSON.parse(row.working_hours); } catch { /* keep [] */ }
  }

  return {
    id: row.id,
    name: row.name,
    businessName: row.business_name || null,
    slug: row.slug,
    timezone: row.timezone || "UTC",
    currency: row.currency || "ILS",
    phone: row.phone || null,
    email: row.email || null,
    address: row.address || null,
    city: row.city || null,
    status: row.status || "active",
    onboardingStatus: row.onboarding_status || "completed",
    onboardingCurrentStep: row.onboarding_current_step || null,
    onboardingCompletedAt: row.onboarding_completed_at || null,
    onboardingUpdatedAt: row.onboarding_updated_at || null,
    workingHours,
  };
}

function rowToDepartment(row) {
  return {
    id: row.id,
    name: row.name,
    calendarLabel: row.calendar_label,
    calendarColor: row.calendar_color,
    bookingMode: row.booking_mode,
    isCalendarEnabled: row.is_calendar_enabled,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

function rowToCategory(row) {
  return {
    id: row.id,
    departmentId: row.department_id || null,
    // crm_category_id added by migration 034; fall back to "other" if absent.
    crmCategoryId: row.crm_category_id || "other",
    name: row.name,
    accentColor: row.accent_color || null,
    sortOrder: row.sort_order,
    status: row.status,
  };
}

function rowToService(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    categoryId: row.category_id || null,
    // crm_category_id joined from salon_service_categories (migration 034).
    crmCategoryId: row.crm_category_id || "other",
    name: row.name,
    defaultDurationMinutes: row.default_duration_minutes,
    defaultPriceCents: row.default_price_cents,
    defaultMaterialCostCents: row.default_material_cost_cents,
    accentColor: row.accent_color || null,
    sortOrder: row.sort_order || 0,
    status: row.status,
    // Extra runtime fields added by migration 034 (undefined if column absent).
    defaultStages: row.default_stages || [],
    linkedServiceIds: row.linked_service_ids || [],
    allowClientTimingOverrides: row.allow_client_timing_overrides !== undefined
      ? row.allow_client_timing_overrides
      : true,
    canOverlapDuringProcessing: row.can_overlap_during_processing !== undefined
      ? row.can_overlap_during_processing
      : true,
  };
}

function rowToStaff(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    name: row.name,
    role: row.role || null,
    color: row.color || null,
    avatarUrl: row.avatar_url || null,
    email: row.email || null,
    phone: row.phone || null,
    departmentIds: Array.isArray(row.department_ids) ? row.department_ids : [],
    serviceIds: Array.isArray(row.service_ids) ? row.service_ids : [],
    servicePriceOverrides: (row.service_price_overrides && typeof row.service_price_overrides === "object")
      ? row.service_price_overrides
      : {},
    workingHours: Array.isArray(row.working_hours) ? row.working_hours : [],
    rating: row.rating === null || row.rating === undefined ? null : Number(row.rating),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToCustomer(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    firstName: row.first_name,
    lastName: row.last_name || null,
    phone: row.phone || null,
    email: row.email || null,
    notes: row.notes || null,
    tags: Array.isArray(row.tags) ? row.tags : [],
    avatarUrl: row.avatar_url || null,
    isVip: Boolean(row.is_vip),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToSegment(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    appointmentId: row.appointment_id,
    staffMemberId: row.staff_member_id || null,
    resourceId: row.resource_id || null,
    serviceId: row.service_id || null,
    serviceName: row.service_name || null,
    serviceCategoryId: row.service_category_id || null,
    segmentType: row.segment_type || "service",
    label: row.label || "",
    startTime: row.start_time,
    endTime: row.end_time,
    sortOrder: row.sort_order || 0,
    productGrams: row.product_grams === null || row.product_grams === undefined
      ? null
      : Number(row.product_grams),
    notes: row.notes || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAppointment(row, segments = []) {
  return {
    id: row.id,
    salonId: row.salon_id,
    staffMemberId: row.staff_member_id || null,
    customerId: row.customer_id || null,
    customerName: row.customer_name || "",
    serviceId: row.service_id || null,
    serviceName: row.service_name || "",
    serviceCategoryId: row.service_category_id || null,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes || null,
    groupId: row.group_id || null,
    segments,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToProductUsage(row) {
  const cost = row.cost_at_use_amount === null || row.cost_at_use_amount === undefined
    ? 0
    : Number(row.cost_at_use_amount);
  return {
    id: row.id,
    mixSessionId: row.visit_id || row.id,
    productId: row.product_id,
    inventoryItemId: row.inventory_product_id || "",
    grams: row.quantity === null || row.quantity === undefined ? 0 : Number(row.quantity),
    costAtUseUsd: Number.isFinite(cost) ? cost : 0,
    recordedAt: row.recorded_at,
  };
}

// ── Data loaders ─────────────────────────────────────────────────────────────
// Each loader accepts the pre-checked `tables` map and only queries when the
// relevant table exists. Returns an empty value when absent.

async function loadSalon(client, salonId, tables) {
  if (!tables["salons"]) return null;
  const r = await client.query(`SELECT * FROM salons WHERE id = $1 LIMIT 1`, [salonId]);
  return r.rows[0] ? rowToSalon(r.rows[0]) : null;
}

async function loadDepartments(client, salonId, tables) {
  if (!tables["salon_departments"]) return [];
  const r = await client.query(
    `SELECT * FROM salon_departments
     WHERE salon_id = $1
     ORDER BY sort_order ASC, name ASC`,
    [salonId],
  );
  return r.rows.map(rowToDepartment);
}

async function loadServiceCategories(client, salonId, tables) {
  if (!tables["salon_service_categories"]) return [];
  const r = await client.query(
    `SELECT * FROM salon_service_categories
     WHERE salon_id = $1
     ORDER BY sort_order ASC, name ASC`,
    [salonId],
  );
  return r.rows.map(rowToCategory);
}

async function loadServices(client, salonId, tables) {
  if (!tables["salon_services"]) return [];
  // JOIN with categories to pull crm_category_id when migration 034 has run.
  const hasCats = Boolean(tables["salon_service_categories"]);
  let sql, params;
  if (hasCats) {
    sql = `
      SELECT s.*, c.crm_category_id
      FROM salon_services s
      LEFT JOIN salon_service_categories c
        ON c.id = s.category_id AND c.salon_id = s.salon_id
      WHERE s.salon_id = $1
      ORDER BY s.sort_order ASC, s.name ASC`;
  } else {
    sql = `SELECT * FROM salon_services WHERE salon_id = $1 ORDER BY sort_order ASC, name ASC`;
  }
  params = [salonId];
  const r = await client.query(sql, params);
  return r.rows.map(rowToService);
}

async function loadStaff(client, salonId, tables) {
  if (!tables["salon_staff"]) return [];
  const r = await client.query(
    `SELECT id, salon_id, name, role, color, avatar_url, email, phone,
            department_ids, service_ids, service_price_overrides, working_hours,
            rating, status, created_at, updated_at
     FROM salon_staff
     WHERE salon_id = $1
     ORDER BY name ASC, created_at ASC`,
    [salonId],
  );
  return r.rows.map(rowToStaff);
}

async function loadCustomers(client, salonId, tables) {
  if (!tables["salon_customers"]) return [];
  const r = await client.query(
    `SELECT id, salon_id, first_name, last_name, phone, email, notes, tags,
            avatar_url, is_vip, status, created_at, updated_at
     FROM salon_customers
     WHERE salon_id = $1 AND status <> 'archived'
     ORDER BY first_name ASC, last_name ASC NULLS LAST, created_at DESC`,
    [salonId],
  );
  return r.rows.map(rowToCustomer);
}

async function loadAppointments(client, salonId, tables) {
  if (!tables["salon_appointments"]) return [];

  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - APPT_PAST_DAYS);
  const to = new Date(now);
  to.setDate(to.getDate() + APPT_FUTURE_DAYS);

  const hasSegments = Boolean(tables["salon_appointment_segments"]);

  if (hasSegments) {
    // Join segments in a single query using json_agg, strictly scoped by
    // salon_id on the segments side to prevent cross-tenant bleed.
    const r = await client.query(
      `SELECT
         a.*,
         COALESCE(
           json_agg(
             to_jsonb(s) ORDER BY s.sort_order ASC, s.start_time ASC, s.id ASC
           ) FILTER (WHERE s.id IS NOT NULL),
           '[]'
         ) AS segments
       FROM salon_appointments a
       LEFT JOIN salon_appointment_segments s
         ON s.appointment_id = a.id AND s.salon_id = $1
       WHERE a.salon_id = $1
         AND a.start_time >= $2::timestamptz
         AND a.start_time <= $3::timestamptz
       GROUP BY a.id
       ORDER BY a.start_time ASC, a.created_at ASC`,
      [salonId, from.toISOString(), to.toISOString()],
    );
    return r.rows.map((row) => {
      const segs = Array.isArray(row.segments) ? row.segments : [];
      return rowToAppointment(row, segs.map(rowToSegment));
    });
  }

  // segments table absent: return appointments with empty segment arrays.
  const r = await client.query(
    `SELECT * FROM salon_appointments
     WHERE salon_id = $1
       AND start_time >= $2::timestamptz
       AND start_time <= $3::timestamptz
     ORDER BY start_time ASC, created_at ASC`,
    [salonId, from.toISOString(), to.toISOString()],
  );
  return r.rows.map((row) => rowToAppointment(row, []));
}

async function loadInventory(client, salonId, tables) {
  const hasSalonInventory = Boolean(tables["salon_inventory_products"]);
  const hasEnabledBrands = Boolean(tables["salon_enabled_brands"]);
  const hasEnabledLines = Boolean(tables["salon_enabled_product_lines"]);

  const [summaryRow, enabledBrandsCount, enabledProductLinesCount] = await Promise.all([
    hasSalonInventory
      ? client.query(
          `SELECT
             COUNT(*)::int                                                       AS total_products,
             COALESCE(SUM(units_in_stock), 0)::numeric                          AS total_units,
             COUNT(*) FILTER (WHERE units_in_stock > 0
                               AND units_in_stock <= min_stock)::int            AS low_stock_count,
             COUNT(*) FILTER (WHERE units_in_stock <= 0)::int                   AS out_of_stock_count
           FROM salon_inventory_products
           WHERE salon_id = $1 AND status = 'active'`,
          [salonId],
        ).then((r) => r.rows[0] || null)
      : Promise.resolve(null),

    hasEnabledBrands
      ? client.query(
          `SELECT COUNT(*)::int AS n FROM salon_enabled_brands
           WHERE salon_id = $1 AND status = 'enabled'`,
          [salonId],
        ).then((r) => (r.rows[0] ? r.rows[0].n : null))
      : Promise.resolve(null),

    hasEnabledLines
      ? client.query(
          `SELECT COUNT(*)::int AS n FROM salon_enabled_product_lines
           WHERE salon_id = $1 AND status = 'enabled'`,
          [salonId],
        ).then((r) => (r.rows[0] ? r.rows[0].n : null))
      : Promise.resolve(null),
  ]);

  const summary = summaryRow
    ? {
        totalProducts: summaryRow.total_products,
        totalUnits: Number(summaryRow.total_units),
        lowStockCount: summaryRow.low_stock_count,
        outOfStockCount: summaryRow.out_of_stock_count,
      }
    : null;

  return {
    available: hasSalonInventory,
    summary,
    enabledBrandsCount,
    enabledProductLinesCount,
  };
}

async function loadProductUsage(client, salonId, tables) {
  if (!tables["salon_product_usage"]) return [];
  const r = await client.query(
    `SELECT id, salon_id, product_id, inventory_product_id, visit_id, quantity,
            recorded_at, cost_at_use_amount
     FROM salon_product_usage
     WHERE salon_id = $1
     ORDER BY recorded_at ASC, created_at ASC, id ASC`,
    [salonId],
  );
  return r.rows.map(rowToProductUsage);
}

// ── Handler ───────────────────────────────────────────────────────────────────

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return optionsResponse();
  if (event.httpMethod !== "GET") {
    return failure(405, "METHOD_NOT_ALLOWED", "Method not allowed");
  }

  // Resolve salon from verified session token. Never from client input.
  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) {
      return failure(err.statusCode, "AUTH_ERROR", err.message);
    }
    return failure(401, "UNAUTHORIZED", "Unauthorized");
  }
  const salonId = salonCtx.salonId;

  const currentUser = {
    id: salonCtx.userId || null,
    role: salonCtx.role || null,
  };

  // No-DB fast path (local dev without NEON_DATABASE_URL).
  if (!hasDatabaseUrl()) {
    return success(
      {
        salon: null,
        currentUser,
        role: currentUser.role,
        departments: [],
        serviceCategories: [],
        services: [],
        staff: [],
        customers: [],
        appointments: [],
        productUsage: [],
        inventory: {
          available: false,
          summary: null,
          enabledBrandsCount: null,
          enabledProductLinesCount: null,
        },
        needsMigration: true,
      },
      {
        salonId,
        source: salonCtx.source,
        counts: {},
        mock: true,
        generatedAt: new Date().toISOString(),
      },
    );
  }

  let client;
  try {
    client = createClient();
    await client.connect();

    // Single round-trip to confirm which tables exist before issuing data queries.
    const tables = await checkTables(client);

    // All loaders run in parallel over the same connection (pg queues them).
    const [
      salon,
      departments,
      serviceCategories,
      services,
      staff,
      customers,
      appointments,
      inventory,
      productUsage,
    ] = await Promise.all([
      loadSalon(client, salonId, tables),
      loadDepartments(client, salonId, tables),
      loadServiceCategories(client, salonId, tables),
      loadServices(client, salonId, tables),
      loadStaff(client, salonId, tables),
      loadCustomers(client, salonId, tables),
      loadAppointments(client, salonId, tables),
      loadInventory(client, salonId, tables),
      loadProductUsage(client, salonId, tables),
    ]);

    // needsMigration: true when any core runtime table was absent.
    const coreTables = [
      "salons",
      "salon_departments",
      "salon_service_categories",
      "salon_services",
      "salon_staff",
      "salon_customers",
      "salon_appointments",
      "salon_appointment_segments",
    ];
    const needsMigration = coreTables.some((t) => !tables[t]);

    const counts = {
      departments: departments.length,
      serviceCategories: serviceCategories.length,
      services: services.length,
      staff: staff.length,
      customers: customers.length,
      appointments: appointments.length,
      productUsage: productUsage.length,
    };

    return success(
      {
        salon,
        currentUser,
        role: currentUser.role,
        departments,
        serviceCategories,
        services,
        staff,
        customers,
        appointments,
        productUsage,
        inventory,
        needsMigration,
      },
      {
        salonId,
        source: salonCtx.source,
        counts,
        generatedAt: new Date().toISOString(),
        appointmentWindow: {
          from: (() => {
            const d = new Date(); d.setDate(d.getDate() - APPT_PAST_DAYS); return d.toISOString();
          })(),
          to: (() => {
            const d = new Date(); d.setDate(d.getDate() + APPT_FUTURE_DAYS); return d.toISOString();
          })(),
        },
      },
    );
  } catch (err) {
    // Log only the safe error message, never connection strings or secrets.
    console.error("[crm-bootstrap] error:", err.message || "unexpected error");
    return failure(500, "INTERNAL_ERROR", "Internal server error");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
