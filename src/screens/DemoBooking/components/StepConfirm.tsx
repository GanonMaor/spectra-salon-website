import React from "react";
import { COUNTRIES, IMPROVEMENT_OPTIONS, PHONE_SYSTEM_OPTIONS, STYLIST_OPTIONS } from "../constants";
import { formatFriendlyDateTime } from "../time";
import type { DemoBookingController } from "../useDemoBooking";

export const StepConfirm: React.FC<{ flow: DemoBookingController }> = ({ flow }) => {
  const slot = flow.booking?.slot ?? flow.selectedSlot;
  const booked = flow.status === "confirmed" && !!flow.booking;
  const country = COUNTRIES.find((item) => item.code === flow.details.country)?.name;
  const stylists = STYLIST_OPTIONS.find((item) => item.value === flow.details.stylistCount)?.label;
  const phone = PHONE_SYSTEM_OPTIONS.find((item) => item.value === flow.questions.phoneSystem)?.label;
  const goals = IMPROVEMENT_OPTIONS.filter((item) =>
    flow.questions.improvementGoals.includes(item.value),
  )
    .map((item) => item.label)
    .join(", ");

  return (
    <div className="dbk-step">
      <p className="sai-eyebrow">{booked ? "You're booked" : "Confirm"}</p>
      <h1 ref={flow.headingRef} className="dbk-title dbk-title--confirm" tabIndex={-1}>
        {slot
          ? `${booked ? "See you on" : "See you"} ${formatFriendlyDateTime(slot.startIso, flow.timeZone)}.`
          : "Confirm your demo."}
      </h1>
      <p className="sai-lede dbk-lede">
        {booked
          ? "We'll show you Spectra using a workflow that matches your salon."
          : "Check the details below, then confirm your 30-minute demo."}
      </p>

      {!booked ? (
        <dl className="dbk-summary">
          <div>
            <dt>Salon</dt>
            <dd>{flow.details.salonName}</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>
              {flow.details.contactName}
              <br />
              {flow.details.workEmail}
            </dd>
          </div>
          <div>
            <dt>Salon size</dt>
            <dd>
              {stylists}
              {country ? ` · ${country}` : ""}
            </dd>
          </div>
          {phone ? (
            <div>
              <dt>Today</dt>
              <dd>{phone}</dd>
            </div>
          ) : null}
          {goals ? (
            <div>
              <dt>Focus</dt>
              <dd>{goals}</dd>
            </div>
          ) : null}
        </dl>
      ) : flow.booking ? (
        <p className="dbk-caption" role="status">
          Your demo is saved for {flow.booking.details.workEmail}.
        </p>
      ) : null}

      {flow.submitError ? (
        <p className="dbk-error" role="alert">
          {flow.submitError}
        </p>
      ) : null}
    </div>
  );
};
