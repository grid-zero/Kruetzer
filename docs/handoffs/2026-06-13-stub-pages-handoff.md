# Session Handoff — Stub Pages Completion + Project Docs

**Date:** 2026-06-13
**Project:** Kreutzer music-tuition website (Eleventy/11ty static site)
**Repo:** `C:\Users\User\Documents\programming\phoebe\website` · remote `origin` → github.com/grid-zero/Kruetzer

## Repo state at handoff

- **Branch:** `main` · **HEAD:** `b34723e`
- **origin/main:** in sync with local (`0` ahead / `0` behind) — **work is pushed**, so the GitHub Pages deploy (push-to-`main` trigger in `.github/workflows/deploy.yml`) has fired.
- **Working tree:** clean.
- **Build:** `npm run build` green — 12 pages to `_site/`.
- Feature branch `feat/complete-stub-pages` was fast-forward merged into `main` and deleted.

## What this session did

1. **Project reference docs** (so future sessions don't re-derive the build):
   - `CLAUDE.md` — build system, page model, the two load-bearing constraints (relative paths for the GitHub Pages subpath; the no-JS progressive-enhancement path), CSS architecture pointer, deploy.
   - `src/css/README.md` — CSS folder organization (component-based, the load-bearing `@import` order in `index.css`, per-file ownership, breakpoint co-location, gotchas). Deliberately kept OUT of `CLAUDE.md` (only relevant when editing CSS).
2. **Completed three stub pages** (brainstorm → spec → plan → subagent-driven execution, Sonnet workers):
   - `src/lessons.html` — experience → journey (Beginner/Intermediate/Advanced) → formats & policies → shared pricing → CTA.
   - `src/phoebe.html` — bio (`section[about]` photo+text grid) → qualifications → teaching approach → CTA.
   - `src/careers.html` — "why Kreutzer" value cards → who we're looking for → mailto expression-of-interest CTA.
   - Prose left as `[Write …]` / `[List …]` manual-completion prompts by design.
3. **Extracted `src/_includes/pricing.html`** — single source of truth for lesson packages/prices, now included by both the homepage and Lessons (no duplicated prices).
4. **Build fix** (`.eleventy.js`) — the new `src/css/README.md` was being rendered into `_site/README.html` and copied as raw markdown; added `eleventyConfig.ignores` for it and switched the CSS passthrough to `src/css/*.css` so docs stay repo-only. Back to 12 pages, all 16 stylesheets still bundle.

## Key decisions (and where they're recorded)

- **Spec:** `docs/superpowers/specs/2026-06-13-stub-pages-completion-design.md`
- **Plan:** `docs/superpowers/plans/2026-06-13-stub-pages-completion.md`
- Designed fresh (did not follow the `docs/` directions file); scope = build lessons/phoebe/careers, **leave `shop.html` and `resources.html` as "Coming Soon"** by design; Approach B (extract pricing partial) over inline duplication; descriptive prose prompts.
- No new CSS — every page composes existing section hooks (`intro`, `default`, `how-it-works`, `about`/`company-story`, `pricing`, `contact`) proven on the homepage.

## Open items / next steps

1. **Fill in the prose prompts by hand** in `lessons.html`, `phoebe.html`, `careers.html` — grep `'\[Write\|\[List'` to find them (10 in lessons, 6 in phoebe, 6 in careers). Add Phoebe's real bio + credentials.
2. **Manual visual check** (not scriptable): the three pages at 1024 / 768 / ~400px, plus a JS-disabled load to confirm `.reveal` content shows and no loader traps the page.
3. When happy, future content edits → `npm run build`, commit, `git push` (each push to `main` redeploys).


## Quick orientation for a fresh session

Read `CLAUDE.md` first (build/run/constraints), then `src/css/README.md` if touching styles. Verification model: `npm run build` + targeted `grep` (no unit-test harness). All page content lives in `src/*.html` with front matter; shared shell in `src/_includes/`.
