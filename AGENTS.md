# Working on Neon

This repository distributes skills, theme assets and a CDS starter. It is not an employee application.

- Read `skills/INSTRUCTION.md` for current visual policy. Use CDS for implementation; functional layouts favor restrained, task-led composition; immersive layouts may be colorful. Preserve the provisional status of token mappings.
- Use the domain terms in `GLOSSARY.md`: install mode is what the installer does, styling tier is a skill's decision.
- Read the relevant skill and its callers before editing. Keep entrypoints concise with fast paths and read conditions; move setup details into reachable conditional references. Audit is optional for unclear integration, not a mandatory gateway.
- Preserve scope: existing apps reuse providers/routes/services; colors-only stays colors-only; composition defaults to preserve and adapts only on explicit request, separately from styling tier; review-only stays read-only. Reuse explicit or established brand intent.
- Treat `theme/tokens/` as raw exports. Generated files are produced by `theme/scripts/`; `color-overrides.ts` and `theme/css/theme.css` are maintained separately. Do not claim they regenerate together. Before naming the CDS components a token change affects, list them with `node scripts/cds-consumers.mjs <token> --app <dir>`.
- Run `node scripts/validate.mjs` (eval tests + repository check) after changing distributed resources or packaging. For behavior changes, add a meaningful regression case. For skill changes, exercise realistic employee requests with `evals/skills/README.md` and record evidence limits.
- App/template/theme changes also need an assembled disposable app build (`node scripts/smoke-new-app.mjs`) and relevant visual/interaction checks. Static reference checks cannot establish UI quality.
- Keep generated apps, screenshots, dependencies and local evaluation artifacts out of the tracked source. Use `.local/` or a temporary directory.
- See `CONTRIBUTING.md` for validation and release preparation. Do not publish merely because packaging succeeded.

## Agent skills

### Issue tracker

GitHub Issues on `finnonemo/neon` via the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five-role vocabulary (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: root `GLOSSARY.md` plus ADRs in docs/adr, created when the first decision is recorded. See `docs/agents/domain.md`.
