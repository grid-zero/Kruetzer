---
date: 2026-06-13T13:42:46+1000
author: grid-zero
commit: 353cc1b7df61f4ff2c0d010fc69d0a7d972fed75
branch: main
repository: website
topic: "Phase 1 Launch-Blocking Fixes"
tags: [plan, phase-1, css-bundling, bug-fixes, accessibility, contact-form, content-guidance]
status: ready
parent: ".rpiv/artifacts/designs/phase1-launch-fixes.md"
phase_count: 5
phases:
  - { n: 1, title: "CSS Bundling" }
  - { n: 2, title: "Source Code Bug Fixes" }
  - { n: 3, title: "Accessibility Enhancements" }
  - { n: 4, title: "Contact Form Complete" }
  - { n: 5, title: "Content Structure Guidance" }
last_updated: 2026-06-13T13:42:46+1000
last_updated_by: grid-zero
last_updated_note: "Step 5 triage: 1 concern applied (return promise in afterBuild hook)"
---

# Phase 1 Launch-Blocking Fixes Implementation Plan

## Overview

Resolve 6 code defects and wire the contact form to make the Kreutzer website minimally functional. The primary architectural change is introducing PostCSS + postcss-import to bundle 15 CSS @import files into a single stylesheet at build time. Additionally: fix a CSS nesting bug in the loader, repair malformed HTML on the about page, add two missing accessibility attributes (skip-to-content link, aria-controls, focus-visible styles), wire the contact form to Formspree with spam protection and a phone/email fallback, and provide structural guidance for teacher card data and about page content.

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

## What We're NOT Doing

- Font reduction / font loading optimization (Phase 4)
- Image optimization / dead asset removal (Phase 4)
- 404 page, sitemap, robots.txt (Phase 3)
- Schema.org structured data / Open Graph tags (Phase 3)
- Google Business Profile setup (Phase 3)
- Any page content for lessons, shop, resources, careers, phoebe, FAQ, terms (Phases 2-5)
- Nav restructure (Phase 5)
- Social media URL resolution (Phase 3)

---

## Phase 1: CSS Bundling

**Parallelism:** Must run first. Phases 2 & 3 depend on this phase. Phase 4 is independent.

### Overview

Introduce PostCSS + postcss-import as an `afterBuild` hook in `.eleventy.js` to resolve all 15 `@import` statements in `src/css/index.css` into a single bundled stylesheet at build time. Replace per-file passthrough with a single bundled `_site/css/index.css`. Add `postcss` and `postcss-import` as devDependencies.

### Changes Required:

#### 1. Eleventy Build Config
**File**: `.eleventy.js`
**Changes**: Add PostCSS afterBuild hook to process and bundle CSS @imports after passthrough copy.

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
    
    return postcss([postcssImport()])
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

#### 2. Package Dependencies
**File**: `package.json`
**Changes**: Add postcss and postcss-import devDependencies.

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

### Success Criteria:

#### Automated Verification:
- [x] Build succeeds: `npm run build` (requires `npm install` first for new deps)
- [x] Output CSS has zero @import statements: `grep -c "@import" _site/css/index.css` returns `0`
- [x] Token definitions preserved (order intact): `grep -c "\-\-cream" _site/css/index.css` returns `>= 1`
- [x] Keyframe definitions preserved: `grep -c "@keyframes" _site/css/index.css` returns `>= 1`

#### Manual Verification:
- [ ] Dev server starts without error: `npm run dev`
- [ ] Homepage renders identically to pre-bundling state (no visual regressions)
- [ ] No-JS path intact: load with JS disabled, content visible, loader not blocking
- [ ] Mobile responsive: burger menu, sidebar, grid layouts work at 480px and 768px

---

## Phase 2: Source Code Bug Fixes

**Parallelism:** Depends on Phase 1. Can run in parallel with Phase 3 after Phase 1.

### Overview

Fix three source-level bugs: (1) CSS nesting error in loader.css — `.ghost` should be `&.ghost` to match the same-element class combination on `img.piano.ghost`; (2) unclosed `<div>` in about.html line 6; (3) missing `aria-controls="sidebar"` on the burger menu button in header.html.

### Changes Required:

#### 1. Loader Ghost Piano Fix
**File**: `src/css/loader.css`
**Changes**: Change `.ghost` to `&.ghost` (line 35) so the selector matches same-element class combination instead of descendant.

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

#### 2. About Page HTML Fix
**File**: `src/about.html`
**Changes**: Close the unclosed `<div>` on line 6 and replace joke placeholder text with structural content placeholders.

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

#### 3. Burger Button aria-controls
**File**: `src/_includes/header.html`
**Changes**: Add `aria-controls="sidebar"` attribute to the burger button (line 16).

```html
    <button class="burger-btn" id="burgerBtn" aria-label="Toggle menu" aria-expanded="false" aria-controls="sidebar">
```

### Success Criteria:

#### Automated Verification:
- [x] Build succeeds: `npm run build`
- [x] Loader fix present: `grep "&.ghost" src/css/loader.css` returns 1
- [x] Old bare descendant selector gone: (only `&.ghost` remains, bare `.ghost` gone)
- [x] aria-controls present: `grep 'aria-controls="sidebar"' src/_includes/header.html` returns 1
- [x] about.html divs balanced: `<div>` count (1) equals `</div>` count (1)
- [x] No joke text remains: `grep -c "We are cool" src/about.html` returns 0

#### Manual Verification:
- [ ] Loader: ghost piano renders as faint (12% opacity) inverted white outline behind the main piano
- [ ] about.html: loads without browser console warnings about unclosed elements
- [ ] Burger button: devtools inspection shows `aria-controls="sidebar"`; screen reader announces controlled element

---

## Phase 3: Accessibility Enhancements

**Parallelism:** Depends on Phase 1 (CSS bundling for reset.css change). Independent of Phase 2, can run in parallel with Phase 2 after Phase 1.

### Overview

Add two accessibility features: (1) a skip-to-content link as the first focusable element in `<body>`, and (2) `:focus-visible` styles with a visible gold outline on interactive elements. Both changes live in `src/_includes/base.html` and `src/css/reset.css`.

### Changes Required:

#### 1. Skip-to-Content Link + Main ID
**File**: `src/_includes/base.html`
**Changes**: Add skip-to-content link as first element in `<body>`, add `id="main-content" tabindex="-1"` to `<main>`.

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

#### 2. Focus-Visible Styles + Skip Link CSS
**File**: `src/css/reset.css`
**Changes**: Add `:focus-visible` rule and `.skip-link` styles at the end of reset.css.

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

### Success Criteria:

#### Automated Verification:
- [x] Build succeeds: `npm run build`
- [x] Skip link present in output: `grep -c 'class="skip-link"' _site/index.html` returns 1
- [x] Main has id + tabindex: `grep -c 'id="main-content" tabindex="-1"' _site/index.html` returns 1
- [x] Skip link is first in body: `grep -A2 '<body>' _site/index.html | grep -c 'skip-link'` returns 1
- [x] Focus-visible rule present: `grep -c ':focus-visible' src/css/reset.css` returns 1

#### Manual Verification:
- [ ] Tab once on page load — first focusable element is "Skip to content" link (top-left, gold bg, dark text)
- [ ] Press Enter on skip link — focus moves to `<main>` content area, screen reader announces the main region
- [ ] Tab through nav links and buttons — each shows a visible gold outline on focus
- [ ] Skip link is invisible when not focused (does not appear on page)
- [ ] No-JS path intact: skip link works as native anchor, content visible, loader not blocking

---

## Phase 4: Contact Form Complete

**Parallelism:** Independent of all other phases.

### Overview

Wire the contact form to Formspree by replacing the placeholder `action="#"` with a real Formspree endpoint. Add a honeypot spam protection field, and add phone number and email address as visible text fallback between the hero and the form.

### Changes Required:

#### 1. Contact Page Rewrite
**File**: `src/contact.html`
**Changes**: Replace entire contact page with Formspree-backed form including honeypot field and phone/email fallback.

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

### Success Criteria:

#### Automated Verification:
- [x] Build succeeds: `npm run build`
- [x] Form action wired: `grep 'action="https://formspree.io' _site/contact.html` returns 1
- [x] Action is not placeholder `#`: `grep 'action="#"' _site/contact.html` returns 0
- [x] Honeypot present: `grep '_gotcha' _site/contact.html` returns 1
- [x] Phone fallback: `grep 'tel:+61467925666' _site/contact.html` returns 1
- [x] Email fallback: `grep 'hello@kreutzer.com.au' _site/contact.html` returns 1

#### Manual Verification:
- [ ] Formspree: create form at formspree.io, replace YOUR_FORM_ID, submit test — email received
- [ ] Honeypot invisible: the `_gotcha` input is not visible on page (display:none)
- [ ] Phone/email visible as clickable links between hero and form
- [ ] Mobile: tap phone link opens dialer; tap email opens mail client
- [ ] No-JS path: form renders and submits via native POST (no JS required)

---

## Phase 5: Content Structure Guidance

**Parallelism:** Depends on Phase 2 (about.html structure must be valid before content guidance). No code changes in this phase — purely prose guidance for manual content work.

### Overview

Provide structural guidance for fixing teacher card data and about page content. Both are business/content decisions — this phase documents the schema, section outline, and field checklist but does not generate content text.

### Changes Required:

#### 1. Teacher Card Data Schema (Prose Guidance)

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

#### 2. About Page Content Plan (Prose Guidance)

The about page (`src/about.html`) has three sections. Structural HTML fixed in Phase 2.

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

### Success Criteria:

#### Automated Verification:
- [ ] Teacher cards have unique photos (not all `phoebe mu.jpg`): visual inspection *(manual - see Content Guidance below)*
- [ ] Teacher cards have correct `alt` text matching displayed name: `grep 'alt=' src/teachers.html` *(manual - see Content Guidance below)*

*Phase 5 is prose guidance only — no code changes required.*

#### Manual Verification:
- [ ] About page has real copy in all three sections — no "[Content to be written]" placeholders
- [ ] About page section headings are meaningful and on-brand (not "sub heading")
- [ ] Teacher card back shows About (bio) first, Qualifications second
- [ ] Each teacher card has a unique, real photo
- [ ] No duplicate teacher data — each card represents a distinct real person
- [ ] Each card's `alt` text matches the teacher name displayed on that card

---

## Testing Strategy

### Automated:
- CSS bundling: build succeeds, zero @import in output, tokens + keyframes preserved
- Source bugs: loader selector correct, aria-controls present, about.html divs balanced
- Accessibility: skip link present in output, main has id+tabindex, focus-visible rule present
- Contact form: Formspree action, honeypot present, phone/email fallback in output
- Content guidance: grep-based checks for alt text and photo uniqueness

### Manual Testing Steps:
1. CSS bundling: dev server starts, homepage renders identically, no-JS path intact, mobile responsive
2. Source bugs: ghost piano renders faintly, about.html loads without console errors, screen reader announces burger button controlled element
3. Accessibility: skip link is first focusable element, visible gold focus outlines, skip link invisible when not focused
4. Contact form: Formspree test submission, honeypot invisible, phone/email clickable links, no-JS submission works
5. Content: about page real copy, teacher cards unique and correct

## Performance Considerations

- CSS bundling reduces ~16 sequential requests to 1 — significant first-paint improvement
- PostCSS processing adds negligible build time (~50ms for 15 small files)
- No runtime performance impact from other changes

## Migration Notes

Not applicable — no persisted data, no schema changes, no backwards compatibility concerns. This is a static site.

## Plan Review (Step 4)

_Independent post-finalization review by artifact-code-reviewer and artifact-coverage-reviewer subagents. Findings triaged at Step 5._

| source   | plan-loc                    | codebase-loc | severity | dimension    | finding                                                                                                                                                                                                                                                                                                      | recommendation                                                                                                               | resolution |
| -------- | --------------------------- | ------------ | -------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ---------- |
| code     | Phase 1 §1 (.eleventy.js)   | <n/a>        | concern  | code-quality | The `afterBuild` callback invokes `postcss([…]).process(…).then(…).catch(…)` but does not `return` the resulting Promise; Eleventy 3.0 honors event-handler promises only when they are returned, so the build may exit before `writeFileSync` completes, shipping `_site/css/index.css` with unresolved `@import` statements in production builds. | Add `return` before the `postcss(…)` expression so the promise chain is returned to Eleventy | applied: added `return` before postcss() promise chain |

_Coverage review: all 8 verification intents from the design's `## Verification Notes` are covered by success criteria bullets — zero uncovered entries._

## Developer Context

## References

- Design: `.rpiv/artifacts/designs/phase1-launch-fixes.md`
- Directional review: `docs/superpowers/2026-06-13-website-review-directions.md`
