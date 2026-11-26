# Finnomena Ultra · Run — Theme Brief
> Fresh strides on a navy start line — shared momentum and an open invitation for every member to sign up

**Theme:** dark
**Immersive Theme:** ultra

This is a Finnomena Theme Brief, not a Reference Design: skip Brand Intensity and apply the whole Brand Contract. Colors come from the Ultra Immersive Theme and the typeface from Neon's theme. It gives no layout, type size, spacing, shape or motion: design the page yourself. Provisional pending design owner review.

Ultra sets white type and a white main action on a deep navy canvas. Navy steps stay close to it, Yellow steps lift highlights, and Light Grey support gives relief. It is dark, confident and high-contrast.
Race weekend is friendly rather than fierce, more group warm-up than finish sprint, and the last easy week is part of the pleasure. Members stretch in a line at the start arch as the light comes up.
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
- **Role:** all text, Thai and Latin alike.

## Components

### Main Action
**Role:** The action the page is for

Neon `Button` filled with `--immersive-action`, its label in `--immersive-on-action`. On `--immersive-palette-50`, `--immersive-palette-25`, every `accent` fill and every `support` fill, `--immersive-action` does not read: fill the button with that fill's `on-` text variable and set its label in the fill's own variable.

### Secondary Action
**Role:** An alternative beside the main action

Neon `Button` in its `secondary` variant: `--immersive-palette-75` fill with its label in `--immersive-on-palette-75`. On an accent or support fill, or on a block that already has that fill, the `ghost` variant: no fill, its label in the fill's `on-` text variable. Neon has no outlined button.

### Logo
**Role:** Brand identity

Neon's logo item, the dark-surface mark. Never recreate the wordmark as text.

### Tint Block
**Role:** A block in the palette

`--immersive-palette-75` to `--immersive-palette-25` fills, each with its own `on-` text variable.

### Accent Block
**Role:** A block in the accent

`--immersive-accent-100` to `--immersive-accent-25` fills, each with its own `on-` text variable.

### Support Block
**Role:** A block in the support color

`--immersive-support-100` to `--immersive-support-25` fills, each with its own `on-` text variable.

## Occasion content

### Race distance card
**Role:** Compare the distances and pick one

The distance, its start time, cut-off time and member price, and one action to select it.

### Route overview
**Role:** The course and its checkpoints

A labelled map of the course, each checkpoint with its distance marker, and the water stations.

### Race-day schedule
**Role:** The race-day timeline

The time, item and place for check-in, warm-up, start, finish and awards.

### Registration call-out
**Role:** The main registration action

The registration deadline, the member benefit and the page's main action.

## Do's and Don'ts

### Do
- Color the whole page from the theme's `--immersive-` variables.
- Pair every fill with its own `on-` text variable, and text on the canvas with `--immersive-text`.
- Build emphasis with tint steps, never with opacity.
- Keep one color family per block.
- Start stepped blocks at `--immersive-palette-75`; `--immersive-palette-100` is the canvas.
- Give every Race distance card its own start time, cut-off time and member price.

### Don't
- Do not use a gradient outside Neon's Gradient Recipes — each stop is a step of this theme.
- Do not write new hex values or near-palette tints — every color is a token step.
- Do not let the shared secondary colors lead — keep them to small highlight, tag and illustration blocks.
- Do not use `--immersive-action` (White 100) as a block fill — it is reserved for the main action and its `--immersive-on-action` label.
- Do not leave the registration deadline as a countdown alone — runners plan around a date.

## Surfaces

| Level | Name | Value | Token | Purpose |
|---|---|---|---|---|
| 1 | Navy 100 | `#01172b` | `--immersive-canvas` | Page background |
| 2 | Navy 75 | `#415160` | `--immersive-palette-75` | Tint block |
| 3 | Navy 50 | `#808b95` | `--immersive-palette-50` | Tint block |
| 4 | Navy 25 | `#c0c5ca` | `--immersive-palette-25` | Tint block |
| — | Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block |
| — | Light Grey 100 | `#a6bfcc` | `--immersive-support-100` | Support block |

## Imagery

Candid photography of members taking part leads: real members and Finnomena staff mid-movement or mid-conversation, never posed stock. The pictures feel focused and low-lit, warmed by the people in them. Finnomena spot illustrations explain what a photo cannot.

Imagery never carries another brand's logo, copy or look, and the Finnomena logo and IBM Plex Sans Thai stay on every screen.

## Brand Pattern

- **Block Colourway:** `navy__grey-100`, Light Grey (`--immersive-support-100`) blocks on Navy (`--immersive-canvas`)

Optional unless the request asks for one. Draw it with the Block engine, never by hand or in CSS, and do not crop, stretch, cover or animate it. A photo inside it fills one whole Block. Its colors are fixed in the file, so a page that switches theme swaps the file. Where it goes and how large it is are the page design's.

## Agent Prompt Guide

**Quick Color Reference**
- text: `--immersive-text` (`#ffffff`)
- background: `--immersive-canvas` (`#01172b`)
- tint blocks: `--immersive-palette-75` to `--immersive-palette-25`
- accent: `--immersive-accent-100` to `--immersive-accent-25`
- support: `--immersive-support-100` to `--immersive-support-25`
- primary action: `--immersive-action` (`#ffffff`), label `--immersive-on-action` (`#01172b`)
- highlight: `--immersive-green-25` to `--immersive-green-100`, small blocks only

## Sibling Themes

- **Club** (`club`; light; canvas White 100, `#ffffff`): White canvas with navy ink, Light Grey steps and Yellow accents; open and everyday.
- **Exclusive** (`exclusive`; light; canvas Yellow 100, `#f2f93c`): Saturated yellow canvas with navy ink, cooled by Light Grey steps; loud and warm.
- **Private** (`private`; light; canvas Light Grey 100, `#a6bfcc`): Calm Light Grey canvas with navy ink and Yellow highlights; quiet and considered.

## Quick Start

Build on the Neon base. Add `@neon/theme`, `@neon/immersive-themes` and this brief's item, `@neon/theme-brief-ultra-run`. `ImmersiveLayout` is optional: pass it `immersiveTheme="ultra"`, or, on the page's own root, import `@/theme/immersive.css` and set `data-immersive-theme="ultra"` on that root and on `<html>`, removed on unmount, and give `Logo` its `tone`. Every value comes from the installed CSS; never retype the values above.

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
