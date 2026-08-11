#!/usr/bin/env node
"use strict";

/**
 * Proves the local read-only development contract for the Salon CRM.
 *
 *   node scripts/prove-crm-dev-readonly.js
 *
 * Checks, in order:
 *   C  local login + crm-bootstrap return the real Maor salon with real
 *      customers and appointments
 *   D1 a local CRM mutation is refused by the HTTP layer (403)
 *   D2 write SQL is refused by the pg client layer (defense in depth)
 *   H  the Vite dev proxy resolves to a loopback functions server, so an
 *      unavailable local server cannot fall back to production
 *
 * Nothing here writes to the database: the mutation attempts are expected to be
 * rejected before reaching it, and the SQL check never commits.
 */

const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const DB_MODULE = path.join(ROOT, "netlify/functions/_db.js");

require("dotenv").config({ path: path.join(ROOT, ".env") });
require("dotenv").config({ path: path.join(ROOT, ".env.local"), override: true });

const { createClient } = require(DB_MODULE);
const {
  READONLY_ERROR_CODE,
  isCrmDevReadonly,
} = require(path.join(ROOT, "netlify/functions/lib/crm-dev-readonly.js"));

const EXPECTED_SALON_ID = process.env.PROVE_SALON_ID || "clean-salon-504322680";
const BASE_URL = (process.env.PROVE_BASE_URL || "http://127.0.0.1:9999").replace(/\/$/, "");
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

const results = [];

function pass(label, detail) {
  results.push({ ok: true, label, detail });
  console.log(`  PASS  ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, detail) {
  results.push({ ok: false, label, detail });
  console.error(`  FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
}

function assertLoopbackBase() {
  const host = new URL(BASE_URL).hostname;
  if (!LOOPBACK_HOSTS.has(host)) {
    throw new Error(
      `Refusing to run against non-local host "${host}". This script only probes a local functions server.`,
    );
  }
}

function fn(name, suffix = "") {
  return `${BASE_URL}/.netlify/functions/${name}${suffix}`;
}

async function login() {
  const res = await fetch(fn("salon-login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: process.env.PROVE_LOGIN_IDENTIFIER || "0504322680",
      password: process.env.SALON_LOGIN_PASSWORD || "",
    }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.salonId) {
    throw new Error(`salon-login failed (${res.status}): ${JSON.stringify(body)}`);
  }
  return body;
}

async function proveReads(token) {
  const res = await fetch(fn("crm-bootstrap"), {
    headers: { Accept: "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || body?.ok !== true) {
    fail("C reads real data", `crm-bootstrap returned ${res.status}`);
    return;
  }

  const meta = body.meta || {};
  const counts = meta.counts || {};
  if (meta.salonId === EXPECTED_SALON_ID) {
    pass("C tenant", `crm-bootstrap resolved ${meta.salonId} from the session (source=${meta.source})`);
  } else {
    fail("C tenant", `expected ${EXPECTED_SALON_ID}, got ${meta.salonId}`);
  }

  const appointments = Number(meta.history?.totals?.appointments ?? counts.appointments ?? 0);
  if (Number(counts.customers) > 0 && appointments > 0) {
    pass("C real data", `${counts.customers} customers, ${appointments} appointments, ${counts.staff} staff`);
  } else {
    fail("C real data", `customers=${counts.customers} appointments=${appointments}`);
  }

  if (body.data?.devReadonly === true) {
    pass("C dev indicator", "crm-bootstrap reports devReadonly:true for the UI banner");
  } else {
    fail("C dev indicator", "crm-bootstrap did not report devReadonly");
  }
}

async function proveHttpMutationBlocked(token) {
  const attempts = [
    ["salon-customers", "POST", { firstName: "ReadOnly", lastName: "Probe" }],
    ["salon-staff", "POST", { name: "ReadOnly Probe" }],
    ["crm-salons", "PATCH", { name: "ReadOnly Probe" }],
  ];

  for (const [name, method, payload] of attempts) {
    const res = await fetch(fn(name), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const body = await res.json().catch(() => null);
    const code = body?.error?.code;
    if (res.status === 403 && code === READONLY_ERROR_CODE) {
      pass(`D1 ${method} ${name}`, `403 ${code}`);
    } else {
      fail(`D1 ${method} ${name}`, `expected 403 ${READONLY_ERROR_CODE}, got ${res.status} ${code || ""}`);
    }
  }
}

async function proveSqlLayerBlocked() {
  const client = createClient();
  await client.connect();
  try {
    const read = await client.query("SELECT count(*)::int AS n FROM salon_customers WHERE salon_id = $1", [
      EXPECTED_SALON_ID,
    ]);
    pass("D2 reads allowed", `SELECT returned ${read.rows[0].n} customers through the guarded client`);

    const writes = [
      ["UPDATE salons SET name = name WHERE id = $1", [EXPECTED_SALON_ID]],
      ["DELETE FROM salon_customers WHERE salon_id = $1 AND 1 = 0", [EXPECTED_SALON_ID]],
      ["WITH x AS (SELECT 1) INSERT INTO salon_audit_events (salon_id) SELECT $1", [EXPECTED_SALON_ID]],
    ];

    for (const [sql, values] of writes) {
      const verb = sql.split(/\s+/).slice(0, 2).join(" ");
      try {
        await client.query(sql, values);
        fail(`D2 ${verb}`, "write was NOT rejected by the client guard");
      } catch (err) {
        if (err && err.code === READONLY_ERROR_CODE) {
          pass(`D2 ${verb}`, "rejected before reaching the database");
        } else {
          fail(`D2 ${verb}`, `rejected with unexpected error: ${err.code || ""} ${err.message}`);
        }
      }
    }
  } finally {
    await client.end().catch(() => {});
  }
}

/**
 * With the flag unset the pg client must be returned exactly as before: no
 * wrapper, no interception. Runs in a child process so this process keeps its
 * read-only environment, and never connects or writes.
 */
function proveProductionPathUnchanged() {
  const probe = `
    const { Client } = require("pg");
    const { createClient } = require(${JSON.stringify(DB_MODULE)});
    const client = createClient();
    process.stdout.write(JSON.stringify({
      ownQuery: Object.prototype.hasOwnProperty.call(client, "query"),
      sharedPrototypeQuery: client.query === Client.prototype.query,
    }));
  `;

  const raw = execFileSync(process.execPath, ["-e", probe], {
    cwd: ROOT,
    env: { ...process.env, CRM_DEV_READONLY: "" },
    encoding: "utf8",
  });
  const probed = JSON.parse(raw);

  if (!probed.ownQuery && probed.sharedPrototypeQuery) {
    pass("E production path unchanged", "with CRM_DEV_READONLY unset, createClient returns an unwrapped pg Client");
  } else {
    fail("E production path unchanged", `client was still wrapped: ${raw}`);
  }
}

async function proveNoProductionFallback() {
  const { resolveConfig } = await import("vite");
  const config = await resolveConfig({ configFile: path.join(ROOT, "vite.config.ts") }, "serve");
  const proxy = config.server?.proxy?.["/.netlify/functions"];
  const target = typeof proxy === "string" ? proxy : proxy?.target;
  if (typeof target !== "string") {
    fail("H no production fallback", "could not resolve the dev proxy target");
    return;
  }
  const host = new URL(target).hostname;
  if (LOOPBACK_HOSTS.has(host)) {
    pass("H no production fallback", `dev proxy target is ${target}`);
  } else {
    fail("H no production fallback", `dev proxy target is ${target}`);
  }
}

async function main() {
  assertLoopbackBase();

  console.log(`Local read-only proof against ${BASE_URL}`);
  console.log(`Expected salon: ${EXPECTED_SALON_ID}`);
  console.log(`CRM_DEV_READONLY: ${isCrmDevReadonly() ? "on" : "off"}\n`);

  if (!isCrmDevReadonly()) {
    throw new Error("CRM_DEV_READONLY is not enabled — set it in .env.local before proving the contract.");
  }

  const session = await login();
  if (session.salonId === EXPECTED_SALON_ID) {
    pass("C login", `session issued for ${session.salonId} (token=${session.token ? "signed" : "none"})`);
  } else {
    fail("C login", `expected ${EXPECTED_SALON_ID}, got ${session.salonId}`);
  }

  await proveReads(session.token);
  await proveHttpMutationBlocked(session.token);
  await proveSqlLayerBlocked();
  proveProductionPathUnchanged();
  await proveNoProductionFallback();

  const failures = results.filter((r) => !r.ok);
  console.log(`\n${results.length - failures.length}/${results.length} checks passed`);
  if (failures.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(`\nproof aborted: ${err.message}`);
  process.exitCode = 1;
});
