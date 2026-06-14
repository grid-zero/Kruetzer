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
desaturated teal as the secondary. See the palette table below. Never introduce SaaS blue,
purple→blue gradients, or a second accent hue.

**Typography** — A four-family, **all-serif** system. No sans-serif anywhere — that is a
deliberate identity choice, not an omission. See the type table below.

**Motion** — One orchestrated entrance plus quiet scroll-reveals. The hero stages a
`fadeUp` cascade; everything below reveals on scroll with a small stagger. Felt, not
noticed. Load-bearing: it must degrade gracefully with JavaScript off (see Motion section).

**Spatial** — Generous whitespace on a structured, symmetric grid. `--space-xl` (7rem)
section rhythm, `1280px` centered max-width, fluid page padding. It earns impact through
type and color, not layout drama — symmetric on purpose.

**Backgrounds** — Clean solids plus one photographic hero. The intro section is a full-
bleed photo; everything else sits on solid near-black or the teal CTA band, divided by
barely-there cream hairlines. No noise/grain overlay — the photo and the type do the work.

**Differentiation** — **Atmosphere + typography-as-art.** The thing a visitor remembers is
the candlelit dark-gold-cream mood paired with the oversized `DM Serif Display` hero and
`Cinzel` engraved caps — a classical-music identity you almost never see built in code. The
italic gold `<em>` inside the hero heading ("Inspiring The *Art* Of Music") is the
signature flourish; keep that pattern.

## Color palette

Cream is built from **one** `--cream-rgb` triplet so every tint derives from a single
source — adjust the triplet and all four cream values follow. Change colors here, never as
literals in component files.

| Token | Value | Role |
|-------|-------|------|
| `--bg` | `#070707` | Near-black page ground |
| `--bg-card` | `#323236` | Raised card surfaces |
| `--bg-blue` | `#33616d` | Teal CTA band; interior-page hero override |
| `--bg-overlay` | `20, 20, 24` (rgb triplet) | Base for `rgba()` dark overlays |
| `--cream-rgb` | `242, 232, 185` | The one source for all cream |
| `--cream` | `rgb(var(--cream-rgb))` | Body text on dark |
| `--cream-dim` | cream @ `0.55` | Secondary text |
| `--cream-faint` | cream @ `0.12` | Faint fills / dividers |
| `--border-faint` | cream @ `0.07` | Hairline section borders |
| `--gold` | `#c9a84c` | Eyebrows, accents, rules |
| `--gold-light` | `#e2c47a` | Hero italic emphasis |
| `--text-blue` | `#7392c5` | `h2` section headings |

> `var(--surface)` appears in `nav.css` (burger-hover) and is **intentionally undefined** —
> it resolves to no background, which is the intended look. Don't invent a value for it.

## Type system

All serif, four families with distinct jobs. Fluid `clamp()` scale (`--text-xs` →
`--text-2xl`, plus `--text-script`). Weights: `400` regular, `500` medium, `700` bold.

| Family | Token | Used for |
|--------|-------|----------|
| DM Serif Display | `--font-display` | Hero `h1`, stat numbers, pricing prices, testimonial marks, how-it-works numerals |
| Cinzel | `--font-title` | Section `h2` (teal) and `h3` eyebrows (gold, uppercase, `0.3em` tracking), form labels |
| Fauna One | `--font-body` | Body copy, paragraphs |
| Tangerine | `--font-script` | The "Kreutzer" wordmark only ([`nav.css`](src/css/nav.css), [`footer.css`](src/css/footer.css)) |

Heading conventions, set in [`sections.css`](src/css/sections.css): `h3` is a gold
uppercase eyebrow; `h2` is the teal Cinzel section title; the hero `h1` is cream
`DM Serif Display` at `--text-2xl` with an italic `--gold-light` `<em>`.

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

## Guardrails — NEVER, in this codebase

- **No sans-serif** as display or body. The all-serif stack is the identity. No
  Inter/Roboto/Space Grotesk/Geist.
- **No new color literals** in component files — go through `tokens.css`; derive from the
  cream triplet or a named token. Don't "fix" the intentionally-undefined `--surface`.
- **No SaaS blue or purple→blue gradients.** The only blues are the muted `--bg-blue` and
  `--text-blue`.
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
4. Match the voice: serif, gold eyebrow → teal Cinzel title → cream body. Restraint over
   decoration.
