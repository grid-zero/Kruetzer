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

- **Hero entrance:** staggered `fadeUp` at `0.3s / 0.45s / 0.6s / 0.75s` using `--ease`.
- **Scroll reveal:** `.reveal` elements animate in on intersection; `.reveal-delay-*` adds
  the stagger.
- **Sidebar:** `slideIn` from `60vw`. **Loader:** `shimmer`. Keyframes in
  [`keyframes.css`](src/css/keyframes.css); easings `--ease` and `--ease-emphatic` in tokens.

**No-JS fallback is load-bearing — preserve it.** `.reveal` content is visible by default;
only `.js .reveal` hides-then-animates it, and the loader displays only under `.js`. The
site must read correctly with JavaScript disabled. (Details in
[`src/css/README.md`](src/css/README.md) and [`CLAUDE.md`](CLAUDE.md).)

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
