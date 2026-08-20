# 🌊 Currents

**Currents, Circles, and Drops — the Mystic Method, live from Notion.**

A Current is a project or vision. A Drop is an action that moves one forward
— it can belong to a Current, or stand alone. Circles are the five areas of
life a Current lives in. Currents reads all three live from your Notion
workspace, so the app is always a live window onto your actual data — not a
copy of it.

## What it does

- **Currents** — your top 5 Currents by Priority, as cards. Each card shows
  its Kumara (the feeling you want on the other side of finishing this) and
  Aramuk (the feeling standing in the way, or what you're afraid you'll feel
  if it doesn't happen), plus the five Mystic Method / SCALE steps — Clarify,
  Visualize, Feel, Act, Be. Tap a step to see the Drops filed under it.
- **Circles** — the five areas of life (Self, Ohana, Collective, After Glow,
  Kumara), each showing its master Current and the five Commitments beneath
  it. Tap a Commitment to drill into the Currents nested under it, and keep
  drilling — the hierarchy goes as deep as you've built it in Notion, via
  stacked sheets.
- **Drops** — every active Drop, grouped by step, showing which Current it
  belongs to (or "Standalone" if it doesn't) and its due date.

Every sheet has an **Open in Notion** link, so editing always happens where
the data actually lives.

This first version is **read-only** — a fast, clear way to see everything at
a glance. Editing in-app can come later if it earns its place.

## Running it

Unlike the other apps in this repo, Currents isn't self-contained: the data
lives in Notion, and a static page can't hold a Notion integration token
safely. So there's a small Cloudflare Worker (`worker/`) that holds the token
and proxies read-only queries.

1. **Create a Notion integration.** In Notion, go to Settings → Connections →
   Develop or manage integrations → New integration. Give it "Read content"
   access and copy its token.
2. **Share your databases with it.** Open your Currents database and your
   Drops database in Notion, and add the integration under each one's •••
   menu → Connections.
3. **Deploy the Worker.**
   ```
   cd currents/worker
   npx wrangler deploy
   npx wrangler secret put NOTION_TOKEN     # paste the token from step 1
   ```
   (Or paste `worker.js` into a Worker in the Cloudflare dashboard and add
   the secret there.)
4. **Point the app at it.** Copy the deployed Worker URL into `WORKER_URL`
   near the top of the `<script>` in `index.html`.
5. **Open `index.html`** locally, or host the folder statically (e.g. GitHub
   Pages) — it's still just one file with no build step.

Until `WORKER_URL` is set, the app shows setup instructions instead of
guessing at data it doesn't have.

## Data model

- **Current**: Name, Description, Circle, Priority, Kumara, Aramuk, My B
  (used as "My Goal" in the Clarify step), Parent Current (for nesting).
- **Drop**: Name, Description, Step (1–5), Current (nullable — standalone if
  empty), Due Date, Completed, Repeats, Design/Moodboard/UX Wireframe links.
  A Drop with Priority `0` is Notion's soft-archive convention here, so the
  Worker filters those out.
- Both `Circle` and `Step` select values are inconsistent in Notion after
  months of iterating (`"① Self"`, `"1 Self"`, `"5 Kumara"`, `"1-Clarify"`,
  `"1 - Clarify"`, `"Draft"`, …) — the Worker normalizes all of it by keyword
  or leading digit rather than exact string match.

## Deferred (v1 scope)

Seeds/Saplings/Trees (the growth-metaphor layer) and KLOK Window scheduling
exist in the same Notion workspace but aren't part of this build yet — they
can be added the same way, as new Worker endpoints and a new tab or view.
