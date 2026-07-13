#!/usr/bin/env node
"use strict";

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const ROOT = path.resolve(__dirname, "../..");
const OUT_ROOT = path.join(ROOT, "data-import");
const NORMALIZED_DIR = path.join(OUT_ROOT, "normalized");
const MAPPINGS_DIR = path.join(OUT_ROOT, "mappings");
const REPORTS_DIR = path.join(OUT_ROOT, "reports");

const ADMIN_SNAPSHOT = path.join(ROOT, "src/data/admin-current-users-snapshot.json");
const CUSTOMER_IDS = path.join(ROOT, "docs/customer-ids.json");
const POL_RAW = path.join(ROOT, "reports/pol-customer-usage/pol-customer-usage.raw.json");
const POL_SOURCE_DIR = path.join(ROOT, "reports/pol-customer-usage/source-excels");
const USERS_USAGE_DIR = path.join(ROOT, "reports/users_susege_reports");
const PAUL_DIR = path.join(ROOT, "reports/reports-for-paul");

const FIELD_MAPPING_VERSION = "spectra-pilot-field-map-v1";
const NORMALIZATION_VERSION = "spectra-pilot-normalization-v1";
const IMPORTER_VERSION = "dry-run-only-v1";
const DEFAULT_VAT_RATE_BPS = process.env.SPECTRA_PILOT_DEFAULT_VAT_BPS || "";

const ACTIVE_RECENCY_DAYS = 60;

const CSV_HEADERS = {
  salons: [
    "external_salon_id",
    "proposed_salon_id",
    "salon_name",
    "legal_or_business_name",
    "salon_phone_original",
    "salon_phone_normalized",
    "owner_name",
    "owner_phone_original",
    "owner_phone_normalized",
    "owner_email",
    "city",
    "address",
    "country_code",
    "timezone",
    "currency",
    "default_vat_rate_bps",
    "source_system",
    "source_record_id",
    "active_status",
    "data_quality_status",
    "notes",
  ],
  salon_users: [
    "external_user_id",
    "proposed_user_id",
    "proposed_salon_id",
    "full_name",
    "phone_original",
    "phone_normalized",
    "email",
    "role",
    "membership_status",
    "login_identifier_type",
    "invite_required",
    "source_system",
    "source_record_id",
    "data_quality_status",
  ],
  staff: [
    "external_staff_id",
    "proposed_staff_id",
    "proposed_salon_id",
    "full_name",
    "phone_original",
    "phone_normalized",
    "email",
    "active_status",
    "is_bookable",
    "is_owner",
    "source_system",
    "source_record_id",
    "data_quality_status",
  ],
  service_categories: [
    "external_category_id",
    "proposed_category_id",
    "proposed_salon_id",
    "category_name_original",
    "category_name_normalized",
    "department_name",
    "active_status",
    "sort_order",
    "source_system",
    "source_record_id",
    "data_quality_status",
  ],
  services: [
    "external_service_id",
    "proposed_service_id",
    "proposed_salon_id",
    "proposed_category_id",
    "service_name_original",
    "service_name_normalized",
    "default_duration_minutes",
    "default_price_cents",
    "active_status",
    "is_split_service",
    "default_stages_json",
    "material_cost_cents",
    "source_system",
    "source_record_id",
    "first_seen_at",
    "last_seen_at",
    "usage_count",
    "data_quality_status",
    "notes",
  ],
  customers: [
    "external_customer_id",
    "proposed_customer_id",
    "proposed_salon_id",
    "full_name",
    "first_name",
    "last_name",
    "phone_original",
    "phone_normalized",
    "email",
    "date_of_birth",
    "gender",
    "first_visit_at",
    "last_visit_at",
    "total_visit_count",
    "total_known_spend_cents",
    "notes",
    "marketing_consent",
    "consent_source",
    "source_system",
    "source_record_id",
    "data_quality_status",
  ],
  visits: [
    "external_visit_id",
    "proposed_visit_id",
    "proposed_salon_id",
    "proposed_customer_id",
    "proposed_staff_id",
    "visit_date",
    "start_datetime",
    "end_datetime",
    "duration_minutes",
    "operational_status",
    "payment_status",
    "total_charged_cents",
    "total_paid_cents",
    "notes",
    "source_system",
    "source_record_id",
    "data_quality_status",
    "time_precision",
    "financial_data_confidence",
    "source_status_original",
  ],
  visit_services: [
    "external_visit_service_id",
    "proposed_visit_service_id",
    "proposed_salon_id",
    "proposed_visit_id",
    "proposed_customer_id",
    "proposed_service_id",
    "service_name_original",
    "proposed_staff_id",
    "quantity",
    "duration_minutes",
    "charged_amount_cents",
    "material_cost_cents",
    "stage_information_json",
    "formula_or_treatment_reference",
    "source_system",
    "source_record_id",
    "data_quality_status",
  ],
  visit_notes: [
    "proposed_salon_id",
    "proposed_customer_id",
    "proposed_visit_id",
    "note_type",
    "note_text",
    "created_at",
    "source_system",
    "source_record_id",
    "data_quality_status",
  ],
};

const POL_SOURCE_TO_ADMIN_NAME = {
  "Avi Poladi": "אבי פולדי",
  "Inon Yosef": "ינון יוסף",
  "Itzik Kirma": "איציק קירמה",
  "Sharon Mor": "שרון מור",
  "Yakir Cohen": "יקיר כהן - ספר על הבר",
  "שחר מלכה": "שחר מלכה - Hair Story",
};

function ensureDirs() {
  for (const dir of [NORMALIZED_DIR, MAPPINGS_DIR, REPORTS_DIR]) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function hashId(prefix, value) {
  const digest = crypto.createHash("sha256").update(String(value)).digest("hex").slice(0, 16);
  return `${prefix}_${digest}`;
}

function fileHash(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function normalizePhoneToE164(raw) {
  if (raw === null || raw === undefined || raw === "") {
    return { normalized: "", valid: false, reason: "missing" };
  }

  const digits = String(raw).replace(/[^\d]/g, "");
  if (/^9725\d{8}$/.test(digits)) return { normalized: `+${digits}`, valid: true, reason: "" };
  if (/^05\d{8}$/.test(digits)) return { normalized: `+972${digits.slice(1)}`, valid: true, reason: "" };
  if (/^5\d{8}$/.test(digits)) return { normalized: `+972${digits}`, valid: true, reason: "" };
  if (/^972[23489]\d{7,8}$/.test(digits)) return { normalized: `+${digits}`, valid: true, reason: "" };
  if (/^0[23489]\d{7,8}$/.test(digits)) return { normalized: `+972${digits.slice(1)}`, valid: true, reason: "" };
  if (/^1[78]00\d{6,7}$/.test(digits)) return { normalized: `+972${digits}`, valid: true, reason: "" };

  return { normalized: "", valid: false, reason: "invalid_or_non_israeli" };
}

function activeAgeInDays(value) {
  if (!value || value === "-") return Infinity;
  const text = String(value).trim().toLowerCase();
  const match = text.match(/^(\d+)/);
  const amount = match ? Number(match[1]) : 0;
  if (text.includes("hour")) return amount / 24;
  if (text.includes("day")) return amount;
  if (text.includes("month")) return amount * 30;
  if (text.includes("year")) return amount * 365;
  return Infinity;
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  const text = typeof value === "string" ? value : JSON.stringify(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(headers.map((header) => csvValue(row[header])).join(","));
  }
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function cents(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "";
  return String(Math.round(number * 100));
}

function parseLocalDateTime(date, time) {
  if (!date) return { visitDate: "", start: "", precision: "unknown" };
  const visitDate = date;
  if (!time) return { visitDate, start: "", precision: "date_only" };

  const raw = String(time).trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) return { visitDate, start: "", precision: "date_only" };
  const hh = match[1].padStart(2, "0");
  const mm = match[2];
  const ss = (match[3] || "00").padStart(2, "0");
  return {
    visitDate,
    start: `${visitDate}T${hh}:${mm}:${ss}+03:00`,
    precision: "exact_datetime",
  };
}

function listFilesRecursive(dir, predicate) {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFilesRecursive(full, predicate));
    else if (!predicate || predicate(full)) out.push(full);
  }
  return out.sort();
}

function inspectWorkbook(filePath) {
  const workbook = XLSX.readFile(filePath, { cellDates: false });
  return workbook.SheetNames.map((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      raw: false,
      defval: "",
      blankrows: false,
    });
    let headerRow = rows.findIndex((row) =>
      row.map((cell) => String(cell).trim()).some((cell) =>
        ["userId", "DisplayName", "Date", "Client", "Service", "PhoneNumber"].includes(cell),
      ),
    );
    if (headerRow < 0) headerRow = rows.length > 1 ? 1 : 0;
    const headers = (rows[headerRow] || []).map((cell) => String(cell).trim()).filter(Boolean);
    return {
      sheet_name: sheetName,
      header_row: headerRow,
      record_count: Math.max(0, rows.length - headerRow - 1),
      field_names: headers,
    };
  });
}

function sourceInventory() {
  const files = [
    ADMIN_SNAPSHOT,
    CUSTOMER_IDS,
    POL_RAW,
    ...listFilesRecursive(USERS_USAGE_DIR, (file) => file.endsWith(".xlsx")),
    ...listFilesRecursive(POL_SOURCE_DIR, (file) => file.endsWith(".xlsx")),
  ].filter((filePath) => fs.existsSync(filePath));

  return files.map((filePath) => {
    const relative = path.relative(ROOT, filePath);
    const ext = path.extname(filePath).replace(".", "").toLowerCase();
    const item = {
      file_name: relative,
      format: ext || "unknown",
      sha256: fileHash(filePath),
      record_counts: {},
      sheets: [],
      candidate_field_mappings: [],
    };

    if (ext === "xlsx") {
      item.sheets = inspectWorkbook(filePath);
      item.record_counts.total_rows = item.sheets.reduce((sum, sheet) => sum + sheet.record_count, 0);
    } else if (ext === "json") {
      const parsed = readJson(filePath, null);
      if (Array.isArray(parsed)) {
        item.record_counts.records = parsed.length;
        item.candidate_field_mappings = Object.keys(parsed[0] || {});
      } else if (parsed && parsed.rows) {
        item.record_counts.rows = parsed.rows.length;
        item.record_counts.service_rows = parsed.rows.filter((row) => row.rowType === "service_total").length;
        item.record_counts.product_rows = parsed.rows.filter((row) => row.rowType === "product_line").length;
        item.candidate_field_mappings = Object.keys(parsed.rows[0] || {});
      } else if (parsed && parsed.customers) {
        item.record_counts.customers = parsed.customers.length;
        item.candidate_field_mappings = Object.keys(parsed.customers[0] || {});
      }
    }

    return item;
  });
}

function buildActiveSalons() {
  const adminRows = readJson(ADMIN_SNAPSHOT, []);
  const customerIds = readJson(CUSTOMER_IDS, { customers: [] }).customers || [];
  const byPhone = new Map();

  for (const customer of customerIds) {
    const phone = normalizePhoneToE164(customer.phone).normalized;
    if (phone) byPhone.set(phone, customer);
  }

  const activeRows = adminRows
    .map((row, index) => ({ ...row, _sourceIndex: index + 1, _phone: normalizePhoneToE164(row.phone_number) }))
    .filter((row) => row._phone.valid)
    .filter((row) => activeAgeInDays(row.last_mix_date) <= ACTIVE_RECENCY_DAYS)
    .sort((a, b) => normalizeName(a.salon_name).localeCompare(normalizeName(b.salon_name), "he"));

  const salons = [];
  const users = [];
  const salonByName = new Map();
  const sourceMapping = {
    admin_snapshot_source: path.relative(ROOT, ADMIN_SNAPSHOT),
    customer_ids_source: path.relative(ROOT, CUSTOMER_IDS),
    pol_raw_source: path.relative(ROOT, POL_RAW),
    pol_source_to_admin_name: POL_SOURCE_TO_ADMIN_NAME,
    notes: [
      "Admin snapshot is treated as salon/login candidate source, not as proof that salon_phone is owner_phone.",
      "POL usage history exists only for mapped salons present in pol-customer-usage.raw.json.",
    ],
  };

  for (const row of activeRows) {
    const matched = byPhone.get(row._phone.normalized);
    const externalSalonId = matched?.userId || `admin_snapshot_row_${row._sourceIndex}`;
    const proposedSalonId = hashId("salon", `admin-current-users-snapshot:${externalSalonId}`);
    const sourceRecordId = matched?.userId || String(row._sourceIndex);
    const loginStatus = row._phone.valid ? "needs_review_login_identity_not_owner_verified" : "blocked_invalid_phone";

    const salon = {
      external_salon_id: externalSalonId,
      proposed_salon_id: proposedSalonId,
      salon_name: row.salon_name || "",
      legal_or_business_name: "",
      salon_phone_original: row.phone_number || "",
      salon_phone_normalized: row._phone.normalized,
      owner_name: "",
      owner_phone_original: "",
      owner_phone_normalized: "",
      owner_email: "",
      city: row.city || matched?.city || "",
      address: "",
      country_code: "IL",
      timezone: "Asia/Jerusalem",
      currency: "ILS",
      default_vat_rate_bps: DEFAULT_VAT_RATE_BPS,
      source_system: "admin-current-users-snapshot",
      source_record_id: sourceRecordId,
      active_status: "active",
      data_quality_status: loginStatus,
      notes: "Salon phone is preserved as salon/login candidate only; owner login requires review before invite.",
    };

    salons.push(salon);
    salonByName.set(normalizeName(row.salon_name), salon);

    users.push({
      external_user_id: `admin_candidate:${externalSalonId}`,
      proposed_user_id: hashId("user", `${proposedSalonId}:admin_candidate:${row._phone.normalized}`),
      proposed_salon_id: proposedSalonId,
      full_name: row.salon_name || "",
      phone_original: row.phone_number || "",
      phone_normalized: row._phone.normalized,
      email: "",
      role: "admin_candidate",
      membership_status: "pending_review",
      login_identifier_type: "phone",
      invite_required: "true",
      source_system: "admin-current-users-snapshot",
      source_record_id: sourceRecordId,
      data_quality_status: loginStatus,
    });
  }

  return { salons, users, salonByName, sourceMapping };
}

function buildPolHistory(salonByName) {
  const raw = readJson(POL_RAW, { rows: [] });
  const rows = raw.rows || [];
  const rejected = [];
  const staffMap = new Map();
  const serviceMap = new Map();
  const customerMap = new Map();
  const visitMap = new Map();
  const visitServiceRows = [];
  const visitNotes = [];
  const salonsWithHistory = new Set();
  let productLinesWithoutService = 0;

  let currentService = null;
  for (const row of rows) {
    const adminName = POL_SOURCE_TO_ADMIN_NAME[row.sourceCustomer] || row.sourceCustomer;
    const salon = salonByName.get(normalizeName(adminName));
    if (!salon) {
      rejected.push({
        source_file: row.sourceFile || "",
        source_row: row.id || "",
        salon: row.sourceCustomer || "",
        entity_type: row.rowType || "usage_row",
        original_identifier: row.id || "",
        rejection_reason: "source_salon_not_in_active_israel_snapshot",
        recoverable: "yes",
        suggested_action: "Review salon mapping or active salon inclusion.",
      });
      continue;
    }

    salonsWithHistory.add(salon.proposed_salon_id);

    if (row.rowType === "product_line") {
      if (currentService && currentService.sourceCustomer === row.sourceCustomer) {
        currentService.materials.push(row);
      } else {
        productLinesWithoutService += 1;
      }
      continue;
    }

    currentService = null;

    if (row.rowType !== "service_total") continue;
    if (!row.client || !row.date || !row.service) {
      rejected.push({
        source_file: row.sourceFile || "",
        source_row: row.id || "",
        salon: row.sourceCustomer || "",
        entity_type: "visit_service",
        original_identifier: row.id || "",
        rejection_reason: "missing_required_client_date_or_service",
        recoverable: "yes",
        suggested_action: "Review original source row for missing visit identity fields.",
      });
      continue;
    }

    const proposedSalonId = salon.proposed_salon_id;
    const sourceCustomerId = normalizeName(row.client);
    const externalCustomerId = `pol_client:${row.sourceCustomer}:${sourceCustomerId}`;
    const proposedCustomerId = hashId("customer", `${proposedSalonId}:${externalCustomerId}`);
    const staffName = row.profile || "";
    const proposedStaffId = staffName ? hashId("staff", `${proposedSalonId}:${normalizeName(staffName)}`) : "";
    const normalizedService = normalizeName(row.service);
    const externalServiceId = `pol_service:${row.sourceCustomer}:${normalizedService}`;
    const proposedServiceId = hashId("service", `${proposedSalonId}:${externalServiceId}`);
    const visitFingerprint = `${proposedSalonId}:${proposedCustomerId}:${row.date}:${row.time || ""}:${proposedStaffId}`;
    const externalVisitId = `pol_visit:${visitFingerprint}`;
    const proposedVisitId = hashId("visit", externalVisitId);
    const proposedVisitServiceId = hashId("visit_service", `${proposedVisitId}:${row.id}`);
    const dateTime = parseLocalDateTime(row.date, row.time);

    if (staffName && !staffMap.has(proposedStaffId)) {
      staffMap.set(proposedStaffId, {
        external_staff_id: `pol_profile:${row.sourceCustomer}:${normalizeName(staffName)}`,
        proposed_staff_id: proposedStaffId,
        proposed_salon_id: proposedSalonId,
        full_name: staffName,
        phone_original: "",
        phone_normalized: "",
        email: "",
        active_status: "unknown",
        is_bookable: "",
        is_owner: "",
        source_system: "pol-customer-usage",
        source_record_id: row.profile || "",
        data_quality_status: "needs_review_profile_field_not_verified_staff",
      });
    }

    const customer = customerMap.get(proposedCustomerId) || {
      external_customer_id: externalCustomerId,
      proposed_customer_id: proposedCustomerId,
      proposed_salon_id: proposedSalonId,
      full_name: row.client,
      first_name: "",
      last_name: "",
      phone_original: "",
      phone_normalized: "",
      email: "",
      date_of_birth: "",
      gender: "",
      first_visit_at: row.date,
      last_visit_at: row.date,
      total_visit_count: 0,
      total_known_spend_cents: "",
      notes: "",
      marketing_consent: "",
      consent_source: "",
      source_system: "pol-customer-usage",
      source_record_id: externalCustomerId,
      data_quality_status: "needs_review_missing_customer_phone_source_id_is_name_fingerprint",
    };
    customer.first_visit_at = row.date < customer.first_visit_at ? row.date : customer.first_visit_at;
    customer.last_visit_at = row.date > customer.last_visit_at ? row.date : customer.last_visit_at;
    customer.total_visit_count += 1;
    customerMap.set(proposedCustomerId, customer);

    const service = serviceMap.get(proposedServiceId) || {
      external_service_id: externalServiceId,
      proposed_service_id: proposedServiceId,
      proposed_salon_id: proposedSalonId,
      proposed_category_id: "",
      service_name_original: row.service,
      service_name_normalized: normalizedService,
      default_duration_minutes: "",
      default_price_cents: "",
      active_status: "active",
      is_split_service: "",
      default_stages_json: "",
      material_cost_cents: "",
      source_system: "pol-customer-usage",
      source_record_id: externalServiceId,
      first_seen_at: row.date,
      last_seen_at: row.date,
      usage_count: 0,
      data_quality_status: "needs_review_historical_service_text_candidate",
      notes: "Created from historical service text; scoped to one salon.",
    };
    service.first_seen_at = row.date < service.first_seen_at ? row.date : service.first_seen_at;
    service.last_seen_at = row.date > service.last_seen_at ? row.date : service.last_seen_at;
    service.usage_count += 1;
    serviceMap.set(proposedServiceId, service);

    if (!visitMap.has(proposedVisitId)) {
      visitMap.set(proposedVisitId, {
        external_visit_id: externalVisitId,
        proposed_visit_id: proposedVisitId,
        proposed_salon_id: proposedSalonId,
        proposed_customer_id: proposedCustomerId,
        proposed_staff_id: proposedStaffId,
        visit_date: dateTime.visitDate,
        start_datetime: dateTime.start,
        end_datetime: "",
        duration_minutes: "",
        operational_status: "historical",
        payment_status: "",
        total_charged_cents: "",
        total_paid_cents: "",
        notes: "",
        source_system: "pol-customer-usage",
        source_record_id: externalVisitId,
        data_quality_status: dateTime.precision === "exact_datetime" ? "ready_with_warnings_financials_absent" : "needs_review_date_only_time",
        time_precision: dateTime.precision,
        financial_data_confidence: "absent",
        source_status_original: "",
      });
    }

    const visitService = {
      external_visit_service_id: `pol_visit_service:${row.id}`,
      proposed_visit_service_id: proposedVisitServiceId,
      proposed_salon_id: proposedSalonId,
      proposed_visit_id: proposedVisitId,
      proposed_customer_id: proposedCustomerId,
      proposed_service_id: proposedServiceId,
      service_name_original: row.service,
      proposed_staff_id: proposedStaffId,
      quantity: "1",
      duration_minutes: "",
      charged_amount_cents: "",
      material_cost_cents: "",
      stage_information_json: "",
      formula_or_treatment_reference: "",
      source_system: "pol-customer-usage",
      source_record_id: row.id,
      data_quality_status: "ready_with_warnings_no_payment_confirmation",
    };
    visitServiceRows.push(visitService);
    currentService = {
      sourceCustomer: row.sourceCustomer,
      visitService,
      materials: [],
    };
  }

  // Attach formula/material rows after the scan so service rows keep lineage and explicit costs.
  currentService = null;
  const serviceBySourceId = new Map(visitServiceRows.map((row) => [row.source_record_id, row]));
  for (const row of rows) {
    if (row.rowType === "service_total") {
      currentService = serviceBySourceId.get(row.id)
        ? { sourceCustomer: row.sourceCustomer, serviceRow: serviceBySourceId.get(row.id), materials: [] }
        : null;
      continue;
    }
    if (row.rowType !== "product_line" || !currentService || currentService.sourceCustomer !== row.sourceCustomer) continue;

    currentService.materials.push({
      brand: row.brand || "",
      series: row.series || "",
      shade: row.shade || "",
      grams: row.grams || 0,
      cost: row.cost || 0,
      rounded: row.rounded || "",
      reweight: row.reweight || "",
      source_record_id: row.id || "",
    });

    const materialCost = currentService.materials.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    currentService.serviceRow.material_cost_cents = cents(materialCost);
    currentService.serviceRow.stage_information_json = JSON.stringify(currentService.materials);
    currentService.serviceRow.formula_or_treatment_reference = JSON.stringify({
      source: "pol_product_lines",
      product_line_count: currentService.materials.length,
      source_record_ids: currentService.materials.map((item) => item.source_record_id),
    });
  }

  if (productLinesWithoutService > 0) {
    rejected.push({
      source_file: path.relative(ROOT, POL_RAW),
      source_row: "",
      salon: "",
      entity_type: "product_line",
      original_identifier: "",
      rejection_reason: `product_lines_without_preceding_service:${productLinesWithoutService}`,
      recoverable: "yes",
      suggested_action: "Review ordering in pol-customer-usage.raw.json.",
    });
  }

  return {
    staff: [...staffMap.values()],
    services: [...serviceMap.values()],
    customers: [...customerMap.values()],
    visits: [...visitMap.values()],
    visitServices: visitServiceRows,
    visitNotes,
    rejected,
    salonsWithHistory,
  };
}

function duplicateReport(salons, users, customers, services, visits, visitServices) {
  const by = (rows, keyFn) => {
    const map = new Map();
    for (const row of rows) {
      const key = keyFn(row);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return [...map.entries()].filter(([, list]) => list.length > 1);
  };

  const visitDateById = new Map(visits.map((row) => [row.proposed_visit_id, row.visit_date]));

  return {
    duplicate_salon_phone_candidates: by(salons, (row) => row.salon_phone_normalized).map(([phone, rows]) => ({
      phone_masked: maskPhone(phone),
      proposed_salon_ids: rows.map((row) => row.proposed_salon_id),
    })),
    duplicate_user_phone_candidates: by(users, (row) => row.phone_normalized).map(([phone, rows]) => ({
      phone_masked: maskPhone(phone),
      proposed_user_ids: rows.map((row) => row.proposed_user_id),
      proposed_salon_ids: rows.map((row) => row.proposed_salon_id),
    })),
    duplicate_customer_name_candidates_within_salon: by(customers, (row) => `${row.proposed_salon_id}:${normalizeName(row.full_name)}`).map(([, rows]) => ({
      proposed_salon_id: rows[0].proposed_salon_id,
      customer_name: rows[0].full_name,
      proposed_customer_ids: rows.map((row) => row.proposed_customer_id),
    })),
    duplicate_service_name_candidates_within_salon: by(services, (row) => `${row.proposed_salon_id}:${row.service_name_normalized}`).map(([, rows]) => ({
      proposed_salon_id: rows[0].proposed_salon_id,
      service_name_normalized: rows[0].service_name_normalized,
      proposed_service_ids: rows.map((row) => row.proposed_service_id),
    })),
    duplicate_visit_candidates_same_customer_date_service: by(visitServices, (row) => {
      const visitDate = visitDateById.get(row.proposed_visit_id) || "";
      return `${row.proposed_salon_id}:${row.proposed_customer_id}:${visitDate}:${row.proposed_service_id || row.service_name_original}`;
    }).map(([, rows]) => ({
      proposed_salon_id: rows[0].proposed_salon_id,
      proposed_customer_id: rows[0].proposed_customer_id,
      visit_date: visitDateById.get(rows[0].proposed_visit_id) || "",
      proposed_service_id: rows[0].proposed_service_id,
      proposed_visit_service_ids: rows.map((row) => row.proposed_visit_service_id),
    })),
  };
}

function maskPhone(phone) {
  if (!phone) return "";
  return `${phone.slice(0, 5)}***${phone.slice(-3)}`;
}

function validationReport(salons, users, staff, services, customers, visits, visitServices, rejected, duplicateCandidates, salonsWithHistory) {
  const bySalon = new Map(salons.map((salon) => [salon.proposed_salon_id, {
    salon_name: salon.salon_name,
    external_salon_id: salon.external_salon_id,
    proposed_salon_id: salon.proposed_salon_id,
    owner_login_readiness: salon.data_quality_status,
    customer_count: 0,
    unique_normalized_telephone_count: 0,
    invalid_telephone_count: 0,
    duplicate_customer_candidates: 0,
    service_count: 0,
    unresolved_service_count: 0,
    visit_count: 0,
    visit_date_range: { earliest: "", latest: "" },
    visits_missing_customers: 0,
    visits_missing_services: 0,
    visit_service_count: 0,
    staff_count: 0,
    unresolved_staff_references: 0,
    financial_fields_available: false,
    formula_material_data_available: false,
    critical_errors: [],
    warnings: [],
    readiness_status: "needs_review",
  }]));

  const customerIds = new Set(customers.map((row) => row.proposed_customer_id));
  const visitServiceByVisit = new Map();
  for (const row of visitServices) {
    const report = bySalon.get(row.proposed_salon_id);
    if (report) {
      report.visit_service_count += 1;
      if (row.stage_information_json) report.formula_material_data_available = true;
    }
    if (!visitServiceByVisit.has(row.proposed_visit_id)) visitServiceByVisit.set(row.proposed_visit_id, 0);
    visitServiceByVisit.set(row.proposed_visit_id, visitServiceByVisit.get(row.proposed_visit_id) + 1);
  }

  for (const row of customers) {
    const report = bySalon.get(row.proposed_salon_id);
    if (!report) continue;
    report.customer_count += 1;
    if (!row.phone_normalized) report.invalid_telephone_count += 1;
  }

  for (const row of services) {
    const report = bySalon.get(row.proposed_salon_id);
    if (!report) continue;
    report.service_count += 1;
    if (row.data_quality_status.includes("needs_review")) report.unresolved_service_count += 1;
  }

  for (const row of staff) {
    const report = bySalon.get(row.proposed_salon_id);
    if (!report) continue;
    report.staff_count += 1;
    if (row.data_quality_status.includes("needs_review")) report.unresolved_staff_references += 1;
  }

  for (const row of visits) {
    const report = bySalon.get(row.proposed_salon_id);
    if (!report) continue;
    report.visit_count += 1;
    if (!customerIds.has(row.proposed_customer_id)) report.visits_missing_customers += 1;
    if (!visitServiceByVisit.has(row.proposed_visit_id)) report.visits_missing_services += 1;
    if (!report.visit_date_range.earliest || row.visit_date < report.visit_date_range.earliest) report.visit_date_range.earliest = row.visit_date;
    if (!report.visit_date_range.latest || row.visit_date > report.visit_date_range.latest) report.visit_date_range.latest = row.visit_date;
  }

  const duplicatesBySalon = new Map();
  for (const duplicate of duplicateCandidates.duplicate_customer_name_candidates_within_salon) {
    duplicatesBySalon.set(duplicate.proposed_salon_id, (duplicatesBySalon.get(duplicate.proposed_salon_id) || 0) + 1);
  }

  for (const report of bySalon.values()) {
    report.duplicate_customer_candidates = duplicatesBySalon.get(report.proposed_salon_id) || 0;
    report.unique_normalized_telephone_count = 0;

    if (!salonsWithHistory.has(report.proposed_salon_id)) {
      report.warnings.push("No detailed customer/visit source file was available for this salon.");
    }
    if (report.owner_login_readiness.includes("not_owner_verified")) {
      report.warnings.push("Salon phone is not verified as owner/admin login identity.");
    }
    if (report.customer_count > 0 && report.invalid_telephone_count === report.customer_count) {
      report.warnings.push("Customer phone numbers are absent in the available detailed history source.");
    }
    if (report.visits_missing_customers > 0 || report.visits_missing_services > 0) {
      report.critical_errors.push("Broken visit relationship detected.");
    }

    if (report.critical_errors.length > 0) report.readiness_status = "blocked";
    else if (report.customer_count === 0 || report.service_count === 0 || report.visit_count === 0) report.readiness_status = "needs_review";
    else report.readiness_status = "ready_with_warnings";
  }

  return {
    generated_at: new Date().toISOString(),
    validation_scope: "dry_run_staging_package_only",
    salons: [...bySalon.values()],
    rejected_rows: rejected.length,
  };
}

function missingDataReportRows(salons, report) {
  const rows = [];
  for (const salon of report.salons) {
    if (salon.owner_login_readiness.includes("not_owner_verified")) {
      rows.push({
        proposed_salon_id: salon.proposed_salon_id,
        salon_name: salon.salon_name,
        entity_type: "salon_user",
        missing_or_ambiguous_field: "owner/admin login identity",
        impact: "invite cannot be sent without review",
        suggested_action: "Confirm owner/admin phone or email before activation.",
      });
    }
    if (salon.customer_count === 0) {
      rows.push({
        proposed_salon_id: salon.proposed_salon_id,
        salon_name: salon.salon_name,
        entity_type: "customers",
        missing_or_ambiguous_field: "customer history source",
        impact: "no customers/visits can be imported for this salon",
        suggested_action: "Provide salon customer/visit export.",
      });
    }
    if (salon.customer_count > 0 && salon.invalid_telephone_count === salon.customer_count) {
      rows.push({
        proposed_salon_id: salon.proposed_salon_id,
        salon_name: salon.salon_name,
        entity_type: "customers",
        missing_or_ambiguous_field: "customer phone numbers",
        impact: "customers cannot be matched by phone",
        suggested_action: "Provide source export with customer phone field if available.",
      });
    }
  }
  return rows;
}

function writeReports({ salons, users, staff, services, customers, visits, visitServices, visitNotes, rejected, sourceMapping, sourceInventoryRows, duplicateCandidates, validation }) {
  const sourceFilesProcessed = sourceInventoryRows.map((item) => item.file_name);
  const sourceFileHashes = Object.fromEntries(sourceInventoryRows.map((item) => [item.file_name, item.sha256]));
  const dateValues = visits.map((row) => row.visit_date).filter(Boolean).sort();
  const noCustomers = validation.salons.filter((salon) => salon.customer_count === 0).map((salon) => salon.proposed_salon_id);
  const noVisits = validation.salons.filter((salon) => salon.visit_count === 0).map((salon) => salon.proposed_salon_id);
  const noServices = validation.salons.filter((salon) => salon.service_count === 0).map((salon) => salon.proposed_salon_id);

  const manifest = {
    generated_at: new Date().toISOString(),
    contains_real_pii: true,
    pii_notice: "Generated normalized files contain real salon/customer names and may contain phone numbers. Do not commit or upload.",
    source_files_processed: sourceFilesProcessed,
    source_file_hashes: sourceFileHashes,
    total_salons: salons.length,
    total_proposed_users: users.length,
    total_staff: staff.length,
    total_categories: 0,
    total_services: services.length,
    total_customers: customers.length,
    total_visits: visits.length,
    total_visit_services: visitServices.length,
    total_visit_notes: visitNotes.length,
    earliest_visit_date: dateValues[0] || "",
    latest_visit_date: dateValues[dateValues.length - 1] || "",
    records_rejected: rejected.length,
    records_requiring_review: validation.salons.filter((salon) => salon.readiness_status !== "ready").length,
    duplicate_candidates: Object.values(duplicateCandidates).reduce((sum, list) => sum + list.length, 0),
    salons_with_missing_owner_login_identifier: validation.salons
      .filter((salon) => salon.owner_login_readiness.includes("not_owner_verified"))
      .map((salon) => salon.proposed_salon_id),
    salons_with_no_customers: noCustomers,
    salons_with_no_visits: noVisits,
    salons_with_no_service_mapping: noServices,
    field_mapping_version: FIELD_MAPPING_VERSION,
    normalization_version: NORMALIZATION_VERSION,
    importer_version: IMPORTER_VERSION,
    production_write_enabled: false,
  };

  const serviceMapping = {
    strategy: "tenant_scoped_exact_normalized_service_text",
    automatic_cross_salon_merge: false,
    service_identity_scope: "proposed_salon_id",
    unresolved_service_policy: "keep_as_review_candidate",
    services: services.map((service) => ({
      proposed_salon_id: service.proposed_salon_id,
      external_service_id: service.external_service_id,
      proposed_service_id: service.proposed_service_id,
      service_name_original: service.service_name_original,
      service_name_normalized: service.service_name_normalized,
      usage_count: Number(service.usage_count) || 0,
      confidence: "medium",
      status: service.data_quality_status,
    })),
  };

  fs.writeFileSync(path.join(MAPPINGS_DIR, "salon_mapping.json"), JSON.stringify({
    strategy: "admin_snapshot_active_israel_salons_with_pol_history_aliases",
    salons: salons.map((salon) => ({
      external_salon_id: salon.external_salon_id,
      proposed_salon_id: salon.proposed_salon_id,
      salon_name: salon.salon_name,
      phone_masked: maskPhone(salon.salon_phone_normalized),
      source_system: salon.source_system,
      data_quality_status: salon.data_quality_status,
    })),
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(MAPPINGS_DIR, "service_mapping.json"), JSON.stringify(serviceMapping, null, 2), "utf8");
  fs.writeFileSync(path.join(MAPPINGS_DIR, "source_mapping.json"), JSON.stringify(sourceMapping, null, 2), "utf8");

  fs.writeFileSync(path.join(REPORTS_DIR, "source_inventory.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    sources: sourceInventoryRows,
  }, null, 2), "utf8");
  fs.writeFileSync(path.join(REPORTS_DIR, "import_manifest.json"), JSON.stringify(manifest, null, 2), "utf8");
  fs.writeFileSync(path.join(REPORTS_DIR, "validation_report.json"), JSON.stringify(validation, null, 2), "utf8");
  fs.writeFileSync(path.join(REPORTS_DIR, "duplicate_report.json"), JSON.stringify(duplicateCandidates, null, 2), "utf8");

  writeCsv(path.join(REPORTS_DIR, "rejected_rows.csv"), [
    "source_file",
    "source_row",
    "salon",
    "entity_type",
    "original_identifier",
    "rejection_reason",
    "recoverable",
    "suggested_action",
  ], rejected);

  writeCsv(path.join(REPORTS_DIR, "missing_data_report.csv"), [
    "proposed_salon_id",
    "salon_name",
    "entity_type",
    "missing_or_ambiguous_field",
    "impact",
    "suggested_action",
  ], missingDataReportRows(salons, validation));

  return manifest;
}

function main() {
  ensureDirs();

  const sourceInventoryRows = sourceInventory();
  const { salons, users, salonByName, sourceMapping } = buildActiveSalons();
  const history = buildPolHistory(salonByName);
  const duplicateCandidates = duplicateReport(salons, users, history.customers, history.services, history.visits, history.visitServices);
  const validation = validationReport(
    salons,
    users,
    history.staff,
    history.services,
    history.customers,
    history.visits,
    history.visitServices,
    history.rejected,
    duplicateCandidates,
    history.salonsWithHistory,
  );

  writeCsv(path.join(NORMALIZED_DIR, "salons.csv"), CSV_HEADERS.salons, salons);
  writeCsv(path.join(NORMALIZED_DIR, "salon_users.csv"), CSV_HEADERS.salon_users, users);
  writeCsv(path.join(NORMALIZED_DIR, "staff.csv"), CSV_HEADERS.staff, history.staff);
  writeCsv(path.join(NORMALIZED_DIR, "service_categories.csv"), CSV_HEADERS.service_categories, []);
  writeCsv(path.join(NORMALIZED_DIR, "services.csv"), CSV_HEADERS.services, history.services);
  writeCsv(path.join(NORMALIZED_DIR, "customers.csv"), CSV_HEADERS.customers, history.customers);
  writeCsv(path.join(NORMALIZED_DIR, "visits.csv"), CSV_HEADERS.visits, history.visits);
  writeCsv(path.join(NORMALIZED_DIR, "visit_services.csv"), CSV_HEADERS.visit_services, history.visitServices);
  writeCsv(path.join(NORMALIZED_DIR, "visit_notes.csv"), CSV_HEADERS.visit_notes, history.visitNotes);

  const manifest = writeReports({
    salons,
    users,
    staff: history.staff,
    services: history.services,
    customers: history.customers,
    visits: history.visits,
    visitServices: history.visitServices,
    visitNotes: history.visitNotes,
    rejected: history.rejected,
    sourceMapping,
    sourceInventoryRows,
    duplicateCandidates,
    validation,
  });

  console.log(JSON.stringify({
    status: "partial",
    production_write_enabled: false,
    normalized_dir: path.relative(ROOT, NORMALIZED_DIR),
    reports_dir: path.relative(ROOT, REPORTS_DIR),
    totals: {
      salons: manifest.total_salons,
      proposed_users: manifest.total_proposed_users,
      staff: manifest.total_staff,
      services: manifest.total_services,
      customers: manifest.total_customers,
      visits: manifest.total_visits,
      visit_services: manifest.total_visit_services,
      rejected_rows: manifest.records_rejected,
    },
  }, null, 2));
}

main();
