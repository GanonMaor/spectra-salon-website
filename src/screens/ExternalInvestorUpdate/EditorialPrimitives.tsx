import React from "react";
import { motion } from "framer-motion";
import type { Localized, UpdateLang } from "./finalCopy";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const loc = (en: string, he: string): Localized => ({ en, he });
export const t = (value: Localized, lang: UpdateLang) => value[lang];

const DISPLAY_EN = '"Playfair Display", "Iowan Old Style", Georgia, serif';
const DISPLAY_HE = '"Frank Ruhl Libre", "Playfair Display", Georgia, serif';

/** Display serif for headlines, chapter marks and large figures. */
export const displayFamily = (lang: UpdateLang) => (lang === "he" ? DISPLAY_HE : DISPLAY_EN);

export const EDITORIAL_TONE = {
  paper: "#f5efe7",
  warm: "#eee5da",
  ink: "#17110d",
  text: "#2b221b",
  inkText: "#fbf6ef",
  accent: "#b1844d",
  accentDark: "#d9b981",
} as const;

type Tone = "paper" | "warm" | "ink";

const TONE_CLASS: Record<Tone, string> = {
  paper: "bg-[#f5efe7] text-[#2b221b]",
  warm: "bg-[#eee5da] text-[#2b221b]",
  ink: "bg-[#17110d] text-[#fbf6ef]",
};

/**
 * Vertical rhythm is intentionally coarse: each chapter picks a role rather
 * than inheriting one shared section template.
 */
const RHYTHM = {
  tight: "py-8 sm:py-10",
  regular: "py-10 sm:py-14",
  feature: "py-10 sm:py-14",
  pause: "py-14 sm:py-20",
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
}> = ({ children, label, id, tone = "paper", rhythm = "regular", chapterStart = false, className = "" }) => (
  <section
    id={id}
    aria-label={label}
    className={`investor-print-block relative px-5 sm:px-8 ${TONE_CLASS[tone]} ${RHYTHM[rhythm]} ${
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
  dark = false,
  className = "",
  strong = false,
}) => (
  <div
    aria-hidden="true"
    className={`h-px w-full ${
      dark
        ? strong
          ? "bg-white/25"
          : "bg-white/12"
        : strong
          ? "bg-[#2b221b]/25"
          : "bg-[#2b221b]/12"
    } ${className}`}
  />
);

export const Kicker: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, dark = false, className = "" }) => (
  <p
    className={`text-[10px] font-semibold uppercase leading-none tracking-[0.26em] ${
      dark ? "text-[#d9b981]" : "text-[#b1844d]"
    } ${className}`}
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
}> = ({ number, title, lang, dark = false, className = "" }) => (
  <div className={`flex items-center gap-4 ${className}`}>
    <span
      dir="ltr"
      style={{ fontFamily: displayFamily(lang) }}
      className={`text-[1.35rem] leading-none tabular-nums ${dark ? "text-[#d9b981]" : "text-[#b1844d]"}`}
    >
      {number}
    </span>
    <span
      aria-hidden="true"
      className={`h-px w-10 shrink-0 sm:w-16 ${dark ? "bg-[#d9b981]/40" : "bg-[#b1844d]/40"}`}
    />
    <Kicker dark={dark}>{t(title, lang)}</Kicker>
  </div>
);

const DISPLAY_SIZE = {
  cover: "text-[clamp(2.5rem,6.4vw,5rem)] leading-[1.02] tracking-[-0.022em]",
  feature: "text-[clamp(2rem,4.4vw,3.5rem)] leading-[1.06] tracking-[-0.018em]",
  chapter: "text-[clamp(1.7rem,3.1vw,2.6rem)] leading-[1.1] tracking-[-0.015em]",
  sub: "text-[clamp(1.25rem,2.1vw,1.65rem)] leading-[1.22] tracking-[-0.012em]",
} as const;

export const Display: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  size?: keyof typeof DISPLAY_SIZE;
  as?: "h1" | "h2" | "h3" | "p";
  dark?: boolean;
  id?: string;
  className?: string;
}> = ({ children, lang, size = "chapter", as = "h2", dark = false, id, className = "" }) => {
  const Tag = as;
  return (
    <Tag
      id={id}
      style={{ fontFamily: displayFamily(lang) }}
      className={`font-normal ${DISPLAY_SIZE[size]} ${dark ? "text-[#fbf6ef]" : "text-[#2b221b]"} ${className}`}
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
}> = ({ children, dark = false, className = "" }) => (
  <p
    className={`text-[1.0625rem] font-light leading-[1.72] sm:text-[1.15rem] ${
      dark ? "text-[#fbf6ef]/76" : "text-[#2b221b]/78"
    } ${className}`}
  >
    {children}
  </p>
);

export const Body: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, dark = false, className = "" }) => (
  <p
    className={`text-[0.95rem] font-light leading-[1.72] sm:text-base ${
      dark ? "text-[#fbf6ef]/58" : "text-[#2b221b]/62"
    } ${className}`}
  >
    {children}
  </p>
);

export const Caption: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, dark = false, className = "" }) => (
  <p
    className={`text-[11px] font-light leading-[1.5] ${
      dark ? "text-[#fbf6ef]/42" : "text-[#2b221b]/45"
    } ${className}`}
  >
    {children}
  </p>
);

export const PullQuote: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  dark?: boolean;
  size?: "chapter" | "feature";
  align?: "start" | "center";
  className?: string;
}> = ({ children, lang, dark = false, size = "chapter", align = "start", className = "" }) => (
  <figure className={`${align === "center" ? "text-center" : ""} ${className}`}>
    <Rule dark={dark} strong />
    <blockquote className="py-5 sm:py-7">
      <Display
        as="p"
        lang={lang}
        size={size}
        dark={dark}
        className={`${align === "center" ? "mx-auto" : ""} max-w-[46rem] italic`}
      >
        {children}
      </Display>
    </blockquote>
    <Rule dark={dark} />
  </figure>
);

/** Newspaper-style metric strip. Numbers live on the page, not in cards. */
export const Dateline: React.FC<{
  items: readonly { value: string; label: Localized }[];
  lang: UpdateLang;
  dark?: boolean;
  size?: "sm" | "lg";
  className?: string;
}> = ({ items, lang, dark = false, size = "sm", className = "" }) => (
  <dl
    dir="ltr"
    className={`grid grid-cols-2 gap-x-5 gap-y-4 sm:flex sm:flex-wrap sm:items-baseline sm:gap-x-8 ${className}`}
  >
    {items.map((item, index) => (
      <div key={item.label.en} className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-2.5">
        {index > 0 && (
          <span
            aria-hidden="true"
            className={`hidden sm:inline ${dark ? "text-[#d9b981]/35" : "text-[#b1844d]/40"}`}
          >
            /
          </span>
        )}
        <dd
          className={`order-1 tabular-nums ${
            size === "lg" ? "text-[1.75rem] sm:text-[2.1rem]" : "text-[1.35rem] sm:text-[1.6rem]"
          } font-light leading-none tracking-[-0.03em] ${dark ? "text-[#fbf6ef]" : "text-[#2b221b]"}`}
        >
          {item.value}
        </dd>
        <dt
          dir={lang === "he" ? "rtl" : "ltr"}
          className={`order-2 min-w-0 text-[10px] font-semibold uppercase leading-tight tracking-[0.14em] ${
            dark ? "text-[#fbf6ef]/40" : "text-[#2b221b]/45"
          }`}
        >
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
}> = ({ items, lang, dark = false, className = "" }) => (
  <p
    className={`flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
      dark ? "text-[#fbf6ef]/58" : "text-[#2b221b]/58"
    } ${className}`}
  >
    {items.map((item, index) => (
      <React.Fragment key={item.en}>
        {index > 0 && (
          <span aria-hidden="true" className={dark ? "text-[#d9b981]/40" : "text-[#b1844d]/45"}>
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
}> = ({ value, lang, label, dark = false, className = "" }) => (
  <div className={className}>
    <p
      dir="ltr"
      style={{ fontFamily: displayFamily(lang) }}
      className={`text-[clamp(3.5rem,10vw,7.5rem)] font-normal leading-[0.9] tracking-[-0.03em] tabular-nums ${
        dark ? "text-[#fbf6ef]" : "text-[#2b221b]"
      }`}
    >
      {value}
    </p>
    {label && (
      <p
        className={`mt-4 text-[11px] font-semibold uppercase tracking-[0.2em] ${
          dark ? "text-[#d9b981]/80" : "text-[#8c6537]"
        }`}
      >
        {label}
      </p>
    )}
  </div>
);

export const Figure: React.FC<{
  children: React.ReactNode;
  caption?: React.ReactNode;
  dark?: boolean;
  className?: string;
}> = ({ children, caption, dark = false, className = "" }) => (
  <figure className={className}>
    {children}
    {caption && (
      <figcaption className="mt-3">
        <Caption dark={dark}>{caption}</Caption>
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
}> = ({ number, title, lang, dark = false, className = "" }) => (
  <div className={`flex items-baseline gap-3 ${className}`}>
    <span
      dir="ltr"
      className={`text-[11px] font-semibold tabular-nums tracking-[0.2em] ${
        dark ? "text-[#d9b981]" : "text-[#b1844d]"
      }`}
    >
      {number}
    </span>
    <span
      className={`text-[11px] font-semibold uppercase tracking-[0.2em] ${
        dark ? "text-[#fbf6ef]/55" : "text-[#2b221b]/55"
      }`}
    >
      {t(title, lang)}
    </span>
  </div>
);
