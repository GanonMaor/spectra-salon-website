import {
  PREVIEWS,
  SOCIAL_BOT_RE,
  getPreview,
  renderPreviewHtml,
} from "../social-preview";

function htmlFor(path: string, origin = "https://salonos.ai"): string {
  const meta = getPreview(path);
  if (!meta) throw new Error(`missing preview for ${path}`);
  return renderPreviewHtml(new URL(`${origin}${path}`), meta);
}

describe("social-preview", () => {
  it("defines Salon AI homepage metadata for WhatsApp", () => {
    const meta = getPreview("/new-home");
    expect(meta).toMatchObject({
      title: "Salon AI | All your salon software. In one place.",
      description:
        "Booking, CRM, team management, inventory, color intelligence and business insights in one AI-powered platform — less admin, lower costs and smarter growth for professional hair salons.",
      image: "/new-home/salon-ai-colorist-editorial-hero.jpg",
      width: 720,
      height: 1280,
    });

    const html = htmlFor("/new-home");
    expect(html).toContain(
      'property="og:image" content="https://salonos.ai/new-home/salon-ai-colorist-editorial-hero.jpg"',
    );
    expect(html).toContain('property="og:image:width" content="720"');
    expect(html).toContain('property="og:image:height" content="1280"');
    expect(html).toContain(
      'property="og:title" content="Salon AI | All your salon software. In one place."',
    );
    expect(html).toContain("Booking, CRM, team management, inventory, color intelligence");
  });

  it("keeps existing route previews unchanged", () => {
    expect(PREVIEWS["/crm/analytics"]?.title).toBe("Spectra Salon CRM Analytics Dashboard");
    expect(PREVIEWS["/investors/new-narrative-salon-ai-first"]?.title).toBe(
      "Salon AI Investor Deck | Spectra",
    );
    expect(PREVIEWS["/investors/2026-update"]?.title).toBe("Spectra | August 2026 Investor Update");
    expect(PREVIEWS["/investors/2026-update"]?.ogTitle).toBeUndefined();
    expect(PREVIEWS["/investors/2026-update"]?.type).toBeUndefined();
  });

  it("defines Founder Story presentation metadata for crawlers", () => {
    const meta = getPreview("/investors/founder-story");
    expect(meta).toMatchObject({
      title: "Spectra | Founder Story · Investor Edition",
      ogTitle: "Spectra: We started with color. Now we're building Salon AI.",
      image: "/investor/og/2026-external-cover.jpg",
      type: "article",
      noindex: true,
    });
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
