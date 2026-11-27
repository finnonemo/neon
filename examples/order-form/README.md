# Order form

An example of pattern P15, buying or selling an amount of one fund, in [OrderForm.tsx](OrderForm.tsx). It extends P4, a form whose summary sits in the Inspector. Use it as a reference for the order of an order form's parts and how it handles too little money, not as a template: its content is synthetic.

## Where each part goes, and why

| Region | Where | Why |
| --- | --- | --- |
| Buy or sell | A segmented control, first | The side changes every part under it, so it is chosen before anything else. |
| Where the money comes from or goes to | A row with what is available and a change action | The amount is judged against it, so it sits above the amount. |
| Baht or units | A small segmented control above the field, selling only | Buying is in baht; selling can be either. |
| Amount | One field, with its minimum as its description and quick amounts under it | Quick amounts are secondary buttons: they fill the field and are never selected states. |
| Summary and total | The Inspector: the one primary first, then label and value rows, then the total, set apart | The total updates as the amount is typed. On narrow the Inspector is a separate view, so the total sits over the primary in a dock fixed to the bottom; the screen shows no tab bar. |
| The primary | Named by the side ("ซื้อกองทุน", "ขายกองทุน") and always enabled | Pressing it with a problem puts the error on the field and focus in it (Core). |
| Too little money | The field's error, and the way to add money beside it | The fix sits where the problem is, and the summary stays filled in. |

## What can vary

The rows of the summary follow the product: a stock order adds a price type and a limit price; a regular plan adds its day. The order (side, source, amount, summary and total, primary) and the error handling don't vary.

## Verified

Axe finds no WCAG 2.2 AA violation at 375 and 1440, in light and dark, empty and in the error state. Pressing the primary with more than is available puts the error on the field, shows the way to add money and moves focus to the field; the primary stays enabled. Composition and interaction approved by the owner on 2026-11-28; typography and color mapping are not.
