const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomChars(length: number): string {
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const bytes = new Uint8Array(length);
    crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => ALPHABET[byte % ALPHABET.length]).join("");
  }
  return Array.from({ length }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
}

/** Public booking id, e.g. SBK-7K4M2Q9H */
export function createBookingId(): string {
  return `SBK-${randomChars(8)}`;
}

export function createMeetingCredentials(bookingId: string): { meetingId: string; passcode: string } {
  let hash = 0;
  for (let i = 0; i < bookingId.length; i += 1) {
    hash = (hash * 33 + bookingId.charCodeAt(i)) >>> 0;
  }
  const meetingId = String(100000000 + (hash % 900000000));
  const passcode = String(100000 + ((hash >>> 8) % 900000));
  return { meetingId, passcode };
}

export function createSlotId(dateKey: string, minutesFromMidnight: number, timeZone: string): string {
  const hour = String(Math.floor(minutesFromMidnight / 60)).padStart(2, "0");
  const minute = String(minutesFromMidnight % 60).padStart(2, "0");
  return `${dateKey}T${hour}${minute}@${timeZone}`;
}
