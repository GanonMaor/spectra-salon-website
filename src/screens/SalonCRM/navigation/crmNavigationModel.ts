/**
 * CRM sidebar navigation model.
 *
 * The shell builds ONE memoized navigation model from the bootstrap
 * normalized snapshot (departments + role/permissions/features) — never from a
 * separate crm-services fetch. The model is presentational-only data: stable
 * string ids, an icon key the shell maps to a concrete icon, a route path, and
 * an optional accent color. Keeping it pure keeps the sidebar dimensionally
 * stable across navigations and makes navigation logic unit-testable without a
 * DOM.
 */

import type { ServiceDepartment } from "../schedule/catalogTypes";

/** Icon slots the shell resolves to concrete lucide icons. */
export type CrmNavIconKey =
  | "home"
  | "calendar"
  | "customers"
  | "rawProducts"
  | "retailProducts"
  | "settings"
  | "analytics";

export interface CrmNavItem {
  /** Stable id used for React keys AND active-state matching. */
  id: string;
  label: string;
  iconKey: CrmNavIconKey;
  path: string;
  /** Accent color for the active pill (calendars carry their own color). */
  color?: string;
  /** Department id for schedule calendar items; undefined otherwise. */
  departmentId?: string;
  /** Optional gating hooks — absent means always visible. */
  requiredPermission?: string;
  requiredFeature?: string;
  allowedRoles?: readonly string[];
}

export interface CrmNavigationModel {
  /** Flattened list in display order. */
  all: CrmNavItem[];
  /** Items shown directly in the rail (first 8). */
  primary: CrmNavItem[];
  /** Overflow items surfaced under a "More" menu. */
  more: CrmNavItem[];
}

/** Localized labels the builder needs; supplied by the shell's locale. */
export interface CrmNavigationLabels {
  home: string;
  customers: string;
  rawProducts: string;
  retailProducts: string;
  settings: string;
  analytics: string;
  /** Label for a department's calendar entry. */
  scheduleCalendar: (department: ServiceDepartment) => string;
  /** Label for the single fallback calendar when no departments exist. */
  fallbackCalendar: string;
}

export interface CrmNavigationColors {
  hair: string;
  cosmetics: string;
}

export interface BuildCrmNavigationParams {
  /** Departments from the bootstrap catalog (single source of truth). */
  departments: ServiceDepartment[];
  labels: CrmNavigationLabels;
  colors: CrmNavigationColors;
  role?: string | null;
  permissions?: readonly string[];
  features?: Record<string, boolean>;
}

const PRIMARY_LIMIT = 8;

function sortDepartments(departments: ServiceDepartment[]): ServiceDepartment[] {
  return [...departments].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name),
  );
}

function isVisible(
  item: CrmNavItem,
  role: string | null | undefined,
  permissions: readonly string[] | undefined,
  features: Record<string, boolean> | undefined,
): boolean {
  if (item.requiredFeature && features && features[item.requiredFeature] === false) return false;
  if (item.requiredPermission && permissions && !permissions.includes(item.requiredPermission)) return false;
  if (item.allowedRoles && role && !item.allowedRoles.includes(role)) return false;
  return true;
}

/**
 * Build the sidebar navigation model from the bootstrap snapshot. Pure and
 * deterministic: given the same inputs it always returns the same ids/paths so
 * the shell can memoize it and keep the rail stable across renders.
 */
export function buildCrmNavigation(params: BuildCrmNavigationParams): CrmNavigationModel {
  const { departments, labels, colors, role, permissions, features } = params;

  const activeDepartments = sortDepartments(
    departments.filter((department) => department.status === "active"),
  );

  const scheduleItems: CrmNavItem[] = activeDepartments.map((department, index) => ({
    id: `schedule-${department.id}`,
    label: labels.scheduleCalendar(department),
    iconKey: "calendar",
    path: `/crm/schedule?calendar=${encodeURIComponent(department.id)}`,
    color: department.calendarColor || (index === 0 ? colors.hair : colors.cosmetics),
    departmentId: department.id,
  }));

  const calendarItems: CrmNavItem[] = scheduleItems.length > 0
    ? scheduleItems
    : [{
        id: "schedule-default",
        label: labels.fallbackCalendar,
        iconKey: "calendar",
        path: "/crm/schedule",
        color: colors.hair,
      }];

  const items: CrmNavItem[] = [
    { id: "home", label: labels.home, iconKey: "home", path: "/crm/home" },
    ...calendarItems,
    { id: "customers", label: labels.customers, iconKey: "customers", path: "/crm/customers" },
    { id: "raw-products", label: labels.rawProducts, iconKey: "rawProducts", path: "/crm/inventory?segment=raw-materials" },
    { id: "retail-products", label: labels.retailProducts, iconKey: "retailProducts", path: "/crm/inventory?segment=retail" },
    { id: "settings", label: labels.settings, iconKey: "settings", path: "/crm/schedule?tab=settings&section=catalog" },
    { id: "analytics", label: labels.analytics, iconKey: "analytics", path: "/crm/analytics" },
  ].filter((item) => isVisible(item, role, permissions, features));

  return {
    all: items,
    primary: items.slice(0, PRIMARY_LIMIT),
    more: items.slice(PRIMARY_LIMIT),
  };
}
