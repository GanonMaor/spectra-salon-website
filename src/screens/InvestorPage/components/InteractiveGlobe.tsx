import React, { useEffect, useMemo, useRef } from "react";

type GlobePoint = {
  lat: number; // degrees
  lon: number; // degrees
  size: number; // px at DPR=1
  alpha: number; // 0..1
};

type GlobePolygon = {
  name: string;
  points: Array<{ lat: number; lon: number }>;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

function rotateX([x, y, z]: [number, number, number], a: number): [number, number, number] {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return [x, y * ca - z * sa, y * sa + z * ca];
}

function rotateY([x, y, z]: [number, number, number], a: number): [number, number, number] {
  const ca = Math.cos(a);
  const sa = Math.sin(a);
  return [x * ca + z * sa, y, -x * sa + z * ca];
}

function latLonToXYZ(latDeg: number, lonDeg: number): [number, number, number] {
  const lat = degToRad(latDeg);
  const lon = degToRad(lonDeg);
  const x = Math.cos(lat) * Math.sin(lon);
  const y = Math.sin(lat);
  const z = Math.cos(lat) * Math.cos(lon);
  return [x, y, z];
}

function seededRandom(seed: number) {
  // Simple LCG for deterministic points across renders.
  let s = seed >>> 0;
  return () => {
    s = (1664525 * s + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function makeClusterPoints(
  rand: () => number,
  opts: { latMin: number; latMax: number; lonMin: number; lonMax: number; count: number },
): GlobePoint[] {
  const pts: GlobePoint[] = [];
  for (let i = 0; i < opts.count; i++) {
    const lat = opts.latMin + (opts.latMax - opts.latMin) * rand();
    const lon = opts.lonMin + (opts.lonMax - opts.lonMin) * rand();
    pts.push({
      lat,
      lon,
      size: 0.8 + rand() * 1.8,
      alpha: 0.25 + rand() * 0.55,
    });
  }
  return pts;
}

export function InteractiveGlobe({
  className,
  ariaLabel = "Interactive globe",
}: {
  className?: string;
  ariaLabel?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const stateRef = useRef({
    lon: degToRad(-20),
    lat: degToRad(15),
    dragging: false,
    startX: 0,
    startY: 0,
    startLon: 0,
    startLat: 0,
    velLon: 0,
    velLat: 0,
    lastMoveAt: 0,
    lastX: 0,
    lastY: 0,
    radius: 0,
  });

  const points = useMemo(() => {
    const rand = seededRandom(20251211);
    // Approximate "atlas" landmass clusters (not geo-accurate, but feels like a globe).
    return [
      ...makeClusterPoints(rand, { latMin: -55, latMax: 70, lonMin: -165, lonMax: -25, count: 900 }), // Americas
      ...makeClusterPoints(rand, { latMin: -35, latMax: 70, lonMin: -20, lonMax: 55, count: 850 }), // Europe + Africa
      ...makeClusterPoints(rand, { latMin: -10, latMax: 70, lonMin: 55, lonMax: 155, count: 1100 }), // Asia
      ...makeClusterPoints(rand, { latMin: -45, latMax: -10, lonMin: 110, lonMax: 160, count: 350 }), // Australia
    ];
  }, []);

  const continentPolygons = useMemo<GlobePolygon[]>(
    () => [
      // Very simplified continent silhouettes (atlas-style, not geo-accurate).
      {
        name: "North America",
        points: [
          { lat: 70, lon: -140 },
          { lat: 60, lon: -165 },
          { lat: 50, lon: -165 },
          { lat: 40, lon: -150 },
          { lat: 25, lon: -125 },
          { lat: 15, lon: -105 },
          { lat: 20, lon: -90 },
          { lat: 30, lon: -82 },
          { lat: 45, lon: -70 },
          { lat: 55, lon: -60 },
          { lat: 65, lon: -80 },
        ],
      },
      {
        name: "South America",
        points: [
          { lat: 12, lon: -82 },
          { lat: 5, lon: -75 },
          { lat: -5, lon: -70 },
          { lat: -15, lon: -64 },
          { lat: -30, lon: -60 },
          { lat: -45, lon: -65 },
          { lat: -55, lon: -72 },
          { lat: -52, lon: -55 },
          { lat: -35, lon: -48 },
          { lat: -18, lon: -50 },
          { lat: -5, lon: -55 },
          { lat: 6, lon: -62 },
        ],
      },
      {
        name: "Europe",
        points: [
          { lat: 70, lon: -10 },
          { lat: 62, lon: -25 },
          { lat: 55, lon: -10 },
          { lat: 50, lon: 0 },
          { lat: 45, lon: 15 },
          { lat: 45, lon: 30 },
          { lat: 55, lon: 35 },
          { lat: 62, lon: 20 },
        ],
      },
      {
        name: "Africa",
        points: [
          { lat: 35, lon: -18 },
          { lat: 30, lon: 5 },
          { lat: 25, lon: 20 },
          { lat: 20, lon: 35 },
          { lat: 5, lon: 45 },
          { lat: -15, lon: 40 },
          { lat: -25, lon: 30 },
          { lat: -35, lon: 20 },
          { lat: -35, lon: 5 },
          { lat: -25, lon: -5 },
          { lat: -10, lon: -12 },
          { lat: 10, lon: -10 },
          { lat: 25, lon: -5 },
        ],
      },
      {
        name: "Asia",
        points: [
          { lat: 75, lon: 40 },
          { lat: 65, lon: 60 },
          { lat: 55, lon: 80 },
          { lat: 50, lon: 100 },
          { lat: 45, lon: 125 },
          { lat: 40, lon: 150 },
          { lat: 25, lon: 155 },
          { lat: 10, lon: 140 },
          { lat: 5, lon: 120 },
          { lat: 10, lon: 95 },
          { lat: 20, lon: 70 },
          { lat: 30, lon: 60 },
          { lat: 40, lon: 50 },
          { lat: 55, lon: 45 },
        ],
      },
      {
        name: "Australia",
        points: [
          { lat: -10, lon: 112 },
          { lat: -18, lon: 114 },
          { lat: -28, lon: 118 },
          { lat: -38, lon: 130 },
          { lat: -42, lon: 145 },
          { lat: -35, lon: 155 },
          { lat: -20, lon: 153 },
          { lat: -12, lon: 140 },
        ],
      },
      {
        name: "Antarctica",
        points: [
          { lat: -75, lon: -180 },
          { lat: -78, lon: -120 },
          { lat: -80, lon: -60 },
          { lat: -80, lon: 0 },
          { lat: -80, lon: 60 },
          { lat: -78, lon: 120 },
          { lat: -75, lon: 180 },
          { lat: -86, lon: 180 },
          { lat: -86, lon: -180 },
        ],
      },
    ],
    [],
  );

  const continentLabels = useMemo(
    () =>
      [
        { name: "North America", lat: 40, lon: -105 },
        { name: "South America", lat: -18, lon: -60 },
        { name: "Europe", lat: 52, lon: 15 },
        { name: "Africa", lat: 5, lon: 20 },
        { name: "Asia", lat: 35, lon: 95 },
        { name: "Australia", lat: -25, lon: 135 },
        { name: "Antarctica", lat: -78, lon: 0 },
      ] as const,
    [],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      stateRef.current.radius = Math.min(canvas.width, canvas.height) * 0.38;
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const draw = () => {
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;
      const r = stateRef.current.radius;
      const lon = stateRef.current.lon;
      const lat = stateRef.current.lat;

      ctx.clearRect(0, 0, width, height);

      // Sphere shading background.
      const sphereGrad = ctx.createRadialGradient(
        cx - r * 0.35,
        cy - r * 0.35,
        r * 0.15,
        cx,
        cy,
        r * 1.1,
      );
      sphereGrad.addColorStop(0, "rgba(245, 158, 11, 0.20)"); // amber highlight
      sphereGrad.addColorStop(0.35, "rgba(17, 17, 17, 0.75)");
      sphereGrad.addColorStop(1, "rgba(0, 0, 0, 0.90)");

      // Outer glow.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.02, 0, Math.PI * 2);
      ctx.shadowColor = "rgba(245, 158, 11, 0.35)";
      ctx.shadowBlur = 30 * dpr;
      ctx.fillStyle = "rgba(245, 158, 11, 0.06)";
      ctx.fill();
      ctx.restore();

      // Sphere.
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = sphereGrad;
      ctx.fill();

      // Clip to sphere for all "atlas" strokes.
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.clip();

      // Subtle atmosphere ring.
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.01, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(245, 158, 11, 0.10)";
      ctx.lineWidth = 2 * dpr;
      ctx.stroke();

      const project = (latDeg: number, lonDeg: number) => {
        let p = latLonToXYZ(latDeg, lonDeg);
        p = rotateY(p, lon);
        p = rotateX(p, lat);
        const z = p[2];
        // Orthographic projection; only keep front-facing points.
        if (z <= 0) return null;
        const x = cx + p[0] * r;
        const y = cy - p[1] * r;
        return { x, y, z };
      };

      // Graticule (latitude lines).
      ctx.lineWidth = 1 * dpr;
      for (let latLine = -60; latLine <= 60; latLine += 20) {
        ctx.beginPath();
        let started = false;
        for (let lonLine = -180; lonLine <= 180; lonLine += 3) {
          const pr = project(latLine, lonLine);
          if (!pr) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(pr.x, pr.y);
            started = true;
          } else {
            ctx.lineTo(pr.x, pr.y);
          }
        }
        ctx.strokeStyle = "rgba(245, 158, 11, 0.14)";
        ctx.stroke();
      }

      // Graticule (longitude lines).
      for (let lonLine = -180; lonLine <= 180; lonLine += 30) {
        ctx.beginPath();
        let started = false;
        for (let latLine = -90; latLine <= 90; latLine += 3) {
          const pr = project(latLine, lonLine);
          if (!pr) {
            started = false;
            continue;
          }
          if (!started) {
            ctx.moveTo(pr.x, pr.y);
            started = true;
          } else {
            ctx.lineTo(pr.x, pr.y);
          }
        }
        ctx.strokeStyle = "rgba(245, 158, 11, 0.10)";
        ctx.stroke();
      }

      // Filled "atlas" landmasses (more readable than dots).
      const fillLand = (alpha: number) => {
        for (const poly of continentPolygons) {
          ctx.beginPath();
          let startedPoly = false;
          for (const p of poly.points) {
            const pr = project(p.lat, p.lon);
            if (!pr) {
              // Break path across the horizon.
              startedPoly = false;
              continue;
            }
            if (!startedPoly) {
              ctx.moveTo(pr.x, pr.y);
              startedPoly = true;
            } else {
              ctx.lineTo(pr.x, pr.y);
            }
          }
          if (startedPoly) {
            ctx.closePath();
            ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.fill();
          }
        }
      };

      // Base land fill + highlight layer.
      fillLand(0.12);
      fillLand(0.06);

      // Coastline stroke for clarity.
      ctx.lineWidth = 1.25 * dpr;
      ctx.strokeStyle = "rgba(245, 158, 11, 0.22)";
      for (const poly of continentPolygons) {
        ctx.beginPath();
        let startedPoly = false;
        for (const p of poly.points) {
          const pr = project(p.lat, p.lon);
          if (!pr) {
            startedPoly = false;
            continue;
          }
          if (!startedPoly) {
            ctx.moveTo(pr.x, pr.y);
            startedPoly = true;
          } else {
            ctx.lineTo(pr.x, pr.y);
          }
        }
        if (startedPoly) {
          ctx.closePath();
          ctx.stroke();
        }
      }

      // Keep a subtle texture (reduced dots) so it still feels "alive".
      for (const pt of points) {
        const pr = project(pt.lat, pt.lon);
        if (!pr) continue;
        const a = pt.alpha * 0.10 * (0.35 + 0.65 * pr.z);
        const s = pt.size * dpr * 0.55 * (0.8 + 0.6 * pr.z);
        ctx.beginPath();
        ctx.arc(pr.x, pr.y, s, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 146, 60, ${a})`;
        ctx.fill();
      }

      // Prime meridian accent.
      ctx.beginPath();
      let started = false;
      for (let latLine = -90; latLine <= 90; latLine += 2) {
        const pr = project(latLine, 0);
        if (!pr) {
          started = false;
          continue;
        }
        if (!started) {
          ctx.moveTo(pr.x, pr.y);
          started = true;
        } else {
          ctx.lineTo(pr.x, pr.y);
        }
      }
      ctx.strokeStyle = "rgba(245, 158, 11, 0.35)";
      ctx.lineWidth = 1.5 * dpr;
      ctx.stroke();

      // Continent labels (front-facing only).
      ctx.save();
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const baseFont = 13 * dpr;
      for (const label of continentLabels) {
        const pr = project(label.lat, label.lon);
        if (!pr) continue;

        // Slightly shrink on far edge, pop on near.
        const zBoost = clamp(pr.z, 0, 1);
        const fontSize = baseFont * (0.95 + 0.45 * zBoost);
        ctx.font = `700 ${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Inter, Roboto, Helvetica, Arial`;

        const alpha = 0.55 + 0.40 * zBoost;
        const x = pr.x;
        const y = pr.y;

        // Optional subtle pill background for contrast.
        ctx.save();
        const padX = 8 * dpr;
        const padY = 4.5 * dpr;
        const metrics = ctx.measureText(label.name);
        const w = metrics.width + padX * 2;
        const h = fontSize + padY * 2;
        const rPill = 10 * dpr;
        ctx.fillStyle = `rgba(0, 0, 0, ${0.22 + 0.18 * zBoost})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.10 + 0.10 * zBoost})`;
        ctx.lineWidth = 1 * dpr;
        ctx.beginPath();
        ctx.moveTo(x - w / 2 + rPill, y - h / 2);
        ctx.lineTo(x + w / 2 - rPill, y - h / 2);
        ctx.quadraticCurveTo(x + w / 2, y - h / 2, x + w / 2, y - h / 2 + rPill);
        ctx.lineTo(x + w / 2, y + h / 2 - rPill);
        ctx.quadraticCurveTo(x + w / 2, y + h / 2, x + w / 2 - rPill, y + h / 2);
        ctx.lineTo(x - w / 2 + rPill, y + h / 2);
        ctx.quadraticCurveTo(x - w / 2, y + h / 2, x - w / 2, y + h / 2 - rPill);
        ctx.lineTo(x - w / 2, y - h / 2 + rPill);
        ctx.quadraticCurveTo(x - w / 2, y - h / 2, x - w / 2 + rPill, y - h / 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // White label with strong readability.
        ctx.shadowColor = `rgba(0, 0, 0, ${0.55})`;
        ctx.shadowBlur = 12 * dpr;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fillText(label.name, x, y);

        // Thin outline for readability.
        ctx.shadowBlur = 0;
        ctx.lineWidth = 3 * dpr;
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.75})`;
        ctx.strokeText(label.name, x, y);
      }
      ctx.restore();

      ctx.restore(); // clip

      // Subtle vignette.
      const vignette = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.4);
      vignette.addColorStop(0, "rgba(0,0,0,0)");
      vignette.addColorStop(1, "rgba(0,0,0,0.55)");
      ctx.fillStyle = vignette;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.05, 0, Math.PI * 2);
      ctx.fill();
    };

    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(32, t - last);
      last = t;

      const s = stateRef.current;
      if (!s.dragging) {
        // Inertia decay.
        s.lon += s.velLon * (dt / 16.67);
        s.lat = clamp(s.lat + s.velLat * (dt / 16.67), degToRad(-75), degToRad(75));
        s.velLon *= 0.92;
        s.velLat *= 0.92;
      }

      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [points, continentLabels]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const s = stateRef.current;

    const getPoint = (e: PointerEvent) => ({ x: e.clientX, y: e.clientY });

    const onPointerDown = (e: PointerEvent) => {
      canvas.setPointerCapture(e.pointerId);
      const p = getPoint(e);
      s.dragging = true;
      s.startX = p.x;
      s.startY = p.y;
      s.startLon = s.lon;
      s.startLat = s.lat;
      s.velLon = 0;
      s.velLat = 0;
      s.lastMoveAt = performance.now();
      s.lastX = p.x;
      s.lastY = p.y;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.dragging) return;
      const p = getPoint(e);
      const dx = p.x - s.startX;
      const dy = p.y - s.startY;

      // Sensitivity tuned for trackpad/mouse.
      const k = 0.005;
      s.lon = s.startLon + dx * k;
      s.lat = clamp(s.startLat + dy * k, degToRad(-75), degToRad(75));

      // Track velocity for inertia.
      const now = performance.now();
      const dt = Math.max(1, now - s.lastMoveAt);
      s.velLon = ((p.x - s.lastX) * k) / (dt / 16.67);
      s.velLat = ((p.y - s.lastY) * k) / (dt / 16.67);
      s.lastMoveAt = now;
      s.lastX = p.x;
      s.lastY = p.y;
    };

    const end = () => {
      s.dragging = false;
    };

    canvas.addEventListener("pointerdown", onPointerDown);
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerup", end);
    canvas.addEventListener("pointercancel", end);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup", end);
      canvas.removeEventListener("pointercancel", end);
    };
  }, []);

  return (
    <div className={className}>
      <canvas
        ref={canvasRef}
        aria-label={ariaLabel}
        role="img"
        className="w-full h-full touch-none cursor-grab active:cursor-grabbing"
      />
    </div>
  );
}


