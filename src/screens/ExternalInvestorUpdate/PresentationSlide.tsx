import React from "react";
import { displayFamily } from "./EditorialPrimitives";
import type { Localized, UpdateLang } from "./finalCopy";

/**
 * Fixed presentation canvas for the investor PDF.
 *
 * The web story stays a continuous editorial page. This module is a separate
 * slide canvas: every page is composed on purpose instead of being produced by
 * browser pagination. The DOM canvas is 1920x1080 CSS px, which is exactly
 * 20in x 11.25in at 96dpi, so the PDF can be sized physically (16:9) while PNG
 * frames still export at 1920x1080 with no scaling.
 */
export const SLIDE = {
  width: 1920,
  height: 1080,
  /** Physical page size for `@page`, identical to the pixel canvas. */
  pageWidthIn: 20,
  pageHeightIn: 11.25,
  safeX: 104,
  safeY: 80,
  /** Reserved band for the running foot, inside the safe area. */
  footHeight: 46,
} as const;

export const SLIDE_CONTENT_WIDTH = SLIDE.width - SLIDE.safeX * 2;
export const SLIDE_CONTENT_HEIGHT = SLIDE.height - SLIDE.safeY * 2 - SLIDE.footHeight;

export const P = {
  paper: "#f5efe7",
  warm: "#eee5da",
  ink: "#17110d",
  text: "#2b221b",
  inkText: "#fbf6ef",
  accent: "#b1844d",
  accentDeep: "#8c6537",
  accentDark: "#d9b981",
} as const;

/**
 * Presentation type scale. Every step is larger than the equivalent web step,
 * so no slide is ever solved by shrinking type below the continuous version.
 */
export const TYPE = {
  cover: 108,
  feature: 78,
  chapter: 54,
  sub: 36,
  lede: 26,
  body: 20,
  caption: 16,
  kicker: 15,
  fine: 14,
} as const;

export type SlideTone = "paper" | "warm" | "ink";

const TONE: Record<SlideTone, { background: string; color: string }> = {
  paper: { background: P.paper, color: P.text },
  warm: { background: P.warm, color: P.text },
  ink: { background: P.ink, color: P.inkText },
};

export const isDarkTone = (tone: SlideTone) => tone === "ink";

type Bleed = {
  image: string;
  /** CSS gradient painted over the photograph. */
  overlay: string;
  opacity?: number;
};

export const PresentationSlide: React.FC<{
  index: number;
  total: number;
  chapter: string;
  lang: UpdateLang;
  tone?: SlideTone;
  bleed?: Bleed;
  /** Vertical placement of the composition inside the safe area. */
  align?: "start" | "center" | "between";
  children: React.ReactNode;
}> = ({ index, total, chapter, lang, tone = "paper", bleed, align = "start", children }) => {
  const dark = isDarkTone(tone);
  const { background, color } = TONE[tone];

  return (
    <section
      data-pdf-slide="true"
      data-slide-index={index}
      aria-label={`${index} / ${total} ${chapter}`}
      style={{
        position: "relative",
        width: SLIDE.width,
        height: SLIDE.height,
        overflow: "hidden",
        background,
        color,
        breakAfter: index === total ? "auto" : "page",
        pageBreakAfter: index === total ? "auto" : "always",
        breakInside: "avoid",
        pageBreakInside: "avoid",
      }}
    >
      {bleed && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: `url('${bleed.image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              opacity: bleed.opacity ?? 0.24,
            }}
          />
          <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: bleed.overlay }} />
        </>
      )}

      <div
        data-slide-content="true"
        style={{
          position: "absolute",
          left: SLIDE.safeX,
          top: SLIDE.safeY,
          width: SLIDE_CONTENT_WIDTH,
          height: SLIDE_CONTENT_HEIGHT,
          display: "flex",
          flexDirection: "column",
          justifyContent:
            align === "center" ? "center" : align === "between" ? "space-between" : "flex-start",
        }}
      >
        {children}
      </div>

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: SLIDE.safeX,
          right: SLIDE.safeX,
          bottom: SLIDE.safeY - 12,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 32,
          borderTop: `1px solid ${dark ? "rgba(255,255,255,0.14)" : "rgba(43,34,27,0.14)"}`,
          paddingTop: 12,
        }}
      >
        <span
          style={{
            fontSize: TYPE.fine,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            color: dark ? "rgba(251,246,239,0.42)" : "rgba(43,34,27,0.40)",
          }}
        >
          Spectra
          <span style={{ color: dark ? "rgba(217,185,129,0.5)" : "rgba(177,132,77,0.5)", margin: "0 12px" }}>
            ·
          </span>
          {chapter}
        </span>
        <span
          dir="ltr"
          style={{
            fontFamily: displayFamily(lang),
            fontSize: 22,
            lineHeight: 1.2,
            fontVariantNumeric: "tabular-nums",
            color: dark ? "rgba(217,185,129,0.68)" : "rgba(140,101,55,0.7)",
          }}
        >
          {String(index).padStart(2, "0")}
        </span>
      </div>
    </section>
  );
};

/* ------------------------------------------------------------------ type */

export const Hair: React.FC<{
  dark?: boolean;
  strong?: boolean;
  style?: React.CSSProperties;
}> = ({ dark = false, strong = false, style }) => (
  <div
    aria-hidden="true"
    style={{
      height: 1,
      width: "100%",
      background: dark
        ? strong
          ? "rgba(255,255,255,0.3)"
          : "rgba(255,255,255,0.14)"
        : strong
          ? "rgba(43,34,27,0.28)"
          : "rgba(43,34,27,0.14)",
      ...style,
    }}
  />
);

export const SlideKicker: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark = false, style }) => (
  <p
    style={{
      fontSize: TYPE.kicker,
      fontWeight: 600,
      lineHeight: 1.3,
      textTransform: "uppercase",
      letterSpacing: "0.26em",
      color: dark ? P.accentDark : P.accent,
      ...style,
    }}
  >
    {children}
  </p>
);

export const SlideTitle: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  size?: keyof Pick<typeof TYPE, "cover" | "feature" | "chapter" | "sub">;
  dark?: boolean;
  italic?: boolean;
  accent?: boolean;
  style?: React.CSSProperties;
}> = ({ children, lang, size = "chapter", dark = false, italic = false, accent = false, style }) => (
  <p
    style={{
      fontFamily: displayFamily(lang),
      fontSize: TYPE[size],
      lineHeight: size === "cover" ? 1.08 : size === "feature" ? 1.12 : 1.2,
      letterSpacing: size === "sub" ? "-0.012em" : "-0.02em",
      fontStyle: italic ? "italic" : "normal",
      fontWeight: 400,
      color: accent ? (dark ? P.accentDark : P.accentDeep) : dark ? P.inkText : P.text,
      ...style,
    }}
  >
    {children}
  </p>
);

export const SlideLede: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark = false, style }) => (
  <p
    style={{
      fontSize: TYPE.lede,
      fontWeight: 300,
      lineHeight: 1.6,
      color: dark ? "rgba(251,246,239,0.78)" : "rgba(43,34,27,0.8)",
      ...style,
    }}
  >
    {children}
  </p>
);

export const SlideBody: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark = false, style }) => (
  <p
    style={{
      fontSize: TYPE.body,
      fontWeight: 300,
      lineHeight: 1.62,
      color: dark ? "rgba(251,246,239,0.62)" : "rgba(43,34,27,0.66)",
      ...style,
    }}
  >
    {children}
  </p>
);

export const SlideCaption: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark = false, style }) => (
  <p
    style={{
      fontSize: TYPE.caption,
      fontWeight: 300,
      lineHeight: 1.5,
      color: dark ? "rgba(251,246,239,0.46)" : "rgba(43,34,27,0.48)",
      ...style,
    }}
  >
    {children}
  </p>
);

/** True small print. Legal qualification never competes with the ask. */
export const SlideFine: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark = false, style }) => (
  <p
    style={{
      fontSize: TYPE.fine,
      fontWeight: 300,
      lineHeight: 1.5,
      color: dark ? "rgba(251,246,239,0.34)" : "rgba(43,34,27,0.34)",
      ...style,
    }}
  >
    {children}
  </p>
);

export const SlideChapterMark: React.FC<{
  number: string;
  title: string;
  dark?: boolean;
  lang: UpdateLang;
  style?: React.CSSProperties;
}> = ({ number, title, dark = false, lang, style }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, ...style }}>
    <span
      dir="ltr"
      style={{
        fontFamily: displayFamily(lang),
        fontSize: 30,
        lineHeight: 1.2,
        fontVariantNumeric: "tabular-nums",
        color: dark ? P.accentDark : P.accent,
      }}
    >
      {number}
    </span>
    <span
      aria-hidden="true"
      style={{
        height: 1,
        width: 88,
        flexShrink: 0,
        background: dark ? "rgba(217,185,129,0.45)" : "rgba(177,132,77,0.45)",
      }}
    />
    <SlideKicker dark={dark}>{title}</SlideKicker>
  </div>
);

/** Newspaper metric strip. Numbers sit on the page, never inside tiles. */
export const SlideDateline: React.FC<{
  items: readonly { value: string; label: Localized }[];
  lang: UpdateLang;
  dark?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({ items, lang, dark = false, size = 40, style }) => (
  <dl
    dir="ltr"
    style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "18px 44px", ...style }}
  >
    {items.map((item, index) => (
      <div key={item.label.en} style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
        {index > 0 && (
          <span
            aria-hidden="true"
            style={{
              marginInlineEnd: 30,
              fontSize: size * 0.5,
              color: dark ? "rgba(217,185,129,0.32)" : "rgba(177,132,77,0.34)",
            }}
          >
            /
          </span>
        )}
        <dd
          style={{
            fontFamily: displayFamily(lang),
            fontSize: size,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            fontVariantNumeric: "tabular-nums",
            color: dark ? P.inkText : P.text,
          }}
        >
          {item.value}
        </dd>
        <dt
          dir={lang === "he" ? "rtl" : "ltr"}
          style={{
            fontSize: TYPE.fine,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            lineHeight: 1.2,
            color: dark ? "rgba(251,246,239,0.44)" : "rgba(43,34,27,0.46)",
          }}
        >
          {item.label[lang]}
        </dt>
      </div>
    ))}
  </dl>
);

/** Small-caps inline list. Replaces chip clusters on every slide. */
export const SlideTerms: React.FC<{
  items: readonly Localized[];
  lang: UpdateLang;
  dark?: boolean;
  accent?: boolean;
  style?: React.CSSProperties;
}> = ({ items, lang, dark = false, accent = false, style }) => (
  <p
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: "8px 16px",
      fontSize: TYPE.kicker,
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "0.16em",
      color: accent
        ? dark
          ? P.accentDark
          : P.accentDeep
        : dark
          ? "rgba(251,246,239,0.62)"
          : "rgba(43,34,27,0.62)",
      ...style,
    }}
  >
    {items.map((item, index) => (
      <React.Fragment key={item.en}>
        {index > 0 && (
          <span
            aria-hidden="true"
            style={{ color: dark ? "rgba(217,185,129,0.42)" : "rgba(177,132,77,0.45)" }}
          >
            ·
          </span>
        )}
        <span>{item[lang]}</span>
      </React.Fragment>
    ))}
  </p>
);

/** Giant editorial figure. The number is the art direction. */
export const SlideFigure: React.FC<{
  value: string;
  lang: UpdateLang;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ value, lang, size = 160, color, style }) => (
  <p
    dir="ltr"
    style={{
      fontFamily: displayFamily(lang),
      fontSize: size,
      lineHeight: 1.02,
      letterSpacing: "-0.035em",
      fontVariantNumeric: "tabular-nums",
      color: color ?? P.text,
      ...style,
    }}
  >
    {value}
  </p>
);

export const SlideArrow: React.FC<{
  lang: UpdateLang;
  dark?: boolean;
  size?: number;
  style?: React.CSSProperties;
}> = ({ lang, dark = false, size = 34, style }) => (
  <span
    aria-hidden="true"
    style={{
      fontSize: size,
      lineHeight: 1,
      color: dark ? "rgba(217,185,129,0.55)" : "rgba(177,132,77,0.6)",
      ...style,
    }}
  >
    {lang === "he" ? "←" : "→"}
  </span>
);

export default PresentationSlide;
