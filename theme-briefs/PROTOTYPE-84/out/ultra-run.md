# Finnomena Ultra · Run — Theme Brief
> Fast feet on a shared start line — an open invitation for every member to sign up and run

**Theme:** dark
**Immersive Theme:** ultra

This is a Finnomena Theme Brief, not a Reference Design. Finnomena wrote it for one Campaign Page in the Ultra Immersive Theme. Colors and type come from the installed Neon theme and Immersive Themes CSS: the values below are for reading, never for retyping. Provisional pending design owner review.

Ultra sets white type on a deep navy canvas, and a white main action carries the call on every section. Navy steps hold the sections, Yellow lifts a single highlight, and Light Grey support blocks carry detail. It is dark, confident and high-contrast. For the race weekend the accent is saved for one moment, the start time and meeting point, so the eye lands on it the way a runner spots the first marker. Rounded blocks and generous gaps keep the route clear, letting each section read like a steady stretch of road between turns. Nothing crowds the line. The page closes on members lacing up together at a chalked start line in the early light. Membership ratio: Navy 60 / Light Grey 15 / Yellow 15 / White 10.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Navy 100 | `#01172b` | `--immersive-canvas` | Page background; the largest share of the page |
| White 100 | `#ffffff` | `--immersive-text` | Body and heading text on the canvas |
| Navy 100 | `#01172b` | `--immersive-palette-100` | Theme tint block; text White 100 |
| Navy 75 | `#415160` | `--immersive-palette-75` | Theme tint block; text White 100 |
| Navy 50 | `#808b95` | `--immersive-palette-50` | Theme tint block; text Navy 100 |
| Navy 25 | `#c0c5ca` | `--immersive-palette-25` | Theme tint block; text Navy 100 |
| Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block, highlight or offer; text Navy 100 |
| Yellow 75 | `#f5fb6d` | `--immersive-accent-75` | Accent block, highlight or offer; text Navy 100 |
| Yellow 50 | `#f9fc9e` | `--immersive-accent-50` | Accent block, highlight or offer; text Navy 100 |
| Yellow 25 | `#fcfece` | `--immersive-accent-25` | Accent block, highlight or offer; text Navy 100 |
| Light Grey 100 | `#a6bfcc` | `--immersive-support-100` | Support block for detail; text Navy 100 |
| Light Grey 75 | `#bccfd9` | `--immersive-support-75` | Support block for detail; text Navy 100 |
| Light Grey 50 | `#d3dfe6` | `--immersive-support-50` | Support block for detail; text Navy 100 |
| Light Grey 25 | `#e9eff2` | `--immersive-support-25` | Support block for detail; text Navy 100 |
| White 100 | `#ffffff` | `--immersive-action` | Main action fill; label Navy 100 |
| Navy 100 | `#01172b` | `--immersive-on-action` | Main action label |

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

**Density:** comfortable

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

- **Block and card radius:** `--borderRadius-500` (24px)
- **Section gap:** `--space-10` (80px)
- **Card padding:** `--space-4` (32px)
- **Element gap:** `--space-1` (8px)–`--space-2` (16px)
- **Page width:** full-bleed: section fills run edge to edge, content keeps its own column

## Components

### Main Action
**Role:** The one primary action per section

Neon `Button` on `--immersive-action` with an `--immersive-on-action` label (18.12:1), headline type role, `--borderRadius-1000` corners, 48px high with `--space-4` side padding.

### Secondary Action
**Role:** An alternative beside the main action

Transparent fill with `--immersive-text` label and a 2px `--immersive-text` outline, the same height and radius as the Main Action.

### Logo
**Role:** Brand identity

Neon's logo item, the dark-surface mark. Never recreate the wordmark as text.

### Tint Block
**Role:** Group a section or a set of details

`--immersive-palette-75` to `--immersive-palette-25` fills, each with its own `--immersive-on-palette-*` text. Flat: no border, no shadow; step lighter for nested emphasis.

### Accent Block
**Role:** The highlighted offer or call-out

`--immersive-accent-100` fill with `--immersive-on-accent-100` text. One per screen; lighter accent steps hold supporting copy.

### Support Block
**Role:** Detail and reference content

`--immersive-support-100` to `--immersive-support-25` fills with their `--immersive-on-support-*` text, for detail lists and secondary information.

### Race distance card
**Role:** One selectable race distance option

var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The distance sits in title2 above label2 rows for start time, cut-off and member price. Each card ends in one var(--immersive-action) select button with var(--immersive-on-action) text. Only one card shows as picked.

### Route overview
**Role:** Course map with its checkpoints

var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. A labelled map image slot leads, followed by checkpoints in headline with distance markers in caption and water stations in label2. Never leave the map slot unlabelled.

### Race-day schedule
**Role:** Timeline of race-day events

var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. Each row pairs a label1 time with a body item and a label2 place, running check-in, warm-up, start, finish and awards in order. Rows stay plain text, never buttons.

### Registration call-out
**Role:** Main registration prompt

var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The deadline leads in title2, the member benefit follows in body, then one var(--immersive-action) button with var(--immersive-on-action) text. This is the only main registration action on the page.

## Do's and Don'ts

### Do
- Set `data-immersive-theme="ultra"` on the page root and color every section from its `--immersive-*` properties.
- Pair every fill with its own `--immersive-on-*` text color.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per background block.
- Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.
- Print the registration deadline beside every main action in the Registration call-out and each Race distance card, set in var(--immersive-text).

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small tags and illustration blocks.
- Do not use `--immersive-action` (White 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not place the Route overview map behind section content as decoration — runners need to read every turn and aid station clearly.

## Surfaces

| Level | Name | Value | Purpose |
|---|---|---|---|
| 1 | Canvas | `#01172b` | Page background |
| 2 | Navy 75 | `#415160` | Tint block |
| 3 | Navy 50 | `#808b95` | Tint block |
| 4 | Navy 25 | `#c0c5ca` | Tint block |
| — | Yellow 100 | `#f2f93c` | Accent block |

## Elevation

- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.

## Imagery

Photography of members taking part leads the page. Use close and mid shots that catch people mid-movement or mid-conversation, and leave generous open space beside the subject so copy has room to sit. Show real members and the brand's own staff. Keep every shot candid and never use posed stock. Set the photographs against the canvas and keep the accent for actions only. In the hero, give the photograph its own column beside the Brand Pattern section so the two never overlap. Use the brand's spot illustrations only in small explanatory blocks. Keep icons simple, single-weight and quiet. Keep the page sparse: no more than one large image per screen, and keep supporting images small. Imagery never carries another brand's logo, copy or look, and IBM Plex Sans Thai and the Finnomena logo stay on every screen.

## Brand Pattern

- **Section:** hero
- **Colourway:** Navy (`palette`)
- **Ground:** `--immersive-palette-100` with `--immersive-on-palette-100` text (the canvas itself)

The hero section carries the Brand Pattern. Its fill is the ground step, and the pattern's tones are other steps of the Navy family only. The pattern comes from Finnomena's Block pattern generator with a locked seed and is committed as SVG; copy sits in its Text zone. Never crop, stretch, recolor, fade or hand-draw it, and never imitate it in CSS.

## Layout

A full-bleed page that opens on a split hero: headline, supporting line and main action on one side, the lead image on the other, stacking image-last on narrow screens, with the Brand Pattern set behind the hero only. Below it, sections alternate between open canvas and raised blocks at borderRadius-500. The first detail-list holds the Race distance card set on canvas; the call-out carries the Registration call-out as a block; the second detail-list pairs the Route overview with the Race-day schedule on canvas; the proof section sits in a block; the form section returns to canvas for registration. There is no top navigation; after the hero, a sticky main action appears on narrow screens. The footer stays minimal with logo, organiser line and legal links. Keep rhythm comfortable: space-10 between sections, space-4 inside cards, subtle motion.

## Motion

**Level:** subtle

Each section fades in and rises a short way once, as it first enters view, over 200–300ms with ease-out. Hover and focus transitions take 150ms. Nothing loops, autoplays or moves on its own. Under `prefers-reduced-motion: reduce`, use the still level.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text`
- background: `--immersive-canvas`; tint blocks `--immersive-palette-75`…`-25`
- accent: `--immersive-accent-100`
- support: `--immersive-support-100`…`-25`
- primary action: `--immersive-action`, label `--immersive-on-action`
- highlight: `--immersive-green-*`, small blocks only

**Example Component Prompts**

1. Create a Race distance card set for 5K, 10K and 21K: var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, var(--borderRadius-500) corners, var(--space-4) padding, the distance in title2, label2 rows for start time, cut-off and member price, and one select button on var(--immersive-action) with var(--immersive-on-action) label.

2. Create a Registration call-out with its deadline: var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text, var(--borderRadius-500) corners, var(--space-4) padding, the deadline leading in title2, the member benefit below in body, and a single register button on var(--immersive-action) with var(--immersive-on-action) label.

3. Create a Route overview section: var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text, var(--borderRadius-500) corners, var(--space-4) padding, a labelled map image slot first, then checkpoints in headline with distance markers in caption and water stations in label2.

4. Create a Race-day schedule: var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, var(--borderRadius-500) corners, var(--space-4) padding, plain text rows pairing a label1 time, a body item and a label2 place for check-in, warm-up, start, finish and awards.

## Sibling Themes

- **Club** (light, canvas `#ffffff`) — White canvas with navy ink, blue-grey blocks and a yellow spark; open and everyday.
- **Exclusive** (light, canvas `#f2f93c`) — Saturated yellow canvas with navy ink, cooled by blue-grey blocks; loud and warm.
- **Private** (light, canvas `#a6bfcc`) — Calm blue-grey canvas with navy ink and yellow highlights; quiet and considered.

## Quick Start

Start from the Neon base (`shadcn init` with Neon's `neon-base` item), add `@neon/theme`, the Immersive Themes item and this brief's item, then set `data-immersive-theme="ultra"` on the page root. Never retype the values above.

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
  --color-support-100: var(--immersive-support-100);
  --color-on-support-100: var(--immersive-on-support-100);
  --color-support-75: var(--immersive-support-75);
  --color-on-support-75: var(--immersive-on-support-75);
  --color-support-50: var(--immersive-support-50);
  --color-on-support-50: var(--immersive-on-support-50);
  --color-support-25: var(--immersive-support-25);
  --color-on-support-25: var(--immersive-on-support-25);
  --color-action: var(--immersive-action);
  --color-on-action: var(--immersive-on-action);
}
```
