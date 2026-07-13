#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const NORMALIZED_DIR = path.join(ROOT, "data-import/normalized");
const REPORTS_DIR = path.join(ROOT, "data-import/reports");
const APPROVALS_DIR = path.join(ROOT, "data-import/approvals");
const ADMIN_SNAPSHOT = path.join(ROOT, "src/data/admin-current-users-snapshot.json");

const POL_SOURCE_TO_ADMIN_NAME = {
  "Avi Poladi": "אבי פולדי",
  "Inon Yosef": "ינון יוסף",
  "Itzik Kirma": "איציק קירמה",
  "Sharon Mor": "שרון מור",
  "Yakir Cohen": "יקיר כהן - ספר על הבר",
  "שחר מלכה": "שחר מלכה - Hair Story",
};

function ensureDirs() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  fs.mkdirSync(APPROVALS_DIR, { recursive: true });
}

function readJson(filePath, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else if (char !== "\r") {
      cell += char;
    }
  }

  if (cell || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((item) => item.length > 1 || item[0] !== "");
}

function readCsv(fileName) {
  const filePath = path.join(NORMALIZED_DIR, fileName);
  const parsed = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = parsed[0] || [];
  return parsed.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function csvValue(value) {
  if (value === null || value === undefined) return "";
  const text = Array.isArray(value) ? value.join("; ") : String(value);
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function writeCsv(filePath, headers, rows) {
  const lines = [headers.join(",")];
  for (const row of rows) lines.push(headers.map((header) => csvValue(row[header])).join(","));
  fs.writeFileSync(filePath, `${lines.join("\n")}\n`, "utf8");
}

function normalizePhoneToE164(raw) {
  if (raw === null || raw === undefined || raw === "") return "";
  const digits = String(raw).replace(/[^\d]/g, "");
  if (/^9725\d{8}$/.test(digits)) return `+${digits}`;
  if (/^05\d{8}$/.test(digits)) return `+972${digits.slice(1)}`;
  if (/^5\d{8}$/.test(digits)) return `+972${digits}`;
  if (/^972[23489]\d{7,8}$/.test(digits)) return `+${digits}`;
  if (/^0[23489]\d{7,8}$/.test(digits)) return `+972${digits.slice(1)}`;
  if (/^1[78]00\d{6,7}$/.test(digits)) return `+972${digits}`;
  return "";
}

function maskPhone(phone) {
  if (!phone) return "";
  return `${phone.slice(0, 5)}***${phone.slice(-3)}`;
}

function maskEmail(email) {
  if (!email || !email.includes("@")) return "";
  const [name, domain] = email.split("@");
  return `${name.slice(0, 1)}***@${domain}`;
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
  return String(value || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function canonicalSalonName(value) {
  return POL_SOURCE_TO_ADMIN_NAME[value] || value || "";
}

function groupBy(rows, keyFn) {
  const map = new Map();
  for (const row of rows) {
    const key = keyFn(row);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(row);
  }
  return map;
}

function buildSalonCountReconciliation(salons) {
  const adminRows = readJson(ADMIN_SNAPSHOT, []);
  const byPhone = new Map(salons.map((salon) => [salon.salon_phone_normalized, salon]));

  const rows = adminRows.map((record, index) => {
    const phone = normalizePhoneToE164(record.phone_number);
    const active = activeAgeInDays(record.last_mix_date) <= 60;
    const mapped = phone ? byPhone.get(phone) : null;
    let status = "skipped_inactive";
    let reason = "last_mix_date is older than the two-month active window or missing";

    if (mapped) {
      status = "mapped";
      reason = "";
    } else if (active && !phone) {
      status = "skipped_lacked_usable_identity";
      reason = "active record but phone is missing, invalid, or not an Israeli phone format";
    } else if (active && phone) {
      status = "skipped_unmapped";
      reason = "active record had a normalized phone but was not present in normalized salons";
    }

    return {
      source_record_id: String(index + 1),
      source_salon_name: record.salon_name || "",
      source_phone_masked: maskPhone(phone),
      normalized_salon_id: mapped?.proposed_salon_id || "",
      normalized_salon_name: mapped?.salon_name || "",
      mapping_status: status,
      exclusion_or_merge_reason: reason,
      source_file: "src/data/admin-current-users-snapshot.json",
      source_row: String(index + 1),
    };
  });

  writeCsv(path.join(REPORTS_DIR, "salon-count-reconciliation.csv"), [
    "source_record_id",
    "source_salon_name",
    "source_phone_masked",
    "normalized_salon_id",
    "normalized_salon_name",
    "mapping_status",
    "exclusion_or_merge_reason",
    "source_file",
    "source_row",
  ], rows);

  return {
    original_source_count: adminRows.length,
    active_with_usable_israeli_identity: rows.filter((row) => row.mapping_status === "mapped").length,
    mapped: rows.filter((row) => row.mapping_status === "mapped").length,
    skipped_inactive: rows.filter((row) => row.mapping_status === "skipped_inactive").length,
    skipped_lacked_usable_identity: rows.filter((row) => row.mapping_status === "skipped_lacked_usable_identity").length,
    skipped_unmapped: rows.filter((row) => row.mapping_status === "skipped_unmapped").length,
  };
}

function buildRejectedSummary(rejectedRows, historySalonIds) {
  const countBy = (field) => {
    const out = {};
    for (const row of rejectedRows) out[row[field] || "unknown"] = (out[row[field] || "unknown"] || 0) + 1;
    return out;
  };

  const recommendations = {};
  for (const row of rejectedRows) {
    const reason = row.rejection_reason || "unknown";
    if (!recommendations[reason]) {
      recommendations[reason] = {
        rejection_reason: reason,
        recoverable: row.recoverable || "yes",
        recommended_remediation: row.suggested_action || "Review source row and repair mapping before import.",
      };
    }
  }

  const bySalonImpact = {};
  for (const row of rejectedRows) {
    const salon = row.salon || "unknown";
    if (!bySalonImpact[salon]) {
      bySalonImpact[salon] = {
        count: 0,
        affects_history_salon: true,
        breaks_customer_to_visit_linkage: 0,
        breaks_visit_to_service_linkage: 0,
      };
    }
    bySalonImpact[salon].count += 1;
    if ((row.rejection_reason || "").includes("client")) bySalonImpact[salon].breaks_customer_to_visit_linkage += 1;
    if (row.entity_type === "visit_service") bySalonImpact[salon].breaks_visit_to_service_linkage += 1;
  }

  return {
    generated_at: new Date().toISOString(),
    total_rejected_rows: rejectedRows.length,
    count_by_entity_type: countBy("entity_type"),
    count_by_salon: countBy("salon"),
    count_by_rejection_reason: countBy("rejection_reason"),
    by_salon_impact: bySalonImpact,
    affects_one_of_six_history_salons: rejectedRows.length > 0 && historySalonIds.length > 0,
    recommended_remediation_by_reason: Object.values(recommendations),
    import_readiness_note: "No full-history import should proceed for a salon until rejected rows for that salon are reviewed for relationship impact.",
  };
}

function buildDuplicateSeverityReport({ salons, salonUsers, customers, services, visits, visitServices }) {
  const rows = [];
  const salonById = new Map(salons.map((salon) => [salon.proposed_salon_id, salon]));
  const visitById = new Map(visits.map((visit) => [visit.proposed_visit_id, visit]));

  function add(row) {
    rows.push({
      proposed_salon_id: row.proposed_salon_id || "",
      salon_name: salonById.get(row.proposed_salon_id)?.salon_name || "",
      entity_type: row.entity_type,
      duplicate_type: row.duplicate_type,
      severity: row.severity,
      candidate_key: row.candidate_key,
      candidate_count: String(row.candidate_count),
      affected_record_ids: row.affected_record_ids,
      recommended_action: row.recommended_action,
      notes: row.notes || "",
    });
  }

  for (const [phone, grouped] of groupBy(salonUsers, (row) => row.phone_normalized || "").entries()) {
    if (!phone || grouped.length <= 1) continue;
    add({
      proposed_salon_id: "",
      entity_type: "salon_user",
      duplicate_type: "cross_salon_same_phone",
      severity: "must_not_merge",
      candidate_key: maskPhone(phone),
      candidate_count: grouped.length,
      affected_record_ids: grouped.map((row) => row.proposed_user_id).join(";"),
      recommended_action: "Informational only; never merge across salons.",
    });
  }

  for (const [key, grouped] of groupBy(customers, (row) => `${row.proposed_salon_id}:${row.phone_normalized}:${normalizeName(row.full_name)}`).entries()) {
    if (!key.includes(":+") || grouped.length <= 1) continue;
    add({
      proposed_salon_id: grouped[0].proposed_salon_id,
      entity_type: "customer",
      duplicate_type: "same_salon_same_phone_same_name",
      severity: "data_operator_review",
      candidate_key: key.replace(/\+972\d+/, "[masked-phone]"),
      candidate_count: grouped.length,
      affected_record_ids: grouped.map((row) => row.proposed_customer_id).join(";"),
      recommended_action: "Review source records; preserve originals unless identity is certain.",
    });
  }

  for (const [key, grouped] of groupBy(customers, (row) => `${row.proposed_salon_id}:${normalizeName(row.full_name)}`).entries()) {
    if (grouped.length <= 1) continue;
    add({
      proposed_salon_id: grouped[0].proposed_salon_id,
      entity_type: "customer",
      duplicate_type: grouped.every((row) => !row.phone_normalized) ? "same_salon_same_name_no_phone" : "same_salon_similar_name",
      severity: "founder_review",
      candidate_key: key,
      candidate_count: grouped.length,
      affected_record_ids: grouped.map((row) => row.proposed_customer_id).join(";"),
      recommended_action: "Do not merge automatically; customer identity is ambiguous.",
    });
  }

  for (const [key, grouped] of groupBy(services, (row) => `${row.proposed_salon_id}:${row.service_name_normalized}`).entries()) {
    if (grouped.length <= 1) continue;
    add({
      proposed_salon_id: grouped[0].proposed_salon_id,
      entity_type: "service",
      duplicate_type: "duplicate_service_normalized_name",
      severity: "data_operator_review",
      candidate_key: key,
      candidate_count: grouped.length,
      affected_record_ids: grouped.map((row) => row.proposed_service_id).join(";"),
      recommended_action: "Review service mapping inside the salon only; preserve original service text.",
    });
  }

  for (const [key, grouped] of groupBy(visitServices, (row) => {
    const visit = visitById.get(row.proposed_visit_id);
    return `${row.proposed_salon_id}:${row.proposed_customer_id}:${visit?.visit_date || ""}:${row.proposed_service_id || row.service_name_original}`;
  }).entries()) {
    if (grouped.length <= 1) continue;
    const exactSameVisit = new Set(grouped.map((row) => row.proposed_visit_id)).size === 1;
    add({
      proposed_salon_id: grouped[0].proposed_salon_id,
      entity_type: "visit_service",
      duplicate_type: exactSameVisit ? "duplicate_visit_exact" : "duplicate_visit_possible",
      severity: exactSameVisit ? "data_operator_review" : "founder_review",
      candidate_key: key,
      candidate_count: grouped.length,
      affected_record_ids: grouped.map((row) => row.proposed_visit_service_id).join(";"),
      recommended_action: exactSameVisit
        ? "Review duplicate service lines on the same visit before import."
        : "Likely multiple same-day services or repeated visits; do not auto-merge.",
    });
  }

  writeCsv(path.join(REPORTS_DIR, "duplicate-severity-report.csv"), [
    "proposed_salon_id",
    "salon_name",
    "entity_type",
    "duplicate_type",
    "severity",
    "candidate_key",
    "candidate_count",
    "affected_record_ids",
    "recommended_action",
    "notes",
  ], rows);

  const summarize = (field) => {
    const out = {};
    for (const row of rows) out[row[field] || "unknown"] = (out[row[field] || "unknown"] || 0) + 1;
    return out;
  };

  return {
    total_candidates: rows.length,
    by_duplicate_type: summarize("duplicate_type"),
    by_severity: summarize("severity"),
    by_entity_type: summarize("entity_type"),
    by_salon: summarize("salon_name"),
  };
}

function buildFounderSalonReadiness({ salons, salonUsers, staff, services, customers, visits, visitServices, validation, rejectedRows, duplicateSummaryRows }) {
  const userBySalon = new Map(salonUsers.map((user) => [user.proposed_salon_id, user]));
  const counts = {
    staff: groupBy(staff, (row) => row.proposed_salon_id),
    services: groupBy(services, (row) => row.proposed_salon_id),
    customers: groupBy(customers, (row) => row.proposed_salon_id),
    visits: groupBy(visits, (row) => row.proposed_salon_id),
    visitServices: groupBy(visitServices, (row) => row.proposed_salon_id),
    rejected: groupBy(rejectedRows, (row) => row.salon || ""),
  };
  const validationBySalon = new Map(validation.salons.map((salon) => [salon.proposed_salon_id, salon]));
  const rejectedBySalonName = groupBy(rejectedRows, (row) => canonicalSalonName(row.salon || ""));
  const duplicateBySalonId = {};
  for (const row of duplicateSummaryRows) duplicateBySalonId[row.proposed_salon_id] = (duplicateBySalonId[row.proposed_salon_id] || 0) + 1;

  const rows = salons.map((salon) => {
    const user = userBySalon.get(salon.proposed_salon_id) || {};
    const validationRow = validationBySalon.get(salon.proposed_salon_id) || {};
      const rejectedCount = (rejectedBySalonName.get(salon.salon_name) || []).length;
    const history = Number(validationRow.customer_count || 0) > 0 || Number(validationRow.visit_count || 0) > 0;
    const blockingReasons = [];
    const warnings = [];

    if ((user.data_quality_status || "").includes("not_owner_verified")) blockingReasons.push("owner_identity_not_verified");
    if (!history) warnings.push("no_detailed_history_source");
    if (rejectedCount > 0) warnings.push("rejected_rows_require_review");
    if ((validationRow.invalid_telephone_count || 0) > 0) warnings.push("customer_phone_numbers_absent_or_invalid");

    let scope = "blocked";
    if (blockingReasons.length === 0 && history && rejectedCount === 0) scope = "full_history_candidate";
    else if (blockingReasons.length === 0 && !history) scope = "salon_only";
    else if (history) scope = "blocked";

    return {
      proposed_salon_id: salon.proposed_salon_id,
      salon_name: salon.salon_name,
      salon_phone_masked: maskPhone(salon.salon_phone_normalized),
      owner_identity_status: user.data_quality_status || "missing",
      proposed_owner_name: user.full_name || "",
      proposed_owner_phone_masked: maskPhone(user.phone_normalized || ""),
      proposed_owner_email_masked: maskEmail(user.email || ""),
      customer_count: validationRow.customer_count || 0,
      visit_count: validationRow.visit_count || 0,
      visit_service_count: validationRow.visit_service_count || 0,
      service_count: validationRow.service_count || 0,
      staff_candidate_count: (counts.staff.get(salon.proposed_salon_id) || []).length,
      invalid_phone_count: validationRow.invalid_telephone_count || 0,
      duplicate_customer_candidate_count: duplicateBySalonId[salon.proposed_salon_id] || 0,
      rejected_row_count: rejectedCount,
      earliest_visit_date: validationRow.visit_date_range?.earliest || "",
      latest_visit_date: validationRow.visit_date_range?.latest || "",
      history_source_available: history ? "true" : "false",
      history_source_name: history ? "pol-customer-usage" : "",
      readiness_status: validationRow.readiness_status || "needs_review",
      blocking_reasons: blockingReasons.join(";"),
      warnings: warnings.join(";"),
      recommended_import_scope: scope,
    };
  });

  writeCsv(path.join(REPORTS_DIR, "founder-salon-readiness.csv"), [
    "proposed_salon_id",
    "salon_name",
    "salon_phone_masked",
    "owner_identity_status",
    "proposed_owner_name",
    "proposed_owner_phone_masked",
    "proposed_owner_email_masked",
    "customer_count",
    "visit_count",
    "visit_service_count",
    "service_count",
    "staff_candidate_count",
    "invalid_phone_count",
    "duplicate_customer_candidate_count",
    "rejected_row_count",
    "earliest_visit_date",
    "latest_visit_date",
    "history_source_available",
    "history_source_name",
    "readiness_status",
    "blocking_reasons",
    "warnings",
    "recommended_import_scope",
  ], rows);

  return rows;
}

function buildSixSalonHistoryReview({ readinessRows, salons, salonUsers, staff, services, customers, visits, visitServices, rejectedRows }) {
  const salonById = new Map(salons.map((salon) => [salon.proposed_salon_id, salon]));
  const userBySalon = new Map(salonUsers.map((user) => [user.proposed_salon_id, user]));
  const staffBySalon = groupBy(staff, (row) => row.proposed_salon_id);
  const serviceBySalon = groupBy(services, (row) => row.proposed_salon_id);
  const customerBySalon = groupBy(customers, (row) => row.proposed_salon_id);
  const visitBySalon = groupBy(visits, (row) => row.proposed_salon_id);
  const visitServiceBySalon = groupBy(visitServices, (row) => row.proposed_salon_id);
  const rejectedBySalonName = groupBy(rejectedRows, (row) => canonicalSalonName(row.salon || ""));

  const review = readinessRows
    .filter((row) => row.history_source_available === "true")
    .map((row) => {
      const salon = salonById.get(row.proposed_salon_id);
      const user = userBySalon.get(row.proposed_salon_id) || {};
      const salonVisits = visitBySalon.get(row.proposed_salon_id) || [];
      const salonVisitServices = visitServiceBySalon.get(row.proposed_salon_id) || [];
      const salonCustomers = customerBySalon.get(row.proposed_salon_id) || [];
      const salonServices = serviceBySalon.get(row.proposed_salon_id) || [];
      const salonRejected = rejectedBySalonName.get(salon.salon_name) || [];
      const criticalBlockers = [];

      if ((user.data_quality_status || "").includes("not_owner_verified")) criticalBlockers.push("owner_identity_not_reviewed");
      if (salonRejected.length > 0) criticalBlockers.push("rejected_rows_require_review");

      return {
        salon_identity: {
          proposed_salon_id: salon.proposed_salon_id,
          external_salon_id: salon.external_salon_id,
          salon_name: salon.salon_name,
          salon_phone_masked: maskPhone(salon.salon_phone_normalized),
        },
        source_files: ["reports/pol-customer-usage/pol-customer-usage.raw.json"],
        owner_admin_identity_status: user.data_quality_status || "missing",
        customer_count: salonCustomers.length,
        customers_with_valid_phone: salonCustomers.filter((customer) => customer.phone_normalized).length,
        customers_without_phone: salonCustomers.filter((customer) => !customer.phone_normalized).length,
        duplicate_customer_candidates: Number(row.duplicate_customer_candidate_count) || 0,
        service_count: salonServices.length,
        unresolved_services: salonServices.filter((service) => (service.data_quality_status || "").includes("needs_review")).length,
        visit_count: salonVisits.length,
        visits_missing_customer: salonVisits.filter((visit) => !visit.proposed_customer_id).length,
        visits_missing_service: salonVisits.filter((visit) => !salonVisitServices.some((service) => service.proposed_visit_id === visit.proposed_visit_id)).length,
        visits_with_exact_datetime: salonVisits.filter((visit) => visit.time_precision === "exact_datetime").length,
        visits_with_date_only: salonVisits.filter((visit) => visit.time_precision === "date_only").length,
        financial_fields_available: salonVisits.some((visit) => visit.total_charged_cents || visit.total_paid_cents),
        staff_mappings: (staffBySalon.get(row.proposed_salon_id) || []).map((candidate) => ({
          proposed_staff_id: candidate.proposed_staff_id,
          full_name: candidate.full_name,
          status: candidate.data_quality_status,
        })),
        rejected_rows: salonRejected.length,
        critical_blockers: criticalBlockers,
        recommended_import_decision: criticalBlockers.length === 0 ? "full_history_candidate_after_founder_approval" : "blocked_until_review",
      };
    });

  fs.writeFileSync(path.join(REPORTS_DIR, "six-salon-history-review.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    salons: review,
  }, null, 2), "utf8");

  return review;
}

function buildOwnerIdentityReview(salons, salonUsers) {
  const usersBySalon = new Map(salonUsers.map((user) => [user.proposed_salon_id, user]));
  const phoneGroups = groupBy(salonUsers, (user) => user.phone_normalized || "");
  const rows = salons.map((salon) => {
    const user = usersBySalon.get(salon.proposed_salon_id) || {};
    const duplicate = user.phone_normalized && (phoneGroups.get(user.phone_normalized) || []).length > 1;
    return {
      proposed_salon_id: salon.proposed_salon_id,
      salon_name: salon.salon_name,
      salon_phone_original: salon.salon_phone_original,
      salon_phone_normalized: salon.salon_phone_normalized,
      candidate_owner_name: "",
      candidate_owner_phone_original: "",
      candidate_owner_phone_normalized: "",
      candidate_owner_email: "",
      identity_source: "not_provided; salon phone available only as login candidate",
      identity_confidence: "low",
      same_as_salon_phone: "",
      duplicate_login_identifier: duplicate ? "true" : "false",
      manual_review_required: "true",
      founder_decision: "",
      notes: "Do not assume salon phone is owner login. Founder must approve owner/admin identity before invite.",
    };
  });

  writeCsv(path.join(REPORTS_DIR, "owner-identity-review.csv"), [
    "proposed_salon_id",
    "salon_name",
    "salon_phone_original",
    "salon_phone_normalized",
    "candidate_owner_name",
    "candidate_owner_phone_original",
    "candidate_owner_phone_normalized",
    "candidate_owner_email",
    "identity_source",
    "identity_confidence",
    "same_as_salon_phone",
    "duplicate_login_identifier",
    "manual_review_required",
    "founder_decision",
    "notes",
  ], rows);

  return rows;
}

function writeApprovalTemplate(salons) {
  const rows = salons.map((salon) => ({
    proposed_salon_id: salon.proposed_salon_id,
    approved_import_mode: "",
    owner_identity_approved: "",
    duplicate_resolution_approved: "",
    service_mapping_approved: "",
    history_import_approved: "",
    approved_by: "",
    approved_at: "",
    notes: "",
  }));

  writeCsv(path.join(APPROVALS_DIR, "import-approval.csv"), [
    "proposed_salon_id",
    "approved_import_mode",
    "owner_identity_approved",
    "duplicate_resolution_approved",
    "service_mapping_approved",
    "history_import_approved",
    "approved_by",
    "approved_at",
    "notes",
  ], rows);
}

function writeImportModes() {
  fs.writeFileSync(path.join(REPORTS_DIR, "future-import-modes.json"), JSON.stringify({
    generated_at: new Date().toISOString(),
    production_write_enabled: false,
    approval_model: {
      required_file: "data-import/approvals/import-approval.csv",
      approval_scope: "one row per salon",
      global_approval_allowed: false,
      importer_refusal_rule: "refuse any write for a salon without an explicit approved row",
    },
    modes: {
      salon_only: {
        creates: ["salon", "approved owner/admin user", "membership", "settings"],
        does_not_create: ["staff", "services", "customers", "visits", "inventory stock"],
      },
      salon_and_configuration: {
        creates: ["salon", "approved owner/admin", "membership", "departments", "categories", "reviewed services", "optional enabled brands/product lines"],
        does_not_create: ["customer history", "visit history"],
      },
      full_history: {
        creates: ["salon and membership", "reviewed staff", "services", "customers", "visits", "visit-service relationships", "historical notes where safe"],
        requirements: ["enabled salon by salon", "reviewed owner/admin identity", "duplicate resolution approved", "service mapping approved", "history import approved"],
      },
    },
    historical_visit_semantics: {
      exact_datetime: "may become completed historical appointments when tenant-safe and explicitly marked historical",
      date_only_recommendation: "use a separate historical visit representation or add explicit date-only precision support before writing into calendar appointments",
      forbidden: ["do not fabricate time", "do not place date-only visits at midnight", "do not infer checkout/payment revenue"],
      required_fields: ["source=spectra_import", "is_historical_import=true", "time_precision", "financial_data_confidence", "source_record_id"],
      safest_model_recommendation: "Keep date-only rows out of the live appointment calendar until the schema supports date-only historical records; exact datetime rows can be appointment candidates after approval.",
    },
  }, null, 2), "utf8");
}

function main() {
  ensureDirs();
  const salons = readCsv("salons.csv");
  const salonUsers = readCsv("salon_users.csv");
  const staff = readCsv("staff.csv");
  const services = readCsv("services.csv");
  const customers = readCsv("customers.csv");
  const visits = readCsv("visits.csv");
  const visitServices = readCsv("visit_services.csv");
  const rejectedRows = parseCsv(fs.readFileSync(path.join(REPORTS_DIR, "rejected_rows.csv"), "utf8"));
  const rejectedHeaders = rejectedRows[0] || [];
  const rejected = rejectedRows.slice(1).map((row) => Object.fromEntries(rejectedHeaders.map((header, index) => [header, row[index] || ""])));
  const validation = readJson(path.join(REPORTS_DIR, "validation_report.json"), { salons: [] });

  const reconciliation = buildSalonCountReconciliation(salons);
  const duplicateSummary = buildDuplicateSeverityReport({ salons, salonUsers, customers, services, visits, visitServices });
  const duplicateRows = readCsvFromReport("duplicate-severity-report.csv");
  const readinessRows = buildFounderSalonReadiness({ salons, salonUsers, staff, services, customers, visits, visitServices, validation, rejectedRows: rejected, duplicateSummaryRows: duplicateRows });
  const sixSalonReview = buildSixSalonHistoryReview({ readinessRows, salons, salonUsers, staff, services, customers, visits, visitServices, rejectedRows: rejected });
  const ownerRows = buildOwnerIdentityReview(salons, salonUsers);
  const rejectedSummary = buildRejectedSummary(rejected, sixSalonReview.map((salon) => salon.salon_identity.proposed_salon_id));

  fs.writeFileSync(path.join(REPORTS_DIR, "rejected-rows-summary.json"), JSON.stringify(rejectedSummary, null, 2), "utf8");
  writeApprovalTemplate(salons);
  writeImportModes();

  console.log(JSON.stringify({
    status: "partial",
    production_write_enabled: false,
    reconciliation,
    readiness_counts: countField(readinessRows, "recommended_import_scope"),
    duplicate_summary: duplicateSummary,
    rejected_rows: rejectedSummary.total_rejected_rows,
    owner_identities_ready: ownerRows.filter((row) => row.manual_review_required !== "true").length,
    owner_identities_blocked: ownerRows.filter((row) => row.manual_review_required === "true").length,
  }, null, 2));
}

function readCsvFromReport(fileName) {
  const parsed = parseCsv(fs.readFileSync(path.join(REPORTS_DIR, fileName), "utf8"));
  const headers = parsed[0] || [];
  return parsed.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""])));
}

function countField(rows, field) {
  const out = {};
  for (const row of rows) out[row[field] || "unknown"] = (out[row[field] || "unknown"] || 0) + 1;
  return out;
}

main();
