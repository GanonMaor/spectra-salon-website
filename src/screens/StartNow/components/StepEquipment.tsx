import React from "react";
import { MonitorPlay, Scale, Tablet } from "lucide-react";
import { EQUIPMENT_OPTIONS } from "../constants";
import type { EquipmentId } from "../types";
import type { StartNowController } from "../useStartNow";

const ICONS: Record<EquipmentId, React.ReactNode> = {
  "precision-scale": <Scale size={22} aria-hidden="true" />,
  "tablet-stand": <Tablet size={22} aria-hidden="true" />,
  "online-setup": <MonitorPlay size={22} aria-hidden="true" />,
};

export const StepEquipment: React.FC<{ flow: StartNowController }> = ({ flow }) => (
  <div className="snw-step">
    <p className="sai-eyebrow">Everything you need</p>
    <h1 ref={flow.headingRef} className="snw-title" tabIndex={-1}>
      Select your setup.
    </h1>
    <p className="sai-lede snw-lede">
      Choose the equipment you want to start measuring color in your salon.
    </p>

    <fieldset className={`snw-fieldset${flow.errors.equipment ? " snw-field--error" : ""}`}>
      <legend className="snw-sr-only">Equipment bundle</legend>
      <div className="snw-choices" id="snw-equipment" tabIndex={-1}>
        {EQUIPMENT_OPTIONS.map((option) => {
          const selected = flow.equipment.includes(option.id);
          return (
            <button
              key={option.id}
              type="button"
              className={`snw-choice${selected ? " is-selected" : ""}`}
              aria-pressed={selected}
              onClick={() => flow.toggleEquipment(option.id)}
            >
              <span className="snw-choice__icon">{ICONS[option.id]}</span>
              <span className="snw-choice__copy">
                <span className="snw-choice__title">{option.title}</span>
                <span className="snw-choice__text">{option.description}</span>
              </span>
              <span className="snw-choice__tick" aria-hidden="true">
                {selected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
      {flow.errors.equipment ? (
        <p className="sai-field-error snw-error" role="alert">
          {flow.errors.equipment}
        </p>
      ) : (
        <p className="snw-hint">These are general labels. This local kit is not a branded product list.</p>
      )}
    </fieldset>
  </div>
);
