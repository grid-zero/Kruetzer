# Design idea (parked): a light / white section — "Option B"

Explored 2026-07-06 while iterating on the palette. **Not applied** — we went with
soft-white headings/accents ("Option A") instead. Kept here for later.

## The idea

Break the all-dark layout by flipping **one whole section** to a near-white background
with dark text. Most of the site stays dark; one section (e.g. pricing or the intro)
becomes light. Adds strong contrast and "breathing room".

## Suggested tokens

```css
--bg-light: #f5f4ef;  /* near-white section background (soft, not pure #fff) */
--ink:      #16181d;  /* text on a light background */
```

## How the light section reworks its colors

On a light background the dark-theme colors need dark-mode counterparts:

| Role        | Dark theme            | On the light section        |
|-------------|-----------------------|-----------------------------|
| background  | `--bg` / `--bg-card`  | `--bg-light` (#f5f4ef)      |
| body text   | `--cream-dim`         | `#4a4c52` (dark gray)       |
| headline    | `--cream`             | `--ink` (#16181d)           |
| script kicker | `--gold-light`      | `#b8912f` (darker gold — light gold is invisible on white) |
| title/label | `--text-blue`         | `#234c72` (the accent blue, which reads well on white) |
| button      | gold bg / dark text   | dark bg (`--ink`) / light text |

Key gotcha: `--gold-light` (#e2c47a) and `--cream` disappear on white — the light
section must use the **darker** gold (#b8912f) and the accent blue for contrast.

## Good candidate sections

- **Pricing** (`src/css/pricing.css`) — a light pricing block would stand out and feel
  premium.
- **Intro** on the homepage — a light band early on sets a fresh tone.

## Implementation sketch

Add the tokens above, then scope a `[light]` / `.light` modifier on the chosen section
that overrides background + the text-role colors per the table. Everything else on the
page stays on the dark theme.
