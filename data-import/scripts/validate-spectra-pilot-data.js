#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const DEFAULT_INPUT = path.join(ROOT, "data-import/normalized");

const EXPECTED_HEADERS = {
  "salons.csv": [
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
  "salon_users.csv": [
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
  "staff.csv": [
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
  "service_categories.csv": [
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
  "services.csv": [
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
  "customers.csv": [
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
  "visits.csv": [
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
  "visit_services.csv": [
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
  "visit_notes.csv": [
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

function parseArgs(argv) {
  const args = { input: DEFAULT_INPUT };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--input") args.input = path.resolve(argv[++i]);
  }
  return args;
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

function readCsv(filePath) {
  const rows = parseCsv(fs.readFileSync(filePath, "utf8"));
  const headers = rows[0] || [];
  return {
    headers,
    rows: rows.slice(1).map((row) => Object.fromEntries(headers.map((header, index) => [header, row[index] || ""]))),
  };
}

function addError(report, code, message, context = {}) {
  report.errors.push({ code, message, context });
}

function addWarning(report, code, message, context = {}) {
  report.warnings.push({ code, message, context });
}

function assertNoDuplicateIds(report, rows, field, label) {
  const seen = new Map();
  for (const row of rows) {
    const id = row[field];
    if (!id) continue;
    if (seen.has(id)) {
      addError(report, "DUPLICATE_PROPOSED_ID", `${label} has duplicate ${field}`, { id });
    } else {
      seen.set(id, true);
    }
  }
}

function validate(inputDir = DEFAULT_INPUT) {
  const report = {
    input_dir: inputDir,
    production_write_enabled: false,
    files: {},
    totals: {},
    estimated_actions: {
      insert: {},
      update: {},
      skip: {},
      reject: {},
    },
    errors: [],
    warnings: [],
  };

  const loaded = {};
  for (const [fileName, expectedHeaders] of Object.entries(EXPECTED_HEADERS)) {
    const filePath = path.join(inputDir, fileName);
    if (!fs.existsSync(filePath)) {
      addError(report, "MISSING_FILE", "Required normalized file is missing", { fileName });
      continue;
    }

    const parsed = readCsv(filePath);
    loaded[fileName] = parsed.rows;
    report.files[fileName] = { row_count: parsed.rows.length };
    report.totals[fileName.replace(".csv", "")] = parsed.rows.length;
    report.estimated_actions.insert[fileName.replace(".csv", "")] = parsed.rows.length;
    report.estimated_actions.update[fileName.replace(".csv", "")] = 0;
    report.estimated_actions.skip[fileName.replace(".csv", "")] = 0;
    report.estimated_actions.reject[fileName.replace(".csv", "")] = 0;

    if (parsed.headers.join("|") !== expectedHeaders.join("|")) {
      addError(report, "HEADER_MISMATCH", "CSV header does not match schema", {
        fileName,
        expected: expectedHeaders,
        actual: parsed.headers,
      });
    }
  }

  const salons = loaded["salons.csv"] || [];
  const users = loaded["salon_users.csv"] || [];
  const staff = loaded["staff.csv"] || [];
  const services = loaded["services.csv"] || [];
  const customers = loaded["customers.csv"] || [];
  const visits = loaded["visits.csv"] || [];
  const visitServices = loaded["visit_services.csv"] || [];
  const visitNotes = loaded["visit_notes.csv"] || [];

  const salonIds = new Set(salons.map((row) => row.proposed_salon_id).filter(Boolean));
  const staffTenant = new Map(staff.map((row) => [row.proposed_staff_id, row.proposed_salon_id]));
  const customerTenant = new Map(customers.map((row) => [row.proposed_customer_id, row.proposed_salon_id]));
  const serviceTenant = new Map(services.map((row) => [row.proposed_service_id, row.proposed_salon_id]));
  const visitTenant = new Map(visits.map((row) => [row.proposed_visit_id, row.proposed_salon_id]));
  const visitCustomer = new Map(visits.map((row) => [row.proposed_visit_id, row.proposed_customer_id]));

  for (const [label, rows, idField] of [
    ["salons", salons, "proposed_salon_id"],
    ["salon_users", users, "proposed_user_id"],
    ["staff", staff, "proposed_staff_id"],
    ["services", services, "proposed_service_id"],
    ["customers", customers, "proposed_customer_id"],
    ["visits", visits, "proposed_visit_id"],
    ["visit_services", visitServices, "proposed_visit_service_id"],
  ]) {
    assertNoDuplicateIds(report, rows, idField, label);
  }

  for (const [label, rows] of [
    ["salon_users", users],
    ["staff", staff],
    ["services", services],
    ["customers", customers],
    ["visits", visits],
    ["visit_services", visitServices],
    ["visit_notes", visitNotes],
  ]) {
    for (const row of rows) {
      if (!row.proposed_salon_id || !salonIds.has(row.proposed_salon_id)) {
        addError(report, "INVALID_SALON_REFERENCE", `${label} row references an unknown salon`, {
          label,
          proposed_salon_id: row.proposed_salon_id,
        });
      }
    }
  }

  for (const row of visits) {
    const customerSalon = customerTenant.get(row.proposed_customer_id);
    if (!customerSalon) {
      addError(report, "INVALID_VISIT_CUSTOMER_REFERENCE", "Visit references an unknown customer", {
        proposed_visit_id: row.proposed_visit_id,
      });
    } else if (customerSalon !== row.proposed_salon_id) {
      addError(report, "CROSS_TENANT_CUSTOMER_LINK", "Visit customer belongs to a different salon", {
        proposed_visit_id: row.proposed_visit_id,
      });
    }

    if (row.proposed_staff_id) {
      const staffSalon = staffTenant.get(row.proposed_staff_id);
      if (!staffSalon) addWarning(report, "UNRESOLVED_STAFF_REFERENCE", "Visit has unresolved staff reference", { proposed_visit_id: row.proposed_visit_id });
      else if (staffSalon !== row.proposed_salon_id) addError(report, "CROSS_TENANT_STAFF_LINK", "Visit staff belongs to a different salon", { proposed_visit_id: row.proposed_visit_id });
    }

    if (!["historical", "completed", "cancelled", "no_show", "unknown"].includes(row.operational_status)) {
      addError(report, "UNSUPPORTED_OPERATIONAL_STATUS", "Visit has unsupported operational_status", {
        proposed_visit_id: row.proposed_visit_id,
        operational_status: row.operational_status,
      });
    }

    if (!["exact_datetime", "date_only", "unknown"].includes(row.time_precision)) {
      addError(report, "UNSUPPORTED_TIME_PRECISION", "Visit has unsupported time_precision", {
        proposed_visit_id: row.proposed_visit_id,
        time_precision: row.time_precision,
      });
    }

    if (!["confirmed", "estimated", "absent"].includes(row.financial_data_confidence)) {
      addError(report, "UNSUPPORTED_FINANCIAL_CONFIDENCE", "Visit has unsupported financial_data_confidence", {
        proposed_visit_id: row.proposed_visit_id,
        financial_data_confidence: row.financial_data_confidence,
      });
    }
  }

  for (const row of visitServices) {
    const visitSalon = visitTenant.get(row.proposed_visit_id);
    if (!visitSalon) {
      addError(report, "INVALID_VISIT_SERVICE_VISIT_REFERENCE", "Visit service references an unknown visit", {
        proposed_visit_service_id: row.proposed_visit_service_id,
      });
    } else if (visitSalon !== row.proposed_salon_id) {
      addError(report, "CROSS_TENANT_VISIT_LINK", "Visit service links to another salon's visit", {
        proposed_visit_service_id: row.proposed_visit_service_id,
      });
    }

    const customerSalon = customerTenant.get(row.proposed_customer_id);
    if (!customerSalon) {
      addError(report, "INVALID_VISIT_SERVICE_CUSTOMER_REFERENCE", "Visit service references an unknown customer", {
        proposed_visit_service_id: row.proposed_visit_service_id,
      });
    } else if (customerSalon !== row.proposed_salon_id) {
      addError(report, "CROSS_TENANT_VISIT_SERVICE_CUSTOMER_LINK", "Visit service links to another salon's customer", {
        proposed_visit_service_id: row.proposed_visit_service_id,
      });
    }

    const visitCustomerId = visitCustomer.get(row.proposed_visit_id);
    if (visitCustomerId && visitCustomerId !== row.proposed_customer_id) {
      addError(report, "VISIT_SERVICE_CUSTOMER_MISMATCH", "Visit service customer does not match visit customer", {
        proposed_visit_service_id: row.proposed_visit_service_id,
      });
    }

    if (row.proposed_service_id) {
      const serviceSalon = serviceTenant.get(row.proposed_service_id);
      if (!serviceSalon) addWarning(report, "UNRESOLVED_SERVICE_MAPPING", "Visit service has unresolved service mapping", { proposed_visit_service_id: row.proposed_visit_service_id });
      else if (serviceSalon !== row.proposed_salon_id) addError(report, "CROSS_TENANT_SERVICE_LINK", "Visit service links to another salon's service", { proposed_visit_service_id: row.proposed_visit_service_id });
    }
  }

  for (const row of visitNotes) {
    if (row.proposed_visit_id && !visitTenant.has(row.proposed_visit_id)) {
      addError(report, "INVALID_NOTE_VISIT_REFERENCE", "Visit note references an unknown visit", {
        proposed_visit_id: row.proposed_visit_id,
      });
    }
  }

  if (report.errors.length === 0) {
    report.status = report.warnings.length > 0 ? "pass_with_warnings" : "pass";
  } else {
    report.status = "blocked";
  }

  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = validate(args.input);
  console.log(JSON.stringify(report, null, 2));
  if (report.errors.length > 0) process.exitCode = 1;
}

if (require.main === module) main();

module.exports = { validate };
