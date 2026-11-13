---
name: neon-deck
description: Use when an employee asks for a Finnomena deck, proposal, pitch or presentation as slides, built as one HTML file that opens in a browser and prints to PDF, with its cover, closing and Pattern panels drawn by the Block engine. Applies to explicit invocation and established Finnomena intent. Use neon-block for a single picture such as one cover or an ad, and neon-create for an app screen or a web page.
---

# Build a Finnomena deck

## Purpose

Turn a request into a deck: 16:9 slides in one HTML file, with the words as real text and every Pattern as Brand Artwork from the Block engine. The deck follows the guideline's presentation rule: graphics bold and simple, a few large blocks, never a busy texture behind text.

## When to use

Use for slides the employee will present, send or print. A deck in PowerPoint, Google Slides or Figma is outside this skill: build the HTML deck, then offer its PDF and the artwork files for the employee's own tool. A photo slide is outside this release: leave the slot as plain ground and say so.

## What a deck is made of

Start from `assets/deck.html` in this skill's directory: copy it to the employee's working directory as `<name>.html` and edit the copy. It holds the slide size, the type sizes, the keys and the print rule; change its slides, not its rules.

| Slide | Ground | Artwork |
| --- | --- | --- |
| Cover | The artwork | `cover` layout at `screen-16-9`, with the title, a short `label` and the date as its `secondary` |
| Statement | Navy, grey or white | None |
| Text or list | White | Optional panel: `pattern` layout, 720 x 1080 px |
| Columns or figures | White or grey | None |
| Table | White | None |
| Closing | The artwork | `closing` layout at `screen-16-9` |

The artwork is drawn the way `neon-block` draws it (`<Neon root>/skills/neon-block/SKILL.md`, "Tools" and "Reading the answer"): through the `finno` tools `options`, `candidates` and `render`, or `node <Neon root>/scripts/finno.mjs` from the employee's working directory, where the files land in `./finnomena-artwork/` beside the deck. The Neon root is two levels above this skill's real directory.

## Workflow

1. Settle the audience, the one thing they should decide or remember, and the length. Ask only for what is missing; with no length given, plan eight to twelve slides. Write the outline as one line per slide (kind, title) and show it before drawing when the employee gave no content of their own.
2. Write the slides in the copy. One idea per slide; a title of at most two lines; at most five list items, four columns or six table rows. Text that does not fit is cut or split into another slide, never shrunk below the template's sizes. Highlight a few words with `<mark>`, at most once per slide.
3. Call `options` once and choose one Colourway from the primary group for the whole deck, another only for a product with a secondary colour. The cover and closing take the same Colourway and Slope.
4. Draw the cover and the closing with `candidates`, then `render` with `--name cover` and `--name closing`. Show the employee the cover's sheet and ask for a number; when they asked for a finished deck with no choosing, pick the Candidate with the fewest, largest blocks that leaves the title clear, and say which.
5. Add a panel to at most one content slide in three, and never two in a row. Draw each at the slot's size (`--width 720 --height 1080`, `--layout pattern`) with `candidates`, render the Candidate with the fewest, largest blocks under its own `--name`, and give the slide the class `has-panel`. The template has no other Pattern slot: a thin band draws many small blocks, which the guideline's deck does not.
6. Place every file whole in its slot, as the template does. Never crop, stretch, tile, recolour or fade a Pattern, never put HTML text or a shape over one, and never draw blocks in CSS: text on artwork comes only from the engine.
7. Open the deck in a browser and look at every slide, then open `<name>.html?check`: it outlines in red each slide whose text runs past its box or whose artwork is missing, and `deckCheck()` in the console lists them. Fix each one and look again.

## Content rules

- Figures the employee did not supply are sample figures: mark the slide with the template's `note` line ("Sample figures" or "ตัวอย่างตัวเลข") and say so in the report.
- A slide that names an investment product, its returns or its risk is Investment Content: it needs compliance review before the deck is shown outside the company. Add no promise of a return.
- Charts are drawn in HTML or inline SVG in the deck's Colourway colours and navy, with labels at the template's text size.

## Done

Report the deck's path, how to present it (open the file; arrow keys or a click move between slides) and how to make a PDF (print from the browser with background graphics on; the page size is set). List each artwork file with its Candidate, the Colourway, every `finno` warning in plain words, the slides with sample figures and the Investment Content note where it applies. Say which slides you looked at and what `?check` returned.
