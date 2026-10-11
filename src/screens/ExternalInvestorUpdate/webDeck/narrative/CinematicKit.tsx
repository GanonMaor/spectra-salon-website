import React from "react";
import { SpectraOrb } from "../../../../components/SpectraOrb";
import { NetworkConstellation } from "../../../SpectraInvestorExperience/visuals/NetworkConstellation";
import { CB_INK, inkGold } from "../../colorBarTokens";
import type { UpdateLang } from "../../finalCopy";

/**
 * Cinematic primitives for the poster-grade slides. These sit behind the
 * ordinary safe-area content as a `bleed` on `WebSlide` (which is already
 * `position: relative`, so absolutely-positioned children here fill it).
 *
 * Two moods:
 *  - `PosterPhoto` — a sharp full-bleed photograph with a directional scrim,
 *    for slides where the image itself must read as deliberate imagery.
 *  - `GlowField` — no photograph: a dark ground with a soft gold bloom and a
 *    faint constellation texture, so an abstract dark slide still feels
 *    layered rather than a flat corporate-black rectangle.
 */

export const PosterPhoto: React.FC<{
  image: string;
  lang: UpdateLang;
  position?: string;
  /** side = directional scrim favoring the text-safe side (RTL-aware); bottom = caption plate; full = even darken; none = no scrim. */
  scrim?: "side" | "bottom" | "full" | "none";
  darkness?: number;
  grayscale?: number;
  brightness?: number;
  /** "rgb-triplet" string. Defaults to near-black; pass a cream triplet for a warm/light plate instead of a dark one. */
  scrimColor?: string;
  vignette?: boolean;
}> = ({
  image,
  lang,
  position = "center",
  scrim = "side",
  darkness = 0.62,
  grayscale = 0,
  brightness = 1,
  scrimColor = "12,10,8",
  vignette = true,
}) => {
  const rtl = lang === "he";
  return (
    <>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url('${image}')`,
          backgroundSize: "cover",
          backgroundPosition: position,
          filter: grayscale || brightness !== 1 ? `grayscale(${grayscale}) brightness(${brightness})` : undefined,
        }}
      />
      {scrim === "side" ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(${rtl ? 260 : 100}deg, rgba(${scrimColor},${darkness}) 0%, rgba(${scrimColor},${darkness * 0.5}) 46%, rgba(${scrimColor},0.04) 100%)`,
          }}
        />
      ) : null}
      {scrim === "bottom" ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, rgba(${scrimColor},0.02) 14%, rgba(${scrimColor},${darkness}) 52%, rgba(${scrimColor},${Math.min(1, darkness + 0.06)}) 100%)`,
          }}
        />
      ) : null}
      {scrim === "full" ? (
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `rgba(${scrimColor},${darkness})` }} />
      ) : null}
      {vignette ? (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(130% 95% at 50% 50%,transparent 55%,rgba(${scrimColor},0.24) 100%)`,
          }}
        />
      ) : null}
    </>
  );
};

/** No photograph: a dark ground with a soft bloom and a quiet constellation texture. */
export const GlowField: React.FC<{
  x?: number;
  y?: number;
  size?: number;
  count?: number;
}> = ({ x = 50, y = 46, size = 62, count = 30 }) => (
  <>
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: CB_INK.bg }} />
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: `radial-gradient(${size}% ${size * 0.8}% at ${x}% ${y}%, ${inkGold(0.13)} 0%, transparent 72%)`,
      }}
    />
    <NetworkConstellation
      dark
      count={count}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.55 }}
    />
  </>
);

/** Re-exported so slide files have one import surface for the orb + gold ring. */
export { SpectraOrb };

export const OrbHalo: React.FC<{ size: number; ring?: boolean }> = ({ size, ring = true }) => (
  <div style={{ position: "relative", width: size, height: size, display: "grid", placeItems: "center" }}>
    {ring
      ? [0, Math.round(size * 0.16)].map((inset) => (
          <span
            key={inset}
            aria-hidden="true"
            style={{ position: "absolute", inset, borderRadius: "50%", border: `1px solid ${inkGold(0.14)}` }}
          />
        ))
      : null}
    <SpectraOrb size={Math.round(size * 0.72)} />
  </div>
);

/** Monumental poster headline. Sized well past the deck's normal "hero" scale. */
export const PosterHeadline: React.FC<{
  children: React.ReactNode;
  lang: UpdateLang;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({ children, lang, size = 108, color = CB_INK.ink, style }) => (
  <h1
    style={{
      margin: 0,
      color,
      fontSize: lang === "he" ? size * 0.94 : size,
      fontWeight: 600,
      lineHeight: 0.98,
      letterSpacing: "-0.055em",
      ...style,
    }}
  >
    {children}
  </h1>
);

export const PosterKicker: React.FC<{ children: React.ReactNode; color?: string; style?: React.CSSProperties }> = ({
  children,
  color = CB_INK.gold,
  style,
}) => (
  <p
    style={{
      margin: 0,
      color,
      fontSize: 16,
      fontWeight: 700,
      letterSpacing: "0.2em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </p>
);

export const PosterIndex: React.FC<{ children: React.ReactNode; color?: string }> = ({
  children,
  color = "rgba(234,227,216,0.4)",
}) => (
  <p
    dir="ltr"
    style={{
      margin: 0,
      color,
      fontSize: 14,
      fontWeight: 600,
      letterSpacing: "0.18em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </p>
);
