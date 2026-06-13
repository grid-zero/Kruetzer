# CSS Architecture Reorganization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize 7 CSS files (1265 lines) into 16 component-based files with co-located responsive rules. Split the 740-line `page.css` monolith and the multi-concern `root.css` into focused, well-bounded files.

**Architecture:** Component-based with pragmatic grouping. Each file has one clear owner. Responsive breakpoints live in the same file as the component they modify. `index.css` serves as the import manifest with load-bearing order: tokens → keyframes → reset → reveal → shared components → page sections.

**Tech Stack:** CSS (native nesting), Eleventy 3 for CSS import bundling. No build-tool changes.

---

## File Structure

| File | Lines | Responsibility |
|------|-------|----------------|
| `tokens.css` | ~55 | `:root { }` custom properties |
| `keyframes.css` | ~25 | `@keyframes fadeUp`, `fadeIn`, `slideIn`, `shimmer` |
| `reset.css` | ~20 | Box-sizing reset, `html`, `body`, base element resets |
| `reveal.css` | ~20 | `.reveal` / `.js .reveal` progressive enhancement |
| `buttons.css` | ~25 | `.btn`, `.btn-clear` variants |
| `nav.css` | ~185 | Header nav + burger + sidebar + overlay + ALL nav responsive queries |
| `footer.css` | ~60 | Unchanged |
| `loader.css` | ~95 | Piano loading animation (minus shimmer keyframe) |
| `contact-form.css` | ~72 | Unchanged content, renamed from `contact.css` |
| `sections.css` | ~170 | Section defaults + intro + about + how-it-works + faq + contact wrapper + 1024px/768px queries |
| `instruments.css` | ~40 | Instrument grid + 480px query |
| `testimonials.css` | ~95 | Quote/reference cards + 768px query |
| `pricing.css` | ~95 | Pricing grid + featured card + 768px query |
| `teachers.css` | ~90 | Flip cards + overlays + backface visibility |
| `terms.css` | ~50 | `.policy-*` lists + `table`/`th`/`td` + `.disclaimer` + `.tagline` |
| `index.css` | ~16 | `@import` manifest |

---

## Task 1: Extract tokens.css from root.css

**Files:**
- Create: `src/css/tokens.css`
- Read: `src/css/root.css:1-55`

- [ ] **Step 1: Create tokens.css**

The `:root { }` block from root.css lines 2-55 inclusive. Copy exactly as-is — no edits.

```css
:root {
  --font-display:  'DM Serif Display', serif;
  --font-script:   'Tangerine', cursive;
  --font-title:    'Cinzel', serif;
  --font-body:     'Fauna One', serif;

  --text-xs:     clamp(0.75rem,  1vw,    0.875rem);
  --text-sm:     clamp(0.9rem,   1.2vw,  1rem);
  --text-base:   clamp(1rem,     1.4vw,  1.125rem);
  --text-md:     clamp(1.1rem,   1.6vw,  1.375rem);
  --text-lg:     clamp(1.4rem,   2.5vw,  2rem);
  --text-xl:     clamp(2rem,     4vw,    3.5rem);
  --text-2xl:    clamp(2.8rem,   6vw,    5.5rem);
  --text-script: clamp(2.5rem,   5vw,    4.5rem);

  --weight-regular: 400;
  --weight-medium:  500;
  --weight-bold:    700;
  
  --bg-blue:   #33616d;
  
  --bg:          #070707;
  --bg-card:     #323236;
  --bg-overlay:  20, 20, 24;

  --text-blue: #7392c5;
  --cream-rgb:   242, 232, 185;
  --cream:       rgb(var(--cream-rgb));
  --cream-dim:   rgba(var(--cream-rgb), 0.55);
  --cream-faint: rgba(var(--cream-rgb), 0.12);
  --border-faint: rgba(var(--cream-rgb), 0.07);
  --gold:        #c9a84c;
  --gold-light:  #e2c47a;

  --space-xs:  0.5rem;
  --space-sm:  1rem;
  --space-md:  2rem;
  --space-lg:  4rem;
  --space-xl:  7rem;

  --page-max: 1280px;
  --page-pad: clamp(1.25rem, 5vw, 5rem);

  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 20px;

  --ease:   cubic-bezier(0.25, 0.46, 0.45, 0.94);
  --t-mid:  0.35s;
  --t-slow: 0.65s;


  --sidebar-width: 240px;
  --ease-emphatic: cubic-bezier(0.77, 0, 0.175, 1);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/tokens.css
git commit -m "refactor: extract tokens.css from root.css"
```

---

## Task 2: Extract keyframes.css from root.css + loader.css

**Files:**
- Create: `src/css/keyframes.css`
- Modify: `src/css/loader.css:97-103` (remove shimmer keyframe)
- Read: `src/css/root.css:57-75`

- [ ] **Step 1: Create keyframes.css**

All four keyframes, from root.css plus shimmer from loader.css.

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes slideIn {
  from {
    translate: 60vw 0;
  }
  to {
    translate: 0 0;
  }
}

@keyframes shimmer {
  0%   { opacity: 0.85; }
  50%  { opacity: 1; }
  100% { opacity: 0.85; }
}
```

- [ ] **Step 2: Remove shimmer keyframe from loader.css**

Find and delete these exact lines from `loader.css` (lines 97-103):
```css
  @keyframes shimmer {
    0%   { opacity: 0.85; }
    50%  { opacity: 1; }
    100% { opacity: 0.85; }
  }
  .piano-fill-inner {
    animation: shimmer 2s ease-in-out infinite;
  }
```

Replace with:
```css
  .piano-fill-inner {
    animation: shimmer 2s ease-in-out infinite;
  }
```

- [ ] **Step 3: Clean up blank lines in loader.css**

After removing the `@keyframes shimmer` block, check `loader.css` for triple+ consecutive blank lines (lines 95-102 area). Remove extras — keep one blank line between logical blocks.

- [ ] **Step 4: Commit**

```bash
git add src/css/keyframes.css src/css/loader.css
git commit -m "refactor: extract keyframes.css, consolidate all @keyframes"
```

---

## Task 3: Extract reset.css from root.css

**Files:**
- Create: `src/css/reset.css`

- [ ] **Step 1: Create reset.css**

The reset and base element styles from root.css lines 77-119.

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
```

- [ ] **Step 2: Commit**

```bash
git add src/css/reset.css
git commit -m "refactor: extract reset.css from root.css"
```

---

## Task 4: Extract reveal.css from root.css

**Files:**
- Create: `src/css/reveal.css`

- [ ] **Step 1: Create reveal.css**

The progressive enhancement reveal system from root.css lines 121-130.

```css
.reveal {
  opacity: 1;
  transform: none;
}
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

- [ ] **Step 2: Commit**

```bash
git add src/css/reveal.css
git commit -m "refactor: extract reveal.css from root.css"
```

---

## Task 5: Switch index.css and delete root.css

**Files:**
- Modify: `src/css/index.css`
- Delete: `src/css/root.css`

- [ ] **Step 1: Update index.css**

Replace the first line `@import "root.css";` with four new imports. The full file becomes:

```css
@import "tokens.css";
@import "keyframes.css";
@import "reset.css";
@import "reveal.css";
@import "loader.css";
@import "contact.css";
@import "nav.css";
@import "footer.css";
@import "page.css";
```

- [ ] **Step 2: Delete root.css**

```bash
rm src/css/root.css
```

- [ ] **Step 3: Build verification**

```bash
npm run build
```

Expected: build completes without errors. 11 pages written to `_site/`.

- [ ] **Step 4: Quick visual check**

Run: `npm run dev`, open `http://localhost:8080`
Check: page loads, colors correct, nav works, loader shows on reload with JS enabled — no visual regressions.

- [ ] **Step 5: Commit**

```bash
git add src/css/index.css
git rm src/css/root.css
git commit -m "refactor: switch index.css to new root-split files, delete root.css"
```

---

## Task 6: Extract buttons.css from page.css

**Files:**
- Create: `src/css/buttons.css`
- Read: `src/css/page.css:1-29`

- [ ] **Step 1: Create buttons.css**

The `.btn` and `.btn-clear` rules from page.css lines 3-29.

```css
.btn {
  display: inline-block;
  background: var(--gold);
  color: var(--bg);
  border: 1px solid var(--gold);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.04em;
  border-radius: var(--radius-sm);
  padding: 0.5rem 1.3rem;
}
.btn:hover {
  background: transparent;
  color: var(--gold);
}
.btn-clear {
  background: transparent;
  color: var(--cream);
  border-color: var(--cream);
}
.btn-clear:hover {
  background: var(--cream-faint);
  color: var(--cream);
  box-shadow: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/buttons.css
git commit -m "refactor: extract buttons.css from page.css"
```

---

## Task 7: Extract terms.css from page.css

**Files:**
- Create: `src/css/terms.css`
- Read: `src/css/page.css:555-636`

- [ ] **Step 1: Create terms.css**

The `.tagline`, `.policy-*`, `.table-container`, `table`/`th`/`td`, and `.disclaimer` rules. Also include the orphaned `.tagline` block from lines 555-564.

```css
.tagline {
  font-family: var(--font-body);
  font-weight: var(--weight-bold);
  color: var(--gold-light) !important;
  font-size: var(--text-sm) !important;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: var(--space-md);
}

.policy-content {
  max-width: 900px;
  margin: 0 auto;
  padding: var(--space-lg) var(--page-pad);
}

.policy-list {
  margin-top: var(--space-md);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.policy-list li {
  font-size: var(--text-base);
  color: var(--cream);
  padding-left: 1.5rem;
  position: relative;
}

.policy-list li::before {
  content: "•";
  color: var(--gold);
  position: absolute;
  left: 0;
  font-weight: bold;
}

.table-container {
  overflow-x: auto;
  margin: var(--space-md) 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--cream-faint);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-card);
  font-family: var(--font-body);
}

th, td {
  padding: 1rem;
  text-align: center;
  border: 1px solid rgba(var(--cream-rgb), 0.05);
}

th {
  background: var(--bg-blue);
  color: var(--gold);
  font-family: var(--font-display);
  font-weight: var(--weight-regular);
}

tr:nth-child(even) {
  background: rgba(255, 255, 255, 0.02);
}

.disclaimer {
  font-size: var(--text-xs);
  color: var(--cream-dim);
  font-style: italic;
  margin-top: var(--space-sm);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/terms.css
git commit -m "refactor: extract terms.css from page.css"
```

---

## Task 8: Extract instruments.css from page.css

**Files:**
- Create: `src/css/instruments.css`
- Read: `src/css/page.css:170-196, 738-740`

- [ ] **Step 1: Create instruments.css**

The `section[instruments]` block and its 480px responsive query (currently at page.css lines 170-196 and 738-740 — co-located here per the design).

```css
section[instruments] {
  background: var(--bg-blue);

  & ul {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: var(--space-sm);
  }

  & li {
    background-color: var(--bg);
    border-radius: var(--radius-lg);
    padding: 1em;
  }

  & li p:first-of-type {
    font-family: var(--font-display);
    font-size: var(--text-md);
  }

  & li p:last-child {
    font-size: var(--text-base);
    margin-top: 0.35rem;
    line-height: 1.5;
  }
}

@media (max-width: 480px) {
  section[instruments] ul {
    grid-template-columns: 1fr 1fr;
  }
}
```

Note: There is also a 768px instruments rule at page.css line 703-708. This duplicates part of the auto-fit behavior — verify whether the 768px rule is a genuine override or redundant with the base `repeat(auto-fit, minmax(160px, 1fr))`. If the 768px query only changes to `minmax(200px, 1fr)`, include it here as well:

```css
@media (max-width: 768px) {
  section[instruments] ul {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/instruments.css
git commit -m "refactor: extract instruments.css from page.css"
```

---

## Task 9: Extract testimonials.css from page.css

**Files:**
- Create: `src/css/testimonials.css`
- Read: `src/css/page.css:238-315, 709-722`

- [ ] **Step 1: Create testimonials.css**

The `section[testimonials]` block and its 768px responsive query (co-located).

```css
section[testimonials] {
  .testimonials-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
    margin: 0 auto;
  }

  & article {
    display: grid;
    grid-template-columns: 1fr auto;
    align-items: center;
    gap: var(--space-xl);
    background: var(--bg-card);
    padding: var(--space-lg) var(--space-xl);
    border-radius: var(--radius-lg);
  }

  article.reveal{
    transform: translateY(0);
  }

  article.reveal.visible {
    animation: slideIn 1.6s ease-out both;
  }

  & article:nth-child(even) {
    background: var(--bg-blue);
  }

  & article > testimonial-quote > div {
    font-family: var(--font-display);
    font-size: 5rem;
    line-height: 0.5;
    color: var(--gold);
    opacity: 0.25;
    margin-bottom: var(--space-sm);
    user-select: none;
  }

  & article > testimonial-quote > p {
    font-family: var(--font-body);
    font-size: var(--text-md);
    line-height: 1.6;
  }

  &  article > testimonial-reference {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-xs);
    min-width: 120px;
    padding-left: var(--space-lg);
    border-left: 1px solid rgba(var(--cream-rgb), 0.1);
    background: none;
  }

  & article > testimonial-reference > div {
    color: var(--gold);
    font-size: var(--text-sm);
    letter-spacing: 0.15em;
  }

  & article > testimonial-reference > cite {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-style: normal;
  }

  & article > testimonial-reference > span {
    font-size: var(--text-xs);
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
}

@media (max-width: 768px) {
  section[testimonials] article {
    grid-template-columns: 1fr;
    padding: var(--space-lg);
    gap: var(--space-md);
  }
  section[testimonials] article > testimonial-reference {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
    border-left: none;
    border-top: 1px solid rgba(var(--cream-rgb), 0.1);
    padding-left: 0;
    padding-top: var(--space-md);
    align-items: center;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/testimonials.css
git commit -m "refactor: extract testimonials.css from page.css"
```

---

## Task 10: Extract pricing.css from page.css

**Files:**
- Create: `src/css/pricing.css`
- Read: `src/css/page.css:317-410, 724-731`

- [ ] **Step 1: Create pricing.css**

The `section[pricing]` block and its 768px responsive query.

```css
section[pricing] {
  background-color: var(--bg-blue);
  h2 {
    color: var(--cream);
  }
  .pricing-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-md);
    align-items: start;
  }

  .pricing-grid > div {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: var(--bg);
    padding: var(--space-lg) var(--space-md);
    border-radius: var(--radius-md);
    border: 1px solid var(--cream-faint);
    gap: var(--space-md);
  }

  .pricing-grid > div:hover {
    border-color: var(--gold);
    transform: translateY(-4px);
    transition: all 0.3s ease;
  }

  .pricing-grid > div.featured {
    background: var(--bg-card);
    border-color: var(--gold);
    position: relative;
  }

  .pricing-grid > div > span {
    font-family: var(--font-display);
    font-size: var(--text-xs);
    color: var(--gold-light);
    text-transform: uppercase;
    letter-spacing: 0.15em;
  }

    .pricing-grid h3 {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--cream);
  }

  .pricing-grid strong {
    font-size: 3rem;
    font-family: var(--font-display);
    color: var(--cream);
    line-height: 1;
  }

  .pricing-grid strong span {
    font-size: var(--text-sm);
    color: var(--cream-dim);
  }

  .pricing-grid ul {
    display: flex;
    flex-direction: column;
    gap: var(--space-xs);
    width: 100%;
  }

  .pricing-grid li {
    font-size: var(--text-xs);
    color: var(--cream-dim);
    padding: var(--space-xs) 0;
    border-bottom: 1px solid var(--cream-faint);
  }

 .pricing-grid li::before {
    content: "✓ ";
    color: var(--gold);
    font-weight: var(--weight-bold);
  }
}

@media (max-width: 768px) {
  section[pricing] .pricing-grid {
    grid-template-columns: 1fr;
    max-width: 400px;
    margin: 0 auto;
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/pricing.css
git commit -m "refactor: extract pricing.css from page.css"
```

---

## Task 11: Extract teachers.css from page.css

**Files:**
- Create: `src/css/teachers.css`
- Read: `src/css/page.css:468-555`

- [ ] **Step 1: Create teachers.css**

The `section[teachers]` block with flip card logic.

```css
section[teachers] {
  justify-content: center;
  display: grid;
  gap: var(--space-lg);
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));

  .teacher-card-container {
    background-color: transparent;
    width: 100%;
    max-width: 450px;
    height: 550px;
    perspective: 1000px;
    cursor: pointer;
    margin: 0 auto;
  }

  .teacher-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
    transform-style: preserve-3d;
  }

  .teacher-card-container.is-flipped .teacher-card-inner {
    transform: rotateY(180deg);
  }

  .teacher-card-front, .teacher-card-back {
    position: absolute;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: var(--radius-md);
    overflow: hidden;
    border: 1px solid var(--cream-faint);
  }

  .teacher-card-front {
    background: var(--bg-card);
  }

  .teacher-front-overlay {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: var(--space-md);
    background: linear-gradient(to top, rgba(var(--bg-overlay), 0.9), transparent);
    text-align: center;
  }

  .teacher-front-overlay span {
    font-size: var(--text-xs);
    color: var(--gold);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .teacher-card-back {
    background: var(--bg-blue);
    color: var(--cream);
    transform: rotateY(180deg);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--space-md);
    text-align: center;
  }

  .teacher-card-back p {
    color: inherit;
  }

  .teacher-card-back .teacher-info h3 {
    margin-top: var(--space-sm);
  }

  .teacher-card-back .btn {
    margin-top: var(--space-sm);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/teachers.css
git commit -m "refactor: extract teachers.css from page.css"
```

---

## Task 12: Extract sections.css from page.css

**Files:**
- Create: `src/css/sections.css`
- Read: `src/css/page.css:30-198, 412-467, 638-668, 692-702`

- [ ] **Step 1: Create sections.css**

The shared section defaults, intro, about, how-it-works, FAQ, contact wrapper, and responsive queries for sections (1024px how-it-works, 768px about).

```css
section {
  padding: var(--space-xl) var(--page-pad);
}

section > div {
  max-width: var(--page-max);
  margin: 0 auto;
}

section p {
  color: var(--cream);
  font-size: var(--text-md);
}

section h2 {
  font-family: var(--font-title);
  font-size: var(--text-xl);
  font-weight: var(--weight-regular);
  color: var(--text-blue);
  line-height: 1.15;
  margin-bottom: var(--space-lg);
}

section h3 {
  font-family: var(--font-title);
  font-size: var(--text-xs);
  font-weight: var(--weight-bold);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--gold);
  margin-bottom: var(--space-sm);
}

section[default]{
  border-top: 1px solid var(--border-faint);
}

/* INTRO SECTION */
section[intro] {
  background: var(--bg);
  background-image: url('../assets/IMG_5717.jpg');
  background-position: 0% 70%;
  background-size: cover;
  position: relative;
  min-height: 92vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  > div >div {
    display: flex;
    gap: var(--space-lg);
    justify-content: center;
  }

  & h3 {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--gold);
    margin-bottom: var(--space-md);
    animation: fadeUp 0.7s 0.3s var(--ease) both;
  }

  & h1 {
    font-family: var(--font-display);
    font-size: var(--text-2xl);
    font-weight: var(--weight-regular);
    color: var(--cream);
    line-height: 1.1;
    letter-spacing: -0.01em;
    margin-bottom: var(--space-md);
    animation: fadeUp 0.7s 0.45s var(--ease) both;
  }
  & h1 em {
    font-style: italic;
    color: var(--gold-light);
  }
  & p {
    max-width: 560px;
    margin: 0 auto var(--space-lg);
    animation: fadeUp 0.7s 0.6s var(--ease) both;
  }

  & .btn {
    animation: fadeUp 0.7s 0.75s var(--ease) both;
  }
}

/* ABOUT SECTION */
section[about] {
  border-top: 1px solid var(--border-faint);

  > div {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
    align-items: center;
  }

  & p + p {
    margin-top: var(--space-md);
  }

  & img {
    width: 100%;
    height: auto;
    border-radius: var(--radius-md);
    object-fit: cover;
  }

  > div > div {
    display: flex;
    flex-direction: row;
    gap: var(--space-lg);
  }

  & company-stats{
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
  }

  & company-stats > div {
    border-left: 2px solid var(--gold);
    padding-left: var(--space-md);
  }

  & company-stats > div > div:has(+div){
    font-family: var(--font-display);
    font-size: var(--text-xl);
    color: var(--cream);
    line-height: 1;
  }
}

/* HOW IT WORKS SECTION */
section[how-it-works] {
  background: var(--bg);
  border-bottom: 1px solid var(--border-faint);
  max-width: 100%;

  > div > div {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-lg);
  }

  > div > div > div {
    text-align: center;
  }

  > div > div > div > :first-child {
    width: 4.5rem;
    height: 4.5rem;
    margin: 0 auto var(--space-md);
    border-radius: 50%;
    border: 1px solid var(--gold);
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--gold);
    background: var(--bg);
  }

  > div > div > div >  :nth-child(2) {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    color: var(--cream);
    margin-bottom: var(--space-xs);
  }
}

/* FAQ SECTION */
section[faq] {
  padding-top: var(--space-lg);
  padding-bottom: var(--space-xl);

  .faq-container {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
  }
  .faq-item {
    border-bottom: 1px solid var(--cream-faint);
    padding-bottom: var(--space-md);
  }

  .faq-item h2 {
    font-family: var(--font-display);
    font-size: var(--text-md);
    color: var(--gold);
    margin-bottom: var(--space-sm);
    text-align: left;
  }

  .faq-item p {
    color: var(--cream);
    line-height: 1.8;
    font-size: var(--text-base);
  }

  .faq-item:last-child {
    border-bottom: none;
  }
}

/* CONTACT CTA SECTION */
section[contact] {
  background: var(--bg-blue);
  border-top: 1px solid var(--border-faint);

  text-align: center;

  & h2 {
    color: var(--cream);
    margin-bottom: var(--space-md);
  }

  & p {
    max-width: 480px;
    margin: 0 auto var(--space-lg);
    color: var(--cream);
    font-size: var(--text-md);
    line-height: 1.6;
  }
}

/* RESPONSIVE — sections */
@media (max-width: 1024px) {
  section[how-it-works] > div{
    display: flex;
    flex-direction: column;
    align-items: center;
    > div {
      grid-template-columns: 1fr;
      gap: var(--space-lg);
      max-width: 500px;
    }
  }
}

@media (max-width: 768px) {
  section[about] {
    > div {
      display: flex;
      flex-direction: column;
      align-items: start;
    }
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/sections.css
git commit -m "refactor: extract sections.css from page.css"
```

---

## Task 13: Move nav responsive queries from page.css to nav.css

**Files:**
- Modify: `src/css/nav.css` (append 3 media queries)
- Read: `src/css/page.css:637-743`

- [ ] **Step 1: Append nav responsive queries to nav.css**

Add these three media queries at the end of `nav.css`:

```css
@media (max-width: 1024px) {
  header > nav nav-logo-main {
    display: none;
  }
  header > nav {
    grid-template-columns: auto 1fr;
  }
}

@media (max-width: 768px) {
  header > nav nav-logo-main {
    display: block;
  }
  header > nav > div > a > img[mobile]{
    display: block;
  }
  header > nav > div   > a > img[desktop]{
    display: none;
  }
  header > nav {
    grid-template-columns:  1fr  auto 1fr;

    > div > ul, > a.btn {
      display: none;
    }

    > div > a > img {
      position: absolute;
      top: 50%;
      transform: translate(-50%, -20%);
      height: 10rem;
      top: var(--space-sm);
      margin-left: var(--space-md);
    }
  }

  header > nav > button {
    display: flex;
  }
}

@media (min-width: 769px) {
  nav > aside, .overlay { display: none !important; }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/css/nav.css
git commit -m "refactor: move nav responsive queries from page.css to nav.css"
```

---

## Task 14: Rename contact.css → contact-form.css and update index.css

**Files:**
- Rename: `src/css/contact.css` → `src/css/contact-form.css`
- Modify: `src/css/index.css` (update import)

- [ ] **Step 1: Rename the file**

```bash
mv src/css/contact.css src/css/contact-form.css
```

- [ ] **Step 2: Update index.css import**

Change `@import "contact.css";` to `@import "contact-form.css";` in index.css.

- [ ] **Step 3: Commit**

```bash
git add src/css/contact-form.css src/css/index.css
git rm src/css/contact.css
git commit -m "refactor: rename contact.css to contact-form.css"
```

---

## Task 15: Switch index.css to new page split and delete page.css

**Files:**
- Modify: `src/css/index.css`
- Delete: `src/css/page.css`

- [ ] **Step 1: Update index.css**

Replace `@import "page.css";` with the new component imports:

```css
@import "tokens.css";
@import "keyframes.css";
@import "reset.css";
@import "reveal.css";
@import "buttons.css";
@import "nav.css";
@import "footer.css";
@import "loader.css";
@import "contact-form.css";
@import "sections.css";
@import "instruments.css";
@import "testimonials.css";
@import "pricing.css";
@import "teachers.css";
@import "terms.css";
```

- [ ] **Step 2: Delete page.css**

```bash
rm src/css/page.css
```

- [ ] **Step 3: Build verification**

```bash
npm run build
```

Expected: build completes without errors. 11 pages written to `_site/`.

- [ ] **Step 4: Clean up leftover blank lines in nav.css**

Check `nav.css` for triple+ blank lines from the appended responsive queries (ensure clean spacing between the original content and the new queries). Remove extras — keep one blank line between logical blocks. No logic changes — whitespace only.

- [ ] **Step 5: Commit**

```bash
git add src/css/index.css src/css/nav.css src/css/loader.css
git rm src/css/page.css
git commit -m "refactor: switch index.css to component-based structure, delete page.css"
```

---

## Task 16: Final verification

- [ ] **Step 1: Build**

```bash
npm run build
```

Expected: clean build, no errors, no warnings.

- [ ] **Step 2: CSS file count**

```bash
ls src/css/*.css | wc -l
```

Expected: `16`.

- [ ] **Step 3: Visual regression — desktop (1024px+)**

Run `npm run dev`, open `http://localhost:8080`. Check:
- Hero section: background image, text animations, gold/cream colors
- Nav: logo visible, sticky, links have hover underline
- About: 2-column layout, company-stats sidebar, image on left
- Instruments: grid of instrument cards with blue background
- Testimonials: alternating bg-blue/bg-card, quote marks, citations
- Pricing: 3-column grid, featured card highlighted
- Teachers: flip cards, front/back shown on click
- FAQ: gold questions, cream answers, bottom border separators
- Contact CTA: blue background, centered text
- Footer: near-black bg, gold headings, 4-column grid

- [ ] **Step 4: Visual regression — tablet (768px)**

Resize to 768px. Check:
- Nav: burger button appears, mobile logo visible, desktop links hidden
- About: stacks to single column
- Testimonials: single-column articles, reference above border
- Pricing: single column, max-width 400px

- [ ] **Step 5: Visual regression — mobile (480px)**

Resize to 480px. Check:
- Instruments: 2-column grid

- [ ] **Step 6: No-JS check**

Disable JavaScript in browser dev tools. Reload. Verify:
- Loader does not appear (`.js .loader-wrap { display: flex; }` only applies with JS)
- All `.reveal` elements visible (opacity: 1 by default)
- Site is fully navigable

- [ ] **Step 7: Final commit (if any whitespace/cleanup)**

```bash
git status
```

If any modified files from whitespace cleanup, commit them:

```bash
git add -A
git commit -m "chore: final whitespace cleanup after CSS reorganization"
```

---

## Task Completion Checklist

- [ ] `npm run build` passes — zero errors
- [ ] 16 CSS files in `src/css/`
- [ ] No `root.css` or `page.css` remain
- [ ] All responsive breakpoints co-located with their components
- [ ] Desktop, tablet, mobile — no visual regressions
- [ ] No-JS path intact
- [ ] All imports in `index.css` in correct load-bearing order
