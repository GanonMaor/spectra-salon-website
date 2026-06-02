import React, { useEffect, useMemo, useState } from "react";
import {
  ALL_ASSETS,
  assetUrl,
  assetSiblingUrl,
  assetFormat,
  type AssetSpec,
  type AssetPriority,
} from "./assetManifest";
import { COLORS } from "./tokens";

const IS_DEV = Boolean((import.meta as any)?.env?.DEV);

type ProbeStatus = "checking" | "found" | "missing";

/**
 * Probe a public URL. Considered "found" only when the server returns OK and
 * the content-type is not the SPA HTML fallback (which would be a false hit).
 */
async function probe(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", cache: "no-store" });
    if (!res.ok) return false;
    const type = res.headers.get("content-type") || "";
    return !type.includes("text/html");
  } catch {
    return false;
  }
}

const PRIORITY_COLOR: Record<AssetPriority, string> = {
  critical: COLORS.gold,
  recommended: COLORS.goldSoft,
  optional: COLORS.textDim,
};

interface Row {
  spec: AssetSpec;
  status: ProbeStatus;
  siblings: { file: string; status: ProbeStatus }[];
}

/**
 * Dev-only asset intake / QA checklist for the Spectra Product & Vision page.
 * Route: /spectra-product-vision/assets-check
 *
 * Reads the manifest and live-probes each expected file under
 * public/investor-vision/, so you can see at a glance what is found vs missing
 * before dropping in real assets. Renders nothing useful in production.
 */
export const AssetCheckPage: React.FC = () => {
  const [rows, setRows] = useState<Row[]>(() =>
    ALL_ASSETS.map((spec) => ({
      spec,
      status: "checking" as ProbeStatus,
      siblings: [
        ...(spec.file2x ? [{ file: spec.file2x, status: "checking" as ProbeStatus }] : []),
        ...(spec.poster ? [{ file: spec.poster, status: "checking" as ProbeStatus }] : []),
      ],
    })),
  );

  useEffect(() => {
    if (!IS_DEV) return;
    let cancelled = false;
    (async () => {
      const next = await Promise.all(
        ALL_ASSETS.map(async (spec) => {
          const status: ProbeStatus = (await probe(assetUrl(spec))) ? "found" : "missing";
          const siblingFiles = [spec.file2x, spec.poster].filter(Boolean) as string[];
          const siblings = await Promise.all(
            siblingFiles.map(async (file) => ({
              file,
              status: ((await probe(assetSiblingUrl(spec, file))) ? "found" : "missing") as ProbeStatus,
            })),
          );
          return { spec, status, siblings };
        }),
      );
      if (!cancelled) setRows(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const summary = useMemo(() => {
    const by = (p: AssetPriority) => rows.filter((r) => r.spec.priority === p);
    const found = (rs: Row[]) => rs.filter((r) => r.status === "found").length;
    const crit = by("critical");
    const rec = by("recommended");
    const opt = by("optional");
    return {
      critical: { found: found(crit), total: crit.length },
      recommended: { found: found(rec), total: rec.length },
      optional: { found: found(opt), total: opt.length },
    };
  }, [rows]);

  const sections = useMemo(() => {
    const map = new Map<string, Row[]>();
    for (const row of rows) {
      const list = map.get(row.spec.section) ?? [];
      list.push(row);
      map.set(row.spec.section, list);
    }
    return Array.from(map.entries());
  }, [rows]);

  if (!IS_DEV) {
    return (
      <main
        className="min-h-[100dvh] flex items-center justify-center"
        style={{ background: COLORS.black, color: COLORS.textDim }}
      >
        <p style={{ fontSize: 14 }}>Asset check is available in development only.</p>
      </main>
    );
  }

  const statusPill = (status: ProbeStatus) => {
    const color =
      status === "found" ? "#34C759" : status === "missing" ? "#FF6B6B" : COLORS.textDim;
    const label = status === "found" ? "found" : status === "missing" ? "missing" : "…";
    return (
      <span
        className="uppercase rounded-full px-2 py-0.5"
        style={{ fontSize: 10, letterSpacing: "0.12em", color, border: `1px solid ${color}55` }}
      >
        {label}
      </span>
    );
  };

  return (
    <main
      className="min-h-[100dvh] w-full"
      style={{ background: COLORS.black, color: COLORS.warmWhite }}
    >
      <div className="mx-auto max-w-[1100px] px-6 py-12">
        <p
          className="uppercase mb-2"
          style={{ fontSize: 11, letterSpacing: "0.22em", color: COLORS.textDim }}
        >
          Dev tool · Asset intake
        </p>
        <h1 className="font-bold mb-2" style={{ fontSize: 32, color: COLORS.warmWhite }}>
          Spectra Product &amp; Vision — Asset Check
        </h1>
        <p className="mb-8" style={{ fontSize: 14, color: COLORS.textMuted }}>
          Drop files into <code>public/investor-vision/&lt;section&gt;/&lt;filename&gt;</code>,
          then refresh. See <code>investor-assets/ASSET_INTAKE_GUIDE.md</code>.
        </p>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {([
            ["Critical", summary.critical, COLORS.gold],
            ["Recommended", summary.recommended, COLORS.goldSoft],
            ["Optional", summary.optional, COLORS.textDim],
          ] as const).map(([label, s, color]) => (
            <div
              key={label}
              className="rounded-2xl px-5 py-5"
              style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}` }}
            >
              <p
                className="uppercase mb-1"
                style={{ fontSize: 11, letterSpacing: "0.16em", color }}
              >
                {label}
              </p>
              <p style={{ fontSize: 26, fontWeight: 700, color: COLORS.warmWhite }}>
                {s.found}
                <span style={{ fontSize: 16, color: COLORS.textDim }}> / {s.total}</span>
              </p>
              <p style={{ fontSize: 12, color: COLORS.textDim }}>
                {s.total - s.found} missing
              </p>
            </div>
          ))}
        </div>

        {/* Per-section tables */}
        {sections.map(([section, list]) => (
          <section key={section} className="mb-8">
            <h2
              className="uppercase mb-3"
              style={{ fontSize: 12, letterSpacing: "0.18em", color: COLORS.gold }}
            >
              {section}
            </h2>
            <div
              className="rounded-2xl overflow-hidden"
              style={{ border: `1px solid ${COLORS.panelBorder}` }}
            >
              {list.map((row, i) => (
                <div
                  key={row.spec.id}
                  className="grid items-center gap-3 px-4 py-3"
                  style={{
                    gridTemplateColumns: "1.4fr 1.6fr 0.9fr 0.7fr 0.9fr 0.8fr",
                    background: i % 2 ? "rgba(255,255,255,0.02)" : "transparent",
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: COLORS.warmWhite }}>{row.spec.name}</span>
                  <code style={{ color: COLORS.textMuted, wordBreak: "break-all" }}>
                    {row.spec.file}
                  </code>
                  <span style={{ color: COLORS.textDim }}>{row.spec.dims}</span>
                  <span style={{ color: COLORS.textDim }}>{assetFormat(row.spec)}</span>
                  <span style={{ color: PRIORITY_COLOR[row.spec.priority] }}>
                    {row.spec.priority}
                  </span>
                  <span className="flex flex-col items-start gap-1">
                    {statusPill(row.status)}
                    {row.siblings.map((sib) => (
                      <span
                        key={sib.file}
                        className="flex items-center gap-1"
                        style={{ fontSize: 9, color: COLORS.textDim }}
                        title={sib.file}
                      >
                        {sib.file.includes("@2x") ? "@2x" : "poster"} {statusPill(sib.status)}
                      </span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        ))}

        <p className="mt-8" style={{ fontSize: 12, color: COLORS.textDim }}>
          Expected base path: <code>/investor-vision/&lt;section&gt;/</code> · CLI:{" "}
          <code>npm run check:investor-assets</code>
        </p>
      </div>
    </main>
  );
};
