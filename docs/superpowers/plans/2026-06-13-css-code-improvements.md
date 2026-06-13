# CSS Code Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clean up the site's CSS — remove dead code, unify color tokens behind base RGB triplets, rename a misleading variable, and fix three responsive bugs — with no visual redesign.

**Architecture:** CSS-only edits across `src/css/*.css`. No HTML/markup changes. Verification is per-task: `npm run build` (Eleventy) must succeed and targeted `grep` checks must return the expected match counts. The only intended visual changes are the responsive fixes in Task 5.

**Tech Stack:** Eleventy 3 (`@11ty/eleventy`), plain CSS with custom properties. Build: `npm run build`. Dev server: `npm run dev` (serves at `http://localhost:8080`).

**Verification note:** CSS has no unit-test harness here. Each task's "test" is the build succeeding plus grep assertions. The responsive fixes (Task 5) additionally require manual browser checks at breakpoints — these cannot be automated and are called out explicitly.

**Task ordering matters:** Task 1 (dead code) runs first because it deletes `--border-glow-cream`, which holds cream literals. Removing it first lets Task 2's `grep "rgba(242"` assertion come back clean.

---

### Task 1: Remove dead code

**Files:**
- Modify: `src/css/root.css`
- Modify: `src/css/nav.css`
- Modify: `src/css/page.css`

- [ ] **Step 1: Delete unused custom properties from `root.css`**

In the `:root` block, delete these lines (each verified 0 references):

```css
  --bg-cream:    #d6d3c4;
```
```css
  --dark-red:    #d75466;
```
```css
  --t-fast: 0.18s;
```
```css
  --shadow-md: 0 4px 16px rgba(0,0,0,0.5),
               0 8px 24px rgba(0,0,0,0.35);
  --shadow-lg: 0 20px 60px rgba(0,0,0,0.55);
```
```css
  --border-glow-cream: 0 0 0 1px rgba(242,232,185,0.2),
                       0 0 12px rgba(242,232,185,0.08);
  --glow-gold: 0 0 30px rgba(201,168,76,0.25);
```

- [ ] **Step 2: Delete unused keyframes from `root.css`**

Delete the entire `@keyframes pulse-glow` block:

```css
@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); }
  50%       { box-shadow: 0 0 18px 4px rgba(201,168,76,0.35); }
}
```

Delete the entire `@keyframes slideRight` block:

```css
@keyframes slideRight {
  from { transform: scaleX(0); }
  to   { transform: scaleX(1); }
}
```

- [ ] **Step 3: Remove commented-out code from `root.css`**

Delete this commented line (just below `--bg: #070707;`):

```css
  /*--bg:          #141414;*/
```

- [ ] **Step 4: Remove commented-out code and stale marker from `nav.css`**

In `header > nav > div > ul`, delete the commented line:

```css
  /*margin-left: var(--space-lg);*/
```

In the `nav-logo-main` rule, delete the commented block so the rule starts directly with `font-family`:

```css
nav-logo-main {
  /*position: absolute;
  left: 50%;
  transform: translateX(-50%);*/
  font-family: var(--font-script);
```

becomes:

```css
nav-logo-main {
  font-family: var(--font-script);
```

- [ ] **Step 5: Remove commented-out code and stale TODO from `page.css`**

In `section[about]`, change the `company-stats` rule to drop the stale marker:

```css
  & company-stats{ /* TODOL improve styling */
```

becomes:

```css
  & company-stats{
```

In `.teacher-card-back`, delete the commented `radial-gradient` block so the rule reads:

```css
  .teacher-card-back {
    background: var(--bg-blue);
```

In `.teacher-card-back .teacher-info h3`, delete the trailing comment:

```css
  .teacher-card-back .teacher-info h3 {
    margin-top: var(--space-sm);
    /*color: var(--gold-light);*/
  }
```

becomes:

```css
  .teacher-card-back .teacher-info h3 {
    margin-top: var(--space-sm);
  }
```

- [ ] **Step 6: Run the build to verify nothing broke**

Run: `npm run build`
Expected: completes without error, writes to `_site/`.

- [ ] **Step 7: Verify removed tokens have zero references**

Run: `grep -rn -- "--shadow-md\|--shadow-lg\|--border-glow-cream\|--glow-gold\|--bg-cream\|--dark-red\|--t-fast\|pulse-glow\|slideRight" src/css`
Expected: no output (0 matches).

- [ ] **Step 8: Commit**

```bash
git add src/css/root.css src/css/nav.css src/css/page.css
git commit -m "refactor(css): remove dead variables, keyframes, and commented code"
```

---

### Task 2: Unify cream color family behind `--cream-rgb`

**Files:**
- Modify: `src/css/root.css`
- Modify: `src/css/footer.css`
- Modify: `src/css/page.css`

- [ ] **Step 1: Add the base triplet and rewrite cream tokens in `root.css`**

The current cream tokens read:

```css
  --text-blue: #7392c5;
  --cream:       #f2e8b9;
  --cream-dim:   rgba(242, 232, 185, 0.55);
  --cream-faint: rgba(242, 232, 185, 0.12);
  --gold:        #c9a84c;
```

Replace with (adds `--cream-rgb`, derives the rest, and introduces `--border-faint`):

```css
  --text-blue: #7392c5;
  --cream-rgb:   242, 232, 185;
  --cream:       rgb(var(--cream-rgb));
  --cream-dim:   rgba(var(--cream-rgb), 0.55);
  --cream-faint: rgba(var(--cream-rgb), 0.12);
  --border-faint: rgba(var(--cream-rgb), 0.07);
  --gold:        #c9a84c;
```

- [ ] **Step 2: Replace the `0.07` border literals with `var(--border-faint)`**

In `footer.css`, both `border-top: 1px solid rgba(242,232,185,0.07);` lines (in `footer` and `footer span`) become:

```css
  border-top: 1px solid var(--border-faint);
```

In `page.css`, replace every `rgba(242,232,185,0.07)` with `var(--border-faint)` (5 occurrences: `section[default]` border-top, `section[about]` border-top, `section[how-it-works]` border-bottom, `section[contact]` border-top, `.pricing-grid > div` border).

- [ ] **Step 3: Replace the `0.1` and `0.05` cream literals in `page.css`**

Line ~294, `testimonial-reference` border-left:

```css
    border-left: 1px solid rgba(242,232,185,0.1);
```
becomes:
```css
    border-left: 1px solid rgba(var(--cream-rgb), 0.1);
```

Line ~724, testimonials mobile border-top (inside the 768px query — note Task 5 also edits this block, but the value swap is independent):

```css
    border-top: 1px solid rgba(242,232,185,0.1);
```
becomes:
```css
    border-top: 1px solid rgba(var(--cream-rgb), 0.1);
```

Line ~616, table cell border:

```css
  border: 1px solid rgba(242, 232, 185, 0.05);
```
becomes:
```css
  border: 1px solid rgba(var(--cream-rgb), 0.05);
```

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: completes without error.

- [ ] **Step 5: Verify no cream literals remain**

Run: `grep -rn "rgba(242" src/css`
Expected: no output (0 matches) — every cream color now flows through `var(--cream-rgb)`.

- [ ] **Step 6: Commit**

```bash
git add src/css/root.css src/css/footer.css src/css/page.css
git commit -m "refactor(css): unify cream color family behind --cream-rgb triplet"
```

---

### Task 3: Unify dark overlay behind `--bg-overlay`

**Files:**
- Modify: `src/css/root.css`
- Modify: `src/css/contact.css`
- Modify: `src/css/page.css`

- [ ] **Step 1: Add the `--bg-overlay` triplet in `root.css`**

In the `:root` block, just below `--bg-card: #323236;`, add:

```css
  --bg-overlay:  20, 20, 24;
```

- [ ] **Step 2: Replace the hardcoded overlay in `contact.css`**

In `.form-group input, .form-group select, .form-group textarea`:

```css
  background: rgba(20, 20, 24, 0.6);
```
becomes:
```css
  background: rgba(var(--bg-overlay), 0.6);
```

- [ ] **Step 3: Replace the hardcoded overlay in `page.css`**

In `.teacher-front-overlay`:

```css
    background: linear-gradient(to top, rgba(20,20,24,0.9), transparent);
```
becomes:
```css
    background: linear-gradient(to top, rgba(var(--bg-overlay), 0.9), transparent);
```

- [ ] **Step 4: Run the build**

Run: `npm run build`
Expected: completes without error.

- [ ] **Step 5: Verify no dark-overlay literals remain**

Run: `grep -rn "rgba(20" src/css`
Expected: no output (0 matches).

- [ ] **Step 6: Commit**

```bash
git add src/css/root.css src/css/contact.css src/css/page.css
git commit -m "refactor(css): unify dark overlay behind --bg-overlay triplet"
```

---

### Task 4: Rename `--transition` to `--ease-emphatic`

**Files:**
- Modify: `src/css/root.css`
- Modify: `src/css/nav.css`

- [ ] **Step 1: Rename the definition in `root.css`**

In the `:root` block:

```css
  --transition: cubic-bezier(0.77, 0, 0.175, 1);
```
becomes:
```css
  --ease-emphatic: cubic-bezier(0.77, 0, 0.175, 1);
```

- [ ] **Step 2: Update both usages in `nav.css`**

In `.burger-btn .bar`:

```css
    transition: transform 0.35s var(--transition), opacity 0.25s ease, width 0.25s ease;
```
becomes:
```css
    transition: transform 0.35s var(--ease-emphatic), opacity 0.25s ease, width 0.25s ease;
```

In `header > nav > aside`:

```css
  transition: transform 0.45s var(--transition);
```
becomes:
```css
  transition: transform 0.45s var(--ease-emphatic);
```

- [ ] **Step 3: Run the build**

Run: `npm run build`
Expected: completes without error.

- [ ] **Step 4: Verify the old name is gone**

Run: `grep -rn -- "--transition" src/css`
Expected: no output (0 matches).

- [ ] **Step 5: Commit**

```bash
git add src/css/root.css src/css/nav.css
git commit -m "refactor(css): rename --transition to --ease-emphatic"
```

---

### Task 5: Fix responsive bugs

**Files:**
- Modify: `src/css/page.css`

All three edits are inside the `@media (max-width: 768px)` query (and one base rule).

- [ ] **Step 1: Retarget the testimonials mobile rule to the real element**

The current dead rule (~line 719) selects `> footer`, which does not exist in the markup (the element is `<testimonial-reference>`):

```css
  section[testimonials] article > footer {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
    border-left: none;
    border-top: 1px solid rgba(var(--cream-rgb), 0.1);
    padding-left: 0;
    padding-top: var(--space-md);
    align-items: center;
  }
```

Change the selector to `> testimonial-reference`:

```css
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
```

- [ ] **Step 2: Fix the teachers grid base rule**

At ~line 472, the base `section[teachers]` declaration:

```css
  grid-template-columns: repeat(auto-fit, 450px);
```
becomes:
```css
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
```

- [ ] **Step 3: Delete the dead `.teacher-card` block in the 768px query**

At ~line 735, delete the entire block (markup uses `.teacher-card-container`, not `.teacher-card`, and the container is not a grid):

```css
  .teacher-card {
    grid-template-columns: 1fr; /* Stack on mobile */
    text-align: center;
  }
```

- [ ] **Step 4: Delete the orphan `> details` rule in the nav 768px query**

At ~line 675, delete the block (there is no `<details>` element in the nav):

```css
    > details {
      display: block;
    }
```

- [ ] **Step 5: Run the build**

Run: `npm run build`
Expected: completes without error.

- [ ] **Step 6: Verify the dead selectors are gone**

Run: `grep -rn "article > footer\|\.teacher-card {\|> details\|repeat(auto-fit, 450px)" src/css`
Expected: no output (0 matches).

- [ ] **Step 7: Manual browser check (cannot be automated)**

Run: `npm run dev` and open `http://localhost:8080`.
- At **768px and below**, open the testimonials page (index) and confirm each testimonial's reference block sits below the quote with a top border (not a left border) and reads left-aligned.
- Open the teachers page and narrow the viewport to **~400px**; confirm the teacher card no longer overflows horizontally (no sideways scroll).
- Confirm the mobile burger menu still opens/closes and the slide-in aside animates (regression check on the `--ease-emphatic` rename from Task 4).

- [ ] **Step 8: Commit**

```bash
git add src/css/page.css
git commit -m "fix(css): repair testimonials, teachers, and nav responsive rules"
```

---

### Task 6: Final whole-site verification

**Files:** none (verification only).

- [ ] **Step 1: Clean build**

Run: `npm run build`
Expected: completes without error.

- [ ] **Step 2: Consolidated grep assertions**

Run: `grep -rn "rgba(242\|rgba(20\|--transition\|pulse-glow\|slideRight\|--shadow-md\|--shadow-lg\|--border-glow-cream\|--glow-gold\|--bg-cream\|--dark-red\|--t-fast\|article > footer\|repeat(auto-fit, 450px)" src/css`
Expected: no output (0 matches across all patterns).

- [ ] **Step 3: Visual regression pass**

With `npm run dev` running, walk every page (index, about, lessons, teachers, pricing/faq, contact, terms, etc.) at **1024 / 768 / 480 px**. Confirm no visual change anywhere **except** the two intended fixes from Task 5 (testimonials mobile reference block; teachers grid no longer overflowing).

- [ ] **Step 4: No-JS check**

In the browser devtools, disable JavaScript and reload the index page. Confirm `.reveal` content is fully visible (not stuck hidden) and the loader does not block the page. Behavior must be unchanged from before this work.
