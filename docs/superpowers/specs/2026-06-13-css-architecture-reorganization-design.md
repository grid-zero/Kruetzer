# CSS Architecture Reorganization — Design

**Date:** 2026-06-13
**Scope:** Reorganize CSS file structure from a monolithic `page.css` (740 lines, 58% of all CSS) into a component-based architecture with co-located responsive rules. No visual redesign, no HTML changes.

## Constraints

- **CSS-only.** No HTML/markup changes.
- **No-JS path untouched.** `.reveal` / `.js .reveal` / loader gating unchanged.
- **No visual redesign.** The site must look identical after reorganization.
- **Build must pass.** `npm run build` (Eleventy) completes without error before and after every file move.

## Current architecture (problems)

| Problem | Detail |
|---------|--------|
| Monolithic page.css | 740 lines containing 8 page sections, 4 responsive breakpoints, shared components (buttons, tables, policies), teacher flip cards — all in one file |
| Nav responsive rules in wrong file | Nav's 1024px/768px/769px breakpoints live at the bottom of page.css, not in nav.css |
| root.css mixes concerns | Custom properties, keyframes, reset/base styles, and reveal animation logic all in one 128-line file |
| No consistent philosophy | Some files are by component (nav, footer, loader), others are catch-all (page.css) |
| Fragile deep-descendant selectors | `section[how-it-works] > div > div > div > :first-child` and similar chains break if markup nesting changes |

## Target architecture

**Philosophy:** Component-based with pragmatic grouping. Each file has one clear owner. Responsive rules live in the same file as the component they affect. Small related sections share a file; major sections get their own.

### File map (16 files, from 7)

```
src/css/
  index.css           @import manifest (order matters — tokens first)
  tokens.css          Custom properties only (:root block)
  reset.css           Box-sizing, html, body, base element resets
  keyframes.css       All @keyframes (fadeUp, fadeIn, slideIn, shimmer — moved from loader.css)
  reveal.css          .reveal / .js .reveal progressive-enhancement logic
  buttons.css         .btn, .btn-clear, hover states
  nav.css             Header nav + burger button + sidebar + overlay + ALL nav responsive queries
  footer.css          Footer layout (unchanged)
  loader.css          Piano loading animation (unchanged)
  contact-form.css    Form fields, labels, focus states (renamed from contact.css)
  sections.css        Intro + about + how-it-works + FAQ + contact wrapper + section defaults + shared headings
  instruments.css     Instrument grid (unboxed from page.css)
  testimonials.css    Quote/reference cards (unboxed from page.css)
  pricing.css         Pricing grid + featured card (unboxed from page.css)
  teachers.css        Flip cards + overlays + backface visibility (unboxed from page.css)
  terms.css           Policy lists + table styling + .tagline + .disclaimer (unboxed from page.css)
```

### Migration map

| Source | Destination | Content |
|--------|-------------|---------|
| `root.css` | `tokens.css` | `:root { }` block — all custom properties |
| | `keyframes.css` | `@keyframes fadeUp`, `fadeIn`, `slideIn` |
| | `reset.css` | `*,*::before,*::after`, `html`, `body`, `ul/ol`, `a`, media elements, form inheritance |
| | `reveal.css` | `.reveal`, `.js .reveal`, `.reveal.visible`, `.reveal-delay-*` |
| `page.css` | `buttons.css` | `.btn`, `.btn-clear`, hover states |
| | `sections.css` | `section` defaults, `section[intro]`, `section[about]`, `section[how-it-works]`, `section[faq]`, `section[contact]` wrapper |
| | `instruments.css` | `section[instruments]` + 480px query |
| | `testimonials.css` | `section[testimonials]` + 768px query |
| | `pricing.css` | `section[pricing]` + `.pricing-grid` + 768px query |
| | `teachers.css` | `section[teachers]` + flip card logic |
| | `terms.css` | `.policy-*`, `table`/`th`/`td`, `.disclaimer`, `.tagline` |
| | `sections.css` (responsive) | 1024px how-it-works stack, 768px about stack |
| | `nav.css` (responsive) | 1024px logo hide + grid, 768px burger + mobile layout, 769px min sidebar hide |
| `loader.css` | `keyframes.css` | `@keyframes shimmer` (moved to join other keyframes) |
| `contact.css` | `contact-form.css` | Renamed for clarity |

### Responsive rule co-location

Every responsive query lives in the same file as the component it modifies:

| File | Breakpoints |
|------|-------------|
| `nav.css` | 1024px (hide logo, 2-column grid), 768px (show burger, mobile logo positioning, hide desktop nav), 769px min (hide sidebar + overlay) |
| `testimonials.css` | 768px (1-column article, testimonial-reference top-border layout) |
| `pricing.css` | 768px (1-column grid, max-width 400px) |
| `instruments.css` | 480px (2-column grid) |
| `sections.css` | 1024px (how-it-works column stack), 768px (about column stack) |

### Selector cleanup (easy fixes only)

The following fixes simplify selectors without touching HTML:

- Keep the existing shared `section h2`, `section h3`, `section p` base rules — they are already deduplicated in the current code and will live in `sections.css`
- `section[default]` border-top stays as a separate rule — merging it into the base `section` rule would add an unwanted border to `section[intro]` (hero with background image)
- Remove the thin `section[contact]` wrapper if it only sets `padding-bottom` — check whether it can be inlined into the base section or is genuinely needed
- The deep-descendant chains in `section[how-it-works]` are **not** fixed — they require HTML class additions, out of scope

### @import order (load-bearing)

```css
@import "tokens.css";        /* Must be first — everything depends on custom properties */
@import "keyframes.css";     /* Must be before any animation references */
@import "reset.css";         /* Base elements before components */
@import "reveal.css";        /* Progressive enhancement before page content */
@import "buttons.css";       /* Shared components */
@import "nav.css";
@import "footer.css";
@import "loader.css";
@import "contact-form.css";
@import "sections.css";      /* Page sections */
@import "instruments.css";
@import "testimonials.css";
@import "pricing.css";
@import "teachers.css";
@import "terms.css";
```

### What does NOT change

- No HTML/markup edits
- No visual redesign — site must look identical
- No-JS path: `.reveal` visible by default, `.js .reveal` hides-then-animates, loader hidden without JS
- `loader.css` content unchanged (only `@keyframes shimmer` moves to `keyframes.css`)
- `footer.css` content unchanged
- All existing custom property names and values preserved
- File output: Eleventy still writes 11 pages to `_site/`

## Testing

1. **Build:** `npm run build` completes without error after every file creation/move
2. **CSS diff:** diff the built `_site/css/index.css` (Eleventy bundles all imports) before and after reorganization — must be identical except for whitespace/comment changes
3. **Visual regression:** run dev server, walk every page at 1024/768/480px — no visual change
4. **No-JS check:** disable JavaScript, verify `.reveal` content visible, loader not blocking
5. **Old files removed:** `root.css`, `page.css`, `contact.css` deleted; `index.css` updated

## Out of scope

- Visual/design changes
- HTML/markup edits (including class additions for deep-descendant selector flattening)
- CSS rule logic changes (beyond the easy selector merges noted above)
- File bundling strategy changes (Eleventy's native CSS import bundling stays)
- Deduplication of teacher cards or other content concerns
