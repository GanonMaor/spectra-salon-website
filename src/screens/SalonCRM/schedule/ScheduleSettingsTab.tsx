/**
 * Schedule settings tab.
 *
 * Manages the service catalog that powers the booking flow: departments,
 * categories, services (with default stages preview), and resources. Uses
 * archive (not delete) so existing appointments remain stable. Reads/writes
 * the in-memory `ScheduleCatalogProvider`.
 */

import React, { useState } from "react";
import { Plus, Archive, Pencil, Check, X } from "lucide-react";
import type { ServiceCategoryId } from "../data/crmTypes";
import { useCrmT } from "../i18n/CrmLocale";
import type { CrmTranslations } from "../i18n/translations";
import { useScheduleCatalog } from "./ScheduleCatalogProvider";
import type { ResourceType } from "./catalogTypes";
import { resourceTypeLabel, segmentTypeLabel } from "./serviceCatalogUtils";
import { minutesToLabel, formatPriceCents } from "./bookingFlowUtils";
import { CALENDAR_DESIGN_COLORS, defaultServiceColor } from "./scheduleDesign";

type SettingsSection = "departments" | "categories" | "services" | "resources";

const CRM_CATEGORY_IDS: ServiceCategoryId[] = ["color", "highlights", "toner", "straightening", "treatment", "cut", "other"];
const RESOURCE_TYPES: ResourceType[] = ["chair", "wash-station", "treatment-room", "color-station", "other"];
const COLOR_PRESETS = [
  CALENDAR_DESIGN_COLORS.nectarine,
  CALENDAR_DESIGN_COLORS.peche,
  CALENDAR_DESIGN_COLORS.menthe,
  CALENDAR_DESIGN_COLORS.lagune,
  CALENDAR_DESIGN_COLORS.rose,
  CALENDAR_DESIGN_COLORS.sauge,
  CALENDAR_DESIGN_COLORS.lilas,
];

/** Localized label for a canonical CRM category id. */
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

export const ScheduleSettingsTab: React.FC<Props> = ({ isDark }) => {
  const t = useCrmT();
  const [section, setSection] = useState<SettingsSection>("departments");

  const textSoft = isDark ? "text-white/55" : "text-black/55";

  const sections: { id: SettingsSection; label: string }[] = [
    { id: "departments", label: t.schedule.wizard.settingsDepartments },
    { id: "categories", label: t.schedule.wizard.settingsCategories },
    { id: "services", label: t.schedule.wizard.settingsServices },
    { id: "resources", label: t.schedule.wizard.settingsResources },
  ];

  return (
    <div className="p-4 sm:p-6 bg-[#FFF8F0]">
      <div className="flex flex-wrap items-center gap-1.5 mb-5">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
              section === s.id
                ? isDark ? "bg-white/[0.14] text-white" : "bg-[#F3C3BC] text-[#B05F57]"
                : isDark ? "text-white/55 hover:text-white/70" : "text-[#7E7066] hover:text-[#141414]"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "departments" && <DepartmentsSection isDark={isDark} />}
      {section === "categories" && <CategoriesSection isDark={isDark} />}
      {section === "services" && <ServicesSection isDark={isDark} />}
      {section === "resources" && <ResourcesSection isDark={isDark} />}

      <p className={`mt-5 text-[11px] ${textSoft}`}>
        {t.schedule.wizard.archivedNote}
      </p>
    </div>
  );
};

// ── Shared UI ────────────────────────────────────────────────────────
function useStyles(isDark: boolean) {
  return {
    card: isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-[#EBDDD2] bg-[#FFFDF8]",
    textStrong: isDark ? "text-white" : "text-[#141414]",
    textSoft: isDark ? "text-white/55" : "text-[#7E7066]",
    textFaint: isDark ? "text-white/40" : "text-[#9A8B80]",
    input: isDark
      ? "bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
      : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-3 py-2 text-[#141414] text-sm focus:outline-none focus:border-[#D7897F]",
  };
}

const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
    style={{ background: CALENDAR_DESIGN_COLORS.nectarine }}
  >
    {children}
  </button>
);

const StatusBadge: React.FC<{ archived: boolean; isDark: boolean }> = ({ archived, isDark }) => {
  const t = useCrmT();
  return (
    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
      archived
        ? (isDark ? "bg-white/10 text-white/40" : "bg-black/[0.06] text-black/40")
        : (isDark ? "bg-emerald-400/10 text-emerald-300" : "bg-[#96C7B3]/35 text-[#315A4B]")
    }`}>
      {archived ? t.schedule.wizard.archived : t.schedule.wizard.active}
    </span>
  );
};

// ── Departments ───────────────────────────────────────────────────────
const DepartmentsSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [calendarColor, setCalendarColor] = useState<string>(CALENDAR_DESIGN_COLORS.peche);
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="space-y-3">
      <div className={`grid gap-2 rounded-xl border ${s.card} p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto]`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.newDepartmentName} className={`flex-1 ${s.input}`} />
        <ColorPicker value={calendarColor} onChange={setCalendarColor} />
        <PrimaryButton onClick={() => { if (name.trim()) { catalog.createDepartment(name.trim(), undefined, calendarColor); setName(""); } }} disabled={!name.trim()}>
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> {t.common.add}</span>
        </PrimaryButton>
      </div>
      <div className="space-y-2">
        {catalog.state.departments.map((d) => (
          <div key={d.id} className={`flex items-center justify-between rounded-xl border ${s.card} px-4 py-3`}>
            {editId === d.id ? (
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`flex-1 me-2 ${s.input}`} />
            ) : (
              <div className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 rounded-full ring-2 ring-white/80" style={{ background: d.calendarColor ?? CALENDAR_DESIGN_COLORS.nectarine }} />
                <span className={`text-[13px] font-semibold ${s.textStrong}`}>{d.name}</span>
                <StatusBadge archived={d.status === "archived"} isDark={isDark} />
                {d.isCalendarEnabled && <span className={`text-[10px] ${s.textFaint}`}>{d.calendarLabel ?? d.name}</span>}
              </div>
            )}
            <div className="flex items-center gap-1">
              {editId === d.id ? (
                <>
                  <ColorPicker value={d.calendarColor ?? CALENDAR_DESIGN_COLORS.nectarine} onChange={(color) => catalog.updateDepartment(d.id, { calendarColor: color })} compact />
                  <IconBtn onClick={() => { catalog.updateDepartment(d.id, { name: editName.trim() || d.name, calendarLabel: editName.trim() || d.calendarLabel || d.name }); setEditId(null); }} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn onClick={() => setEditId(null)} isDark={isDark}><X className="w-3.5 h-3.5" /></IconBtn>
                </>
              ) : (
                <>
                  <ColorPicker value={d.calendarColor ?? CALENDAR_DESIGN_COLORS.nectarine} onChange={(color) => catalog.updateDepartment(d.id, { calendarColor: color })} compact />
                  <IconBtn onClick={() => { setEditId(d.id); setEditName(d.name); }} isDark={isDark}><Pencil className="w-3.5 h-3.5" /></IconBtn>
                  {d.status === "active" && <IconBtn onClick={() => catalog.archiveDepartment(d.id)} isDark={isDark}><Archive className="w-3.5 h-3.5" /></IconBtn>}
                  {d.status === "archived" && <IconBtn onClick={() => catalog.updateDepartment(d.id, { status: "active" })} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>}
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Categories ────────────────────────────────────────────────────────
const CategoriesSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState(catalog.state.departments[0]?.id ?? "");
  const [crmCat, setCrmCat] = useState<ServiceCategoryId>("color");
  const [accentColor, setAccentColor] = useState(defaultServiceColor("color"));

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border ${s.card} p-3 grid grid-cols-5 gap-2`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.categoryNamePlaceholder} className={s.input} />
        <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className={s.input}>
          {catalog.state.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select
          value={crmCat}
          onChange={(e) => {
            const next = e.target.value as ServiceCategoryId;
            setCrmCat(next);
            setAccentColor(defaultServiceColor(next));
          }}
          className={s.input}
        >
          {CRM_CATEGORY_IDS.map((c) => <option key={c} value={c}>{crmCategoryLabel(t, c)}</option>)}
        </select>
        <ColorPicker value={accentColor} onChange={setAccentColor} />
        <PrimaryButton
          onClick={() => { if (name.trim() && deptId) { catalog.createCategory({ name: name.trim(), departmentId: deptId, accentColor, crmCategoryId: crmCat }); setName(""); } }}
          disabled={!name.trim() || !deptId}
        >
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> {t.common.add}</span>
        </PrimaryButton>
      </div>
      <div className="space-y-2">
        {catalog.state.categories.map((c) => {
          const dept = catalog.state.departments.find((d) => d.id === c.departmentId);
          return (
            <div key={c.id} className={`flex items-center justify-between rounded-xl border ${s.card} px-4 py-3`}>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ background: c.accentColor }} />
                <span className={`text-[13px] font-semibold ${s.textStrong}`}>{c.name}</span>
                <span className={`text-[10px] ${s.textFaint}`}>{dept?.name}</span>
                <StatusBadge archived={c.status === "archived"} isDark={isDark} />
              </div>
              <div className="flex items-center gap-1">
                <ColorPicker value={c.accentColor} onChange={(color) => catalog.updateCategory(c.id, { accentColor: color })} compact />
                {c.status === "active"
                  ? <IconBtn onClick={() => catalog.archiveCategory(c.id)} isDark={isDark}><Archive className="w-3.5 h-3.5" /></IconBtn>
                  : <IconBtn onClick={() => catalog.updateCategory(c.id, { status: "active" })} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Services ──────────────────────────────────────────────────────────
const ServicesSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState(catalog.state.categories[0]?.id ?? "");
  const [duration, setDuration] = useState(60);
  const [price, setPrice] = useState(150);
  const [editId, setEditId] = useState<string | null>(null);
  const [editDuration, setEditDuration] = useState(0);
  const [editPrice, setEditPrice] = useState(0);

  const activeCategories = catalog.state.categories.filter((c) => c.status === "active");

  const handleAdd = () => {
    const cat = catalog.state.categories.find((c) => c.id === categoryId);
    if (!name.trim() || !cat) return;
    catalog.createService({
      categoryId: cat.id,
      crmCategoryId: cat.crmCategoryId ?? "other",
      name: name.trim(),
      defaultDurationMinutes: duration,
      defaultPriceCents: price * 100,
      accentColor: cat.accentColor,
    });
    setName("");
  };

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border ${s.card} p-3 grid grid-cols-6 gap-2`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.serviceNamePlaceholder} className={`col-span-2 ${s.input}`} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={s.input}>
          {activeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" value={duration} min={5} step={5} onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 5))} className={s.input} placeholder={t.schedule.wizard.minShort} />
        <div className="flex gap-2">
          <input type="number" value={price} min={0} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className={`w-full ${s.input}`} placeholder="₪" />
        </div>
        <div className={`flex items-center rounded-lg border px-3 text-[10px] font-bold ${isDark ? "border-white/15 text-white/45" : "border-[#EBDDD2] text-[#9A8B80]"}`}>
          {t.common.add === "Add" ? "Uses category color" : "צבע לפי קטגוריה"}
        </div>
      </div>
      <div className="flex justify-end">
        <PrimaryButton onClick={handleAdd} disabled={!name.trim() || !categoryId}>
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> {t.schedule.wizard.addServiceBtn}</span>
        </PrimaryButton>
      </div>

      <div className="space-y-2">
        {catalog.state.services.map((svc) => {
          const cat = catalog.state.categories.find((c) => c.id === svc.categoryId);
          return (
            <div key={svc.id} className={`rounded-xl border ${s.card} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: cat?.accentColor ?? defaultServiceColor(svc.crmCategoryId) }} />
                  <span className={`text-[13px] font-semibold ${s.textStrong}`}>{svc.name}</span>
                  <span className={`text-[10px] ${s.textFaint}`}>{cat?.name}</span>
                  <StatusBadge archived={svc.status === "archived"} isDark={isDark} />
                </div>
                <div className="flex items-center gap-2">
                  {editId === svc.id ? (
                    <>
                      <input type="number" value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} className={`w-16 ${s.input}`} />
                      <input type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} className={`w-16 ${s.input}`} />
                      <IconBtn onClick={() => { catalog.updateService(svc.id, { defaultDurationMinutes: Math.max(5, editDuration), defaultPriceCents: Math.max(0, editPrice) * 100 }); setEditId(null); }} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>
                      <IconBtn onClick={() => setEditId(null)} isDark={isDark}><X className="w-3.5 h-3.5" /></IconBtn>
                    </>
                  ) : (
                    <>
                      <span className={`text-[11px] ${s.textSoft}`}>{minutesToLabel(svc.defaultDurationMinutes)}</span>
                      <span className={`text-[12px] font-bold ${s.textSoft}`}>{formatPriceCents(svc.defaultPriceCents)}</span>
                      <IconBtn onClick={() => { setEditId(svc.id); setEditDuration(svc.defaultDurationMinutes); setEditPrice(svc.defaultPriceCents / 100); }} isDark={isDark}><Pencil className="w-3.5 h-3.5" /></IconBtn>
                      {svc.status === "active"
                        ? <IconBtn onClick={() => catalog.archiveService(svc.id)} isDark={isDark}><Archive className="w-3.5 h-3.5" /></IconBtn>
                        : <IconBtn onClick={() => catalog.updateService(svc.id, { status: "active" })} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>}
                    </>
                  )}
                </div>
              </div>
              {/* Default stages preview */}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {svc.defaultStages.map((st) => (
                  <span key={st.id} className={`text-[10px] px-2 py-0.5 rounded ${isDark ? "bg-black/20 text-white/55" : "bg-black/[0.03] text-black/55"}`}>
                    {segmentTypeLabel(t, st.segmentType)} · {minutesToLabel(st.durationMinutes)}{!st.isActiveStaffTime ? ` (${t.schedule.wizard.processingTag})` : ""}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ── Resources ─────────────────────────────────────────────────────────
const ResourcesSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const catalog = useScheduleCatalog();
  const t = useCrmT();
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("chair");

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border ${s.card} p-3 grid grid-cols-3 gap-2`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t.schedule.wizard.resourceNamePlaceholder} className={s.input} />
        <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className={s.input}>
          {RESOURCE_TYPES.map((rt) => <option key={rt} value={rt}>{resourceTypeLabel(t, rt)}</option>)}
        </select>
        <PrimaryButton onClick={() => { if (name.trim()) { catalog.createResource({ name: name.trim(), type, status: "active" }); setName(""); } }} disabled={!name.trim()}>
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> {t.common.add}</span>
        </PrimaryButton>
      </div>
      <div className="space-y-2">
        {catalog.state.resources.map((r) => (
          <div key={r.id} className={`flex items-center justify-between rounded-xl border ${s.card} px-4 py-3`}>
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-semibold ${s.textStrong}`}>{r.name}</span>
              <span className={`text-[10px] ${s.textFaint}`}>{resourceTypeLabel(t, r.type)}</span>
              <StatusBadge archived={r.status === "archived"} isDark={isDark} />
            </div>
            <div className="flex items-center gap-1">
              {r.status === "active"
                ? <IconBtn onClick={() => catalog.archiveResource(r.id)} isDark={isDark}><Archive className="w-3.5 h-3.5" /></IconBtn>
                : <IconBtn onClick={() => catalog.updateResource(r.id, { status: "active" })} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ColorPicker: React.FC<{
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}> = ({ value, onChange, compact = false }) => (
  <div className={`flex items-center gap-1 ${compact ? "" : "rounded-lg border border-[#EBDDD2] bg-[#FFF8F0] px-2"}`}>
    {COLOR_PRESETS.map((color) => {
      const active = value.toLowerCase() === color.toLowerCase();
      return (
        <button
          key={color}
          type="button"
          onClick={() => onChange(color)}
          className={`${compact ? "h-6 w-6" : "h-7 w-7"} rounded-full border transition-transform ${
            active ? "scale-110 border-[#141414]" : "border-white/70"
          }`}
          style={{ background: color }}
          aria-label={color}
        />
      );
    })}
    <input
      type="color"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`${compact ? "h-6 w-6" : "h-7 w-7"} cursor-pointer rounded-full border-0 bg-transparent p-0`}
      aria-label="Custom color"
    />
  </div>
);

const IconBtn: React.FC<{ onClick: () => void; children: React.ReactNode; isDark: boolean }> = ({ onClick, children, isDark }) => (
  <button
    onClick={onClick}
    className={`w-7 h-7 rounded-md flex items-center justify-center transition-colors ${
      isDark ? "text-white/55 hover:text-white hover:bg-white/10" : "text-black/50 hover:text-black hover:bg-black/[0.05]"
    }`}
  >
    {children}
  </button>
);
