import React from "react";
import { CircleHelp, Tablet } from "lucide-react";
import { DEVICE_OPTIONS } from "../constants";
import type { DeviceChoice } from "../types";
import type { StartNowController } from "../useStartNow";

const ICONS: Record<DeviceChoice, React.ReactNode> = {
  ipad: <Tablet size={28} aria-hidden="true" />,
  android: <Tablet size={28} aria-hidden="true" />,
  "need-recommendation": <CircleHelp size={28} aria-hidden="true" />,
};

export const StepDevice: React.FC<{ flow: StartNowController }> = ({ flow }) => (
  <div className="snw-step">
    <p className="sai-eyebrow">Make sure you&apos;re ready</p>
    <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
      Check your tablet.
    </h1>
    <p className="sai-lede snw-lede">
      Do you have a compatible iPad or Android tablet for the color room?
    </p>

    <fieldset className={`snw-fieldset${flow.errors.device ? " snw-field--error" : ""}`}>
      <legend className="snw-sr-only">Tablet choice</legend>
      <div className="snw-choices snw-choices--split" id="snw-device" role="radiogroup" tabIndex={-1}>
        {DEVICE_OPTIONS.map((option) => {
          const selected = flow.device === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              className={`snw-choice snw-choice--device${selected ? " is-selected" : ""}`}
              onClick={() => flow.setDevice(option.id)}
            >
              <span className="snw-choice__icon">{ICONS[option.id]}</span>
              <span className="snw-choice__copy">
                <span className="snw-choice__title">{option.title}</span>
                <span className="snw-choice__text">{option.description}</span>
              </span>
            </button>
          );
        })}
      </div>
      {flow.errors.device ? (
        <p className="sai-field-error snw-error" role="alert">
          {flow.errors.device}
        </p>
      ) : null}
    </fieldset>
  </div>
);
