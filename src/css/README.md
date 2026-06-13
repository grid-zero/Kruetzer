# CSS architecture

Reference for working in `src/css/`. Read this before adding, moving, or restyling CSS.
(For the build pipeline and the site's load-bearing constraints, see the repo root `CLAUDE.md`;
for the *visual* intent behind the tokens — tone, palette, type rationale — see the repo root
`DESIGN.md`.)

## How it's bundled

`index.css` is an **`@import` manifest** — it has no rules of its own, only imports. At
build time the `afterBuild` hook in `.eleventy.js` runs `postcss-import` over the
copied `_site/css/index.css` and inlines every `@import` into one stylesheet the browser
loads. **Edit the component files here in `src/css/`, never `_site/css/`.**

## Philosophy

Component-based with pragmatic grouping:

- **One clear owner per file.** Each rule lives in the file named for the thing it styles.
- **Responsive rules are co-located.** A component's `@media` queries live in the *same*
  file as the component — there is no central "responsive.css". Don't move a breakpoint
  away from its component.
- **Major sections get their own file; thin section wrappers share `sections.css`.** This
  avoids both a 740-line monolith (the old `page.css`) and a file-per-tiny-thing explosion.

## File map

**Foundation** (must load first, in this order):
| File | Owns |
|------|------|
| `tokens.css` | The `:root` block — every custom property (fonts, fluid type scale, colors, spacing, radii, easings). The single source of design values. |
| `keyframes.css` | All `@keyframes` (`fadeUp`, `fadeIn`, `slideIn`, `shimmer`). |
| `reset.css` | `box-sizing`, `html`/`body`, list/anchor resets, media-element + form-control normalization. |
| `reveal.css` | The `.reveal` / `.js .reveal` / `.reveal.visible` scroll-reveal progressive-enhancement logic + `.reveal-delay-*`. |

**Shared components:**
| File | Owns |
|------|------|
| `buttons.css` | `.btn`, `.btn-clear`, `.btn-large`, hover states. |
| `nav.css` | Header nav, burger button, sidebar, overlay — **and all nav responsive queries**. |
| `footer.css` | Footer layout. |
| `loader.css` | Piano loading animation (its `@keyframes shimmer` lives in `keyframes.css`). |
| `contact-form.css` | Form fields, labels, focus states. (Was `contact.css`.) |

**Page sections:**
| File | Owns |
|------|------|
| `sections.css` | Base `section` padding + shared `section h2/h3/p` headings, plus the thin wrappers: `section[intro]`, `section[about]`, `section[how-it-works]`, `section[faq]`, `section[contact]`, `section[default]`. |
| `instruments.css` | `section[instruments]` + `.instruments-grid`. |
| `testimonials.css` | `section[testimonials]` quote/reference cards. |
| `pricing.css` | `section[pricing]` + `.pricing-grid` + `.featured`. |
| `teachers.css` | `section[teachers]` flip cards, overlays, backface visibility. |
| `terms.css` | `.policy-list`, `.table-container`/`table`, `.tagline`, `.disclaimer`. |

## `@import` order (load-bearing)

The order in `index.css` is **not** alphabetical and must hold:

```
tokens → keyframes → reset → reveal → buttons → nav → footer → loader
→ contact-form → sections → instruments → testimonials → pricing → teachers → terms
```

Why: `tokens` first (everything references its custom properties); `keyframes` before any
file that animates; `reset` before components. When you add a file, **append** its import
in the page-sections group — don't reshuffle the existing lines.

## Responsive breakpoints — where each one lives

| File | Breakpoints |
|------|-------------|
| `nav.css` | 1024px (hide wordmark logo, 2-col grid), 768px (show burger, mobile logo, hide desktop nav), 769px-min (hide sidebar + overlay) |
| `sections.css` | 1024px (how-it-works column stack), 768px (about column stack) |
| `testimonials.css` | 768px (1-col articles) |
| `pricing.css` | 768px (1-col grid, max-width 400px) |
| `instruments.css` | 480px (2-col grid) |

## Conventions & gotchas

- **Change design values in `tokens.css`, not as literals in components.** Cream derives
  from the `--cream-rgb` triplet (`--cream`, `--cream-dim`, `--cream-faint`,
  `--border-faint` all flow from it); dark overlays from `--bg-overlay`. Adjust the token,
  every consumer follows.
- **`var(--surface)` in `nav.css` (burger-btn hover) is intentionally undefined** — it
  resolves to no background (initial), which is the intended look. Don't "fix" it by
  inventing a value; doing exactly that caused visual regressions in a prior pass. (Earlier
  undefined vars `--bg-brand`, `--border`, `--bg-raised` have since been cleaned up;
  `--surface` is the last deliberate one.)
- **The no-JS path lives in `reveal.css` and `loader.css`** — `.reveal` is visible by
  default and only `.js .reveal` hides-then-animates; the loader only displays under `.js`.
  Preserve this when touching either file (the site must work with JavaScript disabled).
- **`section[default]`'s `border-top` is a separate rule on purpose.** Folding it into the
  base `section` rule would draw a border across the `section[intro]` hero.
- **Markup hooks are styling-only.** Boolean attributes (`section[intro]`, `section[pricing]`,
  `img[desktop]`/`img[mobile]`) and custom-element tags (`company-story`, `company-stats`,
  `testimonial-quote`, `testimonial-reference`, `nav-logo-main`) carry no JavaScript — they
  exist purely as selectors. Custom elements used as grid/flex items are blockified by the
  layout; that's why e.g. `company-story` works as a column without a `display` rule.
- **Some `section[how-it-works]` selectors are fragile deep-descendant chains** (e.g.
  `> div > div > div > :first-child` styles the numbered circle). They depend on exact
  nesting — adding or removing a wrapper `<div>` in that section can silently break the
  styling. Flattening them needs HTML class additions and is deferred.

## Adding a new component

1. Create `src/css/<name>.css` containing the component **and** its `@media` rules.
2. Append `@import "<name>.css";` to `index.css` in the page-sections group (don't reorder).
3. `npm run build` and confirm the bundled `_site/css/index.css` includes your rules.

## History

The component split is documented in
`docs/superpowers/specs/2026-06-13-css-architecture-reorganization-design.md` and its
summary; the token/selector cleanups in the `2026-06-13-css-code-improvements` spec/summary.
Consult them for *why*; this README is the current map.
