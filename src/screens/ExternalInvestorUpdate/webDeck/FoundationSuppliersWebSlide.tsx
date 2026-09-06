import React from "react";
import { CB, colorBarSans } from "../colorBarTokens";
import { FINAL_COVER_EVIDENCE } from "../finalCopy";
import { WebSlide } from "../WebDeckPrimitives";

const GOLD = "#A8863F";
const WAREHOUSE_IMG = "/investor/media/market-suppliers-warehouse.jpg";

const COPY = {
  kicker: { en: "Brands & suppliers", he: "מותגים וספקים" } as const,
  headline: {
    en: "The same service layer also sees the products that enter the room.",
    he: "אותה שכבת שירות רואה גם את המוצרים שנכנסים לחדר.",
  } as const,
  support: {
    en: "Professional color systems, care and treatments — measured at the point of service.",
    he: "מערכות צבע מקצועיות, טיפוח וטיפולים — נמדדים בנקודת השירות.",
  } as const,
  close: {
    en: "From this supply, the salon can run itself.",
    he: "מהאספקה הזו, הסלון יכול לנהל את עצמו.",
  } as const,
} as const;

const BRAND_NAMES = "L'Oréal · Wella · Schwarzkopf · Redken · Matrix";

/** Fourth KPI from the cover evidence bank: "575+" */
const kpi = FINAL_COVER_EVIDENCE.kpis[3];

export const FoundationSuppliersWebSlide: React.FC<{ lang: "en" | "he" }> = ({ lang }) => (
  <WebSlide
    id="web-deck-foundation-suppliers"
    label={COPY.headline[lang]}
    lang={lang}
    tone="paper"
    className="web-deck-foundation-suppliers"
  >
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        fontFamily: colorBarSans(lang),
        justifyContent: "space-between",
      }}
    >
      {/* ── Main two-column area ── */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.08fr) minmax(0, 0.92fr)",
          alignItems: "start",
          gap: 80,
          minHeight: 0,
        }}
      >
        {/* ── Left: copy + KPI ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            paddingTop: 10,
          }}
        >
          {/* Kicker with 58×3 gold bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              marginBottom: 30,
            }}
          >
            <span
              aria-hidden="true"
              style={{
                display: "block",
                width: 58,
                height: 3,
                background: GOLD,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                color: GOLD,
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: "0.17em",
                textTransform: "uppercase",
              }}
            >
              {COPY.kicker[lang]}
            </span>
          </div>

          {/* Headline */}
          <h2
            style={{
              margin: 0,
              maxWidth: 840,
              color: CB.ink,
              fontSize: lang === "he" ? 42 : 44,
              fontWeight: 500,
              lineHeight: 1.22,
              letterSpacing: "-0.03em",
            }}
          >
            {COPY.headline[lang]}
          </h2>

          {/* KPI block */}
          <div
            style={{
              marginTop: 46,
              borderTop: `1px solid ${CB.lineStrong}`,
              paddingTop: 30,
            }}
          >
            {/* Hero number */}
            <p
              dir="ltr"
              style={{
                margin: 0,
                color: GOLD,
                fontSize: 148,
                fontWeight: 600,
                lineHeight: 0.88,
                letterSpacing: "-0.065em",
              }}
            >
              {kpi.value}
            </p>

            {/* KPI label */}
            <p
              style={{
                maxWidth: 500,
                margin: "22px 0 0",
                color: CB.muted,
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.48,
                letterSpacing: "0.09em",
                textTransform: "uppercase",
              }}
            >
              {kpi.label[lang]}
            </p>

            {/* Quiet brand-name row — text only, no external logo URLs */}
            <p
              style={{
                margin: "26px 0 0",
                color: CB.faint,
                fontSize: 13,
                fontWeight: 500,
                letterSpacing: "0.06em",
              }}
            >
              {BRAND_NAMES}
            </p>
          </div>

          {/* Optional support line */}
          <p
            style={{
              maxWidth: 700,
              margin: "30px 0 0",
              color: CB.muted,
              fontSize: 20,
              fontWeight: 400,
              lineHeight: 1.5,
              letterSpacing: "-0.014em",
            }}
          >
            {COPY.support[lang]}
          </p>
        </div>

        {/* ── Right: warehouse photo ── */}
        <figure
          aria-hidden="true"
          style={{
            margin: 0,
            borderTop: `1px solid ${CB.lineStrong}`,
            paddingTop: 14,
          }}
        >
          <img
            src={WAREHOUSE_IMG}
            alt=""
            width={960}
            height={1080}
            decoding="async"
            style={{
              display: "block",
              width: "100%",
              height: 520,
              objectFit: "cover",
              objectPosition: "center 42%",
              filter: "grayscale(8%)",
            }}
          />
        </figure>
      </div>

      {/* ── Bottom: close line ── */}
      <p
        style={{
          margin: "28px 0 0",
          paddingTop: 22,
          borderTop: `1px solid ${CB.lineStrong}`,
          color: CB.ink,
          fontSize: lang === "he" ? 30 : 32,
          fontWeight: 400,
          lineHeight: 1.2,
          letterSpacing: "-0.025em",
        }}
      >
        {COPY.close[lang]}
      </p>
    </div>
  </WebSlide>
);
