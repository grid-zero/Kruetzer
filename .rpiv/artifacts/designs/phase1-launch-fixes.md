---
date: 2026-06-13T03:21:45.694Z
author: grid-zero
commit: 353cc1b7df61f4ff2c0d010fc69d0a7d972fed75
branch: main
repository: website
topic: "Phase 1 Launch-Blocking Fixes"
tags: [design, phase-1, css-bundling, bug-fixes, accessibility, contact-form, content-guidance]
status: ready
parent: docs/superpowers/2026-06-13-website-review-directions.md
last_updated: 2026-06-13T03:21:45.694Z
last_updated_by: grid-zero
---

# Design: Phase 1 — Launch-Blocking Fixes

## Summary

Resolve 6 code defects and wire the contact form to make the Kreutzer website minimally functional. The primary architectural change is introducing PostCSS + postcss-import to bundle 15 CSS @import files into a single stylesheet at build time. Additionally: fix a CSS nesting bug in the loader, repair malformed HTML on the about page, add two missing accessibility attributes (skip-to-content link, aria-controls, focus-visible styles), wire the contact form to Formspree with spam protection and a phone/email fallback, and provide structural guidance for teacher card data and about page content.

## Requirements

- CSS must deliver as a single bundled file — no runtime @import resolution
- The loader ghost piano effect must render (currently broken by a CSS nesting error)
- about.html must be valid HTML (unclosed `<div>`)
- The burger menu button must declare `aria-controls="sidebar"` (WCAG 4.1.2)
- A skip-to-content link must be present (WCAG 2.4.1)
- Focus-visible styles must provide visible focus indicators (WCAG 2.4.7)
- The contact form must submit to a real backend (Formspree)
- The contact form must include spam protection (honeypot field)
- The contact page must show a phone number and email as fallback (currently only in footer)
- Teacher cards must not contain duplicate placeholder data
- about.html must contain real copy, not joke placeholder text

## Current State Analysis

The site is a static Eleventy 3.0 site deploying to GitHub Pages. The CSS architecture is 15 component files imported via `@import` in `index.css` and passed through verbatim by `addPassthroughCopy` — the browser resolves all 15 imports sequentially at runtime.

### Key Discoveries

- `.eleventy.js:1-9` — build config uses `addPassthroughCopy("src/css")` which mirrors files without processing. Any CSS bundling must happen either before or after Eleventy's copy, or replace the passthrough approach
- `src/css/index.css:1-15` — the @import manifest. Order is load-bearing: `tokens.css` must be first, then `keyframes.css`, then all others (they reference custom properties and keyframe names from those files)
- `src/css/loader.css:34-37` — CSS nesting ` .piano { .ghost {...} }` compiles to `.piano .ghost` (descendant) but `src/_includes/loader.html:3` uses `<img class="piano ghost">` (same element both classes). Fix: `&.ghost`
- `src/about.html:5-10` — `<div>` on line 6 is never closed; `</section>` on line 10 terminates the section while the div is still open
- `src/_includes/header.html:16` — `<button id="burgerBtn">` toggles `aria-expanded` but never declares `aria-controls="sidebar"`
- `src/_includes/base.html:8-13` — no skip-to-content link before `<main>`
- `src/css/reset.css` — no `:focus-visible` styles defined anywhere in the CSS
- `src/contact.html:16` — `<form action="#" method="POST">` submits nowhere
- `src/teachers.html` — 3 of 4 cards are duplicate "Julian Thorne" with identical photo and wrong `alt` text

## Scope

### Building

1. PostCSS + postcss-import integration in .eleventy.js
2. CSS loader bug fix (loader.css:35)
3. about.html malformed HTML fix
4. aria-controls attribute on burger button
5. Skip-to-content link in base.html
6. focus-visible styles in reset.css
7. Contact form Formspree wiring + honeypot + phone/email fallback
8. Content structure guidance for teacher cards and about page

### Not Building

- Font reduction / font loading optimization (Phase 4)
- Image optimization / dead asset removal (Phase 4)
- 404 page, sitemap, robots.txt (Phase 3)
- Schema.org structured data / Open Graph tags (Phase 3)
- Google Business Profile setup (Phase 3)
- Any page content for lessons, shop, resources, careers, phoebe, FAQ, terms (Phases 2-5)
- Nav restructure (Phase 5)
- Social media URL resolution (Phase 3)

## Decisions

### CSS Bundling: PostCSS + postcss-import via afterBuild hook

**Explored:**
- **PostCSS + postcss-import** (chosen): Add `postcss` and `postcss-import` as devDependencies. Run as `eleventyConfig.on('afterBuild', ...)` in `.eleventy.js`. Standard tooling, handles @import natively, well-documented. ~5 lines of config. Overwrites `_site/css/index.css` after Eleventy copies it.
- **Eleventy transform (zero deps)**: Custom JS to parse @import statements manually. No dependencies, but fragile — must handle edge cases, won't support future CSS features. ~25 lines.
- **npm prebuild script**: Standalone Node script that writes a bundled file before Eleventy runs. Clean separation but adds an extra build step developers must remember.

**Decision:** PostCSS + postcss-import. Adds a standard, well-tested tool rather than custom import parsing. The afterBuild hook integrates cleanly with Eleventy's existing passthrough copy — no changes to the Eleventy config structure, no new npm scripts.

### Contact Form Backend: Formspree

**Explored:**
- Formspree (chosen): Free tier (50 subs/month). Change `action` attribute, add honeypot field. ~5 minutes.
- Netlify Forms: Requires Netlify hosting. More generous free tier but means migrating off GitHub Pages.
- Google Forms embed: Free, but unstyled iframe. Feels unprofessional.

**Decision:** Formspree. The site already deploys to GitHub Pages; Formspree is the lowest-friction backend that preserves the current hosting.

### Content Tasks: Prose Guidance Only

Teacher card data and about page copy are business/content decisions. The design provides structural guidance (schema, section outline, field checklist) but does not generate content text.

## Architecture

### .eleventy.js — MODIFY

```js
const postcss = require('postcss');
const postcssImport = require('postcss-import');
const fs = require('fs');
const path = require('path');

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/index.js");

  // Bundle CSS @imports into single file after passthrough copy
  eleventyConfig.on('afterBuild', () => {
    const cssDir = path.join(__dirname, '_site', 'css');
    const entryPath = path.join(cssDir, 'index.css');
    const css = fs.readFileSync(entryPath, 'utf8');
    
    postcss([postcssImport()])
      .process(css, { from: entryPath, to: entryPath })
      .then(result => fs.writeFileSync(entryPath, result.css))
      .catch(err => console.error('CSS bundling failed:', err));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  };
};
```

### package.json — MODIFY

```json
{
  "name": "kreutzer-website",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "eleventy --serve",
    "build": "eleventy"
  },
  "devDependencies": {
    "@11ty/eleventy": "^3.0.0",
    "postcss": "^8.4.0",
    "postcss-import": "^16.0.0"
  }
}
```

### src/css/loader.css:35 — MODIFY

```css
  .piano {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    &.ghost {
      opacity: 0.12;
      filter: invert(1);
    }
    mix-blend-mode: multiply;
    
    
  }
```

### src/about.html:5-10 — MODIFY

```html
<section intro style="min-height: 30vh; background: var(--bg-blue);">
        <div>
        <h3>Our story</h3>
        <h1>About <em>Us</em></h1>
        <p>Learn about Kreutzer's story, teaching philosophy, and our Canberra studio.</p>
      </div>
      </section>

      <section default>
        <h3>Our story</h3>
        <h2>Beginnings</h2>
        <p>[Content to be written — see Content Structure Guidance, Slice 5]</p>
      </section>
      <section default>
        <h3>Our space</h3>
        <h2>Studio</h2>
        <p>[Content to be written — see Content Structure Guidance, Slice 5]</p>
      </section>
```

### src/_includes/header.html:16 — MODIFY

```html
    <button class="burger-btn" id="burgerBtn" aria-label="Toggle menu" aria-expanded="false" aria-controls="sidebar">
```

### src/_includes/base.html:8-13 — MODIFY

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <script>document.documentElement.classList.add('js');</script>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="description" content="{{ description }}">
    <title>{{ title }}</title>
    <link rel="icon" type="image/svg+xml" href="assets/Kreutzer-Icon.svg">
    <link rel="stylesheet" href="css/index.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Cinzel:wght@400;700&family=Fauna+One&family=Tangerine:wght@400;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <a href="#main-content" class="skip-link">Skip to content</a>
    {% if loader %}{% include "loader.html" %}{% endif %}
    {% include "header.html" %}
    <main id="main-content" tabindex="-1">
      {{ content }}
    </main>
    {% include "footer.html" %}
    <script src="index.js" defer></script>
  </body>
</html>
```

### src/css/reset.css — MODIFY

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html {
  -moz-text-size-adjust: none;
  -webkit-text-size-adjust: none;
  text-size-adjust: none;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg);
  color: var(--cream);
  font-weight: var(--weight-regular);
  font-size: var(--text-base);
  line-height: 1.65;
  overflow-x: hidden;
}

ul, ol { list-style: none; }
a { color: var(--cream); text-decoration: none; cursor: pointer;}

:where(img, svg, video, canvas, audio, iframe, embed, object) { display: block; }
:where(img, svg, video) { max-inline-size: 100%; block-size: auto; }

:where(input, button, textarea, select),
:where(input[type="file"])::-webkit-file-upload-button {
  font: inherit; font-size: inherit; color: inherit; letter-spacing: inherit;
}

/* Focus visibility */
:focus-visible {
  outline: 2px solid var(--gold);
  outline-offset: 2px;
}

/* Skip-to-content link — visually hidden until focused */
.skip-link {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 10000;
  padding: 0.75rem 1.5rem;
  background: var(--gold);
  color: var(--bg);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  text-decoration: none;
  border-radius: 0 0 var(--radius-sm) 0;
}

.skip-link:focus {
  top: 0;
}
```

### src/contact.html — MODIFY

```html
---
title: "Contact | Kreutzer"
description: "Get in touch with Kreutzer to book a free trial music lesson in Canberra."
---
<section intro style="min-height: 30vh; background: var(--bg-blue);">
      <div>
        <h3>Begin Your Journey</h3>
        <h1>Get in <em>Touch</em></h1>
        <p>Whether you're a complete beginner or an advanced performer, we're here to help you reach your musical goals.</p>
      </div>
    </section>

    <section contact-form>
      <div class="contact-container reveal">

        <div class="contact-fallback" style="text-align: center; margin-bottom: var(--space-lg);">
          <p style="margin-bottom: var(--space-sm);">Or reach us directly:</p>
          <p>
            <a href="tel:+61467925666" style="color: var(--gold);">+61 467 925 666</a>
            &ensp;·&ensp;
            <a href="mailto:hello@kreutzer.com.au" style="color: var(--gold);">hello@kreutzer.com.au</a>
          </p>
        </div>

        <form action="https://formspree.io/f/YOUR_FORM_ID" method="POST" class="">
          <!-- Honeypot spam protection -->
          <input type="text" name="_gotcha" style="display:none">

          <div class="form-grid">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" placeholder="Jane Doe" required>
            </div>
            <div class="form-row">
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" placeholder="+61 400 000 000">
              </div>
              <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" placeholder="jane@example.com" required>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="instrument">Instrument</label>
                <select id="instrument" name="instrument" required>
                  <option value="" disabled selected>Select...</option>
                  <option>Piano</option>
                  <option>Violin</option>
                  <option>Guitar</option>
                  <option>Voice</option>
                  <option>Theory</option>
                </select>
              </div>
              <div class="form-group">
                <label for="level">Experience Level</label>
                <select id="level" name="level" required>
                  <option value="" disabled selected>Select...</option>
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced / Diploma</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label for="message">Your Message</label>
              <textarea id="message" name="message" rows="5" placeholder="Tell us about your musical goals..."></textarea>
            </div>

            <button type="submit" class="btn btn-large">Send Enquiry</button>
          </div>
        </form>
      </div>
    </section>
```

## Slices

### Slice 1: CSS Bundling

**Files**: `.eleventy.js`, `package.json`

#### Automated Verification:
- [ ] Build succeeds: `npm run build` (requires `npm install` first for new deps)
- [ ] Output CSS has zero @import statements: `grep -c "@import" _site/css/index.css` returns `0`
- [ ] Token definitions preserved (order intact): `grep -c "\-\-cream" _site/css/index.css` returns `>= 1`
- [ ] Keyframe definitions preserved: `grep -c "@keyframes" _site/css/index.css` returns `>= 1`

#### Manual Verification:
- [ ] Dev server starts without error: `npm run dev`
- [ ] Homepage renders identically to pre-bundling state (no visual regressions)
- [ ] No-JS path intact: load with JS disabled, content visible, loader not blocking
- [ ] Mobile responsive: burger menu, sidebar, grid layouts work at 480px and 768px

### Slice 2: Source Code Bug Fixes

**Files**: `src/css/loader.css`, `src/about.html`, `src/_includes/header.html`

#### Automated Verification:
- [ ] Build succeeds: `npm run build`
- [ ] Loader fix present: `grep "&.ghost" src/css/loader.css` returns 1
- [ ] Old bare descendant selector gone: `grep -P "(?<!&)\\.ghost\\s*\\{" src/css/loader.css` returns 0
- [ ] aria-controls present: `grep 'aria-controls="sidebar"' src/_includes/header.html` returns 1
- [ ] about.html divs balanced: `grep -c "<div>" src/about.html` equals `grep -c "</div>" src/about.html`
- [ ] No joke text remains: `grep -c "We are cool" src/about.html` returns 0

#### Manual Verification:
- [ ] Loader: ghost piano renders as faint (12% opacity) inverted white outline behind the main piano
- [ ] about.html: loads without browser console warnings about unclosed elements
- [ ] Burger button: devtools inspection shows `aria-controls="sidebar"`; screen reader announces controlled element

### Slice 3: Accessibility Enhancements

**Files**: `src/_includes/base.html`, `src/css/reset.css`

#### Automated Verification:
- [ ] Build succeeds: `npm run build`
- [ ] Skip link present in output: `grep -c 'class="skip-link"' _site/index.html` returns 1
- [ ] Main has id + tabindex: `grep -c 'id="main-content" tabindex="-1"' _site/index.html` returns 1
- [ ] Skip link is first in body: `grep -A2 '<body>' _site/index.html | grep -c 'skip-link'` returns 1
- [ ] Focus-visible rule present: `grep -c ':focus-visible' src/css/reset.css` returns 1

#### Manual Verification:
- [ ] Tab once on page load — first focusable element is "Skip to content" link (top-left, gold bg, dark text)
- [ ] Press Enter on skip link — focus moves to `<main>` content area, screen reader announces the main region
- [ ] Tab through nav links and buttons — each shows a visible gold outline on focus
- [ ] Skip link is invisible when not focused (does not appear on page)
- [ ] No-JS path intact: skip link works as native anchor, content visible, loader not blocking

### Slice 4: Contact Form Complete

**Files**: `src/contact.html`

#### Automated Verification:
- [ ] Build succeeds: `npm run build`
- [ ] Form action wired: `grep 'action="https://formspree.io' _site/contact.html` returns 1
- [ ] Action is not placeholder `#`: `grep 'action="#"' _site/contact.html` returns 0
- [ ] Honeypot present: `grep '_gotcha' _site/contact.html` returns 1
- [ ] Phone fallback: `grep 'tel:+61467925666' _site/contact.html` returns 1
- [ ] Email fallback: `grep 'hello@kreutzer.com.au' _site/contact.html` returns 1

#### Manual Verification:
- [ ] Formspree: create form at formspree.io, replace YOUR_FORM_ID, submit test — email received
- [ ] Honeypot invisible: the `_gotcha` input is not visible on page (display:none)
- [ ] Phone/email visible as clickable links between hero and form
- [ ] Mobile: tap phone link opens dialer; tap email opens mail client
- [ ] No-JS path: form renders and submits via native POST (no JS required)

### Slice 5: Content Structure Guidance

**Files**: none (prose guidance in this artifact)

#### Automated Verification:
- [ ] Teacher cards have unique photos (not all `phoebe mu.jpg`): visual inspection
- [ ] Teacher cards have correct `alt` text matching displayed name: `grep 'alt=' src/teachers.html`

#### Manual Verification:
- [ ] About page has real copy in all three sections — no "[Content to be written]" placeholders
- [ ] About page section headings are meaningful and on-brand (not "sub heading")
- [ ] Teacher card back shows About (bio) first, Qualifications second
- [ ] Each teacher card has a unique, real photo
- [ ] No duplicate teacher data — each card represents a distinct real person
- [ ] Each card's `alt` text matches the teacher name displayed on that card

---

### Teacher Card Data Schema

Each card in `src/teachers.html` — **back face reordered: bio above qualifications**:

```
teacher-card-container
├── teacher-card-inner
│   ├── teacher-card-front
│   │   ├── teacher-image → <img src="..." alt="{name}">
│   │   └── teacher-front-overlay
│   │       ├── h3 → instrument & specialty
│   │       ├── h2 → full name
│   │       └── span → "Click to view bio ⟳"
│   └── teacher-card-back
│       └── teacher-info
│           ├── h3 → "About"
│           ├── p → short bio (2-3 sentences)
│           ├── h3 → "Qualifications"
│           ├── p.tagline → credential summary
│           └── a.btn → link to detail page or contact
```

**Example card back** (Phoebe Mu):
```html
<div class="teacher-card-back">
  <div class="teacher-info">
    <h3>About</h3>
    <p>Phoebe is committed to providing high-quality, one-on-one music education. She specializes in students from beginners to AMEB Diploma levels.</p>
    <h3>Qualifications</h3>
    <p class="tagline">Licentiate diplomas in Piano Performance with Trinity College London and the AMEB</p>
    <a href="phoebe.html" class="btn">Learn More</a>
  </div>
</div>
```

**Fix checklist:**
1. Determine actual teacher count. Remove excess cards if fewer than 4.
2. Replace each card's photo with the correct teacher's photo
3. Write correct `alt` text per image — must match displayed name
4. Reorder back face: About (bio) → Qualifications (creds)
5. Fill real instrument, bio, and qualifications per teacher
6. Set correct link target (`phoebe.html` or `contact.html`)

### About Page Content Plan

The about page (`src/about.html`) has three sections. Structural HTML fixed in Slice 2.

**Section 1: Hero**
- `h3`: "Our story" | `h1`: "About Us"
- `p`: 1-2 sentences — who Kreutzer is, what they do, Canberra

**Section 2: Beginnings**
- `h3`: "How we started" (or similar) | `h2`: "Beginnings"
- Content prompts: founding year, founder story, what "Kreutzer" references, what gap in Canberra music tuition was filled

**Section 3: Studio**
- `h3`: "Our space" (or similar) | `h2`: "Studio"
- Content prompts: Canberra location (suburb, accessibility), studio space description, photo opportunity (repurpose dead assets `IMG_5716.jpg` or `Sydney-Competition-homepage.jpg`)

**Optional additional sections:** Philosophy (teaching approach, 1-on-1 vs group), Community (recitals, ensembles, achievements), Team (teacher intros linking to teachers.html)

## Desired End State

After Phase 1:

```bash
# CSS delivers as a single file
curl -s https://grid-zero.github.io/Kruetzer/css/index.css | grep -c "@import"
# → 0 (no @import statements in output)

# Build succeeds
npm run build
# → 11 pages written, no errors

# Loader ghost piano renders faintly (visual check)
# about.html is valid HTML (no unclosed tags)
# Contact form submits to Formspree and includes honeypot
# Contact page shows phone number and email as text
# Burger button has aria-controls="sidebar"  
# Skip-to-content link is first focusable element
# Focus indicators are visible on interactive elements
```

## File Map

- `.eleventy.js`  # MODIFY — add PostCSS afterBuild hook
- `package.json`  # MODIFY — add postcss, postcss-import devDependencies
- `src/css/loader.css`  # MODIFY — .ghost → &.ghost
- `src/about.html`  # MODIFY — close unclosed div, replace placeholder text
- `src/_includes/header.html`  # MODIFY — add aria-controls="sidebar"
- `src/_includes/base.html`  # MODIFY — add skip-to-content link
- `src/css/reset.css`  # MODIFY — add :focus-visible styles
- `src/contact.html`  # MODIFY — Formspree action, honeypot, phone/email fallback

## Ordering Constraints

- Slice 1 (CSS Bundling) must come first — all CSS file changes in later slices need to be verified against the bundled output
- Slice 2 (Source bugs) depends on Slice 1 for verifying loader.css change in bundled output
- Slice 3 (Accessibility) depends on Slice 1 (CSS bundling for reset.css change), but is independent of Slice 2
- Slice 4 (Contact form) is independent of all other slices
- Slice 5 (Content guidance) depends on Slice 2 (about.html structure must be valid before content guidance)

## Verification Notes

- **CSS bundling**: Build must produce a single `_site/css/index.css` with zero @import statements and all custom properties defined. Grep for `@import` in output — expect 0 matches.
- **Loader bug**: Visual check — the ghost piano behind the loader fill should render as a faint (12% opacity) white outline. Without the fix, it renders at full opacity identically to the main piano.
- **about.html**: Run an HTML validator on `_site/about.html`. No unclosed elements. The empty `<p></p>` should either have content or be removed.
- **aria-controls**: Inspect the burger button in devtools — must have `aria-controls="sidebar"` attribute. Screen reader should announce the relationship.
- **Skip-to-content**: Tab once on page load — first focusable element should be the skip link. Activating it should move focus to `<main>`.
- **focus-visible**: Tab through interactive elements — each must have a visible focus ring/outline.
- **Contact form**: Test submission via Formspree — should receive email. The honeypot field must be invisible to users (display:none). Phone and email must be visible on the page as text links.
- **No-JS path**: Load index.html with JS disabled — content must be visible, loader must not block the page. (Existing requirement, must not regress.)

## Performance Considerations

- CSS bundling reduces ~16 sequential requests to 1 — significant first-paint improvement
- PostCSS processing adds negligible build time (~50ms for 15 small files)
- No runtime performance impact from other changes

## Migration Notes

Not applicable — no persisted data, no schema changes, no backwards compatibility concerns. This is a static site.

## Pattern References

- `src/css/index.css:1-15` — the @import manifest whose order must be preserved during bundling
- `src/_includes/base.html:8-13` — the `<head>` section where skip-to-content link must be inserted
- `src/_includes/header.html:14-17` — the burger button and sidebar where aria-controls must be added

## Developer Context

**Q (directional): CSS bundling approach for resolving 15 @import statements. PostCSS with postcss-import vs Eleventy transform vs prebuild script.**
A: PostCSS with postcss-import (Recommended). Add as afterBuild hook in .eleventy.js.

## Design History

- Slice 1: CSS Bundling — approved as generated
- Slice 2: Source Code Bug Fixes — approved as generated
- Slice 3: Accessibility Enhancements — approved as generated
- Slice 4: Contact Form Complete — approved as generated
- Slice 5: Content Structure Guidance — approved as generated (revised: bio before qualifications on card back)

## References

- `docs/superpowers/2026-06-13-website-review-directions.md` — website review and improvement directions (Phase 1 section)
