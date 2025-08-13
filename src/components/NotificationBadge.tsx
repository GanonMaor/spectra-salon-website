import React, { ReactNode } from "react";

interface NotificationBadgeProps {
  count: number;
  children: ReactNode;
  maxCount?: number;
  showZero?: boolean;
  color?: "red" | "blue" | "green" | "yellow" | "purple";
  size?: "sm" | "md" | "lg";
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  pulse?: boolean;
  className?: string;
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  children,
  maxCount = 99,
  showZero = false,
  color = "red",
  size = "md",
  position = "top-right",
  pulse = false,
  className = "",
}) => {
  const shouldShow = count > 0 || (showZero && count === 0);
  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  const colorClasses = {
    red: "bg-red-500 text-white",
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    yellow: "bg-yellow-500 text-black",
    purple: "bg-purple-500 text-white",
  };

  const sizeClasses = {
    sm: "text-xs min-w-[16px] h-4 px-1",
    md: "text-xs min-w-[20px] h-5 px-1.5",
    lg: "text-sm min-w-[24px] h-6 px-2",
  };

  const positionClasses = {
    "top-right": "-top-1 -right-1",
    "top-left": "-top-1 -left-1",
    "bottom-right": "-bottom-1 -right-1",
    "bottom-left": "-bottom-1 -left-1",
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {children}
      {shouldShow && (
        <span
          className={`
            absolute ${positionClasses[position]} 
            ${colorClasses[color]} 
            ${sizeClasses[size]} 
            ${pulse ? "animate-pulse" : ""}
            rounded-full flex items-center justify-center 
            font-bold leading-none transform transition-all duration-200
            shadow-lg border-2 border-white
          `}
        >
          {displayCount}
        </span>
      )}
    </div>
  );
};
