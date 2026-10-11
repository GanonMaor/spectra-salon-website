import React from "react";
import type { LucideIcon } from "lucide-react";
import { CB, CB_INK } from "../../colorBarTokens";
import type { Localized, UpdateLang } from "../../finalCopy";
import { WebSlide, type WebSlideTone } from "../../WebDeckPrimitives";
import { Body, Display, Kicker, LayerMark, SkinProvider, type SlideSkin, slideBase, useSkin } from "../SlideCompositionKit";
import { RevealGroup, RevealItem } from "./ScrollChoreography";

export const tx = (value: Localized, lang: UpdateLang) => value[lang];

export const Spectra: React.FC<{ children?: React.ReactNode }> = ({ children = "Spectra" }) => (
  <span dir="ltr">{children}</span>
);

export const WireSlide: React.FC<{
  id: string;
  lang: UpdateLang;
  index: Localized;
  kicker: Localized;
  headline?: React.ReactNode;
  support?: React.ReactNode;
  label: Localized;
  tone?: WebSlideTone;
  /** Set to "ink" when `bleed` is a dark photo/glow field so Kicker/Display read light-on-dark. */
  skin?: SlideSkin;
  /** Full-bleed backdrop rendered behind the safe-area content (photo, glow field, etc). */
  bleed?: React.ReactNode;
  displaySize?: "headline" | "statement";
  /** Optional generated story frame. It always renders beside content, never behind text. */
  cinematicImage?: string;
  cinematicPosition?: string;
  /** Soft paper-edge fade into the photo. Use when the asset has a baked-in left wash. */
  cinematicFade?: boolean;
  children?: React.ReactNode;
}> = ({
  id,
  lang,
  index,
  kicker,
  headline,
  support,
  label,
  tone = "paper",
  skin = "paper",
  bleed,
  displaySize = "headline",
  cinematicImage,
  cinematicPosition = "center",
  cinematicFade = false,
  children,
}) => (
  <WebSlide id={id} label={tx(label, lang)} lang={lang} tone={tone} className={id} bleed={bleed}>
    <SkinProvider skin={skin}>
      <RevealGroup style={{ ...slideBase(lang), justifyContent: "space-between", gap: 22 }}>
        <RevealGroup as="header">
          <RevealItem>
            <LayerMark>{tx(index, lang)}</LayerMark>
          </RevealItem>
          <RevealItem style={{ marginTop: 18 }}>
            <Kicker>{tx(kicker, lang)}</Kicker>
          </RevealItem>
          {headline ? (
            <RevealItem style={{ marginTop: 16 }}>
              <Display lang={lang} size={displaySize} style={{ maxWidth: 1320 }}>
                {headline}
              </Display>
            </RevealItem>
          ) : null}
          {support ? (
            <RevealItem style={{ marginTop: 16 }}>
              <Body size="lead" style={{ maxWidth: 980 }}>
                {support}
              </Body>
            </RevealItem>
          ) : null}
        </RevealGroup>
        <RevealItem style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          {cinematicImage ? (
            <div
              className="deck-cinematic-layout"
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) 440px",
                gap: 36,
                flex: 1,
                minHeight: 0,
              }}
            >
              <div style={{ minWidth: 0, minHeight: 0, display: "flex", flexDirection: "column" }}>{children}</div>
              <figure
                className="deck-cinematic-panel"
                style={{
                  position: "relative",
                  margin: 0,
                  minWidth: 0,
                  minHeight: 0,
                  overflow: "hidden",
                  border: cinematicFade ? undefined : `1px solid ${skin === "ink" ? CB_INK.lineStrong : CB.lineStrong}`,
                }}
              >
                <img
                  src={cinematicImage}
                  alt=""
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: cinematicPosition,
                  }}
                />
                {cinematicFade && skin !== "ink" ? (
                  <span
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      pointerEvents: "none",
                      background:
                        lang === "he"
                          ? `linear-gradient(to left, ${tone === "warm" ? "#F5F2EC" : CB.bg} 0%, rgba(251,250,247,0.72) 8%, transparent 22%)`
                          : `linear-gradient(to right, ${tone === "warm" ? "#F5F2EC" : CB.bg} 0%, rgba(251,250,247,0.72) 8%, transparent 22%)`,
                    }}
                  />
                ) : null}
              </figure>
            </div>
          ) : (
            children
          )}
        </RevealItem>
      </RevealGroup>
    </SkinProvider>
  </WebSlide>
);

export const BulletList: React.FC<{
  rows: readonly string[];
  columns?: number;
  compact?: boolean;
}> = ({ rows, columns = 1, compact = false }) => (
  <ul
    style={{
      margin: 0,
      padding: 0,
      listStyle: "none",
      flex: 1,
      minHeight: 0,
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      columnGap: columns > 1 ? 36 : 0,
      alignContent: "start",
    }}
  >
    {rows.map((row, index) => (
      <li
        key={row}
        style={{
          paddingBlock: compact ? 10 : 12,
          borderTop: index < columns ? `1px solid ${CB.lineStrong}` : undefined,
          borderBottom: `1px solid ${CB.lineStrong}`,
          color: CB.ink,
          fontSize: compact ? 22 : 24,
          fontWeight: 500,
          lineHeight: 1.3,
          letterSpacing: "-0.022em",
        }}
      >
        {/[A-Za-z]/.test(row) && !/[\u0590-\u05FF]/.test(row) ? <span dir="ltr">{row}</span> : row}
      </li>
    ))}
  </ul>
);

export const Ledger: React.FC<{
  children: React.ReactNode;
  columns?: number;
}> = ({ children, columns = 2 }) => (
  <div
    className="deck-ledger"
    style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
      flex: 1,
      minHeight: 0,
      alignContent: "start",
    }}
  >
    {children}
  </div>
);

export const LedgerCol: React.FC<{
  label: string;
  rows: readonly string[];
  first?: boolean;
  accent?: boolean;
}> = ({ label, rows, first, accent }) => (
  <div
    style={{
      minWidth: 0,
      paddingInlineStart: first ? 0 : 40,
      borderInlineStart: first ? undefined : `1px solid ${CB.lineStrong}`,
    }}
  >
    <p
      style={{
        margin: 0,
        color: accent ? CB.copperDeep : CB.muted,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
      }}
    >
      {label}
    </p>
    <ul style={{ margin: "14px 0 0", padding: 0, listStyle: "none" }}>
      {rows.map((row, index) => (
        <li
          key={row}
          style={{
            paddingBlock: 14,
            borderTop: index === 0 ? `1px solid ${CB.lineStrong}` : undefined,
            borderBottom: `1px solid ${CB.lineStrong}`,
            color: CB.ink,
            fontSize: 24,
            fontWeight: 500,
            lineHeight: 1.25,
            letterSpacing: "-0.024em",
          }}
        >
          {/[A-Za-z]/.test(row) && !/[\u0590-\u05FF]/.test(row) ? <span dir="ltr">{row}</span> : row}
        </li>
      ))}
    </ul>
  </div>
);

export const MetricStrip: React.FC<{
  items: readonly { value: string; label: string; icon?: LucideIcon }[];
  compact?: boolean;
  kicker?: string;
}> = ({ items, compact = false, kicker }) => (
  <div>
    {kicker ? (
      <p
        style={{
          margin: "0 0 10px",
          color: CB.copperDeep,
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        {kicker}
      </p>
    ) : null}
    <dl
      className="deck-quad"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))`,
        margin: 0,
        borderTop: `1px solid ${CB.lineStrong}`,
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.label}
          style={{
            minWidth: 0,
            padding: compact ? "16px 18px 2px" : "22px 20px 4px",
            borderInlineStart: index === 0 ? undefined : `1px solid ${CB.lineStrong}`,
          }}
        >
          {item.icon ? (
            <span
              aria-hidden="true"
              style={{
                display: "grid",
                placeItems: "center",
                width: compact ? 32 : 40,
                height: compact ? 32 : 40,
                marginBottom: 10,
                borderRadius: "50%",
                border: `1px solid ${CB.lineStrong}`,
                background: "rgba(163,125,56,0.08)",
                color: CB.copperDeep,
              }}
            >
              <item.icon size={compact ? 16 : 18} strokeWidth={1.8} />
            </span>
          ) : null}
          <dd
            className="deck-metric"
            style={{
              margin: 0,
              color: compact ? CB.ink : CB.copper,
              fontSize: compact ? 30 : 52,
              fontWeight: 600,
              lineHeight: 0.92,
              letterSpacing: "-0.05em",
            }}
          >
            <span dir="ltr">{item.value}</span>
          </dd>
          <dt
            style={{
              marginTop: compact ? 8 : 12,
              color: CB.muted,
              fontSize: compact ? 12 : 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </dt>
        </div>
      ))}
    </dl>
  </div>
);

export const Chain: React.FC<{
  steps: readonly string[];
  opaqueFrom?: number;
}> = ({ steps, opaqueFrom }) => (
  <ol
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 12,
      margin: 0,
      padding: 0,
      listStyle: "none",
    }}
  >
    {steps.map((step, index) => {
      const dim = opaqueFrom !== undefined && index >= opaqueFrom;
      return (
        <React.Fragment key={step}>
          {index > 0 ? (
            <span aria-hidden="true" style={{ color: CB.faint, fontSize: 22 }}>
              →
            </span>
          ) : null}
          <li
            style={{
              padding: "14px 22px",
              border: `1px solid ${dim ? "rgba(92,72,42,0.08)" : CB.lineStrong}`,
              color: dim ? CB.faint : CB.ink,
              background: dim ? CB.well : "transparent",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "-0.02em",
            }}
          >
            {step}
          </li>
        </React.Fragment>
      );
    })}
  </ol>
);

export const IdeaMark: React.FC<{
  icon: LucideIcon;
  label: string;
  hint?: string;
  dark?: boolean;
  accent?: boolean;
  stacked?: boolean;
}> = ({ icon: Icon, label, hint, dark = false, accent = false, stacked = false }) => {
  const gold = dark ? "#F0D089" : CB.copperDeep;
  const disc = stacked ? 58 : 52;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: stacked ? "column" : "row",
        alignItems: stacked ? "flex-start" : "center",
        gap: stacked ? 14 : 16,
        minWidth: 0,
        height: stacked ? "100%" : undefined,
        padding: stacked ? "18px 18px 16px" : undefined,
        overflow: "hidden",
        border: stacked ? `1px solid ${dark ? "rgba(198,162,99,0.28)" : CB.lineStrong}` : undefined,
        background: stacked
          ? dark
            ? "linear-gradient(180deg, rgba(255,255,255,0.045), rgba(255,255,255,0.015))"
            : accent
              ? CB.copperSoft
              : "rgba(251,250,247,0.72)"
          : undefined,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: disc,
          height: disc,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          border: `1px solid ${accent || dark ? "rgba(198,162,99,0.72)" : CB.lineStrong}`,
          background: dark
            ? "radial-gradient(circle at 32% 28%, rgba(255,232,176,0.34), rgba(198,162,99,0.16) 46%, rgba(12,10,8,0.82) 100%)"
            : accent
              ? CB.copperSoft
              : "rgba(163,125,56,0.08)",
          color: gold,
          boxShadow: dark || accent ? "0 0 0 5px rgba(198,162,99,0.10), 0 0 26px rgba(198,162,99,0.22)" : undefined,
        }}
      >
        <Icon size={stacked ? 26 : 24} strokeWidth={1.75} />
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            display: "block",
            color: dark ? CB_INK.ink : CB.ink,
            fontSize: stacked ? 18 : 20,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            lineHeight: 1.15,
          }}
        >
          {label}
        </span>
        {hint ? (
          <span
            style={{
              display: "block",
              marginTop: 5,
              color: dark ? "rgba(234,227,216,0.58)" : CB.muted,
              fontSize: 13,
              fontWeight: 500,
              lineHeight: 1.3,
            }}
          >
            {hint}
          </span>
        ) : null}
      </span>
    </div>
  );
};

export const Foot: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const s = useSkin();
  return (
    <p
      style={{
        margin: 0,
        paddingTop: 18,
        borderTop: `1px solid ${s.lineStrong}`,
        color: s.ink,
        fontSize: 28,
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: "-0.03em",
      }}
    >
      {children}
    </p>
  );
};
