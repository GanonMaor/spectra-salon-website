import React from "react";

export const VideoSection: React.FC = () => {
  return (
    <section
      id="video-demo"
      className="pt-0 pb-0 bg-black overflow-hidden"
    >
      {/* Full-Width Video - No Frame */}
      <div className="w-full">
        <div className="relative aspect-video w-full bg-black">
          <div className="pointer-events-none absolute inset-0 bg-black/60" />
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/VA6F3PjUEX8?autoplay=0&mute=0&controls=1&modestbranding=1&rel=0&showinfo=0"
            title="Spectra Hair Salon Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            loading="eager"
          />
        </div>
      </div>
    </section>
  );
};

export default VideoSection;
