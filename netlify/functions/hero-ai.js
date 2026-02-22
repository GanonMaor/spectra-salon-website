function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

const SYSTEM_PROMPT = `You are Spectra AI — a friendly, knowledgeable sales assistant for Spectra-CI, an AI-powered salon cost optimization platform.

KEY FACTS ABOUT SPECTRA-CI:
- Spectra helps hair salons reduce color product waste by 10-25%
- Average salon saves $8+ per client visit
- Salons typically waste 35% of mixed hair color — it goes down the drain
- Spectra uses a connected smart scale that measures every gram of product used
- Digital formula tracking: every formula saved under client profile for perfect consistency
- Real-time inventory management: automatic tracking, no manual counting
- Works with all major brands: Schwarzkopf, L'Oréal, Wella, Alfaparf, Keune, etc.
- Starter package: $99 one-time (includes SmartScale + 45min setup + 30-day full access + 50 free mixes)
- No disruption to workflow — stylists adopt it instantly
- ROI typically seen within the first month

WASTE CALCULATION FORMULA:
- Average color mix = 60-80g per service
- Average waste per service = 15-25g (dumped leftover)
- Cost per gram ≈ $0.15-0.30 depending on brand
- So waste per service ≈ $3-7
- For a salon doing 20 color services/day = $60-140/day wasted = $1,500-3,500/month
- Spectra saves 60-85% of that waste

YOUR BEHAVIOR:
1. Be warm, professional, and concise (2-4 sentences max per response)
2. Respond in the SAME LANGUAGE the user writes in (Hebrew → Hebrew, English → English)
3. Help potential customers understand their waste and potential savings
4. If someone asks to calculate their waste, ask how many color services they do per day
5. Always end with an actionable next step or question
6. Never make up specific numbers about a user's salon — ask first
7. If asked about competitors, stay positive about Spectra without bashing others

Return ONLY plain text. No JSON, no markdown fences.`;

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return cors(200, {});
  if (event.httpMethod !== "POST") return cors(405, { error: "POST only" });

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return cors(503, { error: "AI not configured" });

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return cors(400, { error: "Invalid JSON" });
  }

  const { messages } = body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return cors(400, { error: "messages required" });
  }

  const lastMsg = messages[messages.length - 1];
  if (!lastMsg?.content || lastMsg.content.length > 1000) {
    return cors(400, { error: "Invalid message" });
  }

  const chatMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...messages.slice(-6).map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 1000),
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
        model: "gpt-4o-mini",
        temperature: 0.7,
        max_tokens: 300,
        messages: chatMessages,
      }),
    });

    if (!res.ok) {
      console.error("OpenAI error:", res.status);
      return cors(502, { error: "AI service error" });
    }

    const completion = await res.json();
    const answer = (completion.choices?.[0]?.message?.content || "").trim();

    return cors(200, { answer });
  } catch (e) {
    console.error("hero-ai error:", e);
    return cors(500, { error: "Internal error" });
  }
};
