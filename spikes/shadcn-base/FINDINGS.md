# Spike: shadcn/ui as Neon's base instead of CDS

Question: Can shadcn/ui + Tailwind v4, themed from Neon's CSS adapter (`theme/css/theme.css`), reproduce the CDS starter's look and layout behavior?

**Verdict (round 1):** Yes, at the visual and layout level, for a functional back-office screen. The cost is a short list of known traps rather than unknown risk. Whether to switch is still a product decision, because the migration surface (skills, evals, installer, CDS install mode, glossary) was not exercised.

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

- Round 1 covered one screen and nine components. Round 2 (below) adds overlays, toast, table, select and date picker, but CDS-only components such as Cell variants and SegmentedTabs are still untried.
- No skill or eval pipeline run. `neon-create`, the CDS install mode and the rebuild/restyle graders all assume CDS.
- I picked the CDS targets myself, so "identical" means identical on the measured properties only.
- Spectrum colors, such as CDS's tag greens, have no shadcn slot. The spike used semantic roles instead, which is a design choice the design owner would need to make.

## Round 2: overlays, table, select, date picker, axe, keyboard and focus

The second screen (`?extras`) holds a Select, a DatePicker, a help Tooltip, a five-row Table with a row Dropdown menu, a confirm Dialog and a Saved toast. The same Playwright script (`extras-check.mjs`) ran against three builds: CDS on React 18 (the starter), shadcn on React 18, and a copy of shadcn on React 19.1.1 (`shadcn-r19/`). Axe-core 4.10.2 ran with wcag2a, wcag2aa and wcag21aa in light and dark.

**Verdict (round 2):** The visual and layout verdict still holds, but a shadcn base also means moving the starter to **React 19**. On React 18, the current Radix doesn't return focus to the trigger when a Dialog or menu closes. Every overlay component also needs the same sizing pass the round 1 components got.

| Check | CDS (React 18) | shadcn (React 18) | shadcn (React 19) |
|---|---|---|---|
| Dialog | `aria-modal`, labelled, focus trapped, Escape closes, focus returns to trigger | labelled, trapped, Escape closes; no `aria-modal` (Radix hides siblings with `aria-hidden` instead); **focus goes to `<body>`** | same as React 18, but focus **returns** to trigger |
| Row menu | `menuitem` roles, first item focused, Escape closes (slowly, after more than 300ms), focus returns | roles, first item focused, Escape closes; **focus goes to `<body>`** | focus returns |
| Select (keyboard) | Enter opens 4 options; **stays open after a pick**; Escape closes | closes on pick | closes on pick |
| Date picker | dialog, first day focused, picks `11/15/2026` (US format), closes, focus returns; opener label "Open calendar" is English by default | full run timed out on the opener click; a separate debug run opened it fine. Unresolved. | popover, focus starts on "Go to the Previous Month", picks `15/11/2569` (Thai Buddhist year from `toLocaleDateString`), **stays open after a pick** |
| Toast | `role=alert` | sonner, `aria-live=polite` | same |
| Tooltip | shows on keyboard focus, `aria-describedby` | same | same |
| Table | header 17/22 weight 500 in `fgMuted`; row 72px | header 14/20 weight 500 in `fg`; row 53px (untuned shadcn default) | same |
| axe, extras page | light clean; dark: negative button 4.32 | light clean; dark: negative button 4.32 | same |
| axe, approval page | light clean; dark: negative button 4.32 | **critical** `aria-valid-attr-value`; contrast ×9 (inactive tab 4.05, tags 2.55 and up); dark: negative button 4.32 | same |

Visual differences, read from the screenshots and not tuned: shadcn's Select trigger is 36px against CDS's 54px; the Dialog has a left-aligned title with no dividers, where CDS centres the title between dividers; table rows have dividers and are denser.

### New traps

7. **The starter needs React 19 for focus return.** `radix-ui` ^1.8 on React 18.3 sends focus to `<body>` after a Dialog or DropdownMenu closes, and the React 19.1.1 copy fixed that with no code change. CDS 9.26.1 peers on `^18.0.0 || ~19.1.2`, so the upgrade is possible but it is a starter-wide change.
8. **The segmented filter built from Radix Tabs fails axe (critical).** Tabs without `TabsContent` leave `aria-controls` pointing at nothing. A shadcn base needs a real segmented-control or toggle-group pattern, not Tabs used for its looks.
9. **`shadcn add` fights the tuned setup.**
   - It prompts to overwrite the tuned `button.tsx` (in this run, a bare `add calendar` stopped at that prompt and skipped calendar).
   - Generated files import `cn` from the bare `cn` package, bypassing the type-role config in `lib/utils` (trap 1), so each added file needs its import rewritten.
   - `sonner` assumes `next-themes`, and Tooltip needs a `TooltipProvider` at the root. Neon's AppRoot has to provide both.
10. **Behavior differences that a skill or eval would notice.**
    - The Select closes on pick in shadcn and stays open in CDS.
    - The date picker stays open after a pick in shadcn and closes in CDS.
    - The two use different date formats: shadcn's locale default gives a Thai Buddhist year, CDS gives US `mm/dd/yyyy`.
    - The toast announces politely in shadcn and assertively (`role=alert`) in CDS.

    None of these is wrong on its own, but a rebuild grader that compares against CDS would flag them.

### Shared finding (not shadcn-specific)

White text on `bgNegative` in dark mode measures **4.32**, below AA 4.5, in both CDS and shadcn. This is a Neon token issue, so it belongs to the color-parity work (candidate 01) rather than this spike.

### Round 2 evidence limits

- shadcn on React 18 never got a date-picker result from the full run.
- The CDS menu's Escape close was only confirmed by a slower separate check.
- The overlays were checked for behavior only. They weren't size-tuned the way the round 1 components were, so the visual gap above is untuned shadcn against CDS, not a measured parity attempt.
- Screenshots: `{cds,shadcn,shadcn19}-{extras,select,date,menu,dialog,toast}.png`.
