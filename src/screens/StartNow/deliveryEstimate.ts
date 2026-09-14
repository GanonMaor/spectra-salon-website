import { countryName } from "./constants";
import type { DeliveryEstimate, ShippingAddress } from "./types";

/**
 * Local mock estimate. Always 3 to 5 business days.
 * Destination is summarized from the shipping address. No carrier APIs are used.
 */
export function estimateDelivery(shipping: ShippingAddress, now = new Date()): DeliveryEstimate {
  const country = countryName(shipping.country);
  const city = shipping.city.trim();
  const destinationSummary = [city, country].filter(Boolean).join(", ") || "your area";

  return {
    minBusinessDays: 3,
    maxBusinessDays: 5,
    label: "3 to 5 business days",
    destinationSummary,
    computedAt: now.toISOString(),
  };
}
