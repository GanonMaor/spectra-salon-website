import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  FileSpreadsheet,
  Loader2,
  Lock,
  RefreshCw,
  ShieldCheck,
  Upload,
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
} from "../../lib/types/customerUsageIntelligence";

const DEFAULT_TENANT = {
  organizationId: "org-default",
  customerAccountId: "customer-default",
  salonId: "salon-validation-a",
};

const SUPPORT_STYLE: Record<string, string> = {
  supported: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  partially_supported: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  not_supported: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function MetricCard({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}

function InsightCard({ insight }: { insight: UsageInsightItem }) {
  const supportClass = SUPPORT_STYLE[insight.supportStatus] || SUPPORT_STYLE.not_supported;
  return (
    <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-violet-300">
            {String(insight.insightType).replace(/_/g, " ")}
          </p>
          <h3 className="mt-1 text-xl font-semibold text-white">{insight.title}</h3>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-medium ${supportClass}`}>
          {insight.supportStatus.replace("_", " ")}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-300">{insight.summary}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">
        <MetricCard label="Metric" value={insight.metricValue ?? "—"} hint={insight.metricUnit || undefined} />
        <MetricCard label="Confidence" value={insight.confidence} />
        <MetricCard label="Numerator" value={insight.numerator ?? "—"} />
        <MetricCard label="Denominator" value={insight.denominator ?? "—"} />
      </div>
      <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">Calculation</p>
        <p className="mt-1 text-sm text-slate-300">{insight.calculationDefinition}</p>
        <p className="mt-2 text-xs text-slate-500">{insight.unresolvedDataEffect}</p>
      </div>
    </section>
  );
}

function ReportView({ report }: { report: UsageReportSnapshot }) {
  const packet = report.packet;
  const visibleInsights = packet.insightItems.slice().sort((a, b) => a.displayOrder - b.displayOrder);
  const supported = visibleInsights.filter((i) => i.supportStatus === "supported").length;
  const partial = visibleInsights.filter((i) => i.supportStatus === "partially_supported").length;
  const unsupported = visibleInsights.filter((i) => i.supportStatus === "not_supported").length;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-violet-500/20 bg-gradient-to-br from-slate-950 via-slate-950 to-violet-950/40 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-violet-300">Customer Usage Intelligence</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">{report.reportTitle}</h1>
            <p className="mt-2 text-sm text-slate-400">
              Immutable report · {formatDate(report.generatedAt)} · {packet.pseudonymousCustomerLabel} · {packet.pseudonymousSalonLabel}
            </p>
          </div>
          <Link
            to="/admin/usage-intelligence"
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10"
          >
            Back to reports
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <MetricCard label="Services" value={packet.serviceCount.toLocaleString()} />
          <MetricCard label="Formulas" value={packet.formulaCount.toLocaleString()} />
          <MetricCard label="Clients" value={packet.clientCount.toLocaleString()} />
          <MetricCard label="Resolved Rows" value={packet.resolvedProductCount.toLocaleString()} />
          <MetricCard label="Unresolved Rows" value={packet.unresolvedProductCount.toLocaleString()} />
          <MetricCard label="Date Range" value={`${packet.dateRange.start || "—"} → ${packet.dateRange.end || "—"}`} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <p className="text-sm font-semibold text-emerald-200">Supported insights</p>
          <p className="mt-2 text-4xl font-bold text-white">{supported}</p>
        </div>
        <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-sm font-semibold text-amber-200">Partially supported</p>
          <p className="mt-2 text-4xl font-bold text-white">{partial}</p>
        </div>
        <div className="rounded-3xl border border-slate-500/20 bg-slate-500/10 p-5">
          <p className="text-sm font-semibold text-slate-200">Not supported</p>
          <p className="mt-2 text-4xl font-bold text-white">{unsupported}</p>
        </div>
      </div>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
        <div className="flex items-center gap-2 text-slate-200">
          <Lock className="h-4 w-4 text-violet-300" />
          <h2 className="font-semibold">Privacy and data guardrails</h2>
        </div>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Manufacturer-facing output uses pseudonymous salon and client labels only. This report does not expose customer account names,
          salon names, profile/operator names, phone numbers, CRM identifiers, or end-client names.
        </p>
      </section>

      {packet.dataQuality.warnings.length > 0 ? (
        <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center gap-2 text-amber-200">
            <AlertTriangle className="h-4 w-4" />
            <h2 className="font-semibold">Data quality warnings</h2>
          </div>
          <div className="mt-3 grid gap-2">
            {packet.dataQuality.warnings.map((warning, idx) => (
              <p key={`${warning.code}-${idx}`} className="rounded-xl border border-amber-500/20 bg-black/20 px-3 py-2 text-sm text-amber-100">
                <span className="font-mono text-xs text-amber-300">{warning.code}</span> · {warning.message}
              </p>
            ))}
          </div>
        </section>
      ) : null}

      <div className="space-y-4">
        {visibleInsights.map((insight) => (
          <InsightCard key={insight.id} insight={insight} />
        ))}
      </div>

      {packet.unresolvedRecords.length > 0 ? (
        <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-5">
          <h2 className="text-lg font-semibold text-white">Unresolved Product Truth Records</h2>
          <p className="mt-1 text-sm text-slate-400">
            These rows remain included in raw fallback buckets, but Product Truth-specific precision is reduced until reviewed.
          </p>
          <div className="mt-4 max-h-80 overflow-auto rounded-2xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/[0.04] text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-4 py-3">Row</th>
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Effect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-300">
                {packet.unresolvedRecords.slice(0, 100).map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 text-slate-500">{record.sourceRowIndex ?? "—"}</td>
                    <td className="px-4 py-3">{record.rawProductName}</td>
                    <td className="px-4 py-3">{record.reason}</td>
                    <td className="px-4 py-3 text-slate-400">{record.effect}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}

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
    try {
      setReports(await listUsageIntelligenceReports());
    } catch {
      setReports([]);
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    if (!reportId) {
      setReport(null);
      return;
    }
    setReportLoading(true);
    getUsageIntelligenceReport(reportId)
      .then(setReport)
      .catch((err) => setError(err?.message || "Failed to load report"))
      .finally(() => setReportLoading(false));
  }, [reportId]);

  const canCreate = useMemo(() => Boolean(file && preview && !creating), [file, preview, creating]);

  async function handleFile(nextFile: File | null) {
    setFile(nextFile);
    setPreview(null);
    setError(null);
    if (!nextFile) return;
    setPreviewLoading(true);
    try {
      setPreview(await previewUsageIntelligence({ file: nextFile, ...tenant }));
    } catch (err: any) {
      setError(err?.message || "Preview failed");
    } finally {
      setPreviewLoading(false);
    }
  }

  async function handleCreateReport() {
    if (!file || !preview) return;
    setCreating(true);
    setError(null);
    try {
      const result = await createUsageIntelligenceReport({ file, ...tenant });
      await loadReports();
      navigate(`/admin/usage-intelligence/report/${result.reportId}`);
    } catch (err: any) {
      setError(err?.message || "Report creation failed");
    } finally {
      setCreating(false);
    }
  }

  if (reportId) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-6 text-white md:px-8">
        {reportLoading ? (
          <div className="flex min-h-[60vh] items-center justify-center text-slate-300">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading immutable report…
          </div>
        ) : report ? (
          <ReportView report={report} />
        ) : (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-6 text-red-200">{error || "Report not found"}</div>
        )}
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
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
                Upload a salon usage workbook, preview normalized facts, commit an immutable report, and calculate the ten L'Oréal-facing insights from real formula usage only.
              </p>
            </div>
            <ShieldCheck className="h-12 w-12 text-violet-300" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-violet-300" />
              <h2 className="text-lg font-semibold">Upload and generate report</h2>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
              {(["organizationId", "customerAccountId", "salonId"] as const).map((key) => (
                <label key={key} className="block">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-slate-500">{key}</span>
                  <input
                    value={tenant[key]}
                    onChange={(event) => setTenant((prev) => ({ ...prev, [key]: event.target.value }))}
                    className="mt-1 w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-violet-400"
                  />
                </label>
              ))}
            </div>

            <div className="mt-5 rounded-2xl border border-dashed border-violet-500/30 bg-violet-500/5 p-5">
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(event) => handleFile(event.target.files?.[0] || null)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
              >
                <Upload className="h-4 w-4" />
                {file ? "Replace workbook" : "Choose workbook"}
              </button>
              {file ? <span className="ml-3 text-sm text-slate-300">{file.name}</span> : null}
              <p className="mt-3 text-xs text-slate-500">
                The core engine consumes normalized facts only. Parser-specific workbook details stay inside parser profiles.
              </p>
            </div>

            {previewLoading ? (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-300">
                <Loader2 className="h-4 w-4 animate-spin" /> Detecting parser profile and validating facts…
              </div>
            ) : null}

            {error ? (
              <div className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</div>
            ) : null}

            {preview ? (
              <div className="mt-5 space-y-4">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <MetricCard label="Parser profile" value={preview.parserProfileName} hint={`${Math.round(preview.detectionScore * 100)}% match`} />
                  <MetricCard label="Services" value={preview.serviceCount.toLocaleString()} />
                  <MetricCard label="Formulas" value={preview.formulaCount.toLocaleString()} />
                  <MetricCard label="Clients" value={preview.clientCount.toLocaleString()} />
                  <MetricCard label="Accepted rows" value={preview.acceptedRowCount.toLocaleString()} />
                  <MetricCard label="Rejected rows" value={preview.rejectedRowCount.toLocaleString()} />
                  <MetricCard label="Visits" value={preview.visitCount.toLocaleString()} />
                  <MetricCard label="Date range" value={`${preview.dateRange.start || "—"} → ${preview.dateRange.end || "—"}`} />
                </div>

                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <h3 className="text-sm font-semibold text-white">Supported insight preview</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {Object.entries(preview.supportStatuses).map(([key, status]) => (
                      <span key={key} className={`rounded-full border px-3 py-1 text-xs ${SUPPORT_STYLE[status] || SUPPORT_STYLE.not_supported}`}>
                        {key.replace(/_/g, " ")} · {status.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Inventory, purchasing, dead stock, stock-out and reorder metrics are excluded until those datasets exist.
                  </p>
                </div>

                <button
                  onClick={handleCreateReport}
                  disabled={!canCreate}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Generate immutable intelligence report
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-violet-300" />
                <h2 className="text-lg font-semibold">Saved report history</h2>
              </div>
              <button onClick={loadReports} className="rounded-lg border border-white/10 p-2 text-slate-300 hover:bg-white/10">
                <RefreshCw className={`h-4 w-4 ${reportsLoading ? "animate-spin" : ""}`} />
              </button>
            </div>
            <div className="mt-4 space-y-3">
              {reports.length === 0 && !reportsLoading ? (
                <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
                  No immutable reports yet. Upload a supported workbook to create the first one.
                </p>
              ) : null}
              {reports.map((item) => (
                <Link
                  key={item.reportId}
                  to={`/admin/usage-intelligence/report/${item.reportId}`}
                  className="block rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-violet-400/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{item.reportTitle}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {item.pseudonymousSalonLabel} · {formatDate(item.generatedAt)}
                      </p>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-wider text-slate-400">
                      {item.reportStatus}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs text-slate-400">
                    <span>{item.serviceCount} services</span>
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
