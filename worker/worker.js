/**
 * SCALE — AI reflection Worker (Cloudflare)
 *
 * Holds the Anthropic API key as a secret (never exposed to the browser) and
 * returns a short "reflect & sharpen" response for Step 1 of the SCALE app.
 *
 * Setup:
 *   1. Create a Worker in the Cloudflare dashboard and paste this file.
 *   2. Settings → Variables and Secrets → add secret ANTHROPIC_API_KEY.
 *   3. (Optional) set ALLOWED_ORIGIN to lock CORS to your site.
 *   4. Deploy, then put the Worker URL into WORKER_URL in the SCALE app.
 */

const MODEL = "claude-haiku-4-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT = `You are the guide inside SCALE, a five-step framework that helps someone move from where they are (A) to where they want to be (B). The user has just described, in their own words, what they want to use SCALE to help them with. Their chosen focus is provided.

Reply with a warm, specific reflection of 2–3 short sentences (under 55 words total). Show you genuinely understood their situation by drawing on the concrete details they gave — not generic encouragement. Then mirror back the essence of what they're trying to achieve, sharpening it into one clear sense of direction. Do not add new goals or advice, do not ask questions, and do not mention "step A" or "step B" by name. Speak directly to them as "you". Sound like a thoughtful human guide, never a chatbot. Output only the reflection — no preamble, no quotation marks.`;

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const allowed = env.ALLOWED_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(allowed) });
    }
    if (request.method !== "POST") {
      return json({ error: "method_not_allowed" }, 405, allowed);
    }
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "server_not_configured" }, 500, allowed);
    }

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return json({ error: "bad_json" }, 400, allowed);
    }

    const useCase = String(payload.useCase || "").slice(0, 200);
    const challenge = String(payload.challenge || "").slice(0, 2000);
    if (!challenge.trim()) {
      return json({ error: "empty_challenge" }, 400, allowed);
    }

    const userMessage =
      "Their chosen focus: " + (useCase || "(not specified)") +
      "\n\nWhat they wrote about what they want help with:\n" + challenge;

    let upstream;
    try {
      upstream = await fetch(ANTHROPIC_URL, {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 220,
          temperature: 0.7,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userMessage }],
        }),
      });
    } catch (e) {
      return json({ error: "upstream_unreachable" }, 502, allowed);
    }

    if (!upstream.ok) {
      const detail = (await upstream.text()).slice(0, 300);
      return json({ error: "upstream_error", status: upstream.status, detail }, 502, allowed);
    }

    const data = await upstream.json();
    const text =
      data && Array.isArray(data.content) && data.content[0] && data.content[0].text
        ? data.content[0].text.trim()
        : "";

    if (!text) {
      return json({ error: "empty_reflection" }, 502, allowed);
    }
    return json({ reflection: text }, 200, allowed);
  },
};
