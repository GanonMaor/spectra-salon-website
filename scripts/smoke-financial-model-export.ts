// Smoke test for the Strategic Forecast Excel export contract.
// Runs the live model with default assumptions and asserts that the
// FinancialModelBundle satisfies every invariant the .xlsx exporter
// relies on (72 month coverage, row shape, required emphasized rows).
//
// Run via:
//   npx esbuild --bundle --platform=node --format=esm \
//     scripts/smoke-financial-model-export.ts > .tmp-smoke.mjs && \
//     node .tmp-smoke.mjs && rm .tmp-smoke.mjs

import * as ExcelJSPkg from "exceljs";
import { writeFileSync, statSync, unlinkSync } from "node:fs";
import {
  buildDefaultStrategicAssumptions,
} from "../src/screens/StrategicForecast/strategic-forecast-model";
import { generateFinancialModel } from "../src/screens/StrategicForecast/financial-model-rows";
import { buildFinancialModelWorkbook } from "../src/screens/StrategicForecast/export-financial-model-xlsx";

const EXPECTED_MONTHS = 72;
const REQUIRED_EMPHASIZED = [
  "Ending subscribers",
  "Recurring revenue (MRR)",
  "Total revenue",
  "EBITDA",
  "Cash balance",
];

const errors: string[] = [];
function check(cond: unknown, msg: string): void {
  if (!cond) errors.push(msg);
}

const state = buildDefaultStrategicAssumptions();
const model = generateFinancialModel(state);

check(model.rows.length > 0, "model.rows is empty");
check(
  model.forecast.monthLabels.length >= EXPECTED_MONTHS,
  `expected ${EXPECTED_MONTHS} month labels, got ${model.forecast.monthLabels.length}`,
);

for (const row of model.rows) {
  check(
    Array.isArray(row.values) && row.values.length >= EXPECTED_MONTHS,
    `row "${row.metric}" has ${row.values?.length ?? 0} values; expected ≥ ${EXPECTED_MONTHS}`,
  );
}

const emphasized = new Set(model.rows.filter((r) => r.emphasize).map((r) => r.metric));
for (const required of REQUIRED_EMPHASIZED) {
  check(emphasized.has(required), `missing emphasized row "${required}"`);
}

const last = EXPECTED_MONTHS - 1;
const endingSubs = model.rows.find((r) => r.metric === "Ending subscribers");
const arrRow = model.rows.find((r) => r.metric === "ARR run-rate");
const ebitdaRow = model.rows.find((r) => r.metric === "EBITDA");
const cashRow = model.rows.find((r) => r.metric === "Cash balance");

check(!!endingSubs, "Ending subscribers row not found");
check(!!arrRow, "ARR run-rate row not found");
check(!!ebitdaRow, "EBITDA row not found");
check(!!cashRow, "Cash balance row not found");

if (endingSubs) {
  const finalSubs = endingSubs.values[last] ?? 0;
  check(
    Number.isFinite(finalSubs) && finalSubs > 0,
    `Year 6 ending subscribers should be > 0, got ${finalSubs}`,
  );
  // Default targets: [500, 2000, 6500, 18000, 26000, 33000]; final
  // year-end target is 33,000.
  const target = state.yearlySalonTargets[5] ?? 0;
  check(
    Math.abs(finalSubs - target) < 1,
    `Year 6 ending subscribers (${finalSubs}) should match target ${target}`,
  );
}

if (arrRow) {
  const finalArr = arrRow.values[last] ?? 0;
  check(
    Number.isFinite(finalArr) && finalArr > 0,
    `Year 6 ARR should be > 0, got ${finalArr}`,
  );
}

if (ebitdaRow) {
  const finalEbitda = ebitdaRow.values[last] ?? 0;
  check(Number.isFinite(finalEbitda), `Year 6 EBITDA must be finite, got ${finalEbitda}`);
}

if (cashRow) {
  const finalCash = cashRow.values[last] ?? 0;
  check(Number.isFinite(finalCash), `Year 6 Cash balance must be finite, got ${finalCash}`);
}

const summary = model.summary;
const summaryEnd = summary.endingSubscribers;
const rowEnd = endingSubs?.values[last] ?? 0;
check(
  Math.abs(summaryEnd - rowEnd) < 1,
  `summary.endingSubscribers (${summaryEnd}) does not match Ending subscribers row M72 (${rowEnd})`,
);

async function buildAndVerifyWorkbook(): Promise<void> {
  const ExcelJS =
    (ExcelJSPkg as { default?: typeof import("exceljs") }).default ??
    (ExcelJSPkg as unknown as typeof import("exceljs"));
  const workbook = await buildFinancialModelWorkbook(model, ExcelJS);
  const buffer = await workbook.xlsx.writeBuffer();
  const tmpPath = ".tmp-spectra-strategic-financial-model.xlsx";
  writeFileSync(tmpPath, Buffer.from(buffer as ArrayBuffer));
  try {
    const stat = statSync(tmpPath);
    check(stat.size > 50_000, `workbook size suspiciously small: ${stat.size} bytes`);

    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.readFile(tmpPath);
    const sheet = wb2.getWorksheet("Strategic Model");
    check(!!sheet, 'worksheet "Strategic Model" missing in re-read workbook');
    if (sheet) {
      check(sheet.actualColumnCount >= 75, `expected ≥ 75 cols, got ${sheet.actualColumnCount}`);
      check(sheet.actualRowCount > 50, `expected > 50 rows, got ${sheet.actualRowCount}`);

      // Spot-check that the M72 cell of the "Ending subscribers" row
      // matches the 33K target. Find the row whose B column equals
      // "Ending subscribers" and read column 75 (D=4 ... 75=BW for M72).
      let foundFinalSubs: number | null = null;
      sheet.eachRow((row) => {
        const b = row.getCell(2).value;
        if (b === "Ending subscribers") {
          const v = row.getCell(75).value;
          if (typeof v === "number") foundFinalSubs = v;
        }
      });
      check(
        foundFinalSubs !== null && Math.abs((foundFinalSubs as number) - 33_000) < 1,
        `re-read M72 ending subscribers should be ~33000, got ${foundFinalSubs}`,
      );

      const finalSubsLine = `  workbook M72 ending subscribers   : ${foundFinalSubs}`;
      console.log(finalSubsLine);
    }

    const sizeKb = (stat.size / 1024).toFixed(1);
    console.log(`  workbook size                     : ${sizeKb} KB`);
  } finally {
    try { unlinkSync(tmpPath); } catch { /* noop */ }
  }
}

if (errors.length > 0) {
  console.error("[smoke-financial-model-export] FAILURES:");
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(1);
}

await buildAndVerifyWorkbook();

if (errors.length > 0) {
  console.error("[smoke-financial-model-export] FAILURES:");
  for (const e of errors) console.error("  ✗ " + e);
  process.exit(1);
}

console.log("[smoke-financial-model-export] OK");
console.log(`  rows                              : ${model.rows.length}`);
console.log(`  monthLabels                       : ${model.forecast.monthLabels.length}`);
console.log(`  Year 6 ending subscribers         : ${endingSubs?.values[last]}`);
console.log(`  Year 6 ARR run-rate ($)           : ${Math.round(arrRow?.values[last] ?? 0).toLocaleString()}`);
console.log(`  Year 6 EBITDA ($)                 : ${Math.round(ebitdaRow?.values[last] ?? 0).toLocaleString()}`);
console.log(`  Year 6 Cash balance ($)           : ${Math.round(cashRow?.values[last] ?? 0).toLocaleString()}`);
console.log(`  summary.endingSubscribers         : ${summaryEnd}`);
console.log(`  summary.endingArr                 : ${Math.round(summary.endingArr).toLocaleString()}`);
console.log(`  summary.totalRevenue (6yr cum.)   : ${Math.round(summary.totalRevenue).toLocaleString()}`);
