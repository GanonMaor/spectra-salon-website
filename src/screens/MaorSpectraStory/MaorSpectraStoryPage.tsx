import React, { useCallback, useEffect, useRef, useState } from "react";
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
}> = ({ block, lang, insertAfter, insertNode }) => {
  const c = useSiteColors();
  const dir = lang === "he" ? "rtl" : "ltr";
  const align = lang === "he" ? "text-right" : "text-left";

  return (
    <div dir={dir} className={align}>
      {block.heading && (
        <h2
          className="text-lg sm:text-2xl font-semibold tracking-tight mb-4"
          style={{ color: c.text.primary }}
        >
          {block.heading}
        </h2>
      )}
      <div className="space-y-3">
        {block.paragraphs.map((p, i) => (
          <React.Fragment key={i}>
            <p
              className="text-[13px] sm:text-base leading-relaxed"
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

/** Intro slide content */
const IntroSlide: React.FC<{ lang: Lang; isDark: boolean }> = ({ lang, isDark }) => {
  const c = useSiteColors();
  const t = intro[lang];
  const dir = lang === "he" ? "rtl" : "ltr";
  return (
    <header dir={dir} className="text-center space-y-4 max-w-xl mx-auto">
      <p
        className="text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase"
        style={{ color: goldSoft(isDark) }}
      >
        {t.eyebrow}
      </p>
      <h1
        className="text-3xl sm:text-5xl font-bold tracking-tight"
        style={{ color: c.text.primary }}
      >
        {t.title}
      </h1>
      <p
        className="text-sm sm:text-lg leading-relaxed max-w-xl mx-auto"
        style={{ color: c.text.secondary }}
      >
        {t.greeting}
      </p>
    </header>
  );
};

/** One section rendered as slide content */
const SectionSlide: React.FC<{
  section: (typeof sections)[number];
  lang: Lang;
  isDark: boolean;
}> = ({ section, lang, isDark }) => {
  return (
    <div className="max-w-2xl mx-auto w-full">
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
    </div>
  );
};

const MaorSpectraStoryInner: React.FC = () => {
  const c = useSiteColors();
  const { isDark } = useSiteTheme();
  const [lang, setLang] = useState<Lang>("he");
  const [current, setCurrent] = useState(0);

  // Slide list: intro + each section, in order.
  const slideIds = ["__intro__", ...sections.map((s) => s.id)];
  const total = slideIds.length;

  const go = useCallback(
    (index: number) => {
      setCurrent(() => Math.max(0, Math.min(total - 1, index)));
    },
    [total],
  );
  const next = useCallback(() => go(current + 1), [current, go]);
  const prev = useCallback(() => go(current - 1), [current, go]);

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "PageDown") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft" || e.key === "PageUp") {
        e.preventDefault();
        prev();
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(total - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, go, total]);

  // Touch swipe (horizontal) navigation
  const touchStart = useRef<{ x: number; y: number; ignore: boolean } | null>(null);
  const onTouchStart = (e: React.TouchEvent) => {
    const tch = e.touches[0];
    const target = e.target as HTMLElement | null;
    const ignore = !!target?.closest("[data-no-swipe]");
    touchStart.current = { x: tch.clientX, y: tch.clientY, ignore };
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || touchStart.current.ignore) {
      touchStart.current = null;
      return;
    }
    const tch = e.changedTouches[0];
    const dx = tch.clientX - touchStart.current.x;
    const dy = tch.clientY - touchStart.current.y;
    touchStart.current = null;
    // Only treat as slide swipe when clearly horizontal.
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) next();
      else prev();
    }
  };

  const progress = total > 1 ? (current / (total - 1)) * 100 : 100;

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: "100dvh",
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

      {/* Progress bar */}
      <div
        className="absolute left-0 right-0 z-30 h-0.5 top-[calc(56px+env(safe-area-inset-top))] sm:top-[calc(64px+env(safe-area-inset-top))]"
        style={{ background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)" }}
      >
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${progress}%`, background: "linear-gradient(90deg, #EAB776, #B18059)" }}
        />
      </div>

      {/* Slide track */}
      <div
        className="flex h-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(${-current * 100}%)` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {slideIds.map((id, idx) => {
          const isIntro = id === "__intro__";
          const section = isIntro ? null : sections.find((s) => s.id === id)!;
          return (
            <section
              key={id}
              aria-hidden={idx !== current}
              className="shrink-0 w-full h-full overflow-y-auto overflow-x-hidden"
            >
              <div className="min-h-full w-full flex items-center px-5 sm:px-8 pt-[calc(80px+env(safe-area-inset-top))] pb-24">
                <div className="w-full">
                  {isIntro ? (
                    <IntroSlide lang={lang} isDark={isDark} />
                  ) : (
                    <SectionSlide section={section!} lang={lang} isDark={isDark} />
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Bottom control bar */}
      <footer
        className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8 h-16 pb-[env(safe-area-inset-bottom)]"
        style={{
          background: isDark ? "rgba(9,10,16,0.72)" : "rgba(250,250,248,0.78)",
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${c.border.light}`,
        }}
      >
        {/* Slide counter */}
        <span
          className="text-xs font-medium tabular-nums shrink-0"
          style={{ color: c.text.muted, letterSpacing: "0.08em" }}
        >
          {String(current + 1).padStart(2, "0")}
          <span style={{ color: c.text.faint }}> / {String(total).padStart(2, "0")}</span>
        </span>

        {/* Language toggle */}
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
                className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200"
                style={{
                  background: active ? "linear-gradient(to right, #EAB776, #B18059)" : "transparent",
                  color: active ? "#ffffff" : c.text.muted,
                }}
              >
                {l === "he" ? "עברית" : "English"}
              </button>
            );
          })}
        </div>

        {/* Prev / Next */}
        <div className="flex items-center gap-2 shrink-0">
          <NavArrow dir="prev" onClick={prev} disabled={current === 0} isDark={isDark} c={c} />
          <NavArrow dir="next" onClick={next} disabled={current === total - 1} isDark={isDark} c={c} />
        </div>
      </footer>
    </div>
  );
};

const NavArrow: React.FC<{
  dir: "prev" | "next";
  onClick: () => void;
  disabled: boolean;
  isDark: boolean;
  c: ReturnType<typeof useSiteColors>;
}> = ({ dir, onClick, disabled, isDark, c }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    aria-label={dir === "next" ? "Next slide" : "Previous slide"}
    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200"
    style={{
      border: `1px solid ${c.border.strong}`,
      background: disabled ? "transparent" : isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.7)",
      color: disabled ? c.text.faint : c.text.primary,
      opacity: disabled ? 0.4 : 1,
      cursor: disabled ? "default" : "pointer",
    }}
  >
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      {dir === "next" ? (
        <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  </button>
);

export const MaorSpectraStoryPage: React.FC = () => (
  <SiteThemeProvider>
    <MaorSpectraStoryInner />
  </SiteThemeProvider>
);

export default MaorSpectraStoryPage;
