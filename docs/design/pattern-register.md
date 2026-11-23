# Pattern register

Compositions taken from the maintainer's private reference screens ([ADR 0017](../adr/0017-reference-screens-stay-private-and-lend-only-composition.md)). For maintainers; not packaged. Only composition and behaviour are recorded here: values and components come from Core. Every pattern is `illustrative` until the owner approves it by property, through [the example library](example-library.md). Functional patterns (P1 to P12) wait for ADR 0015's gate before they reach a skill or `examples/`; P13 does not.

| Code | Pattern | Task | Regions, in order | Status |
| --- | --- | --- | --- | --- |
| P1 | Value-row form and dock | Set up one thing with sensible defaults | Title and one line of help; name field; rows of label, current value and chevron; a single choice; dock with a way out and the one primary | approved 2026-11-24: composition, interaction |
| P2 | Stepped form | Finish a task with a real sequence | Title; progress steps; one step's fields; dock with back and continue | illustrative |
| P3 | Long form | Enter much related information | Sections by heading and space; tiles for a choice of few; repeatable item group with an add action under it; dock | illustrative |
| P4 | Form with summary | Check the result while filling in | Form; summary of label and value, total or preview in the Inspector; primary beside the summary | illustrative |
| P5 | Filtered list and Inspector | Find one record and read it | Title; search and filters; result count; table or rows; selected record in the Inspector; on narrow, two-line rows that open the record | approved 2026-11-24: composition, interaction |
| P6 | Work queue | Act on records one by one or in bulk | Status filter with counts; rows with a secondary action; selection bar; confirmation | illustrative |
| P7 | Record detail | Read one record and act on it | Identity and status; warning with its action; figure band; tabs or sections; history as vertical progress | illustrative |
| P8 | Overview of figures | See where things stand | Title naming the scope; the main figure; figure band; short collections, each ending in its own way in | approved 2026-11-24: composition, interaction |
| P9 | Settings | Change how something works | List of areas; one area's rows, choices and switches in the detail | illustrative |
| P10 | Screen states | Understand loading, nothing or failure | Skeleton in the final layout; empty state under live filters; error with one way back | illustrative |
| P11 | Dialog | Decide or edit without leaving | Fixed heading; scrolling content; fixed actions | illustrative |
| P12 | Browsing | Choose among many things worth seeing | Search and categories; filters; sections with a way to the full set; tiles | illustrative |
| P13 | Campaign Page sections | Understand an offer | Proposition with image and action; short benefits; questions and answers; terms | approved 2026-11-24: composition, interaction |

## Approvals

P1, P5 and P8: the owner answered "อนุมัติทั้งหมด" on 2026-11-24 to composition and interaction, from drafts shown at 375 and 1440 in the light theme with their states. Not approved: visual values, copy, and what the drafts did not show (dark mode, widths from 500 to 987, a keyboard-only pass, the toast). The drafts stay uncommitted in `.local/` as ADR 0017 asks, so the source revision is the content hash `5bbf707aef97` (SHA-256 of `src/patterns/*.ts*`, concatenated in name order). The approval does not open ADR 0015's gate.

P13: the owner answered "อนุมัติทั้งหมด" on 2026-11-24 to composition and interaction, from a draft on the Club theme shown at 375 and 1440 with an open answer, the missing acceptance and the booked state. Not approved: visual values, the Brand Pattern picks, copy and sample facts, and what the draft did not show (the other Immersive Themes, widths between 375 and 1440, a keyboard-only pass). The source revision is `c405672ad559` (SHA-256 of `src/campaign/P13Campaign.tsx` then `public/p13-*.svg`, concatenated in name order). Its hero photo is a marked slot.

Seen in the P13 draft, unresolved: at 1440 the Pattern beside the questions is taller than their list; from 500 to 987 the hero's Pattern fills the column, so the hero passes one screen. P13 ships as [campaign sections](./examples/campaign-sections.md), which neon-create links and which caps that Pattern at 480px; the hero still passes one screen at 768 (1056px).

Seen in the P1, P5 and P8 drafts, unresolved and the shell's own:

- P1: `SimpleLayout` leaves an empty 64px bar over the title, and its sidebar is 360px where its siblings' is 240px.
- P5: on narrow, the shell's details button repeats what a tap on a row does.
- P8: on narrow, the shell's details button leaves the primary room for a short label only.

## Second drafts

The owner said on 2026-11-24 that the first drafts did not show the references' influence, and that what to take is the group of components inside a Neon layout (ADR 0017). P5 and P8 were drawn again on that reading, and the owner answered "ตรง ทำต่อ" to that direction: the other functional patterns were drawn the same way. All are `illustrative`: the answer approves no visual value, and the approvals above hold for the first drafts only.

| Code | Layout, unchanged | Groups inside the panes |
| --- | --- | --- |
| P5 with P7 | Detailed | List: tabs with counts; menu filters and search in one row; result count; rows grouped by month, a tag only on an exception. Detail: figure and status; identity with copy; alert with its action; figure band; tabs over the history with its times, the line items that open, the price chart marked at the order, the documents |
| P8 | Content | Main figure, its chart and the range under it, which a pointer or arrow keys read day by day; alert with its action; a verdict as the heading and each criterion under its figure; a share chart whose legend is a list; tabs over a table that becomes two-line rows; action rows with an icon and their state |
| P1 | Simple | Title with the way to save a draft; name field with its optional part behind a small action; rows of icon, label and value that edit in a bottom sheet; tiles for a choice that needs a sentence; split dock, two actions on narrow |
| P2 | Simple | Progress steps first; one heading per step, which takes focus; a choice with what it brings under it; fields in groups; a review whose rows go back to their step |
| P3 | Simple | Numbered sections with one header row each; risk tiles with one disabled and its reason; people that fold to one line with their share, and the sum in the section's header; checkbox groups in columns; files with their progress |
| P4 | Content | Segmented control first; rows with their own change action; amount chips with the figure in the section's header; date tiles; optional settings fold to their current value. Inspector: primary, live facts, total. On narrow the total sits over the primary in the dock |
| P6 | Simple | Alert with its action; status with counts and search in one row, which stays in view; rows with the time left or progress and one secondary action; select mode with its own bar and a confirmation |
| P9 | Detailed | List rows state the current value. Detail: tiles for the mode; a radio shows its inline fields when chosen; domain field with removable values; switches that save at once |
| P10 | Simple | Banner with a chart, tiles, rows, questions; the skeleton in the same geometry; a filtered empty state with live filters and no action; first use and error with one secondary action |
| P11 | Simple | Sheets with a fixed title and actions: long text, steps, and a figure band over a checkbox tree whose count is in the primary |
| P12 | Content | Segmented control, category row, shelves with arrows that reach their ends, tiles with a line chart and a follow toggle, an editorial block beside its links. Inspector: sort, switches, risk chips; any of them turns the shelves into one grid |

Left for Core and Neon: Core specifies charts ([line chart](../../core/components/line-chart.md), [donut](../../core/components/donut.md)), and the drafts follow them. Their `Chart/chart-*` values are only in those docs: `core/theme.json` holds the domain sets alone, and `theme/css/core-roles.json` has no chart role, so Neon's theme has none and the drafts resolve the values by hand. The share chart mixes two domain sets, because no set covers every kind held. An earlier note here that there were no chart tokens was wrong.

Checked in the drafts: 375, 768, 988 and 1440 in light and 375 and 1440 in dark, with one h1, nothing cut off and no console error; validation, focus on a step, a sheet's return of focus, undo and the skeleton's geometry at 375 and 1440. Not checked: a screen reader, a whole pass by keyboard alone, widths between those, 200% text.

Seen in the drafts, the shell's own: in dark the wordmark stays navy on black; list rows take a fill in dark that light has not; `ContentLayout` and `AppShell` centre the menu where `SimpleLayout` puts it at the top; on narrow `SimpleLayout`'s tab bar is navy and the others' light.

The sheet takes focus on its handle, whose focus ring covers part of a title at its centre; this is the registry's `sheet`.

The second drafts' source revision is `f01aa7f3b623` (SHA-256 of `src/v2/*`, then `src/patterns/nav.ts*` and `src/App.tsx`, concatenated in name order).

P13's references are a service's introduction inside an app, not a Campaign Page. It stands as a Campaign Page example on the owner's approval, and not as evidence of what these references lend.

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
