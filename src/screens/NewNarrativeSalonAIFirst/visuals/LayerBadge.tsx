import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { LAYERS, LayerNumber, INK } from "../theme";

/**
 * Layer locator — a consistent visual link placed on every slide that belongs to
 * a specific platform layer. The three stacked bars echo the three-layer model;
 * the active layer is lit in its canonical color so the viewer always knows where
 * they are in the stack.
 */
interface LayerBadgeProps {
  layer: LayerNumber;
  className?: string;
}

export const LayerBadge: React.FC<LayerBadgeProps> = ({ layer, className = "" }) => {
  const reduced = useReducedMotion() ?? false;
  const info = LAYERS[layer];

  return (
    <motion.div
      initial={{ opacity: 0, y: reduced ? 0 : -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`inline-flex items-center gap-3 rounded-full pl-3 pr-4 py-2 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${info.accentSoft} 0%, rgba(255,255,255,0.08) 100%)`,
        border: `1px solid ${info.accentBorder}`,
        backdropFilter: "blur(22px) saturate(150%)",
        WebkitBackdropFilter: "blur(22px) saturate(150%)",
        boxShadow: `0 10px 28px rgba(0,0,0,0.22), 0 0 22px ${info.glow}, inset 0 1px 0 rgba(255,255,255,0.10)`,
      }}
    >
      {/* Mini four-layer stack (layer 4 on top, layer 1 at bottom) */}
      <div className="flex flex-col gap-[2px]">
        {([4, 3, 2, 1] as LayerNumber[]).map((l) => {
          const active = l === layer;
          return (
            <span
              key={l}
              className="block rounded-full transition-all"
              style={{
                width: active ? 20 : 14,
                height: active ? 4 : 3,
                background: active ? LAYERS[l].accent : "rgba(255,255,255,0.22)",
                boxShadow: active ? `0 0 12px ${LAYERS[l].glow}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Label */}
      <div className="flex flex-col leading-none">
        <span
          className="text-[11px] font-bold uppercase"
          style={{ color: info.accent, letterSpacing: "0.18em" }}
        >
          Layer {info.n}
        </span>
        <span className="text-[11px] font-light mt-0.5" style={{ color: INK.soft }}>
          {info.name}
        </span>
      </div>
    </motion.div>
  );
};
