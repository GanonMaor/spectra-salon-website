import React from "react";
import { ArrowRight } from "lucide-react";
import type { DemoBookingController } from "../useDemoBooking";

export const ThankYouState: React.FC<{ flow: DemoBookingController }> = ({ flow }) => {
  return (
    <div className="dbk-step dbk-thankyou">
      <div className="dbk-check" aria-hidden="true">
        <span>✓</span>
      </div>
      <p className="sai-eyebrow">Thank you</p>
      <h1 ref={flow.headingRef} className="dbk-title" tabIndex={-1}>
        You&apos;re all set.
      </h1>
      <p className="sai-lede dbk-lede">We&apos;ll see you soon and show you Spectra.</p>

      <ul className="dbk-next">
        <li>
          <a className="dbk-next__button" href="/new-home">
            Return to the Salon AI website
          </a>
        </li>
        <li>
          <a
            className="dbk-next__button"
            href="https://www.instagram.com/spectra.ci/"
            target="_blank"
            rel="noreferrer"
          >
            Follow @spectra.ci on Instagram
          </a>
        </li>
        <li>
          <a
            className="dbk-next__button"
            href="https://www.youtube.com/@spectracolorintelligence"
            target="_blank"
            rel="noreferrer"
          >
            Watch Spectra on YouTube
          </a>
        </li>
      </ul>

      <div className="dbk-thankyou__actions">
        <a className="sai-button" href="/new-home#faq">
          Frequently asked questions <ArrowRight aria-hidden="true" size={16} />
        </a>
      </div>
    </div>
  );
};
