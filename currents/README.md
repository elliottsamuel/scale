# 🌊 Currents

**Currents, Circles, and Drops — from the Mystic Method.**

A Current is a project or vision. A Drop is an action that moves one forward
— it can belong to a Current, or stand alone. Circles are the five areas of
life a Current lives in: Self, Ohana, Collective, After Glow, Kumara.

Like the other apps in this repo, it's self-contained — no build step, no
backend, no account. Anyone can open it and start using it: your data lives
in your own browser (`localStorage`) and never leaves your device, so you can
share the link with someone else and they get their own private Currents,
Circles, and Drops.

## What it does

- **Currents** — your top 5 Currents by Priority, as cards. Each one carries
  its Kumara (the feeling you want on the other side of finishing this) and
  Aramuk (the feeling standing in the way, or what you're afraid you'll feel
  if it doesn't happen), plus the five Mystic Method / SCALE steps — Clarify,
  Visualize, Feel, Act, Be. Tap a step to see the Drops filed under it, or add
  a new one right there.
- **Circles** — your Currents grouped into the five areas of life. Each
  Circle has its own "+ Add" so you can build out that area directly.
- **Drops** — every Drop, grouped by step, showing which Current it belongs
  to (or "Standalone") and its due date. Tap the checkbox to mark one done.

Tap the pencil on any card to edit it, or the "+ New" buttons to add a
Current or Drop. Deleting a Current unlinks its Drops (they become
standalone) rather than deleting them.

## Running it

Open `index.html` in any browser, or host the folder statically (e.g. GitHub
Pages). First run shows a short welcome explaining the three concepts, then
gets out of the way.

## Data model

- **Current**: name, description, circle, priority (1–10, optional — only
  prioritized Currents show up in the Currents tab), Kumara, Aramuk, My Goal
  (shown in the Clarify step sheet).
- **Drop**: name, description, step (1–5, optional), the Current it belongs
  to (optional — standalone if empty), due date, repeats.

Everything is stored under the `currents-app-v1` key in `localStorage` — per
browser, per device, nothing synced or uploaded.

## Deferred

- **Live Notion sync.** `worker/` holds a ready-to-deploy Cloudflare Worker
  that proxies the Notion API directly, for anyone who wants Notion (rather
  than the browser) as the source of truth. It needs its own Notion
  integration token — separate from any Claude↔Notion connection — created at
  Notion's **My Integrations** page and shared with a Currents and a Drops
  database matching the shape in `worker/worker.js`. Worth turning on only if
  the manual/local-only model stops being enough.
- **Nested current hierarchy.** The original version of this app (built
  against one specific, deeply-nested Notion workspace) supported Currents
  containing child Currents, drilled into via stacked sheets. This version
  keeps things flatter — Circles just group your Currents by area — since a
  new person starting fresh doesn't have that hierarchy built up yet.
- Seeds/Saplings/Trees (a growth-metaphor layer) and KLOK Window scheduling
  aren't part of this build.
