# Progress Note — Eleventy Foundation Cleanup

**Last updated:** 2026-06-12
**Branch:** `claude/clever-ellis-6c6361` (worktree)
**Spec:** `docs/superpowers/specs/2026-06-12-eleventy-foundation-cleanup-design.md`
**Plan:** `docs/superpowers/plans/2026-06-12-eleventy-foundation-cleanup.md`
**Method:** subagent-driven-development (fresh subagent per task + spec/quality review).

This is a running, session-spanning log. Update it as tasks complete.

---

## Current status: Tasks 1–5 DONE, resume at Task 6

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
| 6. No-JS hardening | ⏳ resume here | — |
| 7. Remove dead/legacy files | ⏳ | — |
| 8. GitHub Pages deploy workflow | ⏳ | — |
| 9. Final full verification | ⏳ | — |

After Task 9: run **superpowers:finishing-a-development-branch** to decide
merge-to-`main` vs PR.

---

## How to resume

1. Re-open the plan file and continue at **Task 6** (No-JS hardening).
2. Keep using subagent-driven-development: dispatch one implementer subagent per
   task with the full task text from the plan, then spec-review, then
   quality-review, then mark done.
3. Toolchain is ready: Node v22.13.1 / npm 10.9.2; Eleventy 3.1.6 installed.
   `npm run build` builds to `_site/`; `npm run dev` serves at `localhost:8080`.

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
- **Merge/PR decision** at the finishing step. Nothing has been pushed/deployed;
  all work is local commits on the feature branch.

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
