/**
 * professionalRoles.ts — professional-role capability & precedence helpers.
 *
 * Phase B of the settings/permissions plan. These pure functions answer two
 * booking-time questions without any hard-coded role ids:
 *
 *   1. Capability — can this staff member perform a given split stage
 *      (e.g. `wash`)? This replaces the legacy `roleId === "role-shampoo-
 *      assistant"` heuristic used by the calendar.
 *
 *   2. Precedence — for a staff member performing a service, which price and
 *      duration apply? The unambiguous chain (low → high precedence) is:
 *
 *        Service default → Professional-role default
 *          → Staff-specific override → Appointment-specific override
 *
 *      A manual per-staff service block always wins over any role permission.
 *      When several roles allow the same service, a role marked primary for
 *      that service is chosen; if none is marked, a conflict is surfaced for
 *      resolution instead of silently picking one.
 *
 * The helpers are intentionally decoupled from the CRM state shape: callers
 * pass the minimal data they hold. During the migration to full professional-
 * role state, `roleLookup` may be omitted and the capability helpers fall back
 * to the legacy role-id heuristic, preserving current calendar behaviour.
 */

import type {
  ProfessionalRole,
  SegmentType,
  StaffProfessionalRole,
} from "./crmTypes";

/** Legacy single-role id that historically identified wash-only assistants. */
export const LEGACY_WASH_ASSISTANT_ROLE_ID = "role-shampoo-assistant";

/** The split stage a wash assistant covers. */
export const WASH_STAGE: SegmentType = "wash";

/** Stage that represents primary (chair) service work. */
export const PRIMARY_SERVICE_STAGE: SegmentType = "service";

/** Minimal staff shape the capability/precedence helpers rely on. */
export interface CapabilityStaff {
  roleId?: string;
  professionalRoleIds?: string[];
  stageCapabilities?: SegmentType[];
  serviceIds?: string[];
  blockedServiceIds?: string[];
  servicePriceOverrides?: Record<string, number>;
}

/** Resolves a professional role by id (typically backed by CRM state). */
export type RoleLookup = (roleId: string) => ProfessionalRole | undefined;

/**
 * Collect the explicit split-stage capabilities for a staff member from their
 * direct `stageCapabilities` and any active professional roles resolved via
 * `roleLookup`. The legacy `roleId` is NOT consulted here; that fallback lives
 * in `isWashAssistant` so capability derivation stays data-driven.
 */
export function deriveStageCapabilities(
  staff: CapabilityStaff | null | undefined,
  roleLookup?: RoleLookup,
): Set<SegmentType> {
  const caps = new Set<SegmentType>();
  if (!staff) return caps;
  for (const cap of staff.stageCapabilities ?? []) caps.add(cap);
  if (roleLookup) {
    for (const roleId of staff.professionalRoleIds ?? []) {
      const role = roleLookup(roleId);
      if (!role || role.status !== "active") continue;
      for (const cap of role.stageCapabilities ?? []) caps.add(cap);
    }
  }
  return caps;
}

/** True when the staff member covers the given split stage. */
export function staffHasStageCapability(
  staff: CapabilityStaff | null | undefined,
  stage: SegmentType,
  roleLookup?: RoleLookup,
): boolean {
  return deriveStageCapabilities(staff, roleLookup).has(stage);
}

/**
 * True when the staff member is a wash-only assistant: covers the `wash` stage
 * but not primary chair-service work. Falls back to the legacy role-id
 * heuristic when no explicit capability data is available, so calendars behave
 * identically until professional-role state is fully wired in.
 */
export function isWashAssistant(
  staff: CapabilityStaff | null | undefined,
  roleLookup?: RoleLookup,
): boolean {
  if (!staff) return false;
  const caps = deriveStageCapabilities(staff, roleLookup);
  if (caps.size > 0) {
    return caps.has(WASH_STAGE) && !caps.has(PRIMARY_SERVICE_STAGE);
  }
  return staff.roleId === LEGACY_WASH_ASSISTANT_ROLE_ID;
}

/**
 * True when the staff member can be booked for primary chair-service work.
 * The complement of `isWashAssistant`, preserving the calendar's split between
 * the primary and wash sub-calendars.
 */
export function isPrimaryServiceProvider(
  staff: CapabilityStaff | null | undefined,
  roleLookup?: RoleLookup,
): boolean {
  return !isWashAssistant(staff, roleLookup);
}

// ── Precedence resolution ──────────────────────────────────────────

export interface ServicePlanService {
  id: string;
  defaultPriceCents: number;
  defaultDurationMinutes: number;
}

/** A professional role the staff member holds, plus this staff's assignment. */
export interface StaffRoleBinding {
  role: ProfessionalRole;
  assignment?: StaffProfessionalRole;
}

export interface AppointmentServiceOverride {
  priceCents?: number | null;
  durationMinutes?: number | null;
}

export type ServicePlanSource = "appointment" | "staff" | "role" | "service";

export interface ResolvedServicePlan {
  serviceId: string;
  /** Whether the staff member may perform the service at all. */
  allowed: boolean;
  /** Whether a manual per-staff block prevents the service. */
  blocked: boolean;
  priceCents: number;
  durationMinutes: number;
  priceSource: ServicePlanSource;
  durationSource: ServicePlanSource;
  /** The professional role whose defaults were applied, if any. */
  roleId?: string;
  /**
   * Present when several roles allow the service and none is marked primary
   * for it. Callers should surface this for resolution rather than guess.
   */
  conflict?: { reason: "ambiguous-role"; roleIds: string[] };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Choose the professional role that applies for a service among the bindings
 * that allow it. Returns the chosen binding, or a conflict when the choice is
 * ambiguous. A single allowing role is chosen directly; with several, a role
 * marked primary for the service wins; otherwise the choice is ambiguous.
 */
export function selectRoleForService(
  serviceId: string,
  bindings: StaffRoleBinding[],
): { binding?: StaffRoleBinding; conflict?: { reason: "ambiguous-role"; roleIds: string[] } } {
  const candidates = bindings.filter(
    (b) =>
      b.role.status === "active" &&
      Array.isArray(b.role.allowedServiceIds) &&
      b.role.allowedServiceIds.includes(serviceId),
  );
  if (candidates.length === 0) return {};
  if (candidates.length === 1) return { binding: candidates[0] };

  const primaryForService = candidates.filter((b) =>
    (b.assignment?.primaryServiceIds ?? []).includes(serviceId),
  );
  if (primaryForService.length === 1) return { binding: primaryForService[0] };

  const contenders = primaryForService.length > 1 ? primaryForService : candidates;
  return {
    conflict: { reason: "ambiguous-role", roleIds: contenders.map((b) => b.role.id) },
  };
}

/**
 * Resolve the effective price/duration (and permission) for a staff member
 * performing a service, applying the documented precedence chain. `bindings`
 * are the professional roles the staff member holds; omit them to resolve
 * against service defaults and staff/appointment overrides only.
 */
export function resolveServicePlan(args: {
  service: ServicePlanService;
  staff: CapabilityStaff;
  bindings?: StaffRoleBinding[];
  appointmentOverride?: AppointmentServiceOverride;
}): ResolvedServicePlan {
  const { service, staff } = args;
  const bindings = args.bindings ?? [];
  const override = args.appointmentOverride;
  const serviceId = service.id;

  const blocked = (staff.blockedServiceIds ?? []).includes(serviceId);

  // A manual block wins over every role permission. Fall back to service
  // defaults so callers still have sane numbers to display.
  if (blocked) {
    return {
      serviceId,
      allowed: false,
      blocked: true,
      priceCents: service.defaultPriceCents,
      durationMinutes: service.defaultDurationMinutes,
      priceSource: "service",
      durationSource: "service",
    };
  }

  const { binding, conflict } = selectRoleForService(serviceId, bindings);
  const role = binding?.role;
  const assignment = binding?.assignment;

  const roleAllows = bindings.some(
    (b) => b.role.status === "active" && (b.role.allowedServiceIds ?? []).includes(serviceId),
  );
  const staffHasConstraints = Array.isArray(staff.serviceIds) && staff.serviceIds.length > 0;
  const staffExplicitlyAllows = staffHasConstraints
    ? staff.serviceIds!.includes(serviceId)
    : true;
  const allowed = staffExplicitlyAllows || roleAllows;

  // ── Price precedence: appointment → staff → role → service ──────────────
  const staffPriceOverride = staff.servicePriceOverrides?.[serviceId];
  const assignmentPriceOverride = assignment?.servicePriceOverrides?.[serviceId];
  let priceCents = service.defaultPriceCents;
  let priceSource: ServicePlanSource = "service";
  if (role && isNumber(role.defaultPriceCents)) {
    priceCents = role.defaultPriceCents;
    priceSource = "role";
  }
  if (isNumber(assignmentPriceOverride)) {
    priceCents = assignmentPriceOverride;
    priceSource = "staff";
  }
  if (isNumber(staffPriceOverride)) {
    priceCents = staffPriceOverride;
    priceSource = "staff";
  }
  if (override && isNumber(override.priceCents)) {
    priceCents = override.priceCents;
    priceSource = "appointment";
  }

  // ── Duration precedence: appointment → role → service ───────────────────
  let durationMinutes = service.defaultDurationMinutes;
  let durationSource: ServicePlanSource = "service";
  if (role && isNumber(role.defaultDurationMinutes)) {
    durationMinutes = role.defaultDurationMinutes;
    durationSource = "role";
  }
  if (override && isNumber(override.durationMinutes)) {
    durationMinutes = override.durationMinutes;
    durationSource = "appointment";
  }

  return {
    serviceId,
    allowed,
    blocked: false,
    priceCents,
    durationMinutes,
    priceSource,
    durationSource,
    ...(role ? { roleId: role.id } : {}),
    ...(conflict ? { conflict } : {}),
  };
}
