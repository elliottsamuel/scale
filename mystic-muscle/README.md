# 💪✨ Mystic Muscle

**Build the muscle underneath the muscle.**

Mystic Muscle is a workout app — in development — for people fitness culture was
never built for. It trains commitment, self-trust, and the nerve to leap before
you can see the whole staircase. Physical strength is the visible proof, not the
point.

It sits under the personal brand **Midlife Mystic** and is built on the **Mystic
Method**, a five-step intuitive approach to reaching what you're after. This page
is the launch pitch plus an interactive **early preview** of the Method's first
two steps: where you honestly are, and where you honestly want to be. Honest A,
honest B.

## The idea: the river and the lake

When people want to change their body they reach for the *river* — the program,
the macros, the supplement, the protocol of the month. That's the visible,
tactical surface. The *lake* is underneath: the emotional and energetic reality
that decides whether any of it holds. The river isn't the enemy; almost nobody
just starts at the lake, and the lake is where it's decided.

## What's on the page

- **The pitch** — a single scrolling page: the thesis, the river/lake idea, who
  it's for, what the deeper muscle is (commitment, self-trust, impact), and what
  it is practically.
- **The early preview** — opens from the CTA with an animated transition (no new
  route). A short honest framing, then two open questions. Each answer is
  **reflected back** in Mystic Muscle's voice — naming the thing underneath what
  you wrote, not a chatbot compliment. Then a save screen (optional anonymous
  sharing + optional email) and a proper confirmation with a feedback dialog.

## Running it

A single self-contained file — no build step, no dependencies (same as the rest
of this repo).

- **Open locally:** open `index.html` in any browser.
- **Host it:** serve the folder statically (e.g. GitHub Pages); it's served at
  `/mystic-muscle/`.
- **On your phone:** open the URL and use "Add to Home Screen."

## The reflection (the moment it lives or dies)

The reflection calls a live model. The app resolves it in this order, and never
strands the visitor:

1. **`WORKER_URL` set** → posts to the Cloudflare Worker in `worker/`, which
   proxies to the Anthropic Messages API (`claude-sonnet-4-6`) with your key kept
   server-side. This is how you get real reflections on the live static site.
2. **`WORKER_URL` blank** → tries the Anthropic API directly. This works inside
   the Claude artifact runtime (where the key is handled for you) and is skipped
   elsewhere.
3. **Anything fails or times out** → an honest fallback message in brand voice,
   so the demo never shows a spinner forever or a raw error.

To turn on live reflections on the deployed site:

1. `cd mystic-muscle/worker && npx wrangler deploy`
2. `npx wrangler secret put ANTHROPIC_API_KEY`
3. Paste the Worker URL into `WORKER_URL` near the top of the `<script>` in
   `index.html`.

See `worker/worker.js` for details, including the optional KV binding that
aggregates the anonymous submissions people choose to share.

## Where responses go

Nothing is stored unless someone ticks **"Share my responses anonymously"** (off
by default); if they don't, only an email they explicitly gave is kept, so we can
send updates. Persistence is best-effort and never blocks the confirmation:

- `window.storage` (shared) when it's available — that's the Claude artifact
  runtime.
- The Worker's optional KV store when `WORKER_URL` is configured — that's how
  submissions actually aggregate on the live static site.

## Design

**"Molten Chrome & Aura."** A dark, warm cast-iron ground (`#120E17`, not pure
black) with a four-stop **oil-slick aura** — magenta `#FF2E93`, liquid gold
`#FFC24B`, aura-mint `#43E6C4`, electric violet `#8B5CFF` — spent in one place so
everything around it stays disciplined. Display face **Syne**, body **Hanken
Grotesk**, ritual labels in **Space Mono**.

Two signature elements collide the mystical and the physical:

- **The plate-halo** — a cast-iron weight plate with the oil-slick aura bleeding
  out behind it. It's the hero centerpiece, and in the demo it *breathes* as the
  "being read" loading state — the physical proof (the plate) and the energy
  underneath (the aura) in one object.
- **The waterline** — the river/lake idea made literal: busy tactical fragments
  above a shimmering iridescent line, a calm deep field below.

Motion is frozen under `prefers-reduced-motion`; focus states are visible; the
layout is responsive to mobile.
