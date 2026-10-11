import React from "react";
import { INK, ACCENTS } from "../theme";

/**
 * Investor facelift of the live owner home board — one composed command
 * center, not a rotating catalog of mock screens.
 */

const COPPER = ACCENTS.copper;
const SAGE = ACCENTS.sage;
const GOLD = ACCENTS.gold;
const SKY = ACCENTS.sky;
const ROSE = ACCENTS.rose;

const KPIS = [
  { value: "$48,920", label: "Today's revenue", sub: "14 appointments" },
  { value: "4",       label: "Clients in salon", sub: "2 in processing" },
  { value: "92%",     label: "Utilization",      sub: "4 of 5 chairs" },
  { value: "18m",     label: "Next capacity",    sub: "Chair 4 opens" },
  { value: "$1.8K",   label: "At-risk revenue",  sub: "1 delay · 1 stockout" },
] as const;

const LIVE = [
  { name: "Madison Reed",  stylist: "Olivia", stage: "Toner",       tone: GOLD.accent,  eta: "11 min" },
  { name: "Ava Monroe",    stylist: "Harper", stage: "Styling",     tone: SAGE.accent,  eta: "Checkout" },
  { name: "Emily Carter",  stylist: "Sophia", stage: "Processing",  tone: COPPER.accent, eta: "+19 min" },
  { name: "Noah Brooks",   stylist: "Ethan",  stage: "Application", tone: SKY.accent,    eta: "1h 42m" },
] as const;

const STAFF = [
  { name: "Olivia Bennett", role: "Senior Colorist", util: 96 },
  { name: "Harper Collins", role: "Color Specialist", util: 88 },
  { name: "Sophia Blake",   role: "Master Colorist",  util: 74 },
  { name: "Ethan Parker",   role: "Junior Stylist",   util: 41 },
] as const;

const INVENTORY = [
  { name: "Wella Color Touch 7/0",    remaining: "2.1 days",  risk: "critical" as const },
  { name: "Redken Shades EQ 09V",     remaining: "Stockout Fri", risk: "critical" as const },
  { name: "Olaplex No.2",             remaining: "Usage +31%", risk: "watch" as const },
] as const;

const RECS = [
  { title: "Move Noah to Chair 4", detail: "Color bar frees in 18 min. Protects a premium slot.", impact: "38 min saved" },
  { title: "Notify Emily's next client", detail: "Correction is +19 min. Auto-draft is ready.", impact: "Delay contained" },
  { title: "Reorder Redken 09V", detail: "Grams consumed at the bowl, not last month's invoice.", impact: "Prevents stockout" },
] as const;

const frame: React.CSSProperties = {
  height: "clamp(460px, 62vh, 620px)",
  borderRadius: 24,
  border: `1px solid ${COPPER.accentBorder}`,
  background: "linear-gradient(180deg, rgba(18,12,8,0.96) 0%, rgba(14,10,7,0.94) 100%)",
  boxShadow: "0 34px 92px rgba(0,0,0,0.44), inset 0 1px 0 rgba(255,255,255,0.10)",
  overflow: "hidden",
  display: "flex",
  flexDirection: "column",
};

export const OwnerCommandCenter: React.FC = () => (
  <div style={frame} aria-label="Owner command center">
    <header
      className="flex items-center justify-between px-5 py-3 flex-shrink-0"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full" style={{ background: SAGE.accent, boxShadow: `0 0 10px ${SAGE.glow}` }} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: COPPER.accent }}>
          Owner Command
        </span>
      </div>
      <span className="text-[11px] font-light" style={{ color: INK.faint }}>Today · 2:22 PM</span>
    </header>

    <div
      className="grid flex-shrink-0"
      style={{ gridTemplateColumns: "repeat(5, minmax(0, 1fr))", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      {KPIS.map((kpi, i) => (
        <div
          key={kpi.label}
          className="px-3 py-3"
          style={{ borderRight: i < KPIS.length - 1 ? "1px solid rgba(255,255,255,0.07)" : undefined }}
        >
          <div className="text-[22px] font-light leading-none tracking-tight" style={{ color: INK.strong }}>
            {kpi.value}
          </div>
          <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: COPPER.accent }}>
            {kpi.label}
          </div>
          <div className="mt-0.5 text-[11px] font-light" style={{ color: INK.faint }}>{kpi.sub}</div>
        </div>
      ))}
    </div>

    <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: INK.faint }}>
        Clients in salon
      </div>
      <div className="grid grid-cols-4 gap-2">
        {LIVE.map((client) => (
          <div
            key={client.name}
            className="rounded-xl px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="truncate text-[13px] font-medium" style={{ color: INK.strong }}>{client.name}</div>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: client.tone }}>
                {client.stage}
              </span>
              <span className="text-[10px] font-light" style={{ color: INK.faint }}>{client.eta}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="grid min-h-0 flex-1 grid-cols-2" style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div className="px-5 py-3" style={{ borderRight: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: INK.faint }}>
          Staff capacity
        </div>
        <div className="space-y-2">
          {STAFF.map((person) => (
            <div key={person.name} className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[12px] font-medium" style={{ color: INK.strong }}>{person.name}</div>
                <div className="text-[10px] font-light" style={{ color: INK.faint }}>{person.role}</div>
              </div>
              <div className="w-20">
                <div className="h-1.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,0.10)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${person.util}%`,
                      background: person.util > 85 ? COPPER.accent : SAGE.accent,
                    }}
                  />
                </div>
              </div>
              <span className="w-8 text-right text-[12px] tabular-nums" style={{ color: INK.soft }}>{person.util}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 py-3">
        <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: INK.faint }}>
          Inventory alerts
        </div>
        <div className="space-y-2">
          {INVENTORY.map((item) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="min-w-0 truncate text-[12px] font-medium" style={{ color: INK.strong }}>{item.name}</span>
              <span
                className="shrink-0 text-[11px] font-semibold"
                style={{ color: item.risk === "critical" ? ROSE.accent : GOLD.accent }}
              >
                {item.remaining}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>

    <div className="px-5 py-3 flex-shrink-0">
      <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: COPPER.accent }}>
        AI recommendations
      </div>
      <div className="grid grid-cols-3 gap-2">
        {RECS.map((rec) => (
          <div
            key={rec.title}
            className="rounded-xl px-3 py-2.5"
            style={{ background: "rgba(224,153,106,0.08)", border: `1px solid ${COPPER.accentBorder}` }}
          >
            <div className="text-[12px] font-medium leading-snug" style={{ color: INK.strong }}>{rec.title}</div>
            <div className="mt-1 text-[11px] font-light leading-snug" style={{ color: INK.faint }}>{rec.detail}</div>
            <div className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: COPPER.accent }}>
              {rec.impact}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
