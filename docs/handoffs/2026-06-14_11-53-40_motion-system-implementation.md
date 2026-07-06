---
date: 2026-06-14T11:53:40+1000
author: grid-zero
commit: 854309ae2f91f2f1b5e20ce24a012c068c2246b1
branch: feat/motion-system
repository: grid-zero/Kruetzer
topic: "Motion System Feature Implementation"
tags: [implementation, motion, css, reveal, animations, eleventy]
status: complete
last_updated: 2026-06-14T11:53:40+1000
last_updated_by: grid-zero
type: feature_development
---

# Handoff: Motion system (reveal vocabulary + cinematic hero) on `feat/motion-system`

## Task(s)

Implement a richer animation/motion system for the Kreutzer site, replacing the single blanket scroll-fade. Driven by an approved spec + plan, executed via subagent-driven development (sonnet implementer per task → `npm run build` verify → sonnet review → commit).

**All 9 plan tasks COMPLETE and committed** (plus one final-review fix):

1. ✅ Motion tokens & keyframes (`kenBurns`, `wordIn`)
2. ✅ Reveal vocabulary + reduced-motion (`reveal.css` rewrite)
3. ✅ Shared `.draw-underline` utility + nav de-duplication
4. ✅ Cinematic homepage hero (word-rise + blur + CSS Ken Burns)
5. ✅ Count-up stats (guarded, no-JS + reduced-motion safe)
6. ✅ Micro-interactions; removed dead testimonials `slideIn`
7. ✅ Apply reveal vocabulary across the homepage
8. ✅ Apply reveal vocabulary to interior pages
9. ✅ Document motion in `DESIGN.md` + final QA
10. ✅ Fix: extend hero reduced-motion guard to eyebrow/paragraph/button (final-review finding)

**Branch decision:** user chose to **keep `feat/motion-system` as-is** — NOT merged, NOT pushed. Working tree clean.

## Critical References

- Spec: `docs/superpowers/specs/2026-06-14-motion-system-design.md`
- Plan: `docs/superpowers/plans/2026-06-14-motion-system.md` (task-by-task, exact code)
- Design system: `DESIGN.md` (root) and `src/css/README.md` (CSS architecture)

## Recent changes

Feature commit series (oldest→newest), all on `feat/motion-system`, branched off the docs commit `0d35e0d`:

- `04acb7e` — `src/css/tokens.css` (motion tokens `--ease-out`/`--t-reveal`/`--t-wipe`/`--t-kenburns`), `src/css/keyframes.css` (`kenBurns`, `wordIn`)
- `8e0b3af` — `src/css/reveal.css` rewritten: `.reveal--left/--right/--wipe/--blur`, `.reveal-stagger`, expanded transition, `prefers-reduced-motion` block
- `b46b2a0` — `src/css/sections.css:609-630` adds `.draw-underline`; `src/css/nav.css:49-51` slimmed (duplicate `::after` removed, active state kept at `nav.css` active rule); `src/_includes/header.html:11,29` nav links get `draw-underline`
- `1d0bc89` — hero: `src/css/sections.css` (photo → `section[intro][home]::before` + `kenBurns`, `& h1 .word` word animation, hero reduced-motion guard); `src/index.html:6,9` (`<section intro home>`, 5 `<span class="word">`)
- `ba9669d` — `src/index.js:63-94` guarded count-up; `src/index.html:28-30` stats get `data-count`/`data-suffix`
- `f89125b` — `src/css/buttons.css` (invert+lift, `.btn-clear` fill-sweep), `src/css/instruments.css` (tile lift), `src/css/pricing.css` (reduced-motion guard only — lift already existed), `src/css/testimonials.css` (deleted dead `article.reveal`/`slideIn`), `src/css/keyframes.css` (removed `slideIn`), README keyframe list
- `19bce2c` — `src/index.html` + `src/_includes/pricing.html` apply vocabulary (about directional, instruments/how-it-works/pricing stagger, instruments h2 wipe, contact h2 blur, testimonials `reveal--left/right`)
- `af7e8b2` — `src/phoebe.html`, `src/lessons.html`, `src/careers.html`, `src/about.html` apply vocabulary
- `a175670` — `DESIGN.md` Motion section rewritten
- `854309a` — `src/css/sections.css:720-725` hero reduced-motion guard extended to `h3`/`p`/`.btn`

## Learnings

- **Repo/worktree layout (IMPORTANT):** the feature branch `feat/motion-system` is checked out in the **main working tree** at `C:\Users\User\Documents\programming\phoebe\website`, NOT in the harness worktree (`.claude/worktrees/fervent-gould-ab6d43`, on branch `claude/fervent-gould-ab6d43`). All file edits used **absolute parent paths**; all git/build ran against the parent via `git -C <parent>` and **`npm --prefix <parent> run build`** (verified it builds the parent tree, not the worktree).
- **Existing animations were NOT duplicated** (these were verified in source and reused/cleaned, per user instruction): nav hover underline already existed (`nav.css`) → factored into one `.draw-underline`; pricing card-lift already existed (`pricing.css:19-26`) → only added a reduced-motion guard; testimonials `slideIn` was **dead code** (articles had no `.reveal` class so the IntersectionObserver never fired) → fully removed and replaced with directional reveals.
- **Reduced-motion guards must be cascade-safe:** each guard lives in the SAME file as the animation it cancels (so it's declared after it). `reveal.css` guards `.reveal*`; component files guard their own hover/keyframe motion; the hero guard lives in `sections.css` (NOT `reveal.css`) because `sections.css` imports later.
- **No-JS + reduced-motion are load-bearing:** `.reveal` is visible by default and only `.js .reveal` hides; count-up keeps the final number in the HTML and bails under `matchMedia('(prefers-reduced-motion: reduce)')`; hero word/Ken-Burns are pure-CSS animations that resolve to a visible end state.
- **Hero photo is scoped to `section[intro][home]`** so interior pages keep their solid blue hero (`<section intro style="...var(--bg-blue)">`, no `home` attribute).
- Verification model is `npm run build` (12 pages) + grep of `_site/` — there is no test harness (per `CLAUDE.md`).

## Artifacts

- `docs/superpowers/specs/2026-06-14-motion-system-design.md` — design spec
- `docs/superpowers/plans/2026-06-14-motion-system.md` — implementation plan (exact code per task)
- `DESIGN.md` — motion vocabulary documented (Motion section)
- `src/css/README.md` — keyframe list updated
- Source changed: `src/css/{tokens,keyframes,reveal,sections,nav,buttons,instruments,pricing,testimonials}.css`, `src/index.js`, `src/index.html`, `src/_includes/{header,pricing}.html`, `src/{phoebe,lessons,careers,about}.html`
- This handoff: `docs/handoffs/2026-06-14_11-53-40_motion-system-implementation.md`

## Action Items & Next Steps

1. **Human browser QA (only remaining step before merge).** Run `npm run dev` and check the three breakpoints (1024 / 768 / ~400px), a **JavaScript-disabled** load (all `.reveal` content visible; stats show 10+/5/100%; no Ken Burns), and an **OS reduced-motion** setting (instant reveals, no drift, no count, no hover transforms). Confirm no element double-animates.
2. **Finish the branch when satisfied:** `git checkout main && git merge feat/motion-system` (then optionally delete the branch), or push + open a PR. A push to `main` triggers the GitHub Pages deploy (`.github/workflows/deploy.yml`).
3. **Unrelated, pre-existing:** the `[Write …]`/`[List …]` prose prompts in `lessons.html`/`phoebe.html`/`careers.html`/`about.html` still need real copy (out of scope for this feature).

## Other Notes

- Build command from the worktree cwd: `npm --prefix "C:/Users/User/Documents/programming/phoebe/website" run build`. Git: `git -C "C:/Users/User/Documents/programming/phoebe/website" ...`.
- The `LF will be replaced by CRLF` git warnings are benign Windows line-ending normalization.
- `docs/handoffs/` is currently untracked in git.
- Earlier in the session the bundled `anthropic-skills:create-handoff` failed on a `node "${SKILL_DIR}/…"` preamble (permission engine rejects the `${}` expansion); this handoff was produced via the user-level `~/.claude/skills/create-handoff` copy, which loaded cleanly.
