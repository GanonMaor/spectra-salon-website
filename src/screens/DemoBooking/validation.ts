import type { FieldErrors, QualifyingAnswers, SalonDetails, TimeSlot } from "./types";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const trim = (value: string): string => value.trim();

export function validateSalonDetails(details: SalonDetails): FieldErrors {
  const errors: FieldErrors = {};
  const salonName = trim(details.salonName);
  const contactName = trim(details.contactName);
  const workEmail = trim(details.workEmail);

  if (salonName.length < 2) {
    errors.salonName = "Enter your salon name.";
  }
  if (contactName.length < 2) {
    errors.contactName = "Enter your name.";
  }
  if (!workEmail) {
    errors.workEmail = "Enter your work email.";
  } else if (!EMAIL_PATTERN.test(workEmail)) {
    errors.workEmail = "Enter a valid work email.";
  }
  if (!details.country) {
    errors.country = "Select a country.";
  }
  if (!details.stylistCount) {
    errors.stylistCount = "Select how many stylists you have.";
  }

  return errors;
}

export function validateSlot(slot: TimeSlot | null, now = new Date()): FieldErrors {
  if (!slot) {
    return { slot: "Choose an available time." };
  }
  if (!slot.available) {
    return { slot: "That time is no longer available. Choose another slot." };
  }
  if (new Date(slot.startIso).getTime() <= now.getTime()) {
    return { slot: "Choose a future time." };
  }
  return {};
}

export function validateQuestions(_questions: QualifyingAnswers): FieldErrors {
  return {};
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.values(errors).some((value) => Boolean(value));
}

export function firstErrorKey(errors: FieldErrors): keyof FieldErrors | null {
  const keys: Array<keyof FieldErrors> = [
    "salonName",
    "contactName",
    "workEmail",
    "country",
    "stylistCount",
    "slot",
    "phoneSystem",
    "improvementGoals",
    "usesTabletInColorRoom",
    "form",
  ];
  return keys.find((key) => errors[key]) ?? null;
}

export function sanitizeDetails(details: SalonDetails): SalonDetails {
  return {
    salonName: trim(details.salonName),
    contactName: trim(details.contactName),
    workEmail: trim(details.workEmail).toLowerCase(),
    country: details.country,
    stylistCount: details.stylistCount,
  };
}
