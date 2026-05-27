# linkeen — Archive page + main-page polish

**Date:** 2026-05-27
**Repo:** `EchoRover/links2` (static site, default Vercel deploy → linkeen.vercel.app)
**Status:** Design — awaiting user review

## Goal

Three changes, shipping together:

1. **Archive page** — an **archive** button in the linkeen topbar (next to the `◐` theme
   toggle) opens a new page listing the course links from past semesters,
   **Year 2 · Semester 1** and **Year 2 · Semester 2**, so students can still reach old
   course material after the main page rolls over to the current semester.
2. **Title** — the main-page hero headline becomes **"B.Tech Energy Engineering"**, with
   **"Year 3 · Semester 5"** demoted to a small eyebrow line above it (replacing the bare
   "Semester 5" headline).
3. **Animated background** — sparse **floating botanicals** (slow-drifting leaves/petals)
   behind the content on both the main and archive pages. Lightweight, on-brand
   (matcha-cream / muted green), not flashy.

## Background / context

- The site is overwritten each semester: `scripts.js` holds only the *current* semester's
  `linksData`. Past semesters are not displayed anywhere, but they are preserved in git
  history (each "new sem" commit replaced the previous data).
- `renderCourseLinks(selector, data)` already renders course cards from a data object and
  already supports the older **flat** link shape (`"CODE (Title)": { LinkName: url }`) via
  `normalizeCourseEntry`, so no renderer change is needed for archived data.
- Theme is stored in `localStorage["theme"]` and applied as `data-theme` on `<html>`.
  Because it is per-origin, a second page that ships the same inline `<head>` theme script
  + toggle automatically shares the user's chosen theme.

## Data source (recovered from git — used as-is)

Exact URLs are copied **verbatim** from these commits during implementation (no manual
re-typing):

- **Year 2 · Semester 1** — source commit `6a8437d^` (TimeTable PDF labeled
  "2nd year EEN Sem 1"):
  - `AENL220 (Heat)` — Lecture slides, Quiz, Tutorials
  - `AAPL105 (Mech)` — Blackboard
  - `AENL210 (Thermo)` — Blackboard, Lectures, Assig/Quiz/Tut, Assig/Quiz/Tut (Solution)
  - `AENL222 (Electro & Micro)` — Onedrive, Lectures (Slides), Lectures (Vids), Problem Sheets
  - `AENL338 (AI)` — Blackboard
- **Year 2 · Semester 2** — source commit `313ef98^` (most complete Sem 4 version):
  - `AENL200 (CET)` — Blackboard, OneDrive
  - `AENL224 (Elec Mch)` — Blackboard
  - `AENL223 (Materials Enrgy Sys)` — Blackboard, OneDrive
  - `AENL202 (RET)` — Blackboard, OwnCloud
  - `AHUL213 (Macro Economics)` — Blackboard, Wordpress

These archived entries use the flat shape (no `credits`/`ltp` meta); cards render without
the meta line, which is expected.

## Architecture — shared module

Chosen because the archive footer keeps the rotating quote, which requires the curated
~95-entry `QUOTES` list. Duplicating that list would fork data the user actively edits, so
a single source of truth (`shared.js`) is correct despite touching the live `scripts.js`.

### Files

1. **`shared.js`** (new) — single source of truth for things both pages use:
   - `QUOTES`, `pickWeighted`, `buildFooterQuote`
   - `splitCourseLabel`, `normalizeCourseEntry`, `renderCourseLinks`, `renderGeneralLinks`
   - theme toggle wiring (reads `localStorage`, binds `#theme-toggle`)
   - `spawnBotanicals(count)` — injects N leaf/petal nodes into the `#bg` container
     (see Animated background below)
   - a `DOMContentLoaded` handler that runs the **common** init: apply saved theme,
     wire the toggle, build the footer quote, spawn botanicals.
2. **`scripts.js`** (edited) — slimmed to index-only concerns:
   - `linksData` (current sem), `updatesData`, reels (`localClips`/`renderLocalClips`),
     `SEM_CONFIG`, `buildHeroSub`, `addUpdate`, `renderUpdates`
   - its own `DOMContentLoaded` that renders general links, current-sem course cards,
     updates, reels, hero greeting.
   - The moved helpers/`QUOTES` are **removed** from here (now in `shared.js`).
3. **`archive.js`** (new) — archive-only concerns:
   - `archiveData` = two course-data objects (Sem 1, Sem 2) from the recovered links.
   - its own `DOMContentLoaded` that renders each semester into its section container.
   - relies on `shared.js` for render helpers, theme, and footer quote.
4. **`index.html`** (edited) — add the archive button to `.topbar-actions`, just before
   `#theme-toggle`; add `<script src="shared.js">` **before** `scripts.js`; add an empty
   `<div id="bg" aria-hidden="true"></div>` as the first body child (background layer);
   change the hero markup so the eyebrow reads "Year 3 · Semester 5" and the `<h1>` reads
   "B.Tech Energy Engineering" (the dynamic `#hero-sub` greeting line stays).
5. **`styles.css`** (edited) — add: `.hero-eyebrow` style; `#bg` + `.leaf` botanical
   styles and keyframes; an archive section-heading style if no existing class fits.
   No changes to existing card/theme rules.
6. **`archive.html`** (new) — same `<head>` as index for fonts + inline theme script +
   `styles.css` (no `games.css` — the archive has no games modal); first body child is
   `<div id="bg" aria-hidden="true"></div>`; topbar with a `← linkeen` back link +
   `◐` toggle; two stacked `<section id="sem1">` / `<section id="sem2">`
   ("Year 2 · Semester 1", "Year 2 · Semester 2") each containing a `.links` grid; footer
   with `#footer-quote`. Loads `shared.js` then `archive.js`. No reels, no updates boxes
   (live-semester only).

### Archive button

- Inline **SVG** archive/box glyph using `currentColor` (monochrome, theme-adaptive — matches `◐`).
- Sized to match the theme toggle; `aria-label="View past semesters"` + `title` tooltip.
- Placed in `.topbar-actions`, immediately before `#theme-toggle`.
- Same-tab navigation to `archive.html` (internal nav; archive page has a back link).

## Data flow

```
archive.html (static)
  → loads shared.js (helpers, QUOTES, theme)  → loads archive.js (archiveData + init)
  → DOMContentLoaded:
       shared.js: apply theme, wire toggle, buildFooterQuote
       archive.js: renderCourseLinks("#sem1 .links", archiveData.sem1)
                   renderCourseLinks("#sem2 .links", archiveData.sem2)
```

Theme selection persists across index ↔ archive because both read the same
`localStorage["theme"]` on the same origin.

## Styling

Archive sections reuse the existing `.links` / `.course-card` / `.course-eyebrow` /
`.course-title` / `.course-links` classes. `styles.css` gets **additive** rules only
(existing card/theme rules untouched): `.hero-eyebrow`, the `#bg`/`.leaf` botanical layer,
and an archive section-heading style if no existing heading class fits.

## Main-page title

- Hero markup becomes: eyebrow `<p class="hero-eyebrow">Year 3 · Semester 5</p>`, then
  `<h1>B.Tech Energy Engineering</h1>`, then the existing dynamic `<p id="hero-sub">`
  greeting line (unchanged behaviour).
- `<title>` updated to `linkeen · B.Tech Energy Engineering`. The small brand tag
  ("y3 · sem 5") stays as-is.

## Animated background — floating botanicals

- A fixed, full-viewport `#bg` layer sits behind all content: `position: fixed; inset: 0;
  z-index: -1; pointer-events: none; overflow: hidden`.
- `spawnBotanicals(count)` (in `shared.js`) injects `count` `.leaf` nodes, each an inline
  **SVG** leaf/petal in a muted-green tone at low opacity, with randomized `left`,
  animation `duration` (≈18–34s) and negative `delay` so they're pre-distributed on load.
- CSS keyframes animate **only `transform` + `opacity`** (translateY upward off-screen, a
  small horizontal sway, slow rotation, fade in/out) — GPU-compositor friendly, no layout
  thrash. Default `count` ≈ 6 (sparse; honours "one-screen, no clutter").
- **`@media (prefers-reduced-motion: reduce)`** renders the leaves static (or none), so the
  animation never fights accessibility or a low-power session.
- Leaf tint uses a theme variable so it reads correctly in both light and dark themes.

## Out of scope (YAGNI)

- No Sem 5 / current-semester entry in the archive (it lives on the main page).
- No reels, updates boxes, hero, or games modal on the archive page.
- No search/filter, no per-link descriptions, no automated git-history scraping at runtime
  (data is baked into `archive.js` at build time).

## Verification

- After the `shared.js` refactor, the index page still renders all existing pieces:
  general links, current-sem course cards, updates, reels, hero greeting, footer quote,
  theme toggle — i.e. **no regression** beyond the two intended changes below.
- Hero shows eyebrow "Year 3 · Semester 5" + headline "B.Tech Energy Engineering";
  `#hero-sub` greeting still updates by time of day.
- Floating botanicals animate behind content on **both** pages, sit behind clicks
  (`pointer-events: none`), and read correctly in light **and** dark themes; with
  `prefers-reduced-motion` they don't animate.
- Archive button appears next to `◐` and navigates to `archive.html`.
- Archive page shows both semesters' cards with working links; theme matches the value set
  on the main page; footer quote rotates; light and dark both correct.

## Deploy

Static, default Vercel from `EchoRover/links2 main`. `archive.html` is served automatically
once pushed. No `vercel.json` change needed.
