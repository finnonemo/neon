# Functional screen patterns

Read when building a functional screen (Back Office or Product Feature) with lists, overlays, mobile actions or empty states, or when `composition: 'adapt'` reorganizes one. These rules shape new UI and adapted composition only. Under `composition: 'preserve'` or colors-only scope, report a miss as an observation; it does not license restructuring. Campaign Pages keep their own composition and motion.

The principles hold in any framework. The **With CDS** lines name the CDS implementation for React/CDS work; they do not authorize adopting CDS in a CSS-only restyle. Confirm every prop in the installed types; the names below are from `@coinbase/cds-web` 9.26.1.

## Actions

- One primary action per screen, or per panel in a multi-panel tool. Other actions are secondary; dismissive actions (cancel, skip) are tertiary. Row actions are secondary or tertiary, even when they are the most frequent action.
- A destructive flow starts from a secondary negative action; the primary negative action appears only inside its confirmation.
- On narrow tiers, a form, confirmation or other focused flow puts its primary action in a dock fixed to the bottom of the viewport. Stack its buttons full width, primary nearest the bottom edge, so the dock never holds side-by-side buttons at tier `sm`. When the shell shows a bottom tab bar, the dock sits above it, or the flow hides the tab bar while it is open; the two never overlap. Leave room at the end of the content so the dock does not cover the last field.
- **With CDS:** `Button` takes `variant` (`primary`, `secondary`, `tertiary`, `negative`) and `compact`.

## Lists before cards

- Use list rows for settings, search results and record or price rows; use cards for browsing a collection where each item has its own media or story. Tables stay the choice for comparing many records across the same attributes.
- One leading-media size per list. A row has a title, up to two supporting lines, and a trailing column for the value or status. Show a chevron only when the row opens a deeper level.
- Separate rows with inset dividers or spacing; no divider after the last row. Do not put a card around each row.
- Data-dense screens use condensed rows, compact controls and tables rather than smaller type or tighter custom spacing.
- **With CDS:** `ListCell` takes `title`, `description`, `media`, `detail` and `subdetail` for the trailing value, `end` for a trailing control, `accessory="arrow"` for the chevron and `spacingVariant="condensed"` (`compact` is deprecated). `Divider` separates groups.

## Surfaces, elevation and radius

- Shadows belong only to layers that float above the page: tray, modal, popover, toast and a dock while content scrolls beneath it. Separate on-page regions with `bgAlternate`, `bgLine` dividers or spacing, not shadows.
- Radius follows footprint: overlays and sheets take the largest shipped radius, cards a medium one, items nested inside a card a smaller one. Keep CDS component radii as shipped, including pill buttons.

## Overlays

- On narrow tiers, secondary tasks (filters, a record's actions, a short form) open in a sheet from the bottom edge; on wider tiers the same content opens as a side panel or dialog. Give it a title and a visible close control, and return focus to the trigger on close.
- **With CDS:** `Tray` takes `pin` (`bottom`, `left`, `right`, …), `title` and `footer`; pick `pin` from the breakpoint tier.

## Typography in use

- One h1 per screen. Display roles belong to Campaign Pages, not functional screens.
- Figures in lists and tables use tabular numerals, as the [sample figures](../../neon-create/references/new-ui-workflow.md#sample-data-and-figures) rules require.

## Empty and loading states

- An empty state has a heading, one short sentence on why it is empty or what to do, an optional illustration, and at most one action. Center it in the region it replaces, with a capped text width.
- Loading shows placeholders shaped like the final layout. When data is already available, render the final content directly instead of flashing a placeholder.
- **With CDS:** `Fallback` draws skeleton placeholders; pictograms come at 48×48 or 64×64.

## Icons

- One icon size per context: a larger size for navigation, a smaller one for inline affordances. Use the filled form only for the selected item in navigation.
- **With CDS:** `Icon` takes `size` (`xs`, `s`, `m`, `l`; default `m`) and `active` for the selected navigation icon.

## Motion

- Motion explains a change of state or place; it does not decorate. Controls respond quickly, drawers and dialogs a little slower, page transitions slowest.
- No animation loops longer than 5 seconds and no auto-advancing carousels. Under reduced motion, replace movement with a short crossfade or no transition.
- CDS components animate themselves; reuse that motion. For custom transitions, CDS 9.26.1 uses 100–150ms for controls, 200–300ms for drawers and modals and 350–500ms for page transitions. Do not add motion tokens to the theme.

## Breakpoints

Name layouts by the app's breakpoint tiers (`sm`, `md`, `lg`, …, from `useBreakpointTier` in the starter), not by pixel values copied from another system.
