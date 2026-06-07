import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Glyph, GlyphName } from "../../SpectraInvestorExperience/visuals/Glyph";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { AGENT_ACCENT, DEFAULT_AGENT_ACCENT, INK, darkGlass } from "../theme";

const AGENT_GLYPHS: GlyphName[] = ["ai", "inventory", "calendar", "profit", "retention"];

interface AgentSuitePhoneProps {
  agents: readonly string[];
  accent: string;
  accentBorder: string;
}

// iPhone 15 Pro SVG coordinate space
const VW = 320;
const VH = 693;
const OUTER_R = 46;   // outer titanium frame corner radius
const BEZEL = 10;     // frame bezel thickness
const SW = VW - BEZEL * 2;   // screen width = 300
const SH = VH - BEZEL * 2;   // screen height = 673
const SR = 38;                // screen inner corner radius
const DI_W = 124;             // Dynamic Island width
const DI_H = 36;              // Dynamic Island height
const DI_X = (VW - DI_W) / 2; // = 98 (centered)
const DI_Y = BEZEL + 14;      // = 24 (below bezel top + 14)

// CSS percentages for the HTML screen layer
const SL = `${(BEZEL / VW) * 100}%`;          // left = 3.125%
const ST = `${(BEZEL / VH) * 100}%`;          // top  = 1.443%
const SRX = `${(SR / SW) * 100}% / ${(SR / SH) * 100}%`; // 12.67% / 5.65%

// Button position helpers (% of phone height)
const bTop = (y: number) => `${(y / VH) * 100}%`;
const bH = (h: number) => `${(h / VH) * 100}%`;

export const AgentSuitePhone: React.FC<AgentSuitePhoneProps> = ({ agents, accent, accentBorder }) => {
  const reduced = useReducedMotion() ?? false;

  return (
    <div className="relative flex items-start justify-end w-full">
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.28 }}
        className="relative"
        style={{
          height: "125vh",
          aspectRatio: `${VW} / ${VH}`,
          filter:
            "drop-shadow(-20px 0px 80px rgba(0,0,0,0.65)) drop-shadow(0px 40px 80px rgba(0,0,0,0.55))",
        }}
      >

        {/* ── Side hardware buttons ── */}
        {/* Silent switch */}
        <div className="absolute pointer-events-none" style={{ left: "-4px", top: bTop(120), width: "4px", height: bH(24), borderRadius: "2px", background: "linear-gradient(180deg,#3e3a36,#1a1714,#3e3a36)", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.6)" }} />
        {/* Volume up */}
        <div className="absolute pointer-events-none" style={{ left: "-4px", top: bTop(162), width: "4px", height: bH(58), borderRadius: "2px", background: "linear-gradient(180deg,#3e3a36,#1a1714,#3e3a36)", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.6)" }} />
        {/* Volume down */}
        <div className="absolute pointer-events-none" style={{ left: "-4px", top: bTop(232), width: "4px", height: bH(58), borderRadius: "2px", background: "linear-gradient(180deg,#3e3a36,#1a1714,#3e3a36)", boxShadow: "inset 1px 0 0 rgba(255,255,255,0.12), 0 1px 2px rgba(0,0,0,0.6)" }} />
        {/* Power */}
        <div className="absolute pointer-events-none" style={{ right: "-4px", top: bTop(188), width: "4px", height: bH(72), borderRadius: "2px", background: "linear-gradient(180deg,#3e3a36,#1a1714,#3e3a36)", boxShadow: "inset -1px 0 0 rgba(255,255,255,0.08), 0 1px 2px rgba(0,0,0,0.6)" }} />

        {/* ── OLED screen content ── */}
        <div
          className="absolute overflow-hidden"
          style={{
            left: SL, top: ST, right: SL, bottom: ST,
            borderRadius: SRX,
            background: "#060504",
            zIndex: 1,
          }}
        >
          {/* OLED depth gradient */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(175deg, #12100e 0%, #060504 60%, #040302 100%)" }} />

          {/* ── App UI ── */}
          <div className="relative z-10 flex flex-col h-full">

            {/* Status bar — items flank the Dynamic Island gap */}
            <div
              className="flex items-center shrink-0 px-[5%]"
              style={{ height: `${((DI_Y - BEZEL + DI_H + 6) / SH) * 100}%` }}
            >
              <span className="font-semibold tabular-nums text-[clamp(8px,1.4vh,11px)]" style={{ color: "rgba(251,246,239,0.75)" }}>9:41</span>
              {/* gap for Dynamic Island */}
              <div className="flex-1" />
              {/* Signal bars */}
              <svg width="16" height="11" viewBox="0 0 16 11" fill="none" aria-hidden style={{ marginRight: "6px" }}>
                <rect x="0" y="7" width="3" height="4" rx="0.5" fill="rgba(251,246,239,0.5)" />
                <rect x="4.5" y="5" width="3" height="6" rx="0.5" fill="rgba(251,246,239,0.6)" />
                <rect x="9" y="2.5" width="3" height="8.5" rx="0.5" fill="rgba(251,246,239,0.7)" />
                <rect x="13.5" y="0" width="2.5" height="11" rx="0.5" fill="rgba(251,246,239,0.85)" />
              </svg>
              {/* Battery */}
              <svg width="22" height="11" viewBox="0 0 22 11" fill="none" aria-hidden>
                <rect x="0.5" y="0.5" width="18" height="10" rx="2" stroke="rgba(251,246,239,0.4)" />
                <rect x="2" y="2" width="13" height="7" rx="1" fill="rgba(251,246,239,0.72)" />
                <rect x="19.5" y="3.5" width="2" height="4" rx="0.5" fill="rgba(251,246,239,0.4)" />
              </svg>
            </div>

            {/* In-app header card */}
            <div className="px-[4%] pb-[2.5%] shrink-0">
              <div
                className="rounded-xl px-[4%] py-[2.5%]"
                style={{ ...darkGlass(true), borderColor: accentBorder }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold uppercase tracking-[0.2em] mb-0.5 text-[clamp(7px,1.1vh,10px)]" style={{ color: accent }}>
                      Salon AI
                    </div>
                    <div className="font-medium text-[clamp(11px,1.8vh,15px)]" style={{ color: INK.strong }}>
                      Agent Suite
                    </div>
                  </div>
                  <span
                    className="font-medium px-[6%] py-[1%] rounded-full text-[clamp(7px,1.1vh,10px)]"
                    style={{ color: accent, background: "rgba(255,255,255,0.06)", border: `1px solid ${accentBorder}` }}
                  >
                    5 agents
                  </span>
                </div>
              </div>
            </div>

            {/* Agent list */}
            <div className="flex-1 min-h-0 px-[3.5%] pb-[4%] flex flex-col gap-[1.5%] overflow-hidden justify-center">
              {agents.map((agent, i) => {
                const ac = AGENT_ACCENT[agent] ?? DEFAULT_AGENT_ACCENT;
                const isFirst = i === 0;
                return (
                  <motion.div
                    key={agent}
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.44 + i * 0.08 }}
                    className="relative rounded-xl overflow-hidden flex items-center shrink-0"
                    style={{
                      ...darkGlass(isFirst),
                      border: "none",
                      boxShadow: isFirst
                        ? `0 0 0 1px ${ac.accentBorder}, 0 0 24px ${ac.glow}`
                        : `0 0 0 1px rgba(255,255,255,0.09)`,
                    }}
                  >
                    <div
                      className="self-stretch shrink-0"
                      style={{ width: "4px", background: `linear-gradient(180deg, ${ac.accent}, ${ac.accentDeep})` }}
                    />
                    <div
                      className="rounded-lg flex items-center justify-center shrink-0 mx-[3%] my-[2%]"
                      style={{ width: "clamp(22px,3.5vh,30px)", height: "clamp(22px,3.5vh,30px)", background: ac.accentSoft }}
                    >
                      <Glyph name={AGENT_GLYPHS[i % AGENT_GLYPHS.length]} size={14} color={ac.accent} />
                    </div>
                    <div className="flex-1 min-w-0 py-[2%] pr-[2%]">
                      <span
                        className="font-medium block leading-tight text-[clamp(10px,1.6vh,13px)]"
                        style={{ color: INK.strong }}
                      >
                        {agent}
                      </span>
                    </div>
                    {isFirst && (
                      <span
                        className="mr-[4%] shrink-0 font-bold uppercase tracking-[0.12em] px-[5%] py-[0.5%] rounded-full text-[clamp(7px,1vh,9px)]"
                        style={{ color: ac.accent, background: ac.accentSoft, border: `1px solid ${ac.accentBorder}` }}
                      >
                        Core
                      </span>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Home indicator */}
            <div className="flex justify-center shrink-0 pb-[2%] pt-[1%]">
              <div className="rounded-full" style={{ width: "30%", height: "4px", background: "rgba(255,255,255,0.30)" }} />
            </div>
          </div>
        </div>

        {/* ── Dynamic Island ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${(DI_X / VW) * 100}%`,
            top: `${(DI_Y / VH) * 100}%`,
            width: `${(DI_W / VW) * 100}%`,
            height: `${(DI_H / VH) * 100}%`,
            borderRadius: "50px",
            background: "#050403",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 2px rgba(0,0,0,0.8)",
            zIndex: 2,
          }}
        />

        {/* ── SVG titanium frame overlay ── */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="absolute inset-0 w-full h-full pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          style={{ zIndex: 3 }}
        >
          <defs>
            {/* Titanium Black gradient */}
            <linearGradient id="ti-frame" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%"   stopColor="#4c4844" />
              <stop offset="12%"  stopColor="#3a3632" />
              <stop offset="30%"  stopColor="#252220" />
              <stop offset="52%"  stopColor="#161412" />
              <stop offset="72%"  stopColor="#1c1a18" />
              <stop offset="100%" stopColor="#2e2a26" />
            </linearGradient>

            {/* Top edge specular catch-light */}
            <linearGradient id="spec-top" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.36)" />
              <stop offset="35%"  stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>

            {/* Left edge vertical specular */}
            <linearGradient id="spec-left" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="rgba(255,255,255,0.28)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>

            {/* Mask: opaque for frame ring, transparent for screen hole */}
            <mask id="frame-mask">
              <rect x="0" y="0" width={VW} height={VH} rx={OUTER_R} fill="white" />
              <rect x={BEZEL} y={BEZEL} width={SW} height={SH} rx={SR} fill="black" />
            </mask>
          </defs>

          {/* Titanium frame base */}
          <rect x="0" y="0" width={VW} height={VH} rx={OUTER_R}
            fill="url(#ti-frame)" mask="url(#frame-mask)" />

          {/* Top specular highlight across full frame */}
          <rect x="0" y="0" width={VW} height={VH} rx={OUTER_R}
            fill="url(#spec-top)" mask="url(#frame-mask)" opacity="0.8" />

          {/* Left edge strip specular */}
          <rect x="0" y={OUTER_R} width={BEZEL} height={VH - OUTER_R * 2}
            fill="url(#spec-left)" mask="url(#frame-mask)" opacity="0.55" />

          {/* Right edge inner shadow */}
          <rect x={VW - BEZEL} y={OUTER_R} width={BEZEL} height={VH - OUTER_R * 2}
            fill="rgba(0,0,0,0.40)" mask="url(#frame-mask)" />

          {/* Outer frame hairline border */}
          <rect x="0.5" y="0.5" width={VW - 1} height={VH - 1} rx={OUTER_R - 0.5}
            fill="none" stroke="rgba(255,255,255,0.20)" strokeWidth="0.75" />

          {/* Inner screen bezel hairline */}
          <rect x={BEZEL} y={BEZEL} width={SW} height={SH} rx={SR}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        </svg>

        {/* ── Screen glass reflection (above content, below frame) ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: SL, top: ST, right: SL, bottom: ST,
            borderRadius: SRX,
            background: "linear-gradient(132deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 22%, transparent 48%)",
            zIndex: 4,
          }}
        />

        {/* ── OLED vignette ── */}
        <div
          className="absolute pointer-events-none"
          style={{
            left: SL, top: ST, right: SL, bottom: ST,
            borderRadius: SRX,
            boxShadow: "inset 0 0 60px rgba(0,0,0,0.30)",
            zIndex: 4,
          }}
        />
      </motion.div>
    </div>
  );
};
