import React from "react";
import { ContactSection } from "../../components/ContactSection";
import { BACKGROUND_IMAGES } from "../../constants/backgroundImages";

export const HomePage: React.FC = () => {
  return (
    <div>
      {/* Main page content */}

      {/* Contact Section at the end - with your image */}
      <ContactSection
        backgroundImage={BACKGROUND_IMAGES.yourCustomSalon}
        title="Ready to"
        subtitle="Transform?"
        description="Join thousands of salon professionals who've revolutionized their business with Spectra."
      />
    </div>
  );
};
