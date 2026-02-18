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

/**
 * Build a condensed text context from market-intelligence.json
 * that fits within ~6K tokens so OpenAI can ground its answers.
 */
function buildContext(dataset, filters) {
  const lines = [];

  // 1. Summary
  const s = dataset.summary;
  lines.push(`=== MARKET SUMMARY ===`);
  lines.push(`Period: ${s.dateRange.from} – ${s.dateRange.to} (${s.totalMonths} months)`);
  lines.push(`Total salons: ${s.totalCustomers}, Brands: ${s.totalBrands}, Visits: ${s.totalVisits}, Services: ${s.totalServices}, Revenue (cost): $${s.totalRevenue.toFixed(0)}, Grams: ${s.totalGrams}`);

  // 2. Monthly trends
  lines.push(`\n=== MONTHLY TRENDS ===`);
  lines.push(`Month | Visits | Services | Revenue$ | Grams | Brands | Color | Highlights | Toner | Straight | Other`);
  for (const m of dataset.monthlyTrends) {
    lines.push(`${m.label} | ${m.totalVisits} | ${m.totalServices} | ${m.totalRevenue.toFixed(0)} | ${m.totalGrams} | ${m.activeBrands} | ${m.colorServices} | ${m.highlightsServices} | ${m.tonerServices} | ${m.straighteningServices} | ${m.othersServices}`);
  }

  // 3. Service breakdown
  lines.push(`\n=== SERVICE TYPE BREAKDOWN ===`);
  for (const sb of dataset.serviceBreakdown) {
    lines.push(`${sb.type}: ${sb.totalServices} services, $${sb.totalRevenue.toFixed(0)} revenue, ${sb.totalGrams}g`);
  }

  // 4. Top 30 brands by services
  lines.push(`\n=== TOP 30 BRANDS (by total services) ===`);
  lines.push(`Brand | Services | Revenue$ | Visits | Grams | MonthsActive`);
  const topBrands = [...dataset.brandPerformance].sort((a, b) => b.totalServices - a.totalServices).slice(0, 30);
  for (const b of topBrands) {
    lines.push(`${b.brand} | ${b.totalServices} | ${b.totalRevenue.toFixed(0)} | ${b.totalVisits} | ${b.totalGrams} | ${b.monthsActive}`);
  }

  // 5. Geographic
  lines.push(`\n=== GEOGRAPHIC DISTRIBUTION ===`);
  for (const g of dataset.geographicDistribution) {
    const cities = (g.topCities || []).map(c => `${c.city}(${c.services})`).join(", ");
    lines.push(`${g.country}: ${g.totalServices} svc, $${g.totalRevenue.toFixed(0)}, ${g.totalVisits} visits. Top: ${cities}`);
  }

  // 6. Salon size benchmarks
  lines.push(`\n=== SALON SIZE BENCHMARKS ===`);
  for (const sz of dataset.salonSizeBenchmarks) {
    lines.push(`${sz.label}: ${sz.count} salons, avg ${sz.avgServices} svc, $${sz.avgRevenue.toFixed(0)} rev, ${sz.avgVisits} vis`);
  }

  // 7. Pricing trends
  lines.push(`\n=== PRICING TRENDS (declared client prices) ===`);
  lines.push(`Month | RootColor$ | Highlights$ | Haircut$`);
  for (const p of dataset.pricingTrends) {
    lines.push(`${p.label} | ${p.avgRootColorPrice ?? "-"} | ${p.avgHighlightsPrice ?? "-"} | ${p.avgHaircutPrice ?? "-"}`);
  }

  // 8. If filters are active, note them
  if (filters) {
    const active = [];
    if (filters.monthFrom) active.push(`from: ${filters.monthFrom}`);
    if (filters.monthTo) active.push(`to: ${filters.monthTo}`);
    if (filters.countries?.length) active.push(`countries: ${filters.countries.join(",")}`);
    if (filters.cities?.length) active.push(`cities: ${filters.cities.join(",")}`);
    if (active.length) {
      lines.push(`\n=== ACTIVE USER FILTERS ===`);
      lines.push(active.join(" | "));
      lines.push(`Note: The user is viewing a filtered subset of the data. Tailor your answer to the filtered context when relevant.`);
    }
  }

  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are a market intelligence analyst for the professional hair salon industry.
You have access ONLY to the dataset provided below. 

Rules:
- Answer ONLY based on the provided data. Never invent numbers or facts.
- If the data doesn't contain enough information to answer, say so clearly.
- Be concise and actionable. Use numbers from the data to support your points.
- Structure your response as: a short main answer paragraph, then 3-5 bullet points with key insights.
- Respond in the same language the user asks in (Hebrew → Hebrew, English → English).
- All monetary values in the data represent professional product procurement costs (what salons pay for materials), NOT client-facing prices, unless explicitly labeled as "declared client prices".
- "Grams" means product material consumed.

Return your response as valid JSON with this exact structure:
{
  "answer": "Main answer paragraph here",
  "bullets": ["Insight 1", "Insight 2", "Insight 3"],
  "confidence": "high" | "medium" | "low",
  "dataWindow": "Brief note about what data range was used"
}

IMPORTANT: Return ONLY the JSON object, no markdown fences, no extra text.`;

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return cors(200, {});
  if (event.httpMethod !== "POST") return err(405, "POST only");

  const accessCode = getHeader(event.headers, "X-Access-Code");
  if (accessCode !== "070315") return err(401, "Unauthorized");

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return err(503, "AI service not configured");

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return err(400, "Invalid JSON");
  }

  const { prompt, filters } = body;
  if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
    return err(400, "prompt is required");
  }
  if (prompt.length > 2000) return err(400, "Prompt too long (max 2000 chars)");

  const context = buildContext(marketData, filters);
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        max_tokens: 1200,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n=== DATASET ===\n${context}` },
          { role: "user", content: prompt.trim() },
        ],
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("OpenAI error:", res.status, errBody);
      if (res.status === 429) return err(429, "AI rate limit reached — try again shortly");
      return err(502, "AI service error");
    }

    const completion = await res.json();
    const raw = (completion.choices?.[0]?.message?.content || "").trim();

    // Parse the JSON response from OpenAI
    let parsed;
    try {
      const cleaned = raw.replace(/^```json?\s*/i, "").replace(/```\s*$/, "");
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { answer: raw, bullets: [], confidence: "medium", dataWindow: "Unknown" };
    }

    return cors(200, {
      answer: parsed.answer || "",
      bullets: parsed.bullets || [],
      confidence: parsed.confidence || "medium",
      dataWindow: parsed.dataWindow || `${marketData.summary.dateRange.from} – ${marketData.summary.dateRange.to}`,
      model,
    });
  } catch (e) {
    console.error("market-insights error:", e);
    return err(500, e.message || "Internal error");
  }
};
