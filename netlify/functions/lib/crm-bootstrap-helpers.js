/**
 * netlify/functions/lib/crm-bootstrap-helpers.js
 * ─────────────────────────────────────────────────────────────────────────
 * Pure, dependency-free row mappers + derivation helpers for the Phase B
 * professional-role fields exposed by crm-bootstrap. Kept out of the handler
 * (which pulls in `pg`) so they can be unit-tested without a database.
 */
"use strict";

function rowToProfessionalRole(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    name: row.name,
    departmentIds: Array.isArray(row.department_ids) ? row.department_ids : [],
    allowedServiceIds: Array.isArray(row.allowed_service_ids) ? row.allowed_service_ids : [],
    stageCapabilities: Array.isArray(row.stage_capabilities) ? row.stage_capabilities : [],
    defaultPriceCents: row.default_price_cents === null || row.default_price_cents === undefined
      ? null
      : Number(row.default_price_cents),
    defaultDurationMinutes: row.default_duration_minutes === null || row.default_duration_minutes === undefined
      ? null
      : Number(row.default_duration_minutes),
    color: row.color || null,
    icon: row.icon || null,
    sortOrder: row.sort_order === null || row.sort_order === undefined ? 0 : Number(row.sort_order),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function rowToStaffProfessionalRole(row) {
  return {
    id: row.id,
    salonId: row.salon_id,
    staffMemberId: row.staff_member_id,
    professionalRoleId: row.professional_role_id,
    isPrimary: Boolean(row.is_primary),
    primaryServiceIds: Array.isArray(row.primary_service_ids) ? row.primary_service_ids : [],
    servicePriceOverrides: (row.service_price_overrides && typeof row.service_price_overrides === "object")
      ? row.service_price_overrides
      : {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Attach the derived `professionalRoleIds` list to each staff member from the
 * staff↔role assignments (primary role first, then by assignment order). Keeps
 * the mapping in one place so the client never has to re-join the two arrays
 * just to know which professional roles a staff member holds. Mutates and
 * returns the passed `staff` array.
 */
function attachProfessionalRoleIds(staff, assignments) {
  if (!Array.isArray(staff) || staff.length === 0) return staff;
  const byStaff = new Map();
  for (const a of Array.isArray(assignments) ? assignments : []) {
    if (!a || !a.staffMemberId || !a.professionalRoleId) continue;
    let list = byStaff.get(a.staffMemberId);
    if (!list) {
      list = [];
      byStaff.set(a.staffMemberId, list);
    }
    list.push(a);
  }
  for (const member of staff) {
    const list = byStaff.get(member.id);
    if (!list || list.length === 0) {
      member.professionalRoleIds = [];
      continue;
    }
    const ordered = [...list].sort((x, y) => Number(Boolean(y.isPrimary)) - Number(Boolean(x.isPrimary)));
    const seen = new Set();
    const ids = [];
    for (const a of ordered) {
      if (seen.has(a.professionalRoleId)) continue;
      seen.add(a.professionalRoleId);
      ids.push(a.professionalRoleId);
    }
    member.professionalRoleIds = ids;
  }
  return staff;
}

module.exports = {
  rowToProfessionalRole,
  rowToStaffProfessionalRole,
  attachProfessionalRoleIds,
};
