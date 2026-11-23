# Campaign sections

```yaml
status: partially-reviewed
source_revision: c405672ad559  # the draft that was reviewed; see Review for what changed on shipping
reviewer: Pawish Gawinseth
reviewed_on: 2026-11-24
approved_properties: [composition, interaction-behavior]
viewports: [375, 1440]
```

## Task

Help someone understand an offer and book it, on a Campaign Page. It is pattern P13 of the [pattern register](../pattern-register.md).

## Source

- Screen: [`examples/campaign-sections/CampaignSections.tsx`](../../../examples/campaign-sections/CampaignSections.tsx), built from Neon registry items (`accordion`, `button`, `checkbox`, `field`) and the starter's `ImmersiveLayout`. All content is synthetic. It ships in the plugin beside its [README](../../../examples/campaign-sections/README.md) and four Patterns drawn by the Block engine; the browser suite copies the whole directory into its Neon base app.
- Route: `/?example=campaign-sections`, in the browser suite's Neon base app.
- Checks: `campaign-sections example holds at <width>px` in [`evals/templates/neon-a11y.spec.mjs`](../../../evals/templates/neon-a11y.spec.mjs).
- Pattern ids (Block engine): hero-wide 720×640 `gufub31x-3`, hero-narrow 375×375 `69lhj25s-2`, benefits 560×420 `6qnip7f0-5`, faq 560×420 `6qnip7f0-4`.

## Why the composition fits

In the shipped [README](../../../examples/campaign-sections/README.md): which composition each section takes and why, what expresses Finnomena, and what can vary. This record keeps the review and how to capture it.

## Verified

The shipped README lists what the suite checks, at 375, 768, 1024 and 1440.

Unresolved: at 1440 the Pattern beside the questions is taller than their closed list; at 768 the hero is 1056px tall, so its Pattern passes one screen (the action does not).

## Screenshots

Not kept in the repository. Run the browser suite and open the screenshots it writes to `.local/evals/templates/neon/test-results/` (`campaign-sections-<state>-<width>.png`, `<state>` `start`, `error` with an answer open, or `booked`):

```bash
npm test --prefix evals/templates -- --target neon neon-a11y.spec.mjs --grep campaign-sections
```

## Review

Composition and interaction approved on 2026-11-24 ("อนุมัติทั้งหมด"), from a draft on the Club theme at 375 and 1440 with an open answer, the missing acceptance and the booked state. Not approved: visual values, the Brand Pattern picks, copy and sample facts, the other Immersive Themes, and widths between 375 and 1440.

Changed when it shipped: the component's name and header comment, the Patterns imported from beside the source, and a 480px maximum on each Pattern below the `lg` breakpoint, so up to 987 they no longer fill a wider column. The maximum has no effect at 375 or 1440. The widths it changes were not shown for review.

## Used by

No skill links it yet.
