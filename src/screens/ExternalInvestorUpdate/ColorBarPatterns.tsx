import React from "react";
import { CB, CB_SHADOW, colorBarSans } from "./colorBarTokens";
import { Caption } from "./EditorialPrimitives";
import type { Localized, UpdateLang } from "./finalCopy";
import { t as text } from "./EditorialPrimitives";

/**
 * The recurring Color Bar compositions. Each one existed as hand-rolled markup
 * in several sections before; collecting them here keeps the cream/ink/copper
 * system consistent as the story scrolls.
 */

/**
 * Paper mat. Product screenshots, devices, charts and dense tables sit on one
 * of these rather than floating on the cream, and never nest inside each other.
 */
export const Sheet: React.FC<{
  children: React.ReactNode;
  className?: string;
  /** Inner well tone behind an image that does not fill its frame. */
  inset?: boolean;
}> = ({ children, className = "", inset = false }) => (
  <div
    className={`rounded-[20px] border border-[rgba(92,72,42,0.07)] bg-white p-2 sm:p-3 ${className}`}
    style={{ boxShadow: CB_SHADOW.card }}
  >
    {inset ? (
      <div className="overflow-hidden rounded-[15px]" style={{ backgroundColor: CB.well }}>
        {children}
      </div>
    ) : (
      children
    )}
  </div>
);

/**
 * A held line between chapters: quiet band, copper hairline, one sentence.
 * This is the light replacement for the gold-italic-on-black pauses.
 */
export const QuietBand: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  label: string;
  id?: string;
  size?: "statement" | "chapter";
  className?: string;
}> = ({ children, lang, label, id, size = "statement", className = "" }) => (
  <section
    id={id}
    aria-label={label}
    className={`investor-print-block flex items-center py-16 sm:py-24 ${className}`}
    style={{
      paddingLeft: "var(--iu-gutter, 1.5rem)",
      paddingRight: "var(--iu-gutter, 1.5rem)",
      backgroundColor: CB.surface,
      color: CB.ink,
    }}
  >
    <div className="mx-auto w-full max-w-[62rem] text-center">
      <span aria-hidden="true" className="mx-auto mb-7 block h-px w-12" style={{ backgroundColor: CB.copper }} />
      <p
        style={{ fontFamily: colorBarSans(lang) }}
        className={`mx-auto max-w-[26ch] text-pretty font-semibold tracking-[-0.04em] ${
          size === "statement"
            ? "text-[2rem] leading-[1.12] sm:text-[3rem] lg:text-[3.75rem]"
            : "text-[1.6rem] leading-[1.18] sm:text-[2.2rem] lg:text-[2.6rem]"
        }`}
      >
        {children}
      </p>
    </div>
  </section>
);

/**
 * Hairline-ruled rows. Replaces the card grids and reversed panels that used
 * to carry comparisons, mastheads and signal/action pairs.
 */
export const Ledger: React.FC<{
  rows: readonly {
    key: string;
    term: React.ReactNode;
    detail?: React.ReactNode;
    value?: React.ReactNode;
    /** Draws the row in copper as the one that matters. */
    emphasis?: boolean;
  }[];
  className?: string;
}> = ({ rows, className = "" }) => (
  <dl className={`w-full ${className}`}>
    {rows.map((row, index) => (
      <div
        key={row.key}
        className={`grid gap-x-6 gap-y-1.5 py-4 sm:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)_auto] sm:items-baseline ${
          index === 0 ? "border-t-0" : "border-t"
        }`}
        style={index === 0 ? undefined : { borderColor: CB.line }}
      >
        <dt
          className="text-[11px] font-extrabold uppercase tracking-[0.14em]"
          style={{ color: row.emphasis ? CB.copperDeep : CB.ink }}
        >
          {row.term}
        </dt>
        {row.detail !== undefined ? (
          <dd className="text-[13px] leading-[1.6] sm:text-[14px]" style={{ color: CB.muted }}>
            {row.detail}
          </dd>
        ) : (
          <dd />
        )}
        {row.value !== undefined && (
          <dd
            dir="ltr"
            className="text-[15px] font-semibold tabular-nums tracking-[-0.02em] sm:text-[17px] sm:text-end"
            style={{ color: row.emphasis ? CB.copperDeep : CB.ink }}
          >
            {row.value}
          </dd>
        )}
      </div>
    ))}
  </dl>
);

/** Oversized numeral with a copper micro-label. */
export const Stat: React.FC<{
  value: string;
  lang: UpdateLang;
  label?: React.ReactNode;
  detail?: React.ReactNode;
  size?: "md" | "lg";
  className?: string;
}> = ({ value, lang, label, detail, size = "md", className = "" }) => (
  <div className={className}>
    <p
      dir="ltr"
      style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
      className={`font-semibold leading-none tracking-[-0.05em] tabular-nums ${
        size === "lg" ? "text-[2.6rem] sm:text-[3.6rem]" : "text-[1.9rem] sm:text-[2.4rem]"
      } ${lang === "he" ? "text-right" : "text-left"}`}
    >
      {value}
    </p>
    {label && (
      <p
        className="mt-2.5 text-[10px] font-extrabold uppercase tracking-[0.14em]"
        style={{ color: CB.copperDeep }}
      >
        {label}
      </p>
    )}
    {detail && (
      <p className="mt-2 text-[12px] leading-[1.55]" style={{ color: CB.muted }}>
        {detail}
      </p>
    )}
  </div>
);

/** Warm track with a copper-tinted fill. Replaces every reversed bar chart. */
export const BarTrack: React.FC<{
  label: React.ReactNode;
  value?: React.ReactNode;
  /** 0–100. */
  percent: number;
  /** Overrides the copper fill where the color itself carries meaning. */
  color?: string;
  className?: string;
}> = ({ label, value, percent, color = CB.copper, className = "" }) => (
  <div className={className}>
    <div className="flex items-baseline justify-between gap-4">
      <span className="min-w-0 text-[12px] font-semibold tracking-[-0.01em]" style={{ color: CB.ink }}>
        {label}
      </span>
      {value !== undefined && (
        <span dir="ltr" className="shrink-0 text-[12px] font-semibold tabular-nums" style={{ color: CB.muted }}>
          {value}
        </span>
      )}
    </div>
    <div className="mt-2 h-[6px] w-full overflow-hidden rounded-full" style={{ backgroundColor: CB.well }}>
      <div
        className="h-full rounded-full"
        style={{ width: `${Math.max(0, Math.min(100, percent))}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

/**
 * Matted media. Photography and video may fill the frame; product screenshots
 * are passed `fit="contain"` so nothing is cropped.
 */
export const MediaTile: React.FC<{
  children: React.ReactNode;
  ratio?: string;
  caption?: React.ReactNode;
  className?: string;
}> = ({ children, ratio = "4 / 3", caption, className = "" }) => (
  <figure className={className}>
    <Sheet inset>
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: ratio }}>
        {children}
      </div>
    </Sheet>
    {caption && (
      <figcaption className="mt-3">
        <Caption>{caption}</Caption>
      </figcaption>
    )}
  </figure>
);

/** Localized helper so pattern call sites read the same as the sections. */
export const label = (value: Localized, lang: UpdateLang) => text(value, lang);
