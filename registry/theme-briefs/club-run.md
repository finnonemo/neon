# Finnomena Club · Run — Theme Brief
> Running shoes on a white canvas — a shared start line and an open invitation to sign up

**Theme:** light
**Immersive Theme:** club

This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Club Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.

Club opens on a white canvas with navy ink and a navy main action. Light Grey steps build quiet section blocks, and Yellow steps carry the moments a page wants noticed. It reads as Finnomena's everyday voice, dressed for a campaign.
For race week the accent gathers at the Registration call-out, where a member signs up for the start, and it also runs through the patterned hero that opens the page, so the eye moves from first stride to commitment. Rounded blocks and generous gaps keep each part of the route easy to follow, like markers along a path. The page closes on numbered bibs pinned to shirts the night before the race.
Membership ratio: White 60%, Light Grey 15%, Yellow 15%, Navy 10%.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| White 100 | `#ffffff` | `--immersive-canvas` | Page background |
| Navy 100 | `#01172b` | `--immersive-text` | Text on the canvas |
| Light Grey 100 | `#a6bfcc` | `--immersive-palette-100` | Tint block; text `--immersive-on-palette-100` |
| Light Grey 75 | `#bccfd9` | `--immersive-palette-75` | Tint block; text `--immersive-on-palette-75` |
| Light Grey 50 | `#d3dfe6` | `--immersive-palette-50` | Tint block; text `--immersive-on-palette-50` |
| Light Grey 25 | `#e9eff2` | `--immersive-palette-25` | Tint block; text `--immersive-on-palette-25` |
| Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block; text `--immersive-on-accent-100` |
| Yellow 75 | `#f5fb6d` | `--immersive-accent-75` | Accent block; text `--immersive-on-accent-75` |
| Yellow 50 | `#f9fc9e` | `--immersive-accent-50` | Accent block; text `--immersive-on-accent-50` |
| Yellow 25 | `#fcfece` | `--immersive-accent-25` | Accent block; text `--immersive-on-accent-25` |
| Navy 100 | `#01172b` | `--immersive-action` | Main action fill; label `--immersive-on-action` |
| White 100 | `#ffffff` | `--immersive-on-action` | Main action label |

**Shared secondary colors**, in every theme, for small highlight, tag and illustration blocks only. Each step is `--immersive-<family>-<step>` with its own `on-` text variable.

| Family | 25 | 50 | 75 | 100 | Text |
|---|---|---|---|---|---|
| Green | `#bff9da` | `#80f3b5` | `#40ed90` | `#00e76b` | Navy 100 |
| Blue | `#d3f3ff` | `#a8e7ff` | `#7cdbff` | `#50cfff` | Navy 100 |
| Purple | `#ead1f0` | `#d5a3e1` | `#bf74d2` | `#aa46c3` | Navy 100 on 25, 50, 75; White 100 on 100 |
| Red | `#fdcccc` | `#fb9999` | `#f96565` | `#f73232` | Navy 100 |
| Orange | `#fcd8c4` | `#f9b28a` | `#f58b4f` | `#f26414` | Navy 100 |

## Tokens — Typography

### IBM Plex Sans Thai · `--fontFamily-body`
- **Substitute:** none. IBM Plex Sans Thai is part of the Brand Floor.
- **Weights:** 400, 500, 600, 700
- **Role:** every text role, Thai and Latin alike.

### Type Scale

| Role | Family | Weight | Size | Line Height | Token |
|---|---|---|---|---|---|
| display1 | IBM Plex Sans Thai | 400 | 92px | 102px | `--fontSize-display1` |
| display2 | IBM Plex Sans Thai | 400 | 60px | 70px | `--fontSize-display2` |
| display3 | IBM Plex Sans Thai | 700 | 54px | 64px | `--fontSize-display3` |
| title1 | IBM Plex Sans Thai | 400 | 28px | 40px | `--fontSize-title1` |
| title2 | IBM Plex Sans Thai | 400 | 22px | 32px | `--fontSize-title2` |
| title3 | IBM Plex Sans Thai | 400 | 20px | 28px | `--fontSize-title3` |
| title4 | IBM Plex Sans Thai | 400 | 20px | 28px | `--fontSize-title4` |
| headline | IBM Plex Sans Thai | 500 | 17px | 24px | `--fontSize-headline` |
| body | IBM Plex Sans Thai | 400 | 17px | 24px | `--fontSize-body` |
| label1 | IBM Plex Sans Thai | 600 | 15px | 24px | `--fontSize-label1` |
| label2 | IBM Plex Sans Thai | 400 | 15px | 24px | `--fontSize-label2` |
| caption | IBM Plex Sans Thai | 600 | 13px | 20px | `--fontSize-caption` |
| legal | IBM Plex Sans Thai | 400 | 13px | 20px | `--fontSize-legal` |

## Tokens — Spacing & Shapes

**Base unit:** `--space-1` (8px)

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

### Layout

| Name | Value | Token |
|---|---|---|
| Content max width | 1440px | `--layout-contentMaxWidth` |
| End margin | 16px | `--layout-endMargin` |
| End margin from a 1440px viewport | 24px | `--layout-endMargin` |

### Picks

- **Density:** comfortable
- **Block and card radius:** `--borderRadius-500` (24px)
- **Feature block radius:** `--borderRadius-700` (40px), for a block that spans the content column; cards inside it keep the block and card radius
- **Lead fact role:** `display3` (54px/64px), for the one fact a component leads with; other component text stops at `title1`
- **Hero name role:** `display1` (92px/102px), and `display2` (60px/70px) on narrow screens; nothing else in the hero is set larger than the name
- **Section gap:** `--space-10` (80px)
- **Card padding:** `--space-4` (32px)
- **Page width:** full-bleed. Content sits in one centred column at most `--layout-contentMaxWidth` (1440px) wide, with `--layout-endMargin` (16px, then 24px from a 1440px viewport) inside it. Section fills span the viewport.

## Components

### Main Action
**Role:** The main action of a section

Neon `Button` filled with `--immersive-action`, its label in `--immersive-on-action`, with `--borderRadius-1000` corners.

### Secondary Action
**Role:** An alternative beside the main action

Neon `Button` in its `secondary` variant: `--immersive-palette-75` fill with its label in `--immersive-on-palette-75`. On an accent fill, or on a block that already has that fill, the `ghost` variant: no fill, its label in the fill's `on-` text variable. Neon has no outlined button.

### Logo
**Role:** Brand identity

Neon's logo item, the light-surface mark. Never recreate the wordmark as text.

### Tint Block
**Role:** Group a section or a set of details

`--immersive-palette-100` to `--immersive-palette-25` fills, each with its own `on-` text variable. Flat: no border and no shadow; step lighter for nested emphasis.

### Accent Block
**Role:** Highlight an offer or call-out

`--immersive-accent-100` to `--immersive-accent-25` fills, each with its own `on-` text variable. Flat, like the Tint Block.

### Race distance card
**Role:** One distance to compare and pick

var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The distance leads in display3; the member price follows in title3, then start and cut-off times in body. Its select action is a Secondary Action with var(--immersive-palette-75) fill and its label in var(--immersive-on-palette-75) label1, never an outline.

### Route overview
**Role:** The course with its checkpoints

var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, no border, var(--borderRadius-700) corners and var(--space-4) padding. A title2 heading sits above a labelled map image slot with a caption; checkpoints follow in body with distance markers and water stations in label2, set inside a var(--immersive-palette-25) block with var(--immersive-on-palette-25) text. Nothing here goes above title1.

### Race-day schedule
**Role:** The race-day timeline

var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The start time leads in display3 as the one fact; each row pairs a time in title4 with its item in body and its place in label2, from check-in through warm-up, start, finish and awards. Only the start time sits above title1.

### Registration call-out
**Role:** The page's one registration action

var(--immersive-accent-75) fill with var(--immersive-on-accent-75) text, no border, var(--borderRadius-700) corners and var(--space-4) padding. The registration deadline leads in display3; the member benefit follows in title3 and body inside a var(--immersive-accent-25) block with var(--immersive-on-accent-25) text. The main action takes a var(--immersive-action) fill with its label in var(--immersive-on-action) label1. This is the page's only main action.

## Do's and Don'ts

### Do
- Pass `immersiveTheme="club"` to `ImmersiveLayout` and color every section from the theme's `--immersive-` variables.
- Pair every fill with its own `on-` text variable, and text on the canvas with `--immersive-text`.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per block.
- Use `--immersive-palette-100` for blocks too: the canvas is not a palette step.
- Place the registration deadline beside the Registration call-out main action in --immersive-action with --immersive-on-action text, and beside each Race distance card's secondary select action.
- Set each distance on its Race distance card and the deadline in the Registration call-out in display3, the largest thing in each block.

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.
- Do not use `--immersive-action` (Navy 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not use the Route overview map as a decorative background — runners need to read the route, so it must stay a clear, legible figure.
- Do not give the Race distance card, Route overview and Race-day schedule one shared card recipe — the page then reads as one flat texture.

## Surfaces

| Level | Name | Value | Token | Purpose |
|---|---|---|---|---|
| 1 | White 100 | `#ffffff` | `--immersive-canvas` | Page background |
| 2 | Light Grey 100 | `#a6bfcc` | `--immersive-palette-100` | Tint block |
| 3 | Light Grey 75 | `#bccfd9` | `--immersive-palette-75` | Tint block |
| 4 | Light Grey 50 | `#d3dfe6` | `--immersive-palette-50` | Tint block |
| 5 | Light Grey 25 | `#e9eff2` | `--immersive-palette-25` | Tint block |
| — | Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block |

## Elevation

- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.

## Imagery

Candid photography of members taking part leads. In the hero it takes the side opposite the event name, date and main action, sitting beside the Brand Pattern and never over it; with no image supplied that side holds the date as a numeral block, and narrow screens stack the image last. Frame close and mid shots of real members and staff mid-movement or mid-conversation, never posed stock, with room beside each subject for copy and the canvas left clear around them. Spot illustrations appear only in small explanatory blocks, and icons stay small and simple in the text role. Allow at most one large image per screen; supporting images stay small.

Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.

## Brand Pattern

- **Section:** hero
- **Colourway:** Yellow (`accent`)
- **Ground:** `--immersive-accent-50` fill with `--immersive-on-accent-50` text
- **Block Colourway:** `white__yellow-100`, Yellow blocks on White

The hero section carries the Brand Pattern in a panel on its ground: Block draws it in `white__yellow-100`, Yellow blocks on White (`--immersive-canvas`), and the panel takes the block and card radius. It runs as a strip beside or under the section's text, never behind it. Block's Brand Pattern procedure makes it as a static SVG: never hand-draw it, imitate it in CSS or animate it.

## Layout

| # | Section | Ground | Fill | Text |
|---|---|---|---|---|
| 1 | hero | pattern | `--immersive-accent-50` | `--immersive-on-accent-50` |
| 2 | detail-list | canvas | `--immersive-canvas` | `--immersive-text` |
| 3 | call-out | accent | `--immersive-accent-100` | `--immersive-on-accent-100` |
| 4 | detail-list | tint | `--immersive-palette-100` | `--immersive-on-palette-100` |
| 5 | proof | canvas | `--immersive-canvas` | `--immersive-text` |
| 6 | form | canvas | `--immersive-canvas` | `--immersive-text` |
| 7 | footer | canvas | `--immersive-canvas` | `--immersive-text` |

Rows are in page order. A `tint`, `accent` or `pattern` ground fills its section edge to edge, with the content column inside it; on `canvas` the section's blocks carry the fills. A component whose fill is its section's ground steps one lighter in the same family, so the block and its radius show against the ground.

A full-bleed page with no navigation bar; on narrow screens a sticky main action appears after the hero. The hero, the Brand Pattern section on the pattern ground, is split: name, date, place, supporting line and main action beside the lead image, which dominates the first screen; without an image the date becomes a numeral block, stacked image-last on narrow screens. The first detail list on the canvas holds the Race distance cards, the one set of equal peers, each led by its distance in display3. The call-out on the accent ground holds the Registration call-out, a feature spanning the content column, led by the registration deadline in display3. The second detail list on the tint ground carries the Route overview as a full-column feature, its map dominant, then the Race-day schedule led by the start time in display3. Proof on the canvas is led by a runner photograph, and the form on the canvas by the submit action. A minimal footer on the canvas carries logo, organiser line and legal links. Sections part by space-10, cards pad by space-4, blocks take borderRadius-500 and features borderRadius-700.

## Motion

**Level:** subtle

Fades, or slides of 16px or less, as content enters view, over 150–250ms with ease-out.

Under `prefers-reduced-motion: reduce`, use the still level. Nothing animates the Brand Pattern. The motion values are provisional pending design owner review.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text` (`#01172b`)
- background: `--immersive-canvas` (`#ffffff`)
- tint blocks: `--immersive-palette-100` to `--immersive-palette-25`
- accent: `--immersive-accent-100` to `--immersive-accent-25`
- primary action: `--immersive-action` (`#01172b`), label `--immersive-on-action` (`#ffffff`)
- highlight: `--immersive-green-25` to `--immersive-green-100`, small blocks only

**Example Component Prompts**

1. Create a set of three Race distance cards: each card takes var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, var(--borderRadius-500) corners and var(--space-4) padding; the distance leads in display3, member price in title3, start and cut-off times in body, and a Secondary Action on var(--immersive-palette-75) with a var(--immersive-on-palette-75) label1.

2. Create a Registration call-out: var(--immersive-accent-75) fill with var(--immersive-on-accent-75) text, var(--borderRadius-700) corners and var(--space-4) padding; the registration deadline leads in display3, the member benefit sits in title3 and body inside a var(--immersive-accent-25) block with var(--immersive-on-accent-25) text, and the page's only main action takes var(--immersive-action) fill with a var(--immersive-on-action) label1.

3. Create the call-out section: var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text and var(--space-10) above and below; the Registration call-out dominates it at full content width, its deadline in display3 as the lead fact, with a short title2 heading over the card and one legal line on entry rules beneath.

4. Create the second detail-list section: var(--immersive-palette-100) fill with var(--immersive-on-palette-100) text and var(--space-10) between sections; the Race-day schedule dominates it with var(--borderRadius-500) corners and var(--space-4) padding, the start time in display3 as its one fact, then each time in title4, item in body and place in label2.

## Sibling Themes

- **Exclusive** (`exclusive`; light; canvas Yellow 100, `#f2f93c`): Saturated yellow canvas with navy ink, cooled by Light Grey blocks; loud and warm.
- **Private** (`private`; light; canvas Light Grey 100, `#a6bfcc`): Calm Light Grey canvas with navy ink and Yellow highlights; quiet and considered.
- **Ultra** (`ultra`; dark; canvas Navy 100, `#01172b`): Deep navy canvas with white type, Yellow highlights and Light Grey support; dark and confident.

## Quick Start

Build on the Neon base. Add `@neon/theme`, `@neon/immersive-themes` and this brief's item, `@neon/theme-brief-club-run`, then pass `immersiveTheme="club"` to `ImmersiveLayout`. It sets `data-immersive-theme` and maps the theme onto the Neon components; the attribute set by hand on another root gives the variables without that mapping. Every value comes from the installed CSS; never retype the values above.

### Tailwind v4

```css
@theme inline {
  /* Aliases only; the values stay in the Immersive Themes CSS. */
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
