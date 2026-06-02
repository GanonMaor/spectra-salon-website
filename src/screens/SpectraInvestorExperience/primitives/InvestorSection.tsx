import React from "react";

export type SectionTone = "base" | "soft" | "warm";

interface InvestorSectionProps {
  id: string;
  "aria-label": string;
  children: React.ReactNode;
  /** content max width */
  width?: "narrow" | "wide";
  /** background tone — consumed by the deck slide wrapper, not painted here */
  tone?: SectionTone;
  className?: string;
}

/**
 * Static, light, text-first slide body.
 * Transparent background (the deck slide wrapper paints the tone),
 * compact rhythm, centered content column.
 */
export const InvestorSection: React.FC<InvestorSectionProps> = ({
  id,
  "aria-label": ariaLabel,
  children,
  width = "narrow",
  className = "",
}) => (
  <section
    id={id}
    aria-label={ariaLabel}
    className={`relative w-full py-6 sm:py-8 ${className}`}
    style={{ background: "transparent" }}
  >
    <div
      className={`mx-auto px-6 sm:px-8 lg:px-12 ${
        width === "narrow" ? "max-w-4xl" : "max-w-6xl"
      }`}
    >
      {children}
    </div>
  </section>
);
