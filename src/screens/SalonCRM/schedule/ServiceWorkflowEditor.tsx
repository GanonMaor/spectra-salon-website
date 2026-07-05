/**
 * Service workflow editor.
 *
 * Shows the appointment as a salon journey timeline: check-in, consultation,
 * service stages, processing/waiting, finishing steps, and check-out. Actual
 * service stages remain fully editable, while synthetic journey markers give
 * the user a clear end-to-end mental model.
 */

import React from "react";
import { Link2, LogIn, LogOut, Plus, Trash2, X } from "lucide-react";
import type { SegmentType } from "../data/crmTypes";
import { useCrmT } from "../i18n/CrmLocale";
import type { CompositionService, CompositionStage } from "./bookingFlowTypes";
import type { SalonResource } from "./catalogTypes";
import { isActiveStaffSegment } from "./appointmentCompositionUtils";
import { clockFromMinutes, minutesToLabel } from "./bookingFlowUtils";
import { resourceTypeLabel, segmentTypeLabel } from "./serviceCatalogUtils";
import { SEGMENT_TYPE_ICONS } from "./scheduleIcons";
import { CALENDAR_DESIGN_COLORS, defaultServiceColor } from "./scheduleDesign";
import { displayResourceName, displayServiceName, displayStaffName, displayStageName } from "./scheduleDisplayNames";

interface StaffOption { id: string; name: string }
interface LinkedSuggestion { id: string; name: string }

const STAGE_TYPE_OPTIONS: SegmentType[] = ["checkin", "service", "apply", "wait", "wash", "dry", "checkout"];

interface Props {
  services: CompositionService[];
  staff: StaffOption[];
  resources: SalonResource[];
  isDark: boolean;
  bookingMode?: "process" | "singleBlock";
  linkedSuggestions: LinkedSuggestion[];
  startMinutes: number;
  checkInClientActions?: React.ReactNode;
  checkInClientExpanded?: boolean;
  afterCheckInActions?: React.ReactNode;
  finishAddFlow?: React.ReactNode;
  onUpdateStage: (instanceId: string, stageId: string, patch: Partial<CompositionStage>) => void;
  onRemoveService: (instanceId: string) => void;
  onAddStage: (instanceId: string, insertIndex?: number) => void;
  onRemoveStage: (instanceId: string, stageId: string) => void;
  onAddLinked: (serviceId: string) => void;
  onAddAnother: () => void;
}

function stageTone(type: SegmentType) {
  switch (type) {
    case "apply":
    case "service":
      return { bg: CALENDAR_DESIGN_COLORS.peche, chip: "#FFF3DD", shadow: "rgba(249,185,92,0.22)" };
    case "wait":
      return { bg: "#303236", chip: "#F4F1ED", shadow: "rgba(20,20,20,0.18)" };
    case "wash":
      return { bg: CALENDAR_DESIGN_COLORS.menthe, chip: "#EFF8F4", shadow: "rgba(150,199,179,0.22)" };
    case "dry":
      return { bg: CALENDAR_DESIGN_COLORS.lagune, chip: "#ECF4F7", shadow: "rgba(99,152,169,0.22)" };
    default:
      return { bg: CALENDAR_DESIGN_COLORS.nectarine, chip: "#FCEBE8", shadow: "rgba(215,137,127,0.20)" };
  }
}

function serviceColor(service: CompositionService): string {
  return defaultServiceColor(service.crmCategoryId);
}

export const ServiceWorkflowEditor: React.FC<Props> = ({
  services,
  staff,
  resources,
  isDark,
  bookingMode = "process",
  linkedSuggestions,
  startMinutes,
  checkInClientActions,
  checkInClientExpanded = false,
  afterCheckInActions,
  finishAddFlow,
  onUpdateStage,
  onRemoveService,
  onRemoveStage,
  onAddLinked,
  onAddAnother,
}) => {
  const t = useCrmT();
  const w = t.schedule.wizard;
  const isHebrew = t.common.add !== "Add";
  const textStrong = isDark ? "text-white" : "text-[#141414]";
  const textSoft = isDark ? "text-white/55" : "text-[#7E7066]";
  const textFaint = isDark ? "text-white/40" : "text-[#9A8B80]";
  const panel = isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-[#EBDDD2] bg-[#FFFDF8]";
  const inputCls = isDark
    ? "bg-white/10 border border-white/15 rounded-lg px-2 py-1.5 text-white text-[11px]"
    : "bg-[#FFF8F0] border border-[#EBDDD2] rounded-lg px-2 py-1.5 text-[#141414] text-[11px] focus:outline-none focus:border-[#D7897F]";

  return (
    <div className="space-y-3">
      {services.length === 0 && (
        <div className={`rounded-[24px] border ${panel} p-4`}>
          <div className="relative">
            <div className="absolute bottom-8 start-[25px] top-8 w-px border-s border-dashed border-[#EBDDD2]" />
            <JourneyMarker
              icon={LogIn}
              title={t.common.add === "Add" ? "Check-in" : "כניסה לסלון"}
              subtitle=""
              color={CALENDAR_DESIGN_COLORS.peche}
              action={checkInClientActions}
              actionExpanded={checkInClientExpanded}
            />
            {afterCheckInActions ?? (
              <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2.5">
                <div className="relative z-10 flex justify-center">
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57] shadow-[0_10px_22px_rgba(215,137,127,0.12)]">
                    <Plus className="h-[18px] w-[18px]" strokeWidth={2} />
                  </span>
                </div>
                <div className="rounded-[22px] border border-dashed border-[#EBDDD2] bg-[#FFF8F0]/70 px-4 py-5">
                  <p className={`text-[14px] font-black ${textStrong}`}>
                    {t.common.add === "Add" ? "Build the appointment here" : "כאן בונים את התור"}
                  </p>
                  <p className={`mt-1 text-[11px] ${textSoft}`}>
                    {t.common.add === "Add"
                      ? "Add a service or process after check-in."
                      : "הוסיפו שירות או מהלך אחרי הכניסה לסלון."}
                  </p>
                </div>
              </div>
            )}
            <JourneyMarker
              icon={LogOut}
              title={t.common.add === "Add" ? "Check-out" : "יציאה וסיכום"}
              subtitle={t.common.add === "Add" ? "The visit closes after services are added" : "הביקור ייסגר אחרי הוספת השירותים"}
              color={CALENDAR_DESIGN_COLORS.peche}
            />
          </div>
        </div>
      )}

      <div className="space-y-5">
        {services.map((service, serviceIndex) => (
          <ServiceJourney
            key={service.instanceId}
            service={service}
            serviceIndex={serviceIndex}
            startMinutes={startMinutes}
            staff={staff}
            resources={resources}
            isDark={isDark}
            textStrong={textStrong}
            textSoft={textSoft}
            textFaint={textFaint}
            inputCls={inputCls}
            panel={panel}
            checkInClientActions={serviceIndex === 0 ? checkInClientActions : undefined}
            checkInClientExpanded={serviceIndex === 0 ? checkInClientExpanded : false}
            afterCheckInActions={serviceIndex === 0 ? afterCheckInActions : undefined}
            finishAddFlow={serviceIndex === services.length - 1 ? finishAddFlow : undefined}
            showCheckIn={serviceIndex === 0}
            showFinish={serviceIndex === services.length - 1}
            onUpdateStage={onUpdateStage}
            onRemoveService={onRemoveService}
            onRemoveStage={onRemoveStage}
            onAddAnother={onAddAnother}
            linkedSuggestions={bookingMode === "process" && serviceIndex === services.length - 1 ? linkedSuggestions : []}
            onAddLinked={onAddLinked}
          />
        ))}
      </div>
    </div>
  );
};

function ServiceJourney({
  service,
  serviceIndex,
  startMinutes,
  staff,
  resources,
  isDark,
  textStrong,
  textSoft,
  textFaint,
  inputCls,
  panel,
  onUpdateStage,
  onRemoveService,
  onRemoveStage,
  onAddAnother,
  linkedSuggestions,
  onAddLinked,
  checkInClientActions,
  checkInClientExpanded,
  afterCheckInActions,
  finishAddFlow,
  showCheckIn,
  showFinish,
}: {
  service: CompositionService;
  serviceIndex: number;
  startMinutes: number;
  staff: StaffOption[];
  resources: SalonResource[];
  isDark: boolean;
  textStrong: string;
  textSoft: string;
  textFaint: string;
  inputCls: string;
  panel: string;
  onUpdateStage: Props["onUpdateStage"];
  onRemoveService: Props["onRemoveService"];
  onRemoveStage: Props["onRemoveStage"];
  onAddAnother: Props["onAddAnother"];
  linkedSuggestions: LinkedSuggestion[];
  onAddLinked: Props["onAddLinked"];
  checkInClientActions?: React.ReactNode;
  checkInClientExpanded: boolean;
  afterCheckInActions?: React.ReactNode;
  finishAddFlow?: React.ReactNode;
  showCheckIn: boolean;
  showFinish: boolean;
}) {
  const t = useCrmT();
  const w = t.schedule.wizard;
  const isHebrew = t.common.add !== "Add";
  const baseColor = serviceColor(service);
  const totalMinutes = service.stages.reduce((sum, stage) => sum + stage.durationMinutes, 0);

  return (
    <div className={`overflow-hidden rounded-[24px] border ${showCheckIn ? panel : "border-[#EFE4DA] bg-[#FFFDF8]/70"}`}>
      <div className={`flex items-center justify-between gap-3 border-b border-[#EBDDD2] ${showCheckIn ? "px-4 py-3" : "px-4 py-2.5"}`}>
        <div className="flex min-w-0 items-center gap-3">
          <span
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[16px] bg-[#FFF8F0] text-[15px] font-black text-[#141414] ring-1 ring-[#EFE4DA]"
          >
            <span className="absolute -end-1 -top-1 h-3 w-3 rounded-full" style={{ background: baseColor }} />
            {serviceIndex + 1}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {service.isLinked && <Link2 className={`h-3.5 w-3.5 ${textSoft}`} />}
              <p className={`truncate text-[16px] font-black tracking-[-0.025em] ${textStrong}`}>
                {displayServiceName(service.serviceName, isHebrew)}
              </p>
            </div>
            <p className={`mt-1 text-[11px] font-semibold ${textFaint}`}>
              {showCheckIn
                ? `${minutesToLabel(totalMinutes)} · ${formatPrice(service.priceCents)}`
                : `${t.common.add === "Add" ? "Added inside the same visit" : "נוסף בתוך אותו ביקור"} · ${minutesToLabel(totalMinutes)}`}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onRemoveService(service.instanceId)}
          className={`grid h-9 w-9 place-items-center rounded-xl transition-colors ${
            isDark ? "text-white/45 hover:bg-white/[0.08] hover:text-red-300" : "text-[#9A8B80] hover:bg-[#F8E5D8] hover:text-red-500"
          }`}
          aria-label={w.removeService}
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="px-4 py-4">
        <div className="relative">
          <div className="absolute bottom-8 start-[25px] top-8 w-px border-s border-dashed border-[#EBDDD2]" />
          {showCheckIn && (
            <JourneyMarker
              icon={LogIn}
              title={t.common.add === "Add" ? "Check-in" : "כניסה לסלון"}
              subtitle=""
              color={CALENDAR_DESIGN_COLORS.peche}
              action={checkInClientActions}
              actionExpanded={checkInClientExpanded}
            />
          )}

          <InlineStageInsert
            label={t.common.add === "Add" ? "Open add flow" : "פתח הוספה"}
            onAdd={onAddAnother}
          />

          {service.stages.map((stage, index) => (
            <React.Fragment key={stage.id}>
              <EditableStageNode
                service={service}
                stage={stage}
                stageIndex={index}
                connectedProcess={connectedColorWaitState(service.stages, index)}
                staff={staff}
                resources={resources}
                inputCls={inputCls}
                textSoft={textSoft}
                isDark={isDark}
                onUpdateStage={onUpdateStage}
                onRemoveStage={onRemoveStage}
              />
              {connectedColorWaitState(service.stages, index) !== "start" && index < service.stages.length - 1 && (
                <InlineStageInsert
                  label={t.common.add === "Add" ? "Open add flow" : "פתח הוספה"}
                  onAdd={onAddAnother}
                />
              )}
            </React.Fragment>
          ))}

          {showFinish && (
            <>
              <AddBeforeFinishNode
                onAddAnother={onAddAnother}
                linkedSuggestions={linkedSuggestions}
                onAddLinked={onAddLinked}
                action={finishAddFlow}
              />

              <JourneyMarker
                icon={LogOut}
                title={t.common.add === "Add" ? "Check-out" : "יציאה וסיכום"}
                subtitle={t.common.add === "Add" ? "Review result and close visit" : "בדיקת תוצאה וסגירת ביקור"}
                color={CALENDAR_DESIGN_COLORS.peche}
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
}

function AddBeforeFinishNode({
  onAddAnother,
  linkedSuggestions,
  onAddLinked,
  action,
}: {
  onAddAnother: () => void;
  linkedSuggestions: LinkedSuggestion[];
  onAddLinked: Props["onAddLinked"];
  action?: React.ReactNode;
}) {
  const t = useCrmT();
  void linkedSuggestions;
  void onAddLinked;
  return (
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2.5">
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={onAddAnother}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57] shadow-[0_10px_22px_rgba(215,137,127,0.14)] ring-4 ring-[#F3C3BC]/28 transition hover:bg-[#FFF1E8]"
          aria-label={t.common.add === "Add" ? "Open add flow" : "פתח הוספה"}
        >
          <Plus className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </button>
      </div>
      <div className="rounded-[20px] border border-dashed border-[#D7897F]/32 bg-[#FFF8F0]/70 p-3">
        <button
          type="button"
          onClick={onAddAnother}
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <span>
            <span className="block text-[12px] font-black text-[#141414]">
              {t.common.add === "Add" ? "Add before finish" : "הוספה לפני סיום"}
            </span>
            <span className="mt-0.5 block text-[11px] font-semibold text-[#7E7066]">
              {t.common.add === "Add" ? "Choose stage type, category and service" : "בחר סוג שלב, קטגוריה ושירות"}
            </span>
          </span>
          <Plus className="h-4 w-4 text-[#B05F57]" />
        </button>
        {action}
      </div>
    </div>
  );
}

function InlineStageInsert({
  label,
  onAdd,
}: {
  label: string;
  onAdd: () => void;
}) {
  return (
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-1">
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={onAdd}
          aria-label={label}
          title={label}
          className="grid h-7 w-7 place-items-center rounded-full border border-[#EBDDD2] bg-white/78 text-[#B05F57] shadow-[0_6px_14px_rgba(92,52,35,0.06)] transition hover:bg-[#FFF1E8] hover:text-[#8F4F49]"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.1} />
        </button>
      </div>
      <div className="flex items-center">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#EBDDD2]/70 to-transparent" />
      </div>
    </div>
  );
}

function connectedColorWaitState(
  stages: CompositionStage[],
  index: number,
): "start" | "end" | undefined {
  const current = stages[index];
  const previous = stages[index - 1];
  const next = stages[index + 1];
  if (current?.segmentType === "apply" && next?.segmentType === "wait") return "start";
  if (current?.segmentType === "wait" && previous?.segmentType === "apply") return "end";
  return undefined;
}

function EditableStageNode({
  service,
  stage,
  stageIndex,
  connectedProcess,
  staff,
  resources,
  inputCls,
  textSoft,
  isDark,
  onUpdateStage,
  onRemoveStage,
}: {
  service: CompositionService;
  stage: CompositionStage;
  stageIndex: number;
  connectedProcess?: "start" | "end";
  staff: StaffOption[];
  resources: SalonResource[];
  inputCls: string;
  textSoft: string;
  isDark: boolean;
  onUpdateStage: Props["onUpdateStage"];
  onRemoveStage: Props["onRemoveStage"];
}) {
  const [showMore, setShowMore] = React.useState(false);
  const t = useCrmT();
  const w = t.schedule.wizard;
  const isHebrew = t.common.add !== "Add";
  const tone = stageTone(stage.segmentType);
  const StageIcon = SEGMENT_TYPE_ICONS[stage.segmentType] ?? SEGMENT_TYPE_ICONS.service;
  const isConnectedStart = connectedProcess === "start";
  const isConnectedEnd = connectedProcess === "end";
  const eligibleResources = resources.filter(
    (resource) => !stage.requiredResourceType || resource.type === stage.requiredResourceType,
  );

  return (
    <div className={`relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 ${isConnectedStart ? "pt-2.5 pb-0" : isConnectedEnd ? "pt-0 pb-2.5" : "py-2.5"}`}>
      <div className="relative z-10 flex justify-center">
        {isConnectedEnd && (
          <span className="absolute -top-5 h-7 w-[4px] rounded-full bg-[#303236]/75 shadow-[0_0_0_3px_rgba(255,248,240,0.72)]" />
        )}
        <span
          className={`grid h-10 w-10 place-items-center rounded-full border border-white/70 shadow-[0_10px_22px_rgba(92,52,35,0.10)] ${
            stage.segmentType === "wait" ? "text-white" : "text-[#141414]"
          }`}
          style={{ background: tone.bg }}
        >
          <StageIcon className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </span>
      </div>
      <div
        className={`relative border p-3 shadow-[0_8px_20px_rgba(92,52,35,0.06)] ${
          isConnectedStart
            ? "rounded-t-[20px] rounded-b-[8px] border-white/70 border-b-[#303236]/18 bg-[#FFFDF8]/95"
            : isConnectedEnd
              ? "rounded-b-[20px] rounded-t-[8px] border-[#303236]/16 bg-[#F2F0EC]"
              : "rounded-[20px] border-white/70 bg-[#FFFDF8]/92"
        }`}
        style={{ boxShadow: isConnectedEnd ? "0 14px 28px rgba(20,20,20,0.12)" : `0 10px 22px ${tone.shadow}` }}
      >
        {isConnectedEnd && (
          <span className="absolute -top-2 start-5 h-3 w-[calc(100%-2.5rem)] rounded-full bg-[#303236]/10 ring-1 ring-[#303236]/16" />
        )}
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-px w-4 bg-[#D8C8BC]" />
              <p className="truncate text-[14px] font-black text-[#141414]">{displayStageName(displayServiceName(stage.label, isHebrew), isHebrew)}</p>
            </div>
            <p className={`mt-1 text-[11px] font-semibold ${textSoft}`}>
              {isConnectedStart
                ? `${segmentTypeLabel(t, stage.segmentType)} · ${minutesToLabel(stage.durationMinutes)} · ${t.common.add === "Add" ? "active stylist time" : "זמן ספר פעיל"}`
                : isConnectedEnd
                  ? `${segmentTypeLabel(t, stage.segmentType)} · ${minutesToLabel(stage.durationMinutes)} · ${t.common.add === "Add" ? "open time, no stylist" : "זמן פתוח ללא ספר"}`
                  : (
                    <>
                      {segmentTypeLabel(t, stage.segmentType)} · {minutesToLabel(stage.durationMinutes)}
                      {!stage.isActiveStaffTime ? ` · ${w.processingTag}` : ""}
                    </>
                  )}
            </p>
          </div>
          <label className="flex shrink-0 items-center gap-2 rounded-2xl bg-[#FFF8F0] px-3 py-1.5 ring-1 ring-[#EBDDD2]">
            <span className={`text-[10px] font-bold ${textSoft}`}>{w.minutes}</span>
            <input
              type="number"
              min={5}
              step={5}
              value={stage.durationMinutes}
              onChange={(event) => onUpdateStage(service.instanceId, stage.id, {
                durationMinutes: Math.max(5, Number(event.target.value) || 5),
              })}
              className="w-14 bg-transparent text-center text-[15px] font-black text-[#141414] outline-none"
            />
          </label>
          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black transition ${
              showMore ? "bg-[#F3C3BC] text-[#B05F57]" : "bg-[#F8F0E6] text-[#7E7066] hover:bg-[#F3C3BC]/45"
            }`}
          >
            {t.common.add === "Add" ? "More" : "עוד"}
          </button>
          {service.stages.length > 1 && showMore && (
            <button
              type="button"
              onClick={() => onRemoveStage(service.instanceId, stage.id)}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                isDark ? "text-white/45 hover:bg-white/[0.08]" : "text-[#9A8B80] hover:bg-[#F8E5D8] hover:text-red-500"
              }`}
              aria-label={w.removeStage}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {showMore && (
          <div className="mt-3 grid gap-2 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] ${textSoft}`}>{w.stageName}</span>
              <input
                value={stage.label}
                onChange={(event) => onUpdateStage(service.instanceId, stage.id, { label: event.target.value })}
                placeholder={w.stageName}
                className={inputCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] ${textSoft}`}>{w.stageTypeAria}</span>
              <select
                value={stage.segmentType}
                onChange={(event) => {
                  const segmentType = event.target.value as SegmentType;
                  onUpdateStage(service.instanceId, stage.id, {
                    segmentType,
                    isActiveStaffTime: isActiveStaffSegment(segmentType),
                  });
                }}
                className={inputCls}
              >
                {STAGE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{segmentTypeLabel(t, type)}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] ${textSoft}`}>{t.schedule.employee}</span>
              <select
                value={stage.employeeId}
                onChange={(event) => onUpdateStage(service.instanceId, stage.id, { employeeId: event.target.value })}
                className={inputCls}
                disabled={!stage.isActiveStaffTime}
              >
                {staff.map((member) => <option key={member.id} value={member.id}>{displayStaffName(member.name, isHebrew)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] ${textSoft}`}>
                {stage.requiredResourceType ? resourceTypeLabel(t, stage.requiredResourceType) : w.resource}
              </span>
              <select
                value={stage.resourceId ?? ""}
                onChange={(event) => onUpdateStage(service.instanceId, stage.id, {
                  resourceId: event.target.value || undefined,
                })}
                className={inputCls}
              >
                <option value="">{w.none}</option>
                {eligibleResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>{displayResourceName(resource.name, isHebrew)}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {stageIndex < service.stages.length - 1 && (
          <div className="ms-1 mt-3 inline-flex rounded-full bg-[#F8F0E6] px-3 py-1 text-[10px] font-bold text-[#7E7066]">
            + {minutesToLabel(stage.durationMinutes)}
          </div>
        )}
      </div>
    </div>
  );
}

function JourneyMarker({
  icon: Icon,
  title,
  subtitle,
  color,
  action,
  actionExpanded = false,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  action?: React.ReactNode;
  actionExpanded?: boolean;
}) {
  return (
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2.5">
      <div className="relative z-10 flex justify-center">
        <span
          className="grid h-10 w-10 place-items-center rounded-full border border-white/70 text-[#141414] shadow-[0_10px_22px_rgba(92,52,35,0.10)]"
          style={{ background: color }}
        >
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </span>
      </div>
      <div className={`inline-flex flex-col rounded-2xl bg-[#F8F0E6]/70 px-4 py-2.5 ${actionExpanded ? "w-full max-w-[520px]" : "max-w-[380px]"}`}>
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          <span className="h-px w-4 bg-[#D8C8BC]" />
          <p className="shrink-0 text-[14px] font-black text-[#141414]">{title}</p>
          {!actionExpanded && action}
        </div>
        {subtitle && <p className="mt-1 text-[11px] font-semibold text-[#7E7066]">{subtitle}</p>}
        {actionExpanded && action && <div className="mt-3">{action}</div>}
      </div>
    </div>
  );
}

function formatPrice(priceCents: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(priceCents / 100);
}
