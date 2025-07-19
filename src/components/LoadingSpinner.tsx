import React from "react";

interface LoadingSpinnerProps {
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ className = "" }) => {
  return (
    <div className={`animate-spin rounded-full h-6 w-6 border-b-2 border-white ${className}`}></div>
  );
}; 