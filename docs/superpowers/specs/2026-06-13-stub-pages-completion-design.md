# Design — Complete the Stub Pages (Lessons, Phoebe, Careers)

**Date:** 2026-06-13
**Status:** Draft for review
**Method:** brainstorming → writing-plans → subagent-driven-development

## Goal

Turn three of the five "Coming Soon" stub pages into real, structured pages by
composing the site's **existing** section components. Prose is left as
descriptive manual-completion prompts (the studio writes the copy by hand);
structure, layout, and reused components are built now.

## Scope

**Build now:** `src/lessons.html`, `src/phoebe.html`, `src/careers.html`.

**Leave as-is (intentional "Coming Soon"):** `src/shop.html`, `src/resources.html`.
There is no inventory or resource content to put on them yet; they keep the
existing blue 30vh "Coming Soon..." placeholder until there is.

**Shared refactor (Approach B):** extract the homepage pricing section into an
Eleventy partial so the homepage and Lessons share one source of truth for
packages/prices.

## Approach

Chosen: **B — reuse existing components + extract the pricing partial.**

Every page is assembled only from section types and class hooks that already
exist and are proven on the homepage and other built pages. **No new CSS.** The
only structural refactor is the pricing-partial extraction below; it is required
because Lessons and the homepage must not carry divergent copies of prices.

Rejected alternatives:
- **A (reuse, duplicate pricing inline):** simplest, but two copies of the
  pricing block means prices can drift — rejected by user, the whole reason for B.
- **C (new "levels" CSS component):** cleaner semantics for the Lessons journey
  section, but introduces new CSS we don't need — the `how-it-works` 3-card
  component already expresses a 3-stage progression well enough.

## Constraints (from CLAUDE.md — must hold)

- **Relative paths only** (`assets/...`, `contact.html`, `css/...`). Never
  root-relative — GitHub Pages serves from a project subpath.
- **No-JS fallback preserved.** Reuse `.reveal` / `.reveal-delay-*` exactly as the
  built pages do; the `.js`-gated hide/reveal in `reveal.css` already handles them.
- **No new CSS files or rules.** If a layout seems to need new CSS, stop and raise
  it rather than inventing styles.
- Interior pages use the **blue 30vh hero override**
  `<section intro style="min-height: 30vh; background: var(--bg-blue);">`, matching
  about/teachers/faq/contact. The full-bleed photo hero is reserved for the homepage.

## Content-prompt convention

Where hand-written prose is required, leave a bracketed prompt that states what to
cover and roughly how long, e.g.:

```html
<p>[Write 2–3 sentences on what a typical lesson feels like — pace, structure,
the teacher's role.]</p>
```

Real, already-known facts are written directly (not left as prompts): instrument
list, price points, Phoebe's instruments/qualifications already on the teachers
card, the `hello@kreutzer.com.au` email.

## Shared refactor — pricing partial

**New file `src/_includes/pricing.html`:** contains the exact `<section pricing>…</section>`
block currently in `src/index.html` (the Trial / 10-lesson pack / Single-lesson
grid with its `.pricing-grid`, `.featured`, and `.reveal*` classes), moved verbatim.

**`src/index.html`:** replace the inline `<section pricing>…</section>` block with
`{% include "pricing.html" %}` at the same position (between `section[testimonials]`
and `section[contact]`).

**`src/lessons.html`:** include the same partial via `{% include "pricing.html" %}`.

**Behavior-preservation requirement:** the homepage's rendered pricing output must
be unchanged. Verify by building before and after and diffing the pricing block of
`_site/index.html` (whitespace-only differences from indentation are acceptable;
content/classes/structure must match).

The `section[contact]` blue CTA band is **deliberately not extracted** — each page's
CTA copy and button label differ (page-specific marketing), so it stays inline.

## Page designs

All three open with the blue 30vh `intro` hero and close with an inline
`section[contact]` CTA band.

### `lessons.html` — focus: experience & levels

| # | Section (existing hook) | Content |
|---|--------------------------|---------|
| 1 | `section[intro]` (blue 30vh) | h3 "Learn With Us" · h1 `Music <em>Lessons</em>` · p intro prompt |
| 2 | `section[default]` | h3 "The experience" · h2 "What a lesson looks like" · prose prompt (pace, structure, teacher's role) |
| 3 | `section[how-it-works]` | h2 "Your journey" · 3 cards: **Beginner → Intermediate → Advanced / Diploma**, each a short prose prompt. Reuses the numbered-circle 3-col layout (numbers 1/2/3). |
| 4 | `section[default]` | h3 "Practicalities" · h2 "Formats & policies" · `.policy-list` of lesson lengths (30 / 45 / 60 min, 1:1) + prompts for cancellation/make-up policy |
| 5 | `{% include "pricing.html" %}` | shared pricing grid (single source of truth) |
| 6 | `section[contact]` | "Ready to begin?" → `.btn` to `contact.html` ("Book a Trial Lesson") |

### `phoebe.html` — teacher bio

| # | Section (existing hook) | Content |
|---|--------------------------|---------|
| 1 | `section[intro]` (blue 30vh) | h3 "Piano & Theory" · h1 `Phoebe <em>Mu</em>` · p one-line tagline prompt |
| 2 | `section[about]` | 2-col grid: left = bio text block (h3/h2 + prose prompt); right = `<img src="assets/phoebe mu.jpg" alt="Phoebe Mu">`. Reuses the about-grid (already styles text+image). |
| 3 | `section[default]` | h3 "Credentials" · h2 "Qualifications" · `.tagline` (e.g. "Licentiate Diplomas — Trinity College London & AMEB") + `.policy-list`; prompt for any additional credentials |
| 4 | `section[default]` | h3 "Philosophy" · h2 "Teaching approach" · prose prompt |
| 5 | `section[contact]` | "Learn with Phoebe" → `.btn` to `contact.html` |

Seed facts pulled from the existing `teachers.html` card: instruments = Piano &
Theory; specialises beginner → AMEB Diploma; Licentiate diplomas (TCL & AMEB).

### `careers.html` — always-hiring expression-of-interest

| # | Section (existing hook) | Content |
|---|--------------------------|---------|
| 1 | `section[intro]` (blue 30vh) | h3 "Join Us" · h1 `Teach at <em>Kreutzer</em>` · p intro prompt |
| 2 | `section[how-it-works]` | h2 "Why Kreutzer" · 3 value cards (e.g. Community / Growth / Flexibility), each a short prose prompt |
| 3 | `section[default]` | h3 "Our people" · h2 "Who we're looking for" · prose prompt |
| 4 | `section[contact]` | single EOI CTA — "We're always keen to hear from great teachers" → `.btn` `mailto:hello@kreutzer.com.au` |

No job-listing structure (per decision: always-hiring EOI, not posted roles).

## Out of scope

- Writing the actual prose (left as prompts for the studio).
- `shop.html`, `resources.html` (stay "Coming Soon").
- Any new CSS, new components, or visual redesign.
- Extracting a CTA partial, or any refactor beyond the pricing extraction.
- Wiring the contact form backend, social URLs, or other pre-existing TODOs.

## Verification

- `npm run build` succeeds; `_site/` contains the updated `lessons.html`,
  `phoebe.html`, `careers.html` and the unchanged count of pages.
- Homepage pricing unchanged: build before/after the partial extraction and diff
  the pricing block of `_site/index.html` (content/classes/structure identical).
- Grep `_site/lessons.html` and `_site/index.html` to confirm both contain the
  shared pricing markup (proves the include resolved on both).
- Each built page contains its `intro` hero and a closing `section[contact]`, and
  every prose prompt is a visible `[…]` bracket (grep for `[Write` / `[Content`).
- **Manual (human):** load the three pages at 1024 / 768 / ~400px — heroes,
  how-it-works cards, the about-grid (Phoebe photo + text), policy lists, and the
  pricing grid render correctly and match the homepage's look; no-JS check that
  `.reveal` content is visible with JavaScript disabled.
