import React from "react";
import { CANONICAL_BY_ID } from "../canonicalNarrative";
import { CB, colorBarSans } from "../colorBarTokens";
import { Sheet } from "../ColorBarPatterns";
import {
  FINAL_ADOPTION,
  FINAL_BOOKING,
  FINAL_CLIENT_APP,
  FINAL_DECISION,
  FINAL_GTM,
  FINAL_MOBILE,
  FINAL_OWNER_APP,
  FINAL_PLATFORM,
  FINAL_PROBLEM,
  FINAL_SAAS,
  FINAL_SALON_OS,
  type Localized,
  type UpdateLang,
} from "../finalCopy";
import { SALON_OS_PROOF } from "../salonOsProofSnapshot";
import { WebSlide } from "../WebDeckPrimitives";

export type CommercialPlatformWebSlideProps = {
  lang: UpdateLang;
};

const proof = CANONICAL_BY_ID.proof;
const gtm = CANONICAL_BY_ID.gtm;
const platform = CANONICAL_BY_ID.platform;

const text = (copy: Localized, lang: UpdateLang) => copy[lang];
const osCopy = {
  environment: {
    en: "Real Salon OS product, current pilot and development environment. All figures in USD.",
    he: "מוצר Salon OS אמיתי, סביבת פיילוט ופיתוח נוכחית. כל הסכומים בדולרים.",
  },
  scope: {
    en: "One pilot salon, 6 months of its own operating economics, not Spectra revenue.",
    he: "סלון פיילוט אחד, 6 חודשים של הכלכלה התפעולית שלו, ולא הכנסות של Spectra.",
  },
  labels: [
    { en: "Booked Service Value", he: "שווי שירותים שהוזמנו" },
    { en: "Period material cost", he: "עלות חומרים לתקופה" },
    { en: "Operating expenses", he: "הוצאות תפעול" },
    { en: "Net Profit", he: "רווח נקי" },
  ],
} as const;
const font = (lang: UpdateLang) => colorBarSans(lang);
const direction = (lang: UpdateLang) => (lang === "he" ? "rtl" : "ltr");
const rule = `1px solid ${CB.lineStrong}`;
const copperRule = `3px solid ${CB.copper}`;

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);

const Canvas: React.FC<{
  id: string;
  label: Localized;
  lang: UpdateLang;
  tone?: "paper" | "warm";
  children: React.ReactNode;
}> = ({ id, label, lang, tone = "paper", children }) => (
  <WebSlide id={id} label={text(label, lang)} lang={lang} tone={tone}>
    <div
      style={{
        width: "100%",
        height: "calc(100% - 2px)",
        display: "flex",
        flexDirection: "column",
        fontFamily: font(lang),
      }}
    >
      {children}
    </div>
  </WebSlide>
);

const Kicker: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p
    style={{
      margin: 0,
      color: CB.copperDeep,
      fontSize: 16,
      fontWeight: 800,
      lineHeight: 1.2,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
    }}
  >
    {children}
  </p>
);

const Title: React.FC<{
  lang: UpdateLang;
  children: React.ReactNode;
  size?: number;
  maxWidth?: number | string;
}> = ({ lang, children, size = 70, maxWidth = 1120 }) => (
  <h2
    style={{
      margin: 0,
      maxWidth,
      color: CB.ink,
      fontFamily: font(lang),
      fontSize: size,
      fontWeight: 650,
      lineHeight: 0.98,
      letterSpacing: "-0.052em",
      textWrap: "balance",
    }}
  >
    {children}
  </h2>
);

const Body: React.FC<{ children: React.ReactNode; maxWidth?: number }> = ({
  children,
  maxWidth = 650,
}) => (
  <p
    style={{
      margin: 0,
      maxWidth,
      color: CB.muted,
      fontSize: 25,
      lineHeight: 1.5,
    }}
  >
    {children}
  </p>
);

const Caption: React.FC<{ children: React.ReactNode; maxWidth?: number }> = ({
  children,
  maxWidth,
}) => (
  <p
    style={{
      margin: 0,
      maxWidth,
      color: CB.muted,
      fontSize: 16,
      lineHeight: 1.45,
    }}
  >
    {children}
  </p>
);

const Statement: React.FC<{ lang: UpdateLang; children: React.ReactNode }> = ({
  lang,
  children,
}) => (
  <p
    style={{
      margin: 0,
      borderInlineStart: copperRule,
      paddingInlineStart: 28,
      color: CB.ink,
      fontFamily: font(lang),
      fontSize: 38,
      fontWeight: 650,
      lineHeight: 1.18,
      letterSpacing: "-0.035em",
      textWrap: "balance",
    }}
  >
    {children}
  </p>
);

export const ProofMetricsWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="proof-metrics-web" label={proof.headline} lang={lang}>
    <div style={{ display: "grid", gridTemplateColumns: "1.08fr 0.92fr", gap: 96, alignItems: "end" }}>
      <div>
        <Kicker>{proof.chapter}</Kicker>
        <div style={{ marginTop: 28 }}>
          <Title lang={lang}>{text(proof.headline, lang)}</Title>
        </div>
      </div>
      <Body>{text(proof.support, lang)}</Body>
    </div>

    <dl
      style={{
        margin: "66px 0 0",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        borderTop: rule,
        borderBottom: rule,
      }}
    >
      {proof.metrics.map((metric, index) => (
        <div
          key={metric.value}
          style={{
            minHeight: 174,
            padding: "28px 34px 24px",
            borderInlineStart: index % 3 === 0 ? "none" : rule,
            borderTop: index < 3 ? "none" : rule,
          }}
        >
          <dd
            dir="ltr"
            style={{
              margin: 0,
              color: CB.ink,
              fontSize: 63,
              fontWeight: 650,
              lineHeight: 1,
              letterSpacing: "-0.055em",
              textAlign: lang === "he" ? "right" : "left",
            }}
          >
            {metric.value}
          </dd>
          <dt style={{ marginTop: 15, color: CB.copperDeep, fontSize: 15, fontWeight: 800, letterSpacing: "0.1em" }}>
            {text(metric.label, lang)}
          </dt>
          {"detail" in metric && metric.detail && (
            <dd style={{ margin: "8px 0 0", color: CB.muted, fontSize: 15, lineHeight: 1.35 }}>
              {text(metric.detail, lang)}
            </dd>
          )}
        </div>
      ))}
    </dl>

    <div style={{ marginTop: "auto", maxWidth: 1050 }}>
      <Statement lang={lang}>{text(proof.statement, lang)}</Statement>
    </div>
  </Canvas>
);

export const ProofCustomerWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="proof-customer-web" label={FINAL_ADOPTION.title} lang={lang} tone="warm">
    <div style={{ display: "grid", gridTemplateColumns: "0.38fr 0.62fr", gap: 86, height: "100%", alignItems: "center" }}>
      <div>
        <Kicker>{proof.chapter}</Kicker>
        <div style={{ marginTop: 28 }}>
          <Title lang={lang} size={76}>{text(FINAL_ADOPTION.title, lang)}</Title>
        </div>
        <div style={{ marginTop: 32 }}>
          <Body maxWidth={500}>{text(FINAL_ADOPTION.body, lang)}</Body>
        </div>
        <p
          style={{
            margin: "46px 0 0",
            padding: "26px 0",
            borderTop: rule,
            borderBottom: rule,
            color: CB.ink,
            fontSize: 34,
            fontWeight: 650,
            lineHeight: 1.2,
            letterSpacing: "-0.03em",
          }}
        >
          {text(FINAL_ADOPTION.strip, lang)}
        </p>
        <div style={{ marginTop: 22 }}>
          <Caption>{text(FINAL_ADOPTION.caption, lang)}</Caption>
        </div>
      </div>

      <figure style={{ margin: 0 }}>
        <Sheet inset>
          <div style={{ display: "grid", gridTemplateColumns: "1.3fr 0.7fr", gap: 12, height: 690 }}>
            <img
              src="/investor/media/color-bar.jpg"
              alt={text(FINAL_ADOPTION.caption, lang)}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 12 }}>
              <img
                src="/investor/media/reception.jpg"
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
              <img
                src="/investor/media/shelves.jpg"
                alt=""
                aria-hidden="true"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </Sheet>
      </figure>
    </div>
  </Canvas>
);

export const GtmRouteWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="gtm-route-web" label={gtm.headline} lang={lang} tone="warm">
    <div style={{ display: "grid", gridTemplateColumns: "1.03fr 0.97fr", gap: 90, alignItems: "end" }}>
      <div>
        <Kicker>{gtm.chapter}</Kicker>
        <div style={{ marginTop: 26 }}>
          <Title lang={lang} size={67}>{text(gtm.headline, lang)}</Title>
        </div>
      </div>
      <Body>{text(gtm.support, lang)}</Body>
    </div>

    <ol
      style={{
        margin: "78px 0 0",
        padding: 0,
        listStyle: "none",
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        borderTop: rule,
        borderBottom: rule,
      }}
    >
      {gtm.facts.map((stage, index) => (
        <li
          key={stage.term.en}
          style={{
            position: "relative",
            minHeight: 280,
            padding: "30px 28px",
            borderInlineStart: index === 0 ? "none" : rule,
          }}
        >
          <span dir="ltr" style={{ color: CB.copperDeep, fontSize: 15, fontWeight: 800, letterSpacing: "0.15em" }}>
            {stage.serial}
          </span>
          <h3 style={{ margin: "56px 0 0", color: CB.ink, fontSize: 30, fontWeight: 650, lineHeight: 1.1, letterSpacing: "-0.035em" }}>
            {text(stage.term, lang)}
          </h3>
          <p style={{ margin: "15px 0 0", color: CB.muted, fontSize: 18, lineHeight: 1.45 }}>
            {stage.detail && text(stage.detail, lang)}
          </p>
          {index < gtm.facts.length - 1 && (
            <span
              aria-hidden="true"
              style={{ position: "absolute", insetInlineEnd: -11, top: 39, zIndex: 1, padding: "0 4px", background: CB.surface, color: CB.copper, fontSize: 22 }}
            >
              {lang === "he" ? "←" : "→"}
            </span>
          )}
        </li>
      ))}
    </ol>

    <div style={{ marginTop: "auto", maxWidth: 1200 }}>
      <Statement lang={lang}>{text(gtm.statement, lang)}</Statement>
    </div>
  </Canvas>
);

export const GtmExperimentWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="gtm-experiment-web" label={FINAL_GTM.title} lang={lang}>
    <div style={{ display: "grid", gridTemplateColumns: "0.42fr 0.58fr", gap: 88, height: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <Kicker>{text(FINAL_GTM.kicker, lang)}</Kicker>
        <div style={{ marginTop: 28 }}>
          <Title lang={lang} size={64}>{text(FINAL_GTM.title, lang)}</Title>
        </div>
        <div style={{ marginTop: 54, paddingTop: 30, borderTop: rule, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36 }}>
          <div>
            <Kicker>{text(FINAL_GTM.spendLabel, lang)}</Kicker>
            <p dir="ltr" style={{ margin: "18px 0 0", color: CB.ink, fontSize: 72, fontWeight: 650, letterSpacing: "-0.055em", textAlign: lang === "he" ? "right" : "left" }}>
              {FINAL_SAAS.spend}
            </p>
          </div>
          <div style={{ borderInlineStart: rule, paddingInlineStart: 34 }}>
            <Kicker>{text(FINAL_GTM.outcomeLabel, lang)}</Kicker>
            <p dir="ltr" style={{ margin: "18px 0 0", color: CB.copperDeep, fontSize: 72, fontWeight: 650, letterSpacing: "-0.055em", textAlign: lang === "he" ? "right" : "left" }}>
              {FINAL_SAAS.customers}
            </p>
          </div>
        </div>
        <div style={{ marginTop: "auto" }}>
          <Caption>{text(FINAL_GTM.caption, lang)}</Caption>
        </div>
      </div>

      <div style={{ borderInlineStart: rule, paddingInlineStart: 64, display: "flex", flexDirection: "column" }}>
        <dl style={{ margin: 0, borderTop: rule }}>
          {FINAL_SAAS.funnel.map((item, index) => (
            <div key={item.value} style={{ display: "grid", gridTemplateColumns: "180px 1fr", alignItems: "baseline", gap: 38, padding: "22px 0", borderBottom: rule }}>
              <dd dir="ltr" style={{ margin: 0, color: index === FINAL_SAAS.funnel.length - 1 ? CB.copperDeep : CB.ink, fontSize: 50, fontWeight: 650, letterSpacing: "-0.045em" }}>
                {item.value}
              </dd>
              <dt style={{ color: CB.muted, fontSize: 19, fontWeight: 650 }}>{text(item.label, lang)}</dt>
            </div>
          ))}
        </dl>

        <div style={{ marginTop: 42 }}>
          <Kicker>{text(FINAL_SAAS.unitLabel, lang)}</Kicker>
          <dl style={{ margin: "18px 0 0", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: rule, borderBottom: rule }}>
            {FINAL_SAAS.unit.map((item, index) => (
              <div key={item.value} style={{ padding: "24px 20px", borderInlineStart: index === 0 ? "none" : rule }}>
                <dd dir="ltr" style={{ margin: 0, color: CB.ink, fontSize: 38, fontWeight: 650, letterSpacing: "-0.04em" }}>{item.value}</dd>
                <dt style={{ marginTop: 10, color: CB.muted, fontSize: 14, lineHeight: 1.35 }}>{text(item.label, lang)}</dt>
              </div>
            ))}
          </dl>
          <div style={{ marginTop: 16 }}>
            <Caption>{text(FINAL_SAAS.unitCaveat, lang)}</Caption>
          </div>
        </div>
      </div>
    </div>
  </Canvas>
);

export const PlatformArchitectureWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="platform-architecture-web" label={platform.headline} lang={lang}>
    <div style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 90, alignItems: "end" }}>
      <div>
        <Kicker>{platform.chapter}</Kicker>
        <div style={{ marginTop: 28 }}>
          <Title lang={lang} size={68}>{text(platform.headline, lang)}</Title>
        </div>
      </div>
      <Body>{text(platform.support, lang)}</Body>
    </div>

    <div style={{ marginTop: 70, display: "grid", gridTemplateColumns: "0.62fr 0.38fr", gap: 78 }}>
      <ol style={{ margin: 0, padding: 0, listStyle: "none", borderTop: rule, borderBottom: rule }}>
        {platform.facts.map((layer, index) => (
          <li key={layer.term.en} style={{ display: "grid", gridTemplateColumns: "80px 0.55fr 0.45fr", gap: 28, alignItems: "baseline", padding: "28px 0", borderTop: index === 0 ? "none" : rule }}>
            <span dir="ltr" style={{ color: CB.copperDeep, fontSize: 14, fontWeight: 800, letterSpacing: "0.14em" }}>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 dir="ltr" style={{ margin: 0, color: CB.ink, fontSize: 35, fontWeight: 650, letterSpacing: "-0.04em", textAlign: lang === "he" ? "right" : "left" }}>
              {text(layer.term, lang)}
            </h3>
            <p style={{ margin: 0, color: index === 2 ? CB.copperDeep : CB.muted, fontSize: 19, lineHeight: 1.4 }}>
              {layer.detail && text(layer.detail, lang)}
            </p>
          </li>
        ))}
      </ol>

      <aside style={{ borderInlineStart: rule, paddingInlineStart: 48 }}>
        <Kicker>{text(platform.metricsLabel, lang)}</Kicker>
        <dl style={{ margin: "24px 0 0", borderTop: rule }}>
          {platform.metrics.map((metric) => (
            <div key={metric.value} style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: 24, alignItems: "baseline", padding: "22px 0", borderBottom: rule }}>
              <dd dir="ltr" style={{ margin: 0, color: CB.ink, fontSize: 42, fontWeight: 650, letterSpacing: "-0.045em" }}>{metric.value}</dd>
              <dt style={{ color: CB.muted, fontSize: 16, lineHeight: 1.4 }}>{text(metric.label, lang)}</dt>
            </div>
          ))}
        </dl>
        <div style={{ marginTop: 20 }}>
          <Caption>{text(platform.caveat, lang)}</Caption>
        </div>
        <div dir="ltr" style={{ marginTop: 10, textAlign: lang === "he" ? "right" : "left" }}>
          <Caption>{platform.sources}</Caption>
        </div>
      </aside>
    </div>

    <div style={{ marginTop: "auto", maxWidth: 1050 }}>
      <Statement lang={lang}>{text(platform.statement, lang)}</Statement>
    </div>
  </Canvas>
);

export const PlatformPayoffWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="platform-payoff-web" label={FINAL_PROBLEM.title} lang={lang} tone="warm">
    <div style={{ display: "grid", gridTemplateColumns: "0.54fr 0.46fr", gap: 96 }}>
      <div>
        <Kicker>{text(FINAL_PROBLEM.intro, lang)}</Kicker>
        <div style={{ marginTop: 30 }}>
          <Title lang={lang} size={61}>{text(FINAL_PROBLEM.title, lang)}</Title>
        </div>
      </div>
      <Body>{text(FINAL_PROBLEM.systems, lang)}</Body>
    </div>

    <div style={{ marginTop: 70, paddingTop: 58, borderTop: rule, display: "grid", gridTemplateColumns: "0.54fr 0.46fr", gap: 96 }}>
      <div>
        <Title lang={lang} size={57}>{text(FINAL_DECISION.title, lang)}</Title>
        <div style={{ marginTop: 28 }}>
          <Body>{text(FINAL_DECISION.body, lang)}</Body>
        </div>
      </div>
      <Statement lang={lang}>{text(FINAL_DECISION.close, lang)}</Statement>
    </div>

    <div style={{ marginTop: "auto", paddingTop: 30, borderTop: rule }}>
      <Kicker>{text(FINAL_PLATFORM.intro, lang)}</Kicker>
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: rule, borderBottom: rule }}>
        {Object.values(FINAL_PLATFORM.movements).map((movement, index) => (
          <p key={movement.en} style={{ margin: 0, padding: "23px 28px", borderInlineStart: index === 0 ? "none" : rule, color: index === 2 ? CB.copperDeep : CB.ink, fontSize: 28, fontWeight: 650 }}>
            {text(movement, lang)}
          </p>
        ))}
      </div>
      <div style={{ marginTop: 18 }}>
        <Caption>{text(FINAL_PLATFORM.support, lang)}</Caption>
      </div>
    </div>
  </Canvas>
);

export const SalonOperatingWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => {
  const salon = SALON_OS_PROOF;
  const economics = [
    formatUsd(salon.bookedServiceValue),
    formatUsd(salon.estimatedMaterialCost),
    formatUsd(salon.operatingOverhead),
    formatUsd(salon.netProfit),
  ];

  return (
    <Canvas id="salon-operating-web" label={FINAL_SALON_OS.title} lang={lang}>
      <div style={{ display: "grid", gridTemplateColumns: "0.58fr 0.42fr", gap: 88, alignItems: "end" }}>
        <div>
          <Kicker>{text(FINAL_PLATFORM.movements.economics, lang)}</Kicker>
          <div style={{ marginTop: 26 }}>
            <Title lang={lang} size={61}>{text(FINAL_SALON_OS.title, lang)}</Title>
          </div>
        </div>
        <div>
          <Body>{text(FINAL_BOOKING.support, lang)}</Body>
          <div style={{ marginTop: 18 }}>
            <Caption>{text(osCopy.scope, lang)}</Caption>
          </div>
          <div style={{ marginTop: 8 }}>
            <Caption>{text(osCopy.environment, lang)}</Caption>
          </div>
        </div>
      </div>

      <Sheet className="mt-12">
        <dl dir="ltr" style={{ margin: 0, display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {economics.map((value, index) => (
            <div key={value} style={{ padding: "25px 30px", borderInlineStart: index === 0 ? "none" : rule }}>
              <dd style={{ margin: 0, color: index === 3 ? CB.copperDeep : CB.ink, fontSize: 43, fontWeight: 650, letterSpacing: "-0.045em" }}>{value}</dd>
              <dt
                dir={direction(lang)}
                style={{
                  marginTop: 12,
                  color: CB.muted,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {text(osCopy.labels[index], lang)}
              </dt>
            </div>
          ))}
        </dl>
      </Sheet>

      <div style={{ marginTop: 46, display: "grid", gridTemplateColumns: "0.43fr 0.57fr", gap: 76 }}>
        <div>
          <Kicker>{text(FINAL_PLATFORM.movements.capacity, lang)}</Kicker>
          <div style={{ marginTop: 22 }}>
            <Title lang={lang} size={43}>{text(FINAL_BOOKING.title, lang)}</Title>
          </div>
          <div style={{ marginTop: 22 }}>
            <Caption>{text(FINAL_BOOKING.caption, lang)}</Caption>
          </div>
        </div>
        <div style={{ borderTop: rule }}>
          {salon.revenueByCategory.map((item) => (
            <div key={item.key} style={{ display: "grid", gridTemplateColumns: "170px 1fr 110px", gap: 18, alignItems: "center", padding: "13px 0", borderBottom: rule }}>
              <span style={{ color: CB.ink, fontSize: 16, fontWeight: 650 }}>{item.name}</span>
              <span style={{ display: "block", height: 7, background: CB.well }}>
                <span style={{ display: "block", width: `${Math.max(12, (item.revenue / Math.max(...salon.revenueByCategory.map((row) => row.revenue))) * 100)}%`, height: "100%", background: CB.copper }} />
              </span>
              <span dir="ltr" style={{ color: CB.muted, fontSize: 16, fontWeight: 650, textAlign: "end" }}>{formatUsd(item.revenue)}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: "auto", maxWidth: 1300 }}>
        <Statement lang={lang}>{text(FINAL_SALON_OS.pull, lang)}</Statement>
      </div>
    </Canvas>
  );
};

export const OwnerAppWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="owner-app-web" label={FINAL_OWNER_APP.title} lang={lang} tone="warm">
    <div style={{ display: "grid", gridTemplateColumns: "0.49fr 0.51fr", gap: 94, height: "100%", alignItems: "center" }}>
      <div>
        <Kicker>{text(FINAL_OWNER_APP.kicker, lang)}</Kicker>
        <div style={{ marginTop: 28 }}>
          <Title lang={lang} size={72}>{text(FINAL_OWNER_APP.title, lang)}</Title>
        </div>
        <div style={{ marginTop: 30 }}>
          <Body>{text(FINAL_OWNER_APP.body, lang)}</Body>
        </div>
        <div style={{ marginTop: 42, padding: "27px 0", borderTop: rule, borderBottom: rule }}>
          <Title lang={lang} size={39}>{text(FINAL_OWNER_APP.pull, lang)}</Title>
        </div>
        <div style={{ marginTop: 26, display: "flex", gap: 28, flexWrap: "wrap" }}>
          {FINAL_MOBILE.roles.map((role) => (
            <span key={role.en} style={{ color: CB.copperDeep, fontSize: 16, fontWeight: 800, letterSpacing: "0.1em" }}>
              {text(role, lang)}
            </span>
          ))}
        </div>
        <p style={{ margin: "10px 0 0", color: CB.ink, fontSize: 22 }}>{text(FINAL_MOBILE.line, lang)}</p>
        <div style={{ marginTop: 24 }}>
          <Caption>{text(FINAL_OWNER_APP.status, lang)}</Caption>
        </div>
      </div>

      <figure style={{ margin: 0, justifySelf: "center", width: 510 }}>
        <Sheet inset>
          <img
            src={FINAL_OWNER_APP.screens[0].image}
            alt={text(FINAL_OWNER_APP.screens[0].alt, lang)}
            width={1206}
            height={2622}
            style={{ display: "block", width: "100%", height: 716, objectFit: "contain" }}
          />
        </Sheet>
        <figcaption style={{ marginTop: 16 }}>
          <Kicker>{text(FINAL_OWNER_APP.figureLabel, lang)}</Kicker>
          <div style={{ marginTop: 8 }}>
            <Caption>{text(FINAL_OWNER_APP.caption, lang)}</Caption>
          </div>
        </figcaption>
      </figure>
    </div>
  </Canvas>
);

export const ClientAppWebSlide: React.FC<CommercialPlatformWebSlideProps> = ({ lang }) => (
  <Canvas id="client-app-web" label={FINAL_CLIENT_APP.title} lang={lang}>
    <p style={{ margin: 0, color: CB.copperDeep, fontSize: 29, fontWeight: 650, letterSpacing: "-0.025em" }}>
      {text(FINAL_CLIENT_APP.transition, lang)}
    </p>
    <div style={{ marginTop: 36, display: "grid", gridTemplateColumns: "0.39fr 0.61fr", gap: 82, alignItems: "center", flex: 1 }}>
      <div>
        <Kicker>{text(FINAL_CLIENT_APP.kicker, lang)}</Kicker>
        <div style={{ marginTop: 24 }}>
          <Title lang={lang} size={55}>{text(FINAL_CLIENT_APP.title, lang)}</Title>
        </div>
        <div style={{ marginTop: 28 }}>
          <Body>{text(FINAL_CLIENT_APP.body, lang)}</Body>
        </div>
        <div style={{ marginTop: 34, paddingTop: 22, borderTop: rule }}>
          <Caption>{text(FINAL_CLIENT_APP.status, lang)}</Caption>
          <div style={{ marginTop: 10 }}>
            <Caption>{text(FINAL_CLIENT_APP.dataNote, lang)}</Caption>
          </div>
        </div>
      </div>

      <figure style={{ margin: 0 }}>
        <Sheet inset>
          <img
            src="/investor/media/client-app-two-phones.png"
            alt={text(FINAL_CLIENT_APP.title, lang)}
            width={1448}
            height={1086}
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </Sheet>
        <figcaption style={{ marginTop: 16, display: "flex", justifyContent: "space-between", gap: 30 }}>
          <Kicker>{text(FINAL_CLIENT_APP.bookLabel, lang)}</Kicker>
          <Kicker>{text(FINAL_CLIENT_APP.shopLabel, lang)}</Kicker>
        </figcaption>
      </figure>
    </div>
  </Canvas>
);

