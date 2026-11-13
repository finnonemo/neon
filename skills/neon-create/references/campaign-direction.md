# Campaign Page direction

Read before composing a new or rebuilt Campaign Page on an Immersive Theme, with or without a Theme Brief. [Campaign content](campaign-content.md) decides what the page says; this decides how it looks and moves. The same tokens make a poster or a row of equal cards, so a plain page is a direction problem, not a token problem. An edit to an existing page keeps its direction, and so does a Brand Intensity move.

With a Reference Design at Blended or Reference-led, its geometry and motion replace [Composition](#composition) and set the motion level; the direction lines, the motion budget and [Look at it](#look-at-it) still apply.

## Direction lines

Write these beside the design thesis in `./NEON-HANDOFF.md`, before the first component file, one line each. The thesis's `First-read` line names what a reader takes from the first screen within a second; for an event that is its name with the date and place.

- `Register: <3–5 adjectives>`: how the page feels, taken from the request, the occasion and the brief's mood. Each adjective must change a choice below; drop one that does not.
- `Scale: <the largest element on each screenful and its type role; what stays small>`
- `Grounds: <which sections run edge to edge, and on which step>`
- `Motion: <each moment in the form under Motion, or none>`
- `Assets: <what was supplied; what the page uses in its place>`

## Assets first

List what the employee supplied (photos, illustrations, a Brand Pattern) before composing, and compose around it. With no image for a section, let type and color blocks carry it: a date in a display role, a numeral block, a drawn route. A section built around a large empty slot reads as a wireframe. A slot that must stay follows the [sample content](campaign-content.md#no-invented-proof) rule, at the size its content needs and no larger.

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

Habits to name and replace: hero, three equal cards, footer; every section on the same band and card recipe; `title2` as the largest type below the hero; large labelled image slots; shapes that carry no content; motion on every section; two accents competing; an adjective where a fact belongs.

## Motion

- **Budget.** At most two moments of motion per page beyond hover, focus and press changes, and never above the brief's level: `still` has none.
- **Form.** Write each moment as what moves, what that tells the reader (order, progress or cause), how it feels, its limit, and what happens under reduced motion. For example: `Motion: schedule rows rise 16px and fade in as the band enters view, to show the day's order; 200ms ease-out, 40ms apart, once; under reduced motion they are simply there.` A moment that tells the reader nothing is cut.
- **Cost.** Animate `transform` and `opacity` only. Movement tied to scroll stays under a tenth of the element's height and within the level's limit, never behind text, and runs from CSS scroll-driven animation, an `IntersectionObserver`, or a passive scroll listener throttled to animation frames.
- **Stillness.** The first screen makes its point as a still: no autoplay video or loop carries the proposition, and nothing animates a Brand Pattern. Content starts visible, per item 4 of the [shared checklist](../../neon-redesign/references/verification.md#shared-checklist).

## Look at it

On a Campaign Page, add these to the [Look and fix](../../neon-redesign/references/verification.md#look-and-fix) questions, on the 375px and 1440px screenshots viewed at reduced scale:

- Within a second, is the `First-read` what you see, with the next action beside it?
- On each screenful, does one element dominate, or do equal blocks share the weight?
- Do the grounds change, and is a display role used below the hero for a fact?
- Does the accent mark only the action path?
- Does each motion moment match its line and the budget, and does the page hold under `prefers-reduced-motion: reduce`?
- Does the page show a habit from the list above? Name it in the finding.
- Does each `Register` adjective show somewhere you can point to?

## When it misses

When one section is weak, show two or three static takes of that section and keep the rest. When the whole page reads as generic, the direction lines were generic: rewrite them and rebuild from them, rather than patching section by section. An employee's note about feel ("ดูเรียบไป", "more energy") changes a direction line first and CSS second; say which line changed.
