# Pane grids

A reviewed example: composition, typography, color mapping and interaction behavior approved on 2026-11-16. It shows the three grids a functional pane uses, in [PaneGrids.tsx](PaneGrids.tsx), for the rules in [grids inside a pane](../../skills/neon-audit/references/functional-patterns.md#grids-inside-a-pane). Use it as a reference for which grid a collection takes, not as a template to copy: its content is synthetic.

## Which grid, and why

| Region | Grid | Why |
| --- | --- | --- |
| Overview figures | A flex row that wraps (`flex flex-wrap`) | Each figure keeps its own width, so a long label never squeezes its neighbour's value. |
| Featured funds | `grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]` | The number of tiles isn't fixed, so the grid wraps by itself at every pane width with no breakpoint. Cards fit because each tile is an item in a browsing collection. |
| Contact details | `@container` on the pane's body, then `@min-[480px]:grid-cols-2` | A fixed number of columns that changes count follows the pane: at a 1440 viewport the form has one column in AppShell's narrow content pane and two in ContentLayout's wide one. |

Nothing here expresses Finnomena beyond the theme: colors, type roles, radius and spacing come from the Neon base. The example is about structure.

## What can vary

The tile minimum (14rem) and the form's threshold (480px) suit these contents. Pick a tile's minimum from its smallest readable content, and a threshold from where two fields still have room for their labels. The kind of grid for each case doesn't vary.

## Verified

At 320, 375, 500, 768, 987, 988, 1080, 1272, 1440 and 1920, in AppShell and ContentLayout:

- No pane scroll container is wider than its pane.
- The form shows two columns exactly when the pane's content box is at least 480px wide.
- No tile is narrower than 14rem unless the pane itself is.

Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark.
