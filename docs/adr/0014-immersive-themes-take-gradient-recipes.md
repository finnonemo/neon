# Immersive Themes take the Gradient Recipes

> Status: Accepted, 2026-11-15.

[ADR 0005](0005-immersive-pages-start-from-a-guideline-theme.md) gave the Immersive Themes the guideline's misuse rule and so no gradients, and narrowed [ADR 0003](0003-gradients-from-palette-recipes.md)'s Gradient Recipes to Reference-led pages, even though the recipes were drawn from Finnomena's own Club and Port campaign files. In the review round of November 2026 (`evals/review/verdicts.json`, round `2026-11-after-c9554ab`, review-06) the owner overruled that: "immersive ยอมให้ใช้ gradient ได้ด้วย เหมือนเราเคยเขียนเรื่องนี้กันไว้แล้ว" (immersive pages may use gradients too, as we wrote before).

A page on an Immersive Theme may now use the Gradient Recipes of `skills/INSTRUCTION.md` §Gradients, with each stop written as the theme's own `--immersive-*` step of exactly that value, so a theme switch carries the gradient with it. What ADR 0003 set still holds: stops come only from the recipes, never an ad hoc pair of palette steps; text and actions meet contrast against every stop beneath them; gradients stay page-scoped, never in theme files or shared theme variables. The rest of ADR 0005's guideline rules hold too: text only in White or Navy, tints by step rather than opacity, one color family per background block (a Tint fade stays inside one family). Functional screens still use none.

## Considered

- **Keep ADR 0005 as it was**: rejected by the owner's verdict above.
- **Free gradients within a theme's own steps**: rejected for the reason ADR 0003 gives: two steps picked ad hoc carry no on-brand shape and no contrast check.
