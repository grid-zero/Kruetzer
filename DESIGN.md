# DESIGN.md

The visual design system for **Kreutzer**, a Canberra music-tuition studio. This is the
*why and what* of the aesthetic — the north star to match when building or restyling any
page. For the *how* (CSS file structure, cascade order, bundling) see
[`src/css/README.md`](src/css/README.md); for build and page mechanics see
[`CLAUDE.md`](CLAUDE.md). **All concrete values live in
[`src/css/tokens.css`](src/css/tokens.css)** — this doc explains the intent behind them;
that file is the source of truth. When a value here and a token disagree, the token wins.

## North star

A **candlelit classical concert-program**, rendered in code. Near-black ground lit by
cream and gold, serif type throughout, hushed and expensive. It should feel like a recital
programme, not a SaaS dashboard. The design already commits hard to this single vision —
your job when adding UI is to **deepen this voice, never introduce a second one.** Half-
commitment (a stray sans-serif, a brighter accent, a generic card grid) is what breaks it.

## The seven dimensions

**Tone** — Luxury / refined editorial. Classical, restrained, atmospheric. Uppercase
letter-spaced eyebrows over serif display headings; generous vertical breathing room.

**Color** — Dark, warm. Near-black ground, cream body text, gold accents, a single
deep navy as the secondary. See the palette table below. Never introduce SaaS blue,
purple→blue gradients, or a second accent hue.

**Typography** — Four families with strict jobs: Cormorant Garamond for every heading and
big number, Cinzel only for small engraved caps (eyebrows, nav, labels, buttons),
Montserrat at regular weight for reading text, Tangerine for the wordmark. See the type
table below.

**Motion** — One orchestrated entrance plus quiet scroll-reveals. The hero stages a
`fadeUp` cascade; everything below reveals on scroll with a small stagger. Felt, not
noticed. Load-bearing: it must degrade gracefully with JavaScript off (see Motion section).

**Spatial** — Generous whitespace on a structured, symmetric grid. `--space-xl` (7rem)
section rhythm, `1280px` centered max-width, fluid page padding. It earns impact through
type and color, not layout drama — symmetric on purpose.

**Backgrounds** — Clean solids plus one photographic hero. The intro section is a full-
bleed photo; interior pages open on a navy hero over a faint Debussy-manuscript engraving; everything
else sits on near-black, a raised near-black (`[alt]`), or the navy CTA band, divided by
barely-there cream hairlines. No noise/grain overlay — the photo and the type do the work.

**Differentiation** — **Atmosphere + typography-as-art.** The thing a visitor remembers is
the candlelit dark-gold-cream mood paired with the oversized `Cormorant Garamond` hero and
`Cinzel` engraved caps — a classical-music identity you almost never see built in code. The
italic gold `<em>` inside the hero heading ("Inspiring The *Art* Of Music") is the
signature flourish; keep that pattern.

## Color palette

Cream is built from **one** `--cream-rgb` triplet so every tint derives from a single
source — adjust the triplet and all four cream values follow. Change colors here, never as
literals in component files.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#0b0c10` | Near-black page ground |
| `--bg-raised` | `#101218` | Alternate section ground (`section[alt]`) |
| `--bg-card` | `#161920` | Card surfaces |
| `--bg-blue` / `--navy-rgb` | `8, 56, 100` | Navy: heroes, CTA band, featured surfaces |
| `--bg-blue-deep` | `#04213d` | Top of navy gradients |
| `--cream-rgb` | `242, 232, 185` | The one source for all cream |
| `--cream` / `--cream-soft` / `--cream-dim` | 100% / 82% / 70% | Headline-adjacent text / body / secondary |
| `--gold-rgb` | `201, 168, 76` | The one source for gold; `--gold-line`, `--gold-glow` derive from it |
| `--gold-light` / `--gold-pale` / `--gold-deep` | | Solid gold tints. **Gold text is always solid — never a gradient.** |
| `--white` | `#f7f4ec` | Warm white for `h1`/`h2` |

> `var(--surface)` appears in `nav.css` (burger-hover) and is **intentionally undefined** —
> it resolves to no background, which is the intended look. Don't invent a value for it.

## Type system

All serif, four families with distinct jobs. Fluid `clamp()` scale (`--text-xs` →
`--text-2xl`, plus `--text-script`). Weights: `400` regular, `500` medium, `700` bold.

| Family | Token | Used for |
|--------|-------|----------|
| Cormorant Garamond | `--font-display` | Hero `h1`, section `h2`, card `h4`, prices, stats, quotes, numerals |
| Cinzel | `--font-title` | `h3` eyebrows (gold, uppercase, `0.32em` tracking; rules on both sides only when centred), nav, buttons, labels |
| Montserrat | `--font-body` | Body copy at weight 400 |
| Tangerine | `--font-script` | The "Kreutzer" wordmark and signatures only |

Heading conventions, set in [`sections.css`](src/css/sections.css): `h3` is a gold
uppercase eyebrow (no leading dash; centred ones get a short rule on each side); `h2` is a large warm-white Cormorant
title whose `<em>` turns solid gold italic. Wrap them in `.section-head`
(`.center` centres it and adds the two-sided eyebrow rules; `.split` puts a
paragraph beside the title). Cards use `h4` so they never pick up the eyebrow style.

## Motion

Motion is a **small, deliberate vocabulary**, not one blanket fade. It extends the
`IntersectionObserver` + `.reveal` system (visible-by-default, so the site still works with
JavaScript off) with composable gesture-modifier classes.

**Reveal vocabulary** (compose a modifier onto `.reveal`), defined in
[`reveal.css`](src/css/reveal.css):

- `.reveal` — fade + rise (default).
- `.reveal--left` / `.reveal--right` — directional slide (two-column sections).
- `.reveal--wipe` — clip-path mask reveal. **At most one `h2` per page.**
- `.reveal--blur` — blur-to-sharp (intro/about contexts).
- `.reveal-stagger` (on a parent) — cascades its direct `.reveal` children.

Entrance reveals animate the individual **`translate`/`scale`** properties, never the
`transform` shorthand — that leaves `transform` free for `:hover` lifts on the *same*
element (buttons, tiles, cards that are both a `.reveal` and have a hover transform).
Don't reintroduce `transform` into the reveal entrance, or hover lifts on revealed
elements break.

**Hero (homepage only, `section[intro][home]`):** the `h1` rises word-by-word out of a
blur (`wordIn`), over a slow CSS **Ken Burns** drift on the photo (`kenBurns`, a `::before`
layer). The signature moment — used nowhere else. The whole entrance is gated on a
`.loaded` class that [`index.js`](src/index.js) adds to `<html>` when the loader curtain
lifts (immediately on pages with no loader), so the choreography plays *after* the curtain
rather than hidden behind it.

**Testimonials (`.reveal-scrub` / `--right`):** reveal progress is **scroll-scrubbed** —
tied directly to scroll position via a `view()` timeline (`scrubInLeft`/`scrubInRight` in
[`keyframes.css`](src/css/keyframes.css)), so scrolling back up progressively hides them.
Pure CSS, no observer. `@supports (animation-timeline: view())` gates it; unsupported
browsers (and reduced-motion) get the cards static-visible.

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
  hover/keyframe motion. The hero entrance and the testimonial scrub take the inverse
  approach — their animation rules live inside `@media (prefers-reduced-motion: no-preference)`,
  so reduced-motion users simply never get them.

New keyframes live in [`keyframes.css`](src/css/keyframes.css); motion easings/durations in
[`tokens.css`](src/css/tokens.css). No timing literals in components.

## Guardrails — NEVER, in this codebase

- **No sans-serif headings.** Sans-serif is for body text only (Montserrat). No
  Inter/Roboto/Space Grotesk/Geist.
- **No new color literals** in component files — go through `tokens.css`; derive from the
  cream triplet or a named token. Don't "fix" the intentionally-undefined `--surface`.
- **No SaaS blue or purple→blue gradients.** The only blue is the deep navy
  (`--navy-rgb` / `--bg-blue`, plus `--text-blue` for rare small accents).
- **No root-relative paths** (`/css/...`, `/assets/...`). GitHub Pages serves from a project
  subpath; keep every asset and link path relative.
- **No JS-gated content.** Anything that only appears with `.js` breaks the no-JS guarantee.
  Visible by default; enhance, don't gate.
- **No generic centered-card stacks or `max-w-7xl mx-auto` clones.** Reuse the existing
  `section[*]` hooks and the `.reveal` stagger instead of inventing new layout primitives.

## When adding new UI

1. Compose from existing `section[*]` hooks and class patterns proven on the homepage
   before reaching for anything new.
2. Pull every color, font, space, radius, and easing from `tokens.css`. If you feel you
   need a value that isn't there, add it to `tokens.css` — don't inline a literal.
3. Keep paths relative and content visible without JS.
4. Match the voice: gold Cinzel eyebrow → Cormorant title with a gold italic `<em>` → cream body. Restraint over
   decoration.
