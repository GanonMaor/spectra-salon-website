import React, { useState } from "react";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";
import { Navigation } from "../../components/Navigation";
import { intro, sections, type StoryBlock } from "./copy";

type Lang = "he" | "en";

const goldSoft = (isDark: boolean) =>
  isDark ? "rgba(234,183,118,0.65)" : "rgba(160,100,30,0.70)";

const StoryBlockView: React.FC<{
  block: StoryBlock;
  lang: Lang;
  isDark: boolean;
}> = ({ block, lang, isDark }) => {
  const c = useSiteColors();
  const dir = lang === "he" ? "rtl" : "ltr";
  const align = lang === "he" ? "text-right" : "text-left";

  return (
    <div dir={dir} className={align}>
      {block.heading && (
        <h2
          className="text-base sm:text-lg font-semibold tracking-tight mb-3"
          style={{ color: c.text.primary }}
        >
          {block.heading}
        </h2>
      )}
      <div className="space-y-3">
        {block.paragraphs.map((p, i) => (
          <p
            key={i}
            className="text-[13px] sm:text-sm leading-relaxed"
            style={{ color: c.text.secondary }}
          >
            {p}
          </p>
        ))}
      </div>
    </div>
  );
};

const MaorSpectraStoryInner: React.FC = () => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();
  const [lang, setLang] = useState<Lang>("he");

  const t = intro[lang];
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <div
      className="relative min-h-[100dvh] overflow-x-hidden"
      style={{
        background: isDark
          ? `
            radial-gradient(ellipse 55% 35% at 75% 6%,  rgba(180,130,60,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 20% 96%, rgba(100,80,160,0.05) 0%, transparent 70%),
            linear-gradient(160deg, #0c0d13 0%, #101118 50%, #090a10 100%)
          `
          : `
            radial-gradient(ellipse 55% 35% at 75% 6%,  rgba(180,130,60,0.06) 0%, transparent 70%),
            radial-gradient(ellipse 50% 30% at 20% 96%, rgba(100,80,160,0.035) 0%, transparent 70%),
            linear-gradient(160deg, #f5f3ef 0%, #fafaf8 50%, #f0ede8 100%)
          `,
      }}
    >
      <Navigation />

      <main
        className="max-w-3xl mx-auto px-5 sm:px-6 lg:px-8 pt-[calc(72px+env(safe-area-inset-top))] pb-24"
      >
        {/* Language toggle */}
        <div className="flex justify-center mb-8">
          <div
            className="inline-flex rounded-full p-1"
            style={{ background: c.bg.card, border: `1px solid ${c.border.medium}` }}
          >
            {(["he", "en"] as Lang[]).map((l) => {
              const active = lang === l;
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200"
                  style={{
                    background: active
                      ? "linear-gradient(to right, #EAB776, #B18059)"
                      : "transparent",
                    color: active ? "#ffffff" : c.text.muted,
                  }}
                >
                  {l === "he" ? "עברית" : "English"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Intro */}
        <header dir={dir} className="text-center space-y-3 mb-4">
          <p
            className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase"
            style={{ color: goldSoft(isDark) }}
          >
            {t.eyebrow}
          </p>
          <h1
            className="text-2xl sm:text-3xl font-bold tracking-tight"
            style={{ color: c.text.primary }}
          >
            {t.title}
          </h1>
          <p
            className="text-sm sm:text-base leading-relaxed max-w-xl mx-auto"
            style={{ color: c.text.secondary }}
          >
            {t.greeting}
          </p>
        </header>

        {/* Divider */}
        <div
          className="h-px my-8"
          style={{
            background: isDark
              ? "linear-gradient(to right, transparent, rgba(255,255,255,0.10), transparent)"
              : "linear-gradient(to right, transparent, rgba(0,0,0,0.12), transparent)",
          }}
        />

        {/* Sections */}
        <div className="space-y-10">
          {sections.map((section, idx) => (
            <React.Fragment key={section.id}>
              <section>
                <StoryBlockView block={section[lang]} lang={lang} isDark={isDark} />
              </section>
              {idx < sections.length - 1 && (
                <div
                  className="h-px"
                  style={{
                    background: isDark
                      ? "linear-gradient(to right, transparent, rgba(255,255,255,0.06), transparent)"
                      : "linear-gradient(to right, transparent, rgba(0,0,0,0.07), transparent)",
                  }}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Footer mark */}
        <div className="mt-16 text-center">
          <p
            className="text-[11px] tracking-[0.18em] uppercase font-semibold"
            style={{ color: goldSoft(isDark) }}
          >
            Spectra CI · Salon AI
          </p>
        </div>
      </main>
    </div>
  );
};

export const MaorSpectraStoryPage: React.FC = () => (
  <SiteThemeProvider>
    <MaorSpectraStoryInner />
  </SiteThemeProvider>
);

export default MaorSpectraStoryPage;
