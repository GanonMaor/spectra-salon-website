/**
 * Founder Story Investor Edition — Alon revision.
 * Editorial visual language for the September 2026 printed deck.
 */
import React from "react";
import {
  BarChart3,
  Bot,
  Brain,
  CalendarDays,
  CircleDollarSign,
  Clock,
  FlaskConical,
  Instagram,
  Layers,
  Package,
  Paintbrush,
  Scale,
  Scissors,
  Sparkles,
  User,
  Users,
  Youtube,
  type LucideIcon,
} from "lucide-react";
import {
  BrowserFrame,
  CalendarGrid,
} from "../NewNarrativeSalonAIFirst/sections/liveDemoDraft/BookingSchedulingIntelligenceDraftSlide";
import { crmTranslations, type CrmLang } from "../SalonCRM/i18n/translations";
import { displayServiceName } from "../SalonCRM/schedule/scheduleDisplayNames";
import { CATEGORY_COLORS } from "../SalonPerformanceDashboard/reports/ReportShared";
import { displayFamily, loc, t as text } from "../ExternalInvestorUpdate/EditorialPrimitives";
import {
  FINAL_ADOPTION,
  FINAL_BOOKING,
  FINAL_CHAPTERS,
  FINAL_CLIENT_APP,
  FINAL_CLOSE,
  FINAL_COLOR_WEDGE,
  FINAL_DECISION,
  FINAL_GTM,
  FINAL_HERO,
  FINAL_LEDE,
  FINAL_MOBILE,
  FINAL_OWNER_APP,
  FINAL_PLATFORM,
  FINAL_PROBLEM,
  FINAL_RAISE,
  FINAL_REVELATION,
  FINAL_SAAS,
  FINAL_SALON_AI,
  FINAL_SALON_OS,
  REVISION,
  type Localized,
  type UpdateLang,
} from "./founderStoryCopy";
import { DECK_VARIANTS, type DeckVariant, type DeckVariantId } from "./founderStoryVariants";
import {
  CORE_TEAM,
  SIX_SALON_SAMPLE,
} from "../ExternalInvestorUpdate/intelligenceData";
import {
  Hair,
  P,
  PresentationSlide,
  SLIDE,
  SLIDE_CONTENT_HEIGHT,
  SLIDE_CONTENT_WIDTH,
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
} from "../ExternalInvestorUpdate/PresentationSlide";
import { SALON_OS_PROOF } from "../ExternalInvestorUpdate/salonOsProofSnapshot";
import { SalonAiLockup } from "../../components/SalonAiLockup";
import { SpectraOrb } from "../../components/SpectraOrb";
import { usePdfExportMode } from "../SpectraInvestorExperience/primitives";

/** Verified from src/data/market-intelligence.json summary (_generated 2026-09-05). */
export const GLOBAL_USAGE_PROOF = {
  visits: 516_363,
  services: 617_063,
  grams: 34_042_524.65,
  brands: 228,
  months: 44,
} as const;

export const HERO_BUSINESS_METRICS: readonly { value: string; label: Localized }[] = [
  { value: "170+", label: { en: "Salons", he: "סלונים" } },
  { value: "12", label: { en: "Countries", he: "מדינות" } },
  { value: "$130K", label: { en: "ARR", he: "ARR" } },
];

export const HERO_DATA_METRICS: readonly { value: string; label: Localized }[] = [
  { value: "617K+", label: { en: "Measured services", he: "שירותים שנמדדו" } },
  { value: "34.0M", label: { en: "Grams measured", he: "גרמים שנמדדו" } },
  { value: "1", label: { en: "Active industry data pilot", he: "פיילוט דאטה תעשייתי פעיל" } },
];

export const MEDIA = {
  reception: "/investor/media/reception.jpg",
  colorBar: "/investor/media/color-bar.jpg",
  shelves: "/investor/media/shelves.jpg",
  salonAiPhone: "/investor/media/salon-ai-phone.jpg",
  bowlRecord: "/investor/generated/investor-slide-07-cinematic.png",
  ownerApp: "/investor/media/owner-app-reference.png",
  clientApp: "/investor/media/client-app-two-phones.png",
  founders: "/investor/generated/investor-slide-01-cinematic.png",
} as const;

export const ADOPTION_PHONES = [
  {
    name: "Summer",
    username: "@manely.summer",
    href: "https://www.instagram.com/manely.summer",
    poster: "/investor/media/adoption-proof/phone-summer.jpg",
    video: "/instagram-reel.mp4",
    avatar: "/profile-summer.jpg",
  },
  {
    name: "Angela Copozzi",
    username: "@thewitchwhodoeshair_",
    href: "https://www.instagram.com/thewitchwhodoeshair_/",
    poster: "/investor/media/adoption-proof/phone-angela.jpg",
    video: "/instagram-reel2.mp4",
    avatar: "/profile-angela.jpg",
  },
  {
    name: "Kendall",
    username: "@sohairsavvy",
    href: "https://www.instagram.com/sohairsavvy",
    poster: "/investor/media/adoption-proof/phone-kendall.jpg",
    video: "/instagram-reel3.mp4",
    avatar: "/profile-kendall.jpg",
  },
  {
    name: "Serina Renee'",
    username: "@_serinarenee",
    href: "https://www.instagram.com/_serinarenee",
    poster: "/investor/media/adoption-proof/phone-serina.jpg",
    video: "/instagram-reel4.mp4",
    avatar: "/profile-serina.jpg",
  },
  {
    name: "Morgan Campbell",
    username: "@manesbymorgan__",
    href: "https://www.instagram.com/manesbymorgan__",
    poster: "/investor/media/adoption-proof/phone-morgan.jpg",
    video: "/instagram-reel5.mp4",
    avatar: "/profile-morgan.jpg",
  },
  {
    name: "Bri",
    username: "@bri.stangle",
    href: "https://www.instagram.com/bri.stangle",
    poster: "/investor/media/adoption-proof/phone-bri.jpg",
    video: "/instagram-reel6.mp4",
    avatar: "/profile-bri.jpg",
  },
] as const;

export const SPECTRA_SOCIAL = [
  {
    label: "@spectra.ci",
    href: "https://www.instagram.com/spectra.ci/",
    count: "8.2K",
    Icon: Instagram,
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@spectracolorintelligence",
    count: null,
    Icon: Youtube,
  },
] as const;

/** Website Five Simple Steps photography, cropped for the deck — not the website cards. */
export const COLOR_WORKFLOW_MEDIA = [
  { src: "/stap 1 chack in.jpeg", position: "50% 42%" },
  { src: "/stepn 2 select service.jpeg", position: "46% 40%" },
  { src: "/step 3 scan tube.jpeg", position: "52% 36%" },
  { src: "/step 4 squiz the color.jpeg", position: "50% 38%" },
  { src: "/step_5.jpg", position: "50% 0%" },
] as const;

const WORKFLOW_IMAGE_HEIGHT = 548;
const PHONE_HEIGHT = 508;
const PHONE_WIDTH = 236;
const PHONE_GAP = 36;

/** Usage-observed operating countries. Same 12 as the deck claim. */
export const OPERATING_COUNTRIES = [
  { code: "il", name: loc("Israel", "ישראל") },
  { code: "gb", name: loc("United Kingdom", "בריטניה") },
  { code: "us", name: loc("United States", "ארצות הברית") },
  { code: "pt", name: loc("Portugal", "פורטוגל") },
  { code: "gr", name: loc("Greece", "יוון") },
  { code: "ca", name: loc("Canada", "קנדה") },
  { code: "it", name: loc("Italy", "איטליה") },
  { code: "jp", name: loc("Japan", "יפן") },
  { code: "nl", name: loc("Netherlands", "הולנד") },
  { code: "by", name: loc("Belarus", "בלארוס") },
  { code: "au", name: loc("Australia", "אוסטרליה") },
  { code: "ie", name: loc("Ireland", "אירלנד") },
] as const;

export const FOUNDER_MEDIA = [
  { key: "Maor Ganon", src: "/team/maor-ganon.jpg", objectPosition: "50% 16%" },
  { key: "Elad Gotlieb", src: "/team/elad-gottlieb.jpg", objectPosition: "50% 14%" },
] as const;

const TOTAL = 17;

type SlideProps = { lang: UpdateLang };

export const DeckVariantContext = React.createContext<DeckVariant>(DECK_VARIANTS.september2026);
export const useDeckVariant = () => React.useContext(DeckVariantContext);

/** Presentation-local copy that mirrors strings authored inline on the web page. */
export const DECK_COPY = {
  dataHeadline: loc(
    "One service became data. 617K+ services became market intelligence.",
    "שירות אחד הפך לדאטה. יותר מ־617 אלף שירותים הפכו לאינטליגנציית שוק.",
  ),
  dataLede: loc("", ""),
  dataEvents: loc("Measured color services", "שירותי צבע שנמדדו"),
  dataChartCaption: loc("", ""),
  dataDifferenceKicker: loc("The difference", "ההבדל"),
  dataDifferenceLines: [
    loc("Not what was shipped.", "לא מה שנשלח."),
    loc("Not what was booked.", "לא מה שנקבע ביומן."),
    loc("What was actually used.", "מה שנעשה בו שימוש בפועל."),
  ],
  dataFields: loc(
    "Product · Shade · Formula · Grams · Service · Cost",
    "מוצר · גוון · פורמולה · גרמים · שירות · עלות",
  ),
  dataPilotKicker: loc("Active industry data pilot", "פיילוט דאטה תעשייתי פעיל"),
  dataPilotBody: loc(
    "L’Oréal Israel is currently evaluating Spectra’s aggregated salon data.",
    "L’Oréal Israel בוחנת כעת את הדאטה המצרפי של Spectra מסלונים.",
  ),
  compoundClose: REVISION.dataTakeaway,
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
  teamMasthead: loc("The team", "הצוות"),
} as const;

/** Section labels and accessible names shared by the fixed and mobile decks. */
export const DECK_UI_COPY = {
  coverBusinessKicker: loc("Business traction", "פעילות עסקית"),
  coverDataKicker: loc("Professional beauty data", "דאטה של תעשיית היופי המקצועית"),
  colorWorkflowLabel: loc("Color Intelligence workflow", "חמשת שלבי Color Intelligence"),
  adoptionReelsLabel: loc("Customer Instagram reels", "סרטוני לקוחות מאינסטגרם"),
  recordFigureLabel: loc(
    "Eight service fields converging into one service record",
    "שמונה שדות שירות מתכנסים לרשומת שירות אחת",
  ),
  salonAiCapabilitiesLabel: loc("Core Salon AI capabilities", "יכולות מרכזיות של Salon AI"),
  salonAiCapabilitiesKicker: loc("Core capabilities", "יכולות מרכזיות"),
  salonAiPhoneAlt: loc(
    "Designed Salon AI mobile application direction",
    "כיוון עיצובי לאפליקציית Salon AI בנייד",
  ),
  raiseMissionsKicker: loc("Three strategic missions", "שלוש משימות אסטרטגיות"),
} as const;

export const customerVideoLabel = (name: string, lang: UpdateLang) =>
  lang === "he" ? `סרטון לקוחה של ${name}` : `${name} customer video`;

export const founderPortraitAlt = (name: Localized, role: Localized, lang: UpdateLang) =>
  lang === "he" ? `דיוקן של ${name.he}, ${text(role, lang)}` : `Portrait of ${name.en}, ${text(role, lang)}`;

export const DATA_LAYER_SCALE: readonly { value: string; label: Localized }[] = [
  { value: `${Math.floor(GLOBAL_USAGE_PROOF.services / 1000)}K+`, label: DECK_COPY.dataEvents },
  { value: "34.0M g", label: loc("Measured", "שנמדד") },
  { value: `${Math.floor(GLOBAL_USAGE_PROOF.visits / 1000)}K+`, label: loc("Visits", "ביקורים") },
  { value: String(GLOBAL_USAGE_PROOF.brands), label: loc("Brands", "מותגים") },
  { value: String(GLOBAL_USAGE_PROOF.months), label: loc("Months", "חודשים") },
];

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

export const SALON_AI_STEP_ICONS: Record<(typeof REVISION.salonAi.steps)[number]["en"], LucideIcon> = {
  Bowl: FlaskConical,
  Service: Paintbrush,
  Data: Layers,
  Intelligence: Brain,
};

export const PLATFORM_CAPABILITY_ICONS: Record<(typeof REVISION.platform.capabilities)[number]["title"]["en"], LucideIcon> = {
  "Intelligent Salon Operations": CalendarDays,
  "Autonomous inventory": Package,
  "Client memory": Users,
  "Profit engine": BarChart3,
  "Team assistant": Sparkles,
  "Owner agent": Bot,
};

export const SALON_AI_HIGHLIGHTS = [
  REVISION.platform.capabilities[0],
  REVISION.platform.capabilities[1],
  REVISION.platform.capabilities[5],
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

export const SALON_SUBSCRIPTION_TIERS = [
  {
    name: "Color Intelligence",
    scope: loc("Color workflow and inventory", "תהליכי צבע ומלאי"),
    value: "$960",
  },
  {
    name: "Booking · CRM · POS",
    scope: loc("Core salon operations", "תפעול הליבה של הסלון"),
    value: "$2,060",
  },
  {
    name: "Salon OS",
    scope: loc("Connected operating system", "מערכת הפעלה מחוברת"),
    value: "$3,060",
  },
  {
    name: "Salon AI",
    scope: loc("Full AI operating layer", "שכבת הפעלה מלאה עם AI"),
    value: "$4,860",
  },
] as const;

export const DATA_SUBSCRIPTION_TIERS = [
  {
    name: "Market Pulse",
    customer: loc("Local brand / distributor", "מותג / מפיץ מקומי"),
    value: "$6K–$15K",
  },
  {
    name: "Portfolio Intelligence",
    customer: loc("Mid-size brand", "מותג בינוני"),
    value: "$15K–$35K",
  },
  {
    name: "Regional Intelligence",
    customer: loc("Multiple markets", "מספר שווקים"),
    value: "$35K–$75K",
  },
  {
    name: "Enterprise Intelligence",
    customer: loc("Global manufacturer / API", "יצרן גלובלי / API"),
    value: "$75K–$150K+",
  },
] as const;

export const BUSINESS_MODEL_LABELS = {
  salonArpu: loc("Annual salon ARPU", "ARPU שנתי מסלון"),
  salonArpuNote: loc("Recurring revenue per active salon / year", "הכנסה חוזרת מסלון פעיל / שנה"),
  dataSubscriptions: loc("Annual data subscriptions", "מנויי דאטה שנתיים"),
  dataSubscriptionsNote: loc("Target annual contract value by customer size", "שווי חוזה שנתי לפי גודל הלקוח"),
} as const;

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

const CoverSlide: React.FC<SlideProps> = ({ lang }) => {
  const variant = useDeckVariant();
  return (
    <PresentationSlide
      index={1}
      total={TOTAL}
      chapter={text(variant.date, lang)}
      lang={lang}
      tone="ink"
      align="between"
      showFooter={false}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 40 }}>
          <SalonAiLockup tone="ink" size="cover" reducedMotion />
          <p
            style={{
              fontSize: TYPE.kicker,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "rgba(251,246,239,0.48)",
            }}
          >
            {text(variant.date, lang)}
          </p>
        </div>
        <Hair dark strong style={{ marginTop: 20 }} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "0.53fr 0.47fr",
          gap: 88,
          alignItems: "center",
        }}
      >
        <div>
          <SlideTitle lang={lang} size="cover" dark style={{ fontSize: 74, lineHeight: 1.08, letterSpacing: "-0.025em" }}>
            {text(FINAL_HERO.title, lang).split("\n").map((line, index) => (
              <span key={line} style={{ display: "block", marginTop: index === 0 ? 0 : 22 }}>
                {line.split(/(Salon AI)/).map((part, partIndex) =>
                  part === "Salon AI" ? (
                    <span key={`${part}-${partIndex}`} dir="ltr" style={{ whiteSpace: "nowrap" }}>
                      {part}
                    </span>
                  ) : (
                    <React.Fragment key={`copy-${partIndex}`}>{part}</React.Fragment>
                  ),
                )}
              </span>
            ))}
          </SlideTitle>
        </div>

        <figure style={{ border: "1px solid rgba(255,255,255,0.14)" }}>
          <img
            src={MEDIA.founders}
            alt={text(FINAL_HERO.founderAlt, lang)}
            width={1800}
            height={1012}
            style={{ display: "block", width: "100%", height: 452, objectFit: "cover", objectPosition: "74% center" }}
          />
        </figure>
      </div>

      <div>
        <Hair dark />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "0.38fr 0.62fr",
            gap: 32,
            marginTop: 16,
          }}
        >
          <div>
            <SlideKicker dark style={{ fontSize: 12, color: "rgba(217,185,129,0.72)" }}>
              {text(DECK_UI_COPY.coverBusinessKicker, lang)}
            </SlideKicker>
            <SlideDateline items={HERO_BUSINESS_METRICS} lang={lang} dark size={32} style={{ marginTop: 10, gap: "12px 18px" }} />
          </div>
          <div style={{ borderInlineStart: "1px solid rgba(255,255,255,0.14)", paddingInlineStart: 32 }}>
            <SlideKicker dark style={{ fontSize: 12, color: "rgba(217,185,129,0.72)" }}>
              {text(DECK_UI_COPY.coverDataKicker, lang)}
            </SlideKicker>
            <SlideDateline items={HERO_DATA_METRICS} lang={lang} dark size={31} style={{ marginTop: 10, gap: "12px 16px" }} />
          </div>
        </div>
      </div>
    </PresentationSlide>
  );
};

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
        <SlideBody style={{ marginTop: 20 }}>{FINAL_LEDE.paragraphs[lang][1]}</SlideBody>
        <div style={{ marginTop: 32 }}>
          <SlideBody>{text(FINAL_LEDE.dataReveal.setup, lang)}</SlideBody>
          <SlideTitle lang={lang} size="chapter" style={{ marginTop: 8, fontSize: 64, letterSpacing: "-0.03em" }}>
            <span dir="ltr" style={{ whiteSpace: "nowrap" }}>
              {text(FINAL_LEDE.dataReveal.word, lang)}
            </span>
          </SlideTitle>
          <SlideLede style={{ marginTop: 10 }}>{text(FINAL_LEDE.dataReveal.follow, lang)}</SlideLede>
        </div>
        <SlideBody style={{ marginTop: 22 }}>{FINAL_LEDE.paragraphs[lang][2]}</SlideBody>
      </div>
    </div>

    <figure style={{ marginInlineStart: "20%" }}>
      <Hair strong />
      <blockquote style={{ paddingBlock: 28 }}>
        <SlideTitle lang={lang} size="feature" italic style={{ maxWidth: "22ch" }}>
          {text(FINAL_LEDE.pull, lang)}
        </SlideTitle>
      </blockquote>
      <Hair />
    </figure>
  </PresentationSlide>
);

/* ------------------------------------------------------- 03 Color workflow */

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
    <div>
      <SlideChapterMark
        number={FINAL_CHAPTERS.built.number}
        title={text(FINAL_CHAPTERS.built.title, lang)}
        lang={lang}
        dark
      />
      <SlideTitle lang={lang} size="feature" dark style={{ marginTop: 22 }}>
        {text(FINAL_COLOR_WEDGE.title, lang)}
      </SlideTitle>
      <p
        dir={lang === "he" ? "rtl" : "ltr"}
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: 400,
          color: "rgba(217,185,129,0.82)",
          letterSpacing: "-0.01em",
        }}
      >
        {text(FINAL_COLOR_WEDGE.appLine, lang)}
      </p>
      <SlideTitle lang={lang} size="sub" italic accent dark style={{ marginTop: 6 }}>
        {text(FINAL_COLOR_WEDGE.cadence, lang)}
      </SlideTitle>
    </div>

    <ol
      aria-label={text(DECK_UI_COPY.colorWorkflowLabel, lang)}
      style={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: 22, listStyle: "none" }}
    >
      {FINAL_COLOR_WEDGE.workflow.map((step, index) => {
        const media = COLOR_WORKFLOW_MEDIA[index];
        return (
          <li key={step.number} style={{ minWidth: 0 }}>
            <figure>
              <div
                style={{
                  height: WORKFLOW_IMAGE_HEIGHT,
                  overflow: "hidden",
                  background: P.ink,
                  border: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                <img
                  src={media.src.replace(/ /g, "%20")}
                  alt={text(step.alt, lang)}
                  width={663}
                  height={994}
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: media.position,
                  }}
                />
              </div>
              <figcaption style={{ marginTop: 16 }}>
                <p style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <span
                    dir="ltr"
                    style={{
                      fontSize: TYPE.kicker,
                      fontWeight: 600,
                      lineHeight: 1.2,
                      letterSpacing: "0.18em",
                      fontVariantNumeric: "tabular-nums",
                      color: P.accentDark,
                    }}
                  >
                    {step.number}
                  </span>
                  <span
                    style={{
                      fontFamily: displayFamily(lang),
                      fontSize: 24,
                      lineHeight: 1.2,
                      color: P.inkText,
                    }}
                  >
                    {text(step.title, lang)}
                  </span>
                </p>
                <SlideCaption dark style={{ marginTop: 6 }}>
                  {text(step.line, lang)}
                </SlideCaption>
              </figcaption>
            </figure>
          </li>
        );
      })}
    </ol>
  </PresentationSlide>
);

/* ------------------------------------------------------------- 04 Adoption */

export const ADOPTION_PROOF_METRICS: readonly { value: string; label: Localized }[] = [
  { value: "170+", label: loc("Salons", "סלונים") },
  { value: "12", label: loc("Countries", "מדינות") },
  { value: "500+", label: loc("Professionals", "אנשי מקצוע") },
];

const AdoptionVideoRail: React.FC<{ lang: UpdateLang }> = ({ lang }) => {
  const pdfExport = usePdfExportMode();
  const railRef = React.useRef<HTMLDivElement | null>(null);
  const videoRefs = React.useRef<Array<HTMLVideoElement | null>>([]);

  const handlePlay = (activeIndex: number) => {
    videoRefs.current.forEach((video, index) => {
      if (video && index !== activeIndex) video.pause();
    });
  };

  React.useEffect(() => {
    const rail = railRef.current;
    if (pdfExport || !rail || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) videoRefs.current.forEach((video) => video?.pause());
      },
      { threshold: 0.1 },
    );
    observer.observe(rail);
    return () => observer.disconnect();
  }, [pdfExport]);

  return (
    <div
      ref={railRef}
      dir="ltr"
      role="group"
      aria-label={text(DECK_UI_COPY.adoptionReelsLabel, lang)}
      style={{
        display: "flex",
        justifyContent: "center",
        gap: PHONE_GAP,
      }}
    >
      {ADOPTION_PHONES.map((phone, index) => (
        <div
          key={phone.username}
          style={{
            flex: `0 0 ${PHONE_WIDTH}px`,
            height: PHONE_HEIGHT,
            padding: "12px 9px 14px",
            borderRadius: 38,
            background: "linear-gradient(180deg, #2a221c 0%, #0e0b08 48%, #120e0b 100%)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.45)",
            display: "flex",
            flexDirection: "column",
            color: P.inkText,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 68,
              height: 7,
              margin: "0 auto 8px",
              borderRadius: 99,
              background: "rgba(255,255,255,0.14)",
            }}
          />
          <span
            style={{
              position: "relative",
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              borderRadius: 22,
              background: P.ink,
            }}
          >
            {pdfExport ? (
              <img
                src={phone.poster}
                alt=""
                width={720}
                height={1280}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
              />
            ) : (
              <video
                ref={(video) => {
                  videoRefs.current[index] = video;
                }}
                src={phone.video}
                poster={phone.poster}
                controls
                controlsList="nodownload noplaybackrate"
                playsInline
                preload="none"
                aria-label={customerVideoLabel(phone.name, lang)}
                onPlay={() => handlePlay(index)}
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center",
                  background: P.ink,
                }}
              />
            )}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                insetInline: 10,
                top: 10,
                display: "flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                pointerEvents: "none",
              }}
            >
              <img
                src={phone.avatar}
                alt=""
                width={28}
                height={28}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid rgba(255,255,255,0.45)",
                  flex: "0 0 28px",
                }}
              />
              <span
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.01em",
                  textShadow: "0 1px 8px rgba(0,0,0,0.65)",
                }}
              >
                {phone.username}
              </span>
            </span>
          </span>
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 84,
              height: 4,
              margin: "10px auto 0",
              borderRadius: 99,
              background: "rgba(255,255,255,0.16)",
            }}
          />
        </div>
      ))}
    </div>
  );
};

const AdoptionSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={4}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.built.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.colorBar,
      overlay: "linear-gradient(180deg,rgba(9,6,4,0.92),rgba(9,6,4,0.88))",
      opacity: 0.28,
    }}
    align="between"
  >
    <div>
      <SlideChapterMark
        number={FINAL_CHAPTERS.built.number}
        title={text(FINAL_CHAPTERS.built.title, lang)}
        lang={lang}
        dark
      />
      <SlideTitle lang={lang} size="chapter" dark style={{ marginTop: 22 }}>
        {text(FINAL_ADOPTION.strip, lang)}
      </SlideTitle>
      <SlideDateline items={ADOPTION_PROOF_METRICS} lang={lang} size={40} dark style={{ marginTop: 22 }} />
    </div>

    <AdoptionVideoRail lang={lang} />

    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 32,
      }}
    >
      <ul
        dir="ltr"
        style={{
          display: "flex",
          flexWrap: "nowrap",
          alignItems: "center",
          gap: 10,
          listStyle: "none",
        }}
      >
        {OPERATING_COUNTRIES.map((country) => (
          <li key={country.code} title={text(country.name, lang)}>
            <img
              src={`/investor/flags/${country.code}.png`}
              alt={text(country.name, lang)}
              width={48}
              height={32}
              style={{
                display: "block",
                width: 48,
                height: 32,
                objectFit: "cover",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            />
          </li>
        ))}
      </ul>
      <div dir="ltr" style={{ display: "flex", alignItems: "center", gap: 22, flexShrink: 0 }}>
        {SPECTRA_SOCIAL.map((item) => (
          <a
            key={item.href}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "rgba(251,246,239,0.52)",
              textDecoration: "none",
              fontSize: 13,
              letterSpacing: "0.02em",
            }}
          >
            <item.Icon size={15} strokeWidth={1.6} aria-hidden="true" />
            <span>{item.label}</span>
            {item.count ? (
              <span style={{ color: "rgba(217,185,129,0.7)", fontSize: 12 }}>{item.count}</span>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------- 05 Turning point */

const RECORD_COLUMNS = [200, 600, 1000, 1400] as const;
const RECORD_FIGURE_H = 510;
const RECORD_TOP_Y = 36;
const RECORD_BOT_Y = 484;
const RECORD_HUB = { x: 800, y: 260, width: 440, height: 248 } as const;
const RECORD_RAIL_GAP = 32;
const RECORD_FIELD_SLOTS = [
  ...RECORD_COLUMNS.map((x) => ({ x, y: RECORD_TOP_Y })),
  ...RECORD_COLUMNS.map((x) => ({ x, y: RECORD_BOT_Y })),
] as const;

export const RECORD_FIELD_ICONS: Record<(typeof FINAL_REVELATION.signals)[number]["en"], LucideIcon> = {
  Client: User,
  Professional: Users,
  Service: Scissors,
  Formula: FlaskConical,
  Product: Package,
  Grams: Scale,
  Time: Clock,
  Cost: CircleDollarSign,
};

export const HISTORY_PROOF = [
  {
    src: "/investor/media/loreal-proof/consumption.png?v=en",
    caption: loc("Consumption", "צריכה"),
  },
  {
    src: "/investor/media/loreal-proof/usage-by-service.png?v=en",
    caption: loc("Usage by service", "שימוש לפי שירות"),
  },
  {
    src: "/investor/media/loreal-proof/adoption-signals.png?v=en",
    caption: loc("Adoption signals", "אותות אימוץ"),
  },
] as const;

const TurningPointSlide: React.FC<SlideProps> = ({ lang }) => {
  return (
    <PresentationSlide
      index={6}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.discovered.title, lang)}
      lang={lang}
      tone="ink"
      bleed={{
        image: MEDIA.reception,
        overlay: "linear-gradient(180deg,rgba(9,6,4,0.9),rgba(9,6,4,0.96))",
        opacity: 0.22,
      }}
      align="between"
    >
      <div>
        <SlideChapterMark
          number={FINAL_CHAPTERS.discovered.number}
          title={text(FINAL_CHAPTERS.discovered.title, lang)}
          lang={lang}
          dark
        />
        <SlideTitle
          lang={lang}
          size="chapter"
          dark
          style={{ marginTop: 18, maxWidth: lang === "he" ? "16ch" : "20ch" }}
        >
          {text(FINAL_REVELATION.title, lang)}
        </SlideTitle>
      </div>

      <figure
        dir="ltr"
        aria-label={text(DECK_UI_COPY.recordFigureLabel, lang)}
        style={{ position: "relative", height: RECORD_FIGURE_H }}
      >
        <svg
          viewBox={`0 0 1600 ${RECORD_FIGURE_H}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
        >
          {(() => {
            const photoTop = RECORD_HUB.y - RECORD_HUB.height / 2;
            const photoBot = RECORD_HUB.y + RECORD_HUB.height / 2;
            const topRail = photoTop - RECORD_RAIL_GAP;
            const botRail = photoBot + RECORD_RAIL_GAP;
            const first = RECORD_COLUMNS[0];
            const last = RECORD_COLUMNS[RECORD_COLUMNS.length - 1];
            const stroke = { stroke: "rgba(217,185,129,0.4)", strokeWidth: 1.25 };
            return (
              <>
                {RECORD_COLUMNS.map((x) => (
                  <line key={`top-${x}`} x1={x} y1={RECORD_TOP_Y + 16} x2={x} y2={topRail} {...stroke} />
                ))}
                {RECORD_COLUMNS.map((x) => (
                  <line key={`bot-${x}`} x1={x} y1={RECORD_BOT_Y - 16} x2={x} y2={botRail} {...stroke} />
                ))}
                <line x1={first} y1={topRail} x2={last} y2={topRail} {...stroke} />
                <line x1={first} y1={botRail} x2={last} y2={botRail} {...stroke} />
                <line x1={RECORD_HUB.x} y1={topRail} x2={RECORD_HUB.x} y2={photoTop} {...stroke} />
                <line x1={RECORD_HUB.x} y1={botRail} x2={RECORD_HUB.x} y2={photoBot} {...stroke} />
              </>
            );
          })()}
        </svg>

        {FINAL_REVELATION.signals.map((field, index) => {
          const Icon = RECORD_FIELD_ICONS[field.en];
          return (
            <div
              key={field.en}
              style={{
                position: "absolute",
                left: `${(RECORD_FIELD_SLOTS[index].x / 1600) * 100}%`,
                top: RECORD_FIELD_SLOTS[index].y,
                transform: "translate(-50%, -50%)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: TYPE.kicker,
                fontWeight: 600,
                textTransform: lang === "he" ? "none" : "uppercase",
                letterSpacing: lang === "he" ? "0.04em" : "0.16em",
                color: P.accentDark,
                whiteSpace: "nowrap",
              }}
            >
              <Icon size={18} strokeWidth={1.5} />
              {text(field, lang)}
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: `${(RECORD_HUB.width / 1600) * 100}%`,
            height: RECORD_HUB.height,
            transform: "translate(-50%, -50%)",
            overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.14)",
            pointerEvents: "none",
          }}
        >
          <img
            src={MEDIA.bowlRecord}
            alt=""
            width={1536}
            height={1024}
            style={{
              display: "block",
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "52% 46%",
            }}
          />
        </div>
      </figure>

      <SlideTitle
        lang={lang}
        size="sub"
        italic
        dark
        style={{ color: "rgba(251,246,239,0.78)", maxWidth: lang === "he" ? "18ch" : "28ch" }}
      >
        {text(FINAL_REVELATION.close, lang)}
      </SlideTitle>
    </PresentationSlide>
  );
};

/* ------------------------------------------------------------ 07 Data layer */

const DataLayerSlide: React.FC<SlideProps> = ({ lang }) => {
  const scale = DATA_LAYER_SCALE;

  return (
    <PresentationSlide
      index={7}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.discovered.title, lang)}
      lang={lang}
      tone="ink"
      bleed={{
        image: MEDIA.reception,
        overlay: "linear-gradient(180deg,rgba(9,6,4,0.9),rgba(9,6,4,0.96))",
        opacity: 0.22,
      }}
      align="between"
    >
      <div>
        <SlideChapterMark
          number={FINAL_CHAPTERS.discovered.number}
          title={text(FINAL_CHAPTERS.discovered.title, lang)}
          lang={lang}
          dark
        />
        <SlideTitle lang={lang} size="chapter" dark style={{ marginTop: 18, maxWidth: lang === "he" ? "23ch" : "27ch" }}>
          {text(DECK_COPY.dataHeadline, lang)}
        </SlideTitle>
        <SlideDateline
          items={scale}
          lang={lang}
          size={28}
          dark
          style={{ marginTop: 16, width: "100%", justifyContent: "center" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 22 }}>
        {HISTORY_PROOF.map((crop) => (
          <figure key={crop.src}>
            <div
              style={{
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.14)",
                background: "#fff",
                height: 228,
              }}
            >
              <img
                src={crop.src}
                alt={text(crop.caption, lang)}
                width={1352}
                height={598}
                style={{ display: "block", width: "100%", height: "100%", objectFit: "contain", background: "#fff" }}
              />
            </div>
            <figcaption style={{ marginTop: 10 }}>
              <SlideCaption dark>{text(crop.caption, lang)}</SlideCaption>
            </figcaption>
          </figure>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
          gap: 72,
          alignItems: "stretch",
        }}
      >
        <div
          dir={lang === "he" ? "rtl" : "ltr"}
          style={{
            borderTop: "1px solid rgba(255,255,255,0.16)",
            paddingTop: 14,
          }}
        >
          <SlideKicker dark>{text(DECK_COPY.dataDifferenceKicker, lang)}</SlideKicker>
          <div style={{ marginTop: 10 }}>
            {DECK_COPY.dataDifferenceLines.map((line, index) => (
              <p
                key={line.en}
                style={{
                  fontFamily: displayFamily(lang),
                  fontSize: index === 2 ? 29 : 22,
                  lineHeight: 1.25,
                  fontWeight: index === 2 ? 500 : 400,
                  color: index === 2 ? P.inkText : "rgba(251,246,239,0.46)",
                  marginTop: index === 2 ? 5 : 0,
                }}
              >
                {text(line, lang)}
              </p>
            ))}
          </div>
          <SlideCaption dark style={{ marginTop: 9, color: "rgba(217,185,129,0.66)" }}>
            {text(DECK_COPY.dataFields, lang)}
          </SlideCaption>
        </div>

        <div
          dir={lang === "he" ? "rtl" : "ltr"}
          style={{
            borderTop: "1px solid rgba(217,185,129,0.42)",
            paddingTop: 14,
            paddingInlineStart: 28,
            borderInlineStart: "1px solid rgba(217,185,129,0.2)",
          }}
        >
          <SlideKicker dark>{text(DECK_COPY.dataPilotKicker, lang)}</SlideKicker>
          <SlideTitle
            lang={lang}
            size="sub"
            dark
            style={{ marginTop: 14, maxWidth: lang === "he" ? "15em" : "17em", fontSize: 28, lineHeight: 1.28 }}
          >
            {text(DECK_COPY.dataPilotBody, lang)}
          </SlideTitle>
        </div>
      </div>
    </PresentationSlide>
  );
};

/* ------------------------------------------------------------- 07 Market size */

const MarketSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={8}
    total={TOTAL}
    chapter={text(REVISION.market.kicker, lang)}
    lang={lang}
    tone="paper"
    align="between"
  >
    <div>
      <SlideKicker>{text(REVISION.market.kicker, lang)}</SlideKicker>
      <SlideTitle lang={lang} size="feature" style={{ marginTop: 22, maxWidth: "22ch" }}>
        {text(REVISION.market.title, lang)}
      </SlideTitle>
    </div>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "stretch" }}>
        <div style={{ paddingBlock: 28, paddingInlineEnd: 72 }}>
          <SlideKicker>{text(REVISION.market.servicesLabel, lang)}</SlideKicker>
          <SlideFigure value={REVISION.market.servicesFigure} lang={lang} size={92} style={{ marginTop: 18 }} />
          <SlideCaption style={{ marginTop: 16 }}>{text(REVISION.market.servicesCaption, lang)}</SlideCaption>
          <SlideTitle lang={lang} size="sub" style={{ marginTop: 22 }}>
            {text(REVISION.market.servicesFuture, lang)}
          </SlideTitle>
          <SlideBody style={{ marginTop: 14 }}>{text(REVISION.market.servicesCagr, lang)}</SlideBody>
          <SlideKicker style={{ marginTop: 22, color: P.accentDeep }}>
            {text(REVISION.market.servicesHair, lang)}
          </SlideKicker>
        </div>
        <div
          style={{
            paddingBlock: 28,
            paddingInlineStart: 72,
            borderInlineStart: "1px solid rgba(43,34,27,0.12)",
          }}
        >
          <SlideKicker>{text(REVISION.market.productsLabel, lang)}</SlideKicker>
          <SlideFigure value={REVISION.market.productsFigure} lang={lang} size={92} style={{ marginTop: 18 }} />
          <SlideCaption style={{ marginTop: 16 }}>{text(REVISION.market.productsCaption, lang)}</SlideCaption>
          <SlideTitle lang={lang} size="sub" style={{ marginTop: 22 }}>
            {text(REVISION.market.productsFuture, lang)}
          </SlideTitle>
          <SlideBody style={{ marginTop: 14 }}>{text(REVISION.market.productsCagr, lang)}</SlideBody>
          <SlideKicker style={{ marginTop: 22, color: P.accentDeep }}>
            {text(REVISION.market.productsHair, lang)}
          </SlideKicker>
        </div>
      </div>
      <Hair strong />
    </div>

    <div>
      <SlideTitle lang={lang} size="chapter" italic accent style={{ maxWidth: "36ch" }}>
        {text(REVISION.market.close, lang)}
      </SlideTitle>
      <SlideFine style={{ marginTop: 18, maxWidth: 1180 }}>{text(REVISION.market.sources, lang)}</SlideFine>
    </div>
  </PresentationSlide>
);

/* ------------------------------------------------------------- appendix: six salons */

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

/* --------------------------------------------------------- appendix: salon economics */

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

/* ----------------------------------------------------------- 09 Salon AI */

const SalonAiSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={10}
    total={TOTAL}
    chapter={text(FINAL_CHAPTERS.platform.title, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.shelves,
      overlay: "linear-gradient(110deg,rgba(9,6,4,0.96),rgba(9,6,4,0.76))",
      opacity: 0.22,
    }}
  >
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 508px",
        gap: 72,
        alignItems: "stretch",
        height: "100%",
      }}
    >
      <div
        dir={lang === "he" ? "rtl" : "ltr"}
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minWidth: 0,
        }}
      >
        <div>
          <SlideChapterMark
            number="09"
            title={text(REVISION.salonAi.kicker, lang)}
            lang={lang}
            dark
          />
          <SlideTitle lang={lang} size="feature" dark style={{ marginTop: 28, maxWidth: "16ch" }}>
            {text(REVISION.salonAi.title, lang)}
          </SlideTitle>
        </div>

        <div
          dir="ltr"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 10,
          }}
        >
          {REVISION.salonAi.steps.map((step, index) => {
            const Icon = SALON_AI_STEP_ICONS[step.en];
            return (
              <React.Fragment key={step.en}>
                {index > 0 ? (
                  <span aria-hidden="true" style={{ color: "rgba(217,185,129,0.5)", fontSize: 20, paddingInline: 4 }}>
                    →
                  </span>
                ) : null}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 14px",
                    border: "1px solid rgba(255,255,255,0.16)",
                  }}
                >
                  <Icon size={20} strokeWidth={1.4} style={{ color: P.accentDark, flexShrink: 0 }} />
                  <span
                    dir={lang === "he" ? "rtl" : "ltr"}
                    style={{
                      fontSize: 16,
                      fontWeight: 500,
                      letterSpacing: "0.04em",
                      color: P.inkText,
                    }}
                  >
                    {text(step, lang)}
                  </span>
                </div>
              </React.Fragment>
            );
          })}
          <span aria-hidden="true" style={{ color: "rgba(217,185,129,0.5)", fontSize: 20, paddingInline: 4 }}>
            →
          </span>
          <span
            dir={lang === "he" ? "rtl" : "ltr"}
            style={{
              fontFamily: displayFamily(lang),
              fontSize: 26,
              lineHeight: 1.2,
              fontWeight: 500,
              color: P.accentDark,
              whiteSpace: "nowrap",
            }}
          >
            {text(REVISION.salonAi.destination, lang)}
          </span>
        </div>

        <div
          aria-label={text(DECK_UI_COPY.salonAiCapabilitiesLabel, lang)}
          style={{
            width: "100%",
            maxWidth: 900,
          }}
        >
          <SlideKicker dark>{text(DECK_UI_COPY.salonAiCapabilitiesKicker, lang)}</SlideKicker>
          <div
            style={{
              marginTop: 14,
              display: "grid",
              gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
              borderTop: "1px solid rgba(255,255,255,0.16)",
            }}
          >
            {SALON_AI_HIGHLIGHTS.map((item, index) => {
              const Icon = PLATFORM_CAPABILITY_ICONS[item.title.en];
              return (
                <div
                  key={item.title.en}
                  dir={lang === "he" ? "rtl" : "ltr"}
                  style={{
                    padding: index === 0 ? "18px 24px 0 0" : "18px 24px 0",
                    borderInlineStart: index === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
                  }}
                >
                  <Icon size={19} strokeWidth={1.4} style={{ color: P.accentDark }} aria-hidden="true" />
                  <p
                    style={{
                      marginTop: 11,
                      fontFamily: displayFamily(lang),
                      fontSize: 21,
                      lineHeight: 1.2,
                      color: P.inkText,
                    }}
                  >
                    {text(item.title, lang)}
                  </p>
                  <SlideCaption dark style={{ marginTop: 7, lineHeight: 1.4 }}>
                    {text(item.body, lang)}
                  </SlideCaption>
                </div>
              );
            })}
          </div>
        </div>

        <SlideLede dark style={{ maxWidth: "34ch" }}>
          {text(REVISION.salonAi.close, lang)}
        </SlideLede>
      </div>

      <figure>
        <div style={{ border: "1px solid rgba(255,255,255,0.14)" }}>
          <img
            src={MEDIA.salonAiPhone}
            width={960}
            height={1200}
            alt={text(DECK_UI_COPY.salonAiPhoneAlt, lang)}
            style={{ display: "block", width: 508, height: 635, objectFit: "cover" }}
          />
        </div>
        {text(FINAL_SALON_AI.caption, lang) ? (
          <figcaption style={{ marginTop: 16, width: 508 }}>
            <SlideCaption dark>{text(FINAL_SALON_AI.caption, lang)}</SlideCaption>
          </figcaption>
        ) : null}
      </figure>
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------- 07 Two-sided */

const OpportunitySlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={9}
    total={TOTAL}
    chapter={text(REVISION.twoSided.kicker, lang)}
    lang={lang}
    tone="warm"
    align="between"
  >
    <div>
      <SlideKicker>{text(REVISION.twoSided.kicker, lang)}</SlideKicker>
      <SlideTitle lang={lang} size="feature" style={{ marginTop: 26, maxWidth: "22ch" }}>
        {text(REVISION.twoSided.title, lang)}
      </SlideTitle>
    </div>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "stretch" }}>
        <div style={{ paddingBlock: 30, paddingInlineEnd: 72 }}>
          <SlideKicker>{text(REVISION.twoSided.salonsLabel, lang)}</SlideKicker>
          <p
            dir={lang === "he" ? "rtl" : "ltr"}
            style={{ marginTop: 13, fontSize: 16, fontWeight: 600, color: P.accentDeep }}
          >
            {text(REVISION.twoSided.salonsModel, lang)}
          </p>
          <SlideTitle lang={lang} size="chapter" style={{ marginTop: 20, maxWidth: "24ch" }}>
            {text(REVISION.twoSided.salonsNeed, lang)}
          </SlideTitle>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 18,
            paddingInline: 36,
            paddingBlock: 8,
            minWidth: 260,
          }}
        >
          <div style={{ position: "relative", width: 196, height: 196, display: "grid", placeItems: "center" }}>
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -14,
                borderRadius: "50%",
                border: `1px solid ${P.accentDark}`,
                opacity: 0.28,
              }}
            />
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: -28,
                borderRadius: "50%",
                border: `1px solid ${P.accentDark}`,
                opacity: 0.12,
              }}
            />
            <SpectraOrb size={196} reducedMotion />
          </div>
          <p
            dir="ltr"
            style={{
              margin: 0,
              fontFamily: displayFamily(lang),
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.04em",
              lineHeight: 1.2,
              textAlign: "center",
              color: P.accentDark,
            }}
          >
            {text(REVISION.twoSided.center, lang)}
          </p>
        </div>

        <div style={{ paddingBlock: 30, paddingInlineStart: 72 }}>
          <SlideKicker>{text(REVISION.twoSided.brandsLabel, lang)}</SlideKicker>
          <p
            dir={lang === "he" ? "rtl" : "ltr"}
            style={{ marginTop: 13, fontSize: 16, fontWeight: 600, color: P.accentDeep }}
          >
            {text(REVISION.twoSided.brandsModel, lang)}
          </p>
          <SlideTitle lang={lang} size="chapter" style={{ marginTop: 20, maxWidth: "26ch" }}>
            {text(REVISION.twoSided.brandsNeed, lang)}
          </SlideTitle>
        </div>
      </div>
      <Hair strong />
    </div>

    <SlideTitle lang={lang} size="sub" italic accent style={{ maxWidth: "28ch" }}>
      {text(REVISION.twoSided.close, lang)}
    </SlideTitle>
  </PresentationSlide>
);

/* ------------------------------------------------------- 11 Business model */

const BusinessModelSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={11}
    total={TOTAL}
    chapter={text(REVISION.model.kicker, lang)}
    lang={lang}
    tone="warm"
    align="between"
  >
    <div>
      <SlideKicker>{text(REVISION.model.kicker, lang)}</SlideKicker>
      <SlideTitle lang={lang} size="feature" style={{ marginTop: 22, maxWidth: "22ch" }}>
        {text(REVISION.model.title, lang)}
      </SlideTitle>
    </div>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ paddingBlock: 28, paddingInlineEnd: 64 }}>
          <SlideKicker>{text(REVISION.model.salonLabel, lang)}</SlideKicker>
          <SlideTitle lang={lang} size="sub" style={{ marginTop: 20, maxWidth: "28ch" }}>
            {text(REVISION.model.salonPays, lang)}
          </SlideTitle>
          {text(REVISION.model.salonModel, lang) ? (
            <SlideBody style={{ marginTop: 16 }}>{text(REVISION.model.salonModel, lang)}</SlideBody>
          ) : null}
        </div>
        <div
          style={{
            paddingBlock: 28,
            paddingInlineStart: 64,
            borderInlineStart: "1px solid rgba(43,34,27,0.12)",
          }}
        >
          <SlideKicker>{text(REVISION.model.brandsLabel, lang)}</SlideKicker>
          <SlideTitle lang={lang} size="sub" style={{ marginTop: 20, maxWidth: "30ch" }}>
            {text(REVISION.model.brandsPays, lang)}
          </SlideTitle>
          {text(REVISION.model.brandsModel, lang) ? (
            <SlideBody style={{ marginTop: 16 }}>{text(REVISION.model.brandsModel, lang)}</SlideBody>
          ) : null}
          <SlideFine style={{ marginTop: 16, whiteSpace: "pre-line", lineHeight: 1.7 }}>
            {text(REVISION.model.brandsData, lang)}
          </SlideFine>
        </div>
      </div>
      <Hair strong />
    </div>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        <div style={{ paddingBlock: 26, paddingInlineEnd: 54 }}>
          <SlideKicker>{text(BUSINESS_MODEL_LABELS.salonArpu, lang)}</SlideKicker>
          <SlideFine style={{ marginTop: 8 }}>{text(BUSINESS_MODEL_LABELS.salonArpuNote, lang)}</SlideFine>

          <div style={{ marginTop: 16 }}>
            {SALON_SUBSCRIPTION_TIERS.map((tier, index) => (
              <div
                key={tier.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 20,
                  paddingBlock: 9,
                  borderTop: index === 0 ? "none" : "1px solid rgba(43,34,27,0.1)",
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: P.text }}>{tier.name}</p>
                  <SlideFine style={{ marginTop: 2 }}>{text(tier.scope, lang)}</SlideFine>
                </div>
                <p
                  dir="ltr"
                  style={{
                    fontFamily: displayFamily(lang),
                    fontSize: 24,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    color: index === SALON_SUBSCRIPTION_TIERS.length - 1 ? P.accentDeep : P.text,
                  }}
                >
                  {tier.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            paddingBlock: 26,
            paddingInlineStart: 54,
            borderInlineStart: "1px solid rgba(43,34,27,0.12)",
          }}
        >
          <SlideKicker>{text(BUSINESS_MODEL_LABELS.dataSubscriptions, lang)}</SlideKicker>
          <SlideFine style={{ marginTop: 8 }}>{text(BUSINESS_MODEL_LABELS.dataSubscriptionsNote, lang)}</SlideFine>

          <div style={{ marginTop: 16 }}>
            {DATA_SUBSCRIPTION_TIERS.map((tier, index) => (
              <div
                key={tier.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  alignItems: "center",
                  gap: 20,
                  paddingBlock: 9,
                  borderTop: index === 0 ? "none" : "1px solid rgba(43,34,27,0.1)",
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: P.text }}>{tier.name}</p>
                  <SlideFine style={{ marginTop: 2 }}>{text(tier.customer, lang)}</SlideFine>
                </div>
                <p
                  dir="ltr"
                  style={{
                    fontFamily: displayFamily(lang),
                    fontSize: 24,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    color: index === DATA_SUBSCRIPTION_TIERS.length - 1 ? P.accentDeep : P.text,
                  }}
                >
                  {tier.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </PresentationSlide>
);

/* ---------------------------------------------------------- 12 Competition */

const CompetitionSlide: React.FC<SlideProps> = ({ lang }) => {
  const [salonLayer, ...otherLayers] = REVISION.competition.categories;

  return (
    <PresentationSlide
    index={12}
    total={TOTAL}
    chapter={text(REVISION.competition.kicker, lang)}
      lang={lang}
      tone="paper"
      align="between"
    >
      <div>
        <SlideKicker>{text(REVISION.competition.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="feature" style={{ marginTop: 16, maxWidth: "25ch", fontSize: 62, lineHeight: 1.06 }}>
          {text(REVISION.competition.title, lang)}
        </SlideTitle>
      </div>

      <div>
        <SlideKicker>{text(salonLayer.label, lang)}</SlideKicker>
        <Hair strong style={{ marginTop: 12 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 28 }}>
          {salonLayer.players.map((player) => (
            <article
              key={player.name.en}
              style={{
                padding: "20px 22px 18px",
                borderTop: `2px solid ${P.accent}`,
                background: "rgba(255,255,255,0.3)",
              }}
            >
              <p
                style={{
                  fontSize: TYPE.kicker,
                  fontWeight: 600,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  color: "rgba(43,34,27,0.48)",
                }}
              >
                {text(player.name, lang)}
              </p>
              {"adoption" in player ? (
                <div style={{ marginTop: 14, minHeight: 76 }}>
                  {player.adoption.map((line) => (
                    <SlideCaption key={line.en} style={{ marginTop: 3, color: "rgba(43,34,27,0.68)" }}>
                      {text(line, lang)}
                    </SlideCaption>
                  ))}
                </div>
              ) : null}
              {"value" in player && player.value ? (
                <SlideFigure value={text(player.value, lang)} lang={lang} size={48} color={P.accentDeep} style={{ marginTop: 14 }} />
              ) : null}
              {"note" in player && player.note ? (
                <SlideKicker style={{ marginTop: 6, fontSize: 12, color: "rgba(43,34,27,0.42)" }}>
                  {text(player.note, lang)}
                </SlideKicker>
              ) : null}
            </article>
          ))}
        </div>
      </div>

      <div>
        <Hair />
        {otherLayers.map((row) => (
          <div
            key={row.label.en}
            style={{
              display: "grid",
              gridTemplateColumns: "0.28fr 1fr",
              gap: 32,
              alignItems: "baseline",
              paddingBlock: 14,
              borderBottom: "1px solid rgba(43,34,27,0.12)",
            }}
          >
            <p
              style={{
                fontSize: TYPE.kicker,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "rgba(43,34,27,0.4)",
              }}
            >
              {text(row.label, lang)}
            </p>
            <p style={{ fontFamily: displayFamily(lang), fontSize: 24, lineHeight: 1.2, color: "rgba(43,34,27,0.72)" }}>
              {row.players.map((player) => text(player.name, lang)).join("  ·  ")}
            </p>
          </div>
        ))}
      </div>

      <div>
        <SlideTitle lang={lang} size="sub" italic accent style={{ maxWidth: "52ch", fontSize: 28, lineHeight: 1.28 }}>
          {text(REVISION.competition.spectra, lang)}
        </SlideTitle>
        <SlideFine style={{ marginTop: 8, maxWidth: 1220 }}>{text(REVISION.competition.sources, lang)}</SlideFine>
      </div>
    </PresentationSlide>
  );
};

/* ------------------------------------------------------ 13 Founders */

const TEAM_WHY: Record<string, Localized> = {
  "Maor Ganon": REVISION.founders.maorWhy,
  "Elad Gotlieb": REVISION.founders.eladWhy,
  Achela: REVISION.founders.achelaWhy,
  Lital: REVISION.founders.litalWhy,
  "Yaar Ben-Jay": REVISION.founders.yaarWhy,
};

const teamRoleStyle: React.CSSProperties = {
  fontSize: TYPE.fine,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  lineHeight: 1.4,
  color: "rgba(43,34,27,0.46)",
};

export const FOUNDER_STORY_TEAM = {
  founders: FOUNDER_MEDIA.map((media) => ({
    media,
    member: CORE_TEAM.find((person) => person.name.en === media.key)!,
    role: media.key === "Maor Ganon" ? REVISION.founders.maorRole : REVISION.founders.eladRole,
    focus: media.key === "Maor Ganon" ? REVISION.founders.maorFocus : REVISION.founders.eladFocus,
    why: TEAM_WHY[media.key],
  })),
  achela: {
    member: CORE_TEAM.find((person) => person.name.en === "Achela")!,
    role: REVISION.founders.achelaRole,
    focus: REVISION.founders.achelaFocus,
    why: REVISION.founders.achelaWhy,
  },
  coreTeam: CORE_TEAM.filter((person) => person.name.en === "Lital" || person.name.en === "Yaar Ben-Jay").map(
    (member) => ({
      ...member,
      role: member.name.en === "Lital" ? REVISION.founders.litalRole : REVISION.founders.yaarRole,
      why: TEAM_WHY[member.name.en],
    }),
  ),
};

const TeamSlide: React.FC<SlideProps> = ({ lang }) => {
  const { founders, achela, coreTeam } = FOUNDER_STORY_TEAM;

  return (
    <PresentationSlide
      index={13}
      total={TOTAL}
      chapter={text(REVISION.founders.kicker, lang)}
      lang={lang}
      tone="paper"
      align="between"
    >
      <div>
        <SlideKicker>{text(REVISION.founders.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="chapter" style={{ marginTop: 22, maxWidth: "34ch" }}>
          {text(REVISION.founders.title, lang)}
        </SlideTitle>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "0.58fr 0.42fr", gap: 80, alignItems: "start" }}>
        <ul style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, listStyle: "none" }}>
          {founders.map(({ media, member, role, focus, why }) => (
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
                    alt={founderPortraitAlt(member.name, role, lang)}
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
                  <p style={{ ...teamRoleStyle, marginTop: 10 }}>{text(role, lang)}</p>
                  <SlideBody style={{ marginTop: 12, maxWidth: "28ch" }}>{text(focus, lang)}</SlideBody>
                  <SlideCaption style={{ marginTop: 8 }}>{text(why, lang)}</SlideCaption>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>

        <div>
          <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>{text(REVISION.founders.techKicker, lang)}</SlideKicker>
          <dl style={{ marginTop: 18 }}>
            <Hair strong />
            <div style={{ paddingBlock: 17, borderBottom: "1px solid rgba(43,34,27,0.1)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 40 }}>
                <dt style={{ fontFamily: displayFamily(lang), fontSize: 28, lineHeight: 1.15, color: P.text }}>
                  {text(achela.member.name, lang)}
                </dt>
                <dd style={teamRoleStyle}>{text(achela.role, lang)}</dd>
              </div>
              <dd>
                <SlideBody style={{ marginTop: 10 }}>{text(achela.focus, lang)}</SlideBody>
                <SlideCaption style={{ marginTop: 6, maxWidth: "42ch" }}>{text(achela.why, lang)}</SlideCaption>
              </dd>
            </div>
          </dl>

          <SlideKicker style={{ marginTop: 28, color: "rgba(43,34,27,0.45)" }}>
            {text(REVISION.founders.teamKicker, lang)}
          </SlideKicker>
          <dl style={{ marginTop: 18 }}>
            <Hair strong />
            {coreTeam.map((member) => (
              <div
                key={member.name.en}
                style={{
                  paddingBlock: 17,
                  borderBottom: "1px solid rgba(43,34,27,0.1)",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 40 }}>
                  <dt style={{ fontFamily: displayFamily(lang), fontSize: 26, lineHeight: 1.15, color: P.text }}>
                    {text(member.name, lang)}
                  </dt>
                  <dd style={teamRoleStyle}>{text(member.role, lang)}</dd>
                </div>
                <dd style={{ marginTop: 6 }}>
                  <SlideCaption style={{ maxWidth: "42ch" }}>{text(member.why, lang)}</SlideCaption>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </PresentationSlide>
  );
};

/* ------------------------------------------------- 14 Advisors & investors */

const AdvisorsSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={14}
    total={TOTAL}
    chapter={text(REVISION.advisors.kicker, lang)}
    lang={lang}
    tone="warm"
    align="between"
  >
    <div>
      <SlideKicker>{text(REVISION.advisors.kicker, lang)}</SlideKicker>
      <SlideTitle lang={lang} size="chapter" style={{ marginTop: 12, maxWidth: "32ch", fontSize: 46 }}>
        {text(REVISION.advisors.title, lang)}
      </SlideTitle>
    </div>

    <dl>
      <Hair strong />
      {REVISION.advisors.people.map((person) => (
        <div
          key={person.name.en}
          style={{
            display: "grid",
            gridTemplateColumns: "0.28fr 0.34fr 0.38fr",
            gap: 32,
            alignItems: "baseline",
            paddingBlock: 9,
            borderBottom: "1px solid rgba(43,34,27,0.12)",
          }}
        >
          <dt style={{ fontFamily: displayFamily(lang), fontSize: 26, lineHeight: 1.15, color: P.text }}>
            {text(person.name, lang)}
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
            {text(person.role, lang)}
          </dd>
          <dd>
            {text(person.background, lang) ? (
              <SlideCaption style={{ marginBottom: 4 }}>{text(person.background, lang)}</SlideCaption>
            ) : null}
            <p style={{ fontSize: 18, fontWeight: 300, lineHeight: 1.35, color: P.text }}>
              {text(person.help, lang)}
            </p>
          </dd>
        </div>
      ))}
    </dl>
  </PresentationSlide>
);

/* ------------------------------------------------- 05 GTM proof */

export const GTM_FUNNEL_WIDTHS = ["100%", "67%", "46%"] as const;
export const GTM_FUNNEL_FILLS = ["#d9b981", "#b1844d", "#8c6537"] as const;

export const GTM_MONEY = [
  { value: FINAL_SAAS.funnel[3].value, label: FINAL_SAAS.funnel[3].label },
  { value: FINAL_GTM.revenueToDate.en, label: FINAL_GTM.revenueToDateLabel },
  { value: FINAL_SAAS.unit[2].value, label: FINAL_GTM.ltvLabel },
] as const;

const CommercialSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={5}
    total={TOTAL}
    chapter={text(FINAL_GTM.kicker, lang)}
    lang={lang}
    tone="ink"
    bleed={{
      image: MEDIA.colorBar,
      overlay: "linear-gradient(105deg,rgba(9,6,4,0.95),rgba(9,6,4,0.78))",
      opacity: 0.28,
    }}
    align="between"
  >
    <div style={{ display: "grid", gridTemplateColumns: "0.62fr 0.38fr", gap: 72, alignItems: "end" }}>
      <div>
        <SlideKicker dark>{text(FINAL_GTM.kicker, lang)}</SlideKicker>
        <SlideTitle lang={lang} size="feature" dark style={{ marginTop: 22, maxWidth: "16ch" }}>
          {text(FINAL_GTM.title, lang)}
        </SlideTitle>
      </div>
      <div>
        <SlideFigure value={FINAL_SAAS.spend} lang={lang} size={88} color={P.inkText} />
        <SlideKicker dark style={{ marginTop: 14, color: "rgba(251,246,239,0.46)" }}>
          {text(FINAL_GTM.spendLabel, lang)}
        </SlideKicker>
      </div>
    </div>

    <div dir="ltr">
      {FINAL_SAAS.funnel.slice(0, 3).map((stage, index) => (
        <div
          key={stage.value}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 28,
            minHeight: 72,
            marginBottom: index < 2 ? 12 : 0,
            paddingInline: 28,
            width: GTM_FUNNEL_WIDTHS[index],
            background: GTM_FUNNEL_FILLS[index],
            color: P.ink,
          }}
        >
          <span
            style={{
              fontFamily: displayFamily(lang),
              fontSize: 42,
              lineHeight: 1.1,
              letterSpacing: "-0.025em",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {stage.value}
          </span>
          <span
            dir={lang === "he" ? "rtl" : "ltr"}
            style={{
              fontSize: TYPE.kicker,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              color: "rgba(23,17,13,0.62)",
            }}
          >
            {text(stage.label, lang)}
          </span>
        </div>
      ))}
    </div>

    <div>
      <Hair dark />
      <div dir="ltr" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", paddingTop: 22 }}>
        {GTM_MONEY.map((item, index) => (
          <div
            key={item.label.en}
            style={{
              paddingInline: index === 0 ? "0 32px" : "32px",
              borderInlineStart: index === 0 ? "none" : "1px solid rgba(255,255,255,0.12)",
            }}
          >
            <SlideFigure value={item.value} lang={lang} size={56} color={P.accentDark} />
            <SlideKicker dark style={{ marginTop: 12, color: "rgba(251,246,239,0.46)" }}>
              {text(item.label, lang)}
            </SlideKicker>
          </div>
        ))}
      </div>
    </div>

    <div>
      <SlideTitle lang={lang} size="sub" italic accent dark style={{ maxWidth: "22ch" }}>
        {text(FINAL_GTM.close, lang)}
      </SlideTitle>
      <SlideFine dark style={{ marginTop: 14 }}>
        {text(FINAL_GTM.caption, lang)}
      </SlideFine>
    </div>
  </PresentationSlide>
);

/* ----------------------------------------------------------------- 16 Raise */

const RaiseSlide: React.FC<SlideProps> = ({ lang }) => {
  const raise = useDeckVariant().raise;
  return (
    <PresentationSlide
      index={15}
      total={TOTAL}
      chapter={text(FINAL_CHAPTERS.opportunity.title, lang)}
      lang={lang}
      tone="paper"
      align="between"
    >
      <div style={{ display: "grid", gridTemplateColumns: "0.29fr 0.71fr", gap: 88, alignItems: "start" }}>
        <div>
          <SlideKicker>{text(raise.kicker, lang)}</SlideKicker>
          <SlideFigure value={raise.amount.en} lang={lang} size={112} style={{ marginTop: 16 }} />
          <SlideKicker style={{ marginTop: 10, color: "rgba(43,34,27,0.42)", fontSize: 12 }}>
            {text(raise.raisedToDate, lang)}
          </SlideKicker>
          {text(raise.body, lang) ? (
            <SlideBody style={{ marginTop: 8, fontSize: 18 }}>{text(raise.body, lang)}</SlideBody>
          ) : null}
        </div>
        <div>
          <SlideTitle lang={lang} size="chapter" style={{ maxWidth: "27ch" }}>
            {text(raise.title, lang)}
          </SlideTitle>
          {raise.narrative.length ? (
            <div style={{ marginTop: 18, maxWidth: 1000 }}>
              {raise.narrative.map((paragraph, index) => (
                <SlideBody key={paragraph.en} style={{ marginTop: index === 0 ? 0 : 7, fontSize: 18, lineHeight: 1.45 }}>
                  {text(paragraph, lang)}
                </SlideBody>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div>
        <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>
          {text(DECK_UI_COPY.raiseMissionsKicker, lang)}
        </SlideKicker>
        <div
          style={{
            marginTop: 14,
            borderBlock: "1px solid rgba(43,34,27,0.16)",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
          }}
        >
          {raise.columns.map((item, index) => (
            <div
              key={item.title.en}
              style={{
                minHeight: 150,
                paddingBlock: 20,
                paddingInline: index === 0 ? "0 42px" : "42px",
                borderInlineStart: index === 0 ? "none" : "1px solid rgba(43,34,27,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                <SlideKicker style={{ color: "rgba(43,34,27,0.32)" }}>0{index + 1}</SlideKicker>
                <SlideTitle lang={lang} size="sub" accent style={{ fontSize: 36 }}>
                  {text(item.title, lang)}
                </SlideTitle>
              </div>
              <SlideBody style={{ marginTop: 12, maxWidth: "31ch", fontSize: 19, lineHeight: 1.45 }}>
                {text(item.body, lang)}
              </SlideBody>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SlideKicker style={{ color: "rgba(43,34,27,0.45)" }}>{text(REVISION.raise.fundsLabel, lang)}</SlideKicker>
        <div
          style={{
            marginTop: 11,
            paddingTop: 13,
            borderTop: "1px solid rgba(43,34,27,0.16)",
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
          }}
        >
          {raise.funds.map((item, index) => (
            <div
              key={item.label.en}
              style={{
                paddingInline: index === 0 ? "0 22px" : "22px",
                borderInlineStart: index === 0 ? "none" : "1px solid rgba(43,34,27,0.1)",
              }}
            >
              <SlideKicker style={{ fontSize: 12 }}>{text(item.label, lang)}</SlideKicker>
              <SlideBody style={{ marginTop: 7, fontSize: 15, lineHeight: 1.4 }}>
                {text(item.body, lang)}
              </SlideBody>
            </div>
          ))}
        </div>
      </div>

      <div>
        <SlideTitle lang={lang} size="sub" italic accent style={{ maxWidth: "38ch", fontSize: 32 }}>
          {text(raise.conclusion, lang)}
        </SlideTitle>
        {text(raise.finePrint, lang) ? <SlideFine style={{ marginTop: 10 }}>{text(raise.finePrint, lang)}</SlideFine> : null}
      </div>
    </PresentationSlide>
  );
};

/* ---------------------------------------------------------- 17 Strategic exit */

const ExitSlide: React.FC<SlideProps> = ({ lang }) => (
  <PresentationSlide
    index={16}
    total={TOTAL}
    chapter={text(REVISION.exit.kicker, lang)}
    lang={lang}
    tone="paper"
    align="between"
  >
    <div>
      <SlideKicker>{text(REVISION.exit.kicker, lang)}</SlideKicker>
      <SlideTitle lang={lang} size="feature" style={{ marginTop: 18, maxWidth: "34ch", fontSize: 64 }}>
        {text(REVISION.exit.title, lang)}
      </SlideTitle>
      {text(REVISION.exit.tags, lang) ? (
        <SlideKicker style={{ marginTop: 16, color: "rgba(43,34,27,0.45)" }}>
          {text(REVISION.exit.tags, lang)}
        </SlideKicker>
      ) : null}
    </div>

    <div>
      <Hair strong />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
        {REVISION.exit.categories.map((item, index) => (
          <div
            key={item.label.en}
            style={{
              paddingBlock: 17,
              paddingInline: index % 2 === 0 ? "0 48px" : "48px 0",
              borderInlineStart: index % 2 === 0 ? "none" : "1px solid rgba(43,34,27,0.12)",
              borderBottom: index < 2 ? "1px solid rgba(43,34,27,0.12)" : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <SlideKicker style={{ color: "rgba(43,34,27,0.34)" }}>{item.serial}</SlideKicker>
              <SlideKicker>{text(item.label, lang)}</SlideKicker>
            </div>
            <p
              dir="ltr"
              style={{
                marginTop: 11,
                color: "rgba(43,34,27,0.78)",
                fontSize: 17,
                fontWeight: 600,
                lineHeight: 1.35,
                letterSpacing: "0.01em",
              }}
            >
              {item.names.join("  ·  ")}
            </p>
            <SlideBody style={{ marginTop: 9, maxWidth: "48ch", fontSize: 18, lineHeight: 1.45 }}>
              {text(item.body, lang)}
            </SlideBody>
          </div>
        ))}
      </div>
      <Hair strong />
    </div>

    <div>
      <SlideTitle lang={lang} size="chapter" italic accent style={{ maxWidth: "43ch", fontSize: 38, lineHeight: 1.25 }}>
        {text(REVISION.exit.close, lang)}
      </SlideTitle>
      {text(REVISION.exit.disclaimer, lang) ? (
        <SlideFine style={{ marginTop: 14 }}>{text(REVISION.exit.disclaimer, lang)}</SlideFine>
      ) : null}
    </div>
  </PresentationSlide>
);

/* --------------------------------------------------------------- 18 Closing */

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
          marginTop: 42,
          display: "grid",
          gridTemplateColumns: "0.52fr 0.48fr",
          gap: 88,
          alignItems: "start",
        }}
      >
        <SlideLede dark>{text(FINAL_CLOSE.body, lang)}</SlideLede>
        <SlideTitle lang={lang} size="feature" accent dark style={{ maxWidth: "16ch", paddingTop: 56 }}>
          {text(FINAL_CLOSE.ask, lang)}
        </SlideTitle>
      </div>
    </div>

    <div>
      <Hair dark strong />
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "0.36fr 0.34fr 0.18fr auto",
          gap: 36,
          alignItems: "end",
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
        <div style={{ display: "grid", gap: 12 }}>
          {FINAL_CLOSE.contacts.map((person) => (
            <div key={person.email}>
              <SlideCaption dark>{text(person.name, lang)}</SlideCaption>
              <a
                href={`mailto:${person.email}`}
                dir="ltr"
                style={{
                  display: "block",
                  marginTop: 4,
                  color: P.inkText,
                  fontSize: 20,
                  fontWeight: 400,
                  letterSpacing: "-0.01em",
                  textDecoration: "none",
                }}
              >
                {person.email}
              </a>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {(
            [
              { ...FINAL_CLOSE.social.instagram, Icon: Instagram },
              { ...FINAL_CLOSE.social.youtube, Icon: Youtube },
            ] as const
          ).map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              dir="ltr"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "rgba(251,246,239,0.72)",
                fontSize: 16,
                fontWeight: 500,
                letterSpacing: "0.04em",
                textDecoration: "none",
              }}
            >
              <item.Icon size={16} strokeWidth={1.6} />
              {item.label}
            </a>
          ))}
        </div>
        <div style={{ alignSelf: "end", transform: "translateY(-6px)" }}>
          <SalonAiLockup tone="ink" size="close" reducedMotion />
        </div>
      </div>
    </div>
  </PresentationSlide>
);

/* -------------------------------------------------------------------- deck */

const SLIDES: readonly React.FC<SlideProps>[] = [
  CoverSlide,
  OriginSlide,
  ColorSlide,
  AdoptionSlide,
  CommercialSlide,
  TurningPointSlide,
  DataLayerSlide,
  MarketSlide,
  OpportunitySlide,
  SalonAiSlide,
  BusinessModelSlide,
  CompetitionSlide,
  TeamSlide,
  AdvisorsSlide,
  RaiseSlide,
  ExitSlide,
  ClosingSlide,
];

export const FOUNDER_STORY_APPENDIX_COPY = { COMPOUNDING } as const;

export const FOUNDER_STORY_APPENDIX_SLIDES: readonly React.FC<SlideProps>[] = [
  SixSalonSlide,
  DecisionBookingSlide,
  SalonEconomicsSlide,
  OwnerMobileSlide,
  ClientMobileSlide,
  BridgeSlide,
];

export const FOUNDER_STORY_SLIDES = SLIDES;
export const FOUNDER_STORY_SLIDE_COUNT = SLIDES.length;

export const FounderStoryDeck: React.FC<{ lang: UpdateLang; variantId?: DeckVariantId }> = ({
  lang,
  variantId = "september2026",
}) => (
  <DeckVariantContext.Provider value={DECK_VARIANTS[variantId]}>
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
  </DeckVariantContext.Provider>
);

export { SLIDE, SLIDE_CONTENT_HEIGHT, SLIDE_CONTENT_WIDTH };
export default FounderStoryDeck;
