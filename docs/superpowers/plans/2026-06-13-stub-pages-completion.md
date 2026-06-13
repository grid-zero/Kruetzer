# Stub Pages Completion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the `lessons`, `phoebe`, and `careers` stub pages into real structured pages assembled from existing components, with prose left as descriptive manual-completion prompts.

**Architecture:** Eleventy + Liquid static site. Each page is composed only from section types and class hooks already proven on the homepage and built pages — **no new CSS**. The homepage's pricing block is first extracted into a shared `_includes/pricing.html` partial so the homepage and the Lessons page share one source of truth for packages/prices.

**Tech Stack:** Eleventy 3 (11ty), Liquid templates, hand-written CSS (unchanged), vanilla JS (unchanged). Verification is `npm run build` + targeted `grep` assertions — this repo has **no unit-test harness** (see CLAUDE.md).

**Spec:** `docs/superpowers/specs/2026-06-13-stub-pages-completion-design.md`

**Cross-cutting rules (apply to every task):**
- All asset/link paths stay **relative** (`assets/...`, `contact.html`) — never root-relative.
- Reuse `.reveal` / `.reveal-delay-*` exactly as built pages do; do not touch `reveal.css` or `index.js`.
- Interior pages use the blue 30vh hero: `<section intro style="min-height: 30vh; background: var(--bg-blue);">`.
- Prose prompts use the convention `[Write N sentences on …]`; known facts are written directly.
- Commit steps `git add` **only the exact files named** — the working tree has unrelated uncommitted changes that must not be swept in.
- Run all commands from the repository root.

---

## File Structure

| File | Responsibility | Action |
|------|----------------|--------|
| `src/_includes/pricing.html` | Single source of truth for the lesson-packages pricing grid | Create |
| `src/index.html` | Homepage — pricing block replaced by an include | Modify (pricing section only) |
| `src/lessons.html` | Lessons page (experience & levels; reuses pricing partial) | Replace stub |
| `src/phoebe.html` | Phoebe Mu teacher-bio page | Replace stub |
| `src/careers.html` | Careers / expression-of-interest page | Replace stub |
| `src/shop.html`, `src/resources.html` | Untouched — remain "Coming Soon" | No change |

---

## Task 1: Extract the pricing partial and rewire the homepage

**Files:**
- Create: `src/_includes/pricing.html`
- Modify: `src/index.html:110-140` (the `<section pricing>…</section>` block)

- [ ] **Step 1: Capture a baseline of the homepage's rendered pricing content**

Run:
```bash
npm run build
grep -c -E 'Lesson packages|10 Lesson pack|\$500|\$60|Most popular' _site/index.html
```
Expected: a count of `5` (each marker present once). Record this — it must still be `5` after the refactor.

- [ ] **Step 2: Create the partial `src/_includes/pricing.html`**

Paste the pricing block verbatim (this is the exact content currently in `src/index.html` lines 110–140):

```html
<section pricing>
  <div>
  <h3 class="reveal">Transparent pricing</h3>
  <h2 id="pricing-heading" class="reveal">Lesson packages</h2>
  <div class="pricing-grid">
    <div class="reveal">
      <h3>Trial Lesson</h3>
      <strong>Free</strong>
      <p>Your first lesson is on us. No commitment required.</p>
      <ul><li>30-minute introductory lesson</li><li>Level assessment</li><li>Personalised learning plan</li><li>Studio tour</li></ul>
      <a href="contact.html" class="btn btn-clear" style="width:100%;justify-content:center;">Book Now</a>
    </div>
    <div class="featured reveal reveal-delay-1">
      <span>Most popular</span>
      <h3>10 Lesson pack</h3>
      <strong>$500 <span>$50/ 30 min</span></strong>
      <p>Pre-purchase a term block and save.</p>
      <ul><li>Save $100 per term</li><li>Regular lessons</li></ul>
      <a href="contact.html" class="btn" style="width:100%;justify-content:center;">Enquire</a>
    </div>
    <div class="reveal reveal-delay-2">
      <h3>Single lessons</h3>
      <strong>$60 <span>/ 30 min</span></strong>
      <p>Individual lessons</p>
      <ul><li>Pay as you go</li><li>Flexible scheduling</li><li>No long-term commitment</li></ul>
      <a href="contact.html" class="btn btn-clear" style="width:100%;justify-content:center;">Get Started</a>
    </div>

  </div>
  </div>
</section>
```

- [ ] **Step 3: Replace the inline block in `src/index.html` with the include**

In `src/index.html`, delete the entire `<section pricing>…</section>` block (lines 110–140, starting `    <section pricing>` and ending at its matching `    </section>`) and put this single line in its place (same position, between `section[testimonials]` and `section[contact]`):

```liquid
    {% include "pricing.html" %}
```

- [ ] **Step 4: Build and verify the homepage pricing is unchanged and present**

Run:
```bash
npm run build
grep -c -E 'Lesson packages|10 Lesson pack|\$500|\$60|Most popular' _site/index.html
```
Expected: `5` — identical to the Step 1 baseline (proves the include resolved with the same content).

- [ ] **Step 5: Commit**

```bash
git add src/_includes/pricing.html src/index.html
git commit -m "refactor: extract pricing section into shared partial"
```

---

## Task 2: Build the Lessons page

**Files:**
- Replace: `src/lessons.html` (currently the "Coming Soon" stub)

- [ ] **Step 1: Replace `src/lessons.html` with the full structured page**

```html
---
title: "Lessons | Kreutzer"
description: "Private music lessons in Canberra for every level — from your first lesson through to AMEB and diploma preparation."
---
<section intro style="min-height: 30vh; background: var(--bg-blue);">
  <div>
    <h3>Learn With Us</h3>
    <h1>Music <em>Lessons</em></h1>
    <p>[Write 1–2 sentences introducing Kreutzer's lessons — who they are for and what makes them distinctive.]</p>
  </div>
</section>

<section default>
  <h3>The experience</h3>
  <h2>What a lesson looks like</h2>
  <p>[Write 2–3 sentences on what a typical lesson feels like — pace, structure, and the teacher's role in guiding the student.]</p>
  <p>[Write 2–3 sentences on how lessons are tailored to the individual — goals, repertoire choices, and how progress is tracked.]</p>
</section>

<section how-it-works>
  <div>
  <h3 class="reveal">Progression</h3>
  <h2 id="journey-heading" class="reveal">Your journey</h2>
  <div>
    <div class="reveal"><div>1</div><div>Beginner</div><p>[Write 1–2 sentences on what beginners focus on — fundamentals, reading music, building confidence.]</p></div>
    <div class="reveal reveal-delay-1"><div>2</div><div>Intermediate</div><p>[Write 1–2 sentences on the intermediate stage — expanding repertoire, technique, and musicality.]</p></div>
    <div class="reveal reveal-delay-2"><div>3</div><div>Advanced / Diploma</div><p>[Write 1–2 sentences on advanced and AMEB/diploma preparation — exams, performance, and independence.]</p></div>
  </div>
  </div>
</section>

<section default>
  <h3>Practicalities</h3>
  <h2>Formats &amp; policies</h2>
  <ul class="policy-list">
    <li>Lesson lengths: 30, 45 or 60 minutes, one-on-one.</li>
    <li>[Write the cancellation / rescheduling policy in one sentence.]</li>
    <li>[Write the make-up lesson policy in one sentence.]</li>
    <li>[Write one sentence on what a student should have at home to practise.]</li>
  </ul>
</section>

{% include "pricing.html" %}

<section contact>
  <div>
  <h3 class="reveal">Get started</h3>
  <h2 id="lessons-cta-heading" class="reveal">Ready to begin?</h2>
  <p class="reveal reveal-delay-1">[Write 1–2 sentences encouraging the reader to book a free trial lesson.]</p>
  <a href="contact.html" class="btn reveal reveal-delay-2">Book a Trial Lesson</a>
  </div>
</section>
```

- [ ] **Step 2: Build and verify structure + shared pricing resolved**

Run:
```bash
npm run build
grep -c -E 'section intro|how-it-works|Your journey|Lesson packages|section contact' _site/lessons.html
grep -c '\[Write' _site/lessons.html
```
Expected: first grep returns `5` (all five structural markers present, including the pricing partial's "Lesson packages"); second grep returns `10` (every prose prompt rendered — 1 intro + 2 experience + 3 journey + 3 policy + 1 CTA).

- [ ] **Step 3: Commit**

```bash
git add src/lessons.html
git commit -m "feat: build out lessons page (experience, levels, pricing)"
```

---

## Task 3: Build the Phoebe teacher-bio page

**Files:**
- Replace: `src/phoebe.html` (currently the "Coming Soon" stub)

Reuses the homepage `section[about]` 2-column pattern. The text column uses `<company-story>` (not a `<div>`) on purpose: it is blockified as a grid item, and unlike a `<div>` it does not match the `section[about] > div > div` flex-row rule. The existing photo asset is `assets/phoebe mu.jpg` (filename contains a space — keep it exactly).

- [ ] **Step 1: Replace `src/phoebe.html` with the full bio page**

```html
---
title: "Phoebe Mu | Kreutzer"
description: "Meet Phoebe Mu — piano and theory teacher at Kreutzer, guiding students from beginner to AMEB diploma level."
---
<section intro style="min-height: 30vh; background: var(--bg-blue);">
  <div>
    <h3>Piano &amp; Theory</h3>
    <h1>Phoebe <em>Mu</em></h1>
    <p>[Write a one-line tagline introducing Phoebe.]</p>
  </div>
</section>

<section about>
  <div>
    <company-story>
      <h3 class="reveal">Biography</h3>
      <h2 class="reveal">About Phoebe</h2>
      <p>[Write 2–3 sentences on Phoebe's background and musical journey.]</p>
      <p>Phoebe is committed to providing high-quality, one-on-one music education, specialising in students from beginner to AMEB Diploma level.</p>
    </company-story>
    <img src="assets/phoebe mu.jpg" alt="Phoebe Mu">
  </div>
</section>

<section default>
  <h3>Credentials</h3>
  <h2>Qualifications</h2>
  <p class="tagline">Licentiate Diplomas in Piano Performance — Trinity College London &amp; AMEB</p>
  <ul class="policy-list">
    <li>[List a further qualification, award, or affiliation — one per line.]</li>
    <li>[List a further qualification, award, or affiliation — one per line.]</li>
  </ul>
</section>

<section default>
  <h3>Philosophy</h3>
  <h2>Teaching approach</h2>
  <p>[Write 2–3 sentences on Phoebe's teaching philosophy — how she works with students and what she emphasises.]</p>
</section>

<section contact>
  <div>
  <h3 class="reveal">Start learning</h3>
  <h2 class="reveal">Learn with Phoebe</h2>
  <p class="reveal reveal-delay-1">[Write 1–2 sentences inviting the reader to book a trial lesson with Phoebe.]</p>
  <a href="contact.html" class="btn reveal reveal-delay-2">Book a Trial Lesson</a>
  </div>
</section>
```

- [ ] **Step 2: Build and verify structure + photo reference + prompts**

Run:
```bash
npm run build
grep -c -E 'section about|<company-story>|assets/phoebe mu.jpg|Qualifications|Teaching approach' _site/phoebe.html
grep -c '\[Write\|\[List' _site/phoebe.html
```
Expected: first grep returns `5` (all structural markers + the photo reference present — the `<company-story>` opening tag matches one line); second grep returns `6` (four `[Write` prompts + two `[List` prompts).

- [ ] **Step 3: Commit**

```bash
git add src/phoebe.html
git commit -m "feat: build out phoebe teacher bio page"
```

---

## Task 4: Build the Careers page

**Files:**
- Replace: `src/careers.html` (currently the "Coming Soon" stub)

Shape: always-hiring expression-of-interest — no job-listing structure. The closing CTA links to the studio email (`mailto:`), not the contact form.

- [ ] **Step 1: Replace `src/careers.html` with the full page**

```html
---
title: "Careers | Kreutzer"
description: "Teach at Kreutzer — we're always keen to hear from passionate music educators in Canberra."
---
<section intro style="min-height: 30vh; background: var(--bg-blue);">
  <div>
    <h3>Join Us</h3>
    <h1>Teach at <em>Kreutzer</em></h1>
    <p>[Write 1–2 sentences inviting great teachers to consider joining Kreutzer.]</p>
  </div>
</section>

<section how-it-works>
  <div>
  <h3 class="reveal">Why Kreutzer</h3>
  <h2 id="why-heading" class="reveal">A studio worth teaching at</h2>
  <div>
    <div class="reveal"><div>♪</div><div>Community</div><p>[Write 1–2 sentences on the collaborative, supportive teaching community.]</p></div>
    <div class="reveal reveal-delay-1"><div>↗</div><div>Growth</div><p>[Write 1–2 sentences on professional development and growth opportunities.]</p></div>
    <div class="reveal reveal-delay-2"><div>◷</div><div>Flexibility</div><p>[Write 1–2 sentences on flexible scheduling and studio support.]</p></div>
  </div>
  </div>
</section>

<section default>
  <h3>Our people</h3>
  <h2>Who we're looking for</h2>
  <p>[Write 2–3 sentences describing the kind of teachers Kreutzer wants — qualifications, attitude, and approach to students.]</p>
</section>

<section contact>
  <div>
  <h3 class="reveal">Get in touch</h3>
  <h2 class="reveal">We're always keen to hear from great teachers</h2>
  <p class="reveal reveal-delay-1">[Write 1–2 sentences inviting an expression of interest, noting that there may not be a specific opening right now.]</p>
  <a href="mailto:hello@kreutzer.com.au" class="btn reveal reveal-delay-2">Register Your Interest</a>
  </div>
</section>
```

- [ ] **Step 2: Build and verify structure, mailto CTA, and prompts**

Run:
```bash
npm run build
grep -c -E 'Why Kreutzer|Community|Who we.re looking for|mailto:hello@kreutzer.com.au' _site/careers.html
grep -c '\[Write' _site/careers.html
```
Expected: first grep returns `5` (the three structural markers + the mailto, which appears twice: once in this page's CTA and once in the shared footer that every page includes); second grep returns `6` (every prose prompt rendered).

- [ ] **Step 3: Commit**

```bash
git add src/careers.html
git commit -m "feat: build out careers expression-of-interest page"
```

---

## Task 5: Final full verification

**Files:** none (verification only)

- [ ] **Step 1: Clean build and page count**

Run:
```bash
npm run build
ls _site/*.html | wc -l
```
Expected: build succeeds; `12` HTML pages (unchanged count — the three pages were already present as stubs).

- [ ] **Step 2: Confirm the "Coming Soon" pages were left untouched**

Run:
```bash
grep -l 'Coming <em>Soon' _site/shop.html _site/resources.html
grep -L 'Coming <em>Soon' _site/lessons.html _site/phoebe.html _site/careers.html
```
Expected: first command lists both `_site/shop.html` and `_site/resources.html` (still placeholders); second command lists all three built pages (they no longer contain the placeholder).

- [ ] **Step 3: Confirm the shared pricing renders on both consuming pages**

Run:
```bash
grep -c '10 Lesson pack' _site/index.html _site/lessons.html
```
Expected: `1` for each file (the partial resolved on both the homepage and the Lessons page).

- [ ] **Step 4: Manual acceptance (human — not scriptable)**

Run `npm run dev` and check in a browser:
- Lessons, Phoebe, Careers at 1024 / 768 / ~400px: heroes, the how-it-works cards, the Phoebe `section[about]` photo+text grid, the `.policy-list`s, and the pricing grid all render correctly and match the homepage's visual language.
- Phoebe's photo loads (`assets/phoebe mu.jpg`, space in filename).
- No-JS check: disable JavaScript and reload each page — `.reveal` content is visible (not stuck hidden), and no loader blocks the page.

---

## Self-Review notes

- **Spec coverage:** pricing partial extraction (Task 1), Lessons experience/levels/formats/pricing/CTA (Task 2), Phoebe bio/qualifications/approach/CTA (Task 3), Careers culture/who/EOI-CTA (Task 4), shop & resources left as-is + verification (Task 5). All spec sections mapped.
- **No new CSS** introduced anywhere; every section type and class hook used (`intro`, `default`, `how-it-works`, `about`/`company-story`, `pricing`, `contact`, `.policy-list`, `.tagline`, `.reveal*`) already exists.
- **Prompt counts** in the grep assertions were derived from the literal `[Write`/`[List` markers in each page's Step 1 content; if you edit the prose prompts, update the expected counts to match.
