# Motion System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's single blanket scroll-fade with a small, deliberate CSS motion vocabulary plus a cinematic homepage hero, without duplicating animations that already exist.

**Architecture:** Extend the existing `IntersectionObserver` + `.reveal` mechanism (visible-by-default, so no-JS still works) with composable gesture-modifier classes. One signature hero (word-by-word + blur + CSS Ken Burns). A single shared `.draw-underline` utility absorbs the nav's existing underline so it is defined once. Count-up is the only new JS, guarded and reduced-motion-aware.

**Tech Stack:** Eleventy 3 + Liquid, hand-written component CSS (bundled by postcss-import), one vanilla JS file. No test harness — **verification is `npm run build` + targeted grep of `_site/`** (per `CLAUDE.md`).

**Reference:** spec at `docs/superpowers/specs/2026-06-14-motion-system-design.md`. Design rules in `DESIGN.md` and `src/css/README.md`.

**Pre-existing animations to preserve, NOT duplicate (verified in source):**
- Nav underline-draw on hover + active link — `nav.css:49-65,153-157`. → Task 3 factors it into `.draw-underline`.
- Pricing card hover-lift — `pricing.css:19-26`. → Task 6 only adds a reduced-motion guard; no new lift.
- Testimonials reveal via `slideIn` is **dead code** — the `index.html` articles have **no `.reveal` class**, so it never fires; `slideIn` is referenced only here. → Tasks 6+7 **fully replace** it (remove the dead CSS + keyframe, add a working directional reveal).

**Cascade-safety note:** `index.css` imports in order `… reveal → buttons → nav → … → sections → instruments → testimonials → pricing …`. A `prefers-reduced-motion` override only works if it is declared **after** the animation it cancels. Therefore each component's reduced-motion guard is **co-located in that component's file** (per `src/css/README.md` philosophy); `reveal.css` owns only the guard for the `.reveal*` selectors it alone declares.

---

### Task 1: Motion tokens & keyframes

**Files:**
- Modify: `src/css/tokens.css` (inside `:root`, before the closing `}` at line 55)
- Modify: `src/css/keyframes.css` (append)
- Modify: `src/css/README.md` (keyframes list)

- [ ] **Step 1: Add motion tokens**

In `src/css/tokens.css`, insert these lines immediately after the existing `--ease-emphatic` line (line 54), before the closing `}`:

```css
  --ease-out:   cubic-bezier(0.16, 1, 0.3, 1);
  --t-reveal:   0.7s;
  --t-wipe:     0.85s;
  --t-kenburns: 28s;
```

- [ ] **Step 2: Add keyframes**

Append to `src/css/keyframes.css`:

```css
@keyframes kenBurns {
  from { transform: scale(1); }
  to   { transform: scale(1.06); }
}

@keyframes wordIn {
  from { opacity: 0; transform: translateY(28px); filter: blur(8px); }
  to   { opacity: 1; transform: none;             filter: blur(0); }
}
```

Then keep the CSS README's keyframe list accurate — in `src/css/README.md` (line 32), change `(fadeUp, fadeIn, slideIn, shimmer)` to `(fadeUp, fadeIn, slideIn, shimmer, kenBurns, wordIn)`.

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: completes, "Wrote 12 files" (unchanged count).

- [ ] **Step 4: Verify tokens & keyframes bundled**

Run: `rg "ken-?Burns|--t-kenburns|wordIn" _site/css/index.css`
Expected: matches for `--t-kenburns`, `kenBurns`, `wordIn`.

- [ ] **Step 5: Commit**

```bash
git add src/css/tokens.css src/css/keyframes.css src/css/README.md
git commit -m "feat(motion): add motion tokens and keyframes (kenBurns, wordIn)"
```

---

### Task 2: Reveal vocabulary + reduced-motion

**Files:**
- Modify: `src/css/reveal.css` (replace entire file)

- [ ] **Step 1: Replace `src/css/reveal.css` with the vocabulary**

```css
.reveal {
  opacity: 1;
  transform: none;
}
.js .reveal {
  opacity: 0;
  transform: translateY(28px);
  transition:
    opacity var(--t-reveal) var(--ease),
    transform var(--t-reveal) var(--ease),
    filter var(--t-reveal) var(--ease);
}
.js .reveal.visible {
  opacity: 1;
  transform: none;
  filter: none;
}

/* Directional */
.js .reveal--left  { transform: translateX(-40px); }
.js .reveal--right { transform: translateX(40px); }

/* Blur-to-sharp */
.js .reveal--blur {
  filter: blur(12px);
  transform: scale(1.03);
}

/* Clip-path wipe — the mask reveals, no fade */
.js .reveal--wipe {
  opacity: 1;
  transform: none;
  clip-path: inset(0 100% 0 0);
  transition: clip-path var(--t-wipe) var(--ease);
}
.js .reveal--wipe.visible {
  clip-path: inset(0 0 0 0);
}

/* Stagger — cascade direct .reveal children of a .reveal-stagger parent */
.js .reveal-stagger > .reveal:nth-child(2) { transition-delay: 0.08s; }
.js .reveal-stagger > .reveal:nth-child(3) { transition-delay: 0.16s; }
.js .reveal-stagger > .reveal:nth-child(4) { transition-delay: 0.24s; }
.js .reveal-stagger > .reveal:nth-child(5) { transition-delay: 0.32s; }
.js .reveal-stagger > .reveal:nth-child(6) { transition-delay: 0.40s; }

/* Manual one-off delays (kept for non-stagger cases) */
.reveal-delay-1 { transition-delay: 0.1s; }
.reveal-delay-2 { transition-delay: 0.2s; }
.reveal-delay-3 { transition-delay: 0.3s; }

@media (prefers-reduced-motion: reduce) {
  .js .reveal,
  .js .reveal--left,
  .js .reveal--right,
  .js .reveal--blur,
  .js .reveal--wipe {
    opacity: 1;
    transform: none;
    filter: none;
    clip-path: none;
    transition: none;
  }
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: completes, 12 files.

- [ ] **Step 3: Verify variants bundled**

Run: `rg "reveal--left|reveal--wipe|reveal-stagger|prefers-reduced-motion" _site/css/index.css`
Expected: all four match.

- [ ] **Step 4: Commit**

```bash
git add src/css/reveal.css
git commit -m "feat(motion): add reveal vocabulary (directional, wipe, blur, stagger) + reduced-motion"
```

---

### Task 3: Shared `.draw-underline` utility + nav de-duplication

**Files:**
- Modify: `src/css/sections.css` (add the utility)
- Modify: `src/css/nav.css` (remove the duplicate `::after`, keep active state)
- Modify: `src/_includes/header.html` (add class to both nav-link loops)

- [ ] **Step 1: Add the shared utility to `src/css/sections.css`**

Insert immediately after the `section h3 { … }` rule (after line 32, before `section[default]`):

```css
/* Shared gold underline-draw — one definition, reused by nav and headings.
   Triggers: hover, or scroll-reveal (.visible). Nav active state lives in nav.css. */
.draw-underline {
  position: relative;
  padding-bottom: 3px;
}
.draw-underline::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--t-mid) var(--ease);
}
.draw-underline:hover::after,
.draw-underline.visible::after {
  transform: scaleX(1);
}
@media (prefers-reduced-motion: reduce) {
  .draw-underline::after { transition: none; }
}
```

- [ ] **Step 2: Remove the duplicate underline from `src/css/nav.css`**

Replace the current block (lines 49-65):

```css
header > nav  ul a {
  font-size: var(--text-sm);
  letter-spacing: 0.06em;
  position: relative;
  padding-bottom: 3px;
}
header > nav ul a:hover::after { transform: scaleX(1); }
header > nav ul a::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0;
  width: 100%; height: 1px;
  background: var(--gold);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--t-mid) var(--ease);
}
```

with (the `::after`, hover, `position`, `padding-bottom` now come from `.draw-underline`):

```css
header > nav  ul a {
  font-size: var(--text-sm);
  letter-spacing: 0.06em;
}
```

Leave the active-state rule at lines 153-157 **unchanged** — it still sets `transform: scaleX(1)` on the `.draw-underline`-provided `::after`:

```css
header > nav ul a.active::after,
header > nav ul a[aria-current="page"]::after {
  transform: scaleX(1);
}
```

- [ ] **Step 3: Add `draw-underline` to the nav links in `src/_includes/header.html`**

There are **two** identical link loops (top nav line 11, sidebar line 29). Change **both** occurrences of:

```liquid
<li><a href="{{ item }}.html"{% if page.fileSlug == item %} class="active" aria-current="page"{% endif %}>{{ item }}</a></li>
```

to:

```liquid
<li><a href="{{ item }}.html" class="draw-underline{% if page.fileSlug == item %} active{% endif %}"{% if page.fileSlug == item %} aria-current="page"{% endif %}>{{ item }}</a></li>
```

- [ ] **Step 4: Verify build**

Run: `npm run build`
Expected: 12 files.

- [ ] **Step 5: Verify single definition + applied to nav**

Run: `rg -c "background: var\(--gold\)" _site/css/index.css` then inspect — the scaleX underline `::after` should appear once via `.draw-underline` (the only `transform: scaleX(0)` underline). Confirm:

Run: `rg "draw-underline" _site/css/index.css _site/about.html`
Expected: the class is defined in the CSS bundle and present on nav `<a>` elements in `_site/about.html`.

- [ ] **Step 6: Manual check (note for human)**

Hover a top-nav item → gold underline draws left-to-right. Load `about.html` → the "about" nav item shows a persistent underline (active state). No double underline anywhere.

- [ ] **Step 7: Commit**

```bash
git add src/css/sections.css src/css/nav.css src/_includes/header.html
git commit -m "refactor(motion): factor nav underline into shared .draw-underline (no duplication)"
```

---

### Task 4: Hero choreography — word rise + blur + Ken Burns

**Files:**
- Modify: `src/css/sections.css` (hero photo → `::before`, word animation, hero reduced-motion guard)
- Modify: `src/index.html` (hero `<section>` marker + `h1` word spans)

- [ ] **Step 1: Move the hero photo to a `::before` layer (homepage only)**

In `src/css/sections.css`, in the `section[intro] { … }` rule (starts line 39), **remove** these three lines:

```css
  background-image: url('../assets/IMG_5717.jpg');
  background-position: 0% 70%;
  background-size: cover;
```

(Keep `background: var(--bg);`, `position: relative;`, `min-height: 92vh;`, `overflow: hidden;` and the rest.)

- [ ] **Step 2: Remove the whole-`h1` animation, add word animation**

Within the same `section[intro]` block, in the `& h1 { … }` rule, **delete** the line:

```css
    animation: fadeUp 0.7s 0.45s var(--ease) both;
```

Then, immediately after the `& h1 em { … }` rule (after line 82), **add** inside the `section[intro]` block:

```css
  & h1 .word {
    display: inline-block;
    animation: wordIn 0.7s var(--ease) both;
  }
  & h1 .word:nth-of-type(1) { animation-delay: 0.45s; }
  & h1 .word:nth-of-type(2) { animation-delay: 0.57s; }
  & h1 .word:nth-of-type(3) { animation-delay: 0.69s; }
  & h1 .word:nth-of-type(4) { animation-delay: 0.81s; }
  & h1 .word:nth-of-type(5) { animation-delay: 0.93s; }
```

- [ ] **Step 3: Add the photo `::before`, content stacking, and hero reduced-motion guard**

In `src/css/sections.css`, immediately **after** the closing `}` of the `section[intro] { … }` block (after line 92), before `/* ABOUT SECTION */`, add:

```css
section[intro] > div { position: relative; z-index: 1; }

section[intro][home]::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  background-image: url('../assets/IMG_5717.jpg');
  background-position: 0% 70%;
  background-size: cover;
  animation: kenBurns var(--t-kenburns) var(--ease) infinite alternate both;
}

@media (prefers-reduced-motion: reduce) {
  section[intro][home]::before { animation: none; }
  section[intro] h1 .word {
    animation: none;
    opacity: 1;
    transform: none;
    filter: none;
  }
}
```

(The photo is scoped to `[home]`; interior heroes keep their inline `background: var(--bg-blue)` with no photo. This guard is co-located here — not in `reveal.css` — so it lands **after** the `kenBurns`/`wordIn` declarations and actually overrides them.)

- [ ] **Step 4: Mark the homepage hero and split the heading into words**

In `src/index.html`, change line 6 from:

```html
      <section intro>
```

to:

```html
      <section intro home>
```

and change the `h1` (line 9) from:

```html
        <h1>Inspiring The <em>Art</em><br>Of Music</h1>
```

to:

```html
        <h1><span class="word">Inspiring</span> <span class="word">The</span> <span class="word"><em>Art</em></span><br><span class="word">Of</span> <span class="word">Music</span></h1>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: 12 files.

- [ ] **Step 6: Verify hero output**

Run: `rg "section intro home|class=\"word\"" _site/index.html`
Expected: `<section intro home>` and 5 `class="word"` spans.
Run: `rg "section\[intro\]\[home\]::before|kenBurns" _site/css/index.css`
Expected: both match.

- [ ] **Step 7: Manual check (note for human)**

Homepage: heading words rise+settle from blur in sequence; the photo drifts slowly (Ken Burns). Interior pages (e.g. `lessons.html`) still show the solid blue hero — **no photo**. With OS reduced-motion on: words appear instantly, photo static.

- [ ] **Step 8: Commit**

```bash
git add src/css/sections.css src/index.html
git commit -m "feat(motion): cinematic homepage hero — word rise, blur settle, CSS Ken Burns"
```

---

### Task 5: Count-up stats

**Files:**
- Modify: `src/index.js` (add guarded, reduced-motion-aware count-up)
- Modify: `src/index.html` (stat numbers get `data-count`/`data-suffix`)

- [ ] **Step 1: Add `data-count` to the homepage stats**

In `src/index.html`, change the three stat numbers (lines 28-30):

```html
        <div class="reveal"><div>10+</div><div>Years of teaching experience</div></div>
        <div class="reveal reveal-delay-1"><div>5</div><div>Instruments taught</div></div>
        <div class="reveal reveal-delay-2"><div>100%</div><div>Personalised lessons</div></div>
```

to:

```html
        <div class="reveal"><div data-count="10" data-suffix="+">10+</div><div>Years of teaching experience</div></div>
        <div class="reveal reveal-delay-1"><div data-count="5" data-suffix="">5</div><div>Instruments taught</div></div>
        <div class="reveal reveal-delay-2"><div data-count="100" data-suffix="%">100%</div><div>Personalised lessons</div></div>
```

(The final value stays in the HTML, so with JS off the real numbers show.)

- [ ] **Step 2: Add the count-up feature to `src/index.js`**

Insert this block immediately after the reveal `IntersectionObserver` block (after line 60, before the teacher-card block). It is element-guarded (no-op when there are no `[data-count]` nodes):

```javascript
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

document.querySelectorAll('[data-count]').forEach(el => {
  const target = parseFloat(el.getAttribute('data-count'));
  const suffix = el.getAttribute('data-suffix') || '';

  if (reduceMotion || isNaN(target)) {
    return; // leave the static HTML value in place
  }

  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      obs.unobserve(entry.target);

      const duration = 1100;
      let startTime = null;
      el.textContent = '0' + suffix;

      function step(ts) {
        if (!startTime) startTime = ts;
        const p = Math.min((ts - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.5 });

  countObserver.observe(el);
});
```

- [ ] **Step 3: Verify build**

Run: `npm run build`
Expected: 12 files.

- [ ] **Step 4: Verify output**

Run: `rg "data-count" _site/index.html`
Expected: 3 matches with the final values (`10+`, `5`, `100%`) still in the element text.
Run: `rg "data-count" _site/index.js`
Expected: the count-up block is present (passthrough-copied verbatim).

- [ ] **Step 5: Manual check (note for human)**

Scroll the About section into view → stats roll 0 → 10+/5/100% once. With JS disabled the numbers render immediately as 10+/5/100%. With reduced-motion on, no roll — final values shown.

- [ ] **Step 6: Commit**

```bash
git add src/index.js src/index.html
git commit -m "feat(motion): count-up stats (guarded, no-JS + reduced-motion safe)"
```

---

### Task 6: Micro-interactions + testimonials reveal replacement (CSS)

**Files:**
- Modify: `src/css/buttons.css` (smooth `.btn` invert + lift; `.btn-clear` fill-sweep)
- Modify: `src/css/instruments.css` (tile hover-lift)
- Modify: `src/css/pricing.css` (reduced-motion guard for the **existing** lift)
- Modify: `src/css/testimonials.css` (remove the dead `slideIn` reveal — full replacement)
- Modify: `src/css/keyframes.css` (remove the now-unused `slideIn` keyframe)
- Modify: `src/css/README.md` (keyframes list)

**Why "full replacement":** the current testimonials reveal is **dead code** — the articles
in `index.html` are `<article data-slide="…">` with **no `.reveal` class**, so the
`IntersectionObserver` never observes them and `article.reveal.visible { animation: slideIn }`
never fires. `slideIn` is referenced **only** here. This task deletes the dead CSS + keyframe;
Task 7 re-adds a working reveal via the vocabulary (directional, alternating).

- [ ] **Step 1: Buttons — replace `src/css/buttons.css` entirely**

```css
.btn {
  display: inline-block;
  position: relative;
  background: var(--gold);
  color: var(--bg);
  border: 1px solid var(--gold);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  border-radius: var(--radius-sm);
  padding: 0.5rem 1.3rem;
  transition:
    background var(--t-mid) var(--ease),
    color var(--t-mid) var(--ease),
    transform var(--t-mid) var(--ease);
}
.btn:hover {
  background: transparent;
  color: var(--gold);
  transform: translateY(-2px);
}
.btn-clear {
  background: transparent;
  color: var(--cream);
  border-color: var(--cream);
  overflow: hidden;
  z-index: 0;
}
.btn-clear::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  background: var(--cream);
  transform: translateX(-101%);
  transition: transform var(--t-mid) var(--ease);
}
.btn-clear:hover {
  color: var(--bg);
  transform: translateY(-2px);
}
.btn-clear:hover::before {
  transform: translateX(0);
}
@media (prefers-reduced-motion: reduce) {
  .btn:hover,
  .btn-clear:hover { transform: none; }
  .btn-clear::before { transition: none; }
}
```

- [ ] **Step 2: Instruments — add tile lift in `src/css/instruments.css`**

In the `& li { … }` rule (lines 10-14), add a `transition`, then add a hover rule and a reduced-motion guard. The `& li` block becomes:

```css
  & li {
    background-color: var(--bg);
    border-radius: var(--radius-lg);
    padding: 1em;
    transition: transform var(--t-mid) var(--ease);
  }

  & li:hover {
    transform: translateY(-4px);
  }
```

Then append at the end of the file (after the last `@media` block):

```css
@media (prefers-reduced-motion: reduce) {
  section[instruments] li:hover { transform: none; }
}
```

- [ ] **Step 3: Pricing — guard the existing lift in `src/css/pricing.css`**

The lift at lines 24-26 already exists — **do not add another**. Append a reduced-motion guard at the end of the file:

```css
@media (prefers-reduced-motion: reduce) {
  section[pricing] .pricing-grid > div:hover { transform: none; }
}
```

- [ ] **Step 4: Testimonials — remove the dead reveal from `src/css/testimonials.css`**

Delete the two dead rules (lines 19-25):

```css
  article.reveal{
    transform: translateY(0);
  }

  article.reveal.visible {
    animation: slideIn 1.6s ease-out both;
  }
```

Leave the rest of `section[testimonials]` (layout, `nth-child(even)` background, etc.)
unchanged. No reduced-motion guard is needed here — Task 7 gives the articles
`.reveal--left`/`.reveal--right`, which `reveal.css` already guards.

- [ ] **Step 5: Remove the unused `slideIn` keyframe + sync the README**

In `src/css/keyframes.css`, delete the whole `slideIn` block (lines 10-19):

```css
@keyframes slideIn {
  from {
    transform: translateX(60vw);
    translate: 60vw 0;
  }
  to {
    transform: translateX(0);
    translate: 0 0;
  }
}
```

Then in `src/css/README.md` (line 32), change
`(fadeUp, fadeIn, slideIn, shimmer, kenBurns, wordIn)` to
`(fadeUp, fadeIn, shimmer, kenBurns, wordIn)`.

- [ ] **Step 6: Verify build**

Run: `npm run build`
Expected: 12 files.

- [ ] **Step 7: Verify output**

Run: `rg "btn-clear::before|section\[instruments\] li:hover" _site/css/index.css`
Expected: both match.
Run: `rg "slideIn" _site/css/index.css`
Expected: **no matches** — the dead keyframe and rule are gone.
Run: `rg -c "translateY\(-4px\)" _site/css/index.css`
Expected: 2 (pricing — existing, and instruments — new). Confirms no third/duplicate lift.

- [ ] **Step 8: Manual check (note for human)**

Hover buttons (gold inverts + lifts; clear buttons fill cream + lift), instrument tiles (lift), pricing cards (lift, unchanged). Reduced-motion: no transforms/animations. (Testimonials get their working reveal in Task 7.)

- [ ] **Step 9: Commit**

```bash
git add src/css/buttons.css src/css/instruments.css src/css/pricing.css src/css/testimonials.css src/css/keyframes.css src/css/README.md
git commit -m "feat(motion): micro-interactions; remove dead testimonials slideIn"
```

---

### Task 7: Apply the vocabulary across the homepage

**Files:**
- Modify: `src/index.html` (about directional, grid staggers, h2 wipe/blur, testimonials reveal)
- Modify: `src/_includes/pricing.html` (pricing-grid stagger)

- [ ] **Step 1: About section — directional + count-up container**

In `src/index.html`, change the `<company-story>` open tag (line 20) from:

```html
          <company-story>
```

to:

```html
          <company-story class="reveal reveal--left">
```

Remove the now-redundant inner reveals — change lines 21-22 from:

```html
            <h3 class="reveal">Our story</h3>
            <h2 id="about-heading" class="reveal">More than lessons, a musical community</h2>
```

to:

```html
            <h3>Our story</h3>
            <h2 id="about-heading">More than lessons, a musical community</h2>
```

Change the `<company-stats>` open tag (line 27) from:

```html
          <company-stats>
```

to:

```html
          <company-stats class="reveal reveal--right">
```

and remove the inner per-stat reveals — change lines 28-30 from:

```html
            <div class="reveal"><div data-count="10" data-suffix="+">10+</div><div>Years of teaching experience</div></div>
            <div class="reveal reveal-delay-1"><div data-count="5" data-suffix="">5</div><div>Instruments taught</div></div>
            <div class="reveal reveal-delay-2"><div data-count="100" data-suffix="%">100%</div><div>Personalised lessons</div></div>
```

to:

```html
            <div><div data-count="10" data-suffix="+">10+</div><div>Years of teaching experience</div></div>
            <div><div data-count="5" data-suffix="">5</div><div>Instruments taught</div></div>
            <div><div data-count="100" data-suffix="%">100%</div><div>Personalised lessons</div></div>
```

(The columns now slide in as two blocks; count-up still fires off `data-count`.)

- [ ] **Step 2: Instruments — wipe the title, stagger the grid**

In `src/index.html`, change the instruments `<h2>` (line 38) from:

```html
      <h2 id="instruments-heading" class="reveal">What we teach</h2>
```

to:

```html
      <h2 id="instruments-heading" class="reveal reveal--wipe">What we teach</h2>
```

Change the `<ul>` (line 39) from:

```html
      <ul class="instruments-grid" role="list">
```

to:

```html
      <ul class="instruments-grid reveal-stagger" role="list">
```

Simplify the `<li>` delay classes to plain `.reveal` (lines 41-45) so the stagger drives timing:

```html
        <li class="reveal"><span>🎻</span><p>Violin</p><p>From first bow hold to advanced repertoire</p></li>
        <li class="reveal"><span>🎸</span><p>Guitar</p><p>Acoustic, classical and electric styles</p></li>
        <li class="reveal"><span>🎹</span><p>Piano</p><p>Classical, contemporary and jazz — all ages welcome</p></li>
        <li class="reveal"><span>🎤</span><p>Voice</p><p>Technique, performance and songwriting</p></li>
        <li class="reveal"><span>🥁</span><p>Drums</p><p>Rhythm, groove and full kit technique</p></li>
```

- [ ] **Step 3: How-it-works — stagger the steps**

In `src/index.html`, change the inner grid `<div>` (line 54) from:

```html
      <div>
        <div class="reveal"><div>1</div><div>Book</div>
```

so the grid wrapper carries the stagger and the cards are plain `.reveal` (lines 54-58):

```html
      <div class="reveal-stagger">
        <div class="reveal"><div>1</div><div>Book</div><p>Fill in our short contact form and we'll get back to you within 24 hours to schedule your free trial lesson.</p></div>
        <div class="reveal"><div>2</div><div>Meet</div><p>Attend your trial lesson at our Canberra studio. We'll assess your current level and craft a personalised learning plan just for you.</p></div>
        <div class="reveal"><div>3</div><div>Play</div><p>Begin your regular lessons and join the Kreutzer community — recitals, ensembles, and lifelong musicianship await.</p></div>
      </div>
```

- [ ] **Step 4: Contact CTA — blur the title**

In `src/index.html`, change the contact `<h2>` (line 115) from:

```html
      <h2 id="contact-heading" class="reveal">Contact us</h2>
```

to:

```html
      <h2 id="contact-heading" class="reveal reveal--blur">Contact us</h2>
```

- [ ] **Step 5: Pricing — stagger the grid**

In `src/_includes/pricing.html`, change line 5 from:

```html
  <div class="pricing-grid">
```

to:

```html
  <div class="pricing-grid reveal-stagger">
```

and simplify the card delay classes (lines 6, 13, 21):

```html
    <div class="reveal">
```
```html
    <div class="featured reveal">
```
```html
    <div class="reveal">
```

(Keep `.featured` on the second card; only the `reveal-delay-*` classes are dropped.)

- [ ] **Step 6: Testimonials — apply the working (directional, alternating) reveal**

In `src/index.html`, give the three testimonial articles the reveal vocabulary, replacing
the dead `data-slide` attributes. Change lines 69, 81, 93:

```html
        <article data-slide="left">
```
```html
        <article data-slide="right">
```
```html
        <article data-slide="left">
```

to (alternating left / right / left):

```html
        <article class="reveal reveal--left">
```
```html
        <article class="reveal reveal--right">
```
```html
        <article class="reveal reveal--left">
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: 12 files.

- [ ] **Step 8: Verify output**

Run: `rg "reveal--left|reveal--right|reveal--wipe|reveal--blur|reveal-stagger" _site/index.html`
Expected: `--left`, `--right`, `--wipe`, `--blur`, and `reveal-stagger` all present.
Run: `rg -c "data-slide" _site/index.html`
Expected: 0 — the dead attributes are gone.

- [ ] **Step 9: Manual check (note for human)**

Scroll the homepage: About columns slide in from opposite sides; instruments title wipes, tiles cascade; how-it-works steps cascade; **testimonials alternate sliding in from left/right**; pricing cards cascade; contact title resolves from blur. No element double-animates.

- [ ] **Step 10: Commit**

```bash
git add src/index.html src/_includes/pricing.html
git commit -m "feat(motion): apply reveal vocabulary across the homepage (incl. testimonials)"
```

---

### Task 8: Apply the vocabulary to interior pages

**Files:**
- Modify: `src/phoebe.html` (about directional + section reveals)
- Modify: `src/lessons.html` (how-it-works stagger + section reveals)
- Modify: `src/careers.html` (how-it-works stagger)
- Modify: `src/about.html` (base reveals on its text sections)

(`teachers.html` is intentionally left alone — its card-flip transform must not be combined with a reveal variant. `faq.html`, `terms.html`, `contact.html` keep their current base reveals.)

- [ ] **Step 1: Phoebe — directional about + section reveals**

In `src/phoebe.html`, change the `<company-story>` block (lines 15-20) from:

```html
    <company-story>
      <h3 class="reveal">Biography</h3>
      <h2 class="reveal">About Phoebe</h2>
```

to:

```html
    <company-story class="reveal reveal--left">
      <h3>Biography</h3>
      <h2>About Phoebe</h2>
```

Change the `<img>` (line 21) from:

```html
    <img src="assets/phoebe mu.jpg" alt="Phoebe Mu">
```

to:

```html
    <img class="reveal reveal--right" src="assets/phoebe mu.jpg" alt="Phoebe Mu">
```

Add base reveals to the two `section[default]` titles — change lines 26-27 and 36-37:

```html
  <h3>Credentials</h3>
  <h2>Qualifications</h2>
```
→
```html
  <h3 class="reveal">Credentials</h3>
  <h2 class="reveal">Qualifications</h2>
```

and

```html
  <h3>Philosophy</h3>
  <h2>Teaching approach</h2>
```
→
```html
  <h3 class="reveal">Philosophy</h3>
  <h2 class="reveal">Teaching approach</h2>
```

- [ ] **Step 2: Lessons — stagger the journey, reveal the section titles**

In `src/lessons.html`, change the how-it-works inner grid (lines 24-28) from:

```html
  <div>
    <div class="reveal"><div>1</div><div>Beginner</div><p>[Write 1–2 sentences on what beginners focus on — fundamentals, reading music, building confidence.]</p></div>
    <div class="reveal reveal-delay-1"><div>2</div><div>Intermediate</div><p>[Write 1–2 sentences on the intermediate stage — expanding repertoire, technique, and musicality.]</p></div>
    <div class="reveal reveal-delay-2"><div>3</div><div>Advanced / Diploma</div><p>[Write 1–2 sentences on advanced and AMEB/diploma preparation — exams, performance, and independence.]</p></div>
  </div>
```

to:

```html
  <div class="reveal-stagger">
    <div class="reveal"><div>1</div><div>Beginner</div><p>[Write 1–2 sentences on what beginners focus on — fundamentals, reading music, building confidence.]</p></div>
    <div class="reveal"><div>2</div><div>Intermediate</div><p>[Write 1–2 sentences on the intermediate stage — expanding repertoire, technique, and musicality.]</p></div>
    <div class="reveal"><div>3</div><div>Advanced / Diploma</div><p>[Write 1–2 sentences on advanced and AMEB/diploma preparation — exams, performance, and independence.]</p></div>
  </div>
```

Add base reveals to the two `section[default]` titles — change lines 14-15:

```html
  <h3>The experience</h3>
  <h2>What a lesson looks like</h2>
```
→
```html
  <h3 class="reveal">The experience</h3>
  <h2 class="reveal">What a lesson looks like</h2>
```

and lines 33-34:

```html
  <h3>Practicalities</h3>
  <h2>Formats &amp; policies</h2>
```
→
```html
  <h3 class="reveal">Practicalities</h3>
  <h2 class="reveal">Formats &amp; policies</h2>
```

- [ ] **Step 3: Careers — stagger the value cards**

In `src/careers.html`, change the how-it-works inner grid (lines 17-21) from:

```html
  <div>
    <div class="reveal"><div>♪</div><div>Community</div><p>[Write 1–2 sentences on the collaborative, supportive teaching community.]</p></div>
    <div class="reveal reveal-delay-1"><div>↗</div><div>Growth</div><p>[Write 1–2 sentences on professional development and growth opportunities.]</p></div>
    <div class="reveal reveal-delay-2"><div>◷</div><div>Flexibility</div><p>[Write 1–2 sentences on flexible scheduling and studio support.]</p></div>
  </div>
```

to:

```html
  <div class="reveal-stagger">
    <div class="reveal"><div>♪</div><div>Community</div><p>[Write 1–2 sentences on the collaborative, supportive teaching community.]</p></div>
    <div class="reveal"><div>↗</div><div>Growth</div><p>[Write 1–2 sentences on professional development and growth opportunities.]</p></div>
    <div class="reveal"><div>◷</div><div>Flexibility</div><p>[Write 1–2 sentences on flexible scheduling and studio support.]</p></div>
  </div>
```

Add a base reveal to the `section[default]` title — change lines 26-27:

```html
  <h3>Our people</h3>
  <h2>Who we're looking for</h2>
```
→
```html
  <h3 class="reveal">Our people</h3>
  <h2 class="reveal">Who we're looking for</h2>
```

- [ ] **Step 4: About — base reveals on its text sections**

In `src/about.html`, change lines 14-16 from:

```html
        <h3>Our story</h3>
        <h2>Beginnings</h2>
        <p>[Content to be written — see Content Structure Guidance, Slice 5]</p>
```
to:
```html
        <h3 class="reveal">Our story</h3>
        <h2 class="reveal">Beginnings</h2>
        <p class="reveal reveal-delay-1">[Content to be written — see Content Structure Guidance, Slice 5]</p>
```

and lines 19-21 from:

```html
        <h3>Our space</h3>
        <h2>Studio</h2>
        <p>[Content to be written — see Content Structure Guidance, Slice 5]</p>
```
to:
```html
        <h3 class="reveal">Our space</h3>
        <h2 class="reveal">Studio</h2>
        <p class="reveal reveal-delay-1">[Content to be written — see Content Structure Guidance, Slice 5]</p>
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: 12 files.

- [ ] **Step 6: Verify output**

Run: `rg "reveal--left|reveal--right" _site/phoebe.html`
Expected: both present.
Run: `rg "reveal-stagger" _site/lessons.html _site/careers.html`
Expected: present in both.
Run: `rg -c "class=\"reveal\"" _site/about.html`
Expected: ≥4 (the new headings).

- [ ] **Step 7: Manual check (note for human)**

Phoebe: bio text and photo slide in from opposite sides. Lessons/Careers: the three-card rows cascade. About: text sections fade up. Teachers: card still flips on click, unaffected.

- [ ] **Step 8: Commit**

```bash
git add src/phoebe.html src/lessons.html src/careers.html src/about.html
git commit -m "feat(motion): apply reveal vocabulary to interior pages"
```

---

### Task 9: Document the motion system in DESIGN.md + final verification

**Files:**
- Modify: `DESIGN.md` (rewrite the Motion section)

- [ ] **Step 1: Replace the Motion section in `DESIGN.md`**

Replace the entire `## Motion` section (from the `## Motion` heading through to, but not including, the `## Guardrails — NEVER, in this codebase` heading) with:

```markdown
## Motion

Motion is a **small, deliberate vocabulary**, not one blanket fade. It extends the
`IntersectionObserver` + `.reveal` system (visible-by-default, so the site still works with
JavaScript off) with composable gesture-modifier classes.

**Reveal vocabulary** (compose a modifier onto `.reveal`), defined in
[`reveal.css`](src/css/reveal.css):

- `.reveal` — fade + rise (default).
- `.reveal--left` / `.reveal--right` — directional slide (two-column sections; testimonials alternate).
- `.reveal--wipe` — clip-path mask reveal. **At most one `h2` per page.**
- `.reveal--blur` — blur-to-sharp (intro/about contexts).
- `.reveal-stagger` (on a parent) — cascades its direct `.reveal` children.

**Hero (homepage only, `section[intro][home]`):** the `h1` rises word-by-word out of a
blur (`wordIn`), over a slow CSS **Ken Burns** drift on the photo (`kenBurns`, a `::before`
layer). The signature moment — used nowhere else.

**Numbers & accents:** stats count up via a guarded block in
[`index.js`](src/index.js) (final value lives in the HTML for no-JS; snaps to final under
reduced-motion). The gold **underline-draw** is a single shared utility,
`.draw-underline` (defined in [`sections.css`](src/css/sections.css)), reused by the nav and
by headings — **never copy it; reuse the class.** Nav's active-link underline stays in
[`nav.css`](src/css/nav.css).

**Micro-interactions** (pure CSS `:hover`): button invert + lift and clear-button
fill-sweep ([`buttons.css`](src/css/buttons.css)), tile and card lift
([`instruments.css`](src/css/instruments.css); pricing already lifts).

**Two rules are load-bearing — preserve them:**
- **No-JS:** content visible and static without JavaScript; the count-up shows the HTML's
  final number.
- **`prefers-reduced-motion: reduce`:** every animated component carries its own
  co-located reduced-motion guard (cascade-safe — it must declare *after* the animation it
  cancels). `reveal.css` guards the `.reveal*` selectors; each component guards its own
  hover/keyframe motion.

New keyframes live in [`keyframes.css`](src/css/keyframes.css); motion easings/durations in
[`tokens.css`](src/css/tokens.css). No timing literals in components.
```

- [ ] **Step 2: Full build + page-count check**

Run: `npm run build`
Expected: completes; "Wrote 12 files".

- [ ] **Step 3: Full grep sweep of the bundle**

Run: `rg -c "reveal--|reveal-stagger|kenBurns|wordIn|draw-underline|prefers-reduced-motion" _site/css/index.css`
Expected: non-zero for each (one bundled stylesheet contains the whole system).
Run: `rg "slideIn" _site/css/index.css`
Expected: no matches (the dead keyframe was removed in Task 6).

- [ ] **Step 4: Final manual QA pass (note for human)**

Load the built site and confirm, at 1024 / 768 / ~400px:
- Homepage hero word-rise + Ken Burns; varied section reveals; stats count up; hovers respond.
- Interior pages: directional (phoebe), staggers (lessons/careers), base reveals (about); teachers card flip intact.
- **JS disabled:** all content visible/static; stats show 10+/5/100%; no Ken Burns.
- **OS reduced-motion on:** instant reveals, no drift, no count, no hover transforms.
- No element double-animates; no duplicated nav underline or pricing lift.

- [ ] **Step 5: Commit**

```bash
git add DESIGN.md
git commit -m "docs(motion): document the motion vocabulary in DESIGN.md"
```

---

## Self-Review (against the spec)

**Spec coverage:**
- Curated mix / CSS-only / no-JS-safe → Tasks 2-8 are CSS + one guarded JS block (Task 5). ✓
- Reveal vocabulary (`--left/--right/--wipe/--blur`, stagger) → Task 2, applied in 7-8. ✓
- Hero word + blur + Ken Burns (CSS-only; parallax explicitly excluded) → Task 4. ✓
- Count-up (no-JS + reduced-motion safe) → Task 5. ✓
- Underline-draw **not duplicated**; nav canonical, factored to one shared definition → Task 3. ✓
- Micro-interactions; pricing lift **not duplicated**. Testimonials reveal was **dead code** (articles lacked `.reveal`); **fully replaced** — dead CSS + `slideIn` keyframe removed (Task 6), working directional reveal added (Task 7). ✓
- `prefers-reduced-motion` everywhere; co-located + cascade-safe → Tasks 2,3,4,6. ✓
- Tokens/keyframes centralized → Task 1. ✓
- DESIGN.md updated → Task 9. ✓
- Restraint rule (one wipe/page; blur for intro/about) → Task 7 (wipe on instruments, blur on contact). ✓

**Placeholder scan:** the bracketed `[Write …]` strings in Tasks 7-8 are **intentional existing page content** (manual-copy prompts), not plan placeholders — they are reproduced verbatim so edits match the real files. No TBD/TODO in the plan itself. ✓

**Consistency:** class names (`reveal--left/right/wipe/blur`, `reveal-stagger`, `draw-underline`, `word`, `home`), keyframes (`kenBurns`, `wordIn`), tokens (`--ease-out`, `--t-reveal`, `--t-wipe`, `--t-kenburns`), and `data-count`/`data-suffix` are used identically across every task. ✓
