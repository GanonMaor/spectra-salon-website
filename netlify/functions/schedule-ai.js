function cors(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-Type": "application/json",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-salon-id, X-Access-Code",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

function err(code, msg) {
  return cors(code, { error: msg });
}

const SYSTEM_PROMPT = `You are Spectra AI — a scheduling assistant for a hair salon. You interpret natural-language requests and convert them into structured calendar actions.

You receive:
- The user's request (in Hebrew or English).
- The current date/time.
- A list of existing appointments (id, client, service, employee, start, end, status, notes).
- A list of staff members (id, name, role).

SUPPORTED ACTIONS (return exactly ONE):

1. "create" — Book a new appointment
   Required fields: client_name, service_name, employee_name, start_time (ISO), end_time (ISO)
   Optional: service_category, notes

2. "move" — Reschedule an existing appointment
   Required: appointment_id, new_start_time (ISO), new_end_time (ISO)

3. "cancel" — Cancel an existing appointment
   Required: appointment_id

4. "assign_staff" — Reassign to different staff
   Required: appointment_id, employee_name

5. "update_notes" — Add or update notes on appointment
   Required: appointment_id, notes

RULES:
1. Respond in the SAME LANGUAGE the user writes in.
2. If you cannot determine required fields, set action to null and return "missing_fields" array listing what's needed, plus a "message" asking the user for clarification.
3. NEVER guess appointment_id — match by client name, time, or service from the provided list. If ambiguous, ask.
4. For "create", if no end_time is specified, assume 60 minutes duration.
5. If no employee is specified for "create", leave employee_name as null (system will use default).
6. Use ISO 8601 date format for all times.
7. "message" should be a short human-readable confirmation or question (1-2 sentences max).

Return ONLY valid JSON with this structure:
{
  "action": { "type": "create|move|cancel|assign_staff|update_notes", ...fields } | null,
  "missing_fields": ["field1", "field2"] | [],
  "message": "Human-readable status message"
}

IMPORTANT: Return ONLY the JSON object. No markdown fences, no extra text.`;

exports.handler = async function (event) {
  if (event.httpMethod === "OPTIONS") return cors(200, {});
  if (event.httpMethod !== "POST") return err(405, "POST only");

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) return err(503, "AI service not configured");

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return err(400, "Invalid JSON");
  }

  const { query, currentDate, appointments, employees } = body;
  if (!query || typeof query !== "string") return err(400, "query is required");
  if (query.length > 2000) return err(400, "Query too long (max 2000 chars)");

  const contextLines = [];
  contextLines.push(`Current date/time: ${currentDate || new Date().toISOString()}`);

  if (employees && employees.length > 0) {
    contextLines.push("\nSTAFF:");
    for (const e of employees) {
      contextLines.push(`  - ${e.name} (id: ${e.id}, role: ${e.role})`);
    }
  }

  if (appointments && appointments.length > 0) {
    contextLines.push("\nTODAY'S APPOINTMENTS:");
    for (const a of appointments) {
      contextLines.push(
        `  - [${a.id}] ${a.client} | ${a.service} | ${a.employee} (${a.employeeId}) | ${a.start} → ${a.end} | ${a.status}${a.notes ? " | notes: " + a.notes : ""}`
      );
    }
  } else {
    contextLines.push("\nNo appointments currently.");
  }

  const context = contextLines.join("\n");
  const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

  const messages = [
    {
      role: "system",
      content: `${SYSTEM_PROMPT}\n\n=== SCHEDULE CONTEXT ===\n${context}`,
    },
    { role: "user", content: query },
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
        temperature: 0.1,
        max_tokens: 1000,
        messages,
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
        action: null,
        missing_fields: [],
        message: raw || "Could not process the request.",
      };
    }

    return cors(200, {
      action: parsed.action || null,
      missing_fields: parsed.missing_fields || [],
      message: parsed.message || "",
    });
  } catch (e) {
    console.error("schedule-ai error:", e);
    return err(500, e.message || "Internal error");
  }
};
