import React from "react";
import { COUNTRIES } from "../constants";
import { buildConfirmationEmailCopy } from "../emailDispatch";
import { formatFriendlyDateTime, formatTimeZoneOffsetLabel } from "../time";
import type { DemoBooking } from "../types";

export const ConfirmationEmailPreview: React.FC<{ booking: DemoBooking }> = ({ booking }) => {
  const copy = buildConfirmationEmailCopy(booking);
  const offset = formatTimeZoneOffsetLabel(booking.timezone, new Date(booking.slot.startIso));
  const country = COUNTRIES.find((item) => item.code === booking.details.country)?.name ?? booking.details.country;

  return (
    <article className="dbk-email" aria-labelledby="dbk-email-title">
      <header className="dbk-email__header">
        <p className="sai-eyebrow">Confirmation email</p>
        <h2 id="dbk-email-title" className="dbk-email__subject">
          {copy.subject}
        </h2>
        <p className="dbk-email__meta">
          Spectra · hello@spectra.salon → {booking.details.workEmail}
        </p>
      </header>
      <div className="dbk-email__body">
        <p className="dbk-email__kicker">See you soon.</p>
        <p>{copy.greeting}</p>
        <p>
          Your demo is confirmed for{" "}
          <strong>{formatFriendlyDateTime(booking.slot.startIso, booking.timezone)}</strong> ({offset}).
        </p>
        <p>In this 30-minute call we will show you:</p>
        <ul>
          {copy.bullets.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <p>
          {booking.details.salonName}
          {country ? ` · ${country}` : ""}
        </p>
        <a className="sai-button dbk-email__cta" href={booking.meeting.joinUrl}>
          Join the call
        </a>
        <p className="dbk-caption">
          Need to reschedule? Reply to this email. Email delivery is not active yet.
          This is a local preview.
        </p>
      </div>
    </article>
  );
};
