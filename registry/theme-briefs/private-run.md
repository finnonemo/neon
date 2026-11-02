# Finnomena Private · Run — Theme Brief
> Laced shoes at a shared start line — momentum for members, and an open invitation to sign up

**Theme:** light
**Immersive Theme:** private

This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Private Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.

Private lays a calm Light Grey canvas under navy ink. Light Grey steps build the section blocks, Yellow steps hold highlights and offers, and the navy main action keeps the next step clear. It feels quiet, considered and personal.
For race weekend the accent is saved for the Registration call-out, so a runner scanning the route and start times lands there when ready to commit. The page leans on rounded blocks, steady rhythm and generous gaps, like stretches of road between water stations, keeping each section easy to pace. It ends on a row of laced shoes by the door, a bib pinned to a folded shirt, the night before the start.
Membership ratio: Light Grey 60%, Yellow 30%, Navy 10%.

## Tokens — Colors

| Name | Value | Token | Role |
|---|---|---|---|
| Light Grey 100 | `#a6bfcc` | `--immersive-canvas` | Page background |
| Navy 100 | `#01172b` | `--immersive-text` | Text on the canvas |
| Light Grey 100 | `#a6bfcc` | `--immersive-palette-100` | The canvas color, not a block fill |
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

Neon's logo item, the light-surface mark. Never recreate the wordmark as text.

### Tint Block
**Role:** Group a section or a set of details

`--immersive-palette-75` to `--immersive-palette-25` fills, each with its own `on-` text variable. Flat: no border and no shadow; step lighter for nested emphasis.

### Accent Block
**Role:** Highlight an offer or call-out

`--immersive-accent-100` to `--immersive-accent-25` fills, each with its own `on-` text variable. Flat, like the Tint Block.

### Race distance card
**Role:** One distance with its select action

Fill var(--immersive-palette-25) with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners, var(--space-4) padding. The distance reads in title2 over label1 rows for start time, cut-off and member price, then a var(--immersive-action) select button with var(--immersive-on-action) text. The picked card turns var(--immersive-palette-50) with var(--immersive-on-palette-50) text.

### Route overview
**Role:** Course map with its checkpoints

Fill var(--immersive-palette-50) with var(--immersive-on-palette-50) text, borderless, var(--borderRadius-500) corners and var(--space-4) padding. The labelled map image slot comes first with a caption line. Checkpoints follow, each with a label1 distance marker and a body note for water stations. Never show water stations by color alone.

### Race-day schedule
**Role:** Race-day timeline from check-in to awards

Fill var(--immersive-palette-25) with var(--immersive-on-palette-25) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. Each row sets the time in title4, the item in body and the place in caption. Rows run check-in, warm-up, start, finish, awards, in that order only.

### Registration call-out
**Role:** The one main registration action

Fill var(--immersive-accent-50) with var(--immersive-on-accent-50) text, no border, var(--borderRadius-500) corners and var(--space-4) padding. The deadline sits in title3, the member benefit in body, then a var(--immersive-action) button with var(--immersive-on-action) text. After the deadline the button gives way to a closed label. Only one per page.

## Do's and Don'ts

### Do
- Pass `immersiveTheme="private"` to `ImmersiveLayout` and color every section from the theme's `--immersive-` variables.
- Pair every fill with its own `on-` text variable, and text on the canvas with `--immersive-text`.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per block.
- Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.
- Print the registration deadline in label1 beside every main action, including the one in the Registration call-out.

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.
- Do not use `--immersive-action` (Navy 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not lay the Route overview map behind section text as decoration — runners need to read every turn and aid station clearly.

## Surfaces

| Level | Name | Value | Token | Purpose |
|---|---|---|---|---|
| 1 | Light Grey 100 | `#a6bfcc` | `--immersive-canvas` | Page background |
| 2 | Light Grey 75 | `#bccfd9` | `--immersive-palette-75` | Tint block |
| 3 | Light Grey 50 | `#d3dfe6` | `--immersive-palette-50` | Tint block |
| 4 | Light Grey 25 | `#e9eff2` | `--immersive-palette-25` | Tint block |
| — | Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block |

## Elevation

- **None.** The tokens define no shadow. Separate surfaces with tint steps, not shadows or borders.

## Imagery

Photography of members taking part leads, shot close or mid-range with people caught mid-movement or mid-conversation and open space beside them for copy. Subjects are real members and staff, candid and never posed stock, shown against the calm canvas, with any color in frame echoing the palette or the accent and never competing with the action. In the hero, the image takes its own column beside the Brand Pattern and never runs under or over it. Spot illustrations from the house set appear only in small explanatory blocks, and icons stay simple line marks in the text color. Keep it sparse: one large image per screen at most, supporting images small.

Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.

## Brand Pattern

- **Section:** hero
- **Colourway:** Light Grey (`palette`)
- **Ground:** `--immersive-palette-100` fill with `--immersive-on-palette-100` text, the canvas itself

The hero section carries the Brand Pattern on its ground, and the Pattern keeps to the Light Grey family. Block's Brand Pattern procedure makes it as a static SVG: never hand-draw it, imitate it in CSS or animate it.

## Layout

A full-bleed page with no top navigation opens on a split hero that holds the Brand Pattern, set on --immersive-canvas with --immersive-text, with the headline and main action beside the lead image, stacking image-last on narrow screens where a sticky main action follows. The first detail-list sets each Race distance card on --immersive-palette-25 with --immersive-on-palette-25, using borderRadius-500 and space-4 padding. The call-out holds the Registration call-out on --immersive-accent-25 with --immersive-on-accent-25. The second detail-list returns to the canvas for the Route overview and Race-day schedule, proof sits in a light block, and the form closes on the canvas. A minimal footer carries the logo, organiser line and legal links, space-10 separates every section, and motion stays subtle.

## Motion

**Level:** subtle

Fades, or slides of 16px or less, as content enters view, over 150–250ms with ease-out.

Under `prefers-reduced-motion: reduce`, use the still level. Nothing animates the Brand Pattern. The motion values are provisional pending design owner review.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text` (`#01172b`)
- background: `--immersive-canvas` (`#a6bfcc`)
- tint blocks: `--immersive-palette-75` to `--immersive-palette-25`
- accent: `--immersive-accent-100` to `--immersive-accent-25`
- primary action: `--immersive-action` (`#01172b`), label `--immersive-on-action` (`#ffffff`)
- highlight: `--immersive-green-25` to `--immersive-green-100`, small blocks only

**Example Component Prompts**

1. Create a set of three Race distance cards: each on var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, var(--borderRadius-500) corners, var(--space-4) padding, the distance in title2, label1 rows for start time, cut-off and member price, a var(--immersive-action) select button with var(--immersive-on-action) text, and the picked card on var(--immersive-palette-50) with var(--immersive-on-palette-50) text.

2. Create a Registration call-out: var(--immersive-accent-50) fill with var(--immersive-on-accent-50) text, var(--borderRadius-500) corners, var(--space-4) padding, the deadline date in title3, a body line on the member benefit, and one var(--immersive-action) register button with var(--immersive-on-action) text that becomes a closed label once the deadline passes.

3. Create a Route overview: var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, var(--borderRadius-500) corners, var(--space-4) padding, a labelled map image slot with a caption line, then checkpoints with label1 distance markers and body notes that name each water station in words.

4. Create a Race-day schedule: var(--immersive-palette-25) fill with var(--immersive-on-palette-25) text, var(--borderRadius-500) corners, var(--space-4) padding, rows for check-in, warm-up, start, finish and awards in that fixed order, each row giving its time in title4, activity in body and location in caption.

5. Create a hero section: var(--immersive-canvas) fill with var(--immersive-text) text, var(--space-6) padding, the race name in display2, the date and place in headline, a short body intro, and one var(--immersive-action) button with var(--immersive-on-action) text that jumps to the distances, with var(--space-10) below.

## Sibling Themes

- **Club** (`club`; light; canvas White 100, `#ffffff`): White canvas with navy ink, Light Grey blocks and Yellow accents; open and everyday.
- **Exclusive** (`exclusive`; light; canvas Yellow 100, `#f2f93c`): Saturated yellow canvas with navy ink, cooled by Light Grey blocks; loud and warm.
- **Ultra** (`ultra`; dark; canvas Navy 100, `#01172b`): Deep navy canvas with white type, Yellow highlights and Light Grey support; dark and confident.

## Quick Start

Build on the Neon base. Add `@neon/theme`, `@neon/immersive-themes` and this brief's item, `@neon/theme-brief-private-run`, then pass `immersiveTheme="private"` to `ImmersiveLayout`. It sets `data-immersive-theme` and maps the theme onto the Neon components; the attribute set by hand on another root gives the variables without that mapping. Every value comes from the installed CSS; never retype the values above.

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
