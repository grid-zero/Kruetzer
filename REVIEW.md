# Kreutzer Website — Independent Review

**Reviewer perspective:** outside auditor, no project docs consulted.
**Scope reviewed:** `src/` templates & includes, all CSS, `index.js`, `.eleventy.js`,
deploy workflow, build output. Page *copy* is known-incomplete and is **not** reviewed.

**Overall:** This is a well-organised, genuinely good static site. The design system is
disciplined (one token file, fluid type scale, single colour source), the no-JS fallback
is thoughtfully engineered, and `prefers-reduced-motion` is respected almost everywhere —
which is rare. The issues below are mostly polish, a few correctness bugs, and some
notable gaps for a **local-business** site (structured data, social meta, image
optimisation). Nothing here is catastrophic; the highest-value items are SEO/local-SEO
metadata, the keyboard-inaccessible teacher card, browser-compat hardening for native CSS
nesting, and image performance.

Severity legend: 🔴 High · 🟠 Medium · 🟡 Low · ⚪ Nitpick

---

## 1. Build & Architecture (backend)

The Eleventy setup is lean and sensible: flat permalinks via a directory data file,
Liquid for both HTML and Markdown, and a single `postcss-import` `afterBuild` pass that
inlines the component `@import`s into one `index.css`. Confirmed working — `npm run build`
succeeds and the shipped `index.css` has zero remaining `@import`s.

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 1.1 | 🟠 | **Component CSS files are double-shipped.** `addPassthroughCopy("src/css/*.css")` copies every component stylesheet to `_site/css/`, but the `afterBuild` hook *also* inlines them all into `index.css`. The browser only ever loads `index.css`, so `buttons.css`, `nav.css`, `sections.css`, … are dead files in the output (≈15 orphan requests' worth of surface area, plus they leak your source structure publicly). Either passthrough-copy only `index.css`, or delete the component copies in the hook. | `.eleventy.js:8` |
| 1.2 | 🟠 | **CSS bundling failure is swallowed.** The hook `.catch`es and only `console.error`s. If `postcss-import` ever fails, the build still exits 0 and ships a broken/partial stylesheet silently. Re-throw so CI fails loudly. | `.eleventy.js:24` |
| 1.3 | 🟡 | **Stale `README.md` in output.** `_site/css/README.md` exists even though it's `ignores.add`-ed as a template. Eleventy never cleans `_site/`, so this is a leftover artifact. A clean rebuild (`rm -rf _site`) in CI would avoid shipping stale files; locally it can drift. | `_site/css/README.md` |
| 1.4 | 🟡 | **No asset fingerprinting / cache-busting.** `index.css` and `index.js` ship with stable names. After a deploy, returning visitors can get stale cached CSS/JS. For a brochure site the blast radius is small, but a content hash (or at least a `?v=` query) would be safer. | `base.html:11,21` |
| 1.5 | 🟡 | **No minification.** HTML/CSS/JS are shipped as-authored. Adding `html-minifier`/`cssnano` (or `postcss-preset-env` in the existing PostCSS pass) is cheap and meaningful given the font/image weight. | build pipeline |
| 1.6 | ⚪ | Hardcoded `© 2026` in the footer will need a yearly edit. A computed year (Eleventy global data) removes the maintenance step. | `footer.html:37` |

---

## 2. SEO & Metadata

Per-page `<title>` and `<meta name="description">` are present and well-written, `lang` is
set, and the 404 page exists at the right path for GitHub Pages. Good baseline. The gaps
are the ones that matter most for a **local business** trying to rank and be shared.

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 2.1 | 🔴 | **No structured data (JSON-LD).** A music studio is a textbook `LocalBusiness` / `MusicSchool` schema candidate (name, address, geo, phone, opening hours, price range). This is the single biggest local-SEO lever and is entirely absent — it drives Google's local pack & rich results. The FAQ page is also an obvious `FAQPage` schema win (rich snippet). | `base.html` head, `faq.html` |
| 2.2 | 🔴 | **No Open Graph / Twitter Card meta.** When anyone shares a link (the entire point of a marketing site), there's no title/description/image preview — it'll render as a bare URL on Facebook/Instagram/iMessage/Slack. Add `og:title`, `og:description`, `og:image`, `og:type`, `og:url`, `twitter:card`. | `base.html` head |
| 2.3 | 🟠 | **No canonical URL** (`<link rel="canonical">`). Cheap insurance against duplicate-URL indexing (e.g. trailing-slash vs `.html`). | `base.html` head |
| 2.4 | 🟠 | **No `sitemap.xml` and no `robots.txt`.** Both are trivial to generate in Eleventy and help crawlers. | site root |
| 2.5 | 🟡 | **Heading hierarchy is inverted by the "eyebrow" pattern.** Almost every section uses an `<h3>` *eyebrow* visually above an `<h1>`/`<h2>` (e.g. homepage hero: `<h3>Music Tuition · Canberra</h3>` then `<h1>`; about section: `<h3>Our story</h3>` then `<h2>`). Semantically this puts an h3 *before* the h1/h2, which breaks document outline for SEO and assistive tech (WCAG 1.3.1). The eyebrows are decorative kickers — they should be `<p class="eyebrow">` (or a `<span>`), not headings. This recurs on nearly every page. | `index.html:4,21`, `sections.css` h3 rule, all `section[intro]` |
| 2.6 | 🟡 | `lang="en"` could be `en-AU` for an Australian local business (minor locale signal). | `base.html:2` |

---

## 3. Accessibility

Strong points worth calling out: focus-visible styling is defined globally, form labels
are correctly associated, the burger menu sets `aria-expanded`/`aria-controls` and handles
`Escape`, and reduced-motion is honoured across reveals, hovers, counters and the hero.

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 3.1 | 🔴 | **Teacher card is keyboard- and screen-reader-hostile.** The flip is a `click` listener on a plain `<div>` — not focusable, no `role="button"`, no `tabindex`, no `aria-expanded`, no Enter/Space handling. Keyboard-only users cannot flip the card, so the bio, qualifications, and the **"Learn More" link to `phoebe.html`** are unreachable for them. Worse: the back face uses `backface-visibility:hidden` but its link is still in the tab order, so a keyboard user can focus an *invisible* link. Make the card a real `<button>`/`[role=button][tabindex=0]` with key handling, or restructure so the back content isn't gated behind a mouse-only flip. | `teachers.html:9`, `index.js:120` |
| 3.2 | 🟠 | **Off-screen mobile sidebar stays in the tab order.** `#sidebar` is translated off-canvas but its links remain focusable on load (no initial `aria-hidden`/`inert`). Keyboard focus can disappear off-screen on mobile. Set `aria-hidden="true"` in the markup initially (JS already toggles it) and ideally `inert` when closed. There's also no focus trap / focus-move-into-panel when it opens. | `header.html:27`, `index.js` |
| 3.3 | 🟠 | **Dead sidebar JS — links never get the close/active behaviour.** `index.js` queries `sidebar.querySelectorAll('.sidebar-link')`, but the sidebar `<a>`s carry class `draw-underline`, not `sidebar-link`. The block matches nothing. It happens to "work" only because clicking a link navigates away; but the intended close-on-select / active-state logic is dead code. | `index.js:148-154` vs `header.html:30` |
| 3.4 | 🟡 | **`<nav-logo-main>Kreutzer</nav-logo-main>` is read by screen readers** as a duplicate "Kreutzer" alongside the logo image's `alt="Kreutzer"`. It's purely decorative (it overlays the wordmark). Mark it `aria-hidden="true"`. | `header.html:18` |
| 3.5 | 🟡 | **Verify gold-on-blue contrast.** `--gold #c9a84c` on `--bg-blue #33616d` (table `<th>`, some accents) is around ~2.3:1 — below WCAG AA for text. Also `--cream-dim` (0.55 alpha) on dark for footer body text is borderline. Worth a contrast pass. | `terms.css` th, `footer.css` |
| 3.6 | 🟡 | **No skip-to-content link** before the sticky header — a standard keyboard nicety, especially with a repeated nav. | `base.html` |
| 3.7 | ⚪ | `scroll-behavior: smooth` is global and ignores `prefers-reduced-motion`. Guard it inside the no-preference query. | `reset.css:9` |
| 3.8 | ⚪ | The loader animation runs even under reduced-motion (the rest of the site respects it). It's brief, but for consistency consider skipping the fill animation when reduced-motion is set. | `index.js`, `loader.css` |

---

## 4. HTML structure & semantics

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 4.1 | 🟠 | **Malformed markup: stray `<div>` instead of `</div>`.** In the homepage Instruments section, the inner wrapper is *opened* a second time where it should close: line 47 is `<div>` immediately before `</section>`. Browsers auto-correct, but it's invalid nesting and will bite anyone who touches that block (and trips HTML validators). | `index.html:47` |
| 4.2 | 🟡 | **Empty headings/paragraphs on placeholder pages.** `shop.html` and `resources.html` contain `<h3></h3>` and `<p></p>`. Empty headings are an accessibility/validator flag — drop the empty elements rather than ship hollow ones. (Distinct from the missing *copy*, which is out of scope.) | `shop.html:6,9`, `resources.html:6,9` |
| 4.3 | 🟡 | **Emoji used as brand/social icons.** Footer social links use 📷 📘 ▶️. These render inconsistently across OS/browser, look unpolished, and are semantically odd even with `aria-label`. Use inline SVG icons. | `footer.html:8-10` |
| 4.4 | ⚪ | Custom-element-like tags (`<company-story>`, `<nav-logo-main>`, `<testimonial-quote>`, boolean attrs like `<section intro>`) are valid HTML used purely as CSS hooks. Defensible, but worth knowing they convey **no** semantics — e.g. `<section about>` with no accessible name is just a generic region. The `id="…-heading"` attributes on h2s suggest `aria-labelledby` was intended on the sections but isn't wired up. | throughout |
| 4.5 | ⚪ | Stray empty `class=""` on the contact `<form>` and a `<p >` with an extra space — harmless leftovers. | `contact.html:14,68` |
| 4.6 | ⚪ | Footer lists both "Contact" and "Book a lesson" pointing to `contact.html` — duplicate destination. | `footer.html:24-25` |

---

## 5. CSS architecture

The token system and component split are genuinely well done. Main risks are brittleness
(deep structural selectors) and a couple of dead rules.

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 5.1 | 🟠 | **Fragile positional selectors.** Several layouts target structure by depth/position, e.g. `> div > div > div > :first-child`, `:nth-child(2)`, and `company-stats > div > div:has(+div)`. These break the moment markup nesting changes and are hard to read. Prefer class hooks (you already have a clean class convention elsewhere). | `sections.css` (how-it-works, about) |
| 5.2 | 🟡 | **No-op hover: `background: var(--surface)`** on `.burger-btn:hover` — `--surface` is not defined in `tokens.css`, so the declaration is dropped and the hover background does nothing. (Border-color still changes.) Either define the token or remove the line. | `nav.css:88` |
| 5.3 | 🟡 | **Dead loader rule.** `.loader-wrap.done .piano-ghost` never matches — the element's class is `ghost` (`<img class="piano ghost">`), so the selector should be `.piano.ghost`. The intended ghost fade-out on completion doesn't run. | `loader.css` done-state, `loader.html:4` |
| 5.4 | 🟡 | **Repeated inline styles instead of a class.** Every sub-page hero repeats `style="min-height:30vh; background:var(--bg-blue)"`, and the pricing CTAs repeat `style="width:100%;justify-content:center;"`. This is duplicated ~8× and ~3× respectively. A `section[intro][sub]` variant and a `.btn-block` class would DRY it up and keep styling out of templates. | all sub-pages, `pricing.html` |
| 5.5 | 🟡 | **`!important` specificity battle** on `.tagline` (color + font-size). Usually a sign a more specific selector elsewhere is overreaching; worth untangling rather than forcing. | `terms.css:1-8` |
| 5.6 | ⚪ | Redundant duplicate `top` declaration in the mobile logo rule (`top:50%` then `top:var(--space-sm)`), plus a leftover "Subtle grain overlay" comment with no grain. Minor cleanup. | `nav.css` mobile block, `loader.css:1` |

---

## 6. Performance

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 6.1 | 🟠 | **Images aren't optimised or responsive.** `IMG_5717.jpg` (215 KB hero) and `phoebe mu.jpg` (114 KB) are unoptimised JPEGs, served full-size to every device. No WebP/AVIF, no `srcset`/`<picture>`, no responsive sizing. Eleventy's official `@11ty/eleventy-img` plugin would generate modern formats + responsive variants automatically. Biggest real-world payload win. | `assets/`, `index.html`, `phoebe.html`, `teachers.html` |
| 6.2 | 🟠 | **No `width`/`height` on any `<img>` (0 of them).** This causes layout shift (CLS) as images load — a Core Web Vitals penalty. Add intrinsic dimensions (or CSS `aspect-ratio`). | all `<img>` |
| 6.3 | 🟡 | **Four Google font families, render-blocking.** `DM Serif Display`, `Cinzel` (400+700), `Fauna One`, and `Tangerine` (400+700) load via a blocking external `<link>`. `Tangerine` appears to be used only for the script wordmark + footer h3. `preconnect` and `&display=swap` are correctly in place (good), but consider self-hosting + subsetting, or dropping a family, to cut the font payload and a third-party round-trip. | `base.html:12-14` |
| 6.4 | ⚪ | Non-ASCII / spaced asset filenames (`Kreutzer-源文件2修改颜色-.svg`, `phoebe mu.jpg`) work via URL-encoding but are fragile and unprofessional in URLs. Rename to ASCII, hyphenated. | `assets/` |

---

## 7. Browser compatibility

This is the area most likely to surprise you in the wild, because the build does **not**
transpile or autoprefix modern CSS — `postcss-import` only inlines `@import`s.

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 7.1 | 🟠 | **Native CSS nesting is used un-transpiled** (`&`, nested `>` rules in `instruments.css`, `sections.css`, `pricing.css`, `contact-form.css`, `loader.css`, `testimonials.css`). Native nesting only parses in reasonably recent browsers (broadly mid-2023+). On older Safari/Android-WebView, **entire nested blocks are dropped**, not gracefully degraded — large parts of the layout would break. For a public-facing local business, add `postcss-preset-env` (or `postcss-nesting` + `autoprefixer`) with a `browserslist` to flatten nesting and add prefixes. You already run PostCSS in the build, so this is low-effort. | multiple CSS files |
| 7.2 | 🟡 | **`:has()`** is used (`company-stats > div > div:has(+div)`). Well-supported in current browsers but absent in older Firefox/Safari, where those stat numbers lose their styling. Acceptable as progressive enhancement — just be aware it's a hard dependency for that visual. | `sections.css` |
| 7.3 | ⚪ | `animation-timeline: view()` (scroll-scrubbed testimonials) is correctly guarded by `@supports` + reduced-motion, with a visible fallback. This one is done right — noted as a positive. | `testimonials.css` |
| 7.4 | ⚪ | No `browserslist` declared anywhere, so even if you add autoprefixer it has no target. Define your support baseline explicitly. | `package.json` |

---

## 8. JavaScript

Single vanilla file, loaded `defer`, and every feature block guards for its elements so it
can't throw on pages lacking a loader/burger — this is the right pattern and it's applied
consistently.

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 8.1 | — | See **3.1** (teacher flip: no keyboard support) and **3.3** (dead `.sidebar-link` block) — both are primarily JS issues. | `index.js` |
| 8.2 | 🟡 | **No focus management for the mobile menu.** Opening the sidebar doesn't move focus into it, and there's no focus trap; closing doesn't restore focus to the burger button. The `Escape` handling and `aria-expanded` toggling are good — this is the missing piece. | `index.js:124-146` |
| 8.3 | ⚪ | The loader uses a hand-rolled `easeProgress` with an unused/odd S-curve and then snaps to 100%; it's purely cosmetic (simulated, not real load progress). Fine for effect, just noting it's decorative timing, not actual loading. | `index.js:8-44` |

---

## 9. Security & correctness (launch blockers)

| # | Sev | Finding | Location |
|---|-----|---------|----------|
| 9.1 | 🔴 | **Contact form is non-functional.** `action="https://formspree.io/f/YOUR_FORM_ID"` is a placeholder — submissions will fail until a real endpoint is set. The honeypot field and `mailto:` fallback are good design, but this is a hard launch blocker for a lead-gen site. | `contact.html:16` |
| 9.2 | 🟡 | **Footer social links are `href="#"` placeholders** — clicking jumps to top of page. Already TODO-flagged in the markup; flagging here as a pre-launch checklist item. | `footer.html:8-10` |
| 9.3 | ⚪ | No external-link `rel="noopener"` anywhere, but there are currently no `target="_blank"` links, so nothing to fix today — keep in mind if any get added. | — |

Positive: the deploy workflow uses least-privilege `permissions`, pinned major action
versions, `concurrency` cancellation, and `npm ci` against the lockfile — clean and
correct.

---

## 10. Highest-value quick wins (suggested order)

1. **9.1** — wire up the real Formspree endpoint (blocks lead capture).
2. **2.1 / 2.2** — add JSON-LD `LocalBusiness`/`MusicSchool` + Open Graph meta (biggest SEO/share ROI, all in `base.html`).
3. **7.1** — add `postcss-preset-env` + `browserslist` so native nesting can't break older browsers.
4. **3.1** — make the teacher card keyboard-accessible (currently hides a whole page link from keyboard users).
5. **6.1 / 6.2** — adopt `@11ty/eleventy-img` and add image dimensions (payload + CLS).
6. **4.1 / 5.2 / 5.3 / 3.3** — fix the small correctness bugs (stray `<div>`, undefined `--surface`, dead `.piano-ghost`/`.sidebar-link`).
7. **2.5** — convert eyebrow `<h3>`s to non-heading elements to fix the document outline.

---

*Note: a few findings reference `src/css/README.md` only incidentally (it surfaced in a
grep); per scope, no Markdown was read for design rationale and all conclusions are drawn
from the code itself.*
