import { FINAL_META } from "../../../src/screens/ExternalInvestorUpdate/finalCopy";
import {
  PREVIEWS,
  SOCIAL_BOT_RE,
  getPreview,
  renderPreviewHtml,
} from "../social-preview";

const EXTERNAL = "/investors/2026-external";
const OG_DESCRIPTION =
  "How a salon color platform became a real operating data layer — and the foundation for a much bigger vision.";

function htmlFor(path: string, origin = "https://salonos.ai"): string {
  const meta = getPreview(path);
  if (!meta) throw new Error(`missing preview for ${path}`);
  return renderPreviewHtml(new URL(`${origin}${path}`), meta);
}

describe("social-preview", () => {
  it("keeps existing route previews unchanged", () => {
    expect(PREVIEWS["/crm/analytics"]?.title).toBe("Spectra Salon CRM Analytics Dashboard");
    expect(PREVIEWS["/investors/new-narrative-salon-ai-first"]?.title).toBe(
      "Salon AI Investor Deck | Spectra",
    );
    expect(PREVIEWS["/investors/2026-update"]?.title).toBe("Spectra | August 2026 Investor Update");
    expect(PREVIEWS["/investors/2026-update"]?.ogTitle).toBeUndefined();
    expect(PREVIEWS["/investors/2026-update"]?.type).toBeUndefined();
  });

  it("defines External Investor Story metadata for crawlers", () => {
    const meta = getPreview(EXTERNAL);
    expect(meta).toMatchObject({
      title: "Spectra | From Color Intelligence to Salon AI",
      ogTitle: "Spectra: From Color Intelligence to Salon AI",
      description: OG_DESCRIPTION,
      image: "/investor/og/2026-external-cover.jpg",
      width: 1200,
      height: 630,
      type: "article",
    });
  });

  it("returns route-specific tags in initial HTML, including Twitter mirrors", () => {
    const html = htmlFor(EXTERNAL);

    expect(html).toContain("<title>Spectra | From Color Intelligence to Salon AI</title>");
    expect(html).toContain(
      'property="og:title" content="Spectra: From Color Intelligence to Salon AI"',
    );
    expect(html).toContain(`property="og:description" content="${OG_DESCRIPTION}"`);
    expect(html).toContain('property="og:type" content="article"');
    expect(html).toContain('property="og:url" content="https://salonos.ai/investors/2026-external"');
    expect(html).toContain('rel="canonical" href="https://salonos.ai/investors/2026-external"');
    expect(html).toContain(
      'property="og:image" content="https://salonos.ai/investor/og/2026-external-cover.jpg"',
    );
    expect(html).toContain('property="og:image:width" content="1200"');
    expect(html).toContain('property="og:image:height" content="630"');
    expect(html).toContain('name="twitter:card" content="summary_large_image"');
    expect(html).toContain(
      'name="twitter:title" content="Spectra: From Color Intelligence to Salon AI"',
    );
    expect(html).toContain(`name="twitter:description" content="${OG_DESCRIPTION}"`);
    expect(html).toContain(
      'name="twitter:image" content="https://salonos.ai/investor/og/2026-external-cover.jpg"',
    );
    expect(html).not.toContain("Reduce Waste by 85%");
    expect(html).not.toContain("spectra-logo-new.png");
    expect(FINAL_META.title).toBe("Spectra | From Color Intelligence to Salon AI");
  });

  it("does not attach investor-story metadata to other paths", () => {
    expect(getPreview("/")).toBeUndefined();
    expect(getPreview("/investors/2026-update")?.ogTitle).toBeUndefined();
    expect(getPreview("/investors/2026-update")?.description).toBe(
      "A private update for Spectra's existing investors.",
    );
  });

  it("matches WhatsApp and LinkedIn crawler user agents", () => {
    expect(SOCIAL_BOT_RE.test("WhatsApp/2.24.16.76 A")).toBe(true);
    expect(SOCIAL_BOT_RE.test("facebookexternalhit/1.1")).toBe(true);
    expect(SOCIAL_BOT_RE.test("LinkedInBot/1.0")).toBe(true);
    expect(SOCIAL_BOT_RE.test("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)")).toBe(false);
  });
});
