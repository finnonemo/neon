# Finnomena Club — Style Reference
> Bright white membership page. Clean paper canvas, navy ink, blue-grey tint blocks and a yellow spark for the moments that matter.

**Theme:** light

Provisional pending design owner review. Color values are `theme/tokens/colors.json` steps from the Immersive Theme file (`immersive-themes.json`, not yet merged) (Finnomena Guidelines v1, Colour 4.1–4.7); type, spacing and radius come from `theme/cds/theme.config.ts` and `theme/tokens/`. Roles, components, layout and prompts are interpreted from `skills/INSTRUCTION.md`, not measured from a live site. Immersive pages only; functional screens keep the shared CDS mapping.

Club is the entry membership level and the most open of the four: a white canvas that keeps the page airy, navy text and a navy main action for a clear, trustworthy voice, and two supporting families. Light Grey steps build quiet section blocks; Yellow steps mark highlights, offers and the single most important block on a screen. It reads as Finnomena's everyday product voice dressed up for a campaign. Membership ratio: White 60 / Light Grey 15 / Yellow 15 / Navy 10.

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Canvas | `#ffffff` | `--immersive-canvas` | Page background; covers the largest share of the page |
| Text | `#01172b` | `--immersive-text` | All body and heading text on the canvas |
| Light Grey 100 | `#a6bfcc` | `--immersive-palette-100` | Theme tint block; text Navy |
| Light Grey 75 | `#bccfd9` | `--immersive-palette-75` | Theme tint block; text Navy |
| Light Grey 50 | `#d3dfe6` | `--immersive-palette-50` | Theme tint block; text Navy |
| Light Grey 25 | `#e9eff2` | `--immersive-palette-25` | Theme tint block; text Navy |
| Yellow 100 | `#f2f93c` | `--immersive-accent-100` | Accent block, highlight or offer; text Navy |
| Yellow 75 | `#f5fb6d` | `--immersive-accent-75` | Accent block, highlight or offer; text Navy |
| Yellow 50 | `#f9fc9e` | `--immersive-accent-50` | Accent block, highlight or offer; text Navy |
| Yellow 25 | `#fcfece` | `--immersive-accent-25` | Accent block, highlight or offer; text Navy |
| Action | `#01172b` | `--immersive-action` | Main action fill; label White |
| On action | `#ffffff` | `--immersive-on-action` | Main action label |

**Shared secondary colors** (every theme; small highlight, tag and illustration blocks only):

| Family | 100 | 75 | 50 | 25 | Text |
|--------|-----|----|----|----|------|
| Green (`--immersive-green-*`) | `#00e76b` | `#40ed90` | `#80f3b5` | `#bff9da` | Navy |
| Blue (`--immersive-blue-*`) | `#50cfff` | `#7cdbff` | `#a8e7ff` | `#d3f3ff` | Navy |
| Purple (`--immersive-purple-*`) | `#aa46c3` | `#bf74d2` | `#d5a3e1` | `#ead1f0` | White on 100, Navy on 75/50/25 |
| Red (`--immersive-red-*`) | `#f73232` | `#f96565` | `#fb9999` | `#fdcccc` | Navy |
| Orange (`--immersive-orange-*`) | `#f26414` | `#f58b4f` | `#f9b28a` | `#fcd8c4` | Navy |

## Tokens — Typography

### IBM Plex Sans Thai — The only typeface: display, headings, body, labels and actions, for Thai and Latin alike. Part of the Brand Floor at every Brand Intensity. · `--fontFamily-body`
- **Substitute:** none; load IBM Plex Sans Thai through the app's font loader, `sans-serif` only as the CSS fallback
- **Weights:** 400, 500, 700
- **Sizes:** 17px, 20px, 22px, 28px, 54px, 60px, 92px
- **Line height:** 1.11–1.29 (fixed pixel line heights per role)
- **Letter spacing:** not set by the generated theme; keep the font default
- **Role:** Every text role. Weight 400 carries display, titles and body; 500 marks the headline role; 700 is display3 only. Verify Thai and Latin glyphs both render.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| body | IBM Plex Sans Thai | 400 | 17px | 22px | — | `--fontSize-body` |
| headline | IBM Plex Sans Thai | 500 | 17px | 22px | — | `--fontSize-headline` |
| title3 | IBM Plex Sans Thai | 400 | 20px | 25px | — | `--fontSize-title3` |
| title2 | IBM Plex Sans Thai | 400 | 22px | 28px | — | `--fontSize-title2` |
| title1 | IBM Plex Sans Thai | 400 | 28px | 34px | — | `--fontSize-title1` |
| display3 | IBM Plex Sans Thai | 700 | 54px | 64px | — | `--fontSize-display3` |
| display2 | IBM Plex Sans Thai | 400 | 60px | 70px | — | `--fontSize-display2` |
| display1 | IBM Plex Sans Thai | 400 | 92px | 102px | — | `--fontSize-display1` |

The generated theme defines no title4, label, caption or legal values; CDS defaults apply there.

## Tokens — Spacing & Shapes

**Base unit:** 8px

**Density:** comfortable (interpreted for immersive pages)

### Spacing Scale

| Name | Value | Token |
|------|-------|-------|
| 0.25 | 2px | CDS `0.25` (no CSS variable) |
| 0.5 | 4px | CDS `0.5` (no CSS variable) |
| 0.75 | 6px | CDS `0.75` (no CSS variable) |
| 1 | 8px | `--space-1` |
| 1.5 | 12px | CDS `1.5` (no CSS variable) |
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

| Element | Value |
|---------|-------|
| buttons (pill) | round (`--borderRadius-1000`) |
| buttons (rect) | 8px (radius-sm) |
| tags (large, medium) | 8px |
| tags (small, x-small) | 4px |
| blocks and cards | choose one step from 16–32px and keep it page-wide (interpreted; no token assigns it) |

| Name | Value | Token |
|------|-------|-------|
| xs | 4px | `--borderRadius-100` |
| sm | 8px | `--borderRadius-200` |
| md | 12px | `--borderRadius-300` |
| lg | 16px | `--borderRadius-400` |
| xl | 24px | `--borderRadius-500` |
| 2xl | 32px | `--borderRadius-600` |
| 3xl | 40px | `--borderRadius-700` |
| 4xl | 48px | `--borderRadius-800` |
| round | fully round | `--borderRadius-1000` |

### Layout

- **Page max-width:** not defined in tokens; reuse the app shell's content width
- **Section gap:** 64–80px (`--space-8`–`--space-10`, interpreted)
- **Card padding:** 24–32px (`--space-3`–`--space-4`, interpreted)
- **Element gap:** 8–16px (`--space-1`–`--space-2`)

## Components

### Main Action Button
**Role:** The one primary action per section

`--immersive-action` (#01172b) fill, `--immersive-on-action` (#ffffff) label at 18.12:1, IBM Plex Sans Thai headline weight 500. Expressive size: 48px high, 240–256px wide, pill radius with 36px horizontal padding or rect 8px radius with 24px padding.

### Secondary Action Button
**Role:** Alternative action beside the main one

Transparent fill, Navy label and a 2px Navy outline on the canvas (18.12:1, above the 3:1 boundary minimum). Same height and radius as the main action so they pair.

### Light Grey Tint Block
**Role:** Group a section or a set of benefits

`--immersive-palette-100` (#a6bfcc) fill with `--immersive-on-palette-100` (#01172b) text at 9.45:1. Flat, no border, no shadow; step lighter for nested emphasis rather than adding opacity.

### Yellow Accent Block
**Role:** The highlighted offer, key number or call-out

`--immersive-accent-100` (#f2f93c) fill with `--immersive-on-accent-100` text. Use one per screen so it keeps its pull; lighter accent steps can hold supporting copy.

### Highlight Tag
**Role:** Small label for a feature, tier or category

A secondary step such as `--immersive-green-25` with its `--immersive-on-green-25` text, 8px radius, 32px high with 8px side padding. Keep secondaries out of data where green or red would read as gain or loss.

### Hero
**Role:** Opening proposition

Display headline (display2 60px/70px or display3 54px/64px bold) in Navy on the canvas, a short title3 supporting line, the Main Action Button and relevant Finnomena imagery. One clear proposition, no gradient field.

### Logo
**Role:** Brand identity

The Finnomena mark from `templates/vitejs-cds/src/layout/Logo.tsx`, chosen for a light surface. Never recreate the wordmark as text.

## Do's and Don'ts

### Do
- Set `data-immersive-theme="club"` on the page root and color every section from the `--immersive-*` properties.
- Pair each fill with its own `--immersive-on-*` text color; text is only White #ffffff or Navy #01172b.
- Build emphasis with tint steps (100 → 75 → 50 → 25), not opacity.
- Keep one color family per background block.
- Keep IBM Plex Sans Thai for every text role and check Thai and Latin together.
- Let the white canvas carry about 60% of the page; Light Grey and Yellow blocks share the next 30%, and navy text and actions supply the last 10%.

### Don't
- Do not use gradients inside a theme.
- Do not invent near-palette tints or new hex values; every color is a token step.
- Do not let secondary colors lead; keep them to small blocks, tags and illustrations.
- Do not use status colors as decoration; positive and negative stay semantic.
- Do not carry this theme into functional screens such as dense tables or back office tools.
- Do not flood a whole section in Yellow.100; on Club yellow is the accent, so keep it to one highlighted block or band per screen.

## Surfaces

| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 1 | Canvas | `#ffffff` | Page background |
| 2 | Light Grey 100 | `#a6bfcc` | Tint block, one step lighter |
| 3 | Light Grey 75 | `#bccfd9` | Tint block, one step lighter |
| 4 | Light Grey 50 | `#d3dfe6` | Tint block, one step lighter |
| 5 | Light Grey 25 | `#e9eff2` | Tint block, one step lighter |
| 6 | Yellow 100 | `#f2f93c` | Accent block |

## Elevation

- **None.** The tokens define no shadow (component drop shadow is 0 with a transparent color). Separate surfaces with tint steps instead of shadows or borders.

## Imagery

Finnomena or supplied imagery that explains the offer: product screens, people in context and colorful Finnomena illustrations, which may use the shared secondary colors. No stock imagery that contradicts the story, and no imagery, logos or copy from a reference brand.

## Layout

A white page with sections separated by Light Grey tint bands rather than lines. The hero sits on white with a display headline in navy and the navy main action; a single Yellow block draws the eye to the offer or key benefit. Benefit rows and feature groups sit on Light Grey.25–.75 blocks. Secondary colors appear only as small tags or illustration blocks. Narrow screens stack blocks in reading order and keep the main action reachable.

## Agent Prompt Guide

**Quick Color Reference**
- text: #01172b (Navy)
- background: #ffffff (canvas), #a6bfcc (tint block)
- accent: #f2f93c (Yellow)
- primary action: #01172b (label #ffffff)
- highlight: shared secondary steps, small blocks only

**3-5 Example Component Prompts**

1. Create a hero on the Club theme: page root `data-immersive-theme="club"`, display2 headline in IBM Plex Sans Thai 60px/70px weight 400 color var(--immersive-text), one supporting line at 20px/25px, and a Main Action Button.

2. Create a main action: 'สมัครเลย' — 48px high, pill radius, 36px horizontal padding, background var(--immersive-action), label var(--immersive-on-action), 17px weight 500.

3. Create a benefits section: three items on var(--immersive-palette-100) with text var(--immersive-on-palette-100), 24px radius, 32px padding, 16px gap, no shadow.

4. Create an offer call-out: var(--immersive-accent-100) block with var(--immersive-on-accent-100) text, a title1 28px/34px headline and one line of body copy.

5. Create a feature tag: var(--immersive-blue-25) fill, var(--immersive-on-blue-25) text, 8px radius, 32px high, 8px side padding, 17px weight 500.

## Sibling Themes

- **Exclusive** — Saturated yellow canvas with navy ink. Loud, warm and unmistakably Finnomena, cooled by blue-grey blocks. Canvas `#f2f93c`.
- **Private** — Calm blue-grey canvas with navy ink and yellow highlights. Quiet, considered, a private-banking hush. Canvas `#a6bfcc`.
- **Ultra** — Deep navy canvas, white type and a yellow spark. The top tier: dark, confident and high-contrast. Canvas `#01172b`.

## Quick Start

### CSS Custom Properties

Copy the generated Immersive Themes CSS (`immersive-themes.css`) and `theme/css/theme.css` into the app; do not retype these values. For reference, the theme resolves to:

```css
[data-immersive-theme="club"] {
  /* Colors */
  --immersive-canvas: #ffffff; /* White.100 */
  --immersive-text: #01172b; /* Navy.100 */
  --immersive-palette-100: #a6bfcc; /* Light Grey.100 */
  --immersive-palette-75: #bccfd9; /* Light Grey.75 */
  --immersive-palette-50: #d3dfe6; /* Light Grey.50 */
  --immersive-palette-25: #e9eff2; /* Light Grey.25 */
  --immersive-accent-100: #f2f93c; /* Yellow.100 */
  --immersive-accent-75: #f5fb6d; /* Yellow.75 */
  --immersive-accent-50: #f9fc9e; /* Yellow.50 */
  --immersive-accent-25: #fcfece; /* Yellow.25 */
  --immersive-action: #01172b; /* Navy.100 */
  --immersive-on-action: #ffffff; /* White.100 */
  --immersive-on-palette-100: #01172b; /* Navy.100 */
  --immersive-on-palette-75: #01172b; /* Navy.100 */
  --immersive-on-palette-50: #01172b; /* Navy.100 */
  --immersive-on-palette-25: #01172b; /* Navy.100 */
  --immersive-on-accent-100: #01172b; /* Navy.100 */
  --immersive-on-accent-75: #01172b; /* Navy.100 */
  --immersive-on-accent-50: #01172b; /* Navy.100 */
  --immersive-on-accent-25: #01172b; /* Navy.100 */
}

:root {
  /* From theme/css/theme.css */
  /* Typography: --fontFamily-<role>, --fontSize-<role>, --fontWeight-<role>, --lineHeight-<role> */
  /* body: 17px / 22px / 400 */
  /* headline: 17px / 22px / 500 */
  /* title3: 20px / 25px / 400 */
  /* title2: 22px / 28px / 400 */
  /* title1: 28px / 34px / 400 */
  /* display3: 54px / 64px / 700 */
  /* display2: 60px / 70px / 400 */
  /* display1: 92px / 102px / 400 */
  /* Spacing: --space-0 … --space-10 (8px steps) */
  /* Radius: --borderRadius-100 (4px) … --borderRadius-800 (48px), --borderRadius-1000 (round) */
}
```

### Tailwind v4

```css
@theme inline {
  /* Aliases only; the values stay in the generated theme CSS */
  --color-canvas: var(--immersive-canvas);
  --color-ink: var(--immersive-text);
  --color-action: var(--immersive-action);
  --color-on-action: var(--immersive-on-action);
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
  --font-sans: 'IBM Plex Sans Thai', sans-serif;
  --text-body: var(--fontSize-body);
  --text-body--line-height: var(--lineHeight-body);
  --text-body--font-weight: var(--fontWeight-body);
  --text-headline: var(--fontSize-headline);
  --text-headline--line-height: var(--lineHeight-headline);
  --text-headline--font-weight: var(--fontWeight-headline);
  --text-title3: var(--fontSize-title3);
  --text-title3--line-height: var(--lineHeight-title3);
  --text-title3--font-weight: var(--fontWeight-title3);
  --text-title2: var(--fontSize-title2);
  --text-title2--line-height: var(--lineHeight-title2);
  --text-title2--font-weight: var(--fontWeight-title2);
  --text-title1: var(--fontSize-title1);
  --text-title1--line-height: var(--lineHeight-title1);
  --text-title1--font-weight: var(--fontWeight-title1);
  --text-display3: var(--fontSize-display3);
  --text-display3--line-height: var(--lineHeight-display3);
  --text-display3--font-weight: var(--fontWeight-display3);
  --text-display2: var(--fontSize-display2);
  --text-display2--line-height: var(--lineHeight-display2);
  --text-display2--font-weight: var(--fontWeight-display2);
  --text-display1: var(--fontSize-display1);
  --text-display1--line-height: var(--lineHeight-display1);
  --text-display1--font-weight: var(--fontWeight-display1);
  --radius-xs: var(--borderRadius-100);
  --radius-sm: var(--borderRadius-200);
  --radius-md: var(--borderRadius-300);
  --radius-lg: var(--borderRadius-400);
  --radius-xl: var(--borderRadius-500);
  --radius-2xl: var(--borderRadius-600);
  --radius-3xl: var(--borderRadius-700);
  --radius-4xl: var(--borderRadius-800);
  --radius-round: var(--borderRadius-1000);
}
```
