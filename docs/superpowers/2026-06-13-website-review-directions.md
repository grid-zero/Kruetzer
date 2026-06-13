# Kreutzer Website — Review & Improvement Directions

**Date:** 2026-06-13  
**Author:** grid-zero  
**Commit:** 353cc1b  
**Branch:** main  
**Status:** ready for discussion  
**Revision:** 2 — incorporates adversarial critique findings

---

## Executive Summary

The Kreutzer website has a strong visual identity and a clean build foundation, but it is **further from launch than a casual inspection suggests**. The homepage is polished and the dark-themed design system is distinctive for a music tuition business. However, the site cannot yet serve its core business purpose: **the contact form silently discards submissions**, the teacher page is 75% fake duplicate data, 5 pages are empty stubs, the about page is malformed HTML with joke placeholder text, and there are real bugs in the CSS loader animation. 

The CSS delivery mechanism — 15 `@import` statements resolved at browser runtime — is a **launch-blocking performance defect**, not a polish item. Combined with 4 render-blocking Google Fonts and unoptimized images, the first-load experience is poor.

**Revised assessment:** The site is roughly 40% complete when accounting for bugs, missing infrastructure (404, sitemap, contact fallback), and content gaps that undermine trust signals.

---

## 1. Current State Inventory

### 1.1 Page-by-page status

| Page | Status | Notes |
|------|--------|-------|
| **index.html** | ✅ Polished | Hero, about blurb, instruments, how-it-works, testimonials (3), pricing (3 tiers), contact CTA. 7 named sections with scroll-reveal animations. No-JS hardened. Micro-issue: `$50/ 30 min` vs `$60 / 30 min` have inconsistent spacing around the slash (`src/index.html:127, 133`). |
| **contact.html** | 🟡 Substantial | Full form. Posts to `#` — **not wired**. No phone number, email, or physical address visible on the page itself. Prospect has zero fallback contact method. |
| **teachers.html** | 🔴 Broken | 4 flip-cards. Card 1 = Phoebe Mu (real person, real data). Cards 2-4 = duplicate "Julian Thorne" — same photo, same bio, same instrument. All 4cards use the same `phoebe mu.jpg` image. **Accessibility violation:** 3 of 4 images have `alt="Phoebe Mu"` but display "Julian Thorne" — screen readers announce the wrong name. |
| **about.html** | 🔴 Broken | Joke placeholder text ("We are cool", "Our studio is ...."). **Malformed HTML:** `<div>` on line 6 is never closed — `</section>` on line 10 terminates the section while the div is still open (`src/about.html:5-10`). Also contains empty `<p></p>` creating a layout ghost. |
| **faq.html** | 🟡 Decent | 4 real Q&As + contact CTA. Trust anti-pattern: the address answer ("Our dedicated studios are located in the heart of Canberra…") deliberately withholds the studio address until booking (`src/faq.html:30-33`). |
| **terms.html** | 🟡 Decent | Detailed tuition policies + full pricing table with 30/45/60min tiers. Uses "G7+" column headers with no explanation (`src/terms.html`). |
| **lessons.html** | ⬜ Stub | Coming Soon. In main navigation. |
| **shop.html** | ⬜ Stub | Coming Soon. In main navigation. |
| **resources.html** | ⬜ Stub | Coming Soon. In main navigation. |
| **careers.html** | ⬜ Stub | Coming Soon. In main navigation. |
| **phoebe.html** | ⬜ Stub | Coming Soon. Linked from Phoebe's teacher card. |

### 1.2 Asset inventory

| Asset | Size | Referenced? | Status |
|-------|------|-------------|--------|
| `IMG_5717.jpg` | 220 KB | Yes — hero CSS background on homepage | In use, unoptimized |
| `IMG_5717.webp` | **3.7 MB** | **No** — dead code | **Delete.** 17× larger than JPG, deployed to production via passthrough copy |
| `IMG_5716.jpg` | 180 KB | **No** — dead code | **Delete** or use if intended for a page |
| `Sydney-Competition-homepage.jpg` | ? | **No** — dead code | **Delete** or place on an about/community page |
| `phoebe mu.jpg` | ? | Yes — all 4 teacher cards | Should be split into individual teacher photos |
| `hand-drawn-piano-drawing-illustration.png` | ? | **No** — dead code (grep yields zero matches) | **Delete** |

Empty directory: `teachers/` exists at repo root with zero files — zombie directory from prior structure.

### 1.3 Technical foundation

| Attribute | Assessment |
|-----------|-----------|
| **Build system** | Eleventy 3.0.0 (`.0` release — one dependency). Clean config, shared base layout, header/footer partials from `_includes/`. 11tydata.js permalink rule handles `page.fileSlug` being `""` for index.html. |
| **CSS architecture** | 15 component files with `@import` cascade in `index.css`. Token-based design system via custom properties. The file organization is good — **but the delivery mechanism is broken.** Eleventy passes CSS through via `addPassthroughCopy`, meaning the browser resolves all 15 `@import` statements as sequential blocking requests. No bundling step exists. |
| **Design system** | Dark theme (`#070707` + cream `rgb(242,232,185)` + gold `#c9a84c` + blue `#33616d`). 4-font stack: DM Serif Display (headings), Cinzel (title labels), Fauna One (body), Tangerine (script/accent). The design system itself is cohesive and well-executed. |
| **Progressive enhancement** | No-JS path intact: `.reveal` visible by default; animations + loader are JS-enhanced only. |
| **Responsive** | Breakpoints at 480px, 600px, 768px, 1024px. Burger menu + slide-out sidebar. Grid layouts collapse correctly. |
| **Deploy** | GitHub Actions → GitHub Pages (`_site/` artifact). Deploys on push to `main`. |
| **Known bugs** | CSS loader ghost styles never apply (see §2.4). about.html malformed HTML. `keyframes.css` uses `translate` property without `transform` fallback. No 404 page. |
| **Known deferred** | Form backend (`#`), social URLs (`#`), Julian Thorne duplicates, stub pages, dead assets. |

---

## 2. Launch-Blocking Issues

These prevent the site from serving its business purpose and must be resolved before go-live.

### 2.1 CSS delivery — 15 sequential blocking @import requests (BLOCKER)

**Current:** `src/css/index.css` contains 15 `@import` directives. Eleventy copies CSS files through without processing (`addPassthroughCopy`). The browser must fetch `index.css`, discover 15 `@import` statements, and request each **sequentially** — one blocks the next. Combined with 4 Google Fonts (also render-blocking), the critical rendering path is:

```
HTML → index.css → tokens.css → keyframes.css → reset.css → ... → terms.css
                    ↓ (concurrent but discovered late)
               Google Fonts CSS → 4 font files
```

First paint is delayed by this entire chain. On mobile or slow connections this is a multi-second delay.

**This is a build-system defect, not a performance optimization.** The CSS architecture (15 organized component files) is correct. The delivery mechanism (runtime `@import`) is broken.

**Fix:** Add a build step to resolve `@import` into a single bundled CSS file. Options:
- PostCSS with `postcss-import` plugin (5-minute setup)
- Simple Node concatenation script as an Eleventy build hook
- Eleventy filter or transform that reads and inlines imports

**Effort:** ~15 minutes. Belongs in Phase 1 alongside form wiring.

### 2.2 Contact form — not wired + no spam protection (BLOCKER)

**Current:** `<form action="#" method="POST">` — submits nowhere. Additionally, `src/contact.html` has no phone number, email, or address visible on the page — a prospect who lands here has **zero way to contact the business** if the form doesn't work.

**Recommended:** Formspree (free tier: 50 submissions/month). The 1-line `action` change works, but **also add a honeypot spam field:**
```html
<input type="text" name="_gotcha" style="display:none">
```
And add the business phone number and email to the contact page itself as a fallback — not just in the footer.

### 2.3 Teacher card data (BLOCKER)

**Current:** 1 real card + 3 identical "Julian Thorne" duplicates. All use the same photo. All four images share `alt="Phoebe Mu"` — a WCAG 1.1.1 violation (alt text does not describe 3 of 4 images). Screen reader users hear "Phoebe Mu" announced for cards that display "Julian Thorne."

**Required:**
- Real teacher data (names, instruments, photos, bios) or reduce to only the real teachers
- Unique photos per teacher
- Correct `alt` text per image
- Link targets (phoebe.html detail page or contact form)

### 2.4 Known bugs in source code

#### CSS nesting bug — loader ghost piano styles never apply
**File:** `src/css/loader.css:34-37`

```css
.piano {                     /* element with class "piano" */
    .ghost {                 /* ← CSS Nesting: ".piano .ghost" (descendant!) */
      opacity: 0.12;
      filter: invert(1);
    }
}
```

**File:** `src/_includes/loader.html:3`
```html
<img class="piano ghost" src="assets/keyboard.png" alt="">
```

The `.ghost` class is on the **same element** as `.piano`, but CSS Nesting without `&` generates a descendant combinator (`.piano .ghost` — an element with class `ghost` *inside* an element with class `piano`). The intended selector is `&.ghost` (`.piano.ghost` — same element with both classes). **As written, `opacity: 0.12` and `filter: invert(1)` never match.** The ghost piano renders at full opacity without inversion — the "faint white outline" effect is never produced.

**Fix:** Change `.ghost` to `&.ghost` on line 35 of `loader.css`.

#### Malformed HTML in about.html
**File:** `src/about.html:5-10` — unclosed `<div>` inside `<section>`. See §1.1 above.

#### Missing `aria-controls` on burger button
**File:** `src/_includes/header.html:16` — `<button id="burgerBtn">` toggles `aria-expanded` on itself and `aria-hidden` on the sidebar, but never declares `aria-controls="sidebar"`. This is a WCAG 4.1.2 violation — the button-to-menu relationship is invisible to screen readers.

**Fix:** Add `aria-controls="sidebar"` to the burger button. One attribute. Phase 1.

#### `translate` property without `transform` fallback
**File:** `src/css/keyframes.css:8-14` — `@keyframes slideIn` uses the `translate` property (not `transform: translateX()`). The `translate` shorthand has ~94% support but is absent from Safari < 14.1. Testimonials slide-in animation silently fails on older iOS devices.

**Fix:** Add `transform: translateX(60vw)` as a fallback line above `translate: 60vw 0`.

#### No 404 page
There is no `404.html`. GitHub Pages serves its default (white background, GitHub branding) — completely off-brand. A static site needs a styled 404 page.

---

## 3. Content & Structure — Improvement Directions

### 3.1 What to do with the 5 stub pages

#### `lessons.html`
**Build it out.** This is the second-most-important page. **Critical content gaps on the current site that this page must address:**
- **Does Kreutzer teach 1-on-1 or groups?** Nowhere on the site is this stated. It is the #1 question a prospect has.
- Lesson duration options and who they suit (30/45/60 min) — currently only visible buried on the terms page
- What "G7+" means in the pricing table (Grade 7+ AMEB/Trinity)
- Instrument-by-instrument detail expanding on the homepage tile grid
- Pricing reference (link to terms page)

#### `shop.html`
**Remove from nav or build minimally.** A "Coming Soon" in the main nav hurts credibility more than its absence. If there is genuinely no shop, remove it. If there are a few items (sheet music, accessories), a simple page with 5-6 affiliate links to Booktopia/Amazon is better than a stub.

#### `resources.html`
**Build or merge into lessons page.** The review's v1 over-stated the SEO value of a generic resources page. For a **local Canberra business**, local SEO (Google Business Profile, NAP consistency, location-keyworded pages) drives far more discovery than generic music education content. A resources page is useful for existing students and modest SEO, but is lower ROI than it first appears. Consider embedding practice tips and recommended books directly on the lessons page instead of maintaining a separate page.

#### `careers.html`
**Remove from main nav.** A small music tuition business rarely needs a permanent careers page. Options:
1. Remove entirely
2. "Join Us" blurb on the about page
3. Footer-only link (keep in "More pages" list, drop from main nav)

#### `phoebe.html`
**Build it out.** The only teacher bio page, linked from the only real teacher card. Full bio, qualifications, teaching philosophy, photos, direct booking CTA.

### 3.2 About page

Must be rewritten from scratch — current text is joke placeholder with malformed HTML. Content plan:
- **Origins**: when founded, by whom, why "Kreutzer"
- **Philosophy**: teaching approach, community focus, 1-on-1 vs group clarity
- **Studio**: real photos of the Canberra space, actual address (not hidden behind booking — see §3.4)
- **Team**: brief teacher intros linking to teachers.html
- **Community**: recital photos, student achievements

### 3.3 FAQ expansion

Current 4 questions cover basics. Suggested additions:
- What ages do you teach?
- Can I do AMEB/Trinity exams through Kreutzer?
- What happens in a trial lesson?
- Do you offer online lessons?
- What's your teaching style and methodology?

**Trust issue to fix:** The current FAQ answer about location (`src/faq.html:30-33`) withholds the studio address until after booking. This signals either a home-based business that's embarrassed about it, or one that doesn't want walk-ins — both undermine trust. Display the actual studio address (or at minimum the suburb).

### 3.4 Trust & Conversion Gaps

These are structural problems that undermine the site's ability to convert visitors:

| Gap | Location | Impact |
|-----|----------|--------|
| **No phone number above the fold** | Header and all pages except footer | Many parents booking for children prefer to call. Phone number only exists in the footer. |
| **No contact fallback on contact page** | `src/contact.html` | If the form breaks or the user prefers email/phone, they have no alternative. Add phone + email to the contact page body. |
| **Address hidden** | `src/faq.html:30-33` | "We'll tell you where we are after you book" is a trust anti-pattern. |
| **Lesson format unclear** | All pages | 1-on-1? Groups? Both? Never stated. |
| **"G7+" unexplained** | `src/terms.html` pricing table | Jargon. Must define or link to an explanation. |
| **No CTA above the fold on subpages** | All non-homepage pages | Only the header "Enquire now" button. Sub-page heroes describe the page but don't convert. |
| **Social proof is anonymous** | Testimonials | First name + initial only. Adding real names (with permission) or photos increases trust significantly. |

### 3.5 Testimonials

Current 3 are well-written but anonymous. For credibility:
- Add 2-4 more (5-7 total)
- Use real first names and instrument (with permission)
- Consider a dedicated section on the about page with longer quotes

---

## 4. Local SEO & Google Business Profile

The v1 review focused on on-page SEO (meta tags, sitemap, schema). For a Canberra-based service business, **Google Business Profile (GBP) is far more impactful** than any on-page optimization. The primary discovery channel is "music lessons Canberra" — GBP (with reviews, photos, accurate NAP) drives the local pack results.

**Required (not optional):**
- Create/claim the Google Business Profile for Kreutzer
- Ensure NAP (Name, Address, Phone) is consistent across: GBP, website footer, contact page, schema.org JSON-LD
- Encourage happy students/parents to leave Google reviews
- Add photos of the studio, teachers, recitals to the GBP listing

**On-page SEO (still valuable):**
- Add Open Graph + Twitter Card meta tags to base layout
- Add `LocalBusiness` schema.org JSON-LD (must match GBP exactly)
- Generate `sitemap.xml` (Eleventy plugin) and `robots.txt`
- The `resources.html` page is modestly useful for SEO; the lessons page optimized for "music lessons Canberra" + instrument-specific keywords ("piano lessons Canberra", "violin lessons Canberra") will drive more traffic

---

## 5. Design & UX

### 5.1 What's working well (design system)

- **Dark theme identity** — distinctive and warm. The cream+gold+blue palette is elegant.
- **Typography hierarchy** — 4-font system creates clear visual separation. However, Tangerine and Cinzel are used sparingly and could be dropped to reduce font payload (see §6).
- **Piano loader** — clever CSS mask animation (though the ghost layer has a CSS bug — see §2.4).
- **Teacher flip cards** — polished 3D rotate interaction.
- **Scroll-reveal animations** — tasteful, properly gated behind JS.
- **Pricing cards** — clear differentiation with featured badge.

### 5.2 Areas for improvement

#### Navigation structure
5 items in main nav is heavy for a small business. If shop and resources remain stubs, the nav actively harms credibility. Proposed: **about · lessons · teachers** (3 items) + "Enquire now" CTA → contact. Shop and resources become footer-only links until built out. Careers moves to footer or is removed.

#### Footer polish
- Emoji social icons (📷📘▶️) render inconsistently. Use SVG icons.
- "Contact" and "Book a lesson" both link to `contact.html` — adjacent duplicate links in the same list. Remove one or differentiate.

#### Hero image
- `IMG_5717.jpg` is a camera filename — rename to `hero-studio.jpg`
- No responsive image strategy — a 220KB hero image at all viewports

#### Pricing display
Inconsistent spacing: `$50/ 30 min` (space after `/`) vs `$60 / 30 min` (space before `/` due to `<span>` boundary at `src/index.html:127, 133`). Normalize.

---

## 6. Performance

### 6.1 Critical rendering path

| Problem | Severity | Fix |
|---------|----------|-----|
| 15 sequential `@import` requests | **Critical** — multi-second first-paint delay | Bundle CSS at build time. Phase 1. |
| 4 Google Fonts (render-blocking) | High | Drop Tangerine (used only for decorative `nav-logo-main` and footer `h3`). Drop Cinzel if possible (used only for uppercase `<h3>` labels — DM Serif Display can carry these). Retain DM Serif Display + Fauna One as the core pair. Add `&display=swap` to font URL. |
| 3.7 MB dead WebP deployed to production | Medium | Delete `IMG_5717.webp`. |
| 220 KB hero image, no responsive variants | Medium | Optimize: WebP conversion, responsive `srcset` or `picture` element for CSS background alternatives. |
| Dead assets deployed (`IMG_5716.jpg`, `Sydney-Competition-homepage.jpg`, `hand-drawn-piano-drawing-illustration.png`) | Low-Medium | Delete or repurpose. |

### 6.2 `index.js`

Clean, small, uses `IntersectionObserver` + `requestAnimationFrame`. No frameworks. `defer` loaded. No performance concerns with the script itself.

---

## 7. Accessibility

### 7.1 What's good
- Semantic HTML (`<header>`, `<nav>`, `<main>`, `<footer>`, `<article>`, `<section>`, `<aside>`)
- `aria-label` on burger button, social nav, sidebar
- `aria-expanded` toggled by JS (though missing `aria-controls` — see gaps)
- `aria-current="page"` on active nav link
- `role="list"` on styled lists
- Escape key closes sidebar
- Form labels properly associated via `for`/`id`

### 7.2 Gaps (with WCAG references)

| Gap | Severity | WCAG ref | Fix effort |
|-----|----------|----------|------------|
| No skip-to-content link | High | 2.4.1 (Bypass Blocks) | 5 min |
| Missing `aria-controls="sidebar"` on burger button | High | 4.1.2 (Name, Role, Value) | 1 min |
| No visible `:focus-visible` styles | Medium | 2.4.7 (Focus Visible) | 10 min |
| Links indistinguishable from text by color alone (no underlines) | Medium | 1.4.1 (Use of Color) | 5 min |
| Teacher card images have wrong `alt` text (3 of 4 say "Phoebe Mu" for Julian Thorne cards) | High | 1.1.1 (Non-text Content) | Fix with teacher data |
| `translate` property without `transform` fallback (Safari < 14.1) | Low | — | 2 min |

---

## 8. Strategic Page Decisions

### 8.1 Should each page exist?

| Page | Verdict |
|------|---------|
| **lessons.html** | **Keep & build.** Core offering. Must clarify lesson format (1-on-1/group), durations, G7+ meaning. |
| **teachers.html** | **Keep & fix.** Critical trust page. Real data only. |
| **about.html** | **Keep & rewrite.** Fix malformed HTML, write real copy, add studio photos + address. |
| **faq.html** | **Keep.** Expand. Remove address-hiding language. |
| **terms.html** | **Keep.** Add G7+ explanation. Already strong. |
| **contact.html** | **Keep.** Wire form, add phone/email fallback. |
| **shop.html** | **Build minimally or remove from nav.** |
| **resources.html** | **Merge into lessons page or build minimally.** Lower SEO priority than local GBP. |
| **careers.html** | **Remove from main nav.** Footer-only or remove. |
| **phoebe.html** | **Build.** Teacher bio page. |

---

## 9. Revised Phased Work Plan

### Phase 1: True Launch-Blocking (~3-4 hours)

| # | Task | Effort |
|---|------|--------|
| 1 | **Bundle CSS** — resolve 15 `@import` into single file at build time | 15 min |
| 2 | **Fix CSS loader bug** — `.ghost` → `&.ghost` in `loader.css:35` | 2 min |
| 3 | **Fix about.html malformed HTML** — close `<div>`, replace placeholder text | 30 min |
| 4 | **Wire contact form** — Formspree endpoint + honeypot spam field + add phone/email to page | 20 min |
| 5 | **Fix teacher card data** — real bios, real photos, remove duplicates, correct alt text | 1-2 hrs |
| 6 | **Add `aria-controls="sidebar"`** to burger button | 1 min |
| 7 | **Add skip-to-content link** + focus-visible styles | 15 min |
| 8 | **Write real about page copy** | 1 hr |

### Phase 2: Content Completion (~4-6 hours)

| # | Task | Effort |
|---|------|--------|
| 9 | Build lessons.html — instrument detail, lesson format, duration tiers, CTA | 2 hrs |
| 10 | Build phoebe.html teacher bio page | 1 hr |
| 11 | Expand FAQ (3-5 more questions, fix address language) | 30 min |
| 12 | Build or merge resources content (practice tips, recommended books, local music links) | 1-2 hrs |
| 13 | Add 2-3 more testimonials with real names | 30 min |
| 14 | Fix terms page: explain "G7+" column headers | 10 min |

### Phase 3: Local SEO, Trust & Polish (~2-3 hours)

| # | Task | Effort |
|---|------|--------|
| 15 | Create/audit Google Business Profile (NAP consistency with site) | 1 hr |
| 16 | Add LocalBusiness schema.org JSON-LD + Open Graph meta tags | 30 min |
| 17 | Add sitemap.xml + robots.txt + 404.html | 20 min |
| 18 | Review and fix color contrast where needed | 30 min |
| 19 | Replace emoji social icons with SVGs | 20 min |
| 20 | Fix duplicate footer links (Contact + Book a lesson) | 5 min |
| 21 | Normalize inconsistent pricing slash spacing | 5 min |

### Phase 4: Performance & Cleanup (~1-2 hours)

| # | Task | Effort |
|---|------|--------|
| 22 | Delete dead assets (`IMG_5717.webp`, `IMG_5716.jpg`, `Sydney-Competition-homepage.jpg`, `hand-drawn-piano-drawing-illustration.png`) | 5 min |
| 23 | Delete empty `teachers/` directory | 1 min |
| 24 | Optimize hero image (WebP, responsive sizes, rename) | 30 min |
| 25 | Audit and reduce Google Fonts (drop Tangerine, evaluate Cinzel) | 20 min |
| 26 | Add `transform` fallback for `translate` in keyframes | 2 min |

### Phase 5: Strategic Decisions

| # | Task |
|---|------|
| 27 | Decide shop.html fate (build, external link, or remove from nav) |
| 28 | Decide careers.html fate (remove from nav, or remove entirely) |
| 29 | Finalize nav structure (3 or 4 items) |
| 30 | Decide whether to display full studio address publicly |

---

## 10. Open Questions

1. **How many teachers does Kreutzer actually have?** If only 1-2, the page should reflect reality. Fake-staffed pages destroy trust.
2. **Is there a real shop, or is that aspirational?**
3. **What are the real social media URLs?** Instagram, Facebook, YouTube — currently all `#`.
4. **Is the business comfortable displaying the full studio address publicly?** Current FAQ language hides it until booking.
5. **Does Kreutzer teach 1-on-1, groups, or both?** Nowhere stated — the #1 content gap.
6. **Does the business offer online lessons?** Not mentioning it may lose remote-curious prospects.
7. **Are student photos available for testimonials/about pages?**
8. **Has Google Business Profile been set up?** The most impactful local SEO action.

---

## 11. Revised Summary

| Dimension | Grade | Key action |
|-----------|-------|------------|
| Design system (aesthetic) | A− | Distinctive dark theme. The system itself is strong. Minor contrast QA needed. |
| Content completeness | **F** | 5 empty stubs, 1 joke placeholder with malformed HTML, 1 page with 75% fake data. Form doesn't function. Cannot serve business purpose. |
| Technical foundation | **C+** | Clean Eleventy setup and organized CSS files. But: unbundled CSS delivery is a defect, CSS loader bug exists, malformed HTML, no 404, dead assets deployed. |
| Business function | **F** | Form submits to `#`. Contact page has no fallback. Cannot capture leads. |
| Local SEO | **D** | Good per-page metadata. No GBP discussion, no structured data, no sitemap, no OG tags. |
| Accessibility | **C** | Good semantic HTML foundation. But: 3 WCAG violations (no skip-link, missing aria-controls, wrong alt text on 3 of 4 teacher images), no focus-visible styles, links lack underlines. |
| Performance | **D** | 15 sequential CSS requests + 4 render-blocking fonts + 3.7MB dead WebP deployed + unoptimized hero image. First-paint latency is severe. |
| Maintainability | A− | Token-based CSS, component files, shared partials, simple build. Easy to extend once CSS delivery is fixed. |

**Bottom line:** The design system is ready. Almost everything else is not. The site needs bug fixes (CSS loader, malformed HTML), infrastructure (CSS bundling, 404, form wiring), content (6 pages worth), and trust signal work (phone visibility, address, teacher data) before it can launch. The Phases have been re-ordered: CSS bundling and known bugs are now Phase 1 alongside form and teacher data. The site is roughly 40% complete — further from launch than the visual polish of the homepage suggests.
