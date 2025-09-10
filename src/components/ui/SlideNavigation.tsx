import React, { useEffect } from "react";
import { motion } from "framer-motion";

interface SlideNavigationProps {
  current: number;
  total: number;
  onChange: (index: number) => void;
}

export const SlideNavigation: React.FC<SlideNavigationProps> = ({
  current,
  total,
  onChange
}) => {
  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft" && current > 0) {
        onChange(current - 1);
      } else if (event.key === "ArrowRight" && current < total - 1) {
        onChange(current + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [current, total, onChange]);

  const goToPrevious = () => {
    if (current > 0) {
      onChange(current - 1);
    }
  };

  const goToNext = () => {
    if (current < total - 1) {
      onChange(current + 1);
    }
  };

  const goToSlide = (index: number) => {
    onChange(index);
  };

  return (
    <div className="fixed bottom-6 sm:bottom-8 inset-x-0 z-50 flex justify-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="flex flex-col items-center gap-2 pointer-events-auto"
      >
      {/* Navigation Bar */}
      <div 
        className="flex items-center gap-3 px-4 sm:px-6 py-3 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-white/20"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}
      >
        {/* Left Arrow */}
        <button
          onClick={goToPrevious}
          disabled={current === 0}
          className={`
            w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300
            ${current === 0 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 active:scale-95'
            }
          `}
          aria-label="Previous slide"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none" 
            className="transform rotate-180"
          >
            <path 
              d="M4.5 10.5L8.25 6L4.5 1.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {Array.from({ length: total }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className="relative focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:ring-offset-2 focus:ring-offset-transparent rounded-full"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={current === index ? "true" : undefined}
            >
              <motion.div
                className={`
                  rounded-full cursor-pointer transition-colors duration-300
                  ${current === index 
                    ? 'bg-orange-500' 
                    : 'bg-orange-300 hover:bg-orange-400'
                  }
                `}
                animate={{
                  width: current === index ? 20 : 8,
                  height: 8
                }}
                transition={{ 
                  duration: 0.3, 
                  ease: "easeInOut" 
                }}
              />
            </button>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={goToNext}
          disabled={current === total - 1}
          className={`
            w-8 h-8 flex items-center justify-center rounded-full transition-all duration-300
            ${current === total - 1
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-600 hover:text-orange-500 hover:bg-orange-50 active:scale-95'
            }
          `}
          aria-label="Next slide"
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 12 12" 
            fill="none"
          >
            <path 
              d="M4.5 10.5L8.25 6L4.5 1.5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Position Label */}
      <p className="text-xs font-medium text-orange-500 tracking-wide">
        {current + 1} of {total}
      </p>
      </motion.div>
    </div>
  );
};
