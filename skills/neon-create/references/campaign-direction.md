# Campaign Page direction

Read before building a new or rebuilt Campaign Page. The page has two steps: you design it, then Neon themes it. Neon has no layout rules for a Campaign Page. [Campaign content](campaign-content.md) covers what the page may claim.

## 1. Design

Design the page with your full ability, as if no design system were asked for. Composition, section order, hero, grid, scale, type sizes and weights, spacing, shape, imagery, illustration and motion are yours. Use any design skill the host offers. Start from the request, its audience and its supplied assets, not from an earlier Neon page, the functional patterns, the starter layouts or a Theme Brief nobody named.

Three things from the start, so theming changes color and nothing else:

- **Color through page variables.** Give the page its own named color variables by role (canvas, text, block, accent, action and so on) and use only those, in CSS, inline SVG, canvas and WebGL alike. Choose their values freely for now.
- **Typeface and logo.** Set type in IBM Plex Sans Thai, whose Thai metrics move layout, and leave room for the Finnomena logo.
- **Page root.** On the Neon base, `ImmersiveLayout` is optional: it draws a 64px logo header, a 64px toolbar band above the content, and a 1440px cap. When the design wants another frame, build your own root: import `@/theme/immersive.css`, set `data-immersive-theme` on that root and on `<html>` (removing it from `<html>` on unmount), and pass `Logo` the `tone` of the surface it sits on.

Look at the built page at 375px and 1440px and improve the design until you are satisfied with it, before theming.

## 2. Theme

Point each page variable at the Immersive Theme's `--immersive-*` properties, per the contract's [color rules](../../INSTRUCTION.md#immersive-color). Change color only: leave layout, type, spacing, shape and motion as designed. When a color fails contrast or reads wrong, choose another step or ground for it before touching the layout. With a Reference-led reference, the page colors follow [Brand Intensity](../../INSTRUCTION.md#reference-designs-and-brand-intensity) instead.

Done when no color literal is left in the page outside supplied images, engine-drawn artwork and Gradient Recipe stops, and switching the theme recolors the whole page without moving anything. The review build's theme toggle proves it: check all four themes.

## What every page keeps

- **Brand Floor:** the Finnomena logo, IBM Plex Sans Thai, contrast of 4.5:1 for text (3:1 when large) and 3:1 for control boundaries, in each theme the page offers.
- **Motion safety:** item 4 of the [shared checklist](../../neon-redesign/references/verification.md#shared-checklist). Nothing a reader needs waits on a script, and the page is still under `prefers-reduced-motion: reduce`. A loop over 5 seconds can be paused.
- **Access:** keyboard reach, visible focus, real headings and controls, no page overflow at 375px, and no Thai mark cut off or colliding.
- **Truth:** [no invented proof](campaign-content.md#no-invented-proof).
- **Brand Pattern, when the design uses one:** it is optional unless the request asks for it. Draw it with the Block engine ([neon-block's Tools](../../neon-block/SKILL.md#tools), `layout` set to `pattern`), never by hand or in CSS, and don't crop, stretch, cover or animate it. A photo inside it fills one whole Block. Take the Block Colourway of the theme: Exclusive `grey__navy-100`, Club `white__yellow-100`, Private `grey__yellow-100`, Ultra `navy__grey-100`. Its colors are fixed in the file, so a theme switch swaps the file.

Where it goes and how large it is are yours.

## Look at it

Add these to [Look and fix](../../neon-redesign/references/verification.md#look-and-fix), on screenshots at both widths:

- Does the page look designed for this request, by your own judgment?
- After theming, did anything but color move?
- Does it still read in every theme it offers?

Fix the first in the design, the other two in the color mapping.

A note about feel ("ดูเรียบไป", "more energy") is a design note: redesign what it names, then theme again. A note about color changes only the mapping or the theme.
