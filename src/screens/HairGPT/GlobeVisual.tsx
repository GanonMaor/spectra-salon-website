import React from "react";

const RING_COUNT = 12;

const DOTS = Array.from({ length: 60 }, (_, i) => {
  const golden = (i * 137.508 * Math.PI) / 180;
  const t = (i + 0.5) / 60;
  const phi = Math.acos(1 - 2 * t);
  return {
    x: 50 + Math.sin(phi) * Math.cos(golden) * 43,
    y: 50 - Math.cos(phi) * 43,
    r: 0.6 + Math.random() * 1.4,
    o: 0.12 + Math.random() * 0.28,
  };
});

export const GlobeVisual: React.FC<{ size?: number; className?: string }> = ({
  size = 500,
  className = "",
}) => (
  <div className={`relative ${className}`} style={{ width: size, height: size }}>
    {/* Atmospheric bloom */}
    <div
      className="absolute rounded-full"
      style={{
        inset: "-22%",
        background:
          "radial-gradient(circle, rgba(234,183,118,0.10) 12%, rgba(177,128,89,0.04) 35%, transparent 58%)",
        filter: "blur(50px)",
      }}
    />

    {/* Globe body */}
    <div className="absolute inset-0" style={{ clipPath: "circle(49% at 50% 50%)" }}>
      {/* Sphere surface */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 30% 25%, #161310 0%, #0c0a07 28%, #070605 55%, #030302 100%)",
        }}
      />

      {/* 3D rotating longitude rings */}
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          animation: "hg-globe-spin 32s linear infinite",
        }}
      >
        {Array.from({ length: RING_COUNT }, (_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              inset: "2%",
              border: `${i % 3 === 0 ? 0.8 : 0.5}px solid rgba(234,183,118,${
                i % 3 === 0 ? 0.12 : 0.06
              })`,
              transform: `rotateY(${(i * 180) / RING_COUNT}deg)`,
              backfaceVisibility: "visible" as const,
            }}
          />
        ))}
      </div>

      {/* Static latitude lines */}
      {[-60, -40, -20, 0, 20, 40, 60].map((lat) => {
        const y = 50 - (lat / 90) * 44;
        const w = Math.cos((lat * Math.PI) / 180) * 94;
        return (
          <div
            key={lat}
            className="absolute"
            style={{
              left: `${(100 - w) / 2}%`,
              top: `${y}%`,
              width: `${w}%`,
              height: 0,
              borderTop: `${lat === 0 ? 0.8 : 0.4}px solid rgba(234,183,118,${
                lat === 0 ? 0.10 : 0.05
              })`,
            }}
          />
        );
      })}

      {/* Data dot particles */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.x}%`,
            top: `${d.y}%`,
            width: d.r,
            height: d.r,
            background: `rgba(234,183,118,${d.o})`,
            boxShadow: `0 0 ${d.r * 3}px rgba(234,183,118,${d.o * 0.5})`,
          }}
        />
      ))}

      {/* Specular rim highlight */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "linear-gradient(145deg, transparent 28%, rgba(234,183,118,0.04) 48%, rgba(234,183,118,0.14) 76%, rgba(212,160,106,0.08) 88%, transparent 100%)",
        }}
      />

      {/* Inner shadow for depth */}
      <div
        className="absolute inset-0 rounded-full"
        style={{
          boxShadow:
            "inset -50px -40px 100px rgba(0,0,0,0.7), inset 20px 15px 60px rgba(234,183,118,0.02)",
        }}
      />
    </div>

    {/* Outer rim glow */}
    <div
      className="absolute inset-0 rounded-full"
      style={{
        boxShadow:
          "0 0 2px rgba(234,183,118,0.22), 0 0 40px rgba(234,183,118,0.07), 0 0 100px rgba(234,183,118,0.03)",
      }}
    />

    <style>{`
      @keyframes hg-globe-spin {
        0% { transform: rotateX(-18deg) rotateZ(-6deg) rotateY(0deg); }
        100% { transform: rotateX(-18deg) rotateZ(-6deg) rotateY(360deg); }
      }
    `}</style>
  </div>
);
