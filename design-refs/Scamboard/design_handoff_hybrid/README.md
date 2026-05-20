# Handoff — Scamboard "Hybrid" Redesign

## Overview

This package redesigns Scamboard around a **"Reddit bones + MySpace soul"** direction.
The current site reads as "cyberpunk crypto terminal" — cold pure-black background,
monospace everywhere, red used as the brand color. The hybrid direction keeps the
dark mode your audience expects, but recovers the **personal, community-driven,
slightly-chaotic** feel that "MySpace meets Reddit" is supposed to evoke:

- **Reddit-ish structure:** karma-arrow gutter, sort tabs, "subscammer" communities,
  dense post rows, sidebar with rules + live feed + top watchdogs.
- **MySpace-ish soul:** every user's `profileColor` bleeds into the cards they
  authored, sticker-style threat badges with a small rotation, a "Top 8 Watchdogs"
  module, a mood widget, a theme-song slot on user profiles, and a "wall" for
  visitor comments.
- **Warmer dark palette:** `#14100f` background instead of `#0a0a0f` — keeps it dark
  but pulls it out of cold-blue cyberpunk into something warmer and friendlier.

---

## About the design files

The files in `design-refs/` are **HTML design references**, not production code to
copy directly. They are React + Babel prototypes that render in a static HTML page
so you can see exactly how every screen should look and behave.

Your job is to **recreate these designs in the existing Scamboard codebase**
(Next.js 14 App Router + TypeScript + Tailwind CSS + Prisma + NextAuth), reusing the
patterns and structure already there. The HTML/CSS in the references is for
**visual specification only** — do not copy the raw `<style>` blocks; instead
translate them into Tailwind classes + the CSS-variable token system in
`app/globals.css`.

### Fidelity

**High fidelity.** Exact colors, typography, spacing, and component shapes are
specified. Recreate pixel-perfectly using the existing Tailwind setup.

---

## How to use the references

1. Open `design-refs/Hybrid pages reference.html` in a browser. You'll see all
   three screens stacked, with no canvas chrome.
2. `design-refs/Scamboard redesign canvas.html` is the full exploration canvas
   with all three competing directions (A · MySpace 2004, B · Old Reddit but evil,
   C · Hybrid) side-by-side, for context — the chosen direction is **C · Hybrid**.
3. The JSX files contain the exact CSS values and structure for each screen.
   Use them as the source of truth when a measurement isn't clear from the
   rendered output.

---

## Screens to implement

### 1. Home feed — `app/page.tsx`

Reference component: `design-refs/direction-c-hybrid.jsx` → `HybridHome`.

**Layout** — three-column grid at desktop, single column on mobile:

| Col | Width  | Content |
|-----|--------|---------|
| 1   | 56px   | Vertical icon rail (Report / Bounty / Roast / Watch / Tools) |
| 2   | flex   | Hero stat strip → Top 8 Most Wanted grid → sort tabs → All Reports list |
| 3   | 320px  | My profile card → My Top 8 Watchdogs → Live feed → Top watchdogs → Roast of the week |

Page max-width 1280px, gap 18px, padding 20px 22px.

**Sections:**

- **Top nav (sticky)** — logo (skull + word-mark in Tahoma) + tagline + tab links
  (Feed / Hall of Infamy / Watchdogs / Bounties) + search box + user chip in their
  own profileColor.
- **Subscammer chip bar** — horizontally scrolling pills: `r/all`, `r/rugpulls`,
  `r/honeypots`, `r/twitterscams`, `r/alphafrauds`, `r/bridgehacks`, `r/discord_scams`,
  `r/under_investigation`, `+ new`. Current is filled red, others are outline.
- **Hero stat strip** — 4 stat cards: Scammers logged (red), Confirms/24h (gold),
  LP saved est. (green), Active watchdogs (cyan).
- **Top 8 Most Wanted** — 4×2 grid of "wanted" cards (replaces current `TopTenBoard`,
  drop to 8). Each card: rank in big Tahoma, left-edge accent in threat color,
  short identifier (mono), type + chain, roast title in italic gold, confirms + comments.
  Ranks 1/2/3 get gold/silver/bronze rank text.
- **All Reports** — sort tabs (Hot / New / Top confirmed / Controversial / Most
  roasted / Recently bountied), then a list of `<ReportCard>` (see below).

### 2. Report card — `components/ReportCard.tsx`

Reference: same JSX file, `.hy-post` block.

**Layout** — two-column grid: 48px gutter + flex body. 1px border, 10px radius,
hover lifts border to `#3a2c29`.

**Left gutter (48px):**
- Up arrow (currently 18×18 SVG triangle), color `#5a4540` default, `#ff3b6c` when
  voted-up.
- Score (Tahoma 900, 13px).
- Down arrow.
- Rank number (`#42`) in 10px Tahoma 900 below the arrows.

**Left edge accent** (3px wide):** picks up the reporting user's `profileColor`
with a soft glow (`box-shadow: 0 0 12px <color>88`). **This is the key MySpace
move — every report card visually belongs to its author.**

**Body:**
- Meta strip: subscammer link (`r/rugpulls`), · "posted 3h ago by" · author chip
  (background `<profileColor>22`, text `<profileColor>`, border `<profileColor>44`,
  rounded pill, prefixed with a dot in their color), · `chain SOL`, then right-aligned:
  type flair + threat sticker + bounty flair.
- Title: monospace identifier + "—" + roast title in italic gold.
- Reason text (2-3 lines, line-height 1.55).
- Actions row: `💬 N comments`, `📎 evidence (3)`, `💰 add bounty`, `🔥 roast it`,
  `🔗 linked wallets (4)`, `↗ share` — all muted color, hover to light.

### 3. Scammer profile — `app/scammer/[identifier]/page.tsx`

Reference: `design-refs/hybrid-scammer.jsx` → `HybridScammer`.

**Sections (top → bottom):**

1. **Breadcrumb nav** — `← back · r/rugpulls / 0x8a3F…901B / case file`.
2. **Hero / mugshot block** — two-column:
   - **Left:** "mug frame" (110×130 box with horizontal scan-lines + threat-color
     border + glow). Next to it: identifier label, full address with copy button,
     roast title in 26px italic gold Tahoma 900, then "also seen as:" chips
     (linked aliases).
   - **Right:** big threat sticker (LEGENDARY · TIER 5, rotated −2deg),
     huge confirm count (64px Tahoma 900 in red), buttons: Watch, Add evidence,
     Roast, "I was rugged too" (primary).
3. **Two-column body** (1fr + 320px sidebar):
   - **Main:**
     - Original report card (reason text with deployer addr / token names inlined).
     - **Receipts gallery** — 4-col grid of receipt cards (tag pill + source + summary,
       e.g. `tx · solscan.io · LP migration · 1,247 SOL out`).
     - **Linked wallets** — table of rows with colored dot, monospace address,
       relationship label, confirm count. Each row shows how this wallet relates
       to the primary.
     - **Discussion** — sort tabs (Top / New / Controversial / Most damning),
       comment composer, then comment threads with indented replies. Each comment
       has the author's color theming applied to their name and avatar.
   - **Sidebar:**
     - **Bounty pool** — big gold number, contributor avatars (stacked with negative
       margin), "+ contribute" button.
     - **Rap sheet** — key/value list: first seen, tokens deployed, est. stolen,
       chain(s), linked twitters, pattern, avg time-to-rug, status.
     - **Timeline** — 5–8 rows with `time-ago · what happened`.
     - **Same pattern** — list of 3 other scammers with the same MO.

### 4. User profile — `app/profile/[nickname]/page.tsx`

Reference: `design-refs/hybrid-user.jsx` → `HybridUser`.

**This is the MySpace-iest page in the system.** The user's `profileColor` is
applied as a CSS variable `--usercolor` on the root, which colors:
- The banner gradient (radial wash in their color)
- The identity card border + glow
- The avatar background + ring
- Their handle text
- Achievement stickers and tab highlights
- The XP-bar fill gradient (their color → gold)

**Layout** — banner (220px) with the user's nickname in giant rotated transparent
type behind it, then a two-column grid (280px identity card + flex right column).

**Identity card (left):**
- Avatar (120px circle, their color, double-ringed).
- Name + handle (in their color).
- Title pill (in their color).
- "online · last seen 2m ago" with pulsing green dot.
- Action buttons: `+ watch` (primary, their color), `message`, `★`.
- **Mood block** (dashed border between sections) — rows of `mood: vengeful 🗡`,
  `currently: tracing tornado outflows`, `specialty:`, `chain main:`, `member since:`.
- **Theme song player** — small play button + track name + time + animated bars.
- **Sticker grid** — wrapped row of rotated achievement stickers ("Top hunter Q1",
  "Caught a legendary", "100% confirm rate", etc.) — each rotated ±2deg.

**Right column (in order):**
- Tabs row: About / Stats / Reports / Wall / Roasts / Customize.
- **Bio block** — themed background gradient using `--usercolor`, Tahoma 900 heading,
  multi-paragraph bio, monospace signoff (`— rugslayer.eth · est. 2022 · ☠`).
- **Stat grid** (4 cards): reports / confirms / roasts won / confirm rate.
- **XP block** — title + current XP, gradient progress bar, "X to next tier" foot.
- **Top 8 Watchdogs grid** — 4×2 of friend cards: 64px rounded square avatar in
  friend's color + handle + title + mood quote.
- **Recent reports list** — same row layout as the home feed, but compact.
- **The wall** — composer ("Leave something on @rugslayer's wall…") + comment rows.

---

## Design tokens

Update `app/globals.css` — replace the current `:root` block with these values:

```css
:root {
  /* Background — warm dark, not cold */
  --background: #14100f;
  --background-secondary: #1a1413;
  --background-tertiary: #161110;
  --background-card: #1a1413;

  /* Foreground — warm off-white */
  --foreground: #ece6df;
  --foreground-muted: #c4b8aa;
  --foreground-dimmed: #8a7d72;
  --foreground-faint: #5a4540;

  /* Borders */
  --border: #2c211f;
  --border-hover: #3a2c29;
  --border-strong: #5a4540;

  /* Primary palette */
  --red-primary: #ff3b6c;    /* was #ff1744 — slightly warmer */
  --red-dark: #c11a4c;
  --orange-primary: #ff7a3a;
  --gold-primary: #ffc547;
  --green-primary: #6ce28a;
  --cyan-primary: #5cd0e2;
  --purple-primary: #b58aff;
  --hot-pink: #ff3b9a;        /* used in user profileColors only */

  /* Threat tier colors (used for sticker badges + glow accents) */
  --threat-low: #5cd0e2;
  --threat-medium: #ffc547;
  --threat-high: #ff7a3a;
  --threat-extreme: #ff3b6c;
  --threat-legendary: #ff3b6c;
}
```

### Typography

```css
/* In layout.tsx, replace next/font/google's Geist_Mono import:
   keep it for addresses ONLY, and add Inter as the primary. */

import { Inter, JetBrains_Mono } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", weight: ["400","500","600","700","800","900"] });
const jbmono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400","500","700"] });

/* body */
font-family: var(--font-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;

/* monospace ONLY for: wallet addresses, contract IDs, transaction hashes, code blocks. */

/* Display headings — use a Tahoma stack directly (no import). This is the bit that
   gives the design its character; Tahoma reads as MySpace-era and contrasts the body sans. */
.font-display { font-family: Tahoma, Verdana, Geneva, sans-serif; font-weight: 900; letter-spacing: -0.3px; }
```

| Use case                  | Font                          | Weight | Size      |
|---------------------------|-------------------------------|--------|-----------|
| Body                      | Inter (`--font-sans`)         | 400/500| 13–14px   |
| Section headings          | Tahoma stack                  | 900    | 17–22px   |
| Hero counters (e.g. 287)  | Tahoma stack                  | 900    | 64px      |
| Roast titles              | Tahoma stack, italic, gold    | 600/900| 13–26px   |
| Threat sticker labels     | Tahoma stack                  | 900    | 10px      |
| Wallet addresses / IDs    | JetBrains Mono (`--font-mono`)| 400/600| 11–14px   |
| Meta text                 | Inter                         | 400    | 10–11px   |

### Spacing scale

Stick to Tailwind defaults. Cards use `p-3` to `p-5`. Page padding `px-[22px]
py-[20px]`. Section gap `gap-4` (16px). Card row gap `gap-2` (8px).

### Radius scale

| Element            | Radius |
|--------------------|--------|
| Pills / chips      | `9999px` |
| Threat stickers    | `3px`  |
| Buttons            | `6px`  |
| Cards              | `10px` |
| Hero blocks        | `12px` |

### Shadow scale

| Effect             | Value |
|--------------------|-------|
| Card hover         | `0 4px 12px rgba(0,0,0,0.3)` |
| Profile color glow | `0 0 20px <color>33` |
| Legendary glow     | `0 0 30px #ff3b6c66` (animated, see legendary keyframes) |
| Sticker drop       | `2px 2px 0 #14100f` |

---

## New / refactored components

Map the redesign onto your existing component tree:

| File                              | Action     | Notes |
|-----------------------------------|------------|-------|
| `app/page.tsx`                    | refactor   | Three-column layout; new hero stat strip; integrate new components below |
| `app/globals.css`                 | refactor   | New token block (see above); keep threat-level + animation classes |
| `app/layout.tsx`                  | refactor   | Add Inter + JetBrains Mono font imports |
| `components/Navbar.tsx`           | refactor   | Logo + tag + tabs + search + user-chip in their profileColor; sticky |
| `components/ReportCard.tsx`       | refactor   | Karma gutter + author-color accent edge + sticker threat badge — see screen 2 |
| `components/TopTenBoard.tsx`      | refactor → `TopEightWanted.tsx` | Drop to 8, new wanted-card layout |
| `components/ThreatBadge.tsx`      | refactor   | Sticker style with rotation: tahoma 900, 10px, `transform: rotate(-2deg)`, 1.5px outlined border in threat color, dark tinted background; LEGENDARY uses `hy-wiggle` animation |
| `components/LiveFeed.tsx`         | refactor   | Rows of `@who · what · target (mono) · ago` with per-user color |
| `components/UserProfileCard.tsx`  | refactor   | Banner with user color wash; identity block; XP; mood widget |
| `components/XPBar.tsx`            | tweak      | Fill gradient should be `user color → gold` instead of green→cyan |
| `components/ScammerAvatar.tsx`    | keep       | Used inside new wanted cards + dossier mug |
| `components/BountyBadge.tsx`      | keep       | Re-style as gold pill |
| **NEW** `SubscammerChips.tsx`     | add        | Horizontally scrolling chip bar of communities |
| **NEW** `KarmaGutter.tsx`         | add        | The 48px arrow/score column on every report card |
| **NEW** `HeroStats.tsx`           | add        | The 4 colored stat cards |
| **NEW** `SortTabs.tsx`            | add        | Hot / New / Top / Controversial / Most roasted / Bountied |
| **NEW** `ReceiptsGallery.tsx`     | add        | 4-col grid of receipt cards on the scammer page |
| **NEW** `LinkedWallets.tsx`       | add        | Wallet relationship table on the scammer page |
| **NEW** `BountyPool.tsx`          | add        | Big gold number + stacked contributor avatars |
| **NEW** `RapSheet.tsx`            | add        | Key/value list of scammer attributes |
| **NEW** `Timeline.tsx`            | add        | When/what rows on scammer page |
| **NEW** `Top8Watchdogs.tsx`       | add        | The Top-8 grid (used in sidebar AND on user profiles) |
| **NEW** `MoodWidget.tsx`          | add        | "current mood:" panel on user profiles |
| **NEW** `ThemeSongPlayer.tsx`     | add        | Slot UI for a pinned audio clip on user profiles |
| **NEW** `Wall.tsx`                | add        | The "leave something on my wall" feature |
| **NEW** `AchievementStickers.tsx` | add        | Rotated sticker grid of unlocks |

---

## Interactions & behavior

- **Karma arrows:** clicking up confirms the report (existing
  `POST /api/reports/[id]/confirm`). Clicking the same arrow again removes the
  confirm. Down is a new "dispute" interaction — needs a DB column + endpoint.
  When voted-up, the up arrow is filled `#ff3b6c`; when voted-down, the down
  arrow is filled `#5cd0e2`. Score text becomes red when net-positive on confirms.
- **Subscammer chips:** filter the feed by scam category. URL-driven (e.g.
  `?sub=rugpulls`). The "current" chip becomes solid red. The bar scrolls
  horizontally on overflow with momentum on touch.
- **Sort tabs:** controls the existing `?sort=` param. Current tab background is
  `var(--border)` with light text.
- **Hover on report cards:** border lightens to `--border-hover`. The author-color
  accent on the left edge intensifies (use `filter: brightness(1.15)` on hover).
- **Threat sticker LEGENDARY:** subtle wiggle animation, defined as:
  ```css
  @keyframes hy-wiggle { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(0deg); } }
  .threat-legendary { animation: hy-wiggle 1.8s ease-in-out infinite;
                       box-shadow: 0 0 12px rgba(255,59,108,0.4); }
  ```
- **User profileColor application:** when rendering anything authored by a user
  (their report cards, their comments, their chip, their profile page), apply
  the color as `--usercolor` on the relevant root element, and reference it from
  Tailwind via arbitrary `style={{ borderColor: \`\${user.profileColor}66\`, ... }}`.
  This is already supported by your `User.profileColor` Prisma column.
- **Top 8 Watchdogs (on home sidebar):** ordered by user's own personal pick if
  they've set them, else by who they interact with most (auto-curated). Drag to
  reorder when on your own profile.
- **The wall:** new comment type. New `WallPost` model: `userId` (whose wall),
  `authorId`, `body`, `createdAt`. Posts are rate-limited like comments.
- **Theme song slot:** for v1, store a URL to a short audio clip on the User
  model (`themeSongUrl`, `themeSongLabel`). Render `<audio>` with a custom
  play button. No autoplay.
- **Mood + currently fields:** new fields on User. Free-text, max 60 chars,
  default to friendly placeholders.

---

## State management

Use the existing patterns:
- Server components fetch data via Prisma in `app/.../page.tsx`.
- Client components (`"use client"`) own interaction state — votes, modal open,
  composer text, drag-reorder state for Top 8.
- The session-derived "me" object is already available via NextAuth
  (`useSession()` client-side, `getServerSession()` server-side).

New state to add:
- `disputeCount` per Report (mirror of `confirmCount`).
- `profileColor` (you have this), plus new fields: `mood`, `currentlyDoing`,
  `specialty`, `themeSongUrl`, `themeSongLabel`, `topWatchdogIds` (string[]
  or join table).
- `Subscammer` (community) model: `slug`, `name`, `description`, `rules`,
  `createdById`, `memberCount`. Each Report gets `subscammerSlug`.

---

## Assets

The reference designs use **no external image assets**. Every visual element is
CSS, SVG, or unicode glyph. Avatars are rendered as letter-in-colored-circle
based on the user's nickname + profileColor. Threat badges, stickers, mug
frames, and banner washes are all gradient/CSS.

When you ship, the only assets you'll need to add are:
- A favicon (you have one).
- Optional: a small inline SVG logo to replace the unicode skull (`☠`) in the
  nav, for crispness at high DPI. The current emoji-as-logo works for v1.

---

## Files in this bundle

- `README.md` — this file.
- `design-refs/Hybrid pages reference.html` — open this in a browser to view
  all three hybrid screens stacked. **Start here.**
- `design-refs/Scamboard redesign canvas.html` — full canvas with the rejected
  directions (A · MySpace 2004, B · Old Reddit) for context. Direction C
  (Hybrid) was chosen.
- `design-refs/direction-c-hybrid.jsx` — source of truth for the Home feed.
- `design-refs/hybrid-scammer.jsx` — source of truth for the Scammer dossier.
- `design-refs/hybrid-user.jsx` — source of truth for the User profile.
- `design-refs/shared-data.jsx` — mock data shape used in the prototypes.
  Useful to compare to your Prisma schema and decide which fields you still
  need to add (the new ones are listed in the *State management* section).

---

## Build order suggestion

1. Update `app/globals.css` with the new token block. Reload the existing site —
   it should still work, just warmer/pinker. This is your safety net.
2. Add Inter + JetBrains Mono fonts to `layout.tsx`. Swap body font.
3. Refactor `ThreatBadge.tsx` to the sticker style — every page using threat
   badges instantly modernizes.
4. Refactor `ReportCard.tsx` with karma gutter + author color accent. Now your
   home feed is 80% there.
5. Build `SubscammerChips.tsx` + wire to the `?sub=` URL param. Add the
   Subscammer Prisma model + migrate.
6. Refactor `TopTenBoard` → `TopEightWanted`. Drop to 8.
7. Refactor the home page layout to the 3-column grid; add `HeroStats` and
   sidebar widgets.
8. Build the scammer dossier (mugshot, receipts, linked wallets, bounty pool,
   timeline) — this is the biggest new page.
9. Build the user profile (banner wash, mood widget, Top 8 Watchdogs, wall) —
   add the new User fields.
10. Polish: hover states, transitions, the legendary wiggle.
