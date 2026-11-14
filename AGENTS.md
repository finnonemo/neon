# Working on Neon

This repository distributes skills, theme assets, the Neon registry and the frozen CDS starter. It is not an employee application.

- Branch from freshly fetched `origin/main`; the main checkout's local `main` lags it. Before starting work and before each push, `git fetch origin main` and confirm `git log --oneline HEAD..origin/main` is empty.
- Read `skills/INSTRUCTION.md` for current visual policy. New work uses the Neon base, and CDS is frozen for apps already on it ([ADR 0006](docs/adr/0006-new-work-on-shadcn-matched-to-cds.md)). Neon matches Core, not CDS ([ADR 0009](docs/adr/0009-neon-matches-core-not-cds.md)). Functional layouts favor restrained, task-led composition; immersive layouts may be colorful. A color that traces to a Core Theme token is not provisional; keep the word on Immersive Themes, gradient recipes, the color roles `theme/css/core-roles.json` leaves without a token and the frozen CDS theme's color mapping.
- Theme Briefs, presets, or adding an Immersive Theme's briefs: read `docs/design/theme-briefs.md`.
- Use the domain terms in `GLOSSARY.md`: install mode is what the installer does, styling tier is a skill's decision.
- Read the relevant skill and its callers before editing. Keep entrypoints concise with fast paths and read conditions; move setup details into reachable conditional references. Audit is optional for unclear integration, not a mandatory gateway.
- Preserve scope: existing apps reuse providers/routes/services; colors-only stays colors-only; composition defaults to preserve and adapts only on explicit request, separately from styling tier; review-only stays read-only. Reuse explicit or established brand intent.
- Treat `theme/tokens/` as raw exports, except `theme/tokens/theme.json`: the Core sync writes it, and the colors of `theme/css/theme.css`, from the Core snapshot's Theme. Which Core Theme token a color role takes is the Role table, `theme/css/core-roles.json`, maintained by hand. The same sync writes the type sizes and line heights of `theme/css/theme.css` from the snapshot's text styles; which Core text style a type role takes is the Type role table, `theme/css/core-type-roles.json`, maintained by hand and restated in `skills/INSTRUCTION.md`. Generated files are produced by `theme/scripts/`; `color-overrides.ts` and the other values of `theme/css/theme.css` (font family and weight, space, radius) are maintained separately, and `theme/cds/` is frozen. Do not claim they regenerate together. Before naming the components a token change affects, list them: Neon registry items with `node scripts/registry-consumers.mjs <token>`; CDS components with `node scripts/cds-consumers.mjs <token>` (the current app, else the starter; `--app <dir>` for another). Before calling a design color on- or off-token, or a text pair readable, check it with `node scripts/token-lookup.mjs <hex>...` and `node scripts/contrast.mjs <text> <background>...`.
- `core/` is the Core snapshot, read through `core/index.json` and written only by the Core sync ([CONTRIBUTING.md](CONTRIBUTING.md#sync-the-core-snapshot)). A rule or value changes in Core's repository; which Core doc a registry item matches changes in `registry/core-counterparts.json`. The same table lists an item's prop values that have no Core cell (`notInCore`): they keep working and are not chosen for new work.
- Run `node scripts/validate.mjs` (eval tests + repository check) after changing distributed resources or packaging. For behavior changes, add a meaningful regression case. For skill changes, exercise realistic employee requests with `evals/skills/README.md` and record evidence limits.
- Registry, template and theme changes also need a disposable app built from this checkout's registry (`node scripts/smoke-new-app.mjs`), the browser suite before a push (`npm test --prefix evals/templates -- --target neon`), and relevant visual/interaction checks: screenshot a visible change before and after with `node scripts/ui-shots.mjs <url> --select <css>`, and put the two runs side by side in one picture with `node scripts/before-after.mjs <before dir> <after dir>`. Static reference checks cannot establish UI quality.
- Keep generated apps, screenshots, dependencies and local evaluation artifacts out of the tracked source. Use `.local/` or a temporary directory.
- See `CONTRIBUTING.md` for validation and release preparation. Do not publish merely because packaging succeeded.

## Agent skills

### Issue tracker

GitHub Issues on `finnonemo/neon` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` plus ADRs in `docs/adr/`. See `docs/agents/domain.md`.
