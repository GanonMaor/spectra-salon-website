import React, { forwardRef } from "react";
import clsx from "clsx";

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode;
  error?: string;
  variant?: "default" | "dark";
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, icon, error, variant = "default", ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={clsx(
              // Base glass styling - 18-22px radius as specified
              "w-full rounded-2xl border transition-all duration-150",
              "h-12 px-4 text-sm font-medium", // ~48px height as specified
              
              // Glass effect based on variant
              variant === "default" && [
                "bg-white/55 border-white/75 text-gray-900",
                "placeholder:text-gray-500",
                "backdrop-blur-lg"
              ],
              variant === "dark" && [
                "bg-black/20 border-white/20 text-white",
                "placeholder:text-white/60",
                "backdrop-blur-xl"
              ],
              
              // Icon spacing
              icon && "pl-12",
              
              // Focus states
              "focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:border-orange-400/60",
              "focus:bg-white/65",
              
              // Error state
              error && "border-red-400/60 bg-red-500/10",
              
              className
            )}
            style={{
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="text-sm text-red-600 mt-1">{error}</p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = "GlassInput";

export { GlassInput };
