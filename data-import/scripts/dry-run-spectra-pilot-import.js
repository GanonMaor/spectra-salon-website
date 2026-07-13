#!/usr/bin/env node
"use strict";

const path = require("path");
const fs = require("fs");
const { validate } = require("./validate-spectra-pilot-data");

const ROOT = path.resolve(__dirname, "../..");
const APPROVAL_FILE = path.join(ROOT, "data-import/approvals/import-approval.csv");
const ALLOWED_MODES = new Set(["salon_only", "salon_and_configuration", "full_history"]);

function parseArgs(argv) {
  const args = {
    input: path.join(ROOT, "data-import/normalized"),
    dryRun: true,
    yes: false,
    mode: "salon_only",
    salonId: "",
  };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--input") args.input = path.resolve(argv[++i]);
    else if (argv[i] === "--dry-run") args.dryRun = true;
    else if (argv[i] === "--yes") args.yes = true;
    else if (argv[i] === "--write") args.dryRun = false;
    else if (argv[i] === "--mode") args.mode = argv[++i];
    else if (argv[i] === "--salon-id") args.salonId = argv[++i];
  }

  return args;
}

function approvalSummary() {
  if (!fs.existsSync(APPROVAL_FILE)) {
    return { approval_file_exists: false, approved_rows: 0, approval_file: APPROVAL_FILE };
  }

  const lines = fs.readFileSync(APPROVAL_FILE, "utf8").split(/\r?\n/).filter(Boolean);
  const headers = (lines[0] || "").split(",");
  const modeIdx = headers.indexOf("approved_import_mode");
  const ownerIdx = headers.indexOf("owner_identity_approved");
  const approvedRows = lines.slice(1).filter((line) => {
    const cells = line.split(",");
    return ALLOWED_MODES.has(cells[modeIdx]) && cells[ownerIdx] === "true";
  }).length;

  return { approval_file_exists: true, approved_rows: approvedRows, approval_file: APPROVAL_FILE };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const batchId = process.env.CONFIRM_IMPORT_SPECTRA_PILOT || "";
  const approval = approvalSummary();

  if (!ALLOWED_MODES.has(args.mode)) {
    console.error(JSON.stringify({
      status: "blocked",
      reason: "Unsupported import mode.",
      allowed_modes: [...ALLOWED_MODES],
      received_mode: args.mode,
      production_write_enabled: false,
    }, null, 2));
    process.exit(2);
  }

  if (!args.dryRun) {
    console.error(JSON.stringify({
      status: "blocked",
      reason: "Production write mode is intentionally not implemented for this task.",
      required_for_future_write_mode: [
        "--yes",
        "CONFIRM_IMPORT_SPECTRA_PILOT=<batch-id>",
        "data-import/approvals/import-approval.csv with one approved row per salon",
        "separate explicit approval",
      ],
      received: { yes: args.yes, has_confirm_env: Boolean(batchId) },
      requested_mode: args.mode,
      approval,
    }, null, 2));
    process.exit(2);
  }

  const validation = validate(args.input);
  const dryRunReport = {
    status: validation.status === "blocked" ? "blocked" : "pass",
    mode: "dry_run_only",
    requested_import_mode: args.mode,
    requested_salon_id: args.salonId,
    production_write_enabled: false,
    approval,
    future_write_guard: "disabled; would require explicit per-salon approval and a separately implemented writer",
    input_dir: args.input,
    validation_status: validation.status,
    estimated_rows_to_insert: validation.estimated_actions.insert,
    estimated_rows_to_update: validation.estimated_actions.update,
    estimated_rows_to_skip: validation.estimated_actions.skip,
    estimated_rows_to_reject: validation.estimated_actions.reject,
    error_count: validation.errors.length,
    warning_count: validation.warnings.length,
    errors: validation.errors,
    warnings: validation.warnings,
  };

  console.log(JSON.stringify(dryRunReport, null, 2));
  if (validation.errors.length > 0) process.exitCode = 1;
}

main();
