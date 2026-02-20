import React from "react";
import { Lang, translations } from "./i18n";

interface Props {
  onSelect: (prompt: string) => void;
  dynamicFollowUps?: string[];
  isInitial?: boolean;
  lang: Lang;
}

export const SuggestedPrompts: React.FC<Props> = ({ onSelect, dynamicFollowUps, isInitial, lang }) => {
  const t = translations[lang];

  if (!isInitial && (!dynamicFollowUps || dynamicFollowUps.length === 0)) return null;

  if (!isInitial) {
    return (
      <div className="flex flex-wrap gap-2 justify-start">
        {(dynamicFollowUps || []).map((q) => (
          <button
            key={q}
            onClick={() => onSelect(q)}
            className="px-3.5 py-2 rounded-xl border border-white/[0.05] bg-white/[0.02] hover:bg-[#EAB776]/[0.06] hover:border-[#EAB776]/15 text-xs text-white/35 hover:text-white/65 transition-all duration-300"
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
          className="group relative text-left px-4 py-3.5 rounded-xl border border-white/[0.04] bg-white/[0.015] hover:bg-white/[0.04] hover:border-white/[0.08] transition-all duration-400 overflow-hidden"
        >
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 50% 100%, rgba(234,183,118,0.04) 0%, transparent 70%)" }}
          />
          <span className="block text-[12px] text-white/30 group-hover:text-white/55 transition-colors duration-300 leading-relaxed font-light">
            {p.text}
          </span>
        </button>
      ))}
    </div>
  );
};
