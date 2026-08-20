# ⭐ Character Sheet

**A fillable D&D 5e character sheet, right in your browser.**

Everything a level 1–20 character needs across three tabs: ability scores,
saving throws, skills, combat stats, attacks, equipment, and personality on
**Character Sheet**; appearance, allies, backstory, and treasure on **Details
& Backstory**; and spell slots, save DC, attack bonus, and spell lists on
**Spellcasting**.

## What's automatic

- **Ability modifiers** from each score.
- **Proficiency bonus** from character level.
- **Saving throw and skill bonuses**, toggled per-proficiency with a checkbox.
- **Passive Perception**, **Initiative**, **Spell Save DC**, and **Spell
  Attack Bonus**.

Everything else — HP, AC, equipment, attacks, backstory, spell lists — is
free text, since it varies too much between classes and tables to compute.

## Running it

A single self-contained file — no build step, no dependencies.

- **Open locally:** open `index.html` in any browser.
- **Host it:** serve the folder statically (e.g. GitHub Pages).

Everything you type is saved on your device (`localStorage`) as you go — no
backend, nothing uploaded. Use **Export** to download the character as a
JSON file (for backup or moving to another device) and **Import** to load it
back in. **Print** lays out all three tabs for a paper copy.

## Design

A parchment-and-ink theme (deep red, forest green, aged gold) with a dark
"tavern at night" variant that follows your system's light/dark setting —
built to feel like a character sheet, not a form.
