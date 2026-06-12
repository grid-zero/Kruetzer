# Foundation Cleanup: Eleventy Migration & Shared Structure

**Date:** 2026-06-12
**Status:** Approved design
**Phase:** 1 of N (foundation/cleanliness — page content is a separate later phase)

## Problem

The Kreutzer site is hand-written static HTML across ~11 pages. The homepage
(`index.html`) is complete and polished; the rest range from half-built to
"Coming Soon" stubs. The most pressing structural problem is that **every page
hand-copies its own `<header>` and `<footer>`**, so they have drifted apart:

- Nav link sets differ across pages (e.g. subpages silently drop the "lessons"
  link that the homepage has).
- Desktop nav and the mobile burger/sidebar are two separate hand-copied `<ul>`s
  that can disagree.
- Orphan/scratch files (`navbar.html`, `phoebe.html`) are not linked anywhere.
- The contact email disagrees with itself: footer text says
  `kreutzer@gmail.com` while the `mailto:` points to `hello@kreutzer.com.au`.
- `.reveal` content starts hidden and only appears once `index.js`'s
  IntersectionObserver fires — **with JS off, homepage content is invisible.**

This phase fixes the structural foundation so the remaining pages can later be
built out to the homepage's standard without re-introducing drift.

## Goals

1. One source of truth for the header and footer; nav inconsistency fixed once.
2. Migrate to a lightweight build (Eleventy) without overcomplicating the
   day-to-day workflow.
3. Automatic build + deploy to GitHub Pages on push.
4. **The site must be functional on desktop without any JS** (accepting some
   missing enhancement) — a guiding principle, not just a checkbox.
5. Remove dead files and reconcile data inconsistencies.

## Non-Goals (explicitly out of scope this phase)

- **Page content** — real copy/bios for about/teachers and building out the
  "Coming Soon" pages (shop, resources, lessons, careers). Separate consult phase.
- **Contact form backend** — the form currently posts nowhere. Making it send
  (needs a third-party handler like Formspree; GitHub Pages can't process forms
  server-side) is a later functionality task. Markup stays; flagged only.
- **Custom-element styling hooks** (`<section intro>`, `<nav-logo-main>`,
  `<img desktop>`) — non-standard but functional. Left as-is to avoid churn.
- **Deep CSS refactor** of the 748-line `page.css` — beyond the folder rename,
  no restructuring unless something is trivially broken.

## Approach

Chosen tooling: **Eleventy (11ty)** — the lightest real static-site generator.
Pages stay essentially HTML; the only new authoring concept is an
`{% include %}` / layout tag and a source-vs-output split. Output is plain
static HTML, which serves the no-JS requirement well (nav/footer are baked in at
build time, never JS-injected).

Considered and rejected:
- **Runtime JS injection** of nav/footer — zero build, but nav would appear only
  after JS runs, violating the no-JS requirement.
- **Continued hand-copying** — the status quo that caused the drift.

## Project Structure

```
website/
├── src/                      # everything authored here
│   ├── _includes/
│   │   ├── base.html         # page shell: <head>, fonts, header, footer, scripts
│   │   ├── header.html       # the ONE nav (desktop + mobile burger)
│   │   └── footer.html       # the ONE footer
│   ├── css/                  # renamed from new/
│   │   ├── index.css root.css page.css nav.css footer.css loader.css contact.css
│   ├── assets/               # images, logos, svg (unchanged)
│   ├── index.html            # page = its <main> content + front-matter
│   ├── about.html teachers.html shop.html resources.html
│   ├── lessons.html contact.html careers.html faq.html terms.html
│   └── index.js
├── _site/                    # BUILD OUTPUT (git-ignored, deployed) — never hand-edited
├── .eleventy.js              # ~15 lines of config
├── package.json
└── .github/workflows/deploy.yml
```

Each page file becomes just its `<main>` content plus a few lines of
front-matter (title, layout). The shell wraps it at build time.

## Shared Structure & Nav Fix

- **`header.html`** — single canonical nav. Primary links standardized to the
  complete set (all five target pages exist):
  **about · teachers · shop · resources · lessons**, plus the "Enquire now"
  button → contact. Desktop nav and mobile sidebar read from the **same** link
  list so they cannot disagree.
- **Active page state** — Eleventy compares each page's URL against each nav
  item at build time and stamps the matching link with `aria-current="page"` +
  an `.active` class. CSS gives that link a **persistent underline** (distinct
  from the hover underline). Applied in both desktop nav and mobile sidebar.
  Entirely build-time — correct with JS off. Homepage keeps its distinct hero
  content; only the nav markup is unified.
- **`footer.html`** — single canonical footer with the corrected email.
- **`base.html`** — `<head>` (charset, viewport, fonts, favicon, `index.css`) →
  `header.html` → page `<main>` → `footer.html` → `<script src="/index.js" defer>`.

## Build & Deploy

- **`.eleventy.js`** — input `src`, output `_site`; passthrough-copy `assets/`,
  `css/`, and `index.js`.
- **`package.json`** — scripts `npm run dev` (live-reload preview at
  `localhost:8080`) and `npm run build` (generates `_site/`). One dependency:
  `@11ty/eleventy`.
- **`.github/workflows/deploy.yml`** — on push to `main`: install deps,
  `npm run build`, publish `_site/` via the official GitHub Pages action.
- **`.gitignore`** — add `node_modules/` and `_site/`.
- **GitHub Pages source** — switch from "branch" to "GitHub Actions" (one
  settings toggle; called out in the implementation plan).

Day-to-day workflow: edit in `src/` → `npm run dev` to preview → commit → push.

## Cleanup Details

- **Delete dead files:** `navbar.html`, `phoebe.html`.
- **Data inconsistencies:**
  - Standardize the contact email to **hello@kreutzer.com.au** in both the
    footer text and the `mailto:`.
  - Replace dead `href="#"` social/location links with real URLs where known;
    otherwise a clearly-marked placeholder resolved in the content phase.
  - Add meaningful `alt` text to images.
- **No-JS hardening:**
  - `.reveal` elements visible by default; the reveal animation becomes an
    enhancement layered on only when JS is present (e.g. a `js` class on
    `<html>` added by an inline script, gating the hidden-then-animate styles).
  - **Loader:** hidden entirely when JS is off. The loader is `display:none` by
    default in CSS and only shown once the `js` class is present; the real page
    is always rendered underneath. With JS on, behavior is unchanged.

## Success Criteria

- Header and footer each exist in exactly one source file.
- All pages show the identical five-item nav; the current page's link has a
  persistent underline.
- `npm run build` produces a working static site in `_site/`; pushing to `main`
  auto-deploys to GitHub Pages.
- With JavaScript disabled in a desktop browser: every page renders its content,
  navigation works, no loader traps the page, and no content is invisible.
- `navbar.html` and `phoebe.html` are gone.
- The contact email is `hello@kreutzer.com.au` consistently; no `href="#"`
  links remain that should point somewhere; images have alt text.

## Risks / Notes

- The one genuinely new concept for the site owner is the **source (`src/`) vs.
  built output (`_site/`)** split. Mitigated by: `_site/` is git-ignored and
  never hand-edited; the dev/build commands are two memorable scripts.
- Eleventy front-matter must be added to each page; low risk but touches every
  file.
