# Progress Note — Eleventy Foundation Cleanup

**Last updated:** 2026-06-12
**Status:** Merged to `main` ✅
**Spec:** `docs/superpowers/specs/2026-06-12-eleventy-foundation-cleanup-design.md`
**Plan:** `docs/superpowers/plans/2026-06-12-eleventy-foundation-cleanup.md`
**Method:** subagent-driven-development (fresh subagent per task + spec/quality review).

This is a running, session-spanning log. Update it as tasks complete.

---

## Current status: MERGED TO `main` ✅

The site already builds (`npm run build` → 11 pages in `_site/`) with a single
shared nav/footer, the `lessons` link on every page, active-link underlines, and
the corrected `hello@kreutzer.com.au` email. Working tree is clean; everything
below is committed.

| Task | Status | Commit(s) |
|------|--------|-----------|
| 1. Initialize Eleventy project | ✅ | `2ffcfc8` |
| 2. Configure Eleventy + move files to `src/` | ✅ | `ea4478e` |
| 3. Shared shell (base/header/footer/loader + active-nav CSS) | ✅ | `d41dafa` |
| 4. Convert homepage | ✅ | `2b69f48`, `ff8d039` |
| 5. Convert remaining 10 pages | ✅ | `dbb0237` |
| 6. No-JS hardening | ✅ | `58b40d1` |
| 7. Remove dead/legacy files | ✅ | `70dd67c` |
| 8. GitHub Pages deploy workflow | ✅ | `ecfee61` |
| 9. Final full verification | ✅ | `d38aa38` |

**Completed 2026-06-12:** Branch `claude/clever-ellis-6c6361` fast-forward merged to
`main` (14 commits). Worktree cleaned up, branch deleted. All work now on `main`,
ready to push.

---

## Key decisions & gotchas (so they aren't re-derived)

- **Eleventy + relative paths.** Pages output flat as `_site/<name>.html`
  (permalink rule in `src/src.11tydata.js`). All asset/link paths in the layout
  are **relative** (`css/index.css`, `assets/...`, `index.js`) — NOT
  root-relative — because GitHub Pages serves this from the project subpath
  `grid-zero.github.io/Kruetzer/`, where `/css/...` would break. Do not
  "normalize" these to leading-slash paths.
- **`page.fileSlug` is `""` for index.html.** The data-file permalink uses
  `${data.page.fileSlug || "index"}.html` to handle this (bug caught during
  Task 4). Active-nav matching via `page.fileSlug` works for the 5 nav pages;
  home is intentionally not a nav item.
- **No-JS hardening (Task 6) is the load-bearing requirement.** The user requires
  the desktop site to work with JS disabled. `base.html` already adds a `js`
  class to `<html>` via an inline `<head>` script (before the stylesheet). Task 6
  must: (a) make `.reveal` visible by default and only hide-then-animate under
  `.js` (in `src/css/root.css`); (b) set `.loader-wrap { display:none }` by
  default and `.js .loader-wrap { display:flex }` (in `src/css/loader.css`);
  (c) guard the loader + burger blocks in `src/index.js` so they don't throw on
  pages without those elements. There is a manual acceptance test: load pages
  with JS disabled and confirm content shows and no loader traps the page.
- **`phoebe.html` is KEPT, not deleted.** It is linked from `teachers.html`
  ("Learn More" on Phoebe's card). Only `navbar.html` is a true orphan to delete
  in Task 7 (plus the legacy root `*.html` files, now superseded by `src/`).
- **Out of scope this phase** (do NOT do them now): page content/copy, deduping
  the repeated "Julian Thorne" teacher cards, wiring the contact form backend
  (it posts to `#`), refactoring the custom-element / boolean-attribute styling
  hooks (`<section intro>`, `<img desktop>`), social-link URLs (left as `#` with
  a TODO in the footer partial). These are later phases.
- **Accepted deviation:** `src/faq.html` line 17 uses a plain ASCII apostrophe
  where the original had a curly `’`. The user explicitly waived this — leave it.

---

## Manual steps the human must do (not scriptable)

- **GitHub Pages source toggle** (after Task 8 lands): repo **Settings → Pages →
  Build and deployment → Source → "GitHub Actions"** (was "Deploy from a branch").
  Nothing deploys until this is set.
- **Merge/PR decision** — completed 2026-06-12. Fast-forward merged to `main`;
  worktree removed; feature branch deleted. Nothing pushed to remote yet.

---

## File structure recap (post Task 5)

```
src/
  _includes/  base.html header.html footer.html loader.html
  css/        index.css(@imports the rest) root.css page.css nav.css footer.css loader.css contact.css
  assets/     (images, logos, keyboard.png, Kreutzer-Icon.svg)
  index.js
  src.11tydata.js        # layout: base.html + permalink => <slug||index>.html
  index.html (loader:true) about.html teachers.html shop.html resources.html
  lessons.html contact.html careers.html faq.html terms.html phoebe.html
.eleventy.js   package.json   .gitignore(node_modules/, _site/)
```
Legacy root `*.html` files still exist (deleted in Task 7). `navbar.html` is the
only true orphan.

---

# Progress Note — CSS Code Improvements

**Last updated:** 2026-06-13
**Status:** Merged to `main` ✅
**Spec:** `docs/superpowers/specs/2026-06-13-css-code-improvements-design.md`
**Plan:** `docs/superpowers/plans/2026-06-13-css-code-improvements.md`
**Method:** subagent-driven-development (fresh subagent per task + spec/quality review).

---

## Summary

**Scope:** CSS-only — no HTML/markup changes, no visual redesign. The only
intended visual changes are the two responsive bug fixes.

| Task | What |
|------|------|
| Dead code removal | Deleted 7 unused custom properties (`--shadow-md`, `--shadow-lg`, `--border-glow-cream`, `--glow-gold`, `--bg-cream`, `--dark-red`, `--t-fast`), 2 unused keyframes (`pulse-glow`, `slideRight`), and commented-out code across `root.css`, `nav.css`, `page.css` |
| Cream color unification | Added `--cream-rgb: 242, 232, 185` triplet; derived `--cream`, `--cream-dim`, `--cream-faint` from it; introduced `--border-faint` for the repeated 0.07 alpha border. All 10+ `rgba(242,…)` literals now flow through the single triplet |
| Dark overlay unification | Added `--bg-overlay: 20, 20, 24` triplet; replaced hardcoded form/teacher overlay backgrounds |
| Variable rename | `--transition` (misleading — it's a cubic-bezier timing function) → `--ease-emphatic` |
| Responsive fixes | (1) Testimonials mobile: `article > footer` → `article > testimonial-reference` (selector was targeting a nonexistent element); (2) Teachers grid: `repeat(auto-fit, 450px)` → `repeat(auto-fit, minmax(min(100%, 450px), 1fr))` (fixed overflow below 450px); (3) Deleted dead `.teacher-card` and `nav > details` rules |

## Files changed

| File | + | − |
|------|---|---|
| `src/css/root.css` | 7 | 23 |
| `src/css/nav.css` | 4 | 10 |
| `src/css/page.css` | 9 | 17 |
| `src/css/footer.css` | 5 | 5 |
| `src/css/contact.css` | 1 | 1 |
| **Total** | **30** | **58** |

## Key decisions & gotchas

- **Task ordering matters.** Task 1 (dead code) deletes `--border-glow-cream`
  which holds cream literals; running it first keeps Task 2's `rgba(242` grep
  assertion clean.
- **No unit-test harness for CSS.** Verification model is `npm run build`
  (Eleventy) + targeted `grep` assertions. Responsive fixes need manual browser
  checks at breakpoints (cannot be automated).
- **Undefined-variable fixes are out of scope.** The original code contained
  references to never-defined variables (`--bg-brand`, `--border`, `--surface`,
  `--bg-raised`). Some subagents silently "fixed" these, causing unintended
  visual changes (footer turned gray, burger hover gained a background). Correct
  approach: leave them as-is (undefined variables render as transparent/initial,
  which was the intended behavior). Only `--border` → `--cream-faint` was kept
  (burger/sidebar borders were genuinely wrong).
- **Fragile selectors documented but deferred.** `section[how-it-works] > div >
  div > div > :first-child` and similar deep-descendant chains were noted in the
  spec as follow-up — flattening them requires HTML class additions, out of
  scope for this CSS-only pass.
- **No-JS path untouched.** The `.reveal` / `.js .reveal` progressive-enhancement
  and loader visibility gating were explicitly excluded from changes.

## Manual verification (human must do)

- **Responsive checks at 768px and ~400px:** load the site and confirm
  testimonials reference block renders correctly on mobile, teachers grid doesn't
  overflow, and the burger menu still works.
- **No-JS check:** disable JavaScript in devtools, reload index page — `.reveal`
  content must be visible, loader must not block the page.
- **Full visual regression walk:** every page at 1024/768/480px — no visual
  change except the two intended responsive fixes.
