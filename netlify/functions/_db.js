"use strict";

const { Client } = require("pg");

const CANONICAL_DATABASE_ENV = "NEON_DATABASE_URL";

function normalizeDatabaseUrl(value) {
  return String(value || "")
    .trim()
    .replace(/^psql\s+/i, "")
    .replace(/^'|'$/g, "");
}

function getDatabaseUrl() {
  return normalizeDatabaseUrl(process.env[CANONICAL_DATABASE_ENV]);
}

function hasDatabaseUrl() {
  return getDatabaseUrl().length >= 10;
}

function requireDatabaseUrl() {
  const url = getDatabaseUrl();
  if (!url || url.length < 10) {
    throw new Error(`${CANONICAL_DATABASE_ENV} is not configured`);
  }
  return url;
}

function createClient(options = {}) {
  const connectionString = options.required === false ? getDatabaseUrl() : requireDatabaseUrl();
  if (!connectionString) return null;
  return new Client({
    connectionString,
    ssl: options.ssl === false ? undefined : { rejectUnauthorized: false },
  });
}

function getDatabaseEndpointIdentifier() {
  const url = getDatabaseUrl();
  if (!url) return null;
  try {
    return new URL(url).hostname;
  } catch {
    return "unparseable";
  }
}

module.exports = {
  CANONICAL_DATABASE_ENV,
  createClient,
  getDatabaseEndpointIdentifier,
  getDatabaseUrl,
  hasDatabaseUrl,
  normalizeDatabaseUrl,
  requireDatabaseUrl,
};
