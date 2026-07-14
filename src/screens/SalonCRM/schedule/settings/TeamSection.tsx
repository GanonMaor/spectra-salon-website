/**
 * Team settings section.
 *
 * Two views behind one section: "Members" (the staff roster + the four-step
 * create/edit flow) and "Professional roles". Staff records come live from the
 * CRM store (bootstrap → salon-staff); professional roles + assignments come
 * live from the professional-roles API.
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Award, Loader2, Plus, RotateCcw, ShieldCheck, UserCog, Users, X } from "lucide-react";
import { useCrmT } from "../../i18n/CrmLocale";
import { useCRMActions, useStaff, useStaffPerformance } from "../../data/crmHooks";
import { useCRMContext } from "../../data/CRMDataProvider";
import type { ProfessionalRole, StaffMember, StaffProfessionalRole } from "../../data/crmTypes";
import { listProfessionalRoles } from "../../data/salonProfessionalRolesApi";
import { salonApiErrorMessage } from "../../data/salonApiClient";
import { useCurrentPermissions } from "../../data/accessControl";
import { canCallSalonRuntimeApi } from "../../data/salonSession";
import { useScheduleCatalog } from "../ScheduleCatalogProvider";
import { displayDepartmentName, displayStaffName } from "../scheduleDisplayNames";
import { GhostButton, IconBtn, PrimaryButton, SettingsPlaceholder, StatusBadge, initialsFromName, useSettingsStyles } from "./settingsUi";
import { CrmSkeleton } from "../../CrmPageGate";
import { StaffWizard } from "./StaffWizard";
import { ProfessionalRolesPanel } from "./ProfessionalRolesPanel";

interface Props {
  isDark: boolean;
}

type TeamView = "members" | "roles";

export const TeamSection: React.FC<Props> = ({ isDark }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const staff = useStaff();
  const performance = useStaffPerformance();
  const actions = useCRMActions();
  const permissions = useCurrentPermissions();
  const catalog = useScheduleCatalog();
  const { error: crmError, hydrated: crmHydrated, reload: reloadCrm } = useCRMContext();

  const [view, setView] = useState<TeamView>("members");
  const [archiveError, setArchiveError] = useState<string | null>(null);
  const [roles, setRoles] = useState<ProfessionalRole[]>([]);
  const [assignments, setAssignments] = useState<StaffProfessionalRole[]>([]);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [rolesError, setRolesError] = useState<string | null>(null);

  const [wizardOpen, setWizardOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const loadRoles = useCallback(() => {
    if (!canCallSalonRuntimeApi()) {
      setRolesLoading(false);
      return;
    }
    setRolesLoading(true);
    listProfessionalRoles("all")
      .then((data) => {
        setRoles(data.roles);
        setAssignments(data.assignments);
        setRolesError(null);
      })
      .catch((err) => setRolesError(salonApiErrorMessage(err)))
      .finally(() => setRolesLoading(false));
  }, []);

  useEffect(() => {
    loadRoles();
  }, [loadRoles]);

  const departments = catalog.state.departments;
  const roleById = useMemo(() => new Map(roles.map((r) => [r.id, r])), [roles]);
  const assignmentsByStaff = useMemo(() => {
    const map = new Map<string, StaffProfessionalRole[]>();
    for (const a of assignments) {
      if (!map.has(a.staffMemberId)) map.set(a.staffMemberId, []);
      map.get(a.staffMemberId)!.push(a);
    }
    return map;
  }, [assignments]);

  const summary = useMemo(() => {
    const withAccess = staff.filter((m) => m.userId).length;
    const top = [...performance].sort((a, b) => b.utilizationPct - a.utilizationPct)[0];
    return {
      total: staff.length,
      active: staff.filter((m) => m.status === "active").length,
      withAccess,
      topName: top && top.utilizationPct > 0 ? top.staff.name : null,
      topUtil: top?.utilizationPct ?? 0,
    };
  }, [staff, performance]);

  // First-load pending: no snapshot yet and no error. KPIs and the roster show
  // skeletons instead of a misleading "0 team members" / empty-state before the
  // team data has actually landed. An error is surfaced separately (never as an
  // empty state), so we only skeleton while genuinely loading.
  const teamPending = !crmHydrated && !crmError;

  const openNew = () => { setEditingStaff(null); setWizardOpen(true); };
  const openEdit = (member: StaffMember) => { setEditingStaff(member); setWizardOpen(true); };

  const archive = async (member: StaffMember) => {
    if (typeof window !== "undefined" && !window.confirm(isHebrew ? `לארכב את ${member.name}? התורים וההיסטוריה יישמרו.` : `Archive ${member.name}? Appointments and history are kept.`)) return;
    setArchiveError(null);
    const result = await actions.archiveStaff(member.id);
    if (!result.ok) {
      setArchiveError(
        isHebrew
          ? `לא ניתן היה לארכב את ${member.name}: ${result.error.message}`
          : `Couldn't archive ${member.name}: ${result.error.message}`,
      );
    }
  };

  return (
    <div className="space-y-4">
      {/* View switch */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className={`inline-flex rounded-xl border p-0.5 ${isDark ? "border-white/10 bg-white/[0.04]" : "border-[#EBDDD2] bg-[#FFFDF8]"}`}>
          {([
            { id: "members" as const, label: isHebrew ? "אנשי צוות" : "Members", icon: Users },
            { id: "roles" as const, label: isHebrew ? "תפקידים מקצועיים" : "Professional roles", icon: Award },
          ]).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setView(id)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-black transition-colors ${
                view === id ? "bg-[#D7897F] text-white" : isDark ? "text-white/55 hover:text-white/80" : "text-[#7E7066] hover:text-[#141414]"
              }`}
            >
              <Icon className="h-3.5 w-3.5" /> {label}
            </button>
          ))}
        </div>
        {view === "members" && (
          <PrimaryButton onClick={openNew}><Plus className="h-3.5 w-3.5" /> {isHebrew ? "עובד חדש" : "New member"}</PrimaryButton>
        )}
      </div>

      {view === "members" ? (
        <>
          {crmError && (
            <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-[#E7B7A6] bg-[#FCEEE9] p-3">
              <div className="flex min-w-0 items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B05F57]" />
                <p className="min-w-0 text-[11px] font-bold text-[#8A4038]">
                  {isHebrew ? "טעינת נתוני הצוות נכשלה." : "Team data could not be loaded."} {crmError}
                </p>
              </div>
              <GhostButton isDark={isDark} onClick={() => reloadCrm()}>
                <RotateCcw className="h-3.5 w-3.5" /> {isHebrew ? "נסה שוב" : "Retry"}
              </GhostButton>
            </div>
          )}
          {archiveError && (
            <div className="flex items-start justify-between gap-2 rounded-xl border border-[#E7B7A6] bg-[#FCEEE9] p-3">
              <div className="flex min-w-0 items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B05F57]" />
                <p className="min-w-0 text-[11px] font-bold text-[#8A4038]">{archiveError}</p>
              </div>
              <button type="button" onClick={() => setArchiveError(null)} className="text-[#B05F57]" aria-label={isHebrew ? "סגור" : "Dismiss"}>
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Kpi isDark={isDark} icon={Users} label={isHebrew ? "אנשי צוות" : "Team members"} value={summary.total} sub={`${summary.active} ${isHebrew ? "פעילים" : "active"}`} loading={teamPending} />
            <Kpi isDark={isDark} icon={ShieldCheck} label={isHebrew ? "עם גישה למערכת" : "With system access"} value={summary.withAccess} sub={isHebrew ? "משתמשים מקושרים" : "linked users"} loading={teamPending} />
            <Kpi isDark={isDark} icon={Award} label={isHebrew ? "מוביל/ה" : "Top performer"} value={summary.topName ?? "—"} sub={summary.topName ? `${summary.topUtil}% ${isHebrew ? "ניצולת" : "utilization"}` : (isHebrew ? "בקרוב" : "Coming soon")} loading={teamPending} />
          </div>

          {teamPending ? (
            <div className="space-y-2" aria-busy="true" aria-label={isHebrew ? "טוען אנשי צוות…" : "Loading team…"}>
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={`flex items-center gap-3 rounded-xl border ${s.card} p-3`}>
                  <CrmSkeleton isDark={isDark} className="h-11 w-11" rounded="rounded-full" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <CrmSkeleton isDark={isDark} className="h-3.5 w-40" rounded="rounded" />
                    <CrmSkeleton isDark={isDark} className="h-2.5 w-24" rounded="rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : staff.length === 0 && !crmError ? (
            <SettingsPlaceholder
              isDark={isDark}
              icon={<UserCog className="h-5 w-5" />}
              title={isHebrew ? "אין אנשי צוות עדיין" : "No team members yet"}
              description={isHebrew ? "הוסיפו את איש הצוות הראשון כדי לשבץ תורים ולנהל תפקידים." : "Add your first team member to schedule appointments and manage roles."}
              action={<PrimaryButton onClick={openNew}><Plus className="h-3.5 w-3.5" /> {isHebrew ? "עובד חדש" : "New member"}</PrimaryButton>}
            />
          ) : (
            <div className="space-y-2">
              {staff.map((member) => {
                const memberRoles = (assignmentsByStaff.get(member.id) ?? [])
                  .map((a) => roleById.get(a.professionalRoleId))
                  .filter((r): r is ProfessionalRole => Boolean(r));
                const deptNames = (member.departmentIds ?? [])
                  .map((id) => departments.find((d) => d.id === id))
                  .filter(Boolean)
                  .map((d) => displayDepartmentName(d!.name, isHebrew));
                return (
                  <div key={member.id} className={`flex items-center gap-3 rounded-xl border ${s.card} p-3`}>
                    <button type="button" onClick={() => openEdit(member)} className="flex min-w-0 flex-1 items-center gap-3 text-start">
                      <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border border-white/80 text-[13px] font-black text-white" style={{ background: member.color, boxShadow: `0 0 0 2px ${member.color}` }}>
                        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="h-full w-full object-cover" /> : initialsFromName(member.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className={`truncate text-[13px] font-black ${s.textStrong}`}>{displayStaffName(member.name, isHebrew)}</p>
                          <StatusBadge status={member.status} isDark={isDark} label={member.status === "active" ? (isHebrew ? "פעיל" : "Active") : (isHebrew ? "מושבת" : "Inactive")} />
                          {member.userId && (
                            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[9px] font-black ${isDark ? "bg-sky-400/10 text-sky-300" : "bg-[#6398A9]/20 text-[#2C5A67]"}`}>
                              <ShieldCheck className="h-2.5 w-2.5" /> {isHebrew ? "גישה" : "Access"}
                            </span>
                          )}
                        </div>
                        <p className={`mt-0.5 truncate text-[11px] font-semibold ${s.textSoft}`}>{member.role}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {deptNames.length > 0 && <span className={`text-[10px] font-bold ${s.textFaint}`}>{deptNames.join(" · ")}</span>}
                          {memberRoles.map((r) => (
                            <span key={r.id} className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black text-white" style={{ background: r.color ?? "#6398A9" }}>{r.name}</span>
                          ))}
                        </div>
                      </div>
                    </button>
                    <div className="flex shrink-0 items-center gap-2">
                      <GhostButton isDark={isDark} onClick={() => openEdit(member)}>{isHebrew ? "ערוך" : "Edit"}</GhostButton>
                      {member.status === "active" && (
                        <IconBtn isDark={isDark} danger title={isHebrew ? "השבת" : "Archive"} onClick={() => archive(member)}>
                          <span className="text-[10px] font-black">{isHebrew ? "השבת" : "Off"}</span>
                        </IconBtn>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {rolesError && (
            <p className={`text-[11px] font-semibold ${s.textFaint}`}>
              {isHebrew ? "לא ניתן לטעון תפקידים מקצועיים כרגע." : "Professional roles could not be loaded right now."}
            </p>
          )}
        </>
      ) : rolesLoading ? (
        <div className={`flex items-center justify-center gap-2 rounded-xl border ${s.card} py-10 text-[12px] font-bold ${s.textSoft}`}>
          <Loader2 className="h-4 w-4 animate-spin" /> {isHebrew ? "טוען תפקידים…" : "Loading roles…"}
        </div>
      ) : rolesError ? (
        <SettingsPlaceholder
          isDark={isDark}
          tone="error"
          title={isHebrew ? "שגיאה בטעינת תפקידים" : "Could not load roles"}
          description={rolesError}
          action={<GhostButton isDark={isDark} onClick={loadRoles}>{isHebrew ? "נסה שוב" : "Retry"}</GhostButton>}
        />
      ) : (
        <ProfessionalRolesPanel isDark={isDark} roles={roles} assignments={assignments} canManage={permissions.can("staff", "update", "salon") || permissions.isOwner} onChanged={loadRoles} />
      )}

      {wizardOpen && (
        <StaffWizard
          isDark={isDark}
          staff={editingStaff}
          roles={roles}
          assignments={assignments}
          permissions={permissions}
          onClose={() => setWizardOpen(false)}
          onSaved={loadRoles}
        />
      )}
    </div>
  );
};

const Kpi: React.FC<{ isDark: boolean; icon: React.ElementType; label: string; value: string | number; sub: string; loading?: boolean }> = ({ isDark, icon: Icon, label, value, sub, loading = false }) => {
  const s = useSettingsStyles(isDark);
  return (
    <div className={`rounded-xl border ${s.card} p-3.5`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`grid h-8 w-8 place-items-center rounded-lg ${isDark ? "bg-white/10 text-white/70" : "bg-[#F8E5D8] text-[#7E7066]"}`}><Icon className="h-4 w-4" /></span>
        <p className={`text-[10px] font-black uppercase tracking-[0.12em] ${s.textFaint}`}>{label}</p>
      </div>
      {loading ? (
        <div className="space-y-1.5 py-0.5" aria-hidden="true">
          <CrmSkeleton isDark={isDark} className="h-6 w-16" rounded="rounded" />
          <CrmSkeleton isDark={isDark} className="h-3 w-20" rounded="rounded" />
        </div>
      ) : (
        <>
          <p className={`text-xl font-black ${s.textStrong}`}>{value}</p>
          <p className={`mt-0.5 text-[11px] font-semibold ${s.textSoft}`}>{sub}</p>
        </>
      )}
    </div>
  );
};
