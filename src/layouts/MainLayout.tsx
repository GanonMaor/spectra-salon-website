import React, { useState } from "react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";

interface MainLayoutProps {
  children: React.ReactNode;
  showNavigation?: boolean;
  showFooter?: boolean;
  className?: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  showNavigation = true,
  showFooter = true,
  className = "",
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className={`min-h-screen flex flex-col bg-white ${className}`}>
      {showNavigation && (
        <Navigation
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />
      )}

      <main className="flex-1 w-full">{children}</main>

      {showFooter && <Footer />}
    </div>
  );
};
