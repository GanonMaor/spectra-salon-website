const SOCIAL_BOT_RE =
  /(facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|googlebot|bingbot)/i;

type PreviewMeta = {
  title: string;
  ogTitle?: string;
  description: string;
  image: string;
  width: number;
  height: number;
  /**
   * `website` for product/app surfaces. `article` for dated editorial stories.
   * Defaults to website so existing previews stay unchanged.
   */
  type?: "website" | "article";
  imageAlt?: string;
  noindex?: boolean;
};

const PREVIEWS: Record<string, PreviewMeta> = {
  "/crm/analytics": {
    title: "Spectra Salon CRM Analytics Dashboard",
    description:
      "Live salon CRM analytics for revenue, services, clients, product usage, staff performance, sales, and operating expenses.",
    image: "https://salonos.ai/salonos-dashboard.png",
    width: 1200,
    height: 630,
  },
  "/investors/new-narrative-salon-ai-first": {
    title: "Salon AI Investor Deck | Spectra",
    description:
      "The investor narrative for Spectra's Salon AI platform: live salon intelligence, AI agents, booking automation, color operations, and the future operating system for salons.",
    image: "https://salonos.ai/SalonAi-InvestorDeck.png",
    width: 3600,
    height: 1812,
  },
  "/investors/2026-update": {
    title: "Spectra | August 2026 Investor Update",
    description: "A private update for Spectra's existing investors.",
    image: "https://salonos.ai/SalonAi-InvestorDeck.png",
    width: 3600,
    height: 1812,
    noindex: true,
  },
  "/investors/2026-external": {
    title: "Spectra | From Color Intelligence to Salon AI",
    ogTitle: "Spectra: From Color Intelligence to Salon AI",
    description:
      "How a salon color platform became a real operating data layer — and the foundation for a much bigger vision.",
    image: "/investor/og/2026-external-cover.jpg",
    width: 1200,
    height: 630,
    // Editorial founder story, not a product landing page.
    type: "article",
    imageAlt: "Maor Ganon and Elad Gotlieb, co-founders of Spectra",
    noindex: true,
  },
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, "") || "/";
}

function getPreview(pathname: string): PreviewMeta | undefined {
  return PREVIEWS[normalizePath(pathname)];
}

function absoluteAsset(url: URL, image: string): string {
  if (/^https?:\/\//i.test(image)) return image;
  return `${url.origin}${image.startsWith("/") ? image : `/${image}`}`;
}

function renderPreviewHtml(url: URL, meta: PreviewMeta): string {
  const canonicalUrl = `${url.origin}${normalizePath(url.pathname)}`;
  const ogTitle = meta.ogTitle ?? meta.title;
  const ogType = meta.type ?? "website";
  const image = absoluteAsset(url, meta.image);
  const imageAlt = meta.imageAlt
    ? `
    <meta property="og:image:alt" content="${escapeHtml(meta.imageAlt)}" />
    <meta name="twitter:image:alt" content="${escapeHtml(meta.imageAlt)}" />`
    : "";
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    ${meta.noindex ? '<meta name="robots" content="noindex, nofollow" />' : ""}
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:secure_url" content="${image}" />
    <meta property="og:image:width" content="${meta.width}" />
    <meta property="og:image:height" content="${meta.height}" />${imageAlt}
    <meta property="og:site_name" content="Spectra" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${image}" />
  </head>
  <body>
    <a href="${canonicalUrl}">${escapeHtml(meta.title)}</a>
  </body>
</html>`;
}

function renderPreview(url: URL, meta: PreviewMeta): Response {
  const html = renderPreviewHtml(url, meta);

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
      ...(meta.noindex ? { "x-robots-tag": "noindex, nofollow" } : {}),
    },
  });
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  const meta = getPreview(url.pathname);
  const userAgent = request.headers.get("user-agent") ?? "";

  if (meta && SOCIAL_BOT_RE.test(userAgent)) {
    return renderPreview(url, meta);
  }

  return context.next();
};

export { PREVIEWS, SOCIAL_BOT_RE, getPreview, renderPreview, renderPreviewHtml };
