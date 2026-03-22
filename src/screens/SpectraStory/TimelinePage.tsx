import React from "react";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";
import { milestones } from "../../data/milestones";
import { TimelineList } from "./TimelineList";

const SUMMARY_LINES = [
  "2009 — מאור גנון יוזם פיתוח מכונת ערבוב צבע. ~3 שנות עבודה, אפס תוצאה.",
  "2012–2015 — שקט מוחלט. מאור מודיע לצוות המקורי שהוא ממשיך לבד.",
  "2016 — מיכאל ודבורה בן אבו משקיעים 12,000 יורו ללא חוזה. דוד חוזר.",
  "~2018 — אלעד גוטליב מצטרף כשותף (40/30/30). הסכם בעל-פה בלבד.",
  "2018–2019 — IndieDev (גיא זקס, אלירן בינמן), ~40,000 ש״ח. כניסת עו״ד נמרוד וורמן.",
  "~2019 — פרנק אבו מצטרף לגיוס. אפס השקעות חדשות.",
  "2019–2020 — התאגדות Color Master. 105,495 מניות ל-7 בעלי מניות.",
];

const TimelinePageInner: React.FC = () => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden"
      dir="rtl"
      style={{
        // Deep layered background — inline so it works without fixed positioning on iOS
        background: isDark
          ? `
            radial-gradient(ellipse 55% 35% at 75% 8%,  rgba(180,130,60,0.09) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 20% 95%, rgba(100,80,160,0.06) 0%, transparent 70%),
            linear-gradient(160deg, #0c0d13 0%, #101118 50%, #090a10 100%)
          `
          : `
            radial-gradient(ellipse 55% 35% at 75% 8%,  rgba(180,130,60,0.07) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 20% 95%, rgba(100,80,160,0.04) 0%, transparent 70%),
            linear-gradient(160deg, #f5f3ef 0%, #fafaf8 50%, #f0ede8 100%)
          `,
      }}
    >
      {/* Hero */}
      <section className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-2 sm:space-y-3">
          <p
            className="text-[10px] sm:text-[11px] font-semibold tracking-[0.20em] uppercase"
            style={{ color: isDark ? "rgba(234,183,118,0.55)" : "rgba(160,100,30,0.65)" }}
          >
            Internal · Spectra Archive
          </p>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight tracking-tight"
            style={{ color: c.text.primary }}
          >
            The Spectra Story
          </h1>
          <p
            className="text-sm max-w-sm sm:max-w-lg mx-auto leading-relaxed"
            style={{ color: c.text.secondary }}
          >
            ציר זמן מובנה של ההיסטוריה המלאה — אנשים, אירועים, מסמכים והחלטות.
          </p>
        </div>
      </section>

      {/* Summary card */}
      <section className="px-4 sm:px-6 lg:px-8 pb-8">
        <div
          className="max-w-4xl mx-auto rounded-xl sm:rounded-2xl p-4 sm:p-5 lg:p-6"
          style={{
            background: isDark
              ? "rgba(255,255,255,0.04)"
              : "rgba(255,255,255,0.72)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: isDark
              ? "1px solid rgba(255,255,255,0.07)"
              : "1px solid rgba(0,0,0,0.07)",
            boxShadow: isDark
              ? "0 4px 32px rgba(0,0,0,0.35)"
              : "0 4px 24px rgba(0,0,0,0.06)",
          }}
        >
          <p
            className="text-[10px] font-semibold tracking-[0.20em] uppercase mb-3"
            style={{ color: isDark ? "rgba(234,183,118,0.50)" : "rgba(140,90,20,0.60)" }}
          >
            תקציר
          </p>
          <ul className="space-y-1.5 sm:space-y-2">
            {SUMMARY_LINES.map((line, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span
                  className="mt-[7px] w-1 h-1 rounded-full shrink-0"
                  style={{
                    background: isDark ? "rgba(234,183,118,0.45)" : "rgba(180,130,60,0.50)",
                  }}
                />
                <span
                  className="text-xs sm:text-sm leading-relaxed"
                  style={{ color: c.text.secondary }}
                >
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-2">
        <div
          className="h-px"
          style={{
            background: isDark
              ? "linear-gradient(to left, transparent, rgba(255,255,255,0.07), transparent)"
              : "linear-gradient(to left, transparent, rgba(0,0,0,0.10), transparent)",
          }}
        />
      </div>

      {/* Timeline */}
      <section className="py-6 sm:py-10 px-4 sm:px-6 lg:px-8 pb-safe">
        <TimelineList milestones={milestones} />
      </section>
    </div>
  );
};

export const TimelinePage: React.FC = () => (
  <SiteThemeProvider>
    <TimelinePageInner />
  </SiteThemeProvider>
);
