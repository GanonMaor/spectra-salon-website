import { countryName } from "./constants";
import type { StartNowOrder } from "./types";

export interface OrderEmailPreview {
  subject: string;
  previewText: string;
  greeting: string;
  paragraphs: string[];
}

/**
 * Local confirmation-email copy. Nothing is sent from this module.
 */
export function buildOrderEmailPreview(order: StartNowOrder): OrderEmailPreview {
  const firstName = order.account.contactName.split(" ")[0] || "there";
  const destination = order.delivery.destinationSummary;
  const country = countryName(order.shipping.country);

  return {
    subject: `Spectra order ${order.id}: local confirmation preview`,
    previewText: "Your local order preview is ready.",
    greeting: `Hi ${firstName},`,
    paragraphs: [
      `This is a local confirmation preview for ${order.account.salonName}. Live email is not sent from this module.`,
      `Order ${order.id} is saved in this browser. Typical delivery to ${destination || country} is ${order.delivery.label}.`,
      "Authorization was simulated locally. No card or PayPal credentials were collected.",
    ],
  };
}
