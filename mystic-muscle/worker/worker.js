/**
 * Mystic Muscle — reflection Worker (Anthropic Messages API)
 *
 * Powers the "being read" moment in the early-preview demo. The static site
 * can't hold an API key safely, so this tiny Cloudflare Worker holds it for
 * you and proxies the call to Anthropic.
 *
 * Two jobs, both over POST:
 *   1. Reflection: { "kind": "now" | "goal", "text": "<what they wrote>" }
 *        -> { "reflection": "<2-4 sentences in Mystic Muscle's voice>" }
 *   2. Save (optional): { "op": "save", "payload": { ... } }
 *        -> { "ok": true }   (stored in KV if a SUBMISSIONS binding exists,
 *                             otherwise accepted-and-dropped so the demo
 *                             never breaks)
 *
 * Setup:
 *   1. cd mystic-muscle/worker && npx wrangler deploy
 *      (or paste this file into a Worker in the Cloudflare dashboard).
 *   2. Add your Anthropic key as a secret:
 *        npx wrangler secret put ANTHROPIC_API_KEY
 *   3. (Optional) to actually aggregate anonymous submissions, create a KV
 *      namespace and bind it as SUBMISSIONS (see wrangler.toml).
 *   4. Put the deployed Worker URL into WORKER_URL near the top of the
 *      <script> in mystic-muscle/index.html.
 *
 * Until WORKER_URL is set, the app tries the Anthropic API directly (which
 * works inside the Claude artifact runtime) and otherwise shows an honest,
 * in-voice fallback — so it always works, with or without this backend.
 */

const MODEL = "claude-sonnet-4-6";

const SYSTEM = {
  now: `You are the voice of Mystic Muscle. Someone has just told you where they are with their body and their fitness. Reflect back what you heard — specifically, in their own terms, using their own details. Name the thing underneath what they said: the emotional or energetic reality, not the tactical one. Do not give advice. Do not suggest a workout, a diet, or a plan. Do not praise them for sharing. Do not use the words journey, empower, or unlock. Two to four sentences. Warm, direct, a little irreverent, and unmistakably not generic. If what they wrote is short or guarded, say something true about that instead of inventing depth that isn't there. Output only the reflection — no preamble, no quotation marks.`,
  goal: `You are the voice of Mystic Muscle. Someone has just told you where they want to be in five weeks with their body and themselves. Reflect back what you heard — specifically, in their own terms, using their own details. Name the thing underneath the goal: what they're really reaching for, the emotional or energetic want beneath the physical one. Do not give advice. Do not suggest a workout, a diet, or a plan. Do not congratulate them on the goal. Do not use the words journey, empower, or unlock. Two to four sentences. Warm, direct, a little irreverent, and unmistakably not generic. If what they wrote is short or guarded, say something true about that instead of inventing depth that isn't there. Output only the reflection — no preamble, no quotation marks.`,
};

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

    let payload;
    try {
      payload = await request.json();
    } catch (e) {
      return json({ error: "bad_json" }, 400, allowed);
    }

    // --- optional: store an anonymous submission -------------------------
    if (payload && payload.op === "save") {
      try {
        if (env.SUBMISSIONS && payload.payload) {
          const key = "sub:" + Date.now() + ":" + Math.random().toString(36).slice(2, 8);
          await env.SUBMISSIONS.put(key, JSON.stringify(payload.payload));
        }
      } catch (e) {
        // Accept-and-drop: never break the confirmation over a storage hiccup.
      }
      return json({ ok: true }, 200, allowed);
    }

    // --- reflection ------------------------------------------------------
    if (!env.ANTHROPIC_API_KEY) {
      return json({ error: "api_key_missing" }, 500, allowed);
    }

    const kind = payload && payload.kind === "goal" ? "goal" : "now";
    const text = String((payload && payload.text) || "").slice(0, 6000);
    if (!text.trim()) {
      return json({ error: "empty_text" }, 400, allowed);
    }

    let resp;
    try {
      resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: SYSTEM[kind],
          messages: [{ role: "user", content: text }],
        }),
      });
    } catch (e) {
      return json({ error: "upstream_unreachable" }, 502, allowed);
    }

    if (!resp.ok) {
      const detail = (await resp.text().catch(() => "")).slice(0, 300);
      return json({ error: "upstream_error", status: resp.status, detail }, 502, allowed);
    }

    let data;
    try {
      data = await resp.json();
    } catch (e) {
      return json({ error: "bad_upstream_json" }, 502, allowed);
    }

    const reflection =
      data && data.content && data.content[0] && typeof data.content[0].text === "string"
        ? data.content[0].text.trim()
        : "";
    if (!reflection) {
      return json({ error: "empty_reflection" }, 502, allowed);
    }
    return json({ reflection }, 200, allowed);
  },
};
