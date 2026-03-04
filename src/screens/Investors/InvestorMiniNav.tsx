import React, { useState, useEffect, useRef } from "react";

export interface NavSection {
  id: string;
  label: string;
}

interface InvestorMiniNavProps {
  sections: NavSection[];
}

export function InvestorMiniNav({ sections }: InvestorMiniNavProps) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isOverDark, setIsOverDark] = useState(true);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-120px 0px -60% 0px", threshold: 0.1 },
    );

    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  useEffect(() => {
    const darkSections = new Set(["hero", "traction", "cta"]);
    setIsOverDark(darkSections.has(activeId));
  }, [activeId]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const offset = 100;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: "smooth" });
    setActiveId(id);
    setMobileOpen(false);
  };

  const bg = isOverDark
    ? "bg-black/60 border-white/5"
    : "bg-white/90 border-gray-100";
  const activePill = isOverDark
    ? "bg-white text-gray-900"
    : "bg-gray-900 text-white";
  const inactivePill = isOverDark
    ? "text-gray-400 hover:text-white hover:bg-white/10"
    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100";

  return (
    <nav
      ref={navRef}
      aria-label="Page sections"
      className={`sticky top-14 sm:top-16 z-30 backdrop-blur-md border-b transition-colors duration-300 ${bg}`}
    >
      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto px-6 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 py-2 min-w-max">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 ${
                  activeId === s.id ? activePill : inactivePill
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="md:hidden">
        <div className="px-4 py-2 flex items-center justify-between">
          <span className={`text-xs font-medium ${isOverDark ? "text-gray-400" : "text-gray-500"}`}>
            {sections.find((s) => s.id === activeId)?.label ?? "Sections"}
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            className={`text-xs font-medium flex items-center gap-1 ${isOverDark ? "text-gray-500" : "text-gray-400"}`}
          >
            Jump to
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${mobileOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {mobileOpen && (
          <div className="px-4 pb-3 flex flex-wrap gap-1.5">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                  activeId === s.id
                    ? activePill
                    : `${isOverDark ? "text-gray-400 bg-white/5" : "text-gray-500 bg-gray-50"} ${inactivePill}`
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
