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
- **After making changes, build and check the result.** Run `npm run build`, then look at
  the affected pages in a browser (e.g. serve `_site/` locally and take Playwright screenshots
  at desktop and mobile widths). Fix what you find before reporting back.

## Build pipeline (`.eleventy.js`)

- Input `src/` → output `_site/`; includes dir is `src/_includes`. Both HTML and
  Markdown render through **Liquid**.
- `css/`, `assets/`, `index.js` and `admin/` are **passthrough-copied** verbatim (not
  processed by Eleventy). `src/admin/index.html` is also in `eleventyConfig.ignores` —
  passthrough alone doesn't stop Eleventy templating it, which would wrap it in
  `base.html` and publish a stray `admin.html`.
- **Output is escaped by default**: `setLiquidOptions({ outputEscape: "escape" })`, so
  every `{{ }}` HTML-escapes its value. The only intended `| raw`s are `{{ content | raw }}`
  in `base.html` and `| markdown | raw` (the markdown filter escapes any HTML in its input). Don't store markup in variables to get around it — keep markup literal
  in the template and let variables hold data only (see `instruments-list.html`).
- Custom filter **`relativePath`** strips a leading `/`. It exists because the CMS stores
  image paths as `/assets/…` (see Content editing below). It throws on a missing value,
  so an entry without an image fails the build.
- Filter **`aud`** formats a number as dollars (`$1,120`; cents only when needed, `$57.50`).
  Filter **`markdown`** renders CMS markdown fields with `markdown-it` (`html: false`).
- The only post-build step: an `afterBuild` hook runs `postcss-import` over the
  copied `_site/css/index.css`, inlining all its `@import`s into one file. So at runtime
  the browser loads a single bundled stylesheet, but in `src/` the CSS stays split into
  components. Edit the component files in `src/css/`, never `_site/`.

## Page model — read this before adding/moving a page

- Each page is a **standalone HTML file** with Liquid front matter: `title`,
  `description`, and optional `loader: true`. Most live directly in `src/`
  (e.g. `src/about.html`); individual teacher profiles live in **`src/teachers/`**
  (`phoebe.html`, `harmoniche.html`, `angel.html`) purely to keep the source tidy.
- `src/src.11tydata.js` is a directory data file that applies to every page under `src/`
  (subfolders included): it sets `layout: base.html` and a computed permalink of
  `<fileSlug || "index">.html`. Result: **pages output flat** (`_site/about.html`,
  `_site/phoebe.html`), never nested — so a page in `src/teachers/` still uses the same
  relative `assets/…` / `contact.html` paths as a top-level page. Consequence: **file names
  must be unique across subfolders.** `fileSlug` is `""` for `index.html`, which is why the
  `|| "index"` fallback exists — don't remove it.
- **Link previews:** `base.html` emits Open Graph tags and a canonical link for every page,
  using absolute URLs from the `absoluteUrl` filter + `studio.site_url` (the one place the live
  address lives; crawlers can't resolve relative paths). The filter adds a missing trailing slash
  and **fails the build** if `site_url` is blank or not a web address. A page sets its preview
  image with `share_image` (+ `share_image_alt`) in front matter; pages without one get
  `assets/share/default.jpg` (the logo card). The image size is hard-coded as 1200×630 in
  `base.html`, so **every share image must be a 1200×630 JPEG** — a new profile needs its own crop.
- **Favicon:** `assets/Kreutzer-Favicon.svg` is the logo on a dark rounded tile (the bare
  `Kreutzer-Icon.svg` is pale gold on transparent and vanishes on light-mode tabs), with
  `favicon-32.png` and `apple-touch-icon.png` as raster fallbacks.
- `src/_includes/base.html` is the shell every page renders into: `<head>` (inline script
  that adds the `js` class and, if the loader already played this session, `no-loader`) +
  skip link + optional loader + header + `<main>{{ content }}</main>` + footer + `index.js`.

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
pricing, teachers, terms, features, faq). Order matters — append new components rather than reshuffling.

- Shared building blocks live in `features.css` (`.split` + `.reverse`/`.top`, `.frame` +
  `.portrait`, `.pillars`, `.card-grid`/`.card`, `.timeline`, `.pull-quote`, `.checklist`,
  `.info-list`, `.notice`) and the section-heading pattern (`.section-head` +
  `.center`/`.split`) in `sections.css`. A section titled by a single word uses
  `<h2 class="label">` (gold small caps, sized between the eyebrow and a full title) instead of
  an eyebrow + white `<h2>` pair. Compose new pages from these before writing new
  CSS. Card titles use `<h4>` because `section h3` is globally styled as the gold eyebrow.
  `src/css/README.md` documents the CSS folder in more depth (repo-only; Eleventy ignores it).
- Interior pages open with `<section intro page="…">`. With no value (or an unlisted one)
  the hero is a navy wash over a faint Debussy-manuscript engraving. A `page` value listed
  in `sections.css` swaps in a photo:
  - `about`, `lessons`, `careers` — faint, desaturated piano-room photo over the navy wash.
  - `teachers`, `phoebe`, `harmoniche`, `angel`, `tyler` — **people heroes**: a stronger photo on a
    near-black ground with a dark scrim. The navy wash turns warm stage photos muddy, so
    don't put people photos on the plain `page` treatment.
  - Phone-portrait swaps (`max-width: 600px` + portrait) give some heroes an upright photo.
- Background variants are boolean attributes on `section`: `alt`, `glow`, `navy`, `ruled`.
- Teacher profile pages follow one rhythm: people hero → portrait `.frame.portrait` +
  bio paragraph (plain text, no `.lede`) + `.info-list` (Teaches / Levels / Ages) → alternating `.split` / `.split.reverse`
  photo sections that break up the bio → a `ruled` two-column text section → `section contact`.
- `tokens.css` holds the entire design system as CSS custom properties: font families, a
  fluid `clamp()` type scale (`--text-*`), color palette (cream is built from the
  `--cream-rgb` triplet so every tint derives from one source), spacing, radii, easings.
  **Theme/scale changes go here, not as literals in component files.**
- The overall site scale is `html { font-size: 80% }` in `reset.css` (phones ≤600px stay at
  100%). Layout sizes are in `rem` so they follow it; write new sizes in `rem`, not `px`.

## JavaScript (`src/index.js`)

One vanilla file, no build step, loaded with `defer`. Seven independent features:
- **Loader** progress animation — plays **once per browser session** (sets the
  `kreutzer-intro` sessionStorage flag, wrapped in try/catch; `base.html` reads it and adds
  `no-loader`). When the loader finishes, or is skipped, it adds `loaded` to `<html>`, which
  starts the hero entrance animation in `sections.css`.
- IntersectionObserver **scroll-reveal** for `.reveal`.
- **Teacher-card flip**: hover previews the back on pointer devices (CSS); click / Enter / Space
  pins it flipped until clicked again. Links on the card back navigate without flipping.
- **Header scroll state** (`scrolled` class once the page scrolls).
- Mobile **burger/sidebar** menu: the closed sidebar is `inert`; opening moves focus to its
  first link and Tab cycles burger ↔ menu; Esc / closing returns focus to the burger.
- **Enquiry form** on `contact.html`: submits to Formspree with `fetch`, then sends the
  visitor to `thanks.html`; on failure shows an inline error with the email address. Without
  JS the form posts straight to Formspree.
- **Instrument chips** on the enquiry form: blocks submit until at least one instrument
  checkbox is ticked (`setCustomValidity` on the first box). Without JS that rule isn't enforced.

Every block is safe on pages that lack its elements — either an explicit guard
(`if (btn && sidebar ...)`) or a `querySelectorAll(...).forEach` that simply finds nothing.
Keep new code the same way so it can't throw on pages without those nodes.

## Templating conventions

- The nav list is generated in `header.html` from a Liquid array
  (`about,teachers,lessons`; resources and shop are held back until finished); active link is set via
  `page.fileSlug == item`. The homepage is intentionally not a desktop nav item (the mobile
  sidebar adds `home` and `contact` links around the same array).
- **Heading levels never skip.** The small gold label above a title is `<p class="eyebrow">`,
  not a heading. Each page has one `<h1>`; section titles are `<h2>`; card and item titles
  inside a section are `<h3>` (then `<h4>`). Page-wide `p` rules in `sections.css` exclude
  `.eyebrow` with `:where(:not(.eyebrow))`, which keeps their specificity unchanged.
- The markup uses **custom-element-like tags** (`<nav-logo-main>`) and **attributes**
  (`<section intro>`, `<img desktop>`, `<img mobile>`, `[scroll-cue]`)
  purely as CSS styling hooks. They are not real components or JS — just selectors.
- `_includes/pricing.html` (package cards, on `lessons.html`) and `_includes/price-table.html`
  (per-lesson fee table, on `terms.html`) both loop over `src/_data/pricing.json`. The data
  holds package **totals** only; per-lesson averages and the "from" price (10-pack ÷ 10) are
  computed in the templates, so the two can't disagree.
- `_includes/instruments-list.html` holds the instrument tiles shown on both the homepage
  (`linked: true` — each tile links to `lessons.html`) and `lessons.html` (plain tiles).
- The teacher profiles (`src/teachers/phoebe.html`, `harmoniche.html`, `angel.html`) are
  real pages reached from each card's **"Full profile"** button on `teachers.html` (and
  Phoebe's also from "Meet Phoebe" on the homepage). They're not in the nav on purpose;
  don't treat them as orphans.
- `resources.html` and `shop.html` are "coming soon" pages held out of the nav.
- Copy must not overclaim (the studio was founded in 2025). Any "every teacher…" claim on
  `teachers.html` must be true of every teacher, including ones still being onboarded.
  Unconfirmed content is marked with `TODO(content)` comments — grep for them.

## Content editing (Sveltia CMS)

- `src/admin/index.html` loads Sveltia CMS; `src/admin/config.yml` describes the content.
  Both ship to `_site/admin/` as-is. Local editing uses Sveltia's "Work with Local
  Repository" mode (Chrome/Edge).
- **Teacher cards** on `teachers.html` render from `src/_data/teachers.json` — a top-level
  array, edited in the CMS as a single-file collection (each teacher is an entry; drag to
  reorder, which reorders the JSON and the cards). Edit cards there, not in the template.
- **Image paths:** `media_folder: src/assets`, `public_folder: /assets`. Sveltia always
  writes root-relative paths (`/assets/x.jpg`) and needs them to show thumbnails, so the
  data keeps the slash and templates output CMS image fields through `| relativePath`.
  Don't strip the slash in the data — the CMS would lose its previews.
- **Prices** (`pricing.json`), **FAQ** (`faq.json`) and **Studio details** (`studio.json`)
  are a file collection called "Site content". FAQ topic anchors are `slugify`'d from the
  topic name, so renaming a topic changes its `#anchor`; answers are markdown.
  `studio.json` feeds the email everywhere (including `mailto:` links and, via the enquiry
  form's `data-email`, the error message in `index.js`), the contact-page area/hours, and
  the footer location/hours/social icons (each icon shows only when its URL is filled in).
- The FAQ answer "How much do lessons cost?" quotes prices as plain text — it does not
  update from `pricing.json`.
- The profile pages (`src/teachers/*.html`) are still hand-written HTML.

## Deploy

`.github/workflows/deploy.yml`: on push to `main`, build with Node 20 and publish `_site/`
to GitHub Pages. The CMS also commits to `main` (`backend.branch` in `config.yml`), so a
CMS save triggers a deploy. The repo's Pages **Source must be set to "GitHub Actions"** (a one-time
manual setting in repo Settings → Pages); nothing else triggers a deploy.

## Project history / paper trail

- `docs/visual-review-change-list.md` — the current numbered change list from the visual
  review (status per item); `docs/phoebe-website-to-do.md` is Phoebe's plain-language
  version of the content she owes.
- `docs/handoffs/` — session handoff notes; read the newest relevant one when resuming work.
- `docs/superpowers/` — specs, plans and summaries from earlier phases (Eleventy migration,
  CSS reorganization).

Consult these for *why* a decision was made, but they can lag the code — when a doc and
the source disagree, the source wins.
