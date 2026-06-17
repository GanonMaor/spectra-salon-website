/**
 * src/screens/AdminDashboard/ActionModal.tsx
 * ─────────────────────────────────────────────────────────────────────────
 * Milestone 4: Generic Resolution Action Modal
 *
 * Multi-step modal for product resolution write actions:
 *   1. Load impact preview
 *   2. Show comparison, warnings, and blockers
 *   3. Require reason for structural actions
 *   4. Submit with expected revisions
 *   5. Show success / conflict / failure summary
 *
 * Does NOT reload the full product list after an action — it calls
 * onSuccess(actionId) so the parent can refresh only the affected row.
 */

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  X, AlertTriangle, CheckCircle2, Loader2, ArrowRight,
  Unlink, GitBranch, Info, ShieldAlert,
} from "lucide-react";

import {
  previewResolutionAction,
  executeResolutionAction,
} from "../../lib/product-database/canonicalProductDbClient";
import type {
  ResolutionPreviewParams,
  ResolutionWriteParams,
  ResolutionPreviewResult,
  ResolutionWriteResult,
  DetachPreviewResult,
  ReassignPreviewResult,
  MakeIndependentPreviewResult,
  MergePreviewResult,
} from "../../lib/types/resolutionActions";

// ── Types ──────────────────────────────────────────────────────────────────────

export type ActionKind =
  | "detach"
  | "reassign"
  | "make-independent"
  | "merge"
  | "unmerge"
  | "approve-alias"
  | "keep-separate"
  | "reject-match"
  | "undo";

export interface ActionModalContext {
  kind: ActionKind;
  sourceRecordType?: string;
  sourceRecordId?: string;
  sourceRecordName?: string;
  canonicalProductId?: string;
  canonicalProductName?: string;
  canonicalRevision?: number;
  /** For reassign */
  targetCanonicalId?: string;
  targetCanonicalName?: string;
  /** For merge/unmerge */
  survivingId?: string;
  survivingName?: string;
  mergedId?: string;
  mergedName?: string;
  mergeHistoryId?: string;
  /** For alias/negative decisions */
  reviewItemId?: string;
  candidateCanonicalId?: string;
  /** For undo */
  actionId?: string;
}

interface ActionModalProps {
  context: ActionModalContext;
  isDark?: boolean;
  onClose: () => void;
  onSuccess: (result: ResolutionWriteResult, actionId: string) => void;
}

type Phase =
  | { name: "loading_preview" }
  | { name: "preview"; data: ResolutionPreviewResult }
  | { name: "reason_input"; data: ResolutionPreviewResult; reason: string }
  | { name: "submitting" }
  | { name: "success"; result: ResolutionWriteResult; actionId: string }
  | { name: "conflict"; error: string; preview_stale?: boolean }
  | { name: "error"; error: string; code?: string };

// Actions that require a reason field before submission
const REASON_REQUIRED: ActionKind[] = [
  "detach", "reassign", "make-independent", "merge", "unmerge",
];

// Label map
const KIND_LABELS: Record<ActionKind, string> = {
  "detach": "Detach Source",
  "reassign": "Reassign to Another Product",
  "make-independent": "Make Independent Product",
  "merge": "Merge Products",
  "unmerge": "Reverse Merge",
  "approve-alias": "Approve Alias",
  "keep-separate": "Keep Separate",
  "reject-match": "Reject Match",
  "undo": "Undo Action",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function ActionModal({ context, isDark = true, onClose, onSuccess }: ActionModalProps) {
  const [phase, setPhase] = useState<Phase>({ name: "loading_preview" });
  const cancelledRef = useRef(false);

  const base = isDark ? "dark" : "light";
  const bg = isDark ? "bg-gray-900/95 border-white/10" : "bg-white border-gray-200";
  const header = isDark ? "bg-white/[0.03] border-white/10" : "bg-gray-50 border-gray-100";
  const textPrimary = isDark ? "text-white" : "text-gray-900";
  const textMuted = isDark ? "text-white/50" : "text-gray-500";
  const textSec = isDark ? "text-white/70" : "text-gray-700";
  const inputCls = isDark
    ? "bg-white/[0.05] border-white/15 text-white placeholder-white/30 focus:border-white/40"
    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-400";
  const btnPrimary = isDark
    ? "bg-rose-600 hover:bg-rose-500 text-white"
    : "bg-rose-600 hover:bg-rose-700 text-white";
  const btnSecondary = isDark
    ? "bg-white/5 hover:bg-white/10 border border-white/10 text-white/70"
    : "bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-600";

  // Build preview params
  function buildPreviewParams(): ResolutionPreviewParams {
    const { kind } = context;
    switch (kind) {
      case "detach":
        return {
          action: "detach-preview",
          sourceRecordType: (context.sourceRecordType || "catalog_product_source") as import("../../lib/types/resolutionActions").ProductSourceRecordType,
          sourceRecordId: context.sourceRecordId!,
        };
      case "reassign":
        return {
          action: "reassign-preview",
          sourceRecordType: (context.sourceRecordType || "catalog_product_source") as import("../../lib/types/resolutionActions").ProductSourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          targetCanonicalId: context.targetCanonicalId!,
        };
      case "make-independent":
        return {
          action: "make-independent-preview",
          sourceRecordType: (context.sourceRecordType || "catalog_product_source") as import("../../lib/types/resolutionActions").ProductSourceRecordType,
          sourceRecordId: context.sourceRecordId!,
        };
      case "merge":
        return { action: "merge-preview", survivingId: context.survivingId!, mergedId: context.mergedId! };
      case "unmerge":
        return { action: "unmerge-preview", mergeHistoryId: context.mergeHistoryId! };
      case "approve-alias":
        return {
          action: "approve-alias-preview",
          sourceRecordType: (context.sourceRecordType || "catalog_product_source") as import("../../lib/types/resolutionActions").ProductSourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          canonicalProductId: context.canonicalProductId!,
        };
      case "keep-separate":
        return {
          action: "keep-separate-preview",
          sourceRecordType: (context.sourceRecordType || "catalog_product_source") as import("../../lib/types/resolutionActions").ProductSourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          candidateCanonicalId: context.candidateCanonicalId!,
        };
      case "reject-match":
        return {
          action: "reject-match-preview",
          sourceRecordType: context.sourceRecordType as import("../../lib/types/resolutionActions").ProductSourceRecordType | undefined,
          reviewItemId: context.reviewItemId,
        };
      case "undo":
        return { action: "undo-preview", actionId: context.actionId! };
    }
  }

  // Build write params with operationId + previewToken + impactHash
  function buildWriteParams(reason: string, operationId: string): ResolutionWriteParams {
    const { kind } = context;
    const p = phase.name === "reason_input" ? phase.data : null;
    const pAny = p as unknown as Record<string, unknown>;
    const previewToken = (pAny?.previewToken as string) || "";
    const impactHash = (pAny?.impactHash as string) || "";
    const sourceRecordType = (context.sourceRecordType || "catalog_product_source") as import("../../lib/types/resolutionActions").ProductSourceRecordType;
    switch (kind) {
      case "detach":
        return {
          action: "detach",
          sourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          operationId, previewToken, impactHash,
          reason,
          expectedCanonicalRevision: (p as DetachPreviewResult)?.canonicalRevision,
        };
      case "reassign":
        return {
          action: "reassign",
          sourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          targetCanonicalId: context.targetCanonicalId!,
          operationId, previewToken, impactHash,
          reason,
          expectedSourceRevision: (p as ReassignPreviewResult)?.currentRevision,
          expectedTargetRevision: (p as ReassignPreviewResult)?.targetRevision,
        };
      case "make-independent":
        return {
          action: "make-independent",
          sourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          operationId, previewToken, impactHash,
          reason,
        };
      case "merge":
        return {
          action: "merge",
          survivingId: context.survivingId!,
          mergedId: context.mergedId!,
          operationId, previewToken, impactHash,
          reason,
          expectedSurvivingRevision: (p as MergePreviewResult)?.survivingRevision,
          expectedMergedRevision: (p as MergePreviewResult)?.mergedRevision,
        };
      case "unmerge":
        return { action: "unmerge", mergeHistoryId: context.mergeHistoryId!, operationId, previewToken, impactHash, reason };
      case "approve-alias":
        return {
          action: "approve-alias",
          sourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          canonicalProductId: context.canonicalProductId!,
          operationId, previewToken, impactHash,
          reason,
        };
      case "keep-separate":
        return {
          action: "keep-separate",
          sourceRecordType,
          sourceRecordId: context.sourceRecordId!,
          candidateCanonicalId: context.candidateCanonicalId!,
          operationId, previewToken, impactHash,
          reason,
        };
      case "reject-match":
        return {
          action: "reject-match",
          reviewItemId: context.reviewItemId,
          sourceRecordType,
          sourceRecordId: context.sourceRecordId,
          candidateCanonicalId: context.candidateCanonicalId,
          operationId, previewToken, impactHash,
          reason,
        };
      case "undo":
        return { action: "undo", actionId: context.actionId!, operationId, previewToken, impactHash, reason };
    }
  }

  // Load preview on mount
  useEffect(() => {
    cancelledRef.current = false;
    previewResolutionAction(buildPreviewParams())
      .then((data) => {
        if (!cancelledRef.current) {
          setPhase({ name: "preview", data });
        }
      })
      .catch((e: Error) => {
        if (!cancelledRef.current) {
          setPhase({ name: "error", error: e.message });
        }
      });
    return () => { cancelledRef.current = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function handleProceed(previewData: ResolutionPreviewResult) {
    if (REASON_REQUIRED.includes(context.kind)) {
      setPhase({ name: "reason_input", data: previewData, reason: "" });
    } else {
      const operationId = crypto.randomUUID();
      submitAction("", previewData, operationId);
    }
  }

  async function submitAction(reason: string, previewData: ResolutionPreviewResult, operationId?: string) {
    const opId = operationId || crypto.randomUUID();
    setPhase({ name: "submitting" });
    try {
      const result = await executeResolutionAction(buildWriteParams(reason, opId));
      const resultAny = result as unknown as Record<string, unknown>;
      const actionId = (resultAny.actionId as string) ?? "";
      if (!cancelledRef.current) {
        setPhase({ name: "success", result, actionId });
        onSuccess(result, actionId);
      }
    } catch (e: unknown) {
      if (!cancelledRef.current) {
        const err = e as Error & { conflict?: boolean; preview_stale?: boolean; code?: string };
        if (err.preview_stale) {
          setPhase({ name: "conflict", error: "The product state changed since your preview was loaded. Please close and re-open to generate a fresh preview.", preview_stale: true });
        } else if (err.conflict) {
          setPhase({ name: "conflict", error: err.message });
        } else {
          setPhase({ name: "error", error: err.message, code: err.code });
        }
      }
    }
  }

  const blockers: string[] = (() => {
    if (phase.name !== "preview") return [];
    const d = phase.data as unknown as Record<string, unknown>;
    if (d.blocker) return [d.blocker as string];
    if (Array.isArray(d.blockers)) return d.blockers as string[];
    return [];
  })();

  const warnings: string[] = (() => {
    if (phase.name !== "preview" && phase.name !== "reason_input") return [];
    const d = ((phase as unknown) as { data: unknown }).data as Record<string, unknown>;
    if (Array.isArray(d.warnings)) return d.warnings as string[];
    return [];
  })();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={`relative w-full max-w-lg rounded-2xl border shadow-2xl ${bg}`} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${header}`}>
          <div className="flex items-center gap-3">
            {context.kind === "detach" && <Unlink className="w-4 h-4 text-rose-400" />}
            {context.kind === "reassign" && <ArrowRight className="w-4 h-4 text-blue-400" />}
            {context.kind === "make-independent" && <GitBranch className="w-4 h-4 text-purple-400" />}
            {!["detach","reassign","make-independent"].includes(context.kind) && (
              <Info className="w-4 h-4 text-amber-400" />
            )}
            <span className={`font-semibold text-sm ${textPrimary}`}>{KIND_LABELS[context.kind]}</span>
          </div>
          <button onClick={onClose} className={`p-1.5 rounded-lg ${btnSecondary}`}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">

          {/* Source context */}
          {context.sourceRecordName && (
            <div className={`rounded-lg border px-4 py-3 ${isDark ? "bg-white/[0.03] border-white/10" : "bg-gray-50 border-gray-100"}`}>
              <p className={`text-xs ${textMuted} mb-0.5`}>Source record</p>
              <p className={`text-sm font-medium ${textPrimary} truncate`}>{context.sourceRecordName}</p>
              {context.canonicalProductName && (
                <p className={`text-xs ${textMuted} mt-1`}>
                  Currently assigned to: <span className={textSec}>{context.canonicalProductName}</span>
                </p>
              )}
            </div>
          )}

          {/* Phase-specific body */}
          {phase.name === "loading_preview" && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className={`w-5 h-5 animate-spin ${textMuted}`} />
              <span className={`text-sm ${textMuted}`}>Loading impact preview…</span>
            </div>
          )}

          {(phase.name === "preview" || phase.name === "reason_input") && (
            <PreviewBody
              data={phase.data}
              blockers={blockers}
              warnings={warnings}
              isDark={isDark}
              textPrimary={textPrimary}
              textMuted={textMuted}
              textSec={textSec}
            />
          )}

          {phase.name === "reason_input" && (
            <div className="space-y-2">
              <label className={`block text-xs font-medium ${textMuted}`}>
                Reason <span className="text-rose-400">*</span>
              </label>
              <textarea
                autoFocus
                rows={3}
                className={`w-full rounded-xl border px-3 py-2.5 text-sm resize-none outline-none transition-colors ${inputCls}`}
                placeholder={`Explain why you are performing this ${KIND_LABELS[context.kind].toLowerCase()}…`}
                value={phase.reason}
                onChange={(e) => setPhase({ ...phase, reason: e.target.value })}
              />
            </div>
          )}

          {phase.name === "submitting" && (
            <div className="flex items-center justify-center py-8 gap-3">
              <Loader2 className={`w-5 h-5 animate-spin text-rose-400`} />
              <span className={`text-sm ${textMuted}`}>Applying changes…</span>
            </div>
          )}

          {phase.name === "success" && (
            <div className="flex flex-col items-center py-6 gap-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              <p className={`text-base font-semibold ${textPrimary}`}>Done</p>
              <p className={`text-sm ${textMuted} text-center`}>
                {KIND_LABELS[context.kind]} completed successfully.
              </p>
              {(() => {
                const r = phase.result as unknown as Record<string, unknown>;
                const mode = r?.recalculationMode as string | undefined;
                const affected = r?.analyticsAffected as boolean | undefined;
                const count = r?.reprocessingRequiredCount as number | undefined;
                if (!mode || mode === "not_supported") return null;
                return (
                  <div className={`text-xs text-center px-3 py-2 rounded-lg ${isDark ? "bg-white/5" : "bg-gray-50"}`}>
                    <span className={textMuted}>
                      {mode === "immediate" && "Analytics updated immediately"}
                      {mode === "mark_stale" && `Analytics marked for reprocessing${count ? ` (${count} row${count !== 1 ? "s" : ""})` : ""}`}
                    </span>
                  </div>
                );
              })()}
              {phase.actionId && (
                <p className={`text-[11px] font-mono ${textMuted}`}>{phase.actionId}</p>
              )}
            </div>
          )}

          {phase.name === "conflict" && (
            <div className={`rounded-xl border px-4 py-4 ${isDark ? "bg-rose-500/10 border-rose-500/25" : "bg-rose-50 border-rose-200"}`}>
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-400">
                    {phase.preview_stale ? "Preview Expired" : "Revision Conflict"}
                  </p>
                  <p className={`text-xs mt-1 ${textMuted}`}>{phase.error}</p>
                  {!phase.preview_stale && (
                    <p className={`text-xs mt-2 ${textMuted}`}>
                      The record was modified since you loaded the preview. Reload and try again.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {phase.name === "error" && (
            <div className={`rounded-xl border px-4 py-4 ${isDark ? "bg-rose-500/10 border-rose-500/25" : "bg-rose-50 border-rose-200"}`}>
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-rose-400">Error</p>
                  <p className={`text-xs mt-1 ${textMuted}`}>{phase.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`flex items-center justify-end gap-2 px-6 py-4 border-t ${header}`}>
          {phase.name === "success" ? (
            <button className={`px-4 py-2 rounded-xl text-sm font-medium ${btnPrimary}`} onClick={onClose}>
              Close
            </button>
          ) : phase.name === "conflict" || phase.name === "error" ? (
            <>
              <button className={`px-4 py-2 rounded-xl text-sm font-medium ${btnSecondary}`} onClick={onClose}>Close</button>
              {phase.name === "conflict" && (
                <button
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${btnPrimary}`}
                  onClick={() => { setPhase({ name: "loading_preview" }); }}
                >
                  Reload Preview
                </button>
              )}
            </>
          ) : phase.name === "preview" ? (
            <>
              <button className={`px-4 py-2 rounded-xl text-sm font-medium ${btnSecondary}`} onClick={onClose}>Cancel</button>
              {blockers.length === 0 && (
                <button
                  className={`px-4 py-2 rounded-xl text-sm font-medium ${btnPrimary}`}
                  onClick={() => handleProceed(phase.data)}
                >
                  {REASON_REQUIRED.includes(context.kind) ? "Continue →" : "Confirm"}
                </button>
              )}
            </>
          ) : phase.name === "reason_input" ? (
            <>
              <button className={`px-4 py-2 rounded-xl text-sm font-medium ${btnSecondary}`} onClick={() => {
                if (phase.name === "reason_input") {
                  setPhase({ name: "preview", data: phase.data });
                }
              }}>Back</button>
              <button
                disabled={!("reason" in phase) || !(phase as { reason: string }).reason.trim()}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-opacity ${btnPrimary} disabled:opacity-40 disabled:cursor-not-allowed`}
                onClick={() => {
                  if (phase.name === "reason_input") {
                    const operationId = crypto.randomUUID();
                    submitAction(phase.reason, phase.data, operationId);
                  }
                }}
              >
                Apply {KIND_LABELS[context.kind]}
              </button>
            </>
          ) : (
            <button className={`px-4 py-2 rounded-xl text-sm font-medium ${btnSecondary}`} onClick={onClose} disabled={phase.name === "submitting"}>
              Cancel
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// ── PreviewBody ───────────────────────────────────────────────────────────────

function PreviewBody({
  data,
  blockers,
  warnings,
  isDark,
  textPrimary,
  textMuted,
  textSec,
}: {
  data: ResolutionPreviewResult;
  blockers: string[];
  warnings: string[];
  isDark: boolean;
  textPrimary: string;
  textMuted: string;
  textSec: string;
}) {
  const d = data as unknown as Record<string, unknown>;

  return (
    <div className="space-y-3">
      {/* Blockers */}
      {blockers.map((b, i) => (
        <div key={i} className={`flex items-start gap-2.5 rounded-xl border px-3 py-3 ${isDark ? "bg-rose-500/10 border-rose-500/25" : "bg-rose-50 border-rose-200"}`}>
          <ShieldAlert className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-rose-400 font-medium">{b}</p>
        </div>
      ))}

      {/* Warnings */}
      {warnings.map((w, i) => (
        <div key={i} className={`flex items-start gap-2.5 rounded-xl border px-3 py-3 ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-400">{w}</p>
        </div>
      ))}

      {/* Impact counts */}
      <div className={`rounded-xl border px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-xs ${isDark ? "bg-white/[0.03] border-white/10" : "bg-gray-50 border-gray-100"}`}>
        {([
          ["affectedSources", "Source records"],
          ["affectedMappings", "Identity mappings"],
          ["affectedUsageResolutions", "Usage resolutions"],
          ["sourcesWillReassign", "Sources to reassign"],
          ["aliasesWillReassign", "Aliases to reassign"],
          ["mappingsWillReassign", "Mappings to reassign"],
          ["usageResolutionsWillReassign", "Usage rows to reassign"],
          ["reviewItemsWillBeCreated", "Review items to create"],
        ] as [string, string][]).filter(([k]) => d[k] != null && d[k] !== 0).map(([k, label]) => (
          <div key={k}>
            <span className={textMuted}>{label}: </span>
            <span className={`font-semibold ${textPrimary}`}>{String(d[k])}</span>
          </div>
        ))}
      </div>

      {/* Missing fields */}
      {Array.isArray(d.missingFields) && (d.missingFields as string[]).length > 0 && (
        <div className={`text-xs px-3 py-2 rounded-lg ${isDark ? "bg-white/[0.02]" : "bg-gray-50"}`}>
          <span className={textMuted}>Missing fields: </span>
          <span className={`font-medium ${textSec}`}>{(d.missingFields as string[]).join(", ")}</span>
          <span className={` ${textMuted}`}> — review items will be created.</span>
        </div>
      )}

      {/* Unsupported fields notice */}
      {Array.isArray(d.unsupportedFields) && (d.unsupportedFields as string[]).length > 0 && (
        <div className={`text-xs px-3 py-2 rounded-lg ${isDark ? "bg-white/[0.02]" : "bg-gray-50"}`}>
          <span className={textMuted}>Not yet calculated: </span>
          <span className={textMuted}>{(d.unsupportedFields as string[]).join(", ")}</span>
        </div>
      )}
    </div>
  );
}
