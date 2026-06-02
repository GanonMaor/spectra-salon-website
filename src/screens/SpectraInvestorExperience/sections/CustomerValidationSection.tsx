import React, { Suspense, lazy } from "react";
import { INV } from "../tokens";
import { InvestorEyebrow, InvestorHeadline, InvestorCopy, GradientText } from "../primitives";
import { VALIDATION } from "../copy";

// Reuse the real customer video carousel (iPhone mockups) from the public site.
const ClientCarousel = lazy(() =>
  import("../../../components/ClientCarousel").then((m) => ({ default: m.ClientCarousel })),
);

export const CustomerValidationSection: React.FC = () => {
  return (
    <section
      id="validation"
      aria-label="Customer validation"
      className="relative w-full py-6 sm:py-8"
      style={{ background: "transparent" }}
    >
      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
        <div className="flex justify-center mb-6">
          <InvestorEyebrow>{VALIDATION.eyebrow}</InvestorEyebrow>
        </div>
        <InvestorHeadline size="h1" className="mb-5">
          Trusted by <GradientText>Professionals</GradientText>
        </InvestorHeadline>
        <InvestorCopy size="lg" muted className="max-w-2xl mx-auto mb-4">
          {VALIDATION.subhead}
        </InvestorCopy>

        {/* Region badges */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {VALIDATION.regions.map((region) => (
            <span
              key={region}
              className="px-4 py-1.5 rounded-full text-sm font-light"
              style={{
                color: INV.textSecondary,
                background: INV.bgCard,
                border: `1px solid ${INV.border}`,
              }}
            >
              {region}
            </span>
          ))}
        </div>

        {/* Real customer videos — iPhone carousel */}
        <Suspense
          fallback={
            <div className="h-[600px] flex items-center justify-center" style={{ color: INV.textMuted }}>
              Loading customer stories…
            </div>
          }
        >
          <ClientCarousel />
        </Suspense>

        {/* Rating */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 mt-12">
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5" fill={INV.gold} viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-base font-medium" style={{ color: INV.textSecondary }}>
            4.9 from 650+ reviews
          </span>
        </div>

        <p className="mt-4 text-sm font-light" style={{ color: INV.textMuted }}>
          {VALIDATION.mapNote}
        </p>
      </div>
    </section>
  );
};
