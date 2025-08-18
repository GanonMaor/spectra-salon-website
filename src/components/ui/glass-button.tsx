import React, { forwardRef } from "react";
import clsx from "clsx";

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "dark" | "orange" | "pill" | "micro";
  size?: "sm" | "md" | "lg";
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "md", 
    icon, 
    iconPosition = "left",
    loading,
    children,
    disabled,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={clsx(
          // Base styling - 18-22px radius as specified
          "inline-flex items-center justify-center gap-2 rounded-2xl border font-medium transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-orange-500/60 focus:ring-offset-2 focus:ring-offset-transparent",
          
          // Size variants - 44-48px height as specified
          size === "sm" && "h-10 px-4 text-sm",
          size === "md" && "h-12 px-6 text-sm", // ~48px height
          size === "lg" && "h-14 px-8 text-base",
          
          // Variant styling
          variant === "default" && [
            "bg-white/55 border-white/75 text-gray-900",
            "hover:bg-white/65 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)]",
            "active:scale-[0.98]"
          ],
          
          variant === "dark" && [
            "bg-black/20 border-white/20 text-white",
            "hover:bg-black/30 hover:shadow-lg",
            "active:scale-[0.98]"
          ],
          
          variant === "orange" && [
            "bg-gradient-to-b from-orange-400 to-orange-500 border-orange-400/60 text-white shadow-lg",
            "hover:from-orange-500 hover:to-orange-600 hover:shadow-xl",
            "active:scale-[0.98]"
          ],
          
          // Pill variant - for small CTAs like "I forgot"
          variant === "pill" && [
            "bg-white/65 border-white/75 text-gray-700 text-xs px-4 h-8 rounded-full",
            "hover:bg-white/75 hover:shadow-sm"
          ],
          
          // Micro variant - for tiny CTAs
          variant === "micro" && [
            "bg-black/80 border-white/20 text-white text-xs px-3 h-7 rounded-full",
            "hover:bg-black/90"
          ],
          
          // Disabled state
          isDisabled && "opacity-50 cursor-not-allowed hover:scale-100",
          
          className
        )}
        style={{
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
        }}
        {...props}
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        
        {icon && iconPosition === "left" && !loading && (
          <span className="flex-shrink-0">{icon}</span>
        )}
        
        {children}
        
        {icon && iconPosition === "right" && !loading && (
          <span className="flex-shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton };
