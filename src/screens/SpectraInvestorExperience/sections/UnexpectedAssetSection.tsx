import React from "react";
import { INV } from "../tokens";
import { InvestorSection, InvestorEyebrow, InvestorHeadline, InvestorCopy } from "../primitives";
import { SignalGraph } from "../visuals/SignalGraph";
import { UNEXPECTED } from "../copy";

export const UnexpectedAssetSection: React.FC = () => {
  const eq = UNEXPECTED.equation;

  return (
    <InvestorSection id="unexpected-asset" aria-label="The unexpected asset — operational data" width="wide">
      <div className="max-w-3xl mb-8">
        <InvestorEyebrow dark className="mb-5">{UNEXPECTED.eyebrow}</InvestorEyebrow>
        <InvestorHeadline dark size="h1">{UNEXPECTED.headline}</InvestorHeadline>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
        <div className="lg:col-span-3">
          <SignalGraph
            dark
            signals={UNEXPECTED.signals}
            chain={["Brand", "Tube", "Formula", "Service", "Reorder"]}
            resultLabel={eq.result}
          />
          <p className="mt-6 text-sm font-light" style={{ color: INV.textOnDarkSoft }}>
            {UNEXPECTED.signalsClosing}
          </p>
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <EqBox label={eq.left} />
            <span style={{ color: INV.textOnDarkSoft }}>{eq.plus}</span>
            <EqBox label={eq.right} />
            <span style={{ color: INV.gold }}>{eq.equals}</span>
            <EqBox label={eq.result} accent />
          </div>

          <div
            className="rounded-2xl p-6 sm:p-8"
            style={{ background: "rgba(255,255,255,0.06)", border: `1px solid rgba(193,154,99,0.35)` }}
          >
            <p
              className="text-xl sm:text-2xl font-light leading-snug"
              style={{ color: INV.textOnDark, whiteSpace: "pre-line" }}
            >
              &ldquo;{UNEXPECTED.quote}&rdquo;
            </p>
          </div>

          <InvestorCopy dark muted size="small">
            {UNEXPECTED.closing}
          </InvestorCopy>
        </div>
      </div>
    </InvestorSection>
  );
};

const EqBox: React.FC<{ label: string; accent?: boolean }> = ({ label, accent }) => (
  <span
    className="px-3 py-1.5 rounded-lg font-medium"
    style={{
      background: accent ? "rgba(193,154,99,0.18)" : "rgba(255,255,255,0.06)",
      border: `1px solid ${accent ? "rgba(193,154,99,0.45)" : "rgba(255,255,255,0.16)"}`,
      color: accent ? INV.gold : INV.textOnDark,
    }}
  >
    {label}
  </span>
);
