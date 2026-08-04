/**
 * EAN-13 / EAN-8 check-digit helpers for the TRUSS import pipeline.
 */

"use strict";

function isValidEan13(barcode) {
  if (typeof barcode !== "string" || !/^\d{13}$/.test(barcode)) return false;
  const digits = barcode.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * (i % 2 === 0 ? 1 : 3);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[12];
}

function isValidEan8(barcode) {
  if (typeof barcode !== "string" || !/^\d{8}$/.test(barcode)) return false;
  const digits = barcode.split("").map((d) => parseInt(d, 10));
  let sum = 0;
  for (let i = 0; i < 7; i++) {
    sum += digits[i] * (i % 2 === 0 ? 3 : 1);
  }
  const check = (10 - (sum % 10)) % 10;
  return check === digits[7];
}

function normalizeBarcodeCandidate(raw) {
  if (raw == null) return null;
  const digits = String(raw).replace(/\D/g, "");
  if (digits.length === 13 || digits.length === 8 || digits.length === 12) return digits;
  // QR payloads sometimes embed URLs or GS1 strings containing the GTIN.
  const m13 = String(raw).match(/(?<!\d)(\d{13})(?!\d)/);
  if (m13) return m13[1];
  const m8 = String(raw).match(/(?<!\d)(\d{8})(?!\d)/);
  if (m8) return m8[1];
  return digits.length ? digits : null;
}

function validateBarcode(raw) {
  const barcode = normalizeBarcodeCandidate(raw);
  if (!barcode) {
    return { ok: false, barcode: null, barcode_type: null, reason: "empty" };
  }
  if (barcode.length === 13 && isValidEan13(barcode)) {
    return { ok: true, barcode, barcode_type: "ean13", reason: null };
  }
  if (barcode.length === 8 && isValidEan8(barcode)) {
    return { ok: true, barcode, barcode_type: "ean8", reason: null };
  }
  if (barcode.length === 13) {
    return { ok: false, barcode, barcode_type: "ean13", reason: "invalid_check_digit" };
  }
  return { ok: false, barcode, barcode_type: "unknown", reason: "unsupported_or_invalid" };
}

module.exports = {
  isValidEan13,
  isValidEan8,
  normalizeBarcodeCandidate,
  validateBarcode,
};
