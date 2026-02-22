import React, { useState, useRef, useEffect } from "react";
import { useSiteColors, useSiteTheme } from "../../../contexts/SiteTheme";

interface Msg {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "How can Spectra save me money?",
  "Calculate my salon's waste",
  "How does the smart scale work?",
];

export const HeroChat: React.FC = () => {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const c = useSiteColors();
  const { isDark } = useSiteTheme();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const send = async (text: string) => {
    if (!text.trim() || loading) return;
    const userMsg: Msg = { role: "user", content: text.trim() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/.netlify/functions/hero-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || `Server error (${res.status})`);
      }
      if (data.answer) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.answer }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Try again." }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Connection error. Please try again.";
      setMessages((prev) => [...prev, { role: "assistant", content: msg }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const glassBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.55)";
  const glassBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const inputBg = isDark ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.70)";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)";
  const userBubbleBg = isDark ? "rgba(234,183,118,0.15)" : "rgba(234,183,118,0.12)";
  const userBubbleBorder = isDark ? "rgba(234,183,118,0.25)" : "rgba(234,183,118,0.20)";
  const aiBubbleBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
  const aiBubbleBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const chipBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.60)";
  const chipBorder = isDark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.08)";
  const chipHoverBg = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.85)";

  const hasMessages = messages.length > 0;

  return (
    <div
      className="w-full max-w-3xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-xl transition-all duration-500"
      style={{
        background: glassBg,
        border: `1px solid ${glassBorder}`,
        boxShadow: isDark
          ? "0 8px 32px rgba(0,0,0,0.3)"
          : "0 8px 32px rgba(0,0,0,0.08)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-5 py-3"
        style={{ borderBottom: `1px solid ${glassBorder}` }}
      >
        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#EAB776] to-[#B18059] animate-pulse" />
        <span
          className="text-xs font-medium uppercase tracking-[0.12em]"
          style={{ color: c.hero.textDimmed }}
        >
          Spectra AI Assistant
        </span>
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="overflow-y-auto overscroll-contain transition-all duration-300"
        style={{
          maxHeight: hasMessages ? "240px" : "0px",
          minHeight: hasMessages ? "80px" : "0px",
        }}
      >
        <div className="flex flex-col gap-3 p-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className="max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                style={{
                  background: msg.role === "user" ? userBubbleBg : aiBubbleBg,
                  border: `1px solid ${msg.role === "user" ? userBubbleBorder : aiBubbleBorder}`,
                  color: c.hero.textPrimary,
                  borderRadius: msg.role === "user"
                    ? "20px 20px 6px 20px"
                    : "20px 20px 20px 6px",
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div
                className="px-4 py-3 rounded-2xl flex gap-1.5"
                style={{
                  background: aiBubbleBg,
                  border: `1px solid ${aiBubbleBorder}`,
                  borderRadius: "20px 20px 20px 6px",
                }}
              >
                {[0, 1, 2].map((d) => (
                  <div
                    key={d}
                    className="w-1.5 h-1.5 rounded-full bg-[#D4A06A] animate-bounce"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Suggestions (shown when no messages) */}
      {!hasMessages && (
        <div className="flex flex-wrap gap-2 px-5 pt-3 pb-1 justify-center">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3.5 py-2 rounded-full transition-all duration-200 cursor-pointer"
              style={{
                background: chipBg,
                border: `1px solid ${chipBorder}`,
                color: c.hero.textMuted,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = chipHoverBg;
                e.currentTarget.style.borderColor = "rgba(234,183,118,0.30)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = chipBg;
                e.currentTarget.style.borderColor = chipBorder;
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-3 sm:p-4">
        <div
          className="flex items-center gap-2 rounded-full px-4 py-2"
          style={{
            background: inputBg,
            border: `1px solid ${inputBorder}`,
          }}
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") send(input);
            }}
            placeholder="Ask how Spectra can help your salon..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:opacity-50"
            style={{ color: c.hero.textPrimary }}
            disabled={loading}
          />
          <button
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 flex-shrink-0 disabled:opacity-30"
            style={{
              background: input.trim()
                ? "linear-gradient(135deg, #EAB776, #B18059)"
                : "transparent",
            }}
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
