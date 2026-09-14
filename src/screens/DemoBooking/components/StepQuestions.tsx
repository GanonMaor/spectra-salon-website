import React from "react";
import { IMPROVEMENT_OPTIONS, PHONE_SYSTEM_OPTIONS } from "../constants";
import type { DemoBookingController } from "../useDemoBooking";
import { ChoiceGroup } from "./FormControls";

export const StepQuestions: React.FC<{ flow: DemoBookingController }> = ({ flow }) => (
  <div className="dbk-step">
    <p className="sai-eyebrow">Help us prepare</p>
    <h1 ref={flow.headingRef} className="dbk-title" tabIndex={-1}>
      A few quick questions.
    </h1>
    <p className="sai-lede dbk-lede">This helps us tailor the demo to your salon.</p>

    <div className="dbk-form dbk-form--questions">
      <ChoiceGroup
        legend="What are you using today?"
        name="phoneSystem"
        options={PHONE_SYSTEM_OPTIONS}
        value={flow.questions.phoneSystem}
        onChange={(value) => flow.setQuestions({ phoneSystem: value })}
        error={flow.errors.phoneSystem}
      />
      <ChoiceGroup
        legend="What do you want to improve first?"
        name="improvementGoals"
        options={IMPROVEMENT_OPTIONS}
        value={flow.questions.improvementGoals}
        onChange={flow.toggleGoal}
        multiple
        error={flow.errors.improvementGoals}
      />
    </div>
  </div>
);
