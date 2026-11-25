# Campaign Page direction

Read before building a new or rebuilt Campaign Page. You design the page, then Neon themes it. This file sets the brand, not the ambition: Neon rules only on what [What every page keeps](#what-every-page-keeps) lists, and your own judgment decides the rest.

## 1. Design

Go all out. Make the page that shows what an incredible designer and motion designer you are, as if no design system were asked for. A one-line request is enough: find the idea in it, commit to that idea, and build without asking about style. Composition, section order, scale, type sizes and weights, spacing, shape, copy, imagery, illustration, motion and sound are yours, with any technique the browser runs: CSS, SVG, canvas, WebGL, shaders, 3D, scroll and frame-by-frame animation written as code. Use any design or motion skill the host offers. Start from the request, its audience and its supplied assets, not from an earlier Neon page, the functional patterns, the starter layouts or a Theme Brief nobody named.

Where the page shows a real product, use its real components or supplied screenshots rather than drawing the interface from memory. Pasted third-party component code is a structural donor: keep its engineering, and give it the page's copy, color variables and typeface.

Three things from the start, so theming changes color and nothing else:

- **Color through page variables.** Give the page its own named color variables by role (canvas, text, block, accent, action and so on) and use only those, in CSS, inline SVG, canvas and WebGL alike. Choose their values freely for now.
- **Typeface and logo.** Set type in IBM Plex Sans Thai, whose Thai metrics move layout, and leave room for the Finnomena logo.
- **Page root.** On the Neon base, `ImmersiveLayout` is optional: it draws a 64px logo header, a 64px toolbar band above the content, and a 1440px cap. When the design wants another frame, build your own root: import `@/theme/immersive.css`, set `data-immersive-theme` on that root and on `<html>` (removing it from `<html>` on unmount), and pass `Logo` the `tone` of the surface it sits on.

Look at the built page at 375px and 1440px, and at moving parts in several frames across their run, and improve the design until you would show it as your best work, before theming.

## 2. Theme

Point each page variable at the Immersive Theme's `--immersive-*` properties, per the contract's [color rules](../../INSTRUCTION.md#immersive-color). A theme may point a variable at another property than the rest do, as Ultra often needs. Change color only: leave layout, type, spacing, shape and motion as designed. When a color reads wrong, choose another step or ground for it before touching the layout. With a Reference-led reference, the page colors follow [Brand Intensity](../../INSTRUCTION.md#reference-designs-and-brand-intensity) instead.

Done when no color literal is left in the page outside supplied images, engine-drawn artwork and Gradient Recipe stops, and switching the theme recolors the whole page without moving anything. The review build's theme toggle proves it: check all four themes. The launch build keeps one theme and has no toggle.

## What every page keeps

- **Logo:** the Finnomena logo, from its supplied file.
- **Typeface:** IBM Plex Sans Thai.
- **Color:** the Immersive Theme's, or what Brand Intensity allows.
- **Brand Pattern, when the design uses one:** it is optional unless the request asks for it. Draw it with the Block engine ([neon-block's Tools](../../neon-block/SKILL.md#tools), `layout` set to `pattern`), never by hand or in CSS, and don't crop, stretch, cover or animate it. A photo inside it fills one whole Block. Take the Block Colourway of the theme: Exclusive `grey__navy-100`, Club `white__yellow-100`, Private `grey__yellow-100`, Ultra `navy__grey-100`. Its colors are fixed in the file, so a theme switch swaps the file. Where it goes and how large it is are yours.

## Look at it

Before showing the page, check your own frames against the list above and fix what fails. Then add these to [Look and fix](../../neon-redesign/references/verification.md#look-and-fix), on screenshots at both widths:

- Is this the best page you can make for this request, or the first one that worked?
- After theming, did anything but color move?
- Does the page still look right in every theme it offers?

Fix the first in the design, the other two in the color mapping.

A note is a designer's note: change the one thing it names and leave the rest. A note about feel ("ดูเรียบไป", "more energy", "not premium") goes to the design, then theme again. A note about color changes only the mapping or the theme.
