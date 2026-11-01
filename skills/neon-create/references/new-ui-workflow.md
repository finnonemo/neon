# Feature implementation

Read for complex feature states, mock figures or comparison tables on functional screens, or integration into an existing app. New-project mechanics live in [scaffold](scaffold.md); theme changes live in [CDS integration](cds-integration.md).

## Existing app integration

Find the relevant screen/component, service contract and route. Reuse existing shell, providers, state and authentication. Inspect only missing evidence. A new-screen request does not authorize scaffolding over the app or replacing its layout system. Follow explicit composition scope for existing UI.

Use real CDS components where available; inspect installed exports/types rather than guessing component names or props. Choose [task-based composition](../../INSTRUCTION.md#task-based-choices). Existing wrapper components can preserve local conventions and behavior.

## States and services

Build populated content and real interactions. For lists, handle loading, empty/no-match and error/retry where relevant; for submissions, handle validation, pending/duplicate prevention, failure and completion. Retain entered data after recoverable errors. Use the existing data service and validation contract; do not invent a password rule or backend endpoint because it seems customary.

Mock data before a real backend exists does not make the app a demo. Report mocked behavior and missing integration in the delivery summary; label it in the UI only when the request asks for a demo, prototype or mock-labeled build. A code comment alone does not prevent the user believing a simulated approval/login persisted, so route confirmations through the service contract. Do not fabricate authentication or server persistence.

## Sample data and figures

Read for Back Office and Product Feature screens that show money, units, fees, counts or dates from mock data. Functional layouts only: this does not authorize sample yields, NAVs or returns on a Campaign Page, where invented performance figures remain forbidden.

1. **One source.** Keep mock records in one data module that the UI renders from. Compute totals, counts and KPIs from its rows, never type them separately. Assert relations that must hold (parts summing to a total, a count matching its rows) in development, so a mismatch shows as a console error.
2. **Formatting.** Use the app's existing formatter, else `Intl.NumberFormat`/`Intl.DateTimeFormat` for the app's locale. Fix the decimals per metric. A nonzero change carries its sign. Ranges use an en dash (`1,000–5,000`). Abbreviate large amounts only where the app already does. Do not impose a currency or calendar the app or request does not use.
3. **Alignment.** Right-align numeric columns and their headers, with tabular numerals, and give every value in a column the same decimals so the points align. In CDS 9.26.1, `TableCell` takes `justifyContent="flex-end"` and `Text` takes `tabularNumbers`; confirm both in the installed types. Whether the loaded font draws tabular figures is a rendered check.
4. **Zero and missing.** A real zero prints as `0`. A missing value is a muted dash with an accessible name. A zero change is unsigned and neutral.
5. **Change color.** Each metric declares whether up is good in the data module. Color a change with `fgPositive` or `fgNegative` from that direction, never because it rose, and pair it with a sign or icon. Measure each change color's contrast against its actual surface in each mode; a pair below 4.5:1 (3:1 for large text) is a mapping mismatch to report, not to recolor. When the good direction is unclear (a fee is revenue to Finnomena and cost to a customer), choose one and state it in the Handoff Summary.
6. **Plausible samples.** Use plausible but fictitious fund, team and requester names in the app's language, not placeholders such as Acme or John Doe, and not a real fund paired with invented figures. The Handoff Summary lists the figures shown as headlines (KPIs, totals) and names the data module that holds every row value.

## Responsive task access

Make the task reachable in narrow and wide layouts. A detail panel can move behind a selection with a clear return path; hiding it must not remove essential actions. Use actual destinations for navigation, and preserve the app's reading and keyboard order. Do not add external ecosystem links unless requested.

### One question, first screen

For a functional screen, put its answer and its main action where the employee looks first:

1. Before building, write the screen's main question and its most frequent action, one line each.
2. The list or table that answers the question is the most prominent element. At 1440×900 it shows its heading and at least three complete rows without scrolling. Cap overview lists and link to the full list.
3. When the list already carries the totals (a footer row, a column per category, the change beside each value), add no separate summary band above it; a headline total can sit in its title row. A breakdown the request names, such as per fee type, is carried when the list shows it as columns or groups with totals. When the request asks for KPI cards or a summary at the top, keep it, compact enough that the list's heading and three complete rows still show. Otherwise summaries (KPIs, breakdowns, charts) share one compact band above the list or sit beside it, and still leave the list's heading and three complete rows visible.
4. Without a browser, budget the height from the layout's known sizes before building, and report the rendered check as unverified.
5. The most frequent action is visible where its answer appears: in the title row, or on the row that needs it. It is never only inside a menu. On a row it is a secondary or tertiary action, so the screen keeps one primary action ([functional patterns](../../neon-audit/references/functional-patterns.md#actions)).

In existing UI with `composition: 'preserve'`, report a miss as an observation; it does not license rearranging the screen.

### Tables on narrow screens

When a comparison table's container is narrower than about 640px, show each record as one of a list of two-line rows instead of a table that scrolls sideways:

1. Line 1 holds the record's identity and its key figure, the value the screen's main question asks about, right-aligned.
2. Line 2 holds every other field, each with its label inline (`Fee 1.25%`) because the column headers are gone, wrapping onto more lines when needed. Fields move to line 2; they are never dropped or truncated. In CDS 9.26.1, `ListCell` takes `title`, `detail` and `description`, and cuts `description` to one line unless `multiline` is set; confirm both in the installed types.
3. The row's action and its way into the detail stay on the row. A total row stays as a final row.
4. Filters fold into one control row or a sheet: a single row of controls above the list, or one button that opens them in a sheet and shows the active filters as text.

At 375px, check that every field shown at 1440px is still on screen. In existing UI with `composition: 'preserve'`, a sideways-scrolling table is an observation, not a license to rebuild it.

## Verification

Use the [shared checklist](../../neon-redesign/references/verification.md#shared-checklist) and [creation additions](../../neon-redesign/references/verification.md#creation-additions). For explicitly adapted existing composition, apply the composition additions too. A copied template or a source-only inspection is not completion.
