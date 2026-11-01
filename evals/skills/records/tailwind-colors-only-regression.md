---
scenarios:
  - request: Colors-only restyle of a Tailwind v4 app that uses stock utilities only
    observe: As stated in the record
---

# Tailwind colors-only regression

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

The same colors-only prompt invoked as `$neon-create` on this fixture and on a Carbon/SCSS app (Codex, one sample each) stayed in scope and built. Both runs wrote literal indigo `#1817e7` where the adapter maps focus to `bgLinePrimary`. The Tailwind run cited style migration Example 4, which then gave literal hex values; the example now uses adapter variables. Two later samples (see [CDS rebuild](cds-rebuild.md)) used `var(--color-*)` utilities without `#1817e7`; one imported the adapter, the other copied its `rgb()` declarations into `:root`.
