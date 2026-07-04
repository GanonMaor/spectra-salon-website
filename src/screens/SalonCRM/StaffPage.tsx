import React, { useMemo, useState } from "react";
import { Award, ImageOff, Plus, Save, Star, Trash2, UserCog, Users } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmT } from "./i18n/CrmLocale";
import { useCRMActions, useCRMSystemState, useServices, useStaff, useStaffPerformance } from "./data/crmHooks";
import type { StaffMember } from "./data/crmTypes";
import { displayServiceName, displayStaffName } from "./schedule/scheduleDisplayNames";

type DepartmentId = "dept-hair" | "dept-cosmetics" | "dept-spa";

interface StaffRoleConfig {
  id: string;
  name: string;
  departmentId: DepartmentId;
  defaultServiceIds: string[];
}

const DEPARTMENTS: { id: DepartmentId; label: string; tone: string }[] = [
  { id: "dept-hair", label: "שיער", tone: "#D7897F" },
  { id: "dept-cosmetics", label: "קוסמטיקה", tone: "#8FB7AA" },
  { id: "dept-spa", label: "ספא", tone: "#B8C6D9" },
];

const STAFF_ROLES: StaffRoleConfig[] = [
  { id: "role-hair-stylist", name: "Hair Stylist", departmentId: "dept-hair", defaultServiceIds: ["sv3", "sv4", "sv7", "sv8", "sv9", "sv10", "sv11", "sv14", "sv15"] },
  { id: "role-color-specialist", name: "Color Specialist", departmentId: "dept-hair", defaultServiceIds: ["sv1", "sv2", "sv3", "sv4", "sv5", "sv6", "sv12", "sv13"] },
  { id: "role-beauty-therapist", name: "Beauty Therapist", departmentId: "dept-cosmetics", defaultServiceIds: ["cos-facial-classic", "cos-facial-glow", "cos-brow-shape", "cos-brow-tint", "cos-lash-lift", "cos-makeup-evening"] },
  { id: "role-brow-artist", name: "Brow Artist", departmentId: "dept-cosmetics", defaultServiceIds: ["cos-brow-shape", "cos-brow-tint"] },
  { id: "role-lash-artist", name: "Lash Artist", departmentId: "dept-cosmetics", defaultServiceIds: ["cos-lash-lift"] },
  { id: "role-esthetician", name: "Esthetician", departmentId: "dept-cosmetics", defaultServiceIds: ["cos-facial-classic", "cos-facial-glow"] },
];

const COSMETICS_STAFF_SERVICES = [
  { id: "cos-facial-classic", name: "Classic Facial" },
  { id: "cos-facial-glow", name: "Glow Facial" },
  { id: "cos-brow-shape", name: "Brow Shaping" },
  { id: "cos-brow-tint", name: "Brow Tint" },
  { id: "cos-lash-lift", name: "Lash Lift" },
  { id: "cos-makeup-evening", name: "Evening Makeup" },
];

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  roleId: "role-hair-stylist",
  departmentIds: ["dept-hair"] as DepartmentId[],
  serviceIds: [] as string[],
  avatarUrl: "",
  color: "#D7897F",
  status: "active" as StaffMember["status"],
};

const StaffPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const staff = useStaff();
  const services = useServices();
  const actions = useCRMActions();
  const systemState = useCRMSystemState();
  const performance = useStaffPerformance();
  const [editingId, setEditingId] = useState<string | null>(staff[0]?.id ?? null);
  const [draft, setDraft] = useState(() => staff[0] ? staffToDraft(staff[0]) : EMPTY_FORM);
  const isHebrew = t.common.add !== "Add";

  const selectedStaff = staff.find((member) => member.id === editingId);

  const serviceOptions = useMemo(() => [...services, ...COSMETICS_STAFF_SERVICES].filter((service) => {
    const departmentIds = draft.departmentIds;
    const isCosmetics = service.id.startsWith("cos-");
    if (departmentIds.includes("dept-cosmetics") && isCosmetics) return true;
    if (departmentIds.includes("dept-hair") && !isCosmetics) return true;
    return false;
  }), [draft.departmentIds, services]);

  const summary = useMemo(() => {
    const dayOfWeek = new Date(systemState.activeDate).getUTCDay();
    const activeToday = staff.filter((m) =>
      m.status === "active" && m.workingHours.some((wh) => wh.dayOfWeek === dayOfWeek),
    ).length;
    const top = [...performance].sort((a, b) => b.utilizationPct - a.utilizationPct)[0];
    return {
      teamCount: staff.length,
      activeCount: staff.filter((s) => s.status === "active").length,
      activeToday,
      topPerformerName: top && top.utilizationPct > 0 ? top.staff.name : null,
      topPerformerUtilization: top?.utilizationPct ?? 0,
    };
  }, [staff, performance, systemState.activeDate]);

  const selectStaff = (member: StaffMember) => {
    setEditingId(member.id);
    setDraft(staffToDraft(member));
  };

  const startNew = () => {
    setEditingId(null);
    setDraft(EMPTY_FORM);
  };

  const applyRole = (roleId: string) => {
    const role = STAFF_ROLES.find((item) => item.id === roleId);
    if (!role) return;
    setDraft((prev) => ({
      ...prev,
      roleId,
      departmentIds: [role.departmentId],
      serviceIds: role.defaultServiceIds,
      color: DEPARTMENTS.find((dept) => dept.id === role.departmentId)?.tone ?? prev.color,
    }));
  };

  const toggleService = (serviceId: string) => {
    setDraft((prev) => ({
      ...prev,
      serviceIds: prev.serviceIds.includes(serviceId)
        ? prev.serviceIds.filter((id) => id !== serviceId)
        : [...prev.serviceIds, serviceId],
    }));
  };

  const save = () => {
    const role = STAFF_ROLES.find((item) => item.id === draft.roleId);
    const input = {
      name: draft.name.trim(),
      role: role?.name ?? selectedStaff?.role ?? "Staff",
      roleId: draft.roleId,
      departmentIds: draft.departmentIds,
      serviceIds: draft.serviceIds,
      avatarUrl: draft.avatarUrl.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      email: draft.email.trim() || undefined,
      color: draft.color,
      status: draft.status,
    };
    const result = editingId ? actions.updateStaff(editingId, input) : actions.createStaff(input);
    if (result.ok && !editingId && result.data?.id) setEditingId(result.data.id);
  };

  const archive = (id: string) => {
    actions.archiveStaff(id);
    if (editingId === id) startNew();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{t.staff.title}</h1>
          <p className={`mt-1 text-sm ${isDark ? "text-white/50" : "text-black/50"}`}>
            {isHebrew ? "ניהול עובדים, תפקידים, מחלקות ויכולות שירות אמיתיות." : "Manage real staff records, roles, departments and service capabilities."}
          </p>
        </div>
        <button type="button" onClick={startNew} className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#141414] px-4 text-[12px] font-black text-white">
          <Plus className="h-4 w-4" />
          {isHebrew ? "עובד חדש" : "New staff"}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Kpi icon={Users} label={t.staff.teamMembers} value={summary.teamCount} sub={`${summary.activeCount} ${t.staff.activeSuffix}`} />
        <Kpi icon={UserCog} label={t.staff.activeToday} value={summary.activeToday} sub={t.staff.connectToEnable} />
        <Kpi icon={Award} label={t.staff.topPerformer} value={summary.topPerformerName ?? "—"} sub={summary.topPerformerName ? `${summary.topPerformerUtilization}% ${t.staff.utilizationSuffix}` : t.staff.comingSoon} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(360px,1.2fr)]">
        <section className="rounded-[28px] border border-[#EBDDD2] bg-white/72 p-3 shadow-[0_18px_45px_rgba(92,52,35,0.08)]">
          <div className="space-y-2">
            {staff.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => selectStaff(member)}
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition ${editingId === member.id ? "border-[#D7897F] bg-[#FFF6F2]" : "border-[#EFE4DA] bg-white/58 hover:bg-white"}`}
              >
                <Avatar member={member} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-[13px] font-black text-[#141414]">{displayStaffName(member.name, isHebrew)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black ${member.status === "active" ? "bg-[#EAF5EF] text-[#437C65]" : "bg-[#F1ECE7] text-[#8B7A6E]"}`}>
                      {member.status === "active" ? (isHebrew ? "פעיל" : "Active") : (isHebrew ? "מושבת" : "Inactive")}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-[11px] font-semibold text-[#7E7066]">{member.role}</p>
                  <p className="mt-1 text-[10px] font-bold text-[#9A8B80]">
                    {(member.departmentIds ?? ["dept-hair"]).map((id) => DEPARTMENTS.find((dept) => dept.id === id)?.label ?? id).join(" · ")}
                  </p>
                </div>
                <div className="hidden text-end sm:block">
                  <p className="text-[11px] font-black text-[#141414]">{member.rating.toFixed(1)}</p>
                  <Star className="ms-auto mt-0.5 h-3 w-3 fill-amber-500 text-amber-500" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-[30px] border border-[#EBDDD2] bg-[#FFFDF9]/82 p-4 shadow-[0_18px_45px_rgba(92,52,35,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9A8B80]">{editingId ? (isHebrew ? "עריכת עובד" : "Edit staff") : (isHebrew ? "עובד חדש" : "New staff")}</p>
              <h2 className="mt-1 text-lg font-black text-[#141414]">{draft.name || (isHebrew ? "פרטי עובד" : "Staff details")}</h2>
            </div>
            {editingId && (
              <button type="button" onClick={() => archive(editingId)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#F1ECE7] px-3 text-[11px] font-black text-[#7E7066]">
                <Trash2 className="h-3.5 w-3.5" />
                {isHebrew ? "השבת" : "Archive"}
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={isHebrew ? "שם מלא" : "Full name"} value={draft.name} onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))} />
            <Field label={isHebrew ? "טלפון" : "Phone"} value={draft.phone} onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))} />
            <Field label={isHebrew ? "אימייל" : "Email"} value={draft.email} onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))} />
            <Field label={isHebrew ? "תמונה URL" : "Photo URL"} value={draft.avatarUrl} onChange={(value) => setDraft((prev) => ({ ...prev, avatarUrl: value }))} />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <label className="block">
              <span className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "תפקיד מקצועי" : "Role"}</span>
              <select value={draft.roleId} onChange={(event) => applyRole(event.target.value)} className="mt-1 h-11 w-full rounded-2xl border border-[#EBDDD2] bg-white px-3 text-[13px] font-bold text-[#141414] outline-none">
                {STAFF_ROLES.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "סטטוס" : "Status"}</span>
              <select value={draft.status} onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value as StaffMember["status"] }))} className="mt-1 h-11 w-full rounded-2xl border border-[#EBDDD2] bg-white px-3 text-[13px] font-bold text-[#141414] outline-none">
                <option value="active">{isHebrew ? "פעיל" : "Active"}</option>
                <option value="inactive">{isHebrew ? "מושבת" : "Inactive"}</option>
              </select>
            </label>
          </div>

          <div className="mt-4">
            <p className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "מחלקה" : "Department"}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {DEPARTMENTS.map((dept) => {
                const active = draft.departmentIds.includes(dept.id);
                return (
                  <button key={dept.id} type="button" onClick={() => setDraft((prev) => ({ ...prev, departmentIds: [dept.id], color: dept.tone, serviceIds: [] }))} className={`rounded-2xl border px-3 py-2 text-[11px] font-black transition ${active ? "border-transparent text-white" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`} style={active ? { backgroundColor: dept.tone } : undefined}>
                    {dept.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-black text-[#7E7066]">{isHebrew ? "שירותים שהעובד יכול לבצע" : "Allowed services"}</p>
              <button type="button" onClick={() => setDraft((prev) => ({ ...prev, serviceIds: serviceOptions.map((service) => service.id) }))} className="text-[10px] font-black text-[#B05F57]">
                {isHebrew ? "בחר הכל" : "Select all"}
              </button>
            </div>
            <div className="mt-2 grid max-h-[240px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {serviceOptions.map((service) => {
                const active = draft.serviceIds.includes(service.id);
                return (
                  <button key={service.id} type="button" onClick={() => toggleService(service.id)} className={`rounded-2xl border px-3 py-2 text-start text-[11px] font-bold transition ${active ? "border-[#D7897F] bg-[#FFF1EC] text-[#141414]" : "border-[#EFE4DA] bg-white/70 text-[#7E7066]"}`}>
                    {displayServiceName(service.name, isHebrew)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={save} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#141414] px-5 text-[12px] font-black text-white">
              <Save className="h-4 w-4" />
              {isHebrew ? "שמירה" : "Save"}
            </button>
            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, avatarUrl: "" }))} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#F1ECE7] px-4 text-[12px] font-black text-[#7E7066]">
              <ImageOff className="h-4 w-4" />
              {isHebrew ? "הסר תמונה" : "Remove photo"}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

const Avatar: React.FC<{ member: StaffMember }> = ({ member }) => {
  const initials = member.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  if (member.avatarUrl) {
    return <img src={member.avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-2xl object-cover" />;
  }
  return <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-[13px] font-black text-white" style={{ backgroundColor: member.color }}>{initials || "?"}</div>;
};

function staffToDraft(member: StaffMember): typeof EMPTY_FORM {
  return {
    name: member.name,
    phone: member.phone ?? "",
    email: member.email ?? "",
    roleId: member.roleId ?? "role-hair-stylist",
    departmentIds: (member.departmentIds?.length ? member.departmentIds : ["dept-hair"]) as DepartmentId[],
    serviceIds: member.serviceIds ?? [],
    avatarUrl: member.avatarUrl ?? "",
    color: member.color,
    status: member.status,
  };
}

const Kpi: React.FC<{ icon: React.ElementType; label: string; value: string | number; sub: string }> = ({ icon: Icon, label, value, sub }) => (
  <div className="rounded-[24px] border border-[#EBDDD2] bg-white/70 p-4 shadow-[0_12px_34px_rgba(92,52,35,0.06)]">
    <div className="mb-3 flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#F8E5D8] text-[#7E7066]"><Icon className="h-4 w-4" /></span>
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#9A8B80]">{label}</p>
    </div>
    <p className="text-2xl font-black text-[#141414]">{value}</p>
    <p className="mt-1 text-[11px] font-semibold text-[#7E7066]">{sub}</p>
  </div>
);

const Field: React.FC<{ label: string; value: string; onChange: (value: string) => void }> = ({ label, value, onChange }) => (
  <label className="block">
    <span className="text-[11px] font-black text-[#7E7066]">{label}</span>
    <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 h-11 w-full rounded-2xl border border-[#EBDDD2] bg-white px-3 text-[13px] font-bold text-[#141414] outline-none transition focus:border-[#D7897F]" />
  </label>
);

export default StaffPage;
