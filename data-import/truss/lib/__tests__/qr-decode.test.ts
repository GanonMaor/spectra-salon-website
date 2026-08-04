/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require("fs");
const path = require("path");
const { decodeQrFromPngFile } = require("../qr-decode");

describe("TRUSS QR decode", () => {
  const page1 = path.resolve(__dirname, "../../media/pages/page-001.png");

  it("decodes TRS-8557 page QR to EAN 7898625796056 when page PNG is present", () => {
    if (!fs.existsSync(page1)) {
      console.warn("skipping QR decode test — page PNG not rendered locally");
      return;
    }
    const result = decodeQrFromPngFile(page1);
    expect(result.decoded).toBe(true);
    expect(result.ean).toBe("7898625796056");
    expect(result.validation.ok).toBe(true);
  });
});
