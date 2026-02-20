import React, { useState, useCallback, useEffect } from "react";
import { ConversationSidebar, Conversation } from "./ConversationSidebar";
import { ChatView, ChatMessage } from "./ChatView";
import { SpectraLogo } from "./SpectraLogo";
import { Lang, translations } from "./i18n";

const STORAGE_KEY = "hairgpt_conversations";
const SESSION_KEY = "hairgpt_unlocked";
const LANG_KEY = "hairgpt_lang";
const ACCESS_CODE = "1212";

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveConversations(convs: Conversation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(convs));
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateTitle(firstMessage: string): string {
  const words = firstMessage.split(/\s+/).slice(0, 6);
  const title = words.join(" ");
  return title.length > 40 ? title.slice(0, 40) + "…" : title;
}

const LanguageToggle: React.FC<{ lang: Lang; onToggle: () => void }> = ({ lang, onToggle }) => (
  <button
    onClick={onToggle}
    className="flex items-center h-7 rounded-full border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] transition-all duration-300 overflow-hidden text-[11px] font-light tracking-wide"
  >
    <span className={`px-2.5 py-1 transition-all duration-300 ${lang === "en" ? "text-[#EAB776]" : "text-white/30"}`}>
      EN
    </span>
    <span className="w-px h-3 bg-white/[0.08]" />
    <span className={`px-2.5 py-1 transition-all duration-300 ${lang === "he" ? "text-[#EAB776]" : "text-white/30"}`}>
      HE
    </span>
  </button>
);

export const HairGPTPage: React.FC = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(SESSION_KEY) === ACCESS_CODE);
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang) || "en");

  const [conversations, setConversations] = useState<Conversation[]>(loadConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const t = translations[lang];

  const toggleLang = useCallback(() => {
    setLang((prev) => {
      const next = prev === "en" ? "he" : "en";
      localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const activeConv = conversations.find((c) => c.id === activeId) || null;
  const activeMessages: ChatMessage[] = activeConv?.messages || [];

  const handleNew = useCallback(() => {
    setActiveId(null);
    setSidebarOpen(false);
  }, []);

  const handleSelect = useCallback((id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
  }, []);

  const handleDelete = useCallback((id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
  }, [activeId]);

  const handleSend = useCallback(async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text, timestamp: new Date().toISOString() };

    let convId = activeId;
    let updatedMessages: ChatMessage[];

    if (!convId) {
      convId = generateId();
      updatedMessages = [userMsg];
      const newConv: Conversation = {
        id: convId,
        title: generateTitle(text),
        createdAt: new Date().toISOString(),
        messages: updatedMessages,
      };
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(convId);
    } else {
      updatedMessages = [...activeMessages, userMsg];
      setConversations((prev) =>
        prev.map((c) => (c.id === convId ? { ...c, messages: updatedMessages } : c))
      );
    }

    setLoading(true);

    try {
      const apiMessages = updatedMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/.netlify/functions/hairgpt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Access-Code": ACCESS_CODE,
        },
        body: JSON.stringify({ messages: apiMessages }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.answer || "Could not process the question.",
        bullets: data.bullets || [],
        chart: data.chart || null,
        confidence: data.confidence || "medium",
        suggestedFollowUps: data.suggestedFollowUps || [],
        timestamp: new Date().toISOString(),
      };

      const finalId = convId;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === finalId ? { ...c, messages: [...c.messages, assistantMsg] } : c
        )
      );
    } catch (e: any) {
      const errorMsg: ChatMessage = {
        role: "assistant",
        content: `Error: ${e.message || "Server issue"}. Please try again.`,
        timestamp: new Date().toISOString(),
      };
      const finalId = convId;
      setConversations((prev) =>
        prev.map((c) =>
          c.id === finalId ? { ...c, messages: [...c.messages, errorMsg] } : c
        )
      );
    } finally {
      setLoading(false);
    }
  }, [activeId, activeMessages]);

  // Access gate
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px]"
            style={{ background: "radial-gradient(ellipse 50% 40% at 50% 40%, rgba(234,183,118,0.07) 0%, transparent 70%)" }}
          />
        </div>

        {/* Language toggle */}
        <div className="fixed top-4 right-4 z-50">
          <LanguageToggle lang={lang} onToggle={toggleLang} />
        </div>

        <div className="w-full max-w-sm text-center relative z-10">
          <div className="mx-auto mb-8">
            <SpectraLogo size={72} className="mx-auto drop-shadow-[0_0_20px_rgba(234,183,118,0.2)]" />
          </div>
          <h3 className="text-2xl font-extralight text-white mb-1 tracking-[-0.02em]">
            Hair<span className="font-light text-transparent bg-clip-text bg-gradient-to-r from-[#EAB776] to-[#B18059]">GPT</span>
          </h3>
          <p className="text-xs text-white/20 mb-10 font-light">{t.enterCode}</p>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            value={code}
            onChange={(e) => {
              const digits = e.currentTarget.value.replace(/\D/g, "");
              setCode(digits);
              if (codeError) setCodeError("");
              if (digits.length === 4 && digits !== ACCESS_CODE) {
                setCodeError(t.wrongCode);
              }
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && code === ACCESS_CODE) {
                sessionStorage.setItem(SESSION_KEY, ACCESS_CODE);
                setUnlocked(true);
              }
            }}
            className="w-full text-center tracking-[0.6em] text-2xl font-light bg-white/[0.03] text-white placeholder:text-white/15 border border-white/[0.06] rounded-2xl px-4 py-4 focus:outline-none focus:border-[#EAB776]/25 transition-all duration-500"
            placeholder="• • • •"
            autoFocus
          />
          {codeError && <p className="text-xs text-red-400/70 mt-3 font-light">{codeError}</p>}
          <button
            onClick={() => {
              if (code === ACCESS_CODE) {
                sessionStorage.setItem(SESSION_KEY, ACCESS_CODE);
                setUnlocked(true);
              } else {
                setCodeError(t.wrongCode);
              }
            }}
            className="mt-8 px-10 py-3 rounded-full bg-gradient-to-r from-[#EAB776] to-[#B18059] text-sm font-medium text-white hover:shadow-[0_0_30px_rgba(234,183,118,0.3)] transition-all duration-500"
          >
            {t.enter}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#050505] flex overflow-hidden relative">
      <ConversationSidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={handleSelect}
        onNew={handleNew}
        onDelete={handleDelete}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        lang={lang}
      />
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top bar */}
        <div className="h-12 flex items-center justify-between px-4 sm:px-6 bg-transparent flex-shrink-0 relative z-10">
          <div className="flex items-center gap-3">
            {/* Sidebar toggle - always visible */}
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center text-white/25 hover:text-white/50 transition-all"
            >
              <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>
            {activeConv && (
              <span className="text-xs text-white/20 font-light truncate max-w-[200px]">
                {activeConv.title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle lang={lang} onToggle={toggleLang} />
            <a href="/" className="text-white/15 hover:text-white/35 transition-all duration-300 text-[11px] font-light tracking-wide">
              {t.backToSite}
            </a>
          </div>
        </div>
        <ChatView messages={activeMessages} onSend={handleSend} loading={loading} lang={lang} />
      </main>
    </div>
  );
};
