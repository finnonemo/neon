# Fund detail

An example of pattern P14, an item page with a live chart: one fund's page, in [FundDetail.tsx](FundDetail.tsx), for the Item page row of [page anatomy](../../skills/neon-audit/references/page-anatomy.md#page-types) and its [figure and chart](../../skills/neon-audit/references/page-anatomy.md#the-figure-and-its-chart). Use it as a reference for where things go on a fund, stock or portfolio page, not as a template: its content is synthetic.

## Where each part goes, and why

| Region | Where | Why |
| --- | --- | --- |
| Back and the fund's code | The content pane's header | The page is reached from a list. |
| Name and follow | First line of content | Following is about this item, so it sits with its name; the header keeps room for the code and, on narrow, the primary. |
| NAV and its change | First in content, the largest text | The page answers "how is it doing" before anything else. |
| The chart | Straight under the figure, full pane width | It explains the figure. No value axis: the figure is the read-out. |
| Reading a day | Pointer or keyboard on the chart (arrows, Home, End, Page keys) | The figure above shows that day's NAV and its change from the range's first day, and its label names the day. Leaving the chart restores the latest NAV. No floating tooltip. |
| The range | A segmented control under the chart | It changes what the chart and the change show, so it sits with the chart, not with the figure. |
| About, facts, similar funds, disclaimer | Sections under the chart, split by hairlines | Facts are label over value in a grid (two columns, three once the pane is 560 wide), not tinted tiles. Similar funds preview three rows and end in one full-width secondary action. |
| Buy | The Inspector's one primary, with sell and monthly investing as rows under it | Content answers; the Inspector acts. On narrow the Inspector is a separate view, so the primary also sits in the title row. |

## What can vary

The range values, the facts and the sections under the chart follow the item: a stock page might show a day's range and volume instead of fees. The order (identity, figure, chart, range, then the rest) and the Inspector's role don't vary.

The chart's colors are resolved by hand in [chart.css](chart.css): Neon's theme has no chart role yet, so they are not an approved color mapping.

## Verified

Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark. From the keyboard, Home on the chart rewrites the figure and its label to the range's first day, and leaving the chart restores the latest NAV. Nothing in the content pane is wider than the pane. Composition and interaction approved by the owner on 2026-11-28; typography and color mapping are not.
