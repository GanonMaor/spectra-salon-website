import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  AlertTriangle, BarChart3, CheckCircle2, ChevronDown, ChevronUp,
  FileSpreadsheet, Loader2, Lock, RefreshCw, ShieldCheck, TrendingUp, Upload, Zap,
} from "lucide-react";
import {
  createUsageIntelligenceReport,
  getUsageIntelligenceReport,
  listUsageIntelligenceReports,
  previewUsageIntelligence,
} from "../../lib/customerUsageIntelligenceClient";
import type {
  UsageInsightItem,
  UsageIntelligencePreviewResponse,
  UsageReportListItem,
  UsageReportSnapshot,
  UsageInsightPacket,
} from "../../lib/types/customerUsageIntelligence";

const CHART_COLORS = ["#6366F1", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#F97316", "#14B8A6", "#3B82F6", "#84CC16", "#D946EF"];

const DEFAULT_TENANT = {
  organizationId: "org-default",
  customerAccountId: "customer-default",
  salonId: "salon-validation-a",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fmtNum(n: number | null | undefined) {
  if (n == null) return "—";
  return n.toLocaleString("en-US", { maximumFractionDigits: 1 });
}

function fmtKg(grams: number | null | undefined) {
  if (grams == null) return "—";
  return `${(grams / 1000).toFixed(1)} kg`;
}

// ── Collapsible methodology panel ────────────────────────────────────────────

function MethodologyPanel({ insight }: { insight: UsageInsightItem }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-black/20 overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-4 py-2.5 text-xs text-slate-400 hover:text-slate-200">
        <span className="font-medium">Methodology & Evidence</span>
        {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>
      {open && (
        <div className="px-4 pb-3 space-y-2 text-xs text-slate-500 border-t border-white/5 pt-2">
          <p><span className="text-slate-400">Calculation:</span> {insight.calculationDefinition}</p>
          <div className="flex gap-4 flex-wrap">
            <span>Confidence: <strong className="text-slate-300">{insight.confidence}</strong></span>
            <span>Numerator: {fmtNum(insight.numerator)}</span>
            <span>Denominator: {fmtNum(insight.denominator)}</span>
            <span>Support: {insight.supportStatus.replace("_", " ")}</span>
          </div>
          {insight.unresolvedDataEffect && <p className="text-amber-400/70">{insight.unresolvedDataEffect}</p>}
        </div>
      )}
    </div>
  );
}

// ── Hero summary cards ───────────────────────────────────────────────────────

function HeroCard({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
      <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-1.5 text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

// ── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, headline, whyItMatters, children, insight }: {
  title: string; headline: string; whyItMatters?: string; children: React.ReactNode; insight: UsageInsightItem;
}) {
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 shadow-xl shadow-black/20 space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-violet-300 mb-1">{title}</p>
        <h3 className="text-xl font-semibold text-white">{headline}</h3>
      </div>
      <p className="text-sm leading-6 text-slate-300">{insight.summary}</p>
      {children}
      {whyItMatters && (
        <p className="text-xs text-slate-500 italic border-t border-white/5 pt-3">{whyItMatters}</p>
      )}
      <MethodologyPanel insight={insight} />
    </section>
  );
}

// ── Insight section renderers ────────────────────────────────────────────────

function ColorFamilySection({ insight }: { insight: UsageInsightItem }) {
  const chartData = (insight.payload?.chartData as { name: string; share: number; grams: number }[]) || [];
  return (
    <Section title="Color Family Distribution" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={chartData} dataKey="share" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={110} label={({ name, share }) => `${name} ${share}%`} labelLine={false}>
                {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {chartData.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-sm text-white flex-1">{entry.name}</span>
              <span className="text-sm font-semibold text-white">{entry.share}%</span>
              <span className="text-xs text-slate-500">{fmtKg(entry.grams)}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function TopShadesSection({ insight }: { insight: UsageInsightItem }) {
  const shades = ((insight.payload?.topShades as { label: string; shareByGrams: number; grams: number; formulas: number; clients: number }[]) || []).slice(0, 15);
  return (
    <Section title="Most Used Shades" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={shades} layout="vertical" margin={{ left: 180, right: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
            <YAxis type="category" dataKey="label" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }} width={170} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            <Bar dataKey="shareByGrams" name="Share %" fill="#6366F1" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

function ShadesByServiceSection({ insight }: { insight: UsageInsightItem }) {
  const byService = (insight.payload?.byService || {}) as Record<string, { shade: string; grams: number; usageRows: number }[]>;
  const serviceNames = Object.keys(byService);
  return (
    <Section title="Shades by Service Type" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {serviceNames.map((svc) => (
          <div key={svc} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-wider text-violet-300 mb-2">{svc.replace(/_/g, " ")}</p>
            {byService[svc].slice(0, 5).map((s, i) => (
              <div key={i} className="flex justify-between text-xs py-1 border-b border-white/5 last:border-0">
                <span className="text-slate-300 truncate max-w-[180px]">{s.shade}</span>
                <span className="text-slate-400 ml-2">{fmtNum(s.grams)}g</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </Section>
  );
}

function BrandShareSection({ insight }: { insight: UsageInsightItem }) {
  const brands = ((insight.payload?.brandShare as { brand: string; shareByMaterialWeight: number; shareByFormulas: number; shareByServices: number; shareByClients: number; grams: number }[]) || []).slice(0, 10);
  const [metric, setMetric] = useState<"shareByMaterialWeight" | "shareByFormulas" | "shareByServices" | "shareByClients">("shareByMaterialWeight");
  const metricLabels: Record<string, string> = { shareByMaterialWeight: "By Weight", shareByFormulas: "By Formulas", shareByServices: "By Services", shareByClients: "By Clients" };
  return (
    <Section title="Brand Share of Bowl" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="flex gap-2 flex-wrap mb-4">
        {(Object.keys(metricLabels) as (keyof typeof metricLabels)[]).map((key) => (
          <button key={key} onClick={() => setMetric(key as typeof metric)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${metric === key ? "bg-violet-500/20 text-violet-200 border border-violet-500/40" : "bg-white/5 text-slate-400 border border-white/10 hover:text-white"}`}>
            {metricLabels[key]}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={brands} dataKey={metric} nameKey="brand" cx="50%" cy="50%" innerRadius={50} outerRadius={100} label={({ brand, value }) => `${brand.split(" ")[0]} ${value}%`} labelLine={false}>
                {brands.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-2">
          {brands.map((b, i) => (
            <div key={b.brand} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              <span className="text-sm text-white flex-1 truncate">{b.brand}</span>
              <span className="text-sm font-semibold text-white">{b[metric]}%</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function CrossBrandSection({ insight }: { insight: UsageInsightItem }) {
  const sameFormula = insight.payload?.sameFormula as { rate: number; mixed: number; total: number } | undefined;
  const sameService = insight.payload?.sameService as { rate: number } | undefined;
  const sameVisit = insight.payload?.sameVisit as { rate: number } | undefined;
  const topCombos = (insight.payload?.topCombos as { combo: string; count: number }[]) || [];
  return (
    <Section title="Cross-Brand Mixing" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {[
          { label: "Same-Formula Mixing", value: `${sameFormula?.rate || 0}%`, sub: `${sameFormula?.mixed || 0} of ${sameFormula?.total || 0} formulas` },
          { label: "Same-Service Mixing", value: `${sameService?.rate || 0}%`, sub: "different brands in one service" },
          { label: "Same-Visit Mixing", value: `${sameVisit?.rate || 0}%`, sub: "different brands in one visit" },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center">
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-white">{card.value}</p>
            <p className="mt-1 text-xs text-slate-500">{card.sub}</p>
          </div>
        ))}
      </div>
      {topCombos.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <p className="text-xs text-slate-400 mb-2">Top Brand Combinations</p>
          {topCombos.map((c) => (
            <div key={c.combo} className="flex justify-between text-sm py-1.5 border-b border-white/5 last:border-0">
              <span className="text-white">{c.combo}</span>
              <span className="text-slate-400">{c.count} formulas</span>
            </div>
          ))}
        </div>
      )}
    </Section>
  );
}

function ProductLineSection({ insight }: { insight: UsageInsightItem }) {
  const lines = ((insight.payload?.topProductLines as { label: string; shareByGrams: number; grams: number; clients: number; formulas: number }[]) || []).slice(0, 10);
  return (
    <Section title="Product-Line Adoption" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="space-y-2">
        {lines.map((line, i) => (
          <div key={line.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-500 w-5">{i + 1}</span>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white">{line.label}</span>
                <span className="text-sm font-semibold text-violet-300">{line.shareByGrams}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.min(line.shareByGrams, 100)}%`, backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                <span>{line.clients} clients</span>
                <span>{line.formulas} formulas</span>
                <span>{fmtKg(line.grams)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function FormulaComplexitySection({ insight }: { insight: UsageInsightItem }) {
  const chartData = (insight.payload?.chartData as { name: string; value: number; share: number }[]) || [];
  const avg = insight.payload?.averageComplexity as number | undefined;
  return (
    <Section title="Formula Complexity" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-6xl font-bold text-white">{avg}</p>
            <p className="text-sm text-slate-400 mt-2">avg products per formula</p>
          </div>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} />
              <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
              <Bar dataKey="share" name="% of formulas" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Section>
  );
}

function DeveloperBehaviorSection({ insight }: { insight: UsageInsightItem }) {
  const chartData = ((insight.payload?.chartData as { name: string; share: number; grams: number; formulas: number }[]) || []).slice(0, 8);
  return (
    <Section title="Developer Behavior" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 80 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} unit="%" />
            <YAxis type="category" dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} width={70} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            <Bar dataKey="share" name="% of developer usage" fill="#F59E0B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

function ClientJourneySection({ insight }: { insight: UsageInsightItem }) {
  const journeys = ((insight.payload?.journeys as { clientId: string; visits: { date: string | null; serviceTypes: string[]; detectedShades: string[]; colorFamily?: string }[]; transitionCount: number }[]) || []).slice(0, 10);
  return (
    <Section title="Client Shade Journey" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <p className="text-xs text-amber-400/80 flex items-center gap-1 mb-3"><Lock className="h-3 w-3" /> Detected formula movement — not guaranteed visible hair outcome</p>
      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {journeys.map((j) => (
          <div key={j.clientId} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs text-slate-400 mb-2">{j.clientId} · {j.transitionCount} transitions</p>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {j.visits.map((v, vi) => (
                <div key={vi} className="flex-shrink-0 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 min-w-[120px]">
                  <p className="text-[10px] text-slate-500">{v.date || "Unknown date"}</p>
                  <p className="text-xs text-white mt-0.5">{v.detectedShades.slice(0, 3).join(", ") || "—"}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{v.serviceTypes.join(", ")}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TrendsSection({ insight }: { insight: UsageInsightItem }) {
  const trends = (insight.payload?.monthlyTrends as { month: string; grams: number; crossBrandRate: number; blondeShare: number; brunetteShare: number }[]) || [];
  return (
    <Section title="Trends Over Time" headline={insight.businessHeadline} whyItMatters={insight.whyThisMatters} insight={insight}>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 10 }} />
            <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }} />
            <Legend wrapperStyle={{ fontSize: 11, color: "#fff" }} />
            <Line type="monotone" dataKey="blondeShare" name="Blonde %" stroke="#F59E0B" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="brunetteShare" name="Brunette %" stroke="#8B5CF6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="crossBrandRate" name="Cross-brand %" stroke="#10B981" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Section>
  );
}

// ── Report view ──────────────────────────────────────────────────────────────

function ReportView({ report }: { report: UsageReportSnapshot }) {
  const packet = report.packet;
  const insights = packet.insightItems.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const findings = packet.executiveFindings || [];

  const insightMap = Object.fromEntries(insights.map((i) => [i.insightType, i]));

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/40 p-7">
        <p className="text-xs uppercase tracking-[0.25em] text-violet-300">Customer Usage Intelligence</p>
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-white">What can a color manufacturer learn from real salon usage?</h1>
        <p className="mt-2 text-sm text-slate-400">
          {report.reportTitle} · {formatDate(report.generatedAt)} · {packet.pseudonymousSalonLabel}
        </p>

        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <HeroCard label="Services" value={fmtNum(packet.serviceCount)} />
          <HeroCard label="Formulas" value={fmtNum(packet.formulaCount)} />
          <HeroCard label="Material" value={fmtKg(packet.totalMaterialGrams)} />
          <HeroCard label="Clients" value={fmtNum(packet.clientCount)} />
          <HeroCard label="Brands" value={fmtNum(packet.brandCount)} />
          <HeroCard label="Color Families" value={fmtNum(packet.colorFamilyCount)} />
        </div>

        {/* Executive findings */}
        {findings.length > 0 && (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-emerald-300" />
              <p className="text-sm font-semibold text-emerald-200">Key Findings</p>
            </div>
            <ul className="space-y-2">
              {findings.map((f, i) => (
                <li key={i} className="text-sm text-slate-200 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Privacy badge */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Lock className="h-3 w-3 text-violet-400" />
          <span>Pseudonymous output only. No real names, phones, or CRM IDs exposed.</span>
        </div>
      </div>

      {/* Main insights */}
      {insightMap.most_used_color_families && <ColorFamilySection insight={insightMap.most_used_color_families} />}
      {insightMap.top_shades_by_usage && <TopShadesSection insight={insightMap.top_shades_by_usage} />}
      {insightMap.shades_by_service_type && <ShadesByServiceSection insight={insightMap.shades_by_service_type} />}
      {insightMap.brand_share_of_bowl && <BrandShareSection insight={insightMap.brand_share_of_bowl} />}
      {insightMap.cross_brand_mixing && <CrossBrandSection insight={insightMap.cross_brand_mixing} />}
      {insightMap.product_line_adoption && <ProductLineSection insight={insightMap.product_line_adoption} />}
      {insightMap.formula_complexity && <FormulaComplexitySection insight={insightMap.formula_complexity} />}
      {insightMap.developer_behavior && <DeveloperBehaviorSection insight={insightMap.developer_behavior} />}
      {insightMap.client_shade_journey && <ClientJourneySection insight={insightMap.client_shade_journey} />}
      {insightMap.trends_over_time && <TrendsSection insight={insightMap.trends_over_time} />}

      {/* Data quality & unresolved — collapsed */}
      {(packet.dataQuality.warnings.length > 0 || packet.unresolvedRecords.length > 0) && (
        <DataQualityFooter packet={packet} />
      )}

      <Link to="/admin/usage-intelligence" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/10">
        Back to all reports
      </Link>
    </div>
  );
}

function DataQualityFooter({ packet }: { packet: UsageInsightPacket }) {
  const [open, setOpen] = useState(false);
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-left">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <span className="text-sm font-semibold text-slate-200">Data Quality & Unresolved Records</span>
          <span className="text-xs text-slate-500">{packet.dataQuality.warnings.length} warnings · {packet.unresolvedRecords.length} unresolved</span>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          {packet.dataQuality.warnings.length > 0 && (
            <div className="space-y-1">
              {packet.dataQuality.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-300/70">{w.code}: {w.message}</p>
              ))}
            </div>
          )}
          {packet.unresolvedRecords.length > 0 && (
            <div className="max-h-60 overflow-auto rounded-xl border border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/[0.04] text-slate-400">
                  <tr><th className="px-3 py-2">Product</th><th className="px-3 py-2">Reason</th></tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {packet.unresolvedRecords.slice(0, 50).map((r) => (
                    <tr key={r.id}><td className="px-3 py-1.5">{r.rawProductName}</td><td className="px-3 py-1.5 text-slate-500">{r.reason.replace(/_/g, " ")}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────

export function CustomerUsageIntelligencePage() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [tenant, setTenant] = useState(DEFAULT_TENANT);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<UsageIntelligencePreviewResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<UsageReportListItem[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [report, setReport] = useState<UsageReportSnapshot | null>(null);
  const [reportLoading, setReportLoading] = useState(false);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try { setReports(await listUsageIntelligenceReports()); } catch { setReports([]); }
    finally { setReportsLoading(false); }
  }, []);

  useEffect(() => { loadReports(); }, [loadReports]);

  useEffect(() => {
    if (!reportId) { setReport(null); return; }
    setReportLoading(true);
    getUsageIntelligenceReport(reportId)
      .then(setReport)
      .catch((err) => setError(err?.message || "Failed to load report"))
      .finally(() => setReportLoading(false));
  }, [reportId]);

  const canCreate = useMemo(() => Boolean(file && preview && !creating), [file, preview, creating]);

  async function handleFile(nextFile: File | null) {
    setFile(nextFile); setPreview(null); setError(null);
    if (!nextFile) return;
    setPreviewLoading(true);
    try { setPreview(await previewUsageIntelligence({ file: nextFile, ...tenant })); }
    catch (err: any) { setError(err?.message || "Preview failed"); }
    finally { setPreviewLoading(false); }
  }

  async function handleCreateReport() {
    if (!file || !preview) return;
    setCreating(true); setError(null);
    try {
      const result = await createUsageIntelligenceReport({ file, ...tenant });
      await loadReports();
      navigate(`/admin/usage-intelligence/report/${result.reportId}`);
    } catch (err: any) { setError(err?.message || "Report creation failed"); }
    finally { setCreating(false); }
  }

  if (reportId) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
        <div className="mx-auto max-w-6xl">
          {reportLoading ? (
            <div className="flex min-h-[60vh] items-center justify-center text-slate-300"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading report…</div>
          ) : report ? (
            <ReportView report={report} />
          ) : (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">{error || "Report not found"}</div>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/40 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-violet-300">Generic Multi-Salon Platform</p>
              <h1 className="mt-2 text-4xl font-semibold">Customer Usage Intelligence</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">Upload a salon usage workbook to generate a business intelligence report with charts, insights, and market findings.</p>
            </div>
            <TrendingUp className="h-12 w-12 text-violet-300" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2"><FileSpreadsheet className="h-5 w-5 text-violet-300" /><h2 className="text-lg font-semibold">Upload & Generate Report</h2></div>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              {(["organizationId", "customerAccountId", "salonId"] as const).map((key) => (
                <label key={key} className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{key}</span>
                  <input value={tenant[key]} onChange={(e) => setTenant((p) => ({ ...p, [key]: e.target.value }))} className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-400" />
                </label>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-5">
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
              <button onClick={() => fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400">
                <Upload className="h-4 w-4" />{file ? "Replace workbook" : "Choose workbook"}
              </button>
              {file && <span className="ml-3 text-sm text-slate-300">{file.name}</span>}
            </div>
            {previewLoading && <div className="mt-4 flex items-center gap-2 text-sm text-slate-300"><Loader2 className="h-4 w-4 animate-spin" /> Analyzing…</div>}
            {error && <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>}
            {preview && (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <HeroCard label="Services" value={fmtNum(preview.serviceCount)} />
                  <HeroCard label="Formulas" value={fmtNum(preview.formulaCount)} />
                  <HeroCard label="Clients" value={fmtNum(preview.clientCount)} />
                  <HeroCard label="Date range" value={`${preview.dateRange.start || "—"} → ${preview.dateRange.end || "—"}`} />
                </div>
                <button onClick={handleCreateReport} disabled={!canCreate} className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}Generate Intelligence Report
                </button>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-violet-300" /><h2 className="text-lg font-semibold">Report History</h2></div>
              <button onClick={loadReports} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10"><RefreshCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} /></button>
            </div>
            <div className="mt-4 space-y-3 max-h-[500px] overflow-y-auto">
              {reports.length === 0 && !reportsLoading && <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">No reports yet.</p>}
              {reports.map((item) => (
                <Link key={item.reportId} to={`/admin/usage-intelligence/report/${item.reportId}`} className="block rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-violet-400/50">
                  <p className="text-sm font-semibold text-white">{item.reportTitle}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.pseudonymousSalonLabel} · {formatDate(item.generatedAt)}</p>
                  <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs text-slate-400">
                    <span>{item.serviceCount} svc</span>
                    <span>{item.formulaCount} formulas</span>
                    <span>{item.clientCount} clients</span>
                    <span>{item.unresolvedProductCount} unresolved</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default CustomerUsageIntelligencePage;
