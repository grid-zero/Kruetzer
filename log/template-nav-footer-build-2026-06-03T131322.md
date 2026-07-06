# Change Log: Template Nav & Footer Build

**Date:** 2026-06-03 13:13 UTC  
**Author:** pi (coding agent)  
**Branch:** `main`

---

## Summary

Eliminated header/nav/footer code duplication across 11 HTML files by introducing a Python build script. Pages are now assembled from shared templates with per-page metadata. Added active nav highlighting (gold emphasis) for the current page.

---

## Files Created

### `compiled/build.py`
Python build script (~230 lines). Assembles complete HTML pages by:
- Templating the shared `<head>` block (charset, viewport, favicon, stylesheet, fonts, `preconnect` hints)
- Templating the `<header>/<nav>` block (desktop nav, mobile sidebar, logo, CTA button, burger menu)
- Templating the `<footer>` block
- Injecting per-page unique `<title>`, `<meta description>`, and `<main>` content
- Conditionally including the piano loader (index.html only)
- Adding `class="nav-active"` to the current page's nav item in both desktop and sidebar

Input: source HTML files from repository root  
Output: `compiled/output/*.html`

### `compiled/output/` (11 files)
Generated HTML pages:
- `index.html` — homepage with loader, no active nav
- `about.html` — about page, "about" highlighted in gold
- `teachers.html` — teachers page, "teachers" highlighted in gold
- `contact.html` — contact form page, no active nav
- `lessons.html` — placeholder, "lessons" highlighted in gold
- `shop.html` — placeholder, "shop" highlighted in gold
- `resources.html` — placeholder, "resources" highlighted in gold
- `careers.html` — placeholder, no active nav
- `faq.html` — FAQ page, no active nav
- `terms.html` — terms page, no active nav
- `phoebe.html` — placeholder, no active nav

### `ISSUES.md`
Comprehensive audit of 37 issues across content, code style, HTML semantics, CSS, JavaScript, performance, design/UX, SEO/metadata, and accessibility. Organized by priority (critical/high/medium/low).

---

## Files Modified

### `new/nav.css`
Added `.nav-active` styles for active page highlighting:

```css
/* Active page highlight */
header > nav ul a.nav-active {
  color: var(--gold);
}
header > nav ul a.nav-active::after {
  transform: scaleX(1);
}
```

Rules applied:
- **Line ~62** (after the existing `ul a::after` rule)

Effect: Active nav item renders in gold with a permanently visible underline.

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| Python script over SSG (Eleventy/Astro) | Zero dependencies; runs anywhere Python 3 is installed; no config files needed |
| `index.html` as nav source of truth | Most complete version (5 nav items, both logo variants, full sidebar) |
| Both desktop nav AND sidebar get `.nav-active` | Consistency across responsive breakpoints |
| "lessons" added to all pages | Previously missing from mobile sidebar on sub-pages (fixes issue #11) |
| Loader only on `index.html` | Avoid re-running animation on every page navigation |
| Favicon on all pages | Previously only on index.html (fixes issue #15) |
| Unique `<title>` per page | SEO and browser tab usability (fixes issue #10) |
| `alt` on logo images | Accessibility (fixes issue #9) |

---

## Verification

All 11 generated pages passed verification:
- ✅ `<main>` content matches originals byte-for-byte
- ✅ Favicon present on all pages
- ✅ Mobile logo variant present on all pages
- ✅ Footer present on all pages
- ✅ 5 nav items in both desktop nav and mobile sidebar
- ✅ Active highlighting on correct pages only
- ✅ Loader only on index.html

---

## Net Delta

```
 Created:  compiled/build.py
 Created:  compiled/output/index.html
 Created:  compiled/output/about.html
 Created:  compiled/output/teachers.html
 Created:  compiled/output/contact.html
 Created:  compiled/output/lessons.html
 Created:  compiled/output/shop.html
 Created:  compiled/output/resources.html
 Created:  compiled/output/careers.html
 Created:  compiled/output/faq.html
 Created:  compiled/output/terms.html
 Created:  compiled/output/phoebe.html
 Created:  ISSUES.md
 Modified: new/nav.css (+8 lines)
```

## Usage

```bash
cd compiled
python3 build.py
# Output → compiled/output/
```
