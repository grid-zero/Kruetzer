# Design — Motion System ("bring the site to life")

**Date:** 2026-06-14
**Status:** Draft for review
**Method:** brainstorming → writing-plans → subagent-driven-development

## Goal

Replace the site's single blanket scroll-fade with a small, deliberate **motion
vocabulary** so the site reads as *designed* rather than uniformly *animated* — while
staying true to the candlelit-editorial identity in `DESIGN.md`. One signature cinematic
moment on the homepage hero; restrained, varied reveals everywhere else.

## Direction (settled with the client)

- **Character: curated mix.** A restrained vocabulary site-wide, plus 1–2 cinematic hero
  moments. Not maximalist; not a uniform fade either.
- **Tech: CSS-only, no-JS safe.** Extend the existing `IntersectionObserver` + a richer set
  of CSS classes. No animation libraries, no smooth-scroll runtime. The single exception is
  the stat **count-up**, which needs a few lines of JS — and degrades to a static final
  value with JS off.
- **Surfaces: all four** — homepage hero, section reveals, numbers & accents,
  micro-interactions.

### Parallax resolution

True **scroll-linked parallax is out of scope** — it requires the scroll-driven-CSS or JS
layer the client declined. The cinematic hero moment is delivered instead by a **CSS-only
Ken Burns drift** (slow scale/pan on the hero photo) plus the word-by-word + blur entrance.
Same payoff, zero scroll dependency, degrades cleanly.

## What exists today (baseline)

- **`src/css/reveal.css`** — `.reveal` is visible by default; `.js .reveal` hides it
  (`translateY(28px)`, `opacity:0`) and transitions to `.visible`. One gesture
  (`opacity 1.65s, transform .65s`) is applied to *everything*. `.reveal-delay-1/2/3` adds a
  small manual stagger in places.
- **`src/index.js`** — an `IntersectionObserver` (threshold `0.1`) adds `.visible` and
  unobserves. This mechanism is kept as-is.
- **`src/css/sections.css`** — the hero (`section[intro]`) already does a staged CSS
  `fadeUp` cascade on load (h3 → h1 → p → button). This is the template the rest should
  aspire to. The hero photo is currently a `background-image` directly on the section.
- **`src/css/keyframes.css`** — `fadeUp`, `fadeIn`, `slideIn`, `shimmer`.

## Constraints (must hold)

From `CLAUDE.md` and `DESIGN.md`:

- **No-JS fallback preserved.** Content visible and static without JavaScript. The count-up
  must render the final number from the HTML when JS is off.
- **`prefers-reduced-motion: reduce` respected.** Users who ask for less motion get instant,
  static reveals — no transitions, no drift, no count animation. This is a first-class
  requirement, not an afterthought.
- **Relative asset paths only** (GitHub Pages project subpath).
- **Tokens, not literals.** New easings/durations live in `tokens.css`; new `@keyframes` in
  `keyframes.css`. Component files reference tokens.
- **All-serif identity and existing palette unchanged.** This is motion only — no new
  colors, fonts, or layout.
- **Keep the existing reveal mechanism.** Extend it; don't replace the
  `IntersectionObserver` or the visible-by-default model.

## The motion vocabulary

The variants are **transition-based**, exactly like the current `.reveal` — a hidden
resting state under `.js`, transitioning to the `.visible` state the observer adds. This
keeps the no-JS fallback automatic (no `.js` → no hidden state → content shown).

| Class (compose onto `.reveal`) | Hidden state → visible | Applied to |
|--------------------------------|------------------------|------------|
| `.reveal` (unchanged) | `translateY` + fade | default / body copy |
| `.reveal--left` | `translateX(-…)` + fade → none | `section[about]` text column, left-aligned blocks |
| `.reveal--right` | `translateX(+…)` + fade → none | `section[about]` photo, right-aligned blocks |
| `.reveal--wipe` | `clip-path: inset(0 100% 0 0)` → `inset(0)`, opacity stays 1 | selected `h2` section titles (used sparingly) |
| `.reveal--blur` | `blur()` + slight `scale` + fade → sharp | section intros, the Phoebe bio photo |
| `.reveal-stagger` (parent) | staggers its direct `.reveal` children via `nth-child` `transition-delay` | instruments grid, pricing cards, how-it-works steps |

Implementation notes:

- The base `.js .reveal` transition list expands to cover the new properties:
  `opacity`, `transform`, `filter`, `clip-path` (each with a token duration/easing). Opacity
  timing is tuned down from the current `1.65s` to something tighter (≈`0.7s`) so reveals
  feel intentional, not sluggish.
- `.reveal--wipe` neutralizes the base `opacity:0` (a wipe reveals via the mask, not a fade).
- `.reveal-stagger` defines incremental delays for ~6 children; it composes with, and
  supersedes the need for, hand-placed `.reveal-delay-*` on grids. Existing
  `.reveal-delay-*` classes stay for one-off cases.
- **Restraint rule (so wipe/blur don't tire):** `--wipe` is used on **at most one `h2` per
  page** (the lead section title); `--blur` is reserved for intro/`section[about]` contexts
  and the Phoebe bio photo. The plan **enumerates the exact target elements** on each page —
  this spec sets the policy, the plan removes the guesswork.

## Hero — the signature moment (`section[intro]`, homepage)

CSS-only, runs on load (not scroll-gated), homepage only:

1. **Word-by-word `h1`.** The heading is split into `<span class="word">` per word; each
   word rises (reuse `fadeUp`) on a short incremental `animation-delay`. Replaces the
   single-block `h1` fade currently in `sections.css`. The italic-gold `<em>` ("*Art*")
   stays — it becomes one of the staggered words.
2. **Blur settle.** The hero copy resolves from a faint blur as it rises (atmospheric, on
   brand). Eyebrow/paragraph/button keep their existing staggered `fadeUp`.
3. **Ken Burns drift.** The hero photo moves from a `background-image` on the section to a
   `::before` layer (absolutely positioned, `background-size: cover`) so it can `transform:
   scale()` smoothly on the GPU without affecting layout or content. A slow, subtle
   keyframe (`kenBurns`, ≈`scale(1)→scale(1.06)` over ~28s, `infinite alternate`,
   ease-in-out) gives continuous life. Disabled entirely under reduced-motion.

This is the only place word-splitting and Ken Burns are used — overuse would cheapen it.

## Numbers & accents

- **Count-up stats** (`company-stats`: 10+, 5, 100%). Each number carries `data-count` and
  `data-suffix`, with the *final* value as its text content (so no-JS shows it). A new
  guarded block in `index.js`, triggered by the same `IntersectionObserver` pattern, tweens
  0 → target with `Math.round`. It checks `matchMedia('(prefers-reduced-motion: reduce)')`
  and snaps to the final value when reduced motion is requested. Element-guarded so pages
  without stats are unaffected.
- **Gold underline-draw.** This gesture **already exists** in the nav — a gold
  `scaleX(0)→scaleX(1)` underline on hover plus a persistent underline on the active /
  `aria-current` link ([`nav.css:49-65,153-157`](src/css/nav.css:49)), already on the
  `--gold`/`--t-mid`/`--ease` tokens. That is the **canonical implementation — do not
  re-create it.** Where the spec calls for an underline-draw accent under other
  `h2`s/eyebrows, **reuse a single shared definition** (one utility class consumed by both
  nav and the new accents) rather than pasting a second copy. The plan settles the exact
  utility/home; the nav's existing hover + active-link behavior must be preserved exactly.

## Micro-interactions (pure CSS `:hover`, site-wide)

- **Buttons** (`buttons.css`): `.btn` gets a gold fill-sweep on hover (a `::before` that
  slides in); `.btn-clear` gets a matching treatment. Within the existing palette.
- **Nav** (`nav.css`): **no new underline — it already has one.** The hover underline-draw
  and active-link underline already exist ([`nav.css:49-65,153-157`](src/css/nav.css:49));
  listed here only so the implementation does not duplicate it. Reuse, don't re-add.
- **Cards** (`instruments.css`, `pricing.css`, `testimonials.css`): subtle lift
  (`translateY(-…)` + gold border) on hover.
- **Links**: arrow/`btn-clear` links get the underline-grow.

Each component that adds hover motion carries its **own** `prefers-reduced-motion` guard
(transform dropped, color/border kept), co-located with the component per the repo's CSS
philosophy — rather than `reveal.css` reaching across into `.btn`/`.card` selectors.

## Cross-cutting

- **`tokens.css`** — add a small motion group: a decelerating easing (e.g.
  `--ease-out`) and reveal/wipe/kenburns/hover durations. No timing literals in components.
- **`keyframes.css`** — add `kenBurns`. Hero words reuse `fadeUp`. The reveal variants are
  transition-based and need no keyframes.
- **`reveal.css`** — owns the variants, the `.reveal-stagger` cascade, the expanded base
  transition, **and** the `@media (prefers-reduced-motion: reduce)` block covering the
  reveal system, hero drift, and word animation. (Component hover guards co-locate with
  their components, per above.)
- **`DESIGN.md`** — its Motion section is rewritten to document the vocabulary, the
  reduced-motion rule, and the no-JS rule, so future work composes from this set.

## File change map

| File | Change |
|------|--------|
| `src/css/tokens.css` | New motion tokens (easing + durations) |
| `src/css/keyframes.css` | Add `kenBurns` |
| `src/css/reveal.css` | Variants, `.reveal-stagger`, expanded transition, reduced-motion block |
| `src/css/sections.css` | Hero `::before` photo + Ken Burns + word styling; directional on `section[about]`; wipe/blur on selected `h2`s; stagger on grids |
| `src/css/buttons.css` | `.btn` / `.btn-clear` hover fill-sweep |
| `src/css/nav.css` | **No duplicate underline** — already present; serves as the canonical underline-draw, factored into a shared definition for reuse. Preserve hover + active-link behavior |
| `src/css/instruments.css`, `pricing.css`, `testimonials.css` | Card hover-lift |
| `src/index.js` | Guarded, reduced-motion-aware count-up |
| `src/index.html` (+ any page with the relevant blocks) | Hero `h1` word spans; gesture modifier classes on existing `.reveal`s; `.reveal-stagger` on grid parents; `data-count`/`data-suffix` on stats |
| `DESIGN.md` | Rewrite Motion section to document the vocabulary |

`index.css` import order is **not** touched — no new component files are introduced; all
changes land in existing files.

## Out of scope

- Scroll-linked parallax, scroll-driven CSS (`animation-timeline`), smooth-scroll, and any
  JS animation library (GSAP/Motion/Lenis).
- New colors, fonts, layout, or content/copy.
- The loader animation, sidebar `slideIn`, and teacher-card flip — existing and working,
  left alone.
- Reworking the `IntersectionObserver` itself or the visible-by-default model.
- New CSS component files (everything fits existing files).

## Verification

- **Build:** `npm run build` succeeds; page count unchanged (12); all stylesheets still
  bundle into `_site/css/index.css`.
- **Grep (bundled output):** `_site/css/index.css` contains the new classes/keyframes
  (`reveal--left`, `reveal--wipe`, `reveal-stagger`, `kenBurns`, `prefers-reduced-motion`);
  `_site/index.html` contains the hero word spans and `data-count` attributes.
- **Manual (human):**
  - Homepage hero: word-by-word entrance + slow Ken Burns drift on the photo.
  - Scroll the homepage: reveals are *varied* (directional on about, stagger on grids,
    wipe/blur on titles), not one uniform fade.
  - Stats count up once on scroll-in.
  - Hover buttons, cards, nav links — sweep / lift / underline respond.
  - **JS disabled:** every section visible and static; stats show their final numbers; no
    Ken Burns, but layout and content intact.
  - **`prefers-reduced-motion: reduce` (OS setting):** reveals appear instantly, no drift,
    no count animation, hover transforms suppressed.
- Responsive spot-check at 1024 / 768 / ~400px — no motion-induced overflow or jank.
