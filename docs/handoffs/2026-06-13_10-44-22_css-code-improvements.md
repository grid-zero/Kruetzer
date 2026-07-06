---
date: 2026-06-13T10:44:22+1000
author: grid-zero
commit: 1720fd2
branch: main
repository: website
topic: "CSS Code Improvements Implementation Strategy"
tags: [implementation, strategy, css, refactoring, responsive]
status: complete
last_updated: 2026-06-13T10:44:22+1000
last_updated_by: grid-zero
type: implementation_strategy
---

# Handoff: CSS code improvements — ready to implement

## Task(s)
Brainstorm → spec → plan flow for "CSS code improvements" on the Phoebe website. **All planning is complete; implementation has NOT started.**

- **Brainstorming** (completed) — explored CSS, scoped to: cleanup/maintainability, architecture/consistency, and responsiveness fixes. Explicitly **no visual redesign**.
- **Spec** (completed, committed `afcb3f1`, revised `4f327d4`) — `docs/superpowers/specs/2026-06-13-css-code-improvements-design.md`.
- **Implementation plan** (completed, committed `1720fd2`) — `docs/superpowers/plans/2026-06-13-css-code-improvements.md`. 6 tasks.
- **Implementation** (NOT started) — user was asked to choose execution mode (Subagent-Driven vs Inline). Awaiting that choice.

## Critical References
- `docs/superpowers/plans/2026-06-13-css-code-improvements.md` — the authoritative task-by-task plan (follow exactly).
- `docs/superpowers/specs/2026-06-13-css-code-improvements-design.md` — design rationale and scope/out-of-scope.

## Recent changes
No source code changed yet. Only docs were added/committed this session:
- `docs/superpowers/specs/2026-06-13-css-code-improvements-design.md` (new)
- `docs/superpowers/plans/2026-06-13-css-code-improvements.md` (new)

Note: working tree had pre-existing uncommitted changes at session start in `docs/superpowers/PROGRESS.md`, `docs/superpowers/plans/2026-06-12-eleventy-foundation-cleanup.md`, `docs/superpowers/specs/2026-06-12-eleventy-foundation-cleanup-design.md`, `src/css/footer.css`, `src/css/nav.css` — these are unrelated to this task and were NOT touched.

## Learnings
- **Build:** `npm run build` (= `eleventy`). Dev server: `npm run dev` (serves `http://localhost:8080`). Eleventy 3.
- **Verification model:** no CSS unit-test harness. "Tests" = build succeeds + `grep` assertions return 0 matches. Responsive fixes need manual browser checks at breakpoints (cannot be automated).
- **Confirmed dead selectors** (markup mismatches verified via grep against `src/*.html` + `_includes`):
  - `section[testimonials] article > footer` (page.css ~719) — markup uses `<testimonial-reference>`, so the mobile rule never applies (real responsive bug).
  - `.teacher-card` (page.css ~735, 768px query) — markup uses `.teacher-card-container`; real bug is base `repeat(auto-fit, 450px)` at page.css:472 overflowing below 450px.
  - `> details` (page.css ~675, nav 768px query) — no `<details>` in nav (uses burger `<button>` + `<aside>`).
- **Confirmed unused tokens (0 refs):** `--shadow-md`, `--shadow-lg`, `--border-glow-cream`, `--glow-gold`, `--bg-cream`, `--dark-red`, `--t-fast`; keyframes `pulse-glow` and `slideRight`.
- **Cream color family:** triplet `242,232,185` appears at alphas 0.55/0.12/0.07(×7)/0.1(×2)/0.05(×1). User chose the single-base-triplet approach: define `--cream-rgb: 242, 232, 185;` and derive all of them (incl. `--cream`, `--cream-dim`, `--cream-faint`, new `--border-faint`). Final assertion: `grep "rgba(242" src/css` → 0.
- **`--transition`** is a `cubic-bezier` timing function (misnamed) → rename to `--ease-emphatic` (2 uses in nav.css:112,142). Distinct from `--ease`, which stays.
- **Task ordering is load-bearing:** Task 1 (dead code) must run before Task 2 because it deletes `--border-glow-cream` (which holds cream literals), keeping Task 2's `rgba(242` grep clean.

## Artifacts
- `docs/superpowers/specs/2026-06-13-css-code-improvements-design.md` — design spec.
- `docs/superpowers/plans/2026-06-13-css-code-improvements.md` — 6-task implementation plan with exact before/after CSS and grep assertions.
- This handoff: `.rpiv/artifacts/handoffs/2026-06-13_10-44-22_css-code-improvements.md`.

## Action Items & Next Steps
1. **Ask the user which execution mode** they want (was the open question when this session ended): Subagent-Driven Development (recommended) or Inline Execution.
2. **Execute the plan task-by-task** in order (1→6). Each task ends with `npm run build`, grep assertions, and a commit (commit messages are pre-written in the plan).
3. **Task 5 + Task 6 require manual browser checks** at 1024/768/480px and a no-JS check — do not claim completion without them.
4. Commit per-task using the messages specified in the plan.

## Other Notes
- All CSS lives in `src/css/` (`root.css`, `nav.css`, `footer.css`, `page.css`, `contact.css`, plus untouched `loader.css`, `index.css`).
- §4 of the spec lists fragile deep-descendant selectors that are **documented follow-up only** — do NOT flatten them (would require HTML edits, out of scope).
- Hard scope guardrails: CSS-only, no markup edits, no visual redesign, preserve the no-JS progressive-enhancement path (`.reveal` / `.js .reveal` / loader gating).
- Auto-memory note: `MEMORY.md` references an Eleventy cleanup phase ("resume at Task 6") — that is a *separate, older* effort, not this CSS task. Don't conflate.
