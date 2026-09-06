/**
 * ActTransitions.tsx
 *
 * Reusable bilingual act-transition components for the four-act investor story.
 *
 * Components:
 *   ActLabel        — understated act marker above beats 04 and 06
 *   ActCurtain      — dark cinematic break immediately before beat 07
 *   ActInterstitial — clean analytical pause between beats 07 and 08
 *
 * Design contract:
 *   - Color Bar tokens only (CB.* from colorBarTokens.ts); no new palette values
 *     except the dark-act palette (DC.*) which mirrors CanonicalSalonAiSection
 *   - Horizontal padding via --iu-gutter (defined on .investor-update-page)
 *   - Bilingual EN / HE with dir="" and colorBarSans(lang)
 *   - Reduced-motion safe via the Reveal primitive
 *   - Accessible <section aria-label> on every component
 *   - No gradients, no glass, no prose em dashes, no new dependencies
 */

import React from "react";
import { NetworkConstellation } from "../SpectraInvestorExperience/visuals/NetworkConstellation";
import { CB, CB_INK, colorBarSans } from "./colorBarTokens";
import { Reveal } from "./EditorialPrimitives";
import type { UpdateLang } from "./finalCopy";

/* ── Act catalogue ────────────────────────────────────────────────────── */

/** One of the four acts in the investor story. */
export type ActNumber = 1 | 2 | 3 | 4;

type ActDef = {
  roman: string;
  title: { readonly en: string; readonly he: string };
};

/**
 * Exact act titles as specified. Hebrew translations are natural equivalents
 * that preserve the strategic framing of each act.
 */
const ACTS: Readonly<Record<ActNumber, ActDef>> = {
  1: {
    roman: "I",
    title: {
      en: "Wedge in a Giant Market",
      he: "טריז בשוק ענק",
    },
  },
  2: {
    roman: "II",
    title: {
      en: "Proof the Engine Works",
      he: "הוכחה שהמנוע עובד",
    },
  },
  3: {
    roman: "III",
    title: {
      en: "Platform and Payoff",
      he: "פלטפורמה ותמורה",
    },
  },
  4: {
    roman: "IV",
    title: {
      en: "Business, Moat and Deal",
      he: "עסק, חפיר ועסקה",
    },
  },
} as const;

/* ── Shared helpers ───────────────────────────────────────────────────── */

/** Horizontal gutter matches the page-level CSS variable (ExternalInvestorUpdatePage). */
const GUTTER: React.CSSProperties = {
  paddingLeft: "var(--iu-gutter, 1.5rem)",
  paddingRight: "var(--iu-gutter, 1.5rem)",
};

/** Full-width centered content column — same width cap as Chapter/Spread. */
const COLUMN = "mx-auto w-full max-w-[68rem]";

/** Accessible section label for a given act and language. */
function actAriaLabel(def: ActDef, lang: UpdateLang): string {
  return `Act ${def.roman}: ${def.title[lang]}`;
}

/* ── Dark-act palette ─────────────────────────────────────────────────── */

/**
 * Dark-canvas palette deliberately mirrors the DA.* constants inside
 * CanonicalSalonAiSection so that ActCurtain visually joins beat 07.
 * These values must not drift from that source.
 */
const DC = {
  bg: CB_INK.bg,
  ink: CB_INK.ink,
  muted: CB_INK.muted,
  accent: CB_INK.gold,
  line: CB_INK.line,
} as const;

/* ── Prop types ───────────────────────────────────────────────────────── */

export type ActLabelProps = {
  /** Which act this label introduces. */
  act: ActNumber;
  lang: UpdateLang;
  reducedMotion: boolean;
  /** Optional id for deep-linking or scroll-spy. */
  id?: string;
};

export type ActCurtainProps = {
  act: ActNumber;
  lang: UpdateLang;
  reducedMotion: boolean;
  id?: string;
};

export type ActInterstitialProps = {
  act: ActNumber;
  lang: UpdateLang;
  reducedMotion: boolean;
  id?: string;
};

/* ── ActLabel ─────────────────────────────────────────────────────────── */

/**
 * Understated inline act marker. Sits directly above beats 04 and 06 on the
 * cream canvas without breaking the scroll. Tight vertical rhythm: it functions
 * as a reading-room label, not a scene break.
 *
 * Composition: copper hairline · "Act {roman}" kicker · "/" separator · title
 * All on one line, left-aligned (RTL: right-aligned), small-caps weight.
 */
export const ActLabel: React.FC<ActLabelProps> = ({ act, lang, reducedMotion, id }) => {
  const def = ACTS[act];
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <section
      id={id}
      aria-label={actAriaLabel(def, lang)}
      dir={dir}
      className="investor-print-block"
      style={{
        ...GUTTER,
        backgroundColor: CB.bg,
        paddingTop: "2rem",
        paddingBottom: "0.625rem",
      }}
    >
      <div className={COLUMN}>
        <Reveal reducedMotion={reducedMotion}>
          {/* Single inline row: hairline · act number · separator · title */}
          <div className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="block h-px w-7 shrink-0"
              style={{ backgroundColor: CB.copper, opacity: 0.4 }}
            />
            {/* Act serial — always LTR, tabular figures */}
            <p
              dir="ltr"
              style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
              className="shrink-0 text-[10px] font-extrabold uppercase leading-none tracking-[0.18em]"
            >
              Act {def.roman}
            </p>
            {/* Slash separator — decorative, not a prose dash */}
            <span
              aria-hidden="true"
              style={{ color: CB.faint }}
              className="select-none text-[10px] font-normal leading-none"
            >
              /
            </span>
            {/* Act title */}
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.muted }}
              className="min-w-0 truncate text-[10px] font-semibold uppercase leading-none tracking-[0.13em]"
            >
              {def.title[lang]}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

/* ── ActCurtain ───────────────────────────────────────────────────────── */

/**
 * Dark cinematic act break placed immediately before beat 07 (Salon AI).
 *
 * Uses the same dark stage palette as CanonicalSalonAiSection (DC.bg = #0C0907)
 * so the curtain and the beat form one unbroken dark canvas. Top padding opens
 * the dark space; the section intentionally carries no bottom hairline because
 * the following beat continues on the same background.
 *
 * Composition (centered column, top-anchored):
 *   copper hairline
 *   "Act {roman}" — small copper kicker
 *   Act title      — ink white, editorial sans, medium display weight
 */
export const ActCurtain: React.FC<ActCurtainProps> = ({ act, lang, reducedMotion, id }) => {
  const def = ACTS[act];
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <section
      id={id}
      aria-label={actAriaLabel(def, lang)}
      dir={dir}
      className="investor-print-block relative overflow-hidden"
      style={{
        ...GUTTER,
        backgroundColor: DC.bg,
        paddingTop: "5.5rem",
        paddingBottom: "2.25rem",
      }}
    >
      <NetworkConstellation
        dark
        count={12}
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-[0.16] sm:block"
      />
      <div className={`${COLUMN} relative z-10`}>
        <Reveal reducedMotion={reducedMotion}>
          {/* Copper hairline — anchors the act block against the dark field */}
          <span
            aria-hidden="true"
            className="mb-5 block h-px w-10"
            style={{ backgroundColor: DC.accent, opacity: 0.4 }}
          />

          {/* Act serial number */}
          <p
            dir="ltr"
            style={{ fontFamily: colorBarSans(lang), color: DC.accent }}
            className="mb-2.5 text-[10px] font-extrabold uppercase leading-none tracking-[0.2em]"
          >
            Act {def.roman}
          </p>

          {/* Act title — display weight, subdued so the orb that follows is the climax */}
          <p
            style={{ fontFamily: colorBarSans(lang), color: DC.ink }}
            className="max-w-[34ch] text-[clamp(1.3rem,3vw,1.9rem)] font-semibold leading-[1.15] tracking-[-0.03em]"
          >
            {def.title[lang]}
          </p>
        </Reveal>
      </div>
    </section>
  );
};

/* ── ActInterstitial ──────────────────────────────────────────────────── */

/**
 * Clean analytical act break between beats 07 (dark) and 08 (light data layer).
 *
 * #F8F6F1 is slightly warmer than the cream canvas (CB.bg = #FBFAF7), giving
 * the eye a distinct register change — like turning the page to a new section
 * in a printed document. A full-width copper hairline top-border marks the
 * transition from dark to light without decoration.
 *
 * Composition (two-column on sm+, stacked on mobile):
 *   [Act {roman}]  ——————————  [Act title]
 *
 * The rule between them stretches to fill available space, reinforcing the
 * analytical / table-of-contents feel.
 */
export const ActInterstitial: React.FC<ActInterstitialProps> = ({ act, lang, reducedMotion, id }) => {
  const def = ACTS[act];
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <section
      id={id}
      aria-label={actAriaLabel(def, lang)}
      dir={dir}
      className="investor-print-block"
      style={{
        ...GUTTER,
        backgroundColor: "#F8F6F1",
        borderTop: `1px solid ${CB.lineStrong}`,
        paddingTop: "3rem",
        paddingBottom: "2.75rem",
      }}
    >
      <div className={COLUMN}>
        <Reveal reducedMotion={reducedMotion}>
          {/*
           * Mobile: stacked column — act number above, title below.
           * Desktop (sm+): inline row — act number · hairline rule · title.
           */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {/* Act serial — always LTR */}
            <p
              dir="ltr"
              style={{ fontFamily: colorBarSans(lang), color: CB.copperDeep }}
              className="shrink-0 text-[10px] font-extrabold uppercase leading-none tracking-[0.18em]"
            >
              Act {def.roman}
            </p>

            {/* Expanding hairline rule — visible on sm+ only */}
            <span
              aria-hidden="true"
              className="hidden h-px flex-1 sm:block"
              style={{ backgroundColor: CB.lineStrong }}
            />

            {/* Act title */}
            <p
              style={{ fontFamily: colorBarSans(lang), color: CB.ink }}
              className="text-[clamp(1.05rem,2.4vw,1.4rem)] font-semibold leading-[1.2] tracking-[-0.028em]"
            >
              {def.title[lang]}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
