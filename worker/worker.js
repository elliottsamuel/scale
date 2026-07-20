/**
 * SCALE — AI reflection Worker (Cloudflare Workers AI)
 *
 * Returns a short "reflect & sharpen" response for Step 1 of the SCALE app,
 * using Cloudflare's built-in AI models. No API key and no credit card — it
 * runs on Cloudflare's free daily allowance.
 *
 * Setup:
 *   1. Create a Worker in the Cloudflare dashboard and paste this file.
 *   2. Add a Workers AI binding named `AI`
 *      (Settings -> Bindings -> Add -> Workers AI -> variable name: AI),
 *      or use the [ai] block in wrangler.toml if deploying via the CLI.
 *   3. Deploy, then put the Worker URL into WORKER_URL in the SCALE app.
 *
 * No secrets required.
 */

// Cloudflare Workers AI model. Swap to "@cf/meta/llama-3.1-8b-instruct" for a
// lighter/cheaper model if you ever bump into the free daily allowance.
const MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SYSTEM_PROMPT = `You are the guide inside SCALE, a five-step framework that helps someone move from where they are (A) to where they want to be (B). The user has just described, in their own words, what they want to use SCALE to help them with. Their chosen focus is provided.

Reply with a warm, specific reflection of 2-3 short sentences (under 55 words total). Show you genuinely understood their situation by drawing on the concrete details they gave, not generic encouragement. Then mirror back the essence of what they're trying to achieve, sharpening it into one clear sense of direction. Do not add new goals or advice, do not ask questions, and do not mention "step A" or "step B" by name. Speak directly to them as "you". Sound like a thoughtful human guide, never a chatbot. Output only the reflection with no preamble and no quotation marks.`;

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
    if (!env.AI) {
      return json({ error: "ai_binding_missing" }, 500, allowed);
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

    let result;
    try {
      result = await env.AI.run(MODEL, {
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        max_tokens: 220,
        temperature: 0.7,
      });
    } catch (e) {
      return json({ error: "ai_error", detail: String(e).slice(0, 300) }, 502, allowed);
    }

    const text =
      result && typeof result.response === "string" ? result.response.trim() : "";
    if (!text) {
      return json({ error: "empty_reflection" }, 502, allowed);
    }
    return json({ reflection: text }, 200, allowed);
  },
};
