# Pane grids

```yaml
status: reviewed
source_revision: e69c1fe  # captured at 42d0f83, the same example, registry and theme files
reviewer: Pawish Gawinseth
reviewed_on: 2026-11-16
approved_properties: [composition, typography, color-mapping, interaction-behavior]
viewports: [320, 375, 500, 768, 987, 988, 1080, 1272, 1440, 1920]
```

## Task

Show the three grids a functional pane uses, inside a real pane at every breakpoint. It answers "which grid for this collection" with evidence for the rules in [grids inside a pane](../../../skills/neon-audit/references/functional-patterns.md#grids-inside-a-pane).

## Source

- Screen: [`evals/templates/fixtures/neon/PaneGrids.tsx`](../../../evals/templates/fixtures/neon/PaneGrids.tsx), built from Neon registry items (`card`, `field`, `input`) and Tailwind only. All content is synthetic.
- Route: `/?layout=app&example=pane-grids` (AppShell, where the content pane keeps a fixed width at desktop) and `/?layout=content&example=pane-grids` (ContentLayout, where the content pane fills the rest), in the browser suite's Neon base app.
- Checks: `pane-grids example follows the pane's width at every breakpoint` in [`evals/templates/layouts.spec.mjs`](../../../evals/templates/layouts.spec.mjs), and `pane-grids example in <layout> passes axe in <mode>` in [`evals/templates/neon-a11y.spec.mjs`](../../../evals/templates/neon-a11y.spec.mjs).

## Why each grid fits

| Region | Grid | Why |
| --- | --- | --- |
| Overview figures | A flex row that wraps (`flex flex-wrap`) | Each figure keeps its own width, so a long label never squeezes its neighbour's value. |
| Featured funds | `grid-cols-[repeat(auto-fill,minmax(14rem,1fr))]` | The number of tiles isn't fixed, so the grid wraps by itself at every pane width with no breakpoint. Cards fit here because each tile is an item in a browsing collection. |
| Contact details | `@container` on the pane's body, then `@min-[480px]:grid-cols-2` | A fixed number of columns that changes count follows the pane: at a 1440 viewport the form has one column in AppShell's narrow content pane and two in ContentLayout's wide one. |

What expresses Finnomena: nothing here beyond the theme. Colours, type roles, radius and spacing come from the Neon base. The example is about structure.

## What can vary

The tile minimum (14rem) and the form's threshold (480px) suit these contents. Pick a tile's minimum from its smallest readable content, and a threshold from where two fields still have room for their labels. The kind of grid for each case doesn't vary.

## Verified

- No pane scroll container is wider than its pane at any of the viewports above, in both layouts (`widePanes`).
- The form shows two columns exactly when the pane's content box is at least 480px wide.
- No tile is narrower than 14rem unless the pane itself is.
- Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark, in both layouts.

## Screenshots

Not kept in the repository. Run the browser suite and open the screenshots it writes to `.local/evals/templates/neon/test-results/` (`pane-grids-<layout>-<mode>-375.png` and `-1440.png`, `<layout>` `app` or `content`, `<mode>` `light` or `dark`):

```bash
npm test --prefix evals/templates -- --target neon neon-a11y.spec.mjs --grep pane-grids
```

## Review

Approved whole on 2026-11-16 ("Approve all"), from the eight captures above: AppShell and ContentLayout, light and dark, at 375 and 1440. The captures are still, so interaction behavior was approved as the registry items (`card`, `field`, `input`) ship it, which the Neon browser suite's focus and axe tests check, not from anything this example adds.

## Unresolved

- No skill links it yet. Its source is a browser-suite fixture, not a packaged resource, and the [example library](../example-library.md#use-examples-in-skills) links an example only once its packaging is settled.
