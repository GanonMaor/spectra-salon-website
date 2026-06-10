import React from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Bot, Boxes, MessageSquare, Truck, Users } from "lucide-react";
import { DUR, EASE_OUT } from "../../SpectraInvestorExperience/visuals/demo/motion";
import { CinematicSlide, SlideHeading } from "./CinematicSlide";
import { SLIDE_THEME, INK } from "../theme";
import { LAYER2 } from "../copy";

// ── Light-card ink (dark text on cream) ──────────────────────────────────────
const L = {
  strong: "#0F0B09",
  soft:   "rgba(15,11,9,0.72)",
  faint:  "rgba(15,11,9,0.44)",
} as const;

/** Cream surface for data rows inside the light body */
const lightRow = (tone: "light" | "warm" | "dark" = "light"): React.CSSProperties => ({
  background:
    tone === "dark"
      ? "linear-gradient(135deg, rgba(20,14,9,0.76), rgba(48,35,22,0.62))"
      : tone === "warm"
        ? "linear-gradient(135deg, rgba(217,185,129,0.18), rgba(255,255,255,0.30))"
        : "linear-gradient(135deg, rgba(255,255,255,0.30), rgba(255,249,241,0.18))",
  border: tone === "dark" ? "1px solid rgba(255,255,255,0.15)" : "1px solid rgba(255,255,255,0.18)",
  boxShadow: tone === "dark" ? "inset 0 1px 0 rgba(255,255,255,0.11)" : "inset 0 1px 0 rgba(255,255,255,0.34)",
});

const rowText = (tone: "light" | "warm" | "dark" = "light") => ({
  strong: tone === "dark" ? INK.strong : L.strong,
  soft: tone === "dark" ? INK.soft : L.soft,
  faint: tone === "dark" ? INK.faint : L.faint,
});

// ── Card catalog ──────────────────────────────────────────────────────────────

const CARD_IDS = ["floor", "revenue", "messages", "inventory", "decisions"] as const;
type CardId = (typeof CARD_IDS)[number];

const CARD_META: Record<CardId, { label: string; accent: string; accentBorder: string; glow: string }> = {
  floor:     { label: "Floor",     accent: "#E0996A", accentBorder: "rgba(224,153,106,0.48)", glow: "rgba(224,153,106,0.26)" },
  revenue:   { label: "Revenue",   accent: "#A6C0A0", accentBorder: "rgba(166,192,160,0.46)", glow: "rgba(166,192,160,0.26)" },
  messages:  { label: "Messages",  accent: "#9CBED0", accentBorder: "rgba(156,190,208,0.46)", glow: "rgba(156,190,208,0.26)" },
  inventory: { label: "Inventory", accent: "#D9B981", accentBorder: "rgba(217,185,129,0.48)", glow: "rgba(217,185,129,0.30)" },
  decisions: { label: "Decisions", accent: "#C6A8CE", accentBorder: "rgba(198,168,206,0.46)", glow: "rgba(198,168,206,0.26)" },
};

// ── Staff photos & profiles ───────────────────────────────────────────────────

const STAFF_PROFILES: Record<string, { photo: string; accent: string; role: string }> = {
  "Olivia Bennett": { photo: "https://randomuser.me/api/portraits/women/44.jpg", accent: "#E0996A", role: "Senior Colorist" },
  "Harper Collins": { photo: "https://randomuser.me/api/portraits/women/68.jpg", accent: "#D9B981", role: "Color Specialist" },
  "Sophia Blake":   { photo: "https://randomuser.me/api/portraits/women/28.jpg", accent: "#9CBED0", role: "Master Colorist" },
  "Ethan Parker":   { photo: "https://randomuser.me/api/portraits/men/45.jpg",   accent: "#C6A8CE", role: "Junior Stylist"  },
};

// ── Floor data ────────────────────────────────────────────────────────────────

const FLOOR_ROWS = [
  { stylist: "Olivia Bennett", client: "Madison Reed",   service: "Signature Blonde Transformation", stage: "Toner",       stageColor: "#D9B981", elapsed: "2h 14m", eta: "11 min",   progress: 0.88, risk: false },
  { stylist: "Harper Collins", client: "Ava Monroe",     service: "Gloss + Full Cut",                stage: "Styling",     stageColor: "#A6C0A0", elapsed: "42 min", eta: "Checkout", progress: 0.94, risk: false },
  { stylist: "Sophia Blake",   client: "Emily Carter",   service: "Color Correction",                stage: "Processing",  stageColor: "#E0996A", elapsed: "1h 38m", eta: "+19 min",  progress: 0.52, risk: true  },
  { stylist: "Ethan Parker",   client: "Noah Brooks",    service: "Balayage + Toner",                stage: "Application", stageColor: "#9CBED0", elapsed: "28 min", eta: "1h 42m",   progress: 0.20, risk: false },
];

// ── Revenue chart data ────────────────────────────────────────────────────────

const WEEKLY_REVENUE = [
  { day: "Mon", v: 36200 },
  { day: "Tue", v: 41500 },
  { day: "Wed", v: 38800 },
  { day: "Thu", v: 44200 },
  { day: "Fri", v: 47100 },
  { day: "Sat", v: 52400 },
  { day: "Now", v: 48920 },
];

const REVENUE_STATS = [
  { value: "6",    label: "Open Slots" },
  { value: "14",   label: "High-LTV Clients" },
  { value: "$420", label: "Avg Ticket" },
  { value: "63%",  label: "Est. Conversion" },
];

// ── Chat / messaging data ─────────────────────────────────────────────────────

interface ChatMsg { from: "ai" | "client"; text: string; time: string; }
interface ChatThread {
  client: string;
  photo: string;
  platform: "whatsapp" | "sms" | "email";
  platformColor: string;
  platformLabel: string;
  messages: ChatMsg[];
  statusLabel: string;
  statusColor: string;
}

const CHAT_THREADS: ChatThread[] = [
  {
    client: "Madison Reed",
    photo: "https://randomuser.me/api/portraits/women/31.jpg",
    platform: "whatsapp",
    platformColor: "#25D366",
    platformLabel: "WhatsApp",
    messages: [
      { from: "ai",     text: "Hi Madison 👋 Olivia is finishing toner now. You're on track for checkout at 2:35 PM.",         time: "2:14 PM" },
      { from: "client", text: "Perfect, see you soon! 😊",                                                                    time: "2:16 PM" },
    ],
    statusLabel: "Replied",
    statusColor: "#A6C0A0",
  },
  {
    client: "Ava Monroe",
    photo: "https://randomuser.me/api/portraits/women/55.jpg",
    platform: "sms",
    platformColor: "#4A90D9",
    platformLabel: "SMS",
    messages: [
      { from: "ai",     text: "Hi Ava, a premium color slot just opened tomorrow at 11:30 AM with Harper. Want me to hold it?", time: "1:58 PM" },
    ],
    statusLabel: "Confirmed",
    statusColor: "#9CBED0",
  },
  {
    client: "Chloe Anderson",
    photo: "https://randomuser.me/api/portraits/women/62.jpg",
    platform: "whatsapp",
    platformColor: "#25D366",
    platformLabel: "WhatsApp",
    messages: [
      { from: "ai",     text: "Hi Chloe, your stylist recommended a gloss refresh. I'm holding Thursday at 4:00 PM. Reply YES to confirm.", time: "1:41 PM" },
      { from: "client", text: "YES! 🙌",                                                                                                    time: "1:43 PM" },
    ],
    statusLabel: "Rebooked",
    statusColor: "#D9B981",
  },
];

// ── Inventory data ────────────────────────────────────────────────────────────

const INVENTORY_ITEMS = [
  { name: "Wella Color Touch 7/0",       remaining: "2.1 days",     risk: "critical" as const, pct: 0.14, color: "#E07060", spark: [82, 68, 55, 44, 32, 20, 14] },
  { name: "Redken Shades EQ 09V",        remaining: "Stockout Fri", risk: "critical" as const, pct: 0.08, color: "#E07060", spark: [72, 62, 50, 35, 24, 14, 8]  },
  { name: "Olaplex No.2 Bond Perfector", remaining: "Usage +31%",   risk: "watch"    as const, pct: 0.41, color: "#D9B981", spark: [60, 62, 68, 72, 76, 80, 85] },
  { name: "L'Oréal Smartbond Step 2",    remaining: "4.0 days",     risk: "ok"       as const, pct: 0.52, color: "#A6C0A0", spark: [75, 72, 70, 66, 62, 58, 52] },
];

// ── Decisions data ────────────────────────────────────────────────────────────

const DECISIONS = [
  { id: "reorder",  title: "Approve Supplier Reorder",   detail: "4 critical items · SalonCentric · Thursday delivery", impact: "Prevents $3,240 revenue loss",    impactColor: "#A6C0A0", accent: "#D9B981" },
  { id: "staff",    title: "Move Madison to Color Bar",  detail: "3 color clients waiting — assistant capacity is free",  impact: "Saves 42 min of chair time today", impactColor: "#9CBED0", accent: "#9CBED0" },
  { id: "campaign", title: "Send Win-Back Campaign",     detail: "8 clients at churn risk · last visit 8+ weeks ago",    impact: "+$12,600 projected monthly lift",  impactColor: "#C6A8CE", accent: "#C6A8CE" },
];

// ── Live ticker ───────────────────────────────────────────────────────────────

const TICKER_EVENTS = [
  "Madison Reed notified — on track for 2:35 PM checkout",
  "SalonCentric order drafted — $6,780 · Thursday delivery",
  "Noah Brooks moved to Chair 4 — 38-min wait eliminated",
  "Chloe Anderson rebooked for Thursday 4:00 PM via WhatsApp",
  "Ava Monroe confirmed tomorrow's slot with Harper",
  "Win-back campaign drafted · 8 at-risk clients identified",
  "Redken Shades EQ low — reorder triggered automatically",
  "6 premium color slots matched to 14 high-LTV clients",
];

const layerCapabilities = [
  { label: "Messages & pushes", detail: "Client updates, confirmations, win-back nudges", Icon: MessageSquare },
  { label: "Staff orchestration", detail: "Chair flow, delays, handoffs, assistant timing", Icon: Users },
  { label: "Supplier comms", detail: "Orders, delivery windows, approval workflows", Icon: Truck },
  { label: "Inventory control", detail: "Usage velocity, stockout risk, smart reorder", Icon: Boxes },
  { label: "AI business agents", detail: "Campaigns, revenue recovery, next-best actions", Icon: Bot },
];

// ── SVG: Area chart (Revenue card) ───────────────────────────────────────────

const RevenueAreaChart: React.FC<{ accent: string }> = ({ accent }) => {
  const W = 480; const H = 100;
  const data = WEEKLY_REVENUE;
  const values = data.map((d) => d.v);
  const min = Math.min(...values) * 0.9;
  const max = Math.max(...values) * 1.04;
  const range = max - min;
  const padL = 8; const padR = 8; const padT = 10; const padB = 20;
  const iW = W - padL - padR; const iH = H - padT - padB;

  const toX = (i: number) => padL + (i / (data.length - 1)) * iW;
  const toY = (v: number) => padT + iH - ((v - min) / range) * iH;

  const pts = data.map((d, i) => ({ x: toX(i), y: toY(d.v), ...d }));
  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L${pts[pts.length - 1].x.toFixed(1)},${(H - padB).toFixed(1)} L${pts[0].x.toFixed(1)},${(H - padB).toFixed(1)} Z`;
  const last = pts[pts.length - 1];
  const gradId = "rev-area";
  const glowId = "rev-glow";

  return (
    <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={accent} stopOpacity={0.45} />
          <stop offset="88%"  stopColor={accent} stopOpacity={0.02} />
        </linearGradient>
        <filter id={glowId} x="-20%" y="-60%" width="140%" height="220%">
          <feGaussianBlur stdDeviation="2.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Horizontal grid */}
      {[0.33, 0.66].map((f, i) => (
        <line key={i} x1={padL} y1={padT + iH * f} x2={W - padR} y2={padT + iH * f}
          stroke="rgba(255,255,255,0.10)" strokeWidth={1} />
      ))}

      {/* Vertical column markers */}
      {pts.map((p, i) => (
        <line key={i} x1={p.x} y1={padT} x2={p.x} y2={H - padB}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1} />
      ))}

      {/* Area fill */}
      <path d={areaPath} fill={`url(#${gradId})`} />

      {/* Glowing line */}
      <path d={linePath} fill="none" stroke={accent} strokeWidth={2.2} filter={`url(#${glowId})`} />

      {/* Data dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={i === pts.length - 1 ? 4.5 : 2.5}
          fill={accent} opacity={i === pts.length - 1 ? 1 : 0.65} />
      ))}

      {/* Live pulse on last point */}
      <circle cx={last.x} cy={last.y} r={9} fill="none" stroke={accent} strokeWidth={1.2} opacity={0.3}>
        <animate attributeName="r" values="5;13;5" dur="2.4s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.4;0;0.4" dur="2.4s" repeatCount="indefinite" />
      </circle>

      {/* Day labels */}
      {pts.map((p, i) => {
        const isLast = i === pts.length - 1;
        return (
          <text key={i} x={p.x} y={H - 4} textAnchor="middle"
            fill={isLast ? accent : "rgba(251,246,239,0.38)"}
            fontSize={9} fontWeight={isLast ? "700" : "400"} letterSpacing="0.06em">
            {isLast ? "TODAY" : p.day}
          </text>
        );
      })}
    </svg>
  );
};

// ── SVG: Mini sparkline (Inventory) ──────────────────────────────────────────

const MiniSpark: React.FC<{ data: number[]; color: string; uid: string }> = ({ data, color, uid }) => {
  const W = 64; const H = 26;
  const min = Math.min(...data); const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => ({
    x: (i / (data.length - 1)) * W,
    y: H - ((v - min) / range) * H * 0.82 - H * 0.06,
  }));
  const line = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const area = `${line} L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1];
  return (
    <svg width={W} height={H} style={{ overflow: "visible", flexShrink: 0 }}>
      <defs>
        <linearGradient id={`sg-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity={0.38} />
          <stop offset="100%" stopColor={color} stopOpacity={0}    />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg-${uid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={1.6}
        style={{ filter: `drop-shadow(0 0 3px ${color})` }} />
      <circle cx={last.x} cy={last.y} r={3} fill={color}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
    </svg>
  );
};

// ── Staff avatar ──────────────────────────────────────────────────────────────

const StaffAvatar: React.FC<{ name: string; size?: number }> = ({ name, size = 38 }) => {
  const [err, setErr] = React.useState(false);
  const profile = STAFF_PROFILES[name];
  const accent = profile?.accent ?? "#E0996A";
  const initials = name.split(" ").map((n) => n[0]).join("");
  return (
    <div
      className="relative flex-shrink-0 rounded-full overflow-hidden"
      style={{
        width: size, height: size,
        boxShadow: `0 0 0 2px ${accent}55, 0 0 12px ${accent}44`,
        background: `radial-gradient(circle at 35% 32%, ${accent}cc, ${accent}66)`,
      }}
    >
      {!err && profile ? (
        <img
          src={profile.photo}
          alt={name}
          className="w-full h-full object-cover rounded-full"
          onError={() => setErr(true)}
        />
      ) : (
        <span
          className="flex items-center justify-center w-full h-full font-semibold"
          style={{ color: "#fff", fontSize: size * 0.34 }}
        >
          {initials}
        </span>
      )}
      {/* Live green dot */}
      <div
        className="absolute rounded-full"
        style={{
          width: size * 0.26, height: size * 0.26,
          bottom: 0, right: 0,
          background: "#A6C0A0",
          boxShadow: "0 0 6px #A6C0A0",
          border: "2px solid rgba(8,5,3,0.9)",
        }}
      />
    </div>
  );
};

// ── Shared primitives ─────────────────────────────────────────────────────────

const PulseDot: React.FC<{ color: string; size?: number }> = ({ color, size = 8 }) => (
  <span className="relative inline-flex items-center justify-center flex-shrink-0" style={{ width: size, height: size }}>
    <span className="absolute inline-flex rounded-full animate-ping" style={{ width: size, height: size, background: color, opacity: 0.5 }} />
    <span className="relative inline-flex rounded-full" style={{ width: size * 0.58, height: size * 0.58, background: color }} />
  </span>
);

const StatusChip: React.FC<{ label: string; color: string }> = ({ label, color }) => (
  <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-[0.12em] px-2 py-0.5 rounded-full flex-shrink-0"
    style={{ background: `${color}22`, color, border: `1px solid ${color}44` }}>
    {label}
  </span>
);

const MetricTile: React.FC<{ value: string; label: string; color: string; tone?: "light" | "warm" | "dark" }> = ({ value, label, color, tone = "light" }) => (
  <div className="rounded-xl px-4 py-2.5" style={lightRow(tone)}>
    <div className="text-lg font-light leading-none" style={{ color: tone === "dark" ? INK.strong : color }}>{value}</div>
    <div className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em]" style={{ color: rowText(tone).faint }}>{label}</div>
  </div>
);

const InsightStrip: React.FC<{ accent: string; label: string; children: React.ReactNode }> = ({ accent, label, children }) => (
  <div className="rounded-2xl px-5 py-3.5" style={{ background: `${accent}12`, border: `1px solid ${accent}30` }}>
    <div className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1.5" style={{ color: accent }}>{label}</div>
    <div className="text-sm font-light leading-relaxed" style={{ color: L.soft }}>{children}</div>
  </div>
);

const ApproveBtn: React.FC<{ label: string; accent: string }> = ({ label, accent }) => (
  <button
    className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-1.5 rounded-full"
    style={{ background: `linear-gradient(135deg, ${accent}44 0%, ${accent}28 100%)`, color: accent, border: `1px solid ${accent}60`, cursor: "default" }}
  >
    {label} <span style={{ fontSize: 10, opacity: 0.7 }}>→</span>
  </button>
);

// ── Card frame shell ──────────────────────────────────────────────────────────

/**
 * Open command surface: the dashboard floats as a translucent intelligence field,
 * without a hard black/white split.
 */
const CardFrame: React.FC<{ id: CardId; children: React.ReactNode }> = ({ id, children }) => {
  const { accentBorder, accent } = CARD_META[id];
  return (
    <div
      style={{
        height: "clamp(430px, 54vh, 540px)",
        borderRadius: 24,
        border: `1px solid ${accentBorder}`,
        background: `radial-gradient(circle at 58% 34%, ${accent}30, transparent 44%), linear-gradient(180deg, rgba(12,8,5,0.78), rgba(12,8,5,0.56) 48%, rgba(35,24,15,0.50))`,
        backdropFilter: "blur(30px) saturate(155%)",
        WebkitBackdropFilter: "blur(30px) saturate(155%)",
        boxShadow: "0 34px 92px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.13)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 18,
          borderRadius: 20,
          border: `1px solid ${accent}34`,
          pointerEvents: "none",
        }}
      />
      {/* ── Content above both layers */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", flexDirection: "column", height: "100%" }}>
        {children}
      </div>
    </div>
  );
};

const CardHeader: React.FC<{ id: CardId; right?: React.ReactNode }> = ({ id, right }) => {
  const { accent, label } = CARD_META[id];
  return (
    <div className="flex items-center justify-between px-6 pt-5 pb-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
      <div className="flex items-center gap-2.5">
        <PulseDot color={accent} size={9} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.26em]" style={{ color: accent }}>{label} Command</span>
      </div>
      {right}
    </div>
  );
};

// ── 1. Floor Card ─────────────────────────────────────────────────────────────

const FloorCard: React.FC = () => {
  const { accent } = CARD_META.floor;
  const priorities = [
    { label: "Color bar capacity", value: "2 chairs free in 18 min", action: "Move Noah to Chair 4", status: "Ready" },
    { label: "Delay risk", value: "Sophia is +19 min on correction", action: "Notify next client", status: "Auto-drafted" },
    { label: "Checkout window", value: "Ava is ready for retail attach", action: "Prompt front desk", status: "Live" },
  ];

  return (
    <CardFrame id="floor">
      <CardHeader id="floor" right={<StatusChip label="Live" color={accent} />} />

      <div className="flex items-end justify-between gap-6 px-6 pt-4 pb-3 flex-shrink-0">
        <div>
          <div className="text-[clamp(2.3rem,4.4vw,3.2rem)] font-light leading-none tracking-tight" style={{ color: "#FBF6EF" }}>$48,920</div>
          <div className="text-sm font-light mt-1" style={{ color: "rgba(251,246,239,0.56)" }}>booked today · 14 appointments · 4 live services</div>
        </div>
        <div className="flex gap-6 items-end mb-1">
          <div className="text-center">
            <div className="text-2xl font-light leading-none" style={{ color: accent }}>92%</div>
            <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(251,246,239,0.46)" }}>utilization</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-light leading-none" style={{ color: accent }}>18m</div>
            <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(251,246,239,0.46)" }}>next opening</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 px-4 pb-3 flex-shrink-0">
        <MetricTile value="3" label="needs attention" color={accent} tone="dark" />
        <MetricTile value="$1.8K" label="at-risk value" color={accent} tone="warm" />
        <MetricTile value="0" label="manual checks" color={accent} />
      </div>

      <div className="mx-4 mb-3 flex-1 min-h-0 rounded-2xl overflow-hidden" style={lightRow("warm")}>
        <div className="grid grid-cols-[1fr_1.1fr_0.62fr] gap-4 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: L.faint, borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
          <span>Signal</span>
          <span>Recommended move</span>
          <span className="text-right">Status</span>
        </div>
        {priorities.map((item, i) => (
          <div key={item.label} className="grid grid-cols-[1fr_1.1fr_0.62fr] gap-4 px-5 py-3 items-center"
            style={{ borderBottom: i < priorities.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
            <div>
              <div className="text-sm font-semibold" style={{ color: L.strong }}>{item.label}</div>
              <div className="text-[11px] font-light mt-0.5" style={{ color: L.faint }}>{item.value}</div>
            </div>
            <div className="text-sm font-light" style={{ color: L.soft }}>{item.action}</div>
            <div className="text-right">
              <span className="inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em]"
                style={{ background: `${accent}16`, color: accent, border: `1px solid ${accent}34` }}>
                {item.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-4 flex-shrink-0">
        <InsightStrip accent={accent} label="Salon AI recommendation">
          Move the waiting balayage client into the opening chair now. Expected impact: <strong style={{ color: accent }}>38 minutes saved</strong> and one premium slot protected.
        </InsightStrip>
      </div>
    </CardFrame>
  );
};

// ── 2. Revenue Card ───────────────────────────────────────────────────────────

const RevenueCard: React.FC = () => {
  const { accent } = CARD_META.revenue;
  const opportunities = [
    { segment: "Premium color fill", clients: "14 clients", value: "$7,920", confidence: "High" },
    { segment: "Gloss refresh", clients: "9 clients", value: "$2,430", confidence: "Medium" },
    { segment: "Saturday waitlist", clients: "6 clients", value: "$3,180", confidence: "High" },
  ];

  return (
    <CardFrame id="revenue">
      <CardHeader id="revenue" right={<span className="text-[10px] font-light uppercase tracking-[0.16em]" style={{ color: INK.faint }}>Week of Jun 10–16</span>} />

      <div className="flex items-end justify-between gap-6 px-6 pt-4 pb-3 flex-shrink-0">
        <div>
          <div className="text-[clamp(2.4rem,4.8vw,3.4rem)] font-light leading-none tracking-tight" style={{ color: "#FBF6EF" }}>$18,400</div>
          <div className="text-sm font-light mt-1" style={{ color: "rgba(251,246,239,0.56)" }}>recoverable this week · ranked by likelihood</div>
        </div>
        <div className="text-right mb-1">
          <div className="text-2xl font-light leading-none" style={{ color: accent }}>72h</div>
          <div className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: "rgba(251,246,239,0.46)" }}>best window</div>
        </div>
      </div>

      <div className="px-4 pb-2 flex-shrink-0">
        <RevenueAreaChart accent={accent} />
      </div>

      <div className="grid grid-cols-4 gap-2 px-4 pb-3 flex-shrink-0">
        {REVENUE_STATS.map((s, i) => (
          <MetricTile
            key={s.label}
            value={s.value}
            label={s.label}
            color={accent}
            tone={i === 1 ? "dark" : i === 3 ? "warm" : "light"}
          />
        ))}
      </div>

      <div className="mx-4 mb-3 flex-1 min-h-0 rounded-2xl overflow-hidden" style={lightRow("dark")}>
        <div className="grid grid-cols-[1fr_0.55fr_0.55fr_0.55fr] gap-3 px-5 py-2.5 text-[9px] font-semibold uppercase tracking-[0.16em]" style={{ color: INK.faint, borderBottom: "1px solid rgba(255,255,255,0.10)" }}>
          <span>Opportunity</span>
          <span>Clients</span>
          <span>Value</span>
          <span className="text-right">Fit</span>
        </div>
        {opportunities.map((item, i) => (
          <div key={item.segment} className="grid grid-cols-[1fr_0.55fr_0.55fr_0.55fr] gap-3 px-5 py-3 items-center"
            style={{ borderBottom: i < opportunities.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <span className="text-sm font-semibold" style={{ color: INK.strong }}>{item.segment}</span>
            <span className="text-xs" style={{ color: INK.soft }}>{item.clients}</span>
            <span className="text-sm font-semibold" style={{ color: accent }}>{item.value}</span>
            <span className="text-right text-xs font-semibold" style={{ color: item.confidence === "High" ? accent : "#D9B981" }}>{item.confidence}</span>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between gap-4 rounded-2xl px-5 py-3.5 flex-shrink-0"
        style={{ background: `${accent}14`, border: `1px solid ${accent}30` }}>
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] mb-1" style={{ color: accent }}>Recommended action</div>
          <div className="text-sm font-light" style={{ color: INK.soft }}>Launch Premium Color Fill to 14 high-LTV clients before the 72-hour window closes.</div>
        </div>
        <ApproveBtn label="Launch" accent={accent} />
      </div>
    </CardFrame>
  );
};

// ── 3. Messages Card ──────────────────────────────────────────────────────────

const PlatformIcon: React.FC<{ platform: ChatThread["platform"]; color: string }> = ({ platform, color }) => {
  if (platform === "whatsapp") {
    return (
      <svg width={14} height={14} viewBox="0 0 24 24" fill={color}>
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    );
  }
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill={color}>
      <path d="M2 2h20v16H2V2zm2 2v12h16V4H4zm7 2a5 5 0 110 6 5 5 0 010-6zm0 2a3 3 0 100 2 3 3 0 000-2zm7 8H6l3-3 2 2 3-3z" />
    </svg>
  );
};

const MessagesCard: React.FC = () => {
  const { accent } = CARD_META.messages;
  return (
    <CardFrame id="messages">
      <CardHeader id="messages" right={<StatusChip label="3 sent today" color={accent} />} />

      <div className="px-6 pt-3 pb-2 flex-shrink-0">
        <div className="text-lg sm:text-xl font-light leading-snug" style={{ color: "#FBF6EF" }}>
          The system talks before the front desk has to.
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="text-xs font-light" style={{ color: "rgba(251,246,239,0.50)" }}>0 manual actions</span>
          {[{ label: "WhatsApp", color: "#25D366" }, { label: "SMS", color: "#4A90D9" }].map((p) => (
            <span key={p.label} className="flex items-center gap-1 text-[10px] font-medium" style={{ color: p.color }}>
              <PlatformIcon platform={p.label === "WhatsApp" ? "whatsapp" : "sms"} color={p.color} />
              {p.label}
            </span>
          ))}
        </div>
      </div>

      {/* Chat threads — cream body */}
      <div className="flex flex-col gap-2 px-4 flex-1 min-h-0 overflow-hidden pb-1">
        {CHAT_THREADS.map((thread) => (
          <div key={thread.client} className="rounded-2xl overflow-hidden flex-shrink-0" style={lightRow(thread.platform === "sms" ? "warm" : "light")}>
            {/* Thread header */}
            <div className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="relative flex-shrink-0">
                <img src={thread.photo} alt={thread.client} className="w-8 h-8 rounded-full object-cover" style={{ boxShadow: `0 0 0 2px ${thread.platformColor}55` }} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold" style={{ color: L.strong }}>{thread.client}</span>
                  <span className="flex items-center gap-1 text-[9px] font-medium" style={{ color: thread.platformColor }}>
                    <PlatformIcon platform={thread.platform} color={thread.platformColor} />
                    {thread.platformLabel}
                  </span>
                </div>
              </div>
              <StatusChip label={thread.statusLabel} color={thread.statusColor} />
            </div>
            {/* Messages */}
            <div className="flex flex-col gap-1.5 px-3 py-2.5">
              {thread.messages.map((msg, mi) => (
                <div key={mi} className={`flex ${msg.from === "ai" ? "justify-start" : "justify-end"}`}>
                  <div
                    className="max-w-[88%] px-3 py-1.5 rounded-2xl"
                    style={{
                      background: msg.from === "ai" ? `${thread.platformColor}14` : "rgba(0,0,0,0.06)",
                      border: `1px solid ${msg.from === "ai" ? `${thread.platformColor}28` : "rgba(0,0,0,0.08)"}`,
                    }}
                  >
                    {msg.from === "ai" && (
                      <div className="text-[9px] font-semibold uppercase tracking-[0.14em] mb-0.5" style={{ color: thread.platformColor }}>
                        Salon AI · {msg.time}
                      </div>
                    )}
                    <p className="text-[12px] font-light leading-relaxed" style={{ color: L.soft }}>{msg.text}</p>
                    {msg.from === "client" && (
                      <div className="text-[9px] text-right mt-0.5" style={{ color: L.faint }}>{msg.time}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 px-6 py-2.5 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <span style={{ fontSize: 13 }}>💬</span>
        <span className="text-[11px] font-light" style={{ color: L.faint }}>All messages drafted, sent, and tracked automatically. Zero manual input.</span>
      </div>
    </CardFrame>
  );
};

// ── 4. Inventory Card ─────────────────────────────────────────────────────────

const InventoryCard: React.FC = () => {
  const { accent } = CARD_META.inventory;
  return (
    <CardFrame id="inventory">
      <CardHeader id="inventory" right={<StatusChip label="Order Drafted" color={accent} />} />

      <div className="flex items-end gap-8 px-6 pt-4 pb-3 flex-shrink-0">
        <div>
          <div className="text-[clamp(2.4rem,4.8vw,3.4rem)] font-light leading-none tracking-tight" style={{ color: "#FBF6EF" }}>$6,780</div>
          <div className="text-sm font-light mt-1" style={{ color: "rgba(251,246,239,0.52)" }}>pending approval · SalonCentric</div>
        </div>
        <div className="mb-1.5 flex flex-col gap-1">
          <div className="text-sm font-light" style={{ color: "rgba(251,246,239,0.72)" }}>Delivery: <strong style={{ color: accent }}>Thursday 10:00 AM</strong></div>
          <div className="text-sm font-light" style={{ color: "rgba(251,246,239,0.72)" }}>Prevents: <strong style={{ color: "#A6C0A0" }}>$3,240 loss</strong></div>
        </div>
      </div>

      {/* Inventory rows — light body */}
      <div className="flex flex-col flex-1 min-h-0 mx-4 mb-3 rounded-2xl overflow-hidden" style={lightRow("warm")}>
        {INVENTORY_ITEMS.map((item, i) => (
          <div key={item.name} className="flex items-center gap-3 px-4 py-3"
            style={{ borderBottom: i < INVENTORY_ITEMS.length - 1 ? "1px solid rgba(0,0,0,0.06)" : "none" }}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm font-medium" style={{ color: L.soft }}>{item.name}</span>
                {item.risk !== "ok" && (
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full"
                    style={{ background: `${item.color}18`, color: item.color }}>
                    {item.risk === "critical" ? "Critical" : "Watch"}
                  </span>
                )}
              </div>
              <div className="rounded-full overflow-hidden" style={{ height: 5, background: "rgba(0,0,0,0.08)" }}>
                <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${item.pct * 100}%` }}
                  transition={{ duration: 1.0, ease: EASE_OUT, delay: 0.15 + i * 0.1 }}
                  style={{ background: item.color }} />
              </div>
            </div>
            <MiniSpark data={item.spark} color={item.color} uid={`inv-${i}`} />
            <span className="text-xs font-semibold flex-shrink-0 tabular-nums w-20 text-right" style={{ color: item.color }}>{item.remaining}</span>
          </div>
        ))}
      </div>

      <div className="mx-4 mb-4 flex items-center justify-between gap-4 px-5 py-3 rounded-2xl flex-shrink-0"
        style={{ background: `${accent}10`, border: `1px solid ${accent}28` }}>
        <div>
          <div className="text-sm font-semibold" style={{ color: L.strong }}>Approve Order → SalonCentric</div>
          <div className="text-xs font-light mt-0.5" style={{ color: L.faint }}>4 items · $6,780 · same-day cutoff 2:00 PM</div>
        </div>
        <ApproveBtn label="Approve" accent={accent} />
      </div>
    </CardFrame>
  );
};

// ── 5. Decisions Card ─────────────────────────────────────────────────────────

const DecisionsCard: React.FC = () => {
  const { accent } = CARD_META.decisions;
  return (
    <CardFrame id="decisions">
      <CardHeader id="decisions" right={<StatusChip label="3 ready now" color={accent} />} />

      <div className="px-6 pt-4 pb-3 flex-shrink-0">
        <div className="text-3xl sm:text-4xl font-light leading-none tracking-tight" style={{ color: "#FBF6EF" }}>3 decisions ready.</div>
        <div className="text-sm font-light mt-1.5" style={{ color: "rgba(251,246,239,0.50)" }}>All prepared by Salon AI. One tap to execute each.</div>
      </div>

      <div className="flex flex-col gap-2.5 px-4 flex-1 min-h-0 overflow-hidden">
        {DECISIONS.map((d) => (
          <div key={d.id} className="flex items-center justify-between gap-4 rounded-2xl px-5 py-4"
            style={{ background: `${d.accent}0e`, border: `1px solid ${d.accent}28` }}>
            <div className="flex-1 min-w-0">
              <div className="text-sm sm:text-base font-semibold mb-0.5" style={{ color: L.strong }}>{d.title}</div>
              <div className="text-xs font-light" style={{ color: L.faint }}>{d.detail}</div>
              <div className="text-xs font-semibold mt-1.5" style={{ color: d.impactColor }}>{d.impact}</div>
            </div>
            <ApproveBtn label="Approve" accent={d.accent} />
          </div>
        ))}
      </div>

      <div className="px-6 py-3 flex-shrink-0" style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}>
        <p className="text-[11px] font-light italic" style={{ color: L.faint }}>
          Every decision was prepared. Not discovered.
        </p>
      </div>
    </CardFrame>
  );
};

// ── Card renderer map ─────────────────────────────────────────────────────────

const CARD_RENDERERS: Record<CardId, React.FC> = {
  floor:     FloorCard,
  revenue:   RevenueCard,
  messages:  MessagesCard,
  inventory: InventoryCard,
  decisions: DecisionsCard,
};

// ── Live ticker ───────────────────────────────────────────────────────────────

const LiveTicker: React.FC<{ accent: string }> = ({ accent }) => {
  const [idx, setIdx] = React.useState(0);
  const reduced = useReducedMotion() ?? false;

  React.useEffect(() => {
    if (reduced) return;
    const t = setInterval(() => setIdx((p) => (p + 1) % TICKER_EVENTS.length), 2600);
    return () => clearInterval(t);
  }, [reduced]);

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-full"
      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
      <PulseDot color={accent} size={6} />
      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] flex-shrink-0" style={{ color: accent }}>Live</span>
      <div className="overflow-hidden flex-1" style={{ height: 16 }}>
        <AnimatePresence mode="wait">
          <motion.span key={idx}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="text-[11px] font-light block" style={{ color: INK.faint }}>
            {TICKER_EVENTS[idx]}
          </motion.span>
        </AnimatePresence>
      </div>
    </div>
  );
};

// ── Nav dots ──────────────────────────────────────────────────────────────────

const NavDots: React.FC<{ active: number; onSelect: (i: number) => void }> = ({ active, onSelect }) => (
  <div className="flex items-center gap-2.5">
    {CARD_IDS.map((id, i) => {
      const { accent, label } = CARD_META[id];
      const isActive = i === active;
      return (
        <button key={id} onClick={() => onSelect(i)}
          className="flex items-center gap-1.5 transition-all" style={{ opacity: isActive ? 1 : 0.35 }}>
          <span className="rounded-full transition-all duration-300"
            style={{ width: isActive ? 20 : 6, height: 6, background: isActive ? accent : "rgba(255,255,255,0.45)", display: "block" }} />
          {isActive && (
            <span className="text-[9px] font-semibold uppercase tracking-[0.18em]" style={{ color: accent }}>{label}</span>
          )}
        </button>
      );
    })}
  </div>
);

// ── Operating Control World ───────────────────────────────────────────────────

const EASE_SPRING: [number, number, number, number] = [0.22, 1, 0.36, 1];
const CYCLE_MS = 4200;

const OperatingControlWorld: React.FC = () => {
  const [activeIdx, setActiveIdx] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const reduced = useReducedMotion() ?? false;
  const cycleRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  React.useEffect(() => {
    if (paused || reduced) {
      if (cycleRef.current) clearInterval(cycleRef.current);
      return;
    }
    cycleRef.current = setInterval(() => setActiveIdx((p) => (p + 1) % CARD_IDS.length), CYCLE_MS);
    return () => { if (cycleRef.current) clearInterval(cycleRef.current); };
  }, [paused, reduced]);

  const activeId = CARD_IDS[activeIdx];
  const ActiveCard = CARD_RENDERERS[activeId];

  return (
    <div className="flex flex-col gap-3"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}>
      <div className="relative w-full">
        <AnimatePresence mode="wait">
          <motion.div key={activeId}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97, filter: "blur(10px)" }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98, filter: "blur(6px)" }}
            transition={{ duration: reduced ? 0.25 : 0.55, ease: EASE_SPRING }}>
            <ActiveCard />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <LiveTicker accent={CARD_META[activeId].accent} />
        </div>
        <NavDots active={activeIdx} onSelect={(i) => { setActiveIdx(i); setPaused(true); }} />
      </div>
    </div>
  );
};

// ── Main Slide ────────────────────────────────────────────────────────────────

export const Layer2OperationsSlide: React.FC = () => {
  const reduced = useReducedMotion() ?? false;
  const theme = SLIDE_THEME["layer-2"];

  return (
    <CinematicSlide
      theme={theme}
      ariaLabel="Layer 2 — Salon Operating System"
      scrim="veil"
      constellation={false}
      darkOverlay
      fit
    >
      <div className="grid h-full w-full grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(360px,0.48fr)_0.52fr] lg:gap-10">

        {/* ── Left: layer title + narrative ─────────────────────────────────── */}
        <div className="max-w-[520px]">
          <SlideHeading theme={theme} eyebrow={LAYER2.eyebrow} size="h1" layer={3} className="mb-6">
            Every decision.<br />Before it happens.
          </SlideHeading>

          <div className="flex flex-col items-start gap-3">
            <motion.span
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.18 }}
              className="text-[10px] font-semibold uppercase tracking-[0.16em] px-3 py-1 rounded-full"
              style={{ background: theme.accentSoft, color: theme.accent, border: `1px solid ${theme.accentBorder}` }}>
              {LAYER2.status}
            </motion.span>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.30 }}
              className="text-lg font-light leading-relaxed"
              style={{ color: INK.soft }}>
              The operating layer turns the salon into one live command center: clients, team, suppliers, inventory, and AI growth agents all moving from the same source of truth.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: reduced ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.42 }}
              className="mt-4 grid w-full grid-cols-1 gap-x-7 gap-y-2 sm:grid-cols-2"
            >
              {layerCapabilities.map(({ label, detail, Icon }, idx) => (
                <div
                  key={label}
                  className={idx === layerCapabilities.length - 1 ? "sm:col-span-2" : ""}
                >
                  <div
                    className="flex items-start gap-3 border-t py-3"
                    style={{
                      borderColor: "rgba(224,153,106,0.28)",
                    }}
                  >
                    <span
                      className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ color: theme.accent, boxShadow: `0 0 22px ${theme.glow}`, border: `1px solid ${theme.accentBorder}` }}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[11px] font-semibold uppercase tracking-[0.14em]" style={{ color: INK.strong }}>
                        {label}
                      </span>
                      <span className="mt-1 block text-xs font-light leading-snug" style={{ color: "rgba(251,246,239,0.70)" }}>
                        {detail}
                      </span>
                    </span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* ── Right: operating system screen ────────────────────────────────── */}
        <motion.div
          className="min-w-0 lg:justify-self-end lg:w-full lg:max-w-[760px]"
          initial={{ opacity: 0, y: reduced ? 0 : 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: DUR.slow, ease: EASE_OUT, delay: reduced ? 0 : 0.12 }}>
          <OperatingControlWorld />
        </motion.div>

      </div>
    </CinematicSlide>
  );
};
