/**
 * Currents — Notion proxy Worker
 *
 * Currents reads its data live from Notion (the Currents and Drops
 * databases). A static page can't hold a Notion integration token safely,
 * so this tiny Cloudflare Worker holds it for you and proxies read-only
 * queries to the Notion API — same pattern as the other Workers in this repo.
 *
 * Setup:
 *   1. In Notion: Settings -> Connections -> Develop or manage integrations
 *      -> New integration. Give it "Read content" access. Copy its token.
 *   2. Share your Currents and Drops databases with that integration
 *      (••• menu on each database -> Connections -> add it).
 *   3. cd currents/worker && npx wrangler deploy
 *      (or paste this file into a Worker in the Cloudflare dashboard).
 *   4. Add the token as a secret:  npx wrangler secret put NOTION_TOKEN
 *   5. Put the deployed Worker URL into WORKER_URL near the top of the
 *      <script> in currents/index.html.
 *
 * Read-only: nothing here ever writes back to Notion. All Notion calls use
 * API version 2022-06-28 against the classic /v1/databases/{id}/query
 * endpoint, matching how this workspace's databases are already set up.
 */

const CURRENTS_DB = "36490106-39a4-810e-9752-e47ba279f4e9";
const DROPS_DB = "36490106-39a4-816e-9383-e03e7b9be1de";

const CIRCLE_ORDER = ["self", "ohana", "collective", "afterglow", "kumara"];
const CIRCLE_LABEL = {
  self: "Self",
  ohana: "Ohana",
  collective: "Collective",
  afterglow: "After Glow",
  kumara: "Kumara",
};

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
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

async function notion(env, path, init) {
  return fetch("https://api.notion.com" + path, {
    ...init,
    headers: {
      "Authorization": "Bearer " + env.NOTION_TOKEN,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
      ...((init && init.headers) || {}),
    },
  });
}

async function queryAll(env, databaseId, body) {
  let results = [];
  let cursor;
  do {
    const resp = await notion(env, "/v1/databases/" + databaseId + "/query", {
      method: "POST",
      body: JSON.stringify({ ...body, start_cursor: cursor, page_size: 100 }),
    });
    if (!resp.ok) {
      throw new Error("notion_query_failed:" + resp.status);
    }
    const data = await resp.json();
    results = results.concat(data.results || []);
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

// ---------- Notion property readers ----------
function textOf(prop) {
  if (!prop) return "";
  const arr = prop.title || prop.rich_text || [];
  return arr.map((t) => t.plain_text).join("");
}
function selectOf(prop) {
  return prop && prop.select ? prop.select.name : null;
}
function numberOf(prop) {
  return prop && typeof prop.number === "number" ? prop.number : null;
}
function dateOf(prop) {
  return prop && prop.date ? prop.date.start : null;
}
function urlOf(prop) {
  return prop && prop.url ? prop.url : null;
}
function relIds(prop) {
  return prop && Array.isArray(prop.relation) ? prop.relation.map((r) => r.id) : [];
}

// Circle select values are inconsistent ("① Self", "1 Self", "5 Kumara", ...).
// Normalize by keyword first, then by leading number/circled-digit.
function normalizeCircle(raw) {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (s.includes("self")) return "self";
  if (s.includes("ohana")) return "ohana";
  if (s.includes("collective")) return "collective";
  if (s.includes("after glow") || s.includes("afterglow") || s.includes("future")) return "afterglow";
  if (s.includes("kumara")) return "kumara";
  const glyphs = { "①": 1, "②": 2, "③": 3, "④": 4, "⑤": 5 };
  const m = raw.match(/[①②③④⑤]|[1-5]/);
  const n = m ? glyphs[m[0]] || parseInt(m[0], 10) : null;
  return n && CIRCLE_ORDER[n - 1] ? CIRCLE_ORDER[n - 1] : null;
}

// Step select values are also inconsistent ("1-Clarify", "1 - Clarify",
// "1-See", "Draft", ...). Just take the leading digit.
function normalizeStep(raw) {
  if (!raw) return null;
  const m = raw.match(/[1-5]/);
  return m ? parseInt(m[0], 10) : null;
}

function mapCurrent(page) {
  const p = page.properties;
  return {
    id: page.id,
    name: textOf(p["Name"]),
    description: textOf(p["Description"]),
    kumara: textOf(p["Kumara"]),
    aramuk: textOf(p["Aramuk"]),
    myB: textOf(p["My B"]),
    priority: numberOf(p["Priority"]),
    circle: normalizeCircle(selectOf(p["Circle"])),
    parentIds: relIds(p["Parent Current"]),
  };
}

function mapDrop(page) {
  const p = page.properties;
  return {
    id: page.id,
    name: textOf(p["Name"]),
    description: textOf(p["Description"]),
    step: normalizeStep(selectOf(p["Step"])),
    priority: numberOf(p["Priority"]),
    currentIds: relIds(p["Current"]),
    dueDate: dateOf(p["Due Date"]),
    completed: dateOf(p["Completed"]),
    repeats: textOf(p["Repeats"]) || null,
    design: urlOf(p["Design"]),
    moodboard: urlOf(p["Moodboard"]),
    wireframe: urlOf(p["UX Wireframe"]),
  };
}

async function getAllCurrents(env) {
  const pages = await queryAll(env, CURRENTS_DB, {
    sorts: [{ property: "Priority", direction: "ascending" }],
  });
  return pages.map(mapCurrent);
}

// Priority = 0 is this workspace's soft-archive convention for Drops.
async function getAllDrops(env) {
  const pages = await queryAll(env, DROPS_DB, {});
  return pages.map(mapDrop).filter((d) => d.priority !== 0);
}

export default {
  async fetch(request, env) {
    const origin = env.ALLOWED_ORIGIN || "*";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== "GET") {
      return json({ error: "method_not_allowed" }, 405, origin);
    }
    if (!env.NOTION_TOKEN) {
      return json({ error: "notion_token_missing" }, 500, origin);
    }

    const url = new URL(request.url);

    try {
      switch (url.pathname) {
        case "/api/currents": {
          const all = await getAllCurrents(env);
          const top = all
            .filter((c) => c.priority != null)
            .slice(0, 5)
            .map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description,
              kumara: c.kumara,
              aramuk: c.aramuk,
              priority: c.priority,
              circle: c.circle,
            }));
          return json({ currents: top }, 200, origin);
        }

        case "/api/circles": {
          const all = await getAllCurrents(env);
          const childrenOf = (id) =>
            all.filter((c) => c.parentIds.includes(id)).sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

          const circles = CIRCLE_ORDER.map((key) => {
            const masters = all.filter((c) => c.circle === key && c.parentIds.length === 0);
            const masterCards = masters.map((m) => {
              const commitments = childrenOf(m.id)
                .slice(0, 5)
                .map((k) => ({ id: k.id, name: k.name, count: childrenOf(k.id).length }));
              return {
                id: m.id,
                name: m.name,
                description: m.description,
                kumara: m.kumara,
                aramuk: m.aramuk,
                commitments,
              };
            });
            return { key, label: CIRCLE_LABEL[key], masters: masterCards };
          });
          return json({ circles }, 200, origin);
        }

        case "/api/children": {
          const id = url.searchParams.get("id");
          if (!id) return json({ error: "missing_id" }, 400, origin);
          const all = await getAllCurrents(env);
          const current = all.find((c) => c.id === id);
          if (!current) return json({ error: "not_found" }, 404, origin);
          const children = all
            .filter((c) => c.parentIds.includes(id))
            .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99))
            .map((k) => ({ id: k.id, name: k.name, hasChildren: all.some((c) => c.parentIds.includes(k.id)) }));
          return json(
            { id: current.id, name: current.name, description: current.description, children },
            200,
            origin
          );
        }

        case "/api/step": {
          const id = url.searchParams.get("id");
          const step = parseInt(url.searchParams.get("step"), 10);
          if (!id || !step) return json({ error: "missing_params" }, 400, origin);
          const [all, dropPages] = await Promise.all([
            getAllCurrents(env),
            queryAll(env, DROPS_DB, { filter: { property: "Current", relation: { contains: id } } }),
          ]);
          const current = all.find((c) => c.id === id) || null;
          const drops = dropPages
            .map(mapDrop)
            .filter((d) => d.priority !== 0 && d.step === step)
            .map((d) => ({ id: d.id, name: d.name }));
          const body = { currentName: current ? current.name : null, drops };
          if (step === 1 && current) body.myGoal = current.myB || null;
          return json(body, 200, origin);
        }

        case "/api/drop": {
          const id = url.searchParams.get("id");
          if (!id) return json({ error: "missing_id" }, 400, origin);
          const resp = await notion(env, "/v1/pages/" + id, { method: "GET" });
          if (!resp.ok) return json({ error: "notion_error", status: resp.status }, 502, origin);
          const page = await resp.json();
          return json({ drop: mapDrop(page) }, 200, origin);
        }

        case "/api/drops": {
          const [currents, drops] = await Promise.all([getAllCurrents(env), getAllDrops(env)]);
          const nameById = new Map(currents.map((c) => [c.id, c.name]));
          const list = drops.map((d) => ({
            id: d.id,
            name: d.name,
            step: d.step,
            dueDate: d.dueDate,
            completed: d.completed,
            repeats: d.repeats,
            currentName: d.currentIds[0] ? nameById.get(d.currentIds[0]) || null : null,
          }));
          return json({ drops: list }, 200, origin);
        }

        default:
          return json({ error: "not_found" }, 404, origin);
      }
    } catch (e) {
      return json({ error: "server_error", detail: String(e).slice(0, 300) }, 500, origin);
    }
  },
};
