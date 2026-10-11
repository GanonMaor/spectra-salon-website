import React from "react";
import type { LucideIcon } from "lucide-react";
import { motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { CB } from "../../colorBarTokens";

/**
 * Editorial diagram primitives for the web-deck narrative slides.
 *
 * These replace the generic BulletList / Ledger / Chain wireframe treatment
 * with compositions that carry meaning: flows, radiating signals, timelines,
 * territories, converging streams. Everything stays inside the Color Bar
 * language (cream paper, ink, one copper accent, hairlines not cards) and
 * scales reasonably in the fluid mobile layout — flex/SVG based, nothing
 * pinned to absolute canvas coordinates.
 */

type Node = { label: string; sub?: string; dim?: boolean; accent?: boolean; icon?: LucideIcon };

/* ── Flow: a row of labeled nodes joined by arrows ───────────────────────── */

export const Flow: React.FC<{
  nodes: readonly Node[];
  size?: "md" | "lg";
}> = ({ nodes, size = "md" }) => (
  <ol
    style={{
      display: "flex",
      flexWrap: "wrap",
      alignItems: "stretch",
      gap: 0,
      margin: 0,
      padding: 0,
      listStyle: "none",
    }}
  >
    {nodes.map((node, index) => (
      <React.Fragment key={node.label}>
        {index > 0 ? (
          <span
            aria-hidden="true"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 20px",
              color: CB.faint,
              fontSize: size === "lg" ? 32 : 26,
            }}
          >
            →
          </span>
        ) : null}
        <li
          style={{
            padding: size === "lg" ? "20px 24px" : "16px 20px",
            border: `1px solid ${node.dim ? "rgba(92,72,42,0.10)" : node.accent ? CB.copperDeep : CB.lineStrong}`,
            background: node.dim ? CB.well : node.accent ? CB.copperSoft : "transparent",
            color: node.dim ? CB.faint : CB.ink,
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 14,
          }}
        >
          {node.icon ? (
            <span
              aria-hidden="true"
              style={{
                width: size === "lg" ? 48 : 42,
                height: size === "lg" ? 48 : 42,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                flexShrink: 0,
                border: `1px solid ${node.accent ? "rgba(198,162,99,0.85)" : "rgba(198,162,99,0.42)"}`,
                background: node.accent
                  ? "radial-gradient(circle at 32% 28%, rgba(255,232,176,0.55), rgba(198,162,99,0.18) 52%, rgba(163,125,56,0.08) 100%)"
                  : "radial-gradient(circle at 32% 28%, rgba(255,232,176,0.28), rgba(198,162,99,0.10) 52%, rgba(255,255,255,0.35) 100%)",
                color: CB.copperDeep,
                boxShadow: node.accent ? "0 0 0 4px rgba(198,162,99,0.10), 0 0 18px rgba(198,162,99,0.18)" : "0 0 0 4px rgba(198,162,99,0.06)",
              }}
            >
              <node.icon size={size === "lg" ? 22 : 18} strokeWidth={1.75} />
            </span>
          ) : null}
          <div>
            <div
              style={{
                fontSize: size === "lg" ? 26 : 22,
                fontWeight: 650,
                letterSpacing: "-0.02em",
                color: node.accent ? CB.copperDeep : undefined,
                whiteSpace: "nowrap",
              }}
            >
              {node.label}
            </div>
            {node.sub ? (
              <div style={{ marginTop: 6, fontSize: 14, fontWeight: 500, color: CB.muted, maxWidth: 220 }}>
                {node.sub}
              </div>
            ) : null}
          </div>
        </li>
      </React.Fragment>
    ))}
  </ol>
);

/* ── Timeline: a horizontal rail with staggered stops ────────────────────── */

export const Timeline: React.FC<{
  stops: readonly { label: string; sub?: string }[];
}> = ({ stops }) => (
  <div style={{ position: "relative", paddingTop: 6 }}>
    <div
      aria-hidden="true"
      style={{ position: "absolute", left: 0, right: 0, top: 15, height: 1, background: CB.lineStrong }}
    />
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      {stops.map((stop, index) => (
        <div key={stop.label} style={{ position: "relative", flex: "1 1 0", minWidth: 0, textAlign: index === 0 ? "start" : index === stops.length - 1 ? "end" : "center" }}>
          <span
            aria-hidden="true"
            style={{
              display: "inline-block",
              width: 9,
              height: 9,
              borderRadius: "50%",
              background: index === stops.length - 1 ? CB.copperDeep : CB.ink,
              marginBottom: 22,
            }}
          />
          <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", color: CB.ink }}>{stop.label}</div>
          {stop.sub ? (
            <div style={{ marginTop: 6, fontSize: 14, color: CB.muted, lineHeight: 1.35 }}>{stop.sub}</div>
          ) : null}
        </div>
      ))}
    </div>
  </div>
);

/* ── RadialHub: a center label/photo with signals radiating on thin lines ── */

type Spoke = { label: string; hint?: string; angle: number; radius?: number; icon?: LucideIcon };

const AnimatedSpokeLine: React.FC<{
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  maxOpacity: number;
  at: number;
  progress: MotionValue<number>;
}> = ({ x1, y1, x2, y2, stroke, maxOpacity, at, progress }) => {
  const strokeOpacity = useTransform(progress, [at - 0.08, at], [0, maxOpacity]);
  return (
    <motion.line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={stroke}
      style={{ strokeOpacity }}
      strokeWidth={0.25}
      vectorEffect="non-scaling-stroke"
    />
  );
};

const SpokeLabel: React.FC<{
  x: number;
  y: number;
  align: "start" | "center" | "end";
  color: string;
  at?: number;
  progress?: MotionValue<number>;
  icon?: LucideIcon;
  hint?: string;
  children: React.ReactNode;
}> = ({ x, y, align, color, at, progress, icon: Icon, hint, children }) => {
  const fallback = useMotionValue(1);
  const source = progress ?? fallback;
  const driven = at !== undefined && Boolean(progress);
  const opacity = useTransform(source, driven ? [at! - 0.08, at!] : [0, 1], driven ? [0, 1] : [1, 1]);
  return (
    <motion.div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(${align === "center" ? "-50%" : align === "end" ? "-100%" : "0"}, -50%)`,
        maxWidth: 260,
        textAlign: align,
        opacity,
      }}
    >
      <span
        style={{
          display: "inline-flex",
          flexDirection: align === "end" ? "row-reverse" : "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {Icon ? (
          <span
            aria-hidden="true"
            style={{
              width: 46,
              height: 46,
              borderRadius: "50%",
              display: "inline-grid",
              placeItems: "center",
              flexShrink: 0,
              border: "1px solid rgba(198,162,99,0.72)",
              background: "radial-gradient(circle at 32% 28%, rgba(255,232,176,0.28), rgba(198,162,99,0.16) 46%, rgba(12,10,8,0.82) 100%)",
              color: "#F0D089",
              boxShadow: "0 0 0 5px rgba(198,162,99,0.10), 0 0 28px rgba(198,162,99,0.28)",
            }}
          >
            <Icon size={22} strokeWidth={1.8} />
          </span>
        ) : null}
        <span style={{ display: "block", minWidth: 0 }}>
          <span
            style={{
              display: "block",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color,
              lineHeight: 1.15,
            }}
          >
            {children}
          </span>
          {hint ? (
            <span
              style={{
                display: "block",
                marginTop: 4,
                fontSize: 13,
                fontWeight: 500,
                lineHeight: 1.3,
                color: "rgba(234,227,216,0.58)",
              }}
            >
              {hint}
            </span>
          ) : null}
        </span>
      </span>
    </motion.div>
  );
};

export const RadialHub: React.FC<{
  center: React.ReactNode;
  spokes: readonly Spoke[];
  height?: number;
  dark?: boolean;
  /** When supplied with `progress`, each spoke ignites in turn as the value advances 0→1. */
  progress?: MotionValue<number>;
  revealStart?: number;
  revealEnd?: number;
}> = ({ center, spokes, height = 420, dark = false, progress, revealStart = 0.15, revealEnd = 0.92 }) => {
  const cx = 50;
  const cy = 50;
  const lineColor = dark ? "#C6A263" : CB.copper;
  const textColor = dark ? "rgba(234,227,216,0.92)" : CB.ink;
  const step = spokes.length > 1 ? (revealEnd - revealStart) / (spokes.length - 1) : 0;
  return (
    <div style={{ position: "relative", width: "100%", height, minHeight: 0 }}>
      <svg
        aria-hidden="true"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
      >
        {spokes.map((s, i) => {
          const r = s.radius ?? 40;
          const rad = (s.angle * Math.PI) / 180;
          const x = cx + r * Math.cos(rad);
          const y = cy + r * Math.sin(rad) * 0.62;
          const maxOpacity = dark ? 0.4 : 0.32;
          if (progress) {
            return (
              <AnimatedSpokeLine
                key={i}
                x1={cx}
                y1={cy}
                x2={x}
                y2={y}
                stroke={lineColor}
                maxOpacity={maxOpacity}
                at={revealStart + i * step}
                progress={progress}
              />
            );
          }
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke={lineColor}
              strokeOpacity={maxOpacity}
              strokeWidth={0.25}
              vectorEffect="non-scaling-stroke"
            />
          );
        })}
      </svg>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          textAlign: "center",
          zIndex: 1,
        }}
      >
        {center}
      </div>
      {spokes.map((s, i) => {
        const r = s.radius ?? 40;
        const rad = (s.angle * Math.PI) / 180;
        const x = cx + r * Math.cos(rad);
        const y = cy + r * Math.sin(rad) * 0.62;
        const alignEnd = Math.cos(rad) < -0.2;
        const alignCenter = Math.abs(Math.cos(rad)) <= 0.2;
        const align = alignCenter ? "center" : alignEnd ? "end" : "start";
        return (
          <SpokeLabel
            key={s.label}
            x={x}
            y={y}
            align={align}
            color={textColor}
            at={progress ? revealStart + i * step : undefined}
            progress={progress}
            icon={s.icon}
            hint={s.hint}
          >
            {s.label}
          </SpokeLabel>
        );
      })}
    </div>
  );
};

/* ── Territories: separated zones with a bridging connector ─────────────── */

export const Territories: React.FC<{
  zones: readonly { label: string; members: string }[];
  bridgeLabel: string;
}> = ({ zones, bridgeLabel }) => (
  <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, justifyContent: "center", gap: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${zones.length}, minmax(0, 1fr))`, gap: 30 }}>
      {zones.map((zone) => (
        <div
          key={zone.label}
          style={{
            border: `1px solid ${CB.lineStrong}`,
            padding: "30px 30px 34px",
            minHeight: 230,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              margin: 0,
              color: CB.copperDeep,
              fontSize: 15,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {zone.label}
          </p>
          <p dir="ltr" style={{ margin: "22px 0 0", color: CB.ink, fontSize: 27, fontWeight: 500, lineHeight: 1.35 }}>
            {zone.members}
          </p>
        </div>
      ))}
    </div>
    <div style={{ position: "relative", marginTop: 34, paddingTop: 26 }}>
      <div aria-hidden="true" style={{ position: "absolute", left: 0, right: 0, top: 0, height: 1, background: CB.copperDeep, opacity: 0.4 }} />
      <p style={{ margin: 0, color: CB.copperDeep, fontSize: 30, fontWeight: 600, letterSpacing: "-0.02em" }}>
        {bridgeLabel}
      </p>
    </div>
  </div>
);

/* ── StreamMerge: two input columns feeding one output ───────────────────── */

export const StreamMerge: React.FC<{
  left: { label: string; rows: readonly string[] };
  right: { label: string; rows: readonly string[] };
  output: string;
}> = ({ left, right, output }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 0, flex: 1, minHeight: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, flex: 1, minHeight: 0 }}>
      {[left, right].map((col, colIndex) => (
        <div key={col.label} style={{ minWidth: 0 }}>
          <p
            style={{
              margin: 0,
              paddingBottom: 12,
              borderBottom: `1px solid ${colIndex === 1 ? CB.copperDeep : CB.lineStrong}`,
              color: colIndex === 1 ? CB.copperDeep : CB.muted,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            {col.label}
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {col.rows.map((row) => (
              <li
                key={row}
                dir="ltr"
                style={{
                  padding: "12px 0",
                  borderBottom: `1px solid ${CB.line}`,
                  color: colIndex === 1 ? CB.ink : CB.muted,
                  fontWeight: colIndex === 1 ? 600 : 500,
                  fontSize: 20,
                }}
              >
                {row}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
    <div style={{ display: "flex", justifyContent: "center", padding: "14px 0" }}>
      <span aria-hidden="true" style={{ color: CB.faint, fontSize: 26 }}>
        ↓
      </span>
    </div>
    <div style={{ border: `1px solid ${CB.copperDeep}`, background: CB.copperSoft, padding: "18px 26px", textAlign: "center" }}>
      <span style={{ fontSize: 24, fontWeight: 600, color: CB.copperDeep, letterSpacing: "-0.02em" }}>{output}</span>
    </div>
  </div>
);

/* ── LayerStack: value layers growing from one base node ─────────────────── */

export const LayerStack: React.FC<{
  base: string;
  layers: readonly { title: string; note: string }[];
}> = ({ base, layers }) => (
  <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
    <ol style={{ margin: 0, padding: 0, listStyle: "none", flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", gap: 0 }}>
      {layers.map((layer, index) => (
        <li
          key={layer.title}
          style={{
            display: "grid",
            gridTemplateColumns: "320px 1fr",
            gap: 32,
            alignItems: "baseline",
            paddingBlock: 22,
            borderTop: index === 0 ? `1px solid ${CB.lineStrong}` : undefined,
            borderBottom: `1px solid ${CB.lineStrong}`,
            opacity: 1 - index * 0.06,
          }}
        >
          <strong style={{ fontSize: 30, fontWeight: 600, color: index === 0 ? CB.copperDeep : CB.ink }}>{layer.title}</strong>
          <span style={{ color: CB.muted, fontSize: 22 }}>{layer.note}</span>
        </li>
      ))}
    </ol>
    <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
      <span aria-hidden="true" style={{ color: CB.faint, fontSize: 28 }}>
        ↑
      </span>
    </div>
    <div style={{ marginTop: 10, border: `1px solid ${CB.copperDeep}`, padding: "20px 28px", textAlign: "center" }}>
      <span style={{ fontSize: 26, fontWeight: 600, color: CB.copperDeep }}>{base}</span>
    </div>
  </div>
);

/* ── LeakBowl: a simple bowl silhouette with radiating leak callouts ─────── */

export const LeakDiagram: React.FC<{
  equation: { left: string; right: string };
  leaks: readonly string[];
}> = ({ equation, leaks }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30, flex: 1, justifyContent: "center", minHeight: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
      <span style={{ fontSize: 30, fontWeight: 600, color: CB.ink }}>{equation.left}</span>
      <span aria-hidden="true" style={{ fontSize: 26, color: CB.faint }}>
        →
      </span>
      <span style={{ fontSize: 30, fontWeight: 600, color: CB.copperDeep }}>{equation.right}</span>
    </div>
    <span aria-hidden="true" style={{ width: 1, height: 36, background: CB.lineStrong }} />
    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 12, maxWidth: 720 }}>
      {leaks.map((leak) => (
        <span
          key={leak}
          style={{
            padding: "8px 16px",
            border: `1px solid ${CB.lineStrong}`,
            color: CB.muted,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {leak}
        </span>
      ))}
    </div>
  </div>
);

/* ── ConvergingFlows: N labeled magnitudes converging on a center node ───── */

export const ConvergingFlows: React.FC<{
  flows: readonly { value: string; label: string }[];
  center: string;
}> = ({ flows, center }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, flex: 1, minHeight: 0 }}>
    <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
      {flows.map((flow) => (
        <div key={flow.label} style={{ textAlign: "end" }}>
          <div dir="ltr" style={{ fontSize: 68, fontWeight: 600, letterSpacing: "-0.04em", color: CB.ink }}>
            {flow.value}
          </div>
          <div style={{ marginTop: 8, fontSize: 17, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: CB.muted }}>
            {flow.label}
          </div>
        </div>
      ))}
    </div>
    <svg width="200" height="290" viewBox="0 0 200 290" aria-hidden="true" style={{ flexShrink: 0 }}>
      {flows.map((_, i) => {
        const y = 48 + i * ((290 - 96) / Math.max(1, flows.length - 1 || 1));
        return (
          <line key={i} x1="0" y1={flows.length === 1 ? 145 : y} x2="200" y2="145" stroke={CB.copper} strokeOpacity={0.4} strokeWidth={2} />
        );
      })}
    </svg>
    <div style={{ border: `1px solid ${CB.copperDeep}`, background: CB.copperSoft, padding: "32px 42px", textAlign: "center" }}>
      <span style={{ fontSize: 30, fontWeight: 600, color: CB.copperDeep, whiteSpace: "nowrap" }}>{center}</span>
    </div>
  </div>
);

/* ── Horizon: a quiet rising line for the optionality slide ─────────────── */

export const Horizon: React.FC<{ from: string; to: string }> = ({ from, to }) => (
  <div style={{ position: "relative", flex: 1, minHeight: 160 }}>
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }} aria-hidden="true">
      <line x1="0" y1="34" x2="100" y2="6" stroke={CB.lineStrong} strokeWidth={0.6} />
      <circle cx="0" cy="34" r="1" fill={CB.ink} />
      <circle cx="100" cy="6" r="1" fill={CB.copperDeep} />
    </svg>
    <div style={{ position: "absolute", left: 0, bottom: 0, fontSize: 15, fontWeight: 600, color: CB.muted }}>{from}</div>
    <div style={{ position: "absolute", right: 0, top: 0, fontSize: 15, fontWeight: 600, color: CB.copperDeep }}>{to}</div>
  </div>
);
