#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const OUT = path.resolve(__dirname, "..");
const ROOT = path.resolve(__dirname, "../../..");
const checks = [];

function check(name, ok, detail) {
  checks.push({ name, ok: Boolean(ok), detail: detail || "" });
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(OUT, rel), "utf8"));
}

const catalog = readJson("catalog.json");
const manifest = readJson("asset-manifest.json");
const rules = readJson("mixing-rules.json");
const idMap = readJson("id-map.json");
const summary = readJson("export-summary.json");
const examples = {
  search: readJson("api-examples/search-majirel-level-5.json"),
  barcode: readJson("api-examples/barcode-multiple-matches.json"),
  none: readJson("api-examples/barcode-no-match.json"),
  majirel50: readJson("api-examples/product-majirel-5-0.json"),
  majirel901: readJson("api-examples/product-majirel-901s.json"),
  dia: readJson("api-examples/product-diactivator-1-8.json"),
  treatment: readJson("api-examples/product-igora-treatment.json"),
  lightener: readJson("api-examples/product-lightener.json"),
};

check("counts.brands", catalog.counts.brands === catalog.brands.length, String(catalog.brands.length));
check("counts.productLines", catalog.counts.productLines === catalog.productLines.length, String(catalog.productLines.length));
check("counts.products", catalog.counts.products === catalog.products.length, String(catalog.products.length));
check("summary matches catalog", summary.counts.products === catalog.products.length && summary.counts.productLines === catalog.productLines.length);
check("id map length", idMap.length === catalog.products.length);

const ids = new Set();
const sourceIds = new Set();
let dup = 0;
for (const product of catalog.products) {
  if (ids.has(product.id)) dup += 1;
  ids.add(product.id);
  if (sourceIds.has(product.source.productId)) dup += 1;
  sourceIds.add(product.source.productId);
}
check("unique export and source ids", dup === 0, `duplicates ${dup}`);

const brandIds = new Set(catalog.brands.map((brand) => brand.id));
const lineIds = new Set(catalog.productLines.map((line) => line.id));
const linesById = new Map(catalog.productLines.map((line) => [line.id, line]));
let badRef = 0;
for (const line of catalog.productLines) if (!brandIds.has(line.brandId)) badRef += 1;
for (const product of catalog.products) {
  if (!brandIds.has(product.brandId) || !lineIds.has(product.productLineId)) badRef += 1;
  const line = linesById.get(product.productLineId);
  if (!line || line.brandId !== product.brandId || line.sourceSeries !== product.productLine.source) badRef += 1;
}
check("brand and line references", badRef === 0, `bad ${badRef}`);

const sourceCache = new Map();
function sourceRows(file) {
  if (!sourceCache.has(file)) {
    const rows = JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
    sourceCache.set(file, new Map(rows.map((row) => [row.id, row])));
  }
  return sourceCache.get(file);
}

let missingSource = 0;
let fieldMismatch = 0;
let badLevel = 0;
let familyFilled = 0;
let costFilled = 0;
let baseFilled = 0;
let barcodeNotString = 0;
for (const product of catalog.products) {
  const row = sourceRows(product.source.file).get(product.source.productId);
  if (!row) {
    missingSource += 1;
    continue;
  }
  const barcodes = (row.barcodes || []).map(String);
  if (
    row.shade !== product.shadeCode ||
    row.series !== product.productLine.source ||
    row.brand !== product.brand.source ||
    row.type !== product.productType ||
    row.flag !== product.sourceFlag ||
    JSON.stringify(barcodes) !== JSON.stringify(product.barcodes) ||
    row.materialWeight !== product.package.materialWeight.value ||
    (row.packingWeight ?? null) !== product.package.packingWeight.value ||
    row.price !== product.price.amount
  ) {
    fieldMismatch += 1;
  }
  const levelMatch = String(row.familyShade || "").trim().match(/^LEVEL\s+(\d+)$/i);
  if (levelMatch) {
    if (!product.shadeLevel || product.shadeLevel.numeric !== Number(levelMatch[1])) badLevel += 1;
  } else if (product.shadeLevel) {
    badLevel += 1;
  }
  if (product.shadeFamilies.length) familyFilled += 1;
  if (product.costPerGram != null) costFilled += 1;
  if (product.countsTowardDeveloperTarget != null) baseFilled += 1;
  if (product.barcodes.some((barcode) => typeof barcode !== "string")) barcodeNotString += 1;
}
check("every product exists in source", missingSource === 0, `missing ${missingSource}`);
check("shade, series, barcodes, weights, price, flag match source", fieldMismatch === 0, `mismatches ${fieldMismatch}`);
check("shade level only from LEVEL label", badLevel === 0, `bad ${badLevel}`);
check("no tonal families invented", familyFilled === 0);
check("no cost per gram", costFilled === 0);
check("developer base left unknown", baseFilled === 0);
check("barcodes are strings", barcodeNotString === 0);

const p901 = catalog.products.find((product) => product.shadeCode === "901S" && product.productLine.source === "MAJIREL");
const p50 = catalog.products.find((product) => product.source.productId === "ff1264f7-f6e5-11ec-9cb4-6045bd925463");
const dia = catalog.products.find((product) => product.source.productId === "2b593fb9-12aa-11ed-9cb4-6045bd925463");
const half = catalog.products.find((product) => product.shadeCode === "10 1/2.1");
check("901S has no numeric level", p901 && p901.shadeLevel == null && p901.shadeCode === "901S");
check("Majirel 5.0 level is the LEVEL 5 label", p50 && p50.shadeLevel && p50.shadeLevel.numeric === 5);
check("Diactivator keeps 1.8 and 6", dia && dia.developerStrength.percent === 1.8 && dia.developerStrength.volume === 6);
check("half-step code keeps LEVEL bucket and the original shade", half && half.shadeCode === "10 1/2.1" && half.shadeLevel && half.shadeLevel.numeric === 10);
check("treatment rows kept", catalog.products.filter((product) => product.productType === "treatment").length === 2);
check("bleach rows kept", catalog.products.filter((product) => product.productType === "bleach").length === 5);

const included = manifest.assets.filter((asset) => asset.included);
let missingFiles = 0;
for (const asset of included) {
  if (!asset.localAsset || !fs.existsSync(path.join(OUT, asset.localAsset))) missingFiles += 1;
}
const uniqueAssets = new Set(included.map((asset) => asset.localAsset));
check(
  "included image files exist",
  missingFiles === 0 && uniqueAssets.size === catalog.counts.localImages,
  `products ${included.length}, files ${uniqueAssets.size}`,
);
check("manifest covers every product", manifest.assets.length === catalog.products.length);
check("placeholder asset note exists", fs.existsSync(path.join(OUT, "assets/NO_LOCAL_ASSETS.txt")));

const ruleIds = new Set();
let badRules = 0;
for (const rule of rules.rules) {
  if (ruleIds.has(rule.id)) badRules += 1;
  ruleIds.add(rule.id);
  if (!rule.enforcement || !Array.isArray(rule.sources) || rule.sources.length === 0) badRules += 1;
  if (rule.topic === "mix_ratio" && rule.ratio != null) badRules += 1;
}
check("mixing rules have source and no invented ratio", badRules === 0, `rules ${rules.rules.length}`);

function productById(id) {
  return catalog.products.find((product) => product.id === id);
}
check("search example ids exist and match the filter", examples.search.response.products.every((card) => {
  const product = productById(card.id);
  return product && product.productLine.source === "MAJIREL" && product.productType === "color" && product.shadeLevel && product.shadeLevel.numeric === 5;
}) && examples.search.response.total === catalog.products.filter((product) => product.productLine.source === "MAJIREL" && product.productType === "color" && product.shadeLevel && product.shadeLevel.numeric === 5 && product.brandId === "brand:l-oreal-professionnel").length);

const barcode = examples.barcode.response.barcode;
const barcodeHits = catalog.products.filter((product) => product.barcodes.includes(barcode));
check("barcode example lists every exact match", examples.barcode.response.matchCount === barcodeHits.length && examples.barcode.response.matchCount > 1);
check("unknown barcode example is absent", examples.none.response.matchCount === 0 && !catalog.products.some((product) => product.barcodes.includes("0000000000000")));
check("example products are the cited rows",
  examples.majirel50.response.source.productId === "ff1264f7-f6e5-11ec-9cb4-6045bd925463" &&
  examples.majirel901.response.shadeCode === "901S" &&
  examples.dia.response.developerStrength.volume === 6 &&
  examples.treatment.response.productType === "treatment" &&
  examples.lightener.response.productType === "bleach");

const readme = fs.readFileSync(path.join(OUT, "README_HE.md"), "utf8");
const quality = fs.readFileSync(path.join(OUT, "data-quality-report.md"), "utf8");
check("README states the product count", readme.includes(String(catalog.counts.products)) && readme.includes(String(catalog.counts.productLines)));
check("quality report states the product count", quality.includes(`מוצרים: ${catalog.products.length}`));
check("proposed API is marked proposed", fs.readFileSync(path.join(OUT, "api-contract.yaml"), "utf8").includes("x-contract-status: proposed"));

const XLSX = require(path.join(ROOT, "node_modules/xlsx"));
const workbook = XLSX.readFile(path.join(ROOT, "data/products_1781528628322.xlsx"));
const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: null, raw: false });
const xlsxRow = sheet.find((row) => row.productId === "ff1264f7-f6e5-11ec-9cb4-6045bd925463");
check("spreadsheet spot check for Majirel 5.0", xlsxRow && xlsxRow.shade === "5.0" && xlsxRow.series === "MAJIREL" && xlsxRow.familyShade === "LEVEL 5");

const failed = checks.filter((item) => !item.ok);
const lines = [
  "# דוח ולידציה",
  "",
  `נבדקו ${checks.length} בדיקות. עברו ${checks.length - failed.length}. נכשלו ${failed.length}.`,
  "",
  `מוצרים בקובץ: ${catalog.products.length}. סדרות: ${catalog.productLines.length}. מותגים: ${catalog.brands.length}. תמונות מקומיות: ${catalog.counts.localImages}.`,
  "",
];
for (const item of checks) {
  lines.push(`- ${item.ok ? "עבר" : "נכשל"}: ${item.name}${item.detail ? ` (${item.detail})` : ""}`);
}
lines.push("");
fs.writeFileSync(path.join(OUT, "validation-report.md"), lines.join("\n"), "utf8");
console.log(lines.join("\n"));
if (failed.length) process.exit(1);
