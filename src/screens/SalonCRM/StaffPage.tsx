import React, { useEffect, useMemo, useState } from "react";
import { Award, Crosshair, ImageOff, Plus, Save, Star, Trash2, Upload, UserCog, Users, X } from "lucide-react";
import { useSiteTheme } from "../../contexts/SiteTheme";
import { useCrmT } from "./i18n/CrmLocale";
import { useCRMActions, useCRMSystemState, useServices, useStaff, useStaffPerformance } from "./data/crmHooks";
import type { StaffMember } from "./data/crmTypes";
import { listCrmServicesCatalog, type CrmServicesCatalog } from "./data/crmServicesApi";
import { canCallSalonRuntimeApi } from "./data/salonSession";
import { displayDepartmentName, displayServiceName, displayStaffName } from "./schedule/scheduleDisplayNames";

const AVATAR_THUMBNAIL_SIZE = 384;

const EMPTY_FORM = {
  name: "",
  phone: "",
  email: "",
  role: "",
  departmentIds: [] as string[],
  serviceIds: [] as string[],
  servicePriceOverrides: {} as Record<string, number>,
  avatarUrl: "",
  color: "#D7897F",
  status: "active" as StaffMember["status"],
};

function createEmptyDraft(): typeof EMPTY_FORM {
  return {
    ...EMPTY_FORM,
    departmentIds: [...EMPTY_FORM.departmentIds],
    serviceIds: [],
    servicePriceOverrides: {},
  };
}

const StaffPage: React.FC = () => {
  const { isDark } = useSiteTheme();
  const t = useCrmT();
  const staff = useStaff();
  const crmServices = useServices();
  const actions = useCRMActions();
  const systemState = useCRMSystemState();
  const performance = useStaffPerformance();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [saveError, setSaveError] = useState<string | null>(null);
  const isHebrew = t.common.add !== "Add";

  const [catalog, setCatalog] = useState<CrmServicesCatalog | null>(null);
  useEffect(() => {
    if (!canCallSalonRuntimeApi()) return;
    let cancelled = false;
    listCrmServicesCatalog()
      .then((data) => { if (!cancelled) setCatalog(data); })
      .catch((err) => console.warn("[StaffPage] catalog load failed, falling back to CRM services", err));
    return () => { cancelled = true; };
  }, []);

  const departments = useMemo(
    () => (catalog?.departments ?? []).filter((d) => d.status === "active"),
    [catalog],
  );

  const categories = useMemo(
    () => (catalog?.categories ?? []).filter((c) => c.status === "active"),
    [catalog],
  );

  const catalogServices = useMemo(
    () => (catalog?.services ?? []).filter((s) => s.status === "active"),
    [catalog],
  );

  const selectedStaff = staff.find((member) => member.id === editingId);

  const allStaffServices = useMemo(() => {
    if (catalogServices.length > 0) {
      return catalogServices.map((s) => ({ id: s.id, name: s.name, defaultPriceCents: s.defaultPriceCents }));
    }
    return crmServices.map((s) => ({ id: s.id, name: s.name, defaultPriceCents: s.defaultPriceCents }));
  }, [catalogServices, crmServices]);

  const servicePriceById = useMemo(() => {
    const map: Record<string, number> = {};
    for (const service of allStaffServices) map[service.id] = service.defaultPriceCents;
    return map;
  }, [allStaffServices]);

  const serviceOptions = useMemo(() => {
    if (draft.departmentIds.length === 0) return allStaffServices;
    if (catalogServices.length === 0) return allStaffServices;
    const deptCategoryIds = new Set(
      categories.filter((c) => draft.departmentIds.includes(c.departmentId)).map((c) => c.id),
    );
    return catalogServices
      .filter((s) => s.status === "active" && deptCategoryIds.has(s.categoryId))
      .map((s) => ({ id: s.id, name: s.name, defaultPriceCents: s.defaultPriceCents }));
  }, [draft.departmentIds, categories, catalogServices, allStaffServices]);

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
    setSaveError(null);
    setEditorOpen(true);
  };

  const startNew = () => {
    setEditingId(null);
    setDraft(createEmptyDraft());
    setSaveError(null);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditingId(null);
    setDraft(createEmptyDraft());
    setSaveError(null);
    setEditorOpen(false);
  };

  const toggleService = (serviceId: string) => {
    setDraft((prev) => {
      const isSelected = prev.serviceIds.includes(serviceId);
      const { [serviceId]: _removed, ...remainingOverrides } = prev.servicePriceOverrides;
      return {
        ...prev,
        serviceIds: isSelected
          ? prev.serviceIds.filter((id) => id !== serviceId)
          : [...prev.serviceIds, serviceId],
        // Deselecting a service drops any staff-specific price for it.
        servicePriceOverrides: isSelected ? remainingOverrides : prev.servicePriceOverrides,
      };
    });
  };

  const setServicePrice = (serviceId: string, rawValue: string) => {
    setDraft((prev) => {
      const { [serviceId]: _removed, ...rest } = prev.servicePriceOverrides;
      const trimmed = rawValue.trim();
      if (!trimmed) return { ...prev, servicePriceOverrides: rest };
      const parsed = Number(trimmed);
      if (!Number.isFinite(parsed) || parsed < 0) return prev;
      const cents = Math.round(parsed * 100);
      const defaultCents = servicePriceById[serviceId];
      if (defaultCents !== undefined && cents === defaultCents) return { ...prev, servicePriceOverrides: rest };
      return { ...prev, servicePriceOverrides: { ...rest, [serviceId]: cents } };
    });
  };

  const save = async () => {
    const servicePriceOverrides = Object.fromEntries(
      Object.entries(draft.servicePriceOverrides).filter(([serviceId]) => draft.serviceIds.includes(serviceId)),
    );
    setSaveError(null);
    const input = {
      name: draft.name.trim(),
      role: draft.role.trim() || selectedStaff?.role || "Staff",
      departmentIds: draft.departmentIds,
      serviceIds: draft.serviceIds,
      servicePriceOverrides,
      workingHours: selectedStaff?.workingHours ?? [{ dayOfWeek: 0, startHour: 9, endHour: 17 }],
      avatarUrl: draft.avatarUrl.trim() || undefined,
      phone: draft.phone.trim() || undefined,
      email: draft.email.trim() || undefined,
      color: draft.color,
      status: draft.status,
    };
    const result = editingId ? await actions.updateStaff(editingId, input) : await actions.createStaff(input);
    if (result.ok) {
      closeEditor();
      return;
    }
    setSaveError(result.error.message);
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(`Could not save staff: ${result.error.message}`);
    }
  };

  const archive = async (id: string) => {
    setSaveError(null);
    const result = await actions.archiveStaff(id);
    if (result.ok) {
      if (editingId === id) closeEditor();
      return;
    }
    setSaveError(result.error.message);
    if (typeof window !== "undefined" && typeof window.alert === "function") {
      window.alert(`Could not archive staff: ${result.error.message}`);
    }
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
                className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-start transition ${editorOpen && editingId === member.id ? "border-[#D7897F] bg-[#FFF6F2]" : "border-[#EFE4DA] bg-white/58 hover:bg-white"}`}
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
                    {(member.departmentIds ?? []).map((id) => {
                      const dept = departments.find((d) => d.id === id);
                      return dept ? displayDepartmentName(dept.name, isHebrew) : id;
                    }).join(" · ") || "—"}
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

        {editorOpen ? (
        <section className="rounded-[30px] border border-[#EBDDD2] bg-[#FFFDF9]/82 p-4 shadow-[0_18px_45px_rgba(92,52,35,0.08)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9A8B80]">{editingId ? (isHebrew ? "עריכת עובד" : "Edit staff") : (isHebrew ? "עובד חדש" : "New staff")}</p>
              <h2 className="mt-1 text-lg font-black text-[#141414]">{draft.name || (isHebrew ? "פרטי עובד" : "Staff details")}</h2>
            </div>
            <div className="flex items-center gap-2">
              {editingId && (
                <button type="button" onClick={() => void archive(editingId)} className="inline-flex h-9 items-center gap-2 rounded-xl bg-[#F1ECE7] px-3 text-[11px] font-black text-[#7E7066]">
                  <Trash2 className="h-3.5 w-3.5" />
                  {isHebrew ? "השבת" : "Archive"}
                </button>
              )}
              <button type="button" onClick={closeEditor} className="grid h-9 w-9 place-items-center rounded-xl bg-[#F1ECE7] text-[#7E7066] transition hover:bg-[#EBDDD2] hover:text-[#141414]" aria-label={isHebrew ? "סגור טופס" : "Close form"}>
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label={isHebrew ? "שם מלא" : "Full name"} value={draft.name} onChange={(value) => setDraft((prev) => ({ ...prev, name: value }))} />
            <Field label={isHebrew ? "טלפון" : "Phone"} value={draft.phone} onChange={(value) => setDraft((prev) => ({ ...prev, phone: value }))} />
            <Field label={isHebrew ? "אימייל" : "Email"} value={draft.email} onChange={(value) => setDraft((prev) => ({ ...prev, email: value }))} />
            <PhotoUploader
              value={draft.avatarUrl}
              color={draft.color}
              displayName={draft.name || selectedStaff?.name || ""}
              isHebrew={isHebrew}
              onChange={(avatarUrl) => setDraft((prev) => ({ ...prev, avatarUrl }))}
            />
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <Field label={isHebrew ? "תפקיד מקצועי" : "Role"} value={draft.role} onChange={(value) => setDraft((prev) => ({ ...prev, role: value }))} />
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
              {departments.length === 0 && (
                <p className="text-[10px] font-semibold text-[#9A8B80]">{isHebrew ? "אין מחלקות – הגדירו בקטלוג השירותים" : "No departments – configure in service catalog"}</p>
              )}
              {departments.map((dept) => {
                const active = draft.departmentIds.includes(dept.id);
                const tone = dept.calendarColor ?? "#D7897F";
                return (
                  <button key={dept.id} type="button" onClick={() => setDraft((prev) => ({ ...prev, departmentIds: [dept.id], color: tone, serviceIds: [], servicePriceOverrides: {} }))} className={`rounded-2xl border px-3 py-2 text-[11px] font-black transition ${active ? "border-transparent text-white" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`} style={active ? { backgroundColor: tone } : undefined}>
                    {displayDepartmentName(dept.name, isHebrew)}
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
            <p className="mt-1 text-[10px] font-semibold text-[#9A8B80]">
              {isHebrew ? "אפשר לקבוע מחיר אישי לעובד לכל שירות; ריק = מחיר ברירת המחדל." : "Set a per-staff price for any service; leave blank to use the default price."}
            </p>
            <div className="mt-2 grid max-h-[220px] gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {serviceOptions.map((service) => {
                const active = draft.serviceIds.includes(service.id);
                const defaultPrice = service.defaultPriceCents / 100;
                const overrideCents = draft.servicePriceOverrides[service.id];
                return (
                  <div key={service.id} className={`flex items-center gap-2 rounded-2xl border px-2.5 py-1.5 transition ${active ? "border-[#D7897F] bg-[#FFF1EC]" : "border-[#EFE4DA] bg-white/70"}`}>
                    <button
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`min-w-0 flex-1 truncate text-start text-[11px] font-bold ${active ? "text-[#141414]" : "text-[#7E7066]"}`}
                    >
                      {displayServiceName(service.name, isHebrew)}
                    </button>
                    {active && (
                      <div className="flex shrink-0 items-center gap-1">
                        <span className="text-[10px] font-black text-[#9A8B80]">₪</span>
                        <input
                          type="number"
                          min={0}
                          inputMode="decimal"
                          value={overrideCents !== undefined ? overrideCents / 100 : ""}
                          placeholder={String(defaultPrice)}
                          onChange={(event) => setServicePrice(service.id, event.target.value)}
                          className="h-7 w-16 rounded-lg border border-[#EBDDD2] bg-white px-1.5 text-[11px] font-bold text-[#141414] outline-none focus:border-[#D7897F]"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <button type="button" onClick={() => void save()} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#141414] px-5 text-[12px] font-black text-white">
              <Save className="h-4 w-4" />
              {isHebrew ? "שמירה" : "Save"}
            </button>
            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, avatarUrl: "" }))} className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#F1ECE7] px-4 text-[12px] font-black text-[#7E7066]">
              <ImageOff className="h-4 w-4" />
              {isHebrew ? "הסר תמונה" : "Remove photo"}
            </button>
            {saveError && (
              <p className="basis-full text-[11px] font-bold text-[#B05F57]">{saveError}</p>
            )}
          </div>
        </section>
        ) : (
          <section className="grid min-h-[360px] place-items-center rounded-[30px] border border-dashed border-[#EBDDD2] bg-[#FFFDF9]/62 p-6 text-center shadow-[0_18px_45px_rgba(92,52,35,0.06)]">
            <div className="max-w-[360px]">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-3xl bg-[#F8E5D8] text-[#B05F57]">
                <UserCog className="h-6 w-6" />
              </div>
              <h2 className="mt-4 text-lg font-black text-[#141414]">{isHebrew ? "בחרו עובד לעריכה" : "Select staff to edit"}</h2>
              <p className="mt-2 text-[12px] font-semibold leading-5 text-[#7E7066]">
                {isHebrew
                  ? "הטופס ייפתח רק כשבוחרים עובד מהרשימה או כשיוצרים עובד חדש, כדי שהמסך לא יהיה עמוס תמיד."
                  : "The form opens only when you select a team member or create a new one, keeping this screen lighter."}
              </p>
              <button type="button" onClick={startNew} className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-[#141414] px-4 text-[12px] font-black text-white">
                <Plus className="h-4 w-4" />
                {isHebrew ? "עובד חדש" : "New staff"}
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

const Avatar: React.FC<{ member: StaffMember }> = ({ member }) => {
  const initials = member.name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-full border border-white/80 object-cover shadow-[0_10px_22px_rgba(55,36,28,0.12)]"
        style={{ boxShadow: `0 0 0 2px ${member.color}, 0 10px 22px rgba(55,36,28,0.12)` }}
      />
    );
  }
  return (
    <div
      className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/80 text-[13px] font-black text-white shadow-[0_10px_22px_rgba(55,36,28,0.12)]"
      style={{ backgroundColor: member.color, boxShadow: `0 0 0 2px ${member.color}, 0 10px 22px rgba(55,36,28,0.12)` }}
    >
      {initials || "?"}
    </div>
  );
};

const PhotoUploader: React.FC<{
  value: string;
  color: string;
  displayName: string;
  isHebrew: boolean;
  onChange: (value: string) => void;
}> = ({ value, color, displayName, isHebrew, onChange }) => {
  const [source, setSource] = useState<string | null>(null);
  const [focusX, setFocusX] = useState(50);
  const [focusY, setFocusY] = useState(42);
  const [zoom, setZoom] = useState(1.18);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initials = displayName.split(/\s+/).filter(Boolean).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const applyCrop = async (nextSource = source, nextFocusX = focusX, nextFocusY = focusY, nextZoom = zoom) => {
    if (!nextSource) return;
    setBusy(true);
    setError(null);
    try {
      const thumbnail = await createAvatarThumbnail(nextSource, {
        focusX: nextFocusX,
        focusY: nextFocusY,
        zoom: nextZoom,
      });
      onChange(thumbnail);
    } catch (err) {
      console.error("[StaffPage] failed to prepare avatar", err);
      setError(isHebrew ? "לא הצלחנו להכין את התמונה. נסו קובץ אחר." : "Could not prepare this image. Try another file.");
    } finally {
      setBusy(false);
    }
  };

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError(isHebrew ? "בחרו קובץ תמונה בלבד." : "Please choose an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result ?? "");
      setSource(dataUrl);
      setFocusX(50);
      setFocusY(42);
      setZoom(1.18);
      void applyCrop(dataUrl, 50, 42, 1.18);
    };
    reader.onerror = () => setError(isHebrew ? "לא הצלחנו לקרוא את הקובץ." : "Could not read this file.");
    reader.readAsDataURL(file);
  };

  const preview = value || source;

  return (
    <div className="sm:col-span-2 rounded-[24px] border border-[#EBDDD2] bg-white/58 p-3">
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-full border border-white/80 bg-[#F8F0E6] text-[15px] font-black text-white shadow-[0_14px_30px_rgba(55,36,28,0.14)]" style={{ boxShadow: `0 0 0 3px ${color}, 0 14px 30px rgba(55,36,28,0.14)` }}>
            {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : <span style={{ color }}>{initials || "?"}</span>}
          </div>
          <div>
            <p className="flex items-center gap-1.5 text-[12px] font-black text-[#141414]">
              <Crosshair className="h-3.5 w-3.5 text-[#B05F57]" />
              {isHebrew ? "תמונת פרופיל עגולה" : "Circular profile photo"}
            </p>
            <p className="mt-1 max-w-[360px] text-[11px] font-semibold leading-5 text-[#7E7066]">
              {isHebrew
                ? "העלו תמונה, מקדו את הפנים ושמרו thumbnail דחוס במקום את הקובץ המקורי."
                : "Upload, focus the face, and save a compressed thumbnail instead of the original file."}
            </p>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#141414] px-4 text-[12px] font-black text-white">
            <Upload className="h-4 w-4" />
            {isHebrew ? "העלאת תמונה" : "Upload photo"}
            <input type="file" accept="image/*" onChange={handleFile} className="sr-only" />
          </label>

          {source && (
            <div className="grid gap-2 sm:grid-cols-3">
              <Range label={isHebrew ? "ימין / שמאל" : "Left / right"} value={focusX} min={0} max={100} onChange={(next) => { setFocusX(next); void applyCrop(source, next, focusY, zoom); }} />
              <Range label={isHebrew ? "למעלה / למטה" : "Up / down"} value={focusY} min={0} max={100} onChange={(next) => { setFocusY(next); void applyCrop(source, focusX, next, zoom); }} />
              <Range label={isHebrew ? "זום" : "Zoom"} value={zoom} min={1} max={2.4} step={0.02} onChange={(next) => { setZoom(next); void applyCrop(source, focusX, focusY, next); }} />
            </div>
          )}

          {busy && <p className="text-[10px] font-bold text-[#9A8B80]">{isHebrew ? "מכין תמונה..." : "Preparing photo..."}</p>}
          {error && <p className="text-[10px] font-bold text-[#B05F57]">{error}</p>}
        </div>
      </div>
    </div>
  );
};

const Range: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}> = ({ label, value, min, max, step = 1, onChange }) => (
  <label className="block">
    <span className="text-[10px] font-black text-[#7E7066]">{label}</span>
    <input
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
      className="mt-1 w-full accent-[#D7897F]"
    />
  </label>
);

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function createAvatarThumbnail(
  source: string,
  options: { focusX: number; focusY: number; zoom: number },
): Promise<string> {
  const img = await loadImage(source);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_THUMBNAIL_SIZE;
  canvas.height = AVATAR_THUMBNAIL_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  ctx.fillStyle = "#FFF8F0";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight) * options.zoom;
  const focusX = img.naturalWidth * (options.focusX / 100);
  const focusY = img.naturalHeight * (options.focusY / 100);
  const dx = canvas.width / 2 - focusX * scale;
  const dy = canvas.height / 2 - focusY * scale;

  ctx.drawImage(img, dx, dy, img.naturalWidth * scale, img.naturalHeight * scale);
  return canvas.toDataURL("image/webp", 0.82);
}

function staffToDraft(member: StaffMember): typeof EMPTY_FORM {
  return {
    name: member.name,
    phone: member.phone ?? "",
    email: member.email ?? "",
    role: member.role ?? "",
    departmentIds: member.departmentIds?.length ? [...member.departmentIds] : [],
    serviceIds: member.serviceIds ?? [],
    servicePriceOverrides: { ...(member.servicePriceOverrides ?? {}) },
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
