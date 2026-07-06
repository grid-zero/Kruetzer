# Review Session Observations — 2026-06-15

Compressed observations from the Kreutzer website review session.

## Task scope
- Outside-perspective audit of the Kreutzer local-business music-tuition website
  (Eleventy compiling `src/` → `_site/`), delivered as `REVIEW.md`.
- **In scope:** frontend look/feel/design, backend architecture, SEO, compatibility,
  code smells, HTML/CSS structure.
- **Out of scope:** reading any markdown files for context, git history, and commenting
  on website copy (paragraphs/sentences are under development and known-missing).

## Repo layout: duplicate worktrees
- Root contains `.claude/worktrees/` with ~five near-identical copies
  (clever-ellis-6c6361, crazy-khayyam-a69a28, fervent-gould-ab6d43, sad-ritchie-ac8c01,
  youthful-torvalds-01d08c). Ignored these; reviewed only root `src/`.
- Largest source assets: `IMG_5717.jpg`, `phoebe mu.jpg`. Largest CSS: `sections.css`
  (315 lines), `nav.css` (189). `index.js` is 156 lines.

## Eleventy build pipeline (`.eleventy.js`)
- Eleventy 3. Passthrough-copies `src/css/*.css`, `src/assets`, `src/index.js`; ignores
  `src/css/README.md` as a template.
- `afterBuild` hook runs postcss + postcss-import over `_site/css/index.css` to inline
  `@import`s into one bundled file, written back in place. **Hook only `console.error`s on
  failure (no re-throw).**
- `dir`: input `src`, output `_site`, includes `_includes`; html/markdown template engines
  both Liquid.
- `package.json` devDeps: `@11ty/eleventy ^3`, `postcss ^8.4`, `postcss-import ^16`;
  scripts `dev=eleventy --serve`, `build=eleventy`. No minification, no lint/test tooling.

## Page model: flat permalinks
- `src/src.11tydata.js` sets `layout=base.html` and computed
  `permalink = ${page.fileSlug || 'index'}.html` → flat output.
- `base.html` shell: inline head script adds `js` class to `<html>` before stylesheet loads
  (FOUC guard); links `css/index.css` + Google Fonts (DM Serif Display, Cinzel 400;700,
  Fauna One, Tangerine 400;700) with preconnect; conditional loader include; header; main;
  footer; `index.js` deferred.

## Site structure
- Pages: index, about, teachers, phoebe, lessons, contact, shop, resources, careers, faq,
  terms, 404. Includes: base, header, footer, loader, pricing.
- Placeholder pages: shop/resources are hero-only "Coming Soon" with empty
  `<h3></h3>`/`<p></p>`; about/lessons/careers/phoebe contain bracketed
  `[Content to be written]` placeholders (out of scope per instructions).
- Nav generated from Liquid list `about,teachers,shop,resources,lessons`; sidebar
  duplicates the same nav.

## Observed code-quality issues (HTML/CSS)
1. `header.html`: `nav-logo-main` duplicates "Kreutzer" wordmark alongside logo `img
   alt="Kreutzer"`; two logo imgs (desktop/mobile) both `alt="Kreutzer"`.
2. `footer.html`: social links are `href="#"` emoji placeholders (📷📘▶️) with TODO comment;
   hardcoded `© 2026`; "Contact" and "Book a lesson" both → `contact.html`.
3. `contact.html`: form `action="https://formspree.io/f/YOUR_FORM_ID"` placeholder
   (non-functional); has honeypot `_gotcha`; empty `class=""`; stray `<p >`.
4. `index.html`: instruments section has a stray `<div>` where `</div>` was intended
   (malformed nesting before `</section>`).
5. Eyebrow text uses `<h3>` placed before `<h1>`/`<h2>` across pages (inverted heading
   outline).
6. Sub-page heroes repeat inline `style="min-height:30vh;background:var(--bg-blue)"`.
7. `pricing.html` buttons repeat inline `style="width:100%"`.

## index.js behavior and JS issues
- Single vanilla file, defer-loaded, element-guarded. Four features:
  - Loader progress animation (simulated `easeProgress` curve, 1600ms; adds `loaded` to
    `<html>`; else-branch adds `loaded` immediately on loader-less pages).
  - IntersectionObserver scroll-reveal on `.reveal`.
  - `data-count` counters (respect `prefers-reduced-motion`).
  - Teacher-card flip (**click-only on a div — no keyboard/role/aria**).
  - Burger/sidebar menu (toggles `aria-expanded`/`aria-hidden`, Escape closes, overlay
    click closes).
- **Bug:** sidebar code queries `.sidebar-link` but markup sidebar links use class
  `draw-underline` → that block is dead code.
- No focus trap / focus management for the mobile sidebar.
