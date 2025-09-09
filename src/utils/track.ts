export function track(event: string, params: Record<string, any> = {}) {
  // First phase: console + dataLayer if exists
  // Replace here with Meta Pixel/GTM/Segment as configured
  console.log('[track]', event, params);
  
  if (typeof window !== 'undefined') {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push({ event, ...params, ts: Date.now() });
  }
}
