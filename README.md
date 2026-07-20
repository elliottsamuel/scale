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

## Structure

Everything lives in `index.html`: a token-based theme (light + dark), the
`SCALE` progress rail, and a small state-driven screen router in vanilla JS.
The flow is defined as a list of screens with per-use-case copy, so adding
Steps 2–5 means extending those data structures rather than rewriting the shell.
