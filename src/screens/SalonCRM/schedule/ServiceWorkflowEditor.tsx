/**
 * Service workflow editor.
 *
 * Renders the generated workflow for the appointment composition and lets the
 * user edit each stage: duration, assigned employee, and required resource.
 * Also surfaces linked-service suggestions and the "add another service"
 * action, and supports removing a service from the composition.
 */

import React from "react";
import { Plus, Trash2, Link2, X } from "lucide-react";
import type { SegmentType } from "../data/crmTypes";
import type { CompositionService, CompositionStage } from "./bookingFlowTypes";
import type { SalonResource } from "./catalogTypes";
import { minutesToLabel } from "./bookingFlowUtils";
import { RESOURCE_TYPE_LABELS, SEGMENT_TYPE_LABELS } from "./serviceCatalogUtils";
import { isActiveStaffSegment } from "./appointmentCompositionUtils";

interface StaffOption { id: string; name: string }
interface LinkedSuggestion { id: string; name: string }

/** Stage types offered when editing a workflow. */
const STAGE_TYPE_OPTIONS: SegmentType[] = ["service", "apply", "wait", "wash", "dry"];

interface Props {
  services: CompositionService[];
  staff: StaffOption[];
  resources: SalonResource[];
  isDark: boolean;
  linkedSuggestions: LinkedSuggestion[];
  onUpdateStage: (instanceId: string, stageId: string, patch: Partial<CompositionStage>) => void;
  onRemoveService: (instanceId: string) => void;
  onAddStage: (instanceId: string) => void;
  onRemoveStage: (instanceId: string, stageId: string) => void;
  onAddLinked: (serviceId: string) => void;
  onAddAnother: () => void;
}

export const ServiceWorkflowEditor: React.FC<Props> = ({
  services,
  staff,
  resources,
  isDark,
  linkedSuggestions,
  onUpdateStage,
  onRemoveService,
  onAddStage,
  onRemoveStage,
  onAddLinked,
  onAddAnother,
}) => {
  const cardCls = isDark ? "border-white/[0.10] bg-white/[0.04]" : "border-black/[0.06] bg-white/[0.60]";
  const textStrong = isDark ? "text-white" : "text-[#1A1A1A]";
  const textSoft = isDark ? "text-white/55" : "text-black/55";
  const inputCls = isDark
    ? "bg-white/10 border border-white/15 rounded-md px-2 py-1 text-white text-[11px]"
    : "bg-black/[0.04] border border-black/[0.10] rounded-md px-2 py-1 text-[#1A1A1A] text-[11px]";

  return (
    <div className="space-y-3">
      {services.map((svc) => (
        <div key={svc.instanceId} className={`rounded-xl border ${cardCls} p-3`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {svc.isLinked && <Link2 className={`w-3.5 h-3.5 ${textSoft}`} />}
              <span className={`text-[13px] font-semibold ${textStrong}`}>{svc.serviceName}</span>
            </div>
            <button
              onClick={() => onRemoveService(svc.instanceId)}
              className={`p-1 rounded-md transition-colors ${isDark ? "text-white/40 hover:text-red-400 hover:bg-white/5" : "text-black/40 hover:text-red-500 hover:bg-black/5"}`}
              aria-label="Remove service"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2">
            {svc.stages.map((stage) => {
              const eligibleResources = resources.filter(
                (r) => !stage.requiredResourceType || r.type === stage.requiredResourceType,
              );
              return (
                <div key={stage.id} className={`rounded-lg p-2 ${isDark ? "bg-black/20" : "bg-black/[0.02]"}`}>
                  {/* Stage header: editable label + type + remove */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <input
                      value={stage.label}
                      onChange={(e) => onUpdateStage(svc.instanceId, stage.id, { label: e.target.value })}
                      placeholder="Stage name"
                      className={`${inputCls} flex-1 font-semibold`}
                    />
                    <select
                      value={stage.segmentType}
                      onChange={(e) => {
                        const segmentType = e.target.value as SegmentType;
                        onUpdateStage(svc.instanceId, stage.id, {
                          segmentType,
                          isActiveStaffTime: isActiveStaffSegment(segmentType),
                        });
                      }}
                      className={inputCls}
                      aria-label="Stage type"
                    >
                      {STAGE_TYPE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{SEGMENT_TYPE_LABELS[s]}</option>
                      ))}
                    </select>
                    {svc.stages.length > 1 && (
                      <button
                        onClick={() => onRemoveStage(svc.instanceId, stage.id)}
                        className={`p-1 rounded-md transition-colors ${isDark ? "text-white/40 hover:text-red-400 hover:bg-white/5" : "text-black/40 hover:text-red-500 hover:bg-black/5"}`}
                        aria-label="Remove stage"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  {!stage.isActiveStaffTime && (
                    <p className={`mb-1.5 text-[9px] font-medium ${isDark ? "text-amber-300" : "text-amber-600"}`}>
                      Processing / waiting — employee is free during this stage
                    </p>
                  )}
                  <div className="grid grid-cols-3 gap-1.5">
                    {/* Duration */}
                    <label className="flex flex-col gap-0.5">
                      <span className={`text-[9px] ${textSoft}`}>Minutes</span>
                      <input
                        type="number"
                        min={5}
                        step={5}
                        value={stage.durationMinutes}
                        onChange={(e) => onUpdateStage(svc.instanceId, stage.id, { durationMinutes: Math.max(5, Number(e.target.value) || 5) })}
                        className={inputCls}
                      />
                    </label>
                    {/* Employee */}
                    <label className="flex flex-col gap-0.5">
                      <span className={`text-[9px] ${textSoft}`}>Employee</span>
                      <select
                        value={stage.employeeId}
                        onChange={(e) => onUpdateStage(svc.instanceId, stage.id, { employeeId: e.target.value })}
                        className={inputCls}
                        disabled={!stage.isActiveStaffTime}
                      >
                        {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </label>
                    {/* Resource */}
                    <label className="flex flex-col gap-0.5">
                      <span className={`text-[9px] ${textSoft}`}>
                        {stage.requiredResourceType ? RESOURCE_TYPE_LABELS[stage.requiredResourceType] : "Resource"}
                      </span>
                      <select
                        value={stage.resourceId ?? ""}
                        onChange={(e) => onUpdateStage(svc.instanceId, stage.id, { resourceId: e.target.value || undefined })}
                        className={inputCls}
                      >
                        <option value="">None</option>
                        {eligibleResources.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </label>
                  </div>
                </div>
              );
            })}

            {/* Add a stage (split into apply / wait / wash / …) */}
            <button
              onClick={() => onAddStage(svc.instanceId)}
              className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed text-[11px] font-semibold transition-colors ${
                isDark ? "border-white/15 text-white/60 hover:bg-white/[0.04]" : "border-black/12 text-black/55 hover:bg-black/[0.02]"
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Add stage
            </button>
          </div>
        </div>
      ))}

      {/* Linked suggestions */}
      {linkedSuggestions.length > 0 && (
        <div className={`rounded-xl border ${cardCls} p-3`}>
          <p className={`text-[11px] font-semibold mb-2 ${textSoft}`}>Frequently added services</p>
          <div className="flex flex-wrap gap-1.5">
            {linkedSuggestions.map((ls) => (
              <button
                key={ls.id}
                onClick={() => onAddLinked(ls.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  isDark ? "bg-white/10 text-white/80 hover:bg-white/15" : "bg-black/[0.04] text-black/70 hover:bg-black/[0.08]"
                }`}
              >
                <Plus className="w-3 h-3" /> {ls.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={onAddAnother}
        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed text-[12px] font-semibold transition-colors ${
          isDark
            ? "border-white/20 text-white/70 hover:bg-white/[0.04]"
            : "border-black/15 text-black/60 hover:bg-black/[0.02]"
        }`}
      >
        <Plus className="w-4 h-4" /> Add another service
      </button>
    </div>
  );
};
