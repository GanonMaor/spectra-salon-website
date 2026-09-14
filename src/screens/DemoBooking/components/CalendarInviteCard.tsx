import React from "react";
import { formatFriendlyDateTime, formatTimeZoneOffsetLabel } from "../time";
import type { DemoBooking } from "../types";

interface CalendarInviteCardProps {
  booking: DemoBooking;
  googleUrl: string | null;
  outlookUrl: string | null;
  onDownloadIcs: () => void;
}

export const CalendarInviteCard: React.FC<CalendarInviteCardProps> = ({
  booking,
  googleUrl,
  outlookUrl,
  onDownloadIcs,
}) => {
  const offset = formatTimeZoneOffsetLabel(booking.timezone, new Date(booking.slot.startIso));

  return (
    <article className="dbk-invite" aria-labelledby="dbk-invite-title">
      <p className="sai-eyebrow">Calendar invite</p>
      <h2 id="dbk-invite-title" className="dbk-invite__title">
        Spectra demo
      </h2>
      <p className="dbk-invite__when">
        {formatFriendlyDateTime(booking.slot.startIso, booking.timezone)} ({offset})
      </p>
      <dl className="dbk-invite__meta">
        <div>
          <dt>Join the meeting</dt>
          <dd>
            <a href={booking.meeting.joinUrl}>{booking.meeting.joinUrl}</a>
          </dd>
        </div>
        <div>
          <dt>Meeting ID</dt>
          <dd>{booking.meeting.meetingId}</dd>
        </div>
        <div>
          <dt>Passcode</dt>
          <dd>{booking.meeting.passcode}</dd>
        </div>
      </dl>
      <div className="dbk-invite__actions">
        <button type="button" className="sai-button" onClick={onDownloadIcs}>
          Download .ics
        </button>
        {googleUrl ? (
          <a className="dbk-text-link" href={googleUrl} target="_blank" rel="noreferrer">
            Google Calendar
          </a>
        ) : null}
        {outlookUrl ? (
          <a className="dbk-text-link" href={outlookUrl} target="_blank" rel="noreferrer">
            Outlook
          </a>
        ) : null}
      </div>
    </article>
  );
};
