import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChartRenderer, ChartSpec } from "./ChartRenderer";
import { SuggestedPrompts } from "./SuggestedPrompts";
import { SpectraLogo } from "./SpectraLogo";
import { GlobeVisual } from "./GlobeVisual";
import { Lang, translations } from "./i18n";
import { useColors, useTheme } from "./theme";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  bullets?: string[];
  chart?: ChartSpec | null;
  confidence?: string;
  suggestedFollowUps?: string[];
  timestamp: string;
}

interface Props {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  loading: boolean;
  lang: Lang;
}

const MOCK_CHART_DATA = [
  { month: "Sep", demand: 62, margin: 55 },
  { month: "Oct", demand: 68, margin: 58 },
  { month: "Nov", demand: 74, margin: 61 },
  { month: "Dec", demand: 85, margin: 64 },
  { month: "Jan", demand: 78, margin: 66 },
  { month: "Feb", demand: 82, margin: 68 },
  { month: "Mar", demand: 91, margin: 70 },
];

const KPI_DATA = [
  { key: "demand" as const, value: "91.2", delta: "+12.4%", up: true },
  { key: "margin" as const, value: "68%", delta: "+5.2%", up: true },
  { key: "retention" as const, value: "82%", delta: "+4.2%", up: true },
  { key: "growth" as const, value: "23%", delta: "+8.1%", up: true },
];

/* ────────────── Hero Command Bar ────────────── */

const CommandBar: React.FC<{
  value: string;
  onChange: (v: string) => void;
  onSend: () => void;
  loading: boolean;
  compact?: boolean;
  placeholder: string;
}> = ({ value, onChange, onSend, loading, compact, placeholder }) => {
  const ref = useRef<HTMLTextAreaElement>(null);
  const c = useColors();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  return (
    <div className={`relative w-full ${compact ? "max-w-3xl" : "max-w-2xl"} mx-auto group`}>
      <div
        className="absolute -inset-3 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-1000 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(234,183,118,0.12) 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />
      <div className="absolute -inset-px rounded-2xl overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0 opacity-40 group-focus-within:opacity-90 transition-opacity duration-700"
          style={{
            background: "linear-gradient(160deg, rgba(234,183,118,0.30) 0%, rgba(177,128,89,0.06) 40%, rgba(212,160,106,0.04) 70%, rgba(177,128,89,0.20) 100%)",
          }}
        />
      </div>
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: c.bg.commandSurface,
          border: `1px solid ${c.bg.commandBorder}`,
          boxShadow: c.bg.commandShadow,
        }}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={1}
          dir="auto"
          className={`w-full resize-none bg-transparent focus:outline-none transition-all ${
            compact ? "px-5 pt-3 pb-2 text-sm" : "px-6 pt-5 pb-3 text-[15px]"
          }`}
          style={{ fontWeight: 300, letterSpacing: "0.01em", color: c.text.primarySoft }}
        />
        <div className={`flex items-center justify-between ${compact ? "px-4 pb-2" : "px-5 pb-4"}`}>
          <span className="text-[9px] font-light tracking-[0.2em] uppercase select-none" style={{ color: c.text.label }}>
            Spectra AI
          </span>
          <button
            onClick={onSend}
            disabled={!value.trim() || loading}
            className="w-11 h-11 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white transition-all duration-300 disabled:opacity-10 disabled:cursor-default hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #EAB776 0%, #B18059 100%)",
              boxShadow: value.trim() ? "0 0 20px rgba(234,183,118,0.25)" : "none",
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ────────────── Analytics Preview ────────────── */

const AnalyticsPreview: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = translations[lang];
  const c = useColors();

  return (
    <div className="relative w-full max-w-3xl mx-auto px-4 sm:px-6">
      <div className="text-center mb-8">
        <h2 className="text-sm font-light tracking-[0.2em] uppercase" style={{ color: c.text.muted }}>{t.analyticsTitle}</h2>
        <p className="text-[11px] mt-2 font-light tracking-wide" style={{ color: c.text.dimmed }}>{t.analyticsSubtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-8">
        {KPI_DATA.map(kpi => (
          <div
            key={kpi.key}
            className="rounded-xl px-4 py-3.5"
            style={{
              background: c.bg.kpiCard,
              border: `1px solid ${c.bg.kpiBorder}`,
            }}
          >
            <p className="text-[9px] font-light tracking-[0.15em] uppercase mb-2" style={{ color: c.text.kpiLabel }}>
              {t.kpi[kpi.key]}
            </p>
            <div className="flex items-end gap-2">
              <span className="text-xl font-extralight leading-none tracking-tight" style={{ color: c.text.kpiValue }}>{kpi.value}</span>
              <span className={`text-[10px] font-medium leading-none pb-0.5 ${kpi.up ? "text-emerald-400/80" : "text-red-400/80"}`}>
                {kpi.delta}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl p-5"
        style={{
          background: c.bg.chartContainer,
          border: `1px solid ${c.bg.chartBorder}`,
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={MOCK_CHART_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="hg_goldFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EAB776" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#EAB776" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="hg_amberFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#D4A06A" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#D4A06A" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={c.bg.chartGrid} />
              <XAxis
                dataKey="month"
                tick={{ fill: c.text.chartAxis, fontSize: 10, fontWeight: 300 }}
                axisLine={{ stroke: c.hero.chartAxisLine }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: c.text.chartAxisY, fontSize: 10, fontWeight: 300 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: c.bg.tooltip,
                  border: `1px solid ${c.bg.tooltipBorder}`,
                  borderRadius: 12,
                  color: c.text.tooltip,
                  fontSize: 11,
                  fontWeight: 300,
                }}
              />
              <Area
                type="monotone"
                dataKey="demand"
                stroke="#EAB776"
                strokeWidth={1.5}
                fill="url(#hg_goldFill)"
                dot={false}
                activeDot={{ r: 3, fill: "#EAB776", stroke: "#EAB776", strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="margin"
                stroke="#D4A06A"
                strokeWidth={1.5}
                fill="url(#hg_amberFill)"
                dot={false}
                activeDot={{ r: 3, fill: "#D4A06A", stroke: "#D4A06A", strokeWidth: 1 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[1.5px] rounded-full bg-[#EAB776]" />
            <span className="text-[10px] font-light" style={{ color: c.text.chartLegend }}>{t.kpi.demand}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-[1.5px] rounded-full bg-[#D4A06A]" />
            <span className="text-[10px] font-light" style={{ color: c.text.chartLegend }}>{t.kpi.margin}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────────── Live Intelligence Ticker ────────────── */

const LiveTicker: React.FC<{ lang: Lang }> = ({ lang }) => {
  const t = translations[lang];
  const c = useColors();
  const items = t.ticker;

  const tickerContent = useMemo(() => {
    return [...items, ...items].map((text, i) => (
      <span key={i} className="inline-flex items-center gap-4 whitespace-nowrap">
        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: c.bg.tickerDot }} />
        <span className="text-[11px] font-light tracking-wide" style={{ color: c.text.ticker }}>{text}</span>
      </span>
    ));
  }, [items, c]);

  return (
    <div className="relative w-full overflow-hidden py-4 group">
      <div className="absolute inset-y-0 left-0 w-28 z-10 pointer-events-none" style={{ background: c.hero.tickerFadeLeft }} />
      <div className="absolute inset-y-0 right-0 w-28 z-10 pointer-events-none" style={{ background: c.hero.tickerFadeRight }} />
      <div
        className="flex gap-8 group-hover:[animation-play-state:paused]"
        style={{ animation: `hg-ticker ${items.length * 5}s linear infinite` }}
      >
        {tickerContent}
      </div>
      <style>{`
        @keyframes hg-ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

/* ────────────── Main ChatView ────────────── */

export const ChatView: React.FC<Props> = ({ messages, onSend, loading, lang }) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const t = translations[lang];
  const c = useColors();
  const { isDark } = useTheme();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSend(trimmed);
    setInput("");
  };

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");

  /* ─── Welcome / Landing ─── */
  if (messages.length === 0 && !loading) {
    return (
      <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden overscroll-contain" style={{ background: c.hero.pageBg }}>
        {/* ═══════ Hero Section ═══════ */}
        <div className="relative flex flex-col" style={{ minHeight: "calc(100dvh - 3rem)" }}>

          {/* --- Photo Background (desktop only) --- */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden hidden sm:block"
            style={{
              backgroundImage: "url(/girl_with_ipad.png)",
              backgroundSize: "cover",
              backgroundPosition: "20% center",
              opacity: isDark ? 0.30 : 0.18,
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none hidden sm:block"
            style={{ background: c.hero.photoOverlay }}
          />

          {/* --- Gold glow accent --- */}
          <div
            className="absolute inset-0 pointer-events-none overflow-hidden"
            style={{ background: c.hero.goldGlow }}
          />

          {/* --- Giant Background Wordmark --- */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
            <h1
              className="whitespace-nowrap leading-none text-center"
              style={{
                fontSize: "clamp(4rem, 16vw, 20rem)",
                fontFamily: "'Playfair Display', Georgia, serif",
                fontWeight: 900,
                letterSpacing: "-0.04em",
                color: "transparent",
                WebkitTextStroke: c.hero.wordmarkStroke,
                textShadow: c.hero.wordmarkShadow,
              }}
            >
              HairGPT
            </h1>
          </div>

          {/* --- Rotating Globe (atmospheric, behind content) --- */}
          <div className="absolute inset-0 flex items-end justify-center pointer-events-none overflow-hidden" style={{ opacity: isDark ? 0.7 : 0.5 }}>
            <div className="hidden sm:block" style={{ marginBottom: "-240px" }}>
              <GlobeVisual size={520} />
            </div>
            <div className="sm:hidden" style={{ marginBottom: "-150px" }}>
              <GlobeVisual size={300} />
            </div>
          </div>

          {/* --- Content scrim (localized zone behind text) --- */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: c.hero.contentScrim }}
          />

          {/* --- Hero Content --- */}
          <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-6 sm:pb-10 relative z-10">
            <div className="relative mb-5 sm:mb-8">
              <SpectraLogo
                size={68}
                className="sm:!w-[88px] sm:!h-[88px] drop-shadow-[0_0_35px_rgba(234,183,118,0.30)]"
              />
            </div>

            <h1
              className="text-center mb-3 sm:mb-4"
              style={{
                fontSize: "clamp(2.2rem, 6vw, 6rem)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
              }}
            >
              <span
                style={{
                  fontWeight: 300,
                  color: c.hero.titleColor,
                  textShadow: c.hero.titleShadow,
                }}
              >
                Hair
              </span>
              <span
                style={{
                  fontWeight: 700,
                  background: "linear-gradient(135deg, #F0C987 0%, #EAB776 30%, #D4A06A 65%, #B18059 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 30px rgba(234,183,118,0.22)) drop-shadow(0 2px 10px rgba(0,0,0,0.3))",
                  letterSpacing: "0.01em",
                }}
              >
                GPT
              </span>
            </h1>

            <p
              className="text-center max-w-md mb-8 sm:mb-14 px-2"
              style={{
                color: c.hero.subtitleColor,
                fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)",
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 400,
                lineHeight: 1.8,
                letterSpacing: "0.05em",
                textShadow: c.hero.subtitleShadow,
              }}
            >
              {t.subtitle}
            </p>

            <CommandBar
              value={input}
              onChange={setInput}
              onSend={handleSend}
              loading={loading}
              placeholder={t.placeholder}
            />

            <div className="mt-6 sm:mt-10 w-full max-w-2xl px-1">
              <SuggestedPrompts onSelect={onSend} isInitial lang={lang} />
            </div>
          </div>

          <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500&family=Cormorant+Garamond:wght@300;400;500;600;700&display=swap');
          `}</style>
        </div>

        {/* ═══════ Hero → Analytics Transition ═══════ */}
        <div className="relative h-16 pointer-events-none" style={{ background: c.hero.transitionBg }}>
          <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-32 sm:w-48 h-[1px]" style={{ background: c.hero.transitionLine }} />
        </div>

        {/* ═══════ Analytics Section ═══════ */}
        <div className="relative py-14">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: c.hero.analyticsBg }}
          />
          <AnalyticsPreview lang={lang} />
        </div>

        {/* ═══════ Ticker ═══════ */}
        <div className="relative" style={{ borderTop: c.hero.tickerBorder }}>
          <LiveTicker lang={lang} />
        </div>
      </div>
    );
  }

  /* ─── Active Chat ─── */
  return (
    <div className="flex flex-col h-full" style={{ background: c.bg.chat }}>
      <div className="flex-1 overflow-y-auto overscroll-contain py-4 sm:py-6 space-y-3 sm:space-y-4 mx-auto w-full max-w-4xl px-4 sm:px-10 lg:px-16">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className="rounded-2xl px-4 sm:px-5 py-3 sm:py-3.5"
              style={{
                maxWidth: "min(85%, 520px)",
                wordBreak: "break-word" as const,
                ...(msg.role === "user"
                  ? {
                      background: "linear-gradient(135deg, rgba(234,183,118,0.90), rgba(177,128,89,0.90))",
                      boxShadow: "0 4px 20px rgba(234,183,118,0.10)",
                      color: "#ffffff",
                    }
                  : {
                      background: c.bg.aiBubble,
                      border: `1px solid ${c.bg.aiBubbleBorder}`,
                      color: c.text.primarySoft,
                    }),
              }}
            >
              {msg.role === "user" ? (
                <p className="text-sm whitespace-pre-wrap leading-relaxed" dir="auto">{msg.content}</p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm whitespace-pre-wrap leading-[1.8]" dir="auto">{msg.content}</p>
                  {msg.bullets && msg.bullets.length > 0 && (
                    <ul className="space-y-2 pr-1">
                      {msg.bullets.map((b, j) => (
                        <li key={j} className="flex gap-2.5 text-sm" style={{ color: c.text.bullet }}>
                          <span className="text-[#EAB776] mt-0.5 flex-shrink-0 text-xs">&#9670;</span>
                          <span dir="auto">{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {msg.chart && <ChartRenderer spec={msg.chart} />}
                  {msg.confidence && (
                    <div className="flex items-center gap-2 pt-1 mt-2" style={{ borderTop: `1px solid ${c.bg.confidenceBorder}` }}>
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        msg.confidence === "high" ? "bg-emerald-400" :
                        msg.confidence === "medium" ? "bg-amber-400" : "bg-red-400"
                      }`} />
                      <span className="text-[10px] font-light" style={{ color: c.text.confidence }}>
                        {msg.confidence === "high" ? t.confidence.high :
                         msg.confidence === "medium" ? t.confidence.medium : t.confidence.low}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-6 py-4" style={{ background: c.bg.loading, border: `1px solid ${c.bg.loadingBorder}` }}>
              <div className="flex gap-2">
                <span className="w-1.5 h-1.5 bg-[#EAB776] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-[#D4A06A] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-[#B18059] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        {!loading && lastAssistant?.suggestedFollowUps && lastAssistant.suggestedFollowUps.length > 0 && (
          <div className="pt-2">
            <SuggestedPrompts onSelect={onSend} dynamicFollowUps={lastAssistant.suggestedFollowUps} lang={lang} />
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Chat footer input */}
      <div
        className="pt-3 sm:pt-4 backdrop-blur-md"
        style={{
          background: c.bg.footerBg,
          borderTop: `1px solid ${c.bg.footerBorder}`,
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-auto w-full max-w-4xl px-4 sm:px-10 lg:px-16">
          <CommandBar
            value={input}
            onChange={setInput}
            onSend={handleSend}
            loading={loading}
            compact
            placeholder={t.placeholder}
          />
        </div>
      </div>
    </div>
  );
};
