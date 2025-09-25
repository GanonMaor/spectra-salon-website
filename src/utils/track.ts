export function track(event: string, params: Record<string, unknown> = {}) {
  const enableConsole = import.meta?.env?.VITE_TRACK_CONSOLE !== 'false';
  const enableGtm = import.meta?.env?.VITE_ENABLE_GTM !== 'false';

  if (enableConsole) {
    // eslint-disable-next-line no-console
    console.log('[track]', event, params);
  }

  if (enableGtm && typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event, ...params, ts: Date.now() });
  }
}
