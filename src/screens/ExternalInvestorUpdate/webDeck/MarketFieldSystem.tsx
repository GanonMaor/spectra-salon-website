import React from "react";
import { CB } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";
import { Body, Kicker, LayerMark, LedgerCell, Rule, slideBase } from "./SlideCompositionKit";

export const MARKET_CORAL = "#B96850";
export const MARKET_CORAL_HOT = "#D08A72";
export const MARKET_GOLD = "#A8863F";
export const MARKET_GOLD_HOT = "#C4A15A";

/** Color-bar working interior. Swap here if a stronger station-floor asset is added. */
export const MARKET_SALON_PHOTO = "/investor-vision/hero/salon-color-room.jpg";
export const MARKET_SUPPLIER_PHOTO = "/investor/media/market-suppliers-warehouse.jpg";

export const MARKET_SOURCES: Localized = {
  en: "Sources: Fortune Business Insights · Grand View Research. Hair-specific figures are contained within their respective primary markets and are not additive.",
  he: "מקורות: Fortune Business Insights · Grand View Research. נתוני השיער כלולים בשווקים הראשיים שלהם ואינם מצטברים.",
};

export type MarketFieldSpec = {
  id: string;
  className: string;
  image: string;
  imagePosition: string;
  accent: string;
  accentHot: string;
  kicker: Localized;
  hero: string;
  heroLabel: Localized;
  forecastValue: string;
  forecastWhen: Localized;
  cagr: string;
  nested: string;
  nestedLabel: Localized;
  share: Localized;
  sharePercent: number;
  footnote: Localized;
  index: Localized;
  leaders?: boolean;
};

const SchwarzkopfMark: React.FC = () => (
  <svg viewBox="0 0 36 36" width="30" height="30" aria-hidden="true">
    <circle cx="18" cy="18" r="16.4" fill="none" stroke="currentColor" strokeWidth="1.35" />
    <path
      fill="currentColor"
      d="M18.6 7.6c-2.9 0-5 2.2-5 5.1 0 1.7.8 3.1 2 3.9-2.5 1.4-4.2 4.3-4.6 7.6h12.1c-.4-2.5-1.6-4.8-3.5-6.1 1.3-.8 2.1-2.2 2.1-3.8 0-3-2.1-5.2-3.1-6.7z"
    />
  </svg>
);

const LeaderLockup: React.FC<{
  over: string;
  under?: string;
  mark?: React.ReactNode;
}> = ({ over, under, mark }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 9,
      color: "rgba(251,246,239,0.92)",
      minWidth: 0,
    }}
  >
    {mark}
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span
        style={{
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: over.length > 12 ? "0.02em" : "0.06em",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {over}
      </span>
      {under ? (
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.16em",
            lineHeight: 1,
            textTransform: "uppercase",
            opacity: 0.6,
            whiteSpace: "nowrap",
          }}
        >
          {under}
        </span>
      ) : null}
    </div>
  </div>
);

/** Overlaid on the supplier photo: who the products in the room come from. */
const ProfessionalLeaders: React.FC<{ lang: UpdateLang }> = ({ lang }) => (
  <div
    dir="ltr"
    style={{
      position: "absolute",
      insetInline: 30,
      bottom: 28,
      display: "flex",
      flexDirection: "column",
      gap: 18,
      pointerEvents: "none",
    }}
  >
    <p
      style={{
        margin: 0,
        color: "rgba(217,185,129,0.72)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
      }}
    >
      {lang === "he" ? "מובילים מקצועיים נבחרים" : "Selected professional leaders"}
    </p>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 18,
      }}
    >
      <LeaderLockup over="L’ORÉAL" under="Professionnel" />
      <LeaderLockup over="WELLA" under="Professionals" />
      <LeaderLockup over="SCHWARZKOPF" under="Professional" mark={<SchwarzkopfMark />} />
      <LeaderLockup over="REVLON" under="Professional" />
      <LeaderLockup over="PAUL MITCHELL" />
    </div>
  </div>
);

/**
 * Market slide on the update page's composition: a layer mark over the kicker,
 * one headline number owning the top of the column, a ruled ledger grid instead
 * of cards, and a photograph carrying the full height of the right column.
 */
export const MarketFieldSlide: React.FC<{
  lang: UpdateLang;
  spec: MarketFieldSpec;
}> = ({ lang, spec }) => {
  const text = (value: Localized) => value[lang];

  return (
    <WebSlide
      id={spec.id}
      label={text(spec.kicker)}
      lang={lang}
      tone="paper"
      className={spec.className}
    >
      <div style={{ ...slideBase(lang), justifyContent: "space-between", gap: 30 }}>
        <LayerMark>{text(spec.index)}</LayerMark>

        <div
          style={{
            flex: 1,
            minHeight: 0,
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.02fr) minmax(0, 0.98fr)",
            gap: 78,
            alignItems: "stretch",
          }}
        >
          <div style={{ minWidth: 0, display: "flex", flexDirection: "column" }}>
            <Kicker>{text(spec.kicker)}</Kicker>

            <p
              className="deck-hero-metric"
              style={{
                margin: "28px 0 0",
                color: CB.ink,
                fontSize: 152,
                fontWeight: 600,
                lineHeight: 0.92,
                letterSpacing: "-0.055em",
                fontVariantNumeric: "tabular-nums",
                whiteSpace: "nowrap",
              }}
            >
              <span dir="ltr">{spec.hero}</span>
            </p>
            <p
              style={{
                margin: "18px 0 0",
                color: CB.muted,
                fontSize: 16,
                fontWeight: 600,
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {text(spec.heroLabel)}
            </p>

            <Rule style={{ marginTop: 34 }} />
            <div
              className="deck-ledger"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                borderBottom: `1px solid ${CB.lineStrong}`,
              }}
            >
              <LedgerCell
                first
                label={text(spec.forecastWhen)}
                value={spec.forecastValue}
                note={spec.cagr}
              />
              <LedgerCell
                label={text(spec.nestedLabel)}
                value={spec.nested}
                note={text(spec.share)}
              />
              <LedgerCell
                label={lang === "he" ? "נתח" : "Share"}
                value={`${spec.sharePercent}%`}
                note={
                  <span
                    aria-hidden="true"
                    style={{
                      display: "block",
                      width: "100%",
                      height: 4,
                      marginTop: 6,
                      background: CB.line,
                    }}
                  >
                    <span
                      style={{
                        display: "block",
                        width: `${spec.sharePercent}%`,
                        height: "100%",
                        background: `linear-gradient(90deg, ${CB.copperDeep}, ${CB.copper})`,
                      }}
                    />
                  </span>
                }
              />
            </div>

            <Body size="lead" style={{ marginTop: "auto", paddingTop: 40, maxWidth: 780 }}>
              {text(spec.footnote)}
            </Body>
          </div>

          <figure
            aria-hidden="true"
            style={{
              position: "relative",
              margin: 0,
              minWidth: 0,
              overflow: "hidden",
              border: `1px solid ${CB.lineStrong}`,
              background: "#0D0906",
            }}
          >
            <img
              src={spec.image}
              alt=""
              width={1200}
              height={1400}
              decoding="async"
              style={{
                display: "block",
                width: "100%",
                height: "100%",
                objectFit: "cover",
                objectPosition: spec.imagePosition,
                opacity: spec.leaders ? 0.5 : 0.88,
              }}
            />
            {spec.leaders ? (
              <>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(0deg,rgba(9,6,4,0.94) 0%,rgba(9,6,4,0.55) 42%,rgba(9,6,4,0.25) 100%)",
                  }}
                />
                <ProfessionalLeaders lang={lang} />
              </>
            ) : null}
          </figure>
        </div>

        <div>
          <Rule />
          <p
            style={{
              margin: "18px 0 0",
              maxWidth: "76%",
              color: CB.faint,
              fontSize: 15,
              fontWeight: 400,
              lineHeight: 1.45,
            }}
          >
            {text(MARKET_SOURCES)}
          </p>
        </div>
      </div>
    </WebSlide>
  );
};
