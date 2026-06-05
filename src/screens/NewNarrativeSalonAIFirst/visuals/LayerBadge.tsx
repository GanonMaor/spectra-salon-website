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
      className={`inline-flex items-center gap-2.5 rounded-full pl-2.5 pr-3.5 py-1.5 ${className}`}
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${info.accentBorder}`,
        backdropFilter: "blur(18px)",
        WebkitBackdropFilter: "blur(18px)",
      }}
    >
      {/* Mini three-layer stack (layer 3 on top, layer 1 at bottom) */}
      <div className="flex flex-col gap-[2px]">
        {([3, 2, 1] as LayerNumber[]).map((l) => {
          const active = l === layer;
          return (
            <span
              key={l}
              className="block rounded-full transition-all"
              style={{
                width: 16,
                height: 3.5,
                background: active ? LAYERS[l].accent : "rgba(255,255,255,0.22)",
                boxShadow: active ? `0 0 8px ${LAYERS[l].glow}` : "none",
              }}
            />
          );
        })}
      </div>

      {/* Label */}
      <div className="flex flex-col leading-none">
        <span
          className="text-[10px] font-bold uppercase"
          style={{ color: info.accent, letterSpacing: "0.16em" }}
        >
          Layer {info.n}
        </span>
        <span className="text-[10px] font-light mt-0.5" style={{ color: INK.faint }}>
          {info.name}
        </span>
      </div>
    </motion.div>
  );
};
