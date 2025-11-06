## Performance Plan

### 0–48h (Quick Wins)
- Add `Content-Security-Policy` with caching hints; keep strict sources
- Ensure route-level code splitting via React.lazy for heavy routes (admin dashboard)
- Confirm image sizes and `vite-plugin-imagemin` settings; preconnect third-parties conditionally
- Turn off `visualizer({ open: true })` in CI builds to avoid overhead

### 1–2 weeks (Medium)
- Introduce granular chunks for charts/maps; lazy-load when routes mount
- Add HTTP compression verification (vite compression plugin already present)
- Add serverless function cold-start tracing and lightweight query timings
- Add CDN-level caching headers for HTML (short TTL) and JSON APIs (no-store)

### 1–2 months (Architectural)
- SSR/SSG where beneficial (marketing routes) if moving beyond static SPA needs
- Add job/queue for webhook retries and DLQ logging
- Introduce RUM (real-user monitoring) with anonymized metrics

KPIs
- TTI < 3s on median devices, Bundle < 250KB gz main route, P95 function latency < 400ms


