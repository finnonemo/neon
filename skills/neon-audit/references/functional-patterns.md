# Functional screen patterns

Read when building a functional screen (Back Office or Product Feature) with lists, overlays, mobile actions or empty states, or when `composition: 'adapt'` reorganizes one. These rules shape new UI and adapted composition only. Under `composition: 'preserve'` or colors-only scope, report a miss as an observation; it does not license restructuring. Campaign Pages keep their own composition and motion.

The rules hold in any framework and name no component library. Where Core holds a component's rule, they name the Core doc instead of restating it. Read [Core rules](core-rules.md) before opening one: it says which part of a doc holds the rule, and to open only the doc of a component the task uses. Build them from the app's own components. They do not authorize adopting a component library in a CSS-only restyle.

## Actions

- Which action is primary, secondary or tertiary, how many primaries a screen, panel, sheet or dialog holds, and the destructive flow are Core's [hierarchy rules](../../../core/hierarchy.md): rules 1–6, and the owner's call H2 for the destructive flow. Row actions are secondary or tertiary, even when they are the most frequent action.
- At narrow breakpoints, a form, confirmation or other focused flow puts its actions in a dock fixed to the bottom of the viewport. Their order, when they stack or sit side by side and how many the dock holds are Core's [Button dock](../../../core/components/button-dock.md#usage), Usage and Hierarchy. When the shell shows a bottom tab bar, the dock sits above it, or the flow hides the tab bar while it is open; the two never overlap. Leave room at the end of the content so the dock does not cover the last field.

## Order form

A form that buys or sells an amount runs in this order: the side (buy or sell) first, then the account the money comes from or goes to with what is available, then the amount (with a unit switch where selling can be in baht or units, its minimum as the field's description, and quick amounts as secondary buttons that fill it). The summary and the total sit with the one primary, which is named by the side: in the Inspector on wide, and as the total over the primary in the dock on narrow. The primary stays enabled; pressing it with a problem puts the error on the field and focus in it, and too little money shows the way to add money beside the error while the summary stays filled in. The reviewed [order form](../../../examples/order-form/README.md) example shows it.

## Money move

Moving money (topping up, withdrawing, switching) runs as steps in one sheet, one choice per step. A single choice advances on a tap, with no Continue button; from the second step a back control sits before the title. Put the recommended option first and mark it, put the figure that decides the choice (how fast, what it costs) on every row, and explain the choice at the top of the step when it needs explaining. Before the step where a mistake costs money, show a warning with the way to avoid it and one acknowledgement. When there is nothing to move, the sheet says why and offers the fix as its primary. The reviewed [money move](../../../examples/money-move/README.md) example shows it.

## Lists before cards

- Use list rows for settings, search results and record or price rows; use cards for browsing a collection where each item has its own media or story. Tables stay the choice for comparing many records across the same attributes.
- One leading-media size per list. A row has a title, up to two supporting lines, and a trailing column for the value or status. Show a chevron only when the row opens a deeper level.
- An action on one record (buy more, open, retry) sits inside that record's row, in its trailing column, never as a button beside the row or in a column of its own. On the Neon base, pass it as `ListRow`'s `action`: the row's own button cannot hold a second button, and `action` keeps it inside the row's fill.
- The selected row, the record a detail pane shows, is marked by its fill alone (`ListRow`'s `selected`, Layer/layer-selected-01) and `aria-current`: no check icon at its end. A check belongs to picking among options, which is a Radio or Checkbox.
- A list spans the full width of the pane that holds it: no max width narrower than the pane, and no empty column beside it.
- Separate rows with inset dividers or spacing; no divider after the last row. Do not put a card around each row.
- Data-dense screens use condensed rows, compact controls and tables rather than smaller type or tighter custom spacing.
- A row for a person (a customer, an advisor, a member of staff) leads with Core's [Avatar](../../../core/components/avatar.md): their photo, else a Block avatar. Draw a set of twelve with the Block engine, as [neon-block](../../neon-block/SKILL.md#tools) has it: `layout` `pattern` at a square size (`width` and `height` 96), `density` `coarse` (the 4×4 Grid), seeds `avatar-1` to `avatar-12` and one Colourway from the primary group. Core's Avatar is round and its circle cuts the Pattern's corners: that is accepted, so place the square SVG in the Avatar as a photo and never inset or reshape it. Ship the set's SVGs as the app's assets and give each person the one a stable hash of their id picks, so a person keeps theirs. Never hand-draw one, or show initials where a Block avatar fits.
- A record's history (what happened to a request, a case or a document) is a vertical progress step: one step per event in the order it happened, each a marker on a line that joins them, with what happened, who did it and when. The latest step is marked as current; a step that carries a status takes its status color on the marker only. Core has no Stepper yet: build it from the app's tokens, as a list (`<ol>`), never as a table or a card per event.

## Panes

- Beside the sidebar, a screen shows at most two panes: a list and the record selected in it. A deeper level of that record (one document, one order) replaces the detail pane with a back control, or opens in a sheet; it never adds a third column.
- A back control is an icon-only button, the arrow alone, at every breakpoint and on web and app alike, with where it goes as its accessible name (`aria-label`). Never an arrow with a visible label.
- Columns side by side that each scroll on their own are for a board or for records compared in columns, not for drilling down.

## Grids inside a pane

A pane's width is what the shell leaves after the sidebar and inspector, so it changes at other widths than the viewport, and the shell clips a pane that overflows rather than scrolling the page.

- A collection of tiles whose count is not fixed takes a grid that wraps by itself: `repeat(auto-fill, minmax(<smallest useful tile>, 1fr))`. It needs no breakpoint.
- When a fixed number of equal columns must change count, key the change to the pane's width with a container query on the pane, at a width stated in pixels, not to a viewport breakpoint. Equal `1fr` columns never wrap, so a count that suits a wide pane overflows a narrow one. In Tailwind that is `@container` on the pane's body and `@min-[<width>]:` on the grid, never a viewport prefix (`sm:`, `md:`) inside a pane: Tailwind's named sizes, for viewports and for containers alike, are other widths than the app's breakpoints.
- Never size a track to its content (`max-content`) around text: one long label then sets the width of the whole grid.
- Nothing inside a pane is wider than the pane at any breakpoint. Check the pane's own scroll container, not the document, which the shell keeps at the viewport's width.
- The reviewed [pane grids](../../../examples/pane-grids/README.md) example shows all three: a wrapping row of figures, an `auto-fill` grid of tiles and a form whose columns follow the pane.

## Surfaces, elevation and radius

- Shadows belong only to layers that float above the page: sheet, modal, popover, toast and a dock while content scrolls beneath it. Separate on-page regions with `bgAlternate`, `bgLine` dividers or spacing, not shadows.
- Keep component radii as the app's components ship them, including pill buttons and overlays. On a surface the app draws itself, a card takes a medium radius and items nested inside it a smaller one.

## Overlays

- Which overlay a secondary task opens in, and how that changes from narrow to wide breakpoints, is Core's choice by what the overlay holds: the "Not for" lines in the Usage of Core's [Sheet](../../../core/components/sheet.md#usage), [Popover](../../../core/components/popover.md#usage) and [Alert](../../../core/components/alert.md#usage). Those are Core's component names, not an app's: on the Neon base the snapshot's index gives each item's Counterpart. Core has no sheet from the side, so new work does not choose one.
- At desktop width a sheet is centred, never a mobile sheet rising from the bottom edge: Core's Sheet Placement centres it at Regular width. On the Neon base, the `sheet` item's bottom side does this itself from the `lg` breakpoint (988px); do not override its placement or choose a left or right side to get a desktop look.
- A sheet or dialog has a title and a visible close control. Every overlay returns focus to its trigger on close.

## Typography in use

- One h1 per screen. Display roles belong to Campaign Pages, not functional screens.
- Figures in lists and tables use tabular numerals, as the [sample figures](../../neon-create/references/new-ui-workflow.md#sample-data-and-figures) rules require.

## Empty and loading states

- What an empty state says, where it sits and which button it takes are Core's [Empty state](../../../core/components/empty-state.md#usage), Usage and Hierarchy.
- Loading shows placeholders shaped like the final layout. When data is already available, render the final content directly instead of flashing a placeholder.

## Icons

- One icon size per context: a larger size for navigation, a smaller one for inline affordances. Use the filled form only for the selected item in navigation.

## Motion

- Motion explains a change of state or place; it does not decorate. Controls respond quickly, drawers and dialogs a little slower, page transitions slowest. Reuse the motion the app's components already have, and do not add motion tokens to the theme.
- No animation loops longer than 5 seconds and no auto-advancing carousels. Under reduced motion, replace movement with a short crossfade or no transition.

## Breakpoints

Name layouts by the app's breakpoints (`sm`, `md`, `lg`, …), not by pixel values copied from another system. A layout's own variants follow the app's breakpoints; inside a pane, follow [grids inside a pane](#grids-inside-a-pane).
