# Finnomena Club · Seminar — Theme Brief
> Market talks on an open white canvas — a members' seminar to hear named speakers and reserve your seat

**Theme:** light
**Immersive Theme:** club

This is a Finnomena Theme Brief, not a Reference Design. Finnomena wrote it for one Campaign Page in the Club Immersive Theme. Colors and type come from the installed Neon theme and Immersive Themes CSS: the values below are for reading, never for retyping. Provisional pending design owner review.

Club opens the membership on a white canvas with navy ink and a navy main action. Light Grey steps build quiet section blocks, and Yellow marks the one moment on a screen that matters. It reads as Finnomena's everyday voice, dressed for a campaign. For the seminar evening the accent is held back for the seat reservation block alone, so readers meet it only after the agenda has made its case. The page leans on rounded blocks and generous gaps, giving each talk and speaker room to read as a calm, ordered step. It closes on a hushed hall, chairs filling row by row before the first speaker steps up. Membership ratio: White 60 / Light Grey 15 / Yellow 15 / Navy 10.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| White 100 | `#ffffff` | `--immersive-canvas` | Page background; the largest share of the page |
| Navy 100 | `#01172b` | `--immersive-text` | Body and heading text on the canvas |
| Light Grey 100 | `#a6bfcc` | `--immersive-palette-100` | Theme tint block; text Navy 100 |
| Light Grey 75 | `#bccfd9` | `--immersive-palette-75` | Theme tint block; text Navy 100 |
| Light Grey 50 | `#d3dfe6` | `--immersive-palette-50` | Theme tint block; text Navy 100 |
| Light Grey 25 | `#e9eff2` | `--immersive-palette-25` | Theme tint block; text Navy 100 |
| Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block, highlight or offer; text Navy 100 |
| Yellow 75 | `#f5fb6d` | `--immersive-accent-75` | Accent block, highlight or offer; text Navy 100 |
| Yellow 50 | `#f9fc9e` | `--immersive-accent-50` | Accent block, highlight or offer; text Navy 100 |
| Yellow 25 | `#fcfece` | `--immersive-accent-25` | Accent block, highlight or offer; text Navy 100 |
| Navy 100 | `#01172b` | `--immersive-action` | Main action fill; label White 100 |
| White 100 | `#ffffff` | `--immersive-on-action` | Main action label |

**Shared secondary colors** (every theme; small highlight, tag and illustration blocks only):

| Family | 100 | 75 | 50 | 25 | Text |
|---|---|---|---|---|---|
| Green (`--immersive-green-*`) | `#00e76b` | `#40ed90` | `#80f3b5` | `#bff9da` | Navy |
| Blue (`--immersive-blue-*`) | `#50cfff` | `#7cdbff` | `#a8e7ff` | `#d3f3ff` | Navy |
| Purple (`--immersive-purple-*`) | `#aa46c3` | `#bf74d2` | `#d5a3e1` | `#ead1f0` | White or Navy |
| Red (`--immersive-red-*`) | `#f73232` | `#f96565` | `#fb9999` | `#fdcccc` | Navy |
| Orange (`--immersive-orange-*`) | `#f26414` | `#f58b4f` | `#f9b28a` | `#fcd8c4` | Navy |

## Tokens — Typography

### IBM Plex Sans Thai · `--fontFamily-body`
- **Substitute:** none. IBM Plex Sans Thai is part of the Brand Floor; `sans-serif` is only the CSS fallback.
- **Weights:** 400, 500, 600, 700
- **Role:** every text role, Thai and Latin alike.

### Type Scale

| Role | Family | Weight | Size | Line Height | Token |
|---|---|---|---|---|---|
| display1 | IBM Plex Sans Thai | 400 | 92px | 102px | `--fontSize-display1` |
| display2 | IBM Plex Sans Thai | 400 | 60px | 70px | `--fontSize-display2` |
| display3 | IBM Plex Sans Thai | 700 | 54px | 64px | `--fontSize-display3` |
| title1 | IBM Plex Sans Thai | 400 | 28px | 34px | `--fontSize-title1` |
| title2 | IBM Plex Sans Thai | 400 | 22px | 28px | `--fontSize-title2` |
| title3 | IBM Plex Sans Thai | 400 | 20px | 25px | `--fontSize-title3` |
| title4 | IBM Plex Sans Thai | 400 | 20px | 28px | `--fontSize-title4` |
| headline | IBM Plex Sans Thai | 500 | 17px | 22px | `--fontSize-headline` |
| body | IBM Plex Sans Thai | 400 | 17px | 22px | `--fontSize-body` |
| label1 | IBM Plex Sans Thai | 600 | 14px | 20px | `--fontSize-label1` |
| label2 | IBM Plex Sans Thai | 400 | 14px | 20px | `--fontSize-label2` |
| caption | IBM Plex Sans Thai | 600 | 13px | 16px | `--fontSize-caption` |
| legal | IBM Plex Sans Thai | 400 | 13px | 16px | `--fontSize-legal` |

## Tokens — Spacing & Shapes

**Base unit:** 8px

**Density:** spacious

### Spacing Scale

| Name | Value | Token |
|---|---|---|
| 0 | 0px | `--space-0` |
| 0.25 | 2px | `--space-0_25` |
| 0.5 | 4px | `--space-0_5` |
| 0.75 | 6px | `--space-0_75` |
| 1 | 8px | `--space-1` |
| 1.5 | 12px | `--space-1_5` |
| 2 | 16px | `--space-2` |
| 3 | 24px | `--space-3` |
| 4 | 32px | `--space-4` |
| 5 | 40px | `--space-5` |
| 6 | 48px | `--space-6` |
| 7 | 56px | `--space-7` |
| 8 | 64px | `--space-8` |
| 9 | 72px | `--space-9` |
| 10 | 80px | `--space-10` |

### Border Radius

| Name | Value | Token |
|---|---|---|
| 0 | 0px | `--borderRadius-0` |
| 100 | 4px | `--borderRadius-100` |
| 200 | 8px | `--borderRadius-200` |
| 300 | 12px | `--borderRadius-300` |
| 400 | 16px | `--borderRadius-400` |
| 500 | 24px | `--borderRadius-500` |
| 600 | 32px | `--borderRadius-600` |
| 700 | 40px | `--borderRadius-700` |
| 800 | 48px | `--borderRadius-800` |
| 900 | 56px | `--borderRadius-900` |
| 1000 | fully round | `--borderRadius-1000` |

### Picks

- **Block and card radius:** `--borderRadius-400` (16px)
- **Section gap:** `--space-8` (64px)
- **Card padding:** `--space-3` (24px)
- **Element gap:** `--space-1` (8px)–`--space-2` (16px)
- **Page width:** contained, held to the `Viewport max-width` breakpoint token

## Components

### Main Action
**Role:** The one primary action per section

Neon `Button` on `--immersive-action` with an `--immersive-on-action` label (18.12:1), headline type role, `--borderRadius-1000` corners, 48px high with `--space-4` side padding.

### Secondary Action
**Role:** An alternative beside the main action

Transparent fill with `--immersive-text` label and a 2px `--immersive-text` outline, the same height and radius as the Main Action.

### Logo
**Role:** Brand identity

Neon's logo item, the light-surface mark. Never recreate the wordmark as text.

### Tint Block
**Role:** Group a section or a set of details

`--immersive-palette-100` to `--immersive-palette-25` fills, each with its own `--immersive-on-palette-*` text. Flat: no border, no shadow; step lighter for nested emphasis.

### Accent Block
**Role:** The highlighted offer or call-out

`--immersive-accent-100` fill with `--immersive-on-accent-100` text. One per screen; lighter accent steps hold supporting copy.

### Speaker card
**Role:** One speaker and their talk

Uses var(--immersive-palette-25) as its fill and var(--immersive-on-palette-25) for text. It carries no outline, rounds to var(--borderRadius-400) and keeps var(--space-3) of inner space. A portrait slot leads, then name in headline, job title in label2, talk title in title3 and a one-line takeaway in body.

### Agenda timeline
**Role:** The evening's sessions in order

Sits on var(--immersive-palette-50) with var(--immersive-on-palette-50) text, thin row dividers rather than a frame, var(--borderRadius-400) rounding and var(--space-3) spacing. Each row sets the time in label1, the session title in headline and the speaker in label2. Breaks show as a plain caption row, never as a card.

### Seat reservation form
**Role:** One-step seat booking form

A var(--immersive-palette-25) panel carrying var(--immersive-on-palette-25) text, framed by no border, curved to var(--borderRadius-400) and padded with var(--space-3). Name, phone, member number and session choice use label1 labels over body inputs, with a legal consent line. A single var(--immersive-action) button in var(--immersive-on-action) ends it.

### Seats-left call-out
**Role:** Date, venue and seats remaining

Filled var(--immersive-accent-50) with var(--immersive-on-accent-50) text, borderless, var(--borderRadius-400) radius, var(--space-3) inside. Date and venue sit in title2, the seats-left count in display3, then a var(--immersive-action) button labelled in var(--immersive-on-action). Show only a live count, never an invented one.

## Do's and Don'ts

### Do
- Set `data-immersive-theme="club"` on the page root and color every section from its `--immersive-*` properties.
- Pair every fill with its own `--immersive-on-*` text color.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per background block.
- Treat the canvas as its own color: it is not a palette step, so blocks may use `--immersive-palette-100`.
- List each speaker's credentials inside their Speaker card in var(--immersive-text), keeping the hero free of titles and qualifications.

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small tags and illustration blocks.
- Do not use `--immersive-action` (Navy 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not promise returns or outcomes in Agenda timeline session titles — seminar copy is educational and must never read as financial advice.

## Surfaces

| Level | Name | Value | Purpose |
|---|---|---|---|
| 1 | Canvas | `#ffffff` | Page background |
| 2 | Light Grey 100 | `#a6bfcc` | Tint block |
| 3 | Light Grey 75 | `#bccfd9` | Tint block |
| 4 | Light Grey 50 | `#d3dfe6` | Tint block |
| 5 | Light Grey 25 | `#e9eff2` | Tint block |
| — | Yellow 100 | `#f2f93c` | Accent block |

## Elevation

- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.

## Imagery

Photography of members taking part leads the page. Frame close and mid shots of people mid-movement or mid-conversation, leaving generous space beside the subject for copy. Show real members and the brand's own staff, candid and never posed stock, set against the canvas so the accent stays reserved for emphasis. The brand's spot illustrations appear only in small explanatory blocks, never as hero art. Icons stay small, simple and in the accent. Beside the Brand Pattern call-out, images sit in their own column and never overlap the pattern. Keep it sparse: at most one large image per screen, with supporting images kept small. Imagery never carries another brand's logo, copy or look, and IBM Plex Sans Thai and the Finnomena logo stay on every screen.

## Brand Pattern

- **Section:** call-out
- **Colourway:** Light Grey (`palette`)
- **Ground:** `--immersive-palette-25` with `--immersive-on-palette-25` text

The call-out section carries the Brand Pattern. Its fill is the ground step, and the pattern's tones are other steps of the Light Grey family only. The pattern comes from Finnomena's Block pattern generator with a locked seed and is committed as SVG; copy sits in its Text zone. Never crop, stretch, recolor, fade or hand-draw it, and never imitate it in CSS.

## Layout

A contained page on the light canvas that opens on a centred hero: headline and one supporting line above the main action, no lead image. Sections then alternate between open canvas and raised blocks at borderRadius-400. The proof section sits in a block and holds a row of Speaker card items; the first detail-list returns to canvas with the Agenda timeline; the second detail-list sits in a block as a short list of what each seat includes. The call-out is the Brand Pattern section and carries the Seats-left call-out. The form section returns to canvas with the Seat reservation form. A top bar links by anchor to each section, and the footer is full, with logo, contact lines and legal links. Rhythm is spacious and still: space-8 between sections, space-3 inside every card.

## Motion

**Level:** still

No motion. Content is present on load; hover and focus change color or outline only, with no transition. Under `prefers-reduced-motion: reduce`, use the still level.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text`
- background: `--immersive-canvas`; tint blocks `--immersive-palette-100`…`-25`
- accent: `--immersive-accent-100`
- primary action: `--immersive-action`, label `--immersive-on-action`
- highlight: `--immersive-blue-*`, small blocks only

**Example Component Prompts**

1. Create a Speaker card: var(--immersive-palette-25) fill, var(--immersive-on-palette-25) text, no outline, rounded to var(--borderRadius-400), var(--space-3) padding, a portrait slot first, then the speaker name in headline, job title in label2, talk title in title3 and a one-line takeaway in body.

2. Create a three-talk Agenda timeline: var(--immersive-palette-50) surface carrying var(--immersive-on-palette-50) text, thin row dividers instead of a frame, var(--borderRadius-400) rounding, var(--space-3) spacing, each row giving the time in label1, session title in headline and speaker in label2, with breaks as plain caption rows.

3. Create a Seats-left call-out: var(--immersive-accent-50) fill and var(--immersive-on-accent-50) text, borderless, var(--borderRadius-400) radius, var(--space-3) inside, date and venue in title2, the live seats-left count in display3, then one var(--immersive-action) button labelled in var(--immersive-on-action).

4. Create a Seat reservation form: a var(--immersive-palette-25) panel with var(--immersive-on-palette-25) text, no border, var(--borderRadius-400) curves, var(--space-3) padding, label1 labels over body inputs for name, phone, member number and session choice, a consent line in legal, and a single var(--immersive-action) button in var(--immersive-on-action).

## Sibling Themes

- **Exclusive** (light, canvas `#f2f93c`) — Saturated yellow canvas with navy ink, cooled by blue-grey blocks; loud and warm.
- **Private** (light, canvas `#a6bfcc`) — Calm blue-grey canvas with navy ink and yellow highlights; quiet and considered.
- **Ultra** (dark, canvas `#01172b`) — Deep navy canvas with white type, a yellow spark and blue-grey support; dark and confident.

## Quick Start

Start from the Neon base (`shadcn init` with Neon's `neon-base` item), add `@neon/theme`, the Immersive Themes item and this brief's item, then set `data-immersive-theme="club"` on the page root. Never retype the values above.

### Tailwind v4

```css
@theme inline {
  /* Aliases only; the values stay in the generated Immersive Themes CSS */
  --color-canvas: var(--immersive-canvas);
  --color-ink: var(--immersive-text);
  --color-palette-100: var(--immersive-palette-100);
  --color-on-palette-100: var(--immersive-on-palette-100);
  --color-palette-75: var(--immersive-palette-75);
  --color-on-palette-75: var(--immersive-on-palette-75);
  --color-palette-50: var(--immersive-palette-50);
  --color-on-palette-50: var(--immersive-on-palette-50);
  --color-palette-25: var(--immersive-palette-25);
  --color-on-palette-25: var(--immersive-on-palette-25);
  --color-accent-100: var(--immersive-accent-100);
  --color-on-accent-100: var(--immersive-on-accent-100);
  --color-accent-75: var(--immersive-accent-75);
  --color-on-accent-75: var(--immersive-on-accent-75);
  --color-accent-50: var(--immersive-accent-50);
  --color-on-accent-50: var(--immersive-on-accent-50);
  --color-accent-25: var(--immersive-accent-25);
  --color-on-accent-25: var(--immersive-on-accent-25);
  --color-action: var(--immersive-action);
  --color-on-action: var(--immersive-on-action);
}
```
