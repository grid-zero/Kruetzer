# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Static marketing site for **Kreutzer**, a Canberra music-tuition studio. Built with
**Eleventy 3 (11ty)** + Liquid templates, hand-written CSS, and one vanilla-JS file.
No framework, no bundler, no client-side routing. Output is plain HTML in `_site/`.

## Commands

```bash
npm ci          # install (CI uses this; lockfile is authoritative)
npm run dev     # eleventy --serve — local dev server with live reload
npm run build   # eleventy — one-shot build into _site/
```

- **There is no test or lint tooling.** Don't go looking for it. "Verification" here
  means: `npm run build` succeeds, then a manual browser check (see below).
- Node 20 is what CI builds with.

## Build pipeline (`.eleventy.js`)

- Input `src/` → output `_site/`; includes dir is `src/_includes`. Both HTML and
  Markdown render through **Liquid**.
- `css/`, `assets/`, and `index.js` are **passthrough-copied** verbatim (not processed
  by Eleventy).
- The **only** build-time transform: an `afterBuild` hook runs `postcss-import` over the
  copied `_site/css/index.css`, inlining all its `@import`s into one file. So at runtime
  the browser loads a single bundled stylesheet, but in `src/` the CSS stays split into
  components. Edit the component files in `src/css/`, never `_site/`.

## Page model — read this before adding/moving a page

- Each page is a **standalone HTML file directly in `src/`** (e.g. `src/about.html`) with
  Liquid front matter: `title`, `description`, and optional `loader: true`.
- `src/src.11tydata.js` is a directory data file that applies to every page in `src/`:
  it sets `layout: base.html` and a computed `permalink` of `<fileSlug || "index">.html`.
  Result: **pages output flat** (`_site/about.html`), never nested. `fileSlug` is `""`
  for `index.html`, which is why the `|| "index"` fallback exists — don't remove it.
- `src/_includes/base.html` is the shell every page renders into: `<head>` + optional
  loader + header + `<main>{{ content }}</main>` + footer + `index.js`.

### Two load-bearing constraints (do not "fix" these)

1. **All asset/link paths are relative** (`css/index.css`, `assets/...`, `index.js`,
   `about.html`) — never root-relative (`/css/...`). GitHub Pages serves this site from a
   **project subpath**, where a leading slash breaks every link. Keep paths relative.

2. **The site must work with JavaScript disabled.** `base.html` adds a `js` class to
   `<html>` via an inline head script. CSS is written so content is visible by default and
   only the JS-class path hides-then-animates it:
   - `css/reveal.css` — `.reveal` is visible by default; `.js .reveal` hides it for the
     IntersectionObserver to reveal on scroll.
   - `css/loader.css` — the loader only displays under `.js`.
   When touching reveal/loader CSS or `index.js`, preserve this no-JS fallback.

## CSS architecture

Component-based. Single entry point `src/css/index.css` `@import`s the rest **in a
deliberate cascade order**: `tokens` → `keyframes` → `reset` → then component files
(reveal, loader, contact-form, buttons, nav, footer, sections, instruments, testimonials,
pricing, teachers, terms). Order matters — append new components rather than reshuffling.

- `tokens.css` holds the entire design system as CSS custom properties: font families, a
  fluid `clamp()` type scale (`--text-*`), color palette (cream is built from the
  `--cream-rgb` triplet so every tint derives from one source), spacing, radii, easings.
  **Theme/scale changes go here, not as literals in component files.**

## JavaScript (`src/index.js`)

One vanilla file, no build step, loaded with `defer`. Four independent features: loader
progress animation, IntersectionObserver scroll-reveal, teacher-card flip, and the mobile
burger/sidebar menu. **Every block guards for its elements** (`if (btn && sidebar ...)`)
because not every page has a loader or burger — keep new code element-guarded so it can't
throw on pages that lack those nodes.

## Templating conventions

- The nav list is generated in `header.html` from a Liquid array
  (`about,teachers,shop,resources,lessons`); active link is set via
  `page.fileSlug == item`. The homepage is intentionally not a nav item.
- The markup uses **custom-element-like tags** (`<section intro>`, `<nav-logo-main>`,
  `<company-story>`) and **boolean attributes** (`<img desktop>`, `<img mobile>`) purely as
  CSS styling hooks. They are not real components or JS — just selectors.
- `src/phoebe.html` is a real page reached from a "Learn More" link on `teachers.html`,
  not part of the nav. It exists on purpose; don't treat it as an orphan.

## Deploy

`.github/workflows/deploy.yml`: on push to `main`, build with Node 20 and publish `_site/`
to GitHub Pages. The repo's Pages **Source must be set to "GitHub Actions"** (a one-time
manual setting in repo Settings → Pages); nothing else triggers a deploy.

## Project history / paper trail

`docs/superpowers/` contains the specs, plans, and summaries from prior work phases
(Eleventy migration, CSS reorganization). Consult it for *why* a decision was made, but
note it can lag the code — when a doc and the source disagree, the source wins.
