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
| `keyframes.css` | All `@keyframes` (`fadeUp`, `fadeIn`, `shimmer`, `kenBurns`, `wordIn`, `scrubInLeft`/`scrubInRight`). |
| `reset.css` | `box-sizing`, `html`/`body`, list/anchor resets, media-element + form-control normalization. |
| `reveal.css` | The `.reveal` / `.js .reveal` / `.reveal.visible` scroll-reveal progressive-enhancement logic + `.reveal-delay-*`. |

**Shared components:**
| File | Owns |
|------|------|
| `buttons.css` | `.btn` and modifiers (`.btn-clear`, `.btn-cream`, `.btn-slide`, `.btn-large`, `.btn-xl`, `.btn-block`), `.btn-row`, hover states. |
| `nav.css` | Header nav, burger button, sidebar, overlay — **and all nav responsive queries**. |
| `footer.css` | Footer layout. |
| `loader.css` | Piano loading animation (its `@keyframes shimmer` lives in `keyframes.css`). |
| `contact-form.css` | Form fields, labels, focus states. (Was `contact.css`.) |

**Page sections:**
| File | Owns |
|------|------|
| `sections.css` | Base `section` padding, background variants (`[alt]`, `[glow]`, `[navy]`, `[ruled]`), the heading system (`section h2/h3`, `.section-head` + `.center`/`.split`, `.lede`), `.draw-underline`, `.muted`, the hero (`section[intro]`, `[home]`, `[page]`, the per-page hero photos and the people-hero treatment — see gotchas), `section[how-it-works]` `.steps`, `section[contact]` CTA band. |
| `instruments.css` | `section[instruments]` + `.instruments-grid`. |
| `testimonials.css` | `section[testimonials]` quote/reference cards. **Kept on purpose while no page uses it** — testimonials will be added back once real ones are collected. Don't delete. |
| `pricing.css` | `section[pricing]` + `.pricing-grid` + `.featured`. |
| `teachers.css` | `.teacher-grid` flip cards, photo, no-JS hover flip. |
| `terms.css` | `.policy-layout` (sticky contents rail + numbered clauses), `.policy-list`, `.table-container`/`table`, `.tagline`, `.disclaimer`. |
| `features.css` | Shared blocks: `.split` (+ `.reverse`, `.top`), `.frame` (+ `.portrait`, `img[crop-right]`), `.pillars`, `.card-grid`/`.card`/`.card-mark`, `.badge`, `.checklist`, `.pull-quote`, `.signature`, `.timeline`, `.info-list`, `.notice`. |
| `faq.css` | `.faq-layout` and `<details class="faq-item">` accordions (no JS needed). |

## `@import` order (load-bearing)

The order in `index.css` is **not** alphabetical and must hold:

```
tokens → keyframes → reset → reveal → loader → contact-form → buttons → nav → footer
→ sections → instruments → testimonials → pricing → teachers → terms → features → faq
```

Why: `tokens` first (everything references its custom properties); `keyframes` before any
file that animates; `reset` before components. When you add a file, **append** its import
in the page-sections group — don't reshuffle the existing lines.

## Responsive breakpoints — where each one lives

| File | Breakpoints |
|------|-------------|
| `nav.css` | 1180px, 900px (burger + mobile logo replace the desktop nav), 901px-min (hide sidebar + overlay) |
| `sections.css` | 1024px (how-it-works steps stack, `.section-head.split` stacks), 600px (hero buttons stack, smaller CTA glyph), 600px **+ portrait orientation** (upright hero photos for about/lessons/phoebe) |
| `features.css` | 900px (`.split` and friends stack), 560px |
| `instruments.css` | 1024px (3-col), 640px (2-col, hide blurbs), hover-none ≥641px (always show blurbs) |
| `pricing.css` | 1100px (2-col), 600px (1-col) |
| `contact-form.css` | 960px, 600px |
| `footer.css` | 900px, 560px |
| `faq.css` / `terms.css` | 900px (layout stacks) |
| `teachers.css` | 480px |
| `testimonials.css` | 768px (1-col articles) |

Most files also carry a `prefers-reduced-motion: reduce` block that switches off their own
hover lifts/transitions — keep that alongside any new motion.

## Conventions & gotchas

- **Change design values in `tokens.css`, not as literals in components.** Cream derives
  from the `--cream-rgb` triplet (`--cream`, `--cream-dim`, `--cream-faint`,
  `--border-faint` all flow from it); dark overlays from `--bg-overlay`. Adjust the token,
  every consumer follows.
- **`var(--surface)` in `nav.css` (burger-btn hover) is intentionally undefined** — it
  resolves to no background (initial), which is the intended look. Don't "fix" it by
  inventing a value; doing exactly that caused visual regressions in a prior pass. (Earlier
  undefined vars `--bg-brand` and `--border` have since been cleaned up; `--bg-raised` is
  now a real token used by `section[alt]`. `--surface` is the last deliberate one.)
- **The no-JS path lives in `reveal.css` and `loader.css`** — `.reveal` is visible by
  default and only `.js .reveal` hides-then-animates; the loader only displays under `.js`.
  Preserve this when touching either file (the site must work with JavaScript disabled).
- **`section[default]`'s `border-top` is a separate rule on purpose.** Folding it into the
  base `section` rule would draw a border across the `section[intro]` hero.
- **Markup hooks are styling-only.** Attributes (`section[intro]`, `section[pricing]`,
  `img[desktop]`/`img[mobile]`, `img[crop-right]`, `[scroll-cue]`) and custom-element tags
  (`nav-logo-main`, plus `testimonial-quote`/`testimonial-reference` in the unused
  testimonials block) carry no JavaScript — they exist purely as selectors. Custom elements
  used as grid/flex items are blockified by the layout, so they need no `display` rule.
- **Interior hero photos come in two strengths** (`sections.css`). Plain `section[intro][page]`
  is a navy wash over a faint manuscript engraving; `about`/`lessons`/`careers` swap in a faint,
  desaturated piano-room photo on that same navy wash. Photos of **people** (`teachers`,
  `phoebe`, `harmoniche`, `angel`) use the people-hero block instead: near-black ground, a
  dark scrim, photo at ~0.45 opacity (the teachers group shot overrides to 0.6). The navy
  wash turns warm stage photos muddy, so add new people pages to that selector list rather
  than giving them a plain `[page]` photo.
- **`section[how-it-works]` numerals are styled positionally** (`.steps > div > :first-child`
  is the numbered circle). Keep the first child of each step as the numeral, or the circle
  styling lands on the wrong element.

## Adding a new component

1. Create `src/css/<name>.css` containing the component **and** its `@media` rules.
2. Append `@import "<name>.css";` to `index.css` in the page-sections group (don't reorder).
3. `npm run build` and confirm the bundled `_site/css/index.css` includes your rules.

## History

The component split is documented in
`docs/superpowers/specs/2026-06-13-css-architecture-reorganization-design.md` and its
summary; the token/selector cleanups in the `2026-06-13-css-code-improvements` spec/summary.
Consult them for *why*; this README is the current map.
