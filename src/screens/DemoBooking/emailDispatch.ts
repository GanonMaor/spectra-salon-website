import type { DemoBooking } from "./types";

export type EmailTemplateId = "demo-confirmation";

export interface EmailDispatchRequest {
  to: string;
  template: EmailTemplateId;
  booking: DemoBooking;
}

export interface EmailDispatchResult {
  dispatched: false;
  reason: "not_configured";
  template: EmailTemplateId;
  to: string;
}

/**
 * Placeholder for future confirmation-email dispatch.
 *
 * A later Netlify Function can send this through a provider. This module
 * never reads secrets and never opens a network connection.
 */
export async function dispatchConfirmationEmail(
  request: EmailDispatchRequest,
): Promise<EmailDispatchResult> {
  return {
    dispatched: false,
    reason: "not_configured",
    template: request.template,
    to: request.to,
  };
}

export function buildConfirmationEmailCopy(booking: DemoBooking): {
  subject: string;
  previewText: string;
  greeting: string;
  body: string[];
  bullets: string[];
} {
  const firstName = booking.details.contactName.split(" ")[0] || "there";
  return {
    subject: "Your Spectra demo is confirmed",
    previewText: "See you soon.",
    greeting: `Hi ${firstName},`,
    body: [
      `Your demo is confirmed.`,
      `In this 30-minute call we will show you Spectra and how it can fit your salon.`,
    ],
    bullets: [
      "A walkthrough of Spectra",
      "A fit for your salon workflow",
      "Answers to your questions",
    ],
  };
}
