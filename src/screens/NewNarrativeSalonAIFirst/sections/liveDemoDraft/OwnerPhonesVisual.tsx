import React from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const INK = "#18100A";
const SOFT = "rgba(24,16,10,0.58)";
const FAINT = "rgba(24,16,10,0.34)";
const LINE = "rgba(24,16,10,0.08)";
const CREAM = "#FEFCF8";
const PAPER = "#FFFFFF";
const ORANGE = "#D4571A";
const ORANGE_SOFT = "rgba(212,87,26,0.10)";
const GREEN = "#1E8D62";
const GOLD = "#B8891A";
const BLUE = "#3472B8";

const PHONES = [
  { key: "comms", delay: 0.08, screen: <CommsHubScreen /> },
  { key: "inventory", delay: 0.00, screen: <InventoryScreen /> },
  { key: "profit-loss", delay: 0.16, screen: <ProfitLossScreen /> },
] as const;

function IconGrid() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconBell() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
      <path d="M6.5 10.5a5.5 5.5 0 0 1 11 0v3.8l1.4 2.5H5.1l1.4-2.5v-3.8Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10 19a2.2 2.2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function MiniBars({ color = ORANGE }: { color?: string }) {
  const bars = [34, 50, 42, 70, 56, 84, 74];
  return (
    <div style={{ display: "flex", alignItems: "end", gap: 3, height: 42 }}>
      {bars.map((h, i) => (
        <span
          key={i}
          style={{
            width: 7,
            height: `${h}%`,
            borderRadius: 999,
            background: i === bars.length - 1 ? color : `${color}35`,
          }}
        />
      ))}
    </div>
  );
}

function PhoneShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: 30,
        padding: "3.1%",
        background: "linear-gradient(150deg, #39342F 0%, #15110E 48%, #080706 100%)",
        border: "1px solid rgba(255,255,255,0.18)",
        boxShadow:
          "0 34px 82px rgba(0,0,0,0.48), inset 0 1px 0 rgba(255,255,255,0.22), inset 0 0 0 1.5px rgba(0,0,0,0.65)",
      }}
    >
      <div style={{ position: "absolute", left: -1.5, top: "19%", width: 3, height: "5%", borderRadius: "3px 0 0 3px", background: "#27231d" }} />
      <div style={{ position: "absolute", left: -1.5, top: "30%", width: 3, height: "9%", borderRadius: "3px 0 0 3px", background: "#27231d" }} />
      <div style={{ position: "absolute", left: -1.5, top: "42%", width: 3, height: "9%", borderRadius: "3px 0 0 3px", background: "#27231d" }} />
      <div style={{ position: "absolute", right: -1.5, top: "34%", width: 3, height: "13%", borderRadius: "0 3px 3px 0", background: "#27231d" }} />

      <div
        style={{
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          aspectRatio: "9 / 19.5",
          background: CREAM,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.55)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "1.7%",
            zIndex: 30,
            transform: "translateX(-50%)",
            width: "33%",
            height: "3.4%",
            minHeight: 16,
            borderRadius: 999,
            background: "#000",
            border: "1px solid rgba(255,255,255,0.05)",
          }}
        />
        {children}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(125deg, rgba(255,255,255,0.20) 0%, rgba(255,255,255,0) 30%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.07) 100%)",
          }}
        />
      </div>
    </div>
  );
}

function ScreenHeader({ title, subtitle, dark = false }: { title: string; subtitle: string; dark?: boolean }) {
  return (
    <div style={{ padding: "18px 13px 9px", color: dark ? "#fff" : INK }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ color: dark ? "rgba(255,255,255,0.76)" : SOFT }}>
            <IconGrid />
          </span>
          <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: dark ? "rgba(255,255,255,0.52)" : FAINT }}>
            Salon AI
          </span>
        </div>
        <span style={{ color: dark ? "rgba(255,255,255,0.70)" : SOFT }}>
          <IconBell />
        </span>
      </div>
      <p style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1.02 }}>{title}</p>
      <p style={{ marginTop: 3, fontSize: 8.5, color: dark ? "rgba(255,255,255,0.55)" : SOFT }}>{subtitle}</p>
    </div>
  );
}

function CommsHubScreen() {
  const threads = [
    { name: "Adele Cooper", type: "Client", text: "Confirm toner after wait", time: "2m", color: ORANGE },
    { name: "Maya", type: "Staff", text: "Ready for Rina at bowl 2", time: "now", color: BLUE },
    { name: "Daniel", type: "Staff", text: "Assign to rinse 10:45", time: "5m", color: GREEN },
  ];

  return (
    <div style={{ height: "100%", background: "linear-gradient(180deg,#FFFCF7 0%,#F8F0E5 100%)", color: INK, display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="Comms Hub" subtitle="Clients + staff in one flow" />
      <div style={{ padding: "0 13px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ borderRadius: 16, background: PAPER, border: `1px solid ${LINE}`, padding: 11, boxShadow: "0 8px 24px rgba(20,12,4,0.08)" }}>
          <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: FAINT }}>AI Draft</p>
          <p style={{ marginTop: 6, fontSize: 12, fontWeight: 750, lineHeight: 1.25 }}>
            "Hi Adele, your color is ready for toner. Maya will see you in 8 min."
          </p>
          <div style={{ marginTop: 10, display: "flex", gap: 6 }}>
            <span style={{ flex: 1, textAlign: "center", borderRadius: 999, background: ORANGE, color: "#fff", padding: "6px 0", fontSize: 8, fontWeight: 800 }}>Send client</span>
            <span style={{ flex: 1, textAlign: "center", borderRadius: 999, background: ORANGE_SOFT, color: ORANGE, padding: "6px 0", fontSize: 8, fontWeight: 800 }}>Notify staff</span>
          </div>
        </div>

        {threads.map((thread) => (
          <div key={thread.name} style={{ borderRadius: 13, background: PAPER, border: `1px solid ${LINE}`, padding: 10, display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: thread.color, boxShadow: `0 0 8px ${thread.color}55`, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <p style={{ fontSize: 9.5, fontWeight: 800, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{thread.name}</p>
                <span style={{ fontSize: 6.5, color: thread.color, background: `${thread.color}12`, borderRadius: 999, padding: "2px 5px", fontWeight: 800 }}>{thread.type}</span>
              </div>
              <p style={{ marginTop: 2, fontSize: 7.5, color: SOFT, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{thread.text}</p>
            </div>
            <span style={{ fontSize: 7, color: FAINT, fontWeight: 800 }}>{thread.time}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", borderRadius: 14, background: "rgba(30,141,98,0.10)", border: "1px solid rgba(30,141,98,0.18)", padding: 10 }}>
          <p style={{ fontSize: 7, color: GREEN, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase" }}>Unified Inbox</p>
          <p style={{ marginTop: 4, fontSize: 10, lineHeight: 1.3, color: SOFT }}>12 client messages, 4 staff updates, 3 AI replies ready.</p>
        </div>
      </div>
    </div>
  );
}

function InventoryScreen() {
  const items = [
    ["Developer 20V", "2.1 days", ORANGE, "Low"],
    ["Gloss 7N", "4.8 days", GOLD, "Watch"],
    ["Keratin Kit", "12 days", GREEN, "Stable"],
  ];

  return (
    <div style={{ height: "100%", background: "linear-gradient(180deg,#FFF8ED 0%,#F6E4CB 100%)", color: INK, display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="Stock Intel" subtitle="Inventory agent" />
      <div style={{ padding: "0 13px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ borderRadius: 17, overflow: "hidden", border: `1px solid ${LINE}`, background: PAPER, boxShadow: "0 8px 24px rgba(20,12,4,0.09)" }}>
          <div style={{ height: 96, background: "linear-gradient(135deg, rgba(212,87,26,0.76), rgba(184,137,26,0.42)), url('/investor-vision/salon-ai-live-demo/product-scan-shelves-bg.png') center/cover", position: "relative" }}>
            <div style={{ position: "absolute", left: 11, bottom: 10, color: "#fff" }}>
              <p style={{ fontSize: 7, opacity: 0.72, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase" }}>At Risk</p>
              <p style={{ marginTop: 3, fontSize: 21, fontWeight: 850, letterSpacing: "-0.06em" }}>3 SKUs</p>
            </div>
          </div>
          <div style={{ padding: 11 }}>
            <p style={{ fontSize: 10.5, fontWeight: 800 }}>Low-stock alert chain</p>
            <p style={{ marginTop: 3, fontSize: 7.5, color: SOFT, lineHeight: 1.35 }}>Salon AI links upcoming services to depletion risk before the color bar runs short.</p>
          </div>
        </div>

        {items.map(([name, days, color, status]) => (
          <div key={name} style={{ borderRadius: 13, background: PAPER, border: `1px solid ${LINE}`, padding: 10, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ width: 8, height: 28, borderRadius: 999, background: color }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 9.5, fontWeight: 800 }}>{name}</p>
              <p style={{ marginTop: 2, fontSize: 7.5, color: SOFT }}>{days} coverage</p>
            </div>
            <span style={{ fontSize: 7, fontWeight: 800, color, background: `${color}14`, borderRadius: 999, padding: "4px 6px" }}>{status}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", borderRadius: 14, background: ORANGE, color: "#fff", padding: 10, boxShadow: "0 8px 20px rgba(212,87,26,0.26)" }}>
          <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.72 }}>Auto reorder</p>
          <p style={{ marginTop: 4, fontSize: 10.5, fontWeight: 750 }}>Create order for 20V + Gloss 7N</p>
        </div>
      </div>
    </div>
  );
}

function ProfitLossScreen() {
  const rows = [
    ["Color revenue", "$8.4k", GREEN],
    ["Labor cost", "-$2.9k", ORANGE],
    ["Product cost", "-$812", GOLD],
    ["Net profit", "$4.7k", GREEN],
  ];

  return (
    <div style={{ height: "100%", background: "linear-gradient(180deg,#FFFCF7 0%,#F4E6D4 100%)", color: INK, display: "flex", flexDirection: "column" }}>
      <ScreenHeader title="P&L Report" subtitle="Live profit by service" />
      <div style={{ padding: "0 13px 12px", display: "flex", flexDirection: "column", gap: 9 }}>
        <div style={{ borderRadius: 17, background: PAPER, border: `1px solid ${LINE}`, padding: 12, boxShadow: "0 8px 24px rgba(20,12,4,0.08)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
            <div>
              <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: FAINT }}>Today Net</p>
              <p style={{ marginTop: 5, fontSize: 26, fontWeight: 850, letterSpacing: "-0.07em" }}>$4.7k</p>
            </div>
            <span style={{ borderRadius: 999, background: "rgba(30,141,98,0.10)", color: GREEN, padding: "4px 7px", fontSize: 7, fontWeight: 800 }}>36.8%</span>
          </div>
          <div style={{ marginTop: 9 }}>
            <MiniBars color={GREEN} />
          </div>
        </div>

        {rows.map(([label, value, color]) => (
          <div key={label} style={{ borderRadius: 13, background: PAPER, border: `1px solid ${LINE}`, padding: "9px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 8.5, fontWeight: 700, color: SOFT }}>{label}</span>
            <span style={{ fontSize: 10.5, fontWeight: 850, color }}>{value}</span>
          </div>
        ))}

        <div style={{ marginTop: "auto", borderRadius: 14, background: ORANGE, color: "#fff", padding: 10, boxShadow: "0 8px 20px rgba(212,87,26,0.24)" }}>
          <p style={{ fontSize: 7, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.72 }}>Margin Insight</p>
          <p style={{ marginTop: 4, fontSize: 10.5, fontWeight: 750, lineHeight: 1.25 }}>Highlights are 18% below target margin. Raise formula price by $9.</p>
        </div>
      </div>
    </div>
  );
}

export const OwnerPhonesVisual: React.FC = () => (
  <div
    style={{
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      gap: "clamp(6px, 1.4vw, 16px)",
      paddingBottom: 0,
      width: "100%",
      minWidth: 0,
    }}
  >
    {PHONES.map((phone) => (
      <motion.div
        key={phone.key}
        initial={{ opacity: 0, y: 34, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.94 }}
        transition={{ duration: 0.85, delay: phone.delay, ease: EASE }}
        style={{
          transformOrigin: "bottom center",
          position: "relative",
          flex: "1 1 0",
          minWidth: 0,
          maxWidth: 207,
        }}
      >
        <PhoneShell>{phone.screen}</PhoneShell>
      </motion.div>
    ))}
  </div>
);
