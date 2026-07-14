/**
 * Security & Permissions settings section.
 *
 * Three concerns, one section:
 *   1. Access-role catalog — the data-backed RBAC profiles (read-only mirror of
 *      the server matrix) so owners/managers understand what each role can do.
 *   2. Invitations — create personal single-use invites and manage their
 *      lifecycle (resend / revoke). The one-time code is shown once for
 *      out-of-band delivery.
 *   3. Member access — suspend / revoke / reactivate a member's system access
 *      without touching their staff record, appointments or history.
 *
 * Enforcement is entirely server-side; this UI reflects state and hides actions
 * the current actor cannot perform (owner safety, privilege escalation, and the
 * manage_permissions requirement are all enforced by the API).
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Copy, Loader2, Lock, Mail, Phone, RefreshCw, ShieldCheck, ShieldOff, UserCheck } from "lucide-react";
import { useCrmT } from "../../i18n/CrmLocale";
import { useStaff } from "../../data/crmHooks";
import {
  createInvitation,
  listInvitations,
  reactivateMemberAccess,
  resendInvitation,
  revokeMemberAccess,
  revokePendingInvitation,
  suspendMemberAccess,
  type Invitation,
} from "../../data/salonInvitationsApi";
import { salonApiErrorMessage, SalonApiError } from "../../data/salonApiClient";
import {
  DEFAULT_ACCESS_ROLES,
  INVITABLE_ACCESS_ROLES,
  summarizeGrants,
  useCurrentPermissions,
  type PermissionAction,
  type PermissionDomain,
} from "../../data/accessControl";
import { canCallSalonRuntimeApi } from "../../data/salonSession";
import { displayStaffName } from "../scheduleDisplayNames";
import { GhostButton, PrimaryButton, SettingsPlaceholder, StatusBadge, useSettingsStyles } from "./settingsUi";

interface Props {
  isDark: boolean;
}

const DOMAIN_LABELS_EN: Record<PermissionDomain, string> = {
  staff: "Team",
  services: "Services",
  inventory: "Inventory",
  appointments: "Appointments",
  customers: "Customers",
  settings: "Settings",
  permissions: "Permissions",
};
const DOMAIN_LABELS_HE: Record<PermissionDomain, string> = {
  staff: "צוות",
  services: "שירותים",
  inventory: "מלאי",
  appointments: "תורים",
  customers: "לקוחות",
  settings: "הגדרות",
  permissions: "הרשאות",
};
const ACTION_LABELS_EN: Record<PermissionAction, string> = {
  view: "View",
  create: "Create",
  update: "Update",
  archive: "Archive",
  approve: "Approve",
  export: "Export",
  manage_permissions: "Manage permissions",
};
const ACTION_LABELS_HE: Record<PermissionAction, string> = {
  view: "צפייה",
  create: "יצירה",
  update: "עדכון",
  archive: "ארכוב",
  approve: "אישור",
  export: "ייצוא",
  manage_permissions: "ניהול הרשאות",
};

export const SecurityPermissionsSection: React.FC<Props> = ({ isDark }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const permissions = useCurrentPermissions();
  const staff = useStaff();

  const canManage = permissions.canManagePermissions;

  return (
    <div className="space-y-4">
      {canManage ? (
        <>
          <InvitationsCard isDark={isDark} />
          <MemberAccessCard isDark={isDark} staff={staff} />
        </>
      ) : (
        <SettingsPlaceholder
          isDark={isDark}
          icon={<Lock className="h-5 w-5" />}
          title={isHebrew ? "צפייה בלבד" : "View only"}
          description={isHebrew ? "ניהול הזמנות וגישה זמין לבעלים ולמנהלים בלבד. להלן תפקידי הגישה הזמינים." : "Managing invitations and access is available to owners and managers. The available access roles are shown below."}
        />
      )}

      <AccessRolesCatalog isDark={isDark} />
    </div>
  );
};

// ── Invitations ──────────────────────────────────────────────────────────────
const InvitationsCard: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [roleKey, setRoleKey] = useState("reception");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [lastCode, setLastCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!canCallSalonRuntimeApi()) { setLoading(false); return; }
    setLoading(true);
    listInvitations()
      .then((data) => { setInvitations(data); setError(null); setForbidden(false); })
      .catch((err) => {
        if (err instanceof SalonApiError && err.status === 403) setForbidden(true);
        else setError(salonApiErrorMessage(err));
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setCreateError(null);
    if (!email.trim() && !phone.trim()) {
      setCreateError(isHebrew ? "נדרש אימייל או טלפון." : "An email or phone is required.");
      return;
    }
    setCreating(true);
    try {
      const result = await createInvitation({ email: email.trim() || undefined, phone: phone.trim() || undefined, role: roleKey });
      setLastCode(result.code);
      setEmail("");
      setPhone("");
      load();
    } catch (err) {
      setCreateError(salonApiErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  const doResend = async (id: string) => {
    setBusyId(id);
    try {
      const result = await resendInvitation(id);
      setLastCode(result.code);
      load();
    } catch (err) {
      setError(salonApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const doRevoke = async (id: string) => {
    setBusyId(id);
    try {
      await revokePendingInvitation(id);
      load();
    } catch (err) {
      setError(salonApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const copyCode = async () => {
    if (!lastCode) return;
    try { await navigator.clipboard.writeText(lastCode); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  if (forbidden) return null;

  return (
    <section className={`rounded-xl border ${s.card} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${isDark ? "bg-white/10 text-white/70" : "bg-[#F8E5D8] text-[#B05F57]"}`}><ShieldCheck className="h-4 w-4" /></span>
        <div>
          <h2 className={`text-[14px] font-black ${s.textStrong}`}>{isHebrew ? "הזמנות גישה" : "Access invitations"}</h2>
          <p className={`text-[11px] ${s.textSoft}`}>{isHebrew ? "הזמנה אישית וחד-פעמית; הקוד מוצג פעם אחת." : "Personal, single-use invites; the code is shown once."}</p>
        </div>
      </div>

      {/* Create */}
      <div className={`rounded-lg border ${s.cardSoft} p-3`}>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder={isHebrew ? "אימייל" : "Email"} type="email" className={s.input} />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder={isHebrew ? "טלפון" : "Phone"} type="tel" className={s.input} />
          <select value={roleKey} onChange={(e) => setRoleKey(e.target.value)} className={s.input}>
            {INVITABLE_ACCESS_ROLES.map((r) => <option key={r.key} value={r.key}>{r.name}</option>)}
          </select>
          <PrimaryButton onClick={create} disabled={creating || (!email.trim() && !phone.trim())}>
            {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />} {isHebrew ? "הזמן" : "Invite"}
          </PrimaryButton>
        </div>
        {createError && <p className="mt-2 text-[11px] font-bold text-[#B05F57]">{createError}</p>}
        {lastCode && (
          <div className="mt-3">
            <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "קוד חד-פעמי (מסרו לנמען):" : "One-time code (share with the invitee):"}</p>
            <div className="mt-1 flex items-center gap-2">
              <code className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-black tracking-wider ${isDark ? "bg-black/30 text-emerald-300" : "bg-[#F0F7F3] text-[#2E6B52]"}`}>{lastCode}</code>
              <GhostButton isDark={isDark} onClick={copyCode}>{copied ? <UserCheck className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? (isHebrew ? "הועתק" : "Copied") : (isHebrew ? "העתק" : "Copy")}</GhostButton>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-3">
        {loading ? (
          <div className={`flex items-center gap-2 py-6 text-[12px] font-bold ${s.textSoft}`}><Loader2 className="h-4 w-4 animate-spin" /> {isHebrew ? "טוען הזמנות…" : "Loading invitations…"}</div>
        ) : error ? (
          <SettingsPlaceholder isDark={isDark} tone="error" title={isHebrew ? "שגיאה בטעינת הזמנות" : "Could not load invitations"} description={error} action={<GhostButton isDark={isDark} onClick={load}>{isHebrew ? "נסה שוב" : "Retry"}</GhostButton>} />
        ) : invitations.length === 0 ? (
          <p className={`py-4 text-center text-[12px] font-semibold ${s.textFaint}`}>{isHebrew ? "אין הזמנות עדיין." : "No invitations yet."}</p>
        ) : (
          <div className="space-y-2">
            {invitations.map((inv) => (
              <div key={inv.id} className={`flex items-center justify-between gap-2 rounded-lg border ${s.cardSoft} px-3 py-2`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className={s.textFaint}>{inv.channel === "phone" ? <Phone className="h-3.5 w-3.5" /> : <Mail className="h-3.5 w-3.5" />}</span>
                  <span className={`truncate text-[12px] font-bold ${s.textStrong}`}>{inv.email || inv.phone || "—"}</span>
                  {inv.role && <span className={`text-[10px] font-semibold ${s.textFaint}`}>{inv.role}</span>}
                  <StatusBadge status={inv.status} isDark={isDark} />
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {inv.status === "pending" && (
                    <>
                      <GhostButton isDark={isDark} disabled={busyId === inv.id} onClick={() => doResend(inv.id)}>
                        {busyId === inv.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} {isHebrew ? "שלח שוב" : "Resend"}
                      </GhostButton>
                      <GhostButton isDark={isDark} disabled={busyId === inv.id} onClick={() => doRevoke(inv.id)}>{isHebrew ? "בטל" : "Revoke"}</GhostButton>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// ── Member access ────────────────────────────────────────────────────────────
const MemberAccessCard: React.FC<{ isDark: boolean; staff: ReturnType<typeof useStaff> }> = ({ isDark, staff }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const [statusByUser, setStatusByUser] = useState<Record<string, string>>({});
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const membersWithAccess = useMemo(() => staff.filter((m) => m.userId), [staff]);

  const run = async (userId: string, action: "suspend" | "revoke" | "reactivate") => {
    setBusyUser(userId);
    setError(null);
    try {
      const result =
        action === "suspend" ? await suspendMemberAccess(userId)
        : action === "revoke" ? await revokeMemberAccess(userId)
        : await reactivateMemberAccess(userId);
      setStatusByUser((prev) => ({ ...prev, [userId]: result.membership.status }));
    } catch (err) {
      setError(salonApiErrorMessage(err));
    } finally {
      setBusyUser(null);
    }
  };

  return (
    <section className={`rounded-xl border ${s.card} p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${isDark ? "bg-white/10 text-white/70" : "bg-[#F8E5D8] text-[#B05F57]"}`}><UserCheck className="h-4 w-4" /></span>
        <div>
          <h2 className={`text-[14px] font-black ${s.textStrong}`}>{isHebrew ? "גישה ניהולית" : "Member access"}</h2>
          <p className={`text-[11px] ${s.textSoft}`}>{isHebrew ? "השהיה/ביטול גישה אינם משפיעים על התורים או ההיסטוריה." : "Suspending or revoking access never affects appointments or history."}</p>
        </div>
      </div>

      {error && <p className="mb-2 text-[11px] font-bold text-[#B05F57]">{error}</p>}

      {membersWithAccess.length === 0 ? (
        <p className={`py-4 text-center text-[12px] font-semibold ${s.textFaint}`}>{isHebrew ? "אין עדיין אנשי צוות עם גישה למערכת." : "No team members have system access yet."}</p>
      ) : (
        <div className="space-y-2">
          {membersWithAccess.map((member) => {
            const status = statusByUser[member.userId!];
            return (
              <div key={member.id} className={`flex items-center justify-between gap-2 rounded-lg border ${s.cardSoft} px-3 py-2`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className={`truncate text-[12px] font-bold ${s.textStrong}`}>{displayStaffName(member.name, isHebrew)}</span>
                  {member.email && <span className={`truncate text-[10px] ${s.textFaint}`}>{member.email}</span>}
                  {status && <StatusBadge status={status} isDark={isDark} />}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <GhostButton isDark={isDark} disabled={busyUser === member.userId} onClick={() => run(member.userId!, "suspend")}>
                    {busyUser === member.userId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldOff className="h-3.5 w-3.5" />} {isHebrew ? "השהה" : "Suspend"}
                  </GhostButton>
                  <GhostButton isDark={isDark} disabled={busyUser === member.userId} onClick={() => run(member.userId!, "revoke")}>{isHebrew ? "בטל גישה" : "Revoke"}</GhostButton>
                  <GhostButton isDark={isDark} disabled={busyUser === member.userId} onClick={() => run(member.userId!, "reactivate")}>{isHebrew ? "הפעל" : "Reactivate"}</GhostButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

// ── Access-role catalog (read-only matrix) ───────────────────────────────────
const AccessRolesCatalog: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const domainLabels = isHebrew ? DOMAIN_LABELS_HE : DOMAIN_LABELS_EN;
  const actionLabels = isHebrew ? ACTION_LABELS_HE : ACTION_LABELS_EN;

  const toggle = (key: string) => setExpanded((prev) => {
    const next = new Set(prev);
    if (next.has(key)) next.delete(key); else next.add(key);
    return next;
  });

  return (
    <section className={`rounded-xl border ${s.card} p-4`}>
      <div className="mb-3">
        <h2 className={`text-[14px] font-black ${s.textStrong}`}>{isHebrew ? "תפקידי גישה" : "Access roles"}</h2>
        <p className={`text-[11px] ${s.textSoft}`}>{isHebrew ? "מה כל תפקיד יכול לראות או לשנות. האכיפה מתבצעת בשרת." : "What each role can see or change. Enforcement happens on the server."}</p>
      </div>
      <div className="space-y-2">
        {DEFAULT_ACCESS_ROLES.map((role) => {
          const open = expanded.has(role.key);
          const grants = summarizeGrants(role);
          return (
            <div key={role.key} className={`overflow-hidden rounded-lg border ${s.cardSoft}`}>
              <button type="button" onClick={() => toggle(role.key)} className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-start">
                <div className="min-w-0">
                  <p className={`text-[12px] font-black ${s.textStrong}`}>{role.name}</p>
                  <p className={`truncate text-[10px] font-semibold ${s.textFaint}`}>{role.description}</p>
                </div>
                <span className={s.textFaint}>{open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
              </button>
              {open && (
                <div className={`border-t px-3 py-2 ${isDark ? "border-white/10" : "border-[#EFE3DA]"}`}>
                  {role.grants.includes("*") ? (
                    <p className={`text-[11px] font-bold ${s.textSoft}`}>{isHebrew ? "גישה מלאה לכל הסלון." : "Full access across the entire salon."}</p>
                  ) : (
                    <div className="space-y-1">
                      {grants.map(({ domain, actions }) => (
                        <div key={domain} className="flex flex-wrap items-center gap-1.5">
                          <span className={`min-w-[80px] text-[11px] font-black ${s.textStrong}`}>{domainLabels[domain] ?? domain}</span>
                          {actions.map((a) => (
                            <span key={a} className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${isDark ? "bg-white/10 text-white/60" : "bg-black/[0.05] text-[#7E7066]"}`}>{actionLabels[a] ?? a}</span>
                          ))}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
