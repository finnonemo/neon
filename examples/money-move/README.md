# Money move

An example of pattern P16, moving money as steps inside one sheet, in [MoneyMove.tsx](MoneyMove.tsx): topping up a portfolio, and withdrawing with nothing to withdraw. Use it as a reference for a short sequence of choices that ends in something the user does outside the app, not as a template: its content is synthetic.

## How it runs, and why

| Step | What it holds | Why |
| --- | --- | --- |
| Pick the portfolio | Rows; a tap advances | A single choice needs no Continue button. |
| Pick how to pay | An explanation first, a header naming the right column, then rows with the recommended way first and marked, each with how fast the money arrives | The figure that decides the choice sits on every row. |
| Check before paying | A warning, the one way to avoid the loss, a "don't show again" box and one primary "เข้าใจแล้ว" | It comes before the step where a mistake costs money, not after. |
| Pay | The details to pay to, with copy, then short notes | The user leaves the app to pay; the notes say what happens next. |
| Nothing to withdraw | Why, then the fix as the primary and a way to leave | An empty start never ends in a dead end. |

From the second step a back control sits before the title. The sheet rises from the bottom on narrow and is centred on wide, as the registry's `sheet` does.

## What can vary

The steps follow the task: a withdrawal picks an amount (see the order form) and a bank account; a fund switch picks the fund to switch to. One choice per step, the recommended option first, and a warning before an irreversible step don't vary.

## Verified

See its record, [docs/design/examples/money-move.md](../../docs/design/examples/money-move.md).
