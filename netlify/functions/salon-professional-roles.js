/**
 * netlify/functions/salon-professional-roles.js
 * ─────────────────────────────────────────────────────────────────────────
 * Tenant-scoped professional-roles API (Phase B).
 *
 * All routes derive salon_id from resolveSalonContext(event); the frontend
 * never sends salonId. Professional roles define what professional work a
 * person can do (departments, allowed services, split-stage capabilities,
 * default price/time) and carry NO system access.
 *
 * Routes:
 *   GET    /                        list professional roles + staff assignments
 *   POST   /roles                   create a professional role
 *   PATCH  /roles/:id               update/archive a role (dependency-checked)
 *   POST   /assignments             assign a staff member to a role (upsert)
 *   DELETE /assignments/:id         remove a staff <-> role assignment
 *
 * Archiving a role that is still assigned to staff returns 409 with a
 * { blockers } payload unless the caller passes reassignRoleId or force.
 */
"use strict";

const {
  resolveSalonContext,
  SalonAuthError,
  requireContextPermission,
  PermissionError,
  enforceSessionStatus,
} = require("./_salon-context");
const { createClient, hasDatabaseUrl } = require("./_db");
const {
  buildRolePayload,
  buildAssignmentPayload,
  evaluateRoleArchive,
  resolveStatusForPatch,
  isArchiveTransition,
} = require("./lib/professional-roles");

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Content-Type": "application/json",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
};

function success(statusCode, data, meta = {}) {
  return { statusCode, headers: CORS, body: JSON.stringify({ ok: true, data, meta }) };
}

function noContent() {
  return { statusCode: 204, headers: CORS, body: "" };
}

function error(statusCode, code, message, details = {}) {
  return { statusCode, headers: CORS, body: JSON.stringify({ ok: false, error: { code, message, details } }) };
}

function parsePath(event) {
  const path = event.path || "";
  const marker = "/.netlify/functions/salon-professional-roles";
  const markerIndex = path.indexOf(marker);
  const raw = markerIndex >= 0 ? path.slice(markerIndex + marker.length) : path;
  return (raw || "/").split("/").filter(Boolean).map(decodeURIComponent);
}

function hasForbiddenSalonInput(event, body) {
  const headers = event.headers || {};
  const query = event.queryStringParameters || {};
  if (headers["x-salon-id"] !== undefined || headers["X-Salon-Id"] !== undefined || headers["X-Salon-ID"] !== undefined) return true;
  if (query.salon_id !== undefined || query.salonId !== undefined) return true;
  if (body && typeof body === "object" && !Array.isArray(body)) {
    return body.salon_id !== undefined || body.salonId !== undefined;
  }
  return false;
}

function parseJsonBody(event) {
  if (!event.body) return { body: {} };
  try {
    const parsed = JSON.parse(event.body);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { parseError: "Request body must be a JSON object" };
    }
    return { body: parsed };
  } catch {
    return { parseError: "Invalid JSON body" };
  }
}

async function getClient() {
  const client = createClient();
  await client.connect();
  return client;
}

function rowToRole(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    name: row.name,
    departmentIds: row.department_ids || [],
    allowedServiceIds: row.allowed_service_ids || [],
    stageCapabilities: row.stage_capabilities || [],
    defaultPriceCents: row.default_price_cents === null || row.default_price_cents === undefined ? null : Number(row.default_price_cents),
    defaultDurationMinutes: row.default_duration_minutes === null || row.default_duration_minutes === undefined ? null : Number(row.default_duration_minutes),
    color: row.color || null,
    icon: row.icon || null,
    sortOrder: row.sort_order === null || row.sort_order === undefined ? 0 : Number(row.sort_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToAssignment(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    staffMemberId: row.staff_member_id,
    professionalRoleId: row.professional_role_id,
    isPrimary: Boolean(row.is_primary),
    primaryServiceIds: row.primary_service_ids || [],
    servicePriceOverrides: row.service_price_overrides || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function assertOwnsRole(client, salonId, id) {
  const r = await client.query(`SELECT id FROM salon_professional_roles WHERE salon_id = $1 AND id = $2 LIMIT 1`, [salonId, id]);
  return r.rows.length > 0;
}

async function assertOwnsStaff(client, salonId, id) {
  const r = await client.query(`SELECT id FROM salon_staff WHERE salon_id = $1 AND id = $2 LIMIT 1`, [salonId, id]);
  return r.rows.length > 0;
}

async function countAssignedStaff(client, salonId, roleId) {
  const r = await client.query(
    `SELECT count(*)::int AS n FROM salon_staff_professional_roles
     WHERE salon_id = $1 AND professional_role_id = $2`,
    [salonId, roleId],
  );
  return Number(r.rows[0] ? r.rows[0].n : 0) || 0;
}

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return success(200, {}, {});

  const method = event.httpMethod;
  const segments = parsePath(event);
  const { body, parseError } = parseJsonBody(event);

  if (parseError) return error(400, "VALIDATION_ERROR", parseError);
  if (hasForbiddenSalonInput(event, body)) {
    return error(400, "VALIDATION_ERROR", "salonId is resolved by the server and must not be sent by the client");
  }

  let salonCtx;
  try {
    salonCtx = resolveSalonContext(event);
  } catch (err) {
    if (err instanceof SalonAuthError) return error(err.statusCode, err.code || "UNAUTHORIZED", err.message);
    return error(401, "UNAUTHORIZED", "Unauthorized");
  }
  const salonId = salonCtx.salonId;

  if (!hasDatabaseUrl()) {
    return error(500, "DATABASE_NOT_CONFIGURED", "Database is not configured");
  }

  let client;
  try {
    client = await getClient();

    // Reject sessions whose backing membership was suspended/revoked (or whose
    // token predates the sessions_valid_after cutoff) before doing any work.
    try {
      await enforceSessionStatus(client, salonCtx);
    } catch (err) {
      if (err instanceof SalonAuthError) return error(err.statusCode, err.code || "UNAUTHORIZED", err.message);
      throw err;
    }

    // Professional roles are staff configuration. Evaluate this after
    // membership hydration so the database-backed access role wins over the
    // signed legacy role when both are present.
    const ROLE_ACTION_BY_METHOD = { GET: "view", POST: "create", PATCH: "update", DELETE: "archive" };
    const requiredAction = ROLE_ACTION_BY_METHOD[method];
    if (requiredAction) {
      try {
        requireContextPermission(salonCtx, "staff", requiredAction, "salon");
      } catch (err) {
        if (err instanceof PermissionError) return error(err.statusCode, err.code, err.message);
        throw err;
      }
    }

    // ── GET / ── list roles + assignments ──────────────────────────────────
    if (method === "GET" && segments.length === 0) {
      const status = event.queryStringParameters?.status;
      const params = [salonId];
      let where = "salon_id = $1";
      if (status === "active" || status === "inactive" || status === "archived") {
        params.push(status);
        where += ` AND status = $${params.length}`;
      } else if (status !== "all") {
        where += " AND status <> 'archived'";
      }
      const [roles, assignments] = await Promise.all([
        client.query(
          `SELECT * FROM salon_professional_roles
           WHERE ${where}
           ORDER BY sort_order ASC, name ASC`,
          params,
        ),
        client.query(
          `SELECT * FROM salon_staff_professional_roles
           WHERE salon_id = $1
           ORDER BY created_at ASC`,
          [salonId],
        ),
      ]);
      return success(
        200,
        { roles: roles.rows.map(rowToRole), assignments: assignments.rows.map(rowToAssignment) },
        { count: roles.rows.length },
      );
    }

    // ── POST /roles ── create ───────────────────────────────────────────────
    if (method === "POST" && segments[0] === "roles" && segments.length === 1) {
      const payload = buildRolePayload(body, { partial: false });
      if (payload.validationError) return error(400, "VALIDATION_ERROR", payload.validationError);
      const f = payload.fields;
      const r = await client.query(
        `INSERT INTO salon_professional_roles
           (salon_id, name, department_ids, allowed_service_ids, stage_capabilities,
            default_price_cents, default_duration_minutes, color, icon, sort_order, status)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, $5::jsonb, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [
          salonId,
          f.name,
          JSON.stringify(f.departmentIds || []),
          JSON.stringify(f.allowedServiceIds || []),
          JSON.stringify(f.stageCapabilities || []),
          f.defaultPriceCents,
          f.defaultDurationMinutes,
          f.color,
          f.icon,
          f.sortOrder || 0,
          f.status,
        ],
      );
      return success(201, { role: rowToRole(r.rows[0]) });
    }

    // ── PATCH /roles/:id ── update/archive ──────────────────────────────────
    if (method === "PATCH" && segments[0] === "roles" && segments[1]) {
      const id = segments[1];
      if (!(await assertOwnsRole(client, salonId, id))) return error(404, "NOT_FOUND", "Professional role not found");
      const current = await client.query(`SELECT * FROM salon_professional_roles WHERE salon_id = $1 AND id = $2`, [salonId, id]);
      const prev = current.rows[0];

      const payload = buildRolePayload(body, { partial: true });
      if (payload.validationError) return error(400, "VALIDATION_ERROR", payload.validationError);
      const f = payload.fields;
      const nextStatus = resolveStatusForPatch(f.status, prev.status);

      if (isArchiveTransition(prev.status, nextStatus)) {
        const assignedStaff = await countAssignedStaff(client, salonId, id);
        const decision = evaluateRoleArchive(assignedStaff, {
          reassign: Boolean(body.reassignRoleId),
          force: body.force === true,
        });
        if (!decision.allowed) {
          return {
            statusCode: 409,
            headers: CORS,
            body: JSON.stringify({
              ok: false,
              error: {
                code: "ROLE_HAS_ASSIGNMENTS",
                message: "Professional role is still assigned to staff; pass reassignRoleId or force to proceed",
                details: { blockers: decision.blockers, requiresAction: true },
              },
            }),
          };
        }
        if (body.reassignRoleId) {
          if (!(await assertOwnsRole(client, salonId, body.reassignRoleId))) {
            return error(404, "NOT_FOUND", "Reassign role not found");
          }
          // Move assignments to the replacement role, skipping staff that would
          // collide with the unique (staff, role) constraint on the target.
          await client.query(
            `UPDATE salon_staff_professional_roles src
             SET professional_role_id = $3, updated_at = now()
             WHERE src.salon_id = $1 AND src.professional_role_id = $2
               AND NOT EXISTS (
                 SELECT 1 FROM salon_staff_professional_roles dst
                 WHERE dst.salon_id = src.salon_id
                   AND dst.staff_member_id = src.staff_member_id
                   AND dst.professional_role_id = $3
               )`,
            [salonId, id, body.reassignRoleId],
          );
          await client.query(
            `DELETE FROM salon_staff_professional_roles
             WHERE salon_id = $1 AND professional_role_id = $2`,
            [salonId, id],
          );
        }
        // force: proceed leaving assignments in place.
      }

      const r = await client.query(
        `UPDATE salon_professional_roles
         SET name = $3,
             department_ids = $4::jsonb,
             allowed_service_ids = $5::jsonb,
             stage_capabilities = $6::jsonb,
             default_price_cents = $7,
             default_duration_minutes = $8,
             color = $9,
             icon = $10,
             sort_order = $11,
             status = $12,
             updated_at = now()
         WHERE salon_id = $1 AND id = $2
         RETURNING *`,
        [
          salonId,
          id,
          f.name !== undefined ? f.name : prev.name,
          JSON.stringify(f.departmentIds !== undefined ? f.departmentIds : prev.department_ids || []),
          JSON.stringify(f.allowedServiceIds !== undefined ? f.allowedServiceIds : prev.allowed_service_ids || []),
          JSON.stringify(f.stageCapabilities !== undefined ? f.stageCapabilities : prev.stage_capabilities || []),
          f.defaultPriceCents !== undefined ? f.defaultPriceCents : prev.default_price_cents,
          f.defaultDurationMinutes !== undefined ? f.defaultDurationMinutes : prev.default_duration_minutes,
          f.color !== undefined ? f.color : prev.color,
          f.icon !== undefined ? f.icon : prev.icon,
          f.sortOrder !== undefined ? f.sortOrder : prev.sort_order,
          nextStatus,
        ],
      );
      return success(200, { role: rowToRole(r.rows[0]) });
    }

    // ── POST /assignments ── upsert a staff <-> role assignment ─────────────
    if (method === "POST" && segments[0] === "assignments" && segments.length === 1) {
      const payload = buildAssignmentPayload(body);
      if (payload.validationError) return error(400, "VALIDATION_ERROR", payload.validationError);
      const f = payload.fields;
      if (!(await assertOwnsStaff(client, salonId, f.staffMemberId))) return error(404, "NOT_FOUND", "Staff member not found");
      if (!(await assertOwnsRole(client, salonId, f.professionalRoleId))) return error(404, "NOT_FOUND", "Professional role not found");

      const r = await client.query(
        `INSERT INTO salon_staff_professional_roles
           (salon_id, staff_member_id, professional_role_id, is_primary, primary_service_ids, service_price_overrides)
         VALUES ($1, $2, $3, $4, $5::jsonb, $6::jsonb)
         ON CONFLICT (staff_member_id, professional_role_id)
         DO UPDATE SET is_primary = EXCLUDED.is_primary,
                       primary_service_ids = EXCLUDED.primary_service_ids,
                       service_price_overrides = EXCLUDED.service_price_overrides,
                       updated_at = now()
         RETURNING *`,
        [
          salonId,
          f.staffMemberId,
          f.professionalRoleId,
          f.isPrimary,
          JSON.stringify(f.primaryServiceIds || []),
          JSON.stringify(f.servicePriceOverrides || {}),
        ],
      );
      return success(201, { assignment: rowToAssignment(r.rows[0]) });
    }

    // ── DELETE /assignments/:id ── remove an assignment ─────────────────────
    if (method === "DELETE" && segments[0] === "assignments" && segments[1]) {
      const r = await client.query(
        `DELETE FROM salon_staff_professional_roles
         WHERE salon_id = $1 AND id = $2
         RETURNING id`,
        [salonId, segments[1]],
      );
      if (r.rows.length === 0) return error(404, "NOT_FOUND", "Assignment not found");
      return noContent();
    }

    return error(404, "NOT_FOUND", "Not found");
  } catch (err) {
    if (err.code === "23505") {
      return error(409, "DUPLICATE_ASSIGNMENT", "This staff member is already assigned to this professional role.");
    }
    if (err.code === "23503") {
      return error(400, "VALIDATION_ERROR", "Referenced staff member or role does not exist");
    }
    if (err.code === "42P01" || err.code === "42703") {
      return error(500, "SCHEMA_NOT_READY", "professional roles schema is not available; run migration 040");
    }
    console.error("[salon-professional-roles] error:", err.message);
    return error(500, "INTERNAL_ERROR", "Internal server error");
  } finally {
    if (client) await client.end().catch(() => {});
  }
};
