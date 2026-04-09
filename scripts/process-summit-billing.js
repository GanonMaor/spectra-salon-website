#!/usr/bin/env node
/**
 * process-summit-billing.js
 * Parses the Summit billing Excel and writes src/data/summit-billing.json.
 * Run: node scripts/process-summit-billing.js
 */
"use strict";
const fs   = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const INPUT  = path.resolve(__dirname, "..", "..", "sumit-april26.xlsx");
const OUTPUT = path.resolve(__dirname, "..", "src", "data", "summit-billing.json");

const wb = XLSX.readFile(INPUT);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

// Header: ["לקוח/ה","מזהה לקוח/ה","10/2025","11/2025",...,"10/2026","סה\"כ"]
const header = rows[0];
const months = header.slice(2, -1); // ["10/2025", "11/2025", ..., "10/2026"]

// Index helpers (relative to row array)
// idx 0 = name, 1 = sumitId, 2..14 = monthly, 15 = total
// Apr 2026 = months index 6 → row index 2+6 = 8
// Mar 2026 = months index 5 → row index 7
// Feb 2026 = months index 4 → row index 6
const APR26_IDX = months.indexOf("04/2026") + 2; // +2 because row[0]=name, row[1]=id
const MAR26_IDX = months.indexOf("03/2026") + 2;
const FEB26_IDX = months.indexOf("02/2026") + 2;
const JAN26_IDX = months.indexOf("01/2026") + 2;

function lastPaidMonth(row) {
  // scan from most recent backward
  for (let i = months.length - 1; i >= 0; i--) {
    if (Number(row[i + 2] || 0) > 0) return months[i];
  }
  return null;
}

const customers = rows.slice(1)
  .filter(r => r[0] && String(r[0]).trim() !== "סה\"כ" && String(r[0]).trim() !== "")
  .map(r => {
    const monthly = months.map((_, i) => Number(r[i + 2] || 0));
    const total   = Number(r[r.length - 1] || 0);
    const apr26   = Number(r[APR26_IDX] || 0);
    const mar26   = Number(r[MAR26_IDX] || 0);
    const feb26   = Number(r[FEB26_IDX] || 0);
    const jan26   = Number(r[JAN26_IDX] || 0);
    const activeMonths = monthly.filter(v => v > 0).length;

    return {
      name: String(r[0]).trim(),
      sumitId: r[1] ? Number(r[1]) : null,
      monthly,
      total,
      apr26,
      mar26,
      feb26,
      jan26,
      activeMonths,
      // Currently paying = has payment in Mar OR Apr 2026
      currentlyPaying: apr26 > 0 || mar26 > 0,
      // Stopped = used to pay but 0 in both Mar and Apr
      stoppedPaying: (apr26 === 0 && mar26 === 0) && total > 0,
      lastPaidMonth: lastPaidMonth(r),
    };
  });

const paying    = customers.filter(c => c.currentlyPaying).length;
const stopped   = customers.filter(c => c.stoppedPaying).length;
const noPay     = customers.filter(c => c.total === 0).length;

const output = {
  _generated: new Date().toISOString(),
  _source: "sumit-april26.xlsx",
  months,
  apr26Index: months.indexOf("04/2026"),
  mar26Index: months.indexOf("03/2026"),
  summary: {
    total: customers.length,
    currentlyPaying: paying,
    stoppedPaying: stopped,
    neverPaid: noPay,
  },
  customers,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf8");
console.log(`Written ${customers.length} Summit customers to ${OUTPUT}`);
console.log(`  Currently paying (Mar/Apr > 0): ${paying}`);
console.log(`  Stopped paying: ${stopped}`);
console.log(`  Never paid: ${noPay}`);
