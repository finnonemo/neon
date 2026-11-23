# Pattern register

Compositions taken from the maintainer's private reference screens ([ADR 0017](../adr/0017-reference-screens-stay-private-and-lend-only-composition.md)). For maintainers; not packaged. Only composition and behaviour are recorded here: values and components come from Core. Every pattern is `illustrative` until the owner approves it by property, through [the example library](example-library.md). Functional patterns (P1 to P12) wait for ADR 0015's gate before they reach a skill or `examples/`; P13 does not.

| Code | Pattern | Task | Regions, in order | Status |
| --- | --- | --- | --- | --- |
| P1 | Value-row form and dock | Set up one thing with sensible defaults | Title and one line of help; name field; rows of label, current value and chevron; a single choice; dock with a way out and the one primary | illustrative, first set |
| P2 | Stepped form | Finish a task with a real sequence | Title; progress steps; one step's fields; dock with back and continue | illustrative |
| P3 | Long form | Enter much related information | Sections by heading and space; tiles for a choice of few; repeatable item group with an add action under it; dock | illustrative |
| P4 | Form with summary | Check the result while filling in | Form; summary of label and value, total or preview in the Inspector; primary beside the summary | illustrative |
| P5 | Filtered list and Inspector | Find one record and read it | Title; search and filters; result count; table or rows; selected record in the Inspector; on narrow, two-line rows that open the record | illustrative, first set |
| P6 | Work queue | Act on records one by one or in bulk | Status filter with counts; rows with a secondary action; selection bar; confirmation | illustrative |
| P7 | Record detail | Read one record and act on it | Identity and status; warning with its action; figure band; tabs or sections; history as vertical progress | illustrative |
| P8 | Overview of figures | See where things stand | Title naming the scope; the main figure; figure band; short collections, each ending in its own way in | illustrative, first set |
| P9 | Settings | Change how something works | List of areas; one area's rows, choices and switches in the detail | illustrative |
| P10 | Screen states | Understand loading, nothing or failure | Skeleton in the final layout; empty state under live filters; error with one way back | illustrative |
| P11 | Dialog | Decide or edit without leaving | Fixed heading; scrolling content; fixed actions | illustrative |
| P12 | Browsing | Choose among many things worth seeing | Search and categories; filters; sections with a way to the full set; tiles | illustrative |
| P13 | Campaign Page sections | Understand an offer | Proposition with image and action; short benefits; questions and answers; terms | illustrative |

## Refused parts

| In the references | Used instead | Rule |
| --- | --- | --- |
| Drawer from the side over a scrim | Inspector, or the overlay Core gives the content | [Core sheet](../../core/components/sheet.md) |
| Tabs as the frame of Settings | List and detail | [Page anatomy](../../skills/neon-audit/references/page-anatomy.md) |
| Action in an empty state whose filters are the way out | No action | [Page anatomy](../../skills/neon-audit/references/page-anatomy.md) |
| Permanent deletion in the ordinary primary color | Danger | [Core hierarchy](../../core/hierarchy.md), rule 5 |
| A card around each row | Rows and hairlines | [Functional patterns](../../skills/neon-audit/references/functional-patterns.md) |
| Form and preview as a third column | One Inspector, or a sheet | [Functional patterns](../../skills/neon-audit/references/functional-patterns.md) |
| Tinted figure tiles | One figure band | [Functional patterns](../../skills/neon-audit/references/functional-patterns.md) |
| Monospaced figures | Tabular numerals | [Functional patterns](../../skills/neon-audit/references/functional-patterns.md) |
| Colored promotion and greeting on a work screen | Title naming the task and scope | [Design intent](../../skills/INSTRUCTION.md#design-intent) |
| Dark header of the screen's own, selected bar at the sidebar's edge | The app's shell | [Design intent](../../skills/INSTRUCTION.md#fixed-and-yours-to-design) |
| Heavy outline for a choice, a card around a form | Core Tile; heading and space | [Core tile](../../core/components/tile.md) |
| Rectangular primary, filled color of the source | Core Button | [Core button](../../core/components/button.md) |
