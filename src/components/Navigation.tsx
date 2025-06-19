import { useState } from "react";

interface NavigationProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export const Navigation = ({ isMobileMenuOpen, setIsMobileMenuOpen }: NavigationProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <img className="h-8 w-auto" src="/image.png" alt="Spectra" />
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features-section" className="text-gray-600 hover:text-[#d4c4a8] transition-colors duration-200">
                Features
              </a>
              <a href="#about" className="text-gray-600 hover:text-[#d4c4a8] transition-colors duration-200">
                About
              </a>
              <button className="bg-[#d4c4a8] hover:bg-[#c8b896] text-white px-6 py-2 rounded-lg font-medium transition-colors duration-200">
                Start Free Trial
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#d4c4a8]"
            >
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-b border-gray-100">
            <a href="#features-section" className="block px-3 py-2 text-gray-600 hover:text-[#d4c4a8]">
              Features
            </a>
            <a href="#about" className="block px-3 py-2 text-gray-600 hover:text-[#d4c4a8]">
              About
            </a>
            <button className="w-full mt-2 bg-[#d4c4a8] hover:bg-[#c8b896] text-white px-4 py-2 rounded-lg font-medium">
              Start Free Trial
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}; 