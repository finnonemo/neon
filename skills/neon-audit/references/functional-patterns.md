# Functional screen patterns

Read when building a functional screen (Back Office or Product Feature) with lists, overlays, mobile actions or empty states, or when `composition: 'adapt'` reorganizes one. These rules shape new UI and adapted composition only. Under `composition: 'preserve'` or colors-only scope, report a miss as an observation; it does not license restructuring. Campaign Pages keep their own composition and motion.

The rules hold in any framework and name no component library. Where Core holds a component's rule, they name the Core doc instead of restating it. Read [Core rules](core-rules.md) before opening one: it says which part of a doc holds the rule, and to open only the doc of a component the task uses. Build them from the app's own components. They do not authorize adopting a component library in a CSS-only restyle. An app already on CDS finds the same patterns in CDS names in [CDS integration](../../neon-create/references/cds-integration.md#functional-patterns).

## Actions

- Which action is primary, secondary or tertiary, how many primaries a screen, panel, sheet or dialog holds, and the destructive flow are Core's [hierarchy rules](../../../core/hierarchy.md): rules 1–6, and the owner's call H2 for the destructive flow. Row actions are secondary or tertiary, even when they are the most frequent action.
- On narrow tiers, a form, confirmation or other focused flow puts its actions in a dock fixed to the bottom of the viewport. Their order, when they stack or sit side by side and how many the dock holds are Core's [Button dock](../../../core/components/button-dock.md#usage), Usage and Hierarchy. When the shell shows a bottom tab bar, the dock sits above it, or the flow hides the tab bar while it is open; the two never overlap. Leave room at the end of the content so the dock does not cover the last field.

## Lists before cards

- Use list rows for settings, search results and record or price rows; use cards for browsing a collection where each item has its own media or story. Tables stay the choice for comparing many records across the same attributes.
- One leading-media size per list. A row has a title, up to two supporting lines, and a trailing column for the value or status. Show a chevron only when the row opens a deeper level.
- An action on one record (buy more, open, retry) sits inside that record's row, in its trailing column, never as a button beside the row or in a column of its own.
- A list spans the full width of the pane that holds it: no max width narrower than the pane, and no empty column beside it.
- Separate rows with inset dividers or spacing; no divider after the last row. Do not put a card around each row.
- Data-dense screens use condensed rows, compact controls and tables rather than smaller type or tighter custom spacing.

## Panes

- Beside the sidebar, a screen shows at most two panes: a list and the record selected in it. A deeper level of that record (one document, one order) replaces the detail pane with a back control, or opens in a sheet; it never adds a third column.
- Columns side by side that each scroll on their own are for a board or for records compared in columns, not for drilling down.

## Surfaces, elevation and radius

- Shadows belong only to layers that float above the page: sheet, modal, popover, toast and a dock while content scrolls beneath it. Separate on-page regions with `bgAlternate`, `bgLine` dividers or spacing, not shadows.
- Keep component radii as the app's components ship them, including pill buttons and overlays. On a surface the app draws itself, a card takes a medium radius and items nested inside it a smaller one.

## Overlays

- Which overlay a secondary task opens in, and how that changes from narrow to wide tiers, is Core's choice by what the overlay holds: the "Not for" lines in the Usage of Core's [Sheet](../../../core/components/sheet.md#usage), [Popover](../../../core/components/popover.md#usage) and [Alert](../../../core/components/alert.md#usage). Those are Core's component names, not an app's: on the Neon base the snapshot's index gives each item's Counterpart. Core has no sheet from the side, so new work does not choose one.
- At desktop width a sheet is centred, never a mobile sheet rising from the bottom edge: Core's Sheet Placement centres it at Regular width. On the Neon base, the `sheet` item's bottom side does this itself from the `lg` tier (988px); do not override its placement or choose a left or right side to get a desktop look.
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

Name layouts by the app's breakpoint tiers (`sm`, `md`, `lg`, …), not by pixel values copied from another system.
