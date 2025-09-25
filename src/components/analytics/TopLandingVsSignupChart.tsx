import * as React from "react";
import {
  BarChart,
  Bar,
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
  landing_path: string | null;
  signup_path: string | null;
  leads: number | string;
};

type Props = {
  limit?: number;
  className?: string;
};

export default function TopLandingVsSignupChart({ limit = 5, className }: Props) {
  const [rows, setRows] = React.useState<ApiRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(
          "/.netlify/functions/leads?summary=landing_vs_signup_30d&unique=true",
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
    const items = (rows || []).map((r) => {
      const landing = r.landing_path || "—";
      const signup = r.signup_path || "—";
      const leads = typeof r.leads === "string" ? parseInt(r.leads, 10) : (r.leads || 0);
      return { label: `${landing} → ${signup}`, leads };
    });
    items.sort((a, b) => b.leads - a.leads);
    return items.slice(0, Math.max(1, limit));
  }, [rows, limit]);

  return (
    <Card className={className}>
      <CardHeader className="pb-0">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Top Landing ↔ Signup (30d)</CardTitle>
          <span className="rounded bg-green-50 px-2 py-0.5 text-xs text-green-700">Unique leads</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {loading ? (
          <div className="h-56 animate-pulse rounded-lg bg-gray-100" />
        ) : error ? (
          <div className="text-sm text-red-600">Failed to load: {error}</div>
        ) : data.length === 0 ? (
          <div className="text-sm text-gray-500">No data in the last 30 days.</div>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 40 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="label" interval={0} angle={-20} textAnchor="end" height={48} tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: any) => [v, "Leads"]} labelFormatter={(label) => label} />
                <Bar dataKey="leads" radius={[6, 6, 0, 0]} fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
