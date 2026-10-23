# Skill behavior scenarios

Run each request with the named context, first against the baseline and then the revised skill. Record the revision, prompt, supplied files, agent decisions, changed files and actual checks. Use an isolated app for implementation runs. Do not supply the expected answer to a fresh evaluating agent.

| Request/context | Observe |
| --- | --- |
| Add Finnomena approvals to an existing themed React/CDS app; retain providers/routes/services | Reuses installation and shell; builds actual list/detail/actions; navy foundation, indigo selection, labeled statuses |
| Build a colorful Finnomena product landing page | Immersive composition permits prominent brand color/illustration; does not force navy/white dominance; actions remain accessible |
| Create a Finnomena request tracker with mock data | Scaffolds in an empty destination and builds the feature; demo behavior is visible; relevant states exist |
| Change only a Vue header to Finnomena colors | No React/CDS installation, font/layout changes or global theme side effects |
| Review this Finnomena screenshot; do not edit | Visible findings only; keyboard, other viewports and measured contrast remain unverified |
| Make the buttons clearer after Finnomena was established | Retains brand intent without repeated onboarding |
| Build a CDS settings screen with no Finnomena context | Does not infer Finnomena branding from CDS alone |
| Colors-only restyle of a Tailwind v4 app that uses stock utilities only | See [Tailwind colors-only regression](#tailwind-colors-only-regression) |

Verdicts are pass, fail or unverified for routing, scope, resource retrieval, component correctness, color roles, feature completion, responsive behavior and evidence honesty. Link actual artifacts. Do not turn a successful retrieval simulation into a claim that an app was built or looked better.

## September 2026 refactor evidence

Baseline retrieval evaluation found missing canonical guide links, an unconditional installer step despite reuse guidance, global CSS-import risk for partial restyles, and a literal-color example conflicting with token reuse. The remaining immersive overlay required yellow-led branding contrary to the current product brief.

A packaging reproduction reported success while its promised functional guide was absent. Two executable regression tests failed before the packaging fix, then passed: required design resources ship, and missing required payloads reject before writing output.

The revised skills use one shipped product contract, a shorter creation entrypoint with conditional setup references, and scoped CSS integration. Source and packaged resource checks run via `scripts/check-repository.mjs`. The independent follow-up evaluates retrieval and decisions only; no newly generated app or visual preference benchmark is claimed by this refactor.

## Tailwind colors-only regression

Fixture: a Vite/React app whose CSS is only `@import "tailwindcss";`, styled with stock utilities (`slate-*` text and surfaces, pale `-200` status borders, `focus:border-blue-*` inputs, colored category dots). The local batch-sell calculator reference matches. Request, verbatim:

> $neon-redesign Colors only: switch this app's colors to Finnomena colors. Keep the layout, components, spacing and behaviour exactly as they are.

October 2026 baseline (Codex, one sample) built but failed the other items below: it skipped the style migration reference, aliased `--color-slate-*`/`--color-blue-*` in `@theme inline`, mapped `text-slate-300` to `bgLineHeavy` and `border-green-200` to `bgPositive`, collapsed `slate-400/500/600` to `fgMuted`, recolored category dots and tried an `input:focus` palette override that never applies.

Pass requires all of:

- The run reads the Tailwind mapping rules in the style migration reference before editing.
- No stock palette name (`--color-slate-*`, `--color-white`, …) is redefined in `@theme` or `:root`.
- Every changed `text-*` utility resolves to an `fg*` token; `bg*` and `bgLine*` tokens appear only on surfaces and borders.
- Pale borders and washes stay pale (wash/`accentSubtle*` token or the original utility); no saturated status token replaces a `-50`–`-200` shade.
- Focus color, if changed, uses a `focus:` variant at the call site.
- Category dots keep distinct meanings or are reported; geometry, fonts and handlers are unchanged and the build passes.
- Text lighter than `fgMuted` (disabled, inactive icons) stays light; a selected state keeps an indigo signal.
- Brand colors reference adapter variables (`var(--color-bgLinePrimary)`), not hex values copied from `theme/tokens/colors.json` or a worked example.

Revised skill, Codex, same prompt and fixture, one sample per revision. The first revision passed the read, alias, role, pale-shade, focus and build items, but darkened disabled `slate-200/300` text to `fgMuted`, made the selected tab navy-only and collapsed three section dots to navy. After the state and marker rules were added, a second sample passed every item; desktop light-mode screenshots matched the source findings. Limits: two single samples, Codex only, light mode and one desktop width, no handler interaction, and user-level skills outside `CODEX_HOME` were visible to every run.

The same colors-only prompt invoked as `$neon-create` on this fixture and on a Carbon/SCSS app (Codex, one sample each) stayed in scope and built. Both runs wrote literal indigo `#1817e7` where the adapter maps focus to `bgLinePrimary`. The Tailwind run cited style migration Example 4, which then gave literal hex values; the example now uses adapter variables. That revision has not been re-run.

## Flow refactor evaluation

See [the paired evaluation protocol](flow-refactor-protocol.md) for exact prompts, fixture boundaries, measurements and acceptance. Evaluation apps and raw screenshots remain local; only a verified comparison report should claim outcomes.
