---
scenarios:
  - request: "`$neon-redesign` colors-only on a Neon-base app: \"make the page header navy\""
    observe: Names the Neon base; changes only color role utilities in app source; `grade-restyle.mjs` passes base kept, Neon base and items only, and theme and manifests unchanged; no CDS, stock shadcn item or `dark:` class added.
  - request: "`$neon-redesign` colors-only on the CSS-styled header of an app already on CDS"
    observe: Names CDS; changes only the app's stylesheets through CSS tokens; `grade-restyle.mjs` passes base kept and only stylesheets changed; adds no `@neon` entry or Neon item.
  - request: "`$neon-review` of a Neon-base screen with a stock shadcn item, a `dark:` class and `text-sm` beside a type role; do not edit"
    observe: Names the Neon base; findings name the stock item, the `dark:` class and the stock size with Neon fixes; Select closing on a pick, the polite toast and `aria-hidden` siblings are not findings; no file edited.
  - request: "`$neon-review` of a CDS screen and of a plain shadcn screen; do not edit"
    observe: Names each base; CDS fixes use CDS components or props, never a Neon item; neither app gets a finding for being off the Neon base; no file edited.
  - request: "`$neon-audit` how should this app take Finnomena styling? (Neon-base, CDS and plain shadcn apps)"
    observe: "Names each base from its manifests and recommends one path: Neon base to neon-create with `@neon/` items, CDS stays on CDS, plain shadcn to a CSS restyle; never offers CDS to an app not already on it; edits nothing."
---

# Base detection

neon-redesign, neon-review and neon-audit tell the app's [base](../../../skills/neon-audit/references/project-inspection.md#base) from its manifests: an `@neon` registry entry in `components.json` is the Neon base, a `@coinbase/cds-web` dependency is CDS, anything else is neither, plain shadcn included. They apply that base's checks and keep the app on it ([ADR 0006](../../../docs/adr/0006-new-work-on-shadcn-matched-to-cds.md)).

## Regression cases

`base-detection.test.mjs` checks that each skill states the rule for the Neon base, CDS and neither. It checks the wording, not how a run behaves. `appBase` in `grade-rebuild.mjs` is the same rule in code, built from the predicates `neonBaseProblems` uses. `eval-runner.test.mjs` pins it on the four cases: Neon base, CDS, neither (the v0 fixture's `components.json` and an empty manifest) and mixed.

## Restyle grader

```sh
node evals/skills/grade-restyle.mjs --source <fixture> --result <case>/<app>
```

The grader reads the source's base. On every base it checks that the base is kept, that `@theme inline` is byte-identical and that `--chart-*` and `--radius` keep their values, and it builds the result.

- **CDS or neither:** only stylesheets change, as before.
- **Neon base:** colors live in role utilities, so app source may change. The grader runs the Neon base check from `grade-rebuild.mjs` on the result. It also requires `package.json`, `components.json`, every other file outside the app's `./src/`, and its `index.css` and `theme/` folder to stay as installed.

No check reads runtime behavior, so the grader cannot flag the Radix behaviors ADR 0006 accepts. These are Select closing on a pick, the polite toast, and Dialog's `aria-hidden` siblings in place of `aria-modal`. `grade-restyle.test.mjs` passes a Neon-base restyle whose source holds the registry's `select`, `sonner` and `dialog`. Those behaviors themselves are asserted in [`evals/templates/neon-a11y.spec.mjs`](../../templates/neon-a11y.spec.mjs), not here.

### Grader check, 3 November 2026

`scripts/smoke-new-app.mjs` built a Neon-base app from this checkout's registry into `.local/`, with the base's `button`, `tooltip` and `sonner` and an added `dialog`. Its copies were graded against it:

| Result | Verdict |
| --- | --- |
| `bg-primary text-primary-foreground` on the content pane in `App.tsx` | All six checks pass, build included |
| Plus a rule appended to the theme's `neon.css` and the v0 fixture's stock `card.tsx` in the ui folder | FAIL: Neon base and items only (`card.tsx` is not a Neon item, uses `font-semibold`); theme and manifests unchanged (`neon.css`) |

Limits: this checks the grader, not a skill run.
