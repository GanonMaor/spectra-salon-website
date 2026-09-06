/**
 * Shared composition system for the opening slides.
 *
 * The layouts and reading order are borrowed from `/investors/2026-update`: a
 * layer mark over a kicker over a display line, ruled ledger grids instead of
 * cards, one photograph carrying a whole column, icons standing in for the
 * nouns, and the body of a slide centred on the canvas rather than stacked
 * down from the header.
 *
 * The palette, weights and rules are the deck's own Color Bar language from
 * `colorBarTokens` — cream paper, brown-black ink, one copper accent. Sizes
 * are absolute because every slide draws on the same 1920x1080 canvas.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import { CB, CB_INK, colorBarSans, inkGold } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";

export const t = (value: Localized, lang: UpdateLang) => value[lang];

/* ── Skin ───────────────────────────────────────────────────────────────── */

/**
 * A slide is either cream paper or ink. Both are the same Color Bar language;
 * on ink the copper accent lifts to gold so it still reads against near-black.
 */
export type SlideSkin = "paper" | "ink";

const SKIN = {
  paper: {
    ink: CB.ink,
    muted: CB.muted,
    faint: CB.faint,
    line: CB.line,
    lineStrong: CB.lineStrong,
    accent: CB.copperDeep,
    panel: CB.surface,
    panelLine: CB.lineStrong,
  },
  ink: {
    ink: CB_INK.ink,
    muted: CB_INK.muted,
    faint: CB_INK.faint,
    line: CB_INK.line,
    lineStrong: CB_INK.lineStrong,
    accent: CB_INK.gold,
    panel: "rgba(255,255,255,0.035)",
    panelLine: inkGold(0.14),
  },
} as const;

const SkinContext = React.createContext<SlideSkin>("paper");

/** Wrap a slide body once; every primitive below reads its colours from here. */
export const SkinProvider: React.FC<{ skin: SlideSkin; children: React.ReactNode }> = ({
  skin,
  children,
}) => <SkinContext.Provider value={skin}>{children}</SkinContext.Provider>;

export const useSkin = () => SKIN[React.useContext(SkinContext)];

/** Base layout every composed slide sits on. */
export const slideBase = (lang: UpdateLang, skin: SlideSkin = "paper"): React.CSSProperties => ({
  position: "relative",
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  fontFamily: colorBarSans(lang),
  color: SKIN[skin].ink,
  textAlign: "start",
});

/* ── Openers ────────────────────────────────────────────────────────────── */

/** The 58x3 accent bar that opens a section. */
export const AccentBar: React.FC<{ color?: string; style?: React.CSSProperties }> = ({
  color,
  style,
}) => {
  const s = useSkin();
  return (
    <span
      aria-hidden="true"
      style={{
        display: "block",
        width: 58,
        height: 3,
        background: color ?? s.accent,
        flexShrink: 0,
        ...style,
      }}
    />
  );
};

/** Chapter serial trailing a hairline that fades out. Sits above the kicker. */
export const LayerMark: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const s = useSkin();
  return (
    <div
      dir="ltr"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 18,
        color: s.faint,
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        style={{
          height: 1,
          width: 92,
          background: `linear-gradient(90deg,${s.lineStrong},transparent)`,
        }}
      />
    </div>
  );
};

export const Kicker: React.FC<{
  children: React.ReactNode;
  /** Draws the accent bar above the label. */
  bar?: boolean;
  style?: React.CSSProperties;
}> = ({ children, bar = true, style }) => {
  const s = useSkin();
  return (
    <div style={style}>
      {bar && <AccentBar style={{ marginBottom: 16 }} />}
      <p
        style={{
          margin: 0,
          color: s.accent,
          fontSize: 15,
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: "0.17em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </p>
    </div>
  );
};

/* ── Type ───────────────────────────────────────────────────────────────── */

export type DisplaySize = "hero" | "headline" | "statement";

const DISPLAY: Record<DisplaySize, { en: number; he: number; lineHeight: number; tracking: string }> =
  {
    hero: { en: 82, he: 78, lineHeight: 1.04, tracking: "-0.055em" },
    headline: { en: 62, he: 57, lineHeight: 1.02, tracking: "-0.05em" },
    statement: { en: 44, he: 41, lineHeight: 1.18, tracking: "-0.032em" },
  };

export const Display: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  size?: DisplaySize;
  as?: "h1" | "h2";
  style?: React.CSSProperties;
}> = ({ children, lang, size = "headline", as: Tag = "h2", style }) => {
  const scale = DISPLAY[size];
  const s = useSkin();
  return (
    <Tag
      data-deck-display={size}
      style={{
        margin: 0,
        color: s.ink,
        fontSize: lang === "he" ? scale.he : scale.en,
        fontWeight: 600,
        lineHeight: scale.lineHeight,
        letterSpacing: scale.tracking,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};

export const Body: React.FC<{
  children: React.ReactNode;
  size?: "lead" | "base";
  style?: React.CSSProperties;
}> = ({ children, size = "base", style }) => {
  const s = useSkin();
  return (
    <p
      data-deck-lead={size === "lead" ? "true" : undefined}
      style={{
        margin: 0,
        color: s.muted,
        fontSize: size === "lead" ? 27 : 21,
        fontWeight: 400,
        lineHeight: 1.45,
        letterSpacing: "-0.014em",
        ...style,
      }}
    >
      {children}
    </p>
  );
};

export const Meta: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const s = useSkin();
  return (
    <p style={{ margin: 0, color: s.faint, fontSize: 15, fontWeight: 500, lineHeight: 1.45, ...style }}>
      {children}
    </p>
  );
};

/** Small uppercase zone heading, optionally led by its icon. */
export const ZoneLabel: React.FC<{
  children: React.ReactNode;
  icon?: LucideIcon;
  align?: "start" | "center";
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, icon, align = "start", color, style }) => {
  const s = useSkin();
  const tint = color ?? s.faint;
  return (
    <h3
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: align === "center" ? "center" : "flex-start",
        gap: 12,
        margin: 0,
        color: tint,
        fontSize: 13,
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        ...style,
      }}
    >
      {icon ? <RowIcon icon={icon} size={19} color={tint} /> : null}
      <span>{children}</span>
    </h3>
  );
};

export const Rule: React.FC<{ strong?: boolean; style?: React.CSSProperties }> = ({
  strong = true,
  style,
}) => {
  const s = useSkin();
  return (
    <div aria-hidden="true" style={{ height: 1, background: strong ? s.lineStrong : s.line, ...style }} />
  );
};

/* ── Icons ──────────────────────────────────────────────────────────────── */

/** Line icon weighted to sit beside body copy without competing with it. */
export const RowIcon: React.FC<{
  icon: LucideIcon;
  size?: number;
  color?: string;
}> = ({ icon: Icon, size = 24, color }) => {
  const s = useSkin();
  return (
    <Icon
      aria-hidden="true"
      size={size}
      strokeWidth={1.5}
      style={{ flexShrink: 0, color: color ?? s.faint }}
    />
  );
};

/**
 * An icon seated in a gold-ringed disc, the signal element of the ink slides.
 * `accent` is the louder version, used once per slide for the thing that
 * matters; both rings stay well under full strength so a column of them reads
 * as a quiet rhythm rather than a row of lights.
 */
export const GoldNode: React.FC<{
  icon: LucideIcon;
  size?: number;
  accent?: boolean;
}> = ({ icon: Icon, size = 44, accent = false }) => (
  <span
    aria-hidden="true"
    style={{
      display: "grid",
      placeItems: "center",
      flexShrink: 0,
      width: size,
      height: size,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.03)",
      boxShadow: accent
        ? `0 0 0 1px ${inkGold(0.58)}, 0 0 0 5px ${inkGold(0.09)}, 0 0 22px ${inkGold(0.16)}`
        : `0 0 0 1px ${inkGold(0.32)}`,
      color: accent ? CB_INK.gold : "rgba(234,227,216,0.78)",
    }}
  >
    <Icon size={Math.round(size * 0.46)} strokeWidth={1.5} />
  </span>
);

/* ── Ink backdrop ───────────────────────────────────────────────────────── */

/**
 * Turns a photograph into an ink canvas: the room blurred back, a directional
 * scrim leaning over the copy column, then a light vignette. The scrim is
 * charcoal rather than black and stops short of opaque, so the room stays
 * present instead of the slide reading as a black rectangle.
 */
export const InkAtmosphere: React.FC<{
  image: string;
  lang: UpdateLang;
  position?: string;
  /** Raise for a darker photograph, lower to push the room further back. */
  brightness?: number;
}> = ({ image, lang, position = "center 40%", brightness = 0.44 }) => (
  <>
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `url('${image}')`,
        backgroundSize: "cover",
        backgroundPosition: position,
        filter: `blur(9px) saturate(0.72) brightness(${brightness})`,
        transform: "scale(1.08)",
      }}
    />
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(${lang === "he" ? 260 : 100}deg,rgba(26,22,19,0.93) 0%,rgba(26,22,19,0.80) 48%,rgba(26,22,19,0.62) 100%)`,
      }}
    />
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(122% 90% at 50% 44%,transparent 46%,rgba(0,0,0,0.30) 100%)",
      }}
    />
  </>
);

/* ── Metrics ────────────────────────────────────────────────────────────── */

export const MetricValue: React.FC<{
  children: React.ReactNode;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, size = 46, color = CB.ink, style }) => (
  <p
    style={{
      margin: 0,
      color,
      fontSize: size,
      fontWeight: 600,
      lineHeight: 0.95,
      letterSpacing: "-0.05em",
      fontVariantNumeric: "tabular-nums",
      ...style,
    }}
  >
    <span dir="ltr">{children}</span>
  </p>
);

/**
 * One cell of a ruled ledger grid — the light-section pattern from the update
 * page. Rules carry the structure, so cells never get a fill or a shadow.
 */
export const LedgerCell: React.FC<{
  label: React.ReactNode;
  value: React.ReactNode;
  note?: React.ReactNode;
  first?: boolean;
}> = ({ label, value, note, first }) => {
  const s = useSkin();
  return (
    <div
      style={{
        minWidth: 0,
        paddingBlock: 26,
        paddingInline: first ? "0 30px" : 30,
        borderInlineStart: first ? undefined : `1px solid ${s.lineStrong}`,
      }}
    >
      <p
        style={{
          margin: 0,
          color: s.muted,
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </p>
      <MetricValue color={s.ink} style={{ marginTop: 16 }}>
        {value}
      </MetricValue>
      {note ? (
        <div style={{ marginTop: 12, color: s.faint, fontSize: 15, fontWeight: 400, lineHeight: 1.4 }}>
          {note}
        </div>
      ) : null}
    </div>
  );
};

/**
 * The one filled panel a slide is allowed, used where two sides meet. A quiet
 * well rather than a card — no shadow, one hairline.
 */
export const CenterPanel: React.FC<{
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ children, style }) => {
  const s = useSkin();
  return (
    <div
      style={{
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 22,
        border: `1px solid ${s.panelLine}`,
        background: s.panel,
        padding: "34px 40px 38px",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
