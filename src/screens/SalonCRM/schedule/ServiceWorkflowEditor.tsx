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
  categoryColors?: Record<string, string>;
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

function serviceColor(service: CompositionService, categoryColors?: Record<string, string>): string {
  return categoryColors?.[service.categoryId] ?? defaultServiceColor(service.crmCategoryId);
}

export const ServiceWorkflowEditor: React.FC<Props> = ({
  services,
  staff,
  resources,
  categoryColors,
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
        <div className="relative py-2">
          <div className="absolute bottom-8 start-[24px] top-8 w-px rounded-full bg-[#EBDDD2]/65" />
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
                <span className="grid h-9 w-9 place-items-center rounded-full border border-white/80 bg-[#FFF8F0] text-[#B05F57]/60">
                  <Plus className="h-[17px] w-[17px]" strokeWidth={2} />
                </span>
              </div>
              <div className="flex items-center">
                <div className="rounded-2xl border border-dashed border-[#EBDDD2] bg-white/70 px-4 py-3">
                  <p className={`text-[12px] font-black ${textStrong}`}>
                    {t.common.add === "Add" ? "Next: choose a category and service" : "השלב הבא: לבחור קטגוריה ושירות"}
                  </p>
                  <p className={`mt-1 text-[11px] font-semibold ${textSoft}`}>
                    {t.common.add === "Add" ? "The service will open here inside this timeline." : "השירות ייפתח כאן בתוך אותו ציר זמן."}
                  </p>
                </div>
              </div>
            </div>
          )}
          <JourneyMarker
            icon={LogOut}
            title={t.common.add === "Add" ? "Check-out" : "יציאה וסיכום"}
            subtitle=""
            color={CALENDAR_DESIGN_COLORS.peche}
          />
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
            categoryColors={categoryColors}
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
  categoryColors,
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
  categoryColors?: Record<string, string>;
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
  const baseColor = serviceColor(service, categoryColors);
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
          <div className="absolute bottom-8 start-[24px] top-8 w-px rounded-full bg-[#EBDDD2]/65" />
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
                categoryColor={baseColor}
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
                subtitle=""
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
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-2">
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={onAddAnother}
          className="grid h-8 w-8 place-items-center rounded-full border border-[#EBDDD2] bg-white/86 text-[#B05F57] shadow-[0_6px_14px_rgba(92,52,35,0.08)] transition hover:bg-[#FFF1E8]"
          aria-label={t.common.add === "Add" ? "Open add flow" : "פתח הוספה"}
        >
          <Plus className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
      <div className="min-w-0 flex items-center">
        {action ?? (
          <button
            type="button"
            onClick={onAddAnother}
            className="inline-flex items-center gap-1.5 text-[12px] font-black text-[#B05F57] transition hover:text-[#8F4F49]"
          >
            + {t.common.add === "Add" ? "Add service" : "הוסף שירות"}
          </button>
        )}
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
    <div className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 py-0.5">
      <div className="relative z-10 flex justify-center">
        <button
          type="button"
          onClick={onAdd}
          aria-label={label}
          title={label}
          className="grid h-6 w-6 place-items-center rounded-full border border-[#EBDDD2] bg-white/80 text-[#B05F57]/80 shadow-[0_4px_10px_rgba(92,52,35,0.05)] transition hover:bg-[#FFF1E8] hover:text-[#8F4F49]"
        >
          <Plus className="h-3 w-3" strokeWidth={2.1} />
        </button>
      </div>
      <div />
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
  categoryColor,
  onUpdateStage,
  onRemoveStage,
}: {
  service: CompositionService;
  stage: CompositionStage;
  stageIndex: number;
  connectedProcess?: "start" | "end";
  staff: StaffOption[];
  resources: SalonResource[];
  categoryColor: string;
  onUpdateStage: Props["onUpdateStage"];
  onRemoveStage: Props["onRemoveStage"];
}) {
  const [showMore, setShowMore] = React.useState(false);
  const t = useCrmT();
  const w = t.schedule.wizard;
  const isHebrew = t.common.add !== "Add";
  const tone = stageTone(stage.segmentType);
  const stageColor = stage.segmentType === "wait" ? tone.bg : categoryColor;
  const StageIcon = SEGMENT_TYPE_ICONS[stage.segmentType] ?? SEGMENT_TYPE_ICONS.service;
  const isConnectedStart = connectedProcess === "start";
  const isConnectedEnd = connectedProcess === "end";
  const eligibleResources = resources.filter(
    (resource) => !stage.requiredResourceType || resource.type === stage.requiredResourceType,
  );
  const detailLabelCls = isConnectedEnd
    ? "text-white/70"
    : "text-white/90 drop-shadow-sm";
  const detailFieldCls = isConnectedEnd
    ? "rounded-lg border border-white/15 bg-white/10 px-2 py-1.5 text-[11px] font-bold text-white outline-none focus:border-white/35"
    : "rounded-lg border border-white/70 bg-white/88 px-2 py-1.5 text-[11px] font-bold text-[#17120F] shadow-[0_8px_18px_rgba(92,52,35,0.08)] outline-none focus:border-white focus:bg-white";

  return (
    <div className={`relative grid grid-cols-[48px_minmax(0,1fr)] gap-3 ${isConnectedStart ? "pt-2 pb-0" : isConnectedEnd ? "pt-0 pb-2" : "py-2"}`}>
      <div className="relative z-10 flex justify-center">
        <span
          className={`grid h-9 w-9 place-items-center rounded-full border border-white/75 shadow-[0_8px_18px_rgba(92,52,35,0.09)] ${
            stage.segmentType === "wait" ? "text-white" : "text-[#141414]"
          }`}
          style={{ background: stageColor }}
        >
          <StageIcon className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </span>
      </div>
      <div
        className={`relative border p-3 shadow-[0_8px_20px_rgba(92,52,35,0.06)] ${
          showMore ? "w-full" : "w-full sm:w-[430px] sm:max-w-full"
        } ${
          isConnectedStart
            ? "rounded-t-[22px] rounded-b-[6px] border-white/80 border-b-[#303236]/18 text-[#141414]"
            : isConnectedEnd
              ? "rounded-b-[22px] rounded-t-[6px] border-[#303236]/18 bg-[#303236] text-white"
              : "rounded-[20px] border-white/70 text-[#141414]"
        }`}
        style={{
          boxShadow: isConnectedEnd ? "0 14px 28px rgba(20,20,20,0.12)" : `0 10px 22px ${tone.shadow}`,
          background: isConnectedEnd ? undefined : stageColor,
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <span className={`h-px w-4 ${isConnectedEnd ? "bg-white/35" : "bg-[#141414]/38"}`} />
              <p className={`truncate text-[14px] font-black ${isConnectedEnd ? "text-white" : "text-[#17120F]"}`}>{displayStageName(displayServiceName(stage.label, isHebrew), isHebrew)}</p>
            </div>
          </div>
          <label className={`flex shrink-0 items-center gap-2 rounded-2xl px-3 py-1.5 ring-1 ${
            isConnectedEnd ? "bg-white/10 ring-white/12" : "bg-white/88 ring-white/70 shadow-[0_8px_18px_rgba(92,52,35,0.08)]"
          }`}>
            <span className={`text-[10px] font-bold ${isConnectedEnd ? "text-white/66" : "text-[#17120F]/66"}`}>{w.minutes}</span>
            <input
              type="number"
              min={5}
              step={5}
              value={stage.durationMinutes}
              onChange={(event) => onUpdateStage(service.instanceId, stage.id, {
                durationMinutes: Math.max(5, Number(event.target.value) || 5),
              })}
              className={`w-14 bg-transparent text-center text-[15px] font-black outline-none ${isConnectedEnd ? "text-white" : "text-[#141414]"}`}
            />
          </label>
          <button
            type="button"
            onClick={() => setShowMore((value) => !value)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-[10px] font-black transition ${
              showMore
                ? isConnectedEnd ? "bg-white/16 text-white" : "bg-white/86 text-[#17120F]"
                : isConnectedEnd ? "bg-white/10 text-white/76 hover:bg-white/16" : "bg-white/70 text-[#17120F]/72 hover:bg-white/90"
            }`}
          >
            {t.common.add === "Add" ? "More" : "עוד"}
          </button>
          {service.stages.length > 1 && (
            <button
              type="button"
              onClick={() => onRemoveStage(service.instanceId, stage.id)}
              className={`grid h-7 w-7 shrink-0 place-items-center rounded-full transition ${
                isConnectedEnd
                  ? "bg-white/8 text-white/55 hover:bg-red-400/18 hover:text-red-100"
                  : "bg-white/50 text-[#17120F]/55 hover:bg-white/90 hover:text-red-600"
              }`}
              aria-label={w.removeStage}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {showMore && (
          <div className={`mt-3 grid gap-2 rounded-2xl p-2.5 md:grid-cols-[1.2fr_1fr_1fr_1fr] ${
            isConnectedEnd ? "bg-white/[0.045] ring-1 ring-white/10" : "bg-[#17120F]/10 ring-1 ring-white/22"
          }`}>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${detailLabelCls}`}>{w.stageName}</span>
              <input
                value={stage.label}
                onChange={(event) => onUpdateStage(service.instanceId, stage.id, { label: event.target.value })}
                placeholder={w.stageName}
                className={detailFieldCls}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${detailLabelCls}`}>{w.stageTypeAria}</span>
              <select
                value={stage.segmentType}
                onChange={(event) => {
                  const segmentType = event.target.value as SegmentType;
                  onUpdateStage(service.instanceId, stage.id, {
                    segmentType,
                    isActiveStaffTime: isActiveStaffSegment(segmentType),
                  });
                }}
                className={detailFieldCls}
              >
                {STAGE_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>{segmentTypeLabel(t, type)}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${detailLabelCls}`}>{t.schedule.employee}</span>
              <select
                value={stage.employeeId}
                onChange={(event) => onUpdateStage(service.instanceId, stage.id, { employeeId: event.target.value })}
                className={detailFieldCls}
                disabled={!stage.isActiveStaffTime}
              >
                {staff.map((member) => <option key={member.id} value={member.id}>{displayStaffName(member.name, isHebrew)}</option>)}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${detailLabelCls}`}>
                {stage.requiredResourceType ? resourceTypeLabel(t, stage.requiredResourceType) : w.resource}
              </span>
              <select
                value={stage.resourceId ?? ""}
                onChange={(event) => onUpdateStage(service.instanceId, stage.id, {
                  resourceId: event.target.value || undefined,
                })}
                className={detailFieldCls}
              >
                <option value="">{w.none}</option>
                {eligibleResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>{displayResourceName(resource.name, isHebrew)}</option>
                ))}
              </select>
            </label>
          </div>
        )}

        {stageIndex < service.stages.length - 1 && !isConnectedStart && !isConnectedEnd && (
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
      <div className={`inline-flex flex-col rounded-2xl bg-[#F8F0E6]/70 px-3.5 py-2 ${actionExpanded ? "w-full max-w-[460px]" : "h-10 w-full justify-center sm:w-[430px] sm:max-w-full"}`}>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
          <span className="h-px w-4 bg-[#D8C8BC]" />
          <p className="shrink-0 text-[13px] font-black text-[#141414]">{title}</p>
          </span>
          {!actionExpanded && action && <span className="shrink-0">{action}</span>}
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
