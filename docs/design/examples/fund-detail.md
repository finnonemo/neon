# Fund detail

```yaml
status: illustrative
source_revision: null  # set to the commit the owner reviews
reviewer: null
reviewed_on: null
approved_properties: []
viewports: [375, 1440]
```

## Task

Pattern P14 of the [pattern register](../pattern-register.md): see how one fund is doing, then act on it. It answers where the figure, the chart, its range and the actions go on an item page.

## Source

- Screen: [`examples/fund-detail/FundDetail.tsx`](../../../examples/fund-detail/FundDetail.tsx), with its chart in [`LineChart.tsx`](../../../examples/fund-detail/LineChart.tsx), built from Neon registry items (`button`, `segmented-control`, `list-row`) in `ContentLayout`. All content is synthetic. The browser suite copies this folder into its Neon base app.
- Route: `/?example=fund-detail` in the browser suite's Neon base app.
- Checks: `fund-detail example passes axe in <mode>, and its chart reads by keyboard` in [`evals/templates/neon-a11y.spec.mjs`](../../../evals/templates/neon-a11y.spec.mjs).

## Why each part sits where it does

In the shipped [README](../../../examples/fund-detail/README.md).

## Verified

- Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark.
- From the keyboard, Home on the chart rewrites the figure and its label to the range's first day; leaving the chart restores the latest NAV.
- Nothing in the content pane is wider than the pane at 375 and 1440.

Not checked: a screen reader pass, widths between 375 and 1440, 200% text.

## Screenshots

Not kept in the repository. Run the browser suite and open `.local/evals/templates/neon/test-results/` (`fund-detail-<mode>-<width>.png`, the whole page at 2000 tall, and `-reading.png`, the figure while a day is read):

```bash
npm test --prefix evals/templates -- --target neon neon-a11y.spec.mjs --grep fund-detail
```

## Review

Not yet reviewed. Until the owner approves it by property, no skill links it ([ADR 0020](../../adr/0020-approved-functional-patterns-reach-skills-and-examples-before-the-gate.md)).
