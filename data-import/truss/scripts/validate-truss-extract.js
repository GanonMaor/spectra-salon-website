#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { validateRecords } = require("../lib/validate");
const { matchSeedToPdf } = require("../lib/match-seed");

const TRUSS_ROOT = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../../..");
const EXTRACTED = path.join(TRUSS_ROOT, "normalized/extracted-records.json");
const SEED = fs.existsSync(path.join(ROOT, "data/catalog-brands/truss-professional.legacy-seed-47.json"))
  ? path.join(ROOT, "data/catalog-brands/truss-professional.legacy-seed-47.json")
  : path.join(ROOT, "data/catalog-brands/truss-professional.json");

function main() {
  const records = JSON.parse(fs.readFileSync(EXTRACTED, "utf8"));
  const report = validateRecords(records);
  fs.writeFileSync(
    path.join(TRUSS_ROOT, "normalized/extracted-records.json"),
    JSON.stringify(records, null, 2),
  );

  let seedMatch = null;
  if (fs.existsSync(SEED)) {
    const seedProducts = JSON.parse(fs.readFileSync(SEED, "utf8"));
    seedMatch = matchSeedToPdf(records, seedProducts);
    fs.writeFileSync(
      path.join(TRUSS_ROOT, "reports/seed-47-match-report.json"),
      JSON.stringify(seedMatch, null, 2),
    );
    fs.writeFileSync(
      path.join(ROOT, "reports/truss-catalog/seed-47-match-report.json"),
      JSON.stringify(seedMatch, null, 2),
    );
    fs.writeFileSync(
      path.join(TRUSS_ROOT, "normalized/extracted-records.json"),
      JSON.stringify(records, null, 2),
    );
  }

  const out = {
    generated_at: new Date().toISOString(),
    ...report,
    seed_match: seedMatch
      ? {
          total_seed: seedMatch.total_seed,
          matched: seedMatch.matched,
          needs_review: seedMatch.needs_review,
        }
      : null,
  };

  fs.writeFileSync(
    path.join(TRUSS_ROOT, "reports/validation-report.json"),
    JSON.stringify(out, null, 2),
  );
  fs.writeFileSync(
    path.join(ROOT, "reports/truss-catalog/validation-report.json"),
    JSON.stringify(out, null, 2),
  );

  console.log(JSON.stringify({
    total: out.total,
    approved_eligible: out.approved_eligible,
    needs_review: out.needs_review,
    duplicate_ean: out.issues.duplicate_ean.length,
    duplicate_trs: out.issues.duplicate_trs.length,
    invalid_ean: out.issues.invalid_ean.length,
    missing_ean: out.issues.missing_ean.length,
    qr_failed: out.issues.qr_decode_failed.length,
    seed_matched: seedMatch ? seedMatch.matched : null,
    seed_needs_review: seedMatch ? seedMatch.needs_review : null,
  }, null, 2));
}

main();
