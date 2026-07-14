/**
 * CrmPageGate — page-level truthful loading gate.
 *
 * The CRM shell (`CrmShell`) already gates cold-boot on bootstrap success, but
 * individual pages still read the shared normalized state through selectors
 * that can surface an empty/`EMPTY_STATE` snapshot as real business zeros
 * (0 appointments, 100% inventory health, "Everything looks good", empty
 * rosters) whenever readiness is not yet established.
 *
 * This gate makes every page decide between three *distinct* states instead of
 * conflating "still loading" with "genuinely empty":
 *   - `pending`  → dimensionally-stable skeleton (never business defaults)
 *   - `error`    → retryable error (never mixed with an empty state)
 *   - `ready`    → real content, which may then legitimately be empty
 *
 * Readiness comes from `useCRMReady()` (first hydrate only — a background
 * refresh keeps the current content visible so the shell never flashes).
 */

import React from "react";
import { useCRMReady } from "./data/crmHooks";
import { useCRMContext } from "./data/CRMDataProvider";

/** A single dimensionally-fixed skeleton block. Pulse off for reduced motion. */
export const CrmSkeleton: React.FC<{
  className?: string;
  isDark?: boolean;
  rounded?: string;
}> = ({ className = "", isDark = false, rounded = "rounded-xl" }) => (
  <div
    aria-hidden="true"
    className={`animate-pulse motion-reduce:animate-none ${rounded} ${
      isDark ? "bg-white/[0.08]" : "bg-[#EBDDD2]/70"
    } ${className}`}
  />
);

/**
 * Retryable error surface for a page whose first data load failed. Kept
 * intentionally separate from any empty state so a failed load is never shown
 * as "nothing here yet".
 */
export const CrmPageError: React.FC<{
  isDark?: boolean;
  title: string;
  description?: string;
  message?: string | null;
  retryLabel: string;
  onRetry: () => void;
}> = ({ isDark = false, title, description, message, retryLabel, onRetry }) => (
  <div
    role="alert"
    data-testid="crm-page-error"
    className={`grid place-items-center rounded-2xl border border-dashed p-8 text-center ${
      isDark ? "border-[#B05F57]/40 bg-[#B05F57]/10" : "border-[#E3B0AA] bg-[#FBEDEA]"
    }`}
  >
    <div className="max-w-[360px]">
      <h3 className={`text-[14px] font-black ${isDark ? "text-white" : "text-[#141414]"}`}>{title}</h3>
      <p className={`mt-1.5 text-[12px] font-semibold leading-5 ${isDark ? "text-white/60" : "text-[#7E7066]"}`}>
        {message || description}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center justify-center rounded-xl bg-[#D7897F] px-5 py-2 text-[12px] font-black text-white shadow-[0_10px_24px_rgba(215,137,127,0.28)] transition hover:bg-[#C8766D]"
      >
        {retryLabel}
      </button>
    </div>
  </div>
);

export interface CrmPageGateProps {
  /** Page-specific skeleton, sized to match the ready layout to avoid shift. */
  skeleton: React.ReactNode;
  children: React.ReactNode;
  isDark?: boolean;
  /** Localized copy for the error surface (falls back to English). */
  errorTitle?: string;
  errorDescription?: string;
  retryLabel?: string;
}

/**
 * Gate a page on CRM readiness. Renders `skeleton` while pending, a retryable
 * error if the bootstrap failed before any data landed, and `children` once
 * the snapshot is truthfully ready for the current session.
 */
export const CrmPageGate: React.FC<CrmPageGateProps> = ({
  skeleton,
  children,
  isDark = false,
  errorTitle = "We couldn't load this page",
  errorDescription = "Check your connection and try again.",
  retryLabel = "Try again",
}) => {
  const ready = useCRMReady();
  const { bootstrapStatus, error, reload } = useCRMContext();

  if (!ready) {
    // A hard failure before any data is available: show a retry affordance
    // rather than an ambiguous empty page. (When the shell already owns the
    // cold-boot error, pages never mount here — this stays defensive.)
    if (bootstrapStatus === "error") {
      return (
        <CrmPageError
          isDark={isDark}
          title={errorTitle}
          description={errorDescription}
          message={error}
          retryLabel={retryLabel}
          onRetry={() => {
            void reload();
          }}
        />
      );
    }
    return <>{skeleton}</>;
  }

  return <>{children}</>;
};

export default CrmPageGate;
