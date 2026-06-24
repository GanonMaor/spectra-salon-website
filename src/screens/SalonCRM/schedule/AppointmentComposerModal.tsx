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
import { X, Search, Check, AlertCircle, ChevronRight, Trash2 } from "lucide-react";
import { useCRMSearch, useCRMActions } from "../data/crmHooks";
import type { Appointment } from "../calendar/calendarTypes";
import { useCrmT } from "../i18n/CrmLocale";
import type { CrmTranslations } from "../i18n/translations";
import { ENTRY_TYPE_ICONS, iconForDepartment, iconForServiceCategory } from "./scheduleIcons";
import { useScheduleCatalog } from "./ScheduleCatalogProvider";
import { AppointmentSummaryPanel } from "./AppointmentSummaryPanel";
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
  const entryTypes = useMemo(() => getEntryTypes(t), [t]);

  const isEdit = mode === "edit" && editingAppointment != null;

  // In edit mode the entry type is fixed (appointment) so the "type" step is
  // skipped and the flow opens on the workflow editor.
  const steps = useMemo<FlowStep[]>(
    () => (isEdit ? FLOW_STEPS.filter((s) => s !== "type") : FLOW_STEPS),
    [isEdit],
  );

  const [step, setStep] = useState<FlowStep>(isEdit ? "workflow" : "type");
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
      entryType: "appointment",
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
    for (const s of staff) m[s.id] = s.name;
    return m;
  }, [staff]);

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
  const addServiceById = useCallback((serviceId: string, isLinked: boolean) => {
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
    setComposition((prev) => ({ ...prev, services: [...prev.services, compositionService] }));
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
                  label: "New stage",
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
    switch (step) {
      case "type": return composition.entryType === "appointment";
      case "client": return Boolean(composition.client);
      case "services": return composition.services.length > 0;
      case "workflow": return composition.services.length > 0;
      case "schedule": return !availability.hasBlocking;
      case "review": return true;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step === "review") { handleFinish(); return; }
    const nextIdx = Math.min(stepIndex + 1, steps.length - 1);
    goToStep(steps[nextIdx]);
  };

  const handleBack = () => {
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
    goToStep("services");
  };

  const selectClient = (c: { id: string; firstName: string; lastName?: string; phone?: string }) => {
    setComposition((prev) => ({
      ...prev,
      client: { id: c.id, name: `${c.firstName} ${c.lastName || ""}`.trim(), phone: c.phone },
    }));
    setClientQuery("");
    goToStep("services");
  };

  // ── Styling helpers ───────────────────────────────────────────────
  const textStrong = isDark ? "text-white" : "text-[#1A1A1A]";
  const textSoft = isDark ? "text-white/55" : "text-black/55";
  const textFaint = isDark ? "text-white/40" : "text-black/40";
  const cardCls = isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-black/[0.06] bg-white/[0.60]";
  const inputCls = isDark
    ? "bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-white text-sm"
    : "bg-black/[0.04] border border-black/[0.10] rounded-lg px-3 py-2 text-[#1A1A1A] text-sm";

  const isAppointment = composition.entryType === "appointment";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4" onClick={onClose}>
      <div className={`absolute inset-0 backdrop-blur-sm ${isDark ? "bg-black/55" : "bg-black/30"}`} />
      <div
        className={`relative z-10 w-full max-w-4xl rounded-3xl border backdrop-blur-2xl max-h-[92vh] flex flex-col overflow-hidden ${
          isDark ? "border-white/[0.12] bg-black/[0.72]" : "border-black/[0.08] bg-white/[0.96]"
        }`}
        style={{ boxShadow: isDark ? "0 24px 80px rgba(0,0,0,0.5)" : "0 24px 80px rgba(0,0,0,0.14)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
          <div>
            <p className={`text-base font-bold ${textStrong}`}>{isEdit ? w.editEntry : w.newEntry}</p>
            <p className={`text-[12px] ${textFaint}`}>
              {composition.client?.name ? `${composition.client.name} · ` : ""}
              {staffNameById[composition.defaultEmployeeId]} · {clockFromMinutes(composition.startMinutes)}
            </p>
          </div>
          <button onClick={onClose} className={`w-8 h-8 rounded-lg flex items-center justify-center ${isDark ? "bg-white/10 text-white/60 hover:text-white" : "bg-black/[0.05] text-black/50 hover:text-black"}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper (appointment only) */}
        {isAppointment && (
          <div className={`flex items-center gap-1 px-6 py-3 border-b ${isDark ? "border-white/[0.06]" : "border-black/[0.04]"}`}>
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
                    style={active ? { background: "linear-gradient(315deg, #9a7544, #c79c6d)" } : undefined}
                  >
                    {i + 1}. {stepLabel(t, s)}
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        )}

        {/* Body */}
        <div className="flex flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {/* STEP: type */}
            {step === "type" && (
              <div className="space-y-2.5">
                <p className={`text-[13px] font-semibold ${textStrong}`}>{w.whatToCreate}</p>
                {entryTypes.map((et) => {
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
                          {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
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
                      style={{ background: "linear-gradient(315deg, #9a7544, #c79c6d)" }}
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
                <p className={`text-[13px] font-semibold mb-1 ${textStrong}`}>{w.selectClient}</p>
                <p className={`text-[11px] mb-3 ${textFaint}`}>{w.searchByNameOrPhone}</p>
                {composition.client ? (
                  <div className={`flex items-center justify-between rounded-lg border px-4 py-3 ${cardCls}`}>
                    <div>
                      <p className={`text-[13px] font-semibold ${textStrong}`}>{composition.client.name}</p>
                      {composition.client.phone && <p className={`text-[11px] ${textFaint}`}>{composition.client.phone}</p>}
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
                onAddService={(id) => addServiceById(id, false)}
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
                  <ReviewRow label={t.schedule.client} value={composition.client?.name ?? w.walkIn} isDark={isDark} />
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
          </div>

          {/* Summary panel (appointment flows) */}
          {isAppointment && (
            <div className={`w-64 shrink-0 border-s p-3 ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
              <AppointmentSummaryPanel
                composition={composition}
                totals={totals}
                staffNameById={staffNameById}
                isDark={isDark}
                availability={availability}
                savedTimingClientName={savedTimingClientName}
              />
            </div>
          )}
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
                  {stepIndex === 0 ? t.common.cancel : t.common.back}
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
                style={{ background: "linear-gradient(315deg, #9a7544, #c79c6d)" }}
              >
                {step === "review"
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
}> = ({ isDark, t, catalog, deptId, categoryId, setDeptId, setCategoryId, onAddService }) => {
  const w = t.schedule.wizard;
  const textStrong = isDark ? "text-white" : "text-[#1A1A1A]";
  const textSoft = isDark ? "text-white/55" : "text-black/55";
  const textFaint = isDark ? "text-white/40" : "text-black/40";
  const cardCls = isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-black/[0.06] bg-white/[0.60]";

  const departments = catalog.state.departments.filter((d) => d.status === "active");
  const categories = catalog.state.categories.filter(
    (c) => c.status === "active" && (!deptId || c.departmentId === deptId),
  );
  const services = catalog.state.services.filter(
    (s) => s.status === "active" && (!categoryId || s.categoryId === categoryId),
  );

  // Department selection.
  if (!deptId) {
    return (
      <div>
        <p className={`text-[13px] font-semibold mb-3 ${textStrong}`}>{w.selectDepartment}</p>
        <div className="grid grid-cols-3 gap-3">
          {departments.map((d) => {
            const count = catalog.state.categories.filter((c) => c.departmentId === d.id && c.status === "active").length;
            const DeptIcon = iconForDepartment(d.name);
            return (
              <button
                key={d.id}
                onClick={() => setDeptId(d.id)}
                disabled={count === 0}
                className={`rounded-2xl border p-5 text-center transition-colors ${cardCls} disabled:opacity-40`}
              >
                <span className={`mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-xl ${isDark ? "bg-white/[0.08] text-white/80" : "bg-black/[0.05] text-black/70"}`}>
                  <DeptIcon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <p className={`text-[14px] font-bold ${textStrong}`}>{d.name}</p>
                <p className={`text-[10px] mt-1 ${textFaint}`}>{count} {w.categoriesCount}</p>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Category selection.
  if (!categoryId) {
    return (
      <div>
        <div className="flex items-center gap-2 mb-3">
          <button onClick={() => setDeptId(null)} className={`text-[11px] ${textSoft}`}>← {w.backToDepartments}</button>
          <span className={`text-[13px] font-semibold ${textStrong}`}>{w.selectCategory}</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {categories.map((c) => {
            const count = catalog.state.services.filter((s) => s.categoryId === c.id && s.status === "active").length;
            const CatIcon = iconForServiceCategory(c.crmCategoryId);
            return (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`rounded-2xl border overflow-hidden text-left transition-colors ${cardCls}`}
              >
                <div
                  className="relative h-20 w-full"
                  style={{
                    background: c.coverImageUrl ? `url(${c.coverImageUrl}) center/cover no-repeat` : c.accentColor,
                  }}
                >
                  <span className="absolute bottom-2 start-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm">
                    <CatIcon className="w-[18px] h-[18px]" strokeWidth={1.9} />
                  </span>
                </div>
                <div className="p-3">
                  <p className={`text-[12px] font-bold ${textStrong}`}>{c.name}</p>
                  <p className={`text-[10px] ${textFaint}`}>{count} {w.servicesCount}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Service selection.
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <button onClick={() => setCategoryId(null)} className={`text-[11px] ${textSoft}`}>← {w.backToCategories}</button>
        <span className={`text-[13px] font-semibold ${textStrong}`}>{w.selectService}</span>
      </div>
      <div className="space-y-1.5">
        {services.map((s) => {
          const SvcIcon = iconForServiceCategory(s.crmCategoryId);
          return (
            <button
              key={s.id}
              onClick={() => onAddService(s.id)}
              className={`w-full flex items-center justify-between rounded-lg border px-4 py-2.5 text-left transition-colors ${cardCls}`}
            >
              <div className="flex items-center gap-3">
                <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${isDark ? "bg-white/[0.08] text-white/75" : "bg-black/[0.05] text-black/65"}`}>
                  <SvcIcon className="w-4 h-4" strokeWidth={1.75} />
                </span>
                <div>
                  <p className={`text-[12px] font-semibold ${textStrong}`}>{s.name}</p>
                  <p className={`text-[10px] ${textFaint}`}>{minutesToLabel(s.defaultDurationMinutes)}</p>
                </div>
              </div>
              <span className={`text-[12px] font-bold ${textSoft}`}>{formatPriceCents(s.defaultPriceCents)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; isDark: boolean }> = ({ label, value, isDark }) => (
  <div className={`rounded-lg py-2 ${isDark ? "bg-black/20" : "bg-black/[0.02]"}`}>
    <p className={`text-[13px] font-bold ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{value}</p>
    <p className={`text-[9px] ${isDark ? "text-white/40" : "text-black/40"}`}>{label}</p>
  </div>
);

const ReviewRow: React.FC<{ label: string; value: string; isDark: boolean; strong?: boolean }> = ({ label, value, isDark, strong }) => (
  <div className="flex items-center justify-between">
    <span className={`text-[12px] ${isDark ? "text-white/55" : "text-black/55"}`}>{label}</span>
    <span className={`${strong ? "text-[13px] font-bold" : "text-[12px] font-medium"} ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{value}</span>
  </div>
);
