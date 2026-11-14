# Finnomena Exclusive · Run — Theme Brief
> Laced shoes on a sunlit start line — a members' run with room for everyone who signs up

**Theme:** light
**Immersive Theme:** exclusive

This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Exclusive Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.

Exclusive fills the canvas with saturated yellow and sets navy ink on it. Yellow steps build the section blocks, Light Grey steps cool the page where it needs a pause, and the navy main action anchors every section. It is loud, warm and unmistakably Finnomena.
For race weekend the accent lands on the Registration call-out, where members commit to the start, and the patterned hero at the top carries it too, so the route opens and closes on the same signal. Rounded blocks and generous gaps pace the page like steady training laps, each section a clear stretch of road. It ends on a row of race bibs pinned out the night before the start.
Membership ratio: Yellow 60%, Light Grey 30%, Navy 10%.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Yellow 100 | `#f2f93c` | `--immersive-canvas` | Page background |
| Navy 100 | `#01172b` | `--immersive-text` | Text on the canvas |
| Yellow 100 | `#f2f93c` | `--immersive-palette-100` | The canvas color, not a block fill |
| Yellow 75 | `#f5fb6d` | `--immersive-palette-75` | Tint block; text `--immersive-on-palette-75` |
| Yellow 50 | `#f9fc9e` | `--immersive-palette-50` | Tint block; text `--immersive-on-palette-50` |
| Yellow 25 | `#fcfece` | `--immersive-palette-25` | Tint block; text `--immersive-on-palette-25` |
| Light Grey 100 | `#a6bfcc` | `--immersive-accent-100` | Accent block; text `--immersive-on-accent-100` |
| Light Grey 75 | `#bccfd9` | `--immersive-accent-75` | Accent block; text `--immersive-on-accent-75` |
| Light Grey 50 | `#d3dfe6` | `--immersive-accent-50` | Accent block; text `--immersive-on-accent-50` |
| Light Grey 25 | `#e9eff2` | `--immersive-accent-25` | Accent block; text `--immersive-on-accent-25` |
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

- **Density:** spacious
- **Block and card radius:** `--borderRadius-400` (16px)
- **Feature block radius:** `--borderRadius-800` (48px), for a block that spans the content column; cards inside it keep the block and card radius
- **Lead fact role:** `display2` (60px/70px), for the one fact a component leads with; other component text stops at `title1`
- **Hero name role:** `display1` (92px/102px), and `display2` (60px/70px) on narrow screens; nothing else in the hero is set larger than the name
- **Section gap:** `--space-10` (80px)
- **Card padding:** `--space-5` (40px)
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

`--immersive-palette-75` to `--immersive-palette-25` fills, each with its own `on-` text variable. Flat: no border and no shadow; step lighter for nested emphasis.

### Accent Block
**Role:** Highlight an offer or call-out

`--immersive-accent-100` to `--immersive-accent-25` fills, each with its own `on-` text variable. Flat, like the Tint Block.

### Race distance card
**Role:** One selectable race distance

var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, no border, var(--borderRadius-400) corners and var(--space-5) padding. The distance leads in display2; start time and cut-off time follow in body, the member price in title3. Each card has one select action as a secondary action, with a var(--immersive-palette-75) fill and its label in var(--immersive-on-palette-75). Never an outlined button.

### Route overview
**Role:** Course map with checkpoints

var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, no border, var(--borderRadius-800) corners and var(--space-5) padding. The course name sits in title1 above a labelled map image slot. Checkpoints sit in var(--immersive-palette-25) blocks with var(--immersive-on-palette-25) text and var(--borderRadius-400) corners, distance markers in label1 and water stations in body. Nothing here goes above title1.

### Race-day schedule
**Role:** Race-day timeline

var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, no border, var(--borderRadius-400) corners and var(--space-5) padding. The start time leads in display2; each row then gives time in label1, item in title4 and place in body, for check-in, warm-up, start, finish and awards. Past items stay listed, never struck through.

### Registration call-out
**Role:** Main registration call to action

var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text, no border, var(--borderRadius-800) corners and var(--space-5) padding. The registration deadline leads in display2, the member benefit follows in title3 and body. The main action takes var(--immersive-action) with its label in var(--immersive-on-action) and label1 type. Only this component carries it.

## Do's and Don'ts

### Do
- Pass `immersiveTheme="exclusive"` to `ImmersiveLayout` and color every section from the theme's `--immersive-` variables.
- Pair every fill with its own `on-` text variable, and text on the canvas with `--immersive-text`.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per block.
- Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.
- Show the registration deadline in label1 beside the main action in the Registration call-out, and beside each Race distance card's secondary select action.
- Set each distance on its Race distance card and the deadline in the Registration call-out in display2, as the largest thing in its block.

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.
- Do not use `--immersive-action` (Navy 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not place the route map behind text as a decorative background in the Route overview — runners need to read every turn and marker.
- Do not build the Race distance card, Route overview and Race-day schedule from one card recipe — the page then reads as a single texture.

## Surfaces

| Level | Name | Value | Token | Purpose |
|---|---|---|---|---|
| 1 | Yellow 100 | `#f2f93c` | `--immersive-canvas` | Page background |
| 2 | Yellow 75 | `#f5fb6d` | `--immersive-palette-75` | Tint block |
| 3 | Yellow 50 | `#f9fc9e` | `--immersive-palette-50` | Tint block |
| 4 | Yellow 25 | `#fcfece` | `--immersive-palette-25` | Tint block |
| — | Light Grey 100 | `#a6bfcc` | `--immersive-accent-100` | Accent block |

## Elevation

- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.

## Imagery

Candid photography of members taking part leads, showing real members and staff mid-movement or mid-conversation, never posed stock. Shots stay close or mid-range, with open room beside the subject for copy. In the hero the event name, date and place stand alone with no image beside them; a lead image, when supplied, runs below as a wide strip that sits clear of the Brand Pattern and never overlaps it. Photographs keep their natural color, letting the canvas and palette blocks around them carry the theme. House spot illustrations appear only in small explanatory blocks, and icons stay simple line marks in the text role. The verdict is lean: at most one large image per screen, supporting images kept small.

Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.

## Brand Pattern

- **Section:** hero
- **Colourway:** Yellow (`palette`)
- **Ground:** `--immersive-palette-100` fill with `--immersive-on-palette-100` text, the canvas itself
- **Block Colourway:** `grey__navy-100`, Navy blocks on Light Grey

The hero section carries the Brand Pattern in a panel on its ground: Block draws it in `grey__navy-100`, Navy blocks on Light Grey (`--immersive-accent-100`), and the panel takes the block and card radius. It leads the section's screenful beside the text, never behind it and never as a strip, with its clear space left for a photo. Block draws it as a static SVG at the panel's size: never hand-draw it, imitate it in CSS, crop, stretch or animate it.

## Layout

| # | Section | Ground | Fill | Text |
|---|---|---|---|---|
| 1 | hero | pattern | `--immersive-palette-100` | `--immersive-on-palette-100` |
| 2 | detail-list | tint | `--immersive-palette-75` | `--immersive-on-palette-75` |
| 3 | detail-list | canvas | `--immersive-canvas` | `--immersive-text` |
| 4 | call-out | accent | `--immersive-accent-100` | `--immersive-on-accent-100` |
| 5 | proof | canvas | `--immersive-canvas` | `--immersive-text` |
| 6 | form | tint | `--immersive-palette-75` | `--immersive-on-palette-75` |
| 7 | footer | canvas | `--immersive-canvas` | `--immersive-text` |

Rows are in page order. A `tint`, `accent` or `pattern` ground fills its section edge to edge, with the content column inside it; on `canvas` the section's blocks carry the fills. A component whose fill is its section's ground steps one lighter in the same family, so the block and its radius show against the ground.

A full-bleed page that opens on a poster hero, the Brand Pattern section on the pattern ground, where the stacked event name is the largest thing on the first screen and any lead image runs below as a wide strip. The first detail list, on the tint ground, holds the Race distance cards as the one set of equal peers, each led by its distance. The second detail list, on the canvas, carries the Route overview across the full content column, dominated by its map, followed by the Race-day schedule led by the start time. On the accent ground the Registration call-out spans the column, its deadline dominating. Proof follows on the canvas, led by a member quotation, and the form sits on the tint ground, led by the submit action. The distance, start time and registration deadline take display2. There is no navigation; a sticky main action appears on narrow screens after the hero. The footer, on the canvas, keeps the logo, organiser line and legal links. Sections part by space-10, cards pad by space-5 at borderRadius-400, and feature components round to borderRadius-800.

## Motion

**Level:** subtle

Fades, or slides of 16px or less, as content enters view, over 150–250ms with ease-out. Allowed scroll patterns: Pinned story, Count-up figure and Progress rail, two moments a page.

Under `prefers-reduced-motion: reduce`, use the still level. Nothing animates the Brand Pattern. The motion values are provisional pending design owner review.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text` (`#01172b`)
- background: `--immersive-canvas` (`#f2f93c`)
- tint blocks: `--immersive-palette-75` to `--immersive-palette-25`
- accent: `--immersive-accent-100` to `--immersive-accent-25`
- primary action: `--immersive-action` (`#01172b`), label `--immersive-on-action` (`#ffffff`)
- highlight: `--immersive-green-25` to `--immersive-green-100`, small blocks only

**Example Component Prompts**

1. Create a set of three Race distance cards: each card takes var(--immersive-palette-50) as fill and var(--immersive-on-palette-50) as text, var(--borderRadius-400) corners, var(--space-5) padding and no border. The distance leads in display2, start and cut-off times sit in body, the member price in title3, and one secondary select button is filled var(--immersive-palette-75) and labelled in var(--immersive-on-palette-75).

2. Create a Registration call-out: var(--immersive-accent-100) fill, var(--immersive-on-accent-100) text, var(--borderRadius-800) corners and var(--space-5) padding. The registration deadline leads in display2, then the member benefit in title3 with its detail in body, and the page's only main action uses var(--immersive-action) with its label1 text in var(--immersive-on-action).

3. Create a detail-list section: var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text, var(--space-10) above and below, dominated by a Route overview whose course name sits in title1 over a labelled map image slot, with checkpoints in var(--immersive-palette-25) blocks, var(--immersive-on-palette-25) text and var(--borderRadius-400) corners.

4. Create a Race-day schedule: var(--immersive-palette-25) fill and var(--immersive-on-palette-25) text, var(--borderRadius-400) corners, var(--space-5) padding. The first start time leads in display2, then each row gives time in label1, item in title4 and place in body for check-in, warm-up, start, finish and awards, with past rows kept visible.

## Sibling Themes

- **Club** (`club`; light; canvas White 100, `#ffffff`): White canvas with navy ink, Light Grey blocks and Yellow accents; open and everyday.
- **Private** (`private`; light; canvas Light Grey 100, `#a6bfcc`): Calm Light Grey canvas with navy ink and Yellow highlights; quiet and considered.
- **Ultra** (`ultra`; dark; canvas Navy 100, `#01172b`): Deep navy canvas with white type, Yellow highlights and Light Grey support; dark and confident.

## Quick Start

Build on the Neon base. Add `@neon/theme`, `@neon/immersive-themes` and this brief's item, `@neon/theme-brief-exclusive-run`, then pass `immersiveTheme="exclusive"` to `ImmersiveLayout`. It sets `data-immersive-theme` and maps the theme onto the Neon components; the attribute set by hand on another root gives the variables without that mapping. Every value comes from the installed CSS; never retype the values above.

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
