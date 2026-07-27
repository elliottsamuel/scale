# 💪✨ Mystic Muscle

**Become a stronger version of yourself.**

**Live:** https://elliottsamuel.github.io/scale/mystic-muscle/

Mystic Muscle is a five-step method for building muscle that's really about one
thing: feeling in control of your life. Physical strength is the most honest
place to start — you build control here, in a healthy way, so you can learn to
let go everywhere else.

It sits under the personal brand **Midlife Mystic** and is built on the **Mystic
Method**. This page is the launch pitch, an interactive intro to the whole
method, and an early-preview experience of its first two steps.

## The Mystic Method

1. **See Your Destination** — get clear on one fitness goal you can reach in five weeks.
2. **Visualize the Path** — look honestly at how you could get there (holds the five
   expert-consensus muscle-building practices below).
3. **Feel the Transformation** — what you're really after is your energy transformed.
4. **Follow Your Strategy** — act in alignment with what you said you'd do.
5. **Be Yourself** — get stronger and end up feeling more like you, a bolder version.

### The five practices (inside Step 2)

The basics nearly every coach, dietitian, and researcher agrees on: **progressive
overload**, **enough protein** (~0.7–1g/lb most days), **enough volume ~2×/week**
per muscle, **recovery** (7–9h sleep, rest between sessions), and **consistency**
over intensity.

## What's on the page

- **Home** — the pitch (thesis, the river/lake idea, who it's for, the deeper
  muscle, what it is) plus a glanceable five-step overview. Two entry points:
  walk the method, or skip straight to the experience.
- **Intro sequence** — one page per step, one sentence each, with per-step motifs
  and a persistent Skip. Step 2 surfaces the five practices.
- **The experience** — get clear on your five-week goal, then get honest about
  where you're starting; the app reflects back an encouraging, specific read on
  how reachable that is in five weeks, then teases steps 3–5 with an updates
  capture. Reachable directly via "skip intro."

## Running it

A single self-contained file — no build step, no dependencies (same as the rest
of this repo). Open `index.html` in any browser, or serve the folder statically;
it's live at `/mystic-muscle/`.

## The reflection (the moment it lives or dies)

The encouragement after the two questions calls a live model. The app resolves it
in this order, and never strands the visitor:

1. **`WORKER_URL` set** → posts to the Cloudflare Worker in `worker/`, which
   proxies to the Anthropic Messages API (`claude-sonnet-4-6`) with your key kept
   server-side. This is how you get real reflections on the live static site.
2. **`WORKER_URL` blank** → tries the Anthropic API directly (works inside the
   Claude artifact runtime) and is skipped elsewhere.
3. **Anything fails or times out (20s)** → an honest fallback in brand voice, so
   the demo never shows a spinner forever or a raw error.

To turn on live reflections on the deployed site:

1. `cd mystic-muscle/worker && npx wrangler deploy`
2. `npx wrangler secret put ANTHROPIC_API_KEY`
3. Paste the Worker URL into `WORKER_URL` near the top of the `<script>` in
   `index.html`.

The worker also accepts the goal + starting-point kind (`encourage`) and an
optional `{op:"save"}` for aggregating shared submissions via KV.

## Where responses go

Nothing is stored unless someone ticks **"Share my answers anonymously"** (off by
default); if they don't, only an email they explicitly gave is kept. Persistence
is best-effort and never blocks the confirmation: `window.storage` when available
(Claude artifact runtime), and the Worker's optional KV store when `WORKER_URL`
is configured.

## Design

**"Molten Chrome & Aura."** A dark, warm cast-iron ground (`#120E17`) with a
four-stop oil-slick aura — magenta `#FF2E93`, gold `#FFC24B`, mint `#43E6C4`,
violet `#8B5CFF` — spent on the signature elements: the breathing **plate-halo**
(with a per-step motif in the intro) and the **waterline** (the river/lake split).
Display face **Syne**, body **Hanken Grotesk**, ritual labels in **Space Mono**.
Responsive, visible focus states, `prefers-reduced-motion` respected.

## Next up (not built yet)

Five daily-refreshed articles — one per practice — spanning psychology, logistics,
and nutrition, with at least one easy at-home workout mapping to Step 4.
