import React from "react";
import { motion } from "framer-motion";
import { AnimatedMetric } from "./AnimatedFigures";
import { CB, colorBarSans } from "./colorBarTokens";
import type { Localized, UpdateLang } from "./finalCopy";

/**
 * Web primitives for the external investor story, drawn in the Color Bar
 * language (see `colorBarTokens.ts`): cream paper, brown-black ink, one copper
 * accent, hairlines instead of boxes.
 *
 * Every component still accepts the historical `dark` prop so the section
 * files keep their call signatures, but the story no longer has dark surfaces —
 * the prop is deliberately inert. The PDF deck does not use these components;
 * it only borrows `displayFamily`, `loc` and `t`.
 */

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const loc = (en: string, he: string): Localized => ({ en, he });
export const t = (value: Localized, lang: UpdateLang) => value[lang];

const DISPLAY_EN = '"Playfair Display", "Iowan Old Style", Georgia, serif';
const DISPLAY_HE = '"Frank Ruhl Libre", "Playfair Display", Georgia, serif';

/**
 * Display serif. Retained for the PDF slide deck, which is a separate design
 * system. The web story sets headlines in `colorBarSans`.
 */
export const displayFamily = (lang: UpdateLang) => (lang === "he" ? DISPLAY_HE : DISPLAY_EN);

/**
 * Figures carry `dir="ltr"` so numerals and currency read correctly. Without an
 * explicit alignment they would also flush left in Hebrew and detach from the
 * label beside them, so they are pinned back to the page's reading edge.
 */
export const figureAlign = (lang: UpdateLang) => (lang === "he" ? "text-right" : "text-left");

export const EDITORIAL_TONE = {
  paper: CB.bg,
  warm: CB.surface,
  ink: CB.surface,
  text: CB.ink,
  inkText: CB.ink,
  accent: CB.copper,
  accentDark: CB.copperDeep,
} as const;

type Tone = "paper" | "warm" | "ink";

/**
 * Three surfaces, all light. `ink` survives as an alias so the chapters that
 * used to run on near-black now read as the quiet band instead.
 */
const TONE_CLASS: Record<Tone, string> = {
  paper: "bg-[#FBFAF7] text-[#1C1914]",
  warm: "bg-[#F5F2EC] text-[#1C1914]",
  ink: "bg-[#F5F2EC] text-[#1C1914]",
};

/**
 * Vertical rhythm is intentionally coarse: each chapter picks a role rather
 * than inheriting one shared section template.
 */
const RHYTHM = {
  tight: "py-10 sm:py-14",
  regular: "py-12 sm:py-20",
  feature: "py-14 sm:py-24",
  pause: "py-16 sm:py-28",
  cover: "pb-12 pt-24 sm:pb-14 sm:pt-28",
} as const;

const WIDTH = {
  wide: "max-w-[75rem]",
  page: "max-w-[68rem]",
  column: "max-w-[41rem]",
  narrow: "max-w-[33rem]",
} as const;

export type EditorialWidth = keyof typeof WIDTH;

export const Reveal: React.FC<{
  children: React.ReactNode;
  reducedMotion: boolean;
  className?: string;
  delay?: number;
}> = ({ children, reducedMotion, className = "", delay = 0 }) => (
  <motion.div
    className={className}
    initial={reducedMotion ? false : { opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.1 }}
    transition={{ duration: reducedMotion ? 0.15 : 0.6, ease: EASE, delay: reducedMotion ? 0 : delay }}
  >
    {children}
  </motion.div>
);

export const Chapter: React.FC<{
  children: React.ReactNode;
  label: string;
  id?: string;
  tone?: Tone;
  rhythm?: keyof typeof RHYTHM;
  /** Starts a new page when the story is printed or exported as a PDF. */
  chapterStart?: boolean;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, label, id, tone = "paper", rhythm = "regular", chapterStart = false, className = "", style }) => (
  <section
    id={id}
    aria-label={label}
    /* Use the page-level --iu-gutter token (defined in ExternalInvestorUpdatePage)
       so every chapter's horizontal padding is controlled by one CSS variable.
       The fallback 1.5rem keeps the primitive usable if the token is absent. */
    style={{
      paddingLeft: "var(--iu-gutter, 1.5rem)",
      paddingRight: "var(--iu-gutter, 1.5rem)",
      ...style,
    }}
    className={`investor-print-block relative ${TONE_CLASS[tone]} ${RHYTHM[rhythm]} ${
      chapterStart ? "investor-chapter-start" : ""
    } ${className}`}
  >
    {children}
  </section>
);

export const Spread: React.FC<{
  children: React.ReactNode;
  width?: EditorialWidth;
  className?: string;
}> = ({ children, width = "page", className = "" }) => (
  <div className={`mx-auto ${WIDTH[width]} ${className}`}>{children}</div>
);

export const Rule: React.FC<{ dark?: boolean; className?: string; strong?: boolean }> = ({
  className = "",
  strong = false,
}) => (
  <div
    aria-hidden="true"
    className={`h-px w-full ${strong ? "bg-[rgba(92,72,42,0.14)]" : "bg-[rgba(92,72,42,0.07)]"} ${className}`}
  />
);

export const Kicker: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, className = "" }) => (
  <p
    className={`text-[10px] font-extrabold uppercase leading-none tracking-[0.16em] text-[#82632A] ${className}`}
  >
    {children}
  </p>
);

/** Chapter opener: serial number, hairline, chapter title. */
export const ChapterMark: React.FC<{
  number: string;
  title: Localized;
  lang: UpdateLang;
  dark?: boolean;
  className?: string;
}> = ({ number, title, lang, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <span
      dir="ltr"
      style={{ fontFamily: colorBarSans(lang) }}
      className="text-[1.35rem] font-semibold leading-none tracking-[-0.03em] tabular-nums text-[#82632A]"
    >
      {number}
    </span>
    <span aria-hidden="true" className="h-px w-10 shrink-0 bg-[#A37D38]/40 sm:w-16" />
    <Kicker>{t(title, lang)}</Kicker>
  </div>
);

const DISPLAY_SIZE = {
  cover: "text-[clamp(2.15rem,7.4vw,4.25rem)] leading-[1.02] tracking-[-0.05em]",
  feature: "text-[clamp(1.85rem,5.6vw,3.1rem)] leading-[1.06] tracking-[-0.045em]",
  chapter: "text-[clamp(1.55rem,4.6vw,2.4rem)] leading-[1.1] tracking-[-0.04em]",
  sub: "text-[clamp(1.15rem,3.4vw,1.55rem)] leading-[1.22] tracking-[-0.03em]",
} as const;

export const Display: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  size?: keyof typeof DISPLAY_SIZE;
  as?: "h1" | "h2" | "h3" | "p";
  dark?: boolean;
  id?: string;
  className?: string;
}> = ({ children, lang, size = "chapter", as = "h2", id, className = "" }) => {
  const Tag = as;
  return (
    <Tag
      id={id}
      style={{ fontFamily: colorBarSans(lang) }}
      className={`font-semibold text-[#1C1914] ${DISPLAY_SIZE[size]} ${className}`}
    >
      {children}
    </Tag>
  );
};

/** Opening paragraph of a chapter. Larger measure, higher contrast than body. */
export const Lede: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, className = "" }) => (
  <p className={`text-[1.0625rem] leading-[1.65] text-[#7A7368] sm:text-[1.15rem] ${className}`}>
    {children}
  </p>
);

export const Body: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, className = "" }) => (
  <p className={`text-[0.95rem] leading-[1.68] text-[#7A7368] sm:text-base ${className}`}>{children}</p>
);

export const Caption: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, className = "" }) => (
  <p className={`text-[11px] leading-[1.5] text-[#7A7368] ${className}`}>{children}</p>
);

/**
 * A held statement. Copper hairline above, ink sans below — the quiet beat that
 * used to be set as gold italic on black.
 */
export const PullQuote: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  dark?: boolean;
  size?: "chapter" | "feature";
  align?: "start" | "center";
  className?: string;
}> = ({ children, lang, size = "chapter", align = "start", className = "" }) => (
  <figure className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <span
      aria-hidden="true"
      className={`block h-px w-12 bg-[#A37D38] ${align === "center" ? "mx-auto" : ""}`}
    />
    <blockquote className="pt-5 sm:pt-7">
      <Display as="p" lang={lang} size={size} className={`${align === "center" ? "mx-auto" : ""} max-w-[46rem]`}>
        {children}
      </Display>
    </blockquote>
  </figure>
);

/** Newspaper-style metric strip. Numbers live on the page, not in cards. */
export const Dateline: React.FC<{
  items: readonly { value: string; label: Localized }[];
  lang: UpdateLang;
  dark?: boolean;
  size?: "sm" | "lg";
  className?: string;
  /** Quiet last-mile count. Off everywhere except the cover proof strip. */
  animate?: boolean;
}> = ({ items, lang, size = "sm", className = "", animate = false }) => (
  <dl
    dir={lang === "he" ? "rtl" : "ltr"}
    className={`grid grid-cols-2 gap-x-5 gap-y-4 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-8 ${className}`}
  >
    {items.map((item, index) => (
      <div
        key={item.label.en}
        className={`flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2.5 ${
          items.length % 2 === 1 && index === items.length - 1 ? "col-span-2 sm:col-span-1" : ""
        }`}
      >
        {index > 0 && (
          <span aria-hidden="true" className="hidden text-[#A37D38]/40 sm:inline">
            /
          </span>
        )}
        <dd
          style={{ fontFamily: colorBarSans(lang) }}
          className={`order-1 tabular-nums ${
            size === "lg" ? "text-[1.5rem] sm:text-[2.1rem]" : "text-[1.35rem] sm:text-[1.6rem]"
          } font-semibold leading-none tracking-[-0.04em] text-[#1C1914]`}
        >
          {animate ? (
            <AnimatedMetric value={item.value} delay={index * 40} duration={2600} />
          ) : (
            <span dir="ltr" className="inline-block">
              {item.value}
            </span>
          )}
        </dd>
        <dt className="order-2 min-w-0 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] text-[#7A7368]">
          {t(item.label, lang)}
        </dt>
      </div>
    ))}
  </dl>
);

/** Small-caps inline list. Replaces chip and pill clusters. */
export const TermList: React.FC<{
  items: readonly Localized[];
  lang: UpdateLang;
  dark?: boolean;
  className?: string;
}> = ({ items, lang, className = "" }) => (
  <p
    className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7A7368] ${className}`}
  >
    {items.map((item, index) => (
      <React.Fragment key={item.en}>
        {index > 0 && (
          <span aria-hidden="true" className="text-[#A37D38]/45">
            ·
          </span>
        )}
        <span>{t(item, lang)}</span>
      </React.Fragment>
    ))}
  </p>
);

/** Giant editorial figure. The number is art direction, not a KPI tile. */
export const BigFigure: React.FC<{
  value: string;
  lang: UpdateLang;
  label?: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ value, lang, label, className = "" }) => (
  <div className={className}>
    <p
      dir="ltr"
      style={{ fontFamily: colorBarSans(lang) }}
      className={`text-[clamp(3.25rem,9vw,6.5rem)] font-semibold leading-[0.92] tracking-[-0.05em] tabular-nums text-[#1C1914] ${figureAlign(
        lang,
      )}`}
    >
      {value}
    </p>
    {label && (
      <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#82632A]">{label}</p>
    )}
  </div>
);

export const Figure: React.FC<{
  children: React.ReactNode;
  caption?: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, caption, className = "" }) => (
  <figure className={className}>
    {children}
    {caption && (
      <figcaption className="mt-3">
        <Caption>{caption}</Caption>
      </figcaption>
    )}
  </figure>
);

/** Numbered movement inside a chapter, e.g. the three platform consequences. */
export const Movement: React.FC<{
  number: string;
  title: Localized;
  lang: UpdateLang;
  dark?: boolean;
  className?: string;
}> = ({ number, title, lang, className = "" }) => (
  <div className={`flex items-baseline gap-3 ${className}`}>
    <span dir="ltr" className="text-[11px] font-extrabold tabular-nums tracking-[0.16em] text-[#82632A]">
      {number}
    </span>
    <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7A7368]">
      {t(title, lang)}
    </span>
  </div>
);
