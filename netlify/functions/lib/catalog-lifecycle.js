/**
 * netlify/functions/lib/catalog-lifecycle.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure helpers for the CRM catalog lifecycle (Phase C).
 *
 * Catalog entities (departments, service categories, services, resources) use
 * a three-state lifecycle: active | inactive | archived. There is no regular
 * deletion of an entity that has dependents or history — callers transition
 * status instead, and archiving something with active dependents requires an
 * explicit action (cascade the dependents or reassign them elsewhere).
 *
 * These functions are dependency-free and DB-free so they can be unit tested
 * in isolation; the API layer performs the actual queries and feeds counts in.
 */
"use strict";

const CATALOG_STATUSES = ["active", "inactive", "archived"];

/**
 * Normalize an incoming status to a valid catalog status.
 * Returns `fallback` when the value is undefined or not a known status.
 */
function normalizeCatalogStatus(value, fallback = "active") {
  if (value === undefined || value === null) return fallback;
  return CATALOG_STATUSES.includes(value) ? value : fallback;
}

/**
 * Resolve the status to persist on a PATCH. When the client sends a valid
 * status use it; otherwise keep the previous value. This never silently
 * downgrades an unknown status.
 */
function resolveStatusForPatch(requested, previous) {
  if (requested === undefined || requested === null) return previous;
  return CATALOG_STATUSES.includes(requested) ? requested : previous;
}

/** True when moving from `previous` to `next` newly archives the entity. */
function isArchiveTransition(previous, next) {
  return next === "archived" && previous !== "archived";
}

/**
 * Compute whether an archive can proceed given active dependents.
 *
 * @param {Array<{ type: string, count: number }>} dependents active dependents
 * @param {{ cascade?: boolean, reassign?: boolean, force?: boolean }} actions explicit actions
 * @returns {{ allowed: boolean, blockers: Array<{type,count}>, action: string }}
 *   - allowed=false with blockers when there are active dependents and no
 *     explicit action was requested.
 *   - allowed=true with action "cascade" | "reassign" | "force" | "none".
 */
function evaluateArchive(dependents, actions = {}) {
  const blockers = (dependents || []).filter((d) => d && Number(d.count) > 0);
  if (blockers.length === 0) {
    return { allowed: true, blockers: [], action: "none" };
  }
  if (actions.reassign) {
    return { allowed: true, blockers, action: "reassign" };
  }
  if (actions.cascade) {
    return { allowed: true, blockers, action: "cascade" };
  }
  if (actions.force) {
    return { allowed: true, blockers, action: "force" };
  }
  return { allowed: false, blockers, action: "blocked" };
}

module.exports = {
  CATALOG_STATUSES,
  normalizeCatalogStatus,
  resolveStatusForPatch,
  isArchiveTransition,
  evaluateArchive,
};
