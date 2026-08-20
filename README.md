# SCALE

An interactive walkthrough of the **SCALE** framework — a five-step process for
moving from where you are to where you want to be, whether you're creating a
product, writing something, resolving a conflict, or solving any problem.

SCALE is an acronym; each letter is one step of the process.

| Step | Letter | Name | Status |
|------|:------:|------|--------|
| 1 | **S** | See Your Destination | ✅ Built |
| 2 | **C** | — | 🔒 Coming soon |
| 3 | **A** | — | 🔒 Coming soon |
| 4 | **L** | — | 🔒 Coming soon |
| 5 | **E** | — | 🔒 Coming soon |

## Step 1 — See Your Destination

Get clear on the desired outcome before anything else. The user picks what
they want to use SCALE for (product, article, conflict, problem, or just
learning the framework), and the questions adapt to that use case. They then
define four anchor points:

- **My A** — where *you* are now with this challenge
- **My B** — where *you* want to end up
- **Audience A** — where the *other person* is now
- **Audience B** — a single, aligned destination for that other person
  (where you want them to end up = where they'd want to end up)

Problems and barriers are deliberately set aside here — those belong to Step 2.

## Running it

It's a single self-contained file with no build step or dependencies.

- **Open locally:** open `index.html` in any browser.
- **Host it:** serve the folder statically (e.g. GitHub Pages) — `index.html`
  is the entry point.

Progress is saved in the browser (`localStorage`) so a refresh won't lose work.
There's no backend yet; answers stay on the visitor's device.

## AI reflections (optional)

After someone describes their challenge, the app can call a live model to
reflect their words back and sharpen their goal. This needs a tiny backend so
the API key stays private — a plain static site can't hold a secret safely.

`worker/worker.js` is a Cloudflare Worker that generates the reflection using
**Cloudflare Workers AI** (Cloudflare's built-in models) — no API key and no
credit card, just Cloudflare's free daily allowance. To turn it on:

1. Create a Worker in the Cloudflare dashboard and paste `worker/worker.js`
   (or `cd worker && npx wrangler deploy`).
2. Add a **Workers AI binding** named `AI` (Settings → Bindings → Add →
   Workers AI → variable name `AI`). The CLI reads this from the `[ai]` block
   in `wrangler.toml` automatically.
3. Copy the Worker's URL into `WORKER_URL` near the top of the `<script>` in
   `index.html`.

Until `WORKER_URL` is set, the app simply skips the reflection and continues —
so it always works, with or without the backend. AI reflections run on the
GitHub Pages site; the claude.ai artifact preview can't make external calls.

## Structure

Everything lives in `index.html`: a cosmic dark theme, an animated starfield,
the `SCALE` progress rail, and a small state-driven screen router in vanilla JS.
The flow is defined as a list of screens with per-use-case copy, so adding
Steps 2–5 means extending those data structures rather than rewriting the shell.

## Also in this repo

Other self-contained single-file apps, each served from its own folder:

- [`mystic-muscle/`](mystic-muscle/) — **Mystic Muscle**, a launch page and
  interactive early-preview demo for a workout app built on the Mystic Method.
  Served at `/mystic-muscle/`.
- [`birdsong/`](birdsong/) — **Birdsong**, a bird-watching life-list app.
  Served at `/birdsong/`.
- [`perch/`](perch/) — **Perch**, a wellness app that helps you arrive at a
  healthy vantage point on a health or healing goal — name it, feel it, and
  build the plan. Served at `/perch/`.
- [`currents/`](currents/) — **Currents**, Currents/Circles/Drops from the
  Mystic Method, read live from Notion through a small Cloudflare Worker.
  Served at `/currents/`.
