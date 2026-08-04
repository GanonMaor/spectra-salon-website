import React, { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { CustomerVideoRail } from "../NewNarrativeSalonAIFirst/visuals/CustomerVideoRail";
import {
  DeviceFrame,
  LIVE_DEMO_ASSETS,
} from "../NewNarrativeSalonAIFirst/sections/liveDemoDraft/DeviceFrame";
import {
  BrowserFrame,
  CalendarGrid,
  LiveClientsVertical,
} from "../NewNarrativeSalonAIFirst/sections/liveDemoDraft/BookingSchedulingIntelligenceDraftSlide";
import { PROOF as GLOBAL_USAGE_PROOF } from "../SpectraProductVision/dataMoat";
import {
  FINAL_CLOSE,
  FINAL_FUNDING,
  FINAL_HERO,
  FINAL_META,
  FINAL_PROOF,
  FINAL_SAAS,
  FINAL_STORY,
  type Localized,
  type UpdateLang,
} from "./finalCopy";

const HERO_IMAGE = LIVE_DEMO_ASSETS.heroReception;
const ease: [number, number, number, number] = [0.22, 1, 0.36, 1];

const text = (value: Localized, lang: UpdateLang) => value[lang];

const LanguageToggle: React.FC<{
  lang: UpdateLang;
  setLang: (lang: UpdateLang) => void;
}> = ({ lang, setLang }) => (
  <div
    className="inline-flex rounded-full border border-[#3e3025]/10 bg-white/70 p-1 shadow-sm"
    role="group"
    aria-label={lang === "he" ? "החלפת שפה" : "Change language"}
  >
    {(["en", "he"] as UpdateLang[]).map((option) => (
      <button
        key={option}
        type="button"
        aria-pressed={lang === option}
        onClick={() => setLang(option)}
        className={`min-h-10 rounded-full px-3 py-1.5 text-[10px] font-semibold transition ${
          lang === option ? "bg-[#2b221b] text-[#fbf6ef]" : "text-[#2b221b]/48"
        }`}
      >
        {option === "en" ? "EN" : "עברית"}
      </button>
    ))}
  </div>
);

type StoryKey = keyof typeof FINAL_STORY;

const StoryPassage: React.FC<{
  storyKeys: StoryKey[];
  lang: UpdateLang;
  reducedMotion: boolean;
}> = ({ storyKeys, lang, reducedMotion }) => {
  const paragraphs = storyKeys.flatMap((storyKey) => [...FINAL_STORY[storyKey].paragraphs[lang]]);
  return (
    <section id={storyKeys[0]} className="scroll-mt-24 px-5 py-14 sm:px-8 sm:py-20">
      <motion.div
        className="mx-auto max-w-3xl"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.6, ease }}
      >
        <div className="space-y-6">
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-[17px] font-light leading-8 text-[#2b221b]/72 sm:text-[19px] sm:leading-9">
              {paragraph}
            </p>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const CinematicBand: React.FC<{
  children: React.ReactNode;
  label: string;
  reducedMotion: boolean;
  background?: string;
  surface?: "photo" | "data" | "ledger";
  layer?: string;
}> = ({ children, label, reducedMotion, background = HERO_IMAGE, surface = "photo", layer }) => (
  <motion.section
    aria-label={label}
    className={`relative overflow-hidden border-y border-white/10 px-5 py-16 text-[#fbf6ef] sm:px-8 sm:py-20 ${
      surface === "data" ? "bg-[#0f1212]" : surface === "ledger" ? "bg-[#0a0a0a]" : "bg-[#17110d]"
    }`}
    initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.08 }}
    transition={{ duration: reducedMotion ? 0.15 : 0.65, ease }}
  >
    {surface === "photo" ? (
      <>
        <div className="absolute inset-0 bg-cover bg-center opacity-38" style={{ backgroundImage: `url('${background}')` }} />
        <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(9,6,4,0.96),rgba(9,6,4,0.75))]" />
        <div className="absolute inset-0 bg-[radial-gradient(55%_65%_at_15%_28%,rgba(217,185,129,0.16),transparent_72%)]" />
      </>
    ) : surface === "data" ? (
      <>
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#0b0f10_0%,#121716_48%,#17130f_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.11]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(217,185,129,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(217,185,129,0.22) 1px, transparent 1px)",
            backgroundSize: "72px 72px",
            maskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent, black 18%, black 82%, transparent)",
          }}
        />
        <div className="absolute -left-32 top-1/2 h-[430px] w-[430px] -translate-y-1/2 rounded-full bg-[#6f9b91]/[0.10] blur-[110px]" />
        <div className="absolute -right-24 top-0 h-[400px] w-[400px] rounded-full bg-[#d9b981]/[0.09] blur-[110px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b981]/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#7ba297]/25 to-transparent" />
      </>
    ) : (
      <>
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#090909_0%,#111111_50%,#090909_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.20) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.20) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />
        <div className="absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#82aa98]/[0.07] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      </>
    )}
    <div className="relative mx-auto max-w-6xl">
      {layer && (
        <div className={`mb-5 flex items-center gap-3 text-[8px] font-semibold uppercase tracking-[0.22em] ${
          surface === "ledger" ? "text-white/30" : "text-[#d9b981]/45"
        }`}>
          <span>{layer}</span>
          <span className={`h-px w-10 bg-gradient-to-r ${
            surface === "ledger" ? "from-white/25" : "from-[#d9b981]/35"
          } to-transparent`} />
        </div>
      )}
      {children}
    </div>
  </motion.section>
);

const OriginAssetBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <CinematicBand
    label={lang === "he" ? "מהעבודה בסלון לדאטה תפעולי" : "From salon work to operating data"}
    reducedMotion={reducedMotion}
    background={LIVE_DEMO_ASSETS.colorBarScale}
    layer={lang === "he" ? "שכבה 01 · Color Intelligence" : "Layer 01 · Color Intelligence"}
  >
    <div className="grid items-center gap-10 lg:grid-cols-[0.42fr_0.58fr]">
      <div>
        <p className="text-base font-light leading-8 text-[#fbf6ef]/65 sm:text-lg">
          {lang === "he"
            ? "שם יכולנו למדוד עבודה אמיתית, חומר אמיתי ועלות אמיתית. לאורך 40 חודשים של שימוש חוזר, נוצרה לנו תמונה רחבה של הדרך שבה סלונים עובדים. היא עדיין לא מספרת הכול, אבל היא נותנת לנו נקודת פתיחה טובה בהרבה לבניית Salon AI מתוך המציאות בשטח."
            : "It gave us a place to measure real work, real material and real cost. Across 40 months of repeated use, we built a broad record of how salons actually work. It does not tell us everything yet, but it gives us a much better starting point for building Salon AI from the reality in the field."}
        </p>
      </div>
      <img
        src={LIVE_DEMO_ASSETS.colorBarComposition}
        alt={lang === "he" ? "מערכת ספקטרה בעמדת הצבע" : "Spectra at the salon color bar"}
        className="mx-auto max-h-[430px] w-full object-contain drop-shadow-[0_28px_65px_rgba(0,0,0,0.55)]"
        loading="lazy"
      />
    </div>
    <div dir="ltr" className="mt-8 grid grid-cols-2 overflow-hidden rounded-3xl border border-white/12 bg-black/20 backdrop-blur-2xl lg:grid-cols-4">
      {[
        {
          value: `${Math.floor(GLOBAL_USAGE_PROOF.visits / 1000)}K+`,
          en: "Customer visits",
          he: "ביקורי לקוחות",
        },
        {
          value: `${Math.floor(GLOBAL_USAGE_PROOF.services / 1000)}K+`,
          en: "Services and formulas",
          he: "שירותים ופורמולות",
        },
        {
          value: `${(GLOBAL_USAGE_PROOF.grams / 1_000_000).toFixed(1)}M`,
          en: "Grams measured",
          he: "גרמים שנמדדו",
        },
        {
          value: String(GLOBAL_USAGE_PROOF.brands),
          en: "Brands observed",
          he: "מותגים שנצפו",
        },
      ].map((metric, index) => (
        <div
          key={metric.en}
          className={`relative px-4 py-5 sm:px-5 ${
            index % 2 !== 0 ? "border-l border-white/10" : ""
          } ${index > 1 ? "border-t border-white/10 lg:border-t-0" : ""} ${index === 2 ? "lg:border-l" : ""}`}
        >
          <div className="pointer-events-none absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[#d9b981]/45 to-transparent" />
          <p className="text-2xl font-light tracking-[-0.035em] text-[#d9b981] sm:text-3xl">{metric.value}</p>
          <p dir={lang === "he" ? "rtl" : "ltr"} className="mt-2 text-[10px] font-light text-[#fbf6ef]/48">
            {lang === "he" ? metric.he : metric.en}
          </p>
        </div>
      ))}
    </div>
    <p className="mt-3 text-[9px] font-light tracking-wide text-[#fbf6ef]/28">
      {lang === "he"
        ? "נתוני שימוש מצטברים ברשת, ינואר 2023 עד אפריל 2026."
        : `Aggregated network usage, ${GLOBAL_USAGE_PROOF.rangeFrom} to ${GLOBAL_USAGE_PROOF.rangeTo}.`}
    </p>
  </CinematicBand>
);

const ProofBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <CinematicBand
    label={lang === "he" ? "בסיס אמיתי להמשך" : "Real ground for the next stage"}
    reducedMotion={reducedMotion}
    layer={lang === "he" ? "שכבה 01 · הוכחה מהשטח" : "Layer 01 · Proof from the field"}
  >
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
      {FINAL_PROOF.map((metric) => (
        <div key={metric.value} className="rounded-2xl border border-white/15 bg-white/[0.10] p-4 backdrop-blur-2xl sm:p-5">
          <p dir="ltr" className="text-3xl font-light tracking-[-0.04em] text-[#d9b981] sm:text-4xl">{metric.value}</p>
          <p className="mt-3 text-xs font-medium">{text(metric.label, lang)}</p>
          <p className="mt-1 text-[10px] text-[#fbf6ef]/42">{text(metric.note, lang)}</p>
        </div>
      ))}
    </div>
    <div className="mt-12 flex flex-wrap items-center gap-x-3 gap-y-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.23em] text-[#d9b981]">{text(FINAL_HERO.customerProof, lang)}</span>
      <span className="hidden h-px w-7 bg-gradient-to-r from-[#d9b981] to-transparent sm:block" />
      <span className="text-[10px] text-[#fbf6ef]/38">{text(FINAL_HERO.regions, lang)}</span>
    </div>
    <div dir="ltr" className="mt-4 flex h-[280px] sm:h-[340px] lg:h-[360px]">
      <CustomerVideoRail accent="#D9B981" autoplay={!reducedMotion} />
    </div>
  </CinematicBand>
);

const LayerJourney: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => {
  const layers = [
    {
      number: "01",
      name: "Color Intelligence",
      note: lang === "he" ? "עלות, חומר ופורמולות" : "Cost, material and formulas",
    },
    {
      number: "02",
      name: "Booking Intelligence",
      note: lang === "he" ? "תורים, שלבים וקיבולת" : "Bookings, stages and capacity",
    },
    {
      number: "03",
      name: "Salon OS",
      note: lang === "he" ? "כל התפעול במקום אחד" : "One connected operation",
    },
    {
      number: "04",
      name: "Salon AI",
      note: lang === "he" ? "הבנה, סיוע ופעולה" : "Understanding, assistance and action",
    },
  ];

  return (
    <section aria-label={lang === "he" ? "ארבע שכבות המוצר" : "The four product layers"} className="px-5 pb-14 sm:px-8 sm:pb-20">
      <motion.div
        className="mx-auto max-w-3xl border-y border-[#2b221b]/8 py-5"
        initial={{ opacity: 0, y: reducedMotion ? 0 : 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.55, ease }}
      >
        <div dir="ltr" className="grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
          {layers.map((item, index) => (
            <div key={item.number} className="relative min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-semibold tracking-[0.2em] text-[#b1844d]">{item.number}</span>
                <span className="h-px flex-1 bg-[#2b221b]/10" />
              </div>
              <p className="mt-3 truncate text-[11px] font-medium text-[#2b221b]/68">{item.name}</p>
              <p dir={lang === "he" ? "rtl" : "ltr"} className="mt-1 text-[9px] font-light leading-4 text-[#2b221b]/38">{item.note}</p>
              {index < layers.length - 1 && (
                <span className="absolute -right-3 top-[34px] hidden text-[10px] text-[#b1844d]/35 sm:block">→</span>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

const OperatingSystemBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <CinematicBand
    label={lang === "he" ? "העבודה המחוברת של הסלון" : "The connected salon workflow"}
    reducedMotion={reducedMotion}
    layer={lang === "he" ? "שכבה 02 · Booking Intelligence" : "Layer 02 · Booking Intelligence"}
  >
    <div className="grid items-center gap-10 xl:-mx-12 xl:grid-cols-[minmax(360px,0.58fr)_1.42fr] xl:gap-10">
      <div className="max-w-sm">
        <p className="text-lg font-light leading-8 text-[#fbf6ef]/72 sm:text-xl">
          {lang === "he"
            ? "תור צבע אינו בלוק זמן אחד. הוא מורכב משלבי עבודה פעילים ומזמני המתנה שאפשר לנצל בצורה חכמה."
            : "A color appointment is not one continuous block. It combines active work with processing time that can be used intelligently."}
        </p>
        <p className="mt-5 text-sm font-light leading-7 text-[#fbf6ef]/45">
          {lang === "he"
            ? "המערכת מפצלת את התור לשלבים, מציגה בכל רגע איפה הלקוח נמצא ועוזרת לסלון להשתמש בקיבולת טוב יותר בלי לפגוע בשירות."
            : "The system splits the appointment into stages, shows where each client is in real time and helps the salon use capacity more effectively without compromising service."}
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.7, ease, delay: reducedMotion ? 0 : 0.14 }}
        className="relative hidden xl:block xl:-translate-y-4"
        style={{ height: "clamp(500px, 62vh, 660px)" }}
      >
        <div className="absolute inset-0 flex overflow-hidden rounded-2xl" style={{ zIndex: 1 }}>
          <BrowserFrame>
            <CalendarGrid />
          </BrowserFrame>
        </div>
        <div
          className="absolute right-0 top-1/2"
          style={{
            transform: "translateY(-50%) scale(0.82)",
            transformOrigin: "right center",
            zIndex: 3,
          }}
        >
          <LiveClientsVertical />
        </div>
      </motion.div>

      <div className="relative h-[310px] overflow-hidden rounded-[28px] border border-white/12 bg-black/15 shadow-[0_34px_90px_rgba(0,0,0,0.34)] sm:h-[430px] md:h-[500px] lg:h-[620px] xl:hidden">
        <div
          className="absolute left-1/2 top-5 h-[570px] w-[900px] origin-top -translate-x-1/2 scale-[0.31] min-[360px]:scale-[0.40] sm:scale-[0.62] md:scale-[0.78] lg:scale-100"
        >
          <div className="absolute inset-0 flex overflow-hidden rounded-2xl">
            <BrowserFrame>
              <CalendarGrid />
            </BrowserFrame>
          </div>
          <div
            className="absolute right-0 top-1/2"
            style={{
              transform: "translateY(-50%) scale(0.82)",
              transformOrigin: "right center",
              zIndex: 3,
            }}
          >
            <LiveClientsVertical />
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#17110d]/45 to-transparent" />
      </div>
    </div>
  </CinematicBand>
);

const AgentsBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <CinematicBand
    label={lang === "he" ? "מסיוע לפעולה" : "From assistance to action"}
    reducedMotion={reducedMotion}
    background={LIVE_DEMO_ASSETS.productShelves}
    layer={lang === "he" ? "שכבה 04 · Salon AI Agent Suite" : "Layer 04 · Salon AI Agent Suite"}
  >
    <div className="grid items-center gap-10 lg:grid-cols-[0.36fr_0.64fr]">
      <div>
        <p className="text-base font-light leading-8 text-[#fbf6ef]/65 sm:text-lg">
          {lang === "he"
            ? "יומן, מלאי, שימור וביצועים מתחברים לאותה תמונה עסקית, כאשר ההחלטות החשובות נשארות בשליטת הצוות."
            : "Booking, inventory, retention and performance share one business context while important decisions remain under the team's control."}
        </p>
      </div>
      <motion.div
        initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: reducedMotion ? 0.15 : 0.7, ease }}
        className="relative mx-auto w-full max-w-[620px] overflow-hidden rounded-[28px] border border-white/12 bg-black/20 shadow-[0_38px_100px_rgba(0,0,0,0.38)]"
      >
        <img
          src={LIVE_DEMO_ASSETS.salonAiConcierge}
          alt={lang === "he" ? "Salon AI Concierge במסך נייד" : "Salon AI Concierge mobile experience"}
          loading="lazy"
          draggable={false}
          className="mx-auto h-auto max-h-[650px] w-auto max-w-full select-none object-contain"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.07),transparent_26%,transparent_78%,rgba(217,185,129,0.05))]" />
      </motion.div>
    </div>
  </CinematicBand>
);

const RevenueBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <CinematicBand
    label={lang === "he" ? "מודל ערך לכל סלון" : "Modeled value per salon"}
    reducedMotion={reducedMotion}
    surface="data"
    layer={lang === "he" ? "שכבות 01 עד 04 · הרחבת הערך" : "Layers 01 to 04 · Value expansion"}
  >
    <div className="relative overflow-hidden rounded-[34px] border border-white/12 bg-[linear-gradient(145deg,rgba(12,8,5,0.78),rgba(31,22,15,0.48))] p-5 shadow-[0_32px_90px_rgba(0,0,0,0.3)] backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-[#d9b981]/10 blur-3xl" />
      <div className="relative flex flex-col gap-3 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.24em] text-[#d9b981]">
            {lang === "he" ? "ערך שנתי פוטנציאלי לכל סלון" : "Potential annual value per salon"}
          </p>
          <p className="mt-2 max-w-xl text-sm font-light leading-6 text-[#fbf6ef]/48">
            {lang === "he"
              ? "כל שכבה מרחיבה את העבודה המשותפת עם הסלון ומוסיפה מקור ערך נוסף."
              : "Each layer expands the relationship with the salon and adds another source of value."}
          </p>
        </div>
        <div dir="ltr" className="flex items-baseline gap-2">
          <span className="text-sm font-light text-[#fbf6ef]/35">$960</span>
          <span className="text-[#d9b981]/45">→</span>
          <span className="text-4xl font-light tracking-[-0.04em] text-[#d9b981]">$4,860</span>
        </div>
      </div>

      <div dir="ltr" className="relative mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            step: "01",
            total: "$960",
            addition: lang === "he" ? "השכבה הקיימת" : "Existing layer",
            label: "Color Intelligence",
            color: "#8ec5df",
          },
          {
            step: "02",
            total: "$2,060",
            addition: "+$1,100",
            label: "Booking · CRM · POS",
            color: "#9fc9a8",
          },
          {
            step: "03",
            total: "$3,060",
            addition: "+$1,000",
            label: "Salon OS",
            color: "#c6a1cc",
          },
          {
            step: "04",
            total: "$4,860",
            addition: "+$1,800",
            label: "Salon AI",
            color: "#d9b981",
          },
        ].map((stage, index) => {
          const highlighted = index === 3;
          return (
            <motion.div
              key={stage.step}
              initial={{ opacity: 0, y: reducedMotion ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reducedMotion ? 0.15 : 0.5, delay: reducedMotion ? 0 : index * 0.08, ease }}
              className={`relative flex min-h-[210px] flex-col overflow-hidden rounded-3xl border p-5 ${
                highlighted
                  ? "border-[#d9b981]/45 bg-[#d9b981]/[0.12] shadow-[0_18px_50px_rgba(217,185,129,0.10)]"
                  : "border-white/10 bg-white/[0.045]"
              }`}
            >
              <div
                className="pointer-events-none absolute inset-x-0 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${stage.color}, transparent)` }}
              />
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-semibold tracking-[0.2em] text-[#fbf6ef]/28">{stage.step}</span>
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: stage.color, boxShadow: `0 0 18px ${stage.color}` }}
                />
              </div>
              <p className={`mt-7 text-4xl font-light tracking-[-0.045em] ${highlighted ? "text-[#d9b981]" : "text-[#fbf6ef]"}`}>
                {stage.total}
              </p>
              <p
                className="mt-3 w-fit rounded-full border px-2.5 py-1 text-[10px] font-medium"
                style={{
                  color: stage.color,
                  borderColor: `${stage.color}45`,
                  background: `${stage.color}12`,
                }}
              >
                {stage.addition}
              </p>
              <div className="mt-auto pt-6">
                <div className="mb-3 h-px w-full bg-white/10">
                  <div className="h-full" style={{ width: `${25 + index * 25}%`, background: stage.color }} />
                </div>
                <p className="text-xs font-medium text-[#fbf6ef]/70">{stage.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/8 bg-black/15 px-4 py-3">
        <p className="text-[10px] leading-5 text-[#fbf6ef]/38">
          {lang === "he" ? "Color Intelligence היא נקודת הפתיחה. השכבות הבאות תלויות בהשלמת המוצר, באימוץ ובביצוע." : "Color Intelligence is the starting point. Later layers depend on product completion, adoption and execution."}
        </p>
        <span className="rounded-full border border-[#d9b981]/20 bg-[#d9b981]/[0.07] px-3 py-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#d9b981]">
          {lang === "he" ? "מודל, לא תחזית" : "Model, not forecast"}
        </span>
      </div>

    </div>
  </CinematicBand>
);

const SaaSBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <CinematicBand
    label={lang === "he" ? "ניסוי רכישה ושימור בשנת 2025" : "2025 acquisition and retention test"}
    reducedMotion={reducedMotion}
    surface="data"
    layer={lang === "he" ? "שכבה 01 · הוכחת Go-to-Market" : "Layer 01 · Go-to-market proof"}
  >
    <div className="relative overflow-hidden rounded-[36px] border border-[#d9b981]/20 bg-[linear-gradient(140deg,rgba(12,8,5,0.84),rgba(38,27,18,0.58))] p-5 shadow-[0_35px_100px_rgba(0,0,0,0.34)] backdrop-blur-2xl sm:p-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-[#d9b981]/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-[#86b7a0]/[0.08] blur-3xl" />

      <div className="relative flex flex-col gap-5 border-b border-white/10 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-[#d9b981]">
            {lang === "he" ? "ניסוי אמיתי. תקציב מוגבל. תוצאה אמיתית." : "A real test. A limited budget. A real result."}
          </p>
          <p className="mt-3 max-w-2xl text-2xl font-light leading-tight tracking-[-0.025em] text-[#fbf6ef] sm:text-3xl">
            {lang === "he"
              ? "11 חודשים שהוכיחו לנו שאפשר למכור, להטמיע ולצמוח מרחוק."
              : "11 months that proved we could sell, onboard and grow remotely."}
          </p>
        </div>
        <div dir="ltr" className="flex items-end gap-3">
          <span className="text-6xl font-light leading-none tracking-[-0.055em] text-[#d9b981]">{FINAL_SAAS.period.value}</span>
          <span className="pb-1 text-xs uppercase tracking-[0.16em] text-[#fbf6ef]/42">{text(FINAL_SAAS.period.label, lang)}</span>
        </div>
      </div>

      <div className="relative mt-7 grid gap-5 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="rounded-[28px] border border-white/10 bg-black/20 p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#fbf6ef]/38">
                {lang === "he" ? "התקציב המלא" : "Total budget"}
              </p>
              <p dir="ltr" className="mt-2 text-4xl font-light tracking-[-0.04em] text-[#fbf6ef]">$40K</p>
            </div>
            <p className="text-[10px] text-[#d9b981]">
              {lang === "he" ? "כ-3.6 אלף דולר לחודש" : "~$3.6K per month"}
            </p>
          </div>
          <div className="mt-7 space-y-5">
            {FINAL_SAAS.budget.map((line, index) => (
              <motion.div
                key={line.value}
                initial={{ opacity: 0, x: reducedMotion ? 0 : -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: reducedMotion ? 0.15 : 0.45, delay: reducedMotion ? 0 : index * 0.08, ease }}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] text-[#fbf6ef]/56">{text(line.label, lang)}</p>
                  <p dir="ltr" className="text-sm font-medium text-[#fbf6ef]">{line.value}</p>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#b1844d] to-[#d9b981]"
                    initial={{ width: 0 }}
                    whileInView={{ width: `${line.share}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: reducedMotion ? 0.15 : 0.7, delay: reducedMotion ? 0 : 0.12 + index * 0.08, ease }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5">
          <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-[#d9b981]">
            {lang === "he" ? "מה התקבל מהניסוי" : "What the test produced"}
          </p>
          <div dir="ltr" className="mt-6 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-center gap-2">
            {FINAL_SAAS.funnel.map((step, index) => (
              <React.Fragment key={step.value}>
                <motion.div
                  initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: reducedMotion ? 0.15 : 0.45, delay: reducedMotion ? 0 : index * 0.1, ease }}
                  className="min-w-0 text-center"
                >
                  <p className="text-2xl font-light tracking-[-0.04em] text-[#fbf6ef] sm:text-4xl">{step.value}</p>
                  <p className="mt-2 text-[10px] font-medium text-[#fbf6ef]/58">{text(step.label, lang)}</p>
                  <p className="mt-1 text-[8px] text-[#d9b981]/70">{step.note}</p>
                </motion.div>
                {index < FINAL_SAAS.funnel.length - 1 && (
                  <span className="text-lg font-light text-[#d9b981]/40">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="mt-7 rounded-2xl border border-[#d9b981]/25 bg-[#d9b981]/[0.08] p-4">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p dir="ltr" className="text-4xl font-light tracking-[-0.045em] text-[#d9b981]">$64,728</p>
                <p className="mt-1 text-[10px] text-[#fbf6ef]/48">
                  {lang === "he" ? "ARR בפועל מהקוהורט בשנת 2025" : "Actual 2025 ARR from the cohort"}
                </p>
              </div>
              <p className="max-w-[220px] text-[10px] leading-5 text-[#fbf6ef]/38">
                {lang === "he"
                  ? "עוד לפני Salon OS, Salon AI והכלים שאנחנו בונים היום."
                  : "Before Salon OS, Salon AI and the tools we are building today."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {FINAL_SAAS.summary.map((item, index) => (
          <div
            key={`${item.value}-${item.label.en}`}
            className={`rounded-2xl border px-4 py-3 ${
              index === FINAL_SAAS.summary.length - 1
                ? "border-[#d9b981]/30 bg-[#d9b981]/[0.09]"
                : "border-white/8 bg-black/15"
            }`}
          >
            <p dir="ltr" className={`text-xl font-light ${index === FINAL_SAAS.summary.length - 1 ? "text-[#d9b981]" : "text-[#fbf6ef]"}`}>{item.value}</p>
            <p className="mt-1 text-[9px] text-[#fbf6ef]/38">{text(item.label, lang)}</p>
          </div>
        ))}
      </div>

      <p className="relative mt-5 text-[9px] leading-4 text-[#fbf6ef]/28">
        {lang === "he"
          ? "ה-LTV ויחס LTV:CAC מבוססים על הנחת שימור מתוכננת לשלוש שנים. ה-ARR לשנת 2025 הוא נתון בפועל."
          : "LTV and LTV:CAC use a modeled three-year retention assumption. 2025 ARR is actual."}
      </p>
    </div>
  </CinematicBand>
);

const OpportunityBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => {
  const actualRows = [
    { label: lang === "he" ? "תקופת השיווק" : "Marketing period", value: lang === "he" ? "11 חודשים" : "11 months" },
    { label: lang === "he" ? "תקציב כולל" : "Total budget", value: "$40,000" },
    { label: lang === "he" ? "לידים" : "Leads", value: "1,476" },
    { label: lang === "he" ? "ניסיונות" : "Trials", value: "301" },
    { label: lang === "he" ? "לקוחות משלמים" : "Paying customers", value: "96" },
    { label: lang === "he" ? "ARR בפועל בשנת 2025" : "Actual 2025 ARR", value: "$64,728", highlight: true },
  ];
  const modeledRows = [
    { label: "Color Intelligence", addition: lang === "he" ? "בסיס קיים" : "Existing base", total: "$960", actual: true },
    { label: "Booking · CRM · POS", addition: "+$1,100", total: "$2,060" },
    { label: "Salon OS", addition: "+$1,000", total: "$3,060" },
    { label: "Salon AI", addition: "+$1,800", total: "$4,860", highlight: true },
  ];

  return (
    <CinematicBand
      label={lang === "he" ? "ההזדמנות במספרים" : "The opportunity in numbers"}
      reducedMotion={reducedMotion}
      surface="ledger"
      layer={lang === "he" ? "היסטוריה מוכחת מול הזדמנות עתידית" : "Proven history versus future opportunity"}
    >
      <div className="border-y border-white/12 bg-black/[0.08]">
        <div className="flex flex-col gap-5 border-b border-white/10 px-1 py-6 sm:flex-row sm:items-end sm:justify-between sm:px-6">
          <div>
            <p className="text-[9px] font-semibold uppercase tracking-[0.23em] text-[#c7665f]">
              {lang === "he" ? "מבט מעשי על ההזדמנות" : "A practical view of the opportunity"}
            </p>
            <p className="mt-3 max-w-2xl text-xl font-light leading-8 text-[#fbf6ef]/78 sm:text-2xl">
              {lang === "he"
                ? "הפרדה ברורה בין ההיסטוריה שכבר הוכחנו לבין ההזדמנות להגדיל את ההכנסה השנתית מכל סלון."
                : "A clear separation between the history we have already proven and the opportunity to increase annual revenue per salon."}
            </p>
          </div>
          <div className="flex gap-2">
            <span className="rounded-full border border-white/20 bg-white/[0.05] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-white/70">
              {lang === "he" ? "מוכח" : "Proven"}
            </span>
            <span className="rounded-full border border-[#c7665f]/30 bg-[#c7665f]/[0.08] px-3 py-1 text-[9px] font-medium uppercase tracking-[0.14em] text-[#d47770]">
              {lang === "he" ? "הזדמנות" : "Opportunity"}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2">
          <div className="px-1 py-7 sm:px-6 lg:border-r lg:border-white/10">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                {lang === "he" ? "היסטוריה מוכחת · 2025" : "Proven history · 2025"}
              </p>
              <p className="text-[9px] text-[#fbf6ef]/30">
                {lang === "he" ? "11 חודשי שיווק" : "11 months of marketing"}
              </p>
            </div>
            <div className="mt-5">
              {actualRows.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-5 border-t border-white/[0.08] py-3">
                  <p className="text-[11px] font-light text-[#fbf6ef]/48">{row.label}</p>
                  <p
                    dir="ltr"
                    className={`text-base font-light tabular-nums ${
                      row.highlight ? "text-white" : "text-[#fbf6ef]/82"
                    }`}
                  >
                    {row.value}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[9px] leading-5 text-[#fbf6ef]/28">
              {lang === "he"
                ? "התקציב כלל 18 אלף דולר לפרסום, 15 אלף דולר לניהול הקמפיין ו-7 אלף דולר לציוד ולהטמעה."
                : "The budget included $18K in advertising, $15K in campaign management and $7K in equipment and onboarding."}
            </p>
          </div>

          <div className="px-1 py-7 sm:px-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#c7665f]">
                {lang === "he" ? "הזדמנות להגדלת הכנסה מכל סלון" : "Revenue expansion opportunity per salon"}
              </p>
              <p className="text-[9px] text-[#fbf6ef]/30">
                {lang === "he" ? "כלכלת מוצר" : "Product economics"}
              </p>
            </div>
            <div className="mt-5">
              {modeledRows.map((row) => (
                <div key={row.label} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-t border-white/[0.08] py-3">
                  <p className="min-w-0 truncate text-[11px] font-light text-[#fbf6ef]/55">{row.label}</p>
                  <p
                    dir="ltr"
                    className={`text-[10px] tabular-nums ${row.actual ? "text-white/62" : "text-[#c7665f]/70"}`}
                  >
                    {row.addition}
                  </p>
                  <p
                    dir="ltr"
                    className={`w-[72px] text-right text-base font-light tabular-nums ${
                      row.highlight ? "text-[#d47770]" : "text-[#fbf6ef]/82"
                    }`}
                  >
                    {row.total}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#c7665f]/25 pt-4">
              <p className="text-[10px] text-[#fbf6ef]/38">
                {lang === "he" ? "פוטנציאל הרחבה שנתי" : "Modeled annual expansion"}
              </p>
              <p dir="ltr" className="text-xl font-light text-[#d47770]">$960 → $4,860</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-white/10 px-1 py-5 text-[9px] leading-5 text-[#fbf6ef]/28 sm:px-6 lg:grid-cols-2">
          <p>
            {lang === "he"
              ? "תוצאות השיווק ו-ARR לשנת 2025 הן נתונים בפועל."
              : "The marketing results and 2025 ARR are actual."}
          </p>
          <p>
            {lang === "he"
              ? "הערכים של השכבות הבאות הם מודל, ותלויים בהשלמת המוצר, באימוץ ובביצוע מסחרי."
              : "Later-layer values are modeled and depend on product completion, adoption and commercial execution."}
          </p>
        </div>
      </div>
    </CinematicBand>
  );
};

const OpportunityLedgerBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => {
  const history = [
    { label: lang === "he" ? "תקופת שיווק" : "Marketing period", value: lang === "he" ? "11 חודשים" : "11 months" },
    { label: lang === "he" ? "תקציב כולל" : "Total budget", value: "$40,000" },
    { label: lang === "he" ? "לידים" : "Leads", value: "1,476" },
    { label: lang === "he" ? "ניסיונות" : "Trials", value: "301" },
    { label: lang === "he" ? "לקוחות משלמים" : "Paying customers", value: "96" },
    { label: lang === "he" ? "ARR בפועל" : "Actual ARR", value: "$64,728", highlight: true },
  ];
  const bridge = [
    {
      label: "Color Intelligence",
      note: lang === "he" ? "ערך שנתי קיים" : "Existing annual value",
      value: "$960",
      type: "base",
    },
    {
      label: "Booking · CRM · POS",
      note: lang === "he" ? "תוספת שנתית" : "Annual addition",
      value: "+$1,100",
      type: "addition",
    },
    {
      label: "Salon OS",
      note: lang === "he" ? "תוספת שנתית" : "Annual addition",
      value: "+$1,000",
      type: "addition",
    },
    {
      label: "Salon AI",
      note: lang === "he" ? "תוספת שנתית" : "Annual addition",
      value: "+$1,800",
      type: "addition",
    },
  ];

  return (
    <motion.section
      aria-label={lang === "he" ? "מה למדנו מהמספרים" : "What the numbers taught us"}
      className="border-y border-[#2b221b]/8 bg-[#f5efe7] px-5 py-16 text-[#2b221b] sm:px-8 sm:py-24"
      initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: reducedMotion ? 0.15 : 0.6, ease }}
    >
      <div className="mx-auto max-w-5xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b1844d]">
            {lang === "he" ? "מה למדנו מהמספרים" : "What the numbers taught us"}
          </p>
          <p className="mt-4 max-w-3xl text-2xl font-light leading-snug tracking-[-0.02em] sm:text-3xl">
            {lang === "he"
              ? "במשך 11 חודשים בחנו את השיווק בתקציב מוגבל. התוצאות נתנו לנו בסיס אמיתי ללמוד ממנו."
              : "For 11 months, we tested marketing with a limited budget. The results gave us something real to learn from."}
          </p>

          <div className="mt-9 grid grid-cols-2 border-t border-[#2b221b]/12 sm:grid-cols-3 lg:grid-cols-6">
            {history.map((item, index) => (
              <div
                key={item.label}
                className={`border-b border-[#2b221b]/12 py-5 ${
                  index % 2 === 0 ? "pe-4" : "border-s ps-4"
                } sm:border-s sm:px-4 sm:first:border-s-0`}
              >
                <p className="text-sm font-light text-[#2b221b]/55">{item.label}</p>
                <p dir="ltr" className="mt-2 text-xl font-light tabular-nums text-[#2b221b]">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-4 max-w-3xl text-sm font-light leading-6 text-[#2b221b]/50">
            {lang === "he"
              ? "התקציב כלל 18 אלף דולר לפרסום, 15 אלף דולר לניהול הקמפיין ו-7 אלף דולר לציוד ולהטמעה."
              : "The budget included $18K in advertising, $15K in campaign management and $7K in equipment and onboarding."}
          </p>
        </div>

        <div className="mt-16 border-t border-[#2b221b]/12 pt-14 sm:mt-20 sm:pt-16">
          <p className="max-w-3xl text-2xl font-light leading-snug tracking-[-0.02em] sm:text-3xl">
            {lang === "he"
              ? "המודל החדש מאפשר לנו להוסיף בהדרגה ערך והכנסה מאותו סלון."
              : "The new model allows us to add value and revenue gradually within the same salon."}
          </p>

          <div dir="ltr" className="mt-9 grid border-t border-[#2b221b]/12 sm:grid-cols-2 lg:grid-cols-5">
            {bridge.map((item, index) => (
              <React.Fragment key={item.label}>
                <div className="border-b border-[#2b221b]/12 px-0 py-5 sm:px-4 sm:first:ps-0 lg:border-s">
                  <p className="text-sm font-light leading-5 text-[#2b221b]/50">{item.note}</p>
                  <p className="mt-2 text-sm font-medium text-[#2b221b]/75">{item.label}</p>
                  <p className="mt-5 text-2xl font-light tabular-nums text-[#2b221b]">{item.value}</p>
                </div>
                {index === bridge.length - 1 && (
                  <div className="border-b border-s border-[#2b221b]/12 px-0 py-5 sm:px-4">
                    <p className="text-sm font-light leading-5 text-[#2b221b]/50">
                      {lang === "he" ? "ערך שנתי במודל" : "Modeled annual value"}
                    </p>
                    <p className="mt-2 text-sm font-medium text-[#2b221b]/75">
                      {lang === "he" ? "לכל סלון לקוח" : "Per salon customer"}
                    </p>
                    <p className="mt-5 text-2xl font-light tabular-nums text-[#2b221b]">$4,860</p>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <p className="mt-5 max-w-3xl text-sm font-light leading-6 text-[#2b221b]/50">
            {lang === "he"
              ? "הסכומים עבור Booking, Salon OS ו-Salon AI הם עדיין מודל. המימוש שלהם תלוי בהשלמת המוצר, באימוץ ובביצוע."
              : "The Booking, Salon OS and Salon AI figures remain a model. Reaching them depends on product completion, adoption and execution."}
          </p>

          <div className="mt-12 border-t border-[#2b221b]/12 pt-10">
            <p className="max-w-3xl text-xl font-light leading-snug tracking-[-0.02em] sm:text-2xl">
              {lang === "he"
                ? "אם נגיע ל־10,000 סלונים עם אותו ערך שנתי במודל, החישוב פשוט."
                : "If we reached 10,000 salons at that modeled annual value, the math is simple."}
            </p>
            <div dir="ltr" className="mt-8 grid border-t border-[#2b221b]/12 sm:grid-cols-3">
              {[
                {
                  label: lang === "he" ? "סלונים" : "Salons",
                  value: "10,000",
                },
                {
                  label: lang === "he" ? "ערך שנתי לסלון" : "Annual value per salon",
                  value: "$4,860",
                },
                {
                  label: lang === "he" ? "הכנסה שנתית במודל" : "Modeled annual revenue",
                  value: "$48.6M",
                },
              ].map((item, index) => (
                <div
                  key={item.label}
                  className={`border-b border-[#2b221b]/12 py-5 ${
                    index > 0 ? "sm:border-s sm:ps-5" : "sm:pe-5"
                  }`}
                >
                  <p className="text-sm font-light text-[#2b221b]/50">{item.label}</p>
                  <p className="mt-2 text-2xl font-light tabular-nums text-[#2b221b] sm:text-3xl">{item.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-3xl text-sm font-light leading-6 text-[#2b221b]/50">
              {lang === "he"
                ? "10,000 × $4,860 = $48.6M הכנסה שנתית במודל. זו הערכה פשוטה, לא תחזית."
                : "10,000 × $4,860 = $48.6M modeled annual revenue. A simple estimate, not a forecast."}
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
};

const FundingBand: React.FC<{ lang: UpdateLang; reducedMotion: boolean }> = ({ lang, reducedMotion }) => (
  <motion.section
    aria-label={lang === "he" ? "לאן המשאבים הולכים" : "Where the resources would go"}
    className="border-y border-[#2b221b]/8 bg-[#f5efe7] px-5 py-16 text-[#2b221b] sm:px-8 sm:py-20"
    initial={{ opacity: 0, y: reducedMotion ? 0 : 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.12 }}
    transition={{ duration: reducedMotion ? 0.15 : 0.6, ease }}
  >
    <div className="mx-auto max-w-5xl">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#b1844d]">
          {lang === "he" ? "לאן המשאבים הולכים" : "Where the resources go"}
        </p>
        <p className="mt-4 text-3xl font-light leading-tight tracking-[-0.025em] sm:text-4xl">
          {lang === "he"
            ? "להפוך את מה שכבר נבנה למוצר מוטמע וצומח."
            : "Turning what has already been built into adoption and growth."}
        </p>
      </div>
      <div className="mt-10 grid border-t border-[#2b221b]/12 sm:grid-cols-2 lg:grid-cols-3">
        {FINAL_FUNDING.map((priority, index) => (
          <div
            key={priority.title.en}
            className="border-b border-[#2b221b]/12 px-0 py-6 sm:px-5 sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0"
          >
            <div className="flex items-start gap-4">
              <span className="pt-0.5 text-xs font-semibold tabular-nums text-[#b1844d]">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-base font-medium text-[#2b221b]">{text(priority.title, lang)}</p>
                <p className="mt-2 text-sm font-light leading-6 text-[#2b221b]/58">{text(priority.body, lang)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.section>
);

export const CurrentInvestorUpdatePage: React.FC = () => {
  const reducedMotion = Boolean(useReducedMotion());
  const [lang, setLang] = useState<UpdateLang>("en");
  const [progress, setProgress] = useState(0);
  const dir = lang === "he" ? "rtl" : "ltr";

  useEffect(() => {
    const previousTitle = document.title;
    const previousLang = document.documentElement.lang;
    const previousDir = document.documentElement.dir;
    document.title = FINAL_META.title;
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    return () => {
      document.title = previousTitle;
      document.documentElement.lang = previousLang;
      document.documentElement.dir = previousDir;
    };
  }, [dir, lang]);

  useEffect(() => {
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const created = !robots;
    const previousContent = robots?.content;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";
    return () => {
      if (created) robots?.remove();
      else if (robots && previousContent !== undefined) robots.content = previousContent;
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div
      dir={dir}
      className="investor-update-page min-h-[100dvh] overflow-x-clip bg-[#f5efe7] text-[#2b221b]"
      style={{
        fontFamily:
          lang === "he"
            ? '"Assistant", "Noto Sans Hebrew", Arial, sans-serif'
            : '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Assistant:wght@300;400;500;600&display=swap');
        html { scroll-behavior: ${reducedMotion ? "auto" : "smooth"}; }
        body { background: #f5efe7; }
        ::selection { background: rgba(193,154,99,0.25); color: #2b221b; }
        .investor-update-page [class~="text-[8px]"] { font-size: 10px !important; }
        .investor-update-page [class~="text-[9px]"] { font-size: 11px !important; }
        .investor-update-page [class~="text-[10px]"],
        .investor-update-page [class~="text-[11px]"] { font-size: 12px !important; }
      `}</style>

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#2b221b]/8 bg-[#f5efe7]/[0.9] pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:h-[72px] sm:px-8">
          <a href="#top" className="flex min-w-0 items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c19a63]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c19a63]" />
            <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-[#2b221b]/60 sm:tracking-[0.22em]">Salon AI · Spectra</span>
          </a>
          <div className="flex shrink-0 items-center gap-4">
            <span className="hidden text-[9px] uppercase tracking-[0.18em] text-[#2b221b]/35 sm:block">
              {text(FINAL_HERO.eyebrow, lang)}
            </span>
            <LanguageToggle lang={lang} setLang={setLang} />
          </div>
        </div>
        <div className="h-px bg-[#2b221b]/5">
          <div className="h-full bg-gradient-to-r from-[#b1844d] to-[#d9b981]" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main>
        <section id="top" className="relative flex min-h-[72svh] items-center overflow-hidden bg-[#17110d] px-5 pb-20 pt-32 text-[#fbf6ef] sm:px-8 sm:pb-24 sm:pt-36">
          <div className="absolute inset-0 bg-cover bg-center opacity-32" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
          <div className="absolute inset-0 bg-[linear-gradient(108deg,rgba(9,6,4,0.97),rgba(9,6,4,0.78))]" />
          <motion.div
            className="relative mx-auto max-w-6xl"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.75, ease }}
          >
            <div className="max-w-4xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#d9b981]">{text(FINAL_HERO.eyebrow, lang)}</p>
              <h1 className="mt-6 text-4xl font-light leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-[4.5rem]">
                {text(FINAL_HERO.title, lang)}
              </h1>
              <p className="mt-8 max-w-2xl text-base font-light leading-7 text-[#fbf6ef]/65 sm:text-lg sm:leading-8">{text(FINAL_HERO.body, lang)}</p>
              <p className="mt-5 text-xs text-[#fbf6ef]/35">{text(FINAL_META.date, lang)}</p>
            </div>
            <a href="#origin" className="mt-12 inline-flex items-center gap-3 text-xs text-[#fbf6ef]/48 hover:text-[#fbf6ef]">
              {text(FINAL_HERO.read, lang)}
              <ArrowDown size={15} aria-hidden="true" />
            </a>
          </motion.div>
        </section>

        <StoryPassage storyKeys={["origin"]} lang={lang} reducedMotion={reducedMotion} />
        <OriginAssetBand lang={lang} reducedMotion={reducedMotion} />
        <StoryPassage storyKeys={["rebuild", "proof"]} lang={lang} reducedMotion={reducedMotion} />
        <ProofBand lang={lang} reducedMotion={reducedMotion} />
        <StoryPassage storyKeys={["direction"]} lang={lang} reducedMotion={reducedMotion} />
        <LayerJourney lang={lang} reducedMotion={reducedMotion} />
        <OperatingSystemBand lang={lang} reducedMotion={reducedMotion} />
        <StoryPassage storyKeys={["intelligence"]} lang={lang} reducedMotion={reducedMotion} />
        <AgentsBand lang={lang} reducedMotion={reducedMotion} />
        <StoryPassage storyKeys={["people", "supporters", "revenue", "saas"]} lang={lang} reducedMotion={reducedMotion} />
        <OpportunityLedgerBand lang={lang} reducedMotion={reducedMotion} />
        <StoryPassage storyKeys={["financing"]} lang={lang} reducedMotion={reducedMotion} />
        <FundingBand lang={lang} reducedMotion={reducedMotion} />

        <section className="relative overflow-hidden bg-[#17110d] px-5 py-24 text-[#fbf6ef] sm:px-8 sm:py-32">
          <div className="absolute inset-0 bg-cover bg-center opacity-38" style={{ backgroundImage: `url('${HERO_IMAGE}')` }} />
          <div className="absolute inset-0 bg-[linear-gradient(105deg,rgba(9,6,4,0.96),rgba(9,6,4,0.72))]" />
          <motion.div
            className="relative mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: reducedMotion ? 0 : 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.65, ease }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d9b981]">{text(FINAL_CLOSE.eyebrow, lang)}</p>
            <h2 className="mt-5 text-5xl font-light tracking-[-0.04em] sm:text-7xl">{text(FINAL_CLOSE.title, lang)}</h2>
            <p className="mx-auto mt-6 max-w-2xl text-base font-light leading-8 text-[#fbf6ef]/62 sm:text-lg">{text(FINAL_CLOSE.body, lang)}</p>
            <div className="mt-12 text-sm text-[#fbf6ef]/48">
              <p>{text(FINAL_CLOSE.signoff, lang)}</p>
              <p className="mt-3 text-base font-medium text-[#fbf6ef]">{text(FINAL_CLOSE.names, lang)}</p>
              <p className="mt-1 text-xs">{text(FINAL_CLOSE.role, lang)}</p>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default CurrentInvestorUpdatePage;
