# Order form

```yaml
status: partially-reviewed
source_revision: 8d20398
reviewer: Pawish Gawinseth
reviewed_on: 2026-11-28
approved_properties: [composition, interaction-behavior]
viewports: [375, 1440]
```

## Task

Pattern P15 of the [pattern register](../pattern-register.md): buy or sell an amount of one fund.

## Source

- Screen: [`examples/order-form/OrderForm.tsx`](../../../examples/order-form/OrderForm.tsx), built from Neon registry items (button, field, input, segmented-control). All content is synthetic. The browser suite copies this folder into its Neon base app.
- Route: `/?example=order-form` in the browser suite's Neon base app.
- Checks: `order-form example passes axe in <mode>, and shows too little money on the field` in [`evals/templates/neon-a11y.spec.mjs`](../../../evals/templates/neon-a11y.spec.mjs).

## Why each part sits where it does

In the shipped [README](../../../examples/order-form/README.md).

## Verified

- Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark, empty and in the error state.
- Pressing the primary with more than is available puts the error on the field, shows the way to add money and moves focus to the field; the primary stays enabled.

Not checked: a screen reader pass, widths between 375 and 1440, 200% text.

## Screenshots

Not kept in the repository. Run the browser suite and open `.local/evals/templates/neon/test-results/` (`order-form-<mode>-<width>.png (empty) and -error.png (too much money, after pressing the primary)`):

```bash
npm test --prefix evals/templates -- --target neon neon-a11y.spec.mjs --grep order-form
```

## Review

Composition and interaction approved on 2026-11-28 ("Approve P15 and P16"), from the captures above at 375 and 1440, light and dark. Not approved: typography, color mapping, copy and sample facts, and what the captures did not show (widths between, a screen reader, 200% text). With the approval it may reach the skills ([ADR 0020](../../adr/0020-approved-functional-patterns-reach-skills-and-examples-before-the-gate.md)).

## Used by

- [Order form](../../../skills/neon-audit/references/functional-patterns.md#order-form) in functional patterns links the shipped README.
