import React from "react";
import {
  CircleDollarSign,
  CircleUser,
  FlaskConical,
  History,
  Package,
  Paintbrush,
  Scale,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { SpectraOrb } from "../../../components/SpectraOrb";
import { CB_INK, colorBarSans, inkGold } from "../colorBarTokens";
import type { Localized, UpdateLang } from "../finalCopy";
import { useDeckLayout, WebSlide } from "../WebDeckPrimitives";
import { InkAtmosphere } from "./SlideCompositionKit";

const SALON_IMAGE = "/investor-vision/salon-ai-live-demo/backup-command-center-bg.png";

const COPY = {
  kicker: {
    en: "What the usage created",
    he: "מה שהשימוש יצר",
  },
  headline: {
    en: "Every service became a structured operational record.",
    he: "כל שירות הפך לרשומה תפעולית מובנית.",
  },
  supportLead: {
    en: "The value is not the number of rows. It is the ",
    he: "הערך אינו מספר השורות. הוא ",
  },
  supportPunch: {
    en: "relationships between them — over time.",
    he: "היחסים ביניהן — לאורך זמן.",
  },
  origin: { en: "One color service", he: "שירות צבע אחד" },
  destination: { en: "Longitudinal operational history", he: "היסטוריה תפעולית לאורך זמן" },
  historyNote: { en: "Repeated over time", he: "חוזר לאורך זמן" },
  hub: { en: "One record", he: "רשומה אחת" },
  index: { en: "08 — Data depth", he: "08 — עומק דאטה" },
} as const;

const NODES: readonly { en: string; he: string; icon: LucideIcon }[] = [
  { en: "Client", he: "לקוחה", icon: CircleUser },
  { en: "Professional", he: "מקצועית", icon: Scissors },
  { en: "Service", he: "שירות", icon: Paintbrush },
  { en: "Formula", he: "פורמולה", icon: FlaskConical },
  { en: "Grams", he: "גרמים", icon: Scale },
  { en: "Cost", he: "עלות", icon: CircleDollarSign },
  { en: "Inventory", he: "מלאי", icon: Package },
  { en: "History", he: "היסטוריה", icon: History },
];

const SCALE = [
  { value: "617K+", label: { en: "services", he: "שירותים" } },
  { value: "34M+", label: { en: "grams", he: "גרמים" } },
  { value: "12+", label: { en: "countries", he: "מדינות" } },
  { value: "200+", label: { en: "brands", he: "מותגים" } },
] as const;

const SPOKE_Y = [16, 38.5, 61.5, 84] as const;

const text = (value: Localized, lang: UpdateLang) => value[lang];

const HubNode: React.FC<{
  node: (typeof NODES)[number];
  lang: UpdateLang;
  side: "start" | "end";
  top: string;
  accent?: boolean;
}> = ({ node, lang, side, top, accent = false }) => {
  const Icon = node.icon;
  return (
    <div
      style={{
        position: "absolute",
        top,
        [side === "start" ? "insetInlineStart" : "insetInlineEnd"]: 0,
        width: 210,
        transform: "translateY(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: accent ? 10 : 13,
      }}
    >
      {accent ? (
        <span
          style={{
            color: CB_INK.gold,
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: lang === "he" ? "0.08em" : "0.14em",
            textTransform: "uppercase",
            textAlign: "center",
            lineHeight: 1.2,
          }}
        >
          {text(COPY.historyNote, lang)}
        </span>
      ) : null}
      <span
        aria-hidden="true"
        style={{
          display: "grid",
          placeItems: "center",
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.03)",
          boxShadow: accent
            ? `0 0 0 1px ${inkGold(0.58)}, 0 0 0 5px ${inkGold(0.09)}, 0 0 22px ${inkGold(0.16)}`
            : `0 0 0 1px ${inkGold(0.32)}`,
          color: accent ? CB_INK.gold : "rgba(234,227,216,0.78)",
        }}
      >
        <Icon size={26} strokeWidth={1.55} />
      </span>
      <span
        style={{
          color: CB_INK.ink,
          fontSize: lang === "he" ? 14 : 15,
          fontWeight: accent ? 700 : 600,
          letterSpacing: lang === "he" ? "0.04em" : "0.11em",
          textTransform: "uppercase",
          textAlign: "center",
          lineHeight: 1.2,
        }}
      >
        {text(node, lang)}
      </span>
    </div>
  );
};

const FluidHub: React.FC<{ lang: UpdateLang; hebrew: boolean; reducedMotion: boolean }> = ({
  lang,
  hebrew,
  reducedMotion,
}) => (
  <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
    <p
      style={{
        margin: 0,
        color: CB_INK.gold,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {text(COPY.origin, lang)}
    </p>
    <div className="deck-quad" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {NODES.slice(0, 4).map((node) => {
        const Icon = node.icon;
        return (
          <div key={node.en} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                boxShadow: "0 0 0 1px rgba(215,170,88,0.72)",
                color: "rgba(245,238,225,0.9)",
              }}
            >
              <Icon size={18} strokeWidth={1.55} />
            </span>
            <span
              style={{
                color: CB_INK.ink,
                fontSize: hebrew ? 13 : 14,
                fontWeight: 600,
                letterSpacing: hebrew ? "0.04em" : "0.1em",
                textTransform: "uppercase",
              }}
            >
              {text(node, lang)}
            </span>
          </div>
        );
      })}
    </div>
    <div style={{ display: "grid", placeItems: "center", padding: "8px 0 4px" }}>
      <SpectraOrb size={120} reducedMotion={reducedMotion} />
      <p
        style={{
          margin: "12px 0 0",
          color: CB_INK.ink,
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {text(COPY.hub, lang)}
      </p>
    </div>
    <p
      style={{
        margin: 0,
        color: CB_INK.gold,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {text(COPY.destination, lang)}
    </p>
    <div className="deck-quad" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {NODES.slice(4).map((node) => {
        const Icon = node.icon;
        const accent = node.en === "History";
        return (
          <div key={node.en} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: 40,
                height: 40,
                borderRadius: "50%",
                boxShadow: accent
                  ? "0 0 0 1px rgba(215,170,88,0.95), 0 0 0 4px rgba(215,170,88,0.16)"
                  : "0 0 0 1px rgba(215,170,88,0.72)",
                color: accent ? CB_INK.gold : "rgba(245,238,225,0.9)",
              }}
            >
              <Icon size={18} strokeWidth={1.55} />
            </span>
            <span
              style={{
                color: CB_INK.ink,
                fontSize: hebrew ? 13 : 14,
                fontWeight: accent ? 700 : 600,
                letterSpacing: hebrew ? "0.04em" : "0.1em",
                textTransform: "uppercase",
              }}
            >
              {text(node, lang)}
            </span>
          </div>
        );
      })}
    </div>
  </div>
);

const RecordHub: React.FC<{
  lang: UpdateLang;
  hebrew: boolean;
  reducedMotion: boolean;
}> = ({ lang, hebrew, reducedMotion }) => {
  const { layout } = useDeckLayout();
  if (layout === "fluid") {
    return <FluidHub lang={lang} hebrew={hebrew} reducedMotion={reducedMotion} />;
  }
  const startX = hebrew ? 86 : 14;
  const endX = hebrew ? 14 : 86;

  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0, marginTop: 30 }}>
      <p
        style={{
          position: "absolute",
          top: 0,
          insetInlineStart: 0,
          margin: 0,
          color: CB_INK.gold,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          opacity: 0.72,
        }}
      >
        {text(COPY.origin, lang)}
      </p>
      <p
        style={{
          position: "absolute",
          top: 0,
          insetInlineEnd: 0,
          margin: 0,
          color: CB_INK.gold,
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          textAlign: "end",
        }}
      >
        {text(COPY.destination, lang)}
      </p>

      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {SPOKE_Y.map((y) => (
          <React.Fragment key={y}>
            <path
              d={`M ${startX} ${y} C ${hebrew ? 68 : 32} ${y}, ${hebrew ? 58 : 42} 50, 50 50`}
              fill="none"
              stroke={inkGold(0.26)}
              strokeWidth="0.28"
            />
            <path
              d={`M ${endX} ${y} C ${hebrew ? 32 : 68} ${y}, ${hebrew ? 42 : 58} 50, 50 50`}
              fill="none"
              stroke={inkGold(0.26)}
              strokeWidth="0.28"
            />
          </React.Fragment>
        ))}
      </svg>

      {NODES.slice(0, 4).map((node, index) => (
        <HubNode
          key={node.en}
          node={node}
          lang={lang}
          side="start"
          top={`${SPOKE_Y[index]}%`}
        />
      ))}
      {NODES.slice(4).map((node, index) => (
        <HubNode
          key={node.en}
          node={node}
          lang={lang}
          side="end"
          top={`${SPOKE_Y[index]}%`}
          accent={node.en === "History"}
        />
      ))}

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: 280,
          display: "grid",
          placeItems: "center",
          textAlign: "center",
        }}
      >
        <div style={{ position: "relative", width: 236, height: 236, display: "grid", placeItems: "center" }}>
          {[0, 28].map((inset) => (
            <span
              key={inset}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset,
                borderRadius: "50%",
                border: `1px solid ${inkGold(0.13)}`,
              }}
            />
          ))}
          <SpectraOrb size={176} reducedMotion={reducedMotion} />
        </div>
        <p
          style={{
            margin: "16px 0 0",
            color: CB_INK.ink,
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: lang === "he" ? "-0.01em" : "-0.02em",
          }}
        >
          {text(COPY.hub, lang)}
        </p>
      </div>
    </div>
  );
};

export const DataMoatWebSlide: React.FC<{
  lang: UpdateLang;
  reducedMotion?: boolean;
}> = ({ lang, reducedMotion = false }) => {
  const hebrew = lang === "he";

  return (
    <WebSlide
      id="web-deck-data-moat"
      label={text(COPY.headline, lang)}
      lang={lang}
      tone="ink"
      className="web-deck-data-moat"
      bleed={<InkAtmosphere image={SALON_IMAGE} lang={lang} />}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          fontFamily: colorBarSans(lang),
          color: CB_INK.ink,
        }}
      >
        <div>
          <span
            aria-hidden="true"
            style={{ display: "block", width: 58, height: 3, background: CB_INK.gold }}
          />
          <p
            style={{
              margin: "18px 0 0",
              color: CB_INK.gold,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
            }}
          >
            {text(COPY.kicker, lang)}
          </p>
          <h2
            style={{
              margin: "22px 0 0",
              maxWidth: 1280,
              color: CB_INK.ink,
              fontSize: hebrew ? 42 : 46,
              fontWeight: 600,
              lineHeight: 1.04,
              letterSpacing: hebrew ? "-0.032em" : "-0.048em",
            }}
          >
            {text(COPY.headline, lang)}
          </h2>
          <p
            style={{
              margin: "20px 0 0",
              maxWidth: 860,
              color: CB_INK.muted,
              fontSize: hebrew ? 21 : 22,
              fontWeight: 400,
              lineHeight: 1.5,
              letterSpacing: hebrew ? "-0.01em" : "-0.018em",
            }}
          >
            {text(COPY.supportLead, lang)}
            <span style={{ color: CB_INK.ink, fontWeight: 500 }}>
              {text(COPY.supportPunch, lang)}
            </span>
          </p>
        </div>

        <RecordHub lang={lang} hebrew={hebrew} reducedMotion={reducedMotion} />

        <footer
          className="deck-footer-wrap"
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 32,
            marginTop: 14,
            paddingTop: 24,
            borderTop: `1px solid ${CB_INK.line}`,
          }}
        >
          <p
            style={{
              margin: 0,
              color: CB_INK.faint,
              fontSize: 15,
              fontWeight: 500,
              letterSpacing: "0.04em",
              lineHeight: 1.4,
            }}
          >
            {SCALE.map((item, index) => (
              <React.Fragment key={item.value}>
                {index > 0 ? (
                  <span aria-hidden="true" style={{ padding: "0 18px", color: inkGold(0.32) }}>
                    ·
                  </span>
                ) : null}
                <span dir="ltr" style={{ color: "rgba(234,227,216,0.72)" }}>
                  {item.value}
                </span>
                {` ${text(item.label, lang)}`}
              </React.Fragment>
            ))}
          </p>
          <p
            dir="ltr"
            style={{
              margin: 0,
              flexShrink: 0,
              color: CB_INK.faint,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {text(COPY.index, lang)}
          </p>
        </footer>
      </div>
    </WebSlide>
  );
};
