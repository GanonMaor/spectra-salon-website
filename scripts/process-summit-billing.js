#!/usr/bin/env node
/**
 * process-summit-billing.js
 * Parses the Summit all-time billing Excel and writes src/data/summit-billing.json.
 * Distinguishes between recurring subscriptions and one-time equipment/installation payments.
 * Run: node scripts/process-summit-billing.js
 */
"use strict";
const fs   = require("fs");
const path = require("path");
const XLSX = require("xlsx");

// Prefer the all-time file; fall back to the april snapshot
const INPUTS = [
  path.resolve(__dirname, "..", "..", "sumit-all-times.xlsx"),
  path.resolve(__dirname, "..", "..", "sumit-april26.xlsx"),
];
const INPUT = INPUTS.find(f => fs.existsSync(f));
if (!INPUT) throw new Error("No Summit billing file found in ~/Downloads");

const OUTPUT = path.resolve(__dirname, "..", "src", "data", "summit-billing.json");

const wb = XLSX.readFile(INPUT);
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

const header = rows[0];
const months = header.slice(2, -1); // all month columns

// Column index helpers (row[0]=name, row[1]=id, row[2..n-1]=months, row[n]=total)
function mIdx(label) { return months.indexOf(label) + 2; }

const APR26_IDX = mIdx("04/2026");
const MAR26_IDX = mIdx("03/2026");
const FEB26_IDX = mIdx("02/2026");
const JAN26_IDX = mIdx("01/2026");

// Threshold above which a single payment is considered equipment / installation
const EQUIPMENT_THRESHOLD = 2000;

function firstPaidMonth(monthly) {
  for (let i = 0; i < monthly.length; i++) {
    if (monthly[i] > 0) return months[i];
  }
  return null;
}

function lastPaidMonthFn(monthly) {
  for (let i = monthly.length - 1; i >= 0; i--) {
    if (monthly[i] > 0) return months[i];
  }
  return null;
}

/** Median of non-zero subscription (< EQUIPMENT_THRESHOLD) amounts */
function typicalSubAmount(monthly) {
  const vals = monthly.filter(v => v > 0 && v < EQUIPMENT_THRESHOLD).sort((a, b) => a - b);
  if (!vals.length) return 0;
  const mid = Math.floor(vals.length / 2);
  return vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
}

/**
 * Classify a customer's payment history:
 *   "subscription"   – recurring small amounts, no large one-time payments
 *   "equipment"      – only large one-time payments (hardware / installation)
 *   "both"           – had equipment AND recurring subscription
 *   "never"          – zero total
 */
function classifyPaymentType(monthly) {
  const largePayments  = monthly.filter(v => v >= EQUIPMENT_THRESHOLD);
  const smallRecurring = monthly.filter(v => v > 0 && v < EQUIPMENT_THRESHOLD);
  if (largePayments.length === 0 && smallRecurring.length === 0) return "never";
  if (largePayments.length > 0 && smallRecurring.length < 3) return "equipment";
  if (largePayments.length === 0) return "subscription";
  return "both";
}

const customers = rows.slice(1)
  .filter(r => r[0] && String(r[0]).trim() !== "סה\"כ" && String(r[0]).trim() !== "")
  .map(r => {
    const monthly       = months.map((_, i) => Number(r[i + 2] || 0));
    const ltv           = Number(r[r.length - 1] || 0); // lifetime value (total ever paid)
    const apr26         = Number(r[APR26_IDX] || 0);
    const mar26         = Number(r[MAR26_IDX] || 0);
    const feb26         = Number(r[FEB26_IDX] || 0);
    const jan26         = Number(r[JAN26_IDX] || 0);
    const paymentType   = classifyPaymentType(monthly);
    const activeMonths  = monthly.filter(v => v > 0).length;

    // Equipment-only customers are NOT considered active subscribers even if they paid recently
    const isActiveSubscriber = (apr26 > 0 || mar26 > 0) &&
      (paymentType === "subscription" || paymentType === "both");
    const stoppedSubscription = !isActiveSubscriber && ltv > 0 &&
      (paymentType === "subscription" || paymentType === "both");

    // Total equipment payments (one-time, large)
    const equipmentTotal = monthly.filter(v => v >= EQUIPMENT_THRESHOLD).reduce((s, v) => s + v, 0);
    const subscriptionTotal = ltv - equipmentTotal;

    return {
      name:                String(r[0]).trim(),
      sumitId:             r[1] ? Number(r[1]) : null,
      monthly,
      ltv,
      subscriptionTotal,
      equipmentTotal,
      apr26,
      mar26,
      feb26,
      jan26,
      activeMonths,
      paymentType,
      typicalMonthly:      Math.round(typicalSubAmount(monthly)),
      firstPaidMonth:      firstPaidMonth(monthly),
      lastPaidMonth:       lastPaidMonthFn(monthly),
      isActiveSubscriber,
      stoppedSubscription,
      // Legacy field kept for backwards compatibility
      currentlyPaying:     apr26 > 0 || mar26 > 0,
    };
  });

const activeSubs  = customers.filter(c => c.isActiveSubscriber).length;
const stopped     = customers.filter(c => c.stoppedSubscription).length;
const equipOnly   = customers.filter(c => c.paymentType === "equipment").length;
const never       = customers.filter(c => c.paymentType === "never").length;
const withBoth    = customers.filter(c => c.paymentType === "both").length;

const output = {
  _generated:  new Date().toISOString(),
  _source:     path.basename(INPUT),
  months,
  apr26Index:  months.indexOf("04/2026"),
  mar26Index:  months.indexOf("03/2026"),
  summary: {
    total:               customers.length,
    activeSubscribers:   activeSubs,
    stoppedSubscription: stopped,
    equipmentOnly:       equipOnly,
    subscriptionAndEquip: withBoth,
    neverPaid:           never,
    totalLTV:            Math.round(customers.reduce((s, c) => s + c.ltv, 0)),
  },
  customers,
};

fs.writeFileSync(OUTPUT, JSON.stringify(output, null, 2), "utf8");
console.log(`Source: ${path.basename(INPUT)}`);
console.log(`Written ${customers.length} Summit customers → ${OUTPUT}`);
console.log(`  Active subscribers (Mar/Apr > 0, subscription or both): ${activeSubs}`);
console.log(`  Stopped subscription:    ${stopped}`);
console.log(`  Equipment-only:          ${equipOnly}`);
console.log(`  Subscription + equipment: ${withBoth}`);
console.log(`  Never paid:              ${never}`);
console.log(`  Total LTV: ₪${Math.round(customers.reduce((s,c)=>s+c.ltv,0)).toLocaleString()}`);
