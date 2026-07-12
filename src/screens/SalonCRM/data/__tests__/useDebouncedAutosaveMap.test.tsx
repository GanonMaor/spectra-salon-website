import { act, renderHook, waitFor } from "@testing-library/react";
import { useDebouncedAutosaveMap } from "../useDebouncedAutosaveMap";

type Draft = { value: number };
type ServerValue = { value: number };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useDebouncedAutosaveMap", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("keeps the latest row value when an older response resolves last", async () => {
    const visible: Record<string, number> = {};
    const saves: Array<{
      key: string;
      draft: Partial<Draft>;
      version: number;
      deferred: ReturnType<typeof deferred<{ server: ServerValue; version: number }>>;
    }> = [];

    const { result } = renderHook(() =>
      useDebouncedAutosaveMap<string, Draft, ServerValue>({
        debounceMs: 10,
        save: (key, draft, { version }) => {
          const pending = deferred<{ server: ServerValue; version: number }>();
          saves.push({ key, draft, version, deferred: pending });
          return pending.promise;
        },
        applyServer: (key, server) => {
          visible[key] = server.value;
        },
      }),
    );

    act(() => result.current.edit("row-a", { value: 5 }));
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(saves).toHaveLength(1);
    expect(saves[0]).toMatchObject({ key: "row-a", draft: { value: 5 }, version: 1 });

    act(() => result.current.edit("row-a", { value: 8 }));
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(saves).toHaveLength(2);
    expect(saves[1]).toMatchObject({ key: "row-a", draft: { value: 8 }, version: 2 });

    await act(async () => {
      saves[1].deferred.resolve({ server: { value: 8 }, version: 2 });
      await Promise.resolve();
    });
    expect(visible["row-a"]).toBe(8);

    await act(async () => {
      saves[0].deferred.resolve({ server: { value: 5 }, version: 1 });
      await Promise.resolve();
    });
    expect(visible["row-a"]).toBe(8);
  });

  it("saves rows independently and retries a failed row with its latest draft", async () => {
    const visible: Record<string, number> = {};
    const saves: Array<{
      key: string;
      draft: Partial<Draft>;
      version: number;
      deferred: ReturnType<typeof deferred<{ server: ServerValue; version: number }>>;
    }> = [];

    const { result } = renderHook(() =>
      useDebouncedAutosaveMap<string, Draft, ServerValue>({
        debounceMs: 10,
        save: (key, draft, { version }) => {
          const pending = deferred<{ server: ServerValue; version: number }>();
          saves.push({ key, draft, version, deferred: pending });
          return pending.promise;
        },
        applyServer: (key, server) => {
          visible[key] = server.value;
        },
      }),
    );

    act(() => {
      result.current.edit("row-a", { value: 11 });
      result.current.edit("row-b", { value: 22 });
    });
    act(() => {
      jest.advanceTimersByTime(10);
    });
    expect(saves.map((save) => save.key).sort()).toEqual(["row-a", "row-b"]);

    const rowAFirst = saves.find((save) => save.key === "row-a")!;
    const rowBFirst = saves.find((save) => save.key === "row-b")!;

    await act(async () => {
      rowAFirst.deferred.reject(new Error("network"));
      rowBFirst.deferred.resolve({ server: { value: 22 }, version: rowBFirst.version });
      await Promise.resolve();
    });

    await waitFor(() => expect(result.current.status("row-a")).toBe("error"));
    expect(visible["row-b"]).toBe(22);
    expect(visible["row-a"]).toBeUndefined();

    act(() => result.current.edit("row-a", { value: 12 }));
    act(() => result.current.retry("row-a"));

    const retrySave = saves[saves.length - 1];
    expect(retrySave).toMatchObject({ key: "row-a", draft: { value: 12 } });

    await act(async () => {
      retrySave.deferred.resolve({ server: { value: 12 }, version: retrySave.version });
      await Promise.resolve();
    });

    expect(visible["row-a"]).toBe(12);
    expect(visible["row-b"]).toBe(22);
  });
});
