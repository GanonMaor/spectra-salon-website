import React from "react";
import { FIRST_POST_CONFIRM_STEP, STEP_GROUPS, STEP_LABELS } from "../constants";
import type { StartNowStepIndex } from "../types";
import { START_NOW_STEPS } from "../types";

interface ProgressIndicatorProps {
  step: StartNowStepIndex;
  locked: boolean;
  onSelect?: (step: StartNowStepIndex) => void;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ step, locked, onSelect }) => {
  const currentGroupIndex = STEP_GROUPS.findIndex((group) =>
    (group.stepIds as readonly string[]).includes(START_NOW_STEPS[step]),
  );

  return (
    <nav className="snw-progress" aria-label="Order progress">
      <ol className="snw-progress__list">
        {STEP_LABELS.map((label, index) => {
          const current = index === step;
          const reachable = locked
            ? index >= FIRST_POST_CONFIRM_STEP && index <= step
            : index <= step;
          return (
            <li
              key={label}
              className={`snw-progress__item${current ? " is-current" : ""}${index < step ? " is-complete" : ""}`}
            >
              {onSelect && reachable ? (
                <button
                  type="button"
                  className="snw-progress__button"
                  aria-current={current ? "step" : undefined}
                  onClick={() => onSelect(index as StartNowStepIndex)}
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

      <div className="snw-progress__groups" aria-hidden="true">
        {STEP_GROUPS.map((group, index) => {
          const current = index === currentGroupIndex;
          const complete = index < currentGroupIndex;
          return (
            <React.Fragment key={group.id}>
              {index > 0 ? (
                <span
                  className={`snw-progress__segment${index <= currentGroupIndex ? " is-on" : ""}`}
                />
              ) : null}
              <span
                className={`snw-progress__dot${current ? " is-current" : ""}${complete ? " is-complete" : ""}`}
                title={group.label}
              />
            </React.Fragment>
          );
        })}
      </div>

      <div className="snw-progress__meta">
        <p className="snw-progress__groups-label" aria-hidden="true">
          {STEP_GROUPS[currentGroupIndex]?.label}
        </p>
        <p className="snw-progress__count">
          {locked ? "Order placed" : `Step ${step + 1} of ${STEP_LABELS.length}`}
        </p>
      </div>
    </nav>
  );
};
