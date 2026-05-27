/**
 * scripts/lib/product-catalog/db-snapshot.js
 * ---------------------------------------------------------------
 * Persistent storage for the latest uploaded DB export.
 *
 * The Catalog Import flow used to require the operator to attach
 * the DB export with every customer-request preview. Now we save
 * the latest export once and reuse it for every subsequent preview
 * until the operator uploads a new one.
 *
 * Storage backend:
 *   - Netlify Blobs (`@netlify/blobs`) when running inside a Netlify
 *     function. The blob payload is JSON-serialized; we keep the
 *     raw .xlsx buffer in a separate blob so we can re-export the
 *     exact same headers/sheet name.
 *   - In-process memory as a fallback (for jest / dev / when blobs
 *     are not configured). The in-memory copy outlives a single
 *     request when the function is warm.
 *
 * The shape we persist:
 * {
 *   fileName: string
 *   sheetName: string
 *   uploadedAt: string (ISO)
 *   rowCount: number
 *   originalHeaders: string[]     // verbatim header row from the file
 *   rows: CanonicalProductRow[]   // parsed canonical rows for matching
 *   brands: string[]
 *   seriesByBrand: Record<string, string[]>
 *   bufferB64: string             // optional raw xlsx (capped 6 MB)
 * }
 */

"use strict";

const STORE_NAME = "product-catalog-db-snapshot";
const META_KEY = "latest";
const BUFFER_KEY = "latest.xlsx";
const MAX_BUFFER_BYTES = 6 * 1024 * 1024;

let MEMORY_CACHE = {
  meta: null,
  buffer: null,
};

function tryGetStore() {
  try {
    const blobs = require("@netlify/blobs");
    if (typeof blobs.getStore === "function") {
      return blobs.getStore({ name: STORE_NAME, consistency: "strong" });
    }
  } catch (_) {
    // fall through to memory backend
  }
  return null;
}

async function saveSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== "object") {
    throw new Error("saveSnapshot requires a snapshot object");
  }
  const buffer = snapshot.bufferB64 || null;
  const meta = { ...snapshot };
  delete meta.bufferB64;
  meta.savedAt = new Date().toISOString();

  MEMORY_CACHE = {
    meta,
    buffer: buffer || null,
  };

  const store = tryGetStore();
  if (store) {
    try {
      await store.setJSON(META_KEY, meta);
      if (buffer && buffer.length <= ((MAX_BUFFER_BYTES * 4) / 3 + 16)) {
        await store.set(BUFFER_KEY, buffer);
      } else if (!buffer) {
        // Allow callers to clear an old buffer when re-saving meta only.
        try {
          await store.delete(BUFFER_KEY);
        } catch (_) {
          /* ignore */
        }
      }
    } catch (err) {
      // Blob persistence failed (probably running locally without
      // blob credentials). The in-memory copy still works for the
      // current warm container.
      meta._blobError = err && err.message ? err.message : String(err);
    }
  }
  return meta;
}

async function loadSnapshot({ withBuffer = false } = {}) {
  // Prefer fresh blobs; fall back to memory.
  const store = tryGetStore();
  if (store) {
    try {
      const meta = await store.get(META_KEY, { type: "json" });
      if (meta) {
        let buffer = null;
        if (withBuffer) {
          buffer = await store.get(BUFFER_KEY, { type: "text" });
        }
        return { meta, buffer: buffer || null };
      }
    } catch (_) {
      /* ignore — fall back to memory */
    }
  }
  if (MEMORY_CACHE.meta) {
    return {
      meta: MEMORY_CACHE.meta,
      buffer: withBuffer ? MEMORY_CACHE.buffer : null,
    };
  }
  return { meta: null, buffer: null };
}

async function clearSnapshot() {
  MEMORY_CACHE = { meta: null, buffer: null };
  const store = tryGetStore();
  if (store) {
    try {
      await store.delete(META_KEY);
    } catch (_) {
      /* ignore */
    }
    try {
      await store.delete(BUFFER_KEY);
    } catch (_) {
      /* ignore */
    }
  }
}

function toPublicMeta(meta) {
  if (!meta) return null;
  return {
    fileName: meta.fileName || null,
    sheetName: meta.sheetName || null,
    uploadedAt: meta.uploadedAt || null,
    savedAt: meta.savedAt || null,
    rowCount: meta.rowCount || 0,
    originalHeaders: Array.isArray(meta.originalHeaders) ? meta.originalHeaders : [],
    brands: Array.isArray(meta.brands) ? meta.brands : [],
    seriesByBrand: meta.seriesByBrand || {},
  };
}

module.exports = {
  saveSnapshot,
  loadSnapshot,
  clearSnapshot,
  toPublicMeta,
  STORE_NAME,
  META_KEY,
  BUFFER_KEY,
};
