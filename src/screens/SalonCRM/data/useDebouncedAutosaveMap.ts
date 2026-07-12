import { useCallback, useEffect, useRef, useState } from "react";

export type AutosaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

type SaveContext = {
  version: number;
  signal: AbortSignal;
};

type SaveResult<TServer> = {
  server: TServer;
  version: number;
};

type Entry<TDraft> = {
  draft: Partial<TDraft>;
  version: number;
  timer: ReturnType<typeof window.setTimeout> | null;
  controller: AbortController | null;
};

export function useDebouncedAutosaveMap<TKey extends string, TDraft, TServer>({
  debounceMs = 2500,
  save,
  applyServer,
  onError,
}: {
  debounceMs?: number;
  save: (key: TKey, draft: Partial<TDraft>, ctx: SaveContext) => Promise<SaveResult<TServer>>;
  applyServer: (key: TKey, server: TServer) => void;
  onError?: (key: TKey, error: unknown) => void;
}) {
  const entriesRef = useRef(new Map<TKey, Entry<TDraft>>());
  const [statuses, setStatuses] = useState<Record<string, AutosaveStatus>>({});

  const setStatus = useCallback((key: TKey, status: AutosaveStatus) => {
    setStatuses((prev) => ({ ...prev, [key]: status }));
  }, []);

  const flush = useCallback(
    (key: TKey) => {
      const entry = entriesRef.current.get(key);
      if (!entry) return;
      if (entry.timer) window.clearTimeout(entry.timer);
      entry.timer = null;
      entry.controller?.abort();
      entry.controller = new AbortController();
      const version = entry.version;
      const draft = { ...entry.draft };
      setStatus(key, "saving");

      save(key, draft, { version, signal: entry.controller.signal })
        .then((result) => {
          const current = entriesRef.current.get(key);
          if (!current || current.version !== result.version) return;
          entriesRef.current.delete(key);
          applyServer(key, result.server);
          setStatus(key, "saved");
          window.setTimeout(() => {
            setStatuses((prev) => (prev[key] === "saved" ? { ...prev, [key]: "idle" } : prev));
          }, 1800);
        })
        .catch((error) => {
          if (entry.controller?.signal.aborted) return;
          setStatus(key, "error");
          onError?.(key, error);
        });
    },
    [applyServer, onError, save, setStatus],
  );

  const edit = useCallback(
    (key: TKey, patch: Partial<TDraft>) => {
      const prev = entriesRef.current.get(key);
      if (prev?.timer) window.clearTimeout(prev.timer);
      const next: Entry<TDraft> = {
        draft: { ...(prev?.draft ?? {}), ...patch },
        version: (prev?.version ?? 0) + 1,
        timer: null,
        controller: prev?.controller ?? null,
      };
      next.timer = window.setTimeout(() => flush(key), debounceMs);
      entriesRef.current.set(key, next);
      setStatus(key, "dirty");
    },
    [debounceMs, flush, setStatus],
  );

  const retry = useCallback(
    (key: TKey) => {
      if (entriesRef.current.has(key)) flush(key);
    },
    [flush],
  );

  useEffect(() => {
    return () => {
      entriesRef.current.forEach((entry) => {
        if (entry.timer) window.clearTimeout(entry.timer);
        entry.controller?.abort();
      });
      entriesRef.current.clear();
    };
  }, []);

  const hasPending = Object.values(statuses).some((status) => status === "dirty" || status === "saving");

  return {
    status: (key: TKey): AutosaveStatus => statuses[key] ?? "idle",
    edit,
    retry,
    flush,
    hasPending,
  };
}
