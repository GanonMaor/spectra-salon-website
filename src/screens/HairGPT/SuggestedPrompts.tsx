import React from "react";
import { Lang, translations } from "./i18n";
import { useColors } from "./theme";

interface Props {
  onSelect: (prompt: string) => void;
  dynamicFollowUps?: string[];
  isInitial?: boolean;
  lang: Lang;
}

export const SuggestedPrompts: React.FC<Props> = ({ onSelect, dynamicFollowUps, isInitial, lang }) => {
  const t = translations[lang];
  const c = useColors();

  if (!isInitial && (!dynamicFollowUps || dynamicFollowUps.length === 0)) return null;

  if (!isInitial) {
    return (
      <div className="flex flex-wrap gap-2 justify-start">
        {(dynamicFollowUps || []).map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-3.5 py-2.5 rounded-xl text-xs transition-all duration-300 min-h-[40px]"
            style={{
              border: `1px solid ${c.bg.chipBorder}`,
              background: c.bg.chipBg,
              color: c.text.chip,
            }}
          >
            {q}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full">
      {t.prompts.map((p) => (
        <button
          key={p.text}
          onClick={() => onSelect(p.text)}
          dir={lang === "he" ? "rtl" : "ltr"}
          className="group relative text-left px-4 py-3 sm:py-3.5 rounded-xl transition-all duration-400 overflow-hidden min-h-[44px]"
          style={{
            border: `1px solid ${c.bg.chipBorder}`,
            background: c.bg.chipBg,
          }}
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(234,183,118,0.04) 0%, transparent 70%)" }}
          />
          <span className="block text-[12px] transition-colors duration-300 leading-relaxed font-light" style={{ color: c.text.chip }}>
            {p.text}
          </span>
        </button>
      ))}
    </div>
  );
};
