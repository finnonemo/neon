# Finnomena Ultra · Run — Theme Brief
> Fresh strides on a navy start line — shared momentum and an open invitation for every member to sign up

**Theme:** dark
**Immersive Theme:** ultra

This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Ultra Immersive Theme and type from Neon's theme; layout, components, imagery and motion are Finnomena-authored and interpreted, not measured. Provisional pending design owner review.

Ultra sets white type on a deep navy canvas, and a white main action carries the call in every section. Navy steps hold the sections, Yellow steps lift highlights, and Light Grey support blocks carry detail. It is dark, confident and high-contrast.
For race weekend the accent goes to the Registration call-out, so a runner scrolling the route lands on the place to sign up. The page leans on rounded blocks, generous gaps and a steady top-to-bottom rhythm, like a marked course with clear turns. It should feel friendly rather than fierce, more group warm-up than finish sprint. It closes on a line of members stretching at the start arch, one easy week from race day.
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
- **Section gap:** `--space-10` (80px)
- **Card padding:** `--space-5` (40px)
- **Page width:** full-bleed. Content sits in one centred column at most `--layout-contentMaxWidth` (1440px) wide, with `--layout-endMargin` (16px, then 24px from a 1440px viewport) inside it. Section fills span the viewport.

## Components

### Main Action
**Role:** The main action of a section

Neon `Button` filled with `--immersive-action`, its label in `--immersive-on-action`, with `--borderRadius-1000` corners. On `--immersive-palette-50`, `--immersive-palette-25`, every `accent` fill and every `support` fill, `--immersive-action` does not read: fill the button with that fill's `on-` text variable and set its label in the fill's own variable.

### Secondary Action
**Role:** An alternative beside the main action

Neon `Button` in its `secondary` variant: `--immersive-palette-75` fill with its label in `--immersive-on-palette-75`. On a block that already has that fill, the `ghost` variant: no fill, its label in the block's `on-` text variable. Neon has no outlined button.

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
**Role:** One selectable race distance

var(--immersive-palette-50) fill, text in var(--immersive-on-palette-50), no border, rounded var(--borderRadius-400) with var(--space-5) padding. The distance leads in display2; start and cut-off times sit in title3, the member price in title2 and notes in body. One select button per card takes var(--immersive-palette-75) fill with its label1 text in var(--immersive-on-palette-75), never an outline.

### Route overview
**Role:** Course map and checkpoints

var(--immersive-palette-100) fill, text in var(--immersive-on-palette-100), no border, rounded var(--borderRadius-800) with var(--space-5) padding. The course name tops out at title1, above a labelled map image slot. Checkpoints sit in lighter blocks of var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text, distance markers in label1 and water stations in body.

### Race-day schedule
**Role:** Race-day timeline

var(--immersive-palette-75) fill, text in var(--immersive-on-palette-75), no border, rounded var(--borderRadius-400) with var(--space-5) padding. The start time leads in display2; every other row pairs its time in label1 with the item in title4 and the place in body. Rows run check-in, warm-up, start, finish and awards, in that order only.

### Registration call-out
**Role:** Main registration prompt

var(--immersive-accent-100) fill, text in var(--immersive-on-accent-100), no border, rounded var(--borderRadius-800) with var(--space-5) padding. The registration deadline leads in display2, and the member benefit follows in title2 and body. The main action is filled with var(--immersive-on-accent-100), its label1 text in var(--immersive-accent-100). This is the only main action on the page.

## Do's and Don'ts

### Do
- Pass `immersiveTheme="ultra"` to `ImmersiveLayout` and color every section from the theme's `--immersive-` variables.
- Pair every fill with its own `on-` text variable, and text on the canvas with `--immersive-text`.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per block.
- Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.
- Place the registration deadline beside the main action in the Registration call-out and beside each Race distance card's secondary select action.
- Set each distance on its Race distance card and the deadline in the Registration call-out in display2, the largest thing in each block.

### Don't
- Do not use gradients — Immersive Themes have none.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.
- Do not use `--immersive-action` (White 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not set the Route overview map as a decorative background — runners need to read every turn and marker on it.
- Do not give Race distance cards, the Route overview and the Race-day schedule one shared card recipe — the page then reads as one flat texture.

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

Candid photography of members taking part leads, never posed stock: real members and staff caught mid-movement or mid-conversation. Frame in close and mid shots that leave open room beside the subject for copy, and let the dark canvas meet the photo's edges, with any warm highlight echoing the accent. The hero carries no image beside the event name; a supplied lead image runs as a wide strip below that stack, clear of the Brand Pattern, never over it. Spot illustrations appear only in small explanatory blocks on support surfaces. Icons stay simple line marks in the text color, sized to their label. Keep it sparse: at most one large image per screen, with supporting images kept small.

Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.

## Brand Pattern

- **Section:** hero
- **Colourway:** Navy (`palette`)
- **Ground:** `--immersive-palette-100` fill with `--immersive-on-palette-100` text, the canvas itself
- **Block Colourway:** `navy__grey-100`, Light Grey blocks on Navy

The hero section carries the Brand Pattern on its ground: Block draws it in `navy__grey-100`, Light Grey blocks on the section's own Navy. It runs as a strip beside or under the section's text, never behind it. Block's Brand Pattern procedure makes it as a static SVG: never hand-draw it, imitate it in CSS or animate it.

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

A full-bleed page that opens on a poster hero, the Brand Pattern section on the pattern ground, where the event name stacked over its date and place dominates the first screen, with the main action beneath and any lead image below as a wide strip. The first detail list, on the tint ground, sets the Race distance cards as the one set of equal cards, each led by its distance. The second detail list, on the canvas, is dominated by the Route overview map spanning the content column, with the Race-day schedule beneath, rows led by start time. The call-out, on the accent ground, holds the Registration call-out across the content column, led by its deadline. Proof, on the canvas, is led by a member quotation; the form, on the tint ground, by the submit action. Distance, start time and deadline take display2. No navigation; a sticky main action appears on narrow screens after the hero. The minimal footer on the canvas carries logo, organiser line and legal links. Sections part by space-10, cards pad by space-5 at borderRadius-400, and both features round to borderRadius-800.

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

1. Create a set of three Race distance cards: var(--immersive-palette-50) fill with var(--immersive-on-palette-50) text, var(--borderRadius-400) corners, var(--space-5) padding and no border. Each card leads with its distance in display2, then start and cut-off times in title3, the member price in title2 and notes in body. Each card has one select button on var(--immersive-palette-75) with a var(--immersive-on-palette-75) label in label1.

2. Create a Registration call-out: var(--immersive-accent-100) fill with var(--immersive-on-accent-100) text, var(--borderRadius-800) corners and var(--space-5) padding. The registration deadline leads in display2, followed by the member benefit in title2 and body. The only main action on the page is filled with var(--immersive-on-accent-100) and has a var(--immersive-accent-100) label in label1.

3. Create the first detail-list section: var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text and var(--space-10) between sections. The Route overview dominates it on var(--immersive-palette-100) with var(--immersive-on-palette-100) text, var(--borderRadius-800) corners and var(--space-5) padding. Put the course name in title1 above a labelled map slot, with distance markers in label1.

4. Create a Race-day schedule: var(--immersive-palette-75) fill with var(--immersive-on-palette-75) text, var(--borderRadius-400) corners and var(--space-5) padding. The start time leads in display2. Each later row sets its time in label1, the item in title4 and the place in body. Rows run in this order: check-in, warm-up, start, finish, then awards.

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
