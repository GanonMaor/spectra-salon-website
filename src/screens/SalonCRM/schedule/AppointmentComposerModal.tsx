/**
 * Appointment composer modal.
 *
 * One staged, composition-based engine that powers BOTH creating a new
 * appointment and editing/splitting an existing one. The user picks a client,
 * builds a multi-service composition, edits the generated workflow (apply /
 * wait / wash stages, each with its own duration, employee, and resource),
 * checks scheduling/conflicts, and reviews. A persistent summary panel stays
 * visible.
 *
 * In `edit` mode the modal is seeded from an existing calendar appointment and
 * its segments, opens directly on the Workflow step, and saves back through
 * the same canonical create payload (now an update). This replaces the old
 * single-form editor and the hard "split in half" action with real, dynamic
 * stage editing.
 */

import React, { useMemo, useState, useCallback } from "react";
import { X, Search, Check, AlertCircle, ChevronRight, Trash2, Plus } from "lucide-react";
import { useCRMSearch, useCRMActions } from "../data/crmHooks";
import type { Appointment } from "../calendar/calendarTypes";
import { useCrmT } from "../i18n/CrmLocale";
import type { CrmTranslations } from "../i18n/translations";
import { ENTRY_TYPE_ICONS, iconForDepartment, iconForServiceCategory } from "./scheduleIcons";
import { useScheduleCatalog } from "./ScheduleCatalogProvider";
import { ServiceWorkflowEditor } from "./ServiceWorkflowEditor";
import {
  buildCompositionFromAppointment,
  buildCompositionService,
  buildCreatePayload,
  buildTimingOverrides,
  computeTotals,
  type CompositionCreatePayload,
} from "./appointmentCompositionUtils";
import {
  validateComposition,
  buildConflictTexts,
  type ExistingBusyBlock,
} from "./availabilityUtils";
import {
  FLOW_STEPS,
  type AppointmentComposition,
  type BookingPrefill,
  type CompositionStage,
  type EntryType,
  type FlowStep,
  type SelectedClient,
} from "./bookingFlowTypes";
import {
  clockFromMinutes,
  formatPriceCents,
  minutesToLabel,
  buildDateAtMinutes,
} from "./bookingFlowUtils";
import { CALENDAR_DESIGN_COLORS, defaultServiceColor } from "./scheduleDesign";
import {
  displayCategoryName,
  displayDepartmentName,
  displayServiceName,
  displayStaffName,
} from "./scheduleDisplayNames";

interface StaffOption { id: string; name: string }

/** Save outcome returned by the parent so the modal can stay open and explain
 *  a failure instead of closing with no effect. */
export interface ComposerSaveResult {
  ok: boolean;
  error?: string;
}

type SaveHandler = (
  payload: CompositionCreatePayload,
) => void | ComposerSaveResult | Promise<void | ComposerSaveResult>;

type UpdateHandler = (
  id: string,
  payload: CompositionCreatePayload,
) => void | ComposerSaveResult | Promise<void | ComposerSaveResult>;

export type ComposerMode = "create" | "edit";

export interface AppointmentComposerProps {
  open: boolean;
  isDark: boolean;
  mode: ComposerMode;
  /** Create mode: where the new entry starts. */
  prefill?: BookingPrefill;
  /** Edit mode: the appointment being edited. */
  editingAppointment?: Appointment;
  staff: StaffOption[];
  existingBusy: ExistingBusyBlock[];
  workingStartHour: number;
  workingEndHour: number;
  onClose: () => void;
  /** Create mode submit. */
  onSubmit: SaveHandler;
  /** Edit mode save. */
  onUpdate?: UpdateHandler;
  /** Edit mode delete. */
  onDelete?: (id: string) => void;
}

function getEntryTypes(t: CrmTranslations): { id: EntryType; label: string; description: string }[] {
  const w = t.schedule.wizard;
  return [
    { id: "appointment",   label: w.typeAppointment,  description: w.typeAppointmentDesc },
    { id: "break",         label: w.typeBreak,        description: w.typeBreakDesc },
    { id: "time-block",    label: w.typeTimeBlock,    description: w.typeTimeBlockDesc },
    { id: "internal-task", label: w.typeInternalTask, description: w.typeInternalTaskDesc },
    { id: "other",         label: w.typeOther,        description: w.typeOtherDesc },
  ];
}

function stepLabel(t: CrmTranslations, step: FlowStep): string {
  const w = t.schedule.wizard;
  const map: Record<FlowStep, string> = {
    type: w.stepType,
    client: w.stepClient,
    services: w.stepServices,
    workflow: w.stepWorkflow,
    schedule: w.stepSchedule,
    review: w.stepReview,
  };
  return map[step];
}

export const AppointmentComposerModal: React.FC<AppointmentComposerProps> = ({
  open,
  isDark,
  mode,
  prefill,
  editingAppointment,
  staff,
  existingBusy,
  workingStartHour,
  workingEndHour,
  onClose,
  onSubmit,
  onUpdate,
  onDelete,
}) => {
  const catalog = useScheduleCatalog();
  const crmActions = useCRMActions();
  const t = useCrmT();
  const w = t.schedule.wizard;
  const isHebrew = t.common.add !== "Add";
  const entryTypes = useMemo(() => getEntryTypes(t), [t]);
  const visibleEntryTypes = useMemo(
    () => (prefill?.entryType && prefill.entryType !== "appointment"
      ? entryTypes.filter((type) => type.id !== "appointment")
      : entryTypes),
    [entryTypes, prefill?.entryType],
  );

  const isEdit = mode === "edit" && editingAppointment != null;

  const initialEntryType = prefill?.entryType ?? "appointment";

  // Appointment creation starts from the clicked employee/time, then asks who
  // the visit is for before choosing services. Calendar blocks keep the type screen.
  const steps = useMemo<FlowStep[]>(
    () => {
      if (isEdit) return ["workflow", "review"];
      if (initialEntryType !== "appointment") return ["type"];
      return ["client", "services", "workflow", "review"];
    },
    [isEdit, initialEntryType],
  );

  const [step, setStep] = useState<FlowStep>(
    isEdit ? "workflow" : initialEntryType === "appointment" ? "client" : "type",
  );
  const [maxStepIndex, setMaxStepIndex] = useState(isEdit ? steps.length - 1 : 0);

  const [composition, setComposition] = useState<AppointmentComposition>(() => {
    if (isEdit && editingAppointment) {
      return buildCompositionFromAppointment(
        editingAppointment,
        catalog.state.services,
        catalog.newStageId,
      );
    }
    return {
      entryType: initialEntryType,
      client: null,
      defaultEmployeeId: prefill?.employeeId ?? staff[0]?.id ?? "",
      date: prefill?.date ?? new Date(),
      startMinutes: prefill?.startMinutes ?? 9 * 60,
      services: [],
      notes: "",
      saveClientTiming: false,
    };
  });

  // Build-services sub-navigation.
  const [deptId, setDeptId] = useState<string | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [showClientMenu, setShowClientMenu] = useState(false);
  const [showServiceMenu, setShowServiceMenu] = useState(false);

  // Client search.
  const [clientQuery, setClientQuery] = useState("");
  const clientResults = useCRMSearch(clientQuery, 8);

  // Simple (non-appointment) entry form.
  const [simpleTitle, setSimpleTitle] = useState("");
  const [simpleDuration, setSimpleDuration] = useState(30);

  // Save lifecycle (so a failed save keeps the modal open and explains why).
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const staffNameById = useMemo(() => {
    const m: Record<string, string> = {};
    for (const s of staff) m[s.id] = displayStaffName(s.name, isHebrew);
    return m;
  }, [isHebrew, staff]);

  const totals = useMemo(() => computeTotals(composition), [composition]);

  const conflictTexts = useMemo(() => buildConflictTexts(t), [t]);

  const availability = useMemo(
    () => validateComposition({
      composition,
      existing: existingBusy,
      workingStartHour,
      workingEndHour,
      staffNameById,
      texts: conflictTexts,
    }),
    [composition, existingBusy, workingStartHour, workingEndHour, staffNameById, conflictTexts],
  );

  const savedTimingClientName = useMemo(() => {
    if (!composition.client?.id) return null;
    const hasOverride = composition.services.some((svc) =>
      catalog.state.timingOverrides.some((o) => o.customerId === composition.client?.id && o.serviceId === svc.serviceId),
    );
    return hasOverride ? composition.client.name : null;
  }, [composition.client, composition.services, catalog.state.timingOverrides]);

  // ── Composition updaters ──────────────────────────────────────────
  const addServiceById = useCallback((serviceId: string, isLinked: boolean, mergeIntoOpenJourney = false) => {
    const svc = catalog.state.services.find((s) => s.id === serviceId);
    if (!svc) return;
    const override = composition.client?.id
      ? catalog.state.timingOverrides.find((o) => o.customerId === composition.client?.id && o.serviceId === svc.id)
      : undefined;
    const compositionService = buildCompositionService(
      svc,
      composition.defaultEmployeeId,
      catalog.newStageId,
      isLinked,
      override,
    );
    setComposition((prev) => {
      if (!mergeIntoOpenJourney || prev.services.length === 0) {
        return { ...prev, services: [...prev.services, compositionService] };
      }

      const [openService] = prev.services;
      return {
        ...prev,
        services: prev.services.map((existing) =>
          existing.instanceId !== openService.instanceId
            ? existing
            : {
                ...existing,
                priceCents: existing.priceCents + compositionService.priceCents,
                stages: [...existing.stages, ...compositionService.stages],
              },
        ),
      };
    });
  }, [catalog, composition.client, composition.defaultEmployeeId]);

  const removeService = useCallback((instanceId: string) => {
    setComposition((prev) => ({ ...prev, services: prev.services.filter((s) => s.instanceId !== instanceId) }));
  }, []);

  const updateStage = useCallback((instanceId: string, stageId: string, patch: Partial<CompositionStage>) => {
    setComposition((prev) => ({
      ...prev,
      services: prev.services.map((svc) =>
        svc.instanceId !== instanceId
          ? svc
          : { ...svc, stages: svc.stages.map((st) => (st.id === stageId ? { ...st, ...patch } : st)) },
      ),
    }));
  }, []);

  const addStage = useCallback((instanceId: string) => {
    setComposition((prev) => ({
      ...prev,
      services: prev.services.map((svc) =>
        svc.instanceId !== instanceId
          ? svc
          : {
              ...svc,
              stages: [
                ...svc.stages,
                {
                  id: catalog.newStageId(),
                  definitionId: "",
                  label: t.common.add === "Add" ? "New stage" : "שלב חדש",
                  segmentType: "service",
                  durationMinutes: 15,
                  isActiveStaffTime: true,
                  employeeId: svc.stages[svc.stages.length - 1]?.employeeId ?? prev.defaultEmployeeId,
                  requiredResourceType: undefined,
                  resourceId: undefined,
                  startOffsetMinutes: 0,
                },
              ],
            },
      ),
    }));
  }, [catalog]);

  const addGenericStage = useCallback((template: {
    label: string;
    segmentType: CompositionStage["segmentType"];
    durationMinutes: number;
    requiredResourceType?: CompositionStage["requiredResourceType"];
  }) => {
    setComposition((prev) => {
      const targetService = prev.services[0];
      if (!targetService) return prev;

      return {
        ...prev,
        services: prev.services.map((svc) =>
          svc.instanceId !== targetService.instanceId
            ? svc
            : {
                ...svc,
                stages: [
                  ...svc.stages,
                  {
                    id: catalog.newStageId(),
                    definitionId: "",
                    label: template.label,
                    segmentType: template.segmentType,
                    durationMinutes: template.durationMinutes,
                    isActiveStaffTime: template.segmentType !== "wait",
                    employeeId: svc.stages[svc.stages.length - 1]?.employeeId ?? prev.defaultEmployeeId,
                    requiredResourceType: template.requiredResourceType,
                    resourceId: undefined,
                    startOffsetMinutes: 0,
                  },
                ],
              },
        ),
      };
    });
  }, [catalog]);

  const removeStage = useCallback((instanceId: string, stageId: string) => {
    setComposition((prev) => ({
      ...prev,
      services: prev.services.map((svc) =>
        svc.instanceId !== instanceId
          ? svc
          : { ...svc, stages: svc.stages.filter((st) => st.id !== stageId) },
      ),
    }));
  }, []);

  // Linked-service suggestions from current non-linked services.
  const linkedSuggestions = useMemo(() => {
    const presentIds = new Set(composition.services.map((s) => s.serviceId));
    const ids = new Set<string>();
    for (const svc of composition.services) {
      if (svc.isLinked) continue;
      const catSvc = catalog.state.services.find((s) => s.id === svc.serviceId);
      catSvc?.linkedServiceIds.forEach((id) => { if (!presentIds.has(id)) ids.add(id); });
    }
    return Array.from(ids)
      .map((id) => catalog.state.services.find((s) => s.id === id))
      .filter((s): s is NonNullable<typeof s> => Boolean(s) && s!.status === "active")
      .map((s) => ({ id: s.id, name: s.name }));
  }, [composition.services, catalog.state.services]);

  if (!open) return null;

  // ── Step navigation ───────────────────────────────────────────────
  const goToStep = (next: FlowStep) => {
    const idx = steps.indexOf(next);
    setStep(next);
    setMaxStepIndex((m) => Math.max(m, idx));
  };

  const stepIndex = steps.indexOf(step);

  const canProceed = (): boolean => {
    if (!isEdit && initialEntryType === "appointment") {
      return Boolean(composition.client) && composition.services.length > 0 && !availability.hasBlocking;
    }
    switch (step) {
      case "type": return composition.entryType === "appointment";
      case "client": return Boolean(composition.client);
      case "services": return composition.services.length > 0;
      case "workflow": return composition.services.length > 0;
      case "review": return !availability.hasBlocking;
      case "schedule": return !availability.hasBlocking;
      default: return false;
    }
  };

  const handleNext = () => {
    if (!isEdit && initialEntryType === "appointment") { handleFinish(); return; }
    if (step === "review") { handleFinish(); return; }
    const nextIdx = Math.min(stepIndex + 1, steps.length - 1);
    goToStep(steps[nextIdx]);
  };

  const handleBack = () => {
    if (!isEdit && initialEntryType === "appointment") { onClose(); return; }
    if (stepIndex === 0) { onClose(); return; }
    setStep(steps[stepIndex - 1]);
  };

  const handleSelectEntryType = (type: EntryType) => {
    setComposition((prev) => ({ ...prev, entryType: type }));
    if (type === "appointment") goToStep("client");
  };

  const handleFinish = async () => {
    if (submitting) return;
    const payload = buildCreatePayload(composition);
    setSubmitError(null);
    setSubmitting(true);
    try {
      const result = isEdit && editingAppointment && onUpdate
        ? await onUpdate(editingAppointment.id, payload)
        : await onSubmit(payload);
      if (result && result.ok === false) {
        setSubmitError(result.error || w.couldNotSave);
        setSubmitting(false);
        return;
      }
      // Persisting client timings only makes sense once the save succeeded.
      if (composition.client?.id && composition.saveClientTiming) {
        buildTimingOverrides(composition).forEach((o) => catalog.saveTimingOverride(o));
      }
      onClose();
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : w.couldNotSave);
      setSubmitting(false);
    }
  };

  const handleCreateSimpleEntry = () => {
    const title = simpleTitle.trim() || entryTypes.find((e) => e.id === composition.entryType)?.label || w.typeTimeBlock;
    const start = buildDateAtMinutes(composition.date, composition.startMinutes);
    const end = buildDateAtMinutes(composition.date, composition.startMinutes + simpleDuration);
    onSubmit({
      staffMemberId: composition.defaultEmployeeId,
      customerName: title,
      serviceName: title,
      serviceCategoryId: "other",
      start,
      end,
      notes: undefined,
      segments: [{
        segmentType: "service",
        label: title,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        sortOrder: 0,
      }],
    });
    onClose();
  };

  // ── New client ────────────────────────────────────────────────────
  const handleCreateClient = () => {
    const name = clientQuery.trim();
    if (!name) return;
    const [firstName, ...rest] = name.split(" ");
    const result = crmActions.createCustomer({ firstName, lastName: rest.join(" ") || undefined });
    const client: SelectedClient = result.ok && result.data
      ? { id: result.data.id, name }
      : { name };
    setComposition((prev) => ({ ...prev, client }));
    setClientQuery("");
    setShowClientMenu(false);
    if (isEdit || initialEntryType !== "appointment") goToStep("services");
  };

  const selectClient = (c: { id: string; firstName: string; lastName?: string; phone?: string }) => {
    setComposition((prev) => ({
      ...prev,
      client: { id: c.id, name: `${c.firstName} ${c.lastName || ""}`.trim(), phone: c.phone },
    }));
    setClientQuery("");
    setShowClientMenu(false);
    if (isEdit || initialEntryType !== "appointment") goToStep("services");
  };

  const selectWalkInClient = (walkInGender: SelectedClient["walkInGender"]) => {
    setComposition((prev) => ({ ...prev, client: { name: w.walkIn, walkInGender }, saveClientTiming: false }));
    setClientQuery("");
    setShowClientMenu(false);
    if (isEdit || initialEntryType !== "appointment") goToStep("services");
  };

  const walkInGenderLabel = (gender?: SelectedClient["walkInGender"]) => {
    if (!gender) return null;
    if (t.common.add === "Add") return gender === "male" ? "Male" : "Female";
    return gender === "male" ? "גבר" : "אישה";
  };

  // ── Styling helpers ───────────────────────────────────────────────
  const textStrong = isDark ? "text-white" : "text-[#141414]";
  const textSoft = isDark ? "text-white/55" : "text-[#7E7066]";
  const textFaint = isDark ? "text-white/40" : "text-[#9A8B80]";
  const cardCls = isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-[#EBDDD2] bg-[#FFFDF8]";
  const inputCls = isDark
    ? "bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-3 py-2 text-[#141414] text-sm focus:outline-none focus:border-[#D7897F]";

  const isAppointment = composition.entryType === "appointment";
  const isAppointmentBuilder = !isEdit && initialEntryType === "appointment";
  const canAddGenericStage = composition.services.length > 0;
  const genericProcessOptions: Array<{
    label: string;
    segmentType: CompositionStage["segmentType"];
    durationMinutes: number;
    requiredResourceType?: CompositionStage["requiredResourceType"];
  }> = [
    {
      label: t.common.add === "Add" ? "Consultation" : "ייעוץ",
      segmentType: "checkin",
      durationMinutes: 10,
      requiredResourceType: "chair",
    },
    {
      label: t.common.add === "Add" ? "Wash before process" : "חפיפה לפני תהליך",
      segmentType: "wash",
      durationMinutes: 10,
      requiredResourceType: "wash-station",
    },
    {
      label: t.common.add === "Add" ? "Wash after process" : "חפיפה אחרי תהליך",
      segmentType: "wash",
      durationMinutes: 15,
      requiredResourceType: "wash-station",
    },
  ];
  const checkInClientActions = (
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2.5">
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={() => setShowClientMenu((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57] shadow-[0_10px_22px_rgba(215,137,127,0.12)] transition hover:bg-[#FFF1E8]"
          aria-label={t.common.add === "Add" ? "Add client" : "הוספת לקוחה/לקוח"}
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="rounded-[20px] border border-[#EFE4DA] bg-[#FFFDF9]/82 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className={`text-[13px] font-black ${textStrong}`}>
              {composition.client?.name ?? (t.common.add === "Add" ? "Add client" : "הוספת לקוחה / לקוח")}
            </p>
            <p className={`mt-0.5 text-[11px] ${textFaint}`}>
              {composition.client?.walkInGender
                ? walkInGenderLabel(composition.client.walkInGender)
                : `${clockFromMinutes(composition.startMinutes)} · ${staffNameById[composition.defaultEmployeeId]}`}
            </p>
          </div>
          {composition.client && (
            <button
              type="button"
              onClick={() => {
                setComposition((p) => ({ ...p, client: null, saveClientTiming: false }));
                setShowClientMenu(true);
              }}
              className={`text-[11px] font-bold ${textSoft}`}
            >
              {w.change}
            </button>
          )}
        </div>

        {composition.client && !showClientMenu ? (
          <div className="rounded-2xl border border-[#EFE4DA] bg-white/55 px-4 py-3">
            <p className={`text-[13px] font-black ${textStrong}`}>{composition.client.name}</p>
            {composition.client.phone && <p className={`mt-1 text-[11px] ${textFaint}`}>{composition.client.phone}</p>}
            {composition.client.walkInGender && (
              <p className={`mt-1 text-[11px] ${textFaint}`}>{walkInGenderLabel(composition.client.walkInGender)}</p>
            )}
          </div>
        ) : showClientMenu ? (
          <>
            <div className="relative mb-3">
              <Search className={`pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 ${textFaint}`} />
              <input
                value={clientQuery}
                onChange={(e) => setClientQuery(e.target.value)}
                placeholder={w.startTypingName}
                className={`w-full ps-9 pe-3 py-2 ${inputCls}`}
              />
            </div>
            <div className="grid gap-3 md:grid-cols-[0.75fr_1fr]">
              <div className="rounded-2xl border border-[#EFE4DA] bg-white/45 px-3 py-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[12px] font-black ${textStrong}`}>{w.walkIn}</span>
                  <span className={`text-[10px] ${textFaint}`}>
                    {t.common.add === "Add" ? "No card" : "בלי כרטיס"}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(["female", "male"] as const).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      onClick={() => selectWalkInClient(gender)}
                      className="rounded-xl bg-white/65 px-3 py-2 text-[12px] font-bold text-[#141414] ring-1 ring-[#EFE4DA] transition hover:bg-[#FFF4EE] hover:text-[#B05F57]"
                    >
                      {walkInGenderLabel(gender)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {clientResults.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectClient(c)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/[0.04]"}`}
                  >
                    <span className={`text-[12px] font-medium ${textStrong}`}>{c.firstName} {c.lastName || ""}</span>
                    {c.phone && <span className={`text-[10px] ${textFaint}`}>{c.phone}</span>}
                  </button>
                ))}
                {clientQuery.trim() && (
                  <button
                    type="button"
                    onClick={handleCreateClient}
                    className={`w-full rounded-lg px-3 py-2 text-left text-[12px] font-semibold ${isDark ? "text-amber-300 hover:bg-white/5" : "text-amber-700 hover:bg-black/[0.03]"}`}
                  >
                    + {w.addNewClient} "{clientQuery.trim()}"
                  </button>
                )}
              </div>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setShowClientMenu(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[#D7897F]/30 bg-white/45 px-4 py-3 text-[12px] font-black text-[#B05F57] transition hover:bg-[#FFF4EE]"
          >
            <Plus className="h-4 w-4" />
            {t.common.add === "Add" ? "Choose client or walk-in" : "בחירת לקוחה או לקוח מזדמן"}
          </button>
        )}
      </div>
    </div>
  );
  const afterCheckInActions = (
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2.5">
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={() => setShowServiceMenu((value) => !value)}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57] shadow-[0_10px_22px_rgba(215,137,127,0.12)] transition hover:bg-[#FFF1E8]"
          aria-label={t.common.add === "Add" ? "Add after check-in" : "הוספה אחרי כניסה לסלון"}
        >
          <Plus className="h-[18px] w-[18px]" />
        </button>
      </div>
      <div className="rounded-[20px] border border-dashed border-[#D7897F]/28 bg-[#FFF8F0]/68 p-3">
        <button
          type="button"
          onClick={() => setShowServiceMenu((value) => !value)}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className={`block text-[12px] font-black ${textStrong}`}>
              {t.common.add === "Add" ? "Add after check-in" : "הוספה אחרי כניסה לסלון"}
            </span>
            <span className={`mt-0.5 block text-[11px] ${textFaint}`}>
              {composition.services.length > 0
                ? `${composition.services.length} ${w.servicesCount}`
                : (t.common.add === "Add" ? "Service first, then optional process" : "קודם שירות, ואז מהלך לפי הצורך")}
            </span>
          </span>
          <Plus className="h-4 w-4 text-[#B05F57]" />
        </button>

        {composition.services.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {composition.services.map((service) => (
              <span
                key={service.instanceId}
                className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-black text-[#7E7066] ring-1 ring-[#EFE4DA]"
              >
                {displayServiceName(service.serviceName, isHebrew)}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setShowServiceMenu((value) => !value)}
            className="rounded-full bg-[#D7897F] px-3 py-1.5 text-[11px] font-black text-white shadow-[0_8px_16px_rgba(215,137,127,0.18)] transition hover:bg-[#C97870]"
          >
            {t.common.add === "Add" ? "Service" : "שירות"}
          </button>
          {genericProcessOptions.map((option) => (
            <button
              key={option.label}
              type="button"
              disabled={!canAddGenericStage}
              onClick={() => addGenericStage(option)}
              className="rounded-full bg-white/75 px-3 py-1.5 text-[11px] font-black text-[#7E7066] ring-1 ring-[#EFE4DA] transition hover:bg-white hover:text-[#141414] disabled:cursor-not-allowed disabled:opacity-45"
            >
              {option.label} · {option.durationMinutes} ד׳
            </button>
          ))}
        </div>

        {showServiceMenu && (
          <div className="mt-3 max-h-[320px] overflow-y-auto rounded-[18px] border border-[#EFE4DA] bg-[#FFFDF9]/86 p-2.5">
            <BuildServicesStep
              isDark={isDark}
              t={t}
              catalog={catalog}
              deptId={deptId}
              categoryId={categoryId}
              setDeptId={setDeptId}
              setCategoryId={setCategoryId}
              onAddService={(id) => {
                addServiceById(id, false, true);
                setShowServiceMenu(false);
              }}
              addedServiceIds={composition.services.map((s) => s.serviceId)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center px-0 sm:px-4" onClick={onClose}>
      <div className={`absolute inset-0 ${isDark ? "bg-black/55" : "bg-[#D7897F]/35"}`} />
      <div
        className={`relative z-10 flex w-full sm:max-w-[780px] flex-col overflow-hidden rounded-t-[28px] sm:rounded-[28px] border ${
          isDark ? "border-white/[0.12] bg-black/[0.72]" : "border-white/70 bg-[#FFF8F0]"
        }`}
        style={{
          height: "min(720px, 92svh)",
          boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.5)" : "0 24px 80px rgba(92,52,35,0.20)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? "border-white/[0.08] bg-white/[0.02]" : "border-[#EFE4DA] bg-[#FFF9F5]"
        }`}>
          <div>
            <p className={`text-base font-bold ${textStrong}`}>{isEdit ? w.editEntry : w.newEntry}</p>
            <p className={`text-[12px] ${textFaint}`}>
              {composition.client?.name ? `${composition.client.name} · ` : ""}
              {staffNameById[composition.defaultEmployeeId]} · {clockFromMinutes(composition.startMinutes)}
            </p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-white/70 text-[#7E7066] hover:text-[#141414]"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper (appointment only) */}
        {isAppointment && !isAppointmentBuilder && (
          <div className={`flex items-center gap-1 px-6 py-3 border-b ${
            isDark ? "border-white/[0.06] bg-white/[0.015]" : "border-[#EFE4DA] bg-[#FFF9F5]"
          }`}>
            {steps.map((s, i) => {
              const reachable = i <= maxStepIndex;
              const active = s === step;
              return (
                <React.Fragment key={s}>
                  {i > 0 && <ChevronRight className={`w-3 h-3 ${textFaint}`} />}
                  <button
                    disabled={!reachable}
                    onClick={() => reachable && setStep(s)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                      active
                        ? "text-white"
                        : reachable
                          ? `${textSoft} hover:underline`
                          : textFaint
                    }`}
                    style={active ? { background: CALENDAR_DESIGN_COLORS.nectarine } : undefined}
                  >
                    {i + 1}. {stepLabel(t, s)}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className={`flex flex-1 min-h-0 ${isDark ? "bg-black/10" : "bg-[#FFF9F5]"}`}>
          <div className={`relative flex-1 overflow-y-auto scrollbar-thin p-4 ${
            isDark ? "bg-white/[0.01]" : "bg-[#FFFDF9]"
          }`}>
            <div className={`pointer-events-none absolute inset-y-6 end-4 w-1 rounded-full ${
              isDark ? "bg-white/5" : "bg-[#D7897F]/10"
            }`} />
            <div className="relative z-10">
            {isAppointmentBuilder ? (
              <div className="mx-auto max-w-[620px] space-y-3">
                {savedTimingClientName && (
                  <div className={`rounded-lg px-3 py-2 text-[11px] font-medium ${isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700"}`}>
                    {w.usingSavedTiming} {savedTimingClientName}
                  </div>
                )}
                <ServiceWorkflowEditor
                  services={composition.services}
                  staff={staff}
                  resources={catalog.state.resources.filter((r) => r.status === "active")}
                  isDark={isDark}
                  linkedSuggestions={linkedSuggestions}
                  startMinutes={composition.startMinutes}
                  checkInClientActions={checkInClientActions}
                  afterCheckInActions={afterCheckInActions}
                  onUpdateStage={updateStage}
                  onRemoveService={removeService}
                  onAddStage={addStage}
                  onRemoveStage={removeStage}
                  onAddLinked={(id) => addServiceById(id, true, true)}
                  onAddAnother={() => {
                    setCategoryId(null);
                    setShowServiceMenu(true);
                  }}
                />

              </div>
            ) : (
            <>
            {/* STEP: type */}
            {step === "type" && (
              <div className="space-y-2.5">
                <p className={`text-[13px] font-semibold ${textStrong}`}>{w.whatToCreate}</p>
                {visibleEntryTypes.map((et) => {
                  const EntryIcon = ENTRY_TYPE_ICONS[et.id];
                  return (
                    <button
                      key={et.id}
                      onClick={() => handleSelectEntryType(et.id)}
                      className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors ${cardCls} ${
                        composition.entryType === et.id ? (isDark ? "ring-1 ring-white/30" : "ring-1 ring-black/20") : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isDark ? "bg-white/[0.08] text-white/80" : "bg-black/[0.05] text-black/70"}`}>
                          <EntryIcon className="w-[18px] h-[18px]" strokeWidth={1.75} />
                        </span>
                        <div>
                          <p className={`text-[13px] font-semibold ${textStrong}`}>{et.label}</p>
                          <p className={`text-[11px] ${textFaint}`}>{et.description}</p>
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 ${textFaint}`} />
                    </button>
                  );
                })}

                {/* Non-appointment compact form */}
                {!isAppointment && (
                  <div className={`mt-4 rounded-xl border ${cardCls} p-4 space-y-3`}>
                    <p className={`text-[12px] font-semibold ${textStrong}`}>
                      {entryTypes.find((e) => e.id === composition.entryType)?.label} {w.detailsSuffix}
                    </p>
                    <input
                      value={simpleTitle}
                      onChange={(e) => setSimpleTitle(e.target.value)}
                      placeholder={w.titleNote}
                      className={`w-full ${inputCls}`}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex flex-col gap-1">
                        <span className={`text-[11px] ${textSoft}`}>{t.schedule.employee}</span>
                        <select
                          value={composition.defaultEmployeeId}
                          onChange={(e) => setComposition((p) => ({ ...p, defaultEmployeeId: e.target.value }))}
                          className={`w-full ${inputCls}`}
                        >
                          {staff.map((s) => <option key={s.id} value={s.id}>{displayStaffName(s.name, isHebrew)}</option>)}
                        </select>
                      </label>
                      <label className="flex flex-col gap-1">
                        <span className={`text-[11px] ${textSoft}`}>{w.durationMinLabel}</span>
                        <input
                          type="number"
                          min={5}
                          step={5}
                          value={simpleDuration}
                          onChange={(e) => setSimpleDuration(Math.max(5, Number(e.target.value) || 5))}
                          className={`w-full ${inputCls}`}
                        />
                      </label>
                    </div>
                    <button
                      onClick={handleCreateSimpleEntry}
                      className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-white"
                      style={{ background: CALENDAR_DESIGN_COLORS.nectarine }}
                    >
                      {w.createPrefix} {entryTypes.find((e) => e.id === composition.entryType)?.label}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP: client */}
            {step === "client" && (
              <div>
                <p className={`text-[13px] font-semibold mb-1 ${textStrong}`}>
                  {t.common.add === "Add" ? "Who is the appointment for?" : "למי התור?"}
                </p>
                <p className={`text-[11px] mb-3 ${textFaint}`}>
                  {t.common.add === "Add"
                    ? "Choose an existing client, create a new one, or continue as a walk-in."
                    : "בחר/י לקוח קיים, צר/י לקוח חדש, או המשך/י כלקוח מזדמן."}
                </p>
                {composition.client ? (
                  <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${cardCls}`}>
                    <div>
                      <p className={`text-[13px] font-semibold ${textStrong}`}>{composition.client.name}</p>
                      {composition.client.phone && <p className={`text-[11px] ${textFaint}`}>{composition.client.phone}</p>}
                      {composition.client.walkInGender && (
                        <p className={`text-[11px] ${textFaint}`}>{walkInGenderLabel(composition.client.walkInGender)}</p>
                      )}
                    </div>
                    <button onClick={() => setComposition((p) => ({ ...p, client: null }))} className={`text-[11px] ${textSoft}`}>{w.change}</button>
                  </div>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search className={`pointer-events-none absolute start-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 ${textFaint}`} />
                      <input
                        value={clientQuery}
                        onChange={(e) => setClientQuery(e.target.value)}
                        placeholder={w.startTypingName}
                        autoFocus
                        className={`w-full ps-9 pe-3 py-2 ${inputCls}`}
                      />
                    </div>
                    <div
                      className={`mb-3 rounded-2xl border px-4 py-3 ${
                        isDark
                          ? "border-white/10 bg-white/[0.04]"
                          : "border-[#EFE4DA] bg-white/45"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className={`block text-[13px] font-black ${textStrong}`}>
                          {w.walkIn}
                        </span>
                        <span className={`text-[11px] ${textFaint}`}>
                          {t.common.add === "Add" ? "No client card" : "בלי לפתוח כרטיס לקוח"}
                        </span>
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        {(["female", "male"] as const).map((gender) => (
                          <button
                            key={gender}
                            type="button"
                            onClick={() => selectWalkInClient(gender)}
                            className="rounded-xl bg-white/65 px-3 py-2 text-[12px] font-bold text-[#141414] ring-1 ring-[#EFE4DA] transition hover:bg-[#FFF4EE] hover:text-[#B05F57]"
                          >
                            {walkInGenderLabel(gender)}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {clientResults.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => selectClient(c)}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-left transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-black/[0.04]"}`}
                        >
                          <span className={`text-[12px] font-medium ${textStrong}`}>{c.firstName} {c.lastName || ""}</span>
                          {c.phone && <span className={`text-[10px] ${textFaint}`}>{c.phone}</span>}
                        </button>
                      ))}
                      {clientQuery.trim() && (
                        <button
                          onClick={handleCreateClient}
                          className={`w-full text-left rounded-lg px-3 py-2 text-[12px] font-semibold ${isDark ? "text-amber-300 hover:bg-white/5" : "text-amber-700 hover:bg-black/[0.03]"}`}
                        >
                          + {w.addNewClient} "{clientQuery.trim()}"
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STEP: services (build) */}
            {step === "services" && (
              <BuildServicesStep
                isDark={isDark}
                t={t}
                catalog={catalog}
                deptId={deptId}
                categoryId={categoryId}
                setDeptId={setDeptId}
                setCategoryId={setCategoryId}
                onAddService={(id) => {
                  addServiceById(id, false);
                  goToStep("workflow");
                }}
                addedServiceIds={composition.services.map((s) => s.serviceId)}
              />
            )}

            {/* STEP: workflow */}
            {step === "workflow" && (
              <div>
                {savedTimingClientName && (
                  <div className={`mb-3 rounded-lg px-3 py-2 text-[11px] font-medium ${isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700"}`}>
                    {w.usingSavedTiming} {savedTimingClientName}
                  </div>
                )}
                <ServiceWorkflowEditor
                  services={composition.services}
                  staff={staff}
                  resources={catalog.state.resources.filter((r) => r.status === "active")}
                  isDark={isDark}
                  linkedSuggestions={linkedSuggestions}
                  startMinutes={composition.startMinutes}
                  onUpdateStage={updateStage}
                  onRemoveService={removeService}
                  onAddStage={addStage}
                  onRemoveStage={removeStage}
                  onAddLinked={(id) => addServiceById(id, true)}
                  onAddAnother={() => goToStep("services")}
                />
                <label className="flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    checked={composition.saveClientTiming}
                    onChange={(e) => setComposition((p) => ({ ...p, saveClientTiming: e.target.checked }))}
                    disabled={!composition.client?.id}
                  />
                  <span className={`text-[12px] ${textSoft}`}>{w.saveTimingsForClient}</span>
                </label>
              </div>
            )}

            {/* STEP: schedule */}
            {step === "schedule" && (
              <div className="space-y-4">
                <div className={`rounded-xl border ${cardCls} p-4`}>
                  <p className={`text-[12px] font-semibold mb-3 ${textStrong}`}>{w.scheduleHeading}</p>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex flex-col gap-1">
                      <span className={`text-[11px] ${textSoft}`}>{t.schedule.startTime}</span>
                      <input
                        type="time"
                        value={clockFromMinutes(composition.startMinutes)}
                        onChange={(e) => {
                          const [h, m] = e.target.value.split(":").map(Number);
                          setComposition((p) => ({ ...p, startMinutes: h * 60 + m }));
                        }}
                        className={`w-full ${inputCls}`}
                      />
                    </label>
                    <label className="flex flex-col gap-1">
                      <span className={`text-[11px] ${textSoft}`}>{t.schedule.endTime}</span>
                      <div className={`w-full ${inputCls} opacity-70`}>{clockFromMinutes(totals.endMinutes)}</div>
                    </label>
                  </div>
                  <div className={`mt-3 grid grid-cols-3 gap-2 text-center`}>
                    <Metric label={w.clientJourney} value={minutesToLabel(totals.clientJourneyMinutes)} isDark={isDark} />
                    <Metric label={w.processing} value={minutesToLabel(totals.processingMinutes)} isDark={isDark} />
                    <Metric label={w.price} value={formatPriceCents(totals.totalPriceCents)} isDark={isDark} />
                  </div>
                </div>

                {/* Conflicts */}
                <div className="space-y-2">
                  {availability.conflicts.length === 0 ? (
                    <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-[12px] ${isDark ? "bg-emerald-400/10 text-emerald-300" : "bg-emerald-100 text-emerald-700"}`}>
                      <Check className="w-4 h-4" /> {w.noConflicts}
                    </div>
                  ) : (
                    availability.conflicts.map((c, i) => (
                      <div
                        key={i}
                        className={`flex items-start gap-2 rounded-lg px-3 py-2 text-[12px] ${
                          c.severity === "error"
                            ? (isDark ? "bg-red-400/10 text-red-300" : "bg-red-100 text-red-700")
                            : (isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700")
                        }`}
                      >
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {c.message}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* STEP: review */}
            {step === "review" && (
              <div className="space-y-4">
                <p className={`text-[13px] font-semibold ${textStrong}`}>{isEdit ? w.reviewSave : w.reviewCreate}</p>
                <div className={`rounded-xl border ${cardCls} p-4 space-y-2`}>
                  <ReviewRow
                    label={t.schedule.client}
                    value={[
                      composition.client?.name ?? w.walkIn,
                      walkInGenderLabel(composition.client?.walkInGender),
                    ].filter(Boolean).join(" · ")}
                    isDark={isDark}
                  />
                  <ReviewRow label={w.window} value={`${clockFromMinutes(composition.startMinutes)} – ${clockFromMinutes(totals.endMinutes)}`} isDark={isDark} />
                  {Object.entries(totals.activeByEmployee).map(([id, mins]) => (
                    <ReviewRow key={id} label={`${staffNameById[id] ?? t.schedule.employee} ${w.activeTimeSuffix}`} value={minutesToLabel(mins)} isDark={isDark} />
                  ))}
                  <ReviewRow label={w.processingTime} value={minutesToLabel(totals.processingMinutes)} isDark={isDark} />
                  <ReviewRow label={w.estimatedPrice} value={formatPriceCents(totals.totalPriceCents)} isDark={isDark} strong />
                </div>
                <label className="flex flex-col gap-1">
                  <span className={`text-[11px] ${textSoft}`}>{t.common.notes}</span>
                  <textarea
                    value={composition.notes}
                    onChange={(e) => setComposition((p) => ({ ...p, notes: e.target.value }))}
                    className={`w-full ${inputCls} h-16 resize-none`}
                    placeholder={w.optionalNotes}
                  />
                </label>
              </div>
            )}
            </>
            )}
            </div>
          </div>
        </div>

        {/* Footer */}
        {isAppointment && (
          <div className={`border-t ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
            {submitError && (
              <div className={`flex items-start gap-2 px-6 pt-3 text-[12px] ${isDark ? "text-red-300" : "text-red-600"}`}>
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}
            <div className="flex items-center justify-between px-6 py-3">
              <div className="flex items-center gap-2">
                <button onClick={handleBack} className={`px-4 py-2 rounded-lg text-[12px] font-semibold ${isDark ? "text-white/70 hover:bg-white/5" : "text-black/60 hover:bg-black/5"}`}>
                  {isAppointmentBuilder || stepIndex === 0 ? t.common.cancel : t.common.back}
                </button>
                {isEdit && onDelete && editingAppointment && (
                  <button
                    onClick={() => { onDelete(editingAppointment.id); onClose(); }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold transition-colors ${
                      isDark ? "bg-red-500/15 text-red-300 hover:bg-red-500/25" : "bg-red-100 text-red-600 hover:bg-red-200"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> {t.common.delete}
                  </button>
                )}
              </div>
              <button
                onClick={handleNext}
                disabled={!canProceed() || submitting}
                className="px-5 py-2 rounded-lg text-[12px] font-semibold text-white disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: CALENDAR_DESIGN_COLORS.nectarine }}
              >
                {isAppointmentBuilder
                  ? (submitting ? w.saving : w.createAppointmentBtn)
                  : step === "review"
                  ? (submitting ? w.saving : isEdit ? w.saveChanges : w.createAppointmentBtn)
                  : w.continue}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Build services sub-step ──────────────────────────────────────────
const BuildServicesStep: React.FC<{
  isDark: boolean;
  t: CrmTranslations;
  catalog: ReturnType<typeof useScheduleCatalog>;
  deptId: string | null;
  categoryId: string | null;
  setDeptId: (id: string | null) => void;
  setCategoryId: (id: string | null) => void;
  onAddService: (serviceId: string) => void;
  addedServiceIds: string[];
  compact?: boolean;
}> = ({ isDark, t, catalog, deptId, categoryId, setDeptId, setCategoryId, onAddService, addedServiceIds, compact = false }) => {
  const w = t.schedule.wizard;
  const textStrong = isDark ? "text-white" : "text-[#141414]";
  const textFaint = isDark ? "text-white/40" : "text-[#9A8B80]";
  const isHebrew = t.common.add !== "Add";
  const departments = catalog.state.departments.filter((d) => d.status === "active");
  const activeDeptId = deptId ?? departments[0]?.id ?? null;
  const categories = catalog.state.categories.filter(
    (c) => c.status === "active" && (!activeDeptId || c.departmentId === activeDeptId),
  );
  const colorUsage = categories.reduce<Record<string, number>>((acc, category) => {
    const color = category.accentColor ?? "";
    if (color) acc[color] = (acc[color] ?? 0) + 1;
    return acc;
  }, {});
  const categoryColor = (category: (typeof categories)[number]) => {
    const color = category.accentColor;
    if (!color || colorUsage[color] > 1) return defaultServiceColor(category.crmCategoryId);
    return color;
  };

  return (
    <div className={compact ? "space-y-2.5" : "space-y-4"}>
      <div>
        <p className={`${compact ? "text-[12px]" : "text-[13px]"} font-semibold ${textStrong}`}>{w.selectService}</p>
        <p className={`${compact ? "mt-0.5 text-[10px]" : "mt-1 text-[11px]"} ${textFaint}`}>
          {t.common.add === "Add"
            ? "Open a category and choose the service. The cycle updates immediately."
            : "פתח/י קטגוריה ובחר/י שירות. הסייקל מתעדכן מיד."}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {departments.map((d) => {
          const active = d.id === activeDeptId;
          const DeptIcon = iconForDepartment(d.name);
          return (
            <button
              key={d.id}
              type="button"
              onClick={() => { setDeptId(d.id); setCategoryId(null); }}
              className={`flex shrink-0 items-center gap-2 rounded-xl ${compact ? "px-3 py-1.5 text-[11px]" : "px-4 py-2 text-[12px]"} font-bold transition ${
                active
                  ? "bg-[#F3C3BC] text-[#B05F57]"
                  : isDark ? "bg-white/[0.05] text-white/60 hover:bg-white/[0.08]" : "bg-white/60 text-[#7E7066] hover:bg-white"
              }`}
            >
              <DeptIcon className="h-3.5 w-3.5" strokeWidth={1.8} />
                {displayDepartmentName(d.name, isHebrew)}
            </button>
          );
        })}
      </div>

      <div className={compact ? "grid grid-cols-2 gap-1.5" : "space-y-2.5"}>
        {categories.map((c) => {
          const count = catalog.state.services.filter((s) => s.categoryId === c.id && s.status === "active").length;
          const services = catalog.state.services.filter((s) => s.status === "active" && s.categoryId === c.id);
          const CatIcon = iconForServiceCategory(c.crmCategoryId);
          const expanded = categoryId === c.id;
          const color = categoryColor(c);
          return (
            <div key={c.id} className={`overflow-hidden ${compact ? `rounded-[18px] ${expanded ? "col-span-2" : ""}` : "rounded-[22px]"} border border-[#EFE4DA] bg-[#FFFDF8]/82 shadow-[0_10px_22px_rgba(92,52,35,0.06)]`}>
              <button
                type="button"
                onClick={() => setCategoryId(expanded ? null : c.id)}
                className={`flex w-full items-center justify-between gap-2 ${compact ? "p-2.5" : "p-3"} text-left`}
              >
                <div className={`flex min-w-0 items-center ${compact ? "gap-2" : "gap-3"}`}>
                  <span
                    className={`flex ${compact ? "h-9 w-9 rounded-[14px]" : "h-12 w-12 rounded-[20px]"} shrink-0 items-center justify-center text-[#141414] shadow-[inset_0_1px_0_rgba(255,255,255,0.38)]`}
                    style={{ background: color }}
                  >
                    <CatIcon className={compact ? "h-4 w-4" : "h-5 w-5"} strokeWidth={1.9} />
                  </span>
                  <span className="min-w-0">
                    <span className={`block truncate ${compact ? "text-[13px]" : "text-[15px]"} font-black text-[#141414]`}>
                      {displayCategoryName(c.name, c.crmCategoryId, isHebrew)}
                    </span>
                    <span className={`${compact ? "text-[10px]" : "text-[11px]"} mt-0.5 block font-bold text-[#141414]/58`}>{count} {w.servicesCount}</span>
                  </span>
                </div>
                <span
                  className={`rounded-full ${compact ? "px-2.5 py-0.5 text-[10px]" : "px-3 py-1 text-[11px]"} font-black text-[#141414]`}
                  style={{ background: color }}
                >
                  {expanded ? (t.common.add === "Add" ? "Close" : "סגור") : (t.common.add === "Add" ? "Open" : "פתח")}
                </span>
              </button>

              {expanded && (
                <div className={`grid gap-2 border-t border-[#EBDDD2] ${compact ? "p-2" : "p-3 md:grid-cols-2"}`}>
                  {services.map((s) => {
                    const SvcIcon = iconForServiceCategory(s.crmCategoryId);
                    const added = addedServiceIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => onAddService(s.id)}
                        className={`relative flex ${compact ? "min-h-[58px] rounded-[14px] p-2.5" : "min-h-[76px] rounded-[18px] p-3"} items-center justify-between gap-3 overflow-hidden border border-[#EFE4DA] bg-white/70 text-left shadow-[0_6px_16px_rgba(92,52,35,0.045)] transition hover:bg-white ${
                          added ? "ring-2 ring-[#141414]/15" : ""
                        }`}
                      >
                        <span className="absolute inset-y-3 start-0 w-1 rounded-full" style={{ background: color }} />
                        <span className="flex min-w-0 items-center gap-3">
                          <span
                            className={`flex ${compact ? "h-8 w-8 rounded-xl" : "h-9 w-9 rounded-2xl"} shrink-0 items-center justify-center text-[#141414]`}
                            style={{ background: color }}
                          >
                            <SvcIcon className="h-[18px] w-[18px]" strokeWidth={1.85} />
                          </span>
                          <span className="min-w-0">
                            <span className={`block truncate ${compact ? "text-[12px]" : "text-[14px]"} font-black leading-tight text-[#141414]`}>
                              {displayServiceName(s.name, isHebrew)}
                            </span>
                            <span className="mt-1 block text-[11px] font-bold text-[#141414]/62">{minutesToLabel(s.defaultDurationMinutes)}</span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block rounded-full bg-[#F8F0E6] px-2 py-1 text-[10px] font-black text-[#141414]">
                            {formatPriceCents(s.defaultPriceCents)}
                          </span>
                          {added && (
                            <span className="mt-1 inline-block rounded-full bg-[#F8F0E6] px-2 py-0.5 text-[10px] font-black text-[#141414]">
                              {t.common.add === "Add" ? "Added" : "נוסף"}
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                  {services.length === 0 && (
                    <div className="rounded-2xl bg-[#F8F0E6] px-4 py-3 text-[11px] font-bold text-[#7E7066]">
                      {t.common.add === "Add" ? "No services in this category yet." : "אין עדיין שירותים בקטגוריה הזו."}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; isDark: boolean }> = ({ label, value, isDark }) => (
  <div className={`rounded-lg py-2 ${isDark ? "bg-black/20" : "bg-[#F8F0E6]"}`}>
    <p className={`text-[13px] font-bold ${isDark ? "text-white" : "text-[#141414]"}`}>{value}</p>
    <p className={`text-[9px] ${isDark ? "text-white/40" : "text-[#9A8B80]"}`}>{label}</p>
  </div>
);

const ReviewRow: React.FC<{ label: string; value: string; isDark: boolean; strong?: boolean }> = ({ label, value, isDark, strong }) => (
  <div className="flex items-center justify-between">
    <span className={`text-[12px] ${isDark ? "text-white/55" : "text-[#7E7066]"}`}>{label}</span>
    <span className={`${strong ? "text-[13px] font-bold" : "text-[12px] font-medium"} ${isDark ? "text-white" : "text-[#141414]"}`}>{value}</span>
  </div>
);
