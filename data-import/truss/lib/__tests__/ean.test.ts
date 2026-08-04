/* eslint-disable @typescript-eslint/no-var-requires */
const { isValidEan13, normalizeBarcodeCandidate, validateBarcode } = require("../ean");

describe("TRUSS EAN helpers", () => {
  it("validates known TRUSS EANs from the PDF catalog", () => {
    expect(isValidEan13("7898625796056")).toBe(true);
    expect(isValidEan13("7898625796049")).toBe(true);
    expect(isValidEan13("7898625795745")).toBe(true);
    expect(isValidEan13("7898625794144")).toBe(true);
    expect(isValidEan13("7898625794199")).toBe(true);
  });

  it("rejects bad check digits", () => {
    expect(isValidEan13("7898625796050")).toBe(false);
    expect(validateBarcode("7898625796050").reason).toBe("invalid_check_digit");
  });

  it("normalizes QR payloads that wrap a GTIN", () => {
    expect(normalizeBarcodeCandidate("7898625796056")).toBe("7898625796056");
    expect(normalizeBarcodeCandidate("https://example.com/7898625796056")).toBe("7898625796056");
  });
});
