/**
 * Professional-roles management panel (inside the Team section).
 *
 * A professional role answers "what professional work can this person do?" —
 * departments, allowed services, split-stage capabilities, default price/time.
 * It grants NO system access. Roles use the active | inactive | archived
 * lifecycle; archiving a role still assigned to staff requires an explicit
 * force (the server returns ROLE_HAS_ASSIGNMENTS otherwise).
 */

import React, { useMemo, useState } from "react";
import { Archive, Check, Loader2, Pencil, Plus, X } from "lucide-react";
import type { ProfessionalRole, SegmentType, StaffProfessionalRole } from "../../data/crmTypes";
import { useCrmT } from "../../i18n/CrmLocale";
import { useScheduleCatalog } from "../ScheduleCatalogProvider";
import { segmentTypeLabel } from "../serviceCatalogUtils";
import { displayDepartmentName, displayServiceName } from "../scheduleDisplayNames";
import {
  createProfessionalRole,
  updateProfessionalRole,
} from "../../data/salonProfessionalRolesApi";
import { salonApiErrorMessage, SalonApiError } from "../../data/salonApiClient";
import { ColorPicker, GhostButton, IconBtn, PrimaryButton, SettingsPlaceholder, StatusBadge, useSettingsStyles } from "./settingsUi";

const STAGE_CAPABILITY_OPTIONS: SegmentType[] = ["service", "apply", "wait", "wash", "dry"];

interface Props {
  isDark: boolean;
  roles: ProfessionalRole[];
  assignments: StaffProfessionalRole[];
  canManage: boolean;
  onChanged: () => void;
}

interface RoleDraft {
  name: string;
  departmentIds: string[];
  allowedServiceIds: string[];
  stageCapabilities: SegmentType[];
  defaultPriceCents: string;
  defaultDurationMinutes: string;
  color: string;
}

function emptyDraft(): RoleDraft {
  return { name: "", departmentIds: [], allowedServiceIds: [], stageCapabilities: [], defaultPriceCents: "", defaultDurationMinutes: "", color: "#6398A9" };
}

function roleToDraft(role: ProfessionalRole): RoleDraft {
  return {
    name: role.name,
    departmentIds: role.departmentIds ?? [],
    allowedServiceIds: role.allowedServiceIds ?? [],
    stageCapabilities: role.stageCapabilities ?? [],
    defaultPriceCents: role.defaultPriceCents != null ? String(role.defaultPriceCents / 100) : "",
    defaultDurationMinutes: role.defaultDurationMinutes != null ? String(role.defaultDurationMinutes) : "",
    color: role.color ?? "#6398A9",
  };
}

export const ProfessionalRolesPanel: React.FC<Props> = ({ isDark, roles, assignments, canManage, onChanged }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const catalog = useScheduleCatalog();

  const [showArchived, setShowArchived] = useState(false);
  const [editorFor, setEditorFor] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<RoleDraft>(emptyDraft);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeDepartments = catalog.state.departments.filter((d) => d.status === "active");
  const serviceOptions = useMemo(() => {
    const active = catalog.state.services.filter((svc) => svc.status === "active");
    if (draft.departmentIds.length === 0) return active;
    const deptCategoryIds = new Set(catalog.state.categories.filter((c) => draft.departmentIds.includes(c.departmentId)).map((c) => c.id));
    return active.filter((svc) => deptCategoryIds.has(svc.categoryId));
  }, [catalog.state.services, catalog.state.categories, draft.departmentIds]);

  const visibleRoles = roles.filter((r) => showArchived || r.status !== "archived");
  const assignedCount = (roleId: string) => assignments.filter((a) => a.professionalRoleId === roleId).length;

  const openNew = () => { setDraft(emptyDraft()); setEditorFor("new"); setError(null); };
  const openEdit = (role: ProfessionalRole) => { setDraft(roleToDraft(role)); setEditorFor(role.id); setError(null); };
  const closeEditor = () => { setEditorFor(null); setDraft(emptyDraft()); setError(null); };

  const toggle = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const save = async () => {
    if (!draft.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const priceCents = draft.defaultPriceCents.trim() ? Math.round(Number(draft.defaultPriceCents) * 100) : null;
      const durationMin = draft.defaultDurationMinutes.trim() ? Math.round(Number(draft.defaultDurationMinutes)) : null;
      const base = {
        name: draft.name.trim(),
        departmentIds: draft.departmentIds,
        allowedServiceIds: draft.allowedServiceIds,
        stageCapabilities: draft.stageCapabilities,
        color: draft.color,
      };
      if (editorFor === "new") {
        await createProfessionalRole({ ...base, defaultPriceCents: priceCents ?? undefined, defaultDurationMinutes: durationMin ?? undefined });
      } else if (editorFor) {
        // On update, null explicitly clears the default price/duration.
        await updateProfessionalRole(editorFor, { ...base, defaultPriceCents: priceCents, defaultDurationMinutes: durationMin });
      }
      onChanged();
      closeEditor();
    } catch (err) {
      setError(salonApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const archiveRole = async (role: ProfessionalRole, force = false) => {
    setBusy(true);
    setError(null);
    try {
      await updateProfessionalRole(role.id, { status: "archived", ...(force ? { force: true } : {}) });
      onChanged();
    } catch (err) {
      if (err instanceof SalonApiError && err.code === "ROLE_HAS_ASSIGNMENTS") {
        const confirmForce = typeof window !== "undefined" && window.confirm(
          isHebrew
            ? "לתפקיד זה משויכים אנשי צוות. לארכב בכל זאת? השיוכים יישמרו."
            : "This role is still assigned to staff. Archive anyway? Assignments will remain.",
        );
        if (confirmForce) { setBusy(false); return archiveRole(role, true); }
      } else {
        setError(salonApiErrorMessage(err));
      }
    } finally {
      setBusy(false);
    }
  };

  const restoreRole = async (role: ProfessionalRole) => {
    setBusy(true);
    setError(null);
    try {
      await updateProfessionalRole(role.id, { status: "active" });
      onChanged();
    } catch (err) {
      setError(salonApiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (!canManage) {
    return (
      <SettingsPlaceholder
        isDark={isDark}
        title={isHebrew ? "אין הרשאה לנהל תפקידים" : "No permission to manage roles"}
        description={isHebrew ? "רק בעלים/מנהלים יכולים לערוך תפקידים מקצועיים." : "Only owners and managers can edit professional roles."}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className={`flex items-center gap-2 text-[11px] font-bold ${s.textSoft}`}>
          <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
          {isHebrew ? "הצג בארכיון" : "Show archived"}
        </label>
        <PrimaryButton onClick={openNew}><Plus className="h-3.5 w-3.5" /> {isHebrew ? "תפקיד מקצועי" : "Professional role"}</PrimaryButton>
      </div>

      {error && <p className="text-[11px] font-bold text-[#B05F57]">{error}</p>}

      {editorFor && (
        <div className={`rounded-xl border ${s.card} p-3`}>
          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <input value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} placeholder={isHebrew ? "שם התפקיד (למשל צבעית)" : "Role name (e.g. Colorist)"} className={s.input} />
            <ColorPicker value={draft.color} onChange={(color) => setDraft((p) => ({ ...p, color }))} />
          </div>

          <div className="mt-3">
            <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "מחלקות" : "Departments"}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {activeDepartments.map((d) => {
                const on = draft.departmentIds.includes(d.id);
                return (
                  <button key={d.id} type="button" onClick={() => setDraft((p) => ({ ...p, departmentIds: toggle(p.departmentIds, d.id) }))} className={`rounded-full border px-3 py-1 text-[11px] font-bold ${on ? "border-transparent bg-[#D7897F] text-white" : isDark ? "border-white/15 text-white/60" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`}>
                    {displayDepartmentName(d.name, isHebrew)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "יכולות שלב (לשירות מפוצל)" : "Stage capabilities (split services)"}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {STAGE_CAPABILITY_OPTIONS.map((cap) => {
                const on = draft.stageCapabilities.includes(cap);
                return (
                  <button key={cap} type="button" onClick={() => setDraft((p) => ({ ...p, stageCapabilities: (p.stageCapabilities.includes(cap) ? p.stageCapabilities.filter((c) => c !== cap) : [...p.stageCapabilities, cap]) }))} className={`rounded-full border px-3 py-1 text-[11px] font-bold ${on ? "border-transparent bg-[#6398A9] text-white" : isDark ? "border-white/15 text-white/60" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`}>
                    {segmentTypeLabel(t, cap)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "שירותים מותרים (ריק = הכל)" : "Allowed services (blank = all)"}</p>
            <div className="mt-1.5 grid max-h-[200px] gap-1.5 overflow-y-auto pe-1 sm:grid-cols-2">
              {serviceOptions.map((svc) => {
                const on = draft.allowedServiceIds.includes(svc.id);
                return (
                  <button key={svc.id} type="button" onClick={() => setDraft((p) => ({ ...p, allowedServiceIds: toggle(p.allowedServiceIds, svc.id) }))} className={`truncate rounded-lg border px-2.5 py-1.5 text-start text-[11px] font-bold ${on ? "border-[#D7897F] bg-[#FFF1EC] text-[#141414]" : isDark ? "border-white/10 bg-white/[0.03] text-white/60" : "border-[#EFE4DA] bg-white/70 text-[#7E7066]"}`}>
                    {displayServiceName(svc.name, isHebrew)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "מחיר ברירת מחדל (₪)" : "Default price (₪)"}</span>
              <input type="number" min={0} value={draft.defaultPriceCents} onChange={(e) => setDraft((p) => ({ ...p, defaultPriceCents: e.target.value }))} className={`mt-1 h-11 w-full ${s.input}`} placeholder={isHebrew ? "אופציונלי" : "Optional"} />
            </label>
            <label className="block">
              <span className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "משך ברירת מחדל (דק׳)" : "Default duration (min)"}</span>
              <input type="number" min={0} value={draft.defaultDurationMinutes} onChange={(e) => setDraft((p) => ({ ...p, defaultDurationMinutes: e.target.value }))} className={`mt-1 h-11 w-full ${s.input}`} placeholder={isHebrew ? "אופציונלי" : "Optional"} />
            </label>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <PrimaryButton onClick={save} disabled={busy || !draft.name.trim()}>
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} {isHebrew ? "שמירה" : "Save"}
            </PrimaryButton>
            <GhostButton isDark={isDark} onClick={closeEditor}><X className="h-3.5 w-3.5" /> {isHebrew ? "בטל" : "Cancel"}</GhostButton>
          </div>
        </div>
      )}

      {visibleRoles.length === 0 && !editorFor ? (
        <SettingsPlaceholder
          isDark={isDark}
          title={isHebrew ? "אין תפקידים מקצועיים" : "No professional roles yet"}
          description={isHebrew ? "צרו תפקיד (למשל צבעית, חופפ/ת) כדי לשייך אנשי צוות ולנהל יכולות." : "Create a role (e.g. Colorist, Wash assistant) to assign staff and manage capabilities."}
          action={<PrimaryButton onClick={openNew}><Plus className="h-3.5 w-3.5" /> {isHebrew ? "תפקיד מקצועי" : "Professional role"}</PrimaryButton>}
        />
      ) : (
        <div className="space-y-2">
          {visibleRoles.map((role) => (
            <div key={role.id} className={`flex items-center justify-between gap-2 rounded-xl border ${s.card} px-3 py-2.5`}>
              <div className="flex min-w-0 items-center gap-2">
                <span className="h-3.5 w-3.5 shrink-0 rounded-full" style={{ background: role.color ?? "#6398A9" }} />
                <span className={`truncate text-[13px] font-black ${s.textStrong}`}>{role.name}</span>
                <StatusBadge status={role.status} isDark={isDark} label={role.status === "archived" ? t.schedule.wizard.archived : role.status === "inactive" ? (isHebrew ? "לא פעיל" : "Inactive") : t.schedule.wizard.active} />
                <span className={`hidden text-[10px] font-semibold sm:inline ${s.textFaint}`}>
                  {assignedCount(role.id)} {isHebrew ? "משויכים" : "assigned"}
                  {role.stageCapabilities.length > 0 && ` · ${role.stageCapabilities.map((c) => segmentTypeLabel(t, c)).join(", ")}`}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-0.5">
                <IconBtn isDark={isDark} title={isHebrew ? "עריכה" : "Edit"} onClick={() => openEdit(role)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                {role.status === "archived" ? (
                  <IconBtn isDark={isDark} title={isHebrew ? "שחזר" : "Restore"} onClick={() => restoreRole(role)}><Check className="h-3.5 w-3.5" /></IconBtn>
                ) : (
                  <IconBtn isDark={isDark} title={isHebrew ? "ארכב" : "Archive"} onClick={() => archiveRole(role)}><Archive className="h-3.5 w-3.5" /></IconBtn>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
