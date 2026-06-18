import React, { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowRight, Search, Sparkles, TrendingUp } from "lucide-react";
import findings from "../../data/paul-usage-findings.json";

type Salon = {
  salon: string;
  services: number;
  clients: number;
  shadeGrams: number;
  years: string[];
};

type FamilyTotal = {
  family: string;
  color: string;
  grams: number;
  share: number;
  salons: string[];
  salonCount: number;
  services: number;
  clients: number;
};

type SalonFamily = {
  salon: string;
  family: string;
  grams: number;
  services: number;
  clients: number;
  shareOfFamily: number;
};

type ShadeRank = {
  rank: number;
  shadeCode: string;
  shadeName: string;
  brand: string;
  productLine: string;
  company: string;
  family: string;
  toneDirection: string;
  grams: number;
  services: number;
  clients: number;
  salons: string[];
  share?: number;
  shareOfFamily?: number;
};

type JourneyEvent = {
  date: string;
  serviceName: string;
  serviceType: string;
  family: string;
  shadeCode: string;
  shadeName: string;
  brand: string;
  line: string;
  company: string;
  level: number | null;
  toneDirection: string;
};

type ShadeJourney = {
  salon: string;
  clientName: string;
  visitCount: number;
  changeCount: number;
  firstVisit: string;
  lastVisit: string;
  start: JourneyEvent;
  end: JourneyEvent;
  changes: { from: JourneyEvent; to: JourneyEvent; reason: string }[];
};

type Dataset = {
  metadata: {
    generatedAt: string;
    workbookCount: number;
    salonCount: number;
    note: string;
    totals: {
      services: number;
      componentRows: number;
      shadeRows: number;
      shadeGrams: number;
      developerRows: number;
      lightenerRows: number;
      clients: number;
    };
  };
  salons: Salon[];
  familyTotals: FamilyTotal[];
  salonFamilyMatrix: SalonFamily[];
  top20Shades: ShadeRank[];
  top5ByFamily: { family: string; color: string; shades: ShadeRank[] }[];
  shadeJourneys: ShadeJourney[];
};

const data = findings as Dataset;

// ── Design tokens ────────────────────────────────────────────────────────────
const BG        = "#FBF7F2";
const INK       = "#1E1410";
const MUTED     = "#7C6A60";
const ROSE      = "#C86B7A";
const GOLD      = "#C7A262";
const LINE      = "rgba(36, 23, 17, 0.09)";

const TONE_COLORS: Record<string, { bg: string; text: string }> = {
  Warm:     { bg: "#FEF0E3", text: "#A05A1C" },
  Cool:     { bg: "#EBF4FF", text: "#2A62A8" },
  Natural:  { bg: "#F0EDE8", text: "#6B5D52" },
  Balanced: { bg: "#F4F0F8", text: "#6550A0" },
};

const FAMILY_GRADIENTS: Record<string, string> = {
  Blonde:            "linear-gradient(135deg,#FBF0CC 0%,#F5D98B 100%)",
  Brunette:          "linear-gradient(135deg,#F3E8DF 0%,#D4A882 100%)",
  Copper:            "linear-gradient(135deg,#FDEEE3 0%,#E89060 100%)",
  Red:               "linear-gradient(135deg,#FDEAEA 0%,#D96070 100%)",
  Fashion:           "linear-gradient(135deg,#F3EAFE 0%,#B48AE0 100%)",
  "Natural / Neutral": "linear-gradient(135deg,#EEE9E4 0%,#C4B8AF 100%)",
  Unresolved:        "linear-gradient(135deg,#F0EFED 0%,#B0AAA4 100%)",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtNumber(value: number, digits = 0) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(value);
}
function fmtKg(grams: number) {
  return `${fmtNumber(grams / 1000, 1)} kg`;
}
function formatDate(value: string) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function familyColor(family: string) {
  return data.familyTotals.find((row) => row.family === family)?.color || "#A8A29E";
}

// ── Primitives ───────────────────────────────────────────────────────────────
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = "" }) => (
  <div
    className={`rounded-[2rem] border bg-white shadow-[0_20px_60px_rgba(60,35,20,0.07)] ${className}`}
    style={{ borderColor: LINE }}
  >
    {children}
  </div>
);

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.3em]" style={{ color: GOLD }}>
    <span className="h-1.5 w-1.5 rounded-full" style={{ background: GOLD }} />
    {children}
  </div>
);

const FamilyBadge: React.FC<{ family: string; size?: "sm" | "md" }> = ({ family, size = "sm" }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full font-medium ${size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"}`}
    style={{ background: `${familyColor(family)}28`, color: INK, border: `1px solid ${familyColor(family)}44` }}
  >
    <span className="h-2 w-2 rounded-full" style={{ background: familyColor(family) }} />
    {family}
  </span>
);

const ToneBadge: React.FC<{ tone: string }> = ({ tone }) => {
  const style = TONE_COLORS[tone] || TONE_COLORS.Natural;
  return (
    <span className="inline-flex rounded-full px-2.5 py-1 text-xs font-medium" style={{ background: style.bg, color: style.text }}>
      {tone}
    </span>
  );
};

// ── Stats strip ──────────────────────────────────────────────────────────────
const StatPill: React.FC<{ label: string; value: string; accent: string; note?: string }> = ({ label, value, accent, note }) => (
  <div className="flex flex-col gap-1 rounded-[1.5rem] border bg-white p-5 shadow-sm" style={{ borderColor: LINE }}>
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
      <span className="text-[11px] font-semibold uppercase tracking-[0.22em]" style={{ color: MUTED }}>{label}</span>
    </div>
    <div className="text-[2rem] font-light tabular-nums leading-none" style={{ color: INK }}>{value}</div>
    {note && <div className="text-xs" style={{ color: MUTED }}>{note}</div>}
  </div>
);

// ── Hero ─────────────────────────────────────────────────────────────────────
function Hero() {
  const topFamily = data.familyTotals[0];
  const topShade  = data.top20Shades[0];

  return (
    <section
      className="relative overflow-hidden rounded-b-[3.5rem] px-5 pt-14 pb-12 sm:px-10 lg:px-16"
      style={{ background: "linear-gradient(150deg,#FFFDF9 0%,#FDF0E8 40%,#FAE0E6 80%,#EEE3F8 100%)" }}
    >
      {/* decorative blobs */}
      <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-[480px] w-[480px] rounded-full opacity-60 blur-3xl" style={{ background: "rgba(199,162,98,0.22)" }} />
      <div className="pointer-events-none absolute bottom-[-120px] left-[-60px] h-96 w-96 rounded-full opacity-50 blur-3xl" style={{ background: "rgba(200,107,122,0.18)" }} />
      <div className="pointer-events-none absolute right-[25%] bottom-[-60px] h-72 w-72 rounded-full opacity-40 blur-3xl" style={{ background: "rgba(164,120,200,0.18)" }} />

      <div className="relative mx-auto max-w-7xl">
        <Eyebrow>Real Salon Usage — Israel Market</Eyebrow>

        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:items-start">
          <div>
            <h1 className="max-w-4xl text-[clamp(2.6rem,7vw,5.5rem)] font-extralight leading-[0.95] tracking-[-0.04em]" style={{ color: INK }}>
              What did these<br />
              <em className="not-italic font-light" style={{ color: ROSE }}>six salons</em> actually<br />
              use in color?
            </h1>
            <p className="mt-6 max-w-2xl text-lg font-light leading-8" style={{ color: MUTED }}>
              Built from 12 real workbooks — shade families deduplicated, developers excluded, salon names exposed, and client shade journeys extracted in plain English.
            </p>
          </div>

          {/* main readout card */}
          <Card className="p-6 mt-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl p-3" style={{ background: "#FEF0E3" }}>
                <Sparkles className="h-5 w-5" style={{ color: ROSE }} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>Top finding</p>
                <p className="mt-2 text-sm leading-6" style={{ color: INK }}>
                  <strong>{topFamily.family}</strong> is the dominant shade family at <strong style={{ color: familyColor(topFamily.family) }}>{topFamily.share}%</strong> of all color material.
                </p>
                <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
                  Shade <strong>{topShade.shadeCode}</strong> ({topShade.brand} / {topShade.productLine}) leads the top 20 ranking across {topShade.salons.length} salons with {fmtKg(topShade.grams)} used.
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* stats strip */}
        <div className="mt-10 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <StatPill label="Workbooks"      value={fmtNumber(data.metadata.workbookCount)}        accent="#C7A262" note="2025 & 2026" />
          <StatPill label="Salons"         value={fmtNumber(data.metadata.salonCount)}            accent="#8BAD70" note="names visible" />
          <StatPill label="Services"       value={fmtNumber(data.metadata.totals.services)}       accent="#6AABCF" note="color events" />
          <StatPill label="Clients"        value={fmtNumber(data.metadata.totals.clients)}        accent="#C86B7A" note="unique per salon" />
          <StatPill label="Shade Material" value={fmtKg(data.metadata.totals.shadeGrams)}         accent="#D09040" note="developers excluded" />
          <StatPill label="Journeys"       value={fmtNumber(data.shadeJourneys.length)}           accent="#9070C0" note="significant changes" />
        </div>
      </div>
    </section>
  );
}

// ── Family distribution ──────────────────────────────────────────────────────
function FamilyDistribution() {
  const chartData = data.familyTotals.map((row) => ({ ...row, label: `${row.family} ${row.share}%` }));
  const salons    = data.salons.map((row) => row.salon);

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 sm:px-10 lg:px-16">
      <Eyebrow>Shade Families By Salon</Eyebrow>
      <h2 className="mb-8 text-3xl font-light tracking-[-0.03em]" style={{ color: INK }}>
        Every salon used blonde, brunette, copper, and red.
      </h2>

      <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
        {/* donut */}
        <Card className="p-6 flex flex-col">
          <p className="text-sm leading-6" style={{ color: MUTED }}>
            Overall share by shade material weight. This view answers the exact question: which salons used each color family, and how large was that usage.
          </p>
          <div className="mt-6 flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="grams"
                  nameKey="family"
                  cx="50%" cy="50%"
                  innerRadius={70}
                  outerRadius={115}
                  paddingAngle={4}
                  label={({ name, share }) => `${name} ${share}%`}
                  labelLine={false}
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.family} fill={entry.color} stroke="white" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => fmtKg(Number(value))}
                  contentStyle={{ background: "white", border: `1px solid ${LINE}`, borderRadius: "1rem", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* family cards */}
        <Card className="overflow-hidden p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {data.familyTotals.map((family) => {
              const familyRows = data.salonFamilyMatrix.filter((row) => row.family === family.family);
              return (
                <div
                  key={family.family}
                  className="rounded-3xl border p-5"
                  style={{ borderColor: `${family.color}40`, background: FAMILY_GRADIENTS[family.family] || `${family.color}12` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <FamilyBadge family={family.family} size="md" />
                    <span className="text-2xl font-light tabular-nums" style={{ color: family.color }}>{family.share}%</span>
                  </div>
                  <div className="mt-3 text-2xl font-light" style={{ color: INK }}>{fmtKg(family.grams)}</div>
                  <div className="mt-0.5 text-xs" style={{ color: MUTED }}>{family.salonCount} salons · {fmtNumber(family.clients)} clients</div>
                  <div className="mt-4 space-y-2">
                    {familyRows.sort((a, b) => b.grams - a.grams).map((row) => (
                      <div key={`${row.family}-${row.salon}`}>
                        <div className="mb-1 flex justify-between text-xs" style={{ color: MUTED }}>
                          <span className="font-medium" style={{ color: INK }}>{row.salon}</span>
                          <span>{row.shareOfFamily}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/60">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${Math.min(row.shareOfFamily, 100)}%`, background: family.color }}
                          />
                        </div>
                      </div>
                    ))}
                    {salons
                      .filter((salon) => !familyRows.some((row) => row.salon === salon))
                      .map((salon) => (
                        <div key={`${family.family}-${salon}`} className="text-xs italic" style={{ color: `${MUTED}80` }}>
                          {salon}: no detected usage
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </section>
  );
}

// ── Salon matrix stacked bar ──────────────────────────────────────────────────
function SalonMatrix() {
  const chartRows = data.salons.map((salon) => {
    const row: Record<string, string | number> = { salon: salon.salon };
    data.familyTotals.forEach((family) => {
      const match = data.salonFamilyMatrix.find((item) => item.salon === salon.salon && item.family === family.family);
      row[family.family] = match ? Math.round(match.grams / 1000) : 0;
    });
    return row;
  });

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-10 lg:px-16">
      <Card className="p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <Eyebrow>Salon Comparison</Eyebrow>
            <h2 className="text-3xl font-light tracking-[-0.03em]" style={{ color: INK }}>Shade-family kilograms by salon</h2>
          </div>
          <p className="max-w-md text-sm leading-6" style={{ color: MUTED }}>
            Each workbook contributes the <code className="rounded px-1 text-xs" style={{ background: "#F4EDE8" }}>All</code> sheet only — no double counting of branch or stylist sheets.
          </p>
        </div>
        <div className="mt-8 h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartRows} margin={{ left: 8, right: 20, top: 10, bottom: 45 }}>
              <CartesianGrid stroke="rgba(36,23,17,0.07)" vertical={false} />
              <XAxis dataKey="salon" angle={-16} textAnchor="end" interval={0} height={72} tick={{ fill: MUTED, fontSize: 12 }} />
              <YAxis tick={{ fill: MUTED, fontSize: 12 }} tickFormatter={(v) => `${v}kg`} />
              <Tooltip
                formatter={(value: number, name: string) => [`${fmtNumber(value)} kg`, name]}
                contentStyle={{ background: "white", border: `1px solid ${LINE}`, borderRadius: "1rem", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
              />
              {data.familyTotals.map((family) => (
                <Bar key={family.family} dataKey={family.family} stackId="a" fill={family.color} radius={[6, 6, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* legend */}
        <div className="mt-4 flex flex-wrap gap-2">
          {data.familyTotals.map((f) => (
            <FamilyBadge key={f.family} family={f.family} />
          ))}
        </div>
      </Card>
    </section>
  );
}

// ── Top 20 shades ────────────────────────────────────────────────────────────
function Top20Shades() {
  const totalGrams = data.metadata.totals.shadeGrams;

  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-10 lg:px-16">
      <Eyebrow>Top 20 Shade Truth</Eyebrow>
      <h2 className="mb-8 text-3xl font-light tracking-[-0.03em]" style={{ color: INK }}>
        Most popular shade numbers — all salons combined
      </h2>

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        {/* top 8 visual cards */}
        <Card className="p-6">
          <p className="text-sm leading-6" style={{ color: MUTED }}>
            Consolidated by company, brand, product line, and shade code. Developers and lighteners are excluded.
          </p>
          <div className="mt-6 space-y-3">
            {data.top20Shades.slice(0, 8).map((shade, i) => {
              const barPct = totalGrams ? Math.min((shade.grams / totalGrams) * 100 * 12, 100) : 0;
              return (
                <div
                  key={`${shade.rank}-${shade.shadeCode}-${shade.company}`}
                  className="rounded-2xl border p-4 transition-shadow hover:shadow-md"
                  style={{ borderColor: LINE, background: i === 0 ? FAMILY_GRADIENTS[shade.family] || "#FFF" : "white" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold tabular-nums" style={{ color: GOLD }}>#{shade.rank}</span>
                        <span className="text-xs" style={{ color: MUTED }}>{shade.company}</span>
                      </div>
                      <div className="mt-1 text-2xl font-light" style={{ color: INK }}>{shade.shadeCode}</div>
                      <div className="text-xs" style={{ color: MUTED }}>{shade.brand} / {shade.productLine}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <FamilyBadge family={shade.family} />
                      <ToneBadge tone={shade.toneDirection} />
                    </div>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full" style={{ background: `${familyColor(shade.family)}22` }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${barPct}%`, background: familyColor(shade.family) }}
                    />
                  </div>
                  <div className="mt-2 flex flex-wrap gap-3 text-xs" style={{ color: MUTED }}>
                    <span className="font-medium" style={{ color: INK }}>{fmtKg(shade.grams)}</span>
                    <span>{fmtNumber(shade.services)} services</span>
                    <span>{fmtNumber(shade.clients)} clients</span>
                    <span>{shade.salons.length} salon{shade.salons.length > 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* full table */}
        <Card className="overflow-hidden">
          <div className="max-h-[900px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 z-10 border-b" style={{ background: "#FFF9F4", borderColor: LINE }}>
                <tr style={{ color: MUTED }}>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.12em]">#</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.12em]">Shade</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.12em]">Company</th>
                  <th className="px-4 py-3.5 font-semibold text-xs uppercase tracking-[0.12em]">Family</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-xs uppercase tracking-[0.12em]">Usage</th>
                </tr>
              </thead>
              <tbody>
                {data.top20Shades.map((shade, i) => (
                  <tr
                    key={`${shade.rank}-${shade.shadeCode}-${shade.company}`}
                    className="border-t"
                    style={{ borderColor: LINE, background: i === 0 ? `${familyColor(shade.family)}08` : undefined }}
                  >
                    <td className="px-4 py-3.5">
                      <span className="font-bold tabular-nums" style={{ color: i < 3 ? GOLD : MUTED }}>
                        {shade.rank <= 3 ? ["🥇","🥈","🥉"][i] : `#${shade.rank}`}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold" style={{ color: INK }}>{shade.shadeCode}</div>
                      <div className="text-xs" style={{ color: MUTED }}>{shade.brand} / {shade.productLine}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs" style={{ color: MUTED }}>{shade.company}</td>
                    <td className="px-4 py-3.5">
                      <FamilyBadge family={shade.family} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="font-semibold" style={{ color: INK }}>{fmtKg(shade.grams)}</div>
                      <div className="text-xs" style={{ color: MUTED }}>
                        {shade.share}% · {shade.salons.length} salon{shade.salons.length > 1 ? "s" : ""}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </section>
  );
}

// ── Top 5 by family ──────────────────────────────────────────────────────────
function TopByFamily() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-12 sm:px-10 lg:px-16">
      <Eyebrow>Top 5 In Each Category</Eyebrow>
      <h2 className="mb-8 text-3xl font-light tracking-[-0.03em]" style={{ color: INK }}>
        Leading shade numbers by color family — with company
      </h2>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {data.top5ByFamily.map((family) => (
          <Card key={family.family} className="overflow-hidden">
            <div
              className="px-5 pt-5 pb-4 rounded-t-[2rem]"
              style={{ background: FAMILY_GRADIENTS[family.family] || `${family.color}18` }}
            >
              <FamilyBadge family={family.family} size="md" />
              <div className="mt-3 flex items-end justify-between">
                <TrendingUp className="h-5 w-5" style={{ color: family.color }} />
                <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: MUTED }}>Top 5</span>
              </div>
            </div>
            <div className="space-y-2 p-4">
              {family.shades.map((shade, i) => (
                <div
                  key={`${family.family}-${shade.rank}-${shade.shadeCode}`}
                  className="rounded-2xl p-3.5"
                  style={{ background: i === 0 ? `${family.color}12` : "#FAFAF8", border: `1px solid ${i === 0 ? family.color + "30" : LINE}` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold" style={{ color: family.color }}>#{shade.rank}</span>
                        <span className="truncate text-xs" style={{ color: MUTED }}>{shade.company}</span>
                      </div>
                      <div className="mt-0.5 text-lg font-light" style={{ color: INK }}>{shade.shadeCode}</div>
                      <div className="truncate text-xs" style={{ color: MUTED }}>{shade.brand} / {shade.productLine}</div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="text-base font-semibold" style={{ color: family.color }}>{shade.shareOfFamily}%</div>
                      <div className="text-xs" style={{ color: MUTED }}>{fmtKg(shade.grams)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}

// ── Client shade journeys ────────────────────────────────────────────────────
function JourneyCard({ journey }: { journey: ShadeJourney }) {
  const topChange = journey.changes[0];
  const fromColor = familyColor(topChange.from.family);
  const toColor   = familyColor(topChange.to.family);

  return (
    <div
      className="rounded-3xl border p-5 transition-shadow hover:shadow-md"
      style={{ borderColor: LINE, background: "white" }}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: GOLD }}>{journey.salon}</div>
          <h3 className="mt-1 text-xl font-light" style={{ color: INK }}>{journey.clientName}</h3>
          <p className="mt-1 text-sm" style={{ color: MUTED }}>
            {journey.changeCount} detected change{journey.changeCount > 1 ? "s" : ""} across {journey.visitCount} visits
            · {formatDate(journey.firstVisit)} — {formatDate(journey.lastVisit)}
          </p>
        </div>
        <div className="rounded-full px-3 py-1.5 text-xs font-semibold" style={{ background: "#FEF0E3", color: INK }}>
          {topChange.reason}
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_40px_1fr] md:items-center">
        <div
          className="rounded-2xl p-4"
          style={{ background: `${fromColor}18`, border: `1px solid ${fromColor}30` }}
        >
          <FamilyBadge family={topChange.from.family} />
          <div className="mt-2 text-lg font-light" style={{ color: INK }}>{topChange.from.shadeCode}</div>
          <div className="mt-1 text-xs leading-5" style={{ color: MUTED }}>
            {formatDate(topChange.from.date)}<br />
            {topChange.from.serviceType}<br />
            <span className="font-medium">{topChange.from.company}</span> / {topChange.from.line}
          </div>
          <ToneBadge tone={topChange.from.toneDirection} />
        </div>

        <div className="flex items-center justify-center">
          <div className="rounded-full p-2" style={{ background: "#FEF0E3" }}>
            <ArrowRight className="h-4 w-4" style={{ color: ROSE }} />
          </div>
        </div>

        <div
          className="rounded-2xl p-4"
          style={{ background: `${toColor}18`, border: `1px solid ${toColor}30` }}
        >
          <FamilyBadge family={topChange.to.family} />
          <div className="mt-2 text-lg font-light" style={{ color: INK }}>{topChange.to.shadeCode}</div>
          <div className="mt-1 text-xs leading-5" style={{ color: MUTED }}>
            {formatDate(topChange.to.date)}<br />
            {topChange.to.serviceType}<br />
            <span className="font-medium">{topChange.to.company}</span> / {topChange.to.line}
          </div>
          <ToneBadge tone={topChange.to.toneDirection} />
        </div>
      </div>
    </div>
  );
}

function ClientJourneys() {
  const [query, setQuery]   = useState("");
  const [showAll, setShowAll] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data.shadeJourneys;
    return data.shadeJourneys.filter((j) =>
      `${j.salon} ${j.clientName} ${j.start.family} ${j.end.family} ${j.changes.map((c) => c.reason).join(" ")}`.toLowerCase().includes(q),
    );
  }, [query]);

  const visible = showAll ? filtered : filtered.slice(0, 80);

  return (
    <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-10 lg:px-16">
      <Card className="p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Eyebrow>Client Shade Journeys</Eyebrow>
            <h2 className="text-3xl font-light tracking-[-0.03em]" style={{ color: INK }}>
              Clients with meaningful color or toner shifts
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: MUTED }}>
              A journey is flagged when the dominant shade family changes, depth shifts by two or more levels, or tone direction changes alongside a level movement. Describes formula movement — not a guaranteed visible result.
            </p>
          </div>
          <label className="relative block w-full max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: MUTED }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search salon, client, family…"
              className="w-full rounded-full border bg-white py-3 pl-11 pr-5 text-sm outline-none focus:ring-2"
              style={{ borderColor: LINE, color: INK }}
            />
          </label>
        </div>

        <div
          className="mt-6 flex items-center justify-between rounded-3xl px-5 py-3.5 text-sm"
          style={{ background: "#FFF8F3" }}
        >
          <span style={{ color: MUTED }}>
            Showing <strong style={{ color: INK }}>{fmtNumber(visible.length)}</strong> of{" "}
            <strong style={{ color: INK }}>{fmtNumber(filtered.length)}</strong> journeys
          </span>
          <span className="text-xs" style={{ color: MUTED }}>Total detected: {fmtNumber(data.shadeJourneys.length)}</span>
        </div>

        <div className="mt-5 grid gap-3">
          {visible.map((journey) => (
            <JourneyCard
              key={`${journey.salon}-${journey.clientName}-${journey.firstVisit}-${journey.lastVisit}`}
              journey={journey}
            />
          ))}
        </div>

        {!showAll && filtered.length > visible.length && (
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="mt-6 w-full rounded-full border bg-white py-3.5 text-sm font-semibold transition hover:bg-[#FFF8F3]"
            style={{ borderColor: LINE, color: INK }}
          >
            Show all {fmtNumber(filtered.length)} journeys
          </button>
        )}
      </Card>
    </section>
  );
}

// ── Data truth footer ────────────────────────────────────────────────────────
function DataTruthFooter() {
  return (
    <section className="mx-auto max-w-7xl px-5 pb-20 sm:px-10 lg:px-16">
      <Card className="p-6">
        <Eyebrow>Data Truth</Eyebrow>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-3xl p-5" style={{ background: "#F9F5F0" }}>
            <h3 className="text-base font-semibold" style={{ color: INK }}>No duplicate sheets</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>{data.metadata.note}</p>
          </div>
          <div className="rounded-3xl p-5" style={{ background: "#F9F5F0" }}>
            <h3 className="text-base font-semibold" style={{ color: INK }}>Shade ranking only</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
              {fmtNumber(data.metadata.totals.developerRows)} developer rows and {fmtNumber(data.metadata.totals.lightenerRows)} lightener rows were excluded from all shade rankings.
            </p>
          </div>
          <div className="rounded-3xl p-5" style={{ background: "#F9F5F0" }}>
            <h3 className="text-base font-semibold" style={{ color: INK }}>Generated artifact</h3>
            <p className="mt-2 text-sm leading-6" style={{ color: MUTED }}>
              Built from {data.metadata.workbookCount} Excel files. Generated at {new Date(data.metadata.generatedAt).toLocaleString("en-US")}.
            </p>
          </div>
        </div>
      </Card>
    </section>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function PaulUsageFindingsPage() {
  return (
    <main className="min-h-screen" style={{ background: BG }}>
      <Hero />
      <FamilyDistribution />
      <SalonMatrix />
      <Top20Shades />
      <TopByFamily />
      <ClientJourneys />
      <DataTruthFooter />
    </main>
  );
}
