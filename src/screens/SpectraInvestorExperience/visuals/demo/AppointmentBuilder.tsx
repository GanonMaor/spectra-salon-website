import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { INV } from "../../tokens";
import { stagger, pickStaggerItem, DUR, EASE_OUT } from "./motion";

export interface AppointmentService {
  service: string;
  stylist: string;
  duration: string;
  time: string;
}

interface AppointmentBuilderProps {
  services: readonly AppointmentService[];
  ctaLabel: string;
  dark?: boolean;
  className?: string;
}

/** Simulated reception-side appointment builder with staged card reveals. */
export const AppointmentBuilder: React.FC<AppointmentBuilderProps> = ({
  services,
  ctaLabel,
  dark = false,
  className = "",
}) => {
  const reduced = useReducedMotion() ?? false;
  const item = pickStaggerItem(reduced);
  const ink = dark ? INV.textOnDark : INV.text;
  const muted = dark ? INV.textOnDarkSoft : INV.textMuted;
  const surface = dark ? "rgba(255,255,255,0.06)" : INV.glassStrong;
  const borderColor = dark ? "rgba(255,255,255,0.13)" : INV.border;

  return (
    <div
      className={`rounded-2xl overflow-hidden ${className}`}
      style={{ background: surface, border: `1px solid ${borderColor}` }}
    >
      {/* Header */}
      <div className="px-5 py-3.5" style={{ borderBottom: `1px solid ${borderColor}` }}>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: INV.gold }}>
          Salon AI · Appointment Builder
        </span>
      </div>

      {/* Service rows */}
      <motion.div
        className="px-5 py-4 flex flex-col gap-3"
        variants={stagger}
        initial="hidden"
        animate="visible"
      >
        {services.map((svc) => (
          <motion.div
            key={svc.service}
            variants={item}
            className="flex items-center justify-between gap-4 rounded-xl px-4 py-3"
            style={{ background: dark ? "rgba(255,255,255,0.05)" : INV.bgSoft, border: `1px solid ${borderColor}` }}
          >
            <div>
              <div className="text-sm font-medium" style={{ color: ink }}>{svc.service}</div>
              <div className="text-xs font-light" style={{ color: muted }}>with {svc.stylist} · {svc.duration}</div>
            </div>
            <div
              className="text-sm font-medium tabular-nums shrink-0"
              style={{ color: INV.gold }}
            >
              {svc.time}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: DUR.enter, ease: EASE_OUT, delay: reduced ? 0 : 0.55 }}
        className="px-5 pb-5"
      >
        <div
          className="w-full rounded-xl py-3 text-center text-sm font-semibold"
          style={{ background: `linear-gradient(90deg, ${INV.gold}, ${INV.goldDeep})`, color: "#fff" }}
        >
          ✓ {ctaLabel}
        </div>
      </motion.div>
    </div>
  );
};
