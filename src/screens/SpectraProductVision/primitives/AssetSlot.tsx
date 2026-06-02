import React, { useState } from "react";
import type { AssetSpec } from "../assetManifest";
import { assetUrl, assetSiblingUrl, assetSrcSet } from "../assetManifest";
import { COLORS } from "../tokens";

interface AssetSlotProps {
  asset: AssetSpec;
  alt: string;
  /** CSS aspect-ratio to reserve space and avoid layout shift, e.g. "16 / 9". */
  aspectRatio?: string;
  className?: string;
  /** Object-fit for raster/video. */
  fit?: "cover" | "contain";
  /** Lazy-load (default true). Set false for above-the-fold hero. */
  lazy?: boolean;
  /** Decorative-only media (alt ignored by AT). */
  decorative?: boolean;
  /**
   * Code-generated visual to show until (and unless) the real asset loads.
   * When provided, this REPLACES the dev "asset pending" frame and the prod
   * "render nothing" behavior: the fallback shows immediately, and if/when the
   * real file is present it crossfades in on top. This is how Phase 2A code
   * visuals are safely enhanced/replaced by the final asset pack later.
   */
  fallback?: React.ReactNode;
}

const IS_DEV = Boolean((import.meta as any)?.env?.DEV);

type State = "pending" | "ready" | "missing";

/**
 * Renders a manifest asset, or degrades gracefully when the file is absent.
 *
 *  - Asset loads → shows the image/video (with @2x via srcSet when available).
 *  - `fallback` provided → fallback shows until the asset loads, then the asset
 *    crossfades over it. If the asset never arrives, the fallback simply stays.
 *  - No fallback + MISSING:
 *      • development → a clean empty-state frame naming the expected asset.
 *      • production  → renders nothing (the section's copy/layout stands alone).
 */
export const AssetSlot: React.FC<AssetSlotProps> = ({
  asset,
  alt,
  aspectRatio,
  className = "",
  fit = "cover",
  lazy = true,
  decorative = false,
  fallback,
}) => {
  const [state, setState] = useState<State>("pending");

  const url = assetUrl(asset);
  const posterUrl = asset.poster ? assetSiblingUrl(asset, asset.poster) : undefined;
  const wrapperStyle: React.CSSProperties = { aspectRatio: aspectRatio ?? undefined };
  const mediaClass = `block w-full h-full ${fit === "cover" ? "object-cover" : "object-contain"}`;
  const srcSet = asset.kind === "image" ? assetSrcSet(asset) : undefined;
  const hasFallback = fallback !== undefined && fallback !== null;

  // ── With a code-generated fallback: always render the fallback, and probe
  //    the real asset in the background; crossfade it in when ready. ──────────
  if (hasFallback) {
    return (
      <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: state === "ready" ? 0 : 1 }}
          aria-hidden={state === "ready"}
        >
          {fallback}
        </div>
        {asset.kind === "video" ? (
          <video
            className={`${mediaClass} absolute inset-0 transition-opacity duration-700`}
            style={{ opacity: state === "ready" ? 1 : 0 }}
            autoPlay
            muted
            loop
            playsInline
            preload={lazy ? "none" : "metadata"}
            poster={posterUrl}
            onError={() => setState("missing")}
            onCanPlay={() => setState("ready")}
            aria-hidden
          >
            <source src={url} onError={() => setState("missing")} />
          </video>
        ) : (
          <img
            src={url}
            srcSet={srcSet}
            alt={decorative ? "" : alt}
            aria-hidden={decorative || state !== "ready"}
            className={`${mediaClass} absolute inset-0 transition-opacity duration-700`}
            style={{ opacity: state === "ready" ? 1 : 0 }}
            loading={lazy ? "lazy" : "eager"}
            decoding="async"
            draggable={false}
            onLoad={() => setState("ready")}
            onError={() => setState("missing")}
          />
        )}
      </div>
    );
  }

  // ── No fallback: original graceful-degradation behavior. ───────────────────
  if (state === "missing" && !IS_DEV) {
    return null;
  }

  if (state === "missing" && IS_DEV) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl ${className}`}
        style={{
          ...wrapperStyle,
          border: `1px dashed ${COLORS.panelBorder}`,
          background:
            "radial-gradient(120% 120% at 50% 0%, rgba(234,183,118,0.06), rgba(0,0,0,0) 60%)",
        }}
        data-asset-missing={asset.id}
        role="img"
        aria-label={`${alt} (asset pending)`}
      >
        <div className="px-6 py-5 text-center max-w-[80%]">
          <div className="mx-auto mb-3 rounded-full" style={{ width: 8, height: 8, background: COLORS.gold }} />
          <p className="font-medium uppercase mb-1" style={{ fontSize: 11, letterSpacing: "0.18em", color: COLORS.textDim }}>
            asset pending
          </p>
          <p className="font-medium mb-1" style={{ fontSize: 14, color: COLORS.warmWhite }}>
            {asset.name}
          </p>
          <code className="block" style={{ fontSize: 11, color: COLORS.textMuted, wordBreak: "break-all" }}>
            {url}
          </code>
          <p style={{ fontSize: 10, color: COLORS.textDim, marginTop: 6 }}>
            {asset.priority} · {asset.kind}
          </p>
        </div>
      </div>
    );
  }

  if (asset.kind === "video") {
    return (
      <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
        <video
          className={mediaClass}
          autoPlay
          muted
          loop
          playsInline
          preload={lazy ? "none" : "metadata"}
          poster={posterUrl}
          onError={() => setState("missing")}
          onCanPlay={() => setState("ready")}
          aria-hidden={decorative}
        >
          <source src={url} onError={() => setState("missing")} />
        </video>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} style={wrapperStyle}>
      <img
        src={url}
        srcSet={srcSet}
        alt={decorative ? "" : alt}
        aria-hidden={decorative}
        className={mediaClass}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        draggable={false}
        onLoad={() => setState("ready")}
        onError={() => setState("missing")}
      />
    </div>
  );
};
