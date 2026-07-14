/**
 * Services & Departments settings section.
 *
 * A single department-first accordion that unifies what used to be four flat
 * tabs (departments, categories, services, resources): every department expands
 * to reveal its categories, the services nested under each category, and the
 * resources scoped to (or shared with) it. All writes go through the live
 * `ScheduleCatalogProvider`, which persists to the `crm-services` API. Archive
 * (never delete) keeps existing appointments stable.
 */

import React, { useMemo, useState } from "react";
import {
  Archive,
  AlertTriangle,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import type { ServiceCategoryId, SegmentType } from "../../data/crmTypes";
import { useCrmT } from "../../i18n/CrmLocale";
import type { CrmTranslations } from "../../i18n/translations";
import { useScheduleCatalog } from "../ScheduleCatalogProvider";
import type { CatalogService, ResourceType, ServiceStageDefinition } from "../catalogTypes";
import { generateDefaultStages, resourceTypeLabel, segmentTypeLabel } from "../serviceCatalogUtils";
import { minutesToLabel, formatPriceCents } from "../bookingFlowUtils";
import { CALENDAR_DESIGN_COLORS, defaultServiceColor } from "../scheduleDesign";
import { displayCategoryName, displayDepartmentName, displayResourceName, displayServiceName } from "../scheduleDisplayNames";
import { ColorPicker, GhostButton, IconBtn, PrimaryButton, SettingsPlaceholder, StatusBadge, useSettingsStyles } from "./settingsUi";

const CRM_CATEGORY_IDS: ServiceCategoryId[] = ["color", "highlights", "toner", "straightening", "treatment", "cut", "other"];
const RESOURCE_TYPES: ResourceType[] = ["chair", "wash-station", "treatment-room", "color-station", "other"];
const EDITABLE_SEGMENT_TYPES: SegmentType[] = ["service", "apply", "wait", "wash", "dry"];

function crmCategoryLabel(t: CrmTranslations, id: ServiceCategoryId): string {
  const map: Record<ServiceCategoryId, string> = {
    color: t.schedule.catColor,
    highlights: t.schedule.catHighlights,
    toner: t.schedule.catToner,
    straightening: t.schedule.catStraightening,
    treatment: t.schedule.catTreatment,
    cut: t.schedule.catCut,
    other: t.schedule.catOther,
  };
  return map[id] ?? id;
}

interface Props {
  isDark: boolean;
}

export const ServicesDepartmentsSection: React.FC<Props> = ({ isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);

  const [showArchived, setShowArchived] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [newDeptName, setNewDeptName] = useState("");
  const [newDeptColor, setNewDeptColor] = useState<string>(CALENDAR_DESIGN_COLORS.peche);
  const [editDeptId, setEditDeptId] = useState<string | null>(null);
  const [editDeptName, setEditDeptName] = useState("");

  const departments = useMemo(
    () =>
      [...catalog.state.departments]
        .filter((d) => showArchived || d.status !== "archived")
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name)),
    [catalog.state.departments, showArchived],
  );

  const sharedResources = useMemo(
    () => catalog.state.resources.filter((r) => (showArchived || r.status !== "archived") && !r.departmentId),
    [catalog.state.resources, showArchived],
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const moveDepartment = (departmentId: string, direction: -1 | 1) => {
    const ordered = departments;
    const index = ordered.findIndex((d) => d.id === departmentId);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;
    const reordered = [...ordered];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, moved);
    reordered.forEach((department, orderIndex) => {
      if (department.sortOrder !== orderIndex) catalog.updateDepartment(department.id, { sortOrder: orderIndex });
    });
  };

  const addDepartment = () => {
    const name = newDeptName.trim();
    if (!name) return;
    catalog.createDepartment(name, undefined, newDeptColor);
    setNewDeptName("");
  };

  const { loading, loadError, writeError } = catalog.status;

  return (
    <div className="space-y-4">
      {/* Write-failure banner: an optimistic change could not be persisted. */}
      {writeError && (
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-[#E7B7A6] bg-[#FCEEE9] p-3">
          <div className="flex min-w-0 items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#B05F57]" />
            <p className="min-w-0 text-[11px] font-bold text-[#8A4038]">{writeError}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <GhostButton isDark={isDark} onClick={() => { catalog.clearWriteError(); catalog.reload(); }}>
              <RotateCcw className="h-3.5 w-3.5" /> {isHebrew ? "רענן" : "Reload"}
            </GhostButton>
            <button type="button" onClick={catalog.clearWriteError} className="text-[#B05F57]" aria-label={isHebrew ? "סגור" : "Dismiss"}>
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Add department + archived toggle */}
      <div className={`rounded-xl border ${s.card} p-3`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={`text-[12px] font-black ${s.textStrong}`}>{isHebrew ? "מחלקות ושירותים" : "Departments & services"}</p>
          <label className={`flex items-center gap-2 text-[11px] font-bold ${s.textSoft}`}>
            <input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />
            {isHebrew ? "הצג בארכיון" : "Show archived"}
          </label>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
          <input
            value={newDeptName}
            onChange={(e) => setNewDeptName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDepartment()}
            placeholder={t.schedule.wizard.newDepartmentName}
            className={s.input}
            disabled={loading}
          />
          <ColorPicker value={newDeptColor} onChange={setNewDeptColor} />
          <PrimaryButton onClick={addDepartment} disabled={loading || !newDeptName.trim()}>
            <Plus className="h-3.5 w-3.5" /> {isHebrew ? "מחלקה" : "Department"}
          </PrimaryButton>
        </div>
      </div>

      {loading ? (
        <div className={`flex items-center justify-center gap-2 rounded-xl border ${s.card} py-10 text-[12px] font-bold ${s.textSoft}`}>
          <Loader2 className="h-4 w-4 animate-spin" /> {isHebrew ? "טוען קטלוג…" : "Loading catalog…"}
        </div>
      ) : loadError ? (
        <SettingsPlaceholder
          isDark={isDark}
          tone="error"
          title={isHebrew ? "שגיאה בטעינת הקטלוג" : "Could not load the catalog"}
          description={isHebrew ? "לא ניתן לטעון מחלקות ושירותים כרגע." : "Departments and services could not be loaded right now."}
          action={<GhostButton isDark={isDark} onClick={catalog.reload}><RotateCcw className="h-3.5 w-3.5" /> {isHebrew ? "נסה שוב" : "Retry"}</GhostButton>}
        />
      ) : departments.length === 0 ? (
        <SettingsPlaceholder
          isDark={isDark}
          icon={<Layers className="h-5 w-5" />}
          title={isHebrew ? "אין מחלקות עדיין" : "No departments yet"}
          description={
            isHebrew
              ? "צרו מחלקה ראשונה (למשל שיער או קוסמטיקה) כדי לארגן קטגוריות, שירותים ומשאבים."
              : "Create your first department (e.g. Hair or Cosmetics) to organize categories, services and resources."
          }
        />
      ) : (
        <div className="space-y-2">
          {departments.map((dept, index) => {
            const isOpen = expanded.has(dept.id);
            const deptCategories = catalog.state.categories.filter(
              (c) => c.departmentId === dept.id && (showArchived || c.status !== "archived"),
            );
            const deptCategoryIds = new Set(deptCategories.map((c) => c.id));
            const deptServiceCount = catalog.state.services.filter(
              (svc) => deptCategoryIds.has(svc.categoryId) && svc.status !== "archived",
            ).length;
            const deptResources = catalog.state.resources.filter(
              (r) => r.departmentId === dept.id && (showArchived || r.status !== "archived"),
            );
            return (
              <div
                key={dept.id}
                className={`overflow-hidden rounded-xl border-[1.5px] shadow-[0_1px_4px_rgba(0,0,0,0.05)] ${s.card}`}
              >
                {/* Department header */}
                <div
                  className={`flex items-center justify-between gap-2 px-3 py-3 ${
                    isDark ? "bg-white/[0.035]" : "bg-[#F5E8DD]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleExpand(dept.id)}
                    className="flex min-w-0 flex-1 items-center gap-2 text-start"
                    aria-expanded={isOpen}
                  >
                    <span className={s.textFaint}>{isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}</span>
                    <span className={`grid h-6 min-w-[1.6rem] place-items-center rounded-md px-1.5 text-[10px] font-black ${isDark ? "bg-white/10 text-white/65" : "bg-[#F8E5D8] text-[#7E7066]"}`}>
                      #{index + 1}
                    </span>
                    <span className="h-3.5 w-3.5 shrink-0 rounded-full ring-2 ring-white/80" style={{ background: dept.calendarColor ?? CALENDAR_DESIGN_COLORS.nectarine }} />
                    {editDeptId === dept.id ? (
                      <input
                        value={editDeptName}
                        onChange={(e) => setEditDeptName(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        className={`flex-1 ${s.input}`}
                      />
                    ) : (
                      <span className={`truncate text-[13px] font-black ${s.textStrong}`}>{displayDepartmentName(dept.name, isHebrew)}</span>
                    )}
                    <StatusBadge status={dept.status} isDark={isDark} label={dept.status === "archived" ? t.schedule.wizard.archived : t.schedule.wizard.active} />
                    <span className={`hidden truncate text-[10px] font-semibold sm:inline ${s.textFaint}`}>
                      {deptCategories.length} {isHebrew ? "קטגוריות" : "categories"} · {deptServiceCount} {isHebrew ? "שירותים" : "services"}
                    </span>
                  </button>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {editDeptId === dept.id ? (
                      <>
                        <ColorPicker value={dept.calendarColor ?? CALENDAR_DESIGN_COLORS.nectarine} onChange={(color) => catalog.updateDepartment(dept.id, { calendarColor: color })} compact />
                        <IconBtn isDark={isDark} title={isHebrew ? "שמור" : "Save"} onClick={() => { catalog.updateDepartment(dept.id, { name: editDeptName.trim() || dept.name, calendarLabel: editDeptName.trim() || dept.calendarLabel || dept.name }); setEditDeptId(null); }}><Check className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn isDark={isDark} title={isHebrew ? "בטל" : "Cancel"} onClick={() => setEditDeptId(null)}><X className="h-3.5 w-3.5" /></IconBtn>
                      </>
                    ) : (
                      <>
                        <IconBtn isDark={isDark} disabled={index === 0} title={isHebrew ? "העבר למעלה" : "Move up"} onClick={() => moveDepartment(dept.id, -1)}><ChevronUp className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn isDark={isDark} disabled={index === departments.length - 1} title={isHebrew ? "העבר למטה" : "Move down"} onClick={() => moveDepartment(dept.id, 1)}><ChevronDown className="h-3.5 w-3.5" /></IconBtn>
                        <IconBtn isDark={isDark} title={isHebrew ? "עריכה" : "Edit"} onClick={() => { setEditDeptId(dept.id); setEditDeptName(dept.name); }}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                        {dept.status === "archived" ? (
                          <IconBtn isDark={isDark} title={isHebrew ? "שחזר" : "Restore"} onClick={() => catalog.updateDepartment(dept.id, { status: "active" })}><Check className="h-3.5 w-3.5" /></IconBtn>
                        ) : (
                          <IconBtn isDark={isDark} title={isHebrew ? "ארכב" : "Archive"} onClick={() => catalog.archiveDepartment(dept.id)}><Archive className="h-3.5 w-3.5" /></IconBtn>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {isOpen && (
                  <div className={`border-t px-3 py-3 ${isDark ? "border-white/[0.08] bg-black/10" : "border-[#EFE3DA] bg-[#FFF8F0]/60"}`}>
                    <CategoriesForDepartment departmentId={dept.id} isDark={isDark} showArchived={showArchived} />
                    <ResourcesForDepartment departmentId={dept.id} resources={deptResources} isDark={isDark} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Shared resources (not scoped to a department) */}
      <SharedResources resources={sharedResources} isDark={isDark} />

      <p className={`text-[11px] ${s.textFaint}`}>{t.schedule.wizard.archivedNote}</p>
    </div>
  );
};

// ── Categories (+ nested services) for a department ──────────────────────────
const CategoriesForDepartment: React.FC<{ departmentId: string; isDark: boolean; showArchived: boolean }> = ({ departmentId, isDark, showArchived }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const [name, setName] = useState("");
  const [crmCat, setCrmCat] = useState<ServiceCategoryId>("color");
  const [accentColor, setAccentColor] = useState(defaultServiceColor("color"));
  const [adding, setAdding] = useState(false);

  const categories = catalog.state.categories.filter(
    (c) => c.departmentId === departmentId && (showArchived || c.status !== "archived"),
  );

  const addCategory = () => {
    if (!name.trim()) return;
    catalog.createCategory({ name: name.trim(), departmentId, accentColor, crmCategoryId: crmCat });
    setName("");
    setAdding(false);
  };

  return (
    <div className="space-y-2">
      {categories.length === 0 && (
        <p className={`text-[11px] font-semibold ${s.textFaint}`}>{isHebrew ? "אין קטגוריות במחלקה זו." : "No categories in this department."}</p>
      )}
      {categories.map((cat) => (
        <div
          key={cat.id}
          className={`rounded-xl border p-2.5 ${
            isDark
              ? "border-white/[0.10] bg-white/[0.045]"
              : "border-[#E7D6CB] bg-[#FCF2EC] shadow-[inset_0_1px_0_rgba(255,255,255,0.72)]"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: cat.accentColor }} />
              <span className={`truncate text-[12px] font-black ${s.textStrong}`}>{displayCategoryName(cat.name, cat.crmCategoryId, isHebrew)}</span>
              <StatusBadge status={cat.status} isDark={isDark} label={cat.status === "archived" ? t.schedule.wizard.archived : t.schedule.wizard.active} />
            </div>
            <div className="flex items-center gap-0.5">
              <ColorPicker value={cat.accentColor} onChange={(color) => catalog.updateCategory(cat.id, { accentColor: color })} compact />
              {cat.status === "archived" ? (
                <IconBtn isDark={isDark} title={isHebrew ? "שחזר" : "Restore"} onClick={() => catalog.updateCategory(cat.id, { status: "active" })}><Check className="h-3.5 w-3.5" /></IconBtn>
              ) : (
                <IconBtn isDark={isDark} title={isHebrew ? "ארכב" : "Archive"} onClick={() => catalog.archiveCategory(cat.id)}><Archive className="h-3.5 w-3.5" /></IconBtn>
              )}
            </div>
          </div>
          <ServicesForCategory categoryId={cat.id} crmCategoryId={cat.crmCategoryId ?? "other"} accentColor={cat.accentColor} isDark={isDark} showArchived={showArchived} />
        </div>
      ))}

      {adding ? (
        <div className={`grid gap-2 rounded-lg border ${s.cardSoft} p-2.5 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto_auto]`}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.categoryNamePlaceholder} className={s.input} />
          <select value={crmCat} onChange={(e) => { const next = e.target.value as ServiceCategoryId; setCrmCat(next); setAccentColor(defaultServiceColor(next)); }} className={s.input}>
            {CRM_CATEGORY_IDS.map((c) => <option key={c} value={c}>{crmCategoryLabel(t, c)}</option>)}
          </select>
          <ColorPicker value={accentColor} onChange={setAccentColor} />
          <div className="flex items-center gap-1">
            <PrimaryButton onClick={addCategory} disabled={!name.trim()}><Check className="h-3.5 w-3.5" /></PrimaryButton>
            <GhostButton isDark={isDark} onClick={() => { setAdding(false); setName(""); }}><X className="h-3.5 w-3.5" /></GhostButton>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`text-[11px] font-black ${isDark ? "text-white/60 hover:text-white" : "text-[#B05F57] hover:text-[#8A4038]"}`}>
          + {isHebrew ? "קטגוריה" : "Add category"}
        </button>
      )}
    </div>
  );
};

// ── Services nested under a category ─────────────────────────────────────────
type ServiceDraft = {
  name: string;
  durationMinutes: number;
  price: number;
  mode: "regular" | "split";
  stages: ServiceStageDefinition[];
};

function isSplitService(stages: ServiceStageDefinition[]): boolean {
  return stages.length > 1 || stages.some((stage) => stage.segmentType !== "service" || !stage.isActiveStaffTime);
}

function buildRegularStages(service: Pick<CatalogService, "id" | "name" | "defaultDurationMinutes">, idFactory: () => string): ServiceStageDefinition[] {
  return [{
    id: `${service.id}-regular-stage-${idFactory()}`,
    label: service.name,
    segmentType: "service",
    durationMinutes: Math.max(5, service.defaultDurationMinutes || 30),
    isActiveStaffTime: true,
    sortOrder: 0,
  }];
}

function normalizeDraftStages(stages: ServiceStageDefinition[], idFactory: () => string): ServiceStageDefinition[] {
  const valid = stages.filter((stage) => stage.label.trim() && stage.durationMinutes > 0);
  const source = valid.length > 0 ? valid : [{ id: idFactory(), label: "Service", segmentType: "service" as const, durationMinutes: 30, isActiveStaffTime: true, sortOrder: 0 }];
  return source.map((stage, index) => ({ ...stage, id: stage.id || idFactory(), label: stage.label.trim() || "Service", durationMinutes: Math.max(5, stage.durationMinutes), sortOrder: index }));
}

const ServicesForCategory: React.FC<{ categoryId: string; crmCategoryId: ServiceCategoryId; accentColor: string; isDark: boolean; showArchived: boolean }> = ({ categoryId, crmCategoryId, accentColor, isDark, showArchived }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(150);
  const [editId, setEditId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ServiceDraft | null>(null);

  const services = catalog.state.services.filter((svc) => svc.categoryId === categoryId && (showArchived || svc.status !== "archived"));

  const addService = () => {
    if (!name.trim()) return;
    catalog.createService({ categoryId, crmCategoryId, name: name.trim(), defaultDurationMinutes: duration, defaultPriceCents: price * 100, accentColor });
    setName("");
    setAdding(false);
  };

  const startEdit = (svc: CatalogService) => {
    setEditId(svc.id);
    const fallback = buildRegularStages(svc, catalog.newStageId);
    setDraft({
      name: svc.name,
      durationMinutes: svc.defaultDurationMinutes,
      price: Math.round(svc.defaultPriceCents / 100),
      mode: isSplitService(svc.defaultStages) ? "split" : "regular",
      stages: (svc.defaultStages.length ? svc.defaultStages : fallback).map((stage, index) => ({ ...stage, id: stage.id || catalog.newStageId(), sortOrder: index })),
    });
  };

  const applyDraft = (svc: CatalogService) => {
    if (!draft) return;
    const defaultStages = draft.mode === "regular"
      ? buildRegularStages({ ...svc, name: draft.name, defaultDurationMinutes: draft.durationMinutes }, catalog.newStageId)
      : normalizeDraftStages(draft.stages, catalog.newStageId);
    catalog.updateService(svc.id, {
      name: draft.name.trim() || svc.name,
      defaultDurationMinutes: Math.max(5, draft.durationMinutes),
      defaultPriceCents: Math.max(0, draft.price) * 100,
      defaultStages,
    });
    setEditId(null);
    setDraft(null);
  };

  const updateStage = (stageId: string, patch: Partial<ServiceStageDefinition>) =>
    setDraft((prev) => (prev ? { ...prev, stages: prev.stages.map((st) => (st.id === stageId ? { ...st, ...patch } : st)) } : prev));

  return (
    <div className="mt-2 grid grid-cols-1 gap-1.5 ps-5 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((svc) => {
        const isEditing = editId === svc.id && draft;
        return (
          <div key={svc.id} className={`rounded-lg border ${isEditing ? "sm:col-span-2 xl:col-span-3" : ""} ${isDark ? "border-white/[0.08] bg-white/[0.03]" : "border-[#EFE3DA] bg-[#FFFDF8]"} px-2.5 py-2`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <span className={`truncate text-[12px] font-bold ${s.textStrong}`}>{displayServiceName(svc.name, isHebrew)}</span>
                {svc.status === "archived" && <StatusBadge status="archived" isDark={isDark} label={t.schedule.wizard.archived} />}
              </div>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <IconBtn isDark={isDark} title={isHebrew ? "שמור" : "Save"} onClick={() => applyDraft(svc)}><Check className="h-3.5 w-3.5" /></IconBtn>
                    <IconBtn isDark={isDark} title={isHebrew ? "בטל" : "Cancel"} onClick={() => { setEditId(null); setDraft(null); }}><X className="h-3.5 w-3.5" /></IconBtn>
                  </>
                ) : (
                  <>
                    <span className={`text-[11px] ${s.textSoft}`}>{minutesToLabel(svc.defaultDurationMinutes)}</span>
                    <span className={`text-[12px] font-bold ${s.textSoft}`}>{formatPriceCents(svc.defaultPriceCents)}</span>
                    <IconBtn isDark={isDark} title={isHebrew ? "עריכה" : "Edit"} onClick={() => startEdit(svc)}><Pencil className="h-3.5 w-3.5" /></IconBtn>
                    {svc.status === "archived" ? (
                      <IconBtn isDark={isDark} title={isHebrew ? "שחזר" : "Restore"} onClick={() => catalog.updateService(svc.id, { status: "active" })}><Check className="h-3.5 w-3.5" /></IconBtn>
                    ) : (
                      <IconBtn isDark={isDark} title={isHebrew ? "ארכב" : "Archive"} onClick={() => catalog.archiveService(svc.id)}><Archive className="h-3.5 w-3.5" /></IconBtn>
                    )}
                  </>
                )}
              </div>
            </div>

            {isEditing ? (
              <div className={`mt-2 rounded-lg border p-2 ${isDark ? "border-white/10 bg-black/10" : "border-[#EBDDD2] bg-[#FFF8F0]/70"}`}>
                <div className="grid gap-2 sm:grid-cols-[minmax(0,1.5fr)_90px_90px]">
                  <input value={draft.name} onChange={(e) => setDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))} className={s.input} />
                  <input type="number" min={5} step={5} value={draft.durationMinutes} onChange={(e) => setDraft((prev) => (prev ? { ...prev, durationMinutes: Math.max(5, Number(e.target.value) || 5) } : prev))} className={s.input} placeholder={t.schedule.wizard.minShort} />
                  <input type="number" min={0} value={draft.price} onChange={(e) => setDraft((prev) => (prev ? { ...prev, price: Math.max(0, Number(e.target.value) || 0) } : prev))} className={s.input} placeholder="₪" />
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <button type="button" onClick={() => setDraft((prev) => (prev ? { ...prev, mode: "regular", stages: buildRegularStages({ ...svc, name: prev.name, defaultDurationMinutes: prev.durationMinutes }, catalog.newStageId) } : prev))} className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${draft.mode === "regular" ? "bg-[#D7897F] text-white" : isDark ? "bg-white/10 text-white/55" : "bg-white text-[#7E7066]"}`}>
                    {isHebrew ? "שירות רגיל" : "Regular"}
                  </button>
                  <button type="button" onClick={() => setDraft((prev) => { if (!prev) return prev; return { ...prev, mode: "split", stages: isSplitService(prev.stages) ? prev.stages : generateDefaultStages(crmCategoryId, prev.durationMinutes, catalog.newStageId) }; })} className={`rounded-lg px-3 py-1.5 text-[11px] font-black ${draft.mode === "split" ? "bg-[#D7897F] text-white" : isDark ? "bg-white/10 text-white/55" : "bg-white text-[#7E7066]"}`}>
                    {isHebrew ? "שירות מפוצל" : "Split"}
                  </button>
                </div>
                {draft.mode === "split" && (
                  <div className="mt-2 space-y-1.5">
                    {draft.stages.map((stage, index) => (
                      <div key={stage.id} className="grid gap-1.5 sm:grid-cols-[24px_minmax(0,1fr)_120px_80px_auto]">
                        <div className={`grid place-items-center text-[11px] font-black ${s.textFaint}`}>{index + 1}</div>
                        <input value={stage.label} onChange={(e) => updateStage(stage.id, { label: e.target.value })} className={s.input} />
                        <select value={stage.segmentType} onChange={(e) => updateStage(stage.id, { segmentType: e.target.value as SegmentType })} className={s.input}>
                          {EDITABLE_SEGMENT_TYPES.map((type) => <option key={type} value={type}>{segmentTypeLabel(t, type)}</option>)}
                        </select>
                        <input type="number" min={5} step={5} value={stage.durationMinutes} onChange={(e) => updateStage(stage.id, { durationMinutes: Math.max(5, Number(e.target.value) || 5) })} className={s.input} />
                        <IconBtn isDark={isDark} title={isHebrew ? "הסר שלב" : "Remove stage"} onClick={() => setDraft((prev) => (prev ? { ...prev, stages: prev.stages.filter((st) => st.id !== stage.id).map((st, i) => ({ ...st, sortOrder: i })) } : prev))}><X className="h-3.5 w-3.5" /></IconBtn>
                      </div>
                    ))}
                    <button type="button" onClick={() => setDraft((prev) => (prev ? { ...prev, mode: "split", stages: [...prev.stages, { id: catalog.newStageId(), label: t.schedule.segService, segmentType: "service", durationMinutes: 15, isActiveStaffTime: true, sortOrder: prev.stages.length }] } : prev))} className={`text-[11px] font-black ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
                      + {isHebrew ? "הוסף שלב" : "Add stage"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-1 flex flex-wrap gap-1">
                {(svc.defaultStages.length ? svc.defaultStages : buildRegularStages(svc, catalog.newStageId)).map((st) => (
                  <span key={st.id} className={`rounded px-1.5 py-0.5 text-[9px] ${isDark ? "bg-black/20 text-white/50" : "bg-black/[0.03] text-black/50"}`}>
                    {segmentTypeLabel(t, st.segmentType)} · {minutesToLabel(st.durationMinutes)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {adding ? (
        <div className={`col-span-full grid gap-2 rounded-lg border ${isDark ? "border-white/[0.08] bg-white/[0.03]" : "border-[#EFE3DA] bg-[#FFFDF8]"} p-2 sm:grid-cols-[minmax(0,1.5fr)_80px_80px_auto]`}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.serviceNamePlaceholder} className={s.input} />
          <input type="number" min={5} step={5} value={duration} onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 5))} className={s.input} placeholder={t.schedule.wizard.minShort} />
          <input type="number" min={0} value={price} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className={s.input} placeholder="₪" />
          <div className="flex items-center gap-1">
            <PrimaryButton onClick={addService} disabled={!name.trim()}><Check className="h-3.5 w-3.5" /></PrimaryButton>
            <GhostButton isDark={isDark} onClick={() => { setAdding(false); setName(""); }}><X className="h-3.5 w-3.5" /></GhostButton>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`col-span-full text-[11px] font-black ${isDark ? "text-white/50 hover:text-white/80" : "text-[#9A8B80] hover:text-[#7E7066]"}`}>
          + {t.schedule.wizard.addServiceBtn}
        </button>
      )}
    </div>
  );
};

// ── Department-scoped resources ──────────────────────────────────────────────
const ResourcesForDepartment: React.FC<{ departmentId: string; resources: ReturnType<typeof useScheduleCatalog>["state"]["resources"]; isDark: boolean }> = ({ departmentId, resources, isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("chair");

  const addResource = () => {
    if (!name.trim()) return;
    catalog.createResource({ name: name.trim(), type, status: "active", departmentId });
    setName("");
    setAdding(false);
  };

  return (
    <div className={`mt-3 rounded-lg border ${s.cardSoft} p-2.5`}>
      <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "משאבים במחלקה" : "Department resources"}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {resources.length === 0 && <span className={`text-[11px] ${s.textFaint}`}>{isHebrew ? "אין משאבים ייעודיים" : "No dedicated resources"}</span>}
        {resources.map((r) => (
          <span key={r.id} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${r.status === "archived" ? (isDark ? "border-white/10 text-white/35" : "border-[#EBDDD2] text-black/35") : (isDark ? "border-white/15 text-white/70" : "border-[#EBDDD2] text-[#7E7066]")}`}>
            {displayResourceName(r.name, isHebrew)}
            <span className={s.textFaint}>· {resourceTypeLabel(t, r.type)}</span>
            {r.status === "archived" ? (
              <button type="button" onClick={() => catalog.updateResource(r.id, { status: "active" })} title={isHebrew ? "שחזר" : "Restore"}><Check className="h-3 w-3" /></button>
            ) : (
              <button type="button" onClick={() => catalog.archiveResource(r.id)} title={isHebrew ? "ארכב" : "Archive"}><Archive className="h-3 w-3" /></button>
            )}
          </span>
        ))}
      </div>
      {adding ? (
        <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.resourceNamePlaceholder} className={s.input} />
          <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className={s.input}>
            {RESOURCE_TYPES.map((rt) => <option key={rt} value={rt}>{resourceTypeLabel(t, rt)}</option>)}
          </select>
          <div className="flex items-center gap-1">
            <PrimaryButton onClick={addResource} disabled={!name.trim()}><Check className="h-3.5 w-3.5" /></PrimaryButton>
            <GhostButton isDark={isDark} onClick={() => { setAdding(false); setName(""); }}><X className="h-3.5 w-3.5" /></GhostButton>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)} className={`mt-2 text-[11px] font-black ${isDark ? "text-white/50 hover:text-white/80" : "text-[#9A8B80] hover:text-[#7E7066]"}`}>
          + {isHebrew ? "משאב" : "Add resource"}
        </button>
      )}
    </div>
  );
};

// ── Shared resources ─────────────────────────────────────────────────────────
const SharedResources: React.FC<{ resources: ReturnType<typeof useScheduleCatalog>["state"]["resources"]; isDark: boolean }> = ({ resources, isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("chair");

  const addResource = () => {
    if (!name.trim()) return;
    catalog.createResource({ name: name.trim(), type, status: "active", departmentId: null });
    setName("");
  };

  return (
    <section className={`rounded-xl border ${s.card} p-3`}>
      <p className={`text-[12px] font-black ${s.textStrong}`}>{isHebrew ? "משאבים משותפים" : "Shared resources"}</p>
      <p className={`mt-0.5 text-[11px] ${s.textFaint}`}>{isHebrew ? "משאבים הזמינים לכל המחלקות." : "Resources available across all departments."}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {resources.length === 0 && <span className={`text-[11px] ${s.textFaint}`}>{isHebrew ? "אין משאבים משותפים" : "No shared resources"}</span>}
        {resources.map((r) => (
          <span key={r.id} className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${r.status === "archived" ? (isDark ? "border-white/10 text-white/35" : "border-[#EBDDD2] text-black/35") : (isDark ? "border-white/15 text-white/70" : "border-[#EBDDD2] text-[#7E7066]")}`}>
            {displayResourceName(r.name, isHebrew)}
            <span className={s.textFaint}>· {resourceTypeLabel(t, r.type)}</span>
            {r.status === "archived" ? (
              <button type="button" onClick={() => catalog.updateResource(r.id, { status: "active" })} title={isHebrew ? "שחזר" : "Restore"}><Check className="h-3 w-3" /></button>
            ) : (
              <button type="button" onClick={() => catalog.archiveResource(r.id)} title={isHebrew ? "ארכב" : "Archive"}><Archive className="h-3 w-3" /></button>
            )}
          </span>
        ))}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.resourceNamePlaceholder} className={s.input} />
        <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className={s.input}>
          {RESOURCE_TYPES.map((rt) => <option key={rt} value={rt}>{resourceTypeLabel(t, rt)}</option>)}
        </select>
        <PrimaryButton onClick={addResource} disabled={!name.trim()}><Plus className="h-3.5 w-3.5" /> {t.common.add}</PrimaryButton>
      </div>
    </section>
  );
};
