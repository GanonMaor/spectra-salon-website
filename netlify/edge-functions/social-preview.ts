const SOCIAL_BOT_RE =
  /(facebookexternalhit|facebot|twitterbot|linkedinbot|whatsapp|telegrambot|slackbot|discordbot|pinterest|googlebot|bingbot)/i;

type PreviewMeta = {
  title: string;
  description: string;
  image: string;
  width: number;
  height: number;
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
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderPreview(url: URL, meta: PreviewMeta): Response {
  const canonicalUrl = `${url.origin}${url.pathname}`;
  const html = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(meta.title)}</title>
    <meta name="description" content="${escapeHtml(meta.description)}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:title" content="${escapeHtml(meta.title)}" />
    <meta property="og:description" content="${escapeHtml(meta.description)}" />
    <meta property="og:image" content="${meta.image}" />
    <meta property="og:image:secure_url" content="${meta.image}" />
    <meta property="og:image:width" content="${meta.width}" />
    <meta property="og:image:height" content="${meta.height}" />
    <meta property="og:site_name" content="Spectra" />
    <meta property="og:locale" content="en_US" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${canonicalUrl}" />
    <meta name="twitter:title" content="${escapeHtml(meta.title)}" />
    <meta name="twitter:description" content="${escapeHtml(meta.description)}" />
    <meta name="twitter:image" content="${meta.image}" />
  </head>
  <body>
    <a href="${canonicalUrl}">${escapeHtml(meta.title)}</a>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

export default async (request: Request, context: { next: () => Promise<Response> }) => {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/\/$/, "") || "/";
  const meta = PREVIEWS[pathname];
  const userAgent = request.headers.get("user-agent") ?? "";

  if (meta && SOCIAL_BOT_RE.test(userAgent)) {
    return renderPreview(url, meta);
  }

  return context.next();
};

