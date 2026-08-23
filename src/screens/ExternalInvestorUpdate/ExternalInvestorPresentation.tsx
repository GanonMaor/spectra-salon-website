import React from "react";
import {
  BrowserFrame,
  CalendarGrid,
} from "../NewNarrativeSalonAIFirst/sections/liveDemoDraft/BookingSchedulingIntelligenceDraftSlide";
import { crmTranslations, type CrmLang } from "../SalonCRM/i18n/translations";
import { displayServiceName } from "../SalonCRM/schedule/scheduleDisplayNames";
import { CATEGORY_COLORS } from "../SalonPerformanceDashboard/reports/ReportShared";
import { PROOF as GLOBAL_USAGE_PROOF } from "../SpectraProductVision/dataMoat";
import { displayFamily, loc, t as text } from "./EditorialPrimitives";
import {
  FINAL_ADOPTION,
  FINAL_BOOKING,
  FINAL_BUSINESS_MODEL,
  FINAL_CHAPTERS,
  FINAL_CLIENT_APP,
  FINAL_CLOSE,
  FINAL_COLOR_WEDGE,
  FINAL_DECISION,
  FINAL_GTM,
  FINAL_HERO,
  FINAL_INDUSTRY,
  FINAL_LEDE,
  FINAL_META,
  FINAL_MOBILE,
  FINAL_OWNER_APP,
  FINAL_PEOPLE,
  FINAL_PLATFORM,
  FINAL_PROBLEM,
  FINAL_RAISE,
  FINAL_REVELATION,
  FINAL_SAAS,
  FINAL_SALON_AI,
  FINAL_SALON_OS,
  type Localized,
  type UpdateLang,
} from "./finalCopy";
import { HERO_PROOF_METRICS } from "./InvestorHeroProofRail";
import { BACKERS, CORE_TEAM, NETWORK_ACCUMULATION_SERIES, SIX_SALON_SAMPLE, TEAM_ADVISOR } from "./intelligenceData";
import {
  Hair,
  P,
  PresentationSlide,
  SLIDE,
  SLIDE_CONTENT_HEIGHT,
  SLIDE_CONTENT_WIDTH,
  SlideArrow,
  SlideBody,
  SlideCaption,
  SlideChapterMark,
  SlideDateline,
  SlideFigure,
  SlideFine,
  SlideKicker,
  SlideLede,
  SlideTerms,
  SlideTitle,
  TYPE,
} from "./PresentationSlide";
import { SALON_OS_PROOF } from "./salonOsProofSnapshot";

const MEDIA = {
  reception: "/investor/media/reception.jpg",
  colorBar: "/investor/media/color-bar.jpg",
  shelves: "/investor/media/shelves.jpg",
  colorBarComposition: "/investor/media/colorbar-composition.png",
  salonAiPhone: "/investor/media/salon-ai-phone.jpg",
  ownerApp: "/investor/media/owner-app-reference.png",
  clientApp: "/investor/media/client-app-two-phones.png",
  founders: "/team/maor-elad-spectra.jpg",
} as const;

const CUSTOMERS = [
  { name: "Summer", image: "/customers/summer.jpg" },
  { name: "Kendall", image: "/customers/kendall.jpg" },
  { name: "Serina Renee", image: "/customers/serina.jpg" },
  { name: "Bri Stangle", image: "/customers/bri.jpg" },
] as const;

const FOUNDER_MEDIA = [
  { key: "Maor Ganon", src: "/team/maor-ganon.jpg", objectPosition: "50% 16%" },
  { key: "Elad Gotlieb", src: "/team/elad-gottlieb.jpg", objectPosition: "50% 14%" },
] as const;

const TOTAL = 17;

type SlideProps = { lang: UpdateLang };

/** Presentation-local copy that mirrors strings authored inline on the web page. */
const DECK_COPY = {
  dataHeadline: loc("What was actually done.", "מה נעשה בפועל."),
  dataLede: loc(
    "Industry data usually starts when a product is shipped, sold or booked. Spectra starts one level deeper, inside the service itself.",
    "דאטה בתעשייה מתחיל בדרך כלל כשמוצר נשלח, נמכר או נקבע ביומן. Spectra מתחילה שכבה אחת עמוק יותר, בתוך השירות עצמו.",
  ),
  dataEvents: loc("Real service events", "אירועי שירות אמיתיים"),
  dataChartCaption: loc(
    "Cumulative measured service events across the Spectra network, January 2023 to June 2026.",
    "אירועי שירות מצטברים שנמדדו ברשת ספקטרה, מינואר 2023 עד יוני 2026.",
  ),
  dataPull: loc(
    "Software can be rebuilt. History has to be earned.",
    "אפשר לבנות תוכנה מחדש. היסטוריה צריך להרוויח.",
  ),
  compoundClose: loc("The asset compounds.", "הנכס מצטבר."),
  sixKicker: loc("A small query. Six salons.", "שאילתה קטנה. שישה סלונים."),
  sixLead: loc("of the color material consumed was Brunette.", "מחומרי הצבע שנצרכו היו חום."),
  sixMixNote: loc(
    "Share of color material consumed, excluding developers and lighteners.",
    "חלקם של חומרי הצבע שנצרכו, ללא חמצנים וחומרי הבהרה.",
  ),
  sixShadeTitle: loc("Top consumed shades", "הגוונים הנצרכים ביותר"),
  sixChangeLead: loc("of clients changed colour direction.", "מהלקוחות שינו כיוון צבע."),
  sixChangeNote: loc(
    `${SIX_SALON_SAMPLE.journeyClients} journeys across ${SIX_SALON_SAMPLE.clientCount} clients.`,
    `${SIX_SALON_SAMPLE.journeyClients} מסעות צבע מתוך ${SIX_SALON_SAMPLE.clientCount} לקוחות.`,
  ),
  sixAudience: loc("One data layer. Two markets.", "שכבת דאטה אחת. שני שווקים."),
  sixForSalons: loc("For salons", "לסלונים"),
  sixForSalonsBody: loc(
    "Business intelligence: material cost, service economics, capacity and client retention.",
    "אינטליגנציה עסקית: עלות חומר, כלכלת שירות, קיבולת ושימור לקוחות.",
  ),
  sixForIndustry: loc("For the industry", "לתעשייה"),
  sixForIndustryBody: loc(
    "Product, demand and portfolio intelligence for manufacturers and distributors.",
    "אינטליגנציית מוצר, ביקוש ופורטפוליו ליצרנים ולמפיצים.",
  ),
  sixCaveat: loc(
    "Decision-support this data can enable as coverage grows. These are not products represented as live today.",
    "יישומי תמיכה בהחלטות שהדאטה הזה יכול לאפשר ככל שהכיסוי גדל. אלה אינם מוצרים שמוצגים כפעילים כיום.",
  ),
  capacityCallout: loc(
    "During processing, the stylist can take another client.",
    "בזמן העיבוד, הספר יכול לקבל לקוחה נוספת.",
  ),
  capacityReleased: loc(
    "60 minutes of real capacity released",
    "60 דקות של קיבולת אמיתית שהתפנתה",
  ),
  stylistFree: loc("Stylist free", "הספר פנוי"),
  withClient: loc("With client", "עם הלקוחה"),
  osEnvironment: loc(
    "Real Salon OS product, current pilot and development environment. All figures in USD.",
    "מוצר Salon OS אמיתי, סביבת פיילוט ופיתוח נוכחית. כל הסכומים בדולרים.",
  ),
  osMaterials: loc("Period material cost", "עלות חומרים לתקופה"),
  osOpex: loc("Operating expenses", "הוצאות תפעול"),
  osMaterialCol: loc("Avg material", "חומר ממוצע"),
  backersKicker: loc("Backed by", "מי שתמך"),
  backersLine: loc(
    "People who believed before this vision was obvious.",
    "אנשים שהאמינו עוד לפני שהחזון הזה היה מובן מאליו.",
  ),
  backersNote: loc(
    "Oren, Paul and Aquilo contribute expertise and are not investors in the company.",
    "אורן, פול ו-Aquilo תורמים מניסיונם ואינם משקיעים בחברה.",
  ),
  teamMasthead: loc("The team", "הצוות"),
} as const;

const CAPACITY_STAGES = [
  { name: loc("Application", "התחלה"), minutes: "45m", released: false },
  { name: loc("Processing", "זמן עיבוד"), minutes: "60m", released: true },
  { name: loc("Next step", "השלב הבא"), minutes: "30m", released: false },
  { name: loc("Finish", "סיום"), minutes: "45m", released: false },
] as const;

/**
 * The booking calendar is a real product surface, so it is presented as one
 * scaled plate. Cropping it would misrepresent the product; the natural box is
 * rendered in full and reduced slightly to fit the slide column.
 */
const BOOKING_DEMO = (() => {
  const renderWidth = 1192;
  const renderHeight = 560;
  const naturalHeight = 712;
  const scale = renderHeight / naturalHeight;
  return { renderWidth, renderHeight, naturalHeight, naturalWidth: renderWidth / scale, scale };
})();

const VANTAGE_ROWS = [
  { source: loc("Manufacturer / distributor", "יצרן / מפיץ"), sees: loc("What shipped", "מה נשלח"), spectra: false },
  { source: loc("POS", "קופה"), sees: loc("What sold", "מה נמכר"), spectra: false },
  { source: loc("Booking", "יומן"), sees: loc("What was scheduled", "מה נקבע"), spectra: false },
  { source: loc("Spectra", "Spectra"), sees: loc("What was actually done", "מה נעשה בפועל"), spectra: true },
] as const;

const COMPOUNDING = [
  loc("More salons", "עוד סלונים"),
  loc("More services", "עוד שירותים"),
  loc("More context", "עוד הקשר"),
  loc("More time", "עוד זמן"),
] as const;

const MOVEMENT_TERMS = [
  FINAL_PLATFORM.movements.capacity,
  FINAL_PLATFORM.movements.economics,
  FINAL_PLATFORM.movements.action,
] as const;

const EXPANSION_STAGES = [
  { value: "$960", label: "Color Intelligence" },
  { value: "$2,060", label: "Booking · CRM · POS" },
  { value: "$3,060", label: "Salon OS" },
  { value: "$4,860", label: "Salon AI" },
] as const;

/** Short category labels so the revenue chart never runs its axis together. */
const CHART_LABEL: Record<string, Localized> = {
  Color: loc("Color", "צבע"),
  Highlights: loc("Highlights", "גוונים"),
  Toner: loc("Toner", "טונר"),
  Straightening: loc("Straighten", "החלקה"),
  Treatment: loc("Treatment", "טיפול"),
};

const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

/* ----------------------------------------------------------------- 01 Cover */

const CoverSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={1}
    total={TOTAL}
    chapter={text(FINAL_META.edition, lang)}
    lang={lang}
    tone="ink"
    align="between"
  >
    <div>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 40 }}>
        <p
          dir="ltr"
          style={{
            fontFamily: displayFamily(lang),
            fontSize: 44,
            lineHeight: 1.14,
            letterSpacing: "0.14em",
            color: P.inkText,
          }}
        >
          SPECTRA
        </p>
        <p
          style={{
            fontSize: TYPE.kicker,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            color: "rgba(251,246,239,0.48)",
          }}
        >
          {text(FINAL_META.date, lang)}
          <span style={{ color: "rgba(217,185,129,0.45)", margin: "0 12px" }}>·</span>
          {text(FINAL_META.edition, lang)}
        </p>
      </div>
      <Hair dark strong style={{ marginTop: 20 }} />
    </div>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "0.53fr 0.47fr",
        gap: 72,
        alignItems: "center",
      }}
    >
      <div>
        <SlideTitle lang={lang} size="sub" italic accent dark>
          {text(FINAL_HERO.coverLine, lang)}
        </SlideTitle>
        <SlideKicker dark style={{ marginTop: 14, color: "rgba(251,246,239,0.46)" }}>
          {text(FINAL_HERO.role, lang)}
        </SlideKicker>
        <SlideTitle lang={lang} size="cover" dark style={{ marginTop: 32, maxWidth: "20ch" }}>
          {text(FINAL_HERO.title, lang)}
        </SlideTitle>
        <SlideLede dark style={{ marginTop: 30, maxWidth: 640 }}>
          {text(FINAL_HERO.statusLine, lang)}
        </SlideLede>
      </div>

      <figure style={{ border: "1px solid rgba(255,255,255,0.14)" }}>
        <img
          src={MEDIA.founders}
          alt={text(FINAL_HERO.founderAlt, lang)}
          width={1800}
          height={1012}
          style={{ display: "block", width: "100%", height: 452, objectFit: "cover", objectPosition: "50% 50%" }}
        />
      </figure>
    </div>

    <div>
      <Hair dark />
      <SlideKicker dark style={{ marginTop: 20 }}>
        {text(FINAL_HERO.proofLabel, lang)}
      </SlideKicker>
      <SlideDateline items={HERO_PROOF_METRICS} lang={lang} dark size={46} style={{ marginTop: 22 }} />
    </div>
  </PresentationSlide>
);

/* ---------------------------------------------------------------- 02 Origin */

const OriginSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={2}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.company.title, lang)}
    lang={lang}
    tone="paper"
    align="between"
  >
    <SlideChapterMark
      number={FINAL_CHAPTERS.company.number}
      title={text(FINAL_CHAPTERS.company.title, lang)}
      lang={lang}
    />

    <div style={{ display: "grid", gridTemplateColumns: "0.46fr 0.54fr", gap: 96, alignItems: "start" }}>
      <SlideTitle lang={lang} size="cover" style={{ maxWidth: "12ch" }}>
        {text(FINAL_LEDE.title, lang)}
      </SlideTitle>
      <div>
        <SlideLede>{FINAL_LEDE.paragraphs[lang][0]}</SlideLede>
        {FINAL_LEDE.paragraphs[lang].slice(1).map((paragraph) => (
          <SlideBody key={paragraph} style={{ marginTop: 22 }}>
            {paragraph}
          </SlideBody>
        ))}
      </div>
    </div>

    <figure style={{ marginInlineStart: "20%" }}>
      <Hair strong />
      <blockquote style={{ paddingBlock: 40 }}>
        <SlideTitle lang={lang} size="feature" italic style={{ maxWidth: "22ch" }}>
          {text(FINAL_LEDE.pull, lang)}
        </SlideTitle>
      </blockquote>
      <Hair />
    </figure>
  </PresentationSlide>
);

/* ------------------------------------------------------- 03 Color + adoption */

const ColorSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={3}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.built.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.colorBar,
      overlay: "linear-gradient(105deg,rgba(9,6,4,0.95),rgba(9,6,4,0.72))",
      opacity: 0.3,
    }}
    align="between"
  >
    <SlideChapterMark
      number={FINAL_CHAPTERS.built.number}
      title={text(FINAL_CHAPTERS.built.title, lang)}
      lang={lang}
      dark
    />

    <div style={{ display: "grid", gridTemplateColumns: "0.52fr 0.48fr", gap: 72, alignItems: "center" }}>
      <div>
        <SlideTitle lang={lang} size="feature" dark style={{ maxWidth: "15ch" }}>
          {text(FINAL_COLOR_WEDGE.title, lang)}
        </SlideTitle>
        <SlideTitle lang={lang} size="sub" italic accent dark style={{ marginTop: 26 }}>
          {text(FINAL_COLOR_WEDGE.cadence, lang)}
        </SlideTitle>
        <SlideBody dark style={{ marginTop: 22, maxWidth: 620 }}>
          {text(FINAL_COLOR_WEDGE.wedge, lang)}
        </SlideBody>
        <Hair dark style={{ marginTop: 30 }} />
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <SlideTerms items={FINAL_COLOR_WEDGE.terms} lang={lang} dark />
          <SlideCaption dark style={{ textAlign: "end", maxWidth: 260 }}>
            {text(FINAL_COLOR_WEDGE.close, lang)}
          </SlideCaption>
        </div>
      </div>

      <figure>
        <img
          src={MEDIA.colorBarComposition}
          alt={text(FINAL_HERO.visualAlt, lang)}
          width={1500}
          height={1178}
          style={{ display: "block", width: "100%", height: 470, objectFit: "contain" }}
        />
        <figcaption style={{ marginTop: 14 }}>
          <SlideCaption dark>{text(FINAL_COLOR_WEDGE.caption, lang)}</SlideCaption>
        </figcaption>
      </figure>
    </div>

    <div>
      <Hair dark strong />
      <div
        style={{
          marginTop: 26,
          display: "grid",
          gridTemplateColumns: "0.48fr 0.52fr",
          gap: 72,
          alignItems: "start",
        }}
      >
        <div>
          <SlideTitle lang={lang} size="chapter" dark style={{ maxWidth: "18ch" }}>
            {text(FINAL_ADOPTION.title, lang)}
          </SlideTitle>
          <SlideBody dark style={{ marginTop: 16, maxWidth: 480 }}>
            {text(FINAL_ADOPTION.body, lang)}
          </SlideBody>
          <SlideKicker dark style={{ marginTop: 20 }}>
            {text(FINAL_ADOPTION.strip, lang)}
          </SlideKicker>
        </div>

        <div>
          <ul
            dir="ltr"
            style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, listStyle: "none" }}
          >
            {CUSTOMERS.map((customer) => (
              <li key={customer.name}>
                <div style={{ aspectRatio: "1 / 1", overflow: "hidden", background: P.ink }}>
                  <img
                    src={customer.image}
                    alt=""
                    width={900}
                    height={900}
                    style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <p
                  style={{
                    marginTop: 10,
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(251,246,239,0.6)",
                  }}
                >
                  {customer.name}
                </p>
              </li>
            ))}
          </ul>
          <SlideCaption dark style={{ marginTop: 12 }}>
            {text(FINAL_ADOPTION.caption, lang)}
          </SlideCaption>
        </div>
      </div>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------- 04 Turning point */

const TurningPointSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={4}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.discovered.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.reception,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.9),rgba(9,6,4,0.96))",
      opacity: 0.22,
    }}
    align="center"
  >
    <SlideChapterMark
      number={FINAL_CHAPTERS.discovered.number}
      title={text(FINAL_CHAPTERS.discovered.title, lang)}
      lang={lang}
      dark
    />
    <SlideTitle lang={lang} size="cover" dark style={{ marginTop: 64, maxWidth: "22ch", fontSize: 124 }}>
      {text(FINAL_REVELATION.title, lang)}
    </SlideTitle>
    <SlideLede dark style={{ marginTop: 50, maxWidth: 980, fontSize: 30 }}>
      {text(FINAL_REVELATION.body, lang)}
    </SlideLede>
    <Hair dark style={{ marginTop: 54 }} />
    <SlideTerms items={FINAL_REVELATION.signals} lang={lang} dark accent style={{ marginTop: 30 }} />
    <SlideTitle lang={lang} size="chapter" italic dark style={{ marginTop: 44, color: "rgba(251,246,239,0.78)" }}>
      {text(FINAL_REVELATION.close, lang)}
    </SlideTitle>
  </PresentationSlide>
);

/* ------------------------------------------------------------ 05 Data layer */

const DataLayerSlide: React.FC<SlideProps> = ({ lang }) => {
  const cumulative = NETWORK_ACCUMULATION_SERIES.reduce<number[]>((totals, item) => {
    totals.push((totals[totals.length - 1] ?? 0) + item[1]);
    return totals;
  }, []);
  const peak = cumulative[cumulative.length - 1] ?? GLOBAL_USAGE_PROOF.services;
  const points = cumulative
    .map((value, index) => {
      const x = (index / (NETWORK_ACCUMULATION_SERIES.length - 1)) * 100;
      const y = 98 - (value / peak) * 92;
      return `${x},${y}`;
    })
    .join(" ");

  const scale: { value: string; label: Localized }[] = [
    { value: String(GLOBAL_USAGE_PROOF.monthsOfHistory), label: loc("Months of history", "חודשי היסטוריה") },
    { value: `${Math.floor(GLOBAL_USAGE_PROOF.visits / 1000)}K+`, label: loc("Client visits", "ביקורי לקוחות") },
    { value: String(GLOBAL_USAGE_PROOF.brands), label: loc("Brands observed", "מותגים שנצפו") },
  ];

  return (
    <PresentationSlide
      index={5}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.discovered.title, lang)}
      lang={lang}
      tone="paper"
      align="between"
    >
      <div style={{ display: "grid", gridTemplateColumns: "0.4fr 0.6fr", gap: 88, alignItems: "start" }}>
        <div>
          <SlideFigure
            value={`${Math.floor(GLOBAL_USAGE_PROOF.services / 1000)}K+`}
            lang={lang}
            size={150}
          />
          <SlideKicker style={{ marginTop: 20, color: P.accentDeep }}>
            {text(DECK_COPY.dataEvents, lang)}
          </SlideKicker>
          <Hair strong style={{ marginTop: 30 }} />
          <SlideTitle lang={lang} size="chapter" italic style={{ marginTop: 26, maxWidth: "18ch" }}>
            {text(DECK_COPY.dataPull, lang)}
          </SlideTitle>
        </div>
        <div>
          <SlideTitle lang={lang} size="feature" style={{ maxWidth: "16ch" }}>
            {text(DECK_COPY.dataHeadline, lang)}
          </SlideTitle>
          <SlideLede style={{ marginTop: 24, maxWidth: 820 }}>{text(DECK_COPY.dataLede, lang)}</SlideLede>
          <SlideDateline items={scale} lang={lang} size={38} style={{ marginTop: 40 }} />
        </div>
      </div>

      <figure>
        <div
          dir="ltr"
          role="img"
          aria-label={
            lang === "he"
              ? "אירועי שירות מצטברים מינואר 2023 עד יוני 2026"
              : "Cumulative measured service events from January 2023 to June 2026"
          }
          style={{ position: "relative", height: 178, borderBottom: "1px solid rgba(43,34,27,0.28)" }}
        >
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
          >
            <polygon points={`${points} 100,100 0,100`} fill={P.accent} fillOpacity="0.1" />
            <polyline
              points={points}
              fill="none"
              stroke={P.accent}
              strokeWidth="1.6"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </div>
        <div
          dir="ltr"
          style={{
            position: "relative",
            marginTop: 10,
            height: 20,
            fontSize: TYPE.fine,
            fontVariantNumeric: "tabular-nums",
            color: "rgba(43,34,27,0.4)",
          }}
        >
          <span style={{ position: "absolute", left: 0 }}>Jan 2023</span>
          <span style={{ position: "absolute", left: "58.5%", transform: "translateX(-50%)" }}>Jan 2025</span>
          <span style={{ position: "absolute", right: 0 }}>Jun 2026</span>
        </div>
        <figcaption style={{ marginTop: 10 }}>
          <SlideCaption>{text(DECK_COPY.dataChartCaption, lang)}</SlideCaption>
        </figcaption>
      </figure>

      <div style={{ display: "grid", gridTemplateColumns: "0.62fr 0.38fr", gap: 88, alignItems: "start" }}>
        <dl>
          <Hair strong />
          {VANTAGE_ROWS.map((row) => (
            <div
              key={row.source.en}
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 32,
                paddingBlock: 14,
                borderBottom: `1px solid ${row.spectra ? "rgba(43,34,27,0.28)" : "rgba(43,34,27,0.12)"}`,
              }}
            >
              <dt
                style={{
                  fontSize: TYPE.kicker,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: row.spectra ? P.accentDeep : "rgba(43,34,27,0.44)",
                }}
              >
                {text(row.source, lang)}
              </dt>
              <dd
                style={
                  row.spectra
                    ? {
                        fontFamily: displayFamily(lang),
                        fontSize: 30,
                        lineHeight: 1.1,
                        color: P.text,
                      }
                    : { fontSize: TYPE.body, fontWeight: 300, color: "rgba(43,34,27,0.6)" }
                }
              >
                {text(row.sees, lang)}
              </dd>
            </div>
          ))}
        </dl>

        <div style={{ borderInlineStart: "1px solid rgba(43,34,27,0.12)", paddingInlineStart: 56 }}>
          <SlideTerms items={COMPOUNDING} lang={lang} />
          <SlideTitle lang={lang} size="chapter" italic accent style={{ marginTop: 22 }}>
            {text(DECK_COPY.compoundClose, lang)}
          </SlideTitle>
        </div>
      </div>
    </PresentationSlide>
  );
};

/* ------------------------------------------------------------- 06 Six salons */

const SixSalonSlide: React.FC<SlideProps> = ({ lang }) => {
  const brunette = SIX_SALON_SAMPLE.families[0];
  const shades = SIX_SALON_SAMPLE.products.slice(0, 5);
  const maxKg = shades[0].kg;
  const kpis = SIX_SALON_SAMPLE.totals.map((metric, index) => ({
    value: index === 0 ? metric.value.replace(/\s*salons$/i, "") : metric.value,
    label: [
      loc("Salons", "סלונים"),
      loc("Services", "שירותים"),
      loc("Clients", "לקוחות"),
      loc("Material", "חומר"),
    ][index],
  }));

  return (
    <PresentationSlide
      index={6}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.data.title, lang)}
      lang={lang}
      tone="warm"
      align="between"
    >
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 40 }}>
        <SlideChapterMark
          number={FINAL_CHAPTERS.data.number}
          title={text(FINAL_CHAPTERS.data.title, lang)}
          lang={lang}
        />
        <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>{text(DECK_COPY.sixKicker, lang)}</SlideKicker>
      </div>

      <div>
        <div style={{ display: "grid", gridTemplateColumns: "0.32fr 0.68fr", gap: 80, alignItems: "baseline" }}>
          <SlideFigure value={`${brunette.value}%`} lang={lang} size={148} color="#7b5036" />
          <SlideTitle lang={lang} size="chapter" style={{ maxWidth: "26ch" }}>
            {text(DECK_COPY.sixLead, lang)}
          </SlideTitle>
        </div>

        <div
          dir="ltr"
          role="img"
          aria-label={SIX_SALON_SAMPLE.families
            .map((family) => `${lang === "he" ? family.he : family.name}: ${family.value}%`)
            .join(", ")}
          style={{ marginTop: 30, display: "flex", height: 14, overflow: "hidden" }}
        >
          {SIX_SALON_SAMPLE.families.map((family) => (
            <div key={family.name} style={{ width: `${family.value}%`, background: family.color }} />
          ))}
        </div>
        <div
          style={{
            marginTop: 12,
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 28px",
            fontSize: TYPE.fine,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            color: "rgba(43,34,27,0.55)",
          }}
        >
          {SIX_SALON_SAMPLE.families.map((family) => (
            <span key={family.name} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span aria-hidden="true" style={{ width: 9, height: 9, background: family.color }} />
              {lang === "he" ? family.he : family.name}
              <span dir="ltr" style={{ fontVariantNumeric: "tabular-nums", color: "rgba(43,34,27,0.75)" }}>
                {family.value}%
              </span>
            </span>
          ))}
        </div>
        <SlideCaption style={{ marginTop: 10 }}>{text(DECK_COPY.sixMixNote, lang)}</SlideCaption>
      </div>

      <div>
        <Hair strong />
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <SlideDateline items={kpis} lang={lang} size={34} />
          <SlideCaption style={{ maxWidth: 420, textAlign: "end" }}>
            {text(SIX_SALON_SAMPLE.caveat, lang)}
          </SlideCaption>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.63fr 0.37fr", gap: 88, alignItems: "start" }}>
        <div>
          <SlideKicker>{text(DECK_COPY.sixShadeTitle, lang)}</SlideKicker>
          <ol style={{ marginTop: 16, listStyle: "none" }}>
            {shades.map((product) => (
              <li
                key={product.name}
                dir="ltr"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 20,
                  paddingBlock: 5,
                  borderTop: "1px solid rgba(43,34,27,0.12)",
                }}
              >
                <span
                  style={{
                    width: 170,
                    flexShrink: 0,
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(43,34,27,0.74)",
                  }}
                >
                  {product.name}
                </span>
                <div
                  role="progressbar"
                  aria-label={`${product.name}: ${product.kg.toFixed(1)} kg`}
                  aria-valuemin={0}
                  aria-valuemax={maxKg}
                  aria-valuenow={product.kg}
                  style={{ flex: 1, height: 30, background: "rgba(43,34,27,0.06)" }}
                >
                  <div style={{ height: "100%", width: `${(product.kg / maxKg) * 100}%`, background: product.tone }} />
                </div>
                <span
                  style={{
                    width: 92,
                    flexShrink: 0,
                    textAlign: "end",
                    fontSize: TYPE.body,
                    fontVariantNumeric: "tabular-nums",
                    color: P.text,
                  }}
                >
                  {product.kg.toFixed(1)} kg
                </span>
              </li>
            ))}
          </ol>
          <Hair />
        </div>

        <div style={{ borderInlineStart: "1px solid rgba(43,34,27,0.12)", paddingInlineStart: 64 }}>
          <SlideFigure value={SIX_SALON_SAMPLE.journeyShare} lang={lang} size={92} color={P.accent} />
          <SlideTitle lang={lang} size="sub" style={{ marginTop: 22, maxWidth: "20ch" }}>
            {text(DECK_COPY.sixChangeLead, lang)}
          </SlideTitle>
          <SlideCaption style={{ marginTop: 14 }}>{text(DECK_COPY.sixChangeNote, lang)}</SlideCaption>
        </div>
      </div>

      <div>
        <Hair strong />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr 1fr",
            gap: 56,
            alignItems: "start",
            paddingBlock: 18,
          }}
        >
          <SlideTitle lang={lang} size="sub" style={{ maxWidth: "12ch" }}>
            {text(DECK_COPY.sixAudience, lang)}
          </SlideTitle>
          <div>
            <SlideKicker>{text(DECK_COPY.sixForSalons, lang)}</SlideKicker>
            <SlideBody style={{ marginTop: 12 }}>{text(DECK_COPY.sixForSalonsBody, lang)}</SlideBody>
          </div>
          <div style={{ borderInlineStart: "1px solid rgba(43,34,27,0.12)", paddingInlineStart: 48 }}>
            <SlideKicker>{text(DECK_COPY.sixForIndustry, lang)}</SlideKicker>
            <SlideBody style={{ marginTop: 12 }}>{text(DECK_COPY.sixForIndustryBody, lang)}</SlideBody>
          </div>
        </div>
        <Hair strong />
        <SlideFine style={{ marginTop: 12 }}>{text(DECK_COPY.sixCaveat, lang)}</SlideFine>
      </div>
    </PresentationSlide>
  );
};

/* -------------------------------------------------- 07 Decision and booking */

const DecisionBookingSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={7}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.platform.title, lang)}
    lang={lang}
    tone="ink"
    align="between"
  >
    <div style={{ display: "grid", gridTemplateColumns: "0.63fr 0.37fr", gap: 80, alignItems: "start" }}>
      <div>
        <SlideChapterMark
          number={FINAL_CHAPTERS.platform.number}
          title={text(FINAL_CHAPTERS.platform.title, lang)}
          lang={lang}
          dark
        />
        <SlideTitle lang={lang} size="feature" accent dark style={{ marginTop: 22, maxWidth: "30ch" }}>
          {text(FINAL_DECISION.close, lang)}
        </SlideTitle>
      </div>
      <div>
        <SlideLede dark>{text(FINAL_PROBLEM.title, lang)}</SlideLede>
        <SlideBody dark style={{ marginTop: 14 }}>
          {text(FINAL_DECISION.body, lang)}
        </SlideBody>
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "0.72fr 0.28fr", gap: 56, alignItems: "start" }}>
      {/* The whole product surface stays visible: scaled as one plate, never cropped. */}
      <figure>
        <div style={{ width: BOOKING_DEMO.renderWidth, height: BOOKING_DEMO.renderHeight }}>
          <div
            style={{
              display: "flex",
              width: BOOKING_DEMO.naturalWidth,
              height: BOOKING_DEMO.naturalHeight,
              transform: `scale(${BOOKING_DEMO.scale})`,
              transformOrigin: "top left",
            }}
          >
            <BrowserFrame>
              <CalendarGrid />
            </BrowserFrame>
          </div>
        </div>
        <figcaption style={{ marginTop: 16 }}>
          <SlideCaption dark>{text(FINAL_BOOKING.caption, lang)}</SlideCaption>
        </figcaption>
      </figure>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <span
            dir="ltr"
            style={{
              fontSize: TYPE.kicker,
              fontWeight: 600,
              lineHeight: 1.3,
              letterSpacing: "0.2em",
              fontVariantNumeric: "tabular-nums",
              color: P.accentDark,
            }}
          >
            01
          </span>
          <SlideKicker dark style={{ color: "rgba(251,246,239,0.6)" }}>
            {text(FINAL_PLATFORM.movements.capacity, lang)}
          </SlideKicker>
        </div>
        <SlideTitle lang={lang} size="sub" dark style={{ marginTop: 14 }}>
          {text(FINAL_BOOKING.title, lang)}
        </SlideTitle>

        <ol dir="ltr" style={{ marginTop: 20, listStyle: "none" }}>
          {CAPACITY_STAGES.map((stage) => (
            <li
              key={stage.name.en}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 16,
                paddingBlock: 10,
                paddingInlineStart: stage.released ? 16 : 0,
                borderTop: "1px solid rgba(255,255,255,0.14)",
                background: stage.released ? "rgba(159,201,168,0.15)" : "transparent",
              }}
            >
              {stage.released && (
                <span
                  aria-hidden="true"
                  style={{ position: "absolute", inset: "0 auto 0 0", width: 3, background: "#9fc9a8" }}
                />
              )}
              <span
                dir={lang === "he" ? "rtl" : "ltr"}
                style={{
                  fontSize: TYPE.fine,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: stage.released ? "#b9e2c1" : "rgba(251,246,239,0.48)",
                }}
              >
                {text(stage.name, lang)}
              </span>
              <span style={{ display: "flex", alignItems: "baseline", gap: 14, flexShrink: 0 }}>
                <span
                  dir={lang === "he" ? "rtl" : "ltr"}
                  style={{
                    fontSize: TYPE.fine,
                    fontWeight: stage.released ? 600 : 300,
                    color: stage.released ? "#b9e2c1" : "rgba(251,246,239,0.32)",
                  }}
                >
                  {stage.released ? text(DECK_COPY.stylistFree, lang) : text(DECK_COPY.withClient, lang)}
                </span>
                <span
                  style={{
                    minWidth: 54,
                    textAlign: "end",
                    fontVariantNumeric: "tabular-nums",
                    fontSize: stage.released ? 24 : TYPE.caption,
                    fontWeight: stage.released ? 600 : 300,
                    color: stage.released ? "#b9e2c1" : "rgba(251,246,239,0.34)",
                  }}
                >
                  {stage.minutes}
                </span>
              </span>
            </li>
          ))}
        </ol>

        <div
          dir={lang === "he" ? "rtl" : "ltr"}
          style={{
            marginTop: 18,
            padding: "16px 20px",
            background: "rgba(159,201,168,0.13)",
            borderTop: "3px solid #9fc9a8",
          }}
        >
          <SlideTitle lang={lang} size="sub" dark style={{ color: "#d9f0de" }}>
            {text(DECK_COPY.capacityCallout, lang)}
          </SlideTitle>
          <SlideKicker dark style={{ marginTop: 12, color: "rgba(159,201,168,0.78)" }}>
            {text(DECK_COPY.capacityReleased, lang)}
          </SlideKicker>
        </div>
      </div>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------- 08 Salon economics */

const SalonEconomicsSlide: React.FC<SlideProps> = ({ lang }) => {
  const crmLang: CrmLang = lang;
  const r = crmTranslations[crmLang].analytics.report;
  const proof = SALON_OS_PROOF;
  const maxCategory = proof.revenueByCategory.reduce((max, item) => Math.max(max, item.revenue), 0);

  const economics = [
    { label: r.bookedServiceValue, value: formatUsd(proof.bookedServiceValue) },
    { label: text(DECK_COPY.osMaterials, lang), value: formatUsd(proof.estimatedMaterialCost) },
    { label: text(DECK_COPY.osOpex, lang), value: formatUsd(proof.operatingOverhead) },
    { label: r.netProfit, value: formatUsd(proof.netProfit), accent: true },
  ];

  const scope =
    lang === "he"
      ? `סלון פיילוט אחד, ${proof.periodMonths} חודשים של הכלכלה התפעולית שלו, ולא הכנסות של Spectra.`
      : `One pilot salon, ${proof.periodMonths} months of its own operating economics, not Spectra revenue.`;

  return (
    <PresentationSlide
      index={8}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.platform.title, lang)}
      lang={lang}
      tone="paper"
      align="between"
    >
      <div style={{ display: "grid", gridTemplateColumns: "0.58fr 0.42fr", gap: 88, alignItems: "end" }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
            <span
              dir="ltr"
              style={{
                fontSize: TYPE.kicker,
                fontWeight: 600,
                letterSpacing: "0.2em",
                fontVariantNumeric: "tabular-nums",
                color: P.accent,
              }}
            >
              02
            </span>
            <SlideKicker style={{ color: "rgba(43,34,27,0.55)" }}>
              {text(FINAL_PLATFORM.movements.economics, lang)}
            </SlideKicker>
          </div>
          <SlideTitle lang={lang} size="feature" style={{ marginTop: 24, maxWidth: "22ch" }}>
            {text(FINAL_SALON_OS.title, lang)}
          </SlideTitle>
        </div>
        <div>
          <SlideCaption style={{ color: P.accentDeep, fontSize: TYPE.caption }}>{scope}</SlideCaption>
          <SlideCaption style={{ marginTop: 10 }}>{text(DECK_COPY.osEnvironment, lang)}</SlideCaption>
        </div>
      </div>

      <div>
        <Hair strong />
        <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
          {economics.map((item, index) => (
            <div
              key={item.label}
              style={{
                padding: index === 0 ? "20px 32px 26px 0" : "20px 32px 26px",
                borderInlineStart: index === 0 ? "none" : "1px solid rgba(43,34,27,0.12)",
              }}
            >
              <p
                dir={lang === "he" ? "rtl" : "ltr"}
                style={{
                  fontSize: TYPE.fine,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  color: "rgba(43,34,27,0.46)",
                }}
              >
                {item.label}
              </p>
              <p
                style={{
                  marginTop: 16,
                  fontFamily: displayFamily(lang),
                  fontSize: 52,
                  lineHeight: 1.14,
                  letterSpacing: "-0.03em",
                  fontVariantNumeric: "tabular-nums",
                  color: item.accent ? P.accentDeep : P.text,
                }}
              >
                {item.value}
              </p>
            </div>
          ))}
        </div>
        <Hair strong />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.46fr 0.54fr", gap: 80, alignItems: "start" }}>
        <div>
          <SlideKicker>{r.revenueByCategory}</SlideKicker>
          <div dir="ltr" style={{ marginTop: 24, display: "flex", alignItems: "flex-end", gap: 14 }}>
            {proof.revenueByCategory.map((item) => (
              <div key={item.key} style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    fontVariantNumeric: "tabular-nums",
                    color: "rgba(43,34,27,0.62)",
                  }}
                >
                  {formatUsd(item.revenue)}
                </p>
                <div
                  style={{
                    marginTop: 12,
                    height: Math.max(10, (item.revenue / Math.max(1, maxCategory)) * 124),
                    background: CATEGORY_COLORS[item.key] || "#64748B",
                  }}
                />
                <p
                  dir={lang === "he" ? "rtl" : "ltr"}
                  style={{
                    marginTop: 12,
                    paddingTop: 10,
                    borderTop: "1px solid rgba(43,34,27,0.12)",
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "rgba(43,34,27,0.55)",
                  }}
                >
                  {CHART_LABEL[item.key] ? text(CHART_LABEL[item.key], lang) : item.key}
                </p>
              </div>
            ))}
          </div>
          <SlideCaption style={{ marginTop: 16 }}>{r.estimated}</SlideCaption>
        </div>

        <div>
          <SlideKicker>{r.allServices}</SlideKicker>
          <table style={{ marginTop: 22, width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(43,34,27,0.28)" }}>
                {[r.service, r.revenue, r.averagePriceShort, text(DECK_COPY.osMaterialCol, lang), r.duration].map(
                  (heading, index) => (
                    <th
                      key={heading}
                      style={{
                        paddingBottom: 12,
                        textAlign: index === 0 ? "start" : "end",
                        fontSize: TYPE.fine,
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        color: index === 3 ? P.accentDeep : "rgba(43,34,27,0.46)",
                      }}
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {proof.serviceRows.map((service) => (
                <tr key={service.id} style={{ borderBottom: "1px solid rgba(43,34,27,0.1)" }}>
                  <td style={{ paddingBlock: 14, fontSize: TYPE.body, fontWeight: 300, color: P.text }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 4,
                          height: 18,
                          flexShrink: 0,
                          backgroundColor: CATEGORY_COLORS[service.category] || "#64748B",
                        }}
                      />
                      {displayServiceName(service.name, lang === "he")}
                    </span>
                  </td>
                  <td
                    dir="ltr"
                    style={{
                      paddingBlock: 14,
                      textAlign: "end",
                      fontSize: TYPE.body,
                      fontVariantNumeric: "tabular-nums",
                      color: "rgba(43,34,27,0.72)",
                    }}
                  >
                    {formatUsd(service.revenue)}
                  </td>
                  <td
                    dir="ltr"
                    style={{
                      paddingBlock: 14,
                      textAlign: "end",
                      fontSize: TYPE.body,
                      fontVariantNumeric: "tabular-nums",
                      color: "rgba(43,34,27,0.72)",
                    }}
                  >
                    {formatUsd(service.avgPrice)}
                  </td>
                  <td
                    dir="ltr"
                    style={{
                      paddingBlock: 14,
                      textAlign: "end",
                      fontSize: TYPE.body,
                      fontVariantNumeric: "tabular-nums",
                      color: P.accentDeep,
                    }}
                  >
                    {formatUsd(service.avgMaterialCost)}
                  </td>
                  <td
                    style={{
                      paddingBlock: 14,
                      textAlign: "end",
                      fontSize: TYPE.body,
                      fontVariantNumeric: "tabular-nums",
                      color: "rgba(43,34,27,0.72)",
                    }}
                  >
                    {service.avgDuration} {lang === "he" ? "דק׳" : "min"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <SlideTitle lang={lang} size="chapter" italic accent style={{ maxWidth: "46ch", fontSize: 50 }}>
        {text(FINAL_SALON_OS.pull, lang)}
      </SlideTitle>
    </PresentationSlide>
  );
};

/* ---------------------------------------------------------- 09 Owner mobile */

/** Trims the outer salon air so the device reads large without re-encoding. */
const OWNER_CROP = { x0: 0.135, width: 0.73, y0: 0.05, height: 0.9 } as const;
const OWNER_PLATE_HEIGHT = 764;
const OWNER_PLATE_WIDTH = Math.round(
  OWNER_PLATE_HEIGHT * ((OWNER_CROP.width * 1122) / (OWNER_CROP.height * 1402)),
);

const OwnerMobileSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={9}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.platform.title, lang)}
    lang={lang}
    tone="warm"
    align="center"
  >
    <div style={{ display: "grid", gridTemplateColumns: "0.52fr 0.48fr", gap: 88, alignItems: "center" }}>
      <div>
        <SlideKicker>{text(FINAL_OWNER_APP.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="feature" style={{ marginTop: 26, maxWidth: "14ch" }}>
          {text(FINAL_OWNER_APP.title, lang)}
        </SlideTitle>
        <SlideLede style={{ marginTop: 30, maxWidth: 600 }}>{text(FINAL_OWNER_APP.body, lang)}</SlideLede>

        <Hair strong style={{ marginTop: 40 }} />
        <SlideTitle lang={lang} size="chapter" italic style={{ paddingBlock: 26, maxWidth: "20ch" }}>
          {text(FINAL_OWNER_APP.pull, lang)}
        </SlideTitle>
        <Hair />

        <SlideTerms items={FINAL_MOBILE.roles} lang={lang} style={{ marginTop: 30 }} />
        <SlideBody style={{ marginTop: 10 }}>{text(FINAL_MOBILE.line, lang)}</SlideBody>
        <SlideCaption style={{ marginTop: 26 }}>{text(FINAL_OWNER_APP.status, lang)}</SlideCaption>
      </div>

      <figure style={{ marginInlineStart: "auto" }}>
        {/* A hairline, not a soft shadow: large blurred shadows rasterize into
            the PDF as a hard grey block behind the plate. */}
        <div
          style={{
            position: "relative",
            width: OWNER_PLATE_WIDTH,
            height: OWNER_PLATE_HEIGHT,
            overflow: "hidden",
            border: "1px solid rgba(43,34,27,0.16)",
          }}
        >
          <img
            src={MEDIA.ownerApp}
            width={1122}
            height={1402}
            alt={
              lang === "he"
                ? "מסך Owner Home מתוכנן של Salon AI באייפון"
                : "Designed Salon AI Owner Home on iPhone"
            }
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: `${(100 / OWNER_CROP.width).toFixed(4)}%`,
              maxWidth: "none",
              height: "auto",
              transform: `translate(${(-OWNER_CROP.x0 * 100).toFixed(2)}%, ${(-OWNER_CROP.y0 * 100).toFixed(2)}%)`,
            }}
          />
        </div>
        <figcaption style={{ marginTop: 20, width: OWNER_PLATE_WIDTH }}>
          <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>
            {text(FINAL_OWNER_APP.figureLabel, lang)}
          </SlideKicker>
          <SlideCaption style={{ marginTop: 10 }}>{text(FINAL_OWNER_APP.caption, lang)}</SlideCaption>
        </figcaption>
      </figure>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------- 10 Client mobile */

/** Source is 1448 x 1086, so the plate is an exact 4:3 with no letterboxing. */
const CLIENT_PLATE_WIDTH = 828;

const ClientMobileSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={10}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.platform.title, lang)}
    lang={lang}
    tone="paper"
    align="between"
  >
    <SlideTitle lang={lang} size="sub" italic accent style={{ maxWidth: "40ch" }}>
      {text(FINAL_CLIENT_APP.transition, lang)}
    </SlideTitle>

    <div style={{ display: "grid", gridTemplateColumns: "0.38fr 0.62fr", gap: 80, alignItems: "center" }}>
      <div>
        <SlideKicker>{text(FINAL_CLIENT_APP.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="chapter" style={{ marginTop: 24, maxWidth: "20ch" }}>
          {text(FINAL_CLIENT_APP.title, lang)}
        </SlideTitle>
        <SlideBody style={{ marginTop: 24, maxWidth: 520 }}>{text(FINAL_CLIENT_APP.body, lang)}</SlideBody>
        <Hair style={{ marginTop: 32 }} />
        <SlideCaption style={{ marginTop: 20 }}>{text(FINAL_CLIENT_APP.status, lang)}</SlideCaption>
        <SlideCaption style={{ marginTop: 10, maxWidth: 480 }}>
          {text(FINAL_CLIENT_APP.dataNote, lang)}
        </SlideCaption>
      </div>

      {/* Sized to the source aspect ratio so the plate never letterboxes. */}
      <figure style={{ marginInlineStart: "auto" }}>
        <div style={{ border: "1px solid rgba(43,34,27,0.12)" }}>
          <img
            src={MEDIA.clientApp}
            width={1448}
            height={1086}
            alt={
              lang === "he"
                ? "שני מסכי iPhone מתוכננים ללקוחה: קביעת תור עם AI והמלצות מוצר מותאמות"
                : "Two designed client iPhone screens: AI appointment booking and personalized retail"
            }
            style={{
              display: "block",
              width: CLIENT_PLATE_WIDTH,
              height: Math.round((CLIENT_PLATE_WIDTH * 1086) / 1448),
            }}
          />
        </div>
        <figcaption
          style={{
            marginTop: 16,
            width: CLIENT_PLATE_WIDTH,
            display: "flex",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>
            {text(FINAL_CLIENT_APP.bookLabel, lang)}
          </SlideKicker>
          <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>
            {text(FINAL_CLIENT_APP.shopLabel, lang)}
          </SlideKicker>
        </figcaption>
      </figure>
    </div>
  </PresentationSlide>
);

/* ------------------------------------------------------------- 11 AI bridge */

const BridgeSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={11}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.platform.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.shelves,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.93),rgba(9,6,4,0.97))",
      opacity: 0.18,
    }}
    align="center"
  >
    <div style={{ textAlign: "center" }}>
      <SlideKicker dark>{text(FINAL_PLATFORM.intro, lang)}</SlideKicker>
      <Hair dark style={{ margin: "44px auto 0", width: 120 }} />
      <SlideTitle
        lang={lang}
        size="cover"
        italic
        accent
        dark
        style={{ margin: "56px auto 0", maxWidth: "26ch", fontSize: 96 }}
      >
        {text(FINAL_SALON_AI.bridge, lang)}
      </SlideTitle>
      <Hair dark style={{ margin: "56px auto 0", width: 120 }} />
      <SlideTerms items={MOVEMENT_TERMS} lang={lang} dark style={{ marginTop: 40, justifyContent: "center" }} />
    </div>
  </PresentationSlide>
);

/* ----------------------------------------------------------- 12 Salon AI */

const SalonAiSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={12}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.platform.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.shelves,
      overlay: "linear-gradient(110deg,rgba(9,6,4,0.96),rgba(9,6,4,0.76))",
      opacity: 0.22,
    }}
    align="center"
  >
    <div style={{ display: "grid", gridTemplateColumns: "0.6fr 0.4fr", gap: 88, alignItems: "center" }}>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20 }}>
          <span
            dir="ltr"
            style={{
              fontSize: TYPE.kicker,
              fontWeight: 600,
              letterSpacing: "0.2em",
              fontVariantNumeric: "tabular-nums",
              color: P.accentDark,
            }}
          >
            03
          </span>
          <SlideKicker dark style={{ color: "rgba(251,246,239,0.6)" }}>
            {text(FINAL_PLATFORM.movements.action, lang)}
          </SlideKicker>
        </div>

        <SlideKicker dark style={{ marginTop: 30 }}>
          {text(FINAL_SALON_AI.kicker, lang)}
        </SlideKicker>
        <SlideTitle lang={lang} size="cover" dark style={{ marginTop: 18, fontSize: 124 }}>
          {text(FINAL_SALON_AI.title, lang)}
        </SlideTitle>
        <SlideLede dark style={{ marginTop: 26, maxWidth: 720 }}>
          {text(FINAL_SALON_AI.support, lang)}
        </SlideLede>

        <Hair dark style={{ marginTop: 30 }} />
        <SlideTerms items={FINAL_SALON_AI.contextTerms} lang={lang} dark accent style={{ marginTop: 20 }} />

        <div style={{ marginTop: 26 }}>
          <SlideTerms items={FINAL_SALON_AI.flow} lang={lang} dark style={{ opacity: 0.72 }} />
        </div>

        <dl style={{ marginTop: 20 }}>
          {FINAL_SALON_AI.examples.map((example) => (
            <div
              key={example.signal.en}
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 28,
                paddingBlock: 14,
                borderTop: "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <dt style={{ fontSize: TYPE.body, fontWeight: 300, color: "rgba(251,246,239,0.55)" }}>
                {text(example.signal, lang)}
              </dt>
              <dd
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 16,
                  fontSize: TYPE.body,
                  fontWeight: 300,
                  color: "rgba(251,246,239,0.88)",
                }}
              >
                <SlideArrow lang={lang} dark size={20} />
                {text(example.action, lang)}
              </dd>
            </div>
          ))}
        </dl>

        <div style={{ marginTop: 22, paddingTop: 18, borderTop: "1px solid rgba(255,255,255,0.14)" }}>
          <SlideTerms items={FINAL_SALON_AI.agents} lang={lang} dark />
          <SlideCaption dark style={{ marginTop: 12 }}>
            {text(FINAL_SALON_AI.agentsSupport, lang)}
          </SlideCaption>
        </div>
      </div>

      <figure style={{ marginInlineStart: "auto" }}>
        <div style={{ border: "1px solid rgba(255,255,255,0.14)" }}>
          <img
            src={MEDIA.salonAiPhone}
            width={960}
            height={1200}
            alt={
              lang === "he"
                ? "כיוון עיצובי לאפליקציית Salon AI בנייד"
                : "Designed Salon AI mobile application direction"
            }
            style={{ display: "block", width: 508, height: 635, objectFit: "cover" }}
          />
        </div>
        <figcaption style={{ marginTop: 16, width: 508 }}>
          <SlideCaption dark>{text(FINAL_SALON_AI.caption, lang)}</SlideCaption>
        </figcaption>
      </figure>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------- 13 Opportunity */

const OpportunitySlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={13}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.opportunity.title, lang)}
    lang={lang}
    tone="warm"
    align="between"
  >
    <div>
      <SlideChapterMark
        number={FINAL_CHAPTERS.opportunity.number}
        title={text(FINAL_CHAPTERS.opportunity.title, lang)}
        lang={lang}
      />
      <SlideTitle lang={lang} size="feature" style={{ marginTop: 26, maxWidth: "32ch" }}>
        {text(FINAL_INDUSTRY.title, lang)}
      </SlideTitle>
    </div>

    <SlideTitle lang={lang} size="chapter" italic accent style={{ fontSize: 60 }}>
      {text(FINAL_INDUSTRY.scale, lang)}
    </SlideTitle>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "stretch" }}>
        <div style={{ paddingBlock: 30, paddingInlineEnd: 72 }}>
          <SlideKicker>{text(FINAL_INDUSTRY.salons, lang)}</SlideKicker>
          <SlideTitle lang={lang} size="chapter" style={{ marginTop: 24, maxWidth: "27ch" }}>
            {text(FINAL_INDUSTRY.salonsOffer, lang)}
          </SlideTitle>
        </div>

        <div
          style={{
            display: "grid",
            placeItems: "center",
            paddingInline: 64,
            paddingBlock: 34,
            background: P.ink,
            color: P.inkText,
          }}
        >
          <p
            style={{
              fontFamily: displayFamily(lang),
              fontSize: 44,
              lineHeight: 1.12,
              maxWidth: "13ch",
              textAlign: "center",
              color: P.accentDark,
            }}
          >
            {text(FINAL_INDUSTRY.center, lang)}
          </p>
        </div>

        <div style={{ paddingBlock: 30, paddingInlineStart: 72 }}>
          <SlideKicker>{text(FINAL_INDUSTRY.industry, lang)}</SlideKicker>
          <SlideTitle lang={lang} size="chapter" style={{ marginTop: 24, maxWidth: "29ch" }}>
            {text(FINAL_INDUSTRY.industryActors, lang)}
          </SlideTitle>
        </div>
      </div>
      <Hair strong />
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "0.62fr 0.38fr", gap: 88, alignItems: "start" }}>
      <SlideBody style={{ maxWidth: 900 }}>{text(FINAL_INDUSTRY.support, lang)}</SlideBody>
      <SlideFine>{text(FINAL_INDUSTRY.caveat, lang)}</SlideFine>
    </div>
  </PresentationSlide>
);

/* ------------------------------------------------------ 14 Team and backers */

const TeamSlide: React.FC<SlideProps> = ({ lang }) => {
  const founders = FOUNDER_MEDIA.map((media) => ({
    media,
    member: CORE_TEAM.find((person) => person.name.en === media.key)!,
  }));
  const masthead = [
    ...CORE_TEAM.filter((person) => !FOUNDER_MEDIA.some((media) => media.key === person.name.en)),
    TEAM_ADVISOR,
  ];

  return (
    <PresentationSlide
      index={14}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.opportunity.title, lang)}
      lang={lang}
      tone="paper"
      align="between"
    >
      <div>
        <SlideKicker>{text(FINAL_PEOPLE.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="chapter" style={{ marginTop: 22, maxWidth: "34ch" }}>
          {text(FINAL_PEOPLE.title, lang)}
        </SlideTitle>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.46fr 0.54fr", gap: 96, alignItems: "start" }}>
        <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, listStyle: "none" }}>
          {founders.map(({ media, member }) => (
            <li key={media.key}>
              <figure>
                <div
                  style={{
                    aspectRatio: "1 / 1",
                    overflow: "hidden",
                    border: "1px solid rgba(43,34,27,0.12)",
                    background: P.ink,
                  }}
                >
                  <img
                    src={media.src}
                    alt={
                      lang === "he"
                        ? `דיוקן של ${member.name.he}, ${member.role.he}`
                        : `Portrait of ${member.name.en}, ${member.role.en}`
                    }
                    style={{
                      display: "block",
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: media.objectPosition,
                    }}
                  />
                </div>
                <figcaption style={{ marginTop: 16 }}>
                  <p style={{ fontFamily: displayFamily(lang), fontSize: 28, lineHeight: 1.15, color: P.text }}>
                    {text(member.name, lang)}
                  </p>
                  <p
                    style={{
                      marginTop: 10,
                      fontSize: TYPE.fine,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      lineHeight: 1.4,
                      color: "rgba(43,34,27,0.46)",
                    }}
                  >
                    {text(member.role, lang)}
                  </p>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div>
          <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>{text(DECK_COPY.teamMasthead, lang)}</SlideKicker>
          <dl style={{ marginTop: 18 }}>
            <Hair strong />
            {masthead.map((member) => (
              <div
                key={member.name.en}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: 40,
                  paddingBlock: 17,
                  borderBottom: "1px solid rgba(43,34,27,0.1)",
                }}
              >
                <dt style={{ fontFamily: displayFamily(lang), fontSize: 26, lineHeight: 1.15, color: P.text }}>
                  {text(member.name, lang)}
                </dt>
                <dd
                  style={{
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(43,34,27,0.46)",
                  }}
                >
                  {text(member.role, lang)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      <div>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 48 }}>
          <SlideKicker>{text(DECK_COPY.backersKicker, lang)}</SlideKicker>
          <SlideTitle lang={lang} size="sub" italic style={{ maxWidth: "34ch", color: "rgba(43,34,27,0.74)" }}>
            {text(DECK_COPY.backersLine, lang)}
          </SlideTitle>
        </div>
        <Hair strong style={{ marginTop: 22 }} />
        <ul style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", columnGap: 64, listStyle: "none" }}>
          {BACKERS.map((person) => (
            <li
              key={person.name.en}
              style={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "space-between",
                gap: 24,
                paddingBlock: 12,
                borderBottom: "1px solid rgba(43,34,27,0.1)",
              }}
            >
              <span style={{ fontSize: TYPE.body, fontWeight: 300, color: P.text }}>
                {text(person.name, lang)}
              </span>
              <span
                style={{
                  fontSize: TYPE.fine,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "rgba(43,34,27,0.44)",
                }}
              >
                {text(person.role, lang)}
              </span>
            </li>
          ))}
        </ul>
        <SlideFine style={{ marginTop: 16 }}>{text(DECK_COPY.backersNote, lang)}</SlideFine>
      </div>
    </PresentationSlide>
  );
};

/* ------------------------------------------------- 15 GTM and expansion */

const FUNNEL_WIDTHS = ["100%", "67%", "46%"] as const;
const FUNNEL_FILLS = ["#2b221b", "#78583e", "#b1844d"] as const;
const FUNNEL_CONVERSION = ["", "20.4%", "31.9%"] as const;

const CommercialSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={15}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.opportunity.title, lang)}
    lang={lang}
    tone="warm"
    align="between"
  >
    <div style={{ display: "grid", gridTemplateColumns: "0.54fr 0.46fr", gap: 88, alignItems: "end" }}>
      <div>
        <SlideKicker>{text(FINAL_GTM.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="feature" style={{ marginTop: 24, maxWidth: "20ch" }}>
          {text(FINAL_GTM.title, lang)}
        </SlideTitle>
      </div>

      <div dir="ltr" style={{ display: "flex", alignItems: "flex-end", gap: 40 }}>
        <div>
          <SlideFigure value={FINAL_SAAS.spend} lang={lang} size={104} />
          <SlideKicker style={{ marginTop: 16, color: "rgba(43,34,27,0.45)" }}>
            {text(FINAL_GTM.spendLabel, lang)}
          </SlideKicker>
        </div>
        <SlideArrow lang={lang} size={40} style={{ paddingBottom: 46 }} />
        <div>
          <SlideFigure value={FINAL_SAAS.customers} lang={lang} size={104} color={P.accentDeep} />
          <SlideKicker style={{ marginTop: 16, color: "rgba(43,34,27,0.45)" }}>
            {text(FINAL_GTM.outcomeLabel, lang)}
          </SlideKicker>
        </div>
      </div>
    </div>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "0.72fr 0.28fr", gap: 72, paddingTop: 26 }}>
        <div dir="ltr">
          {FINAL_SAAS.funnel.slice(0, 3).map((stage, index) => (
            <div key={stage.value} style={{ position: "relative", marginBottom: 12 }}>
              {index > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -18,
                    insetInlineEnd: 0,
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "rgba(43,34,27,0.38)",
                  }}
                >
                  {FUNNEL_CONVERSION[index]}
                </span>
              )}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 28,
                  minHeight: 62,
                  paddingInline: 24,
                  width: FUNNEL_WIDTHS[index],
                  background: FUNNEL_FILLS[index],
                  color: P.inkText,
                }}
              >
                <span
                  style={{
                    fontFamily: displayFamily(lang),
                    fontSize: 40,
                    lineHeight: 1.14,
                    letterSpacing: "-0.025em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {stage.value}
                </span>
                <span
                  dir={lang === "he" ? "rtl" : "ltr"}
                  style={{
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    color: "rgba(251,246,239,0.7)",
                  }}
                >
                  {text(stage.label, lang)}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderInlineStart: "1px solid rgba(43,34,27,0.12)", paddingInlineStart: 56 }}>
          <SlideKicker>{text(FINAL_SAAS.funnel[3].label, lang)}</SlideKicker>
          <SlideFigure
            value={FINAL_SAAS.funnel[3].value}
            lang={lang}
            size={80}
            color={P.accentDeep}
            style={{ marginTop: 22 }}
          />
          <SlideCaption style={{ marginTop: 24 }}>{text(FINAL_GTM.caption, lang)}</SlideCaption>
        </div>
      </div>
    </div>

    <div>
      <Hair />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 56,
          paddingTop: 22,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 44 }}>
          <SlideKicker>{text(FINAL_SAAS.unitLabel, lang)}</SlideKicker>
          <SlideDateline items={FINAL_SAAS.unit} lang={lang} size={34} />
        </div>
        <SlideFine style={{ maxWidth: 400, textAlign: "end" }}>{text(FINAL_SAAS.unitCaveat, lang)}</SlideFine>
      </div>
    </div>

    <div>
      <Hair strong />
      <div style={{ paddingTop: 26 }}>
        <SlideTitle lang={lang} size="chapter" style={{ maxWidth: "26ch" }}>
          {text(FINAL_BUSINESS_MODEL.title, lang)}
        </SlideTitle>
        <div dir="ltr" style={{ marginTop: 24, display: "flex", alignItems: "flex-end", gap: 28 }}>
          {EXPANSION_STAGES.map((stage, index) => (
            <React.Fragment key={stage.label}>
              {index > 0 && <SlideArrow lang={lang} size={26} style={{ paddingBottom: 26 }} />}
              <div>
                <p
                  style={{
                    fontFamily: displayFamily(lang),
                    fontSize: 48,
                    lineHeight: 1.14,
                    letterSpacing: "-0.025em",
                    fontVariantNumeric: "tabular-nums",
                    color: index === EXPANSION_STAGES.length - 1 ? P.accentDeep : P.text,
                  }}
                >
                  {stage.value}
                </p>
                <p
                  style={{
                    marginTop: 12,
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "rgba(43,34,27,0.48)",
                  }}
                >
                  {stage.label}
                </p>
              </div>
            </React.Fragment>
          ))}
          <div style={{ marginInlineStart: "auto", maxWidth: 420, textAlign: "end" }}>
            <SlideBody>{text(FINAL_BUSINESS_MODEL.line, lang)}</SlideBody>
            <SlideFine style={{ marginTop: 10 }}>{text(FINAL_BUSINESS_MODEL.caveat, lang)}</SlideFine>
          </div>
        </div>
      </div>
    </div>
  </PresentationSlide>
);

/* ----------------------------------------------------------------- 16 Raise */

const RaiseSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={16}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.opportunity.title, lang)}
    lang={lang}
    tone="paper"
    align="between"
  >
    <div style={{ display: "grid", gridTemplateColumns: "0.32fr 0.68fr", gap: 80, alignItems: "end" }}>
      <div>
        <SlideKicker>{text(FINAL_RAISE.kicker, lang)}</SlideKicker>
        <SlideFigure value={FINAL_RAISE.amount.en} lang={lang} size={136} style={{ marginTop: 22 }} />
      </div>
      <div>
        <SlideTitle lang={lang} size="chapter" style={{ maxWidth: "30ch" }}>
          {text(FINAL_RAISE.title, lang)}
        </SlideTitle>
        <SlideBody style={{ marginTop: 22, maxWidth: 820 }}>{text(FINAL_RAISE.body, lang)}</SlideBody>
      </div>
    </div>

    <div>
      <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>{text(FINAL_RAISE.useLabel, lang)}</SlideKicker>
      <div style={{ marginTop: 18, borderBlock: "1px solid rgba(43,34,27,0.16)", display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}>
        {FINAL_RAISE.columns.map((column, index) => (
          <div
            key={column.title.en}
            style={{
              position: "relative",
              paddingBlock: 24,
              paddingInline: index === 0 ? "0 40px" : "40px",
              borderInlineStart: index === 0 ? "none" : "1px solid rgba(43,34,27,0.12)",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                insetInline: index === 0 ? "0 40px" : "40px",
                top: 0,
                height: 3,
                background: FUNNEL_FILLS[index],
              }}
            />
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24 }}>
              <SlideKicker>{text(column.title, lang)}</SlideKicker>
              <span
                dir="ltr"
                style={{
                  fontFamily: displayFamily(lang),
                  fontSize: 34,
                  lineHeight: 1.14,
                  fontVariantNumeric: "tabular-nums",
                  color: "rgba(43,34,27,0.14)",
                }}
              >
                0{index + 1}
              </span>
            </div>
            <SlideTitle lang={lang} size="sub" style={{ marginTop: 22, maxWidth: "20ch" }}>
              {text(column.body, lang)}
            </SlideTitle>
          </div>
        ))}
      </div>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "0.63fr 0.37fr", gap: 72, alignItems: "stretch" }}>
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
          <SlideKicker>{text(FINAL_RAISE.context.label, lang)}</SlideKicker>
          <span
            dir="ltr"
            style={{
              fontFamily: displayFamily(lang),
              fontSize: 32,
              lineHeight: 1.14,
              fontVariantNumeric: "tabular-nums",
              color: P.text,
            }}
          >
            {FINAL_RAISE.context.raisedValue}
          </span>
          <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>
            {text(FINAL_RAISE.context.raisedLabel, lang)}
          </SlideKicker>
        </div>

        <div
          dir="ltr"
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            alignItems: "stretch",
            borderBlock: "1px solid rgba(43,34,27,0.16)",
          }}
        >
          {FINAL_RAISE.context.steps.map((step, index) => (
            <React.Fragment key={step.label.en}>
              {index > 0 && (
                <div style={{ display: "grid", placeItems: "center", paddingInline: 18 }}>
                  <SlideArrow lang={lang} size={26} />
                </div>
              )}
              <div
                style={{
                  paddingBlock: 22,
                  paddingInline: 20,
                  background:
                    index === FINAL_RAISE.context.steps.length - 1 ? "rgba(177,132,77,0.1)" : "transparent",
                }}
              >
                <p
                  style={{
                    fontFamily: displayFamily(lang),
                    fontSize: 50,
                    lineHeight: 1.14,
                    letterSpacing: "-0.035em",
                    fontVariantNumeric: "tabular-nums",
                    color: index === FINAL_RAISE.context.steps.length - 1 ? P.accentDeep : P.text,
                  }}
                >
                  {step.value}
                </p>
                <p
                  dir={lang === "he" ? "rtl" : "ltr"}
                  style={{
                    marginTop: 14,
                    maxWidth: "18ch",
                    fontSize: TYPE.fine,
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    lineHeight: 1.4,
                    color: "rgba(43,34,27,0.48)",
                  }}
                >
                  {text(step.label, lang)}
                </p>
              </div>
            </React.Fragment>
          ))}
        </div>

        <SlideCaption style={{ marginTop: 16, maxWidth: 900 }}>
          {text(FINAL_RAISE.context.note, lang)}
        </SlideCaption>
      </div>

      <div style={{ padding: "26px 32px", background: P.ink, color: P.inkText }}>
        <SlideKicker dark>{text(FINAL_RAISE.nextStep.label, lang)}</SlideKicker>
        <p
          style={{
            marginTop: 20,
            fontFamily: displayFamily(lang),
            fontSize: 44,
            lineHeight: 1.14,
            letterSpacing: "-0.025em",
            color: P.accentDark,
          }}
        >
          {text(FINAL_RAISE.nextStep.value, lang)}
        </p>
        <SlideCaption dark style={{ marginTop: 16 }}>
          {text(FINAL_RAISE.nextStep.body, lang)}
        </SlideCaption>
      </div>
    </div>

    <SlideFine>
      {text(FINAL_RAISE.context.caption, lang)} {text(FINAL_RAISE.footnote, lang)}
    </SlideFine>
  </PresentationSlide>
);

/* --------------------------------------------------------------- 17 Closing */

const ClosingSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={17}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.opportunity.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.reception,
      overlay: "linear-gradient(160deg,rgba(9,6,4,0.94),rgba(9,6,4,0.82))",
      opacity: 0.26,
    }}
    align="between"
  >
    <div>
      <SlideKicker dark>{text(FINAL_CLOSE.kicker, lang)}</SlideKicker>
      <SlideTitle lang={lang} size="cover" dark style={{ marginTop: 26, maxWidth: "18ch", fontSize: 126 }}>
        {text(FINAL_CLOSE.title, lang)}
      </SlideTitle>
      <div
        style={{
          marginTop: 54,
          display: "grid",
          gridTemplateColumns: "0.52fr 0.48fr",
          gap: 88,
          alignItems: "start",
        }}
      >
        <SlideLede dark>{text(FINAL_CLOSE.body, lang)}</SlideLede>
        <SlideTitle lang={lang} size="feature" accent dark style={{ maxWidth: "16ch" }}>
          {text(FINAL_CLOSE.ask, lang)}
        </SlideTitle>
      </div>
    </div>

    <div>
      <Hair dark strong />
      <div
        style={{
          marginTop: 22,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 48,
        }}
      >
        <div>
          <SlideCaption dark>{text(FINAL_CLOSE.signoff, lang)}</SlideCaption>
          <SlideTitle lang={lang} size="sub" dark style={{ marginTop: 14 }}>
            {text(FINAL_CLOSE.names, lang)}
          </SlideTitle>
          <SlideKicker dark style={{ marginTop: 14, color: "rgba(251,246,239,0.42)" }}>
            {text(FINAL_CLOSE.role, lang)}
          </SlideKicker>
        </div>
        <p
          dir="ltr"
          style={{
            fontFamily: displayFamily(lang),
            fontSize: 40,
            lineHeight: 1.14,
            letterSpacing: "0.14em",
            color: "rgba(251,246,239,0.5)",
          }}
        >
          SPECTRA
        </p>
      </div>
    </div>
  </PresentationSlide>
);

/* -------------------------------------------------------------------- deck */

const SLIDES: readonly React.FC<SlideProps>[] = [
  CoverSlide,
  OriginSlide,
  ColorSlide,
  TurningPointSlide,
  DataLayerSlide,
  SixSalonSlide,
  DecisionBookingSlide,
  SalonEconomicsSlide,
  OwnerMobileSlide,
  ClientMobileSlide,
  BridgeSlide,
  SalonAiSlide,
  OpportunitySlide,
  TeamSlide,
  CommercialSlide,
  RaiseSlide,
  ClosingSlide,
];

/**
 * The presentation deck. Rendered only for PDF and PNG capture, so the
 * continuous editorial page keeps its own responsive composition.
 */
export const ExternalInvestorPresentation: React.FC<{ lang: UpdateLang }> = ({ lang }) => (
  <div
    data-investor-presentation="true"
    data-slide-count={SLIDES.length}
    dir={lang === "he" ? "rtl" : "ltr"}
    style={{ width: SLIDE.width, margin: "0 auto", background: P.paper }}
  >
    {SLIDES.map((Slide, index) => (
      <Slide key={index} lang={lang} />
    ))}
  </div>
);

export const PRESENTATION_SLIDE_COUNT = SLIDES.length;
export { SLIDE, SLIDE_CONTENT_HEIGHT, SLIDE_CONTENT_WIDTH };
export default ExternalInvestorPresentation;
