/**
 * Frontend RBAC mirror.
 *
 * IMPORTANT: this is a *reflection* of the server matrix in
 * `netlify/functions/lib/access-permissions.js`. Enforcement is deny-by-default
 * and happens on the server ONLY; this module exists purely so the UI can hide
 * actions the current actor cannot perform and render the access-role catalog.
 * It must never be treated as a security boundary.
 *
 * Keep the grants here in sync with the server's DEFAULT_ACCESS_ROLES.
 */

import { getSalonLoginState } from "./salonSession";

export type PermissionAction =
  | "view"
  | "create"
  | "update"
  | "archive"
  | "approve"
  | "export"
  | "manage_permissions";

export type PermissionScope = "self" | "assigned_staff" | "department" | "salon";

export type PermissionDomain =
  | "staff"
  | "services"
  | "inventory"
  | "appointments"
  | "customers"
  | "settings"
  | "permissions";

const SCOPE_RANK: Record<PermissionScope, number> = {
  self: 0,
  assigned_staff: 1,
  department: 2,
  salon: 3,
};

const WILDCARD_GRANT = "*";

function expandGrants(domains: string[], actions: string[], scope: PermissionScope): string[] {
  const grants: string[] = [];
  for (const domain of domains) {
    for (const action of actions) grants.push(`${domain}.${action}@${scope}`);
  }
  return grants;
}

export interface AccessRoleProfile {
  key: string;
  name: string;
  /** Short human description used by the Security & Permissions catalog. */
  description: string;
  rank: number;
  grants: string[];
}

/** The starting access profiles, mirroring the server matrix. */
export const DEFAULT_ACCESS_ROLES: AccessRoleProfile[] = [
  {
    key: "owner",
    name: "Owner",
    description: "Full control of the salon, including billing, ownership and permissions.",
    rank: 100,
    grants: [WILDCARD_GRANT],
  },
  {
    key: "manager",
    name: "Manager",
    description: "Manage the whole salon: team, catalog, inventory, appointments and customers.",
    rank: 90,
    grants: expandGrants(
      ["staff", "services", "inventory", "appointments", "customers", "settings"],
      ["view", "create", "update", "archive", "approve", "export"],
      "salon",
    ),
  },
  {
    key: "reception",
    name: "Reception",
    description: "Handle the front desk: book appointments and manage customers.",
    rank: 60,
    grants: [
      ...expandGrants(["appointments", "customers"], ["view", "create", "update"], "salon"),
      "staff.view@salon",
      "services.view@salon",
    ],
  },
  {
    key: "service_provider",
    name: "Service provider",
    description: "See and update their own appointments; view customers and services.",
    rank: 50,
    grants: [
      "appointments.view@assigned_staff",
      "appointments.update@assigned_staff",
      "customers.view@salon",
      "services.view@salon",
      "staff.view@self",
    ],
  },
  {
    key: "assistant",
    name: "Assistant",
    description: "View assigned appointments and the service catalog.",
    rank: 40,
    grants: ["appointments.view@assigned_staff", "services.view@salon", "staff.view@self"],
  },
  {
    key: "inventory",
    name: "Inventory / operations",
    description: "Manage inventory and stock; view the service catalog.",
    rank: 45,
    grants: [...expandGrants(["inventory"], ["view", "create", "update", "archive"], "salon"), "services.view@salon"],
  },
  {
    key: "viewer",
    name: "Viewer",
    description: "Read-only access across the salon.",
    rank: 10,
    grants: expandGrants(["staff", "services", "inventory", "appointments", "customers"], ["view"], "salon"),
  },
];

/** Roles that can be issued through an invitation (owner excluded for safety). */
export const INVITABLE_ACCESS_ROLES = DEFAULT_ACCESS_ROLES.filter((role) => role.key !== "owner");

const LEGACY_ROLE_ALIASES: Record<string, string> = {
  owner: "owner",
  manager: "manager",
  stylist: "service_provider",
  service_provider: "service_provider",
  reception: "reception",
  receptionist: "reception",
  assistant: "assistant",
  inventory: "inventory",
  operations: "inventory",
  viewer: "viewer",
};

const OWNER_ROLE_KEY = "owner";

export interface PermissionSet {
  role: string | null;
  roleKey: string | null;
  isOwner: boolean;
  wildcard: boolean;
  can: (domain: PermissionDomain, action: PermissionAction, scope?: PermissionScope) => boolean;
  canManagePermissions: boolean;
}

function normalizeRoleKey(role: string | null | undefined): string | null {
  if (!role) return null;
  return LEGACY_ROLE_ALIASES[String(role).trim().toLowerCase()] ?? null;
}

function grantsForRoleKey(roleKey: string | null): string[] {
  if (!roleKey) return [];
  const role = DEFAULT_ACCESS_ROLES.find((r) => r.key === roleKey);
  return role ? role.grants.slice() : [];
}

/** Resolve a permission set from a coarse role (mirrors the server resolver). */
export function resolvePermissions(role: string | null | undefined): PermissionSet {
  const roleKey = normalizeRoleKey(role);
  const grants = grantsForRoleKey(roleKey);
  const wildcard = grants.includes(WILDCARD_GRANT);
  const isOwner = wildcard || roleKey === OWNER_ROLE_KEY;

  const parsed = grants
    .map((grant) => {
      if (grant === WILDCARD_GRANT) return null;
      const at = grant.indexOf("@");
      if (at < 0) return null;
      const left = grant.slice(0, at);
      const scope = grant.slice(at + 1) as PermissionScope;
      const dot = left.indexOf(".");
      if (dot < 0) return null;
      return { domain: left.slice(0, dot), action: left.slice(dot + 1), scope };
    })
    .filter((g): g is { domain: string; action: string; scope: PermissionScope } => Boolean(g));

  const can = (domain: PermissionDomain, action: PermissionAction, scope: PermissionScope = "salon") => {
    if (wildcard) return true;
    const needed = SCOPE_RANK[scope];
    if (needed === undefined) return false;
    return parsed.some((g) => g.domain === domain && g.action === action && SCOPE_RANK[g.scope] >= needed);
  };

  return {
    role: role ?? null,
    roleKey,
    isOwner,
    wildcard,
    can,
    canManagePermissions: can("permissions", "manage_permissions", "salon"),
  };
}

/** Resolve the current signed-in actor's permission set from the login state. */
export function useCurrentPermissions(): PermissionSet {
  const state = getSalonLoginState();
  return resolvePermissions(state?.role ?? null);
}

/** Human summary of a role's coverage for the catalog view. */
export function summarizeGrants(role: AccessRoleProfile): {
  domain: PermissionDomain;
  actions: PermissionAction[];
}[] {
  if (role.grants.includes(WILDCARD_GRANT)) {
    return (["staff", "services", "inventory", "appointments", "customers", "settings", "permissions"] as PermissionDomain[]).map(
      (domain) => ({ domain, actions: ["view", "create", "update", "archive", "approve", "export", "manage_permissions"] }),
    );
  }
  const byDomain = new Map<PermissionDomain, Set<PermissionAction>>();
  for (const grant of role.grants) {
    const at = grant.indexOf("@");
    if (at < 0) continue;
    const left = grant.slice(0, at);
    const dot = left.indexOf(".");
    if (dot < 0) continue;
    const domain = left.slice(0, dot) as PermissionDomain;
    const action = left.slice(dot + 1) as PermissionAction;
    if (!byDomain.has(domain)) byDomain.set(domain, new Set());
    byDomain.get(domain)!.add(action);
  }
  return Array.from(byDomain.entries()).map(([domain, actions]) => ({ domain, actions: Array.from(actions) }));
}
