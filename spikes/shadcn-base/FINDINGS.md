# Spike: shadcn/ui as Neon's base instead of CDS

Question: Can shadcn/ui + Tailwind v4, themed from Neon's CSS adapter (`theme/css/theme.css`), reproduce the CDS starter's look and layout behavior?

**Verdict:** Yes, at the visual and layout level, for a functional back-office screen. The cost is a short list of known traps rather than unknown risk. Whether to switch is still a product decision, because the migration surface (skills, evals, installer, CDS install mode, glossary) was not exercised.

## What was built

The same approval screen was built twice from shared mock data (`data.ts`): list, search, segmented filter, detail inspector, notes, checkbox and three actions.

- `cds/` is the assembled starter, unchanged apart from the screen.
- `shadcn/` uses the starter shell ported off CDS:
  - shadcn new-york with nine components.
  - `index.css` aliases shadcn's slots to Neon roles. One adapter covers light and dark: `theme.css` is used as-is, and the only addition is `.dark { --primary-foreground: fg }`, which mirrors onColorLabel. `theme.css` still carries the three roles taken from CDS defaults: `--input` = `bgLineHeavy`, and `--ring` sits next to the Coinbase-blue `bgLinePrimarySubtle`. Switching to shadcn moves color-parity candidate 01's "roles from CDS defaults" question into whatever generates `theme.css`; it doesn't remove it.
  - The Neon type scale is exposed as `text-title2`, `text-body`, `text-label1` and so on.

## Measured (Playwright, 1440×900, light and dark)

| Element | CDS | shadcn (tuned) |
|---|---|---|
| h1 / h2 | 22/28, 20/25, weight 400 | identical |
| Buttons | 54px, pill, padding 16/32, 17/22, weight 600 | identical (±1px width) |
| Input | 54px, 17/22, padding 16 | identical |
| Body, row title, description | 17/22, weights 400/500/400 | identical |
| Checkbox | 20px | identical |
| Primary button, enabled | `bgPrimary` with white text, light and dark | identical; dark white text confirms the onColorLabel mirror |
| Secondary / negative colors | Neon roles | identical in both modes |
| List row pitch | about 80px (read off the screenshot; the selector hit an inner element) | 76px |
| Segmented control | not measured (the selector found nothing) | 40px pill track |
| Textarea | 98px, unstyled native | 64px, bordered |
| Tag | 14/20, weight 600, CDS spectrum green rgb(0,127,59); pending tag contrast 7.3 | 14/20, weight 600, `fgWarning`/`fgPositive`/`fgNegative` on a 10% wash; light contrast 2.6 / 3.4 / 4.5 (**fails AA**), dark 4.9 / 8.2 / 4.6 |
| Avatar fallback | Coinbase-blue initial | neutral two-letter initials |

Layout check: sidebar width, pane widths, bottom nav, horizontal overflow and the compact View details / Back focus flow were **identical** at 375, 768, 1024, 1280, 1440 and 1920px.

Bundle size (JS+CSS, uncompressed): CDS 764K, shadcn 340K.

## Traps found (each would need a guard if adopted)

1. **`cn()` drops custom type roles.** shadcn's merge helper treats `text-label1` as a color class. It silently removes it, or lets it override `text-positive`, so the tag rendered at 12px and the textarea at 14px. Fix: `createCn({ extend: { classGroups: { "font-size": [...] } } })` in `lib/utils.ts`. This is invisible without measurement and is exactly what an AI-generated screen would trip over.
2. **Composite type tokens leak weight.** `text-label1` carries weight 600, but a component's own `font-medium` wins, so the badge rendered at weight 500 until it was overridden.
3. **shadcn ships its own dark-mode opinions.** These include `dark:bg-input/30` on inputs, checkbox and tabs, and `dark:bg-destructive/60` on buttons. The first gives dark inputs a tinted fill that CDS doesn't have. The second was removed. Each generated component needs a dark-mode audit against Neon roles.
4. **Disabled styling differs.** CDS computes a disabled color, while shadcn applies `opacity-50`. In dark mode the result reads lighter.
5. **Status text roles aren't tag-safe in light mode.** `fgWarning` rgb(242,100,20) and `fgPositive` rgb(0,150,70) on a light wash score 2.6 and 3.4. CDS avoids this by using darker spectrum shades, which shadcn has no slot for. A shadcn base needs extra roles such as tag foregrounds. That is a token decision, not a component one.
6. **The size defaults need re-tuning in the component files.** Button default/sm, input, textarea and checkbox were changed. `shadcn add` overwrites those edits, so Neon would own the component files the way CDS owns them today.

## Effort

- About 190 lines replaced the CDS provider, theme and shell code: `index.css`, `cn` config, AppRoot, color-scheme context and five layout files.
- The size and color tuning took about 8 class-string edits.
- No CDS layout logic changed. `ResponsivePanes`, `useBreakpointTier`, `layoutPanes` and `breakpoints.config` ported unchanged.

## Not covered (evidence limits)

- One screen and nine components. Overlays, toasts, tables, date pickers and CDS-only components (Cell variants, SegmentedTabs, Calendar) were not tried.
- No accessibility audit beyond the existing focus flow.
- No skill or eval pipeline run. `neon-create`, the CDS install mode and the rebuild/restyle graders all assume CDS.
- I picked the CDS targets myself, so "identical" means identical on the measured properties only.
- Spectrum colors, such as CDS's tag greens, have no shadcn slot. The spike used semantic roles instead, which is a design choice the design owner would need to make.
