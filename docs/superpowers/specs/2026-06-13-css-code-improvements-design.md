# CSS Code Improvements — Design

**Date:** 2026-06-13
**Scope:** Cleanup & maintainability, architecture/consistency, and responsiveness fixes for the site's CSS. **No visual redesign.** The only intended visual changes are the responsive bug fixes in §3.

## Constraints

- **CSS-only.** No HTML/markup changes. Anything requiring markup edits is deferred to a documented follow-up (§4).
- **No-JS path is untouched.** The progressive-enhancement logic (`.reveal`, `.js .reveal`, loader visibility gating) must not change.
- Relative asset paths stay relative (GitHub Pages project subpath).
- Files in scope: `src/css/root.css`, `nav.css`, `footer.css`, `page.css`, `contact.css`. (`loader.css`, `index.css` reviewed; no changes planned.)

## 1. Dead code removal

**Unused custom properties** — verified 0 references via grep; delete from `root.css`:

- `--shadow-md`
- `--shadow-lg`
- `--border-glow-cream`
- `--glow-gold`
- `--bg-cream`
- `--dark-red`
- `--t-fast`

**Unused keyframes** — delete from `root.css` (verified 0 `animation:`/`animation-name` references):

- `@keyframes pulse-glow`
- `@keyframes slideRight`

**Commented-out code** — remove:

- `/*--bg: #141414;*/` in `root.css`
- the commented `position / left / transform` block inside `nav-logo-main` in `nav.css`
- the `/*margin-left: var(--space-lg);*/` comment in the nav `ul` rule in `nav.css`
- the commented `radial-gradient` background in `.teacher-card-back` in `page.css`
- the `/*color: var(--gold-light);*/` comment in `.teacher-card-back .teacher-info h3` in `page.css`

**Stale marker** — remove the `/* TODOL improve styling */` comment on the `company-stats` rule in `page.css`. The styling exists; the marker is stale. No styling change.

## 2. Token consolidation & naming

**`--border-faint`** — add to `root.css`:

```css
--border-faint: rgba(242,232,185,0.07);
```

Replace all 7 literal occurrences of `rgba(242,232,185,0.07)` with `var(--border-faint)`:

- `footer.css` — 2 occurrences (`footer` border-top, `footer span` border-top)
- `page.css` — 5 occurrences (`section[default]`, `section[about]`, `section[how-it-works]`, `section[contact]`, `.pricing-grid > div`)

> Note: other alpha variants in the family (`0.05`, `0.1`, `0.12=--cream-faint`) are intentionally **left as-is** to keep this focused. Only the exact `0.07` literal is consolidated.

**`--bg-overlay`** — add a raw RGB triplet to `root.css` so alpha can vary at the call site:

```css
--bg-overlay: 20, 20, 24;
```

Rewrite the 2 hardcoded dark overlays:

- `contact.css:44` — `background: rgba(20, 20, 24, 0.6);` → `rgba(var(--bg-overlay), 0.6)`
- `page.css:518` — `linear-gradient(to top, rgba(20,20,24,0.9), transparent)` → `rgba(var(--bg-overlay), 0.9)`

**Rename `--transition` → `--ease-emphatic`** — it is a `cubic-bezier(...)` timing function, not a transition shorthand; the name misleads. Rename the definition in `root.css` and update the 2 usages in `nav.css` (lines 112 and 142). This is distinct from `--ease`, which is a different curve and stays.

## 3. Responsive bug fixes (`page.css` media queries)

**Testimonials mobile (768px).** The rule `section[testimonials] article > footer { ... }` never matches — the markup uses a `<testimonial-reference>` custom element, not `<footer>`. Retarget it:

```css
section[testimonials] article > testimonial-reference {
  flex-direction: row;
  justify-content: flex-start;
  text-align: left;
  border-left: none;
  border-top: 1px solid rgba(242,232,185,0.1);
  padding-left: 0;
  padding-top: var(--space-md);
  align-items: center;
}
```

So the mobile reference block actually switches from the desktop left-border/column layout to the stacked top-border layout.

**Teachers grid.** The `.teacher-card { grid-template-columns: 1fr; ... }` rule at 768px is dead (markup uses `.teacher-card-container`, and the container is not a grid). The real bug: the base `section[teachers]` uses `grid-template-columns: repeat(auto-fit, 450px)`, whose fixed 450px tracks overflow viewports narrower than 450px. Fix the base rule:

```css
section[teachers] {
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 450px), 1fr));
}
```

and delete the dead `.teacher-card` block from the 768px query.

**Nav.** Remove the orphan rule `header > nav > details { display: block }` inside the 768px query. There is no `<details>` element in the nav; the mobile menu uses the burger `<button>` + `<aside>`.

## 4. Fragile selectors — documented follow-up (no change now)

These deep descendant chains are brittle (positional, break if markup nesting shifts), but flattening them safely requires adding class names to the HTML, which is out of scope for this CSS-only pass. Recorded here as a follow-up:

- `section[how-it-works] > div > div > div > :first-child`
- `section[how-it-works] > div > div > div > :nth-child(2)`
- `section[about] company-stats > div > div:has(+div)`
- `section[intro] > div > div`

## 5. Testing

1. **Build:** `npx @11ty/eleventy` completes without error.
2. **Reference-integrity grep:** after edits, each removed token name (`--shadow-md`, `--shadow-lg`, `--border-glow-cream`, `--glow-gold`, `--bg-cream`, `--dark-red`, `--t-fast`, `--transition`) returns 0 matches across `src/css`; `pulse-glow` and `slideRight` return only their (now-deleted) definitions, i.e. 0 matches.
3. **Visual regression:** run the dev server and walk every page at 1024 / 768 / 480 px. Confirm no visual change **except** the two intended fixes (testimonials mobile reference block, teachers grid no longer overflowing on narrow screens).
4. **No-JS check:** confirm `.reveal` content is visible and the loader stays hidden with JS disabled (unchanged behavior).

## Out of scope

- Visual/design polish (spacing, hierarchy, color changes).
- HTML/markup edits (including selector flattening from §4).
- File reorganization or splitting.
- Consolidating the other `rgba(242,232,185,*)` alpha variants.
