# Visual Review — Full Change List

From a visual-only review of the running site (localhost:8080) on 2026-10-09, at desktop
(1366px) and mobile (375px) widths. Pages reviewed: Home, About, Teachers, Lessons, Contact.

The goal: keep the grand dark-and-gold look, but make the site feel like a **warm, real,
trustworthy place for a child to learn**, not just a prestigious concert brand.

- **Owner — Phoebe:** content only she can supply (photos, bios, facts, decisions). Her
  plain-language version of these items is in [`phoebe-website-to-do.md`](phoebe-website-to-do.md).
- **Owner — Dev:** code/CSS changes. Some are blocked on Phoebe's input (marked *Blocked by*).
- Copy must not overclaim: Kreutzer was founded in 2025 and has no testimonials yet.

File references are relative to `src/` and reflect the `website-style-overhaul` worktree
at commit `14609c1` (plus its uncommitted studio-photo changes).

---

## Summary

| # | Change | Severity | Owner | Status |
|---|---|---|---|---|
| 1 | Replace/hide placeholder teacher cards | 🔴 Critical | Phoebe → Dev | Open |
| 2 | Add a real lesson photo | 🔴 Critical | Phoebe → Dev | Open |
| 3 | Stop reusing the same photos across pages | 🟡 Moderate | Phoebe → Dev | Open |
| 4 | Studio photo reshoot (match moody style) | 🟡 Moderate | Phoebe → Dev | **In progress** (uncommitted) |
| 5 | Re-crop founder photo (lid reflection) | 🟡 Moderate | Phoebe → Dev | Open |
| 6 | Keep a "Book" CTA in the mobile header | 🟡 Moderate | Dev | Open (decision Q3) |
| 7 | Shorten/limit the loader | 🟡 Moderate | Dev | Open (decision Q1) |
| 8 | Tighten section spacing & page length | 🟡 Moderate | Dev | Open |
| 9 | Remove pricing duplication | 🟡 Moderate | Dev | Open (decision Q4) |
| 10 | Honest trust signals | 🟡 Moderate | Phoebe → Dev | Open |
| 11 | Align pricing cards; mobile pricing layout | 🟢 Minor | Dev | Open |
| 12 | One logo in desktop header | 🟢 Minor | Dev | Open (decision Q2) |
| 13 | Photo for Theory & Musicianship card | 🟢 Minor | Phoebe → Dev | Open |
| 14 | Contact form visible above the fold | 🟢 Minor | Dev | Open |
| 15 | Strengthen secondary links | 🟢 Minor | Dev | Open |
| 16 | Small-text legibility & contrast | 🟢 Minor | Dev | Open |
| 17 | Polish nits (orphan, placeholder, clef, overlap) | 🟢 Minor | Dev | Open |
| 18 | Verify facts shown on the site | 🟢 Minor | Phoebe | Open |

---

## 🔴 Critical

### 1. Placeholder teacher cards
**Problem:** On the Teachers page, 3 of 4 cards (Harmoniche Deng, Angel Zheng, Tyler Nguyen)
show initials, "Instrument TBC", and on flip "Biography coming soon" / "Coming soon". This
is the page parents use to decide on trust, and it reads as unfinished. The 3+1 grid also
leaves a lone orphan card.

**Where:** `teachers.html` (lines ~60–116: `teacher-role` "Instrument TBC", bio/qualification
"coming soon" text).

**Change:**
- Phoebe supplies, per teacher: portrait-orientation photo, instrument(s), qualifications,
  2–3 sentence bio, WWVP confirmation.
- Dev: fill in cards with real photos (the same treatment as Phoebe's card).
- **Until a teacher is ready, hide their card entirely.** One real card beats three blanks.
- Re-check grid balance once the final count is known (avoid a single orphan card on its own row).

*Blocked by:* Phoebe's to-do §1.

### 2. No photo of an actual lesson
**Problem:** The whole site shows concert halls, empty rooms and stock instrument close-ups,
with no teacher and student together. The audience is parents of kids from age 5, and
nothing shows what a lesson looks like.

**Change:**
- Phoebe supplies a teacher-with-student photo (landscape + portrait versions), with
  written parent permission. Hands-only or over-the-shoulder shots are fine.
- Dev: use it prominently. Best candidates: homepage "More than lessons — a musical home"
  frame (currently the studio photo), or the "Three simple steps" section.

*Blocked by:* Phoebe's to-do §2.

---

## 🟡 Moderate

### 3. Same photos reused across pages
**Problem:** The site feels thin because the same few images repeat:

| Image | Used in |
|---|---|
| `assets/IMG_5717.jpg` (concert hall) | Home hero (`css/sections.css:189`), "Music is meant to be shared" (`index.html:158`), Teachers + Careers hero (`css/sections.css:273`) |
| Studio room | Home about frame (`index.html:~32`), About hero + Lessons hero (`css/sections.css:~258`), About "Our space" (`about.html:~82`) |
| `assets/phoebe mu.jpg` | `index.html:95`, `about.html:24`, `teachers.html:34`, `phoebe.html:16` |

The concert hall also implies a scale (orchestra, big venue) that a young studio doesn't
have yet. It's at odds with the honest "young studio" copy.

**Change:**
- Aim for **one distinctive image per page section**.
- Keep the concert hall in at most **one** place (the home hero is fine as an aspirational
  backdrop). Replace it in "Music is meant to be shared" with a real student-performance
  photo when available, or a non-venue image (sheet music, hands) meanwhile.
- Teachers hero: use a teaching or instrument image instead of the concert hall.
- Use a different Phoebe photo on at least one of the four placements.

*Partly blocked by:* Phoebe's to-do §4.

### 4. Studio photo didn't match the rest
**Problem:** The original studio photo was bright and flat-lit, with white walls and a
brown cover draped over the piano. Next to the moody stock photography it looked amateur.

**Status:** **In progress.** The overhaul worktree has uncommitted changes adding
`piano room wide.jpg`, `piano room vertical.jpg`, and `piano room moody.jpg` (renamed from
the `pianor room moody.jpg` typo), wired into `index.html`, `about.html`, and the
About/Lessons hero in `css/sections.css` (with a portrait swap under 600px).

**Remaining:** visually confirm the new shots read warm (cover off, lid open, warm light)
and that the About + Lessons heroes no longer share the same image (see #3).

### 5. Founder photo crop
**Problem:** In `assets/phoebe mu.jpg`, the piano lid reflects Phoebe's face upside down.
It's visible top-right and along the bottom edge, and reads as a second face.

**Change:** Re-crop to Phoebe only (or replace with a new portrait). Check every placement
in #3's table, especially the teacher card and the homepage founder block, where the
reflection is most visible.

*Blocked by:* Phoebe's to-do §5 (uncropped original or new photo).

### 6. No booking CTA in the mobile header
**Problem:** Below the mobile breakpoint the header shows only the monogram, wordmark and
burger. The gold "Book a trial" button (`_includes/header.html:17`) disappears, and most
parents will browse on phones.

**Change:** Keep a compact gold "Book" button visible in the mobile header (or a slim sticky
bottom bar). Make sure the touch target is at least 44×44px and that it doesn't crowd the wordmark.

*Decision:* Phoebe's to-do Q3 (recommended: add it).

### 7. Loader delays every homepage visit
**Problem:** `loader: true` on `index.html:4` shows the piano-key loader for ~2–3s before
the hero appears. On mobile this reads as a slow site.

**Change (by decision):**
- (b) Show only on first visit per session (`sessionStorage` flag in `index.js`, guarded
  and wrapped in try/catch), **or**
- (c) remove `loader: true`.
- Either way, preserve the no-JS fallback (loader only under `.js`, per `css/loader.css`).

*Decision:* Phoebe's to-do Q1.

### 8. Long, dark pages with large dead gaps
**Problem:** The homepage is ~7,900px tall at 1366px. Consecutive near-black sections blur
together, and there are oversized empty gaps:
- under "Explore all lessons →" at the end of the instruments section
- after the pricing CTA, before "Beyond the lesson"
- after the About mission quote, before "How we teach"

The black ↔ blue band transitions are hard-edged.

**Change:**
- Reduce vertical section padding (via the spacing tokens in `css/tokens.css`, not literals).
- Audit sections with excess bottom padding (instruments, pricing, about mission quote).
- Consider soft gradient transitions between the dark and blue bands, or at least consistent
  hairline rules.
- Optional, parked idea: one light section to break the darkness. See
  `docs/design-ideas-light-section.md` in the overhaul worktree.

### 9. Pricing shown three times
**Problem:** Full pricing cards appear on the homepage (`index.html:142` →
`_includes/pricing.html`), then on Lessons as cards (`lessons.html:119`) **and** as a table
(`lessons.html:131` → `_includes/price-table.html`). The table also appears in `terms.html:48`.

**Change:**
- Homepage: replace the full cards with a short teaser ("Lessons from $52 · first lesson
  free" + "See all fees →" to `lessons.html#fees`).
- Lessons: keep **either** the cards **or** the table at desktop (suggest cards on desktop,
  table on mobile, see #11).
- Note that `pricing.html` and `price-table.html` must stay in sync. Consider one shared
  data source (e.g. `_data/prices.json`) so prices live in one place.

*Decision:* Phoebe's to-do Q4.

### 10. Honest trust signals
**Problem:** There's no social proof, which is expected for a 2025 studio, but there's also
little *verifiable* reassurance near the CTAs.

**Change:** Add a slim trust strip near the hero or contact CTA with only true, checkable items:
- AMEB / Trinity syllabus teaching (text, not logos, unless permitted)
- "Every teacher holds a current ACT WWVP registration"
- Phoebe's credentials (LTCL · LMusA · Kingsland Scholar, as confirmed)
- First-name family quotes **only** if Phoebe supplies them with permission. Otherwise omit.

*Blocked by:* Phoebe's to-do §6.

---

## 🟢 Minor

### 11. Pricing card alignment & mobile layout
**Problem:**
- The 60-min cards have an extra `.price-sub` line ("Under Grade 8" / "From Grade 8",
  `_includes/pricing.html:40`), so their header boxes are taller and the "Packages" rows sit
  lower than in the 30/45-min cards.
- Every card has empty space at the bottom.
- On mobile the four cards stack into a very long scroll.

**Change:**
- Reserve the subtitle line on all cards (give the header a fixed min-height, or use a
  subgrid so rows align across cards).
- Trim the bottom padding.
- On mobile, show the compact `price-table` instead of four stacked cards, or use a
  horizontal scroll-snap row.

### 12. Two logos in the desktop header
**Problem:** The tiny "K" monogram (left) and the centred "Kreutzer" wordmark
(`nav-logo-main`, `_includes/header.html:16`) both show on desktop. The monogram is
illegible at that size.

**Change:** Keep one (suggest the wordmark). *Decision:* Phoebe's to-do Q2.

### 13. Theory & Musicianship card has no photo
**Problem:** On the Lessons page, five instrument cards have photos but Theory &
Musicianship (`lessons.html:70`) shows a "♭♯" glyph on a gradient.

**Change:** Use a sheet-music or pencil-on-score photo (the Debussy manuscript asset could
work as an interim). *Partly blocked by:* Phoebe's to-do §4.

### 14. Contact form starts below the fold
**Problem:** "Book a trial" lands on `contact.html`, whose tall "Get in touch" hero pushes
the form below the fold at 1366×850.

**Change:** Shrink the contact hero (or put the form beside the intro copy) so the form's
first fields are visible without scrolling. Consider renaming the hero to match the CTA
("Book your free trial").

### 15. Secondary links too faint
**Problem:** "Read our story →", "All teachers →", "Explore all lessons →" are tiny
letterspaced gold text, easy to miss and small tap targets on mobile.

**Change:** Increase their size/weight slightly and add padding for a ≥44px tap area.

### 16. Small-text legibility & contrast (needs measuring)
**Problem:** Eyebrow labels (tiny gold uppercase, wide tracking), the footer copyright and
the grey card body text on dark cards look borderline. These were judged by eye and not
measured.

**Change:** Run a WCAG AA contrast check on `--cream-dim` / gold-on-dark combinations in
`css/tokens.css`. Raise eyebrow size to ≥12px and reduce tracking slightly if needed.

### 17. Polish nits
| Issue | Where | Fix |
|---|---|---|
| "hours." orphaned on its own line in the closing CTA paragraph | `index.html:168` | Narrow the max-width or use `text-wrap: balance` / `pretty` |
| Placeholder truncated ("Whichever is easiest to rea…") | `contact.html:45` | Shorten to "Email or phone" |
| Treble-clef watermark clipped at the right edge | `css/sections.css:390` | Reposition so the full glyph shows, or crop intentionally |
| Phoebe teacher card: "PIANO & THEORY" label sits over the photo and competes with the name | `teachers.html` / `css/teachers.css` | Stronger bottom gradient or move the label below the image |
| Possible empty band above the header on mobile Teachers page | `teachers.html` at 375px | **Unconfirmed.** Seen once mid-scroll, so verify before fixing |

### 18. Facts to verify on the site
- "two Canberra studios" (`about.html:19`) and "our Canberra studios" (`_includes/footer.html:5`).
  Confirm the count; make it singular if there's one.
- Hours (Mon–Fri 3–8pm, Sat 9am–4pm). Still current?
- Phoebe's credential line. Complete and accurate?

*Owner:* Phoebe's to-do §6.

---

## What to keep (don't regress these)
- The dark/gold palette, serif headings with one gold italic accent word, and eyebrow + rule motif.
- The hero hierarchy: headline → one-line offer → bright gold "Book a free trial" + quiet outline secondary.
- Instrument photo cards.
- Transparent pricing with "first 30-minute lesson free".
- "Three simple steps" (Enquire → Meet → Play).
- The short contact form (name, contact, instrument, optional message).
- Full-width stacked CTAs on mobile.

## Suggested order of work
1. **Now, no input needed:** #6, #8, #11, #12 (pending Q2), #14, #15, #16, #17
2. **After Phoebe's decisions:** #7, #9
3. **After Phoebe's content arrives:** #1, #2, #3, #5, #10, #13, then finish #4
