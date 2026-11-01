---
scenarios:
  - request: Restyle a v0/Lovable React + Tailwind v4 + shadcn project to Finnomena
    observe: Detects shadcn on v4; edits `:root`/`.dark` by role and pair; leaves `@theme inline`; installs no CDS.
---

# shadcn on Tailwind v4 restyle

Fixture: [fixtures/shadcn-v4-app](../fixtures/shadcn-v4-app), a Vite/React app in current shadcn/ui v4 form: `@import "tailwindcss"`, `@custom-variant dark`, the default neutral `:root`/`.dark` values and `@theme inline` mapping (its radius lines use the older `calc(var(--radius) - 4px)` form), a `components.json`, and the registry's `button`, `input`, `card` and `badge` with `asChild` removed. The page has primary, outline, ghost and destructive buttons, an input, secondary and outline badges on cards, `text-destructive` text, `chart-1`–`chart-5` dots and a toggle that sets `.dark` on `<html>`. Request, verbatim:

> $neon-redesign I built this app with v0. Switch it to Finnomena colors, in light and dark mode. Colors only: keep the layout, components, spacing and behaviour exactly as they are.

Pass requires all of:

- `@theme inline` is byte-identical; no `tailwind.config.*`, CDS package or component edit is added.
- Each changed role changes with its `-foreground`, in `:root` and `.dark`.
- The primary label is at least 4.5:1 in both modes, measured with `.dark` toggled.
- `--ring` resolves to the indigo `bgLinePrimary` in both modes; `--accent` is a neutral surface.
- Secondary badge fills and ghost hovers differ from the card they sit on, in both modes.
- `--chart-*` and `--radius` are unchanged; the build passes.

October 2026, Codex 0.162.1, one sample per revision, run through `run-codex-case.mjs`. Every run read SKILL.md, style migration, verification and INSTRUCTION.md. The evaluator built each result and measured it in headless Chromium, light and `.dark`, at 1024px. The first revision used the adapter's `bgSecondary` for `--secondary`, `--muted` and `--accent` in both modes; the second maps them to `bgTertiary` in dark.

| Item | Before (main at `e1c1d1c`) | First revision | Second revision |
| --- | --- | --- | --- |
| Files changed | `index.css` values plus a new `finnomena-colors.css`: the adapter's color declarations copied under `:root` and `.dark`, referenced as `var(--color-*)` | `index.css` values only, converted to `oklch(...)` with alpha kept | Same as first |
| `@theme inline`, components, `--chart-*`, `--radius` | Unchanged | Unchanged | Unchanged |
| Primary, light / dark | Navy, white label 18.12:1 / `#415160`, white label 8.17:1 | Same | Same |
| Destructive button, light / dark | 5.39:1 / 8.44:1 | Same | Same |
| Focus border, both modes | `rgb(105, 104, 239)` | Same, as `oklch` | Same, as `oklch` |
| Dark secondary badge on its `#1a1a1a` card | `#1a1a1a`, no visible pill | `#1a1a1a`, no visible pill | `#262626` |
| Dark ghost hover | `bgSecondaryWash` at 50%, barely darker than the card | Same value as the card, no visible hover | `bgTertiary` at 50% |
| Reported gaps | None | Input outlines have low contrast | Dark `text-destructive` at 4.02:1 |
| Verdict | Fail: card surfaces | Fail: card surfaces | Pass |

On the original items main already passed: its format sections and the adapter were enough for pairs, the dark primary label, focus, charts and radius on this fixture. The difference is the card-surface item, which both earlier runs failed and the second revision passed, and the value format, which follows the file. Unreported by any run: input outlines measure 1.12:1 (light) and 1.62:1 (dark) against the card, against the stock fixture's 1.26:1 and 1.60:1. Limits: one sample per revision, Codex only, one desktop width, a synthetic fixture rather than a real v0 or Lovable export, no sidebar or chart component rendered, and Codex's own browser checks were unavailable. The second revision's run predates only a rewrap of the format 4 paragraph.

Grading: `node evals/skills/grade-restyle.mjs --source <fixture> --result <case>/shadcn-v4-app` checks the first and last pass items: only stylesheets changed, `@theme inline` byte-identical, `--chart-*` and `--radius` kept, build passes. Add `--shots <name>` to also build the result into `.local/shots/<name>`, then run `node evals/skills/run-probe.mjs <name> --widths 1024 --dark-class`. That run reports badges and other rounded fills that blend into their card as `sameFill`, and controls on dark fills under `lowContrast`. Run again without `--dark-class` for light. Pairs, `--ring`, `--accent` and ghost hovers stay manual. On the three runs above, the grader passed all four checks for each. The dark probe flagged both secondary badges at 1:1 for Before and the first revision, and nothing for the second; no run had low-contrast controls. The stock fixture's light secondary badge reads 1.09:1.
