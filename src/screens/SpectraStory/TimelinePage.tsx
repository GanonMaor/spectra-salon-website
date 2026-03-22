import React from "react";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";
import { milestones } from "../../data/milestones";
import { TimelineList } from "./TimelineList";

const TimelinePageInner: React.FC = () => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden"
      dir="rtl"
      style={{
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
      <section className="pt-14 sm:pt-18 pb-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-2">
          <p
            className="text-[10px] sm:text-[11px] font-semibold tracking-[0.20em] uppercase"
            style={{ color: isDark ? "rgba(234,183,118,0.55)" : "rgba(160,100,30,0.65)" }}
          >
            Internal · Spectra CI
          </p>
          <h1
            className="text-xl sm:text-2xl font-bold leading-tight tracking-tight"
            style={{ color: c.text.primary }}
          >
            Spectra CI
          </h1>
          <p
            className="text-xs sm:text-sm max-w-sm mx-auto leading-relaxed"
            style={{ color: c.text.secondary }}
          >
            ציר זמן מובנה של ההיסטוריה המלאה — אנשים, אירועים והחלטות.
          </p>
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
      <section className="py-4 sm:py-8 px-4 sm:px-6 lg:px-8 pb-safe">
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
