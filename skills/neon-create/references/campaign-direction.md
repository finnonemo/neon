# Campaign Page direction

Read before composing a new or rebuilt Campaign Page on an Immersive Theme, with or without a Theme Brief. [Campaign content](campaign-content.md) decides what the page says; this decides how it looks and moves. The same tokens make a poster or a row of equal cards, so a plain page is a direction problem, not a token problem. An edit to an existing page keeps its direction, and so does a Brand Intensity move.

With a Reference Design at Blended or Reference-led, its geometry and motion replace [Composition](#composition) and set the motion level; the direction lines, the motion budget and [Look at it](#look-at-it) still apply.

## Direction lines

Write these beside the design thesis in `./NEON-HANDOFF.md`, before the first component file, one line each. The thesis's `First-read` line names what a reader takes from the first screen within a second; for an event that is its name with the date and place.

- `Register: <3–5 adjectives>`: how the page feels, taken from the request, the occasion and the brief's mood. Each adjective must change a choice below; drop one that does not.
- `Scale: <the largest element on each screenful and its type role; what stays small>`
- `Grounds: <which sections run edge to edge, and on which step>`
- `Motion: <each moment in the form under Motion, or none>`
- `Brand Pattern: <the screenful it leads, its slot's size at 375px and 1440px, its Block Colourway, where a photo goes>`
- `Assets: <what was supplied; what the page uses in its place>`

## Assets first

List what the employee supplied (photos, illustrations) before composing, and compose around it. The [Brand Pattern](#brand-pattern) is never on that list: the page draws it. With no image for a section, let type and color blocks carry it: a date in a display role, a numeral block, a drawn route. A section built around a large empty slot reads as a wireframe. A slot that must stay follows the [sample content](campaign-content.md#no-invented-proof) rule, at the size its content needs and no larger.

## Brand Pattern

Every Campaign Page on an Immersive Theme carries a Brand Pattern drawn by the Block engine, with or without a Theme Brief. It is the page's illustration, not a border: a page without one, or with one too small to read as one, misses the brand.

- **Drawn, never made.** Reach the engine through the `options`, `candidates` and `render` tools, or `scripts/finno.mjs`, as [neon-block's Tools](../../neon-block/SKILL.md#tools) has it, with `layout` set to `pattern`. Never hand-draw it, imitate it in CSS, crop, stretch or cover it, or animate it.
- **Colourway.** A brief's Block Colourway stands. Without a brief, take the theme's from its briefs: Exclusive `grey__navy-100`, Club `white__yellow-100`, Private `grey__yellow-100`, Ultra `navy__grey-100`.
- **Size.** It leads its screenful, the hero's unless a brief places it elsewhere. Draw it for the slot it fills: from 988px it takes at least half the hero's width and its full height; at 375px it spans the column at 4:5 or squarer. The slot is never wider than 2:1, and never a strip under or beside the text: a strip shrinks the Blocks to a row of small steps, which the guideline's "bold and simple" rules out. Render one file per slot shape at the slot's size in px (`width` and `height`) and swap them by breakpoint.
- **Room for a photo.** The Blocks cover about a third to three fifths of the Pattern, and the clear part is where a photo goes, as the guideline's Hero experts layout has it. A supplied photo sits in that clear part, beside the Blocks and never over or under them, and never crops a face. With no photo, the clear part stays the Pattern's own space: hold no labelled slot there, and the Done report says where a photo would go.
- **Pick to read.** Of the twelve candidates, pick one whose few large Blocks leave the most clear space beside the text and the photo; take `candidates` again for twelve more rather than settle on many small steps.

## Composition

Inside an Immersive Theme (text White or Navy, tints by step, one color family per block, no gradient), contrast comes from scale, ground and position.

- **One dominant element per screenful.** It sits at least two type roles above its neighbors. `display1` to `display3` are for the page's facts wherever they appear (the name, the date, a distance, a deadline), not only the hero headline. A number in a display role is the cheapest image a page has.
- **Grounds change down the page.** At least one section beside the hero runs edge to edge on a saturated step, with the content column inside it. A page of canvas bands holding tinted cards reads as one texture.
- **Unequal blocks.** Size blocks by importance: a wide block beside a narrow one, a block that spans two rows. Keep a row of equal cards for true peers the reader compares, once per page at most.
- **Break the stack where it points at something.** A block that overlaps the band above, a section title that stays put beside its scrolling rows, an asymmetric split. Use one or two, each leading the eye to the main action or a key fact.
- **The accent marks the action path.** The accent family's strongest step goes on the grounds and rows that lead to the main action, and nowhere else. Secondary colors stay in small blocks, as the [contract](../../INSTRUCTION.md#composition) has it.
- **Space gathers around what matters.** The widest gap on a screenful surrounds its dominant element. Running text keeps a column of about 60 to 75 characters while its band runs full width.
- **Type roles as they ship.** No letter-spacing, no weight utility beside a role, and no tightened line height: check a wrapped Thai display heading in the browser, per the [type rules](../../INSTRUCTION.md#typography-geometry-and-assets).

With a Theme Brief, its section order, hero pattern, components, fills and its radius and padding picks stand. So do the grounds in its Layout table, its lead fact role and its feature block radius, when the brief has them: write the `Grounds` line from the table. These moves decide what it leaves open: which component dominates each screenful, how blocks are sized against each other, and, in a brief without those picks, which band runs edge to edge and which type role each fact takes. When a move needs a value the brief did not pick (a display role for a date, a larger radius on a numeral block), take a step from the same scale and list it in the Done report as a departure from the brief.

Habits to name and replace: no Brand Pattern, or one drawn as a strip; hero, three equal cards, footer; every section on the same band and card recipe; `title2` as the largest type below the hero; large labelled image slots; shapes that carry no content; motion on every section; a scroll pattern used where it tells nothing; two accents competing; an adjective where a fact belongs.

## Motion

A Campaign Page may tell its story with the four named scroll patterns of [ADR 0013](../../../docs/adr/0013-campaign-pages-tell-a-story-with-named-scroll-patterns.md):

| Pattern | What moves | What it tells | Limit | Level |
|---|---|---|---|---|
| **Pinned story** | A visual stays pinned (`position: sticky`) while 3–5 text steps scroll beside it; at each step it crossfades to that step's state | Order: the steps of a journey, a product, a day | One per page; 3–5 steps; crossfade 150–250ms; the visual does not translate | `subtle`, `lively` |
| **Scrubbed reveal** | One image or block scales from 0.92 to 1 and fades in as its section crosses the viewport, tied to scroll progress | Cause or emphasis: the thing the section is about arrives | Translation 32px or less; one per section, two per page | `lively` |
| **Count-up figure** | A figure in a display role counts up to its final value once, as it enters view | Size: a distance, a sum, a number of people | 600–1200ms, ease-out, once | `subtle`, `lively` |
| **Progress rail** | A thin bar beside or above a long section grows on `scaleX` or `scaleY` with scroll progress through it | Progress: how far along a route, a schedule or a list the reader is | One per page; carries no label the reader must read | `subtle`, `lively` |

- **Budget.** Up to three moments on a `lively` page and two on a `subtle` page, at most one of them a Pinned story; `still` has none. One use of a pattern is one moment (a Pinned story with five steps is one), and a fade or slide as content enters view is one too. Hover, focus and press changes never count. Never go above the brief's level.
- **Form.** Write each moment as the pattern, what moves, what that tells the reader (order, size, cause or progress), how it feels, its limit, and what happens under reduced motion. For example: `Motion: Pinned story, the route map stays while the four points scroll beside it and it crossfades to each, to show the route's order; 200ms ease-out; below md and under reduced motion each point shows its own map above its text.` A moment that tells the reader nothing is cut.
- **Timing.** Every movement keeps its level's range: `subtle` 150–250ms with slides of 16px or less, `lively` 200–400ms with 32px or less. The Count-up figure's 600–1200ms is exempt, because it changes digits in place and moves nothing.
- **Pinned story.** Below the `md` tier (500px) the visual does not pin: each step shows its own state of the visual above its text. Step changes come from an `IntersectionObserver` on the steps.
- **Scrubbed reveal.** Its start state (scaled down, faded) applies only under an attribute a script sets once it has run, so the content is visible without the script.
- **Count-up figure.** Mark its element `data-count-up`, so a check reading the page's timings leaves it out. The final value is in the HTML. Count from at least half of it, never from zero. Set `font-variant-numeric: tabular-nums` and a width fixed to the final value, so nothing shifts; screen readers get the final value only (`aria-hidden` on the counting text, the value in visually hidden text).
- **Cost.** Animate `transform` and `opacity` only (the Count-up figure changes text). Movement tied to scroll stays within the level's limit and never runs behind text. Run it from CSS scroll-driven animation (`animation-timeline: view()` or `scroll()`) under `@supports`, otherwise an `IntersectionObserver`, or a passive scroll listener throttled to animation frames.
- **Reduced motion.** Under `prefers-reduced-motion: reduce` the page is still: a Pinned story stacks its steps as on narrow screens, a Scrubbed reveal shows its end state, a Count-up figure shows its final value and a Progress rail is hidden.
- **Stillness.** The first screen makes its point as a still: no autoplay video or loop carries the proposition, and nothing animates a Brand Pattern. Content starts visible, per item 4 of the [shared checklist](../../neon-redesign/references/verification.md#shared-checklist).

## Look at it

On a Campaign Page, add these to the [Look and fix](../../neon-redesign/references/verification.md#look-and-fix) questions, on the 375px and 1440px screenshots viewed at reduced scale:

- Within a second, is the `First-read` what you see, with the next action beside it?
- Does the Brand Pattern lead its screenful at both widths, in a few large Blocks with clear space beside them, uncropped and unstretched?
- On each screenful, does one element dominate, or do equal blocks share the weight?
- Do the grounds change, and is a display role used below the hero for a fact?
- Does the accent mark only the action path?
- Does each motion moment use the pattern its line names, within the budget and the level's timing, and is the page still under `prefers-reduced-motion: reduce`?
- Does the page show a habit from the list above? Name it in the finding.
- Does each `Register` adjective show somewhere you can point to?

## When it misses

When one section is weak, show two or three static takes of that section and keep the rest. When the whole page reads as generic, the direction lines were generic: rewrite them and rebuild from them, rather than patching section by section. An employee's note about feel ("ดูเรียบไป", "more energy") changes a direction line first and CSS second; say which line changed.
