import React from "react";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface MetricCardCinematicProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  color?: "blue" | "green" | "purple" | "orange" | "pink" | "cyan";
  onClick?: () => void;
}

const colorSchemes = {
  blue: {
    gradient: "from-blue-600/20 via-blue-500/10 to-transparent",
    iconBg: "from-blue-500 to-blue-600",
    border: "border-blue-400/30",
    glow: "shadow-blue-500/20",
  },
  green: {
    gradient: "from-green-600/20 via-green-500/10 to-transparent",
    iconBg: "from-green-500 to-green-600", 
    border: "border-green-400/30",
    glow: "shadow-green-500/20",
  },
  purple: {
    gradient: "from-purple-600/20 via-purple-500/10 to-transparent",
    iconBg: "from-purple-500 to-purple-600",
    border: "border-purple-400/30", 
    glow: "shadow-purple-500/20",
  },
  orange: {
    gradient: "from-orange-600/20 via-orange-500/10 to-transparent",
    iconBg: "from-orange-500 to-orange-600",
    border: "border-orange-400/30",
    glow: "shadow-orange-500/20",
  },
  pink: {
    gradient: "from-pink-600/20 via-pink-500/10 to-transparent",
    iconBg: "from-pink-500 to-pink-600",
    border: "border-pink-400/30",
    glow: "shadow-pink-500/20",
  },
  cyan: {
    gradient: "from-cyan-600/20 via-cyan-500/10 to-transparent",
    iconBg: "from-cyan-500 to-cyan-600",
    border: "border-cyan-400/30",
    glow: "shadow-cyan-500/20",
  },
};

export default function MetricCardCinematic({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  color = "blue",
  onClick,
}: MetricCardCinematicProps) {
  const scheme = colorSchemes[color];

  return (
    <div
      className={clsx(
        // Glass morphism base
        "relative overflow-hidden rounded-3xl backdrop-blur-xl border",
        scheme.border,
        scheme.glow,
        
        // Floating effect
        "shadow-2xl shadow-black/25",
        
        // Interactions
        "transition-all duration-500 ease-out",
        "hover:scale-[1.03] hover:shadow-3xl hover:-translate-y-1",
        onClick && "cursor-pointer",
        
        // Sizing
        "p-6 sm:p-8"
      )}
      style={{
        background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
      }}
      onClick={onClick}
    >
      {/* Gradient overlay */}
      <div 
        className={clsx(
          "absolute inset-0 bg-gradient-to-br opacity-60",
          scheme.gradient
        )}
      />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-white/70 text-sm font-medium mb-1 tracking-wide">
              {title}
            </h3>
            <div className="text-white text-3xl sm:text-4xl font-bold mb-1 tracking-tight">
              {value}
            </div>
            {subtitle && (
              <p className="text-white/60 text-sm">
                {subtitle}
              </p>
            )}
          </div>
          
          {Icon && (
            <div className={clsx(
              "rounded-2xl p-3 bg-gradient-to-br shadow-lg",
              scheme.iconBg
            )}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          )}
        </div>
        
        {trend && (
          <div className="flex items-center gap-2">
            <div className={clsx(
              "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
              trend.isPositive !== false 
                ? "bg-green-500/20 text-green-300 border border-green-400/30" 
                : "bg-red-500/20 text-red-300 border border-red-400/30"
            )}>
              <span>{trend.isPositive !== false ? "↗" : "↘"}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-white/60 text-xs">
              {trend.label}
            </span>
          </div>
        )}
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
    </div>
  );
}
