import React, { useState } from "react";
import { SiteThemeProvider, useSiteColors, useSiteTheme } from "../../contexts/SiteTheme";
import { Navigation } from "../../components/Navigation";
import { intro, sections, type StoryBlock } from "./copy";
import { CustomerVideoCollage } from "./CustomerVideoCollage";

type Lang = "he" | "en";

const goldSoft = (isDark: boolean) =>
  isDark ? "rgba(234,183,118,0.65)" : "rgba(160,100,30,0.70)";

const StoryBlockView: React.FC<{
  block: StoryBlock;
  lang: Lang;
  isDark: boolean;
  insertAfter?: number;
  insertNode?: React.ReactNode;
}> = ({ block, lang, isDark, insertAfter, insertNode }) => {
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
          <React.Fragment key={i}>
            <p
              className="text-[13px] sm:text-sm leading-relaxed"
              style={{ color: c.text.secondary }}
            >
              {p}
            </p>
            {insertNode && insertAfter === i && insertNode}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const SALON_IMAGES: { src: string; he: string; en: string }[] = [
  {
    src: "/IMG_1742.jpg",
    he: "מאור בסלון בתל אביב",
    en: "Maor at the Tel Aviv salon",
  },
  {
    src: "/IMG_1743.jpg",
    he: "רגע בסלון עם לקוחה",
    en: "A moment in the salon with a client",
  },
  {
    src: "/IMG_1744.jpg",
    he: "הסלון הראשון — The HairStudio",
    en: "The first salon — The HairStudio",
  },
];

const StoryImage: React.FC<{
  src: string;
  caption: string;
  alt: string;
  isDark: boolean;
  dir: "rtl" | "ltr";
}> = ({ src, caption, alt, isDark, dir }) => {
  const c = useSiteColors();
  return (
    <figure className="my-6">
      <div
        className="overflow-hidden rounded-2xl"
        style={{
          border: `1px solid ${c.border.medium}`,
          boxShadow: isDark
            ? "0 16px 44px rgba(0,0,0,0.45)"
            : "0 16px 44px rgba(0,0,0,0.12)",
        }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="w-full h-auto block"
        />
      </div>
      <figcaption
        dir={dir}
        className="mt-3 text-center text-[11px] sm:text-xs tracking-wide"
        style={{ color: c.text.muted }}
      >
        {caption}
      </figcaption>
    </figure>
  );
};

const StoryGallery: React.FC<{ lang: Lang; isDark: boolean }> = ({ lang, isDark }) => {
  const c = useSiteColors();
  const dir = lang === "he" ? "rtl" : "ltr";

  return (
    <figure className="my-5">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {SALON_IMAGES.map((img) => (
          <div
            key={img.src}
            className="overflow-hidden rounded-xl"
            style={{
              aspectRatio: "1 / 1",
              border: `1px solid ${c.border.medium}`,
              boxShadow: isDark
                ? "0 10px 28px rgba(0,0,0,0.40)"
                : "0 10px 28px rgba(0,0,0,0.10)",
            }}
          >
            <img
              src={img.src}
              alt={lang === "he" ? img.he : img.en}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover block"
              style={{ objectPosition: "center 62%" }}
            />
          </div>
        ))}
      </div>
      <figcaption
        dir={dir}
        className="mt-3 text-center text-[11px] sm:text-xs tracking-wide"
        style={{ color: c.text.muted }}
      >
        {lang === "he"
          ? "תחילת הדרך — הסלון הראשון בתל אביב"
          : "Where it all began — the first salon in Tel Aviv"}
      </figcaption>
    </figure>
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
          className="h-px mt-8 mb-8"
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
                <StoryBlockView
                  block={section[lang]}
                  lang={lang}
                  isDark={isDark}
                  insertAfter={section.id === "origin-2009" ? 0 : undefined}
                  insertNode={
                    section.id === "origin-2009" ? (
                      <StoryGallery lang={lang} isDark={isDark} />
                    ) : undefined
                  }
                />
                {section.id === "salon-os" && (
                  <StoryImage
                    src="/salonos-dashboard.png"
                    alt={lang === "he" ? "מסך SalonOS" : "SalonOS dashboard"}
                    caption={
                      lang === "he"
                        ? "SalonOS — מערכת ההפעלה של הסלון"
                        : "SalonOS — the salon's operating system"
                    }
                    isDark={isDark}
                    dir={lang === "he" ? "rtl" : "ltr"}
                  />
                )}
                {section.id === "expanding-markets" && (
                  <div className="mt-6 sm:mt-8">
                    <CustomerVideoCollage lang={lang} />
                  </div>
                )}
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
