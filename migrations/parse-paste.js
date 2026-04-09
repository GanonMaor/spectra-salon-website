#!/usr/bin/env node
"use strict";
/**
 * Parses the raw screen-scraped salon users paste into a JS array literal
 * that can replace rawSalonUsers in import_salon_users.js.
 *
 * Input: /tmp/salon_paste.txt
 * Output: /tmp/parsed_salon_users.js  (JS array literal)
 */
const fs = require("fs");
const path = require("path");

const src = fs.readFileSync("/tmp/salon_paste.txt", "utf8");
const lines = src.split("\n").map((l) => l.trim());

const records = [];
let i = 0;

// skip until first "User" marker
while (i < lines.length && lines[i] !== "User") i++;

while (i < lines.length) {
  if (lines[i] !== "User") { i++; continue; }
  i++;
  if (i >= lines.length) break;

  const dataLine = lines[i]; i++;
  const parts = dataLine.split("\t");
  if (parts.length < 2) continue;

  const salon_name       = (parts[0] || "").trim();
  const phone_number     = (parts[1] || "").trim();
  const profiles         = parseInt(parts[2] || "0", 10) || 0;
  const first_mix_date   = (parts[3] || "-").trim() || "-";
  const last_mix_date    = (parts[4] || "-").trim() || "-";

  // skip blank line before trend
  if (i < lines.length && lines[i] === "") i++;
  // trend line (always "-")
  if (i < lines.length && lines[i] === "-") i++;

  // version + optional state / city / links
  if (i >= lines.length) break;
  const versionLine = lines[i]; i++;
  const vParts = versionLine.split("\t");
  const version = (vParts[0] || "").trim();
  const state   = (vParts[1] || "").trim();
  const city    = (vParts[2] || "").trim();
  const links   = (vParts[3] || "").trim();

  // skip Edit / Upload / blanks
  while (i < lines.length && ["Edit", "Upload", ""].includes(lines[i])) i++;

  if (!salon_name && !phone_number) continue;

  records.push({
    salon_name,
    phone_number,
    profiles,
    first_mix_date,
    last_mix_date,
    monthly_trend: "-",
    version,
    state,
    city,
    links,
    summit: "",
    instagram: "",
  });
}

console.log(`Parsed ${records.length} records`);

// spot check
const amy = records.find((r) => r.phone_number === "4043166024");
if (amy) console.log("Amy Lee Kimbrell:", JSON.stringify(amy));

// emit JS array literal
const jsArray =
  "const rawSalonUsers = [\n" +
  records
    .map((r) => "  " + JSON.stringify(r, null, 0).replace(/\\/g, "\\"))
    .join(",\n") +
  "\n];";

fs.writeFileSync("/tmp/parsed_raw_salon_users.js", jsArray, "utf8");
console.log("Written to /tmp/parsed_raw_salon_users.js");
