#!/usr/bin/env node
/**
 * build-gtm-all.js
 * Runs the three GTM research stages in order. Each stage reads the previous
 * stage's output, so they must not be run out of sequence.
 *
 * Run: npm run build:gtm
 */

"use strict";

const path = require("path");
const { execFileSync } = require("child_process");

const STAGES = [
  "build-customer-facts.js",
  "build-acquisition-attribution.js",
  "build-gtm-research.js",
];

for (const stage of STAGES) {
  execFileSync(process.execPath, [path.join(__dirname, stage)], { stdio: "inherit" });
  console.log("");
}
