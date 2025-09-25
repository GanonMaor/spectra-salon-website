import * as React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { getAuthHeader } from "@/api/client";

// Fallback minimal Card primitives since shadcn Card is not present
function Card(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`rounded-lg border bg-white ${props.className || ""}`}>{props.children}</div>;
}
function CardHeader(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`px-4 pt-4 ${props.className || ""}`}>{props.children}</div>;
}
function CardTitle(props: React.PropsWithChildren<{ className?: string }>) {
  return <h3 className={`text-lg font-semibold ${props.className || ""}`}>{props.children}</h3>;
}
function CardContent(props: React.PropsWithChildren<{ className?: string }>) {
  return <div className={`px-4 pb-4 ${props.className || ""}`}>{props.children}</div>;
}

type ApiRow = {
  date: string;
  leads: number | string;
};

type Props = {
  className?: string;
};

export default function LeadsPerDayChart({ className }: Props) {
  const [rows, setRows] = React.useState<ApiRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          "/.netlify/functions/leads?summary=leads_per_day_30d&unique=true",
          { headers: { "Content-Type": "application/json", ...getAuthHeader() } },
        );
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setRows(Array.isArray(data.rows) ? data.rows : []);
      } catch (e: any) {
        setError(e?.message || "Failed to load");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const data = React.useMemo(() => {
    return (rows || []).map((r) => ({
      date: new Date(r.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      leads: typeof r.leads === "string" ? parseInt(r.leads, 10) : (r.leads || 0),
    }));
  }, [rows]);

  return (
    <div className={`h-full ${className || ""}`}>
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-white font-medium text-sm">Leads per Day (30d)</h3>
          <span className="rounded bg-orange-500/20 px-2 py-0.5 text-xs text-orange-200 border border-orange-400/30">Unique leads</span>
        </div>
      </div>
      <div className="flex-1">
        {loading ? (
          <div className="h-56 animate-pulse rounded-lg bg-white/10" />
        ) : error ? (
          <div className="text-sm text-red-400">Failed to load: {error}</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-white/60">No data in the last 30 days.</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 24 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [v, "Leads"]} labelFormatter={(label) => `Date: ${label}`} />
                <Line 
                  type="monotone" 
                  dataKey="leads" 
                  stroke="#f97316" 
                  strokeWidth={3} 
                  dot={{ fill: "#f97316", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: "#f97316", strokeWidth: 2, fill: "#fb923c" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
