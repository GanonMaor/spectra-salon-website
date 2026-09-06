import React from "react";
import { SpectraOrb } from "../../../components/SpectraOrb";
import { NetworkConstellation } from "../../SpectraInvestorExperience/visuals/NetworkConstellation";
import { PROOF as GLOBAL_USAGE_PROOF } from "../../SpectraProductVision/dataMoat";
import { CANONICAL_BY_ID } from "../canonicalNarrative";
import { CB, CB_INK, colorBarSans, inkGold } from "../colorBarTokens";
import {
  FINAL_CHAPTERS,
  FINAL_PLATFORM,
  FINAL_SALON_AI,
  type Localized,
  type UpdateLang,
} from "../finalCopy";
import { NETWORK_ACCUMULATION_SERIES, SIX_SALON_SAMPLE } from "../intelligenceData";
import { useDeckLayout, WebSlide } from "../WebDeckPrimitives";

type SlideProps = {
  lang: UpdateLang;
  reducedMotion: boolean;
};

const salon = CANONICAL_BY_ID["salon-ai"];
const data = CANONICAL_BY_ID.data;
const ink = "#1C1914";
const muted = "#7A7368";
const copper = "#A37D38";
const copperDeep = "#82632A";
const darkInk = CB_INK.bg;
const darkText = CB_INK.ink;
const darkMuted = CB_INK.muted;
const rule = "rgba(92,72,42,0.18)";
const darkRule = CB_INK.lineStrong;
const salonImage = "/investor-vision/salon-ai-live-demo/backup-command-center-bg.png";

const t = (value: Localized, lang: UpdateLang) => value[lang];
const family = (lang: UpdateLang) => colorBarSans(lang);

const COPY = {
  dataHeadline: { en: "What was actually done.", he: "מה נעשה בפועל." },
  dataLede: {
    en: "Industry data usually starts when a product is shipped, sold or booked. Spectra starts one level deeper, inside the service itself.",
    he: "דאטה בתעשייה מתחיל בדרך כלל כשמוצר נשלח, נמכר או נקבע ביומן. Spectra מתחילה שכבה אחת עמוק יותר, בתוך השירות עצמו.",
  },
  dataEvents: { en: "Real service events", he: "אירועי שירות אמיתיים" },
  dataCaption: {
    en: "Cumulative measured service events across the Spectra network, January 2023 to August 2026.",
    he: "אירועי שירות מצטברים שנמדדו ברשת ספקטרה, מינואר 2023 עד אוגוסט 2026.",
  },
  dataPull: {
    en: "Software can be rebuilt. History has to be earned.",
    he: "אפשר לבנות תוכנה מחדש. היסטוריה צריך להרוויח.",
  },
  compound: { en: "The asset compounds.", he: "הנכס מצטבר." },
  sixKicker: { en: "A small query. Six salons.", he: "שאילתה קטנה. שישה סלונים." },
  sixLead: {
    en: "of the color material consumed was Brunette.",
    he: "מחומרי הצבע שנצרכו היו חום.",
  },
  sixMixNote: {
    en: "Share of color material consumed, excluding developers and lighteners.",
    he: "חלקם של חומרי הצבע שנצרכו, ללא חמצנים וחומרי הבהרה.",
  },
  shades: { en: "Top consumed shades", he: "הגוונים הנצרכים ביותר" },
  changed: { en: "of clients changed colour direction.", he: "מהלקוחות שינו כיוון צבע." },
  changedNote: {
    en: `${SIX_SALON_SAMPLE.journeyClients} journeys across ${SIX_SALON_SAMPLE.clientCount} clients, measured as a change in formula, depth or tone.`,
    he: `${SIX_SALON_SAMPLE.journeyClients} מסעות צבע מתוך ${SIX_SALON_SAMPLE.clientCount} לקוחות, שנמדדו כשינוי בפורמולה, בעומק או בטון.`,
  },
  audience: { en: "One data layer. Two markets.", he: "שכבת דאטה אחת. שני שווקים." },
  salons: { en: "For salons", he: "לסלונים" },
  salonsBody: {
    en: "Business intelligence: material cost, service economics, capacity and client retention.",
    he: "אינטליגנציה עסקית: עלות חומר, כלכלת שירות, קיבולת ושימור לקוחות.",
  },
  industry: { en: "For the industry", he: "לתעשייה" },
  industryBody: {
    en: "Product, demand and portfolio intelligence for manufacturers and distributors.",
    he: "אינטליגנציית מוצר, ביקוש ופורטפוליו ליצרנים ולמפיצים.",
  },
  implicationsCaveat: {
    en: "Decision-support this data can enable as coverage grows. These are not products represented as live today.",
    he: "יישומי תמיכה בהחלטות שהדאטה הזה יכול לאפשר ככל שהכיסוי גדל. אלה אינם מוצרים שמוצגים כפעילים כיום.",
  },
} satisfies Record<string, Localized>;

const VANTAGE = [
  {
    source: { en: "Manufacturer / distributor", he: "יצרן / מפיץ" },
    sees: { en: "What shipped", he: "מה נשלח" },
  },
  { source: { en: "POS", he: "קופה" }, sees: { en: "What sold", he: "מה נמכר" } },
  {
    source: { en: "Booking", he: "יומן" },
    sees: { en: "What was scheduled", he: "מה נקבע" },
  },
  {
    source: { en: "Spectra", he: "Spectra" },
    sees: { en: "What was actually done", he: "מה נעשה בפועל" },
  },
] satisfies Array<{ source: Localized; sees: Localized }>;

const COMPOUNDING = [
  { en: "More salons", he: "עוד סלונים" },
  { en: "More services", he: "עוד שירותים" },
  { en: "More context", he: "עוד הקשר" },
  { en: "More time", he: "עוד זמן" },
] satisfies Localized[];

const display: React.CSSProperties = {
  margin: 0,
  fontWeight: 600,
  lineHeight: 0.96,
  letterSpacing: "-0.055em",
};

const Kicker: React.FC<{
  children: React.ReactNode;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ children, dark, style }) => (
  <p
    style={{
      margin: 0,
      color: dark ? CB_INK.faint : copperDeep,
      fontSize: 17,
      lineHeight: 1.25,
      fontWeight: 700,
      letterSpacing: "0.15em",
      textTransform: "uppercase",
      ...style,
    }}
  >
    {children}
  </p>
);

const Hair: React.FC<{ dark?: boolean; style?: React.CSSProperties }> = ({ dark, style }) => (
  <div aria-hidden="true" style={{ height: 1, background: dark ? darkRule : rule, ...style }} />
);

const Terms: React.FC<{
  items: readonly Localized[];
  lang: UpdateLang;
  dark?: boolean;
  style?: React.CSSProperties;
}> = ({ items, lang, dark, style }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "16px 44px",
      color: dark ? "rgba(234,227,216,0.72)" : muted,
      fontSize: 18,
      lineHeight: 1.4,
      ...style,
    }}
  >
    {items.map((item) => (
      <span key={item.en}>{t(item, lang)}</span>
    ))}
  </div>
);

const DarkAtmosphere: React.FC = () => (
  <>
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `linear-gradient(110deg,rgba(26,22,19,0.97),rgba(26,22,19,0.88)),url('${salonImage}')`,
        backgroundSize: "cover",
        backgroundPosition: "center 40%",
      }}
    />
    {/* Keeps the room from creeping up the edges once the scrim is this light. */}
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(122% 90% at 50% 44%,transparent 46%,rgba(0,0,0,0.30) 100%)",
      }}
    />
    <NetworkConstellation
      dark
      count={28}
      style={{ position: "absolute", inset: 0, width: 1920, height: 1080, opacity: 0.18 }}
    />
  </>
);

export const SalonAiCurtainWebSlide: React.FC<SlideProps> = ({ lang }) => {
  const movements = [
    FINAL_PLATFORM.movements.capacity,
    FINAL_PLATFORM.movements.economics,
    FINAL_PLATFORM.movements.action,
  ];
  return (
    <WebSlide id="salon-ai-curtain" label={t(FINAL_SALON_AI.bridge, lang)} lang={lang} tone="ink" bleed={<DarkAtmosphere />}>
      <div
        style={{
          position: "relative",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <Kicker dark>{t(FINAL_PLATFORM.intro, lang)}</Kicker>
        <Hair dark style={{ marginTop: 54, width: 120 }} />
        <h2
          style={{
            ...display,
            marginTop: 64,
            maxWidth: 1340,
            color: CB_INK.gold,
            fontFamily: family(lang),
            fontSize: lang === "he" ? 86 : 94,
            lineHeight: 1.12,
          }}
        >
          {t(FINAL_SALON_AI.bridge, lang)}
        </h2>
        <Hair dark style={{ marginTop: 64, width: 120 }} />
        <Terms items={movements} lang={lang} dark style={{ marginTop: 44, justifyContent: "center" }} />
      </div>
    </WebSlide>
  );
};

export const SalonAiThesisWebSlide: React.FC<SlideProps> = ({ lang, reducedMotion }) => (
  <WebSlide id="salon-ai-thesis" label={t(FINAL_SALON_AI.title, lang)} lang={lang} tone="ink" bleed={<DarkAtmosphere />}>
    <div
      style={{
        position: "relative",
        height: "100%",
        display: "grid",
        gridTemplateColumns: "1fr 590px",
        gap: 108,
        alignItems: "center",
      }}
    >
      <div>
        <Kicker dark>{t(FINAL_SALON_AI.kicker, lang)}</Kicker>
        <h2
          style={{
            ...display,
            marginTop: 28,
            color: darkText,
            fontFamily: family(lang),
            fontSize: 132,
          }}
        >
          {t(FINAL_SALON_AI.title, lang)}
        </h2>
        <p
          style={{
            margin: "36px 0 0",
            maxWidth: 850,
            color: darkMuted,
            fontSize: 29,
            lineHeight: 1.52,
            fontWeight: 400,
          }}
        >
          {t(FINAL_SALON_AI.support, lang)}
        </p>
        <Hair dark style={{ marginTop: 48 }} />
        <Terms items={FINAL_SALON_AI.contextTerms} lang={lang} dark style={{ marginTop: 32 }} />
        <Hair dark style={{ marginTop: 46 }} />
        <Terms items={FINAL_SALON_AI.flow} lang={lang} dark style={{ marginTop: 32, color: CB_INK.gold }} />
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <div style={{ position: "relative", width: 520, height: 520, display: "grid", placeItems: "center" }}>
          {[0, 48, 96].map((inset) => (
            <span
              key={inset}
              aria-hidden="true"
              style={{
                position: "absolute",
                inset,
                borderRadius: "50%",
                border: `1px solid ${inkGold(0.12)}`,
              }}
            />
          ))}
          <SpectraOrb size={300} reducedMotion={reducedMotion} />
        </div>
      </div>
    </div>
  </WebSlide>
);

const CAPABILITY_POSITIONS = [
  { left: 0, top: 74, width: 380 },
  { left: 0, top: 318, width: 380 },
  { left: 0, top: 562, width: 380 },
  { right: 0, top: 74, width: 380 },
  { right: 0, top: 318, width: 380 },
  { right: 0, top: 562, width: 380 },
] as const;

export const SalonAiConvergenceWebSlide: React.FC<SlideProps> = ({ lang, reducedMotion }) => {
  const { layout } = useDeckLayout();
  const fluid = layout === "fluid";

  return (
  <WebSlide id="salon-ai-convergence" label={t(salon.headline, lang)} lang={lang} tone="ink" bleed={<DarkAtmosphere />}>
    <div style={{ position: "relative", height: fluid ? "auto" : "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 88, alignItems: "start", flexWrap: fluid ? "wrap" : undefined }}>
        <div>
          <h2
            style={{
              ...display,
              maxWidth: 920,
              color: darkText,
              fontFamily: family(lang),
              fontSize: 70,
              lineHeight: 1.12,
            }}
          >
            {t(salon.headline, lang)}
          </h2>
          <p style={{ margin: "30px 0 0", maxWidth: 850, color: darkMuted, fontSize: 24, lineHeight: 1.55 }}>
            {t(salon.support, lang)}
          </p>
        </div>
        <Kicker dark style={{ color: CB_INK.gold, whiteSpace: "nowrap" }}>
          {t(FINAL_SALON_AI.status, lang)}
        </Kicker>
      </div>

      {fluid ? (
        <div style={{ marginTop: 28 }}>
          <div style={{ display: "grid", placeItems: "center", marginBottom: 24 }}>
            <SpectraOrb size={140} reducedMotion={reducedMotion} />
            <p style={{ margin: "14px 0 0", color: darkText, fontSize: 20, fontWeight: 600 }}>
              {salon.hub ? t(salon.hub.term, lang) : null}
            </p>
            <p style={{ margin: "6px 0 0", color: darkMuted, fontSize: 14 }}>
              {salon.hub?.detail ? t(salon.hub.detail, lang) : null}
            </p>
          </div>
          <ul
            className="deck-quad"
            style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            {salon.facts.map((fact) => (
              <li key={fact.term.en}>
                <p style={{ margin: 0, color: darkText, fontSize: 16, fontWeight: 600, lineHeight: 1.25 }}>
                  {t(fact.term, lang)}
                </p>
                <p style={{ margin: "6px 0 0", color: darkMuted, fontSize: 14, lineHeight: 1.4 }}>
                  {fact.detail ? t(fact.detail, lang) : null}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : (
      <div style={{ position: "absolute", insetInline: 0, top: 205, bottom: 0 }}>
        <svg
          aria-hidden="true"
          viewBox="0 0 1680 690"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {[120, 345, 570].map((y) => (
            <React.Fragment key={y}>
              <path d={`M 365 ${y} C 590 ${y}, 620 345, 840 345`} fill="none" stroke={inkGold(0.22)} />
              <path d={`M 1315 ${y} C 1090 ${y}, 1060 345, 840 345`} fill="none" stroke={inkGold(0.22)} />
            </React.Fragment>
          ))}
        </svg>
        {salon.facts.map((fact, index) => {
          const position = CAPABILITY_POSITIONS[index];
          return (
            <div key={fact.term.en} style={{ position: "absolute", ...position }}>
              <p style={{ margin: 0, color: darkText, fontSize: 23, fontWeight: 600, lineHeight: 1.2 }}>
                {t(fact.term, lang)}
              </p>
              <p style={{ margin: "8px 0 0", color: darkMuted, fontSize: 17, lineHeight: 1.45 }}>
                {fact.detail ? t(fact.detail, lang) : null}
              </p>
            </div>
          );
        })}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}
        >
          <SpectraOrb size={250} reducedMotion={reducedMotion} />
          <p style={{ margin: "22px 0 0", color: darkText, fontSize: 25, fontWeight: 600 }}>
            {salon.hub ? t(salon.hub.term, lang) : null}
          </p>
          <p style={{ margin: "7px 0 0", color: darkMuted, fontSize: 16 }}>
            {salon.hub?.detail ? t(salon.hub.detail, lang) : null}
          </p>
        </div>
      </div>
      )}
    </div>
  </WebSlide>
  );
};

export const DataInterstitialWebSlide: React.FC<SlideProps> = ({ lang }) => (
  <WebSlide id="data-interstitial" label={t(data.headline, lang)} lang={lang} tone="chalk">
    <div style={{ height: "100%", display: "grid", alignContent: "center" }}>
      <Kicker>{t(FINAL_CHAPTERS.data.title, lang)}</Kicker>
      <Hair style={{ marginTop: 36, width: 120, background: copper }} />
      <h2
        style={{
          ...display,
          marginTop: 50,
          maxWidth: 1450,
          color: ink,
          fontFamily: family(lang),
          fontSize: lang === "he" ? 94 : 104,
          lineHeight: 1.03,
        }}
      >
        {t(data.headline, lang)}
      </h2>
      <p style={{ margin: "38px 0 0", maxWidth: 900, color: muted, fontSize: 30, lineHeight: 1.45 }}>
        {t(data.support, lang)}
      </p>
    </div>
  </WebSlide>
);

const HUB_POSITIONS = [
  { left: 0, top: 16 },
  { right: 0, top: 16 },
  { left: 0, top: 290 },
  { right: 0, top: 290 },
  { left: 180, top: 560 },
] as const;

export const DataHubWebSlide: React.FC<SlideProps> = ({ lang }) => {
  const { layout } = useDeckLayout();
  const fluid = layout === "fluid";

  return (
  <WebSlide id="data-hub" label={data.hub ? t(data.hub.term, lang) : t(data.headline, lang)} lang={lang} tone="chalk">
    <div style={{ height: fluid ? "auto" : "100%", display: "grid", gridTemplateRows: fluid ? "auto" : "1fr auto", gap: 32 }}>
      <div style={{ position: fluid ? "static" : "relative" }}>
        {fluid ? (
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 18 }}>
            <li style={{ marginBottom: 8 }}>
              <h2
                dir="ltr"
                style={{
                  ...display,
                  margin: 0,
                  color: ink,
                  fontFamily: family(lang),
                  fontSize: 36,
                  lineHeight: 1.1,
                }}
              >
                {data.hub ? t(data.hub.term, lang) : null}
              </h2>
            </li>
            {data.facts.map((fact) => (
              <li key={fact.term.en}>
                <Kicker>{t(fact.term, lang)}</Kicker>
                <p style={{ margin: "8px 0 0", color: muted, fontSize: 16, lineHeight: 1.45 }}>
                  {fact.detail ? t(fact.detail, lang) : null}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <>
        <svg
          aria-hidden="true"
          viewBox="0 0 1680 790"
          preserveAspectRatio="none"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        >
          {[
            [330, 90],
            [1350, 90],
            [330, 365],
            [1350, 365],
            [510, 635],
          ].map(([x, y], index) => (
            <line key={index} x1="840" y1="360" x2={x} y2={y} stroke="rgba(163,125,56,.38)" strokeWidth="1.4" />
          ))}
        </svg>
        {data.facts.map((fact, index) => (
          <div key={fact.term.en} style={{ position: "absolute", width: 330, ...HUB_POSITIONS[index] }}>
            <Kicker>{t(fact.term, lang)}</Kicker>
            <p style={{ margin: "11px 0 0", color: muted, fontSize: 19, lineHeight: 1.45 }}>
              {fact.detail ? t(fact.detail, lang) : null}
            </p>
          </div>
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "46%",
            transform: "translate(-50%, -50%)",
            width: 470,
            textAlign: "center",
          }}
        >
          <Hair style={{ width: 82, margin: "0 auto", background: copper }} />
          <h2
            dir="ltr"
            style={{
              ...display,
              marginTop: 30,
              color: ink,
              fontFamily: family(lang),
              fontSize: 50,
              lineHeight: 1.08,
            }}
          >
            {data.hub ? t(data.hub.term, lang) : null}
          </h2>
          <Hair style={{ width: 82, margin: "30px auto 0", background: copper }} />
        </div>
          </>
        )}
      </div>
      <div>
        <Hair />
        <Terms items={data.terms ?? []} lang={lang} style={{ marginTop: 18, justifyContent: "center", color: copperDeep }} />
        <p
          style={{
            margin: "22px auto 0",
            maxWidth: 1180,
            textAlign: "center",
            color: ink,
            fontFamily: family(lang),
            fontSize: 31,
            fontWeight: 600,
            lineHeight: 1.25,
            letterSpacing: "-0.025em",
          }}
        >
          {data.statement ? t(data.statement, lang) : null}
        </p>
      </div>
    </div>
  </WebSlide>
  );
};

export const DataDepthWebSlide: React.FC<SlideProps> = ({ lang }) => {
  const cumulative = NETWORK_ACCUMULATION_SERIES.reduce<number[]>((totals, item) => {
    totals.push((totals[totals.length - 1] ?? 0) + item[1]);
    return totals;
  }, []);
  const peak = cumulative[cumulative.length - 1] ?? GLOBAL_USAGE_PROOF.services;
  const points = cumulative
    .map((value, index) => `${(index / (cumulative.length - 1)) * 100},${98 - (value / peak) * 92}`)
    .join(" ");

  return (
    <WebSlide id="data-depth" label={t(COPY.dataHeadline, lang)} lang={lang} tone="paper">
      <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto 1fr auto", gap: 34 }}>
        <div style={{ display: "grid", gridTemplateColumns: "0.48fr 0.52fr", gap: 90 }}>
          <div>
            <h2 style={{ ...display, color: ink, fontFamily: family(lang), fontSize: 78 }}>
              {t(COPY.dataHeadline, lang)}
            </h2>
            <p style={{ margin: "24px 0 0", maxWidth: 700, color: muted, fontSize: 23, lineHeight: 1.47 }}>
              {t(COPY.dataLede, lang)}
            </p>
          </div>
          <dl style={{ margin: 0 }}>
            <Hair />
            {VANTAGE.map((row, index) => (
              <div
                key={row.source.en}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 30,
                  paddingBlock: 13,
                  borderBottom: `1px solid ${index === VANTAGE.length - 1 ? rule : "rgba(92,72,42,.09)"}`,
                }}
              >
                <dt style={{ color: index === 3 ? copperDeep : muted, fontSize: 15, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase" }}>
                  {t(row.source, lang)}
                </dt>
                <dd style={{ margin: 0, color: index === 3 ? ink : muted, fontSize: index === 3 ? 25 : 18 }}>
                  {t(row.sees, lang)}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "410px 1fr", gap: 80, alignItems: "end" }}>
          <div>
            <p dir="ltr" style={{ ...display, color: ink, fontFamily: family(lang), fontSize: 122 }}>
              {Math.floor(GLOBAL_USAGE_PROOF.services / 1000)}K+
            </p>
            <Kicker style={{ marginTop: 19 }}>{t(COPY.dataEvents, lang)}</Kicker>
            <Hair style={{ marginTop: 28 }} />
            <p style={{ margin: "26px 0 0", color: ink, fontFamily: family(lang), fontSize: 36, fontWeight: 600, lineHeight: 1.15, letterSpacing: "-.035em" }}>
              {t(COPY.dataPull, lang)}
            </p>
          </div>
          <figure style={{ margin: 0 }}>
            <div dir="ltr" style={{ height: 250, position: "relative", borderBottom: `1px solid ${rule}` }}>
              <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
                <polygon points={`${points} 100,100 0,100`} fill={copper} fillOpacity=".1" />
                <polyline points={points} fill="none" stroke={copper} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div dir="ltr" style={{ marginTop: 9, display: "flex", justifyContent: "space-between", color: muted, fontSize: 13 }}>
              <span>Jan 2023</span><span>Jan 2025</span><span>Aug 2026</span>
            </div>
            <figcaption style={{ marginTop: 11, color: muted, fontSize: 14, lineHeight: 1.4 }}>
              {t(COPY.dataCaption, lang)}
            </figcaption>
          </figure>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 80 }}>
          <Terms items={COMPOUNDING} lang={lang} />
          <p style={{ margin: 0, color: copperDeep, fontFamily: family(lang), fontSize: 29, fontWeight: 600 }}>
            {t(COPY.compound, lang)}
          </p>
        </div>
      </div>
    </WebSlide>
  );
};

export const SixSalonFindingsWebSlide: React.FC<SlideProps> = ({ lang }) => {
  const brunette = SIX_SALON_SAMPLE.families[0];
  const shades = SIX_SALON_SAMPLE.products.slice(0, 5);
  const maxKg = shades[0].kg;
  const labels: Localized[] = [
    { en: "Salons", he: "סלונים" },
    { en: "Services", he: "שירותים" },
    { en: "Clients", he: "לקוחות" },
    { en: "Material", he: "חומר" },
  ];
  return (
    <WebSlide id="six-salon-findings" label={t(COPY.sixKicker, lang)} lang={lang} tone="warm">
      <div style={{ height: "100%", display: "grid", gridTemplateRows: "auto auto auto 1fr", gap: 26 }}>
        <Kicker>{t(COPY.sixKicker, lang)}</Kicker>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "330px 1fr", gap: 72, alignItems: "baseline" }}>
            <p dir="ltr" style={{ ...display, color: brunette.color, fontFamily: family(lang), fontSize: 140 }}>
              {brunette.value}%
            </p>
            <h2 style={{ ...display, color: ink, fontFamily: family(lang), fontSize: 62, lineHeight: 1.04 }}>
              {t(COPY.sixLead, lang)}
            </h2>
          </div>
          <div dir="ltr" style={{ display: "flex", height: 14, marginTop: 26 }}>
            {SIX_SALON_SAMPLE.families.map((item) => (
              <span key={item.name} style={{ width: `${item.value}%`, background: item.color }} />
            ))}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "7px 28px", marginTop: 12, color: muted, fontSize: 14, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em" }}>
            {SIX_SALON_SAMPLE.families.map((item) => (
              <span key={item.name}>{lang === "he" ? item.he : item.name} <b dir="ltr" style={{ color: ink }}>{item.value}%</b></span>
            ))}
          </div>
          <p style={{ margin: "9px 0 0", color: muted, fontSize: 14 }}>{t(COPY.sixMixNote, lang)}</p>
        </div>

        <div>
          <Hair />
          <dl style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", margin: "18px 0 0" }}>
            {SIX_SALON_SAMPLE.totals.map((metric, index) => (
              <div key={metric.value} style={{ borderInlineStart: index ? `1px solid ${rule}` : undefined, paddingInline: index ? 30 : 0 }}>
                <dd dir="ltr" style={{ margin: 0, color: ink, fontFamily: family(lang), fontSize: 32, fontWeight: 600 }}>{index === 0 ? "6" : metric.value}</dd>
                <dt style={{ marginTop: 6, color: muted, fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".09em" }}>{t(labels[index], lang)}</dt>
              </div>
            ))}
          </dl>
          <p style={{ margin: "14px 0 0", color: muted, fontSize: 13 }}>{t(SIX_SALON_SAMPLE.caveat, lang)}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "0.66fr 0.34fr", gap: 80, alignItems: "start" }}>
          <div>
            <Kicker>{t(COPY.shades, lang)}</Kicker>
            <ol style={{ margin: "14px 0 0", padding: 0, listStyle: "none" }}>
              {shades.map((product) => (
                <li key={product.name} dir="ltr" style={{ display: "grid", gridTemplateColumns: "180px 1fr 90px", gap: 18, alignItems: "center", paddingBlock: 6, borderTop: `1px solid ${rule}` }}>
                  <span style={{ color: ink, fontSize: 13, fontWeight: 600, textTransform: "uppercase" }}>{product.name}</span>
                  <span style={{ height: 26, background: "rgba(92,72,42,.07)" }}>
                    <span style={{ display: "block", height: "100%", width: `${(product.kg / maxKg) * 100}%`, background: product.tone }} />
                  </span>
                  <span style={{ color: ink, fontSize: 16, textAlign: "end" }}>{product.kg.toFixed(1)} kg</span>
                </li>
              ))}
            </ol>
          </div>
          <div style={{ borderInlineStart: `1px solid ${rule}`, paddingInlineStart: 56 }}>
            <p dir="ltr" style={{ ...display, color: copper, fontFamily: family(lang), fontSize: 88 }}>
              {SIX_SALON_SAMPLE.journeyShare}
            </p>
            <h3 style={{ margin: "18px 0 0", color: ink, fontFamily: family(lang), fontSize: 29, lineHeight: 1.2 }}>
              {t(COPY.changed, lang)}
            </h3>
            <p style={{ margin: "13px 0 0", color: muted, fontSize: 15, lineHeight: 1.45 }}>
              {t(COPY.changedNote, lang)}
            </p>
          </div>
        </div>
      </div>
    </WebSlide>
  );
};

export const DataImplicationsWebSlide: React.FC<SlideProps> = ({ lang }) => (
  <WebSlide id="data-implications" label={t(COPY.audience, lang)} lang={lang} tone="chalk">
    <div style={{ height: "100%", display: "grid", alignContent: "center" }}>
      <Kicker>{t(FINAL_CHAPTERS.data.title, lang)}</Kicker>
      <h2
        style={{
          ...display,
          marginTop: 28,
          color: ink,
          fontFamily: family(lang),
          fontSize: 104,
          lineHeight: 1,
        }}
      >
        {t(COPY.audience, lang)}
      </h2>
      <Hair style={{ marginTop: 56, background: copper }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ paddingBlock: 60, paddingInlineEnd: 90 }}>
          <Kicker>{t(COPY.salons, lang)}</Kicker>
          <p style={{ margin: "25px 0 0", maxWidth: 650, color: ink, fontFamily: family(lang), fontSize: 38, lineHeight: 1.28, fontWeight: 600, letterSpacing: "-.03em" }}>
            {t(COPY.salonsBody, lang)}
          </p>
        </div>
        <div style={{ paddingBlock: 60, paddingInlineStart: 90, borderInlineStart: `1px solid ${rule}` }}>
          <Kicker>{t(COPY.industry, lang)}</Kicker>
          <p style={{ margin: "25px 0 0", maxWidth: 650, color: ink, fontFamily: family(lang), fontSize: 38, lineHeight: 1.28, fontWeight: 600, letterSpacing: "-.03em" }}>
            {t(COPY.industryBody, lang)}
          </p>
        </div>
      </div>
      <Hair />
      <p style={{ margin: "25px 0 0", maxWidth: 1120, color: muted, fontSize: 17, lineHeight: 1.5 }}>
        {t(COPY.implicationsCaveat, lang)}
      </p>
    </div>
  </WebSlide>
);
