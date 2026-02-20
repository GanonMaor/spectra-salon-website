const marketData = require("../../src/data/market-intelligence.json");

function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Access-Code",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function err(code, msg) { return cors(code, { error: msg }); }

function getHeader(headers, name) {
  const lower = name.toLowerCase();
  for (const key in headers) {
    if (key.toLowerCase() === lower) return headers[key];
  }
  return "";
}

function buildContext(dataset, filters) {
  const lines = [];

  const s = dataset.summary;
  lines.push("=== MARKET SUMMARY ===");
  lines.push(`Period: ${s.dateRange.from} – ${s.dateRange.to} (${s.totalMonths} months)`);
  lines.push(`Total salons: ${s.totalCustomers}, Brands: ${s.totalBrands}, Visits: ${s.totalVisits}, Services: ${s.totalServices}, Revenue (cost): $${s.totalRevenue.toFixed(0)}, Grams: ${s.totalGrams}`);

  lines.push("\n=== MONTHLY TRENDS ===");
  lines.push("Month | Visits | Services | Revenue$ | Grams | Brands | Color | Highlights | Toner | Straight | Other");
  for (const m of dataset.monthlyTrends) {
    lines.push(`${m.label} | ${m.totalVisits} | ${m.totalServices} | ${m.totalRevenue.toFixed(0)} | ${m.totalGrams} | ${m.activeBrands} | ${m.colorServices} | ${m.highlightsServices} | ${m.tonerServices} | ${m.straighteningServices} | ${m.othersServices}`);
  }

  lines.push("\n=== SERVICE TYPE BREAKDOWN ===");
  for (const sb of dataset.serviceBreakdown) {
    lines.push(`${sb.type}: ${sb.totalServices} services, $${sb.totalRevenue.toFixed(0)} revenue, ${sb.totalGrams}g`);
  }

  lines.push("\n=== TOP 30 BRANDS (by total services) ===");
  lines.push("Brand | Services | Revenue$ | Visits | Grams | MonthsActive");
  const topBrands = [...dataset.brandPerformance].sort((a, b) => b.totalServices - a.totalServices).slice(0, 30);
  for (const b of topBrands) {
    lines.push(`${b.brand} | ${b.totalServices} | ${b.totalRevenue.toFixed(0)} | ${b.totalVisits} | ${b.totalGrams} | ${b.monthsActive}`);
  }

  lines.push("\n=== GEOGRAPHIC DISTRIBUTION ===");
  for (const g of dataset.geographicDistribution) {
    const cities = (g.topCities || []).map(c => `${c.city}(${c.services})`).join(", ");
    lines.push(`${g.country}: ${g.totalServices} svc, $${g.totalRevenue.toFixed(0)}, ${g.totalVisits} visits. Top: ${cities}`);
  }

  lines.push("\n=== SALON SIZE BENCHMARKS ===");
  for (const sz of dataset.salonSizeBenchmarks) {
    lines.push(`${sz.label}: ${sz.count} salons, avg ${sz.avgServices} svc, $${sz.avgRevenue.toFixed(0)} rev, ${sz.avgVisits} vis`);
  }

  lines.push("\n=== PRICING TRENDS (declared client prices) ===");
  lines.push("Month | RootColor$ | Highlights$ | Haircut$");
  for (const p of dataset.pricingTrends) {
    lines.push(`${p.label} | ${p.avgRootColorPrice ?? "-"} | ${p.avgHighlightsPrice ?? "-"} | ${p.avgHaircutPrice ?? "-"}`);
  }

  if (filters) {
    const active = [];
    if (filters.monthFrom) active.push(`from: ${filters.monthFrom}`);
    if (filters.monthTo) active.push(`to: ${filters.monthTo}`);
    if (filters.countries?.length) active.push(`countries: ${filters.countries.join(",")}`);
    if (filters.cities?.length) active.push(`cities: ${filters.cities.join(",")}`);
    if (active.length) {
      lines.push("\n=== ACTIVE USER FILTERS ===");
      lines.push(active.join(" | "));
    }
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are HairGPT — an expert AI business consultant specializing in the professional hair salon industry in Israel.

You have deep knowledge of:
- Hair color brands: Schwarzkopf, L'Oréal Professionnel, Wella, Alfaparf Milano, Keune, Nouvelle, Olaplex, etc.
- Service categories: Color (צבע), Highlights (גוונים), Toner (טונר), Straightening (החלקה), Others
- Market dynamics: seasonality, competition, pricing, inventory management, salon types (A+/A/B+/B/C)
- Israeli salon market trends, growth patterns, brand loyalty and switching

IMPORTANT RULES:
1. Answer ONLY based on the provided dataset. NEVER invent numbers or facts.
2. If the data doesn't contain enough information, say so clearly and suggest what data would help.
3. Be concise and actionable — give advice a salon owner can act on tomorrow morning.
4. Respond in the SAME LANGUAGE the user writes in (Hebrew → Hebrew, English → English).
5. If the question is too vague, suggest 3 specific follow-up questions.
6. All monetary values represent professional product procurement costs (what salons pay for materials), NOT client-facing prices, unless labeled "declared client prices".
7. "Grams" = product material consumed (grams of color/toner/etc.).
8. When the answer involves trends, comparisons, breakdowns, or distributions — include a "chart" object so it can be visualized.

Return your response as valid JSON with this exact structure:
{
  "answer": "Main answer paragraph here (can be multi-line, use \\n for line breaks)",
  "bullets": ["Key insight 1", "Key insight 2", "Key insight 3"],
  "confidence": "high" | "medium" | "low",
  "dataWindow": "Brief note about what data range was used",
  "suggestedFollowUps": ["Follow-up question 1", "Follow-up question 2", "Follow-up question 3"],
  "chart": null or { "type": "bar"|"line"|"pie", "title": "Chart title", "xKey": "label", "series": [{"dataKey": "value", "name": "Series Name", "color": "#6366F1"}], "data": [{"label": "...", "value": 123}, ...] }
}

Chart guidelines:
- Use "bar" for comparisons (brands, months, categories)
- Use "line" for trends over time (monthly data, growth patterns)
- Use "pie" for proportional breakdowns (service mix, brand share)
- Set chart to null when text-only answer is sufficient
- Keep chart data to max 12 items for readability
- Always include Hebrew labels when responding in Hebrew

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`;

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return cors(200, {});
  if (event.httpMethod !== "POST") return err(405, "POST only");

  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== "1212") return err(401, "Unauthorized");

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return err(503, "AI service not configured");

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return err(400, "Invalid JSON");
  }

  const { messages, filters } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return err(400, "messages[] is required");
  }

  const lastMsg = messages[messages.length - 1];
  if (!lastMsg || !lastMsg.content || typeof lastMsg.content !== "string") {
    return err(400, "Last message must have content");
  }
  if (lastMsg.content.length > 3000) return err(400, "Message too long (max 3000 chars)");

  const context = buildContext(marketData, filters);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const chatMessages = [
    { role: "system", content: `${SYSTEM_PROMPT}\n\n=== DATASET ===\n${context}` },
    ...messages.slice(-10).map(m => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: typeof m.content === "string" ? m.content : JSON.stringify(m.content),
    })),
  ];

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: 2000,
        messages: chatMessages,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("OpenAI error:", res.status, errBody);
      if (res.status === 429) return err(429, "AI rate limit — try again shortly");
      return err(502, "AI service error");
    }

    const completion = await res.json();
    const raw = (completion.choices?.[0]?.message?.content || "").trim();

    let parsed;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "");
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        answer: raw,
        bullets: [],
        confidence: "medium",
        dataWindow: "Unknown",
        suggestedFollowUps: [],
        chart: null,
      };
    }

    return cors(200, {
      answer: parsed.answer || "",
      bullets: parsed.bullets || [],
      confidence: parsed.confidence || "medium",
      dataWindow: parsed.dataWindow || `${marketData.summary.dateRange.from} – ${marketData.summary.dateRange.to}`,
      suggestedFollowUps: parsed.suggestedFollowUps || [],
      chart: parsed.chart || null,
      model,
    });
  } catch (e) {
    console.error("hairgpt error:", e);
    return err(500, e.message || "Internal error");
  }
};
