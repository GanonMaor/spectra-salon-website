/**
 * Persistent appointment summary panel.
 *
 * Stays visible across every booking step so the user always sees the
 * appointment composition they are building: client, services, stages,
 * journey vs active time, resources, price, and conflict status.
 */

import React from "react";
import { Clock, User, Scissors, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AppointmentComposition, CompositionTotals } from "./bookingFlowTypes";
import { minutesToLabel, clockFromMinutes, formatPriceCents } from "./bookingFlowUtils";
import type { AvailabilityResult } from "./availabilityUtils";

interface Props {
  composition: AppointmentComposition;
  totals: CompositionTotals;
  staffNameById: Record<string, string>;
  isDark: boolean;
  availability?: AvailabilityResult | null;
  savedTimingClientName?: string | null;
}

export const AppointmentSummaryPanel: React.FC<Props> = ({
  composition,
  totals,
  staffNameById,
  isDark,
  availability,
  savedTimingClientName,
}) => {
  const cardCls = isDark
    ? "border-white/[0.10] bg-white/[0.04]"
    : "border-black/[0.06] bg-black/[0.02]";
  const textStrong = isDark ? "text-white" : "text-[#1A1A1A]";
  const textSoft = isDark ? "text-white/55" : "text-black/55";
  const textFaint = isDark ? "text-white/40" : "text-black/40";

  const activeEntries = Object.entries(totals.activeByEmployee);

  return (
    <div className={`flex h-full flex-col rounded-2xl border ${cardCls} p-4`}>
      <p className={`text-[11px] font-bold uppercase tracking-wider ${textFaint}`}>Appointment Summary</p>

      {/* Client + time */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-2">
          <User className={`w-3.5 h-3.5 ${textSoft}`} />
          <span className={`text-[13px] font-semibold ${textStrong}`}>
            {composition.client?.name || "No client selected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className={`w-3.5 h-3.5 ${textSoft}`} />
          <span className={`text-[12px] ${textSoft}`}>
            {composition.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
            {" · "}
            {clockFromMinutes(composition.startMinutes)}
            {totals.clientJourneyMinutes > 0 && ` – ${clockFromMinutes(totals.endMinutes)}`}
          </span>
        </div>
      </div>

      {savedTimingClientName && (
        <div className={`mt-3 rounded-lg px-2.5 py-1.5 text-[10px] font-medium ${isDark ? "bg-amber-400/10 text-amber-300" : "bg-amber-100 text-amber-700"}`}>
          Using saved timing for {savedTimingClientName}
        </div>
      )}

      {/* Services + stages */}
      <div className="mt-4 flex-1 overflow-y-auto scrollbar-thin">
        {composition.services.length === 0 ? (
          <div className={`flex items-center gap-2 text-[12px] ${textFaint}`}>
            <Scissors className="w-3.5 h-3.5" /> No services added yet
          </div>
        ) : (
          <div className="space-y-3">
            {composition.services.map((svc) => (
              <div key={svc.instanceId}>
                <div className="flex items-center justify-between">
                  <span className={`text-[12px] font-semibold ${textStrong}`}>
                    {svc.serviceName}
                    {svc.isLinked && (
                      <span className={`ml-1.5 text-[9px] font-medium ${textFaint}`}>linked</span>
                    )}
                  </span>
                  <span className={`text-[11px] ${textSoft}`}>{formatPriceCents(svc.priceCents)}</span>
                </div>
                <div className="mt-1 space-y-0.5 ps-2">
                  {svc.stages.map((stage) => (
                    <div key={stage.id} className="flex items-center justify-between">
                      <span className={`text-[10.5px] ${textSoft}`}>
                        {stage.label}
                        {!stage.isActiveStaffTime && (
                          <span className={`ml-1 ${textFaint}`}>· processing</span>
                        )}
                      </span>
                      <span className={`text-[10px] ${textFaint}`}>{minutesToLabel(stage.durationMinutes)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Totals */}
      <div className={`mt-3 space-y-1.5 border-t pt-3 ${isDark ? "border-white/[0.08]" : "border-black/[0.06]"}`}>
        <Row label="Client journey" value={minutesToLabel(totals.clientJourneyMinutes)} isDark={isDark} strong />
        {activeEntries.map(([empId, mins]) => (
          <Row
            key={empId}
            label={`${staffNameById[empId] ?? "Staff"} active`}
            value={minutesToLabel(mins)}
            isDark={isDark}
          />
        ))}
        {totals.processingMinutes > 0 && (
          <Row label="Processing" value={minutesToLabel(totals.processingMinutes)} isDark={isDark} />
        )}
        <Row label="Estimated price" value={formatPriceCents(totals.totalPriceCents)} isDark={isDark} strong />
      </div>

      {/* Conflict status */}
      {availability && composition.services.length > 0 && (
        <div className="mt-3">
          {availability.hasBlocking ? (
            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isDark ? "text-red-400" : "text-red-500"}`}>
              <AlertCircle className="w-3.5 h-3.5" /> Conflicts need attention
            </div>
          ) : availability.conflicts.length > 0 ? (
            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isDark ? "text-amber-300" : "text-amber-600"}`}>
              <AlertCircle className="w-3.5 h-3.5" /> {availability.conflicts.length} warning(s)
            </div>
          ) : (
            <div className={`flex items-center gap-1.5 text-[11px] font-medium ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> No conflicts
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; isDark: boolean; strong?: boolean }> = ({ label, value, isDark, strong }) => (
  <div className="flex items-center justify-between">
    <span className={`text-[11px] ${isDark ? "text-white/55" : "text-black/55"}`}>{label}</span>
    <span className={`${strong ? "text-[12px] font-bold" : "text-[11px] font-medium"} ${isDark ? "text-white" : "text-[#1A1A1A]"}`}>{value}</span>
  </div>
);
