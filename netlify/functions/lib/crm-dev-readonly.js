"use strict";

/**
 * Local development safety layer: the CRM may READ production data while
 * running locally, but a local session must never be able to write to it.
 *
 * Two independent layers consume this module:
 *   1. scripts/local-functions-server.js — rejects mutating HTTP methods
 *      before a handler runs. This is the primary protection.
 *   2. netlify/functions/_db.js — rejects write SQL on the pg client. This is
 *      defense in depth, never the only mechanism.
 *
 * Everything here is inert unless CRM_DEV_READONLY is enabled, so deployed
 * production behaviour is unchanged.
 */

const READONLY_ERROR_CODE = "CRM_DEV_READONLY";
const READONLY_MESSAGE =
  "DEV — PRODUCTION DATA READ ONLY: local development cannot modify production data.";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Functions allowed to answer a mutating HTTP method in read-only mode.
 * `salon-login` only SELECTs identity/membership rows and mints a session
 * token; it writes no records. No other CRM POST route was proven read-only,
 * so nothing else may be added here without a fresh audit.
 */
const MUTATING_METHOD_ALLOWLIST = new Set(["salon-login"]);

/** Leading keywords that cannot modify data. */
const READ_LEADING_KEYWORDS = new Set([
  "select",
  "values",
  "table",
  "show",
  "begin",
  "start",
  "commit",
  "end",
  "rollback",
  "savepoint",
  "release",
  "set",
  "reset",
  "deallocate",
  "close",
  "fetch",
  "discard",
]);

const WRITE_KEYWORDS = /\b(insert|update|delete|merge|truncate|drop|alter|create|copy|grant|revoke|call|do|vacuum|reindex|cluster|refresh|comment|lock|import)\b/i;

function isCrmDevReadonly() {
  const raw = String(process.env.CRM_DEV_READONLY || "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function readonlyError(detail) {
  const err = new Error(detail ? `${READONLY_MESSAGE} (${detail})` : READONLY_MESSAGE);
  err.code = READONLY_ERROR_CODE;
  err.statusCode = 403;
  return err;
}

/**
 * @param {string} functionName Netlify function name (no extension)
 * @param {string} method HTTP method
 */
function isHttpMutationAllowed(functionName, method) {
  const upper = String(method || "GET").toUpperCase();
  if (!MUTATING_METHODS.has(upper)) return true;
  return MUTATING_METHOD_ALLOWLIST.has(String(functionName || ""));
}

/**
 * Remove comments and quoted payloads so statement splitting and keyword
 * matching cannot be fooled (or false-triggered) by literal text.
 */
function stripSqlNoise(sql) {
  return String(sql)
    .replace(/\/\*[\s\S]*?\*\//g, " ")
    .replace(/--[^\n]*/g, " ")
    .replace(/\$([A-Za-z_]*)\$[\s\S]*?\$\1\$/g, " '' ")
    .replace(/'(?:''|[^'])*'/g, " '' ")
    .replace(/"(?:""|[^"])*"/g, ' "id" ');
}

function leadingKeyword(statement) {
  const match = statement.replace(/^[\s(]+/, "").match(/^[A-Za-z_]+/);
  return match ? match[0].toLowerCase() : "";
}

/**
 * Throw when `sql` can modify data. Fails closed: anything not recognized as a
 * pure read is rejected.
 *
 * @param {unknown} sql
 */
function assertSqlAllowed(sql) {
  if (typeof sql !== "string" || !sql.trim()) {
    throw readonlyError("unrecognized query shape");
  }

  const statements = stripSqlNoise(sql)
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean);

  if (!statements.length) throw readonlyError("empty statement");

  for (const statement of statements) {
    const keyword = leadingKeyword(statement);

    // A CTE can hide a write (`WITH x AS (...) INSERT ...`), so the whole
    // statement is scanned instead of trusting the leading keyword.
    if (keyword === "with" || keyword === "explain") {
      if (WRITE_KEYWORDS.test(statement)) {
        throw readonlyError(`blocked ${keyword} statement containing a write`);
      }
      continue;
    }

    if (!READ_LEADING_KEYWORDS.has(keyword)) {
      throw readonlyError(`blocked ${keyword || "unknown"} statement`);
    }
  }
}

/** Extract the SQL text from the argument forms accepted by pg's `query`. */
function extractSqlText(arg) {
  if (typeof arg === "string") return arg;
  if (arg && typeof arg === "object" && typeof arg.text === "string") return arg.text;
  return null;
}

/**
 * Wrap a pg Client so write statements are rejected before they reach the
 * database. Only used when CRM_DEV_READONLY is enabled.
 *
 * @template T
 * @param {T} client
 * @returns {T}
 */
function createReadonlyGuardedClient(client) {
  const nativeQuery = client.query.bind(client);

  client.query = function guardedQuery(...args) {
    try {
      assertSqlAllowed(extractSqlText(args[0]));
    } catch (err) {
      const callback = args[args.length - 1];
      if (typeof callback === "function") {
        callback(err);
        return undefined;
      }
      return Promise.reject(err);
    }
    return nativeQuery(...args);
  };

  return client;
}

module.exports = {
  READONLY_ERROR_CODE,
  READONLY_MESSAGE,
  MUTATING_METHOD_ALLOWLIST,
  assertSqlAllowed,
  createReadonlyGuardedClient,
  isCrmDevReadonly,
  isHttpMutationAllowed,
  readonlyError,
};
