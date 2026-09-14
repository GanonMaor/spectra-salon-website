import React, { useState } from "react";
import { BookOpen, ChevronRight, MessageCircle, Phone } from "lucide-react";
import type { StartNowController } from "../useStartNow";

interface StepNextProps {
  flow: StartNowController;
  bookDemoHref: string;
  loginHref: string;
}

export const StepNext: React.FC<StepNextProps> = ({ flow, bookDemoHref, loginHref }) => {
  const [guideNote, setGuideNote] = useState(false);
  const [supportNote, setSupportNote] = useState(false);

  return (
    <div className="snw-step">
      <p className="sai-eyebrow">We&apos;re here for you</p>
      <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
        Need help getting started?
      </h1>
      <p className="sai-lede snw-lede">A few local next steps. Nothing here signs you into the CRM.</p>

      <div className="snw-next-cards">
        <button type="button" className="snw-next-card" onClick={() => setGuideNote(true)}>
          <BookOpen size={20} aria-hidden="true" />
          <span>
            <strong>Watch a 2-minute setup guide</strong>
            <em>A short orientation when the video is attached.</em>
          </span>
          <ChevronRight className="snw-next-card__chevron" size={16} aria-hidden="true" />
        </button>
        {guideNote ? (
          <p className="snw-hint" role="status">
            The setup guide video is not attached in this local module yet.
          </p>
        ) : null}

        <a className="snw-next-card" href={bookDemoHref}>
          <Phone size={20} aria-hidden="true" />
          <span>
            <strong>Book a setup call</strong>
            <em>Opens the demo booking flow.</em>
          </span>
          <ChevronRight className="snw-next-card__chevron" size={16} aria-hidden="true" />
        </a>

        <button type="button" className="snw-next-card" onClick={() => setSupportNote(true)}>
          <MessageCircle size={20} aria-hidden="true" />
          <span>
            <strong>Chat with support</strong>
            <em>Human help when support is wired.</em>
          </span>
          <ChevronRight className="snw-next-card__chevron" size={16} aria-hidden="true" />
        </button>
        {supportNote ? (
          <p className="snw-hint" role="status">
            Live support chat is not wired in this local module.
          </p>
        ) : null}
      </div>

      <p className="snw-caption">
        Ready to sign in? Use{" "}
        <a className="snw-text-link" href={loginHref}>
          salon login
        </a>
        . You will be asked to authenticate before CRM setup.
      </p>
    </div>
  );
};
