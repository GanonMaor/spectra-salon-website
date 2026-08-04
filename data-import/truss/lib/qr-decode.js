/**
 * Decode QR payloads from rendered PDF page PNGs using jsQR.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const jsQR = require("jsqr");
const { normalizeBarcodeCandidate, validateBarcode } = require("./ean");

function decodeQrFromPngBuffer(buf) {
  const png = PNG.sync.read(buf);
  const code = jsQR(Uint8ClampedArray.from(png.data), png.width, png.height, {
    inversionAttempts: "attemptBoth",
  });
  if (!code || !code.data) {
    return { decoded: false, raw: null, ean: null, validation: null };
  }
  const raw = String(code.data).trim();
  const ean = normalizeBarcodeCandidate(raw);
  const validation = validateBarcode(ean || raw);
  return {
    decoded: true,
    raw,
    ean: validation.barcode,
    validation,
  };
}

function decodeQrFromPngFile(filePath) {
  const buf = fs.readFileSync(filePath);
  return decodeQrFromPngBuffer(buf);
}

function pageImagePath(pagesDir, pageNumber) {
  const padded = String(pageNumber).padStart(3, "0");
  return path.join(pagesDir, `page-${padded}.png`);
}

module.exports = {
  decodeQrFromPngBuffer,
  decodeQrFromPngFile,
  pageImagePath,
};
