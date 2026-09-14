import { formatTimeZoneOffsetLabel, toUtcCompact } from "./time";
import type { DemoBooking } from "./types";

const fold = (line: string): string => {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  chunks.push(remaining.slice(0, 75));
  remaining = remaining.slice(75);
  while (remaining.length > 0) {
    chunks.push(` ${remaining.slice(0, 74)}`);
    remaining = remaining.slice(74);
  }
  return chunks.join("\r\n");
};

const escapeText = (value: string): string =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

export function buildDemoBookingIcs(booking: DemoBooking): string {
  const stamp = toUtcCompact(booking.createdAt);
  const start = toUtcCompact(booking.slot.startIso);
  const end = toUtcCompact(booking.slot.endIso);
  const offset = formatTimeZoneOffsetLabel(booking.timezone, new Date(booking.slot.startIso));
  const description = [
    `Your Spectra demo is confirmed.`,
    `Timezone: ${booking.timezone} (${offset})`,
    `Join: ${booking.meeting.joinUrl}`,
    `Meeting ID: ${booking.meeting.meetingId}`,
    `Passcode: ${booking.meeting.passcode}`,
    `Salon: ${booking.details.salonName}`,
  ].join("\n");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Spectra//Demo Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${booking.id}@spectra.salon`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeText("Spectra demo")}`,
    `DESCRIPTION:${escapeText(description)}`,
    "LOCATION:Online meeting",
    `URL:${booking.meeting.joinUrl}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return `${lines.map(fold).join("\r\n")}\r\n`;
}

export function downloadIcsFile(booking: DemoBooking): void {
  const ics = buildDemoBookingIcs(booking);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `spectra-demo-${booking.id}.ics`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function googleCalendarUrl(booking: DemoBooking): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: "Spectra demo",
    dates: `${toUtcCompact(booking.slot.startIso)}/${toUtcCompact(booking.slot.endIso)}`,
    details: [
      "Your Spectra demo is confirmed.",
      `Join: ${booking.meeting.joinUrl}`,
      `Meeting ID: ${booking.meeting.meetingId}`,
      `Passcode: ${booking.meeting.passcode}`,
    ].join("\n"),
    location: "Online meeting",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export function outlookCalendarUrl(booking: DemoBooking): string {
  const params = new URLSearchParams({
    rru: "addevent",
    subject: "Spectra demo",
    startdt: new Date(booking.slot.startIso).toISOString(),
    enddt: new Date(booking.slot.endIso).toISOString(),
    body: `Join: ${booking.meeting.joinUrl}\nMeeting ID: ${booking.meeting.meetingId}\nPasscode: ${booking.meeting.passcode}`,
    location: "Online meeting",
  });
  return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
}
