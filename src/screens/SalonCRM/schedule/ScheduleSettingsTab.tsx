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
import { useScheduleCatalog } from "./ScheduleCatalogProvider";
import type { ResourceType } from "./catalogTypes";
import { RESOURCE_TYPE_LABELS, SEGMENT_TYPE_LABELS } from "./serviceCatalogUtils";
import { minutesToLabel, formatPriceCents } from "./bookingFlowUtils";

type SettingsSection = "departments" | "categories" | "services" | "resources";

const SECTIONS: { id: SettingsSection; label: string }[] = [
  { id: "departments", label: "Departments" },
  { id: "categories", label: "Categories" },
  { id: "services", label: "Services" },
  { id: "resources", label: "Resources" },
];

const CRM_CATEGORY_IDS: ServiceCategoryId[] = ["color", "highlights", "toner", "straightening", "treatment", "cut", "other"];
const RESOURCE_TYPES: ResourceType[] = ["chair", "wash-station", "treatment-room", "color-station", "other"];

interface Props {
  isDark: boolean;
}

export const ScheduleSettingsTab: React.FC<Props> = ({ isDark }) => {
  const [section, setSection] = useState<SettingsSection>("departments");

  const textStrong = isDark ? "text-white" : "text-[#1A1A1A]";
  const textSoft = isDark ? "text-white/55" : "text-black/55";

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center gap-1.5 mb-5">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
              section === s.id
                ? isDark ? "bg-white/[0.14] text-white" : "bg-black/[0.06] text-[#1A1A1A]"
                : isDark ? "text-white/55 hover:text-white/70" : "text-black/55 hover:text-black/70"
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
        Archived items stay hidden from new bookings but never affect existing appointments.
      </p>
    </div>
  );
};

// ── Shared UI ────────────────────────────────────────────────────────
function useStyles(isDark: boolean) {
  return {
    card: isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-black/[0.06] bg-white/[0.60]",
    textStrong: isDark ? "text-white" : "text-[#1A1A1A]",
    textSoft: isDark ? "text-white/55" : "text-black/55",
    textFaint: isDark ? "text-white/40" : "text-black/40",
    input: isDark
      ? "bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
      : "bg-black/[0.04] border border-black/[0.10] rounded-lg px-3 py-2 text-[#1A1A1A] text-sm",
  };
}

const PrimaryButton: React.FC<{ onClick: () => void; children: React.ReactNode; disabled?: boolean }> = ({ onClick, children, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
    style={{ background: "linear-gradient(315deg, #9a7544, #c79c6d)" }}
  >
    {children}
  </button>
);

const StatusBadge: React.FC<{ archived: boolean; isDark: boolean }> = ({ archived, isDark }) => (
  <span className={`text-[9px] font-semibold px-2 py-0.5 rounded ${
    archived
      ? (isDark ? "bg-white/10 text-white/40" : "bg-black/[0.06] text-black/40")
      : (isDark ? "bg-emerald-400/10 text-emerald-300" : "bg-emerald-100 text-emerald-700")
  }`}>
    {archived ? "Archived" : "Active"}
  </span>
);

// ── Departments ───────────────────────────────────────────────────────
const DepartmentsSection: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const catalog = useScheduleCatalog();
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New department name" className={`flex-1 ${s.input}`} />
        <PrimaryButton onClick={() => { if (name.trim()) { catalog.createDepartment(name.trim()); setName(""); } }} disabled={!name.trim()}>
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</span>
        </PrimaryButton>
      </div>
      <div className="space-y-2">
        {catalog.state.departments.map((d) => (
          <div key={d.id} className={`flex items-center justify-between rounded-xl border ${s.card} px-4 py-3`}>
            {editId === d.id ? (
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className={`flex-1 me-2 ${s.input}`} />
            ) : (
              <div className="flex items-center gap-2">
                <span className={`text-[13px] font-semibold ${s.textStrong}`}>{d.name}</span>
                <StatusBadge archived={d.status === "archived"} isDark={isDark} />
              </div>
            )}
            <div className="flex items-center gap-1">
              {editId === d.id ? (
                <>
                  <IconBtn onClick={() => { catalog.updateDepartment(d.id, { name: editName.trim() || d.name }); setEditId(null); }} isDark={isDark}><Check className="w-3.5 h-3.5" /></IconBtn>
                  <IconBtn onClick={() => setEditId(null)} isDark={isDark}><X className="w-3.5 h-3.5" /></IconBtn>
                </>
              ) : (
                <>
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
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [deptId, setDeptId] = useState(catalog.state.departments[0]?.id ?? "");
  const [crmCat, setCrmCat] = useState<ServiceCategoryId>("color");

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border ${s.card} p-3 grid grid-cols-4 gap-2`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className={s.input} />
        <select value={deptId} onChange={(e) => setDeptId(e.target.value)} className={s.input}>
          {catalog.state.departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select value={crmCat} onChange={(e) => setCrmCat(e.target.value as ServiceCategoryId)} className={s.input}>
          {CRM_CATEGORY_IDS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <PrimaryButton
          onClick={() => { if (name.trim() && deptId) { catalog.createCategory({ name: name.trim(), departmentId: deptId, accentColor: "#9a7544", crmCategoryId: crmCat }); setName(""); } }}
          disabled={!name.trim() || !deptId}
        >
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</span>
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
    });
    setName("");
  };

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border ${s.card} p-3 grid grid-cols-5 gap-2`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Service name" className={`col-span-2 ${s.input}`} />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={s.input}>
          {activeCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="number" value={duration} min={5} step={5} onChange={(e) => setDuration(Math.max(5, Number(e.target.value) || 5))} className={s.input} placeholder="Min" />
        <div className="flex gap-2">
          <input type="number" value={price} min={0} onChange={(e) => setPrice(Math.max(0, Number(e.target.value) || 0))} className={`w-full ${s.input}`} placeholder="₪" />
        </div>
      </div>
      <div className="flex justify-end">
        <PrimaryButton onClick={handleAdd} disabled={!name.trim() || !categoryId}>
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add Service</span>
        </PrimaryButton>
      </div>

      <div className="space-y-2">
        {catalog.state.services.map((svc) => {
          const cat = catalog.state.categories.find((c) => c.id === svc.categoryId);
          return (
            <div key={svc.id} className={`rounded-xl border ${s.card} px-4 py-3`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
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
                    {SEGMENT_TYPE_LABELS[st.segmentType]} · {minutesToLabel(st.durationMinutes)}{!st.isActiveStaffTime ? " (processing)" : ""}
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
  const s = useStyles(isDark);
  const [name, setName] = useState("");
  const [type, setType] = useState<ResourceType>("chair");

  return (
    <div className="space-y-3">
      <div className={`rounded-xl border ${s.card} p-3 grid grid-cols-3 gap-2`}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Resource name" className={s.input} />
        <select value={type} onChange={(e) => setType(e.target.value as ResourceType)} className={s.input}>
          {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{RESOURCE_TYPE_LABELS[t]}</option>)}
        </select>
        <PrimaryButton onClick={() => { if (name.trim()) { catalog.createResource({ name: name.trim(), type, status: "active" }); setName(""); } }} disabled={!name.trim()}>
          <span className="flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Add</span>
        </PrimaryButton>
      </div>
      <div className="space-y-2">
        {catalog.state.resources.map((r) => (
          <div key={r.id} className={`flex items-center justify-between rounded-xl border ${s.card} px-4 py-3`}>
            <div className="flex items-center gap-2">
              <span className={`text-[13px] font-semibold ${s.textStrong}`}>{r.name}</span>
              <span className={`text-[10px] ${s.textFaint}`}>{RESOURCE_TYPE_LABELS[r.type]}</span>
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
