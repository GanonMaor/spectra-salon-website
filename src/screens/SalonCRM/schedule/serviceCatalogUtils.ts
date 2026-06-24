/**
 * Service catalog helpers.
 *
 * Generates the default operational stages for a service based on its
 * category. Color/highlight-style work is split into active application,
 * processing/waiting, and wash so the calendar can model real salon flow
 * (employee freed during processing, wash station only when needed).
 */

import type { ServiceCategoryId, SegmentType } from "../data/crmTypes";
import type { CrmTranslations } from "../i18n/translations";
import type { ResourceType, ServiceStageDefinition } from "./catalogTypes";

interface StageBlueprint {
  label: string;
  segmentType: SegmentType;
  /** Fraction of the service default duration used when no fixed minutes. */
  fraction?: number;
  fixedMinutes?: number;
  isActiveStaffTime: boolean;
  requiredResourceType?: ResourceType;
}

const CATEGORY_STAGE_BLUEPRINTS: Record<ServiceCategoryId, StageBlueprint[]> = {
  color: [
    { label: "Application", segmentType: "apply", fraction: 0.5, isActiveStaffTime: true, requiredResourceType: "color-station" },
    { label: "Processing", segmentType: "wait", fraction: 0.4, isActiveStaffTime: false },
    { label: "Wash", segmentType: "wash", fixedMinutes: 15, isActiveStaffTime: true, requiredResourceType: "wash-station" },
  ],
  highlights: [
    { label: "Application", segmentType: "apply", fraction: 0.55, isActiveStaffTime: true, requiredResourceType: "color-station" },
    { label: "Processing", segmentType: "wait", fraction: 0.35, isActiveStaffTime: false },
    { label: "Wash", segmentType: "wash", fixedMinutes: 15, isActiveStaffTime: true, requiredResourceType: "wash-station" },
  ],
  toner: [
    { label: "Application", segmentType: "apply", fraction: 0.5, isActiveStaffTime: true, requiredResourceType: "chair" },
    { label: "Processing", segmentType: "wait", fraction: 0.3, isActiveStaffTime: false },
    { label: "Wash", segmentType: "wash", fixedMinutes: 10, isActiveStaffTime: true, requiredResourceType: "wash-station" },
  ],
  straightening: [
    { label: "Application", segmentType: "apply", fraction: 0.45, isActiveStaffTime: true, requiredResourceType: "chair" },
    { label: "Processing", segmentType: "wait", fraction: 0.3, isActiveStaffTime: false },
    { label: "Wash", segmentType: "wash", fixedMinutes: 15, isActiveStaffTime: true, requiredResourceType: "wash-station" },
    { label: "Blow-dry", segmentType: "dry", fraction: 0.25, isActiveStaffTime: true, requiredResourceType: "chair" },
  ],
  treatment: [
    { label: "Application", segmentType: "apply", fraction: 0.55, isActiveStaffTime: true, requiredResourceType: "chair" },
    { label: "Processing", segmentType: "wait", fraction: 0.3, isActiveStaffTime: false },
    { label: "Wash", segmentType: "wash", fixedMinutes: 10, isActiveStaffTime: true, requiredResourceType: "wash-station" },
  ],
  cut: [
    { label: "Cut & Style", segmentType: "service", fraction: 1, isActiveStaffTime: true, requiredResourceType: "chair" },
  ],
  other: [
    { label: "Service", segmentType: "service", fraction: 1, isActiveStaffTime: true, requiredResourceType: "chair" },
  ],
};

/** Round to the nearest 5 minutes, clamped to a sensible minimum. */
function roundMinutes(min: number): number {
  return Math.max(5, Math.round(min / 5) * 5);
}

/**
 * Localized labels for the default stages. `cut` is kept separate from the
 * generic `service` label so a haircut stage reads naturally ("Cut & Style").
 */
export interface StageLabelSet {
  service: string;
  apply: string;
  wait: string;
  wash: string;
  dry: string;
  cut: string;
}

/** Build a localized stage-label set from the CRM translations. */
export function buildStageLabelSet(t: CrmTranslations): StageLabelSet {
  return {
    service: t.schedule.segService,
    apply: t.schedule.segApply,
    wait: t.schedule.segWait,
    wash: t.schedule.segWash,
    dry: t.schedule.segDry,
    cut: t.schedule.catCut,
  };
}

function resolveBlueprintLabel(b: StageBlueprint, labels?: StageLabelSet): string {
  if (!labels) return b.label;
  if (b.label === "Cut & Style") return labels.cut;
  const byType = labels[b.segmentType as keyof StageLabelSet];
  return byType ?? b.label;
}

export function generateDefaultStages(
  categoryId: ServiceCategoryId,
  totalDurationMinutes: number,
  idFactory: (prefix: string) => string,
  labels?: StageLabelSet,
): ServiceStageDefinition[] {
  const blueprints = CATEGORY_STAGE_BLUEPRINTS[categoryId] ?? CATEGORY_STAGE_BLUEPRINTS.other;

  const fixedTotal = blueprints.reduce((sum, b) => sum + (b.fixedMinutes ?? 0), 0);
  const flexible = Math.max(0, totalDurationMinutes - fixedTotal);

  return blueprints.map((b, i) => {
    const minutes = b.fixedMinutes != null
      ? b.fixedMinutes
      : roundMinutes(flexible * (b.fraction ?? 1));
    return {
      id: idFactory("stage"),
      label: resolveBlueprintLabel(b, labels),
      segmentType: b.segmentType,
      durationMinutes: minutes,
      isActiveStaffTime: b.isActiveStaffTime,
      requiredResourceType: b.requiredResourceType,
      sortOrder: i,
    };
  });
}

export const RESOURCE_TYPE_LABELS: Record<ResourceType, string> = {
  "chair": "Chair",
  "wash-station": "Wash Station",
  "treatment-room": "Treatment Room",
  "color-station": "Color Station",
  "other": "Other",
};

export const SEGMENT_TYPE_LABELS: Record<SegmentType, string> = {
  service: "Service",
  apply: "Application",
  wait: "Processing",
  wash: "Wash",
  dry: "Blow-dry",
  checkin: "Check-in",
  checkout: "Checkout",
};

/** Localized label for a workflow segment / stage type. */
export function segmentTypeLabel(t: CrmTranslations, type: SegmentType): string {
  const map: Record<SegmentType, string> = {
    service: t.schedule.segService,
    apply: t.schedule.segApply,
    wait: t.schedule.segWait,
    wash: t.schedule.segWash,
    dry: t.schedule.segDry,
    checkin: t.schedule.segCheckin,
    checkout: t.schedule.segCheckout,
  };
  return map[type] ?? SEGMENT_TYPE_LABELS[type];
}

/** Localized label for a salon resource type. */
export function resourceTypeLabel(t: CrmTranslations, type: ResourceType): string {
  const map: Record<ResourceType, string> = {
    "chair": t.schedule.wizard.resChair,
    "wash-station": t.schedule.wizard.resWashStation,
    "treatment-room": t.schedule.wizard.resTreatmentRoom,
    "color-station": t.schedule.wizard.resColorStation,
    "other": t.schedule.wizard.resOther,
  };
  return map[type] ?? RESOURCE_TYPE_LABELS[type];
}
