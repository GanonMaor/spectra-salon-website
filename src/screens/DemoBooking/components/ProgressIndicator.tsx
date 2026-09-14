import React from "react";
import { STEP_LABELS } from "../constants";
import type { DemoBookingStepIndex } from "../types";

interface ProgressIndicatorProps {
  step: DemoBookingStepIndex;
  onSelect?: (step: DemoBookingStepIndex) => void;
  allowJumpTo?: DemoBookingStepIndex;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  step,
  onSelect,
  allowJumpTo = 0,
}) => {
  const percent = ((step + 1) / STEP_LABELS.length) * 100;

  return (
    <>
      <nav className="dbk-progress__nav" aria-label="Booking progress">
        <ol className="dbk-progress__list">
          {STEP_LABELS.map((label, index) => {
            const current = index === step;
            const complete = index < step;
            const reachable = index <= allowJumpTo || index <= step;
            return (
              <li
                key={label}
                className={`dbk-progress__item${current ? " is-current" : ""}${complete ? " is-complete" : ""}`}
              >
                {onSelect && reachable ? (
                  <button
                    type="button"
                    className="dbk-progress__button"
                    aria-current={current ? "step" : undefined}
                    onClick={() => onSelect(index as DemoBookingStepIndex)}
                  >
                    {label}
                  </button>
                ) : (
                  <span aria-current={current ? "step" : undefined}>{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <p className="dbk-progress__count">
        Step {step + 1} of {STEP_LABELS.length}
      </p>
      <div className="dbk-progress__track" aria-hidden="true">
        <div className="dbk-progress__bar" style={{ width: `${percent}%` }} />
      </div>
    </>
  );
};
