import React from "react";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* תוכן הדף הראשי */}
      
      {/* Contact Section בסוף - עם התמונה שלך */}
      <ContactSection 
        backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
        title="Ready to"
        subtitle="Transform?"
        description="Join thousands of salon professionals who've revolutionized their business with Spectra."
      />
    </div>
  );
}; 