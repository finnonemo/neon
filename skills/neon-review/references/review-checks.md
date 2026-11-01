# Review checks by evidence and scope

Select checks for the employee's request; this is not a requirement to review every dimension on every task.

## Evidence limits

| Evidence | Supported conclusions | Still requires other evidence |
| --- | --- | --- |
| Screenshot | Visible clipping, hierarchy, labels, captured state and apparent color use | Keyboard behavior, semantic names, other viewports, exact font loading, unmeasured contrast |
| Source | Verified declarations, event wiring, semantic markup, token references | Computed cascade, actual focus path, successful interactions, rendered dimensions |
| Live UI/DOM | Observed layout, computed styles, accessible names, tested focus/navigation states | Unvisited routes, unavailable states, backend correctness, full accessibility conformance |
| Supplied test results | What that specific run checked | Current behavior after later changes; checks outside the run |

Describe evidence as supplied versus independently observed. If only source is available, identify conditional risks as such instead of claiming a visible failure. Separate hypotheses needing reproduction from confirmed findings.

## Brand consistency

Use the current design reference, not remembered values. Inspect the semantic role, not just a matching hex string: error/positive states and chart categories are not interchangeable decorative colors. Respect explicit colors-only scope and existing intentional structural dimensions. When a campaign page declares a reference design and Brand Intensity, judge it against that level and the Brand Floor in the design contract; reference neutrals at Reference-led are intended, not off-brand. A CDS dependency or raw pixel value is not itself a review finding.

For typography reviews, distinguish a declared font from a loaded font. Check computed styles and font resources when available; inspect Thai and Latin glyphs, long labels, numeric alignment, and wrapping. Do not label a missing font from screenshot appearance alone.

For color mapping disagreements, identify the documented rule and actual mapping. If the design reference and token mapping conflict, report an unresolved reference conflict rather than deciding an authoritative replacement without evidence.

## Functional screen habits

Generated Back Office and Product Feature screens repeat a few habits. On such a screen, name the habit in the finding, cite the visible evidence and give its Neon alternative as the fix. Names are CDS 9.26.1; confirm them in the installed types.

| Habit | Neon alternative |
| --- | --- |
| KPI tiles, each with an icon on top and its own tinted fill | One KPI container (composition): the figures as labeled `Text` in one compact band, or each figure in the title row of the list or `Card` it summarizes, per [one question, first screen](../../neon-create/references/new-ui-workflow.md#one-question-first-screen) |
| A chart recolored per bar or point, or categories that change color between charts | One hue per series question: a single series keeps one `color`; several series keep a stable `id`, `label` and `color` per category across charts and show a `legend` |
| Hand-rolled zebra rows or uppercase, letter-spaced column headers | CDS `Table` defaults: `variant` unset or `"ruled"`, `compact` for density, `TableHeader` `sticky` on long lists, header labels in the data's own case |
| Saturated custom status chips, or color alone marking a status | A `Tag` with `emphasis="low"` whose text names the status, its `colorScheme` chosen by meaning: `green` success, `yellow` warning, `red` error, `blue` information, `gray` neutral |
| Pagination under an overview list | Composition: cap the overview at a few rows with a "View all" `Link` in its title row; `Pagination` belongs on the full list |
| A greeting such as "Welcome back 👋", or emoji in headings | Composition: the page title names the task and its scope, such as "Fund fees, October 2026"; no greeting line or emoji |
| Figures centered or left-aligned in proportional digits | `TableCell` `justifyContent="flex-end"` and `Text` `tabularNumbers`, per the [sample data rules](../../neon-create/references/new-ui-workflow.md#sample-data-and-figures) |
| Cards nested in cards, or a gradient or heavy shadow behind every block | Composition: one container per group of related content; whitespace and a `Divider` set the hierarchy |

Navy structure and primary actions, and indigo focus, selection and links, are the contract's [color roles](../../INSTRUCTION.md#color-roles), not habits. Habits are findings only on functional screens; immersive pages follow their own composition. Under colors-only scope only the chart and status rows apply. Under `composition: 'preserve'` the composition rows are observations for the owner. Review-only work suggests these fixes and edits nothing.

## Responsive behavior

Use provided viewport requirements. Otherwise sample a narrow and wide viewport (375px and 1440px are useful starting points), then inspect relevant transitions if the app changes panes/navigation. Record actual widths, not a claim that all breakpoints were covered. Check horizontal overflow, clipped Thai labels, sticky elements obscuring controls, and access to collapsed regions.

Single-width screenshots cannot establish responsive behavior. Inspect existing/specified theme modes; do not count absent dark mode as a defect unless required by the task.

## Accessibility and interactions

Where runtime evidence permits, check visible keyboard focus, logical order, accessible names for icon-only controls, label/error association, dialog focus/escape/return behavior, and access to the main task without a pointer. Measure foreground/background contrast with a suitable tool and actual colors before quoting a ratio. These checks do not constitute a comprehensive accessibility certification.

On a functional screen, check that the first screen answers the employee's main question. At 1440×900, or the viewport the employee names, the list or table answering it should be the most prominent and show its heading and at least three complete rows without scrolling, summaries above it should not repeat totals the list already carries or push its rows below the fold (a summary the employee asked for is not a finding, unless it pushes those rows below the fold), and the most frequent action should be visible in the title row or on its row, not only inside a menu. Report a miss as a usability finding: Medium by default, High only when the main action cannot be found. Its evidence names the viewport and what sits above the fold. Source alone, or a screenshot of unknown size, cannot show fold position; record it as a hypothesis instead. Under `composition: 'preserve'` the suggested fix is an observation for the owner, and the review still edits nothing.

Inspect loading, empty, error, disabled, selected, and success states only where relevant and available through safe test data or existing previews. Never trigger a real approval or transaction merely to see a success screen. A missing screenshot of a state does not prove that state is unimplemented.

## Finding example

**High — Header menu trigger (keyboard test, 375px/light).** The menu trigger cannot be reached by Tab, preventing keyboard users from opening primary navigation. Evidence: observed tab sequence skips the trigger; verified source uses a clickable div without keyboard handling. Fix: use a semantic button with an accessible name and retain the existing open handler. Recheck: Tab reaches it; Enter/Space opens the menu; focus returns when closed.

This is an illustrative format, not a finding about the reviewed app. Use verified source paths/lines or screenshot/DOM locations for actual reports; omit unavailable coordinates rather than fabricate them.
