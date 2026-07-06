# Issues & Improvement Opportunities

---

## 🔴 Critical / High Priority

### 1. Massive Code Duplication — Header/Nav/Footer Repeated in Every HTML File
Every page (`index.html`, `about.html`, `teachers.html`, `contact.html`, `lessons.html`, `shop.html`, `resources.html`, `careers.html`, `faq.html`, `terms.html`, `phoebe.html`) contains identical copies of the `<header>`, `<nav>`, mobile sidebar, and `<footer>`. This is a maintenance nightmare — a single change to the nav (e.g., adding a new link) requires editing **11 files**.

**Recommendation:** Introduce a simple build step (static site generator like Eleventy/Astro, or a simple Node/Python script with includes) to DRY these shared components. At minimum, use an iframe-free templating approach.

### 2. Pricing Inconsistency Between Homepage and Terms
- **Homepage** (`index.html`): "10 Lesson pack — $500 ($50/30 min)", "Single lessons — $60/30 min"
- **Terms page** (`terms.html`): Detailed table shows per-lesson pricing of $55 for 5-pack and $50 for 10-pack at 30 min

The homepage says $500 for 10 lessons (= $50/lesson), which matches the terms table's 10-pack price. But the homepage also says the 10-pack saves $100 per term vs. single lessons ($60 × 10 = $600, so $500 saves $100) — this is internally consistent. The terms page also lists 45/60 min options and Grade 7+ pricing that aren't mentioned on the homepage at all.

**Recommendation:** Either simplify to one canonical pricing data source, or clearly note on the homepage that additional durations and grade-based pricing are available on the terms page.

### 3. Contact Form Has No Backend
The form on `contact.html` has `action="#"` and `method="POST"` but no server endpoint. Submissions will do nothing. No form validation beyond HTML5 `required` attributes.

**Recommendation:** Wire the form to a backend (Formspree, Netlify Forms, Web3Forms, or a custom endpoint) and add client-side validation/feedback (success/error messages).

### 4. `navbar.html` Is an Orphaned Prototype
`navbar.html` is a completely standalone page with its own embedded CSS/JS, different fonts (Syne, DM Sans), different color scheme (`#e8ff47` accent, `#0d0d0d` bg), and a fake "arc studio" brand. It has nothing to do with the Kreutzer site and is not linked anywhere.

**Recommendation:** Delete it or move it to an `_archive/` or `_drafts/` folder to reduce confusion.

---

## 🟡 Medium Priority

### 5. Several Pages Are Empty "Coming Soon" Placeholders
`lessons.html`, `shop.html`, `resources.html`, `phoebe.html` (`phoebe.html`), and `careers.html` all contain only the header + footer + `<h1>Coming <em>Soon...</em></h1>`. This makes the site feel unfinished and may frustrate users who click these links from the nav.

**Recommendation:** Either build out real content for these pages or remove/hide them from the nav until ready.

### 6. `about.html` Is Mostly Placeholder Lorum-Ipsum-Style Text
Content like `<p>We are cool</p>`, `<p>Our studio is ....</p>` is clearly unfinished. The page structure is laid out but the copy is not real.

**Recommendation:** Flesh out the About page with real studio history, teacher profiles, and photos of the physical Canberra studio space.

### 7. Teacher Cards: 3 of 4 Are Duplicates
`teachers.html` has 4 teacher cards, but the last 3 are identical copies of "Julian Thorne" using the same photo (`phoebe mu.jpg`). Only the first card (Phoebe Mu) has unique content.

**Recommendation:** Populate with real teacher data and photos, or reduce to only the teachers who have been confirmed.

### 8. Teacher Card Click/Touch UX Limitation
The teacher flip cards use `click` event listeners with `classList.toggle('is-flipped')`. On mobile, there's no way to "un-flip" and read the front again without clicking exactly on the card (which toggles back). If a user taps a card to view the bio, they must tap it again to return — this is discoverable but not explained visually (only "Click to view bio ⟳" is shown).

Additionally, there is no focus/keyboard support — keyboard users cannot flip the cards.

**Recommendation:** Add a visible "close / back" button on the back face. Make cards focusable and respond to Enter/Space keys. Consider using a `<button>` for semantic accessibility.

### 9. Missing `alt` Text on Some Images
- `index.html`: `<img class="piano ghost" src="assets/keyboard.png" alt="Piano">` — OK but generic
- `index.html`: `<img class="piano" src="assets/keyboard.png" alt="Piano">` — duplicate alt
- `about.html`: Logo `<img>` missing `alt` attribute entirely
- Many pages: `<img src="assets/Kreutzer-源文件2修改颜色-.svg">` missing `alt`
- `teachers.html`: All 4 teacher images have `alt="Phoebe Mu"` (incorrect for 3 of them)

**Recommendation:** Add descriptive, unique `alt` text. The logo should be `alt="Kreutzer Music"`.

### 10. No `<title>` Uniqueness Across Pages
Most pages use `<title>Kreutzer</title>`. Only `teachers.html` uses `<title>Teachers | Kreutzer</title>` and `faq.html` uses `<title>FAQ | Kreutzer</title>`. The rest are identical, which hurts SEO and makes browser tabs indistinguishable.

**Recommendation:** Give every page a unique, descriptive `<title>` (e.g., "About | Kreutzer Music", "Contact | Kreutzer Music").

### 11. Nav Link: "lessons" Not in Sidebar
The desktop nav includes a "lessons" link, but the mobile sidebar only lists: about, teachers, shop, resources. This means mobile users cannot navigate to the lessons page (even though it's only "Coming Soon"). The `index.html` sidebar is also missing the "lessons" link.

**Recommendation:** Make the mobile sidebar match the desktop nav. Template the nav so it stays in sync automatically (see #1).

---

## 🟢 Low Priority / Polish

### 12. Inconsistent Indentation / Formatting
- `index.html` uses 2-space indentation
- `about.html` and `teachers.html` use 2-space but with inconsistent nesting
- `contact.html` and other "Coming Soon" pages use inconsistent spacing
- CSS files use mixed 2-space with empty lines between rules (mostly fine)

**Recommendation:** Run Prettier or similar formatter across the entire project.

### 13. CSS Uses Non-Standard Custom Elements As Selectors
The CSS targets custom HTML tags like `<company-story>`, `<company-stats>`, `<nav-logo-main>`, `<testimonial-quote>`, `<testimonial-reference>`. While browsers will render unknown elements, these are not valid HTML. They also provide no semantic or accessibility benefit. Screen readers don't know what to do with them.

**Recommendation:** Replace with standard HTML elements (e.g., `<div class="company-story">`, `<blockquote>`) or define custom elements properly via the Custom Elements API.

### 14. Fonts Loaded Twice on Most Pages
`index.html` has both:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
```
But other pages omit the `preconnect` hints, meaning the Google Fonts connection is slower on sub-pages. Either add `preconnect` everywhere, or remove it everywhere for consistency.

**Recommendation:** Add `preconnect` to all pages, or better yet, template the `<head>` (see #1).

### 15. No Favicon on Sub-Pages
`index.html` has `<link rel="icon" type="image/svg" href="assets/Kreutzer-Icon.svg">` but no other page includes a favicon.

**Recommendation:** Add the favicon `<link>` to all pages (or template the head).

### 16. `loader.css` Has Nesting Syntax Without a Preprocessor
The `.piano` block in `loader.css` uses invalid CSS nesting:
```css
.piano {
  .ghost { ... }
  mix-blend-mode: multiply;
}
```
This is not valid CSS (nesting requires `&` in modern CSS). In this case, the `.ghost` rule is actually inside the `.piano` ruleset — browsers will likely ignore both. The `.ghost` class style is thus broken.

**Recommendation:** Flatten to proper CSS:
```css
.piano.ghost { opacity: 0.12; filter: invert(1); }
.piano { mix-blend-mode: multiply; }
```

### 17. Unused CSS Variable `--bg-brand`
`nav.css` references `background: var(--bg-brand);` but `--bg-brand` is never defined in `root.css` or any other CSS file. This will fall back to `transparent`/inherited.

**Recommendation:** Either define `--bg-brand` in `root.css` or use `var(--bg)`.

### 18. Unused CSS Variable `--bg-raised`
`footer.css` references `background: var(--bg-raised);` but `--bg-raised` is never defined.

**Recommendation:** Define it or replace with `var(--bg-card)` / `var(--bg)`.

### 19. `page.css` Responsive Selector Uses `> footer` But Footer Is Outside `<main>`
```css
section[testimonials] article > footer { ... }
```
There is no `<footer>` inside testimonials `<article>` elements. The selector targets `testimonial-reference` directly. This rule is dead code from an earlier iteration.

**Recommendation:** Remove the dead CSS or update to match the current DOM structure.

### 20. Inconsistent Section Background on `index.html`
`section[contact]` has `background: var(--bg-blue)` but is immediately preceded by `section[pricing]` which also has `background-color: var(--bg-blue)`. This means two adjacent sections are the same color — the visual break is lost, making it look like one continuous section. There IS a `border-top` on `section[contact]`, but the subtle 7% opacity border may not be enough separation.

**Recommendation:** Either alternate backgrounds (e.g., `var(--bg)` for contact) or add more whitespace between them.

### 21. Hero Image Asset Size
`assets/IMG_5717.webp` is **3.7 MB** — far too large for a web hero background. This will cause poor Largest Contentful Paint (LCP) scores and hurt SEO.

**Recommendation:** Resize to appropriate dimensions (max ~1920px wide), compress further, and consider using `<img>` with `srcset` for responsive delivery instead of a CSS `background-image`.

### 22. Hero Image on `index.html` Has No Text Overlay Contrast
The hero has `color: var(--cream)` overlay text on a background photo (`IMG_5717.jpg`). There is no dark overlay/gradient to ensure text readability. Depending on the photo, text may be hard to read.

**Recommendation:** Add a subtle dark gradient overlay (e.g., `linear-gradient(rgba(7,7,7,0.4), rgba(7,7,7,0.6))`) behind the hero text via a pseudo-element.

### 23. Social Media Links Are Placeholders
Footer social links use emoji icons (📷, 📘, ▶️) with `href="#"`. These should link to actual Instagram, Facebook, and YouTube profiles.

### 24. Performance: No Image Lazy Loading
None of the `<img>` tags use `loading="lazy"`. While not critical for a small site, it's a good practice for teacher photos and any future gallery images.

**Recommendation:** Add `loading="lazy"` to below-the-fold images.

### 25. No Sitemap or `robots.txt`
No `robots.txt` or `sitemap.xml` for search engines.

**Recommendation:** Add both for SEO.

---

## 🔷 Code Style & Architecture

### 26. CSS-Only "Framework" Could Benefit from More Comments
`page.css` has a `/* TODOL improve styling */` comment (typo: TODOL → TODO) inside `section[about]`. CSS is fairly well-organized but could use section headers to aid navigation in a 470-line file.

### 27. JS Has No Error Handling
`index.js` directly accesses DOM elements (`getElementById`) without null checks. If the loader elements are missing on a sub-page, the script will throw:
```
Uncaught TypeError: Cannot set properties of null (setting 'style')
```
Since `index.js` is included on every page (including those without the loader), the `fillInner` and `loaderWrap` lookups will fail silently (return `null`), and `fillInner.style` will throw.

**Recommendation:** Guard loader-dependent code with null checks, or only include the script on pages that need it.

### 28. Animation Durations Are Very Long
The scroll-reveal uses `1.65s` opacity transition — this feels sluggish. Testimonials use `1.6s ease-out` for `slideIn` animation. While this creates a "premium" feel, it may frustrate users who want to scan quickly.

**Recommendation:** Consider reducing reveal transitions to `0.4–0.6s` or implementing a reduced-motion media query.

### 29. No `prefers-reduced-motion` Support
There is no `@media (prefers-reduced-motion: reduce)` anywhere. Users with motion sensitivity will experience all animations (loader, scroll reveal, hover effects, sidebar slide).

**Recommendation:** Add a reduced-motion media query that disables or simplifies all animations.

### 30. Mixed Use of `font-display` Strategy
Google Fonts URLs don't include `&display=swap` parameter, but the fonts are in the URL string itself as family names. The `font-display: swap` is not being applied in the CSS `@font-face` either (since they're loaded via `<link>`). This means text may be invisible during font load (FOIT).

**Recommendation:** Add `&display=swap` to Google Fonts URLs.

### 31. File Naming: Chinese Characters in Asset Filename
`Kreutzer-源文件2修改颜色-.svg` has Chinese characters. While technically functional, it can cause issues on some servers, build tools, or when shared. The `teachers/` directory is empty.

**Recommendation:** Rename to ASCII-friendly names (e.g., `kreutzer-logo-full.svg`). Clean up the empty `teachers/` directory.

### 32. `index.js` References `.sidebar-link` But Sidebar Uses Plain `<a>` Tags
The JS has:
```js
sidebar.querySelectorAll('.sidebar-link').forEach(link => { ... });
```
But the actual sidebar on every page uses plain `<a>` elements without the `.sidebar-link` class. This querySelectorAll returns an empty NodeList, so the active-link tracking and click-to-close logic never runs.

**Recommendation:** Either add the `.sidebar-link` class to sidebar `<a>` tags or update the selector to `sidebar.querySelectorAll('a')`.

---

## 📋 Content & SEO Issues

### 33. Meta Descriptions Are Identical and Generic
Every page has `<meta name="description" content="Kreutzer">`. This is a missed SEO opportunity.

**Recommendation:** Write unique, compelling meta descriptions for each page (~150 characters) that include keywords like "music lessons Canberra", "piano teacher", etc.

### 34. Email in Footer Uses Gmail But `mailto` Uses Domain
Footer shows `kreutzer@gmail.com` but the `mailto:` uses `hello@kreutzer.com.au`. Mismatch — if the business owns `kreutzer.com.au`, use that consistently.

### 35. No Privacy Policy Page
The contact form collects personal data (name, email, phone) but there's no link to a privacy policy explaining how that data is handled. This may be a legal requirement depending on jurisdiction (Australian Privacy Act).

**Recommendation:** Add a privacy policy page and link to it from the contact form and footer.

### 36. No Clear Call-to-Action After Testimonials
After the testimonials section, the user hits the pricing section. There's a natural flow, but no "trust signal" like "Join 50+ happy students" or similar social proof summary between testimonials and pricing.

### 37. Missing Open Graph / Twitter Card Meta Tags
No `og:title`, `og:description`, `og:image`, or `twitter:card` tags. When shared on social media, links will show a generic preview.

**Recommendation:** Add Open Graph tags to all pages, especially the homepage.

---

## 📊 Summary Statistics

| Priority | Count |
|----------|-------|
| 🔴 Critical / High | 4 |
| 🟡 Medium | 7 |
| 🟢 Low / Polish | 14 |
| 🔷 Code Architecture | 7 |
| 📋 Content / SEO | 5 |
| **Total** | **37** |

---

## 🎯 Suggested First Actions

1. **Template the header/footer/nav** — this single change will make all future edits dramatically easier and fix several issues at once (missing favicon, inconsistent titles, meta descriptions, nav link drift).

2. **Wire the contact form to a backend** — the form is the primary conversion point; it must work.

3. **Build out the About page and remaining teacher cards** — these are the most visible "unfinished" areas.

4. **Optimize the 3.7 MB hero image** — this is the single biggest performance win.

5. **Add `prefers-reduced-motion` support** — an easy accessibility win.

6. **Clean up dead/placeholder files** — delete or archive `navbar.html`, decide fate of empty "Coming Soon" pages.
