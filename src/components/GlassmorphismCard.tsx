import React from "react";
import clsx from "clsx";

interface GlassmorphismCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "light" | "dark" | "orange" | "primary" | "success" | "warning" | "danger";
  blur?: "sm" | "md" | "lg" | "xl";
  glow?: boolean;
  floating?: boolean;
  interactive?: boolean;
}

// Design tokens based on the glassmorphism specifications
const variants = {
  // Base light glass card (main design)
  default: "bg-white/55 border-white/75 text-gray-900",
  light: "bg-white/65 border-white/75 text-gray-900",
  
  // Dark card for "New in" style
  dark: "bg-black/85 border-white/20 text-white backdrop-blur-xl",
  
  // Orange accent cards
  orange: "bg-gradient-to-br from-orange-500/20 to-amber-600/20 border-orange-400/40 text-white",
  
  // Other variants
  primary: "bg-blue-500/20 border-blue-400/40 text-white",
  success: "bg-green-500/20 border-green-400/40 text-white",
  warning: "bg-yellow-500/20 border-yellow-400/40 text-white",
  danger: "bg-red-500/20 border-red-400/40 text-white",
};

const blurs = {
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
};

export default function GlassmorphismCard({
  children,
  className,
  variant = "default",
  blur = "lg",
  glow = false,
  floating = true,
  interactive = false,
}: GlassmorphismCardProps) {
  return (
    <div
      className={clsx(
        // Base glass effect - 24px radius as specified
        "rounded-3xl border",
        variants[variant],
        blurs[blur],
        
        // Floating effect with specified shadow
        floating && "shadow-[0_20px_60px_rgba(0,0,0,0.10)]",
        
        // Glow effect
        glow && "shadow-lg shadow-current/20",
        
        // Interactive states
        interactive && [
          "transition-all duration-150 ease-out cursor-pointer",
          "hover:bg-white/65 hover:shadow-[0_24px_80px_rgba(0,0,0,0.12)]",
          "active:scale-[0.98]",
          // Focus ring for accessibility
          "focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:ring-offset-2 focus:ring-offset-transparent"
        ],
        
        // Non-interactive smooth transitions
        !interactive && "transition-all duration-300 ease-out",
        
        // Custom styles
        className
      )}
      style={{
        // Enhanced backdrop filter as specified
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        // Inner glow effect (optional)
        ...(glow && {
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.35), 0 20px 60px rgba(0,0,0,0.10)"
        })
      }}
      {...(interactive && { tabIndex: 0 })}
    >
      {children}
    </div>
  );
}
