/**
 * CrmBootScreen — the ONLY thing the CRM shell renders before bootstrap
 * succeeds.
 *
 * It is intentionally content-free: no salon name, no calendars, no metrics,
 * no business navigation. It renders a branded, full-viewport, dimensionally
 * stable skeleton whose outer frame is identical in the loading and error
 * variants, so recovering from a retry never shifts layout. All motion is
 * suppressed under `prefers-reduced-motion`.
 */

import React from "react";
import { SpectraLogo } from "../HairGPT/SpectraLogo";

interface CrmBootScreenProps {
  /**
   * When set, the screen shows a branded retry state instead of the loading
   * skeleton. The frame/geometry is shared with the loading variant.
   */
  error?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  /** Localized copy so the shell controls language without new i18n wiring. */
  labels?: Partial<CrmBootScreenLabels>;
  /** Text direction, mirrored from the CRM locale. */
  dir?: "ltr" | "rtl";
}

export interface CrmBootScreenLabels {
  brand: string;
  tagline: string;
  loadingTitle: string;
  loadingHint: string;
  errorTitle: string;
  errorHint: string;
  retry: string;
}

const DEFAULT_LABELS: CrmBootScreenLabels = {
  brand: "SalonAi",
  tagline: "from book to look",
  loadingTitle: "Preparing your workspace…",
  loadingHint: "Securely loading your salon.",
  errorTitle: "We couldn't load your salon",
  errorHint: "Check your connection and try again.",
  retry: "Try again",
};

/** A single dimensionally-fixed skeleton bar. Pulse disabled for reduced motion. */
function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-full bg-[#EBDDD2] motion-reduce:animate-none ${className}`}
      aria-hidden="true"
    />
  );
}

const CrmBootScreen: React.FC<CrmBootScreenProps> = ({
  error = false,
  errorMessage,
  onRetry,
  labels,
  dir = "ltr",
}) => {
  const copy = { ...DEFAULT_LABELS, ...labels };

  return (
    <div
      dir={dir}
      role="status"
      aria-live="polite"
      aria-busy={!error}
      data-testid="crm-boot-screen"
      data-variant={error ? "error" : "loading"}
      className="fixed inset-0 z-[70] grid min-h-[100dvh] place-items-center overflow-hidden px-6"
      style={{
        background:
          "radial-gradient(circle at 12% 20%, rgba(249,185,92,0.22), transparent 30%), radial-gradient(circle at 88% 16%, rgba(150,199,179,0.22), transparent 28%), linear-gradient(135deg, #FFF8F0, #FFFDF8)",
      }}
    >
      {/* Fixed-height card so loading↔error never resizes the viewport. */}
      <div className="flex min-h-[320px] w-full max-w-sm flex-col items-center justify-center rounded-[32px] border border-[#EBDDD2] bg-white/80 px-8 py-10 text-center shadow-[0_26px_80px_rgba(92,52,35,0.12)]">
        <div className="flex flex-col items-center">
          <SpectraLogo size={44} />
          <p className="mt-4 text-[22px] font-black leading-none tracking-[-0.04em] text-[#141414]">
            {copy.brand}
          </p>
          <p className="mt-1.5 text-[8px] font-bold uppercase tracking-[0.26em] text-[#7E7066]">
            {copy.tagline}
          </p>
        </div>

        {error ? (
          <div className="mt-8 flex w-full flex-col items-center">
            <p className="text-[15px] font-black text-[#141414]">{copy.errorTitle}</p>
            <p className="mt-2 text-[12px] font-semibold leading-5 text-[#7E7066]">
              {errorMessage || copy.errorHint}
            </p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-[#D7897F] px-6 py-2.5 text-[13px] font-black text-white shadow-[0_14px_34px_rgba(215,137,127,0.30)] transition hover:bg-[#C8766D]"
              >
                {copy.retry}
              </button>
            )}
          </div>
        ) : (
          <div className="mt-8 flex w-full flex-col items-center">
            <p className="text-[15px] font-black text-[#141414]">{copy.loadingTitle}</p>
            <p className="mt-2 text-[12px] font-semibold text-[#7E7066]">{copy.loadingHint}</p>
            <div className="mt-6 flex w-full flex-col items-center gap-2.5">
              <SkeletonBar className="h-2.5 w-40" />
              <SkeletonBar className="h-2.5 w-28" />
              <SkeletonBar className="h-2.5 w-36" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CrmBootScreen;
