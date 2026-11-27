# Money move

```yaml
status: partially-reviewed
source_revision: 8d20398
reviewer: Pawish Gawinseth
reviewed_on: 2026-11-28
approved_properties: [composition, interaction-behavior]
viewports: [375, 1440]
```

## Task

Pattern P16 of the [pattern register](../pattern-register.md): move money as steps inside one sheet.

## Source

- Screen: [`examples/money-move/MoneyMove.tsx`](../../../examples/money-move/MoneyMove.tsx), built from Neon registry items (sheet, button, list-row, checkbox, alert). All content is synthetic. The browser suite copies this folder into its Neon base app.
- Route: `/?example=money-move` in the browser suite's Neon base app.
- Checks: `money-move example passes axe in <mode> at every step` in [`evals/templates/neon-a11y.spec.mjs`](../../../evals/templates/neon-a11y.spec.mjs).

## Why each part sits where it does

In the shipped [README](../../../examples/money-move/README.md).

## Verified

- Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark, at every step.
- A tap on a row advances, back returns to the step before, the warning comes before the details, and Escape closes the sheet.

Not checked: a screen reader pass, widths between 375 and 1440, 200% text.

## Screenshots

Not kept in the repository. Run the browser suite and open `.local/evals/templates/neon/test-results/` (`money-move-<mode>-<width>-<step>.png, one per step and the empty start`):

```bash
npm test --prefix evals/templates -- --target neon neon-a11y.spec.mjs --grep money-move
```

## Review

Composition and interaction approved on 2026-11-28 ("Approve P15 and P16"), from the captures above at 375 and 1440, light and dark. Not approved: typography, color mapping, copy and sample facts, and what the captures did not show (widths between, a screen reader, 200% text). With the approval it may reach the skills ([ADR 0020](../../adr/0020-approved-functional-patterns-reach-skills-and-examples-before-the-gate.md)).

## Used by

- [Money move](../../../skills/neon-audit/references/functional-patterns.md#money-move) in functional patterns links the shipped README.
