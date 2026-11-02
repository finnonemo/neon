# Finnomena Ultra · Run — Theme Brief
> Fresh strides on a navy start line — shared momentum and an open invitation for every member to sign up

**Theme:** dark
**Immersive Theme:** ultra

This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Ultra Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.

Ultra sets white type on a deep navy canvas, and a white main action carries the call in every section. Navy steps hold the sections, Yellow steps lift highlights, and Light Grey support blocks carry detail. It is dark, confident and high-contrast.
For the race weekend the accent is saved for the Registration call-out, so runners who have trained together all season find their place on the start line without searching. Rounded blocks and generous gaps keep the route easy to follow, section by section, like markers along a course. The page closes on a row of numbered bibs pinned to shirts the night before, laces already tied.
Membership ratio: Navy 60%, Light Grey 15%, Yellow 15%, White 10%.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Navy 100 | `#01172b` | `--immersive-canvas` | Page background |
| White 100 | `#ffffff` | `--immersive-text` | Text on the canvas |
| Navy 100 | `#01172b` | `--immersive-palette-100` | The canvas color, not a block fill |
| Navy 75 | `#415160` | `--immersive-palette-75` | Tint block; text `--immersive-on-palette-75` |
| Navy 50 | `#808b95` | `--immersive-palette-50` | Tint block; text `--immersive-on-palette-50` |
| Navy 25 | `#c0c5ca` | `--immersive-palette-25` | Tint block; text `--immersive-on-palette-25` |
| Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block; text `--immersive-on-accent-100` |
| Yellow 75 | `#f5fb6d` | `--immersive-accent-75` | Accent block; text `--immersive-on-accent-75` |
| Yellow 50 | `#f9fc9e` | `--immersive-accent-50` | Accent block; text `--immersive-on-accent-50` |
| Yellow 25 | `#fcfece` | `--immersive-accent-25` | Accent block; text `--immersive-on-accent-25` |
| Light Grey 100 | `#a6bfcc` | `--immersive-support-100` | Support block; text `--immersive-on-support-100` |
| Light Grey 75 | `#bccfd9` | `--immersive-support-75` | Support block; text `--immersive-on-support-75` |
| Light Grey 50 | `#d3dfe6` | `--immersive-support-50` | Support block; text `--immersive-on-support-50` |
| Light Grey 25 | `#e9eff2` | `--immersive-support-25` | Support block; text `--immersive-on-support-25` |
| White 100 | `#ffffff` | `--immersive-action` | Main action fill; label `--immersive-on-action` |
| Navy 100 | `#01172b` | `--immersive-on-action` | Main action label |

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
- **Section gap:** `--space-10` (80px)
- **Card padding:** `--space-4` (32px)
- **Page width:** full-bleed. Content sits in one centred column at most `--layout-contentMaxWidth` (1440px) wide, with `--layout-endMargin` (16px, then 24px from a 1440px viewport) inside it. Section fills span the viewport.

## Components

### Main Action
**Role:** The main action of a section

Neon `Button` filled with `--immersive-action`, its label in `--immersive-on-action`, with `--borderRadius-1000` corners.

### Secondary Action
**Role:** An alternative beside the main action

Neon `Button` with no fill, its label and outline in `--immersive-text` on the canvas. On a filled block, label and outline take that block's `on-` text variable.

### Logo
**Role:** Brand identity

Neon's logo item, the dark-surface mark. Never recreate the wordmark as text.

### Tint Block
**Role:** Group a section or a set of details

`--immersive-palette-75` to `--immersive-palette-25` fills, each with its own `on-` text variable. Flat: no border and no shadow; step lighter for nested emphasis.

### Accent Block
**Role:** Highlight an offer or call-out

`--immersive-accent-100` to `--immersive-accent-25` fills, each with its own `on-` text variable. Flat, like the Tint Block.

### Support Block
**Role:** Detail and reference content

`--immersive-support-100` to `--immersive-support-25` fills, each with its own `on-` text variable, for detail lists and secondary information.

### Race distance card
**Role:** One race distance to compare and pick

var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The distance sits in title2, then body lines for start time, cut-off and member price, and one var(--immersive-action) select button with var(--immersive-on-action) text. A picked card shows a label1 tag.

### Route overview
**Role:** The course map and its checkpoints

var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. A title3 heading tops a labelled map image slot, then a list of checkpoints in body with distance markers and water stations in label2. It never carries an action.

### Race-day schedule
**Role:** The race-day timeline

var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. Each row sets the time in label1, the item in body and the place in caption, running from check-in through warm-up, start, finish and awards. Rows stay static, never collapsed.

### Registration call-out
**Role:** The one main registration action

var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The deadline sits in title2 above a body line on the member benefit, then the main var(--immersive-action) button with var(--immersive-on-action) text. Only one of these appears per page.

## Do's and Don'ts

### Do
- Pass `immersiveTheme="ultra"` to `ImmersiveLayout` and color every section from the theme's `--immersive-` variables.
- Pair every fill with its own `on-` text variable, and text on the canvas with `--immersive-text`.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per block.
- Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.
- Print the registration deadline in label1 beside the main action on each Race distance card.

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.
- Do not use `--immersive-action` (White 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not set the Route overview map behind section text as decoration — runners need to read every turn and aid station clearly.

## Surfaces

| Level | Name | Value | Token | Purpose |
|---|---|---|---|---|
| 1 | Navy 100 | `#01172b` | `--immersive-canvas` | Page background |
| 2 | Navy 75 | `#415160` | `--immersive-palette-75` | Tint block |
| 3 | Navy 50 | `#808b95` | `--immersive-palette-50` | Tint block |
| 4 | Navy 25 | `#c0c5ca` | `--immersive-palette-25` | Tint block |
| — | Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block |
| — | Light Grey 100 | `#a6bfcc` | `--immersive-support-100` | Support block |

## Elevation

- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.

## Imagery

Photography of members taking part leads, never posed stock. Frame close and mid shots that catch people mid-movement or mid-conversation, leaving room beside the subject where copy can sit on the canvas. Show real members and the brand's staff in candid moments, and let the accent appear only where it is already in the scene, never as a tint over a photo. In the hero, place the image in its own column beside the Brand Pattern, never over or under it. Keep the brand's spot illustrations to small explanatory blocks on support panels. Icons stay simple line marks in the text color. Density stays low: one large image per screen at most, with supporting images kept small.

Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.

## Brand Pattern

- **Section:** hero
- **Colourway:** Navy (`palette`)
- **Ground:** `--immersive-palette-100` fill with `--immersive-on-palette-100` text, the canvas itself

The hero section carries the Brand Pattern on its ground, and the Pattern keeps to the Navy family. Block's Brand Pattern procedure makes it as a static SVG: never hand-draw it, imitate it in CSS or animate it.

## Layout

A full-bleed page that opens on a split hero carrying the Brand Pattern section: headline, supporting line and main action on one side, lead image on the other, stacking image-last on narrow screens, set on --immersive-canvas with --immersive-text. The first detail-list holds the Race distance card on --immersive-palette-75 blocks with --immersive-on-palette-75 type, and the call-out places the Registration call-out on --immersive-accent-100 with --immersive-on-accent-100 type. The second detail-list holds the Route overview and Race-day schedule on --immersive-support-25 blocks with --immersive-on-support-25 type, then proof and form return to the open canvas. There is no navigation; a sticky main action appears on narrow screens after the hero. The footer stays minimal with logo, organiser line and legal links. Sections sit var(--space-10) apart, blocks use borderRadius-500 and space-4 padding.

## Motion

**Level:** subtle

Fades, or slides of 16px or less, as content enters view, over 150–250ms with ease-out.

Under `prefers-reduced-motion: reduce`, use the still level. Nothing animates the Brand Pattern. The motion values are provisional pending design owner review.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text` (`#ffffff`)
- background: `--immersive-canvas` (`#01172b`)
- tint blocks: `--immersive-palette-75` to `--immersive-palette-25`
- accent: `--immersive-accent-100` to `--immersive-accent-25`
- support: `--immersive-support-100` to `--immersive-support-25`
- primary action: `--immersive-action` (`#ffffff`), label `--immersive-on-action` (`#01172b`)
- highlight: `--immersive-green-25` to `--immersive-green-100`, small blocks only

**Example Component Prompts**

1. Create a set of three Race distance cards: each card on var(--immersive-palette-75) with var(--immersive-on-palette-75) text, var(--borderRadius-500) radius and var(--space-4) inner padding, the distance in title2, body lines for start time, cut-off and member price, one select button on var(--immersive-action) in var(--immersive-on-action), and a label1 tag on the picked card.

2. Create a Registration call-out: var(--immersive-accent-100) block with var(--immersive-on-accent-100) text, no border, var(--borderRadius-500) radius and var(--space-4) padding, the registration deadline in title2, a body line on the member benefit, then the single main button on var(--immersive-action) with var(--immersive-on-action) text.

3. Create a Route overview: var(--immersive-palette-50) surface, var(--immersive-on-palette-50) text, var(--borderRadius-500) radius, var(--space-4) padding, a title3 heading over a labelled map image slot, checkpoints listed in body, distance markers and water stations in label2, and no action of any kind.

4. Create a Race-day schedule: var(--immersive-palette-25) panel with var(--immersive-on-palette-25) text, var(--borderRadius-500) radius and var(--space-4) padding, static rows from check-in through warm-up, start, finish and awards, each with the time in label1, the item in body and the place in caption.

5. Create a hero section: var(--immersive-canvas) background with var(--immersive-text) type, the race name in display1, date and city in headline, a short body line on the course, and one button that scrolls to the distances on var(--immersive-action) with var(--immersive-on-action) text, var(--space-10) below it.

## Sibling Themes

- **Club** (`club`; light; canvas White 100, `#ffffff`): White canvas with navy ink, Light Grey blocks and Yellow accents; open and everyday.
- **Exclusive** (`exclusive`; light; canvas Yellow 100, `#f2f93c`): Saturated yellow canvas with navy ink, cooled by Light Grey blocks; loud and warm.
- **Private** (`private`; light; canvas Light Grey 100, `#a6bfcc`): Calm Light Grey canvas with navy ink and Yellow highlights; quiet and considered.

## Quick Start

Build on the Neon base. Add `@neon/theme`, `@neon/immersive-themes` and this brief's item, `@neon/theme-brief-ultra-run`, then pass `immersiveTheme="ultra"` to `ImmersiveLayout`. It sets `data-immersive-theme` and maps the theme onto the Neon components; the attribute set by hand on another root gives the variables without that mapping. Every value comes from the installed CSS; never retype the values above.

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
