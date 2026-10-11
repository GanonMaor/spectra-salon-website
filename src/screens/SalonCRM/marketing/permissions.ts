/**
 * Marketing permissions (UI mirror only — production enforcement belongs on
 * the server, see PRODUCTION_WIRING.md).
 *
 * The owner has full control. A manager gets access only when explicitly
 * permitted, and editing drafts is a separate grant from publishing or
 * switching an automation on/off.
 */

import type { MarketingActorRole, MarketingMode } from "./types";

export type MarketingAccessRole = MarketingActorRole | "none";

export interface MarketingPermissions {
  role: MarketingAccessRole;
  canView: boolean;
  canEditDrafts: boolean;
  canPublish: boolean;
  canToggle: boolean;
  canManageSettings: boolean;
  canSendTest: boolean;
  canCancelMessages: boolean;
  canResetDemo: boolean;
}

export function permissionsForRole(role: MarketingAccessRole): MarketingPermissions {
  const base: MarketingPermissions = {
    role,
    canView: false,
    canEditDrafts: false,
    canPublish: false,
    canToggle: false,
    canManageSettings: false,
    canSendTest: false,
    canCancelMessages: false,
    canResetDemo: false,
  };
  switch (role) {
    case "owner":
      return {
        ...base,
        canView: true,
        canEditDrafts: true,
        canPublish: true,
        canToggle: true,
        canManageSettings: true,
        canSendTest: true,
        canCancelMessages: true,
        canResetDemo: true,
      };
    case "manager_publisher":
      return {
        ...base,
        canView: true,
        canEditDrafts: true,
        canPublish: true,
        canToggle: true,
        canSendTest: true,
        canCancelMessages: true,
        canResetDemo: true,
      };
    case "manager_editor":
      return { ...base, canView: true, canEditDrafts: true, canResetDemo: true };
    case "viewer":
      return { ...base, canView: true };
    default:
      return base;
  }
}

/**
 * Salon mode maps the CRM login role. Managers are edit-only until the CRM
 * stores an explicit marketing publish grant. Demo mode lets the presenter
 * switch roles to show the separation.
 */
export function resolveMarketingRole(
  mode: MarketingMode,
  crmRole: string | null | undefined,
  actingRole: MarketingActorRole | undefined,
): MarketingAccessRole {
  if (mode === "demo") return actingRole ?? "owner";
  const normalized = String(crmRole ?? "").trim().toLowerCase();
  if (normalized === "owner") return "owner";
  if (normalized === "manager") return "manager_editor";
  return "none";
}

export function actorLabel(role: MarketingAccessRole, lang: "he" | "en"): string {
  const labels: Record<MarketingAccessRole, { he: string; en: string }> = {
    owner: { he: "בעלת הסלון", en: "Salon owner" },
    manager_publisher: { he: "מנהלת (עריכה ופרסום)", en: "Manager (edit & publish)" },
    manager_editor: { he: "מנהלת (עריכה בלבד)", en: "Manager (edit only)" },
    viewer: { he: "קבלה (צפייה בלבד)", en: "Front desk (view only)" },
    none: { he: "ללא הרשאה", en: "No access" },
  };
  return labels[role][lang];
}
