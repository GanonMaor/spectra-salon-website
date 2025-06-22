import React from "react";

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        {/* Outer Ring */}
        <div className="w-16 h-16 border-4 border-spectra-gold/20 rounded-full"></div>
        
        {/* Inner Spinning Ring - Using new spinner class */}
        <div className="absolute top-0 left-0 spinner w-16 h-16"></div>
        
        {/* Center Dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-spectra-gold rounded-full animate-pulse"></div>
      </div>
      
      <span className="ml-4 text-spectra-gold-dark font-medium">Loading...</span>
    </div>
  );
}; 