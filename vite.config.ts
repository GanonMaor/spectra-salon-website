/// <reference types="node" />

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import path from "path";
import { visualizer } from 'rollup-plugin-visualizer';
import viteCompression from 'vite-plugin-compression';
import viteImagemin from 'vite-plugin-imagemin';

const shouldOptimizeImages = process.env.GITHUB_ACTIONS !== "true";

const DEFAULT_FUNCTIONS_PROXY = "http://127.0.0.1:9999";
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

/**
 * The dev proxy only ever targets a local functions server. Falling back to the
 * production site would let a local mutation silently reach production data, so
 * an unavailable local server must fail instead.
 */
function resolveFunctionsProxyTarget(): string {
  const configured = process.env.VITE_FUNCTIONS_PROXY?.trim();
  if (!configured) return DEFAULT_FUNCTIONS_PROXY;
  try {
    if (LOOPBACK_HOSTS.has(new URL(configured).hostname)) return configured;
  } catch {
    /* fall through to the loopback default */
  }
  console.error(
    `[vite] Ignoring VITE_FUNCTIONS_PROXY="${configured}": the functions proxy only targets a local server.`,
  );
  return DEFAULT_FUNCTIONS_PROXY;
}

export default defineConfig({
  plugins: [
    react(),
    viteCompression(),
    ...(shouldOptimizeImages
      ? [
          viteImagemin({
            gifsicle: { optimizationLevel: 3 },
            optipng: { optimizationLevel: 5 },
            mozjpeg: { quality: 75 },
            pngquant: { quality: [0.65, 0.9], speed: 4 },
            svgo: { plugins: [{ name: 'removeViewBox' }, { name: 'removeEmptyAttrs', active: false }] },
          }),
        ]
      : []),
    visualizer({ open: false }),
  ],
  base: "/",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist",
    sourcemap: true,
    minify: "esbuild",
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
          charts: ["recharts"],
          maps: ["@react-google-maps/api"],
        },
      },
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/.netlify/functions": {
        // Local only: VITE_FUNCTIONS_PROXY=http://127.0.0.1:9999
        // (scripts/local-functions-server.js). There is no production fallback.
        target: resolveFunctionsProxyTarget(),
        changeOrigin: true,
        secure: false,
        // CRM bootstrap for Maor's salon is ~15MB and can take several seconds.
        timeout: 180_000,
        proxyTimeout: 180_000,
      },
    },
  },
});
