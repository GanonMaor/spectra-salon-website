import React from "react";
import { SpectraLogo } from "./SpectraLogo";
import { Lang, translations } from "./i18n";

export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  messages: any[];
}

interface Props {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  open: boolean;
  onToggle: () => void;
  lang: Lang;
}

export const ConversationSidebar: React.FC<Props> = ({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  open,
  onToggle,
  lang,
}) => {
  const t = translations[lang];

  return (
    <>
      {/* Sidebar panel -- hidden by default on ALL sizes, slides in when open */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-[280px] sm:w-64 bg-[#0a0a0a]/98 backdrop-blur-2xl border-r border-white/[0.04] flex flex-col transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        {/* Header */}
        <div className="p-4 pb-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <SpectraLogo size={28} />
              <span className="text-[13px] font-light text-white/55 tracking-wide">HairGPT</span>
            </div>
            <button
              onClick={onToggle}
              className="w-10 h-10 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/40 hover:text-white/60 transition"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={onNew}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.08] hover:border-[#EAB776]/20 bg-white/[0.03] hover:bg-[#EAB776]/[0.06] text-white/50 hover:text-white/70 text-[13px] font-light transition-all duration-300"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            {t.newChat}
          </button>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-white/30 text-[11px] text-center py-12 px-4 font-light">
              {t.noChats}
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`group flex items-center gap-2 px-3 py-3 sm:py-2.5 rounded-lg cursor-pointer transition-all duration-200 min-h-[44px] ${
                activeId === c.id
                  ? "bg-white/[0.08] text-white/80"
                  : "text-white/45 hover:bg-white/[0.04] hover:text-white/60"
              }`}
            >
              <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.2 48.2 0 005.069-.528 2.99 2.99 0 002.538-2.734c.07-.674.106-1.355.106-2.039 0-4.6-4.03-8.18-9.075-8.18S3 6.58 3 11.18c0 .684.036 1.365.107 2.04z" />
              </svg>
              <span className="flex-1 text-[12px] truncate font-light">{c.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.id); }}
                className="opacity-0 group-hover:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 w-8 h-8 rounded-lg flex items-center justify-center text-white/15 hover:text-red-400/60 transition-all flex-shrink-0"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 pt-3" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
          <div className="h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent mb-3" />
          <p className="text-[9px] text-white/25 text-center font-light tracking-widest uppercase">
            {t.poweredBy}
          </p>
        </div>
      </div>

      {/* Overlay when sidebar is open */}
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30" onClick={onToggle} />
      )}
    </>
  );
};
