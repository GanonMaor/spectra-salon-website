import React from "react";
import { Check } from "lucide-react";
import type { StartNowController } from "../useStartNow";

export const StepAllSet: React.FC<{ flow: StartNowController }> = ({ flow }) => (
  <div className="snw-step">
    <div className="snw-check" aria-hidden="true">
      <Check size={26} />
    </div>
    <p className="sai-eyebrow">Welcome to Spectra</p>
    <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
      You&apos;re all set.
    </h1>
    <p className="sai-lede snw-lede">
      Your local account is ready. Equipment shipping takes about 3 to 5 business days.
    </p>

    <ol className="snw-next-list">
      <li>
        <span>1</span>
        We&apos;ll treat your equipment as ready to ship in this preview ({flow.delivery.label}).
      </li>
      <li>
        <span>2</span>
        Order details stay in this browser. Live email is not sent.
      </li>
      <li>
        <span>3</span>
        Set up Spectra on your tablet when you are ready.
      </li>
      <li>
        <span>4</span>
        Sign in later. This flow does not open the CRM automatically.
      </li>
    </ol>
  </div>
);
