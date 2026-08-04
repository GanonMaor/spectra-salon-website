#!/usr/bin/env node
/**
 * Full TRUSS pipeline orchestrator.
 *
 *   node data-import/truss/scripts/run-truss-pipeline.js
 *   node data-import/truss/scripts/run-truss-pipeline.js --skip-enrich
 *   node data-import/truss/scripts/run-truss-pipeline.js --with-import-dry-run
 */

"use strict";

const { spawnSync } = require("child_process");
const path = require("path");

const ROOT = path.resolve(__dirname, "../../..");
const scripts = path.join(ROOT, "data-import/truss/scripts");

function run(label, args) {
  console.log(`\n=== ${label} ===`);
  const res = spawnSync(process.execPath, args, { cwd: ROOT, stdio: "inherit" });
  if (res.status !== 0) {
    console.error(`${label} failed with code ${res.status}`);
    process.exit(res.status || 1);
  }
}

const skipEnrich = process.argv.includes("--skip-enrich");
const withImport = process.argv.includes("--with-import-dry-run");

run("extract", [path.join(scripts, "extract-truss-pdf.js"), "--skip-render"]);
run("validate", [path.join(scripts, "validate-truss-extract.js")]);
if (!skipEnrich) {
  run("enrich", [path.join(scripts, "enrich-truss-official.js")]);
  run("images", [path.join(scripts, "download-truss-images.js")]);
}
run("build", [path.join(scripts, "build-truss-catalog.js")]);
if (withImport) {
  run("import-dry-run", [path.join(scripts, "import-truss-catalog.js"), "--dry-run"]);
}

console.log("\nTRUSS pipeline complete.");
console.log("Rerun: npm run truss:pipeline");
console.log("Import dry-run: npm run truss:import");
console.log("Import apply: CONFIRM_TRUSS_CATALOG_IMPORT=true npm run truss:import:apply");
