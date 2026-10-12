# Session Handoff — Teacher Photos, Profile Pages & Honest Teacher Claims

**Date:** 2026-10-12
**Project:** Kreutzer music-tuition website (Eleventy/11ty static site)
**Picks up when:** more photos of Phoebe arrive, **or** Tyler Nguyen's details (photo, instruments, bio) arrive.

## Repo state at handoff

- **Branch:** `claude/website-style-overhaul-ee15eb` · **HEAD:** `bf5f0eb` ("Add in new image sources")
- **Working tree: everything below is uncommitted.** Check `git status` first; the user may
  have committed it since.
- No build was run (per CLAUDE.md the user verifies visually). The user checked the pages in
  the browser during the session and approved the Phoebe page, the teachers banner and the
  careers banner.

## What this session did

Tackled `docs/visual-review-change-list.md` **#3 (photo reuse)**, **#5 (founder crop)** and
part of **#1 (placeholder teacher cards)**.

1. **New founder portrait** `assets/phoebe mu cropped.jpg` (lid reflection removed by the
   user) now replaces `phoebe mu.jpg` in `index.html`, `about.html`, `teachers.html` and
   `teachers/phoebe.html`. **Keep `phoebe mu.jpg` in assets** (the user asked for that).
2. **Phoebe's page** (`src/teachers/phoebe.html`) was split up to shorten the text wall. **Bio
   text is verbatim. Don't reword it.** The only edit was removing a duplicated sentence the user chose.
   - Hero: `Phoebe playing - Recital.jpg` (desktop) / `Phoebe playing front - Recital.jpg` (phone portrait)
   - About: cropped portrait + lede + Teaches/Levels/Ages
   - "A musical foundation" (`section alt`, `.split.reverse`): `Phoebe playing Steinway.jpg`.
     The user deliberately put the best photo in the body, not the hero, because the hero
     darkens it.
   - "Performing & composing": `Phoebe and Niche - Recital.jpg`
   - Qualifications / Teaching approach + CTA unchanged
3. **Stub pages are now full profiles** with the real bios (verbatim, user-supplied):
   - `src/teachers/harmoniche.html`: Piano. Hero `Phoebe and Niche - Recital.jpg`, portrait
     `Harmoniche Deng.jpg`, body `Angel and Niche - Recital.jpg`.
   - `src/teachers/angel.html`: **Flute, Piano & Voice** (flute first, per the user). Hero
     `Angel and Niche - Recital.jpg`, portrait `Angel Zheng.jpg` (landscape, uses `crop-right`).
   - Both have **Levels / Ages = "To be confirmed"** placeholders (`TODO(content)` above them).
4. **Teacher cards** (`teachers.html`): Harmoniche and Angel now have photos, roles, a summary,
   a qualification, and "Full profile" links. Tyler's card is **still the "TN" monogram
   placeholder on purpose**. The user said he's coming very soon, so don't hide it.
5. **Hero changes** (`css/sections.css`):
   - New **people hero** treatment for `page="teachers|phoebe|harmoniche|angel"`: near-black
     ground and a dark scrim instead of the navy wash. The navy wash made the warm orange stage photos look muddy.
   - Teachers hero is the group photo `Angel Phoebe and Niche.jpg`, with its own opacity
     (0.6) and contrast boost, because the user found it washed out at the shared 0.45.
   - Careers hero is `piano open back.jpg`, `background-position: center top` (shows the open lid).
   - The concert hall `IMG_5717.jpg` is now only on the homepage (hero + "Music is meant to be shared").
6. **New CSS hook** `img[crop-right]` (`features.css` for `.frame.portrait`, `teachers.css`
   for cards): `object-position: 75% center` for landscape photos with the subject right of centre.
7. **Rewrote "What every teacher brings"** on `teachers.html` to be factually true. It went
   from 4 pillars to 3:
   - WWVP for every teacher: **confirmed by the user for all teachers**.
   - "Active performers": recitals, competitions, ensembles, community events.
   - "Been through the exams": each teacher studied through AMEB or Trinity (Phoebe
     LTCL/LMusA, Angel ATCL flute, Harmoniche AMEB Grade 8).
   - Dropped "Formal qualifications" (false for Harmoniche, who is a med student with Grade 8)
     and "Ongoing development" (never confirmed). Also removed "qualified" from the meta description.
8. **CLAUDE.md updated** to match the codebase (teachers subfolder, hero variants, JS
   features, docs map, deploy branches).

## Photo inventory (`src/assets/`)

| File | Used where | Notes |
|---|---|---|
| `phoebe mu cropped.jpg` | Home spotlight, About founder, Teachers card, Phoebe page portrait | Used **4 times**; the only portrait of Phoebe |
| `phoebe mu.jpg` | nowhere | Keep, don't delete |
| `Phoebe playing Steinway.jpg` | Phoebe page body | Best photo; keep it in a body frame |
| `Phoebe playing - Recital.jpg` | Phoebe hero (desktop) | |
| `Phoebe playing front - Recital.jpg` | Phoebe hero (phone portrait) | |
| `Phoebe and Niche - Recital.jpg` | Phoebe body + Harmoniche hero | Reused across 2 pages |
| `Angel and Niche - Recital.jpg` | Angel hero + Harmoniche body | Reused across 2 pages |
| `Harmoniche Deng.jpg` | Harmoniche card + portrait | |
| `Angel Zheng.jpg` | Angel card + portrait (`crop-right`) | Landscape, low-res (69 KB) |
| `Angel Phoebe and Niche.jpg` | Teachers hero | |
| `piano open back.jpg` | Careers hero | |
| `piano open front.jpg` | nowhere yet | Candidate: About "Our space" or Lessons |
| `Phoebe and Jacob.jpg` | nowhere: **reserved** | For when that teacher is onboarded; don't use it before then |

## Resume path A: new photos of Phoebe arrive

The user said Phoebe "definitely needs a second portrait". Main goal: **stop the cropped
portrait appearing 4 times** (review #3: one distinctive image per page section).

1. Look at the new images first (Read them) and describe them to the user before placing anything.
2. Suggested split, to confirm with the user:
   - Keep `phoebe mu cropped.jpg` on the **Teachers card** and **Phoebe page portrait**.
   - Put the new portrait on the **homepage spotlight** (`index.html` ~line 95) and/or the
     **About founder frame** (`about.html` ~line 24, has a `figcaption`).
3. A teaching photo (Phoebe with a student) would also close **review #2** (no lesson photo).
   Best spots: the homepage "More than lessons — a musical home" frame, or "Three simple steps".
4. If a new photo is a better hero for her page, remember that people heroes are darkened to
   about 0.45 opacity. Detailed and colourful shots belong in the body.
5. Bio text on her page stays verbatim. Only move it around.

## Resume path B: Tyler Nguyen's details arrive

1. **Card** (`teachers.html`, Tyler block ~line 104, has a `TODO(content)`): replace
   `<div class="teacher-image" monogram aria-hidden="true">TN</div>` with
   `<div class="teacher-image"><img src="assets/…" alt="Tyler Nguyen"></div>`; set
   `.teacher-role`; write a short summary + qualification on the back using **only facts from
   his bio** (flag your wording to the user); change the button to `<a href="tyler.html" class="btn">Full profile</a>`.
   If his photo is landscape with the subject off-centre, use `crop-right` or add a sibling hook.
2. **Profile page:** create `src/teachers/tyler.html` by copying `harmoniche.html` (closest
   simple template). Output is flat (`_site/tyler.html`), so keep relative paths unchanged.
   - Bio paragraphs **verbatim**; first paragraph as `.lede`; split long bios across
     alternating `.split` / `.split.reverse` sections with photos, like Phoebe's and Angel's pages.
   - Teaches / Levels / Ages in the `.info-list`; use "To be confirmed" + `TODO(content)` if not supplied.
3. **Hero:** add `section[intro][page="tyler"]` to the people-hero selector list in
   `sections.css`, plus a `section[intro][page="tyler"]::before { background-image: …; background-position: … }` rule.
   If there's no suitable photo yet, leave `page="tyler"` off the list; the manuscript
   hero is the fallback. Don't use the plain navy-wash hero for a people photo.
4. **Re-check the "every teacher" claims** against his facts (TODO comment at the top of `teachers.html`):
   - "Every Kreutzer teacher is a trained performer" (faculty intro paragraph)
   - Pillar "Active performers"
   - Pillar "Been through the exams" (AMEB or Trinity)
   WWVP is confirmed by the user for all teachers. If a claim isn't true of Tyler, reword it.
   Don't drop him to keep the claim.
5. **Grid balance:** 4 cards in an `auto-fit, minmax(340px, 1fr)` grid. Check there's no lone orphan row at common widths (review #1).
6. Homepage TODO in `index.html` (~line 49) also asks whether "Real performers … still play
   on stage" holds for all teachers. Re-check it at the same time.

## Other open items from this session

- **Levels / Ages** for Angel and Harmoniche: placeholders, awaiting the user.
- Photo reuse is still on the list: `Phoebe and Niche` and `Angel and Niche` each appear on two
  teacher pages. Swap when more teacher photos arrive.
- The homepage "Music is meant to be shared" still uses the concert hall (review #3 wants a
  real performance photo). The recital photos or the group shot are candidates, but they're
  currently used on the teacher pages. Ask the user before reusing one.
- `piano open front.jpg` is unused.
- Section headings on the profile pages ("A musical foundation", "Performer & collaborator",
  "Music & medicine", etc.) are Claude's wording. The user hasn't objected, but they aren't the user's text.

## Working-style notes from the user

- Don't run builds or verify output; the user checks visually and reports back.
- Look and propose before implementing when the user says "don't start yet".
- Never change bio text. Only move it, unless the user asks for a specific edit.
- Copy must not overclaim (founded 2025; ~30 students; no testimonials yet).
