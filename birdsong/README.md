# 🐦🌹 Birdsong

**A bird-watching app for heads.**

Birdsong helps you build your **life list** — a record of every bird you ever
see — and get better at knowing them by name. It's built for going out with
someone who loves birds (a friend, a kid, a stranger on the trail) and starting
to learn alongside them. No AI identification, no pressure — just you, good
company, and the beautiful music our bird friends make.

## The ethos

"Head" is short for **Deadhead**. The Grateful Dead built something bigger than
music — a traveling family. Birdsong carries that spirit: kind, caring,
supportive people united by a love of the songs all around us. You don't have to
know the Dead. The only requirement is that you want good company and beautiful
music — including birdsong.

## What it does

- **Add a new bird** — the main action. Snap a photo with your phone's camera,
  pick one from your library, or just jot the name down (hearing a bird counts).
- **Your Life List** — every bird you've logged, newest first, with photo,
  date, and place. Scan it at a glance or tap in for detail.
- **Bird detail** — photo, when/where/who-you-were-with, identifying
  characteristics, and a **Hear its song** button.
- **Editable** — update characteristics or notes as you learn more; remove
  mistakes.

Your list lives on your device (`localStorage`) — nothing is uploaded.

### About "Hear its song"

Each bird gets its own short, generated warble (a pleasant, deterministic tune
seeded by the bird — same bird, same song every time). It's a placeholder for
real field recordings, which come next (see below).

## Running it

A single self-contained file — no build step, no dependencies.

- **Open locally:** open `index.html` in any browser.
- **On your phone:** host the folder statically (e.g. GitHub Pages) and open the
  URL, then use "Add to Home Screen" so it feels like a real app.

## Design

Grateful Dead–*inspired* tie-dye imagery, drawn from scratch — a marigold /
rose / magenta / teal / violet rainbow, a custom "songbird + lightning bolt"
roundel, and a warm parchment (daylight) theme plus a twilight-plum (evening)
theme. No trademarked artwork is used. Tap the ◐ button to switch themes; a
light theme is the default because you'll usually be reading it outdoors.

## Roadmap ideas

- Real bird-call recordings (needs a tiny backend or bundled audio, since a
  static page can't fetch cross-origin audio from a sandbox).
- Optional web image search when you didn't get a photo.
- Search / filter the life list; group by place or by walk.
- Export / back up your list; sync across devices.
- A shared "walk" you can log together with your birding partner.
