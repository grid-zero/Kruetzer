# Eleventy Foundation Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the Kreutzer static site to Eleventy with a single shared header/footer (fixing nav inconsistency once), automate the GitHub Pages build, remove dead code, fix data inconsistencies, and make every page work without JavaScript.

**Architecture:** Eleventy compiles authored files in `src/` into plain static HTML in `_site/`. Each page becomes front-matter + its `<main>` content; a `base.html` layout supplies the shared `<head>`, header, footer, and scripts via Liquid `{% include %}`. The active nav link is computed at build time (no JS). A `js` class added by an inline script gates all JS-only styling so content and navigation work with scripts disabled.

**Tech Stack:** Eleventy (11ty) v3, Liquid templating (Eleventy default for `.html`), vanilla CSS/JS, GitHub Actions → GitHub Pages.

**Reference spec:** `docs/superpowers/specs/2026-06-12-eleventy-foundation-cleanup-design.md`

---

## File Structure (target)

```
website/
├── src/
│   ├── _includes/
│   │   ├── base.html        # page shell (head, header, footer, scripts)
│   │   ├── header.html      # the ONE nav (desktop + mobile), active-link aware
│   │   ├── footer.html      # the ONE footer (corrected email/links)
│   │   └── loader.html      # piano loader markup (homepage only)
│   ├── css/                 # moved from new/
│   ├── assets/              # moved from repo root
│   ├── index.js             # moved from repo root
│   ├── src.11tydata.js      # directory data: layout + keep-.html permalinks
│   ├── index.html  about.html  teachers.html  shop.html  resources.html
│   ├── lessons.html  contact.html  careers.html  faq.html  terms.html  phoebe.html
├── _site/                   # build output (git-ignored)
├── .eleventy.js
├── package.json
├── package-lock.json
├── .gitignore
└── .github/workflows/deploy.yml
```

**Path convention:** all shared links/assets in the layout use **relative** paths (e.g. `css/index.css`, `assets/...`, `index.js`), NOT root-relative (`/css/...`). Every page outputs flat at `_site/<name>.html`, so relative paths resolve correctly — and this avoids the GitHub Pages project-subpath problem (the site is served from `https://grid-zero.github.io/Kruetzer/`, where root-relative paths would break).

---

## Task 1: Initialize the Eleventy project

**Files:**
- Create: `package.json`
- Create: `.gitignore` (repo root — create if absent, else modify)

- [ ] **Step 1: Create `package.json`**

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
    "@11ty/eleventy": "^3.0.0"
  }
}
```

- [ ] **Step 2: Install Eleventy**

Run: `npm install`
Expected: creates `node_modules/` and `package-lock.json`; no errors. Requires Node 18+ (`node --version` to confirm).

- [ ] **Step 3: Create/append `.gitignore`**

Ensure these two lines exist in the repo-root `.gitignore` (create the file if it does not exist):

```gitignore
node_modules/
_site/
```

- [ ] **Step 4: Verify Eleventy is runnable**

Run: `npx @11ty/eleventy --version`
Expected: prints a 3.x version number (e.g. `3.0.0`).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .gitignore
git commit -m "chore: initialize Eleventy project"
```

---

## Task 2: Configure Eleventy and move static files into `src/`

**Files:**
- Create: `.eleventy.js`
- Create: `src/src.11tydata.js`
- Move: `new/` → `src/css/`, `assets/` → `src/assets/`, `index.js` → `src/index.js`

- [ ] **Step 1: Create `.eleventy.js`**

```js
module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/index.js");

  return {
    dir: { input: "src", output: "_site", includes: "_includes" },
    htmlTemplateEngine: "liquid",
    markdownTemplateEngine: "liquid",
  };
};
```

- [ ] **Step 2: Move static assets into `src/` (preserve history with `git mv`)**

```bash
mkdir src
git mv new src/css
git mv assets src/assets
git mv index.js src/index.js
```
Expected: `src/css/`, `src/assets/`, and `src/index.js` now exist; `new/` and the root `assets/`/`index.js` are gone. The CSS `@import` lines in `src/css/index.css` are sibling-relative and still resolve; `loader.css`'s `url('../assets/keyboard.png')` resolves to `/assets/keyboard.png` after the passthrough copy.

- [ ] **Step 3: Create the directory data file `src/src.11tydata.js`**

This applies the base layout to every page and preserves `.html` URLs (so existing `href="x.html"` links keep working untouched).

```js
module.exports = {
  layout: "base.html",
  eleventyComputed: {
    permalink: (data) => `${data.page.fileSlug}.html`,
  },
};
```

- [ ] **Step 4: Verify the build runs (passthrough only, no pages yet)**

Run: `npm run build`
Expected: completes without error. `_site/css/index.css`, `_site/assets/keyboard.png`, and `_site/index.js` exist. (No HTML pages yet — they are created in Tasks 4–5.)

Verify: `ls _site/css/index.css _site/index.js && echo OK`
Expected: prints both paths then `OK`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "build: configure Eleventy and move static files into src/"
```

---

## Task 3: Build the shared shell (layout + partials)

**Files:**
- Create: `src/_includes/base.html`
- Create: `src/_includes/header.html`
- Create: `src/_includes/footer.html`
- Create: `src/_includes/loader.html`
- Modify: `src/css/nav.css` (add active-link underline rule)

- [ ] **Step 1: Create `src/_includes/header.html`**

The nav list is defined once and reused in both the desktop nav and the mobile sidebar, so they can never drift. The active link is computed from `page.fileSlug` at build time (works with JS off). Includes the corrected logo `alt` text and the desktop/mobile logo variants.

```html
<header>
  <nav>
    <div>
      <a href="index.html">
        <img desktop src="assets/Kreutzer-源文件2修改颜色-.svg" alt="Kreutzer">
        <img mobile src="assets/Kreutzer-Logo-Only.svg" alt="Kreutzer">
      </a>
      {% assign navItems = "about,teachers,shop,resources,lessons" | split: "," %}
      <ul role="list">
        {% for item in navItems %}
        <li><a href="{{ item }}.html"{% if page.fileSlug == item %} class="active" aria-current="page"{% endif %}>{{ item }}</a></li>
        {% endfor %}
      </ul>
    </div>
    <nav-logo-main> Kreutzer </nav-logo-main>
    <a href="contact.html" class="btn">Enquire now</a>

    <!-- Mobile Section -->
    <button class="burger-btn" id="burgerBtn" aria-label="Toggle menu" aria-expanded="false">
      <span class="bar"></span>
      <span class="bar"></span>
      <span class="bar"></span>
    </button>

    <div class="overlay" id="overlay"></div>
    <aside id="sidebar">
      <ul role="list">
        {% for item in navItems %}
        <li><a href="{{ item }}.html"{% if page.fileSlug == item %} class="active" aria-current="page"{% endif %}>{{ item }}</a></li>
        {% endfor %}
      </ul>
    </aside>
  </nav>
</header>
```

- [ ] **Step 2: Create `src/_includes/footer.html`**

Email corrected to `hello@kreutzer.com.au` in **both** the link text and the `mailto:`. The dead `href="#"` location link becomes a real maps link; social links keep `#` with a TODO marker (real handles are a content-phase item).

```html
<footer>
  <div>
    <div>
      <h3>Kreutzer</h3>
      <p>Music tuition for all ages and levels at our dedicated Canberra studios. Building musicians and community since 2014.</p>
      <nav aria-label="Social links">
        <!-- TODO(content phase): replace # with real social profile URLs -->
        <a href="#" aria-label="Instagram">📷</a>
        <a href="#" aria-label="Facebook">📘</a>
        <a href="#" aria-label="YouTube">▶️</a>
      </nav>
    </div>
    <div>
      <h4>Navigate</h4>
      <ul role="list">
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="contact.html">Contact</a></li>
        <li><a href="contact.html">Book a lesson</a></li>
      </ul>
    </div>
    <div>
      <h4>More pages</h4>
      <ul role="list">
        <li><a href="careers.html">Careers</a></li>
        <li><a href="faq.html">FAQ</a></li>
        <li><a href="terms.html">Terms and Conditions</a></li>
      </ul>
    </div>
    <div>
      <h4>Contact</h4>
      <ul role="list">
        <li><a href="mailto:hello@kreutzer.com.au">hello@kreutzer.com.au</a></li>
        <li><a href="tel:+61467925666">+61 467 925 666</a></li>
        <li><a href="https://www.google.com/maps/search/?api=1&query=Canberra+ACT">Canberra, ACT</a></li>
      </ul>
    </div>
  </div>
  <span>© 2026 Kreutzer Music. All rights reserved.</span>
</footer>
```

- [ ] **Step 3: Create `src/_includes/loader.html`**

(Decorative images get empty `alt`.)

```html
<div class="loader-wrap" id="loaderWrap">
  <div class="piano-mask-wrap">
    <img class="piano ghost" src="assets/keyboard.png" alt="">
    <div class="piano-fill">
      <div class="piano-fill-inner" id="fillInner"></div>
    </div>
    <img class="piano" src="assets/keyboard.png" alt="">
  </div>
</div>
```

- [ ] **Step 4: Create `src/_includes/base.html`**

The inline `js`-class script runs before the stylesheet loads so the no-JS fallback never flashes. The loader is included only when a page sets `loader: true`. All paths are relative.

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
    {% if loader %}{% include "loader.html" %}{% endif %}
    {% include "header.html" %}
    <main>
      {{ content }}
    </main>
    {% include "footer.html" %}
    <script src="index.js" defer></script>
  </body>
</html>
```

- [ ] **Step 5: Add the active-link underline rule to `src/css/nav.css`**

The existing `::after` underline (used for hover) is forced visible on the active link, giving a persistent underline. This selector covers both the desktop nav and the mobile sidebar (both are under `header > nav`). Append to the end of `src/css/nav.css`:

```css
/* Persistent underline on the current page's nav link (no JS needed) */
header > nav ul a.active::after,
header > nav ul a[aria-current="page"]::after {
  transform: scaleX(1);
}
```

- [ ] **Step 6: Verify partials parse (build still succeeds)**

Run: `npm run build`
Expected: completes without error. (Still no pages output — partials are only used once a page references the layout in Task 4.)

- [ ] **Step 7: Commit**

```bash
git add src/_includes src/css/nav.css
git commit -m "feat: add shared base layout, header, footer, loader partials"
```

---

## Task 4: Convert the homepage and verify end-to-end

This is the worked example for the page-conversion pattern used in Task 5.

**Conversion pattern (applies to every page):**
1. Replace the entire file with a front-matter block (`---` fenced) followed by **only the markup currently between `<main>` and `</main>`** (the inner content, excluding the `<main>` tags themselves — the layout supplies `<main>`).
2. Drop the old `<!doctype>`, `<head>`, `<header>`, `<footer>`, and `<script>` — all now provided by `base.html`.

**Files:**
- Create: `src/index.html` (new converted version; the old root `index.html` is deleted later in Task 7)

- [ ] **Step 1: Create `src/index.html`**

Front-matter, then the verbatim inner-`<main>` content from the current root `index.html` (lines 64–207, i.e. everything between `<main>` and `</main>`). `loader: true` enables the homepage loader.

```html
---
title: "Kreutzer — Music Tuition in Canberra"
description: "Private music lessons, a thriving community and recital opportunities in Canberra — for beginners through to advanced musicians."
loader: true
---
<!-- BEGIN verbatim copy of current index.html inner <main> (lines 64–207) -->
<section intro>
<div>
  <h3> Music Tuition · Canberra </h3>
  <h1>Inspiring The <em>Art</em><br>Of Music</h1>
  <p>Private lessons, a thriving community and recital opportunities — for beginners through to advanced musicians.</p>
  <div>
    <a href="contact.html" class="btn">Book a Trial Lesson</a>
    <a href="about.html" class="btn btn-clear">Meet Your Teacher</a>
  </div>
</div>
</section>
<!-- ...continue copying every section through the closing of the pricing/contact sections...
     Copy lines 64–207 of the existing root index.html EXACTLY as-is. Do not retype or
     reword; this is a mechanical copy. The content is unchanged in this phase. -->
```

> NOTE TO IMPLEMENTER: The homepage `<main>` is long (the `about`, `instruments`, `how-it-works`, `testimonials`, `pricing`, and `contact` sections). Copy it verbatim from the existing root `index.html`, lines 64 through 207 inclusive. No content edits in this phase.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: completes without error; `_site/index.html` is created.

- [ ] **Step 3: Verify the homepage output**

```bash
test -f _site/index.html && echo FILE_OK
grep -c '<header>' _site/index.html        # expect 1
grep -c 'id="loaderWrap"' _site/index.html # expect 1 (loader present on home)
grep -c 'href="lessons.html"' _site/index.html  # expect 2 (desktop nav + mobile sidebar)
grep -c 'hello@kreutzer.com.au' _site/index.html # expect >=1 (corrected email)
grep -c 'kreutzer@gmail.com' _site/index.html    # expect 0 (old email gone)
```
Expected: `FILE_OK`, then `1`, `1`, `2`, a number ≥1, and `0`.

- [ ] **Step 4: Visual check in the dev server**

Run: `npm run dev`
Open `http://localhost:8080/index.html`. Confirm: page renders identically to before, loader animates, nav and footer present. Stop the server (Ctrl+C).

- [ ] **Step 5: Commit**

```bash
git add src/index.html
git commit -m "feat: convert homepage to Eleventy layout"
```

---

## Task 5: Convert the remaining pages

Apply the **conversion pattern** from Task 4 to each page below. For each: create `src/<name>.html` with the front-matter shown, followed by the verbatim inner-`<main>` content copied from the existing root file of the same name. The old root files are deleted in Task 7.

**Files (create each):**
`src/about.html`, `src/teachers.html`, `src/contact.html`, `src/faq.html`, `src/terms.html`, `src/shop.html`, `src/resources.html`, `src/lessons.html`, `src/careers.html`, `src/phoebe.html`

- [ ] **Step 1: Convert the content-bearing pages**

For each, front-matter then verbatim inner-`<main>` from the existing root file:

`src/about.html` — copy inner-`<main>` from root `about.html` (lines 51–69):
```
---
title: "About | Kreutzer"
description: "The Kreutzer story — more than lessons, a musical community in Canberra."
---
```

`src/teachers.html` — copy inner-`<main>` from root `teachers.html` (lines 47–164). Leave the "Learn More → phoebe.html" link as-is (phoebe.html is kept). Duplicate-teacher content is a content-phase fix, out of scope here:
```
---
title: "Teachers | Kreutzer"
description: "Meet the Kreutzer teachers — performers and dedicated educators committed to your growth."
---
```

`src/contact.html` — copy inner-`<main>` from root `contact.html` (lines 51–111). The form still posts to `#` (backend is out of scope; flagged in spec):
```
---
title: "Contact | Kreutzer"
description: "Get in touch with Kreutzer to book a free trial music lesson in Canberra."
---
```

`src/faq.html` — copy inner-`<main>` from root `faq.html` (lines 50–91):
```
---
title: "FAQ | Kreutzer"
description: "Frequently asked questions about Kreutzer music lessons in Canberra."
---
```

`src/terms.html` — copy inner-`<main>` from root `terms.html` (everything between its `<main>` and `</main>`):
```
---
title: "Terms & Conditions | Kreutzer"
description: "Kreutzer Music terms and conditions."
---
```

- [ ] **Step 2: Convert the "Coming Soon" stub pages**

`src/shop.html`, `src/resources.html`, `src/lessons.html`, `src/careers.html`, and `src/phoebe.html` all currently have the identical stub `<main>`. For each, use its front-matter below followed by this exact body:

```html
<section intro style="min-height: 30vh; background: var(--bg-blue);">
  <div>
    <h3></h3>
    <h1>Coming <em>Soon...</em></h1>
    <p></p>
  </div>
</section>
```

Front-matter per page:

`src/shop.html`:
```
---
title: "Shop | Kreutzer"
description: "The Kreutzer shop — coming soon."
---
```
`src/resources.html`:
```
---
title: "Resources | Kreutzer"
description: "Learning resources from Kreutzer — coming soon."
---
```
`src/lessons.html`:
```
---
title: "Lessons | Kreutzer"
description: "Music lessons at Kreutzer — coming soon."
---
```
`src/careers.html`:
```
---
title: "Careers | Kreutzer"
description: "Careers at Kreutzer — coming soon."
---
```
`src/phoebe.html`:
```
---
title: "Phoebe Mu | Kreutzer"
description: "About Phoebe Mu — piano and theory teacher at Kreutzer."
---
```

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: completes without error; all 11 pages exist in `_site/`.

Verify: `ls _site/*.html | wc -l`
Expected: `11` (index, about, teachers, shop, resources, lessons, contact, careers, faq, terms, phoebe).

- [ ] **Step 4: Verify nav consistency and active state across pages**

```bash
# Every page now has the 5-item nav, twice (desktop + mobile) — previously subpages had 0 "lessons" links:
for f in about teachers shop resources lessons contact careers faq terms phoebe; do
  printf "%-12s lessons-links=%s\n" "$f" "$(grep -c 'href=\"lessons.html\"' _site/$f.html)"
done
# Expect 2 for every page.

# Active link is stamped on the matching page:
grep -o 'href="about.html" class="active"' _site/about.html      # expect a match on about
grep -o 'href="lessons.html" class="active"' _site/lessons.html  # expect a match on lessons
```
Expected: every page reports `lessons-links=2`; the two `grep -o` calls each print a match.

- [ ] **Step 5: Commit**

```bash
git add src/about.html src/teachers.html src/contact.html src/faq.html src/terms.html \
        src/shop.html src/resources.html src/lessons.html src/careers.html src/phoebe.html
git commit -m "feat: convert all remaining pages to Eleventy layout"
```

---

## Task 6: No-JS hardening

Make content visible by default and gate all JS-only behaviour behind the `js` class. Also guard `index.js` so it never throws on pages without a loader.

**Files:**
- Modify: `src/css/root.css` (the `.reveal` block, lines 128–146)
- Modify: `src/css/loader.css` (the `.loader-wrap` rule, lines 3–16)
- Modify: `src/index.js` (guard loader + burger blocks)

- [ ] **Step 1: Make `.reveal` content visible without JS in `src/css/root.css`**

Replace the existing block (currently lines 128–146, from the `/* animations */` comment through `.reveal-delay-3`) with:

```css
/* animations — content is visible by default so it shows without JS */
.reveal {
  opacity: 1;
  transform: none;
}
/* When JS is available, hide first, then reveal on scroll */
.js .reveal {
  transform: translateY(28px);
  opacity: 0;
  transition: opacity 1.65s var(--ease), transform 0.65s var(--ease);
}
.js .reveal.visible {
  transform: translateY(0);
  opacity: 1;
}
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }
```

- [ ] **Step 2: Hide the loader without JS in `src/css/loader.css`**

In the `.loader-wrap` rule (lines 3–16), change `display: flex;` to `display: none;`. Then add this rule immediately after the closing `}` of `.loader-wrap`:

```css
/* Loader only shows when JS is present; otherwise the page renders immediately */
.js .loader-wrap { display: flex; }
```

- [ ] **Step 3: Guard `src/index.js` so it never throws on loader-less pages**

Wrap the loader logic (currently lines 1–37, from `const fillInner` through `requestAnimationFrame(step);`) in an existence check. Replace those lines with:

```js
const fillInner   = document.getElementById('fillInner');
const loaderWrap  = document.getElementById('loaderWrap');

if (fillInner && loaderWrap) {
  let current = 0;
  const target = 100;

  // Simulate a realistic loading curve (fast then slows, then finishes)
  function easeProgress(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  const duration = 1600; // ms total
  let startTime = null;

  function step(ts) {
    if (!startTime) startTime = ts;
    const elapsed = Math.min(ts - startTime, duration);
    const rawT    = elapsed / duration;
    const eased   = easeProgress(rawT);
    const pct     = Math.round(eased * 100);

    fillInner.style.width = pct + '%';

    if (elapsed < duration) {
      requestAnimationFrame(step);
    } else {
      fillInner.style.width = '100%';
      loaderWrap.classList.add('done');
      setTimeout(() => { loaderWrap.style.display = "none"; }, 2000);
    }
  }

  requestAnimationFrame(step);
}
```

- [ ] **Step 4: Guard the burger-menu block in `src/index.js`**

Wrap the burger logic (the block starting `const btn = document.getElementById('burgerBtn');` through the `keydown`/`sidebar-link` listeners) so it only runs when the elements exist. Change:

```js
  const btn = document.getElementById('burgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
```
to:
```js
  const btn = document.getElementById('burgerBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('overlay');
 if (btn && sidebar && overlay) {
```
and add a matching closing `}` after the final `sidebar.querySelectorAll('.sidebar-link')...` listener block at the end of the file.

- [ ] **Step 5: Build and verify the no-JS wiring is in the output**

Run: `npm run build`
```bash
grep -c "classList.add('js')" _site/index.html   # expect 1 (inline script present)
grep -c '.js .reveal' _site/css/root.css          # expect 1 (JS-gated reveal)
grep -c '.js .loader-wrap' _site/css/loader.css   # expect 1 (JS-gated loader)
```
Expected: `1`, `1`, `1`.

- [ ] **Step 6: Manual no-JS check (the real acceptance test)**

Run `npm run dev`. In the browser, disable JavaScript (DevTools → Command Palette → "Disable JavaScript", or browser settings), then hard-reload `http://localhost:8080/index.html` and `http://localhost:8080/about.html`. Confirm:
- All page content is visible (no blank/invisible sections).
- The loader is NOT shown (page appears immediately).
- Nav links work and the current page's link is underlined.
Re-enable JavaScript and confirm the loader + reveal animations work as before. Stop the server.

- [ ] **Step 7: Commit**

```bash
git add src/css/root.css src/css/loader.css src/index.js
git commit -m "feat: harden site to work without JavaScript"
```

---

## Task 7: Remove dead and legacy files

Now that `src/` is the source of truth and the build is verified, delete the orphan and the superseded root-level files.

**Files:**
- Delete: `navbar.html` (true orphan, referenced nowhere)
- Delete: the legacy root page files now superseded by `src/` versions: `index.html`, `about.html`, `teachers.html`, `shop.html`, `resources.html`, `lessons.html`, `contact.html`, `careers.html`, `faq.html`, `terms.html`, `phoebe.html`

- [ ] **Step 1: Confirm `navbar.html` is unreferenced**

Run: `grep -rn "navbar.html" src .eleventy.js 2>/dev/null | wc -l`
Expected: `0` (nothing links to it).

- [ ] **Step 2: Delete the orphan and legacy root pages**

```bash
git rm navbar.html index.html about.html teachers.html shop.html resources.html \
       lessons.html contact.html careers.html faq.html terms.html phoebe.html
```
Expected: 12 files removed. The `src/` versions remain.

- [ ] **Step 3: Rebuild and confirm nothing broke**

Run: `npm run build`
Verify: `ls _site/*.html | wc -l`
Expected: `11` (the converted pages still build; `navbar.html` is gone for good).

- [ ] **Step 4: Confirm no stale email or orphan references remain anywhere in source or output**

```bash
grep -rl "kreutzer@gmail.com" src _site | wc -l   # expect 0
grep -rl "navbar.html" _site | wc -l               # expect 0
```
Expected: `0` and `0`.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: remove orphan navbar.html and legacy root pages"
```

---

## Task 8: GitHub Pages deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: _site

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: One-time GitHub setting (manual — document, do not script)**

In the GitHub repo: **Settings → Pages → Build and deployment → Source → "GitHub Actions"**. (Previously this was "Deploy from a branch".) This is a manual click the repo owner performs once; note it in the PR/commit description so it isn't missed.

- [ ] **Step 3: Validate the workflow YAML locally**

Run: `npx --yes js-yaml .github/workflows/deploy.yml > /dev/null && echo YAML_OK`
Expected: prints `YAML_OK` (no parse error). If `js-yaml` is unavailable offline, instead visually confirm indentation is 2-space and consistent.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Pages build-and-deploy workflow"
```

---

## Task 9: Final full verification

- [ ] **Step 1: Clean build from scratch**

```bash
rm -rf _site
npm run build
ls _site/*.html | wc -l   # expect 11
```

- [ ] **Step 2: Run the consolidated acceptance checks**

```bash
# Single header/footer per page, full nav everywhere:
for f in _site/*.html; do
  h=$(grep -c '<header>' "$f"); l=$(grep -c 'href="lessons.html"' "$f")
  echo "$(basename "$f"): headers=$h lessons-links=$l"
done
# Expect: headers=1 and lessons-links=2 for every page.

# Data fixes:
grep -rl "kreutzer@gmail.com" _site | wc -l        # expect 0
grep -c 'hello@kreutzer.com.au' _site/contact.html # expect >=1

# No-JS wiring present:
grep -c "classList.add('js')" _site/about.html     # expect 1
```
Expected: every page `headers=1 lessons-links=2`; `0`; a value ≥1; `1`.

- [ ] **Step 3: Manual smoke test in the browser (JS on, then off)**

`npm run dev`, then click through all nav links and the footer links on a couple of pages; confirm the active link underline tracks the current page, the mobile burger menu opens/closes, and (JS off) every page still renders fully with no loader trap. Stop the server.

- [ ] **Step 4: Final commit (if any verification fixes were needed)**

```bash
git add -A
git commit -m "test: final verification fixes for Eleventy foundation" --allow-empty
```

---

## Self-Review notes (author)

- **Spec coverage:** Eleventy + shared partials (Tasks 2–5), nav consistency + active underline (Tasks 3, 5), GitHub Pages Action (Task 8), dead-file removal (Task 7, corrected to keep `phoebe.html`), email/dead-link/alt fixes (Tasks 3, footer/header partials), no-JS hardening incl. loader + reveal + `index.js` guards (Task 6). All spec sections map to a task.
- **Relative-path decision** (Task 3 base.html) is the mechanism that satisfies "existing `href="x.html"` links keep working" and the GitHub Pages subpath constraint — flagged explicitly.
- **Naming consistency:** `loaderWrap`/`fillInner` ids, `js` class, `.active`/`aria-current` selectors, and `navItems` list are used identically across header.html, base.html, nav.css, and index.js.
