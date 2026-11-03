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

`base-detection.test.mjs` checks that each skill states the rule for the Neon base, CDS and neither. It checks the wording, not how a run behaves. `appBase` in `grade-rebuild.mjs` applies the same markers to an app's manifests and shares the `@neon` entry check with `neonBaseProblems`. `eval-runner.test.mjs` pins it on Neon base, CDS, neither (the v0 fixture's `components.json`, an empty manifest, and a CDS icon package without `@coinbase/cds-web`) and mixed.

## Restyle grader

```sh
node evals/skills/grade-restyle.mjs --source <fixture> --result <case>/<app>
```

The grader reads the source's base. On every base it checks that the base is kept, that `@theme inline` is byte-identical and that `--chart-*` and `--radius` keep their values, and it builds the result. A mixed source fails base kept, to be reported as unresolved.

- **CDS or neither:** only stylesheets change, as before.
- **Neon base:** colors live in role utilities, so app source may change. The grader runs the Neon base check from `grade-rebuild.mjs` on the result. It also requires `package.json`, `components.json`, every other file outside the app's `./src/`, and its `index.css` and `theme/` folder to stay as installed. In changed app files outside the ui folder it flags what the restyle adds: `dark:` classes, the bare `cn`, weight utilities and stock palette utilities. Changed app stylesheets must scope their selectors and leave the theme's custom properties undeclared.

No check reads runtime behavior, so the grader cannot flag the Radix behaviors ADR 0006 accepts. These are Select closing on a pick, the polite toast, and Dialog's `aria-hidden` siblings in place of `aria-modal`. `grade-restyle.test.mjs` passes a Neon-base restyle whose source holds the registry's `select`, `sonner` and `dialog`. Those behaviors themselves are asserted in [`evals/templates/neon-a11y.spec.mjs`](../../templates/neon-a11y.spec.mjs), not here.

### Grader check, 3 November 2026

`scripts/smoke-new-app.mjs` built a Neon-base app from this checkout's registry into `.local/`, with the base's `button`, `tooltip` and `sonner` and an added `dialog`. Its copies were graded against it with the grader at the commit that adds this section:

| Result | Verdict |
| --- | --- |
| `bg-primary text-primary-foreground` on the content pane in `App.tsx` | All eight checks pass, build included |
| Plus a rule appended to the theme's `neon.css` and the v0 fixture's stock `card.tsx` in the ui folder | FAIL: Neon base and items only (`card.tsx` is not a Neon item, uses `font-semibold`); theme and manifests unchanged (`neon.css`) |
| The first result plus `dark:bg-slate-900 font-bold` in `App.tsx` and a stylesheet declaring `:root { --primary: … }` | FAIL: Neon roles in app source (the `dark:` class, `font-bold`); app stylesheets scoped (`:root`, `--primary` redeclared) |

Limits: this checks the grader, not a skill run.

## Skill runs, 3 November 2026

Claude Code 2.1.316 on `claude-opus-5-5`, one sample per arm, run through `run-claude-case.mjs --serve-registry`. Baseline is main at `1fe573f`, revised is `bc5bde1`. check-run found no denied command in any run, and none reached the cap. The 8 runs cost $4.22 together. Fixtures, built in `.local/`:

- `fund-watch`: a smoke-built Neon-base app with the registry's `select`, `dialog` and `sonner`, showing a fund watchlist under a `bg-secondary` header.
- `fund-watch-review`: the same app with planted problems. It has the v0 fixture's stock `card.tsx`, `text-sm` beside `text-body`, and `dark:bg-slate-800` on the list.
- `order-desk`: the assembled CDS starter. Its order list is built from CDS components, and its header is styled by hex colors in `orders.css`.
- `three-apps`: a folder holding all three apps (`fund-watch`, `order-desk` and the [shadcn-v4-app](../fixtures/shadcn-v4-app) fixture), with no root manifest.

Each prompt asked for no dev server; the review and audit prompts also said to edit nothing.

| Request | Baseline | Revised |
| --- | --- | --- |
| `/neon:neon-redesign` header navy, colors only, on `fund-watch` | `bg-primary`, an on-primary title and a button recolored by class; all eight grader checks pass; the base is not named | Same header, with the button set to `variant="secondary"` instead of class overrides; read `neon-base.md`; all eight checks pass |
| `/neon:neon-redesign` header navy, colors only, on `order-desk` | Not run | Only `orders.css` changed, to CDS theme variables; the CDS `Button` that blends into the navy header goes to neon-create rather than being recolored; all five checks pass |
| `/neon:neon-review` of `fund-watch-review` | Finds `text-sm`, the `dark:` class and the card's weights, but treats the card as a layout pattern and never as off-base; no Radix behavior flagged | Names the Neon base from `components.json`; finds the stock card as "not a Neon item", plus `text-sm` and `dark:bg-slate-800`; lists the Select, toast and `aria-hidden` behaviors as not findings; no file edited |
| `/neon:neon-review` of `order-desk` and `shadcn-v4-app` | Not run | Names CDS and neither; CDS fixes use `Text`, `Box`, `Table` and `Tag`, and the shadcn fixes use CSS variables with "no Neon installation needed"; neither base is a finding; no file edited |
| `/neon:neon-audit` of `three-apps` | Neon base and CDS right; sends plain shadcn to neon-create to install the Neon theme and change type and sizes | Read `project-inspection.md`; names each base from its manifests; Neon base and CDS to neon-create, each on its own base; plain shadcn to neon-redesign through its CSS variables, with `@neon/` items only on request; edits nothing |

The revision changed the plain-shadcn audit path and the off-base review finding; the baseline already handled the Neon-base restyle. Gaps outside base detection, all unreported by the runs:

- The CDS restyle scopes dark text to `.dark`, a class the CDS starter does not set.
- The CDS restyle hard-codes one meta color as `rgb(...)`.

Limits:

- One sample per arm, and only one model.
- Synthetic fixtures. `fund-watch`'s `@neon` entry points at the smoke run's local registry, which the revised audit flagged.
- No CDS or neither baseline was run, so those rows show only that the revision behaves as specified, not that it changed anything.
- Nothing was rendered, so contrast and layout claims in the reports are the agents' calculations.
