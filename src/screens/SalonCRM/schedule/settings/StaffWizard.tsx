/**
 * Four-step staff create/edit flow.
 *
 * Steps: Profile → Professional setup → Availability → System access.
 * The first choice ("employee only" vs "employee with system access") decides
 * whether the fourth step (invitation + access role) is offered at all, exactly
 * as the plan requires. All data is live:
 *   * The staff record is written through `useCRMActions` (→ salon-staff).
 *   * Professional-role assignments are synced through the professional-roles
 *     API (assignment upsert/delete).
 *   * A system-access invitation is created through the invitations API, which
 *     returns a one-time code shown once for out-of-band delivery.
 */

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Loader2, MoveHorizontal, MoveVertical, ShieldCheck, Trash2, Upload, UserPlus, X, ZoomIn } from "lucide-react";
import { useCrmT } from "../../i18n/CrmLocale";
import { useCRMActions } from "../../data/crmHooks";
import type { SalonWorkingHours, StaffMember } from "../../data/crmTypes";
import type { ProfessionalRole, StaffProfessionalRole } from "../../data/crmTypes";
import { useScheduleCatalog } from "../ScheduleCatalogProvider";
import { deleteRoleAssignment, upsertRoleAssignment } from "../../data/salonProfessionalRolesApi";
import { createInvitation } from "../../data/salonInvitationsApi";
import { salonApiErrorMessage } from "../../data/salonApiClient";
import { INVITABLE_ACCESS_ROLES, type PermissionSet } from "../../data/accessControl";
import { displayDepartmentName, displayServiceName } from "../scheduleDisplayNames";
import {
  Field,
  GhostButton,
  PrimaryButton,
  createSettingsAvatarThumbnail,
  initialsFromName,
  useSettingsStyles,
} from "./settingsUi";
import {
  buildStaffWizardStepKeys,
  clampStepIndex,
  resolveStaffWizardStepKey,
  type StaffWizardAccessType,
} from "./staffWizardSteps";

type AccessType = StaffWizardAccessType;

interface Props {
  isDark: boolean;
  staff: StaffMember | null;
  roles: ProfessionalRole[];
  assignments: StaffProfessionalRole[];
  permissions: PermissionSet;
  onClose: () => void;
  onSaved: () => void;
}

const WEEK_DAYS = [0, 1, 2, 3, 4, 5, 6];

function dayLabel(day: number, isHebrew: boolean): string {
  const en = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const he = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  return isHebrew ? he[day] : en[day];
}

interface DayHours {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

function buildWeekFromStaff(staff: StaffMember | null): DayHours[] {
  return WEEK_DAYS.map((day) => {
    const wh = staff?.workingHours?.find((w) => w.dayOfWeek === day);
    return wh
      ? { enabled: true, startHour: wh.startHour, endHour: wh.endHour }
      : { enabled: day >= 0 && day <= 4, startHour: 9, endHour: 18 };
  });
}

function weekToWorkingHours(week: DayHours[]): SalonWorkingHours[] {
  return week
    .map((d, day) => (d.enabled ? { dayOfWeek: day, startHour: d.startHour, endHour: d.endHour } : null))
    .filter((v): v is SalonWorkingHours => Boolean(v));
}

export const StaffWizard: React.FC<Props> = ({ isDark, staff, roles, assignments, permissions, onClose, onSaved }) => {
  const t = useCrmT();
  const isHebrew = t.common.add !== "Add";
  const s = useSettingsStyles(isDark);
  const actions = useCRMActions();
  const catalog = useScheduleCatalog();

  const editing = Boolean(staff);
  const staffAssignments = useMemo(
    () => assignments.filter((a) => staff && a.staffMemberId === staff.id),
    [assignments, staff],
  );

  const [step, setStep] = useState(0);
  const [accessType, setAccessType] = useState<AccessType>(staff?.userId ? "with_access" : "employee_only");

  // Profile
  const [name, setName] = useState(staff?.name ?? "");
  const [phone, setPhone] = useState(staff?.phone ?? "");
  const [email, setEmail] = useState(staff?.email ?? "");
  const [avatarUrl, setAvatarUrl] = useState(staff?.avatarUrl ?? "");
  const [color, setColor] = useState(staff?.color ?? "#D7897F");
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarEditorSource, setAvatarEditorSource] = useState<string | null>(null);
  const [avatarEditorOpen, setAvatarEditorOpen] = useState(false);
  const [avatarZoom, setAvatarZoom] = useState(1);
  const [avatarOffsetX, setAvatarOffsetX] = useState(0);
  const [avatarOffsetY, setAvatarOffsetY] = useState(0);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  // Professional
  const [jobTitle, setJobTitle] = useState(staff?.role ?? "");
  const [departmentIds, setDepartmentIds] = useState<string[]>(staff?.departmentIds ?? []);
  const [roleIds, setRoleIds] = useState<string[]>(
    staffAssignments.length ? staffAssignments.map((a) => a.professionalRoleId) : staff?.professionalRoleIds ?? [],
  );
  const [serviceIds, setServiceIds] = useState<string[]>(staff?.serviceIds ?? []);
  const [priceOverrides, setPriceOverrides] = useState<Record<string, number>>(staff?.servicePriceOverrides ?? {});

  // Availability
  const [week, setWeek] = useState<DayHours[]>(() => buildWeekFromStaff(staff));
  const [isBookable, setIsBookable] = useState<boolean>(staff?.isBookable ?? true);

  // System access
  const [accessRoleKey, setAccessRoleKey] = useState<string>("reception");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // Id of the persisted staff record. Present immediately when editing, and
  // set after a successful create so an invitation can never be issued for an
  // unsaved member.
  const [savedStaffId, setSavedStaffId] = useState<string | null>(staff?.id ?? null);
  // Non-blocking warning when the professional-role assignment sync partially
  // failed even though the staff record itself saved.
  const [roleSyncWarning, setRoleSyncWarning] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const activeDepartments = catalog.state.departments.filter((d) => d.status === "active");
  const activeRoles = roles.filter((r) => r.status === "active");

  const serviceOptions = useMemo(() => {
    const activeServices = catalog.state.services.filter((svc) => svc.status === "active");
    if (departmentIds.length === 0) return activeServices;
    const deptCategoryIds = new Set(
      catalog.state.categories.filter((c) => departmentIds.includes(c.departmentId)).map((c) => c.id),
    );
    return activeServices.filter((svc) => deptCategoryIds.has(svc.categoryId));
  }, [catalog.state.services, catalog.state.categories, departmentIds]);

  const stepLabels: Record<string, string> = {
    profile: isHebrew ? "פרופיל" : "Profile",
    professional: isHebrew ? "הגדרה מקצועית" : "Professional",
    availability: isHebrew ? "זמינות" : "Availability",
    access: isHebrew ? "גישה למערכת" : "System access",
  };
  const stepKeys = buildStaffWizardStepKeys(accessType);
  const steps = stepKeys.map((key) => ({ key, label: stepLabels[key] }));
  const lastStep = steps.length - 1;

  // Switching from "with_access" to "employee only" drops the access step. If
  // the user was already on (or past) it, clamp back into range so
  // `steps[step]` can never be undefined and the wizard cannot crash.
  useEffect(() => {
    setStep((v) => clampStepIndex(v, steps.length));
  }, [steps.length]);

  // Always read the current step through a guarded lookup: `steps[step]` is
  // briefly stale during the render that shrinks the array (before the clamp
  // effect runs), and an undefined `.key` would throw.
  const currentStepKey = resolveStaffWizardStepKey(stepKeys, step);

  const toggleFromArray = (arr: string[], id: string) => (arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]);

  const handleAvatarFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    setAvatarBusy(true);
    setAvatarError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const source = String(reader.result ?? "");
      if (source) {
        setAvatarEditorSource(source);
        setAvatarZoom(1);
        setAvatarOffsetX(0);
        setAvatarOffsetY(0);
        setAvatarEditorOpen(true);
      }
      setAvatarBusy(false);
    };
    reader.onerror = () => {
      setAvatarBusy(false);
      setAvatarError(isHebrew ? "לא הצלחנו לקרוא את התמונה." : "We couldn't read this image.");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const openAvatarEditor = () => {
    if (!avatarUrl) return;
    setAvatarError(null);
    setAvatarEditorSource(avatarUrl);
    setAvatarZoom(1);
    setAvatarOffsetX(0);
    setAvatarOffsetY(0);
    setAvatarEditorOpen(true);
  };

  const applyAvatarCrop = async () => {
    if (!avatarEditorSource) return;
    setAvatarBusy(true);
    setAvatarError(null);
    try {
      const thumb = await createSettingsAvatarThumbnail(avatarEditorSource, avatarZoom, avatarOffsetX, avatarOffsetY);
      setAvatarUrl(thumb);
      setAvatarEditorOpen(false);
      setAvatarEditorSource(null);
    } catch {
      setAvatarError(isHebrew ? "לא הצלחנו לשמור את החיתוך. נסה תמונה אחרת." : "We couldn't save the crop. Try a different image.");
    } finally {
      setAvatarBusy(false);
    }
  };

  const canProceed = (() => {
    if (currentStepKey === "profile") return name.trim().length > 0;
    return true;
  })();

  /**
   * Sync professional-role assignments for the saved staff member. Returns the
   * number of individual assignment operations that failed so the caller can
   * surface a clear (non-blocking) warning instead of silently swallowing them.
   */
  const syncRoleAssignments = async (staffId: string): Promise<{ failures: number }> => {
    const current = staffAssignments;
    const currentRoleIds = new Set(current.map((a) => a.professionalRoleId));
    const nextRoleIds = new Set(roleIds);
    let failures = 0;
    const track = (p: Promise<unknown>) =>
      p.then(() => undefined).catch(() => {
        failures += 1;
      });
    // Remove deselected assignments.
    await Promise.all(
      current
        .filter((a) => !nextRoleIds.has(a.professionalRoleId))
        .map((a) => track(deleteRoleAssignment(a.id))),
    );
    // Add newly selected assignments; first selected role is primary.
    const additions = roleIds.filter((id) => !currentRoleIds.has(id));
    await Promise.all(
      additions.map((professionalRoleId, index) =>
        track(
          upsertRoleAssignment({
            staffMemberId: staffId,
            professionalRoleId,
            isPrimary: index === 0 && current.length === 0,
          }),
        ),
      ),
    );
    return { failures };
  };

  const handleSave = async () => {
    setSaveError(null);
    setRoleSyncWarning(null);
    setSaving(true);
    try {
      const primaryRoleName = roles.find((r) => r.id === roleIds[0])?.name;
      const cleanOverrides = Object.fromEntries(
        Object.entries(priceOverrides).filter(([id]) => serviceIds.includes(id)),
      );
      const input = {
        name: name.trim(),
        role: jobTitle.trim() || primaryRoleName || staff?.role || (isHebrew ? "צוות" : "Staff"),
        departmentIds,
        serviceIds,
        servicePriceOverrides: cleanOverrides,
        workingHours: weekToWorkingHours(week),
        isBookable,
        avatarUrl: avatarUrl || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        color,
        status: (staff?.status ?? "active") as StaffMember["status"],
      };
      const result = editing && staff
        ? await actions.updateStaff(staff.id, input)
        : await actions.createStaff(input);
      if (!result.ok) {
        setSaveError(result.error.message);
        setSaving(false);
        return;
      }
      const savedId = result.data?.id ?? staff?.id ?? null;
      setSavedStaffId(savedId);
      if (savedId) {
        try {
          const { failures } = await syncRoleAssignments(savedId);
          if (failures > 0) {
            setRoleSyncWarning(
              isHebrew
                ? "העובד/ת נשמר/ה, אך חלק מהתפקידים המקצועיים לא סונכרנו. פתחו שוב לניסיון נוסף."
                : "Member saved, but some professional roles didn't sync. Reopen to retry.",
            );
          }
        } catch (err) {
          setRoleSyncWarning(
            isHebrew
              ? "העובד/ת נשמר/ה, אך סנכרון התפקידים המקצועיים נכשל."
              : "Member saved, but professional-role sync failed.",
          );
          console.warn("[StaffWizard] role assignment sync issue", err);
        }
      }
      onSaved();
      // Keep the wizard open when the operator still needs to send a system
      // access invitation for the freshly saved member — otherwise closing
      // here would make it impossible to invite without reopening. Once the
      // one-time code has been issued (or on any non-access flow) we close.
      const keepOpenForInvite =
        currentStepKey === "access" &&
        permissions.canManagePermissions &&
        !staff?.userId &&
        !inviteCode;
      setSaving(false);
      if (!keepOpenForInvite) onClose();
    } catch (err) {
      setSaveError(salonApiErrorMessage(err));
      setSaving(false);
    }
  };

  const handleSendInvitation = async () => {
    setInviteError(null);
    if (!savedStaffId) {
      setInviteError(isHebrew ? "יש לשמור את פרטי העובד/ת לפני שליחת הזמנה." : "Save the member's details before sending an invitation.");
      return;
    }
    if (!email.trim() && !phone.trim()) {
      setInviteError(isHebrew ? "נדרש אימייל או טלפון כדי לשלוח הזמנה." : "An email or phone is required to send an invitation.");
      return;
    }
    setInviteBusy(true);
    try {
      const result = await createInvitation({
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        role: accessRoleKey,
      });
      setInviteCode(result.code);
    } catch (err) {
      setInviteError(salonApiErrorMessage(err));
    } finally {
      setInviteBusy(false);
    }
  };

  const copyCode = async () => {
    if (!inviteCode) return;
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  const NextIcon = isHebrew ? ChevronLeft : ChevronRight;
  const BackIcon = isHebrew ? ChevronRight : ChevronLeft;

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className={`relative z-10 flex max-h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] border ${
          isDark ? "border-white/10 bg-[#1c1c1c]" : "border-[#EBDDD2] bg-[#FFFDF9]"
        } shadow-[0_24px_70px_rgba(55,36,28,0.28)]`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-white/10" : "border-[#EFE3DA]"}`}>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#B05F57]">
              {editing ? (isHebrew ? "עריכת עובד" : "Edit team member") : (isHebrew ? "עובד חדש" : "New team member")}
            </p>
            <h2 className={`mt-0.5 text-lg font-black ${s.textStrong}`}>{name || (isHebrew ? "פרטי עובד" : "Staff details")}</h2>
          </div>
          <button type="button" onClick={onClose} className={`grid h-9 w-9 place-items-center rounded-xl ${isDark ? "bg-white/10 text-white/70" : "bg-[#F1ECE7] text-[#7E7066]"}`} aria-label={isHebrew ? "סגור" : "Close"}>
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className={`flex items-center gap-1 border-b px-5 py-3 ${isDark ? "border-white/10" : "border-[#EFE3DA]"}`}>
          {steps.map((st, index) => (
            <React.Fragment key={st.key}>
              <button
                type="button"
                onClick={() => index <= step && setStep(index)}
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black transition-colors ${
                  index === step
                    ? "bg-[#D7897F] text-white"
                    : index < step
                      ? isDark ? "text-white/70" : "text-[#B05F57]"
                      : isDark ? "text-white/35" : "text-[#9A8B80]"
                }`}
              >
                <span className={`grid h-5 w-5 place-items-center rounded-full text-[10px] ${index === step ? "bg-white/25" : index < step ? "bg-[#96C7B3]/40" : isDark ? "bg-white/10" : "bg-black/[0.06]"}`}>
                  {index < step ? <Check className="h-3 w-3" /> : index + 1}
                </span>
                <span className="hidden sm:inline">{st.label}</span>
              </button>
              {index < steps.length - 1 && <span className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-[#EFE3DA]"}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {currentStepKey === "profile" && (
            <div className="space-y-4">
              <div>
                <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "סוג העובד" : "Team member type"}</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <AccessTypeCard
                    isDark={isDark}
                    active={accessType === "employee_only"}
                    title={isHebrew ? "עובד בלבד" : "Employee only"}
                    description={isHebrew ? "מופיע ביומן ובשיבוץ; ללא כניסה למערכת." : "Appears on the calendar; no system login."}
                    icon={<UserPlus className="h-4 w-4" />}
                    onClick={() => setAccessType("employee_only")}
                  />
                  <AccessTypeCard
                    isDark={isDark}
                    active={accessType === "with_access"}
                    title={isHebrew ? "עובד עם גישה" : "Employee with access"}
                    description={isHebrew ? "עובד + הזמנה והרשאות כניסה למערכת." : "Employee plus an invitation and system permissions."}
                    icon={<ShieldCheck className="h-4 w-4" />}
                    onClick={() => setAccessType("with_access")}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full border border-white/80 text-[15px] font-black text-white" style={{ background: color, boxShadow: `0 0 0 3px ${color}` }}>
                  {avatarUrl ? <img src={avatarUrl} alt="" className="h-full w-full object-cover" /> : initialsFromName(name)}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className={`inline-flex h-9 cursor-pointer items-center gap-2 rounded-lg px-3 text-[11px] font-black ${isDark ? "bg-white/10 text-white/80" : "bg-[#141414] text-white"}`}>
                    {avatarBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                    {isHebrew ? "העלאת תמונה" : "Upload photo"}
                    <input type="file" accept="image/*" onChange={handleAvatarFile} className="sr-only" />
                  </label>
                  {avatarUrl && (
                    <>
                      <GhostButton isDark={isDark} onClick={openAvatarEditor}>
                        <ZoomIn className="h-3.5 w-3.5" /> {isHebrew ? "עריכת תמונה" : "Edit photo"}
                      </GhostButton>
                      <GhostButton isDark={isDark} onClick={() => setAvatarUrl("")}>
                        <Trash2 className="h-3.5 w-3.5" /> {isHebrew ? "הסר" : "Remove"}
                      </GhostButton>
                    </>
                  )}
                </div>
              </div>
              {avatarError && <p className="text-[11px] font-bold text-[#B05F57]" role="alert">{avatarError}</p>}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field isDark={isDark} label={isHebrew ? "שם מלא" : "Full name"} value={name} onChange={setName} />
                <Field isDark={isDark} label={isHebrew ? "טלפון" : "Phone"} value={phone} onChange={setPhone} type="tel" />
                <Field isDark={isDark} label={isHebrew ? "אימייל" : "Email"} value={email} onChange={setEmail} type="email" />
                <div>
                  <span className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "צבע ביומן" : "Calendar color"}</span>
                  <div className="mt-1.5">
                    <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-11 w-full cursor-pointer rounded-lg border border-[#EBDDD2] bg-transparent" aria-label={isHebrew ? "צבע ביומן" : "Calendar color"} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {currentStepKey === "professional" && (
            <div className="space-y-4">
              <Field isDark={isDark} label={isHebrew ? "תפקיד / כותרת" : "Job title"} value={jobTitle} onChange={setJobTitle} placeholder={isHebrew ? "למשל מעצבת בכירה" : "e.g. Senior stylist"} hint={isHebrew ? "אם ריק, ייגזר מהתפקיד המקצועי הראשי." : "If blank, derived from the primary professional role."} />

              <div>
                <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "מחלקות" : "Departments"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeDepartments.length === 0 && <span className={`text-[11px] ${s.textFaint}`}>{isHebrew ? "אין מחלקות – הגדירו בשירותים ומחלקות" : "No departments — configure in Services & departments"}</span>}
                  {activeDepartments.map((dept) => {
                    const active = departmentIds.includes(dept.id);
                    return (
                      <button key={dept.id} type="button" onClick={() => setDepartmentIds((prev) => toggleFromArray(prev, dept.id))} className={`rounded-full border px-3 py-1.5 text-[11px] font-black transition ${active ? "border-transparent text-white" : isDark ? "border-white/15 text-white/60" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`} style={active ? { background: dept.calendarColor ?? "#D7897F" } : undefined}>
                        {displayDepartmentName(dept.name, isHebrew)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "תפקידים מקצועיים" : "Professional roles"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeRoles.length === 0 && <span className={`text-[11px] ${s.textFaint}`}>{isHebrew ? "אין תפקידים מקצועיים – הוסיפו בלשונית התפקידים" : "No professional roles — add them in the Roles tab"}</span>}
                  {activeRoles.map((role) => {
                    const active = roleIds.includes(role.id);
                    return (
                      <button key={role.id} type="button" onClick={() => setRoleIds((prev) => toggleFromArray(prev, role.id))} className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[11px] font-black transition ${active ? "border-transparent text-white" : isDark ? "border-white/15 text-white/60" : "border-[#EBDDD2] bg-white text-[#7E7066]"}`} style={active ? { background: role.color ?? "#6398A9" } : undefined}>
                        {role.name}
                        {active && <Check className="h-3 w-3" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "שירותים מותרים" : "Allowed services"}</p>
                  <button type="button" onClick={() => setServiceIds(serviceOptions.map((svc) => svc.id))} className="text-[10px] font-black text-[#B05F57]">
                    {isHebrew ? "בחר הכל" : "Select all"}
                  </button>
                </div>
                <p className={`mt-1 text-[10px] font-semibold ${s.textFaint}`}>{isHebrew ? "מחיר אישי אופציונלי לכל שירות; ריק = מחיר ברירת מחדל." : "Optional per-staff price; blank uses the default."}</p>
                <div className="mt-2 grid max-h-[240px] gap-2 overflow-y-auto pe-1 sm:grid-cols-2">
                  {serviceOptions.length === 0 && <span className={`text-[11px] ${s.textFaint}`}>{isHebrew ? "אין שירותים זמינים" : "No services available"}</span>}
                  {serviceOptions.map((svc) => {
                    const active = serviceIds.includes(svc.id);
                    const override = priceOverrides[svc.id];
                    return (
                      <div key={svc.id} className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 ${active ? "border-[#D7897F] bg-[#FFF1EC]" : isDark ? "border-white/10 bg-white/[0.03]" : "border-[#EFE4DA] bg-white/70"}`}>
                        <button type="button" onClick={() => setServiceIds((prev) => toggleFromArray(prev, svc.id))} className={`min-w-0 flex-1 truncate text-start text-[11px] font-bold ${active ? "text-[#141414]" : s.textSoft}`}>
                          {displayServiceName(svc.name, isHebrew)}
                        </button>
                        {active && (
                          <div className="flex shrink-0 items-center gap-1">
                            <span className="text-[10px] font-black text-[#9A8B80]">₪</span>
                            <input
                              type="number"
                              min={0}
                              value={override !== undefined ? override / 100 : ""}
                              placeholder={String(svc.defaultPriceCents / 100)}
                              onChange={(e) => {
                                const raw = e.target.value.trim();
                                setPriceOverrides((prev) => {
                                  const { [svc.id]: _drop, ...rest } = prev;
                                  if (!raw) return rest;
                                  const cents = Math.round(Number(raw) * 100);
                                  if (!Number.isFinite(cents) || cents < 0) return prev;
                                  return { ...rest, [svc.id]: cents };
                                });
                              }}
                              className="h-7 w-16 rounded border border-[#EBDDD2] bg-white px-1.5 text-[11px] font-bold text-[#141414] outline-none focus:border-[#D7897F]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {currentStepKey === "availability" && (
            <div className="space-y-2">
              <div className={`flex items-start justify-between gap-3 rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[#EFE4DA] bg-white/70"}`}>
                <div className="min-w-0">
                  <p className={`text-[12px] font-black ${s.textStrong}`}>{isHebrew ? "זמין/ה לשיבוץ ביומן" : "Bookable on the calendar"}</p>
                  <p className={`mt-0.5 text-[10px] font-semibold leading-4 ${s.textFaint}`}>
                    {isHebrew
                      ? "כשמכובה, העובד/ת נשאר/ת פעיל/ה אך לא ניתן לשבץ תורים חדשים."
                      : "When off, the member stays active but takes no new appointments."}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isBookable}
                  onClick={() => setIsBookable((v) => !v)}
                  className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${isBookable ? "bg-[#96C7B3]" : isDark ? "bg-white/15" : "bg-[#E3D6CC]"}`}
                  aria-label={isHebrew ? "זמין/ה לשיבוץ" : "Bookable"}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${isBookable ? "start-[22px]" : "start-0.5"}`} />
                </button>
              </div>
              <p className={`pt-1 text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "שעות עבודה שבועיות" : "Weekly working hours"}</p>
              {week.map((day, index) => (
                <div key={index} className={`flex flex-wrap items-center gap-3 rounded-lg border px-3 py-2 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[#EFE4DA] bg-white/70"}`}>
                  <label className="flex min-w-[110px] items-center gap-2 text-[12px] font-black">
                    <input type="checkbox" checked={day.enabled} onChange={(e) => setWeek((prev) => prev.map((d, i) => (i === index ? { ...d, enabled: e.target.checked } : d)))} />
                    <span className={s.textStrong}>{dayLabel(index, isHebrew)}</span>
                  </label>
                  {day.enabled ? (
                    <div className="flex items-center gap-2">
                      <HourSelect isDark={isDark} value={day.startHour} onChange={(v) => setWeek((prev) => prev.map((d, i) => (i === index ? { ...d, startHour: v } : d)))} />
                      <span className={s.textFaint}>–</span>
                      <HourSelect isDark={isDark} value={day.endHour} onChange={(v) => setWeek((prev) => prev.map((d, i) => (i === index ? { ...d, endHour: v } : d)))} />
                    </div>
                  ) : (
                    <span className={`text-[11px] ${s.textFaint}`}>{isHebrew ? "יום חופש" : "Day off"}</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {currentStepKey === "access" && (
            <div className="space-y-4">
              {!permissions.canManagePermissions ? (
                <div className={`rounded-xl border p-4 text-[12px] font-semibold ${isDark ? "border-white/10 text-white/60" : "border-[#EBDDD2] text-[#7E7066]"}`}>
                  {isHebrew
                    ? "אין לך הרשאה לנהל גישה למערכת. פנה/י לבעל/ת הסלון או למנהל/ת."
                    : "You do not have permission to manage system access. Ask a salon owner or manager."}
                </div>
              ) : staff?.userId ? (
                <div className={`rounded-xl border p-4 ${isDark ? "border-white/10" : "border-[#EBDDD2]"}`}>
                  <p className={`text-[12px] font-black ${s.textStrong}`}>{isHebrew ? "לעובד יש כבר גישה למערכת" : "This member already has system access"}</p>
                  <p className={`mt-1 text-[11px] ${s.textSoft}`}>{isHebrew ? "ניהול השהיה/ביטול גישה נעשה בלשונית אבטחה והרשאות." : "Suspend or revoke access from the Security & Permissions section."}</p>
                </div>
              ) : (
                <>
                  <div>
                    <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "תפקיד גישה" : "Access role"}</p>
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {INVITABLE_ACCESS_ROLES.map((role) => (
                        <button key={role.key} type="button" onClick={() => setAccessRoleKey(role.key)} className={`rounded-xl border p-3 text-start transition ${accessRoleKey === role.key ? "border-[#D7897F] bg-[#FFF1EC]" : isDark ? "border-white/10 bg-white/[0.03]" : "border-[#EFE4DA] bg-white/70"}`}>
                          <p className={`text-[12px] font-black ${accessRoleKey === role.key ? "text-[#141414]" : s.textStrong}`}>{role.name}</p>
                          <p className={`mt-0.5 text-[10px] font-semibold leading-4 ${accessRoleKey === role.key ? "text-[#7E5A54]" : s.textFaint}`}>{role.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`rounded-xl border p-3 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-[#EFE4DA] bg-white/70"}`}>
                    <p className={`text-[11px] font-bold ${s.textSoft}`}>
                      {isHebrew ? "ההזמנה תישלח אל:" : "The invitation will be sent to:"} <span className={s.textStrong}>{email || phone || (isHebrew ? "— הוסיפו אימייל/טלפון בשלב הפרופיל" : "— add an email/phone in Profile")}</span>
                    </p>
                    {inviteCode ? (
                      <div className="mt-3">
                        <p className={`text-[11px] font-black ${s.textSoft}`}>{isHebrew ? "קוד הזמנה חד-פעמי (מסרו לעובד):" : "One-time invitation code (share with the member):"}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <code className={`flex-1 rounded-lg px-3 py-2 text-[13px] font-black tracking-wider ${isDark ? "bg-black/30 text-emerald-300" : "bg-[#F0F7F3] text-[#2E6B52]"}`}>{inviteCode}</code>
                          <GhostButton isDark={isDark} onClick={copyCode}>
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? (isHebrew ? "הועתק" : "Copied") : (isHebrew ? "העתק" : "Copy")}
                          </GhostButton>
                        </div>
                        <p className={`mt-2 text-[10px] font-semibold ${s.textFaint}`}>{isHebrew ? "הקוד מוצג פעם אחת בלבד ואינו נשמר." : "This code is shown once and is never stored."}</p>
                      </div>
                    ) : (
                      <div className="mt-3">
                        <PrimaryButton onClick={handleSendInvitation} disabled={inviteBusy || !savedStaffId || (!email.trim() && !phone.trim())}>
                          {inviteBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />} {isHebrew ? "שלח הזמנה" : "Send invitation"}
                        </PrimaryButton>
                        <p className={`mt-2 text-[10px] font-semibold ${savedStaffId ? s.textFaint : "text-[#B05F57]"}`}>
                          {savedStaffId
                            ? (isHebrew ? "פרטי העובד/ת נשמרו — אפשר לשלוח את ההזמנה." : "Member saved — you can send the invitation now.")
                            : (isHebrew ? "שמרו תחילה את פרטי העובד/ת (כפתור השמירה למטה) ואז שלחו הזמנה." : "Save the member first (Save button below), then send the invitation.")}
                        </p>
                      </div>
                    )}
                    {inviteError && <p className="mt-2 text-[11px] font-bold text-[#B05F57]">{inviteError}</p>}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-between gap-3 border-t px-5 py-4 ${isDark ? "border-white/10" : "border-[#EFE3DA]"}`}>
          <div>
            {step > 0 && (
              <GhostButton isDark={isDark} onClick={() => setStep((v) => Math.max(0, v - 1))}>
                <BackIcon className="h-3.5 w-3.5" /> {isHebrew ? "הקודם" : "Back"}
              </GhostButton>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saveError && <span className="text-[11px] font-bold text-[#B05F57]">{saveError}</span>}
            {!saveError && roleSyncWarning && <span className="max-w-[260px] text-[11px] font-bold text-[#C08A3E]">{roleSyncWarning}</span>}
            {step < lastStep ? (
              <PrimaryButton onClick={() => canProceed && setStep((v) => Math.min(lastStep, v + 1))} disabled={!canProceed}>
                {isHebrew ? "הבא" : "Next"} <NextIcon className="h-3.5 w-3.5" />
              </PrimaryButton>
            ) : (
              <PrimaryButton onClick={handleSave} disabled={saving || !name.trim()}>
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} {isHebrew ? "שמירה" : "Save"}
              </PrimaryButton>
            )}
          </div>
        </div>
      </div>
      {avatarEditorOpen && avatarEditorSource && (
        <AvatarCropDialog
          isDark={isDark}
          isHebrew={isHebrew}
          source={avatarEditorSource}
          zoom={avatarZoom}
          offsetX={avatarOffsetX}
          offsetY={avatarOffsetY}
          busy={avatarBusy}
          onZoomChange={setAvatarZoom}
          onOffsetXChange={setAvatarOffsetX}
          onOffsetYChange={setAvatarOffsetY}
          onCancel={() => {
            if (avatarBusy) return;
            setAvatarEditorOpen(false);
            setAvatarEditorSource(null);
          }}
          onApply={applyAvatarCrop}
        />
      )}
    </div>
  );
};

const AvatarCropDialog: React.FC<{
  isDark: boolean;
  isHebrew: boolean;
  source: string;
  zoom: number;
  offsetX: number;
  offsetY: number;
  busy: boolean;
  onZoomChange: (value: number) => void;
  onOffsetXChange: (value: number) => void;
  onOffsetYChange: (value: number) => void;
  onCancel: () => void;
  onApply: () => void;
}> = ({ isDark, isHebrew, source, zoom, offsetX, offsetY, busy, onZoomChange, onOffsetXChange, onOffsetYChange, onCancel, onApply }) => {
  const s = useSettingsStyles(isDark);
  const translateX = offsetX * 22;
  const translateY = offsetY * 22;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={isHebrew ? "עריכת תמונת עובד" : "Edit staff photo"}>
      <button type="button" className="absolute inset-0 cursor-default bg-black/60" onClick={onCancel} aria-label={isHebrew ? "סגור" : "Close"} />
      <div className={`relative w-full max-w-sm overflow-hidden rounded-[24px] border shadow-[0_24px_70px_rgba(20,10,5,0.45)] ${isDark ? "border-white/10 bg-[#1C1C1C]" : "border-[#EBDDD2] bg-[#FFFDF9]"}`}>
        <div className={`flex items-start justify-between gap-3 border-b px-5 py-4 ${isDark ? "border-white/10" : "border-[#EFE3DA]"}`}>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#B05F57]">{isHebrew ? "תמונת פרופיל" : "Profile photo"}</p>
            <h3 className={`mt-0.5 text-[16px] font-black ${s.textStrong}`}>{isHebrew ? "התאמת התמונה" : "Adjust your photo"}</h3>
            <p className={`mt-1 text-[11px] font-semibold ${s.textSoft}`}>{isHebrew ? "מקם את הפנים במרכז, הגדל לפי הצורך ושמור." : "Center the face, zoom as needed, then save."}</p>
          </div>
          <button type="button" onClick={onCancel} disabled={busy} className={`grid h-8 w-8 place-items-center rounded-lg ${isDark ? "bg-white/10 text-white/70" : "bg-[#F1ECE7] text-[#7E7066]"}`}><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5">
          <div className="mx-auto grid h-52 w-52 place-items-center overflow-hidden rounded-full border-[5px] border-white bg-[#F1ECE7] shadow-[0_0_0_1px_rgba(215,137,127,0.25)]">
            <img
              src={source}
              alt=""
              className="h-full w-full object-cover transition-transform duration-100"
              style={{ transform: `translate(${translateX}%, ${translateY}%) scale(${zoom})` }}
            />
          </div>

          <div className="mt-5 space-y-3">
            <CropRange icon={<ZoomIn className="h-3.5 w-3.5" />} label={isHebrew ? "זום" : "Zoom"} value={zoom} min={1} max={3} step={0.05} onChange={onZoomChange} isDark={isDark} />
            <CropRange icon={<MoveHorizontal className="h-3.5 w-3.5" />} label={isHebrew ? "מיקום אופקי" : "Horizontal position"} value={offsetX} min={-1} max={1} step={0.05} onChange={onOffsetXChange} isDark={isDark} />
            <CropRange icon={<MoveVertical className="h-3.5 w-3.5" />} label={isHebrew ? "מיקום אנכי" : "Vertical position"} value={offsetY} min={-1} max={1} step={0.05} onChange={onOffsetYChange} isDark={isDark} />
          </div>
        </div>

        <div className={`flex justify-end gap-2 border-t px-5 py-3 ${isDark ? "border-white/10" : "border-[#EFE3DA]"}`}>
          <GhostButton isDark={isDark} onClick={onCancel} disabled={busy}>{isHebrew ? "ביטול" : "Cancel"}</GhostButton>
          <PrimaryButton onClick={onApply} disabled={busy}>{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}{isHebrew ? "שמירת חיתוך" : "Save crop"}</PrimaryButton>
        </div>
      </div>
    </div>
  );
};

const CropRange: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  isDark: boolean;
}> = ({ icon, label, value, min, max, step, onChange, isDark }) => {
  const s = useSettingsStyles(isDark);
  return (
    <label className="block">
      <span className={`mb-1.5 flex items-center gap-1.5 text-[11px] font-black ${s.textSoft}`}>{icon}{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} className="h-1.5 w-full cursor-pointer accent-[#D7897F]" />
    </label>
  );
};

const AccessTypeCard: React.FC<{
  isDark: boolean;
  active: boolean;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
}> = ({ isDark, active, title, description, icon, onClick }) => (
  <button type="button" onClick={onClick} className={`flex items-start gap-3 rounded-xl border p-3 text-start transition ${active ? "border-[#D7897F] bg-[#FFF1EC]" : isDark ? "border-white/10 bg-white/[0.03]" : "border-[#EFE4DA] bg-white/70"}`}>
    <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${active ? "bg-[#D7897F] text-white" : isDark ? "bg-white/10 text-white/60" : "bg-[#F8E5D8] text-[#B05F57]"}`}>{icon}</span>
    <span className="min-w-0">
      <span className={`block text-[12px] font-black ${active ? "text-[#141414]" : isDark ? "text-white" : "text-[#141414]"}`}>{title}</span>
      <span className={`mt-0.5 block text-[10px] font-semibold leading-4 ${active ? "text-[#7E5A54]" : isDark ? "text-white/50" : "text-[#9A8B80]"}`}>{description}</span>
    </span>
  </button>
);

const HourSelect: React.FC<{ isDark: boolean; value: number; onChange: (value: number) => void }> = ({ isDark, value, onChange }) => {
  const s = useSettingsStyles(isDark);
  return (
    <select value={value} onChange={(e) => onChange(Number(e.target.value))} className={`${s.input} py-1.5`}>
      {Array.from({ length: 25 }, (_, h) => (
        <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>
      ))}
    </select>
  );
};
